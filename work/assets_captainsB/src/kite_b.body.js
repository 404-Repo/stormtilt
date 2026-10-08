// cap_kite candidate B: profiles. One lathe torso (V-taper), teal side panels as partial-phi lathe bands, lathe limbs and
// booties, lathe head, a spiky hair skirt (lathe with a jagged hem) under a lathe cap with an extruded bill worn backwards.
  const suit = mat('suit', 0x3557c9, { roughness: 0.42, name: 'fabric' });
  const teal = mat('teal', 0x1fa3a6, { roughness: 0.38, side: THREE.DoubleSide });
  const knee = mat('knee', 0x263f99, { roughness: 0.45 });
  const skin = mat('skin', 0xd49a6a, { roughness: 0.45 });
  const hairM = mat('hair', 0xf0c75a, { roughness: 0.5, side: THREE.DoubleSide });
  const red = mat('red', 0xd7372f, { roughness: 0.35, side: THREE.DoubleSide });
  const lens = mat('lens', 0x1c2128, { roughness: 0.15, metalness: 0.3 });
  const teeth = mat('teeth', 0xf3eee3, { roughness: 0.3 });
  const lip = mat('lip', 0x7a2e26, { roughness: 0.5 });
  const sole = mat('sole', 0x146f73, { roughness: 0.5 });
  const R = rig({ hipY: 0.9, hipX: 0.1, torsoY: 0.95, shY: 1.34, shX: 0.27, neckY: 1.39, headTop: 1.77, splay: 0.22, palm: 0.52 });
  const T = R.torso, H = R.head, HT = R.hat;
  const L = (pts, s, a0, al) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s, a0 || 0, al || Math.PI * 2);
  const dirE = (d) => { const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize())); return [e.x, e.y, e.z]; };

  // ---- torso ----
  const tp = [[0, -0.12], [0.16, -0.11], [0.175, -0.02], [0.16, 0.1], [0.2, 0.24], [0.25, 0.34], [0.22, 0.42], [0.1, 0.47], [0.075, 0.5]];
  add(T, L(tp, 18), suit, [0, 0, 0], [0, 0, 0], [1, 1, 0.68]);
  for (const sx of [-1, 1]) {   // teal side panel: the same profile, a narrow band of phi at each side, sitting proud
    const a0 = sx > 0 ? Math.PI / 2 - 0.28 : Math.PI * 1.5 - 0.28;
    add(T, L(tp.slice(1, 7).map((q) => [q[0] + 0.006, q[1]]), 4, a0, 0.56), teal, [0, 0, 0], [0, 0, 0], [1, 1, 0.68]);
  }
  add(T, box(0.02, 0.36, 0.02), teal, [0, 0.24, -0.16]);
  add(T, tor(0.035, 0.008, 4, 10, Math.PI * 1.2), teal, [0.1, 0.32, 0.155], [0, 0, 0.4]);
  add(T, tor(0.022, 0.008, 4, 10, Math.PI * 1.2), teal, [0.135, 0.33, 0.152], [0, 0, 0.4]);

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    const ap = [[0, 0.07], [0.07, 0.05], [0.085, -0.02], [0.07, -0.18], [0.068, -0.25], [0.062, -0.38], [0.05, -0.41], [0, -0.42]];
    add(A, L(ap, 12), suit);
    add(A, L(ap.slice(1, 6).map((q) => [q[0] + 0.004, q[1]]), 3, sx > 0 ? Math.PI / 2 - 0.35 : Math.PI * 1.5 - 0.35, 0.7), teal);
    add(A, L([[0, -0.4], [0.04, -0.41], [0.05, -0.47], [0.045, -0.56], [0, -0.58]], 10), skin, [0, 0, 0.005], [0, 0, 0], [0.95, 1, 1.5]);
    add(A, cap(0.02, 0.05, 2, 6), skin, [-sx * 0.045, -0.46, 0.06], [0.5, 0, -sx * 0.3]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, L([[0.095, 0.04], [0.095, -0.2], [0.08, -0.42], [0.072, -0.6], [0.07, -0.72]], 12), suit);
    add(Lg, sph(0.06, 10, 6), knee, [0, -0.44, 0.06], [0, 0, 0], [1, 1.2, 0.5]);
    add(Lg, L([[0.098, -0.68], [0.1, -0.8], [0.11, -0.86]], 12), teal);
    add(Lg, L([[0, 0], [0.1, 0], [0.105, 0.12], [0.07, 0.2], [0, 0.22]], 10), teal, [0, -0.855, -0.02], [Math.PI / 2, 0, 0], [1, 1, 0.4]);
    add(Lg, box(0.2, 0.035, 0.03), teal, [0, -0.81, 0.12]);
    add(Lg, sph(1, 10, 6), skin, [0, -0.835, 0.16], [0, 0, 0], [0.075, 0.035, 0.06]);
    add(Lg, rbox(0.2, 0.05, 0.33, 0.02), sole, [0, -0.875, 0.06]);
    for (let i = 0; i < 4; i++) add(Lg, box(0.21, 0.02, 0.03), sole, [0, -0.9, -0.07 + i * 0.08]);
  }

  // ---- head ----
  const HG = new THREE.Group(); HG.scale.setScalar(1.13); H.add(HG);
  add(HG, L([[0, 0.0], [0.08, 0.01], [0.13, 0.06], [0.145, 0.16], [0.14, 0.24], [0.1, 0.3], [0, 0.32]], 16), skin, [0, 0, 0], [0, 0, 0], [1, 1, 1]);
  add(HG, sph(0.03, 8, 6), skin, [0, 0.15, 0.152], [0, 0, 0], [0.9, 1, 1.1]);
  const half = (r) => new THREE.CylinderGeometry(r, r, 0.02, 12, 1, false, -Math.PI / 2, Math.PI);
  add(HG, half(0.062), lip, [0, 0.105, 0.124], [Math.PI / 2 - 0.25, 0, 0], [1, 1, 0.62]);
  add(HG, half(0.052), teeth, [0, 0.101, 0.132], [Math.PI / 2 - 0.25, 0, 0], [1, 1, 0.5]);
  for (const sx of [-1, 1]) {
    add(HG, rbox(0.085, 0.055, 0.03, 0.015), lens, [sx * 0.055, 0.2, 0.135], [0, sx * 0.2, 0]);
    add(HG, box(0.012, 0.012, 0.13), lens, [sx * 0.135, 0.205, 0.07]);
    add(HG, sph(0.032, 8, 6), skin, [sx * 0.143, 0.16, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  add(HG, box(0.04, 0.012, 0.012), lens, [0, 0.21, 0.15]);
  // hair: a lathe skirt from under the cap, its hem cut into spikes; open at the face
  const hs = L([[0.17, 0.08], [0.165, 0.2], [0.15, 0.27]], 20, 0.75, Math.PI * 2 - 1.5), hp = hs.attributes.position;
  for (let j = 0; j <= 20; j++) { const i = j * 3; hp.setY(i, hp.getY(i) - (j % 2) * 0.07); hp.setX(i, hp.getX(i) * (1.1 + (j % 2) * 0.12)); hp.setZ(i, hp.getZ(i) * (1.1 + (j % 2) * 0.12)); }
  hs.computeVertexNormals();
  add(HG, hs, hairM, [0, 0, -0.01]);
  for (const x of [-0.09, -0.04, 0.03, 0.09]) add(HG, new THREE.ConeGeometry(0.032, 0.09, 6), hairM, [x, 0.27, 0.11], dirE([x * 3, -0.4, 1]));

  // ---- cap: lathe crown, extruded bill pointing back ----
  const HC = new THREE.Group(); HC.scale.setScalar(1.13); HT.add(HC);
  add(HC, L([[0.165, -0.08], [0.165, -0.03], [0.14, 0.04], [0.08, 0.085], [0, 0.095]], 16), red, [0, 0, -0.01], [0, 0, 0], [1, 1, 1.04]);
  const bill = new THREE.Shape(); bill.moveTo(-0.14, 0); bill.quadraticCurveTo(0, 0.2, 0.14, 0); bill.lineTo(-0.14, 0);
  add(HC, ext(bill, 0.016, 0.004, 1, 8), red, [0, -0.07, -0.15], [Math.PI / 2 - 0.12, Math.PI, 0, 'YXZ']);
  add(HC, sph(0.02, 8, 6), red, [0, 0.09, -0.01]);
  add(HC, box(0.08, 0.025, 0.01), teeth, [0, -0.055, 0.165]);
  return finish(R, 1.85);
