import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PageHeader} from '~/components/PageHeader';
import {formatDate, journalTopic} from '~/lib/saqr';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.blog.title ?? 'Journal'} | Saqr`}];
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;

  return (
    <div className="page">
      <PageHeader eyebrow="Journal" title={blog.title} />
      {articles.nodes.length ? (
        <PaginatedResourceSection<ArticleItemFragment>
          connection={articles}
          resourcesClassName="journal"
          ariaLabel={`${blog.title} articles`}
        >
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              featured={index === 0 && !articles.pageInfo.hasPreviousPage}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      ) : (
        <p className="page-empty">
          No stories yet. The first ones are on their way.
        </p>
      )}
    </div>
  );
}

/**
 * The newest story opens the journal with a full-width photo; the others
 * follow as rows. Photos keep their own 16:9 frame and are never cropped.
 */
function ArticleItem({
  article,
  featured,
  loading,
}: {
  article: ArticleItemFragment;
  featured?: boolean;
  loading?: HTMLImageElement['loading'];
}) {
  const url = `/blogs/${article.blog.handle}/${article.handle}`;
  const topic = journalTopic(article.tags);

  return (
    <article className={featured ? 'journal-feature' : 'journal-row'}>
      <Link
        className="journal-media"
        prefetch="intent"
        to={url}
        tabIndex={-1}
        aria-hidden="true"
      >
        {article.image ? (
          <Image
            alt=""
            data={article.image}
            loading={loading}
            sizes={
              featured
                ? '(min-width: 1280px) 1200px, 100vw'
                : '(min-width: 48em) 45vw, 100vw'
            }
          />
        ) : null}
      </Link>
      <div className="journal-text">
        <div className="journal-heading">
          {topic ? <p className="page-eyebrow">{topic}</p> : null}
          <h2 className="journal-title">
            <Link prefetch="intent" to={url}>
              {article.title}
            </Link>
          </h2>
        </div>
        <div className="journal-body">
          {article.excerpt ? (
            <p className="journal-excerpt">{article.excerpt}</p>
          ) : null}
          <p className="journal-meta">
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            {article.author?.name ? <> · {article.author.name}</> : null}
          </p>
          <Link className="account-link" prefetch="intent" to={url}>
            Read the story <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        sortKey: PUBLISHED_AT,
        reverse: true,
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    excerpt
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    tags
    title
    blog {
      handle
    }
  }
` as const;
