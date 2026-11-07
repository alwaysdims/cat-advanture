const NOTES = {
  jump: [360,540], double: [520,780,1040], fish: [720,960], coin: [880,1174,1480],
  damage: [180,110,65], checkpoint: [440,554,659,880], complete: [523,659,784,1047],
  gameover: [392,330,262,196], victory: [523,659,784,1047,784,1047,1318],
};
export class AudioManager {
  constructor(muted) { this.muted = muted; this.context = null; }
  unlock() {
    try {
      this.context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    } catch { /* Audio is optional when the browser has no AudioContext. */ }
  }
  play(name) {
    if (this.muted || this.context?.state !== 'running') return;
    const ctx = this.context;
    NOTES[name]?.forEach((hz, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.075;
      osc.type = name === 'damage' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(hz, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.065, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(start); osc.stop(start + 0.15);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }
  destroy() { this.context?.close().catch(() => {}); }
}
