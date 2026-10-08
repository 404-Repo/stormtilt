import { createRequire } from 'module';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const OUT = '/Users/atlas/astrocade-game7/floor/_frames/';
const browser = await puppeteer.launch({ headless:'new', args:['--use-angle=metal','--enable-gpu','--no-sandbox'] });
const log = [];
try {
  const page = await browser.newPage();
  page.on('console', m => log.push('console: '+m.text()));
  page.on('pageerror', e => log.push('pageerror: '+e.message));
  await page.setViewport({ width:390, height:844, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  await page.goto('http://localhost:8821/index.html', { waitUntil:'networkidle0', timeout:30000 });
  await page.waitForFunction('window.__READY__ === true', { timeout:20000 });
  await new Promise(r=>setTimeout(r,800));
  await page.screenshot({ path: OUT+'title.png' });
  const cdp = await page.createCDPSession();
  const sb = await page.$('#startb'); const bb = await sb.boundingBox();
  await page.touchscreen.tap(bb.x+bb.width/2, bb.y+bb.height/2);
  await new Promise(r=>setTimeout(r,300));
  const G = () => page.evaluate(() => window.__GAME__);
  // touch state
  const W = () => page.viewport().width, H = () => page.viewport().height;
  let steer = null, couch = null;
  const pts = () => [steer, couch].filter(Boolean);
  async function send(type, changed){ await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type==='touchEnd' ? pts() : pts() }); }
  async function setSteer(dx){ // dx in px relative to anchor
    const ax = W()*0.2, ay = H()*0.85;
    if (!steer){ steer = { x:ax, y:ay, id:1 }; await send('touchStart'); }
    steer.x = ax + dx; await send('touchMove');
  }
  async function setCouch(on){
    if (on && !couch){ couch = { x:W()*0.8, y:H()*0.8, id:2 }; await send('touchStart'); }
    if (!on && couch){ couch = null; await cdp.send('Input.dispatchTouchEvent', { type: pts().length ? 'touchEnd' : 'touchEnd', touchPoints: pts() }); }
  }
  const shots = []; let n = 1;
  async function shot(tag){ if (n>6) return; const g = await G(); await page.screenshot({ path: OUT+`f${n}.png` }); shots.push({ f:`f${n}`, tag, g }); n++; }
  const t0 = Date.now(); let lastTilt = 0, plan = {};
  while (Date.now() - t0 < 60000 && n <= 6){
    const g = await G();
    if (g.over){ await shot('the hit (match end)'); await new Promise(r=>setTimeout(r,900)); await shot('after'); break; }
    if (g.tilt !== lastTilt){ lastTilt = g.tilt; plan = { approach:false, near:false, hit:false, after:false, couchDist: g.tilt===2 ? 10 : 30 }; }
    if (g.phase === 'charge'){
      // steer to get the gap near 5.5 (screen right = world -x; gap = Ax - Px, moving right increases gap)
      const err = 5.5 - g.gap; await setSteer(Math.max(-60, Math.min(60, err*25)));
      await setCouch(g.dist < plan.couchDist);
      const wantShots = true;
      if (wantShots && !plan.approach && g.dist < 70 && lastTilt===1){ plan.approach = true; await shot('approach'); }
      if (wantShots && !plan.near && g.dist < 14 && lastTilt<=2){ plan.near = true; await shot('near clash'); }
    } else {
      await setCouch(false);
      if (!plan.hit && lastTilt<=2 && n<=6){ plan.hit = true; await shot('the hit'); }
      if (plan.hit && !plan.after && lastTilt<=2){ await new Promise(r=>setTimeout(r,900)); plan.after = true; await shot('after'); }
    }
    await new Promise(r=>setTimeout(r,30));
  }
  if (steer){ steer = null; couch = null; await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] }); }
  // let it play a few more passes with touch, then landscape
  await page.setViewport({ width:844, height:390, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  await new Promise(r=>setTimeout(r,3500));
  { const ov = await G(); if (ov.over){ const b2 = await (await page.$('#startb')).boundingBox(); await page.touchscreen.tap(b2.x+b2.width/2, b2.y+b2.height/2); await new Promise(r=>setTimeout(r,400)); } }
  let l = 1; const t1 = Date.now(); let lt = -1, pl = {};
  while (Date.now()-t1 < 40000 && l <= 2){
    const g = await G();
    if (g.over && l<=2){ await page.screenshot({ path: OUT+`l${l}.png` }); shots.push({ f:`l${l}`, tag:'over', g }); l++; break; }
    if (g.tilt !== lt){ lt = g.tilt; pl = {}; }
    if (g.phase === 'charge'){ await setSteer(Math.max(-60, Math.min(60, (5.5-g.gap)*25))); await setCouch(g.dist < 12);
      if (!pl.s && g.dist < (l===1?22:45)){ pl.s = 1; await page.screenshot({ path: OUT+`l${l}.png` }); shots.push({ f:`l${l}`, tag:'landscape approach', g }); l++; } }
    else await setCouch(false);
    await new Promise(r=>setTimeout(r,30));
  }
  const fin = await G();
  console.log(JSON.stringify({ shots, fin, log: log.slice(0,20) }, null, 1));
} finally { await browser.close(); }
