// Updates the vendored copy of cathrynlavery/diagram-design in .agents/skills/diagram-design.
// The copy must stay byte-identical to upstream: before replacing it, the script compares it with
// the commit recorded in third-party/diagram-design/source.json and stops on any local change.
// Usage: npm run diagram-design:update -- [--check] [--ref=<branch|tag|commit>] [--force]
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readdir, readFile, rm, writeFile, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const metaFile = path.join(root, 'third-party', 'diagram-design', 'source.json');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const force = args.includes('--force');
const refArg = args.find(arg => arg.startsWith('--ref='));
if (args.includes('--help') || args.some(arg => !['--check', '--force'].includes(arg) && !arg.startsWith('--ref='))) {
  console.log('Usage: npm run diagram-design:update -- [--check] [--ref=<branch|tag|commit>] [--force]');
  process.exit(args.includes('--help') ? 0 : 1);
}

function git(cwd, ...gitArgs) {
  const result = spawnSync('git', gitArgs, { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`git ${gitArgs.join(' ')}\n${result.stderr.trim()}`);
  return result.stdout.trim();
}

async function listFiles(dir, prefix = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...await listFiles(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

// Line endings are normalised so that a Windows checkout with autocrlf does not count as a change.
const normalise = buffer => buffer.toString('latin1').replace(/\r\n/g, '\n');

async function differences(upstreamDir, localDir) {
  const upstream = new Set(await listFiles(upstreamDir));
  const local = new Set(await listFiles(localDir));
  const changed = [];
  for (const file of new Set([...upstream, ...local])) {
    if (!upstream.has(file)) changed.push(`+ ${file}`);
    else if (!local.has(file)) changed.push(`- ${file}`);
    else if (normalise(await readFile(path.join(upstreamDir, file))) !== normalise(await readFile(path.join(localDir, file)))) changed.push(`M ${file}`);
  }
  return changed.sort();
}

const meta = JSON.parse(await readFile(metaFile, 'utf8'));
const destination = path.join(root, meta.destination);
const tmp = await mkdtemp(path.join(os.tmpdir(), 'diagram-design-'));
try {
  await run();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await rm(tmp, { recursive: true, force: true });
}

async function run() {
  console.log(`Stahuji ${meta.repository} ...`);
  git(tmp, 'clone', '--quiet', '--filter=blob:none', '--no-checkout', meta.repository, 'repo');
  const repo = path.join(tmp, 'repo');
  const target = refArg ? refArg.slice('--ref='.length) : 'origin/HEAD';
  const targetCommit = git(repo, 'rev-parse', '--verify', `${target}^{commit}`);

  if (targetCommit === meta.commit) {
    console.log(`Kopie je aktuální: ${meta.commit} (verze ${meta.skillVersion}).`);
    return;
  }
  const log = git(repo, 'log', '--oneline', `${meta.commit}..${targetCommit}`, '--', meta.path);
  console.log(`Upstream má jiný stav: ${meta.commit.slice(0, 12)} -> ${targetCommit.slice(0, 12)}`);
  console.log(log ? `Změny ve skillu:\n${log}` : 'Commity mezi verzemi skill nemění.');
  if (checkOnly) return;

  git(repo, 'checkout', '--quiet', meta.commit);
  const local = await differences(path.join(repo, meta.path), destination);
  if (local.length && !force) {
    console.error(`Kopie se liší od upstreamu ${meta.commit.slice(0, 12)}; aktualizace by tyto změny smazala:`);
    for (const line of local) console.error(`  ${line}`);
    console.error('Změny přesuň mimo kopii (např. styl do profilu ~/.diagram-design) nebo spusť znovu s --force.');
    process.exitCode = 1;
    return;
  }

  git(repo, 'checkout', '--quiet', targetCommit);
  const source = path.join(repo, meta.path);
  await access(path.join(source, 'SKILL.md'));
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
  for (const file of ['LICENSE', 'THIRD_PARTY_LICENSES.md']) {
    try {
      await cp(path.join(repo, file), path.join(path.dirname(metaFile), file));
    } catch {
      console.warn(`Upozornění: upstream už nemá ${file}; zkontroluj licenci ručně.`);
    }
  }

  const skill = await readFile(path.join(destination, 'SKILL.md'), 'utf8');
  const version = skill.match(/^\s*version:\s*"?([^"\n]+)"?/m)?.[1] ?? 'unknown';
  const updated = {
    ...meta,
    commit: targetCommit,
    skillVersion: version,
    copiedOn: new Date().toISOString().slice(0, 10),
    modifications: 'none',
    installation: `npm run diagram-design:update -- --ref=${targetCommit}`
  };
  await writeFile(metaFile, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`Aktualizováno na ${targetCommit.slice(0, 12)} (verze ${meta.skillVersion} -> ${version}).`);
  console.log('Další krok: npm run example, prohlédni git diff a zapiš případné změny příkazů do README.');
}
