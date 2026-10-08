# Sea assets: picks (asset agent, 2026-10-08)

References (Atlas `fast`, 4 sheets, 184 credits): `ref/sheet1.png` galleon; `ref/sheet2.png` buoy, lifebuoy, barrel, gull;
`ref/sheet3.png` lighthouse, sea stack, reef rocks; `ref/sheet4.png` spectator launch, judges' barge.
Each folder holds the three candidates, their `.expect.json` and the verify `sheet.png`. `final_sheet.png` shows all picks
verified together (11/11 clean). Method: three construction strategies per object, `tools/recipe/harness/verify.mjs`, pick by eye.

| object | tris | c1 | c2 | c3 | pick |
|---|---|---|---|---|---|
| galleon_nimbus | 14,122 | primitives (box, half cylinder, half ellipsoid hull) | lofted hull from height-parametrised sections (custom BufferGeometry), bellied sails | stacked planform slabs (bread-and-butter extrusions) | **c2** |
| buoy_lane | 1,604 | stacked cylinder frusta | one lathe profile cut into colour bands | spar on a torus fender float | **c2** |
| lifebuoy | 1,472 | eight torus arcs | lathe sectors + tube rope | bevelled extruded annulus sectors | **c1** |
| barrel_float | 816 | three cylinder frusta | bulged lathe | 12 bent custom staves | **c3** |
| gull | 512 | primitives, box wings | lathe body, extruded wing planforms | faceted icosahedra, cambered custom wings | **c3** |
| lighthouse | 1,956 | frusta + dodecahedron rock pile | lathe tower in bands, ragged lathe rock | octagonal faceted tower, terraced extruded rock | **c2** |
| sea_stack_a / _b | 1,564 / 2,092 | jittered 7-sided drums | custom column with a radius field, banded | four fused pillars of extruded strata slabs | **c3** |
| reef_rocks | 605 | dodecahedra + foam icosahedra | displaced icospheres with foam made from their own top faces | tilted bevelled prism slabs | **c2** |
| spectator_boat | 2,897 | box + half-cylinder hull | lofted hull | stacked planform slabs | **c1** |
| judges_barge | 3,191 | box hull with sloped end boxes | punt side profile extruded across the beam | twin pontoons | **c2** |

Why:
- galleon c2: the only hull that reads as a real galleon (sheer rising to the stern castle, tumblehome, closed transom). c1's stern wedge juts out under the stern. c3 shows stepped strips under the transom. One iteration: the flat bolts cut through the bellied sails, so they are now plates clear of each face. The bolts read from the front and in three-quarter view.
- buoy c2: the smooth rounded float and tapering striped tower are closest to the reference. c3 is a different buoy type.
- lifebuoy c1: cleanest quarters. c2's lathe seams show dark lines, and c3's extruded stripes look odd.
- barrel c3: the staves give it the barrel read at no extra cost (same tris as c1).
- gull c3: the pointed, cambered black-tipped wings read best as a gull. Wings shortened once to hit the 1.2 m span.
- lighthouse c2: cleanest gallery and lantern, and the ragged faceted rock matches the reference.
- sea stacks c3: the broken silhouette of fused blocks matches the reference and reads at distance. c2 had the better base flare, but its guano streaks float off the surface.
- reef c2: foam crusts the rock tops as in the reference. c1 reads as bubbles and c3 as paving slabs.
- spectator c1: the big cobalt lower hull matches the reference. In c2 the cobalt band almost vanishes.
- barge c2: clean punt hull. c3's pontoons poke up through the deck, and c1's raked end boxes stick out below the hull.

Note: the spectator boat and the barge share one upperworks block (canopy, figures, bunting, bell) across their three
candidates. Only the hull construction differs, so those comparisons are hull comparisons.
