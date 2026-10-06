/* ==== módulo: lanzamiento ==== */
// Fecha de estreno, marketing, la cartelera de cada semana y el cierre de cada obra con su informe.
// V20: el plan de estreno (regiones, doblaje, canales, promociones) vive en IA.estreno; las ventanas, en IA.ventanas.
IA.lanzamiento = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, T = IA.talentos, O = IA.obras;

  // Programa el estreno: la campaña se paga ahora y el estreno ocurre en la semana elegida
  function programar(o, tEstreno, nivM, ctx, plan) {
    o.fe = Math.max(N.S.t, tEstreno);
    o.nivM = nivM;
    const anio = N.anio(o.fe), ES = IA.estreno;
    o.plan = o.est === 0 ? ES.normalizar(o, plan, anio) : ES.planRival(o, anio);
    o.plan.anuncio = o.fe - N.S.t; // la cuenta regresiva: anunciar con tiempo arma expectativa
    const c = ES.costos(o, o.plan, nivM, anio);
    o.cm = c.total;
    o.cmD = c.doblaje; o.cmP = c.promos;
    // La intensidad de la campaña en las regiones donde se estrena (retener una región ahorra, no diluye)
    o.campana = Math.round(E.marketingTipico(anio) * D.nivelesMarketing[nivM].mult * (o.plan.via === 'cines' ? 1 : 0.3));
    if (o.cm > 0) ctx.pagar(o.est, 'marketing', o.cm);
    o.prog = 1;
  }
  // Estrenos de esta semana a la competencia
  function estrenosDeLaSemana(t) {
    return O.activas().filter(function (o) { return o.et === 'lista' && o.prog && o.fe === t; });
  }
  // Carga competitiva prevista para una semana (cuántos estrenos fuertes hay ya anunciados)
  function competenciaPrevista(t, excluirId) {
    let c = 0;
    O.activas().forEach(function (o) {
      if (o.id === excluirId) return;
      if (o.et === 'lista' && o.prog && Math.abs(o.fe - t) <= 1) c += o.fe === t ? 1 : 0.5;
      else if (o.et === 'cartelera' && o.sc <= 2) c += 0.4;
    });
    return c;
  }
  // Mejor semana entre las próximas (temporada y bono del género frente a la competencia anunciada)
  function mejorSemana(o, desde, hasta) {
    let mejor = desde, valor = -1;
    for (let t = desde; t <= hasta; t++) {
      const v = E.pronosticoSemana(N.semana(t), o.fam, N.S.estudios[o.est].reg) / (1 + 0.25 * competenciaPrevista(t, o.id));
      if (v > valor + 1e-9) { valor = v; mejor = t; }
    }
    return mejor;
  }
  function semana(ctx) {
    const lista = estrenosDeLaSemana(N.S.t);
    lista.forEach(function (o) {
      // Estreno directo en video o en streaming: sin cines (V20)
      if (o.plan && o.plan.via && o.plan.via !== 'cines') {
        IA.ventanas.estrenarDirecto(o, o.plan.via);
        cerrar(o, ctx);
        return;
      }
      o.et = 'cartelera';
      o.anio = N.anio();
      E.iniciarCartelera(o, ctx);
      N.S.mercado.fe52.push(N.S.t);
      N.emit('estreno', o);
    });
    N.S.mercado.fe52 = N.S.mercado.fe52.filter(function (t) { return t > N.S.t - 52; });
    N.S.mercado.estrenos52 = N.S.mercado.fe52.length;
    const cartelera = O.enCartelera();
    const res = E.semanaCartelera(cartelera, ctx);
    const m = N.S.mercado;
    m.semana = { t: N.S.t, bruto: res.bruto, otras: res.brutoOtras, porEstudio: res.porEstudio };
    m.anio.total += res.bruto;
    m.anio.otras += res.brutoOtras;
    Object.keys(res.porEstudio).forEach(function (k) { m.anio.porEstudio[k] = (m.anio.porEstudio[k] || 0) + res.porEstudio[k]; });
    return res;
  }
  // Cierre de una obra: queda su resumen y el informe "por qué funcionó o fracasó" (básico; completo en la V21)
  function terminar(o, ctx) {
    o.et = 'terminada';
    O.tocar();
    o.bruto = Math.round(o.bruto);
    o.parte = Math.round(o.parte);
    o.ent = Math.round(o.ent);
    if (o.part) o.part = Math.round(o.part);
    delete o.feR;
    // Juguetes y coleccionables venden según la taquilla (V20)
    const merch = o.plan && o.plan.promo ? o.plan.promo.reduce(function (s, id) { const x = IA.estreno.promo(id); return s + (x && x.merch ? x.merch : 0); }, 0) : 0;
    if (merch > 0 && o.bruto > 0) {
      const m = Math.round(o.bruto * merch * (['FJ', 'IM', 'AA'].indexOf(o.fam) >= 0 ? 1 : 0.4));
      o.merch = m;
      IA.negocio.cobrarEn(o.est, 'merchandising', m);
    }
    // Lo que falta llega por las ventanas: video, TV y streaming
    IA.ventanas.alTerminar(o);
    cerrar(o, ctx);
  }
  function cerrar(o, ctx) {
    const mult = O.multiplicador(o);
    T.trasEstreno(o, mult);
    ctx.famaTrasEstreno(o, mult);
    if (o.est === 0) o.inf = informe(o, mult);
    N.emit('obraTerminada', o);
  }
  function informe(o, mult) {
    const r = [];
    const tipico = E.presupuestoTipico(o.anio);
    r.push(mult >= 2.5 ? 'Éxito: recuperó ' + N.redondear(mult, 1) + ' veces su costo.' : mult >= 1.4 ? 'Resultado correcto para su costo.' : 'Fracaso: no recuperó lo invertido.');
    if (o.pub - o.des >= 6) r.push('El boca a boca la sostuvo: el público la disfrutó más de lo prometido.');
    else if (o.des - o.pub >= 6) r.push('Prometió más de lo que cumplió y el boca a boca la hundió.');
    if (o.con < 0.35) r.push('Poca gente se enteró: faltó marketing o fama.');
    else if (o.con > 0.85) r.push('Casi todo el mundo se enteró del estreno.');
    const temp = E.pronosticoSemana(N.semana(o.fe), o.fam);
    if (o.dir) r.push('Se estrenó directo en ' + (o.dir === 'video' ? 'video' : 'streaming') + ': sin taquilla, con lo que dejan las ventanas.');
    if (temp >= 1.2) r.push('La fecha ayudó: estrenó en temporada alta para su género.');
    else if (temp <= 0.9) r.push('La fecha no ayudó: estrenó en temporada baja.');
    if (o.crit >= 80) r.push('La crítica la aplaudió (' + o.crit + ').');
    else if (o.crit <= 40) r.push('La crítica la destrozó (' + o.crit + ').');
    if (O.costoTotal(o) > tipico * 2.5) r.push('Fue muy cara para su época: cuesta más recuperarla.');
    const acc = o.acc ? o.acc.nam : 1;
    if (acc < 0.6) r.push('Su clasificación (' + o.clas + ') dejó fuera a parte del público.');
    return r.concat(IA.ideas.informe(o));
  }

  return {
    programar: programar, competenciaPrevista: competenciaPrevista, mejorSemana: mejorSemana,
    semana: semana, terminar: terminar,
  };
})();
