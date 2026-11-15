import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private idleOsc: OscillatorNode | null = null;
  private idleGain: GainNode | null = null;
  private isRevving: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.idleGain) {
      this.idleGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  startIdleSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || this.idleOsc) return;

      this.idleOsc = this.ctx.createOscillator();
      this.idleGain = this.ctx.createGain();

      this.idleOsc.type = 'sawtooth';
      this.idleOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // Low rumble

      // Add a low-pass filter for deep exhaust rumble
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.idleGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.idleOsc.connect(filter);
      filter.connect(this.idleGain);
      this.idleGain.connect(this.ctx.destination);

      this.idleOsc.start();
    } catch {
      // Audio might be blocked until user gesture
    }
  }

  revEngine(brand: string = 'Ferrari') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Configure based on brand engine profile
      let baseFreq = 85;
      let revFreq = 420;
      if (brand.toLowerCase().includes('lambo') || brand.toLowerCase().includes('pagani')) {
        // Screaming V12
        baseFreq = 110;
        revFreq = 580;
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
      } else if (brand.toLowerCase().includes('bugatti')) {
        // Deep heavy W16 Quad-Turbo
        baseFreq = 70;
        revFreq = 340;
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
      } else {
        // Twin turbo V8 / Boxer
        baseFreq = 85;
        revFreq = 450;
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
      }

      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(revFreq, now + 0.55);
      osc1.frequency.exponentialRampToValueAtTime(revFreq * 0.9, now + 0.85);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq, now + 1.6);

      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
      osc2.frequency.exponentialRampToValueAtTime(revFreq * 1.5, now + 0.55);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 1.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 0.55);
      filter.frequency.exponentialRampToValueAtTime(450, now + 1.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.65);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.7);
      osc2.stop(now + 1.7);
    } catch (e) {
      console.warn('Audio rev synthesis failed:', e);
    }
  }

  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }
}
