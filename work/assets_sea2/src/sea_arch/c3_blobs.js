//@seed 79
//@expect {"width":45,"height":35}
  // c3: displaced icosahedra strung along the arch's centreline, overlapping heavily, merged, warped and banded
  const C = new THREE.CatmullRomCurve3([[-15, -3], [-14.5, 6], [-13.5, 16], [-10, 24.5], [-4, 28.5], [3, 28.8], [9, 26], [13, 18], [14.5, 8], [15, -3]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const parts = [], n = 15;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), c = C.getPointAt(t), foot = Math.exp(-Math.pow(Math.min(t, 1 - t) / 0.12, 2)), crown = Math.exp(-Math.pow((t - 0.5) / 0.22, 2));
    const q = new THREE.IcosahedronGeometry(1, 2), r = 5.4 + 2.4 * foot + 1.5 * crown;
    q.scale(r * rr(0.95, 1.15), r * rr(0.95, 1.2), (5.5 + 2 * foot) * rr(0.9, 1.1)); q.rotateZ(rr(-0.4, 0.4)); q.translate(c.x + rr(-0.6, 0.6), c.y, rr(-0.8, 0.8)); parts.push(q);
  }
  const geo = merge(parts);
  warp(geo, 2.2, 0.07, 2); warp(geo, 1.4, 0.22, 2, null, 0.2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 3.6, top: 33, cap: 4, ledgeMin: 8, dip: 0.04 });
  add(geo, rockMat);
  boulders([[-20, 3], [-18, -5], [-16, 6.5], [-11, -6], [-10, 6], [-20.5, -1], [19, 5], [20, -2], [17, -6], [10, 6.5], [11, -6], [20.5, 1]], 1.4, 2.8);
