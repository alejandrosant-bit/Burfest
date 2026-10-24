// Audio con Web Audio. Todos los sonidos se sintetizan por código (provisionales,
// se pueden reemplazar por archivos reales en `sounds`).
//
// Cadena: mundo → paso bajo → (seco + reverb) → master   ← se "ahoga" en el golpe y el desmayo
//         interior (latido, pitido, música, interfaz) → master   ← no se ahoga

import { clamp } from './time.js';

const SR = 44100;
let ctx = null;
let rnd = 1998;
const noise = () => { rnd = (rnd * 16807) % 2147483647; return (rnd / 2147483647) * 2 - 1; };

function buffer(seconds, gen, { loop = false, fade = 0.4 } = {}) {
  const n = Math.floor(SR * seconds);
  const extra = loop ? Math.floor(SR * fade) : 0;
  const tmp = new Float32Array(n + extra);
  for (let i = 0; i < n + extra; i++) tmp[i] = gen(i / SR, i);
  // Bucle sin clic: mezcla el sobrante del final con el principio.
  if (loop) for (let i = 0; i < extra; i++) { const k = i / extra; tmp[i] = tmp[i] * k + tmp[n + i] * (1 - k); }
  const b = ctx.createBuffer(1, n, SR);
  b.copyToChannel(tmp.subarray(0, n), 0);
  return b;
}

const TAU = Math.PI * 2;
const soft = (x) => Math.tanh(x);
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

