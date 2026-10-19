# Bitácora V37 · sesión 1 de 6

Base: «INDUSTRY ART Definitiva». No se quitó ninguna función. `INDUSTRY_ART_v37.html` es un archivo único: se edita directo, sin pasar por `src/`.

## Calendario y agenda
- La Agenda tiene dos modos: **Año completo** (el de entrada) y **Próximos**. El año completo muestra las 52 semanas por estación y por mes, cada uno con su multiplicador del documento (invierno ×1, primavera ×3, verano ×9, otoño ×8; enero ×2 … diciembre ×8), y todos sus eventos con semanas, fechas, región y efecto. Al tocar un evento se abre su día. ‹ › cambian de año.
- Festividades con las semanas, los multiplicadores y los géneros del documento: Año Nuevo, San Valentín, Carnaval, Fashion Week de Milán, París y Nueva York, Día de la mujer, Pascua, Día del libro, Día de la tierra, Día de los trabajadores, Día de la memoria, Día del Orgullo Humano, Días de independencia, Pop days, Festividades folklóricas, Burning Man, Día de la paz, Oktoberfest, Diwali, Halloween / Comic Con, Acción de Gracias y Navidad.
- Los premios llevan los nombres del documento: Independent Award, Bastard Awards, Music Awards, Premio de la Academia, Premios Pulitzer / Editorial Book Award, Premios Tony internacional de Broadway, Pop Awards, Emmy Shows Awards y The Game Award. Se muestran sus fases: nominados y ganadores; en el Festival Mundial del Arte, postulaciones, nominados, ganadores y subastas.
- Los festivales regionales llevan los nombres de las sedes del documento: MexAriel, FICCI, Gramado, El Gouna, Lagos · FESPACO, TIFF, BIFF, Film Sydney, New Zealand Awards y Guinea Awards.
- En la recaudación: la temporada mezcla la curva real con los multiplicadores del documento (con el desfase de 26 semanas en el hemisferio sur), y cada festividad suma según su multiplicador (de todo proyecto o solo de los géneros que nombra).

## Crear obra
- Selector de **Medio** dentro de Crear obra (cine, series, teatro, música, libros, videojuegos), en modo rápido, en modo detallado y en el creador de los demás medios. El título y el material adaptado se conservan al cambiar.

## Material y licencias
- Las 142 obras históricas tienen ahora sus géneros reales, una sinopsis, sus personajes y su fama, que fija el precio de la licencia. Los materiales que ya tenías con licencia toman esos personajes y esa sinopsis.
- Botón **Adaptar** en «Tus materiales y derechos».

## Cines
- Toda cadena (la tuya o la de la competencia) se puede **comprar**: sale de tu caja libre, sus salas y su parte valen para todas tus obras sin pagar cuota, también cobras de las obras ajenas que se exhiben en ella, y su mantenimiento es el 2 % de su valor al año. Se puede vender por el 75 % de su valor. Los contratos siguen como estaban.

## Talento y avatar
- «Editar tu avatar» cambia nombre, sexo, edad, país, oficio, **cuatro especialidades** y el aspecto. Las partidas viejas se completan solas hasta tener cuatro especialidades.
- Con el Editor Sandbox, el editor de talento desbloquea oficio, país, edad, rasgo, «brilla en» y «le cuesta», y suma un **tercer y un cuarto oficio**.
- Al elegir a alguien para el equipo o el reparto: aparecen todos los disponibles (también quienes tienen ese oficio como secundario), con buscador, orden (mejor para el papel, habilidad, fama, el más barato, afinidad, el más joven), filtros (solo ese oficio, tus exclusivos) y «Ver 30 más». Tu avatar aparece siempre, marcado si trabaja fuera de su oficio. Cada persona muestra cuánto rinde en ese papel.

## Verificación
`node --check` del script y una partida del bot de 1960 a 2030 en Chromium, recorriendo cada pantalla nueva: sin errores.

# Sesión 2 de 6 · Premios, búsqueda y estadísticas

## Premios según el documento
- **Premio de la Academia** (solo películas): las 12 categorías en el orden del documento: productor, fotografía, editor, compositor, diseñador de arte y tecnología, escritor, director, actor y actriz de reparto, actriz, actor y película (más obra animada). Separa protagonistas de reparto según el papel de cada intérprete.
- **Emmy Shows Awards** (semana 40, solo series y programas): nueva gala con sus 12 categorías, entre ellas «Mejor director invitado» y «Mejor programa».
- **Independent Award**: categorías completas y solo para obras de bajo presupuesto. **Bastard Awards**: solo obras con crítica por debajo de 50, con peor escritor, director, actriz, actor y película.
- **Fase de nominados**: una semana antes de cada gala salen los 5 nominados por categoría (noticia y «Premios en vivo»); la semana de la gala se anuncian los ganadores con esos mismos nominados.
- **Music Awards, Tony, Pulitzer / Editorial Book Award y The Game Award**: se entregan en su semana del calendario (6, 24, 14 y 52), con las categorías del documento por talento (escritor, diseñador, compositor, director, intérpretes, productor…), 5 nominados y 1 ganador. Los premios suben la fama del talento ganador.
- **Festivales por región** con los premios y jurados del documento, agrupados en sus Awards: Olímpicos (Palma de Oro, León de Oro, Oso de Oro), The Western Hollywood (Golden Block, Crystal Block, Ariel de Oro), América (Estrella de Mar, Mujer Dorada, Kikito de Oro), Eden Fespaco (Monolito Estrella, Estrella de Mar de Oro, Semental de Yennenga), Everest Bollywood (Tokyo Grand Prix, Cáliz de Oro, Copa Caballo de Oro) y Sydney (Sydney Film Prize, The Sign Maori, Volcán de Guinea).
- **Mundo › Premios** tiene tres pestañas: **Premios en vivo** (nominados o ganadores de la semana y cuánto falta para la próxima gala), **Historial de premios** (una barra por premiación: los 13 Awards del documento más Tony, Pulitzer, el Festival Mundial y los nacionales, año por año, con nominados y ganador) y **Vitrina y campañas**.

