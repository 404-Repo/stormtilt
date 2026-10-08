# Critic 4 verdict: "does it look like a made thing?"

Judged blind, all 22 pairs read. The recurring game is the sailboat joust: red-coat player, opponent portrait at top right (PIP, DOC VOLTA, KITE, MARROW, BARNACLE, THE ADMIRAL), TILT counter, STEER slider, red HOLD COUCH button. Below it is called **JOUST**.

## Podium (10)

| Pair | Joust side | Winner | Margin | What decided it (location) |
|---|---|---|---|---|
| 01 | B | A (car) | clear | Joust has two tutorial lines at once: a faint duplicate "storm cell: keep your lance UP" (mid-frame) and the cyan "STORM CELL..." pill cut off by the right edge. Rigging lines also slice the frame top to bottom. The car frame has one palette, one HUD language and a bezel that holds it together. |
| 02 | B | B (joust) | clear | Joust: close top-down collision, readable hulls, star sail, bokeh spray, gold "CHARGED!" with a clear sub-line. Terrace: a rope slashes diagonally through the frame (centre), dialog boxes look like flat default UI, and the "Bell empty" chip looks like debug UI. |
| 03 | A | B (car) | clear | Joust: a flat opaque white shape like a paper cutout (lower centre) reads as a missing texture, and the "DOC VOLTA IS CHARGED" banner sits right on top of the target ring and boat (centre left). The car frame has a sunset sky, a lantern prop and an authored "BACK TO THE ROAD" banner. |
| 04 | A | A (joust) | clear | Joust: two hulls collide close up, with sails and spray. Desert: beige-on-beige low-poly cliff, stiff character, flat ground plane (lower half). |
| 05 | A | B (car) | clear | Joust: a large white blob decal (lower centre) and the "CHARGED!" banner covering its own boat (left). The car frame has a dusk palette, road lights and smoke rings. |
| 06 | A | A (joust) | clear | Terrace: the camera sits behind a wall, the background is a grey-green void and a featureless green slab fills the right side. |
| 07 | B | A (desert) | slight | Joust: three text layers stacked in the top half (the tip box, "CHARGED!" and its sub-line) over a white ice-slab foam shape, plus a semi-transparent ghost hull (lower right). The desert frame is plain but clean, with a run pose. |
| 08 | B | B (joust) | clear | Terrace: the camera clips into an untextured brown box (bottom) and the wall face is flat grey. |
| 09 | A | B (car) | decisive | Joust: cream blobs scattered over the water (centre and left), the banner over the player boat and a cut-off boat on the right edge. Against the car's golden-hour hero shot it looks unfinished. |
| 10 | A | A (joust) | clear | Joust: close collision with confetti debris. Terrace: the diagonal rope cuts the frame and the UI is flat. |

**Joust podium total: 5 won, 5 lost.** All 5 wins came from the close top-down collision shot or against the weak terrace and desert frames. Four of the 5 losses were to the car game, and in 4 of the 5 the white foam blobs were visible.

## Floor (6)

| Pair | Joust side | Winner | Margin | What decided it (location) |
|---|---|---|---|---|
| 01 | A | A (joust) | clear | The floor frame has square grey particles for spray, an untextured block cabin and a grey dev caption at the bottom. The joust frame is messy (lightning lines across the whole frame, a stacked tip box and banner) but it has authored UI and art. |
| 02 | B | B (joust) | decisive | Floor: square particles and a flat cabin. Joust: storm sky, whirlpool ring, a character on deck. |
| 03 | A | A (joust) | clear | Floor: square-particle spray, a dev caption, and the "HIT! BOTH HIT" headline floating in the sky. The joust frame still shows a white wave slab (centre) and the banner over the boat. |
| 04 | B | B (joust) | clear | Floor: plank debris and hulls clipping through each other. The joust frame wins even with its white ice-slab foam (centre and bottom). |
| 05 | B | A (floor) | slight | **Joust camera bug:** the camera is inside the rigging and sails, so translucent sail polygons fill the whole frame and nothing is readable. "RAM!" sits over a two-line instruction. The floor frame is primitive but readable. |
| 06 | A | B (floor) | slight | Joust: a mostly empty green frame with large flat white foam blobs (centre left). The opponent boat is cropped at the top and hidden behind the HUD, and the player boat is not in shot. The floor frame at least has a subject. |

