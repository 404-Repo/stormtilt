// candidate 1: primitives: flat-shaded dodecahedra, foam caps as flattened icosahedra on each top
  let sd = 5; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const rock = M(0x2f3438, { roughness: 0.25, flatShading: true }); rock.name = 'stone'; const rock2 = M(0x3a3f45, { roughness: 0.3, flatShading: true }); rock2.name = 'stone';
  const foam = M(0xf2efe2, { roughness: 0.7, flatShading: true });
  [[0, 0, 1.7, 0.85], [2.3, 0.8, 1.3, 0.7], [-2.4, 0.4, 1.4, 0.7], [1.0, -1.9, 1.1, 0.6], [-1.0, 1.9, 1.0, 0.6], [3.3, -1.0, 0.8, 0.5], [-3.4, -1.2, 0.8, 0.45], [0.3, 2.9, 0.6, 0.45]].forEach(([x, z, r, hs], i) => {
    const b = add(new THREE.DodecahedronGeometry(r, 0), i % 2 ? rock2 : rock, x, r * hs * 0.55, z); b.scale.set(1.1, hs, 1); b.rotation.y = rnd() * 6;
    const f = add(new THREE.IcosahedronGeometry(r * 0.62, 0), foam, x + (rnd() - 0.5) * 0.2, r * hs * 0.55 + r * hs * 0.72, z); f.scale.set(1.05, 0.3, 0.95); f.rotation.y = rnd() * 6; });
