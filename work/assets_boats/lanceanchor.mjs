// node lanceanchor.mjs <id> <module> <gripZ in build space> <buildMinZ> <buildMaxZ>
import * as THREE from './three.module.js'; import fs from 'fs'; import path from 'path';
const [id, file, gz, z0, z1] = process.argv.slice(2);
const g = (await import('file://' + path.resolve(file))).default(THREE); g.updateMatrixWorld(true);
const box = new THREE.Box3(), v = new THREE.Vector3(); let tipY = 0, tz = -1e9; g.traverse((n) => { if (!n.isMesh) return; const p = n.geometry.attributes.position; for (let i = 0; i < p.count; i++) { box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); if (v.z > tz) { tz = v.z; tipY = v.y; } } });
const off = (+z0 + +z1) / 2; // contract placement shifts by the build-space centre
const r = { length: +(box.max.z - box.min.z).toFixed(3), gripZ: +(+gz - off).toFixed(3), axisY: +tipY.toFixed(3), tipZ: +box.max.z.toFixed(3), buttZ: +box.min.z.toFixed(3) };
const J = '/Users/atlas/astrocade-game7/game/assets/boats.json'; const all = JSON.parse(fs.readFileSync(J, 'utf8')); all.lances = all.lances || {}; all.lances[id] = r;
fs.writeFileSync(J, JSON.stringify(all, null, 2)); console.log(id, JSON.stringify(r));
