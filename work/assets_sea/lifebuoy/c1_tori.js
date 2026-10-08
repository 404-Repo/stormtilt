// lifebuoy, candidate 1: four torus arcs (quarters) lying flat, rope loops as thin torus arcs
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const red = M(0xd7372f), white = M(0xf2efe2), rope = M(0xb59a6a, { roughness: 0.8 });
  const R = 0.29, r = 0.085;
  for (let i = 0; i < 8; i++) { const t = add(new THREE.TorusGeometry(R, r, 10, 8, Math.PI / 4), i % 2 ? white : red); t.rotation.set(-Math.PI / 2, 0, i * Math.PI / 4); t.rotation.order = 'XYZ'; }
  // grab rope: four sagging loops between the white quarters
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const l = add(new THREE.TorusGeometry(0.36, 0.012, 4, 6, Math.PI / 2.4), rope, 0, 0.0, 0); l.rotation.set(-Math.PI / 2, 0, a - Math.PI / 4.8); }
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
