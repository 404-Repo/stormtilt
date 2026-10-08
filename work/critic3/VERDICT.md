# Critic 3 verdict: "does it look like a made thing?"

Judged blind, image by image. One question per pair: which frame reads as a finished, art-directed, shipped game frame in motion.

Recurring game (my guess): **the sailing joust game** (HUD "YOU / TILT n / rival portrait", "HOLD COUCH" button, STEER slider, RAM / OUT OF REACH gauge, rivals Pip, Doc Volta, Kite, Marrow, Barnacle, The Admiral). It is in all 10 podium pairs, all 6 floor pairs (opposite a primitive build of the same concept) and all 6 concept pairs. Below I call it "Sail".

## Podium (10 pairs)

| Pair | Sail side | Winner | Margin | What decided it (location) |
|---|---|---|---|---|
| 01 | B | A (racer) | slight | A: one frame treatment top to bottom (CRT bezel, dash HUD, dithered golden sky). B: red and white pole splits the frame dead centre, rigging lines cross the view, unexplained grey spar enters top right. |
| 02 | B | B (Sail) | decisive | A: thick dark rope cuts diagonally across the whole frame, flat placeholder panels ("Show chart", "Bell empty"), cropped mid-terrace. B: two hulls fill the frame, splinter burst lower right, clear "LATE COUCH!" read. |
| 03 | B | A (racer) | clear | B: tilted sea that is 70% empty teal, a shapeless white blob lower left (island or foam decal, unshaded), "CHARGED!" ring around a boat too small to read, plain dark instruction bar at top. A: lantern, cherry trees, warning sign, all on style. |
| 04 | A | B (temple) | slight | A: frame is two pink sail planes cropped tight, flat colour with no fold or shading, blurry white bokeh blobs lower left that read as a bug. B: plain but coherent, crisp character, readable gate. |
| 05 | B | A (racer) | clear | B: thin straight white polylines across the centre water read as debug lines; "CHARGED!" text overlaps its own target ring; waterspout is a blurred smear. A: night road with lit lane markers; only flaw is a ring of grey dust blobs around the car. |
| 06 | B | B (Sail) | decisive | A: huge flat grey mass on the right, cut-away wall, cropped, reads unfinished. B: two boats in collision, splinters, legible "BOTH HIT!". |
| 07 | A | B (temple) | clear | A: deck cam behind a grey translucent haze (sail or rain plane near the lens) that washes the whole middle; mast blocks centre; player tiny lower left; dark rectangle behind the RAM gauge. B: running pose, clean read. |
| 08 | A | A (Sail) | clear | A: best Sail frame: warm backlight, rival galleon silhouette, the Admiral's taunt; bloom wash lower left is the only cost. B: flat close cam on a wall and a box. |
| 09 | A | B (racer) | clear | A: tilted empty teal, cyan arc wedge clipped by lower right corner, foam blobs at a "CHARGED!" ring over a tiny tug. B: composed golden-hour road. |
| 10 | B | B (Sail) | decisive | Same terrace frame as 02 (rope across frame, placeholder panels) vs a Sail collision close-up. |

**Sail on podium: 4 won, 6 lost.** It beats the terrace game 4 of 4 and loses to the racer 4 of 4 and the temple game 2 of 2. Every win is a tight top-down collision shot (or the one backlit storm shot). Every loss is a wide shot of empty water or a deck cam blocked by mast, rigging and haze.

## Floor (6 pairs)

The other side is a primitive build of the same idea: untextured box cabins, white square particles, plain text "HIT! BOTH HIT", tutorial line at bottom.

| Pair | Sail side | Winner | Margin | What decided it (location) |
|---|---|---|---|---|
| 01 | A | A (Sail) | clear | B: white squares as spray, untextured box cabin. A wins on materials and HUD despite the empty-water, blob-island layout. |
| 02 | A | A (Sail) | clear | A: storm sky, cliff, rival on the horizon, character on deck. B's sunset is good but the boat is primitive. |
| 03 | A | A (Sail) | slight | A: flat white blob decal mid-frame and a smeared waterspout; only HUD and materials carry it. B is primitive but legible. Too close for a polished build vs a floor. |
| 04 | B | B (Sail) | clear | B: CHARGED read, gauge, rival. A: box hulls, stick splinters. B costs: white blown-out wave behind the text, "OUT OF REACH" partly hidden. |
| 05 | A | A (Sail) | slight | A: camera sits inside the Admiral's rigging, a jumble of spars and dark sails over the frame, long instruction text. Wins only on surface. |
| 06 | B | **A (floor)** | clear | B: camera has lost the boats. The whole frame is green water with a few stick debris, a hull sliver at top, a hand under STEER. It reads as a broken frame. |

**Sail on floor: 5 won, 1 lost.** Two of the five wins are only slight. Losing a floor pair at all is a red flag (pair 06).

## Concept (6 pairs)

