# assets_sea2 notes

What I did:
- Made 4 Atlas `fast` reference sheets (184 credits; budget 400), in `ref/`.
- Built 24 candidate modules, three per object across 8 objects, from `src/` with `build.mjs`. The build inlines the
  shared `src/_prelude.js` helpers (seeded noise, world-space warp, normal smoothing, merge, strata vertex colour,
  boulders) and `src/_place.js` (the contract's vertex-measured placement). Each output file is self-contained:
  `export default function (THREE)`, no imports, and no literal arrays over 64 numbers.
- Ran `cand/<id>/` through tools/recipe verify.mjs (Metal), picked by eye, and iterated (see PICKS_sea2.md).
- `picks/` holds the 8 finals and `picks/_verify/sheet.png`. They are copied to game/assets/ (sea_stack_a and _b replaced).

What failed or got fixed along the way:
- Stacks v1: the lathe read as a mushroom and the slabs and blobs read as stacked. Fixed with a one-sided overhang, a
  deeper notch, anisotropic warp (vertical fluting), and a fused shoulder pillar for b.
- Arch v1: inverted loft winding (inside-out, grass underneath). Fixed.
- Wreck v1: 14 m tall (tilt too steep). Reduced the tilt and the sheer, now 9.1 m. The plank colours had checkered, so they now alternate per strake only.
- Bunting: the verifier warns "end face empty" (inherent to a line); left as is and documented.

Unverified:
- Not seen in the game. These have not been loaded through world.js at distance against the painted sky on a phone,
  and nothing places the new ids yet (shipwreck, sea_arch, whale_tail, breakwater, bunting_line, island_far).
  game/assets/list.json was NOT edited (outside my brief), so the lead must add the new ids there and in world.js.
- Sizes vs brief: sea_arch measures 49 x 37.6 m including the base boulders (rock alone is about 45). breakwater is 9.9 m tall including
  its 5.9 m light tower (the wall is 4 m). island_far is 52 m tall including the chapel (land about 34 m), 182 m long.
  shipwreck is 14.4 m long and 9.1 m tall. whale_tail is 7.2 x 5.1 m. All are within the 25% tolerance.
- Rock uses `vertexColors` on a white material. That is fine with game/assetlib.js (it buckets by attribute set). If the game
  ever applies `surfaces: true`, the stone texture multiplies over the bands. Not tested.
