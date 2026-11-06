'use strict';

const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d');
const W = 960, H = 540, FLOOR = 463, SAVE_KEY = 'love-chaos-progress-v1';
const MEETUP = 8;
const PIANO = 9;
const MALL = 10;
const missionOrder = [0, 1, 2, MEETUP, PIANO, 3, MALL, 4, 5, 6, 7];
const pianoKeys = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI', 'DO′'];
const pianoParts = [[0, 1, 2], [4, 5, 6]];
const pianoColors = ['#9de3ff', '#ffbdde'];
const pianoLeft = 96, pianoKeyWidth = 96;
const missionNumber = id => missionOrder.indexOf(id) + 1;
const dialogue = [
  ['كوثر', 'فين كنتي؟'],
  ['أيمن', 'كنت فالقهوة.'],
  ['كوثر', 'إممم… كنتي معاها؟'],
  ['أيمن', 'والله إيلا فالقهوة، الله يهديك. هاني هاز شكّارتي، فيها البيسي.'],
  ['كوثر', 'فيناهيا الشكّارة؟'],
  ['أيمن', 'ها هي، شوفي.'],
  ['كوثر', 'أووو، سمح ليا آ حبيبي، ظلمتك. غير أنا مشطونة عليك.'],
  ['أيمن', 'ماشي مشكل آ حوبي. آجي نكمّلو اللعبة، راه أيمن وكوثر ديال بصّح كيتسنّاونا نلعبو، وحنا گالسين هنا أنا وياك كنتحابّو، هههههه.']
];
const mallStops = [
  { x: 255, hint: 'Press E to start. Kaoutar will walk over to Aymane.', lines: [
    [235, 'كوثر', 'بيبي، تمشي معايا ندير الشوبينغ عفاك؟ 🥺'],
    [220, 'أيمن', 'واخا، ولكن ما غاديش نتعطلو، ياك؟'],
    [155, 'كوثر', 'لاا، ما تخافش!'],
    [46, '', '', 'hop'],
    [82, '', '', 'kiss']
  ] },
  { x: 775, hint: 'Walk together to the nail shop, محل البشير →', lines: [
    [230, 'كوثر', 'تسنّاني هنا عفاك، راه كاينين البنات تما.'],
    [195, 'أيمن', 'واخا، ما تعطلّيش.'],
    [80, '', '', 'salonEnter'],
    [125, '', '', 'salonWait'],
    [85, '', '', 'salonExit'],
    [225, 'كوثر', 'كي جاوني ضفاري؟ 💅', 'nails'],
    [190, 'أيمن', 'جاوك زوينين بزّاف!'],
    [75, '', '', 'kiss']
  ] },
  { x: 1350, hint: 'Head to the next shop to pick out some clothes →', lines: [
    [75, '', '', 'clothesEnter'],
    [135, '', '', 'clothesWait'],
    [75, '', '', 'clothesExit'],
    [205, 'أيمن', 'فيا الجوع… نمشيو ناكلو شي حاجة؟', 'bags']
  ] },
  { x: 1920, hint: 'Walk to the food court together →', lines: [
    [55, '', '', 'seats'],
    [205, 'أيمن', 'عفاك عطيني واحد البرغر.', 'seated'],
    [220, 'أيمن', 'وهي عطيها بريوات بالدجاج، عفاك.', 'seated'],
    [160, 'السرباي', 'ها الطلب ديالكم، بالصحة والراحة!', 'serve'],
    [170, '', '', 'eat']
  ] }
];
const missions = [
  ['Jealousy Overload — Four Girls, One Aymane!', 3500, '#ff89af', '#492762', 'Clear four followers with the equipped bat. Stow it and meet Aymane.'],
  ['The Runaway Flower Chase!', 2960, '#ffc97a', '#315264', 'Aymane: press E at yellow switches. Meet Kaoutar at the finish with the bouquet.'],
  ['Heart Apocalypse!', 2840, '#ffa6d6', '#442652', 'Dodge falling hearts. Collect shields and meet at the shelter.'],
  ['Who Is the Real Aymane?', 2320, '#a0f1d9', '#2d4268', 'Aymane: press E to flash the secret signal. Kaoutar: find and touch him.'],
  ['The Giant Pizza Escape!', 3280, '#ffb570', '#67384d', 'Run from the pizza. Aymane: use E to divert it and activate the bridge.'],
  ['The Upside-Down Disco!', 2720, '#cda4ff', '#31265f', 'Aymane: use E at the yellow switch. Kaoutar: stand on the pink dance pad.'],
  ['The Clone Chaos!', 2920, '#95e5ff', '#244859', 'Kaoutar: stand on the marked route pads. Aymane: press E beside each gate.'],
  ['The Ultimate Chaos Party!', 3940, '#ffe684', '#57336b', 'Clear the chasers, power both bridges and meet in the party zone.'],
  ['فين كنتي؟ — A Walk in the Rain', 1680, '#b6e9ff', '#35495c', 'Walk toward each other and meet under the lights in the middle.'],
  ['Jump Keys — A Piano for Two', 960, '#e3bcff', '#403555', 'Land on any key to play it. Press E to hear the duet challenge.'],
  ['Special Mission — Mall Date', 2290, '#ffc6da', '#573b61', 'Meet up and go shopping together.']
];
let progress = [];
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (Array.isArray(saved)) progress = saved.filter(i => Number.isInteger(i) && i >= 0 && i < missions.length);
} catch {}
const unlocked = i => i === 0 || progress.includes(i) || progress.includes(missionOrder[missionNumber(i) - 2]);
function save(id) {
  if (!progress.includes(id)) progress.push(id);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch {}
  missionOptions(id);
}
function missionOptions(selected = 0) {
  $('mission').replaceChildren(...missionOrder.map((i, index) => {
    const [name] = missions[i];
    const option = new Option((progress.includes(i) ? '✓ ' : unlocked(i) ? '' : '🔒 ') + (index + 1) + '. ' + name, i);
    option.disabled = !unlocked(i);
    return option;
  }));
  $('mission').value = selected;
}
missionOptions();

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rect = (x, y, w, extra = {}) => ({ x, y, w, ...extra });
function actor(x) {
  return { x, y: FLOOR, vx: 0, vy: 0, face: 1, floor: false, checkpoint: x, inv: 0, blush: 0, shield: 0 };
}
function createWorld(id) {
  const [, width] = missions[id];
  const gaps = [1, 4, 7].includes(id) ? [900, ...(id === 7 ? [2450] : [])] : [];
  const ground = [];
  let start = 0;
  for (const gap of gaps) {
    ground.push(rect(start, FLOOR, gap - start));
    start = gap + 118;
  }
  ground.push(rect(start, FLOOR, width - start));
  const platforms = [];
  for (let x = 345, i = 0; id !== MEETUP && id !== PIANO && id !== MALL && x < width - 320; x += 410, i++) {
    platforms.push(rect(x, 390, 135, { move: [1, 2, 5, 7].includes(id) && i % 3 === 1, bounce: id === 4 && i % 2 === 0 }));
    platforms.push(rect(x + 103, 322, 128, { bridge: i % 2 === 0 }));
    platforms.push(rect(x + 205, 389, 116));
  }
  const switches = ({
    1: [{ x: 770, kind: 'bridge', gap: 900 }, { x: 1530, kind: 'light' }, { x: 2050, kind: 'door', gate: 2180 }],
    4: [{ x: 770, kind: 'bridge', gap: 900 }, { x: 1750, kind: 'divert' }],
    5: [{ x: 1480, kind: 'disco', gate: 1780, pad: 1630 }],
    6: [{ x: 810, kind: 'maze', gate: 990, pad: 900 }, { x: 1740, kind: 'maze', gate: 1920, pad: 1840 }],
    7: [{ x: 770, kind: 'bridge', gap: 900 }, { x: 2300, kind: 'bridge', gap: 2450 }]
  })[id] || [];
  switches.forEach(s => { s.on = false; });
  const followers = id === 0 ? [270, 410, 565, 700] : id === 7 ? [440, 530, 635, 740] : [];
  const decoys = id === 3 ? [470, 675, 880, 1090, 1320, 1540, 1830] :
    id === 6 ? [480, 620, 1020, 1250, 1460, 1760, 2010, 2340] :
    id === 5 ? [380, 520, 1270, 1900, 2300] : [];
  const a = actor(id === MALL ? 255 : id === PIANO ? 144 : id === 3 ? 1100 : 190);
  const b = actor(id === PIANO ? 816 : id === MEETUP ? width - 135 : id === 1 ? width - 700 : 86);
  if (id === MEETUP || id === PIANO) b.face = -1;
  return {
    id, width, t: 0, a, b, ground, platforms, switches,
    ...(id === MALL ? { mall: { stop: 0, line: -1, since: 0, approaching: false } } : {}),
    ...(id === PIANO ? { piano: { phase: 'free', demoAt: 0, progress: [0, 0], lights: Array(8).fill(null) } } : {}),
    girls: followers.map((x, i) => ({ ...actor(x), i, alive: true, spin: 0 })),
    decoys: decoys.map((x, i) => ({ ...actor(x), origin: x, i })),
    drops: [], hearts: [], sparks: [], pizza: -350, pizzaSleep: 0,
    notice: id === 0 ? 'JEALOUSY LEVEL: 9999!' : missions[id][0], noticeUntil: id === MALL ? 0 : 200,
    finish: false, paused: false, pauseReason: '', bat: false, batUntil: 0, heartUntil: 0, charge: 0,
    kissUntil: 0, kissReady: 0, signal: 0, touchCloneUntil: 0, dialogueLine: -1, dialogueAt: 0, event: 0, fx: ''
  };
}
let state = createWorld(0), role = 'menu';
let keys = Object.create(null), actions = [];
let camera = 0, zoom = 1, cameraReset = true;
let peer, connection, remote = {}, remoteActions = [], pending = 0, clock = 0, waitingUntil = 0;
const aimKeys = ['KeyA', 'KeyD', 'KeyW'];
const girlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp'];
const codes = new Set([...aimKeys, ...girlKeys, 'KeyE', 'KeyM', 'KeyL', 'KeyK', 'KeyJ', 'KeyR', 'KeyV', 'Escape']);
const movement = list => list.map(code => Boolean(keys[code]));
const status = message => { $('status').textContent = message; };
const playing = () => $('menu').hidden;
function announce(s, text, duration = 135) {
  s.notice = text;
  s.noticeUntil = s.t + duration;
}
function sound(s, name) {
  s.fx = name;
  s.event++;
  if (role !== 'guest') playSound(name);
}
function burst(s, x, y, color, n = 18) {
  for (let i = 0; i < n; i++) {
    const angle = i * 2.39996;
    const speed = 1.4 + Math.random() * 5;
    s.sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5, life: 25 + Math.random() * 22, color });
  }
}
function resetActor(s, p) {
  burst(s, p.x, p.y - 22, '#fff0a0');
  Object.assign(p, { x: p.checkpoint, y: FLOOR, vx: 0, vy: 0, inv: 82, floor: false });
  sound(s, 'respawn');
}
function surfaces(s) {
  const bridges = s.switches.filter(q => q.on && q.gap).map(q => rect(q.gap, FLOOR, 118, { bridge: true }));
  return [...s.ground, ...bridges, ...s.platforms.map(p => p.move ? { ...p, y: p.y + Math.sin(s.t / (s.switches.some(q => q.kind === 'light' && q.on) ? 36 : 58) + p.x / 58) * 29 } : p)];
}
function physics(s, p, direction, jump, speed, platforms, gates = false) {
  const previousX = p.x, previousY = p.y;
  p.vx += (direction * speed - p.vx) * .36;
  if (direction) p.face = Math.sign(direction);
  if (jump && p.floor) {
    p.vy = -12.7;
    p.floor = false;
    if (s.id !== PIANO && (p === s.a || p === s.b)) sound(s, 'jump');
  }
  p.x = clamp(p.x + p.vx, 16, s.width - 16);
  if (gates) for (const gate of s.switches) {
    if (gate.gate && !gate.on && ((previousX <= gate.gate && p.x > gate.gate - 13) || (previousX >= gate.gate && p.x < gate.gate + 13))) {
      p.x = gate.gate + (previousX < gate.gate ? -13 : 13);
      p.vx = 0;
    }
  }
  if (p.floor) {
    const moving = platforms.find(q => q.move && p.x > q.x && p.x < q.x + q.w && Math.abs(q.y - p.y) < 3);
    if (moving) p.y = moving.y;
  }
  p.vy = Math.min(13, p.vy + .55);
  p.y += p.vy;
  p.floor = false;
  for (const surface of platforms) {
    if (p.x + 10 < surface.x || p.x - 10 > surface.x + surface.w || p.vy < 0) continue;
    if (previousY > surface.y + 7 || p.y < surface.y - 3) continue;
    p.y = surface.y;
    p.vy = surface.bounce ? -14.5 : 0;
    p.floor = !surface.bounce;
    break;
  }
  if (p.y > H + 55) {
    if (p === s.a || p === s.b) resetActor(s, p);
    else Object.assign(p, { x: p.checkpoint, y: FLOOR, vy: 0 });
  }
  if (p.inv) p.inv--;
  if (p.blush) p.blush--;
  if (p.shield) p.shield--;
}
function chase(s, p, platforms) {
  const delta = s.a.x - p.x;
  const direction = Math.abs(delta) > 7 ? Math.sign(delta) : 0;
  const step = p.x + direction * (40 + p.i * 6);
  const upper = platforms.some(q => q.y < p.y - 24 && q.y > p.y - 120 && step >= q.x - 18 && step < q.x + q.w + 18);
  const edge = p.x + direction * 23;
  const gap = p.y >= FLOOR - 3 && !platforms.some(q => q.y === FLOOR && edge >= q.x && edge < q.x + q.w);
  const jump = direction && (gap || (s.a.y < p.y - 30 && upper && Math.abs(delta) < 380));
  physics(s, p, direction, jump, 3.1 + p.i * .35, platforms, true);
}
function interact(s) {
  if (s.id === 3) {
    s.signal = s.t + 280;
    announce(s, 'SECRET SIGNAL! Follow the golden sparkle.');
    sound(s, 'power');
    return;
  }
  const q = s.switches.find(item => !item.on && Math.abs(item.x - s.a.x) < 105 && s.a.y >= FLOOR - 95);
  if (!q) return;
  if (q.pad && (Math.abs(q.pad - s.b.x) > 44 || s.b.y < FLOOR - 35)) {
    announce(s, 'Kaoutar, stand on the pink pad!');
    return;
  }
  q.on = true;
  if (q.kind === 'divert') s.pizzaSleep = s.t + 450;
  announce(s, ({ bridge: 'BRIDGE ONLINE!', divert: 'PIZZA DETOUR!', light: 'LIGHTS ON! Moving lifts accelerated.', door: 'DOOR OPEN!', disco: 'DANCE FLOOR UNLOCKED!', maze: 'THAT WAS THE REAL CLUE!' })[q.kind]);
  sound(s, 'power');
}
function ability(s, key) {
  if (key === 'KeyL') {
    if (s.t < s.batUntil) return;
    s.bat = !s.bat;
    s.batUntil = s.t + 10;
    sound(s, 'equip');
  }
  if (key === 'KeyJ') s.bat = false;
  if (key === 'KeyM' && s.t >= s.heartUntil) {
    s.heartUntil = s.t + 175;
    s.charge = s.t + 19;
    sound(s, 'power');
  }
  if (key === 'KeyK' && s.t >= s.kissReady) {
    s.kissUntil = s.t + 175;
    s.kissReady = s.t + 380;
    announce(s, 'CHAOS ACTIVATED!');
    sound(s, 'kiss');
  }
}
function powers(s) {
  const { a, b } = s;
  if (s.charge && s.t >= s.charge) {
    s.charge = 0;
    const toward = Math.atan2(a.y - b.y, a.x - b.x);
    for (let i = -2; i <= 2; i++) {
      const angle = toward + i * .16;
      s.hearts.push({ x: b.x, y: b.y - 26, vx: Math.cos(angle) * 7, vy: Math.sin(angle) * 7, life: 195, delay: (i + 2) * 4, kiss: false });
    }
    sound(s, 'whoosh');
  }
  if (s.t < s.kissUntil && s.t % 22 === 0) s.hearts.push({ x: b.x, y: b.y - 30, vx: 0, vy: 0, life: 130, delay: 0, kiss: true });
  for (const h of s.hearts) {
    if (h.delay > 0) { h.delay--; continue; }
    const angle = Math.atan2(a.y - 23 - h.y, a.x - h.x);
    h.vx += (Math.cos(angle) * (h.kiss ? 6.7 : 9.2) - h.vx) * (h.kiss ? .19 : .07);
    h.vy += (Math.sin(angle) * 7 - h.vy) * .08;
    h.x += h.vx;
    h.y += h.vy;
    h.life--;
    if (Math.hypot(h.x - a.x, h.y - (a.y - 23)) < 22) {
      h.life = 0;
      a.blush = 65;
      burst(s, h.x, h.y, '#ff98c7', 12);
      sound(s, 'pop');
    }
  }
  s.hearts = s.hearts.filter(h => h.life > 0);
  if (s.t < s.kissUntil && dist(a, b) < 34 && !a.blush) {
    a.blush = b.blush = 60;
    burst(s, a.x, a.y - 32, '#ffafd3');
  }
  if (!s.bat) return;
  const contact = p => Math.abs(p.y - b.y) < 34 && Math.abs(p.x - b.x) < 33;
  if (!a.inv && contact(a)) {
    announce(s, 'WRONG TARGET! Aymane bounced back.');
    resetActor(s, a);
    return;
  }
  if (s.t < s.batUntil) return;
  const girl = s.girls.find(p => p.alive && contact(p));
  if (!girl) return;
  girl.alive = false;
  girl.spin = s.t + 26;
  s.batUntil = s.t + 12;
  burst(s, girl.x, girl.y - 27, ['#ff89ad', '#ffe479', '#8df9c4', '#a6cbff'][girl.i], 28);
  const remaining = s.girls.filter(p => p.alive).length;
  announce(s, remaining ? 'ONE GIRL DOWN! ' + remaining + ' to go.' : 'ALL FOUR GIRLS CLEARED! Stow the bat and meet.');
  sound(s, 'bonk');
}
function hazards(s) {
  const { a, b, id } = s;
  const meteor = id === 2 || id === 7;
  if ((meteor || id === 4) && s.t % (meteor ? 38 : 53) === 0) {
    const target = Math.floor(s.t / (meteor ? 38 : 53)) % 2 ? a : b;
    const x = clamp(target.x + (Math.random() - .43) * 420, 40, s.width - 220);
    if (!meteor || !shelter(s, x)) s.drops.push({ x, y: -35, vy: 2, topping: id === 4 });
  }
  for (const drop of s.drops) {
    drop.y += drop.vy;
    drop.vy += .23;
    for (const p of [a, b]) {
      if (!p.inv && !shelter(s, p.x) && Math.hypot(p.x - drop.x, p.y - 24 - drop.y) < (drop.topping ? 26 : 41)) {
        drop.y = H + 100;
        if (p.shield) {
          p.shield = 0;
          p.inv = 40;
          burst(s, p.x, p.y - 26, '#9efbff');
          sound(s, 'pop');
        } else resetActor(s, p);
      }
    }
  }
  s.drops = s.drops.filter(drop => drop.y < H + 60);
  if (meteor) for (const p of [a, b]) {
    if (!p.shield && [600, 1380, 2070, 2940].some(x => Math.abs(x - p.x) < 26) && p.y > FLOOR - 46) p.shield = 300;
  }
  if (id === 4) {
    if (s.t > 100) s.pizza = Math.min(s.width - 280, s.pizza + (s.t < s.pizzaSleep ? 3.3 : 2.65));
    for (const p of [a, b]) if (s.t >= s.pizzaSleep && !p.inv && Math.abs(p.x - s.pizza) < 70 && p.y > FLOOR - 125) resetActor(s, p);
  }
  if (id === 6) for (const p of [a, b]) {
    if (!p.inv && p.y >= FLOOR - 7 && [1190, 1590, 2210].some(x => Math.abs(p.x - x) < 20)) {
      p.vy = -10;
      p.floor = false;
      p.inv = 40;
      announce(s, 'FAKE CLUE! The floor is a trampoline.', 75);
      sound(s, 'bonk');
    }
  }
}
function shelter(s, x) {
  return x > s.width - 205 || (s.id === 2 && [850, 1720].some(center => Math.abs(x - center) < 60));
}
function complete(s) {
  s.finish = true;
  s.winAt = s.t;
  s.bat = false;
  save(s.id);
  announce(s, 'MISSION COMPLETE!', 9999);
  sound(s, 'win');
}
function strikeKey(s, key, player) {
  s.piano.lights[key] = { player, until: s.t + 25 };
  playPianoKey(key);
  if (role === 'host') send({ type: 'piano-note', key });
}
function stepPiano(s, moves, actions) {
  const piano = s.piano;
  if (piano.phase !== 'demo' && actions.includes('KeyE')) {
    piano.phase = 'demo';
    piano.demoAt = s.t;
  }
  if (piano.phase === 'demo') {
    const elapsed = s.t - piano.demoAt;
    if (elapsed < 180 && elapsed % 30 === 0) {
      const index = elapsed / 30;
      const player = index < 3 ? 0 : 1;
      strikeKey(s, pianoParts[player][index % 3], player);
    }
    if (elapsed >= 180) piano.phase = 'echo';
  }
  [s.a, s.b].forEach((actor, player) => {
    const [left, right, jump] = moves[player];
    const airborne = !actor.floor && actor.y < FLOOR - 3;
    physics(s, actor, +right - +left, jump, 4.8, s.ground);
    if (!airborne || !actor.floor) return;
    const key = Math.floor((actor.x - pianoLeft) / pianoKeyWidth);
    if (key < 0 || key >= pianoKeys.length) return;
    strikeKey(s, key, player);
    if (piano.phase === 'echo' && key === pianoParts[player][piano.progress[player]]) {
      piano.progress[player]++;
    }
  });
  if (piano.phase === 'echo' && piano.progress.every(count => count === 3)) complete(s);
}
function mallLine(s) {
  return mallStops[s.mall.stop]?.lines[s.mall.line];
}
function walkTo(p, target, speed = 2.4) {
  const dx = clamp(target - p.x, -speed, speed);
  p.x += dx;
  p.vx = dx;
  if (dx) p.face = Math.sign(dx);
}
function stepMall(s, moves, actions) {
  const mall = s.mall;
  const stop = mallStops[mall.stop];
  const cue = mallLine(s);
  if (!cue) {
    if (mall.stop === 0 && actions.includes('KeyE')) mall.approaching = true;
    if (mall.approaching) {
      walkTo(s.a, stop.x, 5);
      walkTo(s.b, stop.x - 45, 5);
      for (const actor of [s.a, s.b]) {
        actor.y = FLOOR;
        actor.vy = 0;
        actor.floor = true;
      }
      if (s.a.x !== stop.x || s.b.x !== stop.x - 45) return;
      mall.approaching = false;
    } else {
      [s.a, s.b].forEach((p, i) => {
        const [left, right, jump] = moves[i];
        physics(s, p, +right - +left, jump, 4.8, s.ground);
      });
      if (mall.stop === 0 || Math.abs(s.a.x - stop.x) >= 95 ||
          Math.abs(s.b.x - s.a.x) >= 92 || Math.abs(s.b.x - stop.x) >= 135 ||
          !s.a.floor || !s.b.floor) return;
    }
    mall.line = 0;
    mall.since = s.t;
    s.a.vx = s.b.vx = 0;
    s.a.face = s.a.x <= s.b.x ? 1 : -1;
    s.b.face = -s.a.face;
    return;
  }
  const [duration, , , motion] = cue;
  const elapsed = s.t - mall.since;
  const x = stop.x;
  const { a, b } = s;
  a.vx = b.vx = 0;
  if (motion === 'hop') b.y = FLOOR - 39 * Math.sin(Math.PI * Math.min(1, elapsed / duration));
  else b.y = FLOOR;
  if (motion === 'kiss') {
    walkTo(b, a.x + (b.x < a.x ? -25 : 25));
    a.face = b.x < a.x ? -1 : 1;
    b.face = -a.face;
  }
  if (motion === 'salonEnter') {
    walkTo(a, x - 76);
    walkTo(b, x + 20);
  }
  if (motion === 'salonExit') walkTo(b, x - 44);
  if (motion === 'clothesEnter') {
    walkTo(a, x - 10);
    walkTo(b, x + 24);
  }
  if (motion === 'clothesExit') {
    walkTo(a, x + 60);
    walkTo(b, x + 95);
  }
  if (motion === 'seats') {
    walkTo(a, x - 44, 3);
    walkTo(b, x + 44, 3);
    a.face = 1;
    b.face = -1;
  }
  if (elapsed < duration) return;
  b.y = FLOOR;
  mall.since = s.t;
  mall.line++;
  if (mall.line < stop.lines.length) return;
  mall.stop++;
  mall.line = -1;
  if (mall.stop === mallStops.length) complete(s);
}
function step(s, aMove, bMove, aActions, bActions) {
  if (s.paused) return;
  s.t++;
  if (s.id === MALL && !s.finish) {
    stepMall(s, [aMove, bMove], [...aActions, ...bActions]);
    return;
  }
  if (s.id === PIANO && !s.finish) {
    stepPiano(s, [aMove, bMove], aActions);
    return;
  }
  if (s.id === MEETUP && !s.finish) {
    if (s.dialogueLine >= 0) {
      const elapsed = s.t - s.dialogueAt;
      const duration = s.dialogueLine === dialogue.length - 1 ? 620 : s.dialogueLine === 6 ? 370 : 235;
      if (elapsed >= duration || (elapsed > 28 && aActions.includes('KeyE'))) {
        if (s.dialogueLine === dialogue.length - 1) {
          s.dialogueLine = -1;
          complete(s);
        } else {
          s.dialogueLine++;
          s.dialogueAt = s.t;
        }
      }
    } else {
      const ground = s.ground;
      physics(s, s.a, +aMove[1] - +aMove[0], aMove[2], 4.2, ground);
      physics(s, s.b, +bMove[1] - +bMove[0], bMove[2], 4.2, ground);
      const center = s.width / 2;
      s.a.x = Math.min(s.a.x, center - 19);
      s.b.x = Math.max(s.b.x, center + 19);
      if (s.b.x - s.a.x < 51 && s.a.y >= FLOOR - 5 && s.b.y >= FLOOR - 5) {
        s.a.face = 1;
        s.b.face = -1;
        s.a.vx = s.b.vx = 0;
        s.dialogueLine = 0;
        s.dialogueAt = s.t;
        s.noticeUntil = 0;
      }
    }
    return;
  }
  if (s.finish) {
    if (s.t % 12 === 0) burst(s, (s.a.x + s.b.x) / 2 + (Math.random() - .5) * 420, 100 + Math.random() * 230, s.t % 24 ? '#ff9ecf' : '#ffdf7e', 25);
  } else {
    if (aActions.includes('KeyE')) interact(s);
    bActions.forEach(key => ability(s, key));
    const platforms = surfaces(s);
    const reverse = p => s.id === 5 && s.t % 260 < 95 && ((p.x > 730 && p.x < 1080) || (p.x > 1990 && p.x < 2210)) ? -1 : 1;
    physics(s, s.a, (+aMove[1] - +aMove[0]) * reverse(s.a), aMove[2], 5.3, platforms, true);
    physics(s, s.b, (+bMove[1] - +bMove[0]) * reverse(s.b), bMove[2], s.t < s.kissUntil ? 7.4 : 5.65, platforms, true);
    for (const p of [s.a, s.b]) {
      if (p.floor && p.y === FLOOR && s.ground.some(q => p.x > q.x + 50 && p.x < q.x + q.w - 50) &&
          !s.switches.some(q => q.gate && Math.abs(p.x - q.gate) < 65) &&
          !(s.id === 6 && [1190, 1590, 2210].some(x => Math.abs(p.x - x) < 62)) &&
          (s.id !== 4 || p.x > s.pizza + 160) &&
          (Math.abs(p.x - p.checkpoint) > 300 || p.checkpoint < s.pizza + 80)) p.checkpoint = p.x;
    }
    s.girls.filter(p => p.alive).forEach(p => chase(s, p, platforms));
    for (const p of s.decoys) {
      const dir = Math.sin(s.t / (29 + p.i * 3) + p.i) * 2 + clamp((p.origin - p.x) / 45, -3, 3);
      const mimic = s.id === 3 && (s.t + p.i * 20) % 220 < 42;
      physics(s, p, mimic ? Math.sign(s.a.vx) : clamp(dir, -1, 1), mimic ? aMove[2] : (s.t + p.i * 39) % 103 === 0, 2.5, platforms);
      if (s.id === 3 && s.t >= s.touchCloneUntil && dist(s.b, p) < 25) {
        s.touchCloneUntil = s.t + 100;
        announce(s, 'That one only knows how to dance.', 85);
        burst(s, p.x, p.y - 24, '#d5b1ff');
      }
    }
    powers(s);
    hazards(s);
    const meet = dist(s.a, s.b) < 36 && !s.bat && !s.a.inv && !s.b.inv;
    const clear = s.girls.every(p => !p.alive);
    const exit = s.a.x > s.width - 190 && s.b.x > s.width - 190;
    const switches = s.switches.every(q => q.on);
    const won = [
      meet && clear,
      meet && exit && switches,
      exit,
      meet && s.t < s.signal,
      exit && switches,
      exit && switches,
      exit && switches,
      meet && exit && clear && switches
    ][s.id];
    if (won) complete(s);
  }
  for (const p of s.sparks) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += .14;
    p.life--;
  }
  s.sparks = s.sparks.filter(p => p.life > 0);
}

