// lance_heavy, candidate C: different breakdown. Hewn octagonal shaft in three tapering sections joined by iron ferrules, flat iron straps along it,
// a crown coronel made as a custom wall whose rim rises into four points.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal || 0 }); if (name) m.name = name; return m; };
  const wood = M(0x5e3a1f, 0.65, 0, "timber"), iron = M(0x4a4f55, 0.45, 0.75, "metal"), leather = M(0x3b2416, 0.8, 0, "fabric"), steel = M(0x8f9aa3, 0.3, 0.75, "metal");
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const rS = (z) => 0.135 - 0.045 * (z - 1.0) / 4.0;
  lathe([[0.001, 0], [0.09, 0.03], [0.1, 0.09], [0.07, 0.14]], 10, iron);
  lathe([[0.07, 0.13], [0.078, 0.22], [0.072, 0.36], [0.078, 0.5], [0.082, 0.6]], 10, leather);
  const vb = lathe([[0.082, 0.6], [0.205, 0.6], [0.228, 0.63], [0.22, 0.66], [0.16, 0.76], [0.14, 0.92], [0.136, 1.0]], 16, iron); vb.material.side = THREE.DoubleSide;
  const segs = [[1.0, 2.35], [2.35, 3.7], [3.7, 5.0]];
  for (const [a, b] of segs) { const cy = new THREE.CylinderGeometry(rS(b), rS(a), b - a, 8); cy.rotateX(Math.PI / 2); const m = add(cy, wood); m.position.z = (a + b) / 2; }
  for (const z of [1.0, 2.35, 3.7, 4.98]) { const f = new THREE.CylinderGeometry(rS(z) + 0.02, rS(z) + 0.02, 0.12, 10); f.rotateX(Math.PI / 2); const m = add(f, iron); m.position.z = z; }
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 8; for (const [z0, z1] of segs) { const L = z1 - z0 - 0.16, zm = (z0 + z1) / 2, r = rS(zm) + 0.004;
    const s = add(new THREE.BoxGeometry(0.05, 0.012, L), iron); s.position.set(Math.cos(a) * r, Math.sin(a) * r, zm); s.rotation.z = a + Math.PI / 2; } }
  { const K = 32, pos = [], idx = [];
    for (let i = 0; i <= K; i++) { const a = i / K * Math.PI * 2, top = 5.3 + 0.17 * Math.pow(Math.abs(Math.cos(a * 2)), 3);
      for (const [r, z] of [[0.1, 5.0], [0.14, 5.08], [0.14, top]]) pos.push(Math.cos(a) * r, Math.sin(a) * r, z); }
    for (let i = 0; i < K; i++) for (let j = 0; j < 2; j++) { const a = i * 3 + j, b = a + 3; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ color: 0x4a4f55, roughness: 0.45, metalness: 0.75, side: THREE.DoubleSide }); m.name = "metal"; add(geo, m);
    const cap = new THREE.CircleGeometry(0.14, 16); const cm = add(cap, iron); cm.position.z = 5.22; }
  const tip = new THREE.ConeGeometry(0.05, 0.18, 8); tip.rotateX(Math.PI / 2); add(tip, iron).position.z = 5.3;
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
