import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  /** Sit over a full-screen hero: transparent until the page scrolls. */
  overlay?: boolean;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  overlay = false,
}: HeaderProps) {
  const {menu} = header;
  const scrolled = useScrolledPast(24);
  const className = [
    'header',
    overlay && 'header--overlay',
    overlay && !scrolled && 'header--transparent',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={className}>
      <NavLink prefetch="intent" to="/" className="header-logo" end>
        <SaqrLogo />
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

/** True once the window has scrolled further than `offset` pixels. */
function useScrolledPast(offset: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, [offset]);
  return scrolled;
}

/**
 * Saqr wordmark (source: design/logos/final). Kufic letters on one joined baseline,
 * with the two dots of the Arabic qaf (ق) over the Q in copper.
 * Letters are clipped at the baseline so their round bottoms sit flat on the band.
 */
export function SaqrLogo() {
  return (
    <svg viewBox="-15.44 -125.45 396.04 145.98" role="img" aria-label="Saqr home">
      <defs>
        <clipPath id="saqr-logo-baseline">
          <rect x="-15.44" y="-125.45" width="396.04" height="126.25" />
        </clipPath>
      </defs>
      <path
        fill="currentColor"
        clipPath="url(#saqr-logo-baseline)"
        d="M58.56 -66.96Q53.52 -69.72 48.3 -71.52Q43.08 -73.32 38.52 -73.32Q32.88 -73.32 29.64 -71.04Q26.4 -68.76 26.4 -64.2Q26.4 -61.08 28.86 -58.62Q31.32 -56.16 35.22 -54.24Q39.12 -52.32 43.32 -50.76Q48.48 -48.84 53.28 -45.9Q58.08 -42.96 61.2 -37.86Q64.32 -32.76 64.32 -24.36Q64.32 -17.64 60.84 -11.88Q57.36 -6.12 50.64 -2.58Q43.92 0.96 34.08 0.96Q26.52 0.96 18.66 -1.32Q10.8 -3.6 3.84 -8.52L11.52 -22.08Q16.08 -18.72 21.96 -16.56Q27.84 -14.4 32.52 -14.4Q35.64 -14.4 38.82 -15.3Q42 -16.2 44.1 -18.36Q46.2 -20.52 46.2 -24.36Q46.2 -27 44.46 -29.16Q42.72 -31.32 39.78 -33.12Q36.84 -34.92 33.36 -36.24Q29.28 -37.8 24.96 -39.84Q20.64 -41.88 16.86 -44.82Q13.08 -47.76 10.74 -52.14Q8.4 -56.52 8.4 -62.88Q8.4 -70.56 11.82 -76.2Q15.24 -81.84 21.48 -85.14Q27.72 -88.44 35.88 -88.8Q46.56 -88.8 53.22 -86.28Q59.88 -83.76 65.16 -80.28ZM74.4 0L114.24 -91.8L115.2 -91.8L155.04 0L134.88 0L109.44 -64.56L122.04 -73.2L91.56 0ZM101.64 -31.92L128.16 -31.92L134.28 -17.28L96.24 -17.28ZM229.08 -17.04L256.44 -17.04L256.44 0L206.28 0ZM161.28 -44.04Q161.28 -53.16 164.76 -61.32Q168.24 -69.48 174.42 -75.78Q180.6 -82.08 188.76 -85.68Q196.92 -89.28 206.28 -89.28Q215.52 -89.28 223.68 -85.68Q231.84 -82.08 238.14 -75.78Q244.44 -69.48 247.98 -61.32Q251.52 -53.16 251.52 -44.04Q251.52 -34.68 247.98 -26.52Q244.44 -18.36 238.14 -12.18Q231.84 -6 223.68 -2.52Q215.52 0.96 206.28 0.96Q196.92 0.96 188.76 -2.52Q180.6 -6 174.42 -12.18Q168.24 -18.36 164.76 -26.52Q161.28 -34.68 161.28 -44.04ZM179.28 -44.16Q179.28 -36.36 182.94 -29.94Q186.6 -23.52 192.84 -19.74Q199.08 -15.96 206.88 -15.96Q214.44 -15.96 220.5 -19.74Q226.56 -23.52 230.04 -29.88Q233.52 -36.24 233.52 -44.04Q233.52 -49.8 231.42 -54.9Q229.32 -60 225.66 -63.84Q222 -67.68 217.08 -69.84Q212.16 -72 206.4 -72Q198.72 -72 192.6 -68.22Q186.48 -64.44 182.88 -58.14Q179.28 -51.84 179.28 -44.16ZM303.6 -88.32Q314.76 -88.32 322.44 -84.66Q330.12 -81 334.14 -74.34Q338.16 -67.68 338.16 -58.56Q338.16 -53.16 336.54 -47.76Q334.92 -42.36 331.26 -37.92Q327.6 -33.48 321.6 -30.78Q315.6 -28.08 306.72 -28.08L294.24 -28.08L294.24 0L276.84 0L276.84 -88.32ZM306.6 -44.88Q311.88 -44.88 314.82 -47.1Q317.76 -49.32 318.96 -52.38Q320.16 -55.44 320.16 -57.96Q320.16 -59.4 319.74 -61.62Q319.32 -63.84 318 -66.12Q316.68 -68.4 313.98 -69.96Q311.28 -71.52 306.72 -71.52L294.24 -71.52L294.24 -44.88ZM322.92 -34.08L344.76 0L324.48 0L302.16 -33.6Z"
      />
      <path fill="currentColor" d="M5.09 0H372.6L360.07 12.53H-7.44Z" />
      <path fill="var(--color-copper)" d="M194.98 -117.45L204.55 -107.88L194.98 -98.31L185.41 -107.88ZM222.74 -117.45L232.31 -107.88L222.74 -98.31L213.17 -107.88Z" />
    </svg>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        style={activeLinkStyle}
        className="header-icon"
      >
        <AccountIcon />
        <span className="sr-only">
          <Suspense fallback="Sign in">
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
            </Await>
          </Suspense>
        </span>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle header-icon reset"
      onClick={() => open('mobile')}
    >
      <MenuIcon />
      <span className="sr-only">Open menu</span>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="header-icon reset" onClick={() => open('search')}>
      <SearchIcon />
      <span className="sr-only">Search</span>
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="header-icon header-cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <CartIcon />
      <span className="sr-only">Cart, {count} items</span>
      {count > 0 && (
        <span className="header-cart-count" aria-hidden="true">
          {count}
        </span>
      )}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function Icon({children}: {children: React.ReactNode}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function MenuIcon() {
  return (
    <Icon>
      <path d="M4 8h16M4 16h16" />
    </Icon>
  );
}

function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Icon>
  );
}

function AccountIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5" />
    </Icon>
  );
}

function CartIcon() {
  return (
    <Icon>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </Icon>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    color: isActive ? 'var(--color-copper)' : undefined,
    opacity: isPending ? 0.6 : undefined,
  };
}
