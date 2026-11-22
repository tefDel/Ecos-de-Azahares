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
    maxHeard: {},
    // punto más lejano escuchado por resonante
    freed: /* @__PURE__ */ new Set(),
    // resonantes liberados
    playing: false,
    seeking: false,
    resumeAfterSeek: false,
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

  // js/data.js
  var PHASES = ["Detonante", "Teseracto", "Fractura", "N\xFAcleo"];
  var IDS = ["nyxa", "tala", "volt"];
  var CHARACTER_COLORS = Object.freeze({
    volt: "#FFD60A",
    nyxa: "#9B59E0",
    lyra: "#5CCBFF",
    tala: "#A9713B",
    naxaly: "#FF2E93",
    kael: "#E32B2B",
    rythden: "#3A5F8A",
    selene: "#3A5F8A",
    virena: "#8FE388",
    adrian: "#6E8B3D",
    fractura: "#6F36A3"
  });
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
  function createFlower(imageUrl, imageMode = "always") {
    const g = new THREE.Group(), pets = [];
    const art = new THREE.Group();
    g.add(art);
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Group();
      const m = basic(16711807, { transparent: true });
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), m);
      petal.rotation.z = i * Math.PI * 2 / 5;
      s.scale.set(0.6, 1.15, 0.22);
      s.position.y = 0.42;
      petal.add(s);
      art.add(petal);
      pets.push(m);
    }
    const cm = basic(16770033);
    art.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), cm));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 16711807,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.5
    }));
    glow.scale.set(3.2, 3.2, 1);
    glow.renderOrder = 1;
    g.add(glow);
    const f = {
      g,
      pets,
      cm,
      glow,
      s: 1,
      art,
      imageUrl,
      imageMode,
      imageVisible: Boolean(imageUrl) && imageMode === "always",
      imageLoaded: false
    };
    if (imageUrl) {
      const addImage = (tex) => {
        const H = 2.3, { width, height } = tex.image;
        const img = new THREE.Mesh(
          new THREE.PlaneGeometry(H * width / height, H),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
        );
        img.renderOrder = 2;
        g.add(img);
        f.img = img;
        f.imageLoaded = true;
        img.visible = f.imageVisible;
        art.visible = !f.imageVisible;
      };
      const onError = () => console.warn("No se pudo cargar", imageUrl, "\u2014 se usa la flor dibujada");
      if (location.protocol === "file:") {
        const image = new Image();
        image.className = "world-flower-image";
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        image.draggable = false;
        image.style.display = "none";
        $("#game").append(image);
        image.onload = () => {
          f.imageElement = image;
          f.imageHeight = 2.3;
          f.imageLoaded = true;
          art.visible = !f.imageVisible;
        };
        image.onerror = onError;
        image.src = imageUrl;
      } else {
        new THREE.TextureLoader().load(imageUrl, addImage, void 0, onError);
      }
    }
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), basic(0, { visible: false }));
    g.add(hit);
    f.hit = hit;
    return f;
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
    f.imageVisible = Boolean(f.imageUrl) && (f.imageMode === "always" || mode === f.imageMode);
    const showImage = f.imageLoaded && f.imageVisible;
    f.art.visible = !showImage;
    if (f.img) f.img.visible = showImage;
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
    /* Imágenes que sustituyen elementos dibujados con código (se usan tal cual, con su transparencia y proporción) */
    images: {
      florFucsia: "assets/imgs/IMGs_Trasmedia/florFucsia.png",
      florColores: "assets/imgs/IMGs_Trasmedia/florColores.png"
    },
    models: { city: null, gal: null, core: null, flor: null }
  };

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
    const flower = createFlower(CONFIG.images.florFucsia);
    setFlower(flower, "neon");
    group.add(flower.g);
    const decor = group.children.filter((c) => c !== flower.g && !doors3.some((d) => d.panel === c || d.back === c));
    return { group, doors: doors3, dust: dust2, flower, decor };
  }

  // js/world/vitrinas-extras.js
  var animate = (mesh, fn) => {
    mesh.onBeforeRender = () => fn(performance.now() / 1e3);
  };
  function fillTala(v) {
    const R = 0.55;
    const bump = (x, y, z) => 1 + 0.07 * Math.sin(x * 7.3 + y * 3.1) + 0.07 * Math.sin(y * 6.1 + z * 5.3) + 0.06 * Math.sin(z * 9.7 + x * 2.3);
    const geo = new THREE.DodecahedronGeometry(R, 3);
    const pos = geo.attributes.position, col = [];
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k), d = new THREE.Vector3(x, y, z).normalize(), n = bump(d.x, d.y, d.z);
      pos.setXYZ(k, x * n, y * n * 0.92, z * n);
      const mud = y < -0.12 ? 0.5 : 0.78 + 0.22 * Math.sin(x * 11 + z * 9 + y * 4);
      col.push(0.44 * mud, 0.3 * mud, 0.18 * mud);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    v.inner.add(new THREE.Mesh(geo, basic(16777215, { vertexColors: true })));
    const ochre = basic(16171610);
    const onStone = (x, y, side) => {
      const d = new THREE.Vector3(x, y, side).normalize(), r = R * bump(d.x, d.y, d.z) * 1.03;
      return new THREE.Vector3(d.x * r, d.y * r * 0.92, d.z * r);
    };
    const tube = (pts, closed) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, "catmullrom", 0.1), pts.length * 4, 0.016, 5, closed), ochre);
    [1, -1].forEach((side) => {
      const sx = side;
      const ring = [], dot = [];
      for (let k = 0; k < 28; k++) {
        const a = k / 28 * Math.PI * 2;
        ring.push(onStone(Math.cos(a) * 0.3 * sx, Math.sin(a) * 0.3 + 0.12, side));
        if (k % 2 === 0) dot.push(onStone(Math.cos(a) * 0.07 * sx, Math.sin(a) * 0.07 + 0.12, side));
      }
      v.inner.add(tube(ring, true), tube(dot, true));
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * Math.PI * 2 + 0.2;
        v.inner.add(tube([onStone(Math.cos(a) * 0.38 * sx, Math.sin(a) * 0.38 + 0.12, side), onStone(Math.cos(a) * 0.52 * sx, Math.sin(a) * 0.52 + 0.12, side)], false));
      }
      const zig = [-0.3, -0.15, 0, 0.15, 0.3].map((x, k) => onStone(x * sx, -0.3 - k % 2 * 0.09, side));
      v.inner.add(tube(zig, false));
    });
  }
  function fillVirena(v) {
    const sh = new THREE.Shape();
    sh.moveTo(0, -0.7);
    sh.bezierCurveTo(0.58, -0.35, 0.5, 0.35, 0, 0.78);
    sh.bezierCurveTo(-0.5, 0.35, -0.58, -0.35, 0, -0.7);
    const geo = new THREE.ShapeGeometry(sh, 24), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, Math.abs(p.getX(k)) * 0.45 - p.getY(k) * p.getY(k) * 0.12);
    geo.computeVertexNormals();
    const leaf = new THREE.Mesh(geo, basic(11070362, { side: THREE.DoubleSide }));
    const veins = [];
    veins.push(0, -0.7, 0, 0, 0.72, 0);
    [-0.45, -0.2, 0.05, 0.3].forEach((y) => {
      const w = 0.38 * (1 - Math.abs(y - 0.05) * 0.9);
      veins.push(0, y, 0, w, y + 0.2, w * 0.45, 0, y, 0, -w, y + 0.2, w * 0.45);
    });
    const vg = new THREE.BufferGeometry();
    vg.setAttribute("position", new THREE.Float32BufferAttribute(veins, 3));
    leaf.add(new THREE.LineSegments(vg, new THREE.LineBasicMaterial({ color: 5216842 })));
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 8), basic(7323494));
    stem.position.y = -0.88;
    leaf.add(stem);
    v.inner.add(leaf);
    const spores = [];
    for (let k = 0; k < 6; k++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), basic(15138777, { transparent: true, opacity: 0.85 }));
      v.inner.add(s);
      spores.push(s);
    }
    animate(leaf, (t) => {
      leaf.rotation.z = Math.sin(t * 1.1) * 0.1;
      leaf.rotation.x = Math.sin(t * 0.8) * 0.08;
      spores.forEach((s, k) => {
        const a = t * 0.6 + k * 1.05;
        s.position.set(Math.cos(a) * 0.85, Math.sin(a * 1.4 + k) * 0.7, Math.sin(a) * 0.85);
      });
    });
  }
  function fillLyra(v) {
    const cloud = new THREE.Group(), cm = basic(10476031, { transparent: true, opacity: 0.95 });
    [[0, 0, 0, 0.34], [-0.3, -0.06, 0.04, 0.26], [0.3, -0.06, -0.03, 0.27], [-0.13, 0.2, 0, 0.24], [0.15, 0.22, 0.02, 0.22]].forEach(([x, y, z, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), cm);
      m.position.set(x, y, z);
      cloud.add(m);
    });
    cloud.position.y = 0.3;
    v.inner.add(cloud);
    const bolt = new THREE.Shape();
    [[0.05, 0.2], [-0.1, -0.02], [0, -0.02], [-0.08, -0.24], [0.12, 0], [0.02, 0]].forEach(([x, y], k) => k ? bolt.lineTo(x, y) : bolt.moveTo(x, y));
    const el = [
      new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 10), basic(16730652)),
      // fuego
      new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), basic(3114751)),
      // agua
      new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), basic(9067059)),
      // roca
      new THREE.Mesh(new THREE.ShapeGeometry(bolt), basic(16769594, { side: THREE.DoubleSide }))
      // trueno
    ];
    el[3].scale.setScalar(1.3);
    el.forEach((m) => v.inner.add(m));
    animate(cloud.children[0], (t) => {
      cloud.position.y = 0.3 + Math.sin(t * 1.2) * 0.05;
      el.forEach((m, k) => {
        const a = t * 0.9 + k * Math.PI / 2;
        m.position.set(Math.cos(a) * 0.85, -0.35 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.85);
        m.rotation.y = a;
        if (k === 3) m.rotation.set(0, 0, 0), m.rotation.y = -a;
      });
    });
  }
  function oniMask(color) {
    const g = new THREE.Group(), red = basic(color), dark = basic(1705221), bone = basic(15918793), gold = basic(15249482);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), red);
    face.scale.set(0.82, 1, 0.42);
    g.add(face);
    [-1, 1].forEach((s) => {
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.05), dark);
      brow.position.set(s * 0.16, 0.17, 0.14);
      brow.rotation.z = -s * 0.45;
      g.add(brow);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), gold);
      eye.scale.set(1.6, 0.6, 0.6);
      eye.position.set(s * 0.15, 0.08, 0.15);
      g.add(eye);
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 8), bone);
      horn.position.set(s * 0.2, 0.45, 0.02);
      horn.rotation.z = -s * 0.35;
      g.add(horn);
      const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 6), bone);
      tusk.position.set(s * 0.12, -0.2, 0.14);
      g.add(tusk);
    });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.05), dark);
    mouth.position.set(0, -0.15, 0.16);
    g.add(mouth);
    return g;
  }
  function fillKael(v) {
    const pair = new THREE.Group(), a = oniMask(13836320), b = oniMask(10228242);
    a.position.set(-0.48, 0.05, 0);
    a.rotation.y = 0.3;
    b.position.set(0.48, -0.05, 0);
    b.rotation.y = -0.3;
    b.scale.setScalar(0.92);
    pair.add(a, b);
    v.inner.add(pair);
    const toCenter = Math.atan2(-v.bx, -v.bz);
    animate(a.children[0], (t) => {
      pair.rotation.y = toCenter + Math.sin(t * 0.9) * 0.4 - v.inner.rotation.y;
    });
  }
  var SKIN = { virena: fillVirena, lyra: fillLyra, kael: fillKael };

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
  function buildShowcase(id, i, edge, skin) {
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
    const v = { g, id, bx, bz, skin, y0: Math.random() * 6, inner: new THREE.Group(), x: [], glass };
    g.add(v.inner);
    (FILL[id] || SKIN[skin] || fillEmpty)(v);
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
    [["nyxa"], [null, "virena"], ["tala"], [null, "lyra"], ["volt"], [null, "kael"]].forEach(([id, skin], i) => {
      const v = buildShowcase(id, i, edge, skin);
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
    const flower = createFlower(CONFIG.images.florColores, "warm");
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
  var neon = new THREE.Color(CHARACTER_COLORS.fractura);
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
      if (f !== fl1 && !f.imageUrl) f.g.rotation.z += dt * (f.mode === "warm" ? 0.6 : 0.1);
      f.glow.material.opacity = (f.mode === "none" ? 0.18 : 0.4) + 0.2 * Math.sin(t * 3) + (hover ? 0.25 : 0);
    });
  }
  function updateFlowerImage() {
    const flowers = [[fl1, 0], [fl2, 3]].filter(([flower]) => flower.imageElement);
    if (!flowers.length) return;
    scene.updateMatrixWorld(true);
    cam.updateMatrixWorld();
    const rect = renderer.domElement.getBoundingClientRect();
    const gameRect = $("#game").getBoundingClientRect();
    flowers.forEach(([flower, phase]) => {
      const image = flower.imageElement;
      if (S.p !== phase || !W.visible || !flower.imageVisible || !image.naturalWidth) {
        image.style.display = "none";
        return;
      }
      const center = flower.g.getWorldPosition(new THREE.Vector3());
      const halfHeight = flower.imageHeight * flower.g.scale.y / 2;
      const halfWidth = halfHeight * image.naturalWidth / image.naturalHeight;
      const points = [
        new THREE.Vector3(center.x - halfWidth, center.y - halfHeight, center.z),
        new THREE.Vector3(center.x - halfWidth, center.y + halfHeight, center.z),
        new THREE.Vector3(center.x + halfWidth, center.y - halfHeight, center.z),
        new THREE.Vector3(center.x + halfWidth, center.y + halfHeight, center.z)
      ].map((point) => point.project(cam));
      if (points.some((point) => point.z < -1 || point.z > 1)) {
        image.style.display = "none";
        return;
      }
      const xs = points.map((point) => (point.x + 1) * rect.width / 2);
      const ys = points.map((point) => (1 - point.y) * rect.height / 2);
      const left = rect.left - gameRect.left + Math.min(...xs);
      const top = rect.top - gameRect.top + Math.min(...ys);
      image.style.left = `${left}px`;
      image.style.top = `${top}px`;
      image.style.width = `${Math.max(...xs) - Math.min(...xs)}px`;
      image.style.height = `${Math.max(...ys) - Math.min(...ys)}px`;
      image.style.display = "block";
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
    updateFlowerImage();
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
  var fracturaRgb = [
    parseInt(CHARACTER_COLORS.fractura.slice(1, 3), 16),
    parseInt(CHARACTER_COLORS.fractura.slice(3, 5), 16),
    parseInt(CHARACTER_COLORS.fractura.slice(5, 7), 16)
  ].join(",");
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
        x.fillStyle = Math.random() < 0.7 ? `rgba(${fracturaRgb},${Math.random() * 0.5 * g})` : `rgba(255,255,255,${Math.random() * 0.25 * g})`;
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
  function wave(cv, an, c, color = CHARACTER_COLORS.fractura) {
    const x = cv.getContext("2d"), w = cv.width, h = cv.height;
    x.clearRect(0, 0, w, h);
    x.lineWidth = 2;
    x.strokeStyle = color;
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
  var volume = 1;
  var muted = false;
  function syncMasterVolume() {
    if (eng2.master) eng2.master.gain.value = muted ? 0 : volume;
  }
  function init2() {
    init();
    syncMasterVolume();
  }
  var Aud = {
    init: init2,
    urban,
    doors: doors2,
    ping,
    boom,
    chime,
    voice,
    buf: buf2,
    setVolume(value) {
      volume = Math.max(0, Math.min(1, Number(value)));
      syncMasterVolume();
    },
    /* Decodifica un audio subido y lo guarda (se pueden subir varios por clave) */
    async load(k, data) {
      init2();
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
      muted = m;
      syncMasterVolume();
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
    const clues = S.clues.length ? S.clues.map((c) => '<p style="margin:6px 0">' + c + "</p>").join("") : '<p class="m" style="display:block">Sin pistas todav\xEDa. Libera a los resonantes y busca bajo las vitrinas sin resonante.</p>';
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
      say("Vitrina sellada: este eco a\xFAn no despierta.");
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
    $("#dossier").style.setProperty("--character-color", CHARACTER_COLORS[u.id]);
    S.seeking = S.resumeAfterSeek = false;
    $("#dm").textContent = `Expediente R-0${r.n} \xB7 lengua de Deileanna`;
    $("#dg").textContent = r.glyph;
    $("#di").src = r.img;
    $("#dn").textContent = r.name;
    $("#de").textContent = r.epi;
    $("#dt").textContent = r.txt;
    S.heard[u.id] = S.heard[u.id] || 0;
    S.maxHeard[u.id] = Math.max(S.maxHeard[u.id] || 0, S.heard[u.id]);
    S.playing = true;
    startVoice();
    updDoss();
    S.yawT = r.angle + 0.35;
    show("#dossier");
    say("");
  }
  function closeDoss() {
    if (!S.dossier) return;
    S.seeking = S.resumeAfterSeek = false;
    S.dossier = null;
    S.playing = false;
    if (S.dv) S.dv.stop();
    S.dv = null;
    show("#dossier", false);
    $("#dx").textContent = "Cerrar";
    $("#dp").style.visibility = "";
    $("#dbar").disabled = true;
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
    if (S.seeking) endDossierSeek();
    S.playing = !S.playing;
    if (S.playing) {
      startVoice();
    } else {
      if (S.dv) S.dv.stop();
      S.dv = null;
      $("#dp").textContent = "Reanudar";
    }
  }
  function beginDossierSeek() {
    if (!S.dossier || S.freed.has(S.dossier) || S.seeking) return;
    S.seeking = true;
    S.resumeAfterSeek = S.playing;
    if (S.dv) S.dv.stop();
    S.dv = null;
  }
  function seekDossier(value) {
    const id = S.dossier;
    if (!id || S.freed.has(id)) return;
    if (!S.seeking) beginDossierSeek();
    const target = Number(value), d = durOf(id);
    if (!Number.isFinite(target)) return;
    const furthest = Math.min(d, Math.max(S.maxHeard[id] || 0, S.heard[id] || 0));
    S.heard[id] = Math.min(furthest, Math.max(0, target));
    updDoss();
  }
  function endDossierSeek() {
    if (!S.seeking) return;
    S.seeking = false;
    const resume = S.resumeAfterSeek;
    S.resumeAfterSeek = false;
    if (resume && S.dossier && S.playing && !S.freed.has(S.dossier)) startVoice();
  }
  function updDoss() {
    const id = S.dossier, d = durOf(id), h = Math.min(S.heard[id], d);
    const bar = $("#dbar");
    const furthest = Math.min(S.maxHeard[id] || 0, d);
    bar.max = String(d);
    bar.value = String(h);
    bar.disabled = S.freed.has(id) || furthest <= 0;
    bar.style.setProperty("--progress", `${h / d * 100}%`);
    bar.setAttribute("aria-valuetext", `${fmt(h)} de ${fmt(d)}`);
    $("#dtm").textContent = fmt(h) + " / " + fmt(d);
    $("#dst").textContent = S.freed.has(id) ? RES[id].name + " qued\xF3 liberado" : (S.lost.has(id) ? "da\xF1ado" : "sano") + " \xB7 escucha hasta el final para liberarlo";
  }
  function liberate(id) {
    S.freed.add(id);
    S.playing = false;
    S.seeking = S.resumeAfterSeek = false;
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

  // js/flow/studio.js
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
    document.body.classList.add("playing");
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
      S.maxHeard = {};
      S.seeking = S.resumeAfterSeek = false;
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
    b.style.background = t.locked ? "var(--t2)" : "var(--ac)";
    wave(el.querySelector("canvas"), t.dead ? null : t.v.an, c, CHARACTER_COLORS[t.id]);
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
      const c = new THREE.Color(8798825).lerp(new THREE.Color(11639727), S.mood);
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
    wave($("#dw"), S.dv.an, 0, CHARACTER_COLORS[S.dossier]);
    if (S.playing && !S.seeking && !S.freed.has(S.dossier)) {
      S.heard[S.dossier] += dt;
      S.maxHeard[S.dossier] = Math.max(S.maxHeard[S.dossier] || 0, S.heard[S.dossier]);
      updDoss();
      if (S.heard[S.dossier] >= durOf(S.dossier)) liberate(S.dossier);
    }
  }
  function tick(dt) {
    updateAmbience(dt);
    updateGalleryTurn(dt);
    updateDossierPlayback(dt);
    if (S.p === 2 && S.tracks.length) tickTracks(dt);
    if (S.step === 2 && S.cv) wave($("#fw"), S.cv.an, 0, CHARACTER_COLORS.rythden);
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
      if (e.key === "Escape") {
        closeDoss();
        return;
      }
      if (e.target.closest && e.target.closest('input,button,select,textarea,[contenteditable="true"]')) return;
      if (e.key === "ArrowLeft") S.dir = -1;
      if (e.key === "ArrowRight") S.dir = 1;
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
    const dossierSeek = $("#dbar");
    dossierSeek.addEventListener("pointerdown", beginDossierSeek);
    dossierSeek.addEventListener("input", () => seekDossier(dossierSeek.value));
    dossierSeek.addEventListener("change", endDossierSeek);
    dossierSeek.addEventListener("blur", endDossierSeek);
    dossierSeek.addEventListener("keydown", (e) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(e.key)) beginDossierSeek();
    });
    dossierSeek.addEventListener("keyup", (e) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(e.key)) endDossierSeek();
    });
    addEventListener("pointerup", endDossierSeek);
    addEventListener("pointercancel", endDossierSeek);
    $("#adv").addEventListener("click", fracture);
    $("#again").addEventListener("click", restart);
    $("#jb").addEventListener("click", () => show("#journal", !$("#journal").classList.contains("on")));
    $("#snd").addEventListener("click", (e) => {
      S.muted = !S.muted;
      Aud.mute(S.muted);
      e.target.textContent = S.muted ? "Sonido silenciado" : "Sonido activado";
      e.target.setAttribute("aria-pressed", !S.muted);
    });
    const gameVolume = $("#game-volume"), gameVolumeValue = $("#game-volume-value");
    const updateGameVolume = () => {
      const volume2 = Number(gameVolume.value);
      Aud.setVolume(volume2);
      gameVolumeValue.textContent = Math.round(volume2 * 100) + "%";
      gameVolume.style.setProperty("--volume-fill", `${volume2 * 100}%`);
    };
    gameVolume.addEventListener("input", updateGameVolume);
    updateGameVolume();
  }

  // js/memoria.js
  var SEEDS = [
    // orden de liberación; el color de cada resonante
    ["Nyxa", CHARACTER_COLORS.nyxa],
    ["Tala", CHARACTER_COLORS.tala],
    ["Lyra", CHARACTER_COLORS.lyra],
    ["Kael", CHARACTER_COLORS.kael],
    ["Virena", CHARACTER_COLORS.virena],
    ["Volt", CHARACTER_COLORS.volt],
    ["Naxaly", CHARACTER_COLORS.naxaly],
    ["Rythden", CHARACTER_COLORS.rythden]
  ];
  var FLAG = "ecos-memoria-vista";
  var T_APPEAR = (i) => 0.6 + i * 0.45;
  var T_GATHER = 4.4;
  var T_BLOOM = 6.4;
  var THEME = getComputedStyle(document.documentElement);
  var THEME_ACCENT = THEME.getPropertyValue("--ac").trim();
  var THEME_LIGHT = THEME.getPropertyValue("--t1").trim();
  var THEME_ACCENT_RGB = [1, 3, 5].map((i) => parseInt(THEME_ACCENT.slice(i, i + 2), 16)).join(",");
  var THEME_LIGHT_RGB = [1, 3, 5].map((i) => parseInt(THEME_LIGHT.slice(i, i + 2), 16)).join(",");
  var clamp2 = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  var easeOutBack = (k) => {
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
  };
  var easeInOut = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  var memoriaCompletada = false;
  try {
    memoriaCompletada = localStorage.getItem(FLAG) === "1";
  } catch (error) {
    console.error("No se pudo leer el estado de la memoria completa:", error);
  }
  var memoriaVista = () => memoriaCompletada;
  function marcarMemoriaCompletada() {
    memoriaCompletada = true;
    try {
      localStorage.setItem(FLAG, "1");
    } catch (error) {
      console.error("No se pudo guardar que la secuencia ya se mostr\xF3:", error);
    }
  }
  var CSS = `
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
/* Recompensa que se queda en la p\xE1gina */
#chip.done{box-shadow:0 0 22px var(--ac),0 0 44px color-mix(in srgb,var(--t2) 50%,transparent);animation:mmChip 2.6s ease-in-out infinite;cursor:pointer}
@keyframes mmChip{50%{box-shadow:0 0 30px var(--t2),0 0 60px color-mix(in srgb,var(--ac) 70%,transparent)}}
body.memoria .cc .cf{animation:mmCard 4.5s ease-in-out infinite}
@keyframes mmCard{50%{box-shadow:0 0 30px color-mix(in srgb,var(--ac) 60%,transparent)}}
@media(prefers-reduced-motion:reduce){body.memoria .cc .cf,#chip.done{animation:none}}
`;
  function injectCss() {
    if (document.getElementById("memoria-css")) return;
    const st = document.createElement("style");
    st.id = "memoria-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  injectCss();
  function chime2(vol) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
      const master = ac.createGain();
      master.gain.value = clamp2(vol, 0, 1) * 0.17;
      master.connect(ac.destination);
      const note = (f, at, dur, type, g) => {
        const o = ac.createOscillator(), e = ac.createGain(), t0 = ac.currentTime + at;
        o.type = type;
        o.frequency.value = f;
        e.gain.setValueAtTime(0, t0);
        e.gain.linearRampToValueAtTime(g, t0 + 0.03);
        e.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
        o.connect(e);
        e.connect(master);
        o.start(t0);
        o.stop(t0 + dur + 0.1);
      };
      [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25].forEach((f, i) => note(f, T_APPEAR(i), 1.8, "sine", 0.9));
      [261.63, 329.63, 392, 523.25, 659.25].forEach((f) => note(f, T_BLOOM, 3.4, "triangle", 0.55));
      note(130.81, T_BLOOM, 3.8, "sine", 1);
      return ac;
    } catch (e) {
      return null;
    }
  }
  function playMemoria(opts = {}) {
    if (memoriaVista() || document.getElementById("memoria")) return;
    marcarMemoriaCompletada();
    injectCss();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.createElement("div");
    root.id = "memoria";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Memoria completa");
    root.innerHTML = `<canvas></canvas><button class="mm-x" aria-label="Cerrar">\u2715</button>
    <div class="mm-text">
      <p class="mm-eye">Memoria completa \xB7 7 / 7 notas</p>
      <h2>Las ocho semillas despiertan</h2>
      <p class="mm-sub">Reuniste cada recuerdo que el museo hab\xEDa olvidado. La Fractura te reconoce, y la flor ya sabe tu nombre.</p>
      <div class="mm-names">${SEEDS.map(([n, c]) => `<span style="--c:${c}">${n}</span>`).join("")}</div>
      <div class="mm-btns"><button data-go>Cruzar la puerta \u2726</button><button class="alt" data-close>Seguir explorando</button></div>
    </div>`;
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add("on"));
    const cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
    let W2 = 0, H = 0, u = 1, fu = 1, CY = 0;
    const resize2 = () => {
      const d = Math.min(2, devicePixelRatio || 1);
      W2 = innerWidth;
      H = innerHeight;
      u = clamp2(Math.min(W2, H * 1.15) / 700, 0.55, 1.3);
      const th = root.querySelector(".mm-text").offsetHeight + Math.max(26, H * 0.06) + 16;
      CY = Math.max(110, (H - th) / 2);
      fu = clamp2(Math.min(u, (CY - 24) / 170), 0.35, 1.3);
      cv.width = W2 * d;
      cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize2();
    addEventListener("resize", resize2);
    const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, p: Math.random() * 6 }));
    const parts = [];
    let flash = 0, bloomed = false, rings = [], raf = 0, start = 0, t = 0, closed = false;
    const ac = chime2(opts.volume ? opts.volume() : 1);
    const cx = () => W2 / 2, cy = () => CY;
    const burst = (n) => {
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2, sp = 140 + Math.random() * 460 * u;
        parts.push({
          x: cx(),
          y: cy(),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 90,
          g: 170,
          life: 0,
          max: 2.6 + Math.random() * 2.6,
          s: (5 + Math.random() * 9) * u,
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 7,
          c: SEEDS[Math.random() * 8 | 0][1],
          petal: Math.random() < 0.65
        });
      }
    };
    const rain = (dt) => {
      if (Math.random() < dt * 16) parts.push({
        x: Math.random() * W2,
        y: -12,
        vx: (Math.random() - 0.5) * 30,
        vy: 40 + Math.random() * 60,
        g: 6,
        life: 0,
        max: 9,
        s: (4 + Math.random() * 7) * u,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 3,
        c: SEEDS[Math.random() * 8 | 0][1],
        petal: true,
        sway: Math.random() * 6
      });
    };
    function drawSeed(i, ang, rad, s, fade) {
      const [name, col] = SEEDS[i], x = cx() + Math.cos(ang) * rad, y = cy() + Math.sin(ang) * rad;
      const pulse = 1 + 0.12 * Math.sin(t * 3 + i);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 52 * u * s * pulse);
      g.addColorStop(0, col + "ff");
      g.addColorStop(0.25, col + "aa");
      g.addColorStop(1, col + "00");
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 52 * u * s * pulse, 0, 7);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = THEME_LIGHT;
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.arc(x, y, 7 * u * s, 0, 7);
      ctx.fill();
      if (fade > 0.05 && t < T_GATHER) {
        ctx.globalAlpha = fade * 0.85;
        ctx.fillStyle = THEME_LIGHT;
        ctx.font = `${Math.round(12 * u + 1)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(name.toUpperCase(), x, y + 40 * u);
      }
      ctx.globalAlpha = 1;
    }
    function drawFlower(k) {
      const x = cx(), y = cy(), L = 150 * fu * k, w = 54 * fu * k, rot = t * 0.25;
      ctx.save();
      ctx.translate(x, y);
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 260 * fu * k);
      halo.addColorStop(0, `rgba(${THEME_ACCENT_RGB},.55)`);
      halo.addColorStop(1, `rgba(${THEME_ACCENT_RGB},0)`);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 260 * fu * k, 0, 7);
      ctx.fill();
      SEEDS.forEach(([, col], i) => {
        ctx.save();
        ctx.rotate(rot + i * Math.PI / 4 + Math.sin(t * 1.3 + i) * 0.03);
        const g = ctx.createLinearGradient(0, 0, 0, -L);
        g.addColorStop(0, THEME_LIGHT + "cc");
        g.addColorStop(0.35, col + "dd");
        g.addColorStop(1, col + "55");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, -L * 0.55, w, L * 0.5, 0, 0, 7);
        ctx.fill();
        ctx.restore();
      });
      ctx.globalCompositeOperation = "source-over";
      const c = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * fu * k * (1 + 0.1 * Math.sin(t * 4)));
      c.addColorStop(0, THEME_LIGHT);
      c.addColorStop(0.5, THEME_LIGHT);
      c.addColorStop(1, THEME_ACCENT);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, 0, 30 * fu * k, 0, 7);
      ctx.fill();
      ctx.restore();
    }
    function frame(now2) {
      if (closed) return;
      if (!start) start = now2;
      const el = (now2 - start) / 1e3, dt = Math.min(0.05, el - t);
      t = el;
      ctx.clearRect(0, 0, W2, H);
      stars.forEach((s) => {
        ctx.globalAlpha = (0.25 + 0.5 * Math.abs(Math.sin(t * 0.8 + s.p))) * clamp2(t / 1.2);
        ctx.fillStyle = THEME_LIGHT;
        ctx.fillRect(s.x * W2, s.y * H, s.r, s.r);
      });
      ctx.globalAlpha = 1;
      const ringR = Math.min(W2 * 0.4, CY - 36, 250 * u + 60);
      const gk = clamp2((t - T_GATHER) / (T_BLOOM - T_GATHER)), ge = easeInOut(gk);
      SEEDS.forEach((_, i) => {
        const a0 = clamp2((t - T_APPEAR(i)) / 0.6);
        if (a0 <= 0) return;
        const s = easeOutBack(a0);
        const ang = i / 8 * Math.PI * 2 - Math.PI / 2 + t * 0.32 + gk * gk * 9;
        const rad = ringR * (1 - ge) * (a0 < 1 ? easeInOut(a0) * 0.4 + 0.6 : 1);
        if (t < T_BLOOM - 0.15) {
          if (t < T_GATHER) {
            ctx.globalAlpha = 0.22 * a0;
            ctx.strokeStyle = SEEDS[i][1];
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(cx(), cy());
            ctx.lineTo(cx() + Math.cos(ang) * rad, cy() + Math.sin(ang) * rad);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          drawSeed(i, ang, rad, s, 1 - clamp2((t - (T_BLOOM - 0.5)) / 0.35));
        }
        if (a0 < 1) {
          const wv = a0;
          ctx.globalAlpha = (1 - wv) * 0.7;
          ctx.strokeStyle = SEEDS[i][1];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx() + Math.cos(ang) * rad, cy() + Math.sin(ang) * rad, 10 * u + wv * 90 * u, 0, 7);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
      if (t > T_BLOOM - 0.6) drawFlower(easeOutBack(clamp2((t - (T_BLOOM - 0.6)) / 1.5)));
      if (!bloomed && t >= T_BLOOM) {
        bloomed = true;
        flash = reduce ? 0.25 : 1;
        burst(190);
        rings.push(0, 0.15, 0.3);
        root.classList.add("show");
        setTimeout(() => {
          const b = root.querySelector("[data-go]");
          b && b.focus({ preventScroll: true });
        }, 900);
      }
      if (bloomed) rain(dt);
      rings = rings.map((r) => r + dt * 0.9).filter((r) => r < 1.2);
      rings.forEach((r) => {
        if (r < 0) return;
        ctx.globalAlpha = clamp2(1 - r) * 0.8;
        ctx.strokeStyle = THEME_LIGHT;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx(), cy(), r * Math.max(W2, H) * 0.75, 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      for (let k = parts.length - 1; k >= 0; k--) {
        const p = parts[k];
        p.life += dt;
        if (p.life > p.max || p.y > H + 30) {
          parts.splice(k, 1);
          continue;
        }
        p.vy += p.g * dt;
        p.vx *= 1 - dt * (p.sway === void 0 ? 0.6 : 0);
        p.x += p.vx * dt + (p.sway !== void 0 ? Math.sin(t * 1.5 + p.sway) * 20 * dt : 0);
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        ctx.globalAlpha = clamp2(1 - p.life / p.max) * 0.95;
        ctx.fillStyle = p.c;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.petal) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s * 0.55, p.s, 0, 0, 7);
          ctx.fill();
        } else {
          ctx.fillRect(-p.s / 4, -p.s / 4, p.s / 2, p.s / 2);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (flash > 0) {
        ctx.fillStyle = `rgba(${THEME_LIGHT_RGB},${flash})`;
        ctx.fillRect(0, 0, W2, H);
        flash = Math.max(0, flash - dt * 1.6);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    function close(goTop) {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize2);
      removeEventListener("keydown", onKey);
      root.classList.remove("on");
      setTimeout(() => {
        root.remove();
        try {
          ac && ac.close();
        } catch (e) {
        }
      }, 900);
      document.body.classList.add("memoria");
      if (goTop) scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (opts.onClose) opts.onClose();
    }
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };
    addEventListener("keydown", onKey);
    root.querySelector(".mm-x").onclick = () => close(false);
    root.querySelector("[data-close]").onclick = () => close(false);
    root.querySelector("[data-go]").onclick = () => close(true);
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
  var NOTE_IDS = Object.keys(NOTES);
  var FIRST_SIX_NOTE_IDS = NOTE_IDS.filter((id) => id !== "n7");
  var TABS = [
    "Deileanna es la civilizaci\xF3n milenaria que canalizaba la Resonancia Primordial. De sus ruinas vienen los glifos que decoran cada expediente.",
    "Sael Vantorin se fragment\xF3 en ocho semillas: Rythden, Nyxa, Tala, Volt, Kael, Lyra, Virena y Naxaly. El museo es el anclaje que las protege.",
    "El Pulso es el evento que fractur\xF3 Khaelos. Dej\xF3 los archivos de audio incompletos, las l\xEDneas temporales distorsionadas y una energ\xEDa fucsia que corrompe los recuerdos."
  ];
  var found = [];
  try {
    const saved = JSON.parse(localStorage.getItem("ecos-notas") || "[]");
    if (Array.isArray(saved)) {
      found = [...new Set(saved.filter((id) => Object.prototype.hasOwnProperty.call(NOTES, id)))];
    }
  } catch (error) {
    console.warn("No se pudieron leer las notas guardadas:", error);
  }
  var allNotesCollected = () => NOTE_IDS.every((id) => found.includes(id));
  var chip = () => {
    $("#chip").hidden = !found.length;
    $("#cc").textContent = found.length;
    $("#chip").classList.toggle("done", memoriaVista());
  };
  var saveNotes = () => {
    try {
      localStorage.setItem("ecos-notas", JSON.stringify(found));
    } catch (error) {
      console.error("No se pudieron guardar las notas:", error);
    }
  };
  var stopPageAudio = () => {
  };
  function openNote(id) {
    if (!NOTES[id]) return;
    if (!found.includes(id)) {
      found.push(id);
      saveNotes();
    }
    $("#nt").textContent = NOTES[id][0];
    $("#nf").textContent = NOTES[id][1] + " \xB7 " + found.length + "/7";
    $("#note").hidden = false;
    chip();
  }
  function closeNote() {
    if ($("#note").hidden) return;
    $("#note").hidden = true;
    if (FIRST_SIX_NOTE_IDS.every((id) => found.includes(id)) && !found.includes("n7")) {
      setTimeout(() => openNote("n7"), 500);
      return;
    }
    if (allNotesCollected() && !memoriaVista()) {
      stopPageAudio();
      playMemoria({ volume: () => Number($("#page-volume").value) });
      chip();
    }
  }
  var plDown = null;
  var CTRL = ".pl,[data-note],a,button";
  function initSite() {
    if (memoriaVista()) document.body.classList.add("memoria");
    const volumeControls = $$(".volume-control");
    const setVolumeControlOpen = (control, open) => {
      const toggle = control.querySelector(".volume-toggle");
      control.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", `${open ? "Ocultar" : "Mostrar"} ${toggle.dataset.volumeLabel}`);
    };
    volumeControls.forEach((control) => {
      const toggle = control.querySelector(".volume-toggle");
      toggle.addEventListener("click", () => setVolumeControlOpen(control, !control.classList.contains("open")));
    });
    document.addEventListener("click", (e) => {
      volumeControls.forEach((control) => {
        if (!control.contains(e.target)) setVolumeControlOpen(control, false);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const control = volumeControls.find((item) => item.classList.contains("open") && item.contains(document.activeElement));
      if (!control) return;
      setVolumeControlOpen(control, false);
      control.querySelector(".volume-toggle").focus();
      e.stopPropagation();
    });
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
      const color = CHARACTER_COLORS[c.dataset.character];
      if (color) c.style.setProperty("--ac", color);
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
    const eps = $("#eps"), epCards = $$(".ep");
    let coverFrame = 0, snapTimer = 0;
    const updateCoverFlow = () => {
      coverFrame = 0;
      const center = eps.scrollLeft + eps.clientWidth / 2;
      const cardWidth = epCards.length ? epCards[0].offsetWidth : eps.clientWidth;
      epCards.forEach((card) => {
        const offset = (card.offsetLeft + card.offsetWidth / 2 - center) / cardWidth;
        const distance = Math.abs(offset);
        const shift = -Math.sign(offset) * Math.min(distance * 0.2, 0.36) * cardWidth;
        const active = distance < 0.15;
        card.style.setProperty("--cover-x", `${shift}px`);
        card.style.setProperty("--cover-z", `${-Math.min(420, distance * 150)}px`);
        card.style.setProperty("--cover-rotate", `${Math.max(-36, Math.min(36, offset * 18))}deg`);
        card.style.setProperty("--cover-scale", Math.max(0.55, 1 - distance * 0.12));
        card.style.setProperty("--cover-blur", `${Math.min(9, distance * 2.2)}px`);
        card.style.setProperty("--cover-opacity", Math.max(0.28, 1 - distance * 0.22));
        card.style.setProperty("--cover-order", Math.round(100 - Math.min(distance, 9) * 10));
        card.classList.toggle("is-active", active);
        if (active) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
      });
    };
    const scheduleCoverFlow = () => {
      if (!coverFrame) coverFrame = requestAnimationFrame(updateCoverFlow);
    };
    const centerNearestEpisode = () => {
      const center = eps.scrollLeft + eps.clientWidth / 2;
      let nearest = null, nearestDistance = Infinity;
      epCards.forEach((card) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (distance < nearestDistance) {
          nearest = card;
          nearestDistance = distance;
        }
      });
      if (!nearest) return;
      const target = nearest.offsetLeft + nearest.offsetWidth / 2 - eps.clientWidth / 2;
      if (Math.abs(target - eps.scrollLeft) > 2) eps.scrollTo({ left: target, behavior: "smooth" });
    };
    eps.addEventListener("scroll", () => {
      scheduleCoverFlow();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(centerNearestEpisode, 150);
    }, { passive: true });
    eps.addEventListener("scrollend", () => {
      clearTimeout(snapTimer);
      centerNearestEpisode();
    });
    eps.addEventListener("wheel", (e) => {
      const maxScroll = eps.scrollWidth - eps.clientWidth;
      const delta = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? eps.clientWidth : 1);
      if (Math.abs(delta) <= Math.abs(e.deltaX) || e.deltaY < 0 && eps.scrollLeft <= 1 || e.deltaY > 0 && eps.scrollLeft >= maxScroll - 1) return;
      e.preventDefault();
      eps.scrollLeft += delta;
    }, { passive: false });
    addEventListener("resize", scheduleCoverFlow);
    updateCoverFlow();
    epCards.forEach((c) => {
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
    const revealQuote = () => {
      if (ty.classList.contains("is-revealed")) return;
      ty.classList.add("is-revealed");
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const particles = document.createElement("span");
      particles.className = "typ-particles";
      particles.setAttribute("aria-hidden", "true");
      particles.innerHTML = Array.from({ length: 12 }, () => {
        const size = 1.5 + Math.random() * 2;
        const duration = 1.2 + Math.random() * 0.7;
        const delay = Math.random() * 0.18;
        const opacity = 0.22 + Math.random() * 0.25;
        const drift = Math.random() * 38 - 19;
        const rise = 18 + Math.random() * 30;
        const x = Math.random() * 100;
        const y = Math.random() * 112 - 6;
        return `<i style="--size:${size}px;--duration:${duration}s;--delay:${delay}s;--opacity:${opacity};--drift:${drift}px;--rise:${rise}px;--x:${x}%;--y:${y}%"></i>`;
      }).join("");
      particles.addEventListener("animationend", (event) => {
        if (event.target.parentNode === particles) event.target.remove();
        if (!particles.firstElementChild) particles.remove();
      });
      ty.parentElement.append(particles);
    };
    new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      revealQuote();
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
    const pageVolume = $("#page-volume"), pageVolumeValue = $("#page-volume-value");
    let volume2 = Number(pageVolume.value), cur = null, curBtn = null, curUrl = null, playId = 0;
    const updatePageVolume = () => {
      volume2 = Number(pageVolume.value);
      pageVolumeValue.textContent = Math.round(volume2 * 100) + "%";
      pageVolume.style.setProperty("--volume-fill", `${volume2 * 100}%`);
      if (cur) cur.volume = volume2;
    };
    pageVolume.addEventListener("input", updatePageVolume);
    updatePageVolume();
    const seekUI = (button) => {
      const card = button && button.closest(".ep");
      if (!card) return null;
      return {
        range: card.querySelector(".chapter-seek"),
        time: card.querySelector(".seek-time")
      };
    };
    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
      const value = Math.floor(seconds);
      return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
    };
    const syncSeek = (audio, button) => {
      const ui = seekUI(button);
      if (!ui || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const time = Math.min(audio.currentTime, audio.duration);
      ui.range.max = String(audio.duration);
      ui.range.value = String(time);
      ui.range.disabled = false;
      ui.range.style.setProperty("--seek-progress", `${time / audio.duration * 100}%`);
      ui.range.setAttribute("aria-valuetext", `${formatTime(time)} de ${formatTime(audio.duration)}`);
      ui.time.textContent = formatTime(time);
    };
    const resetSeek = (button) => {
      const ui = seekUI(button);
      if (!ui) return;
      ui.range.max = "1";
      ui.range.value = "0";
      ui.range.disabled = true;
      ui.range.style.setProperty("--seek-progress", "0%");
      ui.range.setAttribute("aria-valuetext", "00:00");
      ui.time.textContent = "00:00";
    };
    $$(".chapter-seek").forEach((range) => {
      const button = range.closest(".ep").querySelector(".pl");
      range.addEventListener("input", () => {
        if (!cur || curBtn !== button || !Number.isFinite(cur.duration)) return;
        cur.currentTime = Number(range.value);
        syncSeek(cur, button);
      });
    });
    const stopAud = () => {
      playId++;
      if (cur) {
        cur.pause();
        cur.removeAttribute("src");
        cur.load();
      }
      if (curBtn) resetSeek(curBtn);
      if (curBtn) curBtn.textContent = curBtn.dataset.l || "\u25B6 Escuchar";
      if (curUrl) URL.revokeObjectURL(curUrl);
      cur = curBtn = curUrl = null;
    };
    stopPageAudio = stopAud;
    $("#go").addEventListener("click", stopAud);
    $$(".pl").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      plDown = null;
      const same = curBtn === b;
      stopAud();
      if (same) return;
      if (!b.dataset.audio) {
        b.textContent = "Audio no configurado";
        return;
      }
      curBtn = b;
      b.removeAttribute("title");
      b.textContent = "Cargando\u2026";
      const id = playId, assetUrl = new URL(b.dataset.audio, location.href);
      const source = location.protocol === "file:" ? fetch(assetUrl.href).then((response) => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.arrayBuffer();
      }).then((data) => {
        if (id !== playId) return null;
        curUrl = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));
        return curUrl;
      }).catch((error) => {
        console.warn("No se pudo leer el audio local como Blob; se probar\xE1 la ruta directa:", assetUrl.href, error);
        return assetUrl.href;
      }) : Promise.resolve(assetUrl.href);
      const unavailable = (error) => {
        console.error("No se pudo reproducir el audio:", assetUrl.href, error);
        b.textContent = "Audio no disponible";
        if (location.protocol === "file:") {
          b.title = "Chrome puede bloquear audios locales al abrir el HTML directamente. Abre el proyecto con Live Server o Live Share.";
        }
      };
      source.then((src) => {
        if (!src || id !== playId) return;
        const audio = cur = new Audio();
        audio.preload = "auto";
        audio.volume = volume2;
        audio.src = src;
        audio.onloadedmetadata = () => {
          if (id === playId && cur === audio) syncSeek(audio, b);
        };
        audio.ontimeupdate = () => {
          if (id === playId && cur === audio) syncSeek(audio, b);
        };
        audio.onended = () => {
          if (id === playId) stopAud();
        };
        audio.onerror = () => {
          if (id !== playId || cur !== audio) return;
          unavailable(audio.error);
          resetSeek(b);
          cur = curBtn = null;
          if (curUrl) URL.revokeObjectURL(curUrl);
          curUrl = null;
        };
        return audio.play().then(() => {
          if (id === playId) b.textContent = "\u275A\u275A Pausar";
        }).catch((error) => {
          if (id !== playId || cur !== audio) return;
          unavailable(error);
          resetSeek(b);
          cur = curBtn = null;
          if (curUrl) URL.revokeObjectURL(curUrl);
          curUrl = null;
        });
      }).catch((error) => {
        if (id !== playId) return;
        unavailable(error);
        resetSeek(b);
        curBtn = null;
      });
    }));
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
      const COL = ["134,66,105", "177,155,175", "228,219,224", "134,66,105"], P = [], MAX = 48;
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
    console.log("%c\u273F Hay 7 notas escondidas en esta p\xE1gina.", "color:#864269");
  }

  // js/main.js
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
