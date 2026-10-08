// cap_nimbus candidate A: assembled from primitives (spheres, capsules, open cylinders, half-disc bicorne flaps).
// Admiral Nimbus: broad storm-grey admiral's coat, gold epaulettes and buttons, bicorne with cyan lightning, cloud beard.
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
  const dark = mat('dark', 0x3d424b, { roughness: 0.4 });
  const gold = mat('gold', 0xd2a640, { roughness: 0.3, metalness: 0.7, name: 'metal' });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const beard = mat('beard', 0xeef1f4, { roughness: 0.6 });
  const hatM = mat("hat", 0x2c2a36, { roughness: 0.32, side: THREE.DoubleSide });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 0.9, roughness: 0.3 });
  const R = rig({ hipY: 0.84, hipX: 0.14, torsoY: 0.92, shY: 1.29, shX: 0.36, neckY: 1.34, headTop: 1.66, splay: 0.2, palm: 0.5 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- torso: barrel chest, open coat skirt, vest, gold trim and buttons ----
  add(T, sph(1, 18, 11), coat, [0, 0.2, -0.01], [0, 0, 0], [0.36, 0.25, 0.27]);
  const hemTh0 = 0.32, hemLen = Math.PI * 2 - 0.64;
  add(T, new THREE.CylinderGeometry(0.31, 0.37, 0.44, 20, 1, true, hemTh0, hemLen), coat, [0, -0.13, 0.002], [0, 0, 0], [1.02, 1, 0.82]);
  add(T, new THREE.CylinderGeometry(0.375, 0.375, 0.035, 20, 1, true, hemTh0, hemLen), gold, [0, -0.335, 0], [0, 0, 0], [1.02, 1, 0.83]);
  // vest panel with two button columns
  add(T, rbox(0.3, 0.44, 0.1, 0.04), vest, [0, 0.06, 0.2]);
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) add(T, sph(0.024, 6, 4), gold, [sx * 0.075, 0.2 - i * 0.075, 0.255]);
  // lapels: gold piping running from collar to hem, both sides of the opening
  for (const sx of [-1, 1]) {
    seg(T, [sx * 0.17, 0.4, 0.2], [sx * 0.15, 0.0, 0.24], 0.016, gold, 6);
    seg(T, [sx * 0.15, 0.0, 0.24], [sx * 0.12, -0.33, 0.28], 0.016, gold, 6);
    add(T, box(0.08, 0.36, 0.03), coat, [sx * 0.2, 0.2, 0.235], [0.12, sx * 0.35, 0]);
    // coat-front buttons outside the lapels
    for (let i = 0; i < 3; i++) add(T, sph(0.022, 6, 4), gold, [sx * 0.26, 0.05 - i * 0.12, 0.2 - i * 0.005]);
  }
  // high collar, back vent, back buttons, trousers top
  add(T, cyl(0.2, 0.24, 0.1, 16, true), coat, [0, 0.43, -0.03]);
  add(T, tor(0.22, 0.014, 6, 20), gold, [0, 0.48, -0.03], [Math.PI / 2, 0, 0], [1, 1, 1]);
  add(T, box(0.02, 0.3, 0.02), dark, [0, -0.2, -0.3]);
  for (const sx of [-1, 1]) add(T, sph(0.026, 6, 4), gold, [sx * 0.09, -0.02, -0.285]);
  add(T, cyl(0.26, 0.27, 0.16, 16), dark, [0, -0.1, 0], [0, 0, 0], [1, 1, 0.8]);

  // ---- arms: beefy sleeve, gold cuff, big fist, epaulette with fringe ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.13, 12, 8), coat, [0, -0.02, 0]);
    add(A, cap(0.115, 0.3, 3, 10), coat, [0, -0.2, 0]);
    add(A, cyl(0.125, 0.125, 0.06, 14), gold, [0, -0.36, 0]);
    add(A, sph(0.115, 12, 9), skin, [0, -0.47, 0.01], [0, 0, 0], [0.95, 1, 1.05]);
    add(A, sph(0.045, 8, 6), skin, [-sx * 0.07, -0.44, 0.06]);
    add(A, cyl(0.15, 0.14, 0.04, 16), gold, [sx * 0.02, 0.11, 0], [0, 0, sx * 0.15]);
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI * 1.4 - Math.PI * 0.7;
      add(A, cyl(0.02, 0.02, 0.09, 5), gold, [sx * (0.02 + Math.cos(a) * 0.14), 0.05, Math.sin(a) * 0.13]);
    }
  }

  // ---- legs: dark trousers, big rounded boots ----
  for (const L of [R.legL, R.legR]) {
    add(L, cyl(0.1, 0.095, 0.6, 12), dark, [0, -0.3, 0]);
    add(L, cyl(0.125, 0.125, 0.22, 14), dark, [0, -0.66, 0]);
    add(L, sph(1, 12, 8), dark, [0, -0.75, 0.06], [0, 0, 0], [0.135, 0.095, 0.2]);
    add(L, cyl(0.135, 0.135, 0.035, 16), mat('sole', 0x2a2d33), [0, -0.825, 0.05], [0, 0, 0], [1, 1, 1.5]);
  }

  // ---- head: skin, glowing eyes, angry white brows, nose, cloud beard, white hair behind ----
  add(H, sph(0.175, 16, 12), skin, [0, 0.18, 0], [0, 0, 0], [1, 1.05, 0.95]);
  add(H, sph(0.045, 10, 8), skin, [0, 0.15, 0.165]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.038, 10, 8), glow, [sx * 0.065, 0.205, 0.14], [0, 0, 0], [1.1, 0.8, 0.6]);
    add(H, cap(0.032, 0.08, 2, 8), beard, [sx * 0.068, 0.25, 0.15], [0, 0, sx * (Math.PI / 2 - 0.4)]);
    add(H, sph(0.04, 10, 8), skin, [sx * 0.165, 0.18, 0]);
    add(H, sph(0.055, 10, 8), beard, [sx * 0.05, 0.115, 0.15], [0, 0, 0], [1.3, 0.7, 0.8]);
  }
  const puffs = [[0, 0.04, 0.12, 0.1], [-0.09, 0.07, 0.1, 0.08], [0.09, 0.07, 0.1, 0.08], [-0.13, 0.13, 0.05, 0.07], [0.13, 0.13, 0.05, 0.07],
    [0, -0.04, 0.1, 0.085], [-0.06, -0.01, 0.12, 0.07], [0.06, -0.01, 0.12, 0.07], [0, -0.1, 0.07, 0.06]];
  for (const [x, y, z, r] of puffs) add(H, sph(r * 1.12, 9, 6), beard, [x, y, z]);
  add(H, sph(0.16, 12, 8), beard, [0, 0.16, -0.05], [0, 0, 0], [1.05, 0.8, 1]);

  // ---- hat: bicorne worn athwartships, crown, two half-disc flaps, gold band and cockade, cyan bolts ----
  add(HT, sph(0.19, 14, 8), hatM, [0, -0.02, 0], [0, 0, 0], [1.05, 0.8, 0.5]);
  const flap = new THREE.CylinderGeometry(0.4, 0.4, 0.045, 24, 1, false, -Math.PI / 2, Math.PI);
  add(HT, flap, hatM, [0, -0.07, 0.06], [-Math.PI / 2 - 0.22, 0, 0], [1, 1, 0.7]);
  add(HT, flap, hatM, [0, -0.07, -0.06], [-Math.PI / 2 + 0.22, 0, 0], [1, 1, 0.7]);
  add(HT, tor(0.4, 0.016, 5, 16, Math.PI), gold, [0, -0.07, 0.085], [-0.22, 0, 0], [1, 0.7, 1]);
  add(HT, tor(0.4, 0.016, 5, 16, Math.PI), gold, [0, -0.07, -0.085], [0.22, 0, 0], [1, 0.7, 1]);
  add(HT, cyl(0.045, 0.045, 0.02, 14), gold, [0.17, 0.0, 0.085], [Math.PI / 2 - 0.22, 0, 0]);
  const bolt = shape([[0, 0], [0.03, 0.05], [0.012, 0.05], [0.04, 0.1], [-0.005, 0.042], [0.014, 0.042], [-0.012, 0]]);
  const bg = ext(bolt, 0.016, 0);
  for (const [x, y, rz, s] of [[-0.12, -0.01, 0.2, 1.2], [-0.03, 0.04, -0.3, 1], [0.08, -0.04, 0.4, 0.9]]) {
    add(HT, bg, glow, [x, y, 0.07 - (y + 0.07) * 0.22 + 0.025], [-0.22, 0, rz], [s, s, 1]);
    add(HT, bg, glow, [-x, y, -0.07 + (y + 0.07) * 0.22 - 0.025], [0.22, Math.PI, rz], [s, s, 1]);
  }
  return finish(R, 1.85);

}
