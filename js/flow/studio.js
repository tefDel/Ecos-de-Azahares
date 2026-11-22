/* Carga los audios y entornos definidos en CONFIG. */
import { CONFIG } from '../config.js';
import { RES } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';

async function loadSlot(type, key, data) {
  if (type === 'a') {
    await Aud.load(key, data);
    if (RES[key]) RES[key].dur = Aud.buf[key].duration; // la duración real define cuánto hay que escuchar
  } else {
    await new Promise((ok, no) =>
      new THREE.GLTFLoader().parse(data, '', g => { W.setEnv(key, g.scene); ok(); }, no));
  }
}

/* Carga los archivos que pongas en CONFIG (requieren que tú alojes los archivos) */
export async function loadConfig() {
  const jobs = [
    ...Object.entries(CONFIG.audio).map(([k, u]) => ['a', k, u]),
    ...Object.entries(CONFIG.models).map(([k, u]) => ['m', k, u])
  ].filter(j => j[2]);

  for (const [t, k, u] of jobs) {
    try { await loadSlot(t, k, await (await fetch(u)).arrayBuffer()); }
    catch (e) { console.warn('No se pudo cargar', u); }
  }
}
