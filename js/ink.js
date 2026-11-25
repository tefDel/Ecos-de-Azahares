/* Hilo de tinta: nace bajo "el museo continúa abajo" y, siguiendo el scroll,
   baja por el margen izquierdo tocando la etiqueta de cada sección hasta la
   última. Al empezar, el aviso se deshace en partículas de luz.
   Script independiente (sin módulos): funciona igual con file:// y con servidor. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var cue = document.querySelector('#intro .cue');
  var intro = document.getElementById('intro');
  var marks = Array.prototype.slice.call(document.querySelectorAll('.sec .eye'));
  if (!cue || !intro || !marks.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- el aviso se vuelve polvo de luz ---------- */
  (function splitCue() {
    var text = cue.textContent.trim(), i = 0;
    cue.setAttribute('aria-label', text);
    cue.textContent = '';
    text.split(' ').forEach(function (word, w) {
      if (w) cue.appendChild(document.createTextNode(' '));
      var wrap = document.createElement('span');
      wrap.className = 'cue-w';
      wrap.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(word, function (ch) {
        var s = document.createElement('span');
        s.className = 'cue-ch';
        s.textContent = ch;
        // cada letra sube y se desvía un poco distinto, como polen al viento
        s.style.setProperty('--i', i++);
        s.style.setProperty('--dx', (Math.random() * 36 - 18).toFixed(1) + 'px');
        s.style.setProperty('--dy', (-24 - Math.random() * 46).toFixed(1) + 'px');
        s.style.setProperty('--r', (Math.random() * 70 - 35).toFixed(0) + 'deg');
        wrap.appendChild(s);
      });
      cue.appendChild(wrap);
    });
  })();

  /* ---------- la frase final, letra por letra ---------- */
  var phrase = document.querySelector('.ink-phrase');
  var phraseT = phrase && phrase.querySelector('.ink-phrase-t');
  if (phraseT) {
    var txt = phraseT.textContent, n = 0;
    phraseT.textContent = '';
    txt.split(' ').forEach(function (word, w) {
      if (w) phraseT.appendChild(document.createTextNode(' '));
      var wrap = document.createElement('span');
      wrap.className = 'ip-w';
      wrap.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(word, function (ch) {
        var s = document.createElement('span');
        s.className = 'ip-ch';
        s.textContent = ch;
        s.style.setProperty('--i', n++);
        wrap.appendChild(s);
      });
      phraseT.appendChild(wrap);
    });
  }
  var written = false;
  function writePhrase(on) {
    if (!phrase || on === written) return;
    written = on;
    phrase.classList.toggle('write', on);
    if (!on || reduce) return;
    // destellos que se desprenden de la tinta mientras se escribe
    var box = document.createElement('span');
    box.className = 'ip-sparks';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 18; i++) {
      var sp = document.createElement('i');
      sp.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
      sp.style.setProperty('--y', (30 + Math.random() * 50).toFixed(1) + '%');
      sp.style.setProperty('--dx', (Math.random() * 40 - 20).toFixed(1) + 'px');
      sp.style.setProperty('--dy', (-30 - Math.random() * 50).toFixed(1) + 'px');
      sp.style.setProperty('--d', (0.2 + Math.random() * 1.6).toFixed(2) + 's');
      sp.style.setProperty('--s', (1.5 + Math.random() * 2.5).toFixed(1) + 'px');
      box.appendChild(sp);
    }
    phraseT.appendChild(box);
    setTimeout(function () { box.remove(); }, 4200);
  }

  /* ---------- SVG del hilo ---------- */
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  var svg = el('svg', { id: 'ink', 'aria-hidden': 'true', focusable: 'false' });
  var defs = el('defs', {}, svg);
  var grad = el('linearGradient', { id: 'inkGrad', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': '#B98EA6', 'stop-opacity': '.2' }, grad);
  el('stop', { offset: '.04', 'stop-color': '#B98EA6', 'stop-opacity': '.8' }, grad);
  el('stop', { offset: '.5', 'stop-color': '#a0698a', 'stop-opacity': '.85' }, grad);
  el('stop', { offset: '1', 'stop-color': '#864269', 'stop-opacity': '.9' }, grad);
  // Halo suave de la gota, para que se lea húmeda y no como un punto duro
  var soft = el('filter', { id: 'inkSoft', x: '-100%', y: '-100%', width: '300%', height: '300%' }, defs);
  el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '2.2', result: 'b' }, soft);
  var m = el('feMerge', {}, soft);
  el('feMergeNode', { in: 'b' }, m);
  el('feMergeNode', { in: 'SourceGraphic' }, m);

  var glow = el('path', { class: 'ink-glow' }, svg);
  var line = el('path', { class: 'ink-line', stroke: 'url(#inkGrad)' }, svg);
  var drop = el('ellipse', { class: 'ink-drop', rx: 2.6, ry: 3.4, filter: 'url(#inkSoft)' }, svg);
  document.body.appendChild(svg);

  var len = 0, startY = 0, endY = 0, shown = 0, goal = 0, raf = 0;

  // Posición de maqueta (ignora transforms: el vaivén del aviso y la
  // animación de entrada de las etiquetas no deben mover el camino)
  function docRect(node) {
    var x = 0, y = 0, n = node;
    while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y, w: node.offsetWidth, h: node.offsetHeight };
  }

  function f(n) { return n.toFixed(1); }

  // Final de contenido de una sección (sin su relleno inferior): desde ahí
  // hasta la etiqueta siguiente hay una franja libre de todo el ancho.
  function contentBottom(sec) {
    var r = docRect(sec);
    return r.y + r.h - (parseFloat(getComputedStyle(sec).paddingBottom) || 0);
  }

  // Camino: S suave desde el aviso hasta la primera etiqueta; dentro de cada
  // sección baja ondulando por el margen izquierdo y, en la franja libre entre
  // secciones, cruza en una gran S hasta el margen derecho y vuelve a la
  // siguiente etiqueta. Al final cruza hacia el pie y llega a la frase.
  function build() {
    var W = document.documentElement.clientWidth;
    var c = docRect(cue);
    var x0 = c.x + c.w / 2, y0 = c.y + c.h + 10;
    var pts = marks.map(function (mk) {
      var r = docRect(mk);
      return { x: Math.max(12, r.x - 20), y: r.y + r.h / 2, sec: mk.closest('.sec') };
    });
    var pr = phraseT ? docRect(phraseT) : null;
    var fin = pr ? { x: pr.x - 16, y: pr.y + pr.h * 0.55, sec: null } : null;

    var p = pts[0], dy = p.y - y0, sway = Math.min(W * 0.09, 90);
    var d = 'M' + f(x0) + ' ' + f(y0) +
      ' C' + f(x0) + ' ' + f(y0 + dy * 0.18) + ' ' + f(x0 + sway) + ' ' + f(y0 + dy * 0.22) + ' ' + f(x0 + sway * 0.6) + ' ' + f(y0 + dy * 0.38) +
      ' S' + f(x0 - sway * 1.4) + ' ' + f(y0 + dy * 0.56) + ' ' + f((x0 + p.x) / 2) + ' ' + f(y0 + dy * 0.72) +
      ' S' + f(p.x) + ' ' + f(p.y - dy * 0.12) + ' ' + f(p.x) + ' ' + f(p.y);

    // descenso ondulado por un margen, con amplitud que no invade el contenido
    function descend(x, ya0, yb0, seed) {
      var h = yb0 - ya0;
      if (h < 4) return;
      var amp = Math.max(6, Math.min(x - 8, 34));
      var waves = Math.max(1, Math.round(h / 700));
      for (var k = 0; k < waves; k++) {
        var ya = ya0 + h * k / waves, yb = ya0 + h * (k + 1) / waves, hh = yb - ya;
        var xm = Math.max(6, x + amp * ((k + seed) % 2 ? 1 : -1));
        d += ' C' + f(x) + ' ' + f(ya + hh * 0.22) + ' ' + f(xm) + ' ' + f(ya + hh * 0.2) + ' ' + f(xm) + ' ' + f(ya + hh * 0.5) +
          ' S' + f(x) + ' ' + f(yb - hh * 0.22) + ' ' + f(x) + ' ' + f(yb);
      }
    }

    // gran S por la franja libre: margen izquierdo → margen derecho → destino
    function sweep(xa, ya, b) {
      var rx = W - xa, bh = b.y - ya, ym = ya + bh * 0.45;
      d += ' C' + f(xa) + ' ' + f(ya + (ym - ya) * 0.6) + ' ' + f(rx) + ' ' + f(ym - (ym - ya) * 0.6) + ' ' + f(rx) + ' ' + f(ym) +
        ' C' + f(rx) + ' ' + f(ym + (b.y - ym) * 0.6) + ' ' + f(b.x) + ' ' + f(b.y - (b.y - ym) * 0.6) + ' ' + f(b.x) + ' ' + f(b.y);
    }

    var stops = fin ? pts.concat([fin]) : pts;
    for (var i = 1; i < stops.length; i++) {
      var a = stops[i - 1], b = stops[i];
      var band = Math.min(Math.max(contentBottom(a.sec), a.y + 60), b.y - 120);
      descend(a.x, a.y, band, i);
      sweep(a.x, band, b);
    }

    var last = stops[stops.length - 1];
    var H = Math.ceil(last.y + 40);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    glow.setAttribute('d', d);
    line.setAttribute('d', d);
    grad.setAttribute('y1', y0);
    grad.setAttribute('y2', last.y);
    len = line.getTotalLength();
    startY = y0; endY = last.y;
    [glow, line].forEach(function (pth) { pth.style.strokeDasharray = len + ' ' + len; });
    update();
    shown = Math.min(shown, len);
    paint();
  }

  // Longitud del trazo cuya punta está a la altura y (la curva siempre baja)
  function lengthAtY(y) {
    if (!len || y <= startY) return 0;
    if (y >= endY) return len;
    var lo = 0, hi = len;
    for (var i = 0; i < 24; i++) {
      var mid = (lo + hi) / 2;
      if (line.getPointAtLength(mid).y < y) lo = mid; else hi = mid;
    }
    return lo;
  }

  function update() {
    var vh = innerHeight, sy = scrollY;
    // La punta acompaña un punto a ~58% de la pantalla; al principio arranca
    // justo en el aviso para que el primer gesto de scroll ya suelte tinta.
    var ease = Math.max(0, 1 - sy / (vh * 0.5));
    var tip = sy + vh * 0.58 + (startY - vh * 0.58) * ease;
    var atBottom = sy + vh >= document.documentElement.scrollHeight - 4;
    goal = atBottom ? len : lengthAtY(tip);
    cue.classList.toggle('gone', sy > 8 && intro.classList.contains('on'));
    if (!raf) raf = requestAnimationFrame(tick);
  }

  var lastT = 0;
  function tick(t) {
    raf = 0;
    // suavizado por tiempo real: igual de fluido a 30, 60 o 120 fps
    var dt = lastT ? Math.min(250, t - lastT) : 16.7;
    lastT = t;
    shown += (goal - shown) * (reduce ? 1 : 1 - Math.pow(1 - 0.085, dt / 16.7));
    if (Math.abs(goal - shown) < 0.3) shown = goal;
    paint();
    if (shown !== goal) raf = requestAnimationFrame(tick);
    else lastT = 0;
  }

  function paint() {
    if (!len) return;
    var off = len - shown;
    line.style.strokeDashoffset = off;
    glow.style.strokeDashoffset = off;
    var p = line.getPointAtLength(Math.max(0, shown));
    var q = line.getPointAtLength(Math.max(0, shown - 4));
    var speed = Math.min(Math.abs(goal - shown) / 40, 1);
    var ang = Math.atan2(p.y - q.y, p.x - q.x) * 180 / Math.PI - 90;
    // En reposo la gota está redonda; al correr se alarga como tinta
    drop.setAttribute('cx', f(p.x));
    drop.setAttribute('cy', f(p.y));
    drop.setAttribute('ry', (3 + speed * 2.4).toFixed(2));
    drop.setAttribute('rx', (2.5 - speed * 0.5).toFixed(2));
    drop.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' ' + f(p.x) + ' ' + f(p.y) + ')');
    svg.classList.toggle('idle', shown < 0.5);
    svg.classList.toggle('done', shown >= len - 0.5);
    // la frase se escribe cuando la tinta llega; se borra si subes bastante
    if (shown >= len - 0.5) writePhrase(true);
    else if (shown < len - 260) writePhrase(false);
  }

  // Solo mientras se ve la portada (al entrar al juego, desaparece)
  function syncVisible() {
    svg.classList.toggle('off', !intro.classList.contains('on'));
    update();
  }
  new MutationObserver(syncVisible).observe(intro, { attributes: true, attributeFilter: ['class'] });
  syncVisible();

  addEventListener('scroll', update, { passive: true });
  var rt;
  function rebuild() { clearTimeout(rt); rt = setTimeout(build, 150); }
  addEventListener('resize', rebuild);
  if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
  addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
})();
