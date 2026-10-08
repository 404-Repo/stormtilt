// lifebuoy, candidate 3: chunky toy reading: annulus sectors extruded with a bevel (flat-sided ring, rounded edges)
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const red = M(0xd7372f), white = M(0xf2efe2), rope = M(0xb59a6a, { roughness: 0.8 });
  const sector = (a0, a1) => { const s = new THREE.Shape(), n = 6, ro = 0.335, ri = 0.235; // bevel 0.03 grows it to 0.365/0.205
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; i ? s.lineTo(Math.cos(a) * ro, Math.sin(a) * ro) : s.moveTo(Math.cos(a) * ro, Math.sin(a) * ro); }
    for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; s.lineTo(Math.cos(a) * ri, Math.sin(a) * ri); } return s; };
  for (let i = 0; i < 8; i++) { const geo = new THREE.ExtrudeGeometry(sector(i * Math.PI / 4, (i + 1) * Math.PI / 4), { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 4 });
    geo.rotateX(-Math.PI / 2); add(geo, i % 2 ? white : red); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; add(new THREE.BoxGeometry(0.03, 0.03, 0.2), rope, Math.cos(a) * 0.37, 0.07, -Math.sin(a) * 0.37).rotation.y = a; }
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
