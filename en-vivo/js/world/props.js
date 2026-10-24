// Utilería de la Colombia de 1998 construida con primitivas y texturas procedurales.
// Cada función devuelve un Group colocado en el mundo. Reemplazables por modelos de Poly Haven.

import * as THREE from 'three';
import { M, drawnTexture, std, rng } from './build.js';

const tube = () => M.metal(0x9a9c9e, 0.35);
const darkMetal = () => M.metal(0x3b3d40, 0.45);

// Pupitre universitario de brazo (silla con tablero para escribir).
export function armDesk(w, pos, rotY = 0, { collide = true, seed = 1 } = {}) {
  const g = w.group(pos, rotY);
  const wood = M.wood('#8a5f3a', 5 + (seed % 3));
  const frame = darkMetal();
  for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.2], [0.2, 0.2]]) w.cyl(0.012, 0.012, 0.44, [x, 0.22, z], frame, { parent: g });
  w.box([0.44, 0.02, 0.04], [0, 0.03, -0.18], frame, { parent: g });
  w.box([0.44, 0.02, 0.04], [0, 0.03, 0.2], frame, { parent: g });
  w.box([0.46, 0.03, 0.42], [0, 0.45, 0.01], wood, { parent: g });
  w.cyl(0.012, 0.012, 0.42, [-0.2, 0.66, -0.2], frame, { parent: g });
  w.cyl(0.012, 0.012, 0.42, [0.2, 0.66, -0.2], frame, { parent: g });
  w.box([0.44, 0.24, 0.025], [0, 0.74, -0.22], wood, { parent: g, rot: [-8, 0, 0] });
  // brazo con tablero a la derecha
  w.cyl(0.012, 0.012, 0.3, [0.22, 0.6, 0.18], frame, { parent: g });
  w.box([0.04, 0.02, 0.4], [0.22, 0.6, 0.05], frame, { parent: g });
  w.box([0.36, 0.022, 0.5], [0.12, 0.74, 0.3], wood, { parent: g, rot: [0, -8, 0] });
  w.box([0.32, 0.02, 0.04], [0, 0.18, -0.02], frame, { parent: g }); // parrilla para libros
  if (collide) w.colliderBox(...boxAround(g, 0.28, 0.3));
  return g;
}

function boxAround(g, hx, hz) {
  const p = g.position;
  return [[p.x - hx, 0, p.z - hz], [p.x + hx, 1, p.z + hz]];
}

export function teacherDesk(w, pos, rotY = 0) {
  const g = w.group(pos, rotY);
  const wood = M.wood('#6e4a2c', 9);
  w.box([1.5, 0.04, 0.7], [0, 0.76, 0], wood, { parent: g });
  w.box([1.46, 0.6, 0.02], [0, 0.45, -0.33], wood, { parent: g });
  for (const x of [-0.72, 0.72]) w.box([0.03, 0.74, 0.66], [x, 0.37, 0], wood, { parent: g });
  // libros y papeles
  w.box([0.22, 0.05, 0.3], [-0.4, 0.8, 0.05], M.paint(0x7a2b22), { parent: g, rot: [0, 12, 0] });
  w.box([0.2, 0.04, 0.28], [-0.38, 0.845, 0.04], M.paint(0x24456e), { parent: g, rot: [0, -5, 0] });
  w.box([0.3, 0.005, 0.22], [0.3, 0.783, 0.05], M.paint(0xf0ece0, 0.9), { parent: g, rot: [0, 20, 0] });
  w.collide(g.children[0]);
  w.colliderBox([pos[0] - 0.78, 0, pos[2] - 0.38], [pos[0] + 0.78, 0.8, pos[2] + 0.38]);
  return g;
}

