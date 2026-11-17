/* eslint-disable no-console -- command-line script */
/**
 * Writes the body of the Shopify "Contact" page as pageUpdate variables:
 *   node scripts/shopify/contact.mjs <out-file> <page-gid>
 * then:
 *   shopify store execute --store saqr-q2owwh3g.myshopify.com
 *     --query-file scripts/shopify/pageUpdate.graphql --variable-file <out-file> --allow-mutations
 * Saqr is fictional: addresses are neighbourhoods, e-mails use the reserved
 * .example domain, and the page says so.
 */
import {writeFileSync} from 'node:fs';

const [file, id] = process.argv.slice(2);
if (!file || !id) {
  console.error('Usage: contact.mjs <out-file> <page-gid>');
  process.exit(1);
}

const body = `
<p>Every Saqr is built by hand, to order, by a small team. Write to us and the person who answers will be someone who works in the atelier.</p>

<h2>Write to us</h2>
<ul>
  <li><strong>Orders and configuration.</strong> <a href="mailto:atelier@saqr.example">atelier@saqr.example</a>: choosing a size, a finish, a battery, or following a bike being built.</li>
  <li><strong>Service and spare parts.</strong> <a href="mailto:service@saqr.example">service@saqr.example</a>: maintenance, warranty and parts for any Saqr, whatever its age.</li>
  <li><strong>Press.</strong> <a href="mailto:press@saqr.example">press@saqr.example</a>: images, interviews and test bikes.</li>
</ul>
<p>We answer within two working days, Monday to Friday.</p>

<h2>Showrooms</h2>
<ul>
  <li><strong>Paris</strong> · Le Marais</li>
  <li><strong>London</strong> · Clerkenwell</li>
  <li><strong>Milan</strong> · Brera</li>
  <li><strong>Dubai</strong> · Alserkal Avenue</li>
</ul>
<p>Showrooms open by appointment, Tuesday to Saturday. The easiest way in is a test ride: <a href="/#test-ride">book one here</a>.</p>

<h2>A note on this site</h2>
<p>Saqr is a fictional brand, designed and built as a portfolio piece. The addresses above lead nowhere and no bike will be shipped, but the storefront, the configurator and the checkout run on a real Shopify store.</p>
`;

// Read by the storefront as page.seo.description (the meta description).
const description =
  'Write to the Saqr atelier about orders, service or press, or visit a showroom in Paris, London, Milan or Dubai.';

const page = {
  body: body.trim(),
  metafields: [
    {
      namespace: 'global',
      key: 'description_tag',
      type: 'single_line_text_field',
      value: description,
    },
  ],
};

writeFileSync(file, JSON.stringify({id, page}, null, 2));
console.log(file);
/* eslint-enable no-console */
