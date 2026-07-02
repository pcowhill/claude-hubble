/**
 * Web Audio ambience and UI tones. There is no suitable open-license Hubble
 * audio in the NASA library, so the ambience is synthesized locally — a soft
 * "operations room" hum. Documented as a procedural asset in ASSETS.md.
 * Everything is OFF by default and only starts after a user gesture.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambience: GainNode | null = null;
  private enabled = false;

  get isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (on) {
      this.ensureContext();
      void this.ctx?.resume();
      this.rampAmbience(0.5, 1.2);
    } else {
      this.rampAmbience(0, 0.4);
    }
  }

  private ensureContext(): void {
    if (this.ctx) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);
    this.buildAmbience(ctx);
  }

  private buildAmbience(ctx: AudioContext): void {
    if (!this.master) return;
    const amb = ctx.createGain();
    amb.gain.value = 0;
    amb.connect(this.master);
    this.ambience = amb;

    // Two low, slightly-detuned drones
    const makeDrone = (freq: number, gain: number, type: OscillatorType) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(amb);
      osc.start();
    };
    makeDrone(55, 0.05, 'sine');
    makeDrone(110.7, 0.025, 'sine');
    makeDrone(164.5, 0.008, 'triangle');

    // Filtered noise "airflow"
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // cheap pink-ish noise
      data[i] = last * 3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    const ng = ctx.createGain();
    ng.gain.value = 0.05;
    noise.connect(lp).connect(ng).connect(amb);
    noise.start();

    // Slow LFO breathing on the filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
  }

  private rampAmbience(to: number, seconds: number): void {
    if (!this.ctx || !this.ambience) return;
    const now = this.ctx.currentTime;
    this.ambience.gain.cancelScheduledValues(now);
    this.ambience.gain.setValueAtTime(this.ambience.gain.value, now);
    this.ambience.gain.linearRampToValueAtTime(to, now + seconds);
  }

  /** Short UI tones; silent unless audio is enabled. */
  tone(kind: 'select' | 'step' | 'toggle' | 'deselect'): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g).connect(this.master);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.06, now + 0.012);

    switch (kind) {
      case 'select':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case 'deselect':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'step':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(700, now + 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      case 'toggle':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(840, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
  }
}
