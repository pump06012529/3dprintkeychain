import '@vostok/ui-kit/styles.css';
import './style.css';

import {
  el,
  toast,
  openLicenseModal,
  topbarLinks,
  segmentedControl,
  selectField,
  sliderRow,
  toggleSwitch,
  readParamsFromHash,
  dpad,
  dialog,
  generatorHeader,
  qualityCallout,
  sidebarFooter,
} from '@vostok/ui-kit';
import { BRAND } from '@vostok/brand';
// @ts-ignore
import * as opentype from 'opentype.js';
import { unzipSync } from 'fflate';
import { createViewer } from './viewer/viewer';
import { downloadThreeMF } from './export/threemfExport';
import { FONTS, type FontChoice } from './generated-fonts';
import type { GeometryResponse, PartMesh } from './types';
import { getHorizontalContours, getVerticalContours } from './geometry/textLayout';
import { noAmsPauses } from './geometry/noAms';

type Layout = 'horizontal' | 'vertical';
type LetterStyle = 'raised' | 'engraved';

// Eagerly load all font asset URLs from the src/fonts/ folder (for opentype geometry).
const fontUrls = (import.meta as any).glob('./fonts/*.ttf', { eager: true, import: 'default' }) as Record<string, string>;

// The full font registry (id / label / category / curated) is generated from the fonts
// folder — see generated-fonts.ts. Curated fonts show as instant cards; the rest live in
// the "Browse all fonts" modal.
const curatedFonts = FONTS.filter((f) => f.curated);

const state = {
  name: 'ชื่อ',
  secondLine: '',
  font: 'luckiest-guy',
  layout: 'horizontal' as Layout,
  style: 'raised' as LetterStyle,
  plateShape: 'outline' as 'outline' | 'rectangle',
  size: 18,
  line2Scale: 1.0,
  line2Align: 'center' as 'left' | 'center' | 'right',
  baseThickness: 2.0,
  textThickness: 1.6,
  outlineWidth: 2.5,
  smoothing: 2.0,
  ringStyle: 'loop' as 'loop' | 'corner',
  holeDia: 4.0,
  ringThickness: 2.2,
  ringPosX: 0,
  ringPosY: 0,
  ringAngle: 0,
  haloWidth: 1.2,
  haloThickness: 0.8,
  plate: '#1d2027',
  halo: '#5b9dff',
  text: '#f2f4f8',
  haloOn: true,
  colorScheme: 'plate-halo-text' as 'single' | 'plate-text' | 'plate-halo-text',

  // Typography
  lineSpacing: 1.0, // multiplier on the font's default line gap
  letterSpacing: 0, // tracking, fraction of the em
  boldness: 0, // glyph dilation in mm

  // Edge finish
  chamferOn: true,
  chamfer: 0.4, // mm

  // Print mode
  printMode: 'ams' as 'ams' | 'noams',
  layerHeight: 0.2,
};

// Check for shared URL hash parameters
const shared = readParamsFromHash();
if (shared) {
  Object.assign(state, shared);
}

// ---------------------------------------------------------------------------
// Main thread app logic
// ---------------------------------------------------------------------------
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

const nameInput = el('input', { className: 'nk-name-input', attrs: { type: 'text', maxlength: '18', value: state.name, 'aria-label': 'Name' } });
const secondInput = el('input', { className: 'nk-second-input', attrs: { type: 'text', maxlength: '18', placeholder: 'ข้อความบรรทัดที่สอง (ถ้ามี)', 'aria-label': 'Second line', value: state.secondLine } });

const FA_ICONS = [
  { name: 'Smile', char: '\uf118' },
  { name: 'Laugh', char: '\uf599' },
  { name: 'Heart', char: '\uf004' },
  { name: 'Star', char: '\uf005' },
  { name: 'Cat', char: '\uf6be' },
  { name: 'Dog', char: '\uf6d3' },
  { name: 'Paw', char: '\uf1b0' },
  { name: 'Horse', char: '\uf6f0' },
  { name: 'Frog', char: '\uf52e' },
  { name: 'Dragon', char: '\uf6d5' },
  { name: 'Fish', char: '\uf578' },
  { name: 'Spider', char: '\uf717' },
  { name: 'Rocket', char: '\uf135' },
  { name: 'Space Shuttle', char: '\uf197' },
  { name: 'Meteor', char: '\uf753' },
  { name: 'Lightning', char: '\uf0e7' },
  { name: 'Fire', char: '\uf06d' },
  { name: 'Sun', char: '\uf185' },
  { name: 'Moon', char: '\uf186' },
  { name: 'Cloud', char: '\uf0c2' },
  { name: 'Snowflake', char: '\uf2dc' },
  { name: 'Tree', char: '\uf1bb' },
  { name: 'Leaf', char: '\uf06c' },
  { name: 'Seedling', char: '\uf4d8' },
  { name: 'Flower', char: '\uf5bb' },
  { name: 'Skull', char: '\uf187' },
  { name: 'Ghost', char: '\uf6e2' },
  { name: 'Gamepad', char: '\uf11b' },
  { name: 'Dice', char: '\uf522' },
  { name: 'Chess Knight', char: '\uf439' },
  { name: 'Crown', char: '\uf521' },
  { name: 'Gem', char: '\uf3a5' },
  { name: 'Ring', char: '\uf70b' },
  { name: 'Music', char: '\uf001' },
  { name: 'Guitar', char: '\uf7a6' },
  { name: 'Coffee', char: '\uf0f4' },
  { name: 'Pizza', char: '\uf818' },
  { name: 'Ice Cream', char: '\uf810' },
  { name: 'Apple', char: '\uf3d1' },
  { name: 'Car', char: '\uf1b9' },
  { name: 'Motorcycle', char: '\uf21c' },
  { name: 'Bicycle', char: '\uf206' },
  { name: 'Plane', char: '\uf072' },
  { name: 'Anchor', char: '\uf13d' },
  { name: 'Trophy', char: '\uf091' },
  { name: 'Camera', char: '\uf030' },
  { name: 'Palette', char: '\uf53f' },
  { name: 'Magic', char: '\uf0d0' },
  { name: 'Bomb', char: '\uf1e2' },
  { name: 'Poo', char: '\uf2fe' },
  { name: 'Yin Yang', char: '\uf6ad' },
  { name: 'Peace', char: '\uf67c' },
];

