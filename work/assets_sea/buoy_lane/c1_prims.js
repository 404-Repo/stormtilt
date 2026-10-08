// buoy_lane, candidate 1: stacked primitives (cylinders, cone frusta, tori)
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const red = M(0xd7372f), white = M(0xf2efe2), steel = M(0x8f9aa3, { metalness: 0.7, roughness: 0.35 }); steel.name = 'metal';
  const lamp = M(0xffd27a, { emissive: 0xffb347, emissiveIntensity: 2.0 }), chain = M(0x4a4440, { metalness: 0.6, roughness: 0.5 });
  // chain stub: three links
  for (let i = 0; i < 3; i++) { const l = add(new THREE.TorusGeometry(0.045, 0.016, 5, 10), chain, 0, 0.05 + i * 0.075, 0); l.scale.set(1, 1.5, 1); l.rotation.y = i % 2 ? Math.PI / 2 : 0; }
  // float drum: red with a white band, bevel rings
  add(new THREE.CylinderGeometry(0.52, 0.46, 0.22, 20), red, 0, 0.33, 0);
  add(new THREE.CylinderGeometry(0.55, 0.52, 0.18, 20), white, 0, 0.53, 0);
  add(new THREE.CylinderGeometry(0.5, 0.55, 0.12, 20), red, 0, 0.68, 0);
  add(new THREE.TorusGeometry(0.535, 0.04, 6, 20), red, 0, 0.44, 0).rotation.x = Math.PI / 2;
  // tower: five frusta alternating red/white
  const t0 = 0.74, t1 = 1.4, r0 = 0.42, r1 = 0.22, n = 5;
  for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n, ra = r0 + (r1 - r0) * a, rb = r0 + (r1 - r0) * b;
    add(new THREE.CylinderGeometry(rb, ra, (t1 - t0) / n, 16), i % 2 ? white : red, 0, t0 + (a + b) / 2 * (t1 - t0), 0); }
  add(new THREE.CylinderGeometry(0.29, 0.29, 0.05, 16), red, 0, 1.425, 0);
  // cage: 6 bars, ring, cap and lamp
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; rod([Math.cos(a) * 0.17, 1.45, Math.sin(a) * 0.17], [Math.cos(a) * 0.13, 1.72, Math.sin(a) * 0.13], 0.014, steel, 4); }
  add(new THREE.TorusGeometry(0.16, 0.018, 4, 14), steel, 0, 1.6, 0).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 10), lamp, 0, 1.56, 0);
  add(new THREE.ConeGeometry(0.17, 0.08, 12), steel, 0, 1.76, 0);
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