export function chalkboard(w, pos, rotY, lines) {
  const g = w.group(pos, rotY);
  const t = drawnTexture('chalk' + lines.join(), 1024, 384, (c, W, H) => {
    c.fillStyle = '#1f3a2e'; c.fillRect(0, 0, W, H);
    // borrones de tiza
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(220,230,220,${Math.random() * 0.05})`; c.beginPath(); c.ellipse(Math.random() * W, Math.random() * H, 40 + Math.random() * 120, 10 + Math.random() * 30, Math.random(), 0, Math.PI * 2); c.fill(); }
    c.fillStyle = 'rgba(240,240,232,0.88)'; c.font = '34px "Comic Sans MS", "Segoe Print", cursive';
    lines.forEach((l, i) => c.fillText(l, 50, 70 + i * 52));
  });
  w.box([4.6, 1.25, 0.04], [0, 0, 0], M.picture('chalkboard', t, 0.85), { parent: g });
  w.box([4.7, 0.05, 0.05], [0, 0.65, 0.01], M.wood('#5a3a20'), { parent: g });
  w.box([4.7, 0.04, 0.09], [0, -0.64, 0.04], M.wood('#5a3a20'), { parent: g });
  w.box([0.12, 0.03, 0.05], [1.2, -0.6, 0.06], M.paint(0xf0f0e8), { parent: g });
  return g;
}

// Ventana con marco de aluminio, vidrio y fondo exterior luminoso (cielo/ciudad).
export function windowFrame(w, pos, rotY, width, height, { exterior = null, extDist = 0.6, mullions = 3 } = {}) {
  const g = w.group(pos, rotY);
  const al = M.metal(0xb9bcbe, 0.4);
  w.box([width + 0.08, 0.05, 0.12], [0, -height / 2, 0], al, { parent: g });
  w.box([width + 0.08, 0.05, 0.12], [0, height / 2, 0], al, { parent: g });
  for (let i = 0; i <= mullions; i++) w.box([0.04, height, 0.08], [-width / 2 + (i * width) / mullions, 0, 0], al, { parent: g });
  w.box([width, 0.03, 0.06], [0, height * 0.18, 0], al, { parent: g });
  w.plane(width, height, [0, 0, 0], M.glass(), { parent: g, cast: false, receive: false }).userData.keep = true;
  if (exterior) w.plane(width * 2.2, height * 2.2, [0, 0, -extDist], exterior, { parent: g, cast: false, receive: false, rot: [0, 0, 0] });
  return g;
}

export function door(w, pos, rotY, { open = 0, color = '#6b4528', width = 0.95, height = 2.1, sign = null } = {}) {
  const g = w.group(pos, rotY);
  const frame = M.paint(0x4a3a2a, 0.5);
  w.box([0.06, height + 0.05, 0.24], [-width / 2 - 0.03, height / 2, 0], frame, { parent: g });
  w.box([0.06, height + 0.05, 0.24], [width / 2 + 0.03, height / 2, 0], frame, { parent: g });
  w.box([width + 0.12, 0.06, 0.24], [0, height + 0.03, 0], frame, { parent: g });
  const hinge = new THREE.Group(); hinge.position.set(-width / 2, 0, 0); hinge.rotation.y = THREE.MathUtils.degToRad(open); g.add(hinge);
  w.box([width, height, 0.045], [width / 2, height / 2, 0], M.wood(color, 12), { parent: hinge });
  w.sphere(0.03, [width - 0.08, 1.0, 0.05], M.metal(0xc9a75a, 0.3), { parent: hinge });
  w.box([0.3, 0.4, 0.01], [width / 2, 1.55, 0.026], M.glass(), { parent: hinge, cast: false });
  if (sign) {
    const t = drawnTexture('doorsign' + sign, 256, 96, (c, W, H) => { c.fillStyle = '#e9e1cc'; c.fillRect(0, 0, W, H); c.fillStyle = '#222'; c.font = 'bold 44px Arial'; c.textAlign = 'center'; c.fillText(sign, W / 2, 64); });
    w.box([0.32, 0.12, 0.01], [0, height + 0.18, 0.12], M.picture('ds' + sign, t), { parent: g });
  }
  return g;
}

// Lámpara fluorescente de techo (sólo la luminaria; la luz se pone aparte).
export function fluorescent(w, pos, rotY = 0, { on = true, flicker = false, len = 1.25 } = {}) {
  const g = w.group(pos, rotY);
  w.box([0.32, 0.06, len], [0, -0.03, 0], M.paint(0xdedbd2, 0.5), { parent: g, cast: false });
  const tubeM = on ? M.emissive(0xf4f6ec, 3.2) : M.paint(0xcfd2c8, 0.3);
  for (const x of [-0.07, 0.07]) w.cyl(0.016, 0.016, len - 0.08, [x, -0.075, 0], tubeM, { parent: g, rot: [90, 0, 0], cast: false, dynamic: flicker });
  return g;
}

export function poster(w, key, pos, rotY, width, height, draw) {
  const t = drawnTexture('poster' + key, Math.round(256 * width / height) * 2, 512, draw);
  const p = w.plane(width, height, pos, M.picture('poster' + key, t, 0.7), { rot: [0, rotY, 0], receive: true });
  p.position.add(new THREE.Vector3(0, 0, 0.012).applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(rotY)));
  return p;
}

// Teléfono público de monedas, de los de la calle colombiana de los 90.
export function payphone(w, pos, rotY) {
  const g = w.group(pos, rotY);
  const shell = M.paint(0x1f4f8f, 0.35);
  const yellow = M.paint(0xf1c40f, 0.4);
  w.box([0.62, 0.9, 0.36], [0, 1.65, 0.0], yellow, { parent: g });
  w.box([0.56, 0.06, 0.4], [0, 2.12, 0.02], shell, { parent: g });
  w.box([0.26, 0.5, 0.14], [0, 1.45, 0.22], shell, { parent: g });
  w.box([0.16, 0.06, 0.02], [0, 1.66, 0.3], M.emissive(0x5a8a50, 0.6), { parent: g });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) w.box([0.04, 0.03, 0.015], [-0.05 + c * 0.05, 1.56 - r * 0.045, 0.295], M.metal(0xc0c0c0, 0.3), { parent: g });
  w.box([0.06, 0.24, 0.08], [-0.2, 1.48, 0.24], M.plastic(0x111111, 0.4), { parent: g, rot: [0, 0, 4] });
  w.cyl(0.006, 0.006, 0.4, [-0.17, 1.22, 0.26], M.metal(0x777777), { parent: g });
  const t = drawnTexture('telecom', 256, 64, (c, W, H) => { c.fillStyle = '#1f4f8f'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.font = 'bold 34px Arial'; c.textAlign = 'center'; c.fillText('TELÉFONO', W / 2, 44); });
  w.box([0.5, 0.11, 0.01], [0, 2.0, 0.185], M.picture('telecom', t, 0.5), { parent: g });
  w.colliderBox([pos[0] - 0.35, 0, pos[2] - 0.35], [pos[0] + 0.35, 2.2, pos[2] + 0.35]);
  return g;
}

export function bench(w, pos, rotY) {
  const g = w.group(pos, rotY);
  const wood = M.wood('#7a5434', 3);
  for (let i = 0; i < 3; i++) w.box([1.6, 0.03, 0.1], [0, 0.45, -0.12 + i * 0.12], wood, { parent: g });
  for (const x of [-0.7, 0.7]) { w.box([0.05, 0.45, 0.05], [x, 0.22, -0.13], darkMetal(), { parent: g }); w.box([0.05, 0.45, 0.05], [x, 0.22, 0.13], darkMetal(), { parent: g }); }
  w.collide(g);
  return g;
}

// Mesa de cafetería con tablero de formica y pata central.
export function cafeTable(w, pos, { size = 0.9, collide = true } = {}) {
  const g = w.group(pos);
  w.box([size, 0.035, size], [0, 0.74, 0], std('formica', { color: 0xe9e2cf, rough: 0.35, envI: 0.8 }), { parent: g });
  w.box([size + 0.01, 0.025, size + 0.01], [0, 0.715, 0], M.metal(0x8a8c8e, 0.4), { parent: g });
  w.cyl(0.035, 0.035, 0.72, [0, 0.36, 0], darkMetal(), { parent: g });
  w.cyl(0.25, 0.28, 0.03, [0, 0.015, 0], darkMetal(), { parent: g });
  if (collide) w.colliderBox([pos[0] - size / 2, 0, pos[2] - size / 2], [pos[0] + size / 2, 0.8, pos[2] + size / 2]);
  return g;
}

// Silla plástica tipo monobloque.
export function monobloc(w, pos, rotY, color = 0xf2f0ea) {
  const g = w.group(pos, rotY);
  const m = M.plastic(color, 0.35);
  w.box([0.44, 0.04, 0.42], [0, 0.44, 0], m, { parent: g });
  for (const [x, z] of [[-0.19, -0.17], [0.19, -0.17], [-0.2, 0.18], [0.2, 0.18]]) w.cyl(0.022, 0.03, 0.44, [x, 0.22, z], m, { parent: g, rot: [z > 0 ? 6 : -6, 0, x > 0 ? -6 : 6] });
  w.box([0.42, 0.36, 0.035], [0, 0.66, -0.22], m, { parent: g, rot: [-12, 0, 0] });
  for (const x of [-0.2, 0.2]) w.box([0.04, 0.03, 0.34], [x, 0.62, -0.04], m, { parent: g });
  return g;
}

// TV de tubo (CRT). Devuelve { group, screenPos } para poner la estática.
export function crtTV(w, pos, rotY, { scale = 1, stand = null } = {}) {
  const g = w.group(pos, rotY);
  const s = scale;
  const plast = M.plastic(0x2a2a2c, 0.5);
  w.box([0.62 * s, 0.5 * s, 0.12 * s], [0, 0, 0.18 * s], plast, { parent: g });
  w.box([0.52 * s, 0.42 * s, 0.4 * s], [0, 0, -0.08 * s], plast, { parent: g });
  w.box([0.34 * s, 0.28 * s, 0.14 * s], [0, 0, -0.33 * s], plast, { parent: g });
  w.box([0.5 * s, 0.38 * s, 0.01], [0, 0.02 * s, 0.241 * s], M.paint(0x101614, 0.15), { parent: g });
  w.box([0.04 * s, 0.04 * s, 0.01], [0.24 * s, -0.2 * s, 0.245 * s], M.emissive(0xff3322, 1.2), { parent: g });
  if (stand === 'bracket') {
    w.box([0.4 * s, 0.03, 0.5 * s], [0, -0.27 * s, -0.05 * s], darkMetal(), { parent: g });
    w.box([0.05, 0.5, 0.05], [0, -0.05, -0.38 * s], darkMetal(), { parent: g, rot: [35, 0, 0] });
  }
  return { group: g, screen: { w: 0.48 * s, h: 0.36 * s, local: [0, 0.02 * s, 0.25 * s] } };
}

export function bulletinBoard(w, pos, rotY, seed = 1) {
  const g = w.group(pos, rotY);
  const t = drawnTexture('cork' + seed, 512, 320, (c, W, H) => {
    c.fillStyle = '#b48a5a'; c.fillRect(0, 0, W, H);
    const r = rng(seed);
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(80,50,20,${r() * 0.4})`; c.fillRect(r() * W, r() * H, 2, 2); }
    const notes = ['SE BUSCA COMPAÑERO DE APTO · ZONA CENTRO', 'CLASES DE GUITARRA', 'FOTOCOPIAS $50', 'MONITORÍA CÁLCULO I', 'SE VENDE CALCULADORA CASIO', 'GRUPO DE ESTUDIO · FÍSICA'];
    for (let i = 0; i < 9; i++) {
      const x = 20 + r() * (W - 160), y = 20 + r() * (H - 110);
      c.save(); c.translate(x, y); c.rotate((r() - 0.5) * 0.2);
      c.fillStyle = ['#f4f0e0', '#f7e27a', '#bfe0f2', '#f2c0c0'][Math.floor(r() * 4)]; c.fillRect(0, 0, 130, 90);
      c.fillStyle = '#222'; c.font = 'bold 13px Arial';
      const words = notes[Math.floor(r() * notes.length)].split(' ');
      let line = '', yy = 22; for (const wd of words) { if ((line + wd).length > 15) { c.fillText(line, 8, yy); yy += 16; line = ''; } line += wd + ' '; } c.fillText(line, 8, yy);
      c.fillStyle = '#c0392b'; c.beginPath(); c.arc(65, 6, 4, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  });
  w.box([1.4, 0.88, 0.03], [0, 0, 0], M.picture('cork' + seed, t, 0.95), { parent: g });
  w.box([1.46, 0.94, 0.02], [0, 0, -0.012], M.wood('#5a3a20'), { parent: g });
  return g;
}

export function trashBin(w, pos) {
  const g = w.group(pos);
  w.cyl(0.17, 0.14, 0.5, [0, 0.25, 0], M.plastic(0x2f5f3a, 0.5), { parent: g, open: true });
  w.cyl(0.14, 0.14, 0.01, [0, 0.02, 0], M.plastic(0x2f5f3a, 0.5), { parent: g });
  return g;
}

export function plant(w, pos, s = 1) {
  const g = w.group(pos);
  w.cyl(0.18 * s, 0.13 * s, 0.32 * s, [0, 0.16 * s, 0], M.paint(0x9a4a2a, 0.8), { parent: g });
  const leaf = M.plastic(0x2f5a2a, 0.6);
  const r = rng(Math.floor(pos[0] * 10 + pos[2]));
  for (let i = 0; i < 14; i++) {
    const l = w.box([0.05 * s, 0.5 * s, 0.01], [0, 0.55 * s, 0], leaf, { parent: g });
    l.rotation.set((r() - 0.5) * 1.2, r() * Math.PI * 2, (r() - 0.5) * 1.2);
    l.position.set((r() - 0.5) * 0.1, 0.5 * s + r() * 0.2, (r() - 0.5) * 0.1);
  }
  return g;
}

// ---------- Hospital ----------

export function hospitalBed(w, pos, rotY) {
  const g = w.group(pos, rotY);
  const frame = M.metal(0xd6d8d8, 0.35);
  const sheet = std('sheet', { color: 0xe9eef0, rough: 0.9, envI: 0.4 });
  for (const [x, z] of [[-0.45, -0.95], [0.45, -0.95], [-0.45, 0.95], [0.45, 0.95]]) {
    w.cyl(0.02, 0.02, 0.45, [x, 0.27, z], frame, { parent: g });
    w.cyl(0.04, 0.04, 0.03, [x, 0.04, z], M.rubber(), { parent: g, rot: [0, 0, 90] });
  }
  w.box([0.96, 0.06, 2.0], [0, 0.48, 0], frame, { parent: g });
  w.box([0.9, 0.14, 1.94], [0, 0.58, 0], std('mattress', { color: 0x9fb8c2, rough: 0.7 }), { parent: g });
  w.box([0.92, 0.04, 1.4], [0, 0.66, -0.25], sheet, { parent: g, rot: [1.5, 0, 0] });
  w.box([0.55, 0.12, 0.35], [0, 0.72, 0.75], sheet, { parent: g, rot: [-8, 0, 0] }); // almohada
  // cabecera y piecera tubulares
  for (const z of [-1.0, 1.0]) {
    const hgt = z > 0 ? 1.05 : 0.85;
    w.box([0.96, 0.03, 0.03], [0, hgt, z], frame, { parent: g });
    for (const x of [-0.46, 0.46]) w.cyl(0.018, 0.018, hgt - 0.45, [x, (hgt + 0.45) / 2, z], frame, { parent: g });
    for (let i = 1; i < 6; i++) w.cyl(0.008, 0.008, hgt - 0.5, [-0.46 + i * 0.153, (hgt + 0.5) / 2, z], frame, { parent: g });
  }
  // barandas
  for (const x of [-0.5, 0.5]) w.box([0.02, 0.18, 0.9], [x, 0.78, 0.25], frame, { parent: g });
  w.colliderBox([pos[0] - 0.52, 0, pos[2] - 1.05], [pos[0] + 0.52, 0.9, pos[2] + 1.05]);
  return g;
}

export function heartMonitor(w, pos, rotY) {
  const g = w.group(pos, rotY);
  w.cyl(0.015, 0.015, 1.25, [0, 0.62, 0], M.metal(0xcfcfcf), { parent: g });
  w.cyl(0.25, 0.25, 0.03, [0, 0.02, 0], M.metal(0x8a8a8a), { parent: g });
  w.box([0.38, 0.3, 0.26], [0, 1.4, 0], M.plastic(0xd8d4c8, 0.5), { parent: g });
  const c = document.createElement('canvas'); c.width = 256; c.height = 160;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const scr = w.plane(0.3, 0.2, [0, 1.42, 0.131], new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.6 }), { parent: g, dynamic: true });
  const ctx = c.getContext('2d');
  let x = 0; let acc = 0;
  const ecg = (p) => { p %= 1; if (p < 0.08) return Math.sin(p / 0.08 * Math.PI) * 6; if (p > 0.18 && p < 0.2) return -10; if (p >= 0.2 && p < 0.24) return 55 * (1 - Math.abs(p - 0.22) / 0.02); if (p >= 0.24 && p < 0.27) return -15; if (p > 0.4 && p < 0.55) return Math.sin((p - 0.4) / 0.15 * Math.PI) * 10; return 0; };
  ctx.fillStyle = '#020a06'; ctx.fillRect(0, 0, 256, 160);
  w.updaters.push((dt, time) => {
    acc += dt;
    while (acc > 1 / 120) {
      acc -= 1 / 120;
      ctx.fillStyle = '#020a06'; ctx.fillRect(x, 0, 8, 160);
      const y = 80 - ecg(time * 1.05 + x / 256 * 0.0);
      ctx.fillStyle = '#4dff7a'; ctx.fillRect(x, y, 2, 2);
      x = (x + 1) % 256;
    }
    ctx.fillStyle = '#020a06'; ctx.fillRect(170, 4, 84, 30);
    ctx.fillStyle = '#4dff7a'; ctx.font = 'bold 24px monospace'; ctx.fillText('♥ 63', 176, 28);
    t.needsUpdate = true;
  });
  return g;
}

