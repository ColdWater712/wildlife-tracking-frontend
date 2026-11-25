type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Synthesizes a 1.2s cold-water splash + 5 water-droplet plops using Web Audio API
 * with zero external audio assets.
 */
export function playWaterSplashSound(): void {
  if (typeof window === "undefined") return;

  try {
    const win = window as AudioWindow;
    const AudioCtx = window.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // 1. Filtered white-noise splash impact (bandpass sweeping 2200Hz -> 380Hz)
    const sampleRate = ctx.sampleRate;
    const duration = 1.15;
    const frameCount = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      const env = Math.pow(1 - i / frameCount, 1.4);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.1, now);
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.85);

    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(0.01, now);
    splashGain.gain.linearRampToValueAtTime(0.28, now + 0.04);
    splashGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(splashGain);
    splashGain.connect(ctx.destination);
    noise.start(now);

    // 2. Staggered water-droplet plops (700-1500Hz)
    const dropletOffsets = [0.18, 0.34, 0.52, 0.74, 0.96];
    dropletOffsets.forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const baseFreq = 780 + idx * 140;

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + offset + 0.07);

      dropGain.gain.setValueAtTime(0.001, now + offset);
      dropGain.gain.linearRampToValueAtTime(0.065, now + offset + 0.015);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.11);

      osc.connect(dropGain);
      dropGain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });

    window.setTimeout(() => {
      void ctx.close().catch(() => undefined);
    }, 1600);
  } catch {
    // Abaikan jika browser memblokir AudioContext.
  }
}
