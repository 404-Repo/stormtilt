// node anchors.mjs <id> <module> <waterlineY> [captainBack=3.25] [--tub]  -> merges entry into game/assets/boats.json
import * as THREE from './three.module.js'; import fs from 'fs'; import path from 'path';
const [id, file, wl, back = '3.25'] = process.argv.slice(2);
const g = (await import('file://' + path.resolve(file) + '?t=' + Date.now())).default(THREE); g.updateMatrixWorld(true);
const box = new THREE.Box3(), hb = new THREE.Box3(), v = new THREE.Vector3(); const decks = [];
g.traverse((n) => { if (!n.isMesh) return; if (/deck/.test(n.name)) decks.push(n); const p = n.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld); box.expandByPoint(v); if (/hull/.test(n.name)) hb.expandByPoint(v); } });
const bowZ = hb.max.z, sternZ = hb.min.z, captainZ = +(bowZ - +back).toFixed(3);
const rc = new THREE.Raycaster(); rc.set(new THREE.Vector3(0, 100, captainZ), new THREE.Vector3(0, -1, 0));
const hit = rc.intersectObjects(decks, false)[0];
const r = { length: +(box.max.z - box.min.z).toFixed(3), beam: +(hb.max.x - hb.min.x).toFixed(3), keelToDeck: hit ? +hit.point.y.toFixed(3) : null,
  captainZ, waterlineY: +(+wl).toFixed(3), mastTopY: +box.max.y.toFixed(3), bowZ: +bowZ.toFixed(3), sternZ: +sternZ.toFixed(3) };
const J = '/Users/atlas/astrocade-game7/game/assets/boats.json'; const all = fs.existsSync(J) ? JSON.parse(fs.readFileSync(J, 'utf8')) : {};
all[id] = r; fs.writeFileSync(J, JSON.stringify(all, null, 2)); console.log(id, JSON.stringify(r));
