import '@vostok/ui-kit/styles.css';
import './style.css';

import {
  el,
  toast,
  topbarLinks,
  segmentedControl,
  sliderRow,
  dpad,
  dialog,
  generatorHeader,
  qualityCallout,
  sidebarFooter,
  selectField,
  appShell,
  globalControlResets
} from '@vostok/ui-kit';
import { BRAND } from '@vostok/brand';
import { createViewer } from './viewer/viewer';
import { downloadThreeMF } from './export/threemfExport';
import type { GeometryResponse, PartMesh, RegionSet } from './types';
import { processImageToRegions } from './imageProcessor';
import { noAmsPauses } from './geometry/noAms';

const state = {
  size: 50, // width in mm
  style: 'engraved' as 'raised' | 'engraved',
  plateShape: 'outline' as 'outline' | 'rectangle',
  baseThickness: 2.0,
  imageThickness: 1.6,
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
  image: '#f2f4f8',
  haloOn: true,
  colorScheme: 'plate-halo-image' as 'single' | 'plate-image' | 'plate-halo-image',
  boldness: 0,
  chamferOn: true,
  chamfer: 0.4,
  printMode: 'ams' as 'ams' | 'noams',
  layerHeight: 0.2,

  // Image specific
  imageSmoothing: 0.5,
  colorCount: 4,
  removeBg: true,
  colorBleed: 0.15,
};

let uploadedFile: File | null = null;
const defaultStar: [number, number][] = [
  [0, -0.50], [0.14, -0.20], [0.47, -0.15], [0.23, 0.08], [0.29, 0.40],
  [0, 0.25], [-0.29, 0.40], [-0.23, 0.08], [-0.47, -0.15], [-0.14, -0.20]
].reverse() as [number, number][];

let currentRegionSet: RegionSet | null = {
  aspect: 1,
  outline: [defaultStar],
  regions: [
    {
      quantRgb: [255, 255, 255],
      coverage: 1,
      components: [{ rings: [defaultStar], coverage: 1 }]
    }
  ]
};
let currentImageWidth = 1;
let currentImageHeight = 1;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

