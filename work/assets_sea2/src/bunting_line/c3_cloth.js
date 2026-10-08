//@seed 127
//@expect {"width":24.5,"height":2.6}
//@include _common.js
  // c3, a different reading: soft cloth. Each pennant a subdivided triangle that billows and bends in the wind
  // (a hand-built BufferGeometry), the rope a tube along the sag, the whole line bellied slightly toward +z
  const pts = []; for (let i = 0; i <= 16; i++) { const x = -HALF + 2 * HALF * i / 16; pts.push(new THREE.Vector3(x, ropeY(x), 0.25 * (1 - Math.pow(x / HALF, 2)))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 5, false), ropeM);
  const R = 5;
  for (let i = 0; i < NF; i++) { const f = flagAt(i), pos = [], idx = [], ph = i * 1.3;
    for (let r = 0; r <= R; r++) { const t = r / R, w = FW * (1 - t), n = R - r + 1;
      for (let k = 0; k < n; k++) { const u = n === 1 ? 0 : k / (n - 1) - 0.5, x = u * w, y = -t * FL;
        pos.push(x, y, Math.sin(t * 2.6 + ph) * 0.09 * t + Math.cos(u * 3 + ph) * 0.05 + t * t * 0.12); } }
    let base = 0; for (let r = 0; r < R; r++) { const n = R - r + 1, nb = base + n; for (let k = 0; k < n - 1; k++) { idx.push(base + k, nb + k, base + k + 1); if (k < n - 2) idx.push(base + k + 1, nb + k, nb + k + 1); } base = nb; }
    const q = new THREE.BufferGeometry(); q.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); q.setIndex(idx); q.computeVertexNormals();
    const m = add(q, f.mat, f.x, f.y, 0.25 * (1 - Math.pow(f.x / HALF, 2))); m.rotation.z = f.slope; m.rotation.x = f.tw * 0.6; }
