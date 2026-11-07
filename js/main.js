/* Ecos de Azahares — punto de entrada.
    Estructura:
      data.js / config.js / state.js / utils.js   contenido, ajustes, estado y ayudas
      audio/                                      Web Audio procedural (Aud)
      world/                                      mundo 3D con Three.js (W)
      fx.js                                       glitch y ondas
      flow/                                       narrativa, vistas e interacción */
import { W } from './world/index.js';
import { tick } from './flow/tick.js';
import { initInput } from './flow/input.js';
import { initStudio } from './flow/studio.js';

initStudio();
initInput();

let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (now - last) / 1000);
  last = now;
  tick(dt);
  W.update(dt, now / 1000);
}
loop(last);
W.home();
