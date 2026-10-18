/* ==== módulo: datos ==== */
// Listas y tablas del juego, separadas de la lógica para que el Editor y las traducciones las cambien
// sin tocar el código. Rescatado del juego original: nombres por región (NMR), países (CY), rasgos (TRA),
// personalidades (TI), tonos (TO), prioridades (PR), clasificaciones (AG), rivales (RV), temas (DX.tm).
IA.datos = (function () {
  'use strict';
  const sp = function (s) { return s.split(','); };

  // ---------- Regiones y países ----------
  // hemisferio: N, S o M (mixto: las estaciones pesan menos)
  const regiones = [
    { id: 'nam', nombre: 'Norteamérica', hemisferio: 'N' },
    { id: 'lat', nombre: 'Latinoamérica', hemisferio: 'M' },
    { id: 'eur', nombre: 'Europa', hemisferio: 'N' },
    { id: 'afr', nombre: 'África', hemisferio: 'M' },
    { id: 'asi', nombre: 'Asia', hemisferio: 'N' },
    { id: 'oce', nombre: 'Oceanía', hemisferio: 'S' },
  ];
  // costo: índice de costo de rodaje frente a EE. UU.; peso: parte aproximada del mercado de su región.
  // Se agregan Rusia y Hong Kong (decisión del 5 de octubre de 2026), con nombres modernos.
  const paises = [
    { id: 'us', nombre: 'Estados Unidos', region: 'nam', idioma: 'Inglés', costo: 1.0, peso: 0.89, lon: -98, lat: 39 },
    { id: 'ca', nombre: 'Canadá', region: 'nam', idioma: 'Inglés y francés', costo: 0.9, peso: 0.11, lon: -100, lat: 57 },
    { id: 'mx', nombre: 'México', region: 'lat', idioma: 'Español', costo: 0.45, peso: 0.24, lon: -102, lat: 23 },
    { id: 'br', nombre: 'Brasil', region: 'lat', idioma: 'Portugués', costo: 0.5, peso: 0.3, lon: -52, lat: -10 },
    { id: 'ar', nombre: 'Argentina', region: 'lat', idioma: 'Español', costo: 0.45, peso: 0.1, lon: -64, lat: -34 },
    { id: 'co', nombre: 'Colombia', region: 'lat', idioma: 'Español', costo: 0.4, peso: 0.09, lon: -74, lat: 4 },
    { id: 'cl', nombre: 'Chile', region: 'lat', idioma: 'Español', costo: 0.5, peso: 0.06, lon: -71, lat: -33 },
    { id: 'pe', nombre: 'Perú', region: 'lat', idioma: 'Español', costo: 0.4, peso: 0.05, lon: -76, lat: -10 },
    { id: 'cu', nombre: 'Cuba', region: 'lat', idioma: 'Español', costo: 0.35, peso: 0.03, lon: -79, lat: 22 },
    { id: 'pa', nombre: 'Panamá', region: 'lat', idioma: 'Español', costo: 0.45, peso: 0.01, lon: -80, lat: 9 },
    { id: 'gb', nombre: 'Reino Unido', region: 'eur', idioma: 'Inglés', costo: 1.0, peso: 0.18, lon: -2, lat: 54 },
    { id: 'fr', nombre: 'Francia', region: 'eur', idioma: 'Francés', costo: 0.95, peso: 0.17, lon: 2, lat: 47 },
    { id: 'de', nombre: 'Alemania', region: 'eur', idioma: 'Alemán', costo: 0.95, peso: 0.19, lon: 10, lat: 51 },
    { id: 'es', nombre: 'España', region: 'eur', idioma: 'Español', costo: 0.75, peso: 0.12, lon: -4, lat: 40 },
    { id: 'it', nombre: 'Italia', region: 'eur', idioma: 'Italiano', costo: 0.8, peso: 0.12, lon: 12, lat: 42 },
    { id: 'ru', nombre: 'Rusia', region: 'eur', idioma: 'Ruso', costo: 0.6, peso: 0.15, lon: 90, lat: 60 },
    { id: 'ng', nombre: 'Nigeria', region: 'afr', idioma: 'Inglés y yoruba', costo: 0.35, peso: 0.26, lon: 8, lat: 9 },
    { id: 'eg', nombre: 'Egipto', region: 'afr', idioma: 'Árabe', costo: 0.35, peso: 0.22, lon: 30, lat: 27 },
    { id: 'za', nombre: 'Sudáfrica', region: 'afr', idioma: 'Inglés y zulú', costo: 0.5, peso: 0.22, lon: 24, lat: -30 },
    { id: 'ma', nombre: 'Marruecos', region: 'afr', idioma: 'Árabe y francés', costo: 0.4, peso: 0.12, lon: -6, lat: 32 },
    { id: 'ke', nombre: 'Kenia', region: 'afr', idioma: 'Suajili e inglés', costo: 0.35, peso: 0.08, lon: 38, lat: 0 },
    { id: 'in', nombre: 'India', region: 'asi', idioma: 'Hindi', costo: 0.3, peso: 0.3, lon: 78, lat: 22 },
    { id: 'cn', nombre: 'China', region: 'asi', idioma: 'Mandarín', costo: 0.5, peso: 0.34, lon: 104, lat: 35 },
    { id: 'jp', nombre: 'Japón', region: 'asi', idioma: 'Japonés', costo: 0.95, peso: 0.15, lon: 138, lat: 36 },
    { id: 'kr', nombre: 'Corea del Sur', region: 'asi', idioma: 'Coreano', costo: 0.8, peso: 0.08, lon: 128, lat: 36 },
    { id: 'th', nombre: 'Tailandia', region: 'asi', idioma: 'Tailandés', costo: 0.45, peso: 0.04, lon: 101, lat: 15 },
    { id: 'hk', nombre: 'Hong Kong', region: 'asi', idioma: 'Cantonés e inglés', costo: 0.9, peso: 0.03, lon: 114, lat: 22 },
    { id: 'au', nombre: 'Australia', region: 'oce', idioma: 'Inglés', costo: 0.95, peso: 0.8, lon: 134, lat: -25 },
    { id: 'nz', nombre: 'Nueva Zelanda', region: 'oce', idioma: 'Inglés y maorí', costo: 0.85, peso: 0.12, lon: 172, lat: -41 },
    { id: 'fj', nombre: 'Fiyi', region: 'oce', idioma: 'Fiyiano e inglés', costo: 0.4, peso: 0.03, lon: 178, lat: -18 },
    { id: 'ws', nombre: 'Samoa', region: 'oce', idioma: 'Samoano', costo: 0.4, peso: 0.01, lon: -172, lat: -14 },
    { id: 'pg', nombre: 'Papúa Nueva Guinea', region: 'oce', idioma: 'Tok Pisin', costo: 0.35, peso: 0.04, lon: 145, lat: -6 },
  ];

  // Siluetas simples de los continentes para el mapa (lon, lat)
  const continentes = [
    [[-168, 66], [-140, 70], [-95, 72], [-60, 60], [-52, 47], [-80, 25], [-97, 16], [-83, 8], [-105, 22], [-125, 38], [-135, 58]],
    [[-80, 10], [-60, 10], [-35, -6], [-40, -22], [-58, -38], [-68, -54], [-75, -45], [-72, -18], [-81, -5]],
    [[-10, 36], [-9, 43], [-2, 48], [8, 54], [10, 60], [25, 70], [40, 68], [40, 45], [28, 41], [12, 38]],
    [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [32, -30], [18, -35], [12, -17], [9, 4], [-8, 5], [-17, 14]],
    [[40, 68], [100, 78], [170, 68], [150, 50], [122, 30], [110, 20], [100, 8], [78, 8], [68, 24], [50, 28], [36, 36], [40, 45]],
    [[113, -22], [130, -12], [153, -26], [147, -38], [115, -34]],
  ];

  // ---------- Nombres por región ----------
  const nombres = {
    nam: {
      f: sp('Emily,Grace,Olivia,Madison,Hannah,Chloe,Valeria,Ximena,Camila,Abigail,Harper,Lily,Ruth,Evelyn,June,Dorothy'),
      m: sp('James,Michael,Ethan,Noah,Logan,Mateo,Santiago,Diego,Jackson,Owen,Caleb,Lucas,Walter,Henry,Frank,Arthur'),
      a: sp('Smith,Johnson,Miller,Brooks,Carter,Hughes,Hernández,García,López,Morgan,Reed,Hayes,Bennett,Parker,Dawson,Fletcher,Tremblay,Gagnon'),
    },
    lat: {
      f: sp('Valentina,Isabella,Camila,Mariana,Gabriela,Daniela,Luciana,Paula,Renata,Antonella,Juliana,Catalina,Ximena,Lupita,Rosa,Beatriz'),
      m: sp('Santiago,Sebastián,Matías,Nicolás,Juan,Andrés,Felipe,Tomás,Gabriel,Thiago,Joaquín,Emiliano,Rodrigo,Alonso,Mauricio,Ernesto'),
      a: sp('Rodríguez,Gómez,Fernández,Pérez,Martínez,Rojas,Castro,Moreno,Vargas,Silva,Souza,Alves,Ramírez,Torres,Cárdenas,Quispe,Ortega,Salazar'),
    },
    eur: {
      f: sp('Sophie,Emma,Clara,Lucía,Chiara,Ingrid,Anna,Marta,Elena,Charlotte,Freya,Amélie,Anastasia,Daria,Olga,Greta'),
      m: sp('Lukas,Mateo,Luca,Hugo,Oliver,Pierre,Jonas,Matteo,Pablo,Henrik,Louis,Viktor,Dmitri,Alexéi,Iván,Klaus'),
      a: sp('Müller,Dubois,Rossi,Navarro,Novak,Larsson,Moreau,Bianchi,Weber,Kowalski,Jensen,Fischer,Romano,Lindqvist,Petrov,Sokolov,Smirnov,Volkov'),
    },
    afr: {
      f: sp('Amara,Zainab,Nia,Imani,Ayana,Fatima,Chiamaka,Zola,Thandi,Aisha,Makena,Nala,Yasmin,Folake,Wanjiru,Salma'),
      m: sp('Kwame,Tunde,Kofi,Jabari,Sipho,Chinedu,Omar,Youssef,Bakari,Tendai,Ayo,Moussa,Karim,Thabo,Emeka,Hassan'),
      a: sp('Okafor,Mensah,Diallo,Ndlovu,Adeyemi,Kamau,Haddad,Mbeki,Traoré,Okonkwo,Abara,Ouma,Keita,Nkosi,El Amrani,Mahmoud,Otieno,Bello'),
    },
    asi: {
      f: sp('Aiko,Mei,Yuna,Priya,Ananya,Hana,Lin,Sakura,Jiwoo,Ayesha,Mai,Xinyi,Ka Yan,Wing,Deepa,Suda'),
      m: sp('Kenji,Hiroshi,Arjun,Wei,Minho,Ravi,Haruto,Jun,Rahul,Takumi,Hao,Seojun,Ka Ho,Chun,Somchai,Vikram'),
      a: sp('Tanaka,Kim,Wang,Li,Sato,Patel,Singh,Chen,Park,Nakamura,Zhang,Kumar,Yamamoto,Nguyen,Chan,Wong,Leung,Cheung'),
    },
    oce: {
      f: sp('Charlotte,Olivia,Mia,Ruby,Isla,Aroha,Ava,Matilda,Kaia,Leilani,Zoe,Ella,Mere,Sina,Talia,Hine'),
      m: sp('Jack,Oliver,William,Lachlan,Cooper,Tane,Liam,Mason,Kai,Nikau,Harrison,Riley,Sione,Wiremu,Losa,Rawiri'),
      a: sp('Wilson,Taylor,Brown,Walker,White,Thompson,Ngata,Tui,Kelly,Harris,Martin,Anderson,Clarke,Young,Fonoti,Tamatea,Leota,Kauri'),
    },
  };

  // ---------- Oficios (departamentos) ----------
  // dep: departamento que nota en la obra. base: fracción del presupuesto típico de la época que cobra un
  // talento de habilidad 50 y fama 0 (la tarifa sale del mercado, nunca del presupuesto de tu obra).
  const oficios = [
    { id: 'guion', nombre: 'Escritor', dep: 'Guion', base: 0.015 },
    { id: 'direccion', nombre: 'Director', dep: 'Dirección', base: 0.025 },
    { id: 'produccion', nombre: 'Productor', dep: 'Producción', base: 0.015 },
    { id: 'fotografia', nombre: 'Fotografía', dep: 'Fotografía', base: 0.008 },
    { id: 'musica', nombre: 'Compositor', dep: 'Música', base: 0.006 },
    { id: 'edicion', nombre: 'Editor', dep: 'Edición', base: 0.006 },
    { id: 'arte', nombre: 'Diseñador de arte y tecnología', dep: 'Arte y diseño', base: 0.008 },
    { id: 'interprete', nombre: 'Intérprete', dep: 'Actuación', base: 0.022 },
    // Cine a fondo: departamentos que antes cubría el diseñador de arte
    { id: 'vestuario', nombre: 'Diseñador de vestuario', dep: 'Vestuario y maquillaje', base: 0.005 },
    { id: 'efectos', nombre: 'Supervisor de efectos', dep: 'Efectos', base: 0.007 },
    { id: 'animacion', nombre: 'Animador', dep: 'Animación', base: 0.008 },
  ];
  // Cuántos talentos de cada oficio hay en el mundo (se mantiene con nuevas generaciones)
  const poblacionTalentos = { guion: 110, direccion: 110, produccion: 90, fotografia: 90, musica: 80, edicion: 80, arte: 90, interprete: 380, vestuario: 60, efectos: 60, animacion: 60 };

  // ---------- Familias y géneros del cine (pestaña Taxonomía del plan) ----------
  // edades: afinidad de cada grupo [niños 0-12, adolescentes 13-17, jóvenes 18-34, adultos 35-59, mayores 60+]
  // inclina: 'pub' (público), 'crit' (crítica) o 'eq' (equilibrio). costo: producción típica relativa.
  // semanas: temporada favorable (bono de género). pesos: reparto ideal de los departamentos.
  const familias = [
    {
      id: 'AA', nombre: 'Acción y aventura', generos: sp('Acción,Aventura,Bélico,Catástrofes,Deportivo,Épico,Espionaje,Superhéroes,Western'),
      edades: [0.5, 1.1, 1.3, 1.0, 0.5], inclina: 'pub', costo: 1.4, clas: 'PG-13', temporada: 'Verano', semanas: [[22, 35]],
      pesos: { guion: 0.10, direccion: 0.16, interprete: 0.16, fotografia: 0.14, musica: 0.07, edicion: 0.14, arte: 0.17, produccion: 0.06 },
    },
    {
      id: 'IM', nombre: 'Imaginación', generos: sp('Ciencia ficción,Fantasía,Folklórico,Monstruos,Surrealista'),
      edades: [0.9, 1.2, 1.2, 0.8, 0.4], inclina: 'pub', costo: 1.4, clas: 'PG-13', temporada: 'Verano y fin de año', semanas: [[22, 35], [49, 52]],
      pesos: { guion: 0.14, direccion: 0.16, interprete: 0.12, fotografia: 0.12, musica: 0.08, edicion: 0.10, arte: 0.22, produccion: 0.06 },
    },
    {
      id: 'SM', nombre: 'Suspenso y miedo', generos: sp('Crimen,Misterio,Noir,Policial,Terror,Thriller'),
      edades: [0.1, 0.9, 1.3, 1.0, 0.6], inclina: 'eq', costo: 0.75, clas: '16', temporada: 'Octubre', semanas: [[40, 44]],
      pesos: { guion: 0.20, direccion: 0.18, interprete: 0.15, fotografia: 0.13, musica: 0.10, edicion: 0.13, arte: 0.06, produccion: 0.05 },
    },
    {
      id: 'DR', nombre: 'Drama y realidad', generos: sp('Biográfico,Drama,Histórico,Judicial,Melodrama,Político,Religioso,Social'),
      edades: [0.2, 0.5, 0.8, 1.2, 1.3], inclina: 'crit', costo: 1.0, clas: 'PG-13', temporada: 'Temporada de premios', semanas: [[45, 52], [1, 8]],
      pesos: { guion: 0.25, direccion: 0.19, interprete: 0.26, fotografia: 0.09, musica: 0.06, edicion: 0.07, arte: 0.04, produccion: 0.04 },
    },
    {
      id: 'HM', nombre: 'Humor y música', generos: sp('Comedia,Festivo,Musical,Parodia'),
      edades: [0.9, 1.0, 1.0, 1.0, 0.9], inclina: 'pub', costo: 0.8, clas: 'PG', temporada: 'Navidad y verano', semanas: [[50, 52], [26, 33]],
      pesos: { guion: 0.24, direccion: 0.15, interprete: 0.24, fotografia: 0.06, musica: 0.15, edicion: 0.10, arte: 0.03, produccion: 0.03 },
    },
    {
      id: 'FJ', nombre: 'Familia y juventud', generos: sp('Adolescentes,Familiar,Infantil'),
      edades: [1.5, 1.2, 0.6, 0.9, 0.6], inclina: 'pub', costo: 1.0, clas: 'G', temporada: 'Vacaciones escolares', semanas: [[24, 34], [51, 52], [1, 1]],
      pesos: { guion: 0.18, direccion: 0.14, interprete: 0.16, fotografia: 0.08, musica: 0.14, edicion: 0.08, arte: 0.17, produccion: 0.05 },
    },
    {
      id: 'AV', nombre: 'Arte y vanguardia', generos: sp('Artes,Experimental,Falso documental'),
      edades: [0.1, 0.3, 0.9, 1.1, 0.8], inclina: 'crit', costo: 0.5, clas: 'N', temporada: 'Festivales', semanas: [[19, 21], [35, 37]],
      pesos: { guion: 0.20, direccion: 0.26, interprete: 0.14, fotografia: 0.16, musica: 0.08, edicion: 0.10, arte: 0.04, produccion: 0.02 },
    },
    {
      id: 'RD', nombre: 'Romance y deseo', generos: sp('Erótico,Romance'),
      edades: [0.0, 0.6, 1.3, 1.0, 0.6], inclina: 'pub', costo: 0.6, clas: 'PG-13', temporada: 'San Valentín', semanas: [[6, 7]],
      pesos: { guion: 0.22, direccion: 0.15, interprete: 0.30, fotografia: 0.10, musica: 0.09, edicion: 0.07, arte: 0.03, produccion: 0.04 },
    },
  ];
  const familiaDe = {};
  familias.forEach(function (f) { f.generos.forEach(function (g) { familiaDe[g] = f.id; }); });
  // Encaje entre familias (++ suma 3, + suma 1, 0 neutro, − resta 2, null = no se permite)
  const ORDEN_FAM = ['AA', 'IM', 'SM', 'DR', 'HM', 'FJ', 'AV', 'RD'];
  const ENCAJE = [
    //  AA  IM  SM  DR  HM  FJ  AV  RD
    [0, 3, 1, 1, 1, 1, -2, 0],
    [3, 0, 1, 0, 1, 3, 1, 0],
    [1, 1, 0, 1, 0, -2, 1, 0],
    [1, 0, 1, 0, 1, 0, 3, 3],
    [1, 1, 0, 1, 0, 3, 0, 3],
    [1, 3, -2, 0, 3, 0, -2, 0],
    [-2, 1, 1, 3, 0, -2, 0, 1],
    [0, 0, 0, 3, 3, 0, 1, 0],
  ];
  function encaje(famA, famB) {
    const i = ORDEN_FAM.indexOf(famA), j = ORDEN_FAM.indexOf(famB);
    if (i < 0 || j < 0) return 0;
    return ENCAJE[i][j];
  }

  // ---------- Clasificaciones (las de tu documento, con tus palabras) ----------
  // acceso: parte de cada grupo de edad que puede entrar [niños, adolescentes, jóvenes, adultos, mayores]
  // NC-17 es para 17 años y se queda en el grupo de adolescentes (decidido). Las de adultos agregan "siempre sugerido".
  // Tu documento da cuánto rinde cada una: G 60 %, PG 70 %, PG-13 100 %, 16 90 %, NC-17 80 %, 18 50 %, R 40 %, X 30 %
  // y N 50 %; aquí sale de quién puede entrar y de cuánto le gusta a cada edad.
  const clasificaciones = [
    { id: 'G', desc: 'De 0 a 6 años: lenguaje normal, sin violencia, amor amistoso; apto para familias, ideal para todo público', acceso: [1, 1, 1, 1, 1], gusto: [1.1, 0.7, 0.8, 0.9, 1.0], adultos: false, desde: 1850 },
    { id: 'PG', desc: 'De 7 a 12 años: lenguaje normal, violencia leve, amor amistoso y romántico; ideal para niños', acceso: [0.9, 1, 1, 1, 1], gusto: [1.0, 0.85, 0.9, 1, 1], adultos: false, desde: 1850 },
    { id: 'PG-13', desc: 'De 13 a 15 años: lenguaje leve, violencia moderada, amor romántico; ideal para preadolescentes y adolescentes', acceso: [0.45, 1, 1, 1, 1], gusto: [1, 1, 1, 1, 1], adultos: false, desde: 1850 },
    { id: '16', desc: 'De 16 a 17 años: lenguaje rudo, violencia intensa, amor apasionado; ideal para adolescentes', acceso: [0, 0.4, 1, 1, 1], gusto: [1, 1, 1, 1, 0.95], adultos: false, desde: 1850 },
    { id: 'NC-17', desc: '17 años: lenguaje crudo, violencia intensa, amor candente; ideal para adolescentes mayores', acceso: [0, 0.2, 1, 1, 1], gusto: [1, 1, 1, 0.97, 0.9], adultos: false, desde: 1968 },
    { id: '18', desc: 'Solo mayores de 18: lenguaje ofensivo, violencia gráfica, amor candente, siempre sugerido; ideal para nuevos adultos', acceso: [0, 0, 1, 1, 1], gusto: [1, 1, 0.95, 0.95, 0.85], adultos: true, desde: 1968 },
    { id: 'R', desc: 'Restringido, solo para adultos: lenguaje explícito, violencia sangrienta, amor candente, siempre sugerido; ideal para adultos', acceso: [0, 0, 0.9, 0.9, 0.85], gusto: [1, 1, 0.92, 0.9, 0.8], adultos: true, desde: 1968 },
    { id: 'X', desc: 'Solo para mayores: lenguaje explícito, violencia explícita, amor explícito, siempre sugerido; ideal para mayores', acceso: [0, 0, 0.5, 0.45, 0.3], gusto: [1, 1, 0.8, 0.75, 0.6], adultos: true, desde: 1968 },
    { id: 'N', desc: 'General: apto para todo público, en especial para personas ya desarrolladas; lenguaje, violencia y amor moderados y controlados', acceso: [1, 1, 1, 1, 1], gusto: [0.35, 0.45, 0.55, 0.6, 0.6], adultos: false, desde: 1850 },
  ];
  // Antes de 1968 la censura de la época (Código de Producción en Norteamérica) no deja estrenar lo más fuerte.
  const ANIO_CLASIFICACION_POR_EDADES = 1968;

  // ---------- Tonos ----------
  const tonos = [
    { id: 'Surrealista', crit: 3, pub: -2 }, { id: 'Oscuro', crit: 3, pub: -2 }, { id: 'Caótico', crit: 0, pub: 0 },
    { id: 'Reflexivo', crit: 3, pub: -3 }, { id: 'Realista', crit: 1, pub: 0 }, { id: 'Poético', crit: 3, pub: -3 },
    { id: 'Esperanzador', crit: 0, pub: 2 }, { id: 'Alegre', crit: -1, pub: 3 }, { id: 'Colorido', crit: -1, pub: 3 },
    { id: 'Épico', crit: 1, pub: 3, costo: 1.15 },
  ];

  // ---------- Rasgos de talento y personalidades (TI) ----------
  const rasgos = {
    Eficiente: [0, -0.05, 1], Perfeccionista: [2, 0.05, 1.1], Obsesivo: [1, 0.04, 1], Visionario: [3, 0.03, 1.15],
    Ambicioso: [1, 0, 1.1], Diva: [1, 0.04, 1.3], Comercial: [0, -0.02, 0.95], Amable: [0, -0.02, 0.95],
    Innovador: [2, 0.02, 1.05], Colaborativo: [1, -0.03, 1], Experimental: [1, 0.03, 1], Autor: [2, 0.03, 1.05],
    Filosófico: [1, 0.02, 1], Reflexivo: [1, 0, 1], Torpe: [-2, 0.06, 0.85], Intolerante: [-1, 0.03, 0.9],
    Terco: [-1, 0.03, 0.9], Inflexible: [-1, 0.02, 0.9], Temperamental: [0, 0.05, 0.95], Esnob: [-1, 0.01, 1.05],
  };
  const personalidades = [
    { id: 'Pretencioso', valor: 20, rasgos: sp('Torpe,Intolerante,Terco,Inflexible,Temperamental,Esnob') },
    { id: 'Antiposer', valor: 40, rasgos: sp('Experimental,Autor,Filosófico,Reflexivo') },
    { id: 'Normal', valor: 50, rasgos: ['Normal'] },
    { id: 'Poser', valor: 70, rasgos: sp('Comercial,Amable,Innovador,Colaborativo') },
    { id: 'Rockstar', valor: 90, rasgos: sp('Eficiente,Perfeccionista,Obsesivo,Visionario,Ambicioso,Diva') },
  ];

  // ---------- Estudio: tipo, visión, público ----------
  const tiposEstudio = sp('Corporación,Compañía,Productora,Estudio,Independiente,Colectivo');
  // Visión de la industria y público objetivo, ahora con un efecto pequeño y claro
  const visiones = [
    { id: 'Boutique de Culto', efecto: '+2 a la crítica, −1 al público', crit: 2, pub: -1 },
    { id: 'Prestigio de Industria', efecto: '+1 a la crítica y más fama al empezar', crit: 1, fama: 0.04 },
    { id: 'Alcance Comercial', efecto: '+1 al público', pub: 1 },
    { id: 'Alcance Global', efecto: 'Tus campañas rinden 5 % más', marketing: 0.05 },
    { id: 'Alcance Tecnológico', efecto: '+2 al arte y los efectos', bono: { arte: 2 } },
  ];
  const publicos = [
    { id: 'General', efecto: 'Sin preferencia', familias: [] },
    { id: 'Familiar', efecto: '+1 al público en familia y humor', familias: ['FJ', 'HM'], pub: 1 },
    { id: 'Joven', efecto: '+1 al público en acción, imaginación y suspenso', familias: ['AA', 'IM', 'SM'], pub: 1 },
    { id: 'Adulto', efecto: '+1 a la crítica en drama, suspenso y romance', familias: ['DR', 'SM', 'RD'], crit: 1 },
    { id: 'Cultos', efecto: '+2 a la crítica en arte e imaginación', familias: ['AV', 'IM'], crit: 2 },
  ];
  // Tipo de industria al empezar: define con qué empieza el estudio. plato: arranca con el plató de rodaje;
  // meds: medios con +1 proyecto a la vez; rebaja: factor de costo en esos medios; canal: factor del costo del canal propio
  const industrias = [
    { id: 'Cine', desde: 1895, plato: 1, meds: [], efecto: 'Plató de rodaje incluido: +2 películas o series a la vez' },
    { id: 'Televisión', desde: 1936, plato: 1, meds: [], canal: 0.6, efecto: 'Plató incluido y tu canal propio cuesta 40 % menos' },
    { id: 'Música', desde: 1877, meds: ['musica'], rebaja: 0.85, efecto: 'Sin plató; en música, +1 proyecto a la vez y 15 % menos de costo' },
    { id: 'Videojuegos', desde: 1972, meds: ['juegos'], rebaja: 0.85, efecto: 'Sin plató; en videojuegos, +1 proyecto a la vez y 15 % menos de costo' },
    { id: 'Teatro', desde: 1850, meds: ['teatro'], rebaja: 0.85, efecto: 'Sin plató; en teatro, +1 obra a la vez y 15 % menos de costo' },
    { id: 'Editorial', desde: 1850, meds: ['libros'], rebaja: 0.85, efecto: 'Sin plató; en libros, +1 proyecto a la vez y 15 % menos de costo' },
    { id: 'Mixto', desde: 1850, meds: ['musica', 'juegos', 'teatro', 'libros'], efecto: 'Sin plató; +1 proyecto a la vez en música, videojuegos, teatro y libros' },
  ];
  const CINE_DESDE = 1895;
  function industria(id) { return industrias.filter(function (x) { return x.id === id; })[0] || industrias[0]; }

  // ---------- Rivales ----------
  // tam: tamaño inicial relativo; calidad: tendencia de calidad; riesgo: cuánto se arriesgan con el presupuesto.
  const rivales = [
    { nombre: 'Aurora Films', pais: 'us', familia: 'DR', tam: 1.4, calidad: 4, riesgo: 0.4, logo: 3 },
    { nombre: 'Nova Pictures', pais: 'us', familia: 'AA', tam: 1.6, calidad: 0, riesgo: 0.7, logo: 11 },
    { nombre: 'Kappa Studios', pais: 'gb', familia: 'SM', tam: 1.0, calidad: 2, riesgo: 0.5, logo: 22 },
    { nombre: 'Lumen Corp', pais: 'fr', familia: 'AV', tam: 0.7, calidad: 5, riesgo: 0.3, logo: 37 },
    { nombre: 'Tigre Media', pais: 'mx', familia: 'HM', tam: 0.8, calidad: -1, riesgo: 0.5, logo: 45 },
    { nombre: 'Órbita Games', pais: 'kr', familia: 'IM', tam: 0.9, calidad: 1, riesgo: 0.8, logo: 58 },
    { nombre: 'Sol Naciente', pais: 'jp', familia: 'FJ', tam: 1.0, calidad: 2, riesgo: 0.4, logo: 66 },
    { nombre: 'Ágora Colectivo', pais: 'ar', familia: 'RD', tam: 0.6, calidad: 1, riesgo: 0.4, logo: 79 },
  ];

  // ---------- Títulos ----------
  const titulo1 = sp('Noche,Eco,Frontera,Aurora,Sombra,Vértigo,Marea,Cenizas,Reflejo,Horizonte,Umbral,Cometa,Silencio,Laberinto,Faro,Destello,Tormenta,Jardín,Carnaval,Espejismo,Relámpago,Abismo,Brújula,Linterna,Hierro,Ceniza,Selva,Oasis,Péndulo,Rastro');
  const titulo2 = sp('de cristal,final,eterno,sin nombre,perdido,del norte,en llamas,de invierno,secreto,imposible,de medianoche,del sur,salvaje,prohibido,de plata,sin regreso,dorado,de papel,en la niebla,del fin del mundo');
  const temas = ['Actuación', 'Adolescencia', 'Adultez', 'Aislamiento', 'Alquimia', 'Ambición', 'América', 'Amistad', 'Amor', 'Anarquismo', 'Antiguo Egipto', 'Arte', 'Artes', 'Asesinos', 'Ateísmo', 'Bien y mal', 'Bombas nucleares', 'Búsqueda', 'Caballeros', 'Capitalismo', 'Carrera espacial', 'Caza', 'China imperial', 'Cibernética', 'Ciencia', 'Cine', 'Civilización y barbarie', 'Civilizaciones precolombinas', 'Clase social', 'Clonación', 'Codicia', 'Colonialismo', 'Cómics', 'Comunismo', 'Conciencia', 'Conocimiento', 'Corrupción', 'Cruzadas', 'Culpa', 'Culpabilidad', 'Culturas indígenas', 'Depresión', 'Descubrimientos', 'Deshumanización', 'Desigualdad', 'Destino', 'Dictadura', 'Dictaduras', 'Dinero', 'Dios', 'Dioses', 'Discriminación', 'Drogas', 'Dudas', 'Duelo', 'Elegancia', 'Elfos', 'Empatía', 'Enanos', 'Entrenamiento', 'Era digital', 'Era victoriana', 'Esclavitud', 'Espacio', 'Esparta', 'Esperanza', 'Evolución', 'Exclusión', 'Exilio', 'Existencia', 'Existencialismo', 'Éxito', 'Explotación', 'Fama', 'Familia', 'Fascismo', 'Fe', 'Fiebre del oro', 'Filosofía', 'Fracaso', 'Gánsteres', 'Genética', 'Gladiadores', 'Globalización', 'Gran Depresión', 'Grecia clásica', 'Guerra', 'Guerra de trincheras', 'Guerra Fría', 'Guerras napoleónicas', 'Hackers', 'Hechiceros', 'Hermanos', 'Héroes', 'Historietas', 'Holocausto', 'Honor', 'Humanidad', 'Humanidad y máquinas', 'Humildad', 'Humor', 'IA', 'Identidad', 'Ilustración', 'Imperialismo', 'Imperio mongol', 'Imperio romano', 'Imprenta', 'Incas', 'Independencias', 'India antigua', 'Infancia', 'Informática', 'Injusticia', 'Inmortalidad', 'Inquisición', 'Islámico', 'Japón feudal', 'Justicia', 'Las pirámides', 'Lealtad', 'Libertad', 'Literatura', 'Lo prohibido', 'Locura', 'Mafia', 'Magia', 'Magos', 'Mangas', 'Mayas', 'Medieval', 'Memoria', 'Mentiras', 'Mesopotamia', 'Miedo', 'Migración', 'Minería', 'Moda', 'Monarquías', 'Moralidad', 'Mortalidad', 'Muerte', 'Muro de Berlín', 'Música', 'Naturaleza', 'Nazismo', 'Negocios', 'Nihilismo', 'Obsesión', 'Ocultismo', 'Olímpicos', 'Orcos', 'Orden y caos', 'Paz', 'Peloponeso', 'Perdón', 'Peste negra', 'Piratas', 'Planetas', 'Pobreza', 'Poder', 'Política', 'Prehistoria', 'Primera Guerra Mundial', 'Progreso', 'Propaganda', 'Racismo', 'Radicalización', 'Realidad virtual', 'Rebelión', 'Redención', 'Reinado del Terror', 'Religión', 'Renacimiento', 'Resistencia', 'Revolución', 'Revolución francesa', 'Revolución industrial', 'Revolución rusa', 'Revoluciones artísticas', 'Revoluciones tecnológicas', 'Reyes', 'Riqueza', 'Rivalidad', 'Robos', 'Ruta de la Seda', 'Sacrificio', 'Salvaje oeste', 'Secretos', 'Segunda Guerra Mundial', 'Ser humano', 'Siglo XIX', 'Socialismo', 'Sociedad', 'Soledad', 'Sueños', 'Superhéroes', 'Supervivencia', 'Tecnología', 'Templarios', 'Tenochtitlan', 'Terrorismo', 'Tiempo', 'Traición', 'Trauma', 'Vejez', 'Venganza', 'Verdad', 'Videojuegos', 'Vigilancia', 'Vikingos', 'Villanos', 'Xenofobia'];

  // ---------- Marketing: canales que aparecen en su época ----------
  // peso: parte del gasto que se lleva el canal; alcance: eficiencia; edades: a quién llega mejor
  const canales = [
    { id: 'prensa', nombre: 'Prensa', desde: 1850, hasta: 9999, peso: 1.0, alcance: 0.8, edades: [0.2, 0.5, 0.8, 1.2, 1.3] },
    { id: 'carteles', nombre: 'Carteles y vallas', desde: 1880, hasta: 9999, peso: 1.0, alcance: 0.9, edades: [1, 1, 1, 1, 1] },
    { id: 'revistas', nombre: 'Revistas de cine', desde: 1911, hasta: 2015, peso: 0.6, alcance: 0.7, edades: [0.3, 1.1, 1.2, 0.9, 0.6] },
    { id: 'trailer', nombre: 'Tráiler en cines', desde: 1913, hasta: 9999, peso: 1.2, alcance: 1.1, edades: [0.8, 1.3, 1.3, 1.0, 0.6] },
    { id: 'radio', nombre: 'Radio', desde: 1922, hasta: 9999, peso: 1.0, alcance: 1.0, edades: [0.6, 1.0, 1.0, 1.1, 1.1] },
    { id: 'tv', nombre: 'Televisión', desde: 1948, hasta: 9999, peso: 1.8, alcance: 1.3, edades: [1.2, 1.1, 1.0, 1.1, 1.2] },
    { id: 'internet', nombre: 'Internet', desde: 1995, hasta: 9999, peso: 1.0, alcance: 1.0, edades: [0.5, 1.2, 1.3, 1.0, 0.5] },
    { id: 'redes', nombre: 'Redes sociales', desde: 2006, hasta: 9999, peso: 1.4, alcance: 1.3, edades: [0.4, 1.5, 1.4, 0.9, 0.4] },
    { id: 'influencers', nombre: 'Creadores de contenido', desde: 2012, hasta: 9999, peso: 0.9, alcance: 1.1, edades: [0.8, 1.6, 1.3, 0.6, 0.2] },
    { id: 'inmersiva', nombre: 'Publicidad inmersiva', desde: 2038, hasta: 9999, peso: 1.2, alcance: 1.3, edades: [0.8, 1.4, 1.3, 1.0, 0.6] },
    { id: 'neural', nombre: 'Anuncios sensoriales', desde: 2088, hasta: 9999, peso: 1.2, alcance: 1.4, edades: [0.5, 1.2, 1.3, 1.1, 0.8] },
  ];
  // Niveles de marketing del modo rápido: múltiplo del marketing típico de la época
  const nivelesMarketing = [
    { id: 'ninguno', nombre: 'Sin campaña', mult: 0 },
    { id: 'bajo', nombre: 'Bajo', mult: 0.5 },
    { id: 'medio', nombre: 'Medio', mult: 1 },
    { id: 'alto', nombre: 'Alto', mult: 2 },
    { id: 'masivo', nombre: 'Masivo', mult: 4 },
  ];
  // Escala de producción del modo rápido: múltiplo de la producción típica de la época
  const escalas = [
    { id: 'minima', nombre: 'Mínima', mult: 0.25, semanas: 0.75 },
    { id: 'baja', nombre: 'Baja', mult: 0.5, semanas: 0.85 },
    { id: 'media', nombre: 'Media', mult: 1, semanas: 1 },
    { id: 'alta', nombre: 'Alta', mult: 2, semanas: 1.15 },
    { id: 'epica', nombre: 'Épica', mult: 4, semanas: 1.3 },
  ];

  // ---------- Construcciones del estudio ----------
  // costo: en presupuestos típicos de la época. capacidad: proyectos a la vez. bono: departamento que mejora.
  const pisos = [
    { id: 'oficinas', nombre: 'Oficinas', desde: 1850, costo: 0.3, capacidad: 1, efecto: 'Base del estudio: 1 proyecto a la vez' },
    { id: 'plato', nombre: 'Plató de rodaje', desde: 1895, costo: 0.9, capacidad: 2, efecto: '+2 proyectos a la vez' },
    { id: 'guion', nombre: 'Sala de guionistas', desde: 1895, costo: 0.35, bono: { guion: 4 }, efecto: '+4 al guion y desarrollo 1 semana más rápido', rapidez: 1 },
    { id: 'casting', nombre: 'Casting', desde: 1910, costo: 0.35, bono: { interprete: 3 }, efecto: '+3 a la actuación y más fama para tus estrenos', fama: 0.04 },
    { id: 'edicion', nombre: 'Sala de edición', desde: 1900, costo: 0.35, bono: { edicion: 4 }, efecto: '+4 a la edición y posproducción 1 semana más rápida', rapidez: 1 },
    { id: 'sonido', nombre: 'Estudio de sonido', desde: 1927, costo: 0.45, bono: { musica: 4 }, efecto: '+4 a la música y al sonido' },
    { id: 'efectos', nombre: 'Taller de efectos', desde: 1925, costo: 0.6, bono: { arte: 5 }, efecto: '+5 al arte y los efectos' },
    { id: 'marketing', nombre: 'Departamento de marketing', desde: 1915, costo: 0.35, marketing: 0.15, efecto: 'Tus campañas rinden 15 % más' },
    { id: 'archivo', nombre: 'Archivo y bóveda', desde: 1900, costo: 0.25, fijo: -0.1, efecto: 'Ordena el estudio: −10 % de gastos fijos' },
  ];
  const terrenos = [
    { id: 'backlot', nombre: 'Backlot (calles y sets)', desde: 1910, costo: 1.4, capacidad: 2, ahorro: 0.08, efecto: '+2 proyectos a la vez y −8 % en producción' },
    { id: 'foso', nombre: 'Foso de agua', desde: 1920, costo: 0.5, bono: { arte: 3 }, familias: ['AA', 'IM'], efecto: '+3 en acción e imaginación' },
    { id: 'captura', nombre: 'Estudio de captura', desde: 1995, costo: 0.7, bono: { arte: 4 }, familias: ['IM', 'AA', 'FJ'], efecto: '+4 en imaginación, acción y familia' },
    // Cines propios en la región de tu sede (hasta 3 cuentan)
    { id: 'cine', nombre: 'Cadena de cines propia', desde: 1905, costo: 1.2, efecto: 'En tu región: tus obras en 12 % más salas, te quedas con 12 puntos más de cada entrada y cobras una parte de las entradas de las obras ajenas' },
    // Tierras propias para rodar en locación (más barato, menos incidentes y una semana menos en ese terreno)
    { id: 't_ciudad', nombre: 'Manzana de ciudad', terreno: 'ciudad', desde: 1910, costo: 0.55, efecto: 'Rodar en la ciudad: más barato, más seguro y una semana menos' },
    { id: 't_pradera', nombre: 'Pradera propia', terreno: 'pradera', desde: 1905, costo: 0.35, efecto: 'Rodar en la pradera: más barato, más seguro y una semana menos' },
    { id: 't_desierto', nombre: 'Rancho en el desierto', terreno: 'desierto', desde: 1910, costo: 0.45, efecto: 'Rodar en el desierto: más barato, más seguro y una semana menos' },
    { id: 't_montana', nombre: 'Terreno en la montaña', terreno: 'montana', desde: 1915, costo: 0.5, efecto: 'Rodar en la montaña: más barato, más seguro y una semana menos' },
    { id: 't_bosque', nombre: 'Bosque propio', terreno: 'bosque', desde: 1910, costo: 0.4, efecto: 'Rodar en el bosque: más barato, más seguro y una semana menos' },
    { id: 't_tropico', nombre: 'Finca en el trópico', terreno: 'tropico', desde: 1920, costo: 0.5, efecto: 'Rodar en el trópico: más barato, más seguro y una semana menos' },
    { id: 't_artico', nombre: 'Base en el ártico', terreno: 'artico', desde: 1935, costo: 0.7, efecto: 'Rodar en el ártico: más barato, más seguro y una semana menos' },
    { id: 't_mar', nombre: 'Costa y muelle propios', terreno: 'mar', desde: 1915, costo: 0.6, efecto: 'Rodar en el mar: más barato, más seguro y una semana menos' },
  ];
  const MAX_PISOS = 10, MAX_TERRENOS = 10;

  // ---------- Premios básicos ----------
  const premios = {
    nombre: 'Premios Quimera', semana: 11,
    categorias: [
      { id: 'pelicula', nombre: 'Mejor película' },
      { id: 'direccion', nombre: 'Mejor dirección' },
      { id: 'guion', nombre: 'Mejor guion' },
      { id: 'actriz', nombre: 'Mejor actriz' },
      { id: 'actor', nombre: 'Mejor actor' },
      // Más categorías por cargo (las 5 primeras son las principales para la meta de balance)
      { id: 'animada', nombre: 'Mejor obra animada', desde: 1937 },
      { id: 'fotografia', nombre: 'Mejor fotografía', rol: 'fotografia' },
      { id: 'musica', nombre: 'Mejor música', rol: 'musica', desde: 1934 },
      { id: 'edicion', nombre: 'Mejor edición', rol: 'edicion', desde: 1934 },
      { id: 'arte', nombre: 'Mejor diseño de arte', rol: 'arte' },
      { id: 'vestuario', nombre: 'Mejor vestuario', rol: 'vestuario', desde: 1948 },
      { id: 'efectos', nombre: 'Mejores efectos', rol: 'efectos', desde: 1939 },
    ],
    principales: ['pelicula', 'direccion', 'guion', 'actriz', 'actor'],
  };

  // ---------- Cronología real 1850-2026 y eras de ficción hasta 2150 (pestaña Datos del mundo) ----------
  // Sin personas reales ni marcas. Fechas verificadas con fuentes.
  const cronologia = [
    [1850, 'Teatro, libros y folletines por entregas dominan el entretenimiento'],
    [1877, 'Se inventa el fonógrafo: aparece la música grabada en cilindros'],
    [1887, 'Se inventa el disco plano'],
    [1895, 'Nace el cine mudo: primera proyección pública con entrada pagada, en París'],
    [1905, 'Salas baratas de cine en Norteamérica: el público crece rápido'],
    [1912, 'Llegan los largometrajes y el sistema de estrellas'],
    [1914, 'Primera Guerra Mundial: Europa produce menos y crecen los estudios de Norteamérica'],
    [1920, 'Primeras emisoras de radio comerciales: compiten y sirven de marketing'],
    [1927, 'Llega el cine sonoro: suben los costos'],
    [1929, 'Crisis de 1929 y Gran Depresión: menos dinero, entradas baratas'],
    [1932, 'Primer festival de cine, en Venecia'],
    [1934, 'Se aplica el Código de Producción: censura en Norteamérica hasta 1968'],
    [1935, 'Primer largometraje en color de tres bandas: color caro y llamativo'],
    [1936, 'Primeras emisiones regulares de televisión, en el Reino Unido'],
    [1939, 'Segunda Guerra Mundial: propaganda, racionamiento y mercados cerrados'],
    [1946, 'Récord de asistencia al cine y primer festival de Cannes'],
    [1948, 'Fallo antimonopolio contra los grandes estudios: venden sus cines'],
    [1951, 'Primer festival de Berlín'],
    [1953, 'La televisión llega a los hogares; el cine responde con pantalla ancha y 3D'],
    [1954, 'Primeras emisiones de televisión en color'],
    [1968, 'Termina el Código y nace la clasificación por edades'],
    [1972, 'Nacen los videojuegos: arcades y primera consola doméstica'],
    [1975, 'El estreno amplio de verano con anuncios en TV se vuelve estrategia'],
    [1976, 'Llega el video doméstico en cinta'],
    [1977, 'Efectos especiales de nueva generación'],
    [1981, 'Canal de TV de videos musicales: el videoclip como marketing'],
    [1982, 'Disco compacto'],
    [1991, 'La web se abre al público'],
    [1995, 'Primer largometraje animado por completo en computadora'],
    [1997, 'Llega el DVD'],
    [1999, 'Piratería por internet'],
    [2005, 'Plataformas de video en línea'],
    [2007, 'Streaming de video por suscripción y teléfonos inteligentes'],
    [2009, 'Auge del 3D digital en salas'],
    [2019, 'Guerra del streaming: las plataformas compiten por catálogo'],
    [2020, 'Pandemia: cines cerrados y estrenos directos a streaming'],
    [2022, 'IA generativa al alcance del público'],
    [2023, 'Huelgas de guionistas y actores'],
    [2026, 'Presente: termina la historia real; empieza la ficción basada en predicciones'],
    [2026, 'Era «IA en todas partes»: guion, efectos y doblaje con IA; huelgas y reglas nuevas'],
    [2035, 'Era de la inmersión: realidad mixta y salas inmersivas'],
    [2050, 'Era del clima y las megaciudades: eventos climáticos cierran rodajes; sets virtuales'],
    [2065, 'Pico de población: el mercado llega a su máximo y envejece'],
    [2085, 'Interfaces neuronales: obras que se sienten; debates éticos y censura nueva'],
    [2100, 'Era orbital: rodajes en órbita y pequeños públicos en colonias'],
    [2125, 'Arte posthumano: talentos sintéticos con derechos y obras eternas'],
    [2150, 'Después de 2150: el mundo sigue con eventos generados por tu partida'],
  ];
  // Tecnologías del cine que cambian la calidad esperada
  const tecnologias = [
    { anio: 1895, nombre: 'Cine mudo' }, { anio: 1927, nombre: 'Cine sonoro' }, { anio: 1935, nombre: 'Color' },
    { anio: 1953, nombre: 'Pantalla ancha' }, { anio: 1977, nombre: 'Efectos de nueva generación' },
    { anio: 1995, nombre: 'Animación 3D' }, { anio: 2009, nombre: '3D digital' }, { anio: 2022, nombre: 'IA generativa' },
    { anio: 2040, nombre: 'Salas inmersivas' }, { anio: 2090, nombre: 'Cine sensorial' },
  ];

  // ---------- Inicio (Referencia R7): tarjetas de región, de era, sufijos de logo y ADN del mercado ----------
  // capital: múltiplo del capital recomendado; prestigio: 0 a 100; competencia: 1 baja … 3 alta
  const regionesInicio = [
    { id: 'losangeles', nombre: 'Los Ángeles', pais: 'us', desde: 1910, mercado: 'El mercado más grande del mundo', competencia: 3, capital: 1, prestigio: 8, texto: 'Sol todo el año y las majors a la vuelta de la esquina.' },
    { id: 'nuevayork', nombre: 'Nueva York', pais: 'us', desde: 1850, mercado: 'Grande y exigente', competencia: 3, capital: 1, prestigio: 7, texto: 'Teatro, prensa y dinero: todo pasa primero aquí.' },
    { id: 'londres', nombre: 'Londres', pais: 'gb', desde: 1850, mercado: 'Grande, con tradición teatral', competencia: 2, capital: 1, prestigio: 8, texto: 'Escenarios centenarios y una crítica implacable.' },
    { id: 'paris', nombre: 'París', pais: 'fr', desde: 1850, mercado: 'Mediano, amante del arte', competencia: 2, capital: 0.9, prestigio: 10, texto: 'Aquí nació el cine; la crítica pesa más que la taquilla.' },
    { id: 'berlin', nombre: 'Berlín', pais: 'de', desde: 1850, mercado: 'Mediano y experimental', competencia: 2, capital: 0.9, prestigio: 7, texto: 'Vanguardia, sombras largas y cabarets.' },
    { id: 'roma', nombre: 'Roma', pais: 'it', desde: 1850, mercado: 'Mediano', competencia: 2, capital: 0.85, prestigio: 7, texto: 'Grandes platós y una historia que se filma sola.' },
    { id: 'bombay', nombre: 'Bombay', pais: 'in', desde: 1913, mercado: 'Enorme y musical', competencia: 2, capital: 0.6, prestigio: 4, texto: 'Canciones, familias numerosas y salas siempre llenas.' },
    { id: 'lagos', nombre: 'Lagos', pais: 'ng', desde: 1992, mercado: 'Joven y veloz', competencia: 1, capital: 0.4, prestigio: 2, texto: 'Se filma rápido, barato y para millones en video.' },
    { id: 'cdmx', nombre: 'Ciudad de México', pais: 'mx', desde: 1896, mercado: 'Grande en Latinoamérica', competencia: 2, capital: 0.6, prestigio: 5, texto: 'Melodramas, comedias y una época de oro por delante.' },
    { id: 'buenosaires', nombre: 'Buenos Aires', pais: 'ar', desde: 1896, mercado: 'Mediano y culto', competencia: 1, capital: 0.6, prestigio: 6, texto: 'Tango, teatro y un público que discute todo.' },
    { id: 'bogota', nombre: 'Bogotá', pais: 'co', desde: 1897, mercado: 'Pequeño y en crecimiento', competencia: 1, capital: 0.45, prestigio: 3, texto: 'Rodar es barato y las montañas están cerca.' },
    { id: 'tokio', nombre: 'Tokio', pais: 'jp', desde: 1899, mercado: 'Grande y fiel', competencia: 2, capital: 0.9, prestigio: 7, texto: 'Samuráis, monstruos y animación de primera.' },
    { id: 'hongkong', nombre: 'Hong Kong', pais: 'hk', desde: 1909, mercado: 'Pequeño en casa, enorme afuera', competencia: 2, capital: 0.7, prestigio: 5, texto: 'Acción, artes marciales y rodajes nocturnos.' },
    { id: 'seul', nombre: 'Seúl', pais: 'kr', desde: 1919, mercado: 'Mediano y en ascenso', competencia: 1, capital: 0.6, prestigio: 4, texto: 'Thrillers afilados y dramas que conquistan el mundo.' },
    { id: 'elcairo', nombre: 'El Cairo', pais: 'eg', desde: 1896, mercado: 'El mayor del mundo árabe', competencia: 1, capital: 0.5, prestigio: 4, texto: 'Estrellas de la canción y comedias populares.' },
    { id: 'sidney', nombre: 'Sídney', pais: 'au', desde: 1896, mercado: 'Pequeño y lejano', competencia: 1, capital: 0.8, prestigio: 4, texto: 'Paisajes enormes e incentivos para rodar.' },
    { id: 'independiente', nombre: 'Independiente (donde quieras)', pais: null, desde: 1850, mercado: 'El de tu país', competencia: 1, capital: 0.5, prestigio: 1, texto: 'Sin padrinos: poco dinero, toda la libertad.' },
  ];
  // Tarjetas de era: 3 reglas del negocio de cada época (lo que ya hace la economía)
  const erasInicio = [
    { desde: 1850, hasta: 1894, nombre: 'Antes del cine', reglas: ['El teatro y la linterna mágica son el espectáculo', 'Los públicos son chicos y locales', 'La prensa decide qué se ve'] },
    { desde: 1895, hasta: 1926, nombre: 'Cine mudo', reglas: ['Películas cortas, baratas y rápidas', 'Las barreras de idioma casi no existen', 'Las estrellas nacen de un día para otro'] },
    { desde: 1927, hasta: 1947, nombre: 'Época de oro de los estudios', reglas: ['Todo el mundo va al cine cada semana', 'Los estudios tienen a sus estrellas bajo contrato', 'Llega el sonido: hay que doblar'] },
    { desde: 1948, hasta: 1966, nombre: 'Llega la televisión', reglas: ['El público se queda en casa', 'Las grandes producciones y el color atraen', 'Los cines ya no son de los estudios'] },
    { desde: 1967, hasta: 1979, nombre: 'Nuevo cine', reglas: ['Se acaba la censura: más libertad de contenido', 'Los autores mandan', 'Nace el taquillazo de verano'] },
    { desde: 1980, hasta: 1999, nombre: 'Video y taquillazos', reglas: ['El video casero es la segunda vida de cada obra', 'El marketing decide el primer fin de semana', 'Las franquicias empiezan a dominar'] },
    { desde: 2000, hasta: 2019, nombre: 'Era digital', reglas: ['El DVD y luego el streaming pagan casi la mitad', 'Los efectos digitales abaratan lo imposible', 'Las redes sociales hacen y deshacen éxitos'] },
    { desde: 2020, hasta: 2049, nombre: 'Streaming', reglas: ['Las plataformas compiten con los cines', 'Las ventanas se acortan', 'El público global decide'] },
    { desde: 2050, hasta: 9999, nombre: 'Futuro', reglas: ['Experiencias inmersivas', 'Talento humano y artificial conviven', 'Mercados nuevos que aún no existen'] },
  ];
  const sufijosLogo = sp('Pictures,Studios,Films,Productions,Entertainment,Media,Animation,Company,Cinema,Arts');
  // Motor del mercado por era (ADN del mercado)
  const motorMercado = [[1850, 'El teatro y las ferias'], [1895, 'Las novedades del cinematógrafo'], [1927, 'El cine sonoro y las estrellas'], [1948, 'La pelea contra la televisión'],
    [1967, 'Los autores y la libertad'], [1975, 'El taquillazo de verano'], [1980, 'El video casero'], [2000, 'El DVD y los efectos digitales'], [2012, 'Las franquicias y el streaming'], [2030, 'Las plataformas globales'], [2060, 'La experiencia inmersiva']];

  return {
    regionesInicio: regionesInicio, erasInicio: erasInicio, sufijosLogo: sufijosLogo, motorMercado: motorMercado,
    regiones: regiones, paises: paises, continentes: continentes, nombres: nombres, oficios: oficios, poblacionTalentos: poblacionTalentos,
    familias: familias, familiaDe: familiaDe, ORDEN_FAM: ORDEN_FAM, encaje: encaje,
    clasificaciones: clasificaciones, ANIO_CLASIFICACION_POR_EDADES: ANIO_CLASIFICACION_POR_EDADES,
    tonos: tonos, rasgos: rasgos, personalidades: personalidades,
    tiposEstudio: tiposEstudio, visiones: visiones, publicos: publicos, industrias: industrias, industria: industria, CINE_DESDE: CINE_DESDE, rivales: rivales,
    titulo1: titulo1, titulo2: titulo2, temas: temas,
    canales: canales, nivelesMarketing: nivelesMarketing, escalas: escalas,
    pisos: pisos, terrenos: terrenos, MAX_PISOS: MAX_PISOS, MAX_TERRENOS: MAX_TERRENOS,
    premios: premios, cronologia: cronologia, tecnologias: tecnologias,
    region: buscador(regiones), pais: buscador(paises), familia: buscador(familias),
    clasificacion: buscador(clasificaciones), oficio: buscador(oficios),
  };
  // Búsqueda por id con un índice (se usa miles de veces por semana)
  function buscador(lista) {
    const indice = {};
    lista.forEach(function (x) { indice[x.id] = x; });
    return function (id) { return indice[id]; };
  }
})();
