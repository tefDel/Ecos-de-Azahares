/* VISTA 3 (Fractura): estabilizar la Bitácora de Rythden antes de que se borre.
   Mantén presionado un registro para subir su integridad; cada pocos segundos un registro se degrada. */
import { $, clamp, fmt } from '../utils.js';
import { S } from '../state.js';
import { RES, FRAG } from '../data.js';
import { Aud } from '../audio/index.js';
import { wave } from '../fx.js';
import { say, show, setPhase } from './ui.js';
import { addClue } from './run.js';
import { toCore } from './finale.js';

const DAYS = [112, 131, 148];

/* Corrupción 0..1 de un registro */
const corruptionOf = t => t.dead ? 1 : t.locked ? 0 : Math.pow(1 - t.int, .7);

function trackRowHTML(i) {
  return `<div class="tr" data-i="${i}"><div class="m"><span>registro de ${RES[S.run.tmap[i]].name} · día ${DAYS[i]}</span>`
    + `<span class="st">corrupto</span><span class="tm">00:00 / 02:31</span></div>`
    + `<canvas width="360" height="40"></canvas><div class="bar"><i></i></div></div>`;
}

export function fracture() {
  setPhase(2);
  show('#adv', false); show('#arrows', false); say('');
  Aud.boom();
  S.glitchT = 1; S.moodT = .55;

  $('#tracks').innerHTML =
    '<p class="m"><span>Bitácora de Rythden · mantén presionado un registro para estabilizarlo</span></p>'
    + [0, 1, 2].map(trackRowHTML).join('')
    + '<div class="bar" style="margin-top:6px"><i id="tmr" style="background:var(--accent);width:100%"></i></div>';

  S.tracks = [0, 1, 2].map(i => {
    const t = { id: S.run.tmap[i], int: .35 + Math.random() * .15, locked: false, dead: false, t0: performance.now() };
    t.v = Aud.voice('rythden', {
      buf: Aud.buf['bit' + i], loop: true, root: [196, 233, 175][i], pan: [-.7, 0, .7][i], vol: .3,
      corr: () => corruptionOf(t)
    });
    return t;
  });
  S.tleft = 32; S.surge = 3.5; S.held = -1;
  show('#tracks');

  document.querySelectorAll('.tr').forEach(el => {
    el.addEventListener('pointerdown', () => { S.held = +el.dataset.i; });
  });
}

/* Cada 3.5 s, un registro abierto pierde integridad */
function surgeRandomTrack() {
  S.surge = 3.5;
  const open = S.tracks.filter(t => !t.locked && !t.dead);
  if (open.length) open[Math.floor(Math.random() * open.length)].int -= .12;
}

function updateTrack(t, i, dt) {
  if (!t.locked && !t.dead) {
    t.int += (S.held === i ? .14 : -.09) * dt;
    if (t.int >= 1) { // estabilizado: se obtiene un fragmento de la bitácora
      t.int = 1; t.locked = true;
      Aud.ping();
      addClue(FRAG[t.id][t.id === S.run.culprit ? 1 : 0]);
    }
    if (t.int <= 0) { t.int = 0; t.dead = true; t.v.stop(); }
  }
  if (!t.dead) t.v.vol(S.held === i ? .7 : .3);
}

function renderRow(el, t, i, c) {
  if (!el) return;
  el.classList.toggle('hold', S.held === i);
  el.querySelector('.st').textContent = t.dead ? 'borrado' : t.locked ? 'estable' : 'corrupto';
  el.querySelector('.tm').textContent = t.dead
    ? '--:-- / 02:31'
    : fmt(((performance.now() - t.t0) / 1000) % 151) + ' / 02:31';
  const b = el.querySelector('.bar i');
  b.style.width = t.int * 100 + '%';
  b.style.background = t.locked ? '#e0b25a' : '#FF007F';
  wave(el.querySelector('canvas'), t.dead ? null : t.v.an, c);
}

export function tickTracks(dt) {
  S.tleft -= dt; S.surge -= dt;
  if (S.surge <= 0) surgeRandomTrack();

  const rows = document.querySelectorAll('.tr');
  let corruption = 0, open = 0;
  S.tracks.forEach((t, i) => {
    updateTrack(t, i, dt);
    const c = corruptionOf(t);
    corruption += c;
    if (!t.locked && !t.dead) open++;
    renderRow(rows[i], t, i, c);
  });

  $('#tmr').style.width = clamp(S.tleft / 32, 0, 1) * 100 + '%';
  S.glitchT = .15 + .85 * (corruption / 3); // más corrupción = más glitch
  if (!open || S.tleft <= 0) toCore();      // todos resueltos o se acabó el tiempo
}
