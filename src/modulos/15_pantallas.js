/* ==== módulo: pantallas ==== */
// Las pantallas: portada, nueva partida, las cinco secciones, la creación de obra en modo rápido (4 a 6
// decisiones con "recomendado" y dado), el estreno, las fichas de obra y talento, ajustes y guardado.
// Una pantalla, una decisión principal; totales en vivo antes de confirmar; ayuda "i" en cada pantalla.
IA.pantallas = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, M = IA.mundo, O = IA.obras, T = IA.talentos, PR = IA.produccion;
  const L = IA.lanzamiento, NG = IA.negocio, J = IA.juego, U = IA.ui, t = IA.t, esc = N.esc;
  const dinero = U.dinero, icono = U.icono, est0 = function () { return N.S.estudios[0]; };
  const ac = U.accion;

  // ---------- Piezas ----------
  function titulo(texto, ayuda, extra) {
    return '<div class="titulo-sec"><h2>' + esc(texto) + '</h2><div class="fila">' + (extra || '') + (ayuda ? '<button class="ayuda-i" data-a="ayuda" data-v="' + ayuda + '" aria-label="' + t('ayuda') + '">i</button>' : '') + '</div></div>';
  }
  function kpi(nombre, valor, clase) { return '<div class="kpi"><span>' + esc(nombre) + '</span><b class="cifra ' + (clase || '') + '">' + valor + '</b></div>'; }
  function pestanas(sec, lista, actual) {
    return '<div class="pestanas" role="tablist">' + lista.map(function (p) {
      return '<button class="pestana' + (p[0] === actual ? ' on' : '') + '" role="tab" aria-selected="' + (p[0] === actual) + '" data-a="sub" data-s="' + sec + '" data-v="' + p[0] + '">' + esc(p[1]) + '</button>';
    }).join('') + '</div>';
  }
  function sub(sec, porDefecto) { return U.estado.sub[sec] || porDefecto; }
  function barraP(v) { return '<div class="barra-p" role="progressbar" aria-valuenow="' + Math.round(v * 100) + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + Math.round(N.limitar(v, 0, 1) * 100) + '%"></i></div>'; }
  function vacio(txt) { return '<div class="vacio">' + esc(txt || t('sin_obras')) + '</div>'; }
  function mult(o) { const m = O.multiplicador(o); return '×' + U.decimal(m, m < 10 ? 2 : 1); }
  function nombreEstudio(id) { const e = N.S.estudios[id]; return e ? e.nombre : ''; }
  function generosTxt(o) { return o.gen.join(' · '); }
  function textoNoticia(n) { return esc(n.texto).split('{$}').join(n.monto !== undefined ? dinero(n.monto, N.anio(n.t)) : ''); }

  // =====================================================================
  // PORTADA Y NUEVA PARTIDA
  // =====================================================================
  function portada() {
    return '<div class="portada"><canvas id="lienzoEstudio" class="estudio-lienzo" data-demo="1"></canvas>' +
      '<h1>' + t('juego') + '</h1><p class="tenue">' + t('subtitulo') + ' · ' + t('version', { v: IA.VERSION }) + '</p>' +
      '<button class="btn primario" data-a="continuar" id="btnContinuar" disabled>' + t('continuar') + '</button>' +
      '<button class="btn" data-a="nuevaPartida">' + t('nueva_partida') + '</button>' +
      '<button class="btn" data-a="abrirGuardado">' + t('cargar') + '</button>' +
      '<label class="btn">' + t('importar') + '<input type="file" accept=".iasave,application/json" data-c="importarArchivo" class="oculto"></label>' +
      '<button class="btn" data-a="abrirAjustes">' + t('ajustes') + '</button>' +
      '<p class="nota">' + t('creditos') + '</p><p class="nota">' + t('v15_aparte') + '</p></div>';
  }
  const np = { nombre: 'INDUSTRY ART', anio: 1900, pais: 'us', capital: 0, dificultad: 'normal', escenario: 'medio', semilla: '', avNombre: 'Felipe', avSexo: 'M', avEdad: 30, personalidad: 'Normal', logoN: 8,
    tipo: 'Estudio', vision: 'Alcance Comercial', publico: 'General', esp: ['produccion', 'direccion', 'guion'] };
  const NOMBRES_FUENTE = ['Georgia', 'Impact', 'Courier', 'Trebuchet', 'Palatino', 'Verdana', 'Tahoma', 'Times', 'Arial Black', 'Comic', 'Garamond', 'Brush Script', 'Lucida', 'Copperplate', 'Optima', 'Futura', 'Gill Sans', 'Rockwell', 'Didot', 'Baskerville'];
  function nuevaPartida() {
    const cap = np.capital || J.capitalRecomendado(np.anio);
    if (!U.estado.logoNuevo) U.estado.logoNuevo = { s: 8, c: 6, b: 14, t: 3, f: 1 };
    const tipico2025 = E.presupuestoTipico2025(np.anio);
    const ops = function (lista, actual) { return lista.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(actual) ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); };
    const anios = [1895, 1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026, 2040, 2060, 2080, 2100];
    if (anios.indexOf(np.anio) < 0) anios.push(np.anio);
    anios.sort(function (a, b) { return a - b; });
    const capOps = J.CAPITALES.map(function (c) {
      return [c, U.dinero(c, 2025).replace('−', '-') + (c === J.capitalRecomendado(np.anio) ? ' · ' + t('recomendado') : '')];
    });
    const paises = D.paises.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }).map(function (p) { return [p.id, p.nombre]; });
    const nTipicas = cap / tipico2025;
    const L = U.estado.logoNuevo;
    const num = function (k, max, nombres) { return '<label class="campo crece" style="min-width:96px"><span>' + esc({ s: 'Forma', c: 'Color', b: 'Fondo', t: 'Letras', f: 'Tipografía' }[k]) + '</span><select data-c="npLogo" data-k="' + k + '">' + ops(Array.from({ length: max }, function (_, i) { return [i, nombres ? nombres[i] : String(i + 1)]; }), L[k]) + '</select></label>'; };
    return '<div class="portada" style="text-align:left">' + titulo(t('np_titulo'), 'nueva') +
      '<canvas id="lienzoEstudio" class="estudio-lienzo" style="height:200px" role="img" aria-label="Vista previa de la fachada"></canvas>' +
      '<div class="fila" style="margin-top:8px"><canvas data-logo="nuevo" style="width:64px;height:64px"></canvas><button class="btn" data-a="otroLogo">' + icono('dado') + t('np_logo_otro') + '</button></div>' +
      '<div class="fila envolver">' + num('s', 20) + num('c', 20) + num('b', 20) + num('t', 20) + num('f', 20, NOMBRES_FUENTE) + '</div>' +
      '<label class="campo"><span>' + t('np_nombre') + '</span><input type="text" maxlength="40" value="' + esc(np.nombre) + '" data-i="npNombre" data-k="nombre"></label>' +
      '<label class="campo"><span>' + t('np_anio') + '</span><select data-c="npAnio">' + ops(anios.map(function (a) { return [a, a + ' · ' + M.tecnologia(a).nombre]; }), np.anio) + '</select>' +
      '<input type="number" min="' + J.ANIO_MIN + '" max="' + J.ANIO_MAX + '" value="' + np.anio + '" data-c="npAnio" aria-label="Otro año" style="margin-top:6px"><span class="nota">' + t('np_anio_ayuda') + '</span></label>' +
      '<label class="campo"><span>Tipo de industria</span><select data-c="np" data-k="industria">' + D.industrias.map(function (x) { return '<option value="' + x.id + '"' + (x.id === 'Cine' ? ' selected' : ' disabled') + '>' + x.id + (x.id === 'Cine' ? '' : ' (llega en la ' + x.desde + ')') + '</option>'; }).join('') + '</select></label>' +
      '<label class="campo"><span>Tipo de estudio</span><select data-c="np" data-k="tipo">' + ops(D.tiposEstudio.map(function (x) { return [x, x]; }), np.tipo) + '</select></label>' +
      '<label class="campo"><span>Visión de la industria</span><select data-c="np" data-k="vision">' + ops(D.visiones.map(function (x) { return [x.id, x.id + ' · ' + x.efecto]; }), np.vision) + '</select></label>' +
      '<label class="campo"><span>Público objetivo</span><select data-c="np" data-k="publico">' + ops(D.publicos.map(function (x) { return [x.id, x.id + ' · ' + x.efecto]; }), np.publico) + '</select></label>' +
      '<label class="campo"><span>' + t('np_pais') + '</span><select data-c="np" data-k="pais">' + ops(paises, np.pais) + '</select></label>' +
      '<label class="campo"><span>' + t('np_capital') + '</span><select data-c="npCapital">' + ops(capOps, cap) + '</select><span class="nota">' +
      t('np_capital_ayuda', { epoca: esc(U.dinero(M.aEpoca(cap, np.anio)).replace(/^\$/, '$')), anio: np.anio, n: U.decimal(nTipicas, nTipicas < 10 ? 1 : 0) }) + '</span></label>' +
      '<label class="campo"><span>' + t('np_dificultad') + '</span><select data-c="np" data-k="dificultad">' + ops(J.DIFICULTADES.map(function (d) { return [d.id, d.nombre]; }), np.dificultad) + '</select></label>' +
      '<label class="campo"><span>' + t('np_escenario') + '</span><select data-c="np" data-k="escenario">' + ops([['medio', t('escenario_medio')], ['alto', t('escenario_alto')], ['bajo', t('escenario_bajo')]], np.escenario) + '</select></label>' +
      '<h3>' + t('np_avatar') + '</h3>' +
      '<label class="campo"><span>' + t('np_tu_nombre') + '</span><input type="text" maxlength="30" value="' + esc(np.avNombre) + '" data-i="np" data-k="avNombre"></label>' +
      '<div class="fila"><label class="campo crece"><span>' + t('np_sexo') + '</span><select data-c="np" data-k="avSexo">' + ops([['F', t('mujer')], ['M', t('hombre')]], np.avSexo) + '</select></label>' +
      '<label class="campo crece"><span>' + t('np_edad') + '</span><input type="number" min="16" max="80" value="' + np.avEdad + '" data-i="np" data-k="avEdad"></label></div>' +
      '<label class="campo"><span>' + t('np_personalidad') + '</span><select data-c="np" data-k="personalidad">' + ops(D.personalidades.map(function (p) { return [p.id, p.id]; }), np.personalidad) + '</select></label>' +
      '<span class="nota">Tus tres especialidades (+1 en esos departamentos de tus obras):</span><div class="fila envolver">' + [0, 1, 2].map(function (i) {
        return '<label class="campo crece"><span>Especialidad ' + (i + 1) + '</span><select data-c="npEsp" data-k="' + i + '">' + ops(D.oficios.map(function (o) { return [o.id, o.nombre]; }), np.esp[i]) + '</select></label>';
      }).join('') + '</div>' +
      '<label class="campo"><span>' + t('np_semilla') + '</span><input type="text" maxlength="24" value="' + esc(np.semilla) + '" data-i="np" data-k="semilla" placeholder="' + t('dado') + '"><span class="nota">' + t('np_semilla_ayuda') + '</span></label>' +
      '<button class="btn primario bloque" data-a="empezar">' + t('np_empezar') + '</button><p></p><button class="btn bloque" data-a="volverPortada">' + t('volver') + '</button></div>';
  }
  ac('nuevaPartida', function () { U.estado.np = true; cacheT = -1; document.getElementById('vista').innerHTML = nuevaPartida(); U.dibujar(document.getElementById('vista')); alMostrar('nueva'); });
  ac('volverPortada', function () { U.estado.np = false; U.render(); });
  ac('otroLogo', function () {
    np.logoN = (np.logoN * 7 + 13) % 997;
    U.estado.logoNuevo = IA.arte.logoAleatorio(np.logoN);
    cacheT = -1;
    U.acciones.nuevaPartida();
  });
  ac('np', function (v, el) { np[el.getAttribute('data-k')] = v; });
  ac('npNombre', function (v) { np.nombre = v; cacheT = -1; });
  ac('npLogo', function (v, el) { U.estado.logoNuevo = Object.assign({}, U.estado.logoNuevo); U.estado.logoNuevo[el.getAttribute('data-k')] = +v; U.dibujar(document.getElementById('vista')); cacheT = -1; });
  ac('npEsp', function (v, el) { np.esp[+el.getAttribute('data-k')] = v; });
  ac('npAnio', function (v) {
    const a = Math.round(+v);
    if (!isFinite(a)) return;
    np.anio = N.limitar(a, J.ANIO_MIN, J.ANIO_MAX); np.capital = 0; cacheT = -1;
    const y = document.getElementById('vista').scrollTop;
    U.acciones.nuevaPartida();
    document.getElementById('vista').scrollTop = y;
  });
  ac('npCapital', function (v) { np.capital = +v; U.acciones.nuevaPartida(); });
  ac('empezar', function () {
    const edad = N.limitar(Math.round(+np.avEdad || 30), 16, 80);
    J.nuevaPartida({
      semilla: (np.semilla || '').trim() || String(Date.now() % 1e9), anio: np.anio, nombre: (np.nombre || '').trim() || 'INDUSTRY ART',
      logo: U.estado.logoNuevo, pais: np.pais, capital: np.capital || J.capitalRecomendado(np.anio), dificultad: np.dificultad,
      escenario: np.escenario, personalidad: np.personalidad, creado: new Date().toISOString(),
      tipo: np.tipo, vision: np.vision, publico: np.publico,
      avatar: { nombre: (np.avNombre || '').trim() || 'Felipe', sexo: np.avSexo, edad: edad, especialidades: np.esp },
    });
    U.estado.np = false;
    U.estado.seccion = 'estudio';
    U.render();
    IA.arte.sonido('exito');
    U.modal('<h2>' + esc(N.S.estudios[0].nombre) + '</h2><p>' + t('ayuda_inicio') + '</p><button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
  });

  // =====================================================================
  // ESTUDIO (inicio)
  // =====================================================================
  function tareas() {
    const S = N.S, est = est0(), out = [];
    O.delEstudio(0, ['lista']).filter(function (o) { return !o.prog; }).forEach(function (o) {
      out.push({ txt: t('tarea_lista', { t: o.tit }), btn: t('programar'), a: 'programar', v: o.id, imp: 1 });
    });
    if (S.semanasEnRojo > 0) out.push({ txt: t('tarea_rojo', { n: S.semanasEnRojo }), mal: 1, imp: 1 });
    const libres = NG.capacidad(0) - O.enProduccion(0).length;
    if (libres > 0) out.push({ txt: t('tarea_capacidad') + ' (' + libres + ')', btn: t('crear_obra'), a: 'crearObra' });
    const semPremios = (D.premios.semana - N.semana() + 52) % 52;
    if (semPremios > 0 && semPremios <= 4) out.push({ txt: t('tarea_premios', { n: semPremios }) });
    if (NG.cajaLibre(0) > E.presupuestoTipico(N.anio()) * 6 && est.pisos.length < D.MAX_PISOS) out.push({ txt: t('tarea_construir'), btn: t('construir'), a: 'irNegocio' });
    return out;
  }
  function proximasFechas() {
    const S = N.S, lista = [];
    O.activas().forEach(function (o) {
      if (o.et === 'lista' && o.prog && o.fe >= S.t) lista.push({ t: o.fe, txt: (o.est === 0 ? '★ ' : '') + '«' + o.tit + '» · ' + nombreEstudio(o.est), propio: o.est === 0 });
    });
    lista.sort(function (a, b) { return a.t - b.t || b.propio - a.propio; });
    const fechas = lista.filter(function (x) { return x.propio; }).slice(0, 4).concat(lista.filter(function (x) { return !x.propio; }).slice(0, 4));
    const semP = (D.premios.semana - N.semana() + 52) % 52;
    fechas.push({ t: S.t + semP, txt: D.premios.nombre });
    fechas.push({ t: S.t + (52 - (N.semana() - 1)), txt: 'Fin de año ' + N.anio() });
    fechas.sort(function (a, b) { return a.t - b.t; });
    return fechas.slice(0, 8);
  }
  function estudio() {
    const S = N.S, est = est0();
    const cuota = NG.cuotaAnioActual(0);
    const enMarcha = O.enProduccion(0).length;
    const tl = tareas();
    const fechas = proximasFechas();
    return titulo(est.nombre, 'estudio') +
      '<canvas id="lienzoEstudio" class="estudio-lienzo" role="img" aria-label="Tu estudio"></canvas>' +
      '<div class="dos" style="margin-top:10px"><div>' +
      '<div class="tarjeta"><h3>' + t('est_tareas') + '</h3>' + (tl.length ? tl.map(function (x) {
        return '<div class="fila entre" style="padding:6px 0;border-bottom:1px solid var(--borde)"><span class="' + (x.mal ? 'mal' : '') + '">' + esc(x.txt) + '</span>' + (x.btn ? '<button class="btn' + (x.imp ? ' primario' : '') + '" data-a="' + x.a + '" data-v="' + (x.v || '') + '">' + esc(x.btn) + '</button>' : '') + '</div>';
      }).join('') : '<p class="tenue">' + t('est_sin_tareas') + '</p>') + '</div>' +
      calendarioCorto() +
      '<div class="tarjeta"><h3>' + t('est_fechas') + '</h3>' + fechas.map(function (f) {
        const n = f.t - S.t;
        return '<div class="fila entre" style="padding:4px 0"><span>' + esc(f.txt) + '</span><span class="etiqueta">' + (n <= 0 ? t('esta_semana') : t('faltan', { n: n })) + '</span></div>';
      }).join('') + '</div></div><div>' +
      '<div class="tarjeta"><h3>' + t('est_resumen') + '</h3><div class="kpis">' +
      kpi(t('caja'), dinero(est.caja), est.caja < 0 ? 'mal' : '') +
      kpi(t('caja_libre'), dinero(NG.cajaLibre(0))) +
      kpi(t('est_capacidad'), enMarcha + ' / ' + NG.capacidad(0)) +
      kpi(t('est_cuota'), U.pct(cuota)) +
      kpi(t('est_fama'), Math.round(est.fama * 100) + ' / 100') +
      kpi(t('est_clase'), est.clase || 'C') +
      kpi('Típico de la época', dinero(E.presupuestoTipico(N.anio()))) +
      kpi('Entrada de cine', dinero(M.precioEntrada('nam', N.anio()))) +
      '</div></div>' +
      '<div class="tarjeta"><h3>' + t('mun_periodico') + '</h3>' + S.noticias.slice(0, 5).map(function (n) {
        return '<p style="margin:6px 0"><span class="tenue chico">' + esc(U.fechaCorta(n.t)) + '</span><br>' + (n.imp ? '<b>' : '') + textoNoticia(n) + (n.imp ? '</b>' : '') + '</p>';
      }).join('') + '</div></div></div>';
  }
  // Calendario de escritorio: las próximas 8 semanas con tus estrenos, los rivales y los premios
  function calendarioCorto() {
    const S = N.S;
    let h = '<div class="tarjeta"><h3>' + t('mun_calendario') + '</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
    for (let k = 0; k < 8; k++) {
      const tt = S.t + k, sem = N.semana(tt);
      const propios = O.activas().filter(function (o) { return o.prog && o.fe === tt && o.est === 0; }).length;
      const rivales = O.activas().filter(function (o) { return o.prog && o.fe === tt && o.est !== 0; }).length;
      const fiesta = M.fechaDeSemana(sem);
      h += '<div class="kpi" style="padding:6px"><span>S' + sem + ' · ' + esc(M.nombreMes(N.mes(tt)).slice(0, 3)) + '</span>' +
        (propios ? '<b class="oro">' + icono('estrella') + ' ' + propios + '</b>' : '') + (rivales ? '<span>' + rivales + ' rival' + (rivales > 1 ? 'es' : '') + '</span>' : '') +
        (sem === D.premios.semana ? '<span class="oro">Premios</span>' : '') + (fiesta ? '<span>' + esc(fiesta) + '</span>' : '') + '</div>';
    }
    return h + '</div></div>';
  }
  // Datos que el arte necesita para dibujar el edificio
  function datosEstudio() {
    const S = N.S;
    if (!S && U.estado.np) return { anio: np.anio, semana: 22, nombre: (np.nombre || 'INDUSTRY ART').slice(0, 40), logo: U.estado.logoNuevo || { s: 8, c: 6, b: 14, t: 3, f: 1 }, pisos: [{ tipo: 'oficinas', actividad: 1, etiqueta: '' }, { tipo: 'plato', actividad: 1, etiqueta: '' }], terrenos: [{ tipo: 'vacio', lado: 'izq' }], rodajes: [] };
    if (!S) return { anio: 1930, semana: 20, nombre: 'INDUSTRY ART', logo: { s: 8, c: 6, b: 14, t: 3, f: 1 }, pisos: ['oficinas', 'guion', 'plato', 'edicion', 'sonido'].map(function (p) { return { tipo: p, actividad: 1, etiqueta: '' }; }), terrenos: [{ tipo: 'backlot', lado: 'izq' }, { tipo: 'vacio', lado: 'der' }], rodajes: [{ titulo: 'INDUSTRY ART', progreso: 0.6 }] };
    const est = est0();
    const prods = O.enProduccion(0);
    const activo = function (tipo) {
      if (tipo === 'oficinas') return 1;
      if (tipo === 'guion') return prods.some(function (o) { return o.et === 'desarrollo'; }) ? 1 : 0.2;
      if (tipo === 'plato') return prods.some(function (o) { return o.et === 'rodaje' || o.et === 'preproduccion'; }) ? 1 : 0.2;
      if (tipo === 'edicion' || tipo === 'sonido' || tipo === 'efectos') return prods.some(function (o) { return o.et === 'posproduccion'; }) ? 1 : 0.25;
      if (tipo === 'marketing') return O.delEstudio(0, ['lista', 'cartelera']).length ? 1 : 0.2;
      return 0.6;
    };
    return {
      anio: N.anio(), semana: N.semana(), nombre: est.nombre, logo: est.logo,
      pisos: est.pisos.map(function (p) { const i = NG.infoPiso(p); return { tipo: p, actividad: activo(p), etiqueta: i ? i.nombre : p }; }),
      terrenos: est.terrenos.map(function (p, i) { return { tipo: p, lado: i % 2 ? 'der' : 'izq' }; }).concat(est.terrenos.length < D.MAX_TERRENOS ? [{ tipo: 'vacio', lado: est.terrenos.length % 2 ? 'der' : 'izq' }] : []),
      rodajes: prods.filter(function (o) { return o.et === 'rodaje' || o.et === 'preproduccion'; }).map(function (o) { return { titulo: o.tit, progreso: PR.progreso(o) }; }),
    };
  }
  // Animación del edificio (unos 30 cuadros por segundo, solo si se ve)
  let anim = null, ultimoCuadro = 0, cacheDatos = null, cacheT = -1;
  function animar(ts) {
    anim = requestAnimationFrame(animar);
    if (document.hidden || ts - ultimoCuadro < 33) return;
    ultimoCuadro = ts;
    const cv = document.getElementById('lienzoEstudio');
    if (!cv) return;
    const d = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    const tt = N.S ? N.S.t : -2;
    if (!cacheDatos || cacheT !== tt) { cacheDatos = datosEstudio(); cacheT = tt; }
    IA.arte.estudio(c, w, h, ts, cacheDatos);
  }
  function alMostrar(sec) {
    cacheT = -1;
    if (!anim) anim = requestAnimationFrame(animar);
    if (sec === 'portada') {
      IA.guardado.masReciente().then(function (r) {
        const b = document.getElementById('btnContinuar');
        if (!b) return;
        if (r) { b.disabled = false; b.setAttribute('data-v', r.ranura); b.textContent = t('continuar') + ' · ' + r.meta.nombre + ' (' + r.meta.anio + ')'; }
        else b.classList.add('oculto');
      });
    }
  }
  ac('irNegocio', function () { U.irA('negocio', 'estudio'); });

  // =====================================================================
  // OBRAS
  // =====================================================================
  function tarjetaObra(o, extra) {
    return '<div class="tarjeta toque" data-a="verObra" data-v="' + o.id + '"><canvas class="poster" data-poster="' + o.id + '"></canvas><div class="col crece">' +
      '<b>' + esc(o.tit) + '</b><span class="tenue chico">' + esc(generosTxt(o)) + ' · ' + esc(o.clas) + (o.est !== 0 ? ' · ' + esc(nombreEstudio(o.est)) : '') + '</span>' + (extra || '') + '</div></div>';
  }
  function obras() {
    const s = sub('obras', 'marcha');
    const marcha = O.enProduccion(0), listas = O.delEstudio(0, ['lista']), cart = O.delEstudio(0, ['cartelera']);
    let h = titulo(t('sec_obras'), 'obras', '<button class="btn primario" data-a="crearObra">' + icono('mas') + t('crear_obra') + '</button>') +
      pestanas('obras', [['marcha', t('obras_marcha') + ' (' + marcha.length + ')'], ['listas', t('obras_listas') + ' (' + listas.length + ')'], ['cartelera', t('obras_cartelera') + ' (' + cart.length + ')'], ['catalogo', t('obras_catalogo')]], s);
    h += '<div class="lista-obras">';
    if (s === 'marcha') {
      h += marcha.length ? marcha.map(function (o) {
        return tarjetaObra(o, '<span>' + O.NOMBRE_ETAPA[o.et] + ' · ' + t('faltan', { n: PR.semanasRestantes(o) }) + '</span>' + barraP(PR.progreso(o)) + '<span class="tenue chico">' + t('costo') + ': ' + dinero(O.costoTotal(o)) + '</span>');
      }).join('') : vacio();
      h += '<p class="nota">' + t('est_capacidad') + ': ' + marcha.length + ' / ' + NG.capacidad(0) + '</p>';
    } else if (s === 'listas') {
      h += listas.length ? listas.map(function (o) {
        return tarjetaObra(o, o.prog ? '<span class="etiqueta oro">Estreno: ' + esc(U.fechaCorta(o.fe)) + '</span>' : '<button class="btn primario" data-a="programar" data-v="' + o.id + '">' + t('programar') + '</button>');
      }).join('') : vacio();
    } else if (s === 'cartelera') {
      h += cart.length ? cart.map(function (o) {
        const ult = o.hs && o.hs.length ? o.hs[o.hs.length - 1] : 0;
        return tarjetaObra(o, '<span>' + t('bruto') + ': <b>' + dinero(o.bruto) + '</b> · última semana ' + dinero(ult) + '</span><span class="tenue chico">' + t('semanas_cartelera') + ': ' + o.sc + ' · ' + t('critica') + ' ' + o.crit + ' · ' + t('publico') + ' ' + o.pub + '</span>');
      }).join('') : vacio();
    } else {
      const cat = N.S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada'; }).sort(function (a, b) { return b.fe - a.fe; });
      h += cat.length ? '<div class="rejilla">' + cat.slice(0, 120).map(function (o) {
        const m = O.multiplicador(o);
        return '<button class="tarjeta toque" style="text-align:left;display:block" data-a="verObra" data-v="' + o.id + '"><canvas class="poster" style="width:100%;height:auto;aspect-ratio:2/3" data-poster="' + o.id + '"></canvas><b>' + esc(o.tit) + '</b><br><span class="tenue chico">' + o.anio + '</span> <span class="etiqueta ' + (m >= 2.5 ? 'bien' : m < 1.4 ? 'mal' : '') + '">' + mult(o) + '</span>' + ((o.aw || []).length ? ' <span class="etiqueta oro">' + o.aw.length + ' premio' + (o.aw.length > 1 ? 's' : '') + '</span>' : '') + '</button>';
      }).join('') + '</div>' : vacio();
    }
    return h + '</div>';
  }

  // ---------- Ficha de obra ----------
  function fichaObra(id) {
    const o = O.porId(id);
    if (!o) return '';
    const est = N.S.estudios[o.est];
    const estrenada = o.et === 'cartelera' || o.et === 'terminada';
    let h = '<div class="fila" style="align-items:flex-start"><canvas class="poster grande" data-poster="' + o.id + '"></canvas><div class="col crece">' +
      '<h2>' + esc(o.tit) + '</h2><span>' + esc(generosTxt(o)) + '</span><span class="tenue">' + esc(o.clas) + ' · ' + esc(o.tono || '') + '</span>' +
      '<span class="tenue">' + esc(est ? est.nombre : '') + (o.anio ? ' · ' + o.anio : '') + '</span><span class="etiqueta">' + O.NOMBRE_ETAPA[o.et] + '</span>' +
      ((o.aw || []).length ? '<span class="etiqueta oro">' + o.aw.map(function (a) { return D.premios.categorias.filter(function (c) { return c.id === a; })[0].nombre; }).join(', ') + '</span>' : '') + '</div></div>';
    if (o.est === 0 && O.ETAPAS.indexOf(o.et) < 4) h += '<p>' + t('progreso') + ': ' + O.NOMBRE_ETAPA[o.et] + ' · ' + t('faltan', { n: PR.semanasRestantes(o) }) + '</p>' + barraP(PR.progreso(o));
    if (o.est === 0 && o.et === 'lista' && !o.prog) h += '<p><button class="btn primario bloque" data-a="programar" data-v="' + o.id + '">' + t('programar') + '</button></p>';
    if (o.et === 'lista' && o.prog) h += '<p class="oro">Estreno: ' + esc(U.fecha(o.fe)) + ' · ' + D.nivelesMarketing[o.nivM].nombre + '</p>';
    const vis = o.est === 0 || estrenada;
    if (vis) {
      h += '<div class="kpis" style="margin:10px 0">' + kpi(t('costo_total'), dinero(O.costoTotal(o), o.anio || N.anio())) +
        (estrenada ? kpi(t('bruto'), dinero(o.bruto, o.anio)) + kpi(t('parte_estudio'), dinero(o.parte, o.anio)) + kpi(t('neto'), dinero(O.neto(o), o.anio), O.neto(o) >= 0 ? 'bien' : 'mal') +
          kpi(t('multiplicador'), mult(o)) + kpi(t('entradas'), U.grande(o.ent || 0)) + kpi(t('critica'), o.crit) + kpi(t('publico'), o.pub) +
          (o.con !== undefined ? kpi(t('conocimiento'), U.pct(o.con, 0)) : '') + kpi(t('semanas_cartelera'), o.sc || 0) : '') + '</div>';
    }
    if (o.hs && o.hs.length) {
      const id2 = U.grafica('obra' + o.id, function (cv) { IA.arte.barras(cv, o.hs, o.hs.map(function (_, i) { return String(i + 1); }), { formato: function (v) { return dinero(v, o.anio); } }); });
      h += '<h3>' + t('bruto') + ' por semana</h3><canvas class="lienzo" data-grafica="' + id2 + '"></canvas>';
    }
    if (o.inf) h += '<h3>' + t('informe') + '</h3><ul>' + o.inf.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    if (o.est === 0 && o.et !== 'terminada' && o.et !== 'cartelera') {
      h += '<div class="kpis">' + kpi(t('costo_talento'), dinero(o.cf)) + kpi(t('costo_produccion'), dinero(o.pp * (o.sobre || 1))) + kpi('Gastado en producción', dinero(o.gp || 0)) + '</div>';
    }
    if (o.eq) {
      const fam = D.familia(o.fam || 'DR');
      const bonos = NG.bonos(o.est, o.fam);
      const deps = Object.keys(fam.pesos);
      const valores = deps.map(function (dep) {
        const ids = dep === 'interprete' ? o.eq.int : [o.eq[dep]];
        let s = 0, n = 0;
        ids.forEach(function (id) { const ta = T.porId(id); if (ta) { s += ta.hab; n++; } });
        return Math.min(100, (n ? s / n : 35) + (bonos[dep] || 0));
      });
      const gr = U.grafica('radar' + o.id, function (cv) { IA.arte.radar(cv, valores, deps.map(function (d) { return D.oficio(d).dep; })); });
      h += '<h3>Departamentos</h3><canvas class="lienzo" style="height:220px" data-grafica="' + gr + '"></canvas><p class="nota">Lo que más pesa en ' + esc(fam.nombre.toLowerCase()) + ': ' + deps.slice().sort(function (a, b) { return fam.pesos[b] - fam.pesos[a]; }).slice(0, 3).map(function (d) { return D.oficio(d).dep.toLowerCase(); }).join(', ') + '.</p>';
    }
    h += '<h3>' + t('paso_equipo') + '</h3>';
    if (o.cr && o.cr.ejecutiva) h += '<p class="tenue">Producción ejecutiva: ' + esc(o.cr.ejecutiva) + '</p>';
    if (o.eq) {
      h += '<div class="col">' + O.ROLES.concat(['int0', 'int1']).map(function (r) {
        const id = r === 'int0' ? o.eq.int[0] : r === 'int1' ? o.eq.int[1] : o.eq[r];
        const ta = T.porId(id);
        const nombre = ta ? ta.nom : '';
        if (!nombre) return '';
        const of = r.indexOf('int') === 0 ? 'Intérprete' : D.oficio(r).nombre;
        return '<button class="tarjeta toque fila" data-a="verTalento" data-v="' + id + '"><canvas class="retrato" data-retrato="' + id + '"></canvas><div class="col"><b>' + esc(nombre) + '</b><span class="tenue chico">' + esc(of) + (ta ? ' · ' + t('tal_habilidad').toLowerCase() + ' ' + Math.round(ta.hab) : '') + '</span></div></button>';
      }).join('') + '</div>';
    } else if (o.cr) {
      h += '<p>Dirección: ' + esc(o.cr.direccion || '') + '<br>Reparto: ' + esc((o.cr.reparto || []).join(', ')) + '</p>';
    }
    return h;
  }
  ac('verObra', function (v) { U.abrirFicha(fichaObra(+v), 'obra:' + v); });

  // ---------- Crear obra (modo rápido) ----------
  const cr = { b: null, paso: 0, rol: null };
  const PASOS = ['paso_generos', 'paso_tono', 'paso_escala', 'paso_equipo', 'paso_titulo'];
  function nuevoBorrador(gen) {
    const b = O.borrador(0, { gen: gen || [recomendarGenero()], escala: 2 });
    O.equipoRecomendado(b, 1);
    return b;
  }
  function recomendarGenero() {
    const S = N.S;
    let mejor = 'DR', v = -9;
    D.ORDEN_FAM.forEach(function (f) {
      const x = (S.mundo.tendencias[f] || 0) + (E.pronosticoSemana(N.semana(S.t + 25), f) - 1) + (f === 'AV' ? -0.4 : 0);
      if (x > v) { v = x; mejor = f; }
    });
    const fam = D.familia(mejor);
    return fam.generos.filter(function (g) { return g !== 'Erótico'; })[N.hash(S.t + mejor) % fam.generos.filter(function (g) { return g !== 'Erótico'; }).length];
  }
  // Rehace los datos que dependen de géneros y escala, sin perder el equipo
  function ajustarBorrador(b) {
    b.fam = D.familiaDe[b.gen[0]] || 'DR';
    const disp = O.clasificacionesDisponibles(N.anio(), b.gen);
    if (disp.indexOf(b.clas) < 0) b.clas = O.clasificacionRecomendada(b.gen, N.anio());
    b.pp = Math.round(E.produccionTipica(N.anio(), b.fam) * D.escalas[b.esc].mult * O.escalaTono(b.tono));
  }
  function estrellasEncaje(b) {
    const fams = E.familiasDe(b);
    if (fams.length < 2) return '';
    let txt = '', desconocido = false;
    for (let i = 0; i < fams.length; i++) for (let j = i + 1; j < fams.length; j++) {
      if (!N.S.encajeVisto[fams[i] + fams[j]]) desconocido = true;
    }
    if (desconocido) return '<span class="tenue">' + t('encaje_desconocido') + '</span>';
    const e = E.encajeObra(b);
    txt = e >= 3 ? '★★★' : e >= 1 ? '★★' : e === 0 ? '★' : '☆';
    return t('encaje') + ': <span class="encaje">' + txt + '</span>';
  }
  function pieTotales(b) {
    const est = O.estimar(b, NG.bonos(0, b.fam));
    const libre = NG.cajaLibre(0);
    return '<div class="tarjeta totales" style="position:sticky;bottom:0;margin-top:12px;padding:8px 10px">' +
      '<div class="fila entre"><span>' + t('costo_total') + ' <b class="cifra ' + (est.total > libre ? 'mal' : '') + '">' + dinero(est.total) + '</b></span><span>' + t('calidad_esperada') + ' <b>' + Math.max(1, est.calidad - 6) + '–' + Math.min(99, est.calidad + 6) + '</b></span></div>' +
      '<div class="nota" style="margin:2px 0 0">' + t('costo_talento') + ' ' + dinero(est.talento) + ' · ' + t('costo_produccion') + ' ' + dinero(est.produccion) + ' · marketing ~' + dinero(est.marketing) + ' · ' + t('caja_libre') + ' ' + dinero(libre) + ' · ' + O.semanasTotales(b, NG.rapidez(0)) + ' ' + t('semanas') + '</div></div>';
  }
  function fichaCrear() {
    const b = cr.b;
    if (!b) return '';
    const pasos = '<p class="nota">' + PASOS.map(function (p, i) { return '<span class="' + (i === cr.paso ? 'paso-actual' : '') + '">' + (i + 1) + '. ' + t(p) + '</span>'; }).join(' · ') + '</p>';
    let h = '<h2>' + t('crear_obra') + '</h2>' + pasos;
    if (cr.paso === 0) {
      h += '<p class="nota">' + t('generos_ayuda') + '</p><div class="fila envolver" style="margin-bottom:8px"><button class="btn" data-a="crGenRec">' + icono('varita') + t('recomendado') + '</button><button class="btn" data-a="crGenDado">' + icono('dado') + t('dado') + '</button><span>' + estrellasEncaje(b) + '</span></div>';
      D.familias.forEach(function (f) {
        const tend = N.S.mundo.tendencias[f.id] || 0;
        h += '<h3 style="margin-top:10px">' + esc(f.nombre) + ' <span class="chico ' + (tend > 0.2 ? 'bien' : tend < -0.2 ? 'mal' : 'tenue') + '">' + (tend > 0.2 ? 'en alza' : tend < -0.2 ? 'en baja' : 'estable') + '</span></h3><div class="chips">' +
          f.generos.map(function (g) {
            const on = b.gen.indexOf(g) >= 0;
            const prueba = on ? null : b.gen.concat([g]);
            const bloqueado = !on && (b.gen.length >= 3 || O.validarGeneros(prueba));
            return '<button class="chip' + (on ? ' on' : '') + '" data-a="crGen" data-v="' + esc(g) + '"' + (bloqueado ? ' disabled' : '') + ' aria-pressed="' + on + '">' + esc(g) + '</button>';
          }).join('') + '</div><p class="nota">' + esc(f.temporada) + ' · costo ' + (f.costo >= 1.3 ? 'alto' : f.costo <= 0.6 ? 'bajo' : 'medio') + ' · inclina a ' + (f.inclina === 'pub' ? 'el público' : f.inclina === 'crit' ? 'la crítica' : 'ambos') + '</p>';
      });
    } else if (cr.paso === 1) {
      h += '<h3>' + t('tono') + '</h3><div class="chips">' + D.tonos.map(function (x) {
        return '<button class="chip' + (b.tono === x.id ? ' on' : '') + '" data-a="crTono" data-v="' + x.id + '">' + x.id + '</button>';
      }).join('') + '</div>';
      const to = D.tonos.filter(function (x) { return x.id === b.tono; })[0];
      h += '<p class="nota">Crítica ' + (to.crit >= 0 ? '+' : '') + to.crit + ' · Público ' + (to.pub >= 0 ? '+' : '') + to.pub + (to.costo ? ' · producción +15 %' : '') + '</p>';
      const disp = O.clasificacionesDisponibles(N.anio(), b.gen), rec = O.clasificacionRecomendada(b.gen, N.anio());
      h += '<h3>' + t('clasificacion') + '</h3><div class="chips">' + D.clasificaciones.map(function (c) {
        const ok = disp.indexOf(c.id) >= 0;
        return '<button class="chip' + (b.clas === c.id ? ' on' : '') + '" data-a="crClas" data-v="' + c.id + '"' + (ok ? '' : ' disabled') + '>' + c.id + (c.id === rec ? ' ★' : '') + '</button>';
      }).join('') + '</div>';
      const cl = D.clasificacion(b.clas);
      const acc = E.accesoClasificacion(Object.assign({}, b), N.S.estudios[0].reg, N.anio());
      h += '<p class="nota">' + esc(cl.desc) + '. Público que puede verla en tu región: ' + Math.round(Math.min(1.5, acc) * 100) + ' % de lo normal.' + (N.anio() < D.ANIO_CLASIFICACION_POR_EDADES ? ' Antes de 1968 la censura de la época no deja estrenar NC-17, 18, R ni X.' : '') + '</p>';
    } else if (cr.paso === 2) {
      h += '<p class="nota">' + t('escala_ayuda') + '</p>' + D.escalas.map(function (es, i) {
        const pp = E.produccionTipica(N.anio(), b.fam) * es.mult * O.escalaTono(b.tono);
        return '<button class="tarjeta toque fila entre" style="width:100%;' + (b.esc === i ? 'border-color:var(--acento);border-width:2px' : '') + '" data-a="crEscala" data-v="' + i + '"><b>' + es.nombre + '</b><span>' + dinero(pp) + '</span></button>';
      }).join('');
    } else if (cr.paso === 3) {
      h += '<p class="nota">' + t('equipo_ayuda') + '</p><button class="btn" data-a="crEquipoRec">' + icono('varita') + t('recomendado') + '</button>';
      const filas = O.ROLES.map(function (r) { return [r, b.eq[r], D.oficio(r).nombre]; }).concat([['int0', b.eq.int[0], 'Protagonista'], ['int1', b.eq.int[1], 'Coprotagonista']]);
      h += filas.map(function (f) {
        const ta = T.porId(f[1]);
        return '<div class="tarjeta fila"><canvas class="retrato" data-retrato="' + (ta ? ta.id : '') + '"></canvas><div class="col crece"><span class="tenue chico">' + esc(f[2]) + '</span><b>' + (ta ? esc(ta.nom) : '—') + '</b>' +
          (ta ? '<span class="chico">' + t('tal_habilidad') + ' ' + Math.round(ta.hab) + ' · ' + t('tal_fama') + ' ' + Math.round(ta.fama * 100) + ' · ' + dinero(T.tarifa(ta)) + '</span>' : '') + '</div><button class="btn" data-a="crRol" data-v="' + f[0] + '">Cambiar</button></div>';
      }).join('');
      if (cr.rol) h += listaCandidatos(cr.rol);
    } else {
      h += '<label class="campo"><span>' + t('titulo_obra') + '</span><input type="text" maxlength="48" value="' + esc(b.tit) + '" data-i="crTitulo"></label><button class="btn" data-a="crOtroTitulo">' + icono('dado') + t('otro_titulo') + '</button>' +
        '<div class="tarjeta" style="margin-top:10px"><b>' + esc(b.tit) + '</b><br>' + esc(generosTxt(b)) + ' · ' + esc(b.tono) + ' · ' + esc(b.clas) + ' · ' + D.escalas[b.esc].nombre + '<br><span class="tenue">' + estrellasEncaje(b) + '</span></div>';
      const err = J.puedeIniciar(b);
      if (err) h += '<p class="mal">' + esc(err) + '</p>';
    }
    h += pieTotales(b);
    h += '<div class="fila entre" style="margin-top:8px">' + (cr.paso > 0 ? '<button class="btn" data-a="crPaso" data-v="-1">' + t('atras') + '</button>' : '<span></span>') +
      (cr.paso < PASOS.length - 1 ? '<button class="btn primario" data-a="crPaso" data-v="1">' + t('siguiente') + '</button>' : '<button class="btn primario" data-a="crIniciar">' + t('iniciar') + '</button>') + '</div>';
    return h;
  }
  function listaCandidatos(rol) {
    const b = cr.b;
    const of = rol.indexOf('int') === 0 ? 'interprete' : rol;
    const usados = O.idsEquipo(b);
    const lista = T.disponibles(of).filter(function (x) { return usados.indexOf(x.id) < 0; })
      .sort(function (a, c) { return (c.hab + c.fama * 12) - (a.hab + a.fama * 12); }).slice(0, 30);
    return '<div class="tarjeta"><h3>Elige: ' + esc(rol.indexOf('int') === 0 ? 'Intérprete' : D.oficio(rol).nombre) + '</h3>' + (lista.length ? lista.map(function (x) {
      return '<button class="fila tarjeta toque" style="width:100%" data-a="crElegir" data-v="' + x.id + '"><canvas class="retrato" data-retrato="' + x.id + '"></canvas><div class="col crece" style="text-align:left"><b>' + esc(x.nom) + '</b><span class="chico">' + (N.anio() - x.nac) + ' años · ' + t('tal_habilidad') + ' ' + Math.round(x.hab) + ' · ' + t('tal_fama') + ' ' + Math.round(x.fama * 100) + (x.rasgo ? ' · ' + esc(x.rasgo) : '') + '</span></div><b>' + dinero(T.tarifa(x)) + '</b></button>';
    }).join('') : '<p class="tenue">No hay nadie disponible.</p>') + '</div>';
  }
  function refrescarCrear() { if (cr.b) U.refrescarFicha(fichaCrear()); }
  ac('crearObra', function () {
    if (O.enProduccion(0).length >= NG.capacidad(0)) { U.aviso('No tienes capacidad libre: construye un plató o espera.', 'mal'); return; }
    cr.b = nuevoBorrador(); cr.paso = 0; cr.rol = null;
    U.abrirFicha(fichaCrear(), 'crear');
  });
  ac('crGen', function (g) { if (!cr.b) return;
    const b = cr.b, i = b.gen.indexOf(g);
    if (i >= 0) { if (b.gen.length > 1) b.gen.splice(i, 1); } else if (b.gen.length < 3) b.gen.push(g);
    ajustarBorrador(b); refrescarCrear();
  });
  ac('crGenRec', function () { if (!cr.b) return;
    const b = cr.b, g1 = recomendarGenero();
    const f1 = D.familiaDe[g1];
    const buena = D.ORDEN_FAM.filter(function (f) { return D.encaje(f1, f) >= 3; })[0];
    b.gen = [g1];
    if (buena) { const g2 = D.familia(buena).generos.filter(function (g) { return g !== 'Erótico'; })[0]; if (!O.validarGeneros([g1, g2])) b.gen.push(g2); }
    ajustarBorrador(b); refrescarCrear();
  });
  ac('crGenDado', function () { if (!cr.b) return;
    const b = cr.b;
    const todos = [];
    D.familias.forEach(function (f) { f.generos.forEach(function (g) { todos.push(g); }); });
    const k = 1 + (N.hash('d' + Date.now()) % 2);
    const gen = [];
    for (let i = 0; i < 20 && gen.length < k; i++) {
      const g = todos[N.hash(i + '|' + Date.now()) % todos.length];
      if (gen.indexOf(g) < 0 && !O.validarGeneros(gen.concat([g]))) gen.push(g);
    }
    b.gen = gen.length ? gen : ['Drama'];
    ajustarBorrador(b); refrescarCrear();
  });
  ac('crTono', function (v) { if (!cr.b) return; cr.b.tono = v; ajustarBorrador(cr.b); refrescarCrear(); });
  ac('crClas', function (v) { if (!cr.b) return; cr.b.clas = v; refrescarCrear(); });
  ac('crEscala', function (v) { if (!cr.b) return; cr.b.esc = +v; ajustarBorrador(cr.b); refrescarCrear(); });
  ac('crEquipoRec', function () { if (!cr.b) return; cr.b.eq = { int: [] }; O.equipoRecomendado(cr.b, 1); cr.rol = null; refrescarCrear(); });
  ac('crRol', function (v) { if (!cr.b) return; cr.rol = cr.rol === v ? null : v; refrescarCrear(); });
  ac('crElegir', function (v) { if (!cr.b) return;
    const b = cr.b, id = +v;
    if (cr.rol === 'int0') b.eq.int[0] = id; else if (cr.rol === 'int1') b.eq.int[1] = id; else b.eq[cr.rol] = id;
    b.eq.int = b.eq.int.filter(function (x) { return x !== undefined && x !== null; });
    cr.rol = null; refrescarCrear();
  });
  ac('crTitulo', function (v) { if (!cr.b) return; cr.b.tit = v.slice(0, 48); });
  ac('crOtroTitulo', function () { if (!cr.b) return; cr.b.tit = O.tituloNuevo(cr.b.gen); refrescarCrear(); });
  ac('crPaso', function (v) { if (!cr.b) return; cr.paso = N.limitar(cr.paso + (+v), 0, PASOS.length - 1); cr.rol = null; refrescarCrear(); });
  ac('crIniciar', function () { if (!cr.b) return;
    const b = cr.b;
    b.tit = (b.tit || '').trim() || O.tituloNuevo(b.gen);
    const r = J.iniciarObra(b);
    if (r.error) { U.aviso(r.error, 'mal'); refrescarCrear(); return; }
    IA.arte.sonido('exito');
    U.cerrarFicha();
    U.aviso('«' + r.obra.tit + '» empieza su desarrollo');
    U.estado.sub.obras = 'marcha';
    U.refrescar();
  });

  // ---------- Programar estreno ----------
  const pg = { id: 0, t: 0, nivM: 2 };
  function fichaProgramar() {
    const o = O.porId(pg.id);
    if (!o) return '';
    const S = N.S;
    let mejor = L.mejorSemana(o, S.t + 1, S.t + 12);
    if (!pg.t) pg.t = mejor;
    let h = '<h2>' + t('programar') + '</h2><div class="fila"><canvas class="poster" data-poster="' + o.id + '"></canvas><div class="col"><b>' + esc(o.tit) + '</b><span class="tenue">' + esc(generosTxt(o)) + '</span><span class="nota">' + t('estreno_ayuda') + '</span></div></div>';
    h += '<h3>' + t('estreno_semana') + '</h3><div class="col">';
    for (let k = 1; k <= 12; k++) {
      const tt = S.t + k;
      const temp = E.pronosticoSemana(N.semana(tt), o.fam);
      const comp = L.competenciaPrevista(tt, o.id);
      const fiesta = M.fechaDeSemana(N.semana(tt));
      h += '<button class="tarjeta toque fila entre" style="width:100%;margin:0;' + (pg.t === tt ? 'border-color:var(--acento);border-width:2px' : '') + '" data-a="pgSemana" data-v="' + tt + '"><span>' + esc(U.fechaCorta(tt)) + (fiesta ? ' · ' + esc(fiesta) : '') + (tt === mejor ? ' <span class="etiqueta oro">mejor</span>' : '') + '</span>' +
        '<span class="chico">' + t('temporada') + ' ×' + U.decimal(temp, 2) + ' · ' + t('competencia') + ' ' + U.decimal(comp, 1) + '</span></button>';
    }
    h += '</div><h3>' + t('marketing') + '</h3><p class="nota">' + t('marketing_ayuda') + '</p><div class="col">';
    const fe = E.famaEstrellas(o, T.porId), fam = N.S.estudios[0].fama;
    D.nivelesMarketing.forEach(function (n, i) {
      const cm = E.marketingTipico(N.anio()) * n.mult;
      const con = E.conocimiento({ cm: cm }, N.anio(), fam, fe, NG.bonoMarketing(0));
      h += '<button class="tarjeta toque fila entre" style="width:100%;margin:0;' + (pg.nivM === i ? 'border-color:var(--acento);border-width:2px' : '') + '" data-a="pgMarketing" data-v="' + i + '"><b>' + n.nombre + '</b><span class="chico">' + dinero(cm) + ' · llega a ' + Math.round(con * 100) + ' %</span></button>';
    });
    const canales = E.canalesDe(N.anio()).map(function (c) { return c.nombre; }).join(', ');
    h += '</div><p class="nota">Canales de la época: ' + esc(canales) + '.</p>';
    h += '<button class="btn primario bloque" data-a="pgConfirmar">' + t('confirmar') + ' · ' + dinero(E.marketingTipico(N.anio()) * D.nivelesMarketing[pg.nivM].mult) + '</button>';
    return h;
  }
  ac('programar', function (v) { pg.id = +v; pg.t = 0; pg.nivM = 2; U.abrirFicha(fichaProgramar(), 'programar'); });
  ac('pgSemana', function (v) { pg.t = +v; U.refrescarFicha(fichaProgramar()); });
  ac('pgMarketing', function (v) { pg.nivM = +v; U.refrescarFicha(fichaProgramar()); });
  ac('pgConfirmar', function () {
    const o = O.porId(pg.id);
    const err = J.programarEstreno(o, pg.t, pg.nivM);
    if (err) { U.aviso(err, 'mal'); return; }
    IA.arte.sonido('dinero');
    U.cerrarFicha();
    U.aviso('Estreno programado: ' + U.fechaCorta(pg.t));
    U.refrescar();
  });

  // =====================================================================
  // TALENTO
  // =====================================================================
  const ft = { of: '', disp: true, q: '', n: 40 };
  function talento() {
    const S = N.S, av = S.avatar;
    let h = titulo(t('sec_talento'), 'talento');
    h += '<div class="tarjeta fila"><canvas class="retrato grande" data-retrato="999999"></canvas><div class="col"><span class="tenue chico">' + t('tu_avatar') + '</span><h3>' + esc(av.nom) + '</h3><span>' + (N.anio() - av.nac) + ' años · ' + esc(est0().personalidad) + '</span><span>Especialidades: ' + esc((av.esp || []).map(function (x) { return D.oficio(x).nombre; }).join(', ')) + ' (+1 en tus obras)</span><span class="nota">La vida ligera, la carrera como talento y los herederos llegan en la V29.</span></div></div>';
    h += '<div class="chips" style="margin:8px 0"><button class="chip' + (!ft.of ? ' on' : '') + '" data-a="ftOficio" data-v="">' + t('todos') + '</button>' + D.oficios.map(function (o) {
      return '<button class="chip' + (ft.of === o.id ? ' on' : '') + '" data-a="ftOficio" data-v="' + o.id + '">' + esc(o.nombre) + '</button>';
    }).join('') + '</div>';
    h += '<div class="fila"><input type="search" placeholder="' + t('tal_buscar') + '" value="' + esc(ft.q) + '" data-c="ftBuscar" style="flex:1"><label class="fila" style="min-height:44px"><input type="checkbox" data-c="ftDisp"' + (ft.disp ? ' checked' : '') + '>' + t('tal_disponibles') + '</label></div>';
    const q = ft.q.toLowerCase();
    const lista = S.talentos.filter(function (x) {
      return !x.ret && (!ft.of || x.of === ft.of) && (!ft.disp || x.ocup < S.t) && (!q || x.nom.toLowerCase().indexOf(q) >= 0);
    }).sort(function (a, b) { return (b.hab + b.fama * 12) - (a.hab + a.fama * 12); });
    h += '<p class="nota">' + lista.length + ' talentos</p><div class="col">' + lista.slice(0, ft.n).map(function (x) {
      return '<button class="tarjeta toque fila" style="width:100%;text-align:left" data-a="verTalento" data-v="' + x.id + '"><canvas class="retrato" data-retrato="' + x.id + '"></canvas><div class="col crece"><b>' + esc(x.nom) + '</b><span class="chico">' + esc(D.oficio(x.of).nombre) + ' · ' + (N.anio() - x.nac) + ' años · ' + esc(D.pais(x.pais).nombre) + '</span>' +
        '<span class="chico">' + t('tal_habilidad') + ' ' + Math.round(x.hab) + ' · ' + t('tal_fama') + ' ' + Math.round(x.fama * 100) + (x.ocup >= S.t ? ' · <span class="tenue">ocupado</span>' : '') + '</span></div><b class="cifra">' + dinero(T.tarifa(x)) + '</b></button>';
    }).join('') + '</div>' + (lista.length > ft.n ? '<button class="btn bloque" data-a="ftMas">' + t('ver') + ' más</button>' : '');
    return h;
  }
  ac('ftOficio', function (v) { ft.of = v; ft.n = 40; U.renderVista(); });
  ac('ftBuscar', function (v) { ft.q = v; ft.n = 40; U.renderVista(); });
  ac('ftDisp', function (v) { ft.disp = !!v; U.renderVista(); });
  ac('ftMas', function () { ft.n += 40; U.renderVista(true); });
  function fichaTalento(id) {
    const x = T.porId(id);
    if (!x) return '<p class="tenue">Este talento ya no está en el mundo.</p>';
    const S = N.S, r = D.rasgos[x.rasgo];
    const obrasDe = S.obras.filter(function (o) { return o.eq && (O.idsEquipo(o).indexOf(id) >= 0); }).slice(-12).reverse();
    return '<div class="fila"><canvas class="retrato grande" data-retrato="' + x.id + '"></canvas><div class="col"><h2>' + esc(x.nom) + '</h2><span>' + esc(D.oficio(x.of).nombre) + '</span><span class="tenue">' + (N.anio() - x.nac) + ' años · ' + esc(D.pais(x.pais).nombre) + ' · ' + (x.sx === 'F' ? t('mujer') : t('hombre')) + '</span></div></div>' +
      '<div class="kpis" style="margin:10px 0">' + kpi(t('tal_habilidad'), Math.round(x.hab)) + kpi(t('tal_fama'), Math.round(x.fama * 100)) + kpi(t('tal_tarifa'), dinero(T.tarifa(x))) +
      kpi(t('tal_obras'), x.obras) + kpi(t('tal_premios'), x.premios) + kpi('Estado', x.ret ? t('retirado') : x.ocup >= S.t ? U.fechaCorta(x.ocup) : t('tal_disponible')) + '</div>' +
      (x.rasgo ? '<p>' + t('tal_rasgo') + ': <b>' + esc(x.rasgo) + '</b> <span class="tenue chico">(calidad ' + (r[0] >= 0 ? '+' : '') + r[0] + ', sobrecosto ' + Math.round(r[1] * 100) + ' %, tarifa ×' + U.decimal(r[2], 2) + ')</span></p>' : '') +
      '<p class="nota">La tarifa sale del mercado: habilidad, fama, demanda y época. Nunca del presupuesto de tu obra.</p>' +
      (obrasDe.length ? '<h3>' + t('tal_obras') + '</h3>' + obrasDe.map(function (o) { return '<p style="margin:4px 0">«' + esc(o.tit) + '» · ' + esc(nombreEstudio(o.est)) + ' · ' + (o.anio || O.NOMBRE_ETAPA[o.et]) + '</p>'; }).join('') : '');
  }
  ac('verTalento', function (v) { U.abrirFicha(fichaTalento(+v), 'talento:' + v); });

  // =====================================================================
  // MUNDO
  // =====================================================================
  function mundo() {
    const s = sub('mundo', 'cartelera');
    let h = titulo(t('sec_mundo'), 'mundo') + pestanas('mundo', [['cartelera', t('mun_cartelera')], ['calendario', t('mun_calendario')], ['premios', t('mun_premios')], ['rivales', t('mun_rivales')], ['periodico', t('mun_periodico')], ['tendencias', t('mun_tendencias')], ['poblacion', t('mun_poblacion')], ['mapa', 'Mapa']], s);
    return h + ({ cartelera: mCartelera, calendario: mCalendario, premios: mPremios, rivales: mRivales, periodico: mPeriodico, tendencias: mTendencias, poblacion: mPoblacion, mapa: mMapa }[s] || mCartelera)();
  }
  function mCartelera() {
    const S = N.S, sem = S.mercado.semana;
    const cart = O.enCartelera().slice().sort(function (a, b) { return (b.hs[b.hs.length - 1] || 0) - (a.hs[a.hs.length - 1] || 0); });
    let h = '<p class="nota">Cartelera de la semana pasada en todo el mundo. Compiten tus obras, las de los rivales y las de otras productoras.</p>';
    if (sem) h += '<div class="kpis">' + kpi('Taquilla mundial', dinero(sem.bruto)) + kpi(t('otras_productoras'), dinero(sem.otras)) + kpi('Tu parte', U.pct(sem.bruto ? (sem.porEstudio[0] || 0) / sem.bruto : 0)) + kpi('En cartelera', cart.length) + '</div>';
    h += '<div class="desliza"><table class="tabla"><tr><th>#</th><th>Obra</th><th class="n">Semana</th><th class="n">Total</th><th class="n">Sem.</th></tr>' + cart.slice(0, 15).map(function (o, i) {
      return '<tr' + (o.est === 0 ? ' class="oro"' : '') + ' data-a="verObra" data-v="' + o.id + '" style="cursor:pointer"><td>' + (i + 1) + '</td><td><b>' + esc(o.tit) + '</b><br><span class="tenue chico">' + esc(nombreEstudio(o.est)) + ' · ' + esc(o.gen[0]) + '</span></td><td class="n">' + dinero(o.hs[o.hs.length - 1] || 0) + '</td><td class="n">' + dinero(o.bruto) + '</td><td class="n">' + o.sc + '</td></tr>';
    }).join('') + '</table></div>';
    return h;
  }
  function mCalendario() {
    const S = N.S;
    let h = '<p class="nota">Próximas 16 semanas: estrenos anunciados, fechas especiales y temporada.</p>';
    for (let k = 0; k < 16; k++) {
      const tt = S.t + k, sem = N.semana(tt);
      const est = O.activas().filter(function (o) { return o.et === 'lista' && o.prog && o.fe === tt; });
      const fiesta = M.fechaDeSemana(sem);
      h += '<div class="tarjeta"><div class="fila entre"><b>' + esc(U.fechaCorta(tt)) + '</b><span class="chico">' + t('temporada') + ' ×' + U.decimal(M.temporada('nam', sem), 2) + (fiesta ? ' · ' + esc(fiesta) : '') + (sem === D.premios.semana ? ' · ' + D.premios.nombre : '') + '</span></div>' +
        (est.length ? est.map(function (o) { return '<div class="' + (o.est === 0 ? 'oro' : '') + '">«' + esc(o.tit) + '» · ' + esc(nombreEstudio(o.est)) + ' · ' + esc(o.gen[0]) + '</div>'; }).join('') : '<span class="tenue chico">Sin estrenos anunciados</span>') + '</div>';
    }
    return h;
  }
  function mPremios() {
    const S = N.S, ult = S.premios[S.premios.length - 1];
    const pj = IA.premios.parteJugador();
    let h = '<p class="nota">' + D.premios.nombre + ' (versión básica; la completa, con festivales, jurados y ceremonias, llega en la V22). Cada año, en la semana ' + D.premios.semana + ', premian las películas del año anterior de todos los estudios.</p>';
    h += '<div class="kpis">' + kpi('Premios tuyos', pj.jugador + ' de ' + pj.total) + kpi('Tu parte', U.pct(pj.parte)) + '</div>';
    if (!ult) return h + vacio('Todavía no hay ceremonias.');
    h += '<h3>' + D.premios.nombre + ' ' + (ult.anio + 1) + ' · películas de ' + ult.anio + '</h3>';
    ult.categorias.forEach(function (c) {
      h += '<div class="tarjeta"><b>' + esc(c.nombre) + '</b><p class="' + (c.ganador.est === 0 ? 'oro' : '') + '" style="margin:4px 0">«' + esc(c.ganador.titulo) + '»' + (c.ganador.quien ? ' · ' + esc(c.ganador.quien) : '') + ' · ' + esc(nombreEstudio(c.ganador.est)) + '</p>' +
        '<span class="tenue chico">Nominados: ' + c.nominados.slice(1).map(function (n) { return '«' + esc(n.titulo) + '»' + (n.quien ? ' (' + esc(n.quien) + ')' : ''); }).join(', ') + '</span></div>';
    });
    return h;
  }
  function mRivales() {
    const S = N.S, m = S.mercado, ult = m.hist[m.hist.length - 1];
    let h = '<p class="nota">Estudios rivales con obras de verdad en la misma cartelera. Estrategias, compras y quiebras llegan en la V26.</p><div class="desliza"><table class="tabla"><tr><th>Estudio</th><th class="n">Cuota ' + N.anio() + '</th><th class="n">Cuota ' + (ult ? ult.anio : '') + '</th><th class="n">En marcha</th><th class="n">Fama</th></tr>';
    const filas = S.estudios.map(function (e) {
      const prev = ult ? ult.ranking.filter(function (r) { return r.id === e.id; })[0] : null;
      return { e: e, ahora: NG.cuotaAnioActual(e.id), antes: prev && ult.total ? prev.bruto / ult.total : 0 };
    }).sort(function (a, b) { return b.antes - a.antes || b.ahora - a.ahora; });
    h += filas.map(function (f) {
      return '<tr' + (f.e.id === 0 ? ' class="oro"' : '') + '><td><div class="fila"><canvas data-logo="' + f.e.id + '" style="width:30px;height:30px"></canvas><div><b>' + esc(f.e.nombre) + '</b><br><span class="tenue chico">' + esc(D.pais(f.e.pais).nombre) + (f.e.familia ? ' · ' + esc(D.familia(f.e.familia).nombre) : '') + '</span></div></div></td><td class="n">' + U.pct(f.ahora) + '</td><td class="n">' + U.pct(f.antes) + '</td><td class="n">' + O.enProduccion(f.e.id).length + '</td><td class="n">' + Math.round(f.e.fama * 100) + '</td></tr>';
    }).join('');
    h += '<tr><td>' + t('otras_productoras') + '</td><td class="n">' + U.pct(m.anio.total ? m.anio.otras / m.anio.total : 0) + '</td><td class="n">' + U.pct(ult && ult.total ? ult.otras / ult.total : 0) + '</td><td></td><td></td></tr></table></div>';
    return h;
  }
  function mPeriodico() {
    const S = N.S;
    const medio = N.anio() < 1920 ? 'Diario impreso' : N.anio() < 1950 ? 'Diario y radio' : N.anio() < 1995 ? 'Noticiero de TV' : N.anio() < 2006 ? 'Portal web' : 'Redes y noticias en línea';
    return '<p class="nota">' + esc(medio) + ' · ' + esc(M.era(N.anio())) + '</p>' + (S.noticias.length ? S.noticias.slice(0, 80).map(function (n) {
      return '<div class="tarjeta"><span class="tenue chico">' + esc(U.fecha(n.t)) + '</span><br>' + (n.imp ? '<b>' : '') + textoNoticia(n) + (n.imp ? '</b>' : '') + '</div>';
    }).join('') : vacio(t('nada_nuevo')));
  }
  function mTendencias() {
    const S = N.S;
    return '<p class="nota">Las familias de géneros suben y bajan en olas; si todos estrenan lo mismo, el público se cansa.</p>' + D.familias.map(function (f) {
      const v = S.mundo.tendencias[f.id] || 0;
      const w = Math.round(Math.abs(v) * 50);
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(f.nombre) + '</b><span class="' + (v > 0.2 ? 'bien' : v < -0.2 ? 'mal' : 'tenue') + '">' + (v > 0.2 ? 'en alza' : v < -0.2 ? 'en baja' : 'estable') + ' (' + (v >= 0 ? '+' : '') + U.decimal(v, 2) + ')</span></div>' +
        '<div class="barra-p" style="position:relative"><i style="position:absolute;left:' + (v >= 0 ? 50 : 50 - w) + '%;width:' + w + '%;background:' + (v >= 0 ? 'var(--bien)' : 'var(--mal)') + '"></i></div><span class="nota">' + esc(f.generos.join(', ')) + '</span></div>';
    }).join('');
  }
  // Mapa del mundo: cada país con su público de cine; tu sede en dorado y las de los rivales en rosa
  function mMapa() {
    const anio = N.anio(), da = E.datosAnio(anio), S = N.S;
    const sedes = {};
    S.estudios.forEach(function (e) { sedes[e.pais] = sedes[e.pais] || []; sedes[e.pais].push(e); });
    const filas = D.paises.map(function (p) {
      const pub = da.regiones[p.region].publico * p.peso;
      return { p: p, pub: pub, pob: M.poblacion(p.region, anio) * p.peso };
    });
    const max = Math.max.apply(null, filas.map(function (f) { return f.pub; }).concat([1]));
    const css = getComputedStyle(document.documentElement);
    const g = U.grafica('mapa', function (cv) {
      IA.arte.mapa(cv, D.continentes, filas.map(function (f) {
        const s = sedes[f.p.id];
        const propia = s && s.some(function (e) { return e.id === 0; });
        return { lon: f.p.lon, lat: f.p.lat, r: f.pub / max, color: propia ? css.getPropertyValue('--dorado').trim() : s ? css.getPropertyValue('--rosa').trim() : css.getPropertyValue('--acento').trim(), destacado: !!s, etiqueta: propia ? f.p.nombre : '' };
      }));
    });
    let h = '<p class="nota">El tamaño de cada círculo es su público de cine en ' + anio + '. <span class="oro">Dorado</span>: tu sede · <span class="rosa">Rosa</span>: sedes rivales. Sedes en otros países y cines propios llegan en la V28.</p>' +
      '<canvas class="lienzo" style="height:auto;aspect-ratio:2/1" data-grafica="' + g + '"></canvas>';
    h += '<div class="desliza"><table class="tabla"><tr><th>País</th><th class="n">Población</th><th class="n">Entradas/año</th><th class="n">Costo de rodaje</th><th>Sede de</th></tr>' + filas.sort(function (a, b) { return b.pub - a.pub; }).map(function (f) {
      return '<tr><td>' + esc(f.p.nombre) + '<br><span class="tenue chico">' + esc(f.p.idioma) + '</span></td><td class="n">' + U.grande(f.pob) + '</td><td class="n">' + U.grande(f.pub) + '</td><td class="n">×' + U.decimal(f.p.costo, 2) + '</td><td>' + esc((sedes[f.p.id] || []).map(function (e) { return e.nombre; }).join(', ')) + '</td></tr>';
    }).join('') + '</table></div><p class="nota">Población y entradas por país son aproximadas: salen de su región y de su peso en ella.</p>';
    return h;
  }
  function mPoblacion() {
    const anio = N.anio(), da = E.datosAnio(anio);
    let h = '<div class="kpis">' + kpi('Población mundial', U.grande(M.poblacionMundial(anio))) + kpi('Entradas posibles al año', U.grande(da.entradas)) +
      kpi('Mercado del cine al año', dinero(M.aEpoca(da.mercado2025, anio))) + kpi('Inflación del año', U.pct(M.inflacionAnual(anio))) + '</div>';
    h += '<h3>Acceso por medio</h3><div class="desliza"><table class="tabla"><tr><th>Región</th><th class="n">Cine</th><th class="n">Radio</th><th class="n">TV</th><th class="n">Internet</th><th class="n">Consolas</th></tr>' + D.regiones.map(function (r) {
      return '<tr><td>' + esc(r.nombre) + '</td>' + ['cine', 'radio', 'tv', 'internet', 'consolas'].map(function (m) { return '<td class="n">' + U.pct(M.accesoMedio(m, r.id, anio), 0) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table></div><p class="nota">Radio, TV, internet y consolas compiten con el cine por el tiempo libre; en la V24, la V30 y la V31 serán mercados propios.</p>';
    h += '<p class="nota">$1 de ' + anio + ' equivale a ' + U.dinero(M.aHoy(1, anio) * 1, 2025).replace('$', '$') + ' de hoy (IPC de EE. UU.). Público = Población × Acceso × Frecuencia.</p>';
    h += '<div class="desliza"><table class="tabla"><tr><th>Región</th><th class="n">Población</th><th class="n">Acceso al cine</th><th class="n">Entradas/año</th><th class="n">Precio</th></tr>' + D.regiones.map(function (r) {
      return '<tr><td>' + esc(r.nombre) + '</td><td class="n">' + U.grande(M.poblacion(r.id, anio)) + '</td><td class="n">' + U.pct(M.accesoCine(r.id, anio), 0) + '</td><td class="n">' + U.grande(da.regiones[r.id].publico) + '</td><td class="n">' + dinero(da.regiones[r.id].precio) + '</td></tr>';
    }).join('') + '</table></div>';
    const g1 = U.grafica('poblacion', function (cv) {
      const anios = [], vals = [];
      for (let y = 1850; y <= 2150; y += 10) { anios.push(String(y)); vals.push(M.poblacionMundial(y) / 1e6); }
      IA.arte.linea(cv, [{ nombre: 'Millones de personas', color: getComputedStyle(document.documentElement).getPropertyValue('--acento').trim(), valores: vals }], anios, { formato: function (v) { return U.grande(v * 1e6); } });
    });
    h += '<h3>Población mundial 1850–2150</h3><canvas class="lienzo" data-grafica="' + g1 + '"></canvas><p class="nota">Real hasta 2024, proyección media de la ONU hasta 2100 y ficción del juego hasta 2150 (escenario ' + esc(N.S.escenario) + ').</p>';
    const reg = N.S.estudios[0].reg;
    const g2 = U.grafica('piramide', function (cv) {
      const ed = M.edades(reg, anio);
      IA.arte.barras(cv, ed.map(function (x) { return Math.round(x * 1000) / 10; }), M.GRUPOS, { formato: function (v) { return U.decimal(v, 1) + ' %'; } });
    });
    h += '<h3>Edades en ' + esc(D.region(reg).nombre) + '</h3><canvas class="lienzo" data-grafica="' + g2 + '"></canvas>';
    return h;
  }

  // =====================================================================
  // NEGOCIO
  // =====================================================================
  function negocio() {
    const s = sub('negocio', 'finanzas');
    return titulo(t('sec_negocio'), 'negocio') + pestanas('negocio', [['finanzas', t('neg_finanzas')], ['estudio', t('neg_estudio')], ['mercado', t('neg_mercado')]], s) +
      ({ finanzas: nFinanzas, estudio: nEstudio, mercado: nMercado }[s] || nFinanzas)();
  }
  function tablaLibro(libro) {
    const filas = [];
    Object.keys(libro.ing).forEach(function (k) { filas.push('<tr><td>' + esc(NG.NOMBRES[k] || k) + '</td><td class="n bien">' + dinero(libro.ing[k]) + '</td></tr>'); });
    Object.keys(libro.gas).forEach(function (k) { filas.push('<tr><td>' + esc(NG.NOMBRES[k] || k) + '</td><td class="n mal">−' + dinero(libro.gas[k]).replace('$', '$') + '</td></tr>'); });
    const r = NG.total(libro, 'ing') - NG.total(libro, 'gas');
    filas.push('<tr><td><b>' + t('utilidad') + '</b></td><td class="n ' + (r >= 0 ? 'bien' : 'mal') + '"><b>' + dinero(r) + '</b></td></tr>');
    return '<table class="tabla">' + filas.join('') + '</table>';
  }
  function nFinanzas() {
    const S = N.S, est = est0(), g = NG.gastosFijosMes(0);
    let h = '<div class="kpis">' + kpi(t('caja'), dinero(est.caja), est.caja < 0 ? 'mal' : '') + kpi(t('comprometido'), dinero(NG.comprometido(0))) + kpi(t('caja_libre'), dinero(NG.cajaLibre(0))) + kpi(t('gasto_fijo'), dinero(g.personal + g.mantenimiento)) + kpi('Impuesto estimado del año', dinero(NG.impuestoEstimado(0))) + '</div>';
    h += '<div class="dos" style="margin-top:10px"><div class="tarjeta"><h3>Año ' + N.anio() + ' hasta hoy</h3>' + tablaLibro(S.fin.anio) + '<p class="nota">El impuesto del 25 % se paga al cerrar el año, solo sobre las utilidades.</p></div>';
    const ult = S.fin.meses[S.fin.meses.length - 1];
    h += '<div class="tarjeta"><h3>Mes en curso</h3>' + tablaLibro(S.fin.mes) + (ult ? '<p class="nota">Mes anterior: ingresos ' + dinero(ult.ing) + ', gastos ' + dinero(ult.gas) + '.</p>' : '') + '</div></div>';
    if (S.fin.hist.length) {
      const hist = S.fin.hist.slice(-40);
      const g1 = U.grafica('cajaReal', function (cv) {
        const css = getComputedStyle(document.documentElement);
        IA.arte.linea(cv, [{ nombre: 'Caja en dólares de hoy', color: css.getPropertyValue('--acento').trim(), valores: hist.map(function (x) { return x.caja2025; }) },
          { nombre: 'Utilidad del año (hoy)', color: css.getPropertyValue('--dorado').trim(), valores: hist.map(function (x) { return M.aHoy(x.util, x.anio); }) }],
          hist.map(function (x) { return String(x.anio); }), { formato: function (v) { const a = U.ajustes().dineroHoy; U.ajuste('dineroHoy', false); const s = U.dinero(v, 2025); U.ajuste('dineroHoy', a); return s; } });
      });
      h += '<h3>Historial (en dólares de hoy)</h3><canvas class="lienzo" style="height:200px" data-grafica="' + g1 + '"></canvas>';
      h += '<div class="desliza"><table class="tabla"><tr><th>Año</th><th class="n">' + t('ingresos') + '</th><th class="n">' + t('gastos') + '</th><th class="n">' + t('utilidad') + '</th><th class="n">' + t('impuestos') + '</th><th class="n">' + t('caja') + '</th><th class="n">Cuota</th></tr>' +
        S.fin.hist.slice(-15).reverse().map(function (x) {
          return '<tr><td>' + x.anio + '</td><td class="n">' + dinero(x.ing, x.anio) + '</td><td class="n">' + dinero(x.gas, x.anio) + '</td><td class="n ' + (x.util >= 0 ? 'bien' : 'mal') + '">' + dinero(x.util, x.anio) + '</td><td class="n">' + dinero(x.imp, x.anio) + '</td><td class="n">' + dinero(x.caja, x.anio) + '</td><td class="n">' + U.pct(x.cuota) + '</td></tr>';
        }).join('') + '</table></div>';
    }
    return h;
  }
  function nEstudio() {
    const est = est0(), anio = N.anio();
    let h = '<p class="nota">Tu edificio crece piso a piso y los terrenos se llenan de sets. Cada construcción cuesta más que la anterior y sube los gastos fijos. Las 30 construcciones del documento llegan en la V28.</p>';
    h += '<div class="kpis">' + kpi(t('est_capacidad'), NG.capacidad(0)) + kpi('Pisos', est.pisos.length + ' / ' + D.MAX_PISOS) + kpi('Terrenos', est.terrenos.length + ' / ' + D.MAX_TERRENOS) + kpi(t('caja_libre'), dinero(NG.cajaLibre(0))) + '</div>';
    const fila = function (info, tipo) {
      const err = NG.puedeConstruir(tipo, info.id);
      const n = (tipo === 'piso' ? est.pisos : est.terrenos).filter(function (x) { return x === info.id; }).length;
      return '<div class="tarjeta fila entre"><div class="col crece"><b>' + esc(info.nombre) + (n ? ' <span class="etiqueta">tienes ' + n + '</span>' : '') + '</b><span class="chico">' + esc(info.efecto) + '</span>' + (info.desde > anio ? '<span class="tenue chico">Desde ' + info.desde + '</span>' : '') + '</div>' +
        '<button class="btn' + (err ? '' : ' primario') + '" data-a="construir" data-v="' + tipo + ':' + info.id + '"' + (err ? ' disabled title="' + esc(err) + '"' : '') + '>' + dinero(NG.costoConstruccion(info)) + '</button></div>';
    };
    h += '<h3>Pisos del edificio</h3>' + D.pisos.filter(function (p) { return p.id !== 'oficinas'; }).map(function (p) { return fila(p, 'piso'); }).join('');
    h += '<h3>Terrenos</h3>' + D.terrenos.map(function (p) { return fila(p, 'terreno'); }).join('');
    return h;
  }
  ac('construir', function (v) {
    const p = v.split(':');
    const err = NG.construir(p[0], p[1]);
    if (err) { U.aviso(err, 'mal'); return; }
    IA.arte.sonido('exito');
    U.aviso('¡Construido!');
    U.refrescar();
  });
  function nMercado() {
    const S = N.S, anio = N.anio(), cuota = NG.cuotaAnioActual(0), ult = S.fin.hist[S.fin.hist.length - 1];
    let h = '<div class="kpis">' + kpi(t('est_cuota'), U.pct(cuota)) + kpi('Cuota del año pasado', ult ? U.pct(ult.cuota) : '—') + kpi('Puesto del año pasado', ult && ult.puesto ? ult.puesto + '.º' : '—') + kpi(t('est_clase'), est0().clase || 'C') + '</div>';
    h += '<div class="tarjeta"><h3>Frenos contra el dinero infinito</h3><ul>' +
      '<li>El público es finito: población × acceso × frecuencia de cada época.</li>' +
      '<li>Cada semana compites con los estrenos rivales y con las otras productoras.</li>' +
      '<li>Duplicar el presupuesto o el marketing rinde cada vez menos.</li>' +
      '<li>Las estrellas cobran más después de cada éxito.</li>' +
      '<li>Gastos fijos que crecen con el tamaño y un impuesto del 25 % sobre utilidades.</li>' +
      '<li>Antimonopolio: con 35 % o más del mercado se abre una investigación con multa.' + (S.investigaciones ? ' Has tenido ' + S.investigaciones + '.' : '') + '</li></ul></div>';
    const da = E.datosAnio(anio);
    h += '<div class="tarjeta"><h3>Economía de ' + anio + '</h3><div class="kpis">' + kpi('Película típica', dinero(da.tipico)) + kpi('Producción típica', dinero(E.produccionTipica(anio, 'DR'))) +
      kpi('Marketing típico', dinero(E.marketingTipico(anio))) + kpi('Películas del año en el mundo', U.numero(da.peliculas)) + '</div><p class="nota">Una major es uno de los 3 estudios más taquilleros del mundo, con 6 % o más del mercado, tres años seguidos.' + (S.majorDesde ? ' Lo lograste en ' + S.majorDesde + '.' : '') + '</p></div>';
    return h;
  }

  // =====================================================================
  // AJUSTES, GUARDADO, AYUDA Y MODALES
  // =====================================================================
  function ajustes() {
    const a = U.ajustes();
    const sel = function (k, lista) { return '<select data-c="ajuste" data-k="' + k + '">' + lista.map(function (x) { return '<option value="' + x[0] + '"' + (String(a[k]) === String(x[0]) ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select>'; };
    const sw = function (k, txt) { return '<label class="interruptor"><span>' + esc(txt) + '</span><input type="checkbox" data-c="ajuste" data-k="' + k + '"' + (a[k] ? ' checked' : '') + '></label>'; };
    return '<div class="fila entre"><h2>' + t('ajustes') + '</h2><button class="ico" data-a="cerrarModal" aria-label="' + t('cerrar') + '">' + icono('cerrar') + '</button></div>' +
      '<label class="campo"><span>' + t('aj_tema') + '</span>' + sel('tema', [['oscuro', t('tema_oscuro')], ['claro', t('tema_claro')], ['epoca', t('tema_epoca')], ['contraste', t('tema_contraste')]]) + '</label>' +
      '<label class="campo"><span>' + t('aj_texto') + '</span>' + sel('texto', [[1, 'Pequeño'], [2, 'Normal'], [3, 'Grande'], [4, 'Muy grande']]) + '</label>' +
      '<label class="campo"><span>' + t('aj_orientacion') + '</span>' + sel('orientacion', [['auto', t('ori_auto')], ['vertical', t('ori_vertical')], ['horizontal', t('ori_horizontal')]]) + '</label>' +
      '<label class="campo"><span>' + t('gua_autoguardado') + '</span>' + sel('autoguardado', [['mes', t('auto_mes')], ['anio', t('auto_anio')], ['no', t('auto_no')]]) + '</label>' +
      sw('sonido', t('aj_sonido')) + sw('movimiento', t('aj_movimiento')) + sw('vibracion', t('aj_vibracion')) + sw('dineroHoy', t('dinero_hoy')) +
      '<p></p><div class="col">' + (N.S ? '<button class="btn" data-a="abrirGuardado">' + t('gua_titulo') + '</button><button class="btn" data-a="laboratorio">' + t('aj_laboratorio') + '</button><button class="btn peligro" data-a="salir">' + t('aj_salir') + '</button>' : '') + '</div>' +
      '<p class="nota">' + t('juego') + ' ' + IA.VERSION + ' · ' + t('creditos') + '</p>';
  }
  ac('abrirAjustes', function () { U.modal(ajustes()); });
  ac('ajuste', function (v, el) {
    const k = el.getAttribute('data-k');
    const val = el.type === 'checkbox' ? !!v : (k === 'texto' ? +v : v);
    U.ajuste(k, val);
    if (N.S) U.refrescar();
  });
  ac('salir', function () { detenerAuto(); IA.guardado.autoguardar().then(function () { N.S = null; U.cerrarModal(); U.cerrarFicha(); U.render(); }); });
  function guardado(lista) {
    let h = '<div class="fila entre"><h2>' + t('gua_titulo') + '</h2><button class="ico" data-a="cerrarModal" aria-label="' + t('cerrar') + '">' + icono('cerrar') + '</button></div>';
    h += lista.map(function (x, i) {
      const nom = x.manual ? t('gua_ranura', { n: i + 1 }) : t('gua_auto', { n: i - 4 });
      const meta = x.meta ? esc(x.meta.nombre) + ' · ' + x.meta.anio + ' S' + x.meta.semana + '<br><span class="tenue chico">' + esc(new Date(x.meta.fecha).toLocaleString('es')) + '</span>' : '<span class="tenue">' + t('gua_vacia') + '</span>';
      return '<div class="tarjeta fila entre"><div class="col crece"><b>' + nom + '</b><span>' + meta + '</span></div><div class="fila">' +
        (N.S && x.manual ? '<button class="btn" data-a="guardarEn" data-v="' + x.ranura + '">' + t('guardar') + '</button>' : '') +
        (x.meta ? '<button class="btn primario" data-a="cargarDe" data-v="' + x.ranura + '">' + t('cargar').split(' ')[0] + '</button>' : '') + '</div></div>';
    }).join('');
    h += '<div class="col">' + (N.S ? '<button class="btn" data-a="exportar">' + t('gua_exportar') + '</button>' : '') +
      '<label class="btn">' + t('gua_importar') + '<input type="file" accept=".iasave,application/json" data-c="importarArchivo" class="oculto"></label></div>' +
      '<p class="nota">Las partidas viven en este navegador. Para pasarlas del celular al PC, o para guardar copias seguras, usa el archivo .iasave.</p>';
    return h;
  }
  ac('abrirGuardado', function () { IA.guardado.listar().then(function (l) { U.modal(guardado(l)); }); });
  ac('guardarEn', function (v) {
    IA.guardado.guardar(v).then(function (r) {
      if (r.ok) { U.aviso(t('gua_guardado', { r: v.replace('m', t('gua_ranura', { n: '' }).trim() + ' ') })); IA.guardado.listar().then(function (l) { U.modal(guardado(l)); }); }
      else U.aviso(t('gua_error', { e: r.error }), 'mal');
    });
  });
  ac('cargarDe', function (v) {
    detenerAuto();
    IA.guardado.cargar(v).then(function (r) {
      if (r.ok) { U.cerrarModal(); U.cerrarFicha(); U.estado.np = false; U.render(); U.aviso(t('gua_cargado')); }
      else U.aviso(t('gua_error', { e: r.error }), 'mal');
    });
  });
  ac('continuar', function (v) { U.acciones.cargarDe(v); });
  ac('exportar', function () {
    IA.guardado.exportarArchivo().then(function (r) { if (r.ok) U.aviso('Archivo ' + r.nombre + ' listo'); else U.aviso(t('gua_error', { e: r.error }), 'mal'); });
  });
  ac('importarArchivo', function (v, el) {
    const f = el.files && el.files[0];
    if (!f) return;
    const lector = new FileReader();
    lector.onload = function () {
      detenerAuto();
      IA.guardado.importarTexto(String(lector.result)).then(function (r) {
        if (r.ok) { U.cerrarModal(); U.estado.np = false; U.render(); U.aviso(t('gua_cargado')); } else U.aviso(t('gua_error', { e: r.error }), 'mal');
      });
    };
    lector.onerror = function () { U.aviso(t('gua_corrupto'), 'mal'); };
    lector.readAsText(f);
  });
  ac('ayuda', function (v) {
    U.modal('<div class="fila entre"><h2>' + t('ayuda') + '</h2><button class="ico" data-a="cerrarModal" aria-label="' + t('cerrar') + '">' + icono('cerrar') + '</button></div>' + t('ayuda_' + v));
  });
  // Laboratorio: el bot de pruebas desde el juego (guarda y restaura tu partida)
  ac('laboratorio', function () {
    U.modal('<h2>' + t('aj_laboratorio') + '</h2><p>El bot juega solo con la estrategia normal y revisa las metas de balance. Tu partida queda intacta. Elige cuánto: (tarda unos segundos; el juego se congela mientras tanto)</p><div class="col"><button class="btn" data-a="correrBot" data-v="1900:1950">Desde 1900 hasta 1950</button><button class="btn" data-a="correrBot" data-v="2000:2060">Desde 2000 hasta 2060</button><button class="btn" data-a="cerrarModal">' + t('cerrar') + '</button></div>');
  });
  ac('correrBot', function (v) {
    const p = v.split(':');
    const guardadoS = N.S;
    U.modal('<p>El bot está jugando…</p>');
    setTimeout(function () {
      let r;
      try { r = IA.pruebas.jugar({ estrategia: 'normal', desde: +p[0], hasta: +p[1], semilla: 'lab-' + v }); }
      catch (e) { r = null; U.aviso('El bot falló: ' + e.message, 'mal'); }
      N.S = guardadoS;
      IA.talentos.reindexar(); IA.obras.reindexar();
      if (!r) { U.cerrarModal(); return; }
      U.modal('<h2>Informe del bot</h2><p class="nota">Estrategia normal, ' + p[0] + '–' + p[1] + '</p><table class="tabla"><tr><th>Meta</th><th>Objetivo</th><th>Resultado</th></tr>' + IA.pruebas.METAS.map(function (m) {
        return '<tr><td>' + esc(m.nombre) + '</td><td>' + esc(m.objetivo) + '</td><td class="' + (m.ok(r) ? 'bien' : 'mal') + '">' + esc(m.ver(r)) + '</td></tr>';
      }).join('') + '</table><p>Errores: ' + (r.errores.length ? esc(r.errores.join('; ')) : 'ninguno') + '</p><p>Semana: ' + U.decimal(r.rendimiento.msSemana, 1) + ' ms · Año: ' + U.decimal(r.rendimiento.sAnio, 2) + ' s</p><button class="btn bloque" data-a="cerrarModal">' + t('cerrar') + '</button>');
    }, 50);
  });

  // =====================================================================
  // AVANZAR EL TIEMPO
  // =====================================================================
  let autoTimer = null;
  function detenerAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } U.estado.auto = null; }
  function avanzarCon(modo) {
    if (!N.S || N.S.quiebra || U.estado.ocupado) return null;
    U.estado.ocupado = true;
    const notiAntes = N.S.noticias.length ? N.S.noticias[0] : null;
    const anioAntes = N.anio(), mesAntes = N.mes();
    let r;
    try { r = J.avanzar(modo); } finally { U.estado.ocupado = false; }
    autoguardarSiToca(anioAntes, mesAntes);
    const nuevas = [];
    for (let i = 0; i < N.S.noticias.length && N.S.noticias[i] !== notiAntes; i++) nuevas.push(N.S.noticias[i]);
    return { r: r, nuevas: nuevas };
  }
  function autoguardarSiToca(anioAntes, mesAntes) {
    const modo = U.ajustes().autoguardado;
    if (modo === 'no') return;
    if ((modo === 'mes' && N.mes() !== mesAntes) || N.anio() !== anioAntes) {
      IA.guardado.autoguardar().then(function (g) { if (!g.ok) U.aviso(t('gua_error', { e: g.error }), 'mal'); });
    }
  }
  function despuesDeAvanzar(res, mostrarResumen) {
    if (!res) return;
    const r = res.r;
    U.refrescar();
    res.nuevas.filter(function (n) { return n.imp; }).slice(0, 2).forEach(function (n) { U.aviso(textoNoticia(n).replace(/<[^>]+>/g, '')); });
    if (N.S.quiebra) { detenerAuto(); U.modal('<h2>' + t('quiebra_titulo') + '</h2><p>' + t('quiebra_texto') + '</p><div class="col"><button class="btn primario" data-a="abrirGuardado">' + t('cargar') + '</button><button class="btn" data-a="salir">' + t('aj_salir') + '</button></div>'); IA.arte.sonido('fracaso'); return; }
    if (r && r.motivo === 'premios' && N.S.premios.length) mostrarPremios();
    else if (mostrarResumen && r && r.semanas > 1) {
      U.modal('<h2>' + t('resumen_titulo', { n: r.semanas }) + '</h2><div class="kpis">' + kpi(t('ingresos'), dinero(r.ingresos), 'bien') + kpi(t('gastos'), dinero(r.gastos), 'mal') + kpi('Cambio de caja', dinero(r.caja), r.caja >= 0 ? 'bien' : 'mal') + kpi(t('caja'), dinero(est0().caja)) + '</div>' +
        (res.nuevas.length ? '<h3>' + t('mun_periodico') + '</h3>' + res.nuevas.slice(0, 8).map(function (n) { return '<p style="margin:4px 0">' + (n.imp ? '<b>' : '') + textoNoticia(n) + (n.imp ? '</b>' : '') + '</p>'; }).join('') : '') +
        '<button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
    }
  }
  function mostrarPremios() {
    const res = N.S.premios[N.S.premios.length - 1];
    const tuyos = res.categorias.filter(function (c) { return c.ganador.est === 0; }).length;
    if (tuyos) IA.arte.sonido('premio');
    U.modal('<h2>' + t('premios_titulo', { nombre: D.premios.nombre, anio: res.anio + 1 }) + '</h2>' + res.categorias.map(function (c) {
      return '<p style="margin:6px 0"><span class="tenue chico">' + esc(c.nombre) + '</span><br><b class="' + (c.ganador.est === 0 ? 'oro' : '') + '">«' + esc(c.ganador.titulo) + '»' + (c.ganador.quien ? ' · ' + esc(c.ganador.quien) : '') + '</b> · ' + esc(nombreEstudio(c.ganador.est)) + '</p>';
    }).join('') + '<button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
  }
  ac('avanzar', function () {
    if (U.estado.auto) { detenerAuto(); U.renderBarra(); return; }
    const ritmo = U.ajustes().ritmo;
    if (ritmo === 'auto') {
      U.estado.auto = true;
      U.renderBarra();
      autoTimer = setInterval(function () {
        if (U.modalAbierto()) return;
        const res = avanzarCon('semana');
        const ev = N.S ? J.hayEvento() : 'quiebra';
        despuesDeAvanzar(res, false);
        if (ev === 'lista' || ev === 'quiebra' || ev === 'premios') {
          detenerAuto(); U.renderBarra();
          if (ev === 'premios') mostrarPremios();
          if (ev === 'lista') U.aviso('Tienes una obra lista para estrenar');
        }
      }, U.ajustes().movimiento ? 600 : 420);
      return;
    }
    IA.arte.sonido('avance');
    despuesDeAvanzar(avanzarCon(ritmo), true);
  });
  ac('menuRitmo', function (v, el) {
    const viejo = document.querySelector('.menu-ritmo');
    if (viejo) { viejo.remove(); return; }
    const r = el.getBoundingClientRect();
    const m = document.createElement('div');
    m.className = 'menu-ritmo';
    m.style.top = (r.bottom + 6) + 'px';
    m.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    const actual = U.ajustes().ritmo;
    m.innerHTML = [['semana', t('ritmo_semana')], ['mes', t('ritmo_mes')], ['evento', t('ritmo_evento')], ['auto', t('ritmo_auto')]].map(function (x) {
      return '<button class="' + (x[0] === actual ? 'on' : '') + '" data-a="ritmo" data-v="' + x[0] + '">' + esc(x[1]) + '</button>';
    }).join('');
    document.body.appendChild(m);
    setTimeout(function () {
      document.addEventListener('click', function cerrar(ev) { if (!ev.target.closest('.menu-ritmo')) { m.remove(); document.removeEventListener('click', cerrar, true); } }, true);
    }, 0);
  });
  ac('ritmo', function (v) { U.ajuste('ritmo', v); const m = document.querySelector('.menu-ritmo'); if (m) m.remove(); detenerAuto(); U.renderBarra(); });

  // Refresco de la ficha abierta cuando avanza el tiempo
  function refrescarFicha(clave) {
    if (clave === 'crear' || clave === 'programar') return;
    const p = clave.split(':');
    if (p[0] === 'obra') U.refrescarFicha(fichaObra(+p[1]));
    else if (p[0] === 'talento') U.refrescarFicha(fichaTalento(+p[1]));
  }

  return {
    portada: portada, nuevaPartida: nuevaPartida, estudio: estudio, obras: obras, talento: talento, mundo: mundo, negocio: negocio,
    fichaObra: fichaObra, fichaTalento: fichaTalento, alMostrar: alMostrar, refrescarFicha: refrescarFicha, detenerAuto: detenerAuto,
    datosEstudio: datosEstudio, tareas: tareas,
  };
})();
