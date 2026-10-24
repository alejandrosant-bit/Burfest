// Cámara: modo juego (libre detrás del hombro, con colisión) y modo cinemático
// (planos fijos o siguiendo a alguien, con movimiento de cámara en mano, temblor y fundidos entre planos).

import * as THREE from 'three';
import { input } from './input.js';
import { clamp, smooth } from './time.js';

const _v = new THREE.Vector3();
const _ray = new THREE.Ray();
const _hit = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.yaw = 0; this.pitch = 8;
    this.distance = 2.35; this.shoulder = 0.48; this.baseFov = 55;
    this.target = null;           // Object3D a seguir (el pivote del jugador)
    this.colliders = [];          // Box3 del mundo
    this.lookEnabled = true;
    this.autoFollow = false;      // modo demo: la cámara se acomoda sola detrás del jugador
    this.cinematic = false;
    this.shot = null;
    this.blend = null;
    this.shake = { amp: 0, t: 0, dur: 0 };
    this.pivot = new THREE.Vector3();
    this.t = 0;
  }

  get planarForward() { const y = THREE.MathUtils.degToRad(this.yaw); return new THREE.Vector3(Math.sin(y), 0, Math.cos(y)); }

  snapBehind(obj) {
    this.yaw = THREE.MathUtils.radToDeg(obj.rotation.y);
    this.pitch = 8;
    if (this.target) this.target.getWorldPosition(this.pivot);
  }

  // Plano cinemático. pos y look son Vector3 o arreglos; `follow` (Object3D) hace que el plano mire a un personaje.
  cut(pos, look, { fov = 40, blend = 0, handheld = 0.35, drift = null, follow = null, followOffset = null, roll = 0 } = {}) {
    const p = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos.clone();
    const l = look ? (Array.isArray(look) ? new THREE.Vector3(...look) : look.clone()) : null;
    this._startBlend(blend);
    this.cinematic = true;
    this.shot = { pos: p, look: l, fov, handheld, drift: drift ? new THREE.Vector3(...drift) : null, follow, followOffset: followOffset ? new THREE.Vector3(...followOffset) : new THREE.Vector3(0, 1.55, 0), roll, t0: this.t };
  }

  release(blend = 0.8, behind = null) {
    this._startBlend(blend);
    this.cinematic = false;
    this.shot = null;
    if (behind) this.snapBehind(behind);
  }

  shakeIt(amp = 0.5, dur = 0.5) { this.shake = { amp, t: 0, dur }; }

  _startBlend(dur) {
    this.blend = dur > 0 ? { from: this.camera.position.clone(), fromQ: this.camera.quaternion.clone(), fromFov: this.camera.fov, t: 0, dur } : null;
  }

  _gameplayPose(dt, outPos, outQ) {
    if (this.lookEnabled && !this.autoFollow) {
      const l = input.look(dt);
      this.yaw -= l.x; this.pitch = clamp(this.pitch + l.y, -35, 60);
    }
    if (this.autoFollow && this.target) {
      const root = this.target.parent;
      const want = THREE.MathUtils.radToDeg(root.rotation.y);
      let d = ((want - this.yaw + 540) % 360) - 180;
      this.yaw += d * Math.min(1, dt * 1.6);
      this.pitch += (10 - this.pitch) * Math.min(1, dt * 2);
    }
    if (this.target) {
      this.target.getWorldPosition(_v);
      this.pivot.lerp(_v, Math.min(1, dt * 12));
    }
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(-this.pitch), THREE.MathUtils.degToRad(this.yaw) + Math.PI, 0, 'YXZ'));
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q).setY(0).normalize();
    const back = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const shoulderPt = this.pivot.clone().addScaledVector(right, this.shoulder);
    // Que el hombro no atraviese paredes cercanas
    const sDist = this._castDist(this.pivot, right, this.shoulder);
    shoulderPt.copy(this.pivot).addScaledVector(right, Math.max(0, sDist - 0.12));
    const dist = this._castDist(shoulderPt, back, this.distance);
    outPos.copy(shoulderPt).addScaledVector(back, Math.max(0.3, dist - 0.18));
    outQ.copy(q);
  }

  _castDist(origin, dir, max) {
    _ray.origin.copy(origin); _ray.direction.copy(dir).normalize();
    let best = max;
    for (const b of this.colliders) {
      if (b.containsPoint(origin)) continue;
      if (_ray.intersectBox(b, _hit)) {
        const d = _hit.distanceTo(origin);
        if (d < best) best = d;
      }
    }
    return best;
  }

  update(dt) {
    this.t += dt;
    const pos = new THREE.Vector3(), q = new THREE.Quaternion();
    let fov = this.baseFov;
    if (this.cinematic && this.shot) {
      const s = this.shot;
      pos.copy(s.pos);
      if (s.drift) pos.addScaledVector(s.drift, this.t - s.t0);
      const look = s.follow ? s.follow.localToWorld(s.followOffset.clone()) : s.look;
      const m = new THREE.Matrix4().lookAt(pos, look || pos.clone().add(new THREE.Vector3(0, 0, -1)), UP);
      q.setFromRotationMatrix(m);
      if (s.roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(s.roll)));
      // Cámara en mano: deriva lenta con ruido suave
      const h = s.handheld, t = this.t;
      if (h > 0) {
        const e = new THREE.Euler(
          (Math.sin(t * 0.9) * 0.6 + Math.sin(t * 2.3 + 1) * 0.3) * h * 0.012,
          (Math.sin(t * 0.7 + 2) * 0.6 + Math.sin(t * 1.9) * 0.3) * h * 0.012,
          Math.sin(t * 0.5 + 4) * h * 0.006);
        q.multiply(new THREE.Quaternion().setFromEuler(e));
      }
      fov = s.fov;
    } else {
      this._gameplayPose(dt, pos, q);
    }

    if (this.blend) {
      const b = this.blend;
      b.t += dt;
      const k = smooth(Math.min(1, b.t / b.dur));
      pos.lerpVectors(b.from, pos, k);
      q.slerpQuaternions(b.fromQ, q, k);
      fov = b.fromFov + (fov - b.fromFov) * k;
      if (k >= 1) this.blend = null;
    }

    if (this.shake.t < this.shake.dur) {
      this.shake.t += dt;
      const a = this.shake.amp * (1 - this.shake.t / this.shake.dur);
      q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random() - 0.5) * a * 0.05, (Math.random() - 0.5) * a * 0.05, (Math.random() - 0.5) * a * 0.03)));
    }

    this.camera.position.copy(pos);
    this.camera.quaternion.copy(q);
    if (Math.abs(this.camera.fov - fov) > 0.01) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
  }
}
