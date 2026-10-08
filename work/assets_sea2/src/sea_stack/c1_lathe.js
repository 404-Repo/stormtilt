//@seed 41
//@ids sea_stack_a:{"H":38,"R":7.2,"flat":0.78,"lean":0.10,"notchA":0.7,"notchY":0.6,"overY":0.84,"waist":0.62,"expect":{"height":38}};sea_stack_b:{"H":52,"R":9.0,"flat":0.72,"lean":-0.06,"notchA":2.5,"notchY":0.4,"overY":0.8,"waist":0.55,"seedAdd":7,"twin":[0.62,0.6,0.85],"expect":{"height":52}}
  // c1: lathe profile (flared foot, waist, rounded crown), made elliptical and leaning, a deep notch and a one-sided
  // overhang shelf carved in polar space, then world-space noise: big bends, vertical fluting, fine lumps.
  // Stack b fuses a shorter shoulder pillar to one side for a stepped silhouette.
  const pillar = (H, R, ox, oz, nA, nY, oY, waist, lean, segs, rows) => {
    const prof = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      let r = R * (1 - 0.4 * t) + R * 0.3 * Math.pow(Math.max(0, 1 - t / 0.12), 2) - R * 0.14 * Math.exp(-Math.pow((t - waist) / 0.1, 2));
      if (t > 0.95) r *= Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.95) / 0.055, 2)));
      prof.push(new THREE.Vector2(Math.max(r, 0.01), t * H));
    }
    prof.push(new THREE.Vector2(0, H * 1.005));
    const geo = new THREE.LatheGeometry(prof, segs).toNonIndexed(), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const t = y / H;
      let a = Math.atan2(z, x), r = Math.hypot(x, z);
      let da = Math.atan2(Math.sin(a - nA), Math.cos(a - nA));
      r *= 1 - 0.8 * Math.exp(-Math.pow(da / 0.8, 2)) * Math.exp(-Math.pow((t - nY) / 0.06, 2));       // the notch
      da = Math.atan2(Math.sin(a - nA - 2.8), Math.cos(a - nA - 2.8));
      r *= 1 - 0.35 * Math.exp(-Math.pow(da / 0.5, 2)) * Math.exp(-Math.pow((t - nY + 0.22) / 0.06, 2)); // back scallop
      da = Math.atan2(Math.sin(a - nA - 1.2), Math.cos(a - nA - 1.2));
      r *= 1 + 0.75 * Math.exp(-Math.pow(da / 0.9, 2)) * Math.exp(-Math.pow((t - oY) / 0.055, 2));      // overhang shelf
      x = Math.cos(a) * r + lean * H * t * t + ox; z = Math.sin(a) * r * P.flat + oz;
      p.setXYZ(i, x, y, z);
    }
    return geo;
  };
  const { H, R } = P, list = [pillar(H, R, 0, 0, P.notchA, P.notchY, P.overY, P.waist, P.lean, 30, 50)];
  if (P.twin) list.push(pillar(H * P.twin[0], R * P.twin[1], R * P.twin[2], -R * 0.15, P.notchA + 2, 0.5, 0.75, 0.5, 0.05, 22, 30));
  const geo = merge(list);
  warp(geo, R * 0.28, 0.35 / R, 2, (x, y) => (y < 0.2 ? 0 : Math.min(1, y / (H * 0.15))));
  warp(geo, R * 0.2, 1.6 / R, 2, (x, y) => (y < 0.2 ? 0 : 1), 0.18);
  warp(geo, R * 0.05, 4 / R, 2, (x, y) => (y < 0.2 ? 0 : 1));
  smooth(geo); strata(geo, { period: H / 10, top: H, cap: H * 0.1, ledgeMin: H * 0.25 });
  add(geo, rockMat);
  const pts = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28 + rr(-0.2, 0.2), d = R * rr(1.05, 1.35); pts.push([Math.cos(a) * d + (P.twin && Math.cos(a) > 0 ? R * 0.5 : 0), Math.sin(a) * d * P.flat]); }
  boulders(pts, R * 0.22, R * 0.42);
