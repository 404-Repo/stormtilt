//@seed 107
//@expect {"width":7,"height":5}
  // c3, primitives: two flattened ellipsoid flukes rolled up at the tips, a tapered elliptical cylinder stock, a sphere
  // root, white underside patches as squashed spheres on the +Z face
  const slate = M(0x3b5370, { roughness: 0.35 }), belly = M(0xf3eee3, { roughness: 0.4 });
  const st = add(new THREE.CylinderGeometry(0.34, 0.55, 3.6, 14), slate, 0, 1.8, 0); st.scale.z = 0.8;
  add(new THREE.SphereGeometry(0.5, 12, 8), slate, 0, 3.75, 0).scale.set(1.1, 0.8, 0.6);
  for (const sx of [-1, 1]) {
    const f = add(new THREE.SphereGeometry(1, 22, 12), slate, sx * 1.75, 4.25, -0.15); f.scale.set(1.85, 0.62, 0.17); f.rotation.z = sx * 0.3; f.rotation.y = sx * 0.18;
    const tip = add(new THREE.SphereGeometry(1, 12, 8), slate, sx * 3.05, 4.85, -0.35); tip.scale.set(0.55, 0.3, 0.12); tip.rotation.z = sx * 0.7; tip.rotation.y = sx * 0.3;
    for (let k = 0; k < 2; k++) { const b = add(new THREE.SphereGeometry(1, 10, 6), belly, sx * (1.3 + k * 1.0), 4.15 + k * 0.3, 0.0 - k * 0.15); b.scale.set(0.5 - k * 0.1, 0.28, 0.06); b.rotation.z = sx * 0.3; b.rotation.y = sx * 0.18; }
  }
