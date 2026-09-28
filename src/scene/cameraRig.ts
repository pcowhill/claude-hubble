import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smooth camera flights that the user can interrupt by grabbing the view. */
export class CameraRig {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private active = false;
  private t = 0;
  private duration = 1.4;
  private fromPos = new THREE.Vector3();
  private toPos = new THREE.Vector3();
  private fromTarget = new THREE.Vector3();
  private toTarget = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls, interruptEl: HTMLElement) {
    this.camera = camera;
    this.controls = controls;
    interruptEl.addEventListener('pointerdown', () => {
      this.active = false;
    });
    interruptEl.addEventListener(
      'wheel',
      () => {
        this.active = false;
      },
      { passive: true },
    );
  }

  flyTo(position: THREE.Vector3, target: THREE.Vector3, duration = 1.5): void {
    this.fromPos.copy(this.camera.position);
    this.fromTarget.copy(this.controls.target);
    this.toPos.copy(position);
    this.toTarget.copy(target);
    this.duration = duration;
    this.t = 0;
    this.active = true;
  }

  get flying(): boolean {
    return this.active;
  }

  tick(dt: number): void {
    if (!this.active) return;
    this.t += dt / this.duration;
    const k = easeInOutCubic(Math.min(this.t, 1));
    this.camera.position.lerpVectors(this.fromPos, this.toPos, k);
    this.controls.target.lerpVectors(this.fromTarget, this.toTarget, k);
    if (this.t >= 1) this.active = false;
  }
}
