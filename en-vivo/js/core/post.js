// Postproceso: halo (bloom) + gradación de película de 1998 (sombras frías, luces cálidas,
// grano, viñeta), desenfoque para el desmayo y modo de cámara de vigilancia.

import * as THREE from 'three';
import { EffectComposer } from '../vendor/three/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/three/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/three/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/three/postprocessing/OutputPass.js';
import { ShaderPass } from '../vendor/three/postprocessing/ShaderPass.js';
import { GTAOPass } from '../vendor/three/postprocessing/GTAOPass.js';
import { tween, lerp } from './time.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uExposure: { value: 1 },
    uContrast: { value: 1 },
    uSat: { value: 1 },
    uSplit: { value: 0 },
    uShadowTint: { value: new THREE.Vector3(1, 1, 1) },
    uHighTint: { value: new THREE.Vector3(1, 1, 1) },
    uGrain: { value: 0 },
    uVignette: { value: 0 },
    uChroma: { value: 0 },
    uBlur: { value: 0 },
    uCCTV: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime, uExposure, uContrast, uSat, uSplit, uGrain, uVignette, uChroma, uBlur, uCCTV;
    uniform vec2 uRes;
    uniform vec3 uShadowTint, uHighTint;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      vec2 c = uv - 0.5;
      uv = 0.5 + c * (1.0 - uCCTV * 0.12 * dot(c, c));
      vec3 col;
      if (uBlur > 0.001) {
        vec2 px = uBlur * 7.0 / uRes;
        float w = 0.0; col = vec3(0.0);
        for (int x = -2; x <= 2; x++) for (int y = -2; y <= 2; y++) {
          float k = exp(-float(x * x + y * y) / 4.0);
          col += texture2D(tDiffuse, uv + vec2(float(x), float(y)) * px).rgb * k; w += k;
        }
        col /= w;
      } else {
        vec2 off = (uv - 0.5) * uChroma * 0.012;
        col = vec3(texture2D(tDiffuse, uv + off).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - off).b);
      }
      col *= uExposure;
      col = (col - 0.5) * uContrast + 0.5;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, col * uShadowTint, (1.0 - l) * uSplit);
      col = mix(col, col * uHighTint, l * uSplit);
      col = mix(vec3(l), col, uSat);
      col = mix(col, vec3(l) * vec3(0.86, 1.0, 0.88), uCCTV * 0.85);
      col *= 1.0 - uCCTV * 0.18 * step(0.5, fract(gl_FragCoord.y * 0.25));
      float v = smoothstep(0.9, 0.2, length(vUv - 0.5) * 1.3);
      col *= mix(1.0, v, uVignette);
      float n = hash(vUv * uRes + fract(uTime * 7.13) * 91.0) - 0.5;
      col += n * uGrain * (0.55 + 0.45 * (1.0 - l));
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`,
};

export const GRADES = {
  film98: { exposure: 1.0, contrast: 1.06, sat: 0.9, split: 0.4, shadow: [0.86, 0.96, 1.14], high: [1.12, 1.0, 0.84], grain: 0.075, vignette: 0.5, chroma: 0.2, cctv: 0 },
  hospital: { exposure: 0.86, contrast: 1.03, sat: 0.72, split: 0.35, shadow: [0.88, 0.98, 1.12], high: [0.98, 1.02, 1.06], grain: 0.07, vignette: 0.55, chroma: 0.15, cctv: 0 },
  cctv: { exposure: 1.05, contrast: 1.25, sat: 0.25, split: 0, shadow: [1, 1, 1], high: [1, 1, 1], grain: 0.22, vignette: 0.85, chroma: 0.9, cctv: 1 },
  menu: { exposure: 0.95, contrast: 1.1, sat: 0.8, split: 0.3, shadow: [0.9, 0.95, 1.1], high: [1.1, 1, 0.9], grain: 0.1, vignette: 0.7, chroma: 0.3, cctv: 0 },
};

export class Post {
  constructor(renderer, camera) {
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(new THREE.Scene(), camera);
    // Oclusión ambiental (sólo en calidad Alta): oscurece esquinas, uniones y lo que está debajo de los muebles.
    this.gtao = new GTAOPass(this.renderPass.scene, camera, 256, 256);
    this.gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.5, thickness: 1.2, scale: 1.1, samples: 12, distanceFallOff: 1 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    this.gtao.blendIntensity = 0.85;
    this.gtao.enabled = false;
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.2, 0.45, 0.9);
    this.output = new OutputPass();
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.gtao);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.output);
    this.composer.addPass(this.grade);
    this.u = this.grade.uniforms;
    this.setGrade('film98');
  }

  setScene(scene, camera) { this.renderPass.scene = scene; this.renderPass.camera = camera; this.gtao.scene = scene; this.gtao.camera = camera; }

  setSize(w, h, pr) {
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    this.gtao.setSize(Math.round(w * pr / 2), Math.round(h * pr / 2)); // AO a media resolución
    this.u.uRes.value.set(w * pr, h * pr);
  }

  setBloom(on) { this.bloom.enabled = on; }
  setAO(on) { this.gtao.enabled = on; }

  _values(g) {
    return [g.exposure, g.contrast, g.sat, g.split, ...g.shadow, ...g.high, g.grain, g.vignette, g.chroma, g.cctv];
  }

  _apply(v) {
    const u = this.u;
    u.uExposure.value = v[0]; u.uContrast.value = v[1]; u.uSat.value = v[2]; u.uSplit.value = v[3];
    u.uShadowTint.value.set(v[4], v[5], v[6]); u.uHighTint.value.set(v[7], v[8], v[9]);
    u.uGrain.value = v[10]; u.uVignette.value = v[11]; u.uChroma.value = v[12]; u.uCCTV.value = v[13];
  }

  setGrade(name) { this.current = this._values(GRADES[name]); this._apply(this.current); }

  async toGrade(name, seconds) {
    const from = this.current.slice();
    const to = this._values(GRADES[name]);
    await tween(seconds, (t) => { this.current = from.map((a, i) => lerp(a, to[i], t)); this._apply(this.current); });
  }

  setBlur(v) { this.u.uBlur.value = v; }
  blur(to, seconds) { const from = this.u.uBlur.value; return tween(seconds, (t) => this.setBlur(lerp(from, to, t))); }

  render(time) {
    this.u.uTime.value = time;
    this.composer.render();
  }
}
