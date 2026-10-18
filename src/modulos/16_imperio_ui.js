/* ==== módulo: imperio_ui ==== */
// V24 · Pantallas de Banco (crédito, préstamos, cuentas, socio y junta, inversiones, balance y cambio de marca),
// Imperio (sedes, filiales y compra de estudios, coproducciones, encargos, financiar, distribución, negocios para
// fans e investigación), Rivales (ranking ordenable con filtros, estrellas y taquillas) e Historia (hitos con su
// día); la bitácora del estudio, los eventos con decisión y la quiebra con sus tres salidas.
IA.imperioUI = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, O = IA.obras, U = IA.ui, B = IA.banco, I = IA.imperio, esc = N.esc;
  const dinero = U.dinero, ac = U.accion;
  const st = { orden: 'ingresos', filtro: 'activos', hist: 'cerca' };
  function kpi(n, v, c) { return '<div class="kpi"><span>' + esc(n) + '</span><b class="cifra ' + (c || '') + '">' + esc(v) + '</b></div>'; }
  function btn(txt, a, v, cl, dis) { return '<button class="btn ' + (cl || '') + '" data-a="' + a + '" data-v="' + esc(v === undefined ? '' : v) + '"' + (dis ? ' disabled title="' + esc(dis) + '"' : '') + '>' + esc(txt) + '</button>'; }
  function chip(txt, a, v, on) { return '<button class="chip' + (on ? ' on' : '') + '" data-a="' + a + '" data-v="' + esc(v) + '">' + esc(txt) + '</button>'; }
  function sel(id, ops, val) { return '<select id="' + id + '">' + ops.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }
  function avisar(e, ok) { U.aviso(e || ok, e ? 'mal' : ''); U.refrescar(); }
  function barra(v) { return '<div class="barra-p"><i style="width:' + Math.round(N.limitar(v, 0, 100)) + '%"></i></div>'; }
  function estrellas(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }

  // ---------- Negocio › Banco ----------
  function banco() {
    const S = N.S, e = B.escalon(), p = B.puntaje(), b = B.estado();
    let h = '<div class="kpis">' + kpi('Puntaje de crédito', p, p >= 650 ? 'bien' : p < 450 ? 'mal' : '') + kpi('Tu banco', e.nombre) + kpi('Te presta hasta', dinero(B.limite())) + kpi('Tasa anual', Math.round(B.tasa() * 1000) / 10 + ' %') + kpi('Deuda', dinero(B.deuda()), B.deuda() ? 'mal' : '') + '</div>';
    h += '<p class="nota">Con más prestigio subes de banco (' + B.ESCALONES.map(function (x) { return x.nombre + ' desde ' + Math.round(x.fama * 100); }).join(' · ') + '). Pagar a tiempo sube tu puntaje; los atrasos lo bajan.</p>';
    h += '<div class="tarjeta"><h3>Pedir un préstamo</h3><div class="fila"><label class="campo crece"><span>Monto</span><input id="bnMonto" type="number" value="' + Math.round(Math.min(B.limite(), IA.economia.presupuestoTipico(N.anio()))) + '"></label>' +
      '<label class="campo"><span>Plazo</span>' + sel('bnPlazo', [[12, '1 año'], [24, '2 años'], [36, '3 años'], [60, '5 años'], [120, '10 años']], 36) + '</label></div>' + btn('Pedir', 'bnPedir', '', 'primario bloque') + '</div>';
    h += '<h3>Cuentas por pagar este mes</h3>' + (B.cuentasDelMes().length ? B.cuentasDelMes().map(function (c) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(c.txt) + '</b>' + (c.d ? '<span class="tenue chico">Saldo ' + dinero(c.d.saldo) + ' · ' + Math.round(c.d.tasa * 1000) / 10 + ' % anual</span>' : '') + '</div><span class="cifra">' + dinero(c.monto) + '</span>' + (c.d ? btn('Pagar todo', 'bnPrepagar', c.d.id) : '') + '</div>';
    }).join('') + '<p class="tenue chico">Se pagan solas cada mes. Sin caja hay atraso, recargo y baja tu puntaje.</p>' : '<p class="tenue">No debes nada.</p>');
    const so = B.socio();
    h += '<h3>' + (so ? 'Tu socio: ' + esc(so.nom) + ' (' + Math.round(so.parte * 100) + ' %)' : 'La junta') + '</h3><p class="chico">Paciencia ' + B.junta() + ' / 100</p>' + barra(B.junta()) +
      '<p class="nota">' + (so ? 'Se lleva su parte de las utilidades y opina en los gastos grandes; si se le acaba la paciencia, toma más control.' : 'Si se le acaba la paciencia, te impone un socio.') + '</p>' + (so ? btn('Recomprar su parte', 'bnRecomprar') : '');
    h += '<h3>Inversiones</h3><div class="col">' + B.companias().map(function (c) {
      const a = b.acc[c.id];
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(c.nombre) + '</b><span class="tenue chico">Índice ' + B.precio(c.id) + (a ? ' · tienes ' + dinero(B.valorAccion(c.id)) + ' (pagaste ' + dinero(a.costo) + ')' : '') + '</span></div>' +
        (a ? btn('Vender', 'bnVender', c.id) : '') + btn('Comprar', 'bnComprar', c.id, 'primario') + '</div>';
    }).join('') + '</div><label class="campo"><span>Monto por compra</span><input id="bnAcc" type="number" value="' + Math.round(IA.economia.presupuestoTipico(N.anio()) * 0.5) + '"></label>';
    const bl = B.balance();
    h += '<h3>Estado anual (balance)</h3><div class="col">' + Object.keys(bl.activos).map(function (k) { return '<div class="fila entre"><span>' + k[0].toUpperCase() + k.slice(1) + '</span><span class="cifra">' + dinero(bl.activos[k]) + '</span></div>'; }).join('') +
      '<div class="fila entre"><b>Activos</b><b class="cifra">' + dinero(bl.totalA) + '</b></div><div class="fila entre"><span>Deudas y caja en rojo</span><span class="cifra mal">' + dinero(bl.totalP) + '</span></div>' +
      '<div class="fila entre"><b>Patrimonio</b><b class="cifra">' + dinero(bl.patrimonio) + '</b></div>' + (bl.socio ? '<div class="fila entre"><span>Parte del socio</span><span class="cifra">' + dinero(bl.socio) + '</span></div>' : '') + '</div>';
    h += '<h3>Cambiar la marca</h3><p class="nota">Nombre nuevo (y nombre del avatar si quieres). Cuesta ' + dinero(B.costoMarca()) + ' y algunos fans tardan medio año en volver.</p>' +
      '<label class="campo"><span>Nombre del estudio</span><input id="bnMarca" maxlength="40" value="' + esc(S.estudios[0].nombre) + '"></label><label class="campo"><span>Tu nombre</span><input id="bnAvatar" maxlength="40" value="' + esc(S.avatar ? S.avatar.nom : '') + '"></label>' + btn('Cambiar la marca', 'bnMarcaOk');
    return h;
  }
  ac('bnPedir', function () { avisar(B.pedir(+val('bnMonto'), +val('bnPlazo')), 'Préstamo aprobado'); });
  ac('bnPrepagar', function (v) { avisar(B.prepagar(v), 'Deuda pagada'); });
  ac('bnRecomprar', function () { avisar(B.recomprar(), 'El estudio vuelve a ser solo tuyo'); });
  ac('bnComprar', function (v) { avisar(B.comprarAccion(v, +val('bnAcc')), 'Compraste acciones'); });
  ac('bnVender', function (v) { avisar(B.venderAccion(v), 'Vendiste tus acciones'); });
  ac('bnMarcaOk', function () { avisar(B.cambiarMarca(val('bnMarca'), val('bnAvatar')), 'Marca nueva'); U.renderBarra && U.renderBarra(); });

  // ---------- Negocio › Imperio ----------
  function imperio() {
    const S = N.S, a = N.anio(), rivs = IA.rivales.activos();
    let h = '<h3>Sedes en otros países</h3><p class="nota">Rodar donde tienes sede cuesta 15 % menos y aparecen talentos locales.</p>' +
      (I.sedes().length ? '<p>' + I.sedes().map(function (x) { const p = D.pais(x.pais); return esc(p.nombre) + ' ' + btn('Cerrar', 'imCerrarSede', x.pais); }).join(' · ') + '</p>' : '') +
      '<div class="fila">' + sel('imPais', D.paises.filter(function (p) { return p.id !== S.estudios[0].pais; }).map(function (p) { return [p.id, p.nombre + ' · ' + dinero(I.costoSede(p.id))]; }), '') + btn('Abrir sede', 'imSede', '', 'primario') + '</div>';
    h += '<h3>Filiales y compra de estudios</h3><p class="nota">Una filial sigue filmando con su estilo, te cuesta cada mes y te da dividendos si gana. No puedes comprar si juntos superan el ' + Math.round(IA.economia.P.ANTIMONOPOLIO * 100) + ' % del mercado.</p><div class="col">' +
      rivs.map(function (e) {
        if (e.filial) return '<div class="cal-ev"><div class="col crece"><b class="oro">' + esc(e.nombre) + '</b><span class="tenue chico">Filial · caja ' + dinero(e.caja) + ' · ' + dinero(I.costoFilial(e)) + '/mes</span></div>' + btn('Vender', 'imVenderFil', e.id) + '</div>';
        const err = I.puedeComprar(e.id);
        return '<div class="cal-ev"><div class="col crece"><b>' + esc(e.nombre) + '</b><span class="tenue chico">' + dinero(I.precioEstudio(e.id)) + '</span></div>' + btn('Comprar', 'imComprarEst', e.id, err ? '' : 'primario', err) + '</div>';
      }).join('') + '</div>';
    const enDes = O.enProduccion(0).filter(function (o) { return ['desarrollo', 'preproduccion'].indexOf(o.et) >= 0 && !o.copro; });
    h += '<h3>Coproducciones</h3><p class="nota">Un rival pone el 40 % del costo y se lleva el 40 % de lo que gane.</p>' + (enDes.length ? '<div class="fila">' + sel('imCoObra', enDes.map(function (o) { return [o.id, o.tit]; }), '') + sel('imCoEst', rivs.map(function (e) { return [e.id, e.nombre]; }), '') + btn('Proponer', 'imCopro', '', 'primario') + '</div>' : '<p class="tenue chico">Necesitas una obra en desarrollo o preproducción.</p>');
    h += '<h3>Encargos</h3><p class="nota">Pagas a un rival para que filme por ti (te quedas con el 75 %) o aceptas un encargo suyo (te pagan y se quedan con el 70 %).</p><div class="fila">' +
      sel('imEnEst', rivs.map(function (e) { return [e.id, e.nombre]; }), '') + sel('imEnGen', D.familias.map(function (f) { return [f.generos[0], f.generos[0]]; }), '') + btn('Encargar', 'imEncargar', '', 'primario') + '</div>' +
      I.ofertasEncargo().map(function (x) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(S.estudios[x.est].nombre) + '</b><span class="tenue chico">Quiere una obra de ' + esc(x.gen.toLowerCase()) + ' · te paga ' + dinero(x.pago) + '</span></div>' + btn('Aceptar', 'imAceptarEnc', x.id) + '</div>'; }).join('') +
      (S.encargoPend ? '<p class="bien chico">Encargo aceptado: tu próxima obra de ' + esc(S.encargoPend.gen.toLowerCase()) + ' lo cumple.</p>' : '');
    h += '<h3>Financiar proyectos ajenos</h3><p class="nota">Pones el 25 % del costo y recibes el 30 % de su parte de taquilla.</p>' + (I.proyectosAjenos().map(function (o) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(o.tit) + '</b><span class="tenue chico">' + esc(S.estudios[o.est].nombre) + ' · pones ' + dinero(Math.round(O.costoTotal(o) * 0.25)) + '</span></div>' + btn('Financiar', 'imFinanciar', o.id) + '</div>';
    }).join('') || '<p class="tenue chico">Ningún proyecto busca dinero ahora.</p>');
    h += '<h3>Distribución exclusiva</h3><p class="nota">Distribuyes las obras de un rival y te quedas con el 8 % de su taquilla.</p>' + I.distribuciones().filter(function (d) { return d.hasta > S.t; }).map(function (d) { return '<p class="chico">' + esc(S.estudios[d.est].nombre) + ' hasta ' + esc(U.fechaCorta(d.hasta)) + '</p>'; }).join('') +
      '<div class="fila">' + sel('imDiEst', rivs.map(function (e) { return [e.id, e.nombre + ' · ' + dinero(I.costoDistribucion(e.id)) + '/año']; }), '') + btn('Firmar 2 años', 'imDistrib', '', 'primario') + '</div>';
    h += '<h3>Negocios para fans</h3><p>' + ['tienda', 'museo', 'parque', 'arena'].map(function (id) { const x = I.info(id); return x ? (I.tiene(id) ? '✔ ' : '✖ ') + esc(x.nombre) : ''; }).join(' · ') + '</p><p class="nota">Se construyen en Negocio › Construcciones.</p>' +
      (a >= 1950 ? '<div class="fila">' + sel('imEvObra', [['', 'Sin obra en especial']].concat(O.enProduccion(0).concat(O.delEstudio(0, ['lista'])).map(function (o) { return [o.id, o.tit]; })), '') + btn('Organizar convención · ' + dinero(I.costoEvento()), 'imEvento', '', 'primario') + '</div>' : '');
    const inv = I.investigando();
    h += '<h3>Investigación</h3>' + (inv ? '<p class="bien">Investigas «' + esc(I.invento(inv.id).nombre) + '»: faltan ' + inv.sr + ' semanas.</p>' : '') + '<p class="nota">Un invento propio o licenciado da +2 a su departamento mientras es novedad (hasta 5 años después de llegar al mundo).</p><div class="col">' +
      IA.historia.INVENTOS.filter(function (x) { const e = I.estadoInvento(x); return e !== 'mundo' || x.anio > a - 5; }).slice(0, 14).map(function (x) {
        const e = I.estadoInvento(x), nom = { tuyo: 'Tuyo', licencia: 'Licenciado', mundo: 'Ya llegó al mundo', rival: 'Lo tiene un rival', investigable: 'Investigable', futuro: 'Futuro' }[e];
        const accion = e === 'investigable' ? btn('Investigar · ' + dinero(I.costoInvento(x)) + ' · ' + I.semanasInvento(x) + ' sem', 'imInvestigar', x.id, 'primario', inv ? 'Ya investigas otra cosa' : '') : e === 'rival' ? btn('Licenciar · ' + dinero(I.costoLicenciaTec(x)), 'imLicTec', x.id) : '';
        return '<div class="cal-ev"><b class="cifra">' + x.anio + '</b><div class="col crece"><span>' + esc(x.nombre) + '</span><span class="tenue chico">' + esc(nom) + ' · ' + esc(x.dep) + '</span></div>' + accion + '</div>';
      }).join('') + '</div>';
    return h;
  }
  ac('imSede', function () { avisar(I.abrirSede(val('imPais')), 'Sede abierta'); });
  ac('imCerrarSede', function (v) { I.cerrarSede(v); U.refrescar(); });
  ac('imComprarEst', function (v) { avisar(I.comprarEstudio(+v), 'Estudio comprado'); });
  ac('imVenderFil', function (v) { avisar(I.venderFilial(v), 'Filial vendida'); });
  ac('imCopro', function () { avisar(I.coproducir(+val('imCoObra'), +val('imCoEst')), 'Coproducción firmada'); });
  ac('imEncargar', function () { avisar(IA.creacion.conAzarUI(function () { return I.encargar(+val('imEnEst'), val('imEnGen'), 2); }), 'Encargo hecho'); });
  ac('imAceptarEnc', function (v) { avisar(I.aceptarEncargo(v), 'Encargo aceptado'); });
  ac('imFinanciar', function (v) { avisar(I.financiar(v), 'Proyecto financiado'); });
  ac('imDistrib', function () { avisar(I.firmarDistribucion(+val('imDiEst'), 2), 'Contrato firmado'); });
  ac('imEvento', function () { avisar(I.organizarEvento(val('imEvObra') || null), '¡Convención llena!'); });
  ac('imInvestigar', function (v) { avisar(I.investigar(v), 'Empieza la investigación'); });
  ac('imLicTec', function (v) { avisar(I.licenciarTec(v), 'Licencia firmada'); });

  // ---------- Mundo › Rivales: ranking ordenable ----------
  function rivales() {
    const S = N.S, a = N.anio(), m = S.mercado;
    const recientes = function (e) { return S.obras.filter(function (o) { return o.est === e.id && o.pub !== undefined && o.anio >= a - 5; }); };
    const filas = S.estudios.map(function (e) {
      const r = recientes(e);
      return { e: e, cuota: IA.negocio.cuotaAnioActual(e.id), patrimonio: e.caja + (e.tam || 1) * IA.economia.presupuestoTipico(a) * 4, ingresos: e.ingAnio || 0, obras: r.length,
        calif: r.length ? Math.round(r.reduce(function (s, o) { return s + (o.crit || 50); }, 0) / r.length) : 0, prestigio: e.fama };
    });
    const vis = filas.filter(function (f) { return st.filtro === 'todos' || (st.filtro === 'activos' && !f.e.quebrado) || (st.filtro === 'quebrados' && f.e.quebrado) || (st.filtro === 'emergentes' && f.e.desde > S.y0) || (st.filtro === 'filiales' && f.e.filial); })
      .sort(function (x, y) { return (y[st.orden] || 0) - (x[st.orden] || 0); });
    const activos = filas.filter(function (f) { return !f.e.quebrado; });
    const top = function (k) { return activos.slice().sort(function (x, y) { return y[k] - x[k]; })[0]; };
    const tarjeta = function (t, f, v) { return f ? '<div class="kpi"><span>' + t + '</span><b>' + esc(f.e.nombre) + '</b><span class="tenue chico">' + v + '</span></div>' : ''; };
    let h = '<div class="kpis">' + tarjeta('Líder', top('cuota'), U.pct(top('cuota').cuota)) + tarjeta('Más prolífico', top('obras'), top('obras').obras + ' obras en 5 años') + tarjeta('Mejor calidad', top('calif'), 'crítica ' + top('calif').calif) + '</div>';
    h += '<div class="fila">' + [['ingresos', 'Ingresos'], ['patrimonio', 'Patrimonio'], ['obras', 'Obras'], ['calif', 'Calificación'], ['prestigio', 'Prestigio'], ['cuota', 'Cuota']].map(function (x) { return chip(x[1], 'rvOrden', x[0], st.orden === x[0]); }).join('') + '</div>';
    h += '<div class="fila">' + [['activos', 'Activos'], ['todos', 'Todos'], ['quebrados', 'Quebrados'], ['emergentes', 'Emergentes'], ['filiales', 'Tus filiales']].map(function (x) { return chip(x[1], 'rvFiltro', x[0], st.filtro === x[0]); }).join('') + '</div><div class="col">';
    h += vis.map(function (f, i) {
      const e = f.e, es = IA.rivales.ESTRATEGIAS[e.estr];
      return '<div class="tarjeta' + (e.id === 0 ? ' oro' : '') + '"><div class="fila"><canvas data-logo="' + e.id + '" style="width:30px;height:30px"></canvas><div class="col crece"><b>' + (i + 1) + '. ' + esc(e.nombre) + '</b><span class="tenue chico">' +
        (e.quebrado ? (e.fusion !== undefined ? 'Se fusionó en ' + e.quebrado : 'Quebró en ' + e.quebrado) : estrellas(IA.rivales.estrellas(e)) + (es ? ' · ' + esc(es.nombre) : e.id === 0 ? ' · tu estudio' : '') + (e.filial ? ' · tu filial' : '')) +
        ' · ' + esc((D.pais(e.pais) || {}).nombre || '') + '</span></div><span class="cifra">' + U.pct(f.cuota) + '</span></div><span class="chico">Ingresos ' + dinero(f.ingresos) + ' · ' + f.obras + ' obras · crítica ' + f.calif + ' · prestigio ' + Math.round(f.prestigio * 100) + '</span>' +
        (e.texto ? '<span class="tenue chico"> · ' + esc(e.texto) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
    const anio = S.obras.filter(function (o) { return o.anio === a && o.bruto; }).sort(function (x, y) { return y.bruto - x.bruto; }).slice(0, 10);
    const siempre = S.obras.filter(function (o) { return o.bruto; }).sort(function (x, y) { return IA.mundo.aHoy(y.bruto, y.anio || a) - IA.mundo.aHoy(x.bruto, x.anio || a); }).slice(0, 10);
    const lista = function (l, hoy) { return '<div class="col">' + l.map(function (o, i) { return '<div class="cal-ev" data-a="verObra" data-v="' + o.id + '" style="cursor:pointer"><b class="cifra">' + (i + 1) + '</b><div class="col crece"><span' + (o.est === 0 ? ' class="oro"' : '') + '>' + esc(o.tit) + '</span><span class="tenue chico">' + esc((S.estudios[o.est] || {}).nombre || '') + ' · ' + (o.anio || '') + '</span></div><span class="cifra">' + dinero(hoy ? IA.mundo.aHoy(o.bruto, o.anio || a) : o.bruto) + '</span></div>'; }).join('') + '</div>'; };
    h += '<h3>Taquilla del año</h3>' + (anio.length ? lista(anio) : '<p class="tenue">Aún no hay estrenos este año.</p>') + '<h3>Taquilla de todos los tiempos (en dólares de hoy)</h3>' + lista(siempre, true);
    if (m.anio.total) h += '<p class="tenue chico">Otras productoras: ' + U.pct(m.anio.otras / m.anio.total) + ' del mercado este año.</p>';
    return h;
  }
  ac('rvOrden', function (v) { st.orden = v; U.refrescar(); });
  ac('rvFiltro', function (v) { st.filtro = v; U.refrescar(); });

  // ---------- Mundo › Historia ----------
  function historia() {
    const a = N.anio(), hoy = IA.cal.inicioDeT(N.S.t);
    const l = IA.historia.lineaDeTiempo();
    const pasado = function (x) { return x.y < hoy.y || (x.y === hoy.y && (x.m < hoy.m || (x.m === hoy.m && x.d <= hoy.d))); };
    const vis = st.hist === 'todo' ? l : l.filter(function (x) { return x.y >= a - 15 && x.y <= a + 25; });
    let h = '<p class="nota">La historia real llega hasta 2026 (sin personas reales); después siguen las eras de ficción y, desde 2150, eventos que salen de tu partida.</p>' +
      '<div class="fila">' + chip('Cerca de hoy', 'hsVer', 'cerca', st.hist === 'cerca') + chip('Toda la historia', 'hsVer', 'todo', st.hist === 'todo') + '</div>';
    const act = IA.historia.activos();
    if (act.length) h += '<div class="tarjeta"><b>Ahora mismo:</b> ' + act.map(function (p) { return esc(p.txt || { guerra1: 'Primera Guerra Mundial', guerra2: 'Segunda Guerra Mundial', depresion: 'Gran Depresión', hays: 'Código de Producción (censura)', huelgaG: 'Huelga de guionistas', huelgaA: 'Huelga de actores' }[p.id] || p.tipo || p.id); }).join(' · ') + '</div>';
    h += '<div class="col">' + vis.map(function (x) {
      return '<div class="cal-ev' + (pasado(x) ? '' : ' tenue') + '"><b class="cifra">' + x.y + '</b><div class="col crece"><span>' + esc(x.txt) + '</span><span class="tenue chico">' + esc(IA.cal.texto({ y: x.y, m: x.m, d: x.d }, true)) + (x.gen ? ' · generado' : '') + '</span></div></div>';
    }).join('') + '</div>';
    return h;
  }
  ac('hsVer', function (v) { st.hist = v; U.refrescar(); });

  // ---------- Bitácora del estudio ----------
  function bitacora() {
    const b = N.S.bitacora || [];
    if (!b.length) return '';
    return '<div class="tarjeta"><h3>Bitácora del estudio</h3>' + b.slice(0, 4).map(function (x) { return '<p class="chico"><span class="tenue">' + esc(U.fechaCorta(x.t)) + '</span> ' + esc(x.txt) + ' <b>→ ' + esc(x.op) + '</b>' + (x.r ? ' <span class="tenue">' + esc(x.r) + '</span>' : '') + '</p>'; }).join('') +
      (b.length > 4 ? btn('Ver toda la bitácora', 'bitTodo') : '') + '</div>';
  }
  ac('bitTodo', function () { U.modal('<h2>Bitácora del estudio</h2>' + (N.S.bitacora || []).map(function (x) { return '<p class="chico"><span class="tenue">' + esc(U.fecha(x.t)) + '</span><br>' + esc(x.txt) + ' <b>→ ' + esc(x.op) + '</b> ' + esc(x.r || '') + '</p>'; }).join('') + '<button class="btn bloque" data-a="cerrarModal">Cerrar</button>'); });

  // ---------- Evento con decisión ----------
  function mostrarEvento() {
    const ev = IA.eventos.pendiente();
    if (!ev) return false;
    U.modal('<h2>Decide</h2><p>' + esc(ev.txt) + '</p><div class="col">' + ev.ops.map(function (o, i) { return btn(o, 'evDecidir', i, i === 0 ? 'primario' : ''); }).join('') + '</div>');
    return true;
  }
  ac('evDecidir', function (v) { const r = IA.eventos.decidir(+v); U.cerrarModal(); U.aviso(r || 'Anotado en la bitácora'); U.refrescar(); });

  // ---------- Quiebra: tres salidas ----------
  function quiebra() {
    const S = N.S;
    if (!S.quiebra) return;
    if (S.quiebra.fin) {
      U.modal('<h2>' + IA.t('quiebra_titulo') + '</h2><p>El estudio cerró.</p><div class="col"><button class="btn primario" data-a="abrirGuardado">' + IA.t('cargar') + '</button><button class="btn" data-a="salir">' + IA.t('aj_salir') + '</button></div>');
      return;
    }
    U.modal('<h2>' + IA.t('quiebra_titulo') + '</h2><p>' + IA.t('quiebra_texto') + '</p><div class="col">' + B.salidasQuiebra().map(function (x) {
      return '<div class="tarjeta"><b>' + esc(x.nombre) + '</b><p class="chico">' + esc(x.texto) + '</p>' + btn('Elegir', 'qbSalir', x.id, x.id === 'terminar' ? '' : 'primario', x.ok === false ? 'No disponible' : '') + '</div>';
    }).join('') + '</div>');
  }
  ac('qbSalir', function (v) { const e = B.salir(v); if (e) return U.aviso(e, 'mal'); if (v === 'terminar') return quiebra(); U.cerrarModal(); U.aviso('El estudio sigue en pie'); U.refrescar(); });

  return { banco: banco, imperio: imperio, rivales: rivales, historia: historia, bitacora: bitacora, mostrarEvento: mostrarEvento, quiebra: quiebra };
})();
