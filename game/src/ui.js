// HUD and screens (DOM).
const $ = (id) => document.getElementById(id);

export class UI {
  constructor() {
    this.el = { banner: $('banner'), sub: $('sub'), taunt: $('taunt'), hint: $('hint'), tiltno: $('tiltno') };
    this.bannerT = 0; this.tauntT = 0; this.hintT = 0;
    this.ring = document.createElement('div'); this.ring.id = 'ring'; this.ring.innerHTML = '<i></i><b></b>';
    $('hud').appendChild(this.ring);
  }
  show(id, on = true) { $(id).classList.toggle('hidden', !on); }
  screen(id) {
    for (const s of ['title', 'ladder', 'vs', 'dock', 'result', 'pause']) $(s).classList.toggle('hidden', s !== id);
  }
  names(a, b, faceA, faceB) {
    $('name-a').textContent = a; $('name-b').textContent = b;
    $('face-a').style.backgroundImage = faceA ? `url(${faceA})` : ''; $('face-b').style.backgroundImage = faceB ? `url(${faceB})` : '';
  }
  pips(a, ma, b, mb) {
    const draw = (el, n, m) => { el.innerHTML = ''; el.classList.toggle('many', m > 5); for (let i = 0; i < m; i++) { const d = document.createElement('i'); if (i >= n) d.className = 'lost'; el.appendChild(d); } };
    draw($('pips-a'), a, ma); draw($('pips-b'), b, mb);
  }
  tiltNo(n) { const sc = Number(this.el.tiltno.dataset.score || 0); this.el.tiltno.innerHTML = `TILT ${n}${sc ? `<i>${sc.toLocaleString('en-US')}</i>` : ''}`; }
  scorePop(pts, combo) {
    const t = this.el.tiltno; t.dataset.score = (Number(t.dataset.score || 0) + pts);
    t.innerHTML = `${t.textContent.split(' ').slice(0, 2).join(' ')}<i>${Number(t.dataset.score).toLocaleString('en-US')}${combo > 1 ? ' x' + combo : ''}</i>`;
    t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop');
  }
  resetScore() { this.el.tiltno.dataset.score = 0; }
  banner(text, sub = '', dur = 1.4, kind = '') {
    const b = this.el.banner; b.textContent = text; b.className = 'show ' + kind + (text.length > 13 ? ' long' : '');
    this.el.sub.textContent = sub; this.el.sub.className = sub ? 'show' : '';
    this.el.sub.style.top = (b.offsetTop + b.offsetHeight + 4) + 'px';
    this.bannerT = dur;
    void b.offsetWidth; b.classList.add('pop');
  }
  taunt(text, dur = 2.2) {
    if (this.hintT > 0.3) return;   // one callout at a time
    const t = this.el.taunt; t.textContent = text; t.className = 'show'; this.tauntT = dur;
  }
  hint(text, dur = 3) { const h = this.el.hint; h.textContent = text; h.className = text ? 'show' : ''; this.hintT = dur; }
  update(dt) {
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) { this.el.banner.className = ''; this.el.sub.className = ''; } }
    if (this.tauntT > 0) { this.tauntT -= dt; if (this.tauntT <= 0) this.el.taunt.className = ''; }
    if (this.hintT > 0) { this.hintT -= dt; if (this.hintT <= 0) this.el.hint.className = ''; }
  }
  // the couch timing ring around the rival: it closes to the inner circle at the moment to start holding
  timing(x, y, k, state) {
    const r = this.ring;
    if (k === null) { r.style.display = 'none'; return; }
    r.style.display = 'block';
    r.style.transform = `translate(${x}px, ${y}px)`;
    const s = 1 + Math.max(0, k) * 2.4;
    r.firstChild.style.transform = `translate(-50%,-50%) scale(${s})`;
    r.className = state;
  }
  gauge(myLat, ramEdge, myReach, theirReach, show) {
    const g = $('gauge'); g.style.opacity = show ? 1 : 0;
    if (!show) return;
    // scale 0..12 m across the gauge
    const W = 12, pct = (v) => `${Math.max(0, Math.min(100, (v / W) * 100))}%`;
    g.querySelector('.ram').style.width = pct(ramEdge);
    const hit = $('g-hit'); hit.style.left = pct(ramEdge); hit.style.width = pct(Math.max(0, myReach - ramEdge));
    g.querySelector('.miss').style.left = pct(myReach);
    $('g-me').style.left = pct(myLat);
    $('g-them').style.left = pct(theirReach);
  }
}
