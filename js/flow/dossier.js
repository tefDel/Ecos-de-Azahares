/* VISTA 2 (Teseracto): vitrinas y expedientes. Hay que abrir y escuchar los 6.
   Podcast: la liberación exige escuchar la historia completa (el progreso se conserva si pausas o cierras). */
import { $, fmt } from '../utils.js';
import { S } from '../state.js';
import { IDS, RES, CLUES, CHARACTER_COLORS } from '../data.js';
import { Aud } from '../audio/index.js';
import { W } from '../world/index.js';
import { say, show } from './ui.js';
import { addClue } from './run.js';
import { audioReady } from './studio.js';
import { CONFIG } from '../config.js';

export const exploreHint = () =>
  say(`Resonantes liberados: ${S.freed.size}/${IDS.length} · abre cada vitrina y escucha su historia completa · gira con los bordes, ← → o los botones`);

/* Duración que hay que escuchar: la del audio real, o la de demostración */
export const durOf = id => Aud.buf[id] ? Aud.buf[id].duration : RES[id].dur;

/* Clic en una vitrina sin resonante liberable: puede esconder el glifo secreto */
function openEmptyShowcase(u) {
  const r = S.run;
  if (u.i === r.secret && !r.secretFound) {
    r.secretFound = true;
    addClue('Bajo una peana hay un glifo grabado: ' + RES[r.culprit].glyph.split(' ')[0] + '. Busca dónde lo has visto.');
    say('Algo brilla bajo la peana: encontraste una pista.');
  } else {
    say('Vitrina sellada: este eco aún no despierta.');
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
  $('#dossier').style.setProperty('--character-color', CHARACTER_COLORS[u.id]);
  S.seeking = S.resumeAfterSeek = false;
  $('#dm').textContent = `Expediente R-0${r.n} · lengua de Deileanna`;
  $('#dg').textContent = r.glyph;
  $('#di').src = r.img;
  $('#dn').textContent = r.name;
  $('#de').textContent = r.epi;
  $('#dt').textContent = r.txt;

  S.heard[u.id] = S.heard[u.id] || 0;
  S.maxHeard[u.id] = Math.max(S.maxHeard[u.id] || 0, S.heard[u.id]);
  S.playing = true;
  startVoice();
  updDoss();
  S.yawT = r.angle + .35; // la cámara gira hacia la vitrina
  show('#dossier');
  say('');
}

export function closeDoss() {
  if (!S.dossier) return;
  S.seeking = S.resumeAfterSeek = false;
  S.dossier = null; S.playing = false;
  if (S.dv) S.dv.stop();
  S.dv = null;
  show('#dossier', false);
  $('#dx').textContent = 'Cerrar';
  $('#dp').style.visibility = '';
  $('#dbar').disabled = true;
  S.moodT = .2 + .36 * S.freed.size / IDS.length;
  exploreHint();
  if (S.freed.size === IDS.length) {
    $('#adv').textContent = 'Seguir el pasillo hacia el núcleo';
    show('#adv');
  }
}

/* Analizador de mentira para la onda cuando la voz suena por <audio> (sin Web Audio) */
function softWave(el) {
  return {
    fftSize: 256,
    getByteTimeDomainData(d) {
      const t = performance.now() / 1000, amp = el.paused || el.muted || !el.volume ? 0 : 30 + Math.sin(t * 2.3) * 14;
      for (let i = 0; i < d.length; i++) d[i] = 128 + amp * Math.sin(i * .21 + t * 9) * Math.sin(i * .043 + t * 1.7);
    }
  };
}

/* Respaldo: reproducir la voz real con un <audio> (p. ej. al abrir el HTML como archivo,
   donde el navegador no deja leer el audio para Web Audio). Resuelve cuando ya suena. */
function mediaVoice(id, url, offset) {
  const el = new Audio(url);
  el.preload = 'auto';
  let timer = 0, stopped = false, gain = .9;
  // sigue al deslizador de volumen del juego y al botón de silencio
  const apply = () => { el.volume = Math.max(0, Math.min(1, gain * Aud.level())); };
  apply();
  const ctrl = {
    an: softWave(el),
    vol(v) { gain = v; apply(); },
    stop() { stopped = true; clearInterval(timer); el.pause(); el.removeAttribute('src'); el.load(); }
  };
  return new Promise((ok, no) => {
    el.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(el.duration)) RES[id].dur = el.duration;
      el.currentTime = Math.min(offset || 0, Math.max(0, el.duration - .25));
    }, { once: true });
    el.addEventListener('playing', () => ok(ctrl), { once: true });
    el.addEventListener('error', () => no(el.error), { once: true });
    el.play().catch(no);
    // registro dañado: cortes como en la versión con Web Audio
    timer = setInterval(() => {
      if (stopped) return;
      apply();
      el.muted = S.lost.has(id) && Math.random() < .34;
    }, 80);
  });
}