export function ivStand(w, pos) {
  const g = w.group(pos);
  w.cyl(0.012, 0.012, 1.8, [0, 0.9, 0], M.metal(0xd0d0d0), { parent: g });
  for (let i = 0; i < 5; i++) w.box([0.3, 0.02, 0.03], [0, 0.03, 0], M.metal(0x9a9a9a), { parent: g, rot: [0, i * 72, 0] });
  w.box([0.12, 0.2, 0.04], [0.08, 1.65, 0], std('ivbag', { color: 0xe8f4f6, rough: 0.2, transparent: true, opacity: 0.7 }), { parent: g });
  return g;
}

export function wheelchair(w, pos, rotY) {
  const g = w.group(pos, rotY);
  const fr = M.metal(0xb0b2b4, 0.3);
  for (const x of [-0.3, 0.3]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.018, 8, 28), M.rubber());
    wheel.position.set(x, 0.3, -0.05); wheel.rotation.y = Math.PI / 2; wheel.castShadow = true; g.add(wheel);
    w.cyl(0.035, 0.035, 0.03, [x, 0.08, 0.35], M.rubber(), { parent: g, rot: [0, 0, 90] });
    w.cyl(0.012, 0.012, 0.6, [x, 0.6, -0.25], fr, { parent: g });
  }
  w.box([0.55, 0.03, 0.45], [0, 0.5, 0.05], std('vinylseat', { color: 0x262a2e, rough: 0.5 }), { parent: g });
  w.box([0.55, 0.38, 0.03], [0, 0.72, -0.24], std('vinylseat', { color: 0x262a2e, rough: 0.5 }), { parent: g });
  w.box([0.5, 0.02, 0.15], [0, 0.12, 0.42], fr, { parent: g });
  w.colliderBox([pos[0] - 0.35, 0, pos[2] - 0.4], [pos[0] + 0.35, 0.9, pos[2] + 0.45]);
  return g;
}

