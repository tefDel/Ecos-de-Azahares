/* W: el mundo 3D (Three.js) y la cámara cinematográfica.
   Une las tres zonas (ciudad, teseracto, núcleo) y expone lo que el resto del juego necesita. */
import { $, RM, clamp, ease } from '../utils.js';
import { S } from '../state.js';
import { tint } from './materials.js';
import { setFlower } from './flower.js';
import { buildCity, doorX } from './city.js';
import { buildGallery } from './gallery.js';
import { buildCore } from './coreRoom.js';

/* ---------- Renderer, escena y cámara ---------- */
const renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(58, 1, .1, 300);
const bgGray = new THREE.Color(0x232426), bgGold = new THREE.Color(0xc9a24f);
const bg = new THREE.Color(), neon = new THREE.Color(0xff007f);
scene.background = bg;
scene.fog = new THREE.Fog(0x232426, 4, 70);

const look = new THREE.Vector3();
const GAL = new THREE.Vector3(0, 0, -70);
const CORE = new THREE.Vector3(0, 0, -150);
let doorIdx = 2, baseFov = 58, tw = null; // tw = vuelo de cámara en curso

/* ---------- Zonas ---------- */
const city = buildCity(scene);
const gallery = buildGallery(scene, GAL);
const coreRoom = buildCore(scene, CORE);
const fl1 = city.flower, fl2 = coreRoom.flower;
const { doors, dust } = city;

scene.add(new THREE.AmbientLight(0xffffff, .8));
const sun = new THREE.DirectionalLight(0xffffff, .8);
sun.position.set(5, 10, 7);
scene.add(sun);

/* ---------- Entornos intercambiables ----------
   Un .glb sustituye la decoración de cada zona (puertas, flores y vitrinas se conservan). */
const zones = {
  city: [city.group, 40, city.decor],
  gal: [gallery.group, 40, gallery.decor],
  core: [coreRoom.group, 26, coreRoom.decor]
};
const custom = {};

function setEnv(zone, model) {
  const [grp, size, decor] = zones[zone];
  if (custom[zone]) { grp.remove(custom[zone]); custom[zone] = null; }
  decor.forEach(o => { o.visible = !model; });
  if (!model) return;
  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  const k = size / Math.max(s.x, s.y, s.z, .001);
  model.scale.setScalar(k);
  model.position.set(-c.x * k, -c.y * k, -c.z * k);
  grp.add(model);
  custom[zone] = model;
}

/* ---------- Raycaster para hover / clic ---------- */
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickObject(objs, e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, cam);
  const hit = raycaster.intersectObjects(objs, false)[0];
  return hit ? hit.object : null;
}

/* ---------- Cámara: vuelo con curva (arco), easing cúbico y pulso de FOV ---------- */
function fly(pos, lk, dur, done, arc = 0) {
  tw = { p0: cam.position.clone(), l0: look.clone(), p1: pos, l1: lk, t: 0, dur, done, arc };
  W.free = null;
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  cam.aspect = innerWidth / innerHeight;
  baseFov = cam.aspect < 1 ? 74 : 58;
  cam.fov = baseFov;
  cam.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const galPos = () => GAL.clone().add(new THREE.Vector3(0, .2, 0));
const dirV = yaw => new THREE.Vector3(Math.sin(yaw) * 10, 0, -Math.cos(yaw) * 10);

/* Elige qué puerta (0-4) lleva la flor en este ciclo */
function setDoor(i) {
  doorIdx = i;
  doors.forEach((d, k) => { d.k = 0; d.open = false; d.back.visible = false; d.panel.position.x = doorX(k); });
  fl1.g.position.set(doorX(i), .6, -3);
}

function home() {
  cam.position.set(doorX(doorIdx), .6, 3);
  look.set(doorX(doorIdx), .6, -3);
  W.free = 'city';
  tw = null;
}

function openDoor() {
  const d = doors[doorIdx];
  d.back.visible = true; d.open = true;
}

/* ---------- Vitrinas: liberar / restaurar ---------- */
function freeVit(id) {
  const v = gallery.vit.find(x => x.id === id);
  if (!v) return;
  v.freed = true; v.orig = [];
  v.inner.traverse(o => {
    if (o.material && o.material.color) {
      v.orig.push([o.material, o.material.color.getHex()]);
      o.material.color.setHex(0xe0b25a);
    }
  });
}

function resetVit() {
  gallery.vit.forEach(v => {
    v.freed = false;
    v.inner.position.y = 0;
    v.glass.material.opacity = .07;
    (v.orig || []).forEach(([m, h]) => m.color.setHex(h));
    v.orig = [];
  });
}

/* ---------- Actualización por fotograma ---------- */
function updateBackground() {
  bg.copy(bgGray).lerp(bgGold, S.mood);
  if (Math.random() < .1) bg.lerp(neon, S.glitch * .3);
  scene.fog.color.copy(bg);
  tint.forEach(([mat, a, b]) => mat.color.copy(a).lerp(b, S.mood));
}

function updateCamera(dt, t) {
  if (tw) { // vuelo cinematográfico
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
      cam.fov = baseFov; cam.updateProjectionMatrix();
      if (done) done();
    }
  } else if (W.free === 'city') {
    const hx = doorX(doorIdx);
    cam.position.set(hx + W.mx * .5, .6 - W.my * .3, 3);
    look.set(hx, .6, -3);
  } else if (W.free === 'gal') {
    cam.position.copy(galPos());
    look.set(cam.position.x + Math.sin(W.yaw) * 10, .2 - W.my * 1.5, cam.position.z - Math.cos(W.yaw) * 10);
  } else if (W.free === 'core') {
    cam.position.set(CORE.x + Math.sin(t * .2) * 1.2, .5, CORE.z + 6);
    look.set(CORE.x, .2, CORE.z);
  }
}

