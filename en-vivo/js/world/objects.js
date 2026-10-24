// Objetos con comportamiento: interactuables, zonas, cámaras ocultas, ventiladores, TV con estática.

import * as THREE from 'three';
import { M, canvasTexture, std } from './build.js';
import { audio } from '../core/audio.js';
import { ui } from '../core/ui.js';

export class Interactable {
  // pos: punto donde está el objeto. approach: dónde se para el piloto automático.
  constructor(world, { pos, prompt, radius = 1.5, approach = null, once = true, onUse = null }) {
    this.pos = new THREE.Vector3(...pos);
    this.prompt = prompt;
    this.radius = radius;
    this.approach = approach ? new THREE.Vector3(approach[0], 0, approach[1]) : null;
    this.once = once;
    this.used = false;
    this.enabled = true;
    this.onUse = onUse;
    world.interactables.push(this);
  }
  use(player) {
    if (!this.enabled || (this.once && this.used)) return;
    this.used = true;
    if (this.onUse) this.onUse(player, this);
  }
  get available() { return this.enabled && !(this.once && this.used); }
}

export class Zone {
  constructor(world, min, max) {
    this.box = new THREE.Box3(new THREE.Vector3(min[0], -1, min[1]), new THREE.Vector3(max[0], 3, max[1]));
    this.center = this.box.getCenter(new THREE.Vector3()).setY(0);
    world.zones.push(this);
  }
  contains(p) { return this.box.containsPoint(new THREE.Vector3(p.x, 0.5, p.z)); }
}

// Cámara oculta con LED rojo. Si el jugador la mira un momento, la "nota".
export class HiddenCamera {
  constructor(world, { pos, look, id = 'CAM', track = true, size = 1, ceiling = true }) {
    this.world = world;
    this.id = id;
    this.track = track;
    const g = new THREE.Group();
    g.position.set(...pos);
    world.scene.add(g);
    const body = M.plastic(0xb9b4a8, 0.4); // carcasa beige de los 90
    if (ceiling) { world.cyl(0.02, 0.02, 0.12, [0, 0.06, 0], M.metal(0x6a6a6a), { parent: g, dynamic: true }); world.cyl(0.06, 0.06, 0.015, [0, 0.12, 0], body, { parent: g, dynamic: true }); }
    const head = new THREE.Group(); g.add(head);
    const housing = world.box([0.11 * size, 0.09 * size, 0.2 * size], [0, 0, 0.02], body, { parent: head, dynamic: true });
    housing.castShadow = false;
    world.cyl(0.032 * size, 0.035 * size, 0.04 * size, [0, 0, 0.13 * size], M.paint(0x111111, 0.2), { parent: head, rot: [90, 0, 0], dynamic: true });
    const glass = world.sphere(0.024 * size, [0, 0, 0.15 * size], std('lensGlass', { color: 0x050810, rough: 0.05, metal: 0.4, envI: 2 }), { parent: head, dynamic: true });
    glass.scale.z = 0.4;
    this.led = world.sphere(0.009 * size, [0.04 * size, 0.032 * size, 0.1 * size], M.emissive(0xff1a1a, 6), { parent: head, dynamic: true, cast: false });
    this.ledLight = new THREE.PointLight(0xff2020, 0.08, 1.2, 2);
    this.ledLight.position.copy(this.led.position);
    head.add(this.ledLight);
    this.group = g; this.head = head;
    this.baseQ = new THREE.Quaternion();
    head.lookAt(new THREE.Vector3(...look));
    this.baseQ.copy(head.quaternion);
    this.noticed = false; this.lookTime = 0; this.phase = Math.random() * 3;
    world.cams.push(this);
  }

  get lensWorld() { return this.head.localToWorld(new THREE.Vector3(0, 0, 0.16)); }
  get ledWorld() { return this.led.getWorldPosition(new THREE.Vector3()); }

