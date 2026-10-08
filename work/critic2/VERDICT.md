# Critic 2 verdict: "does it look like a made thing?"

Judged blind from the pair images only. Recurring game (my guess): the **sailboat joust game** ("HOLD COUCH" button, STEER slider, YOU vs rival portrait HUD, TILT counter, RAM / OUT OF REACH bar). Called "Joust" below.

## Podium (10 pairs)

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | A (Joust) | clear | A: painted cloud sky and lighthouse coast give a finished, cohesive palette across the top half. B: tilted camera on bare dark plank floor fills the lower half, two stacked dialog boxes crowd the top, "Bell empty" reads as a debug label (lower left). |
| 02 | A (racer) | clear | A: CRT-curved frame, segmented LCD HUD and a graded sunset sky read as one art-directed object. B (Joust): flat teal water with a single dark smudge shadow upper left, nothing else in the sea; "(high ground)" subtitle reads like a debug log (centre). |
| 03 | A (Joust) | slight | A: painted water and strong "CHARGED!" type. Hurt by a huge empty middle and a tiny boat. B: voxel-blocky statue and temple, empty flat ground lower half, bland grey lighting. |
| 04 | A (Joust) | clear | A: two hulls crossing at a diagonal with sail colour fills the frame, a real composition. B: camera inside a pillar, untextured grey slab and dark leaf mass cover the right half, character half hidden (centre). |
| 05 | B (racer) | clear | A (Joust): milky haze over the whole lower half, rival's speech bubble collides with the instruction banner (top), white slider tick overlaps "OUT OF REACH" (lower left). B: consistent dusk grade, crisp toon outlines, banner and HUD sit cleanly. |
| 06 | A (Joust) | clear | A: catamaran and sloop hulls with readable detail, colour accents. Foam is blurry blobs. B: flat grey ground with visible grid seams (lower right), mannequin running pose, sparse set. |
| 07 | B (Joust) | clear | B: moody night storm, painted swells, silhouetted far ship. A: untextured stone wall and a plain box crate (lower centre) fill the frame; grey-box look. |
| 08 | B (racer) | clear | B: framed road, sunset clouds, headlight bloom used on purpose. A (Joust): a long white foam stripe cuts diagonally across mid-frame like an unfinished decal; blue ring clipped at the bottom edge under COUCH. |
| 09 | A (Joust) | clear | A: tug, buoys, distant boats, layered sea. B: same flaws as pair 01 B (bare floor, debug label, crowded dialog). |
| 10 | A (racer) | decisive | B (Joust): camera jammed against the sail, one huge flat cream plane fills the top half, foggy wash over the water, hero small and back-turned on the right. A: every square cm is designed. |

Joust in podium: **6 W / 4 L**. All four losses are to the same racer game (02, 05, 08, 10).

## Floor (6 pairs)

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | A (Joust) | clear | B: white square particles (placeholder cubes) spray across the centre; flat untextured cabin; tutorial text at the bottom edge. A: textured sea, multiple boats, finished HUD. |
| 02 | A (Joust) | clear | A wins on palette, rigging and character. Flaw: a grey soft smudge in the sky upper left looks like a broken sprite. B: same placeholder cubes beside the hull. |
| 03 | A (Joust) | slight | A: waterspout whites out the left third and hides the player boat (left). Wins only because B is cubes and flat geometry. |
| 04 | A (Joust) | slight | A: white bloom blob swallows the lower centre and the hero; marker overlaps "OUT OF REACH". B: stick shrapnel and cubes, placeholder. |
| 05 | A (floor) | slight | B (Joust): camera clipped inside the Admiral's hull; brown mass fills 80% of the frame, nothing readable but "RAM!". A is crude but legible. |
| 06 | B (Joust) | slight | B: rigging, lighthouse and HUD say "game", but overexposed cream haze over the deck and sail, hero ghosted (right). Barely beats grey-box A. |

Joust in floor: **5 W / 1 L**. Too close for comfort: three of the five wins are slight, and one loss is to a placeholder floor.

## Concept (6 pairs)

