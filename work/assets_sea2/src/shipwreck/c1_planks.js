//@seed 83
//@expect {"depth":14,"height":9}
//@include _hull.js
  // c1, primitives: the hull as plank boxes. Each side is five strakes, each strake a run of boxes from section to
  // section, stopping at a jagged broken edge; a stem post, gunwale rails, a short foredeck, a bowsprit.
  const X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), mtx = new THREE.Matrix4();
  const NSEG = 12, strakes = 6;
  for (const side of [0, 1]) for (let k = 0; k < strakes; k++) {
    const u = side ? 0.5 + (k + 0.5) / strakes * 0.5 : 0.5 - (k + 0.5) / strakes * 0.5, du = 0.5 / strakes;
    const s0 = brokenS(u);
    for (let i = 0; i < NSEG; i++) {
      const sa = s0 + (1 - s0) * i / NSEG, sb = s0 + (1 - s0) * (i + 1) / NSEG;
      const a = hullPt(sa, u), b = hullPt(sb, u), across = hullPt((sa + sb) / 2, u + du / 2).sub(hullPt((sa + sb) / 2, u - du / 2));
      Z.subVectors(b, a); const len = Z.length(); Z.normalize(); Y.copy(across).addScaledVector(Z, -across.dot(Z)); const wid = Y.length(); Y.normalize(); X.crossVectors(Y, Z);
      const box = add(new THREE.BoxGeometry(0.18, wid * 1.04, len * 1.03), (k + i) % 3 === 0 ? T2 : (k % 2 ? T1 : TD), 0, 0, 0, HG);
      mtx.makeBasis(X, Y, Z); box.quaternion.setFromRotationMatrix(mtx); box.position.copy(a).add(b).multiplyScalar(0.5);
      if (k < 2 && i < 4 && rnd() > 0.4) { const mo = add(new THREE.BoxGeometry(0.2, wid * 0.6, len * 0.8), MOSS, 0, 0, 0, HG); mo.quaternion.copy(box.quaternion); mo.position.copy(box.position).addScaledVector(X, side ? 0.03 : -0.03); }
    }
  }
  // stem post, keel, ribs sticking out of the break
  const stem = []; for (let i = 0; i <= 8; i++) stem.push(hullPt(0.6 + 0.4 * i / 8, 0.5).add(new THREE.Vector3(0, 0, 0.1)));
  stem.push(hullPt(1, 0.5).add(new THREE.Vector3(0, sheerY(1) - keelY(1) + 0.6, 0.2))); tube(stem, 0.22, TD, HG);
  for (const sr of [0.0, -0.08]) { const pts = []; for (let i = 0; i <= 8; i++) pts.push(hullPt(Math.max(0, sr), 0.08 + 0.84 * i / 8, 0.1).add(new THREE.Vector3(0, 0, sr * LH))); tube(pts, 0.16, TD, HG); }
  for (const u of [0.0, 1.0]) { const pts = []; for (let i = 0; i <= 10; i++) { const s = brokenS(u) + (1 - brokenS(u)) * i / 10; pts.push(hullPt(s, u).add(new THREE.Vector3(0, 0.1, 0))); } tube(pts, 0.16, T2, HG); }
  const deck = add(new THREE.BoxGeometry(BH * 1.4, 0.18, LH * 0.25), T2, 0, sheerY(0.75) - 0.45, LH * 0.72, HG);
  const bs = add(new THREE.CylinderGeometry(0.1, 0.2, 3.6, 8), TD, 0, 0, 0, HG); bs.position.set(0, sheerY(1) + 0.6, LH + 1.4); bs.rotation.x = Math.PI / 2 - 0.35;
//@include _extras.js
