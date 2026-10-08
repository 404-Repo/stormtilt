// cap_marrow candidate A: primitives. Lady Marrow, ghost captain: pale glowing skin and eyes, tattered grey-violet
// greatcoat (open cylinder with a zigzag hem), tricorn from a 3-sided lathe, ellipsoid plumes, capsule hair strands.
  const coat = mat('coat', 0x6e6681, { roughness: 0.55, side: THREE.DoubleSide, name: 'fabric' });
  const cuff = mat('cuff', 0x47405a, { roughness: 0.5, side: THREE.DoubleSide, name: 'fabric' });
  const vest = mat('vest', 0x8399a0, { roughness: 0.5, name: 'fabric' });
  const trou = mat('trou', 0x37334a, { roughness: 0.5 });
  const boot = mat('boot', 0x6b4a33, { roughness: 0.45 });
  const brass = mat('brass', 0xc9a043, { roughness: 0.3, metalness: 0.7, name: 'metal' });
  const skin = mat('skin', 0xa6dcd2, { roughness: 0.4, emissive: 0x9fe8ff, emissiveIntensity: 0.14 });
  const hair = mat('hair', 0xcfe3dc, { roughness: 0.5, emissive: 0x9fe8ff, emissiveIntensity: 0.06 });
  const hatM = mat('hat', 0x55525f, { roughness: 0.5, side: THREE.DoubleSide });
  const plume = mat('plume', 0x7f8c90, { roughness: 0.6, side: THREE.DoubleSide });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 1.2, roughness: 0.3 });
  const dark = mat('mouth', 0x2d3a44, { roughness: 0.5 });
  const R = rig({ hipY: 0.8, hipX: 0.11, torsoY: 0.86, shY: 1.23, shX: 0.26, neckY: 1.27, headTop: 1.6, splay: 0.24, palm: 0.47 });
  const T = R.torso, H = R.head, HT = R.hat;
  // open cylinder whose bottom ring is cut into ragged teeth
  const ragged = (rt, rb, h, segs, t0, tl, depth) => {
    const ge = new THREE.CylinderGeometry(rt, rb, h, segs, 1, true, t0, tl), p = ge.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) { const k = i % (segs + 1); p.setY(i, p.getY(i) - depth * ((k * 7) % 3) / 2 - (k % 2) * depth * 0.6); }
    ge.computeVertexNormals(); return ge;
  };

  // ---- torso ----
  add(T, sph(1, 16, 12), coat, [0, 0.2, 0], [0, 0, 0], [0.25, 0.25, 0.18]);
  add(T, box(0.17, 0.36, 0.06), vest, [0, 0.13, 0.15]);
  for (let i = 0; i < 4; i++) add(T, sph(0.014, 6, 4), brass, [0.035, 0.24 - i * 0.07, 0.185]);
  add(T, ragged(0.21, 0.3, 0.6, 26, 0.42, Math.PI * 2 - 0.84, 0.09), coat, [0, -0.2, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, cyl(0.2, 0.21, 0.16, 14), trou, [0, -0.04, 0], [0, 0, 0], [1, 1, 0.75]);
  for (const sx of [-1, 1]) {
    add(T, box(0.09, 0.36, 0.03), coat, [sx * 0.115, 0.21, 0.16], [0.18, sx * 0.55, 0]);   // lapel
    for (let i = 0; i < 3; i++) { const y = 0.02 - i * 0.12, r = 0.21 + (0.1 - y) / 0.6 * 0.09 + 0.01; add(T, sph(0.014, 6, 4), brass, [sx * r * Math.sin(0.5), y, r * Math.cos(0.5) * 0.8]); }
  }
  add(T, box(0.12, 0.1, 0.02), cuff, [0.19, -0.2, 0.2], [0, 0.35, 0.1]);        // pocket flap
  add(T, box(0.09, 0.12, 0.02), cuff, [-0.2, -0.32, -0.19], [0, -0.5, 0.2]);    // patch
  add(T, box(0.1, 0.08, 0.02), cuff, [0.12, -0.05, -0.23], [0, 0.3, -0.15]);    // patch
  add(T, new THREE.CylinderGeometry(0.2, 0.16, 0.16, 14, 1, true, Math.PI / 2 - 0.2, Math.PI + 0.4), coat, [0, 0.43, -0.01]); // turned-up collar

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.085, 12, 8), coat, [0, -0.01, 0]);
    add(A, cap(0.072, 0.26, 3, 10), coat, [0, -0.17, 0]);
    add(A, ragged(0.1, 0.095, 0.11, 14, 0, Math.PI * 2, 0.025), cuff, [0, -0.3, 0]);
    add(A, cyl(0.06, 0.08, 0.05, 10), vest, [0, -0.37, 0]);
    add(A, sph(0.075, 12, 9), skin, [0, -0.44, 0.0], [0, 0, 0], [0.8, 1.15, 1]);
    add(A, cap(0.022, 0.05, 2, 6), skin, [-sx * 0.05, -0.42, 0.04], [0.3, 0, -sx * 0.4]);
  }

  // ---- legs: dark breeches, brown boots with a folded top ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, cap(0.08, 0.42, 3, 10), trou, [0, -0.26, 0]);
    add(Lg, cyl(0.1, 0.09, 0.24, 12), boot, [0, -0.64, 0]);
    add(Lg, cyl(0.115, 0.11, 0.06, 12), boot, [0, -0.52, 0]);
    add(Lg, sph(1, 12, 8), boot, [0, -0.74, 0.05], [0, 0, 0], [0.1, 0.07, 0.17]);
    add(Lg, cyl(0.1, 0.1, 0.03, 12), mat('sole', 0x3a2a1f), [0, -0.785, 0.04], [0, 0, 0], [1.05, 1, 1.6]);
  }

  // ---- head: glowing eyes, small nose, mouth, pale hair mass and strands ----
  add(H, sph(0.15, 16, 12), skin, [0, 0.16, 0], [0, 0, 0], [0.95, 1.05, 0.95]);
  add(H, sph(0.022, 8, 6), skin, [0, 0.14, 0.145]);
  add(H, box(0.05, 0.01, 0.01), dark, [0, 0.085, 0.135]);
  for (const sx of [-1, 1]) add(H, sph(0.036, 10, 8), glow, [sx * 0.055, 0.175, 0.12], [0, 0, 0], [1, 1.1, 0.6]);
  add(H, sph(0.16, 14, 10), hair, [0, 0.19, -0.03], [0, 0, 0], [1.02, 0.95, 1.0]);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.35 + 1.3 * i / 8), x = Math.sin(a) * 0.14, z = Math.cos(a) * 0.12 - 0.02;
    add(H, cap(0.032, 0.16, 2, 6), hair, [x * 1.05, 0.04, z], [-z * 1.2, 0, x * 1.4]);
  }

  // ---- tricorn: crown, band, three-sided upturned brim, plumes ----
  add(HT, cyl(0.14, 0.17, 0.15, 14), hatM, [0, 0.0, 0]);
  add(HT, cyl(0.172, 0.172, 0.035, 14, true), cuff, [0, -0.05, 0]);
  const brim = lathe([[0.44, 0.07], [0.37, -0.06], [0.12, -0.04]], 3).toNonIndexed(); brim.computeVertexNormals();
  add(HT, brim, hatM, [0, -0.04, 0], [0, 0, 0], [1, 1, 1]);
  for (const [rz, rx, len, dz] of [[0.75, -0.9, 0.3, 0.0], [1.05, -0.7, 0.27, 0.05], [0.45, -1.1, 0.26, -0.04], [1.3, -0.4, 0.22, 0.08]])
    add(HT, sph(1, 10, 8), plume, [0.1 + Math.sin(rz) * len * 0.7, 0.05 + Math.cos(rz) * len * 0.5, -0.08 + dz - len * 0.35], [rx, 0, -rz], [0.075, len, 0.024]);
  add(HT, sph(0.03, 8, 6), mat('bone', 0xd9d6c8, { roughness: 0.5 }), [0.12, 0.02, 0.1]);
  return finish(R, 1.85);
