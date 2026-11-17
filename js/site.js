/* SITIO: portada viva, secciones, cartas 3D, expedientes, secretos y notas escondidas. */
import { $ } from './utils.js';
import { S } from './state.js';
import { W } from './world/index.js';
import { Aud } from './audio/index.js';

const $$ = s => [...document.querySelectorAll(s)];
const NOTES = {
  n1: ['Anotación de la Dra. Marlowe: el museo no aparece en los mapas porque no está en el espacio. Está en lo que dejamos de decir.', 'El punto del logotipo'],
  n2: ['Rythden: los pétalos caen hacia arriba cuando alguien está a punto de recordar.', 'Un pétalo que no cayó'],
  n3: ['Si subrayaste lo que nadie quería leer, el archivo ya te cuenta como testigo.', 'Tinta invisible'],
  n4: ['Los glifos de Deileanna no se leen: se escuchan. Prueba con audífonos.', 'Glifo bajo la luz'],
  n5: ['Naxaly dobla el tiempo, pero no puede devolverlo. Úsalo para escuchar, no para huir.', 'Expediente 5'],
  n6: ['Cada ciclo, otra puerta. Cada puerta, otra flor. Esta vez, ¿para quién?', 'Al final de la página'],
  n7: ['Adrián: las encontraste todas. No sé quién eres, pero la flor ya sabe tu nombre. Sube y cruza la puerta.', 'La séptima nota']
};
/* Contenido provisional: edítalo aquí */
const CHARS = [
  ['Adrián', 'Quien recibe la flor', 'ᚨᛞᚱ', 'Vive atrapado en una rutina hasta que una flor fucsia y una carta lo llevan al museo.', 'Detalle: la carta que vuelve a aparecer'],
  ['Rythden', 'Guía del anclaje', 'ᚱᚣᚦ', 'Sabe más del museo de lo que Adrián imagina. Lorem ipsum dolor sit amet.', 'Detalle: provisional'],
  ['Dra. Selene Marlowe', 'Guardiana de archivos', 'ᛊᛖᛚ', 'Junto a Rythden explica el anclaje que protege las semillas de Sael Vantorin.', 'Detalle: provisional'],
  ['Nyxa', 'La que habita entre sombras', 'ᚾᚣᛉᚨ', 'Resonante envuelta en sombras que se mueven por voluntad propia.', 'Detalle: susurros entre las sombras'],
  ['Naxaly', 'Recuerdo en una vitrina', 'ᚾᚨᚲ', 'Su recuerdo guarda una vitrina del museo. Más adelante podrá manipular el tiempo.', 'Detalle: provisional']
];
const EPS = [
  ['La flor y la carta', 'Adrián rompe su rutina y cruza las puertas del museo.'],
  ['La Resonancia', 'Las vitrinas respiran: no guardan objetos, guardan personas.'],
  ['Rythden y Selene', 'El museo es un anclaje. Nace un equipo con un mismo fin.'],
  ['La Fractura', 'Absorbe las salas y borra la memoria. Hay que estabilizar las voces.'],
  ['Un camino hacia la verdad', 'Sincronizar los archivos para ganar tiempo y descubrir qué es La Fractura.'],
  ['La liberación', 'Elegir qué dejar atrás. Otra flor aparece en otra puerta.']
];
const TABS = ['Lorem ipsum: las ruinas de Deileanna, origen de los glifos que decoran cada expediente.', 'Lorem ipsum: las semillas de Sael Vantorin, protegidas por el anclaje que es el museo.', 'Lorem ipsum: el Pulso, lo que late bajo la Resonancia y une a todos los resonantes.'];

