# PICKS: boats and lances (STORMTILT)

Method: 404 path B. One Atlas reference image per sheet (fast, 46 credits each, 5 calls = 230 credits), three
independent candidates per object, `tools/recipe/harness/verify.mjs` (Metal) on each folder (all 30 clean),
plus a game-angle render (`look.png` in each folder: low 3/4 front, broadside, chase over the stern, low 3/4 rear,
over a sea plane at the waterline). Picked by eye from `_verify/sheet.png` and `look.png`.

References: `work/assets_boats/ref/` (sloop_red.png, tug_cat.png, schooner_tub.png, lances_a.png, lances_b.png).

| object | reference | A | B | C | pick | why |
|---|---|---|---|---|---|---|
| sloop_red | ref/sloop_red.png | lofted hull, custom BufferGeometry from 48 stations painted in y-bands; cambered grid sails | half-lathe hull with sheer warped in, painted beads; flat extruded sails | lift-built stacked waterplane slices; rod-and-ball rails; flat card sails | **A** (15.5k tris) | Smoothest hull and fine bow, star projected onto the cambered main. B's spoon bow is shallow and its transom shows holes from behind; C reads stepped. |
| tug_barnacle | ref/tug_cat.png (left) | lofted superellipse-plan hull with bulwarks, tori tyres, swept pudding ram | lift-built slices with an extruded bulwark ring | lathe about the vertical axis squashed to an oval, one lathe per paint colour | **A** (18.7k) | Raised sheer, round bow and a ram fender that reads. B is over budget (26k) and blocky; C's oval tub is bland. |
| catamaran_kite | ref/tug_cat.png (right) | lofted slim hulls, crowned decks, rope-grid trampoline, extruded aerofoil wing mast | full-lathe spindle hulls stretched tall | primitive hulls (elliptic cylinder, cone bow, hemisphere stern) | **A** (8.9k) | Crisp racing hulls. B is close but softer; C's cone bows facet badly. |
| schooner_brisa | ref/schooner_tub.png (left) | lofted hull, long keel, gaff sails as cambered grids | half-lathe hull with gilt beads | lift-built slices | **A** (15.7k) | Clean hull and overhangs. B's lathe transom shows a dark gap; C is stepped and 21k. Navy lifted from 0x1f2d63 to 0x2a3c82 because it read black. |
| bathtub | ref/schooner_tub.png (right) | three lathes squashed to an oval | superellipse ring loft, roll rim as a closed tube | two scaled open hemispheres plus a torus rim | **B** (8.3k) | Upright walls and a rounded-rectangle plan read as a clawfoot tub; A and C read as basins (C's rope coil also pokes through its curved floor). |
| lance_classic | ref/lances_a.png (top) | lathe body plus a helical red ribbon | primitives, two helix tubes | shaft split into four true helical colour bands | **C** (1.6k) | Boldest barber pole, closest to the reference. B's ring tori were mis-rotated in the first pass (fixed, still weaker). |
| lance_long | ref/lances_a.png (middle) | as classic A, 7 m, slimmer | as classic B | as classic C | **C** (1.7k) | Same reason as classic. |
| lance_heavy | ref/lances_a.png (bottom) | lathe body, helical iron strap ribbon, cup coronel with four prongs | primitives, eight ring bands, three-cone coronel | octagonal three-section shaft, lengthwise straps, crown wall with four points | **A** (1.2k) | Spiral strap matches the reference and the coronel reads. C's crown is good but its straps read as stripes. |
| lance_copper | ref/lances_b.png (top) | lathe body, helix tube coil, glass sphere with glowing filament | primitives, coil from tilted tori, caged bulb | fluted extruded shaft, flat ribbon coil, teardrop flask | **A** (1.9k, trimmed from 2.9k by segment counts) | Only one with a coil that reads as wound wire; the bulb reads. B is over budget (2.8k). |
| lance_swordfish | ref/lances_b.png (bottom) | two half-lathes (cobalt back, silver belly) | primitives: ellipsoid, cone head, cone bill | loft with compressed oval sections, lateral line, flattened bill blade | **C** (1.8k) | Most fish-like (taller than wide, lateral line). B's cone head reads as a pencil. |

Final modules: `game/assets/<id>.js` (byte copies of the picked candidates). Anchors: `game/assets/boats.json`.
