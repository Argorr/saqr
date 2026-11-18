import {SERIAL_ATTRIBUTE} from '~/lib/saqr';

/**
 * Build tracker for bike orders (account order pages).
 *
 * Saqr is a fictional brand, so nothing is really being built: the stages
 * advance with the age of the order, over the six weeks the site promises.
 * Computed on the server (loader) so the server and browser agree on "now".
 */

export const BIKE_PRODUCT_TYPE = 'E-bike';

/** Fictional atelier mechanics; one is assigned per order, always the same. */
const MECHANICS = ['Karim', 'Léa', 'Tomás', 'Ines', 'Yusuf', 'Marta'];

const DAY = 24 * 60 * 60 * 1000;

const STAGES = [
  {key: 'ordered', label: 'Ordered', day: 0},
  {key: 'atelier', label: 'In the atelier', day: 3},
  {key: 'checks', label: 'Final checks', day: 35},
  {key: 'delivered', label: 'Delivered and fitted', day: 42},
] as const;

export type BuildStage = {
  key: (typeof STAGES)[number]['key'];
  label: string;
  /** ISO date the stage starts (or started). */
  date: string;
  state: 'done' | 'current' | 'upcoming';
};

export type BuildProgress = {
  stages: BuildStage[];
  current: BuildStage;
  mechanic: string;
  /** What is happening now, one sentence. */
  summary: string;
  /** ISO date of delivery, expected or done. */
  deliveryDate: string;
  delivered: boolean;
};

type OrderLike = {
  id: string;
  processedAt: string;
  cancelledAt?: string | null;
  fulfillmentStatus?: string | null;
  lineItems: {nodes: Array<{productType?: string | null}>};
};

export function hasBike(order: OrderLike) {
  return order.lineItems.nodes.some(
    (line) => line.productType === BIKE_PRODUCT_TYPE,
  );
}

function mechanicFor(orderId: string) {
  let hash = 0;
  for (const char of orderId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return MECHANICS[hash % MECHANICS.length];
}

/** Null for orders without a bike, and for cancelled orders. */
export function buildProgress(
  order: OrderLike,
  now = Date.now(),
): BuildProgress | null {
  if (!hasBike(order) || order.cancelledAt) return null;

  const start = new Date(order.processedAt).getTime();
  const fulfilled = order.fulfillmentStatus === 'FULFILLED';
  const elapsedDays = (now - start) / DAY;
  const currentIndex = fulfilled
    ? STAGES.length - 1
    : STAGES.reduce(
        (index, stage, i) => (elapsedDays >= stage.day ? i : index),
        0,
      );
  const delivered = fulfilled || currentIndex === STAGES.length - 1;

  const stages: BuildStage[] = STAGES.map((stage, i) => ({
    key: stage.key,
    label: stage.label,
    date: new Date(start + stage.day * DAY).toISOString(),
    state:
      i < currentIndex || (delivered && i === currentIndex)
        ? 'done'
        : i === currentIndex
          ? 'current'
          : 'upcoming',
  }));
  const current = stages[currentIndex];
  const mechanic = mechanicFor(order.id);

  const summaries: Record<BuildStage['key'], string> = {
    ordered: `Your order is confirmed. ${mechanic} will start your bike in the next few days.`,
    atelier: `${mechanic} is building your bike by hand, from bare frame to first ride.`,
    checks: `${mechanic} is running the 140 final checks and will sign the frame before it leaves.`,
    delivered: `Your bike has been delivered and fitted to you by an atelier technician.`,
  };

  return {
    stages,
    current,
    mechanic,
    summary: summaries[current.key],
    deliveryDate: stages[stages.length - 1].date,
    delivered,
  };
}

/** The Shaheen serial number of a line, e.g. "No. 81 / 99", if any. */
export function lineSerial(line: {
  customAttributes?: Array<{key: string; value?: string | null}> | null;
}) {
  return (
    line.customAttributes?.find((a) => a.key === SERIAL_ATTRIBUTE)?.value ??
    null
  );
}
