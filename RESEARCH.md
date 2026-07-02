# Research Notes

Facts in the exhibit were compiled from NASA sources on **2026-07-02**. This file
lists the sources, the key facts taken from each, and honesty notes about which
spatial placements are exact versus approximate.

## Primary sources

1. **NASA Science — Hubble Observatory Design (index)**
   https://science.nasa.gov/mission/hubble/observatory/design/
   - Dimensions: 43.5 ft (13.2 m) long, 14 ft (4.2 m) diameter at the back; ~27,000 lb (12,246 kg)
   - Primary mirror 94.5 in (2.4 m); polish smoothness analogy (≤6 in bump if scaled to Earth's diameter)
   - 0.05 arcsecond angular resolution
   - Graphite-epoxy frame under an aluminum shell with multilayer insulation
   - Four ~100 lb reaction wheels; six gyroscopes (operating on one with reserves); three Fine Guidance Sensors
   - Two solar arrays; six batteries

2. **NASA Science — Hubble Optics**
   https://science.nasa.gov/mission/hubble/observatory/design/optics/
   - Ritchey–Chrétien Cassegrain, hyperbolic mirrors
   - Primary: 2.4 m, 1,825 lb (828 kg), Corning Ultra-Low Expansion glass, honeycomb core (weight reduced from ~8,000 lb)
   - Secondary: 12 in / 12.2 in (0.3 m), mounted ~4.9 m ahead of the primary
   - Coatings: aluminum ≈3/1,000,000 in (~0.076–0.1 µm) + magnesium fluoride protective layer
   - Collects 40,000× more light than the human eye; graphite-epoxy metering truss

3. **NASA Science — Hubble Instruments**
   https://science.nasa.gov/mission/hubble/observatory/design/instruments/
   - Operational: ACS (2002), WFC3 (2009), COS (2009), STIS (1997), 3× FGS
   - NICMOS inactive/hibernating (superseded by WFC3's IR channel)
   - Retired/removed: WF/PC, WFPC2, Faint Object Camera, Faint Object Spectrograph, GHRS, High Speed Photometer (removed for COSTAR)

4. **NASA Science — Hubble Pointing Control**
   https://science.nasa.gov/mission/hubble/observatory/design/pointing-control/
   - Gyros spin at 19,200 rpm; all six replaced in 2009
   - FGS hold pointing with ≤0.007 arcsec deviation ("laser on a human hair one mile away")
   - Four reaction wheels ~2 ft diameter; 90° slew takes ~15 minutes ("minute-hand speed")
   - Four 8-ft magnetic torquer rods at 90° spacing; Fixed Head Star Trackers ~60 arcsec; coarse sun sensors
   - Sun keep-out: telescope stays ≥50° from the Sun; aperture door protects optics

5. **NASA Science — Hubble Electrical Power**
   https://science.nasa.gov/mission/hubble/observatory/design/electrical-power/
   - Current (3rd-gen, SM3B 2002) arrays: two rigid gallium-arsenide wings, 23.3 × 8.6 ft (7.1 × 2.6 m) each, ~5,000 W total; derived from Iridium satellite panels; one-third smaller than previous arrays yet ~20% more power
   - Six nickel-hydrogen batteries, 22 cells each, ~88 Ah each (528 Ah total), replaced in 2009 after 19 years
   - Average spacecraft load ~2,100 W ("about five refrigerators"); replacement Power Control Unit installed 2002

6. **NASA Science — Hubble Communications**
   https://science.nasa.gov/mission/hubble/observatory/design/design-communications/
   - Two steerable high-gain dish antennas; low-gain spiral-cone antennas for commands/emergencies
   - Relay via TDRS satellites (~22,300 mi) to White Sands Complex, NM
   - Science downlink ~1 Mbps (S-band single-access); ~18 GB of science data per week ("more than 3 DVDs per day")
   - Five emergency ground stations (Santiago, Canberra, White Sands, Hawaii, Wallops)

7. **NASA GSFC — Servicing Mission 3A fact sheets**
   https://asd.gsfc.nasa.gov/archive/sm3a/sm3a_fact_sheets.html
   - Advanced Computer: Intel 80486-based, 20× faster and 6× more memory than the DF-224 it replaced; 70.5 lb
   - Solid State Recorder: 12 Gbit vs 1.2 Gbit tape recorder it replaced
   - Rate Sensor Units (gyro pairs) — all six gyros replaced during SM3A
   - Battery Voltage/Temperature Improvement Kits (prevent overcharging)
   - Thermal repairs: New Outer Blanket Layer (stainless steel panels on equipment bay doors), Shell/Shield Replacement Fabric (aluminized Teflon)

8. **NASA Science — About Hubble (quick facts)**
   https://science.nasa.gov/mission/hubble/overview/about-hubble/
   - Orbit: ~300 mi (483 km) altitude (as published 2026 — decaying slowly over time), 28.5° inclination, ~95 min period, ~17,000 mph
   - Launch April 24, 1990 (STS-31 Discovery); five servicing missions 1993–2009
   - >1.7 million observations; >23,000 peer-reviewed papers
   - Length 43.5 ft (13.2 m); diameter 14 ft (4.3 m); secondary mirror 12.2 in (0.3 m)

9. **NASA Science — One-gyro operations**
   https://science.nasa.gov/mission/hubble/observatory/design/hubble-one-gyro-mode/
   (located via NASA search; corroborated by the design index page)
   - Since 2024 Hubble operates on a single gyroscope with another held in reserve to extend mission life

10. **NASA/STScI — "Hubble's Instruments Including Control and Support Systems (Cutaway)"**
    https://science.nasa.gov/asset/hubble/hubbles-instruments-including-control-and-support-systems-cutaway/
    - Visual reference used to place interior overlay volumes: aperture door & light shield forward; secondary mirror on truss; primary mirror aft of mid-body; SSM equipment-section bay ring at the "waist"; axial instruments + radial WFC3/FGS in the aft shroud

11. **NASA Image and Video Library** — https://images.nasa.gov/ — photograph
    captions used to verify photo content (see ASSETS.md).

Additional context confirmed against: NASA history/STS-31 pages
(https://www.nasa.gov/mission/sts-31/) for the launch date and deployment;
mirror-coating thicknesses cross-checked with the MSFC photo caption for
image 8108126 (0.1 µm aluminum / 0.025 µm MgF₂).

## Accuracy & placement notes (exact vs approximate)

The model is NASA's official GLB but is a single textured object without
engineering-level part breakdown. Placement confidence is labeled in-app on
every subsystem panel:

| Subsystem | Placement basis | Note |
|---|---|---|
| Aperture Door | **Directly visible** on the model (open, forward end) | — |
| Solar Arrays | **Directly visible** | Wing highlight volumes hand-fitted to the model's panels |
| Communications Antennas | **Visible** (dish + boom on the model) | Second HGA volume is approximate — its stowed pose on the model is hard to pinpoint |
| Thermal Blankets | **Visible** (foil skin) | Layer construction from SM3A fact sheets |
| Optical Telescope Assembly | NASA reference | Truss/secondary drawn as overlay; not present as separate mesh |
| Primary Mirror | NASA reference | Overlay disk at the OTA/aft-shroud junction per cutaway diagram; axial position approximate to ~±0.5 m |
| Axial Instruments (ACS/COS/STIS/NICMOS) | NASA reference | Four bay boxes are schematic; real bays are wedge-shaped |
| WFC3 (radial bay) | NASA reference | Radial-bay azimuth on the model chosen for clarity, not blueprint-exact |
| Fine Guidance Sensors | NASA reference | Three radial wedges at 90° spacing per NASA documentation |
| Pointing Control (gyros, wheels) | **Educational approximation** | Hardware is distributed; boxes are indicative only |
| Batteries & Power | **Educational approximation** | Battery modules live in equipment-section bays 2/3; exact bay azimuth on this model not verifiable |
| Computers & Data Handling | **Educational approximation** | Same equipment-ring caveat |

Other honesty notes:

- The **optics beam overlay** is a simplified schematic of the Ritchey–Chrétien
  light path (real beam geometry includes baffle-limited annular apertures).
  The 57.6 m effective focal length figure is standard NASA/STScI data.
- The **power/data flow lines** communicate topology (wings → batteries → loads;
  instruments → recorder/computer → antenna → TDRS), not physical harness routing.
- Hubble's **orbital altitude decays**; NASA's own pages have cited 340 mi
  (2015), ~320 mi, and ~300 mi (current page). The exhibit says "roughly 300 miles".
- The model's solar wings are noticeably shorter relative to the tube than the
  real SA3 wings (an artistic simplification in the source model); anchors follow
  the model, stats follow NASA figures.
- Mass "about 27,000 lb / 12,200 kg" is the post-SM4 figure; at launch Hubble
  weighed ~24,000 lb.
