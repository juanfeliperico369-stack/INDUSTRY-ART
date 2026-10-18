/* ==== módulo: prensa_ui ==== */
// V22 · Pantallas de premios (vitrina, galas, archivo), festivales (crónica, rumores, inscripción, subasta),
// revista, radar de redes, filmografía, panel, cronología y biografía del estudio; en la ficha de la obra, la
// crítica con sus etiquetas e insignias, campañas y festivales; convención en vivo, proyección para la prensa y
// ceremonias con sobre.
IA.prensaUI = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, O = IA.obras, U = IA.ui, PM = IA.premios, CR = IA.critica, PR = IA.prensa, esc = N.esc;
  const dinero = U.dinero, ac = U.accion, t = IA.t;
  function kpi(n, v, c) { return '<div class="kpi"><span>' + esc(n) + '</span><b class="cifra ' + (c || '') + '">' + esc(v) + '</b></div>'; }
  function chip(txt, a, v, on) { return '<button class="chip' + (on ? ' on' : '') + '" data-a="' + a + '" data-v="' + esc(v) + '">' + esc(txt) + '</button>'; }
  function nomEst(i) { return i >= 0 && N.S.estudios[i] ? N.S.estudios[i].nombre : 'Otras productoras'; }
  const st = { fFiltro: 'todos', filQ: '', filOrden: 'fecha' };

  // ---------- Premios: vitrina, próximas galas y archivo ----------
  function premios() {
    const S = N.S, anio = N.anio();
    let h = '<p class="nota">Cada premiación mira las obras del año anterior. Compiten las obras reales de todos los estudios.</p><h3>Vitrina</h3><div class="col">';
    PM.GALAS.forEach(function (g) {
      if (anio < g.desde) return;
      const tg = (anio - S.y0) * 52 + g.sem - 1, falta = tg >= S.t ? tg - S.t : tg + 52 - S.t;
      const ganados = (S.galas || []).filter(function (r) { return r.gala === g.id; }).reduce(function (a, r) { return a + r.categorias.filter(function (c) { return c.ganador.est === 0; }).length; }, 0);
      const cats = PM.categoriasDe(g, anio).map(function (c) {
        const tiene = (S.galas || []).some(function (r) { return r.gala === g.id && r.categorias.some(function (x) { return x.id === c.id && x.ganador.est === 0; }); });
        return '<span class="etiqueta' + (tiene ? ' oro' : '') + '" title="' + esc(c.nombre) + '">' + (tiene ? '★ ' : '☆ ') + esc(c.nombre) + '</span>';
      }).join(' ');
      h += '<div class="tarjeta"><div class="fila entre"><b>' + esc(PM.nombreGala(g)) + '</b><span class="etiqueta">gala en ' + falta + ' sem.</span></div><p class="chico">' + cats + '</p><span class="tenue chico">Ganaste ' + ganados + '</span></div>';
    });
    h += '</div>';
    // Campañas de premios para tus obras del año pasado
    const mias = S.obras.filter(function (o) { return o.est === 0 && o.anio === anio - 1 && o.crit; });
    if (mias.length) h += '<h3>Campañas de premios</h3><p class="nota">+4 en la votación de esa gala · ' + dinero(PM.costoCampania()) + ' cada una.</p>' + mias.map(function (o) {
      const l = (S.campanias || {})[o.id] || [];
      return '<div class="tarjeta"><b>' + esc(o.tit) + '</b><div class="chips">' + PM.GALAS.filter(function (g) { return anio >= g.desde && g.id !== 'bastard'; }).map(function (g) { return chip((l.indexOf(g.id) >= 0 ? '✓ ' : '') + PM.nombreGala(g), 'prCampania', o.id + ':' + g.id, l.indexOf(g.id) >= 0); }).join('') + '</div></div>';
    }).join('');
    h += '<h3>Archivo</h3>' + ((S.galas || []).slice(-12).reverse().map(function (r) {
      return '<div class="tarjeta"><b>' + esc(r.nombre) + ' · obras de ' + r.anio + '</b>' + r.categorias.map(function (c) {
        return '<div class="chico ' + (c.ganador.est === 0 ? 'oro' : '') + '">' + esc(c.nombre) + ': «' + esc(c.ganador.titulo) + '»' + (c.ganador.quien ? ' · ' + esc(c.ganador.quien) : '') + ' · ' + esc(nomEst(c.ganador.est)) + '</div>';
      }).join('') + '</div>';
    }).join('') || '<p class="tenue">Todavía no hay galas.</p>');
    return h;
  }
  ac('prCampania', function (v) { const p = v.split(':'); const e = PM.campania(+p[0], p[1]); U.aviso(e || 'Campaña en marcha', e ? 'mal' : ''); U.refrescar(); });

  // ---------- Festivales: crónica, rumores, inscripción y subasta ----------
  function festivales() {
    const S = N.S, anio = N.anio();
    const lista = PM.festivalesAnio(anio).filter(function (f) { return st.fFiltro === 'todos' || (st.fFiltro === 'mayor' ? f.prestigio === 3 : f.prestigio < 3); }).sort(function (a, b) { return a.sem - b.sem; });
    let h = '<p class="nota">Inscribir una obra bloquea su estreno hasta que termine el festival. La selección oficial sale una semana antes; después hay subasta de derechos.</p><div class="chips">' +
      chip('Todos', 'prFFiltro', 'todos', st.fFiltro === 'todos') + chip('Circuito mayor', 'prFFiltro', 'mayor', st.fFiltro === 'mayor') + chip('Independientes', 'prFFiltro', 'indep', st.fFiltro === 'indep') + '</div>';
    const inv = PM.invitaciones();
    if (inv.length) h += '<div class="tarjeta"><b>Invitaciones</b>' + inv.map(function (x) { return '<div class="chico">' + esc(x.f.nombre) + ' invita a «' + esc(x.o.tit) + '» · responde antes de ' + esc(U.fechaCorta(x.limite)) + '</div>'; }).join('') + '</div>';
    const listas = O.delEstudio(0, ['lista']).filter(function (o) { return !o.prog && !o.fest; });
    lista.forEach(function (f) {
      const e = PM.estado(f.id), tf = PM.tFest(f);
      h += '<div class="tarjeta"><div class="fila entre"><b>' + esc(f.nombre) + '</b><span class="etiqueta' + (f.prestigio === 3 ? ' oro' : '') + '">' + ['', 'independiente', 'intermedio', 'circuito mayor'][f.prestigio] + '</span></div>' +
        '<span class="chico">' + esc(IA.cal.texto(IA.cal.inicioDeT(tf))) + ' · convocatoria ' + f.conv + ' · inscripción ' + dinero(PM.costoInscripcion(f)) + ' · jurado: ' + f.jurado + ' · prefiere ' + f.gen.map(function (g) { return D.familia(g).nombre.toLowerCase(); }).join(' y ') + ' · premio: ' + esc(f.premio) + '</span>' +
        '<p class="chico tenue">Rumor del circuito: este año el jurado busca ' + esc(D.familia(PM.rumor(f, anio)).nombre.toLowerCase()) + '.</p>';
      if (e.fase === 'convocatoria' && S.t <= tf - 3) h += listas.length ? '<div class="chips">' + listas.map(function (o) { return chip('Inscribir «' + o.tit + '»', 'prPostular', f.id + ':' + o.id); }).join('') + '</div>' : '<span class="tenue chico">No tienes obras listas sin fecha.</span>';
      if (e.sel) h += '<p class="chico"><b>Selección oficial:</b> ' + e.sel.map(function (x) { return '<span class="' + (x.est === 0 ? 'oro' : '') + '">«' + esc(x.tit) + '»</span>'; }).join(', ') + '</p>';
      if (e.gan) h += '<p class="chico"><b>Ganadores:</b> ' + Object.keys(e.gan).map(function (k) { const g = e.gan[k]; return esc(g.nombre) + ': <span class="' + (g.est === 0 ? 'oro' : '') + '">«' + esc(g.tit) + '»</span>'; }).join(' · ') + '</p>';
      if (e.fase === 'ganadores' && e.lotes && e.lotes.length) h += '<p class="chico"><b>Subasta</b> (cierra ' + esc(U.fechaCorta(e.finSub)) + ', puja automática hasta tu máximo):</p>' + e.lotes.map(function (l) {
        return '<div class="fila envolver chico" style="gap:6px">«' + esc(l.tit) + '» · crítica ' + l.crit + ' · base ' + dinero(l.base) + (l.max ? ' · tu máximo ' + dinero(l.max) : '') + '<button class="chip" data-a="prPujar" data-v="' + f.id + ':' + l.id + ':' + Math.round(l.base * 1.5) + '">Pujar hasta ' + dinero(l.base * 1.5) + '</button><button class="chip" data-a="prPujar" data-v="' + f.id + ':' + l.id + ':' + Math.round(l.base * 2.2) + '">Hasta ' + dinero(l.base * 2.2) + '</button></div>';
      }).join('');
      h += '</div>';
    });
    return h || '<p class="tenue">No hay festivales este año.</p>';
  }
  ac('prFFiltro', function (v) { st.fFiltro = v; U.refrescar(); });
  ac('prPostular', function (v) { const p = v.split(':'); const e = PM.postular(p[0], +p[1]); U.aviso(e || 'Inscrita', e ? 'mal' : ''); U.refrescar(); });
  ac('prPujar', function (v) { const p = v.split(':'); const e = PM.pujar(p[0], +p[1], +p[2]); U.aviso(e || 'Puja registrada', e ? 'mal' : ''); U.refrescar(); });

  // ---------- Revista y radar ----------
  function revista() {
    const S = N.S, r = S.revista || [];
    let h = (S.cartas || []).length ? '<div class="tarjeta"><h3>Cartas de fans</h3>' + S.cartas.slice(0, 4).map(function (c) { return '<p class="chico">' + esc(c.txt) + '</p>'; }).join('') + '</div>' : '';
    if (!r.length) return h + '<p class="tenue">El primer número sale a fin de mes.</p>';
    return h + r.slice(0, 6).map(function (x) {
      return '<div class="tarjeta"><h3>Número ' + x.n + ' · ' + esc(U.fechaCorta(x.t)) + '</h3><b>Boletín</b>' + (x.boletin.length ? x.boletin.map(function (b, i) { return '<div class="chico ' + (b.mio ? 'oro' : '') + '">' + (i + 1) + '. «' + esc(b.tit) + '» · ' + esc(b.est) + ' · ' + dinero(b.bruto) + '</div>'; }).join('') : '<p class="chico tenue">Mes sin estrenos.</p>') +
        (x.critica ? '<b>Rincón de la crítica</b><p class="chico">La mejor: «' + esc(x.critica.mejor.tit) + '» (' + x.critica.mejor.n + ')' + (x.critica.peor ? ' · la peor: «' + esc(x.critica.peor.tit) + '» (' + x.critica.peor.n + ')' : '') + '</p>' : '') +
        '<b>Editorial</b><p class="chico">' + esc(x.editorial) + '</p></div>';
    }).join('');
  }
  function redes() {
    const r = PR.radar();
    return '<p class="nota">' + esc(r.medio) + '</p>' + r.items.map(function (x) { return '<div class="tarjeta chico"><span class="etiqueta">' + esc(x.tipo) + '</span> ' + esc(x.txt) + '</div>'; }).join('');
  }

  // ---------- Filmografía, panel, cronología y biografía ----------
  function filmografia() {
    const S = N.S, q = st.filQ.toLowerCase();
    const l = S.obras.filter(function (o) { return o.est === 0 && (o.et === 'terminada' || o.et === 'cartelera') && (!q || o.tit.toLowerCase().indexOf(q) >= 0); });
    const k = { fecha: function (o) { return o.fe; }, critica: function (o) { return o.crit; }, ingresos: function (o) { return O.ingresosTotales(o); }, titulo: function (o) { return o.tit; } }[st.filOrden];
    l.sort(function (a, b) { const x = k(a), y = k(b); return typeof x === 'string' ? x.localeCompare(y, 'es') : y - x; });
    return '<div class="fila envolver"><input type="search" placeholder="Buscar título" value="' + esc(st.filQ) + '" data-c="prFilQ" style="flex:1"></div><div class="chips">' +
      [['fecha', 'Recientes'], ['critica', 'Crítica'], ['ingresos', 'Ingresos'], ['titulo', 'Título']].map(function (x) { return chip(x[1], 'prFilOrden', x[0], st.filOrden === x[0]); }).join('') + '</div>' +
      '<table class="tabla"><tr><th>Obra</th><th class="n">Crít.</th><th class="n">Ingresos</th></tr>' + l.slice(0, 150).map(function (o) {
        const et = CR.recepcion(o), pr = CR.prestigio(o);
        return '<tr data-a="verObra" data-v="' + o.id + '" style="cursor:pointer"><td><b>' + esc(o.tit) + '</b><br><span class="tenue chico">' + o.anio + (et ? ' · ' + CR.ETIQUETAS[et] : '') + (pr ? ' · ' + CR.ETIQUETAS[pr] : '') + '</span></td><td class="n">' + o.crit + '</td><td class="n">' + dinero(O.ingresosTotales(o), o.anio) + '</td></tr>';
      }).join('') + '</table>';
  }
  ac('prFilQ', function (v) { st.filQ = v; U.refrescar(); });
  ac('prFilOrden', function (v) { st.filOrden = v; U.refrescar(); });
  function panel() {
    const S = N.S, est = S.estudios[0], mias = S.obras.filter(function (o) { return o.est === 0 && o.bruto; });
    const total = mias.reduce(function (a, o) { return a + U_hoy(o.bruto, o.anio); }, 0);
    const b = CR.biografia();
    let h = '<div class="kpis">' + kpi('Taquilla de toda la vida (hoy)', U.dinero(total, 2025)) + kpi('Obras', mias.length) + kpi('Fans', U.grande(S.fans || 0)) + kpi('Prestigio', Math.round(est.fama * 100)) + '</div>';
    if (b) h += '<div class="tarjeta"><h3>Biografía pública</h3><p class="chico">Mejor obra: «' + esc(b.mejor.tit) + '» · más taquillera: «' + esc(b.taquillera.tit) + '» · más cara: «' + esc(b.cara.tit) + '»' +
      (b.clasico ? ' · mayor clásico: «' + esc(b.clasico.tit) + '»' : '') + ' · obras de culto: ' + b.culto + ' · especialidad: ' + esc(b.genero) + ' · perfil ' + esc(b.perfil) + ' · clase ' + esc(b.clase) + '</p>' +
      '<label class="campo"><span>Mascota del estudio</span><input type="text" maxlength="30" value="' + esc(b.mascota) + '" data-c="prMascota" placeholder="Por ejemplo: un búho con boina"></label></div>';
    // V34: obras por medio (cine, TV y los otros cuatro medios)
    const todas = S.obras.filter(function (o) { return o.est === 0; });
    const porMedio = [['Cine', todas.filter(function (o) { return !o.tv && (o.med || 'cine') === 'cine'; }).length], ['Televisión', todas.filter(function (o) { return o.tv || o.med === 'tv'; }).length]]
      .concat(['musica', 'juegos', 'teatro', 'libros'].map(function (m) { return [IA.medios.MED[m].nombre, IA.medios.proyectos(m).length]; }));
    if (porMedio.some(function (x) { return x[1] > 0; })) {
      const gm = U.grafica('panelMedios', function (cv) { IA.arte.anillo(cv, porMedio.map(function (x) { return { nombre: x[0], valor: x[1] }; }), { centro: porMedio.reduce(function (a, x) { return a + x[1]; }, 0) }); });
      h += '<h3>Obras por medio</h3><canvas class="lienzo" style="height:170px" data-grafica="' + gm + '"></canvas>';
    }
    if (S.fin.hist.length) {
      const hist = S.fin.hist.slice(-40);
      const g = U.grafica('panelIng', function (cv) { IA.arte.linea(cv, [{ nombre: 'Ingresos (hoy)', color: getComputedStyle(document.documentElement).getPropertyValue('--acento').trim(), valores: hist.map(function (x) { return IA.mundo.aHoy(x.ing, x.anio); }) }], hist.map(function (x) { return String(x.anio); }), { formato: function (v) { return U.dinero(v, 2025); } }); });
      h += '<h3>Trayectoria de ingresos</h3><canvas class="lienzo" data-grafica="' + g + '"></canvas>';
    }
    h += '<h3>Cronología del estudio</h3>' + ((S.hitos || []).slice().reverse().slice(0, 40).map(function (x) { return '<div class="cal-ev"><span class="ic">◆</span><div class="col crece"><span>' + esc(x.txt) + '</span><span class="tenue chico">' + x.anio + ' · prestigio ' + x.fama + '</span></div></div>'; }).join('') || '<p class="tenue">Tu historia empieza con tu primer estreno.</p>');
    return h;
  }
  function U_hoy(v, a) { return IA.mundo.aHoy(v || 0, a || N.anio()); }
  ac('prMascota', function (v) { N.S.estudios[0].mascota = String(v).slice(0, 30); });

  // ---------- Ficha de la obra: crítica, etiquetas, premios ----------
  function bloqueObra(o) {
    let h = '';
    const et = CR.recepcion(o), pr = CR.prestigio(o), ins = o.crit ? CR.insignias(o) : [];
    if (et || pr || ins.length) h += '<p>' + [et, pr].filter(Boolean).map(function (x) { return '<span class="etiqueta ' + (x === 'podrida' || x === 'olvidado' ? 'mal' : 'oro') + '">' + CR.ETIQUETAS[x] + '</span>'; }).join(' ') + ' ' + ins.map(function (x) { return '<span class="etiqueta">' + esc(x) + '</span>'; }).join(' ') + '</p>';
    if (o.res) h += '<h3>La crítica</h3>' + o.res.map(function (r, i) {
      const c = CR.critico(r.c);
      return '<div class="cal-ev"><b class="cifra ' + (r.n >= 70 ? 'bien' : r.n < 50 ? 'mal' : '') + '">' + r.n + '</b><div class="col crece"><span>«' + esc(r.f) + '»</span><span class="tenue chico">' + esc(c ? c.nombre : '') + ' · ' + esc(r.m) + '</span></div>' + (o.et === 'cartelera' && !o.cita && r.n >= 70 ? '<button class="btn" data-a="prCitar" data-v="' + o.id + ':' + i + '">Citar</button>' : '') + '</div>';
    }).join('') + (o.cita ? '<p class="nota">Citas en tu campaña: «' + esc(o.cita) + '»</p>' : '');
    if ((o.galas || []).length) h += '<p class="oro chico">' + o.galas.map(function (g) { return esc(PM.nombrePremio(g)); }).join(' · ') + '</p>';
    if (o.fest) h += '<p class="nota">Inscrita en ' + esc((PM.festival(o.fest.id) || {}).nombre || o.fest.id) + ': no puede estrenarse hasta ' + esc(U.fechaCorta(o.fest.hasta)) + '.</p>';
    if (o.est === 0 && o.et !== 'terminada' && !o.portada) h += '<button class="btn" data-a="prPortada" data-v="' + o.id + '">Portada en la revista · ' + dinero(PR.costoPortada()) + '</button>';
    return h;
  }
  ac('prCitar', function (v) { const p = v.split(':'); const e = CR.citar(+p[0], +p[1]); U.aviso(e || 'Cita en la campaña', e ? 'mal' : ''); U.refrescarFicha(IA.pantallas.fichaObra(+p[0])); });
  ac('prPortada', function (v) { const e = PR.portada(+v); U.aviso(e || 'Portada lista', e ? 'mal' : ''); U.refrescarFicha(IA.pantallas.fichaObra(+v)); });

  // ---------- Convención en vivo, proyección y ceremonias ----------
  function banner() {
    const c = PR.convencionActual(), S = N.S;
    const rg = IA.cal.rangoSemana(N.anio(), N.semana());
    const ev = IA.cal.circuitoAnio(N.anio()).filter(function (x) { return x.tipo !== 'expo' && x.ini <= rg[1] && x.fin >= rg[0]; })[0];
    if (!c && !ev) return '';
    const st0 = c ? PR.estado() : null;
    return '<div class="tarjeta" style="border-color:var(--dorado)"><b>En vivo esta semana: ' + esc((c || ev).nombre) + '</b>' + (c && PR.elegibles().length ? '<p class="chico">Te quedan ' + (3 - st0.usadas) + ' acciones.</p><button class="btn primario" data-a="prConvencion">Ir a la convención</button>' : '') + (!c ? '<button class="btn" data-a="sub" data-s="mundo" data-v="festivales">Ver</button>' : '') + '</div>';
    void S;
  }
  ac('prConvencion', function () {
    const c = PR.convencionActual(), s = PR.estado();
    if (!c) return;
    U.modal('<h2>' + esc(c.nombre) + '</h2><p class="nota">Tres acciones por convención. Solo obras en desarrollo, en cartelera o estrenadas hace menos de 12 meses. Cada sala es de una familia de géneros.</p><p>Acciones restantes: ' + (3 - s.usadas) + '</p>' + PR.elegibles().slice(0, 6).map(function (o) {
      return '<div class="tarjeta"><b>' + esc(o.tit) + '</b> <span class="tenue chico">sala de ' + esc(D.familia(o.fam || 'DR').nombre.toLowerCase()) + ' · ánimo de los fans ' + PR.animo(o) + '</span><div class="chips">' +
        PR.ACCIONES.filter(function (a) { return a.id !== 'rueda'; }).map(function (a) { return chip(a.nombre, 'prAccion', o.id + ':' + a.id); }).join('') +
        PR.PROMESAS.map(function (p) { return chip('Rueda: ' + p.t, 'prAccion', o.id + ':rueda:' + p.id); }).join('') + '</div></div>';
    }).join('') + '<button class="btn bloque" data-a="cerrarModal">' + t('cerrar') + '</button>');
  });
  ac('prAccion', function (v) { const p = v.split(':'); const e = PR.actuar(+p[0], p[1], p[2]); U.aviso(e || 'Hecho', e ? 'mal' : ''); if (!e) U.acciones.prConvencion(); });
  // Proyección para la prensa: las reseñas salen una a una
  function proyeccion() {
    const S = N.S, o = S.proyeccion ? O.porId(S.proyeccion) : null;
    delete S.proyeccion;
    if (!o || !o.res) return false;
    let i = 0;
    const paso = function () {
      const r = o.res[i], c = CR.critico(r.c);
      U.modal('<h2>Proyección para la prensa</h2><p class="tenue">«' + esc(o.tit) + '» · reseña ' + (i + 1) + ' de ' + o.res.length + '</p><p><b>' + esc(c.nombre) + '</b> (' + esc(r.m) + ')</p><p class="cifra" style="font-size:32px">' + r.n + '</p><p>«' + esc(r.f) + '»</p>' +
        '<button class="btn primario bloque" data-a="prSigRes">' + (i + 1 < o.res.length ? 'Siguiente reseña' : t('aceptar')) + '</button>');
    };
    ac('prSigRes', function () { i++; if (i < o.res.length) paso(); else U.cerrarModal(); });
    paso();
    return true;
  }
  // Ceremonia con sobre: categoría por categoría
  function ceremonia(res) {
    let i = 0;
    const paso = function (abierto) {
      const c = res.categorias[i];
      U.modal('<h2>' + esc(res.nombre) + '</h2><p class="tenue">' + esc(c.nombre) + ' · ' + (i + 1) + ' de ' + res.categorias.length + '</p><p class="chico">Nominados: ' + c.nominados.map(function (n) { return '«' + esc(n.titulo) + '»'; }).join(', ') + '</p>' +
        (abierto ? '<p class="' + (c.ganador.est === 0 ? 'oro' : '') + '"><b>«' + esc(c.ganador.titulo) + '»</b>' + (c.ganador.quien ? ' · ' + esc(c.ganador.quien) : '') + ' · ' + esc(nomEst(c.ganador.est)) + '</p>' + (c.ganador.est === 0 ? '<p class="nota">«' + esc(IA.ideas.frasePremio(O.porId(c.ganador.obra) || {})) + ' Gracias a todo el equipo.»</p>' : '') +
          '<button class="btn primario bloque" data-a="prCerSig">' + (i + 1 < res.categorias.length ? 'Siguiente' : t('aceptar')) + '</button>' : '<button class="btn primario bloque" data-a="prCerAbrir">Abrir el sobre</button>'));
    };
    ac('prCerAbrir', function () { paso(true); if (res.categorias[i].ganador.est === 0) IA.arte.sonido('premio'); });
    ac('prCerSig', function () { i++; if (i < res.categorias.length) paso(false); else U.cerrarModal(); });
    paso(false);
  }
  return { premios: premios, festivales: festivales, revista: revista, redes: redes, filmografia: filmografia, panel: panel, bloqueObra: bloqueObra, banner: banner, proyeccion: proyeccion, ceremonia: ceremonia };
})();