const emojiGrid = el('div', { className: 'nk-emoji-grid', attrs: { style: 'display: none;' } }, 
  FA_ICONS.map(icon => {
    const btn = el('button', { 
      className: 'nk-emoji-btn', 
      text: icon.char,
      attrs: { title: icon.name, style: 'font-family: NK-icon-fallback;' } // Use the fallback font explicitly in UI
    });
    btn.addEventListener('click', () => {
      const active = document.activeElement === secondInput ? secondInput : nameInput;
      active.value += icon.char;
      active.dispatchEvent(new Event('input'));
    });
    return btn;
  })
);

const emojiToggle = el('button', { 
  className: 'vl-btn vl-btn--secondary nk-emoji-toggle',
  text: '✨ แทรกสัญลักษณ์'
});
emojiToggle.addEventListener('click', () => {
  const isHidden = emojiGrid.style.display === 'none';
  emojiGrid.style.display = isHidden ? 'grid' : 'none';
});

const fontGrid = el('div', { className: 'nk-font-grid' });
const stage = el('section', { className: 'nk-stage' });
const statusEl = el('div', { className: 'nk-status show', text: 'กำลังโหลด...' });

const fontCache = new Map<string, any>();
const fontUrlsClean = Object.entries(fontUrls).reduce((acc, [k, v]) => {
  const cleanKey = k.replace('./fonts/', '').replace('.ttf', '');
  acc[cleanKey] = v;
  return acc;
}, {} as Record<string, string>);

