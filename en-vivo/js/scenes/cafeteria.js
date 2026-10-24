// Escena 3 · Cafetería. Andrés guarda puesto, el ataque, esconderse detrás de la barra,
// el tirador, el golpe y el desmayo. La violencia queda fuera de cuadro.

import * as THREE from 'three';
import { World, M, drawnTexture, std, rng } from '../world/build.js';
import { Character, OUTFITS, randomStudent } from '../world/characters.js';
import { Interactable, Zone, HiddenCamera, ceilingFan, staticScreen } from '../world/objects.js';
import * as P from '../world/props.js';
import { Player, setObjective, clearObjective } from '../player.js';
import { wait, waitUntil, spawn, clock } from '../core/time.js';
import { OBJECTIVES, INTERTITLE } from '../script.js';
import { campusExterior, corridorStub } from './shared.js';

const D = THREE.MathUtils.degToRad;

function buildRifle(w) {
  const g = new THREE.Group();
  const wood = M.wood('#4a2c18', 14), steel = M.metal(0x2c2e30, 0.35);
  w.box([0.045, 0.1, 0.42], [0, -0.02, -0.12], wood, { parent: g, dynamic: true });
  w.box([0.04, 0.06, 0.3], [0, 0.0, 0.22], wood, { parent: g, dynamic: true });
  w.cyl(0.011, 0.011, 0.62, [0, 0.03, 0.62], steel, { parent: g, rot: [90, 0, 0], dynamic: true });
  w.box([0.04, 0.05, 0.16], [0, 0.04, 0.12], steel, { parent: g, dynamic: true });
  w.cyl(0.006, 0.006, 0.06, [0.035, 0.05, 0.1], steel, { parent: g, rot: [0, 0, 90], dynamic: true });
  w.cyl(0.018, 0.018, 0.2, [0, 0.085, 0.14], steel, { parent: g, rot: [90, 0, 0], dynamic: true }); // mira
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.03, 0.94); g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

function buildPistol(w) {
  const g = new THREE.Group();
  const steel = M.metal(0x1e1f21, 0.3);
  w.box([0.03, 0.11, 0.035], [0, -0.03, 0], M.plastic(0x151515, 0.6), { parent: g, dynamic: true });
  w.box([0.03, 0.035, 0.17], [0, 0.035, 0.05], steel, { parent: g, dynamic: true });
  return g;
}

function muzzleFlash(w) {
  const m = new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), m);
  f.scale.set(1, 1, 2.2);
  const light = new THREE.PointLight(0xffb060, 0, 9, 2);
  f.add(light);
  f.userData.static = false;
  return { mesh: f, light, mat: m };
}

