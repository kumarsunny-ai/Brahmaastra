/* ─── Web Audio Synthesized SFX Engine ─── */

let ctx: AudioContext | null = null;
let muted = localStorage.getItem("brahmaastra_muted") === "true";

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted() { return muted; }
export function setMuted(v: boolean) {
  muted = v;
  localStorage.setItem("brahmaastra_muted", v ? "true" : "false");
}
export function toggleMute() { setMuted(!muted); return muted; }

/* ─── Low-level helpers ─── */
function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.3, detune = 0) {
  if (muted) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, vol = 0.15) {
  if (muted) return;
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1500;
  filter.Q.value = 0.5;
  src.buffer = buffer;
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
}

/* ─── Game Sound Effects ─── */

/** Hit / Strike — short punchy impact */
export function sfxHit() {
  playTone(220, 0.15, "square", 0.25);
  playTone(440, 0.1, "sawtooth", 0.15);
  playNoise(0.08, 0.2);
}

/** Collect coin / item — bright ascending bling */
export function sfxCollect() {
  playTone(880, 0.1, "sine", 0.2);
  setTimeout(() => playTone(1320, 0.15, "sine", 0.18), 50);
}

/** Power-up collected — triumphant chord */
export function sfxPowerUp() {
  playTone(523, 0.2, "sine", 0.2);
  setTimeout(() => playTone(659, 0.2, "sine", 0.18), 60);
  setTimeout(() => playTone(784, 0.25, "sine", 0.2), 120);
}

/** Miss / Fail — descending buzz */
export function sfxMiss() {
  playTone(300, 0.2, "sawtooth", 0.15);
  setTimeout(() => playTone(200, 0.25, "sawtooth", 0.12), 80);
}

/** Game Over — dramatic descending tone */
export function sfxGameOver() {
  playTone(440, 0.3, "square", 0.2);
  setTimeout(() => playTone(330, 0.3, "square", 0.18), 150);
  setTimeout(() => playTone(220, 0.4, "square", 0.2), 300);
  setTimeout(() => playTone(165, 0.5, "sawtooth", 0.15), 450);
}

/** Level Complete — happy ascending fanfare */
export function sfxLevelComplete() {
  playTone(523, 0.15, "sine", 0.2);
  setTimeout(() => playTone(659, 0.15, "sine", 0.2), 100);
  setTimeout(() => playTone(784, 0.15, "sine", 0.2), 200);
  setTimeout(() => playTone(1047, 0.3, "sine", 0.25), 300);
}

/** Perfect shot — sparkly high pitch */
export function sfxPerfect() {
  playTone(1047, 0.1, "sine", 0.15);
  setTimeout(() => playTone(1319, 0.1, "sine", 0.15), 50);
  setTimeout(() => playTone(1568, 0.15, "sine", 0.2), 100);
  setTimeout(() => playTone(2093, 0.2, "sine", 0.15), 150);
}

/** Marble knock — clacky impact */
export function sfxKnock() {
  playTone(600, 0.08, "triangle", 0.3);
  playTone(1200, 0.05, "sine", 0.15);
  playNoise(0.04, 0.25);
}

/** Serve / Tap — quick tap sound */
export function sfxTap() {
  playTone(660, 0.06, "sine", 0.2);
  playNoise(0.03, 0.1);
}

/** Whoosh — movement / dodge */
export function sfxWhoosh() {
  if (muted) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(400, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.15);
  filter.type = "bandpass";
  filter.frequency.value = 800;
  gain.gain.setValueAtTime(0.1, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.15);
}

/** Start game — energetic ascending */
export function sfxStart() {
  playTone(330, 0.12, "sine", 0.15);
  setTimeout(() => playTone(440, 0.12, "sine", 0.15), 80);
  setTimeout(() => playTone(660, 0.15, "sine", 0.2), 160);
}

/** UI Click */
export function sfxClick() {
  playTone(800, 0.04, "sine", 0.12);
}
