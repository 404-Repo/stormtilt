// judges_barge, candidate 1: primitives: a deep box hull with sloped end boxes for the raked bow and stern, cobalt and
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const white = M(0xf3eee3), cobalt = M(0x2a5bd7), redM = M(0xd7372f), sunM = M(0xf2b630), dark = M(0x2a2830, { roughness: 0.5 });
  const teak = M(0xa8652f, { roughness: 0.6 }); teak.name = 'timber'; const deckM = M(0xc89a62, { roughness: 0.65 }); deckM.name = 'timber';
  const brass = M(0xc9a043, { metalness: 0.75, roughness: 0.3 }); brass.name = 'metal'; const rope = M(0xb59a6a, { roughness: 0.8 });
  const D = 1.3;
// sunflower bands as proud boxes
  add(new THREE.BoxGeometry(5.6, 1.3, 11.2), teak, 0, 0.65, 0);
  for (const s of [-1, 1]) { const e = add(new THREE.BoxGeometry(5.6, 1.6, 1.7), teak, 0, 0.55, s * 6.0); e.rotation.x = s * 0.7; }
  add(new THREE.BoxGeometry(5.6, 0.6, 14.0), teak, 0, D - 0.3, 0);
  add(new THREE.BoxGeometry(5.72, 0.22, 11.4), cobalt, 0, 0.55, 0); add(new THREE.BoxGeometry(5.74, 0.14, 14.1), sunM, 0, D - 0.07, 0);
  add(new THREE.BoxGeometry(5.5, 0.06, 13.9), deckM, 0, D, 0);
  // ---- shared upperworks: rails, pavilion with striped pitched roof, judges, bell gantry, flags, bunting ----
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.1, 0.1, 10.6), white, s * 2.65, D + 0.9, -0.4); for (let i = 0; i <= 14; i++) add(new THREE.BoxGeometry(0.08, 0.9, 0.08), white, s * 2.65, D + 0.45, -5.7 + i * 10.6 / 14); }
  add(new THREE.BoxGeometry(5.3, 0.1, 0.1), white, 0, D + 0.9, -5.7);
  const pz0 = -4.6, pz1 = 1.6, eave = D + 3.0, ridge = D + 4.2, hw = 2.5;
  for (const s of [-1, 1]) for (const z of [pz0, (pz0 + pz1) / 2, pz1]) add(new THREE.BoxGeometry(0.22, eave - D, 0.22), teak, s * (hw - 0.2), D + (eave - D) / 2, z);
  const slope = Math.atan2(ridge - eave, hw + 0.2), sl = Math.hypot(ridge - eave, hw + 0.2), N = 10, sw = (pz1 - pz0 + 0.8) / N;
  for (const s of [-1, 1]) for (let i = 0; i < N; i++) { const r = add(new THREE.BoxGeometry(sl, 0.1, sw), i % 2 ? white : redM, s * (hw + 0.2) / 2, (eave + ridge) / 2, pz0 - 0.4 + (i + 0.5) * sw); r.rotation.z = -s * slope; }
  for (const s of [-1, 1]) for (let i = 0; i < N; i++) add(new THREE.BoxGeometry(0.05, 0.3, sw), i % 2 ? white : redM, s * (hw + 0.2), eave - 0.12, pz0 - 0.4 + (i + 0.5) * sw);
  for (const z of [pz0 - 0.4, pz1 + 0.4]) { const gs = new THREE.ShapeGeometry(shape([[-hw - 0.2, 0], [hw + 0.2, 0], [0, ridge - eave]])); add(gs, white, 0, eave + 0.02, z).material.side = THREE.DoubleSide; }
  add(new THREE.BoxGeometry(0.16, 0.16, pz1 - pz0 + 0.9), teak, 0, ridge + 0.06, (pz0 + pz1) / 2);
  // judges' table and three judges facing +x
  add(new THREE.BoxGeometry(1.0, 0.9, 4.0), teak, 0.7, D + 0.45, -1.5); add(new THREE.BoxGeometry(1.2, 0.08, 4.2), deckM, 0.7, D + 0.92, -1.5);
  add(new THREE.BoxGeometry(0.6, 0.5, 4.0), teak, -0.6, D + 0.25, -1.5);
  [[-2.8, cobalt], [-1.5, redM], [-0.2, cobalt]].forEach(([z, coat], i) => { const f = new THREE.Group(); f.position.set(-0.6, D + 0.5, z); f.rotation.y = Math.PI / 2; g.add(f);
    add(new THREE.CylinderGeometry(0.24, 0.3, 0.7, 8), coat, 0, 0.35, 0, f); add(new THREE.SphereGeometry(0.22, 10, 8), M([0xf1c7a0, 0xc68b5e, 0x8a5a3c][i], { roughness: 0.6 }), 0, 0.92, 0, f);
    add(new THREE.SphereGeometry(0.25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 1.8), white, 0, 0.97, -0.04, f);
    for (const e of [-1, 1]) add(new THREE.SphereGeometry(0.04, 6, 4), dark, e * 0.08, 0.95, 0.2, f);
    add(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 10), dark, 0, 1.2, 0, f); add(new THREE.CylinderGeometry(0.17, 0.19, 0.2, 10), dark, 0, 1.31, 0, f); });
  // bell gantry at the bow
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.28, 2.9, 0.28), teak, s * 1.0, D + 1.45, 4.6);
  add(new THREE.BoxGeometry(2.6, 0.3, 0.36), teak, 0, D + 3.0, 4.6);
  for (const s of [-1, 1]) { const b = add(new THREE.BoxGeometry(0.16, 0.9, 0.16), teak, s * 0.75, D + 2.6, 4.6); b.rotation.z = s * 0.8; }
  add(new THREE.LatheGeometry(V2([[0, 0.9], [0.14, 0.88], [0.24, 0.78], [0.28, 0.5], [0.36, 0.2], [0.5, 0.04], [0.52, 0], [0.44, 0.02], [0.3, 0.2], [0.2, 0.5], [0, 0.6]]), 16), brass, 0, D + 1.95, 4.6).material.side = THREE.DoubleSide;
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 4), dark, 0, D + 2.95, 4.6); add(new THREE.SphereGeometry(0.1, 8, 6), dark, 0, D + 2.05, 4.6);
  rod([0.0, D + 2.0, 4.6], [0.3, D + 0.9, 4.7], 0.02, rope, 3);
  // flags: pennants on the gable peaks, a big plain flag at the stern
  const pole = (x, y, z, h) => add(new THREE.CylinderGeometry(0.05, 0.06, h, 6), teak, x, y + h / 2, z);
  for (const [z, c] of [[pz0 - 0.4, sunM], [pz1 + 0.4, cobalt]]) { pole(0, ridge, z, 1.6); const p = add(new THREE.ShapeGeometry(shape([[0, 0.3], [1.3, 0], [0, -0.3]])), c, 0, ridge + 1.3, z); p.rotation.y = -Math.PI / 2; p.material.side = THREE.DoubleSide; }
  pole(0, D, -5.7, 5.6);
  { const f = add(new THREE.PlaneGeometry(2.2, 1.4), cobalt, 0, D + 4.85, -6.82); f.rotation.y = Math.PI / 2; f.material.side = THREE.DoubleSide;
    const st = add(new THREE.PlaneGeometry(2.2, 0.36), sunM, 0.01, D + 4.85, -6.82); st.rotation.y = Math.PI / 2; st.material.side = THREE.DoubleSide;
    const st2 = add(new THREE.PlaneGeometry(2.2, 0.36), sunM, -0.01, D + 4.85, -6.82); st2.rotation.y = -Math.PI / 2; }
  const flagCols = [redM, white, cobalt, sunM, M(0x3e8a5a)], tri = new THREE.ShapeGeometry(shape([[-0.16, 0], [0.16, 0], [0, -0.38]]));
  const bunting = (A, B, n) => { rod(A, B, 0.015, rope, 3); for (let i = 1; i < n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 0.25;
      const fl = add(tri, flagCols[i % 5], A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag, A[2] + (B[2] - A[2]) * t); fl.rotation.y = Math.atan2(B[0] - A[0], B[2] - A[2]) + Math.PI / 2; fl.material.side = THREE.DoubleSide; } };
  bunting([0, D + 3.15, 4.6], [0, ridge + 1.5, pz1 + 0.4], 9); bunting([0, ridge + 1.5, pz0 - 0.4], [0, D + 5.4, -5.7], 6);
  for (const s of [-1, 1]) bunting([s * (hw + 0.2), eave - 0.3, pz0 - 0.4], [s * (hw + 0.2), eave - 0.3, pz1 + 0.4], 12);
  // moored: bollards and a chain falling from the bow
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.16, 0.2, 0.4, 8), dark, s * 1.9, D + 0.2, 6.2);
  rod([1.9, D + 0.3, 6.25], [1.6, 0.25, 7.05], 0.05, dark, 4);
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
