/* ==== módulo: interfaz ==== */
// Marco de la interfaz: cinco secciones (Estudio, Obras, Talento, Mundo, Negocio) y la barra superior; fichas
// deslizables en celular y panel lateral en PC y horizontal; avisos; íconos propios en lugar de emojis; temas y
// accesibilidad. Nada depende de pasar el mouse: todo se abre tocando.
IA.ui = (function () {
  'use strict';
  const N = IA.n, t = IA.t;
  const CLAVE_AJUSTES = 'industryart.v16.ajustes';
  const SECCIONES = ['estudio', 'obras', 'talento', 'mundo', 'negocio'];

  // ---------- Ajustes del jugador (fuera de la partida) ----------
  const AJUSTES_BASE = { tema: 'oscuro', texto: 2, movimiento: false, sonido: true, vibracion: false, autoguardado: 'mes', orientacion: 'auto', dineroHoy: false, ritmo: 'semana', musica: false };
  let ajustes = Object.assign({}, AJUSTES_BASE);
  function cargarAjustes() {
    try { const a = JSON.parse(localStorage.getItem(CLAVE_AJUSTES) || '{}'); ajustes = Object.assign({}, AJUSTES_BASE, a); } catch (e) { ajustes = Object.assign({}, AJUSTES_BASE); }
    aplicarAjustes();
  }
  function guardarAjustes() { try { localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes)); } catch (e) { /* sin almacenamiento: los ajustes duran la sesión */ } }
  function ajuste(k, v) { if (v === undefined) return ajustes[k]; ajustes[k] = v; guardarAjustes(); aplicarAjustes(); return v; }
  function aplicarAjustes() {
    const r = document.documentElement;
    r.setAttribute('data-tema', ajustes.tema);
    r.setAttribute('data-texto', String(ajustes.texto));
    r.setAttribute('data-movimiento', ajustes.movimiento ? 'menos' : 'normal');
    r.setAttribute('data-orientacion', ajustes.orientacion);
    actualizarEpoca();
    if (IA.arte) { IA.arte.menosMovimiento = !!ajustes.movimiento; IA.arte.activarSonido(!!ajustes.sonido); }
    if (ajustes.orientacion !== 'auto' && window.screen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(ajustes.orientacion === 'vertical' ? 'portrait' : 'landscape').catch(function () { /* solo en pantalla completa o en la app */ });
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(r).getPropertyValue('--panel').trim() || '#0b1020');
  }
  // El tema Época cambia con el año: sepia hasta 1949, neón hasta 1999, vidrio después
  function actualizarEpoca() {
    const anio = N.S ? N.anio() : 1930;
    document.documentElement.setAttribute('data-epoca', anio < 1950 ? 'sepia' : anio < 2000 ? 'neon' : 'vidrio');
  }

  // ---------- Formatos ----------
  function decimal(v, d) { return v.toFixed(d).replace('.', ','); }
  // Notación anglosajona: K, M, B (Billion = mil millones) y T
  function dinero(v, anio) {
    if (v === undefined || v === null || !isFinite(v)) return '—';
    if (ajustes.dineroHoy && N.S) v = IA.mundo.aHoy(v, anio === undefined ? N.anio() : anio);
    const s = v < 0 ? '−$' : '$';
    const a = Math.abs(v);
    const corto = function (x, suf) { return s + decimal(x, x < 10 ? 2 : x < 100 ? 1 : 0) + ' ' + suf; };
    if (a >= 1e12) return corto(a / 1e12, 'T');
    if (a >= 1e9) return corto(a / 1e9, 'B');
    if (a >= 1e6) return corto(a / 1e6, 'M');
    if (a >= 1e4) return corto(a / 1e3, 'K');
    if (a < 100 && Math.round(a) !== a) return s + decimal(a, 2);
    return s + Math.round(a).toLocaleString('es');
  }
  function numero(v) { return Math.round(v).toLocaleString('es'); }
  function grande(v) {
    const a = Math.abs(v);
    if (a >= 1e9) return decimal(v / 1e9, 2) + ' mil M';
    if (a >= 1e6) return decimal(v / 1e6, a >= 1e8 ? 0 : 1) + ' M';
    if (a >= 1e4) return decimal(v / 1e3, 0) + ' K';
    return numero(v);
  }
  function pct(x, d) { return decimal(x * 100, d === undefined ? 1 : d) + ' %'; }
  // Fechas reales (V21): la semana del juego empieza en su primer día; los estrenos de cine caen en su viernes
  function fecha(tAbs) { return IA.cal.texto(IA.cal.inicioDeT(tAbs), true) + ' · ' + t('semana') + ' ' + N.semana(tAbs); }
  function fechaCorta(tAbs) { return IA.cal.texto(IA.cal.inicioDeT(tAbs)); }
  function fechaEstreno(tAbs) { return IA.cal.textoCorto(IA.cal.viernesDeT(tAbs)) + ' ' + N.anio(tAbs); }
  const esc = N.esc;

  // ---------- Íconos propios (SVG) ----------
  const P = {
    estudio: '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-5h6v5M8.5 11h1M14.5 11h1M8.5 14h1M14.5 14h1"/>',
    obras: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 9l2.5-5 15 3.5-1 2.5"/><path d="M7.5 5l2 4M12.5 6l2 4"/>',
    talento: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 4.5-6.5 8-6.5s6.5 2 8 6.5"/>',
    mundo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    negocio: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    avanzar: '<path d="M7 5l11 7-11 7z" fill="currentColor"/>',
    pausa: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    guardar: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    ajustes: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    ayuda: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    dado: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
    estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    abajo: '<path d="M6 9l6 6 6-6"/>',
    varita: '<path d="M4 20L16 8M14 4v3M18 8h3M17 4l2-2M11 6l-1-1M18 11l1 1"/>',
  };
  function icono(nombre, titulo) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="' + (titulo ? 'false' : 'true') + '"' + (titulo ? ' role="img" aria-label="' + esc(titulo) + '"' : '') + '>' + (P[nombre] || '') + '</svg>';
  }

  // ---------- Estado de la interfaz ----------
  const estado = { seccion: 'estudio', sub: {}, auto: null, ocupado: false, ultimaNoticia: 0, fichaActual: null };
  const acciones = {};
  function accion(nombre, fn) { acciones[nombre] = fn; }

  // ---------- Avisos, ficha y modal ----------
  function aviso(texto, tipo) {
    const cont = document.getElementById('avisos');
    if (!cont) return;
    const d = document.createElement('div');
    d.className = 'aviso' + (tipo === 'mal' ? ' mal' : '');
    d.textContent = texto;
    cont.appendChild(d);
    while (cont.children.length > 3) cont.removeChild(cont.firstChild);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, tipo === 'mal' ? 5000 : 3200);
    if (tipo === 'mal' && ajustes.vibracion && navigator.vibrate) navigator.vibrate(80);
  }
  function abrirFicha(html, clave) {
    const f = document.getElementById('ficha');
    f.innerHTML = '<div class="tirador"></div><div class="fila entre"><span></span><button class="ico" data-a="cerrarFicha" aria-label="' + t('cerrar') + '">' + icono('cerrar') + '</button></div>' + html;
    f.classList.add('abierta');
    f.setAttribute('aria-hidden', 'false');
    document.getElementById('velo').classList.add('on');
    estado.fichaActual = clave || null;
    dibujar(f);
    f.scrollTop = 0;
  }
  function refrescarFicha(html) {
    const f = document.getElementById('ficha');
    if (!f.classList.contains('abierta')) return;
    const y = f.scrollTop;
    abrirFicha(html, estado.fichaActual);
    f.scrollTop = y;
  }
  function cerrarFicha() {
    const f = document.getElementById('ficha');
    f.classList.remove('abierta');
    f.setAttribute('aria-hidden', 'true');
    document.getElementById('velo').classList.remove('on');
    estado.fichaActual = null;
  }
  function fichaAbierta() { return document.getElementById('ficha').classList.contains('abierta'); }
  function modal(html) {
    const m = document.getElementById('modal');
    m.innerHTML = '<div class="caja">' + html + '</div>';
    m.classList.add('on');
    dibujar(m);
  }
  function cerrarModal() { const m = document.getElementById('modal'); m.classList.remove('on'); m.innerHTML = ''; }
  function modalAbierto() { return document.getElementById('modal').classList.contains('on'); }

  // ---------- Lienzos: pósters, retratos, logos y gráficas se dibujan después de cada render ----------
  function dibujar(raiz) {
    const r = raiz || document;
    r.querySelectorAll('canvas[data-poster]').forEach(function (cv) {
      const o = IA.obras.porId(+cv.getAttribute('data-poster'));
      if (o) IA.arte.posterEn(cv, IA.obras.paraPoster(o));
    });
    r.querySelectorAll('canvas[data-retrato]').forEach(function (cv) {
      const id = +cv.getAttribute('data-retrato');
      const tal = id === 999999 ? avatarComoTalento() : IA.talentos.porId(id);
      if (tal) IA.arte.retratoEn(cv, tal.aspecto ? tal : comoRetrato(tal), N.anio());
    });
    r.querySelectorAll('canvas[data-logo]').forEach(function (cv) {
      const est = N.S && N.S.estudios[+cv.getAttribute('data-logo')];
      const L = est ? est.logo : estado.logoNuevo;
      if (!L) return;
      const d = window.devicePixelRatio || 1, w = cv.clientWidth || 34, h = cv.clientHeight || 34;
      cv.width = w * d; cv.height = h * d;
      const c = cv.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      IA.arte.logo(c, w / 2, h / 2, Math.min(w, h) * 0.42, L);
    });
    r.querySelectorAll('canvas[data-grafica]').forEach(function (cv) {
      const g = graficas[cv.getAttribute('data-grafica')];
      if (g) g(cv);
    });
  }
  const graficas = {};
  function grafica(id, fn) { graficas[id] = fn; return id; }
  // Datos de retrato de un talento (el aspecto sale siempre igual de su id y la semilla del mundo)
  const cacheAspecto = {};
  function comoRetrato(tal) {
    const clave = (N.S ? N.S.semilla : '') + '|' + tal.id;
    if (!cacheAspecto[clave]) cacheAspecto[clave] = IA.arte.aspectoNuevo(N.hash(clave), tal.reg || 'nam');
    return { id: tal.id, nombre: tal.nom, sexo: tal.sx, edad: N.anio() - tal.nac, oficio: tal.of, aspecto: cacheAspecto[clave] };
  }
  function avatarComoTalento() {
    const a = N.S.avatar;
    return comoRetrato({ id: 999999, nom: a.nom, sx: a.sx, nac: a.nac, of: 'produccion', reg: N.S.estudios[0].reg });
  }

  // ---------- Render principal ----------
  function render() {
    const app = document.getElementById('app');
    if (!N.S) {
      app.classList.add('sin-juego');
      document.getElementById('vista').innerHTML = estado.np ? IA.pantallas.nuevaPartida() : IA.pantallas.portada();
      document.getElementById('vista').scrollTop = 0;
      dibujar(document.getElementById('vista'));
      IA.pantallas.alMostrar('portada');
      return;
    }
    app.classList.remove('sin-juego');
    app.setAttribute('data-seccion', estado.seccion);
    actualizarEpoca();
    renderBarra();
    renderMenu();
    renderVista();
  }
  function renderBarra() {
    const S = N.S, est = S.estudios[0];
    const rojo = est.caja < 0 ? ' rojo' : '';
    const auto = !!estado.auto;
    const etiquetaRitmo = { semana: t('ritmo_semana'), mes: t('ritmo_mes'), evento: t('ritmo_evento'), auto: t('ritmo_auto') }[ajustes.ritmo];
    document.getElementById('barra').innerHTML =
      '<div class="marca"><canvas data-logo="0" width="34" height="34"></canvas><b>' + esc(est.nombre) + (est.suf ? ' <span class="tenue">' + esc(est.suf) + '</span>' : '') + '</b></div>' +
      '<button class="fecha" data-a="abrirCalendario" aria-label="Abrir el calendario"><b>' + esc(IA.cal.texto(IA.cal.hoy())) + '</b><span class="tenue">' + t('semana') + ' ' + N.semana() + '</span></button>' +
      '<button class="fans" data-a="verFans" aria-label="Fans"><b class="cifra">' + grande(S.fans || 0) + '</b><span>fans</span></button>' +
      '<button class="dinero' + rojo + '" data-a="alternarDinero" aria-label="' + t('toca_dinero') + '"><b class="cifra">' + dinero(est.caja) + '</b><span>' + (ajustes.dineroHoy ? t('hoy') : t('epoca')) + '</span></button>' +
      '<span class="espacio"></span>' +
      '<button class="avanzar' + (auto ? ' auto' : '') + '" data-a="avanzar" aria-label="' + (auto ? t('pausa') : t('avanzar') + ': ' + esc(etiquetaRitmo)) + '">' + icono(auto ? 'pausa' : 'avanzar') + '<span>' + (auto ? t('pausa') : esc(etiquetaRitmo)) + '</span></button>' +
      '<button class="ico" data-a="menuRitmo" aria-label="' + t('ritmo') + '">' + icono('abajo') + '</button>' +
      '<button class="ico opcional" data-a="abrirGuardado" aria-label="' + t('guardar') + '">' + icono('guardar') + '</button>' +
      '<button class="ico" data-a="abrirPausa" aria-label="Pausa y ajustes">' + icono('ajustes') + '</button>';
    dibujar(document.getElementById('barra'));
  }
  function renderMenu() {
    const ic = { estudio: 'estudio', obras: 'obras', talento: 'talento', mundo: 'mundo', negocio: 'negocio' };
    const vis = IA.metas && N.S ? IA.metas.seccionesVisibles() : null; // tutorial (V26)
    document.getElementById('menu').innerHTML = SECCIONES.filter(function (s) { return !vis || vis.indexOf(s) >= 0; }).map(function (s) {
      return '<button class="nav' + (estado.seccion === s ? ' on' : '') + '" data-a="seccion" data-v="' + s + '"' + (estado.seccion === s ? ' aria-current="page"' : '') + '>' + icono(ic[s]) + '<span>' + t('sec_' + s) + '</span></button>';
    }).join('');
  }
  function renderVista(mantenerScroll) {
    const v = document.getElementById('vista');
    const y = v.scrollTop;
    v.innerHTML = IA.pantallas[estado.seccion]();
    dibujar(v);
    IA.pantallas.alMostrar(estado.seccion);
    v.scrollTop = mantenerScroll ? y : 0;
  }
  // Refresco ligero tras avanzar: barra, vista (manteniendo el scroll) y ficha abierta
  function refrescar() {
    if (!N.S) return render();
    renderBarra();
    // La lista de talentos (40 retratos) no se redibuja con cada semana: se actualiza al volver a entrar
    if (estado.seccion !== 'talento') renderVista(true);
    if (fichaAbierta() && estado.fichaActual && IA.pantallas.refrescarFicha) IA.pantallas.refrescarFicha(estado.fichaActual);
  }
  function irA(seccion, sub) {
    estado.seccion = seccion;
    if (sub) estado.sub[seccion] = sub;
    cerrarFicha();
    renderMenu();
    renderVista();
    document.getElementById('vista').scrollTop = 0;
  }

  // ---------- Eventos: un solo oyente para todos los botones ----------
  function enlazar() {
    document.addEventListener('click', function (ev) {
      const el = ev.target.closest('[data-a]');
      if (!el) {
        if (ev.target.id === 'velo') { cerrarFicha(); }
        return;
      }
      const fn = acciones[el.getAttribute('data-a')];
      if (!fn) return;
      ev.preventDefault();
      if (IA.arte && el.tagName === 'BUTTON') IA.arte.sonido('clic');
      try { fn(el.getAttribute('data-v'), el, ev); } catch (e) { console.error(e); aviso('Error: ' + e.message, 'mal'); }
    });
    document.addEventListener('change', function (ev) {
      const el = ev.target.closest('[data-c]');
      if (!el) return;
      const fn = acciones[el.getAttribute('data-c')];
      if (fn) { try { fn(el.type === 'checkbox' ? el.checked : el.value, el, ev); } catch (e) { console.error(e); aviso('Error: ' + e.message, 'mal'); } }
    });
    document.addEventListener('input', function (ev) {
      const el = ev.target.closest('[data-i]');
      if (!el) return;
      const fn = acciones[el.getAttribute('data-i')];
      if (fn) fn(el.value, el, ev);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { if (modalAbierto()) cerrarModal(); else if (fichaAbierta()) cerrarFicha(); return; }
      if (!N.S || ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA') return;
      if (ev.target.closest && ev.target.closest('button, a, [data-a], label')) return;
      // Atajos de teclado en PC
      if (ev.key === ' ' || ev.key === 'Enter') { if (!modalAbierto() && !fichaAbierta()) { ev.preventDefault(); try { acciones.avanzar(); } catch (e) { console.error(e); aviso('Error: ' + e.message, 'mal'); } } }
      const n = '12345'.indexOf(ev.key);
      if (n >= 0 && !modalAbierto()) irA(SECCIONES[n]);
    });
    let ancho = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - ancho) < 40) return;
      ancho = window.innerWidth;
      if (N.S) refrescar();
    });
  }

  accion('cerrarFicha', cerrarFicha);
  accion('cerrarModal', cerrarModal);
  accion('seccion', function (v) { irA(v); });
  accion('sub', function (v, el) { estado.sub[el.getAttribute('data-s') || estado.seccion] = v; renderVista(); });
  accion('alternarDinero', function () { ajuste('dineroHoy', !ajustes.dineroHoy); refrescar(); });

  return {
    SECCIONES: SECCIONES, estado: estado, ajuste: ajuste, ajustes: function () { return ajustes; }, cargarAjustes: cargarAjustes,
    aplicarAjustes: aplicarAjustes, dinero: dinero, numero: numero, grande: grande, pct: pct, fecha: fecha, fechaCorta: fechaCorta, fechaEstreno: fechaEstreno,
    decimal: decimal, icono: icono, aviso: aviso, abrirFicha: abrirFicha, refrescarFicha: refrescarFicha, cerrarFicha: cerrarFicha,
    fichaAbierta: fichaAbierta, modal: modal, cerrarModal: cerrarModal, modalAbierto: modalAbierto, dibujar: dibujar,
    grafica: grafica, comoRetrato: comoRetrato, render: render, renderBarra: renderBarra, renderVista: renderVista,
    refrescar: refrescar, irA: irA, enlazar: enlazar, accion: accion, acciones: acciones,
  };
})();
