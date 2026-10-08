# Critic 5 verdict: "does it look like a made thing?"

Blind judgement, 22 pairs, every image read. Recurring game (my guess): the **sailboat jousting game** ("HOLD COUCH" / STEER slider, YOU vs PIP / DOC VOLTA / KITE / MARROW / BARNACLE / THE ADMIRAL, "TILT" counter). Called "Couch game" below. It appears in all 10 podium pairs, all 6 floor pairs and all 6 concept pairs.

## Podium (10 pairs)

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | A (Couch) | clear | A: painted storm sky and harbour on the horizon (upper half) read as one illustrated world. B (canopy terrace): flat low-poly paving, generic dark-green UI panels stacked over the top third, rope cutting diagonally across the player. |
| 02 | A (racer) | clear | A: one committed identity, CRT bezel + LED HUD + golden-hour pixel palette, car centred. B (Couch): impact frame, two hulls and untextured white sails crash out of frame centre-left, cloud of grey translucent bokeh discs mid-frame. |
| 03 | A (Couch) | slight | A: wave shader and pink sail read stylised and deliberate (centre). B (desert gate) is coherent but generic: soft-blurred grass in the bottom third, stock-looking character back view. A only edges it; cyan half-disc cut by right edge of A is sloppy. |
| 04 | B (racer) | clear | A (Couch): giant flat pink sails fill 70% of frame (top and right), opponent HUD plate cut off by right edge, "TILT 2525" reads like a debug value. B: composed road + torii + car, unified grade. |
| 05 | B (Couch) | decisive | A (canopy): camera clipped against a grey wall, untextured grey tree-trunk geometry lower half, no horizon. B: readable water, subject ringed in centre, finished HUD. |
| 06 | A (racer) | clear | B (Couch): impact close-up again, sails slice the frame diagonally, three-line result text crammed under "BOTH HIT!", bokeh-disc spray over the hulls (centre-left). A: dusk road with tracer line, consistent bezel. |
| 07 | A (desert) | clear | B (Couch): tooltip box laid over "CHARGED!" with the old subtitle bleeding through underneath (upper third), "OUT OF REACH" label washed out over foam, cyan disc cut by right edge. A: mid-stride character, clean HUD, nothing broken. |
| 08 | A (Couch) | clear | A: lightning-sail ship and stylised water with clear focal ring (left-centre). B (canopy): camera jammed into a wall, plain brown box as foreground prop (bottom centre) reads as placeholder. |
| 09 | B (Couch) | slight | A (canopy): diagonal rope through frame, flat dialogue panels covering top third. B wins on palette and focus, but white zig-zag lines across the water (top to right) and "RAM" label swallowed by a foam disc (bottom left) nearly cost it. |
| 10 | B (racer) | decisive | A (Couch): impact close-up, brown cabin roofs and a fat untextured mast dominate, white smoke discs in the left half, no horizon, no read of who is where. B: same polished racer frame. |

Couch game in podium: **5 won, 5 lost** (won 01, 03, 05, 08, 09; lost 02, 04, 06, 07, 10). Every win is against the canopy-terrace or desert game; it lost all four meetings with the racer. Four of five losses are an impact/result frame.

## Floor (6 pairs)

Every pair is the Couch game against a crude earlier build (untextured hulls, white square particles, plain "COUCH" circle, instruction text along the bottom).

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | B (Couch) | decisive | A: white square particle spray (centre), flat boxy cabin, raw text strip at the bottom. |
| 02 | A (Couch) | clear | B: same square particles and flat red hull. A wins despite a bokeh puff covering the RAM bar (bottom left). |
| 03 | A (Couch) | clear | B: squares again, "HIT! BOTH HIT" in plain grey type on the sail. A has a strange vertical white light column top centre that reads as a render artifact. |
| 04 | B (Couch) | decisive | A: brown sticks floating in the sky, hulls clipping into each other (bottom). |
| 05 | B (crude) | slight | A (Couch): RAM frame with camera inside the opponent's hull, translucent ghosted mast and sails fill the frame, nothing readable behind the text. B is crude but intact. |
| 06 | B (crude) | slight | A (Couch): empty green water, scattered sticks, one white foam blob, own boat almost off the top edge. No subject. B crude but composed. |

