export class PolyphonicSynth {
  constructor(maxVoices = 8) { this.ctx = null; this.maxVoices = maxVoices; this.voices = new Map(); }
  async ready() {
    if (!this.ctx) this.ctx = new window.AudioContext();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }
  noteOn(midi, frequency = 440 * 2 ** ((midi - 69) / 12)) {
    if (!this.ctx || this.voices.has(midi)) return;
    if (this.voices.size >= this.maxVoices) this.noteOff(this.voices.keys().next().value);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.1);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now);
    this.voices.set(midi, { osc, gain });
  }
  noteOff(midi) {
    const voice = this.voices.get(midi);
    if (!voice || !this.ctx) return;
    this.voices.delete(midi);
    const now = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    voice.osc.stop(now + 0.05);
    voice.osc.onended = () => { voice.osc.disconnect(); voice.gain.disconnect(); };
  }
  stopAll() { for (const midi of [...this.voices.keys()]) this.noteOff(midi); }
  async close() { this.stopAll(); if (this.ctx && this.ctx.state !== 'closed') await this.ctx.close(); this.ctx = null; }
}
export const midiToFrequency = midi => 440 * 2 ** ((midi - 69) / 12);