const fileInput = el('input', { attrs: { type: 'file', accept: 'image/*,.svg,.png,.jpg,.jpeg,.webp', style: 'display: none' } });
const dropIconStr = `<svg class="drop-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;
const dropZone = el('div', { className: 'drop' });
dropZone.innerHTML = `${dropIconStr}<div class="drop-title">เลือกรูปภาพ</div><div class="drop-text">ลากและวางรูปภาพที่นี่ หรือ<u>คลิกเพื่อเลือก</u></div>`;
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('over');
  const file = e.dataTransfer?.files?.[0];
  if (file) handleFileSelected(file);
});

const previewImg = el('img', { attrs: { style: 'width: 100%; height: auto; max-height: 180px; border-radius: 8px; border: 1px dashed var(--border); display: none; object-fit: contain; padding: 4px; background: rgba(0,0,0,0.1); cursor: pointer;' } }) as HTMLImageElement;
previewImg.title = 'คลิกเพื่อเปลี่ยนรูป';
previewImg.addEventListener('click', () => fileInput.click());

const changeImgBtn = el('button', {
  className: 'nk-btn-change-img',
  text: '🔄 เปลี่ยนรูปภาพ',
  attrs: { type: 'button', style: 'display: none; width: 100%; margin-bottom: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2, rgba(255,255,255,0.06)); color: var(--fg); cursor: pointer; font-size: 13px;' }
}) as HTMLButtonElement;
changeImgBtn.addEventListener('click', () => fileInput.click());


const statusEl = el('div', { className: 'nk-status show', text: 'กรุณาอัปโหลดรูปภาพ...' });
const stage = el('section', { className: 'nk-stage', attrs: { style: 'position: relative; flex: 1; height: 100%;' } });

function showStatus(txt: string) {
  statusEl.textContent = txt;
  statusEl.classList.add('show');
}
function hideStatus() {
  statusEl.classList.remove('show');
}

fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleFileSelected(file);
  (e.target as HTMLInputElement).value = '';
});

async function handleFileSelected(file: File) {
  uploadedFile = file;
  previewImg.src = URL.createObjectURL(file);
  previewImg.style.display = 'block';
  changeImgBtn.style.display = 'block';
  dropZone.style.display = 'none';
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  colorCountSlider.classList.toggle('hidden', isSvg);
  imageSmoothingSlider.classList.toggle('hidden', isSvg);
  removeBgToggle.classList.toggle('hidden', isSvg);
  await processFile();
}

async function processFile() {
  if (!uploadedFile) return;
  showStatus('กำลังประมวลผลรูปภาพ...');
  try {
    const res = await processImageToRegions(uploadedFile, state.colorCount, state.removeBg, state.imageSmoothing);
    currentRegionSet = res;
    updatePaletteUI();
    // The new trace.ts normalizes the longest side to 1.
    if (res.aspect >= 1) {
      currentImageWidth = 1;
      currentImageHeight = 1 / res.aspect;
    } else {
      currentImageWidth = res.aspect;
      currentImageHeight = 1;
    }
    triggerRebuild();
  } catch (err: any) {
    console.error(err);
    showStatus('เกิดข้อผิดพลาดในการประมวลผล: ' + err.message);
  }
}

const worker = new Worker(new URL('./workers/geometry.worker.ts', import.meta.url), { type: 'module' });
let isWorkerBusy = false;
let needsRebuild = false;
let rebuildTimeout: any = null;
let lastParts: PartMesh[] = [];

function triggerRebuild() {
  needsRebuild = true;
  if (isWorkerBusy) return;
  if (rebuildTimeout) clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(runRebuild, 80);
}

function runRebuild() {
  if (!needsRebuild) return;
  needsRebuild = false;
  isWorkerBusy = true;
  showStatus('กำลังสร้างโมเดล 3 มิติ...');

  const scale = state.size / currentImageWidth;
  const scaledWidth = currentImageWidth * scale;
  const scaledHeight = currentImageHeight * scale;
  // Scale RegionSet
  const scaledRegionSet: RegionSet = currentRegionSet ? {
    aspect: currentRegionSet.aspect,
    outline: currentRegionSet.outline.map(ring => ring.map(pt => [pt[0] * scale, pt[1] * scale]) as [number, number][]),
    regions: currentRegionSet.regions.map(r => ({
      quantRgb: r.quantRgb,
      coverage: r.coverage,
      components: r.components.map(comp => ({
        coverage: comp.coverage,
        rings: comp.rings.map(ring => ring.map(pt => [pt[0] * scale, pt[1] * scale]) as [number, number][])
      }))
    }))
  } : { aspect: 1, outline: [], regions: [] };

  worker.postMessage({
    type: 'build',
    regionSet: scaledRegionSet,
    params: {
      ...state,
      imageWidth: scaledWidth,
      imageHeight: scaledHeight,
      chamfer: state.chamferOn ? state.chamfer : 0,
      plateColor: state.plate,
      haloColor: state.halo,
      imageColor: state.image,
    },
  });
}

worker.onmessage = (e: MessageEvent<GeometryResponse>) => {
  const res = e.data;
  if (res.type === 'ready') {
    hideStatus();
    if (uploadedFile) {
      processFile();
    } else {
      triggerRebuild(); // Build default star
    }
  } else if (res.type === 'parts') {
    isWorkerBusy = false;
    hideStatus();
    if (res.warnings?.length) toast(res.warnings.join('\n'), { kind: 'warn' });
    lastParts = res.parts;
    viewer.setParts(res.parts);
    if (needsRebuild) runRebuild();
  } else if (res.type === 'error') {
    isWorkerBusy = false;
    needsRebuild = false;
    showStatus('ข้อผิดพลาด: ' + res.message);
  }
};
worker.postMessage({ type: 'init' });

const viewer = createViewer(stage);

function colorField(label: string, value: string, onInput: (value: string) => void): HTMLElement {
  const input = el('input', { attrs: { type: 'color', value, 'aria-label': label } });
  input.addEventListener('input', () => onInput(input.value));
  
  globalControlResets.push(() => {
    input.value = value;
    onInput(value);
  });

  return el('label', { className: 'nk-color' }, [el('span', { text: label }), input]);
}

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
const imageColorField = colorField('รูปภาพ', state.image, (value) => {
  state.image = value;
  if (viewer) viewer.setPartColor('image', value);
  triggerRebuild();
});

const paletteContainer = el('div', { className: 'nk-palette', attrs: { style: 'margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;' } });

function updateControlsVisibility() {
  const haloVisible = state.colorScheme === 'plate-halo-image';
  haloColorField.classList.toggle('hidden', !haloVisible);
  
  const isMultiColor = Boolean(currentRegionSet && currentRegionSet.regions.length > 1);
  imageColorField.classList.toggle('hidden', state.colorScheme === 'single' || isMultiColor);
  paletteContainer.classList.toggle('hidden', state.colorScheme === 'single' || !isMultiColor);
}
updateControlsVisibility();

function updatePaletteUI() {
  paletteContainer.innerHTML = '';
  if (!currentRegionSet || currentRegionSet.regions.length <= 1) {
    updateControlsVisibility();
    return;
  }
  
  const hex = (rgb: [number, number, number]) => {
    const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${h(rgb[0])}${h(rgb[1])}${h(rgb[2])}`;
  };

  currentRegionSet.regions.forEach((r, i) => {
    const colorHex = hex(r.quantRgb);
    const pf = colorField(`สี ${i+1}`, colorHex, (val) => {
      // update rgb
      const clean = val.replace('#', '');
      r.quantRgb = [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
      if (viewer) viewer.setPartColor('image_' + i, val);
      // We don't need to rebuild geometry, just update the color property so export works
      if (lastParts.length) {
         const part = lastParts.find(p => p.name === 'image_' + i);
         if (part) part.colorRgb = r.quantRgb;
      }
    });
    pf.style.flex = '1 1 auto';
    paletteContainer.appendChild(pf);
  });
  updateControlsVisibility();
}

