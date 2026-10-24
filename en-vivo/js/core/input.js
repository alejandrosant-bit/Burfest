// Teclado, ratón (pointer lock) y mando.

const down = new Set();
let pressed = new Set();
let incoming = new Set(); // eventos llegados desde el último cuadro
let mouseDX = 0, mouseDY = 0;
let canvasEl = null;

export const input = {
  sensitivity: 0.12,

  init(canvas) {
    canvasEl = canvas;
    addEventListener('keydown', (e) => {
      if (!down.has(e.code)) incoming.add(e.code);
      down.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => down.delete(e.code));
    addEventListener('blur', () => down.clear());
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvasEl) { mouseDX += e.movementX; mouseDY += e.movementY; }
    });
    addEventListener('mousedown', (e) => { if (e.button === 0) incoming.add('Mouse0'); });
  },

  get locked() { return document.pointerLockElement === canvasEl; },
  lock() { if (canvasEl && !this.locked) canvasEl.requestPointerLock?.()?.catch?.(() => {}); },
  unlock() { if (this.locked) document.exitPointerLock(); },

  // Llamar al empezar cada cuadro: lo pulsado queda válido durante todo el cuadro
  // (incluidas las continuaciones de promesas que corren al final).
  beginFrame() {
    pressed = incoming; incoming = new Set();
    this.mouseDX = mouseDX; this.mouseDY = mouseDY; mouseDX = 0; mouseDY = 0;
    const p = this.pad();
    const now = p ? p.buttons.map((b) => b.pressed) : [];
    this._padHits = now.map((v, i) => v && !(this._padPrev && this._padPrev[i]));
    this._padPrev = now;
  },

  endFrame() {},

  held(code) { return down.has(code); },
  hit(code) { return pressed.has(code); },
  press(code) { incoming.add(code); },

  pad() { const p = navigator.getGamepads?.(); return p && p[0]; },
  padHit(i) { return !!(this._padHits && this._padHits[i]); },

  move() {
    let x = 0, y = 0;
    if (down.has('KeyW') || down.has('ArrowUp')) y += 1;
    if (down.has('KeyS') || down.has('ArrowDown')) y -= 1;
    if (down.has('KeyD') || down.has('ArrowRight')) x += 1;
    if (down.has('KeyA') || down.has('ArrowLeft')) x -= 1;
    const p = this.pad();
    if (p) {
      const dz = (v) => (Math.abs(v) < 0.15 ? 0 : v);
      x += dz(p.axes[0]); y -= dz(p.axes[1]);
    }
    const m = Math.hypot(x, y);
    return m > 1 ? { x: x / m, y: y / m } : { x, y };
  },

  // Grados de giro en este cuadro.
  look(dt) {
    let x = this.mouseDX * this.sensitivity, y = this.mouseDY * this.sensitivity;
    const p = this.pad();
    if (p) {
      const dz = (v) => (Math.abs(v) < 0.15 ? 0 : v);
      x += dz(p.axes[2]) * 140 * dt; y += dz(p.axes[3]) * 100 * dt;
    }
    return { x, y };
  },

  run() { return down.has('ShiftLeft') || down.has('ShiftRight') || !!this.pad()?.buttons[10]?.pressed; },
  interact() { return pressed.has('KeyE') || this.padHit(0); },
  skip() { return pressed.has('KeyE') || pressed.has('Space') || pressed.has('Enter') || pressed.has('Mouse0') || this.padHit(0); },
  pause() { return pressed.has('Escape') || pressed.has('KeyP') || this.padHit(9); },
};
