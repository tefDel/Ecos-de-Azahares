/* Utilidades generales compartidas por todos los módulos. */
export const $ = s => document.querySelector(s);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Segundos -> "mm:ss" */
export const fmt = s =>
  String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');

export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = a => [...a].sort(() => Math.random() - .5);
