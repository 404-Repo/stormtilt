// cap_gilly candidate B: profiles. One jumper profile cut into alternating lathe stripe bands, lathe sleeves, trousers,
// boots (shaft + forward-laid toe), lathe head, beanie as a lathe with ribs pushed out per segment, pompom of small spheres.
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
  const hatG = mat('hatG', 0x2f8a4a, { roughness: 0.5, side: THREE.DoubleSide });
  const R = rig({ hipY: 0.6, hipX: 0.09, torsoY: 0.64, shY: 0.95, shX: 0.22, neckY: 0.99, headTop: 1.35, splay: 0.22, palm: 0.4 });
  const T = R.torso, H = R.head, HT = R.hat;
  const L = (pts, s, a0, al) => new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), s, a0 || 0, al || Math.PI * 2);
  // radius of a profile at height y (profile listed bottom to top)
  const rAt = (P, y) => { for (let i = 1; i < P.length; i++) if (y <= P[i][1]) { const t = (y - P[i - 1][1]) / (P[i][1] - P[i - 1][1]); return P[i - 1][0] + t * (P[i][0] - P[i - 1][0]); } return P[P.length - 1][0]; };
  const stripes = (node, P, ya, yb, n, segs, sc) => {
    for (let i = 0; i < n; i++) {
      const a = ya + (yb - ya) * i / n, b = ya + (yb - ya) * (i + 1) / n, pts = [];
      for (let k = 0; k <= 3; k++) { const y = a + (b - a) * k / 3; pts.push([rAt(P, y), y]); }
      add(node, L(pts, segs), i % 2 ? white : green, [0, 0, 0], [0, 0, 0], sc);
    }
  };

  // ---- jumper ----
  const jp = [[0.19, -0.1], [0.205, -0.04], [0.21, 0.1], [0.225, 0.24], [0.21, 0.32], [0.15, 0.38], [0.09, 0.41]];
  add(T, L([[0, -0.1], [0.19, -0.1]], 18), green, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, L([[0.19, -0.11], [0.2, -0.04]], 24), green, [0, 0, 0], [0, 0, 0], [1.02, 1, 0.82]);
  stripes(T, jp, -0.04, 0.3, 7, 18, [1, 1, 0.8]);
  add(T, L([[0.21, 0.3], [0.2, 0.33], [0.15, 0.38], [0.09, 0.41]], 18), green, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);
  add(T, L([[0.085, 0.38], [0.11, 0.4], [0.11, 0.45], [0.08, 0.46]], 14), green);   // roll neck
  add(T, L([[0.17, -0.2], [0.19, -0.1]], 14), trou, [0, 0, 0], [0, 0, 0], [1, 1, 0.8]);

  // ---- sleeves ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    const sp = [[0.07, -0.26], [0.072, -0.1], [0.078, 0.0], [0.06, 0.06]];
    add(A, L([[0, 0.075], [0.06, 0.06]], 12), green);
    stripes(A, sp, -0.26, 0.0, 5, 12, [1, 1, 1]);
    add(A, L([[0.072, -0.25], [0.076, -0.27], [0.072, -0.32], [0.05, -0.33]], 12), green);
    add(A, L([[0, -0.32], [0.045, -0.33], [0.058, -0.38], [0.05, -0.44], [0, -0.46]], 10), skin, [0, 0, 0.005], [0, 0, 0], [1, 1, 1.25]);
    add(A, cap(0.02, 0.04, 2, 6), skin, [-sx * 0.045, -0.36, 0.04], [0.4, 0, -sx * 0.4]);
  }

  // ---- legs ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, L([[0.08, 0.03], [0.078, -0.2], [0.07, -0.4], [0, -0.42]], 12), trou);
    add(Lg, L([[0.088, -0.53], [0.09, -0.46], [0.1, -0.455], [0.105, -0.4], [0.08, -0.395]], 14), cuffM);
    add(Lg, L([[0, 0], [0.1, 0], [0.105, 0.09], [0.08, 0.17], [0, 0.2]], 12), boot, [0, -0.555, -0.03], [Math.PI / 2, 0, 0], [1.05, 1, 0.6]);
    add(Lg, cyl(0.1, 0.1, 0.06, 12), boot, [0, -0.53, 0]);
    add(Lg, cyl(0.11, 0.11, 0.025, 14), cuffM, [0, -0.588, 0.05], [0, 0, 0], [1, 1, 1.45]);
  }

  // ---- head ----
  add(H, L([[0, 0.0], [0.1, 0.012], [0.16, 0.09], [0.178, 0.19], [0.165, 0.29], [0.1, 0.35], [0, 0.36]], 18), skin, [0, 0, 0], [0, 0, 0], [1, 1, 0.95]);
  add(H, sph(0.034, 10, 8), skin, [0, 0.16, 0.172], [0, 0, 0], [1, 0.9, 1.1]);
  add(H, tor(0.055, 0.009, 4, 12, Math.PI), mat('mouth', 0x7a2e26, { roughness: 0.5 }), [0, 0.115, 0.155], [0.35, 0, Math.PI]);
  for (const sx of [-1, 1]) {
    add(H, sph(0.042, 12, 8), eyeW, [sx * 0.062, 0.21, 0.14], [0, 0, 0], [0.85, 1.1, 0.6]);
    add(H, sph(0.023, 8, 6), eyeK, [sx * 0.062, 0.205, 0.163], [0, 0, 0], [1, 1.2, 0.6]);
    add(H, cap(0.012, 0.05, 2, 6), hairM, [sx * 0.065, 0.272, 0.15], [0, 0, sx * (Math.PI / 2 - 0.15)]);
    add(H, sph(0.032, 8, 6), cheek, [sx * 0.112, 0.14, 0.13], [0, 0, 0], [1, 0.7, 0.4]);
    add(H, sph(0.035, 8, 6), skin, [sx * 0.175, 0.18, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  // hair: a lathe cap open at the face, with a fringe flick at the front
  add(H, L([[0.172, 0.12], [0.185, 0.22], [0.16, 0.3], [0.1, 0.355], [0, 0.37]], 16, 0.6, Math.PI * 2 - 1.2), hairM);
  add(H, sph(0.08, 10, 6), hairM, [-0.05, 0.3, 0.12], [0, 0, 0.5], [1.3, 0.5, 0.6]);

  // ---- beanie ----
  const cuffG = L([[0.188, -0.07], [0.195, -0.03], [0.192, 0.02], [0.18, 0.025]], 32), cp = cuffG.attributes.position;
  for (let i = 0; i < cp.count; i++) { const j = Math.floor(i / 4), f = 1 + (j % 2) * 0.05; cp.setX(i, cp.getX(i) * f); cp.setZ(i, cp.getZ(i) * f); }
  cuffG.computeVertexNormals();
  add(HT, cuffG, hatG, [0, 0.0, 0]);
  add(HT, L([[0.18, 0.02], [0.18, 0.08], [0.15, 0.16], [0.09, 0.2], [0, 0.21]], 18), hatG);
  for (let i = 0; i < 14; i++) {
    const v = new THREE.Vector3(Math.sin(i * 2.4) * (0.5 + (i % 3) * 0.2), 0.6 + ((i * 3) % 5) * 0.1, Math.cos(i * 2.4) * (0.5 + (i % 3) * 0.2)).normalize();
    add(HT, sph(0.04, 7, 5), hatG, [v.x * 0.06, 0.26 + v.y * 0.04 - 0.02, v.z * 0.06]);
  }
  add(HT, sph(0.065, 10, 8), hatG, [0, 0.25, 0]);
  return finish(R, 1.55);
