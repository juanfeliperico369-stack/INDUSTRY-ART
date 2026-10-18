/* ==== módulo: critica ==== */
// Crítica, etiquetas y la vida pública del estudio. Críticos inventados con nombre, medio (según la época),
// gustos y frases que dicen qué funcionó o falló; reseñas de tus obras al estrenar (con la proyección para la
// prensa); etiquetas de recepción (Hit, Pop, Fresco, Olvidado, Podrida) y de prestigio (Culto, Clásico,
// Invaluable) que cambian con el tiempo; insignias (Hype, Oro, De autor, Blockbuster, Media, Independiente);
// cartas de fans; la revista de la industria (Boletín, Rincón de la crítica y Editorial); la cronología del
// estudio y su biografía pública.
IA.critica = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, O = IA.obras, E = IA.economia;

  // gustos: familias que ama (+6) y que no soporta (−6); valora: autor (crítica alta y público bajo), espectaculo, risa
  const CRITICOS = [
    { id: 'c1', nombre: 'Adela Montoro', ama: ['DR', 'AV'], odia: ['AA'], valora: 'autor', desde: 1880, hasta: 1960 },
    { id: 'c2', nombre: 'Bruno Lacasse', ama: ['SM'], odia: ['RD'], valora: 'espectaculo', desde: 1895, hasta: 1975 },
    { id: 'c3', nombre: 'Celia Varga', ama: ['HM', 'RD'], odia: ['SM'], valora: 'risa', desde: 1910, hasta: 1990 },
    { id: 'c4', nombre: 'Dimas Okoro', ama: ['AA', 'IM'], odia: ['AV'], valora: 'espectaculo', desde: 1940, hasta: 2020 },
    { id: 'c5', nombre: 'Elvira Sandoval', ama: ['AV', 'DR'], odia: ['FJ'], valora: 'autor', desde: 1950, hasta: 2035 },
    { id: 'c6', nombre: 'Fausto Rinaldi', ama: ['IM', 'FJ'], odia: ['DR'], valora: 'espectaculo', desde: 1965, hasta: 2045 },
    { id: 'c7', nombre: 'Greta Lindqvist', ama: ['SM', 'AV'], odia: ['HM'], valora: 'autor', desde: 1980, hasta: 2060 },
    { id: 'c8', nombre: 'Hiro Tanabe', ama: ['IM', 'AA'], odia: ['RD'], valora: 'espectaculo', desde: 1995, hasta: 2080 },
    { id: 'c9', nombre: 'Inés Abara', ama: ['DR', 'RD'], odia: ['AA'], valora: 'autor', desde: 2005, hasta: 2100 },
    { id: 'c10', nombre: 'Joaquín Prado', ama: ['HM', 'FJ'], odia: ['AV'], valora: 'risa', desde: 2015, hasta: 2120 },
    { id: 'c11', nombre: 'Kaia Moreau', ama: ['AV', 'IM'], odia: ['HM'], valora: 'autor', desde: 2040, hasta: 2150 },
    { id: 'c12', nombre: 'Lev Andrade', ama: ['AA', 'SM'], odia: ['DR'], valora: 'espectaculo', desde: 2060, hasta: 2150 },
  ];
  function medio(c, anio) {
    const base = N.hash(c.id) % 3;
    if (anio < 1922) return ['Diario La Mañana', 'Gaceta de las Artes', 'El Correo'][base];
    if (anio < 1950) return ['Radio Continental', 'Revista Butaca', 'Diario La Mañana'][base];
    if (anio < 1995) return ['Noticiero de la noche', 'Revista Butaca', 'Canal de las Artes'][base];
    if (anio < 2008) return ['Portal Fotograma', 'Revista Butaca', 'Diario en línea'][base];
    return ['Canal en video Plano Corto', 'Portal Fotograma', 'Pódcast La Butaca'][base];
  }
  function activos(anio) { return CRITICOS.filter(function (c) { return anio >= c.desde && anio <= c.hasta; }); }

  // ---------- Reseñas ----------
  const REMATES = {
    alto: ['Habrá que verla dos veces.', 'De lo mejor del año.', 'El público saldrá hablando de ella.', 'Un oficio que se nota en cada plano.', 'Merece cada minuto.', 'Quedará en la memoria.', 'Una sorpresa mayúscula.', 'Así se cuenta una historia.'],
    medio: ['Correcta, sin más.', 'Se deja ver.', 'Le sobra media hora.', 'Tiene momentos, pero no alcanza.', 'Para una tarde de lluvia.', 'Cumple, aunque no emociona.', 'Le faltó valentía.', 'El final la salva a medias.'],
    bajo: ['Mejor esperar a verla en casa.', 'Ni el reparto la rescata.', 'Se olvida al salir de la sala.', 'Larga y sin rumbo.', 'Un tropiezo para todos.', 'Difícil de recomendar.', 'Nadie parece creer en ella.', 'Un desperdicio de talento.'],
  };
  const FRASES = {
    alto: ['Una obra que se queda contigo días después.', 'Lo mejor del año, sin discusión.', 'Valiente, precisa y emocionante.', 'Cada plano está donde debe estar.'],
    medio: ['Correcta, aunque no arriesga.', 'Entretiene, pero se olvida pronto.', 'Tiene momentos, no una obra.', 'Cumple sin brillar.'],
    bajo: ['Un error de principio a fin.', 'Ni el reparto la salva.', 'Larga, confusa y sin alma.', 'Una oportunidad perdida.'],
  };
  const DEP_TEXTO = { guion: 'el guion', direccion: 'la dirección', interprete: 'las actuaciones', fotografia: 'la fotografía', musica: 'la música', edicion: 'el montaje', arte: 'el diseño de arte', vestuario: 'el vestuario', efectos: 'los efectos', produccion: 'la producción', animacion: 'la animación' };
  function resenar(o) {
    if (o.est !== 0 || o.res) return;
    const anio = N.anio(), lista = activos(anio);
    // Qué funcionó y qué falló (departamentos con nota)
    let mejor = null, peor = null;
    if (o.notas) Object.keys(o.notas).forEach(function (k) { if (!mejor || o.notas[k] > o.notas[mejor]) mejor = k; if (!peor || o.notas[k] < o.notas[peor]) peor = k; });
    o.res = N.mezclar ? [] : [];
    const elegidos = lista.slice().sort(function (a, b) { return N.hash(a.id + o.id) - N.hash(b.id + o.id); }).slice(0, 4);
    elegidos.forEach(function (c) {
      let n = o.crit + (c.ama.indexOf(o.fam) >= 0 ? 6 : 0) - (c.odia.indexOf(o.fam) >= 0 ? 6 : 0);
      if (c.valora === 'autor') n += (o.crit - o.pub) / 4;
      if (c.valora === 'espectaculo' && (o.fx || 2) >= 3) n += 3;
      if (c.valora === 'risa' && o.fam === 'HM') n += 3;
      n = Math.round(N.limitar(n + N.normal(0, 5), 5, 100));
      const banda = n >= 72 ? 'alto' : n >= 50 ? 'medio' : 'bajo';
      let f = N.elegir(FRASES[banda]);
      // Un remate al azar para que las reseñas no se repitan en partidas largas
      if (N.probabilidad(0.6)) f += ' ' + N.elegir(REMATES[banda]);
      if (banda === 'alto' && mejor) f += ' Brilla ' + DEP_TEXTO[mejor] + '.';
      if (banda === 'bajo' && peor) f += ' Falla ' + DEP_TEXTO[peor] + '.';
      if (banda === 'medio' && (o.ddes || 0) >= 4) f += ' Prometía más de lo que da.';
      o.res.push({ c: c.id, n: n, f: f, m: medio(c, anio) });
    });
    if (o.est === 0) N.S.proyeccion = o.id; // la interfaz muestra la proyección para la prensa
  }
  function critico(id) { return CRITICOS.filter(function (c) { return c.id === id; })[0]; }
  // Citar una frase de la crítica en la campaña: una vez por obra, mientras está en cartelera (+boca a boca)
  function citar(obraId, i) {
    const o = O.porId(obraId);
    if (!o || o.est !== 0 || o.et !== 'cartelera') return 'Solo en obras tuyas en cartelera.';
    if (o.cita) return 'Ya citaste a la crítica.';
    const r = (o.res || [])[i];
    if (!r || r.n < 70) return 'Elige una reseña buena (70 o más).';
    o.cita = r.f;
    o.u = N.redondear((o.u || 0) + 0.06 + (r.n - 70) / 300, 4);
    return '';
  }

  // ---------- Etiquetas e insignias ----------
  const ETIQUETAS = {
    hit: 'Hit', pop: 'Pop', fresco: 'Fresco', olvidado: 'Olvidado', podrida: 'Podrida', culto: 'Culto', clasico: 'Clásico', invaluable: 'Invaluable',
  };
  function recepcion(o) {
    if (!o.crit || o.et === 'lista') return null;
    const m = O.multiplicador(o);
    if (o.crit < 40) return 'podrida';
    if (m >= 3) return 'hit';
    if (o.crit >= 75) return 'fresco';
    if (o.pub >= 72 && o.crit < 65) return 'pop';
    if (m < 1.2 && o.crit < 65) return 'olvidado';
    return null;
  }
  function prestigio(o) {
    if (!o.anio) return null;
    const edad = N.anio() - o.anio, aw = (o.aw || []).length + (o.galas || []).filter(function (g) { return g.c === 'mayor' || g.c === 'pelicula'; }).length;
    if (o.crit >= 88 && aw >= 3 && edad >= 30) return 'invaluable';
    if ((o.crit >= 80 && edad >= 20) || aw >= 2 && edad >= 10) return 'clasico';
    if ((o.culto || (o.crit >= 70 && O.multiplicador(o) < 1.5)) && edad >= 10) return 'culto';
    return null;
  }
  function insignias(o) {
    const r = [], tipico = E.presupuestoTipico(o.anio || N.anio());
    if ((o.des || 0) >= 80) r.push('Hype');
    if ((o.aw || []).indexOf('pelicula') >= 0 || (o.galas || []).some(function (g) { return g.c === 'mayor'; })) r.push('Oro');
    if ((o.crit || 0) - (o.pub || 0) >= 12) r.push('De autor');
    if ((o.bruto || 0) >= tipico * 4) r.push('Blockbuster');
    if ((o.con || 0) >= 0.9) r.push('Media');
    if (O.costoTotal(o) < tipico * 0.5) r.push('Independiente');
    return r;
  }
  // Las etiquetas pesan en reestrenos (y en las secuelas): la recepción en los primeros 10 años, el prestigio después
  function factorEtiquetas(o) {
    const edad = N.anio() - (o.anio || N.anio());
    const rc = recepcion(o), pr = prestigio(o);
    let f = 1;
    if (edad < 10) f *= { hit: 1.25, fresco: 1.15, pop: 1.1, olvidado: 0.85, podrida: 0.7 }[rc] || 1;
    else f *= { culto: 1.3, clasico: 1.4, invaluable: 1.7 }[pr] || (rc === 'podrida' ? 0.8 : 1);
    return f;
  }

  // ---------- Cartas de fans ----------
  const CARTAS = [
    function (o) { return '«Vi «' + o.tit + '» tres veces. ¿Cuándo llega la secuela?»'; },
    function (o) { return '«El final de «' + o.tit + '» me dejó sin palabras. Gracias.»'; },
    function (o) { return '«Mi abuela y yo vimos «' + o.tit + '» juntas. Hacía años que no reíamos así.»'; },
    function (o) { return '«No entendí el final de «' + o.tit + '». ¿Me lo explican?»'; },
    function (o) { return '«Quiero trabajar en su estudio algún día. «' + o.tit + '» me cambió la vida.»'; },
  ];
  function cartaMensual() {
    const S = N.S;
    const recientes = S.obras.filter(function (o) { return o.est === 0 && (o.et === 'cartelera' || (o.et === 'terminada' && o.fe > S.t - 52)) && (o.pub || 0) >= 60; });
    if (!recientes.length || !N.probabilidad(0.5)) return;
    const o = N.elegir(recientes);
    S.cartas = S.cartas || [];
    S.cartas.unshift({ t: S.t, obra: o.id, txt: N.elegir(CARTAS)(o) });
    if (S.cartas.length > 20) S.cartas.pop();
  }

  // ---------- Revista de la industria (un número por mes) ----------
  function numeroRevista() {
    const S = N.S, mes = S.t - 4;
    const estrenos = S.obras.filter(function (o) { return o.fe >= mes && o.fe < S.t && o.crit && (o.et === 'cartelera' || o.et === 'terminada'); });
    const top = estrenos.slice().sort(function (a, b) { return (b.bruto || 0) - (a.bruto || 0); }).slice(0, 5);
    const crit = estrenos.slice().sort(function (a, b) { return b.crit - a.crit; });
    let motor = D.motorMercado[0][1];
    D.motorMercado.forEach(function (m) { if (m[0] <= N.anio()) motor = m[1]; });
    const tend = D.familias.map(function (f) { return { f: f, v: S.mundo.tendencias[f.id] || 0 }; }).sort(function (a, b) { return b.v - a.v; });
    const num = { n: (S.revista && S.revista.length ? S.revista[0].n : 0) + 1, t: S.t,
      boletin: top.map(function (o) { return { tit: o.tit, est: S.estudios[o.est].nombre, bruto: Math.round(o.bruto || 0), mio: o.est === 0 }; }),
      critica: crit.length ? { mejor: { tit: crit[0].tit, n: crit[0].crit }, peor: crit.length > 1 ? { tit: crit[crit.length - 1].tit, n: crit[crit.length - 1].crit } : null } : null,
      editorial: 'El mercado de hoy se mueve por ' + motor.toLowerCase() + '. ' + tend[0].f.nombre + ' está en alza y ' + tend[tend.length - 1].f.nombre.toLowerCase() + ' pierde público.' +
        (S.estudios[0].fama > 0.4 ? ' ' + S.estudios[0].nombre + ' ya es un nombre que todos miran.' : '') };
    S.revista = S.revista || [];
    S.revista.unshift(num);
    if (S.revista.length > 24) S.revista.pop();
  }

  // ---------- Cronología del estudio ----------
  function hito(texto) {
    const S = N.S;
    S.hitos = S.hitos || [];
    S.hitos.push({ t: S.t, anio: N.anio(), txt: texto, fama: Math.round(S.estudios[0].fama * 100) });
    if (S.hitos.length > 200) S.hitos.shift();
  }
  function alTerminar(o) {
    if (o.est !== 0) return;
    const S = N.S, mias = S.obras.filter(function (x) { return x.est === 0 && x.et === 'terminada'; });
    if (mias.length === 1) hito('Primer estreno: «' + o.tit + '».');
    if (recepcion(o) === 'hit' && !S.hitos.some(function (h) { return h.txt.indexOf('Primer éxito') === 0; })) hito('Primer éxito: «' + o.tit + '».');
    if (insignias(o).indexOf('Blockbuster') >= 0) hito('Taquillazo: «' + o.tit + '».');
  }
  // ---------- Biografía pública ----------
  function biografia() {
    const S = N.S, est = S.estudios[0];
    const mias = S.obras.filter(function (o) { return o.est === 0 && (o.et === 'terminada' || o.et === 'cartelera') && o.crit; });
    if (!mias.length) return null;
    const max = function (f) { return mias.reduce(function (a, o) { return !a || f(o) > f(a) ? o : a; }, null); };
    const fams = {}; mias.forEach(function (o) { fams[o.fam] = (fams[o.fam] || 0) + 1; });
    const famTop = Object.keys(fams).sort(function (a, b) { return fams[b] - fams[a]; })[0];
    const clas = mias.map(function (o) { return IA.taxonomia.ORDEN_CLAS.indexOf(o.clas); });
    const prom = clas.reduce(function (a, x) { return a + Math.max(0, x); }, 0) / clas.length;
    return {
      mejor: max(function (o) { return o.crit; }), taquillera: max(function (o) { return o.bruto || 0; }), cara: max(function (o) { return O.costoTotal(o); }),
      culto: mias.filter(function (o) { return prestigio(o) === 'culto'; }).length, clasico: max(function (o) { return prestigio(o) === 'clasico' || prestigio(o) === 'invaluable' ? o.crit : -1; }),
      genero: D.familia(famTop).nombre, perfil: prom < 2 ? 'Familiar' : prom < 4 ? 'Adulto' : 'Serio', clase: est.clase || 'C', mascota: est.mascota || '',
    };
  }

  return {
    CRITICOS: CRITICOS, ETIQUETAS: ETIQUETAS, critico: critico, medio: medio, activos: activos, resenar: resenar, citar: citar, recepcion: recepcion,
    prestigio: prestigio, insignias: insignias, factorEtiquetas: factorEtiquetas, cartaMensual: cartaMensual, numeroRevista: numeroRevista,
    hito: hito, alTerminar: alTerminar, biografia: biografia,
  };
})();
