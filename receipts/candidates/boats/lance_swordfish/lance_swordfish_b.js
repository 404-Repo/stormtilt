// lance_swordfish, candidate B: primitives. Ellipsoid body (scaled sphere), cone head, long cone bill, stalk cylinder; same fins, tail and vamplate.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {})); if (name) m.name = name; return m; };
  const DS = { side: THREE.DoubleSide };
  const cobalt = M(0x2a5bd7, 0.28, 0.15, null, DS), silver = M(0xd5dde3, 0.3, 0.5, "metal", DS), brass = M(0xc9a043, 0.3, 0.8, "metal", DS), white = M(0xf3eee3, 0.3), black = M(0x111111, 0.3);
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  // fin from a 2D outline, extruded thin; plane: (u along z, v outward), placed by a function
  const fin = (pts, th, mat) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false }); geo.translate(0, 0, -th / 2); return geo; };
  // body radius along z (grip end at 0): tail stalk, body, head, then the bill
  const R = (z) => z < 0.3 ? 0.05 : z < 1.0 ? 0.05 + 0.075 * Math.sin(Math.PI / 2 * (z - 0.3) / 0.7) : z < 1.85 ? 0.125 - 0.065 * Math.pow((z - 1.0) / 0.85, 1.4) : 0.06 * Math.max(0.03, 1 - (z - 1.85) / 3.65);
  const body = add(new THREE.SphereGeometry(1, 16, 10), cobalt); body.scale.set(0.15, 0.19, 0.62); body.position.z = 0.95;
  const belly = add(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), silver); belly.scale.set(0.152, 0.192, 0.622); belly.position.z = 0.95;
  { const h = new THREE.ConeGeometry(0.15, 0.6, 14); h.rotateX(Math.PI / 2); const m = add(h, cobalt); m.position.z = 1.75; m.scale.y = 1.2; }
  { const b = new THREE.ConeGeometry(0.06, 3.5, 10); b.rotateX(Math.PI / 2); const m = add(b, silver); m.position.z = 2.0 + 1.75; m.scale.y = 0.7; }
  { const s = new THREE.CylinderGeometry(0.06, 0.04, 0.4, 10); s.rotateX(Math.PI / 2); const m = add(s, cobalt); m.position.z = 0.3; }
  // tail: crescent fin standing vertically at the grip end (in the y-z plane)
  { const geo = fin([[0.32, 0], [0.05, 0.3], [-0.02, 0.36], [0.16, 0.05], [0.16, -0.05], [-0.02, -0.36], [0.05, -0.3]], 0.04, silver); geo.rotateY(-Math.PI / 2); add(geo, cobalt); }
  // dorsal fin, pectorals, eye, vamplate disc behind the head
  { const d = fin([[0, 0], [0.35, 0], [0.12, 0.3], [0.04, 0.28]], 0.03); d.rotateY(-Math.PI / 2); const m = add(d, cobalt); m.position.set(0, R(1.0) * 1.2 - 0.02, 0.75); }
  for (const s of [1, -1]) { const p = fin([[0, 0], [0.24, 0], [0.04, 0.2]], 0.025); p.rotateY(-Math.PI / 2); p.rotateZ(s * 2.2); const m = add(p, silver); m.position.set(s * 0.08, -0.05, 1.42);
    const e = add(new THREE.SphereGeometry(0.035, 10, 8), white); e.position.set(s * 0.068, 0.035, 1.62); const pu = add(new THREE.SphereGeometry(0.018, 8, 6), black); pu.position.set(s * 0.093, 0.04, 1.638); }
  { const v = new THREE.LatheGeometry([[0.1, -0.02], [0.2, 0.0], [0.226, 0.03], [0.2, 0.06], [0.1, 0.08]].map(([r, z]) => new THREE.Vector2(r, z)), 24); v.rotateX(Math.PI / 2); const m = add(v, brass); m.position.z = 1.28; }
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