## Estudio
- **Estadísticas**: nombre, visión, industria y público objetivo; lanzamientos, ganancias totales y caja; premios ganados y nominaciones por premiación; proyecto de mayor y menor ingreso, más caro y más barato, mejor y peor valorado; cuántos hicieron ×2, ×3, ×4 y ×5; Indie, Mediano y Blockbuster; y proyectos por medio.
- **Buscar personas y obras**: por personas (nombre, overall y costo mínimos y máximos, género, talento, activos o retirados, orden por nombre, overall, popularidad, costo o éxitos, de mejor a peor o al revés) y por proyecto (nombre, género o subgénero, tema, arco, argumento, review, taquilla, costo total y años de lanzamiento, con orden). Cada resultado abre su ficha.

## Verificación
`node --check` y una partida automática de 1960 a 2030 en Chromium, recorriendo las pantallas nuevas y las de la sesión 1: sin errores.

# Sesión 3 de 6 · Ficción hasta 2300

El juego cubre seis siglos (1700–2300). La historia real llega a 2026; desde ahí todo es ficción coherente con las eras que ya existían (IA, inmersión, clima y megaciudades, interfaces neuronales, era orbital, colonias, siglo interplanetario y Archivo de la humanidad).

## Historia del arte inventada (2027–2300)
- **56 obras de ficción** con fecha, autor, géneros, sinopsis, personajes y fama: «Eco de cristal», «La casa de los relojes», «Ciudad Raíz», «Lo que siente la piel», «Gravedad cero», «Yo también firmo», «Polvo rojo», «Arena y cielo», «Cuerpos de luz», «Tres soles», «Luz de vela», «Seiscientos años»… Aparecen en Mundo › Historia › Hitos del arte cuando la partida llega a su año y **se pueden licenciar y adaptar** como material.
- **39 artistas inventados** (directores, escritores, músicos, diseñadores e intérpretes, humanos y sintéticos como Nova-7 y Lyra) que se pueden crear como talentos históricos cuando están en edad de trabajar.
- **14 corrientes** (autoría declarada, ecorrealismo, sensorialismo, arte posthumano, onirismo, western marciano, analogismo…) y **17 momentos** del arte.

## Historia del mundo inventada
- **96 sucesos nuevos** de 2028 a 2297 (ya son 142 después de 2026), muchos con efecto en las modas de los géneros.
- **9 periodos nuevos** que afectan el mercado: huelga de animadores, apagón europeo, puertos inundados, boom del cine africano, clasificación sensorial con cortes, huelga de actores humanos, Olimpiadas lunares, fiebre marciana y tormenta solar. Todos los periodos tienen ya su nombre en «Ahora mismo».
- Cronología, tecnologías y motor del mercado llegan a 2300; la era «Futuro» se divide en seis eras con sus reglas para empezar partida.

## Lo jugable del futuro
- **Se puede empezar en 2125, 2150, 2175, 2200, 2225 y 2250** (antes, hasta 2100). El calendario va de 1700 a 2300 y la población, con sus escenarios, hasta 2300.
- **Tipos de película nuevos**: cine sensorial (2090), rodaje orbital (2100), sueño compartido (2183), holograma sólido (2198) y realidad total (2240).
- **Plataformas de juego** que ya no terminan en 2150: lentes con pantalla, holomesa, cápsula de sueño compartido, red interplanetaria y realidad total; y dimensiones de juego holográfica y realidad total.
- Formato de video **Holocápsula** (2120); **8 críticos nuevos** hasta 2300; estilos neuroestético, holográfico y analógico; épocas «Siglo XXI», «Siglo XXII» y «Siglo XXIII» para obras de época; subgéneros marciano, orbital, posthumano y sueño compartido con sus modas; corrientes futuras para cine, televisión, teatro, música, videojuegos y libros.
- Arreglo: un videojuego cuya dimensión necesita una plataforma (neuronal, holográfica, realidad total) ya la suma sola al crearse.

## Verificación
`node --check` y partidas automáticas en Chromium de 1960 a 2030, de 2026 a 2100, de 2150 a 2230 y de 2250 a 2300, recorriendo calendario, premios, historia, estadísticas, población, catálogo y creación de obras: sin errores.