async function loadFont(fontId: string): Promise<any> {
  const url = fontUrlsClean[fontId];
  if (!url) {
    if (fontId.startsWith('custom-')) throw new Error('Custom font is missing. Please import the .ttf/.otf file again.');
    throw new Error(`Font url not resolved for ${fontId}`);
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed for font ${fontId}`);
  return opentype.parse(await r.arrayBuffer());
}

async function getFont(fontId: string): Promise<any> {
  let f = fontCache.get(fontId);
  if (!f) {
    f = await loadFont(fontId);
    fontCache.set(fontId, f);
  }
  return f;
}

function showStatus(txt: string) {
  statusEl.textContent = txt;
  statusEl.classList.add('show');
}

function hideStatus() {
  statusEl.classList.remove('show');
}

// ---------------------------------------------------------------------------
// Worker setup
// ---------------------------------------------------------------------------
const worker = new Worker(new URL('./workers/geometry.worker.ts', import.meta.url), { type: 'module' });

let isWorkerBusy = false;
let needsRebuild = false;
let rebuildTimeout: any = null;
let lastParts: PartMesh[] = [];

// Each font's natural line gap differs; this is the default the user's Line spacing
// slider multiplies. Pixel/condensed faces want a tighter default.
function baseLineFactor(fontId: string): number {
  if (fontId === 'vt323' || fontId === 'press-start-2p') return 0.44;
  if (fontId === 'creepster') return 0.55;
  return 0.62;
}

function triggerRebuild() {
  needsRebuild = true;
  if (isWorkerBusy) return;
  if (rebuildTimeout) clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(runRebuild, 80);
}

async function runRebuild() {
  if (!needsRebuild) return;
  needsRebuild = false;
  isWorkerBusy = true;
  showStatus('กำลังสร้างโมเดล 3D...');

  try {
    const [font, fallbackFont] = await Promise.all([
      getFont(state.font),
      getFont('icon-fallback').catch(() => null)
    ]);

    const gap = 2 * (state.holeDia / 2 + state.ringThickness) + 2;
    const line2Sz = state.size * state.line2Scale;
    // User's Line spacing slider scales the font's natural default.
    const lineFactor = baseLineFactor(state.font) * state.lineSpacing;

    const res = state.layout === 'vertical'
      ? getVerticalContours(font, fallbackFont, state.name, state.size, state.lineSpacing, state.letterSpacing)
      : getHorizontalContours(font, fallbackFont, state.name, state.secondLine, state.size, line2Sz, gap, state.line2Align, lineFactor, state.letterSpacing);

    worker.postMessage({
      type: 'build',
      textContours: res.contours,
      params: {
        name: state.name,
        secondLine: state.secondLine,
        font: state.font,
        layout: state.layout,
        style: state.style,
        size: state.size,
        line2Scale: state.line2Scale,
        baseThickness: state.baseThickness,
        textThickness: state.textThickness,
        outlineWidth: state.outlineWidth,
        smoothing: state.smoothing,
        ringStyle: state.ringStyle,
        holeDia: state.holeDia,
        ringThickness: state.ringThickness,
        ringPosX: state.ringPosX,
        ringPosY: state.ringPosY,
        ringAngle: state.ringAngle,
        haloWidth: state.haloWidth,
        haloThickness: state.haloThickness,
        colorScheme: state.colorScheme,
        plateColor: state.plate,
        haloColor: state.halo,
        textColor: state.text,
        plateShape: state.plateShape,
        lineSpacing: state.lineSpacing,
        letterSpacing: state.letterSpacing,
        boldness: state.boldness,
        chamfer: state.chamferOn ? state.chamfer : 0,
        printMode: state.printMode,
        layerHeight: state.layerHeight,
        lines: res.lines,
      },
    });
  } catch (e) {
    console.error(e);
    isWorkerBusy = false;
    hideStatus();
    toast(e instanceof Error ? e.message : 'Error preparing geometry', { kind: 'error' });
  }
}

// ---------------------------------------------------------------------------
// UI Setup & Rendering
// ---------------------------------------------------------------------------
function colorField(label: string, value: string, onInput: (value: string) => void): HTMLElement {
  const input = el('input', { attrs: { type: 'color', value, 'aria-label': label } });
  input.addEventListener('input', () => onInput(input.value));
  return el('label', { className: 'nk-color' }, [el('span', { text: label }), input]);
}

// ---------------------------------------------------------------------------
// Controls & Dynamic Visibility
// ---------------------------------------------------------------------------
const ringAngleSlider = sliderRow({
  label: 'หมุนห่วง', min: -180, max: 180, step: 5, value: state.ringAngle, unit: '°',
  help: 'ปรับองศาห่วงของพวงกุญแจ',
  onInput: (v) => { state.ringAngle = v; triggerRebuild(); }
});

const holeDpad = dpad({
  readout: `X: ${state.ringPosX.toFixed(1)} mm, Y: ${state.ringPosY.toFixed(1)} mm`,
  rotateStep: 5,
  onMove: (dir) => {
    const step = 0.5;
    if (dir === 'up') state.ringPosY += step;
    else if (dir === 'down') state.ringPosY -= step;
    else if (dir === 'left') state.ringPosX -= step;
    else if (dir === 'right') state.ringPosX += step;
    holeDpad.setReadout(`X: ${state.ringPosX.toFixed(1)} mm, Y: ${state.ringPosY.toFixed(1)} mm`);
    triggerRebuild();
  },
  onRotate: (deltaDeg) => {
    let next = ((state.ringAngle ?? 0) + deltaDeg);
    if (next > 180) next -= 360;
    if (next < -180) next += 360;
    state.ringAngle = next;
    holeDpad.setReadout(`X: ${state.ringPosX.toFixed(1)} mm, Y: ${state.ringPosY.toFixed(1)} mm`);
    triggerRebuild();
  },
  onReset: () => {
    state.ringPosX = 0;
    state.ringPosY = 0;
    state.ringAngle = 0;
    holeDpad.setReadout(`X: 0.0 mm, Y: 0.0 mm`);
    triggerRebuild();
  }
});

const line2ScaleSlider = sliderRow({
  label: 'ขนาดบรรทัดที่สอง',
  min: 0.3,
  max: 1.5,
  step: 0.1,
  value: state.line2Scale,
  onInput: (v) => { state.line2Scale = v; triggerRebuild(); }
});

const line2AlignControl = segmentedControl<'left' | 'center' | 'right'>({
  value: state.line2Align,
  options: [
    { value: 'left', label: 'ซ้าย' },
    { value: 'center', label: 'กลาง' },
    { value: 'right', label: 'ขวา' },
  ],
  onChange: (v) => { state.line2Align = v; triggerRebuild(); }
});

const haloWidthSlider = sliderRow({
  label: 'ความหนาขอบสี',
  min: 0.2,
  max: 4.0,
  step: 0.1,
  value: state.haloWidth,
  unit: 'mm',
  help: 'ความหนาของเส้นขอบสีรอบตัวอักษร',
  onInput: (v) => { state.haloWidth = v; triggerRebuild(); }
});

const haloThicknessSlider = sliderRow({
  label: 'ความสูงขอบสี',
  min: 0.2,
  max: 2.0,
  step: 0.1,
  value: state.haloThickness,
  unit: 'mm',
  help: 'ความสูงของขอบสี',
  onInput: (v) => { state.haloThickness = v; refreshNoAmsReadout(); triggerRebuild(); }
});

// --- Typography ---
const boldnessSlider = sliderRow({
  label: 'ความหนาตัวอักษร',
  min: -0.3, max: 0.7, step: 0.05, value: state.boldness, unit: 'mm',
  help: 'ปรับความหนาของตัวอักษร',
  onInput: (v) => { state.boldness = v; triggerRebuild(); },
});

const letterSpacingSlider = sliderRow({
  label: 'ระยะห่างตัวอักษร',
  min: -0.08, max: 0.4, step: 0.02, value: state.letterSpacing,
  format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`,
  help: 'ปรับระยะห่างระหว่างตัวอักษร',
  onInput: (v) => { state.letterSpacing = v; triggerRebuild(); },
});

const lineSpacingSlider = sliderRow({
  label: 'ระยะห่างบรรทัด',
  min: 0.5, max: 1.8, step: 0.05, value: state.lineSpacing,
  format: (v) => `${Math.round(v * 100)}%`,
  help: 'ระยะห่างระหว่างบรรทัดแรกและบรรทัดที่สอง',
  onInput: (v) => { state.lineSpacing = v; triggerRebuild(); },
});

// --- Edge finish ---
const chamferSlider = sliderRow({
  label: 'ลบมุมขอบ (Chamfer)',
  min: 0.15, max: 1.0, step: 0.05, value: state.chamfer, unit: 'mm',
  help: 'ขนาดการลบมุมที่ขอบของพวงกุญแจ',
  onInput: (v) => { state.chamfer = v; triggerRebuild(); },
});
const chamferToggle = toggleSwitch({
  label: 'ลบมุมขอบ',
  checked: state.chamferOn,
  help: 'ลบมุมขอบด้านบนของพวงกุญแจให้ดูมนขึ้น',
  onChange: (val) => { state.chamferOn = val; updateControlsVisibility(); triggerRebuild(); },
});