export function sideTable(w, pos, rotY) {
  const g = w.group(pos, rotY);
  const m = M.plastic(0xd8d2c2, 0.5);
  w.box([0.45, 0.7, 0.4], [0, 0.35, 0], m, { parent: g });
  w.box([0.4, 0.15, 0.01], [0, 0.52, 0.201], M.paint(0xc8c2b2), { parent: g });
  w.cyl(0.035, 0.03, 0.12, [0.1, 0.76, 0.05], std('cup', { color: 0xf0f0f0, rough: 0.2 }), { parent: g });
  w.box([0.2, 0.03, 0.15], [-0.08, 0.715, -0.05], M.paint(0x6e8a9a), { parent: g });
  w.colliderBox([pos[0] - 0.25, 0, pos[2] - 0.22], [pos[0] + 0.25, 0.8, pos[2] + 0.22]);
  return g;
}

export function chair(w, pos, rotY) {
  const g = w.group(pos, rotY);
  const fr = darkMetal();
  const seat = std('chairVinyl', { color: 0x3e5a5e, rough: 0.55 });
  for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) w.cyl(0.012, 0.012, 0.45, [x, 0.22, z], fr, { parent: g });
  w.box([0.46, 0.06, 0.46], [0, 0.47, 0], seat, { parent: g });
  w.box([0.46, 0.4, 0.05], [0, 0.78, -0.22], seat, { parent: g });
  for (const x of [-0.2, 0.2]) w.cyl(0.012, 0.012, 0.4, [x, 0.66, -0.22], fr, { parent: g });
  w.colliderBox([pos[0] - 0.27, 0, pos[2] - 0.27], [pos[0] + 0.27, 0.8, pos[2] + 0.27]);
  return g;
}

