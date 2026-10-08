// candidate 1: primitives: a pile of jittered 7-sided flat-shaded drums (one per stratum), flared base
// cone, cone grass tufts, thin box guano streaks
  const H = 50, R = 9.5; let sd = 29; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const strata = [0xc98a4a, 0xd9a866, 0x7d6f86, 0xb06a3a, 0xc29a6e, 0x8e7c8f].map((c) => { const m = M(c, { roughness: 0.85, flatShading: true }); m.name = 'stone'; return m; });
  const grass = M(0x6a9a3a, { roughness: 0.8, flatShading: true }); grass.name = 'foliage'; const guano = M(0xf2efe2, { roughness: 0.7 });
  add(new THREE.CylinderGeometry(R * 0.9, R * 1.25, H * 0.12, 8), strata[2], 0, H * 0.06, 0).rotation.y = 0.3;
  let y = H * 0.1, k = 0; const tops = [];
  while (y < H - 0.5) { const h = Math.min(H - y, 2.2 + rnd() * 3.2), t = y / H, r = R * (0.95 - 0.22 * t) * (0.88 + rnd() * 0.18);
    const m = add(new THREE.CylinderGeometry(r * (0.92 + rnd() * 0.1), r, h, 7), strata[k % strata.length], (rnd() - 0.5) * R * 0.12, y + h / 2, (rnd() - 0.5) * R * 0.12);
    m.rotation.y = rnd() * 6.28; m.scale.z = 0.8 + rnd() * 0.15; y += h; k++; tops.push([m.position.x, y, m.position.z, r]); }
  const [tx, ty, tz, tr] = tops[tops.length - 1];
  add(new THREE.CylinderGeometry(tr * 0.85, tr * 0.95, 0.6, 7), grass, tx, ty + 0.3, tz);
  for (let i = 0; i < 9; i++) { const a = rnd() * 6.28, d = rnd() * tr * 0.7; add(new THREE.ConeGeometry(0.6 + rnd() * 0.5, 1.2 + rnd(), 5), grass, tx + Math.cos(a) * d, ty + 1.0, tz + Math.sin(a) * d); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + rnd(), yy = H * (0.45 + rnd() * 0.45), len = 3 + rnd() * 6, r = R * (0.95 - 0.22 * yy / H) * 0.88;
    const s = add(new THREE.BoxGeometry(0.5 + rnd() * 0.4, len, 0.3), guano, Math.cos(a) * r, yy, Math.sin(a) * r); s.rotation.y = -a + Math.PI / 2; }
