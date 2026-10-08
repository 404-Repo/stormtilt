// sea_stack_a (pick: c1_lathe). Built by the 404 method; reference, three candidates and sheets in receipts/candidates/sea2/sea_stack_a/
export default function (THREE) {
  const g = new THREE.Group();
  const P = {"H":38,"R":7.2,"flat":0.78,"lean":0.1,"notchA":0.7,"notchY":0.6,"overY":0.84,"waist":0.62,"expect":{"height":38}};
  // ---- shared helpers (inlined; seeded so the asset is identical on every load) ----
  let SEED = 41; const NSEED = (SEED % 89) + 0.37;
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
  // c1: lathe profile (flared foot, waist, rounded crown), made elliptical and leaning, a deep notch and a one-sided
  // overhang shelf carved in polar space, then world-space noise: big bends, vertical fluting, fine lumps.
  // Stack b fuses a shorter shoulder pillar to one side for a stepped silhouette.
  const pillar = (H, R, ox, oz, nA, nY, oY, waist, lean, segs, rows) => {
    const prof = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      let r = R * (1 - 0.4 * t) + R * 0.3 * Math.pow(Math.max(0, 1 - t / 0.12), 2) - R * 0.14 * Math.exp(-Math.pow((t - waist) / 0.1, 2));
      if (t > 0.95) r *= Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.95) / 0.055, 2)));
      prof.push(new THREE.Vector2(Math.max(r, 0.01), t * H));
    }
    prof.push(new THREE.Vector2(0, H * 1.005));
    const geo = new THREE.LatheGeometry(prof, segs).toNonIndexed(), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const t = y / H;
      let a = Math.atan2(z, x), r = Math.hypot(x, z);
      let da = Math.atan2(Math.sin(a - nA), Math.cos(a - nA));
      r *= 1 - 0.8 * Math.exp(-Math.pow(da / 0.8, 2)) * Math.exp(-Math.pow((t - nY) / 0.06, 2));       // the notch
      da = Math.atan2(Math.sin(a - nA - 2.8), Math.cos(a - nA - 2.8));
      r *= 1 - 0.35 * Math.exp(-Math.pow(da / 0.5, 2)) * Math.exp(-Math.pow((t - nY + 0.22) / 0.06, 2)); // back scallop
      da = Math.atan2(Math.sin(a - nA - 1.2), Math.cos(a - nA - 1.2));
      r *= 1 + 0.75 * Math.exp(-Math.pow(da / 0.9, 2)) * Math.exp(-Math.pow((t - oY) / 0.055, 2));      // overhang shelf
      x = Math.cos(a) * r + lean * H * t * t + ox; z = Math.sin(a) * r * P.flat + oz;
      p.setXYZ(i, x, y, z);
    }
    return geo;
  };
  const { H, R } = P, list = [pillar(H, R, 0, 0, P.notchA, P.notchY, P.overY, P.waist, P.lean, 30, 50)];
  if (P.twin) list.push(pillar(H * P.twin[0], R * P.twin[1], R * P.twin[2], -R * 0.15, P.notchA + 2, 0.5, 0.75, 0.5, 0.05, 22, 30));
  const geo = merge(list);
  warp(geo, R * 0.28, 0.35 / R, 2, (x, y) => (y < 0.2 ? 0 : Math.min(1, y / (H * 0.15))));
  warp(geo, R * 0.2, 1.6 / R, 2, (x, y) => (y < 0.2 ? 0 : 1), 0.18);
  warp(geo, R * 0.05, 4 / R, 2, (x, y) => (y < 0.2 ? 0 : 1));
  smooth(geo); strata(geo, { period: H / 10, top: H, cap: H * 0.1, ledgeMin: H * 0.25 });
  add(geo, rockMat);
  const pts = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28 + rr(-0.2, 0.2), d = R * rr(1.05, 1.35); pts.push([Math.cos(a) * d + (P.twin && Math.cos(a) > 0 ? R * 0.5 : 0), Math.sin(a) * d * P.flat]); }
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
