//@seed 71
//@expect {"width":45,"height":35}
  // c1: one thick tube lofted along the arch's centreline with an elliptical section that is fat in the legs and
  // deep at the crown, legs sunk below the waterline and flattened there, then warped and banded like the stacks
  const C = new THREE.CatmullRomCurve3([[-15, -5], [-14.5, 6], [-13.5, 16], [-10, 24.5], [-4, 28.5], [3, 28.8], [9, 26], [13, 18], [14.5, 8], [15, -5]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const NR = 72, NS = 20, pos = [], idx = [];
  for (let i = 0; i <= NR; i++) {
    const t = i / NR, c = C.getPointAt(t), T = C.getTangentAt(t), N = new THREE.Vector3(-T.y, T.x, 0);
    const crown = Math.exp(-Math.pow((t - 0.5) / 0.22, 2)), foot = Math.exp(-Math.pow(Math.min(t, 1 - t) / 0.12, 2));
    const rn = 4.9 + 1.6 * crown + 2.2 * foot + (t < 0.5 ? 0.6 : 0), rz = 5.5 + 0.6 * crown + 2.2 * foot;
    for (let j = 0; j < NS; j++) { const f = (j / NS) * Math.PI * 2; pos.push(c.x + N.x * Math.cos(f) * rn, c.y + N.y * Math.cos(f) * rn, Math.sin(f) * rz); }
  }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const a = i * NS + j, b = i * NS + ((j + 1) % NS), c = a + NS, d = b + NS; idx.push(a, b, c, b, d, c); }
  let geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo = geo.toNonIndexed();
  warp(geo, 2.6, 0.06, 2); warp(geo, 1.6, 0.22, 2, null, 0.2); warp(geo, 0.45, 0.6, 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 3.6, top: 33, cap: 4, ledgeMin: 8, dip: 0.04 });
  add(geo, rockMat);
  boulders([[-21.5, 3], [-18, -7.5], [-15, 8.5], [-9.5, -6.5], [-9, 7], [-22, -2.5], [20.5, 4], [21.5, -2], [17, -8], [10, 7.5], [9.5, -7], [15, 8.5]], 2, 3.4);
