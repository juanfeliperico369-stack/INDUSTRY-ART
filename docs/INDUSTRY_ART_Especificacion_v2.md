# INDUSTRY ART · Especificación v2

Para los chats de programación. Sale del Plan Maestro v2 del 10 de octubre de 2026. Lee la parte 1 y la sección de tu versión en la parte 5; consulta las partes 2 a 4 cuando las necesites (la V16 las lee completas). Los datos (listas, población, IPC, calendario anual, premios, cronología) están en INDUSTRY_ART_Datos_v2.md.

Partes: 1. Reglas · 2. Registro de decisiones · 3. Técnica, matemática e interfaz · 4. Calendario completo · 5. Versiones V16 a V27 · 6. Bitácora corta.

## 1. Reglas para todos los chats

### Modo rápido (V16 a V23)

- Empieza a programar en tu primera respuesta. No presentes planes ni pidas permiso.
- Construye TODAS las funciones de tu versión, completas y conectadas al juego. Nada de «Próximamente»: lo que no existe no se muestra.
- No pulas: sin ajuste fino de balance, sin capturas, sin animaciones extra. Lo que no bloquea va a «Errores conocidos» de la bitácora; se corrige en la V24 a la V26.
- Trabaja en archivos (src/ y tools/armar.py). No pegues código en el chat. Lee con búsquedas, no archivos enteros.
- Pregunta solo si algo es imposible; si dudas, decide con esta Especificación y anótalo en la bitácora.
- No cambies ninguna decisión del Registro sin preguntarle a OneZero; si algo no funciona en la práctica, propónlo en dos líneas en la bitácora y sigue.
- Entrega: INDUSTRY_ART_vXX.html, bitacora_vXX.md (40 líneas o menos, plantilla en la parte 6) y 5 líneas en el chat: qué hiciste, qué probar y qué quedó pendiente.
- OneZero no programa: háblale en español simple y corto.

### Prueba de humo (cierre de cada versión de la Fase 1)

- El juego abre sin errores en la consola.
- Se crea una partida nueva y lo nuevo de la versión se alcanza desde el menú.
- El bot rápido juega 10 años (150 en la V21) sin romperse.
- Se guarda y se carga la partida, y el archivo .iasave se exporta e importa.

### Reglas técnicas

- Un solo archivo INDUSTRY_ART_vXX.html, sin internet ni librerías externas; JavaScript nivel ES2017; código legible separado por marcas de módulo.
- tools/armar.py y tools/desarmar.py en Python; nada de npm.
- Todo el azar sale de un generador con semilla; la partida es un solo objeto de datos sin funciones; los datos van separados de la lógica.
- Todos los textos visibles salen de un diccionario (español; inglés en la V26).
- Guardado en IndexedDB comprimido, 5 ranuras y 3 autoguardados, archivo .iasave, versión del guardado y migraciones en orden.
- Pantallas desde 360 px, vertical u horizontal; botones de 44 px o más y texto de 14 px o más; en PC y en horizontal, menú lateral y dos columnas.
- Rendimiento (se mide en la V25): semana < 30 ms, año < 1,5 s, guardado tras 150 años < 2 MB, archivo < 1,5 MB, memoria < 200 MB, abrir < 2 s en el Infinix Note 40.

### Reglas de diseño

- Economía: el dinero sale de personas (población × acceso × frecuencia) que se reparten entre obras con una cuota semanal; precios en dólares de 2025 convertidos con el IPC real; tarifas de talentos por mercado, nunca por presupuesto. Frenos: competencia real, rendimientos decrecientes, gastos fijos, impuesto sobre utilidades y antimonopolio.
- Dinero: el del estudio se llama Caja, siempre con $ y K, M, B (B = Billion = mil millones). Un idioma a la vez y una sola escala de prestigio (0 a 100; las estrellas salen de ella).
- Calendario real con todas las fechas de 1850 a 2150; la simulación avanza por semanas; nada se fecha al azar (parte 4).
- Ventanas por defecto: cines o venta física, luego video, TV y streaming, cada una con sus estadísticas; directo a video o streaming solo si se elige.
- Contenido: clasificaciones G, PG, PG-13, 16, NC-17 (17 años), 18, R, X, N sin cambios; las descripciones de 18, R y X dicen «siempre sugerido». Nada gráfico ni explícito. Género Erótico en todos los medios, solo con clasificaciones de adultos y personajes adultos.
- Nombres: talentos, estudios, rivales, premios, festivales y convenciones inventados, sin parodias de nombres reales; reales solo los eventos históricos, las tecnologías y las obras de dominio público. Las franquicias reales solo las agrega el jugador con el Editor. Sin casino ni apuestas.
- Historia real de 1850 a 2026 sin personas reales; ficción con fechas escritas de 2026 a 2150; después, eventos generados.
- Efectos proporcionales: ninguna acción da recompensas desmedidas; toda decisión arriesga algo.

### Qué evitar (lecciones de las referencias)

- Dinero infinito a mitad de partida (la V15 y las cuatro referencias de estudio) → mercado finito, competencia real, gastos que crecen e impuestos.
- Resultados sin explicación → informe “por qué funcionó o fracasó”.
- Pantallas largas y menús hondos → cinco secciones, tarjetas y fichas.
- Microgestión repetitiva al final → autocompletar, plantillas, copiar campañas y la mente maestra.
- Premios demasiado fáciles → nominados reales y la meta de 30 % o menos.
- Eventos que se repiten → unos 80 eventos atados a su época y a lo que hiciste.
- Personas, marcas y franquicias reales disfrazadas en la R7 (nombres mal escritos, logos imitados, festivales casi reales) → todo inventado y sin parodias; lo real solo lo agrega el jugador en el Editor.
- Recompensas desmedidas en la R7 (+12.000 fans por $100K con 500 fans) → efectos proporcionales y con rendimientos decrecientes.
- Decisiones donde toda opción suma → cada opción arriesga algo, como las promesas de la rueda de prensa.
- Pantallas «Próximamente», categorías vacías y textos que contradicen la partida → solo se muestra lo que existe y los textos leen el estado del juego.
- Cuatro nombres para el mismo dinero, cifras sin $, idiomas mezclados y escalas que no cuadran (0 estrellas con prestigio 10) → Caja, $ con K, M y B, un idioma a la vez y una sola escala.
- Mercado plano (52 estudios con cerca del 3 % cada uno) → majors concentradas como en la historia.
- Casino dentro del juego → sin apuestas: cambian la clasificación de la tienda y rompen la economía.
- Tablas que se deslizan a los lados en el celular → columnas que se ocultan o pasan a la ficha.

## 2. Registro de decisiones

Estas 65 decisiones ya están tomadas; un chat de programación no las cambia sin preguntártelo. Las 17 que salieron de tus respuestas del 5 de octubre de 2026 siguen igual, y las 15 últimas son de la v2 (10 de octubre de 2026): el método rápido, el calendario completo y lo aprendido de la Referencia R7. La columna «Desde» ya usa la hoja de ruta nueva.

| Tema | Decisión | Desde |
|---|---|---|
| Base del código | Reescritura modular aprovechando todo lo hecho en la V15 | V16 |
| Entrega | Un solo archivo HTML que funciona sin internet y contiene el código legible separado por módulos | Siempre |
| Plataformas | Web y Android primero; luego iOS y PC; consolas a largo plazo. Liviano y retrocompatible | V27 en adelante |
| Orientación | Vertical u horizontal, a elección del jugador; diseño propio para PC | V16 |
| Idioma | Español, con los textos en un diccionario listo para inglés | V16 (inglés en V26) |
| Medios | Cine y televisión a fondo primero; música, videojuegos, teatro y libros después | V17 a V22 |
| Tu papel | Dueño de estudio y modo carrera (empezar como talento), con vida ligera y heredero | V18 |
| Ritmo | Lo decide el jugador: +1 semana, +1 mes, hasta el próximo evento, hasta un día elegido o avance automático | V16 |
| Fin de partida | Modos Campaña, Libre y Personalizado | V23 |
| Quiebra | El juego ofrece terminar, rescatarte vendiendo franquicias u obras, o un socio que toma parte del control; las condiciones cambian con la dificultad | V21 |
| Retos finales | Ranking, legado de clásicos, imperio de negocios y dinastía | V23 |
| Historia | Real de 1850 a 2026, con nombres reales de eventos y sin personas reales; ficción basada en predicciones de 2026 a 2150; después, eventos generados | V21 |
| Población | Real por región y edad, con la proyección de la ONU; define cuánta gente puede comprar | V16 |
| Dinero | Valores de la época con inflación real y botón “en dólares de hoy”; términos anglosajones (B = Billion = mil millones) | V16 |
| Métricas | Cada medio con las suyas: entradas, copias, vistas, audiencias; ventanas en orden (cines, video, TV, streaming) salvo que se elija ir directo | V19 a V22 |
| Calendario | Real y completo: todas las fechas de 1850 a 2150 en vistas de día, semana, mes, año y agenda; uno global, y las festividades importantes de la región de tu sede pesan más | V16 |
| Personalidades | Se muestran tus porcentajes; el cálculo toma Normal como referencia | V18 |
| Talentos | Más de 1.000 vivos; solo los activos se simulan al detalle | V18 |
| Identidad visual | Lo mejor de la V15 (fondo oscuro, turquesa, rosa, dorado) dentro de una identidad nueva, con temas | V16 |
| Vista del estudio | Edificio que crece piso a piso en el centro, terrenos a los lados y tarjetas para lo rápido | V16 (base) y V21 |
| Listas | Completas, por familias y en orden alfabético; la familia pesa en la matemática y cada elemento da sinopsis, frases y etiquetas | V17 |
| Contenido | Tus clasificaciones intactas (G, PG, PG-13, 16, NC-17, 18, R, X, N). Nada gráfico, solo sugerido; lo más fuerte se vuelve guiño | V17 |
| Género Erótico | En todos los medios, solo con clasificaciones de adultos, nunca con públicos infantiles, familiares o adolescentes, y siempre con personajes mayores de edad | V17 |
| Nombres | Talentos y estudios inventados, sin parodias de nombres reales (nada de personas, marcas o franquicias con el nombre mal escrito); premios y festivales renombrados de forma verosímil, sin eliminar ninguno; obras de dominio público con su nombre real | V19 |
| Editor Sandbox | El jugador agrega franquicias, obras, personajes y precios; el juego sale limpio y lo agregado vive en su dispositivo o en el archivo que comparta | V23 |
| Metas | Logros, misiones y metas secundarias dentro de la campaña | V23 |
| Monetización | Un solo anuncio al abrir; versión gratuita con restricciones y de pago completa se decide al final | V27 |
| Guardado | Local comprimido y archivo exportable; nube al final | V16 |
| Pruebas | Prueba de humo en cada versión; bot completo en la V24 y capturas en la V25; tus celulares (Xiaomi 15T, Infinix Note 40) y tu PC Lenovo | Siempre |
| Forma de trabajo | Modo rápido: un chat por versión con la Especificación corta, la versión anterior y su bitácora | Siempre |
| Plan maestro | Documento en línea (v2), copia en Word y Especificación corta para los chats | Hecho |
| Nombre | INDUSTRY ART (Industria del Arte); se revisa en las tiendas antes de publicar | V27 |
| Secuela | INDUSTRY ART 2 con moda y tecnología, después de la 1.0 | Después |
| Orden de trabajo | Núcleo nuevo primero; la V15 sigue jugable aparte y sus partidas no se migran | V16 |
| Dominio público | Vida del autor + 70 años, ajustable en el Editor | V17 |
| Festivales | En sus fechas reales, dentro del circuito anual fijo del calendario; el Festival Mundial del Arte se queda en las semanas 23 a 26 | V19 |
| Nombres de premios | Aprobados los de Datos del mundo; antes de publicar se revisa que ninguno choque con una marca | V19 |
| Etiquetas | Recepción y prestigio separadas; Rotten pasa a Podrida | V19 |
| Población futura | Escenarios alto, medio y bajo después de 2100; medio por defecto | V16 |
| Países | Se agregan Rusia y Hong Kong, con nombres modernos | V16 |
| Muerte del avatar | Antes de los 100 solo en modo realista; normalmente entre los 85 y los 100 | V18 |
| Tipografía | Una tipografía de títulos libre, incrustada en el archivo | V16 |
| Música | Efectos desde la V16 y música simple opcional en la V23 | V16 y V23 |
| Pruebas largas | Una prueba libre después de la V23, con hasta 5 partidas distintas; antes, cada versión solo se revisa unos 10 minutos | Después de la V23 |
| Multiplicadores | Un factor semanal entre ×0,80 y ×1,40, más bonos por género | V19 |
| NC-17 | Es para 17 años y se queda en el grupo de adolescentes, con el mismo nombre | V17 |
| Descripciones de 18, R y X | Conservan su palabra original y agregan “siempre sugerido” | V17 |
| Certificaciones de música | Las reproducciones cuentan como en la vida real (desde 2016, 1.500 equivalen a un álbum) | V22 |
| Empaquetado | Recomendado: en la nube con GitHub Actions; se confirma en la V27 | V27 |
| Créditos y firma | Propuesta: “Ideado y creado por OneZero” con una línea para Claude en los créditos; en la tienda, tu nombre o tu marca de estudio; se confirma en la V27 | V27 |
| Hoja de ruta | 12 versiones en 4 fases: construir todo (V16 a V23), prueba libre, pulir (V24 a V26) y publicar (V27) | V16 |
| Método de construcción | Cada chat construye todas las funciones de su versión, conectadas y usables; el pulido, el balance y los errores que no bloquean van a la V24, la V25 y la V26 | V16 |
| Especificación corta | Los chats leen la Especificación v2 (las reglas y su versión) en lugar del plan completo, y los datos solo cuando su versión los usa | V16 |
| Fechas | Calendario gregoriano real con los días de la semana reales; la simulación avanza por semanas y cada evento se procesa en la semana de su día | V16 |
| Nada al azar | Festividades con su regla real o una tabla lunar; premiaciones, festivales y convenciones en un circuito anual fijo; la historia en su día real y la ficción hasta 2150 con fechas escritas | V16 |
| Estrenos anunciados | Los estudios anuncian sus fechas con anticipación; los rivales apartan o mueven fechas, y todo se ve en el calendario | V19 |
| Convenciones | Desde su época, con salas por familia de géneros, tres acciones por convención y solo obras recientes o en desarrollo | V19 |
| Prensa | Las respuestas en una rueda de prensa son promesas: si la obra no cumple, el castigo es mayor | V19 |
| Guiones | Mercado de guiones que se renueva cada mes, con informe de lectura pagado y regateo | V17 |
| Talento por niveles | Promesa, Veterano, Estrella consolidada y Leyenda viva; los niveles altos piden prestigio mínimo y la ficha dice cuánto falta | V18 |
| Personal y sede | Personal de oficina por rol (con analista), reclutamiento pagado y tope de personal según el nivel de la sede | V16 y V18 |
| Banco | Préstamos por escalones de prestigio, con puntaje de crédito y cuentas por pagar automáticas | V21 |
| Sin casino | No hay apuestas ni casino: cambian la clasificación de la tienda y rompen la economía | Siempre |
| Vocabulario | El dinero del estudio se llama Caja, siempre con $ y K, M, B; un solo idioma a la vez y una sola escala de prestigio | V16 |
| Nada a medias | Ninguna pantalla «Próximamente»: lo que no existe todavía no se muestra | Siempre |

