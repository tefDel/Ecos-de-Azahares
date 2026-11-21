(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // js/utils.js
  var $ = (s) => document.querySelector(s);
  var clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  var ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  var pick = (a) => a[Math.floor(Math.random() * a.length)];
  var shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

  // js/state.js
  var S = {
    /* Progreso general */
    p: 0,
    // fase actual (0 Detonante · 1 Teseracto · 2 Fractura · 3 Núcleo)
    step: 0,
    // subpaso dentro de la fase (en el núcleo: 0 flor · 1 elección · 2 final)
    cycle: 0,
    // número de ciclo (cada reinicio suma 1)
    lock: true,
    // true = se ignoran clics en el mundo
    busy: false,
    // true mientras se hace el fundido del reinicio
    muted: false,
    rt: null,
    // temporizador del reinicio automático
    /* Misterio del ciclo actual */
    run: null,
    // { culprit, q, order, shift, secret, secretFound, tmap }
    clues: [],
    verdict: null,
    // a quién acusó la persona
    solved: 0,
    // casos resueltos en total
    lost: /* @__PURE__ */ new Set(),
    // registros dañados (por la última visita)
    nextLost: null,
    saved: /* @__PURE__ */ new Set(),
    // registros salvados en la Fractura
    recovered: 0,
    /* Vista 2: expedientes */
    letter: false,
    dossier: null,
    // id del resonante abierto
    heard: {},
    // segundos escuchados por resonante
    freed: /* @__PURE__ */ new Set(),
    // resonantes liberados
    playing: false,
    dv: null,
    // voz del expediente
    yawT: null,
    // giro de cámara objetivo
    dir: 0,
    // giro por teclado/botones (-1, 0, 1)
    mouse: false,
    /* Vista 3: Fractura */
    tracks: [],
    held: -1,
    tleft: 0,
    surge: 0,
    /* Vista 4: núcleo */
    cv: null,
    // voz del eco final
    seen: /* @__PURE__ */ new Set(),
    /* Ambiente visual */
    mood: 0,
    moodT: 0,
    // color (0 gris -> 1 dorado) actual / objetivo
    glitch: 0,
    glitchT: 0
    // distorsión actual / objetivo
  };

  // js/world/materials.js
  var tint = [];
  var T = (mat, gray, gold) => {
    tint.push([mat, new THREE.Color(gray), new THREE.Color(gold)]);
    return mat;
  };
  var basic = (color, opts) => new THREE.MeshBasicMaterial(Object.assign({ color }, opts));

  // js/world/flower.js
  var glowTexture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  function createFlower() {
    const g = new THREE.Group(), pets = [];
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Group();
      const m = basic(16711807, { transparent: true });
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), m);
      petal.rotation.z = i * Math.PI * 2 / 5;
      s.scale.set(0.6, 1.15, 0.22);
      s.position.y = 0.42;
      petal.add(s);
      g.add(petal);
      pets.push(m);
    }
    const cm = basic(16770033);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), cm));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 16711807,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.5
    }));
    glow.scale.set(3.2, 3.2, 1);
    g.add(glow);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), basic(0, { visible: false }));
    g.add(hit);
    return { g, pets, cm, glow, hit, s: 1 };
  }
  function setFlower(f, mode) {
    const cols = {
      neon: [16711807, 16711807, 16711807, 16711807, 16711807],
      none: Array(5).fill(15921906),
      warm: [16711807, 16757575, 14725722, 16740193, 16767370]
    }[mode];
    f.pets.forEach((m, i) => {
      m.color.setHex(cols[i]);
      m.opacity = mode === "none" ? 0.8 : 1;
    });
    f.cm.color.setHex(mode === "neon" ? 16770033 : mode === "none" ? 16777215 : 16774084);
    f.glow.material.color.setHex(mode === "neon" ? 16711807 : mode === "none" ? 16777215 : 16765562);
    f.mode = mode;
  }

  // js/world/city.js
  var doorX = (i) => (i - 2) * 6;
  function buildCity(scene2) {
    const group = new THREE.Group();
    scene2.add(group);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), T(basic(3355443), 2756649, 9071146));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -1.6, -20);
    group.add(floor);
    const doors3 = [];
    for (let i = 0; i < 5; i++) {
      const back = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.4), basic(16765562));
      back.position.set(doorX(i), 0.6, -5.1);
      back.visible = false;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.4, 0.2), T(basic(4473924), 4070203, 10124085));
      panel.position.set(doorX(i), 0.6, -5);
      group.add(back, panel);
      doors3.push({ panel, back, k: 0, open: false });
    }
    for (let i = 0; i < 18; i++) {
      const h = 4 + Math.random() * 10;
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(3 + Math.random() * 3, h, 2),
        T(basic(1706020), 1706020, 8019496)
      );
      b.position.set(-30 + i * 3.4, h / 2 - 1.6, -9 - Math.random() * 3);
      group.add(b);
    }
    const dp = [];
    for (let i = 0; i < 240; i++) dp.push((Math.random() - 0.5) * 40, Math.random() * 8 - 1.5, Math.random() * -14 + 4);
    const dust2 = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(dp, 3)),
      T(new THREE.PointsMaterial({ size: 0.06 }), 11901618, 14725722)
    );
    group.add(dust2);
    const flower = createFlower();
    setFlower(flower, "neon");
    group.add(flower.g);
    const decor = group.children.filter((c) => c !== flower.g && !doors3.some((d) => d.panel === c || d.back === c));
    return { group, doors: doors3, dust: dust2, flower, decor };
  }

  // js/world/gallery.js
  function buildTesseract(edge) {
    const cube = (s) => new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s, s)), edge);
    const t = new THREE.Group();
    t.add(cube(40), cube(18));
    const pts = [];
    [-1, 1].forEach((x) => [-1, 1].forEach((y) => [-1, 1].forEach(
      (z) => pts.push(new THREE.Vector3(x * 20, y * 20, z * 20), new THREE.Vector3(x * 9, y * 9, z * 9))
    )));
    t.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), edge));
    return t;
  }
  function fillNyxa(v) {
    v.inner.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.35, 0.1, 80, 10), basic(7038085, { wireframe: true })));
    for (let k = 0; k < 8; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), basic(1381148, { transparent: true, opacity: 0.8 }));
      v.inner.add(b);
      v.x.push(b);
    }
  }
  function fillTala(v) {
    v.inner.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), basic(10910802, { wireframe: true })));
    for (let k = 0; k < 3; k++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.02, 6, 40), basic(13213808, { transparent: true }));
      r.rotation.x = Math.PI / 2;
      v.g.add(r);
      v.x.push(r);
    }
  }
  function fillVolt(v) {
    v.inner.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.4), basic(15986608)));
    v.inner.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 1.3, 1.3)),
      new THREE.LineBasicMaterial({ color: 16772744 })
    ));
  }
  function fillEmpty(v) {
    v.inner.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), basic(8947848, { transparent: true, opacity: 0.18 })));
  }
  var FILL = { nyxa: fillNyxa, tala: fillTala, volt: fillVolt };
  function buildShowcase(id, i, edge) {
    const a = i * Math.PI / 3, g = new THREE.Group();
    const bx = Math.sin(a) * 8, bz = -Math.cos(a) * 8;
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(2, 3.2, 2),
      basic(16777215, { transparent: true, opacity: 0.07, depthWrite: false })
    );
    glass.userData = { id, i };
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.3, 24), T(basic(4070203), 4070203, 9202990));
    base.position.y = -1.75;
    g.add(glass, new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), edge), base);
    const v = { g, id, bx, bz, y0: Math.random() * 6, inner: new THREE.Group(), x: [], glass };
    g.add(v.inner);
    (FILL[id] || fillEmpty)(v);
    return v;
  }
  function buildGallery(scene2, pos) {
    const group = new THREE.Group();
    group.position.copy(pos);
    scene2.add(group);
    const edge = T(new THREE.LineBasicMaterial(), 9387627, 14725722);
    const tess = buildTesseract(edge);
    group.add(tess);
    [3, 6, 9, 12].forEach((r) => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.04, 96),
        T(basic(5592405, { side: THREE.DoubleSide }), 9387627, 14725722)
      );
      m.rotation.x = -Math.PI / 2;
      m.position.y = -1.55;
      group.add(m);
    });
    const vit = [], glass = [];
    ["nyxa", null, "tala", null, "volt", null].forEach((id, i) => {
      const v = buildShowcase(id, i, edge);
      group.add(v.g);
      vit.push(v);
      glass.push(v.glass);
    });
    const decor = group.children.filter((c) => !vit.some((v) => v.g === c));
    return { group, tess, vit, glass, decor };
  }

  // js/world/coreRoom.js
  function buildCore(scene2, pos) {
    const group = new THREE.Group();
    group.position.copy(pos);
    scene2.add(group);
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(14, 32, 20),
      T(basic(7829367, { side: THREE.BackSide, fog: false }), 1706020, 12094005)
    );
    group.add(shell);
    [4, 7, 10].forEach((r) => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.05, 80),
        basic(16773312, { side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.y = -2;
      group.add(m);
    });
    const flower = createFlower();
    setFlower(flower, "none");
    flower.g.position.set(0, 0.1, 0);
    group.add(flower.g);
    const sael = new THREE.Group();
    const mat = basic(16773312, { transparent: true, opacity: 0.28 });
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.4, 24), mat);
    body.position.y = -0.2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), mat);
    head.position.y = 1.9;
    sael.add(body, head);
    sael.position.set(0, -0.2, -5);
    group.add(sael);
    const decor = group.children.filter((c) => c !== flower.g && c !== sael);
    return { group, flower, sael, decor };
  }

  // js/world/index.js
  var renderer = new THREE.WebGLRenderer({ canvas: $("#gl"), antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(58, 1, 0.1, 300);
  var bgGray = new THREE.Color(852502);
  var bgGold = new THREE.Color(13214287);
  var bg = new THREE.Color();
  var neon = new THREE.Color(16711807);
  scene.background = bg;
  scene.fog = new THREE.Fog(852502, 4, 70);
  var look = new THREE.Vector3();
  var GAL = new THREE.Vector3(0, 0, -70);
  var CORE = new THREE.Vector3(0, 0, -150);
  var doorIdx = 2;
  var baseFov = 58;
  var tw = null;
  var city = buildCity(scene);
  var gallery = buildGallery(scene, GAL);
  var coreRoom = buildCore(scene, CORE);
  var fl1 = city.flower;
  var fl2 = coreRoom.flower;
  var { doors, dust } = city;
  scene.add(new THREE.AmbientLight(16777215, 0.8));
  var sun = new THREE.DirectionalLight(16777215, 0.8);
  sun.position.set(5, 10, 7);
  scene.add(sun);
  var zones = {
    city: [city.group, 40, city.decor],
    gal: [gallery.group, 40, gallery.decor],
    core: [coreRoom.group, 26, coreRoom.decor]
  };
  var custom = {};
  function setEnv(zone, model) {
    const [grp, size, decor] = zones[zone];
    if (custom[zone]) {
      grp.remove(custom[zone]);
      custom[zone] = null;
    }
    decor.forEach((o) => {
      o.visible = !model;
    });
    if (!model) return;
    const box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
    const k = size / Math.max(s.x, s.y, s.z, 1e-3);
    model.scale.setScalar(k);
    model.position.set(-c.x * k, -c.y * k, -c.z * k);
    grp.add(model);
    custom[zone] = model;
  }
  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  function pickObject(objs, e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, cam);
    const hit = raycaster.intersectObjects(objs, false)[0];
    return hit ? hit.object : null;
  }
  function fly(pos, lk, dur, done, arc = 0) {
    tw = { p0: cam.position.clone(), l0: look.clone(), p1: pos, l1: lk, t: 0, dur, done, arc };
    W.free = null;
  }
  function resize() {
    const gw = $("#game").clientWidth, gh = $("#game").clientHeight;
    renderer.setSize(gw, gh, false);
    cam.aspect = gw / gh;
    baseFov = cam.aspect < 1 ? 74 : 58;
    cam.fov = baseFov;
    cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe($("#game"));
  resize();
  var galPos = () => GAL.clone().add(new THREE.Vector3(0, 0.2, 0));
  var dirV = (yaw) => new THREE.Vector3(Math.sin(yaw) * 10, 0, -Math.cos(yaw) * 10);
  function setDoor(i) {
    doorIdx = i;
    doors.forEach((d, k) => {
      d.k = 0;
      d.open = false;
      d.back.visible = false;
      d.panel.position.x = doorX(k);
    });
    fl1.g.position.set(doorX(i), 0.6, -3);
  }
  function home() {
    cam.position.set(doorX(doorIdx), 0.6, 3);
    look.set(doorX(doorIdx), 0.6, -3);
    W.free = "city";
    tw = null;
  }
  function openDoor() {
    const d = doors[doorIdx];
    d.back.visible = true;
    d.open = true;
  }
  function freeVit(id) {
    const v = gallery.vit.find((x) => x.id === id);
    if (!v) return;
    v.freed = true;
    v.orig = [];
    v.inner.traverse((o) => {
      if (o.material && o.material.color) {
        v.orig.push([o.material, o.material.color.getHex()]);
        o.material.color.setHex(14725722);
      }
    });
  }
  function resetVit() {
    gallery.vit.forEach((v) => {
      v.freed = false;
      v.inner.position.y = 0;
      v.glass.material.opacity = 0.07;
      (v.orig || []).forEach(([m, h]) => m.color.setHex(h));
      v.orig = [];
    });
  }
  function updateBackground() {
    bg.copy(bgGray).lerp(bgGold, S.mood);
    if (Math.random() < 0.1) bg.lerp(neon, S.glitch * 0.3);
    scene.fog.color.copy(bg);
    tint.forEach(([mat, a, b]) => mat.color.copy(a).lerp(b, S.mood));
  }
  function updateCamera(dt, t) {
    if (tw) {
      tw.t += dt / tw.dur;
      const k = ease(clamp(tw.t, 0, 1));
      cam.position.lerpVectors(tw.p0, tw.p1, k);
      cam.position.y += Math.sin(k * Math.PI) * tw.arc;
      look.lerpVectors(tw.l0, tw.l1, k);
      cam.fov = baseFov + Math.sin(k * Math.PI) * 14;
      cam.updateProjectionMatrix();
      if (tw.t >= 1) {
        const done = tw.done;
        tw = null;
        cam.fov = baseFov;
        cam.updateProjectionMatrix();
        if (done) done();
      }
    } else if (W.free === "city") {
      const hx = doorX(doorIdx);
      cam.position.set(hx + W.mx * 0.5, 0.6 - W.my * 0.3, 3);
      look.set(hx, 0.6, -3);
    } else if (W.free === "gal") {
      cam.position.copy(galPos());
      look.set(cam.position.x + Math.sin(W.yaw) * 10, 0.2 - W.my * 1.5, cam.position.z - Math.cos(W.yaw) * 10);
    } else if (W.free === "core") {
      cam.position.set(CORE.x + Math.sin(t * 0.2) * 1.2, 0.5, CORE.z + 6);
      look.set(CORE.x, 0.2, CORE.z);
    }
  }
  function animateFlowers(dt, t) {
    [[fl1, S.p === 0 && W.hov], [fl2, S.p === 3 && S.step === 0 && W.hov]].forEach(([f, hover]) => {
      const target = 1 + 0.06 * Math.sin(t * 3) + (hover ? 0.2 * (0.5 + 0.5 * Math.sin(t * 9)) : 0);
      f.s += (target - f.s) * 0.2;
      f.g.scale.setScalar(f.s);
      f.g.rotation.z += dt * (f.mode === "warm" ? 0.6 : 0.1);
      f.glow.material.opacity = (f.mode === "none" ? 0.18 : 0.4) + 0.2 * Math.sin(t * 3) + (hover ? 0.25 : 0);
    });
  }
  function animateDoors(dt) {
    doors.forEach((d, k) => {
      if (d.open && d.k < 1) {
        d.k = Math.min(1, d.k + dt / 2.4);
        d.panel.position.x = doorX(k) + ease(d.k) * 2.7;
      }
    });
  }
  function animateShowcases(dt, t, g) {
    gallery.vit.forEach((v) => {
      v.g.position.set(
        v.bx + (Math.random() - 0.5) * g * 0.5,
        Math.sin(t * 0.8 + v.y0) * 0.12 + (Math.random() - 0.5) * g * 0.5,
        v.bz
      );
      v.inner.rotation.y += dt * (v.id === "volt" ? 3 : 0.6);
      if (v.freed) {
        v.inner.position.y = Math.min(1.8, v.inner.position.y + dt * 0.5);
        v.glass.material.opacity = Math.max(0, v.glass.material.opacity - dt * 0.05);
      }
      if (v.id === "nyxa") v.x.forEach((b, k) => {
        const a = t * 0.7 + k;
        b.position.set(Math.cos(a) * 0.7, Math.sin(a * 1.3) * 0.9, Math.sin(a) * 0.7);
      });
      if (v.id === "tala") v.x.forEach((r, k) => {
        const p = (t * 0.5 + k / 3) % 1;
        r.scale.setScalar(0.4 + p * 1.1);
        r.material.opacity = 0.7 * (1 - p);
      });
      if (v.id === "volt") v.inner.scale.setScalar(0.9 + Math.random() * 0.3);
    });
  }
  function update(dt, t) {
    updateBackground();
    updateCamera(dt, t);
    cam.lookAt(look);
    const shake = RM ? 0 : S.glitch, px = cam.position.x, py = cam.position.y;
    cam.position.x += (Math.random() - 0.5) * shake * 0.25;
    cam.position.y += (Math.random() - 0.5) * shake * 0.25;
    cam.rotation.z += (Math.random() - 0.5) * shake * 0.05;
    animateFlowers(dt, t);
    dust.rotation.y += dt * 0.02;
    animateDoors(dt);
    gallery.tess.rotation.x = t * 0.05;
    gallery.tess.rotation.y = t * 0.07;
    animateShowcases(dt, t, S.glitch);
    coreRoom.sael.position.y = -0.2 + Math.sin(t * 0.6) * 0.1;
    if (W.visible) renderer.render(scene, cam);
    cam.position.x = px;
    cam.position.y = py;
  }
  var W = {
    cam,
    fl1,
    fl2,
    glass: gallery.glass,
    GAL,
    CORE,
    free: null,
    // modo de cámara libre: 'city' | 'gal' | 'core' | null (en vuelo)
    yaw: 0,
    mx: 0,
    my: 0,
    // giro y posición del cursor (-1..1)
    visible: true,
    // false cuando el juego sale de la pantalla
    hov: false,
    // cursor sobre algo clicable
    pick: pickObject,
    fly,
    update,
    setDoor,
    setFlower,
    home,
    galPos,
    dirV,
    setEnv,
    freeVit,
    resetVit,
    openDoor,
    get doorIdx() {
      return doorIdx;
    }
  };

  // js/fx.js
  var FX = (() => {
    const c = $("#fx"), x = c.getContext("2d"), gl = $("#gl");
    c.width = 320;
    c.height = 180;
    function draw(g) {
      c.style.opacity = g > 0.01 ? 1 : 0;
      x.clearRect(0, 0, 320, 180);
      if (g < 0.01) {
        gl.style.transform = "";
        return;
      }
      const n = Math.floor(6 + g * 30);
      for (let i = 0; i < n; i++) {
        x.fillStyle = Math.random() < 0.7 ? `rgba(255,0,127,${Math.random() * 0.5 * g})` : `rgba(255,255,255,${Math.random() * 0.25 * g})`;
        x.fillRect(Math.random() * 320, Math.random() * 180, Math.random() * 160 * g + 4, Math.random() * 5 + 1);
      }
      x.fillStyle = `rgba(0,0,0,${0.18 * g})`;
      for (let y = 0; y < 180; y += 3) x.fillRect(0, y, 320, 1);
      x.fillStyle = `rgba(255,255,255,${0.5 * g})`;
      for (let i = 0; i < 120 * g; i++) x.fillRect(Math.random() * 320, Math.random() * 180, 1, 1);
      gl.style.transform = RM ? "" : `translate(${(Math.random() - 0.5) * g * 14}px,0)`;
    }
    return { draw };
  })();
  function wave(cv, an, c) {
    const x = cv.getContext("2d"), w = cv.width, h = cv.height;
    x.clearRect(0, 0, w, h);
    x.lineWidth = 2;
    x.strokeStyle = c > 0.05 ? "#FF007F" : "#e0b25a";
    x.beginPath();
    const d = new Uint8Array(an ? an.fftSize : 2);
    if (an) an.getByteTimeDomainData(d);
    for (let i = 0; i < w; i += 2) {
      const v = an ? (d[Math.floor(i / w * d.length)] - 128) / 128 : 0;
      const y = h / 2 + v * h * 0.9 + (c > 0 ? (Math.random() - 0.5) * c * h * 0.9 : 0);
      if (i && Math.random() > c * 0.12) x.lineTo(i, y);
      else x.moveTo(i, y);
    }
    x.stroke();
  }

  // js/data.js
  var PHASES = ["Detonante", "Teseracto", "Fractura", "N\xFAcleo"];
  var IDS = ["nyxa", "tala", "volt"];
  var RES = {
    nyxa: {
      n: 1,
      name: "Nyxa",
      epi: "La que habita entre sombras",
      glyph: "\u16BE\u16A3\u16C9\u16A8 \u16DE\u16DF\u16B1",
      dur: 30,
      angle: 0,
      img: "assets/imgs/IMGs_Trasmedia/Nyxa.jpeg",
      txt: "Aqu\xED las sombras no persiguen: sostienen. Aprend\xED a vivir en el borde de lo que nadie mira. Si me nombras, me haces un poco m\xE1s real. N\xF3mbrame despacio."
    },
    tala: {
      n: 2,
      name: "Tala",
      epi: "La de los ecos de bestias",
      glyph: "\u16CF\u16A8\u16DA\u16A8 \u16B2\u16B1\u16A2",
      dur: 30,
      angle: 2 * Math.PI / 3,
      img: "assets/imgs/IMGs_Trasmedia/Tala.jpeg",
      txt: "Lo que ruge en m\xED no es m\xEDo. Son las bestias que otros callaron, convertidas en voz. Cuando el pasillo tiembla, soy yo recordando que alguna vez corr\xED libre."
    },
    volt: {
      n: 3,
      name: "Volt",
      epi: "El de la jaula de energ\xEDa",
      glyph: "\u16A1\u16DF\u16DA\u16CF \u16D6\u16BE\u16C9",
      dur: 30,
      angle: 4 * Math.PI / 3,
      img: "assets/imgs/IMGs_Trasmedia/Volt.jpeg",
      txt: 'Me llaman corriente, pero soy un deseo sin salida. Cada barrote es una vez que dije "despu\xE9s". La jaula no me contiene: me recuerda.'
    }
  };
  var OPEN = [
    "Cada ma\xF1ana suena el mismo despertador y cada noche vuelves por la misma calle. Esta vez no la tomes.",
    "Alguien dej\xF3 una flor en una puerta que no era la tuya. Ven a ver por qu\xE9.",
    "Hay un museo que guarda lo que ya no recuerdas. Hoy falta algo."
  ];
  var MYST = [
    "\xBFQui\xE9n dej\xF3 la flor de azahar en la puerta?",
    "\xBFQui\xE9n abri\xF3 la primera grieta en el museo?",
    "\xBFQui\xE9n escribi\xF3 la carta que te trajo hasta aqu\xED?",
    "\xBFQui\xE9n borr\xF3 un recuerdo del Teseracto?"
  ];
  var CLUES = {
    nyxa: {
      nyxa: "Yo no sal\xED de mi sombra... aunque ahora huele a azahar entre mis manos.",
      tala: "Una bestia roz\xF3 mi sombra y dej\xF3 p\xE9talos en el suelo.",
      volt: "Sent\xED un chispazo en la oscuridad: alguien con la jaula abierta."
    },
    tala: {
      nyxa: "Entre mis ecos o\xED susurros que solo nacen de las sombras.",
      tala: "No fui yo... pero mis ecos repiten un paso muy parecido al m\xEDo.",
      volt: "El suelo ol\xEDa a ozono. Solo hay una jaula que huela as\xED."
    },
    volt: {
      nyxa: "Todas las luces se apagaron un instante. Solo Nyxa apaga luces as\xED.",
      tala: "Escuch\xE9 pasos de bestia sobre mis barrotes.",
      volt: "Yo no abr\xED nada... y sin embargo mis barrotes est\xE1n tibios."
    }
  };
  var FRAG = {
    nyxa: [
      "Nyxa, en la bit\xE1cora: \xABYo vigilaba la puerta; jam\xE1s la cruc\xE9\xBB.",
      "Nyxa, en la bit\xE1cora: \xABLa puerta me eligi\xF3 a m\xED y yo dije que s\xED\xBB."
    ],
    tala: [
      "Tala, en la bit\xE1cora: \xABMis ecos rug\xEDan afuera mientras todo ocurr\xEDa\xBB.",
      "Tala, en la bit\xE1cora: \xABCorr\xED hacia la puerta antes de que nadie me viera\xBB."
    ],
    volt: [
      "Volt, en la bit\xE1cora: \xABEstuve enjaulado toda la noche; los barrotes son testigos\xBB.",
      "Volt, en la bit\xE1cora: \xABRomp\xED un barrote por un segundo; fue suficiente\xBB."
    ]
  };
  var ENDS = {
    A: "Acertaste y salvaste casi todo: la verdad se asienta sin dolor y el museo respira.",
    B: "Acertaste, pero casi todos los registros quedaron mudos. Sabes qui\xE9n fue y nadie queda para recordarlo contigo.",
    C: "Fallaste, pero los registros se salvaron: el museo guarda la verdad y esperar\xE1 a que vuelvas por ella.",
    D: "Fallaste y los registros se perdieron. La verdad se qued\xF3 entre las grietas."
  };
  var RELEASE = [
    "Una conversaci\xF3n que nunca tuve",
    "Un lugar al que no volv\xED",
    "Un nombre que a\xFAn pronuncio en voz baja",
    "Una versi\xF3n de m\xED que ya no soy"
  ];

  // js/audio/engine.js
  var engine_exports = {};
  __export(engine_exports, {
    buf: () => buf,
    echo: () => echo,
    eng: () => eng,
    init: () => init,
    noise: () => noise,
    now: () => now,
    pool: () => pool,
    rnd: () => rnd,
    tone: () => tone
  });
  var buf = {};
  var pool = {};
  var eng = { ctx: null, master: null, noiseBuf: null };
  var now = () => eng.ctx.currentTime;
  var rnd = (a, b) => a + Math.random() * (b - a);
  function init() {
    if (eng.ctx) {
      eng.ctx.resume();
      return;
    }
    const ctx = eng.ctx = new (window.AudioContext || window.webkitAudioContext)();
    eng.master = ctx.createGain();
    eng.master.connect(ctx.destination);
    eng.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = eng.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function noise() {
    const s = eng.ctx.createBufferSource();
    s.buffer = eng.noiseBuf;
    s.loop = true;
    s.start();
    return s;
  }
  function tone(f, t0, dur, g = 0.15, type = "sine", dest = eng.master) {
    const o = eng.ctx.createOscillator(), e = eng.ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    e.gain.setValueAtTime(0, t0);
    e.gain.linearRampToValueAtTime(g, t0 + 0.02);
    e.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
    o.connect(e);
    e.connect(dest);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  function echo() {
    const { ctx, master } = eng;
    const dl = ctx.createDelay(1), fb = ctx.createGain(), inp = ctx.createGain();
    dl.delayTime.value = 0.3;
    fb.gain.value = 0.45;
    inp.connect(dl);
    dl.connect(fb);
    fb.connect(dl);
    dl.connect(master);
    inp.connect(master);
    return inp;
  }

  // js/audio/scenes.js
  var urb = null;
  function playUrbanSample() {
    const { ctx, master } = eng;
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf.urban;
    s.loop = true;
    g.gain.value = 0.8;
    s.connect(g);
    g.connect(master);
    s.start();
    return { stop() {
      g.gain.setTargetAtTime(0, now(), 0.4);
      setTimeout(() => s.stop(), 1800);
    } };
  }
  function synthUrban() {
    const { ctx, master } = eng;
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    f.type = "lowpass";
    f.frequency.value = 420;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.22, now() + 2);
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(f.frequency);
    lfo.start();
    n.connect(f);
    f.connect(g);
    g.connect(master);
    const beep = () => {
      for (let i = 0; i < 4; i++) tone(880, now() + i * 0.22, 0.1, 0.05, "square");
    };
    const iv = setInterval(beep, 2600);
    beep();
    return {
      stop() {
        clearInterval(iv);
        g.gain.setTargetAtTime(0, now(), 0.4);
        setTimeout(() => {
          n.stop();
          lfo.stop();
        }, 1800);
      }
    };
  }
  function urban(on) {
    if (urb) {
      urb.stop();
      urb = null;
    }
    if (!on || !eng.ctx) return;
    urb = buf.urban ? playUrbanSample() : synthUrban();
  }
  function doors2() {
    urban(false);
    const { ctx, master } = eng;
    if (buf.doors) {
      const s = ctx.createBufferSource();
      s.buffer = buf.doors;
      s.connect(master);
      s.start();
      return;
    }
    const e = echo(), t = now();
    tone(55, t, 1.4, 0.5, "sine", e);
    tone(110, t + 0.1, 0.9, 0.2, "triangle", e);
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass";
    f.Q.value = 2;
    f.frequency.setValueAtTime(180, t);
    f.frequency.exponentialRampToValueAtTime(1400, t + 2.4);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.6);
    g.gain.linearRampToValueAtTime(0, t + 2.6);
    n.connect(f);
    f.connect(g);
    g.connect(e);
    setTimeout(() => n.stop(), 2800);
    [523, 659, 784].forEach((q, i) => tone(q, t + 2.2 + i * 0.25, 3, 0.05, "sine", e));
  }
  function ping() {
    const t = now();
    tone(1320, t, 0.9, 0.12);
    tone(1980, t + 0.05, 0.7, 0.05);
  }
  function boom() {
    const { ctx, master } = eng;
    const t = now(), n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "highpass";
    f.frequency.value = 1200;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.9);
    n.connect(f);
    f.connect(g);
    g.connect(master);
    setTimeout(() => n.stop(), 1e3);
    tone(40, t, 1.4, 0.6);
  }
  function chime() {
    [392, 494, 587, 784, 988].forEach((q, i) => tone(q, now() + i * 0.18, 2.4, 0.1, "sine", echo()));
  }

  // js/audio/voice.js
  function voice(kind, o = {}) {
    const { ctx, master } = eng;
    const gate = ctx.createGain(), out = ctx.createGain();
    const pan = ctx.createStereoPanner(), an = ctx.createAnalyser();
    an.fftSize = 512;
    out.gain.value = o.vol ?? 0.5;
    pan.pan.value = o.pan || 0;
    gate.connect(out);
    out.connect(pan);
    pan.connect(an);
    an.connect(master);
    const sources = [], oscs = [], timers = [];
    const sh = o.shift || 1;
    const every = (ms, fn) => timers.push(setInterval(fn, ms));
    const osc = (type, f, g) => {
      const x = ctx.createOscillator(), y = ctx.createGain();
      x.type = type;
      x.frequency.value = f * sh;
      y.gain.value = g;
      x.connect(y);
      y.connect(gate);
      x.start();
      sources.push(x);
      oscs.push(x);
      return x;
    };
    const noiseBand = (type, freq) => {
      const s = noise(), f = ctx.createBiquadFilter(), y = ctx.createGain();
      f.type = type;
      f.frequency.value = freq;
      y.gain.value = 0;
      s.connect(f);
      f.connect(y);
      y.connect(gate);
      sources.push(s);
      return y;
    };
    if (o.buf) {
      const s = ctx.createBufferSource();
      s.buffer = o.buf;
      s.loop = !!o.loop;
      s.connect(gate);
      s.start(0, o.offset || 0);
      sources.push(s);
      oscs.push({ detune: { set value(c) {
        s.playbackRate.value = 1 + c / 4e3;
      } } });
    } else if (kind === "nyxa") {
      const a = osc("sine", 98, 0.22);
      osc("sine", 147, 0.1);
      const w = noiseBand("highpass", 2800);
      every(420, () => {
        w.gain.setTargetAtTime(rnd(0, 0.1), now(), 0.25);
        a.frequency.setTargetAtTime(rnd(90 * sh, 106 * sh), now(), 0.5);
      });
    } else if (kind === "tala") {
      const a = osc("sawtooth", 62, 0.09), w = noiseBand("lowpass", 500);
      every(650, () => {
        a.frequency.setTargetAtTime(rnd(48 * sh, 95 * sh), now(), 0.12);
        w.gain.setTargetAtTime(Math.random() < 0.5 ? rnd(0.05, 0.25) : 0, now(), 0.05);
        if (Math.random() < 0.25) tone(rnd(190, 320), now(), 1.1, 0.05, "sine", gate);
      });
    } else if (kind === "volt") {
      osc("sawtooth", 110, 0.07);
      const b = osc("square", 220, 0.03), c = noiseBand("highpass", 4500);
      const scale = [220, 277, 330, 440, 554];
      every(110, () => {
        c.gain.setTargetAtTime(Math.random() < 0.4 ? 0.25 : 0, now(), 0.01);
        if (Math.random() < 0.3) b.frequency.value = scale[Math.floor(Math.random() * 5)] * sh;
      });
    } else {
      const root = o.root || 196, scale = [1, 1.125, 1.25, 1.5, 1.667, 2];
      let k = 0;
      osc("sine", root / 2, 0.12);
      every(520, () => tone(root * scale[(k++ * 2 + Math.floor(Math.random() * 3)) % 6], now(), 1.2, 0.1, "triangle", gate));
    }
    if (o.orbit) every(60, () => {
      pan.pan.value = Math.sin(now() * 0.9) * 0.9;
    });
    every(80, () => {
      const c = o.corr ? o.corr() : 0;
      gate.gain.setTargetAtTime(Math.random() < c * 0.85 ? 0 : 1, now(), 8e-3);
      oscs.forEach((x) => {
        x.detune.value = (Math.random() - 0.5) * c * 1400;
      });
    });
    return {
      an,
      vol(v) {
        out.gain.setTargetAtTime(v, now(), 0.1);
      },
      stop() {
        timers.forEach(clearInterval);
        out.gain.setTargetAtTime(0, now(), 0.2);
        setTimeout(() => sources.forEach((x) => {
          try {
            x.stop();
          } catch (e) {
          }
        }), 700);
      }
    };
  }

  // js/audio/index.js
  var { buf: buf2, pool: pool2, eng: eng2 } = engine_exports;
  var Aud = {
    init,
    urban,
    doors: doors2,
    ping,
    boom,
    chime,
    voice,
    buf: buf2,
    /* Decodifica un audio subido y lo guarda (se pueden subir varios por clave) */
    async load(k, data) {
      init();
      const b = await eng2.ctx.decodeAudioData(data);
      (pool2[k] = pool2[k] || []).push(b);
      buf2[k] = buf2[k] || b;
      return b;
    },
    /* Elige al azar uno de los audios cargados para cada clave (variación por ciclo) */
    shuffle() {
      Object.keys(pool2).forEach((k) => {
        buf2[k] = pool2[k][Math.floor(Math.random() * pool2[k].length)];
      });
    },
    clear(k) {
      delete buf2[k];
      delete pool2[k];
    },
    mute(m) {
      if (eng2.master) eng2.master.gain.value = m ? 0 : 1;
    }
  };

  // js/flow/ui.js
  function say(txt) {
    const e = $("#say");
    if (txt) e.textContent = txt;
    e.classList.toggle("on", !!txt);
  }
  var show = (sel, on = true) => $(sel).classList.toggle("on", on);
  var hideAll = () => ["#letter", "#dossier", "#arrows", "#adv", "#tracks", "#wall", "#choices", "#final"].forEach((s) => show(s, false));
  function setPhase(n) {
    S.p = n;
    $("#ph").textContent = PHASES[n];
    document.querySelectorAll("#dots i").forEach((d, i) => d.classList.toggle("on", i <= n));
  }

  // js/flow/run.js
  function newRun() {
    S.run = {
      culprit: pick(IDS),
      q: pick(MYST),
      order: Math.random() < 0.5 ? shuffle(IDS) : null,
      shift: pick([0.84, 0.94, 1, 1.12, 1.26]),
      secret: pick([1, 3, 5]),
      secretFound: false,
      tmap: shuffle(IDS)
    };
    S.clues = [];
    S.saved = /* @__PURE__ */ new Set();
    S.verdict = null;
    updClues();
  }
  function addClue(t) {
    if (S.clues.includes(t)) return;
    S.clues.push(t);
    updClues();
  }
  function updClues() {
    const r = S.run;
    if (!r) return;
    $("#jb").textContent = "Pistas (" + S.clues.length + ")";
    const header = '<p class="m"><span>Cuaderno del caso</span><button id="jx" style="padding:2px 8px">Cerrar</button></p><p>' + r.q + "</p>";
    const order = r.order ? '<p class="m" style="display:block">Orden de la carta: ' + r.order.map((i) => RES[i].epi.toLowerCase()).join(" \u2192 ") + "</p>" : "";
    const clues = S.clues.length ? S.clues.map((c) => '<p style="margin:6px 0">' + c + "</p>").join("") : '<p class="m" style="display:block">Sin pistas todav\xEDa. Libera a los resonantes y mira bajo las vitrinas vac\xEDas.</p>';
    $("#journal").innerHTML = header + order + clues;
    $("#jx").addEventListener("click", () => show("#journal", false));
  }

  // js/flow/dossier.js
  var exploreHint = () => say(`Resonantes liberados: ${S.freed.size}/3 \xB7 abre cada vitrina y escucha su historia completa \xB7 gira con los bordes, \u2190 \u2192 o los botones`);
  var durOf = (id) => Aud.buf[id] ? Aud.buf[id].duration : RES[id].dur;
  function openEmptyShowcase(u) {
    const r = S.run;
    if (u.i === r.secret && !r.secretFound) {
      r.secretFound = true;
      addClue("Bajo una peana hay un glifo grabado: " + RES[r.culprit].glyph.split(" ")[0] + ". Busca d\xF3nde lo has visto.");
      say("Algo brilla bajo la peana: encontraste una pista.");
    } else {
      say("Vitrina vac\xEDa: este eco a\xFAn no despierta.");
    }
  }
  function openDoss(u) {
    if (!u.id) {
      openEmptyShowcase(u);
      return;
    }
    const order = S.run.order;
    if (order) {
      const next = order.find((x) => !S.freed.has(x));
      if (next && next !== u.id && !S.freed.has(u.id)) {
        say("La vitrina de " + RES[u.id].name + " no responde a\xFAn. Relee la carta: el orden importa.");
        return;
      }
    }
    if (S.freed.has(u.id)) {
      say(RES[u.id].name + " ya fue liberado. Su historia queda a salvo.");
      return;
    }
    const r = RES[u.id];
    S.dossier = u.id;
    $("#dm").textContent = `Expediente R-0${r.n} \xB7 lengua de Deileanna`;
    $("#dg").textContent = r.glyph;
    $("#di").src = r.img;
    $("#dn").textContent = r.name;
    $("#de").textContent = r.epi;
    $("#dt").textContent = r.txt;
    S.heard[u.id] = S.heard[u.id] || 0;
    S.playing = true;
    startVoice();
    updDoss();
    S.yawT = r.angle + 0.35;
    show("#dossier");
    say("");
  }
  function closeDoss() {
    if (!S.dossier) return;
    S.dossier = null;
    S.playing = false;
    if (S.dv) S.dv.stop();
    S.dv = null;
    show("#dossier", false);
    $("#dx").textContent = "Cerrar";
    $("#dp").style.visibility = "";
    S.moodT = 0.2 + 0.12 * S.freed.size;
    exploreHint();
    if (S.freed.size === 3) {
      $("#adv").textContent = "Seguir el pasillo hacia el n\xFAcleo";
      show("#adv");
    }
  }
  function startVoice() {
    const id = S.dossier;
    if (S.dv) S.dv.stop();
    S.dv = Aud.voice(id, {
      vol: 0.6,
      orbit: true,
      buf: Aud.buf[id],
      offset: S.heard[id],
      shift: S.run.shift,
      corr: () => S.lost.has(id) ? 0.4 : 0
    });
    $("#dp").textContent = "Pausar";
  }
  function togglePlayback() {
    if (!S.dossier) return;
    S.playing = !S.playing;
    if (S.playing) {
      startVoice();
    } else {
      if (S.dv) S.dv.stop();
      S.dv = null;
      $("#dp").textContent = "Reanudar";
    }
  }
  function updDoss() {
    const id = S.dossier, d = durOf(id), h = Math.min(S.heard[id], d);
    $("#dbar").style.width = h / d * 100 + "%";
    $("#dtm").textContent = fmt(h) + " / " + fmt(d);
    $("#dst").textContent = S.freed.has(id) ? RES[id].name + " qued\xF3 liberado" : (S.lost.has(id) ? "da\xF1ado" : "sano") + " \xB7 escucha hasta el final para liberarlo";
  }
  function liberate(id) {
    S.freed.add(id);
    S.playing = false;
    if (S.dv) S.dv.stop();
    S.dv = null;
    W.freeVit(id);
    Aud.chime();
    S.moodT = 0.2 + 0.12 * S.freed.size;
    const damaged = S.lost.has(id);
    const testimony = damaged ? "el registro est\xE1 da\xF1ado y solo se entiende ruido." : CLUES[id][S.run.culprit];
    addClue(RES[id].name + ": \xAB" + testimony + "\xBB");
    $("#dt").textContent = RES[id].txt + "\n\nTestimonio: " + testimony;
    updDoss();
    $("#dx").textContent = "Continuar";
    $("#dp").style.visibility = "hidden";
  }

  // js/config.js
  var CONFIG = {
    audio: {
      urban: null,
      doors: null,
      nyxa: "audios/Nyxa.mp3",
      tala: "audios/Tala.mp3",
      volt: "audios/Volt entero.mp3",
      bit0: "audios/Rythden.mp3",
      bit1: "audios/Rythden2.mp3",
      bit2: "audios/Dra Selene.mp3",
      core: "audios/Naxaly.mp3"
    },
    models: { city: null, gal: null, core: null, flor: null }
  };

  // js/flow/studio.js
  var SLOTS = [
    ["a", "urban", "Ambiente urbano (vista 1)"],
    ["a", "doors", "Puertas del museo"],
    ["a", "nyxa", "Historia de Nyxa"],
    ["a", "tala", "Historia de Tala"],
    ["a", "volt", "Historia de Volt"],
    ["a", "bit0", "Bit\xE1cora de Rythden 1"],
    ["a", "bit1", "Bit\xE1cora de Rythden 2"],
    ["a", "bit2", "Bit\xE1cora de Rythden 3"],
    ["a", "core", "Eco final del n\xFAcleo"],
    ["m", "city", "Entorno 3D: ciudad (.glb)"],
    ["m", "gal", "Entorno 3D: teseracto (.glb)"],
    ["m", "core", "Entorno 3D: n\xFAcleo (.glb)"]
  ];
  async function loadSlot(type, key, data) {
    if (type === "a") {
      await Aud.load(key, data);
      if (RES[key]) RES[key].dur = Aud.buf[key].duration;
    } else {
      await new Promise((ok, no) => new THREE.GLTFLoader().parse(data, "", (g) => {
        W.setEnv(key, g.scene);
        ok();
      }, no));
    }
  }
  async function loadConfig() {
    const jobs = [
      ...Object.entries(CONFIG.audio).map(([k, u]) => ["a", k, u]),
      ...Object.entries(CONFIG.models).map(([k, u]) => ["m", k, u])
    ].filter((j) => j[2]);
    for (const [t, k, u] of jobs) {
      try {
        await loadSlot(t, k, await (await fetch(u)).arrayBuffer());
      } catch (e) {
        console.warn("No se pudo cargar", u);
      }
    }
  }
  function initStudio() {
    const st = $("#studio");
    st.innerHTML = '<p class="m"><span>Estudio \xB7 reemplaza audios y entornos</span><button id="sx" style="padding:2px 8px">Cerrar</button></p>' + SLOTS.map(
      ([t, k, l], i) => `<label class="sl"><span>${l}</span><input type="file" data-i="${i}" accept="${t === "a" ? "audio/*" : ".glb,.gltf"}"${t === "a" ? " multiple" : ""}><em></em></label>`
    ).join("") + '<p class="m" style="display:block">Los .glb reemplazan la decoraci\xF3n de cada zona; puertas, flor y vitrinas se conservan. Cada audio de resonante define cu\xE1nto hay que escuchar para liberarlo. Puedes subir varios audios por casilla: cada ciclo usa uno distinto al azar.</p><button id="sr">Restaurar valores</button>';
    st.querySelectorAll("input").forEach((inp) => inp.addEventListener("change", async () => {
      const [t, k] = SLOTS[+inp.dataset.i], em = inp.nextElementSibling, files = [...inp.files];
      if (!files.length) return;
      em.textContent = "cargando\u2026";
      try {
        for (const f of files) await loadSlot(t, k, await f.arrayBuffer());
        em.textContent = "listo: " + files.length + " archivo(s)";
      } catch (e) {
        em.textContent = "no se pudo leer el archivo";
      }
    }));
    $("#sx").addEventListener("click", () => show("#studio", false));
    $("#stu").addEventListener("click", () => show("#studio", !st.classList.contains("on")));
    $("#sr").addEventListener("click", () => {
      Object.keys(Aud.buf).forEach((k) => Aud.clear(k));
      ["city", "gal", "core"].forEach((z) => W.setEnv(z, null));
      Object.values(RES).forEach((r) => {
        r.dur = 30;
      });
      st.querySelectorAll("input").forEach((i) => {
        i.value = "";
        i.nextElementSibling.textContent = "";
      });
    });
  }

  // js/flow/intro.js
  function letterText() {
    $("#lt1").textContent = S.cycle ? "Para ti," : "Adri\xE1n,";
    $("#lt2").textContent = `Calle de los Naranjos 17, Museo Central, puerta ${W.doorIdx + 1}.`;
    $("#lt0").textContent = OPEN[S.cycle % OPEN.length];
    const r = S.run, epi = (i) => RES[i].epi.toLowerCase();
    let t = "Una pregunta te espera: " + r.q;
    if (r.order) t += " Libera primero a " + epi(r.order[0]) + ", despu\xE9s a " + epi(r.order[1]) + " y al final a " + epi(r.order[2]) + ".";
    if (S.lost.size) t += " Cuidado: " + [...S.lost].map((i) => RES[i].name).join(" y ") + " qued\xF3 da\xF1ado tras tu \xFAltima visita.";
    $("#lt3").textContent = t;
  }
  function begin() {
    Aud.init();
    loadConfig().then(() => Aud.urban(true));
    show("#intro", false);
    S.lock = false;
    newRun();
    letterText();
    say("Algo brilla entre tanto gris. Ac\xE9rcate a la flor.");
  }
  function openLetter() {
    Aud.ping();
    S.letter = true;
    show("#letter");
    say("");
  }
  function cross() {
    S.letter = false;
    S.lock = true;
    show("#letter", false);
    Aud.doors();
    W.openDoor();
    S.moodT = 0.2;
    const gp = W.galPos(), lk = gp.clone().add(W.dirV(0));
    setTimeout(() => W.fly(gp, lk, 6.5, () => {
      W.yaw = 0;
      W.free = "gal";
      S.lock = false;
      setPhase(1);
      show("#arrows");
      exploreHint();
    }, 1.5), 1200);
  }

  // js/flow/restart.js
  function restart() {
    if (S.busy) return;
    S.busy = true;
    clearTimeout(S.rt);
    $("#fade").style.opacity = 1;
    setTimeout(() => {
      if (S.cv) S.cv.stop();
      S.cv = null;
      S.cycle++;
      S.seen.clear();
      S.lost = S.nextLost || /* @__PURE__ */ new Set();
      S.nextLost = null;
      Aud.shuffle();
      newRun();
      S.heard = {};
      S.freed.clear();
      S.playing = false;
      S.mood = S.moodT = 0;
      S.glitch = S.glitchT = 0;
      S.step = 0;
      S.yawT = null;
      hideAll();
      W.resetVit();
      W.setDoor((2 + S.cycle * 2) % 5);
      W.setFlower(W.fl1, "neon");
      W.setFlower(W.fl2, "none");
      W.home();
      setPhase(0);
      letterText();
      Aud.urban(true);
      say("La ciudad vuelve a sonar. Otra puerta, otra flor.");
      $("#fade").style.opacity = 0;
      S.lock = false;
      S.busy = false;
    }, 1100);
  }

  // js/flow/finale.js
  function toCore() {
    S.saved = new Set(S.tracks.filter((t) => t.locked).map((t) => t.id));
    S.nextLost = new Set(S.tracks.filter((t) => !t.locked).map((t) => t.id));
    S.recovered = S.saved.size;
    S.tracks.forEach((t) => t.v.stop());
    S.tracks = [];
    S.lock = true;
    S.step = 0;
    setPhase(3);
    S.glitchT = 0;
    S.moodT = 1;
    show("#tracks", false);
    const p = W.CORE.clone().add(new THREE.Vector3(0, 0.5, 6));
    W.fly(p, W.CORE.clone().add(new THREE.Vector3(0, 0.2, 0)), 7, arriveAtCore, 3);
  }
  function arriveAtCore() {
    W.free = "core";
    S.lock = false;
    $("#w1").textContent = "Sael Vantorin aguarda en el n\xFAcleo. " + (S.saved.size ? "Salvaste los registros de " + [...S.saved].map((i) => RES[i].name).join(" y ") + "." : "Ning\xFAn registro sobrevivi\xF3.");
    $("#w2").textContent = "";
    show("#wall");
    setTimeout(() => {
      $("#w2").textContent = "T\xFA, que est\xE1s escuchando: \xBFqu\xE9 parte de tu propio pasado sigues cargando como si te perteneciera?";
      say("Toca la flor sin color.");
    }, 3500);
  }
  function openAccuse() {
    S.step = 1;
    say("");
    const c = $("#choices");
    $("#w1").textContent = "Sael Vantorin pregunta:";
    $("#w2").textContent = S.run.q;
    c.innerHTML = IDS.map((i) => `<button data-i="${i}">${RES[i].name}</button>`).join("");
    c.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => accuse(b.dataset.i)));
    show("#choices");
  }
  function accuse(id) {
    S.verdict = id;
    const ok = id === S.run.culprit;
    if (ok) S.solved++;
    show("#choices", false);
    $("#w1").textContent = ok ? "Sael asiente despacio." : "Sael niega con la cabeza.";
    $("#w2").textContent = ok ? RES[S.run.culprit].name + " lo confirma con su silencio." : "No era " + RES[S.verdict].name + ". La verdad sigue en el museo.";
    setTimeout(openChoices, 3500);
  }
  function openChoices() {
    S.step = 1;
    say("");
    const c = $("#choices");
    c.innerHTML = RELEASE.map((r) => `<button>${r}</button>`).join("");
    c.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => release(b.textContent)));
    show("#choices");
    $("#w1").textContent = "\xBFQu\xE9 est\xE1s dispuesto a soltar?";
    $("#w2").textContent = "T\xFA, que est\xE1s escuchando: \xBFqu\xE9 parte de tu propio pasado sigues cargando como si te perteneciera?";
  }
  function release(what) {
    S.step = 2;
    show("#choices", false);
    show("#wall", false);
    W.setFlower(W.fl2, "warm");
    Aud.chime();
    S.cv = Aud.voice("rythden", { buf: Aud.buf.core, loop: true, root: 196, vol: 0.4, orbit: true });
    const ok = S.verdict === S.run.culprit;
    const ending = ok ? S.saved.size >= 2 ? "A" : "B" : S.saved.size >= 2 ? "C" : "D";
    $("#fl").textContent = `${ENDS[ending]} Era ${RES[S.run.culprit].name}. Soltaste: \xAB${what}\xBB y el color vuelve.`;
    $("#fc").textContent = `registros salvados: ${S.recovered}/3 \xB7 casos resueltos: ${S.solved}`;
    show("#final");
    S.rt = setTimeout(restart, 14e3);
  }

  // js/flow/fracture.js
  var DAYS = [112, 131, 148];
  var corruptionOf = (t) => t.dead ? 1 : t.locked ? 0 : Math.pow(1 - t.int, 0.7);
  function trackRowHTML(i) {
    return `<div class="tr" data-i="${i}"><div class="m"><span>registro de ${RES[S.run.tmap[i]].name} \xB7 d\xEDa ${DAYS[i]}</span><span class="st">corrupto</span><span class="tm">00:00 / 02:31</span></div><canvas width="360" height="40"></canvas><div class="bar"><i></i></div></div>`;
  }
  function fracture() {
    setPhase(2);
    show("#adv", false);
    show("#arrows", false);
    say("");
    Aud.boom();
    S.glitchT = 1;
    S.moodT = 0.55;
    $("#tracks").innerHTML = '<p class="m"><span>Bit\xE1cora de Rythden \xB7 mant\xE9n presionado un registro para estabilizarlo</span></p>' + [0, 1, 2].map(trackRowHTML).join("") + '<div class="bar" style="margin-top:6px"><i id="tmr" style="background:var(--accent);width:100%"></i></div>';
    S.tracks = [0, 1, 2].map((i) => {
      const t = { id: S.run.tmap[i], int: 0.35 + Math.random() * 0.15, locked: false, dead: false, t0: performance.now() };
      t.v = Aud.voice("rythden", {
        buf: Aud.buf["bit" + i],
        loop: true,
        root: [196, 233, 175][i],
        pan: [-0.7, 0, 0.7][i],
        vol: 0.3,
        corr: () => corruptionOf(t)
      });
      return t;
    });
    S.tleft = 32;
    S.surge = 3.5;
    S.held = -1;
    show("#tracks");
    document.querySelectorAll(".tr").forEach((el) => {
      el.addEventListener("pointerdown", () => {
        S.held = +el.dataset.i;
      });
    });
  }
  function surgeRandomTrack() {
    S.surge = 3.5;
    const open = S.tracks.filter((t) => !t.locked && !t.dead);
    if (open.length) open[Math.floor(Math.random() * open.length)].int -= 0.12;
  }
  function updateTrack(t, i, dt) {
    if (!t.locked && !t.dead) {
      t.int += (S.held === i ? 0.14 : -0.09) * dt;
      if (t.int >= 1) {
        t.int = 1;
        t.locked = true;
        Aud.ping();
        addClue(FRAG[t.id][t.id === S.run.culprit ? 1 : 0]);
      }
      if (t.int <= 0) {
        t.int = 0;
        t.dead = true;
        t.v.stop();
      }
    }
    if (!t.dead) t.v.vol(S.held === i ? 0.7 : 0.3);
  }
  function renderRow(el, t, i, c) {
    if (!el) return;
    el.classList.toggle("hold", S.held === i);
    el.querySelector(".st").textContent = t.dead ? "borrado" : t.locked ? "estable" : "corrupto";
    el.querySelector(".tm").textContent = t.dead ? "--:-- / 02:31" : fmt((performance.now() - t.t0) / 1e3 % 151) + " / 02:31";
    const b = el.querySelector(".bar i");
    b.style.width = t.int * 100 + "%";
    b.style.background = t.locked ? "#e0b25a" : "#FF007F";
    wave(el.querySelector("canvas"), t.dead ? null : t.v.an, c);
  }
  function tickTracks(dt) {
    S.tleft -= dt;
    S.surge -= dt;
    if (S.surge <= 0) surgeRandomTrack();
    const rows = document.querySelectorAll(".tr");
    let corruption = 0, open = 0;
    S.tracks.forEach((t, i) => {
      updateTrack(t, i, dt);
      const c = corruptionOf(t);
      corruption += c;
      if (!t.locked && !t.dead) open++;
      renderRow(rows[i], t, i, c);
    });
    $("#tmr").style.width = clamp(S.tleft / 32, 0, 1) * 100 + "%";
    S.glitchT = 0.15 + 0.85 * (corruption / 3);
    if (!open || S.tleft <= 0) toCore();
  }

  // js/flow/tick.js
  var lastAccent = -1;
  function updateAmbience(dt) {
    S.mood += (S.moodT - S.mood) * Math.min(1, dt * 1.2);
    S.glitch += ((RM ? S.glitchT * 0.35 : S.glitchT) - S.glitch) * Math.min(1, dt * 3);
    document.body.classList.toggle("broken", S.glitch > 0.2);
    if (Math.abs(S.mood - lastAccent) > 0.01) {
      lastAccent = S.mood;
      const c = new THREE.Color(11901618).lerp(new THREE.Color(14725722), S.mood);
      document.documentElement.style.setProperty("--accent", "#" + c.getHexString());
    }
  }
  function updateGalleryTurn(dt) {
    if (S.p !== 1 || W.free !== "gal") return;
    if (S.yawT != null) {
      const d = Math.atan2(Math.sin(S.yawT - W.yaw), Math.cos(S.yawT - W.yaw));
      W.yaw += d * Math.min(1, dt * 2.5);
      if (Math.abs(d) < 0.01) S.yawT = null;
    } else if (!S.dossier) {
      const edge = S.mouse && Math.abs(W.mx) > 0.5 ? Math.sign(W.mx) * (Math.abs(W.mx) - 0.5) * 2 : 0;
      W.yaw += (S.dir + edge) * dt;
    }
  }
  function updateDossierPlayback(dt) {
    if (!S.dossier || !S.dv) return;
    wave($("#dw"), S.dv.an, 0);
    if (S.playing && !S.freed.has(S.dossier)) {
      S.heard[S.dossier] += dt;
      updDoss();
      if (S.heard[S.dossier] >= durOf(S.dossier)) liberate(S.dossier);
    }
  }
  function tick(dt) {
    updateAmbience(dt);
    updateGalleryTurn(dt);
    updateDossierPlayback(dt);
    if (S.p === 2 && S.tracks.length) tickTracks(dt);
    if (S.step === 2 && S.cv) wave($("#fw"), S.cv.an, 0);
    FX.draw(S.glitch);
  }

  // js/flow/input.js
  function hoveredSomething(e) {
    if (S.lock) return false;
    if (S.p === 0 && !S.letter) return !!W.pick([W.fl1.hit], e);
    if (S.p === 1 && !S.dossier) return !!W.pick(W.glass, e);
    if (S.p === 3 && S.step === 0) return !!W.pick([W.fl2.hit], e);
    return false;
  }
  function onCanvasClick(e) {
    if (S.lock) return;
    if (S.p === 0 && !S.letter && W.pick([W.fl1.hit], e)) {
      openLetter();
    } else if (S.p === 1 && !S.dossier) {
      const o = W.pick(W.glass, e);
      if (o) openDoss(o.userData);
    } else if (S.p === 3 && S.step === 0 && W.pick([W.fl2.hit], e)) {
      openAccuse();
    }
  }
  function initInput() {
    const cv = $("#gl");
    cv.addEventListener("pointermove", (e) => {
      S.mouse = e.pointerType === "mouse";
      const r = cv.getBoundingClientRect();
      W.mx = (e.clientX - r.left) / r.width * 2 - 1;
      W.my = (e.clientY - r.top) / r.height * 2 - 1;
      W.hov = hoveredSomething(e);
      cv.style.cursor = W.hov ? "pointer" : "default";
    });
    cv.addEventListener("click", onCanvasClick);
    addEventListener("keydown", (e) => {
      if (!W.visible) return;
      if (e.key === "ArrowLeft") S.dir = -1;
      if (e.key === "ArrowRight") S.dir = 1;
      if (e.key === "Escape") closeDoss();
    });
    addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") S.dir = 0;
    });
    [["#aL", -1], ["#aR", 1]].forEach(([sel, dir]) => {
      const b = $(sel);
      b.addEventListener("pointerdown", () => {
        S.dir = dir;
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => {
        S.dir = 0;
      }));
    });
    addEventListener("pointerup", () => {
      S.held = -1;
    });
    addEventListener("pointercancel", () => {
      S.held = -1;
    });
    $("#go").addEventListener("click", begin);
    $("#cross").addEventListener("click", cross);
    $("#dx").addEventListener("click", closeDoss);
    $("#dp").addEventListener("click", togglePlayback);
    $("#adv").addEventListener("click", fracture);
    $("#again").addEventListener("click", restart);
    $("#jb").addEventListener("click", () => show("#journal", !$("#journal").classList.contains("on")));
    $("#snd").addEventListener("click", (e) => {
      S.muted = !S.muted;
      Aud.mute(S.muted);
      e.target.textContent = S.muted ? "Sonido silenciado" : "Sonido activado";
      e.target.setAttribute("aria-pressed", !S.muted);
    });
  }

  // js/site.js
  var $$ = (s) => [...document.querySelectorAll(s)];
  var NOTES = {
    n1: ["Anotaci\xF3n de la Dra. Marlowe: el museo no aparece en los mapas porque no est\xE1 en el espacio. Est\xE1 en lo que dejamos de decir.", "El punto del logotipo"],
    n2: ["Rythden: los p\xE9talos caen hacia arriba cuando alguien est\xE1 a punto de recordar.", "Un p\xE9talo que no cay\xF3"],
    n3: ["Si subrayaste lo que nadie quer\xEDa leer, el archivo ya te cuenta como testigo.", "Tinta invisible"],
    n4: ["Los glifos de Deileanna no se leen: se escuchan. Prueba con aud\xEDfonos.", "Glifo bajo la luz"],
    n5: ["Naxaly dobla el tiempo, pero no puede devolverlo. \xDAsalo para escuchar, no para huir.", "Expediente 5"],
    n6: ["Cada ciclo, otra puerta. Cada puerta, otra flor. Esta vez, \xBFpara qui\xE9n?", "Al final de la p\xE1gina"],
    n7: ["Adri\xE1n: las encontraste todas. No s\xE9 qui\xE9n eres, pero la flor ya sabe tu nombre. Sube y cruza la puerta.", "La s\xE9ptima nota"]
  };
  var TABS = [
    "Deileanna es la civilizaci\xF3n milenaria que canalizaba la Resonancia Primordial. De sus ruinas vienen los glifos que decoran cada expediente.",
    "Sael Vantorin se fragment\xF3 en ocho semillas: Rythden, Nyxa, Tala, Volt, Kael, Lyra, Virena y Naxaly. El museo es el anclaje que las protege.",
    "El Pulso es el evento que fractur\xF3 Khaelos. Dej\xF3 los archivos de audio incompletos, las l\xEDneas temporales distorsionadas y una energ\xEDa fucsia que corrompe los recuerdos."
  ];
  var found = [];
  try {
    found = JSON.parse(localStorage.getItem("ecos-notas") || "[]");
  } catch (e) {
  }
  var chip = () => {
    $("#chip").hidden = !found.length;
    $("#cc").textContent = found.length;
  };
  function openNote(id) {
    if (!NOTES[id]) return;
    if (!found.includes(id)) {
      found.push(id);
      try {
        localStorage.setItem("ecos-notas", JSON.stringify(found));
      } catch (e) {
      }
    }
    $("#nt").textContent = NOTES[id][0];
    $("#nf").textContent = NOTES[id][1] + " \xB7 " + found.length + "/7";
    $("#note").hidden = false;
    chip();
  }
  function closeNote() {
    $("#note").hidden = true;
    if (found.filter((n) => n !== "n7").length === 6 && !found.includes("n7")) setTimeout(() => openNote("n7"), 500);
  }
  var plDown = null;
  var CTRL = ".pl,[data-note],a,button";
  function initSite() {
    $("#play").addEventListener("click", (e) => {
      e.preventDefault();
      $("#game").scrollIntoView({ behavior: "smooth" });
      if ($("#intro").classList.contains("on")) $("#go").click();
    });
    $(".ff").innerHTML = Array.from({ length: 16 }, () => `<i style="--x:${Math.random() * 100}%;--y:${40 + Math.random() * 55}%;--d:${4 + Math.random() * 6}s;--dx:${Math.random() * 60 - 30}px"></i>`).join("");
    const layers = $$(".sc .l");
    const move = (x, y) => layers.forEach((l) => {
      l.style.setProperty("--k", (+l.dataset.d || 10) / 10);
      l.style.setProperty("--px", x * -6 + "px");
      l.style.setProperty("--py", y * -3 + "px");
    });
    $("#game").addEventListener("pointermove", (e) => {
      const r = $("#game").getBoundingClientRect();
      move((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }), { threshold: 0.15 });
    const sp = () => $$("[data-speed]").forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `0 ${(r.top - innerHeight / 2) * el.dataset.speed}px`;
    });
    addEventListener("scroll", () => {
      requestAnimationFrame(sp);
    }, { passive: true });
    const nav = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) $$("#nav .lk a").forEach((a) => a.classList.toggle("on", a.hash === "#" + e.target.id));
    }), { threshold: 0.35 });
    $$(".sec").forEach((s) => nav.observe(s));
    const tab = (k) => {
      $$(".tabs button").forEach((b, i) => b.classList.toggle("on", i === k));
      $("#tabtx").style.opacity = 0;
      setTimeout(() => {
        $("#tabtx").textContent = TABS[k];
        $("#tabtx").style.opacity = 1;
      }, 200);
    };
    $$(".tabs button").forEach((b, i) => b.onclick = () => tab(i));
    tab(0);
    addEventListener("pointerdown", (e) => {
      plDown = e.target.closest && e.target.closest(".pl") || null;
    }, true);
    $$(".cc").forEach((c) => {
      const flip = () => {
        $$(".cc").forEach((o) => o !== c && o.classList.remove("sel2"));
        c.classList.toggle("flipped");
        c.classList.add("sel2");
        c.style.transform = "";
      };
      c.onclick = (e) => {
        if (plDown || e.target.closest(CTRL)) return;
        flip();
      };
      c.onkeydown = (e) => {
        if (e.target.closest(CTRL)) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          flip();
        }
      };
      c.onpointermove = (e) => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", x * 100 + "%");
        c.style.setProperty("--my", y * 100 + "%");
        if (e.pointerType === "mouse" && !c.classList.contains("flipped")) c.style.transform = `rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 14}deg)`;
      };
      c.onpointerleave = () => {
        c.style.transform = "";
      };
    });
    $$(".ep").forEach((c) => {
      const t = () => {
        const o = c.classList.toggle("open");
        c.setAttribute("aria-expanded", o);
      };
      c.onclick = (e) => {
        if (!e.target.closest("button,[data-note]")) t();
      };
      c.onkeydown = (e) => {
        if (e.key === "Enter") t();
      };
      c.onpointermove = (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      };
    });
    $$(".rv").forEach((el) => io.observe(el));
    const env = $("#env"), tg = () => env.setAttribute("aria-expanded", env.getAttribute("aria-expanded") !== "true");
    env.onclick = tg;
    env.onkeydown = (e) => {
      if (e.key === "Enter") tg();
    };
    const ph = $("#pho");
    ph.onclick = () => ph.classList.toggle("open");
    ph.onkeydown = (e) => {
      if (e.key === "Enter") ph.classList.toggle("open");
    };
    $$(".rd").forEach((r) => {
      r.onclick = (e) => {
        if (plDown || e.target.closest(".pl")) return;
        r.classList.toggle("on");
      };
      r.onkeydown = (e) => {
        if (e.target.closest(".pl")) return;
        if (e.key === "Enter") r.classList.toggle("on");
      };
    });
    const ty = $("#typ");
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      let i = 0;
      const t = ty.dataset.t;
      const step = () => {
        ty.textContent = t.slice(0, ++i);
        if (i < t.length) setTimeout(step, 35);
      };
      step();
    }, { threshold: 0.6 }).observe(ty);
    const wh = $$(".wh"), halo = $("#halo");
    let mx = -999, my = -999;
    const prox = () => wh.forEach((w) => {
      const r = w.getBoundingClientRect();
      w.style.setProperty("--o", Math.max(0, 1 - Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) / 200).toFixed(2));
    });
    const aim = (e) => {
      mx = e.clientX;
      my = e.clientY;
      halo.style.setProperty("--hx", mx + "px");
      halo.style.setProperty("--hy", my + "px");
      requestAnimationFrame(prox);
    };
    addEventListener("pointermove", aim);
    addEventListener("pointerdown", aim);
    addEventListener("scroll", () => requestAnimationFrame(prox), { passive: true });
    new IntersectionObserver(([e]) => document.body.classList.toggle("ingame", e.isIntersecting), { threshold: 0.6 }).observe($("#game"));
    new IntersectionObserver(([e]) => {
      W.visible = e.isIntersecting;
      Aud.mute(!e.isIntersecting || S.muted);
    }, { threshold: 0.05 }).observe($("#game"));
    window.__ecos = 1;
    let cur = null, curBtn = null;
    const stopAud = () => {
      if (cur) {
        cur.pause();
        curBtn.textContent = curBtn.dataset.l || "\u25B6 Escuchar";
        cur = curBtn = null;
      }
    };
    document.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest(".pl") || plDown;
      plDown = null;
      if (!b) return;
      const same = curBtn === b;
      stopAud();
      if (same) return;
      cur = new Audio(encodeURI(b.dataset.audio));
      curBtn = b;
      cur.onended = stopAud;
      cur.onerror = () => {
        b.textContent = "Audio no disponible";
        cur = curBtn = null;
      };
      cur.play().then(() => {
        b.textContent = "\u275A\u275A Pausar";
      }).catch(() => {
        b.textContent = "Audio no disponible";
        cur = curBtn = null;
      });
    });
    $("#nav .logo").title = "Volver a la portada";
    $("#nav .logo").addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", location.pathname);
      scrollTo(0, 0);
      location.reload();
    });
    $$(".tm").forEach((c) => {
      const t = () => c.classList.toggle("on");
      c.onclick = (e) => {
        if (!e.target.closest("a")) t();
      };
      c.onkeydown = (e) => {
        if (e.key === "Enter") t();
      };
    });
    (() => {
      if (!matchMedia("(hover:hover) and (pointer:fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cv = document.createElement("canvas"), cx = cv.getContext("2d");
      cv.setAttribute("aria-hidden", "true");
      cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100";
      document.body.appendChild(cv);
      const size = () => {
        const d = Math.min(devicePixelRatio || 1, 2);
        cv.width = innerWidth * d;
        cv.height = innerHeight * d;
        cx.setTransform(d, 0, 0, d, 0, 0);
      };
      size();
      addEventListener("resize", size);
      const COL = ["154,120,166", "216,200,230", "216,200,230", "255,77,166"], P = [], MAX = 48;
      let lx = -99, ly = -99, raf = 0, last2 = 0;
      const loop2 = (t) => {
        const dt = Math.min(48, t - last2) / 16.7;
        last2 = t;
        cx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = P.length - 1; i >= 0; i--) {
          const p = P[i];
          p.l -= dt;
          if (p.l <= 0) {
            P.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.985;
          cx.fillStyle = `rgba(${p.c},${(Math.min(1, p.l / p.m) * 0.7).toFixed(2)})`;
          cx.beginPath();
          if (p.pt) cx.ellipse(p.x, p.y, p.r * 1.6, p.r * 0.9, p.rot, 0, 6.283);
          else cx.arc(p.x, p.y, p.r, 0, 6.283);
          cx.fill();
        }
        raf = P.length ? requestAnimationFrame(loop2) : 0;
      };
      addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse" || document.hidden) return;
        if (document.body.classList.contains("ingame") && !$("#intro").classList.contains("on")) return;
        if (Math.hypot(e.clientX - lx, e.clientY - ly) < 26) return;
        lx = e.clientX;
        ly = e.clientY;
        if (P.length >= MAX) P.shift();
        const l = 55 + Math.random() * 40;
        P.push({ x: lx + Math.random() * 10 - 5, y: ly + Math.random() * 10 - 5, vx: Math.random() * 0.6 - 0.3, vy: -(0.25 + Math.random() * 0.45), r: 1 + Math.random() * 1.6, c: COL[Math.random() * COL.length | 0], l, m: l, pt: Math.random() < 0.3, rot: Math.random() * 3 });
        if (!raf) {
          last2 = performance.now();
          raf = requestAnimationFrame(loop2);
        }
      }, { passive: true });
    })();
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-note]");
      if (t) {
        e.preventDefault();
        openNote(t.dataset.note);
      }
    });
    document.addEventListener("selectionchange", () => {
      const s = getSelection();
      if (s.rangeCount && !s.isCollapsed && s.containsNode($("#n3"), true)) openNote("n3");
    });
    $("#nx").onclick = closeNote;
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#note").hidden) closeNote();
    });
    $("#chip").onclick = () => openNote(found[found.length - 1]);
    chip();
    sp();
    console.log("%c\u273F Hay 7 notas escondidas en esta p\xE1gina.", "color:#c46a9a");
  }

  // js/main.js
  initStudio();
  initSite();
  initInput();
  var last = performance.now();
  function loop(now2) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now2 - last) / 1e3);
    last = now2;
    tick(dt);
    W.update(dt, now2 / 1e3);
  }
  loop(last);
  W.home();
})();
