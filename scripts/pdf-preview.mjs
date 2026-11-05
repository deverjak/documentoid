// Renders every page of a finished PDF to PNG and reports page count and text per page, so the
// result can be checked visually without Poppler or PyMuPDF. Uses pdf.js inside the same headless
// browser as the exporters. Usage: npm run pdf:preview -- <input.pdf> [output-dir] [--width=1600]
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const widthArg = args.find(arg => arg.startsWith('--width='));
const width = widthArg ? Number(widthArg.slice('--width='.length)) : 1600;
const positional = args.filter(arg => !arg.startsWith('--'));
const [source, destination] = positional;
if (!source || args.includes('--help') || positional.length > 2 || !(width >= 200 && width <= 6000)) {
  console.log('Usage: npm run pdf:preview -- <input.pdf> [output-dir] [--width=1600]');
  process.exit(args.includes('--help') ? 0 : 1);
}

const pdfjsDir = path.join(root, 'node_modules', 'pdfjs-dist');
const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.pdf': 'application/pdf', '.bcmap': 'application/octet-stream', '.pfb': 'application/octet-stream', '.ttf': 'font/ttf' };
let server;
let browser;
try {
  const input = path.resolve(source);
  if (path.extname(input).toLowerCase() !== '.pdf') throw new Error('Input must be .pdf.');
  await access(input);
  const name = path.parse(input).name;
  const outDir = path.resolve(destination ?? path.join(root, 'output', 'preview', name));
  await mkdir(outDir, { recursive: true });

  // Serve only the PDF and the pdf.js distribution; ES modules and workers do not load from file://.
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let file;
      if (url.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html' });
        return res.end('<!doctype html><meta charset="utf-8"><body></body>');
      }
      if (url.pathname === '/document.pdf') file = input;
      else if (url.pathname.startsWith('/pdfjs/')) {
        file = path.join(pdfjsDir, decodeURIComponent(url.pathname.slice('/pdfjs/'.length)));
        if (!file.startsWith(pdfjsDir + path.sep)) throw new Error('outside');
      } else throw new Error('not found');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  browser = await puppeteer.launch({ headless: 'shell' });
  const page = await browser.newPage();
  await page.goto(`${base}/`);
  const pages = await page.evaluate(async (base, width) => {
    const pdfjs = await import(`${base}/pdfjs/build/pdf.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc = `${base}/pdfjs/build/pdf.worker.mjs`;
    const doc = await pdfjs.getDocument({
      url: `${base}/document.pdf`,
      cMapUrl: `${base}/pdfjs/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${base}/pdfjs/standard_fonts/`
    }).promise;
    const result = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const pdfPage = await doc.getPage(n);
      const base1 = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: width / base1.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await pdfPage.render({ canvasContext: context, canvas, viewport }).promise;
      const text = (await pdfPage.getTextContent()).items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();
      result.push({ n, png: canvas.toDataURL('image/png'), text });
    }
    return result;
  }, base, width);

  const digits = String(pages.length).length;
  const report = [];
  for (const { n, png, text } of pages) {
    const file = path.join(outDir, `page-${String(n).padStart(digits, '0')}.png`);
    await writeFile(file, Buffer.from(png.split(',')[1], 'base64'));
    const flags = [];
    if (text.length < 40) flags.push('téměř bez textu');
    if (/�|Ã.|Å.|Ä./.test(text)) flags.push('podezřelé kódování');
    report.push({ page: n, characters: text.length, flags, png: path.relative(process.cwd(), file), start: text.slice(0, 80) });
  }
  await writeFile(path.join(outDir, 'report.json'), JSON.stringify({ pdf: input, pages: pages.length, report }, null, 2));
  console.log(`PDF: ${input}`);
  console.log(`Stran: ${pages.length}, náhledy: ${outDir}`);
  for (const r of report) console.log(`${String(r.page).padStart(digits)}  ${String(r.characters).padStart(6)} zn.  ${r.flags.length ? `[${r.flags.join(', ')}] ` : ''}${r.start}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await browser?.close();
  server?.close();
}
