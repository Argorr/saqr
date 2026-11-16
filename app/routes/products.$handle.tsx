import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductConfigurator} from '~/components/product/ProductConfigurator';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {BIKE_SPECS, BIKE_TAG} from '~/lib/saqr';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? 'Product'} | Saqr`},
    {
      name: 'description',
      content: data?.product.seo.description ?? data?.product.description ?? '',
    },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}, {addons}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Accessories offered as add-ons on bikes, fetched in parallel.
    storefront.query(PRODUCT_ADDONS_QUERY, {cache: storefront.CacheShort()}),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const isBike = product.tags.includes(BIKE_TAG);
  return {
    product,
    isBike,
    addons: isBike ? (addons?.products.nodes ?? []) : [],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product, isBike, addons} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  return (
    <div className="product-page -mx-4 px-[clamp(1rem,3vw,2.5rem)] pt-6 pb-[clamp(4rem,10vw,8rem)]">
      <ProductConfigurator
        product={product}
        productOptions={productOptions}
        selectedVariant={selectedVariant}
        addons={addons}
        isBike={isBike}
      />

      <section
        aria-labelledby="product-details"
        className="mx-auto mt-[clamp(4rem,10vw,7rem)] grid max-w-[1440px] gap-x-16 gap-y-10 border-t border-line pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div>
          <h2
            id="product-details"
            className="!mt-0 !mb-6 text-xs font-semibold tracking-[0.3em] text-copper uppercase"
          >
            Details
          </h2>
          <div
            className="product-description max-w-[56ch] text-[1.0625rem] leading-relaxed text-sand/80"
            dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
          />
        </div>
        {isBike ? (
          <dl className="!m-0 grid content-start sm:grid-cols-2 sm:gap-x-10">
            {BIKE_SPECS.map((spec) => (
              <div key={spec.label} className="border-b border-line py-4">
                <dt className="text-xs tracking-[0.15em] text-sand-muted uppercase">
                  {spec.label}
                </dt>
                <dd className="!m-0 mt-1 text-sand">{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    tags
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_ADDONS_QUERY = `#graphql
  fragment ProductAddon on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    selectedOrFirstAvailableVariant {
      ...ProductVariant
    }
  }
  query ProductAddons($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    addons: collection(handle: "accessories") {
      products(first: 6) {
        nodes {
          ...ProductAddon
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
