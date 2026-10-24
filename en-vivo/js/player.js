// Jugador: máquina de estados (libre / cinemática / escondido), movimiento relativo a la cámara,
// colisión círculo contra cajas, interacción contextual y piloto automático (modo demo).

import * as THREE from 'three';
import { input } from './core/input.js';
import { ui } from './core/ui.js';
import { Character, OUTFITS } from './world/characters.js';

export const objective = { text: null, target: null, path: [], urgent: false };

export function setObjective(text, target = null, { path = [], urgent = false } = {}) {
  objective.text = text; objective.target = target; objective.urgent = urgent;
  objective.path = path.map((p) => new THREE.Vector3(p[0], 0, p[1]));
  objective._i = 0;
  ui.setObjective(text);
}
export function clearObjective() { setObjective(null); }

export class Player {
  constructor(world, rig, { pos, rotY = 0 }) {
    this.world = world;
    this.rig = rig;
    this.char = new Character(world, OUTFITS.mateo, { name: 'Mateo', pos, rotY });
    this.root = this.char.root;
    this.pivot = new THREE.Object3D();
    this.pivot.position.set(0, 1.5, 0);
    this.root.add(this.pivot);
    rig.target = this.pivot;
    this.state = 'cutscene';
    this.radius = 0.28;
    this.vel = new THREE.Vector3();
    this.walk = 1.55; this.runSpeed = 4.2;
    this.focus = null;
    this.autoTimer = 0;
    this.demo = false;
  }

  setState(s) {
    this.state = s;
    if (s !== 'free') { ui.showPrompt(null); this.focus = null; this.vel.set(0, 0, 0); }
  }

  teleport(x, z, rotYdeg = null, y = 0) {
    this.root.position.set(x, y, z);
    if (rotYdeg != null) this.root.rotation.y = THREE.MathUtils.degToRad(rotYdeg);
    this.char.lastPos.copy(this.root.position);
    this.char.turnTo = null;
    this.vel.set(0, 0, 0);
  }

  // Dirección de movimiento del piloto automático hacia el objetivo actual.
  _autopilot() {
    const o = objective;
    if (!o.target) return { dir: new THREE.Vector3(), run: false };
    const pos = this.root.position;
    let goal, final = false;
    if (o._i < o.path.length) {
      goal = o.path[o._i];
      if (Math.hypot(goal.x - pos.x, goal.z - pos.z) < 0.45) o._i++;
    } else {
      final = true;
      const t = o.target;
      goal = t.approach || t.center || t.pos || t;
    }
    const d = new THREE.Vector3(goal.x - pos.x, 0, goal.z - pos.z);
    const dist = d.length();
    if (final && dist < 0.12) return { dir: new THREE.Vector3(), run: false, arrived: true };
    d.normalize();
    // Detección de atasco: si no se acerca, rodea el obstáculo y, si sigue, salta al siguiente punto.
    const st = this._stuck || (this._stuck = { best: Infinity, t: 0, side: 0, sideT: 0 });
    if (st.goal !== goal) { st.goal = goal; st.best = dist; st.t = 0; st.side = 0; }
    if (dist < st.best - 0.05) { st.best = dist; st.t = 0; } else st.t += this._dt || 0.016;
    if (st.t > 0.7 && st.sideT <= 0) { st.side = st.side === 1 ? -1 : 1; st.sideT = 0.6; }
    if (st.t > 3 && !final) { o._i++; st.t = 0; }
    if (st.sideT > 0) {
      st.sideT -= this._dt || 0.016;
      d.add(new THREE.Vector3(-d.z * st.side, 0, d.x * st.side).multiplyScalar(1.5)).normalize();
    }
    return { dir: d, run: o.urgent };
  }

  update(dt) {
    this._dt = dt;
    const c = this.char;
    if (this.state === 'free') {
      let dir = new THREE.Vector3(), run = false, arrived = false;
      if (this.demo) {
        const a = this._autopilot(); dir = a.dir; run = a.run; arrived = a.arrived;
      } else {
        const m = input.move();
        const f = this.rig.planarForward;
        const r = new THREE.Vector3(-f.z, 0, f.x);
        dir.addScaledVector(f, m.y).addScaledVector(r, m.x);
        run = input.run();
      }
      const speed = (run ? this.runSpeed : this.walk) * Math.min(1, dir.length());
      const want = dir.lengthSq() > 0.0001 ? dir.clone().normalize().multiplyScalar(speed) : new THREE.Vector3();
      const accel = want.lengthSq() > this.vel.lengthSq() ? 9 : 12;
      this.vel.lerp(want, Math.min(1, dt * accel));
      if (this.vel.lengthSq() > 0.02) {
        const yaw = Math.atan2(this.vel.x, this.vel.z);
        let diff = ((yaw - this.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this.root.rotation.y += diff * Math.min(1, dt * 10);
      }
      this.root.position.addScaledVector(this.vel, dt);
      this._collide();
      this._interaction(dt, arrived);
    }
    c.update(dt);
  }

  _collide() {
    const p = this.root.position;
    const r = this.radius;
    for (let it = 0; it < 2; it++) {
      for (const b of this.world.colliders) {
        if (b.max.y < 0.15 || b.min.y > 1.6) continue;
        const cx = Math.max(b.min.x, Math.min(p.x, b.max.x));
        const cz = Math.max(b.min.z, Math.min(p.z, b.max.z));
        let dx = p.x - cx, dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          if (d2 > 1e-8) {
            const d = Math.sqrt(d2);
            p.x += (dx / d) * (r - d); p.z += (dz / d) * (r - d);
          } else {
            // centro dentro de la caja: sacar por el lado más cercano
            const opts = [[b.min.x - r - p.x, 0], [b.max.x + r - p.x, 0], [0, b.min.z - r - p.z], [0, b.max.z + r - p.z]];
            opts.sort((a1, a2) => Math.abs(a1[0] + a1[1]) - Math.abs(a2[0] + a2[1]));
            p.x += opts[0][0]; p.z += opts[0][1];
          }
        }
      }
    }
  }

  _interaction(dt, arrived) {
    const p = this.root.position;
    const fwd = new THREE.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
    let best = null, bestScore = Infinity;
    for (const it of this.world.interactables) {
      if (!it.available) continue;
      const to = new THREE.Vector3(it.pos.x - p.x, 0, it.pos.z - p.z);
      const d = to.length();
      if (d > it.radius) continue;
      const facing = d < 0.5 ? 1 : fwd.dot(to.normalize());
      if (facing < 0.1) continue;
      const score = d - facing;
      if (score < bestScore) { bestScore = score; best = it; }
    }
    // Piloto automático: girar hacia el interactuable objetivo al llegar
    if (this.demo && arrived && objective.target && objective.target.prompt) {
      const t = objective.target;
      const yaw = Math.atan2(t.pos.x - p.x, t.pos.z - p.z);
      let diff = ((yaw - this.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      this.root.rotation.y += diff * Math.min(1, dt * 6);
      if (best === t) { this.autoTimer += dt; } else if (Math.abs(diff) < 0.2 && t.available) { best = t; this.autoTimer += dt; }
    } else this.autoTimer = 0;

    if (best !== this.focus) { this.focus = best; ui.showPrompt(best ? best.prompt : null); }
    if (best && (input.interact() || (this.demo && this.autoTimer > 0.9 && best === objective.target))) {
      this.autoTimer = 0;
      ui.showPrompt(null);
      this.focus = null;
      best.use(this);
    }
  }
}
