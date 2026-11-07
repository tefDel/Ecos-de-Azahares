/* Entrada: puntero, teclado y botones. Aquí se conectan los eventos con las acciones del juego. */
import { $ } from '../utils.js';
import { S } from '../state.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { show } from './ui.js';
import { begin, openLetter, cross } from './intro.js';
import { openDoss, closeDoss, togglePlayback } from './dossier.js';
import { fracture } from './fracture.js';
import { openAccuse } from './finale.js';
import { restart } from './restart.js';

/* ¿Hay algo clicable bajo el cursor en la fase actual? */
function hoveredSomething(e) {
  if (S.lock) return false;
  if (S.p === 0 && !S.letter) return !!W.pick([W.fl1.hit], e);
  if (S.p === 1 && !S.dossier) return !!W.pick(W.glass, e);
  if (S.p === 3 && S.step === 0) return !!W.pick([W.fl2.hit], e);
  return false;
}

function onCanvasClick(e) {
  if (S.lock) return;
  if (S.p === 0 && !S.letter && W.pick([W.fl1.hit], e)) {
    openLetter();
  } else if (S.p === 1 && !S.dossier) {
    const o = W.pick(W.glass, e);
    if (o) openDoss(o.userData);
  } else if (S.p === 3 && S.step === 0 && W.pick([W.fl2.hit], e)) {
    openAccuse();
  }
}

export function initInput() {
  const cv = $('#gl');

  cv.addEventListener('pointermove', e => {
    S.mouse = e.pointerType === 'mouse';
    W.mx = e.clientX / innerWidth * 2 - 1;
    W.my = e.clientY / innerHeight * 2 - 1;
    W.hov = hoveredSomething(e);
    cv.style.cursor = W.hov ? 'pointer' : 'default';
  });
  cv.addEventListener('click', onCanvasClick);

  /* Teclado: ← → giran la cámara, Esc cierra el expediente */
  addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') S.dir = -1;
    if (e.key === 'ArrowRight') S.dir = 1;
    if (e.key === 'Escape') closeDoss();
  });
  addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') S.dir = 0;
  });

  /* Botones de giro en pantalla */
  [['#aL', -1], ['#aR', 1]].forEach(([sel, dir]) => {
    const b = $(sel);
    b.addEventListener('pointerdown', () => { S.dir = dir; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { S.dir = 0; }));
  });

  /* Soltar el registro de la Bitácora */
  addEventListener('pointerup', () => { S.held = -1; });
  addEventListener('pointercancel', () => { S.held = -1; });

  /* Botones de la interfaz */
  $('#go').addEventListener('click', begin);
  $('#cross').addEventListener('click', cross);
  $('#dx').addEventListener('click', closeDoss);
  $('#dp').addEventListener('click', togglePlayback);
  $('#adv').addEventListener('click', fracture);
  $('#again').addEventListener('click', restart);
  $('#jb').addEventListener('click', () => show('#journal', !$('#journal').classList.contains('on')));
  $('#snd').addEventListener('click', e => {
    S.muted = !S.muted;
    Aud.mute(S.muted);
    e.target.textContent = S.muted ? 'Sonido silenciado' : 'Sonido activado';
    e.target.setAttribute('aria-pressed', !S.muted);
  });
}
