import {useViewTransitionState} from 'react-router';

/**
 * Page transitions: a product photo flies from its card to the product page.
 * Links opt in with `viewTransition`; the card photo and the product stage
 * share one view-transition-name. Browsers without the View Transitions API
 * simply change page.
 */
export function productTransitionName(handle: string) {
  return `product-${handle}`;
}

/**
 * Style for a card photo. The name is only set while this card's own link is
 * transitioning, so it stays unique on pages that list many products.
 */
export function useCardTransition(
  to: string,
  handle: string,
): React.CSSProperties | undefined {
  const active = useViewTransitionState(to);
  return active
    ? {viewTransitionName: productTransitionName(handle)}
    : undefined;
}
