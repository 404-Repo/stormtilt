// lighthouse, candidate 3: different reading: octagonal faceted tower (8 sides, flat shading), terraced rock from
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
// stacked extruded irregular polygons, cottage of primitives, gallery from an octagonal frame
  let sd = 3; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const red = M(0xd7372f, { flatShading: true }), white = M(0xf3eee3, { flatShading: true }); const dark = M(0x2b2a33, { metalness: 0.5, roughness: 0.4 }); dark.name = 'metal';
  const glass = M(0xffd27a, { emissive: 0xffb347, emissiveIntensity: 1.8, roughness: 0.2, flatShading: true }), win = M(0x2a3550);
  const rocks = [0x8c8473, 0x7b7462, 0x9a917d].map((c) => { const m = M(c, { roughness: 0.9, flatShading: true }); m.name = 'stone'; return m; });
  const blob = (R, n, jit) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const r = R * (1 - jit + 2 * jit * rnd()); pts.push([Math.cos(a) * r, Math.sin(a) * r]); } return shape(pts); };
  [[0, 1.3, 7.6], [1.3, 1.2, 6.6], [2.5, 1.1, 5.4], [3.6, 0.9, 4.2]].forEach(([y, h, R], i) => { const geo = new THREE.ExtrudeGeometry(blob(R, 11, 0.13), { depth: h, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.25, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2); add(geo, rocks[i % 3], 0, y + 0.25, 0); });
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + 0.2, b = add(new THREE.DodecahedronGeometry(1.2 + rnd(), 0), rocks[i % 3], Math.cos(a) * 7.4, 0.8, Math.sin(a) * 7.4); b.scale.y = 0.7; }
  const y0 = 4.75, H = 14.8, r0 = 2.7, r1 = 1.9;
  for (let i = 0; i < 5; i++) { const a = i / 5, b = (i + 1) / 5; const m = add(new THREE.CylinderGeometry(r0 + (r1 - r0) * b, r0 + (r1 - r0) * a, H / 5, 8), i % 2 ? white : red, 0, y0 + H * (a + b) / 2, 0); m.rotation.y = Math.PI / 8; }
  for (const [y, a] of [[8.4, 0], [11.4, Math.PI], [14.4, 0], [17.2, Math.PI]]) { const r = (r0 + (r1 - r0) * (y - y0) / H) * Math.cos(Math.PI / 8); const w = add(new THREE.BoxGeometry(0.7, 1.0, 0.3), win, Math.sin(a) * r, y, Math.cos(a) * r); w.rotation.y = a; }
  add(new THREE.BoxGeometry(1.1, 2.0, 0.3), M(0x6b3a22), 0, y0 + 1.0, r0 * 0.92);
  const gy = y0 + H; add(new THREE.CylinderGeometry(2.9, 2.0, 0.7, 8), dark, 0, gy + 0.1, 0).rotation.y = Math.PI / 8;
  const oct = (r) => { const pts = []; for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } return pts; };
  const ring = shape(oct(2.9)); ring.holes.push(new THREE.Path(V2(oct(2.75).reverse())));
  const rgeo = new THREE.ExtrudeGeometry(ring, { depth: 0.12, bevelEnabled: false }); rgeo.rotateX(-Math.PI / 2); add(rgeo, dark, 0, gy + 1.35, 0);
  oct(2.82).forEach(([x, z]) => add(new THREE.BoxGeometry(0.1, 1.0, 0.1), dark, x, gy + 0.95, z));
  add(new THREE.CylinderGeometry(1.5, 1.5, 0.8, 8), white, 0, gy + 0.85, 0).rotation.y = Math.PI / 8;
  add(new THREE.CylinderGeometry(1.35, 1.35, 2.4, 8), glass, 0, gy + 2.45, 0).rotation.y = Math.PI / 8;
  oct(1.37).forEach(([x, z]) => add(new THREE.BoxGeometry(0.14, 2.4, 0.14), dark, x, gy + 2.45, z));
  add(new THREE.CylinderGeometry(1.0, 1.65, 0.6, 8), red, 0, gy + 3.95, 0).rotation.y = Math.PI / 8;
  add(new THREE.ConeGeometry(1.05, 1.5, 8), red, 0, gy + 5.0, 0).rotation.y = Math.PI / 8;
  add(new THREE.SphereGeometry(0.3, 8, 6), dark, 0, gy + 5.85, 0); add(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 4), dark, 0, gy + 6.3, 0);
  // cottage on the upper terrace
  const cx = -3.9, cz = 2.0, cy = 4.5; add(new THREE.BoxGeometry(2.6, 2.2, 3.2), white, cx, cy + 1.1, cz);
  for (const s of [-1, 1]) { const r = add(new THREE.BoxGeometry(1.9, 0.25, 3.5), red, cx + s * 0.68, cy + 2.75, cz); r.rotation.z = -s * 0.75; }
  add(new THREE.BoxGeometry(0.5, 1.1, 0.5), white, cx - 0.6, cy + 3.3, cz - 0.9);
  add(new THREE.BoxGeometry(0.1, 1.5, 0.8), M(0x6b3a22), cx - 1.31, cy + 0.75, cz);
  add(new THREE.BoxGeometry(0.6, 0.6, 0.1), win, cx, cy + 1.4, cz + 1.61); add(new THREE.BoxGeometry(0.6, 0.6, 0.1), win, cx, cy + 1.4, cz - 1.61);
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
