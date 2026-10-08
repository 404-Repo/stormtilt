# Art director pass, STORMTILT (2026-10-08, 10:45 to 11:20 CEST)

No sub-agents, no commits, no browser launched (so no Chrome to kill). Every generated image was looked at
before it was accepted.

## Atlas spend (ledger `atlas_calls.jsonl`, labels `art_*`, at max hold; REST does not report settled cost)

| section | calls | credits |
|---|---|---|
| concept frames (std) | 10 (7 + 3 regenerations) | 770 |
| title (std) | 2 (1 regeneration) | 154 |
| captains (fast) | 9 | 414 |
| skies (std) | 5 | 385 |
| audio | 13 (12 + 1 retry) | 559 |
| **total** | **39** | **2,282 of 2,300** |

Two audio calls (`art_a03_thunder`, `art_a05_rogue`) failed with a connection reset after about 18 min; both
are logged at the 43 hold, so they may have been billed or not (unverified).

## What was made

1. `ref/concept/01..07_*.png` (2752x1536). Regenerated: 02 (boat name "SEA DRAGON" on the hull), 06 (first
   take was a flat 2D illustration, not a 3D frame), 07 (name boards "YACHT 1/2"). The 07 regeneration still
   painted "YACHT" on the yellow hull: removed by hand (Poisson fill over the letters; original kept as
   `work/art/07_overboard_with_text.png`). 05 and 06 had their subject outside the portrait strip, so they
   were re-framed by cropping a 16:9 window centred on the subject and upscaling about 1.25x (slightly
   softer; originals kept as `work/art/05_rogue_deep_uncropped.png`, `06_eye_storm_uncropped.png`).
   Portrait-strip check sheet: `work/art/prev/concept_portrait.jpg`.
   Weak spots: 04's catamaran reads more like an inflatable heeling than a cat flying a hull; 03 cuts both
   captains at the portrait crop (the lance, shield and splinters are centred); 03 and 07 boats read as small
   tug/cabin boats rather than sloops.
2. `game/img/title.png` (2752x1536, 4.7 MB: use the JPEG at runtime) and `game/img/title.jpg` (1080x602,
   q80, 155 KB). First take was a flat 2D painting with a pale band across the top: regenerated as a 3D
   render. No text.
3. `ref/captains/<id>.png` x9 (1376x768, fast). All usable first time, no text. Brisa is slimmer than the
   chunky brief. Cut-outs `game/img/cap_<id>.png`, 512 px tall, 29 to 61 KB, palette PNG with alpha
   (`work/art/cutout.py`: border-connected background flood plus contact-shadow removal in the floor band).
   Small risk: thin pale edge fringes; checked on magenta (`work/art/prev/cut_sheet.jpg`).
4. `game/tex/sky_<sea>.jpg` x5, 2048x1143, q82, 130 to 216 KB. Edges crossfaded over 10% so the cylinder
   wrap has no seam (edge column diff 1 to 3.5 of 255; seam viewed for rogue). Horizon sits at about 75% of
   height in thunder/gale/rogue/eye, lower (about 88%) in regatta.
5. Audio in `game/audio/` (22 files, 1.49 MB) and `game/audio/AUDIO.md`. **The music service returns 17.5 to
   20 s takes although 60 s was requested**, so loops are 15 to 17 s (made seamless by an equal-power
   crossfade script, not listened to). **Missing:** `music_rogue` and `sfx_charge` (the failed call; budget
   allowed one retry, spent on thunder music + splash, which succeeded). Stand-ins named in AUDIO.md.
6. `ref/CLAIMS.md` and `tools/claims.py` (edited copy; old version at `work/art/claims_orig_backup.py`).
   Floor frames were already there, so the separation test is done: concept 6/6 each, floor 1/6 each. Key
   finding: the floor already matches the palette; the gap is surface detail, foam and highlights. The
   podium bar frames also fail C3/C5 (concept-only stretch targets).
7. `ref/bar/` copied from game6 unchanged, plus one line appended to the copied SOURCES.md.

## Unverified

- Music loops and SFX levels were measured (volumedetect), not listened to.
- Whether the failed audio calls were billed.
- Cut-out quality at the VS screen's real size and background.
