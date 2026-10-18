/* ==== módulo: negocio ==== */
// Finanzas mes a mes por categoría, gastos fijos que crecen con el tamaño, impuesto del 25 % sobre utilidades
// (no sobre la caja, fallo 18 de la V15), antimonopolio sobre el 35 %, construcciones básicas del estudio,
// cuota de mercado y quiebra. Préstamos, sedes, filiales, inversiones y rescate llegan en la V28.
IA.negocio = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, M = IA.mundo, T = IA.talentos;
  const INGRESOS = ['taquilla', 'video', 'tv', 'streaming', 'merchandising', 'reestrenos', 'exhibicion', 'carrera', 'licencias'];
  const GASTOS = ['talento', 'exclusivos', 'academia', 'derechos', 'produccion', 'marketing', 'distribucion', 'personal', 'mantenimiento', 'construccion', 'impuestos', 'multas', 'emision'];
  const NOMBRES = {
    taquilla: 'Taquilla (parte del estudio)', video: 'Video doméstico', tv: 'Televisión', streaming: 'Streaming', merchandising: 'Juguetes y coleccionables',
    reestrenos: 'Reestrenos', carrera: 'Tus encargos como talento', exhibicion: 'Tus cines (obras ajenas)', distribucion: 'Contratos con cadenas de cines', talento: 'Contratos de talento', exclusivos: 'Contratos exclusivos', academia: 'Academia y becas', derechos: 'Derechos y guiones', produccion: 'Producción', marketing: 'Marketing',
    personal: 'Personal', mantenimiento: 'Mantenimiento', construccion: 'Construcciones', impuestos: 'Impuestos', multas: 'Multas', licencias: 'Licencias, derivados y franquicias', emision: 'Canal y plataforma (operación)',
  };
  function libroVacio() { return { ing: {}, gas: {} }; }

  // ---------- Movimientos de dinero ----------
  function cobrarEn(est, cat, monto) { mover(est, cat, Math.abs(monto)); }
  function pagar(est, cat, monto) { mover(est, cat, -Math.abs(monto)); }
  function mover(estId, cat, monto) {
    if (!monto || !isFinite(monto)) return;
    const S = N.S, est = S.estudios[estId];
    est.caja += monto;
    if (monto > 0) est.ingAnio += monto; else est.gasAnio -= monto;
    if (estId !== 0) return;
    const lado = monto > 0 ? 'ing' : 'gas';
    const v = Math.abs(monto);
    S.fin.mes[lado][cat] = (S.fin.mes[lado][cat] || 0) + v;
    S.fin.anio[lado][cat] = (S.fin.anio[lado][cat] || 0) + v;
  }
  function total(libro, lado) { let s = 0; Object.keys(libro[lado]).forEach(function (k) { s += libro[lado][k]; }); return s; }

  // ---------- Estudio del jugador: construcciones ----------
  function infoPiso(id) { return D.pisos.filter(function (p) { return p.id === id; })[0]; }
  function infoTerreno(id) { return D.terrenos.filter(function (p) { return p.id === id; })[0]; }
  function capacidad(estId) {
    const S = N.S;
    if (estId !== 0) return 99;
    let c = 0;
    S.estudios[0].pisos.forEach(function (p) { c += infoPiso(p).capacidad || 0; });
    S.estudios[0].terrenos.forEach(function (p) { c += infoTerreno(p).capacidad || 0; });
    return c;
  }
  function bonos(estId, famId, obra) {
    const b = {};
    if (estId !== 0) {
      // Los rivales ya tienen sus instalaciones: un bono parejo según su tamaño
      const v = Math.min(4, Math.round(2 * N.S.estudios[estId].tam));
      ['guion', 'direccion', 'produccion', 'fotografia', 'musica', 'edicion', 'arte', 'interprete', 'vestuario', 'efectos', 'animacion'].forEach(function (k) { b[k] = v; });
      return b;
    }
    const est = N.S.estudios[0];
    const sumar = function (bono) { Object.keys(bono).forEach(function (k) { b[k] = (b[k] || 0) + bono[k]; }); };
    est.pisos.forEach(function (id) { const p = infoPiso(id); if (p.bono) sumar(p.bono); });
    // Tus tres especialidades: +1 en esos departamentos de tus obras, más lo que estudies en la academia (hasta +5)
    const av = N.S.avatar || {};
    (av.esp || []).forEach(function (of) { b[of] = (b[of] || 0) + 1; });
    Object.keys(av.ac || {}).forEach(function (of) { b[of] = (b[of] || 0) + av.ac[of]; });
    // Visión y público objetivo: _crit y _pub ajustan las notas finales
    const vis = D.visiones.filter(function (v) { return v.id === est.vision; })[0];
    if (vis) { if (vis.bono) sumar(vis.bono); b._crit = (b._crit || 0) + (vis.crit || 0); b._pub = (b._pub || 0) + (vis.pub || 0); }
    const pub = D.publicos.filter(function (v) { return v.id === est.publico; })[0];
    if (pub && pub.familias.indexOf(famId) >= 0) { b._crit = (b._crit || 0) + (pub.crit || 0); b._pub = (b._pub || 0) + (pub.pub || 0); }
    est.terrenos.forEach(function (id) {
      const p = infoTerreno(id);
      if (p.bono && (!p.familias || p.familias.indexOf(famId) >= 0)) Object.keys(p.bono).forEach(function (k) { b[k] = (b[k] || 0) + p.bono[k]; });
    });
    IA.sede.bonos(b, obra); // personal de oficina (V21)
    IA.carrera.bonos(b); // trasfondo y arquetipo de tu avatar (V21)
    return b;
  }
  function rapidez(estId) {
    const r = { guion: 0, edicion: 0 };
    if (estId !== 0) return r;
    N.S.estudios[0].pisos.forEach(function (id) { if (id === 'guion') r.guion = 1; if (id === 'edicion') r.edicion = 1; });
    return r;
  }
  // Los rivales son estudios establecidos: ya tienen backlots y talleres que abaratan su producción (V19)
  const AJ = { ahorroRivales: 0.1 };
  function ahorro(estId) {
    if (estId !== 0) return AJ.ahorroRivales;
    let a = 0;
    N.S.estudios[0].terrenos.forEach(function (id) { a += infoTerreno(id).ahorro || 0; });
    return Math.min(0.26, a + IA.sede.ahorroProductor() + IA.carrera.ahorro());
  }
  function bonoMarketing(estId) {
    if (estId !== 0) return 0;
    let a = 0;
    N.S.estudios[0].pisos.forEach(function (id) { a += infoPiso(id).marketing || 0; });
    const vis = D.visiones.filter(function (v) { return v.id === N.S.estudios[0].vision; })[0];
    return a + (vis && vis.marketing ? vis.marketing : 0) + IA.sede.bonoMarketing() + IA.carrera.bonoMarketing();
  }
  // Cada construcción encarece la siguiente (terreno más caro, permisos, obras más grandes)
  function costoConstruccion(info) {
    const est = N.S.estudios[0];
    const iguales = est.pisos.concat(est.terrenos).filter(function (x) { return x === info.id; }).length;
    const total = est.pisos.length + est.terrenos.length;
    return Math.round(info.costo * E.presupuestoTipico(N.anio()) * (1 + 0.6 * iguales) * (1 + 0.16 * Math.max(0, total - 2)));
  }
  function puedeConstruir(tipo, id) {
    const est = N.S.estudios[0];
    const info = tipo === 'piso' ? infoPiso(id) : infoTerreno(id);
    if (!info) return 'No existe.';
    if (info.desde > N.anio()) return 'Disponible desde ' + info.desde + '.';
    if (tipo === 'piso' && est.pisos.length >= D.MAX_PISOS) return 'El edificio ya tiene ' + D.MAX_PISOS + ' pisos.';
    if (tipo === 'terreno' && est.terrenos.length >= D.MAX_TERRENOS) return 'No quedan terrenos libres.';
    if (est.caja < costoConstruccion(info)) return 'No alcanza la caja.';
    return '';
  }
  function construir(tipo, id) {
    const err = puedeConstruir(tipo, id);
    if (err) return err;
    const est = N.S.estudios[0];
    const info = tipo === 'piso' ? infoPiso(id) : infoTerreno(id);
    const costo = costoConstruccion(info);
    pagar(0, 'construccion', costo);
    if (tipo === 'piso') est.pisos.push(id); else est.terrenos.push(id);
    est.valorObras = (est.valorObras || 0) + costo / E.presupuestoTipico(N.anio());
    N.emit('noticia', { tipo: 'estudio', texto: 'Tu estudio estrena ' + info.nombre.toLowerCase() + '.' });
    return '';
  }
  // Gastos fijos del mes: personal por piso y mantenimiento (crecen con el tamaño)
  function gastosFijosMes(estId) {
    const S = N.S, est = S.estudios[estId];
    const tipico = E.tipicoSuavizado(N.anio());
    if (estId !== 0) return { personal: tipico * 0.012 * est.tam, mantenimiento: tipico * 0.006 * est.tam };
    const partes = est.pisos.length + est.terrenos.length;
    let reduccion = 0;
    est.pisos.forEach(function (id) { reduccion += -(infoPiso(id).fijo || 0); });
    const f = 1 - Math.min(0.3, reduccion);
    return {
      personal: (tipico * (0.006 + 0.004 * partes) * f + IA.sede.gastoFijoMes()) * (1 - IA.carrera.descuentoFijo()), // sede y personal de oficina (V21)
      mantenimiento: tipico * 0.008 * (est.valorObras || 0) * f,
    };
  }

  // ---------- Contexto que comparten producción, lanzamiento y rivales ----------
  let ctxCache = null;
  function contexto() {
    if (ctxCache) return ctxCache;
    ctxCache = {
      talento: function (id) { return T.porId(id); },
      pagar: pagar,
      cobrar: function (o, parte) {
        cobrarEn(o.est, 'taquilla', parte);
        // Participaciones: los talentos con porcentaje cobran su parte de lo que recibe el estudio (V18)
        if (o.pctT) {
          let pct = 0;
          Object.keys(o.pctT).forEach(function (id) { pct += o.pctT[id]; });
          const p = parte * pct / 100;
          if (p > 0) { pagar(o.est, 'talento', p); o.part = (o.part || 0) + p; Object.keys(o.pctT).forEach(function (id) { T.pagarA(+id, parte * o.pctT[id] / 100); }); }
        }
      },
      terminar: function (o) { IA.lanzamiento.terminar(o, ctxCache); },
      famaDe: function (estId) { return N.S.estudios[estId].fama; },
      bonoMarketingDe: bonoMarketing,
      regionEstudio: function (estId) { return N.S.estudios[estId].reg; },
      bonos: bonos,
      famaTrasEstreno: function (o, mult) {
        const est = N.S.estudios[o.est];
        // La fama del estudio sube despacio con los éxitos y la buena crítica (cuesta más cuanto más alta)
        const cambio = N.limitar(0.008 * Math.log(Math.max(0.2, mult)) + (o.crit - 65) / 3000, -0.012, 0.02);
        est.fama = N.redondear(N.limitar(est.fama + (cambio > 0 ? cambio * (1 - est.fama) : cambio), 0.01, 1), 3);
      },
    };
    return ctxCache;
  }
  function contextoDe(estId) {
    const c = contexto();
    return Object.assign({}, c, { rapidez: rapidez(estId), ahorro: ahorro(estId) });
  }

  // ---------- Ciclo ----------
  function semana() {
    const S = N.S, est = S.estudios[0];
    if (est.caja < 0) S.semanasEnRojo++;
    else S.semanasEnRojo = 0;
    if (S.semanasEnRojo === 1) N.emit('aviso', { tipo: 'caja', texto: 'Tu caja está en rojo. Si sigue así 26 semanas, el estudio quiebra.' });
    if (S.semanasEnRojo >= 26 && !S.quiebra) {
      S.quiebra = { t: S.t, anio: N.anio() };
      N.emit('quiebra', S.quiebra);
    }
  }
  function mensual() {
    const S = N.S;
    for (let i = 0; i < S.estudios.length; i++) {
      const g = gastosFijosMes(i);
      pagar(i, 'personal', g.personal);
      pagar(i, 'mantenimiento', g.mantenimiento);
    }
    const f = S.fin;
    f.meses.push({ t: S.t, anio: N.anio(), mes: N.mes(S.t - 1), ing: Math.round(total(f.mes, 'ing')), gas: Math.round(total(f.mes, 'gas')), caja: Math.round(S.estudios[0].caja) });
    if (f.meses.length > 36) f.meses.shift();
    f.mes = libroVacio();
  }
  // Cierre del año (se llama al empezar el año nuevo, con el año que terminó)
  function anual(anioCerrado) {
    const S = N.S, m = S.mercado;
    const tipicoCerrado = E.presupuestoTipico(anioCerrado);
    // Impuesto del 25 % sobre utilidades del año, para todos los estudios
    for (let i = 0; i < S.estudios.length; i++) {
      const est = S.estudios[i];
      const util = est.ingAnio - est.gasAnio;
      est.util = util;
      if (util > 0) pagar(i, 'impuestos', util * E.P.IMPUESTO);
    }
    const jug = S.estudios[0];
    const cuota = m.anio.total > 0 ? (m.anio.porEstudio[0] || 0) / m.anio.total : 0;
    // Antimonopolio: con más del 35 % de un mercado se abre una investigación
    let multa = 0;
    if (cuota >= E.P.ANTIMONOPOLIO) {
      multa = Math.round((S.fin.anio.ing.taquilla || 0) * 0.1);
      pagar(0, 'multas', multa);
      jug.fama = N.redondear(Math.max(0.01, jug.fama - 0.05), 3);
      S.investigaciones++;
      N.emit('noticia', { tipo: 'negocio', texto: 'Investigación antimonopolio: tienes el ' + Math.round(cuota * 100) + ' % del mercado. Multa de {$}.', monto: multa, importante: true });
    } else if (cuota >= 0.3) {
      N.emit('noticia', { tipo: 'negocio', texto: 'Los reguladores vigilan tu cuota de mercado (' + Math.round(cuota * 100) + ' %).' });
    }
    const ing = total(S.fin.anio, 'ing'), gas = total(S.fin.anio, 'gas');
    const fila = {
      anio: anioCerrado, ing: Math.round(ing), gas: Math.round(gas), util: Math.round(jug.util), imp: Math.round(S.fin.anio.gas.impuestos || 0),
      caja: Math.round(jug.caja), caja2025: Math.round(M.aHoy(jug.caja, anioCerrado)), cuota: N.redondear(cuota, 4), multa: multa,
      estrenos: S.obras.filter(function (o) { return o.est === 0 && o.anio === anioCerrado; }).length,
      tipico: Math.round(tipicoCerrado), fama: jug.fama, detalle: N.copiar(S.fin.anio),
    };
    S.fin.hist.push(fila);
    // Las tres más taquilleras del año quedan siempre en la historia (no se resumen)
    S.obras.filter(function (o) { return o.anio === anioCerrado && o.est !== 0; })
      .sort(function (a, b) { return (b.bruto || 0) - (a.bruto || 0); }).slice(0, 3)
      .forEach(function (o) { o.top = 1; });
    // Ranking del año
    const ranking = S.estudios.map(function (e) { return { id: e.id, bruto: Math.round(m.anio.porEstudio[e.id] || 0) }; }).sort(function (a, b) { return b.bruto - a.bruto; });
    m.hist.push({ anio: anioCerrado, total: Math.round(m.anio.total), otras: Math.round(m.anio.otras), ranking: ranking });
    if (m.hist.length > 400) m.hist.shift();
    // Major: entre los 3 estudios más taquilleros del mundo, con 6 % o más del mercado, tres años seguidos
    const puesto = ranking.map(function (r) { return r.id; }).indexOf(0) + 1;
    fila.puesto = puesto;
    const ultimos = S.fin.hist.slice(-3);
    if (ultimos.length === 3 && ultimos.every(function (h) { return h.puesto <= 3 && h.cuota >= 0.06; }) && !S.majorDesde) {
      S.majorDesde = anioCerrado;
      N.emit('noticia', { tipo: 'estudio', texto: 'Tu estudio ya es una major: está entre los tres más taquilleros del mundo.', importante: true });
    }
    jug.clase = puesto <= 3 && cuota >= 0.06 ? 'A' : cuota >= 0.015 ? 'B' : 'C';
    for (let i = 0; i < S.estudios.length; i++) {
      const e = S.estudios[i];
      e.ingAnio = 0; e.gasAnio = 0;
      e.fama = N.redondear(N.limitar(e.fama * 0.95, 0.01, 1), 3);
    }
    S.fin.anio = libroVacio();
    m.anio = { total: 0, otras: 0, porEstudio: {} };
  }
  // Dinero ya comprometido: lo que falta pagar de las producciones en marcha
  function comprometido(estId) {
    let s = 0;
    IA.obras.enProduccion(estId).forEach(function (o) { s += Math.max(0, o.pp * (o.sobre || 1) - (o.gp || 0)); });
    return s;
  }
  // Impuesto que se deberá pagar al cerrar el año (25 % de la utilidad que lleva el año)
  function impuestoEstimado(estId) {
    const est = N.S.estudios[estId];
    return Math.max(0, est.ingAnio - est.gasAnio) * E.P.IMPUESTO;
  }
  // Caja libre: caja menos lo comprometido, el impuesto del año y tres meses de gastos fijos
  function cajaLibre(estId) {
    const g = gastosFijosMes(estId);
    return N.S.estudios[estId].caja - comprometido(estId) - impuestoEstimado(estId) - 3 * (g.personal + g.mantenimiento);
  }
  function cuotaAnioActual(estId) {
    const m = N.S.mercado;
    return m.anio.total > 0 ? (m.anio.porEstudio[estId] || 0) / m.anio.total : 0;
  }

  return {
    AJ: AJ, INGRESOS: INGRESOS, GASTOS: GASTOS, NOMBRES: NOMBRES, libroVacio: libroVacio, mover: mover, pagar: pagar,
    cobrarEn: cobrarEn, total: total, infoPiso: infoPiso, infoTerreno: infoTerreno, capacidad: capacidad, bonos: bonos,
    rapidez: rapidez, ahorro: ahorro, bonoMarketing: bonoMarketing, costoConstruccion: costoConstruccion,
    puedeConstruir: puedeConstruir, construir: construir, gastosFijosMes: gastosFijosMes, contexto: contexto,
    contextoDe: contextoDe, semana: semana, mensual: mensual, anual: anual, cuotaAnioActual: cuotaAnioActual,
    comprometido: comprometido, cajaLibre: cajaLibre, impuestoEstimado: impuestoEstimado,
  };
})();