const synth = {
  rifle() {
    let lp = 0;
    return buffer(2.2, (t) => {
      lp += (noise() - lp) * 0.04;
      const crack = noise() * Math.exp(-t * 55);
      const body = Math.sin(TAU * 52 * t * (1 - 0.25 * t)) * Math.exp(-t * 11);
      const tail = lp * Math.exp(-t * 2.4) * 3;
      return soft((crack * 0.9 + body * 0.9 + tail * 0.7) * 1.3) * 0.95;
    });
  },
  pistol() {
    let lp = 0;
    return buffer(1.3, (t) => {
      lp += (noise() - lp) * 0.06;
      return soft((noise() * Math.exp(-t * 80) + Math.sin(TAU * 80 * t) * Math.exp(-t * 18) * 0.7 + lp * Math.exp(-t * 4) * 2) * 1.2) * 0.85;
    });
  },
  impact() {
    return buffer(0.6, (t) => soft(Math.sin(TAU * 70 * t) * Math.exp(-t * 20) * 1.6 + noise() * Math.exp(-t * 90) * 0.8));
  },
  heartbeat() { // 1 s = 60 ppm; se acelera con playbackRate
    const thump = (t) => (t < 0 ? 0 : Math.sin(TAU * 48 * t) * Math.exp(-t * 16));
    return buffer(1, (t) => soft((thump(t) + 0.7 * thump(t - 0.28)) * 1.4) * 0.9);
  },
  tinnitus() { return buffer(1, (t) => Math.sin(TAU * 3400 * t) * 0.22, { loop: true, fade: 0.05 }); },
  roomTone(warm = 0.02, level = 1) {
    let b = 0, b2 = 0;
    return buffer(6, () => { b += (noise() - b) * warm; b2 += (b - b2) * 0.5; return b2 * 6 * level; }, { loop: true });
  },
  murmur() { // ruido de gente: ruido de banda media con "sílabas"
    let a = 0, c = 0, env = 0, target = 0;
    return buffer(8, (t, i) => {
      if (i % 2200 === 0) target = Math.random() < 0.65 ? 0.3 + Math.random() * 0.7 : 0.1;
      env += (target - env) * 0.0015;
      a += (noise() - a) * 0.25; c += (a - c) * 0.06;
      return (a - c) * env * 2.2;
    }, { loop: true, fade: 1 });
  },
  scream(f0 = 700) {
    let ph = 0;
    return buffer(1.7, (t) => {
      const f = f0 * (1 - 0.25 * t) * (1 + 0.03 * Math.sin(TAU * 6 * t));
      ph += TAU * f / SR;
      let s = 0;
      for (let k = 1; k <= 7; k++) s += Math.sin(ph * k) * [0, 0.5, 0.8, 1, 0.6, 0.35, 0.2, 0.1][k];
      const env = Math.min(1, t / 0.08) * Math.exp(-Math.max(0, t - 0.9) * 4);
      return soft((s * 0.3 + noise() * 0.08) * env);
    });
  },
  bell() {
    return buffer(2.6, (t) => {
      const ring = Math.sin(TAU * 1480 * t) + 0.5 * Math.sin(TAU * 3710 * t);
      const clap = 0.55 + 0.45 * Math.abs(Math.sin(TAU * 13 * t));
      const env = Math.min(1, t / 0.02) * (t < 2.2 ? 1 : Math.exp(-(t - 2.2) * 12));
      return ring * clap * env * 0.22;
    });
  },
  jingle() { // jingle de concurso de TV de los 90
    const notes = [[72, 0], [76, 0.14], [79, 0.28], [84, 0.42], [79, 0.62], [84, 0.76]];
    const chord = [72, 76, 79, 84, 88];
    return buffer(3.4, (t) => {
      let s = 0;
      const voice = (f, tt, len) => {
        if (tt < 0 || tt > len) return 0;
        const env = Math.min(1, tt / 0.01) * Math.exp(-tt * 3) * (tt > len - 0.05 ? (len - tt) / 0.05 : 1);
        return (Math.sin(TAU * f * tt) + 0.35 * Math.sin(TAU * 2 * f * tt) + 0.18 * Math.sin(TAU * 3 * f * tt)) * env;
      };
      for (const [m, at] of notes) s += voice(midi(m), t - at, 0.16);
      if (t > 0.95) for (const m of chord) {
        const tt = t - 0.95;
        s += (Math.sin(TAU * midi(m) * tt * (1 + 0.002 * Math.sin(TAU * 5 * tt))) + 0.3 * Math.sin(TAU * 2 * midi(m) * tt)) * Math.exp(-tt * 0.9) * 0.45;
      }
      if (t > 0.9) s += noise() * Math.exp(-(t - 0.9) * 2.5) * 0.25; // platillo
      return soft(s * 0.35);
    });
  },
  click() { return buffer(0.05, (t) => (noise() * Math.exp(-t * 260) + Math.sin(TAU * 2100 * t) * Math.exp(-t * 120) * 0.3) * 0.6); },
  blip() { return buffer(0.16, (t) => Math.sin(TAU * 1760 * t) * Math.min(1, t / 0.01) * Math.exp(-t * 30) * 0.25); },
  monitorBeep() { return buffer(1, (t) => (t < 0.13 ? Math.sin(TAU * 980 * t) * Math.min(1, t / 0.005, (0.13 - t) / 0.01) * 0.3 : 0), { loop: true, fade: 0.01 }); },
  staticNoise() { return buffer(2, () => noise() * 0.35, { loop: true, fade: 0.05 }); },
  fan() { let b = 0; return buffer(3, (t) => { b += (noise() - b) * 0.08; return b * (0.8 + 0.2 * Math.sin(TAU * 4 * t)) * 1.5; }, { loop: true }); },
};

function makeReverbIR(seconds = 2.5) {
  const n = Math.floor(SR * seconds);
  const b = ctx.createBuffer(2, n, SR);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = noise() * Math.pow(1 - i / n, 3);
  }
  return b;
}

