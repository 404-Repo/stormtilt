// cap_kite candidate C: a chunkier action-figure reading. Rounded-box chest and limbs with a teal stripe inset, separate
// pecs, mitt hands with a finger block, swept hair locks from flattened spheres, cap from a dome with an extruded bill.
  const suit = mat('suit', 0x3557c9, { roughness: 0.42, name: 'fabric' });
  const teal = mat('teal', 0x1fa3a6, { roughness: 0.38 });
  const knee = mat('knee', 0x263f99, { roughness: 0.45 });
  const skin = mat('skin', 0xd49a6a, { roughness: 0.45 });
  const hairM = mat('hair', 0xf0c75a, { roughness: 0.5 });
  const red = mat('red', 0xd7372f, { roughness: 0.35 });
  const lens = mat('lens', 0x1c2128, { roughness: 0.15, metalness: 0.3 });
  const teeth = mat('teeth', 0xf3eee3, { roughness: 0.3 });
  const lip = mat('lip', 0x7a2e26, { roughness: 0.5 });
  const sole = mat('sole', 0x146f73, { roughness: 0.5 });
  const R = rig({ hipY: 0.88, hipX: 0.11, torsoY: 0.93, shY: 1.33, shX: 0.29, neckY: 1.38, headTop: 1.77, splay: 0.2, palm: 0.52 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- torso ----
  add(T, rbox(0.5, 0.26, 0.3, 0.1), suit, [0, 0.31, 0]);
  add(T, rbox(0.36, 0.3, 0.25, 0.09), suit, [0, 0.07, 0]);
  add(T, rbox(0.34, 0.12, 0.24, 0.05), suit, [0, -0.07, 0]);
  for (const sx of [-1, 1]) {
    add(T, sph(0.1, 10, 8), suit, [sx * 0.09, 0.3, 0.1], [0, 0, 0], [1.1, 0.75, 0.55]);
    add(T, box(0.03, 0.4, 0.2), teal, [sx * 0.2, 0.14, 0], [0, 0, sx * 0.18]);
  }
  add(T, cyl(0.075, 0.08, 0.07, 12), suit, [0, 0.46, 0]);
  add(T, box(0.02, 0.32, 0.02), teal, [0, 0.24, -0.155]);
  add(T, tor(0.035, 0.008, 4, 10, Math.PI * 1.2), teal, [0.1, 0.38, 0.152], [0, 0, 0.4]);

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.09, 12, 8), suit, [0, -0.01, 0]);
    add(A, rbox(0.14, 0.22, 0.14, 0.06), suit, [0, -0.12, 0]);
    add(A, rbox(0.13, 0.2, 0.13, 0.055), suit, [0, -0.31, 0.01]);
    add(A, box(0.02, 0.38, 0.06), teal, [sx * 0.07, -0.2, 0]);
    add(A, rbox(0.06, 0.1, 0.1, 0.03), skin, [0, -0.46, 0.01]);
    add(A, rbox(0.055, 0.09, 0.09, 0.025), skin, [0, -0.55, 0.015], [0.15, 0, 0]);
    add(A, cap(0.022, 0.05, 2, 6), skin, [-sx * 0.04, -0.46, 0.065], [0.5, 0, -sx * 0.3]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, rbox(0.17, 0.36, 0.17, 0.07), suit, [0, -0.18, 0]);
    add(Lg, rbox(0.15, 0.34, 0.15, 0.06), suit, [0, -0.5, 0]);
    add(Lg, rbox(0.12, 0.12, 0.05, 0.04), knee, [0, -0.38, 0.08]);
    add(Lg, rbox(0.2, 0.17, 0.2, 0.06), teal, [0, -0.73, 0]);
    add(Lg, rbox(0.19, 0.06, 0.28, 0.025), teal, [0, -0.82, 0.06]);
    add(Lg, sph(1, 10, 6), skin, [0, -0.8, 0.16], [0, 0, 0], [0.075, 0.035, 0.06]);
    add(Lg, rbox(0.21, 0.05, 0.34, 0.02), sole, [0, -0.855, 0.06]);
    for (let i = 0; i < 4; i++) add(Lg, box(0.22, 0.02, 0.03), sole, [0, -0.875, -0.07 + i * 0.08]);
  }

  // ---- head ----
  const HG = new THREE.Group(); HG.scale.setScalar(1.13); H.add(HG);
  add(HG, rbox(0.27, 0.3, 0.27, 0.11), skin, [0, 0.16, 0]);
  add(HG, rbox(0.22, 0.1, 0.2, 0.05), skin, [0, 0.06, 0.04]);
  add(HG, sph(0.032, 8, 6), skin, [0, 0.15, 0.15], [0, 0, 0], [0.9, 1, 1.1]);
  const half = (r) => new THREE.CylinderGeometry(r, r, 0.02, 12, 1, false, -Math.PI / 2, Math.PI);
  add(HG, half(0.065), lip, [0, 0.1, 0.13], [Math.PI / 2 - 0.15, 0, 0], [1, 1, 0.62]);
  add(HG, half(0.055), teeth, [0, 0.096, 0.138], [Math.PI / 2 - 0.15, 0, 0], [1, 1, 0.5]);
  for (const sx of [-1, 1]) {
    add(HG, rbox(0.09, 0.06, 0.03, 0.015), lens, [sx * 0.058, 0.2, 0.14], [0, sx * 0.15, 0]);
    add(HG, box(0.012, 0.012, 0.14), lens, [sx * 0.138, 0.205, 0.07]);
    add(HG, sph(0.032, 8, 6), skin, [sx * 0.14, 0.15, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  add(HG, box(0.04, 0.012, 0.012), lens, [0, 0.21, 0.155]);
  // swept hair locks under the cap
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * (0.4 + 1.2 * i / 9), x = Math.sin(a) * 0.14, z = Math.cos(a) * 0.14;
    add(HG, sph(0.07, 8, 6), hairM, [x, 0.17 - (i % 2) * 0.02, z - 0.01], [0.3 * Math.cos(a), a, 0.6 * Math.sign(x), 'YXZ'], [0.55, 1.2, 0.5]);
  }
  for (const x of [-0.08, 0.0, 0.08]) add(HG, sph(0.05, 8, 6), hairM, [x, 0.26, 0.12], [0.9, 0, -x * 4], [0.6, 1.1, 0.5]);

  // ---- cap ----
  const HC = new THREE.Group(); HC.scale.setScalar(1.13); HT.add(HC);
  add(HC, new THREE.SphereGeometry(0.165, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), red, [0, -0.06, -0.01], [0, 0, 0], [1, 0.85, 1.05]);
  add(HC, cyl(0.166, 0.166, 0.04, 16), red, [0, -0.075, -0.01]);
  const bill = new THREE.Shape(); bill.moveTo(-0.14, 0); bill.quadraticCurveTo(0, 0.22, 0.14, 0); bill.lineTo(-0.14, 0);
  add(HC, ext(bill, 0.02, 0.005, 1, 8), red, [0, -0.08, -0.16], [Math.PI / 2 - 0.1, Math.PI, 0, 'YXZ']);
  add(HC, sph(0.022, 8, 6), red, [0, 0.085, -0.01]);
  add(HC, box(0.09, 0.03, 0.01), teeth, [0, -0.06, 0.172]);
  return finish(R, 1.85);
