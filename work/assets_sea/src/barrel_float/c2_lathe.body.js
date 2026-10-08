// candidate 2: one bulged lathe profile (with chimes), lathe hoops, lying along x
  const wood = M(0x8a5a32, { roughness: 0.65 }); wood.name = 'timber'; const end = M(0xa8652f, { roughness: 0.65 }); end.name = 'timber';
  const hoop = M(0x3a3836, { metalness: 0.6, roughness: 0.45 }); hoop.name = 'metal';
  const b = new THREE.Group(); g.add(b); b.rotation.z = Math.PI / 2; b.position.y = 0.34;
  const pts = [[0, 0.41], [0.25, 0.41], [0.26, 0.45], [0.285, 0.45]]; for (let i = 0; i <= 10; i++) { const y = 0.45 - 0.9 * i / 10; pts.push([0.285 + 0.055 * Math.cos((y / 0.45) * Math.PI / 2), y]); }
  pts.push([0.285, -0.45], [0.26, -0.45], [0.25, -0.41], [0, -0.41]);
  add(new THREE.LatheGeometry(V2(pts.reverse()), 16), wood, 0, 0, 0, b);
  add(new THREE.CircleGeometry(0.25, 16), end, 0, 0.412, 0, b).rotation.x = -Math.PI / 2;
  add(new THREE.CircleGeometry(0.25, 16), end, 0, -0.412, 0, b).rotation.x = Math.PI / 2;
  for (const y of [0.37, 0.18, -0.18, -0.37]) { const r = 0.285 + 0.055 * Math.cos((y / 0.45) * Math.PI / 2) + 0.01;
    add(new THREE.LatheGeometry(V2([[r, y + 0.03], [r + 0.012, y], [r, y - 0.03]]), 16), hoop, 0, 0, 0, b).material.side = THREE.DoubleSide; }
  add(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6), end, 0, 0, 0.345, b).rotation.x = Math.PI / 2;
