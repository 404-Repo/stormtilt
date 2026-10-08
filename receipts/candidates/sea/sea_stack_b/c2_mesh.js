// sea_stack_b, candidate 2: one custom BufferGeometry column: radius field r(angle, y) with ledges per stratum, split
export default function (THREE) {
  const g = new THREE.Group();
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.32 }, o));
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const rod = (a, b, r, mat, seg = 6, parent = g) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = add(new THREE.CylinderGeometry(r, r, d.length(), seg), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); return s; };
// into band meshes by height so each stratum has its own colour; flat shaded chunky facets
  const H = 50, R = 9.5; let sd = 29; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const cols = [0xc98a4a, 0xd9a866, 0x7d6f86, 0xb06a3a, 0xc29a6e, 0x8e7c8f].map((c) => { const m = M(c, { roughness: 0.85, flatShading: true }); m.name = 'stone'; return m; });
  const grass = M(0x6a9a3a, { roughness: 0.8, flatShading: true }); grass.name = 'foliage'; const guano = M(0xf2efe2, { roughness: 0.7 });
  const ph = [rnd() * 6, rnd() * 6, rnd() * 6], NA = 10;
  // band edges
  const edges = [0]; while (edges[edges.length - 1] < H) edges.push(Math.min(H, edges[edges.length - 1] + 2.5 + rnd() * 3.5));
  const jog = edges.map(() => 0.9 + rnd() * 0.16);
  const rad = (a, y, bi) => { const t = y / H, flare = 1 + 0.45 * Math.pow(Math.max(0, 1 - y / (H * 0.18)), 2);
    return R * (0.95 - 0.2 * t) * flare * jog[bi] * (1 + 0.13 * Math.sin(a * 2 + ph[0]) + 0.08 * Math.sin(a * 3 + ph[1] + t * 4) + 0.05 * Math.sin(a * 5 + ph[2])); };
  for (let bi = 0; bi < edges.length - 1; bi++) { const y0 = edges[bi], y1 = edges[bi + 1], pos = [], idx = [], NY = 2;
    for (let j = 0; j <= NY; j++) { const y = y0 + (y1 - y0) * j / NY; for (let i = 0; i <= NA; i++) { const a = i / NA * Math.PI * 2, r = rad(a, y, bi) * (j === NY ? 0.96 : 1); pos.push(Math.cos(a) * r, y, Math.sin(a) * r); } }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NA; i++) { const p = j * (NA + 1) + i, q = p + NA + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); }
    // ledge cap (top ring to centre) so the band reads as a stacked slab
    const c0 = pos.length / 3; pos.push(0, y1, 0); for (let i = 0; i < NA; i++) idx.push(c0, NY * (NA + 1) + i + 1, NY * (NA + 1) + i);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, bi % 2 ? cols[(bi * 3) % 6] : cols[bi % 6]); }
  // grassy top: a domed lathe cap + tufts
  const rt = rad(0, H, edges.length - 2) * 0.9; add(new THREE.SphereGeometry(rt, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), grass, 0, H - 0.2, 0).scale.y = 0.18;
  for (let i = 0; i < 10; i++) { const a = rnd() * 6.28, d = rnd() * rt * 0.75; add(new THREE.ConeGeometry(0.5 + rnd() * 0.5, 1.4 + rnd(), 4), grass, Math.cos(a) * d, H + 0.5, Math.sin(a) * d); }
  // guano streaks: thin tapered strips hanging off ledges
  for (let i = 0; i < 7; i++) { const a = rnd() * 6.28, bi = 2 + Math.floor(rnd() * (edges.length - 3)), y = edges[bi], len = 3 + rnd() * 5, r = rad(a, y - len / 2, bi - 1) + 0.15;
    const s = add(new THREE.ConeGeometry(0.4, len, 3), guano, Math.cos(a) * r, y - len / 2, Math.sin(a) * r); s.rotation.x = Math.PI; s.scale.z = 0.3; s.rotation.y = -a; }
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
