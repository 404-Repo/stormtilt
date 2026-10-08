# Blind verdict, critic1

Question for every pair: does it look like a made thing (finished, art-directed, shipped quality)?

Recurring game (my guess): a sailing joust game, toy-figure sailors in yellow sou'westers on yachts, couching a striped lance at named rivals (Pip Tiller, Doc Volta, Kite Kowal..., Lady Marrow, Admiral Nim...), HUD with YOU/rival pips, TILT counter, RAM/OUT OF REACH bar, STEER slider and red HOLD COUCH button. Called "joust" below.

## Podium (10 pairs)

| Pair | Joust side | Winner | Margin | What decided it |
|---|---|---|---|---|
| 01 | B | B (joust) | clear | B: painterly pink cloud sky and lighthouse horizon give a lit, composed frame. A: a brown rope cuts diagonally across the whole frame, camera stares at the floor, three stacked text panels cover the top half. |
| 02 | B | A (racer) | clear | A: one committed look, retro CRT HUD with LCD digits framing the screen, golden-hour palette carried from sky to car. B: flat green water with a smeary white foam blob bottom-left that reads as a render error, not foam. |
| 03 | B | B (joust) | clear | B: storm sky, purple-teal grade and lit lance give mood. A: grey untextured character, flat grid-tiled terrace floor, blocky statues. Held back by the rain drawn as vertical rectangular bars (centre-top). |
| 04 | B | B (joust) | decisive | A: camera clipped into a huge untextured grey wall, a dark polygon shard hanging off the bottom centre, unlit chests. B: clean pink sails, readable hit callout. |
| 05 | B | A (racer) | slight | B: the "your lance caught the bolt: your next hit lands for 3" subtitle wraps to an orphan "for 3" and sits on top of the catamaran and reticle (centre); marbled liquified water texture. A has its own fault (red pillar clipping the right edge) but the palette and HUD still read as designed. |
| 06 | B | B (joust) | slight | A: generic grey grid floor, blur-smeared foreground character. B wins on colour and boat models, but the foam is shapeless white splotches (bottom half) that look like noise, not art. |
| 07 | B | B (joust) | clear | A: untextured brown chest box in the foreground, a windmill pole passing through the character. B: coherent navy palette, two clean boat models. |
| 08 | A | B (racer) | clear | A: water is noisy high-frequency marble with hex grid seams (lower left), own mast and sail fill the right third, foam blobs everywhere. B: one consistent stylised palette and framed HUD. |
| 09 | B | B (joust) | clear | B: galleon silhouette against a lit storm, strong depth. A: same rope-across-frame and wall-of-text composition as pair 01. Rain bars again (top centre), rival name truncated "ADMIRAL NIM...". |
| 10 | A | B (racer) | clear | A: enemy galleon sails are flat dark untextured shards, a stray figure pokes into the HUD top centre, hex lines on the water top right. B: polished golden-hour frame. |

Joust podium total: 6 wins, 4 losses (all 4 losses to the retro drift racer; all 6 wins against the canopy-terrace and desert-gate games, which are weaker).

## Floor (6 pairs)

| Pair | Joust side | Winner | Margin | What decided it |
|---|---|---|---|---|
| 01 | B | B (joust) | decisive | A: white square particles as spray, untextured flat-colour hull, tutorial sentence pasted across the bottom. B: textured water, wake, HUD system. Note B's "TILT 1" is overdrawn by brown world geometry at top centre. |
| 02 | B | B (joust) | decisive | Same A faults. B is busy and bloom-washed, but reads as a game with a visual identity. |
| 03 | A | A (joust) | clear | B: placeholder square spray, flat shading. A wins, but the stacked-crate towers (centre, right) look like blockout, and the "Duuude. The gusts out here? Unreal." bubble is near-transparent and unreadable. |
| 04 | B | B (joust) | decisive | A: debris as flat brown sticks, boats are primitive boxes. B: dramatic wave, sail framing. RAM label is eaten by white bloom (bottom left). |
| 05 | A | A (joust) | decisive | B: square-particle spray, untextured hulls. A has the orphan "for 3" subtitle wrap and marbled water. |
| 06 | B | B (joust) | decisive | B: best joust frame in the set, warm yellow yacht close to camera, readable character. A: flat primitive hull and square spray. |

Joust floor total: 6 wins, 0 losses.

## Concept (6 pairs)

