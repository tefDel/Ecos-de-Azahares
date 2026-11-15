/* VISTA 2 (Teseracto): vitrinas y expedientes. Hay que abrir y escuchar los 3.
   Podcast: la liberación exige escuchar la historia completa (el progreso se conserva si pausas o cierras). */
import { $, fmt } from '../utils.js';
import { S } from '../state.js';
import { RES, CLUES } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { say, show } from './ui.js';
import { addClue } from './run.js';

export const exploreHint = () =>
  say(`Resonantes liberados: ${S.freed.size}/3 · abre cada vitrina y escucha su historia completa · gira con los bordes, ← → o los botones`);

/* Duración que hay que escuchar: la del audio real, o la de demostración */
export const durOf = id => Aud.buf[id] ? Aud.buf[id].duration : RES[id].dur;

/* Clic en una vitrina vacía: puede esconder el glifo secreto */
function openEmptyShowcase(u) {
  const r = S.run;
  if (u.i === r.secret && !r.secretFound) {
    r.secretFound = true;
    addClue('Bajo una peana hay un glifo grabado: ' + RES[r.culprit].glyph.split(' ')[0] + '. Busca dónde lo has visto.');
    say('Algo brilla bajo la peana: encontraste una pista.');
  } else {
    say('Vitrina vacía: este eco aún no despierta.');
  }
}

export function openDoss(u) {
  if (!u.id) { openEmptyShowcase(u); return; }

  /* Si la carta fija un orden, solo se puede abrir el siguiente */
  const order = S.run.order;
  if (order) {
    const next = order.find(x => !S.freed.has(x));
    if (next && next !== u.id && !S.freed.has(u.id)) {
      say('La vitrina de ' + RES[u.id].name + ' no responde aún. Relee la carta: el orden importa.');
      return;
    }
  }
  if (S.freed.has(u.id)) { say(RES[u.id].name + ' ya fue liberado. Su historia queda a salvo.'); return; }

  const r = RES[u.id];
  S.dossier = u.id;
  $('#dm').textContent = `Expediente R-0${r.n} · lengua de Deileanna`;
  $('#dg').textContent = r.glyph;
  $('#dn').textContent = r.name;
  $('#de').textContent = r.epi;
  $('#dt').textContent = r.txt;

  S.heard[u.id] = S.heard[u.id] || 0;
  S.playing = true;
  startVoice();
  updDoss();
  S.yawT = r.angle + .35; // la cámara gira hacia la vitrina
  show('#dossier');
  say('');
}

export function closeDoss() {
  if (!S.dossier) return;
  S.dossier = null; S.playing = false;
  if (S.dv) S.dv.stop();
  S.dv = null;
  show('#dossier', false);
  $('#dx').textContent = 'Cerrar';
  $('#dp').style.visibility = '';
  S.moodT = .2 + .12 * S.freed.size;
  exploreHint();
  if (S.freed.size === 3) {
    $('#adv').textContent = 'Seguir el pasillo hacia el núcleo';
    show('#adv');
  }
}

/* Inicia (o reanuda) la voz del expediente desde donde se quedó */
export function startVoice() {
  const id = S.dossier;
  if (S.dv) S.dv.stop();
  S.dv = Aud.voice(id, {
    vol: .6, orbit: true, buf: Aud.buf[id], offset: S.heard[id], shift: S.run.shift,
    corr: () => S.lost.has(id) ? .4 : 0
  });
  $('#dp').textContent = 'Pausar';
}

/* Botón Pausar / Reanudar */
export function togglePlayback() {
  if (!S.dossier) return;
  S.playing = !S.playing;
  if (S.playing) {
    startVoice();
  } else {
    if (S.dv) S.dv.stop();
    S.dv = null;
    $('#dp').textContent = 'Reanudar';
  }
}

/* Barra de progreso y estado del expediente */
export function updDoss() {
  const id = S.dossier, d = durOf(id), h = Math.min(S.heard[id], d);
  $('#dbar').style.width = h / d * 100 + '%';
  $('#dtm').textContent = fmt(h) + ' / ' + fmt(d);
  $('#dst').textContent = S.freed.has(id)
    ? RES[id].name + ' quedó liberado'
    : (S.lost.has(id) ? 'dañado' : 'sano') + ' · escucha hasta el final para liberarlo';
}

/* Se escuchó la historia completa: liberar al resonante y revelar su testimonio */
export function liberate(id) {
  S.freed.add(id); S.playing = false;
  if (S.dv) S.dv.stop();
  S.dv = null;
  W.freeVit(id); Aud.chime();
  S.moodT = .2 + .12 * S.freed.size;

  const damaged = S.lost.has(id);
  const testimony = damaged ? 'el registro está dañado y solo se entiende ruido.' : CLUES[id][S.run.culprit];
  addClue(RES[id].name + ': «' + testimony + '»');
  $('#dt').textContent = RES[id].txt + '\n\nTestimonio: ' + testimony;

  updDoss();
  $('#dx').textContent = 'Continuar';
  $('#dp').style.visibility = 'hidden';
}
