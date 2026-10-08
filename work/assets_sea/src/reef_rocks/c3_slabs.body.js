// candidate 3: different reading: tilted extruded prism chunks (irregular polygon, bevelled) like a broken
// reef shelf, with foam as thin extruded caps of the same polygon
  let sd = 13; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const rock = M(0x2f3438, { roughness: 0.25, flatShading: true }); rock.name = 'stone'; const rock2 = M(0x3a4048, { roughness: 0.3, flatShading: true }); rock2.name = 'stone';
  const foam = M(0xf2efe2, { roughness: 0.7, flatShading: true });
  const poly = (r) => { const pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + rnd() * 0.4; pts.push([Math.cos(a) * r * (0.75 + rnd() * 0.35), Math.sin(a) * r * (0.75 + rnd() * 0.35)]); } return shape(pts); };
  [[0, 0, 1.6, 1.55, 0.12], [2.3, 0.8, 1.2, 1.1, -0.2], [-2.3, 0.5, 1.3, 1.2, 0.18], [0.9, -2.0, 1.0, 1.0, 0.25], [-1.1, 2.0, 0.9, 0.9, -0.15], [3.3, -1.0, 0.7, 0.6, 0.1], [-3.3, -1.3, 0.7, 0.6, -0.2]].forEach(([x, z, r, h, tilt], i) => {
    const sh = poly(r), grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.set(tilt, rnd() * 6, -tilt * 0.6); g.add(grp);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2); add(geo, i % 2 ? rock2 : rock, 0, 0, 0, grp);
    const fs = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.06, bevelSegments: 1 }); fs.rotateX(-Math.PI / 2); fs.scale(0.75, 1, 0.75); add(fs, foam, 0, h + 0.25, 0, grp); });
