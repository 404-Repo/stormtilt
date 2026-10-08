// reef_rocks, candidate 3: different reading: tilted extruded prism chunks (irregular polygon, bevelled) like a broken
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
// reef shelf, with foam as thin extruded caps of the same polygon
  let sd = 13; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const rock = M(0x2f3438, { roughness: 0.25, flatShading: true }); rock.name = 'stone'; const rock2 = M(0x3a4048, { roughness: 0.3, flatShading: true }); rock2.name = 'stone';
  const foam = M(0xf2efe2, { roughness: 0.7, flatShading: true });
  const poly = (r) => { const pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + rnd() * 0.4; pts.push([Math.cos(a) * r * (0.75 + rnd() * 0.35), Math.sin(a) * r * (0.75 + rnd() * 0.35)]); } return shape(pts); };
  [[0, 0, 1.6, 1.55, 0.12], [2.3, 0.8, 1.2, 1.1, -0.2], [-2.3, 0.5, 1.3, 1.2, 0.18], [0.9, -2.0, 1.0, 1.0, 0.25], [-1.1, 2.0, 0.9, 0.9, -0.15], [3.3, -1.0, 0.7, 0.6, 0.1], [-3.3, -1.3, 0.7, 0.6, -0.2]].forEach(([x, z, r, h, tilt], i) => {
    const sh = poly(r), grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.set(tilt, rnd() * 6, -tilt * 0.6); g.add(grp);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2); add(geo, i % 2 ? rock2 : rock, 0, 0, 0, grp);
    const fs = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.06, bevelSegments: 1 }); fs.rotateX(-Math.PI / 2); fs.scale(0.75, 1, 0.75); add(fs, foam, 0, h + 0.25, 0, grp); });
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
