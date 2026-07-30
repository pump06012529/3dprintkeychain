import { el } from '../dom';
import { ICONS, svgEl } from '../icons';
import { themeToggleButton } from './theme';

export interface TopbarLinksOptions {
  /** URL for the back-to-home button. Defaults to '../' (relative to app subfolder). */
  homeUrl?: string;
  /** Add a light/dark theme toggle button. */
  themeToggle?: boolean;
  /** localStorage key used by the theme toggle (default 'vl-theme'). */
  themeStorageKey?: string;
}

/** Topbar with a back-to-home button on the left and optional theme toggle on the right. */
export function topbarLinks(opts: TopbarLinksOptions = {}): HTMLElement {
  const homeUrl = opts.homeUrl ?? '../';

  const leftGroup = el('div', { className: 'vl-topbar-group' }, [
    el('a', {
      className: 'vl-topbar-btn vl-topbar-btn--home',
      attrs: { href: homeUrl },
    }, [svgEl(ICONS.arrowLeft), document.createTextNode('หน้าหลัก')]),
  ]);

  const rightGroup = el('div', { className: 'vl-topbar-group' });
  if (opts.themeToggle) {
    rightGroup.append(themeToggleButton({
      storageKey: opts.themeStorageKey ?? 'vl-theme',
      className: 'vl-topbar-btn vl-topbar-btn--theme',
    }));
  }

  return el('header', { className: 'vl-topbar' }, [leftGroup, rightGroup]);
}
