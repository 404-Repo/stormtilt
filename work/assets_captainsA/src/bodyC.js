  // ---- body kit C: superellipsoid vinyl blocks (sphere vertices remapped into rounded boxes) ----
  K.style = 'C';
  K.fz = 0.014;
  // pxz shapes the plan (1 = round, 0.4 = boxy), py the profile; taper scales the top relative to the bottom
  const sq = (rx, ry, rz, pxz, py, taper, ws, hs) => {
    const q = new THREE.SphereGeometry(1, ws || 12, hs || 8), a = q.attributes.position;
    const f = (t, p) => Math.sign(t) * Math.pow(Math.abs(t), p);
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
      const k = taper ? 1 + (taper - 1) * (y + 1) / 2 : 1;
      a.setXYZ(i, f(x, pxz) * rx * k, f(y, py) * ry, f(z, pxz) * rz * k);
    }
    q.computeVertexNormals();
    return q;
  };
  K.sq = sq;
  K.blob = (rx, ry, rz, ws, hs) => sq(rx, ry, rz, 0.9, 0.9, 1, ws || 12, hs || 9);
  K.tube = (rBot, rTop, h, seg) => sq(Math.max(rBot, rTop), h / 2, Math.max(rBot, rTop), 1, 0.3, rTop / Math.max(rBot, rTop), seg || 14, 10);
  K.cap = (r, len, seg) => sq(r, len / 2 + r, r, 1, 0.75, 1, seg || 10, 10);
  K.trousers = (mat, o) => {
    const h = o.y0 - o.y1;
    legs(mat, sq(o.r, h / 2 + 0.02, o.r, 0.85, 0.45, 1 / (o.taper || 0.9), 12, 8), [0, (o.y0 + o.y1) / 2, 0]);
  };
  K.boots = (mat, sole, o) => {
    const b = -D.legY, sh = o.soleH || 0.05;
    const shaftH = o.top - (b + 0.08);
    legs(mat, sq(o.r * 1.02, shaftH / 2, o.r * 1.02, 0.8, 0.4, 0.96, 12, 8), [0, b + 0.08 + shaftH / 2, 0]);
    legs(mat, sq(o.w, 0.095, o.len / 2, 0.7, 0.75, 1, 14, 8), [0, b + sh + 0.045, o.toeZ]);
    legs(sole, sq(o.w * 1.06, sh / 2, o.len / 2 * 1.04, 0.6, 0.25, 1, 16, 6), [0, b + sh / 2, o.toeZ]);
    if (o.cuffMat) legs(o.cuffMat, sq(o.r * 1.16, 0.035, o.r * 1.16, 0.8, 0.4, 1, 14, 6), [0, o.top - 0.02, 0]);
  };
  K.coat = (mat, o) => {
    const h = o.y1 - o.y0, sh = o.shH || 0.1, full = h + sh;
    const bk = o.belly ? 1.08 : 1;
    put('torso', mat, sq(o.hemR * bk, full / 2, o.rz * (o.hemR / o.rx) * bk * (o.belly ? 1.06 : 1), 0.62, 0.55, o.rx / o.hemR, 18, 13), [0, o.y0 + full / 2, 0]);
  };
  K.sleeves = (mat, o) => {
    arms(mat, sq(o.r * 1.04, o.len / 2 + 0.02, o.r * 1.04, 0.85, 0.6, 1.0, 10, 8), [0, -o.len / 2 + 0.02, 0]);
    if (o.cuffMat) arms(o.cuffMat, sq(o.r * 1.16, 0.03, o.r * 1.16, 0.85, 0.4, 1, 12, 6), [0, -o.len + 0.03, 0]);
  };
  K.hands = (mat, o) => {
    const y = -D.handY, s = o.s || 1;
    arms(mat, sq(0.04 * s, 0.085 * s, 0.068 * s, 0.7, 0.8, 1, 10, 8), [0, y + 0.0, 0]);
    arms(mat, sq(0.022 * s, 0.045 * s, 0.022 * s, 1, 0.8, 1, 8, 8), [-0.022 * s, y + 0.01, 0.065 * s], [0.6, 0, -0.5]);
  };
  K.hairCap = (mat, hd, th, k, ph0, phL) => {
    const q = new THREE.SphereGeometry(1, 14, 8, ph0 === undefined ? Math.PI : ph0, phL || Math.PI, 0, Math.PI * th), a = q.attributes.position;
    const f = (t, p) => Math.sign(t) * Math.pow(Math.abs(t), p), tp = 1 - (hd.chin || 0) * 2;
    for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i), kk = 1 + (tp - 1) * (y + 1) / 2; a.setXYZ(i, f(x, 0.86) * kk, f(y, 0.86), f(z, 0.86) * kk); }
    q.computeVertexNormals();
    put('head', mat, q, [0, hd.cy, 0], null, [hd.rx * k, hd.ry * k, hd.rz * k]);
  };
  K.headBase = (mat, o) => {
    put('head', mat, sq(o.rx, o.ry, o.rz, 0.86, 0.86, 1 - (o.chin || 0) * 2, 18, 13), [0, o.cy, 0]);
    put('head', mat, K.tube(0.06, 0.06, 0.1, 10), [0, 0.03, 0]);
    sym('head', mat, K.blob(0.03, 0.045, 0.025, 8, 6), [o.rx * 0.98, o.cy - 0.01, -0.01]);
  };
