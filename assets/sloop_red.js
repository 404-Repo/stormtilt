// sloop_red, candidate A: lofted hull (custom BufferGeometry from 48 stations, painted in y-bands),
// cambered grid sails, tube rails. Bow +Z, keel bottom y=0, metres.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const red = M(0xd7372f, 0.3, 0, null, { side: THREE.DoubleSide });
  const white = M(0xf3eee3, 0.3, 0, null, { side: THREE.DoubleSide });
  const teak = M(0xa8652f, 0.6, 0, 'timber');
  const deckM = M(0xc89a62, 0.65, 0, 'timber', { side: THREE.DoubleSide });
  const brass = M(0xc9a043, 0.3, 0.8, 'metal');
  const steel = M(0x8f9aa3, 0.3, 0.7, 'metal');
  const canvas = M(0xf4ead2, 0.85, 0, 'fabric', { side: THREE.DoubleSide });
  const starM = M(0xd7372f, 0.6, 0, 'fabric', { side: THREE.DoubleSide });
  const dark = M(0x5a3a22, 0.7, 0, 'timber');
  const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); if (name) m.name = name; g.add(m); return m; };

  // ---- hull lines (t: 0 stern .. 1 bow) ----
  const L = 12, ZS = -6, ST = 48;
  const half = (t) => t < 0.42 ? 1.95 - 0.5 * Math.pow((0.42 - t) / 0.42, 2)
    : 1.95 * Math.pow(Math.max(0, 1 - Math.pow((t - 0.42) / 0.58, 2.2)), 0.8);
  const sheer = (t) => t < 0.35 ? 2.25 + 0.5 * (0.35 - t) * (0.35 - t) : 2.25 + 0.9 * (t - 0.35) * (t - 0.35);
  const bottom = (t) => t < 0.3 ? 0.45 + 0.7 * Math.pow((0.3 - t) / 0.3, 1.6)
    : t > 0.6 ? 0.45 + (sheer(1) - 0.08 - 0.45) * Math.pow((t - 0.6) / 0.4, 2.2) : 0.45;
  const N = 0.62, MM = 1.7;
  const zOf = (t) => ZS + t * L;
  const aOf = (t, y) => { const ys = sheer(t), yb = bottom(t); const q = Math.min(1, Math.max(0, (ys - y) / Math.max(1e-4, ys - yb))); return Math.acos(Math.pow(q, 1 / MM)); };
  const pt = (t, a) => { const ys = sheer(t), yb = bottom(t); return [half(t) * Math.pow(Math.sin(a), N), ys - (ys - yb) * Math.pow(Math.cos(a), MM)]; };
  // a band of hull surface between y=lo(t) and y=hi(t), both sides
  const band = (lo, hi, segs, mat, off) => {
    const pos = [], idx = [];
    for (const s of [1, -1]) {
      const base = pos.length / 3;
      for (let i = 0; i <= ST; i++) {
        const t = i / ST; const a0 = aOf(t, lo(t)), a1 = aOf(t, hi(t));
        for (let j = 0; j <= segs; j++) { const [x, y] = pt(t, a0 + (a1 - a0) * j / segs); pos.push(s * (x + (off || 0) * Math.sin(a0 + (a1 - a0) * j / segs)), y, zOf(t)); }
      }
      for (let i = 0; i < ST; i++) for (let j = 0; j < segs; j++) {
        const a = base + i * (segs + 1) + j, b = a + segs + 1;
        if (s < 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return add(geo, mat, 'hull');
  };
  const WL = 1.05;
  band((t) => bottom(t), () => WL - 0.07, 12, red);
  band(() => WL - 0.07, () => WL + 0.09, 2, white);
  band(() => WL + 0.09, (t) => sheer(t) - 0.2, 6, red);
  band((t) => sheer(t) - 0.2, (t) => sheer(t) - 0.11, 1, white);
  band((t) => sheer(t) - 0.11, (t) => sheer(t), 1, red);
  // transom (flat, closes the stern section)
  {
    const pos = [0, (sheer(0) + bottom(0)) / 2, ZS], K = 16; const idx = [];
    for (let j = 0; j <= K; j++) { const [x, y] = pt(0, (Math.PI / 2) * j / K); pos.push(x, y, ZS); }
    for (let j = K; j >= 0; j--) { const [x, y] = pt(0, (Math.PI / 2) * j / K); pos.push(-x, y, ZS); }
    const n = pos.length / 3; for (let i = 1; i < n - 1; i++) idx.push(0, i + 1, i);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, red, 'hull');
  }
  // deck, cambered, one strip per station
  const CAMB = 0.1;
  const deckY = (t, x) => { const b = Math.max(1e-3, half(t)); return sheer(t) + CAMB * (1 - (x / b) * (x / b)); };
  {
    const pos = [], idx = [], K = 8;
    for (let i = 0; i <= ST; i++) { const t = i / ST, b = half(t); for (let k = 0; k <= K; k++) { const x = -b + 2 * b * k / K; pos.push(x, deckY(t, x), zOf(t)); } }
    for (let i = 0; i < ST; i++) for (let k = 0; k < K; k++) { const a = i * (K + 1) + k, b = a + K + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, deckM, 'deck');
  }
  const tAt = (z) => (z - ZS) / L;
  const dY = (z, x) => deckY(Math.min(1, Math.max(0, tAt(z))), x || 0);
  // tube helpers
  const tube = (pts, r, mat, seg) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg || 40, r, 6, false), mat);
  const rod = (a, b, r, mat, rs, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r2 == null ? r : r2, r, d.length(), rs || 6, 1), mat);
    m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  // toe rails along the sheer
  for (const s of [1, -1]) { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24 * 0.995; pts.push([s * half(t) * 0.985, sheer(t) + 0.04, zOf(t)]); } tube(pts, 0.055, teak, 60); }
  tube([[-half(0) * 0.985, sheer(0) + 0.04, ZS + 0.02], [0, sheer(0) + 0.07, ZS + 0.02], [half(0) * 0.985, sheer(0) + 0.04, ZS + 0.02]], 0.055, teak, 12);

  // ---- keel and rudder (extruded side profiles) ----
  {
    const sh = new THREE.Shape(); sh.moveTo(-1.5, 0.55); sh.lineTo(1.1, 0.55); sh.lineTo(0.35, 0.1); sh.quadraticCurveTo(0.3, 0.04, 0.15, 0.04); sh.lineTo(-0.9, 0.04); sh.quadraticCurveTo(-1.05, 0.04, -1.08, 0.12); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 6 });
    geo.translate(0, 0, -0.09); geo.rotateY(Math.PI / 2); add(geo, red, 'keel');
    const r = new THREE.Shape(); r.moveTo(-0.45, 1.25); r.lineTo(0.1, 1.25); r.lineTo(0.05, 0.42); r.quadraticCurveTo(-0.1, 0.3, -0.3, 0.38); r.closePath();
    const rg = new THREE.ExtrudeGeometry(r, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 6 });
    rg.translate(0, 0, -0.05); rg.rotateY(Math.PI / 2); rg.translate(0, 0, -4.9); add(rg, red, 'rudder');
  }

  // ---- cabin (rounded-section extrusion) ----
  const CZ0 = -2.3, CZ1 = 0.55, CW = 1.05, CH = 0.55;
  {
    const by = dY(-1, 0) - 0.06;
    const sh = new THREE.Shape(); const r = 0.12;
    sh.moveTo(-CW, 0); sh.lineTo(CW, 0); sh.lineTo(CW, CH - r); sh.quadraticCurveTo(CW, CH, CW - r, CH + 0.02);
    sh.quadraticCurveTo(0, CH + 0.14, -CW + r, CH + 0.02); sh.quadraticCurveTo(-CW, CH, -CW, CH - r); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: CZ1 - CZ0 - 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 2, curveSegments: 8 });
    geo.translate(0, by, CZ0 + 0.05); add(geo, teak, 'cabin');
    // portholes
    for (const s of [1, -1]) for (let i = 0; i < 4; i++) {
      const z = CZ0 + 0.45 + i * 0.6; const ring = add(new THREE.TorusGeometry(0.08, 0.025, 6, 14), brass); ring.position.set(s * (CW + 0.035), by + 0.3, z); ring.rotation.y = Math.PI / 2;
      const gl = add(new THREE.CircleGeometry(0.07, 12), M(0x2d3e4a, 0.15, 0.3)); gl.position.set(s * (CW + 0.03), by + 0.3, z); gl.rotation.y = s * Math.PI / 2;
    }
    // sliding hatch + dorade vents on the cabin top
    const h = add(new THREE.BoxGeometry(0.75, 0.12, 0.8), teak); h.position.set(0, by + CH + 0.2, CZ0 + 0.7);
    const h2 = add(new THREE.BoxGeometry(0.6, 0.1, 0.55), dark); h2.position.set(0, by + CH + 0.16, CZ1 - 0.6);
    for (const s of [1, -1]) { const v = add(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10), brass); v.position.set(s * 0.6, by + CH + 0.18, CZ1 - 0.35);
      const c = add(new THREE.TorusGeometry(0.07, 0.04, 6, 10, Math.PI), brass); c.position.set(s * 0.6, by + CH + 0.29, CZ1 - 0.35 + 0.0); c.rotation.y = Math.PI / 2; }
  }
  // ---- cockpit: coamings, sole, wheel, winches ----
  {
    const z0 = -5.2, z1 = -2.35, w = 0.95, y0 = dY(-3.8, 0);
    for (const s of [1, -1]) { const c = add(new THREE.BoxGeometry(0.08, 0.32, z1 - z0), teak); c.position.set(s * w, y0 + 0.12, (z0 + z1) / 2); }
    const sole = add(new THREE.BoxGeometry(2 * w - 0.08, 0.05, z1 - z0 - 0.1), dark, 'deck_cockpit'); sole.position.set(0, y0 + 0.02, (z0 + z1) / 2);
    for (const s of [1, -1]) { const b = add(new THREE.BoxGeometry(0.42, 0.28, 2.0), teak); b.position.set(s * (w - 0.25), y0 + 0.16, -3.6); }
    // wheel
    const wz = -4.75, wy = y0 + 0.95;
    const ped = rod([0, y0, wz - 0.1], [0, wy, wz], 0.07, steel, 10);
    const rim = add(new THREE.TorusGeometry(0.5, 0.035, 6, 28), teak); rim.position.set(0, wy, wz);
    const hub = add(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), brass); hub.rotation.x = Math.PI / 2; hub.position.set(0, wy, wz + 0.02);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; rod([0, wy, wz + 0.02], [Math.cos(a) * 0.62, wy + Math.sin(a) * 0.62, wz + 0.02], 0.022, teak, 5); }
    // winches on the coaming tops
    for (const s of [1, -1]) for (const z of [-2.7, -4.3]) {
      const d = add(new THREE.CylinderGeometry(0.11, 0.14, 0.2, 14), steel); d.position.set(s * (w + 0.0), y0 + 0.38, z);
      const tp = add(new THREE.CylinderGeometry(0.06, 0.1, 0.06, 12), steel); tp.position.set(s * w, y0 + 0.51, z);
    }
  }

  // ---- rig ----
  const MZ = 0.9, MB = dY(MZ, 0), MT = MB + 13.4;
  rod([0, MB - 0.05, MZ], [0, MT, MZ], 0.12, teak, 12, 0.075);
  const mastCap = add(new THREE.SphereGeometry(0.1, 10, 6), brass); mastCap.position.set(0, MT + 0.03, MZ);
  // spreaders
  const SPY = MB + 7.2; rod([-1.1, SPY, MZ], [1.1, SPY, MZ], 0.045, teak, 6);
  // boom
  const BY = MB + 1.75, BZ1 = -4.6; rod([0, BY, MZ - 0.1], [0, BY - 0.12, BZ1], 0.085, teak, 10, 0.07);
  const gn = add(new THREE.SphereGeometry(0.1, 8, 6), brass); gn.position.set(0, BY, MZ - 0.12);
  // standing rigging
  const W = 0.013;
  const stemZ = ZS + L - 0.12, stemY = sheer(1) + 0.08;
  rod([0, stemY, stemZ], [0, MT - 0.4, MZ + 0.05], W, steel, 4); // forestay
  rod([0, MT, MZ - 0.05], [0, sheer(0) + 0.1, ZS + 0.15], W, steel, 4); // backstay
  for (const s of [1, -1]) {
    const cp = [s * half(tAt(MZ)) * 0.93, dY(MZ, half(tAt(MZ)) * 0.93) + 0.05, MZ - 0.25];
    rod(cp, [s * 1.1, SPY, MZ], W, steel, 4); rod([s * 1.1, SPY, MZ], [s * 0.08, MT - 0.6, MZ], W, steel, 4);
    rod(cp, [s * 0.08, SPY - 0.05, MZ], W, steel, 4);
    const pl = add(new THREE.BoxGeometry(0.05, 0.16, 0.12), steel); pl.position.set(cp[0], cp[1] + 0.05, cp[2]);
  }
  // mainsail: cambered grid between mast and boom, roach on the leech
  const camber = 0.32;
  const mainLuffZ = MZ - 0.14, mainY0 = BY + 0.08, mainH = MT - 0.5 - mainY0, mainW = mainLuffZ - (BZ1 + 0.15);
  const mainWidth = (v) => mainW * (1 - v) + 0.55 * Math.sin(Math.PI * v) * (1 - v * 0.3);
  const mainX = (u, v) => camber * (1 - 0.6 * v) * Math.sin(Math.PI * Math.pow(u, 0.8)) * (1 - 0.35 * u);
  {
    const U = 10, V = 16, pos = [], idx = [];
    for (let j = 0; j <= V; j++) { const v = j / V; for (let i = 0; i <= U; i++) { const u = i / U; pos.push(mainX(u, v), mainY0 + v * mainH, mainLuffZ - u * mainWidth(v)); } }
    for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) { const a = j * (U + 1) + i, b = a + U + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, canvas, 'mainsail');
    // battens
    for (const v of [0.25, 0.48, 0.7, 0.88]) { const w = mainWidth(v); const pts = []; for (let i = 0; i <= 4; i++) { const u = 0.6 + 0.4 * i / 4; pts.push([mainX(u, v), mainY0 + v * mainH, mainLuffZ - u * w]); }
      tube(pts, 0.025, M(0xe6dabd, 0.8, 0, 'fabric'), 6); }
    // red star, projected onto the sail surface on both faces
    const star = new THREE.Shape(); const R = 0.95, r = 0.4;
    for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r : R; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (k) star.lineTo(x, y); else star.moveTo(x, y); }
    star.closePath();
    const cv = 0.6, cy = mainY0 + cv * mainH, cz = mainLuffZ - 0.42 * mainWidth(cv);
    for (const s of [1, -1]) {
      const sg = new THREE.ShapeGeometry(star, 1); const p = sg.attributes.position;
      for (let i = 0; i < p.count; i++) { const zz = cz - p.getX(i) * s, yy = cy + p.getY(i); const v = (yy - mainY0) / mainH; const u = (mainLuffZ - zz) / mainWidth(v);
        p.setXYZ(i, mainX(u, v) + s * 0.03, yy, zz); }
      sg.computeVertexNormals(); add(sg, starM, 'star');
    }
  }
  // jib: high-cut foot so the foredeck stays clear for the captain
  {
    const tack = [0, stemY + 0.65, stemZ - 0.25], head = [0, MT - 1.4, MZ + 0.3], clew = [0, MB + 2.4, MZ + 0.6];
    const U = 8, V = 12, pos = [], idx = [];
    for (let j = 0; j <= V; j++) { const v = j / V; for (let i = 0; i <= U; i++) { const u = i / U;
      // bilinear from luff (tack->head) to leech (clew->head)
      const lz = tack[2] + (head[2] - tack[2]) * v, ly = tack[1] + (head[1] - tack[1]) * v;
      const ez = clew[2] + (head[2] - clew[2]) * v, ey = clew[1] + (head[1] - clew[1]) * v;
      const x = 0.28 * (1 - v) * Math.sin(Math.PI * Math.pow(u, 0.8)) * (1 - 0.3 * u);
      pos.push(x, ly + (ey - ly) * u, lz + (ez - lz) * u); } }
    for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) { const a = j * (U + 1) + i, b = a + U + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, canvas, 'jib');
    rod([0, stemY, stemZ], [0, tack[1], tack[2]], 0.012, steel, 4);
    // jib sheets to the cockpit winches
    for (const s of [1, -1]) rod([0.05 * s, clew[1], clew[2]], [s * 0.95, dY(-2.7, 0) + 0.48, -2.7], 0.012, M(0xb59a6a, 0.85, 0, 'fabric'), 4);
  }
  // mainsheet
  rod([0, BY - 0.12, BZ1 + 0.4], [0, dY(-5, 0) + 0.1, -5.0], 0.015, M(0xb59a6a, 0.85, 0, 'fabric'), 4);

  // ---- bow pulpit, stanchions, lifelines, stern pushpit ----
  const RH = 0.62;
  const pulZ0 = ZS + L - 1.35;
  const sideX = (z) => half(tAt(z)) * 0.88;
  {
    const pts = []; const tip = ZS + L - 0.3;
    for (const s of [-1, 1]) {}
    pts.push([-sideX(pulZ0), dY(pulZ0) + RH, pulZ0], [-sideX(tip - 0.45) * 0.9, dY(tip - 0.45) + RH + 0.02, tip - 0.4], [0, dY(tip) + RH + 0.04, tip], [sideX(tip - 0.45) * 0.9, dY(tip - 0.45) + RH + 0.02, tip - 0.4], [sideX(pulZ0), dY(pulZ0) + RH, pulZ0]);
    tube(pts, 0.03, steel, 24);
    const mid = pts.map((p) => [p[0], p[1] - 0.3, p[2]]); tube(mid, 0.022, steel, 24);
    for (const p of [pts[0], pts[1], pts[3], pts[4]]) rod([p[0], dY(p[2], p[0]) - 0.02, p[2]], p, 0.028, steel, 6);
    const pp = [[0, dY(tip), tip + 0.05]]; rod([0, dY(tip) - 0.02, tip - 0.05], [0, dY(tip) + RH + 0.03, tip - 0.02], 0.028, steel, 6);
  }
  // stanchions every ~1.5 m down each side, lifelines through them
  {
    const zs = []; for (let z = pulZ0 - 1.5; z > ZS + 0.6; z -= 1.55) zs.push(z); zs.push(ZS + 0.45);
    for (const s of [1, -1]) {
      const top = [[s * sideX(pulZ0), dY(pulZ0) + RH, pulZ0]], midl = [[s * sideX(pulZ0), dY(pulZ0) + RH - 0.3, pulZ0]];
      for (const z of zs) { const x = s * sideX(z); rod([x, dY(z, x) - 0.02, z], [x, dY(z, x) + RH, z], 0.022, steel, 6);
        const base = add(new THREE.CylinderGeometry(0.045, 0.05, 0.05, 8), steel); base.position.set(x, dY(z, x) + 0.01, z);
        top.push([x, dY(z, x) + RH, z]); midl.push([x, dY(z, x) + RH - 0.3, z]); }
      tube(top, 0.012, steel, 50); tube(midl, 0.012, steel, 50);
    }
    // pushpit across the stern
    const z = ZS + 0.45, x = sideX(z);
    tube([[-x, dY(z, x) + RH, z], [-x * 0.6, dY(z) + RH, z - 0.25], [0, dY(z) + RH, z - 0.3], [x * 0.6, dY(z) + RH, z - 0.25], [x, dY(z, x) + RH, z]], 0.03, steel, 20);
  }
  // mooring cleats (aft and at the bow, outboard, clear of the captain spot)
  for (const s of [1, -1]) for (const z of [ZS + 1.0, ZS + L - 1.0]) {
    const x = s * sideX(z) * 0.85; const c = add(new THREE.BoxGeometry(0.06, 0.06, 0.28), brass); c.position.set(x, dY(z, x) + 0.06, z);
  }

  // ---- placement: base y=0, centred on x and z ----
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
