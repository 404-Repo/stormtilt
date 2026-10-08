# Captains B notes (nimbus, marrow, kite, gilly)

- Source: `src/kit.js` (shared rig + per-(joint,material) merge + scale-to-height + centring) and
  `src/<id>_<a|b|c>.body.js`; `node src/build.mjs` inlines kit + body into self-contained modules in `<id>/`.
  No imports, no textures, no vertex arrays over 64 numbers.
- `src/jointtest.mjs out.png mod.js...`: puppeteer (Metal args), renders rest / posed 3/4 / posed side / face.
- `src/inspect.mjs mod.js [1]`: node-side tri/mesh counts and joint world positions (uses a local three 0.169).
- Picks: all four are candidate b. Shipped to game/assets/cap_{nimbus,marrow,kite,gilly}.js.
  Tris/meshes: nimbus 6712/20, marrow 3816/27, kite 3912/25, gilly 6088/22. All verify ok at 1.85 m (gilly 1.55).
- Joint test: limbs rotate about their joints without tearing on all four (receipts/.../<id>/joint_test.png).
- Atlas credits used: 0.

Known gaps / unverified:
- Not tested inside the game with ASSET(url, {keepHierarchy: true}); the joints dict follows the loader's
  carryDeclarations format (object of Object3D refs, nodes named cap_*) but I did not load it in the game.
- Joint pivots differ slightly between captains after scale-to-height (nimbus torso pivot y 0.94, cap_player 0.84).
- Emissive eyes/bolts read pale cyan-white under ACES in my test render, not saturated cyan.
- gilly b: a faint thin line at the shoulders near the roll neck in close-up (cause not found; invisible at range).
- marrow's hat is large relative to the reference; deliberate for read at 40 m, easy to scale (brim scale in body).
- The coat skirt is torso geometry, so a large leg swing passes through it (no cloth).
