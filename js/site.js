/* SITIO: portada viva, secciones, cartas 3D, expedientes, secretos y notas escondidas. */
import { $ } from './utils.js';
import { S } from './state.js';
import { W } from './world/index.js';
import { Aud } from './audio/index.js';
import { CHARACTER_COLORS } from './data.js';
import { playMemoria, memoriaVista } from './memoria.js';

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
const NOTE_IDS = Object.keys(NOTES);
const FIRST_SIX_NOTE_IDS = NOTE_IDS.filter(id => id !== 'n7');
/* Contenido de referencia (las cartas se escriben en index.html): edítalo aquí */
const CHARS = [
  ['Adrián', 'Quien recibe la flor', 'ᚨᛞᚱ', 'Vive atrapado en una rutina hasta que una flor fucsia y una carta lo llevan al museo.', 'Detalle: la carta que vuelve a aparecer'],
  ['Rythden', 'Guía del anclaje', 'ᚱᚣᚦ', 'Sabe más del museo de lo que Adrián imagina: es una de las ocho semillas de Sael Vantorin y busca liberar a sus compañeros.', 'Detalle: busca liberar a los resonantes'],
  ['Dra. Selene Marlowe', 'Guardiana de archivos', 'ᛊᛖᛚ', 'Junto a Rythden explica el anclaje que protege las semillas de Sael Vantorin.', 'Detalle: investiga los archivos ancestrales'],
  ['Nyxa', 'La que habita entre sombras', 'ᚾᚣᛉᚨ', 'Resonante envuelta en sombras que se mueven por voluntad propia.', 'Detalle: susurros entre las sombras'],
  ['Naxaly', 'Recuerdo en una vitrina', 'ᚾᚨᚲ', 'Su recuerdo guarda una vitrina del museo. Más adelante podrá manipular el tiempo.', 'Detalle: una de las ocho semillas de Sael']
];
const EPS = [
  ['La flor y la carta', 'Adrián rompe su rutina y cruza las puertas del museo.'],
  ['La Resonancia', 'Las vitrinas respiran: no guardan objetos, guardan personas.'],
  ['Rythden y Selene', 'El museo es un anclaje. Nace un equipo con un mismo fin.'],
  ['La Fractura', 'Absorbe las salas y borra la memoria. Hay que estabilizar las voces.'],
  ['Un camino hacia la verdad', 'Sincronizar los archivos para ganar tiempo y descubrir qué es La Fractura.'],
  ['La liberación', 'Elegir qué dejar atrás. Otra flor aparece en otra puerta.']
];
const TABS = [
  'Deileanna es la civilización milenaria que canalizaba la Resonancia Primordial. De sus ruinas vienen los glifos que decoran cada expediente.',
  'Sael Vantorin se fragmentó en ocho semillas: Rythden, Nyxa, Tala, Volt, Kael, Lyra, Virena y Naxaly. El museo es el anclaje que las protege.',
  'El Pulso es el evento que fracturó Khaelos. Dejó los archivos de audio incompletos, las líneas temporales distorsionadas y una energía fucsia que corrompe los recuerdos.'
];

let found = [];
try {
  const saved = JSON.parse(localStorage.getItem('ecos-notas') || '[]');
  if (Array.isArray(saved)) {
    found = [...new Set(saved.filter(id => Object.prototype.hasOwnProperty.call(NOTES, id)))];
  }
} catch (error) {
  console.warn('No se pudieron leer las notas guardadas:', error);
}
const allNotesCollected = () => NOTE_IDS.every(id => found.includes(id));
const chip = () => {
  $('#chip').hidden = !found.length;
  $('#cc').textContent = found.length;
  $('#chip').classList.toggle('done', memoriaVista());
};
const saveNotes = () => {
  try { localStorage.setItem('ecos-notas', JSON.stringify(found)); }
  catch (error) { console.error('No se pudieron guardar las notas:', error); }
};
let stopPageAudio = () => {};
function openNote(id) {
  if (!NOTES[id]) return;
  if (!found.includes(id)) { found.push(id); saveNotes(); }
  $('#nt').textContent = NOTES[id][0]; $('#nf').textContent = NOTES[id][1] + ' · ' + found.length + '/7';
  $('#note').hidden = false; chip();
}
function closeNote() {
  if ($('#note').hidden) return;
  $('#note').hidden = true;
  if (FIRST_SIX_NOTE_IDS.every(id => found.includes(id)) && !found.includes('n7')) {
    setTimeout(() => openNote('n7'), 500);
    return;
  }
  if (allNotesCollected() && !memoriaVista()) {
    stopPageAudio();
    playMemoria({ volume: () => Number($('#page-volume').value) });
    chip();
  }
}

