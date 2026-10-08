//@seed 53
//@ids sea_stack_a:{"H":38,"R":7.2,"flat":0.8,"notchA":0.7,"notchY":0.62,"expect":{"height":38}};sea_stack_b:{"H":52,"R":9.6,"flat":0.7,"notchA":2.5,"notchY":0.36,"seedAdd":7,"expect":{"height":52}}
  // c2: stacked irregular extruded slabs (each a 20-point noisy outline whose centre drifts, so overhangs form),
  // overlapped, merged into one mesh, then warped hard and normal-smoothed so no slab edge reads as a box
  const { H, R } = P, parts = []; let y = 0, cx = 0, cz = 0, k = 0;
  while (y < H - 0.5) {
    const h = Math.min(H - y, rr(2.6, 4.6)), t = (y + h / 2) / H;
    let rad = R * (1.05 - 0.45 * t) * (y < H * 0.08 ? 1.25 : 1) * rr(0.9, 1.12);
    if (t > 0.88) rad *= 0.85 - (t - 0.88) * 2.5;
    cx += rr(-0.12, 0.14) * R; cz += rr(-0.1, 0.1) * R; cx *= 0.8; cz *= 0.8;
    const s = new THREE.Shape(), N = 20, ph = rr(0, 6.28);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      let r = rad * (0.85 + 0.3 * (0.5 + 0.5 * fbm(Math.cos(a) * 1.3 + k, Math.sin(a) * 1.3, ph, 2)));
      const da = Math.atan2(Math.sin(a - P.notchA), Math.cos(a - P.notchA));
      r *= 1 - 0.5 * Math.exp(-Math.pow(da / 0.6, 2)) * Math.exp(-Math.pow((t - P.notchY) / 0.06, 2));
      const px = Math.cos(a) * r, pz = Math.sin(a) * r * P.flat;
      i ? s.lineTo(px, pz) : s.moveTo(px, pz);
    }
    const geo = new THREE.ExtrudeGeometry(s, { depth: h + 0.7, steps: 3, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2); geo.translate(cx, y - 0.35, -cz); parts.push(geo); y += h; k++;
  }
  const geo = merge(parts), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  warp(geo, R * 0.2, 0.8 / R, 3, (x, y) => (y < 0.1 ? 0.3 : 1));
  smooth(geo); strata(geo, { period: H / 9, top: H, cap: H * 0.06, ledgeMin: H * 0.3 });
  add(geo, rockMat);
  const pts = []; for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.28 + rr(-0.2, 0.2), d = R * rr(1.1, 1.4); pts.push([Math.cos(a) * d, Math.sin(a) * d * P.flat]); }
  boulders(pts, R * 0.22, R * 0.42);
