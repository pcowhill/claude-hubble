/** Controls the loading overlay that index.html renders before JS boots. */
export class LoadingOverlay {
  private el: HTMLElement;
  private bar: HTMLElement;
  private status: HTMLElement;

  constructor() {
    this.el = document.getElementById('loading-overlay')!;
    this.bar = this.el.querySelector('.load-bar-fill') as HTMLElement;
    this.status = this.el.querySelector('.load-status') as HTMLElement;
  }

  setProgress(fraction: number, label?: string): void {
    this.bar.style.width = `${Math.round(fraction * 100)}%`;
    if (label) this.status.textContent = label;
  }

  finish(source: 'nasa' | 'fallback'): void {
    this.setProgress(1, source === 'nasa' ? 'NASA model ready' : 'Simplified model ready');
    this.el.classList.add('done');
    window.setTimeout(() => this.el.remove(), 650);
  }
}
