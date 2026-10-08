// buoy_lane, candidate 3: a different reading: slender striped spar on a fat torus fender float, square cage of extruded frames
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
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 6), chain, 0, 0.12, 0);
  add(new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), red, 0, 0.62, 0).scale.y = 0.9; // under-hull dome
  add(new THREE.TorusGeometry(0.42, 0.14, 8, 20), white, 0, 0.64, 0).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 20), red, 0, 0.72, 0);
  // spar: 4 stripes on an octagonal post
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.2 - i * 0.015, 0.21 - i * 0.015, 0.16, 8), i % 2 ? white : red, 0, 0.88 + i * 0.16, 0);
  add(new THREE.BoxGeometry(0.42, 0.04, 0.42), red, 0, 1.53, 0);
  // square cage: two extruded square frames on four posts
  const fr = shape([[-0.18, -0.18], [0.18, -0.18], [0.18, 0.18], [-0.18, 0.18]]); fr.holes.push(new THREE.Path(V2([[-0.15, -0.15], [-0.15, 0.15], [0.15, 0.15], [0.15, -0.15]])));
  for (const y of [1.62, 1.74]) { const f = new THREE.ExtrudeGeometry(fr, { depth: 0.03, bevelEnabled: false }); f.rotateX(-Math.PI / 2); add(f, steel, 0, y, 0); }
  for (const [x, z] of [[-0.165, -0.165], [0.165, -0.165], [0.165, 0.165], [-0.165, 0.165]]) add(new THREE.BoxGeometry(0.03, 0.25, 0.03), steel, x, 1.67, z);
  add(new THREE.SphereGeometry(0.11, 12, 8), lamp, 0, 1.66, 0);
  add(new THREE.ConeGeometry(0.17, 0.05, 4), steel, 0, 1.795, 0).rotation.y = Math.PI / 4;
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
