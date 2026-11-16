/** Eyebrow + display title shared by the homepage sections. */
export function SectionIntro({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <p className="!mt-0 mb-4 text-xs font-semibold tracking-[0.3em] text-copper uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="!m-0 max-w-[18ch] font-display text-[clamp(2rem,4.6vw,4rem)] leading-[1] font-bold tracking-[-0.02em] text-sand uppercase"
      >
        {title}
      </h2>
      {children ? (
        <div className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-sand/80">
          {children}
        </div>
      ) : null}
    </header>
  );
}
