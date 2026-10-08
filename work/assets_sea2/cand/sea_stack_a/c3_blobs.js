// sea_stack_a, c3_blobs. Built by the 404 method (reference image, three strategies, verify, pick by eye).
export default function (THREE) {
  const g = new THREE.Group();
  const P = {"H":38,"R":7.2,"lean":0.12,"levels":9,"expect":{"height":38}};
  // ---- shared helpers (inlined; seeded so the asset is identical on every load) ----
  let SEED = 67; const NSEED = (SEED % 89) + 0.37;
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
  const warp = (geo, amp, freq, o = 3, mask) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = mask ? mask(x, y, z) : 1; if (!k) continue;
      p.setXYZ(i, x + fbm(x * freq, y * freq, z * freq, o) * amp * k, y + fbm(x * freq + 31.7, y * freq + 11.3, z * freq + 5.1, o) * amp * k,
        z + fbm(x * freq + 17.9, y * freq + 43.1, z * freq + 23.3, o) * amp * k);
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
  // c3: a cluster of displaced icosahedra stacked along a leaning spine; side lobes make the overhangs and the notch,
  // stack b straddles two legs over a gap so it carries a small sea arch. Banded by world height after the merge.
  const { H, R } = P, parts = [], L = P.levels, dy = H / L;
  const blob = (x, y, z, sx, sy, sz, ry) => { const q = new THREE.IcosahedronGeometry(1, 2); q.scale(sx, sy, sz); q.rotateY(ry); q.translate(x, y, z); parts.push(q); };
  for (let i = 0; i < L; i++) {
    const t = (i + 0.5) / L, yc = t * H, sx0 = P.lean * H * t * t, rad = R * (1 - 0.45 * t) * (i === 0 ? 1.2 : 1);
    if (P.arch && i < 2) {
      // two legs with a gap between them
      blob(sx0 - rad * 0.75, yc, 0, rad * 0.55, dy * 0.75, rad * 0.7, rr(0, 3));
      blob(sx0 + rad * 0.8, yc, 0, rad * 0.5, dy * 0.75, rad * 0.65, rr(0, 3));
      continue;
    }
    const top = i === L - 1;
    blob(sx0 + rr(-0.1, 0.1) * R, yc, rr(-0.1, 0.1) * R, rad * rr(0.85, 1.05), dy * (top ? 0.7 : 0.78), rad * rr(0.65, 0.85), rr(0, 3));
    // side lobes: an overhang high up, a notch where a level has none
    if (i === L - 2) blob(sx0 + rad * 0.55, yc + dy * 0.25, rad * 0.1, rad * 0.7, dy * 0.45, rad * 0.6, rr(0, 3));
    else if (i !== Math.floor(L * 0.6) && rnd() > 0.35) { const a = rr(0, 6.28); blob(sx0 + Math.cos(a) * rad * 0.45, yc + rr(-0.2, 0.2) * dy, Math.sin(a) * rad * 0.35, rad * 0.6, dy * 0.6, rad * 0.55, rr(0, 3)); }
  }
  const geo = merge(parts), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  warp(geo, R * 0.14, 1.1 / R, 3);
  smooth(geo); strata(geo, { period: H / 9, top: H, cap: H * 0.07, ledgeMin: H * 0.3 });
  add(geo, rockMat);
  const pts = []; for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.28 + rr(-0.2, 0.2), d = R * rr(1.05, 1.35); pts.push([Math.cos(a) * d, Math.sin(a) * d * 0.8]); }
  boulders(pts, R * 0.22, R * 0.42);

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
