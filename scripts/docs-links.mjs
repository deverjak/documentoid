// Checks local links and images in Markdown: the target file must exist and a #fragment must match a
// heading (GitHub-style slug) or an explicit id in the target. External URLs are not fetched.
// Usage: npm run docs:links -- <file.md|folder>...
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const targets = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
if (!targets.length || process.argv.includes('--help')) {
  console.log('Usage: npm run docs:links -- <file.md|folder>...');
  process.exit(process.argv.includes('--help') ? 0 : 1);
}

const skip = new Set(['node_modules', '.git', 'output', '.venv']);
function collect(target) {
  const stat = statSync(target);
  if (stat.isFile()) return target.toLowerCase().endsWith('.md') ? [path.resolve(target)] : [];
  return readdirSync(target, { withFileTypes: true })
    .filter(entry => !skip.has(entry.name) && !entry.name.startsWith('.'))
    .flatMap(entry => collect(path.join(target, entry.name)));
}

const stripCode = md => md.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');

function slug(heading) {
  return heading.trim().toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

const anchorCache = new Map();
function anchors(file) {
  if (!anchorCache.has(file)) {
    const md = stripCode(readFileSync(file, 'utf8'));
    const seen = new Map();
    const set = new Set();
    for (const [, text] of md.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
      const base = slug(text);
      const count = seen.get(base) ?? 0;
      set.add(count ? `${base}-${count}` : base);
      seen.set(base, count + 1);
    }
    for (const [, id] of md.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) set.add(id.toLowerCase());
    anchorCache.set(file, set);
  }
  return anchorCache.get(file);
}

let broken = 0;
let checked = 0;
for (const file of [...new Set(targets.flatMap(collect))]) {
  const md = stripCode(readFileSync(file, 'utf8'));
  const links = [
    ...[...md.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map(m => m[1]),
    ...[...md.matchAll(/^\s*\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/gm)].map(m => m[1]),
    ...[...md.matchAll(/<(?:img|a)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)].map(m => m[1])
  ];
  for (const link of links) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith('//')) continue;
    checked++;
    const [rawPath, fragment] = link.split('#');
    const target = rawPath ? path.resolve(path.dirname(file), decodeURIComponent(rawPath)) : file;
    let problem;
    if (!existsSync(target)) problem = 'soubor neexistuje';
    else if (fragment && target.toLowerCase().endsWith('.md') && !anchors(target).has(decodeURIComponent(fragment).toLowerCase())) problem = 'kotva nenalezena';
    if (problem) {
      broken++;
      console.log(`${path.relative(process.cwd(), file)}: ${link} (${problem})`);
    }
  }
}
console.log(`Zkontrolováno ${checked} lokálních odkazů, nefunkčních: ${broken}.`);
process.exitCode = broken ? 1 : 0;
