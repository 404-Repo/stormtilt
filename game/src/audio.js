const ALIAS = {
  crack: 'sfx_lance_crack', thud: 'sfx_body_thud', splash: 'sfx_splash', thunder: 'sfx_thunder', zap: 'sfx_charge', horn: 'sfx_horn',
  whoosh: 'sfx_wind_gust', cheer: 'sfx_crowd_cheer', bonk: 'sfx_bonk', gull: 'sfx_gull', wave: 'sfx_wave_crash', flap: 'sfx_sail_flap',
  m_title: 'music_title', m_regatta: 'music_regatta', m_thunder: 'music_thunder', m_gale: 'music_gale', m_rogue: 'music_rogue', m_boss: 'music_boss',
  m_victory: 'sting_victory', m_defeat: 'sting_defeat', s_hit: 'sting_hit', s_start: 'sting_start', s_charge: 'sting_charge', s_comic: 'sting_comic',
};
const file = (n) => ALIAS[n] || n;
// Audio: WebAudio buffers for music and effects, with a crossfading music bus and synthesized fallbacks.
export class Audio {
  constructor() {
    this.ctx = null; this.buf = new Map(); this.on = true; this.music = null; this.musicName = '';
    this.wanted = [];
  }
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    this.ctx = new C();
    this.master = this.ctx.createGain(); this.master.gain.value = this.on ? 0.9 : 0; this.master.connect(this.ctx.destination);
    this.mBus = this.ctx.createGain(); this.mBus.gain.value = 0.55; this.mBus.connect(this.master);
    this.sBus = this.ctx.createGain(); this.sBus.gain.value = 0.9; this.sBus.connect(this.master);
    // wind/sea bed: filtered noise
    const n = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate); const d = n.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { last = last * 0.985 + (Math.random() * 2 - 1) * 0.015; d[i] = last * 6; }
    this.noise = n;
    const src = this.ctx.createBufferSource(); src.buffer = n; src.loop = true;
    this.bedF = this.ctx.createBiquadFilter(); this.bedF.type = 'lowpass'; this.bedF.frequency.value = 600;
    this.bedG = this.ctx.createGain(); this.bedG.gain.value = 0.18;
    src.connect(this.bedF).connect(this.bedG).connect(this.sBus); src.start();
    for (const w of this.wanted) this.load(w);
  }
  setOn(on) { this.on = on; if (this.master) this.master.gain.value = on ? 0.9 : 0; }
  async load(name) {
    if (!this.ctx) { this.wanted.push(name); return; }
    if (this.buf.has(name)) return;
    this.buf.set(name, null);
    try {
      const r = await fetch(`./audio/${file(name)}.mp3`); if (!r.ok) return;
      const a = await r.arrayBuffer(); this.buf.set(name, await this.ctx.decodeAudioData(a));
    } catch (e) { /* missing file: synth fallback */ }
  }
  play(name, o = {}) {
    if (!this.ctx || !this.on) return;
    const b = this.buf.get(name);
    if (!b) { this.synth(name, o); return; }
    const s = this.ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = (o.rate || 1) * (1 + (Math.random() - 0.5) * (o.vary ?? 0.08));
    const g = this.ctx.createGain(); g.gain.value = o.vol ?? 1;
    s.connect(g).connect(this.sBus); s.start(this.ctx.currentTime + (o.delay || 0));
  }
  synth(name, o = {}) {
    const c = this.ctx, t = c.currentTime + (o.delay || 0);
    const g = c.createGain(); g.connect(this.sBus);
    const noiseHit = (dur, f0, f1, vol, type = 'bandpass') => {
      const s = c.createBufferSource(); s.buffer = this.noise; const f = c.createBiquadFilter(); f.type = type;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      const gg = c.createGain(); gg.gain.setValueAtTime(vol, t); gg.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(f).connect(gg).connect(this.sBus); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    };
    const tone = (dur, f0, f1, vol, type = 'sine') => {
      const o2 = c.createOscillator(); o2.type = type; o2.frequency.setValueAtTime(f0, t); o2.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      const gg = c.createGain(); gg.gain.setValueAtTime(vol, t); gg.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o2.connect(gg).connect(this.sBus); o2.start(t); o2.stop(t + dur + 0.05);
    };
    switch (name) {
      case 'crack': noiseHit(0.25, 3000, 600, 1.2); tone(0.2, 180, 60, 0.8, 'triangle'); break;
      case 'thud': tone(0.3, 120, 40, 1.0); noiseHit(0.15, 800, 200, 0.6, 'lowpass'); break;
      case 'splash': noiseHit(0.9, 1500, 200, 1.0, 'lowpass'); break;
      case 'thunder': noiseHit(2.2, 400, 40, 1.4, 'lowpass'); break;
      case 'zap': tone(0.4, 1800, 300, 0.35, 'sawtooth'); noiseHit(0.3, 5000, 2000, 0.5); break;
      case 'horn': tone(1.1, 196, 190, 0.5, 'sawtooth'); tone(1.1, 294, 290, 0.3, 'sawtooth'); break;
      case 'whoosh': noiseHit(0.6, 600, 2400, 0.5); break;
      case 'tick': tone(0.06, 1400, 1300, 0.25, 'square'); break;
      case 'couch': noiseHit(0.18, 2000, 900, 0.35); break;
      case 'cheer': noiseHit(1.4, 1200, 900, 0.5); break;
      case 'bonk': tone(0.25, 520, 160, 0.6, 'triangle'); break;
      default: tone(0.1, 600, 400, 0.2);
    }
  }
  sting(name, vol = 1) {
    if (!this.ctx) return;
    this.stopMusic();
    const go = () => { const b = this.buf.get(name); if (!b) return; const s = this.ctx.createBufferSource(); s.buffer = b; const g = this.ctx.createGain(); g.gain.value = vol; s.connect(g).connect(this.mBus); s.start(); };
    if (this.buf.get(name)) go(); else this.load(name).then(go);
  }
  playMusic(name, vol = 1) {
    if (!this.ctx || this.musicName === name) return;
    this.musicName = name;
    const old = this.music; const now = this.ctx.currentTime;
    if (old) { old.g.gain.setTargetAtTime(0, now, 0.4); setTimeout(() => { try { old.s.stop(); } catch (e) { } }, 2500); }
    this.music = null;
    const start = () => {
      if (this.musicName !== name) return;
      const b = this.buf.get(name); if (!b) return;
      const s = this.ctx.createBufferSource(); s.buffer = b; s.loop = true;
      const g = this.ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.5);
      s.connect(g).connect(this.mBus); s.start(); this.music = { s, g };
    };
    if (this.buf.get(name)) start(); else this.load(name).then(start);
  }
  stopMusic() { this.musicName = ''; if (this.music) { const m = this.music; m.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); setTimeout(() => { try { m.s.stop(); } catch (e) { } }, 1500); this.music = null; } }
  bed(level, bright = 600) { if (!this.ctx) return; this.bedG.gain.setTargetAtTime(level, this.ctx.currentTime, 0.4); this.bedF.frequency.setTargetAtTime(bright, this.ctx.currentTime, 0.4); }
}
