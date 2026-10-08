  // ---- shared hull definition: the bow half of a wooden ship, local frame, keel at y=0, bow toward +z ----
  const LH = 11.5, BH = 2.3;
  const beam = (s) => (s < 0.5 ? BH : BH * Math.sqrt(Math.max(0.004, 1 - Math.pow((s - 0.5) / 0.5, 2))));
  const keelY = (s) => 1.9 * Math.pow(Math.max(0, (s - 0.55) / 0.45), 2);
  const sheerY = (s) => 3.2 + 1.5 * s * s;
  // u in [0,1]: 0 = port sheer, 0.5 = keel, 1 = starboard sheer
  const hullPt = (s, u, inset = 0) => {
    const f = Math.PI * u - Math.PI, c = Math.cos(f), b = Math.max(0, beam(s) - inset);
    const x = b * Math.sign(c) * Math.pow(Math.abs(c), 0.55), y = keelY(s) + inset + (sheerY(s) - keelY(s) - inset) * (1 + Math.sin(f));
    return new THREE.Vector3(x, y, s * LH);
  };
  const brokenS = (u) => 0.03 + 0.16 * hash3(Math.floor(u * 11), 3, 5) + 0.05 * Math.sin(u * 23);
  const HG = new THREE.Group(); g.add(HG);
  HG.rotation.x = -0.6; HG.rotation.z = 0.14; HG.position.set(0, 0.6, -2);   // negative x pitches the bow UP (traps.md)
  const T1 = M(0x5b4331, { roughness: 0.65 }), T2 = M(0x6e5038, { roughness: 0.65 }), TD = M(0x3f2f24, { roughness: 0.7 }), MOSS = M(0x56703a, { roughness: 0.75 });
  [T1, T2, TD].forEach((m) => { m.name = 'timber'; m.side = THREE.DoubleSide; }); MOSS.name = 'foliage';
  const tube = (pts, r, mat, parent, seg = 6) => { const cv = new THREE.CatmullRomCurve3(pts); return add(new THREE.TubeGeometry(cv, Math.max(4, pts.length * 2), r, seg, false), mat, 0, 0, 0, parent); };
