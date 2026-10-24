// Gestor global de interfaz y efectos de pantalla: fundidos, párpados, barras de cine,
// subtítulos, objetivo, intertítulos, vista CCTV y tarjeta final.

import { tween, wait, waitUntil, clock, lerp } from './time.js';
import { input } from './input.js';
import { audio } from './audio.js';

const $ = (id) => document.getElementById(id);
const el = {};
const state = { fade: 1, bars: 0, lids: 0, flash: 0 };

const SPEAKER_COLORS = {
  MATEO: '#9ec9ff',
  'ANDRÉS': '#ffb347',
  PROFESOR: '#cfcfcf',
  CAMILO: '#9be29b',
  TIRADOR: '#ff5a5a',
};

export const ui = {
  init() {
    for (const id of ['fade', 'flash', 'lidTop', 'lidBottom', 'barTop', 'barBottom', 'subtitle', 'subSpeaker', 'subText',
      'objective', 'objectiveText', 'prompt', 'promptText', 'titleCard', 'intertitle', 'cctv', 'cctvCam', 'cctvTime',
      'recBadge', 'endCard', 'demoBadge', 'clickHint', 'loading']) el[id] = $(id);
  },

  // Fundido a negro: 1 = negro, 0 = imagen.
  setFade(v) { state.fade = v; el.fade.style.opacity = v; },
  fade(to, seconds) { const from = state.fade; return tween(seconds, (t) => this.setFade(lerp(from, to, t))); },
  setFlash(v) { state.flash = v; el.flash.style.opacity = v; },
  flash(seconds = 0.6) { this.setFlash(1); return tween(seconds, (t) => this.setFlash(1 - t)); },

  setBars(v) { state.bars = v; const h = `${v * 11}vh`; el.barTop.style.height = h; el.barBottom.style.height = h; },
  bars(on, seconds = 0.6) { const from = state.bars; return tween(seconds, (t) => this.setBars(lerp(from, on ? 1 : 0, t))); },

  // Párpados: 0 abiertos, 1 cerrados.
  setLids(v) { state.lids = v; const h = `${v * 50.5}vh`; el.lidTop.style.height = h; el.lidBottom.style.height = h; },
  lids(to, seconds) { const from = state.lids; return tween(seconds, (t) => this.setLids(lerp(from, to, t))); },
  async blink(times = 1, speed = 0.12) {
    for (let i = 0; i < times; i++) { await this.lids(1, speed); await this.lids(0, speed * 1.4); }
  },

  // Subtítulo con nombre del personaje. Espera según la longitud; se puede adelantar.
  async say(speaker, text, { duration = 0, skippable = true } = {}) {
    this.showSubtitle(speaker, text);
    const dur = duration || Math.min(7, Math.max(2, 1.3 + text.length * 0.055));
    const start = clock.time;
    await waitUntil(() => clock.time - start >= dur || (skippable && clock.time - start > 0.35 && input.skip()));
    this.hideSubtitle();
    await wait(0.18);
  },
  showSubtitle(speaker, text) {
    const key = (speaker || '').toUpperCase();
    el.subSpeaker.textContent = speaker ? key : '';
    el.subSpeaker.style.color = SPEAKER_COLORS[key] || '#d9d9d9';
    el.subText.textContent = text;
    el.subtitle.classList.remove('hidden');
  },
  hideSubtitle() { el.subtitle.classList.add('hidden'); },

  setObjective(text) {
    if (!text) { el.objective.classList.add('hidden'); return; }
    el.objectiveText.textContent = text;
    el.objective.classList.remove('hidden');
    el.objective.style.opacity = 0;
    requestAnimationFrame(() => { el.objective.style.opacity = 1; });
  },

  showPrompt(text) {
    if (!text) { el.prompt.classList.add('hidden'); return; }
    el.promptText.textContent = text;
    el.prompt.classList.remove('hidden');
  },

  async titleCard(text, hold = 3.5) {
    el.titleCard.textContent = text;
    await tween(1.2, (t) => { el.titleCard.style.opacity = t; });
    await wait(hold);
    await tween(1.2, (t) => { el.titleCard.style.opacity = 1 - t; });
  },

  // Texto a máquina de escribir sobre negro.
  async intertitle(lines, { perChar = 0.045 } = {}) {
    const box = el.intertitle;
    box.style.opacity = 1;
    let done = '';
    const render = (cur) => { box.innerHTML = ''; box.textContent = done + cur; const c = document.createElement('span'); c.className = 'cursor'; c.textContent = '▌'; box.appendChild(c); };
    for (const line of lines) {
      let cur = '';
      let fast = false;
      for (const ch of line) {
        cur += ch;
        render(cur);
        if (ch !== ' ' && ch !== '.') audio.play('click', { vol: 0.5, rate: 0.9 + Math.random() * 0.2, inner: true });
        if (input.skip()) fast = true;
        if (!fast) await wait(ch === '.' ? perChar * 4 : perChar);
      }
      done += cur + '\n';
      render('');
      await wait(line === '...' ? 1.6 : 0.9);
    }
    await wait(2.2);
    await tween(1.5, (t) => { box.style.opacity = 1 - t; });
    box.textContent = '';
  },

  // Vista de cámara de vigilancia con reloj corriendo.
  showCCTV(on, cam = 'CAM 07 · HAB 312', start = new Date(1998, 9, 14, 3, 12, 44)) {
    el.cctv.classList.toggle('hidden', !on);
    el.cctvCam.textContent = cam;
    this._cctvStart = start;
    this._cctvT0 = clock.time;
  },

  flashRec() {
    el.recBadge.classList.remove('hidden');
    clearTimeout(this._recTimer);
    this._recTimer = setTimeout(() => el.recBadge.classList.add('hidden'), 1400);
  },

  async endCard(hold = 4) {
    el.endCard.classList.remove('hidden');
    el.endCard.style.opacity = 0;
    await tween(1.2, (t) => { el.endCard.style.opacity = t; });
    await wait(hold);
  },

  setDemoBadge(on) { el.demoBadge.classList.toggle('hidden', !on); },
  setClickHint(on) { el.clickHint.classList.toggle('hidden', !on); },
  setLoading(on) { el.loading.classList.toggle('hidden', !on); },

  // Limpia todo lo transitorio al cambiar de escena.
  reset() {
    this.hideSubtitle(); this.setObjective(null); this.showPrompt(null);
    this.setBars(0); this.setLids(0); this.setFlash(0);
    el.titleCard.style.opacity = 0; el.intertitle.textContent = '';
    el.endCard.classList.add('hidden'); this.showCCTV(false);
  },

  update() {
    if (!el.cctv.classList.contains('hidden')) {
      const d = new Date(this._cctvStart.getTime() + (clock.time - this._cctvT0) * 1000);
      const p = (n) => String(n).padStart(2, '0');
      el.cctvTime.textContent = `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }
  },
};
