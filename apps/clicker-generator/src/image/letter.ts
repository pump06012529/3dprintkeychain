import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import helvetikerRegular from 'three/examples/fonts/helvetiker_regular.typeface.json';
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json';
import type { RegionSet, Ring, RGB } from '../types';

const fontLoader = new FontLoader();
const ttfLoader = new TTFLoader();

export interface FontOption {
  id: string;
  name: string;
  font: Font;
  imported?: boolean;
}

export const FONT_OPTIONS: FontOption[] = [];

const BUILT_IN_FONTS: [string, string, any][] = [
  ['helvetiker-regular', 'Standard', helvetikerRegular],
  ['helvetiker-bold', 'Standard Bold', helvetikerBold],
];

for (const [id, name, data] of BUILT_IN_FONTS) {
  FONT_OPTIONS.push({ id, name, font: fontLoader.parse(data) });
}

const BUNDLED_TTF = [
  ['abril-fatface', 'Abril Fatface'],
  ['aldrich', 'Aldrich'],
  ['alex-brush', 'Alex Brush'],
  ['alfa-slab-one', 'Alfa Slab One'],
  ['allura', 'Allura'],
  ['amatic-sc', 'Amatic SC'],
  ['anton', 'Anton'],
  ['architects-daughter', 'Architects Daughter'],
  ['archivo-black', 'Archivo Black'],
  ['arvo', 'Arvo'],
  ['audiowide', 'Audiowide'],
  ['bai-jamjuree', 'Bai Jamjuree'],
  ['bakbak-one', 'Bakbak One'],
  ['baloo-2', 'Baloo 2'],
  ['bangers', 'Bangers'],
  ['barlow-condensed', 'Barlow Condensed'],
  ['bebas-neue', 'Bebas Neue'],
  ['bevan', 'Bevan'],
  ['bitter', 'Bitter'],
  ['black-han-sans', 'Black Han Sans'],
  ['black-ops-one', 'Black Ops One'],
  ['boogaloo', 'Boogaloo'],
  ['bowlby-one', 'Bowlby One'],
  ['bowlby-one-sc', 'Bowlby One SC'],
  ['bree-serif', 'Bree Serif'],
  ['bungee', 'Bungee'],
  ['bungee-inline', 'Bungee Inline'],
  ['bungee-shade', 'Bungee Shade'],
  ['butcherman', 'Butcherman'],
  ['caveat', 'Caveat'],
  ['chakra-petch', 'Chakra Petch'],
  ['changa-one', 'Changa One'],
  ['charm', 'Charm'],
  ['charmonman', 'Charmonman'],
  ['chewy', 'Chewy'],
  ['chonburi', 'Chonburi'],
  ['cinzel', 'Cinzel'],
  ['cinzel-decorative', 'Cinzel Decorative'],
  ['comfortaa', 'Comfortaa'],
  ['coming-soon', 'Coming Soon'],
  ['concert-one', 'Concert One'],
  ['cookie', 'Cookie'],
  ['courgette', 'Courgette'],
  ['creepster', 'Creepster'],
  ['crete-round', 'Crete Round'],
  ['cutive-mono', 'Cutive Mono'],
  ['damion', 'Damion'],
  ['dancing-script', 'Dancing Script'],
  ['do-hyeon', 'Do Hyeon'],
  ['domine', 'Domine'],
  ['dotgothic16', 'DotGothic16'],
  ['eater', 'Eater'],
  ['electrolize', 'Electrolize'],
  ['ewert', 'Ewert'],
  ['fahkwang', 'Fahkwang'],
  ['faster-one', 'Faster One'],
  ['fjalla-one', 'Fjalla One'],
  ['fredoka', 'Fredoka'],
  ['frijole', 'Frijole'],
  ['fugaz-one', 'Fugaz One'],
  ['gaegu', 'Gaegu'],
  ['gloria-hallelujah', 'Gloria Hallelujah'],
  ['gochi-hand', 'Gochi Hand'],
  ['grandstander', 'Grandstander'],
  ['great-vibes', 'Great Vibes'],
  ['griffy', 'Griffy'],
  ['gruppo', 'Gruppo'],
  ['handjet', 'Handjet'],
  ['handlee', 'Handlee'],
  ['henny-penny', 'Henny Penny'],
  ['iceland', 'Iceland'],
  ['indie-flower', 'Indie Flower'],
  ['itim', 'Itim'],
  ['jolly-lodger', 'Jolly Lodger'],
  ['josefin-sans', 'Josefin Sans'],
  ['josefin-slab', 'Josefin Slab'],
  ['jua', 'Jua'],
  ['jura', 'Jura'],
  ['k2d', 'K2D'],
  ['kalam', 'Kalam'],
  ['kanit', 'Kanit'],
  ['kaushan-script', 'Kaushan Script'],
  ['kodchasan', 'Kodchasan'],
  ['koho', 'KoHo'],
  ['krub', 'Krub'],
  ['lilita-one', 'Lilita One'],
  ['lobster', 'Lobster'],
  ['lora', 'Lora'],
  ['luckiest-guy', 'Luckiest Guy'],
  ['maitree', 'Maitree'],
  ['major-mono-display', 'Major Mono Display'],
  ['mali', 'Mali'],
  ['marcellus', 'Marcellus'],
  ['marck-script', 'Marck Script'],
  ['metal-mania', 'Metal Mania'],
  ['michroma', 'Michroma'],
  ['mitr', 'Mitr'],
  ['modak', 'Modak'],
  ['monoton', 'Monoton'],
  ['montserrat', 'Montserrat'],
  ['neucha', 'Neucha'],
  ['new-rocker', 'New Rocker'],
  ['niconne', 'Niconne'],
  ['niramit', 'Niramit'],
  ['norican', 'Norican'],
  ['nosifer', 'Nosifer'],
  ['nova-mono', 'Nova Mono'],
  ['nova-square', 'Nova Square'],
  ['nunito', 'Nunito'],
  ['orbitron', 'Orbitron'],
  ['oswald', 'Oswald'],
  ['oxanium', 'Oxanium'],
  ['pacifico', 'Pacifico'],
  ['pangolin', 'Pangolin'],
  ['parisienne', 'Parisienne'],
  ['passion-one', 'Passion One'],
  ['patrick-hand', 'Patrick Hand'],
  ['pattaya', 'Pattaya'],
  ['patua-one', 'Patua One'],
  ['paytone-one', 'Paytone One'],
  ['permanent-marker', 'Permanent Marker'],
  ['pirata-one', 'Pirata One'],
  ['pixelify-sans', 'Pixelify Sans'],
  ['playfair-display', 'Playfair Display'],
  ['poppins', 'Poppins'],
  ['press-start-2p', 'Press Start 2P'],
  ['pridi', 'Pridi'],
  ['prompt', 'Prompt'],
  ['quantico', 'Quantico'],
  ['quicksand', 'Quicksand'],
  ['racing-sans-one', 'Racing Sans One'],
  ['rajdhani', 'Rajdhani'],
  ['ranchers', 'Ranchers'],
  ['righteous', 'Righteous'],
  ['roboto-slab', 'Roboto Slab'],
  ['rochester', 'Rochester'],
  ['rokkitt', 'Rokkitt'],
  ['rowdies', 'Rowdies'],
  ['rubik', 'Rubik'],
  ['rubik-glitch', 'Rubik Glitch'],
  ['rubik-mono-one', 'Rubik Mono One'],
  ['russo-one', 'Russo One'],
  ['rye', 'Rye'],
  ['sacramento', 'Sacramento'],
  ['sanchez', 'Sanchez'],
  ['sansita-swashed', 'Sansita Swashed'],
  ['sarabun', 'Sarabun'],
  ['satisfy', 'Satisfy'],
  ['schoolbell', 'Schoolbell'],
  ['share-tech-mono', 'Share Tech Mono'],
  ['shojumaru', 'Shojumaru'],
  ['shrikhand', 'Shrikhand'],
  ['sigmar-one', 'Sigmar One'],
  ['silkscreen', 'Silkscreen'],
  ['sniglet', 'Sniglet'],
  ['space-mono', 'Space Mono'],
  ['special-elite', 'Special Elite'],
  ['squada-one', 'Squada One'],
  ['sriracha', 'Sriracha'],
  ['srisakdi', 'Srisakdi'],
  ['staatliches', 'Staatliches'],
  ['syncopate', 'Syncopate'],
  ['taviraj', 'Taviraj'],
  ['teko', 'Teko'],
  ['thasadith', 'Thasadith'],
  ['titan-one', 'Titan One'],
  ['titillium-web', 'Titillium Web'],
  ['trirong', 'Trirong'],
  ['turret-road', 'Turret Road'],
  ['ultra', 'Ultra'],
  ['vollkorn', 'Vollkorn'],
  ['vt323', 'VT323'],
  ['wallpoet', 'Wallpoet'],
  ['yellowtail', 'Yellowtail'],
  ['yeseva-one', 'Yeseva One'],
  ['zen-dots', 'Zen Dots'],
  ['zilla-slab', 'Zilla Slab']
];

