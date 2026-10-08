//@seed 139
//@expect {"width":180,"height":45}
  // c3, displaced ellipsoids: five flattened icospheres along the long axis (two summits, shoulders), merged and warped,
  // cut flat at the waterline; steep sides take the strata, gentle tops the grass
  const parts = [];
  [[-50, 0, 34, 24, 28], [-20, 2, 34, 18, 30], [18, 0, 40, 34, 32], [52, -3, 36, 20, 28], [-72, 4, 20, 12, 20]].forEach(([x, z, rx, ry, rz]) => {
    const q = new THREE.IcosahedronGeometry(1, 3); q.scale(rx, ry, rz); q.translate(x, -1, z); parts.push(q); });
  const geo = merge(parts);
  warp(geo, 4, 0.035, 2); warp(geo, 1.5, 0.1, 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 4.5, top: 1000, cap: 2000, foamBelow: 2.6 });   // all up-facing ground is grass, steep faces are banded cliff
  const land = add(geo, rockMat);
//@include _village.js
