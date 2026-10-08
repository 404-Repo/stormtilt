// The sea: a Gerstner swell plus travelling crest lines (the ramps), drawn by one shader and sampled on the
// CPU with the same maths so boats ride exactly the surface you see. A wake/foam canvas covers the arena.
import * as THREE from 'three';

export const G = 9.8;
export const MAX_WAVES = 6;
export const MAX_CRESTS = 4;
export const ARENA = { x0: -110, x1: 110, z0: -150, z1: 150 };   // high-res patch; the lane lives inside it

// ---------- CPU side (must match the GLSL below) ----------
export class Sea {
  constructor() {
    this.waves = [];   // {dx,dz,k,c,A,Q}
    this.crests = [];  // {ox,oz,nx,nz,c,A,w,half,born,life}
    this.t = 0;
    this.chop = 1;
  }
  setSwell(list) {
    // list: [{angle(deg), L, A, Q}]
    this.waves = list.slice(0, MAX_WAVES).map((w) => {
      const a = (w.angle * Math.PI) / 180, k = (2 * Math.PI) / w.L;
      return { dx: Math.cos(a), dz: Math.sin(a), k, c: Math.sqrt(G / k), A: w.A, Q: w.Q ?? 0.5 };
    });
  }
  // crest envelope (0..1) over life: rises, holds, falls
  crestEnv(cr, t) {
    const age = t - cr.born;
    if (age < 0 || age > cr.life) return 0;
    const fin = Math.min(1, age / 1.2), fout = Math.min(1, (cr.life - age) / 1.5);
    return Math.max(0, Math.min(fin, fout));
  }
  crestH(cr, x, z, t, env) {
    const px = x - cr.ox, pz = z - cr.oz;
    const u = px * cr.nx + pz * cr.nz - cr.c * (t - cr.born);
    const v = -px * cr.nz + pz * cr.nx;
    const s = 1 / Math.cosh(u / cr.w);
    const m = 1 - smooth(cr.half - 8, cr.half + 6, Math.abs(v));
    // a little forward lean: the face toward travel is steeper
    const lean = 1 + 0.25 * Math.tanh(-u / cr.w);
    return cr.A * env * s * s * m * lean;
  }
  // displacement of the surface point that STARTED at (x,z)
  disp(x, z, t, out) {
    let dx = 0, dy = 0, dz = 0;
    for (const w of this.waves) {
      const ph = w.k * (w.dx * x + w.dz * z - w.c * t);
      const cs = Math.cos(ph), sn = Math.sin(ph);
      dx += w.Q * w.A * w.dx * cs; dz += w.Q * w.A * w.dz * cs; dy += w.A * sn;
    }
    for (const cr of this.crests) {
      const env = this.crestEnv(cr, t);
      if (env > 0) dy += this.crestH(cr, x, z, t, env);
    }
    const cx = (ARENA.x0 + ARENA.x1) / 2, cz = (ARENA.z0 + ARENA.z1) / 2;
    const ed = Math.max(Math.abs(x - cx) - (ARENA.x1 - ARENA.x0) / 2, Math.abs(z - cz) - (ARENA.z1 - ARENA.z0) / 2);
    const k = 1 - 0.45 * smooth(-30, 0, ed);
    out.x = dx * k; out.y = dy * k; out.z = dz * k;
    return out;
  }
  // height of the surface at world (x,z): invert the horizontal displacement by fixed-point iteration
  height(x, z, t = this.t) {
    const d = _d;
    let sx = x, sz = z;
    for (let i = 0; i < 3; i++) { this.disp(sx, sz, t, d); sx = x - d.x; sz = z - d.z; }
    this.disp(sx, sz, t, d);
    return d.y;
  }
  normal(x, z, t = this.t, out = new THREE.Vector3()) {
    const e = 0.6;
    const hx = this.height(x + e, z, t) - this.height(x - e, z, t);
    const hz = this.height(x, z + e, t) - this.height(x, z - e, t);
    return out.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
  }
  addCrest(c) { this.crests.push(c); if (this.crests.length > MAX_CRESTS) this.crests.shift(); }
  prune(t) { this.crests = this.crests.filter((c) => t - c.born < c.life); }
}
const _d = new THREE.Vector3();
function smooth(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

// ---------- GPU side ----------
const COMMON = /* glsl */`
uniform float uTime;
uniform vec4 uW[${MAX_WAVES}];   // dx, dz, k, c
uniform vec2 uWA[${MAX_WAVES}];  // A, Q
uniform int uNW;
uniform vec4 uC0[${MAX_CRESTS}]; // ox, oz, nx, nz
uniform vec4 uC1[${MAX_CRESTS}]; // c, A*env, w, half
uniform float uCAge[${MAX_CRESTS}];
uniform int uNC;
vec3 dispAt(vec2 p) {
  vec3 d = vec3(0.0);
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    if (i >= uNW) break;
    vec4 w = uW[i]; vec2 aq = uWA[i];
    float ph = w.z * (w.x * p.x + w.y * p.y - w.w * uTime);
    float cs = cos(ph), sn = sin(ph);
    d.x += aq.y * aq.x * w.x * cs; d.z += aq.y * aq.x * w.y * cs; d.y += aq.x * sn;
  }
  for (int i = 0; i < ${MAX_CRESTS}; i++) {
    if (i >= uNC) break;
    vec4 a = uC0[i]; vec4 b = uC1[i];
    if (b.y <= 0.0) continue;
    vec2 q = p - a.xy;
    float u = dot(q, a.zw) - b.x * uCAge[i];
    float v = -q.x * a.w + q.y * a.z;
    float s = 1.0 / cosh(u / b.z);
    float m = 1.0 - smoothstep(b.w - 8.0, b.w + 6.0, abs(v));
    float lean = 1.0 + 0.25 * tanh(-u / b.z);
    d.y += b.y * s * s * m * lean;
  }
  return d;
}
float crestFoam(vec2 p) {
  float f = 0.0;
  for (int i = 0; i < ${MAX_CRESTS}; i++) {
    if (i >= uNC) break;
    vec4 a = uC0[i]; vec4 b = uC1[i];
    if (b.y <= 0.0) continue;
    vec2 q = p - a.xy;
    float u = dot(q, a.zw) - b.x * uCAge[i];
    float v = -q.x * a.w + q.y * a.z;
    float m = 1.0 - smoothstep(b.w - 8.0, b.w + 6.0, abs(v));
    // foam rides the lip and trails behind it
    float lip = exp(-pow((u + b.z * 0.25) / (b.z * 0.35), 2.0));
    float trail = smoothstep(0.0, -b.z * 2.0, u) * exp(u / (b.z * 2.2)) * 0.32;
    f = max(f, (lip + trail) * m * clamp(b.y / 2.0, 0.0, 1.0));
  }
  return f;
}
`;

const VERT = /* glsl */`
${COMMON}
uniform vec4 uRect;       // arena centre x,z and half sizes: waves calm a little outside it
varying vec2 vBase;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vH;
varying float vCrest;
void main() {
  vec3 p = (modelMatrix * vec4(position, 1.0)).xyz;
  vec2 xz = p.xz;
  vBase = xz;
  float ed = max(abs(xz.x - uRect.x) - uRect.z, abs(xz.y - uRect.y) - uRect.w);
  float uDamp = mix(1.0, 0.55, smoothstep(-30.0, 0.0, ed));
  vec3 d = dispAt(xz) * uDamp;
  float e = 0.8;
  vec3 dx1 = dispAt(xz + vec2(e, 0.0)) * uDamp;
  vec3 dz1 = dispAt(xz + vec2(0.0, e)) * uDamp;
  vec3 P = vec3(xz.x + d.x, d.y, xz.y + d.z);
  vec3 PX = vec3(xz.x + e + dx1.x, dx1.y, xz.y + dx1.z);
  vec3 PZ = vec3(xz.x + dz1.x, dz1.y, xz.y + e + dz1.z);
  vNormalW = normalize(cross(PZ - P, PX - P));
  vWorld = P;
  vH = d.y;
  vCrest = crestFoam(xz) * uDamp;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;

const FRAG = /* glsl */`
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uFoam;
uniform vec3 uSkyTop;
uniform vec3 uSkyHor;
uniform vec3 uHaze;
uniform float uHazeDist;
uniform float uAmp;       // swell amplitude sum, to normalise height for colour
uniform sampler2D uWake;  // arena wake/foam canvas
uniform vec4 uWakeRect;   // x0, z0, 1/w, 1/h
uniform sampler2D uSky;   // panoramic backdrop, for reflections
uniform float uSkyOn;
uniform float uGlow;      // bioluminescence (night sea)
uniform vec3 uGlowCol;
uniform float uFlash;     // lightning flash
uniform vec4 uRect;
uniform float uIsFar;
uniform vec4 uGust[4];   // x, halfwidth, z0, z1 (halfwidth 0 = off)
varying vec2 vBase;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vH;
varying float vCrest;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

vec3 skyColor(vec3 r) {
  float y = clamp(r.y, 0.0, 1.0);
  vec3 g = mix(uSkyHor, uSkyTop, pow(y, 0.6));
  if (uSkyOn > 0.5) {
    float az = atan(r.x, r.z) / 6.2831853 + 0.5;
    float v = clamp(1.0 - (0.25 + 0.75 * y), 0.02, 0.98);
    vec3 s = texture2D(uSky, vec2(az, v)).rgb;
    g = mix(g, s, 0.75);
  }
  return g;
}

void main() {
  if (uIsFar > 0.5 && abs(vBase.x - uRect.x) < uRect.z - 1.5 && abs(vBase.y - uRect.y) < uRect.w - 1.5) discard;
  vec3 V = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);
  // detail normal: two scrolling noise layers, fading with distance
  vec2 uv = vWorld.xz;
  float fade = 1.0 - smoothstep(30.0, 220.0, dist);
  float n1 = fbm(uv * 0.35 + vec2(uTime * 0.25, uTime * 0.12));
  float n2 = fbm(uv * 0.9 - vec2(uTime * 0.4, -uTime * 0.3));
  float ex = (fbm(uv * 0.35 + vec2(0.37, 0.0) + vec2(uTime * 0.25, uTime * 0.12)) - n1);
  float ez = (fbm(uv * 0.35 + vec2(0.0, 0.37) + vec2(uTime * 0.25, uTime * 0.12)) - n1);
  vec3 N = normalize(vNormalW + vec3(-ex, 0.0, -ez) * 1.6 * fade + vec3(n2 - 0.5, 0.0, n2 - 0.5) * 0.08 * fade);
  if (dot(N, V) < 0.02) N = normalize(N + V * 0.1);

  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 R = reflect(-V, N); R.y = abs(R.y);
  vec3 refl = skyColor(R);

  // body colour: deep in the troughs, a lit translucent shallow colour on faces and crests (subsurface look)
  float h = clamp(vH / max(uAmp, 0.3) * 0.5 + 0.5, 0.0, 1.0);
  float facing = pow(max(dot(-V, uSunDir) * 0.5 + 0.5, 0.0), 2.0);
  float sss = clamp(h * 0.9 + vCrest * 0.6, 0.0, 1.0) * (0.55 + 0.45 * facing);
  vec3 body = mix(uDeep, uShallow, sss);
  float diff = max(dot(N, uSunDir), 0.0);
  body *= 0.75 + 0.45 * diff;
  body += uSunCol * 0.06 * diff;

  // gust lanes: darker, ruffled water with streaks running down the lane
  float gust = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 gq = uGust[i];
    if (gq.y <= 0.0) continue;
    float ex = 1.0 - smoothstep(gq.y * 0.6, gq.y, abs(vWorld.x - gq.x));
    float ez = smoothstep(gq.z, gq.z + 12.0, vWorld.z) * (1.0 - smoothstep(gq.w - 12.0, gq.w, vWorld.z));
    gust = max(gust, ex * ez);
  }
  if (gust > 0.0) {
    float st = fbm(vec2(vWorld.x * 2.2, vWorld.z * 0.12 + uTime * 2.4));
    body = mix(body, body * 0.55 + uDeep * 0.2, gust * 0.8);
    body += vec3(0.75, 0.9, 1.0) * smoothstep(0.62, 0.8, st) * gust * 0.35;
  }
  vec3 col = mix(body, refl, fres * 0.85);

  // sun glint
  vec3 H = normalize(uSunDir + V);
  float spec = pow(max(dot(N, H), 0.0), 260.0) * 4.0 + pow(max(dot(N, H), 0.0), 40.0) * 0.18;
  col += uSunCol * spec;

  // foam: crest lines, the steepest swell tops, the wake canvas, broken up by noise
  vec2 wuv = vec2((vWorld.x - uWakeRect.x) * uWakeRect.z, (vWorld.z - uWakeRect.y) * uWakeRect.w);
  float wake = 0.0;
  if (wuv.x > 0.0 && wuv.x < 1.0 && wuv.y > 0.0 && wuv.y < 1.0) wake = texture2D(uWake, wuv).r;
  float topFoam = smoothstep(0.78, 0.98, h) * 0.55;
  float fn = fbm(uv * 1.3 + vec2(uTime * 0.1, 0.0));
  float fh = noise(uv * 4.5 + vec2(uTime * 0.3, -uTime * 0.2)) * noise(uv * 2.1 - vec2(0.0, uTime * 0.15));
  float foam = clamp(vCrest * 1.25 + topFoam + wake * 1.25, 0.0, 1.6);
  float foamMask = smoothstep(0.42, 0.8, foam * (0.3 + 0.7 * fn + 0.9 * fh));
  vec3 foamCol = uFoam * (0.78 + 0.32 * diff) + uSunCol * 0.05;
  col = mix(col, foamCol, foamMask * 0.92);

  // bioluminescence on broken water at night
  col += uGlowCol * uGlow * (foamMask * 0.9 + smoothstep(0.85, 1.0, h) * 0.25) * (0.6 + 0.4 * sin(uTime * 2.0 + uv.x * 0.3));

  // lightning flash lifts the whole sea for a moment
  col += vec3(0.55, 0.7, 0.95) * uFlash * (0.25 + fres);

  // aerial haze toward the horizon (sky coloured, not grey)
  float hz = smoothstep(uHazeDist * 0.25, uHazeDist, dist);
  vec3 hazeC = mix(uHaze, skyColor(normalize(vec3(-V.x, 0.02, -V.z))), 0.6);
  col = mix(col, hazeC, hz);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function makeOceanMaterial(sea, wakeTex) {
  const u = {
    uTime: { value: 0 }, uIsFar: { value: 0 },
    uRect: { value: new THREE.Vector4((ARENA.x0 + ARENA.x1) / 2, (ARENA.z0 + ARENA.z1) / 2, (ARENA.x1 - ARENA.x0) / 2, (ARENA.z1 - ARENA.z0) / 2) },
    uW: { value: Array.from({ length: MAX_WAVES }, () => new THREE.Vector4()) },
    uWA: { value: Array.from({ length: MAX_WAVES }, () => new THREE.Vector2()) },
    uNW: { value: 0 },
    uC0: { value: Array.from({ length: MAX_CRESTS }, () => new THREE.Vector4()) },
    uC1: { value: Array.from({ length: MAX_CRESTS }, () => new THREE.Vector4()) },
    uCAge: { value: new Array(MAX_CRESTS).fill(0) },
    uNC: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.3, 0.4, 0.8).normalize() },
    uSunCol: { value: new THREE.Color(1, 0.8, 0.55) },
    uDeep: { value: new THREE.Color(0x0b4f5c) }, uShallow: { value: new THREE.Color(0x27a59a) },
    uFoam: { value: new THREE.Color(0xf2efe2) },
    uSkyTop: { value: new THREE.Color(0x3b3358) }, uSkyHor: { value: new THREE.Color(0xffb347) },
    uHaze: { value: new THREE.Color(0x9a8aa0) }, uHazeDist: { value: 900 },
    uAmp: { value: 1.5 },
    uWake: { value: wakeTex }, uWakeRect: { value: new THREE.Vector4() },
    uSky: { value: null }, uSkyOn: { value: 0 },
    uGlow: { value: 0 }, uGlowCol: { value: new THREE.Color(0x40ffe0) },
    uFlash: { value: 0 },
    uGust: { value: Array.from({ length: 4 }, () => new THREE.Vector4()) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG });
  mat.userData.sync = (t) => {
    u.uTime.value = t;
    u.uNW.value = sea.waves.length;
    sea.waves.forEach((w, i) => { u.uW.value[i].set(w.dx, w.dz, w.k, w.c); u.uWA.value[i].set(w.A, w.Q); });
    u.uNC.value = sea.crests.length;
    sea.crests.forEach((c, i) => {
      u.uC0.value[i].set(c.ox, c.oz, c.nx, c.nz);
      u.uC1.value[i].set(c.c, c.A * sea.crestEnv(c, t), c.w, c.half);
      u.uCAge.value[i] = t - c.born;
    });
    u.uAmp.value = sea.waves.reduce((s, w) => s + w.A, 0);
  };
  return mat;
}

