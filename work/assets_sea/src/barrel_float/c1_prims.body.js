// candidate 1: primitives: three cylinder frusta (bulge), torus hoops, end caps, lying along x
  const wood = M(0x8a5a32, { roughness: 0.65 }); wood.name = 'timber'; const end = M(0xa8652f, { roughness: 0.65 }); end.name = 'timber';
  const hoop = M(0x3a3836, { metalness: 0.6, roughness: 0.45 }); hoop.name = 'metal';
  const b = new THREE.Group(); g.add(b); b.rotation.z = Math.PI / 2; b.position.y = 0.33;
  add(new THREE.CylinderGeometry(0.33, 0.28, 0.3, 14), wood, 0, 0.3, 0, b); add(new THREE.CylinderGeometry(0.33, 0.33, 0.3, 14), wood, 0, 0, 0, b); add(new THREE.CylinderGeometry(0.28, 0.33, 0.3, 14), wood, 0, -0.3, 0, b);
  add(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 14), end, 0, 0.45, 0, b); add(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 14), end, 0, -0.45, 0, b);
  for (const [y, r] of [[0.4, 0.29], [0.2, 0.322], [-0.2, 0.322], [-0.4, 0.29]]) add(new THREE.TorusGeometry(r, 0.022, 4, 16), hoop, 0, y, 0, b).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), end, 0, 0.0, 0.335, b).rotation.x = Math.PI / 2;
