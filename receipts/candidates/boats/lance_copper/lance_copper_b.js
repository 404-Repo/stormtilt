// lance_copper, candidate B: primitives. Cylinder shaft and grip, coil as a stack of tilted tori, cone vamplate with a torus rim, sphere bulb in a brass cage, cone spike.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough, metal, name, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal || 0 }, extra || {})); if (name) m.name = name; return m; };
  const copper = M(0xc46a3a, 0.3, 0.8, "metal"), coilM = M(0xd9824a, 0.25, 0.9, "metal"), brass = M(0xc9a043, 0.3, 0.8, "metal"), leather = M(0x5a3420, 0.8, 0, "fabric");
  const glass = M(0x9fe8ff, 0.08, 0.1, null, { transparent: true, opacity: 0.45, depthWrite: false }), spark = M(0x9fe8ff, 0.4, 0, null, { emissive: 0x9fe8ff, emissiveIntensity: 1.2 });
  const add = (geo, mat) => { const mm = new THREE.Mesh(geo, mat); g.add(mm); return mm; };
  const lathe = (pts, seg, mat) => { const geo = new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg); geo.rotateX(Math.PI / 2); return add(geo, mat); };
  const rS = (z) => 0.078 - 0.02 * (z - 1.0) / 3.5;
  const P = (geo, mat, z) => { geo.rotateX(Math.PI / 2); const m = add(geo, mat); m.position.z = z; return m; };
  P(new THREE.SphereGeometry(0.075, 10, 8), brass, 0.075);
  P(new THREE.CylinderGeometry(0.062, 0.062, 0.48, 12), leather, 0.38);
  const vb = P(new THREE.CylinderGeometry(0.085, 0.225, 0.38, 20, 1, true), brass, 0.8); vb.material.side = THREE.DoubleSide;
  { const rr = add(new THREE.TorusGeometry(0.222, 0.02, 6, 22), brass); rr.position.z = 0.62; }
  P(new THREE.CylinderGeometry(rS(4.55), 0.078, 3.55, 14), copper, 2.775);
  for (let k = 0; k < 11; k++) { const z = 1.2 + k * 0.3; const t = add(new THREE.TorusGeometry(rS(z) + 0.02, 0.018, 4, 14), coilM); t.position.z = z; t.rotation.y = 0.18; }
  const bulb = P(new THREE.SphereGeometry(0.135, 16, 12), glass, 4.76);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; const w = add(new THREE.TorusGeometry(0.145, 0.008, 4, 16, Math.PI), brass); w.position.z = 4.76; w.rotation.set(0, Math.PI / 2, 0); w.rotateX(a); }
  P(new THREE.SphereGeometry(0.035, 8, 6), spark, 4.76);
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), copper, 4.58);
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12), copper, 4.93);
  P(new THREE.ConeGeometry(0.06, 0.53, 12), copper, 5.235);
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
