// Personajes provisionales articulados con animación procedural.
// Jerarquía: root → body → hips → (muslos → rodillas → tobillos) y (espalda → cuello → cabeza, hombros → codos → manos).
// Cuando haya modelos y animaciones reales (Mixamo/Character Creator en .glb) se reemplaza `buildBody`.

import * as THREE from 'three';
import { M, tex, rng, std } from './build.js';

const D = THREE.MathUtils.degToRad;

function capsule(r, len, mat, seg = 10) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len), 4, seg), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function sph(r, mat, seg = 18) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function bx(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
// ---------- Geometría anatómica (compartida entre personajes) ----------

const geoCache = new Map();
function cached(key, make) { if (!geoCache.has(key)) geoCache.set(key, make()); return geoCache.get(key); }
function meshOf(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; }

// Extremidad que se adelgaza, con un leve volumen muscular (muslo, pantorrilla, brazo).
function taper(rTop, rBot, len, mat, bulge = 0, bulgeAt = 0.5) {
  const geo = cached(`taper${rTop}|${rBot}|${len}|${bulge}|${bulgeAt}`, () => {
    const pts = [];
    for (let i = 0; i <= 4; i++) { const a = -Math.PI / 2 + (i / 4) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(0.0005, Math.cos(a) * rBot), -len / 2 + Math.sin(a) * rBot)); }
    const N = 10;
    for (let i = 1; i < N; i++) {
      const t = i / N;
      const b = Math.exp(-Math.pow((t - bulgeAt) / 0.28, 2));
      pts.push(new THREE.Vector2(rBot + (rTop - rBot) * t + bulge * b, -len / 2 + len * t));
    }
    for (let i = 0; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(0.0005, Math.cos(a) * rTop), len / 2 + Math.sin(a) * rTop)); }
    return new THREE.LatheGeometry(pts, 14);
  });
  return meshOf(geo, mat);
}

// Torso con cadera, cintura, pecho y hombros (perfil de revolución, luego aplanado).
function torsoGeo(fem, grow = 1) {
  return cached(`torso${fem}${grow}`, () => {
    const prof = fem
      ? [[0.001, -0.02], [0.14, 0], [0.145, 0.06], [0.118, 0.18], [0.13, 0.27], [0.15, 0.35], [0.145, 0.43], [0.128, 0.49], [0.095, 0.535], [0.05, 0.56], [0.001, 0.565]]
      : [[0.001, -0.02], [0.128, 0], [0.133, 0.06], [0.124, 0.17], [0.134, 0.26], [0.153, 0.36], [0.158, 0.43], [0.145, 0.49], [0.11, 0.535], [0.055, 0.56], [0.001, 0.565]];
    return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r * grow, y)), 20);
  });
}

// Cabeza esculpida: mandíbula, mentón, nariz, cuencas, cejas y pómulos sobre una esfera.
function headGeo(fem) {
  return cached('head' + fem, () => {
    const g = new THREE.SphereGeometry(0.1, 36, 28);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      let { x, y, z } = v;
      const front = Math.max(0, z);
      let d = 0;
      d += 0.22 * Math.exp(-(x * x) / 0.010 - ((y + 0.08) ** 2) / 0.028) * front ** 4;               // nariz
      d -= 0.07 * Math.exp(-(((Math.abs(x) - 0.36) ** 2) + (y - 0.12) ** 2) / 0.011) * front;        // cuencas
      d += 0.04 * Math.exp(-((y - 0.25) ** 2) / 0.004 - (x * x) / 0.16) * (front > 0.5 ? 1 : 0);    // ceja
      d += 0.035 * Math.exp(-(((Math.abs(x) - 0.55) ** 2) / 0.02) - ((y + 0.02) ** 2) / 0.02) * front; // pómulos
      d += 0.025 * Math.exp(-(x * x) / 0.02 - ((y + 0.38) ** 2) / 0.006) * front ** 2;                // labios
      if (y < -0.1) { const k = -(y + 0.1); x *= 1 - (fem ? 0.42 : 0.33) * k; if (z > 0) z += 0.07 * k; } // mandíbula y mentón
      if (z > 0.3) z = 0.3 + (z - 0.3) * 0.86; // cara más plana
      if (z < -0.2) z *= 1.04;                 // nuca
      const r = 0.1 * (1 + d);
      p.setXYZ(i, x * 0.93 * r, y * 1.13 * r, z * r);
    }
    g.computeVertexNormals();
    return g;
  });
}