let bundledLoaded = false;
export async function loadBundledFonts(onLoaded?: (option: FontOption) => void) {
  if (bundledLoaded) return;
  bundledLoaded = true;
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Inject @font-face rules so we can preview the fonts in the UI
  const fontFaceStyles = BUNDLED_TTF.map(([slug]) => `
    @font-face {
      font-family: '${slug}';
      src: url('${baseUrl}fonts/${slug}.ttf') format('truetype');
    }
  `).join('\n');
  const styleEl = document.createElement('style');
  styleEl.textContent = fontFaceStyles;
  document.head.appendChild(styleEl);

  for (const [slug, name] of BUNDLED_TTF) {
    try {
      const buf = await fetch(`${baseUrl}fonts/${slug}.ttf`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      });
      const parsedTTF = ttfLoader.parse(buf);
      const font = fontLoader.parse(parsedTTF);
      const option = { id: `bundled-${slug}`, name, font };
      FONT_OPTIONS.push(option);
      onLoaded?.(option);
    } catch (e: any) {
      console.warn(`Could not load font "${name}":`, e.message);
    }
  }
}

function uniqueFontId(base: string): string {
  const slug = base
    .replace(/\.[^.]+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'imported-font';
  let id = `imported-${slug}`;
  let suffix = 2;
  while (FONT_OPTIONS.some((font) => font.id === id)) {
    id = `imported-${slug}-${suffix}`;
    suffix++;
  }
  return id;
}

function fontNameFromData(data: any, fallback: string): string {
  return data.familyName || data.original_font_information?.fullName?.en || fallback;
}

export async function importFontFile(file: File): Promise<FontOption> {
  const isJson = /\.json$/i.test(file.name);
  const data = isJson
    ? JSON.parse(await file.text())
    : ttfLoader.parse(await file.arrayBuffer());
  const option = {
    id: uniqueFontId(file.name),
    name: fontNameFromData(data, file.name.replace(/\.[^.]+$/g, '')),
    font: fontLoader.parse(data),
    imported: true,
  };
  FONT_OPTIONS.push(option);
  return option;
}

/**
 * Build a RegionSet from text.
 * @param separate  When false (default) every letter is merged into one element so the
 *   whole word selects/recolors/extrudes together. When true each glyph becomes its own
 *   region (part `top-color-{k}-0`), so letters can be picked and colored individually.
 */
export function parseLetter(text: string, fontId: string, maxLen = 30, separate = false): RegionSet {
  if (!text.trim()) throw new Error('Type a letter first.');

  const option = FONT_OPTIONS.find((font) => font.id === fontId) || FONT_OPTIONS[0];
  // Each glyph is a group of rings (its outline + any holes), kept grouped so we can
  // either merge them all into one element or expose each letter on its own.
  const glyphs: Ring[][] = [];
  const box = new THREE.Box2(
    new THREE.Vector2(Infinity, Infinity),
    new THREE.Vector2(-Infinity, -Infinity)
  );

  const lines = text.split('\n');
  let currentY = 0;

  for (const rawLine of lines) {
    const value = Array.from((rawLine || '').trim()).slice(0, maxLen).join('');
    if (!value) continue;

    const shapes = option.font.generateShapes(value, 100);
    const lineBox = new THREE.Box2(
      new THREE.Vector2(Infinity, Infinity),
      new THREE.Vector2(-Infinity, -Infinity)
    );
    const lineGlyphs: Ring[][] = [];

    for (const shape of shapes) {
      const extracted = shape.extractPoints(16);
      const glyphRings: Ring[] = [];
      if (extracted.shape.length >= 3) {
        const ring: Ring = [];
        for (const p of extracted.shape) {
          lineBox.expandByPoint(p);
          ring.push([p.x, p.y]);
        }
        glyphRings.push(ring);
      }
      for (const hole of extracted.holes) {
        if (hole.length >= 3) {
          const ring: Ring = [];
          for (const p of hole) {
            lineBox.expandByPoint(p);
            ring.push([p.x, p.y]);
          }
          glyphRings.push(ring);
        }
      }
      if (glyphRings.length) lineGlyphs.push(glyphRings);
    }

    if (lineGlyphs.length === 0) continue;

    const lineWidth = lineBox.max.x - lineBox.min.x;
    const offsetX = -(lineBox.min.x + lineWidth / 2);

    for (const glyphRings of lineGlyphs) {
      for (const ring of glyphRings) {
        for (const pt of ring) {
          pt[0] += offsetX;
          pt[1] += currentY;
          box.expandByPoint(new THREE.Vector2(pt[0], pt[1]));
        }
      }
      glyphs.push(glyphRings);
    }

    currentY -= 130; // Move down for the next line
  }

  if (!glyphs.length) throw new Error('No drawable outlines found in this font.');

  const cx = (box.min.x + box.max.x) / 2;
  const cy = (box.min.y + box.max.y) / 2;
  const dx = box.max.x - box.min.x;
  const dy = box.max.y - box.min.y;
  const maxSide = Math.max(dx, dy) || 1;
  const aspect = dy !== 0 ? dx / dy : 1;

  const normalizeRing = (r: Ring): Ring =>
    r.map(([x, y]) => [
      (x - cx) / maxSide,
      (y - cy) / maxSide // keep Y-up
    ]);

  // Default text color is off-white (#f7f7f5)
  const OFFWHITE: RGB = [247, 247, 245];
  const outline = glyphs.flat().map(normalizeRing);

  const regions = separate
    ? glyphs.map((glyphRings) => ({
        quantRgb: OFFWHITE,
        components: [{ rings: glyphRings.map(normalizeRing), coverage: 1.0 }],
        coverage: 1.0,
      }))
    : [{
        quantRgb: OFFWHITE,
        components: [{ rings: outline, coverage: 1.0 }],
        coverage: 1.0,
      }];

  return { regions, outline, aspect };
}