/* Botón de audio (.pl) sobre el que empezó la pulsación actual.
   Si la tarjeta se mueve entre pulsar y soltar, el clic llega al padre; con esto se sigue atribuyendo al botón. */
let plDown = null;

/* Controles internos de una tarjeta: nunca deben voltearla */
const CTRL = '.pl,[data-note],a,button';

export function initSite() {
  if (memoriaVista()) document.body.classList.add('memoria');
  const volumeControls = $$('.volume-control');
  const setVolumeControlOpen = (control, open) => {
    const toggle = control.querySelector('.volume-toggle');
    control.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Ocultar' : 'Mostrar'} ${toggle.dataset.volumeLabel}`);
  };
  volumeControls.forEach(control => {
    const toggle = control.querySelector('.volume-toggle');
    toggle.addEventListener('click', () => setVolumeControlOpen(control, !control.classList.contains('open')));
  });
  document.addEventListener('click', e => {
    volumeControls.forEach(control => {
      if (!control.contains(e.target)) setVolumeControlOpen(control, false);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const control = volumeControls.find(item => item.classList.contains('open') && item.contains(document.activeElement));
    if (!control) return;
    setVolumeControlOpen(control, false);
    control.querySelector('.volume-toggle').focus();
    e.stopPropagation();
  });

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

  /* Los botones de audio llevan su propia acción: ninguna tarjeta ni testimonio reacciona a ellos */
  addEventListener('pointerdown', e => { plDown = (e.target.closest && e.target.closest('.pl')) || null; }, true);

  /* 03 cartas: volteo (clic / toque / teclado) y brillo que sigue al puntero */
  $$('.cc').forEach(c => {
    const color = CHARACTER_COLORS[c.dataset.character];
    if (color) c.style.setProperty('--ac', color);
    const flip = () => { $$('.cc').forEach(o => o !== c && o.classList.remove('sel2')); c.classList.toggle('flipped'); c.classList.add('sel2'); c.style.transform = ''; };
    c.onclick = e => { if (plDown || e.target.closest(CTRL)) return; flip(); };
    c.onkeydown = e => { if (e.target.closest(CTRL)) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    c.onpointermove = e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      if (e.pointerType === 'mouse' && !c.classList.contains('flipped')) c.style.transform = `rotateX(${(.5 - y) * 12}deg) rotateY(${(x - .5) * 14}deg)`;
    };
    c.onpointerleave = () => { c.style.transform = ''; };
  });

  /* 04 expedientes: Cover Flow con scroll horizontal, rueda y gesto táctil */
  const eps = $('#eps'), epCards = $$('.ep');
  let coverFrame = 0, snapTimer = 0;
  const updateCoverFlow = () => {
    coverFrame = 0;
    const center = eps.scrollLeft + eps.clientWidth / 2;
    const cardWidth = epCards.length ? epCards[0].offsetWidth : eps.clientWidth;
    epCards.forEach(card => {
      const offset = (card.offsetLeft + card.offsetWidth / 2 - center) / cardWidth;
      const distance = Math.abs(offset);
      const shift = -Math.sign(offset) * Math.min(distance * .2, .36) * cardWidth;
      const active = distance < .15;
      card.style.setProperty('--cover-x', `${shift}px`);
      card.style.setProperty('--cover-z', `${-Math.min(420, distance * 150)}px`);
      card.style.setProperty('--cover-rotate', `${Math.max(-36, Math.min(36, offset * 18))}deg`);
      card.style.setProperty('--cover-scale', Math.max(.55, 1 - distance * .12));
      card.style.setProperty('--cover-blur', `${Math.min(9, distance * 2.2)}px`);
      card.style.setProperty('--cover-opacity', Math.max(.28, 1 - distance * .22));
      card.style.setProperty('--cover-order', Math.round(100 - Math.min(distance, 9) * 10));
      card.classList.toggle('is-active', active);
      if (active) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
  };
  const scheduleCoverFlow = () => {
    if (!coverFrame) coverFrame = requestAnimationFrame(updateCoverFlow);
  };
  const centerNearestEpisode = () => {
    const center = eps.scrollLeft + eps.clientWidth / 2;
    let nearest = null, nearestDistance = Infinity;
    epCards.forEach(card => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (distance < nearestDistance) { nearest = card; nearestDistance = distance; }
    });
    if (!nearest) return;
    const target = nearest.offsetLeft + nearest.offsetWidth / 2 - eps.clientWidth / 2;
    if (Math.abs(target - eps.scrollLeft) > 2) eps.scrollTo({ left: target, behavior: 'smooth' });
  };
  eps.addEventListener('scroll', () => {
    scheduleCoverFlow();
    clearTimeout(snapTimer);
    snapTimer = setTimeout(centerNearestEpisode, 150);
  }, { passive: true });
  eps.addEventListener('scrollend', () => {
    clearTimeout(snapTimer);
    centerNearestEpisode();
  });
  eps.addEventListener('wheel', e => {
    const maxScroll = eps.scrollWidth - eps.clientWidth;
    const delta = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? eps.clientWidth : 1);
    if (Math.abs(delta) <= Math.abs(e.deltaX)
      || (e.deltaY < 0 && eps.scrollLeft <= 1)
      || (e.deltaY > 0 && eps.scrollLeft >= maxScroll - 1)) return;
    e.preventDefault();
    eps.scrollLeft += delta;
  }, { passive: false });
  addEventListener('resize', scheduleCoverFlow);
  updateCoverFlow();
  epCards.forEach(c => {
    c.onpointermove = e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); };
  });
  $$('.rv').forEach(el => io.observe(el));

  /* Piezas de historia repartidas por la página */
  const env = $('#env'), tg = () => env.setAttribute('aria-expanded', env.getAttribute('aria-expanded') !== 'true');
  env.onclick = tg; env.onkeydown = e => { if (e.key === 'Enter') tg(); };
  const ph = $('#pho'); ph.onclick = () => ph.classList.toggle('open'); ph.onkeydown = e => { if (e.key === 'Enter') ph.classList.toggle('open'); };
  $$('.rd').forEach(r => {
    r.onclick = e => { if (plDown || e.target.closest('.pl')) return; r.classList.toggle('on'); };
    r.onkeydown = e => { if (e.target.closest('.pl')) return; if (e.key === 'Enter') r.classList.toggle('on'); };
  });
  const ty = $('#typ');
  const revealQuote = () => {
    if (ty.classList.contains('is-revealed')) return;
    ty.classList.add('is-revealed');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const particles = document.createElement('span');
    particles.className = 'typ-particles';
    particles.setAttribute('aria-hidden', 'true');
    particles.innerHTML = Array.from({ length: 12 }, () => {
      const size = 1.5 + Math.random() * 2;
      const duration = 1.2 + Math.random() * .7;
      const delay = Math.random() * .18;
      const opacity = .22 + Math.random() * .25;
      const drift = Math.random() * 38 - 19;
      const rise = 18 + Math.random() * 30;
      const x = Math.random() * 100;
      const y = Math.random() * 112 - 6;
      return `<i style="--size:${size}px;--duration:${duration}s;--delay:${delay}s;--opacity:${opacity};--drift:${drift}px;--rise:${rise}px;--x:${x}%;--y:${y}%"></i>`;
    }).join('');
    particles.addEventListener('animationend', event => {
      if (event.target.parentNode === particles) event.target.remove();
      if (!particles.firstElementChild) particles.remove();
    });
    ty.parentElement.append(particles);
  };
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    revealQuote();
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

  /* Audios de los personajes: suena el del botón tocado, uno a la vez */
  const pageVolume = $('#page-volume'), pageVolumeValue = $('#page-volume-value');
  let volume = Number(pageVolume.value), cur = null, curBtn = null, curUrl = null, playId = 0;
  const updatePageVolume = () => {
    volume = Number(pageVolume.value);
    pageVolumeValue.textContent = Math.round(volume * 100) + '%';
    pageVolume.style.setProperty('--volume-fill', `${volume * 100}%`);
    if (cur) cur.volume = volume;
  };
  pageVolume.addEventListener('input', updatePageVolume);
  updatePageVolume();
  const seekUI = button => {
    const card = button && button.closest('.ep');
    if (!card) return null;
    return {
      range: card.querySelector('.chapter-seek'),
      time: card.querySelector('.seek-time')
    };
  };
  const formatTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const value = Math.floor(seconds);
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };
  const syncSeek = (audio, button) => {
    const ui = seekUI(button);
    if (!ui || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const time = Math.min(audio.currentTime, audio.duration);
    ui.range.max = String(audio.duration);
    ui.range.value = String(time);
    ui.range.disabled = false;
    ui.range.style.setProperty('--seek-progress', `${time / audio.duration * 100}%`);
    ui.range.setAttribute('aria-valuetext', `${formatTime(time)} de ${formatTime(audio.duration)}`);
    ui.time.textContent = formatTime(time);
  };
  const resetSeek = button => {
    const ui = seekUI(button);
    if (!ui) return;
    ui.range.max = '1';
    ui.range.value = '0';
    ui.range.disabled = true;
    ui.range.style.setProperty('--seek-progress', '0%');
    ui.range.setAttribute('aria-valuetext', '00:00');
    ui.time.textContent = '00:00';
  };
  $$('.chapter-seek').forEach(range => {
    const button = range.closest('.ep').querySelector('.pl');
    range.addEventListener('input', () => {
      if (!cur || curBtn !== button || !Number.isFinite(cur.duration)) return;
      cur.currentTime = Number(range.value);
      syncSeek(cur, button);
    });
  });
  const stopAud = () => {
    playId++;
    if (cur) {
      cur.pause();
      cur.removeAttribute('src');
      cur.load();
    }
    if (curBtn) resetSeek(curBtn);
    if (curBtn) curBtn.textContent = curBtn.dataset.l || '▶ Escuchar';
    if (curUrl) URL.revokeObjectURL(curUrl);
    cur = curBtn = curUrl = null;
  };
  stopPageAudio = stopAud;
  $('#go').addEventListener('click', stopAud);
  $$('.pl').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    plDown = null;
    const same = curBtn === b; stopAud(); if (same) return;
    if (!b.dataset.audio) {
      b.textContent = 'Audio no configurado';
      return;
    }
    curBtn = b;
    b.removeAttribute('title');
    b.textContent = 'Cargando…';
    const id = playId, assetUrl = new URL(b.dataset.audio, location.href);
    const source = location.protocol === 'file:'
      ? fetch(assetUrl.href).then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.arrayBuffer();
      }).then(data => {
        if (id !== playId) return null;
        curUrl = URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }));
        return curUrl;
      }).catch(error => {
        console.warn('No se pudo leer el audio local como Blob; se probará la ruta directa:', assetUrl.href, error);
        return assetUrl.href;
      })
      : Promise.resolve(assetUrl.href);

    const unavailable = error => {
      console.error('No se pudo reproducir el audio:', assetUrl.href, error);
      b.textContent = 'Audio no disponible';
      if (location.protocol === 'file:') {
        b.title = 'Chrome puede bloquear audios locales al abrir el HTML directamente. Abre el proyecto con Live Server o Live Share.';
      }
    };

    source.then(src => {
      if (!src || id !== playId) return;
      const audio = cur = new Audio();
      audio.preload = 'auto';
      audio.volume = volume;
      audio.src = src;
      audio.onloadedmetadata = () => {
        if (id === playId && cur === audio) syncSeek(audio, b);
      };
      audio.ontimeupdate = () => {
        if (id === playId && cur === audio) syncSeek(audio, b);
      };
      audio.onended = () => { if (id === playId) stopAud(); };
      audio.onerror = () => {
        if (id !== playId || cur !== audio) return;
        unavailable(audio.error);
        resetSeek(b);
        cur = curBtn = null;
        if (curUrl) URL.revokeObjectURL(curUrl);
        curUrl = null;
      };
      return audio.play().then(() => {
        if (id === playId) b.textContent = '❚❚ Pausar';
      }).catch(error => {
        if (id !== playId || cur !== audio) return;
        unavailable(error);
        resetSeek(b);
        cur = curBtn = null;
        if (curUrl) URL.revokeObjectURL(curUrl);
        curUrl = null;
      });
    }).catch(error => {
      if (id !== playId) return;
      unavailable(error);
      resetSeek(b);
      curBtn = null;
    });
  }));

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

  /* Partículas del cursor: pétalos y chispas que suben y se desvanecen.
     Un solo canvas sin eventos; solo en mouse; se apaga con reducción de movimiento;
     no se dibuja dentro del juego ya iniciado. */
  (() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'), cx = cv.getContext('2d');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100';
    document.body.appendChild(cv);
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    const COL = ['134,66,105', '177,155,175', '228,219,224', '134,66,105'], P = [], MAX = 48;
    let lx = -99, ly = -99, raf = 0, last = 0;
    const loop = t => {
      const dt = Math.min(48, t - last) / 16.7; last = t;
      cx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i]; p.l -= dt;
        if (p.l <= 0) { P.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985;
        cx.fillStyle = `rgba(${p.c},${(Math.min(1, p.l / p.m) * .7).toFixed(2)})`;
        cx.beginPath();
        if (p.pt) cx.ellipse(p.x, p.y, p.r * 1.6, p.r * .9, p.rot, 0, 6.283); else cx.arc(p.x, p.y, p.r, 0, 6.283);
        cx.fill();
      }
      raf = P.length ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || document.hidden) return;
      if (document.body.classList.contains('ingame') && !$('#intro').classList.contains('on')) return;
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 26) return;
      lx = e.clientX; ly = e.clientY;
      if (P.length >= MAX) P.shift();
      const l = 55 + Math.random() * 40;
      P.push({ x: lx + Math.random() * 10 - 5, y: ly + Math.random() * 10 - 5, vx: Math.random() * .6 - .3, vy: -(.25 + Math.random() * .45), r: 1 + Math.random() * 1.6, c: COL[Math.random() * COL.length | 0], l, m: l, pt: Math.random() < .3, rot: Math.random() * 3 });
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }, { passive: true });
  })();

  /* Notas escondidas */
  document.addEventListener('click', e => { const t = e.target.closest('[data-note]'); if (t) { e.preventDefault(); openNote(t.dataset.note); } });
  document.addEventListener('selectionchange', () => { const s = getSelection(); if (s.rangeCount && !s.isCollapsed && s.containsNode($('#n3'), true)) openNote('n3'); });
  $('#nx').onclick = closeNote; addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#note').hidden) closeNote(); });
  $('#chip').onclick = () => openNote(found[found.length - 1]);
  chip(); sp();
  console.log('%c✿ Hay 7 notas escondidas en esta página.', 'color:#864269');
}