const colorCountSlider = sliderRow({
  label: 'จำนวนสี', min: 2, max: 16, step: 1, value: state.colorCount,
  help: 'จำนวนสีที่ต้องการดึงจากรูปภาพ (2-16 สี)',
  onInput: (v) => { state.colorCount = v; if (uploadedFile && uploadedFile.type !== 'image/svg+xml') processFile(); }
});
colorCountSlider.classList.add('hidden'); // hidden by default until PNG uploaded

const imageSmoothingSlider = sliderRow({
  label: 'ความโค้งมน', min: 0.0, max: 1.0, step: 0.1, value: state.imageSmoothing,
  help: 'เพิ่มความเนียนให้ขอบภาพ (0 = แข็ง, 1 = มนสุด)',
  onInput: (v) => { state.imageSmoothing = v; if (uploadedFile && uploadedFile.type !== 'image/svg+xml') processFile(); }
});
imageSmoothingSlider.classList.add('hidden');

const removeBgToggle = el('div', { className: 'vl-slider-row hidden' }, [
  el('label', { className: 'vl-slider-label' }, [
    el('span', { text: 'ลบพื้นหลังอัจฉริยะ' }),
    el('input', { attrs: { type: 'checkbox', checked: state.removeBg ? 'true' : '' } })
  ])
]);
const removeBgCheckbox = removeBgToggle.querySelector('input')!;
removeBgCheckbox.addEventListener('change', () => {
  state.removeBg = removeBgCheckbox.checked;
  if (uploadedFile && uploadedFile.type !== 'image/svg+xml') processFile();
});

const sizeSlider = sliderRow({ label: 'ความกว้าง', min: 20, max: 200, value: state.size, unit: 'mm', onInput: (v) => { state.size = v; triggerRebuild(); } });
const outlineSlider = sliderRow({ label: 'ความกว้างขอบเอ้าไลน์', min: 0, max: 10, step: 0.1, value: state.outlineWidth, unit: 'mm', onInput: (v) => { state.outlineWidth = v; triggerRebuild(); } });
const boldnessSlider = sliderRow({ label: 'ความหนารูปภาพ', min: -2.0, max: 2.0, step: 0.1, value: state.boldness, unit: 'mm', onInput: (v) => { state.boldness = v; triggerRebuild(); } });
const colorBleedSlider = sliderRow({ label: 'ความกว้างรอยต่อสี', min: 0.0, max: 0.5, step: 0.01, value: state.colorBleed, unit: 'mm', onInput: (v) => { state.colorBleed = v; triggerRebuild(); } });

const settings = el('div', { className: 'vl-section' }, [
  el('h4', { text: 'เลือกรูปภาพ' }),
  previewImg,
  changeImgBtn,
  dropZone,
  fileInput,
  el('div', { attrs: { style: 'margin-top: 12px;' } }, [colorCountSlider, imageSmoothingSlider, removeBgToggle]),
  el('p', { className: 'vl-label', text: 'ขนาด' }),
  sizeSlider,
  outlineSlider,
  // boldnessSlider, // Hidden per user request
  colorBleedSlider,
  segmentedControl({
    label: 'รูปแบบ', value: state.style,
    options: [{ value: 'raised', label: 'นูน' }, { value: 'engraved', label: 'สลักลึก' }],
    onChange: (v) => { state.style = v; triggerRebuild(); }
  }),
  segmentedControl({
    label: 'รูปทรงแผ่นหลัง', value: state.plateShape,
    options: [{ value: 'outline', label: 'ตามรูปทรง' }, { value: 'rectangle', label: 'สี่เหลี่ยม' }],
    onChange: (v) => { state.plateShape = v; triggerRebuild(); }
  })
]);

const ringAngleSlider = sliderRow({ label: 'มุมของห่วง', min: -180, max: 180, step: 5, value: state.ringAngle, unit: '°', onInput: (v) => { state.ringAngle = v; triggerRebuild(); } });
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

