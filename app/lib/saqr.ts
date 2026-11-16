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

/** Rider height for each frame size. */
export const SIZES: Record<string, string> = {
  S: '155–170 cm',
  M: '168–183 cm',
  L: '181–196 cm',
};

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

/** Products tagged `bike` are built to order and get the accessory add-ons. */
export const BIKE_TAG = 'bike';
export const LIMITED_TAG = 'limited-edition';
export const BUILD_TIME = 'six weeks';

/**
 * Site navigation. Saqr sells two bikes, so the menu is curated here rather
 * than read from the Shopify menus. Hash links point at homepage sections.
 */
export const NAV_LINKS = [
  {label: 'S1', to: '/products/saqr-s1'},
  {label: 'Shaheen', to: '/products/saqr-s1-shaheen'},
  {label: 'Atelier', to: '/#atelier'},
  {label: 'Accessories', to: '/#accessories'},
];

export const TEST_RIDE_LINK = {label: 'Book a test ride', to: '/#test-ride'};
