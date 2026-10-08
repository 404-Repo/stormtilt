  // ---- shared: stone layout (running bond, varied, never a grid), core, light tower, lamp post ----
  const SC = [0x9c968a, 0xb6ac98, 0xc99a4f, 0xbf6e44, 0x857d72, 0xd4b47c].map((c) => { const m = M(c, { roughness: 0.42 }); m.name = 'stone'; return m; });
  const layout = []; // [cx, cy, cz, sx, sy, sz]
  const course = (y0, h, zc, d, jitter) => { let x = -20 + rr(0, 1.2) * jitter;
    if (x > -20) layout.push([(-20 + x) / 2, y0 + h / 2, zc, x + 20, h * rr(0.85, 1), d]);
    while (x < 20) { const L = Math.min(20 - x, rr(1.7, 3.3)); if (L < 0.6) { layout[layout.length - 1][3] += L; break; }
      layout.push([x + L / 2, y0 + h / 2 + rr(-0.08, 0.08), zc + rr(-0.12, 0.12), L, h * rr(0.86, 1.04), d * rr(0.9, 1.05)]); x += L; } };
  for (const zs of [-1, 1]) { course(0, 1.5, zs * 2.0, 2.2, 1); course(1.42, 1.45, zs * 2.05, 2.1, 1.6); }
  { let x = -20; while (x < 20) { const L = Math.min(20 - x, rr(1.4, 2.6)); layout.push([x + L / 2, 2.8 + 0.6, rr(-0.15, 0.15), L, 1.2 * rr(0.92, 1.05), 6.0 * rr(0.94, 1)]); x += L; } }
  add(new THREE.BoxGeometry(39, 2.8, 2.2), SC[4], 0, 1.4, 0);   // hidden core so nothing reads as see-through
  // light tower at +x end
  const red = M(0xd7372f, { roughness: 0.3 }), white = M(0xf3eee3, { roughness: 0.3 }), iron = M(0x3a3d40, { roughness: 0.35, metalness: 0.6 }), lamp = M(0xffb347, { emissive: 0xffb347, emissiveIntensity: 1.2 });
  const T = new THREE.Group(); T.position.set(17.6, 3.95, 0); g.add(T);
  add(new THREE.CylinderGeometry(1.3, 1.45, 0.5, 16), white, 0, 0.25, 0, T);
  for (let i = 0; i < 5; i++) { const r0 = 1.05 - i * 0.07, r1 = 1.05 - (i + 1) * 0.07; add(new THREE.CylinderGeometry(r1, r0, 0.7, 16), i % 2 ? white : red, 0, 0.5 + 0.35 + i * 0.7, 0, T); }
  add(new THREE.CylinderGeometry(1.05, 0.75, 0.22, 16), red, 0, 4.11, 0, T);
  add(new THREE.TorusGeometry(0.98, 0.04, 4, 20), iron, 0, 4.55, 0, T).rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; add(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 4), iron, Math.cos(a) * 0.98, 4.33, Math.sin(a) * 0.98, T); }
  add(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 12), lamp, 0, 4.62, 0, T);
  add(new THREE.ConeGeometry(0.72, 0.65, 12), red, 0, 5.35, 0, T);
  add(new THREE.SphereGeometry(0.13, 8, 6), red, 0, 5.72, 0, T);
  // lamp post
  const P2 = new THREE.Group(); P2.position.set(12.5, 4.0, 1.9); g.add(P2);
  add(new THREE.CylinderGeometry(0.2, 0.26, 0.4, 8), iron, 0, 0.2, 0, P2);
  add(new THREE.CylinderGeometry(0.07, 0.1, 3.4, 8), iron, 0, 1.9, 0, P2);
  const arm = add(new THREE.TorusGeometry(0.35, 0.05, 4, 8, Math.PI), iron, 0.35, 3.6, 0, P2);
  add(new THREE.ConeGeometry(0.3, 0.3, 8), iron, 0.7, 3.45, 0, P2);
  add(new THREE.SphereGeometry(0.17, 8, 6), lamp, 0.7, 3.27, 0, P2);
  // bollards on the walkway
  for (const bx of [-15, -6, 3]) { add(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8), iron, bx, 4.3, -2.3); add(new THREE.SphereGeometry(0.27, 8, 4, 0, 6.29, 0, 1.6), iron, bx, 4.6, -2.3); }
