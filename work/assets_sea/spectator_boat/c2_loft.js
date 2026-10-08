// spectator_boat, candidate 2: lofted hull from height-parametrised sections (custom BufferGeometry), cobalt below a sheer
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
  const white = M(0xf3eee3), cobalt = M(0x2a5bd7), redM = M(0xd7372f), sunM = M(0xf2b630), dark = M(0x2a2830, { roughness: 0.5 });
  const teak = M(0xa8652f, { roughness: 0.6 }); teak.name = 'timber'; const deckM = M(0xc89a62, { roughness: 0.65 }); deckM.name = 'timber';
  const steel = M(0x8f9aa3, { metalness: 0.7, roughness: 0.3 }); steel.name = 'metal'; const glassM = M(0x2a3550, { roughness: 0.15 }); const rope = M(0xb59a6a, { roughness: 0.8 });
// line and white above, with a gilt-free teak rubbing tube
  const DECKY = 1.35, BOWLIFT = 0.25, L2 = 4.0, B2 = 1.4;
  const hb = (z) => { const s = z / L2; return s >= 0 ? B2 * Math.pow(Math.max(0, 1 - Math.pow(s, 2.2)), 0.55) : B2 * (1 - 0.1 * s * s); };
  const ky = (z) => { const s = z / L2; return s > 0.3 ? 0.9 * Math.pow((s - 0.3) / 0.7, 1.8) : s < -0.85 ? 0.25 * (-s - 0.85) / 0.15 : 0; };
  const ty = (z) => 1.6 + 0.3 * Math.max(0, z / L2) ** 2;
  const X = (z, y) => { const k = ky(z), r = Math.min(1, Math.max(0, (y - k) / Math.max(0.2, 1.3 - k))); return hb(z) * Math.pow(1 - Math.pow(1 - r, 2.4), 1 / 2.4); };
  const ZS = []; for (let i = 0; i <= 30; i++) ZS.push(-L2 + 2 * L2 * (0.5 - 0.5 * Math.cos(Math.PI * i / 30)));
  const band = (y0, y1, mat, nh) => { for (const side of [-1, 1]) { const pos = [], idx = [];
    ZS.forEach((z) => { const a = Math.max(y0, ky(z)), b = Math.max(a, Math.min(y1, ty(z))); for (let j = 0; j <= nh; j++) { const y = a + (b - a) * j / nh; pos.push(side * X(z, y), y, z); } });
    for (let i = 0; i < ZS.length - 1; i++) for (let j = 0; j < nh; j++) { const p = i * (nh + 1) + j, q = p + nh + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, mat); } };
  cobalt.side = THREE.DoubleSide; white.side = THREE.DoubleSide;
  band(0, 0.95, cobalt, 5); band(0.95, 3, white, 3);
  for (const side of [-1, 1]) add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ZS.map((z) => new THREE.Vector3(side * (X(z, 0.95) + 0.03), Math.max(0.95, ky(z)), z))), 30, 0.06, 4), teak);
  for (const side of [-1, 1]) add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ZS.map((z) => new THREE.Vector3(side * X(z, ty(z)), ty(z), z))), 30, 0.05, 4), teak);
  { const sh = new THREE.Shape(), z = -L2, n = 8; sh.moveTo(0, ky(z)); for (let j = 1; j <= n; j++) { const y = ky(z) + (ty(z) - ky(z)) * j / n; sh.lineTo(X(z, y), y); } for (let j = n; j >= 1; j--) { const y = ky(z) + (ty(z) - ky(z)) * j / n; sh.lineTo(-X(z, y), y); } add(new THREE.ShapeGeometry(sh), cobalt, 0, 0, z); }
  { const pos = [], idx = []; ZS.forEach((z) => { const w = X(z, DECKY) * 0.97; pos.push(-w, DECKY, z, w, DECKY, z); }); for (let i = 0; i < ZS.length - 1; i++) { const p = i * 2; idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, deckM).material.side = THREE.DoubleSide; }
  // ---- shared upperworks: cabin, cockpit benches, seated toy spectators, striped canopy, bunting ----
  const D = DECKY;
  add(new THREE.BoxGeometry(2.0, 0.95, 1.9), white, 0, D + 0.47, 1.5);
  add(new THREE.BoxGeometry(2.15, 0.12, 2.1), white, 0, D + 1.0, 1.45);
  const ws = add(new THREE.BoxGeometry(1.9, 0.5, 0.08), glassM, 0, D + 1.2, 0.55); ws.rotation.x = -0.35;
  for (const s of [-1, 1]) for (const z of [1.1, 1.9]) add(new THREE.BoxGeometry(0.06, 0.38, 0.55), glassM, s * 1.0, D + 0.62, z);
  add(new THREE.BoxGeometry(0.7, 0.38, 0.06), glassM, -0.45, D + 0.62, 2.46); add(new THREE.BoxGeometry(0.7, 0.38, 0.06), glassM, 0.45, D + 0.62, 2.46);
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.5, 0.42, 3.6), teak, s * 0.98, D + 0.21, -1.6); add(new THREE.BoxGeometry(0.1, 0.5, 3.6), teak, s * 1.2, D + 0.6, -1.6); }
  add(new THREE.BoxGeometry(1.5, 0.42, 0.5), teak, 0, D + 0.21, -3.45);
  // spectators: seated toy figures facing outboard
  const coats = [cobalt, sunM, redM, M(0x3e8a5a), cobalt], skins = [0xf1c7a0, 0xc68b5e, 0x8a5a3c, 0xf1c7a0, 0xc68b5e].map((c) => M(c, { roughness: 0.6 }));
  [[1, -0.6, 0], [1, -2.3, 1], [-1, -1.2, 2], [-1, -2.8, 3], [0, -3.45, 4]].forEach(([s, z, i]) => {
    const f = new THREE.Group(); f.position.set(s * 0.98, D + 0.42, z); f.rotation.y = s === 0 ? Math.PI : s * Math.PI / 2; g.add(f);
    add(new THREE.CylinderGeometry(0.2, 0.24, 0.55, 8), coats[i], 0, 0.28, 0, f);
    add(new THREE.SphereGeometry(0.19, 10, 8), skins[i], 0, 0.75, 0, f);
    for (const e of [-1, 1]) add(new THREE.SphereGeometry(0.035, 6, 4), dark, e * 0.07, 0.78, 0.17, f);
    for (const a of [-1, 1]) { const arm = add(new THREE.CylinderGeometry(0.065, 0.065, 0.42, 6), coats[i], a * 0.27, 0.3, 0.08, f); arm.rotation.x = -0.6; arm.rotation.z = a * 0.2; }
    for (const l of [-1, 1]) add(new THREE.BoxGeometry(0.13, 0.13, 0.42), dark, l * 0.1, 0.02, 0.25, f);
    if (i % 2 === 0) { add(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), i ? sunM : dark, 0, 0.9, 0, f); add(new THREE.CylinderGeometry(0.13, 0.15, 0.16, 10), i ? sunM : dark, 0, 0.99, 0, f); }
    else add(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), redM, 0, 0.78, 0, f); });
  // canopy: posts + seven alternating stripes, valance
  const cz0 = -3.7, cz1 = 0.35, ctop = D + 2.15;
  for (const s of [-1, 1]) for (const z of [cz0, cz1]) add(new THREE.CylinderGeometry(0.045, 0.045, ctop - D, 6), steel, s * 1.25, D + (ctop - D) / 2, z);
  for (let i = 0; i < 7; i++) { const x = -1.35 + (i + 0.5) * 2.7 / 7; add(new THREE.BoxGeometry(2.7 / 7, 0.08, cz1 - cz0 + 0.3), i % 2 ? white : redM, x, ctop + 0.04 + 0.05 * Math.cos((x / 1.35) * Math.PI / 2), (cz0 + cz1) / 2); }
  for (const z of [cz0 - 0.15, cz1 + 0.15]) for (let i = 0; i < 7; i++) add(new THREE.BoxGeometry(2.7 / 7, 0.22, 0.04), i % 2 ? white : redM, -1.35 + (i + 0.5) * 2.7 / 7, ctop - 0.07, z);
  // bow and stern staffs, bunting lines with triangle flags
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 6), teak, 0, D + 0.95 + BOWLIFT, 3.55);
  const flagCols = [redM, white, cobalt, sunM, M(0x3e8a5a)], tri = new THREE.ShapeGeometry(shape([[-0.13, 0], [0.13, 0], [0, -0.3]]));
  const bunting = (A, B, n) => { rod(A, B, 0.012, rope, 3); for (let i = 1; i < n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 0.18;
      const fl = add(tri, flagCols[i % 5], A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag, A[2] + (B[2] - A[2]) * t); fl.rotation.y = Math.atan2(B[0] - A[0], B[2] - A[2]) + Math.PI / 2; fl.material.side = THREE.DoubleSide; } };
  const top = [0, D + 1.9 + BOWLIFT, 3.55];
  bunting([-1.25, ctop, cz1], top, 8); bunting([1.25, ctop, cz1], top, 8); bunting([-1.25, ctop, cz0], [1.25, ctop, cz0], 6); bunting([-1.25, ctop, cz0], [-1.25, ctop, cz1], 6); bunting([1.25, ctop, cz0], [1.25, ctop, cz1], 6);
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10), dark, 0, D - 0.4, -4.05).rotation.x = Math.PI / 2;
  // placement: base at y = 0, centred on x and z (vertex-measured)
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
