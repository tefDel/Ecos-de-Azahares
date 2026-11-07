/* VISTA 4 (Núcleo): acusación, la flor sin color y la liberación final. */
import { $ } from '../utils.js';
import { S } from '../state.js';
import { IDS, RES, ENDS, RELEASE } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { say, show, setPhase } from './ui.js';
import { restart } from './restart.js';

/* Vuelo al núcleo tras la Fractura; calcula qué registros se salvaron */
export function toCore() {
  S.saved = new Set(S.tracks.filter(t => t.locked).map(t => t.id));
  S.nextLost = new Set(S.tracks.filter(t => !t.locked).map(t => t.id)); // dañados en el próximo ciclo
  S.recovered = S.saved.size;
  S.tracks.forEach(t => t.v.stop());
  S.tracks = [];

  S.lock = true; S.step = 0;
  setPhase(3);
  S.glitchT = 0; S.moodT = 1;
  show('#tracks', false);

  const p = W.CORE.clone().add(new THREE.Vector3(0, .5, 6));
  W.fly(p, W.CORE.clone().add(new THREE.Vector3(0, .2, 0)), 7, arriveAtCore, 3);
}

function arriveAtCore() {
  W.free = 'core'; S.lock = false;
  $('#w1').textContent = 'Sael Vantorin aguarda en el núcleo. '
    + (S.saved.size
      ? 'Salvaste los registros de ' + [...S.saved].map(i => RES[i].name).join(' y ') + '.'
      : 'Ningún registro sobrevivió.');
  $('#w2').textContent = '';
  show('#wall');
  setTimeout(() => {
    $('#w2').textContent = 'Tú, que estás escuchando: ¿qué parte de tu propio pasado sigues cargando como si te perteneciera?';
    say('Toca la flor sin color.');
  }, 3500);
}

/* Acusación final: la respuesta depende de las pistas que reuniste */
export function openAccuse() {
  S.step = 1; say('');
  const c = $('#choices');
  $('#w1').textContent = 'Sael Vantorin pregunta:';
  $('#w2').textContent = S.run.q;
  c.innerHTML = IDS.map(i => `<button data-i="${i}">${RES[i].name}</button>`).join('');
  c.querySelectorAll('button').forEach(b => b.addEventListener('click', () => accuse(b.dataset.i)));
  show('#choices');
}

function accuse(id) {
  S.verdict = id;
  const ok = id === S.run.culprit;
  if (ok) S.solved++;
  show('#choices', false);
  $('#w1').textContent = ok ? 'Sael asiente despacio.' : 'Sael niega con la cabeza.';
  $('#w2').textContent = ok
    ? RES[S.run.culprit].name + ' lo confirma con su silencio.'
    : 'No era ' + RES[S.verdict].name + '. La verdad sigue en el museo.';
  setTimeout(openChoices, 3500);
}

/* ¿Qué estás dispuesto a soltar? */
function openChoices() {
  S.step = 1; say('');
  const c = $('#choices');
  c.innerHTML = RELEASE.map(r => `<button>${r}</button>`).join('');
  c.querySelectorAll('button').forEach(b => b.addEventListener('click', () => release(b.textContent)));
  show('#choices');
  $('#w1').textContent = '¿Qué estás dispuesto a soltar?';
  $('#w2').textContent = 'Tú, que estás escuchando: ¿qué parte de tu propio pasado sigues cargando como si te perteneciera?';
}

/* Final: el color vuelve a la flor. El texto depende de si acertaste y de cuántos registros salvaste. */
function release(what) {
  S.step = 2;
  show('#choices', false); show('#wall', false);
  W.setFlower(W.fl2, 'warm');
  Aud.chime();
  S.cv = Aud.voice('rythden', { buf: Aud.buf.core, loop: true, root: 196, vol: .4, orbit: true });

  const ok = S.verdict === S.run.culprit;
  const ending = ok ? (S.saved.size >= 2 ? 'A' : 'B') : (S.saved.size >= 2 ? 'C' : 'D');
  $('#fl').textContent = `${ENDS[ending]} Era ${RES[S.run.culprit].name}. Soltaste: «${what}» y el color vuelve.`;
  $('#fc').textContent = `registros salvados: ${S.recovered}/3 · casos resueltos: ${S.solved}`;
  show('#final');
  S.rt = setTimeout(restart, 14000);
}
