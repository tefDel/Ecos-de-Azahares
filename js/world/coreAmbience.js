/* Ambientación del Núcleo: "la cámara de resonancia".
   Cúpula dorada con sombras ciruela, rosetón de azahar al fondo, pétalos monumentales en dos planos,
   haz de luz desde el óculo, ecos (ondas) que nacen de la flor, las seis semillas de los resonantes,
   luces colgantes y pétalos cayendo. Todo son materiales planos (sin luces reales).
   Reacciona a lo que ya existe: hover sobre la flor (S.step 0) y final (S.step 2) sin tocar la lógica. */
import { CHARACTER_COLORS, IDS } from '../data.js';
import { S } from '../state.js';
import { RM } from '../utils.js';

const R = 14;                 // radio de la cámara (igual que la esfera de coreRoom.js)
const FLOOR = -2;             // altura de los anillos del suelo
const ADD = THREE.AdditiveBlending;
const polar = (a, r) => [Math.sin(a) * r, -Math.cos(a) * r];
const deg = d => d * Math.PI / 180;

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
const flat = (map, opacity, extra) => new THREE.MeshBasicMaterial(Object.assign({
  map, opacity, transparent: true, depthWrite: false, fog: false
}, extra));

/* ---------- Texturas dibujadas con código ---------- */

/* Cúpula: sombra ciruela arriba y abajo, nervaduras doradas que convergen en el óculo */
const domeTex = () => tex(1024, 512, (g, w, h) => {
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, 'rgba(24,6,34,.92)'); v.addColorStop(.3, 'rgba(40,12,48,.45)');
  v.addColorStop(.5, 'rgba(60,20,50,0)'); v.addColorStop(.72, 'rgba(40,12,48,.35)');
  v.addColorStop(1, 'rgba(24,6,34,.9)');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
  const rib = g.createLinearGradient(0, 0, 0, h * .5);
  rib.addColorStop(0, 'rgba(255,224,160,.26)'); rib.addColorStop(1, 'rgba(255,224,160,0)');
  g.strokeStyle = rib; g.lineWidth = 2;
  for (let i = 0; i < 24; i++) { const x = i * w / 24; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * .5); g.stroke(); }
  g.strokeStyle = 'rgba(255,224,160,.10)';
  [.2, .34].forEach(f => { g.beginPath(); g.moveTo(0, h * f); g.lineTo(w, h * f); g.stroke(); });
});

/* Rosetón de azahar (vitral muy tenue, como un recuerdo de la flor) */
const rosetteTex = () => tex(1024, 1024, (g, w) => {
  const c = w / 2, lead = 'rgba(40,12,48,.55)';
  g.translate(c, c);
  g.strokeStyle = lead;
  [[500, 9], [468, 4], [300, 4], [150, 4]].forEach(([r, lw]) => { g.lineWidth = lw; g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.stroke(); });
  const petal = (r0, r1, wd, fill) => {
    g.beginPath(); g.moveTo(0, -r0);
    g.bezierCurveTo(wd, -r0 - (r1 - r0) * .35, wd, -r0 - (r1 - r0) * .75, 0, -r1);
    g.bezierCurveTo(-wd, -r0 - (r1 - r0) * .75, -wd, -r0 - (r1 - r0) * .35, 0, -r0);
    g.fillStyle = fill; g.fill(); g.strokeStyle = lead; g.lineWidth = 5; g.stroke();
  };
  for (let i = 0; i < 10; i++) { g.save(); g.rotate(i * Math.PI / 5); petal(60, 440, 95, 'rgba(255,226,150,.30)'); g.restore(); }
  for (let i = 0; i < 5; i++) { g.save(); g.rotate(i * Math.PI * 2 / 5 + Math.PI / 5); petal(30, 215, 62, 'rgba(255,244,214,.40)'); g.restore(); }
  g.fillStyle = 'rgba(255,246,220,.7)'; g.beginPath(); g.arc(0, 0, 36, 0, 6.2832); g.fill();
  g.strokeStyle = 'rgba(40,12,48,.4)'; g.lineWidth = 3;
  for (let i = 0; i < 40; i++) { g.save(); g.rotate(i * Math.PI / 20); g.beginPath(); g.moveTo(0, -450); g.lineTo(0, -498); g.stroke(); g.restore(); }
});

