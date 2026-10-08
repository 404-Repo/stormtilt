# STORMTILT audio

Generated 2026-10-08 with Atlas audio (`tools/atlas_audio.py`: ElevenLabs SFX v2 + MiniMax Music 3 instrumental,
one SFX and one music take per call). Raw takes: `work/art/audio_raw/`. Conversion: `work/art/convert_audio.sh`
(music: loudnorm to -16 LUFS, stereo MP3 96 kbps; SFX: leading and trailing silence trimmed, loudnorm -14 LUFS,
mono MP3 96 kbps) and `work/art/loopify.py` for the four music loops (head and tail trimmed to the music, then
the last 1.2 s equal-power crossfaded into the first 1.2 s, so the file loops without a gap).

Total: 1.49 MB (22 files).

Every music prompt began with the shared preamble: "Energetic catchy adventurous orchestral-folk score, sea shanty meets action movie, instrumental only, no vocals, seamless loop."

**Music is short.** 60 s was requested for every loop, but the service returned 17.5 to 19.9 s takes, so the
loops are about 15 s after looping. Loop the file (`audio.loop = true`); expect audible repetition in a long
match. The seamless joins are made by script and not listened to by a human.

| file | kind | duration | size | requested | prompt (after the preamble for music) |
|---|---|---|---|---|---|
| `music_title.mp3` | music | 15.00 s | 176 KB | 60 s | Rousing sea shanty main theme for a game title menu: fiddle, accordion, stomping drums, brass and strings, big hummable melody, 3/4 swagger, heroic and fun. |
| `sfx_lance_crack.mp3` | sfx | 1.00 s | 12 KB | 1.5 s | Wooden jousting lance cracking and shattering into splinters, sharp wood snap with debris |
| `music_regatta.mp3` | music | 17.30 s | 203 KB | 60 s | Bright bouncy regatta music: plucky pizzicato strings, tin whistle, accordion, upbeat drums, sunny and playful, competitive energy. |
| `sfx_body_thud.mp3` | sfx | 1.00 s | 12 KB | 1 s | Heavy body hit thud, a padded person slammed hard, deep impact punch |
| `music_thunder.mp3` | music | 17.05 s | 200 KB | 60 s | Driving tense storm battle music: pounding toms, low brass stabs, urgent fiddle ostinato, minor key shanty, lightning energy. |
| `sfx_splash.mp3` | sfx | 1.87 s | 22 KB | 2.5 s | Big splash of a person falling into the sea from a boat, heavy water plunge |
| `music_gale.mp3` | music | 15.00 s | 176 KB | 60 s | Fast racing strings in a gale: rapid spiccato strings, driving snare, whistling flute melody, wind-swept urgency, high tempo. |
| `sfx_thunder.mp3` | sfx | 2.64 s | 31 KB | 3 s | Close thunder crack, violent sharp lightning strike boom with rumble tail |
| `music_rogue.mp3` | music | MISSING | | 60 s | Eerie moonlit night sea music that still drives forward: celesta and glassy harp over pulsing low strings and steady drums, haunting minor shanty melody, mysterious. |
| `sfx_charge.mp3` | sfx | MISSING | | 2 s | Electric charge crackle, buzzing high-voltage arcing sparks building up |
| `music_boss.mp3` | music | 14.95 s | 176 KB | 60 s | Epic final boss battle at sea: huge choir chanting wordless ahh, full orchestra brass, thundering taiko and timpani, menacing shanty theme, climactic. |
| `sfx_wave_crash.mp3` | sfx | 2.15 s | 26 KB | 2.5 s | Ocean wave crashing hard against a wooden boat hull, heavy water slam and spray |
| `sting_victory.mp3` | music | 8.00 s | 94 KB | 8 s | Short triumphant victory fanfare sting, brass and fiddle, cymbal swell, bright major key ending, not a loop. |
| `sfx_wind_gust.mp3` | sfx | 2.18 s | 26 KB | 2.5 s | Strong wind gust whoosh passing by, stormy sea wind |
| `sting_defeat.mp3` | music | 5.99 s | 71 KB | 6 s | Short comic defeat sting, sad trombone and tuba with a deflating accordion, playful minor ending, not a loop. |
| `sfx_crowd_cheer.mp3` | sfx | 2.98 s | 35 KB | 3 s | Crowd of spectators on boats cheering and whistling, excited applause outdoors |
| `sting_start.mp3` | music | 3.00 s | 35 KB | 3 s | Very short fanfare sting to start a joust round: snare roll and brass hit, 3 seconds. |
| `sfx_horn.mp3` | sfx | 2.48 s | 29 KB | 2.5 s | Ship's horn blast, deep foghorn signalling the start, one long blast |
| `sting_hit.mp3` | music | 2.00 s | 24 KB | 2 s | Very short bright hit sting: a single brass stab with cymbal, triumphant, 2 seconds. |
| `sfx_gull.mp3` | sfx | 1.33 s | 16 KB | 1.5 s | Seagull squawking calls over the sea, a couple of gulls |
| `sting_charge.mp3` | music | 3.00 s | 35 KB | 3 s | Very short magical charge-up sting: rising harp glissando and shimmering strings, 3 seconds. |
| `sfx_sail_flap.mp3` | sfx | 0.88 s | 11 KB | 1.5 s | Canvas sail flapping and snapping in the wind, luffing sail |
| `sting_comic.mp3` | music | 2.00 s | 24 KB | 2 s | Very short comic stinger: pizzicato and woodblock slip, cartoon pratfall, 2 seconds. |
| `sfx_bonk.mp3` | sfx | 1.00 s | 12 KB | 1 s | Comic cartoon bonk on a metal helmet, funny clang |

Notes
- `sting_start`, `sting_hit`, `sting_charge`, `sting_comic` are extra music stings from calls made for the
  short SFX (each call returns a music take anyway): round start, clean hit, charged lance, comic pratfall.
- Missing files are listed as MISSING above (Atlas call failed with a connection reset after 18 min and the
  budget did not allow a second retry). Stand-ins: use `music_gale` for Rogue Deep, `sting_charge` plus
  `sfx_thunder` at low volume for the lance charge.
