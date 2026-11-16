import {useEffect, useRef, useState} from 'react';

/**
 * Scroll-scrubbed image sequence (frames made by scripts/make-sequence.mjs).
 *
 * The section is several screens tall; a full-screen canvas stays pinned while
 * the scroll position picks which frame to draw. Captions fade in and out over
 * given ranges of the scroll.
 *
 * - Frames load only when the section is about a screen away, first frame first.
 * - Phones get a portrait 9:16 set.
 * - Without JavaScript, or with reduced motion, the poster and all captions show
 *   as a normal, short section.
 */
export interface SequenceCaption {
  /** Scroll range (0–1) over which the caption is visible. */
  from: number;
  to: number;
  eyebrow: string;
  title: string;
}

interface Props {
  /** Folder under /sequences, as written by make-sequence.mjs. */
  name: string;
  count: number;
  /** How many screens of scrolling the sequence lasts. */
  screens?: number;
  captions: SequenceCaption[];
  /** Describes what the frames show, for screen readers. */
  label: string;
  headingId: string;
  heading: string;
}

const pad = (n: number) => String(n).padStart(3, '0');

export function ScrollSequence({
  name,
  count,
  screens = 3.5,
  captions,
  label,
  headingId,
  heading,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  // `scrub` turns on after hydration when motion is allowed; until then the
  // section renders as a plain poster with its captions.
  const [scrub, setScrub] = useState(false);
  const [firstFrame, setFirstFrame] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setScrub(true);
  }, []);

  useEffect(() => {
    if (!scrub) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!section || !canvas || !ctx) return;

    const set = window.matchMedia('(max-width: 47.99em)').matches
      ? 'mobile'
      : 'desktop';
    const frames: (HTMLImageElement | null)[] = new Array(count).fill(null);
    const controller = new AbortController();
    let current = -1;
    let rafId = 0;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return Math.min(Math.max(-rect.top / travel, 0), 1);
    };

    /** Draws a frame like `object-fit: cover`, at device resolution. */
    const draw = (index: number) => {
      // Nearest frame already loaded, so fast scrolling never shows a blank.
      let i = index;
      while (i >= 0 && !frames[i]) i--;
      const image = i >= 0 ? frames[i] : null;
      if (!image) return;
      const ratio = Math.min(window.devicePixelRatio, 2);
      const width = canvas.clientWidth * ratio;
      const height = canvas.clientHeight * ratio;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
      current = i;
    };

    const update = () => {
      const p = progress();
      const index = Math.round(p * (count - 1));
      if (index !== current) draw(index);
      captionRefs.current.forEach((el, i) => {
        const caption = captions[i];
        if (!el || !caption) return;
        el.dataset.visible = String(p >= caption.from && p <= caption.to);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    const onResize = () => {
      current = -1;
      onScroll();
    };

    async function load() {
      const src = (i: number) => `/sequences/${name}/${set}/${pad(i + 1)}.webp`;
      const fetchFrame = async (i: number) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src(i);
        await image.decode();
        if (controller.signal.aborted) return;
        frames[i] = image;
      };
      await fetchFrame(0);
      if (controller.signal.aborted) return;
      setFirstFrame(true);
      onResize();
      // The rest, a few at a time, in order.
      for (let i = 1; i < count; i += 6) {
        if (controller.signal.aborted) return;
        await Promise.all(
          Array.from({length: Math.min(6, count - i)}, (_, k) =>
            fetchFrame(i + k).catch(() => {}),
          ),
        );
        onScroll();
      }
    }

    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loader.disconnect();
        load().catch((error: unknown) =>
          console.error('Sequence failed to load', error),
        );
      },
      {rootMargin: '100% 0px'},
    );
    loader.observe(section);
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onResize);
    update();

    return () => {
      controller.abort();
      loader.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [scrub, name, count, captions]);

  return (
    <section
      ref={sectionRef}
      className="sequence relative -mx-4 !p-0"
      style={scrub ? {height: `${screens * 100}svh`} : undefined}
      aria-labelledby={headingId}
    >
      <div
        className={
          scrub
            ? 'sticky top-0 h-[100svh] overflow-hidden'
            : 'relative overflow-hidden'
        }
      >
        <picture
          className={`block transition-opacity duration-500 ${
            scrub ? 'absolute inset-0' : ''
          } ${firstFrame ? 'opacity-0' : 'opacity-100'}`}
        >
          <img
            src={`/sequences/${name}/poster.jpg`}
            alt=""
            width={1280}
            height={720}
            loading="lazy"
            className="h-full w-full !rounded-none object-cover"
          />
        </picture>
        {scrub ? (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={label}
          />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/50"
          aria-hidden="true"
        />

        <h2 id={headingId} className="sr-only">
          {heading}
        </h2>
        <div
          className={
            scrub
              ? 'absolute inset-0'
              : 'relative grid gap-8 px-[clamp(1rem,4vw,3.5rem)] py-12'
          }
        >
          {captions.map((caption, i) => (
            <div
              key={caption.title}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className={`sequence-caption ${
                scrub
                  ? 'absolute bottom-[clamp(3rem,10vh,6rem)] left-[clamp(1rem,4vw,3.5rem)]'
                  : ''
              }`}
            >
              <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-copper uppercase">
                {caption.eyebrow}
              </p>
              <p className="max-w-[16ch] font-display text-[clamp(2rem,5vw,4.25rem)] leading-[0.95] font-bold tracking-[-0.02em] text-sand uppercase">
                {caption.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
