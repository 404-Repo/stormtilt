// barrel_float, candidate 3: different breakdown: 12 bent staves, each a custom strip bowed outward, plus hoops and heads
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const wood = M(0x8a5a32, { roughness: 0.65, side: THREE.DoubleSide }); wood.name = 'timber'; const wood2 = M(0x9b6638, { roughness: 0.65, side: THREE.DoubleSide }); wood2.name = 'timber';
  const end = M(0xa8652f, { roughness: 0.65 }); end.name = 'timber'; const hoop = M(0x3a3836, { metalness: 0.6, roughness: 0.45 }); hoop.name = 'metal';
  const b = new THREE.Group(); g.add(b); b.rotation.z = Math.PI / 2; b.position.y = 0.34;
  const N = 12, rr = (y) => 0.285 + 0.055 * Math.cos((y / 0.45) * Math.PI / 2);
  for (let k = 0; k < N; k++) { const a0 = (k + 0.04) / N * Math.PI * 2, a1 = (k + 0.96) / N * Math.PI * 2, pos = [], idx = [], S = 6;
    for (let i = 0; i <= S; i++) { const y = -0.45 + 0.9 * i / S, r = rr(y); for (const a of [a0, a1]) pos.push(Math.cos(a) * r, y, Math.sin(a) * r); }
    for (let i = 0; i < S; i++) { const p = i * 2; idx.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, k % 2 ? wood : wood2, 0, 0, 0, b); }
  add(new THREE.CylinderGeometry(0.27, 0.27, 0.82, 12), M(0x2a1a10), 0, 0, 0, b);
  add(new THREE.CylinderGeometry(0.255, 0.255, 0.03, 14), end, 0, 0.42, 0, b); add(new THREE.CylinderGeometry(0.255, 0.255, 0.03, 14), end, 0, -0.42, 0, b);
  for (const y of [0.38, 0.17, -0.17, -0.38]) add(new THREE.TorusGeometry(rr(y) + 0.008, 0.02, 4, 16), hoop, 0, y, 0, b).rotation.x = Math.PI / 2;
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
