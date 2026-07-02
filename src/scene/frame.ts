import * as THREE from 'three';
import type { ModelAnchor, ViewSpec } from '../types';

/**
 * Canonical model frame shared by the NASA model and the fallback model:
 * tube axis along +Y (aperture at +Y), theta=0 pointing along +X (toward a
 * solar array wing), theta measured toward +Z.
 */
export class ModelFrame {
  readonly center = new THREE.Vector3(0, 0, 0);
  length: number;
  tubeRadius: number;

  constructor(length: number, tubeRadius: number) {
    this.length = length;
    this.tubeRadius = tubeRadius;
  }

  radialDir(thetaDeg: number, out = new THREE.Vector3()): THREE.Vector3 {
    const th = THREE.MathUtils.degToRad(thetaDeg);
    return out.set(Math.cos(th), 0, Math.sin(th));
  }

  anchorToWorld(a: ModelAnchor, out = new THREE.Vector3()): THREE.Vector3 {
    this.radialDir(a.theta, out);
    out.multiplyScalar(a.r * this.tubeRadius);
    out.y += a.t * this.length;
    return out.add(this.center);
  }

  /** Camera position for a ViewSpec looking at `target`. */
  viewToCamera(view: ViewSpec, target: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
    const az = THREE.MathUtils.degToRad(view.azimuth);
    const el = THREE.MathUtils.degToRad(view.elevation);
    const d = view.distance * this.tubeRadius;
    out.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    return out.multiplyScalar(d).add(target);
  }
}
