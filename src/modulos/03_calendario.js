/* ==== módulo: calendario ==== */
// Calendario completo: los días reales de 1850 a 2150 con su día de la semana. La simulación sigue por
// semanas: la semana k del año son los días 7(k-1)+1 a 7k desde el 1 de enero (la 52 llega hasta el 31 de
// diciembre) y cada evento se procesa en la semana que contiene su día. Nada se fecha al azar: festividades con su
// regla real (fijas, Pascua gregoriana, Acción de Gracias, luna nueva para el Año Nuevo chino y Diwali, calendario
// islámico tabular para el Eid al-Fitr), el circuito anual fijo de premiaciones, festivales y convenciones, y los
// eventos de tu partida (estrenos, producción, nómina, contratos, cumpleaños y recordatorios).
IA.cal = (function () {
  'use strict';
  const N = IA.n;
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const DIAS_C = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
  const TODAS = ['nam', 'lat', 'eur', 'afr', 'asi', 'oce'];

  // ---------- Fechas ----------
  function bisiesto(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function diasMes(y, m) { return [31, bisiesto(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]; }
  function diasAnio(y) { return bisiesto(y) ? 366 : 365; }
  // Número de día juliano (mediodía) de una fecha gregoriana; m de 0 a 11
  function jdn(y, m, d) {
    const a = Math.floor((14 - (m + 1)) / 12), yy = y + 4800 - a, mm = (m + 1) + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function desdeJdn(j) {
    const a = j + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor(146097 * b / 4);
    const d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * d / 4), m = Math.floor((5 * e + 2) / 153);
    return { y: 100 * b + d - 4800 + Math.floor(m / 10), m: m + 3 - 12 * Math.floor(m / 10) - 1, d: e - Math.floor((153 * m + 2) / 5) + 1 };
  }
  // Día de la semana: 0 = lunes … 6 = domingo (el 1 de enero de 1850 fue martes)
  function diaSemana(y, m, d) { return jdn(y, m, d) % 7; }
  function diaDelAnio(y, m, d) { return jdn(y, m, d) - jdn(y, 0, 1) + 1; }
  function desdeDiaDelAnio(y, n) { return desdeJdn(jdn(y, 0, 1) + n - 1); }
  // Semana del juego (1 a 52) que contiene un día del año
  function semanaDeDia(n) { return Math.min(52, Math.floor((n - 1) / 7) + 1); }
  function rangoSemana(y, sem) { return [7 * (sem - 1) + 1, sem === 52 ? diasAnio(y) : 7 * sem]; }
  function semanaDeFecha(y, m, d) { return semanaDeDia(diaDelAnio(y, m, d)); }
  function tDeFecha(y, m, d) { return (y - N.S.y0) * 52 + semanaDeFecha(y, m, d) - 1; }
  // Primer día de una semana del juego, y el viernes (día de estreno del cine en EE. UU.)
  function inicioDeT(t) { const y = N.anio(t); return desdeDiaDelAnio(y, rangoSemana(y, N.semana(t))[0]); }
  function viernesDeT(t) {
    const y = N.anio(t), r = rangoSemana(y, N.semana(t));
    for (let n = r[0]; n <= r[1]; n++) { const f = desdeDiaDelAnio(y, n); if (diaSemana(f.y, f.m, f.d) === 4) return f; }
    return desdeDiaDelAnio(y, r[0]);
  }
  function hoy() { return inicioDeT(N.S.t); }
  function texto(f, largo) { return (largo ? DIAS[diaSemana(f.y, f.m, f.d)] + ' ' : '') + f.d + ' ' + (largo ? 'de ' + MESES[f.m] + ' de ' : MESES_C[f.m] + ' ') + f.y; }
  function textoCorto(f) { return DIAS_C[diaSemana(f.y, f.m, f.d)] + ' ' + f.d + ' ' + MESES_C[f.m]; }
  function nesimoDia(y, m, dow, n) { // n-ésimo día dow (0 = lunes) del mes; n = -1 es el último
    if (n > 0) { const p = diaSemana(y, m, 1); return 1 + ((dow - p + 7) % 7) + 7 * (n - 1); }
    const u = diasMes(y, m), pu = diaSemana(y, m, u);
    return u - ((pu - dow + 7) % 7);
  }

  // ---------- Reglas astronómicas ----------
  // Domingo de Pascua (cálculo gregoriano anónimo)
  function pascua(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return { y: y, m: mes - 1, d: dia };
  }
  // Luna nueva número k (Meeus, cap. 49, con las correcciones principales): día juliano en tiempo universal
  function lunaNueva(k) {
    const T = k / 1236.85, r = Math.PI / 180;
    let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T;
    const E = 1 - 0.002516 * T;
    const M = (2.5534 + 29.1053567 * k) * r, Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T * T) * r;
    const F = (160.7108 + 390.67050284 * k) * r, O = (124.7746 - 1.56375588 * k) * r;
    jde += -0.4072 * Math.sin(Mp) + 0.17241 * E * Math.sin(M) + 0.01608 * Math.sin(2 * Mp) + 0.01039 * Math.sin(2 * F) +
      0.00739 * E * Math.sin(Mp - M) - 0.00514 * E * Math.sin(Mp + M) + 0.00208 * E * E * Math.sin(2 * M) - 0.00111 * Math.sin(Mp - 2 * F) -
      0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M) - 0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) +
      0.00038 * E * Math.sin(M - 2 * F) - 0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(O);
    return jde;
  }
  // Primera luna nueva (en la hora local dada) en o después de una fecha
  function lunaNuevaDesde(y, m, d, horas) {
    const j0 = jdn(y, m, d);
    let k = Math.floor((y + (m + 0.5) / 12 - 2000) * 12.3685) - 1;
    for (let i = 0; i < 4; i++, k++) {
      const local = Math.floor(lunaNueva(k) + horas / 24 + 0.5); // día juliano civil local
      if (local >= j0) return desdeJdn(local);
    }
    return { y: y, m: m, d: d };
  }
  // Primer día de Shawwal (Eid al-Fitr) del calendario islámico tabular que cae en el año gregoriano y
  function eid(y) {
    const h0 = Math.floor((y - 622) * 33 / 32);
    for (let h = h0 - 1; h <= h0 + 2; h++) {
      const j = 1 + Math.ceil(29.5 * 9) + (h - 1) * 354 + Math.floor((3 + 11 * h) / 30) + 1948439;
      const f = desdeJdn(j);
      if (f.y === y) return f;
    }
    return { y: y, m: 3, d: 10 };
  }

  // ---------- Festividades (Datos v2) ----------
  // fam: familias que suben (×1,10); 'todo' sube a todas (×1,04; para el reparto entre obras se compensa)
  const FIESTAS = [
    { id: 'anonuevo', nombre: 'Año Nuevo', reg: TODAS, fam: 'todo' },
    { id: 'lunar', nombre: 'Año Nuevo chino', reg: ['asi'], fam: ['FJ', 'HM', 'IM'] },
    { id: 'valentin', nombre: 'San Valentín', reg: ['nam', 'lat', 'eur', 'oce'], fam: ['RD'] },
    { id: 'carnaval', nombre: 'Carnaval', reg: ['lat', 'eur'], fam: ['AA'] },
    { id: 'pascua', nombre: 'Pascua', reg: ['nam', 'lat', 'eur', 'oce', 'afr'], fam: ['IM'] },
    { id: 'trabajo', nombre: 'Día del trabajo', reg: TODAS, fam: ['HM', 'AA'], desde: 1890 },
    { id: 'memoria', nombre: 'Día de la memoria', reg: ['nam'], fam: ['AA', 'IM'], desde: 1868 },
    { id: 'orgullo', nombre: 'Orgullo', reg: ['nam', 'lat', 'eur'], fam: ['DR', 'HM'], desde: 1970 },
    { id: 'independencia', nombre: 'Independencia', reg: ['sede'], fam: 'todo' },
    { id: 'popdays', nombre: 'Pop days', reg: ['nam', 'eur', 'asi'], fam: 'todo' },
    { id: 'eid', nombre: 'Eid al-Fitr', reg: ['afr', 'asi'], fam: ['FJ', 'AA'] },
    { id: 'diwali', nombre: 'Diwali', reg: ['asi'], fam: 'todo' },
    { id: 'halloween', nombre: 'Halloween', reg: ['nam'], fam: ['SM', 'IM', 'AA'], desde: 1930 },
    { id: 'muertos', nombre: 'Día de Muertos', reg: ['lat'], fam: ['IM', 'FJ'] },
    { id: 'gracias', nombre: 'Acción de Gracias', reg: ['nam'], fam: ['FJ'], desde: 1863 },
    { id: 'navidad', nombre: 'Navidad', reg: ['nam', 'lat', 'eur', 'afr', 'oce'], fam: 'todo' },
  ];
  // Día de independencia de los países de sede (los que no tienen, no la celebran)
  const INDEPENDENCIA = {
    us: [6, 4, 1776], co: [6, 20, 1810], mx: [8, 16, 1810], ar: [6, 9, 1816], br: [8, 7, 1822], cl: [8, 18, 1810], pe: [6, 28, 1821],
    ve: [6, 5, 1811], fr: [6, 14, 1880], in: [7, 15, 1947], ng: [9, 1, 1960], za: [3, 27, 1994], kr: [7, 15, 1945], ph: [5, 12, 1898],
    eg: [6, 23, 1952], cu: [4, 20, 1902], pa: [10, 3, 1903], ma: [10, 18, 1956], de: [9, 3, 1990], ru: [5, 12, 1992], fj: [9, 10, 1970], ws: [5, 1, 1962], pg: [8, 16, 1975], ke: [11, 12, 1963], au: [0, 26, 1938], ca: [6, 1, 1867], ie: [3, 24, 1916], it: [5, 2, 1946], es: [9, 12, 1987],
  };
  // Las fechas (día inicial y final) de cada festividad en un año
  function fechasFiesta(id, y, pais) {
    const D = function (m, d) { return diaDelAnio(y, m, d); };
    switch (id) {
      case 'anonuevo': return [1, 1];
      case 'lunar': { const f = lunaNuevaDesde(y, 0, 21, 8); return [D(f.m, f.d), D(f.m, f.d) + 6]; }
      case 'valentin': return [D(1, 14), D(1, 14)];
      case 'carnaval': { const p = pascua(y), n = D(p.m, p.d); return [n - 50, n - 47]; }
      case 'pascua': { const p = pascua(y), n = D(p.m, p.d); return [n - 2, n + 1]; }
      case 'trabajo': return [D(4, 1), D(4, 1)];
      case 'memoria': { const d = y >= 1971 ? nesimoDia(y, 4, 0, -1) : 30; return [D(4, d), D(4, d)]; }
      case 'orgullo': return [D(5, 28), D(5, 28)];
      case 'independencia': { const x = INDEPENDENCIA[pais]; return x && y >= x[2] ? [D(x[0], x[1]), D(x[0], x[1])] : null; }
      case 'popdays': return [7 * 27 + 1, 7 * 38];
      case 'eid': { const f = eid(y); return [D(f.m, f.d), D(f.m, f.d) + 2]; }
      case 'diwali': { const f = lunaNuevaDesde(y, 9, 16, 5.5); return [D(f.m, f.d) - 1, D(f.m, f.d) + 1]; }
      case 'halloween': return [D(9, 31), D(9, 31)];
      case 'muertos': return [D(10, 1), D(10, 2)];
      case 'gracias': { const d = y >= 1942 ? nesimoDia(y, 10, 3, 4) : nesimoDia(y, 10, 3, -1); return [D(10, d), D(10, d) + 3]; }
      case 'navidad': return [D(11, 15), D(11, 31)];
    }
    return null;
  }
  const cacheFiestas = {};
  function fiestasAnio(y) {
    const pais = N.S && N.S.estudios && N.S.estudios[0] ? N.S.estudios[0].pais : 'us';
    const clave = y + '|' + pais;
    if (cacheFiestas[clave]) return cacheFiestas[clave];
    const sede = N.S && N.S.estudios && N.S.estudios[0] ? N.S.estudios[0].reg : 'nam';
    const r = [];
    FIESTAS.forEach(function (f) {
      if (f.desde && y < f.desde) return;
      const fe = fechasFiesta(f.id, y, pais);
      if (!fe) return;
      let reg = f.reg[0] === 'sede' ? [sede] : f.reg;
      if (f.id === 'halloween' && y >= 2000) reg = ['nam', 'eur', 'oce', 'lat'];
      r.push({ id: f.id, nombre: f.nombre, ini: fe[0], fin: Math.min(diasAnio(y), fe[1]), reg: reg, fam: f.fam });
    });
    cacheFiestas[clave] = r;
    return r;
  }
  // Festividades que tocan una semana del juego en una región (o en todas)
  function fiestasSemana(sem, reg, y) {
    const rg = rangoSemana(y, sem);
    return fiestasAnio(y).filter(function (f) { return f.fin >= rg[0] && f.ini <= rg[1] && (!reg || f.reg.indexOf(reg) >= 0); });
  }
  function bonoFiesta(famId, reg, sem, y) {
    let b = 1;
    fiestasSemana(sem, reg, y).forEach(function (f) {
      if (f.fam === 'todo') b *= 1.04;
      else if (f.fam.indexOf(famId) >= 0) b *= 1.1;
    });
    return b;
  }

  // ---------- Circuito anual fijo (Datos v2) ----------
  // [id, nombre, tipo, región ('*' = mundo), mes, día, desde, años (opcional)]
  const CIRCUITO = [
    ['indep', 'Premios Independientes', 'premio', '*', 'sem', 2, 1985], ['bastard', 'Bastard Awards', 'premio', '*', 'sem', 4, 1980],
    ['vinilo', 'Premios Vinilo', 'premio', '*', 'sem', 6, 1959], ['quimera', 'Premios Quimera', 'premio', '*', 'sem', 11, 1929],
    ['pluma', 'Premios Pluma', 'premio', '*', 'sem', 14, 1917], ['telon', 'Premios Telón', 'premio', '*', 'sem', 24, 1947],
    ['mundial', 'Festival Mundial del Arte', 'festival', '*', 'sem', 23, 1850, null, 4], ['pop', 'Pop Awards', 'premio', '*', 'sem', 38, 1975],
    ['senal', 'Premios Señal', 'premio', '*', 'sem', 40, 1949], ['cartucho', 'Premios Cartucho', 'premio', '*', 'sem', 52, 2003],
    ['montana', 'Festival Montaña', 'festival', 'nam', 0, 25, 1978], ['spree', 'Festival Spree', 'festival', 'eur', 1, 12, 1951],
    ['delta', 'Festival Delta', 'festival', 'afr', 1, 25, 1969, 'impar'], ['altiplano', 'Festival Altiplano', 'festival', 'nam', 2, 10, 1986],
    ['caribe', 'Festival Caribe', 'festival', 'lat', 2, 20, 1960], ['riviera', 'Festival Riviera', 'festival', 'eur', 4, 15, 1946],
    ['yangtse', 'Festival Yangtsé', 'festival', 'asi', 5, 12, 1993], ['bahia', 'Festival Bahía', 'festival', 'oce', 5, 5, 1954],
    ['nube', 'Festival Nube Blanca', 'festival', 'oce', 6, 20, 1969], ['volcan', 'Festival Volcán', 'festival', 'oce', 7, 10, 1952],
    ['laguna', 'Festival Laguna', 'festival', 'eur', 7, 30, 1932], ['lagos', 'Festival Grandes Lagos', 'festival', 'nam', 8, 8, 1976],
    ['sierra', 'Festival Sierra', 'festival', 'lat', 9, 10, 1994], ['puerto', 'Festival Puerto', 'festival', 'asi', 9, 5, 1996],
    ['solnaciente', 'Festival Sol Naciente', 'festival', 'asi', 9, 28, 1985], ['desierto', 'Festival Desierto', 'festival', 'afr', 10, 8, 1976],
    ['atlantico', 'Festival Atlántico', 'festival', 'lat', 10, 20, 1954], ['atlas', 'Festival Atlas', 'festival', 'afr', 10, 28, 2001],
    ['mmusica', 'Mercado Mundial de la Música', 'convencion', 'eur', 0, 20, 1967], ['pixel', 'Expo Píxel', 'convencion', 'nam', 5, 10, 1995],
    ['vineta', 'Convención Viñeta', 'convencion', 'nam', 6, 20, 1970], ['anime', 'Expo Anime', 'convencion', 'nam', 6, 2, 1992],
    ['feriajuego', 'Gran Feria del Juego', 'convencion', 'eur', 7, 20, 2009], ['arcade', 'Salón Arcade de Oriente', 'convencion', 'asi', 8, 18, 1996],
    ['libro', 'Feria Mundial del Libro', 'convencion', 'eur', 9, 15, 1949], ['pantalla', 'Mercado de la Pantalla', 'convencion', 'eur', 9, 8, 1985],
  ];
  const EXPOSICIONES = [1851, 1855, 1867, 1878, 1889, 1900, 1904, 1939, 1958, 1967, 1970, 1992, 2000, 2005, 2010, 2015, 2020];
  function circuitoAnio(y) {
    const r = [];
    CIRCUITO.forEach(function (c) {
      if (y < c[6]) return;
      if (c[7] === 'impar' && y % 2 === 0) return;
      let ini, fin;
      if (c[4] === 'sem') { // premiaciones: la gala es el domingo de su semana
        const rg = rangoSemana(y, c[5]);
        ini = rg[0];
        for (let n = rg[0]; n <= rg[1]; n++) { const f = desdeDiaDelAnio(y, n); if (diaSemana(f.y, f.m, f.d) === 6) { ini = n; break; } }
        fin = c[8] ? rangoSemana(y, c[5] + c[8] - 1)[1] : ini;
        if (c[8]) ini = rg[0];
      } else { ini = diaDelAnio(y, c[4], c[5]); fin = ini + (c[2] === 'festival' ? 9 : 3); }
      r.push({ id: c[0], nombre: c[1], tipo: c[2], reg: c[3] === '*' ? TODAS : [c[3]], ini: ini, fin: Math.min(diasAnio(y), fin) });
    });
    if (EXPOSICIONES.indexOf(y) >= 0 || (y > 2020 && y % 5 === 0)) r.push({ id: 'expo', nombre: 'Exposición universal', tipo: 'expo', reg: TODAS, ini: diaDelAnio(y, 4, 1), fin: diaDelAnio(y, 9, 31) });
    return r;
  }

  // ---------- Eventos de un día (todo lo que muestra el calendario) ----------
  const TIPOS = {
    fiesta: { nombre: 'Festividades', icono: '✶' }, premio: { nombre: 'Premiaciones', icono: '♛' }, festival: { nombre: 'Festivales', icono: '◆' },
    convencion: { nombre: 'Convenciones', icono: '▣' }, expo: { nombre: 'Exposiciones', icono: '◎' }, estreno: { nombre: 'Estrenos', icono: '▶' },
    produccion: { nombre: 'Producción', icono: '✎' }, negocio: { nombre: 'Negocio', icono: '$' }, talento: { nombre: 'Talentos', icono: '☺' },
    historia: { nombre: 'Historia', icono: '⌛' }, recordatorio: { nombre: 'Recordatorios', icono: '⚑' },
  };
  // Eventos de un mes completo, agrupados por día: { d: [evento…] }. f = filtros { tipos: {...}, reg, mio }
  function eventosMes(y, m, f) {
    f = f || {};
    const S = N.S, out = {}, sede = S.estudios[0].reg;
    const n0 = diaDelAnio(y, m, 1), n1 = n0 + diasMes(y, m) - 1;
    const add = function (n, ev) {
      if (n < n0 || n > n1) return;
      if (f.tipos && f.tipos[ev.tipo] === false) return;
      if (f.reg && ev.reg && ev.reg.indexOf(f.reg) < 0) return;
      if (f.mio && !ev.mio) return;
      const d = n - n0 + 1;
      (out[d] = out[d] || []).push(ev);
    };
    const rango = function (ini, fin, ev) { for (let n = Math.max(ini, n0); n <= Math.min(fin, n1); n++) add(n, Object.assign({ inicio: n === ini }, ev)); };
    fiestasAnio(y).forEach(function (x) { rango(x.ini, x.fin, { tipo: 'fiesta', titulo: x.nombre, reg: x.reg, mio: x.reg.indexOf(sede) >= 0 }); });
    circuitoAnio(y).forEach(function (x) { rango(x.ini, x.fin, { tipo: x.tipo, titulo: x.nombre, reg: x.reg, mio: false, id: x.id }); });
    // Estrenos anunciados (tuyos y de los rivales) en su viernes
    S.obras.forEach(function (o) {
      if (!(o.prog && o.et === 'lista') && !(o.et === 'cartelera' && o.sc <= 1)) return;
      if (N.anio(o.fe) !== y) return;
      const v = viernesDeT(o.fe);
      add(diaDelAnio(v.y, v.m, v.d), { tipo: 'estreno', titulo: '«' + o.tit + '» · ' + S.estudios[o.est].nombre, mio: o.est === 0, obra: o.id, reg: TODAS });
    });
    // Tus producciones: cuándo quedan listas (estimado)
    if (IA.obras && IA.produccion) IA.obras.enProduccion(0).forEach(function (o) {
      const t = S.t + IA.produccion.semanasRestantes(o);
      if (N.anio(t) !== y) return;
      const fi = inicioDeT(t);
      add(diaDelAnio(fi.y, fi.m, fi.d), { tipo: 'produccion', titulo: '«' + o.tit + '» quedaría lista (estimado)', mio: true, obra: o.id });
    });
    // Negocio: nómina el día 1, impuestos el 31 de diciembre y fin de contratos con cadenas
    add(n0, { tipo: 'negocio', titulo: 'Nómina y gastos fijos del mes', mio: true });
    if (m === 11) add(n1, { tipo: 'negocio', titulo: 'Cierre del año: impuesto del 25 % sobre utilidades', mio: true });
    const cad = S.estudios[0].cad || {};
    Object.keys(cad).forEach(function (r) { const k = cad[r]; if (N.anio(k.hasta) === y) { const fi = inicioDeT(k.hasta); add(diaDelAnio(fi.y, fi.m, fi.d), { tipo: 'negocio', titulo: 'Termina el contrato con la cadena de ' + r, mio: true }); } });
    // Talentos: cumpleaños y fin de contrato de tus exclusivos
    S.talentos.forEach(function (ta) {
      if (ta.ret || ta.ex !== 0 || !(ta.exH > S.t)) return;
      const cm = N.hash('cumple' + ta.id) % 12, cd = 1 + N.hash('dia' + ta.id) % diasMes(y, cm);
      add(diaDelAnio(y, cm, cd), { tipo: 'talento', titulo: 'Cumpleaños de ' + ta.nom + ' (' + (y - ta.nac) + ')', mio: true, talento: ta.id });
      if (N.anio(ta.exH) === y) { const fi = inicioDeT(ta.exH); add(diaDelAnio(fi.y, fi.m, fi.d), { tipo: 'talento', titulo: 'Termina el contrato exclusivo de ' + ta.nom, mio: true, talento: ta.id }); }
    });
    // Historia del año (el día exacto llega con el mundo vivo)
    (IA.datos.cronologia || []).forEach(function (c) { if (c[0] === y) add(diaDelAnio(y, 0, 1), { tipo: 'historia', titulo: c[1], reg: TODAS }); });
    // Tus recordatorios
    (S.recordatorios || []).forEach(function (r) { if (r.y === y && r.m === m) add(n0 + r.d - 1, { tipo: 'recordatorio', titulo: r.nota || 'Recordatorio', mio: true, rec: r.id }); });
    return out;
  }
  // Competencia de una semana para un estreno: tranquila, movida o saturada
  function competencia(t, excluir) {
    const c = IA.lanzamiento ? IA.lanzamiento.competenciaPrevista(t, excluir) : 0;
    return c < 1.5 ? { id: 'tranquila', nombre: 'tranquila', v: c } : c < 3.5 ? { id: 'movida', nombre: 'movida', v: c } : { id: 'saturada', nombre: 'saturada', v: c };
  }
  // Estaciones por hemisferio
  function estacion(m, hem) {
    const N_ = ['invierno', 'invierno', 'primavera', 'primavera', 'primavera', 'verano', 'verano', 'verano', 'otoño', 'otoño', 'otoño', 'invierno'];
    const S_ = ['verano', 'verano', 'otoño', 'otoño', 'otoño', 'invierno', 'invierno', 'invierno', 'primavera', 'primavera', 'primavera', 'verano'];
    return hem === 'S' ? S_[m] : N_[m];
  }

  // ---------- Recordatorios (detienen el tiempo al llegar su semana) ----------
  function agregarRecordatorio(y, m, d, nota) {
    const S = N.S;
    if (tDeFecha(y, m, d) <= S.t) return 'Elige un día futuro.';
    S.recordatorios = S.recordatorios || [];
    S.recordatorios.push({ id: ++S.sigId, y: y, m: m, d: d, nota: String(nota || 'Recordatorio').slice(0, 80) });
    return '';
  }
  function quitarRecordatorio(id) { const S = N.S; S.recordatorios = (S.recordatorios || []).filter(function (r) { return r.id !== id; }); }
  function recordatoriosDeSemana(t) { return (N.S.recordatorios || []).filter(function (r) { return tDeFecha(r.y, r.m, r.d) === t; }); }

  return {
    MESES: MESES, MESES_C: MESES_C, DIAS: DIAS, DIAS_C: DIAS_C, TIPOS: TIPOS, FIESTAS: FIESTAS, CIRCUITO: CIRCUITO,
    bisiesto: bisiesto, diasMes: diasMes, diasAnio: diasAnio, jdn: jdn, desdeJdn: desdeJdn, diaSemana: diaSemana, diaDelAnio: diaDelAnio,
    desdeDiaDelAnio: desdeDiaDelAnio, semanaDeDia: semanaDeDia, semanaDeFecha: semanaDeFecha, rangoSemana: rangoSemana, tDeFecha: tDeFecha,
    inicioDeT: inicioDeT, viernesDeT: viernesDeT, hoy: hoy, texto: texto, textoCorto: textoCorto, pascua: pascua, lunaNuevaDesde: lunaNuevaDesde, eid: eid,
    fiestasAnio: fiestasAnio, fiestasSemana: fiestasSemana, bonoFiesta: bonoFiesta, circuitoAnio: circuitoAnio, eventosMes: eventosMes,
    competencia: competencia, estacion: estacion, agregarRecordatorio: agregarRecordatorio, quitarRecordatorio: quitarRecordatorio,
    recordatoriosDeSemana: recordatoriosDeSemana,
  };
})();
