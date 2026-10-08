// lance_copper, candidate A: lathe body (pommel, grip, brass bell, copper shaft, spike), helix coil as a TubeGeometry, spherical glass bulb with a glowing filament.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {})); if (name) m.name = name; return m; };
  const copper = M(0xc46a3a, 0.3, 0.8, "metal"), coilM = M(0xd9824a, 0.25, 0.9, "metal"), brass = M(0xc9a043, 0.3, 0.8, "metal"), leather = M(0x5a3420, 0.8, 0, "fabric");
  const glass = M(0x9fe8ff, 0.08, 0.1, null, { transparent: true, opacity: 0.45, depthWrite: false }), spark = M(0x9fe8ff, 0.4, 0, null, { emissive: 0x9fe8ff, emissiveIntensity: 1.2 });
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const rS = (z) => 0.078 - 0.02 * (z - 1.0) / 3.5;
  lathe([[0.001, 0], [0.07, 0.02], [0.08, 0.07], [0.06, 0.13]], 12, brass);
  lathe([[0.06, 0.12], [0.064, 0.6]], 12, leather);
  for (const z of [0.16, 0.56]) { const t = add(new THREE.TorusGeometry(0.064, 0.012, 5, 14), brass); t.position.z = z; }
  const vb = lathe([[0.07, 0.6], [0.2, 0.61], [0.225, 0.64], [0.215, 0.67], [0.15, 0.76], [0.1, 0.9], [0.08, 1.0]], 18, brass); vb.material.side = THREE.DoubleSide;
  { const rr = add(new THREE.TorusGeometry(0.222, 0.018, 5, 20), brass); rr.position.z = 0.635; }
  lathe([[0.078, 1.0], [rS(4.5), 4.5], [0.075, 4.52], [0.075, 4.6], [0.05, 4.62]], 14, copper);
  { const pts = []; for (let i = 0; i <= 120; i++) { const z = 1.12 + 3.3 * i / 120, a = 2 * Math.PI * (z - 1.12) / 0.32; const r = rS(z) + 0.022; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 110, 0.02, 3, false), coilM); }
  const bulb = add(new THREE.SphereGeometry(0.135, 12, 8), glass); bulb.position.z = 4.76;
  { const pts = []; for (let i = 0; i <= 30; i++) { const z = 4.66 + 0.2 * i / 30, a = i * 0.9; pts.push(new THREE.Vector3(Math.cos(a) * 0.03, Math.sin(a) * 0.03, z)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.009, 3, false), spark); }
  lathe([[0.05, 4.88], [0.07, 4.9], [0.07, 4.97], [0.04, 5.0], [0.001, 5.5]], 12, copper);
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
