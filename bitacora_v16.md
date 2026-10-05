# Bitácora V16 · Base nueva
Fecha: 5 de octubre de 2026 · Chat: V16 (Claude Code, con subagentes de auditoría, arte y revisión)

Archivo del juego: `INDUSTRY_ART_v16.html` (429 KB, un solo archivo, funciona sin internet).

## Qué se hizo

- **Código por módulos**: el juego se reescribió en 19 módulos legibles (`src/modulos/`), aprovechando lo bueno de la V15. `tools/armar.py` los une en el HTML y `tools/desarmar.py` lo vuelve a separar; la ida y vuelta da el mismo archivo, byte por byte. Solo Python, sin npm.
- **Semilla y reloj**: todo el azar sale de un generador con semilla. La misma semilla con las mismas decisiones da exactamente la misma partida, aunque guardes y cargues a mitad de camino (comprobado). El año tiene 52 semanas y los meses salen del día real de cada semana (febrero ya no tiene 3 semanas). El ritmo lo eliges tú: +1 semana, +1 mes, hasta el próximo evento o automático.
- **Mundo real**: población por región (6 regiones) y por edad (5 grupos) de 1850 a 2150: 1.262 M en 1850, 1.650 M en 1900, 2.500 M en 1950, 8.160 M en 2024, pico de unos 10.300 M hacia 2084 y 9.600 M en 2150, con escenarios alto, medio (por defecto) y bajo después de 2100. Inflación con el IPC real (25 en 1850, 72,3 en 1950, 967,5 en 2025) y simulada después (~2,5 % con crisis). Toca la caja para ver todo **en dólares de hoy**.
- **La nueva economía del cine** (corrige el fallo n.º 1 de la V15, el dinero infinito): el dinero sale de **personas**. Público = Población × Acceso al cine × Frecuencia de cada región y época; cada semana ese público se reparte entre tus obras, las de los rivales, las de "otras productoras" y quedarse en casa (cuota semanal). El boca a boca premia a la obra que sorprende y hunde a la que promete de más. El estudio cobra su parte de la taquilla (más alta las primeras semanas). Las tarifas de los talentos salen del mercado (habilidad, fama, demanda y época), nunca del presupuesto de tu obra. Frenos: competencia real, rendimientos decrecientes del presupuesto y del marketing, gastos fijos que crecen con el tamaño, impuesto del 25 % **sobre utilidades** (no sobre la caja) y antimonopolio al 35 %.
- **Bucle básico completo**: crear (modo rápido de 5 pasos con "Recomendado" y dado), contratar, producir (desarrollo, preproducción, rodaje, posproducción), elegir semana de estreno y marketing, semanas en cartelera y cobrar. Cada obra deja su informe "por qué funcionó o fracasó" (versión básica).
- **Las 8 familias del cine** del plan, con sus 40 géneros, ya pesan en la matemática: público núcleo, temporada favorable, costo, clasificación usual, reparto ideal de departamentos y la tabla de encaje (que se descubre usándola). Regla del género Erótico aplicada (solo 18, R o X; nunca con Familia y juventud).
- **Rivales simples con obras de verdad**: los 8 estudios de la V15 contratan talentos del mismo mundo, eligen fechas mirando la temporada y la competencia, estrenan en la misma cartelera, hacen obras de prestigio y ganan o pierden dinero como tú.
- **Premios Quimera básicos** (cada año, semana 10): 5 categorías con nominados reales de todos los estudios y un jurado con gustos que cambian; la versión completa llega en la V22.
- **Interfaz de 5 secciones** (Estudio, Obras, Talento, Mundo, Negocio) y barra superior (fecha, caja, avanzar con ritmo, guardar, ajustes). En el inicio, el **estudio dibujado**: un edificio en corte que crece piso a piso, con terrenos a los lados y una fachada que cambia con la época. Ficha deslizable en celular y panel lateral en PC. Vertical, horizontal y PC con menú lateral y dos columnas. Ayuda "i" en cada pantalla. Íconos propios en lugar de emojis.
- **Identidad y temas**: tipografía de títulos Bebas Neue (licencia libre OFL) incrustada; temas Oscuro (la paleta de la V15), Claro, Época (sepia, neón o vidrio según el año) y Alto contraste; tamaño de texto, menos animación, sonido y vibración.
- **Arte de la V15 portado**: pósters por época y género (ahora con la clasificación en la esquina), retratos con edades, ropa de cada época y accesorios por oficio (siempre iguales para el mismo talento), logos, gráficas y sonidos.
- **Guardado nuevo**: IndexedDB con respaldo en el almacenamiento simple, compresión gzip del navegador (o un compresor propio cuando no existe), 5 ranuras, 3 autoguardados rotativos (cada mes, cada año o apagado), archivo **.iasave** para pasar la partida del celular al PC, versión, suma de verificación y migraciones. Cada guardado se relee para confirmarlo: nunca dice "guardado" si no quedó.
- **Bot de pruebas**: tres estrategias (prudente, normal, agresiva) desde 1900 y desde 2000 hasta 2150, en Node y en un navegador real (`tools/bot.js`), más capturas automáticas (`tools/capturas.js`). También se puede correr desde el juego: Ajustes → Laboratorio.
- **Auditoría de la V15** (`docs/auditoria_v15.md`, hecha por un subagente): 26 errores nuevos además de los 35 del plan, todos con evidencia. Los más graves (segunda explosión de dinero por colaboraciones, guardados que fallaban en silencio, precios mal leídos, código que se ejecutaba desde el nombre del jugador) quedan evitados en la V16 por diseño.
- **Revisión independiente de la V16** (`docs/revision_v16.md`, hecha por otro subagente que no escribió el código): encontró 20 errores (3 graves, 7 medios y 10 menores), todos reproducidos; 19 quedaron corregidos y verificados, y el que queda (el compresor propio es lento en navegadores muy viejos) quedó mitigado. Los graves: el evento de premios llegaba una semana antes (y el modo automático fallaba el primer año), las "otras productoras" no descontaban los estrenos simulados, y el género Erótico aparecía antes de 1968 sin clasificación.
- **Pruebas extra**: 1.400 toques al azar en la interfaz sin errores; un nombre de estudio con código HTML no se ejecuta; guardado sin IndexedDB y sin compresión nativa funcionando; un .iasave alterado se rechaza; la misma semilla da la misma partida aunque se guarde y cargue a mitad de camino.
- **También del Inventario para la V16**: tres especialidades del jugador (+1 en esos departamentos), tipo de industria (cine activo; los demás medios muestran su versión), tipo de estudio, visión y público objetivo con efectos pequeños, editor de identidad (forma, color, fondo, letras y tipografía del logo) con vista previa de la fachada, año de inicio libre, mapa del mundo con 32 países, acceso por medio (radio, TV, internet, consolas), calendario de escritorio en el inicio, radar de departamentos en cada obra y tu avatar en los créditos ("Producción ejecutiva") y las noticias.

