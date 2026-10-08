# Captains B: picks (nimbus, marrow, kite, gilly)

Method: 404 path B, three candidates per captain with different construction strategies
(a = primitives, b = lathe/extrude profiles, c = a different part breakdown / blockier reading),
`tools/recipe/harness/verify.mjs` (Metal) at --size=560, plus a joint test render per captain
(armR.rotation.x = -1.2, torso.rotation.x = 0.3, legL.rotation.x = 0.5). All 12 candidates pass the gate
with a height .expect.json (1.85 m, gilly 1.55 m, tolerance 5%).

| captain | pick | tris | meshes | size (w x h x d m) |
|---|---|---|---|---|
| nimbus | b (lathe greatcoat, extruded crescent bicorne) | 6712 | 20 | 1.11 x 1.85 x 0.60 |
| marrow | b (lathe coat with torn hem, pinched lathe tricorn) | 3816 | 27 | 0.89 x 1.85 x 0.67 |
| kite | b (lathe torso with teal phi-band panels, spiky hair skirt) | 3912 | 25 | 0.87 x 1.85 x 0.50 |
| gilly | b (lathe stripe bands, ribbed lathe beanie) | 6088 | 22 | 0.65 x 1.55 x 0.37 |

Why each pick (by eye, from the sheets and the posed renders):
- nimbus b: the solid crescent bicorne with gold rim reads from the front and the side; a's half-disc flaps vanish
  edge-on and are near-black on dark; c's thick block hat reads well from the front but is a slab in profile and
  the blocky body loses the reference's barrel chest. b's half-lathe cloud beard + puffs gives the biggest beard.
- marrow b: strongest silhouette (swooping torn tricorn + plumes), ragged hem, hair curtain visible from behind.
  c's torn-flap tricorn is the closest to the reference's "tattered" hat and stays as the runner-up; a's 3-segment
  lathe brim shades as a dark flat band.
- kite b: cleanest wetsuit read (teal side panels sit on the profile), hair frames the face like the reference,
  grin and shades read; a is close (hair cones read as ears at range); c's hair locks read as balls from behind.
- gilly b: ribbed cuff and pompom read best, face is open under the cuff; a is a close second; c is blocky.

Rig (identical in all 12): torso pivot at the hips, head at the neck (child of torso), hat at the top of the head
(child of head), armL/armR at the shoulders (children of torso, +X = captain's left), legL/legR at the hips (children
of g), handL/handR Object3D markers at the palms (children of the arms). Arm geometry sits in an inner splayed
group so every joint rests at rotation 0. One merged mesh per (joint, material); one material per colour.
Files per captain: `<id>/<id>_[abc].js`, `.expect.json`, `verify_sheet.png`, `joint_test.png`.
`picks_captainsB_vs_player.png` = the four picks posed next to cap_player.js for family consistency.