/* Flores: latido; más intenso si el cursor está encima */
function animateFlowers(dt, t) {
  [[fl1, S.p === 0 && W.hov], [fl2, S.p === 3 && S.step === 0 && W.hov]].forEach(([f, hover]) => {
    const target = 1 + .06 * Math.sin(t * 3) + (hover ? .2 * (.5 + .5 * Math.sin(t * 9)) : 0);
    f.s += (target - f.s) * .2;
    f.g.scale.setScalar(f.s);
    f.g.rotation.z += dt * (f.mode === 'warm' ? .6 : .1);
    f.glow.material.opacity = (f.mode === 'none' ? .18 : .4) + .2 * Math.sin(t * 3) + (hover ? .25 : 0);
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

/* Vitrinas flotantes (con temblor si hay glitch) */
function animateShowcases(dt, t, g) {
  gallery.vit.forEach(v => {
    v.g.position.set(
      v.bx + (Math.random() - .5) * g * .5,
      Math.sin(t * .8 + v.y0) * .12 + (Math.random() - .5) * g * .5,
      v.bz
    );
    v.inner.rotation.y += dt * (v.id === 'volt' ? 3 : .6);

    if (v.freed) { // el resonante asciende y el cristal se desvanece
      v.inner.position.y = Math.min(1.8, v.inner.position.y + dt * .5);
      v.glass.material.opacity = Math.max(0, v.glass.material.opacity - dt * .05);
    }
    if (v.id === 'nyxa') v.x.forEach((b, k) => {
      const a = t * .7 + k;
      b.position.set(Math.cos(a) * .7, Math.sin(a * 1.3) * .9, Math.sin(a) * .7);
    });
    if (v.id === 'tala') v.x.forEach((r, k) => {
      const p = (t * .5 + k / 3) % 1;
      r.scale.setScalar(.4 + p * 1.1);
      r.material.opacity = .7 * (1 - p);
    });
    if (v.id === 'volt') v.inner.scale.setScalar(.9 + Math.random() * .3);
  });
}

function update(dt, t) {
  updateBackground();
  updateCamera(dt, t);
  cam.lookAt(look);

  /* Temblor de cámara por glitch (se deshace tras renderizar) */
  const shake = RM ? 0 : S.glitch, px = cam.position.x, py = cam.position.y;
  cam.position.x += (Math.random() - .5) * shake * .25;
  cam.position.y += (Math.random() - .5) * shake * .25;
  cam.rotation.z += (Math.random() - .5) * shake * .05;

  animateFlowers(dt, t);
  dust.rotation.y += dt * .02;
  animateDoors(dt);
  gallery.tess.rotation.x = t * .05; gallery.tess.rotation.y = t * .07;
  animateShowcases(dt, t, S.glitch);
  coreRoom.sael.position.y = -.2 + Math.sin(t * .6) * .1;

  renderer.render(scene, cam);
  cam.position.x = px; cam.position.y = py;
}

/* ---------- API pública ---------- */
export const W = {
  cam, fl1, fl2, glass: gallery.glass, GAL, CORE,
  free: null,            // modo de cámara libre: 'city' | 'gal' | 'core' | null (en vuelo)
  yaw: 0, mx: 0, my: 0,  // giro y posición del cursor (-1..1)
  hov: false,            // cursor sobre algo clicable
  pick: pickObject, fly, update, setDoor, setFlower, home, galPos, dirV, setEnv,
  freeVit, resetVit, openDoor,
  get doorIdx() { return doorIdx; }
};
