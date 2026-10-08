// cap_kite candidate A: primitives. Kite Kowalski, surfer speedster: blue wetsuit with teal side panels, red cap worn
// backwards, sunglasses, sun-bleached spiky hair, grin, teal surf booties with chunky soles.
  const suit = mat('suit', 0x3557c9, { roughness: 0.42, name: 'fabric' });
  const teal = mat('teal', 0x1fa3a6, { roughness: 0.38 });
  const knee = mat('knee', 0x263f99, { roughness: 0.45 });
  const skin = mat('skin', 0xd49a6a, { roughness: 0.45 });
  const hairM = mat('hair', 0xf0c75a, { roughness: 0.5 });
  const red = mat('red', 0xd7372f, { roughness: 0.35 });
  const lens = mat('lens', 0x1c2128, { roughness: 0.15, metalness: 0.3 });
  const teeth = mat('teeth', 0xf3eee3, { roughness: 0.3 });
  const sole = mat('sole', 0x146f73, { roughness: 0.5 });
  const R = rig({ hipY: 0.9, hipX: 0.1, torsoY: 0.95, shY: 1.34, shX: 0.27, neckY: 1.39, headTop: 1.77, splay: 0.22, palm: 0.52 });
  const T = R.torso, H = R.head, HT = R.hat;

  // ---- torso: athletic wedge, teal side panels, zip at the back, wave mark on the chest ----
  add(T, sph(1, 16, 12), suit, [0, 0.24, 0], [0, 0, 0], [0.25, 0.22, 0.165]);
  add(T, cap(0.15, 0.12, 4, 14), suit, [0, 0.03, 0], [0, 0, 0], [1.15, 1, 0.9]);
  add(T, cyl(0.17, 0.18, 0.1, 14), suit, [0, -0.05, 0], [0, 0, 0], [1, 1, 0.85]);
  for (const sx of [-1, 1]) add(T, cap(0.04, 0.3, 3, 8), teal, [sx * 0.2, 0.12, 0], [0, 0, sx * 0.12], [0.8, 1, 1.6]);
  add(T, cyl(0.075, 0.08, 0.06, 12), suit, [0, 0.45, -0.005]);                // neck seal
  add(T, box(0.02, 0.36, 0.02), teal, [0, 0.22, -0.16]);                      // back zip
  add(T, tor(0.035, 0.008, 4, 10, Math.PI * 1.2), teal, [0.1, 0.32, 0.155], [0, 0, 0.4]);
  add(T, tor(0.022, 0.008, 4, 10, Math.PI * 1.2), teal, [0.135, 0.33, 0.152], [0, 0, 0.4]);

  // ---- arms: blue sleeve with a teal outer stripe, big open hand ----
  for (const [A, sx] of [[R.armLg, 1], [R.armRg, -1]]) {
    add(A, sph(0.085, 12, 8), suit, [0, -0.01, 0]);
    add(A, cap(0.07, 0.34, 3, 10), suit, [0, -0.2, 0]);
    add(A, cap(0.025, 0.3, 2, 6), teal, [sx * 0.055, -0.19, 0]);
    add(A, sph(1, 12, 9), skin, [0, -0.47, 0.0], [0, 0, 0], [0.045, 0.085, 0.075]);
    add(A, box(0.05, 0.08, 0.06), skin, [0, -0.54, 0.005]);
    add(A, cap(0.02, 0.05, 2, 6), skin, [-sx * 0.04, -0.46, 0.06], [0.5, 0, -sx * 0.3]);
  }

  // ---- legs: wetsuit legs, knee pads, teal booties with straps, bare toes, ridged soles ----
  for (const Lg of [R.legL, R.legR]) {
    add(Lg, cap(0.085, 0.55, 3, 10), suit, [0, -0.33, 0]);
    add(Lg, sph(0.06, 10, 6), knee, [0, -0.46, 0.06], [0, 0, 0], [1, 1.2, 0.5]);
    add(Lg, cyl(0.1, 0.095, 0.18, 12), teal, [0, -0.77, 0]);
    add(Lg, box(0.18, 0.04, 0.24), teal, [0, -0.85, 0.06]);
    add(Lg, box(0.2, 0.035, 0.03), teal, [0, -0.8, 0.12]);
    add(Lg, sph(1, 10, 6), skin, [0, -0.83, 0.15], [0, 0, 0], [0.075, 0.035, 0.06]);
    add(Lg, box(0.19, 0.04, 0.32), sole, [0, -0.88, 0.05]);
    for (let i = 0; i < 4; i++) add(Lg, box(0.2, 0.02, 0.03), sole, [0, -0.9, -0.08 + i * 0.08]);
  }

  // ---- head (built at a 0.15 m radius, scaled up 1.13 in an inner group): grin, sunglasses, nose, ears, shaggy hair ----
  const HG = new THREE.Group(); HG.scale.setScalar(1.13); H.add(HG);
  const dirE = (d) => { const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize())); return [e.x, e.y, e.z]; };
  add(HG, sph(0.15, 16, 12), skin, [0, 0.16, 0], [0, 0, 0], [0.95, 1.08, 0.97]);
  add(HG, sph(0.1, 12, 8), skin, [0, 0.08, 0.04], [0, 0, 0], [1.2, 0.8, 1]);     // jaw
  add(HG, sph(0.03, 8, 6), skin, [0, 0.15, 0.152], [0, 0, 0], [0.9, 1, 1.1]);
  const half = (r) => new THREE.CylinderGeometry(r, r, 0.02, 12, 1, false, -Math.PI / 2, Math.PI);
  add(HG, half(0.062), mat('lip', 0x7a2e26, { roughness: 0.5 }), [0, 0.112, 0.128], [Math.PI / 2 - 0.25, 0, 0], [1, 1, 0.62]);
  add(HG, half(0.052), teeth, [0, 0.108, 0.136], [Math.PI / 2 - 0.25, 0, 0], [1, 1, 0.5]);
  for (const sx of [-1, 1]) {
    add(HG, rbox(0.085, 0.055, 0.03, 0.015), lens, [sx * 0.055, 0.2, 0.135], [0, sx * 0.2, 0]);
    add(HG, box(0.012, 0.012, 0.13), lens, [sx * 0.135, 0.205, 0.07]);
    add(HG, sph(0.032, 8, 6), skin, [sx * 0.145, 0.16, 0], [0, 0, 0], [0.5, 1, 0.8]);
  }
  add(HG, box(0.04, 0.012, 0.012), lens, [0, 0.21, 0.15]);
  add(HG, sph(0.158, 14, 10), hairM, [0, 0.2, -0.025], [0, 0, 0], [1.04, 0.9, 1.04]);
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (0.38 + 1.24 * i / 12), d = [Math.sin(a), -0.7 - (i % 3) * 0.2, Math.cos(a)];
    add(HG, new THREE.ConeGeometry(0.04, 0.12, 6), hairM, [Math.sin(a) * 0.15, 0.2 - (i % 2) * 0.03, Math.cos(a) * 0.14 - 0.02], dirE(d));
  }
  for (const x of [-0.09, -0.04, 0.03, 0.09]) add(HG, new THREE.ConeGeometry(0.032, 0.09, 6), hairM, [x, 0.27, 0.115], dirE([x * 3, -0.4, 1]));

  // ---- cap worn backwards: dome, bill pointing back, button, the strap gap now facing forward ----
  const HC = new THREE.Group(); HC.scale.setScalar(1.13); HT.add(HC);
  add(HC, new THREE.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), red, [0, -0.07, -0.01], [0, 0, 0], [1, 0.8, 1.05]);
  add(HC, cyl(0.163, 0.163, 0.035, 16, true), red, [0, -0.07, -0.01]);
  add(HC, new THREE.CylinderGeometry(0.15, 0.15, 0.018, 16, 1, false, Math.PI / 2, Math.PI), red, [0, -0.06, -0.1], [-0.12, 0, 0], [0.85, 1, 1]);
  add(HC, sph(0.02, 8, 6), red, [0, 0.06, -0.01]);
  add(HC, box(0.08, 0.025, 0.01), teeth, [0, -0.06, 0.16]);                // strap band visible on the forehead
  return finish(R, 1.85);
