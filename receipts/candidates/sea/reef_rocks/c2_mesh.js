// reef_rocks, candidate 2: custom: each rock is a low-res icosphere pushed by a deterministic field and flattened at
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
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
  // placement: base at y = 0, centred on x and z (vertex-measured)
  const box = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m4.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
