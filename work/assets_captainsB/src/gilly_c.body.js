// cap_gilly candidate C: a blocky vinyl reading. Rounded-box jumper wrapped by thin white stripe hoops, rounded-box
// limbs and boots, sphere head with a bowl-cut hair shell, beanie with a ring of rib bars and a faceted pompom.
  const green = mat('green', 0x2f8f4e, { roughness: 0.6, name: 'fabric' });
  const white = mat('white', 0xf3eee3, { roughness: 0.6, name: 'fabric' });
  const trou = mat('trou', 0x4a3024, { roughness: 0.5 });
  const boot = mat('boot', 0x7a4a2a, { roughness: 0.35 });
  const cuffM = mat('bcuff', 0x4a3024, { roughness: 0.45 });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const cheek = mat('cheek', 0xe89a8a, { roughness: 0.5 });
  const hairM = mat('hair', 0x6a3e22, { roughness: 0.5, side: THREE.DoubleSide });
  const eyeW = mat('eyeW', 0xffffff, { roughness: 0.25 });
  const eyeK = mat('eyeK', 0x15120f, { roughness: 0.2 });
  const hatG = mat('hatG', 0x2f8a4a, { roughness: 0.5 });
  const R = rig({ hipY: 0.6, hipX: 0.1, torsoY: 0.64, shY: 0.95, shX: 0.23, neckY: 0.99, headTop: 1.36, splay: 0.22, palm: 0.4 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- jumper ----
  add(T, rbox(0.42, 0.44, 0.32, 0.12), green, [0, 0.15, 0]);
  for (let i = 0; i < 3; i++) add(T, rbox(0.43, 0.05, 0.33, 0.12), white, [0, 0.0 + i * 0.1, 0]);
  add(T, cyl(0.1, 0.11, 0.07, 14), green, [0, 0.4, 0]);
  add(T, rbox(0.4, 0.12, 0.3, 0.06), trou, [0, -0.09, 0]);

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, rbox(0.14, 0.32, 0.14, 0.06), green, [0, -0.14, 0]);
    for (let i = 0; i < 2; i++) add(A, rbox(0.145, 0.04, 0.145, 0.06), white, [0, -0.08 - i * 0.1, 0]);
    add(A, rbox(0.13, 0.05, 0.13, 0.04), green, [0, -0.3, 0]);
    add(A, rbox(0.1, 0.12, 0.12, 0.045), skin, [0, -0.38, 0.01]);
    add(A, cap(0.02, 0.04, 2, 6), skin, [-sx * 0.05, -0.36, 0.045], [0.4, 0, -sx * 0.4]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, rbox(0.15, 0.4, 0.15, 0.06), trou, [0, -0.2, 0]);
    add(Lg, rbox(0.2, 0.07, 0.2, 0.03), cuffM, [0, -0.43, 0]);
    add(Lg, rbox(0.18, 0.12, 0.2, 0.06), boot, [0, -0.51, 0]);
    add(Lg, rbox(0.19, 0.1, 0.3, 0.05), boot, [0, -0.54, 0.05]);
    add(Lg, rbox(0.2, 0.025, 0.31, 0.01), cuffM, [0, -0.588, 0.05]);
  }

  // ---- head ----
  add(H, sph(0.18, 18, 14), skin, [0, 0.185, 0], [0, 0, 0], [1, 1.0, 0.95]);
  add(H, sph(0.036, 10, 8), skin, [0, 0.165, 0.175], [0, 0, 0], [1, 0.9, 1.1]);
  add(H, tor(0.058, 0.01, 4, 12, Math.PI), mat('mouth', 0x7a2e26, { roughness: 0.5 }), [0, 0.12, 0.155], [0.35, 0, Math.PI]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.045, 12, 8), eyeW, [sx * 0.065, 0.21, 0.145], [0, 0, 0], [0.85, 1.1, 0.6]);
    add(H, sph(0.025, 8, 6), eyeK, [sx * 0.065, 0.205, 0.17], [0, 0, 0], [1, 1.2, 0.6]);
    add(H, rbox(0.06, 0.016, 0.02, 0.008), hairM, [sx * 0.068, 0.268, 0.16], [0, 0, -sx * 0.12]);
    add(H, sph(0.034, 8, 6), cheek, [sx * 0.115, 0.14, 0.13], [0, 0, 0], [1, 0.7, 0.4]);
    add(H, sph(0.04, 8, 6), skin, [sx * 0.18, 0.18, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  // bowl cut: an open sphere shell over the back and sides
  add(H, new THREE.SphereGeometry(0.19, 16, 10, Math.PI * 0.7, Math.PI * 1.6, 0, Math.PI * 0.62), hairM, [0, 0.19, -0.005], [0, 0, 0], [1, 1, 1]);

  // ---- beanie ----
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; add(HT, box(0.045, 0.1, 0.035), hatG, [Math.sin(a) * 0.19, -0.02, Math.cos(a) * 0.19], [0, a, 0]); }
  add(HT, cyl(0.185, 0.185, 0.1, 20), hatG, [0, -0.02, 0]);
  add(HT, new THREE.SphereGeometry(0.182, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatG, [0, 0.03, 0], [0, 0, 0], [1, 0.95, 1]);
  const pom = new THREE.DodecahedronGeometry(0.1, 1);
  add(HT, pom, hatG, [0, 0.27, 0]);
  return finish(R, 1.55);