function pivot(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }
function at(obj, x, y, z, parent) { obj.position.set(x, y, z); parent.add(obj); return obj; }

const fabricMat = (f) => (f.kind ? M.fabric(f.color, f.kind, f.seed || 21) : M.plastic(f.color, 0.85));

// ---------- Construcción del cuerpo ----------

export function buildBody(spec) {
  const fem = spec.build === 'f';
  const k = spec.height || 1;
  const sw = fem ? 0.17 : 0.2; // media anchura de hombros
  const skin = M.skin(spec.skin);
  const hairM = M.hair(spec.hair);
  const top = fabricMat(spec.top);
  const bottom = fabricMat(spec.bottom);
  const shoes = M.plastic(spec.shoes || 0xd8d3c8, 0.7);
  const jacket = spec.jacket ? fabricMat(spec.jacket) : null;
  const sleeve = jacket || top;
  const dark = M.paint(0x161210, 0.4);

  const root = new THREE.Group();
  const body = pivot(root, 0, 0, 0);
  const hips = pivot(body, 0, 0.95 * k, 0);
  const J = { root, body, hips };

  // Pelvis
  const pelvis = capsule(0.105, fem ? 0.14 : 0.12, bottom); pelvis.rotation.z = Math.PI / 2; pelvis.scale.set(1, 1, 0.85); at(pelvis, 0, 0.0, 0, hips);

  // Piernas
  for (const s of [-1, 1]) {
    const side = s < 0 ? 'L' : 'R';
    const thigh = pivot(hips, 0.095 * s, -0.02, 0);
    at(taper(fem ? 0.085 : 0.08, 0.055, 0.32 * k, bottom, 0.012, 0.7), 0, -0.215 * k, 0, thigh);
    const knee = pivot(thigh, 0, -0.43 * k, 0);
    at(taper(0.056, 0.04, 0.33 * k, bottom, 0.012, 0.72), 0, -0.21 * k, 0, knee);
    const ankle = pivot(knee, 0, -0.43 * k, 0);
    const shoe = capsule(0.05, 0.16, shoes, 8); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.15, 1, 0.75); at(shoe, 0, -0.045, 0.045, ankle);
    const sole = bx(0.1, 0.02, 0.27, M.rubber()); at(sole, 0, -0.08, 0.045, ankle);
    J['thigh' + side] = thigh; J['knee' + side] = knee; J['ankle' + side] = ankle;
  }

  // Torso
  const spine = pivot(hips, 0, 0.05, 0);
  const sx = fem ? 1.1 : 1.24, sz = fem ? 0.78 : 0.74;
  const torso = meshOf(torsoGeo(fem), top); torso.scale.set(sx, k, sz); at(torso, 0, 0, 0, spine);
  if (spec.accent && spec.accentStyle === 'band') {
    const band = meshOf(torsoGeo(fem, 1.015), fabricMat(spec.accent)); band.scale.set(sx, k, sz); at(band, 0, 0, 0, spine);
    band.geometry = cached('band' + fem, () => { const g = torsoGeo(fem, 1.015).clone(); const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const y = pp.getY(i); pp.setY(i, Math.min(0.36, Math.max(0.22, y))); } g.computeVertexNormals(); return g; });
  }
  if (jacket) {
    const shell = meshOf(torsoGeo(fem, 1.07), jacket); shell.scale.set(sx, k, sz); at(shell, 0, 0, 0, spine);
    const collar = taper(0.05, 0.05, 0.2, jacket); collar.rotation.z = Math.PI / 2; collar.scale.set(1, 1, 0.55); at(collar, 0, 0.53, -0.045, spine);
  }
  if (spec.accent && spec.accentStyle !== 'band') {
    // buzo/camisa vista por la chaqueta abierta
    const front = bx(0.12, 0.4, 0.02, fabricMat(spec.accent)); front.rotation.x = D(-4); at(front, 0, 0.27, jacket ? 0.123 : 0.115, spine);
  }
  if (spec.hood) { const hood = sph(0.1, fabricMat(spec.accent || spec.top), 12); hood.scale.set(1.3, 0.55, 0.8); at(hood, 0, 0.53, -0.1, spine); }
  if (spec.backpack) {
    const bp = capsule(0.12, 0.18, M.fabric(spec.backpack, 'knit', 9), 10); bp.scale.set(1.15, 1, 0.55); at(bp, 0, 0.28, -0.17, spine);
    for (const s of [-1, 1]) { const strap = bx(0.035, 0.36, 0.02, M.rubber(0x222222)); at(strap, 0.09 * s, 0.32, 0.11, spine); }
  }

  // Cuello y cabeza
  const neck = pivot(spine, 0, 0.55, 0);
  at(capsule(0.045, 0.06, skin, 8), 0, 0.02, 0, neck);
  const head = pivot(neck, 0, 0.06, 0);
  const skull = meshOf(headGeo(fem), skin); at(skull, 0, 0.115, 0, head);
  for (const s of [-1, 1]) { const ear = sph(0.021, skin, 8); ear.scale.set(0.45, 1, 0.75); at(ear, 0.091 * s, 0.112, -0.004, head); }
  const eyes = [];
  const eyeM = std('iris', { color: 0x2a1a10, rough: 0.15, envI: 2 });
  const white = std('sclera', { color: 0xe6e0d6, rough: 0.2, envI: 1.5 });
  for (const s of [-1, 1]) {
    const ew = sph(0.0115, white, 12); ew.scale.set(1.15, 0.8, 0.7); at(ew, 0.033 * s, 0.129, 0.078, head);
    const e = sph(0.0062, eyeM, 10); e.scale.set(1, 1, 0.5); at(e, 0.033 * s, 0.129, 0.0855, head); eyes.push(e, ew);
    const lid = bx(0.028, 0.006, 0.012, skin); at(lid, 0.033 * s, 0.1375, 0.082, head);
    const brow = bx(0.03, 0.006, 0.008, hairM); brow.rotation.z = D(-8 * s); at(brow, 0.034 * s, 0.146, 0.088, head);
  }
  const mouth = bx(0.03, 0.005, 0.008, M.paint(0x6a3430, 0.5)); at(mouth, 0, 0.0755, 0.087, head);
  J.eyes = eyes; J.mouth = mouth;
  if (spec.glasses) {
    const gm = M.metal(0x222222, 0.3);
    for (const s of [-1, 1]) { const lens = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.003, 6, 16), gm); at(lens, 0.035 * s, 0.128, 0.104, head); }
  }
  buildHair(head, spec.hairStyle || 'short', hairM);
  J.neck = neck; J.head = head; J.spine = spine;

  // Brazos
  for (const s of [-1, 1]) {
    const side = s < 0 ? 'L' : 'R';
    const sh = pivot(spine, sw * s, 0.47, 0);
    at(sph(0.06, sleeve, 10), 0, 0, 0, sh);
    at(taper(0.052, 0.042, 0.22, sleeve, 0.008, 0.6), 0, -0.15, 0, sh);
    const el = pivot(sh, 0, -0.3, 0);
    const longSleeve = spec.sleeves !== 'short' || jacket;
    at(taper(longSleeve ? 0.045 : 0.04, longSleeve ? 0.038 : 0.03, 0.2, longSleeve ? sleeve : skin, 0.006, 0.7), 0, -0.13, 0, el);
    if (!longSleeve) at(taper(0.05, 0.047, 0.04, sleeve), 0, 0.06, 0, el);
    const hand = pivot(el, 0, -0.27, 0);
    const palm = taper(0.032, 0.026, 0.07, skin); palm.scale.set(1, 1, 0.55); at(palm, 0, -0.045, 0, hand);
    const thumb = taper(0.012, 0.01, 0.035, skin); thumb.rotation.z = D(25 * s); at(thumb, -0.022 * s, -0.035, 0.012, hand);
    J['shoulder' + side] = sh; J['elbow' + side] = el; J['hand' + side] = hand;
  }
  return J;
}

