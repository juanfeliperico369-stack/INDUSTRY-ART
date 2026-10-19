# INDUSTRY ART (Industria del Arte)

Simulador 2D de gestión y rol de un estudio de arte, de 1850 a 2150 y más. Ideado y creado por OneZero;
programado junto a Lumen. El plan completo está en `docs/` (Plan Maestro en Word, PDF y texto).

## Cómo jugar

Abre **`INDUSTRY_ART_Definitiva.html`** en cualquier navegador (celular o PC). Es un solo archivo y funciona sin internet.
Es la versión 5.0: la Definitiva con todo lo que traía la versión Final (clasificación, personajes y financiación en música,
videojuegos, teatro y libros, y más). Las partidas guardadas de la V16 en adelante se abren en ella (se migran solas).

## Qué hay en este repositorio

| Ruta | Qué es |
|---|---|
| `INDUSTRY_ART_Definitiva.html` | **El juego, versión 5.0 (guardado 40)** |
| `bitacora_definitiva.md` | Qué trae la Definitiva 5.0: medios a la altura del cine, financiación nueva, economía recalibrada y el verificador del juego |
| `legado/INDUSTRY_ART_Final.html` | La versión Final, que sirvió de referencia para completar la Definitiva |
| `docs/INDUSTRY_ART_documento_inicial.docx` | El documento inicial con todo lo imaginado |
| `INDUSTRY_ART_v36.html` | La versión 2.1 (V36, armada desde `src/`) |
| `INDUSTRY_ART_v20.html`, `INDUSTRY_ART_v19.html`, `INDUSTRY_ART_v18.html`, `INDUSTRY_ART_v17.html`, `INDUSTRY_ART_v16.html` | Las versiones anteriores, para comparar |
| `bitacora_v36.md` | La bitácora corta de la V36 · 2.1, inicio por pasos, tu avatar en tus obras y clásicos con sus personajes (las de la V21 a la V35 también están) |
| `app/` | Las apps: Android e iPhone (Capacitor 8: gratis con un anuncio al abrir y la compra «Versión completa» que lo quita) y PC en `app/escritorio/` (Electron, sin anuncios) |
| `.github/workflows/` | Recetas en la nube: el `.aab` para Google Play, la app de iPhone (TestFlight), la app de PC y la versión web |
| `docs/publicar_google_play.md`, `docs/publicar_app_store.md`, `docs/publicar_pc.md` | Guías para publicar en cada tienda |
| `docs/tienda.md`, `docs/tienda/`, `docs/privacidad.html` | Fichas de las tiendas, imágenes y política de privacidad |
| `bitacora_v20.md` | La bitácora de la V20 |
| `bitacora_v19.md` | La bitácora de la V19 |
| `bitacora_v18.md` | La bitácora de la V18 |
| `bitacora_v17.md` | La bitácora de la V17 |
| `bitacora_v16.md` | La bitácora de la V16 |
| `src/` | El código separado por módulos (ver `src/LEEME.md`) |
| `tools/armar.py`, `tools/desarmar.py` | Unen los módulos en el HTML y lo vuelven a separar (solo Python 3, sin npm) |
| `tools/bot.js`, `tools/capturas.js` | Bot de pruebas (3 estrategias, metas de balance, medios y el verificador del juego) y capturas automáticas en un navegador real (usan Playwright) |
| `tools/reglas.js` | Pruebas de reglas (desde la V34 fuera del juego; el bot las carga en la página) |
| `pruebas/` | Informes del bot, capturas en 3 tamaños y los scripts de la auditoría de la V15 y de la revisión de la V16 |
| `docs/` | Plan Maestro v2 (Word), su Especificación y sus Datos, el análisis del plan v2 frente a lo construido (`analisis_plan_v2.md`), el plan v1, la auditoría de la V15 y la revisión de la V16 |
| `legado/` | La V15 original (sigue jugable aparte) y su código desarmado |

## Para programar la siguiente versión

La Definitiva se edita directamente en `INDUSTRY_ART_Definitiva.html` (el código vive bajo `ART`). Dentro del juego,
Ajustes › Verificador del juego recorre pantallas, botones, la creación de cada medio y dos años de simulación;
desde la consola: `ART.verificador.correr()`. `src/` y `tools/armar.py` siguen siendo el código de la V36.

```bash
node tools/bot.js --hasta 2150               # bot: 3 estrategias × 1900 y 2000, medios, verificador y reglas -> pruebas/informe_bot_definitiva.md
python3 tools/armar.py                       # (V36) src/ -> INDUSTRY_ART_v36.html
node tools/capturas.js                       # capturas en 390×844, 844×390 y 1366×768 -> pruebas/capturas/
python3 tools/desarmar.py INDUSTRY_ART_v36.html   # HTML -> src/ (la ida y vuelta es idéntica: el HTML lleva la sangría como tabuladores y los comentarios comprimidos al final, y desarmar los devuelve)
python3 tools/preparar_app.py                # la Definitiva (o el HTML más nuevo) -> app/www y app/escritorio/www (modo y AdMob de app/config.json)
node tools/imagenes_app.js                   # íconos, pantallas de inicio e imágenes de la tienda
```

## Publicar

Paso a paso: [Google Play](docs/publicar_google_play.md) · [App Store](docs/publicar_app_store.md) · [PC](docs/publicar_pc.md). Precio (decidido en la V32): gratis con un anuncio al abrir, y una compra única «Versión completa» que solo quita el anuncio.
