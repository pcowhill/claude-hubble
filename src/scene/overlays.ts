import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Subsystem, SubsystemCategory, ViewMode, VolumeSpec } from '../types';
import { ModelFrame } from './frame';

export const CATEGORY_COLOR: Record<SubsystemCategory, number> = {
  optics: 0x6fc8ff,
  science: 0x5fe3ac,
  pointing: 0xffd166,
  power: 0xffa25e,
  comms: 0xaebfff,
  data: 0x7de3e0,
  thermal: 0xff8f7a,
  structure: 0xd9e2ec,
};

/** Subsystems emphasised in each flow overlay mode. */
export const MODE_RELATED: Partial<Record<ViewMode, string[]>> = {
  optics: ['aperture-door', 'ota', 'primary-mirror'],
  power: ['solar-arrays', 'power'],
  data: ['instruments', 'wfc3', 'cdh', 'comms'],
  thermal: ['thermal'],
};

const GHOSTED_MODES: ViewMode[] = ['xray', 'optics', 'power', 'data', 'thermal'];
export function isGhostMode(mode: ViewMode): boolean {
  return GHOSTED_MODES.includes(mode);
}

interface Hotspot {
  sub: Subsystem;
  anchor: THREE.Vector3;
  labelPos: THREE.Vector3;
  marker: THREE.Group;
  ring: THREE.Mesh;
  selRing: THREE.Mesh;
  hit: THREE.Mesh;
  labelObj: CSS2DObject;
  labelEl: HTMLButtonElement;
  leader: THREE.Line;
  leaderMat: THREE.LineBasicMaterial;
  occluded: boolean;
}

interface VolumeVis {
  subId: string;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  fillMat: THREE.MeshBasicMaterial;
  edgeMat: THREE.LineBasicMaterial;
  targetFill: number;
  targetEdge: number;
}

interface FlowPulse {
  sprite: THREE.Sprite;
  curve: THREE.CurvePath<THREE.Vector3>;
  offset: number;
  speed: number;
}

interface FlowSet {
  group: THREE.Group;
  pulses: FlowPulse[];
  labels: CSS2DObject[];
}

function pulseTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export interface OverlayCallbacks {
  onSelect: (id: string) => void;
}

export class OverlayManager {
  readonly root = new THREE.Group();
  private frame: ModelFrame;
  private hotspots: Hotspot[] = [];
  private volumes: VolumeVis[] = [];
  private flows = new Map<ViewMode, FlowSet>();
  private mode: ViewMode = 'callouts';
  private selection: string | null = null;
  private occluder: THREE.Object3D | null = null;
  private raycaster = new THREE.Raycaster();
  private occlusionCursor = 0;
  private occlusionTimer = 0;
  private pulseTex = pulseTexture();
  private callbacks: OverlayCallbacks;

  constructor(frame: ModelFrame, subsystems: Subsystem[], callbacks: OverlayCallbacks) {
    this.frame = frame;
    this.callbacks = callbacks;
    this.root.name = 'overlays';
    for (const [i, sub] of subsystems.entries()) this.buildHotspot(sub, i);
    for (const sub of subsystems) this.buildVolumes(sub);
    this.buildOpticsFlow();
    this.buildPowerFlow();
    this.buildDataFlow();
    this.buildThermalFlow();
    this.applyModeStyles();
  }

  setOccluder(obj: THREE.Object3D | null): void {
    this.occluder = obj;
  }

  /* ------------------------------------------------------------------ */
  /* Hotspots                                                            */
  /* ------------------------------------------------------------------ */

