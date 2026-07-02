import type { TourStep } from '../types';

export interface TourCallbacks {
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  onJump: (index: number) => void;
}

export class TourUI {
  private el: HTMLElement;
  private cb: TourCallbacks;
  private total: number;

  constructor(parent: HTMLElement, total: number, cb: TourCallbacks) {
    this.cb = cb;
    this.total = total;
    this.el = document.createElement('div');
    this.el.id = 'tour-bar';
    this.el.setAttribute('role', 'region');
    this.el.setAttribute('aria-label', 'Guided tour');
    parent.appendChild(this.el);
  }

  show(step: TourStep, index: number): void {
    const segments = Array.from({ length: this.total }, (_, i) => {
      const cls = i < index ? 'seg done' : i === index ? 'seg current' : 'seg';
      return `<button class="${cls}" data-i="${i}" aria-label="Go to tour stop ${i + 1}"></button>`;
    }).join('');

    this.el.innerHTML = `
      <div class="tour-inner">
        <div class="tour-progress">${segments}</div>
        <div class="tour-text">
          <div class="tour-kicker">${step.kicker} · Stop ${index + 1} of ${this.total}</div>
          <h2>${step.title}</h2>
          <p>${step.body}</p>
        </div>
        <div class="tour-controls">
          <button class="tour-btn tour-prev" ${index === 0 ? 'disabled' : ''} aria-label="Previous stop">← Back</button>
          <button class="tour-btn tour-next primary" aria-label="Next stop">${index === this.total - 1 ? 'Finish' : 'Next →'}</button>
          <button class="tour-btn tour-exit" aria-label="Exit tour">Exit tour</button>
        </div>
      </div>`;

    this.el.querySelector('.tour-prev')!.addEventListener('click', () => this.cb.onPrev());
    this.el.querySelector('.tour-next')!.addEventListener('click', () => this.cb.onNext());
    this.el.querySelector('.tour-exit')!.addEventListener('click', () => this.cb.onExit());
    this.el.querySelectorAll('.seg').forEach((seg) =>
      seg.addEventListener('click', () => this.cb.onJump(Number((seg as HTMLElement).dataset.i))),
    );
    this.el.classList.add('open');
  }

  hide(): void {
    this.el.classList.remove('open');
  }
}
