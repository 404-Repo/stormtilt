// Renderer, sky, light and per-sea dressing.
import * as THREE from 'three';
import { ASSET } from '../assetlib.js';
import { SEAS, TUNING } from './data.js';

const SKY_V = /* glsl */`
varying vec3 vDir;
void main() { vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const SKY_F = /* glsl */`
uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSunDir; uniform vec3 uSunCol;
uniform sampler2D uTex; uniform float uTexOn; uniform float uFlash; uniform float uRep; uniform float uStorm;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float el = asin(clamp(d.y, -1.0, 1.0));
  float y = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(uHor, uTop, pow(y, 0.55));
  if (uTexOn > 0.5) {
    float u = (atan(d.x, d.z) / 6.2831853 + 0.5) * uRep;
    float v = 0.25 + el / radians(76.0) * 0.75;
    vec3 t = texture2D(uTex, vec2(u, clamp(v, 0.004, 0.996))).rgb;
    float top = smoothstep(0.93, 1.0, v);
    col = mix(t, col, top);
    if (v < 0.25) col = mix(t, uHor, smoothstep(0.25, 0.1, v) * 0.5);
  }
  float s = max(dot(d, uSunDir), 0.0);
  col += uSunCol * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.25 + pow(s, 6.0) * 0.12) * (1.0 - uStorm * 0.5);
  col += vec3(0.6, 0.75, 1.0) * uFlash * (0.3 + 0.3 * y);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class World {
  constructor(canvas) {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    r.setPixelRatio(this.dpr);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.3, 4000);
    this.fog = new THREE.Fog(0x9a8aa0, 260, 1500); this.scene.fog = this.fog;
    // sky
    this.skyU = {
      uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 0.3, 1).normalize() },
      uSunCol: { value: new THREE.Color() }, uTex: { value: null }, uTexOn: { value: 0 }, uFlash: { value: 0 }, uRep: { value: 2 }, uStorm: { value: 0 },
    };
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), new THREE.ShaderMaterial({ uniforms: this.skyU, vertexShader: SKY_V, fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, fog: false }));
    this.sky.frustumCulled = false; this.sky.renderOrder = -10; this.scene.add(this.sky);
    // light
    this.hemi = new THREE.HemisphereLight(0x9ec9ff, 0x3c6b6b, 1.1); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffd09a, 3); this.sun.castShadow = true;
    const sc = this.sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 10; sc.far = 260;
    this.sun.shadow.mapSize.set(2048, 2048); this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun, this.sun.target);
    this.flashLight = new THREE.DirectionalLight(0xbfe6ff, 0); this.flashLight.position.set(0, 100, 0); this.scene.add(this.flashLight);
    this.pmrem = new THREE.PMREMGenerator(r);
    this.texCache = new Map();
    this.dressing = new THREE.Group(); this.scene.add(this.dressing);
    this.bobbers = [];
    this.flash = 0;
  }
  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // portrait phones get a wider vertical field so the side-by-side pass still fits
    this.camera.fov = w < h ? 62 : 50;
    this.camera.updateProjectionMatrix();
    return this.camera.fov;
  }
  loadTex(name) {
    if (this.texCache.has(name)) return this.texCache.get(name);
    const p = new Promise((res) => new THREE.TextureLoader().load(`./tex/${name}`, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4; res(t); }, undefined, () => res(null)));
    this.texCache.set(name, p); return p;
  }
  async applySea(id, ocean) {
    const S = SEAS[id]; this.seaId = id;
    this.skyU.uTop.value.set(S.sky.top); this.skyU.uHor.value.set(S.sky.hor);
    const sd = new THREE.Vector3(...S.sun.dir).normalize();
    this.skyU.uSunDir.value.copy(sd); this.skyU.uSunCol.value.set(S.sun.col);
    this.skyU.uStorm.value = S.weather.rain;
    this.sunDir = sd;
    this.sun.color.set(S.sun.col); this.sun.intensity = S.sun.int;
    this.hemi.color.set(S.hemi[0]); this.hemi.groundColor.set(S.hemi[1]); this.hemi.intensity = S.hemi[2];
    this.fog.color.set(S.sky.haze);
    this.renderer.toneMappingExposure = S.exposure;
    const u = ocean.userData.mat.uniforms;
    u.uSunDir.value.copy(sd); u.uSunCol.value.set(S.sun.col);
    u.uDeep.value.set(S.water.deep); u.uShallow.value.set(S.water.shallow); u.uFoam.value.set(S.water.foam);
    u.uSkyTop.value.set(S.sky.top); u.uSkyHor.value.set(S.sky.hor); u.uHaze.value.set(S.sky.haze);
    u.uGlow.value = S.glow; u.uFoamAmt.value = S.foam ?? 1;
    this.skyU.uTexOn.value = 0; u.uSkyOn.value = 0;
    const tex = await this.loadTex(S.skyTex);
    if (tex && this.seaId === id) { this.skyU.uTex.value = tex; this.skyU.uTexOn.value = 1; u.uSky.value = tex; u.uSkyOn.value = 1; }
    this.buildEnv();
    await this.dress(S.dressing);
  }
  buildEnv() {
    // environment for glossy hulls: render the sky alone into a PMREM
    const envScene = new THREE.Scene();
    const sky2 = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), this.sky.material);
    envScene.add(sky2);
    const old = this.scene.environment;
    this.scene.environment = this.pmrem.fromScene(envScene, 0.02).texture;
    if (old) old.dispose();
    this.scene.environmentIntensity = 0.85;
  }
  async dress(kind) {
    this.dressing.clear(); this.bobbers = [];
    const L = TUNING.laneHalf;
    const put = async (name, x, z, o = {}) => {
      if (window.__has && !window.__has(name)) return new THREE.Group();
      const m = await ASSET(`./assets/${name}.js`, { ...(o.h ? { height: o.h } : {}), ...(o.kh ? { keepHierarchy: true } : {}) });
      m.position.set(x, o.y ?? 0, z); m.rotation.y = o.ry ?? 0;
      if (o.s) m.scale.multiplyScalar(o.s);
      if (o.noShadow) m.traverse((c) => { c.castShadow = false; });
      this.dressing.add(m);
      if (o.bob) this.bobbers.push({ m, wl: o.wl ?? 0.4, ph: Math.random() * 6 });
      return m;
    };
    const jobs = [];
    // lane buoys every 26 m on both sides
    for (let z = -78; z <= 78; z += 26) for (const s of [-1, 1]) jobs.push(put('buoy_lane', s * (L + 3), z, { bob: true, wl: 0.55, noShadow: true }));
    if (kind === 'regatta' || kind === 'eye') {
      // the regatta crowds the far end of the lane and its sides, where the chase camera looks
      jobs.push(put('lighthouse', 70, 330, { ry: -0.6, noShadow: true }));
      jobs.push(put('judges_barge', L + 20, 112, { ry: -2.2, bob: true, wl: 0.9 }));
      for (const [x, z, ry] of [[L + 14, 40, -1.4], [-(L + 12), 70, 1.3], [L + 18, 150, -2.4], [-(L + 16), 128, 2.0], [-(L + 10), -20, 1.6], [L + 12, -60, -1.6], [-6, 175, 3.0], [14, 168, 2.8]]) jobs.push(put('spectator_boat', x, z, { ry, bob: true, wl: 0.6 }));
      jobs.push(put('sea_stack_a', -95, 290, { ry: 0.4, noShadow: true }));
      jobs.push(put('sea_stack_b', -150, 360, { ry: 2.4, noShadow: true }));
      jobs.push(put('island_far', 180, 520, { ry: 0.3, noShadow: true }));
      jobs.push(put('breakwater', -(L + 46), 60, { ry: Math.PI / 2 + 0.2, noShadow: true }));
      for (const [x, z, ry] of [[L + 6, 100, 1.4], [-(L + 6), 132, 1.6], [L + 8, 30, 1.5]]) jobs.push(put('bunting_line', x, z, { ry, y: 3.5, noShadow: true }));
    }
    if (kind === 'thunder') {
      jobs.push(put('sea_stack_b', -80, 260, { ry: 1.2, noShadow: true }));
      jobs.push(put('sea_stack_a', 90, 300, { ry: 2.2, noShadow: true }));
      jobs.push(put('lighthouse', 30, 420, { ry: -0.6, noShadow: true }));
      for (const [x, z] of [[-(L + 14), -20], [L + 16, 40]]) jobs.push(put('reef_rocks', x, z, { ry: Math.random() * 6 }));
      jobs.push(put('shipwreck', L + 22, 120, { ry: -0.8, bob: false }));
      jobs.push(put('sea_arch', -110, 380, { ry: 0.5, noShadow: true }));
    }
    if (kind === 'gale') {
      for (const [x, z, n] of [[-(L + 30), 120, 'sea_stack_b'], [L + 36, 80, 'sea_stack_a'], [-(L + 60), 220, 'sea_stack_a'], [L + 70, 200, 'sea_stack_b'], [-20, 320, 'sea_stack_b'], [L + 20, -40, 'sea_stack_a']]) jobs.push(put(n, x, z, { ry: Math.random() * 6, noShadow: true }));
      for (const [x, z] of [[-(L + 12), 20], [L + 12, -50]]) jobs.push(put('reef_rocks', x, z, { ry: Math.random() * 6 }));
      jobs.push(put('sea_arch', 60, 360, { ry: -0.3, noShadow: true }));
      jobs.push(put('island_far', -200, 560, { ry: 2.6, noShadow: true }));
    }
    if (kind === 'rogue') {
      jobs.push(put('sea_stack_b', -70, 300, { ry: 1, noShadow: true }));
      jobs.push(put('sea_stack_a', 110, 250, { ry: 3, noShadow: true }));
      for (const [x, z] of [[-(L + 18), 10], [L + 16, 70], [L + 20, -60]]) jobs.push(put('barrel_float', x, z, { bob: true, wl: 0.3 }));
      jobs.push(put('shipwreck', -(L + 20), 90, { ry: 0.9 }));
      jobs.push(put('whale_tail', L + 30, 150, { ry: -1.2, bob: true, wl: 0.4 }));
      jobs.push(put('sea_arch', 20, 420, { ry: 0.1, noShadow: true }));
    }
    if (kind === 'eye') {
      for (const [x, z] of [[-(L + 14), 30], [L + 14, -30]]) jobs.push(put('lifebuoy', x, z, { bob: true, wl: 0.1 }));
      jobs.push(put('shipwreck', L + 26, 70, { ry: -0.5 }));
    }
    for (let i = 0; i < 5; i++) jobs.push(put('gull', (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 140, { y: 14 + Math.random() * 10, kh: true, noShadow: true }).then((m) => { m.userData.gull = { a: Math.random() * 6, r: 20 + Math.random() * 30, cx: m.position.x, cz: m.position.z, y: m.position.y, sp: 0.2 + Math.random() * 0.2 }; }));
    await Promise.all(jobs);
  }
  update(dt, t, sea) {
    for (const b of this.bobbers) {
      const p = b.m.position; const h = sea.height(p.x, p.z, t);
      p.y = h - b.wl; b.m.rotation.x = Math.sin(t * 0.9 + b.ph) * 0.05; b.m.rotation.z = Math.cos(t * 0.8 + b.ph) * 0.05;
    }
    for (const m of this.dressing.children) {
      const g = m.userData.gull; if (!g) continue;
      g.a += dt * g.sp; m.position.set(g.cx + Math.cos(g.a) * g.r, g.y + Math.sin(g.a * 3) * 1.2, g.cz + Math.sin(g.a) * g.r);
      m.rotation.y = -g.a; m.rotation.z = 0.25;
      const j = m.userData.joints; if (j) { const f = Math.sin(t * 6 + g.a * 5) * 0.35; if (j.wingL) j.wingL.rotation.z = f; if (j.wingR) j.wingR.rotation.z = f; }
    }
    // lightning flash decays
    this.flash = Math.max(0, this.flash - dt * 3.2);
    this.skyU.uFlash.value = this.flash;
    this.flashLight.intensity = this.flash * 2.5;
  }
  aimShadow(center) {
    const d = this.sunDir || new THREE.Vector3(0, 1, 0);
    this.sun.position.copy(center).addScaledVector(d, 120); this.sun.target.position.copy(center);
  }
}
