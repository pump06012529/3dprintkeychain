// Card rendering for generator cards.

import { el } from '@vostok/ui-kit';
import type { Generator } from './registry';

/** Render a single generator card using emoji icon (no images). */
export function generatorCard(gen: Generator): HTMLElement {
  const card = el('div', { className: 'hub-card' });

  // Icon area — uses emoji from registry, no images
  const icon = (gen as any).icon as string | undefined;
  const iconEl = el('div', { className: 'hub-card__icon' });
  iconEl.textContent = icon ?? gen.name.charAt(0).toUpperCase();
  card.append(iconEl);

  const body = el('div', { className: 'hub-card__body' });
  body.append(
    el('h3', { className: 'hub-card__name', text: gen.name }),
    el('p', { className: 'hub-card__blurb', text: gen.blurb }),
    el('div', { className: 'hub-card__spacer' }),
  );

  // Open App button
  if (gen.appUrl) {
    const footer = el('div', { className: 'hub-card__footer' });
    footer.append(
      el('a', {
        className: 'vl-btn vl-btn--primary hub-card__action',
        text: '▶ เปิดแอป',
        attrs: { href: gen.appUrl },
      }),
    );
    body.append(footer);
  }

  card.append(body);
  return card;
}

// Keep sellerToolCard exported to avoid import errors (unused)
export function sellerToolCard(_tool: unknown): HTMLElement {
  return el('div');
}
