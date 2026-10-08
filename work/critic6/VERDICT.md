# Critic 6 verdict: does it look like a made thing?

Blind judging. Read all 22 pair images: podium 10, floor 6, concept 6.

Recurring game (my guess): the **sailboat lance-joust game** ("HOLD COUCH", "TILT n", rivals Pip / Doc Volta / Kite / Marrow / Barnacle / The Admiral). It appears in all 10 podium pairs, all 6 floor pairs and all 6 concept pairs. Below it is called **JOUST**. The floor side is a rougher build of the same premise ("YOU ooo / ooo RIVAL", "COUCH", dev hint line at the bottom).

## Podium

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | B (JOUST) | clear | B: deck-level camera with the hero in the lower third, lance rigging leading the eye to a lighthouse town in the mid-ground; real depth. A (retro drift racer): the road is an empty flat grey band in the middle third, and the GAS reticle sits on the car's rear deck like a debug marker. |
| 02 | B (JOUST) | clear | B: two hulls colliding at hero size in the centre, "CHARGED!" title over them. A (canopy terrace): camera clipped behind a dark rope and post at left centre, plus flat green dev-style boxes ("Bell empty", "Show chart"). |
| 03 | B (racer) | clear | A (JOUST) loses on the far top-down camera: one tiny pink boat inside a reticle ring at mid-left over a huge empty teal field, a flat white foam splat lower left, stray cyan shards at the bottom-right edge. B: torii, stone lantern, cherry trees and a styled "course out" banner. |
| 04 | A (JOUST) | clear | A: two boats in contact filling the frame, splinter burst and shock rings at centre right. B (desert gate): a static, boxy statue and a flat untextured terrace floor in the lower half. |
| 05 | B (racer) | clear | A (JOUST) loses again on the top-down camera: a tiny catamaran mid-left, flat green water with a paper-cutout foam patch lower left, and the rival boat cropped off the right edge. B has a dusk sky, tree line and a lit road, but has grey bokeh blobs around the car that read as placeholder sprites. |
| 06 | A (JOUST) | decisive | B (canopy terrace): the camera is inside the tower; most of the frame is a grey void and untextured trunk geometry on the right. A: the collision at hero size. |
| 07 | A (desert runner) | clear | A: character mid-stride with a readable silhouette at centre left. B (JOUST): a tiny boat in a ring at the upper left, empty sea, and a cut-off cyan bubble arc at the lower right running into the COUCH button. |
| 08 | B (JOUST) | clear | B: galleon with a purple lightning sail, background boats and pennants at top right. A (canopy): tight on a flat grey wall and a plain brown box; nothing to look at. |
| 09 | A (racer) | clear | B (JOUST) has a **text collision bug** at upper centre: the tutorial box "Steer onto the gold arrow..." is drawn over "CHARGED!" and its subtitle, both legible at once. There is also a hard-edged light shaft slab at the right edge. Same tiny-boat-in-ring camera. |
| 10 | B (JOUST) | clear | B: two boats side by side at hero scale, character in the lower left. A: same clipped-rope canopy frame as pair 02. |

**JOUST on podium: 6 wins, 4 losses.** All four losses use the far top-down camera (03, 05, 07, 09). JOUST won every pair where its camera was low and close on the hulls.

## Floor

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | A (JOUST) | clear | B: untextured flat-shaded hull and **white square particles** across the middle, with a dev hint line at the bottom. A wins despite the same "CHARGED!" overlapped by the tutorial box at upper centre. |
| 02 | B (JOUST) | decisive | B: lit deck, rigging, lighthouse, finished HUD. A: blocky boat and grey square spray at centre right. |
| 03 | B (JOUST) | clear | B wins on surface and lighting, but only clearly: it is the tiny catamaran in a ring at mid-left over open water. A: grey "HIT! BOTH HIT" with no treatment, square particles over the figure. |
| 04 | B (JOUST) | clear | B: wave crest, distant wreck and a gull in the upper half. A's splinter burst is the best thing in the floor set, but the hulls are plain boxes with porthole decals. |
| 05 | A (JOUST) | decisive | A: the Admiral's galleon with lit stern windows, close on the player's boat. B: square particles and a plain box cabin. |
| 06 | B (floor) | slight | A (JOUST): **camera lost the player**. No boat in frame, only an empty green sea, a beige blob at centre and stray sticks. A broken frame loses even to a primitive one. |

**JOUST on floor: 5 wins, 1 loss.** The one loss was a camera bug, not the art.

