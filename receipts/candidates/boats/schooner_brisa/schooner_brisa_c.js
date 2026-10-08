// schooner_brisa, candidate B: half-lathe hull revolved about z with the sheer warped in, gilt beads for trim; same rig as A.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const hullM = M(0x2a3c82, 0.28, 0, null, { side: THREE.DoubleSide });
  const trimM = M(0xd9a441, 0.3, 0.75, 'metal', { side: THREE.DoubleSide });
  const teak = M(0xa8652f, 0.55, 0, 'timber');
  const deckM = M(0xc89a62, 0.65, 0, 'timber', { side: THREE.DoubleSide });
  const brass = M(0xc9a043, 0.3, 0.8, 'metal');
  const steel = M(0x8f9aa3, 0.3, 0.7, 'metal');
  const canvas = M(0xf4ead2, 0.85, 0, 'fabric', { side: THREE.DoubleSide });
  const dark = M(0x5a3a22, 0.7, 0, 'timber');
  const ropeM = M(0xb59a6a, 0.85, 0, 'fabric');
  const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); if (name) m.name = name; g.add(m); return m; };
  // ---- hull: lift-built like a carved toy, seven stacked waterplane slices (bevelled extrusions) ----
  const L = 13, ZS = -6.5, ST = 52;
  const half = (t) => t < 0.45 ? 2.0 - 0.9 * Math.pow((0.45 - t) / 0.45, 1.8) : 2.0 * Math.pow(Math.max(0, 1 - Math.pow((t - 0.45) / 0.55, 2.2)), 0.8);
  const sheer0 = (t) => t < 0.4 ? 2.5 + 0.25 * Math.pow((0.4 - t) / 0.4, 2) : 2.5 + 0.55 * Math.pow((t - 0.4) / 0.6, 2);
  const bottom = (t) => t < 0.32 ? 0.45 + 1.25 * Math.pow((0.32 - t) / 0.32, 1.5) : t > 0.58 ? 0.45 + (2.35 - 0.45) * Math.pow((t - 0.58) / 0.42, 1.9) : 0.45;
  const WL = 1.05, TOP = 2.36;
  const N = 0.62, MM = 1.7;
  const zOf = (t) => ZS + t * L, tAt = (z) => (z - ZS) / L;
  const aOf = (t, y) => { const ys = sheer0(t), yb = bottom(t); const q = Math.min(1, Math.max(0, (ys - y) / Math.max(1e-4, ys - yb))); return Math.acos(Math.pow(q, 1 / MM)); };
  const xAt = (t, y) => half(t) * Math.pow(Math.sin(aOf(t, y)), N);
  const outline = (y) => { const R = []; for (let i = 0; i <= ST; i++) { const t = i / ST; if (bottom(t) >= y - 0.005) continue; R.push([Math.max(0.01, xAt(t, y)), zOf(t)]); } return R; };
  const slab = (y0, y1, yo, mat, name) => {
    const R = outline(yo); if (R.length < 2) return;
    const sh = new THREE.Shape(); sh.moveTo(R[0][0], -R[0][1]); for (const [x, z] of R.slice(1)) sh.lineTo(x, -z);
    for (let k = R.length - 1; k >= 0; k--) sh.lineTo(-R[k][0], -R[k][1]); sh.closePath();
    const bv = Math.min(0.04, (y1 - y0) * 0.25);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0 - 2 * bv, bevelEnabled: true, bevelThickness: bv, bevelSize: bv * 0.8, bevelSegments: 2, curveSegments: 4 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, y0 + bv, 0); return add(geo, mat, name || 'hull');
  };
  const LAY = [[0.42, 0.7, 0.62, hullM], [0.7, 0.98, 0.9, hullM], [0.98, 1.13, 1.08, trimM], [1.13, 1.5, 1.42, hullM], [1.5, 1.86, 1.8, hullM], [1.86, 2.14, 2.12, hullM], [2.14, TOP, TOP, trimM]];
  for (const [y0, y1, yo, mat] of LAY) slab(y0, y1, yo, mat);
  const sheer = () => TOP;
  const deckY = () => TOP + 0.06;
  slab(TOP - 0.01, TOP + 0.06, TOP, deckM, 'deck');
  const dY = () => TOP + 0.06;
  // rails built from straight rods with ball joints (no tubes)
  const rod = (a, b, r, mat, rs, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r2 == null ? r : r2, r, d.length(), rs || 6, 1), mat);
    m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  const tube = (pts, r, mat) => { for (let i = 0; i + 1 < pts.length; i++) { rod(pts[i], pts[i + 1], r, mat, 6); if (i) { const k = add(new THREE.SphereGeometry(r * 1.05, 6, 4), mat); k.position.set(...pts[i]); } } };
  // a chunky teak capping rail round the deck edge
  { const R = outline(TOP); const pts = R.map(([x, z]) => [x * 0.99, TOP + 0.1, z]).concat(R.slice().reverse().map(([x, z]) => [-x * 0.99, TOP + 0.1, z])); pts.push(pts[0]);
    const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.1); add(new THREE.TubeGeometry(cv, 140, 0.06, 6, false), teak); }

  // ---- long keel with an attached rudder (extruded side profile) ----
  {
    const sh = new THREE.Shape(); sh.moveTo(-3.7, 0.62); sh.lineTo(3.5, 0.62); sh.lineTo(3.5, 0.04); sh.lineTo(-1.6, 0.04); sh.quadraticCurveTo(-3.0, 0.1, -3.7, 0.62);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2, curveSegments: 8 });
    geo.translate(0, 0, -0.12); geo.rotateY(Math.PI / 2); add(geo, hullM, 'keel');
    const r = new THREE.Shape(); r.moveTo(3.5, 0.05); r.lineTo(4.05, 0.12); r.quadraticCurveTo(4.25, 0.9, 4.0, 1.75); r.lineTo(3.5, 1.75); r.closePath();
    const rg = new THREE.ExtrudeGeometry(r, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 6 });
    rg.translate(0, 0, -0.06); rg.rotateY(Math.PI / 2); add(rg, hullM, 'rudder');
  }
  const tA = (z) => Math.min(1, Math.max(0, (z - ZS) / L));
  const sideX = (z) => half(tA(z)) * 0.9;
  // ---- teak caprail on turned posts (a classic bulwark rail), gilt scrolls at the bow ----
  {
    const zs = []; for (let z = ZS + L - 0.9; z > ZS + 0.3; z -= 0.75) zs.push(z);
    for (const s of [1, -1]) { const top = [];
      for (const z of zs) { const x = s * sideX(z); rod([x, dY(z, x) - 0.02, z], [x, dY(z, x) + 0.42, z], 0.035, teak, 6); top.push([x, dY(z, x) + 0.44, z]); }
      top.unshift([s * 0.12, dY(ZS + L - 0.35) + 0.44, ZS + L - 0.35]); top.push([s * sideX(ZS + 0.25) * 0.8, dY(ZS + 0.25) + 0.44, ZS + 0.25]);
      tube(top, 0.055, teak, 80); }
    const zb = ZS + 0.25; tube([[-sideX(zb) * 0.8, dY(zb) + 0.44, zb], [0, dY(zb) + 0.46, zb - 0.05], [sideX(zb) * 0.8, dY(zb) + 0.44, zb]], 0.055, teak, 10);
    for (const s of [1, -1]) { const pts = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2.2, r = 0.32 * (1 - i / 18); const z = ZS + L - 1.3 + Math.cos(a) * r - 0.2 * i / 14, y = sheer(0.92) - 0.42 + Math.sin(a) * r * 0.6;
      pts.push([s * (half(tA(z)) * 1.0 + 0.03), y, z]); } tube(pts, 0.035, trimM, 40); }
  }
  // ---- deckhouse aft, skylight between the masts, wheel, windlass forward of the captain's spot ----
  {
    const z0 = -4.7, z1 = -2.35, w = 1.0, h = 0.55, by = dY(-3.5, 0) - 0.05;
    const sh = new THREE.Shape(); sh.moveTo(-w, 0); sh.lineTo(w, 0); sh.lineTo(w, h); sh.quadraticCurveTo(0, h + 0.14, -w, h); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 8 });
    geo.translate(0, by, z0); add(geo, teak, 'deckhouse');
    for (const s of [1, -1]) for (let i = 0; i < 3; i++) { const z = z0 + 0.45 + i * 0.7; const ring = add(new THREE.TorusGeometry(0.08, 0.025, 6, 14), brass); ring.position.set(s * (w + 0.06), by + 0.3, z); ring.rotation.y = Math.PI / 2;
      const gl = add(new THREE.CircleGeometry(0.07, 12), M(0x2d3e4a, 0.15, 0.3)); gl.position.set(s * (w + 0.055), by + 0.3, z); gl.rotation.y = s * Math.PI / 2; }
    const sk = add(new THREE.BoxGeometry(0.9, 0.3, 0.8), teak); sk.position.set(0, dY(0.2) + 0.15, 0.2);
    for (const s of [1, -1]) { const gl = add(new THREE.BoxGeometry(0.42, 0.04, 0.7), M(0x2d3e4a, 0.15, 0.3)); gl.position.set(s * 0.21, dY(0.2) + 0.36, 0.2); gl.rotation.z = -s * 0.35; }
    const wz = -5.55, y0 = dY(wz), wy = y0 + 0.95;
    rod([0, y0, wz - 0.1], [0, wy, wz], 0.08, teak, 10);
    const rim = add(new THREE.TorusGeometry(0.5, 0.04, 6, 28), teak); rim.position.set(0, wy, wz);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; rod([0, wy, wz + 0.02], [Math.cos(a) * 0.64, wy + Math.sin(a) * 0.64, wz + 0.02], 0.022, teak, 5); }
    const hub = add(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 10), brass); hub.rotation.x = Math.PI / 2; hub.position.set(0, wy, wz + 0.03);
    const wl = add(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12), brass); wl.rotation.z = Math.PI / 2; wl.position.set(0, dY(5.15) + 0.22, 5.15);
    for (const s of [1, -1]) { const c = add(new THREE.BoxGeometry(0.08, 0.36, 0.3), teak); c.position.set(s * 0.4, dY(5.15) + 0.18, 5.15); }
  }
  // ---- bowsprit ----
  const stemZ = ZS + L - 0.1, stemY = sheer(1) + 0.08, bsTip = [0, stemY + 0.45, stemZ + 2.3];
  rod([0, stemY - 0.05, stemZ - 1.0], bsTip, 0.11, teak, 10, 0.07);
  rod(bsTip, [0, 1.25, stemZ - 0.25], 0.015, steel, 4);
  { const c = add(new THREE.SphereGeometry(0.09, 8, 6), trimM); c.position.set(...bsTip); }
  // ---- masts: foremast and taller mainmast, each with a topmast ----
  const FZ = 1.9, MZ = -1.5, FB = dY(FZ), MB = dY(MZ), FT = FB + 12.2, MT = MB + 13.6;
  const mast = (z, b, t) => { rod([0, b - 0.05, z], [0, t - 2.4, z], 0.13, teak, 12, 0.1); rod([0, t - 2.6, z], [0, t, z], 0.075, teak, 8, 0.05);
    const cap = add(new THREE.BoxGeometry(0.3, 0.12, 0.42), dark); cap.position.set(0, t - 2.45, z + 0.06);
    const tr = add(new THREE.BoxGeometry(1.8, 0.07, 0.1), teak); tr.position.set(0, t - 2.6, z);
    const tk = add(new THREE.SphereGeometry(0.08, 8, 6), trimM); tk.position.set(0, t + 0.04, z);
    for (const s of [1, -1]) { const cp = [s * sideX(z - 0.3) * 1.04, dY(z - 0.3, sideX(z - 0.3)) + 0.4, z - 0.3];
      rod(cp, [s * 0.1, t - 2.6, z], 0.014, steel, 4); rod(cp, [s * 0.9, t - 2.6, z], 0.012, steel, 4); rod([s * 0.9, t - 2.6, z], [0, t - 0.2, z], 0.011, steel, 4);
      const ch = add(new THREE.BoxGeometry(0.06, 0.3, 0.14), brass); ch.position.set(s * sideX(z - 0.3) * 1.05, dY(z - 0.3, sideX(z - 0.3)) + 0.25, z - 0.3); } };
  mast(FZ, FB, FT); mast(MZ, MB, MT);
  const W = 0.013;
  rod(bsTip, [0, FT - 0.3, FZ + 0.06], W, steel, 4);          // jib stay
  rod([0, FT - 2.5, FZ - 0.05], [0, MT - 2.5, MZ + 0.08], W, steel, 4);   // spring stay
  rod([0, MT, MZ - 0.05], [0, sheer(0) + 0.5, ZS + 0.4], W, steel, 4);    // backstay
  // ---- gaff sails: cambered quads between boom and gaff ----
  const gaffSail = (z, bootY, boomEnd, throatY, peak, cam) => {
    rod([0, bootY, z - 0.12], [0, bootY + 0.05, boomEnd], 0.075, teak, 8);
    rod([0, throatY, z - 0.12], [0, peak[1], peak[2]], 0.06, teak, 8);
    const U = 10, V = 14, pos = [], idx = [];
    const l0 = [bootY + 0.08, z - 0.16], l1 = [throatY - 0.06, z - 0.16], e0 = [bootY + 0.1, boomEnd + 0.15], e1 = [peak[1] - 0.06, peak[2] + 0.12];
    for (let j = 0; j <= V; j++) { const v = j / V; for (let i = 0; i <= U; i++) { const u = i / U;
      const ly = l0[0] + (l1[0] - l0[0]) * v, lz = l0[1] + (l1[1] - l0[1]) * v, ey = e0[0] + (e1[0] - e0[0]) * v, ez = e0[1] + (e1[1] - e0[1]) * v;
      // top edge follows the gaff: interpolate the luff/leech tops linearly; sag in the middle of the gaff head is small
      const x = cam * (1 - 0.4 * v) * Math.sin(Math.PI * Math.pow(u, 0.85)) * (1 - 0.3 * u);
      pos.push(x, ly + (ey - ly) * u, lz + (ez - lz) * u); } }
    for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) { const a = j * (U + 1) + i, b = a + U + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, canvas, 'sail');
    // seams (cloth panels) as thin stripes on both faces
    for (let k = 1; k < 6; k++) { const u = k / 6; const pts = []; for (let j = 0; j <= 6; j++) { const v = j / 6;
      const ly = l0[0] + (l1[0] - l0[0]) * v, lz = l0[1] + (l1[1] - l0[1]) * v, ey = e0[0] + (e1[0] - e0[0]) * v, ez = e0[1] + (e1[1] - e0[1]) * v;
      pts.push([cam * (1 - 0.4 * v) * Math.sin(Math.PI * Math.pow(u, 0.85)) * (1 - 0.3 * u), ly + (ey - ly) * u, lz + (ez - lz) * u]); }
      tube(pts, 0.012, M(0xe2d5b6, 0.85, 0, 'fabric'), 8); }
  };
  gaffSail(FZ, FB + 1.45, MZ + 0.55, FT - 2.9, [0, FT - 0.9, MZ + 0.9], 0.3);
  gaffSail(MZ, MB + 1.6, ZS - 0.4, MT - 3.0, [0, MT - 0.7, ZS + 1.3], 0.35);
  // ---- jib and flying jib, high-cut so the foredeck stays clear ----
  const headsail = (tack, head, clew, cam) => { const U = 7, V = 10, pos = [], idx = [];
    for (let j = 0; j <= V; j++) { const v = j / V; for (let i = 0; i <= U; i++) { const u = i / U;
      const lz = tack[2] + (head[2] - tack[2]) * v, ly = tack[1] + (head[1] - tack[1]) * v, ez = clew[2] + (head[2] - clew[2]) * v, ey = clew[1] + (head[1] - clew[1]) * v;
      pos.push(cam * (1 - v) * Math.sin(Math.PI * Math.pow(u, 0.8)) * (1 - 0.3 * u), ly + (ey - ly) * u, lz + (ez - lz) * u); } }
    for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) { const a = j * (U + 1) + i, b = a + U + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, canvas, 'jib'); };
  const dFwd = dY(3.25);
  headsail([0, bsTip[1] + 0.25, bsTip[2] - 0.35], [0, FT - 1.6, FZ + 0.45], [0, dFwd + 3.4, FZ + 1.25], 0.25);
  headsail([0, stemY + 1.0, stemZ - 0.2], [0, FT - 4.6, FZ + 0.35], [0, dFwd + 2.6, FZ + 0.75], 0.2);
  rod([0, stemY, stemZ], [0, FT - 4.4, FZ + 0.08], W, steel, 4);
  rod([0, stemY, stemZ], [0, stemY + 1.0, stemZ - 0.2], W, steel, 4);
  for (const s of [1, -1]) rod([0, dFwd + 2.6, FZ + 0.75], [s * sideX(-0.2), dY(-0.2) + 0.45, -0.2], 0.012, ropeM, 4);
  rod([0, MB + 1.6, ZS + 0.2], [0, sheer(0) + 0.2, ZS + 0.5], 0.014, ropeM, 4);

  // ---- placement ----
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
