// candidate 3: different breakdown: three fused pillars (extruded irregular polygons cut into strata slabs,
// as in the reference's stacked blocks), different heights, plus a scree apron of boulders at the base
  const H = 50, R = 9.5; let sd = 29; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const cols = [0xc98a4a, 0xd9a866, 0x7d6f86, 0xb06a3a, 0xc29a6e, 0x8e7c8f].map((c) => { const m = M(c, { roughness: 0.85, flatShading: true }); m.name = 'stone'; return m; });
  const grass = M(0x6a9a3a, { roughness: 0.8, flatShading: true }); grass.name = 'foliage'; const guano = M(0xf2efe2, { roughness: 0.7 });
  const poly = (r, n) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const rr = r * (0.8 + rnd() * 0.3); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return shape(pts); };
  const pillars = [[0, 0, R * 0.62, H], [R * 0.45, R * 0.25, R * 0.45, H * 0.8], [-R * 0.38, R * 0.32, R * 0.42, H * 0.66], [-R * 0.1, -R * 0.42, R * 0.4, H * 0.55]];
  let ci = 0;
  pillars.forEach(([px, pz, pr, ph], pi) => { let y = 0;
    while (y < ph - 0.3) { const h = Math.min(ph - y, 3 + rnd() * 3.5), t = y / H, r = pr * (1.12 - 0.25 * t) * (y < H * 0.12 ? 1.25 : 1);
      const geo = new THREE.ExtrudeGeometry(poly(r, 6), { depth: h - 0.2, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.1, bevelSegments: 1 });
      geo.rotateX(-Math.PI / 2); const m = add(geo, cols[(ci++ + pi) % 6], px + (rnd() - 0.5) * 0.6, y + 0.1, pz + (rnd() - 0.5) * 0.6); m.rotation.y = rnd() * 6.28; y += h; }
    if (pi === 0 || rnd() > 0.4) { add(new THREE.CylinderGeometry(pr * 0.75, pr * 0.85, 0.5, 6), grass, px, ph + 0.25, pz);
      for (let i = 0; i < 4; i++) add(new THREE.ConeGeometry(0.5 + rnd() * 0.4, 1.2 + rnd(), 4), grass, px + (rnd() - 0.5) * pr, ph + 0.9, pz + (rnd() - 0.5) * pr); } });
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 + rnd(), d = R * (0.75 + rnd() * 0.2), b = add(new THREE.DodecahedronGeometry(1.8 + rnd() * 1.8, 0), cols[i % 6], Math.cos(a) * d, 1.0, Math.sin(a) * d); b.scale.y = 0.7; b.rotation.y = rnd() * 6; }
  for (let i = 0; i < 6; i++) { const a = rnd() * 6.28, y = H * (0.35 + rnd() * 0.5), len = 3 + rnd() * 5, r = R * 0.62 * (1.12 - 0.25 * y / H) * 0.95;
    const s = add(new THREE.ConeGeometry(0.4, len, 3), guano, Math.cos(a) * r, y, Math.sin(a) * r); s.rotation.x = Math.PI; s.scale.z = 0.3; s.rotation.y = -a; }
