import {useEffect, useId, useRef} from 'react';
import {Link, useFetcher} from 'react-router';
import {SectionIntro} from './SectionIntro';

/**
 * Private test ride request. Posts to the homepage action, which validates
 * the fields on the server (see `testRideAction`). It works without
 * JavaScript too: the form then submits as a normal POST.
 *
 * Saqr is a portfolio piece: requests are validated but not stored or sent.
 */
export const TEST_RIDE_CITIES = ['Paris', 'London', 'Milan', 'Dubai'] as const;

export type TestRideResult =
  | {ok: true; name: string; city: string}
  | {ok: false; errors: Partial<Record<TestRideField, string>>};
type TestRideField = 'name' | 'email' | 'city' | 'date';

export function testRideAction(form: FormData): TestRideResult {
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const city = String(form.get('city') ?? '');
  const date = String(form.get('date') ?? '');
  const errors: Partial<Record<TestRideField, string>> = {};

  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.';
  if (!(TEST_RIDE_CITIES as readonly string[]).includes(city))
    errors.city = 'Please choose a city.';
  const day = new Date(`${date}T12:00:00Z`);
  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (Number.isNaN(day.getTime()) || day < tomorrow)
    errors.date = 'Please pick a day from tomorrow onwards.';

  return Object.keys(errors).length
    ? {ok: false, errors}
    : {ok: true, name, city};
}

export function TestRide() {
  const fetcher = useFetcher<TestRideResult>();
  const result = fetcher.data;
  const submitting = fetcher.state !== 'idle';
  const errors = result && !result.ok ? result.errors : {};
  const confirmationRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  useEffect(() => {
    if (result?.ok) confirmationRef.current?.focus();
  }, [result]);

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <section
      id="test-ride"
      className="home-section -mx-4 scroll-mt-[var(--header-height)] border-t border-line py-[clamp(5rem,12vw,9rem)]"
      aria-labelledby="test-ride-title"
    >
      <div className="mx-auto grid max-w-[1280px] gap-x-20 gap-y-12 px-[clamp(1rem,4vw,3.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <SectionIntro
            id="test-ride-title"
            eyebrow="Private test ride"
            title="Ride it where you live."
          >
            <p className="!m-0">
              We bring an S1 to your door, set it up for you and ride with you
              for an hour. No showroom, no sales pitch.
            </p>
          </SectionIntro>
          <p className="!mt-8 !mb-0 text-sm text-sand-muted">
            Already decided?{' '}
            <Link
              to="/products/saqr-s1"
              prefetch="intent"
              className="font-semibold text-sand underline underline-offset-4 hover:text-copper"
            >
              Configure your S1
            </Link>
            . Built to order in six weeks.
          </p>
        </div>

        {result?.ok ? (
          <div
            ref={confirmationRef}
            tabIndex={-1}
            role="status"
            className="self-center rounded-sm border border-line bg-ink-2 p-8 outline-none"
          >
            <p className="!m-0 font-display text-2xl font-semibold text-sand">
              Thank you, {result.name}.
            </p>
            <p className="!mt-3 !mb-0 leading-relaxed text-sand/80">
              Our team in {result.city} will be in touch within a day to confirm
              your ride.
            </p>
          </div>
        ) : (
          <fetcher.Form
            method="post"
            noValidate
            className="grid max-w-none gap-5 sm:grid-cols-2"
            aria-describedby={`${formId}-note`}
          >
            <input type="hidden" name="intent" value="test-ride" />
            <Field id={`${formId}-name`} label="Name" error={errors.name}>
              <input
                id={`${formId}-name`}
                name="name"
                autoComplete="name"
                required
                className="test-ride-input"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? `${formId}-name-error` : undefined
                }
              />
            </Field>
            <Field id={`${formId}-email`} label="Email" error={errors.email}>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                className="test-ride-input"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? `${formId}-email-error` : undefined
                }
              />
            </Field>
            <Field id={`${formId}-city`} label="City" error={errors.city}>
              <select
                id={`${formId}-city`}
                name="city"
                required
                defaultValue=""
                className="test-ride-input"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={
                  errors.city ? `${formId}-city-error` : undefined
                }
              >
                <option value="" disabled>
                  Choose a city
                </option>
                {TEST_RIDE_CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </Field>
            <Field
              id={`${formId}-date`}
              label="Preferred day"
              error={errors.date}
            >
              <input
                id={`${formId}-date`}
                name="date"
                type="date"
                min={minDate}
                required
                className="test-ride-input [color-scheme:dark]"
                aria-invalid={Boolean(errors.date)}
                aria-describedby={
                  errors.date ? `${formId}-date-error` : undefined
                }
              />
            </Field>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-copper px-7 text-sm font-semibold tracking-wide text-ink relative fade-hover [--hover-bg:var(--color-copper-strong)] disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Request a test ride'}
              </button>
              <p id={`${formId}-note`} className="!m-0 text-xs text-sand-muted">
                Demo form: nothing is stored or sent.
              </p>
            </div>
          </fetcher.Form>
        )}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs tracking-[0.15em] text-sand-muted uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="!mt-2 !mb-0 text-sm text-copper-strong"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
