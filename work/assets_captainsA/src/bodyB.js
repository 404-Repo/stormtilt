  // ---- body kit B: lathe profiles swept about each part's own axis ----
  K.style = 'B';
  K.fz = 0;
  const arc = (rx, ry, n, a0, a1, cy) => { const p = []; for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; p.push([rx * Math.sin(t), (cy || 0) - ry * Math.cos(t)]); } return p; };
  K.blob = (rx, ry, rz, ws) => { const q = lathe(arc(1, 1, 7, 0, Math.PI), ws || 11); q.scale(rx, ry, rz); return q; };
  K.tube = (rBot, rTop, h, seg) => lathe([[0, -h / 2], [rBot * 0.9, -h / 2], [rBot, -h / 2 + Math.min(0.015, h * 0.2)], [rTop, h / 2 - Math.min(0.015, h * 0.2)], [rTop * 0.9, h / 2], [0, h / 2]], seg || 12);
  K.cap = (r, len, seg) => { const p = arc(r, r, 4, 0, Math.PI / 2, -len / 2).concat(arc(r, r, 4, Math.PI / 2, Math.PI, len / 2)); return lathe(p, seg || 8); };
  // a lathe swept about +z (for feet): profile [r, along], flattened in y by fy
  const latheZ = (pts, seg, fx, fy) => { const q = lathe(pts, seg || 14); q.rotateX(Math.PI / 2); q.scale(fx || 1, fy || 1, 1); return q; };
  K.trousers = (mat, o) => {
    const t = o.taper || 0.9, h = o.y0 - o.y1;
    legs(mat, lathe([[0, o.y0], [o.r, o.y0], [o.r * 1.04, o.y0 - h * 0.35], [o.r * 0.98 * (1 + t) / 2, o.y0 - h * 0.6], [o.r * t, o.y1 + 0.02], [o.r * t * 0.7, o.y1 - 0.02], [0, o.y1 - 0.03]], 14));
  };
  K.boots = (mat, sole, o) => {
    const b = -D.legY, sh = o.soleH || 0.05, r = o.r;
    legs(mat, lathe([[0, b + 0.08], [r * 1.06, b + 0.08], [r * 1.02, b + 0.2], [r, o.top - 0.04], [r * 1.12, o.top - 0.02], [r * 1.12, o.top], [r * 0.85, o.top + 0.005], [0, o.top]], 16));
    // foot: profile along z from heel to toe, widest at the ball
    const L = o.len, foot = [[0, -L / 2], [o.w * 0.75, -L / 2 + 0.01], [o.w * 0.95, -L / 2 + L * 0.2], [o.w, L * 0.1], [o.w * 0.88, L * 0.3], [o.w * 0.55, L / 2 - 0.015], [0, L / 2]];
    legs(mat, latheZ(foot, 16, 1, 0.1 / o.w), [0, b + sh + 0.045, o.toeZ]);
    const soleP = foot.map(([a, z]) => [a * 1.06, z * 1.04]);
    const sq = latheZ(soleP, 16, 1, 1); sq.scale(1, (sh / 2) / o.w, 1);
    legs(sole, sq, [0, b + sh / 2, o.toeZ]);
    if (o.cuffMat) legs(o.cuffMat, lathe([[r * 1.0, o.top - 0.06], [r * 1.16, o.top - 0.05], [r * 1.18, o.top + 0.0], [r * 1.0, o.top + 0.01]], 16));
  };
  K.coat = (mat, o) => {
    const h = o.y1 - o.y0, sz = o.rz / o.rx, rx = o.rx, sh = o.shH || 0.1;
    const p = [[0, o.y0], [o.hemR * 0.96, o.y0], [o.hemR, o.y0 + 0.02], [(o.hemR + rx) / 2 * (o.belly ? 1.12 : 1), o.y0 + h * 0.4], [rx * (o.belly ? 1.05 : 1), o.y0 + h * 0.75], [rx, o.y1 - 0.02]];
    for (let i = 1; i <= 5; i++) { const t = (i / 5) * Math.PI / 2; p.push([Math.max(o.neckR || 0.07, rx * Math.cos(t)), o.y1 + sh * Math.sin(t)]); }
    p.push([0, o.y1 + sh]);
    put('torso', mat, lathe(p, 22), null, null, [1, 1, o.belly ? sz * 1.08 : sz]);
  };
  K.sleeves = (mat, o) => {
    const r = o.r, L = o.len;
    arms(mat, lathe([[0, 0.05], [r * 0.7, 0.045], [r * 0.98, 0.0], [r * 1.02, -L * 0.4], [r * 1.08, -L + 0.06], [r * 1.12, -L + 0.01], [r * 0.85, -L], [0, -L]], 12));
    if (o.cuffMat) arms(o.cuffMat, lathe([[r * 1.0, -L + 0.06], [r * 1.16, -L + 0.05], [r * 1.18, -L + 0.0], [r * 0.9, -L - 0.005]], 12));
  };
  K.hands = (mat, o) => {
    const y = -D.handY, s = o.s || 1;
    const mit = lathe([[0, 0.07], [0.04, 0.065], [0.062, 0.02], [0.066, -0.04], [0.055, -0.085], [0.03, -0.105], [0, -0.11]], 12);
    mit.scale(0.62 * s, s, s);
    arms(mat, mit, [0, y + 0.02 * s, 0]);
    arms(mat, K.cap(0.022 * s, 0.05 * s, 8), [-0.022 * s, y + 0.0, 0.065 * s], [0.6, 0, -0.5]);
  };
  K.hairCap = (mat, hd, th, k, ph0, phL) => put('head', mat, new THREE.SphereGeometry(1, 14, 8, ph0 === undefined ? Math.PI : ph0, phL || Math.PI, 0, Math.PI * th), [0, hd.cy, 0], null, [hd.rx * k, hd.ry * k, hd.rz * k]);
  K.headBase = (mat, o) => {
    const p = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12 * Math.PI; p.push([o.rx * Math.sin(t) * (1 + (o.chin || 0) * Math.cos(t)), o.cy - o.ry * Math.cos(t)]); }
    put('head', mat, lathe(p, 20), null, null, [1, 1, o.rz / o.rx]);
    put('head', mat, K.tube(0.06, 0.06, 0.1, 10), [0, 0.03, 0]);
    sym('head', mat, K.blob(0.03, 0.045, 0.025, 8), [o.rx * 0.98, o.cy - 0.01, -0.01]);
  };
