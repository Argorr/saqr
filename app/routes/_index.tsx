import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {HeroVideo} from '~/components/HeroVideo';
import {BikeAnatomy} from '~/components/BikeAnatomy';
import {TurntableVideo} from '~/components/TurntableVideo';
import {FinishSelector} from '~/components/home/FinishSelector';
import {Atelier} from '~/components/home/Atelier';
import {LimitedEdition} from '~/components/home/LimitedEdition';
import {Accessories} from '~/components/home/Accessories';
import {Press} from '~/components/home/Press';
import {TestRide, testRideAction} from '~/components/home/TestRide';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Saqr | Hand-built electric bikes for the city'},
    {
      name: 'description',
      content:
        'Saqr S1: a quiet, hand-built electric bike drawn as one unbroken line. Three finishes, a limited series of 99, private test rides.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const {s1, shaheen, accessories} = await context.storefront.query(
    HOME_QUERY,
    {cache: context.storefront.CacheShort()},
  );
  // The copper photo makes the warmest close-up for the atelier section.
  const detail =
    s1?.variants.nodes.find((variant) =>
      variant.selectedOptions.some(
        (o) => o.name === 'Finish' && o.value === 'Copper',
      ),
    )?.image ?? null;

  return {
    s1,
    shaheen,
    detail,
    accessories: accessories?.products.nodes ?? [],
  };
}

export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get('intent') === 'test-ride') return testRideAction(form);
  throw new Response('Unknown form', {status: 400});
}

export default function Homepage() {
  const {s1, shaheen, detail, accessories} = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <HeroVideo />
      <BikeAnatomy />
      <TurntableVideo />
      {s1 ? <FinishSelector product={s1} /> : null}
      <Atelier detail={detail} />
      {shaheen ? <LimitedEdition product={shaheen} /> : null}
      <Accessories products={accessories} />
      <Press />
      <TestRide />
    </div>
  );
}

const HOME_QUERY = `#graphql
  fragment HomeImage on Image {
    id
    url
    altText
    width
    height
  }
  fragment HomeS1 on Product {
    id
    handle
    variants(first: 50) {
      nodes {
        id
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        image {
          ...HomeImage
        }
      }
    }
  }
  fragment HomeShaheen on Product {
    id
    handle
    title
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      ...HomeImage
    }
    variants(first: 10) {
      nodes {
        id
        quantityAvailable
      }
    }
  }
  fragment HomeAccessory on Product {
    id
    handle
    title
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      ...HomeImage
    }
  }
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    s1: product(handle: "saqr-s1") {
      ...HomeS1
    }
    shaheen: product(handle: "saqr-s1-shaheen") {
      ...HomeShaheen
    }
    accessories: collection(handle: "accessories") {
      products(first: 6) {
        nodes {
          ...HomeAccessory
        }
      }
    }
  }
` as const;
