// The storm's verbs: rollers (crest ramps), lightning cells, gust lanes, waterspouts, rogue waves.
import * as THREE from 'three';
import { TUNING } from './data.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const pickN = (r) => (Array.isArray(r) ? Math.round(rnd(r[0], r[1])) : r);

export class Weather {
  constructor(game) {
    this.game = game; this.scene = game.scene;
    this.cells = []; this.gusts = []; this.spouts = [];
    this.group = new THREE.Group(); this.scene.add(this.group);
    // shared visuals
    this.ringGeo = new THREE.RingGeometry(0.86, 1.0, 64, 1); this.ringGeo.rotateX(-Math.PI / 2);
    this.discGeo = new THREE.CircleGeometry(1, 48); this.discGeo.rotateX(-Math.PI / 2);
    // soft cloud puff texture
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const cx = cv.getContext('2d');
    for (let i = 0; i < 14; i++) {
      const x = 30 + Math.random() * 68, y = 34 + Math.random() * 60, r = 18 + Math.random() * 26;
      const g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
    }
    this.puffTex = new THREE.CanvasTexture(cv); this.puffTex.colorSpace = THREE.SRGBColorSpace;
    this.shaftGeo = new THREE.CylinderGeometry(1, 1.15, 1, 28, 1, true); this.shaftGeo.translate(0, 0.5, 0);
  }
  clear() {
    for (const c of this.cells) this.group.remove(c.g);
    for (const s of this.spouts) this.group.remove(s.g);
    for (const g of this.gusts) if (g.g) this.group.remove(g.g);
    this.cells = []; this.gusts = []; this.spouts = [];
  }
  // plan the weather for one tilt; tp = expected seconds from now to the pass
  spawnTilt(seaCfg, t, tp, A, B, opts = {}) {
    this.clear();
    const W = seaCfg.weather, sea = this.game.sea;
    const S = TUNING.startZ, L = TUNING.laneHalf;
    // rollers: each one aimed to meet one boat shortly before the pass, somewhere off its current line
    const nr = pickN(W.rollers || 0) + (opts.extraRollers || 0);
    for (let i = 0; i < nr; i++) {
      const target = (i + (opts.flip ? 1 : 0)) % 2 === 0 ? A : B;
      this.addRoller(t, tp, target, { A: rnd(2.3, 3.0), w: 5.2, half: rnd(9, 13), lead: rnd(0.45, 1.1) });
    }
    if (W.rogue) this.addRoller(t, tp, Math.random() < 0.5 ? A : B, { A: 5.2, w: 7.5, half: 26, lead: 0.8, rogue: true });
    // lightning cells: strike a little before the pass, somewhere between the boats
    const nc = pickN(W.cells || 0) + (opts.extraCells || 0);
    for (let i = 0; i < nc; i++) {
      // each cell is laid in one yacht's path so it can be caught (or must be dodged) a little before the pass
      const strikeIn = Math.max(2.2, tp - rnd(0.8, 2.0));
      const toward = opts.cellAt || ((i + (opts.flip ? 1 : 0)) % 2 === 0 ? A : B);
      const z = toward.z + toward.dir * toward.boat.speed * 0.95 * strikeIn;
      const x = THREE.MathUtils.clamp(toward.x + (opts.cellAt ? rnd(-2, 2) : rnd(-9, 9)), -L + 6, L - 6);
      this.addCell(x, z, t + strikeIn, opts.cellAt ? 7.5 : 6.5);
    }
    // gust lanes
    const ng = pickN(W.gusts || 0);
    for (let i = 0; i < ng; i++) this.addGust(rnd(-L + 5, L - 5), rnd(2.6, 3.6));
    const ns = pickN(W.spouts || 0);
    for (let i = 0; i < ns; i++) this.addSpout(rnd(-L + 6, L - 6), rnd(-30, 30), t);
    sea.prune(t);
  }
  addRoller(t, tp, target, o) {
    const sea = this.game.sea;
    const c = o.rogue ? 7 : rnd(5, 7);
    const ang = rnd(16, 32) * (Math.random() < 0.5 ? -1 : 1) * Math.PI / 180;
    // travel toward the target boat (along -target.dir), slightly oblique
    const dz = -target.dir; const nx = Math.sin(ang) * 1, nz = Math.cos(ang) * dz;
    const v = target.boat.speed;
    const meetT = Math.max(1.4, tp - o.lead);
    // where the target will be at meetT, and where the crest must start to be there then
    const zm = target.z + target.dir * v * meetT;
    const xm = THREE.MathUtils.clamp(target.x + rnd(-1, 1) * (o.rogue ? 2 : 9), -TUNING.laneHalf + 4, TUNING.laneHalf - 4);
    const ox = xm - nx * c * meetT, oz = zm - nz * c * meetT;
    sea.addCrest({ ox, oz, nx, nz, c, A: o.A, w: o.w, half: o.half, born: t, life: meetT + 5, rogue: !!o.rogue });
  }
  addCell(x, z, strikeAt, r) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(this.ringGeo, new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    const disc = new THREE.Mesh(this.discGeo, new THREE.MeshBasicMaterial({ color: 0x2a1f5a, transparent: true, opacity: 0.3, depthWrite: false }));
    const inner = new THREE.Mesh(this.ringGeo, ring.material.clone());
    g.add(ring, disc, inner);
    // the cloud: soft dark puffs high above, lit from inside when it is about to strike
    const cloud = new THREE.Group();
    const puffMat = new THREE.SpriteMaterial({ map: this.puffTex, color: 0x3a2f5c, transparent: true, depthWrite: false, fog: false });
    for (let i = 0; i < 16; i++) {
      const sp = new THREE.Sprite(puffMat); const a = Math.random() * 6.283, rr = Math.random() * r * 0.9;
      sp.position.set(Math.cos(a) * rr, rnd(-2, 4), Math.sin(a) * rr); const sc = rnd(13, 22); sp.scale.set(sc, sc * 0.7, 1); cloud.add(sp);
    }
    cloud.position.y = 21; g.add(cloud);
    // a shaft of rain under it
    const shaftMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uP: { value: 0 }, uFade: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: 'varying vec2 vUv; uniform float uT; uniform float uP; uniform float uFade; float h(float x){return fract(sin(x*91.7)*437.5);} void main(){ float c=floor(vUv.x*170.0); float fx=fract(vUv.x*170.0); float s=fract(vUv.y*2.4+uT*2.6+h(c)); float streak=smoothstep(0.82,1.0,s)*step(0.5,h(c+3.0))*smoothstep(0.0,0.5,fx)*smoothstep(1.0,0.5,fx); float a=(0.12+0.22*streak)*smoothstep(0.0,0.15,vUv.y)*smoothstep(1.0,0.7,vUv.y); gl_FragColor=vec4(mix(vec3(0.55,0.5,0.8),vec3(0.75,0.95,1.0),uP),a*(0.8+0.6*uP)*uFade);} ',
    });
    const shaft = new THREE.Mesh(this.shaftGeo, shaftMat); shaft.scale.set(r * 0.85, 22, r * 0.85); g.add(shaft);
    cloud.userData.puff = puffMat; cloud.userData.shaft = shaftMat;
    const glow = new THREE.PointLight(0x9fe8ff, 0, 60, 1.5); glow.position.y = 30; g.add(glow);
    g.position.set(x, 0, z); this.group.add(g);
    this.cells.push({ g, ring, inner, disc, cloud, glow, x, z, r, strikeAt, vx: rnd(-0.6, 0.6), struck: 0, rearm: 3.4 });
  }
  addGust(x, hw) {
    // dark ruffled streak drawn by the sea shader + wind-line particles
    this.gusts.push({ x, hw, z0: -TUNING.startZ - 10, z1: TUNING.startZ + 10 });
  }
  addSpout(x, z, t) {
    const geo = new THREE.CylinderGeometry(1.6, 4.5, 40, 24, 12, true);
    geo.translate(0, 20, 0);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uT: { value: 0 } },
      vertexShader: 'varying vec2 vUv; uniform float uT; void main(){ vUv=uv; vec3 p=position; float k=p.y/40.0; p.x+=sin(k*5.0+uT*2.0)*2.5*k; p.z+=cos(k*4.0+uT*1.7)*2.0*k; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);} ',
      fragmentShader: 'varying vec2 vUv; uniform float uT; void main(){ float s=sin(vUv.x*40.0+vUv.y*18.0-uT*9.0)*0.5+0.5; float a=(0.25+0.35*s)*smoothstep(0.0,0.08,vUv.y)*smoothstep(1.0,0.75,vUv.y); gl_FragColor=vec4(mix(vec3(0.75,0.9,0.92),vec3(1.0),s),a);} ',
    });
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat)); g.position.set(x, 0, z); this.group.add(g);
    this.spouts.push({ g, mat, x, z, vx: rnd(-2.5, 2.5), vz: rnd(-1, 1), r: 4.2 });
  }
  gustAt(x, z) {
    for (const g of this.gusts) if (Math.abs(x - g.x) < g.hw && z > g.z0 && z < g.z1) return 1;
    return 0;
  }
  update(dt, t, boats, fx) {
    const sea = this.game.sea;
    for (const c of this.cells) {
      c.x += c.vx * dt; c.g.position.x = c.x;
      const h = sea.height(c.x, c.z, t);
      c.g.position.y = 0;
      c.ring.position.y = h + 0.25; c.inner.position.y = h + 0.3; c.disc.position.y = h + 0.2;
      const toStrike = c.strikeAt - t;
      const pulse = toStrike > 0 ? Math.max(0, 1 - toStrike / 3) : 0;
      c.ring.scale.setScalar(c.r); c.disc.scale.setScalar(c.r);
      const ir = toStrike > 0 ? c.r * Math.min(1, Math.max(0.05, toStrike / 3)) : c.r;
      c.inner.scale.setScalar(ir);
      c.ring.material.opacity = 0.35 + 0.5 * pulse + 0.15 * Math.sin(t * 20) * pulse;
      c.inner.material.opacity = 0.25 + 0.6 * pulse;
      c.disc.material.opacity = 0.12 + 0.2 * pulse;
      c.glow.intensity = pulse * 40 * (0.5 + 0.5 * Math.sin(t * 37));
      c.cloud.rotation.y += dt * 0.2;
      const fl = pulse * (0.5 + 0.5 * Math.sin(t * 37)) * (Math.random() < 0.3 ? 1 : 0.3);
      c.cloud.userData.puff.color.setRGB(0.035 + fl * 0.5, 0.03 + fl * 0.65, 0.07 + fl * 0.8);
      c.cloud.userData.shaft.uniforms.uT.value = t; c.cloud.userData.shaft.uniforms.uP.value = pulse;
      const cam = this.game.world.camera.position; const dc = Math.hypot(cam.x - c.x, cam.z - c.z);
      c.cloud.userData.shaft.uniforms.uFade.value = THREE.MathUtils.smoothstep(dc, c.r * 1.3, c.r * 3.6);
      const d3 = Math.hypot(cam.x - c.x, cam.y - 21, cam.z - c.z);
      c.cloud.userData.puff.opacity = THREE.MathUtils.smoothstep(d3, c.r + 8, c.r + 26);
      c.cloud.visible = c.cloud.userData.puff.opacity > 0.02;
      if (toStrike <= 0 && c.struck < 2) {
        c.struck++; c.strikeAt = t + c.rearm;
        this.game.onStrike?.(c, boats);
      }
      if (fx && pulse > 0.3 && Math.random() < pulse * 0.6) {
        const a = Math.random() * 6.283, rr = c.r * Math.random();
        fx.sparks.emit(c.x + Math.cos(a) * rr, h + 0.4, c.z + Math.sin(a) * rr, 0, 2 + Math.random() * 3, 0, { life: 0.35, size: 1.4, grow: 0.2, alpha: 1, drag: 1, grav: 0, color: CYAN });
      }
    }
    for (const s of this.spouts) {
      s.x += s.vx * dt; s.z += s.vz * dt;
      if (Math.abs(s.x) > TUNING.laneHalf - 4) s.vx *= -1;
      s.g.position.set(s.x, sea.height(s.x, s.z, t) - 0.5, s.z); s.mat.uniforms.uT.value = t;
      if (fx && Math.random() < 0.8) { const a = Math.random() * 6.283; fx.spray.emit(s.x + Math.cos(a) * 4, s.g.position.y + 0.5, s.z + Math.sin(a) * 4, -Math.sin(a) * 6, 3 + Math.random() * 4, Math.cos(a) * 6, { life: 1.2, size: 2.2, grow: 2.5, alpha: 0.5, drag: 0.8, grav: 4 }); }
      for (const b of boats) {
        if (!b.spinCD && Math.hypot(b.x - s.x, b.z - s.z) < s.r + b.boat.beam * 0.4) {
          b.spinCD = 2.5; b.stun = Math.max(b.stun, 0.9); b.vx += (b.x > s.x ? 1 : -1) * 11; b.spin = 1;
          this.game.onSpout?.(b);
        }
      }
    }
    for (const b of boats) if (b.spinCD) b.spinCD = Math.max(0, b.spinCD - dt);
    for (const b of boats) { const g = this.gustAt(b.x, b.z); b.gust += (g - b.gust) * Math.min(1, dt * 2); }
    if (fx) for (const g of this.gusts) {
      if (Math.random() < 0.9) {
        const z = g.z0 + Math.random() * (g.z1 - g.z0), x = g.x + (Math.random() - 0.5) * g.hw * 2;
        fx.wind.emit(x, sea.height(x, z, t) + 0.6 + Math.random() * 2.5, z, 0, 0, 0, { life: 0.9, size: 0.9, grow: 1, alpha: 0.5, drag: 0, grav: 0, color: WINDC });
      }
    }
  }
}
const CYAN = new THREE.Color(0x9fe8ff);
const WINDC = new THREE.Color(0xeaf6ff);
