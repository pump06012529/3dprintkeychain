// Edu Labs Hub — simple launcher for 4 apps.

import '@vostok/ui-kit/styles.css';
import './hub.css';

import { el } from '@vostok/ui-kit';
import registryData from '../../../generators.json';
import type { Registry } from './registry';
import { generatorCard } from './cards';

const registry = (registryData as unknown as Registry);

// ---------------------------------------------------------------------------
// NAV
// ---------------------------------------------------------------------------
function buildNav(): HTMLElement {
  const logoLink = el('a', {
    className: 'hub-nav__logo',
    attrs: { href: './', 'aria-label': 'Edu Labs' },
  });
  logoLink.innerHTML = `<span class="hub-logo-mark" aria-hidden="true">✦</span>`;
  logoLink.append(el('span', { className: 'hub-nav__logo-text', text: 'Edu Labs' }));
  const inner = el('div', { className: 'hub-nav__inner hub-container' }, [logoLink]);
  return el('header', { className: 'hub-nav' }, [inner]);
}

// ---------------------------------------------------------------------------
// CARDS
// ---------------------------------------------------------------------------
function buildCards(): HTMLElement {
  const grid = el('div', { className: 'hub-card-grid' });
  for (const gen of registry.generators) {
    if (gen.status === 'live') {
      grid.append(generatorCard(gen));
    }
  }
  return el('main', { className: 'hub-main hub-container' }, [
    el('div', { className: 'hub-main__header' }, [
      el('h1', { className: 'hub-main__title', text: 'Edu Labs 3D' }),
      el('p', {
        className: 'hub-main__sub',
        text: 'เครื่องมือสร้างโมเดล 3D ฟรีเพื่อการศึกษา',
      }),
    ]),
    grid,
  ]);
}

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------
function buildFooter(): HTMLElement {
  const year = new Date().getFullYear();
  return el('footer', { className: 'hub-footer' }, [
    el('div', { className: 'hub-footer__inner hub-container' }, [
      el('p', {
        className: 'hub-footer__copy',
        text: `© ${year} Edu Labs · Free for Education ✦`,
      }),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------
function init() {
  const app = document.getElementById('app')!;
  app.className = 'hub-page';
  app.append(buildNav(), buildCards(), buildFooter());
}

init();
