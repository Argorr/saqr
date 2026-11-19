import {useEffect, useRef, useState} from 'react';

/**
 * The Saqr S1 turning on its turntable, as a plain looping film.
 *
 * A normal-height section: nothing is pinned and the page scrolls freely.
 * The film keeps its 16:9 frame (never cropped) and fits under the header in
 * one screen; its edges fade into the page background.
 *
 * - Plays only while on screen, never for visitors who ask for reduced motion.
 *   Without JavaScript the still frame stays.
 * - A pause / play button is always available (WCAG 2.2.2).
 * - Phones get a lighter 720px copy; the text moves below the film there.
 *
 * Films are made by scripts/make-loop.mjs.
 */
const MEDIA = {
  desktop: '/videos/turntable-1280.mp4',
  mobile: '/videos/turntable-720.mp4',
  poster: '/videos/turntable-poster.jpg',
};
const MOBILE_QUERY = '(max-width: 47.99em)';

export function TurntableVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  // Set when the visitor pauses, so scrolling back does not restart the film.
  const pausedByUser = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !pausedByUser.current) {
          video.play().catch(() => {
            // Autoplay refused (data saver, low power mode): keep the still frame.
          });
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      },
      {threshold: 0.25},
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pausedByUser.current = false;
      video.play().catch(() => {});
    } else {
      pausedByUser.current = true;
      video.pause();
    }
  }

  return (
    <section
      ref={sectionRef}
      // overflow-x-clip: the edge gradient (-inset-px) would add 1px of
      // sideways scroll on phones.
      className="turntable relative -mx-4 overflow-x-clip bg-ink !p-0"
      aria-labelledby="turntable-title"
    >
      <div className="relative mx-auto aspect-video w-full max-w-[calc((100svh-var(--header-height))*16/9)]">
        <img
          src={MEDIA.poster}
          alt=""
          width={1280}
          height={720}
          loading="lazy"
          className="absolute inset-0 h-full w-full !rounded-none object-contain"
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-[var(--ease-dive)] ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          preload="none"
          // No poster attribute: the lazy <img> above already shows the still,
          // and a poster would be fetched at once, even far below the fold.
          aria-label="The Saqr S1 turning on a turntable"
          onPlaying={() => {
            setPlaying(true);
            setVisible(true);
          }}
          onPause={() => setPlaying(false)}
        >
          <source src={MEDIA.mobile} type="video/mp4" media={MOBILE_QUERY} />
          <source src={MEDIA.desktop} type="video/mp4" />
        </video>

        {/* Melts the film's black into the page background on every side. */}
        <div
          className="pointer-events-none absolute -inset-px bg-[linear-gradient(to_right,var(--color-ink),transparent_12%,transparent_88%,var(--color-ink)),linear-gradient(to_top,var(--color-ink),transparent_7%,transparent_94%,var(--color-ink))]"
          aria-hidden="true"
        />
        {/* Keeps the text readable where it sits over the film (desktop). */}
        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-transparent to-transparent md:block"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={togglePlayback}
          className="absolute right-[clamp(1rem,4vw,3.5rem)] bottom-[clamp(1rem,4vw,3rem)] grid size-11 place-items-center rounded-full border border-sand/30 text-sand backdrop-blur-sm fade-hover [--hover-bg:rgb(236_227_210/0.1)] [--hover-border:var(--color-sand)]"
          aria-label={playing ? 'Pause the bike video' : 'Play the bike video'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      <div className="px-[clamp(1rem,4vw,3.5rem)] pt-6 pb-12 md:absolute md:top-1/2 md:left-0 md:-translate-y-1/2 md:p-0 md:ps-[clamp(1rem,4vw,3.5rem)]">
        <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-copper uppercase">
          Saqr S1
        </p>
        <h2
          id="turntable-title"
          className="!m-0 max-w-[12ch] font-display text-[clamp(2rem,4.5vw,4.25rem)] leading-[0.95] font-bold tracking-[-0.02em] text-sand uppercase"
        >
          Every angle, considered.
        </h2>
        <p className="mt-5 max-w-[30ch] text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-sand/80">
          One line, end to end. Nothing bolted on, nothing to hide. Built for
          the city.
        </p>
      </div>
    </section>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M3 1.5v11a.6.6 0 0 0 .9.5l9-5.5a.6.6 0 0 0 0-1l-9-5.5a.6.6 0 0 0-.9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
