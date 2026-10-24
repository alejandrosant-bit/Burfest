// Escena 1 · Aula, 4:30 p. m. Clase normal, Andrés invita a almorzar, suena el timbre.

import * as THREE from 'three';
import { World, M, drawnTexture, std, rng } from '../world/build.js';
import { Character, OUTFITS, randomStudent } from '../world/characters.js';
import { Interactable, HiddenCamera, ceilingFan, wallClock } from '../world/objects.js';
import * as P from '../world/props.js';
import { Player, setObjective } from '../player.js';
import { wait, spawn } from '../core/time.js';
import { CARDS, OBJECTIVES } from '../script.js';
import { campusExterior, corridorStub } from './shared.js';

export default {
  build(G) {
    const w = new World();
    const s = w.scene;
    s.background = new THREE.Color(0x0b0b0b);
    s.fog = new THREE.Fog(0x2a2420, 18, 60);

    const cream = M.plaster('#d9cdb0', 2);
    const green = M.plaster('#8fae9a', 3);
    w.room({
      x0: -5, x1: 5, z0: -6, z1: 6, h: 3.2, upper: cream, lower: green, lowerH: 1.15, trim: M.paint(0x3e5a4c, 0.4),
      floor: M.terrazzo(), ceiling: M.ceiling(),
      openings: {
        e: [{ at: 10, w: 1.05, h: 2.15 }],
        w: [{ at: 2.5, w: 2.2, h: 1.5, sill: 1.0 }, { at: 6, w: 2.2, h: 1.5, sill: 1.0 }, { at: 9.5, w: 2.2, h: 1.5, sill: 1.0 }],
      },
    });

    // Ventanas al campus con sol de la tarde
    const ext = campusExterior('aula');
    for (const z of [-3.5, 0, 3.5]) {
      P.windowFrame(w, [-5.1, 1.75, z], 90, 2.2, 1.5, { exterior: ext, extDist: 1.2 });
      w.box([0.32, 0.04, 2.3], [-4.86, 0.99, z], M.paint(0xd8d0bc, 0.6), {}); // alféizar
      w.shaft([-5.05, 2.4, z], [1, -0.62, 0.22], { width: 2.0, length: 6.5, opacity: 0.075 });
    }
    w.sun([1, -0.62, 0.22], 0xffc690, 3.4, { center: [0, 1, 0], size: 8 });

    // Iluminación interior: fluorescentes + rebote cálido
    for (const x of [-2.5, 0.5, 3]) for (const z of [-3.2, 0.2, 3.6]) P.fluorescent(w, [x, 3.2, z], 0);
    w.spotLight([0.5, 3.15, -0.5], [0.5, 0, -0.3], 0xf3f1e6, 9, { angle: 1.15, penumbra: 0.9, distance: 12, shadow: true });
    w.pointLight([-1, 2.9, 2], 0xf3f1e6, 3.5, 9);
    w.pointLight([1.5, 2.9, -2.5], 0xf3f1e6, 5, 9);
    w.pointLight([-3.8, 1.2, 0], 0xffb878, 2.2, 6); // rebote del sol en el piso
    s.add(new THREE.HemisphereLight(0xdcd6c8, 0x6a5440, 0.35));
    ceilingFan(w, [-1.5, 3.2, -1.2], 2.4);
    ceilingFan(w, [1.8, 3.2, 2.2], 2.1);

    // Tablero, escritorio del profesor, reloj, afiches
    P.chalkboard(w, [-0.3, 1.65, 5.97], 180, [
      'Constitución Política de Colombia — 1991',
      '• Estado social de derecho (Art. 1)',
      '• Acción de tutela (Art. 86)',
      '• Participación ciudadana',
      'Parcial: jueves 19 de marzo',
    ]);
    P.teacherDesk(w, [2.2, 0, 4.4], 180);
    w.box([0.5, 0.4, 0.45], [2.9, 0.2, 5.1], M.wood('#5a3a20', 6), { collide: true }); // tarima/caja
    wallClock(w, [3.6, 2.55, 5.95], 180, 4, 30);
    P.poster(w, 'aula1', [4.94, 1.8, -2], -90, 0.7, 1.0, posterDraw('#1f4f8f', 'FORO', 'DERECHOS HUMANOS', 'Auditorio León de Greiff · 25 MAR'));
    P.poster(w, 'aula2', [4.94, 1.75, 0.5], -90, 0.62, 0.88, posterDraw('#b03a2e', 'CINE CLUB', '"LA ESTRATEGIA DEL CARACOL"', 'Miércoles 6 p. m.'));
    P.bulletinBoard(w, [-1, 1.7, -5.96], 0, 3);
    P.trashBin(w, [4.4, 0, 5.5]);
    P.door(w, [5.0, 0, 4], -90, { open: -70, sign: 'AULA 204' });
    corridorStub(w, { x0: 5.2, x1: 9, z0: 1.5, z1: 6.5, openings: { w: [{ at: 2.5, w: 1.05, h: 2.15 }] } });

    // Pupitres y estudiantes
    const cols = [-3.4, -1.9, -0.4, 1.1, 2.6];
    const rows = [2.6, 1.0, -0.6, -2.2, -3.8];
    const r = rng(1998);
    const students = [];
    let seed = 0;
    for (const z of rows) for (const x of cols) {
      P.armDesk(w, [x, 0, z], 0, { seed: seed++ });
      const isMateo = x === 1.1 && z === -0.6;
      const isAndres = x === 2.6 && z === -0.6;
      if (isMateo || isAndres) continue;
      if (r() < 0.32) continue;
      const st = new Character(w, randomStudent(seed * 7 + 3), { pos: [x, 0, z + 0.02], rotY: 0, castShadow: false });
      st.setPose(r() < 0.6 ? 'sitWrite' : 'sit', true);
      st.idleHead = r();
      students.push({ c: st, x, z });
    }

    const andres = new Character(w, OUTFITS.andres, { name: 'Andrés', pos: [2.6, 0, -0.58], rotY: 0 });
    andres.setPose('sit', true);
    const profesor = new Character(w, OUTFITS.profesor, { name: 'Profesor', pos: [-0.8, 0, 4.6], rotY: 180 });

    const rig = G.rig;
    const player = new Player(w, rig, { pos: [1.1, 0, -0.58], rotY: 0 });
    player.char.setPose('sit', true);

    const exit = new Interactable(w, { pos: [4.9, 1, 4], prompt: 'Salir al pasillo', radius: 1.6, approach: [4.25, 4.0] });

    new HiddenCamera(w, { pos: [-4.78, 2.98, -5.78], look: [0, 1, 1], id: 'CAM 02', track: false });
    w.dust([-4.8, 0.2, -5.8], [4.8, 3.1, 5.8], 520);

    return { world: w, player, andres, profesor, students, exit };
  },

  async run(G, { player, andres, profesor, students, exit }) {
    const { rig, ui, audio } = G;
    audio.loop('amb', 'roomWarm', 0.35, { fade: 2 });
    audio.loop('amb2', 'fan', 0.12, { fade: 2 });
    player.setState('cutscene');
    G.post.setGrade('film98');
    ui.setBars(1);

    // Plano general: la clase desde el fondo
    rig.cut([4.3, 2.25, -5.4], [-0.6, 1.0, 2.6], { fov: 38, handheld: 0.4, drift: [-0.06, -0.01, 0.05] });
    profesor.talking = true;
    profesor.lookTarget = player.char.root;
    spawn(async () => { // el profesor camina despacio frente al tablero mientras habla
      for (let i = 0; i < 4; i++) { await profesor.moveTo([[-2.2, 4.5]], { speed: 0.6 }); profesor.face([0, 0], false); await wait(1.5); await profesor.moveTo([[0.4, 4.5]], { speed: 0.6 }); profesor.face([0, 0], false); await wait(1.2); }
    });
    await ui.fade(0, 3);
    await ui.titleCard(CARDS.aula, 2.6);

    rig.cut([0.2, 1.4, 1.6], null, { fov: 32, handheld: 0.5, follow: profesor.root, followOffset: [0, 1.6, 0] });
    await G.say('aula_profesor', { speakers: { Profesor: profesor } });
    profesor.talking = false;

    // Andrés se inclina hacia Mateo
    rig.cut([3.65, 1.22, 0.25], [1.75, 1.0, -0.7], { fov: 38, handheld: 0.45 });
    andres.setPose('lean');
    andres.lookTarget = player.char.root;
    player.char.lookTarget = andres.root;
    await wait(0.6);
    await G.say('aula_invitacion', { speakers: { 'Andrés': andres, Mateo: player.char } });
    andres.setPose('sit');

    // Timbre
    audio.play('bell', { vol: 0.55 });
    rig.cut([4.3, 2.25, -5.4], [-0.6, 1.0, 2.6], { fov: 42, handheld: 0.5 });
    await wait(1.0);
    profesor.stop();
    profesor.face([0, 0]);
    students.forEach(({ c, x, z }, i) => {
      spawn(async () => {
        await wait(0.3 + i * 0.35 + Math.random() * 0.4);
        c.setPose('stand');
        await wait(0.6);
        const aisle = x + 0.75;
        await c.moveTo([[aisle, z], [aisle, 3.45], [4.2, 3.6], [5.4, 4.0], [7.2, 4.2]], { speed: 1.2 + Math.random() * 0.4, hideOnArrive: true });
      });
    });

    await wait(1.2);
    andres.setPose('stand');
    andres.lookTarget = player.char.root;
    rig.cut([2.9, 1.5, 1.0], null, { fov: 36, handheld: 0.5, follow: andres.root, followOffset: [0, 1.5, 0] });
    await wait(0.5);
    spawn(() => G.say('aula_salida', { skippable: false, speakers: { 'Andrés': andres } }));
    andres.lookTarget = null;
    spawn(() => andres.moveTo([[3.35, -0.6], [3.35, 3.45], [4.3, 3.7], [5.4, 4.0], [7.2, 4.2]], { run: true, hideOnArrive: true }));
    await wait(1.6);

    // Mateo se levanta: control al jugador
    player.char.setPose('stand');
    player.char.lookTarget = null;
    await wait(0.7);
    player.teleport(1.85, -0.6, 25);
    rig.release(1.0, player.root);
    await ui.bars(false, 0.8);
    player.setState('free');
    setObjective(OBJECTIVES.aula, exit, { path: [[1.85, 3.3], [4.0, 3.8]] });

    await new Promise((res) => { exit.onUse = res; });
    G.goto('pasillo');
  },
};

export function posterDraw(bg, title, sub, foot) {
  return (c, W, H) => {
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 12; i++) c.fillRect(0, i * 46, W, 18);
    c.fillStyle = '#f4ecd8'; c.textAlign = 'center';
    c.font = `bold ${Math.round(W / 5)}px Impact, "Arial Black", sans-serif`; c.fillText(title, W / 2, H * 0.32);
    c.font = `bold ${Math.round(W / 14)}px Arial`; wrap(c, sub, W / 2, H * 0.5, W * 0.85, W / 12);
    c.font = `${Math.round(W / 18)}px Arial`; c.fillText(foot, W / 2, H * 0.88);
    c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(0, H - 12, W, 12);
  };
}

function wrap(c, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { if (c.measureText(line + w).width > maxW && line) { c.fillText(line, x, y); y += lh; line = ''; } line += w + ' '; }
  c.fillText(line, x, y);
}
