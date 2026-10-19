# INDUSTRY ART · Pendientes para continuar

Bitácora de lo que falta, según la revisión de OneZero sobre la última versión (rama `ccr-f266c2f4-a89x3u`).
Regla de siempre: **no quitar, complementar y mejorar**. La versión Final (`INDUSTRY_ART_final.html`) es la referencia de
distribución e interfaz; de esta versión se conservan los diseños por época y los interlineados.

## 1. Retoques rápidos

| # | Pedido | Dónde |
|---|---|---|
| 1 | Portada: quitar el subtítulo «ART INDUSTRY» bajo el título; solo va el nombre del juego | `15_pantallas.js` (portada) y `12_arte.js` (marquesina) |
| 2 | Ajustes: quitar la línea «INDUSTRY ART · Web · Edición completa · sin anuncios» | `15_pantallas.js` (ajustes) y `14_publicacion.js` |
| 3 | Nueva partida: el avatar no debe empezar llamado «OneZero»; poner un nombre al azar | `15_pantallas.js` (nueva partida) y `12_carrera.js` |
| 4 | Ritmo: cambiar «Entretenido» por «Frenético» (y los demás como en la Final: Lento, Pausado, Normal, Ágil, Frenético) | `02_taxonomia.js` › `ritmo` y su inglés |
| 5 | Botones «i»: quitar el texto «Cómo funciona»; dejar solo el símbolo «i» al lado del título | `14_puntos.js` (función que dibuja el botón) |
| 6 | Crear obra: quitar el modo rápido de 5 decisiones; quedan el de 12 y el detallado | `16_creacion.js` (`crModo`, `vistaRapida`) |

## 2. Crear obra (como la Final)

- **Pestañas en lugar de acordeones**: las secciones del modo detallado (Corriente, Época, Público, Duración, Cómo se
  filma, Departamentos, Personajes, Equipo, Título) van como pestañas arriba, igual que «1 · La obra · 2 · Géneros · 3 ·
  Historia», sin menús que se despliegan uno bajo otro. `16_creacion.js` (`vistaDetallada`, `SECCIONES`).
- **Primer paso único**: en el mismo creador se elige el medio y si es idea original o adaptación (material o guion
  comprado); al elegir, se pasa directo a la línea de producción. Hoy hay una pantalla intermedia de «camino».
- **Obras**: quitar el botón «Nueva serie» de arriba; en las pestañas de Obras agregar **Películas** y **Series**, cada
  una con su información (en marcha, estrenadas, temporadas, audiencia, recaudación). `15_pantallas.js` (sección obras).
- Revisar que las barras del final del creador (financiación, «Descargar la idea») no repitan dos «i» seguidos.

## 3. Letrero y logo del estudio

- Panel del letrero, textura, logo y nombre, colores y tipografía: pasar los grupos de botones a **deslizadores**
  (selector deslizable) para ahorrar espacio. `15_pantallas.js` (nueva partida › Tu estudio) y Estudio › Identidad.
- **Agrandar la vista del letrero** y dejarla **fija arriba** mientras se baja a elegir colores y letras.
- **Tipografías**: comparar la lista `FUENTES` de `12_arte.js` con la de la Final (`FCX`/`LETRAS` y lo que use su editor
  de logo) y agregar todas las que falten.

## 4. Distribución y marketing

- **Plan de estreno por ventanas** (como la Final): elegir el recorrido de cada película: cines → video/disco → cable →
  streaming, con las semanas entre cada ventana, o directo a cable o a streaming. `08_ventanas.js`, `16_distribucion.js`.
- El marketing ya permite tipos de campaña y canales; falta conectarlo con cada ventana (campaña de cines y campaña de
  plataforma).

## 5. TV y streaming

- **Canal de cable**: una película hecha antes para cine debe poder programarse en el canal (hoy solo aparecen las obras
  hechas para el canal). `11_tv.js`, `16_tele_ui.js` (pestaña «Tus obras» de la parrilla).
- **Vender o cerrar el canal** para dejar de pagar sus gastos (sobre todo en quiebra). `11_tv.js`.
- **Plataforma de streaming**: quitar el logo fijo «IA», dejar elegir el logo (como el del estudio) y agregar **vender**
  o **disolver** la plataforma. `11_streaming.js`, `16_tele_ui.js`.

## 6. Lo que falta de la Final

- **Rankings**: pestaña en Mundo (obras, estudios, talentos por año y de todos los tiempos) y en Negocio (estudios por
  caja, cuota y premios). Ver `RKS` y las funciones de ranking de la Final.
- **Más negocios**: parques temáticos y los demás tipos de inversión de la Final (buscar en la Final las listas de
  negocios e infraestructura del imperio). `11_imperio.js`, `16_imperio_ui.js`.
- **Editor**: unir lo mejor de los dos. Del de la Final, sus funciones ligadas a las obras, hitos y artistas reales de cada
  año (crear o editar a partir de lo que existe en ese año); del nuevo, lo que ya tiene. `12_metas.js`, `16_metas_ui.js`.
- **Pendientes menores de la Final**: concursos por medio (`CNC`), mascotas del estudio (`MASC`), tipos de banda sonora
  (`BSO`) y canales de tráiler por tamaño de cine.

## 7. Interfaz general

- Distribución más minimalista e intuitiva, copiando la de la Final: menos botones que se despliegan, cada sección con sus
  pestañas y todo a la vista. Conservar los temas por época y los interlineados nuevos.
- Revisar pantalla por pantalla a 390 px de ancho (teléfono).

## 8. Economía, matemáticas y lógica

- Revisar el balance con la prueba rápida de 600 años (`ART.pruebas.jugar({ desde: 1700, hasta: 2300 })`): hoy pierde
  dinero el 37–39 % de las obras, crece cerca del 5 % al año y la cuota máxima ronda el 14 %.
- Comprobar la lógica de lo nuevo: ventanas de estreno, venta de canal y plataforma, parques temáticos.

## Cómo seguir

1. Abrir una sesión nueva con este repositorio y pedir: «Lee `docs/pendientes_para_continuar.md` y hazlo por partes».
2. Hacer cada bloque, armar con `python3 tools/armar.py` y probar con una partida rápida de 600 años.
3. Los paquetes se arman con las recetas de GitHub Actions (ver `docs/ediciones_y_tiendas.md`).
