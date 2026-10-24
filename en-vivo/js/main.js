// EN VIVO · demo para navegador. Bucle principal, carga de escenas, pausa, calidad y modo demo.

import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/environments/RoomEnvironment.js';
import { tick, abortAll, spawn, wait, clock, ABORT } from './core/time.js';
import { input } from './core/input.js';
import { ui } from './core/ui.js';
import { audio } from './core/audio.js';
import { Post } from './core/post.js';
import { CameraRig } from './core/camera.js';
import { setAnisotropy } from './world/build.js';
import { LINES } from './script.js';
import { clearObjective } from './player.js';
import aula from './scenes/aula.js';
import pasillo from './scenes/pasillo.js';
import cafeteria from './scenes/cafeteria.js';
import hospital from './scenes/hospital.js';

const SCENES = { aula, pasillo, cafeteria, hospital };
const ORDER = ['aula', 'pasillo', 'cafeteria', 'hospital'];

const QUALITY = {
  bajo: { label: 'Bajo', pr: 0.75, shadows: false, shadowSize: 1024, bloom: false, samples: 0, ao: false },
  medio: { label: 'Medio', pr: 1, shadows: true, shadowSize: 1024, bloom: true, samples: 2, ao: false },
  alto: { label: 'Alto', pr: Math.min(2, window.devicePixelRatio || 1), shadows: true, shadowSize: 2048, bloom: true, samples: 4, ao: true },
};

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
setAnisotropy(Math.min(8, renderer.capabilities.getMaxAnisotropy()));

const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 400);
const rig = new CameraRig(camera);
const post = new Post(renderer, camera);
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

input.init(canvas);
ui.init();

// Estado global accesible para las escenas.
export const G = {
  renderer, camera, rig, post, ui, audio, input,
  world: null, player: null, sceneName: null,
  paused: false, demo: false, inGame: false, loading: false,
  timeScale: Number(new URLSearchParams(location.search).get('vel')) || 1,
  quality: new URLSearchParams(location.search).get('calidad') || localStorage.getItem('envivo.quality') || 'medio',

  lines(key) { return LINES[key] || []; },

  // Reproduce un diálogo del guion. skippable: si el jugador puede adelantarlo.
  async say(key, { skippable = true, speakers = {} } = {}) {
    for (const [who, text] of this.lines(key)) {
      const ch = speakers[who];
      if (ch) ch.talking = true;
      try { await ui.say(who, text, { skippable: skippable && !this.demo }); } finally { if (ch) ch.talking = false; }
    }
  },

  // Cambia de escena con fundido. No resuelve nunca para el que la llama (su escena muere).
  goto(name, { fade = 1.2 } = {}) {
    spawn(() => this._load(name, fade));
    return new Promise(() => {});
  },

  async _load(name, fade) {
    if (this.loading) return;
    this.loading = true;
    if (this.world) { try { await ui.fade(1, fade); } catch (e) { if (e !== ABORT) throw e; } }
    abortAll();
    ui.setFade(1);
    ui.reset();
    clearObjective();
    audio.stopLoops(0.6, ['heart', 'tinnitus']);
    audio.muffle(0, 0.1);
    post.setBlur(0);
    if (this.world) { this.world.dispose(); }
    this.world = null; this.player = null;
    ui.setLoading(true);
    await new Promise((r) => setTimeout(r, 30));
    const S = SCENES[name];
    const ctx = S.build(this);
    this.world = ctx.world;
    this.world.scene.environment = envTex;
    // El entorno genérico ilumina de más: lo usamos sólo para brillos especulares suaves.
    this.world.scene.traverse((o) => {
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) if (m.isMeshStandardMaterial && !m.userData.envScaled) { m.envMapIntensity *= ctx.envScale ?? 0.22; m.userData.envScaled = true; }
    });
    this.world.finalize();
    this.player = ctx.player;
    this.player.demo = this.demo;
    rig.autoFollow = this.demo;
    ui.setDemoBadge(this.demo);
    rig.colliders = this.world.colliders;
    post.setScene(this.world.scene, camera);
    applyQuality();
    renderer.compile(this.world.scene, camera);
    ui.setLoading(false);
    this.sceneName = name;
    this.loading = false;
    spawn(() => S.run(this, ctx));
  },

  next() { const i = ORDER.indexOf(this.sceneName); return this.goto(ORDER[(i + 1) % ORDER.length]); },
};
window.EN_VIVO = G; // depuración desde la consola

// ---------- Calidad ----------

function applyQuality() {
  const q = QUALITY[G.quality];
  renderer.setPixelRatio(q.pr);
  post.setBloom(q.bloom);
  post.setAO(q.ao);
  post.composer.renderTarget1.samples = q.samples;
  post.composer.renderTarget2.samples = q.samples;
  if (G.world) {
    G.world.scene.traverse((o) => {
      if (o.isLight && o.shadow) {
        if (o.userData.wantShadow === undefined) o.userData.wantShadow = o.castShadow;
        o.castShadow = q.shadows && o.userData.wantShadow;
        if (o.isDirectionalLight && o.castShadow && o.shadow.mapSize.x !== q.shadowSize) {
          o.shadow.mapSize.set(q.shadowSize, q.shadowSize);
          o.shadow.map?.dispose(); o.shadow.map = null;
        }
      }
    });
  }
  resize();
  document.querySelectorAll('.q').forEach((e) => { e.textContent = q.label; });
  localStorage.setItem('envivo.quality', G.quality);
}

