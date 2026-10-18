# Código fuente de INDUSTRY ART

El juego se entrega como **un solo archivo HTML** (`INDUSTRY_ART_Definitiva.html`) que funciona sin internet.
Aquí vive el mismo código separado por módulos para leerlo y continuarlo por partes.

- `python3 tools/armar.py` une `src/` en `INDUSTRY_ART_Definitiva.html`.
- `python3 tools/desarmar.py INDUSTRY_ART_Definitiva.html` vuelve a separar un HTML armado en `src/`.
- `python3 tools/ingles.py` comprime `tools/ingles/diccionario.json` en `modulos/01_ingles.js` (antes de armar).

## Estructura

| Archivo | Qué es |
|---|---|
| `plantilla.html` | Esqueleto del HTML con las marcas `/*@ESTILOS@*/` y `/*@MODULOS@*/` |
| `estilos.css` | Estilos, temas por época y color por sección (variables CSS) |
| `recursos/titulos.woff2` | Tipografía de títulos (Bebas Neue, licencia OFL), se incrusta en base64 |
| `modulos/NN_nombre.js` | Un módulo por archivo; el número fija el orden de armado |

## Reglas de los módulos

- JavaScript nivel **ES2017**: sí `let/const`, flechas, plantillas, `async/await`, `Object.entries`, `padStart`.
  **No** usar `?.`, `??`, `...` dentro de objetos literales, `Array.prototype.flat`, `matchAll`, `replaceAll`.
- Cada módulo es una función autoejecutable que cuelga su API de `ART`:

```js
/* ==== módulo: nombre ==== */
ART.nombre = (function () {
  'use strict';
  // ...
  return { /* API pública */ };
})();
```

- `ART` lo declara `00_nucleo.js` (`var ART = {};`, con la versión y la versión del guardado); el diccionario de
  textos es `01_textos.js` y el inglés comprimido, `01_ingles.js`.
- **Sin `Math.random()`** en la simulación: todo azar sale de `ART.n.azar` (generador con semilla) para que la misma
  semilla con las mismas decisiones dé la misma partida. El arte usa su propio hash determinista.
- La partida es **un solo objeto de datos** (`ART.n.S`) sin funciones adentro: se guarda, comprime y migra fácil.
  Cada cambio de forma lleva su migración en `13_guardado.js` (`MIGRACIONES[n]`).
- Los módulos de simulación **no tocan el DOM**; solo la interfaz (`14_*`, `15_*`, `16_*`), el arte y el guardado lo hacen.
- Los textos de la interfaz se escriben en español; el inglés sale del diccionario (frases enteras o plantillas con
  `{o}`, `{t}`, `{p}`, `{f}`, `{n}`). Lo que no se debe traducir lleva `data-fijo`.

## Mapa de módulos

| Módulos | Qué hacen |
|---|---|
| `00_nucleo` | Azar con semilla, fechas, eventos internos, utilidades (`cuenta`, `lista`, `esc`) |
| `02_datos`, `02_taxonomia`, `02_titulos` | Países, oficios, épocas; la fábrica de ideas; títulos con concordancia en español e inglés |
| `03_calendario`, `03_mundo`, `03_historia` | Calendario real, población y mercados por región, hitos, crisis y épocas |
| `03_hitos_arte`, `03_curiosidades` | Obras y personas que marcaron cada arte; lo que todos saben y lo que pocos saben |
| `04_economia` | Taquilla, conocimiento y deseo del público, tarifas de talentos, inflación |
| `05_talentos` | Capacidades, negociación, exclusivos, academia, relaciones, familias, revelaciones, retiro y biografía |
| `06_ideas`, `06_obras` | Reglas de la idea (clasificación, sinopsis, personajes, dominio público) y cada obra con su equipo |
| `07_rodaje`, `07_produccion` | Cómo se filma: departamentos, método, sets, dilemas, prueba de público |
| `08_estreno`, `08_lanzamiento`, `08_ventanas` | Plan de estreno por región, cadenas de cines, video, TV, streaming, reestrenos |
| `09_rivales` | Estudios rivales: estrategias, estudios que nacen (algunos fundados por estrellas), fusiones y quiebras |
| `10_critica`, `10_premios`, `10_prensa` | Crítica, premios y festivales, prensa y promesas |
| `11_*` | Banco y socio, franquicias, imperio, música, teatro, libros y videojuegos, negocio, sede, streaming, TV |
| `12_*` | Arte de pósters y letreros, carrera del avatar, eventos con decisiones, el bucle del juego, metas y editor |
| `13_guardado` | Guardado comprimido, ranuras, exportar e importar, migraciones |
| `14_*` | Documento de la idea (Word, web, Markdown, texto), idioma, interfaz, publicación, puntos «i» |
| `15_pantallas`, `16_*` | Pantallas: portada, estudio, crear obra, agencia, calendario, distribución, imperio, medios, editores, taller |
| `17_pruebas` | El bot (3 estrategias, modo austero) y las métricas de balance |
| `99_arranque` | Arranque de la página |
