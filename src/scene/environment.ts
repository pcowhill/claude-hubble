import * as THREE from 'three';

/**
 * Orbital backdrop: procedural starfield points, a faint NASA Milky Way
 * sphere, and an Earth globe with day/night shader blending.
 */

function starSpriteTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Deterministic PRNG so the sky is stable between visits. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStarfield(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'starfield';
  const rand = mulberry32(19900424); // Hubble launch date as seed

  const makeLayer = (count: number, size: number, radius: number, brightness: number) => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Uniform on sphere
      const u = rand() * 2 - 1;
      const phi = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = radius * s * Math.cos(phi);
      positions[i * 3 + 1] = radius * u;
      positions[i * 3 + 2] = radius * s * Math.sin(phi);
      // Blackbody-ish tint variation
      const warm = rand();
      col.setHSL(warm < 0.12 ? 0.07 : warm > 0.85 ? 0.6 : 0.58, warm < 0.12 ? 0.5 : 0.25, 0.75 + rand() * 0.25);
      const b = brightness * (0.35 + rand() * 0.65);
      colors[i * 3] = col.r * b;
      colors[i * 3 + 1] = col.g * b;
      colors[i * 3 + 2] = col.b * b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size,
      map: starSpriteTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return points;
  };

  group.add(makeLayer(2600, 1.6, 1500, 0.55));
  group.add(makeLayer(900, 2.6, 1500, 0.9));
  group.add(makeLayer(90, 4.0, 1500, 1.0));
  return group;
}

export function createMilkyWay(texUrl: string, loader: THREE.TextureLoader): THREE.Mesh {
  const tex = loader.load(texUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.SphereGeometry(1600, 48, 32);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'milkyway';
  mesh.rotation.z = THREE.MathUtils.degToRad(62); // tilt the galactic band for composition
  mesh.rotation.y = THREE.MathUtils.degToRad(-40);
  mesh.renderOrder = -10;
  return mesh;
}

export interface EarthHandle {
  group: THREE.Group;
  /** Update the sun direction used for the day/night terminator. */
  setSunDir(dir: THREE.Vector3): void;
  tick(dt: number): void;
}

export function createEarth(
  dayUrl: string,
  nightUrl: string,
  loader: THREE.TextureLoader,
): EarthHandle {
  const group = new THREE.Group();
  group.name = 'earth';

  const day = loader.load(dayUrl);
  day.colorSpace = THREE.SRGBColorSpace;
  day.anisotropy = 4;
  const night = loader.load(nightUrl);
  night.colorSpace = THREE.SRGBColorSpace;
  night.anisotropy = 4;

  const uniforms = {
    dayMap: { value: day },
    nightMap: { value: night },
    sunDir: { value: new THREE.Vector3(1, 0.35, 0.4).normalize() },
    atmColor: { value: new THREE.Color(0x5a8fd4) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D dayMap;
      uniform sampler2D nightMap;
      uniform vec3 sunDir;
      uniform vec3 atmColor;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vViewDir;
      void main() {
        float d = dot(normalize(vNormal), normalize(sunDir));
        float dayAmt = smoothstep(-0.12, 0.25, d);
        vec3 dayCol = texture2D(dayMap, vUv).rgb;
        vec3 nightCol = texture2D(nightMap, vUv).rgb;
        vec3 col = mix(nightCol * vec3(1.4, 1.25, 1.0), dayCol, dayAmt);
        // soft terminator warmth
        float term = smoothstep(-0.18, 0.0, d) * (1.0 - smoothstep(0.0, 0.25, d));
        col += vec3(0.35, 0.16, 0.05) * term * 0.6;
        // atmospheric rim
        float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.6);
        col += atmColor * rim * (0.32 + 0.5 * dayAmt);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const radius = 300;
  const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), mat);
  globe.rotation.y = THREE.MathUtils.degToRad(160);
  group.add(globe);

  // Additive atmosphere shell
  const atmMat = new THREE.ShaderMaterial({
    uniforms: { atmColor: { value: new THREE.Color(0x6fa8e8) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 atmColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 3.0);
        gl_FragColor = vec4(atmColor, rim * 0.55);
      }
    `,
  });
  const atm = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.035, 64, 48), atmMat);
  group.add(atm);

  // Positioned so the limb reads as a horizon arc without dominating
  // elevated camera angles (angular radius ~38 deg from the model).
  group.position.set(80, -440, -205);

  let spin = 0;
  return {
    group,
    setSunDir(dir: THREE.Vector3) {
      uniforms.sunDir.value.copy(dir).normalize();
    },
    tick(dt: number) {
      spin += dt * 0.004; // slow, stately rotation
      globe.rotation.y = THREE.MathUtils.degToRad(160) + spin;
    },
  };
}

/** Small additive sun disc so lighting has a visible source (no lens flare). */
export function createSunDisc(): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,252,240,1)');
  g.addColorStop(0.18, 'rgba(255,244,214,0.9)');
  g.addColorStop(0.5, 'rgba(255,228,170,0.25)');
  g.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(140);
  sprite.name = 'sunDisc';
  return sprite;
}
