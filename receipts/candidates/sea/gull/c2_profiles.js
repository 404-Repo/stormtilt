// gull, candidate 2: profiles: lathe body along z, wings and tail as extruded planform shapes
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const white = M(0xf3eee3, { roughness: 0.6 }), grey = M(0x9aa4ad, { roughness: 0.6 }), black = M(0x26262b, { roughness: 0.6 }), beak = M(0xf2b630), eye = M(0x111111);
  const body = new THREE.LatheGeometry(V2([[0, -0.26], [0.03, -0.24], [0.07, -0.14], [0.088, -0.02], [0.085, 0.08], [0.07, 0.15], [0.062, 0.2], [0.055, 0.25], [0.03, 0.28], [0, 0.285]]), 10);
  body.rotateX(Math.PI / 2); body.scale(1, 0.92, 1); add(body, white);
  add(new THREE.SphereGeometry(0.06, 10, 8), white, 0, 0.045, 0.22);
  const bs = new THREE.ExtrudeGeometry(shape([[0, 0.015], [0.085, 0.0], [0.07, -0.012], [0, -0.02]]), { depth: 0.024, bevelEnabled: false }); bs.translate(0, 0, -0.012); const bm = add(bs, beak, 0, 0.04, 0.26); bm.rotation.y = -Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.01, 6, 4), eye, s * 0.048, 0.065, 0.245);
  const flat = (pts, mat, parent, y = 0, d = 0.02) => { const geo = new THREE.ExtrudeGeometry(shape(pts), { depth: d, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, y - d / 2, 0); return add(geo, mat, 0, 0, 0, parent); };
  // tail fan (shape y = -z)
  flat([[-0.04, 0.2], [0.04, 0.2], [0.07, 0.31], [0, 0.29], [-0.07, 0.31]], white, g, 0.0);
  const joints = {};
  for (const [name, s] of [['wingL', 1], ['wingR', -1]]) {
    const w = new THREE.Group(); w.name = name; w.position.set(s * 0.055, 0.03, 0.03); w.rotation.z = s * 0.16; g.add(w); joints[name] = w;
    const arm = [[0, -0.07], [0.27, -0.06], [0.27, 0.12], [0.1, 0.16], [0, 0.15]].map(([x, y]) => [s * x, y]);
    const armW = [[0, -0.07], [0.27, -0.06], [0.27, -0.02], [0, -0.03]].map(([x, y]) => [s * x, y]);
    flat(arm, grey, w); flat(armW, white, w, -0.004, 0.022);
    const hand = new THREE.Group(); hand.position.set(s * 0.265, 0, 0); hand.rotation.z = -s * 0.32; w.add(hand);
    flat([[0, -0.06], [0.2, -0.02], [0.2, 0.15], [0, 0.12]].map(([x, y]) => [s * x, y]), grey, hand);
    flat([[0.19, -0.02], [0.33, 0.06], [0.31, 0.17], [0.19, 0.15]].map(([x, y]) => [s * x, y]), black, hand, 0, 0.016);
  }
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.02, 0.018, 0.07), beak, s * 0.03, -0.065, -0.13);
  g.userData.joints = joints;
  // placement: base at y = 0, centred on x and z (vertex-measured)
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