## Decisiones nuevas

- La V16 empieza desde **1895** (nace el cine); empezar en 1850 vuelve con teatro y libros en la V32. (¿Cambia el Registro? No: se pospone, no se elimina.)
- **Major** = estar entre los 3 estudios más taquilleros del mundo, con 6 % o más del mercado, tres años seguidos. (Sí: define la meta "de independiente a major".)
- El **capital recomendado** es el menor de tu lista que alcanza para unas 2,6 películas típicas de la época; se agregaron valores intermedios dentro del rango de tu documento ($500 a $1 B). (No.)
- **Quiebra** tras 26 semanas en rojo (la V15 usaba 12), mientras llegan el rescate y el socio en la V28. (No.)
- Las descripciones de las clasificaciones son provisionales porque el plan no traía tus palabras originales; las de 18, R y X ya dicen "siempre sugerido". (No; ver Preguntas.)
- El crecimiento real de la caja se mide entre el año 10 y el año 40 de la partida: el primer decenio parte casi de cero y siempre da tasas enormes (ver Bot). (No.)

## Datos y guardado

- Versión del guardado: 16; migración desde: ninguna (las partidas de la V15 no se migran, decidido).
- Formato: un objeto de datos comprimido con gzip en IndexedDB; archivo .iasave = JSON con los datos en base64, versión y suma de verificación.

