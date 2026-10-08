// One match: a series of tilts until a captain goes over the side.
import * as THREE from 'three';
import { SEAS, CAPTAINS, TUNING } from './data.js';
import { CaptainAI } from './ai.js';

const rnd = (a, b) => a + Math.random() * (b - a);

export class Match {
  constructor(game, cfg) {
    this.game = game; this.cfg = cfg;
    this.sea = SEAS[cfg.sea];
    this.A = cfg.A; this.B = cfg.B;            // Yacht objects. A charges +Z (player 1), B charges -Z.
    this.capA = CAPTAINS[cfg.capA]; this.capB = CAPTAINS[cfg.capB];
    this.footA = cfg.footA ?? 5; this.footB = cfg.footB ?? (this.capB.footing || 3);
    this.maxA = this.footA; this.maxB = this.footB;
    this.tilt = 0; this.phase = 'intro'; this.pt = 0; this.over = false; this.winner = null;
    this.stats = { hits: 0, taken: 0, late: 0, high: 0, charged: 0, rams: 0, koBy: '' };
    this.aiB = cfg.humanB ? null : new CaptainAI(game, this.B, this.A, this.capB.ai);
    this.aiA = cfg.autoA ? new CaptainAI(game, this.A, this.B, cfg.autoA) : null;   // used by the attract mode and tests
    this.boss = !!this.capB.boss; this.bossPhase = 1;
  }
  begin() { this.nextTilt(true); }
  nextTilt(first = false) {
    const g = this.game, t = g.t;
    this.tilt++; this.phase = 'intro'; this.pt = 0; this.passed = false; this.result = null;
    const S = TUNING.startZ;
    const ax = rnd(-7, -2), bx = rnd(2, 7);
    this.A.restoreCaptain(); this.B.restoreCaptain();
    this.A.reset(ax, -S); this.B.reset(bx, S);
    this.A.lanceModel.scale.set(1, 1, 1); this.B.lanceModel.scale.set(1, 1, 1);
    g.controls?.reset(); g.controls2?.reset();
    // weather for this tilt; the boss escalates
    const closing = this.A.boat.speed + this.B.boat.speed;
    const tp = (2 * S) / (closing * 0.97);   // the yachts sail from the first frame of the intro
    const opts = {};
    if (this.boss) {
      if (this.bossPhase >= 2) { opts.extraCells = 1; opts.cellAt = this.A; }
      if (this.bossPhase >= 3) opts.extraRollers = 1;
    }
    opts.flip = this.tilt % 2 === 0;
    if (g.debugWx === 'cell') { opts.extraCells = 1; opts.cellAt = this.A; }
    if (g.debugWx === 'roller') { opts.extraRollers = 1; opts.flip = false; }
    g.weather.spawnTilt(this.sea, t, tp, this.A, this.B, opts);
    if (this.aiB) this.aiB.planTilt(t, tp);
    if (this.aiA) this.aiA.planTilt(t, tp);
    g.ui.tiltNo(this.tilt);
    g.ui.pips(this.footA, this.maxA, this.footB, this.maxB);
    if (!first || this.tilt === 1) {
      const tip = this.tiltTip();
      g.ui.banner(`TILT ${this.tilt}`, tip, 1.5);
    }
    if (Math.random() < 0.55 || this.tilt === 1) g.ui.taunt(this.capB.taunts[Math.floor(Math.random() * this.capB.taunts.length)]);
    g.audio.play('horn', { delay: 1.2, vol: 0.8 });
  }
  tiltTip() {
    const W = this.game.weather, sea = this.game.sea;
    if (W.cells.length) return 'storm cell: keep your lance UP under it';
    if (sea.crests.some((c) => c.rogue)) return 'a rogue wave is coming';
    if (W.gusts.length) return 'ride a gust lane';
    if (sea.crests.length) return 'crest ahead: fly off it at the pass';
    return '';
  }
  ttp() {
    const dz = this.B.z - this.A.z;
    const closing = Math.max(1, this.A.speed + this.B.speed);
    return dz / closing;
  }
  update(dt, t) {
    const g = this.game; this.pt += dt;
    const A = this.A, B = this.B;
    const ttp = this.ttp();
    let inA = { steer: 0, couch: false }, inB = { steer: 0, couch: false };
    if (this.phase === 'intro' || this.phase === 'charge') {
      inA = this.aiA ? this.aiA.update(dt, t, ttp) : g.controls.read();
      inB = this.aiB ? this.aiB.update(dt, t, ttp) : g.controls2.read();
    }
    if (this.phase === 'intro') {
      // yachts already sailing; inputs live so a thumb is never ignored
      if (this.pt > 1.7) this.phase = 'charge';
    }
    A.update(dt, t, inA, g.sea, g.fx, g.wake); B.update(dt, t, inB, g.sea, g.fx, g.wake);
    if (this.phase === 'charge') {
      if (!this.passed && B.z - A.z <= 0) { this.passed = true; this.resolvePass(t); this.phase = 'pass'; this.pt = 0; }
    } else if (this.phase === 'pass') {
      if (this.pt > 0.75) { this.phase = 'after'; this.pt = 0; }
    } else if (this.phase === 'after') {
      const ko = this.result && (this.result.koA || this.result.koB);
      if (this.pt > (ko ? 3.4 : 1.7)) {
        if (this.footA <= 0 || this.footB <= 0) return this.finish();
        this.game.wipe(() => this.nextTilt());
        this.phase = 'wiping'; this.pt = 0;
      }
    }
    return { ttp };
  }
  // the clash
  resolvePass(t) {
    const g = this.game, A = this.A, B = this.B;
    const ra = this.attack(A, B, t), rb = this.attack(B, A, t);
    const res = { a: ra, b: rb };
    const lateral = (B.x - A.x);
    const ramEdge = (A.boat.beam + B.boat.beam) / 2 + TUNING.hitGap;
    let lines = [];
    if (Math.abs(lateral) < ramEdge) {
      // RAM: the heavier hull shoves; the lighter captain loses footing; no lance scores
      res.ram = true; this.stats.rams++;
      const ma = A.boat.mass, mb = B.boat.mass;
      g.audio.play('thud', { vol: 1.2 }); g.audio.play('crack', { rate: 0.7 });
      g.dir.shake = 1.4;
      const push = 12;
      if (Math.abs(ma - mb) < 0.15) { lines.push('RAM! hulls bounce'); A.vx -= push * Math.sign(lateral || 1) * 0.6; B.vx += push * Math.sign(lateral || 1) * 0.6; A.stun = B.stun = 0.6; }
      else if (ma > mb) { this.footB -= 1; res.dmgB = 1; lines.push(`RAM! ${this.capB.name} shoved`); B.vx += push * Math.sign(lateral || 1); B.stun = 1.0; B.hitAnim = 0.6; }
      else { this.footA -= 1; res.dmgA = 1; this.stats.taken++; lines.push(`RAM! You are shoved`); A.vx -= push * Math.sign(lateral || 1); A.stun = 1.0; A.hitAnim = 0.6; }
      g.ui.banner('RAM!', lines[0], 1.4, 'ram');
    } else {
      const dmgOnB = ra.hit ? ra.dmg : 0, dmgOnA = rb.hit ? rb.dmg : 0;
      this.footB -= dmgOnB; this.footA -= dmgOnA;
      res.dmgA = dmgOnA; res.dmgB = dmgOnB;
      if (ra.hit) { this.stats.hits++; if (ra.late) this.stats.late++; if (ra.high) this.stats.high++; if (ra.charged) this.stats.charged++; }
      if (rb.hit) this.stats.taken++;
      // effects per hit
      for (const [att, def, r] of [[A, B, ra], [B, A, rb]]) {
        if (r.hit) {
          const p = def.worldOfCaptain(new THREE.Vector3());
          const away = new THREE.Vector3(def.x - att.x, 0, 0).normalize();
          g.fx.shards.burst(p, away, 22, r.colors || [0xd7372f, 0xf3eee3, 0xa8652f], 10);
          for (let i = 0; i < 26; i++) g.fx.spray.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 8 + away.x * 6, Math.random() * 7, (Math.random() - 0.5) * 8, { life: 0.8, size: 1.4, grow: 2, alpha: 0.7, drag: 1.5, grav: 6 });
          att.breakLance(); def.hitAnim = 0.8;
          if (r.charged) { g.strikeFx(p.clone().setY(p.y + 40), p); att.charged = false; }
          g.audio.play('crack', { vol: 1.2 }); g.audio.play('thud', { delay: 0.03 });
          if (r.charged) g.audio.play('zap', { vol: 1 });
        } else if (r.braced) {
          att.breakLance();
          g.audio.play('bonk', { vol: 0.9 });
        }
      }
      g.dir.shake = (ra.hit || rb.hit) ? 1.1 + 0.25 * Math.max(dmgOnA, dmgOnB) : 0.2;
      g.dir.fovKick = (ra.hit || rb.hit) ? -6 : 0;
      // the banner leads with what the player did
      const tags = (r) => [r.charged && 'CHARGED', r.high && 'HIGH GROUND', r.late && 'LATE COUCH', r.gust && 'FULL SAIL'].filter(Boolean);
      const extra = (r) => tags(r).slice(1).map((x) => '+ ' + x.toLowerCase()).join(' ');
      if (ra.hit && !rb.hit) g.ui.banner(tags(ra)[0] ? `${tags(ra)[0]}!` : 'HIT!', `${extra(ra)} ${extra(ra) ? '. ' : ''}${this.capB.name} loses ${dmgOnB}`, 1.6, 'good');
      else if (ra.hit && rb.hit) g.ui.banner('BOTH HIT!', `you dealt ${dmgOnB}, took ${dmgOnA}${tags(rb).length ? ' (' + tags(rb).join(', ').toLowerCase() + ')' : ''}`, 1.6, dmgOnB >= dmgOnA ? 'good' : 'bad');
      else if (!ra.hit && rb.hit) g.ui.banner(tags(rb)[0] ? `${tags(rb)[0]}!` : 'STRUCK!', `you lose ${dmgOnA} footing. ${ra.why || ''}`, 1.6, 'bad');
      else g.ui.banner(ra.braced ? 'GLANCED OFF' : 'MISS', ra.why || rb.why || '', 1.3, 'meh');
      if (rb.braced && ra.hit === false && rb.hit === false) { /* both braced */ }
    }
    this.footA = Math.max(0, this.footA); this.footB = Math.max(0, this.footB);
    res.koA = this.footA <= 0; res.koB = this.footB <= 0;
    // simultaneous knockouts: the bigger hit wins; a dead tie keeps both on 1
    if (res.koA && res.koB) {
      if ((res.dmgB || 0) > (res.dmgA || 0)) { this.footA = 1; res.koA = false; }
      else if ((res.dmgA || 0) > (res.dmgB || 0)) { this.footB = 1; res.koB = false; }
      else { this.footA = this.footB = 1; res.koA = res.koB = false; g.ui.banner('DOUBLE DUNK... ALMOST', 'both cling on: one more tilt', 1.8, 'meh'); }
    }
    if (res.koA) { A.knockOverboard(new THREE.Vector3(-1, 0, 0)); this.stats.koBy = this.capB.name; }
    if (res.koB) { B.knockOverboard(new THREE.Vector3(1, 0, 0)); }
    if (res.koA || res.koB) { g.audio.play('whoosh'); g.audio.play('cheer', { delay: 0.6 }); }
    if (this.boss) { const f = this.footB / this.maxB; this.bossPhase = f <= 0.34 ? 3 : f <= 0.67 ? 2 : 1; }
    g.ui.pips(this.footA, this.maxA, this.footB, this.maxB);
    g.onPass?.(res);
    g.log?.push(`${t.toFixed(2)} pass tilt ${this.tilt}: lat ${lateral.toFixed(1)} A:${JSON.stringify(ra)} B:${JSON.stringify(rb)} foot ${this.footA}-${this.footB}${res.ram ? ' RAM' : ''}`);
    this.result = res;
  }
  attack(att, def, t) {
    const r = { hit: false, dmg: 0, late: false, high: false, charged: false, braced: false, gust: false, why: '' };
    // the defender must be on the attacker's left (lances cross the bow to port)
    const left = att.dir;                                // +X is left for the +Z charger
    const lateral = (def.x - att.x) * left;
    const ramEdge = (att.boat.beam + def.boat.beam) / 2 + TUNING.hitGap;
    if (att.stun > 0 && att.couch < 1) { r.why = 'stunned'; return r; }
    if (att.couch < 0.98) { r.why = 'lance not couched'; return r; }
    if (lateral < ramEdge) { r.why = lateral < 0 ? 'wrong side' : 'too close'; return r; }
    const reach = att.lance.reach + def.boat.beam * 0.12;
    if (lateral > reach) { r.why = 'out of reach'; return r; }
    const held = att.couchedAt >= 0 ? t - att.couchedAt : 0;
    r.late = held <= TUNING.late;
    const early = held > TUNING.early;
    r.high = att.captainY - def.captainY > TUNING.highGround;
    r.charged = att.charged;
    r.gust = att.gust > 0.6;
    let dmg = 1 + (r.late ? 1 : 0) + (r.high ? 1 : 0) + (r.gust ? 1 : 0) + att.lance.dmg;
    if (early && !r.charged) { dmg -= 1; def.braced = 1.2; if (dmg <= 0) { r.braced = true; r.why = 'couched too early: they braced'; return r; } }
    dmg = Math.min(dmg, 2);                       // a great hit is 2; only lightning does more
    if (r.charged) dmg = 3;
    // the bathtub is a small target: needs a solid hit
    r.hit = true; r.dmg = Math.min(dmg, 99);
    return r;
  }
  finish() {
    this.over = true; this.phase = 'done';
    this.winner = this.footB <= 0 ? 'A' : 'B';
    this.game.onMatchEnd?.(this);
  }
}
