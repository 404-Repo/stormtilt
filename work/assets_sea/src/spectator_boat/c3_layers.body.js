// candidate 3: stacked plan-view slabs (ExtrudeGeometry of a sampled planform): a narrow cobalt keel slab,
  const white = M(0xf3eee3), cobalt = M(0x2a5bd7), redM = M(0xd7372f), sunM = M(0xf2b630), dark = M(0x2a2830, { roughness: 0.5 });
  const teak = M(0xa8652f, { roughness: 0.6 }); teak.name = 'timber'; const deckM = M(0xc89a62, { roughness: 0.65 }); deckM.name = 'timber';
  const steel = M(0x8f9aa3, { metalness: 0.7, roughness: 0.3 }); steel.name = 'metal'; const glassM = M(0x2a3550, { roughness: 0.15 }); const rope = M(0xb59a6a, { roughness: 0.8 });
// a cobalt bilge slab, a white topside ring and a teak capping ring; chunky toy layering
  const DECKY = 1.35, BOWLIFT = 0.1, L2 = 4.0;
  const outline = (k, inset = 0) => { const pts = [], N = 18; for (let i = 0; i <= N; i++) { const z = -L2 + 2 * L2 * i / N, s = z / L2;
      const hb = (s >= 0 ? 1.4 * Math.pow(Math.max(0, 1 - Math.pow(s, 2.2)), 0.55) : 1.4 * (1 - 0.1 * s * s)) * k - inset; pts.push([Math.max(0.02, hb), z]); }
    const sh = new THREE.Shape(); sh.moveTo(-pts[0][0], -pts[0][1]); pts.forEach(([x, z]) => sh.lineTo(x, -z)); for (let i = pts.length - 1; i >= 0; i--) sh.lineTo(-pts[i][0], -pts[i][1]); return sh; };
  const slab = (sh, y0, h, mat) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 3 }); geo.rotateX(-Math.PI / 2); return add(geo, mat, 0, y0, 0); };
  const sc = (sh, s) => { sh.getPoints().forEach(() => {}); return sh; };
  { const k = slab(outline(0.55), 0, 0.35, cobalt); k.scale.z = 0.86; }
  { const k = slab(outline(0.85), 0.35, 0.5, cobalt); k.scale.z = 0.95; }
  { const sh = outline(1.0); sh.holes.push(new THREE.Path(outline(1.0, 0.14).getPoints())); slab(sh, 0.85, 0.8, white); }
  slab(outline(1.0, 0.05), 0.85, DECKY - 0.85, deckM);
  { const sh = outline(1.03); sh.holes.push(new THREE.Path(outline(1.0, 0.12).getPoints())); slab(sh, 1.65, 0.09, teak); }
  { const sh = outline(1.02); sh.holes.push(new THREE.Path(outline(0.99).getPoints())); slab(sh, 0.88, 0.14, teak); }
  // ---- shared upperworks: cabin, cockpit benches, seated toy spectators, striped canopy, bunting ----
  const D = DECKY;
  add(new THREE.BoxGeometry(2.0, 0.95, 1.9), white, 0, D + 0.47, 1.5);
  add(new THREE.BoxGeometry(2.15, 0.12, 2.1), white, 0, D + 1.0, 1.45);
  const ws = add(new THREE.BoxGeometry(1.9, 0.5, 0.08), glassM, 0, D + 1.2, 0.55); ws.rotation.x = -0.35;
  for (const s of [-1, 1]) for (const z of [1.1, 1.9]) add(new THREE.BoxGeometry(0.06, 0.38, 0.55), glassM, s * 1.0, D + 0.62, z);
  add(new THREE.BoxGeometry(0.7, 0.38, 0.06), glassM, -0.45, D + 0.62, 2.46); add(new THREE.BoxGeometry(0.7, 0.38, 0.06), glassM, 0.45, D + 0.62, 2.46);
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.5, 0.42, 3.6), teak, s * 0.98, D + 0.21, -1.6); add(new THREE.BoxGeometry(0.1, 0.5, 3.6), teak, s * 1.2, D + 0.6, -1.6); }
  add(new THREE.BoxGeometry(1.5, 0.42, 0.5), teak, 0, D + 0.21, -3.45);
  // spectators: seated toy figures facing outboard
  const coats = [cobalt, sunM, redM, M(0x3e8a5a), cobalt], skins = [0xf1c7a0, 0xc68b5e, 0x8a5a3c, 0xf1c7a0, 0xc68b5e].map((c) => M(c, { roughness: 0.6 }));
  [[1, -0.6, 0], [1, -2.3, 1], [-1, -1.2, 2], [-1, -2.8, 3], [0, -3.45, 4]].forEach(([s, z, i]) => {
    const f = new THREE.Group(); f.position.set(s * 0.98, D + 0.42, z); f.rotation.y = s === 0 ? Math.PI : s * Math.PI / 2; g.add(f);
    add(new THREE.CylinderGeometry(0.2, 0.24, 0.55, 8), coats[i], 0, 0.28, 0, f);
    add(new THREE.SphereGeometry(0.19, 10, 8), skins[i], 0, 0.75, 0, f);
    for (const e of [-1, 1]) add(new THREE.SphereGeometry(0.035, 6, 4), dark, e * 0.07, 0.78, 0.17, f);
    for (const a of [-1, 1]) { const arm = add(new THREE.CylinderGeometry(0.065, 0.065, 0.42, 6), coats[i], a * 0.27, 0.3, 0.08, f); arm.rotation.x = -0.6; arm.rotation.z = a * 0.2; }
    for (const l of [-1, 1]) add(new THREE.BoxGeometry(0.13, 0.13, 0.42), dark, l * 0.1, 0.02, 0.25, f);
    if (i % 2 === 0) { add(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), i ? sunM : dark, 0, 0.9, 0, f); add(new THREE.CylinderGeometry(0.13, 0.15, 0.16, 10), i ? sunM : dark, 0, 0.99, 0, f); }
    else add(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), redM, 0, 0.78, 0, f); });
  // canopy: posts + seven alternating stripes, valance
  const cz0 = -3.7, cz1 = 0.35, ctop = D + 2.15;
  for (const s of [-1, 1]) for (const z of [cz0, cz1]) add(new THREE.CylinderGeometry(0.045, 0.045, ctop - D, 6), steel, s * 1.25, D + (ctop - D) / 2, z);
  for (let i = 0; i < 7; i++) { const x = -1.35 + (i + 0.5) * 2.7 / 7; add(new THREE.BoxGeometry(2.7 / 7, 0.08, cz1 - cz0 + 0.3), i % 2 ? white : redM, x, ctop + 0.04 + 0.05 * Math.cos((x / 1.35) * Math.PI / 2), (cz0 + cz1) / 2); }
  for (const z of [cz0 - 0.15, cz1 + 0.15]) for (let i = 0; i < 7; i++) add(new THREE.BoxGeometry(2.7 / 7, 0.22, 0.04), i % 2 ? white : redM, -1.35 + (i + 0.5) * 2.7 / 7, ctop - 0.07, z);
  // bow and stern staffs, bunting lines with triangle flags
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 6), teak, 0, D + 0.95 + BOWLIFT, 3.55);
  const flagCols = [redM, white, cobalt, sunM, M(0x3e8a5a)], tri = new THREE.ShapeGeometry(shape([[-0.13, 0], [0.13, 0], [0, -0.3]]));
  const bunting = (A, B, n) => { rod(A, B, 0.012, rope, 3); for (let i = 1; i < n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 0.18;
      const fl = add(tri, flagCols[i % 5], A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag, A[2] + (B[2] - A[2]) * t); fl.rotation.y = Math.atan2(B[0] - A[0], B[2] - A[2]) + Math.PI / 2; fl.material.side = THREE.DoubleSide; } };
  const top = [0, D + 1.9 + BOWLIFT, 3.55];
  bunting([-1.25, ctop, cz1], top, 8); bunting([1.25, ctop, cz1], top, 8); bunting([-1.25, ctop, cz0], [1.25, ctop, cz0], 6); bunting([-1.25, ctop, cz0], [-1.25, ctop, cz1], 6); bunting([1.25, ctop, cz0], [1.25, ctop, cz1], 6);
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10), dark, 0, D - 0.4, -4.05).rotation.x = Math.PI / 2;
