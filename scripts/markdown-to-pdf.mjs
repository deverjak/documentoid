import { mkdir, access, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { mdToPdf } from 'md-to-pdf';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const rootArg = args.find(arg => arg.startsWith('--root='));
const positional = args.filter(arg => !arg.startsWith('--'));
const [source, destination] = positional;
if (!source || args.includes('--help') || positional.length > 2 || args.some(arg => arg.startsWith('--') && arg !== rootArg)) {
  console.log('Usage: npm run pdf -- <input.md> [output.pdf] [--root=<folder for local images>]');
  process.exit(args.includes('--help') ? 0 : 1);
}

const inside = (dir, file) => !path.relative(dir, file).startsWith('..') && !path.isAbsolute(path.relative(dir, file));

// Local images are served from one folder; anything outside it does not load. Default: Documentoid
// itself for its own files, otherwise the Git repository of the document, otherwise its folder.
function assetRoot(input) {
  if (rootArg) return path.resolve(rootArg.slice('--root='.length));
  if (inside(root, input)) return root;
  for (let dir = path.dirname(input); ; dir = path.dirname(dir)) {
    if (existsSync(path.join(dir, '.git'))) return dir;
    if (path.dirname(dir) === dir) return path.dirname(input);
  }
}

try {
  const input = path.resolve(source);
  const output = path.resolve(destination ?? path.join(root, 'output', `${path.parse(input).name}.pdf`));
  if (path.extname(input).toLowerCase() !== '.md' || path.extname(output).toLowerCase() !== '.pdf') {
    throw new Error('Input must be .md and output must be .pdf.');
  }
  await access(input);
  const basedir = assetRoot(input);
  if (!inside(basedir, input)) throw new Error(`The document must be inside --root (${basedir}).`);
  await mkdir(path.dirname(output), { recursive: true });
  // PDF title: the first H1 of the document, otherwise the file name. Frontmatter still wins.
  const title = (await readFile(input, 'utf8')).match(/^#\s+(.+?)\s*#*\s*$/m)?.[1] ?? path.parse(input).name;
  await mdToPdf({ path: input }, {
    ...require('../config/pdf.cjs'),
    document_title: title,
    basedir,
    dest: output,
    stylesheet: [path.join(root, 'config', 'print.css')]
  });
  console.log(`PDF: ${output}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
