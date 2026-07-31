import { el } from '../dom';

export interface LicenseModalOptions {
  /** Green pill text at the top, e.g. '✓ Download started'. Pass null to hide. */
  badge?: string | null;
  onClose?: () => void;
}

/** The post-download license modal, same structure as the shipped clicker:
 *  green badge → "Free for personal use 🎉" → CC line → red commercial focal
 *  box (subscription CTA + lifetime alternative) → blue full-width "Got it". */
export function openLicenseModal(opts: LicenseModalOptions = {}): { close(): void } {
  const previouslyFocused =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const ccLine = el('p');
  ccLine.append(
    'เครื่องมือนี้สร้างขึ้นเพื่อให้คุณครู นักเรียน และบุคลากรทางการศึกษาใช้งานได้ฟรี',
  );

  const commercialTitle = el('div', { className: 'vl-commercial-title' });
  commercialTitle.append(
    '🎓 สนับสนุนโดย ',
    el('span', { className: 'vl-sell', text: 'Edu Labs' })
  );

  const commercialBody = el('p');
  commercialBody.append(
    'คุณสามารถนำโมเดล 3 มิติไปพิมพ์เพื่อเป็นสื่อการเรียนการสอน ของเล่น หรือโครงงานวิทยาศาสตร์ได้อย่างอิสระโดย ',
    el('strong', { text: 'ไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น' })
  );

  const card = el('div', { className: 'vl-card', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'License' } }, [
    ...(opts.badge === null ? [] : [el('div', { className: 'vl-badge', text: opts.badge ?? '✓ เริ่มการดาวน์โหลดแล้ว' })]),
    el('h2', { text: 'ฟรีเพื่อการศึกษา \u{1F389}' }),
    ccLine,
    el('div', { className: 'vl-commercial' }, [
      commercialTitle,
      commercialBody
    ]),
  ]);

  const overlay = el('div', { className: 'vl-overlay' }, [card]);
  const handle = {
    close() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      opts.onClose?.();
      previouslyFocused?.focus();
    },
  };

  card.append(
    el('button', {
      className: 'vl-btn vl-btn--primary vl-btn--block',
      text: 'เข้าใจแล้ว',
      on: { click: () => handle.close() },
    }),
  );

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handle.close();
  };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handle.close();
  });

  document.body.append(overlay);
  card.querySelector<HTMLElement>('a, button')?.focus();
  return handle;
}

/** Corner reminder for subsequent downloads (red-bordered card, top right),
 *  the clicker's lighter-touch nudge after the first full modal. */
export function licenseReminderToast(): { close(): void } {
  const body = el('p');
  body.append(
    'เครื่องมือทั้งหมดฟรีเพื่อการศึกษา ',
    el('strong', { text: 'สนับสนุนโดย Edu Labs' })
  );

  const closeBtn = el('button', {
    className: 'vl-license-toast-x',
    text: '×',
    attrs: { 'aria-label': 'Dismiss' },
  });

  const toastCard = el('div', { className: 'vl-license-toast', attrs: { role: 'status' } }, [
    closeBtn,
    el('div', { className: 'vl-license-toast-title', text: '✓ เริ่มการดาวน์โหลดแล้ว' }),
    body
  ]);

  const handle = { close: () => toastCard.remove() };
  closeBtn.addEventListener('click', handle.close);
  document.body.append(toastCard);
  requestAnimationFrame(() => toastCard.classList.add('show'));
  return handle;
}

export interface LicenseNudgeOptions {
  /** Shown in the hint, e.g. 'The Clicker Generator'. */
  generatorName?: string;
}

/** Inline hint for export paths, free tier line + link to open the full modal. */
export function licenseNudge(opts: LicenseNudgeOptions = {}): HTMLElement {
  const name = opts.generatorName ?? 'แอปนี้';
  const hint = el('p', { className: 'vl-hint' });
  hint.append(`${name} ใช้งานได้ฟรีเพื่อการศึกษา ไม่มีค่าใช้จ่ายแอบแฝง!`);
  return hint;
}

/** Open the license modal without the green download badge (topbar / manual trigger). */
export function openCommercialModal(opts: Omit<LicenseModalOptions, 'badge'> = {}): { close(): void } {
  return openLicenseModal({ ...opts, badge: null });
}
