// cap_gilly candidate C: a blocky vinyl reading. Rounded-box jumper wrapped by thin white stripe hoops, rounded-box
// limbs and boots, sphere head with a bowl-cut hair shell, beanie with a ring of rib bars and a faceted pompom.
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
  const hairM = mat('hair', 0x6a3e22, { roughness: 0.5, side: THREE.DoubleSide });
  const eyeW = mat('eyeW', 0xffffff, { roughness: 0.25 });
  const eyeK = mat('eyeK', 0x15120f, { roughness: 0.2 });
  const hatG = mat('hatG', 0x2f8a4a, { roughness: 0.5 });
  const R = rig({ hipY: 0.6, hipX: 0.1, torsoY: 0.64, shY: 0.95, shX: 0.23, neckY: 0.99, headTop: 1.36, splay: 0.22, palm: 0.4 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- jumper ----
  add(T, rbox(0.42, 0.44, 0.32, 0.12), green, [0, 0.15, 0]);
  for (let i = 0; i < 3; i++) add(T, rbox(0.43, 0.05, 0.33, 0.12), white, [0, 0.0 + i * 0.1, 0]);
  add(T, cyl(0.1, 0.11, 0.07, 14), green, [0, 0.4, 0]);
  add(T, rbox(0.4, 0.12, 0.3, 0.06), trou, [0, -0.09, 0]);

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, rbox(0.14, 0.32, 0.14, 0.06), green, [0, -0.14, 0]);
    for (let i = 0; i < 2; i++) add(A, rbox(0.145, 0.04, 0.145, 0.06), white, [0, -0.08 - i * 0.1, 0]);
    add(A, rbox(0.13, 0.05, 0.13, 0.04), green, [0, -0.3, 0]);
    add(A, rbox(0.1, 0.12, 0.12, 0.045), skin, [0, -0.38, 0.01]);
    add(A, cap(0.02, 0.04, 2, 6), skin, [-sx * 0.05, -0.36, 0.045], [0.4, 0, -sx * 0.4]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, rbox(0.15, 0.4, 0.15, 0.06), trou, [0, -0.2, 0]);
    add(Lg, rbox(0.2, 0.07, 0.2, 0.03), cuffM, [0, -0.43, 0]);
    add(Lg, rbox(0.18, 0.12, 0.2, 0.06), boot, [0, -0.51, 0]);
    add(Lg, rbox(0.19, 0.1, 0.3, 0.05), boot, [0, -0.54, 0.05]);
    add(Lg, rbox(0.2, 0.025, 0.31, 0.01), cuffM, [0, -0.588, 0.05]);
  }

  // ---- head ----
  add(H, sph(0.18, 18, 14), skin, [0, 0.185, 0], [0, 0, 0], [1, 1.0, 0.95]);
  add(H, sph(0.036, 10, 8), skin, [0, 0.165, 0.175], [0, 0, 0], [1, 0.9, 1.1]);
  add(H, tor(0.058, 0.01, 4, 12, Math.PI), mat('mouth', 0x7a2e26, { roughness: 0.5 }), [0, 0.12, 0.155], [0.35, 0, Math.PI]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.045, 12, 8), eyeW, [sx * 0.065, 0.21, 0.145], [0, 0, 0], [0.85, 1.1, 0.6]);
    add(H, sph(0.025, 8, 6), eyeK, [sx * 0.065, 0.205, 0.17], [0, 0, 0], [1, 1.2, 0.6]);
    add(H, rbox(0.06, 0.016, 0.02, 0.008), hairM, [sx * 0.068, 0.268, 0.16], [0, 0, -sx * 0.12]);
    add(H, sph(0.034, 8, 6), cheek, [sx * 0.115, 0.14, 0.13], [0, 0, 0], [1, 0.7, 0.4]);
    add(H, sph(0.04, 8, 6), skin, [sx * 0.18, 0.18, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  // bowl cut: an open sphere shell over the back and sides
  add(H, new THREE.SphereGeometry(0.19, 16, 10, Math.PI * 0.7, Math.PI * 1.6, 0, Math.PI * 0.62), hairM, [0, 0.19, -0.005], [0, 0, 0], [1, 1, 1]);

  // ---- beanie ----
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; add(HT, box(0.045, 0.1, 0.035), hatG, [Math.sin(a) * 0.19, -0.02, Math.cos(a) * 0.19], [0, a, 0]); }
  add(HT, cyl(0.185, 0.185, 0.1, 20), hatG, [0, -0.02, 0]);
  add(HT, new THREE.SphereGeometry(0.182, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatG, [0, 0.03, 0], [0, 0, 0], [1, 0.95, 1]);
  const pom = new THREE.DodecahedronGeometry(0.1, 1);
  add(HT, pom, hatG, [0, 0.27, 0]);
  return finish(R, 1.55);

}
