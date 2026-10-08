  // ---- PLAYER: young captain, red oilskin, yellow sou'wester, dark trousers, black boots ----
  const D = { H: 1.85, hip: 0.86, legY: 0.84, legX: 0.125, shX: 0.3, shY: 1.28, neck: 1.33, headTop: 1.77, hatTilt: 0.22, splay: 0.15, handY: 0.55 };
  function dress(K) {
    const red = M(0xd7372f, { roughness: 0.22 }), redDk = M(0xa82822, { roughness: 0.3 }), yel = M(0xf2b630, { roughness: 0.25 });
    const navy = M(0x1f2a44, { roughness: 0.6 }), boot = M(0x1b1c20, { roughness: 0.28 }), sole = M(0x0c0c0e, { roughness: 0.6 });
    const skin = M(0xf1c7a0, { roughness: 0.5 }), nose = M(0xeaa27e, { roughness: 0.5 }), hair = M(0x5a3622, { roughness: 0.6 });
    const ink = M(0x15110f, { roughness: 0.2 }), white = M(0xf8f4ea, { roughness: 0.3 });
    const brass = M(0xc9a043, { roughness: 0.3, metalness: 0.7 }), strap = M(0x23262e, { roughness: 0.5 });
    // legs (leg-local, hip joint at 0)
    K.trousers(navy, { y0: 0.02, y1: -0.5, r: 0.108 });
    K.boots(boot, sole, { top: -0.48, r: 0.118, w: 0.12, len: 0.4, toeZ: 0.055, soleH: 0.055 });
    // coat (torso-local, hip pivot at 0)
    K.coat(red, { y0: -0.16, y1: 0.4, rx: 0.265, rz: 0.19, hemR: 0.29, shH: 0.09 });
    put('torso', redDk, new THREE.BoxGeometry(0.035, 0.6, 0.03), [0, 0.1, 0.18]);
    for (const y of [-0.02, 0.12, 0.26]) put('torso', brass, K.tube(0.018, 0.018, 0.075, 8), [0, y, 0.2], [0, 0, Math.PI / 2]);
    sym('torso', redDk, new THREE.BoxGeometry(0.11, 0.035, 0.03), [0.15, -0.04, 0.155], [0, 0.6, 0]);
    put('torso', redDk, new THREE.BoxGeometry(0.03, 0.3, 0.03), [0, -0.06, -0.185]);
    put('torso', redDk, new THREE.BoxGeometry(0.4, 0.03, 0.03), [0, 0.3, -0.17], [-0.3, 0, 0]);
    put('torso', red, new THREE.TorusGeometry(0.105, 0.045, 6, 16), [0, 0.47, -0.005], [Math.PI / 2, 0, 0], [1, 0.9, 1]);
    sym('torso', red, new THREE.BoxGeometry(0.09, 0.1, 0.03), [0.07, 0.42, 0.15], [-0.3, 0, -0.5]);
    // arms (shoulder frame)
    K.sleeves(red, { len: 0.44, r: 0.085, cuffMat: redDk });
    K.hands(skin, { s: 1.35 });
    // head (neck joint at 0)
    const hd = { cy: 0.225, rx: 0.19, ry: 0.215, rz: 0.19, chin: -0.04 };
    K.headBase(skin, hd);
    sym('head', ink, K.blob(0.031, 0.044, 0.018, 8, 6), [0.07, 0.26, 0.163 + K.fz]);
    sym('head', white, K.blob(0.009, 0.009, 0.006, 5, 4), [0.078, 0.277, 0.179 + K.fz]);
    sym('head', hair, K.cap(0.014, 0.06, 6), [0.075, 0.325, 0.153 + K.fz], [0, 0, Math.PI / 2 + 0.18]);
    put('head', nose, K.blob(0.042, 0.048, 0.05, 12, 8), [0, 0.205, 0.193 + K.fz]);
    const teeth = new THREE.SphereGeometry(0.07, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    put('head', white, teeth, [0, 0.14, 0.158 + K.fz], [0.3, 0, 0], [1, 0.6, 0.42]);
    const lip = new THREE.SphereGeometry(0.077, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    put('head', ink, lip, [0, 0.142, 0.153 + K.fz], [0.3, 0, 0], [1, 0.68, 0.42]);
    K.hairCap(hair, hd, 0.62, 1.05);
    sym('head', hair, K.blob(0.028, 0.06, 0.045, 8, 6), [0.175, 0.27, 0.04]);
    put('head', hair, K.blob(0.12, 0.05, 0.07, 10, 6), [0.03, 0.39, 0.1], [0.3, 0, 0.1]);
    put('head', strap, new THREE.TorusGeometry(0.2, 0.01, 4, 16, Math.PI * 1.1), [0, 0.25, 0.04], [0, 0, Math.PI - 0.05 * Math.PI], [1, 1.12, 1]);
    // sou'wester (hat-local, top of the head at 0); back brim longer and lower
    const k = 1.16;
    if (K.style === 'A') {
      putHat(yel, new THREE.SphereGeometry(0.182 * k, 22, 9, 0, Math.PI * 2, 0, Math.PI / 2), [0, -0.03, 0], null, [1, 0.72, 1.04]);
      putHat(yel, K.tube(0.186 * k, 0.182 * k, 0.08, 22), [0, -0.07, 0], null, [1, 1, 1.04]);
      putHat(yel, new THREE.CylinderGeometry(0.185 * k, 0.29 * k, 0.075, 26, 1, true), [0, -0.145, -0.02], [-0.1, 0, 0], [1, 1, 1.06]);
      putHat(yel, new THREE.TorusGeometry(0.29 * k, 0.015, 5, 26), [0, -0.18, -0.025], [Math.PI / 2 - 0.1, 0, 0], [1, 1.06, 1]);
    } else if (K.style === 'B') {
      const p = [[0, 0.1], [0.08, 0.095], [0.145, 0.065], [0.18, 0.005], [0.188, -0.095], [0.215, -0.12], [0.29, -0.165], [0.31, -0.185], [0.3, -0.2], [0.28, -0.19], [0.2, -0.145], [0.172, -0.12]].map(([r, y]) => [r * k, y]);
      putHat(yel, lathe(p, 26), [0, 0, -0.02], [-0.1, 0, 0], [1, 1, 1.05]);
    } else {
      putHat(yel, K.sq(0.185 * k, 0.13, 0.192 * k, 0.85, 0.6, 0.86, 20, 14), [0, -0.03, 0]);
      putHat(yel, K.sq(0.3 * k, 0.022, 0.315 * k, 1, 0.5, 1, 26, 8), [0, -0.145, -0.025], [-0.1, 0, 0]);
    }
  }
