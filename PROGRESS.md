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

## Milestone 3: content complete (2026-10-08)

The whole game exists and plays from the title to the Squall Cup champion card. Commit **4031920**.

**Content**
- **Five seas**, each its own light, palette, weather and set dressing: Regatta Bay (gold afternoon, spectators, judges'
  barge, breakwater, bunting, lighthouse, island), Thunderhead Reach (violet dusk, rain, storm cells, wreck, arch),
  Gale Straits (teal gale, gust lanes, waterspouts, sea stacks), Rogue Deep (moonlit, cyan foam, rogue waves, whale
  tail, wreck), Eye of the Storm (red-gold calm, the Admiral's galleon).
- **Eight rivals and a boss**, each with a portrait, VS line, taunts, barks that announce what they are going for
  ("That bolt is MINE!", "RAMMING SPEED!") and an AI personality: Pip (rookie, sometimes forgets to couch), Bosun
  Barnacle (rams, heavy lance), Doc Volta (chases lightning, copper rod), Contessa Brisa (late couch, long lance,
  dodges), Kite (catamaran, gusts and crests), the Gilly Twins (two on one deck, feint a line switch), Lady Marrow
  (rogue waves, long lance), Admiral Nimbus (8 footing, three phases: he calls cells onto you, then rogue crests).
- **The weather verbs**, each telegraphed before it matters: storm cells (a shrinking ring, a rain shaft, a tag that
  says "LANCE UP: BOLT IN 2", and "LET GO!" in red if you couch under it), crest launch markers ("AIR AT THE PASS" when
  your current line will put you in the air at the clash), gust lanes, waterspouts, rogue waves. From the second tilt
  every sea has a storm cell to race for.
- **Progression and modes**: the Squall Cup ladder, spoils (each rival's yacht or lance), The Dock (5 yachts, 5
  lances), medals, a score and a best per rival, Quick Match, Endless Squall (streak), 2 players on one phone.
- **51 asset modules through the 404 loop** (3 candidates, verify sheet, pick by eye; receipts in
  `receipts/candidates/`): 5 yachts + the galleon, 5 lances, 9 captains on a shared 9-joint rig, 19 sea props and set
  pieces. `harness/ship.mjs`: 52 modules parse, nothing leaves the folder. Game folder 8.9 MB on disk, 3.4 MB to load.
- Atlas: 3,439 credits at max hold over 65 calls, 2 failed (ledger): 7 concept frames, title, 9 captain sheets, 5
  skies, 4 + 4 + 4 + 2 object reference sheets, 26 audio calls (8 music cues in 3 takes each, ~30 SFX).

**Critic rounds** (fresh harsh critic each, blind pairs, keys outside the folder, in-motion frames):

| round | vs podium (10) | vs floor (6) | vs concept (6) | property named first | what I changed |
|---|---|---|---|---|---|
| 1 | 6 won, 4 lost (all to SUNDRIFT) | 6 of 6 | 0 of 6 | the water: marbled noise, hex foam lines, blobs | toon water: banded values, crisp foam with an edge shadow, sparse glints; closer chase; rain fixes |
| 2 | 6 won, 4 lost (all to SUNDRIFT) | 5 of 6 | 0 of 6 | milky white wash over the lower half | own sails fade to 7% in the chase, spray can never cover the lens, less landing foam; telephoto chase; impact flash and hit-stop |

The round-2 changes have not been judged yet. The concept column has lost 12 of 12, all to illustrations with a camera
inside the action; the next critic round will say whether that gap is execution or format.

**Solo tester sessions** (fresh Sonnet testers on the panel harness, 300 s, our game only):

| run | persona | fun / nuance / juice | what they said decided it | what I changed |
|---|---|---|---|---|
| solo1 | casual | 5 / 5 / 7 | "wait 6 s, then hold a button"; "too early" with no clue why; Barnacle's ram unfair | a storm cell in every sea from tilt 2, couch window 0.55 s late / 1.4 s early, ram warning on the gauge |
| solo2 s01 | casual | 6 / 6 / 8 | lost the first 3 matches; the storm rule only made sense afterwards | Pip easier (forgets to couch 45%), cell tags BEFORE the strike, charge 6.5 s to 4.7 s |
| solo2 s02 | indie | 6 / 6 / 8 | "a real either/or" (lance up = charged, couched = zapped) but "8 s of dead sailing", tells come after | same, plus snappier steering |

**My gate** (skill 0.5 touch bot, 5 cup matches after the last changes): won 4 of 5, lost once to Barnacle; matches 21 to
70 s, 2 to 7 tilts, most finishing 1-0 on footing; peak 334 draws, 0.23 M tris, 0 console errors.

**Honest gaps**
- The latest tester fixes (cell tags, rookie Pip, shorter charge) are not tester-verified yet.
- No real phone; no human has played; nobody has listened to the audio (the testers read a sound log).
- The galleon's sails are flat colour; the critic called them unfinished.
- 2P banners name P1/P2, but the broadcast camera and P2's mirrored controls have only been checked in screenshots.

## Milestone 4: jam gate PASS and blind comparisons (2026-10-08)

Final build: commit **155a768** (main). Serving at **http://localhost:8799/**; cloudflared quick tunnel
`https://feb-tablet-norman-routines.trycloudflare.com/` (ephemeral; `work/tunnel.log`). No GitHub repo was created.

**Correction to milestone 3:** I wrote "51 asset modules". The real count is **36** asset modules in `game/assets/`
(5 yachts + galleon, 5 lances, 9 captains, 16 sea props and set pieces). The 52 that `ship.mjs` reports includes the
game's own source modules. Every asset is 3 candidates, the Metal verify sheet and a pick by eye (`receipts/candidates/`).

### Jam gate (recipe @ 4effad3; 390x844 @3x, real touch, 4G, CPU 2x slower)

| | tunnel, 7368900 | localhost, 7368900 | tunnel, 20faec2 (tester build 4031920) |
|---|---|---|---|
| ready | 3.8 s | 2.8 s | 3.6 s |
| weight | 3.6 MB | 3.7 MB | 3.7 MB |
| started / moved | real tap / 4.7 m | real tap / 3.3 m | real tap / 10.4 m |
| peak draws / tris | 255 / 220k | 268 / 218k | 282 / 223k |
| errors / 404s / outside folder | 0 / 0 / none | 0 / 0 / none | 0 / 0 / none |
| RESULT | **PASS** | **PASS** | **PASS** |

Verdict blocks: `work/jam_verdict_final_tunnel.txt`, `work/jam_verdict_final_local.txt`, `work/jam_verdict_tunnel_m4.txt`.
`ship.mjs`: 52 modules parse, nothing leaves the folder. `live.mjs` on the tunnel: ready 1.2 s, moved 45.5 m. Re-run on the final commit 155a768 over the tunnel: **PASS**, ready 4.0 s, 3.6 MB, moved 4.5 m, 289 draws, 219k tris,
0 errors, 0 404s (`work/jam_verdict_head_tunnel.txt`).
The 60 fps is an M4 Metal GPU, not a phone. Three.js loads from cdn.jsdelivr.net (flagged, not failed).

**Coordinator's defect, fixed:** the title wordmark was cut off at the top in 844x390 landscape. The wordmark and menu now
size by viewport height as well as width, and landscape puts the menu beside the logo. Checked on 667x375, 844x390,
932x430 and 390x844, the whole wordmark and all five buttons are inside the screen (`work/title_fit/`, commit 155a768).

### Blind look critic, six rounds (fresh harsh critic each; keys outside the folders; in-motion frames)

| round | vs podium (10) | vs floor (6) | vs concept (6) | property named first |
|---|---|---|---|---|
| 1 | 6-4 | 6-0 | 0-6 | marbled water, hex foam lines |
| 2 | 6-4 | 5-1 | 0-6 | milky white wash over the lower half |
| 3 | 4-6 | 5-1 | 0-6 | camera framing (mast and rigging in the deck camera, tiny boats in the overhead) |
| 4 | 5-5 | 4-2 | 0-6 | flat hard-edged foam shapes |
| 5 | 5-5 | 4-2 | 0-6 | the collision camera and translucent disc spray |
| 6 | **6-4** | **5-1** | 0-6 | the far top-down closing view |

- Every podium loss in every round was to SUNDRIFT, except round 3 (2 to Farseek) and one round-4 loss to the desert game.
  Wins were against Bellkeeper and Farseek frames.
- Rounds 3 to 5 were regressions I caused (a closer deck camera, then crisp toon foam) and then undid. The round-6 fix
  (closing two-shot low and close) is in the final build but has not been judged.
- The concept column lost 36 of 36 pairs. Critics 3 to 6 called the gap "mostly execution": the illustrations show glossy
  characters large and facing camera, with a key light. I stopped at six rounds; the podium count had flattened at 5 to 6.
- Caveats: 10 pairs is coarse; podium frames come from another harness; critics could tell which game recurred.

### Blind head-to-head play, 10 valid sessions (fresh Sonnet testers, panel harness, 540 s per game, order balanced)

Our game was served from a frozen worktree at **4031920** for every session. Each opponent was played once with ours
first and once with ours second. Keys: `work/keys/h2h_key.json`; sessions: `work/h2h/sNN/`.

| # | opponent | persona | ours | keep playing | better made | ours fun / nuance | opp fun / nuance |
|---|---|---|---|---|---|---|---|
| s01 | SUNDRIFT | casual | 1st | **ours, clear** | **ours, clear** | 5 / 6 | 4 / 3 |
| s02 | SUNDRIFT | competitive | 2nd | **ours, clear** | **ours, clear** | 8 / 8 | 6 / 5 |
| s03 | Bellkeeper | indie | 1st | **ours, clear** | Bellkeeper, slight | 7 / 7 | 6 / 6 |
| s04 | Bellkeeper | casual | 2nd | **ours, decisive** | **ours, clear** | 7 / 7 | 3 / 3 |
| s05 | Farseek | competitive | 1st | **ours, decisive** | **ours, clear** | 6 / 6 | 3 / 5 |
| s06 | Farseek | indie | 2nd | **ours, clear** | **ours, clear** | 6 / 7 | 6 / 7 |
| s07 | MOONPULL | casual | 1st | MOONPULL, slight | MOONPULL, slight | 6 / 7 | 7 / 7 |
| s08 | MOONPULL | indie | 2nd | **ours, clear** | **ours, slight** | 7 / 8 | 7 / 6 |
| s09 | HOLD THE OLIVES | competitive | 1st | OLIVES, decisive | **ours, slight** | 6 / 6 | 8 / 8 |
| s10 | HOLD THE OLIVES | casual | 2nd | OLIVES, clear | OLIVES, slight | 5 / 7 | 7 / 6 |

- **Against the podium: keep playing 6 of 6, better made 5 of 6**, holding in both orders (3 of 3 first, 3 of 3 second).
- **Against MOONPULL: 1 of 2** on both questions (lost when played first, won when played second).
- **Against HOLD THE OLIVES: 0 of 2 on keep playing**, 1 of 2 on better made.
- Order: ours won keep-playing in 3 of 5 sessions played first and 4 of 5 played second.
- The novelty point MOONPULL beat OLIVES on seems to have landed: s08 (indie) chose ours over MOONPULL for "a verb with
  real trade-offs: charging your lance under a storm cell... the gap gauge, crest height and ring timing all feed the
  same strike"; s03 and s06 (indie) both said they were "playing differently" by minute five to eight.
- What lost the two OLIVES sessions and s07, in the testers' words: "A has one move, hold and release, and a result screen
  that said 0 or 600 with no way to chase a bigger number" (s09, competitive); "the storm, ram and gold-ring rules piled
  up by rival three" and a wall at Contessa Brisa (s10, casual); "lost eight rematches in a row to Barnacle" (s07).
  Barnacle stopped 4 of 10 testers for a while; Brisa stopped 3.

**Changed after the panel, on main, not tester-verified:** a live score with a combo multiplier (x2 to x5 for hits
landed without taking any) shown in the HUD; Barnacle and Brisa a step easier (4 footing, later couch); the ring and
gauge appear only in the last 2.2 s and 3.8 s; shorter turnaround between tilts and tap-to-skip on the follow shot;
"rough seas" from tilt 7 so long matches end (one tester reached tilt 18); a Tempest Cup after the Squall Cup (one tester
became champion in 508 s); MENU and THE DOCK on the result card; pause menu buttons no longer stretched; the streak line
no longer flattens the score text.

**Panel caveats, read before using these numbers**
- Agent testers, not people, and the panel failed its own calibration (PANEL.md). They play a tap-and-time game more
  easily than the 3D adventures (Bellkeeper, Farseek), which flatters ours against those two.
- Six sessions were re-run and are not counted: the first s03 (Bellkeeper harness hung on its movement assist, 125 s),
  the first s04 (the tester could not load any Bellkeeper screenshot), and s06, s07, s08 twice each. All the harness
  browsers died at the same moments (14:02:10 and 14:11:20 local), across four sessions, which points to something on the
  machine killing headless Chrome-for-Testing processes. I did not find what; I moved the harness to the system Chrome
  binary with its own profile, and every session after that completed.
- s06 tester could not read most Farseek level 1 frames ("media removed: request limit"); s09 hit the same limit on
  some of our frames. Both are noted in their files.
- Title screens name the games; testers did not know which was ours.

### Where this leaves the game against the bar

- **Look:** at the podium's level except SUNDRIFT, which wins every pair it is in. The concept gap is open.
- **Play:** beats the jam podium for these testers, splits with MOONPULL, loses to HOLD THE OLIVES on stickiness for
  competitive and casual testers (score chase, gentler difficulty). The post-panel fixes target exactly those reasons and
  are unverified.
- **Not done:** no human has played it, no real phone (frame rate, heat, iOS audio), nobody has listened to the audio,
  2P has only been checked in screenshots, async ghost play was not built. Atlas: 3,439 credits at max hold over 65 calls
  (2 failed). 38 commits on main.
