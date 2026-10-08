// cap_nimbus candidate C: a blockier vinyl-toy reading. Rounded-box chest and head, the coat skirt as separate
// flared panels (back, two fronts, two sides), two-segment arms with mitten fists, one thick extruded bicorne.
  const coat = mat('coat', 0x737985, { roughness: 0.42, name: 'fabric' });
  const vest = mat('vest', 0x8d939c, { roughness: 0.42, name: 'fabric' });
  const dark = mat('dark', 0x3d424b, { roughness: 0.4 });
  const gold = mat('gold', 0xd2a640, { roughness: 0.3, metalness: 0.7, name: 'metal' });
  const skin = mat('skin', 0xf1c7a0, { roughness: 0.45 });
  const beard = mat('beard', 0xeef1f4, { roughness: 0.6 });
  const hatM = mat('hat', 0x2c2a36, { roughness: 0.32 });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 0.9, roughness: 0.3 });
  const R = rig({ hipY: 0.8, hipX: 0.15, torsoY: 0.88, shY: 1.26, shX: 0.37, neckY: 1.31, headTop: 1.67, splay: 0.2, palm: 0.53 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- chest block, vest front, buttons ----
  add(T, rbox(0.66, 0.52, 0.46, 0.13), coat, [0, 0.2, 0]);
  add(T, box(0.3, 0.5, 0.06), vest, [0, 0.12, 0.215]);
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) add(T, sph(0.026, 6, 4), gold, [sx * 0.075, 0.3 - i * 0.085, 0.25]);
  // lapels: coat-coloured strips angled outwards with gold piping on the inner edge
  for (const sx of [-1, 1]) {
    add(T, box(0.1, 0.5, 0.05), coat, [sx * 0.2, 0.2, 0.225], [0, 0, sx * 0.06]);
    add(T, box(0.025, 0.52, 0.03), gold, [sx * 0.155, 0.2, 0.25], [0, 0, sx * 0.06]);
    for (let i = 0; i < 3; i++) add(T, sph(0.022, 6, 4), gold, [sx * 0.25, 0.3 - i * 0.12, 0.25]);
  }
  // waist and trouser seat
  add(T, box(0.56, 0.2, 0.4), dark, [0, -0.08, 0]);
  // ---- coat skirt: flared panels hanging from the waist ----
  // a panel facing outward along yaw ry, flared out by -th at the hem (Euler YXZ: tilt in panel space, then yaw)
  const skirt = (x, z, ry, w, th = -0.13) => {
    add(T, box(w, 0.46, 0.05), coat, [x, -0.16, z], [th, ry, 0, 'YXZ']);
    const hz = -0.23 * Math.sin(th), hy = -0.23 * Math.cos(th);
    add(T, box(w + 0.01, 0.035, 0.065), gold, [x + hz * Math.sin(ry), -0.16 + hy, z + hz * Math.cos(ry)], [th, ry, 0, 'YXZ']);
  };
  skirt(0, -0.23, Math.PI, 0.6);                        // back
  for (const sx of [-1, 1]) {
    skirt(sx * 0.31, 0.0, sx * Math.PI / 2, 0.42);       // sides
    skirt(sx * 0.2, 0.2, 0, 0.2);                        // fronts
    add(T, box(0.025, 0.46, 0.03), gold, [sx * 0.1, -0.16, 0.255], [-0.13, 0, 0]);
  }
  add(T, box(0.025, 0.3, 0.03), dark, [0, -0.25, -0.26], [-0.12, 0, 0]);
  for (const sx of [-1, 1]) add(T, sph(0.026, 6, 4), gold, [sx * 0.1, -0.02, -0.235]);
  add(T, rbox(0.34, 0.1, 0.3, 0.04), coat, [0, 0.47, -0.02]);      // stand collar
  add(T, box(0.35, 0.02, 0.31), gold, [0, 0.52, -0.02]);

  // ---- arms: upper sleeve, forearm, gold cuff, mitten fist, epaulette block with fringe ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.135, 10, 6), coat, [0, -0.02, 0]);
    add(A, rbox(0.22, 0.24, 0.22, 0.09), coat, [0, -0.14, 0]);
    add(A, rbox(0.24, 0.17, 0.24, 0.09), coat, [0, -0.3, 0.01]);
    add(A, rbox(0.26, 0.05, 0.26, 0.02), gold, [0, -0.375, 0.01]);
    add(A, rbox(0.2, 0.17, 0.2, 0.08), skin, [0, -0.48, 0.02]);
    add(A, rbox(0.06, 0.09, 0.07, 0.03), skin, [-sx * 0.1, -0.45, 0.06]);
    add(A, rbox(0.28, 0.06, 0.26, 0.03), gold, [sx * 0.03, 0.11, 0], [0, 0, sx * 0.15]);
    for (let i = 0; i < 5; i++) add(A, cyl(0.022, 0.022, 0.09, 5), gold, [sx * 0.165, 0.05, -0.1 + i * 0.05]);
    for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) add(A, cyl(0.022, 0.022, 0.09, 5), gold, [sx * (0.05 + i * 0.04), 0.05, sz * 0.13]);
  }

  // ---- legs: rounded-box trousers, big rounded boots ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, rbox(0.19, 0.6, 0.2, 0.08), dark, [0, -0.3, 0]);
    add(Lg, rbox(0.25, 0.22, 0.26, 0.1), dark, [0, -0.67, 0]);
    add(Lg, rbox(0.25, 0.14, 0.4, 0.07), dark, [0, -0.73, 0.06]);
    add(Lg, rbox(0.27, 0.04, 0.42, 0.02), mat('sole', 0x2a2d33), [0, -0.785, 0.06]);
  }

  // ---- head: big rounded block, glowing eyes, angry brows, bulb nose, stacked-cloud beard ----
  add(H, rbox(0.34, 0.36, 0.32, 0.13), skin, [0, 0.19, 0]);
  add(H, sph(0.05, 8, 6), skin, [0, 0.17, 0.175]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.042, 8, 6), glow, [sx * 0.07, 0.215, 0.15], [0, 0, 0], [1.1, 0.8, 0.5]);
    add(H, rbox(0.11, 0.045, 0.06, 0.02), beard, [sx * 0.072, 0.265, 0.16], [0, 0, -sx * 0.4]);
    add(H, rbox(0.05, 0.08, 0.05, 0.02), skin, [sx * 0.18, 0.2, 0]);
    add(H, sph(0.06, 9, 6), beard, [sx * 0.058, 0.128, 0.175], [0, 0, sx * 0.3], [1.35, 0.7, 0.8]);
  }
  for (const [x, y, z, r] of [[0, -0.1, 0.16, 0.09], [-0.1, -0.05, 0.15, 0.08], [0.1, -0.05, 0.15, 0.08], [-0.17, 0.05, 0.1, 0.07], [0.17, 0.05, 0.1, 0.07],
    [0, 0.0, 0.18, 0.08], [-0.08, 0.06, 0.18, 0.06], [0.08, 0.06, 0.18, 0.06], [-0.05, -0.17, 0.12, 0.06], [0.05, -0.17, 0.12, 0.06]])
    add(H, sph(r, 8, 5), beard, [x, y, z]);
  add(H, rbox(0.36, 0.24, 0.12, 0.06), beard, [0, 0.16, -0.12]);   // hair at the back

  // ---- bicorne: one thick crescent, bevelled, with a gold rim band, crown fill and cockade ----
  const cres = new THREE.Shape(), W = 0.45, HH = 0.3, N = 12;
  cres.moveTo(-W, 0.0);
  for (let i = 1; i <= N; i++) { const t = i / N; cres.lineTo(-W + 2 * W * t, HH * Math.pow(Math.sin(Math.PI * t), 0.7)); }
  for (let i = N - 1; i >= 1; i--) { const t = i / N; cres.lineTo(-W + 2 * W * t, -0.02 + 0.07 * Math.sin(Math.PI * t)); }
  add(HT, ext(cres, 0.15, 0.03, 1, 6), hatM, [0, -0.09, 0]);
  add(HT, ext(cres, 0.12, 0, 1, 6), gold, [0, -0.096, 0], [0, 0, 0], [1.05, 1.08, 1]);
  add(HT, cyl(0.055, 0.055, 0.025, 14), gold, [0.21, 0.03, 0.11], [Math.PI / 2, 0, 0]);
  const bolt = shape([[0, 0], [0.034, 0.055], [0.014, 0.055], [0.045, 0.11], [-0.006, 0.045], [0.016, 0.045], [-0.014, 0]]);
  const bg = ext(bolt, 0.016, 0);
  for (const [x, y, rz, s] of [[-0.18, -0.02, 0.25, 1.5], [-0.05, 0.05, -0.3, 1.35], [0.07, -0.05, 0.45, 1.15], [0.3, -0.06, -0.2, 0.9]]) {
    add(HT, bg, glow, [x, y, 0.11], [0, 0, rz], [s, s, 1]);
    add(HT, bg, glow, [-x, y, -0.11], [0, Math.PI, rz], [s, s, 1]);
  }
  return finish(R, 1.85);
