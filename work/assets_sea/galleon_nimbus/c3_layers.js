// galleon_nimbus, candidate 3: "bread and butter" toy construction. The hull is a stack of plan-view
// slabs (ExtrudeGeometry of a sampled planform), each slab one colour band, the bulwark a slab with a hole,
// castles as further slabs cut to their own z ranges. Sails are extruded shapes with the bolt cut through.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
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

  const HL = 9.2, BH = 3.5;
  // planform half breadth at full width; k scales breadth, bowCut shortens the bow for lower slabs
  const hb = (z, k, bowLen) => { const s = z / HL; if (s >= 0) { const t = Math.min(1, s / bowLen); return k * BH * Math.pow(Math.max(0, 1 - Math.pow(t, 2.2)), 0.55); } return k * BH * (1 - 0.25 * s * s); };
  const outline = (k, bowLen, z0, z1, inset = 0) => { const pts = [], N = 26;
    const zEnd = Math.min(z1, HL * bowLen);
    for (let i = 0; i <= N; i++) { const z = z0 + (zEnd - z0) * i / N; pts.push([Math.max(0.01, hb(z, k, bowLen) - inset), z]); }
    const sh = new THREE.Shape(); sh.moveTo(-pts[0][0], -pts[0][1]);
    pts.forEach(([x, z]) => sh.lineTo(x, -z)); for (let i = pts.length - 1; i >= 0; i--) sh.lineTo(-pts[i][0], -pts[i][1]); return sh; };
  // slab: shape in (x, -z), extruded up from y0 by h
  const slab = (sh, y0, h, mat) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 4 }); geo.rotateX(-Math.PI / 2); return add(geo, mat, 0, y0, 0); };
  // hull layers: [y0, h, breadth k, bow length, material]
  const zs = -HL;
  [[0, 0.6, 0.52, 0.72, grey], [0.6, 0.6, 0.7, 0.82, grey], [1.2, 0.6, 0.82, 0.9, grey], [1.8, 0.55, 0.91, 0.95, grey],
   [2.35, 0.14, 0.96, 0.98, gilt], [2.49, 0.9, 0.97, 0.99, violet], [3.39, 0.14, 0.995, 1.0, gilt]].forEach(([y, h, k, bl, mat]) => slab(outline(k, bl, zs + (1 - k) * 0.6, HL), y, h, mat));
  // topsides as a ring (bulwark) and the deck inside it
  { const sh = outline(1.0, 1.0, zs, HL); sh.holes.push(new THREE.Path(outline(1.0, 1.0, zs + 0.25, HL, 0.25).getPoints()));
    slab(sh, 3.53, 1.55, grey); slab(outline(1, 1, zs, HL, 0.1), 3.53, 0.78, deck); }
  { const sh = outline(1.0, 1.0, zs, HL, -0.06); sh.holes.push(new THREE.Path(outline(1.0, 1.0, zs + 0.1, HL, 0.08).getPoints())); slab(sh, 5.08, 0.14, gilt); }
  // forecastle: raised deck slab and a taller bow bulwark
  slab(outline(1, 1, 4.3, HL, 0.2), 4.31, 0.3, deck);
  { const sh = outline(1.0, 1.0, 4.3, HL); sh.holes.push(new THREE.Path(outline(1.0, 1.0, 4.3, HL, 0.25).getPoints())); slab(sh, 5.08, 0.5, grey); }
  // stern castle: two tiers of slabs, violet with gilt cornices
  const tier = (z1, y0, h, ins) => { slab(outline(1, 1, zs, z1, ins), y0, h, violet); slab(outline(1, 1, zs - 0.05, z1 + 0.05, ins - 0.08), y0 + h, 0.16, gilt); };
  tier(-3.8, 5.08, 1.5, 0.12); tier(-6.8, 6.74, 1.45, 0.35);
  { const sh = outline(1, 1, zs, -6.8, 0.35); sh.holes.push(new THREE.Path(outline(1, 1, zs + 0.2, -7.0, 0.55).getPoints())); slab(sh, 8.35, 0.55, violet); }
  // windows: transom and castle sides
  const win = (x, y, z, ry) => { const f = add(new THREE.BoxGeometry(0.72, 0.85, 0.12), gilt, x, y, z); f.rotation.y = ry; const w = add(new THREE.BoxGeometry(0.52, 0.65, 0.16), glow, x, y, z); w.rotation.y = ry; };
  for (let i = 0; i < 4; i++) win((i - 1.5) * 1.25, 5.85, -HL - 0.02, 0);
  for (let i = 0; i < 3; i++) win((i - 1) * 1.15, 7.45, -HL - 0.02, 0);
  for (const s of [-1, 1]) { [-8.3, -7.1, -5.9, -4.7].forEach((z) => win(s * (hb(z, 1, 1) - 0.1), 5.85, z, Math.PI / 2));
    [-8.4, -7.4].forEach((z) => win(s * (hb(z, 1, 1) - 0.33), 7.45, z, Math.PI / 2));
    for (let z = -3.2; z <= 5.6; z += 1.6) { const p = add(new THREE.BoxGeometry(0.14, 0.5, 0.58), dark, s * (hb(z, 0.97, 0.99) + 0.03), 2.94, z); } }
  // castle front, door
  add(new THREE.BoxGeometry(0.9, 1.4, 0.12), dark, 0, 5.8, -3.75);
  for (const x of [-2, 2]) win(x, 5.9, -3.74, 0);
  // stern lanterns: lathe bodies
  const lan = new THREE.LatheGeometry([[0, 0], [0.2, 0.02], [0.27, 0.3], [0.2, 0.6], [0, 0.62]].map(([a, b]) => new THREE.Vector2(a, b)), 8);
  for (const [x, y, z] of [[-2.3, 9.0, -9.1], [2.3, 9.0, -9.1], [0, 9.4, -9.45]]) { add(lan, glow, x, y, z); add(new THREE.ConeGeometry(0.32, 0.36, 8), gilt, x, y + 0.78, z);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 5), gilt, x, y - 0.4, z); }
  // figurehead: lathe-turned cloud puffs stacked on the stem + extruded bolt
  { const puff = new THREE.SphereGeometry(1, 12, 8);
    [[0, 4.5, 9.0, 0.62], [0.42, 4.3, 8.95, 0.42], [-0.42, 4.3, 8.95, 0.42], [0, 4.95, 8.7, 0.48], [0, 4.05, 9.45, 0.4]].forEach(([x, y, z, r]) => { const m = add(puff, gilt, x, y, z); m.scale.setScalar(r); });
    const b = new THREE.Shape(); [[0.1, 0.5], [-0.22, -0.02], [0, -0.02], [-0.12, -0.5], [0.24, 0.1], [0.03, 0.1]].forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)));
    const bg = new THREE.ExtrudeGeometry(b, { depth: 0.18, bevelEnabled: false }); bg.translate(0, 0, -0.09); bg.scale(1.5, 1.5, 1); const bm = add(bg, gilt, 0, 3.3, 9.55); bm.rotation.y = Math.PI / 2; }
  // bowsprit
  const BT = [0, 5.0 + 5.6 * Math.sin(0.36), 8.0 + 5.6 * Math.cos(0.36)]; rod([0, 5.0, 8.0], BT, 0.2, mastM, 8);
  // masts and extruded sails (bolt cut through as a hole, then filled in pale)
  const masts = [[3.4, 4.3, 19.2], [-0.6, 4.3, 21.6], [-5.4, 6.9, 18.6]];
  masts.forEach(([z, y0, top]) => { const h = top - y0; add(new THREE.CylinderGeometry(0.17, 0.3, h, 8), mastM, 0, y0 + h / 2, z);
    add(new THREE.CylinderGeometry(0.85, 0.7, 0.3, 8), mastM, 0, y0 + h * 0.56, z); add(new THREE.SphereGeometry(0.22, 8, 6), gilt, 0, top + 0.15, z);
    const pen = new THREE.Shape(); pen.moveTo(0, 0.35); pen.lineTo(2.2, 0); pen.lineTo(0, -0.35); pen.lineTo(0, 0.35);
    const pg = new THREE.ExtrudeGeometry(pen, { depth: 0.04, bevelEnabled: false }); const pm = add(pg, M(0xffb347, { roughness: 0.8 }), 0, top - 0.5, z); pm.rotation.y = Math.PI / 2; });
  const boltPts = [[0.1, 0.5], [-0.22, -0.02], [0, -0.02], [-0.12, -0.5], [0.24, 0.1], [0.03, 0.1]];
  const sail = (z, yTop, yBot, wTop, wBot) => { const h = yTop - yBot, sh = new THREE.Shape();
    sh.moveTo(-wTop / 2, h); sh.lineTo(wTop / 2, h); sh.quadraticCurveTo(wBot / 2 + 0.3, h / 2, wBot / 2, 0); sh.quadraticCurveTo(0, h * 0.14, -wBot / 2, 0); sh.quadraticCurveTo(-wBot / 2 - 0.3, h / 2, -wTop / 2, h);
    const S = h * 0.78, bolt = new THREE.Path(); boltPts.forEach(([x, y], i) => (i ? bolt.lineTo(x * S, h / 2 + y * S) : bolt.moveTo(x * S, h / 2 + y * S))); sh.holes.push(bolt);
    const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false, curveSegments: 6 }); add(sg, sailM, 0, yBot, z + 0.3);
    const bs = new THREE.Shape(); boltPts.forEach(([x, y], i) => (i ? bs.lineTo(x * S, h / 2 + y * S) : bs.moveTo(x * S, h / 2 + y * S)));
    add(new THREE.ExtrudeGeometry(bs, { depth: 0.16, bevelEnabled: false }), boltM, 0, yBot, z + 0.27);
    rod([-wTop / 2 - 0.4, yTop + 0.1, z], [wTop / 2 + 0.4, yTop + 0.1, z], 0.13, mastM); };
  sail(3.4, 10.6, 6.3, 8.2, 8.8); sail(3.4, 16.0, 10.9, 6.4, 7.6); sail(-0.6, 11.4, 6.4, 9.0, 9.6); sail(-0.6, 18.0, 11.7, 7.0, 8.4); sail(-5.4, 12.4, 9.4, 6.0, 6.4); sail(-5.4, 16.6, 12.7, 4.6, 5.6);
  const rope = M(0x2b2430, { roughness: 0.8 });
  rod([0, 19.0, 3.4], BT, 0.04, rope); rod([0, 21.3, -0.6], [0, 18.6, 3.4], 0.04, rope); rod([0, 18.4, -5.4], [0, 20.6, -0.6], 0.04, rope);
  masts.forEach(([z, y0, top]) => { const yt = y0 + (top - y0) * 0.56; for (const s of [-1, 1]) for (const dz of [-1.5, -0.6, 0.3]) { const zz = z + dz; rod([s * 0.5, yt, z], [s * hb(zz, 1, 1), 5.1, zz], 0.035, rope, 4); } });

  const mark = (name, x, y, z) => { const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); g.add(o); };
  mark('mark_captain', 0, 4.61, 6.3); mark('mark_waterline', 0, 1.4, 0); mark('mark_masttop', 0, 21.6, -0.6); mark('mark_bow', 0, 4.6, HL); mark('mark_stern', 0, 4.6, -HL);

  const bb = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
