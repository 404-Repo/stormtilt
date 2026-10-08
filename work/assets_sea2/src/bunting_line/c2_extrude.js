//@seed 123
//@expect {"width":24.5,"height":2.6}
//@include _common.js
  // c2, profiles: the rope a tube swept along the sag curve, each pennant a triangle Shape extruded thin with a soft bevel
  const pts = []; for (let i = 0; i <= 16; i++) { const x = -HALF + 2 * HALF * i / 16; pts.push(new THREE.Vector3(x, ropeY(x), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 5, false), ropeM);
  const b = 0.02, tri = new THREE.Shape(); tri.moveTo(-FW / 2 + b * 1.7, -b); tri.lineTo(FW / 2 - b * 1.7, -b); tri.lineTo(0, -FL + b * 2); tri.lineTo(-FW / 2 + b * 1.7, -b);
  for (let i = 0; i < NF; i++) { const f = flagAt(i), grp = new THREE.Group(); grp.position.set(f.x, f.y, 0); grp.rotation.z = f.slope; grp.rotation.x = f.tw; grp.rotation.y = f.yaw; g.add(grp);
    const q = new THREE.ExtrudeGeometry(tri, { depth: 0.03, bevelEnabled: true, bevelSize: b, bevelThickness: 0.015, bevelSegments: 1 }); q.translate(0, 0, -0.015); add(q, f.mat, 0, 0, 0, grp); }