// Edge smoothing lives up top (not in Advanced): it's the fix when a font's letters
// come out visually disconnected — raise it to fuse them into one solid plate.
const smoothingSlider = sliderRow({
  label: 'ความเรียบเนียนของขอบ', min: 0.0, max: 4.0, step: 0.5, value: state.smoothing, unit: 'mm',
  help: 'ช่วยอุดช่องโหว่ระหว่างตัวอักษร หากตัวอักษรดูขาดจากกัน ให้เพิ่มค่านี้จนกว่าชิ้นงานจะติดกัน',
  onInput: (v) => { state.smoothing = v; triggerRebuild(); },
});

// --- Print mode (AMS vs manual filament swap) ---
const noAmsReadout = el('p', { className: 'nk-hint nk-noams-readout' });
function refreshNoAmsReadout() {
  const pauses = noAmsPauses({
    colorScheme: state.colorScheme,
    style: state.style,
    baseThickness: state.baseThickness,
    haloThickness: state.haloThickness,
    layerHeight: state.layerHeight,
  });
  if (state.printMode !== 'noams') {
    noAmsReadout.textContent = 'เครื่องจะสลับสีให้อัตโนมัติในแต่ละเลเยอร์';
  } else if (pauses.length === 0) {
    noAmsReadout.textContent = 'หากต้องการให้เครื่องหยุดเพื่อสลับสีเอง ต้องเลือกมากกว่า 1 สี';
  } else {
    noAmsReadout.textContent =
      'เครื่องจะหยุดรอให้คุณเปลี่ยนสีเส้นพลาสติกที่ความสูง: ' + pauses.map((p) => `${p.z.toFixed(1)} mm → ${p.label}`).join(', ') + '.';
  }
}
const printModeControl = segmentedControl<'ams' | 'noams'>({
  value: state.printMode,
  options: [
    { value: 'ams', label: 'พิมพ์อัตโนมัติ (AMS)' },
    { value: 'noams', label: 'เปลี่ยนสีเอง (Manual)' },
  ],
  onChange: (v) => { state.printMode = v; updateControlsVisibility(); refreshNoAmsReadout(); triggerRebuild(); },
});

const plateColorField = colorField('แผ่นฐาน', state.plate, (value) => {
  state.plate = value;
  if (viewer) viewer.setPartColor('plate', value);
  triggerRebuild();
});
const haloColorField = colorField('ขอบ', state.halo, (value) => {
  state.halo = value;
  if (viewer) viewer.setPartColor('halo', value);
  triggerRebuild();
});
const textColorField = colorField('ข้อความ', state.text, (value) => {
  state.text = value;
  if (viewer) viewer.setPartColor('text', value);
  triggerRebuild();
});

function updateControlsVisibility() {
  const line2Visible = state.secondLine.trim() !== '' && state.layout === 'horizontal';
  line2ScaleSlider.classList.toggle('hidden', !line2Visible);
  line2AlignControl.classList.toggle('hidden', !line2Visible);

  // Line spacing matters when there are two horizontal lines, or a vertical stack.
  const lineSpacingVisible = line2Visible || state.layout === 'vertical';
  lineSpacingSlider.classList.toggle('hidden', !lineSpacingVisible);

  const haloVisible = state.colorScheme === 'plate-halo-text';
  haloWidthSlider.classList.toggle('hidden', !haloVisible);
  haloThicknessSlider.classList.toggle('hidden', !haloVisible);

  haloColorField.classList.toggle('hidden', state.colorScheme !== 'plate-halo-text');
  textColorField.classList.toggle('hidden', state.colorScheme === 'single');

  chamferSlider.classList.toggle('hidden', !state.chamferOn);

  // No-AMS only applies to raised multicolour prints.
  const noAmsApplies = state.style === 'raised' && state.colorScheme !== 'single';
  printModeControl.classList.toggle('hidden', !noAmsApplies);
  noAmsReadout.classList.toggle('hidden', !noAmsApplies);
  refreshNoAmsReadout();
}

function fontSampleText(): string {
  const t = state.name.trim() || 'Aa';
  return t.length > 8 ? t.slice(0, 7) + '…' : t;
}

function getRequiredSubsets(text: string): string[] {
  const subsets = new Set<string>();
  for (const char of text) {
    const code = char.charCodeAt(0);
    if ((code >= 0x0400 && code <= 0x04FF) || (code >= 0x0500 && code <= 0x052F)) subsets.add('cyrillic');
    else if (code >= 0x0370 && code <= 0x03FF) subsets.add('greek');
    else if (code >= 0x0100 && code <= 0x024F) subsets.add('latin-ext');
  }
  return Array.from(subsets);
}

function isFontSupported(font: FontChoice, text: string): boolean {
  if (!font.subsets) return true;
  const required = getRequiredSubsets(text);
  return required.every(req => font.subsets.includes(req) || font.subsets.includes(`${req}-ext`));
}

function makeFontCard(font: FontChoice): HTMLButtonElement {
  const text = state.name + (state.secondLine || '');
  const supported = isFontSupported(font, text);

  const btn = el('button', {
    className: `nk-font-card${supported ? '' : ' unsupported'}`,
    attrs: { type: 'button', 'data-font': font.id, title: supported ? font.label : `${font.label} (Characters missing)` },
  }, [
    el('span', { className: 'nk-font-card__sample', text: fontSampleText(), attrs: { style: `font-family: NK-${font.id}` } }),
    el('span', { className: 'nk-font-card__name', text: font.label }),
    ...(!supported ? [el('span', { className: 'nk-font-card__warn', text: '⚠' })] : [])
  ]) as HTMLButtonElement;
  btn.addEventListener('click', () => selectFont(font.id));
  return btn;
}

