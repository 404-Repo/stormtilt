// lance_classic, candidate C: the shaft surface itself split into four helical colour bands (true barber pole), lathe vamplate with a dished face, faceted steel tip.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal || 0 }); if (name) m.name = name; return m; };
  const white = M(0xf3eee3, 0.3), red = M(0xd7372f, 0.3), brass = M(0xc9a043, 0.3, 0.8, 'metal'), steel = M(0x8f9aa3, 0.3, 0.75, 'metal'), wrap = M(0x9e2a24, 0.7, 0, 'fabric'), teak = M(0xa8652f, 0.6, 0, 'timber');
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const z0 = 0.98, z1 = 5.0, P = 0.6, r = (z) => 0.088 - 0.043 * (z - z0) / (z1 - z0);
  for (let band = 0; band < 4; band++) {
    const pos = [], idx = [], S = 64, W = 2;
    for (let i = 0; i <= S; i++) { const z = z0 + (z1 - z0) * i / S; const a0 = 2 * Math.PI * (z - z0) / P + band * Math.PI / 2;
      for (let j = 0; j <= W; j++) { const a = a0 + (Math.PI / 2) * j / W; pos.push(Math.cos(a) * r(z), Math.sin(a) * r(z), z); } }
    for (let i = 0; i < S; i++) for (let j = 0; j < W; j++) { const a = i * (W + 1) + j, b = a + W + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, band % 2 ? white : red);
  }
  lathe([[0.001, 0], [0.06, 0.03], [0.07, 0.08], [0.05, 0.13]], 12, brass);
  lathe([[0.05, 0.12], [0.055, 0.2], [0.05, 0.3], [0.055, 0.4], [0.05, 0.5], [0.058, 0.6]], 12, wrap);
  // vamplate: dished bell, open toward the hand, rolled rim
  const vb = lathe([[0.07, 0.6], [0.18, 0.61], [0.225, 0.635], [0.215, 0.66], [0.16, 0.72], [0.1, 0.86], [0.09, 1.0]], 22, brass); vb.material.side = THREE.DoubleSide;
  lathe([[0.001, 0.6], [0.07, 0.6]], 12, brass);
  lathe([[0.088, 0.97], [0.096, 0.99], [0.088, 1.01]], 12, brass);
  lathe([[0.045, 4.98], [0.06, 5.0], [0.06, 5.06], [0.05, 5.1], [0.001, 5.5]], 8, steel);
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
