/* ==== módulo: pruebas ==== */
// Bot de partidas: juega solo con tres estrategias (prudente, normal, agresiva), desde 1900 y desde 2000 hasta
// 2150 con semillas fijas, y revisa las metas de balance, los errores, el tiempo por semana y el tamaño del
// guardado. Desde la V17 crea sus obras con la fábrica de ideas (historia, personajes, material, guiones
// comprados, efectos e IA) y hay pruebas de reglas. Ninguna versión se entrega si el bot falla.
IA.pruebas = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, O = IA.obras, T = IA.talentos, L = IA.lanzamiento, NG = IA.negocio, X = IA.taxonomia;

  const ESTRATEGIAS = {
    prudente: { escala: [1, 2], marketing: 2, ambicion: 1.0, colchon: 1.7, construir: 8, pisos: 5 },
    normal: { escala: [2, 2], grande: 0.25, marketing: 2, ambicion: 1.1, colchon: 1.3, construir: 4, pisos: 9 },
    agresiva: { escala: [2, 3], marketing: 3, ambicion: 1.4, colchon: 1.2, construir: 3.5, pisos: 10 },
  };
  const ORDEN_PISOS = ['plato', 'guion', 'edicion', 'plato', 'sonido', 'efectos', 'casting', 'plato', 'marketing', 'archivo'];
  // Registro de cada obra al terminar (las métricas no dependen de lo que la compactación borra después)
  let registro = null;
  N.on('obraTerminada', function (o) {
    if (registro) registro.push({ est: o.est, mult: O.multiplicador(o), neto: O.neto(o), talento: O.costoTotal(o) > 0 ? (o.cf || 0) / O.costoTotal(o) : 0 });
  });
  const ORDEN_TERRENOS = ['backlot', 'foso', 'captura', 'backlot'];

  // ---------- Decisiones del bot ----------
  // Atractivo comercial de cada familia para el bot (las de crítica rinden menos en taquilla)
  const COMERCIAL = { AA: 0.2, IM: 0.2, SM: 0.05, DR: -0.1, HM: 0.1, FJ: 0.1, AV: -0.5, RD: 0 };
  function elegirFamilia(S) {
    const sem = N.semana(S.t + 20);
    let mejor = 'DR', valor = -9;
    D.ORDEN_FAM.forEach(function (f) {
      const v = (S.mundo.tendencias[f] || 0) + COMERCIAL[f] + 0.8 * (E.pronosticoSemana(sem, f) - 1) + N.azar() * 0.6;
      if (v > valor) { valor = v; mejor = f; }
    });
    return mejor;
  }
  function elegirGeneros(S) {
    const fam = D.familia(elegirFamilia(S));
    const gen = [N.elegir(fam.generos.filter(function (g) { return g !== 'Erótico'; }))];
    // Segundo género de una familia con buen encaje
    const buenas = D.ORDEN_FAM.filter(function (f) { return D.encaje(fam.id, f) >= 3; });
    if (buenas.length && N.probabilidad(0.6)) {
      const f2 = D.familia(N.elegir(buenas));
      const g2 = N.elegir(f2.generos.filter(function (g) { return g !== 'Erótico'; }));
      if (gen.indexOf(g2) < 0 && !O.validarGeneros(gen.concat([g2]))) gen.push(g2);
    }
    return gen;
  }
  function decidir(est) {
    const S = N.S, jug = S.estudios[0];
    const tipico = E.presupuestoTipico(N.anio());
    // 1. Estrenar lo que esté listo en la mejor semana próxima
    O.delEstudio(0, ['lista']).forEach(function (o) {
      if (o.prog) return;
      let nivM = est.marketing;
      while (nivM > 0 && NG.cajaLibre(0) < E.marketingTipico(N.anio()) * D.nivelesMarketing[nivM].mult * 1.2) nivM--;
      const t = L.mejorSemana(o, S.t + 1, S.t + 10);
      IA.juego.programarEstreno(o, t, nivM);
    });
    // Con la caja en rojo no se arriesga más: espera a que entren los ingresos
    if (S.semanasEnRojo > 0) return;
    // 2. Construir cuando sobra caja
    if (NG.cajaLibre(0) > tipico * est.construir) {
      if (jug.pisos.length < Math.min(est.pisos, D.MAX_PISOS)) {
        const sig = ORDEN_PISOS.filter(function (p, i) { return contar(jug.pisos, p) < contar(ORDEN_PISOS.slice(0, i + 1), p); })[0];
        if (sig && !NG.puedeConstruir('piso', sig) && NG.cajaLibre(0) - NG.costoConstruccion(NG.infoPiso(sig)) > tipico * est.construir) NG.construir('piso', sig);
      } else if (jug.terrenos.length < D.MAX_TERRENOS) {
        const sigT = ORDEN_TERRENOS.filter(function (p, i) { return contar(jug.terrenos, p) < contar(ORDEN_TERRENOS.slice(0, i + 1), p); })[0];
        if (sigT && !NG.puedeConstruir('terreno', sigT) && NG.cajaLibre(0) - NG.costoConstruccion(NG.infoTerreno(sigT)) > tipico * est.construir) NG.construir('terreno', sigT);
      }
    }
    // 3. Llenar la capacidad con obras nuevas
    let intentos = 3;
    while (intentos-- > 0 && O.enProduccion(0).length < NG.capacidad(0)) {
      const gen = elegirGeneros(S);
      let escala = N.entero(est.escala[0], est.escala[1]) + (est.grande && N.probabilidad(est.grande) ? 1 : 0);
      if (S.t < 52) escala = Math.min(escala, 2); // el primer año, sin superproducciones
      let b = null, costo = 0, ok = false;
      const tono = N.elegir(D.tonos).id;
      const idea = ideaDelBot(S, gen);
      // Si no alcanza, baja la escala y después la ambición del equipo
      [est.ambicion, 0.6].forEach(function (amb) {
        for (let e = escala; e >= 0 && !ok; e--) {
          b = O.borrador(0, Object.assign({ gen: idea.gen || gen, escala: e, tono: tono, completa: true }, idea.campos));
          O.equipoRecomendado(b, amb);
          detallar(b, idea, amb);
          costo = O.costoTalento(b) + b.pp + (b.derechos || 0) + E.marketingTipico(N.anio()) * D.nivelesMarketing[Math.min(2, est.marketing)].mult * 0.5;
          if (NG.cajaLibre(0) > costo * est.colchon) ok = true;
        }
      });
      if (!ok || !b) break;
      const r = IA.juego.iniciarObra(b);
      if (r.error) { if (registroErrores) registroErrores.push('El bot no pudo iniciar una obra en ' + N.anio() + ': ' + r.error); break; }
    }
  }
  function contar(lista, x) { let c = 0; lista.forEach(function (y) { if (y === x) c++; }); return c; }
  // La idea del bot (V17): a veces adapta un material, a veces produce un guion comprado, y si no, una idea propia
  function ideaDelBot(S, gen) {
    const anio = N.anio();
    const r = { campos: {} };
    if ((S.guionesPropios || []).length) {
      const g = S.guionesPropios[0];
      r.gen = g.idea.gen; r.guion = g;
      return r;
    }
    // Solo compra guiones o derechos con la caja holgada (nunca en los primeros años)
    const holgado = NG.cajaLibre(0) > E.presupuestoTipico(anio) * 4;
    const guiones = (S.guiones || []).filter(function (g) { return g.calif >= 70 && g.precio < NG.cajaLibre(0) * 0.05; });
    if (holgado && guiones.length && N.probabilidad(0.25)) {
      if (!IA.juego.comprarGuion(guiones[0].id)) { r.gen = guiones[0].idea.gen; r.guion = guiones[0]; return r; }
    }
    if (N.probabilidad(0.1)) {
      const libres = IA.ideas.materialesDisponibles(anio).filter(function (m) { return IA.ideas.esLibre(m, anio) || (holgado && IA.ideas.costoDerechos(m, anio) < NG.cajaLibre(0) * 0.03); });
      if (libres.length) { r.mat = N.elegir(libres).id; return r; }
    }
    return r;
  }
  // Completa la historia, los personajes y algunas decisiones del modo detallado
  function detallar(b, idea, amb) {
    const anio = N.anio();
    if (idea.mat) IA.ideas.usarMaterial(b, idea.mat, anio);
    if (idea.guion) {
      IA.ideas.aplicarIdea(b, idea.guion.idea);
      b.guionC = idea.guion.calif; b.guionId = idea.guion.id;
      if (T.disponible(T.porId(idea.guion.autor))) { b.eq.guion = idea.guion.autor; b.guionPagado = 1; }
    }
    if (!(b.prob && b.prob.length)) {
      const tit = b.tit, epo = b.epo;
      IA.ideas.recomendarHistoria(b, anio);
      if (idea.mat) { b.tit = tit; b.epo = epo; }
    }
    if (!b.arco) b.arco = IA.ideas.arcoRecomendado(b.fam);
    IA.ideas.generarPersonajes(b);
    const dir = T.porId(b.eq.direccion), arte = T.porId(b.eq.arte);
    // Efectos grandes solo si el equipo da la talla; IA solo si el equipo creativo es bueno
    // (un estudio bien llevado no se juega la caja en efectos grandes hasta tener colchón)
    const holgura = NG.cajaLibre(0) > E.presupuestoTipico(anio) * 5;
    if (holgura && (b.fam === 'AA' || b.fam === 'IM') && dir && arte && (dir.hab + arte.hab) / 2 >= 64 && N.probabilidad(0.4) && X.efectos[3].desde <= anio) b.fx = 3;
    if (anio >= IA.ideas.ANIO_IA && IA.ideas.equipoCreativo(b) >= 62 && N.probabilidad(0.3)) b.ia = N.entero(10, 40);
    if (N.probabilidad(0.2)) b.cx = N.entero(1, 4);
    if (N.probabilidad(0.2)) b.rit = N.entero(1, 4);
    O.recalcular(b);
    // Todo el elenco con nombre se contrata y se negocia (V18), ya con la clasificación final
    O.equipoNegociado(b, amb);
    O.recalcular(b);
    return b;
  }
  let registroErrores = null;

  // ---------- Revisión de errores (invariantes) ----------
  function revisar(errores) {
    const S = N.S;
    S.estudios.forEach(function (e) { if (!isFinite(e.caja)) errores.push('Caja no finita en ' + e.nombre + ' (' + N.anio() + ')'); });
    S.obras.forEach(function (o) {
      if (o.bruto !== undefined && !isFinite(o.bruto)) errores.push('Bruto no finito en obra ' + o.id);
      if (o.et === 'cartelera' && !isFinite(o.u)) errores.push('Atractivo no finito en obra ' + o.id);
    });
    if (!(IA.mundo.poblacionMundial(N.anio()) > 0)) errores.push('Población no positiva en ' + N.anio());
    // Reglas de la fábrica de ideas en las obras del jugador
    O.activas().forEach(function (o) {
      if (o.est !== 0 || !o.cont) return;
      if (IA.ideas.clasificar(o, o.anioPlan) !== o.clas) errores.push('La clasificación de «' + o.tit + '» no sale de su contenido');
      if (o.gen.indexOf('Erótico') >= 0 && ((o.pj || []).some(function (p) { return p.e < 18; }) || ['18', 'R', 'X'].indexOf(o.clas) < 0)) errores.push('Regla del Erótico rota en «' + o.tit + '»');
      if (IA.ideas.hayMenores(o) && o.cont.amor > 1) errores.push('Contenido no permitido con menores en «' + o.tit + '»');
      if (IA.ideas.hayNinos(o) && IA.taxonomia.ORDEN_CLAS.indexOf(o.clas) > 2) errores.push('Obra de más de PG-13 con niños en el elenco: «' + o.tit + '»');
    });
    if (errores.length > 50) errores.length = 50;
  }

  // ---------- Una partida completa ----------
  // op: { estrategia, desde, hasta, semilla, medirGuardado: fn(S) -> bytes (opcional) }
  function jugar(op) {
    const est = ESTRATEGIAS[op.estrategia];
    const errores = [];
    const reloj = typeof performance !== 'undefined' ? function () { return performance.now(); } : function () { return Date.now(); };
    registro = [];
    registroErrores = errores;
    IA.juego.nuevaPartida({ semilla: op.semilla, anio: op.desde, nombre: 'Bot ' + op.estrategia, bot: true });
    const S = N.S;
    const semanas = (op.hasta - op.desde) * 52;
    let peorSemana = 0, totalMs = 0, anioMs = 0, peorAnio = 0, guardado150 = null;
    const tiemposAnio = [];
    for (let i = 0; i < semanas; i++) {
      const a = reloj();
      try {
        decidir(est);
        IA.juego.avanzarSemana();
      } catch (e) {
        errores.push('Excepción en ' + N.anio() + ' S' + N.semana() + ': ' + (e && e.message ? e.message : e));
        if (errores.length > 5) break;
      }
      const dt = reloj() - a;
      totalMs += dt; anioMs += dt;
      if (dt > peorSemana) peorSemana = dt;
      if (S.t % 52 === 0) {
        tiemposAnio.push(anioMs);
        if (anioMs > peorAnio) peorAnio = anioMs;
        anioMs = 0;
        revisar(errores);
        if (op.medirGuardado && N.anio() - op.desde === 150) guardado150 = op.medirGuardado(S);
      }
      if (S.quiebra) {
        errores.push('Quiebra del bot en ' + S.quiebra.anio + ' (no es un error del juego, pero la estrategia no debería quebrar)');
        break;
      }
    }
    const guardadoFinal = op.medirGuardado ? op.medirGuardado(S) : null;
    registroErrores = null;
    return medir(op, errores, { msSemana: totalMs / Math.max(1, S.t), peorSemana: peorSemana, sAnio: (totalMs / Math.max(1, tiemposAnio.length)) / 1000, peorAnio: peorAnio / 1000, guardado150: guardado150, guardadoFinal: guardadoFinal });
  }
  function mediana(v) {
    if (!v.length) return 0;
    const s = v.slice().sort(function (a, b) { return a - b; });
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  // ---------- Metas de balance ----------
  function medir(op, errores, rend) {
    const S = N.S;
    const terminadas = (registro || []).filter(function (r) { return isFinite(r.mult) && r.mult > 0; });
    registro = null;
    const mults = terminadas.map(function (r) { return r.mult; });
    const pierden = terminadas.filter(function (r) { return r.neto < 0; }).length;
    const jug = terminadas.filter(function (r) { return r.est === 0; });
    const multJug = jug.map(function (r) { return r.mult; });
    const hist = S.fin.hist;
    // Crecimiento real de la caja (dólares de hoy): tasa anual compuesta entre el año 10 y el año 40 de la
    // partida, ya pasado el arranque (el primer decenio parte de casi nada y siempre da tasas enormes).
    function tasa(desdeK, hastaK) {
      if (hist.length <= hastaK) hastaK = hist.length - 1;
      if (hastaK - desdeK < 3) return 0;
      const c0 = desdeK < 0 ? Math.max(1, S.estudios[0].capital2025) : Math.max(1, hist[desdeK].caja2025);
      const c1 = Math.max(1, hist[hastaK].caja2025);
      return Math.pow(c1 / c0, 1 / (hastaK - desdeK)) - 1;
    }
    const crec30 = tasa(9, 39);
    const cuotas = hist.map(function (h) { return h.cuota; });
    const premios = IA.premios.parteJugador();
    const res = {
      estrategia: op.estrategia, desde: op.desde, hasta: op.hasta, semilla: op.semilla,
      obras: terminadas.length, obrasJugador: jug.length,
      multMediano: mediana(mults), sobre5: mults.filter(function (m) { return m > 5; }).length / Math.max(1, mults.length),
      pierden: pierden / Math.max(1, terminadas.length),
      multMedianoJugador: mediana(multJug),
      pierdenJugador: jug.filter(function (r) { return r.neto < 0; }).length / Math.max(1, jug.length),
      crecimiento30: crec30, crecimientoArranque: tasa(-1, 9), crecimientoTotal: tasa(9, hist.length - 1),
      crecimientoMediano: mediana(hist.slice(1).map(function (h, i) { return hist[i].caja2025 > 0 ? h.caja2025 / hist[i].caja2025 - 1 : 0; })),
      premiosJugador: premios.parte, premiosTotal: premios.total,
      aniosAMajor: S.majorDesde ? S.majorDesde - op.desde : null,
      cuotaMax: cuotas.length ? Math.max.apply(null, cuotas) : 0,
      cuotaMedia: cuotas.length ? cuotas.reduce(function (a, b) { return a + b; }, 0) / cuotas.length : 0,
      cajaFinal2025: hist.length ? hist[hist.length - 1].caja2025 : 0,
      investigaciones: S.investigaciones, quiebra: S.quiebra ? S.quiebra.anio : null,
      rescatesRivales: S.estudios.slice(1).reduce(function (a, e) { return a + e.rescates; }, 0),
      ideas: resumenIdeas(S),
      talentos: resumenTalentos(S, terminadas),
      errores: errores, rendimiento: rend,
    };
    return res;
  }
  const METAS = [
    { id: 'multMediano', nombre: 'Multiplicador mediano', objetivo: '×1,5 a ×2,5', ok: function (r) { return r.multMediano >= 1.5 && r.multMediano <= 2.5; }, ver: function (r) { return '×' + r.multMediano.toFixed(2); } },
    { id: 'sobre5', nombre: 'Obras sobre ×5', objetivo: '5 % o menos', ok: function (r) { return r.sobre5 <= 0.05; }, ver: function (r) { return pct(r.sobre5); } },
    { id: 'pierden', nombre: 'Obras que pierden', objetivo: '30 % a 45 %', ok: function (r) { return r.pierden >= 0.3 && r.pierden <= 0.45; }, ver: function (r) { return pct(r.pierden); } },
    { id: 'crecimiento30', nombre: 'Crecimiento real de la caja', objetivo: '5 % a 20 % al año', ok: function (r) { return r.crecimiento30 >= 0.05 && r.crecimiento30 <= 0.2; }, ver: function (r) { return pct(r.crecimiento30); } },
    { id: 'premiosJugador', nombre: 'Premios principales del jugador', objetivo: '30 % o menos', ok: function (r) { return r.premiosJugador <= 0.3; }, ver: function (r) { return pct(r.premiosJugador); } },
    { id: 'aniosAMajor', nombre: 'Años de independiente a major', objetivo: '15 a 30', ok: function (r) { return r.aniosAMajor !== null && r.aniosAMajor >= 15 && r.aniosAMajor <= 30; }, ver: function (r) { return r.aniosAMajor === null ? 'nunca' : String(r.aniosAMajor); } },
    { id: 'cuotaMax', nombre: 'Cuota de mercado', objetivo: 'menos de 35 %', ok: function (r) { return r.cuotaMax < 0.35; }, ver: function (r) { return pct(r.cuotaMax) + ' máx.'; } },
  ];
  function pct(x) { return (Math.round(x * 1000) / 10).toString().replace('.', ',') + ' %'; }
  // Talentos 2.0: parte del costo que se va en talento, estrellas raras y nadie perfecto
  function resumenTalentos(S, terminadas) {
    const vivos = S.talentos.filter(function (t) { return !t.ret && !t.mu; });
    return {
      parteTalento: mediana(terminadas.map(function (r) { return r.talento; })),
      sobre90: vivos.filter(function (t) { return t.hab >= 90; }).length / Math.max(1, vivos.length),
      perfectos: S.talentos.filter(function (t) { return t.hab >= 99 && t.cp && t.cp.every(function (x) { return x >= 99; }); }).length,
      vivos: vivos.length, ninos: vivos.filter(function (t) { return N.anio() - t.nac < 16; }).length,
      exclusivos: vivos.filter(function (t) { return T.exclusivoDe(t) !== null; }).length,
      relaciones: vivos.filter(function (t) { return t.rel && Object.keys(t.rel).length; }).length,
      parejas: vivos.filter(function (t) { return Object.keys(t.rel || {}).some(function (k) { const o = T.porId(+k); return o && T.tipoRelacion(t.rel[k], t, o) === 'pareja'; }); }).length,
      retiroMin: S.talentos.filter(function (t) { return t.ret && !t.mu; }).reduce(function (m, t) { return Math.min(m, t.ret - t.nac); }, 999),
    };
  }
  // Qué usó el bot de la fábrica de ideas (para el informe)
  function resumenIdeas(S) {
    const mias = S.obras.filter(function (o) { return o.est === 0; });
    const c = function (f) { return mias.filter(f).length; };
    return {
      obras: mias.length, material: c(function (o) { return o.mat; }), guion: c(function (o) { return o.guionC; }),
      ia: c(function (o) { return o.ia; }), efectos: c(function (o) { return o.fx >= 3; }),
      aplaudidos: c(function (o) { return o.fxr === 'aplaudidos'; }), repudiados: c(function (o) { return o.fxr === 'repudiados'; }),
      clasificaciones: mias.reduce(function (a, o) { a[o.clas] = (a[o.clas] || 0) + 1; return a; }, {}),
      adaptacionesRivales: S.obras.filter(function (o) { return o.est !== 0 && o.mat; }).length,
    };
  }

  // ---------- Pruebas de reglas (plan: clasificación, dominio público, Erótico, inflación y población) ----------
  function reglas() {
    const X = IA.taxonomia, I = IA.ideas, M = IA.mundo;
    const r = [];
    const prueba = function (nombre, ok, detalle) { r.push({ nombre: nombre, ok: !!ok, detalle: detalle || '' }); };
    const idea = function (gen, cont, extra) { return Object.assign({ gen: gen, cont: Object.assign({ violencia: 0, lenguaje: 0, amor: 0, consumo: 0, terror: 0 }, cont) }, extra || {}); };
    // Clasificación desde el contenido
    prueba('Contenido nulo da G', I.clasificar(idea(['Drama'], {}), 2000) === 'G');
    prueba('Violencia leve da PG', I.clasificar(idea(['Drama'], { violencia: 1 }), 2000) === 'PG');
    prueba('Violencia moderada da PG-13', I.clasificar(idea(['Acción'], { violencia: 2 }), 2000) === 'PG-13');
    prueba('Lenguaje rudo da 16', I.clasificar(idea(['Drama'], { lenguaje: 2 }), 2000) === '16');
    prueba('Amor candente da NC-17 (17 años)', I.clasificar(idea(['Romance'], { amor: 3 }), 2000) === 'NC-17');
    prueba('Violencia gráfica da 18', I.clasificar(idea(['Terror'], { violencia: 4 }), 2000) === '18');
    prueba('Violencia sangrienta da R', I.clasificar(idea(['Terror'], { violencia: 5 }), 2000) === 'R');
    prueba('Amor explícito da X', I.clasificar(idea(['Romance'], { amor: 4 }), 2000) === 'X');
    prueba('La parte más fuerte manda', I.clasificar(idea(['Drama'], { violencia: 1, lenguaje: 3, terror: 2 }), 2000) === 'NC-17');
    prueba('Contenido moderado puede ir como N', I.clasificar(idea(['Experimental'], { lenguaje: 1 }, { clasN: true }), 2000) === 'N');
    prueba('N no admite contenido fuerte', I.clasificar(idea(['Experimental'], { lenguaje: 2 }, { clasN: true }), 2000) === '16');
    prueba('Lo de adultos dice «siempre sugerido»', I.describirContenido(idea(['Drama'], { amor: 4 })).indexOf('explícito, siempre sugerido') >= 0);
    // Censura de la época
    const b1950 = idea(['Terror'], { violencia: 6, amor: 4 });
    I.normalizar(b1950, 1950);
    prueba('Antes de 1968 la censura limita a 16', b1950.clas === '16' && I.clasificar(b1950, 1950) === '16', b1950.clas);
    prueba('Gore sube la clasificación a R', (function () { const b = idea(['Terror'], {}, { sub: ['Gore'] }); I.normalizar(b, 2000); return b.clas === 'R'; })());
    // Regla del Erótico
    prueba('Erótico es siempre de adultos', ['18', 'R', 'X'].indexOf(I.clasificar(idea(['Erótico'], {}), 2000)) >= 0);
    prueba('Erótico no existe antes de 1968', !!O.validarGeneros(['Erótico'], 1960));
    prueba('Erótico nunca con familia y juventud', !!O.validarGeneros(['Erótico', 'Familiar'], 2000));
    prueba('Erótico nunca con públicos infantiles', !!I.validar(idea(['Erótico'], { amor: 3 }, { pubs: ['Adolescentes'] }), 2000));
    prueba('Erótico solo con personajes adultos', !!I.validar(idea(['Erótico'], { amor: 3 }, { pj: [{ n: 'A', e: 16, s: 'F', i: 'protagonista', a: 'Amante' }], prob: ['Amor'], arco: 'pozo', nat: 'f', tipo: 'real' }), 2000));
    prueba('Con menores el amor no pasa de romántico', (function () { const b = idea(['Drama'], { amor: 4 }, { pj: [{ n: 'A', e: 14, s: 'F', i: 'protagonista', a: 'Héroe' }] }); I.normalizar(b, 2000); return b.cont.amor <= 1; })());
    prueba('Con niños en el elenco la obra no pasa de PG-13', (function () { const b = idea(['Terror'], { violencia: 5, lenguaje: 4, terror: 4 }, { pj: [{ n: 'A', e: 12, s: 'M', i: 'protagonista', a: 'Héroe' }] }); I.normalizar(b, 2000); return IA.taxonomia.ORDEN_CLAS.indexOf(b.clas) <= 2; })());
    // Dominio público: vida del autor + 70
    const dracula = X.dominio.filter(function (m) { return m.tit === 'Drácula'; })[0];
    prueba('Drácula no es libre en 1982', !I.esLibre(dracula, 1982));
    prueba('Drácula es libre desde 1983', I.esLibre(dracula, 1983));
    prueba('Comprar los derechos antes de liberarse cuesta', I.costoDerechos(dracula, 1950) > 0 && I.costoDerechos(dracula, 1990) === 0);
    prueba('La Odisea es libre siempre', I.esLibre(X.dominio[0], 1850));
    prueba('Hay 82 obras de dominio público', X.dominio.length === 82, X.dominio.length);
    const libre = dracula.libre - 70 + 50;
    prueba('La regla es ajustable (vida + 50 libera antes)', (function () { const S = N.S, antes = S ? S.reglaDominio : 0; if (S) S.reglaDominio = 50; const ok = I.esLibre(dracula, libre) && !I.esLibre(dracula, libre - 1); if (S) S.reglaDominio = antes || 70; return ok; })());
    // Inflación y población contra las tablas del plan
    prueba('Inflación: ida y vuelta a dólares de hoy', Math.abs(M.aHoy(M.aEpoca(1000, 1930), 1930) - 1000) < 1);
    prueba('Inflación: un dólar de 1900 vale más de 25 de hoy', M.aHoy(1, 1900) > 25 && M.aHoy(1, 1900) < 45, M.aHoy(1, 1900).toFixed(1));
    const p = function (a) { return M.poblacionMundial(a) / 1e9; };
    prueba('Población 1900 ≈ 1.650 millones', Math.abs(p(1900) - 1.65) < 0.15, p(1900).toFixed(2));
    prueba('Población 2000 ≈ 6.150 millones', Math.abs(p(2000) - 6.15) < 0.3, p(2000).toFixed(2));
    prueba('Población 2024 ≈ 8.100 millones', Math.abs(p(2024) - 8.1) < 0.3, p(2024).toFixed(2));
    // Listas completas
    const cnt = X.contar();
    prueba('Listas completas: 227 temas, 85 subgéneros, 53 problemáticas, 34 ficciones', cnt.temas === 227 && cnt.subgeneros === 85 && cnt.problematicas === 53 && cnt.ficcion === 34, JSON.stringify(cnt));
    // ---------- Talentos 2.0 (V18) ----------
    if (N.S) {
      const S = N.S, vivos = S.talentos.filter(function (t) { return !t.ret; });
      prueba('Más de 1.000 talentos vivos', vivos.length >= 1000, vivos.length);
      prueba('Nadie tiene todo en 100', !S.talentos.some(function (t) { return t.cp && t.cp.every(function (x) { return x >= 95; }); }));
      const s90 = vivos.filter(function (t) { return t.hab >= 90; }).length / vivos.length;
      prueba('Un 90 o más es raro (3 % o menos)', s90 <= 0.03, (s90 * 100).toFixed(1) + ' %');
      const libre = vivos.filter(function (t) { return T.disponible(t, 0) && T.energia(t) === 100 && !t.act; })[0];
      if (libre) {
        const copia = JSON.parse(JSON.stringify(libre));
        T.ocupar([libre.id], S.t + 10);
        const tras = T.energia(libre), act = libre.act;
        libre.enT = S.t - 9; // dos meses después
        const recupera = T.energia(libre);
        Object.keys(copia).forEach(function (k) { libre[k] = copia[k]; });
        Object.keys(libre).forEach(function (k) { if (!(k in copia)) delete libre[k]; });
        prueba('Un cargo cuesta 20 de energía y se recuperan 10 al mes', tras === 80 && recupera === 100 && act === 1, tras + ' → ' + recupera);
      }
      const ocupadoX = vivos.filter(function (t) { return (t.act || 0) > T.MAX_PROYECTOS; }).length;
      prueba('Nadie trabaja en más de 2 proyectos a la vez', ocupadoX === 0, ocupadoX);
      prueba('Nadie se retira antes de los 70', !S.talentos.some(function (t) { return t.ret && !t.mu && t.ret - t.nac < 70; }));
      const nino = vivos.filter(function (t) { return N.anio() - t.nac < 16; })[0];
      if (nino) prueba('Los niños actores solo hacen obras hasta PG-13', nino.cmax <= 2 && T.negociar(nino, { est: 0, rol: 'interprete', imp: 'secundario', clas: 3 }).estado === 'rechaza');
      const estrella = vivos.filter(function (t) { return t.fama >= 0.8 && t.hab >= 70; })[0];
      if (estrella) { const f0 = S.estudios[0].fama; S.estudios[0].fama = 0.01; prueba('Una estrella rechaza a un estudio sin fama', T.negociar(estrella, { est: 0, rol: estrella.of }).estado === 'rechaza'); S.estudios[0].fama = f0; }
      prueba('Con porcentaje, el salario fijo baja', T.salarioCon(1000, 10) === 780 && T.salarioCon(1000, 0) === 1000);
      const x = vivos[0];
      prueba('El salario exclusivo sigue a la época (1,8 veces la tarifa)', T.salarioExclusivo(x) === Math.round(T.tarifa(x) * 1.8));
      const tr = E.tarifa(x, 1920), tr2 = E.tarifa(x, 2020);
      prueba('Las tarifas suben con la época, no con el presupuesto de la obra', tr2 > tr * 5, Math.round(tr) + ' → ' + Math.round(tr2));
      prueba('La academia no pasa de +5 por oficio', (function () { const t = { hab: 40, of: 'guion', ac: { guion: 5 }, af: [0, 0, 0, 0, 0, 0, 0, 0], en: 100, enT: S.t, act: 0 }; return /\+5/.test(T.puedeEstudiar(t, T.curso('taller'), 'guion')); })());
    }
    return r;
  }

  // Corre la batería completa: 3 estrategias × (1900 y 2000) hasta 2150
  function bateria(op) {
    const o = op || {};
    const res = [];
    const desde = o.desde || [1900, 2000];
    const estrategias = o.estrategias || ['prudente', 'normal', 'agresiva'];
    desde.forEach(function (d) {
      estrategias.forEach(function (e) {
        res.push(jugar({ estrategia: e, desde: d, hasta: o.hasta || 2150, semilla: (o.semilla || 'bot') + '-' + e + '-' + d, medirGuardado: o.medirGuardado }));
      });
    });
    return res;
  }

  return { ESTRATEGIAS: ESTRATEGIAS, METAS: METAS, decidir: decidir, jugar: jugar, bateria: bateria, pct: pct, mediana: mediana, reglas: reglas };
})();
