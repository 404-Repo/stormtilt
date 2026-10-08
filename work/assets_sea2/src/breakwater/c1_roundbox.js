//@seed 111
//@expect {"width":40,"depth":6.2,"height":9.8}
//@include _common.js
  // c1, profiles: every stone a rounded-rectangle Shape extruded with a bevel (bevel subtracted from the profile,
  // traps.md), varied length, height and depth, laid in running bond with jitter
  const rbox = (sx, sy, sz) => { const b = Math.min(0.18, sz * 0.1), w = sx - 2 * b, h = sy - 2 * b, r = Math.min(w, h) * 0.32, s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const q = new THREE.ExtrudeGeometry(s, { depth: sz - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 1, curveSegments: 2 }); q.translate(0, 0, -(sz - 2 * b) / 2); return q; };
  layout.forEach(([x, y, z, sx, sy, sz], i) => { const m = add(rbox(sx * 0.97, sy * 0.97, sz), SC[Math.floor(hash3(i, 2, 9) * 6)], x, y, z); m.rotation.set(rr(-0.03, 0.03), rr(-0.04, 0.04), rr(-0.04, 0.04)); });
