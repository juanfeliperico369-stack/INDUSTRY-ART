/* ==== módulo: curiosidades ==== */
// Archivo de curiosidades: cada tema trae lo que todos saben y lo que pocos saben, en español y en inglés.
// Un tema aparece cuando la partida llega a su año (el archivo solo conoce el pasado). Sin personas vivas ni marcas, salvo en los récords de cada época.
ART.curiosidades = (function () {
  'use strict';
  const N = ART.n;
  // [año, tema, lo que todos saben, lo que pocos saben, tema en inglés, sabido en inglés, poco sabido en inglés]
  const LISTA = [
    [1710, 'Derechos de autor', 'Los derechos de autor protegen lo que crean escritores, músicos y cineastas.', 'La primera ley moderna fue británica, de 1710, y protegía un libro solo 14 años, renovables una vez.',
      'Copyright', 'Copyright protects what writers, musicians and filmmakers create.', 'The first modern law was British, from 1710, and protected a book for just 14 years, renewable once.'],
    [1720, 'Libros sin tapas', 'Durante siglos los libros fueron objetos caros.', 'En el siglo XVIII muchos libros se vendían sin encuadernar: cada lector los mandaba a vestir con tapas a su gusto.',
      'Books without covers', 'For centuries books were expensive objects.', 'In the 18th century many books were sold unbound: each reader had them bound to their own taste.'],
    [1750, 'Teatro a la luz', 'Hoy la sala se apaga cuando empieza la función.', 'Hasta el siglo XIX la sala quedaba iluminada toda la obra y buena parte del público la veía de pie.',
      'Theatre with the lights on', 'Today the house goes dark when the show starts.', 'Until the 19th century the house stayed lit for the whole play and much of the audience watched standing up.'],
    [1837, 'Bajo los reflectores', 'El teatro del siglo XIX se iluminaba con lámparas.', 'La expresión inglesa «in the limelight» viene de la luz de calcio, una lámpara muy brillante que seguía a los actores en escena.',
      'In the limelight', '19th-century theatres were lit by lamps.', 'The phrase «in the limelight» comes from the calcium light, a very bright lamp that followed actors on stage.'],
    [1836, 'Novelas por entregas', 'Muchas novelas famosas del siglo XIX siguen en las librerías.', 'Varias se publicaron primero en diarios, un capítulo por vez, y el público esperaba la próxima entrega como hoy un capítulo de serie.',
      'Serial novels', 'Many famous 19th-century novels are still in bookshops.', 'Several first came out in newspapers, a chapter at a time, and readers waited for the next one like today’s next episode.'],
    [1839, 'Retratos serios', 'La fotografía se presentó al público en 1839.', 'Las primeras fotos necesitaban largos segundos o minutos de exposición: en parte por eso casi nadie sonríe en los retratos antiguos.',
      'Serious portraits', 'Photography was presented to the public in 1839.', 'Early photos needed long seconds or minutes of exposure, which is partly why almost nobody smiles in old portraits.'],
    [1860, 'Novelas de a centavo', 'Los libros de bolsillo hicieron barata la lectura.', 'Un siglo antes ya existían folletines de a centavo, con crímenes y aventuras, que leían los jóvenes obreros.',
      'Penny dreadfuls', 'Paperbacks made reading cheap.', 'A century earlier there were already penny serials full of crime and adventure, read by young workers.'],
    [1876, 'La orquesta escondida', 'En la ópera la orquesta toca frente al escenario.', 'En 1876 un teatro alemán escondió la orquesta bajo el escenario y apagó la sala para que el público mirara solo la obra.',
      'The hidden orchestra', 'At the opera the orchestra plays in front of the stage.', 'In 1876 a German theatre hid the orchestra under the stage and darkened the house so the audience would watch only the drama.'],
    [1877, 'La primera canción grabada', 'El fonógrafo grabó sonido por primera vez en 1877.', 'Lo primero que se grabó y se volvió a escuchar fue una canción infantil recitada, no una gran pieza musical.',
      'The first recorded song', 'The phonograph first recorded sound in 1877.', 'The first thing recorded and played back was a recited nursery rhyme, not a great piece of music.'],
    [1895, 'La primera función', 'La primera función pública de cine con entrada pagada fue en París, en diciembre de 1895.', 'Esa noche fueron apenas unas treinta personas y la función entera duró unos veinte minutos.',
      'The first screening', 'The first public paid film screening was in Paris, in December 1895.', 'That night only about thirty people came, and the whole show lasted about twenty minutes.'],
    [1895, 'Color a mano', 'El cine en color se volvió común en los años treinta.', 'Desde los primeros años muchas películas se pintaban a mano, cuadro por cuadro, con pinceles finísimos.',
      'Hand-painted colour', 'Colour films became common in the 1930s.', 'From the earliest years many films were painted by hand, frame by frame, with very fine brushes.'],
    [1900, 'El cine mudo no era mudo', 'Las películas mudas no tenían sonido grabado.', 'Casi nunca se veían en silencio: un pianista, un organista o una orquesta tocaba en vivo en cada función.',
      'Silent films weren’t silent', 'Silent films had no recorded sound.', 'They were almost never watched in silence: a pianist, an organist or an orchestra played live at every show.'],
    [1902, 'El truco por accidente', '«Viaje a la Luna» (1902) es un clásico de los efectos especiales.', 'Según contaba su autor, el truco de hacer desaparecer cosas nació cuando su cámara se trabó en plena calle.',
      'The accidental trick', '«A Trip to the Moon» (1902) is a special-effects classic.', 'According to its maker, the vanishing trick was born when his camera jammed in the middle of a street.'],
    [1905, 'Cine a cinco centavos', 'El público del cine creció muy rápido a principios del siglo XX.', 'Las primeras salas baratas de Norteamérica cobraban cinco centavos, una moneda llamada «nickel»: de ahí su nombre.',
      'Five-cent cinemas', 'Cinema audiences grew very fast in the early 1900s.', 'The first cheap North American theatres charged five cents, a coin called a «nickel», hence their name.'],
    [1910, 'Estrellas sin nombre', 'Las estrellas de cine son famosas por su nombre.', 'Al principio los estudios no decían quiénes eran sus actores para no pagarles más: el público los conocía por apodos.',
      'Nameless stars', 'Film stars are famous by name.', 'At first studios didn’t reveal who their actors were so they wouldn’t have to pay them more: audiences knew them by nicknames.'],
    [1911, 'Rumbo al oeste', 'Hollywood se volvió la capital del cine por su sol y su clima.', 'También ayudó la distancia: lejos del este, era más difícil que los abogados de las patentes de cámaras persiguieran a los productores.',
      'Heading west', 'Hollywood became the film capital thanks to its sun and climate.', 'Distance helped too: far from the east, it was harder for camera-patent lawyers to chase producers.'],
    [1917, 'Animación de cartón', 'El primer largometraje animado a color de un gran estudio se estrenó en 1937.', 'Veinte años antes, en Argentina, ya se había estrenado un largometraje animado hecho con figuras de cartón recortado.',
      'Cardboard animation', 'The first colour animated feature from a big studio premiered in 1937.', 'Twenty years earlier, Argentina had already premiered an animated feature made with cut-out cardboard figures.'],
    [1923, 'El letrero de la colina', 'El letrero de la colina es el símbolo de la industria del cine.', 'Al principio decía «Hollywoodland»: era el anuncio de una urbanización y debía durar solo un año y medio.',
      'The sign on the hill', 'The sign on the hill is the symbol of the film industry.', 'At first it read «Hollywoodland»: it was an ad for a housing development and was meant to last only a year and a half.'],
    [1926, 'Televisión mecánica', 'La televisión llegó a los hogares a mediados del siglo XX.', 'En los años veinte ya había televisores mecánicos, con discos giratorios e imágenes de apenas treinta líneas.',
      'Mechanical television', 'Television reached homes in the mid-20th century.', 'In the 1920s there were already mechanical TV sets, with spinning discs and pictures of just thirty lines.'],
    [1927, 'Pocos minutos de voz', 'La primera película con diálogos sincronizados llegó en 1927.', 'Tenía apenas un par de minutos de diálogo: el resto eran canciones, música y carteles de texto.',
      'A few minutes of voice', 'The first film with synchronised dialogue arrived in 1927.', 'It had barely a couple of minutes of dialogue: the rest was songs, music and title cards.'],
    [1930, 'Una película, varios idiomas', 'Hoy las películas se doblan o se subtitulan.', 'Al llegar el sonido, algunos estudios filmaban la misma película varias veces, en varios idiomas, con otro elenco en los mismos decorados.',
      'One film, many languages', 'Today films are dubbed or subtitled.', 'When sound arrived, some studios shot the same film several times, in several languages, with another cast on the same sets.'],
    [1932, 'Las telenovelas de jabón', 'Las telenovelas son un fenómeno de la televisión.', 'Nacieron en la radio y las patrocinaban fabricantes de jabón: por eso en inglés se llaman «soap operas».',
      'Soap operas', 'Soap operas are a television phenomenon.', 'They were born on radio and sponsored by soap makers: hence the name «soap operas».'],
    [1932, 'Palomitas prohibidas', 'Las palomitas de maíz son la comida típica del cine.', 'Al principio muchas salas elegantes las prohibían; se volvieron populares en la Gran Depresión porque eran baratas.',
      'Banned popcorn', 'Popcorn is the classic cinema snack.', 'At first many elegant theatres banned it; it caught on during the Great Depression because it was cheap.'],
    [1933, 'La película B', 'Las películas de bajo presupuesto se llaman «de serie B».', 'El nombre viene de la doble función de la Gran Depresión: dos películas por una entrada, y la segunda era la barata.',
      'The B movie', 'Low-budget films are called «B movies».', 'The name comes from the Depression-era double bill: two films for one ticket, and the second was the cheap one.'],
    [1934, 'Avances que iban detrás', 'Los avances se ven antes de la película.', 'Se llaman «trailers», remolques, porque en los primeros años se proyectaban después de la película principal.',
      'Trailers that trailed', 'Trailers are shown before the film.', 'They’re called trailers because in the early years they were shown after the main feature.'],
    [1942, 'Estatuillas de yeso', 'Las estatuillas doradas de los grandes premios del cine son de metal.', 'Durante la Segunda Guerra Mundial, por la escasez de metal, se entregaron de yeso pintado.',
      'Plaster statuettes', 'The golden statuettes of the big film awards are made of metal.', 'During the Second World War, because of metal shortages, they were handed out in painted plaster.'],
    [1942, 'El primer disco de oro', 'Un disco de oro premia las grandes ventas.', 'El primero lo recibió en 1942 una canción de swing por un millón de copias: era un disco pintado de dorado.',
      'The first gold record', 'A gold record rewards big sales.', 'The first went in 1942 to a swing song for a million copies: it was a record sprayed gold.'],
    [1944, 'La palabra «taquillazo»', 'Un gran éxito de taquilla se llama «blockbuster».', 'La palabra viene de unas bombas de la Segunda Guerra Mundial capaces de destruir una manzana entera.',
      'The word blockbuster', 'A huge box-office hit is called a «blockbuster».', 'The word comes from Second World War bombs able to destroy a whole city block.'],
    [1948, 'Radionovelas', 'América Latina ama las telenovelas.', 'Una de las primeras radionovelas de éxito continental fue cubana, de 1948, y tuvo después versiones de cine y de televisión.',
      'Radio dramas', 'Latin America loves telenovelas.', 'One of the first radio dramas to succeed across the continent was Cuban, from 1948, later remade for film and television.'],
    [1953, 'La primera fiebre del 3D', 'El 3D se puso de moda en las salas en 2009.', 'Hubo una fiebre anterior en 1953, con gafas de cartón, para competir con la televisión.',
      'The first 3D craze', '3D became fashionable in cinemas in 2009.', 'There was an earlier craze in 1953, with cardboard glasses, to compete with television.'],
    [1954, 'Un monstruo de látex', 'Los monstruos gigantes japoneses son un clásico del cine.', 'El primero, de 1954, era un actor dentro de un traje que pesaba cerca de cien kilos.',
      'A latex monster', 'Japanese giant monsters are a film classic.', 'The first one, from 1954, was an actor inside a suit weighing nearly a hundred kilos.'],
    [1958, 'Un tenis de laboratorio', 'Los videojuegos se popularizaron en los setenta con las máquinas recreativas.', 'Uno de los primeros se hizo en 1958 en un laboratorio, con un osciloscopio, para entretener a los visitantes de una jornada de puertas abiertas.',
      'Laboratory tennis', 'Video games took off in the 1970s with arcade machines.', 'One of the first was made in 1958 in a laboratory, on an oscilloscope, to entertain visitors at an open day.'],
    [1963, 'Un casete para dictar', 'El casete hizo portátil la música.', 'El casete compacto se presentó en 1963 pensado para dictar cartas, no para escuchar canciones.',
      'A cassette for dictation', 'The cassette made music portable.', 'The compact cassette was presented in 1963 for dictating letters, not for listening to songs.'],
    [1965, 'El oeste en España', 'El western es el género de las praderas norteamericanas.', 'Muchos westerns de los sesenta se filmaron en el desierto de Almería, en España.',
      'The West in Spain', 'The western is the genre of the North American plains.', 'Many 1960s westerns were shot in the desert of Almería, in Spain.'],
    [1975, 'Créditos al final', 'Las películas terminan con largos créditos.', 'Durante décadas casi todos los créditos iban al principio; las largas listas finales se volvieron norma en los setenta.',
      'End credits', 'Films end with long credits.', 'For decades almost all credits came at the start; long closing lists became the norm in the 1970s.'],
    [1975, 'El país que más filma', 'Hollywood es la industria de cine más famosa.', 'Desde los años setenta la India es el país que más películas produce cada año.',
      'The country that films the most', 'Hollywood is the most famous film industry.', 'Since the 1970s India has produced more films each year than any other country.'],
    [1983, 'Cartuchos enterrados', 'En 1983 hubo una gran crisis de los videojuegos en Norteamérica.', 'Miles de cartuchos sin vender se enterraron en un vertedero del desierto; se desenterraron en 2014.',
      'Buried cartridges', 'In 1983 there was a great video game crash in North America.', 'Thousands of unsold cartridges were buried in a desert landfill; they were dug up in 2014.'],
    [1992, 'Cine directo a video', 'El cine se estrena en salas.', 'Nigeria produce miles de películas al año, la mayoría pensadas desde el principio para video y no para salas.',
      'Straight-to-video cinema', 'Films premiere in cinemas.', 'Nigeria makes thousands of films a year, most of them made from the start for video rather than cinemas.'],
    [1998, 'Plataformas por correo', 'Las plataformas de streaming cambiaron la forma de ver películas.', 'Algunas de las más grandes empezaron alquilando DVD por correo, en sobres rojos.',
      'Streaming by mail', 'Streaming platforms changed how we watch films.', 'Some of the biggest started out renting DVDs by mail, in red envelopes.'],
    [2016, 'La realidad aumentada', 'Los videojuegos se juegan frente a una pantalla.', 'En 2016 un juego de realidad aumentada sacó a millones de personas a caminar por sus ciudades para cazar criaturas.',
      'Augmented reality', 'Video games are played in front of a screen.', 'In 2016 an augmented reality game got millions of people walking their cities to catch creatures.'],
    [2020, 'Conciertos en un videojuego', 'Los conciertos se ven en estadios.', 'En 2020 millones de personas vieron un concierto dentro de un videojuego, con el cantante convertido en un gigante digital.',
      'Concerts inside a game', 'Concerts happen in stadiums.', 'In 2020 millions watched a concert inside a video game, with the singer turned into a digital giant.'],
    // Récords de la Final (lo más visto, vendido o duradero de cada época)
    [1940, 'Récord de su tiempo', 'Película más vista de su tiempo: «Lo que el viento se llevó» (1939).', 'Lo fue hasta 1997.', 'Record of its time', 'Most-watched film of its time: «Gone with the Wind» (1939).', 'It held that place until 1997.'],
    [1958, 'Récord de su tiempo', 'La obra de teatro que más tiempo lleva en cartel: «La ratonera» de Agatha Christie (desde 1952).', 'Sigue sin ser superado.', 'Record of its time', 'The longest-running play: Agatha Christie\'s «The Mousetrap» (since 1952).', 'It has not been beaten.'],
    [1984, 'Récord de su tiempo', 'Álbum más vendido de la historia: «Thriller» de Michael Jackson (1982), con decenas de millones de copias.', 'Sigue sin ser superado.', 'Record of its time', 'Best-selling album in history: Michael Jackson\'s «Thriller» (1982), with tens of millions of copies.', 'It has not been beaten.'],
    [1998, 'Récord de su tiempo', 'Película más taquillera: «Titanic» de James Cameron (1997).', 'Lo fue hasta 2009.', 'Record of its time', 'Highest-grossing film: James Cameron\'s «Titanic» (1997).', 'It held that place until 2009.'],
    [2010, 'Récord de su tiempo', 'Película más taquillera: «Avatar» de James Cameron (2009).', 'Lo fue hasta 2018.', 'Record of its time', 'Highest-grossing film: James Cameron\'s «Avatar» (2009).', 'It held that place until 2018.'],
    [2006, 'Récord de su tiempo', 'El musical que más tiempo lleva en Broadway: «El fantasma de la ópera».', 'Lo fue hasta 2023.', 'Record of its time', 'The longest-running Broadway musical: «The Phantom of the Opera».', 'It held that place until 2023.'],
    [2008, 'Récord de su tiempo', 'Saga de libros más vendida: Harry Potter, de J. K. Rowling.', 'Sigue sin ser superado.', 'Record of its time', 'Best-selling book series: Harry Potter, by J. K. Rowling.', 'It has not been beaten.'],
    [2019, 'Récord de su tiempo', 'Videojuego más vendido de la historia: «Minecraft».', 'Sigue sin ser superado.', 'Record of its time', 'Best-selling video game in history: «Minecraft».', 'It has not been beaten.'],
    [1700, 'Récord de su tiempo', 'El libro más vendido de la historia: la Biblia, con miles de millones de copias.', 'Sigue sin ser superado.', 'Record of its time', 'The best-selling book in history: the Bible, with billions of copies.', 'It has not been beaten.'],
    [1980, 'Récord de su tiempo', 'La canción con más versiones grabadas: «Yesterday» de los Beatles (1965).', 'Sigue sin ser superado.', 'Record of its time', 'The song with the most recorded versions: The Beatles\' «Yesterday» (1965).', 'It has not been beaten.'],
    [2019, 'Récord de su tiempo', 'Película más taquillera: «Avengers: Endgame» (2019).', 'Lo fue hasta 2020.', 'Record of its time', 'Highest-grossing film: «Avengers: Endgame» (2019).', 'It held that place until 2020.'],
    [2021, 'Récord de su tiempo', 'Película más taquillera: «Avatar» de James Cameron, tras su reestreno.', 'Sigue sin ser superado.', 'Record of its time', 'Highest-grossing film: James Cameron\'s «Avatar», after its re-release.', 'It has not been beaten.'],
  ];
  function disponibles(anio) { return LISTA.filter(function (x) { return x[0] <= anio; }); }
  function enIngles() { return ART.idioma && ART.idioma.actual() === 'en'; }
  function ficha(x) { const en = enIngles(); return { anio: x[0], tema: en ? x[4] : x[1], todos: en ? x[5] : x[2], pocos: en ? x[6] : x[3] }; }
  // La de la semana: cambia cada semana y nunca sale del futuro de la partida
  function deLaSemana(desplazar) {
    const S = N.S, anio = S ? N.anio() : 2026, d = disponibles(anio);
    if (!d.length) return null;
    const k = ((S ? S.t : 0) + (desplazar || 0)) % d.length;
    return ficha(d[(k + d.length) % d.length]);
  }
  function todas(anio) { return disponibles(anio).map(ficha); }
  return { LISTA: LISTA, deLaSemana: deLaSemana, todas: todas, total: function () { return LISTA.length; } };
})();