  private buildHotspot(sub: Subsystem, index: number): void {
    const R = this.frame.tubeRadius;
    const color = CATEGORY_COLOR[sub.category];
    const anchor = this.frame.anchorToWorld(sub.anchor);

    const marker = new THREE.Group();
    marker.position.copy(anchor);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 * R, 16, 12),
      new THREE.MeshBasicMaterial({ color }),
    );
    marker.add(dot);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.1 * R, 0.128 * R, 40),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    );
    marker.add(ring);

    const selRing = new THREE.Mesh(
      new THREE.RingGeometry(0.17 * R, 0.185 * R, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 }),
    );
    marker.add(selRing);

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.24 * R, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hit.userData.subId = sub.id;
    marker.add(hit);

    // Label anchored slightly outward from the marker
    const tweak = sub.labelTweak ?? {};
    const outward = this.frame
      .radialDir(sub.anchor.theta + (tweak.dtheta ?? 8))
      .multiplyScalar((0.55 + (tweak.dr ?? 0)) * R);
    outward.y += (0.2 * (sub.anchor.t >= 0 ? 1 : -1) + (tweak.dy ?? 0)) * R;
    const labelPos = anchor.clone().add(outward);

    const el = document.createElement('button');
    el.className = 'hotspot';
    el.type = 'button';
    el.style.setProperty('--hs-color', `#${color.toString(16).padStart(6, '0')}`);
    el.innerHTML = `<span class="hotspot-num">${String(index + 1).padStart(2, '0')}</span><span class="hotspot-name"></span>`;
    (el.querySelector('.hotspot-name') as HTMLElement).textContent = sub.shortName;
    el.setAttribute('aria-label', `Inspect ${sub.name}`);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onSelect(sub.id);
    });
    const labelObj = new CSS2DObject(el);
    labelObj.position.copy(labelPos);

    const leaderMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 });
    const leaderGeo = new THREE.BufferGeometry().setFromPoints([anchor, labelPos]);
    const leader = new THREE.Line(leaderGeo, leaderMat);

    this.root.add(marker, labelObj, leader);
    this.hotspots.push({
      sub,
      anchor,
      labelPos,
      marker,
      ring,
      selRing,
      hit,
      labelObj,
      labelEl: el,
      leader,
      leaderMat,
      occluded: false,
    });
  }

  /* ------------------------------------------------------------------ */
  /* Highlight volumes                                                   */
  /* ------------------------------------------------------------------ */

  private volumeGeometry(spec: VolumeSpec): THREE.BufferGeometry {
    const R = this.frame.tubeRadius;
    const L = this.frame.length;
    switch (spec.kind) {
      case 'cylinder':
        return new THREE.CylinderGeometry(spec.radius * R, spec.radius * R, spec.length * L, 32, 1, false);
      case 'disk':
        return new THREE.CylinderGeometry(spec.radius * R, spec.radius * R, spec.thickness * R, 40);
      case 'box':
        return new THREE.BoxGeometry(spec.size[0] * R, spec.size[1] * R, spec.size[2] * R);
    }
  }

  private buildVolumes(sub: Subsystem): void {
    const color = CATEGORY_COLOR[sub.category];
    for (const spec of sub.volumes) {
      const geo = this.volumeGeometry(spec);
      // depthTest off so selected interior volumes glow through the hull —
      // the exhibit's "cutaway" effect without slicing the mesh.
      const fillMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, fillMat);
      const pos = this.frame.anchorToWorld(spec.center);
      mesh.position.copy(pos);
      if (spec.kind === 'box') {
        // orient +Z of the box radially outward at the spec's azimuth
        const outward = this.frame.radialDir(spec.center.theta);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);
        if (spec.boomTilt) {
          mesh.rotateOnWorldAxis(outward, THREE.MathUtils.degToRad(spec.boomTilt));
        }
      }
      const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthTest: false });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat);
      edges.position.copy(mesh.position);
      edges.quaternion.copy(mesh.quaternion);
      mesh.renderOrder = 5;
      edges.renderOrder = 6;
      this.root.add(mesh, edges);
      this.volumes.push({ subId: sub.id, mesh, edges, fillMat, edgeMat, targetFill: 0, targetEdge: 0 });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Flow overlays                                                       */
  /* ------------------------------------------------------------------ */

  private a(t: number, r: number, theta: number): THREE.Vector3 {
    return this.frame.anchorToWorld({ t, r, theta });
  }

  private makeFlowSet(mode: ViewMode): FlowSet {
    const set: FlowSet = { group: new THREE.Group(), pulses: [], labels: [] };
    set.group.name = `flow-${mode}`;
    set.group.visible = false;
    this.root.add(set.group);
    this.flows.set(mode, set);
    return set;
  }

  private addFlowLabel(set: FlowSet, pos: THREE.Vector3, text: string, color: number): void {
    const el = document.createElement('div');
    el.className = 'flow-chip';
    el.textContent = text;
    el.style.setProperty('--chip-color', `#${color.toString(16).padStart(6, '0')}`);
    const obj = new CSS2DObject(el);
    obj.position.copy(pos);
    set.group.add(obj);
    set.labels.push(obj);
  }

  private addPath(
    set: FlowSet,
    points: THREE.Vector3[],
    color: number,
    opts: { radius?: number; pulses?: number; speed?: number } = {},
  ): void {
    const { radius = 0.028, pulses = 3, speed = 0.16 } = opts;
    const R = this.frame.tubeRadius;
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      path.add(new THREE.LineCurve3(points[i], points[i + 1]));
    }
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(path, Math.max(12, points.length * 10), radius * R, 8, false),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    tube.renderOrder = 7;
    set.group.add(tube);
    for (let i = 0; i < pulses; i++) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.pulseTex,
          color,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      sprite.scale.setScalar(0.16 * R);
      sprite.renderOrder = 8;
      set.group.add(sprite);
      set.pulses.push({ sprite, curve: path, offset: i / pulses, speed });
    }
  }

  private beamMaterial(color: number, opacity: number): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  private buildOpticsFlow(): void {
    const set = this.makeFlowSet('optics');
    const R = this.frame.tubeRadius;
    const L = this.frame.length;
    const color = 0x7fd4ff;

    const yTop = 0.56; // beam entry above the aperture (rim is at t≈0.32)
    const yPrimary = -0.15;
    const ySecondary = 0.26;
    const yFocal = -0.28;

    // Parallel incoming beam
    const incoming = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52 * R, 0.52 * R, (yTop - yPrimary) * L, 32, 1, true),
      this.beamMaterial(color, 0.07),
    );
    incoming.position.copy(this.a((yTop + yPrimary) / 2, 0, 0));
    set.group.add(incoming);

    // Converging cone: primary -> secondary
    const converge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * R, 0.52 * R, (ySecondary - yPrimary) * L, 32, 1, true),
      this.beamMaterial(color, 0.12),
    );
    converge.position.copy(this.a((ySecondary + yPrimary) / 2, 0, 0));
    set.group.add(converge);

    // Relay beam: secondary -> focal plane through the primary's central hole
    const relay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07 * R, 0.02 * R, (ySecondary - yFocal) * L, 24, 1, true),
      this.beamMaterial(color, 0.16),
    );
    relay.position.copy(this.a((ySecondary + yFocal) / 2, 0, 0));
    set.group.add(relay);

    this.addPath(set, [this.a(yTop, 0, 0), this.a(yPrimary, 0, 0)], color, { radius: 0.02, pulses: 2, speed: 0.22 });
    this.addPath(set, [this.a(yPrimary, 0, 0), this.a(ySecondary, 0, 0)], color, { radius: 0.016, pulses: 2, speed: 0.22 });
    this.addPath(set, [this.a(ySecondary, 0, 0), this.a(yFocal, 0, 0)], color, { radius: 0.014, pulses: 2, speed: 0.22 });

    this.addFlowLabel(set, this.a(0.5, 0.72, 75), 'Incoming starlight', color);
    this.addFlowLabel(set, this.a(yPrimary, 0.68, 150), 'Primary mirror (2.4 m)', color);
    this.addFlowLabel(set, this.a(ySecondary, 0.32, -60), 'Secondary mirror (0.3 m)', color);
    this.addFlowLabel(set, this.a(yFocal - 0.06, 0.5, -140), 'Focal plane → instruments', color);
  }

  private buildPowerFlow(): void {
    const set = this.makeFlowSet('power');
    const color = 0xffb066;
    for (const side of [0, 180]) {
      const bayTheta = side === 0 ? 55 : 95;
      this.addPath(
        set,
        [
          this.a(-0.126, 1.9, side),
          this.a(-0.126, 1.05, side),
          this.a(-0.17, 0.85, bayTheta),
        ],
        color,
        { radius: 0.022, pulses: 3, speed: 0.12 },
      );
    }
    // Distribution ring around the equipment section
    const R = this.frame.tubeRadius;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.92 * R, 0.02 * R, 8, 64),
      this.beamMaterial(color, 0.3),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(this.a(-0.17, 0, 0));
    set.group.add(ring);

    this.addFlowLabel(set, this.a(0.04, 1.8, 8), 'Solar wing · ~2.5 kW', color);
    this.addFlowLabel(set, this.a(0.1, 1.85, 172), 'Solar wing · ~2.5 kW', color);
    this.addFlowLabel(set, this.a(-0.26, 1.15, 75), 'NiH₂ battery bays', color);
    this.addFlowLabel(set, this.a(-0.14, 1.15, -130), 'Power distribution ring', color);
  }

  private buildDataFlow(): void {
    const set = this.makeFlowSet('data');
    const color = 0x7de3e0;
    // instruments -> SI C&DH / recorder bay -> HGA -> TDRS beam
    this.addPath(
      set,
      [this.a(-0.36, 0.4, 140), this.a(-0.28, 0.55, 30), this.a(-0.17, 0.72, -55)],
      color,
      { radius: 0.02, pulses: 3, speed: 0.14 },
    );
    this.addPath(
      set,
      [this.a(-0.17, 0.72, -55), this.a(-0.1, 0.8, 260), this.a(-0.05, 1.5, 197)],
      color,
      { radius: 0.02, pulses: 3, speed: 0.14 },
    );
    // Beam from the dish up toward a relay satellite (off-scene)
    const R = this.frame.tubeRadius;
    const dish = this.a(-0.05, 1.6, 197);
    const dir = this.frame.radialDir(197).multiplyScalar(0.8).add(new THREE.Vector3(0, 0.6, 0)).normalize();
    const end = dish.clone().add(dir.clone().multiplyScalar(6.5 * R));
    this.addPath(set, [dish, end], color, { radius: 0.014, pulses: 4, speed: 0.3 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.09 * R, 0.26 * R, 16), this.beamMaterial(color, 0.8));
    cone.position.copy(end);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    set.group.add(cone);

    this.addFlowLabel(set, this.a(-0.4, 0.75, 140), 'Science instruments', color);
    this.addFlowLabel(set, this.a(-0.2, 1.1, -55), 'Computer · recorder', color);
    this.addFlowLabel(set, end.clone().add(new THREE.Vector3(0, 0.3 * R, 0)), 'To TDRS relay → White Sands', color);
  }

  private buildThermalFlow(): void {
    const set = this.makeFlowSet('thermal');
    const R = this.frame.tubeRadius;
    const L = this.frame.length;
    const color = 0xff9a70;
    const skin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82 * R, 0.82 * R, 0.58 * L, 48, 1, true),
      this.beamMaterial(color, 0.05),
    );
    skin.position.copy(this.a(0.03, 0, 0));
    set.group.add(skin);
    const eq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95 * R, 0.95 * R, 0.12 * L, 48, 1, true),
      this.beamMaterial(0xffc9a3, 0.09),
    );
    eq.position.copy(this.a(-0.17, 0, 0));
    set.group.add(eq);

    this.addFlowLabel(set, this.a(0.26, 1.0, 150), 'Multilayer insulation blankets', color);
    this.addFlowLabel(set, this.a(-0.17, 1.12, 210), 'NOBL panels on bay doors', color);
    this.addFlowLabel(set, this.a(-0.44, 0.9, -30), 'Interior heaters hold temperature', color);
  }

  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */

  setViewMode(mode: ViewMode): void {
    this.mode = mode;
    for (const [m, set] of this.flows) set.group.visible = m === mode;
    this.applyModeStyles();
  }

  setSelection(id: string | null): void {
    this.selection = id;
    this.applyModeStyles();
  }

  getHotspotWorldPos(id: string): THREE.Vector3 | null {
    const h = this.hotspots.find((x) => x.sub.id === id);
    return h ? h.anchor.clone() : null;
  }

  pick(ndc: THREE.Vector2, camera: THREE.Camera): string | null {
    this.raycaster.setFromCamera(ndc, camera);
    const hits = this.raycaster.intersectObjects(
      this.hotspots.map((h) => h.hit),
      false,
    );
    if (hits.length > 0) return (hits[0].object.userData.subId as string) ?? null;
    return null;
  }

  private applyModeStyles(): void {
    const related = MODE_RELATED[this.mode] ?? null;
    for (const v of this.volumes) {
      const isSel = v.subId === this.selection;
      if (isSel) {
        v.targetFill = 0.2;
        v.targetEdge = 0.9;
      } else if (this.mode === 'xray') {
        v.targetFill = 0.055;
        v.targetEdge = 0.26;
      } else if (related && related.includes(v.subId)) {
        v.targetFill = 0.1;
        v.targetEdge = 0.42;
      } else {
        v.targetFill = 0;
        v.targetEdge = 0;
      }
    }
    for (const h of this.hotspots) {
      const isSel = h.sub.id === this.selection;
      const full =
        isSel ||
        this.mode === 'callouts' ||
        this.mode === 'xray' ||
        (related !== null && related.includes(h.sub.id));
      h.labelEl.classList.toggle('compact', !full);
      h.labelEl.classList.toggle('active', isSel);
      const dim = related !== null && !related.includes(h.sub.id) && !isSel;
      h.labelEl.classList.toggle('dim', dim);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Per-frame update                                                    */
  /* ------------------------------------------------------------------ */

  update(dt: number, elapsed: number, camera: THREE.Camera): void {
    // Billboard rings & selection pulse
    for (const h of this.hotspots) {
      h.ring.lookAt(camera.position);
      h.selRing.lookAt(camera.position);
      const isSel = h.sub.id === this.selection;
      const target = isSel ? 0.95 : 0;
      const m = h.selRing.material as THREE.MeshBasicMaterial;
      m.opacity += (target - m.opacity) * Math.min(1, dt * 8);
      if (isSel) {
        const s = 1 + Math.sin(elapsed * 2.6) * 0.1;
        h.selRing.scale.setScalar(s);
      }
    }

    // Volume opacity easing
    for (const v of this.volumes) {
      v.fillMat.opacity += (v.targetFill - v.fillMat.opacity) * Math.min(1, dt * 7);
      v.edgeMat.opacity += (v.targetEdge - v.edgeMat.opacity) * Math.min(1, dt * 7);
      const vis = v.fillMat.opacity > 0.004;
      v.mesh.visible = vis;
      v.edges.visible = v.edgeMat.opacity > 0.004;
    }

    // Flow pulses
    const active = this.flows.get(this.mode);
    if (active) {
      for (const p of active.pulses) {
        const t = (elapsed * p.speed + p.offset) % 1;
        p.curve.getPointAt(t, p.sprite.position);
        const fade = Math.sin(t * Math.PI);
        p.sprite.material.opacity = 0.25 + 0.75 * fade;
      }
    }

    // Label occlusion (round-robin, skipped while the hull is ghosted)
    if (!isGhostMode(this.mode) && this.occluder) {
      this.occlusionTimer += dt;
      if (this.occlusionTimer > 0.05 && this.hotspots.length > 0) {
        this.occlusionTimer = 0;
        for (let n = 0; n < 3; n++) {
          const h = this.hotspots[this.occlusionCursor % this.hotspots.length];
          this.occlusionCursor++;
          const camPos = (camera as THREE.PerspectiveCamera).position;
          const dirV = h.anchor.clone().sub(camPos);
          const dist = dirV.length();
          this.raycaster.set(camPos, dirV.normalize());
          this.raycaster.far = dist - 0.25;
          const blocked = this.raycaster.intersectObject(this.occluder, true).length > 0;
          this.raycaster.far = Infinity;
          if (blocked !== h.occluded) {
            h.occluded = blocked;
            h.labelEl.classList.toggle('occluded', blocked);
            h.marker.visible = !blocked;
            h.leader.visible = !blocked;
          }
        }
      }
    } else {
      for (const h of this.hotspots) {
        if (h.occluded) {
          h.occluded = false;
          h.labelEl.classList.remove('occluded');
          h.marker.visible = true;
          h.leader.visible = true;
        }
      }
    }
  }
}
