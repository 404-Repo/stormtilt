// Seas, captains, yachts and lances. All tuning lives here.

export const SEAS = {
  regatta: {
    name: 'Regatta Bay', blurb: 'golden afternoon, a squall coming in',
    sky: { top: 0x4a5a8c, hor: 0xffc27a, haze: 0xe0b48c }, skyTex: 'sky_regatta.jpg',
    sun: { dir: [-0.55, 0.32, 0.75], col: 0xffd09a, int: 3.2 }, hemi: [0x9ec9ff, 0x3c6b6b, 1.15],
    water: { deep: 0x07463f, shallow: 0x22a88a, foam: 0xf6efdc },
    swell: [{ angle: 20, L: 46, A: 1.01, Q: 0.55 }, { angle: 55, L: 27, A: 0.57, Q: 0.6 }, { angle: -15, L: 16, A: 0.30, Q: 0.6 }, { angle: 80, L: 9, A: 0.12, Q: 0.5 }],
    weather: { rollers: [1, 2], cells: [0, 1], gusts: 0, spouts: 0, rogue: 0, rain: 0.15 },
    exposure: 1.0, glow: 0, dressing: 'regatta',
  },
  thunder: {
    name: 'Thunderhead Reach', blurb: 'violet dusk, the lightning walks the water',
    sky: { top: 0x2a2148, hor: 0xd8708a, haze: 0x8a6c9c }, skyTex: 'sky_thunder.jpg',
    sun: { dir: [0.6, 0.22, 0.75], col: 0xff9a70, int: 2.6 }, hemi: [0x9a8cff, 0x2a3c55, 1.1],
    water: { deep: 0x17405f, shallow: 0x3aa9b0, foam: 0xf0ecf6 },
    swell: [{ angle: -30, L: 52, A: 1.35, Q: 0.55 }, { angle: 10, L: 30, A: 0.68, Q: 0.6 }, { angle: 60, L: 15, A: 0.32, Q: 0.6 }, { angle: -70, L: 8, A: 0.14, Q: 0.5 }],
    weather: { rollers: [0, 1], cells: [1, 2], gusts: 0, spouts: 0, rogue: 0, rain: 1.0 },
    exposure: 1.05, glow: 0, dressing: 'thunder', cloud: [0.06, 0.05, 0.11],
  },
  gale: {
    name: 'Gale Straits', blurb: 'the wind is a road, if you can find it',
    sky: { top: 0x24546a, hor: 0xc8e6c0, haze: 0x8ab8a8 }, skyTex: 'sky_gale.jpg',
    sun: { dir: [0.4, 0.42, -0.8], col: 0xfff0c0, int: 2.9 }, hemi: [0xbfe8ff, 0x2b5a50, 1.2],
    water: { deep: 0x0a5450, shallow: 0x35b890, foam: 0xf2f6ea },
    swell: [{ angle: 45, L: 40, A: 1.15, Q: 0.6 }, { angle: 0, L: 22, A: 0.61, Q: 0.65 }, { angle: 90, L: 12, A: 0.30, Q: 0.6 }, { angle: 30, L: 7, A: 0.14, Q: 0.5 }],
    weather: { rollers: [1, 1], cells: [0, 1], gusts: [2, 3], spouts: [1, 2], rogue: 0, rain: 0.4 },
    exposure: 1.0, glow: 0, dressing: 'gale',
  },
  rogue: {
    name: 'Rogue Deep', blurb: 'moonlight, and the sea glows when it breaks',
    sky: { top: 0x0c1430, hor: 0x3c5c9a, haze: 0x2c3e6a }, skyTex: 'sky_rogue.jpg',
    sun: { dir: [-0.3, 0.45, 0.85], col: 0xa8c4ff, int: 1.9 }, hemi: [0x6a86d0, 0x10253a, 0.9],
    water: { deep: 0x071f3a, shallow: 0x135e7a, foam: 0x9fdcec },
    swell: [{ angle: 10, L: 60, A: 1.49, Q: 0.5 }, { angle: -40, L: 33, A: 0.74, Q: 0.6 }, { angle: 70, L: 14, A: 0.30, Q: 0.6 }, { angle: 0, L: 8, A: 0.11, Q: 0.5 }],
    weather: { rollers: [0, 1], cells: [0, 1], gusts: 0, spouts: 0, rogue: 1, rain: 0.2 },
    exposure: 1.15, glow: 1, foam: 0.35, dressing: 'rogue', cloud: [0.16, 0.17, 0.3],
  },
  eye: {
    name: 'Eye of the Storm', blurb: 'calm water, a ring of storm, and the Admiral',
    sky: { top: 0x3a1a3a, hor: 0xff8a40, haze: 0xc8664a }, skyTex: 'sky_eye.jpg',
    sun: { dir: [0.1, 0.18, 1.0], col: 0xffa860, int: 3.0 }, hemi: [0xffa0a0, 0x3a2a40, 1.05],
    water: { deep: 0x23324e, shallow: 0x2f8a92, foam: 0xfff0dc },
    swell: [{ angle: 0, L: 50, A: 1.08, Q: 0.5 }, { angle: 45, L: 26, A: 0.54, Q: 0.6 }, { angle: -60, L: 13, A: 0.24, Q: 0.6 }],
    weather: { rollers: [1, 1], cells: [1, 1], gusts: [0, 1], spouts: 0, rogue: 0, rain: 0.3 },
    exposure: 1.05, glow: 0, dressing: 'eye',
  },
};
export const SEA_ORDER = ['regatta', 'thunder', 'gale', 'rogue', 'eye'];

