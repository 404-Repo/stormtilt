import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] });
try {
  const p = await b.newPage(); await p.goto('http://localhost:8813/tools/regress.html');
  await p.waitForFunction('window.__DONE__', { timeout: 120000 });
  const rows = await p.evaluate(() => window.__RAW__); let fail = 0;
  for (const r of rows) { if (r.error) { console.log(r.name.padEnd(22), 'ERROR', r.error); fail++; continue; } const k = r.lib / r.raw, k2 = r.tree / r.raw; const ok = k >= 0.95 && k2 >= 0.95; if (!ok) fail++; console.log(r.name.padEnd(22), String(r.raw).padStart(7), String(r.lib).padStart(7), (k * 100).toFixed(1).padStart(6) + '%', (k2 * 100).toFixed(1).padStart(6) + '%', ok ? 'ok' : 'GEOMETRY LOST'); }
  console.log(fail ? `REGRESSION: FAIL (${fail})` : `REGRESSION: PASS, ${rows.length} assets keep their geometry through the loader`);
  process.exitCode = fail ? 1 : 0;
} finally { await b.close(); }
