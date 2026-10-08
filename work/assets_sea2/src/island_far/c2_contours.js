//@seed 137
//@expect {"width":180,"height":45}
  // c2, profiles: a contour model. Noisy elliptical planforms extruded as layers that shrink and drift toward the
  // two summits, merged, warped and normal-smoothed so the terraces soften into slopes; cliffs from the lowest layers
  const parts = [], LAY = 9;
  for (let k = 0; k < LAY; k++) { const t = k / LAY, y0 = k === 0 ? 0 : 3 + k * 3.4, h = k === 0 ? 3.4 : 3.8, s = new THREE.Shape(), N = 40;
    const ax = 88 * (1 - 0.55 * t * t) * (k === 0 ? 1.04 : 1), az = 33 * (1 - 0.6 * t * t), ox = 10 * t;
    for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2, x = Math.cos(a), z = Math.sin(a);
      // pinch the waist between the two humps as the layers rise
      const pinch = 1 - 0.55 * t * Math.exp(-Math.pow((x * ax + 15) / 18, 2)) * Math.abs(Math.sin(a)) * 0 - 0.4 * t * Math.exp(-Math.pow((x * ax + 15) / 16, 2));
      const r = (0.9 + 0.12 * fbm(x * 2 + k * 0.3, z * 2, 1, 2)) * pinch; const px = x * ax * r + ox, pz = z * az * r; i ? s.lineTo(px, pz) : s.moveTo(px, pz); }
    const q = new THREE.ExtrudeGeometry(s, { depth: h, steps: 1, bevelEnabled: false, curveSegments: 1 }); q.rotateX(-Math.PI / 2); q.translate(0, y0, 0); parts.push(q); }
  const geo = merge(parts);
  warp(geo, 3.5, 0.04, 2); warp(geo, 1.5, 0.12, 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 4.5, top: 100, ledgeMin: 4, foamBelow: 2.6 });
  const land = add(geo, rockMat);
//@include _village.js
