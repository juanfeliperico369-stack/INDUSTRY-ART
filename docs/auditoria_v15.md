# Auditoría de INDUSTRY ART V15

Fecha: 5 de octubre de 2026 · Archivo revisado: `legado/INDUSTRY_ART_v15.html` (180.744 bytes, 590 líneas).
Las líneas citadas ("L…") son de `legado/v15/v15_legible.js`.

## Resumen

1. La V15 no se cae: 6.880 clics automáticos en todas las pestañas y ventanas, y partidas de bot de 1850 a 2150 y de 2026 a 2150, sin un solo error de JavaScript ni números rotos (NaN).
2. El dinero se dispara por una vía que el plan no menciona: los rivales pagan un porcentaje de todo lo que has ganado en la vida. Aceptar solo las propuestas gratis llevó la caja de $1,88 B a $6.449 B en 10 años.
3. Hay 26 errores nuevos. Los más graves: el guardado falla sin avisar y "Continuar" carga una partida vieja; al escribir "2.500" la franquicia se vende por $3; un nombre de jugador con código HTML se ejecuta; y la obra vendida sigue cobrando taquilla.
4. Comprobé con medidas propias 24 de los 35 fallos del plan: 22 se confirman, 1 a medias y 1 no se reproduce (sí hay guía al empezar).
5. Lo que más pesa es el guardado: 3 MB a los 100 años (el 66 % son textos de premios que no se muestran), cada "+1 sem" guarda todo (0,66 s en un celular lento simulado) y después de unos 150 años ya no cabe.

## Cómo se probó

- Chromium sin pantalla (Playwright) abriendo el archivo directo, con teléfono vertical 390×844, horizontal 844×390 y PC 1366×768. Se registraron todos los errores y avisos de la consola.
- Una persona simulada jugó 120 semanas: creó películas, videojuegos, teatro, música y libros, los estrenó, se postuló a festivales y cerró ceremonias, eventos y balances.
- Un "mono" pulsó todos los botones de las 7 pestañas y de las ventanas a las que se llega desde ellas (hasta 3 niveles), y cambió cada lista y deslizador. Fueron 4.036 clics empezando en 2000 y 2.844 empezando en 1850.
- Un bot igual al del plan (una película cada 6 semanas) jugó 100 años desde 1900, 300 años desde 1850 y 124 años desde 2026. Buscó NaN cada año y midió tiempos y tamaño del guardado. Para imitar un celular lento como el Infinix, se frenó el procesador 4 y 6 veces.
- Casos límite: caja en cero o negativa, quiebra, ranuras llenas, exportar e importar, nombres larguísimos y nombres con código HTML.

## Errores encontrados

### A. NUEVOS (no están en la lista de 35 del plan)

