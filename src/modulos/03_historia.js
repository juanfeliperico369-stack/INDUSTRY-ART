/* ==== módulo: historia ==== */
// V24 · Historia viva: cada hito real (1850–2026) en su día exacto, sin personas ni marcas; guerras y crisis que
// mueven el mercado por región; Código de Producción (censura de 1934 a 1968); fallo antimonopolio de 1948;
// piratería por época; huelgas que detienen guiones y rodajes; las eras de ficción (2026–2150) y, después,
// eventos generados con lo que pasó en tu partida. También los 50 inventos del cine y los del futuro.
IA.historia = (function () {
  'use strict';
  const N = IA.n;
  // [año, mes, día, texto, efecto]
  const HITOS = [
    [1850, 1, 1, 'Teatro, libros y folletines por entregas dominan el entretenimiento'], [1877, 11, 21, 'Se anuncia el fonógrafo: aparece la música grabada en cilindros'],
    [1887, 11, 8, 'Se patenta el disco plano'], [1895, 12, 28, 'Primera proyección pública de cine con entrada pagada, en París: nace el cine mudo'],
    [1905, 6, 19, 'Abren las salas baratas de cine en Norteamérica: el público crece rápido'], [1912, 3, 1, 'Llegan los largometrajes y el sistema de estrellas'],
    [1914, 7, 28, 'Empieza la Primera Guerra Mundial: Europa produce menos', 'guerra1'], [1918, 11, 11, 'Termina la Primera Guerra Mundial'],
    [1920, 11, 2, 'Primeras emisoras de radio comerciales: la radio compite y sirve de marketing'], [1927, 10, 6, 'Llega el cine sonoro: suben los costos y los talentos sin voz pierden fama'],
    [1929, 10, 29, 'Crisis de 1929: empieza la Gran Depresión, menos dinero y entradas baratas', 'depresion'], [1930, 3, 31, 'Se adopta el Código de Producción (se aplicará desde 1934)'],
    [1932, 8, 6, 'Primer festival de cine, en Europa'], [1934, 7, 1, 'Se aplica el Código de Producción: censura en Norteamérica', 'hays'],
    [1935, 6, 13, 'Primer largometraje en color de tres bandas'], [1936, 11, 2, 'Primeras emisiones regulares de televisión, en el Reino Unido'],
    [1939, 9, 1, 'Empieza la Segunda Guerra Mundial: propaganda, racionamiento y mercados cerrados', 'guerra2'], [1945, 9, 2, 'Termina la Segunda Guerra Mundial'],
    [1946, 9, 20, 'Récord de asistencia al cine y primer gran festival de la Riviera'], [1948, 5, 3, 'Fallo antimonopolio: los grandes estudios venden sus cines', 'antimonopolio'],
    [1948, 6, 21, 'Nace el disco de larga duración'], [1949, 3, 31, 'Disco sencillo de 45 revoluciones'], [1951, 6, 6, 'Primer festival de invierno en Europa'],
    [1953, 9, 16, 'Pantalla ancha: el cine responde a la televisión'], [1954, 1, 1, 'Primeras emisiones de televisión en color'], [1958, 3, 14, 'Primer disco de oro'],
    [1963, 8, 30, 'Casete compacto: música portátil'], [1968, 11, 1, 'Termina el Código de Producción y nace la clasificación por edades', 'finHays'],
    [1972, 11, 29, 'Primeros videojuegos de salón y primera consola doméstica'], [1975, 6, 20, 'El estreno amplio de verano con anuncios en TV se vuelve estrategia'],
    [1976, 10, 31, 'Video doméstico en cinta: nace la ventana de video'], [1977, 5, 25, 'Efectos especiales de nueva generación'], [1979, 7, 1, 'Reproductor de casete portátil'],
    [1981, 8, 1, 'Canal de TV de videos musicales: el videoclip como marketing'], [1982, 10, 1, 'Disco compacto'], [1983, 12, 1, 'Crisis del videojuego en Norteamérica'],
    [1985, 10, 18, 'Vuelven con fuerza las consolas domésticas'], [1991, 8, 6, 'La web se abre al público'], [1995, 11, 22, 'Primer largometraje animado por completo en computadora'],
    [1997, 3, 24, 'Llega el DVD'], [1999, 6, 1, 'Piratería por internet', 'pirateria'], [2003, 4, 28, 'Tiendas legales de música digital'], [2005, 4, 23, 'Plataformas de video en línea'],
    [2006, 6, 20, 'Disco óptico de alta definición'], [2007, 1, 16, 'Streaming de video por suscripción y teléfonos inteligentes'], [2008, 10, 7, 'Streaming de música'],
    [2009, 12, 18, 'Auge del 3D digital en salas'], [2016, 2, 1, 'Las reproducciones cuentan para las certificaciones'], [2019, 11, 12, 'Guerra del streaming: las plataformas compiten por catálogo'],
    [2020, 3, 16, 'Pandemia: cines cerrados y estrenos directos a streaming'], [2022, 11, 30, 'IA generativa al alcance del público'],
    [2023, 5, 2, 'Huelga de guionistas: se detienen los guiones', 'huelgaG'], [2023, 7, 14, 'Huelga de actores: se detienen los rodajes', 'huelgaA'], [2023, 11, 9, 'Terminan las huelgas'],
    [2026, 1, 1, 'Presente: termina la historia real; empieza la ficción basada en predicciones'], [2026, 1, 2, 'Era «IA en todas partes»: guion, efectos y doblaje con IA; huelgas y reglas nuevas'],
    [2035, 1, 1, 'Era de la inmersión: realidad mixta y salas inmersivas'], [2050, 1, 1, 'Era del clima y las megaciudades: eventos climáticos cierran rodajes; sets virtuales', 'clima'],
    [2065, 1, 1, 'Pico de población: el mercado llega a su máximo y envejece'], [2085, 1, 1, 'Interfaces neuronales: obras que se sienten; debates éticos y censura nueva'],
    [2100, 1, 1, 'Era orbital: rodajes en órbita y pequeños públicos en colonias'], [2125, 1, 1, 'Arte posthumano: talentos sintéticos con derechos y obras eternas'],
    [2150, 1, 1, 'Después de 2150: el mundo sigue con eventos generados por tu partida'],
  ];
  // V34: más historia real (sin personas ni marcas) e hitos de obras reconocidas. Solo se nombran obras de dominio
  // público (Registro: «reales solo los eventos, las tecnologías y las obras de dominio público»); las más recientes se
  // describen sin su título. El 6.º dato empuja la tendencia de una familia de géneros (los éxitos crean olas).
  HITOS.push.apply(HITOS, [
    [1851, 5, 1, 'Abre la Gran Exposición de Londres: el mundo se reúne a mirar inventos y espectáculos'],
    [1851, 10, 18, 'Se publica «Moby Dick»: la gran novela de aventuras en el mar', null, { fam: 'AA', v: 0.12 }],
    [1852, 3, 20, 'Se publica «La cabaña del tío Tom»: el libro que conmueve a una nación', null, { fam: 'DR', v: 0.15 }],
    [1853, 3, 6, 'Se estrena la ópera «La traviata»', null, { fam: 'RD', v: 0.1 }],
    [1861, 4, 12, 'Empieza la guerra civil en Norteamérica: teatros cerrados y público de luto', 'guerraCivil'],
    [1862, 4, 3, 'Se publica «Los miserables»: el drama social se vuelve fenómeno', null, { fam: 'DR', v: 0.15 }],
    [1865, 4, 9, 'Termina la guerra civil en Norteamérica'],
    [1865, 11, 26, 'Se publica «Alicia en el país de las maravillas»', null, { fam: 'FJ', v: 0.15 }],
    [1870, 3, 20, 'Empieza a publicarse «Veinte mil leguas de viaje submarino»: nace la ciencia ficción popular', null, { fam: 'IM', v: 0.18 }],
    [1871, 12, 24, 'Se estrena la ópera «Aida», en El Cairo'],
    [1873, 5, 9, 'Pánico de 1873: se hunde la bolsa de Viena y empieza una larga crisis', 'panico1873'],
    [1874, 4, 15, 'Primera exposición impresionista en París: el arte rompe con la academia', null, { fam: 'AV', v: 0.15 }],
    [1875, 3, 3, 'Se estrena la ópera «Carmen»', null, { fam: 'RD', v: 0.1 }],
    [1876, 8, 13, 'Primer festival de ópera dedicado a un solo compositor: se estrena un ciclo de cuatro óperas', null, { fam: 'IM', v: 0.08 }],
    [1877, 3, 4, 'Se estrena el ballet «El lago de los cisnes»'],
    [1879, 12, 21, 'Se estrena «Casa de muñecas»: el teatro discute el papel de la mujer', null, { fam: 'DR', v: 0.12 }],
    [1883, 11, 14, 'Se publica «La isla del tesoro»: los piratas conquistan a los lectores', null, { fam: 'AA', v: 0.15 }],
    [1886, 1, 5, 'Se publica «El extraño caso del doctor Jekyll y el señor Hyde»', null, { fam: 'SM', v: 0.15 }],
    [1889, 5, 6, 'Abre la Exposición Universal de París, con su torre de hierro'],
    [1891, 5, 20, 'Se presenta un visor de imágenes en movimiento para una sola persona'],
    [1892, 12, 18, 'Se estrena el ballet «El cascanueces»', null, { fam: 'FJ', v: 0.08 }],
    [1893, 5, 5, 'Pánico de 1893: quiebra la bolsa en Norteamérica', 'panico1893'],
    [1894, 4, 14, 'Abre en Nueva York la primera sala comercial de visores de imágenes en movimiento'],
    [1896, 2, 1, 'Se estrena la ópera «La bohème»', null, { fam: 'RD', v: 0.08 }],
    [1897, 5, 26, 'Se publica «Drácula»: el vampiro entra en la cultura popular', null, { fam: 'SM', v: 0.2 }],
    [1897, 12, 28, 'Se estrena «Cyrano de Bergerac»', null, { fam: 'RD', v: 0.1 }],
    [1900, 4, 14, 'Abre la Exposición Universal de París 1900: cine en pantalla gigante para miles de visitantes'],
    [1900, 5, 17, 'Se publica «El maravilloso mago de Oz»', null, { fam: 'FJ', v: 0.15 }],
    [1902, 9, 1, 'Se estrena «Viaje a la Luna»: los trucos de cámara llevan al público al espacio', null, { fam: 'IM', v: 0.25 }],
    [1903, 12, 1, 'Se estrena «Asalto y robo de un tren»: el montaje paralelo y el primer western', null, { fam: 'AA', v: 0.22 }],
    [1904, 12, 27, 'Se estrena en el teatro «Peter Pan»', null, { fam: 'FJ', v: 0.12 }],
    [1906, 12, 26, 'En Australia se estrena el primer largometraje narrativo de la historia'],
    [1911, 10, 27, 'Abre el primer estudio de cine en Hollywood: el sol de California atrae a la industria'],
    [1913, 5, 29, 'Escándalo en el estreno del ballet «La consagración de la primavera»: la vanguardia sacude al público', null, { fam: 'AV', v: 0.15 }],
    [1914, 4, 18, 'Se estrena «Cabiria»: el cine épico con decorados gigantes', null, { fam: 'AA', v: 0.2 }],
    [1918, 10, 1, 'La gripe de 1918 cierra cines y teatros en muchas ciudades', 'gripe1918'],
    [1919, 2, 28, 'Las salas reabren después de la gripe'],
    [1920, 2, 26, 'Se estrena «El gabinete del doctor Caligari»: nace el expresionismo en el cine', null, { fam: 'AV', v: 0.2 }],
    [1921, 2, 6, 'Se estrena «El chico»: la comedia que hace llorar', null, { fam: 'HM', v: 0.2 }],
    [1922, 3, 4, 'Se estrena «Nosferatu»: el terror encuentra su sombra', null, { fam: 'SM', v: 0.22 }],
    [1922, 6, 11, 'Se estrena «Nanuk, el esquimal»: el primer gran documental de largometraje', null, { fam: 'AV', v: 0.12 }],
    [1924, 2, 12, 'Se estrena «Rapsodia en azul»: el jazz entra en la sala de conciertos'],
    [1925, 6, 26, 'Se estrena «La quimera del oro»', null, { fam: 'HM', v: 0.18 }],
    [1925, 12, 21, 'Se estrena «El acorazado Potemkin»: el montaje cambia el lenguaje del cine', null, { fam: 'DR', v: 0.15 }],
    [1927, 1, 10, 'Se estrena «Metrópolis»: la ciencia ficción a lo grande', null, { fam: 'IM', v: 0.22 }],
    [1927, 12, 27, 'Se estrena en Broadway «Show Boat»: nace el musical moderno', null, { fam: 'HM', v: 0.18 }],
    [1929, 5, 16, 'Primera gran entrega de premios de la industria del cine en Norteamérica'],
    [1929, 6, 6, 'Se estrena «Un perro andaluz»: el surrealismo llega a la pantalla', null, { fam: 'AV', v: 0.18 }],
    [1930, 4, 21, 'Se estrena «Sin novedad en el frente»: el cine bélico mira el horror de la guerra', null, { fam: 'DR', v: 0.15 }],
    [1931, 2, 12, 'Un drama de vampiros con sonido triunfa: empieza la ola de monstruos clásicos', null, { fam: 'SM', v: 0.25 }],
    [1933, 3, 2, 'Un monstruo gigante hecho con maquetas y animación cuadro a cuadro arrasa en taquilla', null, { fam: 'IM', v: 0.25 }],
    [1937, 12, 21, 'Primer largometraje animado a color de un gran estudio: la animación conquista las salas', null, { fam: 'FJ', v: 0.3 }],
    [1939, 12, 15, 'Un melodrama histórico en color marca un récord de taquilla que durará décadas', null, { fam: 'DR', v: 0.2 }],
    [1941, 5, 1, 'Una ópera prima con fotografía y montaje revolucionarios cambia el lenguaje del cine', null, { fam: 'AV', v: 0.15 }],
    [1941, 7, 1, 'Se emite el primer anuncio de televisión: la publicidad descubre la pantalla de la casa'],
    [1942, 11, 26, 'Un romance en tiempos de guerra se vuelve un clásico instantáneo', null, { fam: 'RD', v: 0.2 }],
    [1945, 9, 27, 'Nace el neorrealismo: rodajes en la calle con actores no profesionales', null, { fam: 'DR', v: 0.15 }],
    [1947, 10, 20, 'Empiezan las audiencias de la lista negra: guionistas vetados y miedo en los estudios'],
    [1950, 6, 25, 'Empieza la guerra de Corea'],
    [1952, 5, 26, 'El cine queda protegido por la libertad de expresión en Norteamérica'],
    [1954, 4, 26, 'Una épica de samuráis de Japón marca el cine de acción de todo el mundo', null, { fam: 'AA', v: 0.2 }],
    [1954, 11, 3, 'Nace en Japón el cine de monstruos gigantes de la posguerra', null, { fam: 'IM', v: 0.18 }],
    [1955, 7, 17, 'Abre el primer gran parque temático de un estudio de cine'],
    [1959, 5, 4, 'Nace la nueva ola francesa: cámaras ligeras y directores jóvenes', null, { fam: 'AV', v: 0.2 }],
    [1960, 6, 16, 'Un thriller en un motel solitario redefine el suspenso', null, { fam: 'SM', v: 0.22 }],
    [1962, 7, 23, 'Primera transmisión de televisión en vivo entre continentes por satélite'],
    [1962, 10, 5, 'Nace la gran saga de espías del cine', null, { fam: 'AA', v: 0.22 }],
    [1962, 10, 16, 'Crisis de los misiles: el mundo al borde de la guerra nuclear'],
    [1964, 2, 9, 'Una banda británica llena la televisión y desata la fiebre del pop'],
    [1965, 3, 2, 'Un musical familiar se vuelve la película más taquillera de su tiempo', null, { fam: 'HM', v: 0.22 }],
    [1968, 4, 2, 'Una odisea espacial lleva la ciencia ficción al terreno del arte', null, { fam: 'IM', v: 0.2 }],
    [1969, 7, 20, 'Llegada a la Luna: medio mundo lo ve por televisión', null, { fam: 'IM', v: 0.15 }],
    [1969, 8, 15, 'Gran festival de música al aire libre: medio millón de personas en un campo'],
    [1972, 3, 15, 'Una saga de mafiosos gana público y crítica: el cine de autor entra en las majors', null, { fam: 'SM', v: 0.22 }],
    [1973, 10, 17, 'Crisis del petróleo: suben los precios y cae el consumo', 'petroleo'],
    [1980, 6, 1, 'Nace el primer canal de noticias de 24 horas'],
    [1982, 6, 11, 'Un extraterrestre amistoso conquista a las familias de todo el mundo', null, { fam: 'FJ', v: 0.22 }],
    [1985, 7, 13, 'Conciertos benéficos transmitidos al mismo tiempo a todo el planeta'],
    [1987, 10, 19, 'Lunes negro: la bolsa se desploma en un solo día'],
    [1989, 11, 9, 'Cae el Muro de Berlín: se abren los mercados del este de Europa'],
    [1991, 12, 26, 'Se disuelve la Unión Soviética'],
    [1993, 6, 11, 'Dinosaurios digitales convencen al público: los efectos por computadora llegan para quedarse', null, { fam: 'IM', v: 0.25 }],
    [1997, 7, 2, 'Crisis financiera en Asia', 'asia1997'],
    [1997, 12, 19, 'Un melodrama sobre un naufragio rompe todos los récords de taquilla', null, { fam: 'RD', v: 0.22 }],
    [1999, 3, 31, 'Una ciencia ficción con cámara lenta de 360 grados cambia el cine de acción', null, { fam: 'AA', v: 0.2 }],
    [2000, 3, 10, 'Estalla la burbuja de las empresas de internet'],
    [2001, 9, 11, 'Atentados del 11 de septiembre: la industria pospone estrenos y cambia sus historias'],
    [2001, 12, 19, 'Arranca la gran trilogía de fantasía filmada de una sola vez', null, { fam: 'IM', v: 0.22 }],
    [2003, 3, 12, 'Alerta mundial por el SRAS: se vacían las salas en Asia', 'sars'],
    [2004, 2, 4, 'Nacen las redes sociales masivas: el boca a boca se vuelve digital'],
    [2008, 5, 2, 'Empieza la era de los universos compartidos de superhéroes', null, { fam: 'AA', v: 0.3 }],
    [2008, 9, 15, 'Quiebra un gran banco de inversión: crisis financiera mundial', 'crisis2008'],
    [2011, 3, 11, 'Terremoto y tsunami en Japón'],
    [2013, 11, 27, 'Un musical animado de princesas arrasa en todo el mundo', null, { fam: 'FJ', v: 0.2 }],
    [2017, 10, 15, 'Movimiento mundial contra el acoso en la industria: caen carreras y cambian las reglas'],
    [2019, 4, 26, 'La gran saga de superhéroes cierra su ciclo con el mayor estreno de la historia', null, { fam: 'AA', v: 0.15 }],
    [2022, 2, 24, 'Empieza la guerra en Ucrania: se cierran mercados en Europa del este'],
    [2023, 7, 21, 'Dos estrenos opuestos el mismo día llenan los cines y se vuelven fenómeno', null, { fam: 'HM', v: 0.12 }],
  ]);
  HITOS.sort(function (a, b) { return (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]); });
  // Periodos con efecto (t de inicio y fin se calculan con la fecha real)
  const PERIODOS = [
    { id: 'guerra1', ini: [1914, 7, 28], fin: [1918, 11, 11], reg: ['eur', 'asi'], f: 0.6 },
    { id: 'depresion', ini: [1929, 10, 29], fin: [1933, 12, 31], f: 0.9 },
    { id: 'guerra2', ini: [1939, 9, 1], fin: [1945, 9, 2], reg: ['eur', 'asi'], f: 0.55 },
    { id: 'hays', ini: [1934, 7, 1], fin: [1968, 11, 1], censura: 1 },
    { id: 'huelgaG', ini: [2023, 5, 2], fin: [2023, 11, 9], pausa: 'desarrollo' },
    { id: 'huelgaA', ini: [2023, 7, 14], fin: [2023, 11, 9], pausa: 'rodaje' },
    // V34: más crisis reales que mueven el mercado
    { id: 'guerraCivil', ini: [1861, 4, 12], fin: [1865, 4, 9], reg: ['nam'], f: 0.8 },
    { id: 'panico1873', ini: [1873, 5, 9], fin: [1879, 3, 1], f: 0.92 },
    { id: 'panico1893', ini: [1893, 5, 5], fin: [1897, 6, 1], f: 0.93 },
    { id: 'gripe1918', ini: [1918, 10, 1], fin: [1919, 2, 28], f: 0.7 },
    { id: 'petroleo', ini: [1973, 10, 17], fin: [1974, 3, 18], f: 0.95 },
    { id: 'asia1997', ini: [1997, 7, 2], fin: [1998, 12, 31], reg: ['asi'], f: 0.9 },
    { id: 'sars', ini: [2003, 3, 12], fin: [2003, 7, 5], reg: ['asi'], f: 0.85 },
    { id: 'crisis2008', ini: [2008, 9, 15], fin: [2009, 6, 30], f: 0.93 },
  ];
  // Los 50 inventos del cine y los del futuro: dan +2 a su departamento a quien los tiene antes que el mundo
  // (y hasta 5 años después). Se investigan o se licencian a quien los tenga.
  const INVENTOS = [
    [1895, 'Proyector de manivela', 'fotografia'], [1897, 'Cámara portátil', 'fotografia'], [1902, 'Efectos de truco', 'efectos'], [1908, 'Película larga de nitrato', 'produccion'],
    [1912, 'Iluminación de arco', 'fotografia'], [1915, 'Grúa de cámara', 'direccion'], [1918, 'Maquillaje de cine', 'vestuario'], [1922, 'Película pancromática', 'fotografia'],
    [1925, 'Miniaturas y maquetas', 'efectos'], [1927, 'Sonido sincronizado', 'musica'], [1929, 'Micrófono direccional', 'musica'], [1931, 'Retroproyección', 'efectos'],
    [1933, 'Doblaje en estudio', 'edicion'], [1935, 'Color de tres bandas', 'arte'], [1937, 'Cámara multiplano', 'animacion'], [1940, 'Sonido estereofónico', 'musica'],
    [1948, 'Lente de zoom', 'fotografia'], [1952, 'Cine en relieve', 'efectos'], [1953, 'Lente anamórfico', 'fotografia'], [1955, 'Color de un solo negativo', 'arte'],
    [1959, 'Croma', 'efectos'], [1962, 'Mesa de montaje', 'edicion'], [1966, 'Reducción de ruido', 'musica'], [1970, 'Pantalla gigante', 'fotografia'],
    [1976, 'Estabilizador de cámara', 'direccion'], [1977, 'Control de movimiento', 'efectos'], [1979, 'Sonido envolvente', 'musica'], [1982, 'Gráficos por computadora', 'efectos'],
    [1985, 'Animatrónica avanzada', 'efectos'], [1989, 'Edición no lineal', 'edicion'], [1992, 'Sonido digital en salas', 'musica'], [1993, 'Criaturas digitales', 'efectos'],
    [1995, 'Animación 3D por computadora', 'animacion'], [1999, 'Cámara digital de cine', 'fotografia'], [2001, 'Corrección de color digital', 'fotografia'], [2003, 'Captura de movimiento', 'interprete'],
    [2006, 'Captura facial', 'interprete'], [2009, 'Cámara estereoscópica', 'efectos'], [2012, 'Proyección láser', 'fotografia'], [2016, 'Rejuvenecimiento digital', 'interprete'],
    [2019, 'Plató virtual con pantallas', 'arte'], [2022, 'Imágenes generadas con IA', 'efectos'], [2028, 'Doblaje con IA', 'edicion'], [2033, 'Actores digitales con licencia', 'interprete'],
    [2040, 'Salas de realidad mixta', 'fotografia'], [2048, 'Hologramas en escena', 'efectos'], [2060, 'Sets climáticos virtuales', 'arte'], [2075, 'Guion asistido por emociones', 'guion'],
    [2088, 'Interfaz neuronal de rodaje', 'direccion'], [2105, 'Cámaras orbitales', 'fotografia'], [2130, 'Talentos sintéticos con derechos', 'interprete'], [2145, 'Montaje por pensamiento', 'edicion'],
  ].map(function (x, i) { return { id: 'inv' + i, anio: x[0], nombre: x[1], dep: x[2] }; });
  function tDe(y, m, d) { return IA.cal.tDeFecha(y, m - 1, d); } // los hitos usan meses 1–12; el calendario, 0–11 (V29)
  // V34: la partida recuerda hasta qué semana procesó los hitos (tv), no su posición en la lista: así se pueden agregar
  // hitos en cualquier fecha sin repetir avisos en partidas viejas (al cargarlas, todo lo anterior cuenta como visto)
  function st() {
    const S = N.S;
    if (!S.hist) S.hist = { gen: [], vistos: 0, ultAnio: 0, tv: S.t - 2 };
    if (S.hist.tv === undefined) S.hist.tv = S.t;
    return S.hist;
  }
  let cacheY0 = null, tHitos = [];
  function tHito(i) {
    if (cacheY0 !== N.S.y0) { cacheY0 = N.S.y0; tHitos = HITOS.map(function (x) { return tDe(x[0], x[1], x[2]); }); }
    return tHitos[i];
  }
  function activo(p, t) { return t >= tDe(p.ini[0], p.ini[1], p.ini[2]) && t <= tDe(p.fin[0], p.fin[1], p.fin[2]); }
  // Eventos generados (después de 2026): recesiones, auges, pandemias, huelgas, guerras regionales y clima
  function generados() { return st().gen; }
  function activos(t) {
    const tt = t === undefined ? N.S.t : t;
    return PERIODOS.filter(function (p) { return activo(p, tt); }).concat(generados().filter(function (g) { return tt >= g.ini && tt <= g.fin; }));
  }
  // Factor del mercado de cine por región (no toca el factor semanal de temporada, que sigue entre ×0,80 y ×1,40)
  function factorMercado(reg) {
    let f = 1;
    activos().forEach(function (p) { if (p.f && (!p.reg || p.reg.indexOf(reg) >= 0)) f *= p.f; });
    return N.limitar(f, 0.3, 1.15);
  }
  function censura() { return activos().some(function (p) { return p.censura; }); }
  // Una obra con contenido fuerte en tiempos del Código: la oficina obliga a cortes
  function censurar(o) {
    if (!censura() || !o.cont) return false;
    const c = o.cont;
    if (Math.max(c.violencia || 0, c.amor || 0, c.lenguaje || 0, c.consumo || 0) < 3) return false;
    o.pub = Math.max(1, o.pub - 3); o.crit = Math.max(1, o.crit - 2); o.cort = 1;
    if (o.est === 0) N.emit('noticia', { tipo: 'estudio', texto: 'La oficina del Código obliga a cortes en «' + o.tit + '»: pierde fuerza.', importante: true });
    return true;
  }
  // Huelgas: los guiones o los rodajes no avanzan (y no gastan)
  function pausa(o) { const a = activos(); return a.some(function (p) { return p.pausa === o.et || (p.pausa === 'rodaje' && o.et === 'preproduccion'); }); }
  // Piratería por época: se come parte del video y del streaming
  function pirateria(anio) { return N.interp([[1979, 1], [1985, 0.95], [1998, 0.95], [2000, 0.84], [2010, 0.86], [2020, 0.92], [2150, 0.94]], anio); }
  // Clima (desde 2050): a veces cierra rodajes en locación
  function climaCierra(o) { return activos().some(function (p) { return p.clima && o.et === 'rodaje' && !o.setR; }); }
  function generarAnio(anio) {
    const h = st(), S = N.S;
    if (anio < 2026 || h.ultAnio >= anio) return;
    h.ultAnio = anio;
    const t0 = tDe(anio, 1, 1);
    const nuevo = function (tipo, sem, x) { const ini = t0 + N.entero(0, 40); h.gen.push(Object.assign({ tipo: tipo, ini: ini, fin: ini + sem }, x)); return h.gen[h.gen.length - 1]; };
    const avisar = function (g, txt) { g.txt = txt; N.emit('noticia', { tipo: 'historia', texto: txt, importante: true }); };
    if (N.probabilidad(0.12)) avisar(nuevo('recesion', N.entero(40, 100), { f: 0.88 }), 'Llega una recesión: la gente gasta menos en entretenimiento.');
    else if (N.probabilidad(0.1)) avisar(nuevo('auge', N.entero(40, 90), { f: 1.06 }), 'Auge económico: el público tiene más dinero para el cine.');
    if (N.probabilidad(0.015)) avisar(nuevo('pandemia', N.entero(12, 30), { f: 0.45 }), 'Una pandemia cierra salas en todo el mundo.');
    if (N.probabilidad(0.04)) avisar(nuevo('huelga', N.entero(8, 20), { pausa: N.probabilidad(0.5) ? 'desarrollo' : 'rodaje' }), 'Huelga en la industria: se detienen proyectos.');
    if (N.probabilidad(0.02)) { const r = N.elegir(IA.datos.regiones).id; avisar(nuevo('guerra', N.entero(52, 160), { f: 0.6, reg: [r] }), 'Un conflicto regional cierra mercados en ' + IA.datos.regiones.filter(function (x) { return x.id === r; })[0].nombre + '.'); }
    if (anio >= 2050 && N.probabilidad(0.08)) avisar(nuevo('clima', N.entero(4, 12), { clima: 1 }), 'Tormentas extremas cierran los rodajes en locación.');
    // Después de 2150: eventos que salen de tu propia partida
    if (anio > 2150 && N.probabilidad(0.5)) {
      const mejor = S.obras.filter(function (o) { return o.est === 0 && o.pub !== undefined; }).sort(function (a, b) { return (b.pub + (b.crit || 0)) - (a.pub + (a.crit || 0)); })[0];
      const opciones = [];
      if (mejor) opciones.push('Se celebra el aniversario de «' + mejor.tit + '»: el público vuelve a pedirla.');
      const fr = IA.franquicias.lista().filter(function (f) { return f.est === 0; })[0];
      if (fr) opciones.push('Nace un movimiento de fans alrededor de «' + fr.nom + '».');
      opciones.push('Una nueva generación descubre el cine de ' + (anio - 100) + '.');
      const g = nuevo('generado', N.entero(10, 26), { f: 1.04 });
      avisar(g, N.elegir(opciones));
      if (mejor && N.probabilidad(0.5)) mejor.pedida = 1;
    }
    if (h.gen.length > 80) h.gen = h.gen.filter(function (g) { return g.fin > S.t - 52 * 30; }).slice(-80);
  }
  // Cada semana: los hitos de esta semana salen con su fecha y aplican su efecto
  function semana() {
    const S = N.S, h = st();
    HITOS.forEach(function (x, i) {
      const tx = tHito(i);
      if (tx <= h.tv || tx > S.t) return;
      if (tx < S.t - 1) return; // lo de antes del inicio no se anuncia
      N.emit('noticia', { tipo: 'historia', texto: IA.cal.texto({ y: x[0], m: x[1] - 1, d: x[2] }) + ': ' + x[3] + '.', importante: true });
      if (x[4]) N.emit('hito', x[4]);
      // Un éxito reconocido crea una ola en su familia de géneros (V34)
      if (x[5] && S.mundo && S.mundo.tendencias) { const f = x[5].fam; S.mundo.tendencias[f] = N.redondear(N.limitar((S.mundo.tendencias[f] || 0) + x[5].v, -1, 1), 3); }
    });
    h.tv = S.t;
    if (N.semana() === 1) generarAnio(N.anio());
  }
  function inicio() { const h = st(); h.tv = N.S.t - 1; } // lo anterior al inicio de la partida no se anuncia
  function lineaDeTiempo() {
    return HITOS.map(function (x) { return { y: x[0], m: x[1] - 1, d: x[2], txt: x[3], fx: x[4] || '' }; }).concat(generados().map(function (g) { const f = IA.cal.inicioDeT ? IA.cal.inicioDeT(g.ini) : null; return { y: N.anio(g.ini), m: f ? f.m : 0, d: f ? f.d : 1, txt: g.txt || g.tipo, gen: 1 }; }))
      .sort(function (a, b) { return (a.y - b.y) || (a.m - b.m) || (a.d - b.d); });
  }
  return { HITOS: HITOS, PERIODOS: PERIODOS, INVENTOS: INVENTOS, activos: activos, factorMercado: factorMercado, censura: censura, censurar: censurar, pausa: pausa,
    pirateria: pirateria, climaCierra: climaCierra, generarAnio: generarAnio, semana: semana, inicio: inicio, lineaDeTiempo: lineaDeTiempo, generados: generados };
})();
