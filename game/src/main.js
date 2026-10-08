import * as THREE from 'three';
import { ASSET } from '../assetlib.js';
import { Sea, Wake, makeOcean } from './ocean.js';
import { World } from './world.js';
import { Sprites, Shards, Rain, Bolts } from './fx.js';
import { Weather } from './weather.js';
import { Director } from './camera.js';
import { Audio } from './audio.js';
import { UI } from './ui.js';
import { Controls } from './input.js';
import { Yacht } from './yacht.js';
import { Match } from './match.js';
import { SEAS, SEA_ORDER, CAPTAINS, LADDER, BOATS, LANCES, BOAT_ORDER, LANCE_ORDER, TUNING } from './data.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);

// ---------------------------------------------------------------- save
const SAVE_KEY = 'stormtilt.v1';
const save = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } })();
save.cup ??= 0; save.beaten ??= {}; save.boats ??= { sloop_red: 1 }; save.lances ??= { lance_classic: 1 };
save.boat ??= 'sloop_red'; save.lance ??= 'lance_classic'; save.medals ??= {}; save.best ??= {}; save.endlessBest ??= 0; save.sound ??= 1;
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { } };

// ---------------------------------------------------------------- world
const world = new World($('c'));
const sea = new Sea();
const wake = new Wake(256);
const ocean = makeOcean(sea, wake.tex);
ocean.userData.mat.uniforms.uWakeRect.value.copy(wake.rect);
world.scene.add(ocean);
const fx = {
  spray: new Sprites(world.scene, 2200, false),
  sparks: new Sprites(world.scene, 500, true),
  wind: new Sprites(world.scene, 300, false),
  shards: new Shards(world.scene, 140),
  rain: new Rain(world.scene, 1400),
  bolts: new Bolts(world.scene),
};
const audio = new Audio(); audio.setOn(!!save.sound);
const ui = new UI();
const dir = new Director(world.camera);
const game = {
  scene: world.scene, sea, wake, fx, audio, ui, dir, world, t: 0, timeScale: 1,
  controls: new Controls($('stick'), $('knob'), $('couch'), true, false),
  controls2: new Controls($('stick2'), $('knob2'), $('couch2'), false, true),
};
game.weather = new Weather(game);
window.__game = game;
game.debugWx = Q.get('wx');
game.log = []; const LOG = (s) => { game.log.push(`${game.t.toFixed(2)} ${s}`); if (game.log.length > 200) game.log.shift(); };