// Curated cards; the active font is pinned first when it isn't one of them
// (e.g. chosen from the Browse-all modal) so the grid always shows the selection.
function renderFontGrid() {
  fontGrid.replaceChildren();
  const active = FONTS.find((f) => f.id === state.font);
  if (active && !active.curated) fontGrid.append(makeFontCard(active));
  for (const font of curatedFonts) fontGrid.append(makeFontCard(font));
  updateActiveFont();
}

function updateActiveFont() {
  const sample = fontSampleText();
  const text = state.name + (state.secondLine || '');
  for (const btn of fontGrid.querySelectorAll<HTMLButtonElement>('button')) {
    const fontId = btn.dataset.font!;
    const font = FONTS.find(f => f.id === fontId);
    if (font) {
      const supported = isFontSupported(font, text);
      btn.classList.toggle('unsupported', !supported);
      btn.title = supported ? font.label : `${font.label} (Characters missing)`;
      const warn = btn.querySelector('.nk-font-card__warn');
      if (!supported && !warn) {
        btn.append(el('span', { className: 'nk-font-card__warn', text: '⚠' }));
      } else if (supported && warn) {
        warn.remove();
      }
    }

    btn.classList.toggle('active', fontId === state.font);
    const s = btn.querySelector('.nk-font-card__sample');
    if (s) s.textContent = sample;
  }
}

function selectFont(id: string) {
  state.font = id;
  renderFontGrid();
  triggerRebuild();
}

// "Browse all fonts" — a searchable, category-filterable modal with a live
// preview rendered in each font (the current name, or "Sample").
function openFontBrowser() {
  let search = '';
  let cat = 'All';
  const categories = ['All', ...Array.from(new Set(FONTS.map((f) => f.category))).sort()];

  const searchInput = el('input', {
    className: 'nk-fb__search',
    attrs: { type: 'search', placeholder: `Search ${FONTS.length} fonts…`, 'aria-label': 'Search fonts' },
  }) as HTMLInputElement;
  const chips = el('div', { className: 'nk-fb__chips' });
  const list = el('div', { className: 'nk-fb__list' });

  // Lazy-load each row's font only as it scrolls into view — avoids fetching
  // all bundled fonts at once when the modal opens.
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const row = entry.target as HTMLElement;
      const preview = row.querySelector<HTMLElement>('.nk-fb__preview');
      if (preview) preview.style.fontFamily = `NK-${row.dataset.font}`;
      io.unobserve(row);
    }
  }, { root: list, rootMargin: '250px' });

  const sampleText = () => {
    const t = state.name.trim();
    return t ? (t.length > 14 ? t.slice(0, 14) : t) : 'Sample';
  };

  function render() {
    io.disconnect();
    list.replaceChildren();
    const q = search.trim().toLowerCase();
    const matches = FONTS.filter((f) =>
      (cat === 'All' || f.category === cat) &&
      (!q || f.label.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)),
    );
    if (!matches.length) {
      list.append(el('p', { className: 'nk-fb__empty', text: `No fonts match “${search.trim()}”.` }));
      return;
    }
    const sample = sampleText();
    matches.forEach((f, i) => {
      const preview = el('span', { className: 'nk-fb__preview', text: sample });
      // Eager-load the first screenful; lazy-load the rest as they scroll in.
      if (i < 36) preview.style.fontFamily = `NK-${f.id}`;
      const supported = isFontSupported(f, state.name + (state.secondLine || ''));
      const row = el('button', {
        className: `nk-fb__row${f.id === state.font ? ' active' : ''}${supported ? '' : ' unsupported'}`,
        attrs: { type: 'button', 'data-font': f.id, title: supported ? f.label : `${f.label} (Characters missing)` },
      }, [
        preview,
        el('span', { className: 'nk-fb__meta' }, [
          el('span', { className: 'nk-fb__name', text: f.label }),
          el('span', { className: 'nk-fb__cat', text: f.category }),
          ...(!supported ? [el('span', { className: 'nk-fb__warn', text: '⚠' })] : [])
        ]),
      ]);
      row.addEventListener('click', () => { selectFont(f.id); handle.close(); });
      list.append(row);
      if (i >= 36) io.observe(row);
    });
  }

  for (const c of categories) {
    const chip = el('button', { className: `nk-fb__chip${c === cat ? ' active' : ''}`, text: c, attrs: { type: 'button' } });
    chip.addEventListener('click', () => {
      cat = c;
      for (const other of chips.querySelectorAll('button')) other.classList.toggle('active', other === chip);
      render();
    });
    chips.append(chip);
  }
  searchInput.addEventListener('input', () => { search = searchInput.value; render(); });

  const content = el('div', { className: 'nk-fontmodal' }, [searchInput, chips, list]);
  const handle = dialog({ title: 'Choose a font', content });
  render();
  searchInput.focus();
}

async function handleExport(formatId: string) {
  if (formatId === '3mf') {
    if (!lastParts.length) throw new Error('No 3D geometry generated yet.');
    const fn = `${state.name.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'name'}-keychain.3mf`;
    downloadThreeMF(lastParts, fn);
    toast('✓ ส่งออก 3MF สำเร็จ', { kind: 'ok' });
  } else if (formatId === 'stl') {
    toast('ไฟล์ STL ถูกบีบอัดรวมไว้ในไฟล์ 3MF แล้ว หากต้องการแยกแผ่น ให้เปิดไฟล์ 3MF ในโปรแกรม Slicer ของคุณ', { kind: 'warn' });
  }
}

nameInput.addEventListener('input', () => {
  state.name = nameInput.value || 'Name';
  updateActiveFont();
  triggerRebuild();
});
secondInput.addEventListener('input', () => {
  state.secondLine = secondInput.value;
  updateControlsVisibility();
  triggerRebuild();
});

