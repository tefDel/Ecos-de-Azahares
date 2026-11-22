/* Zona 2: el TESERACTO — cubo doble con conectores, anillos y vitrinas flotantes. */
import { T, basic } from './materials.js';
import { fillTala, SKIN } from './vitrinas-extras.js';

/* Cubo dentro de cubo unido por aristas */
function buildTesseract(edge) {
  const cube = s => new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s, s)), edge);
  const t = new THREE.Group();
  t.add(cube(40), cube(18));

  const pts = [];
  [-1, 1].forEach(x => [-1, 1].forEach(y => [-1, 1].forEach(z =>
    pts.push(new THREE.Vector3(x * 20, y * 20, z * 20), new THREE.Vector3(x * 9, y * 9, z * 9))
  )));
  t.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), edge));
  return t;
}

/* Contenido de cada vitrina según el resonante */
function fillNyxa(v) { // nudo + sombras orbitando
  v.inner.add(new THREE.Mesh(new THREE.TorusKnotGeometry(.35, .1, 80, 10), basic(0x6b6485, { wireframe: true })));
  for (let k = 0; k < 8; k++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 8), basic(0x15131c, { transparent: true, opacity: .8 }));
    v.inner.add(b); v.x.push(b);
  }
}

function fillVolt(v) { // octaedro dentro de una jaula
  v.inner.add(new THREE.Mesh(new THREE.OctahedronGeometry(.4), basic(0xf3efb0)));
  v.inner.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 1.3, 1.3)),
    new THREE.LineBasicMaterial({ color: 0xffee88 })
  ));
}
function fillEmpty(v) { // reserva para una vitrina sin representación asignada
  v.inner.add(new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 10), basic(0x888888, { transparent: true, opacity: .18 })));
}
const FILL = { nyxa: fillNyxa, tala: fillTala, volt: fillVolt };

function buildShowcase(id, i, edge, skin) {
  const a = i * Math.PI / 3, g = new THREE.Group();
  const bx = Math.sin(a) * 8, bz = -Math.cos(a) * 8;

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3.2, 2),
    basic(0xffffff, { transparent: true, opacity: .07, depthWrite: false })
  );
  glass.userData = { id, i };

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, .3, 24), T(basic(0x3E1B3B), 0x3E1B3B, 0x8c6d2e));
  base.position.y = -1.75;

  g.add(glass, new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), edge), base);

  const v = { g, id, bx, bz,skin, y0: Math.random() * 6, inner: new THREE.Group(), x: [], glass };
  g.add(v.inner);
  (FILL[id] || SKIN[skin] ||fillEmpty)(v);
  return v;
}

export function buildGallery(scene, pos) {
  const group = new THREE.Group();
  group.position.copy(pos);
  scene.add(group);

  const edge = T(new THREE.LineBasicMaterial(), 0x8F3E6B, 0xe0b25a);
  const tess = buildTesseract(edge);
  group.add(tess);

  [3, 6, 9, 12].forEach(r => { // anillos en el suelo
    const m = new THREE.Mesh(
      new THREE.RingGeometry(r, r + .04, 96),
      T(basic(0x555555, { side: THREE.DoubleSide }), 0x8F3E6B, 0xe0b25a)
    );
    m.rotation.x = -Math.PI / 2; m.position.y = -1.55;
    group.add(m);
  });

  /* 6 vitrinas: 3 resonantes y 3 representaciones selladas (una esconde el glifo secreto) */
  const vit = [], glass = [];
  [['nyxa'], [null, 'virena'], ['tala'], [null, 'lyra'], ['volt'], [null, 'kael']].forEach(([id, skin], i) => {
    const v = buildShowcase(id, i, edge, skin);
    group.add(v.g); vit.push(v); glass.push(v.glass);
  });

  const decor = group.children.filter(c => !vit.some(v => v.g === c));
  return { group, tess, vit, glass, decor };
}
