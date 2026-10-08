// lance_classic, candidate A: one lathe for pommel+grip+shaft+tip, lathe vamplate, red helical ribbon wrapped on the white shaft.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal || 0 }); if (name) m.name = name; return m; };
  const white = M(0xf3eee3, 0.3), red = M(0xd7372f, 0.3), brass = M(0xc9a043, 0.3, 0.8, 'metal'), steel = M(0x8f9aa3, 0.3, 0.75, 'metal'), wrap = M(0x9e2a24, 0.7, 0, 'fabric'), teak = M(0xa8652f, 0.6, 0, 'timber');
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  // lathe y -> z after rotateX(+90deg)
  const rShaft = (z) => 0.085 - (0.085 - 0.045) * (z - 1.0) / 4.1;
  lathe([[0.001, 0], [0.05, 0.02], [0.065, 0.06], [0.05, 0.11], [0.045, 0.13]], 12, teak);
  lathe([[0.045, 0.12], [0.052, 0.15], [0.052, 0.58], [0.06, 0.62]], 12, wrap);
  lathe([[0.06, 0.6], [0.225, 0.64], [0.23, 0.68], [0.19, 0.74], [0.11, 0.9], [0.09, 1.02], [0.085, 1.05]], 20, brass);
  lathe([[0.084, 1.0], [rShaft(5.1), 5.1], [0.05, 5.12], [0.001, 5.5]].slice(0, 2).concat([[0.001, 5.1]]), 14, white);
  lathe([[0.001, 5.08], [0.055, 5.1], [0.05, 5.14], [0.001, 5.5]], 12, steel);
  // helical ribbon: band of half the circumference... here a 0.11 m wide ribbon, pitch 0.5 m
  { const pos = [], idx = [], S = 140, W = 3, z0 = 1.05, z1 = 5.08, P = 0.5, wa = 1.35;
    for (let i = 0; i <= S; i++) { const z = z0 + (z1 - z0) * i / S, r = rShaft(z) + 0.004, a0 = 2 * Math.PI * (z - z0) / P;
      for (let j = 0; j <= W; j++) { const a = a0 + wa * j / W; pos.push(Math.cos(a) * r, Math.sin(a) * r, z); } }
    for (let i = 0; i < S; i++) for (let j = 0; j < W; j++) { const a = i * (W + 1) + j, b = a + W + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    red.side = THREE.DoubleSide; add(geo, red); }
  // a brass collar where the shaft meets the tip
  const col = add(new THREE.TorusGeometry(0.052, 0.012, 6, 14), brass); col.position.z = 5.09;
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
