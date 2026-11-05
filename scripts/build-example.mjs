import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(new URL('../output/diagrams/', import.meta.url), { recursive: true });
const commands = [
  ['python', ['.agents/skills/diagram-design/scripts/self_check.py', 'examples/diagrams/architecture.html']],
  ['python', ['.agents/skills/diagram-design/scripts/export_svg.py', 'examples/diagrams/architecture.html', 'output/diagrams/architecture.svg', '--system-fonts']],
  [process.execPath, ['scripts/markdown-to-pdf.mjs', 'examples/documentation.md', 'output/documentation.pdf']],
  [process.execPath, ['scripts/html-to-pdf.mjs', 'examples/diagrams/architecture.html', 'output/architecture.pdf', '--landscape']]
];
for (const [executable, args] of commands) {
  const result = spawnSync(executable, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
