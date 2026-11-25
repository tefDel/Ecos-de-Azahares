/* Sonido del sitio:
   1) Música de fondo "Ecos del Olvido" en bucle. Se atenúa sola, con una
      transición suave, mientras suena cualquier otro audio (testimonios,
      capítulos, la memoria) o mientras se juega; luego vuelve.
   2) Retroalimentación auditiva sintetizada (Web Audio, sin archivos):
      clic, volteo de tarjeta, pista espacial, nota secreta, papel, pestañas.
   Script independiente (sin módulos): funciona con file:// y con servidor. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var intro = $('#intro');
  var slider = $('#page-volume');
  var pageVol = function () { return slider ? Number(slider.value) : 1; };

  /* ================= música de fondo ================= */
  var MUSIC_BASE = 0.3;      // volumen máximo de la música (sobre el volumen de la página)
  var DUCK = 0.07;           // fracción que queda cuando se atenúa
  var music = new Audio('audios/Ecos del Olvido.mp3');
  music.loop = true;
  music.preload = 'auto';
  music.volume = 0;
  music.__bg = true;

  // Cualquier otro audio HTML que suene (testimonios, capítulos…) atenúa la música
  var playing = new Set();
  var origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    var el = this;
    if (!el.__bg && !el.__duckWired) {
      el.__duckWired = true;
      var off = function () { playing.delete(el); };
      el.addEventListener('pause', off);
      el.addEventListener('ended', off);
      el.addEventListener('emptied', off);
      el.addEventListener('error', off);
      el.addEventListener('playing', function () { playing.add(el); });
    }
    if (!el.__bg) playing.add(el);
    var r = origPlay.apply(el, arguments);
    if (!el.__bg && r && r.catch) r.catch(function () { playing.delete(el); });
    return r;
  };

  function shouldDuck() {
    var gameOn = intro && !intro.classList.contains('on') && document.body.classList.contains('ingame');
    var memoria = !!document.getElementById('memoria');
    var other = false;
    playing.forEach(function (el) { if (!el.paused && !el.ended) other = true; else playing.delete(el); });
    return gameOn || memoria || other;
  }

  var started = false, trying = false, level = 0, entering = true;
  var GESTURES = ['pointerdown', 'keydown', 'touchstart', 'click', 'wheel', 'mousemove'];
  function startMusic() {
    if (started || trying) return;
    trying = true;
    var p = music.play();
    if (p && p.then) {
      p.then(function () {
        started = true; trying = false;
        GESTURES.forEach(function (t) { removeEventListener(t, startMusic, true); });
      }).catch(function () { trying = false; });
    } else { started = true; trying = false; }
  }
  // Intenta sonar en cuanto abre la página. Si el navegador lo bloquea
  // (política de reproducción automática), arranca con el primer gesto.
  GESTURES.forEach(function (t) { addEventListener(t, startMusic, { capture: true, passive: true }); });
  startMusic();
  music.addEventListener('canplay', startMusic);

  // Bucle garantizado: si por cualquier motivo termina o se detiene, vuelve a sonar
  music.addEventListener('ended', function () { music.currentTime = 0; music.play().catch(function () {}); });
  music.addEventListener('pause', function () {
    if (started && !document.hidden) setTimeout(function () { if (music.paused) music.play().catch(function () {}); }, 300);
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && started && music.paused) music.play().catch(function () {});
  });

  // Fundido continuo hacia el volumen objetivo: entrada rápida al abrir la
  // página; después, subidas suaves y bajadas algo más rápidas
  setInterval(function () {
    if (!started) return;
    var target = document.hidden ? 0 : MUSIC_BASE * pageVol() * (shouldDuck() ? DUCK : 1);
    var k = target < level ? 0.16 : (entering ? 0.14 : 0.05);
    level += (target - level) * k;
    if (Math.abs(target - level) < 0.002) { level = target; entering = false; }
    music.volume = Math.max(0, Math.min(1, level));
  }, 50);

  /* ================= efectos sintetizados ================= */
  var ctx = null, master = null, verbIn = null;
  function ac() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    // espacio: ecos cruzados izquierda/derecha con brillo apagado
    verbIn = ctx.createGain();
    var dl = ctx.createDelay(1), dr = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter();
    var pl = ctx.createStereoPanner(), pr = ctx.createStereoPanner(), wet = ctx.createGain();
    dl.delayTime.value = 0.23; dr.delayTime.value = 0.37; fb.gain.value = 0.42;
    lp.type = 'lowpass'; lp.frequency.value = 2600; pl.pan.value = -0.8; pr.pan.value = 0.8; wet.gain.value = 0.55;
    verbIn.connect(lp); lp.connect(dl); dl.connect(dr); dr.connect(fb); fb.connect(dl);
    dl.connect(pl); dr.connect(pr); pl.connect(wet); pr.connect(wet); wet.connect(master);
    return ctx;
  }
  function vol() { return pageVol(); }
  function panFor(el) {
    if (!el || !el.getBoundingClientRect) return 0;
    var r = el.getBoundingClientRect();
    return Math.max(-0.9, Math.min(0.9, ((r.left + r.width / 2) / innerWidth - 0.5) * 1.8));
  }
  function out(pan, wet) {
    var g = ctx.createGain(), p = ctx.createStereoPanner();
    p.pan.value = pan || 0;
    g.connect(p); p.connect(master);
    if (wet) { var s = ctx.createGain(); s.gain.value = wet; p.connect(s); s.connect(verbIn); }
    return g;
  }
  function tone(dest, f, t0, dur, g, type) {
    var o = ctx.createOscillator(), e = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    e.gain.setValueAtTime(0, t0);
    e.gain.linearRampToValueAtTime(g, t0 + 0.012);
    e.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(e); e.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
    return o;
  }
  var noiseBuf = null;
  function noise(dest, t0, dur, g, type, f0, f1, q) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var s = ctx.createBufferSource(), bf = ctx.createBiquadFilter(), e = ctx.createGain();
    s.buffer = noiseBuf; bf.type = type; bf.Q.value = q || 1;
    bf.frequency.setValueAtTime(f0, t0);
    if (f1) bf.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    e.gain.setValueAtTime(0, t0);
    e.gain.linearRampToValueAtTime(g, t0 + dur * 0.3);
    e.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(bf); bf.connect(e); e.connect(dest); s.start(t0); s.stop(t0 + dur + 0.05);
  }

  var SFX = {
    // clic de cristal, corto y suave
    click: function (el) {
      var t = ctx.currentTime, o = out(panFor(el) * 0.5, 0.15);
      o.gain.value = 0.5 * vol();
      tone(o, 1568, t, 0.09, 0.09);
      tone(o, 2349, t + 0.008, 0.07, 0.04);
    },
    // pestañas: pulsación de cuerda grave y cálida
    tab: function (el) {
      var t = ctx.currentTime, o = out(panFor(el) * 0.6, 0.25);
      o.gain.value = 0.5 * vol();
      tone(o, 392, t, 0.35, 0.12, 'triangle');
      tone(o, 784, t, 0.18, 0.04);
    },
    // voltear tarjeta: soplo de aire que barre y un brillo doble al asentarse
    flip: function (el) {
      var t = ctx.currentTime, o = out(panFor(el), 0.3);
      o.gain.value = 0.6 * vol();
      noise(o, t, 0.38, 0.12, 'bandpass', 500, 2600, 1.4);
      tone(o, 659.25, t + 0.2, 0.7, 0.06);
      tone(o, 987.77, t + 0.26, 0.9, 0.045);
    },
    // pista: campana etérea que nace en el lado de la tarjeta y viaja al centro
    track: function (el) {
      var t = ctx.currentTime, start = panFor(el);
      var g = ctx.createGain(), p = ctx.createStereoPanner(), s = ctx.createGain();
      p.pan.setValueAtTime(start || -0.7, t);
      p.pan.linearRampToValueAtTime(-(start || -0.7) * 0.4, t + 2.2);
      g.gain.value = 0.55 * vol(); s.gain.value = 0.9;
      g.connect(p); p.connect(master); p.connect(s); s.connect(verbIn);
      var notes = [293.66, 329.63, 392, 440, 523.25], f = notes[Math.random() * notes.length | 0];
      tone(g, f, t, 2.6, 0.09);
      tone(g, f * 2.76, t, 1.4, 0.035);
      tone(g, f * 5.4, t, 0.6, 0.015);
      tone(g, f * 1.5, t + 0.12, 2.2, 0.04);
      noise(g, t, 0.9, 0.025, 'highpass', 5000, 0, 0.7);
    },
    // nota secreta: polvo de estrellas ascendente
    note: function (el) {
      var t = ctx.currentTime, o = out(panFor(el), 0.6);
      o.gain.value = 0.5 * vol();
      [1046.5, 1318.5, 1568, 2093, 2637].forEach(function (f, i) { tone(o, f, t + i * 0.055, 0.9, 0.045); });
    },
    // carta y fotografía: roce de papel
    paper: function (el) {
      var t = ctx.currentTime, o = out(panFor(el), 0.1);
      o.gain.value = 0.6 * vol();
      noise(o, t, 0.22, 0.09, 'bandpass', 2800, 1800, 0.9);
      noise(o, t + 0.12, 0.18, 0.05, 'bandpass', 3600, 2400, 0.9);
    }
  };
  function play(kind, el) {
    if (vol() <= 0 || !ac()) return;
    try { SFX[kind](el); } catch (e) { /* sin sonido si el navegador lo impide */ }
  }

  // Dentro del juego ya iniciado manda su propio sonido
  function inGame(el) {
    return el.closest('#game') && intro && !intro.classList.contains('on') && !el.closest('#intro');
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest || inGame(t)) return;
    var el;
    if ((el = t.closest('[data-note]'))) return play('note', el);
    if ((el = t.closest('.pl'))) return play('track', el);
    if ((el = t.closest('.tabs button'))) return play('tab', el);
    if ((el = t.closest('#env, #pho'))) return play('paper', el);
    if ((el = t.closest('.cc'))) {
      if (!t.closest('a,button')) play('flip', el);
      return;
    }
    if ((el = t.closest('.tm'))) return play('flip', el);
    if ((el = t.closest('a, button, [role="button"], input[type="range"]'))) return play('click', el);
  }, true);

  // Teclado: Enter/Espacio sobre tarjetas también suenan
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target;
    if (!t || !t.closest || inGame(t)) return;
    if (t.matches('.cc')) play('flip', t);
    else if (t.matches('#env, #pho')) play('paper', t);
  }, true);
})();
