/**
 * Saqr-specific copy and settings that Shopify does not hold: swatch colours,
 * rider sizes, battery range and the bike specs. Keys match the option values
 * set up in the Saqr store (scripts/shopify/products.mjs).
 */

export const FINISHES: Record<string, {swatch: string; text: string}> = {
  Graphite: {
    swatch: '#3a3b3f',
    text: 'Matte graphite with copper lines. The colour of the city after dark.',
  },
  Sand: {
    swatch: '#c8b79a',
    text: 'Warm desert stone in a satin finish, named after the falcon’s plumage.',
  },
  Copper: {
    swatch: '#b4693e',
    text: 'Brushed, anodised copper with graphite lines. Made to be noticed.',
  },
};

/** Rider height (cm) for each frame size, smallest first. Neighbours overlap. */
export const SIZE_RANGES: Record<string, [number, number]> = {
  S: [155, 170],
  M: [168, 183],
  L: [181, 196],
};

/** "168–183 cm" */
export function sizeRange(size: string) {
  const range = SIZE_RANGES[size];
  return range ? `${range[0]}–${range[1]} cm` : null;
}

/** The frame sizes that fit a rider of this height (two in an overlap). */
export function sizesForHeight(height: number) {
  return Object.entries(SIZE_RANGES)
    .filter(([, [min, max]]) => height >= min && height <= max)
    .map(([size]) => size);
}

export const BATTERIES: Record<string, {range: string; text: string}> = {
  '540 Wh': {
    range: 'Up to 120 km',
    text: 'A week of commuting on one charge.',
  },
  '720 Wh': {
    range: 'Up to 160 km',
    text: 'For long rides out of town, or charging once a fortnight.',
  },
};

export const BIKE_SPECS = [
  {label: 'Motor', value: '85 Nm mid-drive, 250 W'},
  {label: 'Battery', value: 'Integrated, removable with the key'},
  {label: 'Frame', value: 'Hydroformed 6061 aluminium'},
  {label: 'Weight', value: '18.9 kg complete'},
  {label: 'Gears', value: '10-speed, internal cable routing'},
  {label: 'Brakes', value: 'Hydraulic discs, 180 / 160 mm'},
];

/**
 * Copy for the bikes collection: one editorial chapter per bike, with the
 * three figures that matter most for it.
 */
export const BIKE_CHAPTERS: Record<
  string,
  {tagline: string; finish?: string; specs: {label: string; value: string}[]}
> = {
  'saqr-s1': {
    tagline:
      'One unbroken line from the bar to the drop-outs. Three finishes, two batteries, built by hand to your size.',
    specs: [
      {label: 'Range', value: '160 km'},
      {label: 'Motor', value: '85 Nm'},
      {label: 'Weight', value: '18.9 kg'},
    ],
  },
  'saqr-s1-shaheen': {
    tagline:
      'Gloss black and brushed copper, a hand-stitched saddle and your number on the head tube. Ninety-nine, then never again.',
    finish: 'Gloss black and brushed copper',
    specs: [
      {label: 'Series', value: '99 bikes'},
      {label: 'Battery', value: '720 Wh'},
      {label: 'Range', value: '160 km'},
    ],
  },
};

/** Products tagged `bike` are built to order and get the accessory add-ons. */
export const BIKE_TAG = 'bike';
export const LIMITED_TAG = 'limited-edition';
export const BUILD_TIME = 'six weeks';

/**
 * The S1 Shaheen is a numbered series. Buyers choose their number; it is sent
 * with the cart line as an attribute and engraved on the head tube.
 * Saqr is fictional: the numbers already reserved are a fixed list, so the
 * page renders the same on the server and in the browser.
 */
export const SERIES_SIZE = 99;
export const SERIAL_ATTRIBUTE = 'Serial number';
export const RESERVED_SERIALS = new Set([
  1, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17, 19, 21, 25, 29, 30, 32, 36, 37, 38, 39,
  41, 42, 43, 45, 47, 48, 52, 53, 54, 55, 56, 57, 59, 61, 65, 66, 70, 72, 73,
  74, 76, 78, 79, 82, 84, 85, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 99,
]);

/** "No. 07 / 99" */
export function formatSerial(n: number) {
  return `No. ${String(n).padStart(2, '0')} / ${SERIES_SIZE}`;
}

/** Days from order to delivery at home, matching BUILD_TIME. */
export const BUILD_DAYS = 42;

/** ISO date a bike ordered at `from` is expected at home. */
export function readyDate(from = Date.now()) {
  return new Date(from + BUILD_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

/** "30 December" */
export function formatDayMonth(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}

/**
 * What every bike comes with, listed under the reserve button. With the
 * expected date (computed on the server), the first promise names it.
 */
export function bikePromise(readyBy?: string | null) {
  return [
    readyBy
      ? `Built by hand to your configuration. Order today, at home around ${formatDayMonth(readyBy)}`
      : `Built by hand to your configuration, ready in ${BUILD_TIME}`,
    'Delivered and fitted to you at home by an atelier technician',
    'Lifetime frame warranty and a first service at three months',
  ];
}

/**
 * Site navigation. Saqr sells two bikes, so the menu is curated here rather
 * than read from the Shopify menus. Hash links point at homepage sections.
 */
export const NAV_LINKS = [
  {label: 'S1', to: '/products/saqr-s1'},
  {label: 'Shaheen', to: '/products/saqr-s1-shaheen'},
  {label: 'Atelier', to: '/#atelier'},
  {label: 'Accessories', to: '/#accessories'},
  {label: 'Journal', to: '/blogs/journal'},
];

/** Fallback meta descriptions, for pages Shopify leaves without one. */
export const SITE_DESCRIPTION =
  'Saqr builds electric bikes for the city by hand, to order, in small numbers.';
export const JOURNAL_DESCRIPTION =
  'Stories from the Saqr atelier: how the S1 is engineered, tested and built to last.';

export const TEST_RIDE_LINK = {label: 'Book a test ride', to: '/#test-ride'};

/** Dates for the journal and orders, e.g. "17 November 2026". */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

/** Shopify enum statuses for display: "PARTIALLY_PAID" → "Partially paid". */
export function formatStatus(status?: string | null) {
  if (!status) return '';
  const words = status.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Journal topics shown above each story, in order of priority. Shopify
 * returns tags alphabetically, so the first tag is not the topic.
 */
const JOURNAL_TOPICS: Record<string, string> = {
  technology: 'Technology',
  engineering: 'Engineering',
  sustainability: 'Sustainability',
  brand: 'Brand',
};

export function journalTopic(tags: string[]) {
  const key = Object.keys(JOURNAL_TOPICS).find((t) => tags.includes(t));
  return key ? JOURNAL_TOPICS[key] : null;
}

/**
 * Atelier section photo, stored in Shopify Files (not tied to a product).
 * Source: design/products/atelier-drive.jpg, prompt in PROMPTS.md (7 B2),
 * upscaled 2x with Upscayl.
 */
export const ATELIER_PHOTO = {
  url: 'https://cdn.shopify.com/s/files/1/0973/7093/1466/files/atelier-drive-v2.jpg?v=1794908739',
  width: 1856,
  height: 2304,
  altText:
    'A mechanic’s hands tightening the crank bolt of a copper Saqr S1 with a torque wrench',
};
