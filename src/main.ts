import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './styles.css';

import { Store } from './state';
import type { LightingPreset, ViewMode } from './types';
import { SUBSYSTEMS, SUBSYSTEM_BY_ID } from './data/subsystems';
import { TOUR_STEPS } from './data/tour';
import { MODEL_CALIBRATION } from './data/assetManifest';

import { SceneManager } from './scene/SceneManager';
import { ModelFrame } from './scene/frame';
import { createStarfield, createMilkyWay, createEarth, createSunDisc } from './scene/environment';
import { LightingRig } from './scene/lighting';
import { loadHubbleModel } from './scene/modelLoader';
import { OverlayManager, isGhostMode } from './scene/overlays';
import { CameraRig } from './scene/cameraRig';
import { AudioEngine } from './audio/audioEngine';

import { LoadingOverlay } from './ui/loadingOverlay';
import { InfoPanel } from './ui/infoPanel';
import { TourUI } from './ui/tourUI';
import { SourcesModal } from './ui/sourcesModal';
import { Hud, buildHelpOverlay } from './ui/hud';
import { showToast } from './ui/toast';

const VIEW_MODE_ORDER: ViewMode[] = ['standard', 'callouts', 'xray', 'optics', 'power', 'data', 'thermal'];
const LIGHTING_ORDER: LightingPreset[] = ['studio', 'sunlit', 'orbitNight'];
const HOME_VIEW = { azimuth: 38, elevation: 16, distance: 13.5 };

