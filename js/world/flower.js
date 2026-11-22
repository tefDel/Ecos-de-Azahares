/* Flor de azahar: 5 pétalos + centro + halo.
   Modos de color: neon | none (sin color) | warm */
import { basic } from './materials.js';
import { $ } from '../utils.js';

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

/* imageUrl opcional reemplaza la flor dibujada; imageMode retrasa su aparición
   hasta que la flor entra en ese modo. Mientras carga, se ve la flor dibujada. */
export function createFlower(imageUrl, imageMode = 'always') {
  const g = new THREE.Group(), pets = [];
  const art = new THREE.Group(); g.add(art); // flor dibujada con código

  for (let i = 0; i < 5; i++) {
    const petal = new THREE.Group();
    const m = basic(0xff007f, { transparent: true });
    const s = new THREE.Mesh(new THREE.SphereGeometry(.32, 24, 16), m);
    petal.rotation.z = i * Math.PI * 2 / 5;
    s.scale.set(.6, 1.15, .22); s.position.y = .42;
    petal.add(s); art.add(petal); pets.push(m);
  }

  const cm = basic(0xffe3f1);
  art.add(new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), cm));

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color: 0xff007f, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5
  }));
  glow.scale.set(3.2, 3.2, 1); glow.renderOrder = 1; g.add(glow);

  const f = {
    g, pets, cm, glow, s: 1, art, imageUrl, imageMode,
    imageVisible: Boolean(imageUrl) && imageMode === 'always',
    imageLoaded: false
  };

  if (imageUrl) {
    const addImage = tex => {
      const H = 2.3, { width, height } = tex.image;
      const img = new THREE.Mesh(
        new THREE.PlaneGeometry(H * width / height, H),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
      );
      img.renderOrder = 2; // por encima del halo, sin teñirlo
      g.add(img);
      f.img = img;
      f.imageLoaded = true;
      img.visible = f.imageVisible;
      art.visible = !f.imageVisible;
    };
    const onError = () => console.warn('No se pudo cargar', imageUrl, '— se usa la flor dibujada');
    if (location.protocol === 'file:') {
      const image = new Image();
      image.className = 'world-flower-image';
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.draggable = false;
      image.style.display = 'none';
      $('#game').append(image);
      image.onload = () => {
        f.imageElement = image;
        f.imageHeight = 2.3;
        f.imageLoaded = true;
        art.visible = !f.imageVisible;
      };
      image.onerror = onError;
      image.src = imageUrl;
    } else {
      new THREE.TextureLoader().load(imageUrl, addImage, undefined, onError);
    }
  }

  /* Esfera invisible: zona de clic/hover */
  const hit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), basic(0, { visible: false }));
  g.add(hit);

  f.hit = hit;
  return f;
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
  f.imageVisible = Boolean(f.imageUrl) && (f.imageMode === 'always' || mode === f.imageMode);
  const showImage = f.imageLoaded && f.imageVisible;
  f.art.visible = !showImage;
  if (f.img) f.img.visible = showImage;
}