const browseFontsBtn = el('button', {
  className: 'nk-browse-fonts',
  text: `ดูฟอนต์ทั้งหมด (${FONTS.length} ฟอนต์) →`,
  attrs: { type: 'button' },
});
browseFontsBtn.addEventListener('click', openFontBrowser);

const importFontBtn = el('button', {
  className: 'nk-browse-fonts',
  text: `นำเข้าฟอนต์ของคุณเอง (.ttf/.otf/.zip)`,
  attrs: { type: 'button', style: 'margin-top: 8px;' },
});
const fileInput = el('input', {
  attrs: { type: 'file', accept: '.ttf,.otf,.zip', style: 'display: none;' }
});
importFontBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const rawBuffer = await file.arrayBuffer();
    const isZip = file.name.toLowerCase().endsWith('.zip');
    
    const filesToProcess: { name: string; buffer: ArrayBuffer }[] = [];

    if (isZip) {
      const unzipped = unzipSync(new Uint8Array(rawBuffer));
      for (const [name, data] of Object.entries(unzipped)) {
        if (!name.endsWith('/') && (name.toLowerCase().endsWith('.ttf') || name.toLowerCase().endsWith('.otf'))) {
          const cleanName = name.split('/').pop() || name;
          const arrayBuf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          filesToProcess.push({ name: cleanName, buffer: arrayBuf });
        }
      }
      if (filesToProcess.length === 0) {
        toast('No .ttf or .otf files found in the zip.', { kind: 'error' });
        (e.target as HTMLInputElement).value = '';
        return;
      }
    } else {
      filesToProcess.push({ name: file.name, buffer: rawBuffer });
    }

    let lastFontId = '';
    let count = 0;

    for (const f of filesToProcess) {
      try {
        const fontName = f.name.replace(/\.[^/.]+$/, "");
        const font = opentype.parse(f.buffer);
        const fontId = `custom-${Date.now()}-${count++}`;
        
        fontCache.set(fontId, font);
        
        const fontFileBlob = new Blob([f.buffer]);
        const fontUrl = URL.createObjectURL(fontFileBlob);
        const style = document.createElement('style');
        style.textContent = `@font-face { font-family: 'NK-${fontId}'; src: url('${fontUrl}'); }`;
        document.head.appendChild(style);
        
        const fontChoice = {
          id: fontId,
          label: fontName,
          category: 'Custom',
          curated: true,
          subsets: ['latin', 'latin-ext', 'cyrillic', 'greek']
        };
        
        FONTS.unshift(fontChoice);
        curatedFonts.unshift(fontChoice);
        
        lastFontId = fontId;
      } catch (err) {
        console.error(`Failed to load font ${f.name}:`, err);
      }
    }

    if (count > 0) {
      selectFont(lastFontId);
      toast(`Imported ${count} font${count !== 1 ? 's' : ''}`, { kind: 'ok' });
    } else {
      toast('Failed to load any fonts from the file.', { kind: 'error' });
    }
  } catch (err) {
    console.error(err);
    toast('Failed to process file. Make sure it is a valid TTF, OTF or ZIP file.', { kind: 'error' });
  }
  
  (e.target as HTMLInputElement).value = '';
});

// Advanced tuning.
const advanced = el('div', { className: 'vl-section nk-advanced' }, [
  el('p', { className: 'vl-label', text: 'ขั้นสูง (ปรับละเอียด)' }),
  el('div', { className: 'nk-advanced__body' }, [
    sliderRow({
      label: 'ความสูงตัวอักษร', min: 0.6, max: 4.0, step: 0.2, value: state.textThickness, unit: 'mm',
      onInput: (v) => { state.textThickness = v; triggerRebuild(); },
    }),
    sliderRow({
      label: 'ความกว้างของขอบ', min: 0.5, max: 6.0, step: 0.1, value: state.outlineWidth, unit: 'mm',
      help: 'ขนาดความกว้างของแผ่นฐานที่จะยื่นออกมาจากตัวอักษร',
      onInput: (v) => { state.outlineWidth = v; triggerRebuild(); },
    }),
    sliderRow({
      label: 'ความหนาของแผ่นฐาน', min: 1.0, max: 4.0, step: 0.2, value: state.baseThickness, unit: 'mm',
      help: 'ความหนารวมของแผ่นฐานด้านหลังตัวอักษร',
      onInput: (v) => { state.baseThickness = v; refreshNoAmsReadout(); triggerRebuild(); },
    }),
    sliderRow({
      label: 'ความหนาของห่วง', min: 1.0, max: 6.0, step: 0.2, value: state.ringThickness, unit: 'mm',
      help: 'ขนาดความหนาของเนื้อพลาสติกรอบๆ รูพวงกุญแจ',
      onInput: (v) => { state.ringThickness = v; triggerRebuild(); },
    }),
    haloWidthSlider,
    haloThicknessSlider,
  ]),
]);

// Dismissable "best print quality" callout — returns null once the user has closed it.
const qualityCard = qualityCallout({
  html: 'For the best quality printed keychain, please use the print profile and instructions available on <a href="https://makerworld.com/en/@Vostok_Labs" target="_blank" rel="noopener">MakerWorld</a>.',
  storageKey: 'nk-quality-callout',
});