// Chaqueta de jean doblada sobre el espaldar, con la mancha.
export function jacketOnChair(w, chairGroup) {
  const den = M.fabric('#4a6a96', 'denim', 3);
  w.box([0.48, 0.5, 0.07], [0, 0.82, -0.25], den, { parent: chairGroup, rot: [-6, 0, 0] });
  w.box([0.44, 0.05, 0.42], [0, 0.52, -0.02], den, { parent: chairGroup });
  w.box([0.1, 0.45, 0.06], [0.24, 0.6, -0.2], den, { parent: chairGroup, rot: [0, 0, -10] });
  const stain = drawnTexture('stain', 128, 128, (c) => {
    const r = rng(5);
    for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(60,18,14,${0.25 + r() * 0.4})`; c.beginPath(); c.ellipse(64 + (r() - 0.5) * 50, 54 + (r() - 0.3) * 60, 6 + r() * 18, 6 + r() * 14, r() * 3, 0, Math.PI * 2); c.fill(); }
  });
  const sm = new THREE.MeshStandardMaterial({ map: stain, transparent: true, roughness: 0.6, depthWrite: false });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), sm);
  s.position.set(0.08, 0.86, -0.213); s.rotation.x = THREE.MathUtils.degToRad(-6);
  chairGroup.add(s);
}

export function calendar(w, pos, rotY) {
  const t = drawnTexture('calendar98', 384, 512, (c, W, H) => {
    c.fillStyle = '#f5f1e6'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#c0392b'; c.fillRect(0, 0, W, 190);
    c.fillStyle = '#fff'; c.font = 'bold 26px Arial'; c.textAlign = 'center';
    c.fillText('DROGUERÍA LA ECONOMÍA', W / 2, 40);
    c.font = 'bold 56px Arial'; c.fillText('OCTUBRE', W / 2, 120); c.font = 'bold 40px Arial'; c.fillText('1998', W / 2, 170);
    c.fillStyle = '#333'; c.font = 'bold 18px Arial';
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    days.forEach((d, i) => c.fillText(d, 30 + i * 54, 225));
    c.font = '22px Arial';
    // octubre de 1998 empezó un jueves
    for (let d = 1; d <= 31; d++) {
      const idx = d + 3; const col = idx % 7, row = Math.floor(idx / 7);
      c.fillStyle = col === 0 ? '#c0392b' : '#333';
      c.fillText(String(d), 30 + col * 54, 265 + row * 46);
      if (d < 14) { c.strokeStyle = 'rgba(30,30,120,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(14 + col * 54, 250 + row * 46); c.lineTo(46 + col * 54, 272 + row * 46); c.stroke(); }
    }
  });
  return w.plane(0.36, 0.48, pos, M.picture('calendar98', t, 0.8), { rot: [0, rotY, 0] });
}

export function curtain(w, pos, rotY, width, height, color = 0x8fa9a0) {
  const g = w.group(pos, rotY);
  const m = std('curtain' + color, { color, rough: 0.95, side: THREE.DoubleSide });
  const n = 8;
  for (let i = 0; i < n; i++) w.box([width / n + 0.02, height, 0.02], [-width / 2 + (i + 0.5) * width / n, 0, Math.sin(i * 1.7) * 0.04], m, { parent: g, rot: [0, (i % 2 ? 12 : -12), 0] });
  return g;
}
