import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';

/**
 * Full-screen homepage hero: a looping film behind the headline.
 *
 * - The still frame (<picture>) renders first and is the LCP element; the film
 *   fades in over it once it actually plays.
 * - The film only starts from JavaScript, and never for visitors who ask for
 *   reduced motion. Without JavaScript the still frame stays.
 * - A pause / play button is always available (WCAG 2.2.2).
 * - Phones in portrait get a vertical crop of the same film.
 */
const MEDIA = {
  landscape: {
    video: '/videos/hero-1920.mp4',
    poster: '/videos/hero-poster.jpg',
    width: 1920,
    height: 1080,
  },
  portrait: {
    video: '/videos/hero-portrait.mp4',
    poster: '/videos/hero-poster-portrait.jpg',
    width: 720,
    height: 1278,
  },
};
const PORTRAIT_QUERY = '(orientation: portrait) and (max-width: 47.99em)';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) return;
    // The film waits for the headline's first paint, so its download never
    // competes with it; the still frame is on screen in the meantime.
    return afterFirstPaint(() => {
      video.play().catch(() => {
        // Autoplay refused (data saver, low power mode): keep the still frame.
      });
    });
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  return (
    <section
      className="hero relative isolate -mx-4 flex min-h-[100svh] items-end overflow-hidden !p-0"
      aria-labelledby="hero-title"
    >
      <picture className="absolute inset-0 -z-20">
        <source
          media={PORTRAIT_QUERY}
          srcSet={MEDIA.portrait.poster}
          width={MEDIA.portrait.width}
          height={MEDIA.portrait.height}
        />
        <img
          src={MEDIA.landscape.poster}
          width={MEDIA.landscape.width}
          height={MEDIA.landscape.height}
          alt=""
          // React 18 only forwards the lowercase attribute.
          {...{fetchpriority: 'high'}}
          className="h-full w-full !rounded-none object-cover"
        />
      </picture>

      <video
        ref={videoRef}
        className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000 ease-[var(--ease-dive)] ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => {
          setPlaying(true);
          setVisible(true);
        }}
        onPause={() => setPlaying(false)}
      >
        <source
          src={MEDIA.portrait.video}
          type="video/mp4"
          media={PORTRAIT_QUERY}
        />
        <source src={MEDIA.landscape.video} type="video/mp4" />
      </video>

      {/* Darkens the bottom and left so the text keeps its contrast on any frame. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/70 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="hero-copy w-full px-[clamp(1rem,4vw,3.5rem)] pb-[clamp(3rem,10vh,7rem)]">
        <p className="hero-reveal mb-5 text-xs font-semibold tracking-[0.3em] text-copper uppercase [--d:100ms]">
          Urban e-bikes
        </p>
        <h1
          id="hero-title"
          className="!m-0 max-w-[14ch] font-display text-[clamp(2.75rem,8.5vw,7.5rem)] leading-[0.92] font-bold tracking-[-0.03em] text-sand uppercase"
        >
          <span className="hero-reveal block [--d:200ms]">Swift</span>
          <span className="hero-reveal block [--d:320ms]">by nature.</span>
        </h1>
        <p className="hero-reveal mt-6 max-w-[38ch] text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-sand/85 [--d:480ms]">
          Electric bikes shaped like the falcon they are named after: light,
          quiet and quick off the mark. Made for the city after dark.
        </p>
        <div className="hero-reveal mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 [--d:600ms]">
          <Link
            to="/collections/all"
            prefetch="intent"
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-copper px-7 text-sm font-semibold tracking-wide text-ink relative fade-hover [--hover-bg:var(--color-copper-strong)] hover:no-underline"
          >
            Explore the bikes
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/collections"
            prefetch="intent"
            className="text-sm font-semibold tracking-wide text-sand underline-offset-8 hover:underline"
          >
            Accessories
          </Link>
          <button
            type="button"
            onClick={togglePlayback}
            className="ms-auto grid size-11 shrink-0 place-items-center rounded-full border border-sand/30 text-sand backdrop-blur-sm relative fade-hover [--hover-bg:rgb(236_227_210/0.1)] [--hover-border:var(--color-sand)]"
            aria-label={
              playing ? 'Pause background video' : 'Play background video'
            }
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Runs `start` once the page's largest paint has happened (Chrome, Edge), or
 * after the load event where that is not reported (Firefox, Safari).
 * Returns a cleanup function.
 */
function afterFirstPaint(start: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    start();
  };

  if (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')
  ) {
    const observer = new PerformanceObserver(() => {
      observer.disconnect();
      run();
    });
    observer.observe({type: 'largest-contentful-paint', buffered: true});
    return () => {
      done = true;
      observer.disconnect();
    };
  }

  if (document.readyState === 'complete') {
    run();
    return () => {};
  }
  window.addEventListener('load', run, {once: true});
  return () => {
    done = true;
    window.removeEventListener('load', run);
  };
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
