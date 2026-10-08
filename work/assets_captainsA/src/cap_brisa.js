  // ---- CONTESSA BRISA: slim duelist, navy and gold naval tailcoat, black tricorn with a white plume, white gloves, tall black boots ----
  const D = { H: 1.85, hip: 0.92, legY: 0.9, legX: 0.1, shX: 0.26, shY: 1.36, neck: 1.4, headTop: 1.81, hatTilt: 0.08, splay: 0.14, handY: 0.54 };
  function dress(K) {
    const navy = M(0x1f2a55, { roughness: 0.35 }), gold = M(0xc9a043, { roughness: 0.3, metalness: 0.75 }), black = M(0x16161c, { roughness: 0.4 });
    const bootM = M(0x101014, { roughness: 0.18 }), white = M(0xf6f3ea, { roughness: 0.45 }), hairM = M(0x1d1b22, { roughness: 0.45 });
    const skin = M(0xf3cdb0, { roughness: 0.5 }), cheek = M(0xeb9d98, { roughness: 0.6 }), ink = M(0x15110f, { roughness: 0.2 }), lipM = M(0xc0504d, { roughness: 0.4 });
    const plume = M(0xf8f6f0, { roughness: 0.7 });
    // legs: slim trousers in tall glossy boots
    K.trousers(black, { y0: 0.02, y1: -0.4, r: 0.085 });
    K.boots(bootM, black, { top: -0.38, r: 0.098, w: 0.1, len: 0.34, toeZ: 0.05, soleH: 0.045, cuffMat: bootM });
    const b = -D.legY;
    legs(black, K.tube(0.104, 0.104, 0.035, 14), [0, b + 0.13, 0.0]);
    legs(gold, new THREE.BoxGeometry(0.05, 0.045, 0.02), [0.03, b + 0.13, 0.1], [0, 0.3, 0]);
    // tailcoat (torso-local, hips at 0)
    K.coat(navy, { y0: -0.1, y1: 0.4, rx: 0.21, rz: 0.155, hemR: 0.215, shH: 0.08 });
    sym('torso', navy, new THREE.BoxGeometry(0.15, 0.42, 0.03), [0.085, -0.25, -0.13], [0.18, -0.12, 0]);
    sym('torso', gold, new THREE.BoxGeometry(0.015, 0.42, 0.034), [0.16, -0.25, -0.125], [0.18, -0.12, 0]);
    sym('torso', gold, new THREE.BoxGeometry(0.15, 0.015, 0.034), [0.085, -0.455, -0.093], [0.18, -0.12, 0]);
    sym('torso', gold, new THREE.BoxGeometry(0.018, 0.5, 0.02), [0.1, 0.15, 0.142], [0, 0.55, 0]);
    for (let i = 0; i < 4; i++) sym('torso', gold, K.blob(0.013, 0.013, 0.01, 6, 4), [0.06, 0.06 + i * 0.075, 0.155]);
    sym('torso', gold, new THREE.BoxGeometry(0.11, 0.03, 0.025), [0.17, -0.06, 0.1], [0, 0.85, 0]);
    put('torso', navy, new THREE.TorusGeometry(0.09, 0.035, 6, 14), [0, 0.46, -0.01], [Math.PI / 2 - 0.2, 0, 0]);
    put('torso', gold, new THREE.TorusGeometry(0.09, 0.012, 4, 14, Math.PI), [0, 0.475, 0.0], [Math.PI / 2 - 0.2, 0, Math.PI]);
    put('torso', white, K.blob(0.07, 0.035, 0.035, 8, 6), [0, 0.43, 0.12]);
    put('torso', white, K.blob(0.05, 0.05, 0.03, 8, 6), [0, 0.37, 0.14], [0.3, 0, 0]);
    // arms: navy sleeves, deep gold cuffs, white gloves
    K.sleeves(navy, { len: 0.42, r: 0.07, cuffMat: gold });
    arms(white, K.tube(0.07, 0.06, 0.06, 10), [0, -0.46, 0]);
    K.hands(white, { s: 1.2 });
    // head: rosy cheeks, smile, monocle
    const hd = { cy: 0.21, rx: 0.16, ry: 0.2, rz: 0.165, chin: -0.07 };
    K.headBase(skin, hd);
    sym('head', ink, K.blob(0.024, 0.034, 0.014, 8, 6), [0.06, 0.235, 0.146 + K.fz]);
    sym('head', white, K.blob(0.007, 0.007, 0.005, 5, 4), [0.066, 0.248, 0.158 + K.fz]);
    sym('head', hairM, K.cap(0.01, 0.05, 6), [0.065, 0.29, 0.138 + K.fz], [0, 0, Math.PI / 2 + 0.2]);
    sym('head', cheek, K.blob(0.035, 0.025, 0.012, 8, 6), [0.1, 0.18, 0.135 + K.fz], [0, 0.6, 0]);
    put('head', skin, K.blob(0.026, 0.036, 0.03, 8, 6), [0, 0.2, 0.17 + K.fz]);
    put('head', lipM, new THREE.TorusGeometry(0.035, 0.008, 4, 10, Math.PI), [0, 0.15, 0.152 + K.fz], [0.25, 0, Math.PI]);
    put('head', gold, new THREE.TorusGeometry(0.038, 0.007, 4, 14), [-0.06, 0.235, 0.155 + K.fz], [-0.1, -0.35, 0]);
    put('head', gold, K.tube(0.003, 0.003, 0.2, 4), [-0.1, 0.12, 0.13 + K.fz], [0, 0, -0.15]);
    // long wavy black hair: cap over the back, waves down to the shoulders
    K.hairCap(hairM, hd, 0.72, 1.07);
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 0.5 + (i / 6) * Math.PI;
      put('head', hairM, K.blob(0.065, 0.11, 0.06, 8, 6), [Math.sin(a) * 0.15, 0.08 + (i % 2) * 0.02, Math.cos(a) * 0.12 - 0.02], [0, a, 0]);
    }
    sym('head', hairM, K.blob(0.04, 0.09, 0.045, 8, 6), [0.155, 0.08, 0.0]);
    put('head', hairM, K.blob(0.15, 0.05, 0.08, 10, 6), [0, 0.37, 0.08], [0.4, 0, 0]);
    // tricorn: crown + three upturned brim panels (one point to the front), gold edge, white plume
    const k = 1.12, R = 0.27 * k;
    if (K.style === 'B') putHat(black, lathe([[0, 0.07], [0.09, 0.065], [0.15, 0.03], [0.175, -0.04], [0.18, -0.09], [0, -0.09]].map(([r, y]) => [r * k, y]), 18));
    else if (K.style === 'C') putHat(black, K.sq(0.18 * k, 0.08, 0.18 * k, 0.85, 0.6, 0.85, 18, 10), [0, -0.01, 0]);
    else { putHat(black, new THREE.SphereGeometry(0.18 * k, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2), [0, -0.03, 0], null, [1, 0.55, 1]); putHat(black, K.tube(0.18 * k, 0.18 * k, 0.06, 18), [0, -0.06, 0]); }
    putHat(black, new THREE.CylinderGeometry(R, R, 0.02, 3), [0, -0.09, 0]);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 3 + i * (2 * Math.PI / 3), d = R * 0.5, w = R * Math.sqrt(3) * 0.98;
      const pos = [Math.sin(a) * d, -0.04, Math.cos(a) * d];
      const pan = new THREE.BoxGeometry(w, 0.12, 0.025); pan.translate(0, 0.05, 0); pan.rotateX(0.32);
      putHat(black, pan, [pos[0], -0.09, pos[2]], [0, a, 0]);
      const edge = new THREE.BoxGeometry(w * 0.98, 0.018, 0.032); edge.translate(0, 0.11, 0); edge.rotateX(0.32);
      putHat(gold, edge, [pos[0], -0.09, pos[2]], [0, a, 0]);
    }
    putHat(gold, K.blob(0.025, 0.025, 0.012, 8, 6), [0.1, 0.0, 0.11], [0, 0.6, 0]);
    // plume sweeping up and back from the left of the crown
    putHat(plume, K.blob(0.045, 0.13, 0.03, 8, 6), [0.13, 0.08, 0.02], [-0.5, 0, -0.35]);
    putHat(plume, K.blob(0.035, 0.09, 0.025, 8, 6), [0.16, 0.18, -0.06], [-1.0, 0, -0.3]);
    putHat(plume, K.blob(0.025, 0.06, 0.02, 6, 5), [0.17, 0.22, -0.14], [-1.6, 0, -0.2]);
  }
