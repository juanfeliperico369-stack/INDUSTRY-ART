/* ==== módulo: metas_ui ==== */
// Opciones de modo en la partida nueva (modo, reto, tutorial, personalizado y dificultades desbloqueables),
// tarjetas del Estudio (tutorial, consejos, década, misiones y reto), Mundo › Metas (logros, campaña, misiones,
// reto y resumen), Mundo › Editor (Sandbox y paquetes), créditos finales y música de fondo opcional.
IA.metasUI = (function () {
  'use strict';
  const N = IA.n, U = IA.ui, M = IA.metas, esc = N.esc;
  const dinero = U.dinero, ac = U.accion;
  const st = { ed: 'talento' };
  function btn(txt, a, v, cl, dis) { return '<button class="btn ' + (cl || '') + '" data-a="' + a + '" data-v="' + esc(v === undefined ? '' : v) + '"' + (dis ? ' disabled title="' + esc(dis) + '"' : '') + '>' + esc(txt) + '</button>'; }
  function barra(v) { return '<div class="barra-p"><i style="width:' + Math.round(N.limitar(v, 0, 1) * 100) + '%"></i></div>'; }
  // ---------- Desbloqueos (se guardan en este navegador) ----------
  function desbloqueos() { try { return JSON.parse(localStorage.getItem('ia_desbloqueos') || '{}'); } catch (e) { return {}; } }
  function desbloquear(id) { try { const d = desbloqueos(); d[id] = 1; localStorage.setItem('ia_desbloqueos', JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ } }
  function dificultadDisponible(d) { const u = desbloqueos(); return !d.bloqueo || u[d.id]; }
  // ---------- Partida nueva ----------
  function opcionesNueva(np) {
    const ops = function (l, v) { return l.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === v ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); };
    np.modoJuego = np.modoJuego || 'libre';
    let h = '<h3>Modo de juego</h3><label class="campo"><span>Modo</span><select data-c="mtNp" data-k="modoJuego">' + ops(M.MODOS.map(function (m) { return [m.id, m.nombre + ' · ' + m.texto]; }), np.modoJuego) + '</select></label>' +
      '<label class="campo"><span>Reto final</span><select data-c="mtNp" data-k="reto">' + ops([['', 'Sin reto']].concat(M.RETOS.map(function (r) { return [r.id, r.nombre + ' · ' + r.texto]; })), np.reto || (np.modoJuego === 'campana' ? 'legado' : '')) + '</select></label>' +
      '<label class="interruptor"><span>Tutorial (las secciones se abren de a poco)</span><input type="checkbox" data-c="mtNpB" data-k="tutorial"' + (np.tutorial ? ' checked' : '') + '></label>';
    if (np.modoJuego === 'personalizado') {
      const p = np.perso = np.perso || { dinero: 1, rivales: 0, eventos: 1 };
      h += '<div class="tarjeta"><label class="campo"><span>Dinero inicial ×' + p.dinero + '</span><input type="range" min="0.25" max="5" step="0.25" value="' + p.dinero + '" data-c="mtPerso" data-k="dinero"></label>' +
        '<label class="campo"><span>Fuerza de los rivales ' + (p.rivales > 0 ? '+' : '') + p.rivales + '</span><input type="range" min="-6" max="9" step="1" value="' + p.rivales + '" data-c="mtPerso" data-k="rivales"></label>' +
        '<label class="campo"><span>Eventos ×' + p.eventos + '</span><input type="range" min="0" max="3" step="0.5" value="' + p.eventos + '" data-c="mtPerso" data-k="eventos"></label></div>';
    }
    const d = IA.juego.DIFICULTADES.filter(function (x) { return x.id === np.dificultad; })[0];
    h += '<p class="nota">' + esc(M.HUMOR[np.dificultad] || '') + '</p>' + IA.juego.DIFICULTADES.filter(function (x) { return !dificultadDisponible(x); }).map(function (x) { return '<p class="tenue chico">🔒 ' + esc(x.nombre) + ': ' + esc(x.bloqueo) + '.</p>'; }).join('');
    return d ? h : h;
  }
  function dificultades() { return IA.juego.DIFICULTADES.filter(dificultadDisponible); }
  // ---------- Tarjetas del Estudio ----------
  function tarjetas() {
    if (!N.S) return '';
    const S = N.S, m = M.estado(), p = M.pasoTutorial();
    let h = '';
    if (p) h += '<div class="tarjeta oro"><b>Tutorial</b><p>' + esc(p.txt) + '</p>' + btn('Saltar el tutorial', 'mtSaltar') + '</div>';
    const c = M.consejos();
    if (c.length) h += '<div class="tarjeta"><b>Consejos del momento</b>' + c.map(function (x) { return '<p class="chico">💡 ' + esc(x) + '</p>'; }).join('') + '</div>';
    const abiertas = m.misiones.filter(function (x) { return !x.ok && !x.fallo; });
    if (m.dec || abiertas.length || m.reto) {
      h += '<div class="tarjeta"><b>Metas</b>';
      if (m.dec) h += '<p class="chico">Década de ' + m.dec.d + ': ' + m.dec.metas.filter(M.cumpleMeta).length + ' de ' + m.dec.metas.length + ' metas · legado ' + m.legado + '</p>';
      if (m.reto) { const r = M.RETOS.filter(function (x) { return x.id === m.reto; })[0]; h += '<p class="chico">Reto «' + esc(r.nombre) + '»: ' + Math.round(M.progresoReto(m.reto) * 100) + ' %</p>' + barra(M.progresoReto(m.reto)); }
      h += abiertas.map(function (x) { return '<p class="chico">✉ ' + esc(x.txt) + ' <span class="tenue">(hasta ' + esc(U.fechaCorta(x.hasta)) + ')</span></p>'; }).join('') + btn('Ver metas y logros', 'mtIrMetas') + '</div>';
    }
    return h;
  }
  ac('mtSaltar', function () { M.saltarTutorial(); U.render(); });
  ac('mtIrMetas', function () { U.irA('mundo', 'metas'); });
  // ---------- Mundo › Metas ----------
  function metas() {
    const S = N.S, m = M.estado(), mo = M.MODOS.filter(function (x) { return x.id === m.modo; })[0];
    let h = '<p class="nota">Modo ' + esc(mo.nombre) + ' · dificultad ' + esc(S.dificultad) + (S.sandbox ? ' · Editor Sandbox activo: los logros y los retos están apagados.' : '') + '</p>';
    if (m.reto) { const r = M.RETOS.filter(function (x) { return x.id === m.reto; })[0]; h += '<div class="tarjeta"><b>Reto final: ' + esc(r.nombre) + '</b><p class="chico">' + esc(r.texto) + '</p>' + barra(M.progresoReto(m.reto)) + (m.fin ? '<p class="oro">¡Cumplido!</p>' + btn('Ver los créditos', 'mtCreditos') : '') + '</div>'; }
    if (m.dec) h += '<h3>Campaña · década de ' + m.dec.d + ' (legado ' + m.legado + ')</h3>' + m.dec.metas.map(function (x) { return '<p>' + (M.cumpleMeta(x) ? '✔' : '○') + ' ' + esc(x.txt) + ' <span class="tenue chico">+' + x.pts + '</span></p>'; }).join('') +
      (m.decadas.length ? '<p class="tenue chico">' + m.decadas.map(function (d) { return d.d + ': ' + d.ok + '/' + d.de; }).join(' · ') + '</p>' : '');
    h += '<h3>Misiones</h3>' + (m.misiones.length ? m.misiones.slice().reverse().map(function (x) { return '<p class="chico">' + (x.ok ? '✔' : x.fallo ? '✖' : '✉') + ' ' + esc(x.txt) + ' <span class="tenue">· premio ' + dinero(x.premio) + ' · hasta ' + esc(U.fechaCorta(x.hasta)) + '</span></p>'; }).join('') : '<p class="tenue">Llegan por correo de vez en cuando.</p>');
    const n = Object.keys(m.logros).length;
    h += '<h3>Logros (' + n + ' de ' + M.LOGROS.length + ')</h3><div class="col">' + M.LOGROS.map(function (l) { const ok = m.logros[l[0]] !== undefined; return '<div class="cal-ev' + (ok ? '' : ' tenue') + '"><b>' + (ok ? '🏆' : '🔒') + '</b><div class="col crece"><span>' + esc(l[1]) + '</span><span class="tenue chico">' + esc(l[2]) + (ok ? ' · ' + esc(U.fechaCorta(m.logros[l[0]])) : '') + '</span></div></div>'; }).join('') + '</div>';
    h += btn('Resumen de la carrera', 'mtCreditos', '', 'bloque');
    return h;
  }
  function creditos() {
    const r = M.resumen();
    U.modal('<h2>' + esc(r.estudio) + '</h2><p class="tenue">' + r.desde + ' – ' + r.hasta + ' · dirigido por ' + esc(r.avatar) + '</p><div class="col">' +
      [['Obras estrenadas', r.obras], ['Mejor negocio', r.mejor ? '«' + r.mejor + '»' : '—'], ['Favorita de la crítica', r.critica ? '«' + r.critica + '»' : '—'], ['Premios en galas', r.premios], ['Legado', r.legado], ['Logros', r.logros + ' de ' + M.LOGROS.length], ['Patrimonio', dinero(r.patrimonio)], ['Fans', U.grande(r.fans)], ['Modo y dificultad', r.modo + ' · ' + r.dificultad]]
        .map(function (x) { return '<div class="fila entre"><span>' + esc(x[0]) + '</span><b>' + esc(String(x[1])) + '</b></div>'; }).join('') + '</div><p class="nota" style="text-align:center">Gracias por jugar INDUSTRY ART.</p>' +
      btn('Seguir jugando', 'cerrarModal', '', 'primario bloque'));
  }
  ac('mtCreditos', creditos);
  // Al ganar: créditos y desbloqueo de la dificultad siguiente
  N.on('victoria', function () {
    const d = N.S.dificultad;
    if (d === 'dificil') desbloquear('experto');
    if (d === 'experto') desbloquear('pesadilla');
    setTimeout(creditos, 0);
  });
  // ---------- Mundo › Editor ----------
  function editor() {
    const S = N.S;
    if (!S.sandbox) return '<div class="tarjeta"><b>Editor Sandbox</b><p>Cambia franquicias, obras, personajes, precios, talentos y estudios, e importa o exporta paquetes. Al activarlo se apagan los logros y los retos de esta partida.</p>' + btn('Activar el Editor', 'edActivar', '', 'primario') + '</div>' + paquetesUI();
    const tipos = [['talento', 'Talentos'], ['estudio', 'Estudios'], ['obra', 'Obras'], ['franquicia', 'Franquicias'], ['precio', 'Precios']];
    let h = '<div class="fila">' + tipos.map(function (x) { return '<button class="chip' + (st.ed === x[0] ? ' on' : '') + '" data-a="edTipo" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    const campo = function (tipo, id, k, v, num) { return '<input ' + (num ? 'type="number" step="any" ' : '') + 'value="' + esc(v) + '" data-c="edCampo" data-v="' + tipo + '|' + id + '|' + k + '" style="max-width:110px">'; };
    if (st.ed === 'talento') h += '<div class="col">' + S.talentos.filter(function (t) { return !t.mu && !t.ret; }).sort(function (a, b) { return b.fama - a.fama; }).slice(0, 25).map(function (t) { return '<div class="fila">' + campo('talento', t.id, 'nom', t.nom) + '<span class="tenue chico">' + esc(t.of) + '</span> hab ' + campo('talento', t.id, 'hab', t.hab, 1) + ' fama ' + campo('talento', t.id, 'fama', t.fama, 1) + '</div>'; }).join('') + '</div>' +
      '<div class="tarjeta"><b>Crear talento</b><label class="campo"><span>Nombre</span><input id="edTNom" maxlength="40"></label><label class="campo"><span>Oficio</span><select id="edTOf">' + IA.datos.oficios.map(function (o) { return '<option value="' + o.id + '">' + esc(o.nombre) + '</option>'; }).join('') + '</select></label>' + btn('Crear', 'edCrearT', '', 'primario') + '</div>';
    if (st.ed === 'estudio') h += '<div class="col">' + S.estudios.map(function (e) { return '<div class="fila">' + campo('estudio', e.id, 'nombre', e.nombre) + ' caja ' + campo('estudio', e.id, 'caja', Math.round(e.caja), 1) + ' calidad ' + campo('estudio', e.id, 'calidad', e.calidad || 0, 1) + '</div>'; }).join('') + '</div>';
    if (st.ed === 'obra') h += '<div class="col">' + S.obras.filter(function (o) { return o.pub !== undefined; }).slice(-25).reverse().map(function (o) { return '<div class="fila">' + campo('obra', o.id, 'tit', o.tit) + ' crít ' + campo('obra', o.id, 'crit', o.crit, 1) + ' púb ' + campo('obra', o.id, 'pub', o.pub, 1) + '</div>'; }).join('') + '</div>';
    if (st.ed === 'franquicia') h += '<div class="col">' + IA.franquicias.lista().slice(-20).map(function (f) { return '<div class="tarjeta"><div class="fila">' + campo('franquicia', f.id, 'nom', f.nom) + campo('franquicia', f.id, 'gen', f.gen) + '</div>' + f.pers.map(function (p) { return '<div class="fila"><input value="' + esc(p.n) + '" data-c="edPers" data-v="' + f.id + '|' + p.k + '|n"> pop <input type="number" value="' + p.pop + '" data-c="edPers" data-v="' + f.id + '|' + p.k + '|pop" style="max-width:70px"></div>'; }).join('') + '</div>'; }).join('') + '</div>';
    if (st.ed === 'franquicia') h += '<div class="tarjeta"><b>Agregar una franquicia u obra propia</b><p class="nota info">Queda como material para adaptar en Obras › Crear › Usar material, igual que el dominio público. Lo real que agregues vive solo en tu partida y en tus paquetes.</p>' +
      '<label class="campo"><span>Título</span><input id="edMTit" maxlength="60"></label><label class="campo"><span>Género principal</span><select id="edMGen">' + IA.datos.familias.reduce(function (a, f) { return a.concat(f.generos); }, []).sort().map(function (g) { return '<option>' + esc(g) + '</option>'; }).join('') + '</select></label>' +
      '<label class="campo"><span>Personajes (separados por coma, opcional)</span><input id="edMPers" maxlength="300"></label>' + btn('Agregar material', 'edMaterial', '', 'primario') +
      ((S.edit && S.edit.mat || []).length ? '<p class="chico">Tus materiales: ' + S.edit.mat.map(function (m) { return '«' + esc(m.tit) + '» (' + esc(m.gen.join(', ')) + ')'; }).join(' · ') + '</p>' : '') + '</div>';
    if (st.ed === 'precio') h += '<label class="campo"><span>Precio de la entrada ×' + ((S.edit && S.edit.precio) || 1) + '</span><input type="range" min="0.2" max="5" step="0.1" value="' + ((S.edit && S.edit.precio) || 1) + '" data-c="edCampo" data-v="precio|0|x"></label>';
    return h + paquetesUI();
  }
  function paquetesUI() {
    return '<h3>Paquetes</h3><p class="nota info">Un paquete guarda tus talentos creados, los nombres de los estudios, las franquicias, tus materiales propios y los precios. Copia el texto para compartirlo o pega uno para importarlo: las franquicias llegan como material para adaptar.</p>' +
      '<textarea id="edPaquete" rows="4" style="width:100%"></textarea><div class="fila">' + btn('Exportar', 'edExportar') + btn('Descargar archivo', 'edDescargar') + btn('Importar', 'edImportar', '', 'primario') + '</div>';
  }
  ac('edActivar', function () { M.activarSandbox(); U.refrescar(); });
  ac('edTipo', function (v) { st.ed = v; U.refrescar(); });
  ac('edCampo', function (v, el) { const p = el.getAttribute('data-v').split('|'); const e = M.editar(p[0], p[1], p[2], v); U.aviso(e || 'Guardado', e ? 'mal' : ''); if (p[0] === 'precio') U.refrescar(); });
  ac('edPers', function (v, el) { const p = el.getAttribute('data-v').split('|'); const e = M.personaje(p[0], p[1], p[2] === 'n' ? v : '', p[2] === 'pop' ? v : undefined); U.aviso(e || 'Guardado', e ? 'mal' : ''); });
  ac('edCrearT', function () { const e = M.crearTalento({ nom: document.getElementById('edTNom').value, of: document.getElementById('edTOf').value, edad: 30, pot: 70 }); U.aviso(e || 'Talento creado', e ? 'mal' : ''); U.refrescar(); });
  ac('edExportar', function () { document.getElementById('edPaquete').value = M.exportarPaquete(); });
  ac('edDescargar', function () { IA.publicacion.guardarArchivo('paquete_industry_art.json', M.exportarPaquete(), 'application/json').then(function (r) { if (!r.ok) U.aviso('No se pudo descargar: copia el texto.', 'mal'); }); });
  ac('edMaterial', function () {
    const e = M.agregarMaterial({ tit: document.getElementById('edMTit').value, gen: [document.getElementById('edMGen').value], pers: document.getElementById('edMPers').value.split(',') });
    U.aviso(e || 'Material agregado', e ? 'mal' : ''); if (!e) U.refrescar();
  });;
  ac('edImportar', function () { const e = M.importarPaquete(document.getElementById('edPaquete').value); U.aviso(e || 'Paquete importado', e ? 'mal' : ''); if (!e) U.refrescar(); });
  // ---------- Música de fondo (opcional, sintetizada) ----------
  let audio = null;
  function musica(on) {
    try {
      if (!on) { if (audio) { audio.ctx.close(); audio = null; } return; }
      if (audio) return;
      const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
      const ctx = new Ctx(), gan = ctx.createGain(); gan.gain.value = 0.035; gan.connect(ctx.destination);
      const acordes = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 294]];
      let i = 0;
      const tocar = function () {
        if (!audio) return;
        acordes[i % 4].forEach(function (f) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(1, ctx.currentTime + 1); g.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.8); o.connect(g); g.connect(gan); o.start(); o.stop(ctx.currentTime + 4); });
        i++; audio.tm = setTimeout(tocar, 4000);
      };
      audio = { ctx: ctx }; tocar();
    } catch (e) { audio = null; }
  }
  return { opcionesNueva: opcionesNueva, dificultades: dificultades, tarjetas: tarjetas, metas: metas, editor: editor, creditos: creditos, musica: musica, desbloquear: desbloquear };
})();