// The arena patch (dense) and a far plane (coarse, calmer) out to the horizon.
export function makeOcean(sea, wakeTex) {
  const group = new THREE.Group();
  const mat = makeOceanMaterial(sea, wakeTex);
  const w = ARENA.x1 - ARENA.x0, d = ARENA.z1 - ARENA.z0;
  const g1 = new THREE.PlaneGeometry(w, d, Math.round(w / 1.15), Math.round(d / 1.15));
  g1.rotateX(-Math.PI / 2);
  const inner = new THREE.Mesh(g1, mat);
  inner.position.set((ARENA.x0 + ARENA.x1) / 2, 0, (ARENA.z0 + ARENA.z1) / 2);
  inner.frustumCulled = false;
  group.add(inner);
  // far plane: a ring-ish grid that gets coarser outward (radial warp), skipping the inner patch area by sitting lower
  const far = new THREE.PlaneGeometry(1, 1, 96, 96);
  far.rotateX(-Math.PI / 2);
  const p = far.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * 2, z = p.getZ(i) * 2;   // -1..1
    const r = Math.max(Math.abs(x), Math.abs(z));
    const s = r < 1e-6 ? 0 : (Math.pow(r, 2.2) * 2600) / r;
    p.setXYZ(i, x * s, -0.05, z * s);
  }
  far.computeBoundingSphere();
  const farMat = new THREE.ShaderMaterial({ uniforms: { ...mat.uniforms, uIsFar: { value: 1 } }, vertexShader: mat.vertexShader, fragmentShader: mat.fragmentShader });
  const farMesh = new THREE.Mesh(far, farMat);
  farMesh.frustumCulled = false;
  farMesh.renderOrder = -1;
  group.add(farMesh);
  group.userData.mat = mat;
  return group;
}