function buildHair(head, style, m) {
  // Casquete inclinado hacia atrás: cubre la nuca y deja libre la frente.
  const cap = (r, sx, sy, sz, y, z, thetaLen = Math.PI * 0.55) => {
    const g = new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, thetaLen);
    const h = new THREE.Mesh(g, m); h.castShadow = true;
    h.scale.set(sx, sy, sz); h.position.set(0, y, z); h.rotation.x = -0.42; head.add(h); return h;
  };
  if (style === 'bald') return;
  cap(0.104, 0.98, 1.16, 1.04, 0.12, -0.006);
  const r = rng(style.length * 13);
  if (style === 'messy') {
    // mechones despeinados, aplanados contra el cráneo
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2, b = 0.3 + r() * 0.9;
      const t = sph(0.035, m, 8); t.scale.set(1.3, 0.45, 0.9);
      t.position.set(Math.cos(a) * Math.sin(b) * 0.098, 0.125 + Math.cos(b) * 0.098, Math.sin(a) * Math.sin(b) * 0.1 - 0.01);
      if (t.position.z > 0.05 && t.position.y < 0.19) t.position.y = 0.19;
      t.lookAt(0, 0.12, 0); t.rotateX(Math.PI / 2); head.add(t);
    }
    const fringe = sph(0.05, m, 10); fringe.scale.set(1.6, 0.4, 0.7); fringe.position.set(0.02, 0.2, 0.068); fringe.rotation.set(-0.5, 0, -0.2); head.add(fringe);
  } else if (style === 'curly') {
    for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, b = r() * 1.2; const t = sph(0.03, m, 8); t.position.set(Math.cos(a) * Math.sin(b) * 0.1, 0.13 + Math.cos(b) * 0.1, Math.sin(a) * Math.sin(b) * 0.1); head.add(t); }
  } else if (style === 'long' || style === 'ponytail') {
    const back = bx(0.2, style === 'long' ? 0.28 : 0.12, 0.06, m); back.position.set(0, style === 'long' ? 0.03 : 0.12, -0.075); head.add(back);
    if (style === 'ponytail') { const tail = capsule(0.03, 0.14, m, 8); tail.position.set(0, 0.02, -0.12); tail.rotation.x = D(20); head.add(tail); }
    else for (const s of [-1, 1]) { const side = bx(0.03, 0.22, 0.12, m); side.position.set(0.095 * s, 0.05, -0.02); head.add(side); }
  } else if (style === 'combed') {
    const part = bx(0.12, 0.03, 0.18, m); part.position.set(0.01, 0.215, 0); part.rotation.z = D(-6); head.add(part);
  }
}

