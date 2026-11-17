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
          <Image
            alt={image.altText || product.title}
            className="hover-zoom"
            aspectRatio="1/1"
            crop="center"
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 400px, (min-width: 40em) 50vw, 100vw"
          />
        ) : null}
      </div>
      <div className="product-card-body">
        <h2 className="product-card-title">{product.title}</h2>
        <p className="product-card-price">
          {fromPrice ? 'From ' : null}
          <Money as="span" data={minVariantPrice} withoutTrailingZeros />
        </p>
      </div>
    </Link>
  );
}
