/* DATA: contenido narrativo (editable). Aquí se cambian textos, personajes y finales. */

export const PHASES = ['Detonante', 'Teseracto', 'Fractura', 'Núcleo'];
/* Los 6 resonantes, en el orden de la historia (y de las vitrinas del Teseracto). */
export const IDS = ['nyxa', 'virena', 'tala', 'lyra', 'volt', 'kael'];
/* Cuántos resonantes siguen un orden fijo al comienzo; los demás (Volt y Kael) se pueden liberar en cualquier orden. */
export const ORDER_FIXED = 4;

export const CHARACTER_COLORS = Object.freeze({
  volt: '#FFD60A',
  nyxa: '#9B59E0',
  lyra: '#5CCBFF',
  tala: '#A9713B',
  naxaly: '#FF2E93',
  kael: '#E32B2B',
  rythden: '#3A5F8A',
  selene: '#3A5F8A',
  virena: '#8FE388',
  adrian: '#6E8B3D',
  fractura: '#6F36A3'
});

/* Los seis resonantes (n = número de expediente; angle = posición de su vitrina: 60° × índice) */
export const RES = {
  nyxa: {
    n: 1, name: 'Nyxa', epi: 'La que habita entre sombras', glyph: 'ᚾᚣᛉᚨ ᛞᛟᚱ', dur: 30, angle: 0,
    img: 'assets/imgs/IMGs_Trasmedia/Nyxa.jpeg',
    txt: 'Aquí las sombras no persiguen: sostienen. Aprendí a vivir en el borde de lo que nadie mira. Si me nombras, me haces un poco más real. Nómbrame despacio.'
  },
  virena: {
    n: 2, name: 'Virena', epi: 'La de las hojas que respiran', glyph: 'ᚡᛁᚱᛖᚾᚨ ᚠᛖᚱ', dur: 30, angle: Math.PI / 3,
    img: 'assets/imgs/IMGs_Trasmedia/Virena.jpeg',
    txt: 'Nací donde nadie plantó nada. Cada hoja guarda un aliento que el museo olvidó, y las esporas que me rodean son recuerdos esperando suelo. Escúchame con calma: yo crezco despacio.'
  },
  tala: {
    n: 3, name: 'Tala', epi: 'La de los ecos de bestias', glyph: 'ᛏᚨᛚᚨ ᚲᚱᚢ', dur: 30, angle: 2 * Math.PI / 3,
    img: 'assets/imgs/IMGs_Trasmedia/Tala.jpeg',
    txt: 'Lo que ruge en mí no es mío. Son las bestias que otros callaron, convertidas en voz. Cuando el pasillo tiembla, soy yo recordando que alguna vez corrí libre.'
  },
  lyra: {
    n: 4, name: 'Lyra', epi: 'La que guarda las cuatro fuerzas', glyph: 'ᛚᚣᚱᚨ ᚦᚢᚾ', dur: 30, angle: Math.PI,
    img: 'assets/imgs/IMGs_Trasmedia/Lyra.jpeg',
    txt: 'Sobre mi nube giran el fuego, el agua, la roca y el trueno, y ninguno me obedece del todo. Aprendí a dejarlos girar. Si me escuchas hasta el final, quizá los reconozcas también en ti.'
  },
  volt: {
    n: 5, name: 'Volt', epi: 'El de la jaula de energía', glyph: 'ᚡᛟᛚᛏ ᛖᚾᛉ', dur: 30, angle: 4 * Math.PI / 3,
    img: 'assets/imgs/IMGs_Trasmedia/Volt.jpeg',
    txt: 'Me llaman corriente, pero soy un deseo sin salida. Cada barrote es una vez que dije "después". La jaula no me contiene: me recuerda.'
  },
  kael: {
    n: 6, name: 'Kael', epi: 'El de las máscaras que miran', glyph: 'ᚲᚨᛖᛚ ᛗᚨᚲ', dur: 30, angle: 5 * Math.PI / 3,
    img: 'assets/imgs/IMGs_Trasmedia/Kael.jpeg',
    txt: 'Llevo dos rostros porque uno solo nunca bastó. Las máscaras no esconden: miran por mí hacia donde tú estás. Si te asusto, es porque me estás viendo de verdad.'
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
    virena: 'Entre mis sombras se coló un aroma verde y unas esporas que brillaban solas.',
    tala: 'Una bestia rozó mi sombra y dejó pétalos en el suelo.',
    lyra: 'Una nube baja cruzó mi sombra y dejó gotas con sabor a trueno.',
    volt: 'Sentí un chispazo en la oscuridad: alguien con la jaula abierta.',
    kael: 'Dos ojos dorados me miraron desde la oscuridad, sin parpadear.'
  },
  virena: {
    nyxa: 'Una sombra detuvo mis esporas en el aire; solo Nyxa hace callar así.',
    virena: 'Yo no moví nada... pero hay hojas mías en un lugar donde no crezco.',
    tala: 'Algo pesado pisó mi raíz y dejó huellas de bestia sobre las hojas.',
    lyra: 'Cayó una llovizna sobre mis hojas, en una sala que no tiene cielo.',
    volt: 'Una hoja mía amaneció chamuscada, con olor a ozono.',
    kael: 'Mis esporas se apartaron de dos máscaras que pasaron sin hacer ruido.'
  },
  tala: {
    nyxa: 'Entre mis ecos oí susurros que solo nacen de las sombras.',
    virena: 'Mis ecos se aquietaron: algo verde respiraba cerca y las bestias callaron.',
    tala: 'No fui yo... pero mis ecos repiten un paso muy parecido al mío.',
    lyra: 'Oí un trueno pequeño sobre mis ecos, como si una nube pasara sobre la piedra.',
    volt: 'El suelo olía a ozono. Solo hay una jaula que huela así.',
    kael: 'Mis ecos volvieron con otra voz: la de alguien que habla detrás de una máscara.'
  },
  lyra: {
    nyxa: 'Mi nube se oscureció un instante, como si una sombra la hubiera tocado.',
    virena: 'Mi agua olió a hoja recién cortada.',
    tala: 'Mi roca vibró con un paso de bestia sobre el suelo.',
    lyra: 'Yo no solté nada... aunque mi fuego, mi agua, mi roca y mi trueno giran distinto.',
    volt: 'Mi trueno se apagó y otro, más seco, respondió desde una jaula.',
    kael: 'Mis cuatro fuerzas se detuvieron frente a dos máscaras rojas.'
  },
  volt: {
    nyxa: 'Todas las luces se apagaron un instante. Solo Nyxa apaga luces así.',
    virena: 'Mis chispas se posaron sobre una hoja que antes no estaba. Alguien la trajo.',
    tala: 'Escuché pasos de bestia sobre mis barrotes.',
    lyra: 'Un trueno ajeno chocó con mi jaula: había una nube dentro del museo.',
    volt: 'Yo no abrí nada... y sin embargo mis barrotes están tibios.',
    kael: 'Vi dos máscaras rojas reflejadas en mis barrotes, mirando hacia dentro.'
  },
  kael: {
    nyxa: 'Mis máscaras no vieron a nadie; solo una sombra que se dejaba mirar.',
    virena: 'Una espora verde se posó en mi cuerno y no supe de dónde vino.',
    tala: 'Una de mis máscaras giró hacia un eco de bestia que no era suyo.',
    lyra: 'Sentí humedad de nube sobre mis máscaras.',
    volt: 'Mis máscaras se tiñeron de un resplandor eléctrico por un segundo.',
    kael: 'Yo no fui... pero mis máscaras ya miraban hacia la puerta antes que yo.'
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
  ],
  virena: [
    'Virena, en la bitácora: «Mis hojas se quedaron quietas toda la noche; pregúntales».',
    'Virena, en la bitácora: «Dejé una hoja en el umbral; creí que nadie la vería».'
  ],
  lyra: [
    'Lyra, en la bitácora: «Mis cuatro fuerzas giraron en su sitio; ninguna salió de la nube».',
    'Lyra, en la bitácora: «Dejé escapar un trueno por un instante; bastó para abrir la puerta».'
  ],
  kael: [
    'Kael, en la bitácora: «Mis máscaras miraron todo el tiempo hacia afuera; no cruzaron nada».',
    'Kael, en la bitácora: «Una de mis máscaras miró hacia la puerta, y yo la seguí».'
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