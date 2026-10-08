// fit.mjs: screenshots the title, every rival's VS card, the normal result screens and the cup-champion screen in
// emulated phone viewports (system Chrome), and measures text that leaves the viewport or sits under the VS badge.
//   node tools/fit.mjs <outdir> [--port=8799] [--vps=667x375,844x390,...] [--only=title,vs,res]
import { createRequire } from 'module';
import fs from 'fs';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const out = process.argv[2] || '/tmp/fit'; fs.mkdirSync(out, { recursive: true });
const port = arg('port', '8799');
const vps = arg('vps', '667x375,844x390,932x430,960x540,390x844,430x932').split(',').map((s) => s.split('x').map(Number));
const only = arg('only', 'title,vs,res').split(',');
const RIVALS = ['pip', 'barnacle', 'volta', 'brisa', 'kite', 'gilly', 'marrow', 'nimbus'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const report = [];
// every visible text box inside the screen must sit inside the viewport; on the VS card nothing may sit under the badge
const measure = (screenSel) => (sel) => {
  const W = innerWidth, H = innerHeight, bad = [];
  const scr = document.querySelector(sel);
  const boxes = [...scr.querySelectorAll('*')].filter((e) => e.offsetParent !== null && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const e of boxes) {
    const r = e.getBoundingClientRect();
    if (r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5) bad.push(`offscreen ${e.id || e.className || e.tagName} [${r.left | 0},${r.top | 0},${r.right | 0},${r.bottom | 0}]`);
  }
  // no two text blocks may overlap (the VS badge counts by its glyph box, not its line box)
  const rect = (e) => { if (e.classList.contains('vs-mid')) { const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); } return e.getBoundingClientRect(); };
  const blocks = sel === '#vs' ? ['.vs-mid', '#vs-name-a', '#vs-name-b', '#vs-line', '#vs-sea', '#vs-tip'] : ['#res-title', '#res-sub', '#res-medals', '#res-spoils', '#b-res-again', '#b-res-next', '#b-res-menu', '#b-res-dock'];
  const els = blocks.map((q) => scr.querySelector(q)).filter((e) => e && e.offsetParent !== null && e.getBoundingClientRect().height > 0);
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = rect(els[i]), c = rect(els[j]);
    const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (ix > 1 && iy > 1) bad.push(`overlap ${els[i].id || els[i].className} / ${els[j].id || els[j].className} ${ix | 0}x${iy | 0}`);
  }
  return bad;
};
async function page(W, H, q, save) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  if (save) await p.evaluateOnNewDocument((s) => localStorage.setItem('stormtilt.v1', s), JSON.stringify(save));
  await p.goto(`http://localhost:${port}/${q}`, { waitUntil: 'load' });
  await p.waitForFunction('window.__READY__ === true', { timeout: 90000 });
  return { p, ctx };
}
async function shot(p, name, sel) {
  await p.screenshot({ path: `${out}/${name}.jpg`, quality: 78 });
  const bad = await p.evaluate(measure(), sel);
  report.push({ name, bad }); console.log(name, bad.length ? 'FAIL ' + bad.join('; ') : 'ok');
}
const fakeEnd = (won) => ({ winner: won ? 'A' : 'B', tilt: 5, score: 18450, footA: won ? 3 : 0, maxA: 3, stats: { hits: 4, charged: 1, high: 1, late: 2 } });
for (const [W, H] of vps) {
  const tag = `${W}x${H}`;
  if (only.includes('title')) { const { p, ctx } = await page(W, H, ''); await sleep(1500); await shot(p, `${tag}_title`, '#title'); await ctx.close(); }
  if (only.includes('vs')) for (const r of RIVALS) {
    const { p, ctx } = await page(W, H, `?go=${r}`);
    await sleep(650); await shot(p, `${tag}_vs_${r}`, '#vs'); await ctx.close();
  }
  if (only.includes('res')) {
    // the real result path (game.onMatchEnd) with a fixed match record, after a real match has started
    for (const [kind, rival, won, save] of [['champion', 'nimbus', true, { cup: 7 }], ['tempestchamp', 'nimbus', true, { cup: 7, tempest: 1 }], ['victory', 'gilly', true, { cup: 5 }], ['overboard', 'marrow', false, { cup: 6 }]]) {
      const { p, ctx } = await page(W, H, `?go=${rival}&fast`, save);
      await p.waitForFunction(() => window.__GAME__?.state === 'match', { timeout: 30000 });
      await p.evaluate((m) => { const g = window.__game; g.paused = true; g.onMatchEnd(m); }, fakeEnd(won));
      await sleep(1400); await shot(p, `${tag}_res_${kind}`, '#result'); await ctx.close();
    }
  }
}
await b.close();
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
const fails = report.filter((r) => r.bad.length);
console.log(`\n${report.length - fails.length}/${report.length} fit`);
