/* ==== módulo: puntos ==== */
// Puntos «i»: cada nota que explica una mecánica se guarda detrás de un botón «i». Al tocarlo se abre ahí mismo
// con su explicación y un dato histórico real del tema (sin personas vivas ni marcas).
// Las notas que muestran datos de la partida (cifras, fechas, contratos) siguen a la vista.
ART.puntos = (function () {
  'use strict';
  const N = ART.n, U = ART.ui;
  // [palabras clave (expresión regular sobre la nota), sección de respaldo, dato]
  const DATOS = [
    // Del teatro del siglo XVIII al micromecenazgo: lo que pocos saben de cada arte
    ["derechos|dominio público|\\bautor|reimprim|copia", "obras", "En 1710 Gran Bretaña aprobó la primera ley de derechos de autor: protegía cada libro nuevo por 14 años, renovables por otros 14 si el autor seguía vivo."],
    ["teatro|función|funciones|ópera|musical|obra de teatro", "obras", "En 1728 se estrenó en Londres «La ópera del mendigo», con canciones populares en vez de arias en italiano; sumó 62 funciones en su primera temporada, un récord para la época."],
    ["cantante|exclusiv|solo para ti|salario|estrella", "talento", "En 1737 Farinelli, el cantante más famoso de Europa, dejó los escenarios y pasó más de veinte años en la corte de España, donde al principio cantaba cada noche solo para el rey."],
    ["derechos|regalía|porcentaje|\\bautor|cobra", "negocio", "En 1777 el dramaturgo Beaumarchais reunió a los autores de teatro de París para exigir una parte de lo que dejaba cada función: así nació la primera sociedad de autores."],
    ["novela|entregas?\\b|folletín|suscrip|periódico|diario", "obras", "En 1836 un diario de París bajó a la mitad el precio de su suscripción y empezó a publicar novelas por capítulos para ganar lectores: así nació la novela de folletín."],
    ["\\bluz|luces|ilumina|escenario|foco|fama", "estudio", "La luz de calcio llegó a los teatros en 1837 y alumbraba con un foco intenso al actor principal; de ahí viene la expresión inglesa «in the limelight»: estar en el centro de atención."],
    ["parque|atracci|tienda|visitantes|recuerdos|museo", "estudio", "En 1843 abrió en Copenhague un jardín de diversiones con conciertos, cafés y un carrusel; sigue abierto y es uno de los parques de atracciones más antiguos del mundo."],
    ["terror|crimen|barat|novela|entregas?\\b", "obras", "En la Inglaterra del siglo XIX, los «penny dreadfuls» vendían historias de crimen y terror a un penique la entrega; de uno de 1846 salió el barbero asesino Sweeney Todd."],
    ["cartel|póster|afiche|publicidad|campaña|letrero", "estudio", "Hacia 1870 la litografía a color llenó París de carteles de teatro, cabaret y espectáculos; el cartelista Jules Chéret firmó más de mil."],
    ["secuela|continúa|continua|saga|personaje|fans|franquicia|fatiga", "obras", "En 1893 su autor hizo morir a Sherlock Holmes; unos 20.000 lectores cancelaron su suscripción a la revista que lo publicaba, y en 1903 el detective volvió."],
    ["estudio|plató|construc|edificio|terreno", "estudio", "En 1893 se terminó en Nueva Jersey el primer estudio de cine: una cabaña negra con techo que se abría, montada sobre un riel para girar siguiendo al sol."],
    ["libro|más vendid|ventas|tirada|reimprim", "mundo", "La primera lista de libros más vendidos la publicó una revista literaria de Nueva York en 1895; las listas semanales de los grandes diarios llegaron en los años 30."],
    ["india|canción|canciones|musical|región|regiones", "mundo", "La India estrenó su primer largometraje en 1913 y su primera película sonora en 1931, con siete canciones: desde entonces la música es el alma de su cine."],
    ["animación|animad|dibujante|largometraje|argentin", "obras", "En 1917 se estrenó en Buenos Aires «El apóstol», el primer largometraje animado del mundo, hecho con figuras de cartón recortado; hoy no se conserva ninguna copia."],
    ["escuela|academia|estudiar|beca|formación|aprend|potencial", "talento", "La primera escuela de cine del mundo se fundó en Moscú en 1919; como faltaba película virgen, sus alumnos ensayaban «películas sin película», actuadas en vivo."],
    ["distribu|independiente|socio|productora|rival", "negocio", "En 1919 cuatro grandes figuras del cine mudo fundaron su propia distribuidora para no depender de los estudios; un rival comentó: «Los locos tomaron el manicomio»."],
    ["huelga|sindicato|teatro|sueldo|salario", "talento", "En 1919 los actores de teatro de Nueva York hicieron huelga durante un mes: cerraron decenas de obras en ocho ciudades y lograron que los empresarios reconocieran su sindicato."],
    ["canción|canciones|sencillo|disco|duración|minutos", "obras", "Los discos de 78 revoluciones guardaban unos tres minutos por lado; por eso, durante décadas, las canciones populares se escribieron para durar más o menos eso."],
    ["patrocin|anuncio|publicidad|radio|telenovela|emisi", "negocio", "Las «soap operas» se llaman así porque en los años 30 los fabricantes de jabón patrocinaban los dramas de radio de la tarde, pensados para quienes estaban en casa."],
    ["logo|letrero|marca|fachada|identidad", "estudio", "Los logotipos de los estudios ya aparecían en el cine mudo; con el sonido, en los años 30, sumaron fanfarrias y rugidos que el público aprendió a reconocer."],
    ["argentin|tango|región|regiones|países|sonora", "mundo", "En 1933 se estrenó «¡Tango!», una de las primeras películas sonoras de Argentina; con el tango como gancho, el cine argentino se vendió en toda Hispanoamérica."],
    ["méxico|mexican|región|regiones|países|idioma", "mundo", "Hacia 1936 una comedia ranchera con canciones abrió la época de oro del cine mexicano, que durante dos décadas llenó de películas las salas de Hispanoamérica."],
    ["cómic|historieta|superhéroe|derechos|personaje|licencia", "talento", "En 1938 dos jóvenes de Cleveland vendieron por 130 dólares, junto con su primera historieta, los derechos de un superhéroe con capa que se volvió un negocio millonario."],
    ["ranking|éxitos?\\b|sencillo|más vendid|cartelera|popular", "mundo", "En 1940 una revista del espectáculo empezó a publicar cada semana los discos más vendidos en las tiendas de Estados Unidos; la lista de los cien sencillos más populares nació en 1958."],
    ["contrato|exclusiv|suspen|juicio|demanda", "talento", "En 1944 la actriz Olivia de Havilland le ganó un juicio a su estudio: desde entonces, los contratos de siete años ya no pudieron alargarse sumando el tiempo de las suspensiones."],
    ["lista negra|política|despid|censura|guionista|veto|acusa", "talento", "Desde 1947 la lista negra de Hollywood dejó sin trabajo a cientos de guionistas, actores y directores acusados de comunistas; algunos siguieron escribiendo con nombres falsos."],
    ["porcentaje|ganancia|sueldo|salario|tarifa|negocia", "talento", "En 1950 el actor James Stewart cambió su sueldo por la mitad de las ganancias de un western y ganó mucho más: así empezó la era de los porcentajes para las estrellas."],
    ["festival|premio|selección|subasta", "mundo", "El festival de cine de Berlín se celebró por primera vez en 1951, en una ciudad dividida y todavía marcada por la guerra."],
    ["doblaje|idioma|región|regiones|países|voces|traduc", "negocio", "Desde los años 50 buena parte del doblaje para América Latina se hizo en México, con un español «neutro» pensado para entenderse en todos los países."],
    ["telenovela|capítulo|episodio|serie|novela", "obras", "La televisión de Brasil estrenó su primera telenovela en 1951 y la de México en 1958; con los años el género se volvió una de las grandes exportaciones de América Latina."],
    ["manga|historieta|cómic|revista|semanal|tomo", "obras", "En 1959 salieron en Japón las primeras revistas semanales de manga para chicos; las historias de éxito pasaban luego a tomos recopilatorios y a series animadas."],
    ["huelga|sindicato|residual|regalía|reestreno|emisi|pases", "talento", "En 1960 una huelga de actores de cine consiguió los «residuales»: un pago extra cada vez que sus películas nuevas se emitían en televisión."],
    ["anime|animación|animad|serie|presupuesto|reusa", "estudio", "En 1963 la televisión japonesa estrenó su primera serie animada semanal de media hora; para cumplir plazos y presupuesto, se reusaban dibujos y se animaba menos."],
    ["festival|concierto|gira|en vivo|música", "mundo", "En agosto de 1969 un festival de música en una granja del estado de Nueva York reunió a unas 400.000 personas durante tres días de lluvia y barro."],
    ["formato|video|cinta|estándar|compet", "negocio", "A mediados de los años 70 dos formatos de video casero se disputaron el mercado; ganó el que grababa más horas por cinta, aunque el otro tenía mejor imagen."],
    ["platino|diamante|certifica|ventas|millón|copias|disco", "negocio", "La certificación de disco de platino, por un millón de álbumes vendidos en Estados Unidos, se creó en 1976; la de diamante, por diez millones, llegó en 1999."],
    ["juguete|derivados|mercancía|licencia|franquicia|tienda|personajes", "negocio", "En 1977 los juguetes de una película de ciencia ficción no alcanzaron a fabricarse para Navidad: se vendió una caja con un vale para recibir los muñecos meses después."],
    ["multijugador|internet|en red|servidor|videojuego", "obras", "Hacia 1978 dos estudiantes de una universidad inglesa crearon uno de los primeros mundos de aventura compartidos, solo de texto; su nombre, MUD, bautizó a todo un género."],
    ["video musical|videoclip|canal|música|canción", "negocio", "En 1981 nació en Estados Unidos un canal que pasaba videos musicales todo el día; el primero que emitió se llamaba «El video mató a la estrella de la radio»."],
    ["preventa|ventanas|adelanta|banco|préstamo|garantía|financia", "negocio", "En los años 80 muchos productores independientes vendían por adelantado los derechos de cada país y, con esos contratos como garantía, el banco les prestaba el resto."],
    ["huelga|guionista|guion|sindicato|temporada", "talento", "La huelga de guionistas de 1988 en Estados Unidos duró 153 días, la más larga de su historia, y retrasó el inicio de la temporada de televisión de otoño."],
    ["nigeria|áfrica|bajo presupuesto|industria|región|regiones", "mundo", "En 1992 un drama nigeriano grabado en video y vendido en cintas abrió el auge de Nollywood, hoy una de las industrias que más películas hacen en el mundo."],
    ["motor|licencia|tecnología|invento|videojuego", "estudio", "A mediados de los años 90 los estudios empezaron a vender licencias de sus motores de juego; otros estudios armaban sus juegos sobre ellos en vez de empezar de cero."],
    ["dvd|video|catálogo|bóveda|edición|remasteriz|reestreno", "estudio", "El DVD salió a la venta en Japón a fines de 1996 y en Estados Unidos en 1997; en pocos años, sus ediciones especiales de películas viejas hicieron valiosísimo el catálogo de los estudios."],
    ["móvil|celular|teléfono|portátil|bolsillo", "obras", "En 1997 un teléfono celular traía de fábrica un juego de una serpiente que crece al comer; fue uno de los primeros juegos para móviles y llegó a cientos de millones de aparatos."],
    ["mp3|reproductor|reproducción|descarga|digital|escucha", "obras", "En 1998 salieron los primeros reproductores portátiles de MP3, sin piezas móviles; en pocos años la música de un estante entero cabía en un bolsillo."],
    ["corea|\\bolas?\\b|asia|export|internacional", "mundo", "A fines de los años 90 la prensa china llamó «ola coreana» al éxito de las series y la música de Corea del Sur en Asia; luego esa ola llegó al resto del mundo."],
    ["piratería|compartir|descarga|ilegal|copia|canción", "negocio", "En 1999 un programa para compartir canciones entre usuarios llegó a decenas de millones de personas en dos años; un fallo judicial lo hizo cerrar en 2001."],
    ["libro digital|ebook|lector|digital|libro", "obras", "Hacia 2007 se popularizaron los lectores de libros electrónicos con tinta electrónica, que se leen como papel, gastan poca batería y descargan libros sin cables."],
    ["micromecenazgo|fans pagan|por adelantado|recompensa|mecenas|aporte", "negocio", "Hacia 2009 abrieron las grandes plataformas de micromecenazgo, donde el público financia una obra antes de que exista a cambio de recompensas y de verla primero."],
    ['letrero|logo|fachada', 'estudio', 'El letrero de Hollywood se levantó en 1923 como anuncio de una urbanización y decía «Hollywoodland»; las últimas cuatro letras se quitaron en 1949.'],
    ['radio|emisi', 'negocio', 'En los años 30 la radio llevó la música a millones de casas; las disqueras temían que nadie volviera a comprar discos, y con los años la radio se volvió su mejor vitrina.'],
    ['reproducci|escucha|descarga|plataforma de música|vistas', 'negocio', 'Hacia 2016 la escucha en línea superó a las descargas; paga a los artistas una fracción de centavo por reproducción.'],
    ['disco|copias|certifica|oro', 'negocio', 'El primer disco de oro certificado de la industria se entregó en 1958, por un millón de dólares en ventas.'],
    ['financia|mecenas|aporte|inversor|socio', 'negocio', 'En los siglos XVII y XVIII casi todo el arte vivía de mecenas: nobles, reyes e iglesias pagaban a cambio de dedicatorias y funciones privadas.'],
    ['taller|idea|logline|documento|guion', 'obras', 'La palabra «logline» viene de los registros de los estudios, donde cada guion se resumía en una sola frase para decidir si se leía entero.'],
    ['material|derechos|licencia|dominio público', 'obras', 'Una obra entra al dominio público cuando vencen los derechos de autor; en muchos países, setenta años después de la muerte de quien la escribió.'],
    ['canal|parrilla|franja|horario', 'obras', 'La primera parrilla regular de televisión empezó en Londres en 1936, con apenas unas horas de programas al día.'],
    ['cine|película|estreno|taquilla', 'obras', 'El 28 de diciembre de 1895, en París, se cobró por primera vez una entrada para ver cine proyectado.'],
    ['taquilla|entrada|salas?\\b|cines?\\b', 'negocio', 'Hacia 1905 abrieron en Norteamérica los nickelodeones, salas que cobraban cinco centavos; en pocos años eran miles.'],
    ['sonido|sonora|música|banda sonora', 'obras', 'En 1927 llegó el cine con diálogos sincronizados; en apenas tres años casi todas las salas se adaptaron al sonido.'],
    ['color|fotografía|formato', 'obras', 'El color de tres tiras se estrenó en un corto animado en 1932 y en un largometraje en 1935.'],
    ['premio|gala|votación', 'mundo', 'La primera gran entrega de premios del cine norteamericano, en 1929, duró unos quince minutos.'],
    ['festival', 'mundo', 'El primer festival de cine del mundo se celebró en Venecia en 1932.'],
    ['clasificación|censura|erótic|adultos|menores', 'obras', 'De 1934 a 1968 un código de producción decidió qué se podía mostrar en el cine de Estados Unidos; en 1968 lo reemplazó la clasificación por edades.'],
    ['antimonopolio|major|mercado', 'negocio', 'En 1948 un fallo antimonopolio obligó a los grandes estudios de Estados Unidos a vender sus cadenas de cines.'],
    ['pantalla|televisión|tv\\b', 'obras', 'En 1953 la pantalla ancha llegó a los cines para competir con la televisión, que vaciaba las salas.'],
    ['marketing|campaña|lanzamiento|anunciar|expectativa', 'obras', 'En 1975 un estreno de verano en cientos de salas a la vez, con anuncios en televisión, cambió para siempre la forma de lanzar películas.'],
    ['animación|animad|efectos|cgi|computadora', 'obras', 'En 1995 se estrenó el primer largometraje hecho por completo en computadora; para dibujarlo trabajaron más de cien máquinas a la vez.'],
    ['animación|animad|dibujante', 'obras', 'En 1937 se estrenó en Estados Unidos el primer largometraje animado con sonido y color.'],
    ['video|ventana|catálogo|reestreno', 'obras', 'El video casero llegó a fines de los años 70: por primera vez una película seguía ganando dinero después de salir de los cines.'],
    ['streaming|plataforma|suscripción|digital', 'negocio', 'En 2007 empezó el streaming de películas por suscripción para el gran público.'],
    ['avance|tráiler|campaña', 'obras', 'El primer avance de una obra se proyectó en un cine en 1913, después de la película principal; por eso en inglés se llama «trailer».'],
    ['doblaje|idioma|región|regiones|países', 'negocio', 'Con el cine sonoro, a principios de los años 30, nació el doblaje: las películas empezaron a hablar el idioma de cada país.'],
    ['fama|estrella|talento|actor|actriz|reparto', 'talento', 'Hacia 1910 los estudios empezaron a anunciar el nombre de sus actores; antes el público no sabía cómo se llamaban.'],
    ['exclusiv|contrato', 'talento', 'En los años 30 y 40 muchos actores firmaban contratos de siete años con un solo estudio, que decidía en qué obras trabajaban.'],
    ['estudio|plató|backlot|construc|piso', 'estudio', 'En 1911 abrió el primer estudio de cine en Hollywood; el sol de California permitía filmar casi todo el año.'],
    ['película|formato|35', 'obras', 'En 1909 la película de 35 mm se volvió el estándar del cine, y lo siguió siendo casi un siglo.'],
    ['archivo|bóveda|guardar|clásico', 'estudio', 'Hasta 1951 el cine se filmaba en nitrato, una película que ardía con facilidad; por eso se perdió buena parte del cine mudo.'],
    ['teatro|función|funciones|obra de teatro|ensayo', 'obras', 'En 1881 un teatro de Londres fue el primer edificio público iluminado por completo con luz eléctrica.'],
    ['gira|ciudades|teatro', 'obras', 'En las décadas de 1870 y 1880 el tren permitió que las compañías llevaran la misma obra de teatro a decenas de ciudades.'],
    ['derechos|dominio público|material|autor', 'obras', 'En 1886 el Convenio de Berna protegió por primera vez las obras de un país en los demás.'],
    ['dominio público|70 años|derechos', 'obras', 'La regla de «vida del autor más 70 años» se adoptó en Europa en 1993 y en Estados Unidos en 1998.'],
    ['libro|libros|tapa|bolsillo|imprenta', 'obras', 'En 1935 llegaron a las librerías del Reino Unido libros de bolsillo baratos, al precio de un paquete de cigarrillos.'],
    ['imprenta|imprimir|libro', 'obras', 'Desde la década de 1840 la prensa rotativa multiplicó la velocidad de impresión: miles de hojas por hora.'],
    ['libro digital|ebook|digital', 'obras', 'En 1971 se digitalizó el primer libro electrónico, un texto de dominio público.'],
    ['audiolibro|audio', 'obras', 'En los años 30 se grabaron los primeros libros hablados, pensados para personas ciegas.'],
    ['novela|entregas|historieta|cómic', 'obras', 'En el siglo XIX muchas novelas se publicaban por entregas, un capítulo cada semana en diarios y revistas.'],
    ['cómic|historieta|tira', 'obras', 'Las tiras cómicas a color de los diarios del domingo se volvieron un fenómeno hacia 1895.'],
    ['música|banda|disco|grabar', 'obras', 'En 1877 se inventó el fonógrafo, la primera máquina capaz de grabar y reproducir sonido.'],
    ['disco|vinilo|álbum', 'obras', 'En 1948 llegó el disco de vinilo de larga duración: unos 20 minutos de música por lado.'],
    ['sencillo|single|disco', 'obras', 'En 1949 apareció el disco sencillo de 45 revoluciones, con una canción por lado.'],
    ['casete|formato', 'obras', 'El casete compacto se presentó en 1963 y llevó la música grabada al auto y al bolsillo.'],
    ['cd\\b|disco compacto|formato', 'obras', 'El disco compacto salió a la venta en 1982.'],
    ['certifica|oro|platino|ventas', 'obras', 'El primer disco de oro certificado en Estados Unidos se entregó en 1958.'],
    ['radio|jingle|anuncio', 'obras', 'La radio comercial con programación diaria empezó en 1920, y el primer jingle publicitario sonó en 1926.'],
    ['descarga|canción|tienda', 'obras', 'En 2003 abrieron las primeras grandes tiendas de canciones sueltas por internet.'],
    ['videojuego|consola|arcade|plataforma', 'obras', 'En 1972 salieron la primera consola casera y la primera máquina de salón de éxito masivo.'],
    ['videojuego|crisis|mercado', 'negocio', 'En 1983 el mercado de los videojuegos de Norteamérica se hundió: cayó cerca de un 97 % en dos años.'],
    ['portátil|móvil|teléfono', 'obras', 'En 2008 abrieron las tiendas de aplicaciones para teléfonos y los juegos llegaron al bolsillo de millones.'],
    ['3d|gráficos|motor', 'obras', 'Entre 1994 y 1996 los gráficos 3D en tiempo real llegaron a las consolas caseras.'],
    ['televisión|serie|canal|episodio|parrilla', 'obras', 'El primer servicio regular de televisión de alta definición para su época empezó en Londres en 1936.'],
    ['color|televisión|canal', 'obras', 'Las primeras emisiones de televisión en color de Norteamérica salieron al aire en 1954.'],
    ['serie|episodio|público|audiencia', 'obras', 'En 1951 una comedia de televisión se grabó con tres cámaras frente al público, un método que se usa hasta hoy.'],
    ['grabad|en vivo|vivo', 'obras', 'Hasta 1956 casi toda la televisión iba en vivo: ese año llegó la cinta de video para grabar programas.'],
    ['audiencia|público|medición', 'mundo', 'Desde 1950 la audiencia de la televisión se mide con aparatos instalados en algunos hogares.'],
    ['canal|pago|cable', 'negocio', 'En 1972 nació en Estados Unidos el primer canal de televisión de pago por cable.'],
    ['impuesto|utilidad|finanzas', 'negocio', 'Estados Unidos hizo permanente el impuesto sobre la renta en 1913.'],
    ['crisis|banco|préstamo|bolsa|deuda', 'negocio', 'Tras el crac de la bolsa de 1929, el desempleo en Estados Unidos llegó al 25 % en 1933.'],
    ['crisis|público|cines', 'mundo', 'En la Gran Depresión los cines regalaban vajilla y daban dos películas por función para atraer público.'],
    ['dinero|inflación|dólares|época|ipc', 'negocio', 'Un dólar de 1900 equivale a unos 38 dólares de 2025: por eso los presupuestos de época parecen tan chicos.'],
    ['banco|préstamo|crédito|socio', 'negocio', 'En los años 20 un banco de California fue de los primeros en prestar dinero a los estudios de cine.'],
    ['tienda|fans|recuerdos|museo|parque', 'estudio', 'En 1955 abrió el primer gran parque temático basado en personajes de cine.'],
    ['academia|escuela|estudiar|actuación|becas?', 'talento', 'En 1947 se fundó en Nueva York un célebre taller para actores que enseñaba a vivir el papel desde adentro.'],
    ['sindicato|huelga|sueldo|salario', 'talento', 'Los actores de cine de Estados Unidos formaron su sindicato en 1933.'],
    ['huelga|guion|guionista', 'talento', 'La huelga de guionistas de 2007 y 2008 duró 100 días y frenó cientos de series.'],
    ['menores|niños|edad', 'talento', 'En 1939 California aprobó una ley para guardar parte del dinero de los niños actores hasta que fueran mayores.'],
    ['pandemia|gripe|salud|cerrar', 'mundo', 'La gripe de 1918 cerró los cines de muchas ciudades durante semanas.'],
    ['pandemia|cines|streaming', 'mundo', 'En 2020 la pandemia cerró la mayoría de los cines del mundo durante meses y el streaming creció como nunca.'],
    ['población|habitantes|regiones', 'mundo', 'En 1850 vivían en el mundo unos 1.200 millones de personas; en 2025, más de 8.000 millones.'],
    ['exposición|feria|calendario', 'mundo', 'La primera exposición universal se celebró en Londres en 1851.'],
    ['calendario|fecha|día|semana|año', 'mundo', 'El 29 de febrero existe porque el año solar dura casi 365 días y 6 horas.'],
    ['hemisferio|estación|estaciones|vacaciones|temporada', 'mundo', 'Cuando en el norte es verano, en el sur es invierno: las vacaciones de cine cambian de mes según el hemisferio.'],
    ['doble|programa|distribución|cadena', 'negocio', 'En los años 30 muchos cines daban dos películas por entrada: la principal y una «película B» más barata.'],
    ['autocine|auto|salas', 'negocio', 'El primer autocine abrió en 1933 en Nueva Jersey.'],
    ['multicine|salas|cadena', 'negocio', 'Los complejos con muchas salas bajo un mismo techo se extendieron en los años 60 y 70.'],
    ['piratería|antipiratería|mundial|simultáne', 'negocio', 'Desde los años 2000 los grandes estrenos salen el mismo día en decenas de países para frenar la piratería.'],
    ['revista|prensa|crítica|entrevista', 'mundo', 'En 1905 nació en Nueva York una de las revistas del espectáculo más influyentes, que todavía se publica.'],
    ['crítica|festival|premio', 'mundo', 'El festival de cine de Cannes se celebró por primera vez en 1946.'],
    ['ia\\b|inteligencia|automática|máquina', 'obras', 'En 1950 se propuso una prueba para saber si una máquina puede conversar como una persona.'],
    ['ia\\b|inteligencia|investiga|invento', 'mundo', 'El término «inteligencia artificial» se acuñó para una conferencia de verano de 1956.'],
    ['ia\\b|automática|idea|guion', 'obras', 'En 2022 los programas que escriben textos con inteligencia artificial llegaron al público general.'],
    ['render|efectos|ia\\b|granja', 'estudio', 'Las granjas de render, cientos de computadoras trabajando juntas, hicieron posible el cine animado por computadora.'],
    ['tecnología|invento|investiga|laboratorio', 'mundo', 'El cinematógrafo de 1895 filmaba, copiaba y proyectaba con la misma máquina.'],
    ['rival|competencia|estudios', 'negocio', 'En la edad de oro de los estudios, ocho compañías hacían la mayoría de las películas de Estados Unidos.'],
    ['personal|sede|oficina|equipo', 'estudio', 'En los años 30 un gran estudio de cine empleaba a miles de personas: carpinteros, costureras, músicos y hasta policías propios.'],
    ['vestuario|maquillaje|sets?\\b|decorado', 'obras', 'En la época de los estudios, los decorados y el vestuario se guardaban y se reusaban en decenas de películas.'],
    ['locación|terreno|país|rodaje|filma', 'obras', 'Desde los años 50 muchas películas se rodaron en otros países para ahorrar costos y aprovechar paisajes nuevos.'],
    ['prueba de público|público|calidad', 'obras', 'Desde los años 20 los estudios mostraban sus películas a público de prueba antes del estreno y cambiaban finales según su reacción.'],
    ['franquicia|secuela|continuación|reboot|saga', 'obras', 'Las series de películas con los mismos personajes ya eran comunes en los años 30, mucho antes de que se llamaran franquicias.'],
    ['meta|logro|carrera|avatar', 'mundo', 'Varios de los grandes estudios nacieron de un solo cine de barrio comprado con ahorros a principios del siglo XX.'],
  ];
  const RE = DATOS.map(function (d) { return new RegExp(d[0], 'i'); });
  const abiertos = new Set();
  let cuenta = 0;
  function datoPara(texto) {
    const sec = (U.estado && U.estado.seccion) || 'estudio';
    let c = DATOS.filter(function (d, i) { return RE[i].test(texto); });
    if (!c.length) c = DATOS.filter(function (d) { return d[1] === sec; });
    return c.length ? c[N.hash(texto) % c.length][2] : DATOS[0][2];
  }
  // Convierte las notas «info» de una parte de la pantalla (se llama después de cada dibujo)
  function convertir(raiz) {
    (raiz || document).querySelectorAll('.nota.info:not([data-pi])').forEach(function (n) {
      const clave = String(N.hash(n.textContent));
      n.setAttribute('data-pi', clave);
      n.id = n.id || 'pi' + (++cuenta);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'punto-i'; b.setAttribute('data-a', 'puntoI'); b.setAttribute('data-v', n.id);
      b.setAttribute('aria-controls', n.id); b.setAttribute('aria-label', 'Información: cómo funciona');
      b.textContent = 'i';
      const prev = n.previousElementSibling, lab = n.parentNode && n.parentNode.classList && n.parentNode.classList.contains('campo') ? n.parentNode.firstElementChild : null;
      if (lab && lab !== n && lab.tagName === 'SPAN') lab.appendChild(b);
      else if (prev && /^H[2-4]$/.test(prev.tagName)) prev.appendChild(b);
      else { b.classList.add('suelto'); const t = document.createElement('span'); t.textContent = 'Cómo funciona'; b.appendChild(t); n.parentNode.insertBefore(b, n); }
      poner(n, b, abiertos.has(clave));
    });
  }
  function poner(n, b, abrir) {
    n.classList.toggle('cerrada', !abrir);
    b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir && !n.querySelector('.dato')) {
      const d = document.createElement('span'); d.className = 'dato';
      const e = document.createElement('b'); e.textContent = 'Dato histórico: ';
      d.appendChild(e); d.appendChild(document.createTextNode(datoPara(n.textContent)));
      n.appendChild(d);
    }
  }
  U.accion('puntoI', function (id, b) {
    const n = document.getElementById(id);
    if (!n) return;
    const abrir = n.classList.contains('cerrada'), clave = n.getAttribute('data-pi');
    if (abrir) abiertos.add(clave); else abiertos.delete(clave);
    poner(n, b, abrir);
  });
  return { DATOS: DATOS, convertir: convertir, datoPara: datoPara };
})();
