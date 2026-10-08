//@seed 101
//@expect {"width":7,"height":5}
//@include _shape.js
  // c1, profile: the whole tail outline (stock and both flukes) drawn as one Shape and extruded with a bevel,
  // a lathe-round stock inside it, white underside patches as thin extruded blobs on the +Z face
  const sh = new THREE.Shape(), N = 16;
  sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.quadraticCurveTo(0.32, 1.8, 0.42, le(0.42));
  for (let i = 1; i <= N; i++) { const x = 0.42 + (S - 0.42) * i / N; sh.lineTo(x, le(x)); }
  for (let i = N; i >= 0; i--) { const x = S * i / N; sh.lineTo(x, te(x) - (i === 0 ? 0.25 : 0)); }
  for (let i = 1; i <= N; i++) { const x = S * i / N; sh.lineTo(-x, te(x)); }
  for (let i = N; i >= 1; i--) { const x = 0.42 + (S - 0.42) * i / N; sh.lineTo(-x, le(x)); }
  sh.lineTo(-0.42, le(0.42)); sh.quadraticCurveTo(-0.32, 1.8, -0.5, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -0.08);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); if (y > 3) p.setZ(i, p.getZ(i) + curl(Math.abs(x))); }
  geo.computeVertexNormals(); add(geo, slate);
  const prof = []; for (let i = 0; i <= 10; i++) { const t = i / 10; prof.push(new THREE.Vector2(0.52 - 0.2 * t + 0.08 * Math.sin(t * Math.PI), t * 3.4)); }
  const st = add(new THREE.LatheGeometry(prof, 14), slate); st.scale.set(1, 1, 0.75);
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) {
    const ps = new THREE.Shape(), cx = sx * (1.4 + k * 1.1), cy = (te(Math.abs(cx)) + le(Math.abs(cx))) / 2 + 0.1, r = 0.45 - k * 0.1;
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.28, rr2 = r * (0.85 + 0.22 * Math.sin(2 * a + k * 2 + sx) + 0.12 * Math.sin(3 * a + sx * 1.7)); const px = cx + Math.cos(a) * rr2 * 1.5, py = cy + Math.sin(a) * rr2; i ? ps.lineTo(px, py) : ps.moveTo(px, py); }
    const pg = new THREE.ExtrudeGeometry(ps, { depth: 0.03, bevelEnabled: false, curveSegments: 1 }); const pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setZ(i, pp.getZ(i) + curl(Math.abs(pp.getX(i)))); pg.computeVertexNormals();
    add(pg, belly, 0, 0, 0.205);
  }
