// cap_gilly candidate B: profiles. One jumper profile cut into alternating lathe stripe bands, lathe sleeves, trousers,
// boots (shaft + forward-laid toe), lathe head, beanie as a lathe with ribs pushed out per segment, pompom of small spheres.
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
  const green = mat('green', 0x2f8f4e, { roughness: 0.6, name: 'fabric' });
  const white = mat('white', 0xf3eee3, { roughness: 0.6, name: 'fabric' });
  const trou = mat('trou', 0x4a3024, { roughness: 0.5 });
  const boot = mat('boot', 0x7a4a2a, { roughness: 0.35 });
  const cuffM = mat('bcuff', 0x4a3024, { roughness: 0.45 });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const cheek = mat('cheek', 0xe89a8a, { roughness: 0.5 });
  const hairM = mat('hair', 0x6a3e22, { roughness: 0.5 });
  const eyeW = mat('eyeW', 0xffffff, { roughness: 0.25 });
  const eyeK = mat('eyeK', 0x15120f, { roughness: 0.2 });
  const hatG = mat('hatG', 0x2f8a4a, { roughness: 0.5, side: THREE.DoubleSide });
  const R = rig({ hipY: 0.6, hipX: 0.09, torsoY: 0.64, shY: 0.95, shX: 0.22, neckY: 0.99, headTop: 1.35, splay: 0.22, palm: 0.4 });
  const T = R.torso, H = R.head, HT = R.hat;
  const L = (pts, s, a0, al) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s, a0 || 0, al || Math.PI * 2);
  // radius of a profile at height y (profile listed bottom to top)
  const rAt = (P, y) => { for (let i = 1; i < P.length; i++) if (y <= P[i][1]) { const t = (y - P[i - 1][1]) / (P[i][1] - P[i - 1][1]); return P[i - 1][0] + t * (P[i][0] - P[i - 1][0]); } return P[P.length - 1][0]; };
  const stripes = (node, P, ya, yb, n, segs, sc) => {
    for (let i = 0; i < n; i++) {
      const a = ya + (yb - ya) * i / n, b = ya + (yb - ya) * (i + 1) / n, pts = [];
      for (let k = 0; k <= 3; k++) { const y = a + (b - a) * k / 3; pts.push([rAt(P, y), y]); }
      add(node, L(pts, segs), i % 2 ? white : green, [0, 0, 0], [0, 0, 0], sc);
    }
  };

  // ---- jumper ----
  const jp = [[0.19, -0.1], [0.205, -0.04], [0.21, 0.1], [0.225, 0.24], [0.21, 0.32], [0.15, 0.38], [0.09, 0.41]];
  add(T, L([[0, -0.1], [0.19, -0.1]], 18), green, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, L([[0.19, -0.11], [0.2, -0.04]], 24), green, [0, 0, 0], [0, 0, 0], [1.02, 1, 0.82]);
  stripes(T, jp, -0.04, 0.3, 7, 18, [1, 1, 0.8]);
  add(T, L([[0.21, 0.3], [0.2, 0.33], [0.15, 0.38], [0.09, 0.41]], 18), green, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, L([[0.085, 0.38], [0.11, 0.4], [0.11, 0.45], [0.08, 0.46]], 14), green);   // roll neck
  add(T, L([[0.17, -0.2], [0.19, -0.1]], 14), trou, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);

  // ---- sleeves ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    const sp = [[0.07, -0.26], [0.072, -0.1], [0.078, 0.0], [0.06, 0.06]];
    add(A, L([[0, 0.075], [0.06, 0.06]], 12), green);
    stripes(A, sp, -0.26, 0.0, 5, 12, [1, 1, 1]);
    add(A, L([[0.072, -0.25], [0.076, -0.27], [0.072, -0.32], [0.05, -0.33]], 12), green);
    add(A, L([[0, -0.32], [0.045, -0.33], [0.058, -0.38], [0.05, -0.44], [0, -0.46]], 10), skin, [0, 0, 0.005], [0, 0, 0], [1, 1, 1.25]);
    add(A, cap(0.02, 0.04, 2, 6), skin, [-sx * 0.045, -0.36, 0.04], [0.4, 0, -sx * 0.4]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, L([[0.08, 0.03], [0.078, -0.2], [0.07, -0.4], [0, -0.42]], 12), trou);
    add(Lg, L([[0.088, -0.53], [0.09, -0.46], [0.1, -0.455], [0.105, -0.4], [0.08, -0.395]], 14), cuffM);
    add(Lg, L([[0, 0], [0.1, 0], [0.105, 0.09], [0.08, 0.17], [0, 0.2]], 12), boot, [0, -0.555, -0.03], [Math.PI / 2, 0, 0], [1.05, 1, 0.6]);
    add(Lg, cyl(0.1, 0.1, 0.06, 12), boot, [0, -0.53, 0]);
    add(Lg, cyl(0.11, 0.11, 0.025, 14), cuffM, [0, -0.588, 0.05], [0, 0, 0], [1, 1, 1.45]);
  }

  // ---- head ----
  add(H, L([[0, 0.0], [0.1, 0.012], [0.16, 0.09], [0.178, 0.19], [0.165, 0.29], [0.1, 0.35], [0, 0.36]], 18), skin, [0, 0, 0], [0, 0, 0], [1, 1, 0.95]);
  add(H, sph(0.034, 10, 8), skin, [0, 0.16, 0.172], [0, 0, 0], [1, 0.9, 1.1]);
  add(H, tor(0.055, 0.009, 4, 12, Math.PI), mat('mouth', 0x7a2e26, { roughness: 0.5 }), [0, 0.115, 0.155], [0.35, 0, Math.PI]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.042, 12, 8), eyeW, [sx * 0.062, 0.21, 0.14], [0, 0, 0], [0.85, 1.1, 0.6]);
    add(H, sph(0.023, 8, 6), eyeK, [sx * 0.062, 0.205, 0.163], [0, 0, 0], [1, 1.2, 0.6]);
    add(H, cap(0.012, 0.05, 2, 6), hairM, [sx * 0.065, 0.272, 0.15], [0, 0, sx * (Math.PI / 2 - 0.15)]);
    add(H, sph(0.032, 8, 6), cheek, [sx * 0.112, 0.14, 0.13], [0, 0, 0], [1, 0.7, 0.4]);
    add(H, sph(0.035, 8, 6), skin, [sx * 0.175, 0.18, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  // hair: a lathe cap open at the face, with a fringe flick at the front
  add(H, L([[0.172, 0.12], [0.185, 0.22], [0.16, 0.3], [0.1, 0.355], [0, 0.37]], 16, 0.6, Math.PI * 2 - 1.2), hairM);
  add(H, sph(0.08, 10, 6), hairM, [-0.05, 0.3, 0.12], [0, 0, 0.5], [1.3, 0.5, 0.6]);

  // ---- beanie ----
  const cuffG = L([[0.188, -0.07], [0.195, -0.03], [0.192, 0.02], [0.18, 0.025]], 32), cp = cuffG.attributes.position;
  for (let i = 0; i < cp.count; i++) { const j = Math.floor(i / 4), f = 1 + (j % 2) * 0.05; cp.setX(i, cp.getX(i) * f); cp.setZ(i, cp.getZ(i) * f); }
  cuffG.computeVertexNormals();
  add(HT, cuffG, hatG, [0, 0.0, 0]);
  add(HT, L([[0.18, 0.02], [0.18, 0.08], [0.15, 0.16], [0.09, 0.2], [0, 0.21]], 18), hatG);
  for (let i = 0; i < 14; i++) {
    const v = new THREE.Vector3(Math.sin(i * 2.4) * (0.5 + (i % 3) * 0.2), 0.6 + ((i * 3) % 5) * 0.1, Math.cos(i * 2.4) * (0.5 + (i % 3) * 0.2)).normalize();
    add(HT, sph(0.04, 7, 5), hatG, [v.x * 0.06, 0.26 + v.y * 0.04 - 0.02, v.z * 0.06]);
  }
  add(HT, sph(0.065, 10, 8), hatG, [0, 0.25, 0]);
  return finish(R, 1.55);

}
