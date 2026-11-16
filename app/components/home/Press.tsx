/**
 * Press quotes. Saqr is a fictional brand: the publications are invented too.
 */
const QUOTES = [
  {
    quote:
      'The quietest bike we have ridden this year, and the only one people stopped us to ask about.',
    source: 'Northbound Review',
  },
  {
    quote:
      'Saqr hides everything that usually makes an e-bike look like an e-bike.',
    source: 'Atelier Mobile',
  },
  {
    quote: 'Built like a watch, priced like one. We would still pay it.',
    source: 'The Commute Journal',
  },
];

export function Press() {
  return (
    <section
      className="home-section -mx-4 border-t border-line bg-ink-2 py-[clamp(4rem,10vw,7rem)]"
      aria-labelledby="press-title"
    >
      <div className="mx-auto max-w-[1280px] px-[clamp(1rem,4vw,3.5rem)]">
        <h2
          id="press-title"
          className="!m-0 text-xs font-semibold tracking-[0.3em] text-copper uppercase"
        >
          In the press
        </h2>
        <ul className="!mt-10 !mb-0 grid list-none gap-x-12 gap-y-12 !p-0 md:grid-cols-3">
          {QUOTES.map((item) => (
            <li key={item.source}>
              <figure className="!m-0">
                <blockquote className="!m-0 font-display text-[clamp(1.125rem,1.7vw,1.375rem)] leading-snug font-medium text-sand">
                  <p className="!m-0">“{item.quote}”</p>
                </blockquote>
                <figcaption className="mt-5 text-xs tracking-[0.2em] text-sand-muted uppercase">
                  {item.source}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
