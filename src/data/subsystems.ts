import type { Subsystem } from '../types';

/**
 * Subsystem content researched from NASA sources (see RESEARCH.md for the
 * full citation list). Every entry carries a confidence label:
 *   visible        — the hardware itself is visible on the exhibit model
 *   reference      — placement/details follow NASA reference material
 *   approximation  — simplified educational placement, interior not modeled
 */
export const SUBSYSTEMS: Subsystem[] = [
  {
    id: 'aperture-door',
    name: 'Aperture Door',
    shortName: 'Aperture Door',
    category: 'structure',
    keyNumber: 'Guards the telescope’s only opening',
    confidence: 'visible',
    confidenceNote:
      'The door is directly visible at the forward end of the model. Its sun-avoidance rules come from NASA’s pointing-control documentation.',
    anchor: { t: 0.37, r: 0.72, theta: 25 },
    labelTweak: { dy: 0.35 },
    view: { azimuth: 45, elevation: 34, distance: 7.5 },
    volumes: [{ kind: 'disk', center: { t: 0.325, r: 0, theta: 0 }, radius: 0.76, thickness: 0.08 }],
    purpose:
      'A hinged lid at the top of the light shield that protects Hubble’s optics. It closed for launch, opened once the telescope reached orbit, and can snap shut to shield the mirrors from the Sun.',
    how: 'The door swings on motor-driven hinges at the tube’s forward rim. Onboard safeguards keep the telescope pointed at least 50 degrees away from the Sun, and if pointing control is ever lost the door can close automatically so that focused sunlight cannot damage the instruments.',
    why: 'Hubble’s detectors are built to register light from objects billions of times fainter than the human eye can see. Direct sunlight down the tube would permanently damage them — the door is the telescope’s eyelid.',
    stats: [
      { label: 'Location', value: 'Forward rim of the light shield' },
      { label: 'Sun keep-out', value: '≥ 50° between telescope line of sight and the Sun' },
      { label: 'Status', value: 'Open since 1990 except for protective events' },
    ],
    photo: {
      src: 'assets/images/8000165.jpg',
      caption:
        'NASA artist’s concept of Hubble with its aperture door open, high-gain antennas and solar arrays deployed.',
      credit: 'NASA/MSFC',
    },
  },
  {
    id: 'ota',
    name: 'Optical Telescope Assembly',
    shortName: 'Optical Assembly',
    category: 'optics',
    keyNumber: 'Ritchey–Chrétien reflector, f/24',
    confidence: 'reference',
    confidenceNote:
      'The tube is visible on the model; the internal truss, baffles and secondary mirror are drawn as overlays based on NASA cutaway diagrams.',
    anchor: { t: 0.12, r: 0.76, theta: -40 },
    labelTweak: { dr: 0.15 },
    view: { azimuth: -70, elevation: 14, distance: 8.0 },
    volumes: [
      { kind: 'cylinder', center: { t: 0.06, r: 0, theta: 0 }, radius: 0.66, length: 0.5 },
      { kind: 'disk', center: { t: 0.26, r: 0, theta: 0 }, radius: 0.15, thickness: 0.06 },
    ],
    purpose:
      'The telescope inside the spacecraft: a Ritchey–Chrétien Cassegrain reflector that collects light with a 2.4 m primary mirror and bounces it off a small secondary mirror down to the science instruments.',
    how: 'Starlight enters the tube past light-blocking baffles, hits the concave primary mirror, reflects forward to the convex 30.5 cm secondary mirror mounted on a truss, then travels back through a hole in the primary to the focal plane behind it. A graphite-epoxy skeleton holds both mirrors in alignment because it barely expands or contracts with temperature swings.',
    why: 'Both mirrors are hyperbolic — the Ritchey–Chrétien trick — which keeps images sharp across a wide field of view, letting Hubble resolve detail of about 0.05 arcseconds: roughly the width of a human hair seen from a mile away.',
    stats: [
      { label: 'Design', value: 'Ritchey–Chrétien Cassegrain reflector' },
      { label: 'Secondary mirror', value: '12.2 in (0.3 m) diameter' },
      { label: 'Angular resolution', value: '0.05 arcsecond in visible light' },
      { label: 'Structure', value: 'Graphite-epoxy metering truss' },
    ],
    photo: {
      src: 'assets/images/s82e5109.jpg',
      caption: 'Hubble’s tube and forward assembly photographed from Discovery during the 1997 servicing mission.',
      credit: 'NASA/JSC',
    },
  },
  {
    id: 'primary-mirror',
    name: 'Primary Mirror',
    shortName: 'Primary Mirror',
    category: 'optics',
    keyNumber: '2.4 m · collects 40,000× more light than your eye',
    confidence: 'reference',
    confidenceNote:
      'The mirror is inside the tube and not visible on the model; the overlay disk marks its true position aft of the equipment ring, per NASA cutaway diagrams.',
    anchor: { t: -0.15, r: 0, theta: 210 },
    labelTweak: { dr: 0.6, dy: 0.1 },
    view: { azimuth: 155, elevation: 10, distance: 7.5 },
    volumes: [{ kind: 'disk', center: { t: -0.15, r: 0, theta: 0 }, radius: 0.56, thickness: 0.09 }],
    purpose:
      'Hubble’s light bucket: a 94.5-inch (2.4 m) concave mirror that gathers 40,000 times more light than a human eye and defines the telescope’s sharpness.',
    how: 'The mirror is Ultra-Low Expansion glass with a honeycomb interior — lightweighting it from about 8,000 lb solid to roughly 1,800 lb (828 kg). Its surface is coated with a reflective aluminum layer about 0.1 micrometer thick under a protective magnesium-fluoride layer. The surface is polished so precisely that scaled to Earth’s diameter, no bump would top 6 inches.',
    why: 'A famous 2.2-micrometer polishing flaw — spherical aberration — blurred Hubble’s first images. Because the error was so precisely wrong, corrective optics (COSTAR, 1993) and correcting instruments restored full sharpness, turning the mirror into the foundation of three decades of discoveries.',
    stats: [
      { label: 'Diameter', value: '94.5 in (2.4 m)' },
      { label: 'Mass', value: '1,825 lb (828 kg)' },
      { label: 'Material', value: 'Corning Ultra-Low Expansion glass, honeycomb core' },
      { label: 'Coating', value: 'Aluminum (~0.1 µm) + magnesium fluoride (~0.025 µm)' },
    ],
    photo: {
      src: 'assets/images/8108126.jpg',
      caption: 'The primary mirror being polished at Perkin-Elmer’s large-optics facility, circa 1981.',
      credit: 'NASA/MSFC',
    },
  },
  {
    id: 'instruments',
    name: 'Axial Science Instruments',
    shortName: 'Instrument Bays',
    category: 'science',
    keyNumber: 'ACS · COS · STIS (+ dormant NICMOS)',
    confidence: 'reference',
    confidenceNote:
      'The aft shroud is visible on the model; the phone-booth-sized instrument boxes inside are overlays placed per NASA’s instrument bay diagrams.',
    anchor: { t: -0.37, r: 0.83, theta: 215 },
    labelTweak: { dy: -0.3 },
    view: { azimuth: 215, elevation: 4, distance: 7.5 },
    volumes: [
      { kind: 'box', center: { t: -0.36, r: 0.34, theta: 45 }, size: [0.4, 1.05, 0.4] },
      { kind: 'box', center: { t: -0.36, r: 0.34, theta: 135 }, size: [0.4, 1.05, 0.4] },
      { kind: 'box', center: { t: -0.36, r: 0.34, theta: 225 }, size: [0.4, 1.05, 0.4] },
      { kind: 'box', center: { t: -0.36, r: 0.34, theta: 315 }, size: [0.4, 1.05, 0.4] },
    ],
    purpose:
      'Four telephone-booth-sized bays in the aft shroud hold Hubble’s axial instruments, which slide in like drawers and all stare at the same focal plane: the Advanced Camera for Surveys, the Cosmic Origins Spectrograph, the Space Telescope Imaging Spectrograph, and the dormant NICMOS infrared camera.',
    how: 'Light from the mirrors comes to focus just inside the aft shroud, where pick-off optics feed each instrument. Cameras like ACS record deep images; spectrographs like COS and STIS fan light into rainbows to measure composition, temperature and motion. Each instrument is an Orbital Replacement Unit — astronauts swapped them through the shroud’s doors during servicing missions.',
    why: 'The instruments are where photons become science. Swappable bays let Hubble be re-instrumented five times, so a 1990 telescope now carries 2000s-era detectors — the reason it stayed at the scientific frontier for three decades.',
    stats: [
      { label: 'ACS', value: 'Advanced Camera for Surveys — wide, deep imaging (2002)' },
      { label: 'COS', value: 'Cosmic Origins Spectrograph — ultraviolet spectra (2009)' },
      { label: 'STIS', value: 'Imaging spectrograph — spectra + coronagraphy (1997)' },
      { label: 'NICMOS', value: 'Near-IR camera (1997), dormant since 2008' },
    ],
    photo: {
      src: 'assets/images/KSC-08pd2323.jpg',
      caption: 'The Cosmic Origins Spectrograph under blacklight contamination inspection before launch to Hubble, 2008.',
      credit: 'NASA/KSC',
    },
  },
  {
    id: 'wfc3',
    name: 'Wide Field Camera 3',
    shortName: 'WFC3',
    category: 'science',
    keyNumber: 'Hubble’s main imager since 2009',
    confidence: 'reference',
    confidenceNote:
      'WFC3 sits in the wedge-shaped radial bay behind its own shroud door; the overlay marks that bay per NASA reference. The camera itself is not visible on the model.',
    anchor: { t: -0.24, r: 0.85, theta: 105 },
    labelTweak: { dy: 0.25 },
    view: { azimuth: 120, elevation: 10, distance: 7.0 },
    volumes: [{ kind: 'box', center: { t: -0.25, r: 0.48, theta: 105 }, size: [0.5, 0.55, 0.6] }],
    purpose:
      'Hubble’s workhorse camera, installed by astronauts in 2009. It images everything from ultraviolet through visible light into the near-infrared — nebulae, galaxies, exoplanet atmospheres and more.',
    how: 'WFC3 lives in the radial bay, pointing inward toward the telescope’s centerline. A small pick-off mirror reaches into the light path near the focal plane and diverts part of the beam into the camera, which splits it between a UV/visible CCD channel and an infrared detector channel.',
    why: 'Its infrared channel effectively replaced the hibernating NICMOS and gave Hubble the deep-field infrared vision behind images like the eXtreme Deep Field. Paired with the older ACS, it lets Hubble photograph the same sky in complementary wavelengths at once.',
    stats: [
      { label: 'Installed', value: 'May 2009, Servicing Mission 4 (STS-125)' },
      { label: 'Replaced', value: 'Wide Field and Planetary Camera 2' },
      { label: 'Wavelengths', value: 'Ultraviolet · visible · near-infrared' },
      { label: 'Mounting', value: 'Radial bay with pick-off mirror at the focal plane' },
    ],
    photo: {
      src: 'assets/images/KSC-08pd2457.jpg',
      caption: 'A technician checks WFC3’s pick-off mirror at Kennedy Space Center before Servicing Mission 4.',
      credit: 'NASA/KSC',
    },
  },
  {
    id: 'fgs',
    name: 'Fine Guidance Sensors',
    shortName: 'Fine Guidance',
    category: 'pointing',
    keyNumber: 'Hold pointing to 0.007 arcsecond',
    confidence: 'reference',
    confidenceNote:
      'The three FGS units fill radial bays 90° apart around the focal plane; overlay wedges follow NASA reference. Not visible externally except as shroud doors.',
    anchor: { t: -0.28, r: 0.85, theta: -75 },
    labelTweak: { dy: -0.2 },
    view: { azimuth: -60, elevation: 6, distance: 7.0 },
    volumes: [
      { kind: 'box', center: { t: -0.25, r: 0.48, theta: 195 }, size: [0.5, 0.55, 0.6] },
      { kind: 'box', center: { t: -0.25, r: 0.48, theta: 285 }, size: [0.5, 0.55, 0.6] },
      { kind: 'box', center: { t: -0.25, r: 0.48, theta: 15 }, size: [0.5, 0.55, 0.6] },
    ],
    purpose:
      'Three refrigerator-sized optical sensors that lock onto guide stars at the edge of Hubble’s field of view and feed the pointing system, keeping the telescope frozen on target during long exposures.',
    how: 'Each FGS uses mirrors, prisms, servos and photomultiplier tubes to track a guide star with interferometric precision. Two sensors guide while science instruments observe; the third can measure star positions as a science instrument in its own right (astrometry).',
    why: 'Hubble’s images are only as sharp as its stillness. The FGS keep deviation below 0.007 arcseconds over long observations — NASA compares it to holding a laser on a human hair one mile away. They also discovered and measured stars’ tiny wobbles from unseen companions.',
    stats: [
      { label: 'Count', value: '3 units, radial bays 90° apart' },
      { label: 'Stability', value: '≤ 0.007 arcsec deviation on target' },
      { label: 'Guide pair', value: '2 sensors guide, 1 free for astrometry' },
      { label: 'Serviced', value: 'Refurbished units swapped in 1997, 1999, 2009' },
    ],
    photo: {
      src: 'assets/images/KSC-08pd2343.jpg',
      caption: 'A refurbished Fine Guidance Sensor being prepared for flight on Servicing Mission 4, 2008.',
      credit: 'NASA/KSC',
    },
  },
  {
    id: 'pointing',
    name: 'Pointing Control System',
    shortName: 'Pointing Control',
    category: 'pointing',
    keyNumber: 'Gyros at 19,200 rpm · 4 reaction wheels',
    confidence: 'approximation',
    confidenceNote:
      'Gyro packages (RSUs) sit near the FGS bays and reaction wheels in the equipment section; overlay positions are simplified — the hardware is distributed and not visible externally.',
    anchor: { t: -0.17, r: 0.95, theta: -150 },
    labelTweak: { dy: 0.3 },
    view: { azimuth: -140, elevation: 22, distance: 7.5 },
    volumes: [
      { kind: 'box', center: { t: -0.42, r: 0.35, theta: 240 }, size: [0.3, 0.42, 0.3] },
      { kind: 'box', center: { t: -0.17, r: 0.6, theta: 165 }, size: [0.42, 0.42, 0.3] },
      { kind: 'box', center: { t: -0.17, r: 0.6, theta: 205 }, size: [0.42, 0.42, 0.3] },
    ],
    purpose:
      'The nervous system that aims a school-bus-sized telescope with no thrusters: gyroscopes sense every tiny rotation, and spinning reaction wheels turn the spacecraft by momentum exchange.',
    how: 'Rate-sensing gyroscopes spinning at 19,200 rpm report how fast Hubble is turning. To slew, four 100-lb reaction wheels about two feet across spin up or down, and the telescope rotates the opposite way — a full 90° turn takes about 15 minutes, minute-hand speed. Magnetic torquer bars push against Earth’s magnetic field to shed excess wheel momentum, while sun sensors, magnetometers and star trackers provide coarse orientation.',
    why: 'Thrusters would jolt the optics and fog them with propellant. Momentum control is gentle and fuel-free — but gyros wear out: all six were replaced in 1999 and again in 2009, and since 2024 Hubble deliberately operates on a single gyro (one other held in reserve) to stretch its life into the 2030s.',
    stats: [
      { label: 'Gyroscopes', value: '6 installed 2009; one-gyro mode since 2024' },
      { label: 'Reaction wheels', value: '4, ~100 lb each, ~2 ft diameter' },
      { label: 'Magnetic torquers', value: '4 eight-foot electromagnet rods' },
      { label: 'Slew rate', value: '~90° in 15 minutes' },
    ],
    photo: {
      src: 'assets/images/sts103-331-013.jpg',
      caption: 'Astronauts Smith and Grunsfeld replacing gyroscope Rate Sensor Units during the 1999 servicing mission.',
      credit: 'NASA/JSC',
    },
  },
  {
    id: 'solar-arrays',
    name: 'Solar Arrays',
    shortName: 'Solar Arrays',
    category: 'power',
    keyNumber: '~5,000 W from two rigid wings',
    confidence: 'visible',
    confidenceNote: 'The third-generation rigid arrays are directly visible on the model.',
    anchor: { t: -0.126, r: 1.42, theta: 0 },
    labelTweak: { dr: 0.15, dy: 0.85 },
    view: { azimuth: 30, elevation: 35, distance: 9.5 },
    volumes: [
      { kind: 'box', center: { t: -0.126, r: 1.42, theta: 0 }, size: [0.24, 2.44, 1.24], boomTilt: 15 },
      { kind: 'box', center: { t: -0.126, r: 1.42, theta: 180 }, size: [0.24, 2.44, 1.24], boomTilt: 15 },
    ],
    purpose:
      'Two wings of gallium-arsenide solar cells — Hubble’s only power source. They convert sunlight into roughly 5,000 watts of electricity to run the observatory and charge its batteries.',
    how: 'Each wing is a rigid 23.3 × 8.6 ft (7.1 × 2.6 m) panel assembly that rotates to face the Sun. These third-generation arrays, installed by astronauts in 2002, borrow panel designs from Iridium communication satellites: a third smaller than the flexible originals yet about 20% more powerful, and far less prone to the thermal flexing that made the first arrays jitter every orbital sunrise.',
    why: 'Every instrument, computer, heater and transmitter runs on this power — Hubble averages about 2,100 watts, roughly five household refrigerators. Smaller wings also cut atmospheric drag, slowing the decay of Hubble’s orbit.',
    stats: [
      { label: 'Wings', value: '2 rigid panels, 23.3 × 8.6 ft (7.1 × 2.6 m) each' },
      { label: 'Cells', value: 'Gallium arsenide, ~5,000 W total' },
      { label: 'Generation', value: '3rd set — SM3B, March 2002' },
      { label: 'Average load', value: '~2,100 W spacecraft demand' },
    ],
    photo: {
      src: 'assets/images/KSC-01pp1636.jpg',
      caption: 'The rigid third-generation solar arrays in processing before the STS-109 servicing mission, 2001.',
      credit: 'NASA/KSC',
    },
  },
  {
    id: 'power',
    name: 'Batteries & Power System',
    shortName: 'Batteries',
    category: 'power',
    keyNumber: 'Six NiH₂ batteries bridge every orbital night',
    confidence: 'approximation',
    confidenceNote:
      'The batteries live in equipment-section bays behind closed doors; the overlay marks the bay ring, with module positions simplified.',
    anchor: { t: -0.17, r: 0.95, theta: 60 },
    labelTweak: { dy: 0.35, dtheta: 10 },
    view: { azimuth: 70, elevation: 18, distance: 7.0 },
    volumes: [
      { kind: 'box', center: { t: -0.17, r: 0.66, theta: 55 }, size: [0.48, 0.44, 0.34] },
      { kind: 'box', center: { t: -0.17, r: 0.66, theta: 95 }, size: [0.48, 0.44, 0.34] },
    ],
    purpose:
      'Six nickel-hydrogen batteries that store solar power and carry the observatory through the roughly 36 minutes of darkness in every 95-minute orbit.',
    how: 'The batteries sit in two modules in the Support Systems Module equipment section — the ring of bays circling the telescope’s waist. Together they hold about 528 amp-hours, comparable to 22 car batteries. On the day side the arrays recharge them; a Power Control Unit conditions and routes electricity around the spacecraft. Charge-control kits added in 1999 prevent overcharging as the batteries age.',
    why: 'Without storage Hubble would black out every orbit. The original batteries lasted an extraordinary 19 years before astronauts installed the current set in 2009 — sized to keep the telescope powered for hours even in a worst-case Sun-pointing outage.',
    stats: [
      { label: 'Type', value: '6 nickel-hydrogen (NiH₂), 22 cells each' },
      { label: 'Capacity', value: '~88 Ah each · 528 Ah total' },
      { label: 'Replaced', value: '2009 (SM4) after 19 years of service' },
      { label: 'Location', value: 'SSM equipment section bays 2 & 3' },
    ],
    photo: {
      src: 'assets/images/s125e010049.jpg',
      caption: 'Astronaut Andrew Feustel installs a battery group replacement during the final servicing spacewalk, 2009.',
      credit: 'NASA/JSC',
    },
  },
  {
    id: 'comms',
    name: 'Communications Antennas',
    shortName: 'Antennas',
    category: 'comms',
    keyNumber: '2 high-gain dishes · ~18 GB of science weekly',
    confidence: 'visible',
    confidenceNote:
      'The two high-gain antenna dishes and booms are directly visible on the model; low-gain antennas and data rates follow NASA reference.',
    anchor: { t: -0.05, r: 1.85, theta: 197 },
    labelTweak: { dy: 0.55 },
    view: { azimuth: 225, elevation: 20, distance: 8.5 },
    volumes: [
      { kind: 'box', center: { t: -0.05, r: 1.8, theta: 197 }, size: [0.65, 0.65, 0.65] },
      { kind: 'box', center: { t: -0.02, r: 1.05, theta: 75 }, size: [0.5, 0.5, 0.5] },
    ],
    purpose:
      'Hubble’s link to Earth: two dish-shaped high-gain antennas on booms for high-rate science downlink, plus low-gain spiral-cone antennas for commands and emergencies.',
    how: 'Hubble rarely talks straight to the ground. Its antennas point at NASA’s Tracking and Data Relay Satellites (TDRS) 22,300 miles up, which bounce the signal to the White Sands complex in New Mexico. Science data flows at about 1 megabit per second from the recorders; the steerable high-gain dishes track the relay satellites while the telescope holds its science pointing.',
    why: 'Every Hubble image you have ever seen took this path. The observatory returns on average about 18 gigabytes of science data a week — more than 3 DVDs’ worth every day travels from orbit to the archive.',
    stats: [
      { label: 'High-gain antennas', value: '2 steerable parabolic dishes on booms' },
      { label: 'Low-gain antennas', value: '2 omnidirectional spiral cones' },
      { label: 'Relay', value: 'TDRS constellation → White Sands, NM' },
      { label: 'Science downlink', value: '~1 Mbps · ~18 GB per week' },
    ],
    photo: {
      src: 'assets/images/s31-03-002.jpg',
      caption: 'A high-gain antenna swings out from Hubble’s hull during deployment from Discovery, April 1990.',
      credit: 'NASA/JSC',
    },
  },
  {
    id: 'cdh',
    name: 'Computers & Data Handling',
    shortName: 'Flight Computer',
    category: 'data',
    keyNumber: 'Intel 486 brain · 12-Gbit solid-state recorder',
    confidence: 'approximation',
    confidenceNote:
      'The computer, data formatter and recorders occupy equipment-section bays; the overlay marks the bay ring with positions simplified.',
    anchor: { t: -0.17, r: 0.95, theta: -60 },
    labelTweak: { dy: 0.35, dtheta: -10 },
    view: { azimuth: -55, elevation: 18, distance: 7.0 },
    volumes: [
      { kind: 'box', center: { t: -0.17, r: 0.66, theta: 300 }, size: [0.48, 0.44, 0.34] },
      { kind: 'box', center: { t: -0.17, r: 0.66, theta: 340 }, size: [0.48, 0.44, 0.34] },
    ],
    purpose:
      'The Advanced Computer flies the spacecraft — pointing, power management, safemodes — while a separate Science Instrument Command & Data Handling unit orchestrates the instruments and packages their data.',
    how: 'The Advanced Computer, installed by astronauts in 1999, runs three Intel 80486 processor boards: 20× faster with 6× the memory of the 1970s-era DF-224 it replaced. Commands arrive from the ground; observations execute automatically from a stored weekly schedule. Science data is formatted by the SI C&DH, buffered on a 12-gigabit solid-state recorder (which replaced a reel-to-reel tape machine), then downlinked through the antennas.',
    why: 'Hubble is essentially a robot that receives its to-do list by radio. When the SI C&DH failed in 2008 the observatory switched to its redundant side and astronauts installed a spare in 2009 — computing redundancy is why a 1990 spacecraft still takes orders today.',
    stats: [
      { label: 'Flight computer', value: 'Intel 80486 “Advanced Computer”, installed 1999' },
      { label: 'vs. DF-224', value: '20× faster, 6× more memory' },
      { label: 'Recorder', value: 'Solid-state, 12 Gbit (replaced 1.2-Gbit tape)' },
      { label: 'Science data unit', value: 'SI C&DH — spare installed 2009' },
    ],
    photo: {
      src: 'assets/images/hst_cutaway_diagram.jpg',
      caption: 'NASA/STScI cutaway of Hubble showing instrument bays and support systems around the equipment section.',
      credit: 'NASA/STScI',
    },
  },
  {
    id: 'thermal',
    name: 'Thermal Protection',
    shortName: 'Thermal Blankets',
    category: 'thermal',
    keyNumber: '±hundreds of °F swing tamed every 95 minutes',
    confidence: 'visible',
    confidenceNote:
      'The reflective blankets and foil skin are directly visible as the model’s surface; layer details follow NASA servicing-mission documentation.',
    anchor: { t: 0.22, r: 0.76, theta: 150 },
    labelTweak: { dy: 0.5, dtheta: 20 },
    view: { azimuth: 150, elevation: 24, distance: 8.0 },
    volumes: [{ kind: 'cylinder', center: { t: -0.02, r: 0, theta: 0 }, radius: 0.8, length: 0.64 }],
    purpose:
      'Hubble’s shiny skin: multilayer insulation blankets and reflective coverings that hold the telescope’s temperature steady while the outside swings from searing sun to deep-space cold every orbit.',
    how: 'Most of the hull is wrapped in multilayer insulation — stacked aluminized films that block radiant heat — under an outer skin of silvered flexible reflector material. Where the original blankets cracked after years of ultraviolet exposure, spacewalkers added stainless-steel New Outer Blanket Layer panels over the equipment bay doors and aluminized-Teflon patches on the sunward side. Electric heaters inside keep sensitive components in their comfort zone.',
    why: 'Optics move when temperatures move. Keeping the structure thermally calm is what lets a mirror aligned to millionths of an inch stay aligned from orbital day to orbital night, decade after decade.',
    stats: [
      { label: 'Primary insulation', value: 'Multilayer aluminized-film blankets (MLI)' },
      { label: 'Repairs', value: 'NOBL steel panels + aluminized-Teflon patches (1999–2002)' },
      { label: 'Assist', value: 'Thermostat-controlled electric heaters' },
      { label: 'Orbit cycle', value: 'Sunlight to shadow every ~95 minutes' },
    ],
    photo: {
      src: 'assets/images/s31-10-035.jpg',
      caption: 'Hubble’s foil-wrapped hull during deployment from Discovery in 1990, original roll-out array unfurling.',
      credit: 'NASA/JSC',
    },
  },
];

export const SUBSYSTEM_BY_ID: ReadonlyMap<string, Subsystem> = new Map(
  SUBSYSTEMS.map((s) => [s.id, s]),
);
