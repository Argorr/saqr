import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {SERIAL_ATTRIBUTE} from '~/lib/saqr';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  const closeAside = () => {
    if (layout === 'aside') close();
  };
  // "Copper · M · 540 Wh": the values speak for themselves. A lone option
  // keeps its name ("Size M"), or a bare "M" would mean nothing.
  const shownOptions = selectedOptions.filter(
    (option) => option.value !== 'Default Title',
  );
  const options =
    shownOptions.length === 1
      ? `${shownOptions[0].name} ${shownOptions[0].value}`
      : shownOptions.map((option) => option.value).join(' · ');
  // The Shaheen serial number chosen in the configurator.
  const serial = line.attributes?.find(
    (attribute) => attribute.key === SERIAL_ATTRIBUTE,
  )?.value;

  return (
    <li className="cart-line">
      <div className="cart-line-inner">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={closeAside}
          className="cart-line-media"
          tabIndex={-1}
          aria-hidden="true"
        >
          {image && (
            <Image
              alt=""
              aspectRatio="1/1"
              data={image}
              height={120}
              loading="lazy"
              width={120}
              className="cart-line-image"
            />
          )}
        </Link>

        <div className="cart-line-body">
          <div className="cart-line-head">
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={closeAside}
              className="cart-line-title"
            >
              {product.title}
            </Link>
            {/* Optimistic lines have no cost yet: show the variant price
                meanwhile, so the price does not pop in a moment later. */}
            <div className="cart-line-price">
              <ProductPrice
                price={
                  line.cost?.totalAmount ?? {
                    amount: String(
                      Number(merchandise.price.amount) * (line.quantity || 1),
                    ),
                    currencyCode: merchandise.price.currencyCode,
                  }
                }
              />
            </div>
          </div>
          {options ? (
            <p className="cart-line-options">
              <span className="sr-only">{title}: </span>
              {options}
            </p>
          ) : null}
          {serial ? <p className="cart-line-serial">{serial}</p> : null}
          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));
  // A numbered Shaheen is one bike: its line can't go above 1.
  const numbered = line.attributes?.some(
    (attribute) => attribute.key === SERIAL_ATTRIBUTE,
  );

  return (
    <div className="cart-line-quantity">
      {/* One numbered bike, one line: no stepper to show. */}
      {numbered && quantity === 1 ? null : (
        <div className="qty-stepper" role="group" aria-label="Quantity">
          <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
            <button
              className="qty-button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || !!isOptimistic}
              name="decrease-quantity"
              value={prevQuantity}
            >
              <span aria-hidden="true">&#8722;</span>
            </button>
          </CartLineUpdateButton>
          <span className="qty-value" aria-live="polite">
            <span className="sr-only">Quantity </span>
            {quantity}
          </span>
          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              className="qty-button"
              aria-label="Increase quantity"
              name="increase-quantity"
              value={nextQuantity}
              disabled={!!isOptimistic || numbered}
            >
              <span aria-hidden="true">&#43;</span>
            </button>
          </CartLineUpdateButton>
        </div>
      )}
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className="cart-line-remove" disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