// ---------- Poses ----------
// Ángulos objetivo por articulación (radianes). Lo que no aparece vuelve a 0.

const POSES = {
  stand: {},
  sit: { hipsY: 0.5, thighL: [-1.5], thighR: [-1.45], kneeL: [1.5], kneeR: [1.45], shoulderL: [-0.55, 0, 0.12], shoulderR: [-0.6, 0, -0.12], elbowL: [-1.15], elbowR: [-1.2], spine: [0.12] },
  sitWrite: { hipsY: 0.5, thighL: [-1.5], thighR: [-1.45], kneeL: [1.5], kneeR: [1.45], shoulderL: [-0.6, 0, 0.15], shoulderR: [-0.75, 0, -0.1], elbowL: [-1.25], elbowR: [-1.1], spine: [0.3], head: [0.35] },
  sitBed: { hipsY: 0.62, thighL: [-1.45], thighR: [-1.4], kneeL: [1.35], kneeR: [1.4], shoulderL: [-0.25, 0, 0.18], shoulderR: [-0.25, 0, -0.18], elbowL: [-0.6], elbowR: [-0.6], spine: [0.35], head: [0.45] },
  crouch: { hipsY: 0.36, thighL: [-2.15, 0, 0.1], thighR: [-2.1, 0, -0.1], kneeL: [2.45], kneeR: [2.4], ankleL: [-0.3], ankleR: [-0.3], spine: [0.5], head: [0.25], shoulderL: [-0.85, 0, -0.22], shoulderR: [-0.85, 0, 0.22], elbowL: [-2.05], elbowR: [-2.05] },
  lie: { lie: 1, shoulderL: [0.05, 0, 0.18], shoulderR: [0.05, 0, -0.18], elbowL: [-0.2], elbowR: [-0.2], head: [0.1, 0.25] },
  lieFloor: { lie: 1, floor: 1, thighL: [-0.25, 0, 0.12], kneeL: [0.5], thighR: [0.05, 0, -0.05], shoulderL: [-0.4, 0, 0.9], shoulderR: [0.1, 0, -0.4], elbowL: [-1.0], elbowR: [-0.3], head: [0.15, -0.6] },
  rifle: { shoulderR: [-0.85, 0, -0.15], elbowR: [-1.25], shoulderL: [-1.25, 0, 0.35], elbowL: [-0.55], spine: [0.08] },
  rifleAim: { shoulderR: [-1.35, 0, -0.2], elbowR: [-0.75], shoulderL: [-1.5, 0, 0.45], elbowL: [-0.25], spine: [0.05], head: [0.12, 0.15] },
  pistolAim: { shoulderR: [-1.5, 0.05, -0.04], elbowR: [-0.03], shoulderL: [-1.35, 0, 0.42], elbowL: [-0.42], spine: [0.1], head: [0.22] },
  pistolRaise: { shoulderR: [-2.7, 0, -0.25], elbowR: [-1.1], shoulderL: [-0.4, 0, 0.2], elbowL: [-0.5], spine: [-0.08] },
  pistolStrike: { shoulderR: [-1.0, 0, -0.1], elbowR: [-0.2], shoulderL: [-0.3, 0, 0.2], elbowL: [-0.5], spine: [0.35], head: [0.3] },
  wave: { shoulderR: [-2.6, 0, -0.35], elbowR: [-0.5] },
  shout: { shoulderR: [-1.3, 0, -0.2], elbowR: [-0.3], shoulderL: [-0.4, 0, 0.2], spine: [0.1] },
  lean: { hipsY: 0.5, thighL: [-1.5], thighR: [-1.45], kneeL: [1.5], kneeR: [1.45], spine: [0.2, -0.35, 0.16], head: [0.05, -0.45], shoulderR: [-0.7, 0, -0.1], elbowR: [-1.2], shoulderL: [-0.5, 0, 0.1], elbowL: [-1.0] },
};