## Bot de pruebas

Corrido en un navegador real (Chromium) con `node tools/bot.js --hasta 2150`: 3 estrategias (prudente, normal, agresiva) × inicio en 1900 y en 2000 × 2 semillas fijas = 12 partidas hasta 2150. **Errores del juego: 0.** Informe completo en `pruebas/informe_bot_v16.md`.

Estrategia normal ("estudio bien llevado"), dos semillas por inicio:

| Meta | Objetivo | Desde 1900 | Desde 2000 |
|---|---|---|---|
| Multiplicador mediano | ×1,5 a ×2,5 | ✅ ×2,10 y ×2,10 | ✅ ×2,07 y ×2,05 |
| Obras sobre ×5 | 5 % o menos | ✅ 2,2 % y 2,0 % | ✅ 1,4 % y 1,6 % |
| Obras que pierden | 30 % a 45 % | ✅ 32,7 % y 33,3 % | ✅ 33,6 % y 35,5 % |
| Crecimiento real de la caja | 5 % a 20 % al año | ✅ 15,1 % y 15,9 % | ✅ 8,4 % y 9,0 % |
| Premios principales del jugador | 30 % o menos | ✅ 6,2 % y 2,8 % | ✅ 2,8 % y 1,6 % |
| Años de independiente a major | 15 a 30 | ✅ 30 · ⚠️ 31 | ⚠️ 12 y 13 |
| Cuota de mercado | menos de 35 % | ✅ 14,7 % y 14,3 % máx. | ✅ 12,5 % y 11,8 % máx. |

- **Prudente** cumple todo salvo los años hasta major (59-60 desde 1900; 11-15 desde 2000).
- **Agresiva** cumple multiplicador, cuota y premios (13-18 %), pero llega a major en 3-7 años y quebró en 1 de las 4 partidas (arranque de 1900, en 1906).
- Cómo se mide: las métricas de obras incluyen todas las películas del mundo (tuyas y de los rivales) y se registran al terminar cada obra (así la compactación del historial no las sesga). El crecimiento real se mide entre el año 10 y el 40 de la partida, en dólares de hoy: el primer decenio parte casi de cero (desde 1900 coincide con el auge del cine, que multiplica el mercado ~100 veces) y siempre da tasas enormes.
- Comparación con la V15: allí el bot pasó de $1 M a $857 M en 8 años y ganó casi todos los premios. En la V16, el bot normal que empieza en 1900 tiene en 1910 un 2-5 % del mercado mundial; después crece entre 14 y 16 % real al año, y gana entre 3 y 6 % de los premios.

## Rendimiento

Medido en el navegador real; "CPU ×4" simula un celular modesto como el Infinix.

| Medida | Meta | Resultado |
|---|---|---|
| Avanzar una semana (simulación) | menos de 30 ms | 1,1 ms de mediana; la peor semana (cierre de año) 57 ms |
| Avanzar una semana con pantalla, CPU ×4 | menos de 30 ms | Estudio 17 ms · Obras 33 · Mundo 20 · Negocio 26 · Talento 7 |
| Simular un año | menos de 1,5 s | 0,06 s (0,15 s con CPU ×4) |
| Abrir el juego, CPU ×4 | menos de 2 s | 0,51 s |
| Guardado tras 150 años, comprimido | menos de 2 MB | 0,72 MB (el mayor de las 12 partidas) |
| Memoria | menos de 200 MB | 78 MB |
| Tamaño del archivo | menos de 1,5 MB | 429 KB |

Pantallas: capturas automáticas de 17 pantallas en 390×844, 844×390 y 1366×768 (`pruebas/capturas/`), con 0 controles de menos de 44 px, 0 textos de menos de 14 px y sin desplazamiento horizontal. En horizontal quedan 338 px útiles de alto.

Semana · Año · Guardado · Archivo: 1,1 ms · 0,06 s · 0,72 MB · 429 KB