## 3. Técnica, matemática e interfaz

### Arquitectura técnica

El juego se reescribe por módulos aprovechando lo que ya funciona en la V15, y se entrega siempre como un solo archivo HTML que funciona sin internet.

#### Principios

- Un solo archivo `INDUSTRY_ART_vXX.html`, sin internet ni librerías externas; JavaScript simple (nivel ES2017) para que corra en celulares de hace años.
- El código va legible dentro del HTML, separado por marcas de módulo (`/* ==== módulo: economia ==== */`), para que cualquier chat lo lea y lo continúe.
- Dos scripts de Python: `tools/armar.py` une los módulos en el HTML y `tools/desarmar.py` lo vuelve a separar. Nada depende de npm, que suele estar bloqueado en el entorno de Claude.
- Todo el azar sale de un generador con semilla: la misma semilla con las mismas decisiones da la misma partida. Así se repiten los errores y se comparan versiones.
- La partida es un solo objeto de datos, sin funciones adentro, fácil de guardar, comprimir y migrar.
- Los datos (listas, épocas, países, premios) van separados de la lógica, para que el Editor Sandbox y las traducciones los cambien sin tocar el código.
- Todos los textos visibles salen de un diccionario, listo para el inglés en la V26.
- Interfaz en HTML y CSS (texto nítido, botones accesibles); canvas para pósters, retratos, el edificio y las gráficas.
- Banderas de edición en un solo lugar (completa o gratuita), todas en “completa” hasta la V27.
- El anuncio de entrada vive en la envoltura de Android, no en el HTML: el archivo sigue funcionando sin internet y sin anuncios en el navegador.

#### Módulos

| Módulo | Qué hace | Qué se rescata de la V15 |
|---|---|---|
| nucleo | Arranque, reloj, semilla, mensajes entre módulos y utilidades | El ciclo semanal, reescrito |
| datos | Familias y listas, épocas, formatos, países, tecnologías, festividades y nombres | Listas (DX), nombres por región (NMR), países (CY), partes de nombres de estudio (EXN), tonos (TO), prioridades (PR), festividades (FE), alcance por clasificación (AG) |
| mundo | Población, acceso por medio, inflación, calendario, estaciones, eventos históricos y tendencias | Nada; es nuevo |
| economia | Precios por época, cuota semanal, boca a boca, ventanas, impuestos y antimonopolio | Nada; reemplaza la fórmula que convierte presupuesto en taquilla |
| obras | Ficha, creación rápida y detallada, sinopsis, clasificación, personajes, material y dominio público | Dominio público (PD), etiquetas (lab) |
| talentos | Generación, habilidades, edad, fama, tarifa de mercado, química, rasgos, academia, retiro | Rasgos (TRA), identidades (TI), academia (STU), retratos (fdr) |
| produccion | Etapas, departamentos, terrenos, locaciones, sets, dilemas y prueba de público | La base de etapas |
| lanzamiento | Fechas, regiones, marketing, cadenas de cines, ventanas, métricas y certificaciones | Cines y gráficas semanales |
| franquicias | Canon, continuaciones, personajes, crossovers, compra y venta | Canon y línea de tiempo (frG, cnPut, xoJ, xoS, tlL, tlD) |
| premios | Premiaciones, festivales, jurados, votación y ceremonias | Premiaciones (AW), festivales (FV) y ceremonias, con nombres nuevos |
| tv | Formatos, temporadas, canal propio, parrilla, patrocinadores, streaming y licencias | Lo básico de series y streaming |
| rivales | Estudios con decisiones, estrategias, compras, fusiones y quiebras | Nombres y logos |
| negocio | Finanzas, préstamos, infraestructura, sedes, cines, filiales, inversiones e investigación | Infraestructura y fachada |
| carrera | Avatar, vida ligera, carrera como talento, herederos y dinastía | El avatar básico, que hoy ocupa un lugar fijo en la lista de talentos |
| metas | Modos, dificultad, campaña, logros, misiones y tutorial | La guía |
| editor | Editor Sandbox y paquetes que se importan y exportan | Nada |
| interfaz | Cinco secciones, tarjetas, fichas, gráficas, temas y accesibilidad | Gráficas y componentes |
| arte | Pósters, portadas, retratos, edificio, fachada, logos, íconos y sonido | Pósters (pst), retratos, logo, fachada y sonido |
| guardado | Base de datos local, compresión, ranuras, exportar, importar y migraciones | La idea, con almacenamiento nuevo |
| textos | Diccionario, frases de crítica, premios y noticias | Frases existentes |
| pruebas | Bot de partidas y revisiones de balance y errores | El bot de este análisis |

#### Ciclo de cálculo

- La semana es la unidad de cálculo: producciones, cartelera, ventas, dinero y noticias; cada evento tiene su día exacto en el calendario y se procesa en la semana que lo contiene.
- Cada mes: tarifas, decisiones de rivales, nómina, eventos y finanzas.
- Cada año: edades, retiros, nuevas generaciones, población, precios, premios y balance.
- Talentos dormidos: quienes no trabajan se actualizan una vez al año, así 300 años de partida no vuelven lento el juego.
- Historial compacto: de las obras viejas queda el resumen (cifras finales, etiquetas, premios) y el detalle semanal se borra a los pocos años, salvo las favoritas.

#### Guardado

- Base de datos del navegador (IndexedDB), con el almacenamiento simple como respaldo; la V15 usa solo el simple, que se llena rápido.
- 5 ranuras manuales y 3 autoguardados rotativos, configurables: cada mes, cada año o apagado.
- Compresión nativa del navegador y un compresor propio cuando no existe.
- Exportar e importar un archivo `.iasave` para pasar la partida del celular al PC o guardar copias.
- Cada guardado lleva su versión y una suma de verificación; las migraciones van en orden (V16 → V17 → …) para que ninguna actualización borre partidas.
- Las partidas de la V15 no se migran (decidido).

#### Presupuesto de rendimiento

| Medida | Meta | Referencia V15 |
|---|---|---|
| Abrir el juego en el Infinix Note 40 | menos de 2 s | — |
| Avanzar una semana | menos de 30 ms | — |
| Simular un año | menos de 1,5 s | 100 años en 7 s en el PC de pruebas |
| Guardado tras 150 años de partida | menos de 2 MB comprimido | 1,64 MB sin comprimir tras 100 años, con un mundo mucho más simple |
| Memoria | menos de 200 MB | — |
| Tamaño del archivo | menos de 1,5 MB | 181 KB |

#### Compatibilidad

- Android y iOS con la envoltura Capacitor 8: Android 7.0 o superior e iOS 15 o superior. Capacitor 7 bajaría a Android 6.0 e iOS 14; se decide en la V27.
- Google Play exige apuntar a Android 16 (API 36) para publicar o actualizar desde el 31 de agosto de 2026, con prórroga posible hasta el 1 de noviembre; eso no impide funcionar en versiones viejas.
- PC: el mismo HTML abre en cualquier navegador; después, una envoltura de escritorio. Consolas: piden kits y licencias de cada fabricante, fuera de la 1.0.
- Pantallas desde 360 px de ancho, vertical u horizontal, táctil, mouse y atajos de teclado en PC.

#### Pruebas

- **Fase 1 (V16 a V23):** prueba de humo en cada versión: el juego abre sin errores, se crea una partida, el bot rápido juega 10 años (150 en la V21) sin romperse y se guarda y se carga.
- **V24:** bot completo con tres estrategias (prudente, normal, agresiva), desde 1900 y desde 2000 hasta 2150 con semillas fijas: metas de balance, errores, tiempo por semana y tamaño del guardado, con informe.
- **V25:** capturas de cada pantalla en 390×844 (celular vertical), 844×390 (celular horizontal) y 1366×768 (PC), y medición del presupuesto de rendimiento.
- **V26:** pruebas de reglas (clasificación, dominio público, regla del Erótico, inflación, población y fechas del calendario contra Datos del mundo) y repaso de todos los errores conocidos.
- Lista de revisión humana en el Xiaomi 15T, el Infinix Note 40 y el Lenovo, sobre todo en la prueba libre.

### Matemática y economía

El dinero sale de personas que compran entradas, copias o suscripciones, no del tamaño del presupuesto. Con eso se corrige el mayor fallo de la V15 y de las cuatro referencias: el dinero infinito.

#### Dinero de cada época

Todos los precios se definen en dólares de 2025 y se convierten con el índice de precios (IPC) histórico de EE. UU.; después de 2025 la inflación se simula alrededor de 2,5 % al año, con sobresaltos en las crisis.

$$
\text{Precio}_{\text{año}} = \text{Precio}_{2025} \times \frac{\text{IPC}_{\text{año}}}{\text{IPC}_{2025}}
$$

Con el índice de la Reserva Federal de Minneapolis (1967 = 100): 25 en 1850, 72,3 en 1950 y 967,5 en 2025, así que un dólar de 1950 equivale a unos 13,4 de 2025 ([fuente](https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1800-)).

#### Cuánta gente puede comprar

$$
\text{Público}_{r} = \text{Población}_{r}(\text{año}) \times \text{Acceso}_{r,\,\text{medio}}(\text{año}) \times \text{Frecuencia}_{\text{medio}}(\text{año})
$$

