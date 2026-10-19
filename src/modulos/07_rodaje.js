/* ==== módulo: rodaje ==== */
// Cine a fondo: cómo se hace cada película. Departamentos con nota de F a A+, reparto del presupuesto con
// un ideal por familia, estilos de producción que unos públicos aman y otros rechazan, locación real, set, CGI o
// efectos prácticos, terrenos con ventajas, sets que se guardan y se reutilizan, costo local e incentivos de cada
// país, estudios externos de efectos y animación, dilemas e incidentes de rodaje, prueba de público y la línea de
// producción (presupuesto acordado frente a costo real). Todo es dato plano en la obra: se guarda y migra fácil.
ART.rodaje = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, X = ART.taxonomia;

  // =====================================================================
  // DATOS
  // =====================================================================
  // Departamentos que reparten el presupuesto de producción (los talentos cobran aparte)
  const DEPS = [
    { id: 'arte', nombre: 'Arte y sets' },
    { id: 'vestuario', nombre: 'Vestuario y maquillaje' },
    { id: 'efectos', nombre: 'Efectos' },
    { id: 'animacion', nombre: 'Animación' },
    { id: 'fotografia', nombre: 'Cámara e iluminación' },
    { id: 'musica', nombre: 'Música y sonido' },
    { id: 'edicion', nombre: 'Edición y posproducción' },
    { id: 'produccion', nombre: 'Logística y rodaje' },
  ];
  // Reparto ideal por familia (antes de ajustar por efectos, época, tipo y método)
  const IDEAL = {
    AA: { arte: 0.18, vestuario: 0.07, efectos: 0.20, fotografia: 0.15, musica: 0.07, edicion: 0.11, produccion: 0.22 },
    IM: { arte: 0.22, vestuario: 0.09, efectos: 0.22, fotografia: 0.12, musica: 0.08, edicion: 0.10, produccion: 0.17 },
    SM: { arte: 0.14, vestuario: 0.07, efectos: 0.10, fotografia: 0.18, musica: 0.12, edicion: 0.15, produccion: 0.24 },
    DR: { arte: 0.16, vestuario: 0.12, efectos: 0.03, fotografia: 0.18, musica: 0.10, edicion: 0.13, produccion: 0.28 },
    HM: { arte: 0.15, vestuario: 0.11, efectos: 0.04, fotografia: 0.13, musica: 0.20, edicion: 0.13, produccion: 0.24 },
    FJ: { arte: 0.20, vestuario: 0.10, efectos: 0.12, fotografia: 0.12, musica: 0.14, edicion: 0.11, produccion: 0.21 },
    AV: { arte: 0.15, vestuario: 0.08, efectos: 0.04, fotografia: 0.24, musica: 0.12, edicion: 0.17, produccion: 0.20 },
    RD: { arte: 0.14, vestuario: 0.14, efectos: 0.02, fotografia: 0.20, musica: 0.13, edicion: 0.12, produccion: 0.25 },
  };
  // Peso del vestuario en la calidad según la familia (se lo quita al arte y a la actuación)
  const PESO_VESTUARIO = { AA: 0.04, IM: 0.05, SM: 0.03, DR: 0.05, HM: 0.04, FJ: 0.05, AV: 0.03, RD: 0.05 };
  // Parte del peso del arte que pasa a efectos según el nivel de efectos (Ninguno… Demasiados)
  const PARTE_EFECTOS = [0.05, 0.15, 0.3, 0.45, 0.55];

  // Cómo se filma: método principal
  const METODOS = [
    { id: 'mixto', nombre: 'Mixto', desde: 1895, costo: 1, riesgo: 1, texto: 'Un poco de todo: set, locación y efectos según la escena.' },
    { id: 'locacion', nombre: 'Locación real', desde: 1895, costo: 1, riesgo: 1.4, dep: { fotografia: 2, arte: -1 }, texto: 'Autenticidad: +1 a la crítica en dramas, realidad y arte. Depende del clima y del viaje.' },
    { id: 'set', nombre: 'Set en estudio', desde: 1900, costo: 1, riesgo: 0.6, dep: { arte: 2 }, texto: 'Todo bajo control: menos incidentes. El set se guarda para otras obras.' },
    { id: 'practicos', nombre: 'Efectos prácticos', desde: 1900, costo: 1.04, riesgo: 1.3, dep: { efectos: 2, vestuario: 1 }, texto: 'Maquetas, maquillaje y explosiones de verdad: una semana más de rodaje; desde 2000, +1 a la crítica.' },
    { id: 'cgi', nombre: 'CGI (imagen por computadora)', desde: 1973, costo: 1.08, riesgo: 0.8, dep: { efectos: 3, arte: -1 }, texto: 'Antes de 1993 se nota (−2 al público si los efectos no son excelentes). Abarata con los años.' },
  ];
  // Terrenos para rodar en locación (con su costo, su riesgo y los géneros donde el paisaje luce)
  const TERRENOS = [
    { id: 'ciudad', nombre: 'Ciudad', costo: 0.97, riesgo: 1, generos: ['Crimen', 'Policial', 'Noir', 'Comedia', 'Romance', 'Thriller', 'Superhéroes', 'Social', 'Espionaje'] },
    { id: 'pradera', nombre: 'Pradera', costo: 0.95, riesgo: 0.9, generos: ['Western', 'Romance', 'Melodrama', 'Familiar', 'Histórico'] },
    { id: 'desierto', nombre: 'Desierto', costo: 1.04, riesgo: 1.3, generos: ['Western', 'Bélico', 'Épico', 'Ciencia ficción', 'Aventura', 'Religioso'] },
    { id: 'montana', nombre: 'Montaña', costo: 1.06, riesgo: 1.4, generos: ['Aventura', 'Drama', 'Bélico', 'Deportivo', 'Thriller'] },
    { id: 'bosque', nombre: 'Bosque', costo: 0.98, riesgo: 1.1, generos: ['Terror', 'Fantasía', 'Familiar', 'Folklórico', 'Infantil', 'Monstruos'] },
    { id: 'tropico', nombre: 'Trópico', costo: 1.04, riesgo: 1.3, generos: ['Aventura', 'Acción', 'Romance', 'Monstruos', 'Festivo'] },
    { id: 'artico', nombre: 'Ártico', costo: 1.15, riesgo: 1.8, generos: ['Aventura', 'Terror', 'Catástrofes', 'Ciencia ficción'] },
    { id: 'mar', nombre: 'Mar', costo: 1.1, riesgo: 1.7, generos: ['Aventura', 'Catástrofes', 'Monstruos', 'Bélico', 'Épico'] },
  ];
  // Estilos de producción: ama y rechaza son grupos de edad (0 niños, 1 adolescentes, 2 jóvenes, 3 adultos, 4 mayores)
  const ESTILOS = [
    { id: 'clasico', nombre: 'Clásico de estudio', desde: 1895, costo: 1, crit: 0, pub: 0, ama: [], rechaza: [], texto: 'La forma de siempre.' },
    { id: 'espectaculo', nombre: 'Gran espectáculo', desde: 1915, costo: 1.15, crit: -1, pub: 2, ama: [1, 2], rechaza: [], dep: { efectos: 1, arte: 1 }, texto: 'Más grande en todo: +2 al público, −1 a la crítica.' },
    { id: 'teatral', nombre: 'Teatral', desde: 1895, costo: 0.9, crit: 0, pub: -1, ama: [4], rechaza: [1, 2], dep: { interprete: 1 }, texto: 'Escenas largas y actuación al frente; lo aman los mayores.' },
    { id: 'documental', nombre: 'Estilo documental', desde: 1922, costo: 0.88, crit: 1, pub: -1, ama: [3, 4], rechaza: [0], texto: 'Cámara que observa: +1 a la crítica.' },
    { id: 'plano', nombre: 'Plano secuencia', desde: 1948, costo: 1.05, crit: 2, pub: 0, ama: [2, 3], rechaza: [], min: 70, texto: '+2 a la crítica, una semana más de rodaje; exige un director de 70 o más.' },
    { id: 'contemplativo', nombre: 'Contemplativo', desde: 1950, costo: 0.95, crit: 3, pub: -3, ama: [3, 4], rechaza: [1, 2], texto: '+3 a la crítica, −3 al público; los jóvenes se aburren.' },
    { id: 'independiente', nombre: 'Independiente de bajo costo', desde: 1955, costo: 0.75, crit: 1, pub: -1, ama: [2], rechaza: [], dep: { arte: -2, efectos: -2 }, texto: '25 % más barato; menos arte y efectos.' },
    { id: 'mano', nombre: 'Cámara en mano', desde: 1959, costo: 0.92, crit: 1, pub: 0, ama: [1, 2], rechaza: [4], texto: 'Urgente y cercano: lo aman los jóvenes, no los mayores.' },
    { id: 'videoclip', nombre: 'Videoclip', desde: 1981, costo: 1, crit: -1, pub: 1, ama: [1, 2], rechaza: [3, 4], dep: { musica: 2, edicion: 2 }, texto: 'Montaje rápido y música al frente.' },
    { id: 'found', nombre: 'Metraje encontrado', desde: 1999, costo: 0.5, crit: -1, pub: 0, ama: [1, 2], rechaza: [3, 4], familias: ['SM'], texto: 'La mitad del costo; en suspenso y miedo, +2 al público.' },
    // Grupos de edad: 0 niños, 1 adolescentes, 2 jóvenes, 3 adultos, 4 mayores
    { id: 'estandar', nombre: 'Estándar', desde: 1895, costo: 1, crit: 0, pub: 0, ama: [], rechaza: [], texto: 'Para todo público, sin riesgos.' },
    { id: 'mas16', nombre: '+16', desde: 1968, costo: 1, crit: 0, pub: 1, ama: [1, 2], rechaza: [0], texto: 'Más filo para adolescentes y jóvenes; las familias con niños se alejan.' },
    { id: 'adultos', nombre: 'Adultos', desde: 1968, costo: 1, crit: 1, pub: 0, ama: [3, 4], rechaza: [0, 1], texto: 'Tono maduro: +1 a la crítica, lo aman adultos y mayores.' },
    { id: 'glamour', nombre: 'Glamour', desde: 1925, costo: 1.12, crit: -1, pub: 2, ama: [2, 3], rechaza: [], dep: { vestuario: 2, arte: 1 }, texto: 'Estrellas, vestuario y brillo: +2 al público, −1 a la crítica.' },
    { id: 'caricatura', nombre: 'Caricatura', desde: 1910, costo: 0.95, crit: -1, pub: 1, ama: [0, 1], rechaza: [3, 4], dep: { animacion: 1 }, texto: 'Exagerado y colorido: lo aman niños y adolescentes.' },
    { id: 'anime', nombre: 'Anime', desde: 1960, costo: 0.9, crit: 1, pub: 1, ama: [1, 2], rechaza: [4], dep: { animacion: 2 }, texto: 'Estética japonesa: adolescentes y jóvenes en todo el mundo.' },
    { id: 'virtual', nombre: 'Producción virtual', desde: 2019, costo: 1.05, crit: 0, pub: 1, ama: [1, 2], rechaza: [], dep: { arte: 2, efectos: 2 }, texto: 'Escenarios en pantallas gigantes: una semana menos de posproducción.' },
    // De la Final: tres maneras de filmar con su época
    { id: 'expresionista', nombre: 'Expresionista', desde: 1919, costo: 1.02, crit: 2, pub: -1, ama: [3], rechaza: [0], familias: ['SM', 'AV'], dep: { arte: 2, fotografia: 1 }, texto: 'Luces y sombras torcidas: el miedo se ve en los decorados; +2 a la crítica.' },
    { id: 'neorrealista', nombre: 'Neorrealista', desde: 1945, costo: 0.7, crit: 2, pub: -1, ama: [3, 4], rechaza: [1], familias: ['DR'], dep: { arte: -2 }, texto: 'Calles reales y actores sin fama: la vida tal cual; 30 % más barato y +2 a la crítica.' },
    { id: 'stopmotion', nombre: 'Stop motion', desde: 1900, costo: 1.1, crit: 1, pub: 0, ama: [0, 1], rechaza: [], familias: ['FJ', 'IM'], dep: { arte: 2, animacion: 2 }, texto: 'Figuras movidas cuadro a cuadro: lento, artesanal y encantador.' },
  ];
  // Estudios externos de efectos y animación (cobran una parte del presupuesto de producción)
  const EXTERNOS = {
    efectos: [
      { id: 'local', nombre: 'Taller local de efectos', nivel: 52, costo: 0.03, desde: 1900 },
      { id: 'reconocido', nombre: 'Casa de efectos reconocida', nivel: 66, costo: 0.06, desde: 1933 },
      { id: 'primera', nombre: 'Casa de efectos de primera', nivel: 80, costo: 0.11, desde: 1977 },
    ],
    animacion: [
      { id: 'local', nombre: 'Estudio de animación local', nivel: 52, costo: 0.06, desde: 1908 },
      { id: 'reconocido', nombre: 'Estudio de animación reconocido', nivel: 66, costo: 0.12, desde: 1928 },
      { id: 'primera', nombre: 'Estudio de animación de primera', nivel: 80, costo: 0.2, desde: 1937 },
    ],
  };
  // Incentivos por rodar en el país (devolución de una parte del gasto) desde un año
  const INCENTIVOS = { ca: [1997, 0.16], gb: [2007, 0.2], nz: [2001, 0.15], au: [2007, 0.16], co: [2013, 0.2], es: [2015, 0.15], za: [2004, 0.15], hk: [1990, 0.08], kr: [2010, 0.1], ma: [2000, 0.1], cl: [2018, 0.12], mx: [2007, 0.1] };
  // Países con industria de cine fuerte: su equipo técnico local rinde como el tuyo
  const INDUSTRIA = ['us', 'ca', 'gb', 'fr', 'de', 'it', 'es', 'in', 'jp', 'kr', 'hk', 'cn', 'au', 'nz', 'mx', 'ar', 'br', 'ru', 'eg', 'ng'];
  // Sets que se guardan: el primero que encaja con la obra
  const SETS = [
    { id: 'oeste', nombre: 'Pueblo del oeste', si: function (o) { return o.gen.indexOf('Western') >= 0; } },
    { id: 'nave', nombre: 'Nave espacial', si: function (o) { return o.gen.indexOf('Ciencia ficción') >= 0 && ['cercano', 'lejano'].indexOf(o.epo) >= 0; } },
    { id: 'castillo', nombre: 'Castillo', si: function (o) { return o.epo === 'medieval' || o.gen.indexOf('Fantasía') >= 0; } },
    { id: 'templo', nombre: 'Templo antiguo', si: function (o) { return ['prehistoria', 'civilizaciones', 'imperios', 'cristo'].indexOf(o.epo) >= 0; } },
    { id: 'salon', nombre: 'Salón de época', si: function (o) { return ['renacimiento', 'revoluciones', 'xix'].indexOf(o.epo) >= 0; } },
    { id: 'trinchera', nombre: 'Campo de batalla', si: function (o) { return o.gen.indexOf('Bélico') >= 0 || o.epo === 'guerras'; } },
    { id: 'mansion', nombre: 'Casona embrujada', si: function (o) { return o.gen.indexOf('Terror') >= 0 || o.gen.indexOf('Monstruos') >= 0; } },
    { id: 'callejon', nombre: 'Callejón y comisaría', si: function (o) { return ['Crimen', 'Policial', 'Noir', 'Thriller', 'Misterio'].some(function (g) { return o.gen.indexOf(g) >= 0; }); } },
    { id: 'escenario', nombre: 'Gran escenario', si: function (o) { return o.gen.indexOf('Musical') >= 0 || o.gen.indexOf('Festivo') >= 0 || o.gen.indexOf('Artes') >= 0; } },
    { id: 'tribunal', nombre: 'Sala de tribunal', si: function (o) { return o.gen.indexOf('Judicial') >= 0 || o.gen.indexOf('Político') >= 0; } },
    { id: 'escuela', nombre: 'Casa y escuela', si: function (o) { return ['Familiar', 'Infantil', 'Adolescentes'].some(function (g) { return o.gen.indexOf(g) >= 0; }); } },
    { id: 'futurista', nombre: 'Ciudad futurista', si: function (o) { return ['cercano', 'lejano'].indexOf(o.epo) >= 0; } },
    { id: 'ciudad', nombre: 'Calles y departamentos', si: function () { return true; } },
  ];
  const LETRAS = [[88, 'A+'], [78, 'A'], [68, 'B'], [58, 'C'], [48, 'D'], [38, 'E'], [0, 'F']];

  // ---------- Dilemas (decides tú) e incidentes (simplemente pasan) ----------
  // Efectos de cada opción: costo (parte del presupuesto de producción), sem (semanas en la etapa actual),
  // q (calidad), crit y pub (notas), des (expectativa del estreno), mo (moral de quien se nombra), rel (relación).
  const DILEMAS = [
    { id: 'reescribir', etapa: 'rodaje', quien: ['a'], txt: '{a} quiere reescribir su papel.', ops: [
      { t: 'Aceptar sus cambios', q: -1, mo: { a: 10 } },
      { t: 'Negarse', mo: { a: -12 }, rel: ['a', 'g', -15] },
      { t: 'Que lo trabaje con quien escribió el guion (una semana)', sem: 1, costo: 0.01, q: 1, def: 1 }] },
    { id: 'escenaClave', etapa: 'rodaje', quien: ['d'], txt: '{d} pide dos semanas más para una escena clave.', ops: [
      { t: 'Dar las dos semanas', sem: 2, costo: 0.03, q: 2, mo: { d: 5 } },
      { t: 'Filmar con lo que hay', q: -1, mo: { d: -10 }, def: 1 }] },
    { id: 'tormenta', etapa: 'rodaje', quien: [], cond: function (o) { return o.met === 'locacion' || o.met === 'mixto' || !o.met; }, txt: 'Una tormenta golpea la locación.', ops: [
      { t: 'Esperar a que pase', sem: 1, costo: 0.01, def: 1 },
      { t: 'Filmar igual', azar: 0.6, bien: { q: 1 }, mal: { q: -2, sem: 1, txt: 'Hubo un accidente: una semana perdida.' } },
      { t: 'Llevar la escena al set', costo: 0.03 }] },
    { id: 'romance', etapa: 'rodaje', quien: ['a', 'b'], cond: function (o, n) { return n.a && n.b && n.a.sx !== n.b.sx && N.anio() - n.a.nac >= 18 && N.anio() - n.b.nac >= 18; }, txt: 'Hay romance en el set entre {a} y {b}.', ops: [
      { t: 'Usarlo en la promoción', des: 4, azar: 0.7, bien: {}, mal: { pub: -2, txt: 'La prensa lo convirtió en escándalo.' }, rel: ['a', 'b', 20] },
      { t: 'Mantenerlo en secreto', rel: ['a', 'b', 25], def: 1 }] },
    { id: 'filtracion', etapa: 'posproduccion', quien: [], txt: 'Se filtra el final de la película.', ops: [
      { t: 'Regrabar el final', sem: 1, costo: 0.02 },
      { t: 'Ignorarlo', pub: -1, def: 1 },
      { t: 'Convertirlo en campaña', des: 3, crit: -1 }] },
    { id: 'pelea', etapa: 'rodaje', quien: ['d', 'p'], txt: '{d} y {p} chocan por el presupuesto.', ops: [
      { t: 'Apoyar la dirección', costo: 0.03, q: 1, mo: { p: -10 } },
      { t: 'Apoyar la producción', q: -1, mo: { d: -10 } },
      { t: 'Mediar (una semana)', sem: 1, rel: ['d', 'p', 10], def: 1 }] },
    { id: 'enfermo', etapa: 'rodaje', quien: ['a'], txt: '{a} se enferma en pleno rodaje.', ops: [
      { t: 'Esperar a que se recupere', sem: 2, costo: 0.01, def: 1 },
      { t: 'Filmar a su alrededor', q: -2 },
      { t: 'Usar un doble', q: -1, costo: 0.01 }] },
    { id: 'locacionUnica', etapa: 'preproduccion', quien: [], txt: 'Aparece una locación espectacular para la escena final.', ops: [
      { t: 'Pagarla', costo: 0.03, crit: 1, pub: 1 },
      { t: 'Seguir con el plan', def: 1 }] },
    { id: 'efectosAtrasados', etapa: 'posproduccion', quien: [], cond: function (o) { return ART.ideas.nivelEfectos(o) >= 2; }, txt: 'El equipo de efectos va atrasado.', ops: [
      { t: 'Contratar ayuda externa', costo: 0.04 },
      { t: 'Recortar efectos', pub: -1, crit: -1, def: 1 },
      { t: 'Esperar dos semanas', sem: 2, costo: 0.01, q: 1 }] },
    { id: 'visita', etapa: 'rodaje', quien: [], txt: 'Una estrella visita el set y ofrece un cameo gratis.', ops: [
      { t: 'Aceptar el cameo', des: 3, pub: 1 },
      { t: 'Mejor no: distrae al elenco', def: 1 }] },
    { id: 'censura', etapa: 'posproduccion', quien: [], cond: function (o) { return X.ORDEN_CLAS.indexOf(o.clas) >= 3; }, txt: 'Los censores de algunas regiones piden cortar escenas.', ops: [
      { t: 'Cortarlas', crit: -1, def: 1 },
      { t: 'Negociar (dos semanas)', sem: 2, costo: 0.01 }] },
    { id: 'improvisa', etapa: 'rodaje', quien: ['a'], txt: '{a} improvisa una escena que no está en el guion.', ops: [
      { t: 'Dejarla en la película', azar: 0.55, bien: { q: 2 }, mal: { q: -1 } },
      { t: 'Filmar lo escrito', def: 1 }] },
    // De la Final
    { id: 'efectoBarato', etapa: 'posproduccion', quien: [], txt: 'Un efecto clave se ve barato.', ops: [
      { t: 'Rehacerlo', costo: 0.05, q: 1 },
      { t: 'Dejarlo así', q: -1, def: 1 }] },
    { id: 'marca', etapa: 'rodaje', quien: [], txt: 'Una marca quiere aparecer en pantalla y paga por ello.', ops: [
      { t: 'Aceptar (paga el 3 % del rodaje; la crítica lo nota)', costo: -0.03, q: -1 },
      { t: 'Rechazar', def: 1 }] },
    { id: 'rivalidad', etapa: 'rodaje', quien: ['a', 'b'], cond: function (o, n) { return n.a && n.b; }, txt: '{a} y {b} no se soportan.', ops: [
      { t: 'Separar sus escenas', costo: 0.02, def: 1 },
      { t: 'Que lo resuelvan solos', azar: 0.5, bien: { q: 2, txt: 'La tensión dio una gran escena.' }, mal: { q: -1, sem: 1, txt: 'La pelea retrasó el rodaje.' } }] },
    { id: 'tercerActo', etapa: 'preproduccion', quien: [], txt: 'El guion tiene un hueco en el tercer acto.', ops: [
      { t: 'Contratar un guionista de apoyo', costo: 0.02, q: 1 },
      { t: 'Seguir así', q: -1, def: 1 }] },
    { id: 'fotos', etapa: 'rodaje', quien: [], txt: 'Se filtran fotos del rodaje.', ops: [
      { t: 'Aprovecharlas en redes', q: 0, def: 1 },
      { t: 'Pedir que las borren', costo: 0.01 }] },
  ];
  const INCIDENTES = [
    { id: 'lluvia', txt: 'La lluvia arruina varios días de rodaje: una semana más.', sem: 1, costo: 0.005, cond: function (o) { return o.met !== 'set' && o.met !== 'cgi'; } },
    { id: 'camara', txt: 'Se daña equipo de cámara: una semana perdida.', sem: 1, costo: 0.005 },
    { id: 'accidente', txt: 'Un accidente leve en el set detiene todo unos días.', sem: 1, costo: 0.015, moral: -4 },
    { id: 'incendio', txt: 'Un incendio en el set obliga a reconstruir una parte.', costo: 0.04, sem: 1, cond: function (o) { return o.met === 'set' || o.met === 'mixto' || !o.met; } },
    { id: 'huelga', txt: 'Huelga del equipo técnico: dos semanas perdidas.', sem: 2, costo: 0.01, cond: function () { return N.anio() >= 1933; } },
    { id: 'racha', txt: 'Todo sale mejor de lo pensado: terminan una semana antes.', sem: -1 },
    { id: 'magia', txt: 'El elenco tiene una química especial: las escenas brillan.', q: 1 },
    // De la Final
    { id: 'toma', txt: 'Una toma improvisada sale genial.', q: 1 },
    { id: 'redes', txt: 'Un extra se vuelve famoso en redes y crece la expectativa.', q: 1, cond: function () { return N.anio() >= 2006; } },
    { id: 'luz', txt: 'Un corte de luz en el set obliga a repetir el día.', costo: 0.01 },
    { id: 'lluviaLeve', txt: 'Lluvia inesperada: hay que alquilar carpas.', costo: 0.02, cond: function (o) { return o.met !== 'set' && o.met !== 'cgi'; } },
  ];
  const OPCIONES_PRUEBA = [
    { id: 'estrenar', t: 'Estrenar así', texto: 'Sin cambios.' },
    { id: 'pulir', t: 'Pulir dos semanas', texto: '+1 al público y a la crítica (más con un buen editor); cuesta 2 semanas.', sem: 2, costo: 0.015 },
    { id: 'reeditar', t: 'Reeditar', texto: 'Un nuevo montaje: de −1 a +4 al público según el editor; 2 semanas.', sem: 2, costo: 0.025 },
    { id: 'regrabar', t: 'Regrabar escenas', texto: 'Vuelve el elenco: de +2 a +6 al público según dirección y reparto; 4 semanas y un 8 % más.', sem: 4, costo: 0.08 },
    { id: 'apurar', t: 'Estreno apurado', texto: 'Una semana menos (y su costo): −1 al público y a la crítica.', sem: -1 },
  ];

  // =====================================================================
  // REGLAS
  // =====================================================================
  function anio() { return N.anio(); }
  function porId(lista, id) { return lista.filter(function (x) { return x.id === id; })[0]; }
  function metodo(id) { return porId(METODOS, id) || METODOS[0]; }
  function terreno(id) { return porId(TERRENOS, id) || TERRENOS[0]; }
  function estilo(id) { return porId(ESTILOS, id) || ESTILOS[0]; }
  function externo(r, id) { return EXTERNOS[r] ? porId(EXTERNOS[r], id) : null; }
  function letra(v) { for (let i = 0; i < LETRAS.length; i++) if (v >= LETRAS[i][0]) return LETRAS[i][1]; return 'F'; }
  function fam(o) { return o.fam || D.familiaDe[o.gen[0]] || 'DR'; }
  function animada(o) { return o.tipo === 'animacion' || o.tipo === 'hibrido'; }

  // ---------- Roles nuevos: quién los necesita ----------
  // Vestuario siempre ayuda; efectos cuando hay efectos de verdad (entonces se pueden encargar a un estudio
  // externo); animación en las obras animadas. Del vestuario y los efectos se encarga el diseñador de arte.
  function necesita(o, r) {
    if (r === 'vestuario') return o.tipo !== 'animacion' && o.tipo !== 'documental';
    if (r === 'efectos') return ART.ideas.nivelEfectos(o) >= 3 || o.met === 'cgi' || o.met === 'practicos' || o.pst === 'espectaculo' || o.pst === 'virtual';
    if (r === 'animacion') return animada(o);
    return true;
  }
  function esExterno(o, r) { return !!(o.ext && o.ext[r] && externo(r, o.ext[r])); }
  function nivelExterno(o, r) {
    const e = externo(r, o.ext[r]);
    // Los estudios externos mejoran con los años (técnica y herramientas)
    return e ? e.nivel + N.limitar((anio() - e.desde) / 25, 0, 6) : 35;
  }
  function externosDisponibles(r, a) { return (EXTERNOS[r] || []).filter(function (e) { return e.desde <= a; }); }

  // ---------- Pesos de los departamentos en la calidad ----------
  // Recibe el reparto de los 8 departamentos clásicos (ya normalizado) y suma vestuario, efectos y animación
  function pesosDep(o, r) {
    const p = Object.assign({}, r);
    const f = fam(o);
    const quitar = function (k, x) { const v = Math.min(p[k] || 0, x); p[k] = (p[k] || 0) - v; return v; };
    // Vestuario: más en las épocas pasadas o futuras
    if (o.tipo !== 'documental') {
      let wv = PESO_VESTUARIO[f] * (o.epo && o.epo !== 'actualidad' ? 1.6 : 1) * (o.tipo === 'animacion' ? 0.3 : 1);
      p.vestuario = quitar('arte', wv / 2) + quitar('interprete', wv / 2);
    }
    // Efectos: una parte del arte, según cuántos efectos lleve y cómo se filme
    let pe = PARTE_EFECTOS[N.limitar(ART.ideas.nivelEfectos(o), 0, 4)] * (o.met === 'cgi' || o.met === 'practicos' ? 1.3 : 1);
    p.efectos = quitar('arte', (p.arte || 0) * Math.min(0.7, pe));
    // Animación: reemplaza parte de la actuación y la imagen
    if (o.tipo === 'animacion') p.animacion = quitar('interprete', (p.interprete || 0) * 0.55) + quitar('fotografia', (p.fotografia || 0) * 0.6) + quitar('arte', (p.arte || 0) * 0.3);
    else if (o.tipo === 'hibrido') p.animacion = quitar('interprete', (p.interprete || 0) * 0.2) + quitar('fotografia', (p.fotografia || 0) * 0.2) + quitar('arte', (p.arte || 0) * 0.25);
    let s = 0;
    Object.keys(p).forEach(function (k) { s += p[k]; });
    Object.keys(p).forEach(function (k) { p[k] = p[k] / s; });
    return p;
  }
  // Habilidad del departamento cuando no hay talento propio: estudio externo o el diseñador de arte
  function habilidadSinTalento(o, dep, habArte) {
    if (esExterno(o, dep)) return nivelExterno(o, dep);
    if (dep === 'vestuario' || dep === 'efectos') return habArte;
    if (dep === 'animacion') return 25;
    return 35;
  }

  // ---------- Reparto del presupuesto ----------
  function depsDe(o) {
    return DEPS.filter(function (d) { return d.id !== 'animacion' || animada(o); }).map(function (d) { return d.id; });
  }
  function ideal(o) {
    const base = IDEAL[fam(o)] || IDEAL.DR;
    const r = {};
    depsDe(o).forEach(function (k) { r[k] = base[k] || 0; });
    const fx = ART.ideas.nivelEfectos(o);
    r.efectos *= [0.2, 0.5, 1, 1.7, 2.4][N.limitar(fx, 0, 4)];
    if (o.epo && o.epo !== 'actualidad') { r.vestuario *= 1.6; r.arte *= 1.25; }
    if (o.tipo === 'animacion') { r.animacion = 0.45; r.fotografia *= 0.4; r.vestuario *= 0.3; r.produccion *= 0.5; }
    else if (o.tipo === 'hibrido') r.animacion = 0.2;
    if (o.tipo === 'documental') { r.arte *= 0.5; r.efectos *= 0.3; r.edicion *= 1.5; }
    if (o.met === 'cgi') { r.efectos *= 1.4; r.arte *= 0.8; }
    if (o.met === 'locacion') { r.produccion *= 1.2; r.arte *= 0.8; }
    if (o.met === 'set') r.arte *= 1.2;
    if (o.met === 'practicos') r.efectos *= 1.2;
    let s = 0;
    Object.keys(r).forEach(function (k) { s += r[k]; });
    Object.keys(r).forEach(function (k) { r[k] = N.redondear(r[k] / s, 4); });
    return r;
  }
  // El reparto que eligió el jugador (normalizado); si no lo tocó, el ideal
  function reparto(o) {
    const id = ideal(o);
    if (!o.rep) return id;
    const r = {};
    let s = 0;
    Object.keys(id).forEach(function (k) { r[k] = Math.max(0, o.rep[k] !== undefined ? o.rep[k] : id[k]); s += r[k]; });
    Object.keys(r).forEach(function (k) { r[k] = s > 0 ? r[k] / s : id[k]; });
    return r;
  }
  function efectoReparto(o, dep) {
    if (!o.rep) return 0;
    const id = ideal(o), r = reparto(o);
    if (id[dep] === undefined || id[dep] < 0.005) return 0;
    return N.limitar(5 * Math.log2(Math.max(0.05, r[dep]) / id[dep]), -10, 3);
  }

  // ---------- Bonos por departamento (método, estilo, set, terreno, país) ----------
  function setDe(o) {
    const est = N.S && N.S.estudios[o.est || 0];
    return o.setR && est && est.sets ? est.sets.filter(function (s) { return s.id === o.setR; })[0] : null;
  }
  function bonoDep(o, dep) {
    let b = efectoReparto(o, dep);
    const m = metodo(o.met);
    if (m.dep && m.dep[dep]) b += m.dep[dep];
    const es = estilo(o.pst);
    if (es.dep && es.dep[dep]) b += es.dep[dep];
    if (dep === 'direccion' && es.min) {
      const d = ART.talentos.porId(o.eq && o.eq.direccion);
      if (!d || d.hab < es.min) b -= 4;
    }
    if (dep === 'efectos' && o.met === 'cgi' && (o.anioPlan || anio()) < 1993) b -= 3;
    if (dep === 'arte') {
      const s = setDe(o);
      if (s) b += N.limitar((s.q - 60) / 8, -3, 3);
    }
    if (dep === 'fotografia' && usaLocacion(o) && terrenoPropio(o)) b += 1;
    if ((dep === 'produccion' || dep === 'fotografia') && o.rod && INDUSTRIA.indexOf(o.rod) < 0) b -= dep === 'produccion' ? 2 : 1;
    return b;
  }
  function usaLocacion(o) { return o.met === 'locacion' || o.met === 'mixto' || !o.met; }
  function usaSet(o) { return (o.met === 'set' || o.met === 'mixto' || !o.met) && o.tipo !== 'animacion' && o.tipo !== 'documental'; }
  function terrenoPropio(o) {
    const est = N.S && N.S.estudios[o.est || 0];
    if (!est || !est.terrenos || !o.ter) return false;
    return est.terrenos.some(function (id) { const t = D.terrenos.filter(function (x) { return x.id === id; })[0]; return t && t.terreno === o.ter; });
  }

  // ---------- Costo y semanas ----------
  function costoCGI(a) { return a < 1993 ? 1.25 : a < 2006 ? 1.12 : a < 2020 ? 1 : 0.95; }
  function incentivo(o, a) {
    const i = o.rod && INCENTIVOS[o.rod];
    return i && a >= i[0] ? i[1] : 0;
  }
  function viaje(o) {
    if (!o.rod) return false;
    const est = N.S && N.S.estudios[o.est || 0];
    const p = D.pais(o.rod), casa = est ? D.pais(est.pais) : null;
    return !!(p && casa && p.region !== casa.region);
  }
  function factorCosto(o, a) {
    let f = 1;
    const m = metodo(o.met);
    f *= o.met === 'cgi' ? m.costo * costoCGI(a) : m.costo;
    if (usaLocacion(o) && o.ter) {
      const tr = terreno(o.ter);
      let x = o.met === 'locacion' ? tr.costo : 1 + (tr.costo - 1) / 2;
      if (terrenoPropio(o)) x *= o.met === 'locacion' ? 0.9 : 0.95;
      f *= x;
    }
    f *= estilo(o.pst).costo;
    if (usaSet(o) && o.met) f *= setDe(o) ? 0.93 : 1; // reusar un set guardado ahorra
    if (viaje(o)) f *= 1.03;
    f *= 1 - incentivo(o, a);
    ['efectos', 'animacion'].forEach(function (r) { if (esExterno(o, r) && necesita(o, r)) f *= 1 + externo(r, o.ext[r]).costo; });
    return f;
  }
  function ajusteSemanas(o) {
    const r = { pre: 0, rodaje: 0, pos: 0 };
    if (usaSet(o) && o.met) { if (setDe(o)) r.pre -= 1; else if (o.met === 'set') r.pre += 1; }
    if (viaje(o)) r.pre += 1;
    if (o.pst === 'plano') r.rodaje += 1;
    if (o.met === 'practicos') r.rodaje += 1;
    if (o.met === 'locacion' && terrenoPropio(o)) r.rodaje -= 1;
    if (o.met === 'locacion' && (o.ter === 'artico' || o.ter === 'mar')) r.rodaje += 1;
    if (o.met === 'cgi') r.pos += 1;
    if (o.pst === 'virtual') r.pos -= 1;
    return r;
  }

  // ---------- Crítica, público y edades ----------
  function ajusteNotas(o, a) {
    let crit = 0, pub = 0;
    const es = estilo(o.pst);
    crit += es.crit; pub += es.pub;
    if (es.familias) pub += es.familias.indexOf(fam(o)) >= 0 ? 2 : -1;
    const f = fam(o);
    if (o.met === 'locacion' && (f === 'DR' || f === 'AV' || o.nat === 'r')) crit += 1;
    if (o.met === 'practicos' && a >= 2000) crit += 1;
    if (o.met === 'cgi' && a < 1993) pub -= 2;
    if (o.met === 'cgi' && a >= 2015 && ART.ideas.nivelEfectos(o) >= 3) crit -= 1;
    if (usaLocacion(o) && o.ter && terreno(o.ter).generos.some(function (g) { return o.gen.indexOf(g) >= 0; })) pub += 1;
    const s = setDe(o);
    if (s && s.usos >= 3) pub -= 1; // el público ya reconoce el set
    return { crit: crit, pub: pub };
  }
  function edades(o) {
    const es = estilo(o.pst);
    if (!es.ama.length && !es.rechaza.length) return null;
    const r = [1, 1, 1, 1, 1];
    es.ama.forEach(function (i) { r[i] *= 1.08; });
    es.rechaza.forEach(function (i) { r[i] *= 0.9; });
    return r;
  }

  // ---------- Notas de los departamentos ----------
  function notas(o, bonos) {
    const famObj = D.familia(fam(o));
    const p = ART.ideas.pesos(o, famObj);
    const b = bonos || (ART.negocio ? ART.negocio.bonos(o.est || 0, fam(o)) : {});
    return Object.keys(p).filter(function (k) { return p[k] >= 0.01; }).sort(function (x, y) { return p[y] - p[x]; }).map(function (k) {
      const v = Math.round(ART.economia.habilidadDep(o, k, ART.talentos.porId, b));
      return { dep: k, nombre: nombreDep(k), peso: p[k], v: v, letra: letra(v) };
    });
  }
  function nombreDep(k) {
    if (k === 'interprete') return 'Actuación';
    if (k === 'guion') return 'Guion';
    if (k === 'direccion') return 'Dirección';
    if (k === 'produccion') return 'Producción';
    const d = porId(DEPS, k);
    return d ? d.nombre : D.oficio(k).dep;
  }

  // ---------- Recomendaciones ----------
  function metodoRecomendado(o, a) {
    const f = fam(o), fx = ART.ideas.nivelEfectos(o), anio = a || N.anio();
    let m = 'mixto';
    if (o.tipo === 'animacion') m = 'set';
    else if ((f === 'AA' || f === 'IM') && fx >= 3) m = anio >= 1995 ? 'cgi' : 'practicos';
    else if (f === 'DR' || f === 'AV' || f === 'RD' || o.nat === 'r') m = 'locacion';
    else if (f === 'SM' || f === 'HM' || f === 'FJ') m = 'set';
    const x = METODOS.filter(function (y) { return y.id === m; })[0];
    return x && x.desde > anio ? 'mixto' : m; // antes de 1900 no hay sets ni efectos prácticos
  }
  function terrenoRecomendado(o) {
    const t = TERRENOS.filter(function (x) { return x.generos.some(function (g) { return o.gen.indexOf(g) >= 0; }); })[0];
    return t ? t.id : 'ciudad';
  }
  function metodosDisponibles(a) { return METODOS.filter(function (m) { return m.desde <= a; }); }
  function estilosDisponibles(a) { return ESTILOS.filter(function (e) { return e.desde <= a; }); }

  // ---------- Sets reutilizables ----------
  function tipoSet(o) { return SETS.filter(function (s) { return s.si(o); })[0]; }
  function setsQueSirven(o) {
    const est = N.S.estudios[o.est || 0];
    const tp = tipoSet(o);
    return (est.sets || []).filter(function (s) { return s.tipo === tp.id; }).sort(function (a, b) { return b.q - a.q; });
  }
  function capacidadSets(estId) {
    const est = N.S.estudios[estId || 0];
    if (estId) return 2 + Math.round(2 * (est.tam || 1)); // los rivales ya tienen sus backlots
    const c = function (id) { return est.pisos.concat(est.terrenos).filter(function (x) { return x === id; }).length; };
    return 1 + c('plato') + 3 * c('backlot');
  }
  // Al quedar lista la obra: el set nuevo se guarda (con la nota del arte) y el reutilizado se gasta un poco
  function guardarSet(o) {
    if (!usaSet(o) || !o.met) return;
    const est = N.S.estudios[o.est || 0];
    est.sets = est.sets || [];
    const usado = setDe(o);
    if (usado) { usado.usos++; usado.q = Math.max(30, usado.q - 2); usado.ult = anio(); return; }
    const tp = tipoSet(o);
    const arte = notas(o).filter(function (n) { return n.dep === 'arte'; })[0];
    est.sets.push({ id: N.sigId(), tipo: tp.id, nombre: tp.nombre, q: arte ? arte.v : 55, anio: anio(), usos: 0, obra: o.tit });
    while (est.sets.length > capacidadSets(o.est || 0)) {
      const viejo = est.sets.slice().sort(function (a, b) { return (a.q - (anio() - a.anio)) - (b.q - (anio() - b.anio)); })[0];
      est.sets = est.sets.filter(function (s) { return s !== viejo; });
      if (!o.est) N.emit('noticia', { tipo: 'estudio', texto: 'Desarmas el set «' + viejo.nombre + '» (de «' + viejo.obra + '») para hacer lugar.' });
    }
  }

  // =====================================================================
  // ETAPAS VIVAS: incidentes, dilemas, prueba de público y línea de producción
  // =====================================================================
  // Personas que pueden aparecer en un dilema
  function personas(o) {
    const T = ART.talentos;
    return { a: T.porId(o.eq.int && o.eq.int[0]), b: T.porId(o.eq.int && o.eq.int[1]), d: T.porId(o.eq.direccion), p: T.porId(o.eq.produccion), g: T.porId(o.eq.guion) };
  }
  function riesgo(o) {
    let r = metodo(o.met).riesgo;
    if (usaLocacion(o) && o.ter) r *= o.met === 'locacion' ? terreno(o.ter).riesgo : 1 + (terreno(o.ter).riesgo - 1) / 2;
    if (terrenoPropio(o)) r *= 0.7;
    const p = ART.talentos.porId(o.eq.produccion);
    if (p) r *= N.limitar(1 - (p.hab - 50) / 200, 0.7, 1.25);
    ART.obras.idsEquipo(o).forEach(function (id) { const t = ART.talentos.porId(id); if (t && (t.rasgo === 'Diva' || t.rasgo === 'Temperamental')) r *= 1.12; });
    return r;
  }
  function registrar(o, txt, costo, sem) {
    o.lp = o.lp || {};
    o.lp.ev = o.lp.ev || [];
    o.lp.ev.push({ t: N.S.t, txt: txt, c: Math.round(costo || 0), s: sem || 0 });
    if (o.lp.ev.length > 10) o.lp.ev.shift();
  }
  // Aplica los efectos de un incidente o de una opción
  function aplicar(o, ef, ctx, n, txt) {
    const T = ART.talentos;
    let costo = 0;
    // Costo negativo: entra dinero (una marca que paga por aparecer en pantalla)
    if (ef.costo < 0) ART.negocio.cobrarEn(o.est, 'merchandising', Math.round(o.pp * -ef.costo));
    if (ef.costo > 0) {
      costo = Math.max(0, Math.round(o.pp * ef.costo));
      if (costo > 0) ctx.pagar(o.est, 'produccion', costo);
      o.lp = o.lp || {};
      o.lp.x = (o.lp.x || 0) + costo;
      o.gp = (o.gp || 0) + costo;
    }
    // Las semanas se miden como las de la época (las primeras películas se hacían en pocas semanas)
    const sem = ef.sem ? (ef.sem > 0 ? Math.max(1, Math.round(ef.sem * escalaSemanas())) : Math.min(-1, Math.round(ef.sem * escalaSemanas()))) : 0;
    if (sem) { o.sr = Math.max(1, o.sr + sem); o.dur[o.et] = Math.max(1, (o.dur[o.et] || 0) + sem); }
    if (ef.q) o.dq = (o.dq || 0) + ef.q;
    if (ef.crit) o.dcrit = (o.dcrit || 0) + ef.crit;
    if (ef.pub) o.dpub = (o.dpub || 0) + ef.pub;
    if (ef.des) o.ddes = (o.ddes || 0) + ef.des;
    if (ef.mo && n) Object.keys(ef.mo).forEach(function (k) { if (n[k]) T.cambiarMoral(n[k], ef.mo[k]); });
    if (ef.moral) (o.eq.int || []).forEach(function (id) { const t = T.porId(id); if (t) T.cambiarMoral(t, ef.moral); });
    if (ef.rel && n && n[ef.rel[0]] && n[ef.rel[1]]) T.cambiarRelacion(n[ef.rel[0]], n[ef.rel[1]], ef.rel[2]);
    if (txt) registrar(o, txt, costo, sem);
  }
  function escalaSemanas() { return N.interp([[1895, 0.4], [1910, 0.55], [1925, 1]], anio()); }
  // Costo de una semana de producción: las del plan cuestan lo acordado; las extra (por incidentes, dilemas o
  // pulido) cuestan menos, porque solo trabaja una parte del equipo
  const PARTE_SEMANA_EXTRA = 0.45;
  function costoSemana(o) {
    const base = o.pp * (o.sobre || 1) / o.semProd;
    o.pag = (o.pag || 0) + 1;
    return o.pag <= o.semProd ? base : base * PARTE_SEMANA_EXTRA;
  }
  function texto(plantilla, n) {
    return plantilla.replace(/\{(\w)\}/g, function (_, k) { return n && n[k] ? n[k].nom : 'alguien del equipo'; });
  }
  // Cada semana de producción: puede pasar algo (incidente) o surgir un dilema que decides tú
  function semanaObra(o, ctx) {
    if (o.dil || (o.prueba && !o.prueba.ok)) return;
    const et = o.et;
    if (et !== 'preproduccion' && et !== 'rodaje' && et !== 'posproduccion') return;
    const base = et === 'rodaje' ? 0.03 : 0.012;
    const p = base * riesgo(o) * (o.est === 0 ? 1 : 0.6);
    if (!N.probabilidad(p)) return;
    const n = personas(o);
    const dil = DILEMAS.filter(function (d) {
      return d.etapa === et && d.quien.every(function (k) { return n[k]; }) && (!d.cond || d.cond(o, n)) && !(o.lp && o.lp.dv && o.lp.dv.indexOf(d.id) >= 0);
    });
    // Un dilema para el jugador (si hay uno que encaje) o un incidente para todos
    if (dil.length && N.probabilidad(0.6)) {
      const d = N.elegir(dil);
      // Los rivales también tienen dilemas: deciden al momento, casi siempre lo que más les conviene
      if (o.est !== 0) {
        o.dil = { id: d.id, t: N.S.t, n: {} };
        d.quien.forEach(function (k) { o.dil.n[k] = n[k].id; });
        decidir(o, N.probabilidad(0.65) ? mejorOpcion(o) : N.entero(0, d.ops.length - 1), ctx);
        return;
      }
      o.dil = { id: d.id, t: N.S.t, n: {} };
      d.quien.forEach(function (k) { o.dil.n[k] = n[k].id; });
      o.lp = o.lp || {};
      o.lp.dv = (o.lp.dv || []).concat([d.id]);
      N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '»: ' + texto(d.txt, n) + ' Tienes que decidir.', importante: true });
      return;
    }
    const inc = INCIDENTES.filter(function (x) { return !x.cond || x.cond(o); });
    const x = N.elegir(inc);
    aplicar(o, x, ctx, n, x.txt);
    if (o.est === 0) N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '»: ' + x.txt });
  }
  function dilemaDe(o) {
    if (!o.dil) return null;
    const d = porId(DILEMAS, o.dil.id);
    if (!d) return null;
    const T = ART.talentos, n = {};
    Object.keys(o.dil.n || {}).forEach(function (k) { n[k] = T.porId(o.dil.n[k]); });
    return { d: d, n: n, txt: texto(d.txt, n), ops: d.ops.map(function (op, i) { return { i: i, t: texto(op.t, n), op: op }; }) };
  }
  // Decide un dilema (la opción por índice); el azar de las opciones arriesgadas sale de la simulación
  function decidir(o, i, ctx) {
    const x = dilemaDe(o);
    if (!x) return 'No hay nada que decidir.';
    const op = x.d.ops[i] || x.d.ops.filter(function (q) { return q.def; })[0] || x.d.ops[0];
    let ef = op, extra = '';
    if (op.azar !== undefined) {
      const bien = N.probabilidad(op.azar);
      ef = Object.assign({}, op, bien ? op.bien : op.mal);
      if (!bien && op.mal && op.mal.txt) extra = ' ' + op.mal.txt;
      if (bien) extra = ' Salió bien.';
    }
    o.dil = null;
    aplicar(o, ef, ctx, x.n, x.txt + ' → ' + texto(op.t, x.n) + '.' + extra);
    return '';
  }
  // Sin respuesta en 2 semanas, el equipo hace lo más prudente
  function vencido(o) { return !!(o.dil && N.S.t - o.dil.t >= 2); }

  // ---------- Prueba de público ----------
  // Dos semanas antes de terminar la posproducción se proyecta a un público de prueba. Las notas se fijan ahí
  // y el puntaje es una lectura con ruido de lo que pensará el público.
  function comentarios(o) {
    const ns = notas(o);
    const out = [];
    const peor = ns.slice().sort(function (a, b) { return a.v - b.v; })[0], mejor = ns.slice().sort(function (a, b) { return b.v - a.v; })[0];
    const frases = {
      interprete: ['Les encantó el elenco.', 'Las actuaciones no convencen.'], guion: ['La historia atrapa.', 'La historia se pierde a la mitad.'],
      direccion: ['Se nota una mano firme detrás de cámara.', 'Le falta rumbo.'], edicion: ['El ritmo no da respiro.', 'El ritmo decae a la mitad.'],
      musica: ['La música emociona.', 'La música no acompaña.'], fotografia: ['Las imágenes son hermosas.', 'Se ve pobre.'],
      arte: ['Los sets impresionan.', 'Los sets parecen de cartón.'], efectos: ['Los efectos sorprenden.', 'Los efectos no convencen.'],
      vestuario: ['El vestuario es un personaje más.', 'El vestuario distrae.'], animacion: ['La animación es una maravilla.', 'La animación se ve torpe.'],
      produccion: ['Todo luce cuidado.', 'Se notan los apuros de la producción.'],
    };
    if (mejor && frases[mejor.dep] && mejor.v >= 62) out.push(frases[mejor.dep][0]);
    if (peor && frases[peor.dep] && peor.v < 58 && peor !== mejor) out.push(frases[peor.dep][1]);
    if (!out.length) out.push('El público sale conversando, sin entusiasmo ni enojo.');
    return out;
  }
  function hacerPrueba(o) {
    o.prueba = { p: Math.round(N.limitar(o.pub + N.normal(0, 4), 1, 99)), com: comentarios(o), t: N.S.t };
    if (o.est === 0) N.emit('noticia', { tipo: 'estudio', texto: 'Prueba de público de «' + o.tit + '»: ' + o.prueba.p + ' de 100. ' + o.prueba.com.join(' '), importante: true });
  }
  function opcionesPrueba(o) {
    const T = ART.talentos;
    return OPCIONES_PRUEBA.map(function (op) {
      let no = '';
      if (op.id === 'regrabar') {
        const elenco = (o.eq.int || []).slice(0, 2).map(T.porId);
        if (elenco.some(function (t) { return !t || t.mu || t.ret; })) no = 'Alguien del elenco principal ya no está disponible.';
      }
      if (op.id === 'apurar' && o.sr <= 1) no = 'Ya no se puede apurar más.';
      return Object.assign({ no: no }, op);
    });
  }
  function decidirPrueba(o, id, ctx) {
    if (!o.prueba || o.prueba.ok) return 'No hay prueba pendiente.';
    const op = opcionesPrueba(o).filter(function (x) { return x.id === id; })[0] || OPCIONES_PRUEBA[0];
    if (op.no) return op.no;
    const T = ART.talentos, nota = function (dep) { const n = notas(o).filter(function (x) { return x.dep === dep; })[0]; return n ? n.v : 50; };
    const ef = { costo: op.costo, sem: op.sem };
    let dp = 0, dc = 0;
    if (op.id === 'pulir') { dp = 1 + (nota('edicion') >= 70 ? 1 : 0); dc = 1; }
    if (op.id === 'reeditar') { dp = N.limitar(Math.round((nota('edicion') - 50) / 10 + N.normal(1, 1)), -1, 4); dc = N.limitar(Math.round(N.normal(0, 0.8)), -1, 1); }
    if (op.id === 'regrabar') {
      dp = N.limitar(Math.round((nota('direccion') + nota('interprete') - 100) / 12 + N.normal(3, 1)), 2, 6); dc = 1;
      (o.eq.int || []).slice(0, 2).forEach(function (id) { const t = T.porId(id); if (t) T.cambiarMoral(t, -4); });
    }
    if (op.id === 'apurar') { dp = -1; dc = -1; }
    o.pub = Math.round(N.limitar(o.pub + dp, 1, 99));
    o.crit = Math.round(N.limitar(o.crit + dc, 1, 99));
    o.prueba.ok = op.id;
    o.prueba.dp = dp;
    aplicar(o, ef, ctx, null, 'Prueba de público (' + o.prueba.p + '): ' + op.t.toLowerCase() + (dp ? ' (' + (dp > 0 ? '+' : '') + dp + ' al público)' : '') + '.');
    return '';
  }
  function pruebaVencida(o) { return !!(o.prueba && !o.prueba.ok && N.S.t - o.prueba.t >= 3); }

  // ---------- Línea de producción: presupuesto acordado frente a costo real ----------
  function iniciarLinea(o) {
    o.lp = { plan: Math.round(o.pp), dur0: Object.assign({}, o.dur), g: {}, x: 0, ev: [] };
  }
  function sumarGasto(o, costo) {
    if (!o.lp) return;
    o.lp.g = o.lp.g || {};
    o.lp.g[o.et] = Math.round((o.lp.g[o.et] || 0) + costo);
  }
  function linea(o) {
    if (!o.lp) return null;
    const etapas = ['preproduccion', 'rodaje', 'posproduccion'];
    const semPlan = etapas.reduce(function (s, e) { return s + (o.lp.dur0[e] || 0); }, 0) || 1;
    const filas = etapas.map(function (e) {
      return { et: e, plan: Math.round(o.lp.plan * (o.lp.dur0[e] || 0) / semPlan), real: Math.round((o.lp.g && o.lp.g[e]) || 0), sem0: o.lp.dur0[e] || 0, sem: o.dur[e] || 0 };
    });
    const real = filas.reduce(function (s, f) { return s + f.real; }, 0) + (o.lp.x || 0);
    return { plan: o.lp.plan, real: Math.round(real), filas: filas, ev: o.lp.ev || [], extra: o.lp.x || 0 };
  }

  // ---------- Validación ----------
  function validar(o, a) {
    if (o.met && metodo(o.met).desde > a) return metodo(o.met).nombre + ' llega en ' + metodo(o.met).desde + '.';
    if (o.pst && estilo(o.pst).desde > a) return 'El estilo «' + estilo(o.pst).nombre + '» llega en ' + estilo(o.pst).desde + '.';
    if (o.setR && !setDe(o)) return 'Ese set ya no está en tu almacén: elige otro o construye uno nuevo.';
    ['efectos', 'animacion'].forEach(function (r) { if (o.ext && o.ext[r] && !externo(r, o.ext[r])) delete o.ext[r]; });
    return '';
  }

  // ---------- Para el bot y los rivales ----------
  // Puntaje simple de una opción (calidad y público valen; costo y semanas restan)
  function valorOpcion(op) {
    const e = op.azar !== undefined ? { q: op.azar * ((op.bien && op.bien.q) || 0) + (1 - op.azar) * ((op.mal && op.mal.q) || 0), pub: (1 - op.azar) * ((op.mal && op.mal.pub) || 0) } : op;
    return (e.q || 0) * 2 + (op.pub || 0) + (e.pub || 0) + (op.crit || 0) * 0.6 + (op.des || 0) * 0.4 - (op.costo || 0) * 40 - (op.sem || 0) * 1.2;
  }
  function mejorOpcion(o) {
    const x = dilemaDe(o);
    if (!x) return 0;
    let mejor = 0, v = -1e9;
    x.d.ops.forEach(function (op, i) { const s = valorOpcion(op); if (s > v) { v = s; mejor = i; } });
    return mejor;
  }

  return {
    DEPS: DEPS, METODOS: METODOS, TERRENOS: TERRENOS, ESTILOS: ESTILOS, EXTERNOS: EXTERNOS, INCENTIVOS: INCENTIVOS, SETS: SETS,
    DILEMAS: DILEMAS, INCIDENTES: INCIDENTES, OPCIONES_PRUEBA: OPCIONES_PRUEBA,
    metodo: metodo, terreno: terreno, estilo: estilo, externo: externo, letra: letra, necesita: necesita, esExterno: esExterno,
    nivelExterno: nivelExterno, externosDisponibles: externosDisponibles, pesosDep: pesosDep, habilidadSinTalento: habilidadSinTalento,
    depsDe: depsDe, ideal: ideal, reparto: reparto, efectoReparto: efectoReparto, bonoDep: bonoDep, usaLocacion: usaLocacion, usaSet: usaSet,
    terrenoPropio: terrenoPropio, costoCGI: costoCGI, incentivo: incentivo, viaje: viaje, factorCosto: factorCosto, ajusteSemanas: ajusteSemanas,
    ajusteNotas: ajusteNotas, edades: edades, notas: notas, nombreDep: nombreDep, metodoRecomendado: metodoRecomendado,
    terrenoRecomendado: terrenoRecomendado, metodosDisponibles: metodosDisponibles, estilosDisponibles: estilosDisponibles,
    tipoSet: tipoSet, setsQueSirven: setsQueSirven, setDe: setDe, capacidadSets: capacidadSets, guardarSet: guardarSet,
    semanaObra: semanaObra, costoSemana: costoSemana, escalaSemanas: escalaSemanas, dilemaDe: dilemaDe, decidir: decidir, vencido: vencido, hacerPrueba: hacerPrueba, opcionesPrueba: opcionesPrueba,
    decidirPrueba: decidirPrueba, pruebaVencida: pruebaVencida, iniciarLinea: iniciarLinea, sumarGasto: sumarGasto, linea: linea,
    mejorOpcion: mejorOpcion, valorOpcion: valorOpcion, INDUSTRIA: INDUSTRIA, validar: validar,
  };
})();
