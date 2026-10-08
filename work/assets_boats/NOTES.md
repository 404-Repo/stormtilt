# assets_boats NOTES (2026-10-08)

## What was done
- 5 Atlas reference sheets (`ref/`, fast, 230 of 600 credits): sloop alone; tug + catamaran; schooner + bathtub;
  three lances; two lances.
- 10 objects x 3 candidates (30 modules), each folder in `receipts/candidates/boats/<id>/` with
  `.expect.json` per candidate, `_verify/sheet.png` (verifier, Metal) and `look.png` (my game-angle render).
  All 30 pass `verify.mjs` clean.
- Picks copied to `game/assets/<id>.js`; anchors in `game/assets/boats.json`; reasons in
  `receipts/candidates/boats/PICKS_boats.md`.

| pick | tris |
|---|---|
| sloop_red (A) | 15,549 |
| tug_barnacle (A) | 18,712 |
| catamaran_kite (A) | 8,890 |
| schooner_brisa (A) | 15,681 |
| bathtub (B) | 8,292 |
| lance_classic (C) | 1,616 |
| lance_long (C) | 1,744 |
| lance_heavy (A) | 1,244 |
| lance_copper (A) | 1,948 |
| lance_swordfish (C) | 1,780 |

## Tools in this folder
- `measure.mjs <module> [captainZ]`: tris, bounds, deck probes (meshes named `deck*`), and obstacles in a
  1.2 x 1.2 x 2.2 m box above the captain spot. Uses a local copy of three r169 (`three.module.js`).
- `look.mjs <out.png> <modules...> [--water=y] [--lance]`: 4 game-angle views per module (Metal, closes its browser).
- `anchors.mjs`, `lanceanchor.mjs`: write `boats.json` entries from the shipped module.
- `src/`: shared section texts used to assemble the B/C variants.

## boats.json conventions (all in each module's own output space: base y=0, centred on x and z)
- `bowZ` / `sternZ` / `hullLength` are the HULL (meshes named `hull`). `length` is the overall bounding box,
  which includes bowsprit, booms, rudders, fenders, the motor and the duck.
- `captainZ = bowZ - 3.25` for yachts. Tub: `bowZ - 0.95`, inside the tub.
- `keelToDeck` is the raycast deck height at (x=0, captainZ). On the catamaran it is the trampoline (2.17).
- `waterlineY`: sloop and schooner 1.05, tug and catamaran 1.0, bathtub 0.55 (my choice: lower tub and feet under).
- Lances: `gripZ` is the centre of the grip behind the vamplate; `axisY` is the y of the shaft axis (the
  loader re-centres and the game re-pivots anyway); `tipZ` / `buttZ` are the ends.
- The schooner's `length` is 15.69 because of the bowsprit and main boom; its hull is 13.0.

## Captain spot checks (measure.mjs, captain box 1.2 m wide, 1.2 m deep, 2.2 m tall)
- Clear on all four yachts. Bathtub: only the tub walls and feet register, because the box is wider than the tub.
- Sloop: the jib's foot passes about 2.0 m above the foredeck at the captain spot, so a 1.85 m captain fits but
  **an upright lance will visually pass through the jib** (the brief's "lance up" rest pose). The same goes for the
  catamaran (jib foot about 2.25 m up) and the schooner (headsails about 2.5 m up). The game may want to
  hide or furl headsails in lance-up moments, or accept the overlap. Not solved here.

## Unverified / caveats
- Not seen in the actual game renderer or its lighting. Navy and cobalt hulls read dark under my ACES test
  light; the schooner navy was lifted for that reason. The catamaran's cobalt jib also reads dark.
- Sails, net, towel and bulwarks use `DoubleSide`; the copper lance bulb is `transparent` (one mesh,
  depthWrite off). Both are noted in traps.md as draw-call costs if the loader clones materials.
- Materials are not named for every part (only timber, metal and fabric where obvious); hull enamel is unnamed.
- The yacht keels are shallow so the keel bottom sits about 1.0 m below the waterline, per the brief. That is
  less than a real fin keel; it is invisible once sunk.
- Two non-picked candidates are over budget (tug B at 26k tris, copper lance B at 2.8k). The picks are all
  within budget.
- No sub-agents, no commits. The Chrome processes still running at the end belong to other agents
  (capture.mjs, snap.mjs); every browser I opened was closed.
