// Page budget of a Markdown documentation set: words, images and estimated pages per file and in
// total, plus the real page count of a built PDF. No dependencies.
// Usage: npm run docs:measure -- <file.md|folder>... [--pdf=<built.pdf>] [--words-per-page=360]
// Estimate (calibrated on a Czech A4 book with this toolchain's print style): about 360 words per
// page and half a page per image. Recalibrate with --pdf on the first real build of a new document.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const wordsPerPage = Number(option('words-per-page') ?? 360);
const imagePages = Number(option('image-pages') ?? 0.5);
const pdf = option('pdf');
const targets = args.filter(arg => !arg.startsWith('--'));
if (!targets.length || args.includes('--help') || !(wordsPerPage > 0) || !(imagePages >= 0)) {
  console.log('Usage: npm run docs:measure -- <file.md|folder>... [--pdf=<built.pdf>] [--words-per-page=360] [--image-pages=0.5]');
  process.exit(args.includes('--help') ? 0 : 1);
}

const skip = new Set(['node_modules', '.git', 'output', '.venv']);
function collect(target) {
  const stat = statSync(target);
  if (stat.isFile()) return target.toLowerCase().endsWith('.md') ? [target] : [];
  return readdirSync(target, { withFileTypes: true })
    .filter(entry => !skip.has(entry.name) && !entry.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => collect(path.join(target, entry.name)));
}

const rows = [...new Set(targets.flatMap(collect))].map(file => {
  const md = readFileSync(file, 'utf8');
  const prose = md
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<img\b[^>]*>/gi, '');
  const words = prose.split(/\s+/).filter(token => /[\p{L}\p{N}]/u.test(token)).length;
  const images = (md.match(/!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>/gi) ?? []).length;
  return { file: path.relative(process.cwd(), file), words, images, pages: words / wordsPerPage + images * imagePages };
});

const pad = (value, n) => String(value).padStart(n);
for (const r of rows) console.log(`${pad(r.words, 7)} sl. ${pad(r.images, 3)} obr. ${pad(r.pages.toFixed(1), 6)} str.  ${r.file}`);
const sum = key => rows.reduce((total, r) => total + r[key], 0);
console.log(`${pad(sum('words'), 7)} sl. ${pad(sum('images'), 3)} obr. ${pad(sum('pages').toFixed(0), 6)} str.  CELKEM (${rows.length} souborů, odhad)`);

if (pdf) {
  // Counts page objects in the PDF; enough for md-to-pdf and Puppeteer output.
  const pages = (readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  console.log(`PDF ${path.relative(process.cwd(), pdf)}: ${pages} stran`);
  if (sum('pages') > 0) console.log(`Kalibrace: skutečné/odhad = ${(pages / sum('pages')).toFixed(2)}`);
}