| # | Gravedad | Dónde | Qué pasa (evidencia) | Cómo lo evita la V16 |
|---|---|---|---|---|
| N1 | Alta | `col()` L1891-1913; aceptar `act("cla")` L6757 | Las propuestas de rivales pagan `(200.000 + 5 % de S.rev)`, y S.rev son los ingresos acumulados de toda la partida. Las de distribución y encargo no piden inversión. En 1925, con $2,47 B en caja, un "encargo" ofrecía **$20,67 B (797 % de la caja)**. Diez años aceptando solo las gratis: caja de **$1,88 B → $6.448,71 B** (sin aceptarlas: $1,88 B). Es un acelerador que se alimenta a sí mismo. | Los contratos pagan según el mercado (personas y obras), nunca según lo ya ganado; tienen tope y riesgo. |
| N2 | Alta | `LS.s/LS.g` L30-59, `sv` L68, guardar L7003 | Si el guardado no cabe (unos 5,2 millones de caracteres en Chromium), solo avisa la primera vez. La segunda vez dice "Guardado en ranura 2", pero la ranura queda vacía: solo vivía en memoria y se pierde al cerrar. El autoguardado también falla callado: en la partida desde 1850, el "auto" se quedó en el año 2000 mientras el juego iba en 2050, y "Continuar" habría cargado una partida 50 años más vieja. | Guardado en IndexedDB comprimido, que relee lo escrito para confirmarlo y avisa siempre que falla. |
| N3 | Alta | Vender franquicia `act("frq")` L6437-6455 (L6445) | El precio escrito se limpia con `replace(/[^0-9.]/g,"")`. **"2.500" vende por $3**, "1,5M" por $15 y "1.000.000" da NaN, así que usa el precio del deslizador sin avisar. El rival acepta casi siempre (95 %): una franquicia valorada en $6,6 M terminó vendida por $3. | Campo numérico con el formato de Colombia y una confirmación que muestra el precio entendido. |
| N4 | Alta | `sm()` L3515-3518 y L3546 | **XSS (se ejecuta código de otro):** el nombre del jugador entra sin limpiar en la lista de errores del asistente. Pasos: jugador `<img src=x onerror=...>`, luego Academia → Matricularme, luego Nuevo proyecto → elegirse como Director, y el código se ejecuta (`window.__xss=1`). Con un código de partida compartido le puede pasar a otra persona. Todo lo demás sí se limpia (probé nombres de estudio, obra y franquicia con HTML en todas las pantallas). | HTML escapado en todo, o `textContent`. |
| N5 | Media | `sale()` L2859-2868, `step` L3129, oferta de rival `act("fra")` L6456 | Vender la franquicia no detiene la taquilla. Vendida en la semana 2 de 8, la obra siguió cobrando **$3,70 M** las 6 semanas siguientes, además del precio de venta. La oferta de un rival (`fra`) ni siquiera exige que las obras estén estrenadas: una secuela en rodaje queda "vendida" pero se estrena y cobra igual. | Un solo estado de derechos por obra: al vender, el ingreso futuro pasa al comprador. |
| N6 | Media | Licencias `act("ls")` L6578-6600 | La licencia exclusiva no bloquea la no exclusiva: la misma semana se cobraron exclusiva $3,32 M y no exclusiva $1,21 M. La no exclusiva se repite cada año para siempre (8 % del bruto, sin bajar). | Contratos con exclusividad real y un valor que baja con los años. |
| N7 | Media | `eduS` L3620, `sz` L1777, `thc/agf` L1778-1779, cines en `step` L3139-3145 | Precios e ingresos atados a S.rev (lo ganado en la vida). Un taller de 4 semanas costaba $2,02 M en 1905 y **$124,84 M** en 1925. Un cine propio en EE. UU. pasaba de $13,2 K a $140,9 K por semana sin hacer nada. | Precios por época (IPC) y por mercado. |
| N8 | Media | Eventos L2016-2059, `dec()` L2463 | Con la caja en negativo, los costos "−X % de caja" **dan dinero**: con −$1 M, "Negociar (−1 % de caja)" deja −$990 K. El bono de década del 3 % se vuelve negativo: −$150 K con −$5 M. | Costos en cantidades fijas positivas; el bono nunca baja de 0. |
| N9 | Media | Evento "Una promesa sin agente" L2096-2116 | Cobra un salario fijo sin revisar la caja. En 1850 con $500, la opción resaltada deja la caja en **−$74.964** y llega la quiebra justo 12 semanas después, sin salida posible. | Revisar si alcanza el dinero; salarios según la época. |
| N10 | Media | Reestrenar `act("rr")` L6958-6985 y `close()` L2869-2898 | Reestrenar es gratis y **borra el bruto original** ($1,68 B → $1,17 B), que también cuenta en estadísticas, valor de la franquicia y licencias. Además vuelve a correr `close()`: suma otra vez $1,17 B a la taquilla de los talentos, da +1 de habilidad (si la crítica es 75 o más) y más fans. | El reestreno es una ventana nueva, con su propio registro y su costo. |
| N11 | Media | Premios L3062-3063, L3082, L3088 | El historial de premios nunca se recorta. A los 100 años hay 13.858 entradas en `S.ah` y solo se muestran 10. Con los textos de premios dentro de cada obra (851 KB), es **el 66 % del guardado** (3,05 MB). | Registro compacto con números en vez de textos, recortado. |
| N12 | Media | `adv` L3216; cambio de app L7180; exportar L6628 | Cada clic de "+1 sem" guarda la partida completa. A los 100 años son 66 ms en PC, 284 ms con el procesador 4 veces más lento y **664 ms** con 6 veces. Exportar tarda 1,7 / 4,8 / 5,7 s y da un texto de 4,18 millones de caracteres para copiar a mano. | Guardado en segundo plano y por partes; archivo .iasave. |
| N13 | Media | Asistente `wz()` L3484-3488 | Cada cargo solo ofrece los **14 talentos de más habilidad** (más tú): en 1925 eran 14 de 237 activos. No se puede contratar a alguien más barato o joven. | Lista con búsqueda y filtros; tarifas de mercado. |
| N14 | Baja | `frOf()` L4690-4700 desde `mon()` | La búsqueda mensual de ofertas por franquicias recorre todas las obras. En una partida de 200 años (1.734 obras) es cerca del 50 % del tiempo de simulación (mon 21 %, frEst 16 %, frV 13,5 %). En PC todavía tarda poco (33 ms por año), pero crece mucho con el catálogo. | Índices por franquicia. |
| N15 | Baja | Talentos `vT()` L5445 | Dice "227 talentos activos con estos filtros" pero solo muestra 30, sin botón "ver más". | Paginación o lista virtual. |
| N16 | Baja | `step` L3175-3176 | Tu personaje envejece y nunca se retira: tiene **330 años** en 2150 (empezando en 1850). | Vida, legado y sucesor. |
| N17 | Baja | Contrato `act("ct")` L6873-6882 y `step` L3182-3185 | Si firmas un contrato exclusivo en la semana 52, pagas el salario dos veces en una semana: $225.886 al firmar y $219.042 al pasar a la semana 1. | Salario semanal prorrateado. |
| N18 | Baja | `hit()` L2323; Comic-Con L2005 y L6612 | Mínimo fijo de $10.000 sin importar la época ni el capital. En 1850, con $328 en caja, el hito del primer estreno da +$10.000 (30 veces la caja). | Montos según la época. |
| N19 | Baja | `awards()` L3044-3053 | Los títulos inventados de los nominados salen sin concordancia: "Frontera eterno", "Aurora secreto", "Cenizas imposible". La cartelera sí usa `agr()`. | Los nominados son obras reales del mundo. |
| N20 | Baja | `adv` L3221-3224 | Solo muestra 6 ceremonias por avance y descarta el resto. En la semana 25 hubo 18 a la vez, y se perdieron 24 en 3 años. | Resumen de premios con todas las ceremonias. |
| N21 | Baja | `adv` L3226; `act("evo")` L6545; eventos L2056-2066 | Un evento que sale a mitad de "Avanzar 52" se responde al final, y su efecto cae sobre lo que esté en cartelera en ese momento: puedes pagar el 0,5 % de la caja por promocionar una obra que ya salió. | Un evento detiene el avance. |
| N22 | Baja | `lp()` L1498-1504 | La animación del encabezado se redibuja 30 veces por segundo para siempre, aunque la tape una ventana: 91 redibujos en 3 s con la guía abierta. Gasta batería. | Animar solo lo visible, con opción de reducir. |
| N23 | Baja | `fm()` L8-21 | Bordes del formato de dinero: `fm(999999)` = "$1000.0K", `fm(999999999)` = "$1000.00M"; `fm(NaN)` = "$NaN". | Redondear a la unidad siguiente; protección contra NaN. |
| N24 | Baja | Nuevo proyecto L7070; nuevo juego L3261 | No hay límite para el largo de los nombres. Un nombre de 160 letras sin espacios hace que toda la página se corra de lado (1.495 a 1.815 px de ancho en un celular de 390 px). | Límite de largo y corte de palabras. |
| N25 | Baja | `vE()` L3336 | "Ganancias totales" muestra S.rev, que son los ingresos: nunca resta los costos. | Mostrar ingresos y utilidad por separado. |
| N26 | Baja | `act("seq")` L6911, `"fs"` L6899, `"cbt"` L6735 | Código muerto: tres acciones que ningún botón usa (versiones viejas de continuación, venta de franquicia y cable). | Reescritura por módulos. |

