import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {
  BIKE_CHAPTERS,
  BUILD_TIME,
  FINISHES,
  LIMITED_TAG,
  SERIES_SIZE,
} from '~/lib/saqr';
import {useCardTransition} from '~/lib/transitions';

/**
 * One bike of the collection, as an editorial chapter rather than a card:
 * the whole photo (never cropped) melting into the page, a chapter number,
 * the name, a line of copy, its three key figures and the way in.
 */
export function BikeChapter({
  product,
  index,
  loading,
}: {
  product: ProductItemFragment;
  index: number;
  loading?: 'eager' | 'lazy';
}) {
  const to = `/products/${product.handle}`;
  const transition = useCardTransition(to, product.handle);
  const chapter = BIKE_CHAPTERS[product.handle];
  const limited = product.tags.includes(LIMITED_TAG);
  const image = product.featuredImage;
  const {minVariantPrice, maxVariantPrice} = product.priceRange;
  const fromPrice =
    Number(maxVariantPrice.amount) > Number(minVariantPrice.amount);
  const finishes =
    product.options
      .find((option) => option.name === 'Finish')
      ?.optionValues.map((value) => value.name) ?? [];

  return (
    <article className="bike-chapter" aria-labelledby={`bike-${product.id}`}>
      <Link
        to={to}
        prefetch="intent"
        viewTransition
        className="bike-chapter-media"
        style={transition}
        tabIndex={-1}
        aria-hidden="true"
      >
        {image ? (
          <Image
            data={image}
            alt=""
            sizes="(min-width: 90em) 1280px, 100vw"
            loading={loading}
          />
        ) : null}
      </Link>

      <div className="bike-chapter-body">
        <p className="bike-chapter-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </p>

        <div>
          <p className="bike-chapter-eyebrow">
            {limited
              ? `Limited edition · ${SERIES_SIZE} numbered bikes`
              : `Built to order · ${BUILD_TIME}`}
          </p>
          <h2 id={`bike-${product.id}`} className="bike-chapter-title">
            <Link to={to} prefetch="intent" viewTransition>
              {product.title}
            </Link>
          </h2>
          {chapter ? (
            <p className="bike-chapter-tagline">{chapter.tagline}</p>
          ) : null}
          <p className="bike-chapter-finishes">
            {finishes.length ? (
              <>
                <span className="flex gap-2" aria-hidden="true">
                  {finishes.map((name) => (
                    <span
                      key={name}
                      className="bike-chapter-swatch"
                      style={{background: FINISHES[name]?.swatch ?? '#888'}}
                    />
                  ))}
                </span>
                {finishes.join(' · ')}
              </>
            ) : (
              chapter?.finish
            )}
          </p>
        </div>

        <div className="bike-chapter-aside">
          {chapter ? (
            <dl className="bike-chapter-specs">
              {chapter.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="bike-chapter-price">
            {fromPrice ? <span>From</span> : null}
            <Money as="span" data={minVariantPrice} withoutTrailingZeros />
          </p>
          <Link
            to={to}
            prefetch="intent"
            viewTransition
            className="bike-chapter-cta"
          >
            {limited ? 'Reserve a number' : 'Configure yours'}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
