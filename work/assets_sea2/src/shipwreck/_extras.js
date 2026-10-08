  // ---- shared extras, in world space so the rags hang plumb: snapped mast, yard, rags, rope, rubble ----
  HG.updateMatrixWorld(true);
  const W = (s, u, dy = 0) => HG.localToWorld(hullPt(s, u).add(new THREE.Vector3(0, dy, 0)));
  const mb = W(0.42, 0.5, 0.4), mDir = new THREE.Vector3(0.35, 1, -0.55).normalize(), mLen = 6.6;
  const mast = add(new THREE.CylinderGeometry(0.2, 0.3, mLen, 10), TD); mast.position.copy(mb).addScaledVector(mDir, mLen / 2);
  mast.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mDir);
  const mt = mb.clone().addScaledVector(mDir, mLen);
  for (let i = 0; i < 4; i++) { const sp = add(new THREE.ConeGeometry(0.09, rr(0.5, 1.0), 4), TD); sp.position.copy(mt).add(new THREE.Vector3(rr(-0.12, 0.12), 0.2, rr(-0.12, 0.12)));
    sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mDir.clone().add(new THREE.Vector3(rr(-0.3, 0.3), 0, rr(-0.3, 0.3))).normalize()); }
  const yc = mb.clone().addScaledVector(mDir, mLen * 0.72), yDir = new THREE.Vector3(1, -0.32, 0.12).normalize(), yLen = 5.4;
  const yard = add(new THREE.CylinderGeometry(0.12, 0.14, yLen, 8), TD); yard.position.copy(yc); yard.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yDir);
  const canvas = M(0xd9ccab, { roughness: 0.85, side: THREE.DoubleSide }); canvas.name = 'fabric';
  for (let k = 0; k < 3; k++) {
    const top = yc.clone().addScaledVector(yDir, (k - 1) * 1.6), w = rr(1.4, 1.9), h = rr(2.4, 3.4);
    const q = new THREE.PlaneGeometry(w, h, 4, 6), p = q.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i); const t = (h / 2 - y) / h;
      if (t > 0.95) y += rr(0, 0.8);                       // ragged bottom edge
      if (Math.abs(x) > w / 2 - 0.01 && t > 0.4) x *= rr(0.55, 0.9);   // torn sides
      p.setXYZ(i, x, y - h / 2, Math.sin(x * 3 + k) * 0.18 * t + t * t * 0.5); }
    q.computeVertexNormals();
    const rag = add(q, canvas); rag.position.copy(top); rag.rotation.y = Math.atan2(-yDir.z, yDir.x) * 0.6; rag.rotation.z = -0.32 * 0.9;
  }
  const rope = M(0xb59a6a, { roughness: 0.8 }); rope.name = 'fabric';
  const ye = yc.clone().addScaledVector(yDir, yLen / 2), bt = HG.localToWorld(new THREE.Vector3(0, sheerY(1) + 0.8, LH + 2.3));
  tube([ye, ye.clone().lerp(bt, 0.5).add(new THREE.Vector3(0, -1.2, 0)), bt], 0.05, rope, g, 4);
  const ye2 = yc.clone().addScaledVector(yDir, -yLen / 2);
  tube([ye2, ye2.clone().add(new THREE.Vector3(-0.3, -2.2, 0.2)), ye2.clone().add(new THREE.Vector3(-0.1, -3.4, 0.6))], 0.045, rope, g, 4);
  // rubble mound under the broken end: stones and loose planks
  const stone = M(0x6f6a62, { roughness: 0.8, flatShading: true }); stone.name = 'stone';
  const sl = []; for (let i = 0; i < 16; i++) { const q = new THREE.DodecahedronGeometry(rr(0.4, 0.9), 0); q.scale(1, 0.6, 1); q.translate(rr(-3.6, 3.6), 0.2, rr(-4.8, 1.2)); sl.push(q); }
  const sg = merge(sl); sg.computeVertexNormals(); add(sg, stone);
  for (let i = 0; i < 7; i++) { const b = add(new THREE.BoxGeometry(0.3, 0.12, rr(1.6, 3.2)), i % 2 ? T1 : TD, rr(-3.4, 3.4), 0.35, rr(-4.6, 1.6)); b.rotation.set(rr(-0.2, 0.2), rr(0, 3.1), rr(-0.3, 0.3)); }