## Concept (illustration vs game frame)

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | B (illustration) | decisive | Illustration: the rival charges straight at the camera, face lit, bow wave breaking. Game: the rival is not in frame at all, there are two stacked banners at the top, and the RAM bar and bubbles cover the bottom third. |
| 02 | A (illustration) | decisive | Illustration: the character's face, an electric lance as the light source, sculpted foam. Game: the hero is back-turned behind the HUD at the lower right and the rival is a speck at the horizon. |
| 03 | A (illustration) | clear | The game's best frame: the collision is readable. It loses on materials. The illustration has glossy lacquer hulls, flying splinters and a shield hit at centre. The game's hulls are matte and its spray is flat white discs. |
| 04 | B (illustration) | decisive | Game: a tiny catamaran in a reticle mid-left, a washed grey haze over the right half, and the cyan arc cut off at the bottom right. Illustration: a character at hero size with a hat flying off. |
| 05 | A (illustration) | decisive | Illustration: a lantern as warm key light against a cold glowing wave. Game: dim, flat blue, the hero backlit into a silhouette and the rival absent. |
| 06 | B (illustration) | clear | The game frame is good ("THE ADMIRAL CALLS THE STORM", galleon on the horizon, light shaft), but the Admiral is a silhouette far off. The illustration's whole read is his face and lightning crown. The opponent portrait is clipped at the top-right edge in the game. |

**JOUST on concept: 0 wins, 6 losses.**

**Execution or format?** Mostly **execution**, with one part format.
- Execution, fixable: the rival is never shown at hero scale facing the camera; there is no warm/cool key and rim light; the hulls are matte instead of glossy toy lacquer; spray is flat opaque discs instead of sculpted foam; the water has no crest geometry.
- Format, not fixable in a game: the illustration's portrait crop, depth of field and full-frame character close-up. A playable frame has to carry a HUD and a camera that pulls back.
- Pair 03 shows the gap closes to "clear" when the camera frames the collision. That is the evidence the remainder is execution.

## Totals (JOUST)

| Folder | W | L |
|---|---|---|
| Podium | 6 | 4 |
| Floor | 5 | 1 |
| Concept | 0 | 6 |

## Fix list (JOUST)

**1. First: kill the far top-down chase camera.** Keep the low, close 3/4 camera at deck or hull height, framing **both** boats at hero size (rival in frame and facing camera at least on approach), as in podium 02, 04, 06, 10.

The top-down shot (a tiny boat in a white reticle ring over empty teal) decided podium 03, 05, 07 and 09, floor 06 (where it lost the player entirely) and concept 04. That is 6 of the 11 losses. If a top view is needed for steering, cap the zoom so the boat is at least about 25% of the frame height, and always keep the rival on screen.

**2. One message slot at the top.** The tutorial box renders over "CHARGED!" and its subtitle (podium 09, floor 01, concept 01). Queue them, and never stack a title, tutorial box and callout pill together.

**3. Water and foam material.** The sea is a flat teal gradient with paper-cutout white foam decals (podium 03, 05; floor 06). It needs:
- crest geometry with a specular band;
- foam that follows the crests;
- sculpted spray instead of opaque flat white discs (podium 02, 06, 10; concept 03).

**4. Light the hero and the rival.** Add a warm key and a cool rim so characters are not back-turned silhouettes (concept 02, 05; floor 06). Give the hulls a glossy toy-lacquer response; they read matte now.

**5. Clear the bottom third.** The RAM bar, STEER slider and HOLD COUCH button sit over the player character (podium 01, 02; concept 01, 02, 05). Shrink and drop the RAM bar, or move it to the top, so the hero isn't under UI.

### Bugs and placeholders seen
- **Camera loses the player** (floor 06 A): an empty sea with stray sticks and no boat.
- **Overlapping text:** the tutorial box over "CHARGED!" (podium 09 B, floor 01 A, concept 01 A).
- **Opponent portrait cut off at the right screen edge:** The Admiral (floor 05 A, concept 06 A), Pip (concept 03 B).
- **Cyan bubble or ring arc clipped at the bottom-right edge,** running into the COUCH button (podium 07 B, concept 04 A, floor 03 B); stray cyan shards at the bottom right (podium 03 A).
- **Bubble particles drawn over the STEER slider and label** (floor 02 B, floor 04 B, concept 01 A); the steer knob covers a character (podium 02 B).
- **Hard-edged vertical light-shaft slab** at the right edge (podium 09 B); a grey haze slab over the right half (concept 04 A).
- **Rival boat cropped by the right edge** in the top-down shots (podium 03 A, 05 A, 09 B).
