// galleon_nimbus, candidate 2: hull lofted from height-parametrised cross sections (custom BufferGeometry),
// bellied sails from displaced planes, stern castle from the stepped sheer line. Front (bow) = +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32, side: THREE.DoubleSide }, o));
  const grey = M(0x6f7487), violet = M(0x3b3358), deck = M(0xc89a62, { roughness: 0.65 }); deck.name = 'timber';
  const gilt = M(0xffb347, { metalness: 0.45, roughness: 0.3 }); gilt.name = 'metal';
  const glow = M(0xffc766, { emissive: 0xffb347, emissiveIntensity: 1.6, roughness: 0.4 });
  const mastM = M(0x4a3428, { roughness: 0.6 }); mastM.name = 'timber';
  const sailM = M(0x45396b, { roughness: 0.85 }); sailM.name = 'fabric';
  const boltM = M(0xf4ead2, { roughness: 0.85, emissive: 0xf4ead2, emissiveIntensity: 0.12 });
  const dark = M(0x231d33);
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };

  // ---- hull form ----
  const HL = 9.2, BEAM2 = 3.5, DECK = 4.3;
  const sm = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const hb = (z) => { const s = z / HL; return s >= 0 ? BEAM2 * Math.pow(Math.max(0, 1 - Math.pow(s, 2.4)), 0.6) : BEAM2 * (1 - 0.28 * s * s); };
  const ky = (z) => { const s = z / HL; if (s > 0.45) return 2.3 * Math.pow((s - 0.45) / 0.55, 2); if (s < -0.8) return 0.8 * Math.pow((-s - 0.8) / 0.2, 2); return 0; };
  const ty = (z) => { const s = z / HL; return 5.0 + 0.6 * sm((s - 0.4) / 0.15) + 1.8 * sm((-s - 0.3) / 0.12) + 1.5 * sm((-s - 0.62) / 0.1); };
  const X = (z, y) => { const k = ky(z), D = Math.max(0.3, DECK - k), r = Math.min(1, Math.max(0, (y - k) / D));
    let x = hb(z) * Math.pow(1 - Math.pow(1 - r, 2.6), 1 / 2.6); if (y > DECK) x *= 1 - 0.035 * (y - DECK); return x; };
  const ZS = []; for (let i = 0; i <= 56; i++) { const u = i / 56; ZS.push(-HL + 2 * HL * (0.5 - 0.5 * Math.cos(Math.PI * u)) ); }
  function band(y0, y1, mat, nh = 5) {
    for (const side of [-1, 1]) {
      const pos = [], idx = [];
      ZS.forEach((z) => { const a = Math.max(y0, ky(z)), b = Math.max(a, Math.min(y1, ty(z)));
        for (let j = 0; j <= nh; j++) { const y = a + (b - a) * j / nh; pos.push(side * X(z, y), y, z); } });
      for (let i = 0; i < ZS.length - 1; i++) for (let j = 0; j < nh; j++) { const p = i * (nh + 1) + j, q = p + nh + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      add(geo, mat);
    }
  }
  band(0, 2.4, grey, 6); band(2.4, 3.45, violet, 3); band(3.45, 5.55, grey, 5); band(5.55, 6.95, violet, 4); band(6.95, 9, grey, 3);
  // gilt rubbing strakes and sheer rail as tubes
  const strake = (fy, r) => { for (const side of [-1, 1]) { const pts = ZS.filter((z, i) => i % 2 === 0).map((z) => { const y = fy(z); return new THREE.Vector3(side * (X(z, y) + 0.02), y, z); });
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 56, r, 5, false), gilt); } };
  strake((z) => Math.max(2.4, ky(z) + 0.05), 0.09); strake((z) => Math.max(3.45, ky(z) + 0.1), 0.09); strake((z) => ty(z), 0.11);
  strake((z) => Math.min(ty(z) - 0.05, 5.55), 0.07); strake((z) => Math.min(ty(z) - 0.05, 6.95), 0.07);
  // transom cap
  { const z = -HL, sh = new THREE.Shape(), k = ky(z), t = ty(z), n = 10; sh.moveTo(0, k);
    for (let j = 1; j <= n; j++) { const y = k + (t - k) * j / n; sh.lineTo(X(z, y), y); }
    for (let j = n; j >= 1; j--) { const y = k + (t - k) * j / n; sh.lineTo(-X(z, y), y); }
    add(new THREE.ShapeGeometry(sh), violet, 0, 0, z);
    // stern windows: two rows on the transom, gilt frame behind each
    [[5.5, 4, 1.15], [7.0, 3, 1.25]].forEach(([y, n2, dx]) => { for (let i = 0; i < n2; i++) { const x = (i - (n2 - 1) / 2) * dx;
      add(new THREE.BoxGeometry(0.75, 0.95, 0.12), gilt, x, y, z - 0.04); add(new THREE.BoxGeometry(0.55, 0.75, 0.12), glow, x, y, z - 0.08); } });
    add(new THREE.BoxGeometry(2 * X(z, 6.2) + 0.3, 0.16, 0.5), gilt, 0, 6.25, z - 0.1);
  }
  // side windows on the stern castle (both sides)
  for (const side of [-1, 1]) for (const [y, zs] of [[5.0, [-8.4, -7.2, -6.0, -4.8]], [6.45, [-8.6, -7.6]], [7.75, [-8.6, -7.6]]]) for (const z of zs) {
    const x = side * (X(z, y) + 0.04), sl = (X(z + 0.1, y) - X(z - 0.1, y)) / 0.2;
    const f = add(new THREE.BoxGeometry(0.14, 0.9, 0.7), gilt, x, y, z); f.rotation.y = side * Math.atan(sl);
    const w = add(new THREE.BoxGeometry(0.16, 0.7, 0.5), glow, x + side * 0.03, y, z); w.rotation.y = f.rotation.y; }
  // gun-port-like gilt squares along the violet band
  for (const side of [-1, 1]) for (let z = -3.2; z <= 6.4; z += 1.6) { const y = 2.92, x = side * (X(z, y) + 0.03);
    const p = add(new THREE.BoxGeometry(0.12, 0.55, 0.6), dark, x, y, z); p.rotation.y = side * Math.atan((X(z + 0.1, y) - X(z - 0.1, y)) / 0.2); }

  // ---- decks (one strip, stepped) ----
  const dY = (z) => (z > 4.3 ? 4.6 : z > -3.8 ? DECK : z > -6.8 ? 6.0 : 7.4);
  { const rows = []; ZS.forEach((z) => rows.push(z)); [4.3, -3.8, -6.8].forEach((b) => rows.push(b - 1e-3, b + 1e-3)); rows.sort((a, b) => a - b);
    const pos = [], idx = []; rows.forEach((z) => { const y = dY(z), w = X(z, y) * 0.97; pos.push(-w, y, z, w, y, z); });
    for (let i = 0; i < rows.length - 1; i++) { const p = i * 2; idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, deck); }
  // castle front bulkheads with door, windows and gilt rail
  [[-3.8, DECK, 6.0], [-6.8, 6.0, 7.4]].forEach(([z, y0, y1]) => { const w = 2 * X(z, y1) * 0.97, h = y1 - y0;
    add(new THREE.BoxGeometry(w, h, 0.14), violet, 0, y0 + h / 2, z + 0.07);
    add(new THREE.BoxGeometry(0.8, Math.min(1.5, h - 0.15), 0.1), dark, 0, y0 + Math.min(1.5, h - 0.15) / 2, z + 0.16);
    for (const x of [-1.9, 1.9]) { add(new THREE.BoxGeometry(0.62, 0.62, 0.1), gilt, x, y0 + h * 0.55, z + 0.15); add(new THREE.BoxGeometry(0.46, 0.46, 0.1), glow, x, y0 + h * 0.55, z + 0.19); }
    add(new THREE.BoxGeometry(w, 0.1, 0.1), gilt, 0, y1 + 0.75, z + 0.1);
    for (let i = 0; i <= 8; i++) add(new THREE.BoxGeometry(0.08, 0.75, 0.08), gilt, -w / 2 + w * i / 8, y1 + 0.375, z + 0.1); });
  // forecastle front edge rail (the Admiral stands forward of it, open space z 5 to 7.5)
  { const z = 4.3, w = 2 * X(z, 4.6) * 0.95; add(new THREE.BoxGeometry(w, 0.1, 0.1), gilt, 0, 5.35, z); }

  // ---- stern lanterns ----
  const lantern = (x, y, z) => { add(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5), gilt, x, y - 0.45, z);
    add(new THREE.CylinderGeometry(0.26, 0.2, 0.55, 6), glow, x, y + 0.27, z); add(new THREE.ConeGeometry(0.34, 0.35, 6), gilt, x, y + 0.72, z);
    add(new THREE.SphereGeometry(0.08, 6, 4), gilt, x, y + 0.95, z); add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 6), gilt, x, y, z); };
  lantern(-2.2, ty(-HL) + 0.6, -HL + 0.1); lantern(2.2, ty(-HL) + 0.6, -HL + 0.1); lantern(0, ty(-HL) + 1.0, -HL - 0.15);

  // ---- figurehead: gilded thundercloud + bolt below the bowsprit ----
  { const z0 = HL - 0.1, y0 = 4.4;
    [[0, 0, 0.55, 0.62], [0.42, -0.1, 0.3, 0.48], [-0.42, -0.1, 0.3, 0.48], [0, 0.42, 0.25, 0.5], [0.28, 0.28, 0.65, 0.4], [-0.28, 0.28, 0.65, 0.4], [0, -0.18, 1.0, 0.4]]
      .forEach(([x, y, z, r]) => add(new THREE.IcosahedronGeometry(r, 1), gilt, x, y0 + y, z0 + z));
    const b = new THREE.Shape(); [[0.1, 0.5], [-0.22, -0.02], [0, -0.02], [-0.12, -0.5], [0.24, 0.1], [0.03, 0.1]].forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)));
    const bg = new THREE.ExtrudeGeometry(b, { depth: 0.18, bevelEnabled: false }); bg.translate(0, 0, -0.09); bg.scale(1.6, 1.6, 1);
    const bm = add(bg, gilt, 0, y0 - 1.05, z0 + 0.95); bm.rotation.y = Math.PI / 2; }

  // ---- bowsprit, masts, yards, sails ----
  const BS = [0, 5.0, 8.0], BT = [0, 5.0 + 5.6 * Math.sin(0.36), 8.0 + 5.6 * Math.cos(0.36)];
  rod(BS, BT, 0.2, mastM, 8); rod([0, BT[1] - 0.6, BT[2] - 1.6], [0, BT[1] + 0.7, BT[2] - 1.6], 0.07, mastM);
  const masts = [[3.4, 4.3, 19.2], [-0.6, 4.3, 21.6], [-5.4, 6.0, 18.6]];
  masts.forEach(([z, y0, top]) => { const h = top - y0, m = add(new THREE.CylinderGeometry(0.17, 0.3, h, 8), mastM, 0, y0 + h / 2, z);
    add(new THREE.CylinderGeometry(0.85, 0.7, 0.3, 8), mastM, 0, y0 + h * 0.56, z);
    add(new THREE.SphereGeometry(0.22, 8, 6), gilt, 0, top + 0.15, z);
    const pen = new THREE.Shape(); pen.moveTo(0, 0.35); pen.lineTo(2.2, 0); pen.lineTo(0, -0.35); pen.lineTo(0, 0.35);
    const pm = add(new THREE.ShapeGeometry(pen), M(0xffb347, { roughness: 0.8 }), 0, top - 0.5, z - 0.05); pm.rotation.y = Math.PI / 2; });
  const boltShape = new THREE.Shape(); [[0.1, 0.5], [-0.22, -0.02], [0, -0.02], [-0.12, -0.5], [0.24, 0.1], [0.03, 0.1]].forEach(([x, y], i) => (i ? boltShape.lineTo(x, y) : boltShape.moveTo(x, y)));
  function sail(z, yTop, yBot, wTop, wBot) {
    const h = yTop - yBot, W = Math.max(wTop, wBot), belly = (x, y) => 0.5 * Math.cos((x / W) * Math.PI) * (0.8 + 0.2 * Math.sin(((y - yBot) / h) * Math.PI));
    const geo = new THREE.PlaneGeometry(1, 1, 8, 6), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getY(i) + 0.5, y = yBot + v * h, w = wBot + (wTop - wBot) * v, x = u * w; p.setXYZ(i, x, y, z + belly(x, y)); }
    geo.computeVertexNormals(); add(geo, sailM);
    // bolt: a flat plate clear of the sail on each face (front just ahead of the belly peak, back just behind its lowest point under the bolt)
    const S = h * 0.84, bw = 0.3 * S * 1.3, lo = belly(bw, yBot), hi = belly(0, yBot + h / 2);
    for (const [s, off] of [[1, hi + 0.07], [-1, lo - 0.07]]) { const bg = new THREE.ShapeGeometry(boltShape); bg.scale(1.3 * S, S, 1);
      const bm = add(bg, boltM, 0, yBot + h * 0.5, z + off); if (s < 0) bm.rotation.y = Math.PI; }
    rod([-wTop / 2 - 0.4, yTop + 0.1, z], [wTop / 2 + 0.4, yTop + 0.1, z], 0.13, mastM);
  }
  sail(3.4, 10.6, 6.3, 8.2, 8.8); sail(3.4, 16.0, 10.9, 6.4, 7.6);
  sail(-0.6, 11.4, 6.4, 9.0, 9.6); sail(-0.6, 18.0, 11.7, 7.0, 8.4);
  sail(-5.4, 12.4, 8.3, 6.0, 6.4); sail(-5.4, 16.6, 12.7, 4.6, 5.6);
  // rigging: stays and shrouds
  const rope = M(0x2b2430, { roughness: 0.8 });
  rod([0, 19.0, 3.4], BT, 0.04, rope); rod([0, 21.3, -0.6], [0, 18.6, 3.4], 0.04, rope); rod([0, 18.4, -5.4], [0, 20.6, -0.6], 0.04, rope);
  masts.forEach(([z, y0, top]) => { const yt = y0 + (top - y0) * 0.56; for (const side of [-1, 1]) for (const dz of [-0.9, 0, 0.9]) { const zz = z + dz - 0.6;
    rod([side * 0.5, yt, z], [side * (X(zz, ty(zz)) + 0.05), ty(zz), zz], 0.035, rope, 4); } });

  // ---- markers for the game (positions in module space after placement) ----
  const mark = (name, x, y, z) => { const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); g.add(o); };
  mark('mark_captain', 0, 4.6, 6.3); mark('mark_waterline', 0, 1.4, 0); mark('mark_masttop', 0, 21.6, -0.6);
  mark('mark_bow', 0, 4.6, HL); mark('mark_stern', 0, 4.6, -HL);

  // ---- placement: base at y=0, centred on x and z ----
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
