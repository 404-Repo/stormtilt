// node measure.mjs <module.js> [captainZ]  -> bounds, tris, deck height probes (meshes named 'deck')
import * as THREE from './three.module.js';
import path from 'path';
const f = path.resolve(process.argv[2]);
const g = (await import('file://' + f + '?t=' + Date.now())).default(THREE);
g.updateMatrixWorld(true);
const box = new THREE.Box3(), v = new THREE.Vector3(); let tris = 0, meshes = 0; const mats = new Set();
g.traverse((n) => { if (!n.isMesh) return; meshes++; mats.add(n.material);
  const p = n.geometry.attributes.position; tris += (n.geometry.index ? n.geometry.index.count : p.count) / 3;
  for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
const r = { file: path.basename(f), tris: Math.round(tris), meshes, materials: mats.size,
  min: box.min.toArray().map((x) => +x.toFixed(3)), max: box.max.toArray().map((x) => +x.toFixed(3)) };
const decks = []; g.traverse((n) => { if (n.isMesh && /deck/.test(n.name)) decks.push(n); });
const rc = new THREE.Raycaster();
const probe = (x, z) => { rc.set(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0)); const h = rc.intersectObjects(decks, false); return h.length ? +h[0].point.y.toFixed(3) : null; };
// also: the highest hit of ANY mesh above the deck at the captain spot (clearance)
const all = []; g.traverse((n) => { if (n.isMesh) all.push(n); });
if (decks.length) { const zs = []; for (let z = Math.floor(box.min.z); z <= box.max.z; z += 0.5) zs.push([z, probe(0, z)]); r.deckProbe = zs; }
const cz = process.argv[3] != null ? +process.argv[3] : null;
if (cz != null) { r.captainDeck = probe(0, cz); r.captainDeckL = probe(-0.6, cz); r.captainDeckR = probe(0.6, cz);
  // obstacles in the 1.2 m wide x 1.2 m deep, 2.2 m tall box above the deck at the captain spot
  const hits = []; const dy = r.captainDeck;
  for (const n of all) { if (decks.includes(n)) continue; const p = n.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld);
      if (Math.abs(v.x) < 0.6 && Math.abs(v.z - cz) < 0.6 && v.y > dy + 0.01 && v.y < dy + 2.2) { hits.push(n.name || n.geometry.type); break; } } }
  r.captainObstacles = hits; }
console.log(JSON.stringify(r));
