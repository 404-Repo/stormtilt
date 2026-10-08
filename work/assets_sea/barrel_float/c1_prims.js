// barrel_float, candidate 1: primitives: three cylinder frusta (bulge), torus hoops, end caps, lying along x
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const wood = M(0x8a5a32, { roughness: 0.65 }); wood.name = 'timber'; const end = M(0xa8652f, { roughness: 0.65 }); end.name = 'timber';
  const hoop = M(0x3a3836, { metalness: 0.6, roughness: 0.45 }); hoop.name = 'metal';
  const b = new THREE.Group(); g.add(b); b.rotation.z = Math.PI / 2; b.position.y = 0.33;
  add(new THREE.CylinderGeometry(0.33, 0.28, 0.3, 14), wood, 0, 0.3, 0, b); add(new THREE.CylinderGeometry(0.33, 0.33, 0.3, 14), wood, 0, 0, 0, b); add(new THREE.CylinderGeometry(0.28, 0.33, 0.3, 14), wood, 0, -0.3, 0, b);
  add(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 14), end, 0, 0.45, 0, b); add(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 14), end, 0, -0.45, 0, b);
  for (const [y, r] of [[0.4, 0.29], [0.2, 0.322], [-0.2, 0.322], [-0.4, 0.29]]) add(new THREE.TorusGeometry(r, 0.022, 4, 16), hoop, 0, y, 0, b).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), end, 0, 0.0, 0.335, b).rotation.x = Math.PI / 2;
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
