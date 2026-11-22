/* Aud: API pública del audio. El resto del juego solo importa esto. */
import * as E from './engine.js';
import { urban, doors, ping, boom, chime } from './scenes.js';
import { voice } from './voice.js';

const { buf, pool, eng } = E;
let volume = 1, muted = false;

function syncMasterVolume() {
  if (eng.master) eng.master.gain.value = muted ? 0 : volume;
}

function init() {
  E.init();
  syncMasterVolume();
}

export const Aud = {
  init,
  urban, doors, ping, boom, chime, voice, buf,

  setVolume(value) {
    volume = Math.max(0, Math.min(1, Number(value)));
    syncMasterVolume();
  },

  /* Decodifica un audio subido y lo guarda (se pueden subir varios por clave) */
  async load(k, data) {
    init();
    const b = await eng.ctx.decodeAudioData(data);
    (pool[k] = pool[k] || []).push(b);
    buf[k] = buf[k] || b;
    return b;
  },

  /* Elige al azar uno de los audios cargados para cada clave (variación por ciclo) */
  shuffle() {
    Object.keys(pool).forEach(k => { buf[k] = pool[k][Math.floor(Math.random() * pool[k].length)]; });
  },

  clear(k) { delete buf[k]; delete pool[k]; },

  mute(m) { muted = m; syncMasterVolume(); }
};
