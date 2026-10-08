// cap_nimbus candidate C: a blockier vinyl-toy reading. Rounded-box chest and head, the coat skirt as separate
// flared panels (back, two fronts, two sides), two-segment arms with mitten fists, one thick extruded bicorne.
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
  const coat = mat('coat', 0x737985, { roughness: 0.42, name: 'fabric' });
  const vest = mat('vest', 0x8d939c, { roughness: 0.42, name: 'fabric' });
  const dark = mat('dark', 0x3d424b, { roughness: 0.4 });
  const gold = mat('gold', 0xd2a640, { roughness: 0.3, metalness: 0.7, name: 'metal' });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const beard = mat('beard', 0xeef1f4, { roughness: 0.6 });
  const hatM = mat('hat', 0x2c2a36, { roughness: 0.32 });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 0.9, roughness: 0.3 });
  const R = rig({ hipY: 0.8, hipX: 0.15, torsoY: 0.88, shY: 1.26, shX: 0.37, neckY: 1.31, headTop: 1.67, splay: 0.2, palm: 0.53 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- chest block, vest front, buttons ----
  add(T, rbox(0.66, 0.52, 0.46, 0.13), coat, [0, 0.2, 0]);
  add(T, box(0.3, 0.5, 0.06), vest, [0, 0.12, 0.215]);
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) add(T, sph(0.026, 6, 4), gold, [sx * 0.075, 0.3 - i * 0.085, 0.25]);
  // lapels: coat-coloured strips angled outwards with gold piping on the inner edge
  for (const sx of [-1, 1]) {
    add(T, box(0.1, 0.5, 0.05), coat, [sx * 0.2, 0.2, 0.225], [0, 0, sx * 0.06]);
    add(T, box(0.025, 0.52, 0.03), gold, [sx * 0.155, 0.2, 0.25], [0, 0, sx * 0.06]);
    for (let i = 0; i < 3; i++) add(T, sph(0.022, 6, 4), gold, [sx * 0.25, 0.3 - i * 0.12, 0.25]);
  }
  // waist and trouser seat
  add(T, box(0.56, 0.2, 0.4), dark, [0, -0.08, 0]);
  // ---- coat skirt: flared panels hanging from the waist ----
  // a panel facing outward along yaw ry, flared out by -th at the hem (Euler YXZ: tilt in panel space, then yaw)
  const skirt = (x, z, ry, w, th = -0.13) => {
    add(T, box(w, 0.46, 0.05), coat, [x, -0.16, z], [th, ry, 0, 'YXZ']);
    const hz = -0.23 * Math.sin(th), hy = -0.23 * Math.cos(th);
    add(T, box(w + 0.01, 0.035, 0.065), gold, [x + hz * Math.sin(ry), -0.16 + hy, z + hz * Math.cos(ry)], [th, ry, 0, 'YXZ']);
  };
  skirt(0, -0.23, Math.PI, 0.6);                        // back
  for (const sx of [-1, 1]) {
    skirt(sx * 0.31, 0.0, sx * Math.PI / 2, 0.42);       // sides
    skirt(sx * 0.2, 0.2, 0, 0.2);                        // fronts
    add(T, box(0.025, 0.46, 0.03), gold, [sx * 0.1, -0.16, 0.255], [-0.13, 0, 0]);
  }
  add(T, box(0.025, 0.3, 0.03), dark, [0, -0.25, -0.26], [-0.12, 0, 0]);
  for (const sx of [-1, 1]) add(T, sph(0.026, 6, 4), gold, [sx * 0.1, -0.02, -0.235]);
  add(T, rbox(0.34, 0.1, 0.3, 0.04), coat, [0, 0.47, -0.02]);      // stand collar
  add(T, box(0.35, 0.02, 0.31), gold, [0, 0.52, -0.02]);

  // ---- arms: upper sleeve, forearm, gold cuff, mitten fist, epaulette block with fringe ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.135, 10, 6), coat, [0, -0.02, 0]);
    add(A, rbox(0.22, 0.24, 0.22, 0.09), coat, [0, -0.14, 0]);
    add(A, rbox(0.24, 0.17, 0.24, 0.09), coat, [0, -0.3, 0.01]);
    add(A, rbox(0.26, 0.05, 0.26, 0.02), gold, [0, -0.375, 0.01]);
    add(A, rbox(0.2, 0.17, 0.2, 0.08), skin, [0, -0.48, 0.02]);
    add(A, rbox(0.06, 0.09, 0.07, 0.03), skin, [-sx * 0.1, -0.45, 0.06]);
    add(A, rbox(0.28, 0.06, 0.26, 0.03), gold, [sx * 0.03, 0.11, 0], [0, 0, sx * 0.15]);
    for (let i = 0; i < 5; i++) add(A, cyl(0.022, 0.022, 0.09, 5), gold, [sx * 0.165, 0.05, -0.1 + i * 0.05]);
    for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) add(A, cyl(0.022, 0.022, 0.09, 5), gold, [sx * (0.05 + i * 0.04), 0.05, sz * 0.13]);
  }

  // ---- legs: rounded-box trousers, big rounded boots ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, rbox(0.19, 0.6, 0.2, 0.08), dark, [0, -0.3, 0]);
    add(Lg, rbox(0.25, 0.22, 0.26, 0.1), dark, [0, -0.67, 0]);
    add(Lg, rbox(0.25, 0.14, 0.4, 0.07), dark, [0, -0.73, 0.06]);
    add(Lg, rbox(0.27, 0.04, 0.42, 0.02), mat('sole', 0x2a2d33), [0, -0.785, 0.06]);
  }

  // ---- head: big rounded block, glowing eyes, angry brows, bulb nose, stacked-cloud beard ----
  add(H, rbox(0.34, 0.36, 0.32, 0.13), skin, [0, 0.19, 0]);
  add(H, sph(0.05, 8, 6), skin, [0, 0.17, 0.175]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.042, 8, 6), glow, [sx * 0.07, 0.215, 0.15], [0, 0, 0], [1.1, 0.8, 0.5]);
    add(H, rbox(0.11, 0.045, 0.06, 0.02), beard, [sx * 0.072, 0.265, 0.16], [0, 0, -sx * 0.4]);
    add(H, rbox(0.05, 0.08, 0.05, 0.02), skin, [sx * 0.18, 0.2, 0]);
    add(H, sph(0.06, 9, 6), beard, [sx * 0.058, 0.128, 0.175], [0, 0, sx * 0.3], [1.35, 0.7, 0.8]);
  }
  for (const [x, y, z, r] of [[0, -0.1, 0.16, 0.09], [-0.1, -0.05, 0.15, 0.08], [0.1, -0.05, 0.15, 0.08], [-0.17, 0.05, 0.1, 0.07], [0.17, 0.05, 0.1, 0.07],
    [0, 0.0, 0.18, 0.08], [-0.08, 0.06, 0.18, 0.06], [0.08, 0.06, 0.18, 0.06], [-0.05, -0.17, 0.12, 0.06], [0.05, -0.17, 0.12, 0.06]])
    add(H, sph(r, 8, 5), beard, [x, y, z]);
  add(H, rbox(0.36, 0.24, 0.12, 0.06), beard, [0, 0.16, -0.12]);   // hair at the back

  // ---- bicorne: one thick crescent, bevelled, with a gold rim band, crown fill and cockade ----
  const cres = new THREE.Shape(), W = 0.45, HH = 0.3, N = 12;
  cres.moveTo(-W, 0.0);
  for (let i = 1; i <= N; i++) { const t = i / N; cres.lineTo(-W + 2 * W * t, HH * Math.pow(Math.sin(Math.PI * t), 0.7)); }
  for (let i = N - 1; i >= 1; i--) { const t = i / N; cres.lineTo(-W + 2 * W * t, -0.02 + 0.07 * Math.sin(Math.PI * t)); }
  add(HT, ext(cres, 0.15, 0.03, 1, 6), hatM, [0, -0.09, 0]);
  add(HT, ext(cres, 0.12, 0, 1, 6), gold, [0, -0.096, 0], [0, 0, 0], [1.05, 1.08, 1]);
  add(HT, cyl(0.055, 0.055, 0.025, 14), gold, [0.21, 0.03, 0.11], [Math.PI / 2, 0, 0]);
  const bolt = shape([[0, 0], [0.034, 0.055], [0.014, 0.055], [0.045, 0.11], [-0.006, 0.045], [0.016, 0.045], [-0.014, 0]]);
  const bg = ext(bolt, 0.016, 0);
  for (const [x, y, rz, s] of [[-0.18, -0.02, 0.25, 1.5], [-0.05, 0.05, -0.3, 1.35], [0.07, -0.05, 0.45, 1.15], [0.3, -0.06, -0.2, 0.9]]) {
    add(HT, bg, glow, [x, y, 0.11], [0, 0, rz], [s, s, 1]);
    add(HT, bg, glow, [-x, y, -0.11], [0, Math.PI, rz], [s, s, 1]);
  }
  return finish(R, 1.85);

}
