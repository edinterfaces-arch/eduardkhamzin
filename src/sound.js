let context;
export function clickSound(enabled, pan = 0) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    context.resume().catch(() => {});
    const now = context.currentTime;
    const tone = context.createOscillator();
    const gain = context.createGain();
    const stereo = context.createStereoPanner();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(170, now);
    tone.frequency.exponentialRampToValueAtTime(110, now + 0.04);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    stereo.pan.value = pan;
    tone.connect(gain).connect(stereo).connect(context.destination);
    tone.start(now); tone.stop(now + 0.08);
    tone.onended = () => { tone.disconnect(); gain.disconnect(); stereo.disconnect(); };
  } catch { /* Sound is optional; navigation never depends on audio support. */ }
}
