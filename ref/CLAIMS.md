# STORMTILT concept-frame claims

Measured 2026-10-08 with `python3 tools/claims.py <png|dir>` (adapted from the game6 copy). Every frame is
centre-cropped to the 390:844 portrait strip the game is played at, resampled to 390x844, and measured
inside the band y = 6%..86% (HUD strip and thumb controls excluded, full width kept). Raw numbers:
`work/art/claims_run.json`.

Concept set: `ref/concept/01..07` (7 frames). Floor set: `floor/_frames/f1..f6` plus `l1`, `l2` (8 frames,
the one-pass floor build, captured 10:49). **Separation test: done, not pending.** All 7 concept frames pass
6/6; all 8 floor frames pass 1/6 (only the C6 guard).

| claim | threshold | concept (min..max) | floor (min..max) | separates? |
|---|---|---|---|---|
| C1 surface detail: mean Sobel luma gradient | >= 38 | 43..60 | 25..34 | yes, clear |
| C2 flat share: band px in 7x7 patches with luma std < 2 | <= 0.52 | 0.17..0.44 | 0.62..0.69 | yes, clear |
| C3 highlights: band px with luma >= 225 | >= 0.012 | 0.016..0.183 | 0.000..0.010 | yes, THIN at both ends |
| C4 cream foam/spray: band px with S <= 0.30 and V >= 0.80 | >= 0.030 | 0.040..0.431 | 0.003..0.021 | yes |
| C5 value range: luma p98 minus p2 | >= 195 | 210..223 | 157..182 | yes, clear |
| C6 saturated, never grey: band px with S >= 0.35, V >= 0.25 | >= 0.22 | 0.26..0.74 | 0.54..0.62 | NO (guard only) |

## What each claim says in words

1. **C1, C2: the frame is made of modelled, textured surfaces, not flat-shaded panels.** Wave faces carry
   ripple and foam lace, hulls carry bevels and reflections, clouds carry form. The floor's sea and sails
   are big smooth gradients (62 to 69% of its pixels sit in flat 7x7 patches; the concept frames 17 to 44%).
2. **C3: there are real near-white glints** (spec on enamel, foam caps, spray, lightning core). The floor
   has none: its p98 luma is 172 to 195, the concept frames 225 to 247.
3. **C4: cream foam and spray are a visible share of the frame** (at least 3%). The floor's foam is a few
   white squares.
4. **C5: the frame spans real shadow to real highlight** (p98 minus p2 at least 195 of 255).
5. **C6 (guard): the frame is saturated, never a grey storm.** The floor already passes this; it is kept
   because a grey state is the known failure (BLOOMFIRE) and a fix for C3/C5 by adding white must not wash
   the frame out.

## Tried and dropped (they do not separate, so they are not claims)

- *Two colour temperatures in frame* (warm share and cool share both above a floor): the floor passes it
  (orange horizon over a teal sea), and concept 01 fails it under a strict cool-hue range because its sea
  is lit gold and reads yellow-green. Not a discriminator.
- *Hero and rival readable at phone size* (signal red, sunflower, cobalt hull pixels): the floor's big red
  hull scores as high as the concepts. Readability needs a critic's eye, not a pixel count.
- *Teal sea share in the lower frame*: the floor's sea is wider than most concept frames. Not a bar.

**Read for the lead:** the floor already has the palette (saturation, teal sea, gold under violet). The gap
is surface and light: detail on the water and hulls, foam, and highlights that reach near-white. That is
where the art budget should go (water normal detail and foam, enamel specular, bloom on lightning).

## Reference: the podium bar set (`ref/bar/`, other games' captures with their own HUD)

Podium frames pass C1, C2 and C6 mostly, but nearly all FAIL C3 (luma >= 225 share 0.001 to 0.011) and
most fail C5 (125 to 208). So C3 and C5 describe the concept look (image-model renders with bright
speculars and foam), and are stricter than what the podium games actually show. Treat C1, C2, C4 as the
bar for in-game captures and C3, C5 as stretch targets; do not trade saturation (C6) to hit them.

## How each claim can be gamed (the critic should check for these)

- **C1 surface detail:** noise, film grain, rain streaks or a sharpening pass raise the gradient with no
  modelled surface. HUD text and particle confetti too. Check: does the detail sit on the sea and hulls?
- **C2 flat share:** same as C1 (dither or grain breaks every flat patch). A busy texture on the sky dome
  also passes it while the subject stays flat.
- **C3 highlights:** blow out the sky or the sun, add a white HUD panel or text, crank bloom or exposure
  so any surface clips. A single white sail filling the frame passes. Check that highlights are small,
  scattered glints on water and hulls.
- **C4 cream foam:** a white sail, white cabin, white fog or a white HUD panel counts as foam. A pale,
  low-saturation frame passes trivially (then C6 should catch it). Check the white sits on the water.
- **C5 value range:** a black letterbox bar, a black HUD strip, or one white text label inside the band
  gives a full range with a flat mid-grey picture. Check where p2 and p98 come from.
- **C6 saturated share:** a fully saturated orange or teal fill (a filter or colour grade) passes with no
  content at all. It is a guard, not evidence of quality.

All six are statistics over the crop; none sees composition, the subject, or whether two yachts read at
the clash. A frame can pass 6/6 and still be a bad game frame. Pair them with the blind critic.