const prefix = 'aymane-kaoutar-chaos-v1-';
const roomCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), n => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[n % 32]).join('');
const codeFromLink = new URLSearchParams(location.search).get('room');
if (codeFromLink) $('room').value = codeFromLink.slice(0, 5);
function focusGame() {
  canvas.tabIndex = -1;
  canvas.focus();
}
function start(id) {
  state = createWorld(id);
  cameraReset = true;
  actions = [];
  remoteActions = [];
  $('menu').hidden = true;
  updateOverlay();
  focusGame();
}
function clearConnection() {
  const oldPeer = peer;
  connection = peer = null;
  remote = {};
  remoteActions = [];
  pending = 0;
  if (oldPeer) oldPeer.destroy();
}
function openMenu(message = '') {
  clearConnection();
  role = 'menu';
  $('menu').hidden = false;
  $('pause').hidden = true;
  $('invite').hidden = true;
  $('host').disabled = $('join').disabled = false;
  status(message);
}
function send(data) {
  if (connection?.open) connection.send(data);
}
function snapshot() {
  const { ground, platforms, decoys, ...dynamic } = state;
  send({ type: 'state', ...dynamic, decoys });
}
function accept(conn, host) {
  connection = conn;
  conn.on('open', () => {
    if (connection !== conn) return;
    pending = 0;
    if (host) {
      role = 'host';
      start(Number($('mission').value));
      snapshot();
    } else {
      role = 'guest';
      status('Connected. Waiting for Aymane…');
      waitingUntil = performance.now() + 12000;
    }
  });
  conn.on('data', data => {
    if (connection !== conn || !data || typeof data !== 'object') return;
    if (host && data.type === 'input' && Array.isArray(data.move) && Array.isArray(data.actions)) {
      remote = { move: girlKeys.map((_, i) => Boolean(data.move[i])), received: performance.now() };
      remoteActions.push(...data.actions.slice(0, 8).filter(code => ['KeyM', 'KeyK', 'KeyL', 'KeyJ', 'KeyR', 'Escape', 'KeyE'].includes(code)));
    }
    if (!host && data.type === 'piano-note' && state.id === PIANO &&
        Number.isInteger(data.key) && data.key >= 0 && data.key < pianoKeys.length) {
      playPianoKey(data.key);
    }
    if (!host && data.type === 'state' && missions[data.id]) {
      const fresh = !playing() || state.id !== data.id || state.t > data.t;
      if (fresh) start(data.id);
      if (data.finish && !progress.includes(data.id)) save(data.id);
      if (state.event !== data.event && data.fx) playSound(data.fx);
      Object.assign(state, data);
      updateOverlay();
    }
  });
  conn.on('close', () => { if (connection === conn) openMenu('The other player disconnected.'); });
  conn.on('error', () => { if (connection === conn) openMenu('The room connection failed. Try again.'); });
}
function network(host) {
  initAudio();
  const code = host ? roomCode() : $('room').value.trim().toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(code)) return status('Enter the five-character room code.');
  if (!window.Peer) return status('PeerJS could not load. Check your connection and reload.');
  clearConnection();
  role = 'menu';
  $('invite').hidden = true;
  $('host').disabled = $('join').disabled = true;
  status(host ? 'Creating your room…' : 'Connecting to Aymane…');
  const session = peer = host ? new Peer(prefix + code) : new Peer();
  pending = performance.now() + 18000;
  session.on('error', err => {
    if (peer === session) openMenu(err.type === 'peer-unavailable' ? 'Room not found. Check the code.' : 'The room service could not connect. Try again.');
  });
  session.on('open', () => {
    if (peer !== session) return;
    if (host) {
      pending = 0;
      status('Room ' + code + ' · Waiting for Kaoutar…');
      const invite = new URL('index.html', location.href);
      invite.searchParams.set('chaos', code);
      $('invite').href = invite.href;
      $('invite').target = '_blank';
      $('invite').rel = 'noopener';
      $('invite').hidden = false;
    } else accept(session.connect(prefix + code, { reliable: true }), false);
  });
  session.on('connection', conn => {
    if (!host || connection || peer !== session) { conn.close(); return; }
    pending = performance.now() + 12000;
    accept(conn, true);
  });
}
$('host').onclick = () => network(true);
$('join').onclick = () => network(false);
$('room').addEventListener('keydown', e => { if (e.key === 'Enter') network(false); });
$('local').onclick = () => {
  initAudio();
  clearConnection();
  role = 'local';
  start(Number($('mission').value));
};
$('main').onclick = () => {
  const button = parent !== window && parent.document.getElementById('back');
  if (button) button.click();
  else location.href = 'index.html';
};
function updateOverlay() {
  const showWin = state.finish && state.t - state.winAt > 95;
  $('pause').hidden = !(state.paused || showWin);
  if ($('pause').hidden) return;
  const next = missionOrder[missionNumber(state.id)];
  $('pause-title').textContent = showWin ? (next ? 'Mission Complete!' : 'Ultimate Chaos Party!') : 'Paused';
  $('pause-detail').textContent = showWin ? (next ? 'Mission ' + missionNumber(next) + ' unlocked.' : 'Love & Chaos complete. ♥') : state.pauseReason;
  $('resume').hidden = role === 'guest' || (showWin && !next);
  $('resume').textContent = showWin ? 'Next Mission' : 'Resume';
}
$('resume').onclick = () => {
  if (state.finish) start(missionOrder[missionNumber(state.id)]);
  else {
    state.paused = false;
    updateOverlay();
    focusGame();
  }
  if (role === 'host') snapshot();
};
$('missions').onclick = () => openMenu();