// boat stats: speed m/s, turn (rad/s at full stick), mass (rams, knockback), beam m, deck lift (captain height bonus)
export const BOATS = {
  sloop_red: { name: 'Red Sloop', speed: 14, turn: 0.95, mass: 1.0, beam: 3.9, lift: 0, desc: 'The all-rounder.' },
  tug_barnacle: { name: 'Iron Tug', speed: 12.2, turn: 0.75, mass: 1.9, beam: 4.6, lift: 0.3, desc: 'Slow. Wins every ram.' },
  catamaran_kite: { name: 'Skimmer Cat', speed: 16.5, turn: 1.1, mass: 0.7, beam: 5.2, lift: 0, jump: 1.35, desc: 'Fast and light. Flies off crests.' },
  schooner_brisa: { name: 'Contessa\'s Schooner', speed: 14.8, turn: 0.82, mass: 1.25, beam: 4.0, lift: 0.6, desc: 'A high deck: strikes from above.' },
  bathtub: { name: 'The Bathtub', speed: 11.5, turn: 1.5, mass: 0.45, beam: 1.6, lift: -0.6, desc: 'A tiny target. Do not ask.' },
  galleon_nimbus: { name: 'Storm Galleon', speed: 11.5, turn: 0.6, mass: 3.2, beam: 7.0, lift: 2.0, desc: 'The Admiral\'s flagship.' },
};
export const BOAT_ORDER = ['sloop_red', 'tug_barnacle', 'catamaran_kite', 'schooner_brisa', 'bathtub'];

// lance stats: reach m (lateral from the hull centre), couch time s, bonus damage, rod (lightning catch radius x)
export const LANCES = {
  lance_classic: { name: 'Tourney Lance', reach: 7.6, couch: 0.22, dmg: 0, rod: 1.0, desc: 'Red and white, honest.' },
  lance_long: { name: 'Long Lance', reach: 9.2, couch: 0.32, dmg: 0, rod: 1.0, desc: 'Hit them before they reach you.' },
  lance_heavy: { name: 'Admiral\'s Lance', reach: 7.2, couch: 0.4, dmg: 1, rod: 1.0, desc: 'Every hit lands one harder. Slow to couch.' },
  lance_copper: { name: 'Copper Rod', reach: 7.4, couch: 0.24, dmg: 0, rod: 1.8, desc: 'Catches lightning from far off.' },
  lance_swordfish: { name: 'The Swordfish', reach: 8.0, couch: 0.14, dmg: 0, rod: 1.0, desc: 'Fastest couch on the sea. Smells.' },
};
export const LANCE_ORDER = ['lance_classic', 'lance_long', 'lance_heavy', 'lance_copper', 'lance_swordfish'];

