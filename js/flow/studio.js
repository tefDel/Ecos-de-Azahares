/* ESTUDIO: carga tus audios (.mp3/.wav/.ogg) y entornos (.glb) sin tocar el código. */
import { $ } from '../utils.js';
import { CONFIG } from '../config.js';
import { RES } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { show } from './ui.js';

/* [tipo, clave, etiqueta]  ·  tipo: 'a' = audio, 'm' = modelo 3D */
const SLOTS = [
  ['a', 'urban', 'Ambiente urbano (vista 1)'],
  ['a', 'doors', 'Puertas del museo'],
  ['a', 'nyxa', 'Historia de Nyxa'],
  ['a', 'tala', 'Historia de Tala'],
  ['a', 'volt', 'Historia de Volt'],
  ['a', 'bit0', 'Bitácora de Rythden 1'],
  ['a', 'bit1', 'Bitácora de Rythden 2'],
  ['a', 'bit2', 'Bitácora de Rythden 3'],
  ['a', 'core', 'Eco final del núcleo'],
  ['m', 'city', 'Entorno 3D: ciudad (.glb)'],
  ['m', 'gal', 'Entorno 3D: teseracto (.glb)'],
  ['m', 'core', 'Entorno 3D: núcleo (.glb)']
];

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

export function initStudio() {
  const st = $('#studio');

  st.innerHTML =
    '<p class="m"><span>Estudio · reemplaza audios y entornos</span><button id="sx" style="padding:2px 8px">Cerrar</button></p>'
    + SLOTS.map(([t, k, l], i) =>
      `<label class="sl"><span>${l}</span><input type="file" data-i="${i}" accept="${t === 'a' ? 'audio/*' : '.glb,.gltf'}"${t === 'a' ? ' multiple' : ''}><em></em></label>`
    ).join('')
    + '<p class="m" style="display:block">Los .glb reemplazan la decoración de cada zona; puertas, flor y vitrinas se conservan. '
    + 'Cada audio de resonante define cuánto hay que escuchar para liberarlo. '
    + 'Puedes subir varios audios por casilla: cada ciclo usa uno distinto al azar.</p>'
    + '<button id="sr">Restaurar valores</button>';

  st.querySelectorAll('input').forEach(inp => inp.addEventListener('change', async () => {
    const [t, k] = SLOTS[+inp.dataset.i], em = inp.nextElementSibling, files = [...inp.files];
    if (!files.length) return;
    em.textContent = 'cargando…';
    try {
      for (const f of files) await loadSlot(t, k, await f.arrayBuffer());
      em.textContent = 'listo: ' + files.length + ' archivo(s)';
    } catch (e) {
      em.textContent = 'no se pudo leer el archivo';
    }
  }));

  $('#sx').addEventListener('click', () => show('#studio', false));
  $('#stu').addEventListener('click', () => show('#studio', !st.classList.contains('on')));
  $('#sr').addEventListener('click', () => { // restaurar valores de fábrica
    Object.keys(Aud.buf).forEach(k => Aud.clear(k));
    ['city', 'gal', 'core'].forEach(z => W.setEnv(z, null));
    Object.values(RES).forEach(r => { r.dur = 30; });
    st.querySelectorAll('input').forEach(i => { i.value = ''; i.nextElementSibling.textContent = ''; });
  });
}