const controlsScroll = el('div', { className: 'vl-panel__scroll' }, [
  generatorHeader({
    title: 'เครื่องมือสร้างพวงกุญแจชื่อ',
    description: 'ออกแบบพวงกุญแจชื่อของคุณเอง พร้อมดูตัวอย่างสีและฟอนต์แบบเรียลไทม์',
  }),
  ...(qualityCard ? [qualityCard] : []),
  // Text
  el('div', { className: 'vl-section' }, [
    el('p', { className: 'vl-label', text: 'ข้อความ' }),
    nameInput,
    secondInput,
    emojiToggle,
    emojiGrid,
    line2AlignControl,
  ]),

  // Layout & style
  el('div', { className: 'vl-section' }, [
    el('p', { className: 'vl-label', text: 'รูปแบบและสไตล์' }),
    segmentedControl<Layout>({
      label: 'รูปแบบการจัดวาง',
      help: 'แนวนอน (เรียงต่อกัน) หรือ แนวตั้ง (เรียงซ้อนกัน)',
      value: state.layout,
      options: [{ value: 'horizontal', label: 'แนวนอน' }, { value: 'vertical', label: 'แนวตั้ง' }],
      onChange: (value) => { state.layout = value; updateControlsVisibility(); triggerRebuild(); }
    }),
    segmentedControl<LetterStyle>({
      label: 'สไตล์ตัวอักษร',
      help: 'นูน = ตัวอักษรนูนขึ้นมาจากแผ่นฐาน, ฝัง = ตัวอักษรฝังลงไปในแผ่นฐาน',
      value: state.style,
      options: [{ value: 'raised', label: 'ตัวนูน' }, { value: 'engraved', label: 'ตัวฝัง' }],
      onChange: (value) => { state.style = value; updateControlsVisibility(); triggerRebuild(); }
    }),
    segmentedControl<'outline' | 'rectangle'>({
      label: 'รูปทรงแผ่นฐาน',
      help: 'เข้ารูป = ตัดขอบตามรูปทรงตัวอักษร, สี่เหลี่ยม = สี่เหลี่ยมขอบมน',
      value: state.plateShape,
      options: [{ value: 'outline', label: 'เข้ารูป' }, { value: 'rectangle', label: 'สี่เหลี่ยม' }],
      onChange: (value) => { state.plateShape = value; triggerRebuild(); }
    }),
    smoothingSlider,
    chamferToggle,
    chamferSlider,
  ]),

  // Typography
  el('div', { className: 'vl-section' }, [
    el('p', { className: 'vl-label', text: 'ตั้งค่าตัวอักษร' }),
    boldnessSlider,
    letterSpacingSlider,
    lineSpacingSlider,
    line2ScaleSlider,
  ]),

  // Colours
  el('div', { className: 'vl-section' }, [
    el('p', { className: 'vl-label', text: 'สี' }),
    selectField({
      label: 'รูปแบบสี',
      help: 'สีเดียว = ใช้พลาสติกสีเดียว, 2 สี = เพิ่มสีตัวอักษร, 3 สี = เพิ่มเส้นขอบรอบตัวอักษร',
      value: state.colorScheme,
      options: [
        { value: 'single', label: 'สีเดียว' },
        { value: 'plate-text', label: '2 สี (แผ่นฐาน + ตัวอักษร)' },
        { value: 'plate-halo-text', label: '3 สี (แผ่นฐาน + ตัวอักษร + ขอบ)' },
      ],
      onChange: (value) => {
        state.colorScheme = value as 'single' | 'plate-text' | 'plate-halo-text';
        state.haloOn = value === 'plate-halo-text';
        updateControlsVisibility();
        triggerRebuild();
      }
    }),
    el('div', { className: 'nk-colors' }, [
      plateColorField,
      haloColorField,
      textColorField,
    ]),
  ]),

  // Size & keyring
  el('div', { className: 'vl-section' }, [
    el('p', { className: 'vl-label', text: 'ขนาด & พวงกุญแจ' }),
    sliderRow({
      label: 'ขนาดตัวอักษร', min: 10, max: 28, value: state.size, unit: 'mm',
      onInput: (value) => { state.size = value; triggerRebuild(); }
    }),
    segmentedControl<'loop' | 'corner'>({
      label: 'รูปแบบห่วง',
      help: 'ห่วงยื่น = สร้างห่วงยื่นออกมาด้านข้าง, เจาะรู = เจาะรูที่มุมของพวงกุญแจ',
      value: state.ringStyle,
      options: [{ value: 'loop', label: 'ห่วงยื่น' }, { value: 'corner', label: 'เจาะรู' }],
      onChange: (val) => { state.ringStyle = val; triggerRebuild(); }
    }),
    sliderRow({
      label: 'ขนาดรูห่วง', min: 2.0, max: 8.0, step: 0.5, value: state.holeDia, unit: 'mm',
      help: 'ขนาดเส้นผ่านศูนย์กลางของรูห่วง',
      onInput: (v) => { state.holeDia = v; triggerRebuild(); }
    }),
    ringAngleSlider,
    el('div', { className: 'nk-nudge' }, [
      el('span', { className: 'vl-hint', text: 'ปรับตำแหน่งห่วง' }),
      holeDpad.root,
    ]),
  ]),

  // Advanced (collapsed)
  advanced,

  // Reset everything to defaults (reloads at the clean URL so every control resets).
  el('div', { className: 'vl-section nk-reset-section' }, [
    el('button', {
      className: 'vl-btn vl-btn--secondary nk-reset-btn',
      text: 'คืนค่าเริ่มต้นทั้งหมด',
      attrs: { type: 'button' },
      on: {
        click: () => {
          if (window.confirm('ต้องการคืนค่าเริ่มต้นทั้งหมดหรือไม่? การออกแบบปัจจุบันจะถูกลบ')) {
            window.location.href = window.location.pathname;
          }
        },
      },
    }),
  ]),
]);

const controls = el('aside', { className: 'vl-panel vl-panel--left' }, [
  controlsScroll
]);

// Right column = pick the font (the "source" of the look), then export.
const controlsRightScroll = el('div', { className: 'vl-panel__scroll nk-font-section-scroll' }, [
  el('div', { className: 'vl-section nk-font-section' }, [
    el('p', { className: 'vl-label', text: 'ฟอนต์' }),
    fontGrid,
    browseFontsBtn,
    importFontBtn,
    fileInput,
  ]),
]);

