// lifebuoy, candidate 2: a lathe of a round section swept in eight sectors (phiLength), red and white quarters with
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
// white bands; rope as a tube
  const red = M(0xd7372f), white = M(0xf2efe2), rope = M(0xb59a6a, { roughness: 0.8 });
  const sec = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2; sec.push([0.29 + 0.085 * Math.cos(a), 0.075 * Math.sin(a)]); }
  // quarters: red with white wrap bands every 90 degrees
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; add(new THREE.LatheGeometry(V2(sec), 6, a + 0.18, Math.PI / 2 - 0.36), red);
    add(new THREE.LatheGeometry(V2(sec.map(([x, y]) => [x * 1.0 + (x > 0.29 ? 0.006 : -0.006), y * 1.08])), 2, a - 0.18, 0.36), white); }
  const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, sag = 0.02 * Math.abs(Math.sin(a * 2)); pts.push(new THREE.Vector3(Math.cos(a) * (0.385 + sag), 0, Math.sin(a) * (0.385 + sag))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 0.012, 4, true), rope);
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