export const audio = {
  ready: false,
  sounds: {},
  loops: {},

  // Debe llamarse tras un gesto del usuario (clic en el menú).
  init() {
    if (this.ready) { ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);
    this.world = ctx.createGain();
    this.lowpass = ctx.createBiquadFilter(); this.lowpass.type = 'lowpass'; this.lowpass.frequency.value = 22000;
    this.dry = ctx.createGain();
    this.wet = ctx.createGain(); this.wet.gain.value = 0;
    this.reverb = ctx.createConvolver(); this.reverb.buffer = makeReverbIR();
    this.world.connect(this.lowpass);
    this.lowpass.connect(this.dry); this.dry.connect(this.master);
    this.lowpass.connect(this.reverb); this.reverb.connect(this.wet); this.wet.connect(this.master);
    this.inner = ctx.createGain(); this.inner.connect(this.master);

    const s = this.sounds;
    s.rifle = synth.rifle(); s.pistol = synth.pistol(); s.impact = synth.impact();
    s.heartbeat = synth.heartbeat(); s.tinnitus = synth.tinnitus();
    s.roomWarm = synth.roomTone(0.02, 1); s.roomCold = synth.roomTone(0.05, 0.6);
    s.murmur = synth.murmur(); s.bell = synth.bell(); s.jingle = synth.jingle();
    s.scream1 = synth.scream(720); s.scream2 = synth.scream(560); s.scream3 = synth.scream(880);
    s.click = synth.click(); s.blip = synth.blip(); s.monitor = synth.monitorBeep();
    s.static = synth.staticNoise(); s.fan = synth.fan();
    this.ready = true;
  },

  play(name, { vol = 1, rate = 1, inner = false, delay = 0 } = {}) {
    if (!this.ready || !this.sounds[name]) return null;
    const src = ctx.createBufferSource();
    src.buffer = this.sounds[name];
    src.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(inner ? this.inner : this.world);
    src.start(ctx.currentTime + delay);
    return src;
  },

  // Capas en bucle con nombre (ambiente, latido, pitido...). vol 0 la detiene.
  loop(key, name, vol, { fade = 1, rate = 1, inner = false } = {}) {
    if (!this.ready) return;
    let l = this.loops[key];
    const now = ctx.currentTime;
    if (l && l.name !== name) { this.loop(key, l.name, 0, { fade }); l = null; }
    if (!l && vol > 0) {
      const src = ctx.createBufferSource();
      src.buffer = this.sounds[name]; src.loop = true;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(g); g.connect(inner ? this.inner : this.world);
      src.start();
      l = this.loops[key] = { name, src, g };
    }
    if (!l) return;
    l.src.playbackRate.setTargetAtTime(rate, now, 0.3);
    l.g.gain.cancelScheduledValues(now);
    l.g.gain.setValueAtTime(l.g.gain.value, now);
    l.g.gain.linearRampToValueAtTime(vol, now + Math.max(0.01, fade));
    if (vol <= 0) {
      const dead = l; delete this.loops[key];
      setTimeout(() => { try { dead.src.stop(); } catch (e) { /* ya detenido */ } }, fade * 1000 + 100);
    }
  },

  stopLoops(fade = 0.8, keep = []) {
    for (const k of Object.keys(this.loops)) if (!keep.includes(k)) this.loop(k, this.loops[k].name, 0, { fade });
  },

  // 0 = normal, 1 = totalmente ahogado (paso bajo + reverb).
  muffle(amount, seconds = 0.5) {
    if (!this.ready) return;
    const a = clamp(amount, 0, 1);
    const now = ctx.currentTime;
    const f = 22000 * Math.pow(500 / 22000, a);
    this.lowpass.frequency.cancelScheduledValues(now);
    this.lowpass.frequency.setValueAtTime(this.lowpass.frequency.value, now);
    this.lowpass.frequency.exponentialRampToValueAtTime(f, now + Math.max(0.01, seconds));
    this.wet.gain.setTargetAtTime(a * 0.9, now, seconds / 3 + 0.01);
    this.dry.gain.setTargetAtTime(1 - a * 0.35, now, seconds / 3 + 0.01);
  },

  heartbeat(vol, bpm = 70, fade = 1) { this.loop('heart', 'heartbeat', vol, { fade, rate: bpm / 60, inner: true }); },
  tinnitus(vol, fade = 0.5) { this.loop('tinnitus', 'tinnitus', vol, { fade, inner: true }); },
};
