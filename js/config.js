/* CONFIG: URLs de tus audios (.mp3/.wav/.ogg) y entornos (.glb).
    La duración real del audio de cada resonante define cuánto hay que escuchar para liberarlo.
    Sin archivos se usa audio sintetizado (30 s de demostración).
    Se cargan automáticamente al comenzar el juego. */
export const CONFIG = {
  audio: {
    urban: null,
    doors: null,
    nyxa: 'audios/Nyxa.mp3',
    tala: 'audios/Tala.mp3',
    volt: 'audios/Volt entero.mp3',
    bit0: 'audios/Rythden.mp3',
    bit1: 'audios/Rythden2.mp3',
    bit2: 'audios/Dra Selene.mp3',
    core: 'audios/Naxaly.mp3'
  },
  /* Imágenes que sustituyen elementos dibujados con código (se usan tal cual, con su transparencia y proporción) */
  images: { florFucsia: 'assets/imgs/IMGs_Trasmedia/florFucsia.png' },
  models: { city: null, gal: null, core: null, flor: null }
};