/* ==== módulo: juego ==== */
// Crea la partida y mueve el reloj: la semana es la unidad del juego (producciones, cartelera, ventas, dinero y
// noticias); cada mes, gastos fijos, decisiones de rivales y tendencias; cada año, impuestos, edades, retiros,
// nuevas generaciones y balance. El ritmo lo elige el jugador: +1 semana, +1 mes, hasta el próximo evento o
// automático.
IA.juego = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, M = IA.mundo, E = IA.economia, T = IA.talentos, O = IA.obras;
  const PR = IA.produccion, L = IA.lanzamiento, R = IA.rivales, PM = IA.premios, NG = IA.negocio;
  const ANIO_MIN = 1895, ANIO_MAX = 2100;
  // Los valores de tu documento (de $500 a $1 B) con pasos intermedios para que el recomendado sea justo
  const CAPITALES = [500, 1e3, 2.5e3, 5e3, 1e4, 2.5e4, 5e4, 1e5, 2.5e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 2.5e7, 5e7, 1e8, 2.5e8, 5e8, 1e9];
  const DIFICULTADES = [
    { id: 'facil', nombre: 'Fácil', rivales: -4 },
    { id: 'normal', nombre: 'Normal', rivales: 0 },
    { id: 'dificil', nombre: 'Difícil', rivales: 4 },
  ];
  let conectado = false;

  // Capital recomendado: el menor de la lista que alcance para unas 2,6 películas típicas de la época
  function capitalRecomendado(anio) {
    const meta = E.presupuestoTipico2025(anio) * 2.6;
    for (let i = 0; i < CAPITALES.length; i++) if (CAPITALES[i] >= meta) return CAPITALES[i];
    return CAPITALES[CAPITALES.length - 1];
  }
  function estadoBase(op) {
    return {
      v: IA.VERSION_GUARDADO, juego: 'INDUSTRY ART', semilla: String(op.semilla), rng: N.estadoNuevo(op.semilla),
      y0: op.anio, t: 0, sigId: 0, escenario: op.escenario || 'medio', dificultad: op.dificultad || 'normal',
      estudios: [], talentos: [], obras: [], premios: [], noticias: [], resumenAnios: {}, encajeVisto: {},
      mundo: { tendencias: {} },
      mercado: { fe52: [], anio: { total: 0, otras: 0, porEstudio: {} }, semana: null, hist: [], famMes: {} },
      fin: { mes: NG.libroVacio(), anio: NG.libroVacio(), meses: [], hist: [] },
      semanasEnRojo: 0, quiebra: null, majorDesde: null, investigaciones: 0,
      guiones: [], guionesPropios: [], usosMaterial: {}, reglaDominio: 70,
      avatar: null, creado: op.creado || '', bot: !!op.bot,
    };
  }
  // op: { semilla, anio, nombre, logo, pais, capital (dólares de hoy), dificultad, escenario, avatar, personalidad, tipo, vision, publico }
  function nuevaPartida(op) {
    const anio = N.limitar(Math.round(op.anio || 1900), ANIO_MIN, ANIO_MAX);
    op.anio = anio;
    if (!op.semilla) op.semilla = String(Date.now() % 1e9);
    const S = estadoBase(op);
    N.S = S;
    conectar();
    S.mundo.tendencias = M.tendenciasIniciales();
    const pais = D.pais(op.pais || 'us') || D.pais('us');
    const capital2025 = op.capital || capitalRecomendado(anio);
    S.estudios.push({
      id: 0, jugador: true, nombre: (op.nombre || 'INDUSTRY ART').slice(0, 40), logo: op.logo || { s: 8, c: 6, b: 14, t: 3, f: 1 },
      pais: pais.id, reg: pais.region, caja: Math.round(M.aEpoca(capital2025, anio)), capital2025: capital2025,
      fama: 0.05, pisos: ['oficinas', 'plato'], terrenos: [], valorObras: 0.9, tam: 1,
      tipo: op.tipo || 'Estudio', industria: 'Cine', vision: op.vision || 'Alcance Comercial', publico: op.publico || 'General',
      personalidad: op.personalidad || 'Normal', ingAnio: 0, gasAnio: 0, util: 0, clase: 'C',
    });
    const dif = DIFICULTADES.filter(function (d) { return d.id === S.dificultad; })[0] || DIFICULTADES[1];
    R.crearEstudios();
    for (let i = 1; i < S.estudios.length; i++) S.estudios[i].calidad += dif.rivales;
    T.generarInicial();
    const av = op.avatar || {};
    const esp = (av.especialidades || ['produccion', 'direccion', 'guion']).filter(function (x, i, a) { return D.oficio(x) && a.indexOf(x) === i; }).slice(0, 3);
    S.avatar = { nom: (av.nombre || 'Felipe').slice(0, 30), sx: av.sexo || 'M', nac: anio - (av.edad || 30), id: 999999, esp: esp };
    const vis = D.visiones.filter(function (v) { return v.id === S.estudios[0].vision; })[0];
    if (vis && vis.fama) S.estudios[0].fama = N.redondear(S.estudios[0].fama + vis.fama, 3);
    O.reindexar();
    noticia({ tipo: 'estudio', texto: 'Nace ' + S.estudios[0].nombre + ' en ' + pais.nombre + '. ' + M.era(anio) + '.', importante: true });
    // El mundo no arranca vacío: los rivales ya tienen obras en marcha y hay guiones en venta
    R.mensual(NG.contextoDe(1));
    IA.ideas.renovarGuiones();
    N.emit('partidaNueva', S);
    return S;
  }
  // Conecta los avisos de los módulos con la partida (una sola vez)
  function conectar() {
    if (conectado) return;
    conectado = true;
    N.on('noticia', noticia);
    N.on('aviso', function (a) { noticia({ tipo: a.tipo, texto: a.texto, importante: true }); });
    N.on('obraLista', function (o) {
      if (o.est !== 0) R.alQuedarLista(o, NG.contextoDe(o.est));
    });
    N.on('estreno', function (o) {
      const m = N.S.mercado;
      m.famMes[o.fam] = (m.famMes[o.fam] || 0) + 1;
      if (o.est === 0) noticia({ tipo: 'estreno', texto: N.S.avatar.nom + ' presenta «' + o.tit + '»: llega a los cines.' });
    });
    N.on('obraTerminada', function (o) {
      if (o.est === 0) noticia({ tipo: 'resultado', texto: '«' + o.tit + '» deja la cartelera con {$} de taquilla.', monto: o.bruto, importante: true });
    });
    N.on('premios', function (r) {
      const p = r.categorias.filter(function (c) { return c.id === 'pelicula'; })[0];
      if (p) noticia({ tipo: 'premios', texto: D.premios.nombre + ' ' + (r.anio + 1) + ': «' + p.ganador.titulo + '» de ' + N.S.estudios[p.ganador.est].nombre + ' gana Mejor película.', importante: p.ganador.est === 0 });
    });
  }
  function noticia(n) {
    const S = N.S;
    if (!S) return;
    S.noticias.unshift({ t: S.t, tipo: n.tipo || 'mundo', texto: n.texto, monto: n.monto, imp: n.importante ? 1 : 0 });
    if (S.noticias.length > 150) S.noticias.length = 150;
  }
  // Inicia una obra del jugador desde un borrador (valida capacidad y caja)
  function puedeIniciar(b) {
    const S = N.S;
    const gen = O.validarGeneros(b.gen);
    if (gen) return gen;
    const idea = IA.ideas.validar(b, N.anio());
    if (idea) return idea;
    if (O.clasificacionesDisponibles(N.anio(), b.gen).indexOf(b.clas) < 0) return 'Esa clasificación no está disponible en ' + N.anio() + '.';
    if (!O.equipoCompleto(b)) return 'Falta completar el equipo.';
    const ocupados = O.idsEquipo(b).filter(function (id) { return !T.disponible(T.porId(id), 0); });
    if (ocupados.length) { const t = T.porId(ocupados[0]); return (t ? t.nom : 'Alguien del equipo') + ' ya no está disponible.'; }
    // Negociación (V18): nadie firma si rechaza, si no se cumplen sus exigencias o si pidió un porcentaje
    const neg = O.negociaciones(b).filter(function (n) { return !n.ok; })[0];
    if (neg) {
      const t = T.porId(neg.id), nom = t ? t.nom : 'Alguien';
      if (neg.r.estado === 'contraoferta') return nom + ' ' + neg.r.texto.charAt(0).toLowerCase() + neg.r.texto.slice(1) + ': ponle ese porcentaje en su contrato.';
      if (neg.r.estado === 'exige') return nom + ': ' + neg.r.texto.toLowerCase() + '.';
      return nom + ' no firma: ' + neg.r.texto.toLowerCase() + '.';
    }
    if (O.enProduccion(0).length >= NG.capacidad(0)) return 'No tienes capacidad: construye un plató o espera a que termine un proyecto.';
    const costo = O.costoTalento(b) + (b.derechos || 0);
    if (S.estudios[0].caja < costo) return b.derechos ? 'No alcanza la caja para los contratos y los derechos.' : 'No alcanza la caja para los contratos.';
    return '';
  }
  function iniciarObra(b) {
    const err = puedeIniciar(b);
    if (err) return { error: err };
    IA.ideas.marcarEncaje(b);
    if (b.derechos) NG.pagar(0, 'derechos', b.derechos);
    if (b.mat) IA.ideas.registrarUso(b.mat, N.anio());
    // Un guion propio se usa una sola vez
    if (b.guionId) N.S.guionesPropios = (N.S.guionesPropios || []).filter(function (g) { return g.id !== b.guionId; });
    const o = PR.iniciar(b, NG.contextoDe(0));
    noticia({ tipo: 'estudio', texto: 'Empieza el desarrollo de «' + o.tit + '».' + (b.mat ? ' Basada en «' + IA.taxonomia.material(b.mat).tit + '».' : '') });
    return { obra: o };
  }
  // ---------- Talentos (V18): exclusivos, academia, promesas y contratar en una obra en marcha ----------
  function firmarExclusivo(id, anios) {
    const t = T.porId(id);
    const err = T.puedeExclusivo(t, 0);
    if (err) return err;
    if (N.S.estudios[0].caja < T.salarioExclusivo(t) / 12) return 'No alcanza la caja para el primer mes.';
    T.firmarExclusivo(t, 0, anios);
    noticia({ tipo: 'talento', texto: t.nom + ' firma un contrato exclusivo con ' + N.S.estudios[0].nombre + ' por ' + anios + ' año' + (anios > 1 ? 's' : '') + '.', importante: t.fama > 0.4 });
    return '';
  }
  // Liberar a un talento de la exclusividad de un rival: se le paga lo que falta del contrato por 1,3
  function comprarExclusividad(id) {
    const t = T.porId(id), ex = t ? T.exclusivoDe(t) : null;
    if (ex === null || ex === 0) return 'No tiene contrato exclusivo con un rival.';
    const costo = T.costoLiberar(t);
    if (N.S.estudios[0].caja < costo) return 'No alcanza la caja.';
    NG.pagar(0, 'exclusivos', costo);
    NG.cobrarEn(ex, 'taquilla', costo);
    const rival = N.S.estudios[ex].nombre;
    delete t.ex; delete t.exH; delete t.exS;
    noticia({ tipo: 'talento', texto: 'Compras la exclusividad de ' + t.nom + ' a ' + rival + '.' });
    return '';
  }
  function cancelarExclusivo(id) {
    const t = T.porId(id);
    if (!t || T.exclusivoDe(t) !== 0) return 'No es exclusivo de tu estudio.';
    delete t.ex; delete t.exH; delete t.exS;
    T.cambiarMoral(t, -10);
    return '';
  }
  // Estudiar: un talento (beca pagada por ti) o tu avatar ('avatar')
  function estudiar(id, cursoId, area) {
    const c = T.curso(cursoId);
    if (!c) return 'Ese curso no existe.';
    const S = N.S;
    if (id === 'avatar') {
      const av = S.avatar;
      av.ac = av.ac || {};
      if (av.es && av.es.fin > S.t) return 'Ya estás estudiando.';
      if ((av.ac[area] || 0) >= T.MAX_ACADEMIA) return 'Ya ganaste los +5 que se pueden estudiar en ese oficio.';
      const costo = Math.round(E.presupuestoTipico(N.anio()) * 0.0006 * c.costo);
      if (S.estudios[0].caja < costo) return 'No alcanza la caja.';
      NG.pagar(0, 'academia', costo);
      av.es = { c: c.id, a: area, fin: S.t + c.semanas };
      return '';
    }
    const t = T.porId(id);
    const err = T.puedeEstudiar(t, c, area);
    if (err) return err;
    const costo = T.costoCurso(t, c, area);
    if (S.estudios[0].caja < costo) return 'No alcanza la caja.';
    NG.pagar(0, 'academia', costo);
    T.inscribir(t, c, area, true);
    return '';
  }
  const ESPERA_PROMESAS = 26;
  function costoPromesas() { return Math.round(E.presupuestoTipico(N.anio()) * 0.02); }
  function buscarPromesas(of) {
    const S = N.S;
    if (S.tPromesas && S.t - S.tPromesas < ESPERA_PROMESAS) return { error: 'Tus cazatalentos vuelven a buscar en ' + (ESPERA_PROMESAS - (S.t - S.tPromesas)) + ' semanas.' };
    const costo = costoPromesas();
    if (S.estudios[0].caja < costo) return { error: 'No alcanza la caja.' };
    NG.pagar(0, 'academia', costo);
    S.tPromesas = S.t;
    const nuevos = T.descubrir(of);
    noticia({ tipo: 'talento', texto: 'Tus cazatalentos descubren ' + nuevos.length + ' promesas: ' + nuevos.map(function (t) { return t.nom; }).join(', ') + '.' });
    return { talentos: nuevos };
  }
  // Contratar desde la ficha para una obra en desarrollo o preproducción (rol: oficio o 'interprete' con importancia)
  function contratarEnObra(obraId, id, rol, imp) {
    const o = O.porId(obraId), t = T.porId(id);
    if (!o || o.est !== 0 || ['desarrollo', 'preproduccion'].indexOf(o.et) < 0) return 'Solo se puede sumar gente antes del rodaje.';
    if (!t) return 'Ese talento no existe.';
    if (O.idsEquipo(o).indexOf(id) >= 0) return t.nom + ' ya está en «' + o.tit + '».';
    const c = { rol: rol, imp: imp };
    const r = T.negociar(t, Object.assign({ est: 0, rol: rol, imp: imp, clas: Math.max(0, IA.taxonomia.ORDEN_CLAS.indexOf(o.clas)), dir: T.porId(o.eq.direccion) ? T.porId(o.eq.direccion).hab : undefined, amor: o.cont ? o.cont.amor : 0 }, c));
    if (r.estado === 'rechaza' || r.estado === 'exige') return t.nom + ': ' + r.texto.toLowerCase() + '.';
    const pct = r.estado === 'contraoferta' ? r.pctMin : 0;
    // Cada papel cobra su parte: secundario la mitad, invitado 40 %, cameo 15 %
    const parte = rol !== 'interprete' || imp === 'protagonista' ? 1 : imp === 'secundario' ? O.PARTE_SECUNDARIO : imp === 'invitado' ? O.PARTE_INVITADO : O.PARTE_CAMEO;
    const fee = Math.round(T.salarioCon(T.tarifaPara(t, 0), pct) * parte);
    if (N.S.estudios[0].caja < fee) return 'No alcanza la caja.';
    const previo = rol !== 'interprete' ? o.eq[rol] : null;
    if (rol !== 'interprete') o.eq[rol] = id;
    else if (imp === 'invitado') o.eq.inv = (o.eq.inv || []).concat([id]);
    else if (imp === 'cameo') o.eq.cam = (o.eq.cam || []).concat([id]);
    else {
      o.eq.int = (o.eq.int || []).concat([id]);
      if (o.pj) o.pj.push({ n: IA.ideas.nombrePersonaje(IA.ideas.regionDe(o), t.sx), e: N.anio() - t.nac, s: t.sx, i: imp || 'secundario', a: (t.pap && t.pap[0]) || 'Aliado', t: id });
    }
    if (o.pj && (imp === 'invitado' || imp === 'cameo')) o.pj.push({ n: t.nom, e: N.anio() - t.nac, s: t.sx, i: imp, a: (t.pap && t.pap[0]) || 'Testigo', t: id });
    if (pct) { o.pctT = o.pctT || {}; o.pctT[id] = pct; }
    if (previo !== null && previo !== undefined) T.liberar([previo]);
    T.ocupar([id], N.S.t + IA.produccion.semanasRestantes(o));
    NG.pagar(0, 'talento', fee);
    T.pagarA(id, fee);
    o.cf = Math.round((o.cf || 0) + fee);
    o.cr = O.creditosDe ? O.creditosDe(o) : o.cr;
    noticia({ tipo: 'estudio', texto: t.nom + ' se suma a «' + o.tit + '».' });
    return '';
  }
  // Comprar un guion ya escrito: se paga ahora y queda en tus guiones hasta que lo produzcas
  function comprarGuion(id) {
    const S = N.S;
    const g = (S.guiones || []).filter(function (x) { return x.id === id; })[0];
    if (!g) return 'Ese guion ya no está en venta.';
    if (S.estudios[0].caja < g.precio) return 'No alcanza la caja para comprar el guion.';
    NG.pagar(0, 'derechos', g.precio);
    S.guiones = S.guiones.filter(function (x) { return x.id !== id; });
    S.guionesPropios = S.guionesPropios || [];
    S.guionesPropios.push(g);
    noticia({ tipo: 'estudio', texto: 'Compras el guion «' + g.idea.tit + '», de ' + g.nomAutor + '.' });
    return '';
  }
  function programarEstreno(o, t, nivM) {
    if (o.et !== 'lista' || o.est !== 0) return 'La obra no está lista.';
    if (o.prog) return 'La obra ya tiene fecha de estreno.';
    const cm = E.marketingTipico(N.anio(t)) * D.nivelesMarketing[nivM].mult;
    if (N.S.estudios[0].caja < cm) return 'No alcanza la caja para esa campaña.';
    L.programar(o, t, nivM, NG.contexto());
    return '';
  }

  // ---------- El reloj ----------
  function avanzarSemana() {
    const S = N.S;
    if (!S || S.quiebra) return null;
    const ctx = NG.contexto();
    const antes = { caja: S.estudios[0].caja, t: S.t };
    PR.semana(ctx);
    L.semana(ctx);
    NG.semana();
    const ceremonia = PM.semana();
    academia();
    S.t++;
    const nuevoAnio = S.t % 52 === 0;
    if (N.mes(S.t) !== N.mes(S.t - 1) || nuevoAnio) {
      NG.mensual();
      const fm = S.mercado.famMes;
      let tot = 0;
      Object.keys(fm).forEach(function (k) { tot += fm[k]; });
      M.actualizarTendencias(fm, tot);
      S.mercado.famMes = {};
      R.mensual(NG.contextoDe(1));
      T.mensual(NG.contexto()); // salarios de los contratos exclusivos
      // Cada tres meses llegan guiones nuevos al mercado
      if (N.mes(S.t) % 3 === 0) IA.ideas.renovarGuiones();
    }
    if (nuevoAnio) {
      const cerrado = N.anio() - 1;
      NG.anual(cerrado);
      R.anual();
      T.anual();
      T.exclusivosRivales();
      O.compactar();
      D.cronologia.forEach(function (c) { if (c[0] === N.anio()) noticia({ tipo: 'historia', texto: c[1], importante: true }); });
      if (S.fin.hist.length) N.emit('finAnio', S.fin.hist[S.fin.hist.length - 1]);
    }
    const r = { caja: S.estudios[0].caja - antes.caja, ceremonia: ceremonia, nuevoAnio: nuevoAnio };
    N.emit('semana', r);
    return r;
  }
  // Graduaciones de la academia (tus becados y tu avatar salen en el periódico)
  function academia() {
    const S = N.S;
    T.semanaAcademia().forEach(function (g) {
      if (!g.r.beca) return;
      const area = g.r.area.indexOf('fam:') === 0 ? D.familia(g.r.area.slice(4)).nombre.toLowerCase() : D.oficio(g.r.area).nombre.toLowerCase();
      noticia({ tipo: 'talento', texto: g.t.nom + ' termina «' + g.r.curso.nombre + '» en ' + area + (g.r.delta < 0 ? ' y cambia de oficio' : ': +' + g.r.delta) + '.', importante: true });
    });
    const av = S.avatar;
    if (av && av.es && av.es.fin <= S.t) {
      const c = T.curso(av.es.c);
      av.ac = av.ac || {};
      const d = Math.min(N.entero(c.gana[0], c.gana[1]), T.MAX_ACADEMIA - (av.ac[av.es.a] || 0));
      av.ac[av.es.a] = (av.ac[av.es.a] || 0) + Math.max(0, d);
      noticia({ tipo: 'estudio', texto: 'Te gradúas de «' + c.nombre + '» en ' + D.oficio(av.es.a).nombre.toLowerCase() + ': +' + Math.max(0, d) + ' en tus obras.', importante: true });
      delete av.es;
    }
  }
  // ¿Esta semana pasa algo que el jugador quiere ver? (para "hasta el próximo evento")
  function hayEvento() {
    const S = N.S;
    if (S.quiebra) return 'quiebra';
    const listas = O.activas().filter(function (o) { return o.est === 0 && o.et === 'lista' && !o.prog; });
    if (listas.length) return 'lista';
    if (O.activas().some(function (o) { return o.est === 0 && o.et === 'lista' && o.prog && o.fe === S.t; })) return 'estreno';
    if (N.semana() === 1) return 'anio';
    return '';
  }
  // Avanza: 'semana', 'mes', 'evento' (máximo un año) o un número de semanas. Devuelve el resumen del período.
  function avanzar(modo) {
    const S = N.S;
    const caja0 = S.estudios[0].caja, t0 = S.t;
    const ing0 = NG.total(S.fin.anio, 'ing'), gas0 = NG.total(S.fin.anio, 'gas');
    let n = 0, motivo = '';
    const tope = modo === 'semana' ? 1 : modo === 'mes' ? 4 : typeof modo === 'number' ? modo : 52;
    let ingAcum = 0, gasAcum = 0;
    while (n < tope) {
      const anioAntes = N.anio();
      const ingA = NG.total(S.fin.anio, 'ing'), gasA = NG.total(S.fin.anio, 'gas');
      const rs = avanzarSemana();
      n++;
      const huboCeremonia = !!(rs && rs.ceremonia);
      if (N.anio() !== anioAntes) {
        const h = S.fin.hist[S.fin.hist.length - 1];
        ingAcum += h ? h.ing - ingA : 0;
        gasAcum += h ? h.gas - gasA : 0;
      } else {
        ingAcum += NG.total(S.fin.anio, 'ing') - ingA;
        gasAcum += NG.total(S.fin.anio, 'gas') - gasA;
      }
      if (modo === 'mes' && N.mes(S.t) !== N.mes(t0) && n >= 3) break;
      if (S.quiebra) { motivo = 'quiebra'; break; }
      if (huboCeremonia) { motivo = 'premios'; if (modo === 'evento' || modo === 'semana') break; }
      if (modo === 'evento') { motivo = hayEvento(); if (motivo) break; }
    }
    void ing0; void gas0;
    return { semanas: n, desde: t0, hasta: S.t, caja: S.estudios[0].caja - caja0, ingresos: ingAcum, gastos: gasAcum, motivo: motivo };
  }

  return {
    ANIO_MIN: ANIO_MIN, ANIO_MAX: ANIO_MAX, CAPITALES: CAPITALES, DIFICULTADES: DIFICULTADES,
    capitalRecomendado: capitalRecomendado, nuevaPartida: nuevaPartida, conectar: conectar, noticia: noticia,
    puedeIniciar: puedeIniciar, iniciarObra: iniciarObra, programarEstreno: programarEstreno, comprarGuion: comprarGuion,
    firmarExclusivo: firmarExclusivo, comprarExclusividad: comprarExclusividad, cancelarExclusivo: cancelarExclusivo, estudiar: estudiar,
    buscarPromesas: buscarPromesas, costoPromesas: costoPromesas, contratarEnObra: contratarEnObra, ESPERA_PROMESAS: ESPERA_PROMESAS,
    avanzarSemana: avanzarSemana, avanzar: avanzar, hayEvento: hayEvento,
  };
})();
