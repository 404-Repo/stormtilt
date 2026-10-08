// node inspect.mjs <module>: per-joint mesh bounds, tri and mesh counts
import { createRequire } from 'module';
const THREE = await import('/Users/atlas/telegram-workspace/valley-of-giants-404/node_modules/three/build/three.module.js'); void createRequire;
const mod = await import(process.argv[2] + '?' + Date.now());
const g = mod.default(THREE); g.updateMatrixWorld(true);
let tris = 0, meshes = 0;
g.traverse((n) => { if (!n.isMesh) return; meshes++; const t = n.geometry.attributes.position.count / 3; tris += t;
  const b = new THREE.Box3().setFromObject(n); const f = (v) => v.toArray().map((x) => x.toFixed(2)).join(',');
  if (process.argv[3]) console.log(n.parent.name.padEnd(14), (n.material.name||n.material.color.getHexString()).padEnd(8), String(t).padStart(5), f(b.min), '|', f(b.max)); });
const J = g.userData.joints; const w = (o) => o.getWorldPosition(new THREE.Vector3()).toArray().map((x) => x.toFixed(3)).join(',');
console.log('tris', tris, 'meshes', meshes); for (const k in J) console.log(' ', k.padEnd(6), w(J[k]));
const bb = new THREE.Box3().setFromObject(g); console.log('bounds', bb.min.toArray().map(x=>x.toFixed(3)), bb.max.toArray().map(x=>x.toFixed(3)));
