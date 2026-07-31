// Edu Labs Hub — main entry point.
// Renders the full landing page: nav, hero, generators, footer.

import '@vostok/ui-kit/styles.css';
import './hub.css';

import { el, segmentedControl, ICONS, svgEl } from '@vostok/ui-kit';
import registryData from '../../../generators.json';
import type { Registry } from './registry';
import { generatorCard, sellerToolCard } from './cards';

const registry = registryData as unknown as Registry;

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

// ---------------------------------------------------------------------------
// NAV
// ---------------------------------------------------------------------------
function buildNav(): HTMLElement {
  const logoLink = el('a', {
    className: 'hub-nav__logo',
    attrs: { href: './', 'aria-label': 'Edu Labs home' },
  });
  // Cute geometric logo mark using accent colors
  logoLink.innerHTML += `<span class="hub-logo-mark" aria-hidden="true">✦</span>`;
  logoLink.append(el('span', { className: 'hub-nav__logo-text', text: 'Edu Labs' }));

  const links = el('nav', { className: 'hub-nav__links' }, [
    el('a', { className: 'hub-nav__link', text: '🎨 Generators', attrs: { href: '#generators', 'data-filter': 'all' } }),
    el('a', { className: 'hub-nav__link', text: '🛠 Seller Tools', attrs: { href: '#generators', 'data-filter': 'tools' } }),
  ]);

  const inner = el('div', { className: 'hub-nav__inner hub-container' }, [logoLink, links]);
  return el('header', { className: 'hub-nav' }, [inner]);
}

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
function buildHero(): HTMLElement {
  const eyebrow = el('p', {
    className: 'hub-hero__eyebrow',
    text: 'Free for makers · License for sellers',
  });

  const title = el('h1', { className: 'hub-hero__title' });
  title.innerHTML = 'Free 3D Print <em>Generators</em>';

  const sub = el('p', {
    className: 'hub-hero__sub',
    text: 'Parametric model generators for makers and sellers. Customize, download, print. No account needed.',
  });

  const licenseLink = el('a', {
    className: 'vl-btn vl-btn--secondary hub-hero__license-btn',
    text: 'See commercial licensing',
    attrs: { href: '#licensing' },
  });

  const actions = el('div', { className: 'hub-hero__actions' }, [
    el('a', {
      className: 'vl-btn vl-btn--primary',
      text: 'Browse generators ↓',
      attrs: { href: '#generators' },
    }),
    licenseLink,
  ]);

  return el('section', { className: 'hub-hero' }, [
    el('div', { className: 'hub-container' }, [
      el('div', { className: 'hub-hero__inner' }, [eyebrow, title, sub, actions]),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// CATALOG — generators + seller tools in one grid, filtered by category.
// The category switch is a per-item axis, distinct from the header's page-nav.
// ---------------------------------------------------------------------------
type Category = 'all' | 'app' | 'mw' | 'tools';

function buildCatalog(): HTMLElement {
  // Seller tools from the registry, with upcoming ones as a fallback.
  const tools = registry.sellerTools.length > 0
    ? registry.sellerTools
    : [
        { id: 'profit-calc', name: 'Profit Calculator', status: 'coming-soon' as const, blurb: '3D print pricing: material, time, margin, all in one.' },
        { id: 'photo-render', name: 'Product Photo Tool', status: 'coming-soon' as const, blurb: 'Upload your model, get store-ready product shots.' },
        { id: 'listing-copy', name: 'Listing Copy Helper', status: 'coming-soon' as const, blurb: 'Generate Etsy & MakerWorld titles, tags, and descriptions.' },
        { id: 'review-qr', name: 'Review QR Cards', status: 'coming-soon' as const, blurb: '"Scan to leave a review" cards to include with shipments.' },
      ];

  const grid = el('div', { className: 'hub-grid' });

  // Current filter state: category (segmented control) + free-text search.
  let activeCat: Category = 'all';
  let query = '';

  const matches = (...fields: (string | undefined)[]) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return fields.some((f) => f && f.toLowerCase().includes(q));
  };

  // Empty-state shown when a search matches nothing.
  const emptyState = el('p', {
    className: 'hub-grid__empty',
    text: 'No generators or tools match your search.',
  });

  // Re-render the grid for the chosen category + search query.
  const render = () => {
    grid.replaceChildren();
    let count = 0;
    if (activeCat !== 'tools') {
      for (const gen of registry.generators) {
        const isApp = gen.route === 'app' || gen.route === 'both';
        const isMw = gen.route === 'mw' || gen.route === 'both';
        const inCat = activeCat === 'all' || (activeCat === 'app' && isApp) || (activeCat === 'mw' && isMw);
        if (inCat && matches(gen.name, gen.blurb)) {
          grid.append(generatorCard(gen));
          count++;
        }
      }
    }
    if (activeCat === 'all' || activeCat === 'tools') {
      for (const tool of tools) {
        if (matches(tool.name, tool.blurb)) {
          grid.append(sellerToolCard(tool));
          count++;
        }
      }
    }
    if (count === 0) grid.append(emptyState);
  };

  const filter = el('div', { className: 'hub-catalog__filter', attrs: { id: 'catalog-filter' } }, [
    segmentedControl<Category>({
      value: 'all',
      onChange: (cat) => { activeCat = cat; render(); },
      options: [
        { value: 'all', label: 'All' },
        { value: 'app', label: 'Web App' },
        { value: 'mw', label: 'MakerWorld' },
        { value: 'tools', label: 'Tools' },
      ],
    }),
  ]);

  // Search box: filters visible cards by name/blurb, live as you type.
  const searchInput = el('input', {
    className: 'hub-search__input',
    attrs: {
      type: 'search',
      placeholder: 'Search generators & tools…',
      'aria-label': 'Search generators and tools',
      autocomplete: 'off',
      spellcheck: 'false',
    },
  }) as HTMLInputElement;
  searchInput.addEventListener('input', () => {
    query = searchInput.value.trim();
    render();
  });
  const search = el('div', { className: 'hub-search' }, [
    svgEl(ICONS.search),
    searchInput,
  ]);

  render();

  return el('section', {
    className: 'hub-section',
    attrs: { id: 'generators' },
  }, [
    el('div', { className: 'hub-container' }, [
      el('div', { className: 'hub-catalog__head' }, [
        el('div', { className: 'hub-catalog__headings' }, [
          el('h2', { className: 'hub-section__title', text: 'Generators' }),
          el('p', {
            className: 'hub-section__desc',
            text: 'Free for personal use. Filter by where each one runs.',
          }),
        ]),
        el('div', { className: 'hub-catalog__controls' }, [search, filter]),
      ]),
      grid,
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// LICENSE / PRICING
// ---------------------------------------------------------------------------
function pricingFeature(text: string): HTMLElement {
  const li = el('li');
  li.append(svgEl(ICONS.check), text);
  return li;
}

// A single lifetime-license price tier: bold "$X for N designs" on one line.
function lifetimeTier(price: string, count: string): HTMLElement {
  return el('li', { className: 'hub-pricing__tier' }, [
    el('span', { className: 'hub-pricing__tier-price', text: price }),
    el('span', { className: 'hub-pricing__tier-count', text: `for ${count}` }),
  ]);
}

function buildLicensing(): HTMLElement {
  const s = BRAND.pricing.subscription;
  const l = BRAND.pricing.lifetime;

  const subCard = el('div', { className: 'hub-pricing__card hub-pricing__card--featured' }, [
    el('span', { className: 'hub-pricing__label', text: 'Subscription' }),
    el('div', { className: 'hub-pricing__price', text: `${fmt(s.month)}/mo` }),
    el('p', { className: 'hub-pricing__desc', text: `Or ${fmt(s.quarter)}/quarter · ${fmt(s.year)}/year` }),
    el('ul', { className: 'hub-pricing__features' }, [
      pricingFeature(`Covers ${s.covers}`),
      pricingFeature('Sell prints on Etsy, fairs, your own shop'),
      pricingFeature('Valid while membership is active'),
      pricingFeature('Cancel anytime'),
    ]),
    el('a', {
      className: 'vl-btn vl-btn--primary vl-btn--block hub-pricing__cta',
      text: 'Get Commercial License →',
      attrs: { href: BRAND.urls.mwCommercial, target: '_blank', rel: 'noopener noreferrer' },
    }),
  ]);

  // Inner lifetime card: just the header + features + CTA.
  const lifeCard = el('div', { className: 'hub-pricing__card' }, [
    el('span', { className: 'hub-pricing__label', text: 'Lifetime License' }),
    el('div', { className: 'hub-pricing__price', text: `From ${fmt(l.one)}` }),
    el('ul', { className: 'hub-pricing__features' }, [
      pricingFeature('One-time payment, yours forever'),
      pricingFeature('Sell prints with no recurring fees'),
      pricingFeature('Flexible scope, set at purchase'),
    ]),
    el('a', {
      className: 'vl-btn vl-btn--secondary vl-btn--block hub-pricing__cta',
      text: 'Get License →',
      attrs: { href: BRAND.urls.mwCommercial, target: '_blank', rel: 'noopener noreferrer' },
    }),
  ]);

  // One big block that wraps the lifetime card + tiers/info side-by-side
  // into a single visual unit beside the subscription card.
  const lifetimeInfo = el('div', { className: 'hub-pricing__lifetime-info' }, [
    el('ul', { className: 'hub-pricing__tiers' }, [
      lifetimeTier(fmt(l.one), '1 design'),
      lifetimeTier(fmt(l.three), '3 designs'),
      lifetimeTier(fmt(l.twelve), '12 designs'),
    ]),
    el('h3', { className: 'hub-pricing__explain-title', text: 'How lifetime licensing works' }),
    el('p', {
      className: 'hub-pricing__explain-text',
      text: 'Own specific designs outright with a single payment, no subscription. A "design" is any one generator, model, app, or seller tool of your choice.',
    }),
  ]);

  const lifetimeGroup = el('div', { className: 'hub-pricing__lifetime-group' }, [
    lifeCard,
    lifetimeInfo,
  ]);

  const freeLine = el('p', { className: 'hub-pricing__free' });
  freeLine.append(
    el('strong', { text: 'Personal use is free.' }),
    ' You can download and print as many models as you like. A commercial license is only required if you sell the physical prints.',
  );

  return el('section', {
    className: 'hub-section',
    attrs: { id: 'licensing' },
  }, [
    el('div', { className: 'hub-container' }, [
      el('div', { className: 'hub-section__header' }, [
        el('h2', { className: 'hub-section__title', text: 'Commercial Licensing' }),
        el('p', {
          className: 'hub-section__desc',
          text: 'Sell what you print. Two paths: rent the catalog or own it outright.',
        }),
      ]),
      el('div', { className: 'hub-pricing__wrap' }, [
        subCard,
        lifetimeGroup,
      ]),
      freeLine,
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------
function buildFooter(): HTMLElement {
  const year = new Date().getFullYear();

  const copy = el('p', {
    className: 'hub-footer__copy',
    text: `© ${year} Edu Labs · Free 3D Print Generators ✦`,
  });

  return el('footer', { className: 'hub-footer' }, [
    el('div', { className: 'hub-footer__inner hub-container' }, [
      copy,
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------
function init() {
  const app = document.getElementById('app')!;
  app.className = 'hub-page';

  app.append(
    buildNav(),
    buildHero(),
    buildCatalog(),
    buildLicensing(),
    buildFooter(),
  );

  // Smooth scroll for anchor links
  app.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (anchor) {
      e.preventDefault();
      const id = anchor.getAttribute('href')!.slice(1);
      // A link may also flip the catalog category filter (e.g. "Seller Tools"
      // → Tools). Click the matching segmented-control tab so its state stays
      // in sync with the grid.
      const filter = anchor.getAttribute('data-filter');
      if (filter) {
        const label = filter === 'tools' ? 'Tools' : filter;
        const tab = Array.from(
          document.querySelectorAll<HTMLButtonElement>('#catalog-filter .vl-tab'),
        ).find((b) => b.textContent?.trim().toLowerCase() === label.toLowerCase());
        tab?.click();
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

init();
