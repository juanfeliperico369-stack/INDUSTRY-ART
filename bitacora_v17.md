# Bitácora V17 · Fábrica de ideas
Fecha: 5 de octubre de 2026 · Chat: V17 (Claude Code)

Archivo del juego: `INDUSTRY_ART_v17.html` (597 KB, un solo archivo, funciona sin internet). La V16 queda en el repositorio para comparar, y sus partidas guardadas se abren en la V17.

Fuentes leídas para esta versión: el Plan Maestro (pestaña Taxonomía, Inventario de la V17, Datos del mundo con las obras de dominio público), la V15 original (sus deslizadores y su asistente de creación) y **tu documento inicial** (`INDUSTRY_ART_.docx`), del que salieron los textos originales de las clasificaciones, los deslizadores de identidad, de duración, complejidad, ritmo, efectos y presupuesto, el de tiempo a avanzar, las reglas de personajes y la IA que depende del equipo.

## Qué se hizo

- **Volvieron los deslizadores de personalización** (como en la V15 y en tu documento):
  - Nueva partida: 5 deslizadores de identidad de 20 pasos cada uno (tipo de logo, color del logo, color de fondo, color de letras y tipo de letra), con el logo y la fachada cambiando en vivo.
  - **Editar la identidad del estudio en plena partida** (Negocio › Construcciones, al final): los mismos 5 deslizadores más público objetivo, visión y tipo de industria, como pide tu documento en "Editar descripción".
  - **Seleccionar tiempo a avanzar**: en la flecha junto al botón de avanzar hay un deslizador de 1 a 52 semanas y el botón "Avanzar ya".
  - En la creación de obras: contenido (5 deslizadores), duración (1 a 300 minutos, con corto, normal, extendida y épica), complejidad e inteligencia (Ninguna a Compleja), ritmo (Reflexivo a Entretenido), efectos especiales (Ninguno a Demasiados), presupuesto (de ×0,25 a ×4 de lo típico de la época), época de la historia (del inicio de la humanidad al futuro lejano) y uso de IA en la producción (desde 2022).
- **Taxonomía completa** (módulo nuevo `02_taxonomia.js`): todas tus listas, sin duplicados, por familias y en orden alfabético: 85 subgéneros (38 que también son géneros y 47 propios en 5 familias), 227 temas en 8 familias (incluidos los 10 deportes nuevos), 53 problemáticas y argumentos en 7 familias, 7 arcos y 10 subarcos con su nombre en español y el original, 34 tipos de ficción en 6 familias, 30 corrientes del cine con su año (y las de TV, teatro, música, videojuegos y literatura), 16 estilos artísticos, 13 tonos (se sumaron Deprimente, Melancólico y Luminoso), 5 prioridades, formatos de época (color, imagen y sonido), 14 épocas, lugares, 21 idiomas, 33 públicos objetivo y 23 arquetipos de personajes. También los géneros de televisión, videojuegos, literatura, música y teatro con su propia tabla de encaje.
- **Tres caminos para crear** (Obras › Crear obra):
  - **Idea nueva**, en **modo rápido** (5 decisiones: géneros, historia y tono, producción y contenido, equipo, título y sinopsis; con "Recomendado" y dado) o **modo detallado** (todas las listas y deslizadores en 10 secciones que se abren y cierran). El juego recuerda el modo que prefieres.
  - **Comprar un guion** ya escrito: 4 en venta que se renuevan cada 3 meses, con su calificación, autor, sinopsis y precio. El guion comprado sube (o baja) la calidad según su nota y queda en "Tus guiones" hasta que lo produzcas.
  - **Usar material**: las **82 obras de dominio público** del plan (50 clásicos, 21 subidas de tono y 11 tradiciones del mundo), con buscador y filtros, su ficha real (autor, año, géneros, fama) y su **atractivo por edad y por sexo**. Quedan libres el 1 de enero del año 71 tras la muerte del autor (vida + 70, decidido); antes se compran sus derechos. Las subidas de tono suben la clasificación con guiños; nada es explícito. Si el mundo adapta mucho una obra, el público se cansa.
  - **Idea automática con IA** (desde 2022): un botón arma la historia siguiendo la tendencia, la deja **bloqueada** (géneros, temas, arco, tono, época) y su calidad depende de tu guionista.
