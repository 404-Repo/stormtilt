// cap_nimbus candidate B: built from profiles. Lathe greatcoat with a front opening (phi gap), lathe sleeves, boots,
// head and half-lathe beard; the bicorne is two extruded crescents with a gold rim plate behind each.
export default function (THREE) {
  // ---------- shared captain rig kit (STORMTILT captains B) ----------
  // Geometry is collected per (joint, material) and merged into one mesh each, so a captain is
  // ~20-30 meshes and every part stays rigid to its own joint. Faces +Z, +X is the captain's LEFT.
  const _mats = new Map();
  const mat = (key, color, o = {}) => {
    if (_mats.has(key)) return _mats.get(key);
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.38, metalness: 0 }, o));
    if (o.name) m.name = o.name;
    _mats.set(key, m); return m;
  };
  const _buckets = new Map();
  const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _m4 = new THREE.Matrix4();
  // add(node, geometry, material, position, rotation(euler XYZ), scale)
  const add = (node, geo, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => {
    let g2 = geo.index ? geo.toNonIndexed() : geo.clone();
    _e.set(r[0], r[1], r[2], r[3] || 'XYZ'); _q.setFromEuler(_e);
    const sc = typeof s === 'number' ? [s, s, s] : s;
    _m4.compose(new THREE.Vector3(p[0], p[1], p[2]), _q, new THREE.Vector3(sc[0], sc[1], sc[2]));
    g2.applyMatrix4(_m4);
    if (!_buckets.has(node)) _buckets.set(node, new Map());
    const b = _buckets.get(node);
    if (!b.has(m)) b.set(m, []);
    b.get(m).push(g2);
    return g2;
  };
  const _merge = (list) => {
    let n = 0; list.forEach((x) => { n += x.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    list.forEach((x) => {
      if (!x.attributes.normal) x.computeVertexNormals();
      pos.set(x.attributes.position.array, o * 3); nor.set(x.attributes.normal.array, o * 3);
      o += x.attributes.position.count;
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return out;
  };
  // geometry shorthands
  const sph = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt, rb, h, s = 14, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  const cap = (r, len, cs = 4, rs = 12) => new THREE.CapsuleGeometry(r, len, cs, rs);
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const tor = (r, t, rs = 8, ts = 20, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc);
  const lathe = (pts, s = 16) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s);
  const shape = (pts) => { const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); return sh; };
  const ext = (sh, depth, bev = 0.01, segs = 2, curve = 6) => {
    const ge = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bev > 0, bevelSize: bev, bevelThickness: bev, bevelSegments: segs, curveSegments: curve });
    ge.translate(0, 0, -depth / 2); return ge;   // centred on z (bevel adds 2*bev, see traps.md)
  };
  // rounded box: a box extruded from a rounded rectangle, centred
  const rbox = (w, h, d, rad = 0.03) => {
    const r = Math.min(rad, w / 2 - 0.001, h / 2 - 0.001), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
    const sh = new THREE.Shape();
    sh.moveTo(x, y - r); sh.lineTo(x + W, y - r); sh.absarc(x + W, y, r, -Math.PI / 2, 0); sh.lineTo(x + W + r, y + H);
    sh.absarc(x + W, y + H, r, 0, Math.PI / 2); sh.lineTo(x, y + H + r); sh.absarc(x, y + H, r, Math.PI / 2, Math.PI);
    sh.lineTo(x - r, y); sh.absarc(x, y, r, Math.PI, Math.PI * 1.5);
    const b = Math.min(rad, d / 2 - 0.001);
    const ge = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelSize: 0, bevelThickness: b, bevelSegments: 1, curveSegments: 2 });
    ge.translate(0, 0, -(d - 2 * b) / 2); return ge;
  };
  // tube between two points
  const seg = (node, a, b, r, m, s = 10, rb) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const ge = cyl(rb === undefined ? r : rb, r, L, s); ge.translate(0, L / 2, 0);
    ge.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    ge.translate(A.x, A.y, A.z); add(node, ge, m);
  };

  // the skeleton: every joint is a Group at the joint, geometry is added into it with offsets
  const rig = (d) => {
    const g = new THREE.Group();
    const J = (name, parent, x, y, z) => { const o = new THREE.Group(); o.name = name; o.position.set(x, y, z); parent.add(o); return o; };
    const torso = J('cap_torso', g, 0, d.torsoY, 0);
    const head = J('cap_head', torso, 0, d.neckY - d.torsoY, 0);
    const hat = J('cap_hat', head, 0, d.headTop - d.neckY, 0);
    const armL = J('cap_armL', torso, d.shX, d.shY - d.torsoY, 0);
    const armR = J('cap_armR', torso, -d.shX, d.shY - d.torsoY, 0);
    const legL = J('cap_legL', g, d.hipX, d.hipY, 0);
    const legR = J('cap_legR', g, -d.hipX, d.hipY, 0);
    // arm geometry lives in an inner group splayed out at the shoulder, so the joint rests at 0
    const armLg = J('cap_armL_geo', armL, 0, 0, 0); armLg.rotation.z = d.splay;
    const armRg = J('cap_armR_geo', armR, 0, 0, 0); armRg.rotation.z = -d.splay;
    const handL = new THREE.Object3D(); handL.name = 'cap_handL';
    handL.position.set(Math.sin(d.splay) * d.palm, -Math.cos(d.splay) * d.palm, d.palmZ || 0); armL.add(handL);
    const handR = new THREE.Object3D(); handR.name = 'cap_handR';
    handR.position.set(-Math.sin(d.splay) * d.palm, -Math.cos(d.splay) * d.palm, d.palmZ || 0); armR.add(handR);
    return { g, torso, head, hat, armL, armR, legL, legR, handL, handR, armLg, armRg, d };
  };

  // merge buckets into meshes, scale the whole figure to height H, base to y=0, centre x/z
  const finish = (R, H) => {
    for (const [node, b] of _buckets) for (const [m, list] of b) {
      const mesh = new THREE.Mesh(_merge(list), m); mesh.castShadow = true; mesh.receiveShadow = true; node.add(mesh);
    }
    const g = R.g;
    const meas = () => {
      const box3 = new THREE.Box3(), v = new THREE.Vector3();
      g.updateMatrixWorld(true);
      g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
        for (let i = 0; i < p.count; i++) box3.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
      return box3;
    };
    let bx = meas();
    const k = H / (bx.max.y - bx.min.y);
    g.traverse((n) => { if (n === g) return; n.position.multiplyScalar(k); if (n.isMesh) n.geometry.scale(k, k, k); });
    bx = meas();
    const c = bx.getCenter(new THREE.Vector3());
    g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bx.min.y; o.position.z -= c.z; });
    g.updateMatrixWorld(true);
    g.userData.joints = { torso: R.torso, head: R.head, hat: R.hat, armL: R.armL, armR: R.armR, legL: R.legL, legR: R.legR, handL: R.handL, handR: R.handR };
    return g;
  };
  // ---------- end kit ----------
  const coat = mat('coat', 0x737985, { roughness: 0.42, side: THREE.DoubleSide, name: 'fabric' });
  const vest = mat('vest', 0x8d939c, { roughness: 0.42, name: 'fabric' });
  const dark = mat('dark', 0x3d424b, { roughness: 0.4, side: THREE.DoubleSide });
  const gold = mat('gold', 0xd2a640, { roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide, name: 'metal' });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const beard = mat('beard', 0xeef1f4, { roughness: 0.6, side: THREE.DoubleSide });
  const hatM = mat('hat', 0x2c2a36, { roughness: 0.32, side: THREE.DoubleSide });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 0.9, roughness: 0.3 });
  const R = rig({ hipY: 0.82, hipX: 0.14, torsoY: 0.9, shY: 1.27, shX: 0.36, neckY: 1.32, headTop: 1.68, splay: 0.2, palm: 0.52 });
  const T = R.torso, H = R.head, HT = R.hat;
  const L = (pts, s, a0, al) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s, a0 || 0, al || Math.PI * 2);
  const ZS = 0.78, GAP = 0.36;

  // ---- greatcoat: one lathe profile, open at the front ----
  const coatP = [[0.385, -0.37], [0.35, -0.2], [0.315, -0.02], [0.33, 0.12], [0.365, 0.24], [0.345, 0.36], [0.24, 0.45], [0.15, 0.5]];
  add(T, L(coatP, 22, GAP, Math.PI * 2 - 2 * GAP), coat, [0, 0, 0], [0, 0, 0], [1, 1, ZS]);
  add(T, L([[0.39, -0.385], [0.395, -0.345]], 22, GAP, Math.PI * 2 - 2 * GAP), gold, [0, 0, 0], [0, 0, 0], [1.005, 1, ZS * 1.01]);
  // piping along both edges of the opening, following the coat profile
  for (const sg of [-1, 1]) for (let i = 0; i < coatP.length - 2; i++) {
    const P = (q) => [sg * q[0] * Math.sin(GAP) * 1.01, q[1], q[0] * Math.cos(GAP) * ZS * 1.01];
    seg(T, P(coatP[i]), P(coatP[i + 1]), 0.017, gold, 6);
  }
  // collar
  add(T, L([[0.16, 0.44], [0.2, 0.5], [0.21, 0.56]], 16), coat, [0, 0, -0.02], [0, 0, 0], [1, 1, 0.85]);
  add(T, L([[0.21, 0.555], [0.215, 0.575]], 16), gold, [0, 0, -0.02], [0, 0, 0], [1, 1, 0.85]);
  // vest and trousers inside the coat
  add(T, L([[0, -0.12], [0.29, -0.11], [0.305, 0.05], [0.31, 0.22], [0.29, 0.38], [0.18, 0.47], [0, 0.48]], 16), vest, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, L([[0.27, -0.3], [0.28, -0.1]], 14), dark, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) {
    const y = 0.28 - i * 0.085, x = sx * 0.075;
    add(T, sph(0.026, 6, 4), gold, [x, y, Math.sqrt(0.305 * 0.305 - x * x) * 0.8 + 0.008]);
  }
  // coat buttons outside the opening, back waist buttons and the vent
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 3; i++) add(T, sph(0.022, 6, 4), gold, [sx * 0.24, 0.08 - i * 0.13, 0.215 - i * 0.002]);
    add(T, sph(0.026, 6, 4), gold, [sx * 0.09, 0.0, -0.255]);
  }
  add(T, box(0.025, 0.28, 0.03), dark, [0, -0.22, -0.285]);

  // ---- sleeves: lathe with a swelling forearm, gold cuff lathe, chunky fist ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, L([[0, 0.12], [0.1, 0.09], [0.135, 0.0], [0.125, -0.18], [0.12, -0.32], [0.11, -0.36], [0, -0.37]], 14), coat);
    add(A, L([[0.128, -0.31], [0.135, -0.34], [0.13, -0.38], [0.11, -0.385]], 14), gold);
    add(A, L([[0, -0.38], [0.085, -0.39], [0.118, -0.46], [0.105, -0.54], [0.06, -0.575], [0, -0.58]], 12), skin, [0, 0, 0.01], [0, 0, 0], [1, 1, 1.1]);
    add(A, sph(0.048, 8, 6), skin, [-sx * 0.08, -0.45, 0.06]);
    // epaulette: a lathe pad with a fringe skirt
    add(A, L([[0, 0.15], [0.12, 0.14], [0.155, 0.11], [0.16, 0.09]], 14), gold, [sx * 0.03, 0, 0], [0, 0, sx * 0.15]);
    add(A, L([[0.16, 0.095], [0.175, 0.0]], 14, sx > 0 ? -0.3 : Math.PI - 0.3 , Math.PI + 0.6), gold, [sx * 0.03, 0, 0], [0, 0, sx * 0.15]);
  }

  // ---- legs: lathe trousers and boot shaft, lathe toe cap laid along +Z ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, L([[0.105, 0.02], [0.1, -0.3], [0.095, -0.58]], 12), dark);
    add(Lg, L([[0, -0.58], [0.12, -0.57], [0.13, -0.62], [0.125, -0.78], [0.135, -0.81], [0.13, -0.82], [0, -0.82]], 14), dark);
    // toe: lathe dome around Y, turned so its axis points forward, flattened vertically
    add(Lg, L([[0, 0], [0.125, 0.0], [0.13, 0.08], [0.1, 0.16], [0, 0.19]], 12), dark, [0, -0.76, 0.0], [Math.PI / 2, 0, 0], [1.02, 1, 0.55]);
    add(Lg, cyl(0.14, 0.14, 0.035, 14), mat('sole', 0x2a2d33), [0, -0.802, 0.06], [0, 0, 0], [1, 1, 1.55]);
  }

  // ---- head: lathe egg, glowing eyes, brows, nose, half-lathe cloud beard, hair at the back ----
  add(H, L([[0, 0], [0.12, 0.015], [0.175, 0.11], [0.185, 0.21], [0.16, 0.31], [0.09, 0.37], [0, 0.385]], 16), skin, [0, 0, 0], [0, 0, 0], [1, 1, 0.95]);
  add(H, sph(0.048, 10, 8), skin, [0, 0.17, 0.18]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.04, 10, 8), glow, [sx * 0.068, 0.215, 0.145], [0, 0, 0], [1.1, 0.8, 0.55]);
    add(H, cap(0.033, 0.085, 2, 8), beard, [sx * 0.07, 0.262, 0.155], [0, 0, sx * (Math.PI / 2 - 0.42)]);
    add(H, sph(0.042, 8, 6), skin, [sx * 0.18, 0.2, 0]);
    add(H, sph(0.058, 9, 6), beard, [sx * 0.055, 0.13, 0.165], [0, 0, sx * 0.3], [1.35, 0.7, 0.8]);
  }
  // beard: the front half of a lumpy lathe, so it reads as a cloud from the side as well
  const bp = []; for (let i = 0; i <= 10; i++) { const t = i / 10, y = -0.2 + t * 0.36; bp.push([0.215 * Math.sin(Math.PI * (0.15 + 0.85 * t)) ** 0.6 + 0.018 * Math.sin(t * 22), y]); }
  bp[0][0] = 0; add(H, L(bp, 14, -1.5, 3.0), beard, [0, 0.04, 0.07], [0, 0, 0], [1.02, 1, 0.8]);
  for (const [x, y, z, r] of [[0, -0.1, 0.17, 0.085], [-0.1, -0.05, 0.17, 0.075], [0.1, -0.05, 0.17, 0.075], [-0.16, 0.06, 0.12, 0.065], [0.16, 0.06, 0.12, 0.065], [0, 0.0, 0.2, 0.07], [-0.07, 0.06, 0.2, 0.06], [0.07, 0.06, 0.2, 0.06]])
    add(H, sph(r, 9, 6), beard, [x, y, z]);
  add(H, L([[0, 0.02], [0.15, 0.06], [0.19, 0.15], [0.19, 0.26], [0.12, 0.33]], 12, Math.PI / 2 + 0.2, Math.PI - 0.4), beard, [0, 0, -0.01]);

  // ---- bicorne: two extruded crescents leaning together, gold rim plates, a lathe crown between ----
  const cres = new THREE.Shape(), W = 0.44, HH = 0.27, N = 14;
  cres.moveTo(-W, 0.0);
  for (let i = 1; i <= N; i++) { const t = i / N; cres.lineTo(-W + 2 * W * t, HH * Math.pow(Math.sin(Math.PI * t), 0.75)); }
  for (let i = N - 1; i >= 1; i--) { const t = i / N; cres.lineTo(-W + 2 * W * t, 0.05 * Math.sin(Math.PI * t)); }
  const plate = ext(cres, 0.04, 0.012, 1, 6), rim = ext(cres, 0.03, 0, 1, 6);
  for (const sz of [1, -1]) {
    add(HT, plate, hatM, [0, -0.09, sz * 0.06], [-sz * 0.2, 0, 0]);
    add(HT, rim, gold, [0, -0.11, sz * 0.06], [-sz * 0.2, 0, 0], [1.06, 1.17, 1]);
  }
  add(HT, L([[0.2, -0.08], [0.2, 0.0], [0.15, 0.1], [0.06, 0.14], [0, 0.145]], 14), hatM, [0, -0.02, 0], [0, 0, 0], [1, 1, 0.55]);
  add(HT, cyl(0.05, 0.05, 0.025, 14), gold, [0.2, 0.02, 0.09], [Math.PI / 2 - 0.2, 0, 0]);
  const bolt = shape([[0, 0], [0.034, 0.055], [0.014, 0.055], [0.045, 0.11], [-0.006, 0.045], [0.016, 0.045], [-0.014, 0]]);
  const bg = ext(bolt, 0.016, 0);
  for (const [x, y, rz, s] of [[-0.17, -0.03, 0.25, 1.5], [-0.04, 0.03, -0.3, 1.35], [0.08, -0.05, 0.45, 1.15]]) {
    add(HT, bg, glow, [x, y, 0.06 - (y + 0.09) * 0.2 + 0.035], [-0.2, 0, rz], [s, s, 1]);
    add(HT, bg, glow, [-x, y, -0.06 + (y + 0.09) * 0.2 - 0.035], [0.2, Math.PI, rz], [s, s, 1]);
  }
  return finish(R, 1.85);

}
