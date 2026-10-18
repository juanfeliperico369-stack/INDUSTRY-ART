/* ==== módulo: produccion ==== */
// Etapas de la obra: desarrollo, preproducción, rodaje y posproducción, con su costo semana a semana.
// El productor, el liderazgo y la excelencia del director y del diseñador (tu documento), la experiencia y los
// rasgos del equipo controlan el sobrecosto. Cada semana puede pasar algo (incidentes) o surgir un dilema que
// decides tú; dos semanas antes de terminar se hace la prueba de público; la línea de producción compara el
// presupuesto acordado con el costo real y el set nuevo se guarda para otras obras (todo en IA.rodaje).
IA.produccion = (function () {
  'use strict';
  const N = IA.n, T = IA.talentos, O = IA.obras, E = IA.economia;
  const SIGUIENTE = { desarrollo: 'preproduccion', preproduccion: 'rodaje', rodaje: 'posproduccion', posproduccion: 'lista' };

  // Arranca una obra: paga los contratos, reserva al equipo y fija duraciones y sobrecosto
  function iniciar(b, ctx) {
    const o = O.crear(b);
    o.dur = O.duraciones(o, ctx.rapidez);
    o.sr = o.dur.desarrollo;
    o.semProd = o.dur.preproduccion + o.dur.rodaje + o.dur.posproduccion;
    // Sobrecosto: el productor con buena habilidad lo controla; ciertos rasgos lo empeoran
    const prod = T.porId(o.eq.produccion);
    let riesgo = 0.04 - (prod ? (prod.hab - 50) / 900 : 0);
    // Director y diseñador: con liderazgo y excelencia altos el presupuesto se mantiene o sale más barato
    const lid = [o.eq.direccion, o.eq.arte].map(T.porId).filter(Boolean).map(function (t) { return (T.capacidad(t, 'Liderazgo') + T.capacidad(t, 'Excelencia')) / 2; });
    if (lid.length) riesgo -= (lid.reduce(function (a, x) { return a + x; }, 0) / lid.length - 60) / 1500;
    let veteranos = 0;
    O.idsEquipo(o).forEach(function (id) {
      const t = T.porId(id);
      const r = t && IA.datos.rasgos[t.rasgo];
      if (r) riesgo += r[1] / 3;
      if (t && t.obras >= 15) veteranos++;
    });
    riesgo -= Math.min(0.02, veteranos * 0.005);
    o.sobre = N.redondear(N.limitar(1 + N.normal(riesgo, 0.05), 0.92, 1.3), 3);
    o.pp = Math.round(o.pp * (1 - (ctx.ahorro || 0)));
    const total = o.dur.desarrollo + o.semProd;
    if (o.est === 0) IA.rodaje.iniciarLinea(o);
    const ids = O.idsEquipo(o);
    // Cada cargo cobra 20 de energía; quien llega cansado rinde menos en esta obra
    T.ocupar(ids, N.S.t + total);
    const fat = T.cansancio(ids);
    if (fat) o.fat = fat;
    ctx.pagar(o.est, 'talento', o.cf);
    ids.forEach(function (id) {
      const t = T.porId(id);
      if (!t) return;
      const parte = (o.eq.cam || []).indexOf(id) >= 0 ? O.PARTE_CAMEO : (o.eq.inv || []).indexOf(id) >= 0 ? O.PARTE_INVITADO : (o.pj || []).some(function (p) { return p.t === id && p.i === 'secundario'; }) ? O.PARTE_SECUNDARIO : 1;
      T.pagarA(id, T.salarioCon(T.tarifaPara(t, o.est), o.pctT && o.pctT[id] || 0) * parte);
    });
    N.emit('obraIniciada', o);
    return o;
  }
  // Una semana de producción para todas las obras en marcha
  function semana(ctx) {
    const R = IA.rodaje;
    const lista = O.activas().slice();
    for (let i = 0; i < lista.length; i++) {
      const o = lista[i];
      if (!SIGUIENTE[o.et]) continue;
      if (IA.historia.pausa(o) || IA.historia.climaCierra(o)) continue; // huelgas y clima
      // Una decisión pendiente detiene la obra (sin gastar); sin respuesta, el equipo hace lo más prudente
      if (o.dil) {
        if (!R.vencido(o)) continue;
        const x = R.dilemaDe(o);
        const def = x ? Math.max(0, x.d.ops.map(function (op) { return !!op.def; }).indexOf(true)) : 0;
        R.decidir(o, def, ctx);
        N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '»: como no decidiste, el equipo eligió «' + (x ? x.d.ops[def].t.toLowerCase() : 'lo prudente') + '».' });
      }
      if (o.prueba && !o.prueba.ok) {
        if (!R.pruebaVencida(o)) continue;
        R.decidirPrueba(o, 'estrenar', ctx);
      }
      if (o.et !== 'desarrollo') {
        const costo = R.costoSemana(o);
        o.gp = (o.gp || 0) + costo;
        ctx.pagar(o.est, 'produccion', costo);
        R.sumarGasto(o, costo);
        R.semanaObra(o, ctx);
        if (o.dil) continue; // el dilema se decide antes de seguir
      }
      o.sr--;
      // Prueba de público: dos semanas antes del final de la posproducción (solo tus obras)
      if (o.et === 'posproduccion' && o.est === 0 && !o.prueba && (o.sr === 2 || (o.sr === 1 && o.dur.posproduccion <= 2))) {
        E.calificar(o, T.porId, ctx.bonos(o.est, o.fam, o));
        o.calif = 1;
        R.hacerPrueba(o);
        continue;
      }
      if (o.sr > 0) continue;
      o.et = SIGUIENTE[o.et];
      if (o.et === 'lista') {
        o.gp = Math.round(o.gp);
        if (!o.calif) E.calificar(o, T.porId, ctx.bonos(o.est, o.fam, o));
        delete o.calif;
        if (o.est === 0) {
          const ns = R.notas(o);
          o.notas = {};
          ns.forEach(function (n) { o.notas[n.dep] = n.v; });
        }
        R.guardarSet(o); // también los rivales guardan sus sets
        o.tLista = N.S.t;
        T.liberar(O.idsEquipo(o));
        N.emit('obraLista', o);
      } else {
        o.sr = o.dur[o.et];
      }
    }
  }
  // Progreso total de 0 a 1 (para barras y el edificio)
  function progreso(o) {
    if (!o.dur) return 0;
    const orden = ['desarrollo', 'preproduccion', 'rodaje', 'posproduccion'];
    const k = orden.indexOf(o.et);
    if (k < 0) return 1;
    let hecho = 0, total = 0;
    orden.forEach(function (e, i) {
      total += o.dur[e];
      if (i < k) hecho += o.dur[e];
    });
    hecho += o.dur[o.et] - o.sr;
    return N.limitar(hecho / total, 0, 1);
  }
  function semanasRestantes(o) {
    if (!o.dur) return 0;
    const orden = ['desarrollo', 'preproduccion', 'rodaje', 'posproduccion'];
    const k = orden.indexOf(o.et);
    if (k < 0) return 0;
    let s = o.sr;
    for (let i = k + 1; i < orden.length; i++) s += o.dur[orden[i]];
    return s;
  }

  return { iniciar: iniciar, semana: semana, progreso: progreso, semanasRestantes: semanasRestantes };
})();
