// cap_kite candidate B: profiles. One lathe torso (V-taper), teal side panels as partial-phi lathe bands, lathe limbs and
// booties, lathe head, a spiky hair skirt (lathe with a jagged hem) under a lathe cap with an extruded bill worn backwards.
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
  const suit = mat('suit', 0x3557c9, { roughness: 0.42, name: 'fabric' });
  const teal = mat('teal', 0x1fa3a6, { roughness: 0.38, side: THREE.DoubleSide });
  const knee = mat('knee', 0x263f99, { roughness: 0.45 });
  const skin = mat('skin', 0xd49a6a, { roughness: 0.45 });
  const hairM = mat('hair', 0xf0c75a, { roughness: 0.5, side: THREE.DoubleSide });
  const red = mat('red', 0xd7372f, { roughness: 0.35, side: THREE.DoubleSide });
  const lens = mat('lens', 0x1c2128, { roughness: 0.15, metalness: 0.3 });
  const teeth = mat('teeth', 0xf3eee3, { roughness: 0.3 });
  const lip = mat('lip', 0x7a2e26, { roughness: 0.5 });
  const sole = mat('sole', 0x146f73, { roughness: 0.5 });
  const R = rig({ hipY: 0.9, hipX: 0.1, torsoY: 0.95, shY: 1.34, shX: 0.27, neckY: 1.39, headTop: 1.77, splay: 0.22, palm: 0.5 });
  const T = R.torso, H = R.head, HT = R.hat;
  const L = (pts, s, a0, al) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s, a0 || 0, al || Math.PI * 2);
  const dirE = (d) => { const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize())); return [e.x, e.y, e.z]; };

  // ---- torso ----
  const tp = [[0, -0.12], [0.16, -0.11], [0.175, -0.02], [0.16, 0.1], [0.2, 0.24], [0.25, 0.34], [0.22, 0.42], [0.1, 0.47], [0.075, 0.5]];
  add(T, L(tp, 18), suit, [0, 0, 0], [0, 0, 0], [1, 1, 0.68]);
  for (const sx of [-1, 1]) {   // teal side panel: the same profile, a narrow band of phi at each side, sitting proud
    const a0 = sx > 0 ? Math.PI / 2 - 0.28 : Math.PI * 1.5 - 0.28;
    add(T, L(tp.slice(1, 7).map((q) => [q[0] + 0.006, q[1]]), 4, a0, 0.56), teal, [0, 0, 0], [0, 0, 0], [1, 1, 0.68]);
  }
  add(T, box(0.02, 0.36, 0.02), teal, [0, 0.24, -0.16]);
  add(T, tor(0.035, 0.008, 4, 10, Math.PI * 1.2), teal, [0.1, 0.32, 0.155], [0, 0, 0.4]);
  add(T, tor(0.022, 0.008, 4, 10, Math.PI * 1.2), teal, [0.135, 0.33, 0.152], [0, 0, 0.4]);

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    const ap = [[0, 0.07], [0.07, 0.05], [0.085, -0.02], [0.07, -0.18], [0.068, -0.25], [0.062, -0.38], [0.05, -0.41], [0, -0.42]];
    add(A, L(ap, 12), suit);
    add(A, L(ap.slice(1, 6).map((q) => [q[0] + 0.004, q[1]]), 3, sx > 0 ? Math.PI / 2 - 0.35 : Math.PI * 1.5 - 0.35, 0.7), teal);
    add(A, L([[0, -0.4], [0.045, -0.41], [0.058, -0.48], [0.052, -0.58], [0, -0.61]], 10), skin, [0, 0, 0.005], [0, 0, 0], [1.05, 1, 1.6]);
    add(A, cap(0.024, 0.06, 2, 6), skin, [-sx * 0.05, -0.47, 0.07], [0.5, 0, -sx * 0.3]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, L([[0.095, 0.04], [0.095, -0.2], [0.08, -0.42], [0.072, -0.6], [0.07, -0.72]], 12), suit);
    add(Lg, sph(0.06, 10, 6), knee, [0, -0.44, 0.06], [0, 0, 0], [1, 1.2, 0.5]);
    add(Lg, L([[0.098, -0.68], [0.1, -0.8], [0.11, -0.86]], 12), teal);
    add(Lg, L([[0, 0], [0.1, 0], [0.105, 0.12], [0.07, 0.2], [0, 0.22]], 10), teal, [0, -0.855, -0.02], [Math.PI / 2, 0, 0], [1, 1, 0.4]);
    add(Lg, box(0.2, 0.035, 0.03), teal, [0, -0.81, 0.12]);
    add(Lg, sph(1, 10, 6), skin, [0, -0.835, 0.16], [0, 0, 0], [0.075, 0.035, 0.06]);
    add(Lg, rbox(0.2, 0.05, 0.33, 0.02), sole, [0, -0.875, 0.06]);
    for (let i = 0; i < 4; i++) add(Lg, box(0.21, 0.02, 0.03), sole, [0, -0.9, -0.07 + i * 0.08]);
  }

  // ---- head ----
  const HG = new THREE.Group(); HG.scale.setScalar(1.13); H.add(HG);
  add(HG, L([[0, 0.0], [0.08, 0.01], [0.13, 0.06], [0.145, 0.16], [0.14, 0.24], [0.1, 0.3], [0, 0.32]], 16), skin, [0, 0, 0], [0, 0, 0], [1, 1, 1]);
  add(HG, sph(0.03, 8, 6), skin, [0, 0.15, 0.152], [0, 0, 0], [0.9, 1, 1.1]);
  const half = (r) => new THREE.CylinderGeometry(r, r, 0.02, 12, 1, false, -Math.PI / 2, Math.PI);
  add(HG, half(0.062), lip, [0, 0.105, 0.124], [Math.PI / 2 - 0.25, 0, 0], [1, 1, 0.62]);
  add(HG, half(0.052), teeth, [0, 0.101, 0.132], [Math.PI / 2 - 0.25, 0, 0], [1, 1, 0.5]);
  for (const sx of [-1, 1]) {
    add(HG, rbox(0.085, 0.055, 0.03, 0.015), lens, [sx * 0.055, 0.2, 0.135], [0, sx * 0.2, 0]);
    add(HG, box(0.012, 0.012, 0.13), lens, [sx * 0.135, 0.205, 0.07]);
    add(HG, sph(0.032, 8, 6), skin, [sx * 0.143, 0.16, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  add(HG, box(0.04, 0.012, 0.012), lens, [0, 0.21, 0.15]);
  // hair: a lathe skirt from under the cap, its hem cut into spikes; open at the face
  const hs = L([[0.17, 0.12], [0.165, 0.2], [0.15, 0.27]], 20, 0.75, Math.PI * 2 - 1.5), hp = hs.attributes.position;
  for (let j = 0; j <= 20; j++) { const i = j * 3; hp.setY(i, hp.getY(i) - (j % 2) * 0.05); hp.setX(i, hp.getX(i) * (1.1 + (j % 2) * 0.12)); hp.setZ(i, hp.getZ(i) * (1.1 + (j % 2) * 0.12)); }
  hs.computeVertexNormals();
  add(HG, hs, hairM, [0, 0, -0.01]);
  for (const x of [-0.09, -0.04, 0.03, 0.09]) add(HG, new THREE.ConeGeometry(0.032, 0.09, 6), hairM, [x, 0.27, 0.11], dirE([x * 3, -0.4, 1]));

  // ---- cap: lathe crown, extruded bill pointing back ----
  const HC = new THREE.Group(); HC.scale.setScalar(1.13); HT.add(HC);
  add(HC, L([[0.165, -0.08], [0.165, -0.03], [0.14, 0.04], [0.08, 0.085], [0, 0.095]], 16), red, [0, 0, -0.01], [0, 0, 0], [1, 1, 1.04]);
  const bill = new THREE.Shape(); bill.moveTo(-0.14, 0); bill.quadraticCurveTo(0, 0.2, 0.14, 0); bill.lineTo(-0.14, 0);
  add(HC, ext(bill, 0.016, 0.004, 1, 8), red, [0, -0.07, -0.15], [Math.PI / 2 - 0.12, Math.PI, 0, 'YXZ']);
  add(HC, sph(0.02, 8, 6), red, [0, 0.09, -0.01]);
  add(HC, box(0.08, 0.025, 0.01), teeth, [0, -0.055, 0.165]);
  return finish(R, 1.85);

}
