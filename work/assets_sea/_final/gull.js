// gull, candidate 3: chunky faceted toy reading: icosahedron body and head, wings as custom cambered BufferGeometry
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const white = M(0xf3eee3, { roughness: 0.6, flatShading: true }), grey = M(0x9aa4ad, { roughness: 0.6, side: THREE.DoubleSide }), black = M(0x26262b, { roughness: 0.6, side: THREE.DoubleSide });
  const beak = M(0xf2b630, { flatShading: true }), eye = M(0x111111);
  add(new THREE.IcosahedronGeometry(1, 1), white).scale.set(0.09, 0.08, 0.23);
  add(new THREE.IcosahedronGeometry(0.068, 1), white, 0, 0.05, 0.2);
  const bk = add(new THREE.ConeGeometry(0.024, 0.1, 4), beak, 0, 0.04, 0.29); bk.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.011, 6, 4), eye, s * 0.052, 0.068, 0.23);
  add(new THREE.ConeGeometry(0.07, 0.16, 4), white, 0, 0.01, -0.28).rotation.x = -Math.PI / 2;
  // cambered wing: from root (x0) to tip (x1), chord c(x), leading edge z(x), arch height h along chord
  const wing = (s, x0, x1, chord, lead, mat, parent) => { const NX = 5, NC = 4, pos = [], idx = [];
    for (let i = 0; i <= NX; i++) { const t = i / NX, x = x0 + (x1 - x0) * t, c = chord(t), le = lead(t);
      for (let j = 0; j <= NC; j++) { const u = j / NC; pos.push(s * x, 0.025 * Math.sin(Math.PI * u) * (1 - 0.6 * t), le - c * u); } }
    for (let i = 0; i < NX; i++) for (let j = 0; j < NC; j++) { const p = i * (NC + 1) + j, q = p + NC + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return add(geo, mat, 0, 0, 0, parent); };
  const joints = {};
  for (const [name, s] of [['wingL', 1], ['wingR', -1]]) {
    const w = new THREE.Group(); w.name = name; w.position.set(s * 0.06, 0.03, 0.03); w.rotation.z = s * 0.15; g.add(w); joints[name] = w;
    wing(s, 0, 0.245, (t) => 0.22 - 0.02 * t, (t) => 0.08 - 0.01 * t, grey, w);
    const hand = new THREE.Group(); hand.position.set(s * 0.245, 0, 0); hand.rotation.z = -s * 0.3; w.add(hand);
    wing(s, 0, 0.18, (t) => 0.2 - 0.06 * t, (t) => 0.07 - 0.04 * t, grey, hand);
    wing(s, 0.18, 0.3, (t) => 0.14 - 0.12 * t, (t) => 0.03 - 0.06 * t, black, hand);
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
