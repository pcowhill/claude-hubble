# Assets

Every external asset used by **Hubble Systems Cutaway**, with source, license/usage
status, local path, and how it is used. Assets were downloaded on 2026-07-02.

General licensing note: NASA media are generally **not protected by copyright**
and may be used for educational and informational purposes without explicit
permission, per the [NASA Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
NASA does not endorse this project. Space Telescope Science Institute (STScI)
materials on NASA sites are free for educational use with credit.

## 3D model

| | |
|---|---|
| Asset | **Hubble Space Telescope 3D model (glTF binary)** |
| Source | https://science.nasa.gov/resource/hubble-space-telescope-3d-model-2/ (file served from assets.science.nasa.gov, NASA "Spacecraft in 3D" collection) |
| License / usage | NASA media — free for educational use, no endorsement implied |
| Local path | `public/assets/models/hst.glb` (11.5 MB) |
| Used for | The main exhibit model |
| Status | **Primary** |

Notes: the GLB contains 11 material-grouped meshes (foil, panels, body textures),
not per-subsystem parts, so subsystem highlighting is done with overlay volumes and
hotspot anchors rather than mesh manipulation. A second official model
("Hubble Space Telescope (A)", Draco/WebP-compressed) was evaluated and not used.

## Textures

| Asset | Source | License | Local path | Use | Status |
|---|---|---|---|---|---|
| Blue Marble Next Generation, Dec 2004 (topography & bathymetry), 5400×2700 | https://visibleearth.nasa.gov/images/73909/december-blue-marble-next-generation-w-topography-and-bathymetry (file: eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg) | NASA Visible Earth — free for public use | `public/assets/textures/earth_day.jpg` | Day side of the Earth globe | Primary |
| Black Marble 2016 (Earth at night), 3600×1800 | https://earthobservatory.nasa.gov/features/NightLights (file: eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg) | NASA Earth Observatory — free for public use | `public/assets/textures/earth_night.jpg` | Night-side city lights in the Earth shader | Primary |
| Deep Star Maps 2020 — celestial equirectangular star map (1024×512 print preview) | https://svs.gsfc.nasa.gov/4851 (NASA/GSFC Scientific Visualization Studio) | NASA SVS — free for public use | `public/assets/textures/starmap_celestial_1024.jpg` | Faint Milky Way band on the sky sphere | Primary (reduced resolution — see note) |

Star map note: SVS 4851 publishes full-resolution maps only as EXR/TIF
(36 MB–1 GB), which is impractical for a web exhibit, so the 1024×512 JPEG
preview is used at low opacity for the Milky Way glow, and **crisp foreground
stars are generated procedurally** (seeded point field, documented below).

## Reference imagery (in-app info panels)

All photographs are from the [NASA Image and Video Library](https://images.nasa.gov/)
(`images-assets.nasa.gov/image/<ID>/<ID>~medium.jpg`), NASA media usage terms.
Local path: `public/assets/images/<ID>.jpg`. All are **primary** assets.

| NASA ID | Content (verified from NASA caption) | Date | Used in panel |
|---|---|---|---|
| `s125e012033` | Hubble drifting free after release from Atlantis, end of Servicing Mission 4 | 2009-05-19 | (reserved hero image) |
| `s82e5109` | Close-up of Hubble during STS-82 approach, high-gain antenna visible | 1997-02-13 | Optical Telescope Assembly |
| `8000165` | Artist's concept of Hubble with aperture door open (MSFC history collection) | ~1980 | Aperture Door |
| `8108126` | Primary mirror being polished at Perkin-Elmer's optics facility | ~1981 | Primary Mirror |
| `KSC-08pd2323` | Cosmic Origins Spectrograph under blacklight inspection at KSC | 2008-08-06 | Axial Science Instruments |
| `KSC-08pd2457` | Technician checks WFC3's pick-off mirror at KSC | 2008-08-18 | Wide Field Camera 3 |
| `KSC-08pd2343` | Fine Guidance Sensor prepared for SM4 integration at KSC | 2008-08-08 | Fine Guidance Sensors |
| `sts103-331-013` | Astronauts Smith & Grunsfeld replacing gyroscope Rate Sensor Units (SM3A EVA) | 1999-12 | Pointing Control |
| `KSC-01pp1636` | Third-generation rigid solar arrays in processing for STS-109 | 2001-10-23 | Solar Arrays |
| `s125e010049` | Astronaut Feustel installing a battery group replacement, SM4 EVA5 | 2009-05-18 | Batteries & Power |
| `s31-03-002` | High-gain antenna deployment during STS-31 | 1990-04-25 | Communications Antennas |
| `s31-10-035` | STS-31 deployment, original roll-out solar array unfurling | 1990-04-25 | Thermal Protection |
| `sts061-99-002` | Second-generation solar arrays deployed during SM1 | 1993-12-09 | (extra reference) |
| `hst_cutaway_diagram.jpg` | NASA/STScI cutaway infographic of Hubble's instruments & support systems, from https://science.nasa.gov/asset/hubble/hubbles-instruments-including-control-and-support-systems-cutaway/ | — | Computers & Data Handling panel; placement reference for interior overlays |

One additional image (`KSC-99pp1525`) was downloaded during curation but
**removed** after its caption turned out to describe a launch-viewing event,
not the Advanced Computer.

## Audio

| | |
|---|---|
| Asset | Ambient hum + UI tones |
| Source | **Generated procedurally in the browser with the Web Audio API** (`src/audio/audioEngine.ts`) — sine/triangle drones, filtered noise, short envelope blips |
| License | Original code, no external audio files |
| Used for | Optional exhibit ambience and interaction feedback. **Off by default**; toggled via the Audio button or `M` |
| Status | **Documented procedural fallback** |

Why: the NASA Image and Video Library audio search returned no suitable
open-license Hubble ambience/sonification files at capture time, and other
sources (e.g. Freesound) require per-account API keys. Per the project's asset
policy, the synthesized fallback is used and documented here and in the README.

## Procedural / locally generated visuals

Documented per the asset policy (used only where a real asset is impractical):

- **Starfield points** — ~3,600 seeded random stars (three.js Points), used for
  crisp foreground stars in front of the low-resolution NASA star map.
- **Fallback spacecraft model** (`src/scene/fallbackHubble.ts`) — a simplified
  procedural Hubble built from primitives to NASA's published dimensions
  (13.2 m × 4.2 m, 7.1 × 2.6 m arrays). Used **only** if the NASA GLB fails to
  load; the UI shows a "Simplified stand-in model" badge and a toast when active.
- **Highlight volumes, beams, flow paths** — educational overlay geometry, not
  engineering data; positions follow the NASA cutaway infographic (above) and are
  labeled with confidence notes in-app.
- **UI marker/glow sprites** — tiny canvas-drawn radial gradients.
- **Earth day/night shader** — original GLSL combining the two NASA textures.