const ringSettings = el('div', { className: 'vl-section' }, [
  el('p', { className: 'vl-label', text: 'ห่วงพวงกุญแจ' }),
  segmentedControl({
    label: 'รูปแบบห่วง', value: state.ringStyle,
    options: [{ value: 'loop', label: 'ห่วงคล้อง' }, { value: 'corner', label: 'เจาะรู' }],
    onChange: (v) => { state.ringStyle = v; state.ringPosX = 0; state.ringPosY = 0; state.ringAngle = 0; triggerRebuild(); }
  }),
  sliderRow({ label: 'ขนาดรู', min: 2, max: 10, step: 0.1, value: state.holeDia, unit: 'mm', onInput: (v) => { state.holeDia = v; triggerRebuild(); } }),
  ringAngleSlider,
  el('div', { className: 'nk-nudge' }, [ el('span', { className: 'vl-hint', text: 'เลื่อนตำแหน่งห่วง' }), holeDpad.root ])
]);

const colorSchemeSelect = selectField({
  label: 'รูปแบบสี', value: state.colorScheme,
  options: [
    { value: 'single', label: '1 สี (สีเดียว)' },
    { value: 'plate-image', label: '2 สี (ฐาน + ภาพ)' },
    { value: 'plate-halo-image', label: '3 สี (ฐาน + ขอบ + ภาพ)' }
  ],
  onChange: (v: any) => { 
    state.colorScheme = v; 
    state.haloOn = v === 'plate-halo-image'; 
    updateControlsVisibility();
    triggerRebuild(); 
  }
});

const colorSettings = el('div', { className: 'vl-section' }, [
  el('p', { className: 'vl-label', text: 'สีและเลเยอร์' }),
  colorSchemeSelect,
  el('div', { className: 'nk-colors' }, [
    plateColorField,
    haloColorField,
    imageColorField,
    paletteContainer
  ])
]);

const thicknessSettings = el('div', { className: 'vl-section' }, [
  el('p', { className: 'vl-label', text: 'ความหนา' }),
  sliderRow({ label: 'แผ่นฐาน', min: 0.5, max: 10, step: 0.1, value: state.baseThickness, unit: 'mm', onInput: (v) => { state.baseThickness = v; triggerRebuild(); } }),
  sliderRow({ label: 'ความสูงของภาพ', min: 0.2, max: 10, step: 0.1, value: state.imageThickness, unit: 'mm', onInput: (v) => { state.imageThickness = v; triggerRebuild(); } })
]);

const quality = qualityCallout({
  html: `เพื่อให้ได้ชิ้นงานที่สวยงามที่สุด แนะนำให้ใช้โปรไฟล์การพิมพ์จาก <a href="${BRAND.urls.makerworld}" target="_blank" rel="noopener">MakerWorld</a>`,
  storageKey: 'image-keychain-quality-callout',
});

const footer = sidebarFooter({
  formats: [{ id: '3mf', label: 'ส่งออก 3MF - สลับสีอัตโนมัติ' }, { id: 'stl', label: 'ส่งออก STL - ชิ้นเดียว' }],
  onExport: async (format) => {
    if (lastParts.length === 0) return toast('ยังไม่มีโมเดล 3 มิติ', { kind: 'error' });
    try {
      if (format === '3mf') {
        const pauses = state.printMode === 'noams' ? noAmsPauses({
          baseThickness: state.baseThickness,
          haloThickness: state.haloOn ? state.haloThickness : 0,
          colorScheme: state.colorScheme,
          style: state.style,
          layerHeight: state.layerHeight
        }) : undefined;
        await downloadThreeMF(lastParts, 'image-keychain.3mf');
      }
    } catch (e: any) {
      toast(e.message, { kind: 'error' });
    }
  },
  onSave: () => toast('ยังไม่รองรับการบันทึก', { kind: 'warn' }),
  onLoad: () => toast('ยังไม่รองรับการเปิดไฟล์', { kind: 'warn' }),
  themeStorageKey: 'image-keychain-theme',
  onReset: () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      localStorage.removeItem('ikState');
      window.location.reload();
    }
  }
});

const shell = appShell({
  topbar: topbarLinks({ homeUrl: '../', themeToggle: false }),
  left: {
    scroll: [
      generatorHeader({ title: 'พวงกุญแจรูปภาพ', description: 'แปลงโลโก้หรือรูปภาพให้เป็นพวงกุญแจ 3 มิติได้ทันที' }),
      ...(quality ? [quality] : []),
      settings,
      ringSettings,
    ],
  },
  stage: [ stage, statusEl ],
  right: {
    scroll: [ colorSettings, thicknessSettings ],
    footer: [footer],
  },
});

app.append(shell.root);

// Trigger a resize event to ensure the ThreeJS viewer gets the correct size after being added to the DOM.
window.dispatchEvent(new Event('resize'));

new MutationObserver(() => {
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  viewer.setTheme(theme);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
