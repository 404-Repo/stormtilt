//@seed 131
//@expect {"width":180,"height":45}
  // c1, a polar heightfield: two grassy humps with a saddle, an elliptical rim that drops in steep banded cliffs
  // to a foam-white shore, the outer ring sunk below the waterline
  const NR = 26, NA = 64, AX = 90, AZ = 34, pos = [], idx = [];
  const hump = (x, z) => 30 * Math.exp(-Math.pow((x - 22) / 42, 2)) + 21 * Math.exp(-Math.pow((x + 48) / 30, 2)) + 6 + 3 * fbm(x * 0.03, 0, z * 0.03, 2);
  for (let i = 0; i <= NR; i++) { const r = (i / NR) * 1.06;
    for (let j = 0; j < NA; j++) { const a = (j / NA) * Math.PI * 2, rim = 1 + 0.1 * fbm(Math.cos(a) * 2, Math.sin(a) * 2, 1, 2), rr2 = r / rim;
      const x = Math.cos(a) * AX * r, z = Math.sin(a) * AZ * r;
      const top = hump(x, z) * (1 - 0.35 * rr2 * rr2), cliff = Math.min(1, Math.max(0, (1 - rr2) / 0.1)), cl = cliff * cliff * (3 - 2 * cliff);
      const y = rr2 > 1.0 ? -1.5 : top * cl + 2.2 * (1 - cl); pos.push(x, y, z); } }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + ((j + 1) % NA), c = a + NA, d = b + NA; idx.push(a, b, c, b, d, c); }
  // close the centre
  let geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo = geo.toNonIndexed();
  warp(geo, 2.5, 0.05, 2, (x, y) => (y > 1 ? 1 : 0.3));
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 4.5, top: 100, ledgeMin: 4, foamBelow: 2.6 });
  const land = add(geo, rockMat);
//@include _village.js
