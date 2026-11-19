import {useId, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Image, Money, type MappedProductOptions} from '@shopify/hydrogen';
import type {
  ProductFragment,
  ProductAddonFragment,
} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {
  BATTERIES,
  bikePromise,
  BUILD_TIME,
  FINISHES,
  LIMITED_TAG,
  SERIAL_ATTRIBUTE,
  SIZE_RANGES,
  formatSerial,
  sizeRange,
  sizesForHeight,
} from '~/lib/saqr';
import {SerialPicker, firstFreeSerial} from './SerialPicker';

type Variant = ProductFragment['selectedOrFirstAvailableVariant'];
type OptionValue = MappedProductOptions['optionValues'][number];

/**
 * Product configurator: the photo stage on the left, the build on the right.
 *
 * - Options are native radio groups (arrow keys, labels, focus all built in).
 *   Choosing one updates the URL (?Finish=Sand&Size=M…) without a page jump,
 *   so a configuration can be shared or bookmarked.
 * - Price differences come from Shopify: each option value knows the variant
 *   it leads to, so "+ €600" is computed, not hard-coded.
 * - Bikes offer the accessories as add-ons; the summary and the button total
 *   everything, and one click adds the bike and its add-ons to the cart.
 * - Bikes are reserved rather than "added to cart". The Shaheen asks for a
 *   serial number, sent with the cart line as an attribute.
 */
