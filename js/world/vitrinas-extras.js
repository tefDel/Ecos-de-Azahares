/* Objetos 3D nuevos de las vitrinas: piedra de Tala y los objetos de Virena, Lyra y Kael.
   Todo se construye con geometrías de Three.js (sin imágenes ni modelos). THREE llega como global. */
import { basic } from './materials.js';

/* Animación propia de un objeto: se ejecuta en cada dibujo, sin tocar world/index.js */
const animate = (mesh, fn) => { mesh.onBeforeRender = () => fn(performance.now() / 1000); };

/* TALA · piedra fangosa con marca tribal */
export function fillTala(v) {
  const R = .55;
  const bump = (x, y, z) => 1 + .07 * Math.sin(x * 7.3 + y * 3.1) + .07 * Math.sin(y * 6.1 + z * 5.3) + .06 * Math.sin(z * 9.7 + x * 2.3);
  const geo = new THREE.DodecahedronGeometry(R, 3);
  const pos = geo.attributes.position, col = [];
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k), d = new THREE.Vector3(x, y, z).normalize(), n = bump(d.x, d.y, d.z);
    pos.setXYZ(k, x * n, y * n * .92, z * n);
    const mud = y < -.12 ? .5 : .78 + .22 * Math.sin(x * 11 + z * 9 + y * 4); // más fango abajo
    col.push(.44 * mud, .3 * mud, .18 * mud);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  v.inner.add(new THREE.Mesh(geo, basic(0xffffff, { vertexColors: true })));

  /* Marca tribal: sol con rayos, punto central y zigzag, pegada a la superficie en dos caras */
  const ochre = basic(0xf6c25a);
  const onStone = (x, y, side) => { // punto de la superficie en la dirección (x, y, ±1)
    const d = new THREE.Vector3(x, y, side).normalize(), r = R * bump(d.x, d.y, d.z) * 1.03;
    return new THREE.Vector3(d.x * r, d.y * r * .92, d.z * r);
  };
  const tube = (pts, closed) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', .1), pts.length * 4, .016, 5, closed), ochre);
  [1, -1].forEach(side => {
    const sx = side; // espejo para que la marca se lea en ambas caras
    const ring = [], dot = [];
    for (let k = 0; k < 28; k++) {
      const a = k / 28 * Math.PI * 2;
      ring.push(onStone(Math.cos(a) * .3 * sx, Math.sin(a) * .3 + .12, side));
      if (k % 2 === 0) dot.push(onStone(Math.cos(a) * .07 * sx, Math.sin(a) * .07 + .12, side));
    }
    v.inner.add(tube(ring, true), tube(dot, true));
    for (let k = 0; k < 8; k++) { // rayos
      const a = k / 8 * Math.PI * 2 + .2;
      v.inner.add(tube([onStone(Math.cos(a) * .38 * sx, Math.sin(a) * .38 + .12, side), onStone(Math.cos(a) * .52 * sx, Math.sin(a) * .52 + .12, side)], false));
    }
    const zig = [-.3, -.15, 0, .15, .3].map((x, k) => onStone(x * sx, -.3 - (k % 2) * .09, side));
    v.inner.add(tube(zig, false)); // zigzag inferior
  });
}

/* VIRENA · hoja de planta verde claro con nervaduras y esporas */
function fillVirena(v) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -.7); sh.bezierCurveTo(.58, -.35, .5, .35, 0, .78); sh.bezierCurveTo(-.5, .35, -.58, -.35, 0, -.7);
  const geo = new THREE.ShapeGeometry(sh, 24), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setZ(k, Math.abs(p.getX(k)) * .45 - p.getY(k) * p.getY(k) * .12); // pliegue central
  geo.computeVertexNormals();
  const leaf = new THREE.Mesh(geo, basic(0xa8eb9a, { side: THREE.DoubleSide }));
  const veins = [];
  veins.push(0, -.7, 0, 0, .72, 0);
  [-.45, -.2, .05, .3].forEach(y => {
    const w = .38 * (1 - Math.abs(y - .05) * .9);
    veins.push(0, y, 0, w, y + .2, w * .45, 0, y, 0, -w, y + .2, w * .45);
  });
  const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.Float32BufferAttribute(veins, 3));
  leaf.add(new THREE.LineSegments(vg, new THREE.LineBasicMaterial({ color: 0x4f9a4a })));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, .4, 8), basic(0x6fbf66));
  stem.position.y = -.88; leaf.add(stem);
  v.inner.add(leaf);

  const spores = [];
  for (let k = 0; k < 6; k++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 8), basic(0xe6ffd9, { transparent: true, opacity: .85 }));
    v.inner.add(s); spores.push(s);
  }
  animate(leaf, t => {
    leaf.rotation.z = Math.sin(t * 1.1) * .1; leaf.rotation.x = Math.sin(t * .8) * .08;
    spores.forEach((s, k) => { const a = t * .6 + k * 1.05; s.position.set(Math.cos(a) * .85, Math.sin(a * 1.4 + k) * .7, Math.sin(a) * .85); });
  });
}

