/* Sonidos de escena: ciudad, puertas, ping, estallido y campanas. */
import { eng, buf, now, noise, tone, echo } from './engine.js';

let urb = null; // ambiente urbano activo

/* Paisaje urbano repetitivo: tráfico (ruido filtrado con LFO) + despertador */
function playUrbanSample() {
  const { ctx, master } = eng;
  const s = ctx.createBufferSource(), g = ctx.createGain();
  s.buffer = buf.urban; s.loop = true; g.gain.value = .8;
  s.connect(g); g.connect(master); s.start();
  return { stop() { g.gain.setTargetAtTime(0, now(), .4); setTimeout(() => s.stop(), 1800); } };
}

function synthUrban() {
  const { ctx, master } = eng;
  const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
  f.type = 'lowpass'; f.frequency.value = 420;
  g.gain.value = 0; g.gain.linearRampToValueAtTime(.22, now() + 2);
  lfo.frequency.value = .15; lfoGain.gain.value = 180;
  lfo.connect(lfoGain); lfoGain.connect(f.frequency); lfo.start();
  n.connect(f); f.connect(g); g.connect(master);

  const beep = () => { for (let i = 0; i < 4; i++) tone(880, now() + i * .22, .1, .05, 'square'); };
  const iv = setInterval(beep, 2600); beep();

  return {
    stop() {
      clearInterval(iv);
      g.gain.setTargetAtTime(0, now(), .4);
      setTimeout(() => { n.stop(); lfo.stop(); }, 1800);
    }
  };
}

export function urban(on) {
  if (urb) { urb.stop(); urb = null; }
  if (!on || !eng.ctx) return;
  urb = buf.urban ? playUrbanSample() : synthUrban();
}

/* Puertas del museo que se abren, con reverberación */
export function doors() {
  urban(false);
  const { ctx, master } = eng;
  if (buf.doors) {
    const s = ctx.createBufferSource();
    s.buffer = buf.doors; s.connect(master); s.start();
    return;
  }
  const e = echo(), t = now();
  tone(55, t, 1.4, .5, 'sine', e);
  tone(110, t + .1, .9, .2, 'triangle', e);

  const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = 'bandpass'; f.Q.value = 2;
  f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(1400, t + 2.4);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .6); g.gain.linearRampToValueAtTime(0, t + 2.6);
  n.connect(f); f.connect(g); g.connect(e);
  setTimeout(() => n.stop(), 2800);

  [523, 659, 784].forEach((q, i) => tone(q, t + 2.2 + i * .25, 3, .05, 'sine', e));
}

export function ping() {
  const t = now();
  tone(1320, t, .9, .12);
  tone(1980, t + .05, .7, .05);
}

/* Irrupción de La Fractura */
export function boom() {
  const { ctx, master } = eng;
  const t = now(), n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = 'highpass'; f.frequency.value = 1200;
  g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .9);
  n.connect(f); f.connect(g); g.connect(master);
  setTimeout(() => n.stop(), 1000);
  tone(40, t, 1.4, .6);
}

export function chime() {
  [392, 494, 587, 784, 988].forEach((q, i) => tone(q, now() + i * .18, 2.4, .1, 'sine', echo()));
}