export function ProductConfigurator({
  product,
  productOptions,
  selectedVariant,
  addons,
  isBike,
  readyBy,
}: {
  product: ProductFragment;
  productOptions: MappedProductOptions[];
  selectedVariant: Variant;
  addons: ProductAddonFragment[];
  isBike: boolean;
  /** Expected delivery date for a bike ordered today (server time). */
  readyBy?: string | null;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [chosenAddons, setChosenAddons] = useState<string[]>([]);
  const isLimited = product.tags.includes(LIMITED_TAG);
  const [serial, setSerial] = useState(() =>
    isLimited ? firstFreeSerial() : null,
  );

  const selectedAddons = addons.filter((addon) =>
    chosenAddons.includes(addon.id),
  );
  const variantPrice = Number(selectedVariant?.price.amount ?? 0);
  const total = {
    amount: String(
      selectedAddons.reduce(
        (sum, addon) =>
          sum +
          Number(addon.selectedOrFirstAvailableVariant?.price.amount ?? 0),
        variantPrice,
      ),
    ),
    currencyCode: selectedVariant?.price.currencyCode ?? 'EUR',
  };

  const visibleOptions = productOptions.filter(
    (option) => option.optionValues.length > 1,
  );
  const available = Boolean(selectedVariant?.availableForSale);

  function choose(value: OptionValue) {
    if (value.selected || !value.exists) return;
    void navigate(`?${value.variantUriQuery}`, {
      replace: true,
      preventScrollReset: true,
    });
  }

  const lines = selectedVariant
    ? [
        {
          merchandiseId: selectedVariant.id,
          quantity: 1,
          selectedVariant,
          ...(serial
            ? {
                attributes: [
                  {key: SERIAL_ATTRIBUTE, value: formatSerial(serial)},
                ],
              }
            : {}),
        },
        ...selectedAddons.flatMap((addon) =>
          addon.selectedOrFirstAvailableVariant
            ? [
                {
                  merchandiseId: addon.selectedOrFirstAvailableVariant.id,
                  quantity: 1,
                  // Lets the cart show the line before the server answers.
                  selectedVariant: addon.selectedOrFirstAvailableVariant,
                },
              ]
            : [],
        ),
      ]
    : [];

  return (
    <div className="configurator mx-auto grid max-w-[1440px] gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      <Stage
        product={product}
        productOptions={productOptions}
        selectedVariant={selectedVariant}
      />

      <div className="lg:py-10">
        <p className="!mt-0 mb-3 text-xs font-semibold tracking-[0.3em] text-copper uppercase">
          {isLimited
            ? 'Limited edition · 99 numbered bikes'
            : isBike
              ? `Built to order · ${BUILD_TIME}`
              : product.vendor}
        </p>
        <h1 className="!m-0 font-display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.02em] text-sand uppercase">
          {product.title}
        </h1>
        <p className="!mt-4 !mb-0 font-display text-2xl font-semibold text-sand">
          {selectedVariant ? (
            <Money
              as="span"
              data={selectedVariant.price}
              withoutTrailingZeros
            />
          ) : null}
        </p>

        <div className="mt-10 grid gap-9">
          {visibleOptions.map((option) => (
            <OptionGroup
              key={option.name}
              option={option}
              selectedVariant={selectedVariant}
              onChoose={choose}
            />
          ))}

          {isLimited ? (
            <SerialPicker value={serial} onChange={setSerial} />
          ) : null}

          {isBike && addons.length ? (
            <fieldset className="!m-0 !border-0 !p-0">
              <legend className="!mb-4 text-xs !font-normal tracking-[0.2em] text-sand-muted uppercase">
                Add-ons
              </legend>
              <div className="grid gap-3">
                {addons.map((addon) => {
                  const variant = addon.selectedOrFirstAvailableVariant;
                  if (!variant) return null;
                  const checked = chosenAddons.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`configurator-card flex cursor-pointer items-center gap-4 ${
                        variant.availableForSale ? '' : 'opacity-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="configurator-check"
                        checked={checked}
                        disabled={!variant.availableForSale}
                        onChange={() =>
                          setChosenAddons((current) =>
                            checked
                              ? current.filter((id) => id !== addon.id)
                              : [...current, addon.id],
                          )
                        }
                      />
                      {addon.featuredImage ? (
                        <span className="size-14 shrink-0 overflow-hidden rounded-sm bg-black">
                          <Image
                            data={addon.featuredImage}
                            alt=""
                            aspectRatio="1/1"
                            sizes="56px"
                            loading="lazy"
                            className="h-full w-full !rounded-none object-cover"
                          />
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 text-sm font-semibold text-sand">
                        {addon.title}
                      </span>
                      <span className="text-sm text-sand-muted tabular-nums">
                        +{' '}
                        <Money
                          as="span"
                          data={variant.price}
                          withoutTrailingZeros
                        />
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </div>

        <Summary
          product={product}
          selectedVariant={selectedVariant}
          addons={selectedAddons}
          total={total}
          isBike={isBike}
          serial={serial}
        />

        <AddToCartButton
          className="configurator-submit mt-6"
          disabled={!available}
          onClick={() => open('cart')}
          lines={lines}
        >
          {available ? (
            <>
              {isBike
                ? `Reserve${serial ? ` No. ${String(serial).padStart(2, '0')}` : ''}`
                : 'Add to cart'}{' '}
              · <Money as="span" data={total} withoutTrailingZeros />
            </>
          ) : (
            'Sold out'
          )}
        </AddToCartButton>

        {isBike ? (
          <ul className="promise-list">
            {bikePromise(readyBy).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The photo stage. For a product with a Finish option, every finish photo is
 * stacked and cross-faded, so the bike seems to change colour in place.
 */
function Stage({
  product,
  productOptions,
  selectedVariant,
}: {
  product: ProductFragment;
  productOptions: MappedProductOptions[];
  selectedVariant: Variant;
}) {
  const images = useMemo(() => {
    const finish = productOptions.find((option) => option.name === 'Finish');
    const list = (finish?.optionValues ?? [])
      .map((value) => ({
        key: value.name,
        image: value.variant?.image ?? value.firstSelectableVariant?.image,
        selected: value.selected,
      }))
      .filter((item) => item.image);
    if (list.length) return list;
    return selectedVariant?.image
      ? [{key: 'only', image: selectedVariant.image, selected: true}]
      : [];
  }, [productOptions, selectedVariant]);

  // The stage takes the photo's own proportions, so nothing is cropped or
  // letterboxed (finish photos share one size).
  const first = images[0]?.image;
  const ratio =
    first?.width && first.height ? `${first.width} / ${first.height}` : '1 / 1';

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
      <div
        className="relative overflow-hidden rounded-sm bg-black"
        style={{aspectRatio: ratio}}
      >
        {images.map(({key, image, selected}) =>
          image ? (
            <Image
              key={key}
              data={image}
              alt={image.altText || product.title}
              sizes="(min-width: 64em) 60vw, 100vw"
              loading={selected ? 'eager' : 'lazy'}
              aria-hidden={!selected}
              className={`absolute inset-0 h-full w-full !rounded-none object-contain transition-opacity duration-700 ease-[var(--ease-dive)] ${
                selected ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

function OptionGroup({
  option,
  selectedVariant,
  onChoose,
}: {
  option: MappedProductOptions;
  selectedVariant: Variant;
  onChoose: (value: OptionValue) => void;
}) {
  const selected = option.optionValues.find((value) => value.selected);
  const kind =
    option.name === 'Finish'
      ? 'swatch'
      : option.name === 'Battery'
        ? 'card'
        : 'pill';
  const hint =
    option.name === 'Size' && selected
      ? sizeRange(selected.name) && `Rider height ${sizeRange(selected.name)}`
      : option.name === 'Finish' && selected
        ? FINISHES[selected.name]?.text
        : null;

  return (
    <fieldset className="!m-0 !border-0 !p-0">
      <legend className="!mb-4 flex w-full items-baseline gap-3 text-xs !font-normal tracking-[0.2em] text-sand-muted uppercase">
        {option.name}
        {selected ? (
          <span className="text-sm font-semibold tracking-normal text-sand normal-case">
            {selected.name}
          </span>
        ) : null}
      </legend>

      <div
        className={
          kind === 'swatch'
            ? 'flex gap-3'
            : kind === 'card'
              ? 'grid gap-3 sm:grid-cols-2'
              : 'flex flex-wrap gap-2'
        }
      >
        {option.optionValues.map((value) => (
          <label
            key={value.name}
            className={`relative ${value.exists ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
          >
            <input
              type="radio"
              name={option.name}
              value={value.name}
              checked={value.selected}
              disabled={!value.exists}
              onChange={() => onChoose(value)}
              className="peer sr-only"
            />
            {kind === 'swatch' ? (
              <span
                className="configurator-swatch"
                title={value.name}
                style={
                  {
                    '--swatch':
                      FINISHES[value.name]?.swatch ??
                      value.swatch?.color ??
                      '#888',
                  } as React.CSSProperties
                }
              >
                <span className="sr-only">{value.name}</span>
              </span>
            ) : kind === 'card' ? (
              <span className="configurator-card block">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-semibold text-sand">
                    {value.name}
                  </span>
                  <PriceDelta value={value} selectedVariant={selectedVariant} />
                </span>
                {BATTERIES[value.name] ? (
                  <>
                    <span className="mt-1 block text-sm font-semibold text-copper">
                      {BATTERIES[value.name].range}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-sand-muted">
                      {BATTERIES[value.name].text}
                    </span>
                  </>
                ) : null}
              </span>
            ) : (
              <span className="configurator-pill">
                {value.name}
                {!value.available && value.exists ? (
                  <span className="sr-only"> (sold out)</span>
                ) : null}
              </span>
            )}
          </label>
        ))}
      </div>

      {hint ? (
        <p
          className={`!mt-3 !mb-0 text-sand-muted ${
            option.name === 'Finish'
              ? 'font-serif text-xl leading-snug italic'
              : 'text-sm leading-relaxed'
          }`}
        >
          {hint}
        </p>
      ) : null}

      {option.name === 'Size' ? (
        <SizeFinder option={option} onChoose={onChoose} />
      ) : null}
    </fieldset>
  );
}

/**
 * "Which size am I?": the rider's height gives the frame size, with a button
 * to pick it. Between two sizes, it says what each one feels like.
 */
function SizeFinder({
  option,
  onChoose,
}: {
  option: MappedProductOptions;
  onChoose: (value: OptionValue) => void;
}) {
  const inputId = useId();
  const [height, setHeight] = useState('');
  const cm = Number(height);
  const entered = height.trim() !== '';
  const valid = entered && Number.isFinite(cm) && cm >= 100 && cm <= 230;
  const fits = valid
    ? sizesForHeight(cm)
        .map((size) => option.optionValues.find((value) => value.name === size))
        .filter((value): value is OptionValue => Boolean(value?.exists))
    : [];
  const sizes = Object.keys(SIZE_RANGES);
  const smallest = SIZE_RANGES[sizes[0]]?.[0];
  const largest = SIZE_RANGES[sizes[sizes.length - 1]]?.[1];

  let message: React.ReactNode = null;
  if (entered && !valid) {
    message = 'Enter your height in centimetres, for example 175.';
  } else if (fits.length === 1) {
    message = (
      <>
        Size <strong>{fits[0].name}</strong> fits you.
      </>
    );
  } else if (fits.length === 2) {
    message = (
      <>
        You are between <strong>{fits[0].name}</strong> and{' '}
        <strong>{fits[1].name}</strong>. {fits[0].name} sits you more upright
        and turns quicker in traffic; {fits[1].name} stretches you out for
        longer rides.
      </>
    );
  } else if (valid) {
    message = (
      <>
        The S1 is built for riders from {smallest} to {largest} cm.{' '}
        <Link to="/pages/contact" className="size-finder-link">
          Write to the atelier
        </Link>{' '}
        and we will see what we can do.
      </>
    );
  }

  return (
    <details className="size-finder">
      <summary>Which size am I?</summary>
      <div className="size-finder-body">
        <label htmlFor={inputId} className="size-finder-label">
          Your height
        </label>
        <div className="size-finder-field">
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={100}
            max={230}
            placeholder="175"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
          />
          <span aria-hidden="true">cm</span>
        </div>
        <p className="size-finder-result" aria-live="polite">
          {message}
        </p>
        {fits.length ? (
          <div className="size-finder-actions">
            {fits.map((value) =>
              value.selected ? (
                <span key={value.name} className="size-finder-chosen">
                  {value.name} selected
                </span>
              ) : (
                <button
                  key={value.name}
                  type="button"
                  className="size-finder-choose"
                  onClick={() => onChoose(value)}
                >
                  Choose {value.name}
                </button>
              ),
            )}
          </div>
        ) : null}
      </div>
    </details>
  );
}

/** "+ €600" against the current selection, read from the variant it leads to. */
function PriceDelta({
  value,
  selectedVariant,
}: {
  value: OptionValue;
  selectedVariant: Variant;
}) {
  if (!selectedVariant || !value.variant?.price) return null;
  const delta =
    Number(value.variant.price.amount) - Number(selectedVariant.price.amount);
  if (value.selected || delta === 0)
    return (
      <span className="text-xs tracking-[0.15em] text-sand-muted uppercase">
        {value.selected ? 'Selected' : 'Same price'}
      </span>
    );
  return (
    <span className="text-sm text-sand-muted tabular-nums">
      {delta > 0 ? '+ ' : '− '}
      <Money
        as="span"
        data={{
          amount: String(Math.abs(delta)),
          currencyCode: selectedVariant.price.currencyCode,
        }}
        withoutTrailingZeros
      />
    </span>
  );
}

function Summary({
  product,
  selectedVariant,
  addons,
  total,
  isBike,
  serial,
}: {
  product: ProductFragment;
  selectedVariant: Variant;
  addons: ProductAddonFragment[];
  serial: number | null;
  total: {
    amount: string;
    currencyCode: NonNullable<Variant>['price']['currencyCode'];
  };
  isBike: boolean;
}) {
  if (!selectedVariant) return null;
  const options = selectedVariant.selectedOptions
    .filter((o) => o.value !== 'Default Title')
    .map((o) => o.value)
    .join(' · ');
  return (
    <section
      aria-label="Your build"
      className="mt-10 border-t border-line pt-6"
    >
      <dl className="!m-0 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-sand">
            {product.title}
            {options ? (
              <span className="block text-sand-muted">{options}</span>
            ) : null}
            {serial ? (
              <span className="block text-sand-muted">
                {formatSerial(serial)}
              </span>
            ) : null}
          </dt>
          <dd className="!m-0 text-sand tabular-nums">
            <Money
              as="span"
              data={selectedVariant.price}
              withoutTrailingZeros
            />
          </dd>
        </div>
        {addons.map((addon) =>
          addon.selectedOrFirstAvailableVariant ? (
            <div key={addon.id} className="flex justify-between gap-4">
              <dt className="text-sand-muted">{addon.title}</dt>
              <dd className="!m-0 text-sand-muted tabular-nums">
                <Money
                  as="span"
                  data={addon.selectedOrFirstAvailableVariant.price}
                  withoutTrailingZeros
                />
              </dd>
            </div>
          ) : null,
        )}
        <div className="flex justify-between gap-4 border-t border-line pt-3 font-semibold">
          <dt className="text-sand">Total</dt>
          <dd
            className="!m-0 font-display text-lg text-sand tabular-nums"
            aria-live="polite"
          >
            <Money as="span" data={total} withoutTrailingZeros />
          </dd>
        </div>
      </dl>
      {isBike ? null : (
        <p className="!mt-4 !mb-0 text-xs text-sand-muted">
          {selectedVariant.availableForSale
            ? 'In stock. Ships within two working days.'
            : 'Currently unavailable.'}
        </p>
      )}
    </section>
  );
}
