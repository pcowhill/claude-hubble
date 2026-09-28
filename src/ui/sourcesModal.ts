import { ASSET_MANIFEST } from '../data/assetManifest';
import { RESEARCH_SOURCES } from '../data/sources';
import type { ModelStatus } from '../state';

export class SourcesModal {
  private el: HTMLElement;

  constructor(parent: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'sources-modal';
    this.el.setAttribute('role', 'dialog');
    this.el.setAttribute('aria-modal', 'true');
    this.el.setAttribute('aria-label', 'Sources and credits');
    parent.appendChild(this.el);
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });
  }

  show(modelStatus: ModelStatus): void {
    const assets = ASSET_MANIFEST.map(
      (a) => `
      <li>
        <div class="asset-name">${a.name} <span class="asset-role role-${a.role}">${a.role}</span></div>
        <div class="asset-meta">${a.usage}</div>
        <div class="asset-meta"><a href="${a.sourceUrl}" target="_blank" rel="noopener">${a.sourceUrl}</a> · ${a.license}</div>
      </li>`,
    ).join('');

    const sources = RESEARCH_SOURCES.map(
      (s) => `
      <li>
        <a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>
        <div class="asset-meta">${s.usedFor}</div>
      </li>`,
    ).join('');

    this.el.innerHTML = `
      <div class="modal-card">
        <header>
          <h2>Sources &amp; Credits</h2>
          <button class="modal-close" aria-label="Close">✕</button>
        </header>
        <div class="modal-scroll">
          <p class="modal-note">
            3D model, imagery and facts courtesy of NASA (NASA does not endorse this exhibit).
            ${
              modelStatus === 'fallback'
                ? '<strong>Note: the NASA 3D model could not be loaded in this session — a simplified procedural stand-in is displayed.</strong>'
                : 'The displayed spacecraft is NASA’s official Hubble glTF model.'
            }
            Interior highlight volumes are educational overlays, not engineering geometry. The starfield
            points and ambient audio are generated procedurally in the browser (documented in ASSETS.md).
          </p>
          <h3>External assets</h3>
          <ul class="asset-list">${assets}</ul>
          <h3>Research sources</h3>
          <ul class="asset-list">${sources}</ul>
          <h3>Historical photographs</h3>
          <p class="modal-note">All photographs in the subsystem panels are from the
            <a href="https://images.nasa.gov/" target="_blank" rel="noopener">NASA Image and Video Library</a>,
            credited per image (NASA/JSC, NASA/KSC, NASA/MSFC, NASA/STScI). Full list in ASSETS.md.</p>
        </div>
      </div>`;
    (this.el.querySelector('.modal-close') as HTMLButtonElement).addEventListener('click', () => this.hide());
    this.el.classList.add('open');
  }

  hide(): void {
    this.el.classList.remove('open');
  }

  get isOpen(): boolean {
    return this.el.classList.contains('open');
  }
}
