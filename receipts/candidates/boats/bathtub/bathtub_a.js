// bathtub,  Feet, taps, outboard, broom mast, towel and duck shared.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const DS = { side: THREE.DoubleSide };
  const enamel = M(0xf3eee3, 0.25, 0, null, DS), sunM = M(0xf2b630, 0.28, 0, null, DS), gold = M(0xc9a043, 0.3, 0.85, 'metal');
  const red = M(0xd7372f, 0.3), steel = M(0x8f9aa3, 0.3, 0.7, 'metal'), dark = M(0x2a2d33, 0.5), teak = M(0xa8652f, 0.6, 0, 'timber');
  const straw = M(0xc9a35a, 0.9, 0, 'fabric'), duckY = M(0xf2b630, 0.3), orange = M(0xe8762a, 0.35), black = M(0x111111, 0.3), ropeM = M(0xb59a6a, 0.85, 0, 'fabric');
  const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); if (name) m.name = name; g.add(m); return m; };
  const rod = (a, b, r, mat, rs, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r2 == null ? r : r2, r, d.length(), rs || 6, 1), mat);
    m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  const HA = 1.2, HB = 0.66, BOTY = 0.28, RIMY = 1.06, FLOOR = 0.38;
  // ---- shell: three lathes (outer enamel, sunflower roll rim, inner enamel) squashed to an oval plan ----
  const oval = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * HB, p.getY(i), p.getZ(i) * HA); geo.computeVertexNormals(); return geo; };
  const lat = (pts, mat, name) => add(oval(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 48)), mat, name);
  lat([[0.001, BOTY], [0.72, BOTY + 0.01], [0.84, BOTY + 0.04], [0.9, BOTY + 0.12], [0.94, 0.5], [0.975, 0.8], [1.0, RIMY - 0.03]], enamel, 'hull');
  lat([[0.995, RIMY - 0.04], [1.035, RIMY - 0.02], [1.05, RIMY + 0.02], [1.035, RIMY + 0.06], [0.995, RIMY + 0.075], [0.955, RIMY + 0.06], [0.94, RIMY + 0.02], [0.94, RIMY - 0.02]], sunM, 'hull');
  lat([[0.94, RIMY - 0.02], [0.915, 0.8], [0.88, 0.55], [0.83, FLOOR + 0.06], [0.74, FLOOR], [0.001, FLOOR]], enamel, 'deck');
  const rimAt = (a) => [Math.sin(a) * HB, Math.cos(a) * HA]; // plan point on the rim, a=0 at the bow
  // ---- four gold claw-and-ball feet ----
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    const x = sx * HB * 0.62, z = sz * HA * 0.66;
    rod([x, BOTY + 0.12, z], [x * 1.12, 0.09, z * 1.05], 0.075, gold, 8, 0.05);
    const ball = add(new THREE.SphereGeometry(0.08, 10, 8), gold); ball.position.set(x * 1.12, 0.08, z * 1.05);
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + (sx > 0 ? 0.3 : 3.4); const c = add(new THREE.TorusGeometry(0.06, 0.022, 5, 8, Math.PI * 0.9), gold);
      c.position.set(x * 1.12 + Math.cos(a) * 0.05, 0.08, z * 1.05 + Math.sin(a) * 0.05); c.rotation.set(Math.PI / 2, 0, a); }
    const cuff = add(new THREE.TorusGeometry(0.075, 0.025, 6, 12), gold); cuff.rotation.x = Math.PI / 2; cuff.position.set(x, BOTY + 0.1, z);
  }
  // ---- brass taps at the stern end ----
  { const z = -HA * 0.86; for (const x of [-0.16, 0.16]) { rod([x, RIMY, z], [x, RIMY + 0.22, z], 0.03, gold, 8); const h = add(new THREE.BoxGeometry(0.16, 0.03, 0.03), gold); h.position.set(x, RIMY + 0.24, z);
    const h2 = add(new THREE.BoxGeometry(0.03, 0.03, 0.16), gold); h2.position.set(x, RIMY + 0.24, z); }
    rod([0, RIMY + 0.18, z], [0, RIMY + 0.18, z + 0.18], 0.025, gold, 8); rod([-0.16, RIMY + 0.18, z], [0.16, RIMY + 0.18, z], 0.025, gold, 8); }
  // ---- outboard motor clamped on the stern ----
  { const z = -HA - 0.18;
    const cl = add(new THREE.BoxGeometry(0.26, 0.2, 0.22), steel); cl.position.set(0, RIMY + 0.02, -HA + 0.02);
    const cw = add(new THREE.CapsuleGeometry(0.2, 0.22, 4, 10), red); cw.scale.set(1, 0.85, 1.25); cw.position.set(0, RIMY + 0.4, z);
    const top = add(new THREE.BoxGeometry(0.3, 0.06, 0.48), M(0xf3eee3, 0.3)); top.position.set(0, RIMY + 0.66, z);
    const band = add(new THREE.CylinderGeometry(0.205, 0.205, 0.06, 16), M(0xf3eee3, 0.3)); band.scale.set(1, 1, 1.25); band.position.set(0, RIMY + 0.3, z);
    rod([0, RIMY + 0.12, z], [0, 0.32, z - 0.05], 0.06, steel, 10, 0.05);
    const pod = add(new THREE.CapsuleGeometry(0.07, 0.22, 4, 8), steel); pod.rotation.x = Math.PI / 2; pod.position.set(0, 0.3, z - 0.05);
    const fin = add(new THREE.BoxGeometry(0.03, 0.22, 0.14), steel); fin.position.set(0, 0.17, z - 0.02);
    for (let k = 0; k < 3; k++) { const bl = add(new THREE.BoxGeometry(0.05, 0.2, 0.025), red); const a = k * 2.094; bl.position.set(Math.sin(a) * 0.1, 0.3 + Math.cos(a) * 0.1, z - 0.22); bl.rotation.z = -a; }
    rod([0, RIMY + 0.45, z + 0.15], [0.05, RIMY + 0.55, z + 0.75], 0.03, steel, 6); const gr = add(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 8), black); gr.rotation.x = Math.PI / 2 - 0.15; gr.position.set(0.055, RIMY + 0.56, z + 0.82); }
  // ---- broom-handle mast with the broom head up top, a cross stick, and a striped towel sail ----
  const MZ = -0.78, MT = 3.15;
  rod([0, FLOOR, MZ], [0, MT, MZ], 0.035, teak, 8);
  { const bb = add(new THREE.CylinderGeometry(0.07, 0.17, 0.5, 12), straw); bb.position.set(0, MT + 0.25, MZ);
    const tie = add(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 12), red); tie.position.set(0, MT + 0.05, MZ);
    for (let k = 0; k < 10; k++) { const a = k * 0.628; rod([Math.cos(a) * 0.06, MT + 0.05, MZ + Math.sin(a) * 0.06], [Math.cos(a) * 0.19, MT + 0.56, MZ + Math.sin(a) * 0.19], 0.02, straw, 4); } }
  const YY = MT - 0.35; rod([-0.62, YY, MZ + 0.04], [0.62, YY, MZ + 0.04], 0.025, teak, 6);
  { const cols = [0x2a5bd7, 0xf3eee3, 0xd7372f, 0xf2b630, 0x2a5bd7, 0xf3eee3, 0xd7372f, 0xf2b630, 0x2a5bd7];
    const n = cols.length, w = 1.1 / n, H = 1.25, V = 8;
    for (let k = 0; k < n; k++) { const pos = [], idx = [];
      for (let j = 0; j <= V; j++) { const v = j / V; for (let i = 0; i <= 2; i++) { const x = -0.55 + (k + i / 2) * w; const bulge = 0.22 * Math.sin(Math.PI * v) * (1 - (x / 0.6) ** 2) + 0.03 * Math.sin(x * 9);
        pos.push(x, YY - 0.04 - v * H, MZ + 0.07 + bulge); } }
      for (let j = 0; j < V; j++) for (let i = 0; i < 2; i++) { const a = j * 3 + i, b = a + 3; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      add(geo, M(cols[k], 0.9, 0, 'fabric', DS), 'towel'); } }
  for (const s of [1, -1]) rod([0, MT - 0.1, MZ], [s * HB * 0.95, RIMY + 0.03, MZ + 0.15], 0.01, ropeM, 4);
  rod([0, MT - 0.1, MZ], [0, RIMY + 0.03, HA * 0.95], 0.01, ropeM, 4);
  // ---- rubber duck figurehead on the bow rim ----
  { const z = HA * 0.98, y = RIMY + 0.06;
    const body = add(new THREE.SphereGeometry(0.22, 14, 10), duckY); body.scale.set(0.85, 0.75, 1.15); body.position.set(0, y + 0.15, z);
    const tail = add(new THREE.ConeGeometry(0.1, 0.18, 10), duckY); tail.rotation.x = -2.2; tail.position.set(0, y + 0.26, z - 0.24);
    const head = add(new THREE.SphereGeometry(0.15, 14, 10), duckY); head.position.set(0, y + 0.42, z + 0.13);
    const beak = add(new THREE.SphereGeometry(0.09, 10, 6), orange); beak.scale.set(1.0, 0.4, 1.1); beak.position.set(0, y + 0.39, z + 0.29);
    for (const s of [1, -1]) { const e = add(new THREE.SphereGeometry(0.035, 8, 6), black); e.position.set(s * 0.085, y + 0.47, z + 0.23);
      const wg = add(new THREE.SphereGeometry(0.1, 10, 6), duckY); wg.scale.set(0.35, 0.6, 1); wg.position.set(s * 0.17, y + 0.17, z - 0.02); } }
  // a rope coil and a soap bar in the tub, both well aft of the captain's spot
  { const c = add(new THREE.TorusGeometry(0.13, 0.04, 6, 14), ropeM); c.rotation.x = Math.PI / 2; c.position.set(0.32, FLOOR + 0.18, -0.85);
    const sp = add(new THREE.CapsuleGeometry(0.05, 0.1, 3, 8), M(0x9fe0d0, 0.4)); sp.rotation.z = Math.PI / 2; sp.position.set(-HB * 0.92, RIMY + 0.1, -0.62); }

  // ---- placement ----
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
