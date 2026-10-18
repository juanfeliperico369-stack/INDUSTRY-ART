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
  // Periodos con efecto (t de inicio y fin se calculan con la fecha real)
  const PERIODOS = [
    { id: 'guerra1', ini: [1914, 7, 28], fin: [1918, 11, 11], reg: ['eur', 'asi'], f: 0.6 },
    { id: 'depresion', ini: [1929, 10, 29], fin: [1933, 12, 31], f: 0.9 },
    { id: 'guerra2', ini: [1939, 9, 1], fin: [1945, 9, 2], reg: ['eur', 'asi'], f: 0.55 },
    { id: 'hays', ini: [1934, 7, 1], fin: [1968, 11, 1], censura: 1 },
    { id: 'huelgaG', ini: [2023, 5, 2], fin: [2023, 11, 9], pausa: 'desarrollo' },
    { id: 'huelgaA', ini: [2023, 7, 14], fin: [2023, 11, 9], pausa: 'rodaje' },
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
  function st() { const S = N.S; if (!S.hist) S.hist = { gen: [], vistos: 0, ultAnio: 0 }; return S.hist; }
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
      if (i < h.vistos) return;
      const tx = tDe(x[0], x[1], x[2]);
      if (tx > S.t) return;
      h.vistos = i + 1;
      if (tx < S.t - 1) return; // lo de antes del inicio no se anuncia
      N.emit('noticia', { tipo: 'historia', texto: IA.cal.texto({ y: x[0], m: x[1] - 1, d: x[2] }) + ': ' + x[3] + '.', importante: true });
      if (x[4]) N.emit('hito', x[4]);
    });
    if (N.semana() === 1) generarAnio(N.anio());
  }
  function inicio() { const h = st(); h.vistos = 0; HITOS.forEach(function (x, i) { if (tDe(x[0], x[1], x[2]) < N.S.t) h.vistos = i + 1; }); }
  function lineaDeTiempo() {
    return HITOS.map(function (x) { return { y: x[0], m: x[1] - 1, d: x[2], txt: x[3], fx: x[4] || '' }; }).concat(generados().map(function (g) { const f = IA.cal.inicioDeT ? IA.cal.inicioDeT(g.ini) : null; return { y: N.anio(g.ini), m: f ? f.m : 0, d: f ? f.d : 1, txt: g.txt || g.tipo, gen: 1 }; }))
      .sort(function (a, b) { return (a.y - b.y) || (a.m - b.m) || (a.d - b.d); });
  }
  return { HITOS: HITOS, PERIODOS: PERIODOS, INVENTOS: INVENTOS, activos: activos, factorMercado: factorMercado, censura: censura, censurar: censurar, pausa: pausa,
    pirateria: pirateria, climaCierra: climaCierra, generarAnio: generarAnio, semana: semana, inicio: inicio, lineaDeTiempo: lineaDeTiempo, generados: generados };
})();
