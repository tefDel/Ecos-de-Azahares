# Ecos de Azahares

Abrir con un servidor local (los audios y modelos externos no cargan desde file://):

    cd ecos-de-azahares
    python3 -m http.server 8000

Luego visita http://localhost:8000

- index.html: estructura
- css/style.css: estilos
- js/app.js: modulos (CONFIG, MYST, CLUES, FRAG, ENDS, Aud, FX, W, Flow)
- assets/audio y assets/modelos: tus archivos; enlazalos en CONFIG

## Abrir sin servidor
Con doble clic en index.html la página usa `js/bundle.js`; con servidor usa los módulos de `js/`.
Si editas los módulos y quieres que el doble clic lo refleje, regenera el bundle:

    npx esbuild js/main.js --bundle --format=iife --outfile=js/bundle.js
