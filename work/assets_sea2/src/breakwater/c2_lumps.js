//@seed 113
//@expect {"width":40,"depth":6.2,"height":9.8}
//@include _common.js
  // c2, a different reading: rubble-mound stones. Each stone an icosahedron stretched to its slot and noise-warped,
  // so the wall reads as big rounded boulders
  const lists = SC.map(() => []);
  layout.forEach(([x, y, z, sx, sy, sz], i) => { const q = new THREE.IcosahedronGeometry(0.5, 1); q.scale(sx * 1.05, sy * 1.05, sz * 1.02); q.translate(x, y, z); warp(q, 0.18, 0.9, 2); lists[Math.floor(hash3(i, 2, 9) * 6)].push(q); });
  lists.forEach((l, k) => { if (l.length) { const q = smooth(merge(l)); add(q, SC[k]); } });