**Joust floor total: 4 won, 2 lost.** Losing to a grey-box floor build twice is the alarm: once from a camera bug, once from an empty frame of foam blobs.

## Concept (6)

| Pair | Joust side | Winner | Margin | What decided it (location) |
|---|---|---|---|---|
| 01 | A | B (concept) | decisive | Concept: a close two-shot of the hero and the rival bow-on, with warm key light and a churning wake. Joust: the hero is tiny in the bottom right, the rival is a speck on the horizon and the water is flat teal. There are two text boxes. |
| 02 | A | B (concept) | decisive | Concept: a lightning-lit character with a real foam material. Joust: faint ghost text ("AIRBORNE! strike from above" and a second line) behind the speech bubble at the top, an empty mid-frame, and the hero cut off by the COUCH button. |
| 03 | B | A (concept) | clear | This is the closest pair, because the top-down collision is the joust's best shot. The gap is the impact moment: the concept shows lance on shield, splinters and splash at contact, with depth of field. The joust shows the hit as small confetti beside the hull. |
| 04 | B | A (concept) | decisive | Concept: a dynamic heeled-over boat and a character acting. Joust: a static back view up the mast, washed-out haze and an unexplained rainbow arch on the horizon (centre). |
| 05 | A | B (concept) | decisive | Concept: a night palette with emissive surf and a lantern. Joust: dull blue-grey, a white spray bloom covering the RAM gauge labels (bottom left) and the mast cutting through the frame. |
| 06 | B | A (concept) | decisive | Concept: the Admiral as a hero character. Joust: the Admiral is never on screen, only a distant ship, and the banner is two lines over the horizon. |

**Joust concept total: 0 won, 6 lost.**

**Execution or format?** Mostly execution. The HUD and controls cost some area, but they are not why it loses. The concepts frame characters large, close and in contact. They have a key light, a real foam material and a visible impact. The game frames have the hero tiny or seen from behind, the opponent far away, flat water with cutout foam, and hits shown as confetti. Pair 03 shows this: even the game's best framing, HUD included, loses on material and on the impact moment, not on the HUD.

## Overall for JOUST: 9 won, 13 lost (podium 5-5, floor 4-2, concept 0-6)

## JOUST fix list

**Fix first: the foam and wave-crest shapes.** They are flat, opaque, hard-edged white or cream polygons lying on the water. They are visible in 5 of the 7 non-concept losses (podium 03, 05, 07, 09; floor 06), they narrowed the floor 04 win, and they read as a missing texture. Replace them with a foam material: broken, soft-edged, alpha-noised, tinted to the water and lit. It should stream off hulls and break along crests, not sit as floating paper shapes. If that can't ship soon, remove them, because plain water reads better than cutouts.

Then:
2. **Keep banners off the action.** "CHARGED!", "BOTH HIT!" and "X IS CHARGED" sit exactly over the player boat and its target ring (podium 03, 05, 07, 09; floor 01, 03). Move them to the top band or anchor them off-subject, and allow one headline at a time.
3. **One text channel.** Kill the ghost and duplicate tutorial lines (podium 01, concept 02) and keep pills inside the safe area ("LANCE UP" clipped at the right edge, podium 01). Don't stack a tip box, a banner and a sub-line in the same frame (podium 07, floor 01, floor 05).
4. **Camera framing.** The wide chase camera shrinks both boats to specks and leaves empty water (floor 06, concept 01, 04, 06). Default to the close top-down two-shot, which wins every time it appears, or push in on the opponent. Keep the rigging lines out of the deck camera.
5. **Water lighting.** Add a key light with specular glints and a depth gradient in the water, so the teal is not one flat value. That is what the concepts and the car game have.

## Bugs and placeholders seen
- The camera clips inside the sails and rigging, so the whole frame is translucent polygons (floor 05).
- Opponent boat cropped at the top behind the HUD, player boat off-screen, an empty frame (floor 06).
- Ghost and duplicate tutorial text rendered at low alpha (podium 01, concept 02).
- The "STORM CELL: SAIL UNDER IT, LANCE UP" pill runs off the right edge (podium 01).
- A semi-transparent ghost hull in the lower right (podium 07, floor 01).
- Spray bloom hides the RAM gauge labels (concept 05, floor 01).
- An unexplained rainbow arch on the horizon (concept 04).
- Boats cut off at the right edge in several frames (podium 03, 09; floor 03).
- The Admiral has a 7-pip track and other opponents have 5. Check this is intended.
