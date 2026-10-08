# STORMTILT (yacht jousting)

A phone-first 3D versus game. Premise from the Google Labs Playground launch trailer (2026-10-07), where
"Yacht Jousting" is a 2D illustrated fighter: captains joust from speeding yachts in a storm. Ours is real
3D: you stand on a yacht's foredeck with a lance under your arm, the rival yacht charging at you through
the swell, spray over the bow, and the hit.

## The pitch in three lines

- Two yachts charge at each other down a storm lane. Steer with one thumb, hold the other to couch your
  lance, and at the pass the better-placed captain knocks the other one off their feet. Three hits and
  they go over the side.
- **You joust with the storm, not just the rival.** The sea between you is alive: rolling crests that
  launch a fast yacht into the air (strike from above: HIGH GROUND), lightning cells that strike the
  tallest thing on the sea (an upright lance: catch the bolt and your lance is CHARGED), and gust lanes
  that throw you forward (more speed, more hit). Every tilt you choose a line through that weather, and
  the rival captain is chasing the same things.
- A tournament across five seas (the Squall Cup), nine rival captains with personalities and taunts, a
  boss in the eye of the storm, boats and lances won from the captains you beat, and two players on one
  phone.

## The fresh rule (20 of 100: "what nobody else tried")

No jam 001 entry is a duel or a joust (checked against all 25 entry files on 2026-10-08). The find is not
the joust; it is that **the weather is the weapon and both captains are racing for it in the same six
seconds**:

- **The lance is a lightning rod.** Carried upright (the rest position, as a real jouster carries it),
  it is the tallest thing in a storm cell. Sail under a cell as it strikes, lance up, and you catch the
  bolt: a charged lance is a knockout. Couch early inside a cell and the bolt hits your mast instead
  (stunned, sail on fire). Height decides who gets it: the yacht on the crest takes the bolt.
- **Crests are ramps.** Crest lines run diagonally across the lane and travel, so sliding left or right
  changes WHEN you meet one. Meet it fast just before the pass and you are airborne at the clash: high
  ground. But an airborne yacht cannot steer, so the rival can slip out of reach and you hit nothing.
- **Couch late.** Hold to lower the lance. Lower it in the last half second and the rival cannot raise
  their guard (LATE COUCH, a clean hit); lower it early and a sharp captain braces or dodges. Not couched
  at the pass: no hit at all.
- **Reach is a line choice.** Pass too close and the hulls collide (RAM: nobody scores, the heavier boat
  shoves the lighter); pass inside your reach but outside theirs (a longer lance) and only you hit.

So each tilt asks one real question: bolt, crest, gust, or a clean line, and which of those is the rival
going for? Each sea adds one weather verb and reframes the joust (MOONPULL's lesson: one verb that keeps
reframing beats many verbs).

## The loop, and why it should be sticky

- A tilt is 7 to 9 seconds: charge, pass, hit, a 2 s turn at the end of the lane with a crane shot over
  the weather for the next one. Something lands every 10 seconds.
- A match is three FOOTING pips each. A clean hit takes one, a HIGH GROUND or LATE COUCH hit two, a
  charged lance three (overboard). A match is 45 to 120 seconds.
- Escalation: the Squall Cup ladder (9 captains over 5 seas), each captain plays differently.
- Spoils: beat a captain and you win their lance or their boat (humour and build choice).
- Medals per match (no footing lost, a charged knockout, an airborne knockout), a cup time, a best
  streak in Endless Squall (captains in a row until you go over).
- Two players on one phone: each player's controls on their own half, a broadcast camera.

## Seas (the Squall Cup)

| # | sea | light | new weather verb | rivals |
|---|---|---|---|---|
| 1 | Regatta Bay | golden afternoon, bunting, spectator boats, a lighthouse | the swell and crest ramps | Pip Tiller (rookie), Bosun Barnacle (rammer) |
| 2 | Thunderhead Reach | violet dusk, rain, lightning | lightning cells, the lance as a rod | Doc Volta (bolt chaser), Contessa Brisa (late-couch duelist) |
| 3 | Gale Straits | teal-green, sea stacks, waterspouts | gust lanes and waterspouts that spin you | Kite Kowalski (catamaran speedster), the Gilly Twins (feints) |
| 4 | Rogue Deep | moonlit, bioluminescent crests | rogue waves (huge single ramps), whirlpool | Lady Marrow (ghost captain, long lance) |
| 5 | Eye of the Storm | red-gold calm inside a ring of storm wall | everything, plus the boss's own storm | Admiral Nimbus on the storm galleon (boss, 3 phases) |

## Scale and camera (Ben: being on the deck, the spray, the hit; both boats readable at the clash)

- Real scale. A yacht is 12 m long with a 14 m mast; a captain 1.85 m; a lance 5.5 m; crests 2 to 4 m.
- Chase camera low over your own foredeck: your captain's back and lance in the lower third, the rival
  ahead, spray across the lens. As the gap closes the camera swings out to a two-shot that keeps both
  yachts in frame; at the pass a 0.35 s slow motion from the side, splinters and spray; then it follows
  the struck captain (or the one going overboard). Between tilts a crane shot shows the weather ahead.

## Look from frame one (BLOOMFIRE lost on grey early frames)

A storm, but never grey: a saturated stylised sea (deep teal to emerald, cream foam), a low gold sun
breaking under bruised violet cloud, enamel-bright hulls, cyan lightning. Each sea its own palette.
No fog walls, no grey state, the title screen is illustrated.

## Scope and fallbacks

Must: seas 1, 2, 5; 6 captains; 3 boats; 3 lances; the three weather verbs; ladder; quick match; 2P.
Should: seas 3 and 4, 9 captains, 5 boats, 5 lances, Endless Squall, medals.
Fallback order if time runs short: Rogue Deep folds into Gale Straits; the Twins drop; Endless drops.
Async ghost play: not built (needs a server or shared storage; out of scope for a static jam build).
