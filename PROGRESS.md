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
