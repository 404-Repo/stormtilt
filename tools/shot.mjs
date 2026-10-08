// Dev look: phone viewport, real tap to start, optional scripted play with real taps.
//   node tools/shot.mjs [--w=390 --h=844] [--secs=8] [--out=dir] [--play] [--build=N] [--speed=2] [--q=query] [--stage=N]
import puppeteer from 'puppeteer';
import fs from 'fs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const W = +arg('w', 390), H = +arg('h', 844), OUT = arg('out', '/Users/atlas/astrocade-game7/work/lead/shot'), SECS = +arg('secs', 8);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const errs = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); page.on('requestfailed', (r) => errs.push('reqfail ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  if (arg('save')) await page.evaluateOnNewDocument((s) => localStorage.setItem('hold-the-olives-v1', s), arg('save'));
  const t0 = Date.now();
  await page.goto('http://localhost:8798/' + (arg('q') ? '?' + arg('q') : ''), { waitUntil: 'load' });
  await page.waitForFunction('window.__READY__ === true', { timeout: 90000 }).catch(() => errs.push('NOT READY'));
  console.log('ready', (Date.now() - t0) / 1000, 's');
  await page.screenshot({ path: OUT + '/00_title.jpg', quality: 80 });
  const tapSel = async (sel) => { const b = await page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await page.touchscreen.tap(b[0], b[1]); };
  await tapSel('#startb'); await sleep(1200);
  if (arg('stage')) { const n = +arg('stage'); await page.waitForSelector('#stages .st'); const bs = await page.$$('#stages .st'); const r = await bs[n - 1].boundingBox(); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await sleep(1200); }
  await sleep(2600);
  await page.screenshot({ path: OUT + '/01_start.jpg', quality: 80 });
  if (process.argv.includes('--play')) {
    const G = () => page.evaluate(() => window.__GAME__);
    const nb = +arg('build', 4);
    const build = async (k) => {
      const g = await G(); const free = g.pads.map((p, i) => [p, i]).filter(([p]) => !p[2] && p[1] > 70 && p[1] < H - 120);
      if (!free.length) return false;
      const [p] = free[(k * 5) % free.length];
      await page.touchscreen.tap(p[0], p[1]); await sleep(400);
      const items = await page.$$('#menu-items .mi:not(.locked):not(.no)');
      if (!items.length) { await tapSel('#menu-close'); return false; }
      const it = items[k % Math.min(2, items.length)]; const r = await it.boundingBox(); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await sleep(300);
      await tapSel('#menu-close').catch(() => {}); await sleep(200); return true;
    };
    for (let k = 0; k < nb; k++) await build(k);
    await page.screenshot({ path: OUT + '/02_built.jpg', quality: 80 });
    await tapSel('#b-next'); await sleep(300);
    if (+arg('speed', 1) > 1) for (let i = 1; i < +arg('speed', 1); i++) { await tapSel('#b-speed'); await sleep(100); }
    const shots = +arg('shots', 6);
    for (let i = 0; i < shots; i++) {
      await sleep(SECS * 1000 / shots);
      // upgrade: tap a built tower and add a layer
      const g = await G();
      const built = g.pads.filter((p) => p[2] && p[3] < 3 && p[1] > 70 && p[1] < H - 300);
      if (built.length && g.crumbs > 60) { const p = built[i % built.length]; await page.touchscreen.tap(p[0], p[1]); await sleep(300); const items = await page.$$('#menu-items .mi:not(.no):not(.sell)'); if (items.length) { const r = await items[i % Math.min(4, items.length)].boundingBox(); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); } await sleep(200); await tapSel('#menu-close').catch(() => {}); }
      else if (g.crumbs > 100) await build(i + 7);
      if (g.countdown > 0 || g.state === 'prep') { await tapSel('#b-next').catch(() => {}); await sleep(2600); }
      await page.screenshot({ path: `${OUT}/1${i}_play.jpg`, quality: 80 });
    }
  } else { await sleep(SECS * 1000); await page.screenshot({ path: OUT + '/02_idle.jpg', quality: 80 }); }
  const g = await page.evaluate(() => { const g = { ...window.__GAME__ }; delete g.pads; return JSON.stringify(g); });
  console.log(g);
  const gpu = await page.evaluate(() => { const c = document.createElement('canvas').getContext('webgl2'); const d = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(d.UNMASKED_RENDERER_WEBGL); });
  console.log('gpu', gpu);
} finally { console.log(errs.slice(0, 25).join('\n')); await browser.close(); }
