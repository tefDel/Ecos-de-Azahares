/* MEMORIA COMPLETA — secuencia especial al reunir las 7 notas escondidas.
   Es autónoma: crea su propio HTML y CSS, así que no necesita nada en index.html ni en los .css.
   Las ocho semillas de Sael aparecen en círculo (cada una con su color), se funden en una flor
   gigante y estalla una lluvia de pétalos. Se puede cerrar con Esc o con los botones. */
import { CHARACTER_COLORS } from './data.js';

const SEEDS = [ // orden de liberación; el color de cada resonante
  ['Nyxa', CHARACTER_COLORS.nyxa], ['Tala', CHARACTER_COLORS.tala], ['Lyra', CHARACTER_COLORS.lyra], ['Kael', CHARACTER_COLORS.kael],
  ['Virena', CHARACTER_COLORS.virena], ['Volt', CHARACTER_COLORS.volt], ['Naxaly', CHARACTER_COLORS.naxaly], ['Rythden', CHARACTER_COLORS.rythden]
];
const FLAG = 'ecos-memoria-vista';
const T_APPEAR = i => .6 + i * .45;   // segundo en que aparece cada semilla
const T_GATHER = 4.4, T_BLOOM = 6.4;  // se reúnen / florece
const THEME = getComputedStyle(document.documentElement);
const THEME_ACCENT = THEME.getPropertyValue('--ac').trim();
const THEME_LIGHT = THEME.getPropertyValue('--t1').trim();
const THEME_ACCENT_RGB = [1, 3, 5].map(i => parseInt(THEME_ACCENT.slice(i, i + 2), 16)).join(',');
const THEME_LIGHT_RGB = [1, 3, 5].map(i => parseInt(THEME_LIGHT.slice(i, i + 2), 16)).join(',');

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const easeInOut = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

let memoriaCompletada = false;
try { memoriaCompletada = localStorage.getItem(FLAG) === '1'; }
catch (error) { console.error('No se pudo leer el estado de la memoria completa:', error); }

export const memoriaVista = () => memoriaCompletada;

function marcarMemoriaCompletada() {
  memoriaCompletada = true;
  try { localStorage.setItem(FLAG, '1'); }
  catch (error) { console.error('No se pudo guardar que la secuencia ya se mostró:', error); }
}

const CSS = `
#memoria{position:fixed;inset:0;z-index:9999;display:block;background:radial-gradient(circle at 50% 42%,var(--bg1) 0,var(--bg0) 62%,color-mix(in srgb,var(--bg0) 65%,#000) 100%);opacity:0;transition:opacity .9s}
#memoria.on{opacity:1}
#memoria canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#memoria .mm-x{position:absolute;top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right));width:42px;height:42px;border-radius:50%;border:1px solid color-mix(in srgb,var(--t2) 35%,transparent);background:color-mix(in srgb,var(--bg0) 55%,transparent);color:var(--t1);font-size:18px;cursor:pointer;z-index:3}
#memoria .mm-x:hover{background:color-mix(in srgb,var(--t1) 15%,transparent)}
#memoria .mm-text{position:absolute;left:0;right:0;bottom:max(26px,6vh);padding:0 22px;text-align:center;color:var(--t1);z-index:2;pointer-events:none}
#memoria .mm-text>*{opacity:0;transform:translateY(16px);transition:opacity 1s,transform 1s}
#memoria.show .mm-text>*{opacity:1;transform:none;pointer-events:auto}
#memoria.show .mm-text>:nth-child(2){transition-delay:.25s}
#memoria.show .mm-text>:nth-child(3){transition-delay:.5s}
#memoria.show .mm-text>:nth-child(4){transition-delay:.75s}
#memoria.show .mm-text>:nth-child(5){transition-delay:1s}
#memoria .mm-eye{font:12px/1.4 var(--mono,monospace);letter-spacing:.32em;text-transform:uppercase;color:var(--t2);margin:0 0 8px}
#memoria h2{font:400 clamp(30px,6vw,60px)/1.05 var(--serif,serif);margin:0 0 10px;text-shadow:0 0 40px var(--ac),0 0 90px var(--bg1)}
#memoria .mm-sub{max-width:560px;margin:0 auto 14px;font:16px/1.55 var(--sans,sans-serif);color:var(--t1)}
#memoria .mm-names{display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;margin:0 auto 16px;max-width:780px}
#memoria .mm-names span{font:12px var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border:1px solid var(--c);border-radius:99px;color:var(--c);box-shadow:0 0 14px color-mix(in srgb,var(--c) 45%,transparent)}
#memoria .mm-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
#memoria .mm-btns button{font:13px var(--mono,monospace);letter-spacing:.1em;padding:11px 22px;color:var(--t1);background:color-mix(in srgb,var(--ac) 18%,transparent);border:1px solid var(--ac);border-radius:99px;cursor:pointer;box-shadow:0 0 24px color-mix(in srgb,var(--ac) 45%,transparent)}
#memoria .mm-btns button:hover{background:color-mix(in srgb,var(--ac) 40%,transparent)}
#memoria .mm-btns button.alt{background:transparent;border-color:color-mix(in srgb,var(--t2) 40%,transparent);box-shadow:none}
/* Recompensa que se queda en la página */
#chip.done{box-shadow:0 0 22px var(--ac),0 0 44px color-mix(in srgb,var(--t2) 50%,transparent);animation:mmChip 2.6s ease-in-out infinite;cursor:pointer}
@keyframes mmChip{50%{box-shadow:0 0 30px var(--t2),0 0 60px color-mix(in srgb,var(--ac) 70%,transparent)}}
body.memoria .cc .cf{animation:mmCard 4.5s ease-in-out infinite}
@keyframes mmCard{50%{box-shadow:0 0 30px color-mix(in srgb,var(--ac) 60%,transparent)}}
@media(prefers-reduced-motion:reduce){body.memoria .cc .cf,#chip.done{animation:none}}
`;

