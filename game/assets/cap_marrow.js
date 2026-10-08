// cap_marrow candidate B: profiles. Lathe greatcoat (open front, hem cut into tatters by vertex offsets), lathe sleeves,
// boots and head, a lathe hair curtain, a tricorn swept from a lathe pinched into three points, extruded serrated plumes.
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
  const coat = mat('coat', 0x6e6681, { roughness: 0.55, side: THREE.DoubleSide, name: 'fabric' });
  const cuff = mat('cuff', 0x47405a, { roughness: 0.5, side: THREE.DoubleSide, name: 'fabric' });
  const vest = mat('vest', 0x8399a0, { roughness: 0.5, side: THREE.DoubleSide, name: 'fabric' });
  const trou = mat('trou', 0x37334a, { roughness: 0.5, side: THREE.DoubleSide });
  const boot = mat('boot', 0x6b4a33, { roughness: 0.45, side: THREE.DoubleSide });
  const brass = mat('brass', 0xc9a043, { roughness: 0.3, metalness: 0.7, name: 'metal' });
  const skin = mat('skin', 0xa6dcd2, { roughness: 0.4, emissive: 0x9fe8ff, emissiveIntensity: 0.14 });
  const hair = mat('hair', 0xcfe3dc, { roughness: 0.5, emissive: 0x9fe8ff, emissiveIntensity: 0.06, side: THREE.DoubleSide });
  const hatM = mat('hat', 0x6a6674, { roughness: 0.5, side: THREE.DoubleSide });
  const plume = mat('plume', 0x84918f, { roughness: 0.6, side: THREE.DoubleSide });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 1.2, roughness: 0.3 });
  const dark = mat('mouth', 0x2d3a44, { roughness: 0.5 });
  const R = rig({ hipY: 0.8, hipX: 0.11, torsoY: 0.86, shY: 1.23, shX: 0.26, neckY: 1.27, headTop: 1.6, splay: 0.24, palm: 0.47 });
  const T = R.torso, H = R.head, HT = R.hat;
  const L = (pts, s, a0, al) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s, a0 || 0, al || Math.PI * 2);
  // lathe whose first profile point (the hem) is cut into tatters
  const tatter = (pts, s, a0, al, depth) => {
    const ge = L(pts, s, a0, al), p = ge.attributes.position, n = pts.length;
    for (let j = 0; j <= s; j++) { const i = j * n; p.setY(i, p.getY(i) - depth * (((j * 5) % 3) / 2 + (j % 2) * 0.5)); }
    ge.computeVertexNormals(); return ge;
  };
  const GAP = 0.45;

  // ---- greatcoat ----
  const coatP = [[0.3, -0.52], [0.27, -0.25], [0.23, -0.02], [0.24, 0.12], [0.26, 0.24], [0.24, 0.36], [0.16, 0.44], [0.12, 0.47]];
  add(T, tatter(coatP, 26, GAP, Math.PI * 2 - 2 * GAP, 0.08), coat, [0, 0, 0], [0, 0, 0], [1, 1, 0.78]);
  add(T, L([[0, -0.08], [0.21, -0.07], [0.225, 0.1], [0.23, 0.3], [0.15, 0.43], [0, 0.45]], 14), vest, [0, 0, 0], [0, 0, 0], [1, 1, 0.75]);
  for (let i = 0; i < 4; i++) add(T, sph(0.014, 6, 4), brass, [0.035, 0.26 - i * 0.075, 0.175]);
  add(T, L([[0.19, -0.2], [0.2, -0.06]], 14), trou, [0, 0, 0], [0, 0, 0], [1, 1, 0.75]);
  // collar: a short lathe flaring up behind the neck, and wide lapels
  add(T, L([[0.15, 0.42], [0.2, 0.5], [0.22, 0.56]], 12, Math.PI / 2 - 0.2, Math.PI + 0.4), coat, [0, 0, -0.01]);
  for (const sx of [-1, 1]) {
    add(T, box(0.08, 0.3, 0.025), coat, [sx * 0.105, 0.24, 0.17], [0.15, sx * 0.6, 0]);
    for (let i = 0; i < 3; i++) { const y = 0.05 - i * 0.12; add(T, sph(0.014, 6, 4), brass, [sx * 0.11, y, 0.205 + (0.05 - y) * 0.06]); }
  }
  add(T, box(0.12, 0.1, 0.02), cuff, [0.18, -0.22, 0.18], [0, 0.6, 0]);
  add(T, box(0.1, 0.11, 0.02), cuff, [-0.18, -0.34, -0.17], [0, -0.7, 0.15]);
  add(T, box(0.1, 0.08, 0.02), cuff, [0.1, 0.0, -0.2], [0, 0.4, -0.12]);

  // ---- sleeves ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, L([[0, 0.08], [0.07, 0.06], [0.085, 0.0], [0.075, -0.15], [0.07, -0.26], [0, -0.27]], 12), coat);
    add(A, tatter([[0.1, -0.36], [0.095, -0.26], [0.075, -0.24]], 14, 0, Math.PI * 2, 0.02), cuff);
    add(A, L([[0.06, -0.34], [0.085, -0.38], [0.055, -0.39]], 10), vest);
    add(A, L([[0, -0.38], [0.05, -0.39], [0.07, -0.44], [0.06, -0.5], [0, -0.53]], 10), skin, [0, 0, 0], [0, 0, 0], [0.85, 1, 1.15]);
    add(A, cap(0.022, 0.05, 2, 6), skin, [-sx * 0.05, -0.42, 0.04], [0.3, 0, -sx * 0.4]);
  }

  // ---- legs: breeches and folded-top boots ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, L([[0.085, 0.03], [0.085, -0.25], [0.07, -0.5], [0, -0.52]], 10), trou);
    add(Lg, L([[0, -0.78], [0.095, -0.78], [0.1, -0.7], [0.09, -0.56], [0.12, -0.54], [0.115, -0.47], [0.085, -0.48]], 12), boot);
    add(Lg, L([[0, 0], [0.095, 0.0], [0.1, 0.08], [0.07, 0.15], [0, 0.17]], 10), boot, [0, -0.735, 0], [Math.PI / 2, 0, 0], [1, 1, 0.5]);
    add(Lg, cyl(0.1, 0.1, 0.03, 12), mat('sole', 0x3a2a1f), [0, -0.785, 0.05], [0, 0, 0], [1.05, 1, 1.7]);
  }

  // ---- head ----
  add(H, L([[0, 0.0], [0.09, 0.015], [0.14, 0.09], [0.15, 0.18], [0.13, 0.27], [0.07, 0.315], [0, 0.32]], 16), skin, [0, 0, 0], [0, 0, 0], [1, 1, 0.95]);
  add(H, sph(0.022, 8, 6), skin, [0, 0.14, 0.142]);
  add(H, box(0.05, 0.01, 0.01), dark, [0, 0.085, 0.13]);
  for (const sx of [-1, 1]) add(H, sph(0.036, 10, 8), glow, [sx * 0.055, 0.175, 0.118], [0, 0, 0], [1, 1.1, 0.6]);
  // hair: a skull cap plus a wavy curtain over the back and sides
  add(H, L([[0.155, 0.17], [0.16, 0.24], [0.12, 0.31], [0.0, 0.335]], 14), hair, [0, 0, -0.005]);
  const curtain = L([[0.17, -0.17], [0.185, -0.02], [0.175, 0.12], [0.16, 0.24]], 16, Math.PI / 2 - 0.45, Math.PI + 0.9), cp = curtain.attributes.position;
  for (let j = 0; j <= 16; j++) { const i = j * 4; cp.setY(i, cp.getY(i) - 0.06 * Math.abs(Math.sin(j * 1.3))); cp.setX(i, cp.getX(i) * 1.2); cp.setZ(i, cp.getZ(i) * 1.2); }
  curtain.computeVertexNormals();
  add(H, curtain, hair, [0, 0, -0.01]);

  // ---- tricorn: lathe crown and a lathe brim pinched into three points with upturned sides ----
  add(HT, L([[0.17, -0.05], [0.15, 0.06], [0.11, 0.1], [0, 0.11]], 14), hatM);
  add(HT, L([[0.172, -0.05], [0.17, -0.015]], 14), cuff);
  const brim = L([[0.12, -0.03], [0.3, -0.05], [0.36, 0.0], [0.37, 0.06]], 36), bp = brim.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i), z = bp.getZ(i), y = bp.getY(i), phi = Math.atan2(x, z), r = Math.hypot(x, z);
    const k = 1 + 0.2 * Math.cos(3 * phi), up = Math.max(0, r - 0.2) * (0.6 - 0.6 * Math.cos(3 * phi));
    bp.setXYZ(i, x * k, y + up, z * k);
  }
  for (let j = 0; j <= 36; j++) { const i = j * 4 + 3; bp.setY(i, bp.getY(i) - 0.035 * (((j * 5) % 3) / 2) - (j % 2) * 0.015); }   // torn edge
  brim.computeVertexNormals();
  add(HT, brim, hatM, [0, 0.0, 0], [0, 0, 0], [1.02, 1, 1.02]);
  // serrated plumes: extruded leaf outlines bent backwards
  const leaf = new THREE.Shape(); leaf.moveTo(0, 0);
  for (let i = 1; i <= 8; i++) leaf.lineTo(0.05 * Math.sin(Math.PI * i / 9) + (i % 2) * 0.015, i * 0.045);
  for (let i = 8; i >= 1; i--) leaf.lineTo(-0.05 * Math.sin(Math.PI * i / 9) - (i % 2) * 0.015, i * 0.045 - 0.02);
  const fg = new THREE.ExtrudeGeometry(leaf, { depth: 0.012, bevelEnabled: false }), fp = fg.attributes.position;
  for (let i = 0; i < fp.count; i++) { const y = fp.getY(i); fp.setZ(i, fp.getZ(i) - 1.6 * y * y); }
  fg.computeVertexNormals();
  for (const [rz, ry, s, dz] of [[0.45, -0.5, 1.6, 0], [0.8, -0.3, 1.45, 0.04], [0.2, -0.7, 1.35, -0.03]])
    add(HT, fg, plume, [0.13, 0.06, 0.0 + dz], [0, ry, -rz, 'YXZ'], [s, s, s]);
  add(HT, sph(0.03, 8, 6), mat('bone', 0xd9d6c8, { roughness: 0.5 }), [0.13, 0.03, 0.13]);
  return finish(R, 1.85);

}