### B. CONFIRMADOS de la lista del plan (muestra de 24 de 35)

| # plan | Gravedad | Dónde | Evidencia propia | Cómo lo evita la V16 |
|---|---|---|---|---|
| 1 | Alta | `rel()` L2851 | La taquilla sale de `P.cost × m`. Con el bot: $1 M en 1900 → **$916 M** en 1908 (el plan decía $857 M). | Ingresos salen de personas, con cuota semanal. |
| 2 | Alta | `fee()` L1346-1357 | Director con habilidad 81 y sin rasgo: cobra $90 con presupuesto de $500, $179,8 K con $1 M y $17,98 M con $100 M. | Tarifa según mercado y fama. |
| 4 | Alta | `top5()` L2165-2182; `cmp()` L1938 | En la semana 1 de una partida nueva, la "Cartelera de la semana" ya muestra 4 títulos rivales inventados con unos $40 K cada uno, sacados de la fecha. | Rivales que estrenan obras reales en la misma cartelera. |
| 5 | Alta | `act("buy")` L7147-7153 | "Sol Naciente" comprado en la semana 1 de 1900 por $569.300; rinde $1.138,6 por semana (**10,4 %** al año) fijo. | Valuación y renta de mercado. |
| 6 | Alta | `awards()` L3005-3104 | Jugando a mano: 45 premios de 66 nominaciones en 2,3 años con 9 obras. Bot: 2.771 premios en 100 años. | Nominados reales, meta de 30 % o menos. |
| 7 | Alta | `sv` L68 | Sin compresión: **3,05 MB a los 100 años**, 4,39 MB a los 150 y 5,92 MB a los 200 (ya no cabe). Ver N2 y N11. | IndexedDB comprimido. |
| 9 | Alta | `wz()` L3470 | El asistente mide **3.016 px** de alto en 390×844. | Modo rápido y fichas. |
| 10 | Alta | CSS `.c .b{min-height:40px}`, `.ch` | 259 de 390 controles miden menos de 44 px (ver Mediciones). Causa: la regla `.c .b` baja los botones a 40 px y los deslizadores miden 16 px. | Mínimo de 44 px. |
| 11 | Alta (parcial) | `nw()` L3261 | No reproduje 60 px. En 844×390, "Nuevo juego" deja 190 px útiles (el encabezado fijo mide 200 px); en juego quedan 333 px, y 279 px en Negocio. | Diseño horizontal propio. |
| 13 | Alta (no se reproduce) | `st()` L3297, `hint()` L2492 | Al empezar sí sale la ventana "Cómo jugar", y una tarjeta de "Siguiente paso" acompaña 130 semanas. Lo que sí es cierto: las 7 pestañas están abiertas desde el inicio. | Ayuda "i" y metas. |
| 14 | Media | L3 `R = Math.random` | Azar sin semilla en 38 llamadas a `R()`. Ni siquiera se puede fijar desde afuera, porque `R` se guarda al cargar. | Azar con semilla. |
| 15 | Media | `popu()` L1298 | 2.144 M personas en 1900; fija en **11.755 M** desde 2060 hasta 2150. | Población real por región. |
| 16 | Media | `WK` L260 | Todas las obras: 34 %, 22 %, 15 %, 10 %, 7 %, 5 %, 4 %, 3 % en 8 semanas. | Boca a boca por obra. |
| 17 | Media | `awards()` L3044-3053 | Siempre agrega 5 rellenos con puntaje `48 + R()×38` (ver N19). | Nominados reales. |
| 18 | Media | `step` L3150-3153 | Una caja quieta pierde **3,01 % al año** (0,06 % por semana). | 25 % sobre utilidades. |
| 19 | Media | `sal()` L1506 | `3e4 × (habilidad/50)^3`: el mismo monto en 1900 que en 2050. | Salarios con IPC. |
| 20 | Media | `step` L3186 | Retiro desde los 55 años: `R() < (edad−54)×0,06`. | Carreras de 70 a 100 años. |
| 21 | Media | L2305, L3428, L3488, L3724 | `S.tl[72]` es "tú", fijo en 4 lugares. | Jugador con su propia identidad. |
| 22 | Media | `mtM()` texto y datos PD | Dice "50 años tras la muerte del autor" (Stevenson murió en 1894 → libre en 1944). | Vida + 70. |
| 24 | Media | CSS `.m{font-size:13px}`, menú 11 px | 391 textos de menos de 14 px en las 7 pestañas y el asistente. En los dibujos hay textos de 8 a 10 px. | Mínimo 14 px. |
| 25 | Media | `vN()` L1649 | Negocio mide **7.304 px** al empezar y 7.862 px tras 30 semanas. | 5 secciones con fichas. |
| 26 | Media | CSS `#app{max-width:760px}` | En 1366×768 el contenido usa 760 px (56 % del ancho). | Menú lateral en PC. |
| 32 | Media | `step` L3202-3203, `adv` L3206 | Quiebra a las 12 semanas en rojo (caso N9). Después, "+1 sem" no hace nada y no avisa por qué. | Rescate y socio. |
| 34 | Baja | `NI` L256 | Los íconos del menú son emojis. | Íconos dibujados. |

