// node jointtest.mjs <out.png> <module.js>...  Renders each captain: rest (3/4), posed (3/4), posed (side), face close-up.
// Pose: armR.rotation.x=-1.2, torso.rotation.x=0.3, legL.rotation.x=0.5. Metal GPU, never swiftshader.
import { createRequire } from 'module'; import http from 'http'; import fs from 'fs'; import path from 'path';
const puppeteer = createRequire('/Users/atlas/404-game-recipe/package.json')('puppeteer');
const [out, ...mods] = process.argv.slice(2);
const files = mods.map((m) => path.resolve(m));
const page = `<!doctype html><html><body style="margin:0;background:#cfd6dc">
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js"}}</script>
<script type="module">
import * as THREE from 'three';
const N = ${files.length}, W = 300, Hh = 420, P = 4;
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r.setSize(W * P, Hh * N); r.setClearColor(0xcfd6dc);
r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; document.body.appendChild(r.domElement);
r.setScissorTest(true);
for (let i = 0; i < N; i++) {
  const mod = await import('/m' + i + '.js');
  for (let p = 0; p < P; p++) {
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xdfeeff, 0x6a5a48, 1.6));
    const d = new THREE.DirectionalLight(0xfff1dd, 2.4); d.position.set(3, 5, 4); sc.add(d);
    const g = mod.default(THREE); sc.add(g);
    const J = g.userData.joints;
    if (p === 1 || p === 2) { J.armR.rotation.x = -1.2; J.torso.rotation.x = 0.3; J.legL.rotation.x = 0.5; }
    const cam = new THREE.PerspectiveCamera(p === 3 ? 18 : 35, W / Hh, 0.05, 50);
    if (p === 0 || p === 1) cam.position.set(2.6, 1.6, 3.6); else if (p === 2) cam.position.set(-4.4, 1.2, 0.0); else cam.position.set(0.9, 1.6, 4.2);
    cam.lookAt(0, p === 3 ? 1.5 : 0.95, 0);
    if (p === 3) { const hb = new THREE.Box3().setFromObject(J.head); const c = hb.getCenter(new THREE.Vector3()); cam.lookAt(c.x, c.y + 0.02, c.z); }
    r.setViewport(p * W, (N - 1 - i) * Hh, W, Hh); r.setScissor(p * W, (N - 1 - i) * Hh, W, Hh);
    r.render(sc, cam);
  }
}
window.__DONE__ = true;
</script></body></html>`;
const srv = http.createServer((q, s) => {
  const u = q.url.split('?')[0];
  if (u === '/') { s.writeHead(200, { 'Content-Type': 'text/html' }); return s.end(page); }
  const m = u.match(/^\/m(\d+)\.js$/);
  if (m && files[+m[1]]) { s.writeHead(200, { 'Content-Type': 'text/javascript' }); return s.end(fs.readFileSync(files[+m[1]])); }
  s.writeHead(404); s.end();
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] });
try {
  const pg = await browser.newPage(); pg.on('pageerror', (e) => console.log('pageerror', e.message)); pg.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
  await pg.setViewport({ width: 1200, height: 420 * files.length });
  await pg.goto(`http://127.0.0.1:${srv.address().port}/`, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction('window.__DONE__', { timeout: 90000 });
  await pg.screenshot({ path: out });
  console.log('wrote', out);
} finally { await browser.close(); srv.close(); }
