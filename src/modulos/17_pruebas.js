/* ==== módulo: pruebas ==== */
// Bot de partidas: juega solo con tres estrategias (prudente, normal, agresiva), desde 1900 y desde 2000 hasta
// 2150 con semillas fijas, y revisa las metas de balance, los errores, el tiempo por semana y el tamaño del
// guardado. Ninguna versión se entrega si el bot falla. Usa solo la API del juego, nunca la pantalla.
IA.pruebas = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, O = IA.obras, T = IA.talentos, L = IA.lanzamiento, NG = IA.negocio;

  const ESTRATEGIAS = {
    prudente: { escala: [1, 2], marketing: 2, ambicion: 1.0, colchon: 1.7, construir: 8, pisos: 5 },
    normal: { escala: [2, 2], grande: 0.25, marketing: 2, ambicion: 1.1, colchon: 1.3, construir: 4, pisos: 9 },
    agresiva: { escala: [2, 3], marketing: 3, ambicion: 1.4, colchon: 1.2, construir: 3.5, pisos: 10 },
  };
  const ORDEN_PISOS = ['plato', 'guion', 'edicion', 'plato', 'sonido', 'efectos', 'casting', 'plato', 'marketing', 'archivo'];
  // Registro de cada obra al terminar (las métricas no dependen de lo que la compactación borra después)
  let registro = null;
  N.on('obraTerminada', function (o) {
    if (registro) registro.push({ est: o.est, mult: O.multiplicador(o), neto: O.neto(o) });
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
      let b = null, costo = 0, ok = false;
      const tono = N.elegir(D.tonos).id;
      // Si no alcanza, baja la escala y después la ambición del equipo
      [est.ambicion, 0.6].forEach(function (amb) {
        for (let e = escala; e >= 0 && !ok; e--) {
          b = O.borrador(0, { gen: gen, escala: e, tono: tono });
          O.equipoRecomendado(b, amb);
          costo = O.costoTalento(b) + b.pp + E.marketingTipico(N.anio()) * D.nivelesMarketing[Math.min(2, est.marketing)].mult * 0.5;
          if (NG.cajaLibre(0) > costo * est.colchon) ok = true;
        }
      });
      if (!ok || !b) break;
      const r = IA.juego.iniciarObra(b);
      if (r.error) break;
    }
  }
  function contar(lista, x) { let c = 0; lista.forEach(function (y) { if (y === x) c++; }); return c; }

  // ---------- Revisión de errores (invariantes) ----------
  function revisar(errores) {
    const S = N.S;
    S.estudios.forEach(function (e) { if (!isFinite(e.caja)) errores.push('Caja no finita en ' + e.nombre + ' (' + N.anio() + ')'); });
    S.obras.forEach(function (o) {
      if (o.bruto !== undefined && !isFinite(o.bruto)) errores.push('Bruto no finito en obra ' + o.id);
      if (o.et === 'cartelera' && !isFinite(o.u)) errores.push('Atractivo no finito en obra ' + o.id);
    });
    if (!(IA.mundo.poblacionMundial(N.anio()) > 0)) errores.push('Población no positiva en ' + N.anio());
    if (errores.length > 50) errores.length = 50;
  }

  // ---------- Una partida completa ----------
  // op: { estrategia, desde, hasta, semilla, medirGuardado: fn(S) -> bytes (opcional) }
  function jugar(op) {
    const est = ESTRATEGIAS[op.estrategia];
    const errores = [];
    const reloj = typeof performance !== 'undefined' ? function () { return performance.now(); } : function () { return Date.now(); };
    registro = [];
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

  return { ESTRATEGIAS: ESTRATEGIAS, METAS: METAS, decidir: decidir, jugar: jugar, bateria: bateria, pct: pct, mediana: mediana };
})();
