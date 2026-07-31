import { el } from '../dom';
import { ICONS, svgEl } from '../icons';
import { themeToggleButton } from './theme';

/* Shared chrome for every Vostok generator so they all look the same: a header
   (name + description + "Made by Vostok Labs"), an optional dismissable quality
   callout, and the Save / Load / Help / Light-mode action block under the export
   button. Modelled on the shipped clicker app, sized on the ui-kit token scale. */

export interface GeneratorHeaderOptions {
  /** Generator name, e.g. "Name Keychain Generator". */
  title: string;
  /** One-line description under the title. */
  description: string;
  /** Where "Made by Vostok Labs" links (default: the MakerWorld profile). */
  madeByUrl?: string;
}

/** Title + description + "Made by Vostok Labs" — the top of every generator sidebar. */
export function generatorHeader(opts: GeneratorHeaderOptions): HTMLElement {
  return el('div', { className: 'vl-app-header' }, [
    el('h1', { className: 'vl-app-title', text: opts.title }),
    el('p', { className: 'vl-app-subtitle', text: opts.description }),
  ]);
}

export interface QualityCalloutOptions {
  /** Callout body as HTML (links allowed). Use this or `text`. */
  html?: string;
  /** Callout body as plain text. */
  text?: string;
  /** localStorage key so a dismiss sticks across visits. Omit = not dismissable. */
  storageKey?: string;
}

/**
 * The "for best print quality…" info callout that sits under the header. Pass a
 * storageKey to make it dismissable (an × that hides it and remembers). Returns
 * null when it was previously dismissed, so callers can `if (c) parent.append(c)`.
 */
export function qualityCallout(opts: QualityCalloutOptions): HTMLElement | null {
  if (opts.storageKey) {
    try { if (localStorage.getItem(opts.storageKey) === 'dismissed') return null; } catch { /* ignore */ }
  }

  const body = el('div', { className: 'vl-callout__body' });
  if (opts.html) body.innerHTML = opts.html;
  else body.textContent = opts.text ?? '';

  const root = el('div', { className: 'vl-callout' }, [svgEl(ICONS.info), body]);

  if (opts.storageKey) {
    const dismiss = el('button', {
      className: 'vl-callout__dismiss',
      text: '×',
      attrs: { type: 'button', 'aria-label': 'Dismiss' },
    });
    dismiss.addEventListener('click', () => {
      try { localStorage.setItem(opts.storageKey!, 'dismissed'); } catch { /* ignore */ }
      root.remove();
    });
    root.append(dismiss);
  }
  return root;
}

function actionBtn(label: string, icon: string | null, onClick: () => void): HTMLButtonElement {
  const btn = el('button', {
    className: 'vl-btn vl-btn--secondary vl-action-btn',
    attrs: { type: 'button' },
  }) as HTMLButtonElement;
  if (icon) btn.append(svgEl(icon));
  btn.append(el('span', { text: label }));
  btn.addEventListener('click', onClick);
  return btn;
}

export interface ProjectActionsOptions {
  /** Serialize + download the current project. */
  onSave: () => void;
  /** Load a project file the user picked. */
  onLoad: (file: File) => void;
  /** Show the help/intro. Omit to hide the Help button. */
  onHelp?: () => void;
  /** Include the light/dark toggle (default true). */
  theme?: boolean;
  /** localStorage key for the theme toggle. */
  themeStorageKey?: string;
}

/**
 * The Save project / Load project / Help / Light-mode block that sits under the
 * export button. Two rows of two buttons, matching the clicker.
 */
export function projectActions(opts: ProjectActionsOptions): HTMLElement {
  const fileInput = el('input', {
    attrs: { type: 'file', accept: 'application/json', hidden: '' },
  }) as HTMLInputElement;
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) opts.onLoad(f);
    fileInput.value = '';
  });

  const save = actionBtn('บันทึกโปรเจกต์', ICONS.save, () => opts.onSave());
  const load = actionBtn('โหลดโปรเจกต์', ICONS.load, () => fileInput.click());
  const reset = actionBtn('เริ่มต้นใหม่', ICONS.rotateLeft, () => window.location.reload());

  const row2: HTMLElement[] = [];
  if (opts.onHelp) row2.push(actionBtn('ช่วยเหลือ', ICONS.help, () => opts.onHelp!()));
  if (opts.theme ?? true) {
    row2.push(themeToggleButton({
      storageKey: opts.themeStorageKey,
      className: 'vl-btn vl-btn--secondary vl-action-btn',
    }));
  }

  return el('div', { className: 'vl-project-actions' }, [
    el('div', { className: 'vl-action-row' }, [save, load, reset, fileInput]),
    el('div', { className: 'vl-action-row' }, row2),
  ]);
}
