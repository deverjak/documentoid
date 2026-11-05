import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const landscape = args.includes('--landscape');
const positional = args.filter(arg => arg !== '--landscape');
const [source, destination] = positional;
if (!source || source === '--help' || positional.length > 2) {
  console.log('Usage: npm run html:pdf -- <input.html> [output.pdf] [--landscape]');
  process.exit(source === '--help' ? 0 : 1);
}
let browser;
try {
  const input = path.resolve(source);
  const output = path.resolve(destination ?? path.join(root, 'output', `${path.parse(input).name}.pdf`));
  if (path.extname(input).toLowerCase() !== '.html' || path.extname(output).toLowerCase() !== '.pdf') {
    throw new Error('Input must be .html and output must be .pdf.');
  }
  await access(input);
  await mkdir(path.dirname(output), { recursive: true });
  browser = await puppeteer.launch({ headless: 'shell' });
  const page = await browser.newPage();
  await page.setViewport({ width: landscape ? 1440 : 1000, height: 1000 });
  const url = pathToFileURL(input);
  url.searchParams.set('motion', 'static');
  await page.goto(url.href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const roots = [...document.querySelectorAll('[data-motion-root]')];
    if (roots.some(el => el.dataset.frame !== 'static')) throw new Error('Motion diagram has no complete static frame.');
    const failed = [...document.images].filter(img => !img.complete || img.naturalWidth === 0);
    if (failed.length) throw new Error(`Failed images: ${failed.map(img => img.src).join(', ')}`);
  });
  await page.pdf({
    path: output, format: 'A4', landscape, printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
  });
  console.log(`PDF: ${output}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await browser?.close();
}
