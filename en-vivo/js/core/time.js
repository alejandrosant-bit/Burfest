// Reloj de juego: esperas y tweens que se congelan en pausa y se cancelan al cambiar de escena.

export const ABORT = Symbol('abort');

const tasks = [];
let epoch = 0;
export const clock = { time: 0, dt: 0 };

export function currentEpoch() { return epoch; }

// Invalida todas las esperas pendientes (las promesas se rechazan con ABORT).
export function abortAll() {
  epoch++;
  for (const t of tasks.splice(0)) t.reject(ABORT);
}

export function tick(dt) {
  clock.dt = dt;
  clock.time += dt;
  for (let i = tasks.length - 1; i >= 0; i--) {
    const t = tasks[i];
    t.elapsed += dt;
    if (t.fn) t.fn(Math.min(1, t.dur > 0 ? t.elapsed / t.dur : 1));
    if (t.elapsed >= t.dur || (t.until && t.until())) {
      tasks.splice(i, 1);
      t.resolve();
    }
  }
}

function addTask(dur, fn, until) {
  return new Promise((resolve, reject) => {
    tasks.push({ dur, fn, until, elapsed: 0, resolve, reject, epoch });
  });
}

export const wait = (s) => addTask(s, null, null);

// Espera hasta que cond() sea verdadera (revisada cada cuadro).
export const waitUntil = (cond) => addTask(Infinity, null, cond);

export function tween(dur, fn, ease = smooth) {
  fn(0);
  return addTask(dur, (t) => fn(ease(t)), null);
}

export const smooth = (t) => t * t * (3 - 2 * t);
export const linear = (t) => t;
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Lanza una tarea en paralelo e ignora la cancelación.
export function spawn(promiseFn) {
  Promise.resolve().then(promiseFn).catch((e) => { if (e !== ABORT) console.error(e); });
}
