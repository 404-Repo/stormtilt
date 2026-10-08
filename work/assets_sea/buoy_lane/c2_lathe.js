// buoy_lane, candidate 2: one lathe profile cut into colour bands, cage of lathe rings and bars
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
  // full outer profile (r, y), sampled then split by height into stripes
  const prof = [[0.0, 0.22], [0.3, 0.22], [0.46, 0.26], [0.54, 0.34], [0.56, 0.46], [0.55, 0.6], [0.5, 0.7], [0.42, 0.74], [0.4, 0.8], [0.33, 1.1], [0.25, 1.38], [0.28, 1.4], [0.28, 1.44], [0, 1.44]];
  const at = (y) => { for (let i = 0; i < prof.length - 1; i++) { const [ra, ya] = prof[i], [rb, yb] = prof[i + 1]; if (y >= ya && y <= yb && yb > ya) return ra + (rb - ra) * (y - ya) / (yb - ya); } return 0; };
  const piece = (y0, y1, mat) => { const pts = []; if (y0 <= 0.22) pts.push([0, 0.22]); prof.forEach(([r, y]) => { if (y > y0 && y < y1) pts.push([r, y]); });
    pts.splice(y0 <= 0.22 ? 1 : 0, 0, [at(y0 + 1e-4), y0]); pts.push([at(y1 - 1e-4), y1]); if (y1 >= 1.44) pts.push([0, 1.44]);
    add(new THREE.LatheGeometry(V2(pts), 20), mat).material.side = THREE.DoubleSide; };
  [[0.2, 0.5, red], [0.5, 0.66, white], [0.66, 0.92, red], [0.92, 1.05, white], [1.05, 1.18, red], [1.18, 1.3, white], [1.3, 1.45, red]].forEach(([a, b, m]) => piece(a, b, m));
  // chain stub as a lathe-free capsule chain
  for (let i = 0; i < 3; i++) { const l = add(new THREE.TorusGeometry(0.05, 0.017, 5, 10), chain, 0, 0.055 + i * 0.075, 0); l.scale.set(1, 1.5, 1); l.rotation.y = i % 2 ? Math.PI / 2 : 0; }
  // lantern: lathe glass, lathe hood, four cage bars
  add(new THREE.LatheGeometry(V2([[0, 1.46], [0.1, 1.47], [0.12, 1.56], [0.1, 1.66], [0, 1.67]]), 12), lamp);
  add(new THREE.LatheGeometry(V2([[0, 1.8], [0.06, 1.79], [0.2, 1.72], [0.21, 1.7], [0, 1.7]]), 12), steel).material.side = THREE.DoubleSide;
  for (let i = 0; i < 4; i++) { const a = (i + 0.5) / 4 * Math.PI * 2; rod([Math.cos(a) * 0.2, 1.44, Math.sin(a) * 0.2], [Math.cos(a) * 0.19, 1.71, Math.sin(a) * 0.19], 0.016, steel, 4); }
  add(new THREE.TorusGeometry(0.2, 0.016, 4, 16), steel, 0, 1.58, 0).rotation.x = Math.PI / 2;
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
