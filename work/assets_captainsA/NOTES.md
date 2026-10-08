# assets_captainsA notes

## What was done
- Five captains shipped to `game/assets/cap_{player,pip,barnacle,volta,brisa}.js` (picks: B, B, B, A, A).
- Source: `src/core.js` (rig core: joints, per-joint per-material merge, exact height normalisation, recentre),
  `src/bodyA|B|C.js` (three construction strategies), `src/cap_<id>.js` (palette, dims, face, hat, props).
  `node build.mjs <id>` concatenates them into self-contained modules in `cand/<id>/` (no imports).
- `look.mjs` + `look.html`: loads each module through `game/assetlib.js` with `keepHierarchy: true`, checks all 9
  joint names arrive as Object3D on `userData.joints`, poses armR.x = -1.2, torso.x = 0.3, legL.x = 0.5,
  hat.x = -0.4 and renders. All five pass; limbs rotate about their joints with no tearing.
- `receipt.sh <id> <letter>` copies candidates, sheets and the joint test to receipts and ships the pick.
- No Atlas credits used (0 of 150).

## Rest-pose details the game should know
- Rest rotations are all zero. The arm splay (0.14 to 0.24 rad) is baked into the arm geometry, so
  `armR.rotation.x = -1.2` swings the arm forward cleanly.
- `hat` is a real joint at the top of the head; for volta it carries the goggles (no hat).
- Palm marker world positions at rest are printed by look.mjs (e.g. player handR at x -0.37, y 0.72).

## Unverified / caveats
- Not tested inside the running game (did not touch port 8799 or main.js); only through the game's assetlib.
- Pip follows the reference (khaki shorts, bare shins); the brief's "over white" is a white short-sleeved shirt.
- Faces are front-only features, as allowed; backs of heads have modelled hair/hat.
- A leg rotated forward 0.5 rad passes through long coat skirts (volta, brisa tails), since skirts ride the torso.
- Candidates share the captain-specific prop code; the strategy difference is in body, head and hat.
- volta_B/C, brisa_B/C, barnacle_C exceed 8k tris and were rejected on budget.
- A leftover puppeteer Chrome (pid 50465, flags --window-size=1920,1080 --enable-webgl) is not mine
  (my launches use --use-angle=metal --enable-gpu --no-sandbox) and was left alone.