function cycleQuality() {
  const keys = Object.keys(QUALITY);
  G.quality = keys[(keys.indexOf(G.quality) + 1) % keys.length];
  applyQuality();
}

function resize() {
  const w = innerWidth, h = innerHeight;
  const pr = QUALITY[G.quality].pr;
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  post.setSize(w, h, pr);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

// ---------- Menús ----------

function setDemo(on) {
  G.demo = on;
  if (G.player) G.player.demo = on;
  rig.autoFollow = on;
  ui.setDemoBadge(on && G.inGame);
  document.querySelectorAll('.d').forEach((e) => { e.textContent = on ? 'Sí' : 'No'; });
}

function setPaused(p) {
  if (!G.inGame) return;
  G.paused = p;
  document.getElementById('pause').classList.toggle('hidden', !p);
  if (audio.ready) (p ? audio.ctx.suspend() : audio.ctx.resume());
  if (p) input.unlock(); else if (!G.demo) input.lock();
}

function startGame(demo, scene = 'aula') {
  audio.init();
  document.getElementById('menu').classList.add('hidden');
  G.inGame = true;
  setDemo(demo);
  if (!demo) input.lock();
  G.goto(scene, { fade: 0.1 });
}

function backToMenu() {
  abortAll();
  G.inGame = false; G.paused = false;
  document.getElementById('pause').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  if (G.world) G.world.dispose();
  G.world = null; G.player = null;
  ui.reset(); ui.setFade(1); ui.setDemoBadge(false);
  audio.stopLoops(0.5); audio.tinnitus(0, 0.3); audio.heartbeat(0, 70, 0.3);
  if (audio.ready) audio.ctx.resume();
  input.unlock();
}
G.backToMenu = backToMenu;

document.getElementById('menu').addEventListener('click', (e) => {
  const act = e.target.closest('button')?.dataset.act;
  if (act === 'play') startGame(false);
  if (act === 'autodemo') startGame(true);
  if (act === 'quality') cycleQuality();
});
document.getElementById('pause').addEventListener('click', (e) => {
  const act = e.target.closest('button')?.dataset.act;
  if (act === 'resume') setPaused(false);
  if (act === 'quality') cycleQuality();
  if (act === 'demo') setDemo(!G.demo);
  if (act === 'menu') backToMenu();
});
canvas.addEventListener('click', () => { if (G.inGame && !G.paused && !G.demo) input.lock(); });
document.addEventListener('pointerlockchange', () => {
  // Esc en el navegador suelta el ratón sin enviar la tecla: lo tratamos como pausa.
  if (!input.locked && G.inGame && !G.paused && !G.demo && G.player && !G.loading) setPaused(true);
});

// Estática animada de fondo del menú
const ms = document.getElementById('menuStatic');
const msc = ms.getContext('2d');
ms.width = 160; ms.height = 90;
const msImg = msc.createImageData(160, 90);
function menuStatic() {
  if (document.getElementById('menu').classList.contains('hidden')) return;
  for (let i = 0; i < msImg.data.length; i += 4) { const v = Math.random() * 255; msImg.data[i] = msImg.data[i + 1] = msImg.data[i + 2] = v; msImg.data[i + 3] = 255; }
  msc.putImageData(msImg, 0, 0);
}

// ---------- Bucle ----------

let last = performance.now();
let fpsAcc = 0, fpsN = 0;
G.fps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  input.beginFrame();
  const real = Math.min(0.05, (now - last) / 1000);
  last = now;
  fpsAcc += real; fpsN++;
  if (fpsAcc > 1) { G.fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }

  if (G.inGame) {
    if (input.pause() && !G.loading) setPaused(!G.paused);
    if (input.hit('F9')) setDemo(!G.demo);
  }
  const dt = G.paused || !G.inGame ? 0 : real * G.timeScale;
  tick(dt);

  if (G.world && G.inGame) {
    const w = G.world;
    w.update(dt, clock.time);
    if (G.player) G.player.update(dt);
    for (const c of w.chars) if (!G.player || c !== G.player.char) {
      c.lowFreq = c.root.position.distanceTo(camera.position) > 12;
      c.update(dt);
    }
    const ctx = { player: G.player && G.player.char, rig, camera };
    for (const cam of w.cams) cam.update(dt, clock.time, ctx);
    rig.update(dt);
    ui.setClickHint(G.inGame && !G.paused && !G.demo && !input.locked && G.player && G.player.state === 'free' && !G.loading);
    post.render(clock.time);
  } else {
    menuStatic();
  }
  ui.update();
  input.endFrame();
}

applyQuality();
ui.setFade(1);
ui.setLoading(false);
setDemo(false);
requestAnimationFrame(frame);

// Atajos de desarrollo: ?escena=cafeteria salta directo; ?demo=1 arranca en modo demo.
const params = new URLSearchParams(location.search);
if (params.get('escena') && SCENES[params.get('escena')]) {
  startGame(params.get('demo') === '1', params.get('escena'));
} else if (params.get('demo') === '1') startGame(true);

export { wait };
