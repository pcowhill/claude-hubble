import * as THREE from 'three';
import type { LightingPreset } from '../types';

interface PresetDef {
  keyIntensity: number;
  keyColor: number;
  keyDir: THREE.Vector3; // FROM this direction toward origin
  fillIntensity: number;
  fillColor: number;
  hemiIntensity: number;
  hemiSky: number;
  hemiGround: number;
  exposure: number;
  earthshine: number; // uplight from Earth below
  envIntensity: number; // PMREM environment contribution (dominates metals)
  sunDiscVisible: boolean;
}

const PRESETS: Record<LightingPreset, PresetDef> = {
  studio: {
    keyIntensity: 2.6,
    keyColor: 0xfff2e0,
    keyDir: new THREE.Vector3(0.9, 0.55, 0.75),
    fillIntensity: 0.7,
    fillColor: 0xcfe0ff,
    hemiIntensity: 0.5,
    hemiSky: 0x9db4cc,
    hemiGround: 0x141a22,
    exposure: 1.05,
    earthshine: 0.35,
    envIntensity: 0.38,
    sunDiscVisible: false,
  },
  sunlit: {
    keyIntensity: 4.2,
    keyColor: 0xfff6e6,
    keyDir: new THREE.Vector3(1.0, 0.28, -0.35),
    fillIntensity: 0.14,
    fillColor: 0xb8ccff,
    hemiIntensity: 0.16,
    hemiSky: 0x8aa4c0,
    hemiGround: 0x05070a,
    exposure: 1.15,
    earthshine: 0.55,
    envIntensity: 0.1,
    sunDiscVisible: true,
  },
  orbitNight: {
    keyIntensity: 0.5,
    keyColor: 0xaac4ee,
    keyDir: new THREE.Vector3(-0.7, 0.4, 0.9),
    fillIntensity: 0.25,
    fillColor: 0x7d9cd0,
    hemiIntensity: 0.5,
    hemiSky: 0x36547e,
    hemiGround: 0x0a1626,
    exposure: 0.85,
    earthshine: 1.5,
    envIntensity: 0.055,
    sunDiscVisible: false,
  },
};

export class LightingRig {
  private scene: THREE.Scene;
  readonly key: THREE.DirectionalLight;
  readonly fill: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly earthshine: THREE.DirectionalLight;
  private renderer: THREE.WebGLRenderer;
  private current: PresetDef;
  private target: PresetDef;
  private blend = 1;
  private sunDisc: THREE.Object3D | null = null;
  private onSunDir: ((dir: THREE.Vector3) => void) | null = null;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.key = new THREE.DirectionalLight(0xffffff, 2.4);
    this.fill = new THREE.DirectionalLight(0xccddff, 0.7);
    this.hemi = new THREE.HemisphereLight(0x9db4cc, 0x141a22, 0.5);
    this.earthshine = new THREE.DirectionalLight(0x9db9e8, 0.35);
    this.earthshine.position.set(-8, -30, -14); // up from Earth's disk
    scene.add(this.key, this.fill, this.hemi, this.earthshine);

    this.current = { ...PRESETS.studio, keyDir: PRESETS.studio.keyDir.clone(), };
    this.target = PRESETS.studio;
    this.apply(1);
  }

  attachSunDisc(disc: THREE.Object3D): void {
    this.sunDisc = disc;
    disc.visible = this.target.sunDiscVisible;
    disc.position.copy(this.target.keyDir).normalize().multiplyScalar(1200);
  }

  onSunDirection(fn: (dir: THREE.Vector3) => void): void {
    this.onSunDir = fn;
    fn(this.key.position.clone().normalize());
  }

  setPreset(name: LightingPreset): void {
    this.target = PRESETS[name];
    this.blend = 0;
  }

  tick(dt: number): void {
    if (this.blend >= 1) return;
    this.blend = Math.min(1, this.blend + dt * 1.8);
    this.apply(THREE.MathUtils.smoothstep(this.blend, 0, 1));
  }

  private apply(k: number): void {
    const c = this.current;
    const t = this.target;
    const lerp = THREE.MathUtils.lerp;

    const keyI = lerp(c.keyIntensity, t.keyIntensity, k);
    const fillI = lerp(c.fillIntensity, t.fillIntensity, k);
    const hemiI = lerp(c.hemiIntensity, t.hemiIntensity, k);
    const expo = lerp(c.exposure, t.exposure, k);
    const earthI = lerp(c.earthshine, t.earthshine, k);
    const envI = lerp(c.envIntensity, t.envIntensity, k);
    const dir = c.keyDir.clone().lerp(t.keyDir, k).normalize();

    this.key.intensity = keyI;
    this.key.color.set(t.keyColor);
    this.key.position.copy(dir).multiplyScalar(60);
    this.fill.intensity = fillI;
    this.fill.color.set(t.fillColor);
    this.fill.position.copy(dir).multiplyScalar(-46).setY(Math.abs(dir.y) * 30 + 8);
    this.hemi.intensity = hemiI;
    this.hemi.color.set(t.hemiSky);
    this.hemi.groundColor.set(t.hemiGround);
    this.earthshine.intensity = earthI;
    this.scene.environmentIntensity = envI;
    this.renderer.toneMappingExposure = expo;

    if (this.sunDisc) {
      this.sunDisc.visible = t.sunDiscVisible;
      this.sunDisc.position.copy(dir).multiplyScalar(1200);
    }
    this.onSunDir?.(dir);

    if (k >= 1) {
      this.current = { ...t, keyDir: t.keyDir.clone() };
    }
  }
}