/* El CSS se añade al cargar el módulo para que la recompensa (chip dorado, tarjetas con brillo) también se vea al recargar */
function injectCss() {
  if (document.getElementById('memoria-css')) return;
  const st = document.createElement('style'); st.id = 'memoria-css'; st.textContent = CSS; document.head.appendChild(st);
}
injectCss();

function chime(vol) { // arpegio de ocho notas y un acorde al florecer (WebAudio, sin archivos)
  try {
    const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
    const master = ac.createGain(); master.gain.value = clamp(vol, 0, 1) * .17; master.connect(ac.destination);
    const note = (f, at, dur, type, g) => {
      const o = ac.createOscillator(), e = ac.createGain(), t0 = ac.currentTime + at;
      o.type = type; o.frequency.value = f;
      e.gain.setValueAtTime(0, t0); e.gain.linearRampToValueAtTime(g, t0 + .03); e.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      o.connect(e); e.connect(master); o.start(t0); o.stop(t0 + dur + .1);
    };
    [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25].forEach((f, i) => note(f, T_APPEAR(i), 1.8, 'sine', .9));
    [261.63, 329.63, 392, 523.25, 659.25].forEach(f => note(f, T_BLOOM, 3.4, 'triangle', .55));
    note(130.81, T_BLOOM, 3.8, 'sine', 1);
    return ac;
  } catch (e) { return null; }
}

