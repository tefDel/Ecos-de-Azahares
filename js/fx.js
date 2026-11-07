/* Efectos 2D: estática/glitch sobre el mundo y visualizador de ondas. */
import { $, RM } from './utils.js';

/* Estática digital (canvas 2D de baja resolución) */
export const FX = (() => {
  const c = $('#fx'), x = c.getContext('2d'), gl = $('#gl');
  c.width = 320; c.height = 180;

  function draw(g) {
    c.style.opacity = g > .01 ? 1 : 0;
    x.clearRect(0, 0, 320, 180);
    if (g < .01) { gl.style.transform = ''; return; }

    const n = Math.floor(6 + g * 30);
    for (let i = 0; i < n; i++) { // franjas fucsia / blancas
      x.fillStyle = Math.random() < .7
        ? `rgba(255,0,127,${Math.random() * .5 * g})`
        : `rgba(255,255,255,${Math.random() * .25 * g})`;
      x.fillRect(Math.random() * 320, Math.random() * 180, Math.random() * 160 * g + 4, Math.random() * 5 + 1);
    }
    x.fillStyle = `rgba(0,0,0,${.18 * g})`; // líneas de barrido
    for (let y = 0; y < 180; y += 3) x.fillRect(0, y, 320, 1);

    x.fillStyle = `rgba(255,255,255,${.5 * g})`; // puntos de nieve
    for (let i = 0; i < 120 * g; i++) x.fillRect(Math.random() * 320, Math.random() * 180, 1, 1);

    gl.style.transform = RM ? '' : `translate(${(Math.random() - .5) * g * 14}px,0)`;
  }
  return { draw };
})();

/* Visualizador de ondas: sano (dorado, limpio) vs corrompido (fucsia, roto).
   cv = canvas, an = analizador (o null), c = corrupción 0..1 */
export function wave(cv, an, c) {
  const x = cv.getContext('2d'), w = cv.width, h = cv.height;
  x.clearRect(0, 0, w, h);
  x.lineWidth = 2;
  x.strokeStyle = c > .05 ? '#FF007F' : '#e0b25a';
  x.beginPath();

  const d = new Uint8Array(an ? an.fftSize : 2);
  if (an) an.getByteTimeDomainData(d);

  for (let i = 0; i < w; i += 2) {
    const v = an ? (d[Math.floor(i / w * d.length)] - 128) / 128 : 0;
    const y = h / 2 + v * h * .9 + (c > 0 ? (Math.random() - .5) * c * h * .9 : 0);
    if (i && Math.random() > c * .12) x.lineTo(i, y); else x.moveTo(i, y);
  }
  x.stroke();
}
