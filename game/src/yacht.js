// A yacht with its captain and lance: arcade sailing physics on the Gerstner sea, crest jumps, couching.
import * as THREE from 'three';
import { BOATS, LANCES, TUNING } from './data.js';

const UP = new THREE.Vector3(0, 1, 0);

export class Yacht {
  constructor(game, o) {
    this.game = game; this.o = o;
    this.boat = BOATS[o.boat]; this.lance = LANCES[o.lance];
    this.dims = o.dims;        // from boats.json
    this.dir = o.dir;          // +1 charges toward +Z, -1 toward -Z
    this.root = new THREE.Group();     // position + yaw
    this.body = new THREE.Group();     // pitch, roll, bob
    this.root.add(this.body);
    this.hull = o.hull; this.body.add(this.hull);
    this.hull.position.y = -this.dims.waterlineY;
    // captain on the port side of the foredeck
    this.capRoot = new THREE.Group();
    this.capRoot.position.set(this.portX(), this.deckY(), this.dims.captainZ);
    this.body.add(this.capRoot);
    this.captain = o.captain; this.capRoot.add(this.captain);
    this.captain.rotation.y = 0;
    // lance pivot at the right hand / armpit height; geometry along +Z from the grip
    this.lancePivot = new THREE.Group();
    this.lancePivot.position.set(-0.32, 1.22 * (o.capScale || 1), 0.15);
    this.capRoot.add(this.lancePivot);
    this.lanceModel = o.lanceModel; this.lancePivot.add(this.lanceModel);
    this.lanceModel.position.z = -(o.gripZ ?? 0.6);
    this.shield = o.shield || null;
    if (this.shield) { this.shield.position.set(0.42, 1.15, 0.25); this.shield.rotation.y = 0.5; this.capRoot.add(this.shield); }
    if (o.buddy) { this.buddy = o.buddy; this.buddy.position.set(-0.7, this.deckY(), this.dims.captainZ - 1.7); this.buddy.rotation.y = 0.5; this.body.add(this.buddy); }
    game.scene.add(this.root);
    this.reset(0, 0);
  }
  portX() { return Math.min(1.1, this.boat.beam * 0.22) * 1; }
  deckY() { return this.dims.keelToDeck - this.dims.waterlineY + 0.02; }
  reset(x, z) {
    this.x = x; this.z = z; this.vx = 0; this.speed = this.boat.speed * 0.9;
    this.y = 0; this.vy = 0; this.air = false; this.airT = 0; this.hPrev = null;
    this.pitch = 0; this.roll = 0; this.yaw = 0; this.bobT = Math.random() * 10;
    this.couch = 0; this.couchHeld = false; this.couchedAt = -1; this.lanceUp = true;
    this.stun = 0; this.charged = false; this.chargeT = 0; this.gust = 0; this.spin = 0;
    this.braced = 0; this.hitAnim = 0; this.broken = false; this.overboard = null;
    this.lanceModel.scale.set(1, 1, 1);
    this.capRoot.visible = true; this.captain.position.set(0, 0, 0); this.captain.rotation.set(0, 0, 0);
    this.capRoot.position.set(this.portX(), this.deckY(), this.dims.captainZ);
    this.lancePivot.rotation.set(-1.35, 0, 0);
    this.steer = 0; this.landed = 0;
  }
  get captainY() { return this.y + this.deckY() + 1.4 + this.boat.lift; }
  forward(out = new THREE.Vector3()) { return out.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  worldOfCaptain(out = new THREE.Vector3()) { this.capRoot.updateWorldMatrix(true, false); return out.setFromMatrixPosition(this.capRoot.matrixWorld).add(new THREE.Vector3(0, 1.3, 0)); }
  lanceTip(out = new THREE.Vector3()) {
    this.lancePivot.updateWorldMatrix(true, false);
    const L = (this.o.lanceLen || 5.5) * this.lanceModel.scale.z - (this.o.gripZ ?? 0.6);
    return out.set(0, 0, L).applyMatrix4(this.lancePivot.matrixWorld);
  }

  update(dt, t, input, sea, fx, wake) {
    const B = this.boat;
    // ---- steering: lateral velocity toward the stick, slowed by couching and stuns
    let steer = this.air || this.stun > 0 || this.overboard ? 0 : input.steer;
    const steerK = (this.couch > 0.5 ? 0.62 : 1) * B.turn;
    const vxT = -steer * B.speed * 0.5 * steerK * this.dir;   // +steer = toward the boat's starboard (screen right for the chaser)
    this.vx += (vxT - this.vx) * Math.min(1, dt * 6.0 * B.turn);
    if (this.spin > 0) { this.spin -= dt; }
    // ---- speed
    let vT = B.speed * (1 + 0.38 * this.gust) * (this.couch > 0.5 ? 0.96 : 1) * (this.stun > 0 ? 0.55 : 1) * (this.landed > 0 ? 0.8 : 1);
    if (this.overboard) vT = B.speed * 0.25;
    this.speed += (vT - this.speed) * Math.min(1, dt * 1.6);
    this.landed = Math.max(0, this.landed - dt);
    this.x += this.vx * dt; this.z += this.dir * this.speed * dt;
    const lh = TUNING.laneHalf + 6;
    if (Math.abs(this.x) > lh) { this.x = Math.sign(this.x) * lh; this.vx *= -0.3; }
    this.yaw = Math.atan2(this.vx, this.dir * this.speed);
    // ---- vertical: ride the surface, leave it when it falls away faster than gravity
    const h = sea.height(this.x, this.z, t);
    if (this.hPrev === null) this.hPrev = h;
    const vs = (h - this.hPrev) / Math.max(dt, 1e-3); this.hPrev = h;
    const g = TUNING.gravity;
    if (!this.air) {
      const vyOld = this.vy;
      this.vy += (vs - this.vy) * Math.min(1, dt * 18);
      this.y = h;
      if (vyOld > 3.2 && vyOld - g * dt > vs + 0.5 && !this.overboard) {
        this.air = true; this.airT = 0; this.vy = vyOld * (B.jump || 1) * 1.05;
        this.game.onTakeoff?.(this);
      }
    } else {
      this.airT += dt; this.vy -= g * dt; this.y += this.vy * dt;
      if (this.y <= h) {
        const impact = vs - this.vy; this.y = h; this.air = false; this.vy = vs;
        if (impact > 4) { this.landed = 0.7; this.game.onLand?.(this, impact); }
      }
    }
    // ---- attitude: sample the surface fore/aft and port/starboard
    const L = this.dims.length * 0.42, W = B.beam * 0.5;
    const fx_ = Math.sin(this.yaw), fz_ = Math.cos(this.yaw);
    let pT, rT;
    if (!this.air) {
      const hb = sea.height(this.x + fx_ * L, this.z + fz_ * L, t), hs = sea.height(this.x - fx_ * L, this.z - fz_ * L, t);
      const hp = sea.height(this.x + fz_ * W, this.z - fx_ * W, t), hsb = sea.height(this.x - fz_ * W, this.z + fx_ * W, t);
      pT = -Math.atan2(hb - hs, 2 * L) * 0.85; rT = Math.atan2(hp - hsb, 2 * W) * 0.6;
    } else {
      pT = -Math.atan2(this.vy, this.speed) * 0.55; rT = -this.vx * this.dir * 0.02;
    }
    rT += this.vx * this.dir * 0.018; // lean into the turn
    this.pitch += (pT - this.pitch) * Math.min(1, dt * 7); this.roll += (rT - this.roll) * Math.min(1, dt * 6);
    // ---- couching: hold to lower; it takes the lance's couch time
    const want = input.couch && this.stun <= 0 && !this.overboard;
    const rate = 1 / Math.max(0.08, this.lance.couch);
    const was = this.couch;
    this.couch = THREE.MathUtils.clamp(this.couch + (want ? rate : -rate * 1.4) * dt, 0, 1);
    if (this.couch >= 1 && was < 1) this.couchedAt = t;
    if (this.couch < 1) this.couchedAt = -1;
    this.couchHeld = want;
    this.lanceUp = this.couch < 0.35;
    this.stun = Math.max(0, this.stun - dt);
    if (this.charged) this.chargeT += dt;
    this.braced = Math.max(0, this.braced - dt);
    this.hitAnim = Math.max(0, this.hitAnim - dt);
    // ---- write transforms
    this.root.position.set(this.x, 0, this.z);
    this.root.rotation.y = this.yaw;
    this.bobT += dt;
    this.body.position.y = this.y + (this.air ? 0 : Math.sin(this.bobT * 1.7) * 0.04);
    this.body.rotation.set(this.pitch, 0, this.roll + (this.stun > 0 ? Math.sin(t * 30) * 0.03 : 0));
    this.poseCaptain(dt, t);
    // ---- wake and spray
    if (!this.overboard || true) {
      const sx = this.x - fx_ * this.dims.length * 0.5, sz = this.z - fz_ * this.dims.length * 0.5;
      if (!this.air) wake.blob(sx, sz, B.beam * 0.26, 0.08);
      const bx = this.x + fx_ * this.dims.length * 0.45, bz = this.z + fz_ * this.dims.length * 0.45;
      if (!this.air && fx) {
        const s = this.speed / 14;
        const n = Math.random() < s * 0.9 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const px = bx + fz_ * side * B.beam * 0.4, pz = bz - fx_ * side * B.beam * 0.4;
          fx.spray.emit(px, h + 0.4, pz, fz_ * side * (2 + Math.random() * 3) + fx_ * this.speed * 0.4, 2 + Math.random() * 3 * s + Math.max(0, vs) * 0.8, -fx_ * side * (2 + Math.random() * 3) + fz_ * this.speed * 0.4, { life: 0.6 + Math.random() * 0.3, size: 0.25 + Math.random() * 0.3, grow: 1.6, alpha: 0.85, drag: 1.2, grav: 11 });
        }
        if (vs > 1.6 && Math.random() < 0.6) {
          for (let i = 0; i < 6; i++) fx.spray.emit(bx + (Math.random() - 0.5) * 3, h + 0.8, bz, (Math.random() - 0.5) * 6 + fx_ * this.speed * 0.6, 5 + Math.random() * 5, (Math.random() - 0.5) * 6 + fz_ * this.speed * 0.6, { life: 0.9, size: 0.5, grow: 1.6, alpha: 0.85, drag: 0.9, grav: 12 });
        }
      }
    }
    // charged lance crackle
    if (this.charged && fx && Math.random() < 0.7) {
      const tip = this.lanceTip(_v);
      fx.sparks.emit(tip.x + (Math.random() - 0.5), tip.y + (Math.random() - 0.5), tip.z + (Math.random() - 0.5), (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, { life: 0.25, size: 1.6, grow: 0.3, alpha: 1, drag: 2, grav: 0, color: CYAN });
    }
  }

  // aim the lance: upright at rest, couched toward the rival when close, shield up when bracing
  poseCaptain(dt, t) {
    const c = this.couch;
    const rival = this.game.rivalOf?.(this);
    let yawT = 0.38, pitT = -0.06;
    if (rival && c > 0.2) {
      const dx = rival.x - this.x, dz = (rival.z - this.z) * this.dir;
      const lateral = dx * this.dir;
      const ahead = Math.max(1.5, dz);
      yawT = THREE.MathUtils.clamp(Math.atan2(lateral - this.portX() * 1.2, ahead * 0.55), 0.15, 1.25);
      pitT = THREE.MathUtils.clamp(-Math.atan2(rival.captainY - this.captainY, Math.hypot(ahead, lateral)) * 0.8, -0.5, 0.5) - 0.04;
    }
    const upYaw = 0.12, upPit = -1.35;
    const e = c * c * (3 - 2 * c);
    const lp = this.lancePivot.rotation;
    const ty = upYaw + (yawT - upYaw) * e, tp = upPit + (pitT - upPit) * e;
    lp.y += (ty - lp.y) * Math.min(1, dt * 14); lp.x += (tp - lp.x) * Math.min(1, dt * 14);
    lp.z = Math.sin(t * 2.3 + this.bobT) * 0.03 * (1 - e);
    // body language
    const cap = this.captain;
    const j = cap.userData.joints || {};
    const lean = e * 0.18 - this.hitAnim * 0.6;
    cap.rotation.x += (lean - cap.rotation.x) * Math.min(1, dt * 10);
    cap.rotation.y = e * 0.25;
    if (j.armR) j.armR.rotation.x = -0.4 * e - 0.9 * (1 - e);
    if (j.armL) j.armL.rotation.x = this.braced > 0 ? -1.4 : -0.2;
    if (this.shield) {
      const sh = this.braced > 0 ? 1 : 0;
      this.shield.position.y += ((1.15 + sh * 0.35) - this.shield.position.y) * Math.min(1, dt * 12);
      this.shield.position.z += ((0.25 + sh * 0.35) - this.shield.position.z) * Math.min(1, dt * 12);
    }
    if (this.hatPop > 0 && j.hat) {
      this.hatPop += dt; const k = this.hatPop / 0.7;
      if (k >= 1) { this.hatPop = 0; j.hat.position.y = this.hatY0 ?? j.hat.position.y; j.hat.rotation.x = 0; }
      else { this.hatY0 ??= j.hat.position.y; j.hat.position.y = this.hatY0 + Math.sin(k * Math.PI) * 0.6 * this.hatPopP; j.hat.rotation.x = Math.sin(k * Math.PI * 2) * 0.8; }
    }
    if (this.buddy) { const bj = this.buddy.userData.joints || {}; const w = Math.sin(t * 7); if (bj.armL) bj.armL.rotation.z = 2.2 + w * 0.5; if (bj.armR) bj.armR.rotation.z = -0.3; this.buddy.position.y = this.deckY() + Math.abs(Math.sin(t * 5)) * 0.12; }
    if (this.overboard) this.animOverboard(dt);
  }

  breakLance() { this.broken = true; this.lanceModel.scale.z = 0.38; }
  knockOverboard(fromDir) {
    // detach the captain into the world and fling them, hat first
    this.game.scene.attach(this.capRoot);
    const j = this.captain.userData.joints || {};
    if (j.hat && j.hat.parent) {
      this.hat = j.hat; this.hatHome = { parent: j.hat.parent, pos: j.hat.position.clone(), rot: j.hat.rotation.clone(), scale: j.hat.scale.clone() };
      this.game.scene.attach(j.hat);
      this.hatFly = { v: new THREE.Vector3(fromDir.x * 5 + (Math.random() - 0.5) * 3, 11, fromDir.z * 5 + this.dir * 3), w: new THREE.Vector3(6, 9, 4), wet: false };
    }
    this.overboard = { v: new THREE.Vector3(fromDir.x * 8, 10, fromDir.z * 8 + this.dir * this.speed * 0.25), w: new THREE.Vector3(5 + Math.random() * 3, Math.random() * 3, 4), wet: false, t: 0 };
    this.game.audio.play('whoa', { vol: 1 });
    // the lance goes its own way
    this.game.scene.attach(this.lancePivot);
    this.lanceFly = { v: new THREE.Vector3(fromDir.x * 3, 6, this.dir * 4), w: 3 + Math.random() * 3, wet: false };
  }
  popHat(power = 1) { this.hatPop = 0.0001; this.hatPopP = power; }
  animOverboard(dt) {
    const o = this.overboard; o.t += dt;
    const cr = this.capRoot, sea = this.game.sea;
    const j = this.captain.userData.joints || {};
    if (!o.wet) {
      o.v.y -= 13 * dt; cr.position.addScaledVector(o.v, dt);
      cr.rotation.x += o.w.x * dt; cr.rotation.z += o.w.z * dt;
      const fl = Math.sin(o.t * 22);
      if (j.armL) j.armL.rotation.z = 1.2 + fl * 0.6; if (j.armR) j.armR.rotation.z = -1.2 - fl * 0.6;
      if (j.legL) j.legL.rotation.x = fl * 0.8; if (j.legR) j.legR.rotation.x = -fl * 0.8;
      const h = sea.height(cr.position.x, cr.position.z);
      if (cr.position.y < h - 0.6 && o.v.y < 0) { o.wet = true; this.game.onSplash?.(cr.position.clone()); this.game.audio.play('laugh', { delay: 0.5, vol: 0.8 }); }
    } else {
      const h = sea.height(cr.position.x, cr.position.z);
      cr.position.y += (h - 0.95 - cr.position.y) * Math.min(1, dt * 4);
      cr.rotation.x += (-0.15 - cr.rotation.x) * Math.min(1, dt * 2); cr.rotation.z += (Math.sin(o.t * 2) * 0.1 - cr.rotation.z) * Math.min(1, dt * 2);
      const wv = Math.sin(o.t * 9);
      if (j.armL) j.armL.rotation.z = 2.4 + wv * 0.4; if (j.armR) j.armR.rotation.z = -2.4 + wv * 0.4;
    }
    this.animHat(dt);
    const lf = this.lanceFly;
    if (lf) {
      const lp = this.lancePivot.position;
      if (!lf.wet) { lf.v.y -= 12 * dt; lp.addScaledVector(lf.v, dt); this.lancePivot.rotation.x += lf.w * dt; if (lp.y < sea.height(lp.x, lp.z) && lf.v.y < 0) lf.wet = true; }
      else { lp.y += (sea.height(lp.x, lp.z) - 0.1 - lp.y) * Math.min(1, dt * 4); this.lancePivot.rotation.x += (0 - this.lancePivot.rotation.x) * Math.min(1, dt * 2); }
    }
  }
  animHat(dt) {
    const hf = this.hatFly; if (!hf || !this.hat) return;
    const hp = this.hat.position, sea = this.game.sea;
    if (!hf.wet) {
      hf.v.y -= 11 * dt; hp.addScaledVector(hf.v, dt); this.hat.rotation.x += hf.w.x * dt; this.hat.rotation.y += hf.w.y * dt;
      if (hp.y < sea.height(hp.x, hp.z) && hf.v.y < 0) { hf.wet = true; this.game.wake.ring(hp.x, hp.z, 1.2, 0.8, 2); }
    } else {
      hp.y += (sea.height(hp.x, hp.z) - 0.05 - hp.y) * Math.min(1, dt * 5);
      this.hat.rotation.x *= 0.9; this.hat.rotation.z *= 0.9; this.hat.rotation.y += dt * 0.4;
    }
  }
  restoreCaptain() {
    if (this.hat && this.hatHome) { this.hatHome.parent.add(this.hat); this.hat.position.copy(this.hatHome.pos); this.hat.rotation.copy(this.hatHome.rot); this.hat.scale.copy(this.hatHome.scale); this.hatFly = null; }
    const j = this.captain.userData.joints || {};
    for (const k of ['armL', 'armR', 'legL', 'legR']) if (j[k]) j[k].rotation.set(0, 0, 0);
    if (this.capRoot.parent !== this.body) { this.body.add(this.capRoot); }
    if (this.lancePivot.parent !== this.capRoot) { this.capRoot.add(this.lancePivot); this.lancePivot.position.set(-0.32, 1.22 * (this.o.capScale || 1), 0.15); this.lancePivot.rotation.set(-1.35, 0, 0); this.lanceFly = null; }
    this.capRoot.rotation.set(0, 0, 0);
    this.capRoot.position.set(this.portX(), this.deckY(), this.dims.captainZ);
    this.overboard = null;
  }
  dispose() { this.game.scene.remove(this.root); if (this.capRoot.parent) this.capRoot.parent.remove(this.capRoot); }
}
const _v = new THREE.Vector3();
const CYAN = new THREE.Color(0x9fe8ff);
