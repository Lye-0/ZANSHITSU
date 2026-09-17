let ctx: AudioContext | undefined;
let ambience: GainNode | undefined;
export async function audioEnabled(enabled: boolean) {
  if (!enabled) {
    if (ambience && ctx) ambience.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    return;
  }
  ctx ??= new AudioContext();
  await ctx.resume();
  if (!ambience) {
    ambience = ctx.createGain();
    ambience.gain.value = 0;
    ambience.connect(ctx.destination);
    for (const f of [49, 50.2, 98.1]) {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      o.type = 'sine';
      o.connect(ambience);
      o.start();
    }
  }
  ambience.gain.setTargetAtTime(0.011, ctx.currentTime, 0.4);
}
export function sound(kind: 'tap' | 'turn' | 'open' | 'fail' | 'note', enabled: boolean, note = 0) {
  if (!enabled || !ctx) return;
  const c = ctx;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;
  const f =
    kind === 'note'
      ? [261.63, 293.66, 329.63, 392, 440][note % 5]
      : kind === 'open'
        ? 196
        : kind === 'turn'
          ? 62
          : kind === 'fail'
            ? 73
            : 420;
  o.type = kind === 'note' ? 'sine' : 'triangle';
  o.frequency.setValueAtTime(f, now);
  if (kind !== 'note') o.frequency.exponentialRampToValueAtTime(f * 0.45, now + 0.15);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(kind === 'note' ? 0.075 : 0.035, now + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'note' ? 0.8 : 0.28));
  o.start();
  o.stop(now + 1);
}
