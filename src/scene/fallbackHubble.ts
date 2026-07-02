import * as THREE from 'three';

/**
 * Procedural stand-in model, used ONLY if the NASA glTF fails to load.
 * Proportions follow NASA's published dimensions (13.2 m length, 4.3 m aft
 * diameter, 7.1 x 2.6 m arrays) but this is an explicit simplification and
 * the UI labels it as such. Built in the canonical frame: +Y = aperture.
 */
export function buildFallbackHubble(length = 13.2): THREE.Group {
  const g = new THREE.Group();
  g.name = 'hst-fallback';
  const L = length;
  const half = L / 2;

  const mli = new THREE.MeshStandardMaterial({ color: 0xd9dee4, metalness: 0.85, roughness: 0.34 });
  const mliDark = new THREE.MeshStandardMaterial({ color: 0xaab2bc, metalness: 0.8, roughness: 0.45 });
  const foilGold = new THREE.MeshStandardMaterial({ color: 0xc9a54e, metalness: 0.9, roughness: 0.38 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23272d, metalness: 0.3, roughness: 0.8 });
  const panel = new THREE.MeshStandardMaterial({ color: 0x1c2f45, metalness: 0.55, roughness: 0.35 });
  const white = new THREE.MeshStandardMaterial({ color: 0xe8eaec, metalness: 0.2, roughness: 0.6 });

  const add = (mesh: THREE.Mesh, y: number) => {
    mesh.position.y = y;
    g.add(mesh);
    return mesh;
  };

  // Light shield (forward tube)
  const rShield = 1.55;
  add(new THREE.Mesh(new THREE.CylinderGeometry(rShield, rShield, L * 0.32, 48), mli), half - L * 0.16);
  // Aperture rim + interior
  add(new THREE.Mesh(new THREE.CylinderGeometry(rShield * 1.02, rShield * 1.02, 0.12, 48), mliDark), half - 0.05);
  const interior = new THREE.Mesh(
    new THREE.CylinderGeometry(rShield * 0.94, rShield * 0.94, 0.05, 48),
    dark,
  );
  add(interior, half - 0.15);
  // Aperture door, hinged open ~65 degrees
  const door = new THREE.Mesh(new THREE.CylinderGeometry(rShield * 0.98, rShield * 0.98, 0.07, 48), mli);
  door.geometry.translate(rShield * 0.98, 0, 0); // hinge at edge
  door.position.set(-rShield * 0.98, half, 0);
  door.rotation.z = THREE.MathUtils.degToRad(65);
  g.add(door);

  // Forward shell
  const rFwd = 2.0;
  add(new THREE.Mesh(new THREE.CylinderGeometry(rFwd, rFwd, L * 0.3, 48), mli), half - L * 0.32 - L * 0.15);
  // taper ring between shield and forward shell
  add(new THREE.Mesh(new THREE.CylinderGeometry(rShield, rFwd, L * 0.02, 48), mliDark), half - L * 0.32 - L * 0.01);

  // Equipment section (wider ring with bay doors)
  const rEq = 2.15;
  const eqY = -L * 0.17;
  add(new THREE.Mesh(new THREE.CylinderGeometry(rEq, rEq, L * 0.12, 10), mliDark), eqY);
  // NOBL-style bay door hints
  for (let i = 0; i < 10; i++) {
    const th = (i / 10) * Math.PI * 2;
    const doorPlate = new THREE.Mesh(new THREE.BoxGeometry(1.05, L * 0.1, 0.04), i % 3 === 0 ? white : mli);
    doorPlate.position.set(Math.cos(th) * (rEq + 0.02), eqY, Math.sin(th) * (rEq + 0.02));
    doorPlate.lookAt(0, eqY, 0);
    g.add(doorPlate);
  }

  // Aft shroud
  add(new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, L * 0.26, 48), mli), -half + L * 0.13);
  // Aft bulkhead with gold foil
  add(new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.9, L * 0.03, 48), foilGold), -half + L * 0.015);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32), foilGold), -half + 0.02);

  // Solar arrays: two rigid wings on short masts along +/-X
  const wingGeo = new THREE.BoxGeometry(7.1, 2.6, 0.07);
  const cellLines = new THREE.MeshStandardMaterial({ color: 0x27405e, metalness: 0.6, roughness: 0.3 });
  for (const sgn of [1, -1]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.5, 16), mliDark);
    mast.rotation.z = Math.PI / 2;
    mast.position.set(sgn * (rFwd + 0.75), 0.1, 0);
    g.add(mast);
    const wing = new THREE.Mesh(wingGeo, panel);
    wing.position.set(sgn * (rFwd + 0.75 + 3.55 + 0.1), 0.1, 0);
    wing.rotation.y = sgn > 0 ? 0 : Math.PI;
    g.add(wing);
    // panel divider stripes
    for (let i = 1; i < 4; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.6, 0.09), cellLines);
      stripe.position.set(wing.position.x - 7.1 / 2 + (i * 7.1) / 4, 0.1, 0);
      g.add(stripe);
    }
  }

  // High-gain antennas: booms + dishes along +/-Z
  for (const sgn of [1, -1]) {
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.0, 12), mliDark);
    boom.rotation.x = Math.PI / 2;
    boom.position.set(0, L * 0.16, sgn * (rFwd + 2.0));
    g.add(boom);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), white);
    dish.position.set(0, L * 0.16, sgn * (rFwd + 4.1));
    dish.rotation.x = sgn > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(dish);
  }

  // Handrail hints along the tube (servicing heritage)
  const railMat = new THREE.MeshStandardMaterial({ color: 0xd8b23c, metalness: 0.7, roughness: 0.4 });
  for (let i = 0; i < 4; i++) {
    const th = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, L * 0.22, 8), railMat);
    rail.position.set(Math.cos(th) * (2.1 + 0.06), -half + L * 0.14, Math.sin(th) * (2.1 + 0.06));
    g.add(rail);
  }

  g.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  return g;
}