// ---------------------------------------------------------------- assets
let BOATDIMS = {}, GALLEON = null, HAVE = null;
const has = (n) => !HAVE || HAVE.has(n);
window.__has = has;
const DEF_DIMS = { length: 12, beam: 3.9, keelToDeck: 2.25, captainZ: 2.6, waterlineY: 1.0, mastTopY: 16, bowZ: 6, sternZ: -6 };
async function loadJSON(u) { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } }
function dimsFor(id) {
  if (id === 'galleon_nimbus' && GALLEON) return { ...DEF_DIMS, ...GALLEON };
  return { ...DEF_DIMS, ...(BOATDIMS[id] || {}) };
}
function tintHull(obj, tint) {
  if (!tint) return obj;
  const target = new THREE.Color(0xd7372f), tc = new THREE.Color(tint), hsl = {}, thsl = {};
  target.getHSL(thsl);
  obj.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    o.material = mats.map((m) => {
      if (!m.color) return m;
      m.color.getHSL(hsl);
      const near = Math.abs(hsl.h - thsl.h) < 0.05 && hsl.s > 0.45 && hsl.l > 0.2 && hsl.l < 0.65;
      if (!near) return m;
      const c = m.clone(); c.color.copy(tc); return c;
    });
    if (o.material.length === 1) o.material = o.material[0];
  });
  return obj;
}
async function makeHull(boatId, tint) {
  if (!has(boatId)) return placeholderHull(dimsFor(boatId), tint);
  const m = await ASSET(`./assets/${boatId}.js`);
  if (!m.children.length) return placeholderHull(dimsFor(boatId), tint);
  return tintHull(m, tint);
}
const LANCE_INFO = {};
async function makeLance(id) {
  const m = has(id) ? await ASSET(`./assets/${id}.js`) : new THREE.Group();
  const g = new THREE.Group();
  if (!m.children.length) { g.add(placeholderLance()); LANCE_INFO[id] = { len: 5.5, grip: 0.6 }; return g; }
  // put the back end at z=0 and the shaft axis at y=0
  const box = new THREE.Box3().setFromObject(m);
  const info = (BOATDIMS.lances || {})[id] || {};
  const len = box.max.z - box.min.z;
  m.position.z -= box.min.z; m.position.y -= (box.min.y + box.max.y) / 2; m.position.x -= (box.min.x + box.max.x) / 2;
  g.add(m);
  LANCE_INFO[id] = { len, grip: info.gripZ !== undefined ? info.gripZ - (info.minZ ?? box.min.z) : len * 0.12 };
  return g;
}
async function makeCaptain(id) {
  if (!has('cap_' + id)) return placeholderCaptain(id);
  const m = await ASSET(`./assets/cap_${id}.js`, { keepHierarchy: true, height: id === 'nimbus' ? 2.6 : (id === 'pip' || id === 'gilly' ? 1.55 : 1.85) });
  if (!m.children.length) return placeholderCaptain(id);
  m.rotation.y = 0;
  return m;
}
async function makeShield() {
  if (!has('lifebuoy')) return null;
  const m = await ASSET('./assets/lifebuoy.js');
  if (!m.children.length) return null;
  const sz = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
  const k = 0.62 / Math.max(sz.x, sz.z);
  const g = new THREE.Group(); m.scale.setScalar(k); m.rotation.x = Math.PI / 2; m.position.y = -0.31; g.add(m); return g;
}
// --- dev placeholders, replaced by 404 assets as they land (never shipped)
function placeholderHull(d, tint) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(d.beam, 1.4, d.length), new THREE.MeshStandardMaterial({ color: tint || 0xd7372f, roughness: 0.3 }));
  hull.position.y = 1.2; g.add(hull);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 13), new THREE.MeshStandardMaterial({ color: 0xa8652f }));
  mast.position.set(0, 8, 0.5); g.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 10), new THREE.MeshStandardMaterial({ color: 0xf4ead2, side: THREE.DoubleSide }));
  sail.rotation.y = Math.PI / 2; sail.position.set(0, 8, -1.8); g.add(sail);
  return g;
}
function placeholderLance() {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 5.5, 8), new THREE.MeshStandardMaterial({ color: 0xf3eee3 })); s.rotation.x = Math.PI / 2; s.position.z = 2.75; g.add(s);
  const v = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9a043, side: THREE.DoubleSide })); v.rotation.x = -Math.PI / 2; v.position.z = 0.7; g.add(v);
  return g;
}
function placeholderCaptain(id) {
  const c = CAPTAINS[id] || CAPTAINS.player;
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: c.coat || 0x2a5bd7 })); body.position.y = 0.95; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshStandardMaterial({ color: 0xf1c7a0 })); head.position.y = 1.62; g.add(head);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12), new THREE.MeshStandardMaterial({ color: c.hat || 0xf2b630 })); hat.position.y = 1.82; g.add(hat);
  g.userData.joints = {};
  return g;
}

const yachtCache = {};
async function buildYacht(capId, boatId, lanceId, tint, d) {
  const [hull, captain, lanceModel, shield] = await Promise.all([makeHull(boatId, tint), makeCaptain(capId), makeLance(lanceId), makeShield()]);
  const li = LANCE_INFO[lanceId];
  return new Yacht(game, { boat: boatId, lance: lanceId, dims: dimsFor(boatId), dir: d, hull, captain, lanceModel, shield, lanceLen: li.len, gripZ: li.grip, capScale: capId === 'nimbus' ? 1.4 : 1 });
}

