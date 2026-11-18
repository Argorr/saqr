import type {BuildProgress} from '~/lib/build';

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short'}).format(
    new Date(iso),
  );

const longDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long'}).format(
    new Date(iso),
  );

/**
 * Where a bike order stands: four stages from order to home delivery, the
 * mechanic building it, and the Shaheen numbers it carries.
 */
export function BuildTracker({
  progress,
  bikes,
}: {
  progress: BuildProgress;
  /** Bikes in the order, with their serial number when they have one. */
  bikes: Array<{title: string; serial: string | null}>;
}) {
  return (
    <section className="build-tracker" aria-labelledby="build-tracker-title">
      <div className="build-tracker-head">
        <div>
          <p className="build-tracker-eyebrow">
            {progress.delivered ? 'Delivered' : 'Build progress'}
          </p>
          <h3 id="build-tracker-title" className="build-tracker-title">
            {progress.current.label}
          </h3>
          <p className="build-tracker-summary">{progress.summary}</p>
        </div>
        <dl className="build-tracker-facts">
          <div>
            <dt>{progress.delivered ? 'Delivered on' : 'Expected at home'}</dt>
            <dd>{longDate(progress.deliveryDate)}</dd>
          </div>
          <div>
            <dt>Your mechanic</dt>
            <dd>{progress.mechanic}</dd>
          </div>
        </dl>
      </div>

      {bikes.some((bike) => bike.serial) ? (
        <ul className="build-tracker-serials">
          {bikes
            .filter((bike) => bike.serial)
            .map((bike) => (
              <li key={bike.serial}>
                <span className="build-tracker-serial">{bike.serial}</span>
                <span className="build-tracker-serial-note">
                  {bike.title}, engraved on the head tube
                </span>
              </li>
            ))}
        </ul>
      ) : null}

      <ol className="build-steps">
        {progress.stages.map((stage) => (
          <li
            key={stage.key}
            className={`build-step build-step--${stage.state}`}
            aria-current={stage.state === 'current' ? 'step' : undefined}
          >
            <span className="build-step-marker" aria-hidden="true" />
            <span className="build-step-label">{stage.label}</span>
            <time className="build-step-date" dateTime={stage.date}>
              {stage.state === 'upcoming' ? 'Around ' : ''}
              {shortDate(stage.date)}
            </time>
            <span className="sr-only">
              {stage.state === 'done'
                ? ' (done)'
                : stage.state === 'current'
                  ? ' (in progress)'
                  : ''}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
