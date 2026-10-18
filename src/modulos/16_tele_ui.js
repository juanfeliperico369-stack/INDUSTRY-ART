/* ==== módulo: tele_ui ==== */
// Pantallas de franquicias (lista, biografía y línea por fecha, personajes, continuidades, licencias,
// crossovers, mente maestra, registro, venta), Adquisición (derechos de rivales, libros y dominio público), botón
// Continuación con los siete caminos y la llamada al elenco, nueva serie (formato, episodios, sala, tramas,
// piloto y pitch), dónde se emite, renovar o cancelar; canal propio (parrilla, autocompletar, público por grupos,
// patrocinadores, tema y noticias) y plataforma de streaming (planes, catálogo, licencias, bóvedas, suministro).
IA.teleUI = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, O = IA.obras, U = IA.ui, F = IA.franquicias, TV = IA.tv, ST = IA.streaming, esc = N.esc;
  const dinero = U.dinero, ac = U.accion;
  const st = { fr: null, dia: 0, cont: null };
  function kpi(n, v, c) { return '<div class="kpi"><span>' + esc(n) + '</span><b class="cifra ' + (c || '') + '">' + esc(v) + '</b></div>'; }
  function btn(txt, a, v, cl) { return '<button class="btn ' + (cl || '') + '" data-a="' + a + '" data-v="' + esc(v === undefined ? '' : v) + '">' + esc(txt) + '</button>'; }
  function sel(c, ops, val, dv) { return '<select data-c="' + c + '"' + (dv !== undefined ? ' data-v="' + esc(dv) + '"' : '') + '>' + ops.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function nomEst(i) { return N.S.estudios[i] ? N.S.estudios[i].nombre : '—'; }
  function avisar(e, ok) { U.aviso(e || ok, e ? 'mal' : ''); }
  function refrescarFicha(id) { if (id && U.fichaAbierta()) U.refrescarFicha(IA.pantallas.fichaObra(+id)); else U.refrescar(); }
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
  ac('tvAbrirCrear', function () { U.cerrarModal(); if (st.borr) IA.creacion.abrirCon(st.borr); st.borr = null; });
  ac('tvVerFr', function (v) { st.fr = +v; U.modal(fichaFranquicia(v)); });
  ac('tvContinuar', function (v) { const e = F.puedeContinuar(O.porId(+v)); if (e) return avisar(e); st.cont = null; U.modal(modalContinuar(v)); });
  ac('tvCam', function (v) { st.cont.cam = v; U.modal(modalContinuar(st.cont.o)); });
  ac('tvMed', function (v) { st.cont.med = v; });
  ac('tvPersK', function (v) { st.cont.k = +v; });
  ac('tvLlamar', function () {
    const c = st.cont, r = IA.creacion.conAzarUI(function () { return F.continuar(c.o, c.cam, c.med, c.cam === 'spinoff' ? c.k : undefined); });
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
  ac('tvCruce', function (v) { const p = v.split('|'), r = IA.creacion.conAzarUI(function () { return F.continuarCruce(+p[0], +p[1]); }); if (r.error) return avisar(r.error); abrirBorrador(r); });
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
    const mats = IA.ideas.materialesDisponibles(a);
    const libres = mats.filter(function (x) { return IA.ideas.esLibre(x, a); }).slice(0, 10), libros = mats.filter(function (x) { return !IA.ideas.esLibre(x, a); }).slice(0, 10);
    const fila = function (x, libre) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.tit) + '</b><span class="tenue chico">' + esc(x.autor || '') + (x.anio ? ' · ' + x.anio : '') + '</span></div>' + (libre ? '<span class="etiqueta">Libre</span>' : '<span class="cifra">' + dinero(IA.ideas.costoDerechos(x, a)) + '</span>') + btn('Adaptar', 'tvAdaptar', x.id, 'primario') + '</div>'; };
    h += '</div><h3>Libros con derechos</h3><div class="col">' + (libros.length ? libros.map(function (x) { return fila(x, false); }).join('') : '<p class="tenue">No hay libros con derechos en este año.</p>') + '</div>';
    h += '<h3>Dominio público</h3><div class="col">' + (libres.length ? libres.map(function (x) { return fila(x, true); }).join('') : '<p class="tenue">Nada libre todavía.</p>') + '</div>';
    return h;
  }
  ac('tvComprar', function (v) { const p = v.split('|'); avisar(F.comprar(p[0], +p[1]), 'Derechos comprados: ya puedes continuarla'); U.refrescar(); });
  ac('tvAdaptar', function (v) {
    const b = IA.creacion.conAzarUI(function () { const x = O.borrador(0, { gen: ['Drama'], escala: 2, completa: true }); IA.ideas.usarMaterial(x, v, N.anio()); if (!(x.prob && x.prob.length)) IA.ideas.recomendarHistoria(x, N.anio()); IA.ideas.generarPersonajes(x); O.equipoRecomendado(x, 1); O.recalcular(x); return x; });
    IA.creacion.abrirCon(b);
  });

  // ---------- Nueva serie y su configuración en la creación ----------
  function nuevaSerie() {
    if (!TV.puedeTV(N.anio())) return avisar('La televisión llega en ' + TV.ANIO_TV + '.');
    const b = IA.creacion.conAzarUI(function () { const x = O.borrador(0, { gen: ['Drama'], escala: 1, completa: true }); TV.aplicar(x); if (!(x.prob && x.prob.length)) IA.ideas.recomendarHistoria(x, N.anio()); IA.ideas.generarPersonajes(x); O.equipoRecomendado(x, 1); O.recalcular(x); return x; });
    IA.creacion.abrirCon(b);
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
  function cb() { return IA.creacion.estado.b; }
  function reaplicar(c) { const b = cb(); if (!b) return; TV.aplicar(b, c); O.recalcular(b); IA.creacion.refrescar(); }
  ac('tvFmt', function (v) { reaplicar({ fmt: v, eps: TV.formato(v).def }); });
  ac('tvSub', function (v) { reaplicar({ sub: v }); });
  ac('tvModo', function (v) { reaplicar({ modo: v }); });
  ac('tvEps', function (v) { reaplicar({ eps: +v }); });
  ac('tvMin', function (v) { const b = cb(); if (b) { b.min = +v; reaplicar({}); } });
  ac('tvSala', function (v) { reaplicar({ sala: +v }); });
  ac('tvTramas', function (v) { reaplicar({ tramas: +v }); });
  ac('tvPitch', function (v) { const b = cb(); const e = IA.creacion.conAzarUI(function () { return TV.pitch(b, v); }); avisar(e, '¡Compraron la idea!'); IA.creacion.refrescar(); });
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
  ac('tvRenovar', function (v) { const r = IA.creacion.conAzarUI(function () { return TV.renovar(+v); }); if (r.error) return avisar(r.error); U.cerrarFicha(); abrirBorrador(r); });
  ac('tvCancelar', function (v) { TV.cancelar(+v); refrescarFicha(v); });

  // ---------- Negocio › Canal ----------
  function canal() {
    const S = N.S, c = S.canal, a = N.anio();
    if (!c) {
      if (a < TV.ANIO_CANAL) return '<p class="nota">La televisión comercial llega en ' + TV.ANIO_CANAL + '. Mientras, puedes producir programas en vivo para las cadenas.</p>';
      return '<div class="tarjeta"><h3>Abre tu canal</h3><p>Programa siete días por franjas, cobra por audiencia y emite tus series.</p><label class="campo"><span>Nombre</span><input id="tvNomCanal" maxlength="30" value="' + esc(S.estudios[0].nombre + ' TV') + '"></label>' +
        '<label class="campo"><span>Tema</span><select id="tvTemaCanal"><option value="">Generalista</option>' + D.familias.map(function (f) { return '<option value="' + f.id + '">' + esc(f.nombre) + '</option>'; }).join('') + '</select></label>' + btn('Abrir canal · ' + dinero(TV.costoCanal()), 'tvAbrirCanal', '', 'primario bloque') + '</div>';
    }
    const ult = c.hist[c.hist.length - 1] || { aud: 0, ing: 0, gas: 0 };
    let h = '<div class="kpis">' + kpi('Canal', c.nom) + kpi('Audiencia media', m(ult.aud)) + kpi('Ingresos/sem', dinero(ult.ing), 'bien') + kpi('Gastos/sem', dinero(ult.gas), 'mal') + kpi('Alcance', Math.round(c.alc * 100) + ' %') + '</div>';
    h += '<div class="fila"><span>Tema:</span>' + sel('tvTema', [['', 'Generalista']].concat(D.familias.map(function (f) { return [f.id, f.nombre]; })), c.tema || '') + '<span class="tenue chico">cambiarlo cuesta ' + dinero(TV.costoCambioTema()) + '</span></div>';
    const g = c.grupos, gs = g.reduce(function (x, y) { return x + y; }, 0) || 1;
    h += '<h3>Público por grupos</h3><div class="col">' + ['Niños', 'Jóvenes', 'Adultos jóvenes', 'Adultos', 'Mayores'].map(function (n, i) { return '<div class="fila entre"><span>' + n + '</span><span class="cifra">' + Math.round(g[i] / gs * 100) + ' %</span></div>'; }).join('') + '</div>';
    // Parrilla: un día a la vez (sin desplazamiento lateral)
    const cn = TV.contenidos();
    const ops = [['', '— vacío —']].concat(cn.series.map(function (o) { return ['o:' + o.id, '▶ ' + o.tit]; }), cn.rep.map(function (o) { return ['o:' + o.id, '↺ ' + o.tit + (c.fres[o.id] !== undefined ? ' (' + Math.round(c.fres[o.id] * 100) + ' % fresca)' : '')]; }), cn.gen.map(function (x) { return ['g:' + x.id, x.nombre]; }));
    h += '<h3>Parrilla</h3><div class="pestanas">' + TV.DIAS.map(function (d, i) { return '<button class="pestana' + (st.dia === i ? ' on' : '') + '" data-a="tvDia" data-v="' + i + '">' + d.slice(0, 3) + '</button>'; }).join('') + '</div><div class="col">';
    TV.FRANJAS.forEach(function (fr, j) {
      const x = c.par[st.dia][j], val = !x ? '' : x.g ? 'g:' + x.g : 'o:' + x.o, o = x && x.o ? O.porId(x.o) : null;
      h += '<div class="cal-ev"><div class="col crece"><b>' + esc(fr.nombre) + '</b><span class="tenue chico">' + m(c.porFranja[j] || 0) + (fr.fam ? ' · horario familiar' : '') + (o && fr.fam && TV.multable(o) ? ' · <b class="mal">multa ' + dinero(TV.multaFamiliar()) + '</b>' : '') + '</span></div>' + sel('tvCelda', ops, val, st.dia + '|' + j) + '</div>';
    });
    h += '</div><div class="fila">' + btn('Autocompletar vacías', 'tvAuto', '1', 'primario') + btn('Rehacer toda la parrilla', 'tvAuto', '0') + '</div>';
    h += '<h3>Patrocinadores</h3>' + (c.pat.length ? c.pat.map(function (p) { return '<p>' + esc(p.nom) + ' · ' + esc(TV.FRANJAS[p.f].nombre) + ' · meta ' + m(p.meta) + ' · ' + dinero(p.pago) + '/sem' + (p.mal ? ' · <span class="mal">' + p.mal + ' semanas bajo la meta</span>' : '') + '</p>'; }).join('') : '<p class="tenue chico">Sin patrocinadores.</p>') +
      c.ofPat.map(function (p) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(p.nom) + '</b><span class="tenue chico">' + esc(TV.FRANJAS[p.f].nombre) + ': pide ' + m(p.meta) + ' de audiencia · paga ' + dinero(p.pago) + '/sem por ' + p.sem + ' semanas</span></div>' + btn('Aceptar', 'tvPat', p.id, 'primario') + '</div>'; }).join('');
    h += '<h3>Noticias exclusivas</h3><p class="nota info">Suben la audiencia del noticiero y del canal unas semanas; después vencen.</p>' + c.notis.map(function (x) { return '<p class="bien chico">' + esc(x.txt) + ' · hasta ' + esc(U.fechaCorta(x.hasta)) + '</p>'; }).join('') +
      (c.ofNot.length ? c.ofNot.map(function (x) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.txt) + '</b><span class="tenue chico">+' + Math.round(x.bono * 100) + ' % por ' + x.sem + ' semanas</span></div>' + btn(dinero(x.costo), 'tvNoticia', x.id, 'primario') + '</div>'; }).join('') : '<p class="tenue chico">No hay exclusivas a la venta esta semana.</p>');
    return h;
  }
  ac('tvAbrirCanal', function () { const e = TV.comprarCanal(document.getElementById('tvNomCanal').value, document.getElementById('tvTemaCanal').value || null); avisar(e, '¡Tu canal sale al aire!'); U.refrescar(); });
  ac('tvTema', function (v) { avisar(TV.cambiarTema(v || null), 'Tema del canal cambiado'); U.refrescar(); });
  ac('tvDia', function (v) { st.dia = +v; U.refrescar(); });
  ac('tvCelda', function (v, el) { const p = el.getAttribute('data-v').split('|'); TV.poner(+p[0], +p[1], v); U.refrescar(); });
  ac('tvAuto', function (v) { TV.autocompletar(v === '1'); U.refrescar(); });
  ac('tvPat', function (v) { avisar(TV.aceptarPatrocinio(v), 'Patrocinio firmado'); U.refrescar(); });
  ac('tvNoticia', function (v) { avisar(TV.comprarNoticia(v), 'Exclusiva comprada'); U.refrescar(); });

  // ---------- Negocio › Streaming ----------
  function streaming() {
    const S = N.S, s = S.stream, a = N.anio();
    if (!s) {
      if (!ST.puede()) return '<p class="nota">Las plataformas de streaming llegan en ' + ST.ANIO + '. Mientras, tus obras pasan por la ventana de streaming de otras plataformas cuando existan.</p>';
      return '<div class="tarjeta"><h3>Lanza tu plataforma</h3><p>Tres planes, suscriptores, servidores y un catálogo propio, comprado y licenciado.</p><label class="campo"><span>Nombre</span><input id="tvNomStream" maxlength="30" value="' + esc(S.estudios[0].nombre + '+') + '"></label>' + btn('Lanzar · ' + dinero(ST.costoLanzar()), 'tvLanzar', '', 'primario bloque') + '</div>';
    }
    const r = ST.resumen();
    let h = '<div class="kpis">' + kpi('Plataforma', s.nom) + kpi('Suscriptores', U.grande(r.subs)) + kpi('Ingresos/sem', dinero(r.ing), 'bien') + kpi('Servidores y más/sem', dinero(r.gas), 'mal') + kpi('Biblioteca', r.cat + ' / ' + r.cap) + '</div>';
    h += '<h3>Planes (al mes)</h3><div class="col">' + ST.PLANES.map(function (p, i) { return '<label class="campo"><span>' + esc(p.nombre) + '</span><input type="number" step="0.5" data-c="tvPrecio" data-v="' + i + '" value="' + s.precios[i] + '"></label>'; }).join('') + '<span class="tenue chico">Precio típico del plan estándar: ' + dinero(ST.precioTipico(a)) + '</span></div>';
    h += '<div class="fila">' + btn('Comprar bóveda (+40) · ' + dinero(ST.costoBoveda()), 'tvBoveda') + '</div>';
    const nom = { propio: 'Propio', comprado: 'Comprado', licencia: 'Licencia', linea: 'Suministro', negro: 'Pirata' };
    h += '<h3>Catálogo</h3><div class="col">' + s.cat.slice().sort(function (x, y) { return ST.valorTitulo(y) - ST.valorTitulo(x); }).slice(0, 40).map(function (x) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.nom) + '</b><span class="tenue chico">' + nom[x.tipo] + (x.modo ? ' · ' + x.modo : '') + (x.hasta ? ' · hasta ' + esc(U.fechaCorta(x.hasta)) : '') + ' · atractivo ' + ST.valorTitulo(x) + '</span></div>' +
        (x.hasta && x.tipo === 'licencia' ? btn('Extender · ' + dinero(ST.costoExtension(x)), 'tvExtender', x.id) : '') + btn('Retirar', 'tvRetirar', x.id) + '</div>';
    }).join('') + '</div>';
    const propias = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && !s.cat.some(function (x) { return x.o === o.id; }); }).slice(-8);
    if (propias.length) h += '<div class="fila">' + sel('tvPropia', propias.map(function (o) { return [o.id, o.tit]; }), st.propia || propias[0].id) + btn('Agregar obra tuya', 'tvAgregar') + '</div>';
    h += '<h3>Licencias disponibles</h3><p class="nota info">Puedes ofrecer menos: aceptan, contraofertan o se retiran.</p><div class="col">' + (s.ofLic.length ? s.ofLic.map(function (x, i) {
      return '<div class="tarjeta"><b>' + esc(x.nom) + '</b> <span class="tenue chico">' + esc(nomEst(x.est)) + '</span><div class="fila">' + ST.MODOS.map(function (mo) { return btn(mo.nombre + ' · ' + dinero(x.p * mo.k), 'tvLic', i + '|' + mo.id); }).join('') + '</div>' +
        '<div class="fila"><input type="number" id="tvOferta' + i + '" placeholder="Tu oferta (temporal)">' + btn('Ofrecer', 'tvOfrecer', i) + '</div></div>';
    }).join('') : '<p class="tenue">Sin ofertas este mes.</p>') + '</div>';
    h += '<h3>Líneas de suministro</h3><div class="col">' + ST.PROVEEDORES.map(function (p) {
      const l = s.lineas.filter(function (x) { return x.id === p.id; })[0];
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(p.nom) + '</b><span class="tenue chico">' + p.n + ' títulos al mes · ' + dinero(ST.cuotaLinea(p)) + '/mes' + (l ? ' · hasta ' + esc(U.fechaCorta(l.hasta)) : '') + '</span></div>' + (l ? '' : btn('Contratar un año', 'tvLinea', p.id)) + '</div>';
    }).join('') + '</div>';
    h += '<h3>Mercado negro</h3><p class="nota info">Tres títulos atractivos y baratos. Si llega la demanda: multa, menos prestigio y te los quitan.</p>' + btn('Comprar lote · ' + dinero(ST.costoNegro()), 'tvNegro', '', 'mal');
    return h;
  }
  ac('tvLanzar', function () { avisar(ST.lanzar(document.getElementById('tvNomStream').value), '¡Tu plataforma está en línea!'); U.refrescar(); });
  ac('tvPrecio', function (v, el) { ST.ponerPrecio(+el.getAttribute('data-v'), v); });
  ac('tvBoveda', function () { avisar(ST.comprarBoveda(), 'Bóveda construida'); U.refrescar(); });
  ac('tvExtender', function (v) { avisar(ST.extender(v), 'Contrato extendido un año'); U.refrescar(); });
  ac('tvRetirar', function (v) { ST.retirar(v); U.refrescar(); });
  ac('tvPropia', function (v) { st.propia = +v; });
  ac('tvAgregar', function () { const s = N.S.stream, p = N.S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && !s.cat.some(function (x) { return x.o === o.id; }); }).slice(-8); avisar(ST.agregar(st.propia || (p[0] && p[0].id), 'propio'), 'Agregada al catálogo'); st.propia = null; U.refrescar(); });
  ac('tvLic', function (v) { const p = v.split('|'); avisar(ST.licenciar(+p[0], p[1]), 'Licencia firmada'); U.refrescar(); });
  ac('tvOfrecer', function (v) { const el = document.getElementById('tvOferta' + v); avisar(ST.licenciar(+v, 'temporal', +(el && el.value) || 0), 'Aceptaron tu oferta'); U.refrescar(); });
  ac('tvLinea', function (v) { avisar(ST.contratarLinea(v), 'Línea contratada'); U.refrescar(); });
  ac('tvNegro', function () { avisar(ST.comprarNegro(), 'Lote pirata en tu catálogo'); U.refrescar(); });

  return { franquicias: franquicias, fichaFranquicia: fichaFranquicia, adquisicion: adquisicion, nuevaSerie: nuevaSerie, bannerCrear: bannerCrear, pilotos: pilotos,
    bloqueObra: bloqueObra, canal: canal, streaming: streaming };
})();
