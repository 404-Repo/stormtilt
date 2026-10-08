// Particles: spray and foam puffs (soft sprites), splinters (instanced shards), sparks, rain, lightning bolts.
import * as THREE from 'three';

const SPRITE_V = /* glsl */`
attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
varying float vA; varying vec3 vC;
uniform float uScale;
void main() {
  vC = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vA = min(aAlpha, 0.5) * smoothstep(4.0, 12.0, -mv.z);   // never whitewash the lens
  gl_PointSize = aSize * uScale / max(-mv.z, 0.5);
  gl_Position = projectionMatrix * mv;
}`;
const SPRITE_F = /* glsl */`
varying float vA; varying vec3 vC;
void main() {
  vec2 d = gl_PointCoord - 0.5; float r = length(d);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.15, r) * vA;
  gl_FragColor = vec4(vC, a);
  #include <colorspace_fragment>
}`;

export class Sprites {
  constructor(scene, max = 1600, additive = false) {
    this.max = max; this.n = 0;
    this.p = new Float32Array(max * 3); this.v = new Float32Array(max * 3);
    this.life = new Float32Array(max); this.age = new Float32Array(max);
    this.size = new Float32Array(max); this.size0 = new Float32Array(max); this.grow = new Float32Array(max);
    this.alpha = new Float32Array(max); this.a0 = new Float32Array(max);
    this.col = new Float32Array(max * 3); this.drag = new Float32Array(max); this.grav = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 400 } }, vertexShader: SPRITE_V, fragmentShader: SPRITE_F,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = 5;
    this.geo = g; scene.add(this.pts);
  }
  emit(x, y, z, vx, vy, vz, o = {}) {
    let i;
    if (this.n < this.max) i = this.n++;
    else { i = (this._r = ((this._r || 0) + 1) % this.max); }
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.life[i] = o.life ?? 1; this.age[i] = 0;
    this.size0[i] = o.size ?? 1; this.grow[i] = o.grow ?? 1;
    this.a0[i] = o.alpha ?? 0.9; this.drag[i] = o.drag ?? 0.8; this.grav[i] = o.grav ?? 9.8;
    const c = o.color || WHITE; this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
  }
  step(dt, seaHeight) {
    let w = 0;
    for (let i = 0; i < this.n; i++) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) continue;
      const k = this.age[i] / this.life[i];
      const dr = Math.exp(-this.drag[i] * dt);
      this.v[i * 3] *= dr; this.v[i * 3 + 2] *= dr; this.v[i * 3 + 1] = this.v[i * 3 + 1] * dr - this.grav[i] * dt;
      let x = this.p[i * 3] + this.v[i * 3] * dt, y = this.p[i * 3 + 1] + this.v[i * 3 + 1] * dt, z = this.p[i * 3 + 2] + this.v[i * 3 + 2] * dt;
      if (seaHeight && this.grav[i] > 0) { const h = seaHeight(x, z); if (y < h) { y = h; this.v[i * 3 + 1] *= -0.1; this.age[i] += dt * 2; } }
      if (w !== i) {
        this.v[w * 3] = this.v[i * 3]; this.v[w * 3 + 1] = this.v[i * 3 + 1]; this.v[w * 3 + 2] = this.v[i * 3 + 2];
        this.life[w] = this.life[i]; this.age[w] = this.age[i]; this.size0[w] = this.size0[i]; this.grow[w] = this.grow[i];
        this.a0[w] = this.a0[i]; this.drag[w] = this.drag[i]; this.grav[w] = this.grav[i];
        this.col[w * 3] = this.col[i * 3]; this.col[w * 3 + 1] = this.col[i * 3 + 1]; this.col[w * 3 + 2] = this.col[i * 3 + 2];
      }
      this.p[w * 3] = x; this.p[w * 3 + 1] = y; this.p[w * 3 + 2] = z;
      this.size[w] = this.size0[w] * (1 + (this.grow[w] - 1) * k);
      this.alpha[w] = this.a0[w] * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
      w++;
    }
    this.n = w;
    this.geo.setDrawRange(0, w);
    for (const a of ['position', 'aSize', 'aAlpha', 'aColor']) this.geo.attributes[a].needsUpdate = true;
  }
}
const WHITE = new THREE.Color(1, 1, 1);

