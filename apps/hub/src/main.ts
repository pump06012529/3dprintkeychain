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
  const grid = el('div', { className: 'hub-grid' });
  for (const gen of registry.generators) {
    if (gen.status === 'live') {
      grid.append(generatorCard(gen));
    }
  }
  return el('main', { className: 'hub-main hub-container' }, [
    el('h1', { className: 'hub-main__title' }, [
      document.createTextNode('Free 3D Print '),
      Object.assign(document.createElement('em'), { textContent: 'Generators' }),
    ]),
    el('p', {
      className: 'hub-main__sub',
      text: 'ฟรีเพื่อการศึกษา · ปรับแต่ง ดาวน์โหลด พิมพ์ได้ทันที',
    }),
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
