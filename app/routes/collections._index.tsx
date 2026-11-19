import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageHeader} from '~/components/PageHeader';

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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export const meta: Route.MetaFunction = () => [{title: 'Collections | Saqr'}];

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="page">
      <PageHeader eyebrow="Saqr" title="Collections" />
      <PaginatedResourceSection<CollectionFragment>
        connection={collections}
        resourcesClassName="collection-grid"
        ariaLabel="Collections"
      >
        {({node: collection, index}) =>
          // Shopify's default 'Home page' collection is not a real range.
          collection.handle === 'frontpage' ? null : (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
            />
          )
        }
      </PaginatedResourceSection>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  const image =
    collection.image ?? collection.products.nodes[0]?.featuredImage ?? null;

  return (
    <Link
      className="collection-card"
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {image ? (
        // The wrapper bleeds to the card's edges: Image sets its own
        // inline width (100%), so it can't do it itself.
        <div className="collection-card-media">
          <Image
            alt=""
            aspectRatio="16/9"
            data={image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 45em) 600px, 100vw"
          />
        </div>
      ) : null}
      <h2 className="collection-card-title">{collection.title}</h2>
      <span className="collection-card-link">
        View the collection <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    # Shown when the collection has no image of its own.
    products(first: 1) {
      nodes {
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