// AI personality: lead = seconds before the pass it finishes couching (smaller is braver), jitter s,
// line = where in its reach band it aims (0 at the ram edge, 1 at its reach edge), react = s to respond,
// bolt/roller/gust = how much it wants each, ram = wants to ram, dodge = slips out when you fly, feint = late line switch
export const CAPTAINS = {
  player: { name: 'You', title: 'the challenger', hat: 0xf2b630, coat: 0xd7372f },
  pip: {
    short: 'PIP', name: 'Pip Tiller', title: 'the Rookie', sea: 'regatta', boat: 'sloop_red', tint: 0xf2b630, lance: 'lance_classic', footing: 4,
    ai: { lead: 1.25, jitter: 0.35, line: 0.55, react: 0.7, bolt: 0, roller: 0.2, gust: 0.2, ram: 0, dodge: 0, feint: 0, steer: 0.7, panic: 0.45 },
    spoil: { boat: 'bathtub' },
    intro: 'Is it... is it supposed to rock like this?', win: 'I WON? Mum! MUM!', lose: 'Okay. Okay. Bath time.',
    taunts: ['Please be gentle!', 'I read a book about this!', 'Which end is the pointy end?'],
    tip: 'Hold COUCH as the gold ring closes on Pip. Too early and Pip braces.',
  },
  barnacle: {
    short: 'BARNACLE', name: 'Bosun Barnacle', title: 'the Battering Ram', sea: 'regatta', boat: 'tug_barnacle', lance: 'lance_heavy', footing: 4,
    ai: { lead: 1.15, jitter: 0.3, line: 0.05, react: 0.55, bolt: 0, roller: 0.1, gust: 0, ram: 0.4, dodge: 0, feint: 0, steer: 0.85 },
    spoil: { boat: 'tug_barnacle' },
    intro: 'Forty years at sea. Never once steered round anything.', win: 'Har! Mind the barnacles on yer way down.', lose: 'Me tug... take care of her.',
    taunts: ['RAMMING SPEED!', 'I eat hulls for breakfast!', 'Coming through!'],
    tip: 'Barnacle wants to ram. Keep your hull clear of his and hit from the edge of your reach.',
  },
  volta: {
    short: 'DOC VOLTA', name: 'Doc Volta', title: 'the Lightning Chaser', sea: 'thunder', boat: 'sloop_red', tint: 0xf3eee3, lance: 'lance_copper', footing: 5,
    ai: { lead: 0.75, jitter: 0.25, line: 0.6, react: 0.45, bolt: 1.0, roller: 0.1, gust: 0.2, ram: 0, dodge: 0.2, feint: 0, steer: 0.9 },
    spoil: { lance: 'lance_copper' },
    intro: 'One point twenty-one gigawatts! Approximately!', win: 'SCIENCE!', lose: 'My hair... was already like this.',
    taunts: ['Feel the voltage!', 'The storm is MY lab!', 'Kzzzt!'],
    tip: 'Keep your lance UP under a storm cell when it strikes: the bolt charges it. Couch under one and your mast takes it.',
  },
  brisa: {
    short: 'BRISA', name: 'Contessa Brisa', title: 'the Duelist', sea: 'thunder', boat: 'schooner_brisa', lance: 'lance_long', footing: 4,
    ai: { lead: 0.55, jitter: 0.18, line: 0.8, react: 0.35, bolt: 0.4, roller: 0.3, gust: 0.3, ram: 0, dodge: 0.7, feint: 0, steer: 1.0 },
    spoil: { boat: 'schooner_brisa' },
    intro: 'En garde, darling. Do try to keep up.', win: 'Delightful. Next.', lose: 'Ah. A worthy... splash.',
    taunts: ['Touché!', 'How quaint.', 'Too slow, darling.'],
    tip: 'Brisa\'s lance is long: she hits from where you cannot. Close the gap, but not into a ram.',
  },
  kite: {
    short: 'KITE', name: 'Kite Kowalski', title: 'the Speedster', sea: 'gale', boat: 'catamaran_kite', lance: 'lance_classic', footing: 5,
    ai: { lead: 0.6, jitter: 0.2, line: 0.5, react: 0.4, bolt: 0.2, roller: 0.9, gust: 1.0, ram: 0, dodge: 0.3, feint: 0, steer: 1.0 },
    spoil: { boat: 'catamaran_kite' },
    intro: 'Duuude. The gusts out here? Unreal.', win: 'Gnarly wipeout, bro!', lose: 'Totally worth it.',
    taunts: ['Catch me if you can!', 'Wheee!', 'Riding the gust, dude!'],
    tip: 'Dark streaks on the water are gust lanes. Ride one in and you hit harder.',
  },
  gilly: {
    short: 'THE TWINS', name: 'The Gilly Twins', title: 'the Tricksters', sea: 'gale', boat: 'sloop_red', tint: 0x2f9a5a, lance: 'lance_swordfish', footing: 6,
    ai: { lead: 0.55, jitter: 0.3, line: 0.5, react: 0.35, bolt: 0.3, roller: 0.4, gust: 0.4, ram: 0.1, dodge: 0.3, feint: 0.85, steer: 1.0 },
    spoil: { lance: 'lance_swordfish' },
    intro: 'We are the Gilly Twins! (Two of us. Four footing.)', win: 'High five! No, other hand!', lose: 'It was HIS fault!',
    taunts: ['Left! No, right!', 'Which one of us is steering?', 'Peekaboo!'],
    tip: 'The Twins switch lines at the last second. Couch late and watch which way they go.',
  },
  marrow: {
    short: 'MARROW', name: 'Lady Marrow', title: 'the Drowned Captain', sea: 'rogue', boat: 'schooner_brisa', tint: 0x5c6a8a, lance: 'lance_long', footing: 5,
    ai: { lead: 0.45, jitter: 0.16, line: 0.88, react: 0.3, bolt: 0.5, roller: 1.0, gust: 0.3, ram: 0, dodge: 0.6, feint: 0.3, steer: 1.0 },
    spoil: { lance: 'lance_long' },
    intro: 'I have been overboard before, child. It is quite cold.', win: 'Join me below...', lose: 'The sea remembers.',
    taunts: ['Ooooo...', 'The deep is calling.', 'Ride the big one with me.'],
    tip: 'Rogue waves rise from the deep. Fly off one at the pass for HIGH GROUND.',
  },
  nimbus: {
    short: 'THE ADMIRAL', name: 'Admiral Nimbus', title: 'Lord of the Storm', sea: 'eye', boat: 'galleon_nimbus', lance: 'lance_heavy', footing: 8, boss: true,
    ai: { lead: 0.5, jitter: 0.18, line: 0.7, react: 0.3, bolt: 0.9, roller: 0.6, gust: 0.5, ram: 0.15, dodge: 0.3, feint: 0.2, steer: 0.9 },
    spoil: { lance: 'lance_heavy' },
    intro: 'You sail into MY storm? Kneel, or swim.', win: 'The storm takes all.', lose: 'Impossible... the storm... obeys... YOU?',
    taunts: ['THUNDER!', 'Bow to the storm!', 'I AM the weather!'],
    tip: 'The Admiral calls lightning on YOU. Keep your lance up under his clouds and turn his storm against him.',
  },
};
export const LADDER = ['pip', 'barnacle', 'volta', 'brisa', 'kite', 'gilly', 'marrow', 'nimbus'];

export const TUNING = {
  laneHalf: 26,          // lateral half-width of the tilt lane (buoys)
  startZ: 66,            // each yacht starts this far from the centre
  hitGap: 0.35,          // hulls closer than half-beams + this = a ram
  late: 0.55,            // couched within this long before the pass = LATE COUCH
  early: 1.4,            // couched longer than this = the rival braces
  highGround: 1.2,       // captain height difference for HIGH GROUND
  gravity: 13.0,
};
