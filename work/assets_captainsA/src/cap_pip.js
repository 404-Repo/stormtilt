  // ---- PIP TILLER: small rookie, orange life vest over a white shirt, white sailor cap with a navy band, yellow boots ----
  const D = { H: 1.55, hip: 0.72, legY: 0.7, legX: 0.115, shX: 0.27, shY: 1.1, neck: 1.15, headTop: 1.62, hatTilt: 0.14, splay: 0.2, handY: 0.45 };
  function dress(K) {
    const orange = M(0xf0812a, { roughness: 0.3 }), orangeDk = M(0xc8611c, { roughness: 0.4 }), tan = M(0xb98a52, { roughness: 0.5 });
    const white = M(0xf3eee3, { roughness: 0.4 }), navy = M(0x1f2a55, { roughness: 0.45 }), khaki = M(0xcdb68c, { roughness: 0.7 });
    const yel = M(0xf2b630, { roughness: 0.25 }), yelDk = M(0xc98f1c, { roughness: 0.5 });
    const skin = M(0xf1c7a0, { roughness: 0.5 }), nose = M(0xeda07c, { roughness: 0.5 }), hair = M(0x5b3a22, { roughness: 0.6 });
    const ink = M(0x15110f, { roughness: 0.2 }), brass = M(0xc9a043, { roughness: 0.3, metalness: 0.7 });
    // legs: shorts, bare shins, rubber boots
    K.trousers(khaki, { y0: 0.02, y1: -0.22, r: 0.115, taper: 1.0 });
    K.trousers(skin, { y0: -0.12, y1: -0.46, r: 0.062 });
    K.boots(yel, yelDk, { top: -0.4, r: 0.1, w: 0.112, len: 0.34, toeZ: 0.05, soleH: 0.05, cuffMat: yel });
    // life vest over the torso
    K.coat(orange, { y0: -0.1, y1: 0.33, rx: 0.255, rz: 0.2, hemR: 0.25, shH: 0.1 });
    sym('torso', orange, K.blob(0.11, 0.17, 0.07, 10, 8), [0.1, 0.17, 0.15]);
    put('torso', orange, K.blob(0.2, 0.17, 0.07, 10, 8), [0, 0.15, -0.16]);
    put('torso', orangeDk, new THREE.BoxGeometry(0.02, 0.36, 0.03), [0, 0.1, 0.205]);
    put('torso', orange, new THREE.TorusGeometry(0.12, 0.055, 6, 14), [0, 0.39, -0.01], [Math.PI / 2 - 0.15, 0, 0], [1, 0.95, 1]);
    put('torso', white, K.blob(0.07, 0.06, 0.04), [0, 0.37, 0.12]);
    put('torso', tan, K.tube(0.27, 0.27, 0.06, 20), [0, 0.0, 0], null, [1, 1, 0.82]);
    put('torso', tan, new THREE.BoxGeometry(0.11, 0.07, 0.04), [0, 0.0, 0.225]);
    put('torso', brass, new THREE.BoxGeometry(0.05, 0.03, 0.02), [0, 0.0, 0.25]);
    // arms: white short sleeve with a navy band over a bare arm
    K.sleeves(skin, { len: 0.36, r: 0.052 });
    K.sleeves(white, { len: 0.17, r: 0.078, cuffMat: navy });
    K.hands(skin, { s: 1.3 });
    // big head, worried face
    const hd = { cy: 0.25, rx: 0.2, ry: 0.23, rz: 0.2, chin: -0.02 };
    K.headBase(skin, hd);
    sym('head', ink, K.blob(0.03, 0.045, 0.018, 8, 6), [0.072, 0.27, 0.172 + K.fz]);
    sym('head', white, K.blob(0.009, 0.009, 0.006, 5, 4), [0.08, 0.288, 0.188 + K.fz]);
    sym('head', hair, K.cap(0.013, 0.055, 6), [0.075, 0.345, 0.16 + K.fz], [0, 0, Math.PI / 2 - 0.4]);
    put('head', nose, K.blob(0.04, 0.046, 0.05, 12, 8), [0, 0.215, 0.205 + K.fz]);
    put('head', ink, K.blob(0.034, 0.013, 0.012, 10, 6), [0, 0.13, 0.178 + K.fz], [0, 0, 0.08]);
    put('head', M(0xe9a8a0, { roughness: 0.5 }), K.blob(0.036, 0.02, 0.01, 8, 6), [0, 0.12, 0.172 + K.fz]);
    K.hairCap(hair, hd, 0.6, 1.05);
    sym('head', hair, K.blob(0.024, 0.055, 0.035, 8, 6), [0.175, 0.31, 0.1]);
    // sailor cap (hat-local, top of the head at 0)
    const k = 1.1;
    if (K.style === 'A') {
      putHat(navy, K.tube(0.215 * k, 0.215 * k, 0.075, 22), [0, -0.075, 0]);
      putHat(white, new THREE.SphereGeometry(0.235 * k, 22, 8, 0, Math.PI * 2, 0, Math.PI / 2), [0, -0.035, 0], null, [1, 0.5, 1]);
      putHat(white, new THREE.TorusGeometry(0.235 * k, 0.03, 6, 26), [0, -0.035, 0], [Math.PI / 2, 0, 0]);
    } else if (K.style === 'B') {
      const p = [[0.205, -0.115], [0.218, -0.11], [0.22, -0.04], [0.245, -0.035], [0.26, -0.02], [0.255, 0.0], [0.23, 0.04], [0.17, 0.08], [0.09, 0.1], [0, 0.105]].map(([r, y]) => [r * k, y]);
      putHat(white, lathe(p.slice(2), 24));
      putHat(navy, lathe([[0.205 * k, -0.115], [0.222 * k, -0.11], [0.222 * k, -0.035], [0.2 * k, -0.03]], 24));
    } else {
      putHat(navy, K.sq(0.218 * k, 0.04, 0.218 * k, 1, 0.35, 1, 22, 8), [0, -0.075, 0]);
      putHat(white, K.sq(0.245 * k, 0.07, 0.245 * k, 0.95, 0.7, 0.85, 22, 10), [0, 0.0, 0]);
    }
  }
