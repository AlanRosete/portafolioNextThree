/**
 * Genera los iconos del sitio a partir de un SVG.
 *
 *   node scripts/build-favicon.mjs public/favicon/palette-mono.svg
 *
 * Escribe src/app/favicon.ico y src/app/apple-icon.png, que es el convenio
 * de archivos de Next: él mismo emite los <link> con un hash de contenido,
 * así que el cache-busting sale gratis y no hay que tocar layout.tsx.
 *
 * Requiere Chromium de Playwright una sola vez:
 *   npx playwright install chromium
 *
 * Se usa Playwright y no una librería de conversión porque rasteriza con el
 * mismo motor que un navegador: lo que ves en el PNG es lo que verá la gente.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Playwright no es dependencia del proyecto: solo hace falta para regenerar
// iconos, cosa que pasa una vez cada muerte de obispo. Se pide bajo demanda
// en vez de cargarle 100 MB al repo.
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta Playwright. Instálalo solo para esto:\n' +
      '  npm i -D playwright && npx playwright install chromium'
  );
  process.exit(1);
}

const SRC = process.argv[2];
if (!SRC) {
  console.error('Uso: node scripts/build-favicon.mjs <ruta-al-svg>');
  process.exit(1);
}

const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;
const APPLE_BG = '#141414'; // iOS no respeta transparencia: la rellena de negro

const svg = readFileSync(resolve(SRC), 'utf8')
  // Algunos SVG traen width/height fijos que le ganan al viewBox al escalar.
  .replace(/\s(width|height)="[^"]*"/g, (m) => (m.includes('100%') ? m : ''));

const browser = await chromium.launch();
const page = await browser.newPage();

/** Rasteriza el SVG a RGBA crudo en el tamaño pedido. */
async function rgba(size) {
  return page.evaluate(async ({ svg, size }) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image();
    await new Promise((ok, err) => { img.onload = ok; img.onerror = err; img.src = url; });
    const c = document.createElement('canvas');
    c.width = c.height = size;
    c.getContext('2d').drawImage(img, 0, 0, size, size);
    return Array.from(c.getContext('2d').getImageData(0, 0, size, size).data);
  }, { svg, size });
}

/**
 * Una entrada ICO en BMP clásico: BITMAPINFOHEADER + BGRA de abajo a arriba
 * + máscara AND. Se usa BMP y no PNG incrustado porque los decodificadores
 * conservadores solo entienden esta variante.
 */
function bmpEntry(px, size) {
  const head = Buffer.alloc(40);
  head.writeUInt32LE(40, 0);
  head.writeInt32LE(size, 4);
  head.writeInt32LE(size * 2, 8); // alto doble: imagen XOR + máscara AND
  head.writeUInt16LE(1, 12);
  head.writeUInt16LE(32, 14);

  const xor = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const src = size - 1 - y; // BMP va de abajo hacia arriba
    for (let x = 0; x < size; x++) {
      const s = (src * size + x) * 4;
      const d = (y * size + x) * 4;
      xor[d] = px[s + 2];
      xor[d + 1] = px[s + 1];
      xor[d + 2] = px[s];
      xor[d + 3] = px[s + 3];
    }
  }

  // Filas de la máscara alineadas a 4 bytes; con alfa de 32bpp va toda a cero.
  const and = Buffer.alloc(Math.ceil(size / 32) * 4 * size, 0);
  return Buffer.concat([head, xor, and]);
}

const entries = [];
for (const s of ICO_SIZES) entries.push({ size: s, data: bmpEntry(await rgba(s), s) });

const dir = Buffer.alloc(6);
dir.writeUInt16LE(1, 2);
dir.writeUInt16LE(entries.length, 4);

let offset = 6 + 16 * entries.length;
const table = entries.map((e) => {
  const d = Buffer.alloc(16);
  d.writeUInt8(e.size, 0);
  d.writeUInt8(e.size, 1);
  d.writeUInt16LE(1, 4);
  d.writeUInt16LE(32, 6);
  d.writeUInt32LE(e.data.length, 8);
  d.writeUInt32LE(offset, 12);
  offset += e.data.length;
  return d;
});

writeFileSync(
  'src/app/favicon.ico',
  Buffer.concat([dir, ...table, ...entries.map((e) => e.data)])
);
console.log(`✓ src/app/favicon.ico  (${ICO_SIZES.join('/')})`);

const apple = await browser.newPage({
  viewport: { width: APPLE_SIZE, height: APPLE_SIZE },
});
await apple.setContent(
  `<style>html,body{margin:0;width:${APPLE_SIZE}px;height:${APPLE_SIZE}px;background:${APPLE_BG}}
   svg{display:block;width:${APPLE_SIZE}px;height:${APPLE_SIZE}px}</style>${svg}`
);
await apple.screenshot({ path: 'src/app/apple-icon.png' });
console.log(`✓ src/app/apple-icon.png  (${APPLE_SIZE}x${APPLE_SIZE})`);

await browser.close();
console.log('\nRecarga la pestaña. Next le pone hash nuevo solo.');
