# Captains, batch A: picks

Agent: assets_captainsA. Method: 404 path B, three candidates per captain, `tools/recipe/harness/verify.mjs` (Metal copy), pick by eye from the verify sheet plus a second sheet rendered through the game's own `assetlib.js` with `keepHierarchy: true` (face close-up, rest three-quarter, posed three-quarter, posed side, posed back, a 25 m view).

All five use one rig core, so the structure is identical in every captain: Groups `torso` (hips), `head` (neck, child of torso), `hat` (top of head, child of head), `armL`/`armR` (shoulders, children of torso, +X = captain's left), `legL`/`legR` (hips, children of g), Object3D `handL`/`handR` at the palm centres, all zero rest rotation, on `g.userData.joints`. Geometry is merged per joint per material inside the module (one mesh per colour per moving part). Facing +Z, base y = 0, exact height (1.85 m, pip 1.55 m).

The three strategies (the body, head and hat are built differently; captain-specific props are shared code):

- **A, assembled primitives**: spheres, cylinders and capsules.
- **B, lathe profiles**: coat, sleeves, trousers, boots (foot swept along +Z), head and hats each one `LatheGeometry` profile.
- **C, superellipsoid vinyl blocks**: sphere vertices remapped into rounded boxes (boxier toy reading).

| captain | reference | pick | tris | meshes | why |
|---|---|---|---|---|---|
| player | ref/captains/player.png | **B** | 6742 | 22 | the lathe sou'wester has the sloped, rolled brim of the reference; face reads at 25 m |
| pip | ref/captains/pip.png | **B** | 7652 | 27 | lathe dixie cap with a turned rim and navy band matches best; worried face clear |
| barnacle | ref/captains/barnacle.png | **B** | 7906 | 25 | smooth barrel chest (A's belly reads as a separate bulge); best beanie fold |
| volta | ref/captains/volta.png | **A** | 7524 | 26 | B and C look almost the same but are over 8k tris (8444, 8112) |
| brisa | ref/captains/brisa.png | **A** | 7512 | 25 | the three differ mainly in the tricorn crown; B and C are over 8k (9078, 8294) |

Rejected candidates over the 8k budget: volta_B, volta_C, brisa_B, brisa_C, barnacle_C (8374). They are kept as receipts only.

Per-captain folders hold `<id>_A/B/C.js`, the `.expect.json` files, `verify_sheet.png`, `verify_report.json` and `joint_test_and_face.png` (columns: face, rest, posed with armR.x = -1.2, torso.x = 0.3, legL.x = 0.5, hat.x = -0.4, then posed side, posed back, 25 m). `joint_test_shipped.png` is the same test on the five files in `game/assets/`, and `verify_sheet_picks.png` is the verifier on those five (5/5 clean).
