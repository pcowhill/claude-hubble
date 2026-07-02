import type { LightingPreset, ViewMode } from '../types';

export interface HudCallbacks {
  onStartTour: () => void;
  onViewMode: (mode: ViewMode) => void;
  onLighting: (preset: LightingPreset) => void;
  onAudioToggle: () => void;
  onSources: () => void;
  onHelp: () => void;
}

const VIEW_MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'standard', label: 'Standard', hint: 'Clean model view' },
  { id: 'callouts', label: 'Callouts', hint: 'All subsystem labels' },
  { id: 'xray', label: 'X-Ray', hint: 'Ghost hull + interior volumes' },
  { id: 'optics', label: 'Optics', hint: 'Light path overlay' },
  { id: 'power', label: 'Power', hint: 'Electrical flow overlay' },
  { id: 'data', label: 'Data', hint: 'Command & telemetry overlay' },
  { id: 'thermal', label: 'Thermal', hint: 'Insulation overlay' },
];

const LIGHTING: { id: LightingPreset; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'sunlit', label: 'Sunlit Pass' },
  { id: 'orbitNight', label: 'Orbit Night' },
];

export class Hud {
  private viewButtons = new Map<ViewMode, HTMLButtonElement>();
  private lightButtons = new Map<LightingPreset, HTMLButtonElement>();
  private audioBtn!: HTMLButtonElement;
  private tourBtn!: HTMLButtonElement;
  private modelBadge!: HTMLElement;

  constructor(parent: HTMLElement, cb: HudCallbacks) {
    // ---- Top bar ----
    const top = document.createElement('header');
    top.id = 'topbar';
    top.innerHTML = `
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">HST</div>
        <div class="brand-text">
          <h1>Hubble Systems Cutaway</h1>
          <div class="brand-sub">NASA Hubble Space Telescope · Interactive Exhibit <span class="model-badge" hidden></span></div>
        </div>
      </div>
      <div class="top-actions">
        <button class="btn primary" id="btn-tour">▶ Guided Tour</button>
        <button class="btn" id="btn-audio" aria-pressed="false" title="Toggle ambient audio (M)">Audio Off</button>
        <button class="btn" id="btn-sources" title="Sources & credits">Sources</button>
        <button class="btn" id="btn-help" title="Keyboard shortcuts (H)">?</button>
      </div>`;
    parent.appendChild(top);
    this.tourBtn = top.querySelector('#btn-tour') as HTMLButtonElement;
    this.audioBtn = top.querySelector('#btn-audio') as HTMLButtonElement;
    this.modelBadge = top.querySelector('.model-badge') as HTMLElement;
    this.tourBtn.addEventListener('click', cb.onStartTour);
    this.audioBtn.addEventListener('click', cb.onAudioToggle);
    (top.querySelector('#btn-sources') as HTMLButtonElement).addEventListener('click', cb.onSources);
    (top.querySelector('#btn-help') as HTMLButtonElement).addEventListener('click', cb.onHelp);

    // ---- Left rail: view modes + lighting ----
    const rail = document.createElement('div');
    rail.id = 'rail';
    const viewGroup = document.createElement('div');
    viewGroup.className = 'rail-group';
    viewGroup.innerHTML = `<div class="rail-label">View</div>`;
    for (const vm of VIEW_MODES) {
      const b = document.createElement('button');
      b.className = 'rail-btn';
      b.textContent = vm.label;
      b.title = vm.hint;
      b.addEventListener('click', () => cb.onViewMode(vm.id));
      this.viewButtons.set(vm.id, b);
      viewGroup.appendChild(b);
    }
    const lightGroup = document.createElement('div');
    lightGroup.className = 'rail-group';
    lightGroup.innerHTML = `<div class="rail-label">Lighting</div>`;
    for (const lp of LIGHTING) {
      const b = document.createElement('button');
      b.className = 'rail-btn';
      b.textContent = lp.label;
      b.addEventListener('click', () => cb.onLighting(lp.id));
      this.lightButtons.set(lp.id, b);
      lightGroup.appendChild(b);
    }
    rail.append(viewGroup, lightGroup);
    parent.appendChild(rail);
  }

  setViewMode(mode: ViewMode): void {
    for (const [id, b] of this.viewButtons) b.classList.toggle('active', id === mode);
  }

  setLighting(preset: LightingPreset): void {
    for (const [id, b] of this.lightButtons) b.classList.toggle('active', id === preset);
  }

  setAudio(on: boolean): void {
    this.audioBtn.textContent = on ? 'Audio On' : 'Audio Off';
    this.audioBtn.setAttribute('aria-pressed', String(on));
    this.audioBtn.classList.toggle('active', on);
  }

  setTourActive(active: boolean): void {
    this.tourBtn.textContent = active ? '■ End Tour' : '▶ Guided Tour';
    this.tourBtn.classList.toggle('active', active);
  }

  setModelBadge(status: 'nasa' | 'fallback'): void {
    this.modelBadge.hidden = false;
    if (status === 'fallback') {
      this.modelBadge.textContent = 'Simplified stand-in model';
      this.modelBadge.classList.add('warn');
    } else {
      this.modelBadge.textContent = 'Official NASA 3D model';
    }
  }
}

export function buildHelpOverlay(parent: HTMLElement): HTMLElement {
  const el = document.createElement('div');
  el.id = 'help-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Controls help');
  el.innerHTML = `
    <div class="modal-card small">
      <header><h2>Controls</h2><button class="modal-close" aria-label="Close">✕</button></header>
      <div class="modal-scroll">
        <div class="help-grid">
          <span class="key">Drag</span><span>Orbit the telescope</span>
          <span class="key">Right-drag</span><span>Pan</span>
          <span class="key">Scroll / pinch</span><span>Zoom</span>
          <span class="key">Click marker</span><span>Inspect subsystem</span>
          <span class="key">1 – 9, 0, - , =</span><span>Select subsystem by number</span>
          <span class="key">T</span><span>Start / end guided tour</span>
          <span class="key">← →</span><span>Previous / next tour stop</span>
          <span class="key">V</span><span>Cycle view mode</span>
          <span class="key">L</span><span>Cycle lighting preset</span>
          <span class="key">M</span><span>Toggle audio</span>
          <span class="key">Esc</span><span>Clear selection / exit</span>
        </div>
      </div>
    </div>`;
  el.addEventListener('click', (e) => {
    if (e.target === el) el.classList.remove('open');
  });
  (el.querySelector('.modal-close') as HTMLButtonElement).addEventListener('click', () =>
    el.classList.remove('open'),
  );
  parent.appendChild(el);
  return el;
}