// splinters: a pool of instanced shards with simple ballistic motion and spin
export class Shards {
  constructor(scene, max = 120) {
    this.max = max;
    const g = new THREE.BoxGeometry(0.06, 0.06, 0.55);
    this.mesh = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false; this.mesh.castShadow = false;
    this.items = []; scene.add(this.mesh);
    this.m = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); this.s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < max; i++) this.mesh.setColorAt(i, new THREE.Color(1, 1, 1));
    this.mesh.count = 0;
  }
  burst(pos, dir, n, colors, speed = 9) {
    for (let i = 0; i < n; i++) {
      if (this.items.length >= this.max) this.items.shift();
      const c = colors[i % colors.length];
      this.items.push({
        p: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)),
        v: new THREE.Vector3(dir.x * speed * (0.4 + Math.random()) + (Math.random() - 0.5) * speed, 3 + Math.random() * speed * 0.8, dir.z * speed * (0.4 + Math.random()) + (Math.random() - 0.5) * speed),
        r: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6), w: new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
        life: 2.2 + Math.random(), age: 0, c: new THREE.Color(c), sc: 0.5 + Math.random() * 1.2,
      });
    }
  }
  step(dt, seaHeight) {
    let k = 0;
    this.items = this.items.filter((it) => (it.age += dt) < it.life);
    for (const it of this.items) {
      it.v.y -= 13 * dt; it.p.addScaledVector(it.v, dt); it.r.addScaledVector(it.w, dt);
      const h = seaHeight ? seaHeight(it.p.x, it.p.z) : 0;
      if (it.p.y < h + 0.05) { it.p.y = h + 0.05; it.v.multiplyScalar(0.3); it.w.multiplyScalar(0.5); it.v.y = 0; }
      this.q.setFromEuler(this.e.set(it.r.x, it.r.y, it.r.z));
      const f = Math.min(1, (it.life - it.age) * 2);
      this.s.set(f, f, f * it.sc);
      this.m.compose(it.p, this.q, this.s);
      this.mesh.setMatrixAt(k, this.m); this.mesh.setColorAt(k, it.c); k++;
    }
    this.mesh.count = k;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}

// Rain: streaks in a box that follows the camera.
export class Rain {
  constructor(scene, n = 1400) {
    this.n = n; this.box = 60;
    const pos = new Float32Array(n * 6); this.base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { this.base[i * 3] = Math.random(); this.base[i * 3 + 1] = Math.random(); this.base[i * 3 + 2] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.LineBasicMaterial({ color: 0xcfd8ff, transparent: true, opacity: 0.32, depthWrite: false });
    this.lines = new THREE.LineSegments(g, this.mat); this.lines.frustumCulled = false; this.lines.renderOrder = 6;
    this.geo = g; this.t = 0; this.amount = 0; scene.add(this.lines);
  }
  step(dt, cam, wind = 0.25) {
    this.lines.visible = this.amount > 0.01;
    if (!this.lines.visible) return;
    this.t += dt;
    const p = this.geo.attributes.position.array, B = this.box, fall = 26;
    const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;
    const count = Math.floor(this.n * this.amount);
    for (let i = 0; i < this.n; i++) {
      if (i >= count) { p[i * 6 + 1] = -999; p[i * 6 + 4] = -999; continue; }
      const bx = this.base[i * 3], by = this.base[i * 3 + 1], bz = this.base[i * 3 + 2];
      const y = ((by * B - this.t * fall) % B + B) % B;
      const x = cx + (bx - 0.5) * B + (B - y) * wind, z = cz + (bz - 0.5) * B;
      const yy = cy - B * 0.5 + y;
      p[i * 6] = x; p[i * 6 + 1] = yy; p[i * 6 + 2] = z;
      p[i * 6 + 3] = x - wind * 1.2; p[i * 6 + 4] = yy + 1.3; p[i * 6 + 5] = z;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
}

// A lightning bolt: jagged emissive ribbon of line segments plus branches, fades fast.
export class Bolts {
  constructor(scene) {
    this.scene = scene; this.list = [];
    this.mat = new THREE.MeshBasicMaterial({ color: 0xdff8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    this.glow = new THREE.MeshBasicMaterial({ color: 0x6fd8ff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  }
  strike(top, bottom) {
    const g = new THREE.Group();
    const pts = [top.clone()];
    const n = 14;
    for (let i = 1; i < n; i++) {
      const t = i / n; const p = top.clone().lerp(bottom, t);
      p.x += (Math.random() - 0.5) * 7 * Math.sin(t * Math.PI); p.z += (Math.random() - 0.5) * 7 * Math.sin(t * Math.PI);
      pts.push(p);
    }
    pts.push(bottom.clone());
    const seg = (a, b, r, mat) => {
      const d = b.clone().sub(a); const L = d.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 5, 1, true), mat);
      m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      g.add(m);
    };
    for (let i = 0; i < pts.length - 1; i++) { seg(pts[i], pts[i + 1], 0.16, this.mat); seg(pts[i], pts[i + 1], 0.55, this.glow); }
    for (let b = 0; b < 3; b++) {
      const i = 2 + Math.floor(Math.random() * (n - 5)); let a = pts[i].clone();
      for (let j = 0; j < 4; j++) { const c = a.clone().add(new THREE.Vector3((Math.random() - 0.5) * 8, -4 - Math.random() * 4, (Math.random() - 0.5) * 8)); seg(a, c, 0.1, this.mat); a = c; }
    }
    this.scene.add(g); this.list.push({ g, age: 0, life: 0.45 });
  }
  step(dt) {
    for (const b of this.list) {
      b.age += dt; const f = Math.max(0, 1 - b.age / b.life);
      const flick = f * (0.6 + 0.4 * Math.sin(b.age * 80));
      b.g.children.forEach((m) => { m.material = m.material; });
      b.g.visible = flick > 0.05;
      b.g.scale.setScalar(1);
      b.g.userData.f = flick;
    }
    this.mat.opacity = Math.min(1, Math.max(0, ...this.list.map((b) => b.g.userData.f || 0), 0));
    this.glow.opacity = this.mat.opacity * 0.35;
    this.list = this.list.filter((b) => {
      if (b.age < b.life) return true;
      b.g.traverse((o) => o.geometry && o.geometry.dispose()); this.scene.remove(b.g); return false;
    });
  }
}
