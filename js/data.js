/* DATA: contenido narrativo (editable). Aquí se cambian textos, personajes y finales. */

export const PHASES = ['Detonante', 'Teseracto', 'Fractura', 'Núcleo'];
export const IDS = ['nyxa', 'tala', 'volt'];

/* Los tres resonantes */
export const RES = {
  nyxa: {
    n: 1, name: 'Nyxa', epi: 'La que habita entre sombras', glyph: 'ᚾᚣᛉᚨ ᛞᛟᚱ', dur: 30, angle: 0,
    txt: 'Aquí las sombras no persiguen: sostienen. Aprendí a vivir en el borde de lo que nadie mira. Si me nombras, me haces un poco más real. Nómbrame despacio.'
  },
  tala: {
    n: 2, name: 'Tala', epi: 'La de los ecos de bestias', glyph: 'ᛏᚨᛚᚨ ᚲᚱᚢ', dur: 30, angle: 2 * Math.PI / 3,
    txt: 'Lo que ruge en mí no es mío. Son las bestias que otros callaron, convertidas en voz. Cuando el pasillo tiembla, soy yo recordando que alguna vez corrí libre.'
  },
  volt: {
    n: 3, name: 'Volt', epi: 'El de la jaula de energía', glyph: 'ᚡᛟᛚᛏ ᛖᚾᛉ', dur: 30, angle: 4 * Math.PI / 3,
    txt: 'Me llaman corriente, pero soy un deseo sin salida. Cada barrote es una vez que dije "después". La jaula no me contiene: me recuerda.'
  }
};

/* Frase de apertura de la carta (cambia en cada ciclo) */
export const OPEN = [
  'Cada mañana suena el mismo despertador y cada noche vuelves por la misma calle. Esta vez no la tomes.',
  'Alguien dejó una flor en una puerta que no era la tuya. Ven a ver por qué.',
  'Hay un museo que guarda lo que ya no recuerdas. Hoy falta algo.'
];

/* MISTERIO: en cada ciclo el culpable cambia al azar. Preguntas posibles: */
export const MYST = [
  '¿Quién dejó la flor de azahar en la puerta?',
  '¿Quién abrió la primera grieta en el museo?',
  '¿Quién escribió la carta que te trajo hasta aquí?',
  '¿Quién borró un recuerdo del Teseracto?'
];

/* Testimonios CLUES[testigo][culpable]; si testigo y culpable coinciden, es un desliz involuntario. */
export const CLUES = {
  nyxa: {
    nyxa: 'Yo no salí de mi sombra... aunque ahora huele a azahar entre mis manos.',
    tala: 'Una bestia rozó mi sombra y dejó pétalos en el suelo.',
    volt: 'Sentí un chispazo en la oscuridad: alguien con la jaula abierta.'
  },
  tala: {
    nyxa: 'Entre mis ecos oí susurros que solo nacen de las sombras.',
    tala: 'No fui yo... pero mis ecos repiten un paso muy parecido al mío.',
    volt: 'El suelo olía a ozono. Solo hay una jaula que huela así.'
  },
  volt: {
    nyxa: 'Todas las luces se apagaron un instante. Solo Nyxa apaga luces así.',
    tala: 'Escuché pasos de bestia sobre mis barrotes.',
    volt: 'Yo no abrí nada... y sin embargo mis barrotes están tibios.'
  }
};

/* Fragmentos de la Bitácora (se obtienen al salvar un registro): [inocente, culpable] POSIBLEMENTE SE VA CAMBIAR */
export const FRAG = {
  nyxa: [
    'Nyxa, en la bitácora: «Yo vigilaba la puerta; jamás la crucé».',
    'Nyxa, en la bitácora: «La puerta me eligió a mí y yo dije que sí».'
  ],
  tala: [
    'Tala, en la bitácora: «Mis ecos rugían afuera mientras todo ocurría».',
    'Tala, en la bitácora: «Corrí hacia la puerta antes de que nadie me viera».'
  ],
  volt: [
    'Volt, en la bitácora: «Estuve enjaulado toda la noche; los barrotes son testigos».',
    'Volt, en la bitácora: «Rompí un barrote por un segundo; fue suficiente».'
  ]
};

/* Finales: A/B si acertaste (salvaste muchos / pocos registros), C/D si fallaste */
export const ENDS = {
  A: 'Acertaste y salvaste casi todo: la verdad se asienta sin dolor y el museo respira.',
  B: 'Acertaste, pero casi todos los registros quedaron mudos. Sabes quién fue y nadie queda para recordarlo contigo.',
  C: 'Fallaste, pero los registros se salvaron: el museo guarda la verdad y esperará a que vuelvas por ella.',
  D: 'Fallaste y los registros se perdieron. La verdad se quedó entre las grietas.'
};

/* Opciones de la pregunta final: "¿qué estás dispuesto a soltar?" */
export const RELEASE = [
  'Una conversación que nunca tuve',
  'Un lugar al que no volví',
  'Un nombre que aún pronuncio en voz baja',
  'Una versión de mí que ya no soy'
];
