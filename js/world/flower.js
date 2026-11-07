/* Flor de azahar: 5 pétalos + centro + halo.
   Modos de color: neon | none (sin color) | warm */
import { basic } from './materials.js';

/* Textura circular difusa para el halo */
const glowTexture = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

export function createFlower() {
  const g = new THREE.Group(), pets = [];

  for (let i = 0; i < 5; i++) {
    const petal = new THREE.Group();
    const m = basic(0xff007f, { transparent: true });
    const s = new THREE.Mesh(new THREE.SphereGeometry(.32, 24, 16), m);
    petal.rotation.z = i * Math.PI * 2 / 5;
    s.scale.set(.6, 1.15, .22); s.position.y = .42;
    petal.add(s); g.add(petal); pets.push(m);
  }

  const cm = basic(0xffe3f1);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), cm));

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color: 0xff007f, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5
  }));
  glow.scale.set(3.2, 3.2, 1); g.add(glow);

  /* Esfera invisible: zona de clic/hover */
  const hit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), basic(0, { visible: false }));
  g.add(hit);

  return { g, pets, cm, glow, hit, s: 1 };
}

export function setFlower(f, mode) {
  const cols = {
    neon: [0xff007f, 0xff007f, 0xff007f, 0xff007f, 0xff007f],
    none: Array(5).fill(0xf2f2f2),
    warm: [0xff007f, 0xffb347, 0xe0b25a, 0xff6f61, 0xffd98a]
  }[mode];
  f.pets.forEach((m, i) => { m.color.setHex(cols[i]); m.opacity = mode === 'none' ? .8 : 1; });
  f.cm.color.setHex(mode === 'neon' ? 0xffe3f1 : mode === 'none' ? 0xffffff : 0xfff3c4);
  f.glow.material.color.setHex(mode === 'neon' ? 0xff007f : mode === 'none' ? 0xffffff : 0xffd27a);
  f.mode = mode;
}
