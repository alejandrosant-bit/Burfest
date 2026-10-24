// Escena 4 · Hospital, octubre de 1998. Mateo despierta del coma, se levanta, encuentra su chaqueta,
// ve la ciudad vacía por la ventana. Final: plano de cámara de vigilancia y "EN VIVO — CONTINUARÁ...".

import * as THREE from 'three';
import { World, M, drawnTexture, std, rng } from '../world/build.js';
import { Interactable, HiddenCamera, staticScreen } from '../world/objects.js';
import * as P from '../world/props.js';
import { Player, setObjective, clearObjective, objective } from '../player.js';
import { wait, waitUntil, spawn } from '../core/time.js';
import { OBJECTIVES } from '../script.js';
import { cityBackdrop } from './shared.js';

function emptyCity(w) {
  const ground = -9;
  const r = rng(314);
  const asphalt = std('asphalt', { color: 0x3a3c3e, rough: 0.95 });
  const sidewalk = std('sidewalk', { color: 0x8a8884, rough: 0.9 });
  w.box([120, 0.2, 80], [0, ground - 0.1, -45], sidewalk, { cast: false });
  w.box([120, 0.05, 9], [0, ground + 0.02, -16], asphalt, { cast: false });
  for (let x = -40; x < 40; x += 4) w.box([2, 0.02, 0.15], [x, ground + 0.06, -16], M.paint(0xe8e0c8, 0.8), { cast: false });
  // edificios con ventanas
  const facade = (seed) => drawnTexture('facade' + seed, 256, 512, (c, W, H) => {
    const base = 130 + (seed * 37) % 60;
    c.fillStyle = `rgb(${base},${base * 0.95},${base * 0.9})`; c.fillRect(0, 0, W, H);
    for (let y = 10; y < H; y += 34) for (let x = 12; x < W - 20; x += 40) {
      c.fillStyle = Math.random() < 0.08 ? '#d8c8a0' : 'rgba(40,46,52,.85)'; c.fillRect(x, y, 24, 20);
    }
  });
  // fila de enfrente al otro lado de la calle (más baja que la ventana) y fila del fondo más alta
  for (let i = 0; i < 26; i++) {
    const front = i < 13;
    const x = -45 + (i % 13) * 7.2 + r() * 2, z = front ? -26 - r() * 2 : -44 - r() * 8;
    const h = front ? 4 + r() * 6 : 14 + r() * 24, wd = 5 + r() * 2, dp = 5 + r() * 3;
    const t = facade(i % 6);
    w.box([wd, h, dp], [x, ground + h / 2, z], std('facadeMat' + (i % 6), { map: t, rough: 0.9 }), { cast: false });
  }
  // un bus abandonado y carros quietos
  w.box([10, 2.8, 2.5], [6, ground + 1.6, -15], M.paint(0x2e6b9e, 0.5), { cast: false });
  w.box([10, 0.9, 2.52], [6, ground + 2.3, -15], M.paint(0x15191c, 0.2), { cast: false });
  for (const [x, col] of [[-8, 0xb33a2a], [-14, 0xd8d0b0], [17, 0x2a2a2a]]) {
    w.box([4, 1.0, 1.8], [x, ground + 0.7, -18.5], M.paint(col, 0.4), { cast: false });
    w.box([2.2, 0.7, 1.7], [x - 0.3, ground + 1.5, -18.5], M.paint(0x1a1e22, 0.2), { cast: false });
  }
  // ruedas
  const tire = M.rubber(0x161616);
  for (const x of [2.5, 9.5]) for (const z of [-13.8, -16.2]) w.cyl(0.5, 0.5, 0.3, [x, ground + 0.5, z], tire, { rot: [90, 0, 0], cast: false });
  for (const x of [-8, -14, 17]) for (const dx of [-1.3, 1.3]) for (const z of [-17.65, -19.35]) w.cyl(0.33, 0.33, 0.2, [x + dx, ground + 0.33, z], tire, { rot: [90, 0, 0], cast: false });
  // papeles y basura regados: nadie limpia hace tiempo
  const paper = M.paint(0xe6e2d6, 0.9);
  for (let i = 0; i < 60; i++) w.box([0.25 + r() * 0.3, 0.005, 0.2 + r() * 0.25], [-30 + r() * 60, ground + 0.07, -11 - r() * 12], paper, { rot: [0, r() * 180, 0], cast: false });
  // postes y semáforo apagado
  for (let x = -30; x <= 30; x += 12) { w.cyl(0.08, 0.1, 7, [x, ground + 3.5, -11.5], M.metal(0x5a5a5a), { cast: false }); w.box([1.2, 0.1, 0.2], [x + 0.5, ground + 7, -11.5], M.metal(0x5a5a5a), { cast: false }); }
  w.plane(220, 70, [0, ground + 30, -70], cityBackdrop('hosp', 1.1), { cast: false, receive: false });
}

