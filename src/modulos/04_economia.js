/* ==== módulo: economia ==== */
// La nueva economía del cine. El dinero sale de personas que compran entradas, no del tamaño del presupuesto:
//   Público(r) = Población(r) × Acceso(r) × Frecuencia(r)
//   Cuota(i)   = e^U(i) / (e^U0 + e^Uotras + Σ e^U(j))       (competencia real cada semana)
//   Entradas   = Público/52 × Temporada × Cuota;  Taquilla = Entradas × Precio de la entrada
//   U(s+1)     = U(s) − δ + β (Público − Expectativa)          (desgaste y boca a boca)
// Reemplaza la fórmula de la V15 que convertía presupuesto en taquilla (el dinero infinito).
IA.economia = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, M = IA.mundo;

  // ---------- Parámetros (el bot los revisa en cada versión) ----------
  const P = {
    AQ: 0.05,            // utilidad por punto de calidad percibida
    DELTA: 0.30,         // desgaste semanal de la novedad
    BETA: 0.008,         // fuerza del boca a boca por punto de diferencia
    ESTRELLAS: 0.55,     // utilidad por fama media de los protagonistas (0 a 1)
    LOCAL: 0.25,         // ventaja en la región de la sede del estudio
    TENDENCIA: 0.3,      // peso de la tendencia de la familia
    PARTICIPACION: 0.88, // parte del público posible que va al cine con una cartelera típica
    MULT_TIPICO: 1.85,   // bruto medio ÷ costo de una película típica (fija el presupuesto típico)
    U_TIPICA: -0.15,     // atractivo de estreno de una película típica de otras productoras
    CORTE: 0.025,        // la obra sale de cartelera bajo este % de su mejor semana
    MAX_SEMANAS: 30,
    ANIMO: 0.28,         // azar del ánimo del público en cada estreno
    IMPUESTO: 0.25,      // impuesto sobre utilidades
    ANTIMONOPOLIO: 0.35, // cuota que abre investigación
  };
  // Parte de la taquilla que recibe el estudio según la semana en cartelera (más alta al principio)
  function parteEstudio(semanaEnCartelera) {
    if (semanaEnCartelera <= 2) return 0.7;
    if (semanaEnCartelera <= 4) return 0.6;
    if (semanaEnCartelera <= 6) return 0.5;
    return 0.4;
  }
  // Grupos de edad: cuánto va al cine cada uno [niños, adolescentes, jóvenes, adultos, mayores]
  const PROPENSION = [0.9, 1.3, 1.4, 0.8, 0.45];
  // Películas que compiten por año en todo el mundo (las de los estudios simulados más las otras productoras)
  // En los primeros años se hacían miles de cortos; cada uno era una parte pequeña del mercado
  const PELICULAS_ANIO = [[1895, 200], [1900, 450], [1910, 900], [1920, 650], [1930, 480], [1940, 450], [1950, 400], [1960, 300], [1970, 250], [1980, 250], [1990, 280], [2000, 320], [2010, 350], [2020, 300], [2025, 320], [2050, 350], [2150, 350]];

  // ---------- Mercado del año (con caché) ----------
  const cache = { semilla: null, escenario: null, anio: {} };
  function datosAnio(anio) {
    const S = N.S;
    const sem = S ? S.semilla : '', esc = S ? S.escenario : '';
    if (cache.semilla !== sem || cache.escenario !== esc) { cache.semilla = sem; cache.escenario = esc; cache.anio = {}; }
    let d = cache.anio[anio];
    if (d) return d;
    d = { regiones: {}, mercado2025: 0, entradas: 0 };
    D.regiones.forEach(function (r) {
      const pub = M.publicoCine(r.id, anio);
      const precio2025 = M.precioEntrada2025(r.id, anio);
      const ed = M.edades(r.id, anio);
      let base = 0;
      for (let g = 0; g < 5; g++) base += ed[g] * PROPENSION[g];
      d.regiones[r.id] = { publico: pub, precio2025: precio2025, precio: M.aEpoca(precio2025, anio), edades: ed, baseEdad: base };
      d.mercado2025 += pub * precio2025;
      d.entradas += pub;
    });
    d.peliculas = N.interp(PELICULAS_ANIO, anio);
    // Presupuesto típico de la época (dólares de 2025): lo que puede pagar una película típica de ese mercado
    d.tipico2025 = Math.max(2000, d.mercado2025 * P.PARTICIPACION / d.peliculas / P.MULT_TIPICO);
    d.tipico = M.aEpoca(d.tipico2025, anio);
    cache.anio[anio] = d;
    return d;
  }
  function presupuestoTipico(anio) { return datosAnio(anio).tipico; }
  // Presupuesto típico suavizado (promedio de los últimos 6 años, en dólares del año): los sueldos y el
  // mantenimiento no saltan con cada auge o caída del mercado del cine.
  function tipicoSuavizado(anio) {
    let s = 0;
    for (let k = 0; k < 6; k++) s += presupuestoTipico2025(anio - k);
    return IA.mundo.aEpoca(s / 6, anio);
  }
  function presupuestoTipico2025(anio) { return datosAnio(anio).tipico2025; }
  // Reparto de una película típica: 55 % producción, 20 % talento, 25 % marketing
  function produccionTipica(anio, famId) {
    const fam = D.familia(famId);
    return presupuestoTipico(anio) * 0.55 * (fam ? fam.costo : 1);
  }
  function marketingTipico(anio) { return presupuestoTipico(anio) * 0.25; }

  // ---------- Talentos: tarifa de mercado ----------
  // Tarifa = Base(oficio) × IPC × (Habilidad/50)² × (1 + Fama)^1,5 × Demanda. La Demanda incluye el tamaño
  // del mercado de la época; nunca depende del presupuesto de tu obra (fallo 2 de la V15).
  // Demanda: las estrellas famosas y los talentos excepcionales están muy pedidos y cobran mucho más
  function demandaTalento(t) {
    const r = D.rasgos[t.rasgo];
    const excepcional = Math.max(0, (t.hab - 65) / 35);
    // V18: quien ya está en otros proyectos cobra más; el desmotivado, un poco menos
    const ocupado = 1 + 0.12 * (t.act || 0);
    const animo = t.mo !== undefined && t.mo < 35 ? 0.92 : 1;
    return (1 + 1.6 * t.fama * t.fama + 3 * excepcional * excepcional) * (r ? r[2] : 1) * ocupado * animo;
  }
  function tarifa(t, anio) {
    const of = D.oficio(t.of);
    const demanda = demandaTalento(t);
    const v = of.base * presupuestoTipico(anio) * Math.pow(Math.max(5, t.hab) / 50, 2) * Math.pow(1 + t.fama, 1.5) * demanda;
    return Math.max(10, Math.round(v));
  }

  // ---------- Calidad, crítica y público ----------
  // Q = Σ w(familia)·S + 6·log2(Presupuesto/Típico) + Encaje + Rasgos + ε
  function familiaPrincipal(obra) { return D.familiaDe[obra.gen[0]] || 'DR'; }
  function familiasDe(obra) {
    const out = [];
    obra.gen.forEach(function (g) { const f = D.familiaDe[g]; if (f && out.indexOf(f) < 0) out.push(f); });
    return out;
  }
  function encajeObra(obra) {
    const fams = obra.gen.map(function (g) { return D.familiaDe[g]; });
    let s = 0;
    for (let i = 0; i < fams.length; i++) {
      for (let j = i + 1; j < fams.length; j++) if (fams[i] !== fams[j]) s += D.encaje(fams[i], fams[j]);
    }
    return s;
  }
  // Habilidad de un departamento con la habilidad efectiva de cada talento en esta obra (afinidad con la familia,
  // especialidad, moral, cansancio y edad del personaje: V18)
  function habilidadDep(obra, dep, talentos, bonos) {
    const eq = obra.eq;
    const hab = function (t) { return IA.talentos.habilidadEn(t, obra, dep); };
    let h;
    if (dep === 'interprete') {
      const a = talentos(eq.int[0]), b = talentos(eq.int[1]);
      h = a && b ? hab(a) * 0.6 + hab(b) * 0.4 : a ? hab(a) : 35;
      // El resto del elenco contratado suma o resta según su nivel (hasta ±3)
      if (a && b && eq.int.length > 2) {
        let s = 0, n = 0;
        for (let i = 2; i < eq.int.length; i++) { const t = talentos(eq.int[i]); if (t) { s += hab(t); n++; } }
        if (n) h += N.limitar((s / n - 50) * 0.1, -3, 3);
      }
    } else {
      const t = talentos(eq[dep]);
      if (dep === 'vestuario' || dep === 'efectos' || dep === 'animacion') {
        // El diseñador de arte y tecnología está a cargo de estas áreas: con especialista o estudio externo,
        // su mano pesa un cuarto; sin ellos, se ocupa él solo y rinde un poco menos (V19-V20)
        const arte = talentos(eq.arte);
        const ha = arte ? IA.talentos.habilidadEn(arte, obra, 'arte') : 35;
        if (t) h = 0.75 * hab(t) + 0.25 * ha;
        else if (IA.rodaje.esExterno(obra, dep)) h = 0.75 * IA.rodaje.nivelExterno(obra, dep) + 0.25 * ha;
        else h = IA.rodaje.habilidadSinTalento(obra, dep, ha);
      } else h = t ? hab(t) : 35;
    }
    // Reparto del presupuesto, método, estilo, set, terreno y país (V19)
    return Math.min(100, h + (bonos[dep] || 0) + IA.rodaje.bonoDep(obra, dep));
  }
  // Calcula la calidad base sin azar (para mostrar estimaciones) y con azar al terminar la producción
  function calidadBase(obra, talentos, bonos) {
    const fam = D.familia(familiaPrincipal(obra));
    const anio = obra.anioPlan || N.anio();
    let q = 0;
    const pesos = IA.ideas.pesos(obra, fam); // prioridad y tipo de obra reparten el peso de los departamentos
    Object.keys(pesos).forEach(function (dep) { q += pesos[dep] * habilidadDep(obra, dep, talentos, bonos || {}); });
    // (las claves _crit y _pub de los bonos no son departamentos: se aplican en calificar)
    // Lo que cuesta la época, el formato o la animación no sube la calidad: solo el tamaño del presupuesto
    const tipica = produccionTipica(anio, fam.id) * escalaTono(obra) * IA.ideas.factorCosto(obra, anio);
    q += N.limitar(6 * Math.log2(Math.max(1, obra.pp) / tipica), -18, 12);
    q += encajeObra(obra);
    q += IA.ideas.ajusteCalidad(obra); // encaje de la idea, material, guion comprado, IA y personajes
    q += IA.talentos.quimica(obra); // amistades y rivalidades del equipo clave (V18)
    eachTalento(obra, talentos, function (t) { if (IA.talentos.ventajas(t).some(function (v) { return v.id === 'Mentor'; })) q += 0.5; });
    // Tres géneros sin un líder de 90 o más es un desastre
    if (obra.gen.length >= 3) {
      let mejor = 0;
      Object.keys(obra.eq).forEach(function (k) {
        const ids = Array.isArray(obra.eq[k]) ? obra.eq[k] : [obra.eq[k]];
        ids.forEach(function (id) { const t = talentos(id); if (t && t.hab > mejor) mejor = t.hab; });
      });
      if (mejor < 90) q -= 8;
    }
    // Rasgos del equipo (V15 TRA)
    let rq = 0;
    eachTalento(obra, talentos, function (t) { const r = D.rasgos[t.rasgo]; if (r) rq += r[0]; });
    q += rq / 3;
    return q;
  }
  function eachTalento(obra, talentos, fn) {
    Object.keys(obra.eq).forEach(function (k) {
      const ids = Array.isArray(obra.eq[k]) ? obra.eq[k] : [obra.eq[k]];
      ids.forEach(function (id) { const t = talentos(id); if (t) fn(t, k); });
    });
  }
  function escalaTono(obra) { const to = D.tonos.filter(function (x) { return x.id === obra.tono; })[0]; return to && to.costo ? to.costo : 1; }
  function famaEstrellas(obra, talentos) {
    const a = talentos(obra.eq.int[0]), b = talentos(obra.eq.int[1]);
    // La personalidad empuja la popularidad (Normal = 50 % es la referencia): Rockstar suma, Pretencioso resta
    const fp = function (t) { return t.fama * (1 + 0.3 * IA.talentos.impulso(t)); };
    let f = (a ? fp(a) * 0.6 : 0) + (b ? fp(b) * 0.4 : 0);
    // Invitados especiales y cameos (V17): su fama atrae público
    (obra.eq.inv || []).forEach(function (id) { const t = talentos(id); if (t) f += t.fama * 0.25; });
    (obra.eq.cam || []).forEach(function (id) { const t = talentos(id); if (t) f += t.fama * 0.1; });
    return Math.min(1.2, f);
  }
  function famaEstrellasRegion(obra, talentos, reg) {
    const a = talentos(obra.eq.int[0]), b = talentos(obra.eq.int[1]);
    const fp = function (t) { return IA.talentos.famaRegion(t, reg) * (1 + 0.3 * IA.talentos.impulso(t)); };
    let f = (a ? fp(a) * 0.6 : 0) + (b ? fp(b) * 0.4 : 0);
    (obra.eq.inv || []).forEach(function (id) { const t = talentos(id); if (t) f += IA.talentos.famaRegion(t, reg) * 0.25; });
    (obra.eq.cam || []).forEach(function (id) { const t = talentos(id); if (t) f += IA.talentos.famaRegion(t, reg) * 0.1; });
    return Math.min(1.2, f);
  }
  // Notas finales al terminar la posproducción (con el azar acotado de ±4)
  function calificar(obra, talentos, bonos) {
    const fam = D.familia(familiaPrincipal(obra));
    const to = D.tonos.filter(function (x) { return x.id === obra.tono; })[0] || { crit: 0, pub: 0 };
    let q = calidadBase(obra, talentos, bonos) + (N.azar() * 8 - 4);
    const r = IA.ideas.resultado(obra); // efectos aplaudidos o repudiados y el resultado de la IA (V17)
    q = N.limitar(q + r.q, 1, 99);
    const dir = talentos(obra.eq.direccion);
    const ex = IA.ideas.ajusteNotas(obra, obra.anioPlan || N.anio());
    // Ventajas ganadas con la experiencia: taquilleros y laureados (hasta +2 cada una)
    let vPub = 0, vCrit = 0;
    eachTalento(obra, talentos, function (t) { IA.talentos.ventajas(t).forEach(function (v) { if (v.id === 'Taquillero' || v.id === 'Regreso triunfal') vPub++; if (v.id === 'Laureado') vCrit++; }); });
    ex.pub += Math.min(2, vPub); ex.crit += Math.min(2, vCrit);
    // La belleza de los protagonistas pesa en el romance y la comedia
    const l1 = talentos(obra.eq.int[0]);
    if (l1 && l1.bel >= 80 && (fam.id === 'RD' || fam.id === 'HM')) ex.pub += 1;
    let crit = q + to.crit + (fam.inclina === 'crit' ? 3 : fam.inclina === 'pub' ? -2 : 0) + (dir && dir.hab >= 85 ? 2 : 0) + (N.azar() * 6 - 3) + ex.crit + r.crit;
    let pub = q + to.pub + (fam.inclina === 'pub' ? 3 : fam.inclina === 'crit' ? -3 : 0) + famaEstrellas(obra, talentos) * 4 + (N.azar() * 6 - 3) + ex.pub + r.pub;
    const esc = obra.pp / produccionTipica(obra.anioPlan || N.anio(), fam.id);
    if ((fam.id === 'AA' || fam.id === 'IM') && esc >= 1.8) pub += esc >= 3.5 ? 3 : 2; // efectos que el público disfruta
    // Visión y público objetivo del estudio (solo el jugador los tiene)
    if (bonos) { crit += bonos._crit || 0; pub += bonos._pub || 0; }
    // Lo que dejaron los dilemas e incidentes del rodaje (V19)
    q += obra.dq || 0; crit += (obra.dq || 0) + (obra.dcrit || 0); pub += (obra.dq || 0) + (obra.dpub || 0);
    obra.q = Math.round(q);
    obra.crit = Math.round(N.limitar(crit, 1, 99));
    obra.pub = Math.round(N.limitar(pub, 1, 99));
  }

  // ---------- Expectativa y marketing ----------
  // Conocimiento = 1 − Π(1 − Alcance de cada canal); Expectativa = Conocimiento × Deseo
  function canalesDe(anio) { return D.canales.filter(function (c) { return c.desde <= anio && c.hasta >= anio; }); }
  function alcanceMedio(anio) {
    const cs = canalesDe(anio);
    let p = 0, a = 0;
    cs.forEach(function (c) { p += c.peso; a += c.peso * c.alcance; });
    return p > 0 ? a / p : 0.8;
  }
  function conocimiento(obra, anio, famaEstudio, famaEst, bonoMarketing) {
    // V20: la cuenta regresiva y las promociones suman; la mezcla de canales hace rendir más (o menos) la campaña
    const base = N.limitar(0.06 + 0.25 * famaEstudio + 0.2 * famaEst + IA.ideas.bonoConocimiento(obra) + IA.estreno.bonoConocimiento(obra), 0.03, 0.65);
    const gasto = (obra.campana !== undefined ? obra.campana : obra.cm || 0) * (1 + (bonoMarketing || 0)) * IA.estreno.factorCampana(obra);
    const rel = gasto / Math.max(1, marketingTipico(anio));
    const resto = (1 - base) * Math.exp(-alcanceMedio(anio) * rel * 0.9);
    return N.limitar(1 - resto, 0.02, 0.995);
  }
  function deseo(obra, famaEst, tendencia) {
    const promesa = [0, 1, 2, 4, 6][obra.nivM || 0];
    return N.limitar(0.5 * obra.pub + 0.5 * 55 + promesa + famaEst * 8 + tendencia * 4, 1, 99);
  }

  // ---------- Atractivo por región (clasificación, edades, sede) ----------
  function accesoClasificacion(obra, reg, anio) {
    const d = datosAnio(anio).regiones[reg];
    const fam = D.familia(familiaPrincipal(obra));
    const cl = D.clasificacion(obra.clas) || D.clasificacion('PG-13');
    const ex = IA.ideas.edadesExtra(obra); // tipo de obra y público objetivo (V17)
    let s = 0;
    for (let g = 0; g < 5; g++) s += d.edades[g] * PROPENSION[g] * fam.edades[g] * cl.acceso[g] * cl.gusto[g] * (ex ? ex[g] : 1);
    return Math.max(0.02, s / d.baseEdad * IA.ideas.regionExtra(obra, reg, anio));
  }

  // ---------- Inicio del estreno ----------
  function iniciarCartelera(obra, ctx) {
    const anio = N.anio();
    const tend = N.S.mundo.tendencias[familiaPrincipal(obra)] || 0;
    const fe = famaEstrellas(obra, ctx.talento);
    obra.con = N.redondear(conocimiento(obra, anio, ctx.famaDe(obra.est), fe, ctx.bonoMarketingDe(obra.est)), 3);
    // El tráiler no siempre dice la verdad: la expectativa tiene su propio azar
    // La aprobación del público por la estrella principal (V18) también vende entradas
    const lider = ctx.talento(obra.eq.int[0]);
    const apr = lider && lider.apr !== undefined ? (lider.apr - 50) / 10 : 0;
    obra.des = Math.round(N.limitar(deseo(obra, fe, tend) + apr + (obra.ddes || 0) + IA.estreno.bonoDeseo(obra) + N.normal(0, 4), 1, 99));
    obra.crit = Math.round(N.limitar((obra.crit || 0) + IA.estreno.ajusteCritica(obra), 1, 99));
    // Parte de lo que gana esta obra que llegará por las ventanas (video, TV, streaming) y no por la taquilla
    obra.fv = N.redondear(IA.ventanas.parteVentanas(anio), 3);
    obra.exp = N.redondear(obra.con * obra.des / 100, 3);
    // El ánimo del público: algo que nadie controla hace que una obra prenda o no
    obra.animo = N.redondear(N.normal(0, P.ANIMO), 3);
    obra.u = N.redondear(P.AQ * (obra.des - 60) + Math.log(obra.con) + P.ESTRELLAS * fe + obra.animo, 4);
    // Fama por región (V18): las estrellas pesan más en su tierra y afuera según su alcance
    obra.feR = {};
    D.regiones.forEach(function (r) { obra.feR[r.id] = N.redondear(famaEstrellasRegion(obra, ctx.talento, r.id) - fe, 3); });
    obra.sc = 0; obra.bruto = obra.bruto || 0; obra.parte = obra.parte || 0; obra.ent = 0; obra.max = 0; obra.hs = [];
    obra.acc = {};
    D.regiones.forEach(function (r) { obra.acc[r.id] = N.redondear(accesoClasificacion(obra, r.id, anio), 4); });
    obra.delta = P.DELTA + (obra.fam === 'AA' ? 0.06 : obra.fam === 'DR' || obra.fam === 'AV' ? -0.06 : obra.fam === 'FJ' ? -0.04 : 0);
  }

  // ---------- Semana de cartelera ----------
  // Reparte el público de cada región entre las obras en cartelera, las otras productoras y quedarse en casa.
  function semanaCartelera(obras, ctx) {
    const S = N.S, anio = N.anio(), sem = N.semana();
    const da = datosAnio(anio);
    const tendencias = S.mundo.tendencias;
    // Otras productoras: las películas del mundo que no simulamos una por una
    const estrenosSim = Math.max(0, S.mercado.estrenos52 || 0);
    const otras = Math.max(da.peliculas * 0.3, da.peliculas - estrenosSim);
    const uTipica = P.U_TIPICA;
    const vidaTipica = 1 / (1 - Math.exp(-P.DELTA));
    const pesoOtras = otras * Math.exp(uTipica) * vidaTipica / 52;
    const pesoTipicoTotal = da.peliculas * Math.exp(uTipica) * vidaTipica / 52;
    const pesoCasa = pesoTipicoTotal * (1 / P.PARTICIPACION - 1) * (1 + 0.3 * M.ocioEnCasa(anio));
    const res = { bruto: 0, brutoOtras: 0, porEstudio: {}, entradas: 0 };
    D.regiones.forEach(function (r) {
      const dr = da.regiones[r.id];
      if (dr.publico <= 0) return;
      const mercado = dr.publico / 52 * M.temporada(r.id, sem);
      const pesos = [];
      let suma = pesoOtras + pesoCasa;
      // Las festividades reparten el público entre familias (cuánta gente va al cine ya lo da la temporada)
      let mediaFest = 0;
      D.familias.forEach(function (f) { mediaFest += M.bonoRegion(f.id, r.id, sem, anio); });
      mediaFest /= D.familias.length;
      for (let i = 0; i < obras.length; i++) {
        const o = obras[i];
        let u = o.u + Math.log(o.acc[r.id] || 0.02) + P.TENDENCIA * (tendencias[o.fam] || 0) + Math.log(M.bonoGenero(o.fam, sem));
        // Festividades y olas de la región (V20)
        u += Math.log(M.bonoRegion(o.fam, r.id, sem, anio) / mediaFest) + P.TENDENCIA * 0.6 * M.tendenciaRegion(r.id, o.fam);
        if (ctx.regionEstudio(o.est) === r.id) u += P.LOCAL;
        if (o.feR) u += P.ESTRELLAS * (o.feR[r.id] || 0);
        // Plan de estreno (V20): modo en la región, doblaje, cadenas con contrato y cines propios
        const w = Math.exp(u) * IA.estreno.factorRegion(o, r.id, o.sc);
        pesos.push(w);
        suma += w;
      }
      for (let i = 0; i < obras.length; i++) {
        const ent = mercado * pesos[i] / suma;
        const g = ent * dr.precio;
        const o = obras[i];
        o._g = (o._g || 0) + g;
        o._e = (o._e || 0) + ent;
        o._p = (o._p || 0) + g * Math.min(0.95, parteEstudio(o.sc + 1) + IA.estreno.parteExtra(o, r.id));
      }
      const gOtras = mercado * pesoOtras / suma * dr.precio;
      res.brutoOtras += gOtras;
    });
    for (let i = 0; i < obras.length; i++) {
      const o = obras[i];
      const g = o._g || 0, e = o._e || 0;
      // Desde que hay ventanas, una parte de lo que gana el estudio llega después (video, TV, streaming)
      const parte = (o._p || 0) * (1 - (o.fv || 0));
      delete o._g; delete o._e; delete o._p;
      o.sc += 1;
      o.bruto += g; o.parte += parte; o.ent += e;
      if (g > o.max) o.max = g;
      o.hs.push(Math.round(g));
      res.bruto += g;
      res.entradas += e;
      res.porEstudio[o.est] = (res.porEstudio[o.est] || 0) + g;
      ctx.cobrar(o, parte, g);
      // Boca a boca: si la obra decepciona frente a lo prometido cae rápido; si sorprende, dura
      o.u = N.redondear(o.u - o.delta + P.BETA * (o.pub - o.des), 4);
      const minimo = IA.estreno.semanasMinimas(o);
      if (o.sc >= P.MAX_SEMANAS || (o.sc >= Math.max(2, minimo) && g < o.max * P.CORTE) || (o.sc >= Math.max(1, minimo) && g < 1 && !esperaRegion(o))) ctx.terminar(o);
    }
    res.bruto += res.brutoOtras;
    return res;
  }

  // Una obra con estreno escalonado no se baja mientras espera llegar a alguna región
  function esperaRegion(o) {
    if (!o.plan || !o.plan.reg) return false;
    return Object.keys(o.plan.reg).some(function (r) { const m = IA.estreno.modo(o.plan.reg[r]); return m.espera && o.sc < m.espera; });
  }
  // ---------- Pronóstico (sin gastar azar): para la interfaz y el bot ----------
  // Con la región de la sede, sus temporadas y festividades pesan el doble (V20)
  function pronosticoSemana(semanaX, famId, regCasa) {
    const regs = D.regiones, anio = N.S ? N.anio() : 2000;
    let t = 0, w = 0;
    regs.forEach(function (r) { const k = r.id === regCasa ? 2 : 1; t += k * M.temporada(r.id, semanaX) * M.bonoRegion(famId, r.id, semanaX, anio); w += k; });
    return (t / w) * M.bonoGenero(famId, semanaX);
  }

  return {
    P: P, PROPENSION: PROPENSION, datosAnio: datosAnio, presupuestoTipico: presupuestoTipico, tipicoSuavizado: tipicoSuavizado,
    presupuestoTipico2025: presupuestoTipico2025, produccionTipica: produccionTipica, marketingTipico: marketingTipico,
    parteEstudio: parteEstudio, tarifa: tarifa, demanda: demandaTalento, familiaPrincipal: familiaPrincipal, familiasDe: familiasDe,
    encajeObra: encajeObra, calidadBase: calidadBase, calificar: calificar, famaEstrellas: famaEstrellas, habilidadDep: habilidadDep,
    canalesDe: canalesDe, conocimiento: conocimiento, deseo: deseo, accesoClasificacion: accesoClasificacion,
    iniciarCartelera: iniciarCartelera, semanaCartelera: semanaCartelera, pronosticoSemana: pronosticoSemana, alcanceMedio: alcanceMedio,
  };
})();
