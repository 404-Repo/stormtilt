// candidate 2: a lathe of a round section swept in eight sectors (phiLength), red and white quarters with
// white bands; rope as a tube
  const red = M(0xd7372f), white = M(0xf2efe2), rope = M(0xb59a6a, { roughness: 0.8 });
  const sec = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2; sec.push([0.29 + 0.085 * Math.cos(a), 0.075 * Math.sin(a)]); }
  // quarters: red with white wrap bands every 90 degrees
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; add(new THREE.LatheGeometry(V2(sec), 6, a + 0.18, Math.PI / 2 - 0.36), red);
    add(new THREE.LatheGeometry(V2(sec.map(([x, y]) => [x * 1.0 + (x > 0.29 ? 0.006 : -0.006), y * 1.08])), 2, a - 0.18, 0.36), white); }
  const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, sag = 0.02 * Math.abs(Math.sin(a * 2)); pts.push(new THREE.Vector3(Math.cos(a) * (0.385 + sag), 0, Math.sin(a) * (0.385 + sag))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 0.012, 4, true), rope);