  update(dt, t, ctx) {
    const blinkOn = ((t + this.phase) % 2.6) > 0.14;
    this.led.visible = blinkOn; this.ledLight.visible = blinkOn;

    if (this.track && ctx.player) {
      const p = ctx.player.root.position.clone().add(new THREE.Vector3(0, 1.3, 0));
      const from = this.group.getWorldPosition(new THREE.Vector3());
      if (from.distanceTo(p) < 14) {
        const prev = this.head.quaternion.clone();
        this.head.lookAt(p); // Object3D.lookAt apunta +z (el lente) al objetivo
        const want = this.head.quaternion.clone();
        this.head.quaternion.copy(prev);
        if (want.angleTo(this.baseQ) < 1.2) this.head.quaternion.rotateTowards(want, dt * 0.35);
      }
    }

    // ¿El jugador la está mirando?
    if (!this.noticed && ctx.rig && !ctx.rig.cinematic && ctx.camera) {
      const cam = ctx.camera;
      const to = this.ledWorld.sub(cam.position);
      const dist = to.length();
      const fwd = cam.getWorldDirection(new THREE.Vector3());
      const ang = fwd.angleTo(to);
      if (dist < 10 && ang < THREE.MathUtils.degToRad(9 + 10 / Math.max(1, dist))) {
        this.lookTime += dt;
        if (this.lookTime > 0.5) {
          this.noticed = true;
          ui.flashRec();
          audio.play('blip', { vol: 0.35, inner: true });
          if (this.onNoticed) this.onNoticed(this);
        }
      } else this.lookTime = Math.max(0, this.lookTime - dt);
    }
  }
}

export function ceilingFan(world, pos, speed = 2.6) {
  const g = world.group(pos);
  world.cyl(0.015, 0.015, 0.45, [0, -0.22, 0], M.metal(0x6b6258, 0.5), { parent: g, dynamic: true });
  const hub = new THREE.Group(); hub.position.y = -0.48; g.add(hub);
  world.cyl(0.1, 0.12, 0.12, [0, 0, 0], M.paint(0x8a7e6c, 0.4), { parent: hub, dynamic: true });
  const blade = M.wood('#6b4a2c', 8);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group(); arm.rotation.y = (i * Math.PI) / 2; hub.add(arm);
    const b = world.box([0.13, 0.012, 0.62], [0, -0.02, 0.42], blade, { parent: arm, dynamic: true, rot: [6, 0, 0] });
    b.castShadow = true;
  }
  world.updaters.push((dt) => { hub.rotation.y += dt * speed; });
  return g;
}

// Pantalla con estática animada (TV de tubo).
export function staticScreen(world, w, h, pos, rotY, parent = null, { glow = true, color = 0xbfd0ff } = {}) {
  const c = document.createElement('canvas'); c.width = 96; c.height = 72;
  const g = c.getContext('2d');
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  const m = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.3, roughness: 0.2, envMapIntensity: 1.5 });
  const scr = world.plane(w, h, pos, m, { parent, rot: [0, rotY, 0], dynamic: true });
  const img = g.createImageData(96, 72);
  let acc = 0;
  let light = null;
  if (glow) {
    light = new THREE.PointLight(color, 0.6, 3.5, 2);
    light.position.set(pos[0], pos[1], pos[2]);
    const off = new THREE.Vector3(0, 0, 0.35).applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(rotY));
    light.position.add(off);
    (parent || world.scene).add(light);
  }
  world.updaters.push((dt) => {
    acc += dt; if (acc < 0.05) return; acc = 0;
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v * 0.92; img.data[i + 1] = v * 0.95; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    // barra de interferencia que baja
    const bar = Math.floor((performance.now() / 18) % 72);
    for (let x = 0; x < 96; x++) for (let y = bar; y < Math.min(72, bar + 5); y++) { const i = (y * 96 + x) * 4; img.data[i] *= 0.5; img.data[i + 1] *= 0.5; img.data[i + 2] *= 0.5; }
    g.putImageData(img, 0, 0);
    t.needsUpdate = true;
    if (light) light.intensity = 0.45 + Math.random() * 0.3;
  });
  return scr;
}

// Reloj de pared con las manecillas en una hora dada.
export function wallClock(world, pos, rotY, hours, minutes) {
  const g = world.group(pos, rotY);
  const face = canvasTexture(`clock${hours}${minutes}`, 256, 256, (c, w) => {
    c.fillStyle = '#f2eee4'; c.beginPath(); c.arc(128, 128, 126, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#222'; c.font = 'bold 30px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; c.fillText(String(i), 128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); }
  }, { repeat: false });
  world.cyl(0.17, 0.17, 0.04, [0, 0, 0.02], M.plastic(0x1e1e1e), { parent: g, rot: [90, 0, 0] });
  world.mesh(new THREE.CircleGeometry(0.155, 32), M.picture('clockface' + hours, face, 0.3), [0, 0, 0.042], { parent: g, cast: false });
  const hand = (len, wdt, ang) => { const p = new THREE.Group(); p.position.z = 0.046; p.rotation.z = -ang; g.add(p); world.box([wdt, len, 0.004], [0, len / 2 - 0.015, 0], M.paint(0x111111), { parent: p, cast: false }); };
  hand(0.08, 0.012, ((hours % 12) + minutes / 60) / 12 * Math.PI * 2);
  hand(0.12, 0.008, (minutes / 60) * Math.PI * 2);
  return g;
}
