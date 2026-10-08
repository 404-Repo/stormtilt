// lance_classic, candidate B: primitives. Cylinder shaft (tapered), two red helix tubes wound on it, cone vamplate, cone tip, sphere pommel.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal || 0 }); if (name) m.name = name; return m; };
  const white = M(0xf3eee3, 0.3), red = M(0xd7372f, 0.3), brass = M(0xc9a043, 0.3, 0.8, 'metal'), steel = M(0x8f9aa3, 0.3, 0.75, 'metal'), wrap = M(0x9e2a24, 0.7, 0, 'fabric'), teak = M(0xa8652f, 0.6, 0, 'timber');
  const add = (geo, mat, z) => { const mm = new THREE.Mesh(geo, mat); if (geo.type !== "TorusGeometry") geo.rotateX(Math.PI / 2); mm.position.z = z; g.add(mm); return mm; };
  // CylinderGeometry(rTop, rBottom): after rotateX(+90) top (+y) -> +z
  add(new THREE.SphereGeometry(0.065, 8, 6), teak, 0.065);
  add(new THREE.CylinderGeometry(0.052, 0.052, 0.48, 12), wrap, 0.36);
  for (let k = 0; k < 4; k++) add(new THREE.TorusGeometry(0.054, 0.008, 4, 12), M(0x6e1d18, 0.7), 0.17 + k * 0.13);
  add(new THREE.CylinderGeometry(0.09, 0.225, 0.34, 20, 1, true), brass, 0.79).material.side = THREE.DoubleSide;
  add(new THREE.TorusGeometry(0.222, 0.018, 6, 22), brass, 0.62);
  add(new THREE.CylinderGeometry(0.045, 0.085, 4.1, 12), white, 3.05);
  add(new THREE.ConeGeometry(0.055, 0.4, 12), steel, 5.3);
  add(new THREE.TorusGeometry(0.05, 0.012, 6, 12), brass, 5.1);
  for (const ph of [0, Math.PI]) {
    const pts = []; for (let i = 0; i <= 100; i++) { const z = 1.0 + 4.05 * i / 100, r = 0.085 - 0.04 * (z - 1.0) / 4.1, a = ph + 2 * Math.PI * (z - 1.0) / 0.55; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z)); }
    const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 72, 0.022, 3, false), red); g.add(t);
  }
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
