  // ---- rig core: identical in every STORMTILT captain ----
  // Joints are Groups placed AT the joint with zero rest rotation; geometry hangs off them,
  // merged per joint per material (one mesh per colour per moving part).
  const V3 = THREE.Vector3;
  const g = new THREE.Group();
  g.name = 'captain';
  const matCache = new Map();
  function M(hex, o) {
    o = o || {};
    const key = hex + '|' + JSON.stringify(o);
    if (!matCache.has(key)) {
      const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.32, metalness: 0, side: THREE.DoubleSide }, o));
      matCache.set(key, m);
    }
    return matCache.get(key);
  }
  const W = {}, J = {};
  function joint(name, parent, wx, wy, wz) {
    const o = new THREE.Group();
    o.name = name;
    W[name] = new V3(wx, wy, wz);
    const pw = parent ? W[parent] : new V3();
    o.position.set(wx - pw.x, wy - pw.y, wz - pw.z);
    (parent ? J[parent] : g).add(o);
    J[name] = o;
  }
  joint('torso', null, 0, D.hip, 0);
  joint('head', 'torso', 0, D.neck, 0);
  joint('hat', 'head', 0, D.headTop, 0);
  joint('armL', 'torso', D.shX, D.shY, 0);
  joint('armR', 'torso', -D.shX, D.shY, 0);
  joint('legL', null, D.legX, D.legY, 0);
  joint('legR', null, -D.legX, D.legY, 0);

  const B = new Map();
  const _e = new THREE.Euler(), _q = new THREE.Quaternion();
  function TRS(p, r, s) {
    _e.set(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0);
    _q.setFromEuler(_e);
    return new THREE.Matrix4().compose(new V3(p ? p[0] : 0, p ? p[1] : 0, p ? p[2] : 0), _q.clone(), new V3(s ? s[0] : 1, s ? s[1] : 1, s ? s[2] : 1));
  }
  function add(jn, mat, geo, localM) {
    let q = geo.index ? geo.toNonIndexed() : geo;
    q.deleteAttribute('uv');
    if (!q.attributes.normal) q.computeVertexNormals();
    q.applyMatrix4(localM);
    const k = jn + '|' + mat.uuid;
    if (!B.has(k)) B.set(k, { jn, mat, list: [] });
    B.get(k).list.push(q);
  }
  const mir = (p, sd) => (p ? [p[0] * sd, p[1], p[2]] : null);
  const mirR = (r, sd) => (r ? [r[0], r[1] * sd, r[2] * sd] : null);
  // joint-local placement
  function put(jn, mat, geo, p, r, s) { add(jn, mat, geo, TRS(p, r, s)); }
  // a mirrored pair on one joint (x and -x)
  function sym(jn, mat, geo, p, r, s) { for (const sd of [1, -1]) put(jn, mat, geo.clone(), mir(p, sd), mirR(r, sd), s); }
  // arm frame: origin at the shoulder, the arm hangs along -y, splayed out by D.splay
  function armFrame(sd) { return new THREE.Matrix4().makeRotationZ(sd * D.splay); }
  function putArm(sd, mat, geo, p, r, s) { add(sd > 0 ? 'armL' : 'armR', mat, geo, armFrame(sd).multiply(TRS(mir(p, sd), mirR(r, sd), s))); }
  function arms(mat, geo, p, r, s) { putArm(1, mat, geo.clone(), p, r, s); putArm(-1, mat, geo, p, r, s); }
  // legs: origin at each hip joint
  function putLeg(sd, mat, geo, p, r, s) { put(sd > 0 ? 'legL' : 'legR', mat, geo, mir(p, sd), mirR(r, sd), s); }
  function legs(mat, geo, p, r, s) { putLeg(1, mat, geo.clone(), p, r, s); putLeg(-1, mat, geo, p, r, s); }

  function mergeList(list) {
    let n = 0;
    for (const q of list) n += q.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3);
    let o = 0;
    for (const q of list) { P.set(q.attributes.position.array, o * 3); N.set(q.attributes.normal.array, o * 3); o += q.attributes.position.count; }
    const r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.BufferAttribute(P, 3));
    r.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    r.computeBoundingSphere();
    return r;
  }
  function lathe(pts, seg) { return new THREE.LatheGeometry(pts.map((a) => new THREE.Vector2(Math.max(0.0005, a[0]), a[1])), seg || 16); }

  function finish() {
    for (const { jn, mat, list } of B.values()) {
      const m = new THREE.Mesh(mergeList(list), mat);
      m.castShadow = true; m.receiveShadow = true; m.name = jn + '_part';
      J[jn].add(m);
    }
    // palm markers, in the arm frame
    const hands = {};
    for (const sd of [1, -1]) {
      const h = new THREE.Object3D();
      h.name = sd > 0 ? 'handL' : 'handR';
      h.position.set(0, -D.handY, D.handZ || 0).applyMatrix4(armFrame(sd));
      J[sd > 0 ? 'armL' : 'armR'].add(h);
      hands[h.name] = h;
    }
    const measure = () => {
      const box = new THREE.Box3(), v = new V3();
      g.updateMatrixWorld(true);
      g.traverse((n) => {
        const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
        for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld));
      });
      return box;
    };
    // exact height: every joint has zero rest rotation, so scaling joint offsets and geometry is exact
    let box = measure();
    const k = D.H / (box.max.y - box.min.y);
    g.traverse((n) => { if (n === g) return; n.position.multiplyScalar(k); if (n.isMesh) { n.position.set(0, 0, 0); n.geometry.scale(k, k, k); n.geometry.computeBoundingSphere(); } });
    box = measure();
    const c = box.getCenter(new V3());
    g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
    g.userData.joints = { torso: J.torso, head: J.head, hat: J.hat, armL: J.armL, armR: J.armR, legL: J.legL, legR: J.legR, handL: hands.handL, handR: hands.handR };
    return g;
  }
  const K = { THREE, D, M, put, sym, putArm, arms, putLeg, legs, lathe, TRS, J };
