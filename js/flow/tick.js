/* Lógica que corre en cada fotograma (dt = segundos desde el anterior). */
import { $, RM } from '../utils.js';
import { S } from '../state.js';
import { W } from '../world/index.js';
import { FX, wave } from '../fx.js';
import { durOf, updDoss, liberate } from './dossier.js';
import { tickTracks } from './fracture.js';

let lastAccent = -1;

/* Suaviza color (mood) y distorsión (glitch) hacia sus objetivos y actualiza el color de acento */
function updateAmbience(dt) {
  S.mood += (S.moodT - S.mood) * Math.min(1, dt * 1.2);
  S.glitch += ((RM ? S.glitchT * .35 : S.glitchT) - S.glitch) * Math.min(1, dt * 3);
  document.body.classList.toggle('broken', S.glitch > .2);

  if (Math.abs(S.mood - lastAccent) > .01) {
    lastAccent = S.mood;
    const c = new THREE.Color(0x8a8c8f).lerp(new THREE.Color(0xe0b25a), S.mood);
    document.documentElement.style.setProperty('--accent', '#' + c.getHexString());
  }
}

/* Giro de cámara en el teseracto: bordes, teclado o botones */
function updateGalleryTurn(dt) {
  if (S.p !== 1 || W.free !== 'gal') return;
  if (S.yawT != null) { // giro automático hacia la vitrina abierta
    const d = Math.atan2(Math.sin(S.yawT - W.yaw), Math.cos(S.yawT - W.yaw));
    W.yaw += d * Math.min(1, dt * 2.5);
    if (Math.abs(d) < .01) S.yawT = null;
  } else if (!S.dossier) {
    const edge = S.mouse && Math.abs(W.mx) > .5 ? Math.sign(W.mx) * (Math.abs(W.mx) - .5) * 2 : 0;
    W.yaw += (S.dir + edge) * dt;
  }
}

/* Reproductor del expediente (la onda siempre se ve sana) */
function updateDossierPlayback(dt) {
  if (!S.dossier || !S.dv) return;
  wave($('#dw'), S.dv.an, 0);
  if (S.playing && !S.freed.has(S.dossier)) {
    S.heard[S.dossier] += dt;
    updDoss();
    if (S.heard[S.dossier] >= durOf(S.dossier)) liberate(S.dossier);
  }
}

export function tick(dt) {
  updateAmbience(dt);
  updateGalleryTurn(dt);
  updateDossierPlayback(dt);
  if (S.p === 2 && S.tracks.length) tickTracks(dt);
  if (S.step === 2 && S.cv) wave($('#fw'), S.cv.an, 0);
  FX.draw(S.glitch);
}
