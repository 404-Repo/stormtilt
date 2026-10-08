// gate.mjs: plays STORMTILT through real multi-touch like an imperfect human, match after match, and reports.
// node tools/gate.mjs <outdir> [--skill=0.6] [--matches=3] [--start=cup|pip|...] [--port=8799] [--shots=ms] [--vp=390x844]
// skill 1 = perfect line and couch timing; 0.5 = a decent new player (timing noise, reaction lag, line drift).
import { createRequire } from 'module';
import fs from 'fs';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const out = process.argv[2] || '/tmp/gate'; fs.mkdirSync(out, { recursive: true });
const skill = Number(arg('skill', 0.6)), matches = Number(arg('matches', 3)), port = arg('port', '8799'), shots = Number(arg('shots', 0));
const [W, H] = arg('vp', '390x844').split('x').map(Number);
const start = arg('start', 'cup'), weather = arg('weather', '1') === '1';
const b = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = []; const results = []; let peakDraws = 0, peakTris = 0; const fpsS = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
try {
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 300)));
  p.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(`http://localhost:${port}/` + (start !== 'cup' ? `?go=${start}&fast` : '?fast'), { waitUntil: 'load' });
  await p.waitForFunction('window.__READY__ === true', { timeout: 60000 });
  const cdp = await p.target().createCDPSession();
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const box = (sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, vis: e.offsetParent !== null && r.width > 0 }; }).catch(() => null);
  const tap = async (sel) => { const c = await box(sel); if (c && c.vis) { await touch('touchStart', [{ x: c.x, y: c.y, id: 9 }]); await sleep(60); await touch('touchEnd', []); return true; } return false; };
  if (start === 'cup') { await sleep(800); await tap('#startb'); }
  let shotK = 0, lastShot = Date.now();
  for (let mi = 0; mi < matches; mi++) {
    await p.waitForFunction(() => window.__GAME__?.state === 'match', { timeout: 30000 });
    const t0 = Date.now(); let plan = null, tilt = 0, couching = false, steerOn = false;
    const s = await box('#stick'), c = await box('#couch');
    while (true) {
      const g = await p.evaluate(() => { const m = window.__game.match; const G = window.__GAME__; if (!m) return null;
        return { st: G.state, ph: m.phase, tilt: m.tilt, ttp: m.ttp(), ax: m.A.x, bx: m.B.x, bvx: m.B.vx, cs: m.A.lance.couch, reach: m.A.lance.reach, ram: (m.A.boat.beam + m.B.boat.beam) / 2 + 0.35, over: m.over, fa: m.footA, fb: m.footB, draws: G.draws, tris: G.tris, fps: G.fps,
          cells: window.__game.weather.cells.filter((c) => c.struck === 0).map((c) => ({ x: c.x, z: c.z, s: c.strikeAt - window.__game.t })), az: m.A.z }; });
      if (!g) { await sleep(50); continue; }
      peakDraws = Math.max(peakDraws, g.draws); peakTris = Math.max(peakTris, g.tris); fpsS.push(g.fps);
      if (g.over || g.st !== 'match') break;
      if (g.tilt !== tilt) { tilt = g.tilt; plan = { want: g.ram + 0.8 + (g.reach - g.ram - 1.0) * (0.35 + 0.4 * Math.random()) + gauss() * (1 - skill) * 3, lead: 0.25 + gauss() * (1 - skill) * 0.55 + (1 - skill) * 0.25, react: 0.1 + (1 - skill) * 0.3 }; }
      let dx = 0, want = false;
      if (g.ph === 'charge' || g.ph === 'intro') {
        let target = g.bx - plan.want;          // where we want our x
        if (weather && skill > 0.55) { const cell = g.cells.find((c) => c.s > 0.3 && c.s < 3.5 && Math.abs(c.z - g.az) < 60); if (cell && g.ttp > 1.4) target = cell.x; }
        const err = target - g.ax;               // +err: we need to go +X = screen left = negative stick
        dx = Math.max(-1, Math.min(1, -err / 3.5)) * s.w * 0.32;
        want = g.ttp < plan.lead + g.cs && g.ttp > -0.4;
      }
      const pts = [{ x: s.x + dx, y: s.y, id: 1 }];
      if (!steerOn) { await touch('touchStart', pts); steerOn = true; }
      if (want) pts.push({ x: c.x, y: c.y, id: 2 });
      if (want !== couching) { couching = want; await touch(want ? 'touchStart' : 'touchEnd', want ? pts : [{ x: c.x, y: c.y, id: 2 }]); }
      else await touch('touchMove', pts);
      if (shots && Date.now() - lastShot > shots) { lastShot = Date.now(); await p.screenshot({ path: `${out}/m${mi}_${String(shotK++).padStart(3, '0')}.png` }); }
      await sleep(30 + plan.react * 40);
    }
    await touch('touchEnd', []); couching = false; steerOn = false;
    const r = await p.evaluate(() => { const m = window.__game.match; return { capB: window.__game.match && Object.keys(window.__game).length && m.capB.name, winner: m.winner, tilts: m.tilt, footA: m.footA, footB: m.footB, stats: m.stats, log: window.__game.log.slice(-12) }; });
    r.secs = Math.round((Date.now() - t0) / 1000); results.push(r);
    console.log(`match ${mi + 1}: vs ${r.capB}: ${r.winner === 'A' ? 'WON' : 'LOST'} in ${r.tilts} tilts, ${r.secs} s, footing ${r.footA}-${r.footB}, hits ${r.stats.hits} taken ${r.stats.taken} late ${r.stats.late} high ${r.stats.high} charged ${r.stats.charged} rams ${r.stats.rams}`);
    await sleep(1500); await p.screenshot({ path: `${out}/result_${mi}.png` });
    if (mi < matches - 1) { await sleep(800); if (!(await tap('#b-res-next'))) break; }
  }
} catch (e) { console.log('GATE ERROR', e.message); }
finally {
  const med = fpsS.sort((a, b) => a - b)[Math.floor(fpsS.length / 2)];
  console.log(`peak draws ${peakDraws}, peak tris ${peakTris}, median fps ${med} (Metal M4, not a phone)`);
  console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'no console errors');
  fs.writeFileSync(`${out}/results.json`, JSON.stringify({ skill, results, peakDraws, peakTris, errs }, null, 1));
  await b.close();
}
