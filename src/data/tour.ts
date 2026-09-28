import type { TourStep } from '../types';

/**
 * Guided tour: a curated path through the observatory. Steps reference
 * subsystems for highlighting and camera focus; facts are sourced from the
 * NASA pages listed in RESEARCH.md.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Meet the Hubble Space Telescope',
    kicker: 'Orientation',
    body:
      'Launched aboard shuttle Discovery on April 24, 1990, Hubble is a school-bus-sized observatory — 43.5 ft (13.2 m) long, about 27,000 lb — circling Earth every 95 minutes at roughly 300 miles up. Because it flies above the blurring atmosphere, it sees the universe with 0.05-arcsecond sharpness. Drag to orbit the model, scroll to zoom, and click any marker to inspect a subsystem.',
    viewMode: 'callouts',
    view: { azimuth: 38, elevation: 16, distance: 13.5 },
  },
  {
    id: 'door',
    title: 'The Eyelid: Aperture Door',
    kicker: 'Structure',
    body:
      'Light enters through one opening at the top of the tube, guarded by a hinged door. It opened in orbit in 1990 and has protected the optics ever since — Hubble never points within 50° of the Sun, and the door can close itself if pointing control is lost.',
    subsystemId: 'aperture-door',
  },
  {
    id: 'lightpath',
    title: 'Follow the Light',
    kicker: 'Optics',
    body:
      'Starlight travels down the baffled tube to the 2.4 m primary mirror, bounces forward to a 30.5 cm secondary mirror, then returns through a hole in the primary to the focal plane behind it. This folded Ritchey–Chrétien design packs a 57.6 m focal length into a 13 m spacecraft. The glowing overlay traces the beam — an educational approximation of the real geometry.',
    subsystemId: 'ota',
    viewMode: 'optics',
    view: { azimuth: -35, elevation: 14, distance: 13, anchor: { t: 0.05, r: 0, theta: 0 } },
  },
  {
    id: 'mirror',
    title: 'The 2.4-Meter Primary Mirror',
    kicker: 'Optics',
    body:
      'The heart of Hubble: an 828 kg disk of Ultra-Low Expansion glass, honeycombed to a quarter of a solid mirror’s weight and coated in aluminum just 0.1 µm thick. Polished almost perfectly — and famously 2.2 µm wrong, a flaw corrected by astronauts with COSTAR’s corrective optics in 1993.',
    subsystemId: 'primary-mirror',
    viewMode: 'xray',
  },
  {
    id: 'instruments',
    title: 'Cameras & Spectrographs',
    kicker: 'Science payload',
    body:
      'Behind the mirror, the aft shroud holds the science payload: four axial bays (ACS, COS, STIS, dormant NICMOS) plus the radial Wide Field Camera 3, whose pick-off mirror sips light from the center of the focal plane. Every instrument is a swappable module — the reason a 1990 telescope carries modern detectors.',
    subsystemId: 'instruments',
    viewMode: 'xray',
  },
  {
    id: 'wfc3',
    title: 'Workhorse: Wide Field Camera 3',
    kicker: 'Science payload',
    body:
      'Installed on the final servicing mission in 2009, WFC3 images from the ultraviolet into the near-infrared. It captured the eXtreme Deep Field and most of the iconic Hubble images of the last decade and a half.',
    subsystemId: 'wfc3',
    viewMode: 'xray',
  },
  {
    id: 'pointing',
    title: 'Staying Locked On',
    kicker: 'Pointing control',
    body:
      'With no thrusters, Hubble aims by spinning four reaction wheels and sensing rotation with gyroscopes turning at 19,200 rpm. Fine Guidance Sensors then hold a guide star to within 0.007 arcsecond — like pinning a laser on a human hair a mile away. Since 2024 Hubble runs deliberately on a single gyro to extend its life.',
    subsystemId: 'fgs',
    viewMode: 'xray',
  },
  {
    id: 'power',
    title: 'Power from Sunlight',
    kicker: 'Electrical power',
    body:
      'Two rigid gallium-arsenide wings — Iridium-satellite panel technology installed in 2002 — generate about 5,000 W. Six nickel-hydrogen batteries in the equipment ring store 528 amp-hours to bridge the ~36 minutes of night in every orbit. The overlay traces power flowing from the wings to the battery bays and distribution ring.',
    subsystemId: 'solar-arrays',
    viewMode: 'power',
    view: { azimuth: 40, elevation: 20, distance: 13.5 },
  },
  {
    id: 'comms',
    title: 'Phoning Home',
    kicker: 'Communications & data',
    body:
      'Observations buffer on a 12-gigabit solid-state recorder, then flow at ~1 Mbps through a high-gain dish to a TDRS relay satellite 22,300 miles up, down to White Sands, New Mexico — about 18 GB of science per week. Commands ride the same path in reverse to the Intel-486 Advanced Computer that flies the spacecraft.',
    subsystemId: 'comms',
    viewMode: 'data',
    view: { azimuth: 235, elevation: 18, distance: 12.0 },
  },
  {
    id: 'thermal',
    title: 'Wrapped for Survival',
    kicker: 'Thermal control',
    body:
      'That silver skin is engineering, not styling: multilayer insulation blankets and reflective coverings even out swings from full sun to deep-space shadow every 95 minutes, with heaters guarding the electronics. Spacewalkers patched aged blankets with steel NOBL panels in 1999–2002 — you can see the paneled bays on the equipment ring.',
    subsystemId: 'thermal',
  },
  {
    id: 'serviced',
    title: 'Built to Be Serviced',
    kicker: 'Legacy',
    body:
      'Five shuttle crews (1993–2009) rebuilt Hubble in orbit — new cameras, gyros, computers, batteries and blankets — the only telescope ever designed for astronaut repair. More than 1.7 million observations later, it still works alongside JWST. You are free to explore: click any marker, switch view modes, or restart the tour.',
    viewMode: 'callouts',
    lighting: 'sunlit',
    view: { azimuth: -130, elevation: 20, distance: 13.0 },
  },
];
