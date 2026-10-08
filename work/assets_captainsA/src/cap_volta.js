  // ---- DOC VOLTA: white lab coat over green waders, copper goggles on the forehead, wild white hair, copper coil backpack ----
  const D = { H: 1.85, hip: 0.9, legY: 0.88, legX: 0.12, shX: 0.3, shY: 1.33, neck: 1.38, headTop: 1.8, hatTilt: 0, splay: 0.17, handY: 0.55 };
  function dress(K) {
    const coat = M(0xe9e6dc, { roughness: 0.6 }), coatDk = M(0xc9c5b8, { roughness: 0.7 }), green = M(0x5f7a45, { roughness: 0.45 });
    const olive = M(0x6b6a45, { roughness: 0.45 }), oliveDk = M(0x3e3d28, { roughness: 0.6 }), rope = M(0xb59a6a, { roughness: 0.8 });
    const copper = M(0xc46a3a, { roughness: 0.3, metalness: 0.75 }), glass = M(0x1c2a30, { roughness: 0.1, metalness: 0.3 });
    const strapM = M(0x3a3d42, { roughness: 0.6 }), spark = M(0x9fe8ff, { roughness: 0.3, emissive: 0x9fe8ff, emissiveIntensity: 1.4 });
    const skin = M(0xf1c7a0, { roughness: 0.5 }), nose = M(0xe9a582, { roughness: 0.5 }), hairW = M(0xeceae4, { roughness: 0.55 });
    const ink = M(0x15110f, { roughness: 0.2 }), white = M(0xfbf8f0, { roughness: 0.3 });
    // waders and boots
    K.trousers(green, { y0: 0.02, y1: -0.5, r: 0.108 });
    K.boots(olive, oliveDk, { top: -0.5, r: 0.12, w: 0.125, len: 0.4, toeZ: 0.055, soleH: 0.055, cuffMat: olive });
    // long open lab coat: white body, green bib showing down the open front
    K.coat(coat, { y0: -0.36, y1: 0.38, rx: 0.25, rz: 0.18, hemR: 0.29, shH: 0.09 });
    put('torso', green, K.blob(0.15, 0.42, 0.05, 10, 8), [0, -0.02, 0.165]);
    sym('torso', coatDk, new THREE.BoxGeometry(0.035, 0.72, 0.03), [0.15, 0.0, 0.175], [0, 0.4, -0.03]);
    sym('torso', coat, new THREE.BoxGeometry(0.08, 0.16, 0.025), [0.1, 0.34, 0.15], [-0.35, 0.3, -0.35]);
    sym('torso', coatDk, new THREE.BoxGeometry(0.1, 0.11, 0.02), [0.17, -0.12, 0.15], [0, 0.65, 0]);
    put('torso', coatDk, new THREE.BoxGeometry(0.03, 0.34, 0.03), [0, -0.2, -0.205]);
    put('torso', rope, new THREE.TorusGeometry(0.2, 0.017, 5, 16, Math.PI * 0.55), [0, 0.0, 0.0], [Math.PI / 2, 0, Math.PI * 0.225], [1, 0.95, 1]);
    put('torso', rope, K.cap(0.016, 0.16, 5), [0.03, -0.1, 0.205], [0.1, 0, 0.12]);
    // backpack straps and the copper coil backpack
    sym('torso', strapM, new THREE.BoxGeometry(0.04, 0.03, 0.4), [0.15, 0.4, -0.02], [0, 0, 0.35]);
    put('torso', copper, K.tube(0.11, 0.11, 0.3, 14), [0, 0.2, -0.3]);
    put('torso', copper, K.blob(0.11, 0.06, 0.11, 12, 6), [0, 0.35, -0.3]);
    put('torso', copper, K.blob(0.11, 0.05, 0.11, 12, 6), [0, 0.05, -0.3]);
    for (const y of [0.12, 0.28]) put('torso', strapM, new THREE.TorusGeometry(0.112, 0.012, 4, 16), [0, y, -0.3], [Math.PI / 2, 0, 0]);
    const helix = [];
    for (let i = 0; i <= 64; i++) { const t = i / 64, a = t * Math.PI * 2 * 6; helix.push(new THREE.Vector3(-0.07 + Math.cos(a) * 0.05, 0.38 + t * 0.24, -0.3 + Math.sin(a) * 0.05)); }
    put('torso', copper, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 56, 0.01, 3));
    put('torso', copper, K.tube(0.012, 0.012, 0.3, 6), [-0.07, 0.5, -0.3]);
    put('torso', spark, K.blob(0.03, 0.05, 0.03, 8, 6), [-0.07, 0.67, -0.3]);
    sym('torso', spark, new THREE.TorusGeometry(0.1, 0.012, 4, 12, Math.PI * 0.8), [0.11, 0.18, -0.26], [0, Math.PI / 2, 0]);
    // arms
    K.sleeves(coat, { len: 0.44, r: 0.085, cuffMat: coatDk });
    K.hands(skin, { s: 1.3 });
    // head: big grin, bushy white brows
    const hd = { cy: 0.21, rx: 0.17, ry: 0.21, rz: 0.175, chin: -0.06 };
    K.headBase(skin, hd);
    sym('head', ink, K.blob(0.028, 0.04, 0.016, 8, 6), [0.064, 0.24, 0.15 + K.fz]);
    sym('head', white, K.blob(0.008, 0.008, 0.006, 5, 4), [0.071, 0.256, 0.165 + K.fz]);
    sym('head', hairW, K.blob(0.05, 0.022, 0.03, 8, 6), [0.07, 0.29, 0.14 + K.fz], [0, 0, -0.35]);
    put('head', nose, K.blob(0.035, 0.05, 0.048, 12, 8), [0, 0.195, 0.18 + K.fz]);
    const teeth = new THREE.SphereGeometry(0.068, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    put('head', white, teeth, [0, 0.125, 0.14 + K.fz], [0.3, 0, 0], [1, 0.6, 0.42]);
    const lip = new THREE.SphereGeometry(0.074, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    put('head', ink, lip, [0, 0.127, 0.135 + K.fz], [0.3, 0, 0], [1, 0.68, 0.42]);
    // wild hair: a cap over the back and spikes flung up and back
    K.hairCap(hairW, hd, 0.7, 1.06);
    const up = new THREE.Vector3(0, 1, 0);
    const tufts = [[0.9, 0.55], [-0.9, 0.55], [1.5, 0.35], [-1.5, 0.35], [2.1, 0.45], [-2.1, 0.45], [Math.PI, 0.5], [2.6, 0.1], [-2.6, 0.1], [1.8, -0.05], [-1.8, -0.05], [0.45, 0.95], [-0.45, 0.95], [Math.PI, 0.05], [1.2, 1.1], [-1.2, 1.1], [2.5, 0.85], [-2.5, 0.85]];
    for (const [th, ph] of tufts) {
      const n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph));
      const base = new THREE.Vector3(n.x * hd.rx, hd.cy + n.y * hd.ry, n.z * hd.rz).multiplyScalar(0.96).add(new THREE.Vector3(0, hd.cy * 0.04, 0));
      const dir = n.clone().add(new THREE.Vector3(0, 0.25, -0.55)).normalize();
      const len = 0.15 + 0.05 * Math.cos(th * 3) + 0.03 * ph;
      const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir));
      put('head', hairW, new THREE.ConeGeometry(0.06, len, 6, 1), base.addScaledVector(dir, len * 0.42).toArray(), [e.x, e.y, e.z], [1, 1, 0.6]);
    }
    sym('head', hairW, K.blob(0.05, 0.07, 0.07, 8, 6), [0.16, 0.25, -0.02]);
    // goggles on the forehead (the 'hat' joint: they can fly off)
    putHat(copper, new THREE.TorusGeometry(1, 0.012, 4, 22), [0, -0.07, -0.005], [Math.PI / 2 + 0.25, 0, 0], [0.178, 0.188, 1]);
    for (const sd of [1, -1]) {
      const p = [0.065 * sd, -0.05, 0.14];
      if (K.style === 'B') putHat(copper, lathe([[0.045, -0.035], [0.052, -0.03], [0.05, 0.02], [0.056, 0.03], [0.04, 0.035]], 14), p, [Math.PI / 2 - 0.5, 0, 0]);
      else if (K.style === 'C') putHat(copper, K.sq(0.052, 0.035, 0.052, 1, 0.4, 0.9, 14, 6), p, [Math.PI / 2 - 0.5, 0, 0]);
      else putHat(copper, K.tube(0.05, 0.054, 0.065, 14), p, [Math.PI / 2 - 0.5, 0, 0]);
      putHat(glass, new THREE.CircleGeometry(0.04, 14), [p[0], p[1] + 0.017, p[2] + 0.03], [-0.5, 0, 0]);
      putHat(copper, new THREE.TorusGeometry(0.046, 0.009, 4, 14), [p[0], p[1] + 0.018, p[2] + 0.031], [-0.5, 0, 0]);
    }
    putHat(copper, K.tube(0.012, 0.012, 0.03, 6), [0, -0.04, 0.155], [0, 0, Math.PI / 2]);
  }
