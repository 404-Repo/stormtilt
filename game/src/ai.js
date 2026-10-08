// AI captains. Each tilt the captain makes a plan from its personality: a passing line, which weather to chase,
// when to couch. Then it steers like a player would: one stick, one couch button, with reaction lag.
import { TUNING } from './data.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export class CaptainAI {
  constructor(game, me, foe, p, level = 1) {
    this.game = game; this.me = me; this.foe = foe; this.p = p; this.level = level;
    this.input = { steer: 0, couch: false };
    this.seen = { x: foe.x, vx: 0 }; this.lagT = 0;
  }
  planTilt(t, tp) {
    const p = this.p, me = this.me, foe = this.foe;
    const ramEdge = (me.boat.beam + foe.boat.beam) / 2 + TUNING.hitGap;
    let line = p.line;
    // rammers ram only when heavier
    this.wantRam = p.ram > 0 && Math.random() < p.ram && me.boat.mass > foe.boat.mass;
    // aim inside our reach and, if we can, outside theirs
    const myReach = me.lance.reach, theirReach = foe.lance.reach;
    let d = ramEdge + 0.6 + line * (myReach - ramEdge - 0.9);
    if (myReach > theirReach + 0.6 && line > 0.7) d = Math.min(myReach - 0.35, theirReach + 0.5);
    if (this.wantRam) d = ramEdge - 1.3;
    this.d = d;
    this.lead = Math.max(0.12, p.lead + gauss() * p.jitter);   // seconds before the pass it wants the lance fully down
    this.feintAt = p.feint > 0 && Math.random() < p.feint ? t + tp - rnd(0.9, 1.4) : -1;
    this.feintOff = (Math.random() < 0.5 ? -1 : 1) * rnd(3.5, 5);
    this.chase = null;
    // weather wishes: the nearest juicy thing on our side of the lane
    const W = this.game.weather, sea = this.game.sea;
    let best = 0;
    for (const c of W.cells) {
      const want = p.bolt * (0.6 + Math.random() * 0.6);
      if (want > best && Math.abs(c.x - me.x) < 18) { best = want; this.chase = { kind: 'cell', c }; }
    }
    for (const cr of sea.crests) {
      if (cr.born < t - 0.1) continue;
      const want = p.roller * (0.6 + Math.random() * 0.6) * (cr.rogue ? 1.4 : 1);
      if (want > best && want > 0.35) { best = want; this.chase = { kind: 'crest', cr }; }
    }
    for (const g of W.gusts) {
      const want = p.gust * (0.5 + Math.random() * 0.6);
      if (want > best && want > 0.4 && Math.abs(g.x - me.x) < 16) { best = want; this.chase = { kind: 'gust', g }; }
    }
    this.lineNoise = gauss() * (1.4 - p.steer) * 2.2;
    // say what it is going for: the player should see the race for the weather
    const ui = this.game.ui, human = !this.game.match?.cfg?.autoA && this.me === this.game.match?.B;
    if (human && ui && Math.random() < 0.7) {
      const k = this.wantRam ? 'ram' : this.chase?.kind;
      const lines = { ram: ['RAMMING SPEED!', 'Brace yerself!'], cell: ['That bolt is MINE!', 'Lightning, come to papa!', 'I call the thunder!'], crest: ['Watch me fly!', 'Surf\'s up!', 'Catching that wave!'], gust: ['Feel the wind!', 'Riding the gust!'] }[k];
      if (lines) setTimeout(() => ui.taunt(lines[Math.floor(Math.random() * lines.length)], 1.8), 1900);
    }
  }
  update(dt, t, ttp) {
    const p = this.p, me = this.me, foe = this.foe;
    // perception with lag
    this.lagT -= dt;
    if (this.lagT <= 0) { this.seen.x = foe.x; this.seen.vx = foe.vx; this.lagT = p.react * 0.5; }
    // where will the foe be at the pass?
    const look = Math.min(ttp, 1.6) * (0.35 + 0.5 * p.steer);
    const foeX = this.seen.x + this.seen.vx * look;
    // our side: the foe must be on our left. Our left is -X when we head -Z (dir -1) and +X when we head +Z.
    const side = me.dir > 0 ? 1 : -1;
    let tx = foeX - side * (this.d + this.lineNoise);
    if (this.feintAt > 0 && t < this.feintAt) tx += this.feintOff;
    // weather chasing before the decisive moment
    if (this.chase && ttp > 1.1) {
      if (this.chase.kind === 'cell') {
        const c = this.chase.c; if (c.struck === 0 && t < c.strikeAt + 0.2) tx = c.x + (me.x > c.x ? 1 : -1) * 0.8;
      } else if (this.chase.kind === 'crest') {
        const cr = this.chase.cr; const age = t - cr.born;
        // the x where the crest line will cross our z soon: walk along the crest tangent from its centre
        const cx = cr.ox + cr.nx * cr.c * age, cz = cr.oz + cr.nz * cr.c * age;
        const tzx = -cr.nz, tzz = cr.nx;           // tangent
        const s = Math.abs(tzz) > 0.05 ? (me.z - cz) / tzz : 0;
        const ix = cx + tzx * s;
        if (Math.abs(s) < cr.half) tx = ix; else tx = cx;
      } else if (this.chase.kind === 'gust') {
        tx = this.chase.g.x;
      }
    }
    // dodge: the foe is airborne and about to strike from above: slip out of their reach
    if (p.dodge > 0 && foe.air && ttp < 0.9 && ttp > 0.1 && Math.random() < p.dodge * dt * 6) {
      tx = foeX - side * (foe.lance.reach + 1.2); this.dodging = 0.8;
    }
    if (this.dodging > 0) { this.dodging -= dt; tx = foeX - side * (foe.lance.reach + 1.2); }
    tx = Math.max(-TUNING.laneHalf + 2, Math.min(TUNING.laneHalf - 2, tx));
    // stick: proportional with a dead zone, as a thumb would
    const err = -(tx - me.x) * me.dir;   // +steer = starboard: toward -X when heading +Z
    let s = Math.max(-1, Math.min(1, err / 4.5));
    if (Math.abs(err) < 0.4) s = 0;
    this.input.steer += (s - this.input.steer) * Math.min(1, dt * (6 + 6 * p.steer));
    // couch: start lowering so the lance is fully down at couchDone; keep it up under a live cell
    let couch = ttp <= this.lead + me.lance.couch && ttp > -0.3;
    if (this.chase && this.chase.kind === 'cell' && this.chase.c.struck === 0 && t < this.chase.c.strikeAt + 0.05) {
      const c = this.chase.c; if (Math.hypot(me.x - c.x, me.z - c.z) < c.r * me.lance.rod + 2) couch = couch && ttp < 0.4;
    }
    this.input.couch = couch;
    return this.input;
  }
}
