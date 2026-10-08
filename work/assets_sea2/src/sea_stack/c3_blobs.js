//@seed 67
//@ids sea_stack_a:{"H":38,"R":7.2,"lean":0.12,"levels":9,"expect":{"height":38}};sea_stack_b:{"H":52,"R":9.6,"lean":-0.08,"levels":11,"arch":1,"seedAdd":7,"expect":{"height":52}}
  // c3: a cluster of displaced icosahedra stacked along a leaning spine; side lobes make the overhangs and the notch,
  // stack b straddles two legs over a gap so it carries a small sea arch. Banded by world height after the merge.
  const { H, R } = P, parts = [], L = P.levels, dy = H / L;
  const blob = (x, y, z, sx, sy, sz, ry) => { const q = new THREE.IcosahedronGeometry(1, 2); q.scale(sx, sy, sz); q.rotateY(ry); q.translate(x, y, z); parts.push(q); };
  for (let i = 0; i < L; i++) {
    const t = (i + 0.5) / L, yc = t * H, sx0 = P.lean * H * t * t, rad = R * (1 - 0.45 * t) * (i === 0 ? 1.2 : 1);
    if (P.arch && i < 2) {
      // two legs with a gap between them
      blob(sx0 - rad * 0.75, yc, 0, rad * 0.55, dy * 0.75, rad * 0.7, rr(0, 3));
      blob(sx0 + rad * 0.8, yc, 0, rad * 0.5, dy * 0.75, rad * 0.65, rr(0, 3));
      continue;
    }
    const top = i === L - 1;
    blob(sx0 + rr(-0.1, 0.1) * R, yc, rr(-0.1, 0.1) * R, rad * rr(0.85, 1.05), dy * (top ? 0.7 : 0.78), rad * rr(0.65, 0.85), rr(0, 3));
    // side lobes: an overhang high up, a notch where a level has none
    if (i === L - 2) blob(sx0 + rad * 0.55, yc + dy * 0.25, rad * 0.1, rad * 0.7, dy * 0.45, rad * 0.6, rr(0, 3));
    else if (i !== Math.floor(L * 0.6) && rnd() > 0.35) { const a = rr(0, 6.28); blob(sx0 + Math.cos(a) * rad * 0.45, yc + rr(-0.2, 0.2) * dy, Math.sin(a) * rad * 0.35, rad * 0.6, dy * 0.6, rad * 0.55, rr(0, 3)); }
  }
  const geo = merge(parts), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  warp(geo, R * 0.14, 1.1 / R, 3);
  smooth(geo); strata(geo, { period: H / 9, top: H, cap: H * 0.07, ledgeMin: H * 0.3 });
  add(geo, rockMat);
  const pts = []; for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.28 + rr(-0.2, 0.2), d = R * rr(1.05, 1.35); pts.push([Math.cos(a) * d, Math.sin(a) * d * 0.8]); }
  boulders(pts, R * 0.22, R * 0.42);
