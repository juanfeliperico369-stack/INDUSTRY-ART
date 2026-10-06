# Código fuente de INDUSTRY ART

El juego se entrega como **un solo archivo HTML** (`INDUSTRY_ART_vXX.html`) que funciona sin internet.
Aquí vive el mismo código separado por módulos para que cualquier chat lo lea y lo continúe.

- `python3 tools/armar.py` une `src/` en `INDUSTRY_ART_v19.html`.
- `python3 tools/desarmar.py INDUSTRY_ART_v19.html` vuelve a separar un HTML armado en `src/`.

## Estructura

| Archivo | Qué es |
|---|---|
| `plantilla.html` | Esqueleto del HTML con las marcas `/*@ESTILOS@*/` y `/*@MODULOS@*/` |
| `estilos.css` | Estilos y temas (variables CSS) |
| `recursos/titulos.woff2` | Tipografía de títulos (Bebas Neue, licencia OFL), se incrusta en base64 |
| `modulos/NN_nombre.js` | Un módulo por archivo; el número fija el orden de armado |

## Reglas de los módulos

- JavaScript nivel **ES2017**: sí `let/const`, flechas, plantillas, `async/await`, `Object.entries`, `padStart`.
  **No** usar `?.`, `??`, `...` dentro de objetos literales, `Array.prototype.flat`, `matchAll`, `replaceAll`.
- Cada módulo es una función autoejecutable que cuelga su API de `IA`:

```js
/* ==== módulo: nombre ==== */
IA.nombre = (function () {
  'use strict';
  // ...
  return { /* API pública */ };
})();
```

- `IA` lo declara `00_nucleo.js` (`var IA = {};`); el diccionario de textos es `01_textos.js`.
- **Sin `Math.random()`** en la simulación: todo azar sale de `IA.n.azar` (generador con semilla) para que la misma
  semilla con las mismas decisiones dé la misma partida. El arte usa su propio hash determinista.
- La partida es **un solo objeto de datos** (`IA.n.S`) sin funciones adentro: se guarda, comprime y migra fácil.
- Los textos visibles salen del diccionario `IA.textos` (`IA.t('clave')`).
- Los datos (listas, países, épocas) van en `02_datos.js` y la taxonomía completa de la fábrica de ideas (V17) en
  `02_taxonomia.js`, separados de la lógica. Las reglas de la idea (clasificación, encaje, sinopsis, personajes,
  dominio público, guiones, IA) están en `06_ideas.js`, y su pantalla en `16_creacion.js`.
- Los talentos (V18 · Talentos 2.0: capacidades, afinidades, energía y moral, negociación, salario más porcentaje,
  exclusivos, academia, promesas, relaciones y química, ventajas, ciclo de vida y biografía) viven en
  `05_talentos.js`; su pantalla (buscador avanzado, ficha, contratar, exclusivos, academia) en `16_agencia.js`.
  El elenco de cada obra se negocia en `06_obras.js` (`equipoNegociado`).
- Cómo se hace cada película (V19 · Cine a fondo: departamentos con nota, reparto del presupuesto, método,
  terreno, país, sets reutilizables, estilos de producción, estudios externos, incidentes, dilemas, prueba de público
  y línea de producción) vive en `07_rodaje.js`; `07_produccion.js` lo usa semana a semana.
- Los módulos de simulación (núcleo, mundo, economía, talentos, obras, producción, lanzamiento, rivales, premios,
  negocio) **no tocan el DOM**; solo la interfaz, el arte y el guardado lo hacen.