export default {
  build(G) {
    const w = new World();
    const s = w.scene;
    s.background = new THREE.Color(0x0b0b0b);
    s.fog = new THREE.Fog(0x2a2620, 16, 50);

    const wall = M.plaster('#e2d6b8', 11);
    const tile = M.plaster('#b8c9b0', 12);
    w.room({
      x0: -8, x1: 8, z0: -7, z1: 7, h: 3.4, upper: wall, lower: tile, lowerH: 1.25, trim: M.paint(0x6a4a2a, 0.4),
      floor: M.terrazzo(), ceiling: M.ceiling(),
      openings: {
        s: [{ at: 8, w: 1.8, h: 2.4 }],
        e: [{ at: 4, w: 1.4, h: 2.3 }],
        w: [{ at: 3, w: 2.4, h: 1.5, sill: 1.0 }, { at: 7, w: 2.4, h: 1.5, sill: 1.0 }, { at: 11, w: 2.4, h: 1.5, sill: 1.0 }],
        n: [{ at: 4.5, w: 2.6, h: 0.9, sill: 1.15 }],
      },
    });
    corridorStub(w, { x0: -2.6, x1: 2.6, z0: -10.5, z1: -7.2, h: 3.0, openings: { n: [{ at: 2.6, w: 1.8, h: 2.4 }] } });
    corridorStub(w, { x0: 8.2, x1: 11.5, z0: -5.5, z1: -0.5, h: 3.0, openings: { w: [{ at: 2.5, w: 1.4, h: 2.3 }] } });
    // cocina detrás de la ventanilla
    w.room({ x0: -6, x1: -0.5, z0: 7.2, z1: 9.5, h: 3.0, upper: M.plaster('#d8d8d0', 13), floor: M.vinyl(), ceiling: M.ceiling(), openings: { s: [{ at: 1.0, w: 2.6, h: 0.9, sill: 1.15 }] } });
    w.pointLight([-3.2, 2.5, 8.4], 0xfff2d8, 5, 6);
    for (let i = 0; i < 5; i++) w.cyl(0.18, 0.18, 0.3, [-5 + i * 0.9, 1.05, 9.1], M.metal(0xb8b8b8, 0.3), {}); // ollas

    // Ventanas oeste con sol bajo
    const ext = campusExterior('cafe');
    for (const z of [-4, 0, 4]) {
      P.windowFrame(w, [-8.1, 1.75, z], 90, 2.4, 1.5, { exterior: ext, extDist: 1.3 });
      w.shaft([-8.05, 2.4, z], [1, -0.5, 0.3], { width: 2.2, length: 7.5, opacity: 0.065 });
    }
    w.sun([1, -0.5, 0.3], 0xffc48a, 3.0, { center: [-1, 1, 0], size: 10 });
    for (const x of [-5, -1.5, 2, 5.5]) for (const z of [-4.5, -1, 2.5]) P.fluorescent(w, [x, 3.4, z], 90);
    w.pointLight([-3, 3.0, -2], 0xf0efe4, 5.5, 10);
    w.pointLight([3, 3.0, -2], 0xf0efe4, 5.5, 10);
    w.pointLight([-1, 3.0, 4.5], 0xfff0d8, 4, 8);
    w.spotLight([1.5, 3.35, 0], [1.5, 0, 0.5], 0xf0efe4, 10, { angle: 1.15, penumbra: 0.9, distance: 12, shadow: true });
    s.add(new THREE.HemisphereLight(0xe0d8c8, 0x5a4a3a, 0.32));
    ceilingFan(w, [-4, 3.4, -1.5], 2.8); ceilingFan(w, [0.5, 3.4, 1.5], 2.4); ceilingFan(w, [4.5, 3.4, -2.5], 2.6);

    // Barra
    const counterTop = std('counterTop', { color: 0xc9cccd, rough: 0.25, metal: 0.6, envI: 1.2 });
    const tileFront = drawnTexture('counterTiles', 512, 128, (c, W, H) => {
      c.fillStyle = '#7a3b2a'; c.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 32) for (let y = 0; y < H; y += 32) { c.fillStyle = (x / 32 + y / 32) % 2 ? '#8c4632' : '#a35a3e'; c.fillRect(x + 1, y + 1, 30, 30); }
    });
    tileFront.wrapS = tileFront.wrapT = THREE.RepeatWrapping; tileFront.repeat.set(8, 1);
    w.box([8.5, 1.0, 0.65], [-1.25, 0.5, 4.35], M.picture('counterFront', tileFront, 0.4), { collide: true });
    w.box([8.7, 0.05, 0.8], [-1.25, 1.03, 4.38], counterTop, {});
    w.box([8.5, 0.04, 0.35], [-1.25, 1.4, 4.2], std('sneezeGlass', { color: 0xdfeef0, transparent: true, opacity: 0.25, rough: 0.05 }), { cast: false });
    for (const x of [-5.3, -1.25, 2.8]) w.cyl(0.012, 0.012, 0.4, [x, 1.22, 4.2], M.metal(0xb0b0b0), {});
    // bandejas con comida y gaseosas
    for (let i = 0; i < 6; i++) {
      w.box([0.5, 0.12, 0.35], [-4.6 + i * 1.1, 1.11, 4.45], M.metal(0xa8a8a8, 0.3), {});
      w.box([0.44, 0.04, 0.3], [-4.6 + i * 1.1, 1.16, 4.45], M.paint([0xd9a441, 0xf1e3c0, 0x8a4a22, 0xc8682a, 0xe8d090, 0x5a7a2a][i], 0.6), {});
    }
    for (let i = 0; i < 12; i++) w.cyl(0.03, 0.03, 0.22, [1.8 + (i % 6) * 0.09, 1.16 + 0.06, 4.15 + Math.floor(i / 6) * 0.12], std('soda' + (i % 3), { color: [0x5a1a10, 0x2a5a1a, 0xd8a020][i % 3], rough: 0.1, transparent: true, opacity: 0.9 }), {});
    w.box([0.4, 0.25, 0.35], [-5.0, 1.18, 4.3], M.plastic(0x3a3a3a, 0.4), {}); // caja registradora
    // estantería trasera
    for (const y of [1.3, 1.8]) w.box([6, 0.04, 0.35], [-2.2, y, 6.8], M.wood('#6e4a2c'), {});
    for (let i = 0; i < 18; i++) w.box([0.12, 0.2, 0.12], [-5 + i * 0.32, 1.42 + (i % 2) * 0.5, 6.8], M.paint([0xc0392b, 0xf1c40f, 0x2471a3, 0xe8e2d6][i % 4], 0.5), {});

    // Letreros
    const sign = drawnTexture('cafeSign', 1536, 160, (c, W, H) => {
      c.fillStyle = '#7a1f1a'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#f1c40f'; c.lineWidth = 8; c.strokeRect(8, 8, W - 16, H - 16);
      c.fillStyle = '#fdf6e3'; c.font = 'bold 92px Impact, "Arial Black", sans-serif'; c.textAlign = 'center';
      c.fillText('CAFETERÍA CENTRAL  ·  ALMUERZO $2.500', W / 2, 118);
    });
    w.box([6.4, 0.66, 0.04], [-1.2, 2.75, 6.96], M.picture('cafeSign', sign, 0.5), {});
    w.pointLight([-1.2, 2.3, 6.2], 0xffe6c0, 1.5, 3);
    const menu = drawnTexture('menuBoard', 512, 512, (c, W, H) => {
      c.fillStyle = '#1d2a22'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#f2efe4'; c.font = 'bold 54px "Comic Sans MS", cursive'; c.textAlign = 'center'; c.fillText('MENÚ DEL DÍA', W / 2, 80);
      c.font = '40px "Comic Sans MS", cursive'; c.textAlign = 'left';
      ['• Sancocho de gallina', '• Arroz, carne, tajada', '• Jugo de mora', '• Postre: bocadillo', '', 'Corrientazo $2.500'].forEach((l, i) => c.fillText(l, 40, 170 + i * 56));
    });
    w.box([1.2, 1.2, 0.04], [3.6, 2.2, 6.96], M.picture('menuBoard', menu, 0.8), {});

    // TV de tubo en esquina
    const tv = P.crtTV(w, [7.35, 2.55, 6.35], -135, { scale: 1.2, stand: 'bracket' });
    staticScreen(w, tv.screen.w, tv.screen.h, tv.screen.local, 0, tv.group, { color: 0xc0d4ff });

    P.poster(w, 'c1', [7.97, 1.75, 2.0], -90, 0.6, 0.85, posterDraw2('#1565c0', 'TUNA', 'Serenata en la cafetería · Jueves'));
    P.bulletinBoard(w, [7.95, 1.7, -5.5], -90, 9);
    P.plant(w, [-7.4, 0, -6.4], 1.2); P.trashBin(w, [7.4, 0, -6.4]); P.trashBin(w, [-7.4, 0, 6.2]);

    // Mesas y sillas
    const tables = [];
    for (const x of [-5.5, -2.5, 0.5, 3.5]) for (const z of [-4.5, -1.5, 1.5]) tables.push([x, z]);
    tables.push([6.3, -4.5], [6.3, -1.5]);
    const chairs = [];
    const r = rng(7);
    for (const [x, z] of tables) {
      P.cafeTable(w, [x, 0, z]);
      for (const [dx, dz, ry] of [[0, -0.68, 0], [0, 0.68, 180], [-0.68, 0, 90], [0.68, 0, -90]]) {
        if (x === 3.5 && z === -1.5 && dx !== 0) continue;
        if (!(x === 3.5 && z === -1.5) && r() < 0.25) continue;
        const col = r() < 0.7 ? 0xf2f0ea : 0xb8312a;
        const ch = P.monobloc(w, [x + dx, 0, z + dz], ry + (r() - 0.5) * 16, col);
        chairs.push({ x: x + dx, z: z + dz, ry, ch });
      }
    }

    // Estudiantes almorzando
    const students = [];
    let k = 0;
    for (const c of chairs) {
      if (Math.abs(c.x - 3.5) < 0.8 && Math.abs(c.z + 1.5) < 0.8) continue;
      if (r() < 0.45) continue;
      const st = new Character(w, randomStudent(500 + k++), { pos: [c.x, 0, c.z], rotY: c.ry, castShadow: false });
      st.setPose('sit', true);
      students.push(st);
    }
    // fila en la barra
    for (let i = 0; i < 3; i++) {
      const st = new Character(w, randomStudent(600 + i), { pos: [-3.6 + i * 0.75, 0, 3.4], rotY: 0, castShadow: false });
      students.push(st);
    }
    const cook = new Character(w, { skin: 0xb98566, hair: 0x1a120c, hairStyle: 'ponytail', build: 'f', top: { color: '#f4f2ec', kind: 'knit' }, sleeves: 'short', bottom: { color: '#2a2a2a', kind: 'denim' }, height: 0.94 }, { pos: [-2.4, 0, 5.3], rotY: 180, castShadow: false });

    const andres = new Character(w, OUTFITS.andres, { name: 'Andrés', pos: [3.5, 0, -0.85], rotY: 180 });
    andres.setPose('sit', true);
    const shooter = new Character(w, OUTFITS.tirador, { name: 'Tirador', pos: [0, 0, -9.5], rotY: 0 });
    shooter.setVisible(false);
    const rifle = buildRifle(w);
    shooter.J.spine.add(rifle);
    const pistol = buildPistol(w);
    shooter.J.handR.add(pistol);
    pistol.position.set(0, -0.07, 0.02); pistol.rotation.set(D(90), 0, 0);
    pistol.visible = false;
    const flash = muzzleFlash(w);
    rifle.userData.muzzle.add(flash.mesh);

    const rig = G.rig;
    const player = new Player(w, rig, { pos: [0, 0, -5.0], rotY: 0 });
    const seat = new Interactable(w, { pos: [3.5, 0.5, -2.2], prompt: 'Sentarse con Andrés', radius: 1.6, approach: [3.5, -2.95] });
    const hideZone = new Zone(w, [-5.4, 4.75], [2.9, 6.9]);
    hideZone.center = new THREE.Vector3(-1.0, 0, 5.3);
    const ceilingCam = new HiddenCamera(w, { pos: [-0.5, 3.28, 4.5], look: [-1.0, 0.4, 5.6], id: 'CAM 05', track: false });
    w.dust([-7.8, 0.2, -6.8], [2, 3.2, 6.8], 500);

    return { world: w, player, andres, shooter, rifle, pistol, flash, students, cook, seat, hideZone, ceilingCam };
  },

  async run(G, ctx) {
    const { player, andres, shooter, rifle, pistol, flash, students, cook, seat, hideZone, ceilingCam } = ctx;
    const { rig, ui, audio, post } = G;
    audio.loop('amb', 'murmur', 0.5, { fade: 1.5 });
    audio.loop('amb2', 'fan', 0.15, { fade: 1.5 });
    post.setGrade('film98');
    for (const st of students) if (Math.random() < 0.35) st.talking = true;

    const holdRifle = (mode) => {
      if (mode === 'ready') { rifle.position.set(0.05, 0.22, 0.2); rifle.rotation.set(D(25), D(-20), D(-15)); }
      if (mode === 'aim') { rifle.position.set(0.12, 0.42, 0.12); rifle.rotation.set(0, 0, 0); }
      if (mode === 'back') { rifle.position.set(0.02, 0.3, -0.16); rifle.rotation.set(D(0), D(180), D(55)); }
    };
    holdRifle('ready');
    const fire = async (target, vol = 1) => {
      shooter.setPose('rifleAim');
      shooter.face(target);
      await wait(0.35);
      holdRifle('aim');
      flash.mat.opacity = 1; flash.light.intensity = 40;
      audio.play('rifle', { vol });
      rig.shakeIt(0.9, 0.35);
      await wait(0.06);
      flash.mat.opacity = 0; flash.light.intensity = 0;
      await wait(0.5);
      holdRifle('ready'); shooter.setPose('rifle');
    };

    // Llegada
    player.teleport(0, -5.0, 0);
    rig.release(0, player.root);
    player.setState('free');
    andres.setPose('wave');
    andres.lookTarget = player.char.root;
    await ui.fade(0, 1.4);
    spawn(() => G.say('cafeteria_llegada', { skippable: false, speakers: { 'Andrés': andres } }));
    spawn(async () => { await wait(2.5); andres.setPose('sit'); });
    setObjective(OBJECTIVES.cafeteria_sentarse, seat, { path: [[1.6, -5.6], [2.3, -3.2]] });
    await new Promise((res) => { seat.onUse = res; });

    // Charla en la mesa
    clearObjective();
    player.setState('cutscene');
    await ui.bars(true, 0.6);
    player.teleport(3.5, -2.15, 0);
    player.char.setPose('sit');
    andres.setPose('sit');
    player.char.lookTarget = andres.root;
    rig.cut([5.4, 1.28, -3.1], [3.5, 1.0, -1.5], { fov: 36, handheld: 0.45, blend: 0.9 });
    await wait(0.6);
    const lines = G.lines('cafeteria_charla');
    for (let i = 0; i < lines.length; i++) {
      const [who, text] = lines[i];
      if (who === 'Andrés') rig.cut([3.05, 1.22, -2.75], null, { fov: 30, handheld: 0.5, follow: andres.root, followOffset: [0, 1.15, 0] });
      else rig.cut([4.1, 1.2, -0.25], null, { fov: 30, handheld: 0.5, follow: player.root, followOffset: [0, 1.15, 0] });
      const ch = who === 'Andrés' ? andres : player.char;
      ch.talking = true;
      const last = i === lines.length - 1;
      await ui.say(who, text, { skippable: !G.demo, duration: last ? 1.5 : 0 });
      ch.talking = false;
    }

    // ---- El ataque ----
    ui.hideSubtitle();
    audio.play('rifle', { vol: 0.55, rate: 0.95 });
    audio.loop('amb', 'murmur', 0.04, { fade: 0.25 });
    rig.shakeIt(0.5, 0.4);
    for (const st of students) { st.talking = false; st.lookTarget = new THREE.Vector3(0, 1.4, -7); }
    andres.lookTarget = new THREE.Vector3(0, 1.4, -7);
    rig.cut([5.4, 1.28, -3.1], [3.5, 1.0, -1.5], { fov: 36, handheld: 0.6 });
    await wait(1.4);
    audio.play('rifle', { vol: 0.75 });
    rig.shakeIt(0.8, 0.4);
    audio.play('scream1', { vol: 0.5 }); audio.play('scream2', { vol: 0.45, delay: 0.25 }); audio.play('scream3', { vol: 0.35, delay: 0.5 });
    audio.heartbeat(0.55, 118, 0.5);
    rig.cut([-4.2, 1.75, -6.2], [2.5, 1.0, 1.5], { fov: 46, handheld: 1.4 });
    // pánico: todos huyen por la salida este
    students.forEach((st, i) => spawn(async () => {
      await wait(0.1 + Math.random() * 0.6);
      st.setPose('stand');
      await wait(0.25);
      const p = st.root.position;
      const lane = p.z < 2.8 ? [[p.x, Math.min(p.z, 3)], [7.2, -3 + (i % 3) * 0.3 - 0.3]] : [[Math.max(p.x, 4.5), p.z]];
      await st.moveTo([...lane, [8.6, -3], [10.5, -2.4 + (i % 4) * 0.4]], { run: true, speed: 4 + Math.random() * 0.8, hideOnArrive: true });
    }));
    spawn(async () => { await wait(0.4); await cook.moveTo([[3.3, 5.6], [4.8, 3.2], [7.2, -2.8], [8.6, -3], [10.5, -2]], { run: true, hideOnArrive: true }); });
    await wait(1.6);
    audio.play('scream2', { vol: 0.4, rate: 1.1 });
    andres.setPose('stand');
    await wait(0.4);
    andres.setPose('shout');
    andres.lookTarget = player.char.root;
    rig.cut([3.05, 1.45, -2.95], null, { fov: 28, handheld: 1.2, follow: andres.root, followOffset: [0, 1.5, 0] });
    await G.say('cafeteria_esconde', { skippable: false, speakers: { 'Andrés': andres } });
    andres.lookTarget = null; andres.setPose('stand');
    spawn(() => andres.moveTo([[5.1, -0.8], [7.2, -2.9], [8.6, -3], [10.5, -2.2]], { run: true, hideOnArrive: true }));
    player.char.setPose('stand');
    player.char.lookTarget = null;
    await wait(0.5);

    // ---- Esconderse (jugable, con tiempo) ----
    player.teleport(3.5, -2.55, 20);
    rig.release(0.5, player.root);
    await ui.bars(false, 0.4);
    player.setState('free');
    setObjective(OBJECTIVES.cafeteria_esconderse, hideZone, { urgent: true, path: [[5.3, -2.4], [5.3, 2.9], [4.6, 5.7]] });
    let t = 0, nextShot = 2.2;
    const limit = 14;
    await waitUntil(() => {
      t += clock.dt;
      if (t > nextShot) { audio.play('rifle', { vol: 0.6 + Math.random() * 0.2, rate: 0.95 + Math.random() * 0.08 }); rig.shakeIt(0.4, 0.3); nextShot += 2.2 + Math.random() * 1.8; }
      return hideZone.contains(player.root.position) || t > limit;
    });
    const made = hideZone.contains(player.root.position);
    clearObjective();
    player.setState('cutscene');
    if (!made) await ui.fade(1, 0.35);
    // Mateo agachado de espaldas a la barra, temblando
    player.teleport(-1.0, 5.25, 0);
    player.char.setPose('crouch', !made);
    player.char.tremble = 1;
    audio.heartbeat(0.7, 130, 0.5);
    await ui.bars(true, made ? 0.5 : 0.01);
    if (!made) await ui.fade(0, 0.5);

    // ---- El tirador entra ----
    shooter.setVisible(true);
    shooter.setPose('rifle');
    rig.cut([-0.55, 1.22, 6.45], [0.6, 1.25, -5.5], { fov: 38, handheld: 0.7 });
    await shooter.moveTo([[0, -6.2], [1.4, -3.4]], { speed: 1.25 });
    await fire([8, -3], 1);
    await wait(0.4);
    await fire([8.2, -2.4], 1);
    await wait(0.6);

    rig.cut([-0.72, 0.82, 6.35], null, { fov: 30, handheld: 0.8, follow: player.root, followOffset: [0, 0.85, 0] });
    player.char.talking = true;
    await G.say('cafeteria_respira', { skippable: false });
    player.char.talking = false;

    // rodea la barra
    rig.cut([-1.7, 0.6, 5.7], null, { fov: 40, handheld: 0.6, follow: shooter.root, followOffset: [0, 1.2, 0] });
    spawn(async () => { await wait(1.8); audio.play('click', { vol: 0.4, rate: 0.5 }); });
    await shooter.moveTo([[4.6, 2.9], [4.6, 5.7], [0.35, 5.75]], { speed: 1.3 });
    // cuelga el rifle y saca la pistola
    holdRifle('back');
    shooter.setPose('stand');
    await wait(0.5);
    pistol.visible = true;
    shooter.face([-1.0, 5.25]);
    shooter.setPose('pistolAim');
    shooter.lookTarget = player.char.root;
    await wait(0.6);
    rig.cut([1.75, 1.9, 6.5], [-1.0, 0.6, 5.2], { fov: 36, handheld: 0.6 });
    player.char.lookTarget = shooter.root;
    player.char.talking = true;
    await G.say('cafeteria_suplica', { skippable: false });
    player.char.talking = false;

    // mira a la cámara del techo
    shooter.lookTarget = null;
    shooter.lookUp = 1;
    rig.cut([-0.35, 2.2, 5.45], ceilingCam.ledWorld, { fov: 26, handheld: 0.4, drift: [0, 0.01, -0.01] });
    await wait(1.8);
    rig.cut([-0.75, 0.78, 5.4], null, { fov: 30, handheld: 0.5, follow: shooter.root, followOffset: [0, 1.62, 0] });
    await wait(0.4);
    shooter.lookUp = 0; shooter.lookTarget = player.char.root;
    await wait(0.6);
    shooter.talking = true;
    await G.say('cafeteria_tirador', { skippable: false });
    shooter.talking = false;

    // golpe
    shooter.setPose('pistolRaise');
    await wait(0.45);
    shooter.setPose('pistolStrike');
    await wait(0.12);
    audio.play('impact', { vol: 1, inner: true });
    ui.setFlash(1);
    ui.setFade(1);
    audio.muffle(1, 0.05);
    audio.tinnitus(0.55, 0.05);
    audio.heartbeat(0.6, 54, 0.5);
    audio.loop('amb', 'murmur', 0, { fade: 0.1 });
    await ui.flash(0.25);
    await wait(2.4);

    // ---- Desmayo ----
    player.char.tremble = 0;
    player.teleport(-0.25, 5.65, 90);
    player.char.setPose('lieFloor', true);
    player.char.eyesClosed = true;
    shooter.setVisible(false);
    andres.setVisible(true);
    andres.root.position.set(6.8, 0, 5.6);
    andres.setPose('stand');
    post.setBlur(1);
    ui.setLids(0.85);
    rig.cut([-2.55, 0.24, 5.3], [4.5, 0.9, 5.75], { fov: 50, handheld: 0.9, roll: 18 });
    await ui.fade(0, 1.2);
    spawn(() => andres.moveTo([[0.9, 5.7]], { run: true }));
    await ui.lids(0.35, 0.9);
    await wait(0.5);
    await ui.lids(0.9, 0.3);
    await ui.lids(0.45, 0.6);
    spawn(() => G.say('cafeteria_grito', { skippable: false }));
    await wait(1.4);
    await ui.lids(1, 0.9);
    await wait(0.4);
    ui.setFade(1); ui.setLids(0);
    post.setBlur(0);
    audio.tinnitus(0, 3.5);
    audio.heartbeat(0, 50, 3);
    await wait(1.5);
    await ui.intertitle(INTERTITLE);
    G.goto('hospital', { fade: 0.01 });
  },
};

function posterDraw2(bg, title, sub) {
  return (c, W, H) => {
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    c.fillStyle = '#fdf6e3'; c.textAlign = 'center';
    c.font = `bold ${Math.round(W / 4)}px Impact, "Arial Black", sans-serif`; c.fillText(title, W / 2, H * 0.4);
    c.font = `bold ${Math.round(W / 16)}px Arial`; c.fillText(sub, W / 2, H * 0.62);
  };
}
