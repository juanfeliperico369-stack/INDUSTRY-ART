# INDUSTRY ART (Industria del Arte)

Videojuego 2D de gestión y rol por texto: diriges un estudio de arte (teatro, libros, música, cine, televisión,
videojuegos y streaming) desde 1700 hasta 2300. Ideado y creado por OneZero; programado por Faro.

## Cómo jugar

Abre **`INDUSTRY_ART_Definitiva.html`** en cualquier navegador (celular o PC). Es un solo archivo y funciona sin
internet. Las partidas de todas las versiones anteriores (desde la V16) se abren y se migran solas.

## Qué trae la Definitiva (4.0)

- **Mundo vivo**: estudios que nacen, crecen, se fusionan y quiebran en todas las épocas (algunos fundados por
  estrellas con su apellido en la puerta), hijos de famosos que debutan, la revelación de cada año, centenarios,
  184 eventos con decisiones y más de 400 hitos históricos reales.
- **Taller creativo** (desde la portada): crea historias con toda la fábrica de ideas sin jugar una partida, guárdalas
  en tu biblioteca y descárgalas en Word, web, Markdown o texto, con logline y predicción del mercado.
- **Editores**: material propio, con licencia u obras famosas de los hitos del arte; talentos nuevos o personajes
  históricos; edición de lo creado.
- **Archivo de curiosidades**: lo que todos saben y lo que pocos saben de cada arte.
- Interfaz de videojuego con colores por sección y por época, español e inglés completos.

## Qué hay en este repositorio

| Ruta | Qué es |
|---|---|
| `INDUSTRY_ART_Definitiva.html` | El juego, versión 4.0 (armado desde `src/`) |
| `INDUSTRY_ART_v16.html` a `INDUSTRY_ART_v36.html` | Las versiones anteriores, para comparar |
| `bitacora_Definitiva.md` | La bitácora corta de la Definitiva (las de la V16 a la V36 también están) |
| `app/` | Las apps: Android e iPhone (Capacitor: gratis con un anuncio al abrir y la compra «Versión completa» que lo quita) y PC en `app/escritorio/` (Electron, sin anuncios) |
| `.github/workflows/` | Recetas en la nube: el `.aab` para Google Play, la app de iPhone, la app de PC y la versión web |
| `docs/publicar_google_play.md`, `docs/publicar_app_store.md`, `docs/publicar_pc.md` | Guías para publicar en cada tienda |
| `docs/tienda.md`, `docs/tienda/`, `docs/privacidad.html` | Fichas de las tiendas, imágenes y política de privacidad |
| `src/` | El código separado por módulos (ver `src/LEEME.md`) |
| `tools/armar.py`, `tools/desarmar.py` | Unen los módulos en el HTML y lo vuelven a separar (solo Python 3) |
| `tools/ingles.py`, `tools/ingles/diccionario.json` | El diccionario inglés (español → inglés) y su compresión al módulo `01_ingles.js` |
| `tools/bot.js`, `tools/capturas.js` | Bot de pruebas y capturas automáticas en un navegador real (usan Playwright) |
| `tools/reglas.js` | Pruebas de reglas (el bot las carga en la página) |
| `pruebas/` | Informes del bot y capturas |
| `docs/` | Plan Maestro, especificación, datos, auditorías y revisiones |
| `legado/` | La V15 original (sigue jugable aparte) y su código desarmado |

## Para programar

```bash
python3 tools/armar.py                       # src/ -> INDUSTRY_ART_Definitiva.html
python3 tools/ingles.py                      # diccionario inglés -> src/modulos/01_ingles.js (antes de armar)
node tools/bot.js --hasta 2150               # bot: 3 estrategias × 1700, 1900 y 2000 + pruebas de reglas
node tools/capturas.js                       # capturas en 390×844, 844×390 y 1366×768 -> pruebas/capturas/
python3 tools/desarmar.py INDUSTRY_ART_Definitiva.html   # HTML -> src/ (ida y vuelta idéntica)
python3 tools/preparar_app.py                # HTML -> app/www y app/escritorio/www
node tools/imagenes_app.js                   # íconos, pantallas de inicio e imágenes de la tienda
```

## Publicar

Paso a paso: [Google Play](docs/publicar_google_play.md) · [App Store](docs/publicar_app_store.md) · [PC](docs/publicar_pc.md).
Precio: gratis con un anuncio al abrir, y una compra única «Versión completa» que solo quita el anuncio.
