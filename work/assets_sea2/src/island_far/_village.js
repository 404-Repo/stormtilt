  // ---- shared village: chunky toy houses on the west slope and a white chapel on the summit, dropped onto the land by raycast ----
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
  land.updateMatrixWorld(true);
  const groundAt = (x, z) => { ray.set(new THREE.Vector3(x, 200, z), down); const h = ray.intersectObject(land, false)[0]; return h ? h.point.y : 0; };
  const wallM = [0xf3eee3, 0xf2b630, 0xf3eee3, 0xe9d7b5].map((c) => { const m = M(c, { roughness: 0.4 }); m.name = 'plaster'; return m; });
  const roofM = [0xd7372f, 0x2a5bd7, 0xd7372f, 0xc46a3a].map((c) => { const m = M(c, { roughness: 0.35 }); m.name = 'tile'; return m; });
  const dark = M(0x3b3358, { roughness: 0.5 });
  const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.6, 0); s.lineTo(w / 2 + 0.6, 0); s.lineTo(0, h); s.lineTo(-w / 2 - 0.6, 0);
    const q = new THREE.ExtrudeGeometry(s, { depth: d + 1.2, bevelEnabled: false }); q.translate(0, 0, -(d + 1.2) / 2); return q; };
  const house = (x, z, w, h, d, ry, k) => { const y = groundAt(x, z) - 1.2, grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; grp.scale.setScalar(1.3); g.add(grp);
    add(new THREE.BoxGeometry(w, h + 1.2, d), wallM[k % 4], 0, (h + 1.2) / 2, 0, grp); add(prism(w, w * 0.55, d), roofM[k % 4], 0, h + 1.2, 0, grp);
    add(new THREE.BoxGeometry(w * 0.22, h * 0.32, 0.3), dark, -w * 0.18, 1.2 + h * 0.16, d / 2, grp); add(new THREE.BoxGeometry(w * 0.2, h * 0.22, 0.3), dark, w * 0.22, 1.2 + h * 0.55, d / 2, grp);
    add(new THREE.BoxGeometry(1, 2.2, 1), wallM[(k + 1) % 4], w * 0.28, h + 1.2 + w * 0.3, 0, grp); };
  [[-58, 14, 8, 6, 7, 0.1], [-49, 18, 7, 5.5, 6, -0.15], [-52, 6, 7.5, 7, 6.5, 0.25], [-41, 11, 6.5, 5, 6, 0.05], [-63, 4, 6.5, 5.5, 6, -0.3], [-36, 20, 6, 5, 5.5, 0.2]]
    .forEach(([x, z, w, h, d, ry], k) => house(x, z, w, h, d, ry, k));
  // the chapel: nave, red roof, a bell tower with an open bell stage and a pyramid cap (no cross: no glyphs)
  const cx = 22, cz = 4, cy = groundAt(cx, cz) - 1.5, CH = new THREE.Group(); CH.position.set(cx, cy, cz); CH.rotation.y = -0.2; CH.scale.setScalar(1.15); g.add(CH);
  const wh = wallM[0], rd = roofM[0];
  add(new THREE.BoxGeometry(14, 8.5, 8), wh, 0, 4.25, 0, CH); add(prism(8, 4.6, 14), rd, 0, 8.5, 0, CH).rotation.y = Math.PI / 2;
  add(new THREE.BoxGeometry(4.4, 13, 4.4), wh, -8.4, 6.5, 0, CH);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(new THREE.BoxGeometry(0.9, 3, 0.9), wh, -8.4 + sx * 1.75, 14.5, sz * 1.75, CH);
  add(new THREE.SphereGeometry(0.9, 8, 6), M(0xc9a043, { roughness: 0.3, metalness: 0.7 }), -8.4, 14.2, 0, CH);
  add(new THREE.BoxGeometry(4.8, 0.5, 4.8), wh, -8.4, 16.2, 0, CH);
  add(new THREE.ConeGeometry(3.4, 3.4, 4), rd, -8.4, 18.1, 0, CH).rotation.y = Math.PI / 4;
  add(new THREE.BoxGeometry(2.2, 3.6, 0.3), dark, 7.05, 1.8, 0, CH).rotation.y = Math.PI / 2;
  for (const s of [-3, 0, 3]) add(new THREE.BoxGeometry(1.1, 2.6, 0.3), dark, s, 5, 4.05, CH);