| Pair | Winner | Margin | What decided it (location) |
|---|---|---|---|
| 01 | B (concept) | decisive | Concept: rival boat and character large, face-forward, wet glossy materials, foam with real form. Game: rival is a speck on the horizon; lower left washed out by white blob. |
| 02 | B (concept) | decisive | Concept: character close, lightning lance, sculpted wave. Game: no rival visible; white haze fills the lower left third; "OUT OF REACH" label under a white tick. |
| 03 | A (concept) | decisive | Concept: lance hits shield at the centre, splinters and spray. Game: impact is two tiny red sparks; flat teal water with a dark smudge (top left). |
| 04 | A (concept) | decisive | Concept: character action pose, hat flying. Game: waterspout is a grey translucent column; whole frame milky, low contrast. |
| 05 | A (concept) | decisive | Concept: saturated lit boat and glowing wave. Game: hero hidden in fog in lower half; white bloom blob lower left. |
| 06 | A (concept) | decisive | Concept: the Admiral is the subject. Game: Admiral ship is a small silhouette mid-left; white bloom blob lower centre; instruction banner covers the sky. |

Joust vs concept: **0 / 6**, all decisive. Expected for a game frame, but the gap is in specific, fixable things (scale of the rival, contrast, the impact moment), not just render quality.

## Totals for the recurring game (Joust)

| Folder | W | L |
|---|---|---|
| podium | 6 | 4 |
| floor | 5 | 1 |
| concept | 0 | 6 |

## Fix list

**First fix: kill the milky white wash in the lower half of the frame.** The soft white spray/bloom sprites and the distance fog sitting over the deck and water near the STEER and COUCH controls decided more losses than anything else (podium 05, 10; floor 03, 04, 06 nearly lost; concept 01, 02, 04, 05, 06). Concretely: cap spray/foam sprite opacity at about 40% and their size at about a fifth of screen width; never let them render between the camera and the hero; reduce fog density near the camera so the deck, hull and hero keep full contrast; make sure the darkest values in the lower third (hull shadow, wave troughs) reach near-black. The racer that beats this game every time is darker and has hard values; the concepts all have crisp shadow under the boat.

Next four:
1. **Bring the rival into the frame.** In chase view the rival is a speck at the horizon (podium 01, concept 01, 06). Pull the opponent to at least a quarter of the frame height during approach, ideally with face visible. The concepts sell a duel; the game shows an empty sea.
2. **Make the hit an event.** "BOTH HIT!" is backed by two small red spark lines (podium 02, 04, 06; concept 03). Add a splinter burst, a spray plume with form, a brief camera punch-in and hitstop.
3. **Fix the camera collisions.** Podium 10 (camera on the sail) and floor 05 (camera inside the Admiral's hull) are unreadable frames. Add a collision/occlusion pull-back so no hull or sail ever covers more than about 30% of the frame.
4. **Water surface in top-down view.** Flat teal with one dark blurry blob (podium 02, concept 03) and a long white foam stripe (podium 08) read unfinished. Add wake trails, wave normal detail and drop the blob shadow or make it a crisp cloud shadow.

Bugs and placeholders seen:
- Rival speech bubble overlaps the instruction banner (podium 05, top).
- Slider tick and white marker overlap the "OUT OF REACH" label (podium 05, floor 04, concept 02, 05).
- Grey soft smudge in the sky, looks like a broken sprite (floor 02, upper left).
- Blue target ring clipped by the bottom edge and COUCH button (podium 08).
- "(high ground)", "(late couch)" subtitles read like debug strings (podium 02, 06).
- "too early" floating label with a grey triangle reads unstyled (concept 06).
- Instruction banner sits over the sky for long stretches and covers the composition's best part (podium 01, 05; concept 06).
- STEER label nearly disappears into the slider in bright frames (podium 06, concept 02).

Would a measured property mislead? Yes. **Brightness** would point the wrong way: the Joust frames are the brightest on the board and that brightness is the haze that loses them; the winning racer is darker. **Saturation** would also flatter Joust (teal water, red COUCH button are very saturated) while the frames still read unfinished. **Detail/edge density** would rate the floor's white cube particles and the camera-inside-hull frame as "busy" and misjudge both. Contrast in the lower third is the measure that would track my verdicts.
