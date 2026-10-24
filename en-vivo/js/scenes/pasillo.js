// Escena 2 · Pasillo. Estudiantes caminando, mural de la Semana Cultural, teléfono público
// y la primera cámara oculta visible.

import * as THREE from 'three';
import { World, M, drawnTexture, rng } from '../world/build.js';
import { Character, OUTFITS, randomStudent } from '../world/characters.js';
import { Interactable, Zone, HiddenCamera } from '../world/objects.js';
import * as P from '../world/props.js';
import { Player, setObjective } from '../player.js';
import { wait, waitUntil, spawn } from '../core/time.js';
import { OBJECTIVES } from '../script.js';
import { campusExterior, corridorStub } from './shared.js';
import { posterDraw } from './aula.js';

export default {
  build(G) {
    const w = new World();
    const s = w.scene;
    s.background = new THREE.Color(0x0b0b0b);
    s.fog = new THREE.Fog(0x2a2620, 14, 45);

    const cream = M.plaster('#dcd0b2', 6);
    const teal = M.plaster('#2f6f6c', 7);
    w.room({
      x0: -1.9, x1: 1.9, z0: 0, z1: 30, h: 3.0, upper: cream, lower: teal, lowerH: 1.1, trim: M.paint(0x1f3f3c, 0.4),
      floor: M.terrazzo(), ceiling: M.ceiling(),
      openings: {
        n: [{ at: 1.9, w: 1.7, h: 2.4 }],
        w: [{ at: 19, w: 2.4, h: 1.5, sill: 0.95 }, { at: 23, w: 2.4, h: 1.5, sill: 0.95 }, { at: 27, w: 2.4, h: 1.5, sill: 0.95 }],
      },
    });
    corridorStub(w, { x0: -2.5, x1: 2.5, z0: 30.2, z1: 34, h: 3.2, openings: { s: [{ at: 2.5, w: 1.7, h: 2.4 }] } });
    w.pointLight([0, 2.6, 32], 0xfff0d8, 9, 8);

    // Ventanas al oeste con sol de la tarde
    const ext = campusExterior('pasillo');
    for (const z of [19, 23, 27]) {
      P.windowFrame(w, [-2.0, 1.7, z], 90, 2.4, 1.5, { exterior: ext, extDist: 1.4 });
      w.shaft([-1.95, 2.3, z], [1, -0.55, -0.35], { width: 2.2, length: 5, opacity: 0.07 });
    }
    w.sun([1, -0.55, -0.35], 0xffc48a, 3.2, { center: [0, 1, 22], size: 9 });

    // Fluorescentes y luces
    for (let z = 2; z < 30; z += 3) P.fluorescent(w, [0, 3.0, z], 0, { len: 1.2 });
    for (const z of [3, 9, 15, 21, 27]) w.pointLight([0, 2.75, z], 0xeef0e4, 3.6, 8);
    w.spotLight([0, 2.95, 10], [0, 0, 10.5], 0xeef0e4, 7, { angle: 1.1, penumbra: 0.9, distance: 9, shadow: true });
    s.add(new THREE.HemisphereLight(0xdcd6c8, 0x5a4a3a, 0.3));

    // Mural "SEMANA CULTURAL 1998"
    const mural = drawnTexture('mural98', 1280, 460, (c, W, H) => {
      c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, W, H);
      const r = rng(98);
      const cols = ['#c0392b', '#f1c40f', '#2471a3', '#27ae60', '#e67e22', '#8e44ad'];
      for (let i = 0; i < 26; i++) { c.fillStyle = cols[i % cols.length]; c.globalAlpha = 0.85; c.beginPath(); c.arc(r() * W, r() * H, 30 + r() * 110, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 1;
      // figuras de músicos y bailarines estilizadas
      c.fillStyle = '#1b1b1b';
      for (let i = 0; i < 7; i++) { const x = 90 + i * 175, y = H - 40; c.beginPath(); c.arc(x, y - 170, 22, 0, Math.PI * 2); c.fill(); c.fillRect(x - 14, y - 148, 28, 90); c.save(); c.translate(x, y - 140); c.rotate(Math.sin(i) * 0.8); c.fillRect(-60, -6, 120, 12); c.restore(); c.fillRect(x - 14, y - 60, 10, 60); c.fillRect(x + 4, y - 60, 10, 60); }
      c.fillStyle = '#fdfaf2'; c.strokeStyle = '#1b1b1b'; c.lineWidth = 10;
      c.font = 'bold 120px Impact, "Arial Black", sans-serif'; c.textAlign = 'center';
      c.strokeText('SEMANA CULTURAL', W / 2, 150); c.fillText('SEMANA CULTURAL', W / 2, 150);
      c.font = 'bold 150px Impact, "Arial Black", sans-serif'; c.fillStyle = '#f1c40f';
      c.strokeText('1998', W / 2, 300); c.fillText('1998', W / 2, 300);
      for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(80,60,40,${r() * 0.12})`; c.fillRect(r() * W, r() * H, 3, 3); }
    });
    w.plane(5.4, 1.95, [-1.885, 1.95, 9], M.picture('mural98', mural, 0.85), { rot: [0, 90, 0] });

    // Puertas de salones al este
    [['AULA 205', 4], ['AULA 206', 12], ['LAB. FÍSICA', 20], ['AULA 208', 26]].forEach(([name, z]) => P.door(w, [1.875, 0, z], -90, { sign: name, color: '#5e3c22' }));
    P.door(w, [0, 0, 0.03], 0, { sign: 'AULA 204' });
    P.bulletinBoard(w, [1.88, 1.65, 8], -90, 5);
    P.payphone(w, [1.62, 0, 15.5], -90);
    P.bench(w, [-1.55, 0, 14.5], 90);
    P.plant(w, [-1.5, 0, 3]);
    P.plant(w, [1.5, 0, 28.8]);
    P.trashBin(w, [-1.55, 0, 16.4]);
    P.poster(w, 'p1', [1.89, 1.7, 17.2], -90, 0.6, 0.85, posterDraw('#2e7d32', 'ROCK', 'AL PARQUE · ESTUDIANTIL', 'Plazoleta Che · Viernes'));
    P.poster(w, 'p2', [1.89, 1.6, 23.2], -90, 0.6, 0.85, posterDraw('#6a1b9a', 'ELECCIONES', 'REPRESENTANTE ESTUDIANTIL', 'Vota el 2 de abril'));
    P.poster(w, 'p3', [-1.89, 1.6, 15.8], 90, 0.55, 0.78, posterDraw('#ad1457', 'TEATRO', 'GRUPO LA CANDELARIA', 'Auditorio · 7 p. m.'));

    // Cámara oculta visible: techo, mirando hacia quien se acerca
    const cam = new HiddenCamera(w, { pos: [-1.6, 2.86, 17.8], look: [0.5, 1.2, 10], id: 'CAM 03', track: true, size: 1.25 });

    // Gente caminando
    const r = rng(42);
    const walkers = [];
    for (let i = 0; i < 9; i++) {
      const x = (r() - 0.5) * 2.2;
      const z0 = 3 + r() * 24;
      const c = new Character(w, randomStudent(200 + i), { pos: [x, 0, z0], rotY: r() < 0.5 ? 0 : 180, castShadow: false });
      walkers.push({ c, x, a: 2 + r() * 4, b: 24 + r() * 4, speed: 1.1 + r() * 0.5 });
    }
    // Grupos conversando
    const groups = [];
    for (const [gx, gz, n] of [[-1.1, 5.5, 3], [1.15, 21.5, 2], [-1.0, 25.5, 2]]) {
      const members = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const c = new Character(w, randomStudent(300 + gz * 10 + k), { pos: [gx + Math.cos(a) * 0.45, 0, gz + Math.sin(a) * 0.45], castShadow: false });
        c.face([gx, gz], true);
        members.push(c);
      }
      groups.push(members);
    }
    const camilo = new Character(w, OUTFITS.camilo, { name: 'Camilo', pos: [1.0, 0, 11.2], rotY: -90 });
    const friend = new Character(w, randomStudent(77), { pos: [0.3, 0, 11.2], rotY: 90, castShadow: false });

    const rig = G.rig;
    const player = new Player(w, rig, { pos: [0, 0, 2.8], rotY: 0 });
    const exitZone = new Zone(w, [-1.0, 29.2], [1.0, 31]);
    const phone = new Interactable(w, { pos: [1.4, 1.4, 15.5], prompt: 'Revisar teléfono', radius: 1.4, approach: [0.8, 15.5] });
    const muralI = new Interactable(w, { pos: [-1.8, 1.5, 9], prompt: 'Mirar mural', radius: 1.8, approach: [-0.8, 9] });
    const board = new Interactable(w, { pos: [1.8, 1.5, 8], prompt: 'Leer cartelera', radius: 1.4, approach: [0.9, 8] });
    w.dust([-1.8, 0.2, 16], [1.8, 2.9, 29], 300);

    return { world: w, player, cam, walkers, groups, camilo, friend, exitZone, phone, muralI, board };
  },

  async run(G, ctx) {
    const { player, cam, walkers, groups, camilo, friend, exitZone, phone, muralI, board } = ctx;
    const { rig, ui, audio } = G;
    audio.loop('amb', 'murmur', 0.32, { fade: 1.5 });
    audio.loop('amb2', 'roomWarm', 0.25, { fade: 1.5 });
    G.post.setGrade('film98');

    for (const wk of walkers) spawn(async () => {
      await wait(Math.random() * 2);
      for (;;) {
        await wk.c.moveTo([[wk.x, wk.b]], { speed: wk.speed });
        await wait(0.5 + Math.random() * 2);
        await wk.c.moveTo([[wk.x + (Math.random() - 0.5) * 0.4, wk.a]], { speed: wk.speed });
        await wait(0.5 + Math.random() * 2);
      }
    });
    for (const g of groups) spawn(async () => {
      for (let i = 0; ; i = (i + 1) % g.length) { g[i].talking = true; await wait(2 + Math.random() * 3); g[i].talking = false; await wait(0.4); }
    });
    camilo.talking = true; friend.lookTarget = camilo.root; camilo.lookTarget = friend.root;

    // Diálogos opcionales
    const sayFree = (key) => spawn(() => G.say(key, { skippable: false, speakers: { Mateo: player.char } }));
    phone.onUse = () => sayFree('pasillo_telefono');
    muralI.onUse = () => sayFree('pasillo_mural');
    board.onUse = () => sayFree('pasillo_tablero');
    cam.onNoticed = () => sayFree('pasillo_camara');

    player.teleport(0, 2.8, 0);
    rig.release(0, player.root);
    player.setState('free');
    await ui.fade(0, 1.4);
    setObjective(OBJECTIVES.pasillo, exitZone, { path: [[0.2, 6], [0.3, 12.5], [0, 20], [0, 27]] });

    // Camilo se acerca cuando Mateo pasa cerca
    spawn(async () => {
      await waitUntil(() => player.root.position.z > 7.5);
      camilo.talking = false;
      camilo.lookTarget = player.char.root;
      const p = player.root.position;
      await camilo.moveTo([[0.9, Math.min(p.z + 1.6, 12)]], { speed: 1.6 });
      camilo.face(player.root.position);
      await G.say('pasillo_companero', { skippable: false, speakers: { Camilo: camilo, Mateo: player.char } });
      camilo.lookTarget = friend.root;
      await camilo.moveTo([[1.0, 11.2]], { speed: 1.3 });
      camilo.face([0.3, 11.2]);
      camilo.talking = true;
    });

    // En modo demo, la cámara "descubre" la cámara oculta para el público
    spawn(async () => {
      await waitUntil(() => G.demo && player.root.position.z > 12.5 && player.state === 'free');
      if (cam.noticed) return;
      player.setState('cutscene');
      await ui.bars(true, 0.4);
      rig.cut([0.4, 1.6, 13.8], cam.ledWorld, { fov: 22, blend: 1.2, handheld: 0.6 });
      await wait(1.6);
      cam.noticed = true; ui.flashRec(); audio.play('blip', { vol: 0.35, inner: true });
      await G.say('pasillo_camara', { skippable: false });
      rig.release(1.0, player.root);
      await ui.bars(false, 0.5);
      player.setState('free');
    });

    await waitUntil(() => exitZone.contains(player.root.position));
    G.goto('cafeteria');
  },
};
