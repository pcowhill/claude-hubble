import type { Subsystem } from '../types';
import { CONFIDENCE_LABEL } from '../types';
import { CATEGORY_COLOR } from '../scene/overlays';
import { PHOTO_CREDIT } from '../data/assetManifest';

const CATEGORY_NAME: Record<string, string> = {
  optics: 'Optics',
  science: 'Science payload',
  pointing: 'Pointing & guidance',
  power: 'Electrical power',
  comms: 'Communications',
  data: 'Data systems',
  thermal: 'Thermal control',
  structure: 'Structure',
};

export class InfoPanel {
  private el: HTMLElement;
  private onClose: () => void;

  constructor(parent: HTMLElement, onClose: () => void) {
    this.onClose = onClose;
    this.el = document.createElement('aside');
    this.el.id = 'info-panel';
    this.el.setAttribute('aria-label', 'Subsystem details');
    parent.appendChild(this.el);
  }

  show(sub: Subsystem, index: number): void {
    const color = `#${CATEGORY_COLOR[sub.category].toString(16).padStart(6, '0')}`;
    const conf = CONFIDENCE_LABEL[sub.confidence];
    this.el.innerHTML = `
      <div class="panel-scroll">
        <header class="panel-head">
          <div class="panel-cat" style="--cat-color:${color}">
            <span class="cat-dot"></span>${CATEGORY_NAME[sub.category]}
            <span class="panel-index">${String(index + 1).padStart(2, '0')}</span>
          </div>
          <h2>${sub.name}</h2>
          ${sub.keyNumber ? `<p class="panel-key">${sub.keyNumber}</p>` : ''}
          <button class="panel-close" aria-label="Close details">✕</button>
        </header>
        <div class="confidence conf-${sub.confidence}">
          <span class="conf-badge">${conf}</span>
          <p>${sub.confidenceNote}</p>
        </div>
        <section><h3>What it is</h3><p>${sub.purpose}</p></section>
        <section><h3>How it works</h3><p>${sub.how}</p></section>
        <section><h3>Why it matters</h3><p>${sub.why}</p></section>
        <section class="panel-stats">
          ${sub.stats
            .map(
              (s) => `<div class="stat-row"><span class="stat-label">${s.label}</span><span class="stat-value">${s.value}</span></div>`,
            )
            .join('')}
        </section>
        ${
          sub.photo
            ? `<figure class="panel-photo">
                 <img src="${sub.photo.src}" alt="${sub.photo.caption.replace(/"/g, '&quot;')}" loading="lazy" />
                 <figcaption>${sub.photo.caption} <span class="photo-credit">${sub.photo.credit ?? PHOTO_CREDIT}</span></figcaption>
               </figure>`
            : ''
        }
      </div>`;
    (this.el.querySelector('.panel-close') as HTMLButtonElement).addEventListener('click', () => this.onClose());
    this.el.classList.add('open');
    this.el.querySelector('.panel-scroll')!.scrollTop = 0;
  }

  hide(): void {
    this.el.classList.remove('open');
  }
}