## Errores conocidos

- **Años hasta volverse major**: con la estrategia normal salen 30-31 años desde 1900 (en el borde de 15-30) y 12-13 desde 2000 (un poco rápido). Varía mucho con la semilla. Es la condición de la V28 (negocio e imperio), que trae las palancas que faltan (filiales, compras, sedes).
- **La estrategia agresiva** (mucho presupuesto, estrellas y marketing alto) llega a major en 3-7 años y en 1 de 4 partidas quiebra al arrancar en 1900. Es un riesgo real de jugar así, pero conviene revisar su balance en la V26 (rivales con estrategia) y la V28.
- **Rivales rescatados**: cuando un rival queda en rojo recibe dinero de inversionistas (se ve en el periódico). Las quiebras, compras y fusiones de rivales llegan en la V26.
- **Navegadores muy viejos** (sin compresión nativa): el autoguardado usa el compresor propio, que en partidas de más de 150 años puede congelar la pantalla unos segundos; por eso ahí se autoguarda cada año y no cada mes.
- **El enlace publicado** sirve para jugar y guardar en ese navegador, pero no puede descargar el archivo .iasave (el visor lo bloquea). Para exportar, abre el archivo `INDUSTRY_ART_v16.html` directamente.
- **La misma semilla** da exactamente la misma partida en el mismo navegador; entre motores distintos (por ejemplo un celular y un PC con otro navegador) los decimales pueden variar y la historia puede separarse con los años.
- Las descripciones de las clasificaciones (G a X y N) son provisionales: el plan no traía tus palabras originales.

## Qué probar en el celular

1. Abre `INDUSTRY_ART_v16.html`, toca **Nueva partida**, deja todo como viene (1900) y toca **Empezar**.
2. En **Obras → Crear obra**, usa **Recomendado** en cada paso y toca **Iniciar producción**.
3. Avanza con el botón turquesa. Prueba la flecha de al lado: +1 mes, "hasta el próximo evento" y "Automático".
4. Cuando la obra esté lista, elige la semana marcada como **mejor** y un marketing **Medio**. Mira la taquilla en **Obras → En cartelera** y el informe al terminar.
5. Toca la **caja** arriba: cambia entre dinero de la época y dólares de hoy.
6. Gira el celular: en horizontal el menú pasa al costado.
7. En **Negocio → Construcciones**, construye un plató cuando te sobre caja.
8. **Guardar** (ícono de disquete) en la ranura 1, cierra el navegador, vuelve a abrir y toca **Continuar**.
9. En **Ajustes**: prueba los temas, el tamaño de texto y **Exportar .iasave** (y luego Importar en el PC).
10. Si algo falla: anota qué hiciste, qué esperabas, qué pasó y haz una captura.

## Para la próxima versión (V17 · Fábrica de ideas)

- Taxonomía completa por familias (subgéneros, temas, problemáticas, arcos, corrientes), modo detallado, sinopsis con plantillas, clasificación desde el contenido, personajes, dominio público (vida + 70) e idea automática con IA desde 2022.
- Reemplazar las descripciones provisionales de las clasificaciones por las de tu documento.
- Mantener las metas del bot: `node tools/bot.js --hasta 2150` antes de entregar.

## Preguntas para Felipe

1. ¿Te gusta la tipografía de títulos (Bebas Neue, la de las letras altas de los pósters)? Si prefieres otra libre, se cambia en un minuto.
2. ¿Te parece bien que "major" signifique estar entre los 3 estudios más taquilleros del mundo, con 6 % o más del mercado, tres años seguidos?
3. ¿Me pasas el texto original de tus clasificaciones (G, PG, PG-13, 16, NC-17, 18, R, X y N) para ponerlo tal cual en la V17?
4. En la V16 se empieza desde 1895, cuando nace el cine; 1850 vuelve cuando lleguen teatro y libros (V32). ¿De acuerdo?
5. Mientras llegan el rescate y el socio (V28), la quiebra llega tras 26 semanas seguidas en rojo. ¿Te parece bien ese margen?
