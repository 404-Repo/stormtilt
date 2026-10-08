// lance_heavy, candidate B: primitives. Tapered cylinder shaft, eight iron ring bands (tori), cone vamplate, a cylinder-and-cones coronel.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal || 0 }); if (name) m.name = name; return m; };
  const wood = M(0x5e3a1f, 0.65, 0, "timber"), iron = M(0x4a4f55, 0.45, 0.75, "metal"), leather = M(0x3b2416, 0.8, 0, "fabric"), steel = M(0x8f9aa3, 0.3, 0.75, "metal");
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const rS = (z) => 0.135 - 0.045 * (z - 1.0) / 4.0;
  const P = (geo, mat, z) => { geo.rotateX(Math.PI / 2); const m = add(geo, mat); m.position.z = z; return m; };
  P(new THREE.SphereGeometry(0.09, 10, 8), iron, 0.09);
  P(new THREE.CylinderGeometry(0.072, 0.072, 0.46, 12), leather, 0.38);
  const vb = P(new THREE.CylinderGeometry(0.13, 0.225, 0.4, 20, 1, true), wood, 0.8); vb.material.side = THREE.DoubleSide;
  { const rr = add(new THREE.TorusGeometry(0.222, 0.025, 6, 22), iron); rr.position.z = 0.6; }
  P(new THREE.CylinderGeometry(rS(5.0), 0.135, 4.0, 14), wood, 3.0);
  for (let k = 0; k < 8; k++) { const z = 1.15 + k * 0.52; const t = add(new THREE.TorusGeometry(rS(z) + 0.006, 0.022, 5, 16), iron); t.position.z = z; }
  P(new THREE.CylinderGeometry(0.135, 0.1, 0.24, 14), iron, 5.1);
  for (let k = 0; k < 3; k++) { const a = k * 2.094; const p = P(new THREE.ConeGeometry(0.05, 0.28, 6), iron, 5.36); p.position.x = Math.cos(a) * 0.08; p.position.y = Math.sin(a) * 0.08; }
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
