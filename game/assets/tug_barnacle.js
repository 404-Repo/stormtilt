// tug_barnacle, candidate A: lofted full-bodied hull (custom BufferGeometry, superellipse plan, round bow),
// bulwarks with an inner wall, tyre fenders as tori, a swept pudding fender round the bow.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const DS = { side: THREE.DoubleSide };
  const cobalt = M(0x2a5bd7, 0.3, 0, null, DS), black = M(0x1c1f24, 0.35, 0, null, DS), white = M(0xf3eee3, 0.3, 0, null, DS);
  const rubber = M(0x22252a, 0.85), teak = M(0xa8652f, 0.6, 0, 'timber'), deckM = M(0xc89a62, 0.65, 0, 'timber', DS);
  const brass = M(0xc9a043, 0.3, 0.8, 'metal'), steel = M(0x8f9aa3, 0.3, 0.7, 'metal'), glass = M(0x23323d, 0.15, 0.3);
  const canvas = M(0xf4ead2, 0.85, 0, 'fabric', DS), rope = M(0xb59a6a, 0.85, 0, 'fabric'), sun = M(0xf2b630, 0.3);
  const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); if (name) m.name = name; g.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, name) => { const m = add(new THREE.BoxGeometry(w, h, d), mat, name); m.position.set(x, y, z); return m; };
  const rod = (a, b, r, mat, rs, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r2 == null ? r : r2, r, d.length(), rs || 6, 1), mat);
    m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  const tube = (pts, r, mat, seg, rs) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg || 40, r, rs || 6, false), mat);
  const mesh = (pos, idx, mat, name) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return add(geo, mat, name); };

  // ---- lines ----
  const L = 11, ZS = -5.5, ST = 56, B2 = 2.3, WL = 1.0, BW = 0.5;
  const half = (t) => { const u = 2 * t - 1, p = u < 0 ? 3.2 : 2.1; return B2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), p)), 1 / p); };
  const sheer = (t) => t < 0.45 ? 2.55 + 0.15 * Math.pow((0.45 - t) / 0.45, 2) : 2.55 + 0.75 * Math.pow((t - 0.45) / 0.55, 2);
  const bottom = (t) => t < 0.25 ? 0.2 + 1.25 * Math.pow((0.25 - t) / 0.25, 1.8) : t > 0.7 ? 0.2 + (sheer(1) - 0.35) * Math.pow((t - 0.7) / 0.3, 1.6) : 0.2;
  const N = 0.42, MM = 1.3;
  const zOf = (t) => ZS + t * L, tAt = (z) => Math.min(1, Math.max(0, (z - ZS) / L));
  const aOf = (t, y) => { const ys = sheer(t), yb = bottom(t); const q = Math.min(1, Math.max(0, (ys - y) / Math.max(1e-4, ys - yb))); return Math.acos(Math.pow(q, 1 / MM)); };
  const pt = (t, a) => { const ys = sheer(t), yb = bottom(t); return [half(t) * Math.pow(Math.sin(a), N), ys - (ys - yb) * Math.pow(Math.cos(a), MM)]; };
  const xAt = (t, y) => pt(t, aOf(t, y))[0];
  const band = (lo, hi, segs, mat) => {
    const pos = [], idx = [];
    for (const s of [1, -1]) {
      const base = pos.length / 3;
      for (let i = 0; i <= ST; i++) { const t = i / ST, a0 = aOf(t, lo(t)), a1 = aOf(t, hi(t));
        for (let j = 0; j <= segs; j++) { const [x, y] = pt(t, a0 + (a1 - a0) * j / segs); pos.push(s * x, y, zOf(t)); } }
      for (let i = 0; i < ST; i++) for (let j = 0; j < segs; j++) { const a = base + i * (segs + 1) + j, b = a + segs + 1;
        if (s < 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1); }
    }
    return mesh(pos, idx, mat, 'hull');
  };
  band((t) => bottom(t), () => 1.22, 12, black);
  band(() => 1.22, () => 1.34, 2, white);
  band(() => 1.34, (t) => sheer(t), 8, cobalt);
  // bulwark: inner wall and a cap, deck sunk BW below the sheer
  const IN = 0.9; const deckLvl = (t) => sheer(t) - BW;
  {
    const pos = [], idx = [];
    for (const s of [1, -1]) { const base = pos.length / 3;
      for (let i = 0; i <= ST; i++) { const t = i / ST, xo = half(t), xi = xo * IN - 0.02; pos.push(s * xi, deckLvl(t), zOf(t), s * xi, sheer(t), zOf(t), s * xo, sheer(t), zOf(t)); }
      for (let i = 0; i < ST; i++) for (let j = 0; j < 2; j++) { const a = base + i * 3 + j, b = a + 3; idx.push(a, a + 1, b, b, a + 1, b + 1); } }
    mesh(pos, idx, white, 'bulwark');
  }
  // deck
  const CAMB = 0.06; const deckY = (t, x) => { const b = Math.max(1e-3, half(t) * IN); return deckLvl(t) + CAMB * (1 - (x / b) * (x / b)); };
  {
    const pos = [], idx = [], K = 8;
    for (let i = 0; i <= ST; i++) { const t = i / ST, b = half(t) * IN; for (let k = 0; k <= K; k++) { const x = -b + 2 * b * k / K; pos.push(x, deckY(t, x), zOf(t)); } }
    for (let i = 0; i < ST; i++) for (let k = 0; k < K; k++) { const a = i * (K + 1) + k, b = a + K + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    mesh(pos, idx, deckM, 'deck');
  }
  const dY = (z, x) => deckY(tAt(z), x || 0);
  // cap rail and rubbing strake, one loop each round the whole hull
  const loop = (yf, k, off) => { const pts = []; for (let i = 0; i <= 40; i++) { const t = 0.005 + 0.99 * i / 40; pts.push([xAt(t, yf(t)) * k + off, yf(t), zOf(t)]); }
    const back = pts.slice().reverse().map(([x, y, z]) => [-x, y, z]); return pts.concat(back); };
  tube(loop((t) => sheer(t) + 0.03, 0.96, 0), 0.09, black, 180);
  tube(loop((t) => sheer(t) - 0.75, 1, 0.05), 0.07, black, 180);

  // ---- skeg, rudder, propeller ----
  { const sh = new THREE.Shape(); sh.moveTo(-3.9, 0.35); sh.lineTo(1.5, 0.3); sh.lineTo(0.9, 0.0); sh.lineTo(-3.2, 0.0); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1 }); geo.translate(0, 0.04, -0.1); geo.rotateY(Math.PI / 2); add(geo, black, 'keel');
    box(0.1, 0.9, 0.6, black, 0, 0.75, -4.6, 'rudder');
    const hub = add(new THREE.CylinderGeometry(0.1, 0.12, 0.25, 8), brass); hub.rotation.x = Math.PI / 2; hub.position.set(0, 0.62, -4.05);
    for (let i = 0; i < 3; i++) { const bl = box(0.06, 0.38, 0.12, brass, 0, 0, 0); bl.position.set(Math.cos(i * 2.09) * 0.2, 0.62 + Math.sin(i * 2.09) * 0.2, -4.05); bl.rotation.z = i * 2.09 - Math.PI / 2; } }

  // ---- tyre fenders round the sides and stern ----
  const tyre = (t, s) => { const y = sheer(t) - 0.62, x = xAt(t, y) + 0.14, z = zOf(t);
    const tg = add(new THREE.TorusGeometry(0.27, 0.13, 8, 14), rubber, 'fender');
    // outward normal of the plan outline
    const dt = 0.01, dx = (xAt(Math.min(1, t + dt), y) - xAt(Math.max(0, t - dt), y)) / (2 * dt * L); const ang = Math.atan2(dx, 1);
    tg.position.set(s * x, y, z); tg.rotation.y = s * (Math.PI / 2 - ang);
    rod([s * (x - 0.03), y + 0.38, z], [s * xAt(t, sheer(t)) * 0.97, sheer(t) + 0.05, z], 0.018, rope, 4); };
  for (const s of [1, -1]) for (let i = 0; i < 8; i++) tyre(0.14 + i * 0.085, s);
  // stern tyres
  for (const [x, z] of [[0, ZS + 0.12], [0.85, ZS + 0.42], [-0.85, ZS + 0.42]]) { const y = sheer(0.05) - 0.62;
    const tg = add(new THREE.TorusGeometry(0.27, 0.13, 8, 14), rubber, 'fender'); tg.position.set(x, y, z - 0.08); tg.rotation.y = Math.atan2(x, -1.2);
    rod([x, y + 0.38, z - 0.1], [x * 0.9, sheer(0.05), z + 0.1], 0.018, rope, 4); }
  // the ram: a fat pudding fender swept round the bow, and a second one down the stem
  { const pts = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + Math.PI * i / 16; const t = 1 - 0.13 * Math.abs(Math.cos(a)) ** 1.0 * 1; }
    const P = []; const y0 = sheer(0.97) - 0.42;
    for (const t of [0.78, 0.86, 0.92, 0.965, 0.99]) P.push([xAt(t, y0) + 0.22, y0, zOf(t)]);
    const tip = [0, y0, zOf(1) + 0.32]; const curve = P.map(([x, y, z]) => [-x, y, z]).concat([tip], P.slice().reverse());
    tube(curve, 0.36, rubber, 60, 10).name = 'fender';
    const sp = []; for (const y of [y0 - 0.05, y0 - 0.45, y0 - 0.85]) { const t = (() => { let lo = 0.6, hi = 1; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (bottom(m) < y) lo = m; else hi = m; } return lo; })(); sp.push([0, y, zOf(t) + 0.12]); }
    tube(sp, 0.26, rubber, 16, 8).name = 'fender'; }

  // ---- deckhouse, wheelhouse, funnel ----
  const hz0 = -2.75, hz1 = 0.25, dB = dY(-1.2, 0) - 0.02;
  box(2.7, 0.75, hz1 - hz0, teak, 0, dB + 0.37, (hz0 + hz1) / 2, 'deckhouse');
  const wz0 = -2.35, wz1 = 0.05, wy0 = dB + 0.75, WH = 1.65, WW = 2.2;
  box(WW, WH, wz1 - wz0, white, 0, wy0 + WH / 2, (wz0 + wz1) / 2, 'wheelhouse');
  box(WW + 0.5, 0.14, wz1 - wz0 + 0.5, teak, 0, wy0 + WH + 0.07, (wz0 + wz1) / 2, 'roof');
  box(WW + 0.06, 0.1, wz1 - wz0 + 0.06, teak, 0, wy0 + 0.05, (wz0 + wz1) / 2);
  // windows: front 3, sides 3, back 2, each a dark pane in a teak frame
  const pane = (w, h, x, y, z, ry) => { const f = box(w + 0.1, h + 0.1, 0.05, teak, x, y, z); f.rotation.y = ry; const p = box(w, h, 0.06, glass, x, y, z); p.rotation.y = ry;
    const n = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)); p.position.addScaledVector(n, 0.012); };
  for (let i = -1; i <= 1; i++) pane(0.5, 0.6, i * 0.68, wy0 + 1.05, wz1 + 0.02, 0);
  for (const s of [1, -1]) { for (let i = 0; i < 3; i++) pane(0.42, 0.5, s * (WW / 2 + 0.02), wy0 + 1.1, wz0 + 0.45 + i * 0.6, s * Math.PI / 2); }
  for (const x of [-0.5, 0.5]) pane(0.45, 0.5, x, wy0 + 1.1, wz0 - 0.02, Math.PI);
  // door on the port side of the deckhouse, life ring on the starboard wheelhouse wall
  box(0.06, 0.62, 0.55, teak, -1.37, dB + 0.37, -1.9);
  { const lr = add(new THREE.TorusGeometry(0.3, 0.09, 8, 16), sun); lr.position.set(WW / 2 + 0.1, wy0 + 0.45, -1.15); lr.rotation.y = Math.PI / 2; }
  // roof gear: searchlight, horn, mast lamp
  { const sl = add(new THREE.CylinderGeometry(0.16, 0.13, 0.32, 12), brass); sl.rotation.x = Math.PI / 2; sl.position.set(0.55, wy0 + WH + 0.42, wz1 - 0.3);
    const lens = add(new THREE.CircleGeometry(0.14, 12), M(0xfff2c4, 0.2, 0, null, { emissive: 0x806a30 })); lens.position.set(0.55, wy0 + WH + 0.42, wz1 - 0.13);
    rod([0.55, wy0 + WH + 0.14, wz1 - 0.3], [0.55, wy0 + WH + 0.28, wz1 - 0.3], 0.04, brass, 6);
    const hn = add(new THREE.ConeGeometry(0.1, 0.35, 10, 1, true), brass); hn.rotation.x = Math.PI / 2; hn.position.set(-0.6, wy0 + WH + 0.3, wz1 - 0.4); hn.material.side = THREE.DoubleSide; }
  // funnel: black with a sunflower band, behind the wheelhouse
  { const fz = -3.15, fy = dY(fz);
    const f = add(new THREE.CylinderGeometry(0.42, 0.48, 2.2, 16), black); f.position.set(0, fy + 1.1, fz);
    const bnd = add(new THREE.CylinderGeometry(0.432, 0.445, 0.4, 16), sun); bnd.position.set(0, fy + 1.55, fz);
    const lip = add(new THREE.TorusGeometry(0.42, 0.05, 6, 16), black); lip.rotation.x = Math.PI / 2; lip.position.set(0, fy + 2.2, fz); }
  // ---- stubby mast and steadying sail ----
  const MZ = -3.9, MB = dY(MZ), MT = MB + 6.4;
  rod([0, MB, MZ], [0, MT, MZ], 0.11, teak, 10, 0.08);
  rod([-0.9, MT - 0.7, MZ], [0.9, MT - 0.7, MZ], 0.05, teak, 6);
  { const c = add(new THREE.SphereGeometry(0.1, 8, 6), brass); c.position.set(0, MT + 0.05, MZ); }
  const BY = MB + 2.1, BZ = ZS + 0.35;
  rod([0, BY, MZ - 0.1], [0, BY + 0.15, BZ], 0.06, teak, 8);
  { const s = new THREE.Shape(); s.moveTo(-(MZ - 0.1), BY + 0.08); s.lineTo(-(MZ - 0.1), MT - 0.9); s.quadraticCurveTo(-(MZ - 0.9), (BY + MT) / 2, -(BZ + 0.15), BY + 0.22); s.closePath();
    const geo = new THREE.ShapeGeometry(s, 6); geo.rotateY(Math.PI / 2); add(geo, canvas, 'sail'); }
  for (const s of [1, -1]) rod([0, MT - 0.7, MZ], [s * xAt(tAt(MZ), sheer(tAt(MZ))) * 0.92, sheer(tAt(MZ)) + 0.05, MZ + 0.25], 0.015, steel, 4);
  rod([0, MT - 0.1, MZ], [0, wy0 + WH + 0.15, wz0 + 0.2], 0.015, steel, 4);

  // ---- deck fittings: bow bitts forward of the captain spot, towing bitts aft, ventilators ----
  for (const s of [1, -1]) { const z = 4.05, x = s * 0.75; rod([x, dY(z, x) - 0.02, z], [x, dY(z, x) + 0.42, z], 0.11, black, 10); const cp = add(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 10), black); cp.position.set(x, dY(z, x) + 0.44, z); }
  { const z = -4.6; for (const x of [-0.45, 0.45]) rod([x, dY(z) - 0.02, z], [x, dY(z) + 0.5, z], 0.12, black, 10); rod([-0.45, dY(z) + 0.38, z], [0.45, dY(z) + 0.38, z], 0.06, black, 6);
    const coil = add(new THREE.TorusGeometry(0.28, 0.07, 6, 16), rope); coil.rotation.x = Math.PI / 2; coil.position.set(0.9, dY(-4.2) + 0.06, -4.2); }
  for (const s of [1, -1]) { const z = 0.8, x = s * 1.05; rod([x, dY(z, x), z], [x, dY(z, x) + 0.6, z], 0.08, white, 8); const cw = add(new THREE.TorusGeometry(0.11, 0.07, 6, 10, Math.PI), white); cw.position.set(x, dY(z, x) + 0.6, z + 0.08); cw.rotation.y = Math.PI / 2; }
  // aft hatch
  box(1.1, 0.25, 0.9, teak, 0, dY(-4.0) + 0.12, -3.85);

  // ---- placement ----
  const bx = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bx.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = bx.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bx.min.y; o.position.z -= c.z; });
  return g;
}
