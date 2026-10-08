# Rules for every sub-agent on STORMTILT (~/astrocade-game7)

- You are a sub-agent. Do NOT spawn sub-agents of your own (no Agent/Task tool), do not run `claude -p`,
  do not message anyone (no Telegram/Discord tools), do not create GitHub repos, do not push.
- Touch only the paths your brief names. Never edit other repos (~/404-game-recipe is read-only for you;
  verify assets with OUR Metal copy of its verifier: `cd ~/astrocade-game7/tools/recipe && node harness/verify.mjs <dir>` (the recipe's own copy forces swiftshader; do not use it)). Your scratch directory
  is yours alone; nobody else writes there.
- Never use swiftshader. For puppeteer, import it via
  `createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer')` (or the absolute ESM path
  `/Users/atlas/404-game-recipe/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js`), launch with
  `headless: 'new', args: ['--use-angle=metal','--enable-gpu','--no-sandbox']`, and close every browser you
  open. Before you finish, kill any Chrome you started that is still running.
- Do not run `node harness/jam.mjs` (the lead runs it, one at a time). Do not use ports 8799 (the game) or
  8790-8798 / 8741-8751 (other projects). Your brief names your port if you need one.
- Do not git commit; the lead commits. Write a short NOTES.md in your scratch dir with what you did, what
  failed and what is unverified, and end with a concise report.
- Shell calls: give every long command a timeout (macOS has no `timeout`; use the Bash tool's timeout parameter, or `perl -e 'alarm shift; exec @ARGV' 600 <cmd>`). Never leave a
  call that can block forever; a hung call has cost us whole agents.
- No text, glyphs, numbers, labels or logos in any generated image or asset.
- Every 3D object is three.js code made with the recipe's 404 method (~/404-game-recipe/404.md path B):
  a reference image, THREE independent candidates (different construction strategies), `verify.mjs`, a
  pick by eye from the sheet. No downloaded meshes, no literal vertex arrays over 64 numbers, no base64.
- Read ~/astrocade-game7/STYLE_LOCK.md before generating anything and follow it exactly.
- Atlas image calls: `python3 ~/astrocade-game7/tools/atlas_img.py fast|std <out.png> <label> "<prompt>"`
  (fast = 46 credits, 16:9 1K; std = 77 credits, 16:9 2K). Audio:
  `python3 ~/astrocade-game7/tools/atlas_audio.py game7 <outdir> <label> "<sfx prompt>" <sfx_s> "<music prompt>" <music_s>`
  (43 credits, about 2 minutes, use a 1500 s timeout). Every call is logged; keep to your budget.
