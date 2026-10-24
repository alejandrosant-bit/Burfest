// Constructor de escenarios: materiales con texturas procedurales (sin descargas),
// primitivas con UV a escala real, cuartos con vanos, colisiones, luces, haces de luz y polvo.
// Al final `finalize()` une la geometría estática por material para reducir draw calls.

import * as THREE from 'three';
import { mergeGeometries } from '../vendor/three/utils/BufferGeometryUtils.js';

export function rng(seed = 1) {
  let s = (seed >>> 0) || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

// ---------- Texturas procedurales ----------

const texCache = new Map();
export let maxAniso = 4;
export function setAnisotropy(a) { maxAniso = a; }

// Acepta 0xRRGGBB o '#rrggbb' y devuelve un color CSS.
export const css = (c) => (typeof c === 'number' ? '#' + new THREE.Color(c).getHexString() : c);

function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

export function canvasTexture(key, w, h, draw, { srgb = true, repeat = true } = {}) {
  if (texCache.has(key)) return texCache.get(key);
  const c = makeCanvas(w, h);
  const g = c.getContext('2d', { willReadFrequently: true });
  draw(g, w, h, c);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = maxAniso;
  t.userData.canvas = c;
  texCache.set(key, t);
  return t;
}

// Ruido por píxel sobre lo ya dibujado.
function grainPixels(g, w, h, amount, seed = 7) {
  const r = rng(seed);
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

function blotches(g, w, h, n, color, alpha, minR, maxR, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rad = minR + r() * (maxR - minR);
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, color.replace('A', String(alpha * (0.4 + r() * 0.6))));
    grd.addColorStop(1, color.replace('A', '0'));
    g.fillStyle = grd;
    // repetir en bordes para que el mosaico no tenga costuras
    for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
      if (x + ox + rad < 0 || x + ox - rad > w || y + oy + rad < 0 || y + oy - rad > h) continue;
      g.save(); g.translate(ox, oy); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore();
    }
  }
}

