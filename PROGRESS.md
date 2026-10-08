# STORMTILT progress

Lead: Claude (Opus 5.5) as a jam entrant, running GAME.md's prompt from ~/404-game-recipe @ 4effad3 VERBATIM as operating
instructions ("I want you to build a phone-first 3D yacht jousting game, captains jousting from speeding yachts in a storm,
at the level of the most recent AAA games in its genre ... Fan out sub-agents ... /loop ... harsh critic ... compare them
side by side blind ... Do this in ThreeJS."), with the jam rules (/tmp/jamrepo_chk/README.md). Repo: ~/astrocade-game7.
Serve: :8799 (`game/`), cloudflared quick tunnel for testing. Images and audio: Atlas via tools/atlas_img.py and
tools/atlas_audio.py, every call in atlas_calls.jsonl, cap 5,000 credits.

## Milestone 1: concept and scope (2026-10-08)

**STORMTILT**, a phone-first 3D versus game: captains joust from speeding yachts in a storm. Full pitch: `CONCEPT.md`.
Style lock: `STYLE_LOCK.md`.

The fresh rule (HOLD THE OLIVES lost to MOONPULL on novelty, "never made me decide anything I had not seen"): **you joust
with the storm, and both captains race for the same weather in the same six seconds.** The lance carried upright is a
lightning rod (catch a bolt: a charged lance knocks out; couch early under a cell and the bolt hits your mast). Crest lines
run diagonally and travel, so steering left or right changes when you meet one; meet it fast just before the pass and you
strike from the air (high ground), but an airborne yacht cannot steer. Couch late or the rival braces. Pass too close and
the hulls ram. Each sea adds one weather verb (MOONPULL's one-verb-reframed lesson). No jam 001 entry is a duel or joust
(checked against all 25 entry files).

Why this shape:
- **Stickiness (MOONPULL's loss):** a hit every 8 to 10 s, matches of 45 to 120 s, a 9-captain ladder over 5 seas with a
  boss, spoils (win the beaten captain's boat or lance), medals, Endless Squall streak.
- **Look from frame one (BLOOMFIRE's loss):** a saturated stylised storm (teal sea, gold sun under violet cloud, enamel
  hulls), never a grey state; illustrated title and VS portraits.
- **Ben's notes:** expansive (5 seas, weather that changes play), scale and camera (chase cam on the foredeck, spray,
  a two-shot that keeps both yachts readable at the clash, slow-mo at the hit), phone-first touch (one thumb steers, the
  other holds to couch; tested with real multi-touch), 2 players on one phone (split controls, broadcast camera).
- Async ghost play: not built (a static jam build has no shared storage); decided up front.

Scope: must = seas 1, 2, 5; 6 captains; 3 boats; 3 lances; the three weather verbs; ladder; quick match; 2P.
Should = seas 3, 4; 9 captains; 5 boats; 5 lances; Endless; medals. Fallback: Rogue Deep folds into Gale Straits.

Running in parallel (3 sub-agents, each told not to spawn its own): the floor (one pass, `floor/`); art direction (7
concept frames, title, 9 captain sheets that double as VS portraits and 3D references, 5 sky backdrops, music and SFX,
claims, the podium bar set); yachts and lances through the 404 loop. I am building the engine (`game/src/`).

Process fix carried from the last three games: the recipe's `verify.mjs` forces swiftshader, so agents use a copy with
only the browser flags changed to Metal (`tools/recipe/harness/verify.mjs`), tested on two example assets.

## Milestone 2: a playable vertical slice (2026-10-08)

Serving at **http://localhost:8799/** (`python3 -m http.server 8799` in `game/`); tunnel
`https://feb-tablet-norman-routines.trycloudflare.com/` (ephemeral; `work/tunnel.log`). The whole loop works from a real tap:
title (illustrated key art, attract-mode joust behind it) -> PLAY -> VS card -> a match on the rival's sea -> result card
(score, medals, spoils) -> next rival. Quick match (ladder), Endless Squall, The Dock (boat and lance), 2 players on one
phone (P2's controls mirrored at the top, a broadcast camera) all start and play.

**What a tilt is now:** the yachts sail from the first frame of a 1.7 s crane shot, charge for about 6.5 s, pass, 0.75 s of
slow motion, a follow shot, a wave wipe, the next tilt. One thumb steers (a slider pad), the other holds COUCH. A gold ring
closes on the rival to show when to start holding; a gauge shows whether the pass will be a RAM, in reach or out of reach.
The first match ever slows time in the couch window until the player holds. Damage: a hit is 1, LATE COUCH / HIGH GROUND /
FULL SAIL / a heavy lance add 1 each, capped at 2; a lightning-charged lance is 3; couching early lets the rival brace (-1).
Footing: you 5, rivals 5 (Twins 6, Admiral 8). Knockout: the hat and lance fly, limbs flail, a splash, a swimmer shot.

**The weather verbs, measured in the event log** (`window.__game.log`): crests launch yachts (takeoff vy 3.6 to 9.9 m/s);
storm cells strike the tallest upright lance in range ("strike: charged A" then a charged knockout hit), or the mast of a
couched yacht ("zapped", stunned), or the water; gust lanes and waterspouts are in the Gale Straits; rogue waves in the Rogue
Deep; the Admiral calls cells onto you from phase 2 and extra crests from phase 3. AI captains plan each tilt from their
personality (line, couch lead and jitter, bolt/crest/gust appetite, ram, dodge, feint).

**Measured, my own gate** (`tools/gate.mjs`: real CDP multi-touch on the steer pad and COUCH, an imperfect player at skill
0.6 with timing noise and line drift; Metal M4, 390x844 @2x):

| run | result |
|---|---|
| cup from PLAY, 4 matches | beat Pip in 2 tilts (26 s); lost to Bosun Barnacle 3 times (3 to 4 tilts, 38 to 50 s; he rams, the bot never dodges) |
| peak draws / tris | 299 / 0.21 M |
| console errors / 404s | 0 / 0 (asset and audio manifests: the game never requests a file that is not there) |

**Jam gate on localhost** (recipe @ 4effad3, 390x844 @3x, 4G, CPU 2x): **PASS**, ready 3.7 s, 3.4 MB, real tap, moved
68.6 m, 257 draws, 0.21 M tris, 0 errors, 0 404s (`work/jam_local1/`). `live.mjs` on the tunnel: ready 4.0 s, moved 43 m.

**Assets through the 404 loop so far: 31 modules**, each 3 candidates, the verify sheet, a pick by eye (receipts in
`receipts/candidates/`): 5 yachts + the boss galleon, 5 lances, 11 sea props, 5 captains with a 9-joint rig. Atlas so far
3,439 credits at max hold over 65 calls, 2 failed (ledger `atlas_calls.jsonl`, read at this milestone; the sea-props agent logged its 4 calls too): 7 concept frames, title art, 9 captain sheets and VS portraits, 5 sky
panoramas, 8 music cues in 3 takes each (chained as playlists), 30 SFX and stings.

**Honest gaps at this point**
- 4 captains (Kite, the Twins, Marrow, the Admiral) are still dev placeholders (agent running). They are not shippable.
- The sea stacks read as stacked blocks; a replacement set (stacks, arch, wreck, whale tail, breakwater, bunting, island)
  is being made.
- No critic round yet, no tester has played it, nobody has listened to the audio.
- Balance is a guess: a perfect bot beats Pip in 2 tilts; the skill-0.6 bot cannot get past Barnacle because it never
  dodges a ram. Matches run 26 to 50 s, shorter than the 45 to 120 s I planned.
- 2P banners still speak to "you" (P1).
- Sub-agent slip: the sea-props agent's first Atlas calls wrote 4 reference images into ~/astrocade-game6/ref/ before its
  scratch folder existed; it moved them out (game6's git status is clean).
