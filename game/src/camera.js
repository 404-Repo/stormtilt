// Camera director: chase over the foredeck, a two-shot that keeps both yachts in frame as they close,
// a slow-motion pass, a follow on whoever got hit, a crane over the weather between tilts, a broadcast view for 2P.
import * as THREE from 'three';

const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

export class Director {
  constructor(camera) {
    this.cam = camera;
    this.pos = new THREE.Vector3(0, 10, -110); this.tgt = new THREE.Vector3(0, 2, 0);
    this.wantPos = this.pos.clone(); this.wantTgt = this.tgt.clone();
    this.mode = 'crane'; this.k = 3.5; this.shake = 0; this.fovKick = 0; this.baseFov = 55;
    this.roll = 0; this.up = new THREE.Vector3(0, 1, 0);
  }
  snap() { this.pos.copy(this.wantPos); this.tgt.copy(this.wantTgt); }
  // place the camera along direction `dir` (unit, from target toward camera) far enough that every point fits
  frame(points, dir, margin = 1.25, minDist = 8) {
    const c = v1.set(0, 0, 0); for (const p of points) c.add(p); c.multiplyScalar(1 / points.length);
    const cam = this.cam;
    const vf = THREE.MathUtils.degToRad(cam.fov) / 2, hf = Math.atan(Math.tan(vf) * cam.aspect);
    // camera basis
    const fwd = v2.copy(dir).negate().normalize();
    const right = v3.crossVectors(fwd, this.up).normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd);
    let need = minDist;
    for (const p of points) {
      const d = p.clone().sub(c);
      const x = Math.abs(d.dot(right)), y = Math.abs(d.dot(up)), z = d.dot(fwd);
      need = Math.max(need, x * margin / Math.tan(hf) - z, y * margin / Math.tan(vf) - z);
    }
    this.wantTgt.copy(c);
    this.wantPos.copy(c).addScaledVector(dir, need);
    return need;
  }
  update(dt, ctx) {
    const { me, foe, ttp, mode } = ctx;
    this.mode = mode;
    if (mode === 'chase' && me) {
      const f = me.forward(new THREE.Vector3());
      const left = new THREE.Vector3(f.z, 0, -f.x);
      const capY = me.y + me.deckY();
      // over the right shoulder, low over the foredeck, looking down the lane at the rival
      const close = foe ? THREE.MathUtils.clamp(1 - (ttp - 0.6) / 2.2, 0, 1) : 0;
      const e = close * close * (3 - 2 * close);
      // on the port quarter, outboard of the rail: the captain and lance ahead-right, the rival coming at us on the left
      const back = 7.0 + 4 * e, height = 3.6 + 3.0 * e, side = 1.9 + 2.5 * e;
      this.wantPos.set(me.x, capY, me.z).addScaledVector(f, -back + me.dims.captainZ).addScaledVector(left, side);
      this.wantPos.y = Math.max(capY + height, ctx.seaH(this.wantPos.x, this.wantPos.z) + 2.2);
      const aim = new THREE.Vector3(me.x, capY + 2.2, me.z).addScaledVector(f, 18);
      if (foe) {
        const fp = new THREE.Vector3(foe.x, foe.y + foe.deckY() + 1.5, foe.z);
        aim.lerp(fp, 0.22 + 0.45 * e);
        aim.x += (new THREE.Vector3(f.z, 0, -f.x)).x * -1.2 * (1 - e); aim.z += (new THREE.Vector3(f.z, 0, -f.x)).z * -1.2 * (1 - e);
        if (e > 0.05) {
          // two-shot: blend toward a framing that holds both captains and both bows
          const a = me.worldOfCaptain(new THREE.Vector3()), b = foe.worldOfCaptain(new THREE.Vector3());
          const dir = new THREE.Vector3().addScaledVector(f, -0.75).addScaledVector(left, 0.32).setY(0.62).normalize();
          const bowA = new THREE.Vector3(me.x, me.y + 1, me.z).addScaledVector(f, me.dims.length * 0.5);
          const pts = [a, b, bowA, new THREE.Vector3(foe.x, foe.y + 1, foe.z)];
          const keepPos = this.wantPos.clone(), keepTgt = aim.clone();
          this.frame(pts, dir, 1.18, 12);
          this.wantPos.lerp(keepPos, 1 - e); this.wantTgt.lerpVectors(keepTgt, this.wantTgt, e);
        } else this.wantTgt.copy(aim);
      } else this.wantTgt.copy(aim);
      this.k = 5;
    } else if (mode === 'pass' && me && foe) {
      // slow motion side angle on the clash, from the chaser's starboard quarter, low
      const f = me.forward(new THREE.Vector3()); const left = new THREE.Vector3(f.z, 0, -f.x);
      const a = me.worldOfCaptain(new THREE.Vector3()), b = foe.worldOfCaptain(new THREE.Vector3());
      // from above and between the hulls, slightly ahead of the chaser: both captains, the lances crossing
      const dir = new THREE.Vector3().addScaledVector(f, 0.3).addScaledVector(left, 0.4).setY(0.95).normalize();
      this.frame([a, b, a.clone().setY(a.y + 2.5), b.clone().setY(b.y + 2.5)], dir, 1.45, 15);
      this.k = 7;
    } else if (mode === 'follow' && ctx.subject) {
      const s = ctx.subject;
      const dir = ctx.followDir || new THREE.Vector3(-0.6, 0.45, -0.66).normalize();
      this.wantTgt.copy(s);
      this.wantPos.copy(s).addScaledVector(dir, ctx.followDist || 14);
      this.wantPos.y = Math.max(this.wantPos.y, ctx.seaH(this.wantPos.x, this.wantPos.z) + 2);
      this.k = 3;
    } else if (mode === 'crane') {
      const t = ctx.craneT || 0;
      // from high behind the chaser's start, sweeping down toward the chase position
      const e = Math.min(1, t / 1.6), s = e * e * (3 - 2 * e);
      const z0 = me ? me.z : -90, x0 = me ? me.x : 0;
      const hi = new THREE.Vector3(x0 + 26, 42, z0 - 40), lo = new THREE.Vector3(x0 - 2.2, (me ? me.y + me.deckY() : 1) + 4.2, z0 - 9.5 + (me ? me.dims.captainZ : 0));
      this.wantPos.lerpVectors(hi, lo, s);
      const tHi = new THREE.Vector3(0, 0, 0), tLo = new THREE.Vector3(x0, 3, z0 + 18);
      this.wantTgt.lerpVectors(tHi, tLo, s);
      this.k = 12;
    } else if (mode === 'broadcast' && me && foe) {
      // 2P: high, looking across the lane so the lane runs up the screen in portrait
      const c = new THREE.Vector3((me.x + foe.x) / 2, 0, (me.z + foe.z) / 2);
      const span = Math.abs(me.z - foe.z);
      const dist = 40 + span * 0.55;
      this.wantTgt.copy(c);
      this.wantPos.set(c.x + dist * 0.82, dist * 0.92, c.z);
      this.k = 3;
    } else if (mode === 'title') {
      const t = ctx.time;
      this.wantTgt.set(Math.sin(t * 0.05) * 10, 3, 10);
      this.wantPos.set(Math.sin(t * 0.07) * 30 - 20, 7 + Math.sin(t * 0.2) * 1.5, -40 + Math.cos(t * 0.06) * 10);
      this.k = 2;
    }
    // springs
    const a = 1 - Math.exp(-this.k * dt);
    this.pos.lerp(this.wantPos, a); this.tgt.lerp(this.wantTgt, Math.min(1, a * 1.4));
    // keep above the water
    const hw = ctx.seaH ? ctx.seaH(this.pos.x, this.pos.z) + 1.2 : -Infinity;
    if (this.pos.y < hw) this.pos.y = hw;
    this.cam.position.copy(this.pos);
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2.5);
      const s = this.shake * this.shake * 0.6;
      this.cam.position.x += (Math.random() - 0.5) * s; this.cam.position.y += (Math.random() - 0.5) * s; this.cam.position.z += (Math.random() - 0.5) * s;
    }
    if (mode === 'broadcast') this.cam.up.set(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), 0); else this.cam.up.set(0, 1, 0);
    if (mode === 'broadcast') this.cam.up.set(0, 0, 1);
    this.cam.lookAt(this.tgt);
    this.fovKick *= Math.exp(-dt * 4);
    const fov = this.baseFov + this.fovKick;
    if (Math.abs(this.cam.fov - fov) > 0.01) { this.cam.fov = fov; this.cam.updateProjectionMatrix(); }
  }
}
