import {useEffect, useRef, useState} from 'react';

/**
 * Scroll storytelling: "anatomy" of the bike in three chapters.
 *
 * A line drawing of the bike stays pinned while the chapters scroll past.
 * The chapter crossing the middle of the viewport lights its part of the
 * drawing in copper. Without JavaScript every chapter still reads in order
 * and the drawing shows all parts.
 */
type Part = 'motor' | 'battery' | 'frame';

const CHAPTERS: {
  part: Part;
  index: string;
  title: string;
  body: string;
  stats: {value: string; unit: string; label: string}[];
}[] = [
  {
    part: 'motor',
    index: '01',
    title: 'Silent torque',
    body: 'A mid-drive motor sits low at the cranks, where your own power goes in. It answers the pedal in a fraction of a turn and pulls away from the lights without a sound.',
    stats: [
      {value: '85', unit: 'Nm', label: 'peak torque'},
      {value: '250', unit: 'W', label: 'rated power'},
    ],
  },
  {
    part: 'battery',
    index: '02',
    title: 'Range you cannot see',
    body: 'The battery lives inside the down tube, so the bike keeps one clean silhouette. It locks in with a key and slides out to charge at your desk.',
    stats: [
      {value: '540', unit: 'Wh', label: 'capacity'},
      {value: '120', unit: 'km', label: 'range, eco mode'},
    ],
  },
  {
    part: 'frame',
    index: '03',
    title: 'One unbroken line',
    body: 'Hydroformed aluminium, cables routed inside, lights built into the frame. Nothing hangs off it, nothing rattles, and it still carries up a flight of stairs.',
    stats: [
      {value: '18.9', unit: 'kg', label: 'complete bike'},
      {value: '6061', unit: '', label: 'aluminium alloy'},
    ],
  },
];