- Población por región y edad: tabla real y proyección de la ONU.
- Acceso: qué parte de la población tiene cines, radio, TV, internet o consola en esa región y año.
- Frecuencia: cuántas veces al año consume ese medio. En EE. UU. la asistencia semanal al cine fue de 80 millones en 1930 (cerca del 65 % de la población), superó los 90 millones en 1946 y cayó a 27,3 millones en 2000, el 9,7 % ([fuente](https://ecommons.udayton.edu/cgi/viewcontent.cgi?article=1023&context=pol_fac_pub)). Esa caída es la llegada de la TV y del video, y el juego la reproduce.

#### Cuota de cada obra frente a la competencia

Cada semana, el público de una región se reparte entre las obras en cartelera y la opción de quedarse en casa, que gana fuerza con cada tecnología nueva.

$$
\text{Cuota}_{i} = \frac{e^{U_i}}{e^{U_0} + \sum_{j} e^{U_j}}
$$

- U es el atractivo de cada obra: calidad percibida, expectativa, estrellas, franquicia, tendencia del género, temporada y si la clasificación deja entrar a cada grupo de edad.
- U₀ es el atractivo de no ir: sube con la radio, la TV, el video, internet y el streaming.
- Resultado: un estreno rival fuerte te quita público y gastar más no multiplica la taquilla por sí solo.

#### Entradas, taquilla y semanas

$$
\text{Entradas}_{i,s} = \frac{\text{Público}_{r}}{52} \times \text{Temporada}_{s} \times \text{Cuota}_{i,s} \qquad \text{Taquilla}_{i,s} = \text{Entradas}_{i,s} \times \text{Precio de la entrada}_{r,\,\text{año}}
$$

$$
U_{i,\,s+1} = U_{i,\,s} - \delta + \beta\,(\text{Público}_i - \text{Expectativa}_i)
$$

- δ es el desgaste natural de la novedad y β la fuerza del boca a boca: si la obra decepciona frente a lo prometido cae rápido; si sorprende, dura.
- El estudio recibe su parte según el contrato con cada cadena (más alta las primeras semanas); después vienen video, TV y streaming, cada uno con su demanda y su precio.
- Calibración: en dólares de 2025, la entrada de cine se ha movido entre unos $6,50 y $13 desde 1950 (gráfico en Datos del mundo).

#### Calidad, crítica y público

$$
Q = \sum_{k} w_k^{(\text{familia})}\,S_k + 6\log_{2}\!\left(\frac{\text{Presupuesto}}{\text{Presupuesto típico}_{\text{época}}}\right) + \text{Química} + \text{Encaje} + \text{Tecnología} + \varepsilon
$$

- S son las habilidades del equipo y las notas de cada departamento; los pesos w dependen de la familia de géneros (en acción pesan efectos y edición; en drama, guion y actuación).
- El presupuesto ayuda con rendimientos decrecientes: duplicarlo siempre suma lo mismo, no el doble.
- Crítica = Q más el gusto de la crítica (complejidad, originalidad, corriente, autoría). Público = Q más el gusto del público (ritmo, entretenimiento, estrellas, efectos, clasificación accesible).
- ε es un azar acotado (±4) para que nada sea seguro.

#### Expectativa y marketing

$$
\text{Conocimiento} = 1 - \prod_{c}\left(1 - \text{Alcance}_{c}\right) \qquad \text{Expectativa} = \text{Conocimiento} \times \text{Deseo}
$$

- Cada canal llega a ciertas edades y regiones; sumar canales rinde cada vez menos.
- El deseo viene de estrellas, franquicia, tendencia y calidad del tráiler.
- El marketing trae público la primera semana; si la obra no cumple, el boca a boca se lo lleva.

#### Talentos y costos

$$
\text{Tarifa} = \text{Base}_{\text{oficio}} \times \frac{\text{IPC}_{\text{año}}}{\text{IPC}_{2025}} \times \left(\frac{\text{Habilidad}}{50}\right)^{2} \times (1 + \text{Fama})^{1.5} \times \text{Demanda}
$$

- La tarifa es el precio de mercado del talento y no depende del presupuesto de tu obra; se negocia salario más porcentaje.
- Producción = semanas × costo semanal (equipo, locaciones con índice por país, sets, efectos); los sets propios y las sedes lo bajan.
- Gastos fijos reales: personal, mantenimiento, filiales, intereses e impuesto sobre utilidades del 25 %.

#### Frenos contra el dinero infinito

1. Mercado finito: población, acceso y frecuencia de cada época.
2. Competencia real con rivales que eligen fechas.
3. Rendimientos decrecientes del presupuesto y del marketing.
4. Fatiga de franquicias y de géneros saturados.
5. Estrellas que cobran más después de cada éxito.
6. Gastos fijos que crecen con el tamaño.
7. Impuesto sobre utilidades.
8. Antimonopolio: con más del 35 % de un mercado se abre una investigación que puede obligarte a vender, como el fallo de 1948 contra los grandes estudios ([fuente](https://www.history.com/this-day-in-history/may-3/u-s-supreme-court-decides-paramount-antitrust-case)).
9. Crisis económicas y tecnologías que cambian el negocio.
10. Retos de final de partida que piden legado, no solo dinero.

#### Metas de balance

El bot comprueba estas metas en la V24 (balance); la V16 programa las fórmulas tal cual y, mientras se construye, solo se vigila que nada se rompa. Son decisiones de diseño, no datos reales.

| Indicador (dificultad Normal) | Meta |
|---|---|
| Multiplicador mediano de una película (bruto ÷ costo) | ×1,5 a ×2,5 |
| Obras que superan ×5 | 5 % o menos |
| Obras que pierden dinero | 30 % a 45 % |
| Crecimiento real de la caja de un estudio bien llevado | 5 % a 20 % al año, en dólares de hoy |
| Premios principales ganados por el jugador | 30 % o menos |
| Años para pasar de independiente a major | 15 a 30 |
| Cuota de mercado del jugador sin investigación | menos del 35 % |

### Interfaz, arte e identidad

La interfaz pasa de 7 pestañas a 5 secciones con una pantalla de inicio viva: el estudio dibujado, las tareas de la semana y el botón de avanzar siempre a mano.

#### Navegación

| Sección | Qué contiene | En la V15 era |
|---|---|---|
| Estudio (inicio) | Edificio y terrenos, tareas de la semana, próximas fechas con cuenta regresiva, banner del evento en vivo, caja, fans y resumen | Estudio |
| Obras | Proyectos por etapa, crear obra, franquicias, catálogo y material | Proyectos |
| Talento | Buscar, fichas, contratos, academia, relaciones y tu avatar | Talentos |
| Mundo | Calendario completo, cartelera, premios, festivales y convenciones, rivales, revista y redes, tendencias y mapa | Industria y Fechas |
| Negocio | Finanzas, distribución y cines, TV y streaming, inversiones, infraestructura, tecnología y filiales | Negocio |
| Barra superior | Caja, fans, fecha (abre el calendario), avanzar, guardar, ajustes, temas, ayuda y editor | Más |

#### Principios

- Una pantalla, una decisión principal; cada tarjeta abre una ficha deslizable (en celular) o un panel lateral (en PC y horizontal).
- Modo rápido y modo detallado en todo lo que se crea; botón “recomendado”.
- Ayuda “i” en cada pantalla, como en Box Office Sim.
- Nada depende de pasar el mouse: todo se abre tocando o manteniendo presionado.
- Listas con filtros, búsqueda y “solo lo que sirve”, sin páginas eternas; totales en vivo antes de confirmar.
- Botones de 44 px o más y texto de 14 px o más.
- Vertical u horizontal, a elección; en horizontal y en PC, menú lateral y dos columnas.
- Guardado automático, sin avisos de “cambios sin guardar”. Nada de pantallas «Próximamente»: lo que no existe todavía no se muestra.

#### El estudio a la vista

- En el centro, un edificio en corte que crece piso a piso: cada piso es un departamento que construiste (guionistas, casting, efectos, sonido, oficinas, archivo) y muestra lo que pasa (alguien escribe, un rodaje avanza con su barra).
- A los lados, los terrenos: sets y backlots, foso de agua, estudio de captura, cines propios; se llenan cuando construyes.
- La fachada y la ciudad cambian con la época: ladrillo y gas en 1850, art déco en los veinte, neón en los cincuenta, vidrio en el 2000 y lo que invente el futuro.
- Estilo plano 2D dibujado con código (no pixel art detallado), liviano para el celular. Tocar un piso abre su departamento.

#### Arte generado por código

- Pósters: los de la V15 (seis estilos de época, motivos por género, marcos por medio, título, lema, créditos y laureles) ampliados a las familias nuevas, con clasificación y estrellas.
- Portadas de álbum a partir de su descripción (“un globo sobre una fábrica”), cajas o cartuchos de videojuego, carteles de teatro y tapas de libro.
- Retratos: los de la V15 con edades (niños incluidos), ropa de cada época y accesorios por oficio; siempre iguales para el mismo talento.
- Gráficas: flujo de caja, historial anual, obras por medio, radar del talento, pirámide de edades, mapa del mundo y taquilla por semana.

#### Identidad y temas

- Base de la V15: azul noche, turquesa, rosa y dorado.
- Nueva identidad: una tipografía de títulos con carácter de cine (archivo libre incrustado, aprobado), íconos propios en lugar de emojis y una cabecera que se viste según la época.
- Temas: Oscuro (por defecto), Claro, Época (sepia o neón según el año) y Alto contraste.
- Accesibilidad: tamaño de texto ajustable, colores pensados para daltonismo (nunca solo color), menos animación y vibración opcional.

## 4. Calendario completo

El juego usa el calendario real: existen los 109.938 días de 1850 a 2150, cada uno con su fecha y su día de la semana, y todo lo que pasa tiene un día fijo que no se saca al azar.

| Qué aparece | Ejemplos | De dónde sale la fecha |
|---|---|---|
| Festividades | Año Nuevo, San Valentín, Carnaval, Pascua, Diwali, Halloween, Acción de Gracias, Navidad | Su regla real: fija, calculada o de una tabla lunar (Datos del mundo) |
| Temporadas | Verano de estrenos, vacaciones escolares, fin de año, temporada de premios | Por hemisferio y región |
| Estrenos | Tus obras y las de los rivales, en los seis medios | La que elige cada estudio; los rivales la anuncian con meses o años de anticipación |
| Premios, festivales y convenciones | Inscripción, evento, nominaciones y gala | Circuito anual fijo, cada uno desde su año (Datos del mundo) |
| Historia | Crisis, guerras, leyes, inventos y formatos | Su día real hasta 2026 y fechas escritas para la ficción hasta 2150 |
| Negocio | Nómina, cuentas por pagar, impuestos, cuotas del banco, fin de contratos | Calendario contable del estudio |
| Producción | Entrega del guion, inicio y fin del rodaje, prueba de público | El plan de cada obra |
| Talentos | Cumpleaños, fin de contrato, retiros anunciados | La biografía de cada talento |

**Cómo se ve**

- Mes: cuadrícula de 7 columnas con un punto de color y un ícono por tipo de evento, nunca solo color.
- Semana: los 7 días en lista, cada evento con su acción.
- Año: 12 meses pequeños con las temporadas y cuántos estrenos hay en cada semana.
- Agenda: lo próximo en orden, con cuenta regresiva.
- En celular vertical, el mes arriba y la agenda debajo; en horizontal y en PC, el mes a la izquierda y el día elegido a la derecha. La fecha de la barra superior abre el calendario.

**Qué se puede hacer**

- Tocar un día para ver sus eventos y actuar: programar un estreno, inscribir una obra, pagar o abrir la ficha.
- Filtrar por tipo, por región o «solo lo mío», y saltar a cualquier fecha o año.
- Ver la competencia de cada semana (tranquila, movida o saturada) antes de fijar un estreno.
- Avanzar una semana, un mes, hasta el próximo evento o hasta un día elegido, y marcar recordatorios con nota que detienen el tiempo.

**Reglas**

- Simulación por semanas, fechas por días: cada evento se procesa en la semana que contiene su día. Las semanas van de lunes a domingo (pregunta 19).
- Cada medio tiene su día de estreno habitual: el cine, el viernes en EE. UU.; la música, el viernes desde 2015 (antes, el martes en EE. UU.); las series, su día y franja. El jugador puede elegir otro día, pero rinde menos.
- Nada al azar: Pascua sale del cálculo gregoriano, Acción de Gracias es el cuarto jueves de noviembre y las fiestas lunares vienen de una tabla de 1850 a 2150 guardada como datos. Después de 2150 el circuito anual sigue igual y los eventos generados también caen en un día concreto.
- Las 12 festividades de la V15 pasan de semanas a fechas reales y conservan sus bonos, dentro del factor semanal de ×0,80 a ×1,40.
- Liviano: solo se guardan los eventos, con la fecha en un número (año, mes y día) y un índice por mes; el mes visible se dibuja al abrirlo.

## 5. Versiones

Cada sección dice qué construir, cuándo está lista, qué diseño seguir y qué funciones del Inventario entran. Las funciones con dos versiones (por ejemplo «V16 y V21») aparecen en las dos: la primera hace la base y la segunda la completa.

### V16 · Base y calendario

**Construye:** Módulos y scripts, semilla, reloj semanal y calendario completo; población, IPC y acceso; la economía del cine en el bucle básico (crear, producir, estrenar, cartelera con cuota semanal y cobrar) con rivales simples; nueva partida con tarjetas; cinco secciones y barra superior; sede inicial; arte de la V15; guardado nuevo y bot rápido

**Lista cuando:** Abre sin errores, se crea una partida, el calendario muestra cualquier día de 1850 a 2150 y el bot juega 10 años y guarda

**En el plan anterior (v1) eran:** V16.

**Qué más leer:** Lee también completas las partes 3 y 4. Datos: Población mundial, Precios y asistencia, Calendario anual y Nombres de premios y festivales.

**Diseño de referencia**

#### 1. Inicio, modos y dificultad

- **Decide:** año de inicio (1850 a 2026 o el futuro), país de la sede, capital, tipo de industria, visión, público, identidad, personalidad, modo y dificultad; o empezar como talento.
- **Arriesga:** empezar temprano da una historia larga con mercados pequeños; empezar tarde da mercados grandes con rivales fuertes.
- **Funciona:**
    - El capital se elige en dólares de hoy y se convierte a la época: $1 M de 2025 equivale a unos $26.000 de 1850.
    - Modos: Campaña (metas por década, legado y créditos finales), Libre (sin fin; después de 2150 sigue con eventos generados) y Personalizado (eliges reglas: inflación, muerte de talentos, rescate, número de rivales).
    - Dificultad: Fácil, Normal, Difícil y Experto, que se desbloquea al terminar una campaña.
    - Quiebra: al quedar en rojo, el juego ofrece terminar, rescatarte vendiendo franquicias u obras, o aceptar un socio que toma parte del control y opina en las decisiones grandes.
    - Semilla de mundo: un código permite repetir o compartir el mismo mundo.

#### 2. Tiempo, historia y mundo

- **Decide:** cuándo avanzar y cómo responder a los eventos.
- **Arriesga:** cada época cambia el negocio; ignorar una tecnología nueva hunde la calidad y el alcance.
- **Funciona:**
    - Calendario real con todas las fechas de 1850 a 2150 (ver Calendario completo); el juego avanza por semanas, con estaciones según el hemisferio, y las festividades de la región de tu sede pesan más.
    - De 1850 a 2026, historia real: formatos, tecnologías, crisis, guerras, censura y escándalos, sin personas reales. De 2026 a 2150, ficción basada en predicciones. Después, eventos generados.
    - Población real por región y edad: unos 1.260 M en 1850, 8.000 M en 2022 y un pico proyectado de unos 10.300 M hacia mediados de 2080.
    - Inflación real de 1850 a 2025 y simulada después; todo se muestra en dinero de la época con el botón “en dólares de hoy”.
    - Hábitos por época: el cine domina hasta que llega la TV; luego el video, internet y el streaming se reparten el público.
    - Tendencias de géneros y temas por región que reaccionan a lo que se estrena: olas y cansancio.
    - Un periódico que cambia de medio con la época: impreso, radio, TV, web, redes.

**Funciones del Inventario (62)**

*Inicio, modos y avatar*

- Nueva partida con nombre de partida y de jugador (Doc · en la V15: Sí)
- Tres especialidades del jugador (Doc · en la V15: Sí)
- Tipo de industria al empezar (cine, TV, música, juegos, teatro, editorial o mixto) (Doc · en la V15: Parcial)
- Visión de la industria y público objetivo (Doc · en la V15: Sí)
- Personalidad del jugador, de Pretencioso a Estrella Absoluta (Doc · en la V15: Sí)
- Identidad: logo, colores, fondo, letras y tipografía con vista previa de la fachada (Doc · en la V15: Sí)
- Capital inicial de $500 a $1 B, convertido a la época (Doc, Resp · en la V15: Parcial)
- Año de inicio libre de 1850 a 2026, y en el futuro (Txt, Resp · en la V15: Parcial (7 años fijos))
- País de la sede al empezar (Txt)
- Ayuda “i” en cada pantalla (BOS · en la V15: Parcial (guía))
- Temas visuales: Oscuro, Claro, Época y Alto contraste (BOS, Prop)
- Ritmo: +1 semana, +1 mes, hasta el próximo evento o automático (Resp, BOS · en la V15: Parcial)
- Semilla de mundo para repetir o compartir (Prop)
- Avatar presente en todo: créditos, premios y eventos (Txt · en la V15: Parcial · entra en V16 y V18)
- Inicio al azar: un dado arma toda la partida (región, era, enfoque, nombres y logo) (R7)
- Tarjetas de región de inicio (Los Ángeles, Bombay, Lagos, independiente…) con mercado, competencia, capital y prestigio, cada una desde su año real (R7)
- Tarjetas de era con 3 reglas del negocio de esa época (R7)
- Enfoque del estudio: 3 géneros y 3 temas por medio, con bono de experiencia (R7 · entra en V16 y V17)
- Dado de nombres para el estudio, el avatar y las obras (R7)
- Logo con sufijo (Pictures, Studios…), textura, posición, boceto e imagen propia que solo se guarda en el dispositivo (R7 · en la V15: Parcial)
- Prestigio e influencia iniciales según la región y la dificultad (R7)
- Menú de pausa: seguir, guardar, ajustes, crear talento (Editor), guía y salir (R7 · en la V15: Parcial)

*Mundo, tiempo, población e inflación*

- 52 semanas por año sobre el calendario real (Doc · en la V15: Sí)
- Población real por región y edad, con la proyección de la ONU (Resp · en la V15: Parcial (curva))
- Escenarios de población después de 2100 (Prop)
- Acceso por medio y región: cines, radio, TV, internet, consolas (Prop)
- Frecuencia de consumo por época (Prop)
- Inflación real de 1850 a 2025 y simulada después (Resp)
- Botón “en dólares de hoy” (Resp)
- Mapa del mundo con 30 países o más, incluidos Rusia y Hong Kong (V15, Resp · en la V15: Parcial)
- Calendario de escritorio y teléfono de noticias en el inicio (FST)
- Cuenta regresiva de próximas fechas (BOS)
- Calendario completo con fechas reales: vistas de día, semana, mes, año y agenda (Txt)
- Días de la semana reales de 1850 a 2150 (el 1 de enero de 1850 fue martes) (Txt)
- Festividades con su regla real: fijas, calculadas (Pascua, Acción de Gracias) o de tabla lunar (Año Nuevo chino, Eid al-Fitr, Diwali) (Txt · en la V15: Parcial (12 por semanas))
- Circuito anual fijo de premiaciones, festivales y convenciones, cada uno desde su año (Txt · en la V15: Parcial (9 premiaciones))
- Tocar un día para ver sus eventos y actuar: programar un estreno, inscribir una obra o pagar (Txt)
- Filtros del calendario por tipo, región y «solo lo mío», con color e ícono (Prop)
- Avanzar hasta un día elegido y recordatorios propios con nota (Txt, Prop)
- ADN del mercado por era: precio real de la entrada, motor del mercado y géneros en tendencia (R7)

*Negocio e imperio*

- Edificio que crece piso a piso y terrenos con sets (Resp, FST, MGT2 · entra en V16 (base) y V21)
- Sede por niveles, del cuarto pequeño al complejo: tope de personal, gasto fijo y descripción con humor (R7 · entra en V16 y V21)
- Libro mensual de ingresos y gastos (R7 · en la V15: Parcial)
- Menú rápido de departamentos (R7)

*Interfaz, metas y técnica*

- Cinco secciones y barra superior (Prop)
- Fichas deslizables en celular y panel lateral en PC (Prop)
- Vertical u horizontal, a elección (Resp · en la V15: Parcial)
- Diseño propio para PC (Resp)
- Botones de 44 px y texto de 14 px o más (Prop)
- Pósters generados por código según época y género (en lugar de un generador con IA) (Txt, V15 · en la V15: Sí)
- Retratos con edad y época (V15 · en la V15: Sí)
- Gráficas: caja, historial, radar, pirámide de edades, mapa y taquilla (V15 · en la V15: Parcial)
- Tipografía de títulos e íconos propios (Prop)
- Sonido de efectos (V15 · en la V15: Sí)
- Accesibilidad: tamaño de texto, daltonismo, menos animación (Prop · entra en V16 y V25)
- Guardado comprimido, ranuras y archivo .iasave (Prop · en la V15: Parcial)
- Autoguardado configurable (BOS2 · en la V15: Parcial)
- Bot de pruebas (Prop)
- Fans en la barra superior, junto a la Caja y la fecha (R7)
- Una palabra para el dinero (Caja), siempre con $ y K, M, B (R7)
- Una sola escala de prestigio (0 a 100) y las mismas estrellas en todo el juego (R7)
- Tablas sin desplazamiento lateral en el celular (R7)

**De la V15**

- Corrige el fallo 1 (alta): La taquilla sale del costo multiplicado. Efecto: Gastar más siempre gana más: de $1 M a $857 M en 8 años.
- Corrige el fallo 2 (alta): Tarifas proporcionales al presupuesto de la obra. Efecto: El mismo director cobra $117 o $23,38 M.
- Corrige el fallo 3 (alta): Sin inflación ni precios de época. Efecto: $1 M vale igual en 1900 y en 2050.
- Corrige el fallo 4 (alta): Cartelera rival calculada con el año y la semana. Efecto: Nadie te quita público de verdad.
- Corrige el fallo 7 (alta): Guardado sin comprimir en el almacenamiento simple, que suele permitir unos 5 MB. Efecto: Una partida larga puede dejar de guardarse.
- Corrige el fallo 8 (alta): Final de partida fácil. Efecto: Decenas de miles de millones sin nada importante en qué gastarlos.
- Corrige el fallo 10 (alta): 80 de 107 controles miden menos de 44 px. Efecto: Toques fallidos.
- Corrige el fallo 11 (alta): En celular horizontal quedan unos 60 px útiles. Efecto: Casi injugable en horizontal.
- Corrige el fallo 13 (alta): Sin tutorial y con 7 pestañas desde el inicio. Efecto: Cuesta empezar.
- Corrige el fallo 14 (media): Azar sin semilla. Efecto: Errores imposibles de repetir.
- Corrige el fallo 15 (media): Población con una curva: 2.140 M en 1900 (la real, unos 1.650 M) y fija en 11.760 M desde 2060. Efecto: Mercado irreal.
- Corrige el fallo 16 (media): Todas las obras siguen la misma curva de 8 semanas (34 %, 22 %, 15 %…). Efecto: El boca a boca no cambia nada.
- Corrige el fallo 18 (media): Impuesto semanal sobre la caja. Efecto: Castiga ahorrar en lugar de ganar.
- Corrige el fallo 21 (media): El avatar ocupa un lugar fijo de la lista de talentos. Efecto: Frágil cuando la lista cambia.
- Corrige el fallo 24 (media): 44 textos de 13 px. Efecto: Difícil de leer.
- Corrige el fallo 25 (media): Negocio mide 6.500 px en el celular. Efecto: Página eterna.
- Corrige el fallo 26 (media): En PC, una columna de 760 px. Efecto: Desperdicia la pantalla.
- Corrige el fallo 30 (media): El estudio no crece a la vista. Efecto: Poca recompensa visual.
- Corrige el fallo 31 (media): Código en líneas largas con nombres cortos y 15 capas de cambios. Efecto: Difícil de mantener.
- Corrige el fallo 34 (baja): Emojis como íconos. Efecto: Se ven distinto en cada celular.
- Rescata Nombres y países (NMR, CY, EXN): Nombres por región, 30 países y partes de nombres de estudio → datos (V16).
- Rescata Clasificación (AG), tonos (TO) y prioridades (PR): Alcance por clasificación, efectos del tono y reparto por prioridad → datos y economía (V16 y V17).
- Rescata Festividades (FE): 12 fechas con multiplicador moderado → calendario (V16).
- Rescata Pósters (pst) y retratos (fdr): Arte por código según época, género y formato → arte (V16).
- Rescata Logo, fachada, mapa y gráficas: Identidad del estudio y visualizaciones → arte e interfaz (V16).
- Rescata Sonido y guía: Efectos y ayuda → arte e interfaz (V16).
- Rescata Código para pasar la partida: Exportar e importar → guardado, ahora como archivo .iasave (V16).

### V17 · Crear y producir

**Construye:** Taxonomía completa con premisas y tropos; creación rápida y detallada, sinopsis, clasificación, personajes, dominio público, Erótico e idea con IA; mercado de guiones; producción completa con departamentos, locaciones, sets, dilemas y prueba de público

**Lista cuando:** Toda lista se puede elegir y una obra va de la idea al estreno en modo rápido y en detallado

**En el plan anterior (v1) eran:** V17 y V19.

**Qué más leer:** Datos: toda la Taxonomía y Obras de dominio público.

**Diseño de referencia**

#### 3. Creación de obras: la fábrica de ideas

- **Decide:** medio, ficción o realidad, tipo, géneros, subgéneros, temas, problemáticas, arco, tipo de ficción, corriente, tono, estilo, prioridad, formato de época, época y lugar de la historia, idioma, público, contenido, duración, complejidad, ritmo, efectos, presupuesto y personajes.
- **Arriesga:** las combinaciones raras pueden chocar o volverse de culto; la complejidad gusta a la crítica y cansa al público; tres géneros sin un líder de 90 o más es un desastre.
- **Funciona:**
    - Modo rápido (4 a 6 decisiones, con botón “recomendado” y dado) y modo detallado con todas las listas.
    - Las listas completas están en familias (pestaña Taxonomía): la familia pesa en la matemática y cada elemento da sabor, palabras para la sinopsis, frases de crítica y etiquetas.
    - El encaje entre familias suma o resta; el jugador lo descubre con la experiencia, como las estrellas de encaje de Mad Games Tycoon 2.
    - Sinopsis generada con plantillas a partir de género, tema, arco, personajes, época y lugar.
    - La clasificación (G a X y N) sale del contenido elegido (violencia, lenguaje, amor, consumo, terror) y respeta la censura de la época.
    - Personajes con nombre, edad, sexo, importancia (hasta 10 protagonistas, 15 secundarios, 20 extras, más invitados y cameos) y arquetipo.
    - Tres caminos: idea nueva, comprar un guion en el mercado de guiones (con informe de lectura y regateo) o usar material: dominio público y derechos comprados, con la ficha real de la obra y su atractivo por edad y sexo.
    - Idea automática con IA desde 2022, que autocompleta y bloquea parte de la obra.

#### 5. Producción

- **Decide:** reparto del presupuesto por departamento, locación real o set o CGI o efectos prácticos, país de rodaje, semanas de pulido y respuesta a los dilemas.
- **Arriesga:** sobrecostos, retrasos, accidentes y efectos mal hechos que el público repudia.
- **Funciona:**
    - Etapas: desarrollo, preproducción, rodaje, posproducción y prueba de público.
    - Departamentos con puntos; cada familia de géneros tiene un reparto ideal y al final cada departamento recibe una nota de F a A+.
    - Estilos de producción (estándar, +16, adultos, glamour, caricatura, anime) que muestran qué públicos lo aman o lo rechazan.
    - Terrenos (montaña, pradera, trópico, ártico, bosque, desierto, ciudad, mar) y locaciones por país con costo local; tus sedes abaratan y los sets propios se reutilizan.
    - Línea de producción con presupuesto acordado frente a costo real, semana a semana; el liderazgo del director y del diseñador controla el sobrecosto.
    - Mini dilemas con costo de los dos lados e incidentes aleatorios.
    - Prueba de público con puntaje simulado y opción de regrabar o reeditar; pilotos para series; semanas extra de pulido o estreno apurado.

**Funciones del Inventario (54)**

*Inicio, modos y avatar*

- Enfoque del estudio: 3 géneros y 3 temas por medio, con bono de experiencia (R7 · entra en V16 y V17)

*Mundo, tiempo, población e inflación*

- Formatos por época: blanco y negro, color, IMAX, Screen X, digital (Txt · en la V15: Parcial)
- Costo local por país (por ejemplo, más barato en Colombia) (Txt)

*Creación de obras*

- Medio: cine, TV, música, videojuegos, teatro y libros (Doc · en la V15: Sí)
- Ficción o realidad (Doc · en la V15: Parcial)
- Tipo de obra por medio (película, serie, álbum, juego…) (Doc · en la V15: Sí)
- Géneros por familias, hasta 3 con uno líder (Doc, Resp · en la V15: Parcial)
- Subgéneros (Doc · en la V15: Sí)
- Temas (217 más 10 deportes) (Doc · en la V15: Sí)
- Problemáticas y argumentos (Doc · en la V15: Sí)
- Arcos y subarcos (Doc · en la V15: Sí)
- Tipo de ficción (Doc · en la V15: Sí)
- Corrientes artísticas por época, con bono de novedad (Doc · en la V15: Sí)
- Tono, estilo y prioridad (Doc · en la V15: Sí)
- Género Erótico en todos los medios (Resp)
- Época y lugar de la historia (Doc · en la V15: Parcial)
- Idioma de la obra (Txt)
- Público objetivo por edad y sexo (Doc · en la V15: Parcial)
- Clasificación G a X y N calculada desde el contenido (Doc, Resp · en la V15: Parcial)
- Duración, complejidad, ritmo y efectos (Doc · en la V15: Parcial)
- Animación, imagen real o híbrido (Txt)
- Clase A, B o C; obra infantil, adulta o seria (Txt)
- Modo rápido (4 a 6 decisiones) y modo detallado (Resp, Prop)
- Botón “recomendado” y dado (Prop)
- Sinopsis generada (Resp)
- Personajes con nombre, edad, sexo, importancia y arquetipo (Txt)
- Hasta 10 protagonistas, 15 secundarios, 20 extras, invitados y cameos (Txt)
- Encaje entre familias que se descubre jugando, con estrellas (MGT2, Prop)
- Dominio público que se libera según el año (Txt, Doc · en la V15: Sí (50 obras))
- Obras de dominio público subidas de tono, sin contenido gráfico (Resp)
- Ficha real del material con su atractivo por edad y sexo (FST)
- Idea automática con IA desde 2022 (Txt · en la V15: Sí)
- Estimación de calidad y retorno antes de empezar (V15 · en la V15: Sí)
- Mercado de guiones ya escritos que se renueva cada mes: género, tema, páginas, dificultad, rango de presupuesto, etiquetas y precio (Doc, BOS2, R7)
- Premisas y tropos por familias (0 a 2 por obra), con frases para la sinopsis y el marketing (R7)
- Informe de lectura pagado que revela la calidad oculta de un guion (más preciso con un analista) (R7)
- Regatear el precio de un guion o de unos derechos (R7)

*Producción*

- Etapas: desarrollo, preproducción, rodaje, posproducción (Doc · en la V15: Parcial)
- Departamentos: música, fotografía, diseño, vestuario, animación, efectos (Txt · en la V15: Parcial)
- Reparto del presupuesto por departamento, con ideal por familia (FST, Prop)
- Nota de F a A+ por departamento (FST)
- Estilos de producción con públicos que los aman o rechazan (FST)
- Locación real, set, CGI o efectos prácticos, con presupuesto (Txt)
- Terrenos (montaña, pradera, trópico, ártico, bosque, desierto, ciudad, mar) con ventajas (Txt, BOS2)
- Rodaje por país con costo local (Txt · en la V15: Parcial)
- Sets reutilizables (Txt)
- Línea de producción: presupuesto acordado frente a costo real (Doc)
- Sobrecostos según el liderazgo del director y del diseñador (V15 · en la V15: Sí)
- Mini dilemas e incidentes de rodaje (FST, Prop)
- Prueba de público con puntaje y opción de regrabar o reeditar (Txt)
- Semanas extra de pulido o estreno apurado (MGT2)
- Estudios externos de animación y efectos (Txt)
- Formatos de época: blanco y negro, color, IMAX, Screen X, digital (Txt · en la V15: Parcial)

*Televisión y streaming*

- Géneros de TV nuevos: Comedia dramática, Procedimental, Serie web, Telenovela, Citas, Deportes en vivo, Magacín, Premiaciones, Telecompras, Divulgación científica y Vida salvaje (R7, Prop)

**De la V15**

- Corrige el fallo 9 (alta): Asistente de creación de 3.010 px en el celular. Efecto: Cansa y esconde las decisiones.
- Corrige el fallo 22 (media): Dominio público con vida + 50. Efecto: Distinto a tu documento.
- Corrige el fallo 33 (baja): La IA solo resta calidad. Efecto: Tu documento pide que dependa del equipo.
- Corrige el fallo 35 (baja): Partes del documento sin hacer: marketing por edades, comprar propuestas y franquicias, personajes, elenco con nombres, 3 planes de streaming, 41 inventos y 20 infraestructuras. Efecto: Diseño incompleto.
- Rescata Listas (DX): Géneros, subgéneros, temas, problemáticas, arcos y corrientes por formato → datos, reordenadas por familias (V17).
- Rescata Dominio público (PD): 50 obras con autor, año, tipo y géneros → datos y obras, ampliadas a 82 (V17).
- Rescata Clasificación (AG), tonos (TO) y prioridades (PR): Alcance por clasificación, efectos del tono y reparto por prioridad → datos y economía (V16 y V17).

### V18 · Talento y equipo

**Construye:** Más de 1.000 talentos con niveles, gremios y catálogo; tarifas, negociación, química, academia y ciclo de vida; personal de oficina y reclutamiento; avatar, modo carrera, vida ligera y heredero

**Lista cuando:** Se contrata cada oficio y cada nivel, y el avatar envejece y hereda en una partida del bot

**En el plan anterior (v1) eran:** V18 y V29.

**Qué más leer:** Datos: no hace falta adjuntarlos.

**Diseño de referencia**

#### 4. Talentos

- **Decide:** a quién contratas, por cuánto (salario y porcentaje), contratos exclusivos, a quién becas y a quién descubres joven.
- **Arriesga:** estrellas caras que exigen fama del estudio, promesas que no florecen, cansancio y egos.
- **Funciona:**
    - Más de 1.000 talentos vivos, inventados, con biografía: país, idiomas, edad, sexo y oficios.
    - Oficios: escritor, director, productor, diseñador de arte y tecnología, fotografía, compositor o músico, editor e intérprete, más vestuario, maquillaje, efectos y animación. Pueden cambiar de oficio.
    - Habilidades por oficio, desempeño por familia de géneros, capacidades, especialidad por medio, otras habilidades (doblaje, acentos, liderazgo, paciencia), fama y poder de estrella por región, belleza y papeles recomendados, clasificaciones que acepta, rasgo de personalidad y ventajas ganadas con experiencia.
    - Un 90 o más es raro. Crecen hasta los 35 o 40 años y luego cambian según su oficio.
    - Ciclo de vida: actores desde niños, retiro entre los 70 y los 100 (pueden volver), muerte poco probable a cualquier edad, nuevas generaciones cada año.
    - Energía (−20 por cargo, +10 al mes) y moral; trabajan también para los rivales.
    - Tarifa de mercado según fama, habilidad, demanda y época; negociación con rechazo, contraoferta o exigencias (protagónico, porcentaje, director).
    - Química y relaciones que nacen del trabajo: amistad, rivalidad, pareja.
    - Academia: taller, especialización y maestría (hasta +5), y becas.

**Funciones del Inventario (45)**

*Inicio, modos y avatar*

- Avatar presente en todo: créditos, premios y eventos (Txt · en la V15: Parcial · entra en V16 y V18)
- Empezar como director u otro talento (modo carrera) (Txt)
- Edad del avatar, retiro y heredero a los 100 (Txt)
- Vida ligera del avatar con mini decisiones (BL)
- Avatar con trasfondo, arquetipo de liderazgo y especialización (R7)

*Talentos*

- Más de 1.000 talentos inventados con biografía (Txt, Resp · en la V15: Parcial (108 y de 6 a 10 nuevos al año))
- País, nacionalidad, idiomas, edad y sexo (Txt · en la V15: Sí)
- Oficios y cambio de oficio (Txt · en la V15: Parcial)
- Habilidades por oficio (Doc · en la V15: Sí)
- Desempeño por familia de géneros (afinidades) (Txt · en la V15: Sí)
- Especialidad por medio (Doc · en la V15: Sí)
- Otras habilidades: doblaje, acentos, liderazgo, paciencia (Doc)
- Actuación, aprobación del público, belleza y papeles recomendados (Txt)
- Clasificaciones que acepta (Doc)
- Rasgo de personalidad con ventaja y costo (Doc, V15 · en la V15: Parcial)
- Fama y poder de estrella por región (Doc · en la V15: Parcial)
- Tarifa de mercado y salario más porcentaje (Prop)
- Negociación con rechazo, contraoferta y exigencias (FST, BOS2)
- Contratos exclusivos (V15 · en la V15: Sí)
- Energía y moral (Prop)
- Química y relaciones: amistad, rivalidad, pareja (Txt, V15 · en la V15: Parcial)
- Crecen hasta los 35 o 40 y después cambian según su oficio (Doc · en la V15: Parcial)
- Actores niños (Txt)
- Retiro entre los 70 y los 100, con regresos (Txt)
- Muerte poco probable a cualquier edad (Txt)
- Nuevas generaciones cada año (V15 · en la V15: Sí)
- Academia: taller, especialización, maestría y becas (V15 · en la V15: Sí)
- Descubrir talentos jóvenes (Prop)
- Ventajas ganadas con la experiencia (FST, Prop)
- Buscador avanzado: overall, costo mínimo y máximo, retirados (Doc)
- Contratar desde la ficha para un proyecto en marcha (Doc)
- Retrato propio con edad y época (V15 · en la V15: Sí)
- Ficha con historial de obras, premios e ingresos (V15 · en la V15: Sí)
- Crear un talento propio, personalizado (BOS2)
- Niveles de talento: Promesa, Veterano, Estrella consolidada y Leyenda viva (R7)
- Los niveles altos piden prestigio mínimo y la ficha dice cuánto falta (R7)
- Catálogo por gremios con conteo (actores, directores, guionistas…) (R7)
- Filtro por letra, orden por costo, calificación y disponibilidad, y lista corta (R7)
- Personal de oficina por rol: productor, guionista de planta, editor, mercadeo y analista (R7)
- Reclutamiento pagado: búsqueda rápida (junior, 3 semanas) o estándar (nivel medio, 6 semanas) (R7)
- Bandeja de candidatos para aceptar o rechazar (R7)
- Capacitación intensiva más allá del nivel 50 (R7)
- El personal libre se suma al instante a una producción (R7)

*Negocio e imperio*

- Personal de oficina con un efecto cada uno, sin acumular (ETV)
- Mercado laboral y grupos de personal (MGT2)

**De la V15**

- Corrige el fallo 2 (alta): Tarifas proporcionales al presupuesto de la obra. Efecto: El mismo director cobra $117 o $23,38 M.
- Corrige el fallo 19 (media): Salario de exclusividad fijo en dólares. Efecto: Barato en 2050 y carísimo en 1900.
- Corrige el fallo 20 (media): Retiro desde los 55 años. Efecto: Carreras cortas; tu documento pide de 70 a 100.
- Corrige el fallo 21 (media): El avatar ocupa un lugar fijo de la lista de talentos. Efecto: Frágil cuando la lista cambia.
- Rescata Rasgos (TRA) y personalidades (TI): 20 rasgos de talento y las personalidades del jugador, de Pretencioso a Estrella Absoluta → talentos y carrera (V18).
- Rescata Academia (STU): Taller, especialización y maestría → talentos (V18).

### V19 · Estreno, crítica y premios

**Construye:** Marketing, regiones, cadenas, ventanas, métricas y certificaciones; estrenos anunciados; convenciones, prensa y redes; crítica, etiquetas, informe de por qué, revista, panel y filmografía; festivales, premiaciones, vitrina y ceremonias

**Lista cuando:** Una obra recorre convención, estreno, ventanas, crítica y premios en una partida del bot

**En el plan anterior (v1) eran:** V20, V21 y V22.

**Qué más leer:** Datos: Nombres de premios y festivales y Calendario anual. Es la versión más grande: si el chat se queda sin espacio, otro la termina.

**Diseño de referencia**

#### 6. Lanzamiento y ventas

- **Decide:** fecha, regiones, tipo de estreno, marketing (canales, edades, regiones), promociones y ventanas.
- **Arriesga:** prometer más de lo que la obra cumple, chocar con un estreno rival o perder la temporada.
- **Funciona:**
    - Canales de marketing que aparecen en su época, con alcance por edad y región y rendimientos decrecientes; se puede copiar una campaña a otras regiones.
    - Promociones: juguetes, coleccionables, exclusivos, alianzas con marcas de comida, videojuegos y alfombra roja.
    - Expectativa: si la obra queda por debajo de lo prometido, el boca a boca la hunde; si la supera, dura más semanas.
    - Estreno por región (retener, amplio, limitado o escalonado), cadenas de cines con contrato (parte de la taquilla por semana, semanas mínimas, salas) y cines propios.
    - Competencia real: ves los estrenos rivales y ellos ven los tuyos.
    - Ventanas en orden por defecto (cines, video doméstico, TV, streaming), cada una con sus estadísticas; o directo a video o streaming; o licencia a una plataforma si no tienes la tuya.
    - Métricas por medio y certificaciones de oro, platino y diamante desde su año real.
    - Dinero en cadena: bruto, parte del estudio, regalías y neto; resumen al simular varias semanas.
    - Reestrenos, remasterizaciones y la bóveda: retirar una obra para revivirla años después.

#### 7. Crítica, público y etiquetas

- **Decide:** a qué público apuntas y cuándo revivir una obra.
- **Arriesga:** una etiqueta mala persigue a la franquicia; una buena se aprovecha en su ventana de 10 años.
- **Funciona:**
    - Dos puntajes, crítica y público, con críticos que tienen nombre, medio, gustos y frases según lo que funcionó o falló.
    - Proyección para la prensa con suspenso y después el informe “por qué funcionó o fracasó”: equipo, departamentos, fecha, competencia, marketing, encaje y tendencia.
    - Etiquetas de recepción (Hit, Pop, Fresco, Olvidado, Rotten) y de prestigio (Culto, Clásico, Invaluable), más insignias de Hype, Oro, De autor, Blockbuster, Media e Independiente. Cambian con el tiempo y afectan secuelas y reestrenos: las buenas rinden en los primeros 10 años y las malas después de 10.
    - Biografía pública del estudio: mejor obra, franquicia más famosa, obras de culto, mayor clásico, la más taquillera, la más cara, mascota, género especializado, perfil (familiar, adulto, serio) y clase A, B o C.

#### 9. Premios y festivales

- **Decide:** a qué premiaciones y festivales postular, campañas de premios y hacer obras pensadas para premios.
- **Arriesga:** inscribir una obra en un festival bloquea su estreno hasta que termine; los Bastard Awards hunden la fama (o la vuelven de culto).
- **Funciona:**
    - Premiaciones por medio con las categorías por cargo de tu documento, actor y actriz separados, independientes, Bastard, Pop, nacionales por país y el Festival Mundial del Arte.
    - Regla fija: cada premiación mira las obras del año anterior; los festivales premian en su propia semana.
    - Seis sedes continentales con jurados distintos (talentos, crítica, academia, público) y cuatro fases: postular, nominados, ganadores y subasta, con puja automática opcional.
    - Competencia real: compiten obras de los rivales, no nombres al azar.
    - Ceremonias animadas con el sobre y frases de discurso; invitaciones con fecha límite.
    - Nombres inventados y verosímiles, ya aprobados (Datos del mundo).

**Funciones del Inventario (75)**

*Inicio, modos y avatar*

- Simular varias semanas con resumen de resultados (BOS2)
- Biografía pública del estudio (Txt)
- Mascota del estudio y género especializado (Txt)
- Clase del estudio A, B o C y perfil familiar, adulto o serio (Txt)

*Mundo, tiempo, población e inflación*

- Festividades de la región de tu sede con más peso (Resp)
- Estaciones según el hemisferio (Prop)
- Festividades con fechas reales y bonos por género (Doc · en la V15: Parcial (12))
- Tendencias de géneros y temas por región, con olas y cansancio (V15, Doc · en la V15: Parcial)
- Idiomas del mundo y doblaje (Txt)
- Periódico que cambia de medio con la época (Prop)
- Competencia de cada semana (tranquila, movida o saturada) al elegir la fecha de estreno (Prop)
- Banner del evento en vivo en el inicio (convención, festival o gala de esta semana) (R7)

*Lanzamiento, ventanas y métricas*

- Plan de lanzamiento con semana de estreno (Doc · en la V15: Sí)
- Fechas de estreno con cuenta regresiva; “0” significa retener (BOS)
- Canales de marketing que aparecen en su época (Doc · en la V15: Parcial (6 canales))
- Alcance por edades y regiones, con rendimientos decrecientes (Doc, Prop)
- Copiar una campaña a otras regiones (BOS2)
- Promociones: juguetes, coleccionables, exclusivos, comida, alfombra roja (Txt)
- Las promociones mueven a la crítica y al público (Txt)
- Expectativa frente a calidad, por obra (Txt, Prop · en la V15: Parcial)
- Estreno por región: retener, amplio, limitado o escalonado (BOS)
- Cadenas de cines con contrato: parte por semana, semanas mínimas, salas (BOS2 · en la V15: Parcial (30 cadenas))
- Cines propios (BOS2, V15 · en la V15: Sí)
- Cartelera semanal real con los estrenos rivales (BOS · en la V15: Parcial)
- Idiomas y doblaje por mercado, con costo por idioma (MGT2, Txt)
- Ventanas en orden: cines o venta física, video, TV y streaming (Resp)
- Directo a video o a streaming, solo si se elige (Resp)
- Estadísticas propias de cada ventana (Resp)
- Cine: taquilla y entradas (Resp · en la V15: Parcial)
- Video doméstico: copias en VHS, DVD y Blu-ray (Resp)
- Certificaciones de oro, platino y diamante desde su año real (Resp)
- Dinero en cadena: bruto, parte del estudio, regalías y neto (BOS · en la V15: Parcial)
- Reestrenos, remasterizaciones y la bóveda (Txt, V15 · en la V15: Parcial)
- Estrenos anunciados en el calendario: los rivales apartan fechas con meses o años de anticipación y pueden moverlas (Prop)
- Convenciones (cultura pop desde 1970; antes, exposiciones universales) con salas por familia de géneros (R7)
- En una convención solo entran obras en desarrollo, en cartelera o estrenadas hace menos de 12 meses (R7)
- Tres acciones por convención: panel, anuncio de reparto, entrevista exclusiva o rueda de prensa (R7)
- Rueda de prensa con respuestas que son promesas: si la obra no cumple, el golpe es mayor (R7)
- Ánimo de los fans en la convención como lectura del público (R7)
- Paquetes de prensa (portadas, presentación del calendario de una franquicia) con efecto proporcional (R7)
- Radar de redes desde la era de internet: anuncios, filtraciones y rumores de rivales, tendencias y adelantos propios; antes, columnas de chismes y radio (R7)

*Crítica, etiquetas y franquicias*

- Puntaje de crítica y puntaje de público (Doc · en la V15: Sí)
- Críticos con nombre, medio, gustos y frases (Resp)
- Proyección para la prensa con suspenso (BOS)
- Informe “por qué funcionó o fracasó” (V15, Prop)
- Etiquetas de recepción: Hit, Pop, Fresco, Olvidado, Podrida (antes Rotten) (Doc · en la V15: Sí)
- Etiquetas de prestigio: Culto, Clásico, Invaluable (Doc · en la V15: Sí)
- Insignias: Hype, Oro, De autor, Blockbuster, Media, Independiente (Txt)
- Etiquetas que cambian con el tiempo (ventana de 10 años) (Txt · en la V15: Parcial)
- Citar frases de crítica de tus propias obras (ETV)
- Cartas de fans (MGT2)
- Revista de la industria con números que se hojean: Boletín, Rincón de la crítica y Editorial escritos con datos de la partida (R7)
- Panel del estudio: taquilla de toda la vida, trayectoria de ingresos, franquicias y fans (R7)
- Filmografía en tabla con nota de crítica e ingresos, con búsqueda y orden (R7)
- Cronología del estudio: hitos y prestigio en una línea de tiempo (R7)

*Premios y festivales*

- Premiaciones por medio con categorías por cargo (Doc · en la V15: Sí)
- Regla: cada premiación mira las obras del año anterior (Doc · en la V15: Sí)
- Actor y actriz por separado (Doc)
- Mejor obra animada (Txt)
- Premios independientes, los peores (Bastard) y los populares (Pop) (Doc, Txt · en la V15: Sí)
- Premios nacionales por país (Txt)
- Festival Mundial del Arte (Doc · en la V15: Parcial)
- Seis sedes continentales con tres premios cada una (Doc, BOS2 · en la V15: Sí)
- Jurados distintos: talentos, crítica, academia y público (Prop)
- Fases: postular, nominados, ganadores y subasta (Doc, BOS2 · en la V15: Sí)
- Puja automática en la subasta (Prop)
- Compiten las obras de los rivales, no nombres al azar (Prop)
- Ceremonias animadas con sobre y discurso (V15 · en la V15: Sí)
- Campañas de premios e invitaciones con fecha límite (Prop, BOS2)
- Historial de premios y premios en vivo (Doc · en la V15: Parcial)
- Nombres inventados y verosímiles (Resp)
- Crónica de festivales: convocatoria abierta o cerrada, costo de inscripción, mes, géneros preferidos y prestigio; filtro circuito mayor o independiente (R7)
- Rumores del circuito: pistas de lo que buscan los jurados esta temporada (R7)
- Vitrina de premios con siluetas por ganar, cuenta regresiva a la gala y archivo (R7)

*Negocio e imperio*

- Cines propios y cadenas (BOS2, V15 · en la V15: Sí · entra en V19 y V21)

**De la V15**

- Corrige el fallo 6 (alta): El jugador gana casi todos los premios. Efecto: 494 premios en 1950; pierden valor.
- Corrige el fallo 12 (alta): No explica sus resultados. Efecto: El jugador no aprende por qué ganó o perdió.
- Corrige el fallo 17 (media): Nominados de relleno con puntajes al azar. Efecto: Ceremonias falsas.
- Corrige el fallo 23 (media): Premios y festivales con nombres reales. Efecto: Riesgo de marca en las tiendas.
- Corrige el fallo 27 (media): Hype del estudio y no de cada obra. Efecto: Todas las obras igual de esperadas.
- Rescata Etiquetas (lab): Hit, Pop, Fresco, Olvidado, Culto, Clásico, Invaluable → crítica (V19).
- Rescata Ceremonias: Entrega animada con sobre y discurso → premios (V19).

### V20 · Franquicias, TV y streaming

**Construye:** Personajes con ficha, siete caminos de continuación, crossovers, registro y adquisición de franquicias y derivados; TV completa con canal propio y parrilla; streaming con planes, catálogo y licencias

**Lista cuando:** Una franquicia pasa por cine, serie y plataforma propia

**En el plan anterior (v1) eran:** V23, V24 y V25.

**Qué más leer:** Datos: no hace falta adjuntarlos; las listas de TV ya están en el juego desde la V17.

**Diseño de referencia**

#### 8. Franquicias

- **Decide:** continuar, en qué forma y medio, unir universos, vender o comprar.
- **Arriesga:** fatiga del público, rechazo del elenco original y el valor de la marca.
- **Funciona:**
    - Toda obra nace como franquicia, con canon editable que se ramifica en continuidades y una línea fija por fecha de estreno (ya existe en la V15).
    - Botón Continuación con siete caminos: secuela, precuela, spin-off, historia paralela, remake, soft reboot y reboot; en el mismo medio o como derivado en otro.
    - Personajes con ficha y popularidad propia: al continuar, el juego llama al elenco original; si alguien rechaza, la ficha del personaje queda para el nuevo casting.
    - Licencias por personaje y productos derivados canon o no canon (cómics, mangas, juegos, juguetes).
    - Crossovers que unen canons y se pueden separar; lo hecho en conjunto queda en ambas.
    - Venta y compra de franquicias y de derechos de obras sueltas del canon; ofertas de rivales.
    - Biografía de la franquicia con calidad, hype y nivel de clásico inmortal; la mente maestra de una franquicia (un productor que la guía).

#### 10. Televisión

- **Decide:** formato, episodios, piloto, sala de guionistas, en qué canal emitir, franjas, renovar o cancelar.
- **Arriesga:** una temporada floja, el horario equivocado o un patrocinador que se va.
- **Funciona:**
    - Formatos por época: temporadas largas de 22 a 26 episodios, telenovelas diarias de más de 100 capítulos, miniseries y temporadas cortas de streaming; de 2 a 300 episodios por temporada y de 5 a 180 minutos por episodio, como en tu documento.
    - Episódica o serializada; sala de guionistas con costo por episodio; 2 o 3 tramas por episodio con nota propia; piloto antes de pedir la temporada.
    - Series y telenovelas dentro de la misma franquicia; renovar crea la siguiente temporada.
    - Canal propio desde su época, con parrilla de siete días por franjas, botón Autocompletar, horario familiar con multa por clasificación, público visible por grupos, frescura de lo repetido, patrocinadores con metas, tema del canal y noticias que dan bonos temporales.
    - Al terminar una serie eliges dónde se emite: tu canal, el cable de un rival o streaming, cada uno con sus estadísticas.

#### 11. Streaming y licencias

- **Decide:** lanzar o comprar una plataforma, precios, catálogo y qué licenciar.
- **Arriesga:** costos de servidores, catálogo flojo y exclusivas caras.
- **Funciona:**
    - Plataforma propia (cuando la historia lo permite) con tres planes: con anuncios, estándar y premium; suscriptores, costos de servidores e ingresos reales.
    - Catálogo propio, comprado y licenciado: licencias exclusivas, globales o temporales; extender contratos; propuestas de ida y vuelta (“Negociar licencias de contenido para proyección”).
    - Capacidad de la biblioteca con costo de almacenamiento; las bóvedas de la infraestructura la aumentan.
    - Regalías del catálogo año a año y la bóveda para reestrenos.

**Funciones del Inventario (46)**

*Mundo, tiempo, población e inflación*

- Noticias que se compran y vencen, con bono temporal (ETV)

*Creación de obras*

- Presentar la idea (pitch) (BOS2)
- Comprar derechos de obras y franquicias existentes (Txt, Doc · en la V15: Parcial)

*Talentos*

- Datos del talento guardados en la ficha de la obra para el nuevo casting (Txt)
- Mente maestra de franquicia: un productor que la guía (Txt)

*Producción*

- Pilotos para series y conceptos de prueba (MGT2, FST)

*Lanzamiento, ventanas y métricas*

- Series: audiencias (Resp)
- Licencia a una plataforma ajena si no tienes la tuya; streaming en vistas (Resp · en la V15: Parcial)

*Crítica, etiquetas y franquicias*

- Toda obra nace como franquicia (V15 · en la V15: Sí)
- Canon editable con continuidades y línea por fecha de estreno (V15 · en la V15: Sí)
- Siete caminos de continuación: secuela, precuela, spin-off, paralela, remake, soft reboot, reboot (Txt, V15 · en la V15: Sí)
- Derivados en otro medio: cómic, manga, juego, serie (Txt · en la V15: Parcial)
- Personajes con ficha y popularidad propia (Doc)
- Llamar al elenco original; si rechaza, la ficha queda para el nuevo casting (Txt)
- Licencias por personaje y productos canon o no canon (Txt, Doc)
- Crossovers y fusión de franquicias (Txt, V15 · en la V15: Sí)
- Compra y venta de franquicias; ofertas de rivales (Txt, V15 · en la V15: Parcial)
- Comercio de derechos de obras sueltas (MGT2)
- Biografía de la franquicia con calidad, hype y nivel de clásico (Txt · en la V15: Parcial)
- Fatiga del público con la franquicia (Prop)
- Series y telenovelas dentro de la franquicia (Txt)
- Registrar una franquicia desde una obra propia (nombre y género central) (R7)
- Pestaña Adquisición: derechos de rivales, libros de tu editorial y dominio público (R7)

*Televisión y streaming*

- Formatos de TV por época: temporadas largas, telenovelas, miniseries, temporadas cortas (Doc, Txt · en la V15: Parcial)
- De 2 a 300 episodios por temporada y de 5 a 180 minutos por episodio (Doc)
- Episódica o serializada (FST)
- Sala de guionistas con costo por episodio (FST)
- Dos o tres tramas por episodio con nota propia (FST)
- Renovar o cancelar temporadas (FST)
- Programas en vivo, noticieros, concursos y realities (Doc · en la V15: Parcial)
- Canal propio con parrilla de siete días por franjas (ETV · en la V15: Parcial (4 franjas))
- Botón Autocompletar de la parrilla (ETV)
- Horario familiar con multa por clasificación (ETV)
- Público visible por grupos (ETV)
- Frescura de lo repetido (ETV)
- Patrocinadores con metas (ETV)
- Tema del canal (ETV)
- Elegir dónde se emite: tu canal, el cable de un rival o streaming (Resp)
- Plataforma propia con tres planes: con anuncios, estándar y premium (Doc · en la V15: Parcial (un precio))
- Suscriptores, costos de servidores e ingresos (Doc · en la V15: Parcial)
- Catálogo propio, comprado y licenciado, con capacidad de biblioteca (ETV)
- Licencias exclusivas, globales o temporales; extender contratos (ETV, Doc · en la V15: Parcial)
- Reabastecer contenido con líneas de suministro (ETV)
- Mercado negro de contenido (ETV)
- Estreno de series semanal o con la temporada completa (streaming) (R7)

*Música, videojuegos, teatro y libros*

- Cómics y mangas derivados de tus películas (Txt · entra en V20 y V22)

**De la V15**

- Rescata Canon (frG, cnPut, xoJ, xoS, tlL, tlD): Franquicias, continuidades, crossovers y línea de tiempo dibujada → franquicias (V20).

### V21 · Mundo vivo y negocio

**Construye:** Rivales con estrategia, ranking y cuota de mercado; historia viva con cada evento en su día; sede por niveles, construcciones, sedes, filiales, banco, cuentas por pagar, socio, junta, quiebra y cambio de marca

**Lista cuando:** El bot juega 150 años con rivales que crecen y quiebran y con eventos en cada década

**En el plan anterior (v1) eran:** V26, V27 y V28.

**Qué más leer:** Datos: Cronología real y Eras de ficción; completa el día exacto de cada hito con fuentes.

**Diseño de referencia**

#### 13. Negocio e imperio

- **Decide:** en qué invertir, qué construir, dónde abrir sedes, a quién comprar, cuánto endeudarte.
- **Arriesga:** deudas, filiales que pierden dinero, investigaciones antimonopolio y burbujas.
- **Funciona:**
    - Finanzas mes a mes por categoría (taquilla, video, licencias, streaming, derechos, producción, personal, pagos de deuda) y estados anuales; préstamos e impuestos.
    - Infraestructura: las 30 construcciones de tu documento, cada una con un efecto distinto y su época; el edificio crece piso a piso y los terrenos se llenan de sets.
    - Sedes en otros países con costos y talentos locales; cines propios y cadenas.
    - Comprar estudios con límite antimonopolio; filiales con costo mensual y voluntad propia.
    - Colaboraciones, coproducciones, encargos de ida y vuelta, financiar proyectos ajenos (el salvavidas económico), contratos exclusivos de distribución y comercio de derechos.
    - Inversiones en compañías, merchandising, tiendas para fans, parques, eventos y convenciones.
    - Investigación de tecnología propia (los 50 inventos y los del futuro) que los rivales pueden licenciarte; fans y cartas de fans; personal de oficina con un efecto cada uno.

#### 14. Rivales y mundo vivo

- **Decide:** competir, aliarte, comprar o esquivar.
- **Arriesga:** que un rival te robe la fecha, la estrella o la franquicia.
- **Funciona:**
    - Estudios rivales con identidad, sede, especialidad y estrategia, que tienen obras, franquicias y talentos reales dentro del mundo, eligen fechas a propósito, compran, venden, colaboran y quiebran de verdad.
    - Estudios emergentes que nacen con el tiempo (por ejemplo, dibujantes de cómic que pasan a la animación 3D).
    - Ranking de estudios con estrellas de 1 a 5, cartelera semanal real y taquilla del año y de todos los tiempos.
    - Unos 80 eventos con decisiones: escándalos, quejas del elenco, propuestas de talentos y productores, fans que piden secuelas, huelgas, crisis y momentos históricos.
    - Bitácora del estudio y del avatar con mini decisiones, al estilo de BitLife.

**Funciones del Inventario (58)**

*Inicio, modos y avatar*

- Quiebra con tres salidas: terminar, rescate o socio (Resp)
- Socio que toma parte del control y opina en lo grande (Resp)
- Medidor de paciencia de la junta o del socio (R7)
- Cambiar la marca a mitad de partida (nombre, logo y avatar), con costo y un bajón temporal de fans (R7)

*Mundo, tiempo, población e inflación*

- Historia real de 1850 a 2026 sin personas reales (Txt, Resp · en la V15: Parcial (19 hitos))
- Ficción de 2026 a 2150 basada en predicciones (Resp)
- Eventos generados después de 2150 (Resp)
- Censura de época (Código Hays, 1934 a 1968) (Prop)
- Fallo antimonopolio de 1948 (Prop)
- Crisis, auges y recesiones (V15, Txt · en la V15: Parcial)
- Guerras, pandemias y huelgas como eventos (Txt)
- Piratería por época (MGT2 · entra en V21 y V22)
- Tecnologías e inventos: los 50 del documento y los del futuro (Doc · en la V15: Parcial (9))
- Eventos históricos e inventos en su día exacto (Txt)

*Creación de obras*

- Ideas que proponen los talentos y productores (Txt)
- Dilema de la IA con costo, calidad y reputación (Txt · en la V15: Parcial)

*Talentos*

- Los talentos trabajan también para los rivales (Txt)

*Producción*

- Captura de movimiento y tecnologías del futuro (Prop)

*Negocio e imperio*

- Edificio que crece piso a piso y terrenos con sets (Resp, FST, MGT2 · entra en V16 (base) y V21)
- Sede por niveles, del cuarto pequeño al complejo: tope de personal, gasto fijo y descripción con humor (R7 · entra en V16 y V21)
- Cines propios y cadenas (BOS2, V15 · en la V15: Sí · entra en V19 y V21)
- Comprar estudios con límite antimonopolio (Txt · en la V15: Parcial)
- Finanzas mes a mes por categoría (FST, Doc · en la V15: Parcial)
- Año fiscal y estados anuales (FST · en la V15: Parcial (balance anual))
- Préstamos e impuestos (Doc · en la V15: Parcial)
- Las 30 construcciones del documento, cada una con efecto propio y su época (Doc · en la V15: Parcial (10))
- Departamentos de animación y gráficos propios (Txt)
- Sedes en otros países con costos y talentos locales (Txt)
- Filiales con costo mensual y voluntad propia (Prop)
- Colaboraciones y coproducciones (Txt · en la V15: Parcial)
- Encargos de ida y vuelta (Doc · en la V15: Parcial (solo recibir))
- Financiar proyectos ajenos (MGT2)
- Contratos exclusivos de distribución (MGT2)
- Inversiones en compañías (Doc · en la V15: Sí)
- Merchandising y tiendas para fans (Txt · en la V15: Parcial)
- Parques temáticos (Txt)
- Eventos y convenciones propios, como negocio (Txt, V15 · en la V15: Parcial)
- Investigación de tecnología propia, que los rivales pueden licenciarte (Doc, MGT2 · en la V15: Parcial (9 inventos))
- Fans del estudio y comunidad (MGT2)
- Edificios futuros visibles y bloqueados, con la pista para desbloquearlos (R7)
- Banco por escalones de prestigio con puntaje de crédito (R7)
- Empezar con una deuda semilla, según la región y la dificultad (R7)
- Cuentas por pagar con pago automático (R7)

*Rivales y mundo vivo*

- Estudios rivales con identidad, sede, especialidad y estrategia (Txt · en la V15: Parcial (8 nombres))
- Obras, franquicias y talentos de los rivales dentro del mundo (Txt)
- Rivales que eligen fechas a propósito (Prop)
- Compran, venden, colaboran y quiebran según su gestión (Txt · en la V15: Parcial)
- Estudios emergentes que nacen con el tiempo (Txt)
- Ofertas de productores y de rivales (Txt · en la V15: Parcial)
- Fusiones (Prop)
- Ranking de estudios con estrellas de 1 a 5 (FST)
- Taquilla del año y de todos los tiempos (BOS · en la V15: Parcial)
- Unos 80 eventos con decisiones (Prop, V15 · en la V15: Parcial (5))
- Escándalos, quejas del elenco y huelgas (Prop)
- Fans que piden secuelas (V15)
- Bitácora del estudio con mini decisiones (BL)
- Ranking de estudios ordenable (patrimonio, ingresos, obras, calificación y prestigio), con filtros y tarjetas de líder, más prolífico y mejor calidad (R7)
- Cuota de mercado por estudio, con majors concentradas como en la historia (R7, Prop)

**De la V15**

- Corrige el fallo 4 (alta): Cartelera rival calculada con el año y la semana. Efecto: Nadie te quita público de verdad.
- Corrige el fallo 5 (alta): Rivales comprables desde la primera semana con renta fija. Efecto: Inversión sin riesgo del 10,4 % anual.
- Corrige el fallo 8 (alta): Final de partida fácil. Efecto: Decenas de miles de millones sin nada importante en qué gastarlos.
- Corrige el fallo 25 (media): Negocio mide 6.500 px en el celular. Efecto: Página eterna.
- Corrige el fallo 28 (media): Solo 5 tipos de eventos, que se repiten. Efecto: Mundo poco vivo.
- Corrige el fallo 29 (media): Los rivales no tienen obras ni franquicias propias. Efecto: Competencia invisible.
- Corrige el fallo 30 (media): El estudio no crece a la vista. Efecto: Poca recompensa visual.
- Corrige el fallo 32 (media): Quiebra automática tras 12 semanas en rojo. Efecto: Sin rescate ni socio.
- Corrige el fallo 33 (baja): La IA solo resta calidad. Efecto: Tu documento pide que dependa del equipo.
- Corrige el fallo 35 (baja): Partes del documento sin hacer: marketing por edades, comprar propuestas y franquicias, personajes, elenco con nombres, 3 planes de streaming, 41 inventos y 20 infraestructuras. Efecto: Diseño incompleto.

### V22 · Música, juegos, teatro y libros

**Construye:** Los cuatro medios con sus formatos, plataformas, giras, ediciones, portadas y métricas

**Lista cuando:** Los seis medios conviven en una partida del bot

**En el plan anterior (v1) eran:** V30, V31 y V32.

**Qué más leer:** Datos: no hace falta adjuntarlos; las listas de estos medios ya están en el juego desde la V17.

**Diseño de referencia**

#### 12. Música, videojuegos, teatro y libros

- **Decide:** formato y tamaño, plataformas, ediciones, giras, traducciones.
- **Arriesga:** apostar por una plataforma o formato que muere, giras caras, bandas que se separan.
- **Funciona:**
    - Música: álbumes de estudio, EP, LP, dobles, digitales, sencillos, jingles y bandas sonoras; bandas con relación, contrato de banda o solista, separación y reunión; conciertos, giras y práctica; portada descrita y dibujada por el juego; ventas en vinilo, casete, CD, descargas y streams; certificaciones y regalías.
    - Videojuegos: tipos y géneros, hasta cuatro plataformas con cuota de mercado, motores propios que los rivales licencian, kits de desarrollo, idiomas, antipiratería, ediciones, paquetes, contenido descargable, gratuito con compras o suscripción según la época, arcade y móviles, soporte después del lanzamiento.
    - Teatro: temporadas en sala, funciones, ocupación y giras; obra grabada para TV o streaming.
    - Libros: novela, cómic, manga y novela gráfica; tapas, tamaños, audiolibro, imprenta propia y traducciones.
    - Cada medio con sus premios del documento.

**Funciones del Inventario (22)**

*Mundo, tiempo, población e inflación*

- Piratería por época (MGT2 · entra en V21 y V22)

*Lanzamiento, ventanas y métricas*

- Música: copias físicas, descargas, reproducciones y vistas (Resp · en la V15: Parcial)
- Videojuegos: copias físicas y digitales en tiendas de juegos (Resp · en la V15: Parcial)
- Teatro: taquilla y entradas; libros: copias (Resp · en la V15: Parcial)

*Música, videojuegos, teatro y libros*

- Cómics y mangas derivados de tus películas (Txt · entra en V20 y V22)
- Música: álbum de estudio, EP, LP, doble, digital, sencillo, jingle y banda sonora (Doc · en la V15: Parcial)
- Bandas con relación, contrato, separación y reunión (BL)
- Conciertos, giras y práctica (BL)
- Portada descrita y dibujada por el juego (BL, Prop)
- Formatos: vinilo, casete, CD, descargas y streaming (Resp)
- Reproducciones y vistas en plataformas de música y de video (Resp)
- Videojuegos: tipos y géneros; hasta cuatro plataformas con cuota de mercado (MGT2, Doc · en la V15: Parcial)
- Motores propios con funciones y estrellas, que los rivales licencian (MGT2)
- Kits de desarrollo, idiomas y antipiratería (MGT2)
- Ediciones, paquetes, contenido descargable, gratuito con compras y suscripción (MGT2)
- Tiendas digitales con ventas y jugadores (Resp)
- Soporte después del lanzamiento (MGT2)
- Arcade y móviles (MGT2)
- Teatro: temporadas, funciones, ocupación, giras y obra grabada para TV o streaming (Doc · en la V15: Parcial)
- Libros: novela, cómic, manga y novela gráfica; tapas, tamaños, audiolibro y traducciones (Doc, Txt · en la V15: Parcial)
- Imprenta propia (Doc)

*Interfaz, metas y técnica*

- Portadas de álbum, cajas de juego, carteles de teatro y tapas de libro (Prop)

### V23 · Metas, modos y editor

**Construye:** Campaña, Libre y Personalizado, dificultades con Pesadilla, logros, misiones, consejos y tutorial; Editor Sandbox y paquetes

**Lista cuando:** Todas las funciones del plan existen y se pueden usar

**En el plan anterior (v1) eran:** V33 y el Editor de la V34.

**Qué más leer:** Datos: no hace falta adjuntarlos.

**Diseño de referencia**

#### 15. Metas, editor y comunidad

- **Decide:** qué reto perseguir y qué contenido propio agregar.
- **Funciona:**
    - Campaña por décadas con legado, logros con nombres divertidos, misiones secundarias con fecha límite y retos de final de partida (ranking, legado, imperio, dinastía).
    - Editor Sandbox: franquicias, obras, personajes, precios, talentos y estudios; paquetes que se importan y exportan como archivo.
    - Tutorial jugable que desbloquea las pantallas poco a poco y ayuda “i” en cada pantalla.

**Funciones del Inventario (13)**

*Inicio, modos y avatar*

- Modos Campaña, Libre y Personalizado (Resp · en la V15: Parcial (campaña))
- Dificultades Fácil, Normal, Difícil y Experto, que se desbloquea al ganar (Resp, ETV · en la V15: Parcial)
- Retos de final de partida: ranking, legado, imperio y dinastía (Resp)
- Créditos finales y resumen de la carrera (V15 · en la V15: Sí)
- Dificultad Pesadilla por encima de Experto y textos con humor en cada dificultad (R7)

*Televisión y streaming*

- Correos con misiones y fecha límite (ETV)

*Interfaz, metas y técnica*

- Tutorial jugable que desbloquea pantallas poco a poco (V15, Prop)
- Logros con nombres divertidos (ETV)
- Misiones y metas secundarias (Resp)
- Música de fondo opcional (Prop)
- Editor Sandbox: franquicias, obras, personajes, talentos, estudios y precios (Resp)
- Paquetes del Editor que se importan y exportan (Prop)
- Consejos del momento según lo que pasa en la partida (R7)

**De la V15**

- Corrige el fallo 8 (alta): Final de partida fácil. Efecto: Decenas de miles de millones sin nada importante en qué gastarlos.
- Corrige el fallo 13 (alta): Sin tutorial y con 7 pestañas desde el inicio. Efecto: Cuesta empezar.
- Rescata Campaña, hitos y créditos finales: Metas por década y cierre → metas (V23).

### Fase 2 · Prueba libre

No es un chat de programación: OneZero juega con hasta 5 partidas y anota todo en una lista. Los arreglos pequeños se piden en chats cortos (V23b, V23c…) con el prompt de cambios del Kit: aplicar solo la lista, prueba de humo y 3 líneas de resumen.

### V24 · Balance

**Hace:** Bot completo de 1900 y de 2000 a 2150 con tres estrategias, metas de balance, economía y dificultades

**Lista cuando:** El bot cumple todas las metas de balance

No agregues funciones nuevas en esta versión.

#### Metas de balance

El bot comprueba estas metas en la V24 (balance); la V16 programa las fórmulas tal cual y, mientras se construye, solo se vigila que nada se rompa. Son decisiones de diseño, no datos reales.

| Indicador (dificultad Normal) | Meta |
|---|---|
| Multiplicador mediano de una película (bruto ÷ costo) | ×1,5 a ×2,5 |
| Obras que superan ×5 | 5 % o menos |
| Obras que pierden dinero | 30 % a 45 % |
| Crecimiento real de la caja de un estudio bien llevado | 5 % a 20 % al año, en dólares de hoy |
| Premios principales ganados por el jugador | 30 % o menos |
| Años para pasar de independiente a major | 15 a 30 |
| Cuota de mercado del jugador sin investigación | menos del 35 % |

#### Frenos contra el dinero infinito

1. Mercado finito: población, acceso y frecuencia de cada época.
2. Competencia real con rivales que eligen fechas.
3. Rendimientos decrecientes del presupuesto y del marketing.
4. Fatiga de franquicias y de géneros saturados.
5. Estrellas que cobran más después de cada éxito.
6. Gastos fijos que crecen con el tamaño.
7. Impuesto sobre utilidades.
8. Antimonopolio: con más del 35 % de un mercado se abre una investigación que puede obligarte a vender, como el fallo de 1948 contra los grandes estudios ([fuente](https://www.history.com/this-day-in-history/may-3/u-s-supreme-court-decides-paramount-antitrust-case)).
9. Crisis económicas y tecnologías que cambian el negocio.
10. Retos de final de partida que piden legado, no solo dinero.

#### Bot

- Tres estrategias (prudente, normal, agresiva), desde 1900 y desde 2000 hasta 2150, con semillas fijas; informe con metas, errores, tiempo por semana y tamaño del guardado.
- Los atributos de la Taxonomía (público, temporada, costo) son una propuesta inicial: ajústalos aquí si el bot lo pide.

### V25 · Interfaz y rendimiento

**Hace:** Celular vertical y horizontal, PC, accesibilidad, arte final y capturas; presupuesto de rendimiento en el Infinix

**Lista cuando:** Capturas revisadas y metas de rendimiento cumplidas

No agregues funciones nuevas en esta versión.

#### Presupuesto de rendimiento

| Medida | Meta | Referencia V15 |
|---|---|---|
| Abrir el juego en el Infinix Note 40 | menos de 2 s | — |
| Avanzar una semana | menos de 30 ms | — |
| Simular un año | menos de 1,5 s | 100 años en 7 s en el PC de pruebas |
| Guardado tras 150 años de partida | menos de 2 MB comprimido | 1,64 MB sin comprimir tras 100 años, con un mundo mucho más simple |
| Memoria | menos de 200 MB | — |
| Tamaño del archivo | menos de 1,5 MB | 181 KB |

#### Principios de interfaz

- Una pantalla, una decisión principal; cada tarjeta abre una ficha deslizable (en celular) o un panel lateral (en PC y horizontal).
- Modo rápido y modo detallado en todo lo que se crea; botón “recomendado”.
- Ayuda “i” en cada pantalla, como en Box Office Sim.
- Nada depende de pasar el mouse: todo se abre tocando o manteniendo presionado.
- Listas con filtros, búsqueda y “solo lo que sirve”, sin páginas eternas; totales en vivo antes de confirmar.
- Botones de 44 px o más y texto de 14 px o más.
- Vertical u horizontal, a elección; en horizontal y en PC, menú lateral y dos columnas.
- Guardado automático, sin avisos de “cambios sin guardar”. Nada de pantallas «Próximamente»: lo que no existe todavía no se muestra.

#### Compatibilidad

- Android y iOS con la envoltura Capacitor 8: Android 7.0 o superior e iOS 15 o superior. Capacitor 7 bajaría a Android 6.0 e iOS 14; se decide en la V27.
- Google Play exige apuntar a Android 16 (API 36) para publicar o actualizar desde el 31 de agosto de 2026, con prórroga posible hasta el 1 de noviembre; eso no impide funcionar en versiones viejas.
- PC: el mismo HTML abre en cualquier navegador; después, una envoltura de escritorio. Consolas: piden kits y licencias de cada fabricante, fuera de la 1.0.
- Pantallas desde 360 px de ancho, vertical u horizontal, táctil, mouse y atajos de teclado en PC.

#### Capturas

- Cada pantalla en 390×844 (celular vertical), 844×390 (celular horizontal) y 1366×768 (PC).

**Funciones del Inventario (1)**

*Interfaz, metas y técnica*

- Accesibilidad: tamaño de texto, daltonismo, menos animación (Prop · entra en V16 y V25)

### V26 · Errores e inglés

**Hace:** Los errores de las bitácoras y de tu lista, por gravedad; detalles finales; inglés completo

**Lista cuando:** Cero errores graves conocidos y el juego entero en inglés

No agregues funciones nuevas en esta versión.

- Corrige por orden de gravedad todos los «Errores conocidos» de las bitácoras y la lista de OneZero.
- Pruebas de reglas: clasificación, dominio público, regla del Erótico, inflación, población y fechas del calendario contra los Datos.
- Traduce el diccionario completo al inglés, con selector de idioma; ningún texto queda fuera del diccionario.

**Funciones del Inventario (1)**

*Interfaz, metas y técnica*

- Inglés (Resp)

### V27 · 1.0

**Hace:** Envoltura Android, anuncio de entrada, gratis o de pago, ficha de la tienda y prueba cerrada de 12 personas por 14 días

**Lista cuando:** Publicado en Google Play

#### 16. Publicación y monetización

- **Funciona:**
    - Android con Capacitor 8 (Android 7.0 o superior); la app debe apuntar a Android 16 (API 36) para Google Play, lo que no impide funcionar en versiones viejas.
    - Cuenta de desarrollador y prueba cerrada con 12 personas durante 14 días antes de publicar.
    - Un solo anuncio al abrir; la versión gratuita con restricciones o de pago completa se decide en la V27. Si hay compras dentro de la app, se verifican con el sistema de pagos de Google, porque existen herramientas que intentan saltarse las compras.
    - La tienda clasificará el juego 16+ o 18+ por sus temas; ninguna imagen ni texto será explícito, porque Google Play no permite contenido pensado para la gratificación sexual.

#### Empaquetar en la nube

- Para Google Play, el HTML se envuelve en una app de Android con Capacitor (que también permite el anuncio de entrada) y se genera un archivo .aab firmado.
- **Desde tu PC:** hay que instalar Node.js, Java y Android Studio (varios GB) y correr comandos. Se puede, pero son muchos pasos para quien no programa, y una actualización del PC puede romperlo.
- **En la nube (recomendado):** una cuenta gratuita de GitHub con un repositorio privado del juego. El chat de la V27 escribe la receta de construcción; cada vez que subes el HTML nuevo, GitHub arma el .aab solo y lo descargas. No instalas nada, y el plan gratuito alcanza de sobra.
- **De paso:** el mismo repositorio puede publicar gratis la versión web para jugar desde el navegador.
- **Lo que haces tú:** crear las cuentas (GitHub y Google Play Console), guardar la llave de firma en un lugar seguro fuera de GitHub y subir el .aab a la consola. Esas cuentas y esa llave son solo tuyas.

#### Créditos y firma

- **En los créditos del juego:** “Ideado y creado por OneZero” y, debajo, una línea como “Programado junto a Claude, de Anthropic”. Si quieres el chiste, “con Claude, su amigo programador” también funciona ahí. La idea, el diseño y las decisiones son tuyas.
- **En la tienda:** el nombre de desarrollador debe ser el tuyo o una marca de estudio que inventes, y la app se llama INDUSTRY ART. Mejor no poner “Claude” en el nombre del desarrollador ni de la app: es una marca de Anthropic y podría parecer un producto oficial, algo que Google Play revisa.

**Funciones del Inventario (3)**

*Interfaz, metas y técnica*

- Un solo anuncio al abrir (Txt)
- Versión gratuita y de pago, por decidir (Resp)
- Editor como compra dentro de la app, por decidir (BOS2)

## 6. Bitácora corta

Cada versión termina con este archivo de 40 líneas o menos.

```
# Bitácora VXX · <nombre>
Fecha:

## Qué se hizo (por sistema, en palabras simples)
-

## Decisiones nuevas (¿cambia el Registro? sí/no)
-

## Guardado
- Versión del guardado: N; migración desde: N-1

## Prueba de humo
- Abre sin errores: sí/no · Partida nueva: sí/no · Bot de 10 años: sí/no · Guardar y cargar: sí/no

## Errores conocidos (para la V24 a la V26)
-

## Qué probar en el celular (3 cosas)
-

## Para la próxima versión
-
```
