import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export type TickFn = (dt: number, elapsed: number) => void;

/** Owns renderer, camera, controls and the render loop. */
export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly labelRenderer: CSS2DRenderer;
  readonly controls: OrbitControls;
  private clock = new THREE.Clock();
  private tickFns: TickFn[] = [];
  private host: HTMLElement;

  constructor(host: HTMLElement) {
    this.host = host;
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 4000);
    this.camera.position.set(24, 9, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.domElement.id = 'webgl-canvas';
    host.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(w, h);
    this.labelRenderer.domElement.id = 'label-layer';
    host.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 90;
    this.controls.maxPolarAngle = Math.PI * 0.98;
    this.controls.target.set(0, 0.5, 0);

    window.addEventListener('resize', this.onResize);
    // Element-level resize (e.g. mobile browser chrome collapsing).
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(this.onResize).observe(host);
    }
  }

  onTick(fn: TickFn): void {
    this.tickFns.push(fn);
  }

  start(): void {
    this.renderer.setAnimationLoop(() => {
      // Generous clamp so animation time tracks wall time even on very slow
      // renderers (e.g. software WebGL); only truly huge pauses are cut.
      const dt = Math.min(this.clock.getDelta(), 0.25);
      const elapsed = this.clock.elapsedTime;
      this.controls.update();
      for (const fn of this.tickFns) fn(dt, elapsed);
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    });
  }

  private onResize = (): void => {
    const w = this.host.clientWidth || window.innerWidth;
    const h = this.host.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  };
}
