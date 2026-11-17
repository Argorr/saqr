import {useId, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeS1Fragment} from 'storefrontapi.generated';
import {FINISHES} from '~/lib/saqr';
import {SectionIntro} from './SectionIntro';

/**
 * The three S1 finishes, with live product data from Shopify.
 *
 * Each finish has its own photo (shot from the same angle), stacked and
 * cross-faded, so switching feels like the bike itself changes colour.
 * Swatches are a radio group: arrow keys move between them.
 */

export function FinishSelector({product}: {product: HomeS1Fragment}) {
  const finishes = useMemo(() => {
    const byName = new Map<
      string,
      {
        name: string;
        image: NonNullable<
          HomeS1Fragment['variants']['nodes'][number]['image']
        >;
        price: HomeS1Fragment['variants']['nodes'][number]['price'];
        /** Every option of the cheapest variant: Shopify needs the full set. */
        query: string;
      }
    >();
    for (const variant of product.variants.nodes) {
      const finish = variant.selectedOptions.find((o) => o.name === 'Finish');
      if (!finish || !variant.image) continue;
      const current = byName.get(finish.value);
      if (
        !current ||
        Number(variant.price.amount) < Number(current.price.amount)
      ) {
        byName.set(finish.value, {
          name: finish.value,
          image: variant.image,
          price: variant.price,
          query: new URLSearchParams(
            variant.selectedOptions.map((o) => [o.name, o.value]),
          ).toString(),
        });
      }
    }
    return [...byName.values()];
  }, [product]);

  const [active, setActive] = useState(0);
  const groupLabel = useId();
  const current = finishes[active];
  if (!current) return null;

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + finishes.length) % finishes.length;
    setActive(next);
    const radios =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]',
      );
    radios?.item(next)?.focus();
  }

  return (
    <section
      className="home-section -mx-4 py-[clamp(5rem,12vw,9rem)]"
      aria-labelledby="finishes-title"
    >
      <div className="mx-auto max-w-[1280px] px-[clamp(1rem,4vw,3.5rem)]">
        <SectionIntro
          id="finishes-title"
          eyebrow="Three finishes"
          title="Choose your colour."
        />

        <div className="mt-[clamp(2.5rem,6vw,4.5rem)] grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* The finish photos are 43:24 (1376 x 768); the frame matches so none is cropped. */}
          <div className="relative aspect-[43/24] overflow-hidden rounded-sm bg-ink">
            {finishes.map((finish, i) => (
              <Image
                key={finish.name}
                data={finish.image}
                alt={finish.image.altText || `Saqr S1 in ${finish.name}`}
                sizes="(min-width: 64em) 60vw, 100vw"
                loading="lazy"
                aria-hidden={i !== active}
                className={`absolute inset-0 h-full w-full !rounded-none object-cover transition-opacity duration-700 ease-[var(--ease-dive)] ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>

          <div>
            <p
              id={groupLabel}
              className="!m-0 text-xs tracking-[0.2em] text-sand-muted uppercase"
            >
              Finish
            </p>
            <div
              role="radiogroup"
              aria-labelledby={groupLabel}
              className="mt-4 flex gap-4"
            >
              {finishes.map((finish, i) => (
                <button
                  key={finish.name}
                  type="button"
                  role="radio"
                  aria-checked={i === active}
                  aria-label={finish.name}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={onKeyDown}
                  className={`grid size-12 place-items-center rounded-full border transition-colors duration-300 ${
                    i === active
                      ? 'border-copper'
                      : 'border-line hover:border-sand-muted'
                  }`}
                >
                  <span
                    className="size-8 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
                    style={{background: FINISHES[finish.name]?.swatch}}
                  />
                </button>
              ))}
            </div>

            <h3
              className="!mt-8 !mb-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-bold text-sand uppercase"
              aria-live="polite"
            >
              {current.name}
            </h3>
            <p className="!m-0 max-w-[36ch] text-[1.0625rem] leading-relaxed text-sand/80">
              {FINISHES[current.name]?.text}
            </p>
            <p className="!mt-6 !mb-0 text-sm text-sand-muted">
              From{' '}
              <span className="font-display text-xl font-semibold text-sand">
                <Money as="span" data={current.price} withoutTrailingZeros />
              </span>
            </p>

            <Link
              to={`/products/${product.handle}?${current.query}`}
              prefetch="intent"
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-copper px-7 text-sm font-semibold tracking-wide text-ink relative fade-hover [--hover-bg:var(--color-copper-strong)] hover:no-underline"
            >
              Configure your S1
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