/* Pétalo monumental: silueta ciruela con borde dorado */
const bigPetalTex = () => tex(256, 512, (g, w, h) => {
  const path = () => {
    g.beginPath(); g.moveTo(w / 2, 6);
    g.bezierCurveTo(w * .98, h * .3, w * .98, h * .78, w / 2, h - 6);
    g.bezierCurveTo(w * .02, h * .78, w * .02, h * .3, w / 2, 6);
  };
  const f = g.createLinearGradient(0, 0, 0, h);
  f.addColorStop(0, 'rgba(70,22,70,.10)'); f.addColorStop(.55, 'rgba(40,12,48,.5)'); f.addColorStop(1, 'rgba(24,6,34,.9)');
  path(); g.fillStyle = f; g.fill();
  const e = g.createLinearGradient(0, 0, 0, h);
  e.addColorStop(0, 'rgba(255,224,160,.65)'); e.addColorStop(1, 'rgba(255,224,160,.12)');
  g.strokeStyle = e; g.lineWidth = 4; g.stroke();
  g.strokeStyle = 'rgba(255,224,160,.18)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(w / 2, 24); g.lineTo(w / 2, h - 24); g.stroke();
});

/* Suelo: charco de luz dorada, sombra ciruela en el borde y flor de cinco pétalos grabada */
const floorTex = () => tex(1024, 1024, (g, w) => {
  const c = w / 2, s = w / (R * 2 - .4);   // px por unidad
  const r = g.createRadialGradient(c, c, 0, c, c, c);
  r.addColorStop(0, 'rgba(255,232,170,.6)'); r.addColorStop(.25, 'rgba(255,214,130,.28)');
  r.addColorStop(.6, 'rgba(40,12,48,.12)'); r.addColorStop(1, 'rgba(24,6,34,.8)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
  g.translate(c, c);
  g.strokeStyle = 'rgba(255,240,200,.5)'; g.lineWidth = 3; g.fillStyle = 'rgba(255,246,220,.07)';
  for (let i = 0; i < 5; i++) {
    g.save(); g.rotate(i * Math.PI * 2 / 5);
    g.beginPath(); g.moveTo(0, 0);
    g.bezierCurveTo(1.5 * s, -1.2 * s, 1.5 * s, -3 * s, 0, -3.4 * s);
    g.bezierCurveTo(-1.5 * s, -3 * s, -1.5 * s, -1.2 * s, 0, 0);
    g.fill(); g.stroke(); g.restore();
  }
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,240,200,.28)';
  for (let i = 0; i < 60; i++) { g.save(); g.rotate(i * Math.PI / 30); g.beginPath(); g.moveTo(0, -4.3 * s); g.lineTo(0, -(i % 5 ? 4.6 : 5.0) * s); g.stroke(); g.restore(); }
});

/* Pétalo suelto que cae */
const fallingPetalTex = () => tex(64, 64, (g) => {
  g.translate(32, 32); g.rotate(-.6);
  const f = g.createRadialGradient(0, -4, 2, 0, 0, 24);
  f.addColorStop(0, 'rgba(255,252,240,1)'); f.addColorStop(1, 'rgba(255,236,196,.9)');
  g.fillStyle = f; g.beginPath(); g.ellipse(0, 0, 11, 22, 0, 0, 6.2832); g.fill();
});

