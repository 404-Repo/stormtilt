// breakwater, c2_lumps. Built by the 404 method (reference image, three strategies, verify, pick by eye).
export default function (THREE) {
  const g = new THREE.Group();
  const P = {};
  // ---- shared helpers (inlined; seeded so the asset is identical on every load) ----
  let SEED = 113; const NSEED = (SEED % 89) + 0.37;
  const rnd = () => ((SEED = (SEED * 16807) % 2147483647) / 2147483647);
  const rr = (a, b) => a + (b - a) * rnd();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.42 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const hash3 = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + NSEED * 13.1) * 43758.5453; return h - Math.floor(h); };
  const vnoise = (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), s = (t) => t * t * (3 - 2 * t);
    const u = s(x - xi), v = s(y - yi), w = s(z - zi), L = (a, b, t) => a + (b - a) * t, h = hash3;
    return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), u), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
      L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w) * 2 - 1;
  };
  const fbm = (x, y, z, o = 3) => { let a = 0, f = 1, amp = 0.5, n = 0; for (let i = 0; i < o; i++) { a += vnoise(x * f, y * f, z * f) * amp; n += amp; f *= 2.03; amp *= 0.5; } return a / n; };
  // world-space vector warp: one position always gets one offset, so seams and shared rims never crack
  const warp = (geo, amp, freq, o = 3, mask, ys = 1) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = mask ? mask(x, y, z) : 1, fy = freq * ys; if (!k) continue;
      p.setXYZ(i, x + fbm(x * freq, y * fy, z * freq, o) * amp * k, y + fbm(x * freq + 31.7, y * fy + 11.3, z * freq + 5.1, o) * amp * k * (ys < 1 ? 0.35 : 1),
        z + fbm(x * freq + 17.9, y * fy + 43.1, z * freq + 23.3, o) * amp * k);
    }
    p.needsUpdate = true; return geo;
  };
  // smooth normals across duplicated vertices (lathe seams, extrude rims, merged parts)
  const smooth = (geo) => {
    geo.computeVertexNormals();
    const p = geo.attributes.position, n = geo.attributes.normal, map = new Map();
    const key = (i) => `${Math.round(p.getX(i) * 100)},${Math.round(p.getY(i) * 100)},${Math.round(p.getZ(i) * 100)}`;
    for (let i = 0; i < p.count; i++) { const k = key(i); let a = map.get(k); if (!a) { a = [0, 0, 0]; map.set(k, a); } a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); }
    for (let i = 0; i < p.count; i++) { const a = map.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    n.needsUpdate = true; return geo;
  };
  // merge already-transformed geometries into one position-only, non-indexed geometry
  const merge = (list) => {
    const arrs = list.map((q) => (q.index ? q.toNonIndexed() : q).attributes.position.array);
    const out = new Float32Array(arrs.reduce((s, a) => s + a.length, 0)); let o = 0;
    arrs.forEach((a) => { out.set(a, o); o += a.length; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(out, 3)); return geo;
  };
  // soft horizontal strata as vertex colour (ochre, rust, violet-grey, sand), blended band to band, with grass on
  // up-facing surfaces near the top and on ledges. Adjacent bands never repeat a colour; no checkerboard.
  const ROCK = [0xd39a50, 0xb35e3d, 0x7d7192, 0xe0b26e, 0xa8573c, 0x8e819b, 0xc88446].map((c) => new THREE.Color(c));
  const GRASS = [new THREE.Color(0x5a9632), new THREE.Color(0x86ba48)];
  const strata = (geo, o = {}) => {
    const period = o.period || 4, top = o.top ?? 1e9, cap = o.cap ?? 3, p = geo.attributes.position, n = geo.attributes.normal;
    const col = new Float32Array(p.count * 3), c = new THREE.Color(), q = new THREE.Color();
    const idx = (b) => (((b * 5 + (hash3(b, 1, 2) > 0.5 ? 1 : 0)) % 7) + 7) % 7;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const yy = y + fbm(x * 0.06, y * 0.03, z * 0.06) * period * 0.55 + (o.dip || 0) * x, b = Math.floor(yy / period), f = yy / period - b;
      const t = Math.min(1, Math.max(0, (f - 0.6) / 0.4)); c.copy(ROCK[idx(b)]).lerp(ROCK[idx(b + 1)], t * t * (3 - 2 * t));
      c.multiplyScalar(0.9 + 0.14 * fbm(x * 0.4 + 9, y * 0.4, z * 0.4, 2));
      const ny = n ? n.getY(i) : 0;
      if (o.grass !== false && ny > 0.42 && (y > top - cap || (ny > 0.7 && y > (o.ledgeMin ?? 3) && fbm(x * 0.25, y * 0.25, z * 0.25, 2) > -0.15))) {
        q.copy(GRASS[0]).lerp(GRASS[1], 0.5 + 0.5 * fbm(x * 0.3, y * 0.3 + 4, z * 0.3, 2)); c.copy(q);
      }
      if (o.foamBelow && y < o.foamBelow) c.lerp(new THREE.Color(0xf2efe2), 0.85);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return geo;
  };
  const rockMat = M(0xffffff, { vertexColors: true, roughness: 0.5 }); rockMat.name = 'stone';
  const foamMat = M(0xf2efe2, { roughness: 0.45 }); foamMat.name = 'stone';
  // white foam-coloured boulders around a footprint: centres (x, z) and radius r of the ring
  const boulders = (pts, s0, s1) => {
    const list = pts.map(([x, z]) => { const geo = new THREE.IcosahedronGeometry(1, 1), s = rr(s0, s1);
      geo.scale(s * rr(0.9, 1.3), s * rr(0.6, 0.85), s * rr(0.9, 1.2)); geo.rotateY(rr(0, 6.28)); geo.translate(x, s * 0.35, z); return geo; });
    const geo = warp(merge(list), s0 * 0.25, 0.5, 2); smooth(geo); return add(geo, foamMat);
  };
  // ---- shared: stone layout (running bond, varied, never a grid), core, light tower, lamp post ----
  const SC = [0x9c968a, 0xb6ac98, 0xc99a4f, 0xbf6e44, 0x857d72, 0xd4b47c].map((c) => { const m = M(c, { roughness: 0.42 }); m.name = 'stone'; return m; });
  const layout = []; // [cx, cy, cz, sx, sy, sz]
  const course = (y0, h, zc, d, jitter) => { let x = -20 + rr(0, 1.2) * jitter;
    if (x > -20) layout.push([(-20 + x) / 2, y0 + h / 2, zc, x + 20, h * rr(0.85, 1), d]);
    while (x < 20) { const L = Math.min(20 - x, rr(1.7, 3.3)); if (L < 0.6) { layout[layout.length - 1][3] += L; break; }
      layout.push([x + L / 2, y0 + h / 2 + rr(-0.08, 0.08), zc + rr(-0.12, 0.12), L, h * rr(0.86, 1.04), d * rr(0.9, 1.05)]); x += L; } };
  for (const zs of [-1, 1]) { course(0, 1.5, zs * 2.0, 2.2, 1); course(1.42, 1.45, zs * 2.05, 2.1, 1.6); }
  { let x = -20; while (x < 20) { const L = Math.min(20 - x, rr(1.4, 2.6)); layout.push([x + L / 2, 2.8 + 0.6, rr(-0.15, 0.15), L, 1.2 * rr(0.92, 1.05), 6.0 * rr(0.94, 1)]); x += L; } }
  add(new THREE.BoxGeometry(39, 2.8, 2.2), SC[4], 0, 1.4, 0);   // hidden core so nothing reads as see-through
  // light tower at +x end
  const red = M(0xd7372f, { roughness: 0.3 }), white = M(0xf3eee3, { roughness: 0.3 }), iron = M(0x3a3d40, { roughness: 0.35, metalness: 0.6 }), lamp = M(0xffb347, { emissive: 0xffb347, emissiveIntensity: 1.2 });
  const T = new THREE.Group(); T.position.set(17.6, 3.95, 0); g.add(T);
  add(new THREE.CylinderGeometry(1.3, 1.45, 0.5, 16), white, 0, 0.25, 0, T);
  for (let i = 0; i < 5; i++) { const r0 = 1.05 - i * 0.07, r1 = 1.05 - (i + 1) * 0.07; add(new THREE.CylinderGeometry(r1, r0, 0.7, 16), i % 2 ? white : red, 0, 0.5 + 0.35 + i * 0.7, 0, T); }
  add(new THREE.CylinderGeometry(1.05, 0.75, 0.22, 16), red, 0, 4.11, 0, T);
  add(new THREE.TorusGeometry(0.98, 0.04, 4, 20), iron, 0, 4.55, 0, T).rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; add(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 4), iron, Math.cos(a) * 0.98, 4.33, Math.sin(a) * 0.98, T); }
  add(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 12), lamp, 0, 4.62, 0, T);
  add(new THREE.ConeGeometry(0.72, 0.65, 12), red, 0, 5.35, 0, T);
  add(new THREE.SphereGeometry(0.13, 8, 6), red, 0, 5.72, 0, T);
  // lamp post
  const P2 = new THREE.Group(); P2.position.set(12.5, 4.0, 1.9); g.add(P2);
  add(new THREE.CylinderGeometry(0.2, 0.26, 0.4, 8), iron, 0, 0.2, 0, P2);
  add(new THREE.CylinderGeometry(0.07, 0.1, 3.4, 8), iron, 0, 1.9, 0, P2);
  const arm = add(new THREE.TorusGeometry(0.35, 0.05, 4, 8, Math.PI), iron, 0.35, 3.6, 0, P2);
  add(new THREE.ConeGeometry(0.3, 0.3, 8), iron, 0.7, 3.45, 0, P2);
  add(new THREE.SphereGeometry(0.17, 8, 6), lamp, 0.7, 3.27, 0, P2);
  // bollards on the walkway
  for (const bx of [-15, -6, 3]) { add(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 8), iron, bx, 4.3, -2.3); add(new THREE.SphereGeometry(0.27, 8, 4, 0, 6.29, 0, 1.6), iron, bx, 4.6, -2.3); }

  // c2, a different reading: rubble-mound stones. Each stone an icosahedron stretched to its slot and noise-warped,
  // so the wall reads as big rounded boulders
  const lists = SC.map(() => []);
  layout.forEach(([x, y, z, sx, sy, sz], i) => { const q = new THREE.IcosahedronGeometry(0.5, 1); q.scale(sx * 1.05, sy * 1.05, sz * 1.02); q.translate(x, y, z); warp(q, 0.18, 0.9, 2); lists[Math.floor(hash3(i, 2, 9) * 6)].push(q); });
  lists.forEach((l, k) => { if (l.length) { const q = smooth(merge(l)); add(q, SC[k]); } });

  // placement: base at y = 0, centred on x and z (vertex-measured, per the asset contract)
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const ctr = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= ctr.x; o.position.y -= box.min.y; o.position.z -= ctr.z; });
  return g;
}