// ---------------------------------------------------------------- game hooks
game.rivalOf = (y) => (game.match ? (y === game.match.A ? game.match.B : game.match.A) : null);
game.strikeFx = (top, bottom) => {
  fx.bolts.strike(top, bottom); world.flash = 1; ocean.userData.mat.uniforms.uFlash.value = 1;
  audio.play('thunder', { vol: 1.2, delay: 0.05 });
  for (let i = 0; i < 30; i++) fx.sparks.emit(bottom.x, bottom.y, bottom.z, (Math.random() - 0.5) * 14, Math.random() * 10, (Math.random() - 0.5) * 14, { life: 0.5, size: 0.7, grow: 0.3, alpha: 1, drag: 2, grav: 4, color: new THREE.Color(0x9fe8ff) });
};
game.onStrike = (cell, boats) => {
  const inR = boats.filter((b) => !b.overboard && Math.hypot(b.x - cell.x, b.z - cell.z) < cell.r * b.lance.rod + b.boat.beam * 0.5);
  const up = inR.filter((b) => b.lanceUp).sort((a, b) => b.captainY - a.captainY);
  const h = sea.height(cell.x, cell.z);
  if (up.length) {
    const b = up[0]; b.charged = true; b.chargeT = 0; LOG(`strike: charged ${b === game.match?.A ? 'A' : 'B'}`);
    const tip = b.lanceTip(new THREE.Vector3());
    game.strikeFx(new THREE.Vector3(tip.x + 4, 70, tip.z + 6), tip);
    audio.play('zap', { vol: 1.1 });
    if (b === game.match?.A) ui.banner('CHARGED!', 'your lance caught the bolt: next hit knocks out', 1.6, 'charge');
    else ui.banner(`${game.match?.capB.name.toUpperCase()} IS CHARGED`, 'do not let that lance touch you', 1.5, 'bad');
  } else if (inR.length) {
    LOG(`strike: zapped ${inR.length}`);
    for (const b of inR) {
      b.stun = 1.3;
      const top = new THREE.Vector3(b.x, b.y + b.dims.mastTopY - b.dims.waterlineY, b.z);
      game.strikeFx(top.clone().setY(70), top);
      if (b === game.match?.A) ui.banner('ZAPPED!', 'couched under a storm cell: the bolt took your mast', 1.6, 'bad');
      else ui.banner('RIVAL ZAPPED!', 'they couched under the cell', 1.4, 'good');
    }
  } else {
    LOG(`strike: water (A ${Math.hypot(boats[0].x - cell.x, boats[0].z - cell.z).toFixed(1)} m)`);
    game.strikeFx(new THREE.Vector3(cell.x, 70, cell.z), new THREE.Vector3(cell.x, h, cell.z));
    wake.ring(cell.x, cell.z, 4, 0.9, 3);
  }
};
game.onTakeoff = (y) => { LOG(`takeoff ${y === game.match?.A ? 'A' : 'B'} vy ${y.vy.toFixed(1)}`); if (y === game.match?.A) { audio.play('whoosh', { vol: 0.8 }); } };
game.onLand = (y, impact) => {
  const p = new THREE.Vector3(y.x, sea.height(y.x, y.z), y.z);
  for (let i = 0; i < 40; i++) { const a = Math.random() * 6.283; fx.spray.emit(p.x + Math.cos(a) * 3, p.y + 0.3, p.z + Math.sin(a) * 4, Math.cos(a) * 7, 4 + Math.random() * 6, Math.sin(a) * 7, { life: 1.3, size: 2.4, grow: 2.4, alpha: 0.8, drag: 1, grav: 9 }); }
  wake.ring(p.x, p.z, 5, 1, 4); wake.blob(p.x, p.z, 6, 0.8);
  audio.play('splash', { vol: Math.min(1, impact / 10) });
  if (y === game.match?.A) dir.shake = 0.6;
};
game.onSplash = (p) => {
  for (let i = 0; i < 70; i++) { const a = Math.random() * 6.283, s = Math.random(); fx.spray.emit(p.x + Math.cos(a) * s, p.y + 0.5, p.z + Math.sin(a) * s, Math.cos(a) * 5 * s, 6 + Math.random() * 9, Math.sin(a) * 5 * s, { life: 1.6, size: 2.6, grow: 2.2, alpha: 0.85, drag: 0.6, grav: 11 }); }
  wake.ring(p.x, p.z, 3, 1, 4); wake.blob(p.x, p.z, 5, 1);
  audio.play('splash', { vol: 1.2 });
};
game.onSpout = (b) => { LOG('spout'); audio.play('whoosh', { vol: 1 }); if (b === game.match?.A) ui.banner('SPUN OUT!', 'the waterspout grabbed you', 1.3, 'bad'); };
game.wipe = (then) => {
  const w = $('wipe'); w.className = 'go'; audio.play('whoosh', { vol: 0.5 });
  setTimeout(() => { then(); dir.mode = 'crane'; game.craneT = 0; dir.update(0, ctxFor()); dir.snap(); }, 380);
  setTimeout(() => { w.className = ''; }, 900);
};

