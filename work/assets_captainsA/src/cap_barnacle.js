  // ---- BOSUN BARNACLE: huge barrel-chested, grey beard, knitted blue jumper, maroon beanie, brown boots with barnacles ----
  const D = { H: 1.85, hip: 0.8, legY: 0.78, legX: 0.15, shX: 0.4, shY: 1.3, neck: 1.38, headTop: 1.8, hatTilt: 0.05, splay: 0.24, handY: 0.56 };
  function dress(K) {
    const blue = M(0x3550a8, { roughness: 0.8 }), blueDk = M(0x26397e, { roughness: 0.85 }), navy = M(0x1c2440, { roughness: 0.6 });
    const brown = M(0x5a3420, { roughness: 0.45 }), brownDk = M(0x3a2214, { roughness: 0.6 }), shell = M(0xe6dfcc, { roughness: 0.7 });
    const maroon = M(0x7a2328, { roughness: 0.8 }), maroonDk = M(0x5e1a1f, { roughness: 0.85 });
    const skin = M(0xf0c09a, { roughness: 0.5 }), nose = M(0xe0806c, { roughness: 0.45 }), cheek = M(0xe79a8e, { roughness: 0.6 });
    const grey = M(0x9a9a96, { roughness: 0.75 }), greyLt = M(0xb8b8b2, { roughness: 0.75 }), ink = M(0x15110f, { roughness: 0.2 }), white = M(0xf8f4ea, { roughness: 0.3 });
    // legs: short and thick
    K.trousers(navy, { y0: 0.02, y1: -0.46, r: 0.13 });
    K.boots(brown, brownDk, { top: -0.44, r: 0.13, w: 0.135, len: 0.42, toeZ: 0.06, soleH: 0.06, cuffMat: brownDk });
    // barnacles: clusters on the toes and sides of the boots
    const b = -D.legY;
    const spots = [[0.06, 0.12, 0.2], [-0.05, 0.1, 0.22], [0.0, 0.14, 0.17], [0.12, 0.1, 0.08], [0.12, 0.2, 0.0], [-0.11, 0.13, 0.05], [0.04, 0.25, 0.1]];
    for (const [x, y, z] of spots) {
      legs(shell, K.tube(0.026, 0.014, 0.028, 6), [x, b + y, z + 0.06], [Math.atan2(z, 0.2) * 0.8, 0, -x * 4]);
    }
    // barrel jumper
    K.coat(blue, { y0: -0.14, y1: 0.46, rx: 0.37, rz: 0.29, hemR: 0.33, shH: 0.13, belly: true, neckR: 0.1 });
    put('torso', blueDk, K.tube(0.345, 0.345, 0.08, 22), [0, -0.12, 0], null, [1, 1, 0.84]);
    put('torso', blue, new THREE.TorusGeometry(0.12, 0.06, 7, 16), [0, 0.6, 0], [Math.PI / 2, 0, 0], [1, 0.9, 1]);
    // knit cables down the front and back
    for (const x of [-0.18, -0.06, 0.06, 0.18]) {
      for (const zs of [1, -1]) put('torso', blueDk, new THREE.BoxGeometry(0.028, 0.44, 0.03), [x, 0.17, zs * (0.305 - Math.abs(x) * 0.4)], [zs * -0.12, zs * x * 1.6, 0]);
    }
    // arms
    K.sleeves(blue, { len: 0.44, r: 0.105, cuffMat: blueDk });
    K.hands(skin, { s: 1.45 });
    // head: big red nose, rosy cheeks, full grey beard
    const hd = { cy: 0.2, rx: 0.18, ry: 0.2, rz: 0.18 };
    K.headBase(skin, hd);
    sym('head', ink, K.blob(0.025, 0.034, 0.015, 8, 6), [0.065, 0.25, 0.155 + K.fz]);
    sym('head', white, K.blob(0.008, 0.008, 0.006, 5, 4), [0.071, 0.262, 0.168 + K.fz]);
    sym('head', grey, K.cap(0.022, 0.06, 6), [0.072, 0.31, 0.14 + K.fz], [0, 0, Math.PI / 2 + 0.15]);
    sym('head', cheek, K.blob(0.04, 0.03, 0.015, 8, 6), [0.11, 0.18, 0.14 + K.fz], [0, 0.6, 0]);
    put('head', nose, K.blob(0.05, 0.05, 0.05, 12, 8), [0, 0.19, 0.185 + K.fz]);
    put('head', grey, K.blob(0.2, 0.17, 0.13, 12, 8), [0, 0.06, 0.08 + K.fz]);
    put('head', grey, K.blob(0.14, 0.09, 0.1, 12, 8), [0, -0.05, 0.12 + K.fz]);
    sym('head', greyLt, K.blob(0.07, 0.03, 0.04, 8, 6), [0.05, 0.135, 0.18 + K.fz], [0, 0, -0.35]);
    K.hairCap(grey, hd, 0.62, 1.04);
    sym('head', grey, K.blob(0.04, 0.08, 0.07, 8, 6), [0.165, 0.18, 0.02]);
    // beanie with a turned-up rib band (hat-local, top of the head at 0)
    const k = 1.08;
    if (K.style === 'A') {
      putHat(maroon, new THREE.SphereGeometry(0.19 * k, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), [0, -0.06, 0], null, [1, 0.85, 1]);
      putHat(maroonDk, K.tube(0.205 * k, 0.2 * k, 0.1, 20), [0, -0.1, 0]);
    } else if (K.style === 'B') {
      const p = [[0.2, -0.15], [0.225, -0.14], [0.225, -0.06], [0.205, -0.05], [0.2, 0.0], [0.17, 0.06], [0.12, 0.1], [0.05, 0.115], [0, 0.118]].map(([r, y]) => [r * k, y]);
      putHat(maroon, lathe(p.slice(3), 22));
      putHat(maroonDk, lathe(p.slice(0, 4), 22));
    } else {
      putHat(maroon, K.sq(0.2 * k, 0.13, 0.2 * k, 0.9, 0.75, 0.82, 18, 10), [0, -0.02, 0]);
      putHat(maroonDk, K.sq(0.218 * k, 0.05, 0.218 * k, 1, 0.35, 1, 18, 6), [0, -0.1, 0]);
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      putHat(maroon, new THREE.BoxGeometry(0.02, 0.08, 0.012), [Math.sin(a) * 0.209 * k, -0.1, Math.cos(a) * 0.209 * k], [0, a, 0]);
    }
  }
