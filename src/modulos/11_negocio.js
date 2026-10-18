/* ==== módulo: negocio ==== */
// Finanzas mes a mes por categoría, gastos fijos que crecen con el tamaño, impuesto del 25 % sobre utilidades
// (no sobre la caja), antimonopolio sobre el 35 %, construcciones básicas del estudio,
// cuota de mercado y quiebra (con sus tres salidas en ART.banco).
ART.negocio = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, E = ART.economia, M = ART.mundo, T = ART.talentos;
  const INGRESOS = ['taquilla', 'video', 'tv', 'streaming', 'merchandising', 'reestrenos', 'exhibicion', 'carrera', 'licencias', 'inversiones', 'filiales', 'coproduccion', 'encargos', 'fans', 'investigacion', 'eventos', 'musica', 'juegos', 'teatro', 'libros', 'alquilerTeatros', 'ventaTeatros'];
  const GASTOS = ['talento', 'exclusivos', 'academia', 'derechos', 'produccion', 'marketing', 'distribucion', 'personal', 'mantenimiento', 'construccion', 'impuestos', 'multas', 'emision', 'deuda', 'socio', 'filiales', 'investigacion', 'inversiones', 'coproduccion', 'encargos', 'eventos'];
  const NOMBRES = {
    taquilla: 'Taquilla (parte del estudio)', video: 'Video doméstico', tv: 'Televisión', streaming: 'Streaming', merchandising: 'Juguetes y coleccionables',
    reestrenos: 'Reestrenos', carrera: 'Tus encargos como talento', exhibicion: 'Tus cines (obras ajenas)', distribucion: 'Contratos con cadenas de cines', talento: 'Contratos de talento', exclusivos: 'Contratos exclusivos', academia: 'Academia y becas', derechos: 'Derechos y guiones', produccion: 'Producción', marketing: 'Marketing',
    personal: 'Personal', mantenimiento: 'Mantenimiento', construccion: 'Construcciones', impuestos: 'Impuestos', multas: 'Multas', licencias: 'Licencias, derivados y franquicias', emision: 'Canal y plataforma (operación)', inversiones: 'Inversiones', filiales: 'Filiales', coproduccion: 'Coproducciones y financiación', encargos: 'Encargos', fans: 'Tienda, museo, parque y convenciones', investigacion: 'Investigación y patentes', eventos: 'Eventos', deuda: 'Pagos de deuda', socio: 'Dividendos del socio', musica: 'Música', juegos: 'Videojuegos', teatro: 'Teatro', libros: 'Libros',
  };
  // Movimientos de capital. Entran y salen de la caja (flujo de caja), pero no son ingresos ni gastos del año:
  // no cambian la utilidad ni el impuesto (antes el capital de los préstamos se descontaba como gasto).
  const CAPITAL = { prestamo: 1, amortizacion: 1, aportes: 1, recompra: 1, socio: 1, acciones: 1, aporteFilial: 1 };
  Object.assign(NOMBRES, { alquilerTeatros: 'Alquiler de tus teatros', ventaTeatros: 'Venta de teatros', prestamo: 'Préstamos recibidos', amortizacion: 'Pago de capital de deudas', aportes: 'Aportes del socio',
    recompra: 'Recompra de la parte del socio', acciones: 'Compra y venta de acciones (capital)', aporteFilial: 'Aportes a filiales', deuda: 'Intereses de deudas' });
  function esCapital(cat) { return !!CAPITAL[cat]; }
  function libroVacio() { return { ing: {}, gas: {} }; }

  // ---------- Movimientos de dinero ----------
  function cobrarEn(est, cat, monto) { mover(est, cat, Math.abs(monto)); }
  function pagar(est, cat, monto) { mover(est, cat, -Math.abs(monto)); }
  function mover(estId, cat, monto) {
    if (!monto || !isFinite(monto)) return;
    const S = N.S, est = S.estudios[estId];
    est.caja += monto;
    if (!CAPITAL[cat]) { if (monto > 0) est.ingAnio += monto; else est.gasAnio -= monto; }
    if (estId !== 0) return;
    const lado = monto > 0 ? 'ing' : 'gas';
    const v = Math.abs(monto);
    S.fin.mes[lado][cat] = (S.fin.mes[lado][cat] || 0) + v;
    S.fin.anio[lado][cat] = (S.fin.anio[lado][cat] || 0) + v;
  }
  // Total de un lado del libro: solo lo operativo (lo que cuenta para la utilidad); conCapital suma también el capital
  function total(libro, lado, conCapital) { let s = 0; Object.keys(libro[lado]).forEach(function (k) { if (conCapital || !CAPITAL[k]) s += libro[lado][k]; }); return s; }
  function capitalNeto(libro) { return total(libro, 'ing', true) - total(libro, 'ing') - (total(libro, 'gas', true) - total(libro, 'gas')); }

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
    ART.sede.bonos(b, obra); // personal de oficina
    ART.carrera.bonos(b); // trasfondo y arquetipo de tu avatar
    ART.imperio.bonoTec(b); // inventos propios o licenciados mientras son novedad
    // Rendimientos decrecientes; apilar instalaciones y personal rinde cada vez menos (tope suave de +10)
    Object.keys(b).forEach(function (k) { if (k[0] !== '_' && b[k] > 0) b[k] = Math.round(10 * (1 - Math.exp(-b[k] / 10)) * 10) / 10; });
    return b;
  }
  function rapidez(estId) {
    const r = { guion: 0, edicion: 0 };
    if (estId !== 0) return r;
    N.S.estudios[0].pisos.forEach(function (id) { if (id === 'guion') r.guion = 1; if (id === 'edicion') r.edicion = 1; });
    return r;
  }
  // Los rivales son estudios establecidos: ya tienen backlots y talleres que abaratan su producción
  const AJ = { ahorroRivales: 0.1 };
  function ahorro(estId) {
    if (estId !== 0) return AJ.ahorroRivales;
    let a = 0;
    N.S.estudios[0].terrenos.forEach(function (id) { a += infoTerreno(id).ahorro || 0; });
    return Math.min(0.26, a + ART.sede.ahorroProductor() + ART.carrera.ahorro());
  }
  function bonoMarketing(estId) {
    if (estId !== 0) return 0;
    let a = 0;
    N.S.estudios[0].pisos.forEach(function (id) { a += infoPiso(id).marketing || 0; });
    const vis = D.visiones.filter(function (v) { return v.id === N.S.estudios[0].vision; })[0];
    return a + (vis && vis.marketing ? vis.marketing : 0) + ART.sede.bonoMarketing() + ART.carrera.bonoMarketing();
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
    const veto = ART.banco.opinar(costo, 'la construcción'); // el socio opina en lo grande
    if (veto) return veto;
    pagar(0, 'construccion', costo);
    if (tipo === 'piso') est.pisos.push(id); else est.terrenos.push(id);
    est.valorObras = (est.valorObras || 0) + costo / E.presupuestoTipico(N.anio());
    N.emit('noticia', { tipo: 'estudio', texto: 'Tu estudio inaugura: ' + info.nombre.toLowerCase() + '.' });
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
      personal: (tipico * (0.006 + 0.004 * partes) * f + ART.sede.gastoFijoMes()) * (1 - ART.carrera.descuentoFijo()), // sede y personal de oficina
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
        // Participaciones: los talentos con porcentaje cobran su parte de lo que recibe el estudio
        if (o.pctT) {
          let pct = 0;
          Object.keys(o.pctT).forEach(function (id) { pct += o.pctT[id]; });
          const p = parte * pct / 100;
          if (p > 0) { pagar(o.est, 'talento', p); o.part = (o.part || 0) + p; Object.keys(o.pctT).forEach(function (id) { T.pagarA(+id, parte * o.pctT[id] / 100); }); }
        }
      },
      terminar: function (o) { ART.lanzamiento.terminar(o, ctxCache); },
      famaDe: function (estId) { return N.S.estudios[estId].fama; },
      bonoMarketingDe: bonoMarketing,
      regionEstudio: function (estId) { return N.S.estudios[estId].reg; },
      bonos: bonos,
      famaTrasEstreno: function (o, mult) {
        const est = N.S.estudios[o.est];
        // La fama del estudio sube despacio con los éxitos y la buena crítica (cuesta más cuanto más alta)
        // (una obra correcta, de crítica 60, ya no resta: así un estudio chico no se hunde por estrenar obras medianas)
        const cambio = N.limitar(0.004 * Math.log(Math.max(0.2, mult)) + (o.crit - 60) / 6000, -0.012, 0.01);
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
      if (S.estudios[i].quebrado) continue;
      const g = gastosFijosMes(i);
      pagar(i, 'personal', g.personal);
      pagar(i, 'mantenimiento', g.mantenimiento);
    }
    const f = S.fin;
    f.meses.push({ t: S.t, anio: N.anio(S.t - 1), mes: N.mes(S.t - 1), ing: Math.round(total(f.mes, 'ing')), gas: Math.round(total(f.mes, 'gas')), cap: Math.round(capitalNeto(f.mes)), caja: Math.round(S.estudios[0].caja) });
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
      anio: anioCerrado, ing: Math.round(ing), gas: Math.round(gas), cap: Math.round(capitalNeto(S.fin.anio)), util: Math.round(jug.util), imp: Math.round(S.fin.anio.gas.impuestos || 0),
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
    // Cuatro años seguidos entre los tres primeros con 4 % o más del mercado, prestigio de 70 y al menos 15 años de historia
    const cinco = S.fin.hist.slice(-4);
    if (cinco.length === 4 && cinco.every(function (h) { return h.puesto <= 3 && h.cuota >= 0.04; }) && jug.fama >= 0.7 && S.fin.hist.length >= 16 && !S.majorDesde) {
      S.majorDesde = anioCerrado;
      N.emit('noticia', { tipo: 'estudio', texto: 'Tu estudio ya es una major: está entre los tres más taquilleros del mundo.', importante: true });
    }
    jug.clase = puesto <= 3 && cuota >= 0.06 ? 'A' : cuota >= 0.015 ? 'B' : 'C';
    for (let i = 0; i < S.estudios.length; i++) {
      const e = S.estudios[i];
      e.ingAnio = 0; e.gasAnio = 0;
      // La fama se olvida un 5 % al año, pero nunca por debajo de lo que da tener un estudio abierto (0,06)
      if (e.fama > 0.06) e.fama = N.redondear(N.limitar(0.06 + (e.fama - 0.06) * 0.95, 0.01, 1), 3);
    }
    S.fin.anio = libroVacio();
    m.anio = { total: 0, otras: 0, porEstudio: {} };
  }
  // Dinero ya comprometido: lo que falta pagar de las producciones en marcha
  function comprometido(estId) {
    let s = 0;
    ART.obras.enProduccion(estId).forEach(function (o) { s += Math.max(0, o.pp * (o.sobre || 1) - (o.gp || 0)); });
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
    cobrarEn: cobrarEn, total: total, esCapital: esCapital, capitalNeto: capitalNeto, infoPiso: infoPiso, infoTerreno: infoTerreno, capacidad: capacidad, bonos: bonos,
    rapidez: rapidez, ahorro: ahorro, bonoMarketing: bonoMarketing, costoConstruccion: costoConstruccion,
    puedeConstruir: puedeConstruir, construir: construir, gastosFijosMes: gastosFijosMes, contexto: contexto,
    contextoDe: contextoDe, semana: semana, mensual: mensual, anual: anual, cuotaAnioActual: cuotaAnioActual,
    comprometido: comprometido, cajaLibre: cajaLibre, impuestoEstimado: impuestoEstimado,
  };
})();
