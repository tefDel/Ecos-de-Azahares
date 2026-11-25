/* Carga los audios y entornos definidos en CONFIG.
   Las voces de los 6 resonantes se descargan en paralelo (y por adelantado,
   cuando la página termina de cargar) para que al abrir una vitrina ya suene
   su audio real. Cada voz expone una promesa: audioReady(id). */
import { CONFIG } from '../config.js';
import { RES, IDS } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';

const raw = {};    // clave -> Promise<ArrayBuffer|null>  (descarga)
const ready = {};  // clave -> Promise<AudioBuffer|null>  (decodificado)

function fetchBuf(url, tries = 3) {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
    .catch(e => tries > 1
      ? new Promise(ok => setTimeout(ok, 700)).then(() => fetchBuf(url, tries - 1))
      : Promise.reject(e));
}

function prefetch(keys) {
  keys.forEach(k => {
    const u = CONFIG.audio[k];
    if (u && !raw[k]) raw[k] = fetchBuf(u).catch(e => { console.warn('No se pudo descargar', u, e); return null; });
  });
}

/* Descarga anticipada de las voces de las vitrinas, sin estorbar la carga de la página */
const early = () => setTimeout(() => prefetch(IDS), 1200);
if (document.readyState === 'complete') early(); else addEventListener('load', early, { once: true });

/* Promesa del audio decodificado de una clave (null si no se pudo cargar) */
export function audioReady(k) {
  return ready[k] || Promise.resolve(Aud.buf[k] || null);
}

function decode(k) {
  if (ready[k]) return ready[k];
  prefetch([k]);
  ready[k] = (raw[k] || Promise.resolve(null)).then(async data => {
    if (!data) return null;
    if (Aud.buf[k]) return Aud.buf[k];
    const b = await Aud.load(k, data);
    if (RES[k]) RES[k].dur = b.duration; // la duración real define cuánto hay que escuchar
    return b;
  }).catch(e => { console.warn('No se pudo decodificar', CONFIG.audio[k], e); return null; });
  return ready[k];
}

/* Carga los archivos que pongas en CONFIG (requieren que tú alojes los archivos) */
export async function loadConfig() {
  // Primero las voces de las vitrinas, luego el resto; todo en paralelo
  const keys = Object.keys(CONFIG.audio).filter(k => CONFIG.audio[k]);
  keys.sort((a, b) => (IDS.includes(b) ? 1 : 0) - (IDS.includes(a) ? 1 : 0));
  prefetch(keys);
  await Promise.all(keys.map(decode));

  for (const [k, u] of Object.entries(CONFIG.models)) {
    if (!u) continue;
    try {
      const data = await (await fetch(u)).arrayBuffer();
      await new Promise((ok, no) =>
        new THREE.GLTFLoader().parse(data, '', g => { W.setEnv(k, g.scene); ok(); }, no));
    } catch (e) { console.warn('No se pudo cargar', u); }
  }
}
