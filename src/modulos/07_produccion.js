/* ==== módulo: produccion ==== */
// Etapas de la obra: desarrollo, preproducción, rodaje y posproducción, con su costo semana a semana.
// El liderazgo del productor y los rasgos del equipo controlan el sobrecosto. Departamentos con nota,
// locaciones, sets, dilemas y prueba de público llegan en la V19.
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
    O.idsEquipo(o).forEach(function (id) { const t = T.porId(id); const r = t && IA.datos.rasgos[t.rasgo]; if (r) riesgo += r[1] / 3; });
    o.sobre = N.redondear(N.limitar(1 + N.normal(riesgo, 0.05), 0.92, 1.3), 3);
    o.pp = Math.round(o.pp * (1 - (ctx.ahorro || 0)));
    const total = o.dur.desarrollo + o.semProd;
    T.ocupar(O.idsEquipo(o), N.S.t + total);
    ctx.pagar(o.est, 'talento', o.cf);
    N.emit('obraIniciada', o);
    return o;
  }
  // Una semana de producción para todas las obras en marcha
  function semana(ctx) {
    const lista = O.activas().slice();
    for (let i = 0; i < lista.length; i++) {
      const o = lista[i];
      if (!SIGUIENTE[o.et]) continue;
      if (o.et !== 'desarrollo') {
        const costo = o.pp * o.sobre / o.semProd;
        o.gp = (o.gp || 0) + costo;
        ctx.pagar(o.est, 'produccion', costo);
      }
      o.sr--;
      if (o.sr > 0) continue;
      o.et = SIGUIENTE[o.et];
      if (o.et === 'lista') {
        o.gp = Math.round(o.gp);
        E.calificar(o, T.porId, ctx.bonos(o.est, o.fam));
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
