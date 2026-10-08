// cap_marrow candidate C: a different breakdown. Coat = fitted bodice + a skirt of separate hanging tatter strips;
// tricorn = crown + three upturned flaps extruded from jagged (torn) outlines; two large extruded plumes; bigger head.
  const coat = mat('coat', 0x6e6681, { roughness: 0.55, name: 'fabric' });
  const cuff = mat('cuff', 0x47405a, { roughness: 0.5, name: 'fabric' });
  const vest = mat('vest', 0x8399a0, { roughness: 0.5, name: 'fabric' });
  const trou = mat('trou', 0x37334a, { roughness: 0.5 });
  const boot = mat('boot', 0x6b4a33, { roughness: 0.45 });
  const brass = mat('brass', 0xc9a043, { roughness: 0.3, metalness: 0.7, name: 'metal' });
  const skin = mat('skin', 0xa6dcd2, { roughness: 0.4, emissive: 0x9fe8ff, emissiveIntensity: 0.14 });
  const hair = mat('hair', 0xcfe3dc, { roughness: 0.5, emissive: 0x9fe8ff, emissiveIntensity: 0.06 });
  const hatM = mat('hat', 0x6a6674, { roughness: 0.5 });
  const plume = mat('plume', 0x84918f, { roughness: 0.6, side: THREE.DoubleSide });
  const glow = mat('glow', 0x5fd6ff, { emissive: 0x9fe8ff, emissiveIntensity: 1.2, roughness: 0.3 });
  const dark = mat('mouth', 0x2d3a44, { roughness: 0.5 });
  const R = rig({ hipY: 0.8, hipX: 0.11, torsoY: 0.86, shY: 1.22, shX: 0.27, neckY: 1.26, headTop: 1.62, splay: 0.24, palm: 0.47 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- bodice and vest ----
  add(T, rbox(0.46, 0.46, 0.32, 0.12), coat, [0, 0.2, 0]);
  add(T, box(0.16, 0.4, 0.04), vest, [0, 0.15, 0.155]);
  for (let i = 0; i < 4; i++) add(T, sph(0.014, 6, 4), brass, [0.035, 0.28 - i * 0.075, 0.178]);
  for (const sx of [-1, 1]) {
    add(T, box(0.08, 0.42, 0.03), coat, [sx * 0.11, 0.17, 0.17], [0, 0, sx * 0.12]);
    add(T, rbox(0.14, 0.15, 0.1, 0.04), coat, [sx * 0.1, 0.5, -0.07], [0.3, 0, sx * 0.3]);   // collar wings
  }
  add(T, rbox(0.4, 0.14, 0.28, 0.06), trou, [0, -0.04, 0]);
  // ---- skirt: tatter strips hung on a ring, open at the front ----
  const strips = 14;
  for (let i = 0; i < strips; i++) {
    const a = 0.5 + (i / (strips - 1)) * (Math.PI * 2 - 1.0), len = 0.46 + ((i * 7) % 4) * 0.035;
    const x = Math.sin(a) * 0.23, z = Math.cos(a) * 0.17;
    add(T, box(0.11, len, 0.025), i % 4 === 1 ? cuff : coat, [x + Math.sin(a) * 0.03, 0.0 - len / 2 - 0.02, z + Math.cos(a) * 0.03], [-0.1, a, 0, 'YXZ']);
  }
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) add(T, sph(0.015, 6, 4), brass, [sx * 0.14, 0.02 - i * 0.12, 0.2 + i * 0.01]);

  // ---- arms ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, rbox(0.15, 0.3, 0.15, 0.06), coat, [0, -0.13, 0]);
    add(A, rbox(0.19, 0.11, 0.19, 0.04), cuff, [0, -0.3, 0]);
    add(A, rbox(0.12, 0.13, 0.12, 0.05), skin, [0, -0.43, 0.01]);
    add(A, cap(0.022, 0.05, 2, 6), skin, [-sx * 0.06, -0.41, 0.04], [0.3, 0, -sx * 0.4]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, rbox(0.15, 0.5, 0.15, 0.06), trou, [0, -0.25, 0]);
    add(Lg, rbox(0.19, 0.26, 0.19, 0.07), boot, [0, -0.64, 0]);
    add(Lg, rbox(0.22, 0.06, 0.22, 0.025), boot, [0, -0.52, 0]);
    add(Lg, rbox(0.18, 0.12, 0.3, 0.05), boot, [0, -0.72, 0.05]);
  }

  // ---- head: larger, glowing almond eyes, tiny nose and mouth, hair strands ----
  add(H, sph(0.17, 16, 12), skin, [0, 0.18, 0], [0, 0, 0], [0.95, 1.05, 0.95]);
  add(H, sph(0.024, 8, 6), skin, [0, 0.16, 0.16]);
  add(H, box(0.055, 0.012, 0.01), dark, [0, 0.095, 0.15]);
  for (const sx of [-1, 1]) add(H, sph(0.04, 10, 8), glow, [sx * 0.062, 0.195, 0.135], [0, 0, sx * 0.25], [1.15, 0.95, 0.6]);
  add(H, sph(0.18, 14, 10), hair, [0, 0.22, -0.03], [0, 0, 0], [1, 0.85, 1]);
  for (let i = 0; i < 11; i++) {
    const a = Math.PI * (0.32 + 1.36 * i / 10), x = Math.sin(a) * 0.16, z = Math.cos(a) * 0.14 - 0.02;
    add(H, cap(0.034, 0.17 + (i % 3) * 0.03, 2, 6), hair, [x, 0.06 - (i % 3) * 0.015, z], [-z * 1.3, 0, x * 1.5]);
  }

  // ---- tricorn: crown + three torn flaps standing on a triangle ----
  add(HT, cyl(0.15, 0.185, 0.15, 14), hatM, [0, 0.0, 0]);
  add(HT, cyl(0.188, 0.188, 0.035, 14, true), cuff, [0, -0.05, 0]);
  add(HT, cyl(0.38, 0.38, 0.03, 3), hatM, [0, -0.07, 0]);   // triangular brim floor, corner forward
  const torn = new THREE.Shape(), FL = 0.68; torn.moveTo(-FL / 2, 0);
  for (let i = 0; i <= 12; i++) { const t = i / 12; torn.lineTo(-FL / 2 + FL * t, 0.08 + 0.1 * Math.sin(Math.PI * t) + ((i * 5) % 3) * 0.02 - (i % 2) * 0.02); }
  torn.lineTo(FL / 2, 0);
  const flapG = ext(torn, 0.025, 0.006, 1, 4);
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 3 + k * (Math.PI * 2 / 3);   // side midpoints; corners at 0, 120, 240 degrees
    const ap = 0.38 * Math.cos(Math.PI / 3);
    add(HT, flapG, hatM, [Math.sin(a) * ap, -0.07, Math.cos(a) * ap], [0.2, a, 0, 'YXZ']);
  }
  const leaf = new THREE.Shape(); leaf.moveTo(0, 0);
  for (let i = 1; i <= 9; i++) leaf.lineTo(0.07 * Math.sin(Math.PI * i / 10) + (i % 2) * 0.02, i * 0.05);
  for (let i = 9; i >= 1; i--) leaf.lineTo(-0.07 * Math.sin(Math.PI * i / 10) - (i % 2) * 0.02, i * 0.05 - 0.025);
  const fg = new THREE.ExtrudeGeometry(leaf, { depth: 0.012, bevelEnabled: false }), fp = fg.attributes.position;
  for (let i = 0; i < fp.count; i++) { const y = fp.getY(i); fp.setZ(i, fp.getZ(i) - 1.2 * y * y); }
  fg.computeVertexNormals();
  for (const [rz, ry, s, dz] of [[0.55, -0.5, 1.0, 0], [0.9, -0.3, 0.85, 0.05]])
    add(HT, fg, plume, [0.14, 0.04, dz], [0, ry, -rz, 'YXZ'], [s, s, s]);
  add(HT, sph(0.032, 8, 6), mat('bone', 0xd9d6c8, { roughness: 0.5 }), [0.14, 0.03, 0.14]);
  return finish(R, 1.85);