addEventListener('keydown', e => {
  if (!playing() || !codes.has(e.code) || /^(INPUT|SELECT)$/.test(e.target.tagName)) return;
  keys[e.code] = true;
  e.preventDefault();
  if (e.repeat) return;
  initAudio();
  if (e.code === 'KeyV') {
    muted = !muted;
    if (audio) audio.master.gain.value = muted ? 0 : .19;
  } else if (!aimKeys.includes(e.code) && !girlKeys.includes(e.code)) actions.push(e.code);
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { keys = Object.create(null); });
function tick() {
  clock++;
  if (pending && performance.now() > pending) openMenu('Connection timed out. Try again.');
  if (!playing()) {
    if (role === 'guest' && performance.now() > waitingUntil) openMenu('Aymane did not start the mission in time.');
    return;
  }
  const local = actions.splice(0);
  if (role === 'guest') {
    if (clock % 3 === 0 || local.length) send({ type: 'input', move: movement(girlKeys), actions: local });
    return;
  }
  const other = remoteActions.splice(0);
  if (local.includes('KeyR') || other.includes('KeyR')) start(state.id);
  if (!state.finish && (local.includes('Escape') || other.includes('Escape'))) {
    state.paused = !state.paused;
    state.pauseReason = 'Esc to resume, or return to the mission menu.';
  }
  const moveB = role === 'host' ? (performance.now() - remote.received < 500 ? remote.move : [false, false, false]) : movement(girlKeys);
  step(state, movement(aimKeys), moveB, local, role === 'host' ? other : local);
  if (role === 'host' && clock % 3 === 0) snapshot();
  updateOverlay();
}

let audio, muted = false, nextBeat = 0, beat = 0;
function initAudio() {
  if (!audio) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context(), master = context.createGain();
    master.gain.value = muted ? 0 : .19;
    master.connect(context.destination);
    audio = { context, master };
  }
  if (audio.context.state === 'suspended') audio.context.resume().catch(() => {});
}
function note(pitch, length, type, volume, offset = 0, fall = 1) {
  if (!audio || muted) return;
  const { context, master } = audio;
  const time = context.currentTime + offset;
  const osc = context.createOscillator(), gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(pitch * fall, time + length);
  gain.gain.setValueAtTime(.001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + .012);
  gain.gain.exponentialRampToValueAtTime(.001, time + length);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + length + .02);
}
function playPianoKey(key) {
  const pitch = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25][key];
  note(pitch, .72, 'triangle', .46);
  note(pitch * 2, .28, 'sine', .11);
}
function playSound(name) {
  if (name === 'win') {
    [262, 330, 392, 523, 659, 784].forEach((p, i) => note(p, .35, 'triangle', .48, i * .115));
    return;
  }
  const sounds = {
    jump: [250, .15, 'triangle', .23, 1.85], respawn: [510, .27, 'triangle', .48, .23],
    equip: [178, .11, 'square', .14, 1.3], power: [430, .23, 'sine', .4, 2],
    whoosh: [780, .17, 'triangle', .31, .27], kiss: [440, .27, 'sine', .4, 1.9],
    pop: [620, .12, 'sine', .25, .48], bonk: [130, .2, 'square', .24, .29]
  };
  const [pitch, len, type, volume, fall] = sounds[name] || sounds.pop;
  note(pitch, len, type, volume, 0, fall);
}
function music() {
  if (!audio || !playing() || state.paused || muted || state.id === PIANO) return;
  const time = audio.context.currentTime;
  if (time < nextBeat) return;
  const chase = state.girls.some(p => p.alive) || state.id === 4 || state.t < state.kissUntil;
  nextBeat = time + (state.finish ? .23 : chase ? .128 : .17);
  const melody = state.finish ? [523, 659, 784, 1047, 784, 659, 587, 784] : [330, 392, 440, 330, 494, 392, 294, 349, 330, 523, 494, 392, 440, 349, 294, 392];
  const p = melody[beat % melody.length];
  if ((state.id === MEETUP || state.id === MALL) && !state.finish) {
    nextBeat = time + .38;
    note(p / 2, .48, 'sine', .19);
    beat++;
    return;
  }
  note(p, .1, 'triangle', .19);
  if (beat % 4 === 0) note(p / 4, .15, 'square', .11);
  if (beat % 2 === 1) note(125, .055, 'sine', .2, 0, .52);
  beat++;
}

