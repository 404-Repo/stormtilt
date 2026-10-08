// island_far, c1_heightfield. Built by the 404 method (reference image, three strategies, verify, pick by eye).
export default function (THREE) {
  const g = new THREE.Group();
  const P = {};
  // ---- shared helpers (inlined; seeded so the asset is identical on every load) ----
  let SEED = 131; const NSEED = (SEED % 89) + 0.37;
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
  // c1, a polar heightfield: two grassy humps with a saddle, an elliptical rim that drops in steep banded cliffs
  // to a foam-white shore, the outer ring sunk below the waterline
  const NR = 30, NA = 64, AX = 86, AZ = 32, pos = [], idx = [];
  const hump = (x, z) => 23 * Math.exp(-Math.pow((x - 20) / 30, 2)) + 15 * Math.exp(-Math.pow((x + 50) / 22, 2)) + 9 + 3 * fbm(x * 0.03, 0, z * 0.03, 2);
  for (let i = 0; i <= NR; i++) { const r = (i / NR) * 1.06;
    for (let j = 0; j < NA; j++) { const a = (j / NA) * Math.PI * 2, rim = 1 + 0.1 * fbm(Math.cos(a) * 2, Math.sin(a) * 2, 1, 2), rr2 = r / rim;
      const x = Math.cos(a) * AX * r, z = Math.sin(a) * AZ * r;
      const top = hump(x, z) * (1 - 0.3 * rr2 * rr2), cliff = Math.min(1, Math.max(0, (1 - rr2) / 0.07)), cl = cliff * cliff * (3 - 2 * cliff);
      const y = rr2 > 1.0 ? -1.5 : top * cl + 2.2 * (1 - cl); pos.push(x, y, z); } }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + ((j + 1) % NA), c = a + NA, d = b + NA; idx.push(a, b, c, b, d, c); }
  // close the centre
  let geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo = geo.toNonIndexed();
  warp(geo, 2.5, 0.05, 2, (x, y) => (y > 1 ? 1 : 0.3));
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0);
  smooth(geo); strata(geo, { period: 4.5, top: 1000, cap: 2000, foamBelow: 2.6 });   // all up-facing ground is grass, steep faces are banded cliff
  const land = add(geo, rockMat);
  // ---- shared village: chunky toy houses on the west slope and a white chapel on the summit, dropped onto the land by raycast ----
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
  land.updateMatrixWorld(true);
  const groundAt = (x, z) => { ray.set(new THREE.Vector3(x, 200, z), down); const h = ray.intersectObject(land, false)[0]; return h ? h.point.y : 0; };
  const wallM = [0xf3eee3, 0xf2b630, 0xf3eee3, 0xe9d7b5].map((c) => { const m = M(c, { roughness: 0.4 }); m.name = 'plaster'; return m; });
  const roofM = [0xd7372f, 0x2a5bd7, 0xd7372f, 0xc46a3a].map((c) => { const m = M(c, { roughness: 0.35 }); m.name = 'tile'; return m; });
  const dark = M(0x3b3358, { roughness: 0.5 });
  const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.6, 0); s.lineTo(w / 2 + 0.6, 0); s.lineTo(0, h); s.lineTo(-w / 2 - 0.6, 0);
    const q = new THREE.ExtrudeGeometry(s, { depth: d + 1.2, bevelEnabled: false }); q.translate(0, 0, -(d + 1.2) / 2); return q; };
  const house = (x, z, w, h, d, ry, k) => { const y = groundAt(x, z) - 1.2, grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; grp.scale.setScalar(1.3); g.add(grp);
    add(new THREE.BoxGeometry(w, h + 1.2, d), wallM[k % 4], 0, (h + 1.2) / 2, 0, grp); add(prism(w, w * 0.55, d), roofM[k % 4], 0, h + 1.2, 0, grp);
    add(new THREE.BoxGeometry(w * 0.22, h * 0.32, 0.3), dark, -w * 0.18, 1.2 + h * 0.16, d / 2, grp); add(new THREE.BoxGeometry(w * 0.2, h * 0.22, 0.3), dark, w * 0.22, 1.2 + h * 0.55, d / 2, grp);
    add(new THREE.BoxGeometry(1, 2.2, 1), wallM[(k + 1) % 4], w * 0.28, h + 1.2 + w * 0.3, 0, grp); };
  [[-58, 14, 8, 6, 7, 0.1], [-49, 18, 7, 5.5, 6, -0.15], [-52, 6, 7.5, 7, 6.5, 0.25], [-41, 11, 6.5, 5, 6, 0.05], [-63, 4, 6.5, 5.5, 6, -0.3], [-36, 20, 6, 5, 5.5, 0.2]]
    .forEach(([x, z, w, h, d, ry], k) => house(x, z, w, h, d, ry, k));
  // the chapel: nave, red roof, a bell tower with an open bell stage and a pyramid cap (no cross: no glyphs)
  const cx = 22, cz = 4, cy = groundAt(cx, cz) - 1.5, CH = new THREE.Group(); CH.position.set(cx, cy, cz); CH.rotation.y = -0.2; CH.scale.setScalar(1.15); g.add(CH);
  const wh = wallM[0], rd = roofM[0];
  add(new THREE.BoxGeometry(14, 8.5, 8), wh, 0, 4.25, 0, CH); add(prism(8, 4.6, 14), rd, 0, 8.5, 0, CH).rotation.y = Math.PI / 2;
  add(new THREE.BoxGeometry(4.4, 13, 4.4), wh, -8.4, 6.5, 0, CH);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(new THREE.BoxGeometry(0.9, 3, 0.9), wh, -8.4 + sx * 1.75, 14.5, sz * 1.75, CH);
  add(new THREE.SphereGeometry(0.9, 8, 6), M(0xc9a043, { roughness: 0.3, metalness: 0.7 }), -8.4, 14.2, 0, CH);
  add(new THREE.BoxGeometry(4.8, 0.5, 4.8), wh, -8.4, 16.2, 0, CH);
  add(new THREE.ConeGeometry(3.4, 3.4, 4), rd, -8.4, 18.1, 0, CH).rotation.y = Math.PI / 4;
  add(new THREE.BoxGeometry(2.2, 3.6, 0.3), dark, 7.05, 1.8, 0, CH).rotation.y = Math.PI / 2;
  for (const s of [-3, 0, 3]) add(new THREE.BoxGeometry(1.1, 2.6, 0.3), dark, s, 5, 4.05, CH);


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