export function BikeAnatomy() {
  const [active, setActive] = useState<Part | null>(null);
  // `armed` only turns on after hydration, so without JavaScript the drawing is never hidden.
  const [armed, setArmed] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  // Light the part of the chapter that crosses the middle band of the viewport.
  useEffect(() => {
    const chapters = chapterRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const part = (entry.target as HTMLElement).dataset.part as Part;
          setActive(part);
        }
      },
      {rootMargin: '-45% 0px -45% 0px'},
    );
    for (const chapter of chapters) observer.observe(chapter);
    return () => observer.disconnect();
  }, []);

  // Draw the bike once, the first time the section comes into view.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      {threshold: 0.2},
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="anatomy -mx-4 !py-[clamp(5rem,12vw,10rem)]"
      aria-labelledby="anatomy-title"
    >
      <div className="mx-auto max-w-[1280px] px-[clamp(1rem,4vw,3.5rem)]">
        <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-copper uppercase">
          Anatomy
        </p>
        <h2
          id="anatomy-title"
          className="!m-0 max-w-[18ch] font-display text-[clamp(2rem,4.6vw,4rem)] leading-[1] font-bold tracking-[-0.02em] text-sand uppercase"
        >
          Built around the dive.
        </h2>

        <div className="mt-[clamp(3rem,8vw,6rem)] grid gap-x-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="anatomy-stage sticky top-[var(--header-height)] z-20 -mx-[clamp(1rem,4vw,3.5rem)] bg-ink px-[clamp(1rem,4vw,3.5rem)] py-4 md:top-[calc(50vh-15rem)] md:mx-0 md:self-start md:bg-transparent md:p-0">
            <BikeDrawing active={active} pending={armed && !drawn} />
            <ol className="mt-4 hidden justify-center gap-8 text-xs tracking-[0.2em] uppercase md:flex">
              {CHAPTERS.map((chapter) => (
                <li
                  key={chapter.part}
                  className={`!m-0 transition-colors duration-500 ${
                    active === chapter.part ? 'text-copper' : 'text-sand-muted'
                  }`}
                >
                  {chapter.index} {chapter.part}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative z-0">
            {CHAPTERS.map((chapter, i) => (
              <article
                key={chapter.part}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
                data-part={chapter.part}
                data-active={active === chapter.part || undefined}
                className={`anatomy-chapter flex flex-col justify-center ${
                  i === CHAPTERS.length - 1
                    ? 'pt-16 md:min-h-[60vh] md:justify-end'
                    : 'min-h-[70vh] py-16 md:min-h-[85vh]'
                }`}
              >
                <p className="font-display text-sm text-copper">
                  {chapter.index}
                </p>
                <h3 className="!mt-3 !mb-5 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight font-semibold text-sand">
                  {chapter.title}
                </h3>
                <p className="max-w-[42ch] text-[1.0625rem] leading-relaxed text-sand/80">
                  {chapter.body}
                </p>
                <dl className="!mt-9 grid max-w-[28rem] grid-cols-2 gap-6 border-t border-line pt-6">
                  {chapter.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className="!m-0">
                        <span className="font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none font-bold text-sand tabular-nums">
                          {stat.value}
                        </span>
                        {stat.unit ? (
                          <span className="ms-1 text-sm font-semibold text-copper">
                            {stat.unit}
                          </span>
                        ) : null}
                        <span
                          className="mt-2 block text-xs tracking-[0.15em] text-sand-muted uppercase"
                          aria-hidden="true"
                        >
                          {stat.label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Side view of a Saqr city bike, drawn as strokes so it can trace itself in.
 * Parts carry data-part so the active chapter can light them.
 */
function BikeDrawing({
  active,
  pending,
}: {
  active: Part | null;
  pending: boolean;
}) {
  const state = (part: Part) =>
    active === null ? undefined : active === part ? 'on' : 'off';

  return (
    <svg
      viewBox="0 0 800 470"
      className={`anatomy-bike w-full ${pending ? 'is-pending' : ''} ${
        active ? 'has-active' : ''
      }`}
      role="img"
      aria-label="Side view of a Saqr electric bike: mid-drive motor at the cranks, battery inside the down tube, one-piece aluminium frame"
    >
      {/* Wheels and the parts that are not the subject of a chapter */}
      <g className="bike-base">
        <circle pathLength={1} cx="180" cy="330" r="128" strokeWidth="9" />
        <circle pathLength={1} cx="620" cy="330" r="128" strokeWidth="9" />
        <circle pathLength={1} cx="180" cy="330" r="112" strokeWidth="1" />
        <circle pathLength={1} cx="620" cy="330" r="112" strokeWidth="1" />
        <circle pathLength={1} cx="180" cy="330" r="10" strokeWidth="2" />
        <circle pathLength={1} cx="620" cy="330" r="10" strokeWidth="2" />
        {/* Seat post and saddle */}
        <path pathLength={1} d="M352 148 343 104" strokeWidth="7" />
        <path pathLength={1} d="M300 100h78c8 0 12 4 10 9l-6 4h-80c-6 0-8-8-2-13Z" strokeWidth="3" />
        {/* Stem and bars */}
        <path pathLength={1} d="M566 136 560 100h46" strokeWidth="6" />
        <path pathLength={1} d="M600 100c18 0 28 6 34 18" strokeWidth="5" />
        {/* Crank, pedal, chain */}
        <path pathLength={1} d="M392 340 432 400" strokeWidth="7" />
        <path pathLength={1} d="M418 404h32" strokeWidth="8" />
        <path pathLength={1} d="M392 314 180 320M392 366 180 340" strokeWidth="1.5" />
        {/* Rear rack */}
        <path pathLength={1} d="M110 206h120M120 206l56 120M226 206l-10 22" strokeWidth="3" />
        {/* Mudguards */}
        <path pathLength={1} d="M40.2 305.3A142 142 0 0 1 251 207" strokeWidth="3" />
        <path pathLength={1} d="M511.2 238.7A142 142 0 0 1 757.2 293.2" strokeWidth="3" />
      </g>

      <g className="bike-part" data-part="frame" data-state={state('frame')}>
        {/* Chainstay, seatstay, seat tube, top tube, head tube, fork */}
        <path pathLength={1} d="M180 330 392 340" strokeWidth="8" />
        <path pathLength={1} d="M180 330 346 172" strokeWidth="7" />
        <path pathLength={1} d="M392 340 352 148" strokeWidth="10" />
        <path pathLength={1} d="M352 158 566 140" strokeWidth="10" />
        <path pathLength={1} d="M566 132 582 206" strokeWidth="14" />
        <path pathLength={1} d="M582 206c10 40 26 84 38 124" strokeWidth="8" />
        {/* Integrated front light */}
        <path pathLength={1} d="M560 152h-14" strokeWidth="6" />
      </g>

      <g className="bike-part" data-part="battery" data-state={state('battery')}>
        {/* Down tube with the battery inside it */}
        <path pathLength={1} d="M392 340 578 196" strokeWidth="22" />
        <path pathLength={1} className="bike-cell" d="M412 318 556 206" strokeWidth="9" />
        <circle pathLength={1} cx="560" cy="203" r="5" strokeWidth="3" />
      </g>

      <g className="bike-part" data-part="motor" data-state={state('motor')}>
        <circle pathLength={1} cx="392" cy="340" r="36" strokeWidth="6" />
        <circle pathLength={1} cx="392" cy="340" r="20" strokeWidth="3" />
        <path pathLength={1} d="M364 318a36 36 0 0 1 46-12" strokeWidth="3" />
      </g>
    </svg>
  );
}
