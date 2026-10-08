# STORMTILT, the locked style

> Chunky, toy-like nautical objects in glossy painted enamel and varnished timber, with bold readable
> silhouettes, soft bevelled edges and saturated signal colours, like a premium hand-painted toy regatta
> caught in a storm; no text, glyphs, numbers or logos anywhere.

| role | hex | where it belongs |
|---|---|---|
| deep sea | `0x0b4f5c` | water far and in troughs (game shader, not assets) |
| sea face | `0x1d8a8a` | sunlit wave faces (shader) |
| foam | `0xf2efe2` | crest foam, spray, wakes, buoy stripes |
| storm violet | `0x3b3358` | clouds, storm-wall, night hulls |
| sun gold | `0xffb347` | sky glow, lanterns, gilt trim |
| signal red | `0xd7372f` | hulls, sail stripes, buoys, the player's default boat |
| sunflower | `0xf2b630` | hulls, oilskins, lifebuoys, bunting |
| cobalt | `0x2a5bd7` | hulls, coats, flags |
| enamel white | `0xf3eee3` | topsides, cabins, sails' panels |
| varnished teak | `0xa8652f` | rails, cabins, lance shafts, masts of classic boats |
| deck timber | `0xc89a62` | deck planking |
| brass | `0xc9a043` | fittings, portholes, vamplates, helmets |
| copper | `0xc46a3a` | copper lances, lightning rods, kettles |
| steel | `0x8f9aa3` | winches, stanchions, lance tips |
| sail canvas | `0xf4ead2` | sails |
| rope | `0xb59a6a` | ropes, coils, nets |
| lightning cyan | `0x9fe8ff` | emissive only: charged lances, St Elmo's fire |
| skin | `0xf1c7a0`, `0xc68b5e`, `0x8a5a3c` | captains' faces and hands (vary per captain) |

## Fixed decisions

- Metres. Base at y = 0, centred on x and z, **front (bow, face) faces +Z**.
- Yacht: hull 11 to 13 m long, beam 3.6 to 4.2 m, deck about 1.3 m above the waterline (the asset's y = 0
  is the keel bottom; the game sinks it to its waterline), mast 12 to 15 m above deck. Hull depth below
  the waterline about 1.0 m. The bow has a pulpit (rail) where the captain stands; the captain stands on
  the foredeck about 3.5 m behind the bow tip.
- Captain: 1.85 m tall with chunky toy proportions (head about 0.36 m tall, hands and boots oversized),
  a hat or helmet that reads from 30 m, face with large simple eyes and a nose. Arms out of the body.
- Lance: 5.5 m long along +Z, a grip at z = 0 with a round vamplate (hand guard, about 0.45 m across),
  tapering to a tip. Built lying along +Z with the grip at the origin end (the loader will re-centre it;
  the game re-pivots it).
- Buoy 1.8 m tall; lifebuoy 0.75 m across; barrel 0.9 m; spectator motorboat 8 m long; lighthouse 24 m;
  sea stack 30 to 60 m; gull 1.2 m wingspan.
- Flat colours with sensible roughness (enamel 0.25 to 0.35, timber 0.55 to 0.7, canvas 0.85, metal 0.3
  with metalness 0.6 to 0.9). Surfaces may be applied at load time.
- Material names (optional) from the contract list only: plaster | stone | timber | tile | metal | fabric
  | foliage | ground.
- No glyphs: sail insignia are shapes (a star, a lightning bolt, a gull, stripes), never letters or numbers.
- Budget: a yacht up to 25k triangles, a captain up to 8k, a lance up to 2k, a prop up to 5k.