export function buildCoreAmbience(group) {
  const soft = radial([[0, '#fff'], [.35, '#aaa'], [1, '#000']]);
  const cream = new THREE.Color(0xfff0c0);

  /* ---- Cúpula con sombras y nervaduras ---- */
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R - .3, 48, 24), flat(domeTex(), 1, { side: THREE.BackSide }));
  dome.renderOrder = -5;
  group.add(dome);

  /* ---- Rosetón al fondo (lento giro) ---- */
  const rosette = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 11.5), flat(rosetteTex(), .6));
  rosette.position.set(0, 1.2, -12.2); rosette.renderOrder = -4;
  group.add(rosette);

  /* ---- Suelo: charco de luz y flor grabada ---- */
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R - .2, 96), flat(floorTex(), 1));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR - .02; floor.renderOrder = -4;
  group.add(floor);

  /* ---- Pétalos monumentales: dos planos para dar paralaje cuando la cámara se mueve ---- */
  const petalMap = bigPetalTex();
  const ring = (r, from, to, step, w, h, cy, opacity, order) => {
    const g = new THREE.Group();
    for (let a = from; a <= to; a += step) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat(petalMap, opacity, { side: THREE.DoubleSide }));
      const [x, z] = polar(deg(a), r);
      m.position.set(x, cy, z); m.rotation.y = -deg(a); m.renderOrder = order;
      g.add(m);
    }
    group.add(g);
    return g;
  };
  const farPetals = ring(12.4, -120, 120, 20, 4.6, 11, 3.4, .5, -3);
  const nearPetals = ring(10, -100, 100, 25, 3.4, 8, 2, .75, -2);

  /* ---- Resplandor detrás de la flor y de Sael ---- */
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: 0xffe2a0, transparent: true, opacity: .34, blending: ADD, depthWrite: false, fog: false }));
  halo.position.set(0, .3, -2.2); halo.scale.setScalar(11);
  const saelHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: cream, transparent: true, opacity: .22, blending: ADD, depthWrite: false, fog: false }));
  saelHalo.position.set(0, .5, -5.4); saelHalo.scale.set(4.2, 6, 1);
  group.add(halo, saelHalo);

  /* ---- Haz de luz del óculo hasta la flor ---- */
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(.5, 2.8, 14, 40, 1, true),
    glow(vertical([[0, '#fff'], [.7, '#777'], [1, '#000']]), 0xffe6b0, .09, { side: THREE.DoubleSide })
  );
  shaft.position.y = 5;
  group.add(shaft);

  /* ---- Ecos: ondas de luz que nacen bajo la flor y se expanden por el suelo ---- */
  const echoes = [0, 1, 2].map(i => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(.97, 1, 128),
      new THREE.MeshBasicMaterial({ color: 0xfff0c0, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false, fog: false })
    );
    m.rotation.x = -Math.PI / 2; m.position.y = FLOOR + .02;
    group.add(m);
    return { m, p: i / 3 };
  });

  /* ---- Las seis semillas de los resonantes, en arco alrededor de la flor ---- */
  const seeds = IDS.map((id, i) => {
    const col = new THREE.Color(CHARACTER_COLORS[id] || '#e0b25a');
    const a0 = deg(-75 + i * 30);
    const core = new THREE.Mesh(new THREE.SphereGeometry(.14, 16, 12), new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color(0xffffff), .35), fog: false }));
    const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: col, transparent: true, opacity: .3, blending: ADD, depthWrite: false, fog: false }));
    halo2.scale.setScalar(1.9);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), glow(soft, col, .22));
    pool.rotation.x = -Math.PI / 2;
    group.add(core, halo2, pool);
    return { a0, core, halo2, pool, i };
  });

  /* ---- Luces colgantes (plano intermedio) ---- */
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffe3b0, transparent: true, opacity: .28, fog: false });
  const strandPts = [], bulbs = [[], []];
  for (let i = 0; i < 11; i++) {
    const a = deg(-85 + i * 17), r = 6.5 + ((i * 37) % 5) * .7, [x, z] = polar(a, r);
    const yb = 2.2 + ((i * 53) % 7) * .55;
    strandPts.push(new THREE.Vector3(x, 10, z), new THREE.Vector3(x, yb, z));
    bulbs[i % 2].push(new THREE.Vector3(x, yb, z));
  }
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(strandPts), lineMat));
  const bulbMats = bulbs.map(list => {
    const geo = new THREE.BufferGeometry().setFromPoints(list);
    const m = new THREE.PointsMaterial({ size: .55, map: soft, color: 0xffd08a, transparent: true, opacity: 1, blending: ADD, depthWrite: false, fog: false });
    const bloom = new THREE.PointsMaterial({ size: 1.9, map: soft, color: 0xffb870, transparent: true, opacity: .14, blending: ADD, depthWrite: false, fog: false });
    group.add(new THREE.Points(geo, m), new THREE.Points(geo, bloom));
    return m;
  });

  /* ---- Pétalos cayendo y destellos ascendentes ---- */
  const NP = 70, NM = 90;
  const petals = Array.from({ length: NP }, () => ({ x: (Math.random() - .5) * 18, y: FLOOR + Math.random() * 10, z: -10 + Math.random() * 13, sp: .12 + Math.random() * .2, ph: Math.random() * 6.28 }));
  const motes = Array.from({ length: NM }, () => ({ x: (Math.random() - .5) * 20, y: FLOOR + Math.random() * 10, z: -11 + Math.random() * 14, sp: .05 + Math.random() * .1, ph: Math.random() * 6.28 }));
  const pp = new Float32Array(NP * 3), mp = new Float32Array(NM * 3);
  const petalGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const moteGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const petalPts = new THREE.Points(petalGeo, new THREE.PointsMaterial({ size: .3, map: fallingPetalTex(), color: 0xfff1d0, transparent: true, opacity: .8, depthWrite: false, fog: false }));
  const motePts = new THREE.Points(moteGeo, new THREE.PointsMaterial({ size: .1, map: soft, color: 0xfff0cc, transparent: true, opacity: .8, blending: ADD, depthWrite: false, fog: false }));
  petalPts.frustumCulled = motePts.frustumCulled = false;
  group.add(petalPts, motePts);

  const place = (t, dt, k) => {
    petals.forEach((p, i) => {
      p.y -= dt * p.sp * (1 - 2.4 * k);                       // en el final los pétalos ascienden
      if (p.y < FLOOR + .1) p.y = 8; else if (p.y > 8.2) p.y = FLOOR + .2;
      pp[i * 3] = p.x + Math.sin(t * .5 + p.ph) * .8; pp[i * 3 + 1] = p.y; pp[i * 3 + 2] = p.z + Math.cos(t * .4 + p.ph) * .6;
    });
    motes.forEach((m, i) => {
      m.y += dt * m.sp * (1 + 2 * k);
      if (m.y > 8.5) m.y = FLOOR + .2;
      mp[i * 3] = m.x + Math.sin(t * .3 + m.ph) * .5; mp[i * 3 + 1] = m.y; mp[i * 3 + 2] = m.z;
    });
    petalGeo.attributes.position.needsUpdate = true;
    moteGeo.attributes.position.needsUpdate = true;
  };
  place(0, 0, 0);
  seeds.forEach(s => { const [x, z] = polar(s.a0, 5.8); s.core.position.set(x, -.35, z); s.halo2.position.copy(s.core.position); s.pool.position.set(x, FLOOR + .03, z); });

  /* ---- Animación (respeta "reducir movimiento") ---- */
  let k = 0, h = 0;   // k: intensidad del final · h: intensidad del hover sobre la flor
  function animate(t, dt, hover) {
    if (RM) return;
    const finale = S.p === 3 && S.step === 2;
    k += ((finale ? 1 : 0) - k) * Math.min(1, dt * .8);
    h += ((hover ? 1 : 0) - h) * Math.min(1, dt * 4);

    halo.material.opacity = .34 + .05 * Math.sin(t * 1.2) + .22 * k + .1 * h;
    halo.scale.setScalar(11 + 4 * k + .6 * h);
    saelHalo.material.opacity = .2 + .05 * Math.sin(t * .8);
    shaft.material.opacity = .09 + .015 * Math.sin(t * .6) + .06 * k + .03 * h;
    rosette.rotation.z += dt * .015 * (1 + 3 * k);
    farPetals.rotation.y = Math.sin(t * .09) * .03;
    nearPetals.rotation.y = Math.sin(t * .11 + 1) * -.03;

    echoes.forEach(e => {
      e.p = (e.p + dt * (1 + .9 * h + 1.2 * k) / 6.5) % 1;
      e.m.scale.setScalar(.8 + e.p * 12);
      e.m.material.opacity = Math.pow(1 - e.p, 1.6) * (.5 + .2 * k);
    });

    seeds.forEach(s => {
      const [x, z] = polar(s.a0 + Math.sin(t * .12 + s.i) * .22, 5.8);
      const y = -.35 + Math.sin(t * .9 + s.i * 1.1) * .14;
      s.core.position.set(x, y, z); s.halo2.position.set(x, y, z); s.pool.position.set(x, FLOOR + .03, z);
      s.halo2.material.opacity = .28 + .08 * Math.sin(t * 1.4 + s.i) + .3 * k;
      s.pool.material.opacity = .22 + .2 * k;
    });

    bulbMats[0].opacity = .75 + .25 * Math.sin(t * 2.1);
    bulbMats[1].opacity = .75 + .25 * Math.sin(t * 2.1 + Math.PI);
    place(t, dt, k);
  }
  return { animate };
}