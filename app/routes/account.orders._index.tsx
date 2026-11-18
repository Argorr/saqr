import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {formatDate, formatStatus} from '~/lib/saqr';
import {buildProgress} from '~/lib/build';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
  /** Build stage label per bike order id, computed on the server. */
  stages: Record<string, string>;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders | Saqr'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  const stages: Record<string, string> = {};
  for (const order of data.customer.orders.nodes) {
    const progress = buildProgress(order);
    if (progress) stages[order.id] = progress.current.label;
  }

  return {customer: data.customer, filters, stages};
}

export default function Orders() {
  const {customer, filters, stages} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <section className="account-section">
      <h2 className="account-section-title">Orders</h2>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} stages={stages} />
    </section>
  );
}

function OrdersTable({
  orders,
  filters,
  stages,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
  stages: Record<string, string>;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection
          connection={orders}
          resourcesClassName="order-list"
        >
          {({node: order}) => (
            <OrderItem key={order.id} order={order} stage={stages[order.id]} />
          )}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="page-empty">
      {hasFilters ? (
        <>
          <p>No orders match your search.</p>
          <Link className="account-link" to="/account/orders">
            Clear the search <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <>
          <p>You haven’t placed an order yet.</p>
          <Link className="account-link" to="/products/saqr-s1">
            Configure your S1 <span aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="order-search-form"
      aria-label="Search orders"
    >
      <fieldset className="order-search-fieldset">
        <legend className="sr-only">Find an order</legend>
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.NAME}
          placeholder="Order number"
          aria-label="Order number"
          defaultValue={currentFilters.name || ''}
          className="order-search-input"
        />
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
          placeholder="Confirmation number"
          aria-label="Confirmation number"
          defaultValue={currentFilters.confirmationNumber || ''}
          className="order-search-input"
        />
        <div className="order-search-buttons">
          <button type="submit" className="button" disabled={isSearching}>
            {isSearching ? 'Searching…' : 'Find'}
          </button>
          {hasFilters && (
            <button
              className="button button-ghost"
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              Clear
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function OrderItem({order, stage}: {order: OrderItemFragment; stage?: string}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <Link className="order-row" to={`/account/orders/${btoa(order.id)}`}>
      <span className="order-row-number">Order #{order.number}</span>
      <time className="order-row-date" dateTime={order.processedAt}>
        {formatDate(order.processedAt)}
      </time>
      <span className="order-row-status">
        {order.cancelledAt
          ? 'Cancelled'
          : (stage ?? formatStatus(fulfillmentStatus ?? order.financialStatus))}
      </span>
      <Money className="order-row-total" data={order.totalPrice} />
    </Link>
  );
}
