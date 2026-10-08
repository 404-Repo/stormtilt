// lighthouse, candidate 1: primitives: banded cylinder frusta, dodecahedron rock pile, box cottage with prism roof
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const red = M(0xd7372f), white = M(0xf3eee3), rock = M(0x8c8473, { roughness: 0.9, flatShading: true }); rock.name = 'stone';
  const rock2 = M(0x77705f, { roughness: 0.9, flatShading: true }); rock2.name = 'stone';
  const dark = M(0x2b2a33, { metalness: 0.5, roughness: 0.4 }); dark.name = 'metal';
  const glass = M(0xffd27a, { emissive: 0xffb347, emissiveIntensity: 1.8, roughness: 0.2 }), win = M(0x2a3550);
  // rock base: ring of boulders around a core
  add(new THREE.CylinderGeometry(5.2, 7.2, 4.2, 9), rock, 0, 2.1, 0);
  for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2 + rnd() * 0.3, r = 5.6 + rnd() * 1.8, s = 1.6 + rnd() * 1.3;
    const b = add(new THREE.DodecahedronGeometry(s, 0), i % 2 ? rock : rock2, Math.cos(a) * r, s * 0.6, Math.sin(a) * r); b.rotation.set(rnd() * 3, rnd() * 3, 0); b.scale.y = 0.8; }
  add(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 16), M(0x9a927f, { roughness: 0.8 }), 0, 4.5, 0);
  // tower: 4 bands
  const y0 = 4.9, H = 14.6, r0 = 2.6, r1 = 1.85;
  for (let i = 0; i < 4; i++) { const a = i / 4, b = (i + 1) / 4; add(new THREE.CylinderGeometry(r0 + (r1 - r0) * b, r0 + (r1 - r0) * a, H / 4, 20), i % 2 ? white : red, 0, y0 + H * (a + b) / 2, 0); }
  for (const [y, a] of [[8.5, 0], [12.2, Math.PI], [15.8, 0.3]]) { const r = r0 + (r1 - r0) * (y - y0) / H; const w = add(new THREE.BoxGeometry(0.7, 1.0, 0.3), win, Math.sin(a) * r, y, Math.cos(a) * r); w.rotation.y = a; }
  add(new THREE.BoxGeometry(1.1, 2.0, 0.3), M(0x6b3a22), 0, y0 + 1.0, r0 - 0.05);
  // gallery: deck, corbel ring, rail posts + top ring
  const gy = y0 + H; add(new THREE.CylinderGeometry(2.7, 1.9, 0.9, 20), red, 0, gy + 0.05, 0);
  add(new THREE.CylinderGeometry(2.8, 2.8, 0.25, 20), dark, 0, gy + 0.6, 0);
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 4), dark, Math.cos(a) * 2.7, gy + 1.2, Math.sin(a) * 2.7); }
  add(new THREE.TorusGeometry(2.7, 0.07, 4, 24), dark, 0, gy + 1.7, 0).rotation.x = Math.PI / 2;
  // lantern room: plinth, glass, mullions, roof, ball
  add(new THREE.CylinderGeometry(1.6, 1.6, 0.8, 16), white, 0, gy + 1.1, 0);
  add(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 16), glass, 0, gy + 2.7, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.BoxGeometry(0.12, 2.4, 0.12), dark, Math.cos(a) * 1.42, gy + 2.7, Math.sin(a) * 1.42); }
  add(new THREE.CylinderGeometry(1.6, 1.6, 0.2, 16), dark, 0, gy + 4.0, 0);
  add(new THREE.ConeGeometry(1.7, 1.6, 16), red, 0, gy + 4.9, 0);
  add(new THREE.SphereGeometry(0.3, 10, 8), dark, 0, gy + 5.9, 0); add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 4), dark, 0, gy + 6.4, 0);
  // keeper's cottage on the rock (+x side)
  const cx = 4.6, cz = 1.2, cy = 4.2; add(new THREE.BoxGeometry(3.4, 2.4, 2.6), white, cx, cy + 1.2, cz);
  const roof = add(new THREE.CylinderGeometry(1.75, 1.75, 3.8, 3), red, cx, cy + 2.4 + 0.85, cz); roof.rotation.z = Math.PI / 2; roof.scale.set(0.95, 1, 1); roof.rotation.y = 0;
  add(new THREE.BoxGeometry(0.5, 1.2, 0.5), white, cx + 1.0, cy + 3.8, cz - 0.6);
  add(new THREE.BoxGeometry(0.8, 1.5, 0.1), M(0x6b3a22), cx, cy + 0.75, cz + 1.31);
  for (const dx of [-1.0, 1.0]) add(new THREE.BoxGeometry(0.6, 0.6, 0.1), win, cx + dx, cy + 1.5, cz + 1.31);
  add(new THREE.BoxGeometry(0.1, 0.6, 0.6), win, cx + 1.71, cy + 1.5, cz);
  add(new THREE.BoxGeometry(0.6, 0.6, 0.1), win, cx, cy + 1.5, cz - 1.31);
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
