/* ==== módulo: medios_ui ==== */
// Pantallas de música, videojuegos, teatro y libros: lista de proyectos con su portada dibujada, creación
// (tipo, género, tamaño, equipo y opciones del medio), ficha con ventas por formato, certificaciones, jugadores,
// ocupación o copias y sus acciones (gira, DLC, soporte, paquete, traducción, grabar), bandas y solistas,
// plataformas con su cuota y kits, motores propios y licenciados, y los premios de cada medio.
ART.mediosUI = (function () {
  'use strict';
  const N = ART.n, U = ART.ui, Md = ART.medios, T = ART.talentos, esc = N.esc;
  const dinero = U.dinero, ac = U.accion;
  const st = { b: null, banda: [], motorFun: {} };
  const PALETA = ['#c0392b', '#1b2a4a', '#d4a017', '#1e6b3a', '#6c3483', '#e67e22', '#111111', '#f4f1ea', '#1abc9c', '#e84393'];
  function kpi(n, v, c) { return '<div class="kpi"><span>' + esc(n) + '</span><b class="cifra ' + (c || '') + '">' + esc(v) + '</b></div>'; }
  function btn(txt, a, v, cl, dis) { return '<button class="btn ' + (cl || '') + '" data-a="' + a + '" data-v="' + esc(v === undefined ? '' : v) + '"' + (dis ? ' disabled title="' + esc(dis) + '"' : '') + '>' + esc(txt) + '</button>'; }
  function sel(c, ops, val, dv) { return '<select data-c="' + c + '"' + (dv !== undefined ? ' data-v="' + esc(dv) + '"' : '') + '>' + ops.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function avisar(e, ok) { U.aviso(e || ok, e ? 'mal' : ''); }
  function grande(x) { return U.grande(Math.round(x || 0)); }
  // ---------- Portadas dibujadas ----------
  function dibujar() {
    setTimeout(function () {
      document.querySelectorAll('canvas[data-port]').forEach(function (cv) {
        const id = cv.getAttribute('data-port'), p = id === 'b' ? st.b : Md.porId(id);
        if (!p || !cv.getContext) return;
        const po = Md.portada(p.port ? p : Object.assign({ port: N.hash(p.tit || 'x') % 100000 }, p)), w = cv.width = 120, h = cv.height = p.med === 'teatro' || p.med === 'libros' ? 170 : 120;
        const c = cv.getContext('2d');
        c.fillStyle = PALETA[po.c1]; c.fillRect(0, 0, w, h);
        c.fillStyle = PALETA[po.c2]; c.globalAlpha = 0.85;
        const s = p.port || 7;
        if (po.forma === 0) { c.beginPath(); c.arc(w / 2, h * 0.45, w * 0.3, 0, Math.PI * 2); c.fill(); }
        else if (po.forma === 1) { for (let i = 0; i < 6; i++) c.fillRect(0, h * (0.1 + i * 0.12), w * ((s >> i) % 3 + 1) / 3, h * 0.05); }
        else if (po.forma === 2) { c.beginPath(); c.moveTo(w / 2, h * 0.12); c.lineTo(w * 0.85, h * 0.75); c.lineTo(w * 0.15, h * 0.75); c.closePath(); c.fill(); }
        else if (po.forma === 3) { for (let i = 0; i < 9; i++) { c.fillRect((i % 3) * w / 3 + 6, Math.floor(i / 3) * h / 4 + 10, w / 3 - 12, h / 4 - 12); c.globalAlpha = 0.3 + ((s >> i) & 1) * 0.5; } }
        else { c.lineWidth = 6; c.strokeStyle = PALETA[po.c2]; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(w / 2, h / 2, 12 + i * 12, 0, Math.PI * 2); c.stroke(); } }
        c.globalAlpha = 1; c.fillStyle = po.c1 === 7 ? '#111' : '#fff'; c.font = 'bold 12px sans-serif'; c.textAlign = 'center';
        const tit = (p.tit || '').toUpperCase(), pal = tit.split(' ');
        let linea = '', y = h - 26;
        const lineas = [];
        pal.forEach(function (x) { if ((linea + ' ' + x).trim().length > 14) { lineas.push(linea); linea = x; } else linea = (linea + ' ' + x).trim(); });
        lineas.push(linea);
        lineas.slice(-2).forEach(function (l, i, a) { c.fillText(l, w / 2, y - (a.length - 1 - i) * 14); });
      });
    }, 0);
  }
  function caja(p, grandeT) { return '<canvas data-port="' + (p.id || 'b') + '" style="width:' + (grandeT ? 120 : 56) + 'px;border-radius:4px;flex:none"></canvas>'; }
  // ---------- Pestaña de un medio ----------
  function medio(med) {
    const S = N.S, m = Md.MED[med], a = N.anio();
    if (!Md.disponible(med)) return '<p class="nota">' + esc(m.nombre) + ' llega en ' + m.desde + '.</p>';
    const ps = Md.proyectos(med).slice().reverse(), res = Md.resumen().filter(function (x) { return x.med === med; })[0];
    let h = '<div class="kpis">' + kpi('Proyectos', ps.length) + kpi('En marcha', res.enMarcha + ' / ' + Md.capacidad(med)) + kpi('Ingresos del año', dinero(res.ing), 'bien') + kpi('Cuota del mercado', U.pct(Md.cuotaMercado(med))) + kpi(m.premio, res.premios) + '</div>';
    h += btn('Nuevo proyecto de ' + m.nombre.toLowerCase(), 'mdNuevo', med, 'primario bloque');
    if (med === 'teatro') h += teatrosUI();
    if (med === 'musica') h += listaExitos() + bandasUI();
    if (med === 'juegos') h += juegosUI();
    if (med === 'libros') h += '<p class="nota">' + (ART.imperio.tiene('imprenta') ? 'Tienes imprenta propia: imprimir cuesta 30 % menos.' : 'Con una imprenta propia (Negocio › Construcciones) imprimir cuesta 30 % menos.') + ' Puedes hacer cómics o mangas de tus franquicias.</p>';
    h += '<h3>Tus proyectos</h3><div class="col">' + (ps.length ? ps.slice(0, 40).map(function (p) {
      const est = p.et === 'produccion' || p.et === 'ensayo' ? (p.et === 'ensayo' ? 'Ensayo' : 'Producción') + ': faltan ' + p.sr + ' sem.' : p.et === 'temporada' ? 'En temporada · ' + Math.round(p.ocup * 100) + ' % de ocupación' : (p.et === 'lanzado' ? 'A la venta' : 'Catálogo') + ' · público ' + p.pub;
      return '<div class="tarjeta fila" data-a="mdVer" data-v="' + p.id + '" style="cursor:pointer">' + caja(p) + '<div class="col crece"><b>' + esc(p.tit) + (p.cert ? ' <span class="etiqueta oro">' + esc(Md.CERT.filter(function (c) { return c.id === p.cert; })[0].nombre) + '</span>' : '') + (p.prem ? ' <span class="etiqueta oro">★' + p.prem + '</span>' : '') + '</b><span class="tenue chico">' + esc(tipoNom(p)) + ' · ' + esc(p.gen) + '</span><span class="chico">' + esc(est) + ' · ingresos ' + dinero(p.ing) + '</span></div></div>';
    }).join('') : '<p class="tenue">Aún no tienes proyectos.</p>') + '</div>';
    const pr = Md.premios(med).slice(-6).reverse();
    h += '<h3>' + esc(m.premio) + '</h3>' + (a < m.premioDesde ? '<p class="tenue chico">Empiezan en ' + m.premioDesde + '.</p>' : pr.length ? pr.map(function (r) { return '<p class="chico"><b>' + (r.anio + 1) + '</b> · ' + r.cats.map(function (c) { return esc(c.nombre) + ': <span class="' + (c.est === 0 ? 'oro' : '') + '">«' + esc(c.tit) + '»</span>'; }).join(' · ') + '</p>'; }).join('') : '<p class="tenue chico">Todavía no hay ceremonias.</p>');
    dibujar();
    return h;
  }
  function listaExitos() {
      const l = N.S.med && N.S.med.lista;
      if (!l || !l.length) return '<p class="nota">La lista de éxitos semanal empieza en 1935.</p>';
      return '<h3>Lista de éxitos de la semana</h3><div class="md-lista">' + l.map(function (x, i) {
        const mov = !x.prev ? '<i class="nuevo">NUEVO</i>' : x.prev > i + 1 ? '<i class="sube">▲ ' + (x.prev - i - 1) + '</i>' : x.prev < i + 1 ? '<i class="baja">▼ ' + (i + 1 - x.prev) + '</i>' : '<i>=</i>';
        return '<div class="md-li' + (x.tuyo ? ' tuyo' : '') + '"><b class="md-pos">' + (i + 1) + '</b><div class="col crece"><b>' + esc(x.nom) + '</b><span class="chico tenue">' + esc(x.art) + (x.tuyo ? ' · tuyo' : '') + '</span></div>' + mov + '</div>';
      }).join('') + '</div>';
  }
  function tipoNom(p) { if (p.med === 'musica') { const t = Md.MED.musica.tipos.filter(function (x) { return x.id === p.tipo; })[0]; return t ? t.nombre : p.tipo; } return p.tipo; }
  // ---------- Música: bandas ----------
  // Teatros propios: comprar, vender y ver si están en uso o alquilados
  function teatrosUI() {
    const tuyos = Md.teatros();
    let h = '<h3>Tus teatros</h3><p class="nota info">Un teatro propio te ahorra la sala: cada función de una obra tuya de su tamaño cuesta 40 % menos. Cuando está libre, otras compañías lo alquilan y te pagan cada semana; mantenerlo cuesta 2 % de su valor al año. Al venderlo recuperas el 80 %.</p><div class="col">';
    h += tuyos.length ? tuyos.map(function (t) {
      const x = Md.TEATROS.filter(function (y) { return y.id === t.tipo; })[0];
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.nombre) + '</b><span class="tenue chico">' + x.asientos + ' butacas · ' + (Md.enUso(t) ? 'con una obra tuya en cartel' : 'libre: se alquila') + '</span></div>' + btn('Vender (' + dinero(Math.round(Md.precioTeatro(t.tipo) * 0.8)) + ')', 'mdVenderTeatro', t.id, '', Md.enUso(t) ? 'Hay una obra tuya en cartel' : '') + '</div>';
    }).join('') : '<p class="tenue">Aún no tienes teatros: tus obras pagan la sala.</p>';
    h += '</div><div class="fila envolver">' + Md.TEATROS.map(function (x) { return btn('Comprar ' + x.nombre.toLowerCase() + ' (' + x.asientos + ' butacas) · ' + dinero(Md.precioTeatro(x.id)), 'mdComprarTeatro', x.id); }).join('') + '</div>';
    return h;
  }
  ac('mdComprarTeatro', function (v) { avisar(Md.comprarTeatro(v), 'Teatro comprado'); U.refrescar(); });
  ac('mdVenderTeatro', function (v) { avisar(Md.venderTeatro(v), 'Teatro vendido'); U.refrescar(); });
  function bandasUI() {
    const bs = Md.bandas();
    let h = '<h3>Bandas y solistas</h3><div class="col">' + (bs.length ? bs.map(function (b) {
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(b.nom) + '</b><span class="tenue chico">' + (b.tipo === 'solista' ? 'Solista' : b.m.length + ' integrantes') + (b.sep ? ' · separada' : '') + '</span></div><span class="chico">Relación ' + b.rel + ' · práctica ' + b.prac + ' · fans ' + grande(b.fans) + (b.gira ? ' · de gira (' + b.gira.sem + ' sem.)' : '') + '</span>' +
        '<div class="fila">' + (b.sep ? btn('Reunirlos · ' + dinero(Math.round(ART.economia.presupuestoTipico(N.anio()) * 0.3)), 'mdReunir', b.id) : btn('Practicar', 'mdPracticar', b.id) + Md.GIRAS.map(function (g) { return btn(g.nombre + ' · ' + dinero(Md.costoGira(b, g)), 'mdGira', b.id + '|' + g.id, '', b.gira ? 'Ya están de gira' : ''); }).join('')) + '</div></div>';
    }).join('') : '<p class="tenue chico">Firma una banda o un solista para grabar discos.</p>') + '</div>';
    const cand = T.disponibles('interprete', 0).concat(T.disponibles('musica', 0)).sort(function (a, b) { return Md.habMedio(b, 'musica') - Md.habMedio(a, 'musica'); }).slice(0, 12);
    h += '<div class="tarjeta"><b>Firmar banda o solista</b><div class="col">' + cand.map(function (t) {
      return '<label class="fila"><input type="checkbox" data-c="mdBandaSel" data-v="' + t.id + '"' + (st.banda.indexOf(t.id) >= 0 ? ' checked' : '') + '><span class="crece">' + esc(t.nom) + '</span><span class="tenue chico">música ' + Md.habMedio(t, 'musica') + '</span></label>';
    }).join('') + '</div><label class="campo"><span>Nombre</span><input id="mdBandaNom" maxlength="40" placeholder="Se inventa solo"></label><div class="fila">' + btn('Firmar banda', 'mdFirmar', 'banda', 'primario') + btn('Firmar solista', 'mdFirmar', 'solista') + '</div>' +
      '<p class="tenue chico">Contrato: ' + dinero(Md.costoContrato(st.banda)) + '. La banda cobra el 15 % de las ventas.</p></div>';
    return h;
  }
  ac('mdBandaSel', function (v, el) { const id = +el.getAttribute('data-v'); st.banda = v ? st.banda.concat([id]) : st.banda.filter(function (x) { return x !== id; }); });
  ac('mdFirmar', function (v) { const nom = document.getElementById('mdBandaNom'); const e = Md.firmarBanda(nom ? nom.value : '', st.banda, v); avisar(e, 'Contrato firmado'); if (!e) st.banda = []; U.refrescar(); });
  ac('mdPracticar', function (v) { avisar(Md.practicar(v), 'Ensayaron: tocan mejor'); U.refrescar(); });
  ac('mdGira', function (v) { const p = v.split('|'); avisar(Md.irDeGira(+p[0], p[1]), '¡De gira!'); U.refrescar(); });
  ac('mdReunir', function (v) { avisar(Md.reunir(v), '¡Vuelven!'); U.refrescar(); });
  // ---------- Videojuegos: plataformas y motores ----------
  function juegosUI() {
    let h = '<h3>Plataformas</h3><div class="col">' + Md.plataformas().sort(function (a, b) { return b.cuota - a.cuota; }).map(function (p) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(p.nombre) + '</b><span class="tenue chico">Cuota ' + U.pct(p.cuota) + ' · se deja de vender en ' + p.muere + '</span></div>' + (p.kit ? '<span class="etiqueta">Kit ✔</span>' : btn('Kit · ' + dinero(p.costoKit), 'mdKit', p.id)) + '</div>';
    }).join('') + '</div>';
    h += '<h3>Motores</h3>' + Md.motores().map(function (m) { return '<p class="chico"><b>' + esc(m.nom) + '</b> ' + '★★★★★'.slice(0, m.est) + ' · ' + N.lista(m.fun.map(function (id) { const x = Md.FUNCIONES ? Md.FUNCIONES.filter(function (y) { return y.id === id; })[0] : null; return x ? x.nombre.toLowerCase().replace('2d', '2D').replace('3d', '3D').replace(' con ia', ' con IA') : id; })) + (m.de ? ' · licenciado' : ' · tuyo (los rivales te lo licencian)') + '</p>'; }).join('') +
      '<div class="tarjeta"><b>Crear motor propio</b><div class="fila">' + Md.funcionesDe().map(function (f) { return '<label class="chip"><input type="checkbox" data-c="mdMotFun" data-v="' + f.id + '"' + (st.motorFun[f.id] ? ' checked' : '') + '> ' + esc(f.nombre) + '</label>'; }).join('') + '</div>' +
      '<label class="campo"><span>Nombre</span><input id="mdMotNom" maxlength="30" placeholder="Se inventa solo"></label>' + btn('Crear · ' + dinero(Md.costoMotor(Object.keys(st.motorFun).filter(function (k) { return st.motorFun[k]; }))), 'mdMotor', '', 'primario') + '</div>' +
      Md.ofertasMotor().map(function (o, i) { return '<div class="cal-ev"><div class="col crece"><b>' + esc(o.nom) + '</b><span class="tenue chico">' + '★★★★★'.slice(0, o.est5) + ' · ' + esc((N.S.estudios[o.est] || {}).nombre || '') + '</span></div>' + btn('Licenciar · ' + dinero(o.precio), 'mdLicMot', i) + '</div>'; }).join('');
    return h;
  }
  ac('mdKit', function (v) { avisar(Md.comprarKit(v), 'Kit de desarrollo comprado'); U.refrescar(); });
  ac('mdMotFun', function (v, el) { st.motorFun[el.getAttribute('data-v')] = !!v; });
  ac('mdMotor', function () { const n = document.getElementById('mdMotNom'); const e = Md.crearMotor(n ? n.value : '', Object.keys(st.motorFun).filter(function (k) { return st.motorFun[k]; })); avisar(e, 'Motor listo'); if (!e) st.motorFun = {}; U.refrescar(); });
  ac('mdLicMot', function (v) { avisar(Md.licenciarMotor(+v), 'Motor licenciado por 3 años'); U.refrescar(); });
  // ---------- Creación ----------
  function fichaNuevo() {
    const b = st.b, a = N.anio(), m = Md.MED[b.med];
    const fams = Md.familias(b.med), gens = [];
    fams.forEach(function (f) { f.generos.forEach(function (g) { gens.push([g, g + ' · ' + f.nombre]); }); });
    let h = '<h2>Nuevo proyecto · ' + esc(m.nombre) + '</h2><div class="fila">' + caja(b, true) + '<div class="col crece"><label class="campo"><span>Título</span><input data-c="mdTit" maxlength="48" value="' + esc(b.tit) + '"></label>' +
      btn('Otro título', 'mdOtroTit') + '<p class="tenue chico">' + esc(Md.portada(Object.assign({ port: N.hash(b.tit) % 100000 }, b)).texto) + '</p></div></div>';
    h += '<label class="campo"><span>Tipo</span>' + sel('mdTipo', Md.tipos(b.med).map(function (t) { return [t.id, t.nombre]; }), b.tipo) + '</label><label class="campo"><span>Género</span>' + sel('mdGen', gens, b.gen) + '</label>';
    h += '<label class="campo"><span>Tamaño</span>' + sel('mdEsc', b.med === 'juegos' ? Md.ESCALAS_J.filter(function (e) { return !e.desde || e.desde <= a; }).map(function (e, i) { return [i, e.nombre]; }) : [[0, 'Pequeño'], [1, 'Mediano'], [2, 'Grande']], b.esc) + '</label>';
    const c = b.cfg;
    if (b.med === 'musica') {
      h += '<label class="campo"><span>Banda o solista</span>' + sel('mdCfg', [['', '— ninguna —']].concat(Md.bandas().filter(function (x) { return !x.sep; }).map(function (x) { return [x.id, x.nom]; })), c.banda || '', 'banda') + '</label>';
      if (b.tipo === 'banda') h += '<label class="campo"><span>Película</span>' + sel('mdCfg', [['', '— elige —']].concat(N.S.obras.filter(function (o) { return o.est === 0 && !o.tv; }).slice(-15).map(function (o) { return [o.id, o.tit]; })), c.peli || '', 'peli') + '</label>';
      h += '<p class="tenue chico">Formatos de hoy: ' + Md.formatosMusica(a).map(function (f) { return f.nombre + ' ' + Math.round(f.parte * 100) + ' %'; }).join(' · ') + '</p>';
      h += '<div class="fila"><label class="campo"><span>Grabación</span>' + sel('mdCfg', Md.ESTUDIOS_GRAB.map(function (x) { return [x.id, x.nombre + (x.q ? ' (calidad ' + (x.q > 0 ? '+' : '') + x.q + ')' : '')]; }), c.estudio || 'pro', 'estudio') + '</label>' +
        '<label class="campo"><span>Promoción</span>' + sel('mdCfg', Md.PROMOS_M.filter(function (x) { return x.desde <= a; }).map(function (x) { return [x.id, x.nombre + (x.f > 1 ? ' (+' + Math.round((x.f - 1) * 100) + ' % de ventas)' : '')]; }), c.promo || 'ninguna', 'promo') + '</label></div>' +
        '<div class="fila">' + (a >= 1981 ? '<label class="chip"><input type="checkbox" data-c="mdCfgB" data-v="video"' + (c.video ? ' checked' : '') + '> Video musical (+12 %, más TV y ClipNet)</label>' : '') +
        (a >= 2012 ? '<label class="chip"><input type="checkbox" data-c="mdCfgB" data-v="exclusiva"' + (c.exclusiva ? ' checked' : '') + '> Exclusiva con Sonora (adelanto del 15 %)</label>' : '') + '</div>';
      h += '<div class="md-plats">' + Md.partesMusica(a, b).map(function (x) { return '<div class="md-plat"><b>' + esc(x.nombre) + '</b><div class="tv-meta"><i style="width:' + Math.round(x.parte * 100) + '%;background:var(--acento)"></i></div><span class="chico">' + Math.round(x.parte * 100) + ' % de lo que gane</span></div>'; }).join('') + '</div>';
    }
    if (b.med === 'juegos') {
      h += '<b>Plataformas (hasta 4)</b><div class="fila">' + Md.plataformas().map(function (p) { return '<label class="chip"><input type="checkbox" data-c="mdPlat" data-v="' + p.id + '"' + (c.plats.indexOf(p.id) >= 0 ? ' checked' : '') + '> ' + esc(p.nombre) + ' ' + U.pct(p.cuota) + (p.kit ? '' : ' (sin kit)') + '</label>'; }).join('') + '</div>' +
        '<label class="campo"><span>Motor</span>' + sel('mdCfg', [['', 'Sin motor propio']].concat(Md.motores().map(function (x) { return [x.id, x.nom + ' ' + '★★★★★'.slice(0, x.est)]; })), c.motor || '', 'motor') + '</label>' +
        '<div class="fila"><label class="campo"><span>Idiomas (1–10)</span><input type="number" min="1" max="10" data-c="mdCfg" data-v="idiomas" value="' + c.idiomas + '"></label>' +
        '<label class="campo"><span>Antipiratería</span>' + sel('mdCfg', [[0, 'Ninguna'], [1, 'Básica'], [2, 'Fuerte (molesta al público)']], c.anti, 'anti') + '</label></div>' +
        '<div class="fila"><label class="campo"><span>Modelo</span>' + sel('mdCfg', Md.MODELOS.filter(function (x) { return x.desde <= a; }).map(function (x) { return [x.id, x.nombre]; }), c.modelo, 'modelo') + '</label>' +
        '<label class="campo"><span>Edición</span>' + sel('mdCfg', [[0, 'Estándar'], [1, 'Estándar y de coleccionista']], c.edicion, 'edicion') + '</label></div>';
      const dimSel = Md.de(Md.DIMENSIONES, c.dim, '2d');
      h += '<h4>Tipo de videojuego</h4><div class="md-dims">' + Md.DIMENSIONES.map(function (x) {
        const ok = x.desde <= a, g = ok ? Md.gustoDim(x.id, a) : 0;
        return '<button class="md-dim' + (c.dim === x.id ? ' on' : '') + '" data-a="mdDim" data-v="' + x.id + '"' + (ok ? '' : ' disabled') + '><b>' + ({ texto: '⌨', '2d': '▦', iso: '◇', '3d': '⬢', rv: '◉', neuro: '✺' }[x.id]) + ' ' + esc(x.nombre) + '</b><span class="chico">' + (ok ? 'Público ×' + U.decimal(g, 2) + ' · costo ×' + U.decimal(x.k, 2) : 'Llega en ' + x.desde) + '</span></button>';
      }).join('') + '</div><p class="nota info">' + esc(dimSel.texto) + '</p>';
      h += '<label class="campo"><span>Modo de juego</span>' + sel('mdCfg', Md.MODOS_J.filter(function (x) { return x.desde <= a; }).map(function (x) { return [x.id, x.nombre + (x.id === 'masivo' ? ' (servidores: 8 % de lo que gane)' : x.d ? ' (dura más en venta)' : '')]; }), c.modo || 'solo', 'modo') + '</label>';
    }
    if (b.med === 'teatro') {
      h += '<div class="fila"><label class="campo"><span>Sala</span>' + sel('mdCfg', Md.SALAS.map(function (x) { return [x.id, x.nombre + ' (' + x.asientos + ')']; }), c.sala, 'sala') + '</label><label class="campo"><span>Funciones por semana</span><input type="number" min="3" max="10" data-c="mdCfg" data-v="funciones" value="' + c.funciones + '"></label></div>' +
        '<div class="fila"><label class="campo"><span>Semanas de temporada</span><input type="number" min="4" max="52" data-c="mdCfg" data-v="semanas" value="' + c.semanas + '"></label><label class="campo"><span>Semanas de ensayo</span><input type="number" min="3" max="16" data-c="mdCfg" data-v="ensayo" value="' + c.ensayo + '"></label></div>' +
        '<label class="campo"><span>Precio de la entrada</span>' + sel('mdCfg', Md.PRECIOS_T.map(function (x) { return [x.id, x.nombre + ' · ' + dinero(ART.mundo.aEpoca(x.p, a)) + (x.ocup ? ' · ocupación ' + (x.ocup > 0 ? '+' : '') + Math.round(x.ocup * 100) + ' %' : '')]; }), c.precio || 'normal', 'precio') + '</label>';
    }
    if (b.med === 'libros') {
      h += '<div class="fila"><label class="campo"><span>Tapa</span>' + sel('mdCfg', Md.TAPAS.map(function (x) { return [x.id, x.nombre]; }), c.tapa, 'tapa') + '</label><label class="campo"><span>Tamaño</span>' + sel('mdCfg', Md.TAMANOS.map(function (x) { return [x.id, x.nombre]; }), c.tam, 'tam') + '</label></div>' +
        '<div class="fila"><label class="campo"><span>Idiomas</span><input type="number" min="1" max="12" data-c="mdCfg" data-v="trad" value="' + c.trad + '"></label>' +
        (a >= 1950 ? '<label class="chip"><input type="checkbox" data-c="mdCfgB" data-v="audio"' + (c.audio ? ' checked' : '') + '> Audiolibro</label>' : '') + (a >= 2007 ? '<label class="chip"><input type="checkbox" data-c="mdCfgB" data-v="ebook"' + (c.ebook ? ' checked' : '') + '> Libro digital</label>' : '') + '</div>' +
        '<label class="campo"><span>De una franquicia tuya</span>' + sel('mdCfg', [['', '— obra original —']].concat(ART.franquicias.lista().filter(function (f) { return f.est === 0; }).map(function (f) { return [f.id, f.nom]; })), c.fr || '', 'fr') + '</label>' +
        '<div class="fila"><label class="campo"><span>Extensión</span>' + sel('mdCfg', Md.EXTENSIONES.map(function (x) { return [x.id, x.nombre]; }), c.ext || 'novela', 'ext') + '</label><label class="campo"><span>Primera tirada</span>' + sel('mdCfg', Md.TIRADAS.map(function (x) { return [x.id, x.nombre]; }), c.tirada || 'normal', 'tirada') + '</label></div>' +
        '<label class="chip"><input type="checkbox" data-c="mdCfgB" data-v="firmas"' + (c.firmas ? ' checked' : '') + '> Gira de firmas (+8 % de ventas)</label><p class="nota info">Una tirada grande vende más si el libro gusta y deja cajas sin vender si no; la corta arriesga poco pero tarda en reimprimir.</p>';
    }
    h += '<h3>Equipo</h3><div class="col">' + b.eq.map(function (id) { const t = T.porId(id); return t ? '<div class="fila entre"><span>' + esc(t.nom) + ' <span class="tenue chico">' + esc((ART.datos.oficio(t.of) || { nombre: t.of }).nombre) + '</span></span><span class="cifra">' + Md.habMedio(t, b.med) + '</span></div>' : ''; }).join('') + '</div>' + btn('Buscar otro equipo', 'mdOtroEq');
    const err = Md.validar(b);
    h += '<div class="kpis">' + kpi('Costo', dinero(b.costo)) + kpi('Semanas', b.sem) + '</div>' + (err ? '<p class="mal chico">' + esc(err) + '</p>' : '') + btn('Empezar', 'mdIniciar', '', 'primario bloque', err) + btn('Cancelar', 'cerrarFicha', '', 'bloque');
    dibujar();
    return h;
  }
  function refrescarNuevo() { Md.recalcular(st.b); U.refrescarFicha(fichaNuevo()); }
  ac('mdNuevo', function (v) { st.b = ART.creacion.conAzarUI(function () { return Md.borrador(v); }); U.abrirFicha(fichaNuevo(), 'medio'); });
  ac('mdTit', function (v) { st.b.tit = v.slice(0, 48); });
  ac('mdOtroTit', function () { st.b.tit = ART.creacion.conAzarUI(function () { return ART.obras.tituloNuevo(['Drama']); }); refrescarNuevo(); });
  ac('mdTipo', function (v) { st.b.tipo = v; refrescarNuevo(); });
  ac('mdGen', function (v) { st.b.gen = v; });
  ac('mdEsc', function (v) { st.b.esc = +v; st.b.eq = Md.equipoRecomendado(st.b.med, st.b.esc); refrescarNuevo(); });
  ac('mdOtroEq', function () { const b = st.b; const otros = Md.equipoRecomendado(b.med, b.esc); b.eq = otros.map(function (id, i) { const alt = T.disponibles(T.porId(id).of, 0).filter(function (t) { return otros.indexOf(t.id) < 0; }); return alt.length ? N.elegir(alt.slice(0, 8)).id : id; }); refrescarNuevo(); });
  ac('mdCfg', function (v, el) { const k = el.getAttribute('data-v'); st.b.cfg[k] = ['idiomas', 'anti', 'edicion', 'funciones', 'semanas', 'ensayo', 'trad', 'banda', 'peli', 'motor', 'fr'].indexOf(k) >= 0 ? (v === '' ? null : +v) : v; if (k === 'idiomas') st.b.cfg.idiomas = N.limitar(st.b.cfg.idiomas || 1, 1, 10); refrescarNuevo(); });
  ac('mdCfgB', function (v, el) { st.b.cfg[el.getAttribute('data-v')] = v ? 1 : 0; refrescarNuevo(); });
  ac('mdDim', function (v) { st.b.cfg.dim = v; const d = Md.de(Md.DIMENSIONES, v, '2d'); if (d.plat && st.b.cfg.plats.indexOf(d.plat) < 0 && Md.plataformas().some(function (p) { return p.id === d.plat; })) st.b.cfg.plats = st.b.cfg.plats.slice(0, 3).concat([d.plat]); refrescarNuevo(); });
  ac('mdPlat', function (v, el) { const id = el.getAttribute('data-v'), c = st.b.cfg; c.plats = v ? c.plats.concat([id]).slice(0, 4) : c.plats.filter(function (x) { return x !== id; }); refrescarNuevo(); });
  ac('mdIniciar', function () { const r = Md.iniciar(st.b); if (r.error) return avisar(r.error); st.b = null; U.cerrarFicha(); avisar('', '«' + r.proyecto.tit + '» empieza'); U.refrescar(); });
  // ---------- Ficha de un proyecto ----------
  function fichaProyecto(id) {
    const p = Md.porId(id);
    if (!p) return '<p>No existe.</p>';
    const po = Md.portada(p), v = p.vend;
    let h = '<h2>' + esc(p.tit) + '</h2><div class="fila">' + caja(p, true) + '<div class="col crece"><span class="tenue">' + esc(Md.MED[p.med].nombre) + ' · ' + esc(tipoNom(p)) + ' · ' + esc(p.gen) + '</span><p class="chico">Portada: ' + esc(po.texto) + '</p>' +
      (p.pub !== undefined ? '<p>Crítica <b class="cifra">' + p.crit + '</b> · público <b class="cifra">' + p.pub + '</b></p>' : '<p>' + (p.et === 'ensayo' ? 'En ensayo' : 'En producción') + ': faltan ' + p.sr + ' semanas.</p>') + '</div></div>';
    h += '<div class="kpis">' + kpi('Ingresos', dinero(p.ing), 'bien') + kpi('Gastos', dinero(p.gas), 'mal') + kpi('Resultado', dinero(p.ing - p.gas), p.ing >= p.gas ? 'bien' : 'mal') + '</div>';
    if (p.med === 'musica') {
      h += '<p>' + Md.FMT_MUSICA.filter(function (f) { return v[f.id]; }).map(function (f) { return esc(f.nombre) + ': <b>' + grande(v[f.id]) + '</b>'; }).join(' · ') + (v.vistas ? ' · vistas: <b>' + grande(v.vistas) + '</b>' : '') + '</p>' + (p.cert ? '<p class="oro">Disco de ' + esc(Md.CERT.filter(function (c) { return c.id === p.cert; })[0].nombre.toLowerCase()) + '</p>' : '');
      if (p.pl) {
        const tot = Object.keys(p.pl).reduce(function (s2, k) { return s2 + (p.pl[k].ing || 0); }, 0) || 1, ico = { fisico: '💿', radio: '📻', tv: '📺', descarga: '⬇', audio: '🎧', video: '▶', canal: '📡' };
        const nom = { canal: 'Tu canal (Videos musicales)' };
        Md.PLAT_MUSICA.forEach(function (x) { nom[x.id] = x.nombre; });
        h += '<h3>Plataformas</h3><p class="nota info">Cada plataforma paga distinto por copia, emisión, descarga, reproducción o vista, y su peso cambia con la época: las tiendas y la radio mandan en el siglo XX; desde 2008, la escucha en línea. Una reproducción paga menos de un centavo, así que un éxito necesita millones. Las de video suman más si tu canal emite videos musicales.</p><div class="md-plats">' + Object.keys(p.pl).map(function (k) {
          const r = p.pl[k], x = Md.PLAT_MUSICA.filter(function (y) { return y.id === k; })[0], u = x ? x.u : 'emisiones';
          return '<div class="md-plat"><b>' + ico[k] + ' ' + esc(nom[k] || k) + '</b><span class="cifra">' + grande(r.u) + ' ' + u + '</span>' + (p.plSem && p.plSem[k] ? '<span class="chico tenue">+' + grande(p.plSem[k]) + ' esta semana</span>' : '') +
            (r.ing ? '<div class="tv-meta"><i style="width:' + Math.round(r.ing / tot * 100) + '%;background:var(--acento)"></i></div><span class="chico">' + dinero(r.ing) + '</span>' : '<span class="chico bien">Promoción: más gente lo escucha</span>') + '</div>';
        }).join('') + '</div>';
      }
    }
    if (p.med === 'juegos') h += '<p class="chico">' + esc(Md.de(Md.DIMENSIONES, p.cfg.dim, '2d').nombre) + ' · ' + esc(Md.de(Md.MODOS_J, p.cfg.modo, 'solo').nombre) + '</p>';
    if (p.med === 'juegos') h += '<p>Copias físicas <b>' + grande(v.fisicas) + '</b> · digitales <b>' + grande(v.digitales) + '</b> · jugadores activos <b>' + grande(v.jugadores) + '</b></p><p class="chico">Plataformas: ' + p.cfg.plats.map(function (x) { return esc(Md.plat(x).nombre); }).join(', ') + ' · ' + p.cfg.idiomas + ' idiomas · ' + esc(Md.MODELOS.filter(function (x) { return x.id === p.cfg.modelo; })[0].nombre) + (p.dlc ? ' · ' + p.dlc + ' DLC' : '') + '</p>';
    if (p.med === 'teatro') h += '<p>Entradas <b>' + grande(v.entradas) + '</b> · funciones <b>' + grande(v.funciones) + '</b>' + (p.ocup !== undefined ? ' · ocupación <b>' + Math.round(p.ocup * 100) + ' %</b>' : '') + ' · ' + esc(Md.sala(p.cfg.sala).nombre) + (p.grab ? ' · grabada' : '') + '</p>';
    if (p.med === 'libros') h += '<p>Copias <b>' + grande(v.copias) + '</b>' + (v.digitales ? ' · digitales <b>' + grande(v.digitales) + '</b>' : '') + (v.audio ? ' · audiolibros <b>' + grande(v.audio) + '</b>' : '') + ' · ' + p.cfg.trad + ' idiomas</p>';
    if (p.hs.length > 1) { const mx = Math.max.apply(null, p.hs) || 1; h += '<div class="fila" style="align-items:flex-end;height:40px;gap:1px">' + p.hs.map(function (x) { return '<i style="display:block;flex:1;background:var(--acento);height:' + Math.max(2, Math.round(x / mx * 40)) + 'px"></i>'; }).join('') + '</div>'; }
    const acc = [];
    if (p.med === 'juegos' && p.pub !== undefined) {
      acc.push(btn('Contenido descargable · ' + dinero(Math.round(p.costo * 0.15)), 'mdDlc', p.id));
      acc.push(btn(p.sop ? 'Quitar soporte' : 'Dar soporte (parches)', 'mdSoporte', p.id + '|' + (p.sop ? 0 : 1)));
      const otros = Md.proyectos('juegos').filter(function (x) { return x !== p && x.pub !== undefined && !x.paq; });
      if (!p.paq && otros.length) acc.push(btn('Paquete con «' + otros[otros.length - 1].tit + '»', 'mdPaquete', p.id + '|' + otros[otros.length - 1].id));
    }
    if (p.med === 'libros' && p.pub !== undefined) acc.push(btn('Traducir a otro idioma', 'mdTraducir', p.id));
    if (p.med === 'musica' && p.pub !== undefined && N.S.stream && !p.conc) acc.push(btn('Concierto en tu plataforma · ' + dinero(Math.round(p.costo * 0.1)), 'mdConcierto', p.id));
    if (p.med === 'teatro' && p.et === 'catalogo') { acc.push(btn('Gira por 4 ciudades', 'mdGiraT', p.id)); if (!p.grab) { acc.push(btn('Grabar para TV', 'mdGrabar', p.id + '|tv')); if (N.S.stream) acc.push(btn('Grabar para tu plataforma', 'mdGrabar', p.id + '|stream')); } }
    h += acc.length ? '<div class="fila">' + acc.join('') + '</div>' : '';
    h += '<h3>Equipo</h3><p class="chico">' + p.eq.map(function (id) { const t = T.porId(id); return t ? esc(t.nom) : ''; }).join(', ') + (p.cfg.banda ? ' · ' + esc((Md.banda(p.cfg.banda) || {}).nom || '') : '') + '</p>';
    dibujar();
    return h + btn('Cerrar', 'cerrarFicha', '', 'bloque');
  }
  function refrescarProyecto(id) { U.refrescarFicha(fichaProyecto(id)); }
  ac('mdVer', function (v) { U.abrirFicha(fichaProyecto(v), 'medio:' + v); });
  ac('mdDlc', function (v) { avisar(Md.dlc(v), 'DLC a la venta'); refrescarProyecto(v); });
  ac('mdSoporte', function (v) { const p = v.split('|'); avisar(Md.soporte(+p[0], p[1] === '1'), 'Listo'); refrescarProyecto(p[0]); });
  ac('mdPaquete', function (v) { const p = v.split('|'); avisar(Md.paquete(+p[0], +p[1]), 'Paquete a la venta'); refrescarProyecto(p[0]); });
  ac('mdTraducir', function (v) { avisar(Md.traducir(v), 'Traducción en camino'); refrescarProyecto(v); });
  ac('mdConcierto', function (v) { avisar(Md.concierto(v), 'El concierto ya está en tu plataforma'); refrescarProyecto(v); });
  ac('mdGiraT', function (v) { avisar(Md.gira(v, 4), 'La obra sale de gira'); refrescarProyecto(v); });
  ac('mdGrabar', function (v) { const p = v.split('|'); avisar(Md.grabar(+p[0], p[1]), 'Obra grabada'); refrescarProyecto(p[0]); });
  return { medio: medio, fichaProyecto: fichaProyecto, dibujar: dibujar };
})();