- **La clasificación sale del contenido**: violencia, lenguaje, amor, consumo y terror; manda lo más fuerte. Con **tus palabras originales**: G (0-6 años) "lenguaje normal, sin violencia, amor amistoso", PG (7-12) "violencia leve, amor amistoso y romántico", PG-13 (13-15) "lenguaje leve, violencia moderada, amor romántico", 16 "lenguaje rudo, violencia intensa, amor apasionado", NC-17 (17 años, grupo adolescente) "lenguaje crudo, amor candente", 18 "lenguaje ofensivo, violencia gráfica… siempre sugerido", R "lenguaje explícito, violencia sangrienta… siempre sugerido", X "…amor explícito, siempre sugerido" y N "general, para personas ya desarrolladas, moderado y controlado".
  - **Censura de la época**: antes de 1968 lo más fuerte que se estrena es 16; los deslizadores no dejan pasar de ahí.
  - **Regla del Erótico**: solo 18, R o X; nunca antes de 1968; nunca con familia y juventud ni con públicos infantiles, familiares o adolescentes; **todos los personajes mayores de edad**. Y en cualquier obra con personajes menores, el amor no pasa de romántico.
  - Gore, Slasher y Corporal suben la clasificación (con guiños).
- **Personajes** con nombre, edad, sexo, importancia y arquetipo: hasta 10 protagonistas, 15 secundarios, 20 extras, 5 invitados especiales y 5 cameos, como en tu documento ("agregar otro", nombre editable, botón de nombre al azar y botones de importancia). Protagonistas y secundarios pueden tener intérprete contratado (la estrella principal pesa 50 %, la segunda 30 % y el resto 20 %); los invitados cobran el 40 % de su tarifa y los cameos el 15 %, y su fama atrae público. Los secundarios sin estrella y los extras salen del reparto de la casa (suben un poco el costo).
- **Sinopsis generada** con plantillas (época, lugar, protagonista, oficio o arquetipo, problemática, arco y temas), editable. Por ejemplo: "En el siglo XIX, Michael López, un héroe improbable, atraviesa la peor crisis de su vida y sube más alto de lo que puede sostener. Una historia de culpa. Basada en «Madame Bovary», de Gustave Flaubert." Más la frase de la crítica ("Un western sobre venganza.") y la del premio, que aparece en la ceremonia.
- **Encaje con estrellas que se descubre jugando**: además de la tabla de géneros, ahora cuentan los subgéneros, los temas, la época y los subarcos con la familia del género líder. Cada combinación nueva muestra "?" hasta que la usas; después, sus estrellas (de 1 a 5).
- **Cada decisión pesa** (pequeño y claro): el tipo (imagen real, animación desde 1908, híbrido desde 1945, documental desde 1922 e historia jugable desde 2018) cambia costo, semanas, departamentos y edades; la prioridad reparte el peso de los departamentos (V15); la corriente da un bono de novedad de unos 12 años y +1 si es afín; el estilo, el formato (blanco y negro después de 1967 gusta a la crítica y no al público; Tecnicolor brilla hasta 1960; 70 mm y Screen X suman en acción e imaginación), el idioma y el lugar (suman público en su región), la complejidad (crítica sí, público no), el ritmo, el arco, la duración (lo muy largo cansa), el público objetivo, la época (vestuario y sets) y el país de rodaje (abarata o encarece). Los efectos desde "Bastantes" se juegan el **aplauso o el repudio** según el director y el diseñador de arte. La **IA en producción** abarata hasta 40 % y acelera, y sale excelente, bien, dudosa o completamente mal según la excelencia del equipo (no solo resta, como pedía tu documento).
- **Clase A, B o C** y **obra infantil, adulta, seria o general** de cada obra; **estimación de calidad y de retorno** (multiplicador orientativo) antes de empezar, con el desglose de costos (contratos, producción, derechos y marketing).
- **Ficha de obra**: nuevo bloque "La idea" con sinopsis, tipo, temas, arco, época y lugar, idioma, forma, estilo, contenido, público, material, guion, IA, la frase de la crítica y los personajes con su intérprete.
- **Mundo › Taxonomía**: una pestaña para ver todas las listas de los 6 medios, con la tabla de encaje de cada uno.
- **Rivales**: también eligen historias (los de buen ojo, las que encajan), adaptan obras libres de derechos (sale en el periódico) y, desde 2022, algunos usan IA.
- **Bot y pruebas**: el bot crea sus obras con la fábrica de ideas (historia recomendada, personajes, material, guiones comprados, efectos grandes, IA) y hay **32 pruebas de reglas** (clasificación, censura, Erótico, dominio público, inflación, población y listas completas) que corren en el navegador con `node tools/bot.js`.