async function boot(): Promise<void> {
  const app = document.getElementById('app')!;
  const host = document.getElementById('scene-host')!;
  const debug = new URLSearchParams(location.search).has('debug');

  const store = new Store();
  const loading = new LoadingOverlay();
  const sm = new SceneManager(host);
  const audio = new AudioEngine();

  // ---- Environment -------------------------------------------------
  sm.scene.background = new THREE.Color(0x020408);
  sm.scene.add(createStarfield());
  const texLoader = new THREE.TextureLoader();
  sm.scene.add(createMilkyWay('assets/textures/starmap_celestial_1024.jpg', texLoader));
  const earth = createEarth('assets/textures/earth_day.jpg', 'assets/textures/earth_night.jpg', texLoader);
  sm.scene.add(earth.group);
  const sunDisc = createSunDisc();
  sm.scene.add(sunDisc);

  const lighting = new LightingRig(sm.scene, sm.renderer);
  lighting.attachSunDisc(sunDisc);
  lighting.onSunDirection((dir) => earth.setSunDir(dir));

  const pmrem = new THREE.PMREMGenerator(sm.renderer);
  sm.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  sm.scene.environmentIntensity = 0.35;

  // ---- Model -------------------------------------------------------
  loading.setProgress(0.02, 'Loading NASA 3D model…');
  const model = await loadHubbleModel((f) => loading.setProgress(0.02 + f * 0.9));
  sm.scene.add(model.group);
  store.set('modelStatus', model.source);

  const frame = new ModelFrame(
    MODEL_CALIBRATION.targetLength,
    MODEL_CALIBRATION.tubeRadius,
  );

  // ---- Overlays & camera -------------------------------------------
  const overlays = new OverlayManager(frame, SUBSYSTEMS, {
    onSelect: (id) => selectSubsystem(id, true),
  });
  sm.scene.add(overlays.root);
  overlays.setOccluder(model.group);

  const rig = new CameraRig(sm.camera, sm.controls, sm.renderer.domElement);
  const modelCenter = new THREE.Vector3(0, 0.15, 0);

  function goHome(duration = 1.6): void {
    const pos = frame.viewToCamera(HOME_VIEW, modelCenter);
    rig.flyTo(pos, modelCenter.clone(), duration);
  }

  function focusSubsystem(id: string): void {
    const sub = SUBSYSTEM_BY_ID.get(id);
    if (!sub) return;
    const anchor = frame.anchorToWorld(sub.anchor);
    const target = anchor.clone().lerp(modelCenter, 0.3);
    const pos = frame.viewToCamera(sub.view, target);
    rig.flyTo(pos, target, 1.5);
  }

  // ---- UI ----------------------------------------------------------
  const infoPanel = new InfoPanel(app, () => selectSubsystem(null, true));
  const sourcesModal = new SourcesModal(app);
  const helpOverlay = buildHelpOverlay(app);

  const hud = new Hud(app, {
    onStartTour: () => (store.get('tourActive') ? exitTour() : startTour()),
    onViewMode: (mode) => {
      store.set('viewMode', mode);
      audio.tone('toggle');
    },
    onLighting: (preset) => {
      store.set('lighting', preset);
      audio.tone('toggle');
    },
    onAudioToggle: () => store.set('audioOn', !store.get('audioOn')),
    onSources: () => sourcesModal.show(store.get('modelStatus')),
    onHelp: () => helpOverlay.classList.add('open'),
  });

  const tourUI = new TourUI(app, TOUR_STEPS.length, {
    onNext: () => tourStep(1),
    onPrev: () => tourStep(-1),
    onExit: () => exitTour(),
    onJump: (i) => applyTourStep(i),
  });

  hud.setModelBadge(model.source);
  if (model.source === 'fallback') {
    showToast('The NASA 3D model could not be loaded — showing a simplified stand-in. See Sources for details.', 8000);
  }

  // ---- Selection ---------------------------------------------------
  function selectSubsystem(id: string | null, userInitiated: boolean): void {
    if (userInitiated && store.get('tourActive')) exitTour(false);
    if (userInitiated) audio.tone(id ? 'select' : 'deselect');
    store.set('selection', id);
  }

  store.on('selection', (s) => {
    overlays.setSelection(s.selection);
    const inTour = s.tourActive;
    if (s.selection && !inTour) {
      const sub = SUBSYSTEM_BY_ID.get(s.selection)!;
      infoPanel.show(sub, SUBSYSTEMS.indexOf(sub));
      document.body.classList.add('panel-open');
      focusSubsystem(s.selection);
    } else if (!s.selection) {
      infoPanel.hide();
      document.body.classList.remove('panel-open');
    }
  });

  store.on('viewMode', (s) => {
    hud.setViewMode(s.viewMode);
    overlays.setViewMode(s.viewMode);
    model.setGhost(isGhostMode(s.viewMode));
  });

  store.on('lighting', (s) => {
    hud.setLighting(s.lighting);
    lighting.setPreset(s.lighting);
  });

  store.on('audioOn', (s) => {
    audio.setEnabled(s.audioOn);
    hud.setAudio(s.audioOn);
    if (s.audioOn) audio.tone('toggle');
  });

  // ---- Guided tour -------------------------------------------------
  function startTour(): void {
    store.patch({ tourActive: true, selection: null });
    document.body.classList.add('tour-open');
    hud.setTourActive(true);
    applyTourStep(0);
    audio.tone('step');
  }

  function exitTour(returnHome = true): void {
    if (!store.get('tourActive')) return;
    store.patch({ tourActive: false, selection: null });
    document.body.classList.remove('tour-open');
    hud.setTourActive(false);
    tourUI.hide();
    store.set('viewMode', 'callouts');
    if (returnHome) goHome();
  }

  function tourStep(delta: number): void {
    const i = store.get('tourIndex') + delta;
    if (i < 0) return;
    if (i >= TOUR_STEPS.length) {
      exitTour();
      return;
    }
    applyTourStep(i);
    audio.tone('step');
  }

  function applyTourStep(i: number): void {
    const step = TOUR_STEPS[i];
    store.set('tourIndex', i);
    tourUI.show(step, i);
    store.set('viewMode', step.viewMode ?? 'callouts');
    if (step.lighting) store.set('lighting', step.lighting);
    store.set('selection', step.subsystemId ?? null);

    if (step.view) {
      const target = step.view.anchor ? frame.anchorToWorld(step.view.anchor) : modelCenter.clone();
      rig.flyTo(frame.viewToCamera(step.view, target), target, 1.7);
    } else if (step.subsystemId) {
      focusSubsystem(step.subsystemId);
    } else {
      goHome();
    }
  }

  // ---- Pointer picking ---------------------------------------------
  const downPos = new THREE.Vector2();
  let downTime = 0;
  sm.renderer.domElement.addEventListener('pointerdown', (e) => {
    downPos.set(e.clientX, e.clientY);
    downTime = performance.now();
  });
  sm.renderer.domElement.addEventListener('pointerup', (e) => {
    const dx = e.clientX - downPos.x;
    const dy = e.clientY - downPos.y;
    if (Math.hypot(dx, dy) > 6 || performance.now() - downTime > 450) return;
    const rect = sm.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const picked = overlays.pick(ndc, sm.camera);
    if (picked) {
      selectSubsystem(picked, true);
    } else if (store.get('selection') && !store.get('tourActive')) {
      selectSubsystem(null, true);
    }
  });

  // ---- Keyboard ----------------------------------------------------
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const key = e.key;
    if (key === 'Escape') {
      if (helpOverlay.classList.contains('open')) helpOverlay.classList.remove('open');
      else if (sourcesModal.isOpen) sourcesModal.hide();
      else if (store.get('selection') && !store.get('tourActive')) selectSubsystem(null, true);
      else if (store.get('tourActive')) exitTour();
      return;
    }
    if (key === 'ArrowRight' && store.get('tourActive')) return void tourStep(1);
    if (key === 'ArrowLeft' && store.get('tourActive')) return void tourStep(-1);
    const lower = key.toLowerCase();
    if (lower === 't') return void (store.get('tourActive') ? exitTour() : startTour());
    if (lower === 'm') return void store.set('audioOn', !store.get('audioOn'));
    if (lower === 'h') return void helpOverlay.classList.toggle('open');
    if (lower === 'v') {
      const next = VIEW_MODE_ORDER[(VIEW_MODE_ORDER.indexOf(store.get('viewMode')) + 1) % VIEW_MODE_ORDER.length];
      store.set('viewMode', next);
      return;
    }
    if (lower === 'l') {
      const next = LIGHTING_ORDER[(LIGHTING_ORDER.indexOf(store.get('lighting')) + 1) % LIGHTING_ORDER.length];
      store.set('lighting', next);
      return;
    }
    const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
    const idx = numberKeys.indexOf(key);
    if (idx >= 0 && idx < SUBSYSTEMS.length) selectSubsystem(SUBSYSTEMS[idx].id, true);
  });

  // ---- Debug calibration view ---------------------------------------
  if (debug) {
    sm.scene.add(new THREE.AxesHelper(10));
    const grid = new THREE.GridHelper(30, 30, 0x335577, 0x1a2635);
    grid.position.y = -8;
    sm.scene.add(grid);
    const dbg = new THREE.Group();
    for (const sub of SUBSYSTEMS) {
      const p = frame.anchorToWorld(sub.anchor);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xff40ff, depthTest: false }),
      );
      dot.position.copy(p);
      dot.renderOrder = 99;
      dbg.add(dot);
    }
    sm.scene.add(dbg);
    const box = new THREE.Box3().setFromObject(model.group);
    const size = box.getSize(new THREE.Vector3());
    const boxHelper = new THREE.Box3Helper(box, 0x00ff88);
    sm.scene.add(boxHelper);
    console.log('[debug] model bbox size', size.toArray(), 'min', box.min.toArray(), 'max', box.max.toArray());
    (window as unknown as { __modelNodes: () => unknown }).__modelNodes = () => {
      model.group.updateMatrixWorld(true);
      const out: { name: string; min: number[]; max: number[] }[] = [];
      model.group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const b = new THREE.Box3().setFromObject(o);
          out.push({
            name: o.name || o.parent?.name || '?',
            min: b.min.toArray().map((v) => Math.round(v * 100) / 100),
            max: b.max.toArray().map((v) => Math.round(v * 100) / 100),
          });
        }
      });
      return out;
    };
  }

  // ---- Loop ----------------------------------------------------------
  sm.onTick((dt, elapsed) => {
    rig.tick(dt);
    lighting.tick(dt);
    earth.tick(dt);
    overlays.update(dt, elapsed, sm.camera);
  });

  // Initial state
  goHome(0.001);
  store.set('viewMode', 'callouts');
  store.set('lighting', 'studio');
  hud.setViewMode('callouts');
  hud.setLighting('studio');
  hud.setAudio(false);
  sm.start();
  loading.finish(model.source);

  // Test/debug hooks (used by the verification capture script)
  interface ExhibitApi {
    ready: boolean;
    select: (id: string | null) => void;
    startTour: () => void;
    exitTour: () => void;
    gotoStep: (i: number) => void;
    setViewMode: (m: ViewMode) => void;
    setLighting: (l: LightingPreset) => void;
    modelSource: string;
    camera: () => { pos: number[]; target: number[]; flying: boolean };
  }
  const api: ExhibitApi = {
    ready: false,
    select: (id) => selectSubsystem(id, false),
    startTour,
    exitTour,
    gotoStep: (i) => {
      if (!store.get('tourActive')) startTour();
      applyTourStep(i);
    },
    setViewMode: (m) => store.set('viewMode', m),
    setLighting: (l) => store.set('lighting', l),
    modelSource: model.source,
    camera: () => ({
      pos: sm.camera.position.toArray().map((v) => Math.round(v * 100) / 100),
      target: sm.controls.target.toArray().map((v) => Math.round(v * 100) / 100),
      flying: rig.flying,
    }),
  };
  (window as unknown as { __exhibit: ExhibitApi }).__exhibit = api;
  requestAnimationFrame(() => requestAnimationFrame(() => (api.ready = true)));
}

boot().catch((err) => {
  console.error('[exhibit] fatal boot error', err);
  const status = document.querySelector('.load-status');
  if (status) status.textContent = 'Something went wrong starting the exhibit — please reload.';
});
