//@seed 121
//@expect {"width":24.5,"height":2.6}
//@include _common.js
  // c1, primitives: rope as a chain of short cylinders, each pennant a 3-sided cone flattened into a triangular plate, apex down
  const N = 20; for (let i = 0; i < N; i++) { const x0 = -HALF + 2 * HALF * i / N, x1 = -HALF + 2 * HALF * (i + 1) / N, a = new THREE.Vector3(x0, ropeY(x0), 0), b = new THREE.Vector3(x1, ropeY(x1), 0);
    const m = add(new THREE.CylinderGeometry(0.03, 0.03, a.distanceTo(b) * 1.02, 5), ropeM); m.position.copy(a).lerp(b, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); }
  for (let i = 0; i < NF; i++) { const f = flagAt(i), grp = new THREE.Group(); grp.position.set(f.x, f.y, 0); grp.rotation.z = f.slope; grp.rotation.x = f.tw; g.add(grp);
    const c = add(new THREE.ConeGeometry(FW / Math.sqrt(3), FL, 3), f.mat, 0, -FL / 2, 0, grp); c.rotation.x = Math.PI; c.rotation.y = Math.PI / 6; c.scale.z = 0.12; }
