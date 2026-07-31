// การ์ดแต่ละแอปในหน้าหลัก

import { el } from '@vostok/ui-kit';
import type { Generator } from './registry';

// สีประจำแต่ละการ์ด (วนซ้ำถ้ามีมากกว่า 4)
const CARD_COLORS = [
  { bg: 'var(--card-1-bg)', border: 'var(--card-1-border)', icon: 'var(--card-1-icon)' },
  { bg: 'var(--card-2-bg)', border: 'var(--card-2-border)', icon: 'var(--card-2-icon)' },
  { bg: 'var(--card-3-bg)', border: 'var(--card-3-border)', icon: 'var(--card-3-icon)' },
  { bg: 'var(--card-4-bg)', border: 'var(--card-4-border)', icon: 'var(--card-4-icon)' },
];

let cardIndex = 0;

/** การ์ดสำหรับแต่ละเครื่องมือ */
export function generatorCard(gen: Generator): HTMLElement {
  const color = CARD_COLORS[cardIndex % CARD_COLORS.length]!;
  cardIndex++;

  const card = el('div', { 
    className: 'hub-card',
    attrs: { style: `--c-bg: ${color.bg}; --c-border: ${color.border}; --c-icon: ${color.icon};` }
  });

  // ส่วน Icon (emoji)
  const icon = (gen as any).icon as string | undefined;
  const iconEl = el('div', { className: 'hub-card__icon' });
  iconEl.textContent = icon ?? '🔧';
  card.append(iconEl);

  // ส่วน Body
  const body = el('div', { className: 'hub-card__body' });
  body.append(
    el('h3', { className: 'hub-card__name', text: gen.name }),
    el('p',  { className: 'hub-card__blurb', text: gen.blurb }),
    el('div', { className: 'hub-card__spacer' }),
  );

  // ปุ่มเปิดแอป
  if (gen.appUrl) {
    const footer = el('div', { className: 'hub-card__footer' });
    footer.append(
      el('a', {
        className: 'hub-card__action',
        attrs: { href: gen.appUrl },
      }, [document.createTextNode('▶ เปิดแอป')]),
    );
    body.append(footer);
  }

  card.append(body);
  return card;
}

// เก็บ export เดิมไว้ไม่ให้ error
export function sellerToolCard(_tool: unknown): HTMLElement {
  return el('div');
}