## Decisiones nuevas

- **La N** pasó a ser la de tu documento: general, apta para todo público pero pensada para personas ya desarrolladas, con contenido moderado y controlado (hasta el nivel de PG-13) y que rinde la mitad. En la V16 era "sin clasificar, circuito de arte". (¿Cambia el Registro? Sí: usa tus palabras.)
- **Rendimiento de cada clasificación**: tu documento da porcentajes (G 60 %, PG 70 %, PG-13 100 %, 16 90 %, NC-17 80 %, 18 50 %, R 40 %, X 30 %, N 50 %); el juego los logra con quién puede entrar y cuánto le gusta a cada edad, así que varían un poco según el género. (No.)
- **Comprar guiones** entra ya en versión básica (el Inventario lo ponía en la V23, pero el plan lo nombra como uno de los tres caminos de la V17). El mercado completo, con agentes y pujas contra los rivales, sigue en la V23. (No.)
- **Personajes y reparto**: solo protagonistas y secundarios tienen intérprete contratado; los extras son del reparto de la casa. Invitados al 40 % y cameos al 15 % de la tarifa. (No; propuesta para tu visto bueno.)
- **Los otros medios** (TV, música, videojuegos, teatro y libros) ya tienen su taxonomía y su tabla de encaje, sacada de la del cine por el "eje" de cada familia; se producen cuando llegue su economía (V24, V30, V31 y V32). (No.)
- **Las décadas de las corrientes** del cine quedaron con un año concreto (por ejemplo, Nouvelle Vague 1959, Dogma 95 1995). (No.)

## Datos y guardado

- Versión del guardado: **17**; migración desde la **16** (agrega los guiones en venta, tus guiones, los usos de cada material y la regla del dominio público). Comprobado: una partida guardada en la V16 se abre en la V17 y sigue sin errores.
- Las obras nuevas guardan su idea completa; las de más de 25 años conservan la sinopsis, los géneros, los temas, el arco, el material y los protagonistas, y sueltan el detalle técnico (para que el guardado no crezca sin fin).
- La misma semilla con las mismas decisiones da la misma partida, también guardando y cargando a mitad de camino (comprobado).

## Bot de pruebas

Corrido en un navegador real (Chromium) con `node tools/bot.js --hasta 2150`: 3 estrategias (prudente, normal, agresiva) × inicio en 1900 y en 2000 × 2 semillas fijas = 12 partidas hasta 2150, ahora creando cada obra con la fábrica de ideas. **Errores del juego: 0. Pruebas de reglas: 32 de 32 pasan.** Informe completo en `pruebas/informe_bot_v17.md`.

Estrategia normal ("estudio bien llevado"), dos semillas por inicio:

| Meta | Objetivo | Desde 1900 | Desde 2000 |
|---|---|---|---|
| Multiplicador mediano | ×1,5 a ×2,5 | ✅ ×2,22 y ×2,21 | ✅ ×2,14 y ×2,12 |
| Obras sobre ×5 | 5 % o menos | ✅ 3,7 % y 3,3 % | ✅ 3,1 % y 3,1 % |
| Obras que pierden | 30 % a 45 % | ✅ 30,3 % y 30,6 % | ✅ 31,5 % y 33,2 % |
| Crecimiento real de la caja | 5 % a 20 % al año | ✅ 16 % y 16,5 % | ✅ 8,6 % y 10,7 % |
| Premios principales del jugador | 30 % o menos | ✅ 3,5 % y 4,2 % | ✅ 3,9 % y 2,6 % |
| Años de independiente a major | 15 a 30 | ✅ 30 · ⚠️ 32 | ⚠️ 10 y 13 |
| Cuota de mercado | menos de 35 % | ✅ 15,6 % y 15,4 % máx. | ✅ 14,7 % y 14 % máx. |

- Los resultados son casi iguales a los de la V16: la fábrica de ideas da muchas palancas nuevas, pero ninguna rompe la economía.
- **Un ajuste importante en el camino**: en la primera prueba, el bot (que siempre usa "Recomendado") ganaba el 93 % de los premios, porque los rivales hacían historias al azar. Ahora los rivales también eligen historias que encajan (más los de mejor ojo y los proyectos de prestigio) y los bonos de encaje, arco, ficción y guion comprado se moderaron: el jugador vuelve a ganar entre 3 y 4 % de los premios.
- **Prudente** cumple todo salvo los años hasta major (55-57 desde 1900; 8-11 desde 2000). **Agresiva** llega a major en 3-6 años, gana 10-17 % de los premios y quebró en 1 de 4 partidas (arranque de 1900, en 1905, igual que en la V16).
- **Qué usó el bot de la fábrica** (estrategia normal desde 1900): unas 5.600 obras, de ellas ~520 adaptaciones de material, ~390 guiones comprados, ~150 con IA y ~15 con efectos grandes (aplaudidos y repudiados casi por mitades). Clasificaciones: la mitad PG-13, luego G, PG, 16, N y 18. Los rivales adaptaron ~50-70 obras de dominio público.

## Rendimiento

Medido en el navegador real; "CPU ×4" simula un celular modesto como el Infinix.

| Medida | Meta | Resultado |
|---|---|---|
| Avanzar una semana (simulación) | menos de 30 ms | 1,2 ms de mediana; la peor semana (cierre de año) 42 ms |
| Avanzar una semana con pantalla, CPU ×4 | menos de 30 ms | Estudio 18 ms · Obras 18 · Mundo 21 · Negocio 21 · Talento 7 |
| Simular un año | menos de 1,5 s | 0,06 s (0,13 s con CPU ×4) |
| Abrir el juego, CPU ×4 | menos de 2 s | 0,56 s |
| Guardado tras 150 años, comprimido | menos de 2 MB | 1,03 MB (el mayor de las 12 partidas; 0,72 MB en la V16, porque ahora cada obra guarda su idea) |
| Guardado al final (2150), comprimido | — | 1,42 MB |
| Memoria | menos de 200 MB | 61 MB |
| Tamaño del archivo | menos de 1,5 MB | 597 KB (429 KB en la V16) |

Pantallas: capturas automáticas de 23 pantallas (6 nuevas: historia del modo rápido, modo detallado, personajes, usar material, comprar guion y taxonomía) en 390×844, 844×390 y 1366×768 (`pruebas/capturas/`), con 0 controles de menos de 44 px, 0 textos de menos de 14 px y sin desplazamiento horizontal.

Prueba de punta a punta en el navegador: nueva partida con los deslizadores, los tres caminos, la idea con IA, el modo rápido completo, el modo detallado con todos los deslizadores y selectores al máximo, personajes con cameo e invitado, la regla del Erótico, la taxonomía, la identidad del estudio, avanzar 20 semanas con el deslizador, la ficha de obra y guardar y cargar: sin errores.