Couch game in floor: **4 won, 2 lost** (lost 05, 06). Losing to the floor at all is the alarm: both losses are the collision camera.

## Concept (6 pairs)

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | B (concept) | decisive | Glossy toy-plastic characters at portrait scale with warm rim light, rival boat framed head-on. Game: rider small and from behind (bottom right), two text bars stacked over the sky. |
| 02 | A (concept) | decisive | Character fills the frame, lightning arc, foam with volume. Game: back-view rider, horizon mostly empty purple. |
| 03 | B (concept) | decisive | Lance hits shield at eye level, splinters and splash are shaped. Game: top-down impact, sails cropped, bokeh discs instead of spray. |
| 04 | A (concept) | decisive | Painted water and dynamic heel. Game: vertical light-shaft columns top centre, pale island hanging off the top edge, tiny rider. |
| 05 | A (concept) | decisive | Glowing wave, lantern light, high-contrast night. Game: grey dark box on deck (bottom centre) looks like placeholder, "RAM" label covered by rider. |
| 06 | B (concept) | decisive | Admiral at hero scale on the ship. Game: rival ship small on the horizon, foam discs wash out the RAM bar and its labels (bottom left). |

Couch game in concept: **0 won, 6 lost**.

**Execution or format?** Mostly execution, partly format. Format: a still illustration can put a character at portrait scale; a play camera cannot always do that. But the gap that is not format: matte untextured sails and hulls next to glossy rim-lit plastic, flat-colour water next to painted foam with volume, round translucent discs where the concepts have shaped splash and splinters, and a camera that never once shows a face. The game could close most of this without changing the play view.

## Totals for the recurring game (Couch game)

| Folder | Won | Lost |
|---|---|---|
| Podium | 5 | 5 |
| Floor | 4 | 2 |
| Concept | 0 | 6 |

## Fix list

**First fix (decided the most losses): the collision/impact camera and its spray.** The impact and result frames (BOTH HIT, CHARGED on contact, RAM) decided podium 02, 04, 06, 10, floor 05, 06 and concept 03: 7 losses. On contact the camera drops into a top-down close-up where untextured sails take most of the frame, the camera can end up inside the opponent hull (translucent mush), and the spray is a cloud of round translucent discs. Concretely: hold the camera far enough back on impact that both hulls and both riders stay in frame with sails under about 40% of the screen, never let it enter a hull (clamp or fade occluders), aim it so the lance meeting point is visible, and replace the disc spray with shaped splash and wood splinter sprites like concept 03.

Next four:
1. **Kill the bokeh-disc particle language everywhere.** Round semi-transparent white and cyan discs appear around the RAM bar, over hulls and as half-circles cut by the right edge (podium 03, 07, 08; floor 02; concept 06). Use shaped foam with an edge and volume.
2. **Material pass on sails, hulls and riders.** Sails are flat colour planes, hulls flat brown. Add cloth panel seams and shading, and a glossy toy-plastic shader with rim light on riders, matching the concepts.
3. **HUD readability over foam.** "RAM" and "OUT OF REACH" labels vanish against white water (podium 07, 09; concept 06). Give the bar a dark backing plate and never stack a tooltip on the result banner.
4. **Show the riders.** The player is always tiny and from behind. A closer shoulder framing or a portrait sting on hits would buy most of the concept gap.

Bugs and placeholders seen:
- Podium 07: tooltip "Steer onto the gold arrow..." drawn over "CHARGED!" with the previous subtitle bleeding through.
- Opponent HUD plate clipped by the right screen edge (podium 04 "DOC VOLTA"; slightly on THE ADMIRAL, podium 08 and concept 06).
- "TILT 2525" next to the score reads like a debug value (podium 04, concept 03, floor 06).
- Vertical white light columns from the top of frame (floor 03, concept 04) read as a render artifact.
- White zig-zag lines across the water (podium 09).
- Pale island mass hanging off the top edge (concept 04, floor 03).
- Dark grey box on the deck (concept 05) looks like a placeholder prop.
- Camera inside the opponent hull with ghosted geometry (floor 05); empty aftermath frame with own boat off the top edge (floor 06).
- Rigging ropes slice the first-person view (podium 01, concept 02).
