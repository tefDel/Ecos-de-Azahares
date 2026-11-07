/* Estado global del juego. Todos los módulos leen y escriben aquí. */
export const S = {
  /* Progreso general */
  p: 0,              // fase actual (0 Detonante · 1 Teseracto · 2 Fractura · 3 Núcleo)
  step: 0,           // subpaso dentro de la fase (en el núcleo: 0 flor · 1 elección · 2 final)
  cycle: 0,          // número de ciclo (cada reinicio suma 1)
  lock: true,        // true = se ignoran clics en el mundo
  busy: false,       // true mientras se hace el fundido del reinicio
  muted: false,
  rt: null,          // temporizador del reinicio automático

  /* Misterio del ciclo actual */
  run: null,         // { culprit, q, order, shift, secret, secretFound, tmap }
  clues: [],
  verdict: null,     // a quién acusó la persona
  solved: 0,         // casos resueltos en total
  lost: new Set(),   // registros dañados (por la última visita)
  nextLost: null,
  saved: new Set(),  // registros salvados en la Fractura
  recovered: 0,

  /* Vista 2: expedientes */
  letter: false,
  dossier: null,     // id del resonante abierto
  heard: {},         // segundos escuchados por resonante
  freed: new Set(),  // resonantes liberados
  playing: false,
  dv: null,          // voz del expediente
  yawT: null,        // giro de cámara objetivo
  dir: 0,            // giro por teclado/botones (-1, 0, 1)
  mouse: false,

  /* Vista 3: Fractura */
  tracks: [],
  held: -1,
  tleft: 0,
  surge: 0,

  /* Vista 4: núcleo */
  cv: null,          // voz del eco final
  seen: new Set(),

  /* Ambiente visual */
  mood: 0, moodT: 0,       // color (0 gris -> 1 dorado) actual / objetivo
  glitch: 0, glitchT: 0    // distorsión actual / objetivo
};