// ---------------------------------------------------------------- match control
let current = null;   // { mode, capB, sea, ... }
async function startMatch(cfg) {
  ui.screen(null); $('loading').textContent = '';
  if (game.match) { game.match.A.dispose(); game.match.B.dispose(); game.match = null; }
  const S = SEAS[cfg.sea];
  await world.applySea(cfg.sea, ocean);
  sea.setSwell(S.swell); sea.crests = [];
  fx.rain.amount = S.weather.rain;
  audio.bed(0.12 + S.weather.rain * 0.12, 500 + S.weather.rain * 400);
  const capB = CAPTAINS[cfg.capB];
  const boatA = cfg.boatA || save.boat, lanceA = cfg.lanceA || save.lance;
  const [A, B] = await Promise.all([
    buildYacht(cfg.capA || 'player', boatA, lanceA, cfg.tintA, 1),
    buildYacht(cfg.capB, cfg.boatB || capB.boat, cfg.lanceB || capB.lance, cfg.tintB ?? capB.tint, -1),
  ]);
  const m = new Match(game, { sea: cfg.sea, A, B, capA: cfg.capA || 'player', capB: cfg.capB, humanB: cfg.twoP, autoA: cfg.autoA, footA: cfg.footA, footB: cfg.footB });
  game.match = m; current = cfg;
  ui.names(cfg.twoP ? 'P1' : 'YOU', cfg.twoP ? 'P2' : capB.name.toUpperCase(), cfg.twoP ? '' : './img/cap_player.png', cfg.twoP ? '' : `./img/cap_${cfg.capB}.png`);
  $('hud').classList.remove('hidden'); $('p2').classList.toggle('hidden', !cfg.twoP);
  $('hud').classList.toggle('twop', !!cfg.twoP);
  m.begin();
  game.craneT = 0; dir.mode = 'crane'; dir.update(0, ctxFor()); dir.snap();
  const music = cfg.sea === 'eye' ? 'm_boss' : `m_${cfg.sea}`;
  audio.playMusic(music, 0.8);
  if (!cfg.twoP && !cfg.quiet) {
    ui.taunt(capB.intro, 2.6);
    if (capB.tip && !save.beaten[cfg.capB]) ui.hint(capB.tip, 6.5);
  }
  game.state = 'match';
}
game.onMatchEnd = (m) => {
  const cfg = current; const won = m.winner === 'A';
  if (cfg.attract) { if (game.state === 'attract') setTimeout(() => { if (game.state === 'attract') { game.state = 'title'; attract(); } }, 300); return; }
  game.state = 'result';
  const capB = CAPTAINS[cfg.capB];
  $('res-medals').innerHTML = ''; $('res-spoils').innerHTML = '';
  if (cfg.twoP) {
    $('res-title').textContent = won ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS';
    $('res-sub').textContent = `in ${m.tilt} tilts`;
    $('b-res-next').textContent = 'MENU';
  } else {
    $('res-title').textContent = won ? 'VICTORY' : 'OVERBOARD';
    $('res-sub').textContent = won ? `"${capB.lose}"  ${capB.name}` : `"${capB.win}"  ${capB.name}`;
    const medals = [];
    if (won && m.footA === m.maxA) medals.push(['UNSHAKEN', 'won without losing footing']);
    if (won && m.stats.charged) medals.push(['THUNDERSTRUCK', 'landed a charged lance']);
    if (won && m.stats.high) medals.push(['SKY KNIGHT', 'struck from high ground']);
    if (m.stats.late >= 2) medals.push(['NERVES OF STEEL', `${m.stats.late} late couches`]);
    const key = cfg.capB;
    save.medals[key] ??= {};
    for (const [n, d] of medals) { const isNew = !save.medals[key][n]; save.medals[key][n] = 1; const el = document.createElement('div'); el.className = 'medal' + (isNew ? ' new' : ''); el.innerHTML = `<b>${n}</b><small>${d}</small>`; $('res-medals').appendChild(el); }
    if (won) {
      const first = !save.beaten[key]; save.beaten[key] = 1;
      if (cfg.mode === 'cup') { const i = LADDER.indexOf(key); if (i >= save.cup) save.cup = i + 1; }
      const sp = capB.spoil || {};
      if (first && (sp.boat || sp.lance)) {
        const isBoat = !!sp.boat; const id = sp.boat || sp.lance;
        if (isBoat) save.boats[id] = 1; else save.lances[id] = 1;
        const nm = isBoat ? BOATS[id].name : LANCES[id].name;
        $('res-spoils').innerHTML = `<b>SPOILS</b> you won ${capB.name}'s ${isBoat ? 'yacht' : 'lance'}: <i>${nm}</i>. Equip it at THE DOCK.`;
      }
      if (cfg.mode === 'endless') { game.streak = (game.streak || 0) + 1; save.endlessBest = Math.max(save.endlessBest, game.streak); $('res-sub').textContent += `   streak ${game.streak}`; }
    } else if (cfg.mode === 'endless') {
      $('res-sub').textContent += `   streak ended at ${game.streak || 0} (best ${save.endlessBest})`; game.streak = 0;
    }
    persist();
    const cupDone = cfg.mode === 'cup' && won && LADDER.indexOf(key) === LADDER.length - 1;
    if (cupDone) { $('res-title').textContent = 'SQUALL CUP CHAMPION'; }
    $('b-res-next').textContent = cfg.mode === 'cup' ? (won ? (cupDone ? 'MENU' : 'NEXT RIVAL') : 'TRY AGAIN') : cfg.mode === 'endless' ? (won ? 'NEXT RIVAL' : 'MENU') : 'MENU';
  }
  audio.sting(won ? 'm_victory' : 'm_defeat', 0.9);
  setTimeout(() => { $('hud').classList.add('hidden'); ui.screen('result'); }, 600);
};
function nextCupRival() { return LADDER[Math.min(save.cup, LADDER.length - 1)]; }
function cupMatch(capB) { const c = CAPTAINS[capB]; showVS(capB, () => startMatch({ mode: 'cup', capB, sea: c.sea })); }
function showVS(capB, then) {
  const c = CAPTAINS[capB];
  $('vs-img-a').src = './img/cap_player.png'; $('vs-img-b').src = `./img/cap_${capB}.png`;
  $('vs-name-a').textContent = 'YOU'; $('vs-name-b').innerHTML = `${c.name}<small>${c.title}</small>`;
  $('vs-line').textContent = `"${c.intro}"`; $('vs-sea').textContent = `${SEAS[c.sea].name}: ${SEAS[c.sea].blurb}`;
  $('vs-tip').textContent = c.tip || '';
  ui.screen('vs'); audio.play('horn', { vol: 0.7 });
  setTimeout(then, Q.has('fast') ? 50 : 1700);
}

