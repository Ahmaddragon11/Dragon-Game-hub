let audioCtx: AudioContext | null = null;

export function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playSound(type: 'click' | 'correct' | 'wrong' | 'win' | 'lose' | 'flip', enabled: boolean) {
  if (!enabled) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const configs = {
      click:   { freq: 440, dur: 0.06, type: 'sine' as OscillatorType },
      correct: { freq: 660, dur: 0.2,  type: 'sine' as OscillatorType },
      wrong:   { freq: 220, dur: 0.2,  type: 'sawtooth' as OscillatorType },
      win:     { freq: 880, dur: 0.4,  type: 'sine' as OscillatorType },
      lose:    { freq: 180, dur: 0.3,  type: 'sawtooth' as OscillatorType },
      flip:    { freq: 500, dur: 0.08, type: 'sine' as OscillatorType },
    };
    
    const c = configs[type] || configs.click;
    osc.type = c.type;
    osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
    
    if (type === 'win') {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.2);
    }
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + c.dur);
  } catch(e) {
    console.warn('Audio play failed', e);
  }
}
