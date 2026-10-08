# Sea set 2: picks (asset agent sea2, 2026-10-08)

References (Atlas `fast`, 4 sheets, 184 credits of the 400 budget), in `ref/`: `s1_stacks_arch.png` two stacks and the
arch; `s2_wreck_whale.png` wreck and fluke; `s3_breakwater_bunting.png` breakwater and bunting; `s4_island.png` island.
Each folder holds three candidates, their `.expect.json` files and the verify `sheet.png`. `final_sheet.png` shows all
the picks verified together: 7 of 8 clean (bunting_line warns, see below). Verified with `tools/recipe/harness/verify.mjs` (Metal).

Rock language, shared by the stacks, the arch and the island cliffs: one mesh per rock, coloured by vertex colour in soft
horizontal strata (ochre, rust, violet-grey, sand), with each band blending into the next and no colour repeated next to
itself. Grass goes on up-facing surfaces near the top and on ledges, and foam-white boulders sit at the base. The surface
is a world-space noise warp, so seams never crack, with normals smoothed across seams. That replaces the old stacked
Jenga drums. The colour is baked deliberately (`vertexColors`, one material), and `assetlib` buckets by attribute signature, so it survives the merge.

| object | tris | c1 | c2 | c3 | pick |
|---|---|---|---|---|---|
| sea_stack_a (38 m) | 4,080 | lathe profile, polar notch + one-sided overhang, 3-scale warp | stacked irregular extruded slabs, merged and warped | displaced icosahedra on a leaning spine | **c1** |
| sea_stack_b (52 m) | 5,488 | same lathe, plus a fused shoulder pillar | slabs | icosahedra with two legs (a small arch) | **c1** |
| sea_arch (45 x 35 m) | 3,840 | elliptical tube lofted along the arch centreline | arch outline extruded in 3 slices | icosahedra strung along the curve | **c1** |
| shipwreck (14 x 9 m) | 4,084 | plank boxes strake by strake, jagged break | one lofted hull skin, vertex-coloured strakes | ribcage skeleton with surviving strake ribbons | **c1** |
| whale_tail (7 x 5 m) | 1,520 | whole outline extruded + lathe stock + patch blobs | lofted lens-section flukes, vertex-colour patches | flattened ellipsoids | **c1** |
| breakwater (40 x 6 x 4 m) | 6,848 | bevelled rounded-rect extrusions in running bond | warped icosahedron boulders | superellipsoid pillows | **c1** |
| bunting_line (24 m) | 1,288 | cylinder rope + flattened 3-sided cones | tube rope + thin bevelled triangle extrusions | tube rope + billowing cloth triangles | **c2** |
| island_far (180 x 45 m) | 4,404 | polar heightfield, two humps, rim cliffs, foam shore | contour-layer extrusions | five warped ellipsoids | **c1** |

Why:
- Stacks c1: the only one that reads as one organic rock. c2 reads as a stacked pagoda, which is the failure we are replacing. c3 reads as a stack of pebbles.
- Arch c1: a clean thick arch with grass on the crown, close to the reference. In c2 the earcut cap triangles show as big flat facets, and c3 reads as a caterpillar.
- Wreck c1: the plank seams give the timber read and a solid silhouette at distance. c3's thin ribs will alias to mush at 100 m and beyond on a phone. c2 reads as an intact smooth boat.
  The mast, yard, rags, rope and rubble are shared by all three candidates, so this was a hull comparison.
- Whale c1: closest to the reference fluke, with clean underside patches. c2's patches came out one-sided and blocky, and c3 looks like a propeller.
- Breakwater c1: rounded blocks like the reference, within the 8k budget. c3 (8.4k) went over it, and c2 reads as rubble.
  The colours are weighted toward warm greys, with an ochre or rust block now and then, so the wall does not checkerboard. The tower, lamp and bollards are shared by all three candidates.
- Bunting c2: chunky enamel pennants like the reference. c1's flattened cones turn edge-on at three-quarter view. c3 is close, but softer than the toy style.
- Island c1: the clearest hump, cliff and shore silhouette. c2 reads as a layer cake, and c3 reads as boulders. The village is shared by all three candidates.

Known warning: bunting_line shows "left/right face is empty". Seen end-on, a 24 m line covers about 0.3% of the frame, and
the verifier's empty test (below 0.5%) is not waived by `mounts`. The ends are declared `mounts: ['left','right']` (they tie off to poles).
