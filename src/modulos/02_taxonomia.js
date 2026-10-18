/* ==== módulo: taxonomia ==== */
// La fábrica de ideas: todas las listas del documento, sin duplicados, agrupadas en familias y en orden alfabético
// (pestaña Taxonomía del plan). La familia pesa en la matemática; cada elemento da sabor, palabras para la sinopsis,
// frases de crítica y etiquetas. También el contenido que decide la clasificación, los formatos de época, las épocas
// y lugares de la historia, los idiomas, los públicos, los arquetipos de personajes y las 82 obras de dominio público.
IA.taxonomia = (function () {
  'use strict';
  const D = IA.datos;
  const sp = function (s) { return s.split(','); };
  const alfa = function (a) { return a.slice().sort(function (x, y) { return x.localeCompare(y, 'es'); }); };

  // ---------- Medios y tipos de obra ----------
  // Cada medio con su taxonomía completa; su economía vive en la producción de cine, IA.tv e IA.medios.
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
    { id: 'jugable', nombre: 'Historia jugable', desde: 2018, costo: 1.2, semanas: 1.2, pub: 1, edades: [0.8, 1.4, 1.3, 0.8, 0.5], efecto: 'El público elige el camino: +1 al público joven' },
  ];

  // ---------- Géneros de los demás medios (el cine usa IA.datos.familias) ----------
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

  // ---------- Subgéneros: 38 son también géneros (usan la familia de su género) y 47 propios en 5 familias ----------
  // afin: encaje de la familia del subgénero con cada familia del cine (++ 3, + 1, 0, − 2)
  const subgenerosGenero = sp('Acción,Aventura,Ciencia ficción,Fantasía,Terror,Thriller,Misterio,Crimen,Policial,Noir,Drama,Romance,Comedia,Musical,Histórico,Bélico,Western,Superhéroes,Biográfico,Político,Social,Deportivo,Judicial,Espionaje,Religioso,Falso documental,Experimental,Surrealista,Adolescentes,Melodrama,Parodia,Infantil,Catástrofes,Épico,Artes,Monstruos,Festivo,Folklórico');
  const familiasSub = [
    { id: 'FT', nombre: 'Futuros y tecnología', items: sp('Apocalíptico,Biopunk,Climáticas,Cósmico,Cyberpunk,Dieselpunk,Distopía,Extraterrestres,Futurismo,Mecha,Post apocalíptico,Robótica,Solarpunk,Space opera,Steampunk,Western espacial,Tecnología,Ucronía,Utopía,Viajes en el tiempo'),
      afin: { AA: 1, IM: 3, SM: 1, DR: 0, HM: 0, FJ: 0, AV: 1, RD: -2 } },
    { id: 'FM', nombre: 'Fantasía y mito', items: sp('Artes marciales,Crepuscular,Fantasía oscura,Folklore,Isekai,Leyendas,Magia,Mitología,Realismo mágico,Wuxia'),
      afin: { AA: 1, IM: 3, SM: 0, DR: 0, HM: 0, FJ: 1, AV: 1, RD: 0 } },
    { id: 'HO', nombre: 'Horror', items: sp('Corporal,Gore,Gótico,Kaiju,Lovecraftiano,Paranormal,Psicológico,Slasher,Zombies'),
      afin: { AA: 0, IM: 1, SM: 3, DR: -2, HM: -2, FJ: -2, AV: 1, RD: -2 } },
    { id: 'CM', nombre: 'Crimen y misterio', items: sp('Detectives,Heist,Neo-noir'),
      afin: { AA: 1, IM: 0, SM: 3, DR: 1, HM: 0, FJ: -2, AV: 0, RD: 0 } },
    { id: 'VO', nombre: 'Vida, oficio y sátira', items: sp('Médico,Militar,Sátira,Supervivencia,Urbano,Viajes'),
      afin: { AA: 1, IM: 0, SM: 0, DR: 3, HM: 1, FJ: 0, AV: 1, RD: 0 } },
  ];
  // Subgéneros que suben la clasificación (siempre con guiños: en pantalla nada es gráfico)
  const subMinimos = { Gore: { violencia: 5 }, Slasher: { violencia: 4 }, Corporal: { terror: 4 } };

  // ---------- Temas: 227 en 8 familias (217 del documento y 10 deportes nuevos, marcados con *) ----------
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
    tv: [[1940, 'Televisión clásica de estudio'], [1950, 'Golden Age Television'], [1950, 'Antología televisiva'], [1950, 'Procedural television'], [1960, 'Televisión experimental'], [1970, 'Miniserie'], [1970, 'Docudrama'], [1970, 'Televisión documental observacional'], [1980, 'Quality Television'], [1980, 'Televisión posmoderna'], [1980, 'Dramedy'], [1990, 'Televisión de autor'], [1990, 'Televisión independiente'], [1990, 'Reality television'], [1990, 'Teen television'], [2000, 'Prestige Television'], [2000, 'Prestige drama'], [2000, 'Mockumentary'], [2000, 'Dark comedy television'], [2000, 'New Queer Television'], [2000, 'High-concept television'], [2000, 'Serialización contemporánea'], [2000, 'Televisión hiperrealista'], [2000, 'Web television'], [2000, 'Transmedia television'], [2000, 'Slow television'], [2010, 'Limited series'], [2010, 'Peak TV'], [2010, 'Streaming-first television'], [2010, 'Interactive television']],
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
  // Los tonos están en IA.datos.tonos; aquí se agregan los que faltaban.
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

  // ---------- Formatos de época del cine (tu documento) ----------
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

  // ---------- Duración (tu documento: de 1 a 300 minutos) ----------
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

  // ---------- Épocas y lugares de la historia (deslizador del tiempo de tu documento) ----------
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
  ].map(function (a) { return { id: a[0], m: a[1], f: a[2] }; });
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

  // ---------- Obras de dominio público (82): libres el 1 de enero del año 71 tras la muerte del autor ----------
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
  dominio.forEach(function (o, i) { o.id = 'dp' + (i + 1); });
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
  function listaSubgeneros() {
    const out = [{ id: 'GEN', nombre: 'Los géneros como subgénero', items: alfa(subgenerosGenero) }];
    familiasSub.forEach(function (f) { out.push({ id: f.id, nombre: f.nombre, items: alfa(f.items) }); });
    return out;
  }
  function contar() {
    let temas = 0, sub = subgenerosGenero.length, prob = 0, fic = 0;
    familiasTema.forEach(function (f) { temas += f.items.length; });
    familiasSub.forEach(function (f) { sub += f.items.length; });
    familiasProblema.forEach(function (f) { prob += Object.keys(f.items).length; });
    familiasFiccion.forEach(function (f) { fic += f.items.length; });
    return { temas: temas, subgeneros: sub, problematicas: prob, ficcion: fic, dominio: dominio.length, arcos: arcos.length, subarcos: subarcos.length };
  }
  // Ordena cada familia en orden alfabético (las familias quedan en el orden del plan)
  familiasTema.forEach(function (f) { f.items = alfa(f.items); });
  // La lista plana de temas del resto del juego pasa a ser la completa de la taxonomía (227)
  D.temas = alfa([].concat.apply([], familiasTema.map(function (f) { return f.items; })));
  familiasSub.forEach(function (f) { f.items = alfa(f.items); });
  familiasFiccion.forEach(function (f) { f.items = alfa(f.items); });

  return {
    medios: medios, tiposPorMedio: tiposPorMedio, tiposCine: tiposCine, generosMedio: generosMedio, tablaEncaje: tablaEncaje,
    subgenerosGenero: subgenerosGenero, familiasSub: familiasSub, subMinimos: subMinimos, listaSubgeneros: listaSubgeneros,
    familiasTema: familiasTema, familiasPremisa: familiasPremisa, DEPORTES_NUEVOS: DEPORTES_NUEVOS, familiasProblema: familiasProblema, fraseProblema: fraseProblema,
    arcos: arcos, subarcos: subarcos, familiasFiccion: familiasFiccion,
    corrientesCine: corrientesCine, corrientesMedio: corrientesMedio, ESTANDAR: ESTANDAR, efectoCorriente: efectoCorriente,
    estilos: estilos, prioridades: prioridades, formatos: formatos, formatoEstandar: formatoEstandar, efectoFormato: efectoFormato,
    ORDEN_CLAS: ORDEN_CLAS, contenido: contenido, contenidoFamilia: contenidoFamilia,
    DURACION_TIPICA: DURACION_TIPICA, categoriaDuracion: categoriaDuracion, complejidad: complejidad, ritmo: ritmo, efectos: efectos,
    epocas: epocas, epocasDisponibles: epocasDisponibles, lugaresExtra: lugaresExtra, idiomas: idiomas,
    publicos: publicos, sexoFamilia: sexoFamilia, importancias: importancias, MAX_EXTRAS: MAX_EXTRAS, MAX_TERCEROS: MAX_TERCEROS, arquetipos: arquetipos, oficiosGenero: oficiosGenero,
    dominio: dominio, generosDeCine: generosDeCine, REGLA_DOMINIO: REGLA_DOMINIO,
    famSub: famSub, famTema: famTema, famProblema: famProblema, famFiccion: famFiccion, contar: contar,
    tipoCine: function (id) { return tiposCine.filter(function (x) { return x.id === id; })[0] || tiposCine[0]; },
    epoca: function (id) { return epocas.filter(function (x) { return x.id === id; })[0] || epocas[10]; },
    arco: function (id) { return arcos.filter(function (x) { return x.id === id; })[0] || null; },
    subarco: function (id) { return subarcos.filter(function (x) { return x.id === id; })[0] || null; },
    material: function (id) {
      const d = dominio.filter(function (x) { return x.id === id; })[0];
      if (d) return d;
      const S = IA.n && IA.n.S; // Material propio del Editor (vive en la partida)
      return (S && S.edit && S.edit.mat || []).filter(function (x) { return x.id === id; })[0] || null;
    },
    estilo: function (id) { return estilos.filter(function (x) { return x.id === id; })[0] || estilos[0]; },
    prioridad: function (id) { return prioridades.filter(function (x) { return x.id === id; })[0] || prioridades[0]; },
    idioma: function (id) { return idiomas.filter(function (x) { return x.id === id; })[0] || null; },
    publico: function (id) { return publicos.filter(function (x) { return x.id === id; })[0] || null; },
  };
})();
