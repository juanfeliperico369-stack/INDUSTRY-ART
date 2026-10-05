# Bitácora V16 · Base nueva
Fecha: 5 de octubre de 2026 · Chat: V16 (Claude Code, con subagentes de auditoría, arte y revisión)

Archivo del juego: `INDUSTRY_ART_v16.html` (407 KB, un solo archivo, funciona sin internet).

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
- **Auditoría de la V15** (`docs/auditoria_v15.md`): 26 errores nuevos además de los 35 del plan, todos con evidencia. Los más graves (segunda explosión de dinero por colaboraciones, guardados que fallaban en silencio, precios mal leídos, código que se ejecutaba desde el nombre del jugador) quedan evitados en la V16 por diseño.

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

PENDIENTE_TABLA_BOT

## Rendimiento

PENDIENTE_RENDIMIENTO

## Errores conocidos

PENDIENTE_ERRORES

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

PENDIENTE_PREGUNTAS
