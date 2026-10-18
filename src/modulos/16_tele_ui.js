/* ==== módulo: tele_ui ==== */
// Pantallas de franquicias (lista, biografía y línea por fecha, personajes, continuidades, licencias,
// crossovers, mente maestra, registro, venta), Adquisición (derechos de rivales, libros y dominio público), botón
// Continuación con los siete caminos y la llamada al elenco, nueva serie (formato, episodios, sala, tramas,
// piloto y pitch), dónde se emite, renovar o cancelar; canal propio (parrilla, autocompletar, público por grupos,
// patrocinadores, tema y noticias) y plataforma de streaming (planes, catálogo, licencias, bóvedas, suministro).
ART.teleUI = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, O = ART.obras, U = ART.ui, F = ART.franquicias, TV = ART.tv, ST = ART.streaming, esc = N.esc;
  const dinero = U.dinero, ac = U.accion;
  const st = { fr: null, dia: 0, cont: null };
  function kpi(n, v, c) { return '<div class="kpi"><span>' + esc(n) + '</span><b class="cifra ' + (c || '') + '">' + esc(v) + '</b></div>'; }
  function btn(txt, a, v, cl) { return '<button class="btn ' + (cl || '') + '" data-a="' + a + '" data-v="' + esc(v === undefined ? '' : v) + '">' + esc(txt) + '</button>'; }
  function sel(c, ops, val, dv) { return '<select data-c="' + c + '"' + (dv !== undefined ? ' data-v="' + esc(dv) + '"' : '') + '>' + ops.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function nomEst(i) { return N.S.estudios[i] ? N.S.estudios[i].nombre : '—'; }
  function avisar(e, ok) { U.aviso(e || ok, e ? 'mal' : ''); }
  function refrescarFicha(id) { if (id && U.fichaAbierta()) U.refrescarFicha(ART.pantallas.fichaObra(+id)); else U.refrescar(); }
  function m(x) { return N.redondear(x, 1) + ' M'; }

  // ---------- Obras › Franquicias ----------
  function franquicias() {
    const S = N.S;
    const vivas = F.lista().filter(function (f) { return f.est === 0; });
    const sueltas = S.obras.filter(function (o) { return o.est === 0 && !o.fr && o.pub !== undefined && F.dueno(o) === 0; }).sort(function (a, b) { return b.pub - a.pub; }).slice(0, 12);
    let h = '<p class="nota info">Toda obra nace como franquicia. Continúala, regístrala, licencia a sus personajes o únela con otra. La fatiga del público sube con cada entrega seguida.</p>';
    h += (S.ofFr || []).map(function (x, i) { const f = F.porId(x.fr); return f ? '<div class="tarjeta"><b>' + esc(nomEst(x.est)) + '</b> quiere comprar «' + esc(f.nom) + '» por ' + dinero(x.precio) + '<div class="fila">' + btn('Vender', 'tvVenderOf', i, 'primario') + btn('Rechazar', 'tvRechazarOf', i) + '</div></div>' : ''; }).join('');
    h += '<h3>Tus franquicias</h3>' + (vivas.length ? '<div class="col">' + vivas.map(function (f) {
      const b = F.biografia(f);
      return '<div class="tarjeta" data-a="tvVerFr" data-v="' + f.id + '" style="cursor:pointer"><div class="fila entre"><b>' + esc(f.nom) + '</b><span class="etiqueta' + (b.nivel >= 3 ? ' oro' : '') + '">' + esc(b.nombreNivel) + '</span></div>' +
        '<span class="chico">' + b.entradas + ' obras · calidad ' + b.calidad + ' · hype ' + (b.hype > 0 ? '+' : '') + b.hype + ' · fatiga ' + b.fat + ' %' + (f.xo.length ? ' · crossover' : '') + '</span></div>';
    }).join('') + '</div>' : '<p class="tenue">Aún no tienes franquicias vivas: continúa o registra una obra.</p>');
    h += '<h3>Obras que pueden ser franquicia</h3><div class="col">' + (sueltas.length ? sueltas.map(function (o) {
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(o.tit) + '</b><span class="tenue chico">' + (o.tv ? 'Serie' : 'Cine') + ' · público ' + o.pub + '</span></div><div class="fila">' + btn('Continuación', 'tvContinuar', o.id, 'primario') + btn('Registrar', 'tvRegistrar', o.id) + '</div></div>';
    }).join('') : '<p class="tenue">Estrena obras para verlas aquí.</p>') + '</div>';
    return h;
  }
  function fichaFranquicia(id) {
    const f = F.porId(+id);
    if (!f) return '<p>No existe.</p>';
    const b = F.biografia(f), mia = f.est === 0, a = N.anio();
    let h = '<h2>' + esc(f.nom) + '</h2><p class="tenue">' + esc(f.gen) + ' · ' + esc(nomEst(f.est)) + ' · desde ' + N.anio(f.t0) + '</p><div class="kpis">' +
      kpi('Nivel', b.nombreNivel, b.nivel >= 3 ? 'oro' : '') + kpi('Calidad', b.calidad) + kpi('Hype', (b.hype > 0 ? '+' : '') + b.hype) + kpi('Fatiga', b.fat + ' %', b.fat > 50 ? 'mal' : '') + kpi('Recaudado', dinero(b.bruto)) + kpi('Valor', dinero(F.valor(f))) + '</div>';
    h += '<h3>Línea por fecha de estreno</h3><div class="col">' + b.linea.map(function (o) {
      const c = f.cont.filter(function (x) { return x.id === o.cnt; })[0];
      return '<div class="cal-ev" data-a="verObra" data-v="' + o.id + '" style="cursor:pointer"><b class="cifra">' + (o.fe !== undefined ? N.anio(o.fe) : '—') + '</b><div class="col crece"><span>' + esc(o.tit) + (o.cam ? ' · ' + esc(F.camino(o.cam).nombre) : '') + (o.tv ? ' · serie' : '') + '</span><span class="tenue chico">' +
        esc(o.cnt === -1 ? 'Fuera del canon' : c ? c.nom : 'Canon principal') + (o.pub !== undefined ? ' · público ' + o.pub : ' · ' + O.NOMBRE_ETAPA[o.et]) + '</span></div>' +
        (mia ? sel('tvCont', f.cont.map(function (x) { return [x.id, x.nom]; }).concat([['nueva', '+ Nueva continuidad'], ['nocanon', 'Fuera del canon']]), o.cnt, o.id) : '') + '</div>';
    }).join('') + '</div>';
    h += '<h3>Personajes</h3><div class="col">' + f.pers.map(function (p) {
      return '<div class="cal-ev"><b class="cifra">' + p.pop + '</b><div class="col crece"><span>' + esc(p.n) + ' · ' + esc(p.i || '') + '</span><span class="tenue chico">' + esc(p.a || '') + (p.tn ? ' · lo interpretó ' + esc(p.tn) : '') + '</span></div></div>';
    }).join('') + '</div>';
    if (mia) {
      const pr = F.productos(a);
      h += '<h3>Licencias y derivados</h3>' + (f.lic.length ? '<ul>' + f.lic.map(function (l) { const p = f.pers.filter(function (x) { return x.k === l.k; })[0]; return '<li>' + esc((F.PRODUCTOS.filter(function (x) { return x.id === l.p; })[0] || {}).nombre) + ' de ' + esc(p ? p.n : '') + (l.c ? ' (canon)' : ' (no canon)') + ' · ' + dinero(l.sem) + '/sem hasta ' + N.anio(l.hasta) + '</li>'; }).join('') + '</ul>' : '<p class="tenue chico">Sin licencias.</p>');
      if (pr.length && f.pers.length) h += '<div class="fila">' + sel('tvLicPers', f.pers.map(function (p) { return [p.k, p.n]; }), st.licP || f.pers[0].k) + sel('tvLicProd', pr.map(function (p) { return [p.id, p.nombre]; }), st.licProd || pr[0].id) +
        btn('Canon', 'tvLicenciar', f.id + '|1', 'primario') + btn('No canon (paga más, cansa)', 'tvLicenciar', f.id + '|0') + '</div>';
      const prods = N.S.talentos.filter(function (t) { return t.of === 'produccion' && !t.ret && !t.mu && t.hab >= 55; }).sort(function (x, y) { return y.hab - x.hab; }).slice(0, 15);
      h += '<h3>Mente maestra</h3><p class="nota info">Un productor que guía la franquicia: menos fatiga y algo más de entusiasmo.</p>' + sel('tvMente', [['', 'Nadie']].concat(prods.map(function (t) { return [t.id, t.nom + ' · ' + t.hab]; })), f.mente === null ? '' : f.mente, f.id);
      const otras = F.lista().filter(function (x) { return x.est === 0 && x !== f; });
      h += '<h3>Crossover</h3>' + (f.xo.length ? '<p>' + f.xo.map(function (x) { const g = F.porId(x); return g ? esc(g.nom) + ' ' + btn('Crear obra juntas', 'tvCruce', f.id + '|' + g.id, 'primario') + btn('Separar', 'tvSeparar', f.id + '|' + g.id) : ''; }).join('<br>') + '</p>' : '') +
        (otras.length ? '<div class="fila">' + sel('tvXo', otras.map(function (x) { return [x.id, x.nom]; }), st.xo || otras[0].id) + btn('Unir universos', 'tvUnir', f.id) + '</div>' : '<p class="tenue chico">Necesitas otra franquicia viva.</p>');
      const ult = b.linea.filter(function (o) { return o.pub !== undefined; }).pop();
      h += '<h3>Acciones</h3><div class="fila">' + (ult ? btn('Continuación', 'tvContinuar', ult.id, 'primario') : '') + btn('Renombrar', 'tvRegistrar', b.linea[0].id) + '</div>';
      const compradores = N.S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado; });
      if (compradores.length) h += '<div class="fila">' + sel('tvVendA', compradores.map(function (e) { return [e.id, e.nombre]; }), st.vendA || compradores[0].id) + btn('Vender por ' + dinero(F.valor(f)), 'tvVender', f.id) + '</div>';
    }
    return h + '<button class="btn bloque" data-a="cerrarModal">Cerrar</button>';
  }
  // Modal de continuación: camino, medio y personaje (spin-off)
  function modalContinuar(oid) {
    const o = O.porId(+oid), c = st.cont || { cam: 'secuela', med: o && o.tv ? 'tv' : 'cine', k: 0 };
    st.cont = c; c.o = +oid;
    const f = F.de(o);
    let h = '<h2>Continuación de «' + esc(o.tit) + '»</h2>' + (f ? '<p class="tenue">Fatiga de la franquicia: ' + Math.round(f.fat * 100) + ' %</p>' : '') + '<div class="col">' +
      F.CAMINOS.map(function (x) { return '<label class="cal-ev"><input type="radio" name="cam" data-c="tvCam" value="' + x.id + '"' + (c.cam === x.id ? ' checked' : '') + '><div class="col crece"><b>' + esc(x.nombre) + '</b><span class="tenue chico">' + esc(x.texto) + '</span></div></label>'; }).join('') + '</div>';
    h += '<div class="fila"><span>Medio:</span>' + sel('tvMed', [['cine', 'Cine']].concat(TV.puedeTV(N.anio()) ? [['tv', 'Serie de TV']] : []), c.med) + '</div>';
    if (c.cam === 'spinoff' && o.pj) h += '<div class="fila"><span>Personaje al frente:</span>' + sel('tvPersK', o.pj.map(function (p, i) { return [i, p.n]; }), c.k) + '</div>';
    return h + '<button class="btn primario bloque" data-a="tvLlamar">Llamar al elenco y preparar</button><button class="btn bloque" data-a="cerrarModal">Cancelar</button>';
  }
  function abrirBorrador(r) {
    let h = '<h2>Llamada al elenco</h2>' + (r.elenco.length ? '<ul>' + r.elenco.map(function (x) { return '<li>' + esc(x.pers) + ': ' + esc(x.actor) + ' ' + (x.ok ? '<b class="bien">acepta</b>' : '<b class="mal">rechaza: el papel queda para un nuevo casting</b>') + '</li>'; }).join('') + '</ul>' : '<p>Este camino trae un elenco nuevo.</p>');
    st.borr = r.b;
    U.modal(h + '<button class="btn primario bloque" data-a="tvAbrirCrear">Seguir en la creación</button>');
  }
  ac('tvAbrirCrear', function () { U.cerrarModal(); if (st.borr) ART.creacion.abrirCon(st.borr); st.borr = null; });
  ac('tvVerFr', function (v) { st.fr = +v; U.modal(fichaFranquicia(v)); });
  ac('tvContinuar', function (v) { const e = F.puedeContinuar(O.porId(+v)); if (e) return avisar(e); st.cont = null; U.modal(modalContinuar(v)); });
  ac('tvCam', function (v) { st.cont.cam = v; U.modal(modalContinuar(st.cont.o)); });
  ac('tvMed', function (v) { st.cont.med = v; });
  ac('tvPersK', function (v) { st.cont.k = +v; });
  ac('tvLlamar', function () {
    const c = st.cont, r = ART.creacion.conAzarUI(function () { return F.continuar(c.o, c.cam, c.med, c.cam === 'spinoff' ? c.k : undefined); });
    if (r.error) return avisar(r.error);
    abrirBorrador(r);
  });
  ac('tvRegistrar', function (v) {
    const o = O.porId(+v), f = F.de(o);
    U.modal('<h2>Registrar franquicia</h2><label class="campo"><span>Nombre</span><input id="tvNomFr" value="' + esc(f ? f.nom : o.tit) + '" maxlength="40"></label><label class="campo"><span>Género central</span>' +
      '<select id="tvGenFr">' + o.gen.map(function (g) { return '<option' + (f && f.gen === g ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</select></label><button class="btn primario bloque" data-a="tvRegistrarOk" data-v="' + o.id + '">Registrar</button><button class="btn bloque" data-a="cerrarModal">Cancelar</button>');
  });
  ac('tvRegistrarOk', function (v) { const e = F.registrar(+v, document.getElementById('tvNomFr').value, document.getElementById('tvGenFr').value); avisar(e, 'Franquicia registrada'); if (!e) { U.cerrarModal(); U.refrescar(); } });
  ac('tvCont', function (v, el) { const id = +el.getAttribute('data-v'); avisar(F.moverContinuidad(id, v), 'Canon actualizado'); U.modal(fichaFranquicia(st.fr)); });
  ac('tvLicPers', function (v) { st.licP = +v; });
  ac('tvLicProd', function (v) { st.licProd = v; });
  ac('tvLicenciar', function (v) {
    const p = v.split('|'), f = F.porId(+p[0]), pr = F.productos(N.anio());
    const e = F.licenciar(+p[0], st.licP !== undefined ? st.licP : f.pers[0].k, st.licProd || pr[0].id, p[1] === '1');
    avisar(e, 'Licencia firmada'); U.modal(fichaFranquicia(p[0]));
  });
  ac('tvMente', function (v, el) { avisar(F.asignarMente(+el.getAttribute('data-v'), v === '' ? null : v), 'Mente maestra asignada'); });
  ac('tvXo', function (v) { st.xo = +v; });
  ac('tvUnir', function (v) { const f = F.porId(+v), otras = F.lista().filter(function (x) { return x.est === 0 && x !== f; }); avisar(F.crossover(+v, st.xo || otras[0].id), 'Universos unidos'); U.modal(fichaFranquicia(v)); });
  ac('tvSeparar', function (v) { const p = v.split('|'); F.separar(+p[0], +p[1]); U.modal(fichaFranquicia(p[0])); });
  ac('tvCruce', function (v) { const p = v.split('|'), r = ART.creacion.conAzarUI(function () { return F.continuarCruce(+p[0], +p[1]); }); if (r.error) return avisar(r.error); abrirBorrador(r); });
  ac('tvVendA', function (v) { st.vendA = +v; });
  ac('tvVender', function (v) { const cs = N.S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado; }); avisar(F.vender(+v, st.vendA || cs[0].id), 'Franquicia vendida'); U.cerrarModal(); U.refrescar(); });
  ac('tvVenderOf', function (v) { avisar(F.aceptarOferta(+v), 'Franquicia vendida'); U.refrescar(); });
  ac('tvRechazarOf', function (v) { F.rechazarOferta(+v); U.refrescar(); });

  // ---------- Obras › Adquisición ----------
  function adquisicion() {
    const a = N.anio();
    let h = '<p class="nota info">Compra derechos de franquicias y obras de los rivales, de libros y del dominio público. Lo comprado se continúa como si fuera tuyo.</p><h3>Derechos de rivales</h3><div class="col">';
    const v = F.enVenta();
    h += v.length ? v.map(function (x) {
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(x.nom) + '</b><span class="tenue chico">' + (x.tipo === 'franquicia' ? 'Franquicia' : 'Obra suelta') + ' · ' + esc(nomEst(x.est)) + '</span></div><div class="fila entre"><span class="cifra">' + dinero(x.precio) + '</span>' + btn('Comprar', 'tvComprar', x.tipo + '|' + (x.f ? x.f.id : x.o.id), 'primario') + '</div></div>';
    }).join('') : '<p class="tenue">Nada a la venta por ahora.</p>';
    const mats = ART.ideas.materialesDisponibles(a);
    const libres = mats.filter(function (x) { return ART.ideas.esLibre(x, a); }).slice(0, 10), libros = mats.filter(function (x) { return !ART.ideas.esLibre(x, a); }).slice(0, 10);
    const fila = function (x, libre) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.tit) + '</b><span class="tenue chico">' + esc(x.autor || '') + (x.anio ? ' · ' + x.anio : '') + '</span></div>' + (libre ? '<span class="etiqueta">Libre</span>' : '<span class="cifra">' + dinero(ART.ideas.costoDerechos(x, a)) + '</span>') + btn('Adaptar', 'tvAdaptar', x.id, 'primario') + '</div>'; };
    h += '</div><h3>Libros con derechos</h3><div class="col">' + (libros.length ? libros.map(function (x) { return fila(x, false); }).join('') : '<p class="tenue">No hay libros con derechos en este año.</p>') + '</div>';
    h += '<h3>Dominio público</h3><div class="col">' + (libres.length ? libres.map(function (x) { return fila(x, true); }).join('') : '<p class="tenue">Nada libre todavía.</p>') + '</div>';
    return h;
  }
  ac('tvComprar', function (v) { const p = v.split('|'); avisar(F.comprar(p[0], +p[1]), 'Derechos comprados: ya puedes continuarla'); U.refrescar(); });
  ac('tvAdaptar', function (v) {
    const b = ART.creacion.conAzarUI(function () { const x = O.borrador(0, { gen: ['Drama'], escala: 2, completa: true }); ART.ideas.usarMaterial(x, v, N.anio()); if (!(x.prob && x.prob.length)) ART.ideas.recomendarHistoria(x, N.anio()); ART.ideas.generarPersonajes(x); O.equipoRecomendado(x, 1); O.recalcular(x); return x; });
    ART.creacion.abrirCon(b);
  });

  // ---------- Nueva serie y su configuración en la creación ----------
  function nuevaSerie() {
    if (!TV.puedeTV(N.anio())) return avisar('La televisión llega en ' + TV.ANIO_TV + '.');
    const b = ART.creacion.conAzarUI(function () { const x = O.borrador(0, { gen: ['Drama'], escala: 1, completa: true }); TV.aplicar(x); if (!(x.prob && x.prob.length)) ART.ideas.recomendarHistoria(x, N.anio()); ART.ideas.generarPersonajes(x); O.equipoRecomendado(x, 1); O.recalcular(x); return x; });
    ART.creacion.abrirCon(b);
  }
  ac('tvNuevaSerie', nuevaSerie);
  function bannerCrear(b) {
    if (!b || (!b.tv && !b.fr)) return '';
    const a = N.anio();
    let h = '<div class="tarjeta">';
    if (b.fr) { const f = F.porId(b.fr); h += '<p><b>' + esc(F.camino(b.cam).nombre) + '</b> de «' + esc(f ? f.nom : '') + '» · entrega ' + b.frN + (b.fr2 ? ' · crossover' : '') + '</p>'; }
    (b.pj || []).forEach(function (p) { if (p.rech) h += '<p class="chico">' + esc(p.rech) + ' rechazó volver como ' + esc(p.n) + ': elige a alguien en el reparto.</p>'; });
    if (b.tv) {
      const f = TV.formato(b.tv.fmt);
      h += '<h3>Serie de televisión</h3><div class="fila">' + sel('tvFmt', TV.formatosDe(a).map(function (x) { return [x.id, x.nombre]; }), b.tv.fmt) +
        (f.vivo ? sel('tvSub', TV.SUBVIVO.filter(function (x) { return x.desde <= a; }).map(function (x) { return [x.id, x.nombre]; }), b.tv.sub) : sel('tvModo', [['episodica', 'Episódica'], ['serial', 'Serializada']], b.tv.modo)) + '</div>' +
        '<div class="fila"><label class="campo"><span>Episodios (' + Math.max(2, f.eps[0]) + '–' + Math.min(300, f.eps[1]) + ')</span><input type="number" data-c="tvEps" value="' + b.tv.eps + '"></label>' +
        '<label class="campo"><span>Minutos (' + f.rmin[0] + '–' + f.rmin[1] + ')</span><input type="number" data-c="tvMin" value="' + b.min + '"></label></div>' +
        '<div class="fila"><label class="campo"><span>Sala de guionistas</span><input type="number" min="1" max="12" data-c="tvSala" value="' + b.tv.sala + '"></label>' + sel('tvTramas', [[2, '2 tramas por episodio'], [3, '3 tramas por episodio']], b.tv.tramas) + '</div>' +
        '<p class="chico">Costo por episodio: ' + dinero(TV.costoEpisodio(b)) + ' · sala: ' + dinero(TV.costoSala(b)) + ' por episodio · temporada ' + (b.tv.temp || 1) + '</p>';
      if (b.pitch) h += '<p class="bien">Idea vendida a ' + esc(TV.DONDE[b.pitch.c].nombre.toLowerCase()) + ': te pagan ' + dinero(b.pitch.monto) + ' al empezar.</p>';
      else h += '<div class="fila">' + TV.compradores(a).map(function (c) { return btn('Presentar la idea a ' + c.nombre.toLowerCase(), 'tvPitch', c.id); }).join('') + '</div>';
      if (!b.tv.pil && b.tv.temp === 1) h += btn('Rodar un piloto primero · ' + dinero(TV.costoPiloto(b)), 'tvPiloto', '', 'bloque');
    }
    return h + '</div>';
  }
  function cb() { return ART.creacion.estado.b; }
  function reaplicar(c) { const b = cb(); if (!b) return; TV.aplicar(b, c); O.recalcular(b); ART.creacion.refrescar(); }
  ac('tvFmt', function (v) { reaplicar({ fmt: v, eps: TV.formato(v).def }); });
  ac('tvSub', function (v) { reaplicar({ sub: v }); });
  ac('tvModo', function (v) { reaplicar({ modo: v }); });
  ac('tvEps', function (v) { reaplicar({ eps: +v }); });
  ac('tvMin', function (v) { const b = cb(); if (b) { b.min = +v; reaplicar({}); } });
  ac('tvSala', function (v) { reaplicar({ sala: +v }); });
  ac('tvTramas', function (v) { reaplicar({ tramas: +v }); });
  ac('tvPitch', function (v) { const b = cb(); const e = ART.creacion.conAzarUI(function () { return TV.pitch(b, v); }); avisar(e, '¡Compraron la idea!'); ART.creacion.refrescar(); });
  ac('tvPiloto', function () { const e = TV.rodarPiloto(cb()); avisar(e, 'Piloto en rodaje: en cuatro semanas sabrás qué opina el público'); if (!e) { U.cerrarFicha(); U.refrescar(); } });

  // Pilotos esperando decisión (en Obras › En marcha)
  function pilotos() {
    const ps = N.S.pilotos || [];
    if (!ps.length) return '';
    return '<div class="tarjeta"><h3>Pilotos</h3>' + ps.map(function (p) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(p.b.tit) + '</b><span class="tenue chico">' + (p.nota === undefined ? 'En rodaje: faltan ' + p.sr + ' semanas' : 'Público de prueba: ' + p.nota) + '</span></div>' +
        (p.nota !== undefined ? btn('Pedir la temporada', 'tvOrdenar', p.id, 'primario') + btn('Descartar', 'tvDescartar', p.id) : '') + '</div>';
    }).join('') + '</div>';
  }
  ac('tvOrdenar', function (v) { const r = TV.ordenarTemporada(v); avisar(r.error, 'La temporada empieza su desarrollo'); U.refrescar(); });
  ac('tvDescartar', function (v) { TV.descartarPiloto(v); U.refrescar(); });

  // ---------- Ficha de la obra: franquicia y televisión ----------
  function bloqueObra(o) {
    let h = '';
    const f = F.de(o);
    if (f || (o.est === 0 && o.pub !== undefined)) {
      h += '<h3>Franquicia</h3><p>' + (f ? '<a data-a="tvVerFr" data-v="' + f.id + '" style="cursor:pointer"><b>' + esc(f.nom) + '</b></a> · entrega ' + (f.o.indexOf(o.id) + 1) + ' de ' + f.o.length + (o.cam ? ' · ' + esc(F.camino(o.cam).nombre) : '') : 'Obra única: es una franquicia de una sola obra.') + '</p>';
      if (F.dueno(o) === 0 && o.pub !== undefined) h += '<div class="fila">' + btn('Continuación', 'tvContinuar', o.id, 'primario') + (f ? '' : btn('Registrar franquicia', 'tvRegistrar', o.id)) + '</div>';
    }
    if (!o.tv) return h;
    const tv = o.tv, fm = TV.formato(tv.fmt);
    h += '<h3>Serie</h3><p>' + esc(fm.nombre) + ' · ' + tv.eps + ' episodios de ' + (o.min || fm.min) + ' min · ' + (fm.vivo ? esc((TV.SUBVIVO.filter(function (x) { return x.id === tv.sub; })[0] || {}).nombre || '') : tv.modo === 'serial' ? 'serializada' : 'episódica') + ' · temporada ' + (tv.temp || 1) + ' · sala de ' + tv.sala + '</p>';
    if (tv.tr) h += '<p>' + tv.tr.map(function (x) { return esc(x.n) + ': <b class="cifra">' + x.v + '</b>'; }).join(' · ') + '</p>';
    if (o.est === 0 && o.et === 'lista') {
      h += '<p class="nota info">Elige dónde se emite.</p><div class="col">' + TV.opcionesEmision(o).filter(function (x) { return !o.pitch || x.id === o.pitch.c; }).map(function (x) {
        return x.id === 'stream' ? '<div class="fila">' + btn('Tu plataforma · semanal', 'tvEmitir', o.id + '|stream|0', 'primario') + btn('Tu plataforma · temporada completa', 'tvEmitir', o.id + '|stream|1') + '</div>' :
          btn(x.nombre + (x.pago ? ' · te pagan ' + dinero(x.pago) : ''), 'tvEmitir', o.id + '|' + x.id, 'primario');
      }).join('') + '</div>';
    }
    if (tv.em) {
      const aud = tv.em.aud;
      h += '<p>' + esc(TV.DONDE[tv.em.d].nombre) + ' · ' + tv.em.ep + ' de ' + tv.eps + ' episodios · ' + (aud.length ? 'promedio ' + m(TV.promedioAud(o)) + ' por episodio' : 'sin audiencia aún') + ' · cobrado ' + dinero(tv.em.ing) + '</p>';
      if (aud.length > 1) h += '<div class="fila" style="align-items:flex-end;height:40px;gap:1px">' + aud.slice(-40).map(function (x) { const mx = Math.max.apply(null, aud.slice(-40)) || 1; return '<i style="display:block;flex:1;background:var(--acento);height:' + Math.max(2, Math.round(x / mx * 40)) + 'px"></i>'; }).join('') + '</div>';
      if (o.et === 'emision' && tv.em.d === 'canal' && !TV.celdasDe(o.id)) h += '<p class="mal chico">No está en la parrilla de tu canal: no avanza.</p>';
    }
    if (o.est === 0 && tv.ren === 'pendiente') h += '<div class="fila">' + btn('Renovar', 'tvRenovar', o.id, 'primario') + btn('Cancelar', 'tvCancelar', o.id) + '</div>';
    else if (tv.ren && tv.ren !== 'pendiente') h += '<p class="tenue chico">' + (tv.ren === 'renovada' ? 'Renovada' : 'Cancelada') + '</p>';
    return h;
  }
  ac('tvEmitir', function (v) { const p = v.split('|'), e = TV.emitir(+p[0], p[1], { completa: p[2] === '1' }); avisar(e, 'Empieza la emisión'); refrescarFicha(p[0]); });
  ac('tvRenovar', function (v) { const r = ART.creacion.conAzarUI(function () { return TV.renovar(+v); }); if (r.error) return avisar(r.error); U.cerrarFicha(); abrirBorrador(r); });
  ac('tvCancelar', function (v) { TV.cancelar(+v); refrescarFicha(v); });

  /* ---------- Canal de TV: parrilla de 24 horas, programación, comercial e informe ---------- */
  function hexA(col, a) {
    const h = String(col || '#94a3b8').replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function siglas(t) { const p = String(t || '').replace(/[«»"]/g, '').split(/\s+/).filter(Boolean); return ((p[0] || '?').charAt(0) + (p[1] ? p[1].charAt(0) : (p[0] || '').charAt(1) || '')).toUpperCase(); }
  const TIPO_TV = { g: 'Programa propio', serie: 'Serie en emisión', rep: 'Repetición', lic: 'Licencia' };
  function refrescarTV() {
    const r = document.querySelector('.tv-rejilla'), sx = r ? r.scrollLeft : 0;
    U.refrescar();
    const r2 = document.querySelector('.tv-rejilla');
    if (r2) r2.scrollLeft = sx;
  }
  function guardarDeshacer() {
    const c = N.S.canal;
    if (!c) return;
    st.undo = (st.undo || []).concat([JSON.stringify(c.par)]).slice(-15);
  }
  function barraCuota(nuestra, riv, c) {
    const tot = nuestra + riv.reduce(function (a, b) { return a + b; }, 0) || 1;
    return '<div class="tv-cuota" role="img" aria-label="Cuota de pantalla: ' + Math.round(nuestra / tot * 100) + ' %"><i style="width:' + (nuestra / tot * 100).toFixed(1) + '%;background:var(--acento)"></i>' +
      riv.map(function (v, i) { return '<i style="width:' + (v / tot * 100).toFixed(1) + '%;background:' + c.riv[i].col + '"></i>'; }).join('') + '</div>';
  }
  function cabCanal(c) {
    const ult = c.hist[c.hist.length - 1] || { aud: 0, ing: 0, gas: 0 }, u = c.ult || {};
    const cuota = u.cuota ? u.cuota.reduce(function (a, b) { return a + b; }, 0) / u.cuota.length : 0;
    return '<div class="tv-cab"><div class="tv-logo" style="background:' + (c.tema ? TV.COLOR_FAM[c.tema] : 'var(--acento)') + '">' + esc(siglas(c.nom)) + '</div><div class="col crece"><b class="tv-nom">' + esc(c.nom) + '</b><span class="tenue chico">' +
      (c.tema ? esc(D.familia(c.tema).nombre) : 'Generalista') + ' · alcance ' + Math.round(c.alc * 100) + ' % de los hogares</span><span class="tv-aire"><i></i>Al aire' + (u.rank ? ' · puesto ' + u.rank + ' de ' + (c.riv.length + 1) : '') + '</span></div></div>' +
      '<div class="kpis tv-kpis">' + kpi('Audiencia media', m(ult.aud)) + kpi('Cuota', Math.round(cuota * 100) + ' %') + kpi('Ingresos/sem', dinero(ult.ing), 'bien') + kpi('Gastos/sem', dinero(ult.gas), 'mal') +
      kpi('Ganancia/sem', dinero(ult.ing - ult.gas), ult.ing >= ult.gas ? 'bien' : 'mal') + kpi('Anuncios', c.ads + ' min/h') + '</div>';
  }
  // ---------- Negocio › Canal ----------
  function canal() {
    const S = N.S, a = N.anio();
    if (!S.canal) {
      if (a < TV.ANIO_CANAL) return '<p class="nota">La televisión comercial llega en ' + TV.ANIO_CANAL + '. Mientras, puedes producir programas en vivo para las cadenas.</p>';
      return '<div class="tarjeta tv-abrir"><div class="tv-logo" style="background:var(--acento)">TV</div><h3>Abre tu canal</h3><p>Programa las 24 horas de los 7 días, compite con los canales rivales, vende anuncios, produce tus propios programas y estrena tus series.</p><label class="campo"><span>Nombre</span><input id="tvNomCanal" maxlength="30" value="' + esc(S.estudios[0].nombre + ' TV') + '"></label>' +
        '<label class="campo"><span>Tema</span><select id="tvTemaCanal"><option value="">Generalista</option>' + D.familias.map(function (f) { return '<option value="' + f.id + '">' + esc(f.nombre) + '</option>'; }).join('') + '</select></label>' + btn('Abrir canal · ' + dinero(TV.costoCanal()), 'tvAbrirCanal', '', 'primario bloque') + '</div>';
    }
    const c = TV.canal();
    const vista = st.tvVista || 'parrilla';
    let h = cabCanal(c);
    h += '<div class="pestanas tv-tabs">' + [['parrilla', 'Parrilla'], ['programas', 'Programas y licencias'], ['comercial', 'Anuncios y patrocinios'], ['informe', 'Informe de audiencia']].map(function (x) {
      return '<button class="pestana' + (vista === x[0] ? ' on' : '') + '" data-a="tvVista" data-v="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div>';
    return h + ({ parrilla: parrilla, programas: programas, comercial: comercial, informe: informe }[vista] || parrilla)(c);
  }
  function parrilla(c) {
    const modo = st.tvModo || 'semana', color = st.tvColor || 'cont';
    let h = '<div class="fila tv-herr"><div class="seg">' + [['semana', 'Semana'], ['dia', 'Día']].map(function (x) { return '<button class="' + (modo === x[0] ? 'on' : '') + '" data-a="tvModo" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      (modo === 'semana' ? '<div class="seg">' + [['cont', 'Contenido'], ['aud', 'Audiencia']].map(function (x) { return '<button class="' + (color === x[0] ? 'on' : '') + '" data-a="tvColor" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' : '') + '</div>';
    // Pronóstico de todas las casillas (sin azar)
    const pr = [];
    let mx = 0.01;
    for (let d = 0; d < 7; d++) { pr.push([]); for (let j = 0; j < TV.FRANJAS.length; j++) { const p = c.par[d][j] ? TV.pronostico(d, j) : null; pr[d].push(p); if (p) mx = Math.max(mx, p.aud); } }
    if (modo === 'semana') {
      h += '<div class="tv-rejilla"><div class="tv-grid"><div class="tv-hd tv-esq">Franja</div>' + TV.DIAS.map(function (dn, d) { return '<button class="tv-hd' + (st.dia === d ? ' on' : '') + '" data-a="tvDia" data-v="' + d + '">' + dn.slice(0, 3) + '</button>'; }).join('');
      TV.FRANJAS.forEach(function (fr, j) {
        const hit = TV.hitEn(c, j);
        h += '<div class="tv-fr' + (fr.fam ? ' fam' : '') + '"><b>' + esc(fr.corto) + '</b><span>' + TV.horas(fr) + '</span>' + (hit ? '<span class="tv-hit" title="' + esc(hit.nom + ': «' + hit.tit + '»') + '">⚔ ' + esc(hit.nom) + '</span>' : '') + '</div>';
        for (let d = 0; d < 7; d++) {
          const x = c.par[d][j], inf = TV.infoCelda(x), p = pr[d][j];
          let estilo = '', cls = 'tv-c';
          if (!inf) cls += ' vacia';
          else if (color === 'aud') estilo = 'background:' + hexA('#35d0ba', (0.08 + 0.6 * (p ? p.aud / mx : 0)).toFixed(2)) + ';--c:' + inf.col;
          else estilo = 'background:' + hexA(inf.col, 0.16) + ';--c:' + inf.col;
          const ic = inf ? (p && p.multa ? '<span class="ic mal" title="Multa en horario familiar">⚠</span>' : inf.tipo === 'serie' ? '<span class="ic" title="Episodio nuevo">●</span>' : inf.key && !c.estr[inf.key] ? '<span class="ic dorado" title="Estreno en tu canal">★</span>' : p && p.fres < 0.5 ? '<span class="ic" title="Gastada">↺</span>' : '') : '';
          h += '<button class="' + cls + (st.dia === d ? ' dsel' : '') + '" style="' + estilo + '" data-a="tvCelda" data-v="' + d + '|' + j + '" aria-label="' + esc(TV.DIAS[d] + ', ' + fr.nombre + ': ' + (inf ? inf.nom : 'fuera del aire')) + '">' + ic +
            '<span class="t">' + (inf ? esc(inf.nom) : 'Fuera del aire') + '</span><span class="a">' + (p ? m(p.aud) : '—') + '</span></button>';
        }
      });
      h += '</div></div>';
      h += '<div class="tv-ley"><span><b class="dorado">★</b> estreno en tu canal</span><span><b>●</b> episodio nuevo</span><span><b>↺</b> gastada</span><span><b class="mal">⚠</b> multa</span><span><b class="mal">⚔</b> estreno rival</span></div>';
    } else {
      const d = st.dia || 0;
      h += '<div class="pestanas">' + TV.DIAS.map(function (dn, i) { return '<button class="pestana' + (d === i ? ' on' : '') + '" data-a="tvDia" data-v="' + i + '">' + dn.slice(0, 3) + '</button>'; }).join('') + '</div><div class="col tv-dia">';
      TV.FRANJAS.forEach(function (fr, j) {
        const inf = TV.infoCelda(c.par[d][j]), p = TV.pronostico(d, j), hit = TV.hitEn(c, j);
        h += '<div class="tv-slot" style="--c:' + (inf ? inf.col : 'var(--borde)') + '"><div class="tv-hora"><b>' + TV.horas(fr).replace('–', '<br>') + '</b></div><div class="col crece"><span class="tenue chico">' + esc(fr.nombre) + (fr.fam ? ' · horario familiar' : '') + '</span>' +
          '<b>' + (inf ? esc(inf.nom) : 'Fuera del aire') + '</b>' + (inf ? '<span class="chico">' + TIPO_TV[inf.tipo] + (inf.clas ? ' · ' + esc(inf.clas) : '') + ' · ' + m(p.aud) + ' · ' + dinero(p.ing - p.gas) + ' neto' + (p.multa ? ' · <b class="mal">multa ' + dinero(p.multa) + '</b>' : '') + (inf.key && inf.tipo !== 'serie' ? ' · ' + Math.round(p.fres * 100) + ' % fresca' : '') + '</span>' : '') +
          barraCuota(p.aud, p.riv, c) + (hit ? '<span class="chico mal">⚔ ' + esc(hit.nom) + ' estrena «' + esc(hit.tit) + '» (calidad ' + hit.q + ')</span>' : '') + '</div>' + btn('Cambiar', 'tvCelda', d + '|' + j) + '</div>';
      });
      h += '</div>';
    }
    const d = st.dia || 0;
    h += '<div class="tarjeta tv-tools"><b>Herramientas para el ' + TV.DIAS[d].toLowerCase() + '</b><div class="fila">' + btn('Autocompletar vacías', 'tvAuto', '1', 'primario') + btn('Rehacer toda la parrilla', 'tvAuto', '0') + (st.undo && st.undo.length ? btn('Deshacer', 'tvDeshacer', '') : '') + '</div>' +
      '<div class="fila">' + btn('Copiar a lunes–viernes', 'tvCopiar', 'lab') + btn('Copiar al fin de semana', 'tvCopiar', 'finde') + btn('Copiar a toda la semana', 'tvCopiar', 'todos') + btn('Vaciar el día', 'tvVaciarDia', d) + '</div>' +
      '<p class="nota info">Toca una casilla para elegir qué se emite. Cada obra rinde más en la franja que encaja con su público; repetir cansa, el horario familiar multa lo que no es para niños y la madrugada es barata pero poco vista.</p></div>';
    return h;
  }
  function filaOpcion(c, d, j, val, inf, p, extra) {
    return '<div class="tv-op" style="--c:' + inf.col + '"><div class="col crece"><b>' + esc(inf.nom) + '</b><span class="tenue chico">' + extra + '</span></div><div class="tv-op-n"><b class="cifra">' + m(p.aud) + '</b><span class="chico ' + (p.ing - p.gas >= 0 ? 'bien' : 'mal') + '">' + dinero(p.ing - p.gas) + '</span></div>' +
      '<div class="fila tv-op-b">' + btn('Aquí', 'tvPoner', d + '|' + j + '|' + val, 'primario') + btn('L–V', 'tvPonerDias', j + '|' + val + '|lab') + btn('7 días', 'tvPonerDias', j + '|' + val + '|todos') + '</div></div>';
  }
  function selector(d, j) {
    const c = TV.canal(), fr = TV.FRANJAS[j], cn = TV.contenidos(), cat = st.pkCat || 'tuyo', ahora = TV.infoCelda(c.par[d][j]), pa = TV.pronostico(d, j), hit = TV.hitEn(c, j);
    let h = '<h2>' + TV.DIAS[d] + ' · ' + esc(fr.nombre) + '</h2><p class="tenue">' + TV.horas(fr) + (fr.fam ? ' · horario familiar: solo G, PG o N sin multa' : '') + '</p>';
    h += '<div class="tarjeta tv-ahora"><span class="chico tenue">Ahora</span><b>' + (ahora ? esc(ahora.nom) : 'Fuera del aire') + '</b>' + (ahora ? '<span class="chico">' + m(pa.aud) + ' · ' + dinero(pa.ing - pa.gas) + ' neto · cuota ' + Math.round(pa.cuota * 100) + ' %</span>' : '') + barraCuota(pa.aud, pa.riv, c) +
      '<span class="chico tenue">' + c.riv.map(function (r, i) { return '<b style="color:' + r.col + '">■</b> ' + esc(r.nom); }).join(' · ') + '</span>' + (hit ? '<span class="chico mal">⚔ ' + esc(hit.nom) + ' emite «' + esc(hit.tit) + '», calidad ' + hit.q + ': necesitas algo mejor.</span>' : '') + '</div>';
    const grupos = { tuyo: 'Tus obras', lic: 'Licencias', prog: 'Programas propios' };
    h += '<div class="pestanas">' + Object.keys(grupos).map(function (k) { return '<button class="pestana' + (cat === k ? ' on' : '') + '" data-a="tvCat" data-v="' + k + '">' + grupos[k] + '</button>'; }).join('') + '</div><div class="col">';
    let ops = [];
    if (cat === 'tuyo') {
      cn.series.forEach(function (o) { ops.push({ val: 'o:' + o.id }); });
      cn.rep.forEach(function (o) { ops.push({ val: 'o:' + o.id }); });
    } else if (cat === 'lic') cn.lic.forEach(function (l) { ops.push({ val: 'l:' + l.id }); });
    else cn.gen.forEach(function (g) { ops.push({ val: 'g:' + g.id }); });
    ops = ops.map(function (x) { x.p = TV.pronostico(d, j, x.val); return x; }).filter(function (x) { return x.p && x.p.inf; }).sort(function (a, b) { return (b.p.ing - b.p.gas) - (a.p.ing - a.p.gas); }).slice(0, 18);
    h += ops.length ? ops.map(function (x) {
      const inf = x.p.inf, o = inf.o, p = x.p;
      const extra = TIPO_TV[inf.tipo] + (o ? ' · ' + esc(o.gen[0] || '') + ' · ' + esc(o.clas) + ' · calidad ' + Math.round(p.q) : ' · calidad ' + Math.round(p.q) + ' · nivel ' + TV.nivel(inf.g.id)) + ' · encaje ' + Math.round(p.enc * 100) + ' %' +
        (inf.key && inf.tipo !== 'serie' ? ' · ' + Math.round(p.fres * 100) + ' % fresca' : '') + (inf.key && inf.tipo !== 'serie' && !c.estr[inf.key] ? ' · <b class="dorado">★ estreno ×1,3</b>' : '') + (p.multa ? ' · <b class="mal">multa ' + dinero(p.multa) + '</b>' : '') + (inf.l ? ' · hasta ' + esc(U.fechaCorta(inf.l.hasta)) : '');
      return filaOpcion(c, d, j, x.val, inf, p, extra);
    }).join('') : '<p class="tenue">' + (cat === 'lic' ? 'No tienes licencias: cómpralas en «Programas y licencias».' : cat === 'tuyo' ? 'Aún no tienes obras terminadas ni series para tu canal.' : 'No hay programas en este año.') + '</p>';
    h += '</div><div class="fila">' + (ahora ? btn('Dejar fuera del aire', 'tvPoner', d + '|' + j + '|', 'mal') : '') + btn('Cerrar', 'cerrarModal', '') + '</div>';
    return h;
  }
  function programas(c) {
    const a = N.anio(), cn = TV.contenidos();
    let h = '<h3>Producción propia</h3><p class="nota info">Sube el nivel de tus programas: más calidad (+5 por nivel) y más audiencia, pero cada emisión cuesta un 30 % más por nivel: conviene en las franjas fuertes.</p><div class="tv-progs">';
    cn.gen.forEach(function (g) {
      const nv = TV.nivel(g.id), usos = c.par.reduce(function (s, dia) { return s + dia.filter(function (x) { return x && x.g === g.id; }).length; }, 0);
      const mejores = TV.FRANJAS.map(function (fr, j) { return { j: j, v: (g.bono && g.bono[fr.id] ? g.bono[fr.id] : 1) * fr.peso * (function () { let s = 0, w = 0; for (let k = 0; k < 5; k++) { s += g.ed[k] * fr.ed[k]; w += g.ed[k]; } return s / w; })() }; }).sort(function (x, y) { return y.v - x.v; }).slice(0, 2);
      h += '<div class="tv-prog" style="--c:' + g.col + '"><div class="fila entre"><b>' + esc(g.nombre) + '</b><span class="tv-nv" aria-label="Nivel ' + nv + ' de 5">' + '●●●●●'.slice(0, nv) + '<i>' + '●●●●●'.slice(nv) + '</i></span></div>' +
        '<span class="chico">Calidad ' + TV.calidadGenerico(g) + ' · ' + dinero(TV.costoGenerico(g)) + ' por emisión · ' + usos + ' en la parrilla</span><span class="chico tenue">Rinde mejor: ' + mejores.map(function (x) { return TV.FRANJAS[x.j].nombre.toLowerCase(); }).join(' y ') + (g.finde ? ' · más el fin de semana' : '') + '</span>' +
        (nv < 5 ? btn('Mejorar · ' + dinero(TV.costoMejora(g.id)), 'tvMejorar', g.id) : '<span class="etiqueta">Nivel máximo</span>') + '</div>';
    });
    h += '</div>';
    h += '<h3>Licencias de emisión</h3><p class="nota info">Derechos de obras de los estudios rivales por dos años, con pases ilimitados. Lo que pagas lo cobra el estudio dueño.</p>';
    h += cn.lic.length ? '<div class="tv-lics">' + cn.lic.map(function (l) {
      const o = O.porId(l.o), usos = c.par.reduce(function (s, dia) { return s + dia.filter(function (x) { return x && x.l === l.id; }).length; }, 0), fr = c.fres['l' + l.id];
      return '<div class="tv-lic"><canvas class="mini-poster" data-poster="' + o.id + '"></canvas><div class="col crece"><b>' + esc(o.tit) + '</b><span class="chico tenue">' + esc(nomEst(o.est)) + ' · ' + esc(o.gen[0] || '') + ' · ' + esc(o.clas) + ' · calidad ' + (o.pub || 50) + '</span><span class="chico">' + usos + ' emisiones por semana · ' + (fr === undefined ? '100' : Math.round(fr * 100)) + ' % fresca · hasta ' + esc(U.fechaCorta(l.hasta)) + '</span></div></div>';
    }).join('') + '</div>' : '<p class="tenue chico">Aún no tienes licencias.</p>';
    h += '<h3>Ofertas del mes</h3>' + (c.ofLic.length ? '<div class="tv-lics">' + c.ofLic.map(function (x) {
      const o = O.porId(x.o);
      if (!o) return '';
      return '<div class="tv-lic"><canvas class="mini-poster" data-poster="' + o.id + '"></canvas><div class="col crece"><b>' + esc(o.tit) + '</b><span class="chico tenue">' + esc(nomEst(o.est)) + ' · ' + (o.tv ? 'serie' : 'película') + ' · ' + esc(o.gen[0] || '') + ' · ' + esc(o.clas) + ' · calidad ' + (o.pub || 50) + ' · ' + N.anio(o.fe || N.S.t) + '</span>' + btn('Comprar 2 años · ' + dinero(x.p), 'tvLicComprar', o.id, 'primario') + '</div></div>';
    }).join('') + '</div>' : '<p class="tenue chico">No hay ofertas este mes.</p>');
    h += '<h3>Modas de la temporada</h3>' + (c.moda ? '<p class="bien">' + esc(c.moda.nom) + ': +' + Math.round(c.moda.k * 100) + ' % a ' + esc(D.familia(c.moda.fam).nombre.toLowerCase()) + ' hasta ' + esc(U.fechaCorta(c.moda.hasta)) + '.</p>' : '') +
      (c.ofModa ? '<div class="tarjeta"><b>' + esc(c.ofModa.nom) + '</b><span class="chico">Compra la campaña: +' + Math.round(c.ofModa.k * 100) + ' % de audiencia a ' + esc(D.familia(c.ofModa.fam).nombre.toLowerCase()) + ' durante ' + c.ofModa.sem + ' semanas.</span>' + btn('Comprar · ' + dinero(c.ofModa.costo), 'tvModa', '', 'primario') + '</div>' : (!c.moda ? '<p class="tenue chico">Ninguna moda a la venta este mes.</p>' : ''));
    return h;
  }
  function comercial(c) {
    const fa = TV.factorAds(c.ads);
    let h = '<h3>Tanda comercial</h3><div class="tarjeta"><label class="campo"><span>Minutos de anuncios por hora: <b id="tvAdsN">' + c.ads + '</b></span><input type="range" min="4" max="18" step="1" value="' + c.ads + '" data-i="tvAdsVer" data-c="tvAds"></label>' +
      '<p class="chico" id="tvAdsTx">' + textoAds(c.ads) + '</p></div>';
    h += '<h3>Tema del canal</h3><div class="fila">' + sel('tvTema', [['', 'Generalista']].concat(D.familias.map(function (f) { return [f.id, f.nombre]; })), c.tema || '') + '<span class="tenue chico">+15 % a lo que encaja y −5 % al resto · cambiarlo cuesta ' + dinero(TV.costoCambioTema()) + '</span></div>';
    h += '<h3>Patrocinadores</h3>' + (c.pat.length ? c.pat.map(function (p) {
      const v = c.porFranja[p.f] || 0;
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(p.nom) + '</b><span class="chico">' + esc(TV.FRANJAS[p.f].nombre) + ' · meta ' + m(p.meta) + ' · ahora ' + m(v) + ' · ' + dinero(p.pago) + '/sem hasta ' + esc(U.fechaCorta(p.hasta)) + '</span><div class="tv-meta"><i style="width:' + Math.min(100, v / Math.max(0.01, p.meta) * 100).toFixed(0) + '%;background:' + (v >= p.meta ? 'var(--bien)' : 'var(--mal)') + '"></i></div>' + (p.mal ? '<span class="mal chico">' + p.mal + ' semanas bajo la meta (a las 4 se va)</span>' : '') + '</div></div>';
    }).join('') : '<p class="tenue chico">Sin patrocinadores.</p>') +
      c.ofPat.map(function (p) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(p.nom) + '</b><span class="tenue chico">' + esc(TV.FRANJAS[p.f].nombre) + ': pide ' + m(p.meta) + ' de audiencia · paga ' + dinero(p.pago) + '/sem por ' + p.sem + ' semanas</span></div>' + btn('Aceptar', 'tvPat', p.id, 'primario') + '</div>'; }).join('');
    h += '<h3>Noticias exclusivas</h3><p class="nota info">Suben la audiencia del noticiero y del canal unas semanas; después vencen.</p>' + c.notis.map(function (x) { return '<p class="bien chico">' + esc(x.txt) + ' · hasta ' + esc(U.fechaCorta(x.hasta)) + '</p>'; }).join('') +
      (c.ofNot.length ? c.ofNot.map(function (x) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.txt) + '</b><span class="tenue chico">+' + Math.round(x.bono * 100) + ' % por ' + x.sem + ' semanas</span></div>' + btn(dinero(x.costo), 'tvNoticia', x.id, 'primario') + '</div>'; }).join('') : '<p class="tenue chico">No hay exclusivas a la venta esta semana.</p>');
    return h;
  }
  function textoAds(min) {
    const fa = TV.factorAds(min);
    return '<span>Audiencia</span> ×' + U.decimal(fa.aud, 2) + ' · <span>ingresos por anuncios</span> ×' + U.decimal(fa.ing, 1) + (min > 14 ? ' · <span>el canal crece más lento y el público se queja</span>' : min <= 8 ? ' · <span>el canal gana hogares más rápido</span>' : '');
  }
  function informe(c) {
    const u = c.ult;
    if (!u) return '<p class="tenue">El primer informe llega al terminar la semana.</p>';
    const acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || '#35d0ba';
    let h = '';
    if (c.hist.length > 1) {
      const hs = c.hist.slice(-52);
      const g1 = U.grafica('tvHist', function (cv) { ART.arte.linea(cv, [{ nombre: 'Audiencia (M)', color: acento, valores: hs.map(function (x) { return x.aud; }) }], hs.map(function (x) { return U.fechaCorta(x.t); }), { formato: function (v) { return U.decimal(v, 1) + ' M'; } }); });
      const g2 = U.grafica('tvDinero', function (cv) { ART.arte.linea(cv, [{ nombre: 'Ingresos', valores: hs.map(function (x) { return x.ing; }) }, { nombre: 'Gastos', valores: hs.map(function (x) { return x.gas; }) }], hs.map(function (x) { return U.fechaCorta(x.t); }), { formato: function (v) { return dinero(v); } }); });
      h += '<h3>Audiencia del último año</h3><canvas class="lienzo" data-grafica="' + g1 + '"></canvas><h3>Ingresos y gastos</h3><canvas class="lienzo" data-grafica="' + g2 + '"></canvas>';
    }
    const g3 = U.grafica('tvFranjas', function (cv) { ART.arte.barras(cv, c.porFranja, TV.FRANJAS.map(function (f) { return f.corto; }), { formato: function (v) { return U.decimal(v, 2) + ' M'; }, colores: TV.FRANJAS.map(function (f) { return f.fam ? '#ffc857' : acento; }) }); });
    h += '<h3>Audiencia media por franja</h3><canvas class="lienzo" data-grafica="' + g3 + '"></canvas><p class="nota">Amarillo: horario familiar.</p>';
    h += '<h3>Cuota de pantalla por franja</h3><div class="col">' + TV.FRANJAS.map(function (fr, j) { return '<div class="tv-cf"><span>' + esc(fr.corto) + '</span><div class="tv-meta"><i style="width:' + Math.round(u.cuota[j] * 100) + '%;background:var(--acento)"></i></div><b class="cifra">' + Math.round(u.cuota[j] * 100) + ' %</b></div>'; }).join('') + '</div>';
    h += '<h3>Lo más visto de la semana</h3><div class="col">' + u.top.map(function (p, i) { return '<div class="tv-top" style="--c:' + p.col + '"><b class="tv-n">' + (i + 1) + '</b><div class="col crece"><b>' + esc(p.nom) + '</b><span class="chico tenue">' + TIPO_TV[p.tipo] + ' · ' + p.n + ' emisiones</span></div><b class="cifra">' + m(p.mx) + '</b></div>'; }).join('') + '</div>';
    const tot = c.hist.length ? c.hist[c.hist.length - 1].aud : 0;
    const tabla = [{ nom: c.nom, col: 'var(--acento)', v: tot, yo: 1 }].concat(c.riv.map(function (r, i) { return { nom: r.nom, col: r.col, v: u.rivT[i] || 0, hit: r.hit }; })).sort(function (x, y) { return y.v - x.v; });
    const mxr = Math.max.apply(null, tabla.map(function (x) { return x.v; })) || 1;
    h += '<h3>Ranking de canales</h3><div class="col">' + tabla.map(function (x, i) { return '<div class="tv-cf' + (x.yo ? ' yo' : '') + '"><span>' + (i + 1) + '. ' + esc(x.nom) + '</span><div class="tv-meta"><i style="width:' + (x.v / mxr * 100).toFixed(0) + '%;background:' + x.col + '"></i></div><b class="cifra">' + m(x.v) + '</b></div>' + (x.hit && x.hit.hasta > N.S.t ? '<span class="chico tenue">Éxito: «' + esc(x.hit.tit) + '» en ' + esc(TV.FRANJAS[x.hit.j].nombre.toLowerCase()) + '</span>' : ''); }).join('') + '</div>';
    const g = c.grupos, gs = g.reduce(function (x, y) { return x + y; }, 0) || 1;
    h += '<h3>Público por edades</h3><div class="col">' + ['Niños', 'Jóvenes', 'Adultos jóvenes', 'Adultos', 'Mayores'].map(function (n, i) { return '<div class="tv-cf"><span>' + n + '</span><div class="tv-meta"><i style="width:' + Math.round(g[i] / gs * 100) + '%;background:var(--dorado)"></i></div><b class="cifra">' + Math.round(g[i] / gs * 100) + ' %</b></div>'; }).join('') + '</div>';
    if (u.multas) h += '<p class="mal">Multas de la semana: ' + dinero(u.multas) + '</p>';
    return h;
  }
  ac('tvAbrirCanal', function () { const e = TV.comprarCanal(document.getElementById('tvNomCanal').value, document.getElementById('tvTemaCanal').value || null); avisar(e, '¡Tu canal sale al aire!'); U.refrescar(); });
  ac('tvTema', function (v) { avisar(TV.cambiarTema(v || null), 'Tema del canal cambiado'); U.refrescar(); });
  ac('tvVista', function (v) { st.tvVista = v; U.refrescar(); });
  ac('tvModo', function (v) { st.tvModo = v; refrescarTV(); });
  ac('tvColor', function (v) { st.tvColor = v; refrescarTV(); });
  ac('tvDia', function (v) { st.dia = +v; refrescarTV(); });
  ac('tvCelda', function (v) { const p = String(v).split('|'); st.pk = [+p[0], +p[1]]; U.modal(selector(+p[0], +p[1])); });
  ac('tvCat', function (v) { st.pkCat = v; if (st.pk) U.modal(selector(st.pk[0], st.pk[1])); });
  ac('tvPoner', function (v) { const p = String(v).split('|'); guardarDeshacer(); const e = TV.poner(+p[0], +p[1], p.slice(2).join('|')); if (e) return avisar(e); U.cerrarModal(); refrescarTV(); });
  ac('tvPonerDias', function (v) { const p = String(v).split('|'); guardarDeshacer(); const e = TV.ponerEnDias(+p[0], p[1], p[2]); if (e) return avisar(e); U.cerrarModal(); refrescarTV(); });
  ac('tvAuto', function (v) { guardarDeshacer(); TV.autocompletar(v === '1'); refrescarTV(); });
  ac('tvCopiar', function (v) { guardarDeshacer(); TV.copiarDia(st.dia || 0, v); avisar('', 'Día copiado'); refrescarTV(); });
  ac('tvVaciarDia', function (v) { guardarDeshacer(); TV.vaciarDia(+v); refrescarTV(); });
  ac('tvDeshacer', function () { const c = N.S.canal; if (!c || !st.undo || !st.undo.length) return; c.par = JSON.parse(st.undo.pop()); refrescarTV(); });
  ac('tvAdsVer', function (v) { const n = document.getElementById('tvAdsN'), t = document.getElementById('tvAdsTx'); if (n) n.textContent = v; if (t) t.innerHTML = textoAds(+v); });
  ac('tvAds', function (v) { TV.ponerAnuncios(+v); U.refrescar(); });
  ac('tvMejorar', function (v) { avisar(TV.mejorarPrograma(v), 'Programa mejorado'); U.refrescar(); });
  ac('tvLicComprar', function (v) { avisar(TV.comprarLic(v), 'Derechos comprados: ya puedes programarla'); U.refrescar(); });
  ac('tvModa', function () { avisar(TV.comprarModa(), 'Campaña en marcha'); U.refrescar(); });
  ac('tvPat', function (v) { avisar(TV.aceptarPatrocinio(v), 'Patrocinio firmado'); U.refrescar(); });
  ac('tvNoticia', function (v) { avisar(TV.comprarNoticia(v), 'Exclusiva comprada'); U.refrescar(); });

  /* ---------- Plataforma de streaming: portada, catálogo, licencias, crecimiento y analítica ---------- */
  const TIPO_SV = { propio: 'Propio', comprado: 'Comprado', licencia: 'Licencia', linea: 'Suministro', negro: 'Pirata' };
  function posterSV(x, cls) {
    const o = ST.obraDe(x);
    return o ? '<canvas class="' + cls + '" data-poster="' + o.id + '"></canvas>' : '<canvas class="' + cls + '" data-poster="x" data-tit="' + esc(x.nom) + '" data-gen="' + esc(x.gen || 'Drama') + '"></canvas>';
  }
  function puestoTop(s, id) { const u = s.ult; if (!u) return 0; for (let i = 0; i < u.top.length; i++) if (u.top[i].id === id) return i + 1; return 0; }
  function insignias(s, x) {
    const t = puestoTop(s, x.id), b = [];
    if (x.orig) b.push('<i class="sv-b orig">ORIGINAL</i>');
    if (t) b.push('<i class="sv-b top">TOP ' + t + '</i>');
    if (ST.esNuevo(x)) b.push('<i class="sv-b nuevo">NUEVO</i>');
    if (x.hasta && x.hasta - N.S.t <= 8) b.push('<i class="sv-b vence">VENCE</i>');
    if (x.tipo === 'negro') b.push('<i class="sv-b pirata">PIRATA</i>');
    return b.length ? '<span class="sv-bs">' + b.join('') + '</span>' : '';
  }
  function ficha(s, x, numero) {
    return '<button class="sv-t" data-a="svVer" data-v="' + x.id + '" aria-label="' + esc(x.nom) + '">' + (numero ? '<b class="sv-num">' + numero + '</b>' : '') + '<span class="sv-p">' + posterSV(x, 'sv-cv') + insignias(s, x) + (s.dest === x.id ? '<i class="sv-estrella">★</i>' : '') + '</span><span class="sv-tt">' + esc(x.nom) + '</span></button>';
  }
  function fila(s, titulo, lista, numerada, vacio) {
    return '<div class="sv-fila"><h3>' + titulo + '</h3>' + (lista.length ? '<div class="sv-tira">' + lista.map(function (x, i) { return ficha(s, x, numerada ? i + 1 : 0); }).join('') + '</div>' : '<p class="tenue chico">' + vacio + '</p>') + '</div>';
  }
  function cabSV(s) {
    const r = ST.resumen();
    return '<div class="sv-cab"><div class="sv-logo">' + esc(siglas(s.nom)) + '</div><div class="col crece"><b class="tv-nom">' + esc(s.nom) + '</b><span class="tenue chico">' + s.reg.length + ' de 6 regiones · ' + Math.round(r.parte * 100) + ' % del mercado mundial</span><span class="sv-linea"><i></i>En línea · red nivel ' + s.srv + '</span></div></div>' +
      '<div class="kpis tv-kpis">' + kpi('Suscriptores', U.grande(r.subs)) + kpi('Ingresos/sem', dinero(r.ing), 'bien') + kpi('Gastos/sem', dinero(r.gas), 'mal') + kpi('Ganancia/sem', dinero(r.ing - r.gas), r.ing >= r.gas ? 'bien' : 'mal') +
      kpi('Abandono/mes', U.decimal(r.churnMes * 100, 1) + ' %', r.churnMes > 0.06 ? 'mal' : '') + kpi('Biblioteca', r.cat + ' / ' + r.cap) + '</div>';
  }
  // ---------- Negocio › Streaming ----------
  function streaming() {
    const S = N.S;
    if (!S.stream) {
      if (!ST.puede()) return '<p class="nota">Las plataformas de streaming llegan en ' + ST.ANIO + '. Mientras, tus obras pasan por la ventana de streaming de otras plataformas cuando existan.</p>';
      return '<div class="tarjeta sv-lanzar"><div class="sv-logo">+</div><h3>Lanza tu plataforma</h3><p>Tres planes, suscriptores que llegan y se van, una portada que tú decides, originales, licencias, regiones del mundo y analítica semanal.</p><label class="campo"><span>Nombre</span><input id="tvNomStream" maxlength="30" value="' + esc(S.estudios[0].nombre + '+') + '"></label>' + btn('Lanzar · ' + dinero(ST.costoLanzar()), 'tvLanzar', '', 'primario bloque') + '</div>';
    }
    const s = ST.plataforma(), vista = st.svVista || 'inicio';
    let h = cabSV(s);
    h += '<div class="pestanas tv-tabs">' + [['inicio', 'Portada'], ['catalogo', 'Catálogo'], ['licencias', 'Licencias y lotes'], ['crecimiento', 'Planes y crecimiento'], ['analitica', 'Analítica']].map(function (x) {
      return '<button class="pestana' + (vista === x[0] ? ' on' : '') + '" data-a="svVista" data-v="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div>';
    return h + ({ inicio: svInicio, catalogo: svCatalogo, licencias: svLicencias, crecimiento: svCrecimiento, analitica: svAnalitica }[vista] || svInicio)(s);
  }
  function svInicio(s) {
    const d = s.dest ? ST.porId(s.dest) : null;
    let h = '';
    if (d) {
      const o = ST.obraDe(d);
      h += '<div class="sv-hero"><div class="sv-hero-p">' + posterSV(d, 'sv-cvg') + '</div><div class="col crece"><span class="sv-b orig">DESTACADO</span><h2>' + esc(d.nom) + '</h2><span class="chico">' + (o ? esc(o.gen.slice(0, 2).join(' · ')) + ' · ' + esc(o.clas) + ' · ' + (o.tv ? 'serie' : 'película') : esc(d.gen || '')) + '</span><span class="chico tenue">' + U.decimal(d.vs || 0, 1) + ' M de horas vistas · atractivo ×1,5 en la portada</span><div class="fila">' + btn('Cambiar', 'svElegirDest', '') + btn('Ver ficha', 'svVer', d.id) + '</div></div></div>';
    } else h += '<div class="sv-hero vacio"><div class="col crece"><h2>Elige tu destacado</h2><span class="chico">Es lo primero que ve el público al entrar: su atractivo cuenta ×1,5 y lo ve el doble de gente.</span>' + btn('Elegir destacado', 'svElegirDest', '', 'primario') + '</div></div>';
    const top = (s.ult ? s.ult.top : []).map(function (t) { return ST.porId(t.id); }).filter(Boolean);
    const ori = s.cat.filter(function (x) { return x.orig; }).sort(function (a, b) { return (b.t0 || 0) - (a.t0 || 0); }).slice(0, 15);
    const nov = s.cat.filter(ST.esNuevo).sort(function (a, b) { return (b.t0 || 0) - (a.t0 || 0); }).slice(0, 15);
    const sel = s.fila.map(ST.porId).filter(Boolean);
    h += fila(s, 'Top 10 de la semana', top, true, 'El primer top llega al terminar la semana.');
    h += fila(s, 'Tu selección <span class="tenue chico">(' + sel.length + ' de 8 · atractivo ×1,2)</span>', sel, false, 'Toca un título y elige «Añadir a tu selección».');
    h += fila(s, 'Originales de ' + esc(s.nom), ori, false, 'Estrena series en tu plataforma o películas directo a streaming para tener originales (×1,3).');
    h += fila(s, 'Novedades', nov, false, 'Sin novedades en las últimas 8 semanas: el público se aburre y se va más rápido.');
    const porFam = {};
    s.cat.forEach(function (x) { const f = ST.famDe(x); (porFam[f] = porFam[f] || []).push(x); });
    Object.keys(porFam).sort(function (a, b) { return porFam[b].length - porFam[a].length; }).slice(0, 3).forEach(function (f) {
      const fam = D.familia(f);
      h += fila(s, esc(fam ? fam.nombre : f), porFam[f].sort(function (a, b) { return ST.valorTitulo(b) - ST.valorTitulo(a); }).slice(0, 15), false, '');
    });
    return h;
  }
  function svCatalogo(s) {
    const fl = st.svFiltro || 'todos', ord = st.svOrden || 'vistas', mx = st.svMax || 48;
    const filtros = [['todos', 'Todos'], ['orig', 'Originales'], ['propio', 'Propios'], ['licencia', 'Licencias'], ['linea', 'Suministro'], ['negro', 'Piratas']];
    let lista = s.cat.filter(function (x) { return fl === 'todos' || (fl === 'orig' ? x.orig : fl === 'licencia' ? x.tipo === 'licencia' || x.tipo === 'comprado' : x.tipo === fl); });
    const vSem = {};
    (s.ult ? s.ult.top : []).forEach(function (t) { vSem[t.id] = t.v; });
    lista.sort(function (a, b) { return ord === 'vistas' ? (b.vs || 0) - (a.vs || 0) : ord === 'valor' ? ST.valorTitulo(b) - ST.valorTitulo(a) : ord === 'nuevos' ? (b.t0 || 0) - (a.t0 || 0) : (a.hasta || 1e9) - (b.hasta || 1e9); });
    let h = '<div class="fila sv-cap"><div class="tv-meta"><i style="width:' + Math.round(s.cat.length / s.cap * 100) + '%;background:' + (s.cat.length >= s.cap ? 'var(--mal)' : 'var(--acento)') + '"></i></div><span class="chico">' + s.cat.length + ' de ' + s.cap + ' títulos</span>' + btn('Bóveda +40 · ' + dinero(ST.costoBoveda()), 'tvBoveda') + '</div>';
    h += '<div class="pestanas">' + filtros.map(function (f) { return '<button class="pestana' + (fl === f[0] ? ' on' : '') + '" data-a="svFiltro" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>';
    h += '<div class="seg sv-orden">' + [['vistas', 'Más vistos'], ['valor', 'Atractivo'], ['nuevos', 'Nuevos'], ['vence', 'Vencen']].map(function (o) { return '<button class="' + (ord === o[0] ? 'on' : '') + '" data-a="svOrden" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
    h += lista.length ? '<div class="sv-rej">' + lista.slice(0, mx).map(function (x) { return ficha(s, x, 0); }).join('') + '</div>' : '<p class="tenue">Nada con este filtro.</p>';
    if (lista.length > mx) h += btn('Ver más (' + (lista.length - mx) + ')', 'svMas', '', 'bloque');
    const propias = N.S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && !s.cat.some(function (x) { return x.o === o.id; }); }).slice(-12);
    if (propias.length) h += '<h3>Agregar obras tuyas</h3><div class="fila">' + sel('tvPropia', propias.map(function (o) { return [o.id, o.tit + ' · ' + (o.pub || '—')]; }), st.propia || propias[0].id) + btn('Agregar', 'tvAgregar', '', 'primario') + '</div>';
    return h;
  }
  function verTitulo(id) {
    const s = ST.plataforma(), x = ST.porId(id);
    if (!x) return '<p>Ese título ya no está.</p>' + btn('Cerrar', 'cerrarModal', '');
    const o = ST.obraDe(x), t = puestoTop(s, x.id), sem = s.ult ? (s.ult.top.filter(function (y) { return y.id === x.id; })[0] || {}).v : 0;
    let h = '<div class="sv-ver"><div class="sv-ver-p">' + posterSV(x, 'sv-cvg') + '</div><div class="col crece"><h2>' + esc(x.nom) + '</h2>' + insignias(s, x) +
      '<span class="chico">' + TIPO_SV[x.tipo] + (x.modo ? ' · ' + esc((ST.MODOS.filter(function (m) { return m.id === x.modo; })[0] || {}).nombre || '') : '') + (o ? ' · ' + esc(nomEst(o.est)) : '') + '</span>' +
      '<span class="chico">' + esc(ST.generoDe(x)) + (o ? ' · ' + esc(o.clas) + ' · ' + (o.tv ? 'serie' : 'película') + ' · ' + (o.anio || N.anio(o.fe || N.S.t)) : '') + '</span></div></div>';
    h += '<div class="kpis">' + kpi('Calidad', String(Math.round(ST.calidad(x)))) + kpi('Atractivo', U.decimal(ST.valorTitulo(x), 2)) + kpi('Horas vistas', U.decimal(x.vs || 0, 1) + ' M') + kpi('Esta semana', t ? 'Top ' + t : (sem ? U.decimal(sem, 2) + ' M' : '—')) + '</div>';
    if (x.p && x.vs > 0.01) h += '<p class="chico">Costo por hora vista: <b>' + dinero(x.p / (x.vs * 1e6)) + '</b></p>';
    if (x.hasta) h += '<p class="chico">Contrato hasta ' + esc(U.fechaCorta(x.hasta)) + '.</p>';
    const enFila = s.fila.indexOf(x.id) >= 0;
    h += '<div class="fila">' + (s.dest === x.id ? '<span class="etiqueta">★ Destacado</span>' : btn('Destacar', 'svDest', x.id, 'primario')) + btn(enFila ? 'Quitar de tu selección' : 'Añadir a tu selección', 'svFila', x.id) +
      (x.hasta && x.tipo === 'licencia' ? btn('Extender un año · ' + dinero(ST.costoExtension(x)), 'tvExtender', x.id) : '') + btn('Retirar', 'tvRetirar', x.id, 'mal') + btn('Cerrar', 'cerrarModal', '') + '</div>';
    return h;
  }
  function elegirDest() {
    const s = ST.plataforma();
    const l = s.cat.slice().sort(function (a, b) { return ST.valorTitulo(b) - ST.valorTitulo(a); }).slice(0, 24);
    return '<h2>Elige el destacado</h2><p class="tenue chico">Ordenados por atractivo. El destacado lo ve el doble de gente.</p><div class="sv-rej">' + l.map(function (x) {
      return '<button class="sv-t" data-a="svDest" data-v="' + x.id + '"><span class="sv-p">' + posterSV(x, 'sv-cv') + insignias(s, x) + '</span><span class="sv-tt">' + esc(x.nom) + '</span><span class="chico tenue">×' + U.decimal(ST.valorTitulo(x), 2) + '</span></button>';
    }).join('') + '</div>' + btn('Cerrar', 'cerrarModal', '', 'bloque');
  }
  function svLicencias(s) {
    const modo = st.svModo || 'temporal';
    let h = '<h3>Ofertas de los estudios</h3><p class="nota info">Puedes ofrecer menos: aceptan, contraofertan o se retiran. Lo que pagas lo cobra el estudio dueño.</p>';
    h += s.ofLic.length ? '<div class="tv-lics">' + s.ofLic.map(function (x, i) {
      const o = O.porId(x.o);
      return '<div class="tv-lic">' + (o ? '<canvas class="mini-poster" data-poster="' + o.id + '"></canvas>' : '') + '<div class="col crece"><b>' + esc(x.nom) + '</b><span class="tenue chico">' + esc(nomEst(x.est)) + (o ? ' · ' + esc(o.gen[0] || '') + ' · ' + esc(o.clas) + ' · calidad ' + ((o.tv && o.tv.q) || o.pub || 50) : '') + '</span>' +
        '<div class="sv-modos">' + ST.MODOS.map(function (mo) { return btn(mo.nombre.replace(/ \(.*\)/, '') + ' · ' + dinero(x.p * mo.k), 'tvLic', i + '|' + mo.id); }).join('') + '</div>' +
        '<div class="fila"><input type="number" id="tvOferta' + i + '" placeholder="Tu oferta temporal" inputmode="numeric">' + btn('Ofrecer', 'tvOfrecer', i) + '</div></div></div>';
    }).join('') + '</div>' : '<p class="tenue">Sin ofertas este mes.</p>';
    h += '<h3>Lotes de catálogo</h3><div class="seg">' + ST.MODOS.slice(0, 3).map(function (mo) { return '<button class="' + (modo === mo.id ? 'on' : '') + '" data-a="svModo" data-v="' + mo.id + '">' + mo.nombre.replace(/ \(.*\)/, '') + '</button>'; }).join('') + '</div><div class="sv-lotes">' + ST.PAQUETES.map(function (p) {
      return '<div class="sv-lote"><div class="sv-caja">' + [0, 1, 2].map(function (k) { return '<canvas class="sv-cvm" data-poster="x" data-tit="' + esc(p.nombre + ' ' + k) + '" data-gen="' + esc(['Drama', 'Comedia', 'Acción', 'Romance', 'Terror'][(k + p.n) % 5]) + '"></canvas>'; }).join('') + '</div><b>' + esc(p.nombre) + '</b><span class="chico">' + p.n + ' títulos de calidad ' + p.q + '</span>' + btn('Comprar · ' + dinero(ST.costoPaquete(p.id, modo)), 'svPaquete', p.id + '|' + modo, 'primario') + '</div>';
    }).join('') + '</div>';
    h += '<h3>Líneas de suministro</h3><p class="nota info">Cada mes llegan títulos nuevos del proveedor durante un año; pagas una cuota mensual.</p><div class="tv-progs">' + ST.PROVEEDORES.map(function (p) {
      const l = s.lineas.filter(function (x) { return x.id === p.id; })[0];
      return '<div class="tv-prog" style="--c:' + p.col + '"><b>' + esc(p.nom) + '</b><span class="chico">' + p.n + ' títulos al mes · ' + esc(p.gen) + ' · ' + dinero(ST.cuotaLinea(p)) + '/mes</span>' + (l ? '<span class="bien chico">Contratada hasta ' + esc(U.fechaCorta(l.hasta)) + '</span>' : btn('Contratar un año', 'tvLinea', p.id)) + '</div>';
    }).join('') + '</div>';
    h += '<h3>Mercado negro</h3><p class="nota info">Tres títulos atractivos y baratos. Si llega la demanda: multa, menos prestigio y te los quitan.</p>' + btn('Comprar lote pirata · ' + dinero(ST.costoNegro()), 'tvNegro', '', 'mal');
    return h;
  }
  function svCrecimiento(s) {
    const r = ST.resumen(), mix = (s.ult && s.ult.mix) || ST.mezcla(s, ST.precioTipico(N.anio())), acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || '#35d0ba';
    let h = '';
    if (s.hist.length > 1) {
      const hs = s.hist.slice(-52), et = hs.map(function (x) { return U.fechaCorta(x.t); });
      const g1 = U.grafica('svSubs', function (cv) { ART.arte.linea(cv, [{ nombre: 'Suscriptores', color: acento, valores: hs.map(function (x) { return x.subs; }) }], et, { formato: function (v) { return U.grande(v); } }); });
      const g2 = U.grafica('svAltas', function (cv) { ART.arte.linea(cv, [{ nombre: 'Altas', color: '#4ade80', valores: hs.map(function (x) { return x.nv || 0; }) }, { nombre: 'Bajas', color: '#ff6b6b', valores: hs.map(function (x) { return x.bj || 0; }) }], et, { formato: function (v) { return U.grande(v); } }); });
      h += '<h3>Suscriptores</h3><canvas class="lienzo" data-grafica="' + g1 + '"></canvas><h3>Altas y bajas por semana</h3><canvas class="lienzo" data-grafica="' + g2 + '"></canvas>';
    }
    h += '<p class="chico">Meta del mercado: <b>' + U.grande(r.obj) + '</b> suscriptores con tu catálogo y precios. Esta semana: +' + U.grande(r.nuevos) + ' altas, −' + U.grande(r.bajas) + ' bajas.</p>';
    h += '<h3>Planes (al mes)</h3><div class="col">' + ST.PLANES.map(function (p, i) {
      return '<div class="sv-plan"><div class="fila entre"><b>' + esc(p.nombre) + '</b><b class="cifra" id="svPrecio' + i + '">' + dinero(s.precios[i]) + '</b></div><input type="range" min="0.5" max="' + N.redondear(ST.precioTipico(N.anio()) * 3, 1) + '" step="0.5" value="' + s.precios[i] + '" data-i="svPrecioVer" data-c="tvPrecio" data-v="' + i + '" aria-label="Precio del plan ' + esc(p.nombre) + '">' +
        '<div class="tv-meta"><i style="width:' + Math.round(mix[i] * 100) + '%;background:' + ['#94a3b8', 'var(--acento)', 'var(--dorado)'][i] + '"></i></div><span class="chico tenue">' + Math.round(mix[i] * 100) + ' % de los suscriptores' + (i === 0 ? ' · suma ingresos por anuncios' : '') + '</span></div>';
    }).join('') + '<span class="tenue chico">Precio típico del plan estándar: ' + dinero(ST.precioTipico(N.anio())) + '. Más caro que la competencia: menos altas y más bajas. Los precios se ajustan solos a la inflación.</span></div>';
    const camp = s.camp && s.camp.hasta > N.S.t;
    h += '<h3>Palancas de crecimiento</h3><div class="tv-progs">' +
      '<div class="tv-prog" style="--c:#4ade80"><b>Mes de prueba gratis</b><span class="chico">Más altas (×1,3), pero algo más de bajas y un 7 % menos de ingresos.</span>' + btn(s.prueba ? 'Desactivar' : 'Activar', 'svPrueba', '', s.prueba ? '' : 'primario') + '</div>' +
      '<div class="tv-prog" style="--c:#ffc857"><b>Campaña de captación</b><span class="chico">' + (camp ? 'En marcha hasta ' + esc(U.fechaCorta(s.camp.hasta)) + ': altas ×1,6.' : 'Ocho semanas de publicidad: altas ×1,6.') + '</span>' + (camp ? '' : btn('Lanzar · ' + dinero(ST.costoCampana()), 'svCampana', '', 'primario')) + '</div>' +
      '<div class="tv-prog" style="--c:#5b8cff"><b>Red y servidores · nivel ' + s.srv + ' de 5</b><span class="chico">Mejor imagen y menos cortes: −6 % de bajas por nivel; cada nivel sube un 15 % el costo de servidores.</span>' + (s.srv < 5 ? btn('Mejorar · ' + dinero(ST.costoServidores()), 'svServidores', '') : '<span class="etiqueta">Nivel máximo</span>') + '</div></div>';
    h += '<h3>Regiones</h3><div class="sv-regs">' + Object.keys(ST.REGIONES).map(function (id) {
      const on = s.reg.indexOf(id) >= 0, rg = D.region(id);
      return '<div class="sv-reg' + (on ? ' on' : '') + '"><b>' + esc(rg ? rg.nombre : id) + '</b><span class="chico">' + Math.round(ST.REGIONES[id] * 100) + ' % del mercado</span>' + (on ? '<span class="bien chico">Disponible</span>' : btn('Llegar · ' + dinero(ST.costoRegion(id)), 'svRegion', id)) + '</div>';
    }).join('') + '</div>';
    return h;
  }
  function svAnalitica(s) {
    const r = ST.resumen(), u = s.ult;
    let h = '<div class="kpis">' + kpi('Ingreso por suscriptor/mes', dinero(r.arpu)) + kpi('Valor de un suscriptor', dinero(r.ltv)) + kpi('Horas vistas/sem', u ? U.decimal(u.horas, 1) + ' M' : '—') + kpi('Novedades', Math.round(r.novedad * 100) + ' % del catálogo') + kpi('Originales', String(r.originales)) + kpi('Propios', String(r.propios)) + '</div>';
    if (s.hist.length > 1) {
      const hs = s.hist.slice(-52);
      const g = U.grafica('svDinero', function (cv) { ART.arte.linea(cv, [{ nombre: 'Ingresos', valores: hs.map(function (x) { return x.ing; }) }, { nombre: 'Gastos', valores: hs.map(function (x) { return x.gas; }) }], hs.map(function (x) { return U.fechaCorta(x.t); }), { formato: function (v) { return dinero(v); } }); });
      h += '<h3>Ingresos y gastos</h3><canvas class="lienzo" data-grafica="' + g + '"></canvas>';
    }
    if (u && u.top.length) {
      const mx = u.top[0].v || 1;
      h += '<h3>Top 10 · horas vistas esta semana</h3><div class="col">' + u.top.map(function (t, i) {
        const x = ST.porId(t.id);
        return '<div class="tv-cf"><span>' + (i + 1) + '. ' + esc(t.nom) + '</span><div class="tv-meta"><i style="width:' + (t.v / mx * 100).toFixed(0) + '%;background:var(--acento)"></i></div><b class="cifra">' + U.decimal(t.v, 2) + ' M</b></div>' + (x && x.p && x.vs > 0.01 ? '<span class="chico tenue">' + dinero(x.p / (x.vs * 1e6)) + ' por hora vista</span>' : '');
      }).join('') + '</div>';
    }
    const tipos = {};
    s.cat.forEach(function (x) { const k = x.orig ? 'Originales' : TIPO_SV[x.tipo]; tipos[k] = (tipos[k] || 0) + (x.vs || 0); });
    const ks = Object.keys(tipos), tv = ks.reduce(function (a, k) { return a + tipos[k]; }, 0) || 1;
    h += '<h3>Horas vistas por origen</h3><div class="col">' + ks.sort(function (a, b) { return tipos[b] - tipos[a]; }).map(function (k) { return '<div class="tv-cf"><span>' + esc(k) + '</span><div class="tv-meta"><i style="width:' + Math.round(tipos[k] / tv * 100) + '%;background:var(--dorado)"></i></div><b class="cifra">' + Math.round(tipos[k] / tv * 100) + ' %</b></div>'; }).join('') + '</div>';
    return h;
  }
  ac('tvLanzar', function () { avisar(ST.lanzar(document.getElementById('tvNomStream').value), '¡Tu plataforma está en línea!'); U.refrescar(); });
  ac('svVista', function (v) { st.svVista = v; U.refrescar(); });
  ac('svFiltro', function (v) { st.svFiltro = v; st.svMax = 48; U.refrescar(); });
  ac('svOrden', function (v) { st.svOrden = v; U.refrescar(); });
  ac('svMas', function () { st.svMax = (st.svMax || 48) + 48; U.refrescar(); });
  ac('svModo', function (v) { st.svModo = v; U.refrescar(); });
  ac('svVer', function (v) { U.modal(verTitulo(v)); });
  ac('svElegirDest', function () { U.modal(elegirDest()); });
  ac('svDest', function (v) { avisar(ST.ponerDestacado(v), 'Nuevo destacado en la portada'); U.cerrarModal(); U.refrescar(); });
  ac('svFila', function (v) { const e = ST.alternarFila(v); if (e) return avisar(e); U.modal(verTitulo(v)); U.refrescar(); });
  ac('svPaquete', function (v) { const p = v.split('|'); avisar(ST.comprarPaquete(p[0], p[1]), 'Lote agregado al catálogo'); U.refrescar(); });
  ac('svPrueba', function () { ST.alternarPrueba(); U.refrescar(); });
  ac('svCampana', function () { avisar(ST.campana(), 'Campaña en marcha'); U.refrescar(); });
  ac('svServidores', function () { avisar(ST.mejorarServidores(), 'Red mejorada'); U.refrescar(); });
  ac('svRegion', function (v) { avisar(ST.abrirRegion(v), 'Nueva región disponible'); U.refrescar(); });
  ac('svPrecioVer', function (v, el) { const b = document.getElementById('svPrecio' + el.getAttribute('data-v')); if (b) b.textContent = dinero(+v); });
  ac('tvPrecio', function (v, el) { ST.ponerPrecio(+el.getAttribute('data-v'), v); U.refrescar(); });
  ac('tvBoveda', function () { avisar(ST.comprarBoveda(), 'Bóveda construida'); U.refrescar(); });
  ac('tvExtender', function (v) { avisar(ST.extender(v), 'Contrato extendido un año'); if (U.modalAbierto()) U.modal(verTitulo(v)); U.refrescar(); });
  ac('tvRetirar', function (v) { ST.retirar(v); U.cerrarModal(); U.refrescar(); });
  ac('tvPropia', function (v) { st.propia = +v; });
  ac('tvAgregar', function () { const s = N.S.stream, p = N.S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && !s.cat.some(function (x) { return x.o === o.id; }); }).slice(-12); avisar(ST.agregar(st.propia || (p[0] && p[0].id), 'propio'), 'Agregada al catálogo'); st.propia = null; U.refrescar(); });
  ac('tvLic', function (v) { const p = v.split('|'); avisar(ST.licenciar(+p[0], p[1]), 'Licencia firmada'); U.refrescar(); });
  ac('tvOfrecer', function (v) { const el = document.getElementById('tvOferta' + v); avisar(ST.licenciar(+v, 'temporal', +(el && el.value) || 0), 'Aceptaron tu oferta'); U.refrescar(); });
  ac('tvLinea', function (v) { avisar(ST.contratarLinea(v), 'Línea contratada'); U.refrescar(); });
  ac('tvNegro', function () { avisar(ST.comprarNegro(), 'Lote pirata en tu catálogo'); U.refrescar(); });

  return { franquicias: franquicias, fichaFranquicia: fichaFranquicia, adquisicion: adquisicion, nuevaSerie: nuevaSerie, bannerCrear: bannerCrear, pilotos: pilotos,
    bloqueObra: bloqueObra, canal: canal, streaming: streaming };
})();
