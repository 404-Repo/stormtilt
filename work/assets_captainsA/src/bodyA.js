  // ---- body kit A: assembled primitives (sphere, cylinder, capsule) ----
  K.style = 'A';
  K.fz = 0;
  K.blob = (rx, ry, rz, ws, hs) => { const s = new THREE.SphereGeometry(1, ws || 12, hs || 9); s.scale(rx, ry, rz); return s; };
  K.tube = (rBot, rTop, h, seg) => new THREE.CylinderGeometry(rTop, rBot, h, seg || 14);
  K.cap = (r, len, seg) => new THREE.CapsuleGeometry(r, len, 3, seg || 8);
  K.trousers = (mat, o) => {
    legs(mat, K.tube(o.r * (o.taper || 0.92), o.r, o.y0 - o.y1), [0, (o.y0 + o.y1) / 2, 0]);
    legs(mat, K.blob(o.r * 0.95, o.r * 0.6, o.r * 0.95, 12, 8), [0, o.y1, 0]);
  };
  K.boots = (mat, sole, o) => {
    const b = -D.legY, sh = o.soleH || 0.05;
    legs(mat, K.tube(o.r * 1.04, o.r, o.top - (b + 0.1)), [0, (o.top + b + 0.1) / 2, 0]);
    legs(mat, K.blob(o.w, 0.1, o.len / 2), [0, b + sh + 0.04, o.toeZ]);
    legs(sole, K.tube(1, 1, sh, 16), [0, b + sh / 2, o.toeZ], null, [o.w * 1.06, 1, (o.len / 2) * 1.04]);
    if (o.cuffMat) legs(o.cuffMat, K.tube(o.r * 1.12, o.r * 1.14, 0.06), [0, o.top - 0.02, 0]);
  };
  K.coat = (mat, o) => {
    const h = o.y1 - o.y0, sz = o.rz / o.rx;
    put('torso', mat, K.tube(o.hemR, o.rx, h, 20), [0, o.y0 + h / 2, 0], null, [1, 1, sz]);
    put('torso', mat, new THREE.SphereGeometry(o.rx, 20, 7, 0, Math.PI * 2, 0, Math.PI / 2), [0, o.y1, 0], null, [1, (o.shH || 0.1) / o.rx, sz]);
    if (o.belly) put('torso', mat, K.blob(o.rx * 1.02, h * 0.42, o.rz * 1.18, 18, 12), [0, o.y0 + h * 0.45, 0.02]);
  };
  K.sleeves = (mat, o) => {
    arms(mat, K.cap(o.r, o.len - o.r, 12), [0, -o.len / 2 + 0.02, 0]);
    if (o.cuffMat) arms(o.cuffMat, K.tube(o.r * 1.12, o.r * 1.12, 0.05, 12), [0, -o.len + 0.03, 0]);
  };
  K.hands = (mat, o) => {
    const y = -D.handY, s = o.s || 1;
    arms(mat, K.blob(0.042 * s, 0.07 * s, 0.07 * s, 10, 8), [0, y + 0.02 * s, 0]);
    for (let i = 0; i < 3; i++) arms(mat, K.blob(0.02 * s, 0.045 * s, 0.02 * s, 8, 6), [0.004, y - 0.06 * s, (0.04 - i * 0.038) * s], [0, 0, 0.12]);
    arms(mat, K.blob(0.021 * s, 0.045 * s, 0.021 * s, 8, 6), [-0.025 * s, y + 0.0, 0.07 * s], [0.6, 0, -0.5]);
  };
  K.hairCap = (mat, hd, th, k, ph0, phL) => put('head', mat, new THREE.SphereGeometry(1, 14, 8, ph0 === undefined ? Math.PI : ph0, phL || Math.PI, 0, Math.PI * th), [0, hd.cy, 0], null, [hd.rx * k, hd.ry * k, hd.rz * k]);
  K.headBase = (mat, o) => {
    put('head', mat, K.blob(o.rx, o.ry, o.rz, 18, 13), [0, o.cy, 0]);
    put('head', mat, K.tube(0.06, 0.06, 0.1, 10), [0, 0.03, 0]);
    sym('head', mat, K.blob(0.03, 0.045, 0.025, 8, 6), [o.rx * 0.98, o.cy - 0.01, -0.01]);
  };