const JOINTS = ['thighL', 'thighR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'spine', 'head'];

// ---------- Personaje ----------

export class Character {
  constructor(world, spec, { name = 'Estudiante', pos = [0, 0, 0], rotY = 0, castShadow = true } = {}) {
    this.world = world;
    this.name = name;
    this.spec = spec;
    this.J = buildBody(spec);
    this.root = this.J.root;
    this.root.position.set(...pos);
    this.root.rotation.y = D(rotY);
    world.scene.add(this.root);
    this.root.traverse((o) => { if (o.isMesh) { o.castShadow = castShadow; o.userData.static = false; } });
    world.chars.push(this);

    // sombra de contacto
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: tex.blobShadow(), transparent: true, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.renderOrder = 1;
    world.scene.add(blob);
    this.blob = blob;

    this.pose = 'stand';
    this.ang = {}; for (const j of JOINTS) this.ang[j] = [0, 0, 0];
    this.hipsY = 0.95 * (spec.height || 1); this.lie = 0; this.floorLie = 0;
    this.phase = Math.random() * 6; this.speed = 0; this.lastPos = this.root.position.clone();
    this.tremble = 0; this.talking = false; this.lookUp = 0; this.headYaw = 0; this.lookTarget = null;
    this.blinkT = 1 + Math.random() * 3; this.t = Math.random() * 10;
    this.path = null; this.lowFreq = false; this.frame = 0; this.idleSeed = Math.random() * 10;
    this.gesture = 0;
  }

  setPose(p, instant = false) {
    this.pose = p;
    if (instant) this._applyTargets(1);
  }

  get position() { return this.root.position; }
  socket(name) { return this.J[name]; }

  // Camina (o corre) por una lista de puntos [x,z] o [x,y,z]. Devuelve una promesa al llegar.
  moveTo(points, { run = false, speed = null, hideOnArrive = false } = {}) {
    return new Promise((resolve) => {
      if (this.path && this.path.resolve) this.path.resolve();
      this.path = {
        pts: points.map((p) => new THREE.Vector3(p[0], 0, p.length === 3 ? p[2] : p[1])),
        i: 0, speed: speed || (run ? 4.4 : 1.35), run, hideOnArrive, resolve,
      };
    });
  }
  stop() { if (this.path) { const r = this.path.resolve; this.path = null; r && r(); } }

  face(target, instant = false) {
    const t = target.isVector3 ? target : new THREE.Vector3(target[0], 0, target.length === 3 ? target[2] : target[1]);
    const yaw = Math.atan2(t.x - this.root.position.x, t.z - this.root.position.z);
    if (instant) { this.root.rotation.y = yaw; this.turnTo = null; } else this.turnTo = yaw;
  }

  setVisible(v) { this.root.visible = v; this.blob.visible = v; }

  _applyTargets(k) {
    const P = POSES[this.pose] || POSES.stand;
    for (const j of JOINTS) {
      const tgt = P[j] || [0, 0, 0];
      const a = this.ang[j];
      for (let c = 0; c < 3; c++) a[c] += ((tgt[c] || 0) - a[c]) * k;
    }
    const baseH = 0.95 * (this.spec.height || 1);
    this.hipsY += ((P.hipsY != null ? P.hipsY : baseH) - this.hipsY) * k;
    this.lie += ((P.lie || 0) - this.lie) * k;
    this.floorLie += ((P.floor || 0) - this.floorLie) * k;
  }

  update(dt) {
    this.t += dt;
    this.frame++;
    if (this.lowFreq && this.frame % 2) return;
    if (this.lowFreq) dt *= 2;
    const root = this.root;

    // Movimiento por ruta
    if (this.path) {
      const p = this.path;
      const target = p.pts[p.i];
      const d = new THREE.Vector3(target.x - root.position.x, 0, target.z - root.position.z);
      const dist = d.length();
      const step = p.speed * dt;
      if (dist <= Math.max(step, 0.04)) {
        root.position.x = target.x; root.position.z = target.z;
        p.i++;
        if (p.i >= p.pts.length) { this.path = null; if (p.hideOnArrive) this.setVisible(false); p.resolve(); }
      } else {
        d.multiplyScalar(1 / dist);
        root.position.addScaledVector(d, step);
        this.turnTo = Math.atan2(d.x, d.z);
      }
    }
    if (this.turnTo != null) {
      let diff = ((this.turnTo - root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      root.rotation.y += diff * Math.min(1, dt * 9);
      if (Math.abs(diff) < 0.01) this.turnTo = null;
    }

    // Velocidad medida (sirve igual para el jugador que para los PNJ)
    const moved = Math.hypot(root.position.x - this.lastPos.x, root.position.z - this.lastPos.z);
    this.lastPos.copy(root.position);
    const inst = dt > 0 ? moved / dt : 0;
    this.speed += (Math.min(inst, 7) - this.speed) * Math.min(1, dt * 10);

    this._applyTargets(1 - Math.exp(-dt * 9));
    const J = this.J, A = this.ang;
    const s = this.speed;
    const walking = s > 0.15 && (this.pose === 'stand' || this.pose.startsWith('rifle') || this.pose === 'pistolAim');
    const runK = THREE.MathUtils.clamp((s - 1.8) / 2.4, 0, 1);
    this.phase += dt * (walking ? 2.3 * s + 1.8 : 0);
    const ph = this.phase;
    const w = walking ? Math.min(1, s / 1.2) : 0;

    // Piernas
    const legA = (0.42 + 0.4 * runK) * w;
    const kneeA = (0.7 + 0.7 * runK) * w;
    const swing = (ph2) => -Math.sin(ph2) * legA;
    const knee = (ph2) => Math.pow(Math.max(0, Math.cos(ph2)), 1.4) * kneeA + 0.06 * w;
    J.thighL.rotation.set(A.thighL[0] + swing(ph), A.thighL[1], A.thighL[2]);
    J.thighR.rotation.set(A.thighR[0] + swing(ph + Math.PI), A.thighR[1], A.thighR[2]);
    J.kneeL.rotation.x = A.kneeL[0] + knee(ph);
    J.kneeR.rotation.x = A.kneeR[0] + knee(ph + Math.PI);
    J.ankleL.rotation.x = A.ankleL[0] - Math.sin(ph) * 0.2 * w;
    J.ankleR.rotation.x = A.ankleR[0] + Math.sin(ph) * 0.2 * w;

    // Brazos: balanceo al caminar sólo si la pose no los ocupa
    const armsFree = !['rifle', 'rifleAim', 'pistolAim', 'pistolRaise', 'pistolStrike', 'wave', 'crouch', 'shout'].includes(this.pose);
    const armA = (0.35 + 0.5 * runK) * w * (armsFree ? 1 : 0);
    const breathe = Math.sin(this.t * 1.7 + this.idleSeed);
    let gL = 0, gR = 0;
    if (this.talking && armsFree && !walking && this.pose === 'stand') {
      this.gesture += dt;
      gR = (Math.sin(this.gesture * 2.1) * 0.5 + 0.5) * 0.45; gL = (Math.sin(this.gesture * 1.3 + 2) * 0.5 + 0.5) * 0.2;
    }
    J.shoulderL.rotation.set(A.shoulderL[0] + Math.sin(ph) * armA - gL, A.shoulderL[1], A.shoulderL[2] + 0.08 + breathe * 0.01);
    J.shoulderR.rotation.set(A.shoulderR[0] - Math.sin(ph) * armA - gR, A.shoulderR[1], A.shoulderR[2] - 0.08 - breathe * 0.01);
    J.elbowL.rotation.x = A.elbowL[0] - (0.15 + 0.9 * runK) * w * (armsFree ? 1 : 0) - gL * 1.5;
    J.elbowR.rotation.x = A.elbowR[0] - (0.15 + 0.9 * runK) * w * (armsFree ? 1 : 0) - gR * 1.5;
    if (this.pose === 'wave') J.shoulderR.rotation.z += Math.sin(this.t * 9) * 0.25;

    // Tronco y cabeza
    J.spine.rotation.set(A.spine[0] + 0.18 * runK + breathe * 0.012, A.spine[1], A.spine[2]);
    let headX = A.head[0] - this.lookUp * 0.75, headY = A.head[1];
    if (this.lookTarget && !this.lie) {
      const lt = this.lookTarget.isVector3 ? this.lookTarget : this.lookTarget.position;
      const local = root.worldToLocal(lt.clone());
      headY += THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -1.1, 1.1);
    }
    this.headYaw += (headY - this.headYaw) * Math.min(1, dt * 6);
    J.head.rotation.set(headX + (this.talking ? Math.sin(this.t * 5.3) * 0.04 : 0), this.headYaw, A.head[2]);

    // Cadera: rebote al caminar
    const bob = walking ? Math.abs(Math.cos(ph)) * (0.025 + 0.03 * runK) : 0;
    J.hips.position.y = this.hipsY + bob - (walking ? 0.02 + 0.05 * runK : 0);
    J.hips.rotation.y = walking ? Math.sin(ph) * 0.08 * w : 0;

    // Acostado: rota todo el cuerpo boca arriba
    J.body.rotation.x = -Math.PI / 2 * this.lie;
    J.body.position.y = this.lie * (0.12 - this.hipsY * 0) ;
    J.body.position.z = this.lie * 0.95 * (this.spec.height || 1) * 0.0;

    // Temblor de miedo
    if (this.tremble > 0) {
      const tr = this.tremble;
      J.body.position.x = (Math.random() - 0.5) * 0.006 * tr;
      J.spine.rotation.z = (Math.random() - 0.5) * 0.03 * tr;
      J.head.rotation.z += (Math.random() - 0.5) * 0.05 * tr;
      J.shoulderL.rotation.z += (Math.random() - 0.5) * 0.04 * tr;
      J.shoulderR.rotation.z += (Math.random() - 0.5) * 0.04 * tr;
    } else J.body.position.x = 0;

    // Parpadeo y boca
    this.blinkT -= dt;
    const closed = this.blinkT < 0.12 || this.eyesClosed;
    for (const e of J.eyes) e.scale.y = closed ? 0.15 : (e.userData.sy || (e.userData.sy = e.scale.y));
    if (this.blinkT < 0) this.blinkT = 2 + Math.random() * 4;
    J.mouth.scale.y = this.talking ? 1 + Math.abs(Math.sin(this.t * 13) * Math.sin(this.t * 3.7)) * 3 : 1;

    // Sombra de contacto
    this.blob.visible = this.root.visible;
    this.blob.position.set(root.position.x, (this.floorY || 0) + 0.012, root.position.z);
    const sc = this.lie ? 1.6 : 1;
    this.blob.scale.set(sc * 0.75, sc, 1);
    this.blob.rotation.z = -root.rotation.y;
  }
}

// ---------- Vestuario ----------

const SKINS = [0xc89878, 0xa8755a, 0x8a5a40, 0xd8ae90, 0x6e4632, 0xb98566];
const HAIRS = [0x1a120c, 0x2b1d14, 0x0e0b09, 0x4a3020, 0x3a2a1c];
const TOPS = [
  { color: '#7a2230', kind: 'plaid' }, { color: '#2d4f7a', kind: 'stripes' }, { color: '#d9c7a0', kind: 'knit' },
  { color: '#3f6b48', kind: 'plaid' }, { color: '#c9472f', kind: 'knit' }, { color: '#e8e2d6', kind: 'stripes' },
  { color: '#5b3f7a', kind: 'knit' }, { color: '#2a2a2a', kind: 'knit' }, { color: '#1f6f78', kind: 'stripes' },
  { color: '#e0a32a', kind: 'knit' }, { color: '#8a8f96', kind: 'knit' },
];
const BOTTOMS = [{ color: '#2f4466', kind: 'denim' }, { color: '#1f2f4d', kind: 'denim' }, { color: '#5a4632', kind: 'cord' }, { color: '#3b3b3b', kind: 'denim' }, { color: '#6f7f99', kind: 'denim' }];
const BAGS = [0x2b4d7a, 0x7a2230, 0x2e2e2e, 0x3f6b48, null, null];

export const OUTFITS = {
  mateo: { skin: 0xc28c6a, hair: 0x3a2616, hairStyle: 'messy', top: { color: '#7a2230', kind: 'plaid' }, accent: { color: '#8b8d90', kind: 'knit' }, hood: true, jacket: { color: '#4a6a96', kind: 'denim', seed: 3 }, bottom: { color: '#6a4a2c', kind: 'cord' }, shoes: 0xcfc8b8, height: 1 },
  andres: { skin: 0x8a5a3e, hair: 0x0e0b09, hairStyle: 'curly', top: { color: '#e8701e', kind: 'knit' }, accent: { color: '#f2c230', kind: 'knit' }, accentStyle: 'band', sleeves: 'long', bottom: { color: '#2b4a8a', kind: 'denim' }, shoes: 0xf0ede6, height: 0.99 },
  tirador: { skin: 0xd2ae94, hair: 0x0a0807, hairStyle: 'combed', top: { color: '#151515', kind: 'knit' }, jacket: { color: '#0d0d0d', kind: 'knit', seed: 8 }, bottom: { color: '#121212', kind: 'denim' }, shoes: 0x111111, height: 1.03 },
  profesor: { skin: 0xc49272, hair: 0x9a9690, hairStyle: 'combed', top: { color: '#a9c2df', kind: 'stripes' }, sleeves: 'long', bottom: { color: '#4a4a4a', kind: 'cord' }, shoes: 0x3a2618, glasses: true, height: 0.98 },
  camilo: { skin: 0xa8755a, hair: 0x1a120c, hairStyle: 'short', top: { color: '#2f6b48', kind: 'stripes' }, bottom: { color: '#2f4466', kind: 'denim' }, shoes: 0xe8e4dc, backpack: 0x2b2b2b, height: 1.01 },
};

export function randomStudent(seed) {
  const r = rng(seed * 97 + 13);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const fem = r() < 0.48;
  return {
    build: fem ? 'f' : 'm',
    skin: pick(SKINS), hair: pick(HAIRS),
    hairStyle: fem ? pick(['long', 'ponytail', 'long', 'curly']) : pick(['short', 'messy', 'curly', 'short', 'combed']),
    top: { ...pick(TOPS), seed: Math.floor(r() * 50) },
    accent: r() < 0.3 ? { color: pick(['#f2c230', '#2b6fb5', '#e8e2d6', '#c9472f']), kind: 'knit' } : null,
    accentStyle: 'band',
    sleeves: r() < 0.5 ? 'short' : 'long',
    jacket: r() < 0.2 ? { color: pick(['#4a6a96', '#3b3b3b', '#5a4632']), kind: 'denim', seed: 4 } : null,
    bottom: pick(BOTTOMS),
    shoes: pick([0xe8e4dc, 0x2a2a2a, 0x7a5a3a, 0xd8d0c0]),
    backpack: pick(BAGS),
    glasses: r() < 0.15,
    height: fem ? 0.93 + r() * 0.05 : 0.97 + r() * 0.06,
  };
}
