import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeShaheenFragment} from 'storefrontapi.generated';
import {SERIES_SIZE} from '~/lib/saqr';
import {useCardTransition} from '~/lib/transitions';

/**
 * The S1 Shaheen, a numbered series of 99. The bikes left are counted from
 * live Shopify inventory when the storefront token may read it; otherwise
 * (quantityAvailable is null) only the series size shows.
 */
export function LimitedEdition({product}: {product: HomeShaheenFragment}) {
  const image = product.featuredImage;
  const to = `/products/${product.handle}`;
  const transition = useCardTransition(to, product.handle);
  const stockKnown = product.variants.nodes.every(
    (variant) => typeof variant.quantityAvailable === 'number',
  );
  const left = product.variants.nodes.reduce(
    (sum, variant) => sum + Math.max(variant.quantityAvailable ?? 0, 0),
    0,
  );
  const soldOut = !product.availableForSale;

  return (
    <section
      className="home-section relative -mx-4 overflow-hidden border-t border-line py-[clamp(5rem,12vw,9rem)]"
      aria-labelledby="shaheen-title"
    >
      {/* A low copper glow behind the bike. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,rgb(226_118_58/0.14),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1280px] px-[clamp(1rem,4vw,3.5rem)]">
        <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="!mt-0 mb-4 text-xs font-semibold tracking-[0.3em] text-copper uppercase">
              Limited edition · {SERIES_SIZE} numbered bikes
            </p>
            <h2
              id="shaheen-title"
              className="!m-0 font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.92] font-bold tracking-[-0.03em] text-sand uppercase"
            >
              S1 Shaheen
            </h2>
          </div>
          <p className="!m-0 max-w-[40ch] text-[1.0625rem] leading-relaxed text-sand/80 lg:pb-2">
            Gloss black and brushed copper, a hand-stitched leather saddle and
            the long-range battery. Each one carries its number on the head
            tube. Once the series is gone, it will not be made again.
          </p>
        </div>

        {image ? (
          <div
            className="relative mt-[clamp(2rem,5vw,3.5rem)] aspect-[16/9]"
            style={transition}
          >
            <Image
              data={image}
              alt={image.altText || product.title}
              sizes="(min-width: 80em) 1200px, 100vw"
              loading="lazy"
              className="h-full w-full !rounded-none object-cover"
            />
            {/* Melts the photo's black edges into the page. */}
            <div
              className="pointer-events-none absolute -inset-px bg-[linear-gradient(to_right,var(--color-ink),transparent_10%,transparent_90%,var(--color-ink)),linear-gradient(to_top,var(--color-ink),transparent_12%)]"
              aria-hidden="true"
            />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-t border-line pt-8">
          <dl className="!m-0 flex flex-wrap gap-x-12 gap-y-4">
            <div>
              <dt className="text-xs tracking-[0.15em] text-sand-muted uppercase">
                Price
              </dt>
              <dd className="!m-0 mt-1 font-display text-2xl font-semibold text-sand">
                <Money
                  as="span"
                  data={product.priceRange.minVariantPrice}
                  withoutTrailingZeros
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.15em] text-sand-muted uppercase">
                {stockKnown ? 'Remaining' : 'Series'}
              </dt>
              <dd className="!m-0 mt-1 font-display text-2xl font-semibold text-sand tabular-nums">
                {soldOut ? (
                  'Sold out'
                ) : !stockKnown ? (
                  `${SERIES_SIZE} bikes`
                ) : (
                  <>
                    {left}
                    <span className="text-base text-sand-muted">
                      {' '}
                      / {SERIES_SIZE}
                    </span>
                  </>
                )}
              </dd>
            </div>
          </dl>
          <Link
            to={to}
            prefetch="intent"
            viewTransition
            className="inline-flex min-h-12 items-center gap-3 rounded-full border border-sand/40 px-7 text-sm font-semibold tracking-wide text-sand transition-colors duration-300 hover:border-sand hover:bg-sand/10 hover:no-underline"
          >
            {soldOut ? 'See the Shaheen' : 'Reserve a number'}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
