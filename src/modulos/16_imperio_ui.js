/* ==== módulo: imperio_ui ==== */
// Pantallas de Banco (crédito, préstamos, cuentas, socio y junta, inversiones, balance y cambio de marca),
// Imperio (sedes, filiales y compra de estudios, coproducciones, encargos, financiar, distribución, negocios para
// fans e investigación), Rivales (ranking ordenable con filtros, estrellas y taquillas) e Historia (hitos con su
// día); la bitácora del estudio, los eventos con decisión y la quiebra con sus tres salidas.
ART.imperioUI = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, O = ART.obras, U = ART.ui, B = ART.banco, I = ART.imperio, esc = N.esc;
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
    h += '<p class="nota info">Con más prestigio subes de banco (' + B.ESCALONES.map(function (x) { return x.nombre + ' desde ' + Math.round(x.fama * 100); }).join(' · ') + '). Pagar a tiempo sube tu puntaje; los atrasos lo bajan.</p>';
    h += '<div class="tarjeta"><h3>Pedir un préstamo</h3><div class="fila"><label class="campo crece"><span>Monto</span><input id="bnMonto" type="number" value="' + Math.round(Math.min(B.limite(), ART.economia.presupuestoTipico(N.anio()))) + '"></label>' +
      '<label class="campo"><span>Plazo</span>' + sel('bnPlazo', [[12, '1 año'], [24, '2 años'], [36, '3 años'], [60, '5 años'], [120, '10 años']], 36) + '</label></div>' + btn('Pedir', 'bnPedir', '', 'primario bloque') + '</div>';
    h += '<h3>Cuentas por pagar este mes</h3>' + (B.cuentasDelMes().length ? B.cuentasDelMes().map(function (c) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(c.txt) + '</b>' + (c.d ? '<span class="tenue chico">Saldo ' + dinero(c.d.saldo) + ' · ' + Math.round(c.d.tasa * 1000) / 10 + ' % anual</span>' : '') + '</div><span class="cifra">' + dinero(c.monto) + '</span>' + (c.d ? btn('Pagar todo', 'bnPrepagar', c.d.id) : '') + '</div>';
    }).join('') + '<p class="tenue chico">Se pagan solas cada mes. Sin caja hay atraso, recargo y baja tu puntaje.</p>' : '<p class="tenue">No debes nada.</p>');
    const so = B.socio();
    h += '<h3>' + (so ? 'Tu socio: ' + esc(so.nom) + ' (' + Math.round(so.parte * 100) + ' %)' : 'La junta') + '</h3><p class="chico">Paciencia ' + B.junta() + ' / 100</p>' + barra(B.junta()) +
      '<p class="nota">' + (so ? 'Se lleva su parte de las utilidades y opina en los gastos grandes; si se le acaba la paciencia, toma más control.' : 'Si se le acaba la paciencia, te impone un socio.') + '</p>' + (so ? btn('Recomprar su parte', 'bnRecomprar') : '');
    h += '<div class="tarjeta"><b>Inversiones</b><p class="nota">Las acciones de compañías y de los rivales están en su propia pestaña.</p>' + btn('Ir a Inversiones', 'imVerInv', '', 'primario') + '</div>';
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
    const S = N.S, a = N.anio(), rivs = ART.rivales.activos();
    let h = '<h3>Sedes en otros países</h3><p class="nota info">Rodar donde tienes sede cuesta 15 % menos y aparecen talentos locales.</p>' +
      (I.sedes().length ? '<p>' + I.sedes().map(function (x) { const p = D.pais(x.pais); return esc(p.nombre) + ' ' + btn('Cerrar', 'imCerrarSede', x.pais); }).join(' · ') + '</p>' : '') +
      '<div class="fila">' + sel('imPais', D.paises.filter(function (p) { return p.id !== S.estudios[0].pais; }).map(function (p) { return [p.id, p.nombre + ' · ' + dinero(I.costoSede(p.id))]; }), '') + btn('Abrir sede', 'imSede', '', 'primario') + '</div>';
    h += '<h3>Filiales y compra de estudios</h3><p class="nota info">Una filial sigue filmando con su estilo, te cuesta cada mes y te da dividendos si gana. No puedes comprar si juntos superan el ' + Math.round(ART.economia.P.ANTIMONOPOLIO * 100) + ' % del mercado.</p><div class="col">' +
      rivs.map(function (e) {
        if (e.filial) return '<div class="cal-ev"><div class="col crece"><b class="oro">' + esc(e.nombre) + '</b><span class="tenue chico">Filial · caja ' + dinero(e.caja) + ' · ' + dinero(I.costoFilial(e)) + '/mes</span></div>' + btn('Vender', 'imVenderFil', e.id) + '</div>';
        const err = I.puedeComprar(e.id);
        return '<div class="cal-ev"><div class="col crece"><b>' + esc(e.nombre) + '</b><span class="tenue chico">' + dinero(I.precioEstudio(e.id)) + '</span></div>' + btn('Comprar', 'imComprarEst', e.id, err ? '' : 'primario', err) + '</div>';
      }).join('') + '</div>';
    h += '<div class="tarjeta"><b>Coproducciones, encargos, financiación y distribución</b><p class="nota">Ahora tienen su propia pestaña.</p>' + btn('Ir a Colaboraciones', 'imVerColab', '', 'primario') + '</div>';
    h += '<h3>Negocios para fans</h3><p>' + ['tienda', 'museo', 'parque', 'arena'].map(function (id) { const x = I.info(id); return x ? (I.tiene(id) ? '✔ ' : '✖ ') + esc(x.nombre) : ''; }).join(' · ') + '</p><p class="nota info">Se construyen en Negocio › Construcciones.</p>' +
      (a >= 1950 ? '<div class="fila">' + sel('imEvObra', [['', 'Sin obra en especial']].concat(O.enProduccion(0).concat(O.delEstudio(0, ['lista'])).map(function (o) { return [o.id, o.tit]; })), '') + btn('Organizar convención · ' + dinero(I.costoEvento()), 'imEvento', '', 'primario') + '</div>' : '');
    const inv = I.investigando();
    h += '<h3>Investigación</h3>' + (inv ? '<p class="bien">Investigas «' + esc(I.invento(inv.id).nombre) + '»: faltan ' + inv.sr + ' semanas.</p>' : '') + '<p class="nota info">Un invento propio o licenciado da +1 a su departamento (hasta +3) mientras es novedad (hasta 5 años después de llegar al mundo).</p><div class="col">' +
      inventosPorAnio().filter(function (x) { const e = I.estadoInvento(x); return e !== 'mundo' || x.anio > a - 5; }).slice(0, 14).map(filaInvento).join('') + '</div>' +
      '<button class="btn" data-a="imVerInventos">Ver todos los inventos hasta 2300</button>';
    return h;
  }
  // Negocio › Colaboraciones: coproducciones, encargos, financiar obras ajenas y distribución exclusiva
  function colaboraciones() {
    const S = N.S, a = N.anio(), rivs = ART.rivales.activos();
    let h = '<p class="nota info">Trabajar con los rivales: compartes costos y ganancias, encargas obras o recibes encargos, financias el final de sus producciones o distribuyes sus estrenos.</p>';
    const enDes = O.enProduccion(0).filter(function (o) { return ['desarrollo', 'preproduccion'].indexOf(o.et) >= 0 && !o.copro; });
    h += '<h3>Coproducciones</h3><p class="nota info">Un rival pone el 40 % del costo y se lleva el 40 % de lo que gane.</p>' + (enDes.length ? '<div class="fila">' + sel('imCoObra', enDes.map(function (o) { return [o.id, o.tit]; }), '') + sel('imCoEst', rivs.map(function (e) { return [e.id, e.nombre]; }), '') + btn('Proponer', 'imCopro', '', 'primario') + '</div>' : '<p class="tenue chico">Necesitas una obra en desarrollo o preproducción.</p>');
    h += '<h3>Encargos</h3><p class="nota info">Pagas a un rival para que filme por ti (te quedas con el 75 %) o aceptas un encargo suyo (te pagan y se quedan con el 70 %).</p><div class="fila">' +
      sel('imEnEst', rivs.map(function (e) { return [e.id, e.nombre]; }), '') + sel('imEnGen', D.familias.map(function (f) { return [f.generos[0], f.generos[0]]; }), '') + btn('Encargar', 'imEncargar', '', 'primario') + '</div>' +
      I.ofertasEncargo().map(function (x) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(S.estudios[x.est].nombre) + '</b><span class="tenue chico">Quiere una obra del género «' + esc(x.gen) + '» · te paga ' + dinero(x.pago) + '</span></div>' + btn('Aceptar', 'imAceptarEnc', x.id) + '</div>'; }).join('') +
      (S.encargoPend ? '<p class="bien chico">Encargo aceptado: tu próxima obra del género «' + esc(S.encargoPend.gen) + '» lo cumple.</p>' : '');
    h += '<h3>Financiar proyectos ajenos</h3><p class="nota info">Pones el 25 % del costo y recibes el 30 % de su parte de taquilla.</p>' + (I.proyectosAjenos().map(function (o) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(o.tit) + '</b><span class="tenue chico">' + esc(S.estudios[o.est].nombre) + ' · pones ' + dinero(Math.round(O.costoTotal(o) * 0.25)) + '</span></div>' + btn('Financiar', 'imFinanciar', o.id) + '</div>';
    }).join('') || '<p class="tenue chico">Ningún proyecto busca dinero ahora.</p>');
    h += '<h3>Distribución exclusiva</h3><p class="nota info">Distribuyes las obras de un rival y te quedas con el 8 % de su taquilla.</p>' + I.distribuciones().filter(function (d) { return d.hasta > S.t; }).map(function (d) { return '<p class="chico">' + esc(S.estudios[d.est].nombre) + ' hasta ' + esc(U.fechaCorta(d.hasta)) + '</p>'; }).join('') +
      '<div class="fila">' + sel('imDiEst', rivs.map(function (e) { return [e.id, e.nombre + ' · ' + dinero(I.costoDistribucion(e.id)) + '/año']; }), '') + btn('Firmar 2 años', 'imDistrib', '', 'primario') + '</div>';
    return h;
  }
  // Negocio › Inversiones: compañías de cada época y acciones de los rivales
  function inversiones() {
    const b = B.estado();
    let h = '<p class="nota info">Compra acciones y véndelas cuando quieras. Las compañías nuevas crecen más, pero también caen más; el índice de un rival sube con sus utilidades y baja con sus pérdidas. Nada es seguro.</p>';
    h += '<h3>Compañías</h3><div class="col">' + B.companias().map(function (c) {
      const a = b.acc[c.id];
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(c.nombre) + '</b><span class="tenue chico">Índice ' + B.precio(c.id) + (a ? ' · tienes ' + dinero(B.valorAccion(c.id)) + ' (pagaste ' + dinero(a.costo) + ')' : '') + '</span></div>' +
        (a ? btn('Vender', 'bnVender', c.id) : '') + btn('Comprar', 'bnComprar', c.id, 'primario') + '</div>';
    }).join('') + '</div><label class="campo"><span>Monto por compra</span><input id="bnAcc" type="number" value="' + Math.round(ART.economia.presupuestoTipico(N.anio()) * 0.5) + '"></label>';
    const rv = B.rivalesCotizan();
    h += '<h3>Acciones de los rivales</h3><div class="col">' + (rv.length ? rv.map(function (c) {
      const x = b.acc[c.id];
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(c.nombre) + '</b><span class="tenue chico">Índice ' + B.precio(c.id) + (x ? ' · tienes ' + dinero(B.valorAccion(c.id)) + ' (pagaste ' + dinero(x.costo) + ')' : '') + '</span></div>' +
        (x ? btn('Vender', 'bnVender', c.id) : '') + btn('Comprar', 'bnComprar', c.id, 'primario') + '</div>';
    }).join('') : '<p class="tenue">No hay rivales que coticen.</p>') + '</div>';
    return h;
  }
  ac('imVerColab', function () { U.irA('negocio', 'colaboraciones'); });
  ac('imVerInv', function () { U.irA('negocio', 'inversiones'); });
  // ---------- Negocio › Casino: ruleta, dados, tragamonedas de cine y apuestas a la taquilla de la semana ----------
  // Dinero del juego, nunca real. La casa siempre tiene ventaja (como en un casino de verdad) y el tope de cada apuesta
  // es una parte pequeña de tu caja libre. Lo ganado o perdido va a «Casino y apuestas», fuera de la utilidad.
  const ROJOS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const SIMBOLOS = ['🎬', '🎭', '🎵', '🎮', '📚', '⭐'];
  let ultimaJugada = '';
  function cas() { const S = N.S; if (!S.casino) S.casino = { jug: 0, gan: 0, per: 0, apuestas: [] }; return S.casino; }
  function topeApuesta() { return Math.max(0, Math.round(Math.min(ART.negocio.cajaLibre(0) * 0.05, ART.economia.presupuestoTipico(N.anio()) * 0.25))); }
  function montoApuesta() { const el = document.getElementById('csMonto'), t = topeApuesta(); return Math.round(N.limitar(+(el ? el.value : 0) || 0, 0, t)); }
  function jugar(monto, mult, txt) {
    const c = cas(), NG = ART.negocio;
    NG.pagar(0, 'casino', monto);
    const premio = Math.round(monto * mult);
    if (premio > 0) NG.cobrarEn(0, 'casino', premio);
    c.jug++; if (premio > monto) c.gan += premio - monto; else c.per += monto - premio;
    ultimaJugada = txt + (premio > monto ? ' · ganas ' + dinero(premio - monto) : premio === monto ? ' · recuperas tu apuesta' : ' · pierdes ' + dinero(monto - premio));
    ART.arte.sonido(premio > monto ? 'exito' : 'clic');
    U.aviso(ultimaJugada, premio > monto ? '' : 'mal');
    U.refrescar();
  }
  function validar() { const m = montoApuesta(); if (!m) { U.aviso('Pon un monto (hasta ' + dinero(topeApuesta()) + ').', 'mal'); return 0; } return m; }
  // La apuesta a la taquilla se resuelve al cerrar la semana: gana la obra con más taquilla esa semana
  N.on('semana', function () {
    const S = N.S;
    if (!S || !S.casino || !S.casino.apuestas.length) return;
    S.casino.apuestas = S.casino.apuestas.filter(function (x) {
      if (S.t <= x.t) return true;
      const obras = x.ids.map(O.porId).filter(Boolean);
      const sem = function (o) { return o.hs && o.hs.length ? o.hs[o.hs.length - 1] : 0; };
      const gana = obras.sort(function (p, q) { return sem(q) - sem(p); })[0];
      const ok = gana && gana.id === x.elegido, premio = ok ? Math.round(x.monto * x.cuota) : 0;
      if (premio) ART.negocio.cobrarEn(0, 'casino', premio);
      S.casino.jug++; if (ok) S.casino.gan += premio - x.monto; else S.casino.per += x.monto;
      N.emit('noticia', { tipo: 'negocio', texto: 'Apuesta a la taquilla: ' + (gana ? '«' + gana.tit + '» fue la más vista. ' : '') + (ok ? 'Ganas {$}.' : 'Perdiste tu apuesta.'), monto: premio });
      return false;
    });
  });
  function candidatosTaquilla() {
    const sem = function (o) { return o.hs && o.hs.length ? o.hs[o.hs.length - 1] : 0; };
    const L = O.enCartelera().slice().sort(function (p, q) { return sem(q) - sem(p); }).slice(0, 4);
    const tot = L.reduce(function (s, o) { return s + Math.max(1, sem(o)); }, 0);
    return L.map(function (o) { return { o: o, cuota: N.redondear(N.limitar(0.9 * tot / Math.max(1, sem(o)), 1.2, 12), 1) }; });
  }
  function casino() {
    const c = cas(), tope = topeApuesta(), S = N.S;
    let h = '<p class="nota info">Un casino con dinero del juego: la casa siempre tiene ventaja. Cada apuesta llega hasta ' + dinero(tope) + ' (una parte de tu caja libre). Lo que ganas o pierdes no cuenta en la utilidad del estudio.</p>';
    h += '<div class="kpis">' + kpi('Jugadas', c.jug) + kpi('Ganado', dinero(c.gan), 'bien') + kpi('Perdido', dinero(c.per), 'mal') + kpi('Balance', dinero(c.gan - c.per), c.gan >= c.per ? 'bien' : 'mal') + '</div>';
    if (!tope) return h + '<p class="tenue">Sin caja libre no se apuesta.</p>';
    h += '<label class="campo"><span>Tu apuesta (hasta ' + dinero(tope) + ')</span><input id="csMonto" type="number" min="0" max="' + tope + '" value="' + Math.round(tope / 4) + '"></label>';
    if (ultimaJugada) h += '<p class="chico oro">' + esc(ultimaJugada) + '</p>';
    h += '<div class="tarjeta"><h3>Ruleta</h3><p class="nota">Rojo, negro, par o impar pagan el doble; un número, 36 veces. El 0 es de la casa.</p><div class="fila envolver">' +
      btn('Rojo', 'csRuleta', 'rojo') + btn('Negro', 'csRuleta', 'negro') + btn('Par', 'csRuleta', 'par') + btn('Impar', 'csRuleta', 'impar') +
      '<input id="csNum" type="number" min="0" max="36" value="7" style="width:76px" aria-label="Número">' + btn('Al número', 'csRuleta', 'num') + '</div></div>';
    h += '<div class="tarjeta"><h3>Dados</h3><p class="nota">Dos dados: más de 7 o menos de 7 pagan el doble; un 7 exacto, cinco veces.</p><div class="fila envolver">' +
      btn('Más de 7', 'csDados', 'alto') + btn('Menos de 7', 'csDados', 'bajo') + btn('Siete', 'csDados', 'siete') + '</div></div>';
    h += '<div class="tarjeta"><h3>Tragamonedas de cine</h3><p class="nota">Tres iguales pagan 8 veces (tres ⭐, 25 veces); dos iguales, una vez y media.</p>' + btn('Girar', 'csTraga', '', 'primario') + '</div>';
    const cand = candidatosTaquilla(), pend = c.apuestas.length;
    h += '<div class="tarjeta"><h3>Apuesta a la taquilla</h3><p class="nota">¿Cuál de estas será la más vista esta semana? Se resuelve al cerrar la semana; la cuota sale de cómo van ahora.</p>' +
      (pend ? '<p class="bien chico">Tienes ' + N.cuenta(pend, 'apuesta pendiente', 'apuestas pendientes') + '.</p>' : '') +
      (cand.length >= 2 ? '<div class="col">' + cand.map(function (x) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.o.tit) + '</b><span class="tenue chico">' + esc(S.estudios[x.o.est] ? S.estudios[x.o.est].nombre : '') + ' · paga ' + U.decimal(x.cuota, 1) + ' veces</span></div>' + btn('Apostar', 'csTaquilla', x.o.id) + '</div>'; }).join('') + '</div>' : '<p class="tenue">Hacen falta al menos dos obras en cartelera.</p>') + '</div>';
    return h;
  }
  ac('csRuleta', function (v) {
    const m = validar(); if (!m) return;
    const n = N.entero(0, 36), rojo = ROJOS.indexOf(n) >= 0, el = document.getElementById('csNum'), num = Math.round(N.limitar(+(el ? el.value : 0) || 0, 0, 36));
    const gana = v === 'rojo' ? n > 0 && rojo : v === 'negro' ? n > 0 && !rojo : v === 'par' ? n > 0 && n % 2 === 0 : v === 'impar' ? n % 2 === 1 : n === num;
    jugar(m, gana ? (v === 'num' ? 36 : 2) : 0, 'La bola cae en el ' + n + (n ? (rojo ? ' rojo' : ' negro') : ''));
  });
  ac('csDados', function (v) {
    const m = validar(); if (!m) return;
    const a = N.entero(1, 6), b = N.entero(1, 6), s = a + b;
    const gana = v === 'alto' ? s > 7 : v === 'bajo' ? s < 7 : s === 7;
    jugar(m, gana ? (v === 'siete' ? 5 : 2) : 0, 'Dados: ' + a + ' y ' + b + ' (' + s + ')');
  });
  ac('csTraga', function () {
    const m = validar(); if (!m) return;
    const r = [N.elegir(SIMBOLOS), N.elegir(SIMBOLOS), N.elegir(SIMBOLOS)];
    const tres = r[0] === r[1] && r[1] === r[2], dos = !tres && (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]);
    jugar(m, tres ? (r[0] === '⭐' ? 25 : 8) : dos ? 1.5 : 0, r.join(' '));
  });
  ac('csTaquilla', function (v) {
    const m = validar(); if (!m) return;
    const cand = candidatosTaquilla(), x = cand.filter(function (y) { return y.o.id === +v; })[0];
    if (!x) return;
    ART.negocio.pagar(0, 'casino', m);
    cas().apuestas.push({ t: N.S.t, ids: cand.map(function (y) { return y.o.id; }), elegido: x.o.id, monto: m, cuota: x.cuota });
    U.aviso('Apuestas ' + dinero(m) + ' a «' + x.o.tit + '» (paga ' + U.decimal(x.cuota, 1) + ' veces)');
    U.refrescar();
  });
  // Inventos en orden de llegada (los de ficción se agregaron al final de la lista para no cambiar ids)
  function inventosPorAnio() { return ART.historia.INVENTOS.slice().sort(function (x, y) { return x.anio - y.anio; }); }
  function filaInvento(x) {
    const inv = I.investigando(), e = I.estadoInvento(x), nom = { tuyo: 'Tuyo', licencia: 'Licenciado', mundo: 'Ya llegó al mundo', rival: 'Lo tiene un rival', investigable: 'Investigable', futuro: 'Futuro' }[e];
    const accion = e === 'investigable' ? btn('Investigar · ' + dinero(I.costoInvento(x)) + ' · ' + I.semanasInvento(x) + ' sem', 'imInvestigar', x.id, 'primario', inv ? 'Ya investigas otra cosa' : '') : e === 'rival' ? btn('Licenciar · ' + dinero(I.costoLicenciaTec(x)), 'imLicTec', x.id) : '';
    return '<div class="cal-ev"><b class="cifra">' + x.anio + '</b><div class="col crece"><span>' + esc(x.nombre) + (x.anio > 2026 ? ' <span class="etiqueta">ficción</span>' : '') + '</span><span class="tenue chico">' + esc(nom) + ' · ' + esc(ART.rodaje.nombreDep(x.dep)) + (x.texto ? ' · ' + esc(x.texto) : '') + '</span></div>' + accion + '</div>';
  }
  // Negocio › Inventos: toda la tecnología del arte, de 1895 a 2300
  function inventos() {
    const a = N.anio(), L = inventosPorAnio(), inv = I.investigando();
    const grupo = function (titulo, l) { return l.length ? '<h3>' + titulo + ' (' + l.length + ')</h3><div class="col">' + l.map(filaInvento).join('') + '</div>' : ''; };
    const est = function (x) { return I.estadoInvento(x); };
    return '<p class="nota info">Cada invento da +1 a su departamento (hasta +3) a quien lo tiene antes que el mundo y hasta 5 años después. Investiga los que se acercan o licencia los que ya tiene un rival. Los posteriores a 2026 son ficción basada en predicciones.</p>' +
      (inv ? '<p class="bien">Investigas «' + esc(I.invento(inv.id).nombre) + '»: faltan ' + inv.sr + ' semanas.</p>' : '') +
      grupo('Para investigar o licenciar', L.filter(function (x) { const e = est(x); return e === 'investigable' || e === 'rival'; })) +
      grupo('Tuyos y licenciados', L.filter(function (x) { const e = est(x); return e === 'tuyo' || e === 'licencia'; })) +
      grupo('Lo que viene', L.filter(function (x) { return est(x) === 'futuro'; })) +
      '<details><summary class="tenue">Ya llegaron al mundo (' + L.filter(function (x) { return est(x) === 'mundo'; }).length + ')</summary><div class="col">' + L.filter(function (x) { return est(x) === 'mundo'; }).reverse().map(filaInvento).join('') + '</div></details>';
  }
  ac('imVerInventos', function () { U.irA('negocio', 'inventos'); });
  ac('imSede', function () { avisar(I.abrirSede(val('imPais')), 'Sede abierta'); });
  ac('imCerrarSede', function (v) { I.cerrarSede(v); U.refrescar(); });
  ac('imComprarEst', function (v) { avisar(I.comprarEstudio(+v), 'Estudio comprado: ahora es tu filial'); U.refrescar(); });
  ac('imVenderFil', function (v) { avisar(I.venderFilial(v), 'Filial vendida'); });
  ac('imCopro', function () { avisar(I.coproducir(+val('imCoObra'), +val('imCoEst')), 'Coproducción firmada'); });
  ac('imEncargar', function () { avisar(ART.creacion.conAzarUI(function () { return I.encargar(+val('imEnEst'), val('imEnGen'), 2); }), 'Encargo hecho'); });
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
      return { e: e, cuota: ART.negocio.cuotaAnioActual(e.id), patrimonio: e.caja + (e.tam || 1) * ART.economia.presupuestoTipico(a) * 4, ingresos: e.ingAnio || 0, obras: r.length,
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
      const e = f.e, es = ART.rivales.ESTRATEGIAS[e.estr];
      return '<div class="tarjeta' + (e.id === 0 ? ' oro' : '') + '"><div class="fila"><canvas data-logo="' + e.id + '" style="width:30px;height:30px"></canvas><div class="col crece"><b>' + (i + 1) + '. ' + esc(e.nombre) + '</b><span class="tenue chico">' +
        (e.quebrado ? (e.fusion !== undefined ? 'Se fusionó en ' + e.quebrado : 'Quebró en ' + e.quebrado) : estrellas(ART.rivales.estrellas(e)) + (es ? ' · ' + esc(es.nombre) : e.id === 0 ? ' · tu estudio' : '') + (e.filial ? ' · tu filial' : '')) +
        ' · ' + esc((D.pais(e.pais) || {}).nombre || '') + '</span></div><span class="cifra">' + U.pct(f.cuota) + '</span></div><span class="chico">Ingresos ' + dinero(f.ingresos) + ' · ' + f.obras + ' obras · crítica ' + f.calif + ' · prestigio ' + Math.round(f.prestigio * 100) + '</span>' +
        (e.texto ? '<span class="tenue chico"> · ' + esc(e.texto) + '</span>' : '') +
        (e.id !== 0 && !e.quebrado && !e.filial ? '<div class="fila" style="margin-top:6px">' + btn('Comprar este estudio · ' + dinero(ART.imperio.precioEstudio(e.id)), 'imComprarEst', e.id, '', ART.imperio.puedeComprar(e.id)) + '</div>' : '') + '</div>';
    }).join('') + '</div>';
    const anio = S.obras.filter(function (o) { return o.anio === a && o.bruto; }).sort(function (x, y) { return y.bruto - x.bruto; }).slice(0, 10);
    const siempre = S.obras.filter(function (o) { return o.bruto; }).sort(function (x, y) { return ART.mundo.aHoy(y.bruto, y.anio || a) - ART.mundo.aHoy(x.bruto, x.anio || a); }).slice(0, 10);
    const lista = function (l, hoy) { return '<div class="col">' + l.map(function (o, i) { return '<div class="cal-ev" data-a="verObra" data-v="' + o.id + '" style="cursor:pointer"><b class="cifra">' + (i + 1) + '</b><div class="col crece"><span' + (o.est === 0 ? ' class="oro"' : '') + '>' + esc(o.tit) + '</span><span class="tenue chico">' + esc((S.estudios[o.est] || {}).nombre || '') + ' · ' + (o.anio || '') + '</span></div><span class="cifra">' + dinero(hoy ? ART.mundo.aHoy(o.bruto, o.anio || a) : o.bruto) + '</span></div>'; }).join('') + '</div>'; };
    h += '<h3>Taquilla del año</h3>' + (anio.length ? lista(anio) : '<p class="tenue">Aún no hay estrenos este año.</p>') + '<h3>Taquilla de todos los tiempos (en dólares de hoy)</h3>' + lista(siempre, true);
    if (m.anio.total) h += '<p class="tenue chico">Otras productoras: ' + U.pct(m.anio.otras / m.anio.total) + ' del mercado este año.</p>';
    return h;
  }
  ac('rvOrden', function (v) { st.orden = v; U.refrescar(); });
  ac('rvFiltro', function (v) { st.filtro = v; U.refrescar(); });

  // ---------- Mundo › Historia ----------
  function historia() {
    const a = N.anio(), hoy = ART.cal.inicioDeT(N.S.t);
    const l = ART.historia.lineaDeTiempo();
    const pasado = function (x) { return x.y < hoy.y || (x.y === hoy.y && (x.m < hoy.m || (x.m === hoy.m && x.d <= hoy.d))); };
    const vis = st.hist === 'todo' ? l : l.filter(function (x) { return x.y >= a - 15 && x.y <= a + 25; });
    let h = '<p class="nota info">La historia real llega hasta 2026 (sin personas reales); después siguen las eras de ficción y, desde 2150, eventos que salen de tu partida.</p>' +
      '<div class="fila">' + chip('Cerca de hoy', 'hsVer', 'cerca', st.hist === 'cerca') + chip('Toda la historia', 'hsVer', 'todo', st.hist === 'todo') + chip('Archivo de curiosidades', 'hsVer', 'curio', st.hist === 'curio') + chip('Hitos del arte', 'hsVer', 'arte', st.hist === 'arte') + '</div>';
    if (st.hist === 'arte') {
      const HA = ART.hitosArte.hasta(a).slice().reverse(), TIPO = ART.idioma.actual() === 'en' ? { o: 'Work', c: 'Movement', m: 'Milestone' } : { o: 'Obra', c: 'Corriente', m: 'Momento' };
      return h + '<p class="nota">Obras, corrientes y momentos reales del arte hasta ' + a + ' (' + HA.length + '). Las obras famosas se pueden cargar como material con licencia en Obras › Crear obra › Usar material.</p>' +
        '<div class="col" data-fijo="' + (ART.idioma.actual() === 'en' ? '1' : '') + '">' + HA.map(function (x) { return '<div class="cal-ev"><b class="cifra">' + x[0] + '</b><div class="col crece"><span>' + esc(ART.hitosArte.texto(x)) + '</span><span class="tenue chico">' + (TIPO[x[1]] || '') + '</span></div></div>'; }).join('') + '</div>';
    }
    if (st.hist === 'curio') {
      const cs = ART.curiosidades.todas(a);
      return h + '<p class="nota">' + cs.length + ' de ' + ART.curiosidades.total() + ' temas desbloqueados: aparecen cuando la partida llega a su año.</p>' + cs.map(fichaCuriosidad).join('');
    }
    const act = ART.historia.activos();
    if (act.length) h += '<div class="tarjeta"><b>Ahora mismo:</b> ' + act.map(function (p) { return esc(p.txt || { guerra1: 'Primera Guerra Mundial', guerra2: 'Segunda Guerra Mundial', depresion: 'Gran Depresión', hays: 'Código de Producción (censura)', huelgaG: 'Huelga de guionistas', huelgaA: 'Huelga de actores' }[p.id] || p.tipo || p.id); }).join(' · ') + '</div>';
    h += '<div class="col">' + vis.map(function (x) {
      return '<div class="cal-ev' + (pasado(x) ? '' : ' tenue') + '"><b class="cifra">' + x.y + '</b><div class="col crece"><span>' + esc(x.txt) + '</span><span class="tenue chico">' + esc(ART.cal.texto({ y: x.y, m: x.m, d: x.d }, true)) + (x.gen ? ' · generado' : '') + '</span></div></div>';
    }).join('') + '</div>';
    return h;
  }
  ac('hsVer', function (v) { st.hist = v; U.refrescar(); });
  // ---------- Archivo de curiosidades: lo que todos saben y lo que pocos saben ----------
  function fichaCuriosidad(c, conBoton) {
    return '<div class="tarjeta curio" data-fijo="1"><div class="fila entre"><h3>' + esc(c.tema) + '</h3><span class="etiqueta">' + c.anio + '</span></div>' +
      '<p class="curio-todos"><b>' + (ART.idioma.actual() === 'en' ? 'What everyone knows' : 'Lo que todos saben') + '</b><br>' + esc(c.todos) + '</p>' +
      '<p class="curio-pocos"><b>' + (ART.idioma.actual() === 'en' ? 'What few people know' : 'Lo que pocos saben') + '</b><br>' + esc(c.pocos) + '</p>' +
      (conBoton ? '<button class="btn" data-a="otraCuriosidad">' + (ART.idioma.actual() === 'en' ? 'Another one' : 'Otra curiosidad') + '</button>' : '') + '</div>';
  }
  let desplazarCurio = 0;
  function curiosidad() { const c = ART.curiosidades.deLaSemana(desplazarCurio); return c ? fichaCuriosidad(c, true) : ''; }
  ac('otraCuriosidad', function () { desplazarCurio++; U.refrescar(); });

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
    const ev = ART.eventos.pendiente();
    if (!ev) return false;
    U.modal('<h2>Decide</h2><p>' + esc(ev.txt) + '</p><div class="col">' + ev.ops.map(function (o, i) { return btn(o, 'evDecidir', i, i === 0 ? 'primario' : ''); }).join('') + '</div>');
    return true;
  }
  ac('evDecidir', function (v) { const r = ART.eventos.decidir(+v); U.cerrarModal(); U.aviso(r || 'Anotado en la bitácora'); U.refrescar(); });

  // ---------- Quiebra: tres salidas ----------
  function quiebra() {
    const S = N.S;
    if (!S.quiebra) return;
    if (S.quiebra.fin) {
      U.modal('<h2>' + ART.t('quiebra_titulo') + '</h2><p>El estudio cerró.</p><div class="col"><button class="btn primario" data-a="abrirGuardado">' + ART.t('cargar') + '</button><button class="btn" data-a="salir">' + ART.t('aj_salir') + '</button></div>');
      return;
    }
    U.modal('<h2>' + ART.t('quiebra_titulo') + '</h2><p>' + ART.t('quiebra_texto') + '</p><div class="col">' + B.salidasQuiebra().map(function (x) {
      return '<div class="tarjeta"><b>' + esc(x.nombre) + '</b><p class="chico">' + esc(x.texto) + '</p>' + btn('Elegir', 'qbSalir', x.id, x.id === 'terminar' ? '' : 'primario', x.ok === false ? 'No disponible' : '') + '</div>';
    }).join('') + '</div>');
  }
  ac('qbSalir', function (v) { const e = B.salir(v); if (e) return U.aviso(e, 'mal'); if (v === 'terminar') return quiebra(); U.cerrarModal(); U.aviso('El estudio sigue en pie'); U.refrescar(); });

  return { banco: banco, imperio: imperio, inventos: inventos, colaboraciones: colaboraciones, inversiones: inversiones, casino: casino, rivales: rivales, historia: historia, bitacora: bitacora, curiosidad: curiosidad, mostrarEvento: mostrarEvento, quiebra: quiebra };
})();
