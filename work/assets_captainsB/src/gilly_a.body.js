// cap_gilly candidate A: primitives. One Gilly Twin (1.55 m): green and white striped jumper as stacked cylinder bands,
// brown trousers, cuffed brown boots, big head with white-and-black eyes, rosy cheeks, ribbed green bobble hat.
  const green = mat('green', 0x2f8f4e, { roughness: 0.6, name: 'fabric' });
  const white = mat('white', 0xf3eee3, { roughness: 0.6, name: 'fabric' });
  const trou = mat('trou', 0x4a3024, { roughness: 0.5 });
  const boot = mat('boot', 0x7a4a2a, { roughness: 0.35 });
  const cuffM = mat('bcuff', 0x4a3024, { roughness: 0.45 });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const cheek = mat('cheek', 0xe89a8a, { roughness: 0.5 });
  const hairM = mat('hair', 0x6a3e22, { roughness: 0.5 });
  const eyeW = mat('eyeW', 0xffffff, { roughness: 0.25 });
  const eyeK = mat('eyeK', 0x15120f, { roughness: 0.2 });
  const hatG = mat('hatG', 0x2f8a4a, { roughness: 0.5 });
  const R = rig({ hipY: 0.6, hipX: 0.09, torsoY: 0.64, shY: 0.95, shX: 0.22, neckY: 0.99, headTop: 1.35, splay: 0.22, palm: 0.4 });
  const T = R.torso, H = R.head, HT = R.hat;
  // ribbed: an open cylinder whose alternate radial vertices are pushed out
  const ribbed = (rt, rb, h, segs, amp) => {
    const ge = new THREE.CylinderGeometry(rt, rb, h, segs, 1, true), p = ge.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = i % (segs + 1), f = 1 + (k % 2) * amp; p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f); }
    ge.computeVertexNormals(); return ge;
  };

  // ---- jumper: stacked bands, roll neck, ribbed hem ----
  const bands = 7, y0 = -0.06, y1 = 0.34;
  for (let i = 0; i < bands; i++) {
    const t = (i + 0.5) / bands, y = y0 + (y1 - y0) * t, r = 0.2 + 0.03 * Math.sin(Math.PI * t * 0.9);
    add(T, cyl(r, r, (y1 - y0) / bands + 0.002, 18), i % 2 ? white : green, [0, y, 0], [0, 0, 0], [1, 1, 0.78]);
  }
  add(T, sph(0.215, 18, 8), green, [0, 0.34, 0], [0, 0, 0], [1, 0.45, 0.78]);
  add(T, tor(0.085, 0.035, 8, 16), green, [0, 0.42, 0], [Math.PI / 2, 0, 0]);
  add(T, ribbed(0.205, 0.2, 0.06, 24, 0.05), green, [0, -0.08, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, cyl(0.19, 0.17, 0.1, 16), trou, [0, -0.13, 0], [0, 0, 0], [1, 1, 0.8]);

  // ---- arms: striped sleeves, ribbed cuff, big hand ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.075, 12, 8), green, [0, -0.01, 0]);
    for (let i = 0; i < 5; i++) add(A, cyl(0.07, 0.07, 0.052, 12), i % 2 ? white : green, [0, -0.05 - i * 0.05, 0]);
    add(A, ribbed(0.068, 0.068, 0.05, 16, 0.08), green, [0, -0.3, 0]);
    add(A, sph(1, 12, 9), skin, [0, -0.38, 0.005], [0, 0, 0], [0.055, 0.075, 0.065]);
    add(A, cap(0.02, 0.04, 2, 6), skin, [-sx * 0.045, -0.36, 0.04], [0.4, 0, -sx * 0.4]);
  }

  // ---- legs: brown trousers, boots with a dark rolled cuff ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, cap(0.075, 0.3, 3, 10), trou, [0, -0.2, 0]);
    add(Lg, cyl(0.1, 0.1, 0.07, 14), cuffM, [0, -0.43, 0]);
    add(Lg, cyl(0.09, 0.095, 0.1, 14), boot, [0, -0.5, 0]);
    add(Lg, sph(1, 14, 9), boot, [0, -0.545, 0.05], [0, 0, 0], [0.11, 0.075, 0.16]);
    add(Lg, cyl(0.11, 0.11, 0.025, 14), cuffM, [0, -0.588, 0.05], [0, 0, 0], [1, 1, 1.45]);
  }

  // ---- head: big, rosy, white eyes with black pupils, brows, button nose, smile, hair ----
  add(H, sph(0.17, 18, 14), skin, [0, 0.18, 0], [0, 0, 0], [1, 1.05, 0.95]);
  add(H, sph(0.034, 10, 8), skin, [0, 0.16, 0.165], [0, 0, 0], [1, 0.9, 1.1]);
  add(H, tor(0.055, 0.009, 4, 12, Math.PI), mat('mouth', 0x7a2e26, { roughness: 0.5 }), [0, 0.12, 0.148], [0.35, 0, Math.PI]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.04, 12, 8), eyeW, [sx * 0.06, 0.21, 0.135], [0, 0, 0], [0.85, 1.1, 0.6]);
    add(H, sph(0.022, 8, 6), eyeK, [sx * 0.06, 0.205, 0.158], [0, 0, 0], [1, 1.2, 0.6]);
    add(H, cap(0.012, 0.05, 2, 6), hairM, [sx * 0.065, 0.27, 0.145], [0, 0, sx * (Math.PI / 2 - 0.15)]);
    add(H, sph(0.032, 8, 6), cheek, [sx * 0.11, 0.14, 0.12], [0, 0, 0], [1, 0.7, 0.4]);
    add(H, sph(0.035, 8, 6), skin, [sx * 0.168, 0.18, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  add(H, sph(0.175, 16, 10), hairM, [0, 0.2, -0.02], [0, 0, 0], [1.02, 0.95, 1.0]);
  for (const sx of [-1, 1]) add(H, box(0.04, 0.09, 0.06), hairM, [sx * 0.155, 0.2, 0.06]);   // sideburns

  // ---- bobble hat: ribbed cuff, dome, pompom ----
  add(HT, ribbed(0.185, 0.185, 0.09, 32, 0.05), hatG, [0, -0.025, 0]);
  add(HT, cyl(0.18, 0.18, 0.09, 24, true), hatG, [0, -0.025, 0]);
  add(HT, new THREE.SphereGeometry(0.18, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatG, [0, 0.02, 0], [0, 0, 0], [1, 0.95, 1]);
  const pom = new THREE.IcosahedronGeometry(0.095, 2), pp = pom.attributes.position;
  for (let i = 0; i < pp.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pp, i), f = 1 + 0.12 * Math.sin(v.x * 140) * Math.sin(v.y * 130) * Math.sin(v.z * 150); pp.setXYZ(i, v.x * f, v.y * f, v.z * f); }
  pom.computeVertexNormals();
  add(HT, pom, hatG, [0, 0.26, 0]);
  return finish(R, 1.55);
