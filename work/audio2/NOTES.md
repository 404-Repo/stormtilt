# Audio pass 2 (STORMTILT), 2026-10-08

## Calls (ledger: ~/astrocade-game7/atlas_calls.jsonl, labels c01..c13)
13 calls x 43 credits (max hold, the only credit field the ledger records) = 559 of 800. No failures, no retries.
Time per call 41 to 202 s, 4 in parallel.

| call | music take | sfx | secs |
|---|---|---|---|
| c01 | rogue (a) 60.1 s | charge | 202 |
| c02 | rogue_b 25.4 s | zap | 154 |
| c03 | rogue_c 27.6 s | jump | 154 |
| c04 | title_b 39.3 s | land | 161 |
| c05 | title_c 21.9 s | gasp | 52 |
| c06 | regatta_b 21.5 s | laugh | 54 |
| c07 | regatta_c 20.6 s | whoa | 51 |
| c08 | thunder_b 60.1 s | clank | 117 |
| c09 | thunder_c 21.2 s | bell | 50 |
| c10 | gale_b 31.3 s | rain | 67 |
| c11 | gale_c 15.6 s | wind | 41 |
| c12 | boss_b 60.1 s | charge2 (alternate) | 122 |
| c13 | boss_c 28.6 s | zap2 (alternate) | 66 |

## Decisions and caveats
- Size cap: the full takes at 96 kbps are 5.0 MB (work/audio2/full/), so the takes in game/audio are cut to the first
  16.5 s, plus a 1.5 s fade. I kept 96 kbps rather than lowering the bitrate, so quality is not traded without asking.
  game/audio total = 4.43 MB. If the cap can rise, copy the files in full/ over the game files.
- The cut is at a fixed time, not on a bar line. The in-game crossfade should hide it; not listened to.
- sfx_bell: the service returned one strike, so the second ring is the same strike mixed in 0.45 s later (made with ffmpeg, no extra call).
- sfx_rain / sfx_wind: made into 7 s loops (1 s equal-power crossfade). The joins are made by script and not listened to.
- sfx_splash: kept the pass 1 file (1.87 s, fits the brief); no new call.
- Loudness after the fade is 0.5 to 1 LU below each cue's existing take (title_b -17.6 vs -16.6 is the widest gap).
- UNVERIFIED (nobody has listened): whether the takes share the original's key and tempo, whether any music has
  vocals, whether whoa has extra words, whether clank (0.42 s, -18.6 LUFS, the quietest) reads as a lance.
