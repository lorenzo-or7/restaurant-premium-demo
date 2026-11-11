// Baixa fotografias do Unsplash (Unsplash License) e gera variantes WebP otimizadas.
// Uso: node scripts/fetch-images.mjs   (lista em scripts/images.json)
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const list = JSON.parse(await fs.readFile(new URL('./images.json', import.meta.url), 'utf8'));
const outDir = path.resolve('public/images');
await fs.mkdir(outDir, { recursive: true });
const widths = [480, 960, 1600];
const meta = {};
for (const [name, id] of Object.entries(list)) {
  const res = await fetch(`https://images.unsplash.com/${id}?w=2000&q=85&fm=jpg`);
  if (!res.ok) { console.error('falhou', name, res.status); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  meta[name] = { w: width, h: height, source: `https://unsplash.com/photos/${id.replace('photo-', '')}` };
  for (const w of widths) {
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: w > 1000 ? 72 : 70 }).toFile(path.join(outDir, `${name}-${w}.webp`));
  }
  console.log('ok', name, width, height);
}
await fs.writeFile(path.resolve('src/content/image-meta.json'), JSON.stringify(meta, null, 2));
