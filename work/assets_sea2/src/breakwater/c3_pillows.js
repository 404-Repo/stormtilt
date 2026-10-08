//@seed 117
//@expect {"width":40,"depth":6.2,"height":9.8}
//@include _common.js
  // c3, primitives reshaped: each stone a low-poly sphere pushed toward a superellipsoid (a soft pillow block),
  // closest to the glossy hand-painted blocks of the reference
  const pillow = (sx, sy, sz) => { const q = new THREE.SphereGeometry(1, 10, 7), p = q.attributes.position, e = 0.35;
    for (let i = 0; i < p.count; i++) { const f = (c) => Math.sign(c) * Math.pow(Math.abs(c), e); p.setXYZ(i, f(p.getX(i)) * sx / 2, f(p.getY(i)) * sy / 2, f(p.getZ(i)) * sz / 2); }
    q.computeVertexNormals(); return q; };
  layout.forEach(([x, y, z, sx, sy, sz], i) => { const m = add(pillow(sx * 0.98, sy * 0.98, sz), SC[Math.floor(hash3(i, 2, 9) * 6)], x, y, z); m.rotation.set(rr(-0.03, 0.03), rr(-0.04, 0.04), rr(-0.05, 0.05)); });
