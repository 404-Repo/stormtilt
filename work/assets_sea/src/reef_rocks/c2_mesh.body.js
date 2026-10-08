// candidate 2: custom: each rock is a low-res icosphere pushed by a deterministic field and flattened at
// its base; the foam is the same rock's upper vertices copied, lifted 3 cm and kept only above a height
  let sd = 9; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const rock = M(0x2f3438, { roughness: 0.25, flatShading: true }); rock.name = 'stone'; const foam = M(0xf2efe2, { roughness: 0.7, flatShading: true });
  const lump = (x, z, r, h) => { const geo = new THREE.IcosahedronGeometry(1, 1), p = geo.attributes.position, k1 = rnd() * 6, k2 = rnd() * 6;
    for (let i = 0; i < p.count; i++) { let vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i); const n = 1 + 0.18 * Math.sin(vx * 3 + k1) * Math.cos(vz * 3 + k2) + 0.1 * Math.sin(vy * 5 + k1);
      vx *= r * n; vz *= r * n * 0.9; vy = Math.max(-0.1, vy) * h * n; p.setXYZ(i, vx, vy, vz); }
    geo.computeVertexNormals(); add(geo, rock, x, 0.1, z);
    const top = geo.index ? geo.toNonIndexed() : geo, tp = top.attributes.position, keep = [];
    for (let t = 0; t < tp.count; t += 3) { let ok = true; for (let j = 0; j < 3; j++) if (tp.getY(t + j) < h * 0.62) ok = false; if (ok) for (let j = 0; j < 3; j++) keep.push(tp.getX(t + j) * 1.02, tp.getY(t + j) + 0.04, tp.getZ(t + j) * 1.02); }
    if (keep.length) { const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); fg.computeVertexNormals(); add(fg, foam, x, 0.1, z); } };
  lump(0, 0, 1.9, 2.3); lump(2.4, 0.9, 1.4, 1.6); lump(-2.4, 0.5, 1.5, 1.7); lump(1.0, -2.0, 1.1, 1.1); lump(-1.1, 2.0, 1.0, 1.0); lump(3.4, -1.1, 0.8, 0.7); lump(-3.4, -1.3, 0.8, 0.7);
