/* eslint-disable no-console -- command-line script */
/**
 * Writes the Saqr journal articles as articleCreate variables, one JSON file each:
 *   node scripts/shopify/articles.mjs <out-dir> <blog-gid> <image-url-1> <image-url-2> <image-url-3>
 * then, for each file:
 *   shopify store execute --store saqr-q2owwh3g.myshopify.com
 *     --query-file scripts/shopify/articleCreate.graphql --variable-file <file> --allow-mutations
 * Images reuse the product photos already on the Shopify CDN.
 */
import {writeFileSync} from 'node:fs';

const [dir, blogId, ...images] = process.argv.slice(2);
if (!dir || !blogId || images.length < 3) {
  console.error('Usage: articles.mjs <out-dir> <blog-gid> <img1> <img2> <img3>');
  process.exit(1);
}

const author = {name: 'The Saqr atelier'};

const articles = [
  {
    handle: 'engineered-to-disappear',
    title: 'Engineered to disappear',
    publishDate: '2026-10-28T09:00:00Z',
    tags: ['technology', 's1'],
    imageAlt: 'Saqr S1 in copper, side view',
    summary:
      '<p>The best technology on a bike is the kind you stop noticing. How the S1 hides a motor, a battery and every cable inside one line.</p>',
    body: `
<p>Most e-bikes look like a bicycle with a motor bolted on. The S1 started from the opposite brief: a bike that reads as one unbroken line, where the technology is there the moment you need it and invisible the rest of the time.</p>

<h2>A motor you feel, not hear</h2>
<p>The S1 is driven by an 85 Nm mid-drive motor sitting low at the cranks, where it keeps the centre of gravity close to the ground. Because it works through the gears rather than the rear hub, it pulls as cleanly on a steep cobbled street as on a flat boulevard. A torque sensor reads your pedal stroke hundreds of times a second, so assistance rises with your effort instead of arriving in jolts. In town, it is quieter than the tyres on the tarmac.</p>

<h2>The battery is part of the frame</h2>
<p>The down tube is hydroformed from 6061 aluminium: the tube is shaped by fluid pressure inside a mould, which lets us vary its section along its length. It is wide and stiff where the battery sits, slim where it does not need to be. The battery, 540 Wh or 720 Wh, slides inside and locks with the same key as the Saqr Lock. Take it out to charge at your desk, or leave it in and plug the bike in at home.</p>

<h2>Nothing on the outside that does not need to be</h2>
<ul>
  <li><strong>Internal routing.</strong> Brake hoses, gear cable and motor wiring run inside the frame, from the bar to the drop-outs.</li>
  <li><strong>Ten gears, one shifter.</strong> A wide-range 10-speed drivetrain covers city hills without a front derailleur.</li>
  <li><strong>Hydraulic discs.</strong> 180 mm at the front, 160 mm at the rear: progressive in the wet, strong enough for a fully loaded pannier.</li>
  <li><strong>18.9 kg complete.</strong> Light enough to carry up a flight of stairs, which matters more in a city than any spec sheet admits.</li>
</ul>

<h2>Why it matters</h2>
<p>Every part we hide is a part that is protected from rain, road salt and careless parking. Clean lines are not only an aesthetic choice: they are a bike that stays quiet, dry and adjusted for longer. That is the kind of finesse we care about.</p>
`,
  },
  {
    handle: 'ten-thousand-kilometres-in-the-lab',
    title: '10,000 kilometres in the lab',
    publishDate: '2026-11-06T09:00:00Z',
    tags: ['engineering', 'study'],
    imageAlt: 'Saqr S1 in graphite',
    summary:
      '<p>Before the first S1 left the atelier, three pre-series bikes rode the equivalent of ten thousand kilometres on our test benches. What we measured, and what we changed.</p>',
    body: `
<p>A city bike lives a harder life than its looks suggest: kerbs, potholes, rain, a battery charged every other night. Before we built the first customer S1, we wanted to know how it would age. Three pre-series bikes went through a test programme designed to compress several years of commuting into a few months.</p>

<h2>How we tested</h2>
<ul>
  <li><strong>Frame fatigue.</strong> 100,000 alternating pedalling loads on the bottom bracket, followed by 50,000 impacts on the front wheel, simulating kerbs and cobbles.</li>
  <li><strong>Battery ageing.</strong> 500 full charge and discharge cycles at 20 °C, then 100 more at 5 °C and 35 °C, the temperatures of a winter commute and a summer afternoon.</li>
  <li><strong>Real-world range.</strong> A fixed 18 km urban loop with stops every 400 m, ridden by three riders of different weights in each assistance mode.</li>
  <li><strong>Weather.</strong> Two hours of spray at every bearing, connector and seal, followed by a salt-fog cycle for the frame finish.</li>
</ul>

<h2>What we found</h2>
<p>None of the three frames showed a crack or measurable deformation after the fatigue programme. After 500 cycles, the batteries kept 92% of their original capacity on average; the cold cycles cost a further 2%, which is in line with what the cells are rated for. On the urban loop, the 540 Wh battery covered between 95 and 120 km in the middle assistance mode, the 720 Wh between 125 and 160 km. Those are the figures we now publish, rather than the flat-road numbers the industry likes to quote.</p>

<h2>What we changed</h2>
<p>The study was not only there to reassure us. The water test showed moisture reaching the charging port after long exposure, so the port now has a double-lip seal and a drain channel. The impact test loosened one of the motor mounting bolts on the second bike: every S1 now uses thread-locked bolts tightened to a recorded torque, checked again at the first service.</p>

<h2>What comes next</h2>
<p>The three test bikes are still running. We will publish their numbers again at 20,000 kilometres, including the parts we had to replace along the way.</p>
`,
  },
  {
    handle: 'few-of-them-made-well',
    title: 'Few of them, made well',
    publishDate: '2026-11-14T09:00:00Z',
    tags: ['brand', 'sustainability'],
    imageAlt: 'Saqr S1 in sand',
    summary:
      '<p>Saqr makes two bikes, builds them to order and wants them on the road for decades. Why we think a smaller range is the most sustainable thing a bike brand can offer.</p>',
    body: `
<p>Saqr is named after the falcon: precise, patient, built for one thing and very good at it. We wanted the brand to work the same way. We make two bikes, a handful of accessories, and nothing we would not ride ourselves.</p>

<h2>Built to order, never to stock</h2>
<p>Every S1 is assembled by hand once it has been ordered, in about six weeks. That means no warehouse of unsold bikes, no end-of-season discounting, and no frames sent to be scrapped when the colours change. The Shaheen edition goes further: ninety-nine bikes, numbered, and never made again.</p>

<h2>A bike for decades, not seasons</h2>
<p>The most sustainable bike is the one you do not have to replace. We design the S1 to be repaired rather than renewed:</p>
<ul>
  <li><strong>Standard parts where it counts.</strong> Chain, cassette, brake pads and tyres are standard sizes any good workshop can fit.</li>
  <li><strong>A battery that can be rebuilt.</strong> When the cells wear out, we replace the cells, not the whole pack, and recover the casing and electronics.</li>
  <li><strong>Spare parts for ten years.</strong> We keep every part of the S1 available for at least a decade after the last bike is built.</li>
  <li><strong>A frame you can keep.</strong> The aluminium frame carries a lifetime warranty for the first owner, and it is fully recyclable at the end of its life.</li>
</ul>

<h2>Cars, not bikes, are the competition</h2>
<p>An e-bike only does good when it replaces a car journey. That is why the S1 is designed around the commute, with real range figures, a removable battery for flats without a garage, and the panniers to do the weekly shop. Our own estimate puts the footprint of building an S1 below that of a few months of driving the same daily distance; after that, every kilometre ridden instead of driven is a saving.</p>

<h2>What we will not do</h2>
<p>We will not launch a new model every year, chase trends with limited colours that date in a season, or make a bike that cannot be opened. Few of them, made well, ridden for a long time: that is the whole idea.</p>
`,
  },
];

articles.forEach((a, i) => {
  const article = {
    blogId,
    title: a.title,
    handle: a.handle,
    author,
    body: a.body.trim(),
    summary: a.summary,
    tags: a.tags,
    isPublished: true,
    publishDate: a.publishDate,
    image: {url: images[i], altText: a.imageAlt},
  };
  const file = `${dir}/article-${i + 1}.json`;
  writeFileSync(file, JSON.stringify({article}, null, 2));
  console.log(file);
});