| Pair | Sail side | Winner | Margin | What decided it (location) |
|---|---|---|---|---|
| 01 | A | B (illus.) | decisive | B: two characters large, warm key light, wet specular on hats. A: four overlays stacked (bubble, instruction bar, STORM CELL, AIR AT THE PASS), player small, rigging lines over everything. |
| 02 | A | B (illus.) | decisive | B: hero face, lightning, sculpted foam. A: grey haze over mid-frame; "STORM CELL: SA" label clipped by right edge. |
| 03 | A | B (illus.) | clear | Closest pair. A's collision framing works; B wins on wood material, foam and splinter mass and close camera. A: flat teal, big unshaded white cloud blob top right. |
| 04 | A | B (illus.) | decisive | A: empty water, flat white blob centre, tiny boat in ring. B: character big, sculpted wave. |
| 05 | B | A (illus.) | decisive | A: glowing wave, warm lantern vs cool moon. B: muddy blue grey, two labels clipped on right ("AIR AT THE", "SAIL UNDER IT, LA"), dark box behind gauge. |
| 06 | A | B (illus.) | decisive | B: the Admiral as hero against his galleon. A: same deck cam, haze, pole down centre; the Admiral appears only as a HUD portrait. |

**Sail vs concept: 0 won, 6 lost.**

## Totals for the recurring game (Sail)

| Folder | Won | Lost |
|---|---|---|
| Podium | 4 | 6 |
| Floor | 5 | 1 |
| Concept | 0 | 6 |

## Fix list

**Fix 1 (decided the most losses): camera framing. The subject is too small and the frame is mostly water or occluders.** This decided 5 of 6 podium losses, the floor loss and 4 of 6 concept losses.
- Overhead or event cam (podium 03, 05, 09; floor 06; concept 04): today the player and rival boats fill about 10 to 15% of the frame and the rest is flat teal. Pull in until the two hulls fill at least half the frame width, as in the collision shots that win (podium 02, 06, 10). Keep the horizon level. Never let the camera lose both boats (floor 06).
- Deck cam (podium 01, 07; concept 01, 02, 05, 06): move the camera off the mast centreline, about a third of the frame to one side. Remove the translucent near-lens sail or haze layer. Thin out rigging in the first metre of view. Scale the player character from about 10% of frame height to about 25%. Get the rival and their boat into the upper third, so the shot reads as "me against him" as the concept art does.

**Then:**
2. **Water and foam material.** Foam and islands are flat, unshaded white blob decals (podium 03; floor 01, 03; concept 03, 04), and spray is soft out-of-focus circles (podium 04, 05). Give foam thickness and shading (crest lip, shadow side) and add a sun glint band. The illustrations win on this every time.
3. **Lighting.** Most frames have no key-light direction: flat ambient teal or blue grey. Podium 08 (warm backlight, silhouette) is the only Sail frame that wins on light, and it beats a rival game clearly. Use one warm key and one cool rim per arena, as the concept art does.
4. **Text load and placement.** Up to four callouts at once (concept 01). World labels run off the right edge (concept 02, 05). "CHARGED!" sits on its own target ring (podium 05; floor 04). Limit to one centre callout at a time and clamp world labels inside the safe area.
5. **Character read.** At play scale the player is a small back view and rivals exist only as HUD portraits. Show a rival face in world on the event cam (zoom or a short close-up on hit), as concept 02 and 06 do.

**Bugs and placeholders seen:**
- World labels clipped at the right screen edge ("STORM CELL: SA", "AIR AT THE", "AIR AT THE PA"): concept 02, 05; floor 01.
- Camera lost the boats (all water, debris only): floor 06.
- Thin straight white polylines across the water that look like debug lines: podium 05 (similar in podium 03).
- Grey translucent plane washing the deck cam: podium 07; concept 02, 05.
- Dark rectangle behind the RAM / OUT OF REACH gauge: podium 07; concept 05.
- Camera inside rival rigging: floor 05.
- Tilted horizon on the overhead cam: podium 03, 09; floor 04.
- Cyan arc wedges cut off by frame corners: podium 06, 09; concept 03.
- "OUT OF REACH" partly hidden by rigging or effects: floor 03, 04.

## Concept gap: execution or format?

**Mostly execution.** Light direction, foam material, character scale and face read can all be done in a real-time stylised renderer at a phone frame budget. Concept 03 (collision) shows the game is already within a "clear" margin when the camera is tight. Part of the gap is **format**. The illustrations are hero close-ups with no HUD. The bottom fifth of every game frame is controls, and a playable camera cannot hold a portrait close-up all the time. Fair target: match the concept on event moments (hits, taunts) with a close camera, and accept a gap of about one margin step on neutral sailing frames.

## Would an easily measured property mislead?

Yes. Colourfulness, saturation and edge density (rigging lines, particles, HUD chrome) would all rank Sail frames above the racer and temple frames that beat them, and above the floor build it only slightly beats in floor 03 and 05. Mean brightness or contrast would reward the bloom and haze that cost podium 07. Overlay counts such as "event text on screen" track *more* losses, not fewer. The deciding property is subject share of the frame (boats and characters as a percentage of pixels), plus whether anything blocks them. That can be measured, but the default metrics do not capture it.