## Mediciones

| Medida | Valor |
|---|---|
| Errores de JavaScript | 0 en 6.880 clics automáticos, 120 semanas jugadas a mano y bots de 300 y 124 años (desde 1850 y desde 2026); 0 NaN |
| Paso semanal (`step`) en PC | 0,09 ms (año 1) · 0,23-0,30 ms (25 años) · 0,43-0,46 ms (100 años) |
| Paso semanal con procesador ×6 más lento | 4,6 ms (100 años) · con ×4: 9,9 ms (300 años) |
| Año simulado (52 pasos) en PC | 3 ms (año 1) · 23-30 ms (100 años) · 33 ms (200 años, 1.734 obras) |
| Año simulado con procesador ×4 | 132 ms (100 años) · 400 ms (200 años) · 602 ms (300 años) |
| Clic "+1 sem" (paso + guardado + dibujo), 100 años | 66 ms PC · 284 ms (×4) · 664 ms (×6) |
| Autoguardado, 100 años | 68 ms PC · 407 ms (×4) · 502 ms (×6) |
| Exportar / importar código, 100 años | 1,7 s / 0,11 s en PC · 5,7 s / 0,72 s con ×6; código de 4,18 millones de caracteres |
| Guardado (caracteres ≈ bytes) | 46 KB (1 año) · 0,78 MB (25) · 1,54 MB (50) · **3,05 MB (100)** · 3,79 MB (2026→2150) · 4,39 MB (150) · 8,95 MB (300). Nota: mi bot se postula a todos los festivales, por eso hay más premios que en el bot del plan (1,64 MB) |
| Qué ocupa el guardado a los 100 años | Obras 48 % (851 KB son textos de premios) · historial de premios 38 % (13.858 entradas, se muestran 10) · talentos 6 % (919, 626 retirados) · franquicias 4 % · química 3 % |
| Límite del navegador | Unos 5,2 millones de caracteres en total: caben el "auto" y una ranura hasta unos 2,6 MB cada uno |
| Controles de menos de 44 px (390×844) | Estudio 6/17 · Proyectos 2/15 · Talentos 89/135 · Industria 18/29 · Negocio 77/88 · Fechas 0/11 · Más 12/24 · Asistente 55/71 → **259 de 390** |
| Textos de menos de 14 px (390×844) | Estudio 35 · Proyectos 9 · Talentos 129 · Industria 28 · Negocio 83 · Fechas 33 · Más 30 · Asistente 44 (13 px; menú 11 px) |
| Alto de página (390×844) | Estudio 2.984 · Talentos 6.211 · Negocio 7.304 · Asistente 3.016 px |
| Espacio útil en horizontal (844×390) | 190 px en Nuevo juego · 333 px en juego · 279 px en Negocio |
| Animación del encabezado | 30 redibujos por segundo, también detrás de las ventanas |

