import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_URL } from '../data/assetManifest';
import { buildFallbackHubble } from './fallbackHubble';

export interface ModelHandle {
  group: THREE.Group;
  source: 'nasa' | 'fallback';
  /** Fade the hull to a translucent ghost so interior overlays read as a cutaway. */
  setGhost(on: boolean): void;
}

/**
 * Visual calibration of the NASA GLB into the canonical frame
 * (+Y aperture, arrays along ±X). Verified with the ?debug=1 view.
 */
const CAL = {
  targetLength: 13.2, // scene units for the full stack (tube incl. door)
  flipY: false,
  arraysAlongZ: false,
  lengthFudge: 1.0,
  centerShiftT: 0,
};

const GHOST_MAT = new THREE.MeshStandardMaterial({
  color: 0x9fb9d6,
  transparent: true,
  opacity: 0.18,
  roughness: 0.65,
  metalness: 0.1,
  depthWrite: false,
});

function normalize(inner: THREE.Object3D): THREE.Group {
  const container = new THREE.Group();
  container.name = 'hst-model';
  container.add(inner);

  let box = new THREE.Box3().setFromObject(inner);
  let size = box.getSize(new THREE.Vector3());

  // Put the longest extent on Y (tube axis).
  if (size.x >= size.y && size.x >= size.z) {
    inner.rotation.z = Math.PI / 2;
  } else if (size.z >= size.y && size.z >= size.x) {
    inner.rotation.x = -Math.PI / 2;
  }
  inner.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(inner);
  size = box.getSize(new THREE.Vector3());

  if (CAL.flipY) {
    inner.rotateX(Math.PI);
    inner.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(inner);
  }
  if (CAL.arraysAlongZ) {
    inner.rotateY(Math.PI / 2);
    inner.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(inner);
  }
  size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  inner.position.sub(center);

  const scale = (CAL.targetLength * CAL.lengthFudge) / size.y;
  container.scale.setScalar(scale);
  container.position.y = CAL.centerShiftT * CAL.targetLength;
  return container;
}

function prepareMaterials(root: THREE.Object3D): void {
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.envMapIntensity = 0.9;
        if (m.transparent) m.depthWrite = false;
      }
    }
  });
}

function makeGhostable(group: THREE.Group): (on: boolean) => void {
  const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) saved.set(o, o.material);
  });
  return (on: boolean) => {
    for (const [mesh, original] of saved) {
      mesh.material = on ? GHOST_MAT : original;
    }
  };
}

export async function loadHubbleModel(
  onProgress: (fraction: number) => void,
): Promise<ModelHandle> {
  const loader = new GLTFLoader();
  try {
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Model load timed out')), 90_000);
      loader.load(
        MODEL_URL,
        (g) => {
          window.clearTimeout(timer);
          resolve(g);
        },
        (ev) => {
          if (ev.total > 0) onProgress(Math.min(ev.loaded / ev.total, 1));
        },
        (err) => {
          window.clearTimeout(timer);
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      );
    });

    const group = normalize(gltf.scene);
    prepareMaterials(group);
    onProgress(1);
    return { group, source: 'nasa', setGhost: makeGhostable(group) };
  } catch (err) {
    console.warn('[exhibit] NASA model failed to load, using procedural stand-in:', err);
    const group = buildFallbackHubble(CAL.targetLength);
    onProgress(1);
    return { group, source: 'fallback', setGhost: makeGhostable(group) };
  }
}
