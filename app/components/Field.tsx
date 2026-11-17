/**
 * A form field: the label wraps its input, so it needs no id and stays
 * correct when the same form appears several times (saved addresses).
 */
export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