/* Inicia (o reanuda) la voz del expediente desde donde se quedó.
   Siempre intenta el audio real del personaje: si aún se está descargando,
   espera; si Web Audio no puede leerlo, lo reproduce con <audio>; solo si el
   archivo falta por completo usa la voz sintetizada. */
let voiceReq = 0;
export function startVoice() {
  const id = S.dossier, req = ++voiceReq;
  if (S.dv) S.dv.stop();
  S.dv = null;
  const go = buf => {
    if (req !== voiceReq || S.dossier !== id || !S.playing) return;
    S.dv = Aud.voice(id, {
      vol: .6, orbit: true, buf, offset: S.heard[id], shift: S.run.shift,
      corr: () => S.lost.has(id) ? .4 : 0
    });
    $('#dp').textContent = 'Pausar';
    updDoss();
  };
  if (Aud.buf[id]) { go(Aud.buf[id]); return; }

  $('#dp').textContent = 'Cargando voz…';
  audioReady(id).then(buf => {
    if (buf) return go(buf);
    const url = CONFIG.audio[id];
    if (!url) return go(null);
    return mediaVoice(id, url, S.heard[id]).then(v => {
      if (req !== voiceReq || S.dossier !== id || !S.playing) { v.stop(); return; }
      S.dv = v;
      $('#dp').textContent = 'Pausar';
      updDoss();
    }).catch(e => { console.warn('No se pudo reproducir la voz de', id, e); go(null); });
  });
}

/* Botón Pausar / Reanudar */
export function togglePlayback() {
  if (!S.dossier) return;
  if (S.seeking) endDossierSeek();
  S.playing = !S.playing;
  if (S.playing) {
    startVoice();
  } else {
    if (S.dv) S.dv.stop();
    S.dv = null;
    $('#dp').textContent = 'Reanudar';
  }
}

export function beginDossierSeek() {
  if (!S.dossier || S.freed.has(S.dossier) || S.seeking) return;
  S.seeking = true;
  S.resumeAfterSeek = S.playing;
  if (S.dv) S.dv.stop();
  S.dv = null;
}

export function seekDossier(value) {
  const id = S.dossier;
  if (!id || S.freed.has(id)) return;
  if (!S.seeking) beginDossierSeek();
  const target = Number(value), d = durOf(id);
  if (!Number.isFinite(target)) return;
  const furthest = Math.min(d, Math.max(S.maxHeard[id] || 0, S.heard[id] || 0));
  S.heard[id] = Math.min(furthest, Math.max(0, target));
  updDoss();
}

export function endDossierSeek() {
  if (!S.seeking) return;
  S.seeking = false;
  const resume = S.resumeAfterSeek;
  S.resumeAfterSeek = false;
  if (resume && S.dossier && S.playing && !S.freed.has(S.dossier)) startVoice();
}

/* Barra de progreso y estado del expediente */
export function updDoss() {
  const id = S.dossier, d = durOf(id), h = Math.min(S.heard[id], d);
  const bar = $('#dbar');
  const furthest = Math.min(S.maxHeard[id] || 0, d);
  bar.max = String(d);
  bar.value = String(h);
  bar.disabled = S.freed.has(id) || furthest <= 0;
  bar.style.setProperty('--progress', `${h / d * 100}%`);
  bar.setAttribute('aria-valuetext', `${fmt(h)} de ${fmt(d)}`);
  $('#dtm').textContent = fmt(h) + ' / ' + fmt(d);
  $('#dst').textContent = S.freed.has(id)
    ? RES[id].name + ' quedó liberado'
    : (S.lost.has(id) ? 'dañado' : 'sano') + ' · escucha hasta el final para liberarlo';
}

/* Se escuchó la historia completa: liberar al resonante y revelar su testimonio */
export function liberate(id) {
  S.freed.add(id); S.playing = false;
  S.seeking = S.resumeAfterSeek = false;
  if (S.dv) S.dv.stop();
  S.dv = null;
  W.freeVit(id); Aud.chime();
  S.moodT = .2 + .36 * S.freed.size / IDS.length;

  const damaged = S.lost.has(id);
  const testimony = damaged ? 'el registro está dañado y solo se entiende ruido.' : CLUES[id][S.run.culprit];
  addClue(RES[id].name + ': «' + testimony + '»');
  $('#dt').textContent = RES[id].txt + '\n\nTestimonio: ' + testimony;

  updDoss();
  $('#dx').textContent = 'Continuar';
  $('#dp').style.visibility = 'hidden';
}