Semana · Año · Guardado · Archivo: 1,2 ms · 0,06 s · 1,03 MB · 597 KB

## Errores conocidos

- **Años de independiente a major** siguen en el borde de la meta, como en la V16 (30 y 32 desde 1900; 10 y 13 desde 2000, un poco rápido). Es la condición de la V28 (negocio e imperio).
- **La estrategia agresiva** quiebra en una de las cuatro partidas, al arrancar en 1900 (igual que en la V16).
- **Rivales rescatados**: varios rivales chicos viven de los rescates de inversionistas (unos 2 por año entre los 8). Sus estrategias, quiebras y fusiones llegan en la V26.
- **Los demás medios** se ven y se eligen solo en la Taxonomía; producir televisión, música, videojuegos, teatro o libros llega con su versión.
- Las sinopsis salen de plantillas: a veces una combinación rara da una frase rara (por ejemplo, un espía en las primeras civilizaciones). Se puede editar a mano.

## Qué probar en el celular

1. Abre `INDUSTRY_ART_v17.html`, toca **Nueva partida** y mueve los **5 deslizadores del logo**: el logo y la fachada cambian en vivo. Elige un año como 1960 y empieza.
2. **Obras › Crear obra › Idea nueva** en **modo rápido**: usa **Recomendado** y el dado en cada paso. En el paso 2 toca "Ver los 227 temas" y busca uno. Mira la **sinopsis** y el **encaje** (sale "?" hasta que lo uses).
3. En el paso 3 toca **Ajustar contenido** y sube la violencia: mira cómo cambia la clasificación (y que antes de 1968 no pasa de 16).
4. Prueba el **modo detallado**: abre "Duración, complejidad…" y mueve los deslizadores; los totales de abajo cambian en vivo. Abre **Personajes**, agrega un cameo y elígele una estrella.
5. **Crear obra › Usar material**: busca "Drácula" o "Romeo", mira su ficha y su atractivo por edad y sexo, y adáptala.
6. **Crear obra › Comprar un guion**: compra uno y prodúcelo.
7. Si juegas después de 2022: **Idea automática con IA** y el deslizador de **uso de IA**.
8. Cuando una obra termine, abre su ficha y mira el bloque **La idea**.
9. En la **flecha junto al botón de avanzar**, mueve el deslizador de semanas y toca **Avanzar ya**.
10. En **Negocio › Construcciones**, al final, cambia la identidad de tu estudio.
11. Abre una partida guardada de la V16 (Cargar) y comprueba que sigue.

## Para la próxima versión (V18 · Talentos 2.0)

- Más de 1.000 talentos con biografía, habilidades por oficio y familia (los ejes Acción, Imaginación, Suspenso, Drama, Humor, Familia, Arte y Romance ya existen en la taxonomía), fama por región, tarifa de mercado, negociación, química, academia y ciclo de vida.
- Que la excelencia, creatividad e inteligencia de cada talento pesen en la fábrica de ideas (hoy se usa su habilidad general).
- Estudiar para ganar experiencia (tu documento: hasta 5 de experiencia en un rubro).
- Mantener las metas del bot y las 32 pruebas de reglas.

## Preguntas para Felipe

1. ¿Te gusta cómo quedó la **N** con tus palabras (general, contenido moderado, rinde la mitad)?
2. Personajes: ¿está bien que solo protagonistas y secundarios tengan intérprete contratado, y que invitados y cameos cobren 40 % y 15 % de su tarifa?
3. ¿Quieres que el **modo rápido** tenga también el deslizador de presupuesto (hoy usa los 5 botones de tamaño) o lo dejamos solo en el detallado?
4. Las sinopsis se generan con plantillas. ¿Quieres ver más variedad (por ejemplo, una segunda frase con el antagonista) en la próxima versión?
