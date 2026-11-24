/* Ambientación del estudio (Teseracto): sala circular con paneles acústicos, suelo con luz,
   focos de acento por resonante, guirnalda cálida y letrero de neón con la flor.
   Todo son materiales planos (sin luces reales) para no tocar el rendimiento ni la lógica existente.
   Cada pieza se añade al grupo de la galería, así que un .glb de entorno puede sustituirla (ver setEnv). */
import { T, basic } from './materials.js';
import { CHARACTER_COLORS } from '../data.js';
import { CONFIG } from '../config.js';
import { RM } from '../utils.js';

const R = 15;            // radio de la sala
const FLOOR = -1.6;      // altura del suelo
const TOP = 8.9;         // altura del techo
const ADD = THREE.AdditiveBlending;
const polar = (a, r) => [Math.sin(a) * r, -Math.cos(a) * r]; // misma convención que las vitrinas

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}
const radial = stops => tex(256, 256, (g, w, h) => {
  const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  stops.forEach(([o, col]) => r.addColorStop(o, col));
  g.fillStyle = r; g.fillRect(0, 0, w, h);
});
const vertical = stops => tex(8, 128, (g, w, h) => {
  const l = g.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, col]) => l.addColorStop(o, col));
  g.fillStyle = l; g.fillRect(0, 0, w, h);
});
const glow = (map, color, opacity, extra) => new THREE.MeshBasicMaterial(Object.assign({
  map, color, opacity, transparent: true, blending: ADD, depthWrite: false, fog: false
}, extra));

