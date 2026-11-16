/**
 * Title block for the inner pages (collections, search, policies, errors):
 * the same eyebrow and display type as the homepage sections, as an h1.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <p className="page-eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      {children ? <div className="page-intro">{children}</div> : null}
    </header>
  );
}
