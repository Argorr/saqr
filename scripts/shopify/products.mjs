/* eslint-disable no-console -- command-line script */
/**
 * Writes the Saqr catalogue as productSet variables, one JSON file per product:
 *   node scripts/shopify/products.mjs <out-dir>
 * then, for each file:
 *   shopify store execute --store saqr-q2owwh3g.myshopify.com
 *     --query-file scripts/shopify/productSet.graphql --variable-file <file> --allow-mutations
 * The location id below belongs to the Saqr dev store.
 */
import {writeFileSync} from 'node:fs';
const dir = process.argv[2];
const LOC = 'gid://shopify/Location/110679884042';
const base = {vendor: 'Saqr', status: 'ACTIVE'};

// --- Saqr S1
const finishes = [['Graphite', 0, 'GRA'], ['Sand', 0, 'SND'], ['Copper', 400, 'CPR']];
const sizes = ['S', 'M', 'L'];
const batteries = [['540 Wh', 0, '540'], ['720 Wh', 600, '720']];
const s1Variants = [];
for (const [f, fp, fc] of finishes)
  for (const sz of sizes)
    for (const [b, bp, bc] of batteries)
      s1Variants.push({
        optionValues: [
          {optionName: 'Finish', name: f},
          {optionName: 'Size', name: sz},
          {optionName: 'Battery', name: b},
        ],
        price: String(8900 + fp + bp),
        inventoryPolicy: 'CONTINUE',
        inventoryItem: {sku: `S1-${fc}-${sz}-${bc}`, tracked: false},
      });
const s1 = {
  ...base,
  title: 'Saqr S1',
  handle: 'saqr-s1',
  productType: 'E-bike',
  tags: ['bike', 's1'],
  descriptionHtml:
    '<p>The Saqr S1 is an urban e-bike drawn as one unbroken line. A silent 85 Nm mid-drive motor sits low at the cranks, the battery disappears inside the hydroformed down tube, and every cable runs inside the frame.</p><p>Each S1 is assembled by hand and built to order in six weeks.</p>',
  productOptions: [
    {name: 'Finish', values: finishes.map(([n]) => ({name: n}))},
    {name: 'Size', values: sizes.map((n) => ({name: n}))},
    {name: 'Battery', values: batteries.map(([n]) => ({name: n}))},
  ],
  variants: s1Variants,
};

// --- Saqr S1 Shaheen (limited, 99 units)
const shaheen = {
  ...base,
  title: 'Saqr S1 Shaheen',
  handle: 'saqr-s1-shaheen',
  productType: 'E-bike',
  tags: ['bike', 'limited-edition'],
  descriptionHtml:
    '<p>Ninety-nine numbered bikes in black and brushed copper, named after the shaheen falcon. The S1 Shaheen carries the long-range 720 Wh battery, a hand-stitched leather saddle and its number engraved on the head tube.</p><p>Once the series is gone, it will not be made again.</p>',
  productOptions: [{name: 'Size', values: sizes.map((n) => ({name: n}))}],
  variants: sizes.map((sz) => ({
    optionValues: [{optionName: 'Size', name: sz}],
    price: '12900',
    inventoryPolicy: 'DENY',
    inventoryItem: {sku: `S1SH-${sz}`, tracked: true},
    inventoryQuantities: [{locationId: LOC, name: 'available', quantity: 33}],
  })),
};

// --- Accessories (single variant)
const accessory = (title, handle, price, sku, qty, text) => ({
  ...base,
  title,
  handle,
  productType: 'Accessory',
  tags: ['accessory'],
  descriptionHtml: `<p>${text}</p>`,
  productOptions: [{name: 'Title', values: [{name: 'Default Title'}]}],
  variants: [
    {
      optionValues: [{optionName: 'Title', name: 'Default Title'}],
      price: String(price),
      inventoryPolicy: 'DENY',
      inventoryItem: {sku, tracked: true},
      inventoryQuantities: [{locationId: LOC, name: 'available', quantity: qty}],
    },
  ],
});
const products = {
  s1,
  shaheen,
  lock: accessory('Saqr Lock', 'saqr-lock', 290, 'ACC-LOCK', 40,
    'A hardened steel frame lock that sits flush under the top tube. One key for the lock and the battery, so nothing extra rides in your pocket.'),
  pannier: accessory('Leather Pannier', 'leather-pannier', 390, 'ACC-PANNIER', 25,
    'Full-grain vegetable-tanned leather, copper hardware and a quick-release mount. Fits a 14-inch laptop and ages with you.'),
  charger: accessory('Rapid Charger', 'rapid-charger', 240, 'ACC-CHARGER', 40,
    'A 4 A charger that takes the battery to 80 % in about two hours. Compact enough to leave at the office.'),
};
for (const [k, v] of Object.entries(products))
  writeFileSync(`${dir}/${k}.json`, JSON.stringify({input: v}, null, 2));
console.log(Object.keys(products).join(' '), s1Variants.length, 'S1 variants');
/* eslint-enable no-console */
