// node look.mjs <out.png> <module.js>... [--water=y] [--cell=480] [--lance]
// Renders each module in a row of 4 game-like views (low 3/4 front, broadside, chase over foredeck, low 3/4 rear).
import { createRequire } from 'module'; import http from 'http'; import fs from 'fs'; import path from 'path';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const args = process.argv.slice(2); const out = path.resolve(args[0]);
const files = args.slice(1).filter((a) => !a.startsWith('--')).map((f) => path.resolve(f));
const opt = (k, d) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const CELL = +opt('cell', 440), WATER = opt('water', null), LANCE = args.includes('--lance');
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/page.html') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(PAGE); }
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(fs.readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const port = srv.address().port;
const PAGE = `<!doctype html><html><body style="margin:0;background:#222"><canvas id=c></canvas>
<script type=importmap>{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js"}}</script>
<script type=module>
import * as THREE from 'three';
window.go = async (files, CELL, WATER, LANCE) => {
  const cols = 4, W = CELL * cols, H = Math.round(CELL * 0.75) * files.length, ch = Math.round(CELL * 0.75);
  const c = document.getElementById('c'); const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H); r.setScissorTest(true); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
  for (let fi = 0; fi < files.length; fi++) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8fb7c9);
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x335560, 1.4)); const sun = new THREE.DirectionalLight(0xffe2b0, 2.6); sun.position.set(-6, 10, 8); scene.add(sun);
    const obj = (await import(files[fi] + '?t=' + Date.now())).default(THREE); scene.add(obj);
    const b = new THREE.Box3().setFromObject(obj); const s = b.getSize(new THREE.Vector3()); const cen = b.getCenter(new THREE.Vector3());
    if (WATER != null) { const w = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x1d8a8a, roughness: 0.4, transparent: true, opacity: 0.82 })); w.rotation.x = -Math.PI / 2; w.position.y = +WATER; scene.add(w); }
    const L = Math.max(s.x, s.z), Hh = s.y;
    const views = LANCE ? [[1, 0.25, 0.25], [1, 0.05, -0.5], [0.5, 0.4, -1], [-0.6, 0.3, 1]]
      : [[0.85, 0.22, 0.9], [1, 0.1, 0.0], [0.15, 0.32, -1], [-0.8, 0.25, -0.8]];
    for (let vi = 0; vi < 4; vi++) {
      const [dx, dy, dz] = views[vi]; const cam = new THREE.PerspectiveCamera(32, CELL / ch, 0.05, 1000);
      const R = Math.max(L, Hh) * (LANCE ? 0.55 : 1.9); const aim = cen.clone(); if (!LANCE) aim.y = b.min.y + Hh * 0.38; const dir = new THREE.Vector3(dx, dy, dz).normalize();
      if (LANCE) { aim.z = b.min.z + (vi === 3 ? 0.85 : vi === 2 ? 0.5 : 0.25) * s.z; } cam.position.copy(aim).addScaledVector(dir, R); cam.lookAt(aim);
      if (vi === 2 && !LANCE) { cam.position.set(0, b.min.y + Hh * 0.28, b.min.z - L * 0.35); cam.lookAt(0, b.min.y + Hh * 0.18, b.max.z); cam.fov = 55; cam.updateProjectionMatrix(); }
      const x = vi * CELL, y = H - (fi + 1) * ch; r.setViewport(x, y, CELL, ch); r.setScissor(x, y, CELL, ch); r.render(scene, cam);
    }
  }
  return c.toDataURL('image/png');
};
window.ready = true;
</script></body></html>`;
const br = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] });
try { const pg = await br.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.setViewport({ width: CELL * 4, height: Math.round(CELL * 0.75) * files.length });
  await pg.goto(`http://127.0.0.1:${port}/page.html`); await pg.waitForFunction('window.ready === true', { timeout: 60000 });
  const url = await pg.evaluate((f, a, b, l) => window.go(f, a, b, l), files.map((f) => `http://127.0.0.1:${port}${f}`), CELL, WATER, LANCE);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', out, errs.join(' | '));
} finally { await br.close(); srv.close(); }
