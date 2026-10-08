//@seed 103
//@expect {"width":7,"height":5}
//@include _shape.js
  // c2, sections: each fluke a lofted lens-section surface between leading and trailing edge, thick at the root and
  // thin at the tip, tips curled back; the stock an elliptical loft that flares into the root. Patches as vertex colour.
  const slateC = new THREE.Color(0x3b5370), whiteC = new THREE.Color(0xf3eee3), skin = M(0xffffff, { vertexColors: true, roughness: 0.35 });
  const build = (pos, col, nx, nv, wrapV) => { const idx = []; for (let i = 0; i < nx; i++) for (let j = 0; j < (wrapV ? nv : nv - 1); j++) { const a = i * nv + j, b = i * nv + ((j + 1) % nv), c = a + nv, d = b + nv; idx.push(a, c, b, b, c, d); }
    const q = new THREE.BufferGeometry(); q.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); q.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); q.setIndex(idx); q.computeVertexNormals(); return q; };
  const NX = 18, NV = 14;
  for (const sx of [-1, 1]) {
    const pos = [], col = [], c = new THREE.Color();
    for (let i = 0; i <= NX; i++) { const x = 0.25 + (S - 0.25) * Math.pow(i / NX, 0.9), y0 = le(x), y1 = te(x), th = 0.32 * (1 - x / S) + 0.05;
      for (let j = 0; j < NV; j++) { const a = (j / NV) * Math.PI * 2, y = y0 + (y1 - y0) * (0.5 - 0.5 * Math.cos(a)), z = Math.sin(a) * th * Math.pow(Math.sin(Math.PI * (0.5 - 0.5 * Math.cos(a))), 0.5) + curl(x);
        const px = sx * x * (i === NX ? 0.995 : 1); pos.push(px, y, z);
        c.copy(slateC); if (Math.sin(a) > 0.1 && x > 0.7 && fbm(px * 1.4, y * 1.4, 3, 2) > 0.02) c.copy(whiteC); col.push(c.r, c.g, c.b); } }
    // collapse the tip ring so the fluke closes
    const last = NX * NV; let cx = 0, cy = 0, cz = 0; for (let j = 0; j < NV; j++) { cx += pos[(last + j) * 3]; cy += pos[(last + j) * 3 + 1]; cz += pos[(last + j) * 3 + 2]; }
    for (let j = 0; j < NV; j++) { pos[(last + j) * 3] = cx / NV; pos[(last + j) * 3 + 1] = cy / NV; pos[(last + j) * 3 + 2] = cz / NV; }
    add(build(pos, col, NX, NV, true), skin);
  }
  const pos = [], col = [], NY = 14, NA = 16;
  for (let i = 0; i <= NY; i++) { const t = i / NY, y = t * 4.35, rx = 0.55 - 0.2 * t + 0.35 * Math.pow(Math.max(0, (t - 0.65) / 0.35), 2), rz = 0.48 - 0.22 * t;
    for (let j = 0; j < NA; j++) { const a = (j / NA) * Math.PI * 2; pos.push(Math.cos(a) * rx, y, Math.sin(a) * rz); col.push(slateC.r, slateC.g, slateC.b); } }
  add(build(pos, col, NY, NA, true), skin);
  const cap = add(new THREE.SphereGeometry(0.4, 10, 6), slate, 0, 4.25, 0); cap.scale.set(1.3, 0.5, 0.45);
