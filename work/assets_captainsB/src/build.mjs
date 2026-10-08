// Assemble self-contained captain modules: header comment + kit + body. Output has no imports.
import fs from 'fs'; import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, '..');
const kit = fs.readFileSync(path.join(here, 'kit.js'), 'utf8');
const only = process.argv[2];
for (const f of fs.readdirSync(here).filter((f) => f.endsWith('.body.js')).sort()) {
  const name = f.replace('.body.js', ''), id = name.split('_')[0];
  if (only && !name.startsWith(only)) continue;
  const body = fs.readFileSync(path.join(here, f), 'utf8');
  const lines = body.split('\n'), head = [];
  while (lines.length && lines[0].startsWith('//')) head.push(lines.shift());
  const out = head.join('\n') + '\nexport default function (THREE) {\n' + kit + lines.join('\n') + '\n}\n';
  fs.mkdirSync(path.join(root, id), { recursive: true });
  fs.writeFileSync(path.join(root, id, name + '.js'), out);
  console.log('built', id + '/' + name + '.js');
}
