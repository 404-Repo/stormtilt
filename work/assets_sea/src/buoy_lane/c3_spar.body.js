// candidate 3: a different reading: slender striped spar on a fat torus fender float, square cage of extruded frames
  const red = M(0xd7372f), white = M(0xf2efe2), steel = M(0x8f9aa3, { metalness: 0.7, roughness: 0.35 }); steel.name = 'metal';
  const lamp = M(0xffd27a, { emissive: 0xffb347, emissiveIntensity: 2.0 }), chain = M(0x4a4440, { metalness: 0.6, roughness: 0.5 });
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 6), chain, 0, 0.12, 0);
  add(new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), red, 0, 0.62, 0).scale.y = 0.9; // under-hull dome
  add(new THREE.TorusGeometry(0.42, 0.14, 8, 20), white, 0, 0.64, 0).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 20), red, 0, 0.72, 0);
  // spar: 4 stripes on an octagonal post
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.2 - i * 0.015, 0.21 - i * 0.015, 0.16, 8), i % 2 ? white : red, 0, 0.88 + i * 0.16, 0);
  add(new THREE.BoxGeometry(0.42, 0.04, 0.42), red, 0, 1.53, 0);
  // square cage: two extruded square frames on four posts
  const fr = shape([[-0.18, -0.18], [0.18, -0.18], [0.18, 0.18], [-0.18, 0.18]]); fr.holes.push(new THREE.Path(V2([[-0.15, -0.15], [-0.15, 0.15], [0.15, 0.15], [0.15, -0.15]])));
  for (const y of [1.62, 1.74]) { const f = new THREE.ExtrudeGeometry(fr, { depth: 0.03, bevelEnabled: false }); f.rotateX(-Math.PI / 2); add(f, steel, 0, y, 0); }
  for (const [x, z] of [[-0.165, -0.165], [0.165, -0.165], [0.165, 0.165], [-0.165, 0.165]]) add(new THREE.BoxGeometry(0.03, 0.25, 0.03), steel, x, 1.67, z);
  add(new THREE.SphereGeometry(0.11, 12, 8), lamp, 0, 1.66, 0);
  add(new THREE.ConeGeometry(0.17, 0.05, 4), steel, 0, 1.795, 0).rotation.y = Math.PI / 4;