export default {
  build(G) {
    const w = new World();
    const s = w.scene;
    s.background = new THREE.Color(0xb9c0c4);
    s.fog = new THREE.Fog(0xb9c2c6, 25, 90);

    const upper = M.plaster('#e4e6df', 21);
    const lower = M.plaster('#9fc2b4', 22);
    w.room({
      x0: -2.75, x1: 2.75, z0: -3, z1: 3, h: 2.9, upper, lower, lowerH: 1.2, trim: M.paint(0x6f8f84, 0.4),
      floor: M.vinyl(), ceiling: M.ceiling(),
      openings: { s: [{ at: 2.85, w: 2.2, h: 1.55, sill: 0.9 }] },
    });
    P.windowFrame(w, [0.1, 1.675, -3.1], 0, 2.2, 1.55, { mullions: 2 });
    w.box([2.4, 0.04, 0.3], [0.1, 0.89, -2.86], M.paint(0xdcdcd4, 0.5), {});
    P.curtain(w, [-1.45, 1.6, -2.85], 0, 0.7, 2.1, 0x8fa9a0);
    P.curtain(w, [1.65, 1.6, -2.85], 0, 0.7, 2.1, 0x8fa9a0);
    emptyCity(w);

    // Luz fría de día nublado + fluorescente de hospital
    const sun = w.sun([0.15, -0.45, 1], 0xdfe8f0, 1.6, { center: [0, 1, 0], size: 5 });
    sun.shadow.radius = 8;
    w.shaft([0.1, 2.3, -3.0], [0.15, -0.45, 1], { width: 2.4, length: 4.5, color: 0xdfeaff, opacity: 0.05 });
    P.fluorescent(w, [-0.9, 2.9, 0.6], 0);
    w.spotLight([-0.4, 2.85, 0.2], [-0.4, 0, 0.3], 0xe6f0ff, 6, { angle: 1.1, penumbra: 0.9, distance: 8, shadow: true });
    P.fluorescent(w, [1.2, 2.9, -0.8], 0, { on: false });
    const tubeLight = w.pointLight([-0.9, 2.6, 0.6], 0xe6f0ff, 3, 7);
    s.add(new THREE.HemisphereLight(0xdfe8ee, 0x6a7470, 0.45));
    // parpadeo ocasional del tubo
    w.updaters.push((dt, t) => { tubeLight.intensity = (Math.sin(t * 0.7) > 0.97 && Math.random() < 0.5) ? 0.5 : 3; });

    // Mobiliario
    P.hospitalBed(w, [-1.6, 0, 0.5], 0);
    P.heartMonitor(w, [-2.35, 0, 1.75], 90);
    P.ivStand(w, [-2.3, 0, 0.0]);
    P.sideTable(w, [-0.7, 0, 1.85], 180);
    P.wheelchair(w, [1.75, 0, 2.1], -150);
    const chairG = P.chair(w, [1.95, 0, -0.75], -100);
    P.jacketOnChair(w, chairG);
    P.calendar(w, [2.735, 1.55, 0.7], -90);
    const tv = P.crtTV(w, [2.25, 2.2, 2.5], -140, { scale: 0.95, stand: 'bracket' });
    staticScreen(w, tv.screen.w, tv.screen.h, tv.screen.local, 0, tv.group, { color: 0xcfe0ff });
    P.door(w, [2.725, 0, 2.15], -90, { color: '#c9c4b4', sign: '312' });
    P.trashBin(w, [-2.4, 0, -2.5]);
    // lavamanos
    w.box([0.5, 0.15, 0.4], [-2.5, 0.85, -1.6], std('porcelain', { color: 0xf2f2ee, rough: 0.15, envI: 1.5 }), { collide: true });
    w.box([0.45, 0.6, 0.02], [-2.73, 1.5, -1.6], std('mirror', { color: 0xcfd8dc, rough: 0.02, metal: 1, envI: 2 }), {});

    const roomCam = new HiddenCamera(w, { pos: [2.52, 2.76, -2.78], look: [-1.2, 0.9, 0.9], id: 'CAM 07', track: true, ceiling: true });

    const rig = G.rig;
    const player = new Player(w, rig, { pos: [-1.6, 0.62, -0.38], rotY: 180 });
    player.char.setPose('lie', true);
    player.char.floorY = 0.66;
    player.walk = 1.05; player.runSpeed = 1.35;

    const jacket = new Interactable(w, { pos: [1.9, 0.8, -0.75], prompt: 'Mirar chaqueta', radius: 1.5, approach: [1.15, -0.6] });
    const calendar = new Interactable(w, { pos: [2.7, 1.5, 0.7], prompt: 'Mirar calendario', radius: 1.6, approach: [1.85, 0.7] });
    const tvI = new Interactable(w, { pos: [2.2, 1.4, 2.4], prompt: 'Mirar televisor', radius: 1.8, approach: [1.3, 1.4] });
    const windowI = new Interactable(w, { pos: [0.1, 1.4, -2.95], prompt: 'Mirar por la ventana', radius: 1.6, approach: [0.1, -2.2] });
    w.dust([-2.7, 0.2, -2.9], [2.7, 2.8, 2.9], 260, 0xe8f0ff);

    return { world: w, player, roomCam, jacket, calendar, tvI, windowI, envScale: 0.3 };
  },

  async run(G, ctx) {
    const { player, roomCam, jacket, calendar, tvI, windowI } = ctx;
    const { rig, ui, audio, post } = G;
    post.setGrade('hospital');
    audio.loop('amb', 'monitor', 0.32, { fade: 2 });
    audio.loop('amb2', 'roomCold', 0.28, { fade: 2 });
    audio.loop('amb3', 'static', 0.03, { fade: 2 });
    audio.muffle(0.85, 0.05);
    player.setState('cutscene');
    player.char.eyesClosed = true;

    // Punto de vista: acostado mirando el techo
    ui.setLids(1); post.setBlur(1);
    rig.cut([-1.6, 0.98, 1.2], [-0.4, 2.2, -1.2], { fov: 62, handheld: 0.25 });
    ui.setBars(0);
    await ui.fade(0, 0.5);
    await wait(2.5);
    audio.muffle(0.55, 4);
    await ui.lids(0.7, 1.4);
    await wait(0.5);
    await ui.lids(1, 0.25);
    await wait(0.9);
    await ui.lids(0.45, 1.2);
    spawn(() => post.blur(0.45, 3));
    await wait(0.6);
    await ui.lids(0.95, 0.2);
    await ui.lids(0.1, 0.9);
    audio.muffle(0.15, 3);
    await G.say('hospital_despertar', { skippable: false });

    // Plano general: se sienta al borde de la cama
    await ui.lids(1, 0.18);
    player.char.eyesClosed = false;
    player.teleport(-1.02, 0.45, 90);
    player.char.floorY = 0;
    player.char.setPose('sitBed', true);
    rig.cut([2.05, 1.7, -2.35], [-1.3, 0.8, 0.6], { fov: 40, handheld: 0.35, drift: [-0.02, 0, 0.015] });
    await ui.bars(true, 0.01);
    await ui.lids(0, 0.5);
    spawn(() => post.blur(0.15, 2.5));
    await wait(2.4);
    player.char.setPose('stand');
    await wait(1.6);
    audio.muffle(0, 2);
    await post.blur(0, 1.0);

    // Control al jugador
    rig.release(1.2, player.root);
    await ui.bars(false, 0.8);
    player.setState('free');

    const pending = [];
    for (const it of [jacket, calendar, tvI, windowI]) it.onUse = () => pending.push(it);
    const order = G.demo ? [calendar, jacket, tvI, windowI] : [jacket, windowI];
    const nextTarget = () => order.find((i) => !i.used) || null;
    setObjective(OBJECTIVES.hospital, nextTarget());

    const lock = async (fn) => { player.setState('cutscene'); await fn(); player.setState('free'); };
    while (!(jacket.used && windowI.used)) {
      if (objective.target !== nextTarget()) setObjective(OBJECTIVES.hospital, nextTarget());
      if (pending.length) {
        const it = pending.shift();
        if (it === jacket) {
          await lock(async () => {
            await ui.bars(true, 0.4);
            rig.cut([1.25, 1.15, -0.25], [1.95, 0.75, -0.8], { fov: 30, blend: 1.0, handheld: 0.35 });
            await wait(1.0);
            await G.say('hospital_chaqueta', { speakers: { Mateo: player.char } });
            rig.release(0.9);
            await ui.bars(false, 0.4);
          });
        } else if (it === windowI) {
          await lock(async () => {
            await ui.bars(true, 0.5);
            player.teleport(0.1, -2.3, 180);
            rig.cut([0.55, 1.62, -2.78], [2.5, -8.5, -16], { fov: 50, blend: 1.4, handheld: 0.3, drift: [0, -0.01, 0] });
            await wait(2.2);
            await G.say('hospital_ventana', { speakers: { Mateo: player.char } });
            await wait(0.8);
            rig.release(1.0, player.root);
            await ui.bars(false, 0.4);
          });
        } else if (it === calendar) {
          await lock(async () => {
            rig.cut([1.6, 1.55, 0.35], [2.73, 1.55, 0.7], { fov: 28, blend: 0.8, handheld: 0.3 });
            await G.say('hospital_calendario', { speakers: { Mateo: player.char } });
            rig.release(0.8);
          });
        } else if (it === tvI) {
          await lock(() => G.say('hospital_tv', { speakers: { Mateo: player.char } }));
        }
      }
      await wait(0);
    }
    clearObjective();
    await wait(1.8);

    // ---- Final: la cámara de vigilancia ----
    player.setState('cutscene');
    player.char.lookTarget = null;
    ui.setFade(1);
    await wait(0.25);
    const lens = roomCam.lensWorld;
    roomCam.track = false;
    rig.cut(lens, [-0.6, 0.9, 0.5], { fov: 78, handheld: 0.05 });
    post.setGrade('cctv');
    ui.showCCTV(true, 'CAM 07 · HAB 312', new Date(1998, 9, 14, 3, 12, 44));
    audio.loop('amb3', 'static', 0.06, { fade: 0.2 });
    audio.play('blip', { vol: 0.3, inner: true });
    ui.setFade(0);
    await wait(5.5);
    audio.play('jingle', { vol: 0.8, inner: true });
    await ui.endCard(4.5);
    await ui.fade(1, 2.0);
    audio.stopLoops(1.5);
    await wait(1.5);
    if (G.demo) G.goto('aula', { fade: 0.01 });
    else G.backToMenu();
  },
};
