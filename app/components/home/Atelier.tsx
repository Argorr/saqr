import {Image} from '@shopify/hydrogen';
import type {HomeImageFragment} from 'storefrontapi.generated';
import {SectionIntro} from './SectionIntro';

/**
 * How an S1 is made: an editorial block with a close-up of the drive.
 * The close-up is the product photo, cropped on the motor.
 */
const FACTS = [
  {
    value: '6',
    unit: 'weeks',
    title: 'Built to order',
    text: 'No warehouse full of bikes. Yours is started the day you order it.',
  },
  {
    value: '1',
    unit: 'mechanic',
    title: 'One pair of hands',
    text: 'A single mechanic assembles your bike from frame to final ride, then signs the frame.',
  },
  {
    value: '140',
    unit: 'checks',
    title: 'Before it leaves',
    text: 'Every bolt torqued by hand, every cable routed inside, every bike ridden before it ships.',
  },
];

export function Atelier({detail}: {detail: HomeImageFragment | null}) {
  return (
    <section
      className="home-section -mx-4 border-t border-line bg-ink-2 py-[clamp(5rem,12vw,9rem)]"
      aria-labelledby="atelier-title"
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-x-20 gap-y-12 px-[clamp(1rem,4vw,3.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <SectionIntro
            id="atelier-title"
            eyebrow="The atelier"
            title="Made by hand, one at a time."
          >
            <p className="!m-0">
              Saqr is a small workshop, and intends to stay one. We would rather
              build fewer bikes and know each of them by name.
            </p>
          </SectionIntro>

          <dl className="!mt-12 !mb-0 grid gap-8 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {FACTS.map((fact) => (
              <div key={fact.title} className="border-t border-line pt-5">
                <dt className="font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none font-bold text-sand tabular-nums">
                  {fact.value}
                  <span className="ms-1.5 text-sm font-semibold text-copper">
                    {fact.unit}
                  </span>
                </dt>
                <dd className="!m-0 mt-3">
                  <span className="block text-sm font-semibold text-sand">
                    {fact.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-sand-muted">
                    {fact.text}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {detail ? (
          <figure className="!m-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink">
              <Image
                data={detail}
                alt="Close-up of the S1 mid-drive motor and crank"
                sizes="1400px"
                loading="lazy"
                className="absolute inset-0 h-full w-full !rounded-none object-cover object-[48%_62%] [transform:scale(1.6)] [transform-origin:48%_62%]"
              />
            </div>
            <figcaption className="mt-3 text-xs tracking-[0.15em] text-sand-muted uppercase">
              85 Nm mid-drive, sealed inside the frame
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
