// node build.mjs : assembles src/<id>/<cand>.js bodies + shared prelude into self-contained asset modules in cand/<id>/
// A body may start with lines:  //@seed N   //@ids idA:{json params};idB:{json}   //@expect {json}
import fs from 'fs'; import path from 'path';
const D = path.dirname(new URL(import.meta.url).pathname), S = path.join(D, 'src');
const pre = fs.readFileSync(path.join(S, '_prelude.js'), 'utf8'), place = fs.readFileSync(path.join(S, '_place.js'), 'utf8');
for (const grp of fs.readdirSync(S).filter((f) => !f.startsWith('_'))) {
  for (const f of fs.readdirSync(path.join(S, grp)).filter((f) => f.endsWith('.js'))) {
    const body = fs.readFileSync(path.join(S, grp, f), 'utf8');
    const seed = +(body.match(/\/\/@seed (\d+)/)?.[1] || 17);
    const ids = body.match(/\/\/@ids (.+)/)?.[1]?.split(';').map((s) => { const i = s.indexOf(':'); return [s.slice(0, i), s.slice(i + 1)]; }) || [[grp, '{}']];
    const exp = body.match(/\/\/@expect (.+)/)?.[1];
    for (const [id, params] of ids) {
      const P = JSON.parse(params);
      const src = `// ${id}, ${f.replace('.js', '')}. Built by the 404 method (reference image, three strategies, verify, pick by eye).\n` +
        `export default function (THREE) {\n  const g = new THREE.Group();\n  const P = ${JSON.stringify(P)};\n` + pre.replace('__SEED__', String(seed + (P.seedAdd || 0))) +
        body.split('\n').filter((l) => !l.startsWith('//@')).join('\n') + '\n' + place + '  return g;\n}\n';
      const od = path.join(D, 'cand', id); fs.mkdirSync(od, { recursive: true });
      fs.writeFileSync(path.join(od, f), src);
      const e = P.expect || (exp && JSON.parse(exp)); if (e) fs.writeFileSync(path.join(od, f.replace('.js', '.expect.json')), JSON.stringify(e));
    }
  }
}
console.log('built');
