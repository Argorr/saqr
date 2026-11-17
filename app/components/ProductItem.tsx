import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useCardTransition} from '~/lib/transitions';

/** Product card for the collection grids, styled like the homepage accessories. */
export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const transition = useCardTransition(variantUrl, product.handle);
  const image = product.featuredImage;
  const {minVariantPrice, maxVariantPrice} = product.priceRange;
  const fromPrice =
    Number(maxVariantPrice.amount) > Number(minVariantPrice.amount);
  return (
    <Link
      className="product-card"
      prefetch="intent"
      to={variantUrl}
      viewTransition
    >
      <div className="product-card-media hover-zoom-frame" style={transition}>
        {image ? (
          // Never cropped: a bike (43:24) sits whole in the square frame,
          // on the same black as its photo.
          <Image
            alt={image.altText || product.title}
            className="hover-zoom"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 400px, (min-width: 40em) 50vw, 100vw"
          />
        ) : null}
      </div>
      <div className="product-card-body">
        <div className="min-w-0">
          <h2 className="product-card-title">{product.title}</h2>
          {'description' in product && product.description ? (
            <p className="product-card-line">
              {firstSentence(product.description)}
            </p>
          ) : null}
        </div>
        <p className="product-card-price">
          {fromPrice ? 'From ' : null}
          <Money as="span" data={minVariantPrice} withoutTrailingZeros />
        </p>
      </div>
    </Link>
  );
}

/** The opening sentence of a product description, for the card. */
function firstSentence(text: string) {
  const match = /^.*?[.!?](\s|$)/.exec(text);
  return (match ? match[0] : text).trim();
}
