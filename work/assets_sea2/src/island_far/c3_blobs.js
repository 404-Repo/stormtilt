//@seed 139
//@expect {"width":180,"height":45}
  // c3, displaced ellipsoids: five flattened icospheres along the long axis (two summits, shoulders), merged and warped,
  // cut flat at the waterline; steep sides take the strata, gentle tops the grass
  const parts = [];
  [[-55, 0, 32, 22, 26], [-25, 2, 30, 15, 28], [18, 0, 42, 32, 30], [55, -3, 32, 18, 26], [-75, 4, 16, 9, 16]].forEach(([x, z, rx, ry, rz]) => {
    const q = new THREE.IcosahedronGeometry(1, 3); q.scale(rx, ry, rz); q.translate(x, -1, z); parts.push(q); });
  const geo = merge(parts);
  warp(geo, 4, 0.035, 2); warp(geo, 1.5, 0.1, 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 4.5, top: 100, ledgeMin: 4, foamBelow: 2.6 });
  const land = add(geo, rockMat);
//@include _village.js