let found = [];
try { found = JSON.parse(localStorage.getItem('ecos-notas') || '[]'); } catch (e) {}
const chip = () => { $('#chip').hidden = !found.length; $('#cc').textContent = found.length; };
function openNote(id) {
  if (!NOTES[id]) return;
  if (!found.includes(id)) { found.push(id); try { localStorage.setItem('ecos-notas', JSON.stringify(found)); } catch (e) {} }
  $('#nt').textContent = NOTES[id][0]; $('#nf').textContent = NOTES[id][1] + ' · ' + found.length + '/7';
  $('#note').hidden = false; chip();
}
function closeNote() {
  $('#note').hidden = true;
  if (found.filter(n => n !== 'n7').length === 6 && !found.includes('n7')) setTimeout(() => openNote('n7'), 500);
}

export function initSite() {
    /* Botón Jugar: lleva al juego y, si está en la portada, lo inicia */
  $('#play').addEventListener('click', e => {
    e.preventDefault();
    $('#game').scrollIntoView({ behavior: 'smooth' });
    if ($('#intro').classList.contains('on')) $('#go').click();
  });
  /* Portada: luciérnagas y parallax con el mouse / giroscopio táctil */
  $('.ff').innerHTML = Array.from({ length: 16 }, () => `<i style="--x:${Math.random() * 100}%;--y:${40 + Math.random() * 55}%;--d:${4 + Math.random() * 6}s;--dx:${Math.random() * 60 - 30}px"></i>`).join('');
  const layers = $$('.sc .l');
  const move = (x, y) => layers.forEach(l => { l.style.setProperty('--k', (+l.dataset.d || 10) / 10); l.style.setProperty('--px', x * -6 + 'px'); l.style.setProperty('--py', y * -3 + 'px'); });
  $('#game').addEventListener('pointermove', e => { const r = $('#game').getBoundingClientRect(); move((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); });

  /* Aparición al desplazar + parallax por scroll + navegación activa */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  const sp = () => $$('[data-speed]').forEach(el => { const r = el.getBoundingClientRect(); el.style.translate = `0 ${(r.top - innerHeight / 2) * el.dataset.speed}px`; });
  addEventListener('scroll', () => { requestAnimationFrame(sp); }, { passive: true });
  const nav = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('#nav .lk a').forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id)); }), { threshold: .35 });
  $$('.sec').forEach(s => nav.observe(s));

  /* 02 pestañas de descubrimiento progresivo */
  const tab = k => { $$('.tabs button').forEach((b, i) => b.classList.toggle('on', i === k)); $('#tabtx').style.opacity = 0; setTimeout(() => { $('#tabtx').textContent = TABS[k]; $('#tabtx').style.opacity = 1; }, 200); };
  $$('.tabs button').forEach((b, i) => b.onclick = () => tab(i)); tab(0);

  /* 03 cartas: volteo (clic / toque / teclado) y brillo que sigue al puntero */
  $$('.cc').forEach(c => {
    const flip = () => { $$('.cc').forEach(o => o !== c && o.classList.remove('sel2')); c.classList.toggle('fl'); c.classList.add('sel2'); };
    c.onclick = e => { if (!e.target.closest('[data-note]')) flip(); }; c.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    c.onpointermove = e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      if (e.pointerType === 'mouse') c.style.transform = `rotateX(${(.5 - y) * 12}deg) rotateY(${(x - .5) * 14}deg)`;
    };
    c.onpointerleave = () => { c.style.transform = ''; };
  });

  /* 04 expedientes: luz, expansión y espacio para el audio */
  $$('.ep').forEach(c => {
    const t = () => { const o = c.classList.toggle('open'); c.setAttribute('aria-expanded', o); };
    c.onclick = e => { if (!e.target.closest('button,[data-note]')) t(); }; c.onkeydown = e => { if (e.key === 'Enter') t(); };
    c.onpointermove = e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); };
  });
  $$('.rv').forEach(el => io.observe(el));

  /* Piezas de historia repartidas por la página */
  const env = $('#env'), tg = () => env.setAttribute('aria-expanded', env.getAttribute('aria-expanded') !== 'true');
  env.onclick = tg; env.onkeydown = e => { if (e.key === 'Enter') tg(); };
  const ph = $('#pho'); ph.onclick = () => ph.classList.toggle('open'); ph.onkeydown = e => { if (e.key === 'Enter') ph.classList.toggle('open'); };
  $$('.rd').forEach(r => { r.onclick = () => r.classList.toggle('on'); r.onkeydown = e => { if (e.key === 'Enter') r.classList.toggle('on'); }; });
  const ty = $('#typ'); new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect(); let i = 0; const t = ty.dataset.t;
    const step = () => { ty.textContent = t.slice(0, ++i); if (i < t.length) setTimeout(step, 35); }; step();
  }, { threshold: .6 }).observe(ty);

  /* Susurros: textos que despiertan cuando la luz del cursor (o tu toque) se acerca */
  const wh = $$('.wh'), halo = $('#halo'); let mx = -999, my = -999;
  const prox = () => wh.forEach(w => { const r = w.getBoundingClientRect(); w.style.setProperty('--o', Math.max(0, 1 - Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) / 200).toFixed(2)); });
  const aim = e => { mx = e.clientX; my = e.clientY; halo.style.setProperty('--hx', mx + 'px'); halo.style.setProperty('--hy', my + 'px'); requestAnimationFrame(prox); };
  addEventListener('pointermove', aim); addEventListener('pointerdown', aim); addEventListener('scroll', () => requestAnimationFrame(prox), { passive: true });
  new IntersectionObserver(([e]) => document.body.classList.toggle('ingame', e.isIntersecting), { threshold: .6 }).observe($('#game'));

  /* El juego se pausa y se silencia al salir de él */
  new IntersectionObserver(([e]) => { W.visible = e.isIntersecting; Aud.mute(!e.isIntersecting || S.muted); }, { threshold: .05 }).observe($('#game'));

  window.__ecos = 1;

    /* Audios de los personajes: suena el de la carta tocada, uno a la vez */
  let cur = null, curBtn = null;
  const stopAud = () => { if (cur) { cur.pause(); curBtn.textContent = '▶ Escuchar'; cur = curBtn = null; } };
  document.addEventListener('click', e => {
    const b = e.target.closest('.pl'); if (!b) return;
    e.stopPropagation();
    const same = curBtn === b; stopAud(); if (same) return;
    cur = new Audio(encodeURI(b.dataset.audio)); curBtn = b;
    cur.onended = stopAud;
    cur.onerror = () => { b.textContent = 'Audio no disponible'; cur = curBtn = null; };
    cur.play().then(() => { b.textContent = '❚❚ Pausar'; }).catch(() => { b.textContent = 'Audio no disponible'; cur = curBtn = null; });
  }, true);
  document.addEventListener('keydown', e => { if (e.target.closest && e.target.closest('.pl')) e.stopPropagation(); }, true);

    /* Título: reinicia la página y vuelve a la portada */
  $('#nav .logo').title = 'Volver a la portada';
  $('#nav .logo').addEventListener('click', e => {
    e.preventDefault();
    history.replaceState(null, '', location.pathname);
    scrollTo(0, 0);
    location.reload();
  });

  /* Equipo: tocar o Enter muestra la foto completa (en móvil) */
  $$('.tm').forEach(c => {
    const t = () => c.classList.toggle('on');
    c.onclick = e => { if (!e.target.closest('a')) t(); };
    c.onkeydown = e => { if (e.key === 'Enter') t(); };
  });

  /* Notas escondidas */
  document.addEventListener('click', e => { const t = e.target.closest('[data-note]'); if (t) { e.preventDefault(); openNote(t.dataset.note); } });
  document.addEventListener('selectionchange', () => { const s = getSelection(); if (s.rangeCount && !s.isCollapsed && s.containsNode($('#n3'), true)) openNote('n3'); });
  $('#nx').onclick = closeNote; addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#note').hidden) closeNote(); });
  $('#chip').onclick = () => openNote(found[found.length - 1]);
  chip(); sp();
  console.log('%c✿ Hay 7 notas escondidas en esta página.', 'color:#c46a9a');
}
