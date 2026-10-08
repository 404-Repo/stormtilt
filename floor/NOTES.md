# STORMTILT floor (one agent, one pass, no loop, no critic)

Prompt answered: "Build a phone-first 3D yacht jousting game in three.js: captains joust from speeding
yachts in a storm. Versus an AI captain."

## What was built

- `index.html`: one file, three.js 0.169.0 from jsdelivr via importmap, no image, audio or Atlas calls.
- Sea: 260 m CPU-displaced plane (4 summed sines), vertex colours deep teal to sea face to cream foam at
  crests, follows the player. Boats ride the same height function (pitch and roll from its slope).
- Sky: shader dome, gold horizon under violet, noise clouds, sun glow; rain line segments; a random
  cyan lightning bolt every 3 to 8 s with a sky and hemisphere-light flash.
- Two yachts written once as three.js code (extruded hull, deck, white stripe, cabin, brass portholes,
  mast, boom, mainsail with a colour band, jib, pulpit rail, flag). Red player, cobalt rival.
- Captains (capsule body, legs, boots, head with eyes and nose, brass helmet, plume, arms) and lances
  (tapered shaft, brass vamplate, steel tip). Lance upright at rest, couched forward on hold.
- Play: both yachts charge down a lane at 14 m/s each (about 5 s per tilt). Left thumb drag steers
  (on-screen stick), right thumb hold couches (on-screen button); arrows and space on desktop.
  At the pass: gap under 3.9 m is a RAM (no score, shove); 3.9 to 7.2 m is in reach; couched gives a hit
  (1 pip), couched within the last 0.5 s is a LATE COUCH (2 pips). Three pips each; at zero the captain
  flies over the side and the match ends with a win or lose banner and an AGAIN button.
- AI captain picks a random passing gap (3.5 to 7.5 m) and a random couch distance each tilt.
- Hit fx: splinter burst, camera shake, brief slow motion, struck captain knocked back. Bow spray points.
- Camera: low chase behind the player, widening toward a two-shot as the gap closes, then a side view
  for 0.9 s after the pass, then the tilt resets to the lane ends.
- Tooling: `window.__READY__`, `#startb`, `window.__GAME__` (pos, fps, speed, score, over, draws, tris,
  plus phase, tilt, pips, gap, dist, couch) every frame.

## Time spent

About 5 minutes of wall clock (10:45 to 10:50 CEST, 2026-10-08) for the build and capture, one write of
the game plus one fix pass before any capture (hull was facing backwards, lance angle sign, a touch
guard that would have blocked the AGAIN button). No changes to the game after capturing. The capture
script (`_capture.mjs`) was re-run twice because it missed frames f6 and l2, not the game.

## Capture

Puppeteer, Metal args, 390x844 at DPR 2, real touch through CDP `Input.dispatchTouchEvent` (two
simultaneous fingers: steer and couch) and `page.touchscreen.tap` on START. Measured in the run:
60 fps, 54 to 112 draw calls, about 43k to 48k triangles.

- f1 approach (tilt 1, 69 m apart), f2 near the clash (13.5 m), f3 the hit, f4 after (splinters),
  f5 near the clash tilt 2, f6 the match-ending hit.
- l1, l2: landscape 844x390, a fresh match, approaching.

## What is broken or weak (seen in the frames)

- The lance barely reads. Upright it merges with the mast; couched it is mostly hidden behind the cabin
  and sail from the chase camera. The core prop of the game is nearly invisible.
- The side view at the hit does not land in time: the camera lerps, so f3 still shows the chase angle.
  The rival boat is mostly out of frame at the moment of the hit.
- The mainsail fills the left half of portrait frames and hides the rival on the approach.
- Balance: the AI targets the same reach band the player needs, so nearly every pass is "BOTH HIT";
  a match is about two tilts (about 15 s). No bracing, dodging, or any defence.
- Double knockout is reported as a player win (checks the rival first).
- Spray is square points (no sprite); rain is thin lines; no foam wake.
- The concept's actual hook (lightning cells and the lance as a rod, crest ramps, gust lanes) is not
  built at all; no ladder, no captains with personalities, no 2P, no audio.
- In landscape the sun reflection blows out the right third of the sea.
- One 404 in the console (favicon).
