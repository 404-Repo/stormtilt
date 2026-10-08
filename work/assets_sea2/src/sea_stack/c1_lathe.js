//@seed 41
//@ids sea_stack_a:{"H":38,"R":7.2,"flat":0.78,"lean":0.10,"notchA":0.7,"notchY":0.62,"overY":0.86,"waist":0.62,"expect":{"height":38}};sea_stack_b:{"H":52,"R":9.6,"flat":0.68,"lean":-0.07,"notchA":2.5,"notchY":0.36,"overY":0.8,"waist":0.55,"seedAdd":7,"deep":1,"expect":{"height":52}}
  // c1: one lathe profile (flared foot, waist, bulging overhang, rounded crown), made elliptical and leaning,
  // a notch carved in polar space, then a world-space noise warp so nothing reads as turned
  const { H, R } = P, rows = 46, prof = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    let r = R * (1 - 0.42 * t) + R * 0.32 * Math.pow(Math.max(0, 1 - t / 0.12), 2)
      - R * 0.2 * Math.exp(-Math.pow((t - P.waist) / 0.09, 2)) + R * 0.3 * Math.exp(-Math.pow((t - P.overY) / 0.05, 2));
    if (t > 0.93) r *= Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.93) / 0.075, 2)));
    prof.push(new THREE.Vector2(Math.max(r, 0.01), t * H));
  }
  prof.push(new THREE.Vector2(0, H * 1.005));
  const geo = new THREE.LatheGeometry(prof, 26).toNonIndexed();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const t = y / H;
    let a = Math.atan2(z, x), r = Math.hypot(x, z);
    // the notch: a bite out of one side, deep enough to read in silhouette
    let da = Math.atan2(Math.sin(a - P.notchA), Math.cos(a - P.notchA));
    const nb = Math.exp(-Math.pow(da / 0.55, 2)) * Math.exp(-Math.pow((t - P.notchY) / 0.05, 2));
    r *= 1 - (0.55 + 0.15 * (P.deep || 0)) * nb;
    // a second shallower scallop on the opposite side so the back is not plain
    da = Math.atan2(Math.sin(a - P.notchA - 2.8), Math.cos(a - P.notchA - 2.8));
    r *= 1 - 0.3 * Math.exp(-Math.pow(da / 0.5, 2)) * Math.exp(-Math.pow((t - P.notchY + 0.22) / 0.06, 2));
    x = Math.cos(a) * r; z = Math.sin(a) * r * P.flat;
    x += P.lean * H * t * t;
    p.setXYZ(i, x, y, z);
  }
  warp(geo, R * 0.16, 0.9 / R, 3, (x, y) => (y < 0.2 ? 0 : 1));
  warp(geo, R * 0.05, 3.5 / R, 2, (x, y) => (y < 0.2 ? 0 : 1));
  smooth(geo); strata(geo, { period: H / 9, top: H, cap: H * 0.07, ledgeMin: H * 0.3 });
  add(geo, rockMat);
  const pts = []; for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.28 + rr(-0.2, 0.2), d = R * rr(1.05, 1.35); pts.push([Math.cos(a) * d, Math.sin(a) * d * P.flat]); }
  boulders(pts, R * 0.22, R * 0.42);
