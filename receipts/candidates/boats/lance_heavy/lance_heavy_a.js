// lance_heavy, candidate A: lathe body (pommel, grip, bell vamplate, thick tapered shaft), a helical iron strap as a ribbon, lathe coronel cup with four box prongs.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal || 0 }); if (name) m.name = name; return m; };
  const wood = M(0x5e3a1f, 0.65, 0, "timber"), iron = M(0x4a4f55, 0.45, 0.75, "metal"), leather = M(0x3b2416, 0.8, 0, "fabric"), steel = M(0x8f9aa3, 0.3, 0.75, "metal");
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const rS = (z) => 0.135 - 0.045 * (z - 1.0) / 4.0;
  lathe([[0.001, 0], [0.08, 0.02], [0.095, 0.07], [0.07, 0.13]], 12, iron);
  lathe([[0.07, 0.12], [0.075, 0.2], [0.07, 0.3], [0.075, 0.4], [0.07, 0.5], [0.08, 0.6]], 12, leather);
  const vb = lathe([[0.08, 0.6], [0.2, 0.61], [0.228, 0.64], [0.218, 0.67], [0.17, 0.74], [0.14, 0.9], [0.135, 1.0]], 20, wood); vb.material.side = THREE.DoubleSide;
  lathe([[0.001, 0.6], [0.08, 0.6]], 12, wood);
  lathe([[0.135, 1.0], [rS(5.0), 5.0], [0.001, 5.0]], 14, wood);
  { const pos = [], idx = [], S = 90, W = 2, z0 = 1.1, z1 = 4.9, P = 0.55, wa = 0.55;
    for (let i = 0; i <= S; i++) { const z = z0 + (z1 - z0) * i / S, r = rS(z) + 0.008, a0 = 2 * Math.PI * (z - z0) / P;
      for (let j = 0; j <= W; j++) { const a = a0 + wa * j / W; pos.push(Math.cos(a) * r, Math.sin(a) * r, z); } }
    for (let i = 0; i < S; i++) for (let j = 0; j < W; j++) { const a = i * (W + 1) + j, b = a + W + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); iron.side = THREE.DoubleSide; add(geo, iron); }
  for (const z of [1.05, 4.95]) lathe([[rS(z) + 0.004, z - 0.05], [rS(z) + 0.02, z - 0.03], [rS(z) + 0.02, z + 0.03], [rS(z) + 0.004, z + 0.05]], 14, iron);
  lathe([[0.095, 4.98], [0.13, 5.05], [0.14, 5.2], [0.12, 5.26], [0.05, 5.27], [0.001, 5.27]], 14, iron);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; const p = add(new THREE.ConeGeometry(0.045, 0.24, 6), iron); p.rotation.x = Math.PI / 2; p.position.set(Math.cos(a) * 0.09, Math.sin(a) * 0.09, 5.38); }
  const cc = add(new THREE.ConeGeometry(0.05, 0.2, 8), iron); cc.rotation.x = Math.PI / 2; cc.position.set(0, 0, 5.4);
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