/* LYRA · nube celeste con los elementos (fuego, agua, roca y trueno) orbitando */
function fillLyra(v) {
  const cloud = new THREE.Group(), cm = basic(0x9fd9ff, { transparent: true, opacity: .95 });
  [[0, 0, 0, .34], [-.3, -.06, .04, .26], [.3, -.06, -.03, .27], [-.13, .2, 0, .24], [.15, .22, .02, .22]].forEach(([x, y, z, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), cm); m.position.set(x, y, z); cloud.add(m);
  });
  cloud.position.y = .3; v.inner.add(cloud);

  const bolt = new THREE.Shape(); // rayo
  [[.05, .2], [-.1, -.02], [0, -.02], [-.08, -.24], [.12, .0], [.02, .0]].forEach(([x, y], k) => k ? bolt.lineTo(x, y) : bolt.moveTo(x, y));
  const el = [
    new THREE.Mesh(new THREE.ConeGeometry(.11, .3, 10), basic(0xff4a1c)),                         // fuego
    new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), basic(0x2f86ff)),                        // agua
    new THREE.Mesh(new THREE.DodecahedronGeometry(.12), basic(0x8a5a33)),                          // roca
    new THREE.Mesh(new THREE.ShapeGeometry(bolt), basic(0xffe23a, { side: THREE.DoubleSide }))     // trueno
  ];
  el[3].scale.setScalar(1.3);
  el.forEach(m => v.inner.add(m));
  animate(cloud.children[0], t => {
    cloud.position.y = .3 + Math.sin(t * 1.2) * .05;
    el.forEach((m, k) => {
      const a = t * .9 + k * Math.PI / 2;
      m.position.set(Math.cos(a) * .85, -.35 + Math.sin(a * 2) * .12, Math.sin(a) * .85);
      m.rotation.y = a; if (k === 3) m.rotation.set(0, 0, 0), m.rotation.y = -a;
    });
  });
}

/* KAEL · dos máscaras rojas de monstruo (estilo oni japonés) */
function oniMask(color) {
  const g = new THREE.Group(), red = basic(color), dark = basic(0x1a0505), bone = basic(0xf2e6c9), gold = basic(0xe8b04a);
  const face = new THREE.Mesh(new THREE.SphereGeometry(.42, 20, 16), red); face.scale.set(.82, 1, .42); g.add(face);
  [-1, 1].forEach(s => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(.26, .06, .05), dark); brow.position.set(s * .16, .17, .14); brow.rotation.z = -s * .45; g.add(brow);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 8), gold); eye.scale.set(1.6, .6, .6); eye.position.set(s * .15, .08, .15); g.add(eye);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(.06, .3, 8), bone); horn.position.set(s * .2, .45, .02); horn.rotation.z = -s * .35; g.add(horn);
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(.035, .14, 6), bone); tusk.position.set(s * .12, -.2, .14); g.add(tusk);
  });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(.3, .06, .05), dark); mouth.position.set(0, -.15, .16); g.add(mouth);
  return g;
}
function fillKael(v) {
  const pair = new THREE.Group(), a = oniMask(0xd32020), b = oniMask(0x9c1212);
  a.position.set(-.48, .05, 0); a.rotation.y = .3;
  b.position.set(.48, -.05, 0); b.rotation.y = -.3; b.scale.setScalar(.92);
  pair.add(a, b); v.inner.add(pair);
  /* las máscaras siempre miran hacia el centro de la sala (donde está el jugador), aunque la vitrina gire */
  const toCenter = Math.atan2(-v.bx, -v.bz);
  animate(a.children[0], t => { pair.rotation.y = toCenter + Math.sin(t * .9) * .4 - v.inner.rotation.y; });
}

/* Objetos de las vitrinas que NO guardan un registro (el juego las sigue tratando como vacías) */
export const SKIN = { virena: fillVirena, lyra: fillLyra, kael: fillKael };