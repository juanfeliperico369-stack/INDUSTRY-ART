# INDUSTRY ART (Industria del Arte)

Simulador 2D de gestión y rol de un estudio de arte, de 1700 a 2300. Ideado y creado por OneZero. El plan completo está en `docs/` (Plan Maestro en Word, PDF y texto).

## Cómo jugar

Abre **`INDUSTRY_ART.html`** en cualquier navegador (celular o PC). Es un solo archivo y funciona sin internet.
Las partidas guardadas de la V16, la V17, la V18, la V19, la V20, la V21, la V22, la V23, la V24, la V25, la V26, la V27, la V28, la V29, la V30, la V31, la V32, la V33, la V34 y la V35 se abren en la versión final (se migran solas).

## Qué hay en este repositorio

| Ruta | Qué es |
|---|---|
| `INDUSTRY_ART.html` | **El juego final, versión 5.0** (guardado V40): giro argumental, needle drops, géneros de fiestas (Halloween, Navidad, Pascua, Festival) y las correcciones de `docs/auditoria_v37.md` |
| `INDUSTRY_ART_v36.html` | La versión 2.1 (V36, armada desde `src/`; `src/` sigue en la V36) |
| `INDUSTRY_ART_v20.html`, `INDUSTRY_ART_v19.html`, `INDUSTRY_ART_v18.html`, `INDUSTRY_ART_v17.html`, `INDUSTRY_ART_v16.html` | Las versiones anteriores, para comparar |
| `bitacora_v36.md` | La bitácora corta de la V36 · 2.1, inicio por pasos, tu avatar en tus obras y clásicos con sus personajes (las de la V21 a la V35 también están) |
| `app/` | Las apps: Android e iPhone (Capacitor 8: gratis con un anuncio por sesión en la primera pausa y la compra «Versión completa» que lo quita) y PC en `app/escritorio/` (Electron, sin anuncios) |
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
| `tools/bot.js`, `tools/capturas.js` | Bot de pruebas y capturas automáticas en un navegador real (usan Playwright) |
| `tools/reglas.js` | Pruebas de reglas (desde la V34 fuera del juego; el bot las carga en la página) |
| `pruebas/` | Informes del bot, capturas en 3 tamaños y los scripts de la auditoría de la V15 y de la revisión de la V16 |
| `docs/` | Plan Maestro v2 (Word), su Especificación y sus Datos, el análisis del plan v2 frente a lo construido (`analisis_plan_v2.md`), el plan v1, la auditoría de la V15 y la revisión de la V16 |
| `legado/` | La V15 original (sigue jugable aparte) y su código desarmado |

## Para programar la siguiente versión

```bash
python3 tools/armar.py                       # src/ -> INDUSTRY_ART_v36.html
node tools/bot.js --hasta 2150               # bot: 3 estrategias × 1900 y 2000 + pruebas de reglas -> pruebas/informe_bot_v36.md
node tools/capturas.js                       # capturas en 390×844, 844×390 y 1366×768 -> pruebas/capturas/
python3 tools/desarmar.py INDUSTRY_ART_v36.html   # HTML -> src/ (la ida y vuelta es idéntica: el HTML lleva la sangría como tabuladores y los comentarios comprimidos al final, y desarmar los devuelve)
python3 tools/preparar_app.py                # HTML más nuevo -> app/www y app/escritorio/www (modo y AdMob de app/config.json)
node tools/imagenes_app.js                   # íconos, pantallas de inicio e imágenes de la tienda
```

## Publicar

Paso a paso: [Google Play](docs/publicar_google_play.md) · [App Store](docs/publicar_app_store.md) · [PC](docs/publicar_pc.md). Precio (decidido en la V32): gratis con un anuncio por sesión en la primera pausa, y una compra única «Versión completa» que solo quita el anuncio.
