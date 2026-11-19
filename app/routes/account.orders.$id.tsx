import {Link, redirect, useLoaderData} from 'react-router';
import {formatDate, formatStatus} from '~/lib/saqr';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {BIKE_PRODUCT_TYPE, buildProgress, lineSerial} from '~/lib/build';
import {BuildTracker} from '~/components/account/BuildTracker';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name ?? ''} | Saqr`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus =
    order.fulfillments.nodes[0]?.status ?? order.fulfillmentStatus;

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  // Bike orders get a build tracker instead of Shopify's status page link.
  const progress = buildProgress(order);
  const bikes = lineItems
    .filter((line) => line.productType === BIKE_PRODUCT_TYPE)
    .map((line) => ({title: line.title, serial: lineSerial(line)}));

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
    progress,
    bikes,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
    progress,
    bikes,
  } = useLoaderData<typeof loader>();
  const hasDiscount = Boolean(
    (discountValue && Number(discountValue.amount)) || discountPercentage,
  );

  return (
    <section className="account-section">
      <Link to="/account/orders" className="page-back">
        <span aria-hidden="true">←</span> All orders
      </Link>
      <h2 className="account-section-title">Order {order.name}</h2>
      <p className="order-meta">
        Placed on {formatDate(order.processedAt)}
        {order.confirmationNumber ? (
          <> · Confirmation {order.confirmationNumber}</>
        ) : null}
        {order.cancelledAt ? (
          <> · Cancelled</>
        ) : progress ? null : fulfillmentStatus ? (
          <> · {formatStatus(fulfillmentStatus)}</>
        ) : null}
      </p>

      {progress ? <BuildTracker progress={progress} bikes={bikes} /> : null}

      <table className="order-table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Price</th>
            <th scope="col">Qty</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((lineItem) => (
            <OrderLineRow key={lineItem.id} lineItem={lineItem} />
          ))}
        </tbody>
        <tfoot>
          {hasDiscount ? (
            <tr>
              <th scope="row" colSpan={3}>
                Discount
              </th>
              <td>
                {discountPercentage ? (
                  <span>−{discountPercentage}%</span>
                ) : (
                  discountValue && <Money data={discountValue} />
                )}
              </td>
            </tr>
          ) : null}
          <tr>
            <th scope="row" colSpan={3}>
              Subtotal
            </th>
            <td>
              <Money data={order.subtotal!} />
            </td>
          </tr>
          {order.shippingLine ? (
            <tr>
              <th scope="row" colSpan={3}>
                Delivery · {order.shippingLine.title}
              </th>
              <td>
                {Number(order.totalShipping.amount) === 0 ? (
                  'Free'
                ) : (
                  <Money data={order.totalShipping} />
                )}
              </td>
            </tr>
          ) : null}
          <tr>
            <th scope="row" colSpan={3}>
              Tax
            </th>
            <td>
              <Money data={order.totalTax!} />
            </td>
          </tr>
          <tr className="order-table-total">
            <th scope="row" colSpan={3}>
              Total
            </th>
            <td>
              <Money data={order.totalPrice!} />
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="order-details">
        <div>
          <h3 className="order-details-title">Delivery address</h3>
          {order.shippingAddress ? (
            <address>
              {order.shippingAddress.formatted?.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          ) : (
            <p>No delivery address.</p>
          )}
        </div>
        {/* Accessory-only orders have no build: Shopify's page tracks the parcel. */}
        {progress || order.cancelledAt ? null : (
          <a
            className="button button-ghost"
            target="_blank"
            href={order.statusPageUrl}
            rel="noreferrer"
          >
            Track delivery <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </section>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  const lineTotal = {
    amount: String(
      Number(lineItem.price!.amount) * lineItem.quantity -
        Number(lineItem.totalDiscount?.amount ?? 0),
    ),
    currencyCode: lineItem.price!.currencyCode,
  };

  return (
    <tr>
      <td>
        <div className="order-line">
          {lineItem.image ? (
            <Image
              className="order-line-image"
              data={lineItem.image}
              width={64}
              height={64}
            />
          ) : null}
          <div>
            <p className="order-line-title">{lineItem.title}</p>
            {lineItem.variantTitle ? (
              <p className="order-line-variant">{lineItem.variantTitle}</p>
            ) : null}
            {lineSerial(lineItem) ? (
              <p className="order-line-serial">{lineSerial(lineItem)}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price!} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineTotal} />
      </td>
    </tr>
  );
}