// Mapa de normales desde la luminancia de un canvas.
export function normalFromCanvas(key, src, strength = 2) {
  if (texCache.has(key)) return texCache.get(key);
  const w = src.width, h = src.height;
  const s = src.getContext('2d').getImageData(0, 0, w, h).data;
  const c = makeCanvas(w, h), g = c.getContext('2d');
  const out = g.createImageData(w, h);
  const L = (x, y) => { x = (x + w) % w; y = (y + h) % h; const i = (y * w + x) * 4; return (s[i] + s[i + 1] + s[i + 2]) / 765; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (L(x + 1, y) - L(x - 1, y)) * strength;
    const dy = (L(x, y + 1) - L(x, y - 1)) * strength;
    const inv = 1 / Math.hypot(dx, dy, 1);
    const i = (y * w + x) * 4;
    out.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
    out.data[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
    out.data[i + 2] = (inv * 0.5 + 0.5) * 255;
    out.data[i + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
  texCache.set(key, t);
  return t;
}

export const tex = {
  plaster(hex, seed = 1) {
    return canvasTexture(`plaster${hex}${seed}`, 512, 512, (g, w, h) => {
      g.fillStyle = css(hex); g.fillRect(0, 0, w, h);
      blotches(g, w, h, 70, 'rgba(255,255,255,A)', 0.07, 30, 140, seed);
      blotches(g, w, h, 70, 'rgba(60,40,20,A)', 0.07, 20, 120, seed + 1);
      blotches(g, w, h, 30, 'rgba(70,60,40,A)', 0.08, 4, 18, seed + 2);
      grainPixels(g, w, h, 14, seed);
    });
  },
  terrazzo(seed = 3) {
    return canvasTexture(`terrazzo${seed}`, 1024, 1024, (g, w, h) => {
      g.fillStyle = '#c9c1b2'; g.fillRect(0, 0, w, h);
      blotches(g, w, h, 40, 'rgba(120,100,80,A)', 0.08, 60, 200, seed);
      const r = rng(seed);
      const cols = ['#6f6a62', '#e8e2d6', '#3f3b37', '#a0563c', '#8f8a7e', '#d9c9a5', '#2f4f4a', '#b89a6a'];
      for (let i = 0; i < 9000; i++) {
        const x = r() * w, y = r() * h, s = r() < 0.92 ? 1 + r() * 4 : 5 + r() * 9;
        g.fillStyle = cols[Math.floor(r() * cols.length)];
        g.beginPath();
        const n = 5 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2, rr = s * (0.6 + r() * 0.5);
          g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        g.fill();
      }
      // juntas de dilatación de bronce cada metro y medio
      g.fillStyle = 'rgba(120,96,60,0.9)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h);
      grainPixels(g, w, h, 10, seed);
    });
  },
  wood(seed = 5, base = '#7a5434') {
    return canvasTexture(`wood${seed}${base}`, 512, 512, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      const r = rng(seed);
      for (let i = 0; i < 160; i++) {
        const y = r() * h, amp = 2 + r() * 6, f = 0.004 + r() * 0.01;
        g.strokeStyle = r() < 0.5 ? `rgba(40,22,10,${0.08 + r() * 0.18})` : `rgba(200,150,100,${0.05 + r() * 0.1})`;
        g.lineWidth = 0.5 + r() * 2.5;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * f * Math.PI * 2 + i) * amp);
        g.stroke();
      }
      grainPixels(g, w, h, 12, seed);
    });
  },
  ceilingTiles() {
    return canvasTexture('ceil', 512, 512, (g, w, h) => {
      g.fillStyle = '#e6e3da'; g.fillRect(0, 0, w, h);
      const r = rng(11);
      for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(90,85,75,${r() * 0.35})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
      blotches(g, w, h, 6, 'rgba(160,130,70,A)', 0.15, 20, 60, 12); // manchas de humedad
      g.fillStyle = '#9d9a92'; g.fillRect(0, 0, w, 6); g.fillRect(0, 0, 6, h);
    });
  },
  vinyl(seed = 9) {
    return canvasTexture(`vinyl${seed}`, 512, 512, (g, w, h) => {
      g.fillStyle = '#b7c2b8'; g.fillRect(0, 0, w, h);
      const r = rng(seed);
      for (let i = 0; i < 6000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,95,85,.35)' : 'rgba(240,245,240,.4)'; g.fillRect(r() * w, r() * h, 2 + r() * 3, 1 + r() * 2); }
      g.fillStyle = 'rgba(70,80,72,.5)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
      grainPixels(g, w, h, 8, seed);
    });
  },
  fabric(hex, kind = 'denim', seed = 21) {
    return canvasTexture(`fabric${hex}${kind}${seed}`, 256, 256, (g, w, h) => {
      g.fillStyle = css(hex); g.fillRect(0, 0, w, h);
      const r = rng(seed);
      if (kind === 'denim') {
        for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
          g.fillStyle = (x + y) % 4 === 0 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)';
          g.fillRect(x, y, 2, 2);
        }
        blotches(g, w, h, 12, 'rgba(255,255,255,A)', 0.12, 10, 40, seed);
      } else if (kind === 'cord') {
        for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, 0, 2, h); }
      } else if (kind === 'plaid') {
        g.globalAlpha = 0.35;
        for (let i = 0; i < w; i += 32) { g.fillStyle = '#1a1a1a'; g.fillRect(i, 0, 10, h); g.fillRect(0, i, w, 10); }
        g.fillStyle = '#e8d9b0'; for (let i = 16; i < w; i += 32) { g.fillRect(i, 0, 2, h); g.fillRect(0, i, w, 2); }
        g.globalAlpha = 1;
      } else if (kind === 'stripes') {
        for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y, w, 10); }
      } else if (kind === 'knit') {
        for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.1})`; g.fillRect(x, y, 3, 3); }
      }
      grainPixels(g, w, h, 18, seed);
    });
  },
  skin(hex) {
    return canvasTexture(`skin${hex}`, 128, 128, (g, w, h) => {
      g.fillStyle = css(hex); g.fillRect(0, 0, w, h);
      blotches(g, w, h, 30, 'rgba(160,60,50,A)', 0.06, 6, 30, 31);
      grainPixels(g, w, h, 6, 31);
    });
  },
  hair(hex) {
    return canvasTexture(`hair${hex}`, 128, 128, (g, w, h) => {
      g.fillStyle = css(hex); g.fillRect(0, 0, w, h);
      const r = rng(41);
      for (let i = 0; i < 600; i++) { g.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.2)'; g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 20, h); g.stroke(); }
    });
  },
  // Degradado para haces de luz: brillante en el origen, se desvanece a lo largo y a los lados.
  shaft() {
    return canvasTexture('shaft', 128, 256, (g, w, h) => {
      const img = g.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const u = x / (w - 1), v = y / (h - 1);
        const side = Math.pow(Math.sin(u * Math.PI), 1.6);
        const along = Math.pow(1 - v, 1.4);
        const a = side * along * 255;
        const i = (y * w + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a;
      }
      g.putImageData(img, 0, 0);
    }, { repeat: false });
  },
  softDot() {
    return canvasTexture('dot', 64, 64, (g, w, h) => {
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    }, { repeat: false });
  },
  blobShadow() {
    return canvasTexture('blob', 128, 128, (g) => {
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(0,0,0,.55)'); grd.addColorStop(0.6, 'rgba(0,0,0,.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    }, { repeat: false });
  },
};

// Textura con texto/dibujo (letreros, afiches, tablero, calendario).
export function drawnTexture(key, w, h, draw) {
  return canvasTexture(key, w, h, draw, { repeat: false });
}

// ---------- Materiales ----------

const matCache = new Map();
export function mat(key, make) {
  if (!matCache.has(key)) matCache.set(key, make());
  return matCache.get(key);
}

export function std(key, { color = 0xffffff, map = null, rough = 0.8, metal = 0, normal = null, normalScale = 1, emissive = null, emissiveIntensity = 1, envI = 1, transparent = false, opacity = 1, side = THREE.FrontSide } = {}) {
  return mat(key, () => {
    const m = new THREE.MeshStandardMaterial({ color, map, roughness: rough, metalness: metal, transparent, opacity, side, envMapIntensity: envI });
    if (normal) { m.normalMap = normal; m.normalScale = new THREE.Vector2(normalScale, normalScale); }
    if (emissive != null) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = emissiveIntensity; }
    return m;
  });
}

function texMat(key, t, opts = {}) {
  const normal = opts.bump ? normalFromCanvas(key + 'n', t.userData.canvas, opts.bump) : null;
  return std(key, { map: t, normal, normalScale: opts.normalScale || 0.6, ...opts });
}

export const M = {
  plaster: (hex, seed = 1) => texMat(`plaster${hex}${seed}`, tex.plaster(hex, seed), { rough: 0.92, bump: 1.2, normalScale: 0.35, envI: 0.4 }),
  terrazzo: () => texMat('terrazzo', tex.terrazzo(), { rough: 0.28, bump: 0.6, normalScale: 0.15, envI: 1.1 }),
  wood: (base = '#7a5434', seed = 5) => texMat(`wood${base}${seed}`, tex.wood(seed, base), { rough: 0.55, bump: 1, normalScale: 0.25, envI: 0.7 }),
  ceiling: () => texMat('ceiling', tex.ceilingTiles(), { rough: 0.95, bump: 2, normalScale: 0.5, envI: 0.2 }),
  vinyl: () => texMat('vinyl', tex.vinyl(), { rough: 0.35, bump: 0.5, normalScale: 0.15, envI: 1 }),
  metal: (hex = 0x8a8d90, rough = 0.38) => std(`metal${hex}${rough}`, { color: hex, rough, metal: 0.85 }),
  paint: (hex, rough = 0.55) => std(`paint${hex}${rough}`, { color: hex, rough, envI: 0.7 }),
  plastic: (hex, rough = 0.45) => std(`plastic${hex}${rough}`, { color: hex, rough, envI: 0.8 }),
  rubber: (hex = 0x1d1d1d) => std(`rubber${hex}`, { color: hex, rough: 0.9 }),
  glass: () => std('glass', { color: 0xbfd4d8, rough: 0.05, metal: 0, transparent: true, opacity: 0.18, envI: 1.6 }),
  emissive: (hex, intensity = 2) => std(`emi${hex}${intensity}`, { color: 0x000000, emissive: hex, emissiveIntensity: intensity, rough: 1 }),
  fabric: (hex, kind, seed) => texMat(`fab${hex}${kind}${seed}`, tex.fabric(hex, kind, seed), { rough: 0.95, bump: 1.5, normalScale: 0.6, envI: 0.3 }),
  skin: (hex) => std(`skin${hex}`, { map: tex.skin(hex), rough: 0.55, envI: 0.5 }),
  hair: (hex) => texMat(`hair${hex}`, tex.hair(hex), { rough: 0.6, bump: 2, normalScale: 0.8, envI: 0.6 }),
  picture: (key, t, rough = 0.6) => std(`pic${key}`, { map: t, rough, envI: 0.5 }),
};

// ---------- Geometría con UV a escala real ----------

// Caja cuyas UV miden `tile` metros por repetición en cada cara.
export function boxGeo(w, h, d, tile = 0) {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (tile > 0) {
    const uv = geo.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile);
    }
  }
  return geo;
}

// ---------- Mundo ----------

const _box = new THREE.Box3();

export class World {
  constructor() {
    this.scene = new THREE.Scene();
    this.colliders = [];
    this.interactables = [];
    this.zones = [];
    this.updaters = [];
    this.chars = [];
    this.cams = [];
    this.marks = {};
    this.shadowCasters = 0;
  }

  // opts: parent, rot [x,y,z] (grados), collide, cast, receive, dynamic, tile
  mesh(geo, material, pos, opts = {}) {
    const m = new THREE.Mesh(geo, material);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (opts.rot) m.rotation.set(...opts.rot.map(THREE.MathUtils.degToRad));
    if (opts.scale) m.scale.set(...opts.scale);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    m.userData.static = !opts.dynamic;
    (opts.parent || this.scene).add(m);
    if (opts.collide) this.collide(m);
    return m;
  }

  box(size, pos, material, opts = {}) { return this.mesh(boxGeo(size[0], size[1], size[2], opts.tile || 0), material, pos, opts); }
  cyl(rt, rb, h, pos, material, opts = {}) { return this.mesh(new THREE.CylinderGeometry(rt, rb, h, opts.seg || 18, 1, !!opts.open), material, pos, opts); }
  sphere(r, pos, material, opts = {}) { return this.mesh(new THREE.SphereGeometry(r, opts.seg || 20, Math.max(8, (opts.seg || 20) * 0.6 | 0)), material, pos, opts); }
  plane(w, h, pos, material, opts = {}) { return this.mesh(new THREE.PlaneGeometry(w, h), material, pos, { cast: false, ...opts }); }

  group(pos = [0, 0, 0], rotY = 0, parent = null) {
    const g = new THREE.Group();
    g.position.set(...pos); g.rotation.y = THREE.MathUtils.degToRad(rotY);
    (parent || this.scene).add(g);
    return g;
  }

  collide(obj) {
    obj.updateWorldMatrix(true, true);
    _box.setFromObject(obj);
    this.colliders.push(_box.clone());
  }
  colliderBox(min, max) { this.colliders.push(new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max))); }

  mark(name, pos, look = null) {
    this.marks[name] = { pos: new THREE.Vector3(...pos), look: look ? new THREE.Vector3(...look) : null };
    return this.marks[name];
  }

  // Pared recta en planta de (x1,z1) a (x2,z2) con vanos [{at, w, h, sill}] medidos desde el inicio.
  wall(x1, z1, x2, z2, { h = 3, t = 0.2, upper, lower = null, lowerH = 1.1, openings = [], trim = null } = {}) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const dir = new THREE.Vector3(dx / len, 0, dz / len);
    const rotDeg = THREE.MathUtils.radToDeg(Math.atan2(dx, dz));
    const piece = (a, b, y0, y1) => {
      if (b - a < 0.005 || y1 - y0 < 0.005) return;
      const segs = [];
      if (lower && y0 < lowerH) { segs.push([y0, Math.min(y1, lowerH), lower]); if (y1 > lowerH) segs.push([lowerH, y1, upper]); }
      else segs.push([y0, y1, upper]);
      for (const [s0, s1, m] of segs) {
        const c = (a + b) / 2;
        this.mesh(boxGeo(t, s1 - s0, b - a, 1), m, [x1 + dir.x * c, (s0 + s1) / 2, z1 + dir.z * c], { collide: true, rot: [0, rotDeg, 0] });
      }
      if (trim && lower && y0 < lowerH && y1 > lowerH) {
        const c = (a + b) / 2;
        this.mesh(boxGeo(t + 0.03, 0.035, b - a), trim, [x1 + dir.x * c, lowerH, z1 + dir.z * c], { rot: [0, rotDeg, 0] });
      }
    };
    const ops = [...openings].sort((p, q) => p.at - q.at);
    let cur = 0;
    for (const o of ops) {
      const a = o.at - o.w / 2, b = o.at + o.w / 2;
      piece(cur, a, 0, h);
      piece(a, b, (o.sill || 0) + o.h, h);
      if (o.sill) piece(a, b, 0, o.sill);
      cur = b;
    }
    piece(cur, len, 0, h);
  }

  // Cuarto rectangular: piso, techo y cuatro paredes con vanos por lado (n=+z, s=-z, e=+x, w=-x).
  room({ x0, x1, z0, z1, h = 3, upper, lower = null, lowerH = 1.1, trim = null, floor, ceiling, openings = {}, t = 0.2, skipCeiling = false }) {
    const W = x1 - x0, D = z1 - z0;
    this.mesh(boxGeo(W + 2 * t, 0.1, D + 2 * t, 1.5), floor, [(x0 + x1) / 2, -0.05, (z0 + z1) / 2], { collide: false, cast: false });
    if (!skipCeiling) this.mesh(boxGeo(W + 2 * t, 0.1, D + 2 * t, 0.6), ceiling, [(x0 + x1) / 2, h + 0.05, (z0 + z1) / 2], { cast: true });
    const o = { h, t, upper, lower, lowerH, trim };
    this.wall(x0 - t / 2, z1 + t / 2, x1 + t / 2, z1 + t / 2, { ...o, openings: shift(openings.n, t / 2) });
    this.wall(x0 - t / 2, z0 - t / 2, x1 + t / 2, z0 - t / 2, { ...o, openings: shift(openings.s, t / 2) });
    this.wall(x1 + t / 2, z0 - t / 2, x1 + t / 2, z1 + t / 2, { ...o, openings: shift(openings.e, t / 2) });
    this.wall(x0 - t / 2, z0 - t / 2, x0 - t / 2, z1 + t / 2, { ...o, openings: shift(openings.w, t / 2) });
  }

  pointLight(pos, color, intensity, distance, { shadow = false, decay = 2 } = {}) {
    const l = new THREE.PointLight(color, intensity, distance, decay);
    l.position.set(...pos);
    if (shadow) { l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.bias = -0.002; l.shadow.normalBias = 0.03; l.shadow.radius = 4; }
    this.scene.add(l);
    return l;
  }

  spotLight(pos, target, color, intensity, { angle = 0.6, penumbra = 0.6, distance = 20, shadow = false } = {}) {
    const l = new THREE.SpotLight(color, intensity, distance, angle, penumbra, 2);
    l.position.set(...pos); l.target.position.set(...target);
    if (shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0015; l.shadow.normalBias = 0.03; l.shadow.radius = 5; }
    this.scene.add(l, l.target);
    return l;
  }

  sun(dir, color, intensity, bounds) {
    const l = new THREE.DirectionalLight(color, intensity);
    const d = new THREE.Vector3(...dir).normalize();
    const c = new THREE.Vector3(...bounds.center);
    l.position.copy(c).addScaledVector(d, -25);
    l.target.position.copy(c);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const s = l.shadow.camera;
    s.left = -bounds.size; s.right = bounds.size; s.top = bounds.size; s.bottom = -bounds.size; s.near = 1; s.far = 60;
    l.shadow.bias = -0.0008; l.shadow.normalBias = 0.04; l.shadow.radius = 3;
    this.scene.add(l, l.target);
    this.sunLight = l;
    return l;
  }

  // Haz de luz volumétrico falso: planos cruzados aditivos desde `from` en dirección `dir`.
  shaft(from, dir, { width = 1.2, length = 5, color = 0xffd9a0, opacity = 0.09 } = {}) {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ map: tex.shaft(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(width, length), m);
      p.position.y = -length / 2;
      p.rotation.y = (i * Math.PI) / 3;
      const holder = new THREE.Group(); holder.add(p); g.add(holder);
    }
    g.position.set(...from);
    const d = new THREE.Vector3(...dir).normalize();
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d);
    g.renderOrder = 5;
    this.scene.add(g);
    this.shafts = this.shafts || [];
    this.shafts.push(m);
    return g;
  }

  // Polvo flotando en el aire (se nota en los haces de luz).
  dust(min, max, count = 400, color = 0xffe6c0) {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const r = rng(77);
    for (let i = 0; i < count; i++) { p[i * 3] = min[0] + r() * (max[0] - min[0]); p[i * 3 + 1] = min[1] + r() * (max[1] - min[1]); p[i * 3 + 2] = min[2] + r() * (max[2] - min[2]); }
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ map: tex.softDot(), color, size: 0.018, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const pts = new THREE.Points(geo, m);
    this.scene.add(pts);
    const base = p.slice();
    this.updaters.push((dt, t) => {
      for (let i = 0; i < count; i++) {
        p[i * 3] = base[i * 3] + Math.sin(t * 0.13 + i) * 0.25;
        p[i * 3 + 1] = min[1] + ((base[i * 3 + 1] - min[1] + t * 0.02 * (0.5 + (i % 7) / 7)) % (max[1] - min[1]));
        p[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.11 + i * 1.3) * 0.25;
      }
      geo.attributes.position.needsUpdate = true;
    });
    return pts;
  }

  update(dt, t) { for (const u of this.updaters) u(dt, t); }

  // Une las mallas estáticas por material (mismas banderas de sombra) en una sola malla.
  finalize() {
    this.scene.updateMatrixWorld(true);
    const groups = new Map();
    this.scene.traverse((o) => {
      if (!o.isMesh || !o.userData.static || o.userData.keep) return;
      if (o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length) return;
      const k = `${o.material.uuid}|${o.castShadow}|${o.receiveShadow}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(o);
    });
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const geos = list.map((o) => {
        const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
        for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
        return g;
      });
      const allIndexed = geos.every((g) => g.index);
      const merged = mergeGeometries(allIndexed ? geos : geos.map((g) => (g.index ? g.toNonIndexed() : g)));
      if (!merged) continue;
      const m = new THREE.Mesh(merged, list[0].material);
      m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow;
      this.scene.add(m);
      for (const o of list) { o.parent.remove(o); o.geometry.dispose(); }
      geos.forEach((g) => g.dispose());
    }
  }

  dispose() {
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
  }
}

function shift(list, d) { return (list || []).map((o) => ({ ...o, at: o.at + d })); }
