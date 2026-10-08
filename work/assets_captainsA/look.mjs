// node look.mjs out.png size url1 url2 ...   (urls relative to ~/astrocade-game7, e.g. /work/assets_captainsA/cand/player/player_A.js)
import { createRequire } from 'module';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const ROOT = '/Users/atlas/astrocade-game7';
const [outPng, size, ...urls] = process.argv.slice(2);
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/look.html') p = '/work/assets_captainsA/look.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  const S = +size;
  await page.setViewport({ width: S * 6, height: S * urls.length });
  await page.goto(`http://127.0.0.1:${port}/look.html?size=${S}&src=${urls.map((u) => u + '?v=' + Date.now()).join(',')}`);
  await page.waitForFunction('window.__done === true', { timeout: 90000 });
  const out = await page.evaluate(() => window.__out);
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: outPng });
  console.log(JSON.stringify(out.info, null, 0));
} finally {
  await browser.close();
  server.close();
}
