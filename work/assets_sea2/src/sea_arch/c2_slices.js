//@seed 73
//@expect {"width":45,"height":35}
  // c2: the arch's front silhouette drawn as a lumpy outline and extruded, three slices of slightly different outline
  // stacked front to back so the faces step like eroded strata, merged, warped and banded
  const outline = (sc, seed) => {
    const s = new THREE.Shape(), pts = [], wob = (x, y, a) => a * fbm(x * 0.12 + seed, y * 0.12, seed, 2);
    // outer: up the left leg, over the top, down the right leg
    for (let i = 0; i <= 26; i++) { const t = i / 26, a = Math.PI * (1 - t);
      const x = Math.cos(a) * 20 * sc, y = Math.pow(Math.max(0, Math.sin(a)), 0.45) * 34 * sc; pts.push([x + wob(x, y, 2.2), y + (y > 1 ? wob(y, x, 1.6) : 0)]); }
    // inner opening: back up the right inner face and down the left
    for (let i = 0; i <= 22; i++) { const t = i / 22, a = Math.PI * t;
      const x = Math.cos(a) * 9.5 * sc, y = Math.pow(Math.max(0, Math.sin(a)), 0.7) * 21 * sc; pts.push([x + wob(x, y + 5, 1.4), y + (y > 1 ? wob(y + 3, x, 1.0) : 0)]); }
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, Math.max(0, y)) : s.moveTo(x, Math.max(0, y)))); return s;
  };
  const parts = [[0.95, -6.5, 4.5, 1], [1.0, -2.2, 4.6, 2], [0.93, 2.2, 4.4, 3]].map(([sc, z0, d, sd]) => {
    const q = new THREE.ExtrudeGeometry(outline(sc, sd), { depth: d, steps: 3, bevelEnabled: false, curveSegments: 1 }); q.translate(0, 0, z0); return q; });
  const geo = merge(parts);
  warp(geo, 2.4, 0.06, 2, (x, y) => (y < 0.05 ? 0.2 : 1)); warp(geo, 1.4, 0.22, 2, (x, y) => (y < 0.05 ? 0.2 : 1), 0.2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  geo.computeVertexNormals(); strata(geo, { period: 3.6, top: 33, cap: 4, ledgeMin: 8, dip: 0.04 });
  add(geo, rockMat);
  boulders([[-20, 3], [-18, -6], [-16, 7], [-11, -7], [-10, 7], [-21, -1], [19, 6], [20, -2], [17, -7], [10, 7], [11, -7], [21, 1]], 1.4, 2.8);