// attract mode behind the title: two AI captains joust
async function attract() {
  if (game.state !== 'title' && game.state !== 'boot' && game.state !== 'result') return;
  await startMatch({ mode: 'attract', attract: true, quiet: true, capA: 'player', capB: LADDER[Math.floor(Math.random() * 6)], sea: SEA_ORDER[Math.floor(Math.random() * 4)], autoA: CAPTAINS.brisa.ai });
  $('hud').classList.add('hidden'); game.state = 'attract'; ui.screen('title');
}

// ---------------------------------------------------------------- screens
function go(fn) { return (e) => { e.preventDefault?.(); audio.unlock(); preloadAudio(); fn(); }; }
let audioLoaded = false;
function preloadAudio() {
  if (audioLoaded) return; audioLoaded = true;
  for (const n of ['crack', 'thud', 'splash', 'thunder', 'zap', 'horn', 'whoosh', 'cheer', 'bonk', 'gull', 'wave', 's_hit', 's_charge', 's_comic', 'm_victory', 'm_defeat']) audio.load(n);
}
$('startb').addEventListener('click', go(() => cupMatch(nextCupRival())));
$('b-quick').addEventListener('click', go(() => openLadder('quick')));
$('b-endless').addEventListener('click', go(() => { game.streak = 0; endlessNext(); }));
$('b-2p').addEventListener('click', go(() => startMatch({ mode: '2p', twoP: true, capA: 'player', capB: 'pip', sea: SEA_ORDER[Math.floor(Math.random() * 4)], tintB: 0x2a5bd7, boatB: 'sloop_red', lanceB: 'lance_classic', footB: 3 })));
$('b-dock').addEventListener('click', go(openDock));
$('b-ladder-back').addEventListener('click', go(toTitle));
$('b-res-again').addEventListener('click', go(() => startMatch(current)));
$('b-res-next').addEventListener('click', go(() => {
  const cfg = current;
  if (cfg.mode === 'cup') { const i = LADDER.indexOf(cfg.capB); const won = game.match?.winner === 'A'; if (won && i === LADDER.length - 1) return toTitle(); return cupMatch(won ? nextCupRival() : cfg.capB); }
  if (cfg.mode === 'endless' && game.streak > 0) return endlessNext();
  toTitle();
}));
$('b-pause').addEventListener('click', go(() => { if (game.state !== 'match') return; game.paused = true; ui.screen('pause'); }));
$('b-resume').addEventListener('click', go(() => { game.paused = false; ui.screen(null); }));
$('b-quit').addEventListener('click', go(() => { game.paused = false; toTitle(); }));
$('b-sound').addEventListener('click', go(() => { save.sound = save.sound ? 0 : 1; audio.setOn(!!save.sound); $('b-sound').textContent = `SOUND: ${save.sound ? 'ON' : 'OFF'}`; persist(); }));
$('b-dock-done').addEventListener('click', go(toTitle));
function endlessNext() {
  const pool = LADDER.slice(0, 7); const capB = pool[Math.floor(Math.random() * pool.length)];
  const s = SEA_ORDER[Math.floor(Math.random() * 4)];
  const foot = game.match && game.streak ? Math.min(3, game.match.footA + 1) : 3;
  showVS(capB, () => startMatch({ mode: 'endless', capB, sea: s, footA: foot }));
}
function toTitle() {
  game.state = 'title'; $('hud').classList.add('hidden'); ui.screen('title'); audio.playMusic('m_title', 0.7);
  attract();
}
function openLadder(mode) {
  const list = $('ladder-list'); list.innerHTML = '';
  LADDER.forEach((id, i) => {
    const c = CAPTAINS[id]; const open = i <= save.cup;
    const b = document.createElement('button'); b.className = 'rung' + (open ? '' : ' locked') + (save.beaten[id] ? ' beaten' : '');
    b.innerHTML = `<img src="./img/cap_${id}.png" alt=""><span><b>${open ? c.name : '???'}</b><small>${open ? c.title + ' . ' + SEAS[c.sea].name : 'beat the captain above'}</small></span>`;
    if (open) b.addEventListener('click', go(() => showVS(id, () => startMatch({ mode: 'quick', capB: id, sea: c.sea }))));
    list.appendChild(b);
  });
  ui.screen('ladder');
}
function openDock() {
  const pb = $('pick-boat'), pl = $('pick-lance'); pb.innerHTML = ''; pl.innerHTML = '';
  const mk = (el, ids, table, owned, cur, set) => ids.forEach((id) => {
    const b = document.createElement('button'); const have = !!owned[id];
    b.className = 'opt' + (cur === id ? ' sel' : '') + (have ? '' : ' locked');
    b.innerHTML = `<b>${have ? table[id].name : 'LOCKED'}</b><small>${have ? table[id].desc : 'win it from a rival'}</small>`;
    if (have) b.addEventListener('click', go(() => { set(id); persist(); openDock(); }));
    el.appendChild(b);
  });
  mk(pb, BOAT_ORDER, BOATS, save.boats, save.boat, (id) => (save.boat = id));
  mk(pl, LANCE_ORDER, LANCES, save.lances, save.lance, (id) => (save.lance = id));
  ui.screen('dock');
}

