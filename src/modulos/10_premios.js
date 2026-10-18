/* ==== módulo: premios ==== */
// Premios y festivales. Premiaciones de cine en su semana del circuito anual (Quimera con categorías por
// cargo, Independientes, Bastard, Pop y los Premios Nacionales de tu país): cada una mira las obras del año
// anterior y tiene su jurado (talentos, crítica, academia o público). Festivales en sus fechas: 18 continentales
// (tres por continente) y el Festival Mundial del Arte, con convocatoria, inscripción, selección oficial
// (nominados), ganadores y subasta de derechos con puja automática. Compiten las obras reales de todos los
// estudios. Campañas de premios, invitaciones con fecha límite y rumores del circuito.
ART.premios = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, T = ART.talentos;
  const tip = function () { return ART.economia.presupuestoTipico(N.anio()); };

  // ---------- Premiaciones ----------
  // jurado: academia (crítica con algo de público), critica, publico, talentos (el oficio del equipo)
  const GALAS = [
    { id: 'quimera', nombre: 'Premios Quimera', sem: 11, desde: 1929, jurado: 'academia', cats: null },
    { id: 'indep', nombre: 'Premios Independientes', sem: 2, desde: 1985, jurado: 'critica', cats: [['pelicula', 'Mejor película independiente'], ['direccion', 'Mejor dirección independiente'], ['guion', 'Mejor guion independiente']], filtro: 'indie' },
    { id: 'bastard', nombre: 'Bastard Awards', sem: 4, desde: 1980, jurado: 'peor', cats: [['pelicula', 'Peor película'], ['direccion', 'Peor dirección'], ['actuacion', 'Peor actuación']] },
    { id: 'nacional', nombre: 'Premios Nacionales', sem: 15, desde: 1950, jurado: 'talentos', cats: [['pelicula', 'Mejor película nacional'], ['direccion', 'Mejor dirección nacional']], filtro: 'pais' },
    { id: 'pop', nombre: 'Pop Awards', sem: 38, desde: 1975, jurado: 'publico', cats: [['pelicula', 'Película más popular'], ['actriz', 'Actriz favorita'], ['actor', 'Actor favorito']] },
  ];
  function gala(id) { return GALAS.filter(function (g) { return g.id === id; })[0]; }
  function nombreGala(g) { return g.id === 'nacional' ? 'Premios Nacionales de ' + D.pais(N.S.estudios[0].pais).nombre : g.nombre; }
  function candidatas(anio) {
    return N.S.obras.filter(function (o) { return o.anio === anio && (o.et === 'terminada' || o.et === 'cartelera') && o.crit && o.eq; });
  }
  function hab(id) { const t = id !== undefined && id !== null ? T.porId(id) : null; return t ? t.hab : 50; }
  // Puntaje de una obra en una categoría según el jurado (más la campaña de premios y el gusto del año)
  function puntaje(g, cat, o, gusto) {
    let base;
    if (g.jurado === 'publico') base = o.pub * 0.8 + Math.min(20, Math.log10(1 + (o.ent || 0)) * 2);
    else if (g.jurado === 'critica') base = o.crit;
    else if (g.jurado === 'talentos') base = o.crit * 0.5 + (hab(o.eq.direccion) + hab(o.eq.guion) + hab(o.eq.int && o.eq.int[0])) / 6;
    else if (g.jurado === 'peor') base = 100 - (o.crit * 0.7 + o.pub * 0.3);
    else base = o.crit * 0.75 + o.pub * 0.25;
    const c = D.premios.categorias.filter(function (x) { return x.id === cat; })[0];
    if (cat === 'direccion') base = base * 0.8 + hab(o.eq.direccion) * 0.2;
    else if (cat === 'guion') base = base * 0.8 + hab(o.eq.guion) * 0.2;
    else if (c && c.rol) base = base * 0.4 + hab(o.eq[c.rol]) * 0.6;
    const camp = (N.S.campanias || {})[o.id];
    const extra = camp && camp.indexOf(g.id) >= 0 ? 4 : 0;
    return base + extra + (gusto === o.fam ? 5 : 0) + N.normal(0, 4);
  }
  function categoriasDe(g, anio) {
    if (g.cats) return g.cats.map(function (c) { return { id: c[0], nombre: c[1] }; });
    return D.premios.categorias.filter(function (c) { return !c.desde || anio >= c.desde; });
  }
  function celebrar(g) {
    const S = N.S, anio = N.anio() - 1;
    let lista = candidatas(anio);
    if (g.filtro === 'indie') lista = lista.filter(function (o) { return ART.obras.costoTotal(o) < ART.economia.presupuestoTipico(anio) * 0.8; });
    if (g.filtro === 'pais') { const reg = S.estudios[0].reg; lista = lista.filter(function (o) { return S.estudios[o.est].reg === reg; }); }
    if (lista.length < 3) return null;
    const gusto = N.elegir(D.ORDEN_FAM);
    const res = { gala: g.id, nombre: nombreGala(g), anio: anio, categorias: [], gusto: gusto };
    categoriasDe(g, anio).forEach(function (c) {
      let pool;
      if (c.id === 'actriz' || c.id === 'actor' || c.id === 'actuacion') {
        pool = [];
        lista.forEach(function (o) {
          const sxs = (o.cr && o.cr.sx) || [];
          for (let k = 0; k < sxs.length; k++) if (c.id === 'actuacion' || sxs[k] === (c.id === 'actriz' ? 'F' : 'M')) {
            const id = o.eq.int[k];
            pool.push({ o: o, k: k, nombre: o.cr.reparto[k], s: puntaje(g, 'interp', o, gusto) * 0.5 + hab(id) * (g.jurado === 'peor' ? -0.5 : 0.5) + (g.jurado === 'peor' ? 50 : 0) });
            break;
          }
        });
      } else if (c.id === 'animada') {
        pool = lista.filter(function (o) { return o.tipo === 'animacion' || o.tipo === 'hibrido'; }).map(function (o) { return { o: o, s: puntaje(g, 'pelicula', o, gusto) }; });
      } else pool = lista.map(function (o) { return { o: o, s: puntaje(g, c.id, o, gusto) }; });
      pool.sort(function (a, b) { return b.s - a.s; });
      const nominados = pool.slice(0, 5);
      if (nominados.length < 2) return;
      const ga = nominados[0];
      const quien = ga.nombre || (c.id === 'direccion' ? ga.o.cr.direccion : c.id === 'guion' ? ga.o.cr.guion : '');
      let idT = null;
      if (c.id === 'direccion') idT = ga.o.eq.direccion; else if (c.id === 'guion') idT = ga.o.eq.guion; else if (ga.k !== undefined) idT = ga.o.eq.int[ga.k];
      else { const cc = D.premios.categorias.filter(function (x) { return x.id === c.id; })[0]; if (cc && cc.rol) idT = ga.o.eq[cc.rol]; }
      const est = S.estudios[ga.o.est];
      const t = idT !== null && idT !== undefined ? T.porId(idT) : null;
      if (g.id === 'quimera') {
        ga.o.aw = ga.o.aw || []; ga.o.aw.push(c.id);
        nominados.forEach(function (n) { n.o.nom = (n.o.nom || 0) + 1; });
        est.fama = N.redondear(N.limitar(est.fama + (c.id === 'pelicula' ? 0.05 : D.premios.principales.indexOf(c.id) >= 0 ? 0.02 : 0.008) * (1 - est.fama), 0, 1), 3);
        if (t) { t.fama = N.redondear(N.limitar(t.fama + 0.12, 0, 1), 3); t.premios++; }
      } else if (g.id === 'bastard') {
        // Los peores: hunden la fama… o vuelven la obra de culto
        est.fama = N.redondear(N.limitar(est.fama - 0.01, 0.01, 1), 3);
        if (N.probabilidad(0.25)) ga.o.culto = 1;
      } else {
        est.fama = N.redondear(N.limitar(est.fama + 0.01 * (1 - est.fama), 0, 1), 3);
        if (t) t.fama = N.redondear(N.limitar(t.fama + 0.03, 0, 1), 3);
      }
      if (g.id !== 'quimera') { ga.o.galas = ga.o.galas || []; ga.o.galas.push({ g: g.id, c: c.id }); }
      res.categorias.push({ id: c.id, nombre: c.nombre, ganador: { obra: ga.o.id, titulo: ga.o.tit, est: ga.o.est, quien: quien, tid: idT },
        nominados: nominados.map(function (n) { return { obra: n.o.id, titulo: n.o.tit, est: n.o.est, quien: n.nombre || '' }; }) });
    });
    if (!res.categorias.length) return null;
    if (g.id === 'quimera') { S.premios.push(res); if (S.premios.length > 400) S.premios.shift(); }
    S.galas = S.galas || [];
    S.galas.push(res);
    if (S.galas.length > 300) S.galas.shift();
    N.emit('premios', res);
    return res;
  }
  // Compatibilidad: la ceremonia de los Quimera
  function ceremonia() { return celebrar(GALAS[0]); }

  // Campañas de premios: desde 10 semanas antes de una gala, para una obra estrenada el año anterior
  function costoCampania() { return Math.round(tip() * 0.04); }
  function campania(obraId, galaId) {
    const S = N.S, o = ART.obras.porId(obraId), g = gala(galaId);
    if (!o || o.est !== 0 || !g) return 'No se puede.';
    if (o.anio !== N.anio() - 1) return 'Solo las obras estrenadas el año pasado compiten este año.';
    if (S.estudios[0].caja < costoCampania()) return 'No alcanza la caja.';
    S.campanias = S.campanias || {};
    const l = S.campanias[o.id] = S.campanias[o.id] || [];
    if (l.indexOf(g.id) >= 0) return 'Ya tiene campaña para esa gala.';
    ART.negocio.pagar(0, 'marketing', costoCampania());
    l.push(g.id);
    return '';
  }

  // ---------- Festivales ----------
  // prestigio 1 a 3 (3 = circuito mayor); conv: abierta o cerrada (por invitación); gen: familias preferidas;
  // jurado; premio mayor
  const FESTIVALES = {
    riviera: { premio: 'Hoja de Oro', prestigio: 3, conv: 'cerrada', gen: ['DR', 'AV'], jurado: 'critica', costo: 0.01 },
    laguna: { premio: 'Grifo de Oro', prestigio: 3, conv: 'cerrada', gen: ['DR', 'AV'], jurado: 'academia', costo: 0.01 },
    spree: { premio: 'Lobo de Oro', prestigio: 3, conv: 'abierta', gen: ['DR', 'SM'], jurado: 'critica', costo: 0.008 },
    lagos: { premio: 'Golden Block', prestigio: 2, conv: 'abierta', gen: ['DR', 'HM'], jurado: 'publico', costo: 0.006 },
    montana: { premio: 'Crystal Block', prestigio: 2, conv: 'abierta', gen: ['AV', 'DR'], jurado: 'critica', costo: 0.004 },
    altiplano: { premio: 'Águila de Oro', prestigio: 1, conv: 'abierta', gen: ['SM', 'IM'], jurado: 'publico', costo: 0.003 },
    atlantico: { premio: 'Estrella de Mar', prestigio: 2, conv: 'abierta', gen: ['DR', 'RD'], jurado: 'academia', costo: 0.004 },
    caribe: { premio: 'Mujer Dorada', prestigio: 1, conv: 'abierta', gen: ['RD', 'HM'], jurado: 'publico', costo: 0.003 },
    sierra: { premio: 'Araucaria de Oro', prestigio: 1, conv: 'abierta', gen: ['DR', 'AV'], jurado: 'talentos', costo: 0.003 },
    atlas: { premio: 'Monolito Estrella', prestigio: 1, conv: 'abierta', gen: ['DR', 'FJ'], jurado: 'talentos', costo: 0.002 },
    desierto: { premio: 'Escarabajo de Oro', prestigio: 2, conv: 'abierta', gen: ['DR', 'AV'], jurado: 'critica', costo: 0.003 },
    delta: { premio: 'Corcel de Oro', prestigio: 2, conv: 'abierta', gen: ['DR', 'HM'], jurado: 'academia', costo: 0.003 },
    solnaciente: { premio: 'Grulla de Oro', prestigio: 2, conv: 'abierta', gen: ['IM', 'AA'], jurado: 'academia', costo: 0.005 },
    yangtse: { premio: 'Copa de Jade', prestigio: 2, conv: 'abierta', gen: ['DR', 'AA'], jurado: 'talentos', costo: 0.004 },
    puerto: { premio: 'Ola de Oro', prestigio: 1, conv: 'abierta', gen: ['SM', 'AV'], jurado: 'critica', costo: 0.003 },
    bahia: { premio: 'Ancla de Oro', prestigio: 1, conv: 'abierta', gen: ['DR', 'FJ'], jurado: 'publico', costo: 0.003 },
    nube: { premio: 'The Sign Maori', prestigio: 1, conv: 'abierta', gen: ['IM', 'FJ'], jurado: 'talentos', costo: 0.002 },
    volcan: { premio: 'Volcán de Oro', prestigio: 1, conv: 'abierta', gen: ['SM', 'AA'], jurado: 'critica', costo: 0.002 },
    mundial: { premio: 'Gran Premio Mundial del Arte', prestigio: 3, conv: 'cerrada', gen: ['DR', 'IM', 'AV'], jurado: 'academia', costo: 0.012 },
  };
  const PREMIOS_FEST = [['mayor', null], ['direccion', 'Mejor dirección'], ['interp', 'Mejor interpretación']];
  // Festivales de este año con su semana del juego
  function festivalesAnio(anio) {
    return ART.cal.circuitoAnio(anio).filter(function (x) { return x.tipo === 'festival' && FESTIVALES[x.id]; }).map(function (x) {
      const f = FESTIVALES[x.id];
      return Object.assign({ id: x.id, nombre: x.nombre, reg: x.reg, sem: ART.cal.semanaDeDia(x.ini), ini: x.ini }, f);
    });
  }
  function festival(id, anio) { return festivalesAnio(anio || N.anio()).filter(function (f) { return f.id === id; })[0]; }
  function tFest(f) { return (N.anio() - N.S.y0) * 52 + f.sem - 1; }
  // Rumor del circuito: lo que busca el jurado este año (una familia más)
  function rumor(f, anio) { return D.ORDEN_FAM[N.hash(f.id + '|' + anio) % D.ORDEN_FAM.length]; }
  function estado(id) { const S = N.S; S.fest = S.fest || {}; const e = S.fest[id]; return e && e.anio === N.anio() ? e : (S.fest[id] = { anio: N.anio(), post: [], fase: 'convocatoria' }); }
  function costoInscripcion(f) { return Math.round(tip() * f.costo); }
  function invitado(f, o) { return o.prueba ? o.prueba.p >= 70 : (o.crit || 0) >= 70 || N.S.estudios[0].fama >= 0.35; }
  function puedePostular(id, obraId) {
    const f = festival(id), o = ART.obras.porId(obraId), S = N.S;
    if (!f || !o || o.est !== 0) return 'No se puede.';
    if (o.et !== 'lista' || o.prog) return 'Solo obras listas y sin fecha de estreno.';
    if (o.fest) return 'Ya está inscrita en un festival.';
    if (S.t > tFest(f) - 3) return 'La convocatoria ya cerró.';
    if (f.conv === 'cerrada' && !invitado(f, o)) return 'Convocatoria cerrada: necesitas invitación (obra de 70 o más, o prestigio 35).';
    if (S.estudios[0].caja < costoInscripcion(f)) return 'No alcanza la caja.';
    return '';
  }
  // Inscribir bloquea el estreno hasta que termine el festival
  function postular(id, obraId) {
    const e = puedePostular(id, obraId);
    if (e) return e;
    const f = festival(id), o = ART.obras.porId(obraId);
    ART.negocio.pagar(0, 'marketing', costoInscripcion(f));
    estado(id).post.push(o.id);
    o.fest = { id: id, hasta: tFest(f) + 1 };
    return '';
  }
  // Invitaciones: los festivales cerrados invitan a tus obras listas buenas, con fecha límite
  function invitaciones() {
    const S = N.S, out = [];
    festivalesAnio(N.anio()).forEach(function (f) {
      if (f.conv !== 'cerrada' || S.t > tFest(f) - 3 || tFest(f) - S.t > 12) return;
      ART.obras.delEstudio(0, ['lista']).forEach(function (o) { if (!o.prog && !o.fest && invitado(f, o)) out.push({ f: f, o: o, limite: tFest(f) - 3 }); });
    });
    return out;
  }
  function puntajeFest(f, o, gusto) {
    let b = f.jurado === 'publico' ? o.pub : f.jurado === 'critica' ? o.crit : f.jurado === 'talentos' ? (o.crit + hab(o.eq && o.eq.direccion)) / 2 : o.crit * 0.75 + o.pub * 0.25;
    if (f.gen.indexOf(o.fam) >= 0) b += 4;
    if (gusto === o.fam) b += 4;
    return b + N.normal(0, 4);
  }
  // Entradas de otras productoras (títulos inventados) para completar la selección
  function obraAjena(f, anio) {
    const fam = N.elegir(f.gen);
    return { tit: ART.obras.tituloNuevo([N.elegir(D.familia(fam).generos)]), fam: fam, crit: Math.round(N.limitar(N.normal(66 + f.prestigio * 3, 8), 40, 95)), pub: Math.round(N.limitar(N.normal(60, 10), 30, 92)), ajena: 1, anio: anio };
  }
  function seleccionar(f) {
    const S = N.S, e = estado(f.id), gusto = rumor(f, N.anio());
    const pool = [];
    e.post.forEach(function (id) { const o = ART.obras.porId(id); if (o) { if (o.pub === undefined || o.crit === undefined) ART.economia.calificar(o, T.porId, ART.negocio.bonos(0, o.fam, o)); pool.push(o); } });
    // Obras rivales recientes o listas de su región
    S.obras.forEach(function (o) {
      if (o.est === 0 || !o.crit) return;
      const reciente = o.et === 'lista' || (o.et === 'cartelera' && o.sc <= 6) || (o.et === 'terminada' && o.fe > S.t - 26);
      if (reciente && (o.crit >= 58 + f.prestigio * 3) && (f.reg.length > 1 || S.estudios[o.est].reg === f.reg[0] || N.probabilidad(0.3))) pool.push(o);
    });
    while (pool.length < 10) pool.push(obraAjena(f, N.anio()));
    pool.forEach(function (o) { o._fs = puntajeFest(f, o, gusto); });
    pool.sort(function (a, b) { return b._fs - a._fs; });
    e.sel = pool.slice(0, 8).map(function (o) { return { obra: o.id || null, tit: o.tit, est: o.est !== undefined ? o.est : -1, fam: o.fam, s: o._fs, crit: o.crit, pub: o.pub }; });
    pool.forEach(function (o) { delete o._fs; });
    e.fase = 'seleccion';
    e.post.forEach(function (id) {
      const o = ART.obras.porId(id);
      if (!o) return;
      const dentro = e.sel.some(function (x) { return x.obra === id; });
      N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» ' + (dentro ? 'entra en la selección oficial de ' : 'no entra en la selección de ') + f.nombre + '.', importante: dentro });
      if (dentro) o.ddes = (o.ddes || 0) + f.prestigio;
    });
  }
  function premiar(f) {
    const S = N.S, e = estado(f.id);
    if (!e.sel) seleccionar(f);
    e.gan = {};
    const orden = e.sel.slice().sort(function (a, b) { return b.s - a.s; });
    const resto = orden.slice(1).map(function (x) { return { x: x, s: x.s + N.normal(0, 3) }; }).sort(function (a, b) { return b.s - a.s; });
    const elegidos = { mayor: orden[0], direccion: resto[0] && resto[0].x, interp: resto[1] ? resto[1].x : resto[0] && resto[0].x };
    PREMIOS_FEST.forEach(function (p, i) {
      const c = elegidos[p[0]];
      if (!c) return;
      e.gan[p[0]] = { tit: c.tit, est: c.est, obra: c.obra, nombre: p[1] || f.premio };
      const o = c.obra ? ART.obras.porId(c.obra) : null;
      if (o) {
        o.galas = o.galas || [];
        o.galas.push({ g: f.id, c: p[0] });
        const est = S.estudios[o.est];
        est.fama = N.redondear(N.limitar(est.fama + (i === 0 ? 0.01 * f.prestigio : 0.004 * f.prestigio) * (1 - est.fama), 0, 1), 3);
        if (o.et === 'lista') o.ddes = (o.ddes || 0) + (i === 0 ? 2 + f.prestigio : 1);
        if (o.est === 0) N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» gana ' + (p[1] || f.premio) + ' en ' + f.nombre + '.', importante: true });
      }
    });
    e.fase = 'ganadores';
    S.palmares = S.palmares || [];
    S.palmares.push({ f: f.id, nombre: f.nombre, anio: N.anio(), gan: e.gan });
    if (S.palmares.length > 400) S.palmares.shift();
    // Subasta de derechos de dos obras de otras productoras de la selección (o nuevas)
    const ajenas = e.sel.filter(function (x) { return x.est === -1; }).slice(0, 2);
    e.lotes = ajenas.map(function (x) {
      const base = Math.round(tip() * (0.08 + (x.crit - 50) / 200) * (0.6 + f.prestigio * 0.25));
      return { id: N.sigId(), tit: x.tit, fam: x.fam, crit: x.crit, pub: x.pub, base: Math.max(1, base), max: 0, rival: Math.round(base * (0.9 + N.azar() * 0.9)) };
    });
    e.finSub = S.t + 2;
    // Termina el bloqueo de estreno de las obras inscritas
    e.post.forEach(function (id) { const o = ART.obras.porId(id); if (o) delete o.fest; });
    N.emit('festival', { f: f, e: e });
  }
  // Puja automática: el jugador fija su máximo; al cerrar, gana si supera al rival (y paga un paso más que él)
  function pujar(festId, loteId, max) {
    const e = estado(festId), l = (e.lotes || []).filter(function (x) { return x.id === loteId; })[0];
    if (!l) return 'Ese lote ya no está.';
    if (e.fase !== 'ganadores' || N.S.t >= e.finSub) return 'La subasta ya cerró.';
    if (max < l.base) return 'La puja mínima es ' + l.base + '.';
    if (N.S.estudios[0].caja < max) return 'No alcanza la caja para ese máximo.';
    l.max = Math.round(max);
    return '';
  }
  function cerrarSubasta(f) {
    const S = N.S, e = estado(f.id);
    (e.lotes || []).forEach(function (l) {
      if (l.max && l.max >= l.rival && S.estudios[0].caja >= Math.min(l.max, Math.round(l.rival * 1.05))) {
        const precio = Math.max(l.base, Math.min(l.max, Math.round(l.rival * 1.05)));
        ART.negocio.pagar(0, 'derechos', precio);
        adquirir(l, precio, f);
        l.gano = 1;
      } else if (l.max) N.emit('noticia', { tipo: 'estudio', texto: 'Pierdes la subasta de «' + l.tit + '» en ' + f.nombre + '.' });
    });
    e.fase = 'cerrado';
  }
  // La obra comprada entra a tu catálogo lista para estrenar (la hicieron otros: su equipo no queda ocupado)
  function adquirir(l, precio, f) {
    const O = ART.obras;
    const gen = [N.elegir(D.familia(l.fam).generos)];
    const b = O.borrador(0, { gen: gen, escala: 1, completa: true });
    O.equipoRecomendado(b, 0.6);
    b.tit = l.tit;
    const o = O.crear(b);
    o.adq = { f: f.id, precio: precio };
    o.cf = precio; o.pp = 0; o.gp = 0; o.sobre = 1;
    ART.economia.calificar(o, T.porId, {});
    o.crit = l.crit; o.pub = l.pub;
    o.et = 'lista';
    o.tLista = N.S.t;
    N.emit('noticia', { tipo: 'estudio', texto: 'Compras los derechos de «' + l.tit + '» en ' + f.nombre + ': lista para estrenar.', importante: true });
    N.emit('obraLista', o);
    return o;
  }

  // ---------- Cada semana ----------
  function semana() {
    const S = N.S, sem = N.semana();
    let res = null;
    GALAS.forEach(function (g) { if (g.sem === sem && N.anio() >= g.desde) { const r = celebrar(g); if (g.id === 'quimera') res = r; } });
    festivalesAnio(N.anio()).forEach(function (f) {
      const tf = tFest(f), e = estado(f.id);
      if (S.t === tf - 1 && e.fase === 'convocatoria') seleccionar(f);
      if (S.t === tf && e.fase !== 'ganadores' && e.fase !== 'cerrado') premiar(f);
      if (e.fase === 'ganadores' && S.t >= e.finSub) cerrarSubasta(f);
    });
    return res;
  }
  // Parte de los premios principales (Quimera, 5 categorías) que ganó el jugador (meta: 30 % o menos)
  function parteJugador(desdeAnio) {
    let total = 0, jug = 0;
    N.S.premios.forEach(function (r) {
      if (desdeAnio && r.anio < desdeAnio) return;
      r.categorias.forEach(function (c) { if (D.premios.principales.indexOf(c.id) < 0) return; total++; if (c.ganador.est === 0) jug++; });
    });
    return { total: total, jugador: jug, parte: total ? jug / total : 0 };
  }
  // Nombre legible de un premio guardado en una obra
  function nombrePremio(x) {
    const g = gala(x.g);
    if (g) { const c = categoriasDe(g, 2100).filter(function (y) { return y.id === x.c; })[0]; return nombreGala(g) + ': ' + (c ? c.nombre : x.c); }
    const f = FESTIVALES[x.g];
    if (f) { const n = (ART.cal.CIRCUITO.filter(function (c) { return c[0] === x.g; })[0] || [0, x.g])[1]; return n + ': ' + (x.c === 'mayor' ? f.premio : x.c === 'direccion' ? 'Mejor dirección' : 'Mejor interpretación'); }
    return x.g;
  }

  return {
    GALAS: GALAS, FESTIVALES: FESTIVALES, gala: gala, nombreGala: nombreGala, categoriasDe: categoriasDe, celebrar: celebrar, ceremonia: ceremonia,
    costoCampania: costoCampania, campania: campania, festivalesAnio: festivalesAnio, festival: festival, tFest: tFest, rumor: rumor, estado: estado,
    costoInscripcion: costoInscripcion, puedePostular: puedePostular, postular: postular, invitaciones: invitaciones, pujar: pujar,
    semana: semana, parteJugador: parteJugador, nombrePremio: nombrePremio,
  };
})();
