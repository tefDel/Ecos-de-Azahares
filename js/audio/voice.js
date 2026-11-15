/* Voces sintéticas de los resonantes y de la Bitácora.
    Opciones (o):
    vol, pan, shift   volumen, paneo y transposición
    corr()            devuelve 0..1: corrupción en vivo (cortes + desafinación)
    orbit             el sonido gira en estéreo
    buf, loop, offset usar un audio real (podcast) en vez de sintetizar
    root              nota base (solo para 'rythden')
   Devuelve { an, vol(v), stop() }  (an = analizador para dibujar la onda) */
import { eng, now, rnd, noise, tone } from './engine.js';

export function voice(kind, o = {}) {
  const { ctx, master } = eng;
  const gate = ctx.createGain(), out = ctx.createGain();
  const pan = ctx.createStereoPanner(), an = ctx.createAnalyser();
  an.fftSize = 512; out.gain.value = o.vol ?? .5; pan.pan.value = o.pan || 0;
  gate.connect(out); out.connect(pan); pan.connect(an); an.connect(master);

  const sources = [], oscs = [], timers = [];
  const sh = o.shift || 1;
  const every = (ms, fn) => timers.push(setInterval(fn, ms));

  const osc = (type, f, g) => {
    const x = ctx.createOscillator(), y = ctx.createGain();
    x.type = type; x.frequency.value = f * sh; y.gain.value = g;
    x.connect(y); y.connect(gate); x.start();
    sources.push(x); oscs.push(x);
    return x;
  };
  const noiseBand = (type, freq) => {
    const s = noise(), f = ctx.createBiquadFilter(), y = ctx.createGain();
    f.type = type; f.frequency.value = freq; y.gain.value = 0;
    s.connect(f); f.connect(y); y.connect(gate);
    sources.push(s);
    return y;
  };

  if (o.buf) {
    /* Audio real (podcast): conserva corrupción, órbita y analizador */
    const s = ctx.createBufferSource();
    s.buffer = o.buf; s.loop = !!o.loop; s.connect(gate); s.start(0, o.offset || 0);
    sources.push(s);
    oscs.push({ detune: { set value(c) { s.playbackRate.value = 1 + c / 4000; } } });

  } else if (kind === 'nyxa') { // susurros entre sombras
    const a = osc('sine', 98, .22); osc('sine', 147, .1);
    const w = noiseBand('highpass', 2800);
    every(420, () => {
      w.gain.setTargetAtTime(rnd(0, .1), now(), .25);
      a.frequency.setTargetAtTime(rnd(90 * sh, 106 * sh), now(), .5);
    });

  } else if (kind === 'tala') { // gruñidos y aullidos lejanos
    const a = osc('sawtooth', 62, .09), w = noiseBand('lowpass', 500);
    every(650, () => {
      a.frequency.setTargetAtTime(rnd(48 * sh, 95 * sh), now(), .12);
      w.gain.setTargetAtTime(Math.random() < .5 ? rnd(.05, .25) : 0, now(), .05);
      if (Math.random() < .25) tone(rnd(190, 320), now(), 1.1, .05, 'sine', gate);
    });

  } else if (kind === 'volt') { // chispas y arpegios eléctricos
    osc('sawtooth', 110, .07);
    const b = osc('square', 220, .03), c = noiseBand('highpass', 4500);
    const scale = [220, 277, 330, 440, 554];
    every(110, () => {
      c.gain.setTargetAtTime(Math.random() < .4 ? .25 : 0, now(), .01);
      if (Math.random() < .3) b.frequency.value = scale[Math.floor(Math.random() * 5)] * sh;
    });

  } else { // registros de la Bitácora de Rythden
    const root = o.root || 196, scale = [1, 1.125, 1.25, 1.5, 1.667, 2];
    let k = 0;
    osc('sine', root / 2, .12);
    every(520, () => tone(root * scale[(k++ * 2 + Math.floor(Math.random() * 3)) % 6], now(), 1.2, .1, 'triangle', gate));
  }

  if (o.orbit) every(60, () => { pan.pan.value = Math.sin(now() * .9) * .9; });

  /* Corrupción: cortes aleatorios + desafinación */
  every(80, () => {
    const c = o.corr ? o.corr() : 0;
    gate.gain.setTargetAtTime(Math.random() < c * .85 ? 0 : 1, now(), .008);
    oscs.forEach(x => { x.detune.value = (Math.random() - .5) * c * 1400; });
  });

  return {
    an,
    vol(v) { out.gain.setTargetAtTime(v, now(), .1); },
    stop() {
      timers.forEach(clearInterval);
      out.gain.setTargetAtTime(0, now(), .2);
      setTimeout(() => sources.forEach(x => { try { x.stop(); } catch (e) { /* ya detenido */ } }), 700);
    }
  };
}
