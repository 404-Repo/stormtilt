  // ---- shared planform: half-span S, notch at y=4.25, tips at y=5, leading edge sweeps down to the stock at y=2.8 ----
  const S = 3.5, te = (x) => 4.25 + 0.75 * Math.pow(x / S, 1.6) + 0.1 * Math.sin((x / S) * Math.PI * 4) * Math.sin((x / S) * Math.PI),
    le = (x) => 2.75 + 2.25 * Math.pow(x / S, 2.3), curl = (x) => -0.5 * Math.pow(x / S, 2.2);
  const slate = M(0x3b5370, { roughness: 0.35 }), belly = M(0xf3eee3, { roughness: 0.4 });
