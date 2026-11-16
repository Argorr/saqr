import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeAccessoryFragment} from 'storefrontapi.generated';
import {SectionIntro} from './SectionIntro';

/** The accessories collection, from Shopify. */
export function Accessories({products}: {products: HomeAccessoryFragment[]}) {
  if (!products.length) return null;
  return (
    <section
      id="accessories"
      className="home-section -mx-4 border-t border-line py-[clamp(5rem,12vw,9rem)]"
      aria-labelledby="accessories-title"
    >
      <div className="mx-auto max-w-[1280px] px-[clamp(1rem,4vw,3.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionIntro
            id="accessories-title"
            eyebrow="Accessories"
            title="Finished like the bike."
          />
          <Link
            to="/collections/accessories"
            prefetch="intent"
            className="text-sm font-semibold tracking-wide text-sand underline-offset-8 hover:underline"
          >
            All accessories <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="!mt-[clamp(2.5rem,6vw,4rem)] !mb-0 grid list-none gap-6 !p-0 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                to={`/products/${product.handle}`}
                prefetch="intent"
                className="group block hover:no-underline"
              >
                <div className="aspect-square overflow-hidden rounded-sm bg-ink">
                  {product.featuredImage ? (
                    <Image
                      data={product.featuredImage}
                      alt={product.featuredImage.altText || product.title}
                      aspectRatio="1/1"
                      sizes="(min-width: 64em) 400px, (min-width: 40em) 50vw, 100vw"
                      loading="lazy"
                      className="h-full w-full !rounded-none object-cover [backface-visibility:hidden] transition-transform duration-700 will-change-transform ease-[var(--ease-dive)] group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="!m-0 text-base font-semibold text-sand">
                    {product.title}
                  </h3>
                  <span className="text-sm text-sand-muted tabular-nums">
                    <Money
                      as="span"
                      data={product.priceRange.minVariantPrice}
                      withoutTrailingZeros
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
