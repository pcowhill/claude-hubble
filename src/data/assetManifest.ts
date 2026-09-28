import type { AssetEntry } from '../types';

/**
 * Every external asset used by the exhibit, with provenance.
 * Mirrored in human-readable form in ASSETS.md at the repo root.
 */
export const ASSET_MANIFEST: AssetEntry[] = [
  {
    id: 'hst-model',
    kind: 'model',
    path: 'assets/models/hst.glb',
    name: 'Hubble Space Telescope 3D model (glTF binary)',
    sourceUrl: 'https://science.nasa.gov/resource/hubble-space-telescope-3d-model-2/',
    license: 'NASA media — generally not copyrighted; free for educational use (NASA Media Usage Guidelines)',
    role: 'primary',
    usage: 'The main 3D exhibit model.',
  },
  {
    id: 'earth-day',
    kind: 'texture',
    path: 'assets/textures/earth_day.jpg',
    name: 'NASA Blue Marble Next Generation (Dec 2004, topography & bathymetry)',
    sourceUrl: 'https://visibleearth.nasa.gov/images/73909/december-blue-marble-next-generation-w-topography-and-bathymetry',
    license: 'NASA Visible Earth — free for public use',
    role: 'primary',
    usage: 'Daylit Earth surface in the orbital backdrop.',
  },
  {
    id: 'earth-night',
    kind: 'texture',
    path: 'assets/textures/earth_night.jpg',
    name: 'NASA Black Marble 2016 (Earth at night)',
    sourceUrl: 'https://earthobservatory.nasa.gov/features/NightLights',
    license: 'NASA Earth Observatory — free for public use',
    role: 'primary',
    usage: 'City lights on the night side of Earth.',
  },
  {
    id: 'starmap',
    kind: 'texture',
    path: 'assets/textures/starmap_celestial_1024.jpg',
    name: 'NASA/GSFC Scientific Visualization Studio Deep Star Map 2020 (print preview)',
    sourceUrl: 'https://svs.gsfc.nasa.gov/4851',
    license: 'NASA SVS — free for public use',
    role: 'primary',
    usage: 'Faint Milky Way band behind the procedural starfield. Full-resolution SVS versions are EXR-only, so the 1024 px preview is used at low intensity.',
  },
  {
    id: 'cutaway-diagram',
    kind: 'image',
    path: 'assets/images/hst_cutaway_diagram.jpg',
    name: 'Hubble instruments, control and support systems (NASA/STScI cutaway infographic)',
    sourceUrl: 'https://science.nasa.gov/asset/hubble/hubbles-instruments-including-control-and-support-systems-cutaway/',
    license: 'NASA/STScI — free for educational use',
    role: 'reference',
    usage: 'Reference for interior overlay placement; shown in the Sources panel.',
  },
];

/** NASA photo library entries used inside subsystem info panels. */
export const PHOTO_CREDIT = 'NASA';

export const MODEL_URL = 'assets/models/hst.glb';

/**
 * Calibration of the NASA GLB into the exhibit's canonical model frame:
 * tube axis = +Y with the aperture end at +Y, solar array wings along ±X.
 * Values verified visually with the ?debug=1 calibration view.
 */
export const MODEL_CALIBRATION = {
  /** Extra rotation (Euler XYZ, radians) applied after load. */
  rotation: [0, 0, 0] as [number, number, number],
  /** Fraction [0..1] of bbox Y that is the aft end (used to re-center). */
  recenter: true,
  /** Target length of the telescope in scene units (roughly meters). */
  targetLength: 13.2,
  /** Tube radius in scene units after scaling (main body ~4.3 m dia => 2.15). */
  tubeRadius: 2.15,
};
