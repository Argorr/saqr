import {Link} from 'react-router';
import {SaqrLogo} from '~/components/Header';
import {TEST_RIDE_CITIES} from '~/components/home/TestRide';
import {TEST_RIDE_LINK} from '~/lib/saqr';

/**
 * Site footer. Like the header, its links are curated in code: every one of
 * them leads to a page or a homepage section that exists.
 */
const COLUMNS = [
  {
    title: 'Bikes',
    links: [
      {label: 'Saqr S1', to: '/products/saqr-s1'},
      {label: 'S1 Shaheen', to: '/products/saqr-s1-shaheen'},
      {label: 'Accessories', to: '/#accessories'},
    ],
  },
  {
    title: 'Saqr',
    links: [
      {label: 'The atelier', to: '/#atelier'},
      {label: 'Test rides', to: TEST_RIDE_LINK.to},
      {label: 'Journal', to: '/blogs/journal'},
      {label: 'Press', to: '/#press'},
    ],
  },
  {
    title: 'Help',
    links: [
      {label: 'Contact', to: '/pages/contact'},
      {label: 'Your account', to: '/account'},
      {label: 'Search', to: '/search'},
      {label: 'Privacy policy', to: '/policies/privacy-policy'},
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <SaqrLogo />
          </Link>
          <p className="footer-tagline">
            Hand-built electric bikes for the city. Few of them, made well.
          </p>
          <Link to={TEST_RIDE_LINK.to} className="footer-cta">
            {TEST_RIDE_LINK.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <nav className="footer-columns" aria-label="Footer">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="footer-heading">{column.title}</h2>
              <ul className="footer-links">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      prefetch={link.to.startsWith('/#') ? undefined : 'intent'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="footer-heading">Showrooms</h2>
            <ul className="footer-links footer-cities">
              {TEST_RIDE_CITIES.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Saqr</p>
        <p>
          Saqr is a fictional brand, designed and built as a portfolio piece. No
          bike will be shipped.
        </p>
      </div>
    </footer>
  );
}