function fill(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function ellipse(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function text(value, x, y, size, color = '#fff', align = 'left') {
  ctx.font = '800 ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}
function glyph(value, x, y, size, color) {
  text(value, x, y + size * .33, size, color, 'center');
}
const outfits = ['#ff825e', '#9a77ff', '#51dba8', '#60cfff'];
const hairstyles = ['#3a1f1c', '#e4a740', '#70354d', '#181b2f'];
const followerSheet = new Image();
const followerSprites = [];
followerSheet.onload = () => {
  const sheet = document.createElement('canvas');
  sheet.width = followerSheet.naturalWidth;
  sheet.height = followerSheet.naturalHeight;
  const pixels = sheet.getContext('2d', { willReadFrequently: true });
  pixels.drawImage(followerSheet, 0, 0);
  for (let i = 0; i < 4; i++) {
    const start = Math.floor(i * sheet.width / 4);
    const width = Math.floor((i + 1) * sheet.width / 4) - start;
    const data = pixels.getImageData(start, 0, width, sheet.height).data;
    let left = width, right = -1, top = sheet.height, bottom = -1;
    for (let y = 0; y < sheet.height; y++) for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 35) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    if (right >= left) followerSprites[i] = [start + left, top, right - left + 1, bottom - top + 1];
  }
};
followerSheet.src = 'followers.png';
function cartoon(i, stride) {
  const outfit = outfits[i], hair = hairstyles[i];
  fill(-9, -13, 6, 12 + stride, '#26223c');
  fill(3, -13, 6, 12 - stride, '#26223c');
  ellipse(0, -15, 12, 12, outfit);
  if (i === 0) ellipse(-11, -34, 7, 16, hair);
  if (i === 1) for (const x of [-12, 12]) ellipse(x, -39, 6, 8, hair);
  if (i === 2) ellipse(-3, -29, 15, 18, hair);
  if (i === 3) ellipse(2, -50, 8, 7, hair);
  ellipse(0, -38, 13, 12, hair);
  ellipse(2, -34, 11, 10, '#f4bd93');
  fill(-2, -38, 2, i % 2 ? 4 : 3, '#292235');
  fill(6, -38, 2, i % 2 ? 4 : 3, '#292235');
  ellipse(4, -30, 2 + i % 2, i % 2 ? 2 : 1, '#922957');
  ellipse(9, -33, 2, 1, '#fa8e9d');
}
function person(s, p, who, name, npc = false) {
  const stride = Math.sin(s.t * (.26 + (p.i || 0) * .012) + (p.i || 0));
  const running = Math.abs(p.vx) > .45;
  const sprite = coupleSprites.SPR[who]?.[1];
  const height = 58;
  ellipse(p.x, p.y + 2, 17, 4, '#120c2088');
  ctx.save();
  ctx.translate(p.x, p.y - (running ? Math.abs(stride) * 3 : 0));
  if (p.spin && p.spin > s.t) {
    ctx.globalAlpha = (p.spin - s.t) / 26;
    ctx.rotate((26 - (p.spin - s.t)) * .2);
  } else if (p.inv) {
    ctx.globalAlpha = s.t % 10 < 5 ? .55 : 1;
    if (p.inv > 65) ctx.rotate(Math.sin(s.t * .5) * .2);
  } else if (s.finish) {
    ctx.translate(0, -Math.abs(Math.sin(s.t * .16 + who)) * 19);
    ctx.rotate(Math.sin(s.t * .14 + who) * .17);
  } else if (running) ctx.rotate(stride * .055);
  ctx.scale(p.face || 1, 1);
  const follower = npc && p.alive !== undefined && followerSprites[p.i];
  if (follower) {
    const width = follower[2] * height / follower[3];
    ctx.drawImage(followerSheet, ...follower, -width / 2, -height, width, height);
  } else if (npc) cartoon(p.i, running ? stride * 4 : 0);
  else if (sprite) {
    const width = sprite.width * height / sprite.height;
    ctx.drawImage(sprite, -width / 2, -height, width, height);
  } else {
    fill(-10, -18, 20, 16, who ? '#4a2e27' : '#eae4db');
    ellipse(0, -31, 12, 13, '#f6cba3');
    ellipse(-2, -40, 13, 6, '#23181c');
  }
  if (p === s.b && s.bat) {
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, -22);
    ctx.lineTo(33, -49 + stride * 2);
    ctx.strokeStyle = '#452d40';
    ctx.lineWidth = 11;
    ctx.stroke();
    ctx.strokeStyle = '#ffc376';
    ctx.lineWidth = 7;
    ctx.stroke();
    ellipse(33, -49 + stride * 2, 4, 5, '#ffe09a');
  }
  ctx.restore();
  if (name) text(name, p.x, p.y - 69, 12, p === s.b ? '#ffe083' : '#e9faff', 'center');
  if (p.blush) glyph('♥', p.x + 17, p.y - 47, 18, '#ff95c5');
  if (p.shield) {
    ctx.beginPath();
    ctx.arc(p.x, p.y - 28, 36, 0, Math.PI * 2);
    ctx.strokeStyle = '#91faffaa';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  if (p === s.a && s.id === 1) glyph('💐', p.x + p.face * 19, p.y - 33, 30, '#ffee91');
  if (p === s.a && s.id === 3 && s.signal > s.t) glyph('✦', p.x, p.y - 73, 26, '#ffe07b');
  if (p === s.b && s.charge) glyph('♥', p.x + p.face * 15, p.y - 37, 23 + Math.sin(s.t * .4) * 5, '#ff73ba');
}
function backdrop(s, left, width, offset) {
  const [, , accent, sky] = missions[s.id];
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#15132c');
  gradient.addColorStop(1, sky);
  fill(left, 0, width, H, gradient);
  ellipse(left + width * .72, 163, 52, 52, accent + '35');
  ellipse(left + width * .72, 163, 42, 42, accent + '66');
  for (let i = 0; i < 35; i++) {
    const x = left + ((i * 121 + 13000 - offset * .12) % width);
    glyph(i % 4 ? '·' : '✦', x, 79 + i * 29 % 250, 8 + i % 5 * 2, accent + 'a9');
  }
  for (let i = 0; i < Math.ceil(width / 44) + 2; i++) {
    const x = left + i * 44 - offset * .27 % 44;
    const h = 43 + (i * 71 % 99);
    fill(x, 463 - h, 35, h + 90, '#1e1634b8');
    for (let j = 0; j < 3; j++) fill(x + 8 + j * 7, 478 - h, 3, 8, accent + '55');
  }
  if (s.id === 5) {
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(left + width * i / 5, 0);
      ctx.rotate(Math.sin(s.t * .027 + i) * .65);
      fill(-21, 0, 42, 610, ['#fb72c028', '#8e79ff35', '#62fff625'][i % 3]);
      ctx.restore();
    }
  }
}
function scenery(s) {
  const [, , accent] = missions[s.id];
  for (const p of surfaces(s)) {
    const ground = p.y === FLOOR && !p.bridge;
    const color = ground ? '#28203a' : p.bridge ? '#885f67' : p.bounce ? '#e28164' : '#3c315c';
    fill(p.x, p.y, p.w, ground ? 180 : 16, color);
    fill(p.x, p.y, p.w, 4, s.id === 5 && !ground ? 'hsl(' + (s.t * 3 + p.x) % 360 + ' 80% 68%)' : accent);
    for (let x = p.x + 12; x < p.x + p.w - 5; x += ground ? 44 : 22) {
      fill(x, p.y + 9, ground ? 11 : 6, 3, '#ffffff24');
      if (p.bridge && p.y < FLOOR) fill(x, p.y + 15, 2, 14, '#ac839655');
    }
  }
  for (const q of s.switches) {
    if (q.gate && !q.on) {
      fill(q.gate - 9, 145, 18, FLOOR - 145, '#422c56');
      for (let y = 160; y < FLOOR; y += 27) fill(q.gate - 6, y, 12, 5, accent);
    }
    fill(q.x - 9, FLOOR - 26, 18, 26, '#2a253d');
    fill(q.x - 12, FLOOR - 32, 24, 12, q.on ? '#9cffbb' : '#ffe276');
    text(q.on ? '✓' : 'E', q.x, FLOOR - 45, 15, '#ffe783', 'center');
    if (q.pad) {
      fill(q.pad - 40, FLOOR - 7, 80, 7, '#ff8dcc');
      text('KAOUTAR', q.pad, FLOOR - 13, 11, '#ffc9e9', 'center');
    }
  }
  if (s.id === 5) for (const [a, b] of [[730, 1080], [1990, 2210]]) {
    fill(a, FLOOR - 140, b - a, 140, s.t % 260 < 95 ? '#f6a1fc38' : '#bca3f619');
    text(s.t % 260 < 95 ? 'REVERSE BEAT!' : 'NORMAL BEAT', (a + b) / 2, FLOOR - 114, 16, '#f9d1ff', 'center');
  }
  if (s.id === 6) for (const x of [1190, 1590, 2210]) {
    glyph('?', x, FLOOR - 36, 25, '#b7a5ff');
    fill(x - 18, FLOOR - 4, 36, 4, '#96a1c0');
  }
  if (s.id === 2 || s.id === 7) {
    for (const x of [600, 1380, 2070, 2940].filter(x => x < s.width - 190)) glyph('✦', x, FLOOR - 24, 22, '#8ffaff');
    if (s.id === 2) for (const x of [850, 1720]) {
      fill(x - 60, FLOOR - 105, 120, 105, '#9affca20');
      fill(x - 60, FLOOR - 105, 120, 5, '#95f6c8');
      text('SHELTER', x, FLOOR - 115, 12, '#afffdf', 'center');
    }
  }
  if (s.id === MEETUP) {
    const center = s.width / 2;
    for (const x of [center - 96, center + 96]) {
      fill(x - 2, FLOOR - 126, 4, 126, '#262334');
      ellipse(x, FLOOR - 125, 36, 35, '#ffe3a824');
      ellipse(x, FLOOR - 125, 13, 8, '#ffe1a5');
      ellipse(x, FLOOR + 12, 33, 4, '#ffe1a52c');
    }
    glyph('♥', center, FLOOR - 111, 18, '#ffc8db');
    return;
  }
  fill(s.width - 190, FLOOR - 158, 180, 158, '#bbf9da22');
  fill(s.width - 190, FLOOR - 158, 180, 5, '#a9f7d0');
  text(s.id === 7 ? 'PARTY ZONE' : s.id === 2 ? 'SAFE SHELTER' : 'FINISH', s.width - 100, FLOOR - 132, 15, '#b6fce0', 'center');
  if (s.id === 7) {
    for (let i = 0; i < 8; i++) glyph(i % 2 ? '♥' : '✦', s.width - 186 + i * 22, FLOOR - 98 + i % 3 * 20, 17, i % 2 ? '#ff97cb' : '#ffe279');
  }
  if (s.id === 4) {
    ctx.save();
    ctx.translate(s.pizza, FLOOR - 72 + (s.t < s.pizzaSleep ? 134 : 0));
    ctx.rotate(s.pizza / 70);
    ellipse(0, 0, 72, 72, '#9e594b');
    ellipse(0, 0, 64, 64, '#ffb064');
    ellipse(0, 0, 57, 57, '#ffdb6e');
    for (let i = 0; i < 9; i++) ellipse(Math.cos(i * 2.4) * (18 + i * 4), Math.sin(i * 2.4) * (18 + i * 4), 8, 8, '#e2645f');
    ctx.restore();
  }
}
function drawPiano(s) {
  fill(pianoLeft - 10, FLOOR - 10, pianoKeyWidth * 8 + 20, 103, '#1c1428');
  pianoKeys.forEach((label, i) => {
    const x = pianoLeft + i * pianoKeyWidth;
    const light = s.piano.lights[i];
    fill(x + 2, FLOOR, pianoKeyWidth - 4, 70,
      light && light.until > s.t ? pianoColors[light.player] : i % 2 ? '#e7dbeb' : '#fff4f1');
    fill(x + 2, FLOOR + 65, pianoKeyWidth - 4, 5, '#aa92b7');
    text(label, x + pianoKeyWidth / 2, FLOOR + 42, 20, '#271a37', 'center');
  });
}
function drawPianoHud(s) {
  const { phase, progress } = s.piano;
  const title = phase === 'free' ? 'FREE PLAY · Jump on any key' :
    phase === 'demo' ? 'LISTEN · Your duet is playing' : 'YOUR TURN · Echo the duet';
  fill(160, 86, 640, 132, '#20152eea');
  text(title, W / 2, 115, 20, '#f6deff', 'center');
  pianoParts.forEach((part, player) => {
    const x = player ? 655 : 305;
    text(player ? 'KAOUTAR' : 'AYMANE', x, 147, 14, pianoColors[player], 'center');
    part.forEach((key, index) => {
      const left = x - 83 + index * 58;
      const light = s.piano.lights[key];
      const active = phase === 'demo' && light?.player === player && light.until > s.t;
      const done = progress[player] > index;
      fill(left, 159, 50, 38, active || done ? pianoColors[player] : '#3e2c50');
      text(pianoKeys[key], left + 25, 184, 15, active || done ? '#271a37' : '#fff4ff', 'center');
    });
  });
}
function mallShade(y, end, top, bottom) {
  const gradient = ctx.createLinearGradient(0, y, 0, end);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  return gradient;
}
function mallShape(points, color) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
function mallStore(x, title, color) {
  fill(x - 182, 220, 364, 244, '#2a1e33');
  mallShape([[x - 182, 220], [x - 160, 232], [x - 160, 453], [x - 182, 464]], '#4d354b');
  mallShape([[x + 182, 220], [x + 160, 232], [x + 160, 453], [x + 182, 464]], '#171422');
  fill(x - 160, 230, 320, 48, color);
  fill(x - 160, 230, 320, 3, '#ffffff9c');
  fill(x - 160, 272, 320, 6, '#37234166');
  text(title, x, 260, 24, '#261a33', 'center');
  const glass = mallShade(285, 445, '#c1e2e9', '#657590');
  fill(x - 151, 285, 133, 157, glass);
  fill(x + 63, 285, 87, 157, glass);
  fill(x - 8, 285, 62, 178, mallShade(285, 463, '#191621', '#634359'));
  fill(x + 45, 364, 4, 18, '#ffe1a1');
  for (const [left, right] of [[x - 151, x - 18], [x + 63, x + 150]]) {
    fill(left, 411, right - left, 29, '#e7d0ce50');
    mallShape([[left + 7, 288], [left + 31, 288], [right - 16, 437], [right - 36, 437]], '#fffcff34');
    fill(left, 441, right - left, 6, '#e4b790');
  }
}
function mallPlant(x) {
  ellipse(x, FLOOR - 1, 27, 5, '#2e243380');
  mallShape([[x - 15, 431], [x + 15, 431], [x + 10, 460], [x - 10, 460]], '#a76a67');
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(x + i * 6, 420 + Math.abs(i) * 5);
    ctx.rotate(i * .47);
    ellipse(0, -11, 6, 17, i % 2 ? '#609184' : '#85ab8a');
    ctx.restore();
  }
}
function mallArchitecture(s) {
  fill(0, 145, s.width, FLOOR - 145, mallShade(145, FLOOR, '#69465d', '#ce9d93'));
  fill(0, 210, s.width, 18, '#35263968');
  fill(0, 196, s.width, 13, '#e6b498');
  fill(0, 197, s.width, 3, '#fff2c8');
  fill(0, FLOOR, s.width, H - FLOOR, mallShade(FLOOR, H, '#c3a29d', '#62516a'));
  for (let x = 0; x < s.width; x += 180) {
    fill(x, 156, 112, 27, '#3d314e');
    fill(x + 4, 159, 103, 14, '#ce9baa55');
    fill(x + 54, 154, 3, 33, '#d4b7b9');
    mallShape([[x + 25, 463], [x + 120, 463], [x + 158, H], [x - 3, H]], '#fff0d81c');
    mallShape([[x + 126, 462], [x + 128, 462], [x + 177, H], [x + 174, H]], '#4a364963');
  }
  for (const y of [469, 487, 517, 539]) fill(0, y, s.width, 1, '#49384d72');
  for (const x of [454, 1040, 1640, 2180]) {
    fill(x - 16, 212, 33, 247, mallShade(212, 459, '#f2cbac', '#a77578'));
    fill(x + 10, 212, 7, 247, '#68475d');
    fill(x - 22, 449, 46, 12, '#996d72');
    mallPlant(x + 46);
  }
}
function drawMall(s) {
  mallArchitecture(s);
  fill(105, 237, 300, 43, '#46314c');
  fill(105, 237, 300, 2, '#f6c98a');
  for (const x of [175, 255, 335]) {
    ellipse(x, 327, 34, 28, '#cf9fa179');
    fill(x - 24, 396, 48, 41, '#8f6474');
    fill(x - 24, 396, 48, 4, '#f4c2a1');
  }
  text('MALL', 255, 261, 33, '#ffe5a5', 'center');
  glyph('🛍️', 255, 345, 49, '#fbc7ed');

  const salon = mallStops[1].x, clothes = mallStops[2].x, food = mallStops[3].x;
  mallStore(salon, 'محل البشير', '#ffc4dc');
  text('NAIL SALON', salon - 85, 312, 13, '#342245', 'center');
  for (let i = 0; i < 3; i++) {
    person(s, { i, x: salon - 129 + i * 41, y: 420, face: 1, vx: 0, alive: true }, 0, '', true);
  }
  glyph('💅', salon + 106, 348, 36, '#cf2549');
  mallStore(clothes, 'CLOTHES & CO.', '#cbbdff');
  glyph('👗', clothes - 86, 351, 46, '#9871d6');
  glyph('👕', clothes + 103, 351, 44, '#9871d6');
  fill(food - 184, 229, 368, 205, mallShade(229, 434, '#3f3048', '#83586b'));
  fill(food - 175, 235, 350, 44, '#664550');
  text('FOOD COURT', food, 265, 29, '#ffe0a4', 'center');
  for (const [offset, title, icon] of [[-99, 'BURGER', '🍔'], [99, 'BRIWAT', '▲']]) {
    const x = food + offset;
    fill(x - 55, 294, 110, 76, '#f3d8a9');
    text(title, x, 316, 13, '#5d3942', 'center');
    glyph(icon, x, 342, 24, '#be7541');
  }
  fill(food - 157, 393, 314, 38, '#986477');
  fill(food - 161, 391, 322, 7, '#f6d2a9');
  for (const offset of [-111, 0, 111]) {
    fill(food + offset, 279, 2, 30, '#2f203b');
    ellipse(food + offset, 310, 18, 5, '#ffd59d');
  }
  fill(food - 175, 276, 350, 6, '#ffe0a4');
  for (const x of [food - 45, food + 45]) {
    fill(x - 13, FLOOR - 28, 26, 7, '#af6b88');
    fill(x - 13, FLOOR - 21, 4, 21, '#462b48');
    fill(x + 9, FLOOR - 21, 4, 21, '#462b48');
  }
  const motion = mallLine(s)?.[3];
  if (motion === 'serve') {
    person(s, { i: 3, x: food + 89, y: FLOOR, face: -1, vx: 0 }, 0, 'WAITER', true);
  }
}
function drawMallPlayers(s) {
  const motion = mallLine(s)?.[3];
  const hiddenA = motion === 'clothesWait';
  const hiddenB = hiddenA || motion === 'salonWait';
  const seated = ['seated', 'serve', 'eat'].includes(motion);
  const drawActor = (p, who, name) => {
    ctx.save();
    if (seated) {
      ctx.translate(0, FLOOR * .2 - 16);
      ctx.scale(1, .8);
    }
    person(s, p, who, name);
    ctx.restore();
  };
  if (!hiddenA) drawActor(s.a, 0, 'AYMANE');
  if (!hiddenB) drawActor(s.b, 1, 'KAOUTAR');
  if (motion === 'kiss') glyph('💋', (s.a.x + s.b.x) / 2, FLOOR - 85, 28, '#ff88bb');
  if (motion === 'nails') {
    glyph('💅', s.b.x - 14, FLOOR - 98, 36, '#e3294d');
    for (let i = 0; i < 3; i++) ellipse(s.b.x + 10 + 8 * i, FLOOR - 103, 3, 6, '#ed284d');
  }
  if (motion === 'bags') glyph('🛍️', s.b.x + 25, FLOOR - 23, 24, '#ffc7e6');
  if (seated) {
    const x = mallStops[3].x;
    fill(x - 34, FLOOR - 33, 68, 8, '#f4bc90');
    fill(x - 4, FLOOR - 25, 8, 25, '#483146');
    if (motion === 'serve' || motion === 'eat') {
      const bite = motion === 'eat' ? Math.max(0, Math.sin((s.t - s.mall.since) / 11)) : 0;
      glyph('🍔', x - 18 - bite * 22, FLOOR - 44 - bite * 15, 20, '#ffdb9f');
      ellipse(x + 17, FLOOR - 35, 12, 3, '#f7d3b5');
      text('▲▲', x + 17 + bite * 22, FLOOR - 36 - bite * 15, 12, '#ffb94d', 'center');
    }
  }
}
function scene(s, left, width, offset, scale) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, 0, width, H);
  ctx.clip();
  backdrop(s, left, width, offset);
  ctx.translate(left - offset * scale, FLOOR * (1 - scale));
  ctx.scale(scale, scale);
  if (s.id === PIANO) drawPiano(s);
  else if (s.id === MALL) drawMall(s);
  else scenery(s);
  s.drops.forEach(p => {
    if (p.topping) ellipse(p.x, p.y, 15, 11, '#ff8261');
    else glyph('♥', p.x, p.y, 58, '#fb83bf');
  });
  for (const p of s.decoys) person(s, p, s.id === 6 ? 1 : 0, '', s.id === 5);
  for (const p of s.girls) if (p.alive || p.spin > s.t) person(s, p, 0, '', true);
  if (s.id === MALL) drawMallPlayers(s);
  else {
    person(s, s.a, 0, s.id === 3 && s.t >= s.signal ? '' : 'AYMANE');
    person(s, s.b, 1, 'KAOUTAR');
  }
  for (const p of s.hearts) {
    if (p.delay) continue;
    for (let i = 3; i > 0; i--) glyph('♥', p.x - p.vx * i, p.y - p.vy * i, 12 + (3 - i) * 2, '#ff80bb55');
    glyph(p.kiss ? '💋' : '♥', p.x, p.y, p.kiss ? 29 : 32, '#ff85c5');
  }
  for (const p of s.sparks) {
    ctx.globalAlpha = Math.min(1, p.life / 22);
    fill(p.x, p.y, 4, 4, p.color);
  }
  ctx.restore();
  if ([1, 2, MEETUP, 7].includes(s.id)) rain(s, left, width);
}
function rain(s, left, width) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, 0, width, H);
  ctx.clip();
  ctx.strokeStyle = s.id === MEETUP ? '#cdeaff62' : '#cdeaff49';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < width / 8; i++) {
    const x = left + ((i * 103 + 9 * s.t) % width);
    const y = (i * 59 + (11 + i % 4) * s.t) % FLOOR;
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y + 11 + i % 10);
  }
  ctx.stroke();
  ctx.restore();
}
function drawDialogue(s) {
  const [speaker, line] = dialogue[s.dialogueLine];
  if (s.dialogueLine === 5) {
    glyph('💼', W / 2 - 22, FLOOR - 80, 36, '#ffc993');
  }
  drawSpeech(speaker, line, 'E · Next line');
}
function drawSpeech(speaker, line, hint) {
  fill(94, 87, 772, 143, '#181124f1');
  text(speaker, 824, 117, 20, '#ffd39a', 'right');
  ctx.save();
  ctx.direction = 'rtl';
  ctx.font = '800 24px system-ui, sans-serif';
  const words = line.split(' ');
  let row = '';
  let y = 153;
  for (const word of words) {
    const next = row ? row + ' ' + word : word;
    if (row && ctx.measureText(next).width > 540) {
      text(row, 824, y, 24, '#fff', 'right');
      y += 28;
      row = word;
    } else row = next;
  }
  if (row) text(row, 824, y, 24, '#fff', 'right');
  ctx.restore();
  if (hint) text(hint, 117, 212, 12, '#d3bcdd');
}
let splitCamera = [null, null];
function draw() {
  const s = state;
  const separate = role === 'local' && Math.abs(s.a.x - s.b.x) > 820 && playing();
  const mine = role === 'guest' ? s.b : s.a;
  const focus = role === 'local' ? (s.a.x + s.b.x) / 2 : mine.x;
  const targetZoom = s.id === PIANO ? 1 : role === 'local' ? clamp(760 / (Math.abs(s.a.x - s.b.x) + 180), .78, 1) : 1;
  zoom = cameraReset ? targetZoom : zoom + (targetZoom - zoom) * .085;
  const target = clamp(focus - W / zoom / 2, 0, s.width - W / zoom);
  camera = cameraReset ? target : camera + (target - camera) * .12;
  if (separate) {
    [s.a, s.b].forEach((p, i) => {
      const target = clamp(p.x - 240, 0, s.width - 480);
      const old = splitCamera[i];
      splitCamera[i] = cameraReset || old === null ? target : old + (target - old) * .14;
      scene(s, 480 * i, 480, splitCamera[i], 1);
    });
    fill(478, 0, 4, H, '#f9b2d7');
  } else {
    splitCamera = [null, null];
    scene(s, 0, W, camera, zoom);
  }
  cameraReset = false;
  if (!playing()) return;
  fill(0, 0, W, 70, '#160f24eb');
  const [, , accent, , goal] = missions[s.id];
  if (s.id === MEETUP && s.dialogueLine >= 0) drawDialogue(s);
  text(String(missionNumber(s.id)).padStart(2, '0') + ' / ' + missions[s.id][0], 20, 26, 21, accent);
  if (s.id === MALL) {
    const cue = mallLine(s);
    if (cue?.[1]) drawSpeech(cue[1], cue[2]);
    const waiting = cue?.[3] === 'salonWait' ? 'Kaoutar is getting her nails done…' :
      cue?.[3] === 'clothesWait' ? 'Picking out clothes…' : 'Mall date in progress';
    text(s.finish ? 'DATE COMPLETE! ♥' : cue ? waiting : s.mall.approaching ? 'Kaoutar is coming over…' : mallStops[s.mall.stop].hint, 20, 51, 14, '#eee3f4');
    return;
  }
  const instruction = s.id === PIANO && s.piano.phase === 'echo'
    ? 'Any key still plays. Match your notes in order to finish. E · Hear it again.'
    : goal;
  text(instruction, 20, 51, 14, '#eee3f4');
  if (s.id === PIANO) {
    if (!s.finish) drawPianoHud(s);
    else text('DUET COMPLETE!', W / 2, 115, 25, '#f6deff', 'center');
    return;
  }
  if (s.girls.length) text('GIRLS REMAINING: ' + s.girls.filter(p => p.alive).length + '/4', W - 20, 26, 15, '#ffb2d0', 'right');
  if (s.id === 1 || s.id === 4 || s.id === 5 || s.id === 6 || s.id === 7) text('SWITCHES ' + s.switches.filter(q => q.on).length + '/' + s.switches.length, W - 20, 51, 12, '#ffe184', 'right');
  if (s.noticeUntil > s.t) {
    fill(148, 82, 664, 42, '#241330e8');
    text(s.notice, W / 2, 110, 22, accent, 'center');
  }
  fill(0, 494, W, 46, '#150e21f5');
  const cooldown = (key, label, until, x) => text(key + '  ' + label + (until > s.t ? ' ' + ((until - s.t) / 60).toFixed(1) + 's' : ''), x, 522, 13, until > s.t ? '#bbafc9' : '#ffe08f');
  cooldown('M', 'Heart Storm', s.heartUntil, 20);
  cooldown('K', 'Kiss Chase', s.kissReady, 170);
  text('L  ⚾ Bat ' + (s.bat ? 'ON' : 'OFF') + ' · J stow', 315, 522, 13, s.bat ? '#ffbf75' : '#e1cce5');
  text('R restart · V ' + (muted ? 'unmute' : 'mute') + ' · Esc pause', 500, 522, 12, '#e1cce5');
  if (s.id !== 3) {
    fill(740, 514, 193, 5, '#4f3c65');
    for (const [p, color] of [[s.a, '#91dcff'], [s.b, '#ffe683']]) {
      ellipse(740 + p.x / s.width * 193, 516, 5, 5, color);
    }
  }
}
let last = performance.now(), accumulator = 0;
function loop(now) {
  accumulator += Math.min(90, now - last);
  last = now;
  while (accumulator >= 1000 / 60) {
    tick();
    accumulator -= 1000 / 60;
  }
  draw();
  music();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
