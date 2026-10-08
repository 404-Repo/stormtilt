// lance_copper, candidate C: different reading. Shaft swept from a fluted star profile (ExtrudeGeometry along z, like a lightning rod),
// the coil as a flat helical ribbon (custom BufferGeometry), a teardrop flask bulb (lathe) with a zigzag bolt inside.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {})); if (name) m.name = name; return m; };
  const copper = M(0xc46a3a, 0.3, 0.8, "metal"), coilM = M(0xd9824a, 0.25, 0.9, "metal"), brass = M(0xc9a043, 0.3, 0.8, "metal"), leather = M(0x5a3420, 0.8, 0, "fabric");
  const glass = M(0x9fe8ff, 0.08, 0.1, null, { transparent: true, opacity: 0.45, depthWrite: false }), spark = M(0x9fe8ff, 0.4, 0, null, { emissive: 0x9fe8ff, emissiveIntensity: 1.2 });
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const rS = (z) => 0.078 - 0.02 * (z - 1.0) / 3.5;
  lathe([[0.001, 0], [0.07, 0.02], [0.08, 0.07], [0.06, 0.13]], 12, brass);
  lathe([[0.06, 0.12], [0.066, 0.3], [0.06, 0.45], [0.066, 0.6]], 12, leather);
  const vb = lathe([[0.07, 0.6], [0.205, 0.6], [0.226, 0.625], [0.214, 0.65], [0.13, 0.72], [0.09, 0.85], [0.08, 1.0]], 20, brass); vb.material.side = THREE.DoubleSide;
  { const sh = new THREE.Shape(); const n = 8; for (let k = 0; k <= 2 * n; k++) { const a = k * Math.PI / n, r = k % 2 ? 0.062 : 0.078; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (k) sh.lineTo(x, y); else sh.moveTo(x, y); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.55, steps: 6, bevelEnabled: false }); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const f = 1 - 0.25 * p.getZ(i) / 3.55; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) + 1.0); } geo.computeVertexNormals(); add(geo, copper); }
  { const pos = [], idx = [], S = 130, z0 = 1.1, z1 = 4.45, P = 0.3;
    for (let i = 0; i <= S; i++) { const z = z0 + (z1 - z0) * i / S, a = 2 * Math.PI * (z - z0) / P, r = rS(z) + 0.012;
      for (const dz of [-0.02, 0.02]) pos.push(Math.cos(a) * (r + 0.012), Math.sin(a) * (r + 0.012), z + dz); }
    for (let i = 0; i < S; i++) { const a = i * 2, b = a + 2; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    coilM.side = THREE.DoubleSide; add(geo, coilM); }
  lathe([[0.058, 4.55], [0.075, 4.57], [0.075, 4.63], [0.04, 4.65]], 12, copper);
  lathe([[0.04, 4.64], [0.11, 4.7], [0.14, 4.8], [0.11, 4.9], [0.045, 4.95]], 16, glass);
  { const pts = [[0, 0.0, 4.68], [0.04, 0.0, 4.74], [-0.04, 0.0, 4.8], [0.04, 0.0, 4.86], [0, 0.0, 4.92]].map((q) => new THREE.Vector3(...q));
    for (let i = 0; i + 1 < pts.length; i++) { const d = pts[i + 1].clone().sub(pts[i]); const c = add(new THREE.CylinderGeometry(0.012, 0.012, d.length(), 5), spark); c.position.copy(pts[i]).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); } }
  lathe([[0.045, 4.94], [0.068, 4.96], [0.068, 5.02], [0.04, 5.04], [0.001, 5.5]], 12, copper);
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
