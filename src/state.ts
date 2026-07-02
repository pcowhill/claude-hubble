import type { LightingPreset, ViewMode } from './types';

export type ModelStatus = 'loading' | 'nasa' | 'fallback';

export interface AppState {
  selection: string | null;
  viewMode: ViewMode;
  lighting: LightingPreset;
  tourActive: boolean;
  tourIndex: number;
  audioOn: boolean;
  modelStatus: ModelStatus;
}

type Listener<T> = (value: T) => void;

/** Minimal typed pub/sub store driving both the 3D scene and the DOM UI. */
export class Store {
  private state: AppState = {
    selection: null,
    viewMode: 'callouts',
    lighting: 'studio',
    tourActive: false,
    tourIndex: 0,
    audioOn: false,
    modelStatus: 'loading',
  };

  private listeners = new Map<keyof AppState | '*', Set<Listener<AppState>>>();

  get<K extends keyof AppState>(key: K): AppState[K] {
    return this.state[key];
  }

  snapshot(): Readonly<AppState> {
    return this.state;
  }

  set<K extends keyof AppState>(key: K, value: AppState[K]): void {
    if (this.state[key] === value) return;
    this.state = { ...this.state, [key]: value };
    this.emit(key);
    this.emit('*');
  }

  patch(partial: Partial<AppState>): void {
    const keys: (keyof AppState)[] = [];
    const next = { ...this.state, ...partial };
    for (const k of Object.keys(partial) as (keyof AppState)[]) {
      if (partial[k] !== undefined && this.state[k] !== partial[k]) keys.push(k);
    }
    if (keys.length === 0) return;
    this.state = next;
    for (const k of keys) this.emit(k);
    this.emit('*');
  }

  on(key: keyof AppState | '*', fn: Listener<AppState>): () => void {
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(fn);
    return () => set.delete(fn);
  }

  private emit(key: keyof AppState | '*'): void {
    this.listeners.get(key)?.forEach((fn) => fn(this.state));
  }
}
