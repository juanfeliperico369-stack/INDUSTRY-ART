/* ==== módulo: rivales ==== */
// Estudios rivales simples que hacen obras de verdad: contratan talentos del mismo mundo, eligen fechas mirando
// la temporada y la competencia, estrenan en la misma cartelera y ganan o pierden dinero como tú.
// Estrategias, compras, fusiones, quiebras y estudios emergentes llegan en la V26.
IA.rivales = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, O = IA.obras, P = IA.produccion, L = IA.lanzamiento;

  function logoDe(n) {
    if (IA.arte && IA.arte.logoAleatorio) return IA.arte.logoAleatorio(n);
    return { s: n % 25, c: (n * 7) % 20, b: (n * 3) % 20, t: (n * 11) % 20, f: n % 20 };
  }
  function crearEstudios() {
    const S = N.S, anio = N.anio();
    const tipico = E.presupuestoTipico(anio);
    D.rivales.forEach(function (r, i) {
      const pais = D.pais(r.pais);
      S.estudios.push({
        id: i + 1, nombre: r.nombre, logo: logoDe(r.logo), pais: r.pais, reg: pais.region, jugador: false,
        caja: Math.round(tipico * r.tam * 6), fama: N.redondear(0.15 + r.tam * 0.12, 3), tam: r.tam,
        calidad: r.calidad, riesgo: r.riesgo, familia: r.familia, util: 0, ingAnio: 0, gasAnio: 0, rescates: 0,
      });
    });
  }
  // Cuántas obras quiere tener en marcha cada rival
  function objetivo(est) {
    const da = E.datosAnio(N.anio());
    return Math.max(1, Math.round(est.tam * 3.2 * Math.sqrt(da.peliculas / 320)));
  }
  function elegirGeneros(est) {
    const S = N.S;
    let famId;
    if (N.probabilidad(0.55)) famId = est.familia;
    else {
      // Persigue la tendencia del momento (con algo de azar)
      const fams = D.ORDEN_FAM.slice();
      famId = fams[N.ponderado(fams.map(function (f) { return Math.exp(2 * (S.mundo.tendencias[f] || 0)); }))];
    }
    const fam = D.familia(famId);
    const gen = [N.elegir(fam.generos)];
    if (N.probabilidad(0.45)) {
      const otra = D.familias[N.entero(0, D.familias.length - 1)];
      const g2 = N.elegir(otra.generos);
      if (gen.indexOf(g2) < 0 && !O.validarGeneros(gen.concat([g2]))) gen.push(g2);
    }
    if (O.validarGeneros(gen)) return [fam.generos[0] === 'Erótico' ? 'Romance' : fam.generos[0]];
    return gen;
  }
  // Proyectos de prestigio: obras pensadas para premios, con lo mejor del talento disponible
  const PRESTIGIO = { DR: 0.35, AV: 0.4, SM: 0.2, RD: 0.15, IM: 0.12, AA: 0.1, HM: 0.1, FJ: 0.1 };
  function nuevaObra(est, ctx) {
    const prestigio = N.probabilidad(PRESTIGIO[est.familia] || 0.1) && est.caja > E.presupuestoTipico(N.anio()) * 3;
    const gen = prestigio ? [N.elegir(D.familia(N.probabilidad(0.6) ? 'DR' : est.familia).generos.filter(function (g) { return g !== 'Erótico'; }))] : elegirGeneros(est);
    const escala = prestigio ? N.entero(2, 3) : N.limitar(Math.round(N.normal(2 + (est.tam - 1) * 0.3, 0.45 + est.riesgo * 0.35)), 0, 3);
    const tono = prestigio ? N.elegir(['Reflexivo', 'Realista', 'Poético', 'Oscuro', 'Épico']) : N.elegir(D.tonos).id;
    const b = O.borrador(est.id, { gen: gen, escala: escala, tono: tono });
    b.prest = prestigio ? 1 : 0;
    // La calidad de su equipo depende de su estilo más que de su tamaño (evita la espiral del más chico)
    O.equipoRecomendado(b, prestigio ? 2.6 : N.limitar(0.95 + (est.tam - 1) * 0.15 + est.calidad / 25, 0.75, 1.4), prestigio ? 2 : 4);
    if (!O.equipoCompleto(b)) return null;
    const costo = O.costoTalento(b) + b.pp;
    if (est.caja < costo * 0.6) return null;
    return P.iniciar(b, ctx);
  }
  // Cada mes: decide qué producir
  function mensual(ctx) {
    const S = N.S;
    for (let i = 1; i < S.estudios.length; i++) {
      const est = S.estudios[i];
      const enMarcha = O.enProduccion(est.id).length;
      const meta = objetivo(est);
      let nuevas = Math.min(2, meta - enMarcha);
      while (nuevas-- > 0) nuevaObra(est, ctx);
    }
  }
  // Cuando una obra rival queda lista, elige su fecha de estreno y su campaña
  function alQuedarLista(o, ctx) {
    const est = N.S.estudios[o.est];
    const t = L.mejorSemana(o, N.S.t + 2, N.S.t + 2 + N.entero(6, 16));
    const nivM = N.limitar(Math.round(N.normal(2 + (o.esc - 2) * 0.4, 0.45)), 1, 3);
    L.programar(o, t, nivM, ctx);
  }
  // Cada año: crecen si ganan, se achican si pierden; si quedan en rojo reciben un rescate (las quiebras, en la V26)
  function anual() {
    const S = N.S, anio = N.anio();
    const tipico = E.presupuestoTipico(anio);
    for (let i = 1; i < S.estudios.length; i++) {
      const est = S.estudios[i];
      const base = D.rivales[i - 1].tam;
      if (est.caja < tipico * 0.5) {
        est.tam = N.redondear(Math.max(base * 0.4, est.tam * 0.85), 3);
        const aporte = Math.round(tipico * 2 * est.tam);
        est.caja += aporte;
        est.rescates++;
        N.emit('noticia', { tipo: 'rival', texto: est.nombre + ' recibe dinero de inversionistas para seguir filmando.' });
      } else if (est.caja > tipico * est.tam * 10) {
        est.tam = N.redondear(Math.min(base * 1.4, est.tam * 1.05), 3);
      } else if (est.util < 0) {
        est.tam = N.redondear(Math.max(base * 0.5, est.tam * 0.96), 3);
      }
      est.tam = N.redondear(est.tam + (base - est.tam) * 0.05, 3);
    }
  }

  return { crearEstudios: crearEstudios, mensual: mensual, alQuedarLista: alQuedarLista, anual: anual, objetivo: objetivo };
})();
