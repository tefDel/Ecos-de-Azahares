/* Ayudas de interfaz: mostrar/ocultar paneles, texto narrador y fase. */
import { $ } from '../utils.js';
import { S } from '../state.js';
import { PHASES } from '../data.js';

/* Texto del narrador (vacío = se oculta) */
export function say(txt) {
  const e = $('#say');
  if (txt) e.textContent = txt;
  e.classList.toggle('on', !!txt);
}

export const show = (sel, on = true) => $(sel).classList.toggle('on', on);

export const hideAll = () =>
  ['#letter', '#dossier', '#arrows', '#adv', '#tracks', '#wall', '#choices', '#final'].forEach(s => show(s, false));

export function setPhase(n) {
  S.p = n;
  $('#ph').textContent = PHASES[n];
  document.querySelectorAll('#dots i').forEach((d, i) => d.classList.toggle('on', i <= n));
}
