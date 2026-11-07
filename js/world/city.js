/* Zona 1: la CIUDAD — cinco puertas grises, edificios, polvo y la primera flor. */
import { T, basic } from './materials.js';
import { createFlower, setFlower } from './flower.js';

/* Posición X de la puerta i (la del centro es la 2) */
export const doorX = i => (i - 2) * 6;

export function buildCity(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), T(basic(0x333333), 0x2e2f31, 0x8a6a2a));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.6, -20);
  group.add(floor);

  /* Puertas: "back" es la luz dorada detrás, "panel" es la hoja que se desliza */
  const doors = [];
  for (let i = 0; i < 5; i++) {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.4), basic(0xffd27a));
    back.position.set(doorX(i), .6, -5.1); back.visible = false;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.4, .2), T(basic(0x444444), 0x3d3e41, 0x9a7b35));
    panel.position.set(doorX(i), .6, -5);
    group.add(back, panel);
    doors.push({ panel, back, k: 0, open: false });
  }

  /* Edificios al fondo */
  for (let i = 0; i < 18; i++) {
    const h = 4 + Math.random() * 10;
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(3 + Math.random() * 3, h, 2),
      T(basic(0x2a2b2d), 0x2a2b2d, 0x7a5e28)
    );
    b.position.set(-30 + i * 3.4, h / 2 - 1.6, -9 - Math.random() * 3);
    group.add(b);
  }

  /* Polvo flotante */
  const dp = [];
  for (let i = 0; i < 240; i++) dp.push((Math.random() - .5) * 40, Math.random() * 8 - 1.5, Math.random() * -14 + 4);
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)),
    T(new THREE.PointsMaterial({ size: .06 }), 0x777a7d, 0xe0b25a)
  );
  group.add(dust);

  const flower = createFlower();
  setFlower(flower, 'neon');
  group.add(flower.g);

  /* decor = lo que un .glb de entorno puede reemplazar (puertas y flor se conservan) */
  const decor = group.children.filter(c => c !== flower.g && !doors.some(d => d.panel === c || d.back === c));

  return { group, doors, dust, flower, decor };
}
