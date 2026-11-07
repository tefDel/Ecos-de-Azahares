/* Zona 3: el NÚCLEO — cámara esférica dorada, flor sin color y figura de Sael Vantorin. */
import { T, basic } from './materials.js';
import { createFlower, setFlower } from './flower.js';

export function buildCore(scene, pos) {
  const group = new THREE.Group();
  group.position.copy(pos);
  scene.add(group);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(14, 32, 20),
    T(basic(0x777777, { side: THREE.BackSide, fog: false }), 0x2a2b2d, 0xb88a35)
  );
  group.add(shell);

  [4, 7, 10].forEach(r => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(r, r + .05, 80),
      basic(0xfff0c0, { side: THREE.DoubleSide, transparent: true, opacity: .35 })
    );
    m.rotation.x = -Math.PI / 2; m.position.y = -2;
    group.add(m);
  });

  const flower = createFlower();
  setFlower(flower, 'none');
  flower.g.position.set(0, .1, 0);
  group.add(flower.g);

  /* Sael Vantorin: cono + cabeza translúcidos */
  const sael = new THREE.Group();
  const mat = basic(0xfff0c0, { transparent: true, opacity: .28 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(.7, 3.4, 24), mat); body.position.y = -.2;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), mat); head.position.y = 1.9;
  sael.add(body, head);
  sael.position.set(0, -.2, -5);
  group.add(sael);

  const decor = group.children.filter(c => c !== flower.g && c !== sael);
  return { group, flower, sael, decor };
}
