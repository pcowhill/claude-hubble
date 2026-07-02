let toastEl: HTMLElement | null = null;
let hideTimer = 0;

export function showToast(message: string, ms = 5000): void {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.setAttribute('role', 'status');
    document.getElementById('app')!.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => toastEl?.classList.remove('visible'), ms);
}
