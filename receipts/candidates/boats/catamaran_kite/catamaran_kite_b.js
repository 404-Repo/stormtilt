// catamaran_kite, candidate B: hulls are full lathes (spindles) revolved about z and stretched tall per station; rest as A.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const DS = { side: THREE.DoubleSide };
  const yellow = M(0xf2b630, 0.28, 0, null, DS), white = M(0xf3eee3, 0.3, 0, null, DS), cobalt = M(0x2a5bd7, 0.32, 0, null, DS);
  const teak = M(0xa8652f, 0.6, 0, 'timber'), steel = M(0x8f9aa3, 0.3, 0.7, 'metal'), rope = M(0xb59a6a, 0.85, 0, 'fabric');
  const netM = M(0x3d4a52, 0.9, 0, 'fabric', DS), sailW = M(0xf6f1e4, 0.85, 0, 'fabric', DS), sailC = M(0x2a5bd7, 0.8, 0, 'fabric', DS), dark = M(0x1c1f24, 0.4);
  const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); if (name) m.name = name; g.add(m); return m; };
  const mesh = (pos, idx, mat, name) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return add(geo, mat, name); };
  const rod = (a, b, r, mat, rs, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r2 == null ? r : r2, r, d.length(), rs || 6, 1), mat);
    m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  const box = (w, h, d, mat, x, y, z, name) => { const m = add(new THREE.BoxGeometry(w, h, d), mat, name); m.position.set(x, y, z); return m; };

  // ---- hulls: full lathes (round spindle sections) revolved about z, stretched tall per station ----
  const L = 12, ZS = -6, ST = 44, HX = 2.3;
  const half = (t) => t < 0.55 ? 0.42 - 0.12 * Math.pow((0.55 - t) / 0.55, 2) : 0.42 * Math.pow(Math.max(0, 1 - Math.pow((t - 0.55) / 0.45, 2)), 0.7);
  const sheer = (t) => 2.2 + 0.3 * Math.pow(Math.max(0, t - 0.4) / 0.6, 2) + 0.05 * Math.pow(Math.max(0, 0.4 - t) / 0.4, 2);
  const bottom = (t) => t < 0.2 ? 0.35 + 0.5 * Math.pow((0.2 - t) / 0.2, 1.5) : t > 0.62 ? 0.35 + (sheer(1) - 0.45) * Math.pow((t - 0.62) / 0.38, 1.7) : 0.35;
  const zOf = (t) => ZS + t * L, tAt = (z) => Math.min(1, Math.max(0, (z - ZS) / L));
  const CR = 0.1;
  const hull = (cx) => {
    const prof = []; for (let i = 0; i <= ST; i++) { const t = i / ST; prof.push(new THREE.Vector2(Math.max(0.004, half(t)), zOf(t))); }
    prof.unshift(new THREE.Vector2(0.001, ZS));
    const geo = new THREE.LatheGeometry(prof, 20); geo.rotateX(Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const z = p.getZ(i), t = tAt(z), r = Math.max(0.004, half(t)); const sx = p.getX(i) / r, sy = -p.getY(i) / r;
      const top = sheer(t) + CR, yb = bottom(t), yc = (top + yb) / 2, hh = (top - yb) / 2;
      p.setXYZ(i, cx + sx * r, yc + Math.sign(sy) * Math.pow(Math.abs(sy), 0.8) * hh, z); }
    geo.computeVertexNormals(); add(geo, yellow, 'hull');
    for (const s of [1, -1]) { const pts = []; for (let i = 0; i <= 30; i++) { const t = 0.02 + 0.96 * i / 30; pts.push(new THREE.Vector3(cx + s * (half(t) * 0.97 + 0.01), sheer(t) - 0.12, zOf(t))); }
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.035, 5, false), cobalt); }
    box(0.06, 1.0, 0.45, dark, cx, 0.5, 0.6, 'keel');
    const r = box(0.06, 1.4, 0.4, dark, cx, 0.95, ZS + 0.15, 'rudder'); r.rotation.x = -0.08;
    rod([cx, sheer(0) + 0.05, ZS + 0.15], [cx, sheer(0) + 0.05, ZS - 0.65], 0.03, teak, 5);
  };
  hull(HX); hull(-HX);
  const dH = (z) => sheer(tAt(z)) + CR;

  // ---- beams and trampoline ----
  const FZ = 4.2, MZ = 1.0, RZ = -3.6, TY = 2.17;
  for (const [z, r] of [[FZ, 0.09], [MZ, 0.13], [RZ, 0.11]]) { const y = Math.min(dH(z), dH(z)) + r * 0.4; rod([-HX, y, z], [HX, y, z], r, z === MZ ? white : teak, 12); }
  // dolphin striker under the main beam
  rod([0, dH(MZ) - 0.05, MZ], [0, dH(MZ) - 0.75, MZ], 0.04, steel, 5);
  for (const s of [1, -1]) rod([0, dH(MZ) - 0.75, MZ], [s * (HX - 0.1), dH(MZ) - 0.05, MZ], 0.012, steel, 4);
  {
    const x0 = -HX + 0.36, x1 = HX - 0.36, z0 = RZ + 0.1, z1 = FZ - 0.1;
    const pl = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), netM, 'deck_net'); pl.rotation.x = -Math.PI / 2; pl.position.set(0, TY, (z0 + z1) / 2);
    // rope grid over the net (the visible weave), plus lacing to the hulls
    for (let i = 0; i <= 14; i++) { const x = x0 + (x1 - x0) * i / 14; box(0.03, 0.03, z1 - z0, rope, x, TY + 0.02, (z0 + z1) / 2); }
    for (let i = 0; i <= 26; i++) { const z = z0 + (z1 - z0) * i / 26; box(x1 - x0, 0.03, 0.03, rope, 0, TY + 0.02, z); }
    for (const s of [1, -1]) for (let i = 0; i <= 10; i++) { const z = z0 + (z1 - z0) * i / 10; rod([s * x1, TY, z], [s * (HX - half(tAt(z)) * 0.7), sheer(tAt(z)) - 0.1, z], 0.012, rope, 4); }
    // a solid walkable deck surface for anchor measurement (invisible face of the net is the net itself)
    pl.name = 'deck';
  }

  // ---- wing mast (teardrop aerofoil extruded upward, twisted slightly) ----
  const MB = TY + 0.18, MT = MB + 14.2;
  {
    const sh = new THREE.Shape(); const c = 0.62, tk = 0.24;
    sh.moveTo(0.16, 0); sh.bezierCurveTo(0.16, tk / 2, 0.0, tk / 2, -0.06, tk / 2); sh.quadraticCurveTo(-c * 0.55, tk * 0.32, -c + 0.16, 0);
    sh.quadraticCurveTo(-c * 0.55, -tk * 0.32, -0.06, -tk / 2); sh.bezierCurveTo(0.0, -tk / 2, 0.16, -tk / 2, 0.16, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: MT - MB, steps: 10, bevelEnabled: false, curveSegments: 6 });
    // shape x -> z (leading edge forward), extrusion -> y
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const sx = p.getX(i), sy = p.getY(i), e = p.getZ(i), f = e / (MT - MB), k = 1 - 0.45 * f;
      p.setXYZ(i, sy * k, MB + e, MZ + sx * k); }
    geo.computeVertexNormals(); add(geo, white, 'mast');
    const cap = add(new THREE.SphereGeometry(0.08, 8, 6), cobalt); cap.position.set(0, MT, MZ);
    const ball = add(new THREE.SphereGeometry(0.16, 10, 8), steel); ball.position.set(0, MB - 0.05, MZ);
  }
  // shrouds, forestay bridle
  const W = 0.013;
  for (const s of [1, -1]) rod([0, MT - 3.0, MZ], [s * HX, dH(MZ - 0.6) + 0.02, MZ - 0.6], W, steel, 4);
  rod([0, MT - 2.4, MZ + 0.08], [0, TY + 0.6, FZ + 0.15], W, steel, 4);
  for (const s of [1, -1]) rod([0, TY + 0.6, FZ + 0.15], [s * HX, dH(5.3) + 0.02, 5.3], W, steel, 4);

  // ---- sails: cambered grids ----
  const sailGrid = (luff0, luff1, leech0, leech1, cam, mat, name, U, V, vLo, vHi, off) => {
    const pos = [], idx = []; const lo = vLo || 0, hi = vHi == null ? 1 : vHi;
    for (let j = 0; j <= V; j++) { const v = lo + (hi - lo) * j / V; for (let i = 0; i <= U; i++) { const u = i / U;
      const lz = luff0[2] + (luff1[2] - luff0[2]) * v, ly = luff0[1] + (luff1[1] - luff0[1]) * v;
      const ez = leech0[2] + (leech1[2] - leech0[2]) * v, ey = leech0[1] + (leech1[1] - leech0[1]) * v;
      const roach = (name === 'mainsail' ? 0.7 : 0.15) * Math.sin(Math.PI * v) * u;
      const x = cam * (1 - 0.5 * v) * Math.sin(Math.PI * Math.pow(u, 0.8)) * (1 - 0.3 * u) + (off || 0);
      pos.push(x, ly + (ey - ly) * u, lz + (ez - lz) * u - roach); } }
    for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) { const a = j * (U + 1) + i, b = a + U + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    return mesh(pos, idx, mat, name);
  };
  const BY = MB + 1.1, BZ = ZS + 0.4;
  rod([0, BY, MZ - 0.45], [0, BY, BZ], 0.06, white, 8);
  // square-top main: head extends aft at the top
  const mL0 = [0, BY + 0.1, MZ - 0.5], mL1 = [0, MT - 0.3, MZ - 0.25], mE0 = [0, BY + 0.12, BZ + 0.15], mE1 = [0, MT - 0.5, MZ - 1.9];
  sailGrid(mL0, mL1, mE0, mE1, 0.42, sailW, 'mainsail', 10, 18);
  for (const s of [1, -1]) sailGrid(mL0, mL1, mE0, mE1, 0.42, sailC, 'sailband', 10, 4, 0.5, 0.72, s * 0.025);
  for (let k = 1; k <= 6; k++) { const v = k / 7; const pts = []; for (let i = 0; i <= 4; i++) { const u = 0.15 + 0.85 * i / 4;
    const lz = mL0[2] + (mL1[2] - mL0[2]) * v, ly = mL0[1] + (mL1[1] - mL0[1]) * v, ez = mE0[2] + (mE1[2] - mE0[2]) * v, ey = mE0[1] + (mE1[1] - mE0[1]) * v;
    pts.push(new THREE.Vector3(0.42 * (1 - 0.5 * v) * Math.sin(Math.PI * Math.pow(u, 0.8)) * (1 - 0.3 * u), ly + (ey - ly) * u, lz + (ez - lz) * u - 0.7 * Math.sin(Math.PI * v) * u)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.022, 4, false), M(0xdcd3bf, 0.8, 0, 'fabric')); }
  // cobalt jib, high-cut for the foredeck
  sailGrid([0, TY + 1.55, FZ - 0.1], [0, MT - 3.0, MZ + 0.3], [0, TY + 3.3, MZ + 0.75], [0, MT - 3.0, MZ + 0.3], 0.3, sailC, 'jib', 8, 12);
  rod([0, TY + 0.6, FZ + 0.15], [0, TY + 1.55, FZ - 0.1], W, steel, 4);
  rod([0, BY - 0.02, BZ + 0.5], [0, dH(RZ) + 0.15, RZ], 0.014, rope, 4);
  // bow caps (cobalt tips) and stern steps
  for (const s of [1, -1]) { const c = add(new THREE.SphereGeometry(0.1, 8, 6), cobalt); c.position.set(s * HX, sheer(1) + 0.02, zOf(1) - 0.08); }

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
