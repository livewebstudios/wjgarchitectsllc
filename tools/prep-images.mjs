// WJG Architects image prep. Not deployed (see netlify.toml and _redirects).
// Run from build/tools:  npm install && node prep-images.mjs
//
// Rules (LWS boilerplate spec):
//   max 1600px wide, JPG quality 82, metadata stripped, never upscaled.
//   A .webp is written beside every .jpg for <picture>.
//   Nothing ships over 300KB. Hero photos stay under 220KB.
//
// Sources:
//   ../_src/**   Wayne's originals, already renamed (gitignored staging folder)
//   ../_hf/**    Higgsfield renders, inspected 2026-11-16 (gitignored staging folder)
// Output:
//   ../images/**

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '_src');
const HF = join(ROOT, '_hf');
const OUT = join(ROOT, 'images');

const MAX_W = 1600;
const BUDGET = 300 * 1024;
const HERO_BUDGET = 220 * 1024;
const HEROES = new Set(['brastad-exterior', 'brastad-great-room']);

// Normalized crops [left, top, width, height] applied to a photo AND its drawing,
// so the pair stays registered. Turning Point: trims a parked vehicle at the left
// edge and some asphalt.
const CROPS = {
  'turning-point-toms-river': [0.095, 0.0, 0.905, 0.905],
};

const report = [];
const kb = (n) => (n / 1024).toFixed(0).padStart(5) + 'K';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(p);
  }
  return out;
}

function cropOf(img, meta, key) {
  const c = CROPS[key];
  if (!c) return img;
  return img.extract({
    left: Math.round(c[0] * meta.width),
    top: Math.round(c[1] * meta.height),
    width: Math.round(c[2] * meta.width),
    height: Math.round(c[3] * meta.height),
  });
}

// Encode to JPG under a byte budget. Quality steps down first, then width.
async function encode(makePipeline, width, budget) {
  let w = width;
  for (let i = 0; i < 8; i++) {
    for (const q of [82, 78, 74, 70, 66]) {
      const buf = await makePipeline(w).jpeg({ quality: q, mozjpeg: true }).toBuffer();
      if (buf.length <= budget) return { buf, w, q };
    }
    w = Math.round(w * 0.9);
  }
  throw new Error('could not meet budget');
}

async function emit(makePipeline, width, outBase, budget, before, label, jpgOnly = false) {
  await mkdir(dirname(outBase), { recursive: true });
  const { buf, w, q } = await encode(makePipeline, width, budget);
  await sharp(buf).toFile(outBase + '.jpg');
  if (jpgOnly) {
    const m0 = await sharp(buf).metadata();
    report.push(`${label.padEnd(46)} ${kb(before)} -> jpg ${kb(buf.length)}  (no webp)  ${m0.width}x${m0.height} q${q}`);
    return { width: m0.width, height: m0.height };
  }
  // WebP must never be heavier than the JPG it replaces.
  let webp;
  for (const wq of [Math.min(q, 78), 70, 62, 54, 46]) {
    webp = await makePipeline(w).webp({ quality: wq, effort: 6 }).toBuffer();
    if (webp.length <= buf.length) break;
  }
  await sharp(webp).toFile(outBase + '.webp');
  const m = await sharp(buf).metadata();
  report.push(`${label.padEnd(46)} ${kb(before)} -> jpg ${kb(buf.length)}  webp ${kb(webp.length)}  ${m.width}x${m.height} q${q}`);
  return { width: m.width, height: m.height };
}

const dims = {};

// 1. Wayne's photos and construction documents
for (const file of await walk(SRC)) {
  const rel = relative(SRC, file);
  const key = rel.replace(/^.*\//, '').replace(extname(rel), '');
  const meta = await sharp(file).metadata();
  const c = CROPS[key];
  const srcW = c ? Math.round(c[2] * meta.width) : meta.width;
  const w = Math.min(MAX_W, srcW);
  const make = (width) => cropOf(sharp(file), meta, key).resize({ width, withoutEnlargement: true });
  const budget = HEROES.has(key) ? HERO_BUDGET : BUDGET;
  dims[key] = await emit(make, w, join(OUT, rel.replace(extname(rel), '')), budget, (await stat(file)).size, rel);
}

// 2. Traced drawings, sized to match their photo exactly
const PAIRS = {
  'brastad-exterior': 'brastad-exterior',
  'brastad-great-room': 'brastad-great-room',
  '670-belleville': '670-belleville',
  'turning-point': 'turning-point-toms-river',
  'ohara-offices': 'ohara-offices',
  'sungard-stair': 'sungard-stair',
};
for (const [name, photoKey] of Object.entries(PAIRS)) {
  const file = join(HF, `drawn-${name}.png`);
  const meta = await sharp(file).metadata();
  const d = dims[photoKey];
  const make = (width) => cropOf(sharp(file), meta, photoKey)
    .resize({ width, height: Math.round(width * d.height / d.width), fit: 'fill' });
  await emit(make, d.width, join(OUT, 'drawn', photoKey), BUDGET, (await stat(file)).size, `drawn/${photoKey}`);
}

// 3. Textures and the drafting table still
for (const [name, out] of [
  ['texture-paper-plan', 'texture/paper-plan'],
  ['texture-blueprint-night', 'texture/blueprint-night'],
  ['still-drafting-table', 'texture/drafting-table'],
]) {
  const file = join(HF, `${name}.png`);
  const make = (width) => sharp(file).resize({ width });
  await emit(make, MAX_W, join(OUT, out), name.startsWith('still') ? BUDGET : 200 * 1024, (await stat(file)).size, out, !name.startsWith('still'));
}

// 4. Open Graph image, 1200 x 630, from the Brastad exterior
await sharp(join(SRC, 'projects/residential/brastad-exterior.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(join(OUT, 'og-image.jpg'));
report.push('og-image.jpg                                   1200x630');

// 5. Favicons from the only source there is (soft, flagged in OPEN_QUESTIONS.md)
const ICON = join(ROOT, '..', 'docs', 'assets', 'brand', 'cropped-icon.png');
await sharp(ICON).resize(32, 32).png().toFile(join(OUT, 'brand', 'favicon-32.png'));
await sharp(ICON).resize(180, 180).flatten({ background: '#f5f1e8' }).png().toFile(join(OUT, 'brand', 'apple-touch-icon.png'));
report.push('brand/favicon-32.png, brand/apple-touch-icon.png');

console.log('\nBEFORE -> AFTER');
console.log(report.join('\n'));
console.log('\nDimensions for width/height attributes:');
console.log(JSON.stringify(dims, null, 0).replace(/},/g, '},\n'));