const controlsRightExport = sidebarFooter({
  formats: [{ id: '3mf', label: '3MF' }],
  onExport: handleExport,
  onSave: () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.name.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'keychain'}-project.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('บันทึกโปรเจกต์สำเร็จ', { kind: 'ok' });
  },
  onLoad: (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = JSON.parse(reader.result as string);
        Object.assign(state, loaded);
        nameInput.value = state.name;
        secondInput.value = state.secondLine;
        holeDpad.setReadout(`X: ${state.ringPosX.toFixed(1)} mm, Y: ${state.ringPosY.toFixed(1)} mm`);
        updateControlsVisibility();
        renderFontGrid();
        triggerRebuild();
        toast('โหลดโปรเจกต์สำเร็จ', { kind: 'ok' });
      } catch {
        toast('ไฟล์โปรเจกต์ไม่ถูกต้อง', { kind: 'error' });
      }
    };
    reader.readAsText(file);
  },
  onHelp: () => {
    dialog({
      title: 'คำแนะนำการใช้งาน',
      content: el('div', {}, [
        el('p', { text: 'พิมพ์ชื่อในหัวข้อ "ข้อความ" เลือกฟอนต์ที่คุณชอบจากแผงด้านขวา และปรับแต่งสไตล์ สี หรือขนาดของพวงกุญแจได้ตามต้องการ' }),
        el('p', { text: 'เมื่อคุณพอใจกับรูปแบบแล้ว ให้กดปุ่ม ส่งออก (Export) เพื่อดาวน์โหลดไฟล์ 3MF นำไฟล์ 3MF นี้ไปเปิดในโปรแกรม Slicer (เช่น Bambu Studio, Orca, PrusaSlicer) เพื่อสั่งพิมพ์ได้เลย' }),
        el('p', { text: 'คุณสามารถกด บันทึกโปรเจกต์ เพื่อเก็บการตั้งค่าไว้ทำต่อในครั้งหน้าได้' }),
      ]),
      actions: [{ label: 'เข้าใจแล้ว', primary: true }],
    });
  },
  themeStorageKey: 'name-keychain-theme',
});

const controlsRight = el('aside', { className: 'vl-panel vl-panel--right' }, [
  controlsRightScroll,
  controlsRightExport
]);

stage.className = 'vl-stage nk-stage';
stage.append(
  el('p', { className: 'vl-stage__label', text: 'ตัวอย่าง 3D แบบเรียลไทม์' }),
  statusEl,
  el('p', { className: 'vl-stage__hint', text: 'คลิกซ้ายค้างเพื่อหมุน, คลิกขวาเพื่อเลื่อน, เลื่อนลูกกลิ้งเมาส์เพื่อซูม' })
);

app.append(el('main', { className: 'vl-app', attrs: { style: 'position: relative;' } }, [
  topbarLinks({
    githubUrl: BRAND.urls.github,
    boostUrl: BRAND.urls.makerworld,
    themeToggle: false,
    themeStorageKey: 'name-keychain-theme'
  }),
  controls,
  stage,
  controlsRight
]));

// Update controls on shared preset load
if (shared) {
  nameInput.value = state.name;
  secondInput.value = state.secondLine;
  holeDpad.setReadout(`X: ${state.ringPosX.toFixed(1)} mm, Y: ${state.ringPosY.toFixed(1)} mm`);
}

// Initialize 3D Viewer
const viewer = createViewer(stage);
renderFontGrid();
updateControlsVisibility();

// Update theme changes
const observer = new MutationObserver(() => {
  const theme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
  viewer.setTheme(theme);
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// Setup worker message handling
worker.onmessage = (e: MessageEvent<GeometryResponse>) => {
  const msg = e.data;
  if (msg.type === 'ready') {
    isWorkerBusy = false;
    triggerRebuild();
    return;
  }
  if (msg.type === 'parts') {
    lastParts = msg.parts;
    viewer.setParts(msg.parts, true);
    hideStatus();
    isWorkerBusy = false;
    if (needsRebuild) runRebuild();
    return;
  }
  if (msg.type === 'error') {
    console.error(msg.message);
    hideStatus();
    isWorkerBusy = false;
    toast(msg.message, { kind: 'error' });
    return;
  }
};

worker.postMessage({ type: 'init' });

// Show What's New dialog once
if (!localStorage.getItem('nk_whats_new_v3')) {
  localStorage.setItem('nk_whats_new_v3', '1');
  dialog({
    title: 'What\'s New!',
    content: el('div', { attrs: { style: 'display: flex; flex-direction: column; gap: 16px; margin-top: 8px;' } }, [
      el('div', {}, [
        el('strong', { text: 'Custom Font Import' }),
        el('p', { text: 'You can now import your own .ttf or .otf files directly into the generator using the new "Import custom font" button.', attrs: { style: 'margin-top: 4px; line-height: 1.4;' } })
      ]),
      el('div', {}, [
        el('strong', { text: 'Cyrillic & Non-English Support' }),
        el('p', { text: 'Fonts with non-English characters are now fully supported. Unsupported fonts are automatically dimmed in the preview panel so you know exactly what works.', attrs: { style: 'margin-top: 4px; line-height: 1.4;' } })
      ]),
      el('div', {}, [
        el('strong', { text: 'Solid Icon Symbols' }),
        el('p', { text: 'You can now insert dozens of solid FontAwesome symbols directly into your keychains using the "Insert Symbol" button! They scale perfectly and extrude into solid 3D plastic.', attrs: { style: 'margin-top: 4px; line-height: 1.4;' } })
      ]),
    ]),
    actions: [{ label: 'Awesome!', primary: true }],
  });
}
