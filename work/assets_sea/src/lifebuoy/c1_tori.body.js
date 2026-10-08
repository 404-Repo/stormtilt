// candidate 1: four torus arcs (quarters) lying flat, rope loops as thin torus arcs
  const red = M(0xd7372f), white = M(0xf2efe2), rope = M(0xb59a6a, { roughness: 0.8 });
  const R = 0.29, r = 0.085;
  for (let i = 0; i < 8; i++) { const t = add(new THREE.TorusGeometry(R, r, 10, 8, Math.PI / 4), i % 2 ? white : red); t.rotation.set(-Math.PI / 2, 0, i * Math.PI / 4); t.rotation.order = 'XYZ'; }
  // grab rope: four sagging loops between the white quarters
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const l = add(new THREE.TorusGeometry(0.36, 0.012, 4, 6, Math.PI / 2.4), rope, 0, 0.0, 0); l.rotation.set(-Math.PI / 2, 0, a - Math.PI / 4.8); }
