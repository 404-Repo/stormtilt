//@seed 97
//@expect {"depth":14,"height":9}
//@include _hull.js
  // c3, a different reading: a skeleton wreck. A full run of ribs and a keel carry the shape; planking survives only
  // toward the bow and thins out toward the break, so the hull reads as a ribcage from the side
  const NR = 13;
  for (let i = 0; i < NR; i++) { const s = 0.0 + 0.9 * i / (NR - 1), pts = []; const top = i < 4 ? 0.08 + 0.1 * rnd() : 0.02;
    for (let k = 0; k <= 8; k++) pts.push(hullPt(s, top + (1 - 2 * top) * k / 8, 0.05)); tube(pts, 0.16, TD, HG); }
  const keel = []; for (let i = 0; i <= 12; i++) keel.push(hullPt(-0.05 + 1.05 * i / 12, 0.5).add(new THREE.Vector3(0, -0.15, 0))); keel.push(hullPt(1, 0.5).add(new THREE.Vector3(0, sheerY(1) - keelY(1) + 0.6, 0.2))); tube(keel, 0.24, TD, HG);
  // surviving strakes: thin lofted ribbons, each starting further forward the higher it is
  const NS = 8;
  for (let k = 0; k < NS; k++) for (const side of [0, 1]) {
    const u0 = side ? 0.5 + k / NS * 0.5 : 0.5 - (k + 1) / NS * 0.5, u1 = u0 + 0.5 / NS * 0.9, s0 = 0.12 + 0.5 * hash3(k, side, 7) * (k / NS + 0.3);
    const pos = [], idx = [], R = 10;
    for (let i = 0; i <= R; i++) { const s = s0 + (1 - s0) * i / R; for (const u of [u0, u1]) { const q = hullPt(s, u); pos.push(q.x, q.y, q.z); } }
    for (let i = 0; i < R; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setIndex(idx); sg.computeVertexNormals();
    add(sg, k < 2 ? MOSS : (k % 2 ? T1 : T2), 0, 0, 0, HG);
  }
  for (const u of [0.0, 1.0]) { const pts = []; for (let i = 0; i <= 10; i++) pts.push(hullPt(0.25 + 0.75 * i / 10, u).add(new THREE.Vector3(0, 0.1, 0))); tube(pts, 0.17, T2, HG); }
  const bs = add(new THREE.CylinderGeometry(0.1, 0.2, 3.6, 8), TD, 0, 0, 0, HG); bs.position.set(0, sheerY(1) + 0.6, LH + 1.4); bs.rotation.x = Math.PI / 2 - 0.35;
//@include _extras.js