/* opts.volume: función que devuelve el volumen de la página (0..1) · opts.onClose: se llama al cerrar */
export function playMemoria(opts = {}) {
  if (memoriaVista() || document.getElementById('memoria')) return;
  marcarMemoriaCompletada();
  injectCss();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const root = document.createElement('div');
  root.id = 'memoria'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Memoria completa');
  root.innerHTML = `<canvas></canvas><button class="mm-x" aria-label="Cerrar">✕</button>
    <div class="mm-text">
      <p class="mm-eye">Memoria completa · 7 / 7 notas</p>
      <h2>Las ocho semillas despiertan</h2>
      <p class="mm-sub">Reuniste cada recuerdo que el museo había olvidado. La Fractura te reconoce, y la flor ya sabe tu nombre.</p>
      <div class="mm-names">${SEEDS.map(([n, c]) => `<span style="--c:${c}">${n}</span>`).join('')}</div>
      <div class="mm-btns"><button data-go>Cruzar la puerta ✦</button><button class="alt" data-close>Seguir explorando</button></div>
    </div>`;
  document.body.appendChild(root);
  requestAnimationFrame(() => root.classList.add('on'));

  const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
  let W = 0, H = 0, u = 1, fu = 1, CY = 0;
  const resize = () => {
    const d = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight; u = clamp(Math.min(W, H * 1.15) / 700, .55, 1.3);
    /* la flor ocupa el espacio libre sobre el texto: nunca se superponen */
    const th = root.querySelector('.mm-text').offsetHeight + Math.max(26, H * .06) + 16;
    CY = Math.max(110, (H - th) / 2); fu = clamp(Math.min(u, (CY - 24) / 170), .35, 1.3);
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  resize(); addEventListener('resize', resize);

  const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .3, p: Math.random() * 6 }));
  const parts = [];
  let flash = 0, bloomed = false, rings = [], raf = 0, start = 0, t = 0, closed = false;
  const ac = chime(opts.volume ? opts.volume() : 1);

  const cx = () => W / 2, cy = () => CY;
  const burst = n => {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, sp = 140 + Math.random() * 460 * u;
      parts.push({ x: cx(), y: cy(), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, g: 170, life: 0, max: 2.6 + Math.random() * 2.6, s: (5 + Math.random() * 9) * u,
        rot: Math.random() * 6, vr: (Math.random() - .5) * 7, c: SEEDS[(Math.random() * 8) | 0][1], petal: Math.random() < .65 });
    }
  };
  const rain = dt => { // pétalos que caen suavemente tras florecer
    if (Math.random() < dt * 16) parts.push({ x: Math.random() * W, y: -12, vx: (Math.random() - .5) * 30, vy: 40 + Math.random() * 60, g: 6, life: 0, max: 9, s: (4 + Math.random() * 7) * u,
      rot: Math.random() * 6, vr: (Math.random() - .5) * 3, c: SEEDS[(Math.random() * 8) | 0][1], petal: true, sway: Math.random() * 6 });
  };

  function drawSeed(i, ang, rad, s, fade) {
    const [name, col] = SEEDS[i], x = cx() + Math.cos(ang) * rad, y = cy() + Math.sin(ang) * rad;
    const pulse = 1 + .12 * Math.sin(t * 3 + i);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 52 * u * s * pulse);
    g.addColorStop(0, col + 'ff'); g.addColorStop(.25, col + 'aa'); g.addColorStop(1, col + '00');
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 52 * u * s * pulse, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = THEME_LIGHT; ctx.globalAlpha = fade;
    ctx.beginPath(); ctx.arc(x, y, 7 * u * s, 0, 7); ctx.fill();
    if (fade > .05 && t < T_GATHER) { // nombre bajo la semilla
      ctx.globalAlpha = fade * .85; ctx.fillStyle = THEME_LIGHT; ctx.font = `${Math.round(12 * u + 1)}px monospace`; ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), x, y + 40 * u);
    }
    ctx.globalAlpha = 1;
  }

  function drawFlower(k) {
    const x = cx(), y = cy(), L = 150 * fu * k, w = 54 * fu * k, rot = t * .25;
    ctx.save(); ctx.translate(x, y);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 260 * fu * k);
    halo.addColorStop(0, `rgba(${THEME_ACCENT_RGB},.55)`); halo.addColorStop(1, `rgba(${THEME_ACCENT_RGB},0)`);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, 260 * fu * k, 0, 7); ctx.fill();
    SEEDS.forEach(([, col], i) => {
      ctx.save(); ctx.rotate(rot + i * Math.PI / 4 + Math.sin(t * 1.3 + i) * .03);
      const g = ctx.createLinearGradient(0, 0, 0, -L); g.addColorStop(0, THEME_LIGHT + 'cc'); g.addColorStop(.35, col + 'dd'); g.addColorStop(1, col + '55');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -L * .55, w, L * .5, 0, 0, 7); ctx.fill(); ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';
    const c = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * fu * k * (1 + .1 * Math.sin(t * 4)));
    c.addColorStop(0, THEME_LIGHT); c.addColorStop(.5, THEME_LIGHT); c.addColorStop(1, THEME_ACCENT);
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 30 * fu * k, 0, 7); ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (closed) return;
    if (!start) start = now;
    const el = (now - start) / 1000, dt = Math.min(.05, el - t); t = el; // reloj real: la secuencia dura lo mismo aunque el equipo vaya lento
    ctx.clearRect(0, 0, W, H);

    stars.forEach(s => { // fondo estrellado
      ctx.globalAlpha = (.25 + .5 * Math.abs(Math.sin(t * .8 + s.p))) * clamp(t / 1.2);
      ctx.fillStyle = THEME_LIGHT; ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
    });
    ctx.globalAlpha = 1;

    const ringR = Math.min(W * .4, CY - 36, 250 * u + 60);
    const gk = clamp((t - T_GATHER) / (T_BLOOM - T_GATHER)), ge = easeInOut(gk);
    SEEDS.forEach((_, i) => {
      const a0 = clamp((t - T_APPEAR(i)) / .6); if (a0 <= 0) return;
      const s = easeOutBack(a0);
      const ang = i / 8 * Math.PI * 2 - Math.PI / 2 + t * .32 + gk * gk * 9;
      const rad = ringR * (1 - ge) * (a0 < 1 ? easeInOut(a0) * .4 + .6 : 1);
      if (t < T_BLOOM - .15) {
        if (t < T_GATHER) { // rayo desde el centro hasta la semilla
          ctx.globalAlpha = .22 * a0; ctx.strokeStyle = SEEDS[i][1]; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(cx(), cy()); ctx.lineTo(cx() + Math.cos(ang) * rad, cy() + Math.sin(ang) * rad); ctx.stroke(); ctx.globalAlpha = 1;
        }
        drawSeed(i, ang, rad, s, 1 - clamp((t - (T_BLOOM - .5)) / .35));
      }
      if (a0 < 1) { // onda al aparecer
        const wv = a0; ctx.globalAlpha = (1 - wv) * .7; ctx.strokeStyle = SEEDS[i][1]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx() + Math.cos(ang) * rad, cy() + Math.sin(ang) * rad, 10 * u + wv * 90 * u, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      }
    });

    if (t > T_BLOOM - .6) drawFlower(easeOutBack(clamp((t - (T_BLOOM - .6)) / 1.5)));

    if (!bloomed && t >= T_BLOOM) {
      bloomed = true; flash = reduce ? .25 : 1; burst(190);
      rings.push(0, .15, .3);
      root.classList.add('show');
      setTimeout(() => { const b = root.querySelector('[data-go]'); b && b.focus({ preventScroll: true }); }, 900);
    }
    if (bloomed) rain(dt);
    rings = rings.map(r => r + dt * .9).filter(r => r < 1.2);
    rings.forEach(r => {
      if (r < 0) return;
      ctx.globalAlpha = clamp(1 - r) * .8; ctx.strokeStyle = THEME_LIGHT; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx(), cy(), r * Math.max(W, H) * .75, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    });

    for (let k = parts.length - 1; k >= 0; k--) {
      const p = parts[k]; p.life += dt;
      if (p.life > p.max || p.y > H + 30) { parts.splice(k, 1); continue; }
      p.vy += p.g * dt; p.vx *= (1 - dt * (p.sway === undefined ? .6 : 0)); p.x += p.vx * dt + (p.sway !== undefined ? Math.sin(t * 1.5 + p.sway) * 20 * dt : 0); p.y += p.vy * dt; p.rot += p.vr * dt;
      ctx.globalAlpha = clamp(1 - p.life / p.max) * .95; ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.petal) { ctx.beginPath(); ctx.ellipse(0, 0, p.s * .55, p.s, 0, 0, 7); ctx.fill(); } else { ctx.fillRect(-p.s / 4, -p.s / 4, p.s / 2, p.s / 2); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    if (flash > 0) { ctx.fillStyle = `rgba(${THEME_LIGHT_RGB},${flash})`; ctx.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 1.6); }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function close(goTop) {
    if (closed) return; closed = true;
    cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('keydown', onKey);
    root.classList.remove('on');
    setTimeout(() => { root.remove(); try { ac && ac.close(); } catch (e) {} }, 900);
    document.body.classList.add('memoria');
    if (goTop) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (opts.onClose) opts.onClose();
  }
  const onKey = e => { if (e.key === 'Escape') close(false); };
  addEventListener('keydown', onKey);
  root.querySelector('.mm-x').onclick = () => close(false);
  root.querySelector('[data-close]').onclick = () => close(false);
  root.querySelector('[data-go]').onclick = () => close(true);
}