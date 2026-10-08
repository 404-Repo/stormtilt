# assets_sea NOTES (sea asset agent, 2026-10-08)

Done: 11 modules in game/assets/ (galleon_nimbus, buoy_lane, lifebuoy, barrel_float, gull, lighthouse, sea_stack_a,
sea_stack_b, reef_rocks, spectator_boat, judges_barge), plus game/assets/galleon.json. Each object has 3 candidates
here (<id>/), was verified with tools/recipe/harness/verify.mjs (Metal), and was picked by eye. Final set verified
together: _final/_verify/sheet.png, 11/11 clean. Receipts: receipts/candidates/sea/ (PICKS_sea.md, candidates,
sheets, refs).

How it is built: src/<id>/*.body.js are wrapped by src/build.sh with an identical header/footer (src/_head.js,
src/_foot.js), so every module stands alone (no imports). The sea stacks come from src/_stack/*.tpl with
H/R/seed swapped. The galleon was written directly (galleon_nimbus/*.js). measure.mjs + a local three.module.js (r169)
measure modules in node: bbox, tris, joints, and `mark_*` markers.

galleon.json (module space, base y=0, centred): length 23.0 overall (bowsprit tip to stern lanterns; the hull alone
runs bowZ 7.39 to sternZ -11.01 = 18.4 m), beam 7.0 (hull; yards span 9.8), keelToDeck 4.6 (forecastle deck),
captainZ 4.49 (clear space on the forecastle, nothing between z 4.2 and the bowsprit butt at about 6.3), waterlineY 1.4,
mastTopY 21.97 (truck ball top; the mainmast top itself is 21.6). The module also carries empty Object3Ds named
mark_captain / mark_waterline / mark_masttop / mark_bow / mark_stern. They are dropped by a merging ASSET() load and
survive keepHierarchy.

Gull: g.userData.joints = { wingL, wingR }. wingL extends to +x; its pivot is at the shoulder (x = +0.06). Positive
rotation.z raises wingL and LOWERS wingR (mirror the sign for wingR). Each wing has a child `hand` group at the elbow,
pre-bent about 0.3 rad down. Load with keepHierarchy: true or the joints are lost.

What failed / caveats:
- The first Atlas call ran from the wrong cwd (the scratch dir did not exist yet). The 4 images landed in
  ~/astrocade-game6/ref/ and were moved here (ref/), leaving nothing behind there. The prompts also lost the
  STYLE_LOCK sentence (empty shell variable). The images still came out on-style (toy, enamel, plain background),
  so I kept them rather than spend again. Spent: 184 of 550 credits.
- The sea stacks measure 38.0 m and 53.3 m tall (brief 35 / 50) because of the grass tufts and slab jitter: within
  the 10% tolerance, not exact.
- The judges' barge is 15.0 m overall (14 m hull plus the stern flag and the bow mooring chain).
- The spectator boat and the barge share one upperworks block across their candidates. Only the hull construction
  differs.
- Reef rocks: a few icosphere faces look slightly off where the base is flattened. This is not visible at lane
  distance and unverified in game.
- Nothing checked in the game itself. No game build, no in-water view, no draw-call count (the galleon is 198 meshes
  before any merge).
- waterspout_base skipped, as the brief said.
