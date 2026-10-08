//@seed 89
//@expect {"depth":14,"height":9}
//@include _hull.js
  // c2, profile: one lofted hull skin from the section function, open at a jagged broken edge, planking as alternating
  // vertex-coloured strakes with moss toward the waterline; exposed ribs past the break, gunwales, foredeck, bowsprit
  const NS = 24, NR = 22, pos = [], col = [], idx = [], c = new THREE.Color(), ca = new THREE.Color(0x5b4331), cb = new THREE.Color(0x7a5a3e), cm = new THREE.Color(0x58703b), cd = new THREE.Color(0x3f2f24);
  for (let j = 0; j <= NS; j++) { const u = j / NS, s0 = brokenS(u);
    for (let i = 0; i <= NR; i++) { const s = s0 + (1 - s0) * i / NR, q = hullPt(s, u); pos.push(q.x, q.y, q.z);
      c.copy(Math.floor(u * NS / 2) % 2 ? ca : cb); if (Math.abs(u - 0.5) > 0.42) c.copy(cd);
      const moss = (1 - i / NR) * 0.8 * (0.5 + 0.5 * fbm(q.x * 0.8, q.y * 0.8, q.z * 0.8, 2)) - (q.y / 4) * 0.4; if (moss > 0.12) c.lerp(cm, Math.min(1, moss * 1.4));
      col.push(c.r, c.g, c.b); } }
  for (let j = 0; j < NS; j++) for (let i = 0; i < NR; i++) { const a = j * (NR + 1) + i, b = a + 1, d = a + NR + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); hg.setIndex(idx); hg.computeVertexNormals();
  const skin = M(0xffffff, { vertexColors: true, roughness: 0.65, side: THREE.DoubleSide }); skin.name = 'timber';
  add(hg, skin, 0, 0, 0, HG);
  for (const sr of [0.02, -0.07, -0.16]) { const pts = []; for (let i = 0; i <= 8; i++) pts.push(hullPt(0.02, 0.06 + 0.88 * i / 8, 0.12).add(new THREE.Vector3(0, 0, (sr - 0.02) * LH))); tube(pts, 0.17, TD, HG); }
  for (const u of [0.0, 1.0]) { const pts = []; for (let i = 0; i <= 10; i++) { const s = brokenS(u) + (1 - brokenS(u)) * i / 10; pts.push(hullPt(s, u).add(new THREE.Vector3(0, 0.1, 0))); } tube(pts, 0.17, T2, HG); }
  const stem = []; for (let i = 0; i <= 8; i++) stem.push(hullPt(0.6 + 0.4 * i / 8, 0.5).add(new THREE.Vector3(0, 0, 0.1)));
  stem.push(hullPt(1, 0.5).add(new THREE.Vector3(0, sheerY(1) - keelY(1) + 0.6, 0.2))); tube(stem, 0.22, TD, HG);
  const dk = new THREE.Shape(); for (let i = 0; i <= 8; i++) { const s = 0.62 + 0.33 * i / 8; dk.lineTo(beam(s) * 0.93, s * LH); } for (let i = 8; i >= 0; i--) { const s = 0.62 + 0.33 * i / 8; dk.lineTo(-beam(s) * 0.93, s * LH); }
  const dg = new THREE.ExtrudeGeometry(dk, { depth: 0.18, bevelEnabled: false }); dg.rotateX(Math.PI / 2); add(dg, T2, 0, sheerY(0.78) - 0.35, 0, HG);
  const bs = add(new THREE.CylinderGeometry(0.1, 0.2, 2.8, 8), TD, 0, 0, 0, HG); bs.position.set(0, sheerY(1) + 0.4, LH + 1.1); bs.rotation.x = Math.PI / 2 - 0.35;
//@include _extras.js