// Wake canvas: boats paint foam into it every frame; it fades.
export class Wake {
  constructor(res = 256) {
    this.res = res;
    this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = res;
    this.cx = this.cv.getContext('2d');
    this.cx.fillStyle = '#000'; this.cx.fillRect(0, 0, res, res);
    this.tex = new THREE.CanvasTexture(this.cv);
    this.tex.colorSpace = THREE.NoColorSpace;
    this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
    this.rect = new THREE.Vector4(ARENA.x0, ARENA.z0, 1 / (ARENA.x1 - ARENA.x0), 1 / (ARENA.z1 - ARENA.z0));
    this.acc = 0;
  }
  toPx(x, z) { return [(x - ARENA.x0) * this.rect.z * this.res, (z - ARENA.z0) * this.rect.w * this.res]; }
  blob(x, z, r, a) {
    const [px, py] = this.toPx(x, z); const rp = r * this.rect.z * this.res;
    const g = this.cx.createRadialGradient(px, py, 0, px, py, Math.max(rp, 0.5));
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    this.cx.fillStyle = g; this.cx.beginPath(); this.cx.arc(px, py, Math.max(rp, 0.5), 0, 6.283); this.cx.fill();
  }
  ring(x, z, r, a, wpx = 1.5) {
    const [px, py] = this.toPx(x, z); const rp = r * this.rect.z * this.res;
    this.cx.strokeStyle = `rgba(255,255,255,${a})`; this.cx.lineWidth = wpx;
    this.cx.beginPath(); this.cx.arc(px, py, rp, 0, 6.283); this.cx.stroke();
  }
  step(dt) {
    this.acc += dt;
    if (this.acc > 1 / 30) {
      this.cx.globalCompositeOperation = 'source-over';
      this.cx.fillStyle = `rgba(0,0,0,${Math.min(0.2, this.acc * 1.1)})`;
      this.cx.fillRect(0, 0, this.res, this.res);
      this.acc = 0;
    }
    this.tex.needsUpdate = true;
  }
}
