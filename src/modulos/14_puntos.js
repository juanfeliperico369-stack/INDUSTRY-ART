/* ==== módulo: puntos ==== */
// Puntos «i»: cada nota que explica una mecánica se guarda detrás de un botón «i». Al tocarlo se abre ahí mismo
// con su explicación y un dato histórico real del tema (sin personas vivas ni marcas).
// Las notas que muestran datos de la partida (cifras, fechas, contratos) siguen a la vista.
ART.puntos = (function () {
  'use strict';
  const N = ART.n, U = ART.ui;
  // [palabras clave (expresión regular sobre la nota), sección de respaldo, dato]
  const DATOS = [
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
