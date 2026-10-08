// tug_barnacle, candidate C: hull lathed about the vertical axis and squashed to an elliptical plan, one lathe per paint colour, bow sheer warped up.
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

  // ---- hull: a lathe revolved about the vertical axis (round toy-tub reading), squashed to an ellipse
  //      in plan; each paint colour is its own lathe, so the stripes are exact; bow sheer warped up ----
  const L = 11, ZS = -5.5, B2 = 2.3, SH = 2.55, DECKD = 0.5;
  const prof = [[0.0, 0.2], [0.35, 0.22], [0.62, 0.34], [0.8, 0.6], [0.92, 0.95], [0.975, 1.22], [0.985, 1.34], [1.0, 1.8], [1.0, SH]];
  const rP = (y) => { if (y <= prof[0][1]) return 0; for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 1; };
  const rise = (z) => 0.75 * Math.pow(Math.max(0, z / (L / 2) - 0.1) / 0.9, 2) + 0.12 * Math.pow(Math.max(0, -z / (L / 2)), 2);
  const warp = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i) * (L / 2), x = p.getX(i) * B2;
    const w = Math.min(1, Math.max(0, (y - 1.4) / (SH - 1.4))); p.setXYZ(i, x, y + rise(z) * w * w, z); } geo.computeVertexNormals(); return geo; };
  const lathePart = (y0, y1, mat, n) => { const pts = []; const K = n || 6; for (let k = 0; k <= K; k++) { const y = y0 + (y1 - y0) * k / K; pts.push(new THREE.Vector2(Math.max(0.001, rP(y)), y)); }
    return add(warp(new THREE.LatheGeometry(pts, 64)), mat, 'hull'); };
  lathePart(0.2, 1.22, black, 10); lathePart(1.22, 1.34, white, 1); lathePart(1.34, SH, cobalt, 6);
  // bulwark inner wall and top cap as one lathe, deck as a warped ellipse disc
  { const IN = 0.9; const pts = [[IN, SH - DECKD], [IN, SH], [1.0, SH]].map(([r, y]) => new THREE.Vector2(r, y)); add(warp(new THREE.LatheGeometry(pts, 64)), white, 'bulwark'); }
  { const geo = new THREE.CircleGeometry(0.9, 64, 0, Math.PI * 2); geo.rotateX(-Math.PI / 2); geo.translate(0, SH - DECKD, 0);
    // warp the deck with the same bow rise as the bulwark foot (w at y = SH - DECKD)
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i) * (L / 2), w = Math.min(1, Math.max(0, (SH - DECKD - 1.4) / (SH - 1.4)));
      const r2 = (p.getX(i) ** 2 + p.getZ(i) ** 2) / 0.81; p.setXYZ(i, p.getX(i) * B2, SH - DECKD + rise(z) * w * w + 0.05 * (1 - r2), z); }
    geo.computeVertexNormals(); add(geo, deckM, 'deck'); }
  const half = (t) => B2 * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
  const zOf = (t) => ZS + t * L, tAt = (z) => Math.min(1, Math.max(0, (z - ZS) / L));
  const wDeck = Math.pow(Math.min(1, Math.max(0, (SH - DECKD - 1.4) / (SH - 1.4))), 2);
  const sheer = (t) => SH + rise(zOf(t));
  const bottom = () => 0.2;
  const xAt = (t, y) => half(t) * rP(Math.min(SH, y - rise(zOf(t)) * Math.pow(Math.min(1, Math.max(0, (y - 1.4) / (SH - 1.4))), 2)));
  const dY = (z, x) => { const t = tAt(z), h = Math.max(1e-3, half(t) * 0.9); return SH - DECKD + rise(z) * wDeck + 0.05 * (1 - ((x || 0) / h) ** 2); };
  // cap rail and rubbing strake as warped torus-like lathes
  { const ring = (y, r, rr, mat) => { const pts = []; for (let k = 0; k <= 8; k++) { const a = Math.PI * 2 * k / 8; pts.push(new THREE.Vector2(r + Math.cos(a) * rr, y + Math.sin(a) * rr * 2.2)); } return add(warp(new THREE.LatheGeometry(pts, 64)), mat); };
    ring(SH + 0.03, 0.985, 0.035, black); ring(SH - 0.75, 1.025, 0.028, black); }

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
