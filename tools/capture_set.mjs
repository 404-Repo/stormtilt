// capture_set.mjs: in-motion frames for critics. For each rival, play with a real-touch bot and grab frames at moments:
// chase (ttp ~3.5), closing two-shot (ttp ~1.0), the pass (slow motion), the follow after. Portrait 390x844 @2x, Metal.
// node tools/capture_set.mjs <outdir> [rivals=pip,volta,kite,marrow,nimbus] [--tilts=2] [--vp=390x844]
import { createRequire } from 'module';
import fs from 'fs';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const out = process.argv[2] || '/tmp/cap'; fs.mkdirSync(out, { recursive: true });
const rivals = (process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'pip,volta,kite,marrow,nimbus').split(',');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const tilts = Number(arg('tilts', 2)); const [W, H] = arg('vp', '390x844').split('x').map(Number); const port = arg('port', '8799');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] });
try {
  for (const rv of rivals) {
    const p = await b.newPage();
    await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    // mark the rival beaten so first-encounter tips do not cover the frame, keep the rest of the save empty
    await p.evaluateOnNewDocument((rv) => { try { localStorage.setItem('stormtilt.v1', JSON.stringify({ beaten: { pip: 1, [rv]: 1 }, cup: 8 })); } catch (e) {} }, rv);
    await p.goto(`http://localhost:${port}/?go=${rv}&fast`, { waitUntil: 'load' });
    await p.waitForFunction('window.__READY__ === true', { timeout: 60000 });
    await p.waitForFunction(() => window.__GAME__?.state === 'match', { timeout: 30000 });
    const cdp = await p.target().createCDPSession();
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const box = (sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width }; });
    const s = await box('#stick'), c = await box('#couch');
    await touch('touchStart', [{ x: s.x, y: s.y, id: 1 }]);
    let couching = false; const got = {}; let tilt = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      const g = await p.evaluate(() => { const m = window.__game.match; return m ? { ph: m.phase, tilt: m.tilt, ttp: m.ttp(), ax: m.A.x, bx: m.B.x, cs: m.A.lance.couch, over: m.over, pt: m.pt } : null; });
      if (!g || g.over) break;
      if (g.tilt > tilts) break;
      tilt = g.tilt;
      const key = (k) => `${rv}_t${g.tilt}_${k}`;
      const snap = async (k) => { if (!got[key(k)]) { got[key(k)] = 1; await p.screenshot({ path: `${out}/${key(k)}.png` }); } };
      if (g.ph === 'charge' && g.ttp < 3.6 && g.ttp > 3.0) await snap('chase');
      if (g.ph === 'charge' && g.ttp < 1.1 && g.ttp > 0.7) await snap('close');
      if (g.ph === 'pass' && g.pt > 0.12) await snap('pass');
      if (g.ph === 'after' && g.pt > 0.9) await snap('after');
      let dx = 0, want = false;
      if (g.ph === 'charge' || g.ph === 'intro') { const err = (g.bx - 6.0) - g.ax; dx = Math.max(-1, Math.min(1, -err / 3.5)) * s.w * 0.32; want = g.ttp < 0.3 + g.cs && g.ttp > -0.4; }
      const pts = [{ x: s.x + dx, y: s.y, id: 1 }]; if (want) pts.push({ x: c.x, y: c.y, id: 2 });
      if (want !== couching) { couching = want; await touch(want ? 'touchStart' : 'touchEnd', want ? pts : [{ x: c.x, y: c.y, id: 2 }]); } else await touch('touchMove', pts);
      await sleep(25);
    }
    await touch('touchEnd', []);
    console.log(rv, Object.keys(got).length, 'frames');
    await p.close();
  }
} finally { await b.close(); }
