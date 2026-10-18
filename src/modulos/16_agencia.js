/* ==== módulo: agencia ==== */
// Talentos 2.0 en pantalla: la sección Talento con buscador avanzado (nombre, oficio, sexo, overall, costo,
// activos o retirados, orden), tu avatar con su academia, la búsqueda de promesas, y la ficha completa de cada
// talento (biografía, desempeño por familia, capacidades, medios, otras habilidades, fama por región, relaciones,
// ventajas, historial, premios e ingresos) con sus acciones: contratar para una obra en marcha o nueva, contrato
// exclusivo, comprar la exclusividad a un rival y academia con beca.
ART.agencia = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, X = ART.taxonomia, E = ART.economia, M = ART.mundo, O = ART.obras, T = ART.talentos;
  const J = ART.juego, U = ART.ui, t = ART.t, esc = N.esc;
  const dinero = U.dinero, icono = U.icono, ac = U.accion;

  // ---------- Filtros del buscador (nombre, overall, costo, sexo, talento, retirado o activo, orden) ----------
  const ft = { of: '', q: '', sx: '', estado: 'activos', disp: false, ovMin: 0, ovMax: 100, cMin: '', cMax: '', orden: 'valor', dir: 'desc', avanzado: false, n: 40, solo: '' };
  const ORDENES = [['valor', 'Recomendado'], ['overall', 'Overall'], ['fama', 'Popularidad'], ['costo', 'Costo'], ['taquilla', 'Taquilla de su carrera'], ['nombre', 'Nombre'], ['edad', 'Edad'], ['energia', 'Energía'], ['disponible', 'Disponibilidad']];
  function barra(v, max, clase) { return '<span class="mini" style="width:60px"><i class="' + (clase || '') + '" style="width:' + Math.round(N.limitar(v / (max || 100), 0, 1) * 100) + '%"></i></span>'; }
  function signo(x) { return (x > 0 ? '+' : '') + x; }
  function kpi(nombre, valor, clase) { return '<div class="kpi"><span>' + esc(nombre) + '</span><b class="cifra ' + (clase || '') + '">' + esc(valor) + '</b></div>'; }
  function oficioNombre(t) { return T.nombreOficio(t); }
  function etiquetas(x) {
    const S = N.S, out = [];
    const ex = T.exclusivoDe(x);
    if (ex === 0) out.push('<span class="etiqueta oro">exclusivo tuyo</span>');
    else if (ex !== null) out.push('<span class="etiqueta">exclusivo de ' + esc(S.estudios[ex].nombre) + '</span>');
    const nv = T.nivel(x);
    if (!x.ret && !x.mu) out.push('<span class="etiqueta' + (nv.id === 'leyenda' || nv.id === 'estrella' ? ' oro' : '') + '">' + esc(nv.nombre) + '</span>');
    if ((S.listaCorta || []).indexOf(x.id) >= 0) out.push('<span class="etiqueta bien">en tu lista corta</span>');
    if (x.jugador) out.push('<span class="etiqueta oro">eres tú</span>');
    if (T.estudiando(x)) out.push('<span class="etiqueta">estudiando</span>');
    if (x.desc) out.push('<span class="etiqueta bien">tu promesa</span>');
    if (x.beca && x.beca > S.t) out.push('<span class="etiqueta bien">becado</span>');
    if (x.mu) out.push('<span class="etiqueta mal">falleció</span>');
    else if (x.ret) out.push('<span class="etiqueta">retirado</span>');
    else if (T.ocupado(x)) out.push('<span class="etiqueta">en ' + x.act + ' proyecto' + (x.act > 1 ? 's' : '') + '</span>');
    return out.join(' ');
  }
  function lista() {
    const S = N.S, q = ft.q.toLowerCase();
    const cMin = ft.cMin === '' ? -Infinity : +ft.cMin, cMax = ft.cMax === '' ? Infinity : +ft.cMax;
    const r = S.talentos.filter(function (x) {
      if (ft.estado === 'activos' && (x.ret || x.mu)) return false;
      if (ft.estado === 'retirados' && !x.ret) return false;
      if (ft.of && x.of !== ft.of) return false;
      if (ft.sx && x.sx !== ft.sx) return false;
      if (ft.disp && !T.disponible(x, 0)) return false;
      if (ft.solo === 'exclusivos' && T.exclusivoDe(x) !== 0) return false;
      if (ft.solo === 'promesas' && !x.desc && !x.beca) return false;
      if (q && x.nom.toLowerCase().indexOf(q) < 0) return false;
      if (ft.letra && x.nom.charAt(0).toUpperCase() !== ft.letra) return false;
      if (ft.nivel && T.nivel(x).id !== ft.nivel) return false;
      if (ft.solo === 'corta' && (S.listaCorta || []).indexOf(x.id) < 0) return false;
      const ov = T.overall(x);
      if (ov < ft.ovMin || ov > ft.ovMax) return false;
      const c = T.tarifa(x);
      if (c < cMin || c > cMax) return false;
      return true;
    });
    const clave = {
      valor: function (x) { return x.hab + x.fama * 12; }, overall: T.overall, fama: function (x) { return x.fama; }, costo: T.tarifa,
      taquilla: function (x) { return x.tq || 0; }, disponible: function (x) { return T.disponible(x, 0) ? 1 : 0; }, nombre: function (x) { return x.nom; }, edad: function (x) { return -x.nac; }, energia: T.energia,
    }[ft.orden] || function (x) { return x.hab; };
    r.sort(function (a, b) {
      const va = clave(a), vb = clave(b);
      const c = typeof va === 'string' ? va.localeCompare(vb, 'es') : va - vb;
      return ft.dir === 'asc' ? c : -c;
    });
    return r;
  }
  // =====================================================================
  // SECCIÓN TALENTO
  // =====================================================================
  function talento() {
    const S = N.S, av = S.avatar;
    let h = '<div class="titulo-sec"><h2>' + esc(t('sec_talento')) + '</h2><div class="fila"><button class="btn primario" data-a="crearTalentoForm">' + icono('persona') + 'Crear talento</button><button class="ayuda-i" data-a="ayuda" data-v="talento" aria-label="' + t('ayuda') + '">i</button></div></div>';
    // Tu avatar y su academia
    const bonos = (av.esp || []).map(function (x) { return D.oficio(x).nombre + ' +' + (1 + ((av.ac && av.ac[x]) || 0)); }).concat(Object.keys(av.ac || {}).filter(function (x) { return (av.esp || []).indexOf(x) < 0; }).map(function (x) { return D.oficio(x).nombre + ' +' + av.ac[x]; }));
    h += '<div class="tarjeta"><div class="fila"><canvas class="retrato grande" data-retrato="999999"></canvas><div class="col crece"><span class="tenue chico">' + t('tu_avatar') + '</span><h3 style="margin:2px 0">' + esc(av.nom) + '</h3><span>' + (N.anio() - av.nac) + ' años · ' + esc(N.S.estudios[0].personalidad) + '</span>' +
      '<span class="chico">En tus obras: ' + esc(bonos.join(' · ')) + '</span>' + (av.es && av.es.fin > S.t ? '<span class="chico oro">Estudiando ' + esc(T.curso(av.es.c).nombre) + ' hasta ' + esc(U.fechaCorta(av.es.fin)) + '</span>' : '') + '</div></div>' +
      '<div class="fila envolver"><button class="btn" data-a="agAcademia" data-v="avatar">' + icono('mas') + 'Estudiar (academia)</button><button class="btn" data-a="agAspecto">Cambiar tu aspecto</button></div><span class="nota info"><span>Puedes ganar hasta +5 en cada oficio estudiando.</span> <span>En tus obras puedes ponerte en el equipo como ' + esc(ART.carrera.oficiosAvatar().map(function (x) { return D.oficio(x).nombre.toLowerCase(); }).join(', ')) + ' (sin cobrar).</span> <span>Tu vida, tus encargos y tu retiro están en Estudio.</span></span></div>';
    // Promesas
    const espera = S.tPromesas ? Math.max(0, J.ESPERA_PROMESAS - (S.t - S.tPromesas)) : 0;
    h += '<div class="tarjeta"><b>Buscar promesas</b><p class="nota" style="margin:2px 0">Tus cazatalentos encuentran 3 jóvenes con mucho potencial. Conocerás su potencial real, su primer contrato sale 30 % más barato y te tienen lealtad.</p><div class="fila envolver">' +
      '<select data-c="agPromesaOf" aria-label="Oficio a buscar"><option value="">Cualquier oficio</option>' + D.oficios.map(function (o) { return '<option value="' + o.id + '"' + (ft.promOf === o.id ? ' selected' : '') + '>' + esc(o.nombre) + '</option>'; }).join('') + '</select>' +
      '<button class="btn primario" data-a="agPromesas"' + (espera ? ' disabled' : '') + '>' + (espera ? 'De nuevo en ' + espera + ' semanas' : 'Buscar · ' + dinero(J.costoPromesas())) + '</button></div></div>';
    // Catálogo por gremios con conteo
    const activos = T.activos();
    const cuenta = {}; activos.forEach(function (x) { cuenta[x.of] = (cuenta[x.of] || 0) + 1; });
    h += '<div class="chips" style="margin:8px 0">' + '<button class="chip' + (!ft.of ? ' on' : '') + '" data-a="agOficio" data-v="">' + t('todos') + ' (' + activos.length + ')</button>' + D.oficios.map(function (o) {
      return '<button class="chip' + (ft.of === o.id ? ' on' : '') + '" data-a="agOficio" data-v="' + o.id + '">' + esc(o.nombre) + ' (' + (cuenta[o.id] || 0) + ')</button>';
    }).join('') + '</div>';
    h += '<div class="chips">' + [['', 'Todos los niveles']].concat(T.NIVELES.map(function (n) { return [n.id, n.nombre]; })).map(function (n) { return '<button class="chip' + (ft.nivel === n[0] ? ' on' : '') + '" data-a="agNivel" data-v="' + n[0] + '">' + esc(n[1]) + '</button>'; }).join('') +
      '<button class="chip' + (ft.solo === 'corta' ? ' on' : '') + '" data-a="agCorta">Lista corta (' + (S.listaCorta || []).length + ')</button></div>';
    h += '<label class="campo"><span>Letra</span><select data-c="agLetra"><option value="">Todas</option>' + 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(function (c) { return '<option' + (ft.letra === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>';
    h += '<div class="fila"><input type="search" placeholder="' + t('tal_buscar') + '" value="' + esc(ft.q) + '" data-c="agBuscar" style="flex:1"><button class="btn" data-a="agAvanzado" aria-expanded="' + ft.avanzado + '">Filtros</button></div>';
    if (ft.avanzado) {
      const sel = function (k, ops) { return '<select data-c="agFiltro" data-k="' + k + '">' + ops.map(function (o) { return '<option value="' + o[0] + '"' + (String(ft[k]) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
      h += '<div class="tarjeta"><div class="fila envolver">' +
        '<label class="campo crece"><span>Sexo</span>' + sel('sx', [['', 'Todos'], ['F', t('mujer')], ['M', t('hombre')]]) + '</label>' +
        '<label class="campo crece"><span>Estado</span>' + sel('estado', [['activos', 'Activos'], ['retirados', 'Retirados'], ['todos', 'Todos']]) + '</label>' +
        '<label class="campo crece"><span>Mostrar</span>' + sel('solo', [['', 'Todos'], ['exclusivos', 'Mis exclusivos'], ['promesas', 'Mis promesas y becados']]) + '</label></div>' +
        '<div class="fila envolver"><label class="campo crece"><span>Overall mínimo</span><input type="number" min="0" max="100" value="' + ft.ovMin + '" data-c="agFiltro" data-k="ovMin"></label>' +
        '<label class="campo crece"><span>Overall máximo</span><input type="number" min="0" max="100" value="' + ft.ovMax + '" data-c="agFiltro" data-k="ovMax"></label></div>' +
        '<div class="fila envolver"><label class="campo crece"><span>Costo mínimo (dólares de ' + N.anio() + ')</span><input type="number" min="0" value="' + esc(ft.cMin) + '" data-c="agFiltro" data-k="cMin" placeholder="sin mínimo"></label>' +
        '<label class="campo crece"><span>Costo máximo</span><input type="number" min="0" value="' + esc(ft.cMax) + '" data-c="agFiltro" data-k="cMax" placeholder="sin máximo"></label></div>' +
        '<div class="fila envolver"><label class="campo crece"><span>Ordenar por</span>' + sel('orden', ORDENES) + '</label><label class="campo crece"><span>Orden</span>' + sel('dir', [['desc', 'De mejor a peor'], ['asc', 'De peor a mejor']]) + '</label></div>' +
        '<label class="interruptor"><span>' + t('tal_disponibles') + '</span><input type="checkbox" data-c="agFiltro" data-k="disp"' + (ft.disp ? ' checked' : '') + '></label></div>';
    }
    const l = lista();
    h += '<p class="nota">' + l.length + ' talentos · ' + T.activos().length + ' activos en el mundo</p><div class="col">' + l.slice(0, ft.n).map(function (x) {
      const en = T.energia(x);
      return '<button class="tarjeta toque fila" style="width:100%;text-align:left" data-a="verTalento" data-v="' + x.id + '"><canvas class="retrato" data-retrato="' + x.id + '"></canvas><div class="col crece"><b>' + esc(x.nom) + '</b><span class="chico">' + esc(oficioNombre(x)) + ' · ' + (N.anio() - x.nac) + ' años · ' + esc(D.pais(x.pais).nombre) + ' · ' + esc(T.personalidad(x).txt) + '</span>' +
        '<span class="chico">Overall ' + T.overall(x) + ' · ' + t('tal_habilidad').toLowerCase() + ' ' + Math.round(x.hab) + ' · ' + t('tal_fama').toLowerCase() + ' ' + Math.round(x.fama * 100) + (x.ret ? '' : ' · energía ' + barra(en, 100, en < 40 ? 'mal' : '')) + '</span>' + (etiquetas(x) ? '<span>' + etiquetas(x) + '</span>' : '') + '</div><b class="cifra">' + dinero(T.tarifaPara(x, 0)) + '</b></button>';
    }).join('') + '</div>' + (l.length > ft.n ? '<button class="btn bloque" data-a="agMas">' + t('ver') + ' más</button>' : '');
    return h;
  }
  function render(mantener) { U.renderVista(mantener); }
  ac('agOficio', function (v) { ft.of = v; ft.n = 40; render(); });
  ac('agNivel', function (v) { ft.nivel = v; ft.n = 40; render(true); });
  ac('agLetra', function (v) { ft.letra = v; ft.n = 40; render(true); });
  ac('agCorta', function () { ft.solo = ft.solo === 'corta' ? '' : 'corta'; render(true); });
  ac('agListaCorta', function (v) {
    const S = N.S, id = +v;
    S.listaCorta = S.listaCorta || [];
    const i = S.listaCorta.indexOf(id);
    if (i >= 0) S.listaCorta.splice(i, 1); else S.listaCorta.push(id);
    U.refrescarFicha(fichaTalento(id));
  });
  ac('agBuscar', function (v) { ft.q = v; ft.n = 40; render(true); });
  ac('agAvanzado', function () { ft.avanzado = !ft.avanzado; render(true); });
  ac('agMas', function () { ft.n += 40; render(true); });
  ac('agFiltro', function (v, el) {
    const k = el.getAttribute('data-k');
    if (k === 'disp') ft.disp = !!v;
    else if (k === 'ovMin' || k === 'ovMax') ft[k] = N.limitar(Math.round(+v || 0), 0, 100) || (k === 'ovMax' ? 100 : 0);
    else ft[k] = v;
    ft.n = 40;
    render(true);
  });
  ac('agPromesaOf', function (v) { ft.promOf = v; });
  ac('agPromesas', function () {
    const r = J.buscarPromesas(ft.promOf || '');
    if (r.error) { U.aviso(r.error, 'mal'); return; }
    ART.arte.sonido('exito');
    ft.solo = 'promesas'; ft.avanzado = true; ft.estado = 'activos'; ft.of = ''; ft.q = '';
    U.aviso('Tus cazatalentos encontraron ' + r.talentos.length + ' promesas');
    U.refrescar();
  });

  // =====================================================================
  // FICHA DEL TALENTO
  // =====================================================================
  function fichaTalento(id) {
    const x = T.porId(id);
    if (!x) return '<p class="tenue">Este talento ya no está en el mundo.</p>';
    const S = N.S, anio = N.anio(), e = anio - x.nac;
    const per = T.personalidad(x), ex = T.perfilExtra(x), r = D.rasgos[x.rasgo];
    const exc = T.exclusivoDe(x);
    let h = '<div class="fila" style="align-items:flex-start"><canvas class="retrato grande" data-retrato="' + x.id + '"></canvas><div class="col crece"><h2 style="margin:0">' + esc(x.nom) + '</h2>' +
      '<span>' + esc(oficioNombre(x)) + (x.h2 ? ' · también ' + esc(Object.keys(x.h2).map(function (k) { return T.nombreOficio(x, k).toLowerCase() + ' (' + Math.round(x.h2[k]) + ')'; }).join(', ')) : '') + '</span>' +
      '<span class="tenue">' + e + ' años · ' + esc(D.pais(x.pais).nombre) + ' · ' + (x.sx === 'F' ? t('mujer') : t('hombre')) + (x.idi ? ' · habla ' + esc(x.idi.map(function (i) { return i.toLowerCase(); }).join(', ')) : '') + '</span>' +
      '<span class="oro">' + esc(per.txt) + ' · impulsa ' + per.valor + ' % la popularidad</span><span>' + etiquetas(x) + '</span></div></div>';
    h += '<p>' + esc(T.biografia(x)) + '</p>';
    if (x.propio && !x.jugador && !x.mu || S.sandbox && !x.mu) h += '<div class="fila"><button class="btn" data-a="tnEditar" data-v="' + x.id + '">' + icono('pincel') + 'Editar talento</button></div>';
    const pot = T.potencialConocido(x) ? Math.round(x.pot) : '?';
    h += '<div class="kpis" style="margin:10px 0">' + kpi('Overall', T.overall(x)) + kpi(t('tal_habilidad'), Math.round(x.hab)) + kpi('Potencial', pot) + kpi(t('tal_fama'), Math.round(x.fama * 100)) + kpi('Poder de estrella', ex.poder) +
      kpi(t('tal_tarifa'), dinero(T.tarifaPara(x, 0))) + kpi('Energía', x.ret ? '—' : T.energia(x)) + kpi('Moral', x.ret ? '—' : T.moral(x)) + kpi('Proyectos activos', (x.act || 0) + ' de ' + T.MAX_PROYECTOS) +
      kpi(t('tal_obras'), x.obras) + kpi('Éxitos', x.exitos) + kpi(t('tal_premios'), x.premios) + kpi('Taquilla en tu partida (hoy)', U.dinero(x.tq || 0, 2025)) + kpi('Ingresos en tu partida (hoy)', U.dinero(x.gan || 0, 2025)) + '</div>';
    if (pot === '?') h += '<p class="nota info">El potencial se conoce de verdad si lo descubriste, si lo becaste o si trabajó contigo.</p>';
    // Radar del talento (sus capacidades frente al promedio de su oficio)
    const pares = S.talentos.filter(function (y) { return y.of === x.of && !y.ret && !y.mu && y.cp; }).slice(0, 300);
    const prom = T.CAPACIDADES.map(function (_, i) { return pares.length ? pares.reduce(function (a, y) { return a + y.cp[i]; }, 0) / pares.length : 50; });
    const gr = U.grafica('radarT' + x.id, function (cv) {
      ART.arte.radar(cv, [T.CAPACIDADES.map(function (_, i) { return x.cp ? x.cp[i] : x.hab; }), prom], T.CAPACIDADES, { leyenda: [x.nom.split(' ')[0], 'Promedio de su oficio'] });
    });
    h += '<canvas class="lienzo" style="height:230px;max-width:420px;margin:0 auto;display:block" data-grafica="' + gr + '" role="img" aria-label="Radar de capacidades"></canvas>';
    const nv = T.nivel(x), falta = T.faltaPrestigio(x, 0);
    h += '<p><b>' + esc(nv.nombre) + '</b>' + (nv.prestigio ? ' · pide prestigio ' + nv.prestigio + (falta ? ' <span class="mal">(te faltan ' + falta + ')</span>' : ' <span class="bien">(lo tienes)</span>') : '') + '</p>';
    h += '<button class="btn" data-a="agListaCorta" data-v="' + x.id + '">' + ((S.listaCorta || []).indexOf(x.id) >= 0 ? 'Quitar de la lista corta' : 'Agregar a la lista corta') + '</button>';
    // Acciones
    h += '<div class="fila envolver" style="margin:8px 0">' + (x.ret ? '' :
      '<button class="btn primario" data-a="agContratar" data-v="' + x.id + '">Contratar para…</button>' +
      (exc === 0 ? '<button class="btn" data-a="agCancelarEx" data-v="' + x.id + '">Cancelar exclusivo</button>' : exc !== null ? '<button class="btn" data-a="agComprarEx" data-v="' + x.id + '">Comprar exclusividad · ' + dinero(T.costoLiberar(x)) + '</button>' : '<button class="btn" data-a="agExclusivo" data-v="' + x.id + '">Contrato exclusivo</button>') +
      '<button class="btn" data-a="agAcademia" data-v="' + x.id + '">Academia y beca</button>') + '</div>';
    if (exc !== null) h += '<p class="nota">Contrato exclusivo con ' + esc(S.estudios[exc].nombre) + ' hasta ' + esc(U.fechaCorta(x.exH)) + ' · ' + dinero(x.exS) + ' al año.</p>';
    if (T.estudiando(x)) h += '<p class="nota oro">Estudiando ' + esc(T.curso(x.es.c).nombre) + ' hasta ' + esc(U.fechaCorta(x.es.fin)) + '.</p>';
    if (ui.panel && ui.panel.id === x.id) h += ui.panel.html();
    // Habilidades
    const bar = function (nombre, v, max) { return '<div class="fila entre chico"><span>' + esc(nombre) + '</span><span>' + barra(v, max || 100) + ' <b>' + Math.round(v) + '</b></span></div>'; };
    h += '<div class="dos"><div class="tarjeta"><h3>Desempeño por familia</h3>' + T.EJES.map(function (n, i) { return bar(n + ' (' + signo(x.af ? x.af[i] : 0) + ')', 50 + (x.af ? x.af[i] : 0) * 6); }).join('') + '</div>';
    h += '<div class="tarjeta"><h3>Capacidades</h3>' + T.CAPACIDADES.map(function (n, i) { return bar(n, x.cp ? x.cp[i] : x.hab); }).join('') + '</div></div>';
    const nomMed = { cine: 'Películas', tv: 'TV', musica: 'Música', juegos: 'Videojuegos', teatro: 'Teatro', libros: 'Libros' };
    h += '<div class="dos"><div class="tarjeta"><h3>Especialidades por medio</h3>' + T.MEDIOS.map(function (m) { return bar(nomMed[m] + (x.med === m ? ' ★' : ''), ex.medios[m]); }).join('') + '</div>';
    h += '<div class="tarjeta"><h3>Otras habilidades</h3>' + Object.keys(ex.otras).map(function (k) { return bar(k, ex.otras[k]); }).join('') + '</div></div>';
    if (x.of === 'interprete') h += '<div class="tarjeta"><h3>Actuación</h3>' + bar('Interpretación', x.hab) + bar('Belleza', x.bel || 50) + bar('Aprobación del público', x.apr || 50) + '<p class="chico">Papeles recomendados: ' + esc((x.pap || []).join(', ') || '—') + '</p></div>';
    h += '<div class="dos"><div class="tarjeta"><h3>Fama por región</h3>' + D.regiones.map(function (rg) { return bar(rg.nombre + (rg.id === x.reg ? ' (su tierra)' : ''), T.famaRegion(x, rg.id) * 100); }).join('') + '<p class="nota">Alcance internacional ' + Math.round((x.alc || 0) * 100) + ' %: crece con cada éxito.</p></div>';
    h += '<div class="tarjeta"><h3>Contenido y condiciones</h3><p class="chico">Acepta clasificaciones: <b>' + (x.cmax >= 7 ? 'Cualquiera' : X.ORDEN_CLAS.slice(0, x.cmax + 1).join(', ')) + '</b></p>' +
      (x.rasgo && r ? '<p class="chico">' + t('tal_rasgo') + ': <b>' + esc(x.rasgo) + '</b> (calidad ' + signo(r[0]) + ', sobrecosto ' + Math.round(r[1] * 100) + ' %, tarifa ×' + U.decimal(r[2], 2) + ')</p>' : '') +
      '<p class="chico">Ventajas: ' + (T.ventajas(x).length ? T.ventajas(x).map(function (v) { return '<b>' + esc(v.id) + '</b> (' + esc(v.efecto) + ')'; }).join(', ') : 'todavía ninguna (se ganan con obras, éxitos y premios)') + '</p>' +
      (x.ac && Object.keys(x.ac).length ? '<p class="chico">Academia: ' + Object.keys(x.ac).map(function (k) { return D.oficio(k).nombre + ' +' + x.ac[k]; }).join(', ') + ' (máximo +' + T.MAX_ACADEMIA + ')</p>' : '') + '</div></div>';
    // Relaciones
    const rel = Object.keys(x.rel || {}).map(function (k) { return { o: T.porId(+k), v: x.rel[k] }; }).filter(function (q) { return q.o; }).sort(function (a, b) { return Math.abs(b.v) - Math.abs(a.v); });
    h += '<h3>Relaciones</h3>' + (rel.length ? rel.map(function (q) {
      const tipo = T.tipoRelacion(q.v, x, q.o) || (q.v > 0 ? 'buena relación' : 'roces');
      return '<button class="tarjeta toque fila entre" style="width:100%" data-a="verTalento" data-v="' + q.o.id + '"><span>' + esc(q.o.nom) + ' <span class="tenue chico">' + esc(oficioNombre(q.o)) + '</span></span><span class="' + (q.v > 0 ? 'bien' : 'mal') + '">' + esc(tipo) + ' (' + signo(q.v) + ')</span></button>';
    }).join('') + '<p class="nota info">La química del equipo clave (dirección, guion y protagonistas) suma o resta hasta 4 puntos de calidad.</p>' : '<p class="tenue">Las amistades, rivalidades y parejas nacen trabajando juntos.</p>');
    // Historial y premios
    const obras = S.obras.filter(function (o) { return (o.eq && O.idsEquipo(o).indexOf(id) >= 0) || (x.hist && x.hist.indexOf(o.id) >= 0); }).slice(-15).reverse();
    h += '<h3>' + t('tal_obras') + '</h3>' + (obras.length ? obras.map(function (o) {
      const m = O.multiplicador(o);
      return '<button class="tarjeta toque fila entre" style="width:100%" data-a="verObra" data-v="' + o.id + '"><span>«' + esc(o.tit) + '» <span class="tenue chico">' + esc(S.estudios[o.est].nombre) + ' · ' + (o.anio || O.NOMBRE_ETAPA[o.et]) + '</span></span>' + (o.et === 'terminada' ? '<span class="etiqueta ' + (m >= 2.5 ? 'bien' : m < 1.4 ? 'mal' : '') + '">×' + U.decimal(m, 2) + '</span>' : '') + '</button>';
    }).join('') : '<p class="tenue">Sin obras todavía.</p>');
    const premios = [];
    S.premios.forEach(function (p) { p.categorias.forEach(function (c) { if (c.ganador.tid === id) premios.push({ anio: p.anio + 1, cat: c.nombre, tit: c.ganador.titulo }); }); });
    if (premios.length) h += '<h3>Premios</h3>' + premios.reverse().map(function (p) { return '<p style="margin:4px 0">' + esc(D.premios.nombre) + ' ' + p.anio + ' · ' + esc(p.cat) + ' por «' + esc(p.tit) + '»</p>'; }).join('');
    h += '<p class="nota info">La tarifa sale del mercado: habilidad, fama, demanda, proyectos en curso y época. Nunca del presupuesto de tu obra.</p>';
    return h;
  }
  // Paneles dentro de la ficha (contratar, exclusivo, academia)
  const ui = { panel: null };
  function abrirPanel(id, fn) { ui.panel = { id: id, html: fn }; U.refrescarFicha(fichaTalento(id)); }
  function cerrarPanel(id) { ui.panel = null; U.refrescarFicha(fichaTalento(id)); }
  ac('verTalento', function (v) { ui.panel = null; U.abrirFicha(fichaTalento(+v), 'talento:' + v); });
  ac('agCerrarPanel', function (v) { cerrarPanel(+v); });
  // ---------- Contratar para una obra en marcha (antes del rodaje) o para una nueva ----------
  ac('agContratar', function (v) {
    const id = +v, x = T.porId(id);
    abrirPanel(id, function () {
      const obras = O.delEstudio(0, ['desarrollo', 'preproduccion']);
      let h = '<div class="tarjeta picker"><div class="fila entre"><b>Contratar a ' + esc(x.nom) + '</b><button class="btn" data-a="agCerrarPanel" data-v="' + id + '">' + t('cerrar') + '</button></div>';
      // Lo que diría hoy (sin contar las condiciones de una obra concreta): si rechaza, se avisa antes
      const r = T.negociar(x, { est: 0, rol: x.of, imp: x.of === 'interprete' ? 'protagonista' : undefined });
      if (r.estado === 'rechaza') h += '<p class="mal">Hoy no firmaría: ' + esc(r.texto.charAt(0).toLowerCase() + r.texto.slice(1)) + '.</p>';
      else if (r.estado === 'contraoferta') h += '<p class="nota oro">' + esc(r.texto) + '.</p>';
      h += '<button class="btn primario bloque" data-a="agNuevaObra" data-v="' + id + '"' + (r.estado === 'rechaza' ? ' disabled' : '') + '>Nueva obra con ' + esc(x.nom.split(' ')[0]) + '</button>';
      h += obras.length ? '<p class="nota info">O súmalo a una obra que todavía no empieza el rodaje:</p>' + obras.map(function (o) {
        let botones;
        if (x.of === 'interprete') botones = [['protagonista', 'Protagonista'], ['secundario', 'Secundario'], ['invitado', 'Invitado'], ['cameo', 'Cameo']].map(function (b) { return '<button class="btn" data-a="agSumar" data-v="' + o.id + '|' + id + '|interprete|' + b[0] + '">' + b[1] + '</button>'; }).join('');
        else {
          const actual = T.porId(o.eq[x.of]);
          botones = '<button class="btn" data-a="agSumar" data-v="' + o.id + '|' + id + '|' + x.of + '|">Como ' + esc(D.oficio(x.of).nombre.toLowerCase()) + (actual ? ' (reemplaza a ' + esc(actual.nom) + ')' : '') + '</button>';
        }
        return '<div class="tarjeta"><b>«' + esc(o.tit) + '»</b> <span class="tenue chico">' + O.NOMBRE_ETAPA[o.et] + '</span><div class="fila envolver" style="margin-top:4px">' + botones + '</div></div>';
      }).join('') : '<p class="tenue">No tienes obras antes del rodaje.</p>';
      return h + '</div>';
    });
  });
  ac('agSumar', function (v) {
    const p = v.split('|');
    const err = J.contratarEnObra(+p[0], +p[1], p[2], p[3] || undefined);
    if (err) { U.aviso(err, 'mal'); return; }
    ART.arte.sonido('dinero');
    U.aviso('Contratado');
    ui.panel = null;
    U.renderBarra();
    U.refrescarFicha(fichaTalento(+p[1]));
  });
  ac('agNuevaObra', function (v) {
    ui.panel = null;
    if (ART.creacion.crearCon) ART.creacion.crearCon(+v);
  });
  // ---------- Contratos exclusivos ----------
  ac('agExclusivo', function (v) {
    const id = +v, x = T.porId(id);
    abrirPanel(id, function () {
      const err = T.puedeExclusivo(x, 0);
      const sal = T.salarioExclusivo(x);
      return '<div class="tarjeta picker"><div class="fila entre"><b>Contrato exclusivo</b><button class="btn" data-a="agCerrarPanel" data-v="' + id + '">' + t('cerrar') + '</button></div>' +
        '<p class="nota info">Trabaja solo para ti: no cobra por obra (ya cobra su salario), los rivales no pueden contratarlo y su moral sube. Salario: <b>' + dinero(sal) + ' al año</b> (sigue a la época), pagado cada mes.</p>' +
        (err ? '<p class="mal">' + esc(err) + '</p>' : '<div class="fila envolver">' + [1, 2, 3].map(function (a) { return '<button class="btn primario" data-a="agFirmarEx" data-v="' + id + '|' + a + '">' + a + ' año' + (a > 1 ? 's' : '') + ' · ' + dinero(sal * a) + '</button>'; }).join('') + '</div>') + '</div>';
    });
  });
  ac('agFirmarEx', function (v) {
    const p = v.split('|');
    const err = J.firmarExclusivo(+p[0], +p[1]);
    if (err) { U.aviso(err, 'mal'); return; }
    ART.arte.sonido('exito');
    U.aviso('Contrato exclusivo firmado');
    cerrarPanel(+p[0]);
  });
  ac('agComprarEx', function (v) {
    const err = J.comprarExclusividad(+v);
    if (err) { U.aviso(err, 'mal'); return; }
    ART.arte.sonido('dinero');
    U.aviso('Ahora está libre: puedes contratarlo o firmarle un exclusivo');
    U.renderBarra();
    cerrarPanel(+v);
  });
  ac('agCancelarEx', function (v) { const err = J.cancelarExclusivo(+v); if (err) { U.aviso(err, 'mal'); return; } U.aviso('Contrato exclusivo cancelado'); cerrarPanel(+v); });
  // ---------- Academia (talentos con beca y tu avatar) ----------
  function panelAcademia(id) {
    const esAvatar = id === 'avatar';
    const x = esAvatar ? null : T.porId(+id);
    const areas = esAvatar ? D.oficios.map(function (o) { return [o.id, o.nombre]; }) :
      [[x.of, D.oficio(x.of).nombre + ' (su oficio)']].concat(D.oficios.filter(function (o) { return o.id !== x.of; }).map(function (o) { return [o.id, o.nombre + ' (otro oficio)']; }),
        D.ORDEN_FAM.map(function (f) { return ['fam:' + f, 'Especialidad en ' + D.familia(f).nombre.toLowerCase()]; }));
    const area = ui.area && areas.some(function (a) { return a[0] === ui.area; }) ? ui.area : areas[0][0];
    let h = '<div class="tarjeta picker"><div class="fila entre"><b>Academia' + (esAvatar ? '' : ' · beca para ' + esc(x.nom)) + '</b><button class="btn" data-a="agCerrarPanel" data-v="' + id + '">' + t('cerrar') + '</button></div>' +
      '<p class="nota">' + (esAvatar ? 'Estudiar te da hasta +5 en cada oficio para tus obras.' : 'Pagas sus estudios: gana experiencia (hasta +5 por oficio), su moral sube y te cobra 10 % menos por 5 años. Estudiando no puede trabajar.') + '</p>' +
      '<label class="campo"><span>Qué estudia</span><select data-c="agArea" data-k="' + id + '">' + areas.map(function (a) { return '<option value="' + a[0] + '"' + (a[0] === area ? ' selected' : '') + '>' + esc(a[1]) + '</option>'; }).join('') + '</select></label>';
    h += T.CURSOS.map(function (c) {
      let err, costo;
      if (esAvatar) {
        const av = N.S.avatar;
        err = av.es && av.es.fin > N.S.t ? 'Ya estás estudiando.' : ((av.ac && av.ac[area]) || 0) >= T.MAX_ACADEMIA ? 'Ya ganaste los +5 de este oficio.' : '';
        costo = Math.round(E.presupuestoTipico(N.anio()) * 0.0006 * c.costo);
      } else { err = T.puedeEstudiar(x, c, area); costo = T.costoCurso(x, c, area); }
      return '<div class="tarjeta fila entre"><div class="col crece"><b>' + esc(c.nombre) + '</b><span class="chico">' + c.semanas + ' semanas · +' + c.gana[0] + ' a +' + c.gana[1] + (esAvatar ? '' : ' · nivel ' + c.min + ' a ' + (c.max - 1) + ' · energía ' + c.energia) + '</span>' + (err ? '<span class="chico mal">' + esc(err) + '</span>' : '') + '</div>' +
        '<button class="btn' + (err ? '' : ' primario') + '" data-a="agEstudiar" data-v="' + id + '|' + c.id + '|' + area + '"' + (err ? ' disabled' : '') + '>' + dinero(costo) + '</button></div>';
    }).join('');
    return h + '</div>';
  }
  ac('agAcademia', function (v) {
    ui.area = null;
    if (v === 'avatar') { ui.panelAvatar = !ui.panelAvatar; U.modal(panelAcademia('avatar').replace('data-a="agCerrarPanel" data-v="avatar"', 'data-a="cerrarModal"')); return; }
    abrirPanel(+v, function () { return panelAcademia(v); });
  });
  ac('agArea', function (v, el) {
    ui.area = v;
    const k = el.getAttribute('data-k');
    if (k === 'avatar') U.modal(panelAcademia('avatar').replace('data-a="agCerrarPanel" data-v="avatar"', 'data-a="cerrarModal"'));
    else U.refrescarFicha(fichaTalento(+k));
  });
  ac('agEstudiar', function (v) {
    const p = v.split('|');
    const err = J.estudiar(p[0] === 'avatar' ? 'avatar' : +p[0], p[1], p[2]);
    if (err) { U.aviso(err, 'mal'); return; }
    ART.arte.sonido('exito');
    U.aviso(p[0] === 'avatar' ? 'Empiezas a estudiar' : 'Beca pagada: empieza a estudiar');
    U.renderBarra();
    if (p[0] === 'avatar') { U.cerrarModal(); U.refrescar(); } else cerrarPanel(+p[0]);
  });

  // Cambiar el aspecto del avatar (se ve en su retrato y en el de su talento)
  function formAspecto() {
    const av = N.S.avatar, a = Object.assign({}, U.comoRetrato({ id: 999999, nom: av.nom, sx: av.sx, nac: av.nac, of: 'produccion', reg: N.S.estudios[0].reg }).aspecto);
    return '<h2>Tu aspecto</h2><div class="fila" id="agAspVista" style="align-items:flex-start"><canvas class="retrato grande" data-retrato="999999"></canvas><div class="col crece">' +
      ART.arte.OPCIONES_ASPECTO.filter(function (x) { return !x[3] || x[3] === av.sx; }).map(function (x) {
        return '<label class="campo" style="margin:0"><span>' + x[1] + '</span><select data-c="agAsp" data-k="' + x[0] + '">' + x[2].map(function (n, i) { return '<option value="' + i + '"' + ((+a[x[0]] || 0) === i ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select></label>';
      }).join('') + '</div></div><button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>';
  }
  ac('agAspecto', function () { U.modal(formAspecto()); });
  ac('agAsp', function (v, el) {
    const av = N.S.avatar, k = el.getAttribute('data-k');
    const base = U.comoRetrato({ id: 999999, nom: av.nom, sx: av.sx, nac: av.nac, of: 'produccion', reg: N.S.estudios[0].reg }).aspecto;
    const a = Object.assign({}, base); a[k] = ['gafas', 'aretes', 'pecas'].indexOf(k) >= 0 ? +v === 1 : +v;
    av.asp = ART.juego.aspectoValido(a);
    U.dibujar(document.getElementById('agAspVista'));
    U.dibujar(document.getElementById('vista'));
  });
  return { talento: talento, fichaTalento: fichaTalento, filtros: ft };
})();
