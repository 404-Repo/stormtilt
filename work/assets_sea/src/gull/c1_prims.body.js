// candidate 1: primitives: ellipsoid body, sphere head, cone beak, thin boxes for arm/hand feathers
  const white = M(0xf3eee3, { roughness: 0.6 }), grey = M(0x9aa4ad, { roughness: 0.6 }), black = M(0x26262b, { roughness: 0.6 }), beak = M(0xf2b630), eye = M(0x111111);
  add(new THREE.SphereGeometry(1, 12, 8), white).scale.set(0.085, 0.08, 0.22);
  add(new THREE.SphereGeometry(0.065, 10, 8), white, 0, 0.05, 0.2);
  const bk = add(new THREE.ConeGeometry(0.022, 0.09, 6), beak, 0, 0.04, 0.29); bk.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.011, 6, 4), eye, s * 0.05, 0.07, 0.235);
  const tail = add(new THREE.BoxGeometry(0.12, 0.02, 0.12), white, 0, 0.01, -0.24); tail.rotation.x = -0.1;
  add(new THREE.BoxGeometry(0.1, 0.012, 0.03), grey, 0, 0.022, -0.29);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.02, 0.02, 0.07), beak, s * 0.03, -0.07, -0.12);
  const joints = {};
  for (const [name, s] of [['wingL', 1], ['wingR', -1]]) {
    const w = new THREE.Group(); w.name = name; w.position.set(s * 0.06, 0.03, 0.04); w.rotation.z = s * 0.14; g.add(w); joints[name] = w;
    add(new THREE.BoxGeometry(0.26, 0.025, 0.17), grey, s * 0.13, 0, -0.03, w);
    add(new THREE.BoxGeometry(0.26, 0.012, 0.05), white, s * 0.13, -0.006, 0.05, w);
    const hand = new THREE.Group(); hand.position.set(s * 0.26, 0, 0); hand.rotation.z = -s * 0.3; w.add(hand);
    const h1 = add(new THREE.BoxGeometry(0.22, 0.02, 0.14), grey, s * 0.11, 0, -0.04, hand); h1.rotation.y = s * 0.15;
    const h2 = add(new THREE.BoxGeometry(0.12, 0.016, 0.09), black, s * 0.27, 0, -0.08, hand); h2.rotation.y = s * 0.35;
  }
  g.userData.joints = joints;
