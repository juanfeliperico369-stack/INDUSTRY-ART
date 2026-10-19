/* ==== módulo: taxonomia ==== */
// La fábrica de ideas: todas las listas del documento, sin duplicados, agrupadas en familias y en orden alfabético
// (pestaña Taxonomía). La familia pesa en la matemática; cada elemento da sabor, palabras para la sinopsis,
// frases de crítica y etiquetas. También el contenido que decide la clasificación, los formatos de época, las épocas
// y lugares de la historia, los idiomas, los públicos, los arquetipos de personajes y las 236 obras de dominio público.
ART.taxonomia = (function () {
  'use strict';
  const D = ART.datos;
  const sp = function (s) { return s.split(','); };
  const alfa = function (a) { return a.slice().sort(function (x, y) { return x.localeCompare(y, 'es'); }); };

  // ---------- Medios y tipos de obra ----------
  // Cada medio con su taxonomía completa; su economía vive en la producción de cine, ART.tv e ART.medios.
  const medios = [
    { id: 'cine', nombre: 'Cine', desde: 1895, activo: true },
    { id: 'tv', nombre: 'Televisión', desde: 1936 },
    { id: 'musica', nombre: 'Música', desde: 1877 },
    { id: 'juegos', nombre: 'Videojuegos', desde: 1972 },
    { id: 'teatro', nombre: 'Teatro', desde: 1850 },
    { id: 'libros', nombre: 'Libros', desde: 1850 },
  ];
  const tiposPorMedio = {
    tv: sp('Animación,Concurso,Documental,Programa de noticias,Serie,Show,Telenovela'),
    musica: sp('Álbum,Banda sonora,Jingle,Single'),
    juegos: sp('Acción,Aventura,Conducción,Deportes,Estrategia,Literatura,Lucha,Mundo abierto,Película interactiva,RPG,Sandbox,Shooter,Simulación'),
    teatro: sp('Comedia,Dramática,Expositiva,Monólogo,Musical,Ópera,Stand up,Tragedia'),
    libros: sp('Cómic,Economía,Filosofía,Historieta,Libro,Manga,Novela,Novela gráfica,Poético'),
  };
  // Tipos de película: cambian el costo, la duración de la producción, los departamentos que pesan y las edades
  const tiposCine = [
    { id: 'real', nombre: 'Imagen real', desde: 1895, costo: 1, semanas: 1, efecto: 'La forma de siempre' },
    { id: 'animacion', nombre: 'Animación', desde: 1908, costo: 1.15, semanas: 1.45, pesos: { arte: 1.9, interprete: 0.45, fotografia: 0.6 }, edades: [1.35, 1.1, 1, 0.92, 0.9], efecto: 'Más arte y más tiempo; gusta a niños y familias' },
    { id: 'hibrido', nombre: 'Híbrido (real y animación)', desde: 1945, costo: 1.3, semanas: 1.25, pesos: { arte: 1.5 }, edades: [1.2, 1.1, 1, 0.95, 0.9], pub: 1, efecto: 'Caro y vistoso: +1 al público' },
    { id: 'documental', nombre: 'Documental', desde: 1922, costo: 0.45, semanas: 0.8, realidad: true, crit: 2, pub: -4, pesos: { interprete: 0.4, edicion: 1.6, fotografia: 1.3 }, edades: [0.5, 0.7, 0.9, 1.2, 1.3], efecto: 'Barato: +2 a la crítica, −4 al público' },
    { id: 'captura', nombre: 'Captura de movimiento', desde: 2004, costo: 1.25, semanas: 1.4, pesos: { arte: 1.4, interprete: 0.9 }, edades: [1.1, 1.2, 1.1, 0.95, 0.9], pub: 1, efecto: 'Actores reales dentro de personajes digitales: caro, +1 al público' },
    { id: 'digitales', nombre: 'Actores digitales', desde: 2031, costo: 1.15, semanas: 1.2, pesos: { arte: 1.3, interprete: 0.7 }, crit: -1, pub: 1, efecto: 'Intérpretes creados por computadora o con licencia: +1 al público, −1 a la crítica' },
    { id: 'volumetrica', nombre: 'Captura volumétrica', desde: 2046, costo: 1.35, semanas: 1.3, pesos: { arte: 1.5, fotografia: 1.2 }, edades: [1, 1.2, 1.2, 1, 0.9], pub: 2, efecto: 'Escenas grabadas en tres dimensiones que se recorren: muy caro, +2 al público' },
    { id: 'jugable', nombre: 'Historia jugable', desde: 2018, costo: 1.2, semanas: 1.2, pub: 1, edades: [0.8, 1.4, 1.3, 0.8, 0.5], efecto: 'El público elige el camino: +1 al público joven' },
  ];

  // ---------- Géneros de los demás medios (el cine usa ART.datos.familias) ----------
  // eje: el eje de afinidad del cine más parecido; con él se arma la tabla de encaje propia de cada medio.
  const fam = function (id, nombre, generos, nucleo, inclina, eje) { return { id: id, nombre: nombre, generos: alfa(sp(generos)), nucleo: nucleo, inclina: inclina, eje: eje }; };
  const generosMedio = {
    tv: [
      fam('TF', 'Ficción televisiva', 'Antología,Comedia dramática,K-Drama,Procedimental,Serie web,Sitcom,Sketches,Soap opera,Telenovela', 'Todos', 'pub', 'HM'),
      fam('TE', 'Entretenimiento en vivo', 'Citas,Concurso,Deportes en vivo,Game show,Late night,Magacín,Premiaciones,Reality,Talent show,Talk show,Telecompras,Variety show', 'Familias y adultos', 'pub', 'FJ'),
      fam('TN', 'No ficción', 'Análisis,Cocina,Divulgación científica,Docuserie,Educativo,Estilo de vida,Informativo,Noticias,True crime,Vida salvaje', 'Adultos', 'eq', 'DR'),
    ],
    juegos: [
      fam('JA', 'Acción', 'Acción,Arcade,Battle royale,Lucha,Plataformas,Shooter en primera persona,Shooter en tercera persona,Sigilo', 'Jóvenes', 'pub', 'AA'),
      fam('JX', 'Aventura y exploración', 'Aventura,Horror / Terror,Metroidvania,Mundo abierto,Roguelike / Roguelite,Supervivencia', 'Jóvenes y adultos', 'eq', 'IM'),
      fam('JR', 'Rol', 'Gacha,MMORPG,RPG', 'Jóvenes, adultos y fans', 'pub', 'IM'),
      fam('JE', 'Estrategia', '4X,Cartas,Estrategia,Estrategia en tiempo real,MOBA,Por turnos,Táctica,Táctico', 'Adultos', 'crit', 'SM'),
      fam('JS', 'Simulación y construcción', 'Construcción,Gestión / Tycoon,Sandbox,Simulación,Vida', 'Todos', 'eq', 'DR'),
      fam('JD', 'Deportes y velocidad', 'Carreras,Deportes', 'Jóvenes y adultos', 'pub', 'AA'),
      fam('JM', 'Música y fiesta', 'Musical,Party game,Puzzle,Rhythm game', 'Todos y familias', 'pub', 'HM'),
      fam('JN', 'Narrativa y deseo', 'Erótico,Novela visual,Película interactiva', 'Adultos', 'crit', 'RD'),
    ],
    libros: [
      fam('LF', 'Formatos narrativos y gráficos', 'Cómic,Cuento,Interactiva,Manga,Microrrelato,Novela,Novela gráfica,Pulp,Revista,Serializada,Tiras cómicas', 'Todos', 'pub', 'HM'),
      fam('LP', 'Poesía, mito y tradición', 'Dramaturgia,Épica,Epopeya,Fábula,Folklórica,Leyenda,Mito,Mitología,Poesía', 'Adultos y estudiantes', 'crit', 'AV'),
      fam('LN', 'No ficción y pensamiento', 'Autobiografía,Biografía,Ciencia,Crónica,Diario,Economía,Ensayo,Epistolar,Filosofía,Filosófica,Memorias,Política,Psicología,Tecnología,Testimonial,Viajes', 'Adultos', 'crit', 'DR'),
      fam('LI', 'Imaginación', 'Ciencia ficción,Fantasía,Futurismo,Gótico,Realismo mágico', 'Jóvenes y adultos', 'eq', 'IM'),
      fam('LS', 'Suspenso y crimen', 'Crimen,Misterio,Neo-noir,Novela negra,Terror,Thriller', 'Adultos', 'pub', 'SM'),
      fam('LD', 'Drama y realidad', 'Contemporánea,Costumbrismo,Cotidianidad,Cultural,Drama,Literaria,Novela de formación,Realismo,Social,Tragedia,Urbana', 'Adultos', 'crit', 'DR'),
      fam('LA', 'Aventura', 'Aventura,Bélico,Western', 'Jóvenes y adultos', 'pub', 'AA'),
      fam('LH', 'Humor y sátira', 'Comedia,Satírica', 'Todos', 'pub', 'HM'),
      fam('LJ', 'Público joven y demográfico', 'Infantil,Josei,Juvenil,Seinen,Shōjo,Shōnen', 'Niños, adolescentes y lectores de manga', 'pub', 'FJ'),
      fam('LR', 'Romance y deseo', 'Erótica,Romance', 'Adultos', 'pub', 'RD'),
      fam('LV', 'Vanguardia', 'Absurdismo,Experimental,Surrealismo', 'Adultos', 'crit', 'AV'),
    ],
    musica: [
      fam('MP', 'Pop y baile', 'City pop,Dance,Disco,K-Pop,Pop', 'Jóvenes', 'pub', 'HM'),
      fam('MR', 'Rock y alternativo', 'Heavy metal,Indie / Alternativa,Metal,Punk,Rock', 'Jóvenes y adultos', 'eq', 'AA'),
      fam('MU', 'Urbano', 'Hip hop,Rap,Reggaetón,Trap', 'Jóvenes', 'pub', 'SM'),
      fam('MA', 'Raíces afroamericanas', 'Blues,Funk,Gospel,Jazz,R&B,Soul', 'Adultos', 'crit', 'DR'),
      fam('ME', 'Electrónica', 'Ambiental,Electrónica,House,Lo-fi,New age / New wave,Space age,Synthwave,Techno,Trance', 'Jóvenes', 'eq', 'IM'),
      fam('ML', 'Latino y caribeño', 'Cumbia,Latino,Merengue,Mexicana,Reggae,Salsa,Samba', 'Todos', 'pub', 'HM'),
      fam('MT', 'Raíces y tradición', 'Afrobeat,Country,Flamenco,Folk,Folklórico', 'Adultos', 'eq', 'FJ'),
      fam('MC', 'Clásica, escena y vanguardia', 'Banda sonora,Clásica,Experimental,Ópera', 'Adultos', 'crit', 'AV'),
      fam('MD', 'Romántica y deseo', 'Balada,Bolero,Erótica', 'Adultos', 'pub', 'RD'),
      fam('MG', 'General', 'Estándar', 'Todos', 'eq', 'DR'),
    ],
    teatro: [
      fam('XD', 'Drama', 'Autobiográfico,Costumbrismo,Drama,Histórico,Melodrama,Psicológico,Tragedia', 'Adultos', 'crit', 'DR'),
      fam('XC', 'Comedia', 'Comedia,Farsa,Improvisación,Monólogo,Satírico,Tragicomedia', 'Todos', 'pub', 'HM'),
      fam('XM', 'Música y movimiento', 'Danza,Físico,Mímica,Musical', 'Todos', 'pub', 'HM'),
      fam('XP', 'Compromiso', 'Documental,Político,Social', 'Adultos', 'crit', 'DR'),
      fam('XI', 'Imaginación y misterio', 'Épico,Misterio,Mitológico,Terror', 'Jóvenes y adultos', 'eq', 'IM'),
      fam('XT', 'Tradición y rito', 'Marionetas,Oriental,Ritual,Sacramental,Sombras', 'Familias y público local', 'crit', 'FJ'),
      fam('XV', 'Vanguardia', 'Absurdo,Artística,Callejero,Experimental,Inmersivo,Instalaciones,Performativo,Poético', 'Adultos', 'crit', 'AV'),
      fam('XJ', 'Público joven', 'Infantil,Juvenil', 'Niños y adolescentes', 'pub', 'FJ'),
      fam('XR', 'Romance y deseo', 'Erótico', 'Adultos', 'pub', 'RD'),
    ],
  };
  // Tabla de encaje propia de cada medio: sale de la del cine a través del eje de cada familia (misma familia: —).
  function tablaEncaje(medio) {
    const fams = medio === 'cine' ? D.familias.map(function (f) { return { id: f.id, eje: f.id }; }) : generosMedio[medio];
    return fams.map(function (a) {
      return fams.map(function (b) { return a.id === b.id ? null : a.eje === b.eje ? 1 : D.encaje(a.eje, b.eje); });
    });
  }

  // ---------- Premisas y tropos (v2): 56 en 8 familias; 0 a 2 por obra, dan frases a la sinopsis y al marketing ----------
  // afin: con qué familias del cine encaja mejor cada familia de premisas
  const familiasPremisa = [
    { id: 'VC', nombre: 'Viaje y cambio', items: sp('Elegido,Empezar de cero,Mayoría de edad,Pez fuera del agua,Regreso a casa,Segunda oportunidad,Viaje del héroe'), afin: ['IM', 'FJ', 'DR', 'AA'] },
    { id: 'PC', nombre: 'Poder y conflicto', items: sp('Ascenso y caída,David contra Goliat,Justicia por mano propia,Lucha por el trono,Rebelión contra el sistema,Traición del mentor,Último bastión'), afin: ['AA', 'DR', 'IM'] },
    { id: 'CE', nombre: 'Crimen y engaño', items: sp('Chantaje,Doble agente,El gran golpe,Encerrado con el culpable,Falso culpable,Identidad secreta,Último trabajo'), afin: ['SM', 'AA', 'DR'] },
    { id: 'AV', nombre: 'Amor y vínculos', items: sp('Amor prohibido,Enemigos que se enamoran,Familia elegida,Hermanos separados,Matrimonio por conveniencia,Reencuentro,Triángulo amoroso'), afin: ['RD', 'DR', 'HM', 'FJ'] },
    { id: 'TM', nombre: 'Tiempo y misterio', items: sp('Amnesia,Bucle temporal,Desaparición sin rastro,Mensaje del pasado,Mundo paralelo,Secreto de familia,Visitante del futuro'), afin: ['IM', 'SM', 'AV'] },
    { id: 'SA', nombre: 'Supervivencia y amenaza', items: sp('Asedio,Catástrofe que se acerca,Contagio,Invasión,Monstruo en las sombras,Náufragos,Última noche'), afin: ['SM', 'AA', 'IM'] },
    { id: 'HE', nombre: 'Humor y enredo', items: sp('Boda caótica,Confusión de identidades,Herencia con condiciones,Intercambio de cuerpos,Mentira que crece,Pareja dispareja,Viaje por carretera'), afin: ['HM', 'RD', 'FJ'] },
    { id: 'EM', nombre: 'Equipo y misión', items: sp('Aprendiz que supera al maestro,Equipo improbable,Expedición,Misión sin regreso,Rescate,Reunir al equipo,Torneo'), afin: ['AA', 'FJ', 'IM'] },
  ];

  // ---------- Subgéneros: 38 son también géneros (usan la familia de su género), 179 propios en 12 familias y, además,
  // los géneros de los otros medios que sirven de subgénero (se agregan en listaSubgeneros) ----------
  // afin: encaje de la familia del subgénero con cada familia del cine (++ 3, + 1, 0, − 2)
  const subgenerosGenero = sp('Acción,Aventura,Ciencia ficción,Fantasía,Terror,Thriller,Misterio,Crimen,Policial,Noir,Drama,Romance,Comedia,Musical,Histórico,Bélico,Western,Superhéroes,Biográfico,Político,Social,Deportivo,Judicial,Espionaje,Religioso,Falso documental,Experimental,Surrealista,Adolescentes,Melodrama,Parodia,Infantil,Catástrofes,Épico,Artes,Monstruos,Festivo,Folklórico');
  const familiasSub = [
    { id: 'FT', nombre: 'Futuros y tecnología', items: sp('Apocalíptico,Ciencia ficción dura,Ciencia ficción militar,Climáticas,Colonias espaciales,Cósmico,Distopía,Extraterrestres,Futurismo,Inmersión virtual,Mecha,Nave generacional,Post apocalíptico,Primer contacto,Realidad simulada,Rebelión de las máquinas,Robótica,Space opera,Tecnología,Terraformación,Transhumanismo,Ucronía,Utopía,Viajes en el tiempo,Western espacial'),
      afin: { AA: 1, IM: 3, SM: 1, DR: 0, HM: 0, FJ: 0, AV: 1, RD: -2 } },
    { id: 'FM', nombre: 'Fantasía y mito', items: sp('Artes marciales,Crepuscular,Espada y brujería,Fantasía oscura,Fantasía urbana,Folklore,Grimdark,Isekai,Leyendas,Magia,Mitología,Realismo mágico,Wuxia'),
      afin: { AA: 1, IM: 3, SM: 0, DR: 0, HM: 0, FJ: 1, AV: 1, RD: 0 } },
    { id: 'HO', nombre: 'Horror', items: sp('Brujería,Casa embrujada,Corporal,Gore,Gótico,Gótico romántico,Horror analógico,Horror folclórico,Horror tecnológico,Kaiju,Licántropos,Lovecraftiano,Monstruo marino,Paranormal,Posesiones,Psicológico,Slasher,Splatterpunk,Survival horror,Vampírico,Zombies'),
      afin: { AA: 0, IM: 1, SM: 3, DR: -2, HM: -2, FJ: -2, AV: 1, RD: -2 } },
    { id: 'CM', nombre: 'Crimen y misterio', items: sp('Asesino en serie,Detective privado,Detectives,Estafa,Habitación cerrada,Heist,Mafia,Narcos,Neo-noir,Policías corruptos,¿Quién lo hizo?'),
      afin: { AA: 1, IM: 0, SM: 3, DR: 1, HM: 0, FJ: -2, AV: 0, RD: 0 } },
    { id: 'VO', nombre: 'Vida, oficio y sátira', items: sp('Médico,Militar,Sátira,Supervivencia,Urbano,Viajes'),
      afin: { AA: 1, IM: 0, SM: 0, DR: 3, HM: 1, FJ: 0, AV: 1, RD: 0 } },
    { id: 'MV', nombre: 'Motor y velocidad', items: sp('Arrancones,Carreras callejeras,Carreras de autos,Drift,Karting,Monoplazas,Motociclismo,Rally,Resistencia,Stock cars en óvalo,Todoterreno'),
      afin: { AA: 3, IM: 0, SM: 1, DR: 0, HM: 1, FJ: 1, AV: -2, RD: 0 } },
    { id: 'PK', nombre: 'Familia punk (retrofuturismos)', items: sp('Atompunk,Biopunk,Casetepunk,Clockpunk,Cyberpunk,Decopunk,Dieselpunk,Elfpunk,Esperanzapunk,Fantasía de lámparas de gas,Lunarpunk,Mitopunk,Nanopunk,Postcyberpunk,Raypunk,Retrofuturismo,Silkpunk,Solarpunk,Steampunk'),
      afin: { AA: 1, IM: 3, SM: 1, DR: 0, HM: 0, FJ: 0, AV: 1, RD: -2 } },
    { id: 'HE', nombre: 'Historia y época', items: sp('Años locos,Belle Époque,Caballerías,Capa y espada,Colonial,Faraónico,Feudal japonés,Gauchesco,Imperial chino,Medieval,Napoleónico,Péplum,Piratas,Regencia,Revolucionario,Samuráis,Victoriano,Vikingos'),
      afin: { AA: 3, IM: 0, SM: 0, DR: 3, HM: -2, FJ: -2, AV: 0, RD: 1 } },
    { id: 'AE', nombre: 'Aventura y exploración', items: sp('Alta montaña,Búsqueda del tesoro,Expedición polar,Exploradores,Mundo perdido,Náufragos,Safari,Selva,Submarino,Viajes extraordinarios'),
      afin: { AA: 3, IM: 1, SM: 0, DR: 0, HM: 1, FJ: 3, AV: -2, RD: 0 } },
    { id: 'DC', nombre: 'Deporte y competencia', items: sp('Ajedrez,Básquet,Béisbol,Boxeo,Deportes extremos,Equitación,Fútbol,Olímpico,Surf,Torneo'),
      afin: { AA: 3, IM: -2, SM: 0, DR: 3, HM: 1, FJ: 1, AV: -2, RD: 0 } },
    { id: 'RV', nombre: 'Relaciones y vida cotidiana', items: sp('Amor de verano,Amor imposible,Bodas,Comedia romántica,Divorcio,Drama de oficina,Drama familiar,Gastronómico,Vecinos,Vida de barrio,Vida rural'),
      afin: { AA: -2, IM: -2, SM: 0, DR: 3, HM: 3, FJ: 1, AV: 0, RD: 3 } },
    { id: 'MS', nombre: 'Música y escena', items: sp('Biografía musical,Cabaret,Circo,Musical de escenario,Ópera rock,Revista musical,Vodevil,Zarzuela'),
      afin: { AA: 0, IM: 0, SM: -2, DR: 1, HM: 3, FJ: 1, AV: 1, RD: 1 } },
  ];
  // Modas de subgéneros: en esos años suman público; si llegan 30 años antes, la obra se adelanta a su época
  // (menos público, más culto)
  const modasSub = [['Cyberpunk', 1982, 2000], ['Steampunk', 1987, 2015], ['Dieselpunk', 2001, 2025], ['Solarpunk', 2008, 2040],
    ['Biopunk', 1990, 2010], ['Atompunk', 1995, 2020], ['Postcyberpunk', 1995, 2015], ['Retrofuturismo', 1975, 2000],
    ['Esperanzapunk', 2017, 2045], ['Lunarpunk', 2020, 2050], ['Nanopunk', 2030, 2060], ['Slasher', 1978, 1990], ['Zombies', 2002, 2016],
    ['Vampírico', 2005, 2012], ['Isekai', 2012, 2025], ['Kaiju', 1954, 1975], ['Western espacial', 1977, 1990], ['Space opera', 1977, 1995],
    ['Battle royale', 2017, 2023], ['K-Pop', 2012, 2025], ['Synthwave', 2011, 2020], ['Lo-fi', 2017, 2025], ['Metroidvania', 2009, 2020],
    ['Novela visual', 2005, 2020], ['True crime', 2014, 2025], ['Reality', 2000, 2012], ['Telenovela', 1970, 2000],
    ['Gótico romántico', 1790, 1830], ['Capa y espada', 1840, 1960], ['Péplum', 1950, 1965], ['Piratas', 1935, 1955],
    ['Comedia romántica', 1985, 2005], ['Viajes extraordinarios', 1863, 1910], ['Serializada', 1836, 1880],
    ['Superhéroes', 2008, 2023], ['Heist', 1999, 2008], ['Distopía', 2008, 2016], ['Post apocalíptico', 1979, 1990],
    ['Casa embrujada', 1960, 1982], ['Survival horror', 1996, 2008], ['Mecha', 1979, 1999], ['Wuxia', 1965, 1980],
    ['Artes marciales', 1971, 1985], ['Fantasía urbana', 1995, 2015]].map(function (m) { return { id: m[0], desde: m[1], hasta: m[2] }; });
  function modaSub(subs, anio) {
    const r = { pub: 0, crit: 0, notas: [] };
    (subs || []).forEach(function (x) {
      const m = modasSub.filter(function (y) { return y.id === x; })[0];
      if (!m) return;
      if (anio >= m.desde && anio <= m.hasta) { r.pub += 1; r.notas.push([1, x + ' está de moda']); }
      else if (anio < m.desde - 30) { r.pub -= 1; r.crit += 1; r.notas.push([0, x + ': adelantado a su época']); }
    });
    r.pub = Math.max(-2, Math.min(2, r.pub)); r.crit = Math.min(2, r.crit);
    return r;
  }
  // Subgéneros que suben la clasificación (siempre con guiños: en pantalla nada es gráfico)
  const subMinimos = { Gore: { violencia: 5 }, Slasher: { violencia: 4 }, Corporal: { terror: 4 } };

  // ---------- Temas y tópicos: 380 en 19 familias (los 10 deportes nuevos van marcados con *) ----------
  const familiasTema = [
    { id: 'EV', nombre: 'Emociones y vínculos', items: sp('Aislamiento,Amistad,Amor,Culpa,Culpabilidad,Depresión,Dudas,Duelo,Empatía,Esperanza,Familia,Hermanos,Lealtad,Locura,Memoria,Mentiras,Miedo,Obsesión,Perdón,Rivalidad,Secretos,Soledad,Traición,Trauma,Venganza'),
      afin: { AA: 0, IM: 0, SM: 1, DR: 3, HM: 0, FJ: 1, AV: 1, RD: 3 } },
    { id: 'VE', nombre: 'Vida y existencia', items: sp('Adolescencia,Adultez,Ambición,Bien y mal,Búsqueda,Codicia,Conciencia,Destino,Existencia,Éxito,Fama,Fracaso,Héroes,Honor,Humanidad,Humildad,Identidad,Infancia,Inmortalidad,Libertad,Lo prohibido,Moralidad,Mortalidad,Muerte,Redención,Sacrificio,Ser humano,Sueños,Vejez,Villanos'),
      afin: { AA: 1, IM: 1, SM: 0, DR: 3, HM: 0, FJ: 1, AV: 1, RD: 0 } },
    { id: 'SP', nombre: 'Sociedad y poder', items: sp('Asesinos,Clase social,Colonialismo,Corrupción,Deshumanización,Desigualdad,Dictadura,Dictaduras,Dinero,Discriminación,Drogas,Esclavitud,Exclusión,Exilio,Explotación,Gánsteres,Guerra,Imperialismo,Injusticia,Justicia,Mafia,Migración,Minería,Negocios,Paz,Pobreza,Poder,Política,Propaganda,Racismo,Radicalización,Rebelión,Revolución,Riqueza,Robos,Sociedad,Terrorismo,Vigilancia,Xenofobia'),
      afin: { AA: 1, IM: 0, SM: 3, DR: 3, HM: 0, FJ: -2, AV: 1, RD: -2 } },
    { id: 'IF', nombre: 'Ideologías, fe y filosofía', items: sp('Alquimia,Anarquismo,Ateísmo,Capitalismo,Civilización y barbarie,Comunismo,Conocimiento,Dios,Dioses,Existencialismo,Fascismo,Fe,Filosofía,Nihilismo,Ocultismo,Orden y caos,Religión,Socialismo,Verdad'),
      afin: { AA: -2, IM: 1, SM: 1, DR: 1, HM: -2, FJ: -2, AV: 3, RD: 0 } },
    { id: 'CT', nombre: 'Ciencia, tecnología y naturaleza', items: sp('Bombas nucleares,Carrera espacial,Cibernética,Ciencia,Clonación,Espacio,Evolución,Genética,Hackers,Humanidad y máquinas,IA,Informática,Naturaleza,Planetas,Progreso,Realidad virtual,Supervivencia,Tecnología,Tiempo'),
      afin: { AA: 1, IM: 3, SM: 1, DR: 0, HM: 0, FJ: 0, AV: 0, RD: -2 } },
    { id: 'AO', nombre: 'Arte, ocio y deporte', items: sp('Actuación,Ajedrez*,Arte,Artes,Atletismo*,Automovilismo*,Baloncesto*,Béisbol*,Boxeo*,Caza,Ciclismo*,Cine,Cómics,Deportes electrónicos*,Elegancia,Entrenamiento,Fútbol,Historietas,Humor,Literatura,Lucha,Mangas,Moda,Música,Natación*,Superhéroes,Tenis*,Videojuegos').map(function (x) { return x.replace('*', ''); }),
      afin: { AA: 1, IM: 0, SM: -2, DR: 1, HM: 3, FJ: 1, AV: 1, RD: 0 } },
    { id: 'FH', nombre: 'Fantasía heroica', items: sp('Caballeros,Elfos,Enanos,Hechiceros,Magia,Magos,Monarquías,Orcos,Reyes'),
      afin: { AA: 3, IM: 3, SM: 0, DR: -2, HM: 0, FJ: 1, AV: -2, RD: 0 } },
    { id: 'EH', nombre: 'Épocas e historia', items: sp('América,Antiguo Egipto,China imperial,Civilizaciones,Cruzadas,Culturas indígenas,Descubrimientos,Era digital,Era victoriana,Esparta,Fiebre del oro,Gladiadores,Globalización,Gran Depresión,Grecia clásica,Guerra de trincheras,Guerra Fría,Guerras napoleónicas,Holocausto,Ilustración,Imperio mongol,Imperio romano,Imprenta,Incas,Independencia,Independencias,India antigua,Inquisición,Islámico,Japón feudal,Las pirámides,Mayas,Medieval,Mesopotamia,Muro de Berlín,Nazismo,Olímpicos,Peloponeso,Peste negra,Piratas,Precolombinas,Prehistoria,Primera Guerra Mundial,Reinado del Terror,Renacimiento,Resistencia,Revolución francesa,Revolución industrial,Revolución rusa,Revoluciones artísticas,Revoluciones tecnológicas,Ruta de la Seda,Salvaje oeste,Segunda Guerra Mundial,Siglo XIX,Templarios,Tenochtitlan,Vikingos'),
      afin: { AA: 3, IM: 0, SM: 0, DR: 3, HM: -2, FJ: -2, AV: 0, RD: 1 } },
    { id: 'FO', nombre: 'Fantasía oscura y lo sobrenatural', items: sp('Brujas y aquelarres,Casas embrujadas,Castillos góticos,Cazadores de monstruos,Criaturas de la noche,Demonios,Exorcismos,Fantasmas,Hombres lobo,Inmortales malditos,Linajes de sangre,Maldiciones antiguas,Momias,Nigromancia,No muertos,Pactos con el diablo,Posesiones,Sectas,Vampiros'),
      afin: { AA: 0, IM: 3, SM: 3, DR: 0, HM: -2, FJ: -2, AV: 1, RD: 1 } },
    { id: 'MV', nombre: 'Motor y velocidad', items: sp('Arrancones,Autos clásicos,Camiones y todoterreno,Carreras callejeras,Carreras clandestinas,Drift,Escuderías y pilotos,Gran premio,Karting,Mecánicos y talleres,Monoplazas de máxima categoría,Motociclismo,Persecuciones,Rally,Récords de velocidad,Resistencia de 24 horas,Stock cars en óvalo'),
      afin: { AA: 3, IM: 0, SM: 1, DR: 1, HM: 1, FJ: 1, AV: -2, RD: 0 } },
    { id: 'TC', nombre: 'Tópicos clásicos', items: sp('Castigo,Celos,Creación,Deber,Deseo,Despedida,Engaño,Historia,Ingenio,Sabiduría,Seducción,Transformación,Valentía'),
      afin: { AA: 0, IM: 1, SM: 1, DR: 3, HM: 1, FJ: 0, AV: 1, RD: 3 } },
    { id: 'TD', nombre: 'Trabajo, dinero y oficios', items: sp('Apuestas,Ascenso social,Corporaciones,Desempleo,Deudas,El oficio,Emprendimiento,Estafas,Herencia,Huelga,Lujo,Sindicatos'),
      afin: { AA: 0, IM: -2, SM: 1, DR: 3, HM: 3, FJ: 0, AV: 1, RD: 0 } },
    { id: 'LV', nombre: 'Lugares y viajes', items: sp('Carretera,Ciudad,Desierto,Frontera,Hogar,Islas,Mar,Montaña,Pueblo,Puertos,Raíces,Trenes'),
      afin: { AA: 3, IM: 1, SM: 0, DR: 1, HM: 1, FJ: 1, AV: 1, RD: 1 } },
    { id: 'NP', nombre: 'Naturaleza y planeta', items: sp('Agua,Animales,Bosques,Cambio climático,Desastres naturales,Estaciones del año,Extinción,Océanos,Selvas,Volcanes'),
      afin: { AA: 3, IM: 1, SM: 0, DR: 1, HM: 0, FJ: 3, AV: 1, RD: -2 } },
    { id: 'FE', nombre: 'Futuro y especulación', items: sp('Colonias en el espacio,Contacto extraterrestre,Fin del mundo,Inmortalidad digital,Megaciudades,Mundos paralelos,Realidad simulada,Robots,Transhumanismo,Viajes en el tiempo'),
      afin: { AA: 1, IM: 3, SM: 1, DR: 0, HM: 0, FJ: 0, AV: 1, RD: -2 } },
    { id: 'IJ', nombre: 'Infancia, escuela y juventud', items: sp('Acoso escolar,Campamentos,Crecer,Escuela,Graduación,Juegos de infancia,Mascotas,Pandillas,Primer amor,Rebeldía'),
      afin: { AA: 0, IM: 1, SM: -2, DR: 1, HM: 3, FJ: 3, AV: 0, RD: 1 } },
    { id: 'CU', nombre: 'Cuerpo y mente', items: sp('Belleza,Cuerpo,Discapacidad,Insomnio,Medicina,Mente,Salud pública'),
      afin: { AA: -2, IM: 0, SM: 1, DR: 3, HM: 0, FJ: 0, AV: 3, RD: 1 } },
    { id: 'FR', nombre: 'Fiestas, ritos y tradiciones', items: sp('Bodas y casamientos,Carnaval,Día de Muertos,Folclor,Funerales,Gastronomía,Leyendas urbanas,Navidad,Peregrinaciones,Ritos de paso'),
      afin: { AA: 0, IM: 1, SM: 0, DR: 1, HM: 3, FJ: 3, AV: 1, RD: 1 } },
    { id: 'TL', nombre: 'Tópicos literarios', items: sp('Amor cortés,Amor post mortem,Beatus ille,Carpe diem,Descenso a los infiernos,Edad de oro,El mundo al revés,Homo viator,La vida es sueño,Locus amoenus,Memento mori,Menosprecio de corte,Tempus fugit,Theatrum mundi,Ubi sunt,Vanitas').concat(['Collige, virgo, rosas']),
      afin: { AA: -2, IM: 1, SM: 0, DR: 3, HM: 0, FJ: -2, AV: 3, RD: 3 } },
  ];
  const DEPORTES_NUEVOS = sp('Ajedrez,Atletismo,Automovilismo,Baloncesto,Béisbol,Boxeo,Ciclismo,Deportes electrónicos,Natación,Tenis');

  // ---------- Problemáticas y argumentos: 53 en 7 familias, cada una con su frase para la sinopsis ----------
  // La frase completa la oración "<protagonista> ..." de la sinopsis.
  const familiasProblema = [
    { id: 'CL', nombre: 'Conflicto y lucha', inclina: 'pub', items: {
      'Amenaza': 'enfrenta una amenaza que crece cada día', 'Competencia': 'compite contra rivales que no perdonan errores',
      'Contra la sociedad': 'se enfrenta a las reglas de su mundo', 'Contra sí mismo': 'pelea contra sus propios demonios',
      'La naturaleza': 'sobrevive a una naturaleza desatada', 'La supervivencia': 'hace lo imposible por seguir con vida',
      'La tecnología': 'se enfrenta a las máquinas que alguien creyó controlar', 'Persecución': 'persigue a quien le arrebató todo',
      'Rebelión': 'se rebela contra el poder que {la} oprime', 'Vencer': 'lo arriesga todo para ganar' } },
    { id: 'VB', nombre: 'Viaje y búsqueda', inclina: 'pub', items: {
      'Descubrimiento': 'descubre algo que nadie debía saber', 'El regreso': 'vuelve a casa después de demasiados años',
      'El viaje': 'emprende un viaje sin mapa', 'Escape': 'intenta escapar de un lugar del que nadie sale',
      'La búsqueda': 'busca lo único que puede salvar{la}', 'Una misión': 'acepta una misión que nadie más quiso' } },
    { id: 'ME', nombre: 'Misterio y engaño', inclina: 'eq', items: {
      'Identidades': 'vive con una identidad que no es la suya', 'Investigación': 'investiga un caso que todos dan por cerrado',
      'La verdad': 'persigue una verdad incómoda', 'Lo oculto': 'encuentra lo que alguien escondió con cuidado',
      'Observar a los demás': 'observa en secreto la vida de los demás', 'Planear': 'planea el golpe perfecto',
      'Secretos': 'guarda un secreto que puede destruirlo todo', 'Secuestros': 'intenta rescatar a alguien que fue secuestrado' } },
    { id: 'DS', nombre: 'Destino y lo sobrenatural', inclina: 'eq', items: {
      'El destino': 'intenta escapar de su destino', 'La religión': 'pone a prueba su fe', 'Lo imposible': 'se atreve con lo imposible',
      'Lo prohibido': 'cruza una línea prohibida', 'Maldición': 'carga con una maldición antigua',
      'Profecía': 'descubre que una profecía habla de su vida', 'Tormentos': 'vive atormentad{a} por algo que no entiende' } },
    { id: 'AC', nombre: 'Ascenso, caída y moral', inclina: 'crit', items: {
      'Condena': 'paga una condena que no merece', 'Crisis': 'atraviesa la peor crisis de su vida', 'Deudas y promesas': 'debe cumplir una promesa imposible',
      'Dilema': 'tiene que elegir entre dos males', 'El ego': 'se deja llevar por su ego', 'Enfermedad': 'enfrenta una enfermedad sin cura',
      'Honor': 'defiende su honor a cualquier precio', 'La Ascensión': 'escala hasta la cima', 'La caída': 'lo pierde todo de golpe',
      'Redención': 'busca redimirse de un error', 'Renacimiento': 'empieza de cero', 'Sacrificio': 'sacrifica lo que más quiere' } },
    { id: 'VI', nombre: 'Vínculos', inclina: 'eq', items: {
      'Amistad': 'descubre el valor de una amistad improbable', 'Amor': 'se enamora en el peor momento posible',
      'Diferencias sociales': 'ama a alguien de otro mundo social', 'Familia': 'intenta salvar a su familia',
      'Mentor y aprendiz': 'aprende de un maestro imperfecto', 'Romántica': 'vive un romance contra todo pronóstico',
      'Traición': 'es traicionad{a} por quien más quería' } },
    { id: 'TR', nombre: 'Tono del relato', inclina: 'eq', items: {
      'Comedia': 'se mete en un enredo cada vez más absurdo', 'Justiciero': 'decide hacer justicia por su cuenta',
      'Tragedia': 'avanza hacia un final que no puede evitar' } },
  ];

  // ---------- Arcos (Kurt Vonnegut y el estudio de 1.700 novelas) y subarcos ----------
  // forma: puntos de la curva de fortuna para dibujarla; final: frase que cierra la sinopsis.
  const arcos = [
    { id: 'pobreza', nombre: 'De la pobreza a la riqueza', orig: 'Rags to riches', forma: [0.1, 0.35, 0.6, 0.9], pub: 1, crit: 0, final: 'y sube sin mirar atrás' },
    { id: 'ruina', nombre: 'De la riqueza a la ruina', orig: 'Riches to rags', forma: [0.9, 0.65, 0.4, 0.1], pub: -1, crit: 1, final: 'y cae sin remedio' },
    { id: 'pozo', nombre: 'Hombre en el pozo', orig: 'Man in a hole', forma: [0.6, 0.15, 0.4, 0.8], pub: 1, crit: 0, final: 'toca fondo y vuelve a levantarse' },
    { id: 'doblepozo', nombre: 'Doble pozo', orig: 'Double man in a hole', forma: [0.6, 0.2, 0.65, 0.15, 0.8], pub: 0, crit: 1, final: 'cae, se levanta, vuelve a caer y aun así se levanta' },
    { id: 'icaro', nombre: 'Ícaro', orig: 'Icarus', forma: [0.2, 0.55, 0.9, 0.15], pub: 0, crit: 1, final: 'y sube más alto de lo que puede sostener' },
    { id: 'edipo', nombre: 'Edipo', orig: 'Oedipus', forma: [0.7, 0.2, 0.75, 0.05], pub: -1, crit: 2, final: 'y cuando por fin se levanta, el destino {la} vuelve a hundir' },
    { id: 'cenicienta', nombre: 'Cenicienta', orig: 'Cinderella', forma: [0.15, 0.7, 0.25, 0.95], pub: 1, crit: 0, final: 'lo pierde todo y termina más alto que nunca' },
  ];
  const subarcos = [
    { id: 'plano', nombre: 'Arco plano', orig: 'Flat arc' }, { id: 'chico', nombre: 'Chico conoce chica', orig: 'Boy meets girl', fam: 'RD' },
    { id: 'desgracia', nombre: 'Caída en desgracia', orig: 'Fall from grace', fam: 'DR' }, { id: 'peor', nombre: 'De mal en peor', orig: 'From bad to worse', fam: 'SM' },
    { id: 'mayor', nombre: 'Hacerse mayor', orig: 'Coming of age', fam: 'FJ' }, { id: 'hamlet', nombre: 'Hamlet', orig: 'Hamlet', fam: 'DR' },
    { id: 'creacion', nombre: 'Historia de creación', orig: 'Creation story', fam: 'IM' }, { id: 'idavuelta', nombre: 'Ida y vuelta', orig: 'Voyage and return', fam: 'AA' },
    { id: 'busqueda', nombre: 'La búsqueda', orig: 'The quest', fam: 'AA' }, { id: 'redencion', nombre: 'Redención', orig: 'Redemption', fam: 'DR' },
  ];

  // ---------- Tipos de ficción: 34 en 6 familias ----------
  const familiasFiccion = [
    { id: 'RT', nombre: 'Realista y testimonial', items: sp('Autoficción,Docuficción,Estándar,Histórica,Realista'), crit: 1, pub: 0 },
    { id: 'EF', nombre: 'Especulativa y fantástica', items: sp('Especulativa,Fantástica,Maravillosa,Tecnológica,Ucronía'), crit: 0, pub: 1 },
    { id: 'LS', nombre: 'Literaria y simbólica', items: sp('Alegórica,Filosófica,Literaria,Metaficción,Poética,Simbólica'), crit: 2, pub: -2 },
    { id: 'PG', nombre: 'Popular y de género', items: sp('Comercial,Fábula,Fan fiction,Ficción de género,Folclórica,Pulp fiction,Satírica'), crit: -1, pub: 2 },
    { id: 'ET', nombre: 'Experimental y transgresora', items: sp('Absurda,Experimental,Hipertextual,Transgresora'), crit: 2, pub: -3 },
    { id: 'ES', nombre: 'Por extensión y soporte', items: sp('Epistolar,Flash fiction,Interactiva,Novelette,Novella,Serializada,Transmedia'), crit: 0, pub: 0 },
  ];

  // ---------- Corrientes artísticas por época (bono de novedad de unos 12 años) ----------
  // Cine: año en que aparece y familias afines. Las demás, por medio, como [año, nombre] (0 = desde el inicio).
  const corrientesCine = [
    [1917, 'Cine clásico de Hollywood', 'AA,HM,RD,SM'], [1918, 'Impresionismo cinematográfico francés', 'AV,DR'],
    [1920, 'Expresionismo alemán', 'SM,IM'], [1921, 'Cine experimental', 'AV'], [1924, 'Cine soviético de montaje', 'DR,AV'],
    [1928, 'Surrealismo cinematográfico', 'AV,IM'], [1934, 'Cine poético', 'AV,RD'], [1934, 'Realismo socialista cinematográfico', 'DR'],
    [1945, 'Neorrealismo italiano', 'DR'], [1954, 'Cine de autor', 'AV,DR'], [1955, 'Cine existencialista', 'DR,AV'],
    [1956, 'Free Cinema británico', 'DR'], [1959, 'Nouvelle Vague francesa', 'AV,RD'], [1960, 'Cinema Novo', 'DR,AV'],
    [1960, 'Cinéma vérité', 'AV,DR'], [1960, 'Direct Cinema', 'DR'], [1960, 'Cine underground', 'AV'], [1962, 'Nuevo Cine Alemán', 'DR,AV'],
    [1962, 'Nuevo Cine Brasileño', 'DR'], [1963, 'Cine de explotación', 'SM,AA'], [1967, 'Nuevo Cine Latinoamericano', 'DR'],
    [1967, 'Nuevo Hollywood', 'SM,DR,AA'], [1968, 'Cine político', 'DR'], [1968, 'Cine militante', 'DR'],
    [1980, 'Posmodernismo cinematográfico', 'AV,HM'], [1984, 'Cine independiente estadounidense', 'DR,HM'], [1985, 'Cine transgresor', 'AV,SM'],
    [1992, 'New Queer Cinema', 'DR,RD'], [1995, 'Dogma 95', 'DR,AV'], [2000, 'Slow Cinema', 'AV'],
  ].map(function (c) {
    const x = { id: c[1], desde: c[0], afines: c[2].split(',') };
    if (c[1] === 'Cine de explotación') { x.pub = 2; x.crit = -2; x.costo = 0.8; }
    if (c[1] === 'Dogma 95') x.costo = 0.75;
    if (c[1] === 'Cine clásico de Hollywood' || c[1] === 'Nuevo Hollywood') x.pub = 1;
    return x;
  });
  const corrientesMedio = {
    tv: [[1940, 'Televisión clásica de estudio'], [1950, 'Edad de oro de la televisión'], [1950, 'Antología televisiva'], [1950, 'Televisión procedimental'], [1960, 'Televisión experimental'], [1970, 'Miniserie'], [1970, 'Docudrama'], [1970, 'Televisión documental observacional'], [1980, 'Televisión de calidad'], [1980, 'Televisión posmoderna'], [1980, 'Comedia dramática'], [1990, 'Televisión de autor'], [1990, 'Televisión independiente'], [1990, 'Telerrealidad'], [1990, 'Televisión juvenil'], [2000, 'Televisión de prestigio'], [2000, 'Drama de prestigio'], [2000, 'Falso documental televisivo'], [2000, 'Comedia negra televisiva'], [2000, 'Nueva televisión queer'], [2000, 'Televisión de alto concepto'], [2000, 'Serialización contemporánea'], [2000, 'Televisión hiperrealista'], [2000, 'Series web'], [2000, 'Televisión transmedia'], [2000, 'Televisión lenta'], [2010, 'Serie limitada'], [2010, 'Apogeo de las series'], [2010, 'Series pensadas para streaming'], [2010, 'Televisión interactiva']],
    teatro: [[0, 'Clasicismo teatral'], [0, 'Neoclasicismo'], [0, 'Romanticismo teatral'], [1850, 'Realismo teatral'], [1880, 'Naturalismo teatral'], [1890, 'Simbolismo teatral'], [1910, 'Expresionismo teatral'], [1910, 'Teatro experimental'], [1910, 'Teatro de vanguardia'], [1920, 'Surrealismo teatral'], [1920, 'Teatro político'], [1920, 'Teatro épico'], [1930, 'Teatro brechtiano'], [1930, 'Teatro de la crueldad'], [1930, 'Teatro social'], [1940, 'Teatro existencialista'], [1950, 'Teatro del absurdo'], [1960, 'Teatro pobre'], [1960, 'Teatro documental'], [1960, 'Teatro de creación colectiva'], [1960, 'Teatro callejero'], [1960, 'Teatro ritual'], [1970, 'Teatro feminista'], [1970, 'Performance'], [1980, 'Teatro físico'], [1980, 'Teatro comunitario'], [1980, 'Teatro posmoderno'], [1990, 'Teatro postdramático'], [1990, 'Teatro autobiográfico'], [2000, 'Teatro inmersivo']],
    musica: [[0, 'Renacimiento musical'], [0, 'Barroco'], [0, 'Clasicismo'], [0, 'Romanticismo'], [1850, 'Nacionalismo musical'], [1890, 'Impresionismo musical'], [1910, 'Expresionismo musical'], [1920, 'Dodecafonismo'], [1920, 'Neoclasicismo musical'], [1940, 'Bebop'], [1940, 'Jazz moderno'], [1940, 'Música concreta'], [1950, 'Serialismo'], [1950, 'Música electrónica académica'], [1950, 'Música aleatoria'], [1950, 'Cool jazz'], [1950, 'Avant-garde musical'], [1950, 'Experimentalismo musical'], [1950, 'Música electroacústica'], [1960, 'Free jazz'], [1960, 'Minimalismo'], [1960, 'Psychedelia'], [1970, 'Música espectral'], [1970, 'Krautrock'], [1970, 'Punk'], [1970, 'New Wave'], [1980, 'Post-punk'], [1990, 'Grunge'], [1990, 'Shoegaze'], [2010, 'Hyperpop']],
    juegos: [[1970, 'Escuela arcade'], [1970, 'Interactive fiction'], [1980, 'Diseño japonés clásico'], [1980, 'Diseño occidental clásico'], [1980, 'PC gaming underground'], [1980, 'CRPG clásico'], [1980, 'JRPG clásico'], [1980, 'Educational games'], [1990, 'Survival horror japonés'], [1990, 'Immersive sim'], [2000, 'Indie game movement'], [2000, 'Art games'], [2000, 'Juegos de autor'], [2000, 'Game design experimental'], [2000, 'Serious games'], [2000, 'Newsgame movement'], [2010, 'Juegos narrativos'], [2010, 'Experimental narrative games'], [2010, 'Roguelike revival'], [2010, 'Metroidvania revival'], [2010, 'Retro revival'], [2010, 'Pixel art revival'], [2010, 'Soulslike movement'], [2010, 'Walking simulator movement'], [2010, 'Vaporwave games'], [2010, 'Cozy games movement'], [2010, 'Hyper-casual movement'], [2010, 'Live-service design'], [2010, 'Games-as-a-service'], [2020, 'Lo-fi game movement']],
    libros: [[0, 'Clasicismo'], [0, 'Medievalismo'], [0, 'Renacimiento'], [0, 'Barroco'], [0, 'Neoclasicismo'], [0, 'Romanticismo'], [1850, 'Realismo'], [1860, 'Parnasianismo'], [1870, 'Naturalismo'], [1880, 'Simbolismo'], [1880, 'Decadentismo'], [1880, 'Modernismo'], [1900, 'Futurismo'], [1910, 'Vanguardismo'], [1910, 'Expresionismo'], [1910, 'Dadaísmo'], [1910, 'Creacionismo'], [1910, 'Ultraísmo'], [1920, 'Estridentismo'], [1920, 'Surrealismo'], [1940, 'Existencialismo'], [1940, 'Absurdismo'], [1950, 'Realismo mágico'], [1960, 'Boom latinoamericano'], [1960, 'Posmodernismo'], [1960, 'Literatura posmoderna'], [1970, 'Literatura feminista'], [1980, 'Poscolonialismo'], [1980, 'Minimalismo literario']],
  };
  const ESTANDAR = 'Estándar actual';
  const ANIOS_NOVEDAD = 12;
  // Bono de una corriente en un año: novedad que se apaga en ~12 años, +1 si es afín a la familia
  function efectoCorriente(id, anio, famId) {
    const c = corrientesCine.filter(function (x) { return x.id === id; })[0];
    if (!c || c.desde > anio) return { crit: 0, pub: 0, costo: 1, novedad: 0 };
    const novedad = Math.max(0, 1 - (anio - c.desde) / ANIOS_NOVEDAD);
    const afin = c.afines.indexOf(famId) >= 0 ? 1 : 0;
    return { crit: Math.round(3 * novedad) + afin + (c.crit || 0), pub: (c.pub || 0) + (novedad > 0.5 ? 1 : 0), costo: c.costo || 1, novedad: novedad };
  }

  // ---------- Tono, estilo artístico y prioridad ----------
  // Los tonos están en ART.datos.tonos; aquí se agregan los que faltaban.
  [{ id: 'Deprimente', crit: 2, pub: -3 }, { id: 'Melancólico', crit: 2, pub: -1 }, { id: 'Luminoso', crit: 0, pub: 2 }].forEach(function (x) {
    if (!D.tonos.some(function (y) { return y.id === x.id; })) D.tonos.push(x);
  });
  const estilos = [
    { id: 'General', crit: 0, pub: 0 }, { id: 'Realismo', crit: 1, pub: 0, afines: ['DR', 'SM'] }, { id: 'Natural', crit: 1, pub: 0, afines: ['DR', 'FJ'] },
    { id: 'Romántico', crit: 0, pub: 1, afines: ['RD', 'DR'] }, { id: 'Elegante', crit: 1, pub: 0, afines: ['RD', 'SM'] },
    { id: 'Barroco', crit: 1, pub: 0, costo: 1.08, afines: ['DR', 'IM'] }, { id: 'Impresionismo', crit: 2, pub: -1, afines: ['AV', 'RD'] },
    { id: 'Expresionismo', crit: 2, pub: -1, afines: ['SM', 'AV'] }, { id: 'Surrealismo', crit: 2, pub: -2, afines: ['AV', 'IM'] },
    { id: 'Abstracto', crit: 2, pub: -3, afines: ['AV'] }, { id: 'Cubismo', crit: 2, pub: -2, afines: ['AV'] },
    { id: 'Déco', crit: 1, pub: 0, desde: 1925, costo: 1.05, afines: ['HM', 'RD'] }, { id: 'Pop', crit: 0, pub: 2, desde: 1955, afines: ['HM', 'FJ'] },
    { id: 'Minimalismo', crit: 1, pub: -1, desde: 1960, costo: 0.92, afines: ['AV', 'DR'] }, { id: 'Digital', crit: 0, pub: 1, desde: 1995, afines: ['IM', 'AA'] },
    { id: 'Híbrido', crit: 1, pub: 0, desde: 1990 },
  ];
  // Prioridad: reparte el peso entre departamentos
  const prioridades = [
    { id: 'Híbrido', nombre: 'Híbrido / normal', pesos: {}, efecto: 'Equilibrio entre todo' },
    { id: 'Historia', nombre: 'Historia', pesos: { guion: 1.35, interprete: 1.2 }, efecto: 'Pesan más el guion y la actuación' },
    { id: 'Visual', nombre: 'Visual', pesos: { fotografia: 1.4, arte: 1.3 }, efecto: 'Pesan más la fotografía y el arte' },
    { id: 'Sonido', nombre: 'Sonido', pesos: { musica: 1.7, edicion: 1.1 }, efecto: 'Pesa más la música' },
    { id: 'Técnico', nombre: 'Técnico', pesos: { arte: 1.3, edicion: 1.25, fotografia: 1.2 }, efecto: 'Pesan más los efectos, la edición y la imagen' },
  ];

  // ---------- Formatos de época del cine ----------
  const formatos = {
    color: [
      { id: 'Blanco y negro', desde: 1895 }, { id: 'Tecnicolor', desde: 1935 }, { id: 'Híbrido', desde: 1939 },
      { id: 'General', desde: 1952 }, { id: 'Digital', desde: 1999 },
    ],
    visual: [{ id: '35 mm', desde: 1895 }, { id: '16 mm', desde: 1923 }, { id: '3D', desde: 1953 }, { id: '70 mm', desde: 1955 }, { id: 'IMAX', desde: 1970 }, { id: 'Digital', desde: 2002 }, { id: 'Screen X', desde: 2013 }],
    sonido: [{ id: 'Mudo', desde: 1895 }, { id: 'Sonoro', desde: 1927 }],
  };
  // Lo normal de cada año (sin costo extra ni sorpresa)
  function formatoEstandar(anio) {
    return {
      color: anio < 1967 ? 'Blanco y negro' : anio < 2005 ? 'General' : 'Digital',
      visual: anio < 2006 ? '35 mm' : 'Digital',
      sonido: anio < 1929 ? 'Mudo' : 'Sonoro',
    };
  }
  // Efecto de un formato en su año: costo, crítica y público
  function efectoFormato(f, anio, famId) {
    const r = { costo: 1, crit: 0, pub: 0 };
    // Lo normal de la época no cuesta más ni sorprende
    const e = formatoEstandar(anio);
    const c = f.color === e.color ? '' : f.color, v = f.visual === e.visual ? '' : f.visual, s = f.sonido === e.sonido ? '' : f.sonido;
    if (c === 'Blanco y negro') { r.crit += 2; r.pub -= 4; }
    if (c === 'Tecnicolor') { r.costo *= anio < 1960 ? 1.18 : 1.05; r.pub += anio < 1960 ? 3 : 0; }
    if (c === 'Híbrido') { r.costo *= 1.08; r.crit += 1; }
    if (c === 'General' && anio < 1967) { r.costo *= 1.1; r.pub += 2; }
    if (c === 'Digital') r.costo *= 0.96;
    if (v === '16 mm') { r.costo *= 0.85; r.crit -= 1; if (anio >= 1950) r.pub -= 2; }
    if (v === '70 mm') { r.costo *= 1.15; if (famId === 'AA' || famId === 'IM' || famId === 'DR') r.pub += 2; }
    if (v === 'Screen X') { r.costo *= 1.1; r.pub += famId === 'AA' || famId === 'IM' ? 2 : 1; }
    // IMAX: primero documentales; desde 2008 los estrenos grandes llenan sus salas
    if (v === 'IMAX') { r.costo *= 1.2; r.pub += anio >= 2008 && (famId === 'AA' || famId === 'IM') ? 3 : famId === 'AA' || famId === 'IM' ? 1 : 0; if (anio < 2008 && famId !== 'AV') r.pub -= 1; }
    // 3D: moda de 1953-1955 y de 2009-2014; fuera de esas olas cansa un poco
    if (v === '3D') { r.costo *= 1.12; r.crit -= 1; const ola = (anio >= 1953 && anio <= 1955) || (anio >= 2009 && anio <= 2014); r.pub += ola ? (famId === 'AA' || famId === 'IM' || famId === 'FJ' ? 3 : 1) : (anio > 2014 ? 1 : -1); }
    if (v === 'Digital') r.costo *= 0.92;
    if (s === 'Mudo' && anio >= 1930) { r.crit += 1; r.pub -= 6; }
    if (s === 'Sonoro' && anio < 1933) r.costo *= 1.12;
    return r;
  }

  // ---------- Contenido: decide la clasificación (G a X); lo más fuerte siempre es sugerido ----------
  // Cada nivel trae la clasificación mínima que exige: 0 G, 1 PG, 2 PG-13, 3 16, 4 NC-17, 5 18, 6 R, 7 X.
  const ORDEN_CLAS = ['G', 'PG', 'PG-13', '16', 'NC-17', '18', 'R', 'X'];
  const contenido = [
    { id: 'violencia', nombre: 'Violencia', niveles: [['Sin violencia', 0], ['Leve', 1], ['Moderada', 2], ['Intensa', 3], ['Gráfica', 5], ['Sangrienta', 6], ['Explícita', 7]] },
    { id: 'lenguaje', nombre: 'Lenguaje', niveles: [['Normal', 0], ['Leve', 2], ['Rudo', 3], ['Crudo', 4], ['Ofensivo', 5], ['Explícito', 6]] },
    { id: 'amor', nombre: 'Amor', niveles: [['Amistoso', 0], ['Romántico', 1], ['Apasionado', 3], ['Candente', 4], ['Explícito', 7]] },
    { id: 'consumo', nombre: 'Consumo (alcohol, tabaco y drogas)', niveles: [['Ninguno', 0], ['Mencionado', 1], ['Social', 2], ['Frecuente', 3], ['Intenso', 5]] },
    { id: 'terror', nombre: 'Terror', niveles: [['Ninguno', 0], ['Suspenso', 1], ['Sustos', 2], ['Intenso', 3], ['Perturbador', 5]] },
  ];
  // Contenido típico de cada familia (lo que sugiere el botón "recomendado")
  const contenidoFamilia = {
    AA: { violencia: 2, lenguaje: 1, amor: 1, consumo: 1, terror: 1 }, IM: { violencia: 2, lenguaje: 0, amor: 1, consumo: 0, terror: 2 },
    SM: { violencia: 3, lenguaje: 2, amor: 1, consumo: 2, terror: 3 }, DR: { violencia: 1, lenguaje: 1, amor: 1, consumo: 2, terror: 0 },
    HM: { violencia: 0, lenguaje: 0, amor: 1, consumo: 1, terror: 0 }, FJ: { violencia: 0, lenguaje: 0, amor: 0, consumo: 0, terror: 0 },
    AV: { violencia: 1, lenguaje: 1, amor: 1, consumo: 2, terror: 1 }, RD: { violencia: 0, lenguaje: 1, amor: 1, consumo: 1, terror: 0 },
  };

  // ---------- Duración (de 1 a 300 minutos) ----------
  const DURACION_TIPICA = [[1895, 4], [1905, 12], [1912, 45], [1916, 75], [1930, 85], [1960, 110], [2000, 115], [2020, 125], [2150, 120]];
  function categoriaDuracion(min) { return min <= 60 ? 'Cortometraje' : min <= 120 ? 'Película normal' : min <= 180 ? 'Película extendida' : 'Épica'; }
  const complejidad = sp('Ninguna,Leve,Normal,Verosímil,Inteligente,Compleja');
  const ritmo = [
    { id: 'Reflexivo', crit: 3, pub: -3 }, { id: 'Lento', crit: 1, pub: -2 }, { id: 'Normal', crit: 0, pub: 0 },
    { id: 'Rápido', crit: -1, pub: 2 }, { id: 'Entretenido', crit: -2, pub: 3 },
  ];
  // Efectos: costo, desde qué año y si se juegan el aplauso o el repudio
  const efectos = [
    { id: 'Ninguno', nombre: 'Ninguno (obra artesanal)', costo: 0.88, desde: 1895 },
    { id: 'Leve', nombre: 'Leve (efectos prácticos)', costo: 0.94, desde: 1895 },
    { id: 'Normal', nombre: 'Normal (prácticos y especiales)', costo: 1, desde: 1895 },
    { id: 'Bastantes', nombre: 'Bastantes (efectos especiales y CGI)', costo: 1.22, desde: 1933, riesgo: true },
    { id: 'Demasiados', nombre: 'Demasiados (CGI e IA generativa)', costo: 1.5, desde: 1993, riesgo: true },
  ];

  // ---------- Épocas y lugares de la historia (deslizador del tiempo) ----------
  // desde/hasta: años que cubre (para saber si es pasado, presente o futuro); costo: vestuario, sets y efectos.
  const epocas = [
    { id: 'prehistoria', nombre: 'Inicio de la humanidad', texto: 'En el inicio de la humanidad', desde: -300000, hasta: -3500, costo: 1.12, afines: ['IM', 'AA'] },
    { id: 'civilizaciones', nombre: 'Primeras civilizaciones', texto: 'En las primeras civilizaciones', desde: -3500, hasta: -800, costo: 1.15, afines: ['DR', 'IM', 'AA'] },
    { id: 'imperios', nombre: 'Grandes imperios antiguos', texto: 'En tiempos de los grandes imperios', desde: -800, hasta: -30, costo: 1.18, afines: ['AA', 'DR'] },
    { id: 'cristo', nombre: 'Época de Cristo', texto: 'En los tiempos de Cristo', desde: -30, hasta: 476, costo: 1.15, afines: ['DR', 'AA'] },
    { id: 'medieval', nombre: 'Edad Media', texto: 'En la Edad Media', desde: 476, hasta: 1450, costo: 1.15, afines: ['AA', 'IM', 'DR'] },
    { id: 'renacimiento', nombre: 'Renacimiento', texto: 'En pleno Renacimiento', desde: 1450, hasta: 1600, costo: 1.12, afines: ['DR', 'RD'] },
    { id: 'revoluciones', nombre: 'Siglos XVII y XVIII: revoluciones', texto: 'En el siglo de las revoluciones', desde: 1600, hasta: 1800, costo: 1.1, afines: ['DR', 'AA', 'RD'] },
    { id: 'xix', nombre: 'Siglo XIX', texto: 'En el siglo XIX', desde: 1800, hasta: 1900, costo: 1.06, afines: ['DR', 'AA', 'RD'] },
    { id: 'guerras', nombre: '1900 a 1945', texto: 'En la primera mitad del siglo XX', desde: 1900, hasta: 1945, costo: 1.03, afines: ['DR', 'AA', 'SM'] },
    { id: 'posguerra', nombre: '1946 a 1999', texto: 'En la segunda mitad del siglo XX', desde: 1946, hasta: 1999, costo: 1.01, afines: ['DR', 'SM', 'HM'] },
    { id: 'actualidad', nombre: 'Actualidad', texto: 'Hoy', actual: true, costo: 1, afines: [] },
    { id: 'cercano', nombre: 'Futuro cercano', texto: 'En un futuro cercano', futuro: true, costo: 1.06, afines: ['IM', 'SM'] },
    { id: 'lejano', nombre: 'Futuro lejano', texto: 'En un futuro lejano', futuro: true, costo: 1.15, afines: ['IM', 'AA'] },
    { id: 'inventado', nombre: 'Fuera del tiempo (mundo inventado)', texto: 'En un mundo que nunca existió', costo: 1.12, afines: ['IM', 'FJ'] },
  ];
  // Épocas que se pueden elegir en un año: las que ya pasaron, la actualidad, el futuro y el mundo inventado
  function epocasDisponibles(anio) { return epocas.filter(function (e) { return e.desde === undefined || e.desde < anio - 5; }); }
  const lugaresExtra = [
    { id: 'espacio', nombre: 'El espacio', texto: 'en el espacio' }, { id: 'inventado', nombre: 'Un mundo inventado', texto: 'en un mundo inventado' },
    { id: 'varios', nombre: 'Varios lugares', texto: 'de un lugar a otro' },
  ];
  // Idiomas de la obra: el de cada región suma allí; el inglés viaja mejor desde 1950; el cine mudo no tiene idioma
  const idiomas = [
    { id: 'Español', regiones: ['lat'], paises: ['es'] }, { id: 'Inglés', regiones: ['nam', 'oce'], paises: ['gb', 'ng', 'za', 'ke'], global: 1950 },
    { id: 'Francés', regiones: [], paises: ['fr', 'ca', 'ma'] }, { id: 'Alemán', regiones: [], paises: ['de'] }, { id: 'Italiano', regiones: [], paises: ['it'] },
    { id: 'Portugués', regiones: [], paises: ['br'] }, { id: 'Ruso', regiones: [], paises: ['ru'] }, { id: 'Mandarín', regiones: [], paises: ['cn'] },
    { id: 'Cantonés', regiones: [], paises: ['hk'] }, { id: 'Japonés', regiones: [], paises: ['jp'] }, { id: 'Coreano', regiones: [], paises: ['kr'] },
    { id: 'Hindi', regiones: [], paises: ['in'] }, { id: 'Tailandés', regiones: [], paises: ['th'] }, { id: 'Árabe', regiones: [], paises: ['eg', 'ma'] },
    { id: 'Suajili', regiones: [], paises: ['ke'] }, { id: 'Yoruba', regiones: [], paises: ['ng'] }, { id: 'Zulú', regiones: [], paises: ['za'] },
    { id: 'Maorí', regiones: [], paises: ['nz'] }, { id: 'Latín', regiones: [], paises: [], crit: 1 },
    { id: 'Sin diálogos', regiones: [], paises: [], universal: true }, { id: 'Idioma inventado', regiones: [], paises: [], crit: 1 },
  ];

  // ---------- Público objetivo y audiencia focal (hasta 5) ----------
  // edades: énfasis [niños, adolescentes, jóvenes, adultos, mayores]; region: cultura de una región; sexo: 'M' o 'F'
  const publicos = [
    { id: 'General', grupo: 'Edad' }, { id: 'Global', grupo: 'Edad' },
    { id: 'Niños', grupo: 'Edad', edades: [1.35, 1, 0.9, 0.95, 0.95], infantil: true }, { id: 'Familiar', grupo: 'Edad', edades: [1.2, 1.05, 0.95, 1.08, 1], infantil: true },
    { id: 'Adolescentes', grupo: 'Edad', edades: [0.95, 1.35, 1.05, 0.92, 0.9], infantil: true }, { id: 'Juvenil', grupo: 'Edad', edades: [0.9, 1.15, 1.25, 0.95, 0.9] },
    { id: 'Adultos', grupo: 'Edad', edades: [0.85, 0.92, 1.05, 1.25, 1.05] }, { id: 'Ancianos', grupo: 'Edad', edades: [0.9, 0.85, 0.9, 1.05, 1.35] },
    { id: 'Masculino', grupo: 'Sexo', sexo: 'M' }, { id: 'Femenino', grupo: 'Sexo', sexo: 'F' }, { id: 'LGBTQ+', grupo: 'Sexo', lgbt: true },
    { id: 'Cinéfilos', grupo: 'Aficionados', crit: 1 }, { id: 'Gamers', grupo: 'Aficionados' }, { id: 'Seriéfilos', grupo: 'Aficionados' },
    { id: 'Melómanos', grupo: 'Aficionados' }, { id: 'Bibliófilos', grupo: 'Aficionados' }, { id: 'Teatrófilos', grupo: 'Aficionados' },
    { id: 'Cultura hispano-latinoamericana', grupo: 'Cultura', region: 'lat' }, { id: 'Cultura europea', grupo: 'Cultura', region: 'eur' },
    { id: 'Cultura norteamericana', grupo: 'Cultura', region: 'nam' }, { id: 'Cultura africana', grupo: 'Cultura', region: 'afr' },
    { id: 'Cultura oriental', grupo: 'Cultura', region: 'asi' }, { id: 'Cultura de Oceanía', grupo: 'Cultura', region: 'oce' },
    { id: 'Culturas artísticas', grupo: 'Cultura', crit: 1 }, { id: 'Culturas tecnológicas', grupo: 'Cultura' }, { id: 'Culturas urbanas', grupo: 'Cultura' },
    { id: 'Culturas agrícolas', grupo: 'Cultura' }, { id: 'Culturas nómadas', grupo: 'Cultura' }, { id: 'Culturas sedentarias', grupo: 'Cultura' },
    { id: 'Culturas indígenas', grupo: 'Cultura' }, { id: 'Culturas religiosas', grupo: 'Cultura' }, { id: 'Culturas míticas', grupo: 'Cultura' },
    { id: 'Culturas desconocidas', grupo: 'Cultura' },
  ];
  // Atractivo de cada familia por sexo [hombres, mujeres] (para la ficha del material y el público por sexo)
  const sexoFamilia = { AA: [1.2, 0.8], IM: [1.1, 0.9], SM: [1.05, 0.95], DR: [0.9, 1.1], HM: [1, 1], FJ: [0.95, 1.05], AV: [1, 1], RD: [0.75, 1.25] };

  // ---------- Personajes ----------
  const importancias = [
    { id: 'protagonista', nombre: 'Protagonista', max: 10 }, { id: 'secundario', nombre: 'Secundario', max: 15 },
    { id: 'extra', nombre: 'Extra', max: 20, contado: true }, { id: 'invitado', nombre: 'Invitado especial', max: 5 }, { id: 'cameo', nombre: 'Cameo', max: 5 },
  ];
  // Los extras y los terceros (figurantes, dobles y personal de apoyo) son un número, no personajes
  const MAX_EXTRAS = 20, MAX_TERCEROS = 100;
  const ARQ_FEM = { 'Héroe': 'Heroína', Antihéroe: 'Antiheroína', Mentor: 'Mentora', Aliado: 'Aliada', Villano: 'Villana', Embaucador: 'Embaucadora',
    'Guardián': 'Guardiana', Sabio: 'Sabia', Explorador: 'Exploradora', Creador: 'Creadora', Cuidador: 'Cuidadora', Mago: 'Maga', 'Bufón': 'Bufona', 'Huérfano': 'Huérfana' };
  // Arquetipos (Jung, Campbell y Vogler) con su palabra para la sinopsis según el sexo [él, ella]
  const arquetipos = [
    ['Héroe', 'un héroe improbable', 'una heroína improbable'], ['Antihéroe', 'un antihéroe sin escrúpulos', 'una antiheroína sin escrúpulos'],
    ['Mentor', 'un viejo maestro', 'una vieja maestra'], ['Aliado', 'un amigo leal', 'una amiga leal'], ['Villano', 'un villano brillante', 'una villana brillante'],
    ['Sombra', 'un enemigo que se le parece', 'una enemiga que se le parece'], ['Embaucador', 'un embaucador encantador', 'una embaucadora encantadora'],
    ['Guardián', 'un guardián del umbral', 'una guardiana del umbral'], ['Heraldo', 'un mensajero inesperado', 'una mensajera inesperada'],
    ['Cambiante', 'un desconocido de dos caras', 'una desconocida de dos caras'], ['Inocente', 'un joven ingenuo', 'una joven ingenua'],
    ['Rebelde', 'un rebelde sin causa', 'una rebelde sin causa'], ['Amante', 'un amante apasionado', 'una amante apasionada'],
    ['Sabio', 'un sabio solitario', 'una sabia solitaria'], ['Explorador', 'un explorador incansable', 'una exploradora incansable'],
    ['Creador', 'un inventor obsesivo', 'una inventora obsesiva'], ['Gobernante', 'un gobernante temido', 'una gobernante temida'],
    ['Cuidador', 'un protector abnegado', 'una protectora abnegada'], ['Mago', 'un mago que cambia el mundo', 'una maga que cambia el mundo'],
    ['Bufón', 'un bromista incorregible', 'una bromista incorregible'], ['Huérfano', 'un huérfano que busca su lugar', 'una huérfana que busca su lugar'],
    ['Rival', 'un rival de toda la vida', 'una rival de toda la vida'], ['Testigo', 'un testigo incómodo', 'una testigo incómoda'],
    ['Normal', 'un hombre común', 'una mujer común'],
  ].map(function (a) { return { id: a[0], m: a[1], f: a[2], fem: ARQ_FEM[a[0]] || a[0] }; });
  // El nombre del arquetipo según el sexo del personaje (Heroína, Villana, Maga…)
  function nombreArquetipo(id, sexo) { const a = arquetipos.filter(function (x) { return x.id === id; })[0]; return a && sexo === 'F' ? a.fem : id; }
  // Oficios del protagonista por género (dan sabor a la sinopsis) [él, ella]
  const oficiosGenero = {
    'Western': ['un pistolero', 'una pistolera'], 'Bélico': ['un soldado', 'una enfermera de guerra'], 'Espionaje': ['un espía', 'una espía'],
    'Superhéroes': ['un vigilante enmascarado', 'una vigilante enmascarada'], 'Deportivo': ['un atleta', 'una atleta'], 'Catástrofes': ['un rescatista', 'una rescatista'],
    'Ciencia ficción': ['un ingeniero espacial', 'una ingeniera espacial'], 'Fantasía': ['un aprendiz de mago', 'una aprendiz de maga'],
    'Monstruos': ['un cazador de monstruos', 'una cazadora de monstruos'], 'Crimen': ['un ladrón', 'una ladrona'], 'Policial': ['un policía', 'una policía'],
    'Noir': ['un detective cansado', 'una detective cansada'], 'Misterio': ['un periodista', 'una periodista'], 'Terror': ['un cuidador nocturno', 'una cuidadora nocturna'],
    'Biográfico': ['un artista olvidado', 'una artista olvidada'], 'Judicial': ['un abogado', 'una abogada'], 'Político': ['un candidato', 'una candidata'],
    'Religioso': ['un sacerdote', 'una monja'], 'Musical': ['un cantante', 'una cantante'], 'Comedia': ['un vendedor torpe', 'una vendedora torpe'],
    'Infantil': ['un niño curioso', 'una niña curiosa'], 'Adolescentes': ['un estudiante', 'una estudiante'], 'Artes': ['un pintor', 'una pintora'],
    'Romance': ['un viudo', 'una viuda'], 'Erótico': ['un fotógrafo', 'una fotógrafa'], 'Histórico': ['un cronista', 'una cronista'],
  };

  // ---------- Obras de dominio público (236): libres el 1 de enero del año 71 tras la muerte del autor ----------
  // libre: año en que se libera con la regla de vida + 70 (0 = siempre libre). fama de 0 a 1. grupo: clásico, tono, tradición.
  const dp = function (grupo) {
    return function (fila) {
      const p = fila.split('|');
      return { id: '', tit: p[0], autor: p[1], anio: p[2], libre: +p[3] || 0, gen: p[4].split(','), fama: +p[5], grupo: grupo };
    };
  };
  const dominio = [].concat([
    'La Odisea|Homero|c. 700 a. C.|0|Aventura,Épico,Fantasía|0.85', 'Las mil y una noches|Anónimo|c. 900|0|Aventura,Fantasía,Romance|0.8',
    'Beowulf|Anónimo|c. 1000|0|Épico,Fantasía,Acción|0.55', 'El rey Arturo|Leyenda|1136|0|Fantasía,Épico,Aventura|0.85',
    'El Cantar de mio Cid|Anónimo|c. 1200|0|Épico,Histórico,Acción|0.5', 'La divina comedia|Dante Alighieri|1320|0|Fantasía,Drama,Épico|0.7',
    'Robin Hood|Leyenda|c. 1400|0|Aventura,Acción,Histórico|0.85', 'Romeo y Julieta|William Shakespeare|1597|0|Romance,Drama|0.95',
    'Hamlet|William Shakespeare|1603|0|Drama,Thriller,Misterio|0.9', 'Don Quijote de la Mancha|Miguel de Cervantes|1605|0|Aventura,Comedia,Drama|0.85',
    'Macbeth|William Shakespeare|1606|0|Drama,Thriller,Fantasía|0.75', 'Cenicienta|Charles Perrault|1697|0|Fantasía,Romance,Familiar|0.9',
    'Robinson Crusoe|Daniel Defoe|1719|0|Aventura,Drama|0.7', 'Los viajes de Gulliver|Jonathan Swift|1726|0|Aventura,Fantasía,Comedia|0.7',
    'Fausto|J. W. von Goethe|1808|1903|Fantasía,Drama,Terror|0.65', 'Cuentos de los hermanos Grimm|Hermanos Grimm|1812|1934|Fantasía,Familiar,Terror|0.85',
    'Orgullo y prejuicio|Jane Austen|1813|1888|Romance,Drama,Comedia|0.85', 'Frankenstein|Mary Shelley|1818|1922|Terror,Ciencia ficción,Drama|0.9',
    'La leyenda de Sleepy Hollow|Washington Irving|1820|1930|Terror,Misterio|0.6', 'Oliver Twist|Charles Dickens|1838|1941|Drama,Crimen|0.75',
    'Un cuento de Navidad|Charles Dickens|1843|1941|Drama,Fantasía,Familiar|0.85', 'Los tres mosqueteros|Alexandre Dumas|1844|1941|Aventura,Acción,Histórico|0.8',
    'El conde de Montecristo|Alexandre Dumas|1844|1941|Aventura,Drama,Thriller|0.8', 'El cuervo|Edgar Allan Poe|1845|1920|Terror,Misterio|0.65',
    'Moby Dick|Herman Melville|1851|1962|Aventura,Drama,Épico|0.75', 'Los miserables|Victor Hugo|1862|1956|Drama,Histórico,Musical|0.85',
    'Alicia en el país de las maravillas|Lewis Carroll|1865|1969|Fantasía,Aventura,Familiar|0.9', 'Crimen y castigo|Fiódor Dostoyevski|1866|1952|Drama,Crimen,Thriller|0.7',
    'Mujercitas|Louisa May Alcott|1868|1959|Drama,Familiar,Romance|0.75', 'Guerra y paz|León Tolstói|1869|1981|Drama,Histórico,Bélico,Romance|0.7',
    'Veinte mil leguas de viaje submarino|Julio Verne|1870|1976|Aventura,Ciencia ficción|0.75', 'La vuelta al mundo en 80 días|Julio Verne|1872|1976|Aventura,Comedia|0.75',
    'Las aventuras de Tom Sawyer|Mark Twain|1876|1981|Aventura,Comedia,Familiar|0.7', 'Ana Karenina|León Tolstói|1877|1981|Romance,Drama|0.7',
    'La isla del tesoro|R. L. Stevenson|1883|1965|Aventura,Acción,Familiar|0.8', 'Pinocho|Carlo Collodi|1883|1961|Fantasía,Familiar,Aventura|0.85',
    'El extraño caso del Dr. Jekyll y Mr. Hyde|R. L. Stevenson|1886|1965|Terror,Thriller,Misterio|0.75', 'Estudio en escarlata|Arthur Conan Doyle|1887|2001|Misterio,Crimen,Thriller|0.85',
    'El retrato de Dorian Gray|Oscar Wilde|1890|1971|Drama,Terror,Fantasía|0.7', 'El libro de la selva|Rudyard Kipling|1894|2007|Aventura,Familiar,Fantasía|0.85',
    'Drácula|Bram Stoker|1897|1983|Terror,Romance,Fantasía|0.9', 'La guerra de los mundos|H. G. Wells|1898|2017|Ciencia ficción,Acción,Terror|0.8',
    'El maravilloso mago de Oz|L. Frank Baum|1900|1990|Fantasía,Aventura,Familiar,Musical|0.85', 'Peter Pan|J. M. Barrie|1904|2008|Fantasía,Aventura,Familiar|0.9',
    'El fantasma de la ópera|Gaston Leroux|1910|1998|Terror,Romance,Musical|0.8', 'Tarzán de los monos|Edgar Rice Burroughs|1912|2021|Aventura,Acción|0.75',
    'La metamorfosis|Franz Kafka|1915|1995|Drama,Fantasía|0.65', 'Bambi|Felix Salten|1923|2016|Familiar,Drama|0.75',
    'El gran Gatsby|F. Scott Fitzgerald|1925|2011|Drama,Romance|0.8', 'La llamada de Cthulhu|H. P. Lovecraft|1928|2008|Terror,Fantasía,Misterio|0.6',
  ].map(dp('clasico')), [
    'Poemas|Safo|c. 600 a. C.|0|Poesía,Romance,Erótica|0.35', 'Lisístrata|Aristófanes|411 a. C.|0|Comedia,Político,Erótico|0.4',
    'El arte de amar|Ovidio|c. 2|0|Erótica,Comedia|0.35', 'Decamerón|Giovanni Boccaccio|1353|0|Comedia,Romance,Erótica|0.5',
    'Los cuentos de Canterbury|Geoffrey Chaucer|c. 1400|0|Comedia,Aventura,Erótica|0.45', 'La Celestina|Fernando de Rojas|1499|0|Tragicomedia,Romance,Erótico|0.5',
    'El burlador de Sevilla|Tirso de Molina|1630|0|Drama,Romance,Erótico|0.5', 'Moll Flanders|Daniel Defoe|1722|0|Drama,Romance,Crimen|0.4',
    'Carmen|Prosper Mérimée|1845|1941|Romance,Drama,Musical|0.7', 'La dama de las camelias|Alexandre Dumas hijo|1848|1966|Romance,Melodrama|0.6',
    'Hojas de hierba|Walt Whitman|1855|1963|Poesía,Erótica|0.4', 'Las flores del mal|Charles Baudelaire|1857|1938|Poesía,Gótico,Erótica|0.45',
    'Madame Bovary|Gustave Flaubert|1857|1951|Drama,Romance,Erótico|0.65', 'Teresa Raquin|Émile Zola|1867|1973|Drama,Crimen,Erótico|0.4',
    'La Venus de las pieles|Leopold von Sacher-Masoch|1870|1966|Drama,Erótico|0.4', 'Carmilla|Sheridan Le Fanu|1872|1944|Terror,Romance,Erótico|0.5',
    'Naná|Émile Zola|1880|1973|Drama,Social,Erótico|0.45', 'La Regenta|Leopoldo Alas, Clarín|1884|1972|Drama,Romance,Social|0.45',
    'El despertar|Kate Chopin|1899|1975|Drama,Romance,Erótico|0.4', 'El amante de Lady Chatterley|D. H. Lawrence|1928|2001|Romance,Drama,Erótico|0.6',
    'Trópico de Cáncer|Henry Miller|1934|2051|Drama,Experimental,Erótico|0.45',
  ].map(dp('tono')), [
    'Epopeya de Gilgamesh|Mesopotamia|c. 2100 a. C.|0|Épico,Aventura,Fantasía|0.5', 'Ramayana|India|c. siglo V a. C.|0|Épico,Aventura,Romance|0.6',
    'Mahabharata|India|c. siglo IV a. C.|0|Épico,Bélico,Drama|0.6', 'Cantar de los nibelungos|Germania|c. 1200|0|Épico,Fantasía,Tragedia|0.5',
    'Epopeya de Sundiata|Malí, tradición oral|Siglo XIII|0|Épico,Histórico,Aventura|0.4', 'Romance de los Tres Reinos|China, Luo Guanzhong|Siglo XIV|0|Épico,Bélico,Histórico|0.6',
    'Viaje al Oeste|China, Wu Cheng\'en|1592|0|Aventura,Fantasía,Comedia|0.65', 'Popol Vuh|Tradición maya|Siglo XVI|0|Mitología,Épico,Fantasía|0.45',
    'La Llorona|Leyenda latinoamericana|Tradición|0|Terror,Folklórico|0.6', 'El Dorado|Leyenda sudamericana|Tradición|0|Aventura,Histórico|0.6',
    'El Hombre Caimán|Leyenda colombiana|Tradición|0|Folklórico,Comedia,Fantasía|0.4',
  ].map(dp('tradicion')));
  // Obras de dominio público de la Final que faltaban (154): título|autor|año|año en que se libera|géneros|fama|grupo
  const dominioFinal = [
    'La Ilíada|Homero|c. 750 a. C.|0|Épico,Bélico,Aventura|0.9|clasico',
    'Edipo rey|Sófocles|c. 429 a. C.|0|Drama,Misterio|0.8|clasico',
    'Medea|Eurípides|c. 431 a. C.|0|Drama,Thriller|0.7|clasico',
    'La Eneida|Virgilio|c. 19 a. C.|0|Épico,Aventura,Histórico|0.65|clasico',
    'Fábulas de Esopo|Esopo|c. 550 a. C.|0|Familiar,Fantasía,Comedia|0.75|clasico',
    'Los doce trabajos de Hércules|Mitología griega|c. 700 a. C.|0|Mitología,Aventura,Épico|0.85|tradicion',
    'Los dioses nórdicos (Edda)|Islandia, tradición|1270|0|Mitología,Aventura,Épico|0.75|tradicion',
    'La balada de Mulán|China, tradición|500|0|Bélico,Aventura,Drama|0.75|tradicion',
    'La princesa Kaguya|Japón, tradición|900|0|Fantasía,Drama,Familiar|0.65|tradicion',
    'Los 47 rōnin|Japón, historia y leyenda|1703|0|Histórico,Acción,Drama|0.75|tradicion',
    'Cuentos de Anansi|Tradición akan|1700|0|Folklórico,Comedia,Familiar|0.6|tradicion',
    'Quetzalcóatl, la serpiente emplumada|Mitología mexica|1400|0|Mitología,Épico|0.6|tradicion',
    'El Golem de Praga|Leyenda judía|1600|0|Fantasía,Terror|0.6|tradicion',
    'San Jorge y el dragón|Leyenda medieval|1260|0|Fantasía,Acción,Épico|0.6|tradicion',
    'El Silbón|Leyenda venezolana|1850|0|Terror,Folklórico|0.5|tradicion',
    'La Madremonte|Leyenda colombiana|1800|0|Terror,Folklórico,Fantasía|0.5|tradicion',
    'El Mohán|Leyenda colombiana|1800|0|Folklórico,Fantasía,Terror|0.5|tradicion',
    'El Lazarillo de Tormes|Anónimo|1554|0|Comedia,Drama,Aventura|0.7|clasico',
    'El sueño de una noche de verano|William Shakespeare|1595|0|Comedia,Fantasía,Romance|0.85|clasico',
    'Otelo|William Shakespeare|1604|0|Drama,Thriller,Romance|0.8|clasico',
    'El rey Lear|William Shakespeare|1606|0|Drama|0.75|clasico',
    'La tempestad|William Shakespeare|1611|0|Fantasía,Drama,Aventura|0.7|clasico',
    'La vida es sueño|Pedro Calderón de la Barca|1635|0|Drama,Fantasía|0.7|clasico',
    'Tartufo|Molière|1664|0|Comedia,Social|0.7|clasico',
    'Caperucita Roja|Charles Perrault|1697|0|Fantasía,Familiar,Terror|0.85|clasico',
    'La bella durmiente|Charles Perrault|1697|0|Fantasía,Romance,Familiar|0.85|clasico',
    'El gato con botas|Charles Perrault|1697|0|Fantasía,Comedia,Familiar|0.75|clasico',
    'La bella y la bestia|Jeanne-Marie Leprince de Beaumont|1756|0|Fantasía,Romance,Familiar|0.9|clasico',
    'El castillo de Otranto|Horace Walpole|1764|1868|Terror,Misterio,Romance|0.55|clasico',
    'El monje|Matthew Lewis|1796|1889|Terror,Drama|0.55|clasico',
    'El vampiro|John Polidori|1819|1892|Terror,Romance|0.5|clasico',
    'Ivanhoe|Walter Scott|1819|1903|Aventura,Histórico,Romance|0.65|clasico',
    'Nuestra Señora de París|Victor Hugo|1831|1956|Drama,Romance,Histórico|0.85|clasico',
    'La sirenita|Hans Christian Andersen|1837|1946|Fantasía,Romance,Familiar|0.85|clasico',
    'El patito feo|Hans Christian Andersen|1843|1946|Familiar,Drama|0.7|clasico',
    'La reina de las nieves|Hans Christian Andersen|1844|1946|Fantasía,Aventura,Familiar|0.8|clasico',
    'La caída de la casa Usher|Edgar Allan Poe|1839|1920|Terror,Misterio|0.7|clasico',
    'El corazón delator|Edgar Allan Poe|1843|1920|Terror,Thriller|0.65|clasico',
    'Don Juan Tenorio|José Zorrilla|1844|1964|Drama,Romance,Fantasía|0.7|clasico',
    'Jane Eyre|Charlotte Brontë|1847|1926|Romance,Drama,Misterio|0.8|clasico',
    'Cumbres borrascosas|Emily Brontë|1847|1919|Romance,Drama|0.8|clasico',
    'Viaje al centro de la Tierra|Julio Verne|1864|1976|Aventura,Ciencia ficción|0.8|clasico',
    'De la Tierra a la Luna|Julio Verne|1865|1976|Ciencia ficción,Aventura|0.7|clasico',
    'María|Jorge Isaacs|1867|1966|Romance,Drama|0.65|clasico',
    'Martín Fierro|José Hernández|1872|1957|Western,Drama,Épico|0.65|clasico',
    'Miguel Strogoff|Julio Verne|1876|1976|Aventura,Acción|0.6|clasico',
    'El príncipe y el mendigo|Mark Twain|1881|1981|Aventura,Comedia,Familiar|0.7|clasico',
    'Heidi|Johanna Spyri|1881|1972|Familiar,Drama|0.75|clasico',
    'Las aventuras de Huckleberry Finn|Mark Twain|1884|1981|Aventura,Drama|0.75|clasico',
    'El fantasma de Canterville|Oscar Wilde|1887|1971|Comedia,Terror,Familiar|0.65|clasico',
    'La máquina del tiempo|H. G. Wells|1895|2017|Ciencia ficción,Aventura|0.85|clasico',
    'La isla del doctor Moreau|H. G. Wells|1896|2017|Ciencia ficción,Terror|0.65|clasico',
    'El hombre invisible|H. G. Wells|1897|2017|Ciencia ficción,Terror,Thriller|0.8|clasico',
    'El sabueso de los Baskerville|Arthur Conan Doyle|1902|2001|Misterio,Terror,Crimen|0.85|clasico',
    'El llamado de la selva|Jack London|1903|1987|Aventura,Familiar|0.7|clasico',
    'Colmillo Blanco|Jack London|1906|1987|Aventura,Drama,Familiar|0.7|clasico',
    'La Pimpinela Escarlata|Baronesa de Orczy|1905|2018|Aventura,Romance,Histórico|0.6|clasico',
    'Arsène Lupin, caballero ladrón|Maurice Leblanc|1907|2012|Crimen,Aventura,Comedia|0.75|clasico',
    'El jardín secreto|Frances Hodgson Burnett|1911|1995|Familiar,Drama|0.7|clasico',
    'La maldición de Capistrano (el Zorro)|Johnston McCulley|1919|2029|Aventura,Acción,Western|0.85|clasico',
    'La ópera del mendigo|John Gay|1728|1803|Musical,Comedia,Crimen|0.6|clasico',
    'Cándido|Voltaire|1759|1849|Comedia,Aventura,Drama|0.75|clasico',
    'El barbero de Sevilla|Pierre-Augustin de Beaumarchais|1775|1870|Comedia,Romance|0.7|clasico',
    'Las bodas de Fígaro|Pierre-Augustin de Beaumarchais|1778|1870|Comedia,Romance|0.7|clasico',
    'Las amistades peligrosas|Pierre Choderlos de Laclos|1782|1874|Drama,Romance,Thriller|0.75|tono',
    'Los bandidos|Friedrich Schiller|1781|1876|Drama,Acción|0.6|clasico',
    'Las cuitas del joven Werther|Johann Wolfgang von Goethe|1774|1903|Romance,Drama|0.7|clasico',
    'Las aventuras del barón de Münchhausen|Rudolf Erich Raspe|1785|1865|Aventura,Comedia,Fantasía|0.65|clasico',
    'La flauta mágica|Emanuel Schikaneder|1791|1883|Fantasía,Musical,Comedia|0.8|clasico',
    'Don Giovanni|Lorenzo Da Ponte|1787|1909|Drama,Romance,Fantasía|0.7|tono',
    'Pamela|Samuel Richardson|1740|1832|Romance,Drama|0.5|clasico',
    'Tom Jones|Henry Fielding|1749|1825|Comedia,Aventura,Romance|0.6|clasico',
    'Arlequín, servidor de dos amos|Carlo Goldoni|1746|1864|Comedia|0.6|clasico',
    'La posadera|Carlo Goldoni|1753|1864|Comedia,Romance|0.55|clasico',
    'El sí de las niñas|Leandro Fernández de Moratín|1806|1899|Comedia,Romance|0.55|clasico',
    'Sentido y sensibilidad|Jane Austen|1811|1888|Romance,Drama|0.75|clasico',
    'Emma|Jane Austen|1815|1888|Romance,Comedia|0.7|clasico',
    'Blancanieves|Hermanos Grimm|1812|1934|Fantasía,Familiar|0.9|clasico',
    'Hansel y Gretel|Hermanos Grimm|1812|1934|Fantasía,Terror,Familiar|0.8|clasico',
    'Rapunzel|Hermanos Grimm|1812|1934|Fantasía,Romance,Familiar|0.75|clasico',
    'El cascanueces y el rey de los ratones|E. T. A. Hoffmann|1816|1893|Fantasía,Familiar|0.75|clasico',
    'El Periquillo Sarniento|José Joaquín Fernández de Lizardi|1816|1898|Comedia,Aventura|0.5|clasico',
    'Rip van Winkle|Washington Irving|1819|1930|Fantasía,Comedia|0.6|clasico',
    'El último mohicano|James Fenimore Cooper|1826|1922|Aventura,Western,Romance|0.75|clasico',
    'El último hombre|Mary Shelley|1826|1922|Ciencia ficción,Drama|0.5|clasico',
    'Rojo y negro|Stendhal|1830|1913|Drama,Romance|0.65|clasico',
    'Eugenio Oneguin|Aleksandr Pushkin|1833|1908|Romance,Drama|0.65|clasico',
    'Papá Goriot|Honoré de Balzac|1835|1921|Drama|0.6|clasico',
    'El inspector|Nikolái Gógol|1836|1923|Comedia,Drama|0.6|clasico',
    'Los papeles póstumos del Club Pickwick|Charles Dickens|1836|1941|Comedia,Aventura|0.55|clasico',
    'Los crímenes de la calle Morgue|Edgar Allan Poe|1841|1920|Misterio,Crimen,Terror|0.75|clasico',
    'Almas muertas|Nikolái Gógol|1842|1923|Comedia,Drama|0.55|clasico',
    'La cabaña del tío Tom|Harriet Beecher Stowe|1852|1967|Drama,Histórico|0.65|clasico',
    'Historia de dos ciudades|Charles Dickens|1859|1941|Drama,Histórico,Romance|0.75|clasico',
    'Grandes esperanzas|Charles Dickens|1861|1941|Drama,Romance|0.75|clasico',
    'Tradiciones peruanas|Ricardo Palma|1872|1990|Histórico,Comedia,Folklórico|0.5|clasico',
    'La isla misteriosa|Julio Verne|1874|1976|Aventura,Ciencia ficción|0.65|clasico',
    'Casa de muñecas|Henrik Ibsen|1879|1977|Drama|0.75|clasico',
    'Cumandá|Juan León Mera|1879|1965|Romance,Aventura,Drama|0.45|clasico',
    'Los hermanos Karamázov|Fiódor Dostoievski|1880|1952|Drama,Misterio,Crimen|0.75|clasico',
    'Las minas del rey Salomón|H. Rider Haggard|1885|1996|Aventura,Acción|0.7|clasico',
    'El Horla|Guy de Maupassant|1887|1964|Terror,Misterio|0.55|clasico',
    'El príncipe feliz|Oscar Wilde|1888|1971|Fantasía,Drama,Familiar|0.6|clasico',
    'Salomé|Oscar Wilde|1891|1971|Drama,Romance|0.6|tono',
    'La gaviota|Antón Chéjov|1896|1975|Drama|0.65|clasico',
    'Cyrano de Bergerac|Edmond Rostand|1897|1989|Romance,Comedia,Drama|0.8|clasico',
    'El jardín de los cerezos|Antón Chéjov|1904|1975|Drama,Comedia|0.65|clasico',
    'Ana de las Tejas Verdes|Lucy Maud Montgomery|1908|2013|Familiar,Drama,Comedia|0.7|clasico',
    'El viento en los sauces|Kenneth Grahame|1908|2003|Familiar,Aventura,Fantasía|0.65|clasico',
    'El mundo perdido|Arthur Conan Doyle|1912|2001|Aventura,Ciencia ficción|0.8|clasico',
    'Una princesa de Marte|Edgar Rice Burroughs|1912|2021|Ciencia ficción,Aventura,Romance|0.65|clasico',
    'Pigmalión|George Bernard Shaw|1913|2021|Comedia,Romance|0.7|clasico',
    'Los cuatro jinetes del Apocalipsis|Vicente Blasco Ibáñez|1916|1999|Bélico,Drama,Romance|0.55|clasico',
    'R.U.R. (Robots Universales Rossum)|Karel Čapek|1920|2009|Ciencia ficción,Drama|0.65|clasico',
    'La vorágine|José Eustasio Rivera|1924|1999|Aventura,Drama|0.6|clasico',
    'Nosotros|Yevgueni Zamiatin|1924|2008|Ciencia ficción,Drama|0.55|clasico',
    'El proceso|Franz Kafka|1925|1995|Drama,Misterio|0.7|clasico',
    'La señora Dalloway|Virginia Woolf|1925|2012|Drama|0.6|clasico',
    'La historia de Genji|Murasaki Shikibu|1010|0|Romance,Drama,Histórico|0.7|clasico',
    'Sakuntala|Kalidasa|400|0|Romance,Drama,Fantasía|0.55|clasico',
    'El flautista de Hamelín|Leyenda alemana|1284|0|Fantasía,Folklórico,Familiar|0.65|tradicion',
    'El holandés errante|Leyenda marinera|1790|0|Fantasía,Terror,Aventura|0.6|tradicion',
    'La Patasola|Leyenda colombiana|1800|0|Terror,Folklórico|0.5|tradicion',
    'El Cadejo|Leyenda centroamericana|1800|0|Terror,Folklórico,Fantasía|0.5|tradicion',
    'La Biblia|Varios autores|c. 1000 a. C.|0|Drama,Épico,Histórico|0.99|tradicion',
    'El arca de Noé|La Biblia (Génesis)|c. 1000 a. C.|0|Aventura,Drama,Familiar|0.8|tradicion',
    'Moisés y el Éxodo|La Biblia (Éxodo)|c. 1000 a. C.|0|Épico,Drama,Aventura|0.85|tradicion',
    'David y Goliat|La Biblia (Samuel)|c. 1000 a. C.|0|Acción,Drama,Histórico|0.8|tradicion',
    'Sansón y Dalila|La Biblia (Jueces)|c. 1000 a. C.|0|Drama,Romance,Acción|0.7|tradicion',
    'Los Evangelios|La Biblia (Nuevo Testamento)|70|0|Drama,Histórico,Épico|0.9|tradicion',
    'La canción de Roldán|Anónimo|1100|0|Épico,Histórico,Acción|0.55|tradicion',
    'Tristán e Isolda|Leyenda|1170|0|Romance,Drama,Fantasía|0.65|tradicion',
    'El paraíso perdido|John Milton|1667|0|Épico,Fantasía,Drama|0.65|clasico',
    'Fuenteovejuna|Lope de Vega|1619|0|Drama,Histórico|0.6|clasico',
    'El avaro|Molière|1668|0|Comedia|0.6|clasico',
    'Julio César|William Shakespeare|1599|0|Drama,Histórico,Thriller|0.8|clasico',
    'El mercader de Venecia|William Shakespeare|1600|0|Drama,Comedia,Romance|0.75|clasico',
    'La fierecilla domada|William Shakespeare|1592|0|Comedia,Romance|0.75|clasico',
    'Noche de reyes|William Shakespeare|1602|0|Comedia,Romance|0.7|clasico',
    'Ricardo III|William Shakespeare|1593|0|Drama,Histórico,Thriller|0.7|clasico',
    'Mucho ruido y pocas nueces|William Shakespeare|1599|0|Comedia,Romance|0.7|clasico',
    'Los últimos días de Pompeya|Edward Bulwer-Lytton|1834|1944|Histórico,Drama,Romance|0.6|clasico',
    'Ben-Hur|Lew Wallace|1880|1976|Épico,Histórico,Aventura,Drama|0.85|clasico',
    'Quo Vadis|Henryk Sienkiewicz|1896|1987|Histórico,Drama,Romance|0.7|clasico',
    'Sandokán: los tigres de Mompracem|Emilio Salgari|1900|1982|Aventura,Acción,Romance|0.65|clasico',
    'El corsario negro|Emilio Salgari|1898|1982|Aventura,Acción,Romance|0.6|clasico',
    'Platero y yo|Juan Ramón Jiménez|1914|2029|Drama,Familiar|0.65|clasico',
    'Azul…|Rubén Darío|1888|1987|Drama,Romance,Fantasía|0.55|clasico',
    'Doña Bárbara|Rómulo Gallegos|1929|2040|Drama,Aventura|0.65|clasico',
    'El Kalevala|Elias Lönnrot (tradición finlandesa)|1835|0|Épico,Fantasía,Aventura|0.5|tradicion',
    'El conde Lucanor|Don Juan Manuel|1335|0|Drama,Comedia|0.5|clasico',
    'Gargantúa y Pantagruel|François Rabelais|1532|0|Comedia,Fantasía,Aventura|0.55|tono',
    'Utopía|Tomás Moro|1516|0|Ciencia ficción,Drama|0.5|clasico',
    'El hombre de la máscara de hierro|Alexandre Dumas|1847|1941|Aventura,Histórico,Drama|0.7|clasico',
  ];
  // Tipo, temas, personajes y sinopsis de cada obra libre (de la Final); personajes y sinopsis solo donde no hay canon
  const DETALLE_DOMINIO = {
    'La Odisea': ['Poema', ['El regreso', 'El viaje', 'Lealtad', 'Dioses', 'Familia'], [], ''],
    'Las mil y una noches': ['Cuento', ['Amor', 'Magia', 'Destino', 'Secretos', 'Búsqueda'], [], ''],
    'Beowulf': ['Poema', ['Héroes', 'Honor', 'Muerte', 'Sacrificio'], [], ''],
    'El rey Arturo': ['Leyenda', ['Caballeros', 'Magia', 'Traición', 'Destino', 'Honor'], [], ''],
    'El Cantar de mio Cid': ['Poema', ['Honor', 'Exilio', 'Lealtad', 'Familia'], [], ''],
    'La divina comedia': ['Poema', ['Redención', 'Muerte', 'Moralidad', 'Amor', 'Fe'], [], ''],
    'Robin Hood': ['Leyenda', ['Justicia', 'Rebelión', 'Injusticia', 'Amistad'], [], ''],
    'Romeo y Julieta': ['Obra de teatro', ['Amor', 'Familia', 'Rivalidad', 'Destino', 'Muerte'], [], ''],
    'Hamlet': ['Obra de teatro', ['Venganza', 'Locura', 'Traición', 'Muerte', 'Poder'], [], ''],
    'Don Quijote de la Mancha': ['Novela', ['Sueños', 'Locura', 'Amistad', 'Honor', 'Humor'], [], ''],
    'Macbeth': ['Obra de teatro', ['Ambición', 'Poder', 'Culpa', 'Destino', 'Traición'], [], ''],
    'Cenicienta': ['Cuento', ['Esperanza', 'Familia', 'Clase social', 'Amor'], [], ''],
    'Robinson Crusoe': ['Novela', ['La supervivencia', 'Soledad', 'Naturaleza', 'Fe'], [], ''],
    'Los viajes de Gulliver': ['Novela', ['Sociedad', 'Política', 'El viaje', 'Humanidad'], [], ''],
    'Fausto': ['Obra de teatro', ['Pactos con el diablo', 'Ambición', 'Conocimiento', 'Redención', 'Amor'], [], ''],
    'Cuentos de los hermanos Grimm': ['Cuento', ['Magia', 'Familia', 'Miedo', 'Brujas y aquelarres'], [], ''],
    'Orgullo y prejuicio': ['Novela', ['Amor', 'Clase social', 'Familia', 'Dudas'], [], ''],
    'Frankenstein': ['Novela', ['Ciencia', 'Humanidad', 'Soledad', 'Culpa', 'Creación'], [], ''],
    'La leyenda de Sleepy Hollow': ['Cuento', ['Fantasmas', 'Miedo', 'Rivalidad', 'Amor'], [], ''],
    'Oliver Twist': ['Novela', ['Pobreza', 'Infancia', 'Robos', 'Injusticia'], [], ''],
    'Un cuento de Navidad': ['Novela', ['Redención', 'Codicia', 'Fantasmas', 'Familia'], [], ''],
    'Los tres mosqueteros': ['Novela', ['Amistad', 'Honor', 'Lealtad', 'Política'], [], ''],
    'El conde de Montecristo': ['Novela', ['Venganza', 'Traición', 'Riqueza', 'Justicia'], [], ''],
    'El cuervo': ['Poema', ['Duelo', 'Locura', 'Soledad', 'Muerte'], [], ''],
    'Moby Dick': ['Novela', ['Obsesión', 'Venganza', 'Naturaleza', 'Destino'], [], ''],
    'Los miserables': ['Novela', ['Redención', 'Justicia', 'Pobreza', 'Revolución', 'Sacrificio'], [], ''],
    'Alicia en el país de las maravillas': ['Novela', ['Infancia', 'Identidad', 'Sueños', 'Lo imposible'], [], ''],
    'Crimen y castigo': ['Novela', ['Culpa', 'Moralidad', 'Pobreza', 'Redención'], [], ''],
    'Mujercitas': ['Novela', ['Familia', 'Hermanos', 'Sueños', 'Adultez'], [], ''],
    'Guerra y paz': ['Novela', ['Guerra', 'Amor', 'Destino', 'Familia', 'Historia'], [], ''],
    'Veinte mil leguas de viaje submarino': ['Novela', ['Ciencia', 'Libertad', 'Venganza', 'Descubrimiento'], [], ''],
    'La vuelta al mundo en 80 días': ['Novela', ['El viaje', 'Competencia', 'Amistad', 'Tiempo'], [], ''],
    'Las aventuras de Tom Sawyer': ['Novela', ['Infancia', 'Amistad', 'Libertad', 'Humor'], [], ''],
    'Ana Karenina': ['Novela', ['Amor', 'Sociedad', 'Culpa', 'Familia'], [], ''],
    'La isla del tesoro': ['Novela', ['Piratas', 'Codicia', 'Traición', 'Adolescencia'], [], ''],
    'Pinocho': ['Novela', ['Mentiras', 'Infancia', 'Familia', 'Redención'], [], ''],
    'El extraño caso del Dr. Jekyll y Mr. Hyde': ['Novela', ['Identidad', 'Bien y mal', 'Ciencia', 'Secretos'], [], ''],
    'Estudio en escarlata': ['Novela', ['Investigación', 'Venganza', 'Amistad', 'Asesinos'], [], ''],
    'El retrato de Dorian Gray': ['Novela', ['Inmortalidad', 'Moralidad', 'Lo prohibido', 'Arte'], [], ''],
    'El libro de la selva': ['Cuento', ['Naturaleza', 'Identidad', 'Familia', 'Infancia'], [], ''],
    'Drácula': ['Novela', ['Vampiros', 'Miedo', 'Inmortalidad', 'Amor'], [], ''],
    'La guerra de los mundos': ['Novela', ['Supervivencia', 'Humanidad', 'Tecnología', 'Miedo'], [], ''],
    'El maravilloso mago de Oz': ['Novela', ['El regreso', 'Amistad', 'Magia', 'Valor'], [], ''],
    'Peter Pan': ['Obra de teatro', ['Infancia', 'Libertad', 'Búsqueda', 'Adultez'], [], ''],
    'El fantasma de la ópera': ['Novela', ['Obsesión', 'Amor', 'Música', 'Secretos'], [], ''],
    'Tarzán de los monos': ['Novela', ['Naturaleza', 'Identidad', 'Amor', 'Civilización y barbarie'], [], ''],
    'La metamorfosis': ['Novela', ['Familia', 'Aislamiento', 'Identidad', 'Deshumanización'], [], ''],
    'Bambi': ['Novela', ['Naturaleza', 'Infancia', 'Duelo', 'Familia'], [], ''],
    'El gran Gatsby': ['Novela', ['Riqueza', 'Amor', 'Sueños', 'Clase social'], [], ''],
    'La llamada de Cthulhu': ['Cuento', ['Lo oculto', 'Sectas', 'Locura', 'Miedo'], [], ''],
    'Poemas': ['Poema', ['Amor', 'Deseo', 'Soledad', 'Arte'], [], ''],
    'Lisístrata': ['Obra de teatro', ['Guerra', 'Paz', 'Política', 'Humor'], [], ''],
    'El arte de amar': ['Poema', ['Amor', 'Humor', 'Sociedad'], [], ''],
    'Decamerón': ['Cuento', ['Amor', 'Humor', 'Muerte', 'Ingenio'], [], ''],
    'Los cuentos de Canterbury': ['Cuento', ['El viaje', 'Humor', 'Sociedad', 'Fe'], [], ''],
    'La Celestina': ['Obra de teatro', ['Amor', 'Codicia', 'Muerte', 'Lo prohibido'], [], ''],
    'El burlador de Sevilla': ['Obra de teatro', ['Lo prohibido', 'Honor', 'Muerte', 'Mentiras'], [], ''],
    'Moll Flanders': ['Novela', ['Pobreza', 'Robos', 'Supervivencia', 'Amor'], [], ''],
    'Carmen': ['Novela', ['Amor', 'Obsesión', 'Libertad', 'Muerte'], [], ''],
    'La dama de las camelias': ['Novela', ['Amor', 'Sacrificio', 'Clase social', 'Muerte'], [], ''],
    'Hojas de hierba': ['Poema', ['Libertad', 'Naturaleza', 'Humanidad', 'Existencia'], [], ''],
    'Las flores del mal': ['Poema', ['Lo prohibido', 'Muerte', 'Arte', 'Soledad'], [], ''],
    'Madame Bovary': ['Novela', ['Sueños', 'Lo prohibido', 'Deudas y promesas', 'Soledad'], [], ''],
    'Teresa Raquin': ['Novela', ['Culpa', 'Lo prohibido', 'Asesinos', 'Locura'], [], ''],
    'La Venus de las pieles': ['Novela', ['Obsesión', 'Poder', 'Amor'], [], ''],
    'Carmilla': ['Novela', ['Vampiros', 'Amor', 'Lo prohibido', 'Miedo'], [], ''],
    'Naná': ['Novela', ['Fama', 'Poder', 'Clase social', 'Lo prohibido'], [], ''],
    'La Regenta': ['Novela', ['Lo prohibido', 'Fe', 'Soledad', 'Sociedad'], [], ''],
    'El despertar': ['Novela', ['Libertad', 'Identidad', 'Soledad'], [], ''],
    'El amante de Lady Chatterley': ['Novela', ['Amor', 'Clase social', 'Lo prohibido'], [], ''],
    'Trópico de Cáncer': ['Novela', ['Libertad', 'Pobreza', 'Arte', 'Existencia'], [], ''],
    'Epopeya de Gilgamesh': ['Poema', ['Inmortalidad', 'Amistad', 'Muerte', 'Héroes'], [], ''],
    'Ramayana': ['Poema', ['Amor', 'Honor', 'Dioses', 'Bien y mal'], [], ''],
    'Mahabharata': ['Poema', ['Guerra', 'Familia', 'Destino', 'Moralidad'], [], ''],
    'Cantar de los nibelungos': ['Poema', ['Venganza', 'Traición', 'Riqueza', 'Honor'], [], ''],
    'Epopeya de Sundiata': ['Poema', ['Héroes', 'Destino', 'Familia', 'Poder'], [], ''],
    'Romance de los Tres Reinos': ['Novela', ['Guerra', 'Lealtad', 'Poder', 'Honor'], [], ''],
    'Viaje al Oeste': ['Novela', ['El viaje', 'Magia', 'Redención', 'Humor'], [], ''],
    'Popol Vuh': ['Mitología', ['Dioses', 'Creación', 'Muerte', 'Héroes'], [], ''],
    'La Llorona': ['Leyenda', ['Culpa', 'Fantasmas', 'Maldiciones antiguas', 'Familia'], [], ''],
    'El Dorado': ['Leyenda', ['Codicia', 'Búsqueda', 'Descubrimientos', 'Naturaleza'], [], ''],
    'El Hombre Caimán': ['Leyenda', ['Amor', 'Humor', 'Maldición', 'Naturaleza'], [], ''],
    'La Ilíada': ['Poema', ['Guerra', 'Honor', 'Destino', 'Dioses', 'Héroes'], ['Aquiles:M', 'Héctor:M', 'Helena:F', 'Paris:M', 'Agamenón:M', 'Patroclo:M'], 'La ira de Aquiles decide el destino de Troya en el décimo año de guerra.'],
    'Edipo rey': ['Obra de teatro', ['Destino', 'Verdad', 'Culpa', 'Familia'], ['Edipo:M', 'Yocasta:F', 'Tiresias:M', 'Creonte:M'], 'Un rey investiga la peste de su ciudad y descubre que el culpable es él.'],
    'Medea': ['Obra de teatro', ['Venganza', 'Traición', 'Amor', 'Exilio'], ['Medea:F', 'Jasón:M', 'Creonte:M', 'la nodriza:F'], 'Abandonada por Jasón, una hechicera extranjera planea la venganza más terrible.'],
    'La Eneida': ['Poema', ['Destino', 'El viaje', 'Deber', 'Guerra'], ['Eneas:M', 'Dido:F', 'Turno:M', 'Ascanio:M'], 'Un troyano sobreviviente navega hacia Italia para fundar un nuevo pueblo.'],
    'Fábulas de Esopo': ['Cuento', ['Moralidad', 'Humor', 'Naturaleza'], ['la tortuga:X', 'la liebre:X', 'la zorra:F', 'el cuervo:M', 'la cigarra:F', 'la hormiga:F'], 'Animales que hablan enseñan, con humor, lecciones que no envejecen.'],
    'Los doce trabajos de Hércules': ['Mitología', ['Héroes', 'Redención', 'Dioses', 'Sacrificio'], ['Hércules:M', 'Hera:F', 'Euristeo:M', 'Yolao:M', 'Hipólita:F'], 'El hijo de Zeus debe cumplir doce tareas imposibles para limpiar su culpa.'],
    'Los dioses nórdicos (Edda)': ['Mitología', ['Dioses', 'Destino', 'Guerra', 'Traición'], ['Odín:M', 'Thor:M', 'Loki:M', 'Freya:F', 'Baldr:M'], 'Los dioses de Asgard viven, pelean y se preparan para el fin del mundo.'],
    'La balada de Mulán': ['Poema', ['Familia', 'Honor', 'Identidad', 'Guerra'], ['Mulán:F', 'su padre:M', 'el general:M'], 'Una joven se disfraza de soldado para tomar el lugar de su padre anciano.'],
    'La princesa Kaguya': ['Cuento', ['Familia', 'Amor', 'Destino', 'Despedida'], ['Kaguya:F', 'el cortador de bambú:M', 'su esposa:F', 'el emperador:M'], 'Un anciano encuentra a una niña dentro de un bambú; ella oculta que viene de la Luna.'],
    'Los 47 rōnin': ['Leyenda', ['Honor', 'Lealtad', 'Venganza', 'Sacrificio'], ['Ōishi Kuranosuke:M', 'Asano Naganori:M', 'Kira Yoshinaka:M'], 'Samuráis sin señor esperan dos años para vengar a su amo.'],
    'Cuentos de Anansi': ['Cuento', ['Ingenio', 'Humor', 'Sabiduría'], ['Anansi:M', 'Nyame:M', 'el tigre:M', 'la tortuga:X'], 'Una araña astuta engaña a los poderosos y se queda con todas las historias del mundo.'],
    'Quetzalcóatl, la serpiente emplumada': ['Mitología', ['Dioses', 'Creación', 'El regreso'], ['Quetzalcóatl:M', 'Tezcatlipoca:M', 'Xólotl:M'], 'El dios de la sabiduría es engañado por su hermano y parte prometiendo volver.'],
    'El Golem de Praga': ['Leyenda', ['Creación', 'Fe', 'Lo prohibido', 'Miedo'], ['el rabino Loew:M', 'el Golem:X', 'Ester:F'], 'Un rabino modela un gigante de barro para proteger a su barrio; la criatura crece sin control.'],
    'San Jorge y el dragón': ['Leyenda', ['Héroes', 'Fe', 'Sacrificio'], ['Jorge:M', 'la princesa:F', 'el dragón:X', 'el rey:M'], 'Un caballero enfrenta al dragón que exige doncellas a una ciudad.'],
    'El Silbón': ['Leyenda', ['Maldiciones antiguas', 'Culpa', 'Fantasmas', 'Miedo'], ['el Silbón:M', 'su abuelo:M'], 'Un alma en pena que silba en el llano: cuando suena lejos, está cerca.'],
    'La Madremonte': ['Leyenda', ['Naturaleza', 'Castigo', 'Miedo'], ['la Madremonte:F', 'el leñador:M', 'la niña perdida:F'], 'Una mujer cubierta de musgo protege los bosques y castiga a quien los daña.'],
    'El Mohán': ['Leyenda', ['Naturaleza', 'Brujas y aquelarres', 'Seducción', 'Secretos'], ['el Mohán:M', 'la lavandera:F', 'los pescadores:M'], 'Un hechicero del río roba el tabaco de los pescadores y enamora a las lavanderas.'],
    'El Lazarillo de Tormes': ['Novela', ['Pobreza', 'Ingenio', 'Sociedad', 'Supervivencia'], ['Lázaro:M', 'el ciego:M', 'el escudero:M', 'el clérigo:M'], 'Un niño pobre sobrevive sirviendo a amos tacaños y aprendiendo a engañar.'],
    'El sueño de una noche de verano': ['Obra de teatro', ['Amor', 'Magia', 'Humor', 'Sueños'], ['Puck:M', 'Oberón:M', 'Titania:F', 'Hermia:F', 'Lisandro:M', 'Bottom:M'], 'Duendes traviesos enredan a cuatro enamorados y a unos actores en un bosque.'],
    'Otelo': ['Obra de teatro', ['Celos', 'Traición', 'Amor', 'Racismo'], ['Otelo:M', 'Desdémona:F', 'Yago:M', 'Casio:M', 'Emilia:F'], 'Un general es envenenado de celos por su alférez hasta destruir lo que ama.'],
    'El rey Lear': ['Obra de teatro', ['Familia', 'Poder', 'Locura', 'Vejez'], ['el rey Lear:M', 'Cordelia:F', 'Goneril:F', 'Regan:F', 'el bufón:M'], 'Un rey reparte su reino entre las hijas que mejor lo halagan y lo pierde todo.'],
    'La tempestad': ['Obra de teatro', ['Magia', 'Perdón', 'Poder', 'Libertad'], ['Próspero:M', 'Miranda:F', 'Ariel:X', 'Calibán:M', 'Fernando:M'], 'Un mago desterrado provoca un naufragio para enfrentar a quienes lo traicionaron.'],
    'La vida es sueño': ['Obra de teatro', ['Libertad', 'Destino', 'Sueños', 'Poder'], ['Segismundo:M', 'Rosaura:F', 'Basilio:M', 'Clotaldo:M'], 'Un príncipe encerrado desde niño por una profecía despierta un día en el palacio.'],
    'Tartufo': ['Obra de teatro', ['Mentiras', 'Fe', 'Familia', 'Humor'], ['Tartufo:M', 'Orgón:M', 'Elmira:F', 'Dorina:F', 'Mariana:F'], 'Un falso devoto se instala en una casa y engaña a todos menos a la criada.'],
    'Caperucita Roja': ['Cuento', ['Infancia', 'Miedo', 'Engaño', 'Familia'], ['Caperucita:F', 'el lobo:M', 'la abuela:F', 'el leñador:M'], 'Una niña cruza el bosque para visitar a su abuela y un lobo se le adelanta.'],
    'La bella durmiente': ['Cuento', ['Maldición', 'Amor', 'Destino', 'Magia'], ['Aurora:F', 'el príncipe:M', 'el hada malvada:F', 'las hadas madrinas:F'], 'Una princesa maldita duerme cien años hasta que alguien atraviesa el bosque de espinas.'],
    'El gato con botas': ['Cuento', ['Ingenio', 'Riqueza', 'Humor', 'Amistad'], ['el Gato:M', 'el marqués de Carabás:M', 'el ogro:M', 'la princesa:F'], 'Un gato astuto convierte al hijo pobre de un molinero en un noble.'],
    'La bella y la bestia': ['Cuento', ['Amor', 'Maldiciones antiguas', 'Familia', 'Identidad'], ['Bella:F', 'la Bestia:M', 'el padre de Bella:M', 'las hermanas:F'], 'Una joven se entrega a una bestia para salvar a su padre y descubre a quien vive dentro.'],
    'El castillo de Otranto': ['Novela', ['Castillos góticos', 'Maldiciones antiguas', 'Poder', 'Fantasmas'], ['Manfredo:M', 'Isabela:F', 'Matilde:F', 'Teodoro:M'], 'Un príncipe intenta salvar su linaje mientras un castillo se llena de prodigios.'],
    'El monje': ['Novela', ['Lo prohibido', 'Pactos con el diablo', 'Fe', 'Culpa'], ['Ambrosio:M', 'Matilde:F', 'Antonia:F'], 'Un monje admirado por su virtud cae, paso a paso, en manos del diablo.'],
    'El vampiro': ['Cuento', ['Vampiros', 'Engaño', 'Muerte', 'El viaje'], ['lord Ruthven:M', 'Aubrey:M', 'la hermana de Aubrey:F'], 'Un joven viaja con un lord seductor y descubre que no está vivo.'],
    'Ivanhoe': ['Novela', ['Caballeros', 'Honor', 'Amor', 'Injusticia'], ['Wilfred de Ivanhoe:M', 'Rowena:F', 'Rebeca:F', 'Ricardo Corazón de León:M', 'Brian de Bois-Guilbert:M'], 'Un caballero desheredado vuelve de las cruzadas a una Inglaterra dividida.'],
    'Nuestra Señora de París': ['Novela', ['Amor', 'Exclusión', 'Obsesión', 'Injusticia'], ['Quasimodo:M', 'Esmeralda:F', 'Claude Frollo:M', 'Febo:M'], 'El campanero deforme de la catedral ama en silencio a una joven gitana.'],
    'La sirenita': ['Cuento', ['Amor', 'Sacrificio', 'Identidad'], ['la sirenita:F', 'el príncipe:M', 'la bruja del mar:F'], 'Una sirena cambia su voz por piernas para conquistar a un príncipe.'],
    'El patito feo': ['Cuento', ['Identidad', 'Exclusión', 'Esperanza'], ['el patito:M', 'la madre pata:F', 'los cisnes:X'], 'Un pichón rechazado por todos descubre en primavera lo que siempre fue.'],
    'La reina de las nieves': ['Cuento', ['Amistad', 'Valor', 'El viaje', 'Magia'], ['Gerda:F', 'Kai:M', 'la Reina de las Nieves:F', 'la ladronzuela:F'], 'Una niña viaja hasta el polo para rescatar a su amigo de una reina helada.'],
    'La caída de la casa Usher': ['Cuento', ['Locura', 'Familia', 'Muerte', 'Miedo'], ['Roderick Usher:M', 'Madeline Usher:F', 'el narrador:M'], 'Un hombre visita a un amigo enfermo en una mansión que parece viva.'],
    'El corazón delator': ['Cuento', ['Culpa', 'Locura', 'Asesinos'], ['el narrador:M', 'el anciano:M', 'los policías:M'], 'Un asesino jura estar cuerdo mientras escucha latir el corazón de su víctima.'],
    'Don Juan Tenorio': ['Obra de teatro', ['Redención', 'Amor', 'Lo prohibido', 'Muerte'], ['Don Juan Tenorio:M', 'Doña Inés:F', 'Don Luis Mejía:M', 'el comendador:M'], 'Un seductor apuesta conquistar a una novicia y el amor lo cambia demasiado tarde.'],
    'Jane Eyre': ['Novela', ['Identidad', 'Amor', 'Secretos', 'Independencia'], ['Jane Eyre:F', 'Edward Rochester:M', 'Bertha Mason:F', 'St. John Rivers:M'], 'Una institutriz pobre se enamora de su patrón, que guarda un secreto en el ático.'],
    'Cumbres borrascosas': ['Novela', ['Amor', 'Venganza', 'Obsesión', 'Clase social'], ['Heathcliff:M', 'Catherine Earnshaw:F', 'Edgar Linton:M', 'Nelly Dean:F'], 'Un amor salvaje en los páramos se convierte en una venganza que dura dos generaciones.'],
    'Viaje al centro de la Tierra': ['Novela', ['Descubrimiento', 'Ciencia', 'El viaje'], ['Otto Lidenbrock:M', 'Axel:M', 'Hans:M', 'Graüben:F'], 'Un profesor y su sobrino bajan por un volcán hasta un mundo perdido.'],
    'De la Tierra a la Luna': ['Novela', ['Carrera espacial', 'Ciencia', 'Ambición'], ['Impey Barbicane:M', 'Michel Ardan:M', 'el capitán Nicholl:M'], 'Un club de artilleros construye un cañón gigante para llegar a la Luna.'],
    'María': ['Novela', ['Amor', 'Duelo', 'Familia', 'Naturaleza'], ['María:F', 'Efraín:M', 'Emma:F'], 'En una hacienda del Valle del Cauca, dos primos viven un amor marcado por la enfermedad.'],
    'Martín Fierro': ['Poema', ['Libertad', 'Injusticia', 'Exilio', 'Amistad'], ['Martín Fierro:M', 'el sargento Cruz:M', 'el viejo Vizcacha:M'], 'Un gaucho reclutado a la fuerza deserta y vive como fugitivo en la pampa.'],
    'Miguel Strogoff': ['Novela', ['Lealtad', 'Deber', 'El viaje', 'Supervivencia'], ['Miguel Strogoff:M', 'Nadia:F', 'Iván Ogareff:M'], 'Un correo del zar cruza Siberia en guerra para llevar un mensaje vital.'],
    'El príncipe y el mendigo': ['Novela', ['Identidad', 'Clase social', 'Justicia', 'Humor'], ['Eduardo:M', 'Tom Canty:M', 'Miles Hendon:M'], 'Un príncipe y un mendigo idénticos cambian de lugar y ven el reino desde el otro lado.'],
    'Heidi': ['Novela', ['Infancia', 'Naturaleza', 'Familia', 'Amistad'], ['Heidi:F', 'el abuelo:M', 'Pedro:M', 'Clara:F', 'la señorita Rottenmeier:F'], 'Una niña huérfana devuelve la alegría a su abuelo en las montañas.'],
    'Las aventuras de Huckleberry Finn': ['Novela', ['Libertad', 'Amistad', 'Moralidad', 'El viaje'], ['Huckleberry Finn:M', 'Jim:M', 'Tom Sawyer:M', 'el duque:M', 'el rey:M'], 'Un muchacho y un hombre que escapa de la esclavitud bajan el Misisipi en balsa.'],
    'El fantasma de Canterville': ['Cuento', ['Fantasmas', 'Humor', 'Familia', 'Redención'], ['Sir Simon:M', 'Virginia Otis:F', 'el señor Otis:M', 'los gemelos:M'], 'Una familia moderna compra un castillo inglés y su fantasma no logra asustar a nadie.'],
    'La máquina del tiempo': ['Novela', ['Tiempo', 'Ciencia', 'Humanidad', 'Clase social'], ['el viajero en el tiempo:M', 'Weena:F', 'los morlocks:X'], 'Un inventor viaja al año 802.701 y descubre en qué se convirtió la humanidad.'],
    'La isla del doctor Moreau': ['Novela', ['Ciencia', 'Humanidad', 'Poder', 'Lo prohibido'], ['Edward Prendick:M', 'el doctor Moreau:M', 'Montgomery:M'], 'Un náufrago llega a una isla donde un científico convierte animales en personas.'],
    'El hombre invisible': ['Novela', ['Ciencia', 'Locura', 'Poder', 'Aislamiento'], ['Griffin:M', 'el doctor Kemp:M', 'Thomas Marvel:M'], 'Un científico descubre cómo volverse invisible y no encuentra la vuelta.'],
    'El sabueso de los Baskerville': ['Novela', ['Investigación', 'Maldiciones antiguas', 'Miedo', 'Codicia'], ['Sherlock Holmes:M', 'John Watson:M', 'Henry Baskerville:M', 'Stapleton:M'], 'Un perro infernal parece perseguir a los herederos de una familia en los páramos.'],
    'El llamado de la selva': ['Novela', ['Naturaleza', 'Supervivencia', 'Libertad', 'Identidad'], ['Buck:M', 'John Thornton:M', 'Spitz:M'], 'Un perro robado de su casa sobrevive en el Yukón y escucha el llamado de sus ancestros.'],
    'Colmillo Blanco': ['Novela', ['Naturaleza', 'Supervivencia', 'Redención', 'Lealtad'], ['Colmillo Blanco:M', 'Weedon Scott:M', 'Castor Gris:M'], 'Un lobo medio perro aprende a confiar en los humanos después de mucha crueldad.'],
    'La Pimpinela Escarlata': ['Novela', ['Identidades', 'Revolución', 'Valor', 'Amor'], ['Percy Blakeney:M', 'Marguerite:F', 'Chauvelin:M'], 'Un noble que finge ser tonto rescata en secreto a condenados de la guillotina.'],
    'Arsène Lupin, caballero ladrón': ['Cuento', ['Robos', 'Ingenio', 'Identidades', 'Humor'], ['Arsène Lupin:M', 'el inspector Ganimard:M', 'Nelly:F'], 'Un ladrón elegante que nunca usa la violencia burla a la policía de París.'],
    'El jardín secreto': ['Novela', ['Infancia', 'Naturaleza', 'Amistad', 'Duelo'], ['Mary Lennox:F', 'Colin Craven:M', 'Dickon:M', 'Archibald Craven:M'], 'Una niña solitaria encuentra un jardín cerrado y con él devuelve la vida a una casa triste.'],
    'La maldición de Capistrano (el Zorro)': ['Novela', ['Justicia', 'Identidades', 'Rebelión', 'Amor'], ['Diego de la Vega:M', 'Lolita Pulido:F', 'el sargento García:M', 'el capitán Ramón:M'], 'Un noble que finge ser aburrido se pone una máscara para defender al pueblo.'],
    'La ópera del mendigo': ['Obra de teatro', ['Corrupción', 'Amor', 'Clase social', 'Traición'], ['Macheath:M', 'Polly Peachum:F', 'Lucy Lockit:F', 'Peachum:M'], 'Un bandido elegante se casa en secreto con la hija de un jefe de ladrones que decide entregarlo a la horca.'],
    'Cándido': ['Novela', ['Filosofía', 'Búsqueda', 'Destino', 'Guerra'], ['Cándido:M', 'Cunegunda:F', 'Pangloss:M', 'Cacambo:M'], 'Un joven ingenuo recorre un mundo lleno de guerras y desgracias, convencido de que todo ocurre para bien.'],
    'El barbero de Sevilla': ['Obra de teatro', ['Amor', 'Ingenio', 'Engaño'], ['Fígaro:M', 'Rosina:F', 'el conde de Almaviva:M', 'Bartolo:M'], 'Un barbero ingenioso ayuda a un conde disfrazado a rescatar a la joven que su tutor quiere casar con él.'],
    'Las bodas de Fígaro': ['Obra de teatro', ['Amor', 'Clase social', 'Engaño', 'Celos'], ['Fígaro:M', 'Susana:F', 'el conde de Almaviva:M', 'la condesa Rosina:F'], 'Un criado astuto y su prometida engañan a un conde que quiere seducirla el día de la boda.'],
    'Las amistades peligrosas': ['Novela', ['Seducción', 'Venganza', 'Poder', 'Mentiras'], ['la marquesa de Merteuil:F', 'el vizconde de Valmont:M', 'Cécile:F', 'madame de Tourvel:F'], 'Dos aristócratas aburridos juegan por carta a seducir y arruinar reputaciones, hasta que el juego los quema.'],
    'Los bandidos': ['Obra de teatro', ['Hermanos', 'Rebelión', 'Traición', 'Justicia'], ['Karl Moor:M', 'Franz Moor:M', 'Amalia:F', 'el viejo Moor:M'], 'Desheredado por las intrigas de su hermano, un noble se vuelve jefe de una banda de forajidos.'],
    'Las cuitas del joven Werther': ['Novela', ['Amor', 'Obsesión', 'Soledad', 'Destino'], ['Werther:M', 'Lotte:F', 'Albert:M'], 'Un joven sensible se enamora de una mujer comprometida y su pasión lo consume poco a poco.'],
    'Las aventuras del barón de Münchhausen': ['Cuento', ['Humor', 'Mentiras', 'Fama', 'Ingenio'], ['el barón de Münchhausen:M'], 'Un barón cuenta aventuras imposibles: viajó a la Luna, cabalgó una bala de cañón y salió de un pantano tirándose del pelo.'],
    'La flauta mágica': ['Obra de teatro', ['Magia', 'Amor', 'Bien y mal', 'Sabiduría'], ['Tamino:M', 'Pamina:F', 'Papageno:M', 'la Reina de la Noche:F', 'Sarastro:M'], 'Un príncipe y un pajarero cruzan pruebas mágicas para rescatar a una princesa.'],
    'Don Giovanni': ['Obra de teatro', ['Seducción', 'Castigo', 'Fantasmas', 'Lo prohibido'], ['Don Giovanni:M', 'Leporello:M', 'doña Anna:F', 'doña Elvira:F', 'el Comendador:M'], 'Un seductor sin remordimientos desafía a todos, hasta que la estatua de un hombre al que mató viene por él.'],
    'Pamela': ['Novela', ['Clase social', 'Amor', 'Honor', 'Deseo'], ['Pamela Andrews:F', 'el señor B.:M'], 'Una criada resiste los avances de su patrón y, carta a carta, cambia su destino.'],
    'Tom Jones': ['Novela', ['Identidad', 'Amor', 'Humor', 'Clase social'], ['Tom Jones:M', 'Sophia Western:F', 'Blifil:M'], 'Un expósito encantador y metido en líos corre aventuras por Inglaterra para ganarse a su amada.'],
    'Arlequín, servidor de dos amos': ['Obra de teatro', ['Humor', 'Engaño', 'Ingenio', 'Amor'], ['Arlequín:M', 'Beatrice:F', 'Florindo:M'], 'Un criado hambriento sirve a dos amos a la vez y lo enreda todo para no perder ninguna comida.'],
    'La posadera': ['Obra de teatro', ['Amor', 'Ingenio', 'Clase social', 'Seducción'], ['Mirandolina:F', 'el caballero de Ripafratta:M', 'el marqués:M', 'el conde:M'], 'La dueña de una posada juega con tres pretendientes nobles y elige a quien menos esperan.'],
    'El sí de las niñas': ['Obra de teatro', ['Amor', 'Libertad', 'Familia', 'Vejez'], ['doña Francisca:F', 'don Diego:M', 'don Carlos:M', 'doña Irene:F'], 'Una joven obligada a casarse con un hombre mayor ama en secreto al sobrino de él.'],
    'Sentido y sensibilidad': ['Novela', ['Amor', 'Hermanos', 'Dinero', 'Clase social'], ['Elinor Dashwood:F', 'Marianne Dashwood:F', 'Edward Ferrars:M', 'el coronel Brandon:M'], 'Dos hermanas sin fortuna, una prudente y otra apasionada, buscan el amor.'],
    'Emma': ['Novela', ['Amor', 'Clase social', 'Ingenio', 'Dudas'], ['Emma Woodhouse:F', 'el señor Knightley:M', 'Harriet Smith:F'], 'Una joven rica se dedica a arreglar matrimonios ajenos sin ver el suyo.'],
    'Blancanieves': ['Cuento', ['Infancia', 'Magia', 'Celos', 'Bien y mal'], ['Blancanieves:F', 'la reina:F', 'el cazador:M', 'el príncipe:M'], 'Una princesa huye de su madrastra celosa y encuentra refugio en el bosque.'],
    'Hansel y Gretel': ['Cuento', ['Hermanos', 'Supervivencia', 'Pobreza', 'Brujas y aquelarres'], ['Hansel:M', 'Gretel:F', 'la bruja:F'], 'Dos hermanos perdidos en el bosque encuentran una casa de dulces que esconde a una bruja.'],
    'Rapunzel': ['Cuento', ['Libertad', 'Amor', 'Magia', 'Soledad'], ['Rapunzel:F', 'la hechicera:F', 'el príncipe:M'], 'Una joven encerrada en una torre deja caer su larga trenza para que suba un príncipe.'],
    'El cascanueces y el rey de los ratones': ['Cuento', ['Infancia', 'Magia', 'Sueños', 'Familia'], ['Marie:F', 'el Cascanueces:M', 'el padrino Drosselmeyer:M', 'el rey de los ratones:M'], 'En Nochebuena, un muñeco cascanueces cobra vida y libra una batalla contra el ejército de los ratones.'],
    'El Periquillo Sarniento': ['Novela', ['Humor', 'Clase social', 'Moralidad', 'Redención'], ['Pedro Sarmiento (Periquillo):M'], 'Un pícaro de la Nueva España cuenta sus mil oficios y desventuras para que sus hijos no repitan sus errores.'],
    'Rip van Winkle': ['Cuento', ['Tiempo', 'Sueños', 'Familia', 'Revolución'], ['Rip van Winkle:M', 'Dame van Winkle:F'], 'Un hombre se duerme en las montañas y despierta veinte años después en un país que ya no reconoce.'],
    'El último mohicano': ['Novela', ['Culturas indígenas', 'Guerra', 'Amor', 'Lealtad'], ['Ojo de Halcón:M', 'Uncas:M', 'Chingachgook:M', 'Cora Munro:F', 'Alice Munro:F', 'Magua:M'], 'En plena guerra colonial, un explorador y dos guerreros mohicanos escoltan a dos hermanas por los bosques.'],
    'El último hombre': ['Novela', ['Supervivencia', 'Soledad', 'Muerte', 'Humanidad'], ['Lionel Verney:M', 'Adrian:M', 'Perdita:F'], 'En el futuro, una peste acaba con la humanidad y un hombre queda solo en el mundo.'],
    'Rojo y negro': ['Novela', ['Ambición', 'Clase social', 'Amor', 'Religión'], ['Julien Sorel:M', 'madame de Rênal:F', 'Mathilde de La Mole:F'], 'Un joven pobre y ambicioso usa la seducción y la Iglesia para subir en la sociedad.'],
    'Eugenio Oneguin': ['Poema', ['Amor', 'Soledad', 'Rivalidad', 'Destino'], ['Eugenio Oneguin:M', 'Tatiana:F', 'Lenski:M', 'Olga:F'], 'Un dandi aburrido rechaza a una joven que lo ama y años después descubre que la perdió para siempre.'],
    'Papá Goriot': ['Novela', ['Familia', 'Dinero', 'Ambición', 'Sacrificio'], ['Goriot:M', 'Eugène de Rastignac:M', 'Vautrin:M', 'Delphine:F'], 'Un padre lo sacrifica todo por sus hijas ambiciosas mientras un joven aprende las reglas crueles de París.'],
    'El inspector': ['Obra de teatro', ['Corrupción', 'Engaño', 'Humor', 'Poder'], ['Jlestakov:M', 'el alcalde:M', 'Ana Andréievna:F'], 'Los funcionarios corruptos de un pueblo confunden a un joven vago con un inspector del gobierno.'],
    'Los papeles póstumos del Club Pickwick': ['Novela', ['Amistad', 'Humor', 'Búsqueda'], ['el señor Pickwick:M', 'Sam Weller:M', 'Tupman:M', 'Snodgrass:M'], 'Un caballero bondadoso y sus amigos viajan por Inglaterra metiéndose en enredos.'],
    'Los crímenes de la calle Morgue': ['Cuento', ['Asesinos', 'Verdad', 'Ingenio', 'Miedo'], ['Auguste Dupin:M', 'el narrador:M'], 'Un detective aficionado resuelve un crimen imposible en una habitación cerrada de París.'],
    'Almas muertas': ['Novela', ['Codicia', 'Engaño', 'Corrupción', 'Sociedad'], ['Chíchikov:M'], 'Un estafador recorre Rusia comprando los papeles de siervos muertos para hacerse rico.'],
    'La cabaña del tío Tom': ['Novela', ['Esclavitud', 'Fe', 'Familia', 'Injusticia'], ['el tío Tom:M', 'Eliza:F', 'Eva:F', 'Simon Legree:M'], 'La vida de un esclavo bondadoso y de una madre que huye para salvar a su hijo.'],
    'Historia de dos ciudades': ['Novela', ['Revolución francesa', 'Sacrificio', 'Amor', 'Redención'], ['Sydney Carton:M', 'Lucie Manette:F', 'Charles Darnay:M', 'madame Defarge:F'], 'Entre Londres y el París de la Revolución, un hombre sin rumbo encuentra una causa por la cual darlo todo.'],
    'Grandes esperanzas': ['Novela', ['Ambición', 'Clase social', 'Amor', 'Identidad'], ['Pip:M', 'Estella:F', 'la señorita Havisham:F', 'Magwitch:M'], 'Un huérfano recibe una fortuna misteriosa y aprende que la grandeza no es lo que creía.'],
    'Tradiciones peruanas': ['Cuento', ['Historia', 'Humor', 'Culturas indígenas', 'Sociedad'], ['el narrador:M'], 'Cientos de relatos breves y pícaros sobre la historia y los personajes del Perú.'],
    'La isla misteriosa': ['Novela', ['Supervivencia', 'Ciencia', 'Amistad', 'Secretos'], ['Cyrus Smith:M', 'Pencroft:M', 'Gedeón Spilett:M', 'el capitán Nemo:M'], 'Náufragos de un globo construyen una vida en una isla donde alguien los protege en secreto.'],
    'Casa de muñecas': ['Obra de teatro', ['Libertad', 'Familia', 'Identidad', 'Secretos'], ['Nora Helmer:F', 'Torvald Helmer:M', 'Krogstad:M'], 'Una esposa que parece feliz guarda un secreto que la obliga a mirar su vida de frente.'],
    'Cumandá': ['Novela', ['Culturas indígenas', 'Amor', 'Religión', 'Destino'], ['Cumandá:F', 'Carlos:M'], 'En la selva amazónica, el amor de una joven indígena y el hijo de un misionero choca con el pasado.'],
    'Los hermanos Karamázov': ['Novela', ['Hermanos', 'Fe', 'Culpa', 'Familia'], ['Dmitri:M', 'Iván:M', 'Aliosha:M', 'Fiódor Karamázov:M', 'Grúshenka:F'], 'Tres hermanos muy distintos quedan bajo sospecha cuando asesinan a su padre.'],
    'Las minas del rey Salomón': ['Novela', ['Búsqueda', 'Riqueza', 'Amistad', 'Supervivencia'], ['Allan Quatermain:M', 'sir Henry Curtis:M', 'el capitán Good:M', 'Gagool:F'], 'Un cazador guía a una expedición por África en busca de un hermano perdido y de unas minas legendarias.'],
    'El Horla': ['Cuento', ['Locura', 'Miedo', 'Posesiones', 'Soledad'], ['el narrador:M'], 'Un hombre siente que un ser invisible vive en su casa y le roba la voluntad.'],
    'El príncipe feliz': ['Cuento', ['Sacrificio', 'Pobreza', 'Amistad', 'Empatía'], ['el Príncipe Feliz:M', 'la golondrina:F'], 'La estatua de un príncipe pide a una golondrina que reparta su oro y sus joyas entre los pobres.'],
    'Salomé': ['Obra de teatro', ['Deseo', 'Poder', 'Venganza', 'Religión'], ['Salomé:F', 'Herodes:M', 'Herodías:F', 'Iokanaán:M'], 'La princesa de Judea baila para el rey y pide a cambio la cabeza del profeta que la rechazó.'],
    'La gaviota': ['Obra de teatro', ['Arte', 'Amor', 'Fracaso', 'Sueños'], ['Nina:F', 'Kostia Tréplev:M', 'Arkádina:F', 'Trigorin:M'], 'Jóvenes artistas y viejas glorias se enamoran y se hieren en una casa de campo junto a un lago.'],
    'Cyrano de Bergerac': ['Obra de teatro', ['Amor', 'Identidad', 'Honor', 'Sacrificio'], ['Cyrano:M', 'Roxana:F', 'Christian:M'], 'Un poeta valiente y de nariz enorme escribe las cartas de amor que otro hombre firma.'],
    'El jardín de los cerezos': ['Obra de teatro', ['Clase social', 'Despedida', 'Memoria', 'Dinero'], ['Liubov Ranévskaya:F', 'Lopajin:M', 'Gáiev:M', 'Varia:F'], 'Una familia noble arruinada se niega a aceptar que va a perder su querido jardín.'],
    'Ana de las Tejas Verdes': ['Novela', ['Infancia', 'Familia', 'Identidad', 'Amistad'], ['Ana Shirley:F', 'Marilla Cuthbert:F', 'Matthew Cuthbert:M', 'Gilbert Blythe:M'], 'Una huérfana pelirroja y soñadora llega por error a una granja y conquista a todo el pueblo.'],
    'El viento en los sauces': ['Novela', ['Amistad', 'Naturaleza', 'Humor', 'Autos clásicos'], ['Topo:M', 'Rata:M', 'el señor Sapo:M', 'Tejón:M'], 'Un topo, una rata de agua y un sapo loco por los autos viven aventuras a la orilla del río.'],
    'El mundo perdido': ['Novela', ['Descubrimientos', 'Evolución', 'Supervivencia', 'Ciencia'], ['el profesor Challenger:M', 'Edward Malone:M', 'lord John Roxton:M'], 'Una expedición encuentra una meseta en Sudamérica donde todavía viven dinosaurios.'],
    'Una princesa de Marte': ['Novela', ['Planetas', 'Guerra', 'Amor', 'Héroes'], ['John Carter:M', 'Dejah Thoris:F', 'Tars Tarkas:M'], 'Un soldado despierta en Marte, donde su fuerza lo vuelve un héroe entre guerreros de cuatro brazos.'],
    'Pigmalión': ['Obra de teatro', ['Clase social', 'Identidad', 'Transformación', 'Ingenio'], ['Eliza Doolittle:F', 'Henry Higgins:M', 'el coronel Pickering:M'], 'Un profesor apuesta que puede convertir a una vendedora de flores en una dama, y ella acaba enseñándole a él.'],
    'Los cuatro jinetes del Apocalipsis': ['Novela', ['Primera Guerra Mundial', 'Familia', 'Guerra', 'Amor'], ['Julio Desnoyers:M', 'Marcelo Desnoyers:M', 'Margarita:F'], 'Una familia dividida entre Francia y Alemania ve cómo la guerra destruye todo lo que ama.'],
    'R.U.R. (Robots Universales Rossum)': ['Obra de teatro', ['Humanidad y máquinas', 'Rebelión', 'Tecnología', 'Humanidad'], ['Harry Domin:M', 'Helena Glory:F', 'Alquist:M'], 'Una fábrica crea obreros artificiales que un día deciden que ya no quieren obedecer.'],
    'La vorágine': ['Novela', ['Naturaleza', 'Explotación', 'Supervivencia', 'Amor'], ['Arturo Cova:M', 'Alicia:F'], 'Un poeta huye con su amada hacia los llanos y la selva, donde la explotación del caucho devora a los hombres.'],
    'Nosotros': ['Novela', ['Dictadura', 'Vigilancia', 'Libertad', 'Amor'], ['D-503:M', 'I-330:F'], 'En una ciudad de cristal donde todo está vigilado, un ingeniero descubre el deseo de ser libre.'],
    'El proceso': ['Novela', ['Injusticia', 'Culpa', 'Deshumanización', 'Poder'], ['Josef K.:M'], 'Un hombre es arrestado una mañana sin saber de qué se le acusa ni quién lo juzga.'],
    'La señora Dalloway': ['Novela', ['Memoria', 'Tiempo', 'Clase social', 'Soledad'], ['Clarissa Dalloway:F', 'Septimus Smith:M', 'Peter Walsh:M'], 'Un día en Londres: una mujer prepara una fiesta mientras recuerda la vida que pudo tener.'],
    'La historia de Genji': ['Novela', ['Amor', 'Poder', 'Seducción', 'Japón feudal'], ['Genji:M', 'Murasaki:F', 'Fujitsubo:F'], 'Las vidas y los amores de un príncipe brillante en la corte imperial de Japón.'],
    'Sakuntala': ['Obra de teatro', ['Amor', 'Destino', 'Memoria', 'Magia'], ['Sakuntala:F', 'el rey Dushyanta:M'], 'Un rey se enamora de una joven del bosque, pero una maldición le borra el recuerdo.'],
    'El flautista de Hamelín': ['Leyenda', ['Engaño', 'Venganza', 'Infancia', 'Magia'], ['el flautista:M', 'el alcalde:M'], 'Un flautista libra a un pueblo de las ratas y, cuando no le pagan, se lleva a los niños con su música.'],
    'El holandés errante': ['Leyenda', ['Maldiciones antiguas', 'Redención', 'Amor', 'Fantasmas'], ['el capitán holandés:M', 'Senta:F'], 'Un capitán maldito navega para siempre y solo un amor fiel puede liberarlo.'],
    'La Patasola': ['Leyenda', ['Naturaleza', 'Miedo', 'Venganza', 'Castigo'], ['la Patasola:F'], 'En las selvas de Colombia, una mujer de una sola pierna castiga a quienes destruyen el monte.'],
    'El Cadejo': ['Leyenda', ['Bien y mal', 'Miedo', 'Lealtad'], ['el Cadejo blanco:M', 'el Cadejo negro:M'], 'Dos perros fantasmas acompañan a los caminantes de la noche: uno los protege y el otro los tienta.'],
    'La Biblia': ['Leyenda', ['Fe', 'Religión', 'Familia', 'Sacrificio', 'Redención', 'Traición', 'Esperanza', 'Poder'], ['Adán:M', 'Eva:F', 'Noé:M', 'Abraham:M', 'Moisés:M', 'David:M', 'Salomón:M', 'Ester:F', 'Jesús de Nazaret:M', 'María:F', 'Pedro:M', 'Pablo:M'], 'Desde la creación del mundo hasta los primeros cristianos: patriarcas, reyes, profetas y la vida de Jesús de Nazaret, en el libro más leído de la historia.'],
    'El arca de Noé': ['Leyenda', ['Fe', 'Familia', 'Supervivencia', 'Animales', 'Desastres naturales', 'Esperanza'], ['Noé:M', 'la esposa de Noé:F', 'Sem:M', 'Cam:M', 'Jafet:M'], 'Dios anuncia un diluvio y Noé construye un arca enorme para salvar a su familia y a una pareja de cada animal.'],
    'Moisés y el Éxodo': ['Leyenda', ['Fe', 'Libertad', 'Esclavitud', 'Exilio', 'Familia', 'Rebelión'], ['Moisés:M', 'Aarón:M', 'Miriam:F', 'el faraón:M', 'Séfora:F'], 'Un hombre criado como príncipe de Egipto descubre su origen y guía a su pueblo esclavizado hacia la libertad, a través del desierto y del mar.'],
    'David y Goliat': ['Leyenda', ['Fe', 'Valor', 'Guerra', 'Reyes', 'Ambición'], ['David:M', 'Goliat:M', 'el rey Saúl:M', 'Jonatán:M', 'Mical:F'], 'Un joven pastor se enfrenta con una honda al gigante que aterroriza a su pueblo y empieza su camino hacia el trono.'],
    'Sansón y Dalila': ['Leyenda', ['Traición', 'Seducción', 'Poder', 'Venganza', 'Fe'], ['Sansón:M', 'Dalila:F', 'Manoa:M'], 'Un hombre de fuerza invencible se enamora de la mujer que lo venderá a sus enemigos por el secreto de su poder.'],
    'Los Evangelios': ['Leyenda', ['Fe', 'Sacrificio', 'Redención', 'Traición', 'Amor', 'Esperanza', 'Religión'], ['Jesús de Nazaret:M', 'María:F', 'José:M', 'Pedro:M', 'Juan:M', 'Judas:M', 'María Magdalena:F', 'Poncio Pilato:M'], 'La vida de Jesús de Nazaret: su nacimiento, sus enseñanzas y milagros, la traición, su muerte en la cruz y su resurrección.'],
    'La canción de Roldán': ['Poema', ['Honor', 'Lealtad', 'Traición', 'Guerra', 'Caballeros', 'Sacrificio'], ['Roldán:M', 'Oliveros:M', 'Carlomagno:M', 'Ganelón:M'], 'Roldán, sobrino de Carlomagno, cae en una emboscada en los Pirineos por la traición de Ganelón y se niega a pedir ayuda.'],
    'Tristán e Isolda': ['Leyenda', ['Amor', 'Traición', 'Lealtad', 'Muerte', 'Caballeros'], ['Tristán:M', 'Isolda:F', 'el rey Marco:M', 'Brangania:F'], 'Un caballero y la prometida de su rey beben por error un filtro de amor y viven una pasión imposible hasta la muerte.'],
    'El paraíso perdido': ['Poema', ['Rebelión', 'Dios', 'Fe', 'Libertad', 'Bien y mal'], ['Satanás:M', 'Adán:M', 'Eva:F', 'el arcángel Miguel:M'], 'El ángel caído Satanás se rebela contra el cielo y tienta a Adán y Eva, que pierden el paraíso pero conservan la esperanza.'],
    'Fuenteovejuna': ['Obra de teatro', ['Justicia', 'Rebelión', 'Pueblo', 'Injusticia', 'Honor'], ['Laurencia:F', 'Frondoso:M', 'el comendador Fernán Gómez:M', 'Esteban:M'], 'Un pueblo entero se levanta contra el comendador que abusa de todos y, ante el juez, cada vecino responde lo mismo: «Fuenteovejuna lo hizo».'],
    'El avaro': ['Obra de teatro', ['Codicia', 'Dinero', 'Familia', 'Humor', 'Engaño'], ['Harpagón:M', 'Cleanto:M', 'Elisa:F', 'Valerio:M', 'Mariana:F'], 'Un viejo obsesionado con su dinero quiere casar a sus hijos por conveniencia mientras esconde su tesoro en el jardín.'],
    'Julio César': ['Obra de teatro', ['Poder', 'Traición', 'Política', 'Imperio romano', 'Honor'], ['Julio César:M', 'Bruto:M', 'Casio:M', 'Marco Antonio:M', 'Porcia:F'], 'Un grupo de senadores asesina a Julio César para salvar la república, pero el discurso de Marco Antonio desata la guerra civil.'],
    'El mercader de Venecia': ['Obra de teatro', ['Justicia', 'Dinero', 'Venganza', 'Amor', 'Discriminación'], ['Antonio:M', 'Shylock:M', 'Porcia:F', 'Basanio:M'], 'Un comerciante pide un préstamo con una garantía terrible, una libra de su propia carne, y solo el ingenio de Porcia puede salvarlo.'],
    'La fierecilla domada': ['Obra de teatro', ['Amor', 'Humor', 'Familia', 'Rivalidad', 'Engaño'], ['Catalina:F', 'Petruchio:M', 'Blanca:F', 'Bautista:M'], 'Un caballero decide casarse con la mujer de peor carácter de Padua, y su choque se vuelve una batalla de ingenio.'],
    'Noche de reyes': ['Obra de teatro', ['Amor', 'Identidad', 'Engaño', 'Humor', 'Hermanos'], ['Viola:F', 'Orsino:M', 'Olivia:F', 'Sebastián:M', 'Malvolio:M'], 'Tras un naufragio, Viola se disfraza de hombre para servir a un duque y termina en un enredo amoroso con su hermano gemelo de por medio.'],
    'Ricardo III': ['Obra de teatro', ['Ambición', 'Poder', 'Traición', 'Reyes', 'Corrupción'], ['Ricardo III:M', 'lady Ana:F', 'Buckingham:M', 'la reina Isabel:F'], 'Un duque ambicioso manipula y elimina a todos los que lo separan del trono de Inglaterra, hasta que su reinado se derrumba.'],
    'Mucho ruido y pocas nueces': ['Obra de teatro', ['Amor', 'Engaño', 'Humor', 'Celos', 'Honor'], ['Beatriz:F', 'Benedicto:M', 'Hero:F', 'Claudio:M', 'don Juan:M'], 'Dos enemigos del amor caen en la trampa de sus amigos, mientras otra pareja casi se rompe por una mentira.'],
    'Los últimos días de Pompeya': ['Novela', ['Amor', 'Desastres naturales', 'Imperio romano', 'Fe', 'Volcanes'], ['Glauco:M', 'Ione:F', 'Nidia:F', 'Arbaces:M'], 'En la Pompeya del año 79, un joven griego, una mujer noble y una esclava ciega viven amores y traiciones mientras el Vesubio despierta.'],
    'Ben-Hur': ['Novela', ['Venganza', 'Fe', 'Redención', 'Esclavitud', 'Imperio romano', 'Amistad'], ['Judá Ben-Hur:M', 'Mesala:M', 'Ester:F', 'Quinto Arrio:M'], 'Un príncipe judío, traicionado por su amigo de infancia, pasa de esclavo en las galeras a campeón de las carreras de cuadrigas.'],
    'Quo Vadis': ['Novela', ['Fe', 'Amor', 'Imperio romano', 'Poder', 'Religión'], ['Marco Vinicio:M', 'Ligia:F', 'Nerón:M', 'Petronio:M'], 'En la Roma de Nerón, un oficial se enamora de una joven cristiana mientras la ciudad arde y empieza la persecución.'],
    'Sandokán: los tigres de Mompracem': ['Novela', ['Piratas', 'Venganza', 'Amor', 'Colonialismo', 'Islas', 'Mar'], ['Sandokán:M', 'Yáñez:M', 'Mariana Guillonk:F', 'lord James Guillonk:M'], 'El pirata Sandokán, el Tigre de Malasia, lucha contra los colonizadores británicos y se enamora de la sobrina de su peor enemigo.'],
    'El corsario negro': ['Novela', ['Piratas', 'Venganza', 'Amor', 'Mar', 'Honor'], ['el Corsario Negro:M', 'Honorata:F', 'Van Guld:M'], 'Un noble italiano convertido en pirata del Caribe jura vengar a sus hermanos y se enamora de la hija de su enemigo.'],
    'Platero y yo': ['Novela', ['Amistad', 'Naturaleza', 'Animales', 'Pueblo', 'Infancia', 'Muerte'], ['el narrador:M', 'Platero:M'], 'Un poeta recorre su pueblo andaluz junto a Platero, un burrito tierno, y cuenta sus días con ternura y melancolía.'],
    'Azul…': ['Poema', ['Amor', 'Arte', 'Belleza', 'Sueños'], ['el poeta:M'], 'Cuentos y poemas llenos de color y música que inauguran el modernismo en la literatura en español.'],
    'Doña Bárbara': ['Novela', ['Civilización y barbarie', 'Naturaleza', 'Poder', 'Venganza', 'Pueblo'], ['Santos Luzardo:M', 'doña Bárbara:F', 'Marisela:F', 'Míster Danger:M'], 'Un abogado vuelve a los llanos de Venezuela a recuperar su hacienda y se enfrenta a doña Bárbara, la temida dueña de la región.'],
    'El Kalevala': ['Poema', ['Magia', 'Música', 'Búsqueda', 'Naturaleza', 'Creación'], ['Väinämöinen:M', 'Ilmarinen:M', 'Lemminkäinen:M', 'Louhi:F'], 'Un viejo bardo mágico, un herrero y un aventurero se enfrentan a la bruja del Norte por el Sampo, un molino que da riqueza sin fin.'],
    'El conde Lucanor': ['Cuento', ['Sabiduría', 'Engaño', 'Ingenio', 'Poder'], ['el conde Lucanor:M', 'Patronio:M'], 'Un conde pide consejo a su sabio criado, que responde siempre con un cuento que termina en una enseñanza.'],
    'Gargantúa y Pantagruel': ['Novela', ['Humor', 'Conocimiento', 'Sociedad', 'Religión'], ['Gargantúa:M', 'Pantagruel:M', 'Panurgo:M', 'el hermano Juan:M'], 'Las aventuras de dos gigantes glotones y sabios que se burlan de las costumbres, la iglesia y los sabios de su época.'],
    'Utopía': ['Novela', ['Sociedad', 'Política', 'Justicia', 'Filosofía', 'Islas'], ['Rafael Hitlodeo:M', 'Tomás Moro:M'], 'Un viajero describe una isla lejana donde todo es de todos, no hay dinero y la ley busca la felicidad de cada persona.'],
    'El hombre de la máscara de hierro': ['Novela', ['Identidad', 'Lealtad', 'Monarquías', 'Secretos', 'Honor'], ['D\'Artagnan:M', 'Aramis:M', 'Athos:M', 'Porthos:M', 'Luis XIV:M', 'Felipe:M'], 'Los mosqueteros, ya viejos, descubren al prisionero de la máscara de hierro: el gemelo secreto del rey de Francia.'],
  };
  // Las de la Final van después de las 82 de siempre: así los ids de las partidas guardadas no cambian
  dominioFinal.forEach(function (fila) { const p = fila.split('|'); dominio.push(dp(p[6])(p.slice(0, 6).join('|'))); });
  dominio.forEach(function (o, i) { o.id = 'dp' + (i + 1); });
  dominio.forEach(function (o) {
    const d = DETALLE_DOMINIO[o.tit];
    if (!d) return;
    o.tipo = d[0];
    // Los «temas» de la Final que aquí son problemáticas pasan como problemáticas
    if (d[1].length) {
      const t = d[1].map(function (x) { return x === 'Valor' ? 'Valentía' : x; });
      const esProb = function (x) { return familiasProblema.some(function (f) { return f.items[x] !== undefined; }); };
      o.tem = t.filter(function (x) { return !esProb(x); });
      const pr = t.filter(esProb);
      if (pr.length) o.prob = pr;
    }
    if (d[2].length) o.pjs = d[2].map(function (c) { const q = c.split(':'); return { n: q[0], s: q[1] === 'F' ? 'F' : 'M' }; });
    if (d[3]) o.sin = d[3];
  });
  // Sinopsis y personajes de siempre de cada obra libre: al adaptarla, el reparto lleva sus nombres (Romeo y Julieta son
  // Romeo y Julieta). Cada personaje: nombre:sexo:edad:arquetipo:p (protagonista) o s (secundario).
  const CANON = {
    'La Odisea': 'Tras la guerra de Troya, Ulises tarda diez años en volver a casa, donde su esposa resiste a los pretendientes.|Ulises:M:40:Héroe:p;Penélope:F:38:Amante:s;Telémaco:M:20:Aliado:s;Polifemo:M:50:Villano:s;Atenea:F:35:Mentor:s',
    'Las mil y una noches': 'Para salvar su vida, Sherezade le cuenta al sultán un cuento cada noche y nunca lo termina.|Sherezade:F:22:Héroe:p;El sultán Shahriar:M:35:Gobernante:s;Dunyazad:F:17:Aliado:s;Simbad:M:35:Explorador:s',
    'Beowulf': 'Un guerrero cruza el mar para librar a un reino del monstruo Grendel, y años después enfrenta a un dragón.|Beowulf:M:30:Héroe:p;Grendel:M:40:Villano:s;La madre de Grendel:F:60:Sombra:s;El rey Hrothgar:M:65:Gobernante:s;Wiglaf:M:22:Aliado:s',
    'El rey Arturo': 'Un joven saca la espada de la piedra, se vuelve rey y reúne a los caballeros de la Mesa Redonda.|Arturo:M:20:Héroe:p;Merlín:M:80:Mentor:s;Ginebra:F:22:Amante:s;Lancelot:M:28:Rival:s;Morgana:F:30:Villano:s',
    'El Cantar de mio Cid': 'Desterrado por su rey, el Cid conquista tierras y riquezas para recuperar su honra y la de su familia.|El Cid:M:45:Héroe:p;Jimena:F:40:Cuidador:s;El rey Alfonso:M:40:Gobernante:s;Martín Antolínez:M:35:Aliado:s;El conde García Ordóñez:M:45:Rival:s',
    'La divina comedia': 'Dante recorre el Infierno, el Purgatorio y el Paraíso guiado por el poeta Virgilio y por su amada Beatriz.|Dante:M:35:Explorador:p;Virgilio:M:60:Mentor:s;Beatriz:F:24:Amante:s;Lucifer:M:70:Villano:s',
    'Robin Hood': 'En el bosque de Sherwood, un forajido roba a los ricos para dar a los pobres y desafía al sheriff.|Robin Hood:M:30:Rebelde:p;Lady Marian:F:25:Amante:s;El pequeño John:M:35:Aliado:s;El sheriff de Nottingham:M:45:Villano:s;Fray Tuck:M:50:Bufón:s',
    'Romeo y Julieta': 'Dos jóvenes de familias enemigas de Verona se enamoran y se casan en secreto, con un final trágico.|Romeo:M:17:Amante:p;Julieta:F:14:Amante:p;Mercucio:M:19:Aliado:s;Teobaldo:M:20:Villano:s;Fray Lorenzo:M:60:Mentor:s',
    'Hamlet': 'El príncipe de Dinamarca descubre que su tío mató a su padre para quedarse con la corona y planea vengarse.|Hamlet:M:30:Antihéroe:p;Claudio:M:50:Villano:s;Gertrudis:F:47:Cambiante:s;Ofelia:F:20:Inocente:s;Horacio:M:30:Aliado:s',
    'Don Quijote de la Mancha': 'Un hidalgo que leyó demasiados libros de caballerías sale a deshacer entuertos con su escudero Sancho.|Don Quijote:M:50:Héroe:p;Sancho Panza:M:40:Aliado:s;Dulcinea:F:25:Amante:s;Sansón Carrasco:M:24:Rival:s',
    'Macbeth': 'Tras la profecía de tres brujas, un general escocés asesina al rey y se hunde en la ambición y la culpa.|Macbeth:M:40:Antihéroe:p;Lady Macbeth:F:35:Sombra:s;Banquo:M:40:Aliado:s;Macduff:M:38:Rival:s;Las tres brujas:F:70:Heraldo:s',
    'Cenicienta': 'Una joven maltratada por su madrastra va al baile del palacio gracias a su hada madrina y pierde un zapato de cristal.|Cenicienta:F:19:Inocente:p;El príncipe:M:22:Amante:s;La madrastra:F:45:Villano:s;El hada madrina:F:70:Mago:s',
    'Robinson Crusoe': 'Un náufrago sobrevive años en una isla desierta hasta encontrar a Viernes, que se vuelve su compañero.|Robinson Crusoe:M:28:Explorador:p;Viernes:M:25:Aliado:s;El capitán:M:45:Heraldo:s',
    'Los viajes de Gulliver': 'Un médico de barco naufraga en tierras de personas diminutas, de gigantes y de caballos sabios.|Lemuel Gulliver:M:38:Explorador:p;El emperador de Liliput:M:50:Gobernante:s;Glumdalclitch:F:9:Cuidador:s;El caballo sabio:M:40:Sabio:s',
    'Fausto': 'Un sabio desencantado vende su alma al demonio Mefistófeles a cambio de juventud y conocimiento.|Fausto:M:50:Antihéroe:p;Mefistófeles:M:60:Villano:s;Margarita:F:18:Inocente:s;Wagner:M:30:Aliado:s',
    'Cuentos de los hermanos Grimm': 'Bosques, brujas y lobos: Hansel y Gretel, Caperucita, Blancanieves y otros cuentos populares alemanes.|Gretel:F:10:Héroe:p;Hansel:M:11:Inocente:p;La bruja:F:80:Villano:s;Caperucita:F:9:Inocente:s;El lobo:M:40:Villano:s',
    'Orgullo y prejuicio': 'Elizabeth Bennet y el orgulloso señor Darcy se juzgan mal hasta que aprenden a conocerse.|Elizabeth Bennet:F:20:Héroe:p;Fitzwilliam Darcy:M:28:Amante:p;Jane Bennet:F:22:Aliado:s;George Wickham:M:26:Embaucador:s;La señora Bennet:F:45:Bufón:s',
    'Frankenstein': 'Un joven científico da vida a una criatura hecha con partes de cadáveres y luego la abandona.|Víctor Frankenstein:M:24:Creador:p;La criatura:M:25:Sombra:p;Elizabeth Lavenza:F:22:Amante:s;Henry Clerval:M:24:Aliado:s;Robert Walton:M:28:Testigo:s',
    'La leyenda de Sleepy Hollow': 'Un maestro supersticioso corteja a una heredera en un pueblo donde ronda un jinete sin cabeza.|Ichabod Crane:M:28:Héroe:p;Katrina Van Tassel:F:18:Amante:s;Brom Bones:M:25:Rival:s;El jinete sin cabeza:M:40:Villano:s',
    'Oliver Twist': 'Un huérfano escapa del hospicio y cae en una banda de ladrones de Londres.|Oliver Twist:M:10:Huérfano:p;Fagin:M:60:Villano:s;El Pillo:M:14:Embaucador:s;Nancy:F:20:Cuidador:s;Bill Sikes:M:35:Villano:s',
    'Un cuento de Navidad': 'En Nochebuena, tres fantasmas visitan al avaro Ebenezer Scrooge para mostrarle su pasado, su presente y su futuro.|Ebenezer Scrooge:M:60:Antihéroe:p;Bob Cratchit:M:35:Cuidador:s;El pequeño Tim:M:6:Inocente:s;El fantasma de Marley:M:60:Heraldo:s',
    'Los tres mosqueteros': 'Un joven gascón llega a París para ser mosquetero y se une a Athos, Porthos y Aramis contra el cardenal.|D’Artagnan:M:18:Héroe:p;Athos:M:30:Mentor:s;Porthos:M:30:Aliado:s;Aramis:M:27:Aliado:s;Milady de Winter:F:26:Villano:s',
    'El conde de Montecristo': 'Encarcelado injustamente, Edmundo Dantès escapa, encuentra un tesoro y vuelve como conde para vengarse.|Edmundo Dantès:M:19:Antihéroe:p;Mercedes:F:17:Amante:s;Fernand Mondego:M:22:Villano:s;El abate Faria:M:65:Mentor:s;Danglars:M:26:Villano:s',
    'El cuervo': 'En una noche de diciembre, un cuervo entra en la casa de un hombre que llora a su amada Leonor y solo repite «nunca más».|El narrador:M:30:Testigo:p;El cuervo:M:10:Heraldo:s;Leonor:F:20:Amante:s',
    'Moby Dick': 'El capitán Ahab arrastra a su tripulación en la caza obsesiva de la ballena blanca que le arrancó una pierna.|Ismael:M:25:Testigo:p;El capitán Ahab:M:58:Antihéroe:p;Queequeg:M:30:Aliado:s;Starbuck:M:30:Aliado:s',
    'Los miserables': 'Un expresidiario que intenta redimirse es perseguido durante años por un inspector implacable.|Jean Valjean:M:46:Héroe:p;Javert:M:45:Villano:s;Fantine:F:25:Cuidador:s;Cosette:F:16:Inocente:s;Marius:M:20:Amante:s',
    'Alicia en el país de las maravillas': 'Una niña sigue a un conejo blanco por una madriguera y cae en un mundo absurdo de reglas imposibles.|Alicia:F:7:Inocente:p;El conejo blanco:M:40:Heraldo:s;El sombrerero:M:40:Bufón:s;La reina de corazones:F:50:Villano:s;El gato de Cheshire:M:30:Embaucador:s',
    'Crimen y castigo': 'Un estudiante pobre de San Petersburgo comete un asesinato convencido de ser superior, y la culpa lo consume.|Rodión Raskólnikov:M:23:Antihéroe:p;Sonia Marmeládova:F:18:Cuidador:s;Porfiri Petróvich:M:35:Rival:s;Dunia:F:22:Aliado:s',
    'Mujercitas': 'Cuatro hermanas crecen en tiempos de guerra mientras su padre está lejos: Meg, Jo, Beth y Amy.|Jo March:F:15:Rebelde:p;Meg March:F:16:Cuidador:s;Beth March:F:13:Inocente:s;Amy March:F:12:Aliado:s;Laurie:M:15:Amante:s',
    'Guerra y paz': 'Varias familias de la nobleza rusa atraviesan las guerras napoleónicas entre bailes, amores y batallas.|Pierre Bezújov:M:25:Héroe:p;Natasha Rostova:F:16:Amante:p;Andréi Bolkonski:M:30:Rival:s;Anatol Kuraguin:M:25:Embaucador:s',
    'Veinte mil leguas de viaje submarino': 'Un profesor y sus compañeros quedan prisioneros en el Nautilus, el submarino del misterioso capitán Nemo.|Pierre Aronnax:M:40:Explorador:p;El capitán Nemo:M:50:Sombra:s;Ned Land:M:40:Rebelde:s;Conseil:M:30:Aliado:s',
    'La vuelta al mundo en 80 días': 'Un caballero inglés apuesta su fortuna a que dará la vuelta al mundo en ochenta días.|Phileas Fogg:M:40:Explorador:p;Picaporte:M:30:Aliado:s;Aouda:F:22:Amante:s;El inspector Fix:M:40:Rival:s',
    'Las aventuras de Tom Sawyer': 'Un niño travieso de un pueblo a orillas del Misisipi vive aventuras con su amigo Huck y es testigo de un crimen.|Tom Sawyer:M:12:Rebelde:p;Huckleberry Finn:M:13:Aliado:s;Becky Thatcher:F:11:Inocente:s;Joe:M:40:Villano:s;La tía Polly:F:55:Cuidador:s',
    'Ana Karenina': 'Una aristócrata casada se enamora de un oficial y desafía a la sociedad rusa que la condena.|Ana Karenina:F:28:Amante:p;El conde Vronski:M:27:Amante:s;Alexéi Karenin:M:45:Rival:s;Konstantín Levin:M:32:Sabio:s;Kitty:F:18:Inocente:s',
    'La isla del tesoro': 'Un muchacho encuentra el mapa de un tesoro pirata y se embarca con un cocinero de una sola pierna.|Jim Hawkins:M:14:Héroe:p;Long John Silver:M:50:Embaucador:s;El capitán Smollett:M:45:Mentor:s;Ben Gunn:M:40:Bufón:s;El doctor Livesey:M:40:Aliado:s',
    'Pinocho': 'Un muñeco de madera tallado por Geppetto quiere ser un niño de verdad, pero su nariz crece con cada mentira.|Pinocho:M:8:Inocente:p;Geppetto:M:70:Cuidador:s;El grillo parlante:M:60:Mentor:s;El hada de cabellos turquesa:F:30:Mago:s;El zorro:M:40:Embaucador:s',
    'El extraño caso del Dr. Jekyll y Mr. Hyde': 'Un respetado médico bebe una pócima que libera su lado más oscuro: el señor Hyde.|El doctor Jekyll:M:50:Creador:p;Edward Hyde:M:50:Sombra:s;Gabriel Utterson:M:50:Testigo:s;El doctor Lanyon:M:50:Rival:s',
    'Estudio en escarlata': 'Un detective excéntrico y un médico militar se conocen al investigar un crimen marcado con la palabra «venganza».|Sherlock Holmes:M:27:Sabio:p;El doctor Watson:M:29:Aliado:s;El inspector Lestrade:M:40:Rival:s;Jefferson Hope:M:35:Villano:s',
    'El retrato de Dorian Gray': 'Un joven bello conserva su juventud mientras su retrato envejece y refleja cada uno de sus pecados.|Dorian Gray:M:20:Antihéroe:p;Lord Henry Wotton:M:35:Embaucador:s;Basil Hallward:M:35:Creador:s;Sibyl Vane:F:17:Inocente:s',
    'El libro de la selva': 'Mowgli, un niño criado por lobos en la selva de la India, aprende la ley de la jungla con un oso y una pantera.|Mowgli:M:10:Huérfano:p;Baloo:M:40:Mentor:s;Bagheera:M:30:Cuidador:s;Shere Khan:M:40:Villano:s;Kaa:F:60:Sabio:s',
    'Drácula': 'Un conde de Transilvania viaja a Inglaterra en busca de sangre nueva, y un grupo guiado por Van Helsing lo persigue.|Jonathan Harker:M:28:Héroe:p;Mina Harker:F:24:Aliado:p;El conde Drácula:M:60:Villano:s;Abraham Van Helsing:M:60:Mentor:s;Lucy Westenra:F:19:Inocente:s',
    'La guerra de los mundos': 'Marcianos invaden Inglaterra con trípodes gigantes y rayos de calor; un hombre intenta sobrevivir y reunirse con su esposa.|El narrador:M:35:Héroe:p;Su esposa:F:30:Amante:s;El coadjutor:M:40:Cambiante:s;El artillero:M:30:Rebelde:s',
    'El maravilloso mago de Oz': 'Un tornado lleva a Dorothy a la tierra de Oz, donde busca al mago con un espantapájaros, un leñador de hojalata y un león cobarde.|Dorothy:F:11:Inocente:p;El espantapájaros:M:30:Aliado:s;El leñador de hojalata:M:40:Aliado:s;El león cobarde:M:30:Bufón:s;La bruja malvada del Oeste:F:70:Villano:s',
    'Peter Pan': 'Un niño que nunca crece lleva a Wendy y a sus hermanos al País de Nunca Jamás, donde los espera el capitán Garfio.|Peter Pan:M:12:Rebelde:p;Wendy Darling:F:12:Cuidador:s;El capitán Garfio:M:45:Villano:s;Campanita:F:20:Aliado:s;John Darling:M:10:Inocente:s',
    'El fantasma de la ópera': 'Un genio desfigurado que vive bajo la Ópera de París se obsesiona con una joven soprano.|Christine Daaé:F:20:Inocente:p;Erik, el fantasma:M:45:Sombra:s;Raoul:M:21:Amante:s;Carlotta:F:40:Rival:s',
    'Tarzán de los monos': 'Un niño criado por simios en la selva africana se convierte en señor de la jungla y conoce a Jane.|Tarzán:M:20:Héroe:p;Jane Porter:F:19:Amante:s;Kala:F:30:Cuidador:s;Kerchak:M:40:Villano:s;Paul D’Arnot:M:30:Mentor:s',
    'La metamorfosis': 'Un viajante de comercio despierta convertido en un insecto gigante, y su familia ya no sabe qué hacer con él.|Gregorio Samsa:M:25:Inocente:p;Grete Samsa:F:17:Cuidador:s;El padre:M:55:Gobernante:s;La madre:F:50:Cuidador:s',
    'Bambi': 'Un cervatillo crece en el bosque, aprende a vivir con el peligro del hombre y se convierte en el príncipe del bosque.|Bambi:M:10:Inocente:p;La madre de Bambi:F:30:Cuidador:s;El viejo príncipe:M:60:Mentor:s;Faline:F:10:Amante:s',
    'El gran Gatsby': 'Un millonario misterioso da fiestas enormes en Long Island para recuperar a Daisy, el amor de su juventud.|Jay Gatsby:M:32:Amante:p;Nick Carraway:M:30:Testigo:s;Daisy Buchanan:F:23:Amante:s;Tom Buchanan:M:30:Rival:s;Jordan Baker:F:22:Aliado:s',
    'La llamada de Cthulhu': 'Unas notas heredadas revelan un culto mundial a una criatura dormida bajo el mar que no debe despertar.|Francis Thurston:M:30:Testigo:p;El inspector Legrasse:M:45:Aliado:s;Gustaf Johansen:M:40:Heraldo:s;Cthulhu:M:70:Villano:s',
    'Poemas': 'Poemas de amor y deseo escritos en la isla de Lesbos: una voz que ama, extraña y celebra la belleza.|Safo:F:30:Amante:p;Atis:F:22:Amante:s;Alceo:M:35:Aliado:s',
    'Lisístrata': 'Las mujeres de Grecia hacen huelga de amor para obligar a los hombres a terminar la guerra.|Lisístrata:F:35:Rebelde:p;Mírrina:F:25:Aliado:s;Cinesias:M:30:Bufón:s;El magistrado:M:55:Gobernante:s',
    'El arte de amar': 'Un poeta da consejos irónicos para conquistar y conservar a la persona amada en la Roma antigua.|El poeta:M:40:Embaucador:p;Corina:F:25:Amante:s;El aprendiz:M:22:Inocente:s',
    'Decamerón': 'Diez jóvenes huyen de la peste de Florencia y se cuentan cien historias de amor, ingenio y picardía.|Pampinea:F:28:Sabio:p;Dioneo:M:25:Bufón:s;Fiammetta:F:24:Amante:s;Filóstrato:M:26:Rival:s',
    'Los cuentos de Canterbury': 'Unos peregrinos camino de Canterbury compiten contando historias, de las más nobles a las más pícaras.|La comadre de Bath:F:40:Embaucador:p;El caballero:M:45:Héroe:s;El molinero:M:40:Bufón:s;El posadero:M:50:Guardián:s',
    'La Celestina': 'Una vieja alcahueta ayuda a Calisto a conquistar a Melibea, y la codicia termina en tragedia.|Celestina:F:60:Embaucador:p;Calisto:M:23:Amante:p;Melibea:F:21:Amante:s;Sempronio:M:25:Villano:s',
    'El burlador de Sevilla': 'Don Juan Tenorio seduce y engaña a cuantas mujeres puede, hasta que la estatua de un muerto viene a pedirle cuentas.|Don Juan Tenorio:M:25:Antihéroe:p;Catalinón:M:30:Bufón:s;Doña Ana de Ulloa:F:22:Inocente:s;Don Gonzalo de Ulloa:M:60:Heraldo:s',
    'Moll Flanders': 'Una mujer nacida en una cárcel de Londres sobrevive con matrimonios, engaños y robos hasta encontrar la redención.|Moll Flanders:F:30:Antihéroe:p;Jemmy:M:32:Amante:s;La institutriz:F:60:Mentor:s;El hermano mayor:M:28:Rival:s',
    'Carmen': 'Un soldado lo abandona todo por Carmen, una mujer libre e indomable, y los celos lo llevan al crimen.|Carmen:F:24:Rebelde:p;Don José:M:28:Antihéroe:p;Lucas, el torero:M:30:Rival:s;El narrador:M:40:Testigo:s',
    'La dama de las camelias': 'Una cortesana de París deja su vida de lujos por amor a un joven, pero el padre de él les exige separarse.|Margarita Gautier:F:24:Amante:p;Armando Duval:M:24:Amante:p;El señor Duval:M:55:Rival:s;Prudencia:F:40:Embaucador:s',
    'Hojas de hierba': 'Versos libres que celebran el cuerpo, la democracia, la naturaleza y la vida de una nación joven.|El poeta:M:36:Sabio:p;El camarada:M:30:Amante:s;El soldado:M:25:Testigo:s',
    'Las flores del mal': 'Poemas sobre el deseo, la belleza, el tedio y la ciudad moderna, censurados en parte al publicarse.|El poeta:M:36:Antihéroe:p;Jeanne:F:30:Amante:s;La musa:F:25:Mago:s',
    'Madame Bovary': 'La esposa de un médico de provincia busca en amantes y deudas la vida de novela que soñaba.|Emma Bovary:F:26:Rebelde:p;Charles Bovary:M:30:Cuidador:s;Rodolphe:M:34:Embaucador:s;Léon:M:23:Amante:s;Lheureux:M:45:Villano:s',
    'Teresa Raquin': 'Una mujer atrapada en un matrimonio sin amor y su amante matan al marido, y el remordimiento los persigue.|Teresa Raquin:F:24:Antihéroe:p;Laurent:M:30:Amante:p;Camille:M:25:Inocente:s;Madame Raquin:F:60:Testigo:s',
    'La Venus de las pieles': 'Un hombre le pide a la mujer que ama que lo trate como a un esclavo, y el juego de poder se vuelve peligroso.|Severin:M:30:Amante:p;Wanda:F:26:Gobernante:p;El griego:M:32:Rival:s',
    'Carmilla': 'En un castillo de Estiria, una joven solitaria se hace amiga de la misteriosa Carmilla, que esconde un secreto de sangre.|Laura:F:21:Inocente:p;Carmilla:F:24:Villano:p;El general Spielsdorf:M:60:Mentor:s;El padre de Laura:M:55:Cuidador:s',
    'Naná': 'Una actriz de variedades sin talento conquista y arruina a los hombres más poderosos de París.|Naná:F:22:Embaucador:p;El conde Muffat:M:45:Amante:s;Georges Hugon:M:21:Inocente:s;Fontan:M:30:Villano:s',
    'La Regenta': 'En una ciudad de provincia, la esposa del antiguo regente vive atrapada entre un seductor y su confesor.|Ana Ozores:F:27:Amante:p;Fermín de Pas:M:35:Sombra:s;Álvaro Mesía:M:40:Embaucador:s;Víctor Quintanar:M:55:Cuidador:s',
    'El despertar': 'En unas vacaciones junto al golfo de México, una esposa y madre despierta a su propio deseo de libertad.|Edna Pontellier:F:28:Rebelde:p;Robert Lebrun:M:26:Amante:s;Léonce Pontellier:M:40:Gobernante:s;Mademoiselle Reisz:F:60:Mentor:s',
    'El amante de Lady Chatterley': 'La esposa de un aristócrata paralizado en la guerra inicia un romance con el guardabosques de la finca.|Constance Chatterley:F:27:Amante:p;Oliver Mellors:M:37:Amante:p;Clifford Chatterley:M:29:Gobernante:s;La señora Bolton:F:47:Cuidador:s',
    'Trópico de Cáncer': 'Un escritor sin dinero vive en el París de los años 30 entre artistas, hambre y deseo.|El escritor:M:40:Antihéroe:p;Carl:M:35:Aliado:s;Tania:F:30:Amante:s;Fillmore:M:30:Bufón:s',
    'Epopeya de Gilgamesh': 'Un rey poderoso y su amigo Enkidu enfrentan monstruos y dioses; tras perderlo, busca el secreto de la inmortalidad.|Gilgamesh:M:35:Héroe:p;Enkidu:M:30:Aliado:s;Humbaba:M:60:Villano:s;Utnapishtim:M:80:Sabio:s;Ishtar:F:30:Cambiante:s',
    'Ramayana': 'El príncipe Rama, desterrado al bosque, rescata a su esposa Sita, raptada por el rey demonio Ravana.|Rama:M:25:Héroe:p;Sita:F:22:Amante:p;Lakshmana:M:23:Aliado:s;Hanuman:M:30:Aliado:s;Ravana:M:45:Villano:s',
    'Mahabharata': 'Dos ramas de una misma familia, los Pandavas y los Kauravas, se enfrentan en una gran guerra por el trono.|Arjuna:M:30:Héroe:p;Krishna:M:35:Mentor:s;Draupadi:F:28:Amante:s;Duryodhana:M:35:Villano:s;Bhishma:M:80:Sabio:s',
    'Cantar de los nibelungos': 'Sigfrido, que se bañó en sangre de dragón, es traicionado, y su viuda Crimilda planea una venganza terrible.|Sigfrido:M:25:Héroe:p;Crimilda:F:22:Antihéroe:p;Brunilda:F:25:Rival:s;Hagen:M:45:Villano:s;Gunther:M:30:Gobernante:s',
    'Epopeya de Sundiata': 'Un príncipe que de niño no podía caminar se levanta, vuelve del exilio y funda el imperio de Malí.|Sundiata:M:25:Héroe:p;Sogolon:F:45:Cuidador:s;Sumanguru:M:50:Villano:s;Balla Fasséké:M:30:Sabio:s',
    'Romance de los Tres Reinos': 'Al caer la dinastía Han, tres reinos luchan por unificar China entre estrategias, alianzas y traiciones.|Liu Bei:M:40:Héroe:p;Zhuge Liang:M:30:Sabio:s;Cao Cao:M:45:Villano:s;Guan Yu:M:38:Aliado:s;Zhang Fei:M:35:Aliado:s',
    'Viaje al Oeste': 'Un monje viaja a la India por los textos sagrados, protegido por el Rey Mono, un cerdo glotón y un monje del río.|Sun Wukong, el Rey Mono:M:30:Embaucador:p;El monje Tang Sanzang:M:30:Mentor:s;Zhu Bajie:M:35:Bufón:s;Sha Wujing:M:40:Aliado:s;El demonio del Hueso Blanco:F:30:Villano:s',
    'Popol Vuh': 'Los gemelos Hunahpú e Ixbalanqué bajan al inframundo de Xibalbá y vencen a sus señores con astucia.|Hunahpú:M:20:Héroe:p;Ixbalanqué:M:20:Héroe:p;Hun Camé:M:70:Villano:s;Ixquic:F:20:Cuidador:s',
    'La Llorona': 'Una mujer que perdió a sus hijos vaga de noche por los ríos llorando, y quien la escucha queda marcado.|La Llorona:F:30:Sombra:p;Un pescador:M:35:Testigo:s;La abuela:F:70:Sabio:s;Un niño curioso:M:10:Inocente:s',
    'El Dorado': 'Exploradores buscan una ciudad de oro en las selvas de Sudamérica, guiados por la leyenda de un cacique cubierto de polvo dorado.|Un explorador:M:35:Explorador:p;La guía:F:25:Aliado:s;El cacique dorado:M:50:Gobernante:s;El capitán ambicioso:M:45:Villano:s',
    'El Hombre Caimán': 'Un pescador del río Magdalena, por espiar a las mujeres que se bañan, termina convertido en mitad hombre y mitad caimán.|Saúl Montenegro:M:35:Bufón:p;El amigo brujo:M:40:Mago:s;Una bañista:F:25:Testigo:s',
  };
  // La historia de siempre de un material: la del canon, la que escribiste en el editor o tu retoque de una obra libre
  // Papeles por orden cuando el material no dice cuál es cada uno (nadie queda de villano sin saberlo)
  const ARQ_PROPIOS = ['Héroe', 'Aliado', 'Mentor', 'Rival', 'Amante', 'Sabio', 'Bufón', 'Rebelde'];
  function pjsPropios(l) {
    return (l || []).map(function (p, i) {
      const q = typeof p === 'string' ? { n: p, s: 'M' } : p;
      return { n: q.n, s: q.s === 'F' ? 'F' : 'M', e: 20 + (ART.n.hash(q.n) % 36), a: ARQ_PROPIOS[i % ARQ_PROPIOS.length], i: i < 1 ? 'protagonista' : 'secundario' };
    }).filter(function (p) { return p.n; });
  }
  function canon(m) {
    if (!m) return null;
    const x = CANON[m.tit];
    let r = null;
    if (x) { const p = x.split('|'); r = { sin: p[0], pj: p[1].split(';').map(function (c) { const q = c.split(':'); return { n: q[0], s: q[1], e: +q[2], a: q[3], i: q[4] === 'p' ? 'protagonista' : 'secundario' }; }) }; }
    else if (m.sin || (m.pjs || m.pers || []).length) r = { sin: m.sin || '', pj: pjsPropios(m.pjs || m.pers) }; // editor y obras de la Final
    const S = ART.n && ART.n.S, o = S && S.edit && S.edit.pdo && S.edit.pdo[m.id];
    if (o) r = { sin: o.sin || (r ? r.sin : ''), pj: o.pjs && o.pjs.length ? pjsPropios(o.pjs) : (r ? r.pj : []) };
    return r && (r.sin || r.pj.length) ? r : null;
  }
  // Géneros de la obra original que no son del cine se traducen al género de cine más cercano
  const GENERO_CINE = {
    'Poesía': 'Artes', 'Erótica': 'Erótico', 'Tragicomedia': 'Comedia', 'Tragedia': 'Drama', 'Gótico': 'Terror', 'Mitología': 'Fantasía',
  };
  function generosDeCine(lista) {
    const out = [];
    lista.forEach(function (g) { const c = GENERO_CINE[g] || g; if (D.familiaDe[c] && out.indexOf(c) < 0) out.push(c); });
    return out.slice(0, 3);
  }
  const REGLA_DOMINIO = 70; // vida del autor + 70 años (ajustable en el Editor)

  // ---------- Índices y búsquedas ----------
  function indice(familias, campo) {
    const r = {};
    familias.forEach(function (f) { (Array.isArray(f.items) ? f.items : Object.keys(f.items)).forEach(function (x) { r[x] = f[campo || 'id']; }); });
    return r;
  }
  const famSub = indice(familiasSub), famTema = indice(familiasTema), famProblema = indice(familiasProblema), famFiccion = indice(familiasFiccion);
  subgenerosGenero.forEach(function (g) { if (D.familiaDe[g]) famSub[g] = 'G:' + D.familiaDe[g]; });
  // Frase de una problemática para la sinopsis
  function fraseProblema(p) {
    for (let i = 0; i < familiasProblema.length; i++) if (familiasProblema[i].items[p]) return familiasProblema[i].items[p];
    return 'enfrenta lo que nadie más quiso enfrentar';
  }
  // Géneros de los otros medios que sirven de subgénero (los que no están ya en la lista), por medio y familia
  const NOMBRE_MEDIO_SUB = { tv: 'Televisión', juegos: 'Videojuegos', teatro: 'Teatro', musica: 'Música', libros: 'Libros' };
  const subgenerosMedios = (function () {
    const ya = {};
    subgenerosGenero.concat.apply(subgenerosGenero, familiasSub.map(function (f) { return f.items; })).forEach(function (x) { ya[x] = 1; });
    ya['Erótico'] = ya['Erótica'] = ya['Estándar'] = 1;
    const out = [];
    ['tv', 'juegos', 'teatro', 'musica', 'libros'].forEach(function (m) {
      generosMedio[m].forEach(function (f) {
        const L = f.generos.filter(function (g) { return !ya[g]; });
        L.forEach(function (g) { ya[g] = 1; famSub[g] = 'G:' + f.eje; });
        if (L.length) out.push({ id: m + f.id, nombre: NOMBRE_MEDIO_SUB[m] + ' · ' + f.nombre, items: alfa(L), medio: 1 });
      });
    });
    return out;
  })();
  function listaSubgeneros() {
    const out = [{ id: 'GEN', nombre: 'Los géneros como subgénero', items: alfa(subgenerosGenero) }];
    familiasSub.forEach(function (f) { out.push({ id: f.id, nombre: f.nombre, items: alfa(f.items) }); });
    return out.concat(subgenerosMedios);
  }

  // ---------- Explorar por etiquetas: 16 etiquetas que cruzan subgéneros, temas, problemáticas y premisas ----------
  const etiquetas = [
    ['Época', /histor|época|siglo|mediev|antig|imperi|victorian|colonial|napole|regencia|vikingo|samur|faraón|péplum|capa y espada|caballer|belle époque|años locos|feudal|gauch|revoluc|piratas|egipto|roma|grecia|incas|mayas|tenochtitlan|renacimiento|ilustración|prehistoria|cruzadas|templarios|esparta|gladiador|mongol|ruta de la seda|salvaje oeste|era victoriana|fiebre del oro/i],
    ['Futuro y ciencia', /futur|ciencia|tecnolog|robot|espacio|planeta|cyber|punk|\bia\b|clon|genétic|virtual|colonia|máquina|inform|hacker|nuclear|cibern|terraform|transhuman|simulad|extraterr|mecha|space|ucron|utop|distop|apocal|viajes en el tiempo|bucle temporal|visitante del futuro|evolución|carrera espacial|megaciudad|inmortalidad digital/i],
    ['Fantasía y mito', /fantas|mito|magia|mago|maga|hechic|elfo|enano|orco|dragón|leyend|folkl|folcl|isekai|wuxia|brujer|espada y|hada|dioses|caballeros|reyes|monarqu|elegido|profecía|maldici|crepuscular|realismo mágico|lámparas de gas/i],
    ['Oscuro y miedo', /terror|horror|miedo|gore|vamp|zomb|fantasma|demon|exorc|poses|slasher|gótic|sangre|muerte|asesin|sect|nigrom|licántrop|lobo|momia|kaiju|monstru|oscur|grimdark|criaturas|no muertos|pacto|splatter|embrujad|paranormal|lovecraft|cósmico|psicológico|corporal|tormentos|última noche|memento mori|descenso a los infiernos|infierno/i],
    ['Familiar e infantil', /famil|infan|niñ|juvenil|escuela|mascota|campament|cuento|fábula|crecer|adolesc|shōnen|shōjo|marioneta|hermanos|primer amor|juegos de infancia|graduación|mayoría de edad|novela de formación|educativo|animales/i],
    ['Romance y deseo', /amor|romanc|romántic|boda|casamiento|seduc|deseo|celos|bolero|balada|triángulo|matrimonio|enamor|pareja|cortés|citas|collige|josei|telenovela|soap|melodrama|k-drama/i],
    ['Humor', /humor|comedia|sátir|parodi|farsa|enredo|absurd|sitcom|sketch|bufón|caricatura|mundo al revés|ingenio|tragicomedia|vodevil|cabaret|confusión|intercambio de cuerpos|mentira que crece|pareja dispareja|festivo|late night|party/i],
    ['Crimen y misterio', /crimen|detect|misterio|robo|heist|golpe|mafia|narco|gangst|gánst|policía|policial|noir|negra|estafa|chantaje|investig|secuestro|culpable|asesino|habitación cerrada|quién lo hizo|true crime|judicial|tribunal|identidad secreta|doble agente|desaparición|espionaje|espías|sigilo|procedimental|secreto/i],
    ['Sociedad y poder', /poder|polític|sociedad|social|clase|dictadura|corrupc|revoluc|rebel|injusticia|desigualdad|racismo|discrimin|esclav|explot|imperialismo|propaganda|vigilancia|huelga|sindicat|corporac|trono|sistema|migración|exilio|guerra|bélic|militar|terroris|xenofob|colonialismo|justicia|anarqu|comunis|fascis|capitalis|socialis|ascenso y caída|david contra goliat|último bastión|menosprecio de corte/i],
    ['Vida interior', /soledad|duelo|culpa|identidad|memoria|locura|depresión|trauma|existencia|sueño|mente|conciencia|redención|perdón|dudas|obsesión|psicolog|insomnio|vejez|carpe diem|tempus fugit|ubi sunt|vanitas|vida es sueño|amnesia|ego|dilema|empatía|esperanza|aislamiento|humildad|segunda oportunidad|empezar de cero|beatus ille|homo viator|contemplativ/i],
    ['Acción y aventura', /acción|aventur|viaje|explor|expedici|tesoro|selva|náufrag|persecuc|batall|lucha|artes marciales|misión|rescate|escape|torneo|western|safari|alta montaña|submarino|superhéroe|asedio|invasión|equipo improbable|reunir al equipo|shooter|battle royale|metroidvania|mundo abierto|plataformas|arcade|búsqueda/i],
    ['Deporte y velocidad', /deport|fútbol|boxeo|olímp|ajedrez|tenis|béisbol|básquet|baloncesto|ciclismo|natación|atletismo|carreras?\b(?! espacial)|motor|\bautos?\b|automov|drift|rally|kart|monoplaza|moto|velocidad|arrancon|stock car|todoterreno|surf|equitación|extremo|gran premio|escudería|piloto|resistencia de|mecánicos|caza|entrenamiento/i],
    ['Arte y cultura', /\barte|músic|danza|teatro|ópera|pintur|literat|poes|cine|actuación|museo|circo|zarzuela|musical|escena|cultur|vanguard|experimental|performativ|instalaci|moda|elegancia|fama|cómic|historieta|manga|videojuego|theatrum mundi|locus amoenus|revoluciones artísticas|jazz|rock|pop|clásica|folk/i],
    ['Naturaleza', /naturalez|animal|océan|\bmar\b|bosque|selva|clima|volcán|desierto|isla|montaña|estaciones|agua|extinci|ecolog|vida salvaje|rural|campo|pradera|ártico|desastres|catástrofe|tormenta|supervivencia|naufrag|solarpunk/i],
    ['Fe y filosofía', /\bfe\b|dios|relig|filosof|espiritu|sagrad|alma|ateísmo|existencial|nihil|ocult|sacramental|ritual|peregrin|destino|bien y mal|moralidad|verdad|sabiduría|alquimia|inquisición|conocimiento|orden y caos|sacrificio|condena/i],
    ['Dinero y trabajo', /dinero|riqueza|pobreza|negocio|oficio|trabajo|deuda|herencia|lujo|apuesta|emprend|desempleo|codicia|ascenso social|corporac|sindicat|huelga|minería|oficina|capitalismo|gestión|tycoon|el gran golpe|último trabajo|economía|médico|estafas/i],
  ].map(function (e) { return { id: e[0], re: e[1] }; });
  // Las etiquetas de un elemento; los de una familia heredan además la de su familia
  const ETQ_FAMILIA = { FT: 'Futuro y ciencia', PK: 'Futuro y ciencia', FM: 'Fantasía y mito', HO: 'Oscuro y miedo', CM: 'Crimen y misterio',
    VO: 'Sociedad y poder', MV: 'Deporte y velocidad', HE: 'Época', AE: 'Acción y aventura', DC: 'Deporte y velocidad', RV: 'Romance y deseo',
    MS: 'Arte y cultura', FO: 'Oscuro y miedo', EH: 'Época', FH: 'Fantasía y mito', IF: 'Fe y filosofía', TD: 'Dinero y trabajo', NP: 'Naturaleza',
    FE: 'Futuro y ciencia', IJ: 'Familiar e infantil', EV: 'Vida interior', TL: 'Vida interior', CU: 'Vida interior', SP: 'Sociedad y poder',
    AO: 'Arte y cultura', LV: 'Acción y aventura', FR: 'Arte y cultura' };
  function etiquetasDe(x, famId) {
    const r = etiquetas.filter(function (e) { return e.re.test(x); }).map(function (e) { return e.id; });
    const f = ETQ_FAMILIA[famId];
    if (f && r.indexOf(f) < 0) r.push(f);
    return r;
  }
  // Lo que cumple todas las etiquetas elegidas, por lista: subgéneros, temas, problemáticas y premisas
  function explorar(ets) {
    if (!ets || !ets.length) return { sub: [], tem: [], prob: [], pre: [] };
    const ok = function (x, f) { const e = etiquetasDe(x, f); return ets.every(function (t) { return e.indexOf(t) >= 0; }); };
    const de = function (fams, campo) { const out = []; fams.forEach(function (f) { (Array.isArray(f.items) ? f.items : Object.keys(f.items)).forEach(function (x) { if (ok(x, f[campo || 'id'])) out.push(x); }); }); return alfa(out); };
    return { sub: de(listaSubgeneros()), tem: de(familiasTema), prob: de(familiasProblema), pre: de(familiasPremisa) };
  }
  function contar() {
    let temas = 0, sub = subgenerosGenero.length, prob = 0, fic = 0;
    familiasTema.forEach(function (f) { temas += f.items.length; });
    familiasSub.forEach(function (f) { sub += f.items.length; });
    subgenerosMedios.forEach(function (f) { sub += f.items.length; });
    familiasProblema.forEach(function (f) { prob += Object.keys(f.items).length; });
    familiasFiccion.forEach(function (f) { fic += f.items.length; });
    return { temas: temas, subgeneros: sub, problematicas: prob, ficcion: fic, dominio: dominio.length, arcos: arcos.length, subarcos: subarcos.length };
  }
  // Ordena cada familia en orden alfabético (las familias quedan en su orden fijo)
  familiasTema.forEach(function (f) { f.items = alfa(f.items); });
  // La lista plana de temas del resto del juego pasa a ser la completa de la taxonomía
  D.temas = alfa([].concat.apply([], familiasTema.map(function (f) { return f.items; })));
  familiasSub.forEach(function (f) { f.items = alfa(f.items); });
  familiasFiccion.forEach(function (f) { f.items = alfa(f.items); });

  return {
    canon: canon,
    medios: medios, tiposPorMedio: tiposPorMedio, tiposCine: tiposCine, generosMedio: generosMedio, tablaEncaje: tablaEncaje,
    subgenerosGenero: subgenerosGenero, familiasSub: familiasSub, subMinimos: subMinimos, listaSubgeneros: listaSubgeneros, subgenerosMedios: subgenerosMedios,
    modasSub: modasSub, modaSub: modaSub, etiquetas: etiquetas, etiquetasDe: etiquetasDe, explorar: explorar,
    familiasTema: familiasTema, familiasPremisa: familiasPremisa, DEPORTES_NUEVOS: DEPORTES_NUEVOS, familiasProblema: familiasProblema, fraseProblema: fraseProblema,
    arcos: arcos, subarcos: subarcos, familiasFiccion: familiasFiccion,
    corrientesCine: corrientesCine, corrientesMedio: corrientesMedio, ESTANDAR: ESTANDAR, efectoCorriente: efectoCorriente,
    estilos: estilos, prioridades: prioridades, formatos: formatos, formatoEstandar: formatoEstandar, efectoFormato: efectoFormato,
    ORDEN_CLAS: ORDEN_CLAS, contenido: contenido, contenidoFamilia: contenidoFamilia,
    DURACION_TIPICA: DURACION_TIPICA, categoriaDuracion: categoriaDuracion, complejidad: complejidad, ritmo: ritmo, efectos: efectos,
    epocas: epocas, epocasDisponibles: epocasDisponibles, lugaresExtra: lugaresExtra, idiomas: idiomas,
    publicos: publicos, sexoFamilia: sexoFamilia, importancias: importancias, MAX_EXTRAS: MAX_EXTRAS, MAX_TERCEROS: MAX_TERCEROS, arquetipos: arquetipos, nombreArquetipo: nombreArquetipo, oficiosGenero: oficiosGenero,
    dominio: dominio, generosDeCine: generosDeCine, REGLA_DOMINIO: REGLA_DOMINIO,
    famSub: famSub, famTema: famTema, famProblema: famProblema, famFiccion: famFiccion, contar: contar,
    tipoCine: function (id) { return tiposCine.filter(function (x) { return x.id === id; })[0] || tiposCine[0]; },
    epoca: function (id) { return epocas.filter(function (x) { return x.id === id; })[0] || epocas[10]; },
    arco: function (id) { return arcos.filter(function (x) { return x.id === id; })[0] || null; },
    subarco: function (id) { return subarcos.filter(function (x) { return x.id === id; })[0] || null; },
    material: function (id) {
      const d = dominio.filter(function (x) { return x.id === id; })[0];
      if (d) return d;
      const S = ART.n && ART.n.S; // Material propio del Editor (vive en la partida)
      return (S && S.edit && S.edit.mat || []).filter(function (x) { return x.id === id; })[0] || null;
    },
    estilo: function (id) { return estilos.filter(function (x) { return x.id === id; })[0] || estilos[0]; },
    prioridad: function (id) { return prioridades.filter(function (x) { return x.id === id; })[0] || prioridades[0]; },
    idioma: function (id) { return idiomas.filter(function (x) { return x.id === id; })[0] || null; },
    publico: function (id) { return publicos.filter(function (x) { return x.id === id; })[0] || null; },
  };
})();
