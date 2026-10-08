// node measure.mjs <module.js>  -> bbox, tris, named markers (world positions) as JSON
import * as THREE from './three.module.js';
import path from 'path';
const f = path.resolve(process.argv[2]);
const g = (await import(f)).default(THREE); g.updateMatrixWorld(true);
const box = new THREE.Box3(), v = new THREE.Vector3(); let tris = 0; const marks = {};
g.traverse((n) => { if (n.name && n.name.startsWith('mark_')) marks[n.name.slice(5)] = n.getWorldPosition(new THREE.Vector3()).toArray().map((x) => +x.toFixed(3));
  if (!n.isMesh) return; const p = n.geometry.attributes.position; tris += (n.geometry.index ? n.geometry.index.count : p.count) / 3;
  for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
console.log(JSON.stringify({ tris, min: box.min.toArray().map((x) => +x.toFixed(3)), max: box.max.toArray().map((x) => +x.toFixed(3)), joints: Object.keys(g.userData.joints || {}), marks }));
