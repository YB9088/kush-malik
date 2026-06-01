// Tiny WebAudio sound engine — no asset files needed. Respects a mute setting.
let ctx = null;
let muted = false;

try { muted = JSON.parse(localStorage.getItem('km_muted')) || false; } catch {}

export const isMuted = () => muted;
export const toggleMute = () => {
  muted = !muted;
  try { localStorage.setItem('km_muted', JSON.stringify(muted)); } catch {}
  return muted;
};

const ac = () => {
  if (muted) return null;
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const tone = (freq, dur = 0.12, type = 'sine', gain = 0.18, when = 0) => {
  const c = ac(); if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t + dur);
};

export const sfx = {
  tap:    () => tone(420, 0.07, 'triangle', 0.12),
  pop:    () => tone(660, 0.09, 'sine', 0.16),
  coin:   () => { tone(880, 0.08, 'square', 0.1); tone(1320, 0.12, 'square', 0.1, 0.07); },
  win:    () => { [523,659,784,1047].forEach((f,i)=>tone(f,0.16,'sine',0.16,i*0.1)); },
  lose:   () => { tone(300,0.2,'sawtooth',0.14); tone(200,0.3,'sawtooth',0.14,0.12); },
  correct:() => { tone(660,0.1,'sine',0.16); tone(990,0.14,'sine',0.16,0.08); },
  wrong:  () => tone(160,0.25,'sawtooth',0.14),
  swipe:  () => tone(520,0.06,'triangle',0.08),
  reward: () => { [523,659,784,1047,1319].forEach((f,i)=>tone(f,0.14,'triangle',0.14,i*0.07)); },
};
