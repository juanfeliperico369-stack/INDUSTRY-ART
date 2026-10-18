/* ==== módulo: imperio ==== */
// V24 · Las construcciones que faltaban (33 en total, las futuras visibles con su pista), sedes en otros países
// con costos y talentos locales, comprar estudios (con límite antimonopolio) que quedan como filiales con costo
// mensual y voluntad propia, coproducciones, encargos de ida y vuelta, financiar proyectos ajenos, contratos
// exclusivos de distribución, tienda, museo, parque y convenciones propias, e investigación de los inventos.
IA.imperio = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, O = IA.obras;
  const tip = function () { return IA.economia.presupuestoTipico(N.anio()); };
  // Construcciones nuevas (se suman a las de la V16 a la V20)
  [
    { id: 'animacion', nombre: 'Departamento de animación', desde: 1915, costo: 0.5, bono: { animacion: 4 }, efecto: '+4 a la animación de tus obras' },
    { id: 'cafeteria', nombre: 'Cafetería y comedor', desde: 1920, costo: 0.2, moral: 2, efecto: 'El equipo come bien: +2 de moral al empezar cada obra' },
    { id: 'laboratorio', nombre: 'Laboratorio de investigación', desde: 1925, costo: 0.6, invest: 0.6, efecto: 'Investigas inventos en 40 % menos tiempo' },
    { id: 'escuela', nombre: 'Escuela de actuación', desde: 1930, costo: 0.45, bono: { interprete: 2 }, efecto: '+2 a la actuación y la academia rinde más' },
    { id: 'tienda', nombre: 'Tienda para fans', desde: 1950, costo: 0.35, tienda: 1, efecto: 'Vende recuerdos de tus obras: ingreso semanal según tus fans' },
    { id: 'museo', nombre: 'Museo del estudio', desde: 1960, costo: 0.5, museo: 1, efecto: 'Tu historia atrae visitas: más fans cada año e ingreso por entradas' },
    { id: 'graficos', nombre: 'Gráficos por computadora', desde: 1982, costo: 0.8, bono: { efectos: 4 }, efecto: '+4 a los efectos especiales' },
    { id: 'servidores', nombre: 'Centro de datos', desde: 2005, costo: 0.9, servidores: 0.3, efecto: 'Tu plataforma gasta 30 % menos en servidores' },
    { id: 'render', nombre: 'Granja de render con IA', desde: 2030, costo: 1.4, bono: { efectos: 3, animacion: 3 }, efecto: '+3 a efectos y animación', pista: 'Llega con la era de la IA en todas partes' },
    { id: 'holo', nombre: 'Estudio holográfico', desde: 2048, costo: 1.8, bono: { fotografia: 3, efectos: 2 }, efecto: '+3 a la fotografía y +2 a los efectos', pista: 'Se desbloquea con los hologramas en escena' },
    { id: 'neuro', nombre: 'Laboratorio neuronal', desde: 2088, costo: 2.2, bono: { direccion: 3, guion: 2 }, efecto: '+3 a la dirección y +2 al guion', pista: 'Llega con las interfaces neuronales' },
  ].forEach(function (p) { if (!D.pisos.some(function (x) { return x.id === p.id; })) D.pisos.push(p); });
  [
    { id: 'parque', nombre: 'Parque temático', desde: 1955, costo: 2.5, parque: 1, efecto: 'Tus franquicias más queridas se vuelven atracciones: ingreso semanal' },
    { id: 'virtual', nombre: 'Plató virtual con pantallas', desde: 2019, costo: 1.2, bono: { arte: 3 }, ahorro: 0.05, efecto: '+3 al arte y −5 % en producción' },
    { id: 'arena', nombre: 'Centro de convenciones', desde: 1970, costo: 1.2, arena: 1, efecto: 'Organiza tus propias convenciones más baratas y con más público' },
    { id: 'orbital', nombre: 'Plató orbital', desde: 2100, costo: 3, capacidad: 2, bono: { fotografia: 2 }, efecto: '+2 proyectos a la vez y +2 a la fotografía', pista: 'Llega con la era orbital' },
  ].forEach(function (p) { if (!D.terrenos.some(function (x) { return x.id === p.id; })) D.terrenos.push(p); });
  D.MAX_PISOS = 16; D.MAX_TERRENOS = 16;
  function tiene(id) { const e = N.S.estudios[0]; return e.pisos.indexOf(id) >= 0 || e.terrenos.indexOf(id) >= 0; }
  function info(id) { return D.pisos.concat(D.terrenos).filter(function (x) { return x.id === id; })[0]; }
  function st() { const S = N.S; if (!S.imp) S.imp = { sedes: [], copro: [], ofEnc: [], dist: [], tec: {}, inv: null, eventos: 0 }; return S.imp; }

  // ---------- Sedes en otros países ----------
  function costoSede(pais) { const p = D.pais(pais); return Math.round(tip() * 1.2 * (p ? Math.max(0.5, p.costo) : 1)); }
  function abrirSede(pais) {
    const S = N.S, s = st(), p = D.pais(pais);
    if (!p) return 'Elige un país.';
    if (pais === S.estudios[0].pais || s.sedes.some(function (x) { return x.pais === pais; })) return 'Ya tienes sede ahí.';
    const c = costoSede(pais);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    const v = IA.banco.opinar(c, 'abrir una sede'); if (v) return v;
    IA.negocio.pagar(0, 'construccion', c);
    s.sedes.push({ pais: pais, t0: S.t });
    N.emit('noticia', { tipo: 'estudio', texto: 'Abres una sede en ' + p.nombre + ': rodar ahí sale más barato y llegan talentos locales.', importante: true });
    return '';
  }
  function cerrarSede(pais) { st().sedes = st().sedes.filter(function (x) { return x.pais !== pais; }); }
  function ahorroRodaje(o) { return o && o.est === 0 && o.rod && st().sedes.some(function (x) { return x.pais === o.rod; }) ? 0.85 : 1; }
  // ---------- Comprar estudios: filiales ----------
  function precioEstudio(id) {
    const e = N.S.estudios[id];
    if (!e) return 0;
    const fr = IA.franquicias.lista().filter(function (f) { return f.est === id; }).reduce(function (s, f) { return s + IA.franquicias.valor(f); }, 0);
    return Math.round(Math.max(0, e.caja) + e.tam * tip() * 5 * (0.6 + e.fama) + fr);
  }
  function puedeComprar(id) {
    const S = N.S, e = S.estudios[id];
    if (!e || id === 0 || e.quebrado) return 'Ese estudio no está a la venta.';
    if (e.filial) return 'Ya es tu filial.';
    const cuota = IA.negocio.cuotaAnioActual(0) + IA.negocio.cuotaAnioActual(id);
    if (cuota > IA.economia.P.ANTIMONOPOLIO) return 'Antimonopolio: juntos tendrían el ' + Math.round(cuota * 100) + ' % del mercado.';
    if (S.estudios[0].caja < precioEstudio(id)) return 'No alcanza la caja.';
    return IA.banco.opinar(precioEstudio(id), 'la compra') || '';
  }
  function comprarEstudio(id) {
    const err = puedeComprar(id);
    if (err) return err;
    const S = N.S, e = S.estudios[id], p = precioEstudio(id);
    IA.negocio.pagar(0, 'construccion', p);
    e.filial = 1; e.filialDesde = S.t;
    N.emit('noticia', { tipo: 'estudio', texto: 'Compras ' + e.nombre + ': ahora es tu filial y sigue filmando con su estilo.', importante: true });
    return '';
  }
  function filiales() { return N.S.estudios.filter(function (e) { return e.filial && !e.quebrado; }); }
  function costoFilial(e) { return Math.round(tip() * 0.012 * e.tam); }
  function venderFilial(id) {
    const e = N.S.estudios[+id];
    if (!e || !e.filial) return 'No es tu filial.';
    IA.negocio.cobrarEn(0, 'filiales', Math.round(precioEstudio(e.id) * 0.8));
    e.filial = 0;
    return '';
  }
  function inyectar(id, monto) { const S = N.S, e = S.estudios[+id]; monto = Math.round(+monto || 0); if (!e || !e.filial || S.estudios[0].caja < monto || monto <= 0) return 'No se puede.'; S.estudios[0].caja -= monto; e.caja += monto; return ''; }
  // Filiales: cada año entregan dividendos si ganaron y a veces deciden algo por su cuenta
  function anualFiliales() {
    filiales().forEach(function (e) {
      if (e.util > 0) { const d = Math.round(e.util * 0.4); e.caja -= d; IA.negocio.cobrarEn(0, 'filiales', d); }
      if (N.probabilidad(0.25)) {
        const fams = D.ORDEN_FAM.filter(function (f) { return f !== e.familia; });
        const nueva = N.elegir(fams);
        N.emit('noticia', { tipo: 'estudio', texto: 'Tu filial ' + e.nombre + ' decide por su cuenta pasarse a ' + D.familia(nueva).nombre.toLowerCase() + '.' });
        e.familia = nueva;
      }
    });
  }
  // ---------- Coproducciones ----------
  function socios(o) { return N.S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado && e.caja > O.costoTotal(o) * 0.6; }); }
  function coproducir(obraId, estId) {
    const o = O.porId(+obraId), e = N.S.estudios[+estId];
    if (!o || o.est !== 0 || ['desarrollo', 'preproduccion'].indexOf(o.et) < 0) return 'Solo obras tuyas en desarrollo o preproducción.';
    if (o.copro) return 'Ya tiene coproductor.';
    if (!e || e.quebrado || e.id === 0) return 'Elige un estudio.';
    const aporte = Math.round(O.costoTotal(o) * 0.4);
    if (e.caja < aporte * 1.5 || !N.probabilidad(N.limitar(0.35 + N.S.estudios[0].fama * 0.5, 0.2, 0.9))) return e.nombre + ' no quiere coproducir esta vez.';
    e.caja -= aporte; IA.negocio.cobrarEn(0, 'coproduccion', aporte);
    o.copro = { est: e.id, parte: 0.4 };
    return '';
  }
  // ---------- Encargos de ida y vuelta ----------
  function encargar(estId, gen, escala) {
    const S = N.S, e = S.estudios[+estId];
    if (!e || e.quebrado || e.id === 0) return 'Elige un estudio.';
    const b = O.borrador(e.id, { gen: [gen || 'Drama'], escala: escala === undefined ? 2 : +escala, completa: true });
    O.equipoRecomendado(b, 1);
    if (!O.equipoCompleto(b)) return 'No consiguen equipo ahora.';
    const precio = Math.round((b.pp + O.costoTalento(b)) * 1.15);
    if (S.estudios[0].caja < precio) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', precio); e.caja += precio;
    const o = IA.produccion.iniciar(b, IA.negocio.contextoDe(e.id));
    o.encargo = 0;
    N.emit('noticia', { tipo: 'estudio', texto: e.nombre + ' filma «' + o.tit + '» por encargo tuyo: te quedarás con el 75 % de lo que gane.', importante: true });
    return '';
  }
  function mensual() {
    const S = N.S, s = st();
    s.ofEnc = s.ofEnc.filter(function (x) { return x.hasta > S.t; });
    if (s.ofEnc.length < 2 && N.probabilidad(0.3)) {
      const e = N.elegir(S.estudios.filter(function (x) { return x.id > 0 && !x.quebrado; }));
      if (e) s.ofEnc.push({ id: N.sigId(), est: e.id, gen: N.elegir(D.familia(e.familia).generos.filter(function (g) { return g !== 'Erótico'; })), pago: Math.round(tip() * (0.8 + N.azar() * 0.6)), hasta: S.t + 6 });
    }
    filiales().forEach(function (e) { IA.negocio.pagar(0, 'filiales', costoFilial(e)); });
    s.sedes.forEach(function (x) {
      IA.negocio.pagar(0, 'personal', Math.round(tip() * 0.015));
      // Talentos locales: cada tanto aparece una promesa de la región de tu sede
      if (N.probabilidad(0.35)) { const p = D.pais(x.pais); const t = IA.talentos.crearPropio({ of: N.elegir(['interprete', 'interprete', 'direccion', 'guion']), edad: N.entero(18, 30), reg: p.region, pot: N.entero(55, 80) }); t.propio = 0; t.local = x.pais; }
    });
  }
  // Aceptar un encargo: abre un compromiso; la próxima obra que inicies con ese género lo cumple
  function aceptarEncargo(id) {
    const s = st(), x = s.ofEnc.filter(function (y) { return y.id === +id; })[0];
    if (!x) return 'Ese encargo venció.';
    N.S.encargoPend = { est: x.est, gen: x.gen, pago: x.pago };
    s.ofEnc = s.ofEnc.filter(function (y) { return y !== x; });
    return '';
  }
  function alCrear(o) {
    const S = N.S, p = S.encargoPend;
    if (o.est === 0 && p && o.gen.indexOf(p.gen) >= 0) {
      o.encargoDe = p.est; IA.negocio.cobrarEn(0, 'encargos', p.pago);
      N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» cumple el encargo de ' + S.estudios[p.est].nombre + ': te pagan y se quedan con el 70 % de lo que gane.' });
      delete S.encargoPend;
    }
  }
  // ---------- Financiar proyectos ajenos ----------
  function proyectosAjenos() { return O.activas().filter(function (o) { return o.est > 0 && !o.fin && ['desarrollo', 'preproduccion'].indexOf(o.et) >= 0 && !N.S.estudios[o.est].quebrado; }).slice(0, 8); }
  function financiar(obraId) {
    const S = N.S, o = O.porId(+obraId);
    if (!o || o.est === 0 || o.fin) return 'No se puede financiar.';
    const m = Math.round(O.costoTotal(o) * 0.25);
    if (S.estudios[0].caja < m) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', m); S.estudios[o.est].caja += m;
    o.fin = { m: m, pct: 0.3 };
    return '';
  }
  // ---------- Distribución exclusiva ----------
  function costoDistribucion(estId) { const e = N.S.estudios[estId]; return Math.round(tip() * 0.4 * (e ? e.tam : 1)); }
  function firmarDistribucion(estId, anios) {
    const S = N.S, s = st(), e = S.estudios[+estId];
    if (!e || e.quebrado || e.id === 0) return 'Elige un estudio.';
    if (s.dist.some(function (d) { return d.est === e.id && d.hasta > S.t; })) return 'Ya distribuyes sus obras.';
    const c = costoDistribucion(e.id) * (+anios || 2);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'distribucion', c);
    s.dist.push({ est: e.id, hasta: S.t + 52 * (+anios || 2) });
    return '';
  }
  // Al terminar una obra se reparten coproducción, encargos, financiación y distribución
  function alTerminar(o) {
    const S = N.S, ing = O.ingresosTotales(o) || 0, s = st();
    const pasar = function (de, a, m, cat) {
      if (m <= 0) return;
      if (de === 0) IA.negocio.pagar(0, cat, m); else S.estudios[de].caja -= m;
      if (a === 0) IA.negocio.cobrarEn(0, cat, m); else S.estudios[a].caja += m;
    };
    if (o.copro) pasar(0, o.copro.est, Math.round(ing * o.copro.parte), 'coproduccion');
    if (o.encargoDe !== undefined && o.est === 0) pasar(0, o.encargoDe, Math.round(ing * 0.7), 'encargos');
    if (o.encargo === 0 && o.est > 0) pasar(o.est, 0, Math.round(ing * 0.75), 'encargos');
    if (o.fin && o.est > 0) pasar(o.est, 0, Math.round((o.bruto || 0) * 0.5 * o.fin.pct), 'coproduccion');
    if (o.est > 0 && s.dist.some(function (d) { return d.est === o.est && d.hasta > S.t; })) pasar(o.est, 0, Math.round((o.bruto || 0) * 0.08), 'distribucion');
  }
  // ---------- Negocios para fans: tienda, museo, parque y convenciones propias ----------
  function semana() {
    const S = N.S, est = S.estudios[0], fans = S.fans || 0, t = tip();
    let ing = 0;
    if (tiene('tienda')) ing += Math.min(t * 0.02, fans * IA.mundo.aEpoca(0.02, N.anio()));
    if (tiene('museo')) ing += Math.min(t * 0.01, fans * IA.mundo.aEpoca(0.01, N.anio()));
    if (tiene('parque')) {
      const pop = IA.franquicias.lista().filter(function (f) { return f.est === 0; }).reduce(function (s, f) { return s + f.pers.slice(0, 3).reduce(function (a, p) { return a + p.pop; }, 0); }, 0);
      ing += t * (0.004 + Math.min(0.06, pop / 6000)) - t * 0.006;
    }
    if (ing) IA.negocio.cobrarEn(0, 'fans', Math.round(Math.max(0, ing)));
    // Investigación en curso
    const s = st();
    if (s.inv && --s.inv.sr <= 0) {
      s.tec[s.inv.id] = { de: 0, t: S.t };
      const x = invento(s.inv.id);
      N.emit('noticia', { tipo: 'estudio', texto: 'Tu laboratorio termina «' + x.nombre + '» antes que el resto del mundo.', importante: true });
      s.inv = null;
    }
    if (est && N.semana() === 26 && tiene('museo')) S.fans = Math.round(fans * 1.01 + 100);
  }
  function costoEvento() { return Math.round(tip() * (tiene('arena') ? 0.08 : 0.15)); }
  function organizarEvento(obraId) {
    const S = N.S, o = obraId ? O.porId(+obraId) : null;
    if (N.anio() < 1950) return 'Las convenciones de fans llegan en los cincuenta.';
    if (st().eventos > S.t) return 'Ya organizaste una convención este trimestre.';
    const c = costoEvento();
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'marketing', c);
    const entradas = Math.round(c * (tiene('arena') ? 1.3 : 0.7) * (0.6 + Math.min(1, (S.fans || 0) / 2e6)));
    IA.negocio.cobrarEn(0, 'fans', entradas);
    S.fans = Math.round((S.fans || 0) * 1.03 + 500);
    if (o && o.est === 0 && o.et !== 'terminada') o.ddes = (o.ddes || 0) + 3;
    st().eventos = S.t + 13;
    return '';
  }
  // ---------- Investigación de inventos ----------
  function invento(id) { return IA.historia.INVENTOS.filter(function (x) { return x.id === id; })[0]; }
  function estadoInvento(x) {
    const s = st(), a = N.anio(), t = s.tec[x.id];
    if (t && t.de === 0) return 'tuyo';
    if (t && t.lic) return 'licencia';
    if (x.anio <= a) return 'mundo';
    if (t) return 'rival';
    return x.anio <= a + 15 ? 'investigable' : 'futuro';
  }
  function costoInvento(x) { return Math.round(tip() * 0.5 * (1 + Math.max(0, x.anio - N.anio()) / 4)); }
  function semanasInvento(x) { return Math.round((20 + Math.max(0, x.anio - N.anio()) * 5) * (tiene('laboratorio') ? 0.6 : 1)); }
  function investigar(id) {
    const S = N.S, s = st(), x = invento(id);
    if (!x || estadoInvento(x) !== 'investigable') return 'No se puede investigar ahora.';
    if (s.inv) return 'Tu laboratorio ya investiga otra cosa.';
    const c = costoInvento(x);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'investigacion', c);
    s.inv = { id: id, sr: semanasInvento(x) };
    return '';
  }
  function costoLicenciaTec(x) { return Math.round(tip() * 0.25); }
  function licenciarTec(id) {
    const S = N.S, s = st(), x = invento(id), t = s.tec[id];
    if (!x || !t || t.de === 0 || t.lic) return 'No hay quién te la licencie.';
    const c = costoLicenciaTec(x);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'investigacion', c); S.estudios[t.de].caja += c;
    t.lic = 1;
    return '';
  }
  // +2 al departamento mientras el invento es novedad (lo tienes antes que el mundo o hasta 5 años después); tope +6
  function bonoTec(b) {
    const s = st(), a = N.anio(), suma = {};
    IA.historia.INVENTOS.forEach(function (x) {
      const t = s.tec[x.id];
      const mio = t && (t.de === 0 || t.lic);
      if (mio && a < x.anio + 5) suma[x.dep] = Math.min(6, (suma[x.dep] || 0) + 2);
    });
    Object.keys(suma).forEach(function (k) { b[k] = (b[k] || 0) + suma[k]; });
  }
  // Rivales: inventan antes de tiempo y te pueden licenciar; tus inventos se los licencias tú
  function anual() {
    const S = N.S, s = st(), a = N.anio();
    IA.historia.INVENTOS.forEach(function (x) {
      if (s.tec[x.id] || x.anio <= a || x.anio > a + 8) return;
      if (N.probabilidad(0.08)) {
        const e = N.elegir(S.estudios.filter(function (y) { return y.id > 0 && !y.quebrado; }));
        if (e) { s.tec[x.id] = { de: e.id, t: S.t }; N.emit('noticia', { tipo: 'rival', texto: e.nombre + ' presenta «' + x.nombre + '» antes que nadie. Puedes licenciarlo.' }); }
      }
    });
    Object.keys(s.tec).forEach(function (id) { const x = invento(id), t = s.tec[id]; if (t.de === 0 && x && a < x.anio) IA.negocio.cobrarEn(0, 'investigacion', Math.round(tip() * 0.08 * N.entero(1, 3))); });
    anualFiliales();
  }
  return { tiene: tiene, info: info, costoSede: costoSede, abrirSede: abrirSede, cerrarSede: cerrarSede, sedes: function () { return st().sedes; }, ahorroRodaje: ahorroRodaje,
    precioEstudio: precioEstudio, puedeComprar: puedeComprar, comprarEstudio: comprarEstudio, filiales: filiales, costoFilial: costoFilial, venderFilial: venderFilial, inyectar: inyectar,
    socios: socios, coproducir: coproducir, encargar: encargar, ofertasEncargo: function () { return st().ofEnc; }, aceptarEncargo: aceptarEncargo, alCrear: alCrear,
    proyectosAjenos: proyectosAjenos, financiar: financiar, costoDistribucion: costoDistribucion, firmarDistribucion: firmarDistribucion, distribuciones: function () { return st().dist; },
    alTerminar: alTerminar, semana: semana, mensual: mensual, anual: anual, costoEvento: costoEvento, organizarEvento: organizarEvento, invento: invento, estadoInvento: estadoInvento,
    costoInvento: costoInvento, semanasInvento: semanasInvento, investigar: investigar, investigando: function () { return st().inv; }, costoLicenciaTec: costoLicenciaTec,
    licenciarTec: licenciarTec, bonoTec: bonoTec, moral: function () { return tiene('cafeteria') ? 2 : 0; }, ahorroServidores: function () { return tiene('servidores') ? 0.3 : 0; } };
})();
