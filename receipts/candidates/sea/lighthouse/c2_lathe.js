// lighthouse, candidate 2: lathe: the tower is one profile cut into colour bands, rock base a lathe with a ragged
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
// radius (flat shaded facets), gallery and lantern lathe profiles; cottage from an extruded gable profile
  let sd = 11; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const red = M(0xd7372f), white = M(0xf3eee3), rock = M(0x8c8473, { roughness: 0.9, flatShading: true }); rock.name = 'stone';
  const dark = M(0x2b2a33, { metalness: 0.5, roughness: 0.4 }); dark.name = 'metal';
  const glass = M(0xffd27a, { emissive: 0xffb347, emissiveIntensity: 1.8, roughness: 0.2 }), win = M(0x2a3550);
  // ragged rock: a lathe at 11 segments, then push each vertex in/out by a deterministic field
  const rp = [[0, 4.6], [3.4, 4.6], [4.4, 4.1], [5.6, 3.3], [6.6, 2.2], [7.4, 1.0], [7.6, 0.2], [7.2, 0], [0, 0]];
  const rg = new THREE.LatheGeometry(V2(rp.reverse()), 11), p = rg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z);
    const k = r < 0.1 ? 1 : 1 + 0.14 * Math.sin(a * 3 + y * 0.9) + 0.08 * Math.sin(a * 7 - y * 1.7); p.setXYZ(i, x * k, y * (y > 4 ? 1 : 1 + 0.06 * Math.sin(a * 5)), z * k); }
  rg.computeVertexNormals(); add(rg, rock);
  const extra = M(0x9b9280, { roughness: 0.9, flatShading: true }); extra.name = 'stone';
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + 0.4, b = add(new THREE.IcosahedronGeometry(1.4 + rnd(), 0), extra, Math.cos(a) * 7.2, 0.9, Math.sin(a) * 7.2); b.scale.y = 0.7; }
  // tower profile
  const tp = [[2.9, 4.4], [2.75, 5.2], [2.6, 5.4], [1.85, 19.5], [1.9, 19.6]], T0 = 5.4, T1 = 19.5;
  const rAt = (y) => 2.6 + (1.85 - 2.6) * (y - T0) / (T1 - T0);
  add(new THREE.LatheGeometry(V2([[2.9, 4.4], [2.9, 5.0], [2.6, 5.4]]), 24), white);
  for (let i = 0; i < 4; i++) { const a = T0 + (T1 - T0) * i / 4, b = T0 + (T1 - T0) * (i + 1) / 4; add(new THREE.LatheGeometry(V2([[rAt(a), a], [rAt(b), b]]), 24), i % 2 ? white : red).material.side = THREE.DoubleSide; }
  for (const [y, a] of [[8.6, 0], [12.4, 3.1], [16.0, 0.3]]) { const w = add(new THREE.BoxGeometry(0.7, 1.0, 0.3), win, Math.sin(a) * rAt(y), y, Math.cos(a) * rAt(y)); w.rotation.y = a; }
  add(new THREE.BoxGeometry(1.1, 2.0, 0.3), M(0x6b3a22), 0, 6.4, 2.45);
  // gallery corbel + deck as one lathe, rail as lathe ring segments + posts
  add(new THREE.LatheGeometry(V2([[1.85, 19.3], [2.3, 19.6], [2.75, 19.9], [2.85, 20.2], [0, 20.2]]), 24), red);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 4), dark, Math.cos(a) * 2.75, 20.7, Math.sin(a) * 2.75); }
  add(new THREE.LatheGeometry(V2([[2.7, 21.15], [2.82, 21.2], [2.82, 21.3], [2.7, 21.3]]), 24), dark).material.side = THREE.DoubleSide;
  add(new THREE.LatheGeometry(V2([[0, 20.2], [1.55, 20.2], [1.55, 21.0], [1.4, 21.0], [1.4, 23.3], [1.65, 23.4], [1.7, 23.6], [0.8, 24.6], [0.25, 25.2], [0.3, 25.4], [0.3, 25.7], [0, 25.8]]), 16), dark);
  add(new THREE.CylinderGeometry(1.41, 1.41, 2.3, 16, 1, true), glass, 0, 22.15, 0);
  add(new THREE.LatheGeometry(V2([[1.72, 23.62], [0.82, 24.62], [0.27, 25.2], [0, 25.25]]), 16), red);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.BoxGeometry(0.12, 2.3, 0.12), dark, Math.cos(a) * 1.43, 22.15, Math.sin(a) * 1.43); }
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 4), dark, 0, 26.0, 0);
  // cottage: extruded gable profile
  const prof = shape([[-1.5, 0], [1.5, 0], [1.5, 2.3], [0, 3.6], [-1.5, 2.3]]);
  const hg = new THREE.ExtrudeGeometry(prof, { depth: 3.4, bevelEnabled: false }); hg.translate(0, 0, -1.7); const h = add(hg, white, 4.7, 4.3, 0.8); h.rotation.y = Math.PI / 2;
  const roofS = shape([[-1.8, 2.15], [0, 3.85], [1.8, 2.15], [1.8, 2.45], [0, 4.15], [-1.8, 2.45]]);
  const rgeo = new THREE.ExtrudeGeometry(roofS, { depth: 3.8, bevelEnabled: false }); rgeo.translate(0, 0, -1.9); const r = add(rgeo, red, 4.7, 4.3, 0.8); r.rotation.y = Math.PI / 2;
  add(new THREE.BoxGeometry(0.5, 1.2, 0.5), white, 5.8, 8.2, 0.2);
  add(new THREE.BoxGeometry(0.8, 1.5, 0.1), M(0x6b3a22), 4.7, 5.05, 2.31);
  for (const dx of [-1, 1]) { add(new THREE.BoxGeometry(0.6, 0.6, 0.1), win, 4.7 + dx, 5.9, 2.31); add(new THREE.BoxGeometry(0.6, 0.6, 0.1), win, 4.7 + dx, 5.9, -0.71); }
  add(new THREE.BoxGeometry(0.1, 0.6, 0.6), win, 6.41, 5.9, 0.8);
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
