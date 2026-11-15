/* Reinicio del ciclo: la ciudad, otra puerta, otra flor. */
import { $ } from '../utils.js';
import { S } from '../state.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { say, hideAll, setPhase } from './ui.js';
import { newRun } from './run.js';
import { letterText } from './intro.js';

export function restart() {
  if (S.busy) return;
  S.busy = true;
  clearTimeout(S.rt);
  $('#fade').style.opacity = 1;

  setTimeout(() => {
    /* Estado: lo que no se salvó queda dañado en el ciclo siguiente */
    if (S.cv) S.cv.stop();
    S.cv = null;
    S.cycle++;
    S.seen.clear();
    S.lost = S.nextLost || new Set();
    S.nextLost = null;
    Aud.shuffle();
    newRun();
    S.heard = {}; S.freed.clear(); S.playing = false;
    S.mood = S.moodT = 0; S.glitch = S.glitchT = 0;
    S.step = 0; S.yawT = null;

    /* Mundo */
    hideAll();
    W.resetVit();
    W.setDoor((2 + S.cycle * 2) % 5);
    W.setFlower(W.fl1, 'neon');
    W.setFlower(W.fl2, 'none');
    W.home();

    /* Interfaz y sonido */
    setPhase(0);
    letterText();
    Aud.urban(true);
    say('La ciudad vuelve a sonar. Otra puerta, otra flor.');
    $('#fade').style.opacity = 0;
    S.lock = false; S.busy = false;
  }, 1100);
}