export function buildAmbience(group, vit) {
  const soft = radial([[0, '#fff'], [.35, '#aaa'], [1, '#000']]);

  /* ---- Paredes: sala circular con paneles acústicos de listones y luz cálida entre ellos ---- */
  const wallTex = tex(2048, 512, (g, w, h) => {
    const base = g.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#4c4c4c'); base.addColorStop(.38, '#8c8c8c'); base.addColorStop(1, '#9c9c9c');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const y0 = h * .38, step = w / 128;
    for (let i = 0; i < 128; i++) {                       // listones
      const x = i * step, v = 104 + ((i * 37) % 7) * 3;
      g.fillStyle = '#d4d4d4'; g.fillRect(x, y0, step, h - y0);          // luz entre listones
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x + 1.5, y0, step - 3, h - y0);
      g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x + 1.5, y0, 1.5, h - y0);
    }
    const sh = g.createLinearGradient(0, y0, 0, y0 + 90);  // sombra bajo la moldura y suelo
    sh.addColorStop(0, 'rgba(0,0,0,.5)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, y0, w, 90);
    g.fillStyle = '#c4c4c4'; g.fillRect(0, y0 - 9, w, 9);  // moldura superior de los paneles
    const fl = g.createLinearGradient(0, h - 70, 0, h);
    fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(1, 'rgba(0,0,0,.45)');
    g.fillStyle = fl; g.fillRect(0, h - 70, w, 70);
  });
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, TOP - FLOOR, 96, 1, true),
    T(basic(0xffffff, { map: wallTex, side: THREE.BackSide, fog: false }), 0xb98cae, 0xe9c47c)
  );
  wall.position.y = (TOP + FLOOR) / 2;
  group.add(wall);

  /* ---- Suelo y techo con degradado de luz ---- */
  const floorTex = radial([[0, '#d6d6d6'], [.4, '#a4a4a4'], [.75, '#5e5e5e'], [1, '#262626']]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry((R + 1) * 2, (R + 1) * 2), T(basic(0xffffff, { map: floorTex, fog: false }), 0x8a4572, 0xcfa24c));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR + .03;
  group.add(floor);

  const ceilTex = radial([[0, '#cfcfcf'], [.3, '#8a8a8a'], [1, '#2c2c2c']]);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry((R + 1) * 2, (R + 1) * 2), T(basic(0xffffff, { map: ceilTex, fog: false }), 0x7a4470, 0xc79a4a));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = TOP;
  group.add(ceil);

  /* ---- Aros de luz en el techo (eco de los anillos del suelo) ---- */
  [[5, .07, .85], [9.5, .07, .55]].forEach(([r, w, o]) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + w, 128), basic(0xffe3b0, { side: THREE.DoubleSide, transparent: true, opacity: o, fog: false }));
    ring.rotation.x = Math.PI / 2; ring.position.y = TOP - .05;
    const halo = new THREE.Mesh(new THREE.RingGeometry(r - .5, r + .6, 128), glow(null, 0xffc98a, .10, { side: THREE.DoubleSide }));
    halo.rotation.x = Math.PI / 2; halo.position.y = TOP - .06;
    group.add(ring, halo);
  });

  /* ---- Tiras de neón: base (fucsia) y remate de los paneles (cálida), con halo ---- */
  const strips = [];
  const strip = (y, gray, gold) => {
    const m = T(basic(gray, { fog: false }), gray, gold);
    const t = new THREE.Mesh(new THREE.TorusGeometry(R - .15, .03, 6, 160), m);
    t.rotation.x = Math.PI / 2; t.position.y = y;
    const hm = glow(vertical([[0, '#000'], [.5, '#fff'], [1, '#000']]), gray, .2, { side: THREE.BackSide });
    const h = new THREE.Mesh(new THREE.CylinderGeometry(R - .2, R - .2, 1.1, 96, 1, true), hm);
    h.position.y = y;
    group.add(t, h); strips.push(hm);
  };
  strip(FLOOR + .25, 0xff5fa8, 0xffc864);
  strip(4.9, 0xffb86b, 0xffd98a);

  /* ---- Focos de acento: haz desde el techo, charco de luz y halo detrás de cada vitrina ---- */
  const beamMap = vertical([[0, '#fff'], [.65, '#555'], [1, '#000']]);
  const beams = [], motes = [];
  vit.forEach((v, i) => {
    const col = new THREE.Color(CHARACTER_COLORS[v.id] || '#e0b25a');
    const warm = col.clone().lerp(new THREE.Color(0xffe2b0), .45);
    const [bx, bz] = [v.bx, v.bz];
    const bm = glow(beamMap, warm, .10, { side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.22, 1.5, TOP - FLOOR - 1.2, 28, 1, true), bm);
    beam.position.set(bx, (TOP - 1.2 + FLOOR) / 2 + .1, bz);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), glow(soft, col, .5));
    pool.rotation.x = -Math.PI / 2; pool.position.set(bx, FLOOR + .06, bz);
    const a = Math.atan2(bx, -bz), [hx, hz] = polar(a, R - 3);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: col, transparent: true, opacity: .22, blending: ADD, depthWrite: false, fog: false }));
    halo.scale.setScalar(8); halo.position.set(hx, .5, hz);
    group.add(beam, pool, halo);
    beams.push(bm);
    for (let j = 0; j < 8; j++) motes.push({ bx, bz, ang: Math.random() * 6.28, rf: Math.random(), y: FLOOR + Math.random() * 9, sp: .08 + Math.random() * .12, ph: Math.random() * 6.28 });
  });

  const mp = new Float32Array(motes.length * 3);
  const moteGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const moteMat = new THREE.PointsMaterial({ size: .11, map: soft, color: 0xfff0cc, transparent: true, opacity: .8, blending: ADD, depthWrite: false, fog: false });
  const moteObj = new THREE.Points(moteGeo, moteMat);
  moteObj.frustumCulled = false;
  group.add(moteObj);
  const placeMotes = (t, dt) => motes.forEach((m, k) => {
    m.y += dt * m.sp; if (m.y > TOP - 1.3) m.y = FLOOR + .2;
    const rr = (.22 + 1.28 * ((TOP - 1.2 - m.y) / (TOP - FLOOR - 1.2))) * m.rf * .9;
    const a = m.ang + Math.sin(t * .3 + m.ph) * .6;
    mp[k * 3] = m.bx + Math.cos(a) * rr; mp[k * 3 + 1] = m.y; mp[k * 3 + 2] = m.bz + Math.sin(a) * rr;
  });
  placeMotes(0, 0);

  /* ---- Guirnalda de luces cálidas en cinco tramos (el hueco a 30° es para el letrero) ---- */
  const bulbs = [[], []], lineMat = new THREE.LineBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: .35, fog: false });
  for (let k = 0; k < 5; k++) {
    const a0 = (38 + k * 72) * Math.PI / 180, span = 56 * Math.PI / 180, pts = [];
    for (let s = 0; s <= 48; s++) {
      const u = s / 48, [x, z] = polar(a0 + span * u, R - .6);
      pts.push(new THREE.Vector3(x, 7.1 - 1.5 * (1 - Math.pow(2 * u - 1, 2)), z));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    for (let b = 0; b <= 12; b++) bulbs[b % 2].push(pts[Math.round(b / 12 * 48)]);
  }
  const bulbMats = bulbs.map(list => {
    const m = new THREE.PointsMaterial({ size: .5, map: soft, color: 0xffd08a, transparent: true, opacity: 1, blending: ADD, depthWrite: false, fog: false });
    group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(list), m));
    const bloom = new THREE.PointsMaterial({ size: 1.7, map: soft, color: 0xffb870, transparent: true, opacity: .13, blending: ADD, depthWrite: false, fog: false });
    group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(list), bloom));
    return m;
  });

  /* ---- Letrero de neón con la flor del podcast, sobre la pared del fondo ---- */
  const SIGN_Y = 2.4, [sx, sz0] = polar(Math.PI / 6, R - .25), sz = sz0;
  const signHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: 0xff4f9e, transparent: true, opacity: .3, blending: ADD, depthWrite: false, fog: false }));
  signHalo.scale.setScalar(6.5); signHalo.position.set(sx, SIGN_Y, sz + .2);
  const signMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, fog: false });
  new THREE.TextureLoader().load('assets/imgs/IMGs_Trasmedia/florIcono.png', t => { signMat.map = t; signMat.opacity = .95; signMat.needsUpdate = true; });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.5), signMat);
  sign.position.set(sx, SIGN_Y, sz + .1);
  sign.rotation.y = -Math.PI / 6; // de cara al centro de la sala
  group.add(signHalo, sign);

  /* ---- Animación suave (respeta "reducir movimiento") ---- */
  function animate(t, dt) {
    if (RM) return;
    const pulse = .8 + .2 * Math.sin(t * 1.3);
    strips.forEach(m => { m.opacity = .2 * pulse; });
    bulbMats[0].opacity = .75 + .25 * Math.sin(t * 2.1);
    bulbMats[1].opacity = .75 + .25 * Math.sin(t * 2.1 + Math.PI);
    beams.forEach((m, i) => { m.opacity = .10 + .02 * Math.sin(t * .7 + i * 1.3); });
    signHalo.material.opacity = .26 + .06 * Math.sin(t * 1.7);
    placeMotes(t, dt);
    moteGeo.attributes.position.needsUpdate = true;
  }
  return { animate };
}