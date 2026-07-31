import { writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONTS_DIR = path.join(APP, 'src', 'fonts');

const CURATED = new Set([
  'pacifico', 'luckiest-guy', 'creepster', 'press-start-2p',
  'dancing-script', 'bungee', 'lobster', 'permanent-marker',
  'vt323', 'bangers', 'sigmar-one', 'kalam', 'righteous',
  'anton', 'russo-one', 'bebas-neue', 'oswald', 'playfair-display',
  'audiowide', 'orbitron', 'chakra-petch', 'arvo', 'prompt',
  'mali', 'sriracha', 'chonburi', 'itim'
]);

function getMappedCategory(f) {
  if (CURATED.has(f.id)) {
    if (f.id === 'press-start-2p' || f.id === 'vt323') return 'Pixel';
    if (f.id === 'creepster') return 'Spooky';
    if (f.id === 'bangers' || f.id === 'luckiest-guy') return 'Comic';
    if (['audiowide', 'orbitron', 'chakra-petch', 'righteous', 'russo-one'].includes(f.id)) return 'Tech';
  }
  const c = f.category;
  if (c === 'sans-serif') return 'Clean';
  if (c === 'serif') return 'Serif';
  if (c === 'display') return 'Display';
  if (c === 'handwriting') return 'Handwriting';
  if (c === 'monospace') return 'Mono';
  return 'Display';
}

async function fetchTtfUrl(slug) {
  const metaResp = await fetch(`https://gwfh.mranftl.com/api/fonts/${slug}`);
  if (!metaResp.ok) throw new Error(`meta HTTP ${metaResp.status}`);
  const meta = await metaResp.json();
  const subsets = meta.subsets ? meta.subsets.join(',') : 'latin';

  const r = await fetch(`https://gwfh.mranftl.com/api/fonts/${slug}?subsets=${subsets}`);
  if (!r.ok) throw new Error(`meta HTTP ${r.status}`);
  const j = await r.json();
  const variants = j.variants || [];
  const reg = variants.find((v) => v.id === 'regular') || variants.find((v) => v.id === '400') || variants[0];
  if (!reg || !reg.ttf) throw new Error('no ttf variant');
  return { url: reg.ttf, subsets: meta.subsets || ['latin'] };
}

async function download(item) {
  const { slug, label, category, curated, subsets } = item;
  const dest = path.join(FONTS_DIR, `${slug}.ttf`);
  try {
    const { url, subsets: fetchedSubsets } = await fetchTtfUrl(slug);
    if (existsSync(dest)) return { ...item, status: 'exists', subsets: fetchedSubsets };
    const r = await fetch(url);
    if (!r.ok) throw new Error(`ttf HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error(`too small (${buf.length}b)`);
    await writeFile(dest, buf);
    return { ...item, status: 'ok', bytes: buf.length, subsets: fetchedSubsets };
  } catch (e) {
    return { ...item, status: 'FAIL', error: e.message };
  }
}

async function pool(items, worker, concurrency = 10) {
  const results = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

// 1. Fetch full list
console.log('Fetching Google Fonts list...');
const listRes = await fetch('https://gwfh.mranftl.com/api/fonts');
const list = await listRes.json();

// 2. Select 500 fonts
const thaiFonts = list.filter(f => f.subsets.includes('thai'));
const remaining = list.filter(f => !f.subsets.includes('thai'));
remaining.sort((a, b) => a.popularity - b.popularity);
const topEnglish = remaining.slice(0, 500 - thaiFonts.length);

const selected = [...thaiFonts, ...topEnglish];
for (const c of CURATED) {
  if (!selected.find(f => f.id === c)) {
    const f = list.find(f => f.id === c);
    if (f) selected.push(f);
  }
}

const itemsToDownload = selected.map(f => ({
  slug: f.id,
  label: f.family,
  category: getMappedCategory(f),
  curated: CURATED.has(f.id),
  subsets: f.subsets
}));

console.log(`Downloading ${itemsToDownload.length} fonts (skipping existing)...`);
const results = await pool(itemsToDownload, download, 10);

const ok = results.filter((r) => r.status === 'ok');
const exists = results.filter((r) => r.status === 'exists');
const failed = results.filter((r) => r.status === 'FAIL');
console.log(`\nDownloaded: ${ok.length} new, ${exists.length} already present, ${failed.length} failed.`);
if (failed.length) console.log('FAILED:', failed.map((f) => `${f.slug} (${f.error})`).join(', '));

const validResults = results.filter(r => r.status === 'ok' || r.status === 'exists');
const files = (await readdir(FONTS_DIR)).filter((f) => f.endsWith('.ttf') && f !== 'icon-fallback.ttf');
const present = new Set(files.map((f) => f.replace('.ttf', '')));

const rows = validResults
  .filter(r => present.has(r.slug))
  .map(r => ({ id: r.slug, label: r.label, category: r.category, curated: r.curated, subsets: r.subsets }));

for (const slug of present) {
  if (!rows.find(r => r.id === slug)) {
    const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    rows.push({ id: slug, label, category: 'Display', curated: false, subsets: ['latin'] });
  }
}
rows.sort((a, b) => a.label.localeCompare(b.label));

const ts = `// AUTO-GENERATED by scripts/fetch-fonts.mjs — do not edit by hand.
export interface FontChoice { id: string; label: string; category: string; curated: boolean; subsets: string[]; }
export const FONTS: FontChoice[] = ${JSON.stringify(rows, null, 2)};
`;
await writeFile(path.join(APP, 'src', 'generated-fonts.ts'), ts);

const css = `/* AUTO-GENERATED by scripts/fetch-fonts.mjs — do not edit by hand. */\n` +
  rows.map((r) => `@font-face { font-family: NK-${r.id}; src: url('./fonts/${r.id}.ttf'); font-display: swap; }`).join('\n') + '\n';
await writeFile(path.join(APP, 'src', 'generated-fonts.css'), css);

const specimen = (label) => `https://fonts.google.com/specimen/${label.replace(/ /g, '+')}`;
const credits = `# Bundled fonts\n\nAll ${rows.length} fonts in this folder are from [Google Fonts](https://fonts.google.com). Each is licensed under OFL-1.1 or Apache-2.0.\n\n| Font | Category | Google Fonts page (license) |\n| --- | --- | --- |\n` +
  rows.map((r) => `| ${r.label} | ${r.category} | ${specimen(r.label)} |`).join('\n') + '\n';
await writeFile(path.join(FONTS_DIR, 'CREDITS.md'), credits);

console.log(`\nRegistry: ${rows.length} fonts (${rows.filter((r) => r.curated).length} curated front cards).`);
console.log('Wrote src/generated-fonts.ts, src/generated-fonts.css, src/fonts/CREDITS.md');
