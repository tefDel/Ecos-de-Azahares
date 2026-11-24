/* El caso de cada ciclo: culpable, pregunta, orden de la carta, pistas y cuaderno. */
import { $, pick, shuffle } from '../utils.js';
import { S } from '../state.js';
import { IDS, ORDER_FIXED, MYST, RES } from '../data.js';
import { show } from './ui.js';

/* Cada ciclo: nuevo culpable, nueva pregunta, ruta (libre u ordenada), variación de audio y glifo oculto */
export function newRun() {
  S.run = {
    culprit: pick(IDS),
    q: pick(MYST),
    /* Primer ciclo: los primeros ORDER_FIXED resonantes en orden fijo (historia); los demás, libres.
       Ciclos siguientes: como antes (orden aleatorio parcial o libre). */
    order: S.cycle === 0 ? IDS.slice(0, ORDER_FIXED) : (Math.random() < .5 ? shuffle(IDS).slice(0, ORDER_FIXED) : null),
    shift: pick([.84, .94, 1, 1.12, 1.26]),
    secret: pick([1, 3, 5]),
    secretFound: false,
    tmap: shuffle(IDS)
  };
  S.clues = []; S.saved = new Set(); S.verdict = null;
  updClues();
}

export function addClue(t) {
  if (S.clues.includes(t)) return;
  S.clues.push(t);
  updClues();
}

/* Redibuja el cuaderno del caso */
export function updClues() {
  const r = S.run;
  if (!r) return;
  $('#jb').textContent = 'Pistas (' + S.clues.length + ')';

  const header = '<p class="m"><span>Cuaderno del caso</span><button id="jx" style="padding:2px 8px">Cerrar</button></p>'
    + '<p>' + r.q + '</p>';
  const order = r.order
    ? '<p class="m" style="display:block">Orden de la carta: ' + r.order.map(i => RES[i].epi.toLowerCase()).join(' → ') + '</p>'
    : '';
  const clues = S.clues.length
    ? S.clues.map(c => '<p style="margin:6px 0">' + c + '</p>').join('')
    : '<p class="m" style="display:block">Sin pistas todavía. Libera a los resonantes para reunir sus testimonios.</p>';

  $('#journal').innerHTML = header + order + clues;
  $('#jx').addEventListener('click', () => show('#journal', false));
}