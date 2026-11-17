import {RESERVED_SERIALS, SERIES_SIZE, formatSerial} from '~/lib/saqr';

const NUMBERS = Array.from({length: SERIES_SIZE}, (_, i) => i + 1);

/** The lowest number nobody has reserved yet. */
export function firstFreeSerial() {
  return NUMBERS.find((n) => !RESERVED_SERIALS.has(n)) ?? null;
}

/**
 * The register of the 99 Shaheen bikes: one radio per number, reserved ones
 * struck through. A native radio group, so arrow keys move between the free
 * numbers and screen readers announce "07, 2 of 41".
 */
export function SerialPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (serial: number) => void;
}) {
  const free = SERIES_SIZE - RESERVED_SERIALS.size;
  return (
    <fieldset className="!m-0 !border-0 !p-0">
      <legend className="!mb-4 flex w-full items-baseline justify-between gap-3 text-xs !font-normal tracking-[0.2em] text-sand-muted uppercase">
        Your number
        <span className="text-xs tracking-normal normal-case">
          {free} of {SERIES_SIZE} still free
        </span>
      </legend>

      <div className="serial-grid">
        {NUMBERS.map((n) => {
          const reserved = RESERVED_SERIALS.has(n);
          return (
            <label
              key={n}
              className={reserved ? 'cursor-not-allowed' : 'cursor-pointer'}
            >
              <input
                type="radio"
                name="serial"
                value={n}
                checked={value === n}
                disabled={reserved}
                onChange={() => onChange(n)}
                className="peer sr-only"
              />
              <span className="serial-cell">
                {String(n).padStart(2, '0')}
                {reserved ? <span className="sr-only"> (reserved)</span> : null}
              </span>
            </label>
          );
        })}
      </div>

      {value ? (
        <p className="!mt-5 !mb-0 flex items-baseline gap-3" aria-live="polite">
          <span className="font-serif text-3xl text-copper-strong italic">
            {formatSerial(value)}
          </span>
          <span className="text-sm text-sand-muted">
            Engraved on the head tube.
          </span>
        </p>
      ) : null}
    </fieldset>
  );
}