| Pair | Joust side | Winner | Margin | What decided it |
|---|---|---|---|---|
| 01 | B | A (concept) | decisive | Concept: hero character huge in foreground, soft material shading, rival face readable. Game: hero is a small figure low right, water is a liquified marble swirl, "TILT 1" faded orange on pink sky is barely legible. |
| 02 | B | A (concept) | decisive | Concept: chunky glossy foam shapes, lightning as crisp cyan. Game: everything is mid-blue haze, boats tiny, lightning reads as a soft blur. |
| 03 | A | B (concept) | clear | Game top-down frame is the cleanest joust frame here, but "AIRBORNE! strike from above" banner (top) is a ghost at ~20% opacity, and the water has a smeared paint look vs the concept's sculpted foam and splinter debris. |
| 04 | B | A (concept) | decisive | Concept: clean toon water with 2 to 3 value bands and crisp foam. Game: crate towers, near-invisible dialogue bubble, rain bars. |
| 05 | B | A (concept) | decisive | Game frame is blown out: white bloom and ice-white water wash out the lower two thirds, RAM label lost, subtitle clipped to "next hit lands for 3" behind the reticle. |
| 06 | A | B (concept) | decisive | Concept: Admiral as a big characterful figure. Game: same pair-05-floor frame, marbled water, orange blocks peeking behind the top HUD. |

Joust concept total: 0 wins, 6 losses (expected, but the gap is large in 5 of 6).

## Totals for the joust game

| Folder | W | L |
|---|---|---|
| Podium | 6 | 4 |
| Floor | 6 | 0 |
| Concept | 0 | 6 |

## Fix list (joust)

**First fix: the water surface material.** It decided the most losses (podium 02, 05, 08, 10 and concept 01, 02, 04, 05, 06). Right now it is a high-frequency marbled, liquified swirl texture with visible hex grid seams and amorphous blown-white foam blobs. Replace it with stylised toon water like the concepts: 2 to 3 flat value bands of one teal hue (top-down views especially), crisp-edged foam shapes only at wakes, hull contact and wave crests (cover no more than about 10 to 15% of the frame), remove the hex grid lines entirely, and cut the marble noise amplitude by roughly 70%.

Then:

1. **Clamp bloom.** White bloom washes out the bottom third in many frames (concept 05, floor 04, podium 06) and eats the RAM label. Cap bloom intensity so no region larger than the HUD button reaches pure white.
2. **Bring the hero closer.** The concepts sell chunky toy characters big in frame; the game shows the hero at about 1/12 of screen height, low right. In the chase view push the camera in so the player figure is about 1/4 of screen height, and in top-down views zoom about 30% tighter.
3. **Rain.** Rain renders as vertical rectangular bars/columns (podium 03, 09; floor 03; concept 04) that look like a shader bug. Use thin angled streaks with low opacity.
4. **Replace the stacked-crate towers** (floor 03, concept 04) with authored sea stacks or rocks; they read as blockout.

## Bugs and placeholders seen

- Callout subtitle "your lance caught the bolt: your next hit lands for 3" wraps to an orphan "for 3" and overlaps the boat and target reticle (podium 05, floor 05, concept 02, 06); in concept 05 it is clipped to "next hit lands for 3".
- Dialogue bubble "Duuude. The gusts out here? Unreal." is near-transparent and unreadable over the sky (floor 03, concept 04).
- "AIRBORNE! strike from above" banner is a ghost, roughly 20% opacity (concept 03).
- "TILT 1" orange label is low contrast on bright sky and is overdrawn by world geometry (podium 01, floor 01, concept 01, concept 06: brown/orange blocks behind the top HUD).
- Rival names truncated: "KITE KOWAL...", "ADMIRAL NIM..."; the Admiral gets 8 cramped pips vs 5 for everyone else.
- Stray figure/geometry poking into the top HUD (podium 10).
- Enemy galleon sails are flat dark untextured shards (podium 10).
- Speech bubble "That bolt is MINE!" sits flush against the pause button (podium 03, 09).
- Own mast/sail and rigging lines cut across the frame in the chase view, occluding a third of it (podium 08).

## Measurable properties to distrust

- Detail / edge density: the marbled water and the noisy foam score as "high detail" but read as noise. A frame can max this metric and look unfinished.
- Brightness and saturation: the bloomed frames are bright and colourful, which flatters a brightness metric, while legibility and form are lost.
- Colour variety: the joust frames have more hues than the racer, yet the racer reads as more designed because it commits to one palette.