## Lo que funciona bien y conviene rescatar

- **Estabilidad:** ningún error en miles de clics ni en 300 años de partida. La lógica de obras, franquicias, academia y premios no se rompe.
- **Escapado casi completo:** existe `esc()` (L27) y se usa en casi todo; solo falla en N4. Hay un único detector de clics para toda la página (L7173) y no se acumulan detectores.
- **Generador con semilla ya hecho:** `mb()` (L5008, mulberry32) sirve de base para el azar con semilla de la V16.
- **Rendimiento de la simulación:** el paso semanal ya cumple las metas de la V16 (semana < 30 ms, año < 1,5 s), incluso con el procesador 6 veces más lento. Lo que hay que rehacer es el guardado.
- **Arte por código con caché limitada:** pósters, retratos, logo, fachada y mapa; la caché de pósters tiene tope de 320.
- **Conceptos para portar:** canon de franquicias con línea de tiempo dibujada, crossovers, academia, ceremonias animadas, campaña por décadas, hitos y concordancia de títulos `agr()`.
- **La idea del respaldo en memoria** (`LS`, L30-59) es buena, pero la V16 debe confirmar que lo guardado quedó escrito (ver N2).

Pruebas reproducibles: los guiones (Playwright) quedaron en la carpeta temporal de la sesión: `bot.js`, `edge1-5.js`, `monkey.js`, `long2.js`, `perf2.js` y `prof.js`.
