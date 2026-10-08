// candidate 3: chunky toy reading: annulus sectors extruded with a bevel (flat-sided ring, rounded edges)
  const red = M(0xd7372f), white = M(0xf2efe2), rope = M(0xb59a6a, { roughness: 0.8 });
  const sector = (a0, a1) => { const s = new THREE.Shape(), n = 6, ro = 0.335, ri = 0.235; // bevel 0.03 grows it to 0.365/0.205
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; i ? s.lineTo(Math.cos(a) * ro, Math.sin(a) * ro) : s.moveTo(Math.cos(a) * ro, Math.sin(a) * ro); }
    for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; s.lineTo(Math.cos(a) * ri, Math.sin(a) * ri); } return s; };
  for (let i = 0; i < 8; i++) { const geo = new THREE.ExtrudeGeometry(sector(i * Math.PI / 4, (i + 1) * Math.PI / 4), { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 4 });
    geo.rotateX(-Math.PI / 2); add(geo, i % 2 ? white : red); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; add(new THREE.BoxGeometry(0.03, 0.03, 0.2), rope, Math.cos(a) * 0.37, 0.07, -Math.sin(a) * 0.37).rotation.y = a; }
