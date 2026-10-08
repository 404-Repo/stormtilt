// reef_rocks, candidate 1: primitives: flat-shaded dodecahedra, foam caps as flattened icosahedra on each top
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  let sd = 5; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const rock = M(0x2f3438, { roughness: 0.25, flatShading: true }); rock.name = 'stone'; const rock2 = M(0x3a3f45, { roughness: 0.3, flatShading: true }); rock2.name = 'stone';
  const foam = M(0xf2efe2, { roughness: 0.7, flatShading: true });
  [[0, 0, 1.7, 0.85], [2.3, 0.8, 1.3, 0.7], [-2.4, 0.4, 1.4, 0.7], [1.0, -1.9, 1.1, 0.6], [-1.0, 1.9, 1.0, 0.6], [3.3, -1.0, 0.8, 0.5], [-3.4, -1.2, 0.8, 0.45], [0.3, 2.9, 0.6, 0.45]].forEach(([x, z, r, hs], i) => {
    const b = add(new THREE.DodecahedronGeometry(r, 0), i % 2 ? rock2 : rock, x, r * hs * 0.55, z); b.scale.set(1.1, hs, 1); b.rotation.y = rnd() * 6;
    const f = add(new THREE.IcosahedronGeometry(r * 0.62, 0), foam, x + (rnd() - 0.5) * 0.2, r * hs * 0.55 + r * hs * 0.72, z); f.scale.set(1.05, 0.3, 0.95); f.rotation.y = rnd() * 6; });
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
