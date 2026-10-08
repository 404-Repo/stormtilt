// Touch controls: a horizontal steer pad (drag anywhere on it, the knob follows) and a hold-to-couch button.
// Multi-touch safe: each control tracks its own pointer id. Keyboard for laptops: A/D or arrows, Space to couch.
export class Controls {
  constructor(stickEl, knobEl, couchEl, keys = true, flip = false) {
    this.steer = 0; this.couch = false; this.flip = flip;
    this.stickEl = stickEl; this.knob = knobEl; this.couchEl = couchEl;
    this.sid = null; this.cid = null; this.x0 = 0; this.k = { l: false, r: false, c: false };
    const rangePx = () => Math.max(50, stickEl.clientWidth * 0.32);
    const sdown = (e) => {
      if (this.sid !== null) return; this.sid = e.pointerId; stickEl.setPointerCapture?.(e.pointerId);
      const r = stickEl.getBoundingClientRect(); this.x0 = r.left + r.width / 2; this.move(e, rangePx()); e.preventDefault();
    };
    const smove = (e) => { if (e.pointerId === this.sid) { this.move(e, rangePx()); e.preventDefault(); } };
    const sup = (e) => { if (e.pointerId === this.sid) { this.sid = null; this.touchSteer = 0; this.paint(); } };
    stickEl.addEventListener('pointerdown', sdown); stickEl.addEventListener('pointermove', smove);
    stickEl.addEventListener('pointerup', sup); stickEl.addEventListener('pointercancel', sup); stickEl.addEventListener('lostpointercapture', sup);
    const cdown = (e) => { this.cid = e.pointerId; couchEl.setPointerCapture?.(e.pointerId); this.touchCouch = true; couchEl.classList.add('on'); e.preventDefault(); };
    const cup = (e) => { if (e.pointerId === this.cid) { this.cid = null; this.touchCouch = false; couchEl.classList.remove('on'); } };
    couchEl.addEventListener('pointerdown', cdown); couchEl.addEventListener('pointerup', cup); couchEl.addEventListener('pointercancel', cup); couchEl.addEventListener('lostpointercapture', cup);
    this.touchSteer = 0; this.touchCouch = false;
    if (keys) {
      const set = (e, v) => {
        const c = e.code;
        if (c === 'ArrowLeft' || c === 'KeyA') this.k.l = v;
        else if (c === 'ArrowRight' || c === 'KeyD') this.k.r = v;
        else if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') this.k.c = v;
        else return;
        e.preventDefault();
      };
      addEventListener('keydown', (e) => set(e, true)); addEventListener('keyup', (e) => set(e, false));
    }
  }
  move(e, range) {
    let d = (e.clientX - this.x0) / range; if (this.flip) d = -d;
    this.touchSteer = Math.max(-1, Math.min(1, d)); this.paint();
  }
  paint() { if (this.knob) this.knob.style.transform = `translateX(${(this.flip ? -1 : 1) * this.touchSteer * 38}%)`; }
  read() {
    const ks = (this.k.r ? 1 : 0) - (this.k.l ? 1 : 0);
    this.steer = Math.abs(this.touchSteer) > 0.02 ? this.touchSteer : ks;
    this.couch = this.touchCouch || this.k.c;
    return { steer: this.steer, couch: this.couch };
  }
  reset() { this.sid = null; this.cid = null; this.touchSteer = 0; this.touchCouch = false; this.couchEl.classList.remove('on'); this.paint(); }
}
