// snap.mjs: load the game on a phone viewport (Metal GPU), run a script of actions, save frames, print errors.
// node tools/snap.mjs "<query>" <outdir> "<script>"   script: "w1000;tap #startb;shot a;hold couch 800;steer 0.5 1000;shot b"
import { createRequire } from 'module';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
import fs from 'fs';
const [q = '', out = '/tmp/snap', script = 'w4000;shot a', vp = '390x844'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [W, H] = vp.split('x').map(Number);
const b = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [];
try {
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 400)));
  p.on('requestfailed', (r) => errs.push('failed: ' + r.url()));
  p.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto('http://localhost:8799/' + (q ? '?' + q : ''), { waitUntil: 'load' });
  await p.waitForFunction('window.__READY__ === true', { timeout: 60000 }).catch(() => errs.push('NOT READY in 60s'));
  const cdp = await p.target().createCDPSession();
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const center = async (sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width }; });
  for (const step of script.split(';').map((s) => s.trim()).filter(Boolean)) {
    const [cmd, ...a] = step.split(/\s+/);
    if (cmd[0] === 'w') await new Promise((r) => setTimeout(r, Number(cmd.slice(1))));
    else if (cmd === 'tap') { const c = await center(a[0]); await p.touchscreen.tap(c.x, c.y); }
    else if (cmd === 'shot') { await p.screenshot({ path: `${out}/${a[0]}.png` }); }
    else if (cmd === 'game') { console.log(JSON.stringify(await p.evaluate(() => window.__GAME__))); }
    else if (cmd === 'eval') { console.log(JSON.stringify(await p.evaluate(a.join(' ')))); }
    else if (cmd === 'play') {
      // play for N ms: steer toward a good line, couch on the timing ring; shots every K ms
      const ms = Number(a[0]), every = Number(a[1] || 0); const s = await center('#stick'), c = await center('#couch');
      const t0 = Date.now(); let k = 0, last = t0;
      await touch('touchStart', [{ x: s.x, y: s.y, id: 1 }]);
      let couching = false;
      while (Date.now() - t0 < ms) {
        const g = await p.evaluate(() => { const m = window.__game.match; if (!m) return null; return { ttp: window.__GAME__.ttp, ax: m.A.x, bx: m.B.x, ph: m.phase, cs: m.A.lance.couch }; });
        let dx = 0, wantCouch = false;
        if (g && (g.ph === 'charge' || g.ph === 'intro')) {
          const lat = g.bx - g.ax; const want = 6.2; const err = lat - want;   // positive: rival too far left -> steer left
          dx = Math.max(-1, Math.min(1, -err / 3)) * s.w * 0.3;
          wantCouch = g.ttp < 0.3 + g.cs + 0.05 && g.ttp > -0.5;
        }
        const pts = [{ x: s.x + dx, y: s.y, id: 1 }]; if (wantCouch) pts.push({ x: c.x, y: c.y, id: 2 });
        await touch('touchMove', pts);
        if (wantCouch !== couching) { couching = wantCouch; if (!wantCouch) await touch('touchEnd', [{ x: c.x, y: c.y, id: 2 }]); else await touch('touchStart', pts); }
        if (every && Date.now() - last > every) { last = Date.now(); await p.screenshot({ path: `${out}/p${String(k++).padStart(2, '0')}.png` }); }
        await new Promise((r) => setTimeout(r, 40));
      }
      await touch('touchEnd', []);
    }
  }
} finally {
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
}
