  // ---- shared: 24 m line, ends at y = 2.5, rope sags 1.62 m, flags 0.86 m long hang from it ----
  const HALF = 12, YE = 2.5, SAG = 1.62, FL = 0.86, FW = 0.7, NF = 22;
  g.userData.mounts = ["left", "right"];   // the two ends tie off to masts or poles; end-on it is legitimately a line
  const ropeY = (x) => YE - SAG * (1 - Math.pow(x / HALF, 2));
  const FC = [0xd7372f, 0xf2b630, 0x2a5bd7, 0xf3eee3].map((c) => { const m = M(c, { roughness: 0.6, side: THREE.DoubleSide }); m.name = 'fabric'; return m; });
  const ropeM = M(0xb59a6a, { roughness: 0.8 }); ropeM.name = 'fabric';
  const brass = M(0xc9a043, { roughness: 0.3, metalness: 0.7 }); brass.name = 'metal';
  const flagAt = (i) => { const x = -HALF + (i + 1) * (2 * HALF) / (NF + 1); return { x, y: ropeY(x), slope: Math.atan(2 * SAG * x / (HALF * HALF)), tw: Math.sin(i * 1.9) * 0.35, mat: FC[i % 4] }; };
  for (const sx of [-1, 1]) { add(new THREE.TorusGeometry(0.16, 0.05, 6, 12), brass, sx * (HALF + 0.12), YE + 0.04, 0); add(new THREE.SphereGeometry(0.1, 8, 6), brass, sx * HALF, YE, 0); }
