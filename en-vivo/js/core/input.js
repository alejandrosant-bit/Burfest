// Teclado, ratón (pointer lock) y mando.

const down = new Set();
let pressed = new Set();
let incoming = new Set(); // eventos llegados desde el último cuadro
let mouseDX = 0, mouseDY = 0;
let canvasEl = null;
// Controles táctiles: joystick (mitad izquierda), cámara (mitad derecha), botones E y pausa.
const touch = { id: null, ox: 0, oy: 0, x: 0, y: 0, lookId: null, lx: 0, ly: 0, dx: 0, dy: 0 };
export const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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
    let dragging = false;
    addEventListener('mousedown', () => { dragging = true; });
    addEventListener('mouseup', () => { dragging = false; });
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvasEl || (this.lockBlocked && dragging)) { mouseDX += e.movementX; mouseDY += e.movementY; }
    });
    addEventListener('mousedown', (e) => { if (e.button === 0) incoming.add('Mouse0'); });
    if (isTouch) this._initTouch();
  },

  _initTouch() {
    const stick = document.getElementById('stick'), knob = document.getElementById('knob');
    document.getElementById('touchUI').classList.remove('hidden');
    const tap = (id, code) => document.getElementById(id).addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); incoming.add(code); }, { passive: false });
    tap('btnE', 'KeyE'); tap('btnPause', 'Escape');
    canvasEl.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX < innerWidth / 2 && touch.id === null) {
          touch.id = t.identifier; touch.ox = t.clientX; touch.oy = t.clientY; touch.x = 0; touch.y = 0;
          stick.style.left = `${t.clientX - 60}px`; stick.style.top = `${t.clientY - 60}px`; stick.classList.add('on');
        } else if (touch.lookId === null) { touch.lookId = t.identifier; touch.lx = t.clientX; touch.ly = t.clientY; }
        incoming.add('Mouse0');
      }
      e.preventDefault();
    }, { passive: false });
    canvasEl.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touch.id) {
          let dx = (t.clientX - touch.ox) / 50, dy = (t.clientY - touch.oy) / 50;
          const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
          touch.x = dx; touch.y = -dy;
          knob.style.transform = `translate(${dx * 40}px, ${dy * 40}px)`;
        } else if (t.identifier === touch.lookId) {
          touch.dx += t.clientX - touch.lx; touch.dy += t.clientY - touch.ly; touch.lx = t.clientX; touch.ly = t.clientY;
        }
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touch.id) { touch.id = null; touch.x = touch.y = 0; knob.style.transform = ''; stick.classList.remove('on'); }
        if (t.identifier === touch.lookId) touch.lookId = null;
      }
    };
    canvasEl.addEventListener('touchend', end); canvasEl.addEventListener('touchcancel', end);
  },

  get locked() { return document.pointerLockElement === canvasEl; },
  lock() {
    // Puede estar bloqueado (iframe aislado): el juego sigue y la cámara se mueve arrastrando con el ratón.
    if (!canvasEl || this.locked) return;
    try { const r = canvasEl.requestPointerLock?.(); if (r && r.catch) r.catch(() => { this.lockBlocked = true; }); } catch (e) { this.lockBlocked = true; }
  },
  unlock() { if (this.locked) document.exitPointerLock(); },

  // Llamar al empezar cada cuadro: lo pulsado queda válido durante todo el cuadro
  // (incluidas las continuaciones de promesas que corren al final).
  beginFrame() {
    pressed = incoming; incoming = new Set();
    this.mouseDX = mouseDX + touch.dx * 2.2; this.mouseDY = mouseDY + touch.dy * 2.2; mouseDX = 0; mouseDY = 0; touch.dx = 0; touch.dy = 0;
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
    x += touch.x; y += touch.y;
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

  run() { return Math.hypot(touch.x, touch.y) > 0.95 || down.has('ShiftLeft') || down.has('ShiftRight') || !!this.pad()?.buttons[10]?.pressed; },
  interact() { return pressed.has('KeyE') || this.padHit(0); },
  skip() { return pressed.has('KeyE') || pressed.has('Space') || pressed.has('Enter') || pressed.has('Mouse0') || this.padHit(0); },
  pause() { return pressed.has('Escape') || pressed.has('KeyP') || this.padHit(9); },
};
