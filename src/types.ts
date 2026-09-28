/**
 * Shared types for the Hubble Systems Cutaway exhibit.
 *
 * Positions use a normalized "model frame" so subsystem data stays valid for
 * both the NASA GLB and the procedural fallback model:
 *   - t:     axial position along the telescope tube, -0.5 = aft bulkhead,
 *            +0.5 = aperture (forward) end
 *   - r:     radial distance in units of the local tube radius (1 = skin)
 *   - theta: azimuth in degrees around the tube axis; 0 = +X (solar array
 *            wing), 90 = +Z, measured counter-clockwise looking down +Y
 */

export type ConfidenceLevel = 'visible' | 'reference' | 'approximation';

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  visible: 'Directly visible on model',
  reference: 'Placement based on NASA reference',
  approximation: 'Educational approximation',
};

export type ViewMode = 'standard' | 'callouts' | 'xray' | 'optics' | 'power' | 'data' | 'thermal';
export type LightingPreset = 'studio' | 'sunlit' | 'orbitNight';
export type SubsystemCategory =
  | 'optics'
  | 'science'
  | 'pointing'
  | 'power'
  | 'comms'
  | 'data'
  | 'thermal'
  | 'structure';

export interface ModelAnchor {
  t: number;
  r: number;
  theta: number;
}

/** Camera framing relative to an anchor point. Distances in model radii. */
export interface ViewSpec {
  azimuth: number; // deg around tube axis
  elevation: number; // deg above equatorial plane of the model
  distance: number; // multiples of the model tube radius
}

export type VolumeSpec =
  | {
      kind: 'cylinder';
      center: ModelAnchor;
      radius: number; // tube radii
      length: number; // fraction of model length
      axis?: 'tube' | 'radial'; // radial = pointing outward at theta
    }
  | {
      kind: 'box';
      center: ModelAnchor;
      size: [number, number, number]; // tube radii (x = tangential, y = axial expressed in radii, z = radial)
      /** Rotation (deg) about the outward boom/radial axis, e.g. solar wing pitch. */
      boomTilt?: number;
    }
  | {
      kind: 'disk';
      center: ModelAnchor;
      radius: number; // tube radii
      thickness: number; // tube radii
    };

export interface SubsystemStat {
  label: string;
  value: string;
}

export interface SubsystemPhoto {
  src: string;
  caption: string;
  credit: string;
}

export interface Subsystem {
  id: string;
  name: string;
  shortName: string;
  category: SubsystemCategory;
  keyNumber?: string; // headline stat shown under the name
  confidence: ConfidenceLevel;
  confidenceNote: string;
  anchor: ModelAnchor;
  /** Fine-tuning of the label position relative to the anchor (model units are tube radii). */
  labelTweak?: { dr?: number; dy?: number; dtheta?: number };
  view: ViewSpec;
  volumes: VolumeSpec[];
  purpose: string;
  how: string;
  why: string;
  stats: SubsystemStat[];
  photo?: SubsystemPhoto;
}

export interface TourStep {
  id: string;
  title: string;
  kicker: string; // small label above the title, e.g. "STOP 3 OF 10"
  body: string;
  subsystemId?: string;
  viewMode?: ViewMode;
  lighting?: LightingPreset;
  /** Optional camera override; otherwise derived from the subsystem view. */
  view?: ViewSpec & { anchor?: ModelAnchor };
}

export interface AssetEntry {
  id: string;
  kind: 'model' | 'texture' | 'image' | 'audio';
  path: string;
  name: string;
  sourceUrl: string;
  license: string;
  role: 'primary' | 'fallback' | 'reference';
  usage: string;
}

export interface SourceEntry {
  title: string;
  url: string;
  usedFor: string;
}
