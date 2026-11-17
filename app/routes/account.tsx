import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {PageHeader} from '~/components/PageHeader';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer.firstName
    ? `Welcome, ${customer.firstName}`
    : 'Your account';

  return (
    <div className="page">
      <PageHeader eyebrow="Account" title={heading} />
      <AccountMenu />
      <Outlet context={{customer}} />
    </div>
  );
}

const ACCOUNT_LINKS = [
  {label: 'Orders', to: '/account/orders'},
  {label: 'Profile', to: '/account/profile'},
  {label: 'Addresses', to: '/account/addresses'},
];

function AccountMenu() {
  return (
    <nav className="account-nav" aria-label="Account">
      {ACCOUNT_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          prefetch="intent"
          className={({isActive, isPending}) =>
            `account-nav-link${isActive ? ' is-active' : ''}${isPending ? ' is-pending' : ''}`
          }
        >
          {link.label}
        </NavLink>
      ))}
      <Form className="account-logout" method="POST" action="/account/logout">
        <button type="submit" className="account-nav-link">
          Sign out
        </button>
      </Form>
    </nav>
  );
}
