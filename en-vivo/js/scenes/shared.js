// Piezas compartidas entre escenas: exteriores pintados, tramos de pasillo, utilidades de dirección.

import * as THREE from 'three';
import { M, drawnTexture, std, rng } from '../world/build.js';

// Exterior del campus a las 4:30 p. m. (cielo cálido, edificios de ladrillo, árboles). Emisivo para que "brille".
export function campusExterior(key, intensity = 1.6) {
  const t = drawnTexture('campus' + key, 1024, 512, (c, W, H) => {
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#9fb7cf'); sky.addColorStop(0.45, '#f1d6a8'); sky.addColorStop(0.7, '#ffcf8f'); sky.addColorStop(1, '#c49a6a');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    // sol bajo
    const sun = c.createRadialGradient(W * 0.7, H * 0.42, 0, W * 0.7, H * 0.42, 260);
    sun.addColorStop(0, 'rgba(255,245,220,1)'); sun.addColorStop(0.15, 'rgba(255,220,160,.7)'); sun.addColorStop(1, 'rgba(255,200,140,0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, H);
    const r = rng(key.length * 17);
    // montañas de fondo (cerros orientales)
    c.fillStyle = 'rgba(110,120,120,.55)';
    c.beginPath(); c.moveTo(0, H * 0.55);
    for (let x = 0; x <= W; x += 20) c.lineTo(x, H * 0.5 - Math.sin(x * 0.006) * 40 - Math.sin(x * 0.017) * 15);
    c.lineTo(W, H); c.lineTo(0, H); c.fill();
    // edificios de ladrillo
    for (let i = 0; i < 6; i++) {
      const bx = r() * W, bw = 120 + r() * 220, bh = 80 + r() * 120, by = H * 0.68 - bh;
      c.fillStyle = `rgb(${150 + r() * 30},${85 + r() * 20},${60 + r() * 15})`; c.fillRect(bx, by, bw, bh + 200);
      c.fillStyle = 'rgba(40,40,50,.55)';
      for (let yy = by + 12; yy < by + bh; yy += 26) for (let xx = bx + 10; xx < bx + bw - 14; xx += 22) c.fillRect(xx, yy, 12, 14);
    }
    // árboles (urapanes, pinos)
    for (let i = 0; i < 40; i++) {
      const tx = r() * W, ty = H * 0.62 + r() * H * 0.25, tr = 25 + r() * 55;
      c.fillStyle = `rgba(${40 + r() * 30},${60 + r() * 30},${30 + r() * 15},.95)`;
      c.beginPath(); c.ellipse(tx, ty, tr, tr * (0.8 + r() * 0.6), 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,210,140,.18)'; c.beginPath(); c.ellipse(tx + tr * 0.3, ty - tr * 0.3, tr * 0.6, tr * 0.5, 0, 0, Math.PI * 2); c.fill();
    }
    // césped
    c.fillStyle = '#6f7a3a'; c.fillRect(0, H * 0.86, W, H);
    // bruma de la tarde
    const haze = c.createLinearGradient(0, H * 0.3, 0, H);
    haze.addColorStop(0, 'rgba(255,220,170,0)'); haze.addColorStop(1, 'rgba(255,215,160,.35)');
    c.fillStyle = haze; c.fillRect(0, 0, W, H);
  });
  return withEmissiveMap('campusExt' + key, t, intensity);
}

function withEmissiveMap(key, t, intensity) {
  const m = std(key, { color: 0x000000, emissive: 0xffffff, emissiveIntensity: intensity, rough: 1 });
  m.emissiveMap = t; m.fog = false; m.toneMapped = true; m.needsUpdate = true;
  return m;
}

// Ciudad vacía y nublada vista desde un tercer piso (hospital).
export function cityBackdrop(key = 'city', intensity = 1.25) {
  const t = drawnTexture('cityBack' + key, 1024, 512, (c, W, H) => {
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#9aa6ae'); sky.addColorStop(0.6, '#c9cfd0'); sky.addColorStop(1, '#b8bdbb');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(120,130,138,.6)';
    c.beginPath(); c.moveTo(0, H * 0.6);
    for (let x = 0; x <= W; x += 16) c.lineTo(x, H * 0.48 - Math.sin(x * 0.005 + 1) * 50 - Math.sin(x * 0.02) * 10);
    c.lineTo(W, H); c.lineTo(0, H); c.fill();
    const r = rng(9);
    for (let i = 0; i < 70; i++) {
      const bx = r() * W, bw = 30 + r() * 90, bh = 40 + r() * 170, by = H * 0.72 - bh;
      const g = 120 + r() * 40;
      c.fillStyle = `rgb(${g},${g * 0.98},${g * 0.95})`; c.fillRect(bx, by, bw, bh + 200);
      c.fillStyle = 'rgba(50,55,60,.45)';
      for (let yy = by + 8; yy < by + bh; yy += 14) for (let xx = bx + 5; xx < bx + bw - 6; xx += 11) c.fillRect(xx, yy, 6, 8);
    }
  });
  return withEmissiveMap('cityBack' + key, t, intensity);
}

// Tramo corto de pasillo detrás de una puerta (para que no se vea el vacío).
export function corridorStub(w, { x0, x1, z0, z1, h = 3, openings = {} }) {
  w.room({ x0, x1, z0, z1, h, upper: M.plaster('#d9cdb0', 4), lower: M.plaster('#2f6b6b', 5), lowerH: 1.1, floor: M.terrazzo(), ceiling: M.ceiling(), openings });
  w.pointLight([(x0 + x1) / 2, h - 0.3, (z0 + z1) / 2], 0xf3f1e6, 4, 7);
}

export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
