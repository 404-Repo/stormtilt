// galleon_nimbus, candidate 1: assembled from primitives (boxes, half cylinders, half ellipsoids, cones).
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const grey = M(0x6f7487), violet = M(0x3b3358), deck = M(0xc89a62, { roughness: 0.65 }); deck.name = 'timber';
  const gilt = M(0xffb347, { metalness: 0.45, roughness: 0.3 }); gilt.name = 'metal';
  const glow = M(0xffc766, { emissive: 0xffb347, emissiveIntensity: 1.6, roughness: 0.4 });
  const mastM = M(0x4a3428, { roughness: 0.6 }); mastM.name = 'timber';
  const sailM = M(0x45396b, { roughness: 0.85 }); sailM.name = 'fabric';
  const boltM = M(0xf4ead2, { roughness: 0.85, emissive: 0xf4ead2, emissiveIntensity: 0.12 });
  const dark = M(0x231d33);
  const add = (geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); g.add(m); return m; };
  const box = (w, h, d, mat, x, y, z) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  const rod = (a, b, r, mat, seg = 6) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };

  const B = 3.4; // half beam
  // half cylinder lying along z (bottom half), for the bilge of the midship
  const halfCylZ = (r, len) => { const c = new THREE.CylinderGeometry(r, r, len, 20, 1, false, -Math.PI / 2, Math.PI); c.rotateX(Math.PI / 2); return c; };
  // bilge: z from -6 to 5.5, ellipse half-width B, depth 2.8
  add(halfCylZ(1, 11.5), grey, 0, 2.8, -0.25, B, 2.8, 1);
  // bow, below 2.8: quarter ellipsoid; above: half elliptic cylinder
  add(new THREE.SphereGeometry(1, 20, 8, 0, Math.PI, Math.PI / 2, Math.PI / 2), grey, 0, 2.8, 5.5, B, 2.8, 3.7);
  add(new THREE.CylinderGeometry(1, 1, 2.4, 20, 1, false, -Math.PI / 2, Math.PI), grey, 0, 4.0, 5.5, B, 1, 3.7);
  // midship topsides
  box(2 * B, 2.4, 11.5, grey, 0, 4.0, -0.25);
  // stern block and its underbody wedge
  box(2 * B - 0.4, 4.0, 3.2, grey, 0, 3.2, -7.6);
  { const w = add(new THREE.CylinderGeometry(1, 1, 2 * B - 0.4, 3, 1), grey, 0, 1.2, -6.3); w.rotation.z = Math.PI / 2; w.scale.set(1.2, 1, 1.6); }
  // violet band (slightly proud copies) and gilt strakes
  box(2 * B + 0.12, 0.95, 11.5, violet, 0, 2.95, -0.25);
  add(new THREE.CylinderGeometry(1.02, 1.02, 0.95, 20, 1, true, -Math.PI / 2, Math.PI), violet, 0, 2.95, 5.5, B, 1, 3.7).material = violet;
  for (const y of [2.42, 3.47, 5.15]) { box(2 * B + 0.2, 0.14, 11.5, gilt, 0, y, -0.25);
    add(new THREE.TorusGeometry(1, 0.03, 4, 20, Math.PI), gilt, 0, y, 5.5, B + 0.05, 3.75, 1).rotation.set(Math.PI / 2, 0, 0); }
  // bow torus as a half ring: rotate so it lies flat and bulges to +z
  g.children.slice(-1).forEach(() => {});
  // stern castle: two stacked boxes, violet with gilt cornice
  box(2 * B - 0.4, 1.6, 5.4, violet, 0, 6.0, -6.5);
  box(2 * B - 0.8, 1.5, 2.6, violet, 0, 7.55, -7.9);
  box(2 * B - 0.2, 0.18, 5.6, gilt, 0, 6.85, -6.5); box(2 * B - 0.6, 0.18, 2.8, gilt, 0, 8.35, -7.9);
  box(2 * B, 1.0, 1.2, grey, 0, 1.5 + 3.2, -9.3);
  // decks
  box(2 * B - 0.3, 0.12, 11.5, deck, 0, 4.36, -0.25);
  box(2 * B - 0.5, 0.12, 4.0, deck, 0, 4.66, 6.6);
  box(2 * B - 0.5, 0.1, 5.4, deck, 0, 6.85, -6.5); box(2 * B - 0.9, 0.1, 2.6, deck, 0, 8.32, -7.9);
  // bulwark rails (gilt) on top of topsides
  for (const s of [-1, 1]) { box(0.16, 0.16, 11.5, gilt, s * B, 5.22, -0.25); }
  // forecastle bulwark ring
  add(new THREE.CylinderGeometry(1, 1, 0.7, 20, 1, true, -Math.PI / 2, Math.PI), M(0x6f7487, { side: THREE.DoubleSide }), 0, 5.0, 5.5, B, 1, 3.7);
  add(new THREE.TorusGeometry(1, 0.05, 4, 20, Math.PI), gilt, 0, 5.36, 5.5, B, 3.7, 1).rotation.x = Math.PI / 2;
  // windows: side rows and stern rows
  for (const s of [-1, 1]) { for (const z of [-8.6, -7.4, -6.2, -5.0, -4.3]) { box(0.14, 0.85, 0.65, gilt, s * (B - 0.15), 6.0, z); box(0.16, 0.65, 0.45, glow, s * (B - 0.12), 6.0, z); }
    for (const z of [-8.6, -7.3]) { box(0.14, 0.8, 0.65, gilt, s * (B - 0.35), 7.55, z); box(0.16, 0.6, 0.45, glow, s * (B - 0.32), 7.55, z); }
    for (let z = -3.2; z <= 4.8; z += 1.6) box(0.12, 0.55, 0.6, dark, s * (B + 0.06), 2.95, z); }
  for (let i = 0; i < 4; i++) { const x = (i - 1.5) * 1.3; box(0.72, 0.9, 0.14, gilt, x, 6.0, -9.25); box(0.52, 0.7, 0.16, glow, x, 6.0, -9.28); }
  for (let i = 0; i < 3; i++) { const x = (i - 1) * 1.3; box(0.72, 0.85, 0.14, gilt, x, 7.55, -9.25); box(0.52, 0.65, 0.16, glow, x, 7.55, -9.28); }
  box(2 * B - 0.4, 0.2, 0.4, gilt, 0, 4.7, -9.3);
  // castle front with door and windows
  box(0.9, 1.5, 0.1, dark, 0, 6.0, -3.76); for (const x of [-2, 2]) { box(0.6, 0.6, 0.1, gilt, x, 6.1, -3.76); box(0.45, 0.45, 0.12, glow, x, 6.1, -3.76); }
  // lanterns at the stern
  const lantern = (x, y, z) => { add(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5), gilt, x, y - 0.45, z);
    add(new THREE.BoxGeometry(0.45, 0.6, 0.45), glow, x, y + 0.28, z); add(new THREE.ConeGeometry(0.36, 0.4, 4), gilt, x, y + 0.78, z).rotation.y = Math.PI / 4; };
  lantern(-2.4, 9.3, -9.2); lantern(2.4, 9.3, -9.2); lantern(0, 9.7, -9.5);
  // figurehead: gilded thundercloud of spheres plus a bolt of boxes
  [[0, 4.3, 9.3, 0.6], [0.45, 4.2, 9.1, 0.45], [-0.45, 4.2, 9.1, 0.45], [0, 4.75, 9.0, 0.5], [0, 3.9, 9.7, 0.38]].forEach(([x, y, z, r]) => add(new THREE.SphereGeometry(r, 10, 8), gilt, x, y, z));
  { const b1 = box(0.16, 0.7, 0.16, gilt, 0, 3.3, 9.85); b1.rotation.x = 0.5; const b2 = box(0.16, 0.6, 0.16, gilt, 0, 2.85, 9.95); b2.rotation.x = -0.6; }
  // bowsprit
  const BS = [0, 5.0, 8.0], BT = [0, 5.0 + 5.6 * Math.sin(0.36), 8.0 + 5.6 * Math.cos(0.36)]; rod(BS, BT, 0.2, mastM, 8);
  // masts, tops, yards, sails with box-built bolts
  const masts = [[3.4, 4.3, 19.2], [-0.6, 4.3, 21.6], [-5.4, 6.9, 18.6]];
  masts.forEach(([z, y0, top]) => { const h = top - y0; add(new THREE.CylinderGeometry(0.17, 0.3, h, 8), mastM, 0, y0 + h / 2, z);
    add(new THREE.CylinderGeometry(0.85, 0.7, 0.3, 8), mastM, 0, y0 + h * 0.56, z); add(new THREE.SphereGeometry(0.22, 8, 6), gilt, 0, top + 0.15, z);
    const f = add(new THREE.ConeGeometry(0.35, 2.2, 3), M(0xffb347, { roughness: 0.8 }), 0, top - 0.5, z - 1.1); f.rotation.x = -Math.PI / 2; f.scale.set(1, 1, 0.1); });
  const sail = (z, yTop, yBot, w) => { const h = yTop - yBot; box(w, h, 0.08, sailM, 0, yBot + h / 2, z + 0.25);
    rod([-w / 2 - 0.4, yTop + 0.1, z], [w / 2 + 0.4, yTop + 0.1, z], 0.13, mastM);
    const S = h * 0.8, yc = yBot + h / 2; // bolt: three slanted bars
    for (const [dx, dy, len, ang] of [[0.05, 0.27, 0.5, -0.5], [0, 0.0, 0.42, 1.25], [-0.03, -0.27, 0.5, -0.5]]) {
      const b = box(0.13 * S, len * S, 0.16, boltM, dx * S, yc + dy * S, z + 0.25); b.rotation.z = ang; } };
  sail(3.4, 10.6, 6.3, 8.6); sail(3.4, 16.0, 10.9, 7.0); sail(-0.6, 11.4, 6.4, 9.4); sail(-0.6, 18.0, 11.7, 7.8); sail(-5.4, 12.4, 8.6, 6.2); sail(-5.4, 16.6, 12.7, 5.2);
  const rope = M(0x2b2430, { roughness: 0.8 });
  rod([0, 19.0, 3.4], BT, 0.04, rope); rod([0, 21.3, -0.6], [0, 18.6, 3.4], 0.04, rope); rod([0, 18.4, -5.4], [0, 20.6, -0.6], 0.04, rope);
  masts.forEach(([z, y0, top]) => { const yt = y0 + (top - y0) * 0.56; for (const s of [-1, 1]) for (const dz of [-1.5, -0.6, 0.3]) rod([s * 0.5, yt, z], [s * B, 5.2, z + dz], 0.035, rope, 4); });

  const mark = (name, x, y, z) => { const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); g.add(o); };
  mark('mark_captain', 0, 4.72, 6.6); mark('mark_waterline', 0, 1.4, 0); mark('mark_masttop', 0, 21.6, -0.6); mark('mark_bow', 0, 4.7, 9.2); mark('mark_stern', 0, 4.7, -9.3);

  const bb = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
