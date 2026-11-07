/* VISTA 1 (Detonante): la flor, la carta y el cruce de la puerta. */
import { $ } from '../utils.js';
import { S } from '../state.js';
import { RES, OPEN } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { say, show, setPhase } from './ui.js';
import { newRun } from './run.js';
import { loadConfig } from './studio.js';
import { exploreHint } from './dossier.js';

/* Rellena el texto de la carta con el caso actual */
export function letterText() {
  $('#lt1').textContent = S.cycle ? 'Para ti,' : 'Adrián,';
  $('#lt2').textContent = `Calle de los Naranjos 17, Museo Central, puerta ${W.doorIdx + 1}.`;
  $('#lt0').textContent = OPEN[S.cycle % OPEN.length];

  const r = S.run, epi = i => RES[i].epi.toLowerCase();
  let t = 'Una pregunta te espera: ' + r.q;
  if (r.order) t += ' Libera primero a ' + epi(r.order[0]) + ', después a ' + epi(r.order[1]) + ' y al final a ' + epi(r.order[2]) + '.';
  if (S.lost.size) t += ' Cuidado: ' + [...S.lost].map(i => RES[i].name).join(' y ') + ' quedó dañado tras tu última visita.';
  $('#lt3').textContent = t;
}

/* Botón "Comenzar" */
export function begin() {
  Aud.init();
  loadConfig().then(() => Aud.urban(true));
  show('#intro', false);
  S.lock = false;
  newRun();
  letterText();
  say('Algo brilla entre tanto gris. Acércate a la flor.');
}

export function openLetter() {
  Aud.ping();
  S.letter = true;
  show('#letter');
  say('');
}

/* Cruzar la puerta: vuelo de cámara hacia el teseracto */
export function cross() {
  S.letter = false; S.lock = true;
  show('#letter', false);
  Aud.doors(); W.openDoor();
  S.moodT = .2;

  const gp = W.galPos(), lk = gp.clone().add(W.dirV(0));
  setTimeout(() => W.fly(gp, lk, 6.5, () => {
    W.yaw = 0; W.free = 'gal'; S.lock = false;
    setPhase(1); show('#arrows'); exploreHint();
  }, 1.5), 1200);
}
