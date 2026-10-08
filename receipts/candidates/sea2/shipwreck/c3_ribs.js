// shipwreck, c3_ribs. Built by the 404 method (reference image, three strategies, verify, pick by eye).
export default function (THREE) {
  const g = new THREE.Group();
  const P = {};
  // ---- shared helpers (inlined; seeded so the asset is identical on every load) ----
  let SEED = 97; const NSEED = (SEED % 89) + 0.37;
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
  // ---- shared hull definition: the bow half of a wooden ship, local frame, keel at y=0, bow toward +z ----
  const LH = 10.5, BH = 2.3;
  const beam = (s) => (s < 0.5 ? BH : BH * Math.sqrt(Math.max(0.004, 1 - Math.pow((s - 0.5) / 0.5, 2))));
  const keelY = (s) => 1.9 * Math.pow(Math.max(0, (s - 0.55) / 0.45), 2);
  const sheerY = (s) => 3.2 + 1.0 * s * s;
  // u in [0,1]: 0 = port sheer, 0.5 = keel, 1 = starboard sheer
  const hullPt = (s, u, inset = 0) => {
    const f = Math.PI * u - Math.PI, c = Math.cos(f), b = Math.max(0, beam(s) - inset);
    const x = b * Math.sign(c) * Math.pow(Math.abs(c), 0.55), y = keelY(s) + inset + (sheerY(s) - keelY(s) - inset) * (1 + Math.sin(f));
    return new THREE.Vector3(x, y, s * LH);
  };
  const brokenS = (u) => 0.03 + 0.16 * hash3(Math.floor(u * 11), 3, 5) + 0.05 * Math.sin(u * 23);
  const HG = new THREE.Group(); g.add(HG);
  HG.rotation.x = -0.3; HG.rotation.z = 0.16; HG.position.set(0, -0.2, -2);   // negative x pitches the bow UP (traps.md)
  const T1 = M(0x5b4331, { roughness: 0.65 }), T2 = M(0x6e5038, { roughness: 0.65 }), TD = M(0x3f2f24, { roughness: 0.7 }), MOSS = M(0x56703a, { roughness: 0.75 });
  [T1, T2, TD].forEach((m) => { m.name = 'timber'; m.side = THREE.DoubleSide; }); MOSS.name = 'foliage';
  const tube = (pts, r, mat, parent, seg = 6) => { const cv = new THREE.CatmullRomCurve3(pts); return add(new THREE.TubeGeometry(cv, Math.max(4, pts.length * 2), r, seg, false), mat, 0, 0, 0, parent); };

  // c3, a different reading: a skeleton wreck. A full run of ribs and a keel carry the shape; planking survives only
  // toward the bow and thins out toward the break, so the hull reads as a ribcage from the side
  const NR = 13;
  for (let i = 0; i < NR; i++) { const s = 0.0 + 0.9 * i / (NR - 1), pts = []; const top = i < 4 ? 0.08 + 0.1 * rnd() : 0.02;
    for (let k = 0; k <= 8; k++) pts.push(hullPt(s, top + (1 - 2 * top) * k / 8, 0.05)); tube(pts, 0.16, TD, HG); }
  const keel = []; for (let i = 0; i <= 12; i++) keel.push(hullPt(-0.05 + 1.05 * i / 12, 0.5).add(new THREE.Vector3(0, -0.15, 0))); keel.push(hullPt(1, 0.5).add(new THREE.Vector3(0, sheerY(1) - keelY(1) + 0.6, 0.2))); tube(keel, 0.24, TD, HG);
  // surviving strakes: thin lofted ribbons, each starting further forward the higher it is
  const NS = 8;
  for (let k = 0; k < NS; k++) for (const side of [0, 1]) {
    const u0 = side ? 0.5 + k / NS * 0.5 : 0.5 - (k + 1) / NS * 0.5, u1 = u0 + 0.5 / NS * 0.9, s0 = 0.12 + 0.5 * hash3(k, side, 7) * (k / NS + 0.3);
    const pos = [], idx = [], R = 10;
    for (let i = 0; i <= R; i++) { const s = s0 + (1 - s0) * i / R; for (const u of [u0, u1]) { const q = hullPt(s, u); pos.push(q.x, q.y, q.z); } }
    for (let i = 0; i < R; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setIndex(idx); sg.computeVertexNormals();
    add(sg, k < 2 ? MOSS : (k % 2 ? T1 : T2), 0, 0, 0, HG);
  }
  for (const u of [0.0, 1.0]) { const pts = []; for (let i = 0; i <= 10; i++) pts.push(hullPt(0.25 + 0.75 * i / 10, u).add(new THREE.Vector3(0, 0.1, 0))); tube(pts, 0.17, T2, HG); }
  const bs = add(new THREE.CylinderGeometry(0.1, 0.2, 2.8, 8), TD, 0, 0, 0, HG); bs.position.set(0, sheerY(1) + 0.4, LH + 1.1); bs.rotation.x = Math.PI / 2 - 0.35;
  // ---- shared extras, in world space so the rags hang plumb: snapped mast, yard, rags, rope, rubble ----
  HG.updateMatrixWorld(true);
  const W = (s, u, dy = 0) => HG.localToWorld(hullPt(s, u).add(new THREE.Vector3(0, dy, 0)));
  const mb = W(0.42, 0.5, 0.4), mDir = new THREE.Vector3(0.35, 1, -0.55).normalize(), mLen = 6.6;
  const mast = add(new THREE.CylinderGeometry(0.2, 0.3, mLen, 10), TD); mast.position.copy(mb).addScaledVector(mDir, mLen / 2);
  mast.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mDir);
  const mt = mb.clone().addScaledVector(mDir, mLen);
  for (let i = 0; i < 4; i++) { const sp = add(new THREE.ConeGeometry(0.09, rr(0.5, 1.0), 4), TD); sp.position.copy(mt).add(new THREE.Vector3(rr(-0.12, 0.12), 0.2, rr(-0.12, 0.12)));
    sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mDir.clone().add(new THREE.Vector3(rr(-0.3, 0.3), 0, rr(-0.3, 0.3))).normalize()); }
  const yc = mb.clone().addScaledVector(mDir, mLen * 0.72), yDir = new THREE.Vector3(1, -0.32, 0.12).normalize(), yLen = 5.4;
  const yard = add(new THREE.CylinderGeometry(0.12, 0.14, yLen, 8), TD); yard.position.copy(yc); yard.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yDir);
  const canvas = M(0xd9ccab, { roughness: 0.85, side: THREE.DoubleSide }); canvas.name = 'fabric';
  for (let k = 0; k < 3; k++) {
    const top = yc.clone().addScaledVector(yDir, (k - 1) * 1.6), w = rr(1.4, 1.9), h = rr(2.4, 3.4);
    const q = new THREE.PlaneGeometry(w, h, 4, 6), p = q.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i); const t = (h / 2 - y) / h;
      if (t > 0.95) y += rr(0, 0.8);                       // ragged bottom edge
      if (Math.abs(x) > w / 2 - 0.01 && t > 0.4) x *= rr(0.55, 0.9);   // torn sides
      p.setXYZ(i, x, y - h / 2, Math.sin(x * 3 + k) * 0.18 * t + t * t * 0.5); }
    q.computeVertexNormals();
    const rag = add(q, canvas); rag.position.copy(top); rag.rotation.y = Math.atan2(-yDir.z, yDir.x) * 0.6; rag.rotation.z = -0.32 * 0.9;
  }
  const rope = M(0xb59a6a, { roughness: 0.8 }); rope.name = 'fabric';
  const ye = yc.clone().addScaledVector(yDir, yLen / 2), bt = HG.localToWorld(new THREE.Vector3(0, sheerY(1) + 0.8, LH + 2.3));
  tube([ye, ye.clone().lerp(bt, 0.5).add(new THREE.Vector3(0, -1.2, 0)), bt], 0.05, rope, g, 4);
  const ye2 = yc.clone().addScaledVector(yDir, -yLen / 2);
  tube([ye2, ye2.clone().add(new THREE.Vector3(-0.3, -2.2, 0.2)), ye2.clone().add(new THREE.Vector3(-0.1, -3.4, 0.6))], 0.045, rope, g, 4);
  // rubble mound under the broken end: stones and loose planks
  const stone = M(0x6f6a62, { roughness: 0.8, flatShading: true }); stone.name = 'stone';
  const sl = []; for (let i = 0; i < 16; i++) { const q = new THREE.DodecahedronGeometry(rr(0.4, 0.9), 0); q.scale(1, 0.6, 1); q.translate(rr(-3.6, 3.6), 0.2, rr(-4.8, 1.2)); sl.push(q); }
  const sg = merge(sl); sg.computeVertexNormals(); add(sg, stone);
  for (let i = 0; i < 7; i++) { const b = add(new THREE.BoxGeometry(0.3, 0.12, rr(1.6, 3.2)), i % 2 ? T1 : TD, rr(-3.4, 3.4), 0.35, rr(-4.6, 1.6)); b.rotation.set(rr(-0.2, 0.2), rr(0, 3.1), rr(-0.3, 0.3)); }


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
