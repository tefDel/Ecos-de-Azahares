/* Motor de audio: contexto Web Audio, ruido, tonos y eco. */

export const buf = {};   // audios reales decodificados (uno activo por clave)
export const pool = {};  // todos los audios cargados por clave (para variar en cada ciclo)
export const eng = { ctx: null, master: null, noiseBuf: null };

export const now = () => eng.ctx.currentTime;
export const rnd = (a, b) => a + Math.random() * (b - a);

export function init() {
  if (eng.ctx) { eng.ctx.resume(); return; }
  const ctx = eng.ctx = new (window.AudioContext || window.webkitAudioContext)();
  eng.master = ctx.createGain();
  eng.master.connect(ctx.destination);
  eng.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = eng.noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

/* Fuente de ruido blanco en bucle */
export function noise() {
  const s = eng.ctx.createBufferSource();
  s.buffer = eng.noiseBuf; s.loop = true; s.start();
  return s;
}

/* Nota con ataque rápido y caída exponencial */
export function tone(f, t0, dur, g = .15, type = 'sine', dest = eng.master) {
  const o = eng.ctx.createOscillator(), e = eng.ctx.createGain();
  o.type = type; o.frequency.value = f;
  e.gain.setValueAtTime(0, t0);
  e.gain.linearRampToValueAtTime(g, t0 + .02);
  e.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(e); e.connect(dest);
  o.start(t0); o.stop(t0 + dur + .05);
}

/* Eco de sala de museo. Devuelve el nodo de entrada. */
export function echo() {
  const { ctx, master } = eng;
  const dl = ctx.createDelay(1), fb = ctx.createGain(), inp = ctx.createGain();
  dl.delayTime.value = .3; fb.gain.value = .45;
  inp.connect(dl); dl.connect(fb); fb.connect(dl);
  dl.connect(master); inp.connect(master);
  return inp;
}