// ---------------------------------------------------------------- loop
function ctxFor() {
  const m = game.match;
  const c = { me: m?.A, foe: m?.B, ttp: m ? m.ttp() : 9, mode: 'chase', seaH: (x, z) => sea.height(x, z), time: game.t, craneT: game.craneT };
  if (!m) { c.mode = 'title'; return c; }
  if (current?.twoP) { c.mode = 'broadcast'; return c; }
  if (m.phase === 'intro') { c.mode = game.craneT < 1.7 ? 'crane' : 'chase'; }
  else if (m.phase === 'pass') c.mode = 'pass';
  else if (m.phase === 'after' || m.phase === 'done' || m.phase === 'wiping') {
    const r = m.result || {};
    const subj = r.koA ? m.A.capRoot : r.koB ? m.B.capRoot : (r.dmgA > (r.dmgB || 0) ? m.A.capRoot : m.B.capRoot);
    c.mode = 'follow'; c.subject = subj.getWorldPosition(new THREE.Vector3());
    c.followDist = r.koA || r.koB ? 13 : 16;
    c.followDir = new THREE.Vector3(-0.7, 0.42, -0.58).normalize();
  }
  return c;
}
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0, fps = 60;
const tmpV = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  const realDt = Math.min(clock.getDelta(), 0.1);
  fpsAcc += realDt; fpsN++; if (fpsAcc > 0.5) { fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  const m = game.match;
  // slow motion at the pass
  let ts = 1;
  if (m && m.phase === 'pass') ts = m.pt < 0.6 ? 0.22 : 0.6;
  if (game.paused) ts = 0;
  const dt = realDt * ts;
  game.t += dt; sea.t = game.t; game.craneT = (game.craneT || 0) + dt;
  sea.prune(game.t);
  ocean.userData.mat.userData.sync(game.t);
  const ou = ocean.userData.mat.uniforms;
  ou.uFlash.value = Math.max(0, ou.uFlash.value - realDt * 3);
  const gu = ou.uGust.value; for (let i = 0; i < 4; i++) { const g = game.weather.gusts[i]; if (g) gu[i].set(g.x, g.hw, g.z0, g.z1); else gu[i].set(0, 0, 0, 0); }
  let ttp = 9;
  if (m && !m.over && !game.paused) { const r = m.update(dt, game.t); ttp = r?.ttp ?? 9; }
  else if (m && m.over) { m.A.update(dt, game.t, { steer: 0, couch: false }, sea, fx, wake); m.B.update(dt, game.t, { steer: 0, couch: false }, sea, fx, wake); }
  if (m) game.weather.update(dt, game.t, [m.A, m.B], fx);
  world.update(dt, game.t, sea);
  const seaH = (x, z) => sea.height(x, z);
  fx.spray.step(dt, seaH); fx.sparks.step(dt); fx.wind.step(dt); fx.shards.step(dt, seaH); fx.bolts.step(realDt);
  wake.step(dt);
  const ctx = ctxFor();
  dir.update(realDt * (ts === 0 ? 0 : 1), ctx);
  fx.rain.step(dt, world.camera);
  fx.spray.mat.uniforms.uScale.value = innerHeight * world.dpr * 0.5 / Math.tan(THREE.MathUtils.degToRad(world.camera.fov / 2));
  fx.sparks.mat.uniforms.uScale.value = fx.spray.mat.uniforms.uScale.value; fx.wind.mat.uniforms.uScale.value = fx.spray.mat.uniforms.uScale.value;
  world.aimShadow(m ? tmpV.set((m.A.x + m.B.x) / 2, 0, Math.max(-60, Math.min(60, m.A.z + 14))) : tmpV.set(0, 0, 0));
  // HUD: timing ring and pass gauge for the human
  if (m && game.state === 'match' && !current?.twoP && (m.phase === 'charge' || m.phase === 'intro')) {
    const A = m.A, B = m.B;
    const p = B.worldOfCaptain(tmpV).project(world.camera);
    const sx = (p.x * 0.5 + 0.5) * innerWidth, sy = (-p.y * 0.5 + 0.5) * innerHeight;
    const startAt = 0.22 + A.lance.couch;     // start holding this long before the pass
    const k = (ttp - startAt) / 1.6;
    const state = A.couch >= 1 ? 'locked' : (Math.abs(ttp - startAt) < 0.18 ? 'now' : k < 0 ? 'late' : '');
    ui.timing(sx, sy, ttp < 3.2 && p.z < 1 ? k : null, state);
    const lat = (B.x + B.vx * Math.min(ttp, 2)) - (A.x + A.vx * Math.min(ttp, 2));
    const ramEdge = (A.boat.beam + B.boat.beam) / 2 + TUNING.hitGap;
    ui.gauge(lat, ramEdge, A.lance.reach + B.boat.beam * 0.12, B.lance.reach + A.boat.beam * 0.12, ttp < 5.5 && ttp > 0);
  } else { ui.timing(0, 0, null, ''); ui.gauge(0, 0, 0, 0, false); }
  ui.update(realDt);
  world.renderer.render(world.scene, world.camera);
  const info = world.renderer.info.render;
  window.__GAME__ = {
    pos: m ? [m.A.x, m.A.z] : [0, 0], fps, speed: m ? m.A.speed : 0, score: m ? m.stats.hits : 0, over: !!m?.over,
    draws: info.calls, tris: info.triangles, state: game.state, phase: m?.phase, tilt: m?.tilt, footA: m?.footA, footB: m?.footB, ttp,
    air: m?.A.air, charged: m?.A.charged, couch: m?.A.couch,
  };
}

// ---------------------------------------------------------------- boot
addEventListener('resize', () => { world.resize(); dir.baseFov = world.camera.fov; });
world.resize(); dir.baseFov = world.camera.fov;
document.addEventListener('contextmenu', (e) => e.preventDefault());
(async () => {
  game.state = 'boot';
  const art = new Image(); art.src = './img/title.jpg'; art.onload = () => { $('title-art').style.backgroundImage = 'url(./img/title.jpg)'; $('title').classList.add('art-on'); };
  let alist, slist;
  [BOATDIMS, GALLEON, alist, slist] = await Promise.all([loadJSON('./assets/boats.json'), loadJSON('./assets/galleon.json'), loadJSON('./audio/list.json'), loadJSON('./assets/list.json')]);
  if (alist) audio.have = new Set(alist);
  if (slist) HAVE = new Set(slist);
  BOATDIMS ||= {};
  requestAnimationFrame(frame);
  game.state = 'title';
  await attract();
  $('loading').textContent = '';
  $('b-sound').textContent = `SOUND: ${save.sound ? 'ON' : 'OFF'}`;
  window.__READY__ = true;
  window.__START__ = () => cupMatch(nextCupRival());
  if (Q.has('go')) cupMatch(Q.get('go') || nextCupRival());
})();
