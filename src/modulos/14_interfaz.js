/* ==== módulo: interfaz ==== */
// Marco de la interfaz: cinco secciones (Estudio, Obras, Talento, Mundo, Negocio) y la barra superior; fichas
// deslizables en celular y panel lateral en PC y horizontal; avisos; íconos propios en lugar de emojis; temas y
// accesibilidad. Nada depende de pasar el mouse: todo se abre tocando.
ART.ui = (function () {
  'use strict';
  const N = ART.n, t = ART.t;
  const CLAVE_AJUSTES = 'industryart.v16.ajustes';
  const SECCIONES = ['estudio', 'obras', 'talento', 'mundo', 'negocio'];

  // ---------- Ajustes del jugador (fuera de la partida) ----------
  const AJUSTES_BASE = { tema: 'epoca', texto: 2, movimiento: false, sonido: true, vibracion: false, autoguardado: 'mes', orientacion: 'auto', dineroHoy: false, ritmo: 'semana', musica: false, dalton: false, idioma: 'es' };
  let ajustes = Object.assign({}, AJUSTES_BASE);
  function cargarAjustes() {
    try { const a = JSON.parse(localStorage.getItem(CLAVE_AJUSTES) || '{}'); ajustes = Object.assign({}, AJUSTES_BASE, a); } catch (e) { ajustes = Object.assign({}, AJUSTES_BASE); }
    if (!ajustes.v3) { if (ajustes.tema === 'oscuro') ajustes.tema = 'epoca'; ajustes.v3 = 1; guardarAjustes(); } // la 3.0 estrena la estética por época
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
    r.setAttribute('data-dalton', ajustes.dalton ? 'si' : 'no'); // daltonismo
    ART.idioma.poner(ajustes.idioma); // español o inglés
    actualizarEpoca();
    if (ART.arte) { ART.arte.menosMovimiento = !!ajustes.movimiento; ART.arte.activarSonido(!!ajustes.sonido); }
    if (ajustes.orientacion !== 'auto' && window.screen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(ajustes.orientacion === 'vertical' ? 'portrait' : 'landscape').catch(function () { /* solo en pantalla completa o en la app */ });
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(r).getPropertyValue('--panel').trim() || '#0b1020');
  }
  // Nueve estéticas, del papel de imprenta al holograma: cambian solas con el año de la partida
  const EPOCAS = [[1895, 'imprenta', 'Imprenta y teatro'], [1927, 'mudo', 'Cine mudo'], [1948, 'oro', 'Época de oro'], [1967, 'tele', 'Televisión'], [1980, 'nuevo', 'Nuevo cine'],
    [2000, 'video', 'Video y neón'], [2020, 'digital', 'Era digital'], [2050, 'stream', 'Streaming'], [99999, 'futuro', 'Futuro']];
  function epoca(anio) { for (let i = 0; i < EPOCAS.length; i++) if (anio < EPOCAS[i][0]) return { id: EPOCAS[i][1], nombre: EPOCAS[i][2] }; return { id: 'futuro', nombre: 'Futuro' }; }
  function actualizarEpoca(anioNP) {
    const anio = N.S ? N.anio() : anioNP || estado.anioNP || 1930, e = epoca(anio).id, r = document.documentElement;
    if (r.getAttribute('data-epoca') !== e) r.setAttribute('data-epoca', e);
  }

  // ---------- Formatos ----------
  function decimal(v, d) { return v.toFixed(d).replace('.', ','); }
  // Notación anglosajona: K, M, B (Billion = mil millones) y T
  function dinero(v, anio) {
    if (v === undefined || v === null || !isFinite(v)) return '—';
    if (ajustes.dineroHoy && N.S) v = ART.mundo.aHoy(v, anio === undefined ? N.anio() : anio);
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
  // Fechas reales: la semana del juego empieza en su primer día; los estrenos de cine caen en su viernes
  function fecha(tAbs) { return ART.cal.texto(ART.cal.inicioDeT(tAbs), true) + ' · ' + t('semana') + ' ' + N.semana(tAbs); }
  function fechaCorta(tAbs) { return ART.cal.texto(ART.cal.inicioDeT(tAbs)); }
  function fechaEstreno(tAbs) { return ART.cal.textoCorto(ART.cal.viernesDeT(tAbs)) + ' ' + N.anio(tAbs); }
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
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    corazon: '<path d="M12 20s-7-4.4-9-8.6C1.6 8.2 3.6 5 6.8 5c2 0 3.5 1.2 4.2 2.6C11.7 6.2 13.2 5 15.2 5c3.2 0 5.2 3.2 3.8 6.4C19 15.6 12 20 12 20z"/>',
    moneda: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.4 5.8 4.3 0 1.2-1.3 2.1-3 2.1-1.3 0-2.4-.6-3-1.5M12 6v1.8M12 16.2V18"/>',
    trofeo: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 12v4M8 20h8M9.5 16h5"/>',
    rapido: '<path d="M4 6l8 6-8 6zM12 6l8 6-8 6z" fill="currentColor"/>',
    subir: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    bajar: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    bombilla: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>',
    flecha: '<path d="M9 6l6 6-6 6"/>',
    libro: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    carpeta: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 4.5-6.5 8-6.5s6.5 2 8 6.5"/><path d="M19 3v5M16.5 5.5h5"/>',
    pincel: '<path d="M14 4l6 6-8.5 8.5a3 3 0 0 1-4.2 0l-1.8-1.8a3 3 0 0 1 0-4.2L14 4z"/><path d="M5.5 16.5L3 21l4.5-2.5"/>',
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
  // Los pósters y retratos se dibujan cuando están por verse (en un celular, un catálogo largo ya no se dibuja entero de golpe)
  function dibujarPoster(cv) {
    const v = cv.getAttribute('data-poster');
    if (v === 'x') { // títulos sin obra (suministros, paquetes, piratas): cartel con los datos del lienzo
      const tit = cv.getAttribute('data-tit') || '';
      ART.arte.posterEn(cv, { id: N.hash(tit), titulo: tit, generos: [cv.getAttribute('data-gen') || 'Drama'], temas: [], anio: +cv.getAttribute('data-anio') || N.anio(), etapa: 'terminada', crit: null, pub: null, clas: cv.getAttribute('data-clas') || 'PG', premiosGanados: 0, creditos: {}, estudio: { nombre: cv.getAttribute('data-est') || '', logo: null } });
      return;
    }
    const o = ART.obras.porId(+v);
    if (o) ART.arte.posterEn(cv, ART.obras.paraPoster(o));
  }
  function dibujarRetrato(cv) {
    if (cv.getAttribute('data-retrato') === 'nuevo') { if (estado.avatarNuevo) ART.arte.retratoEn(cv, estado.avatarNuevo, estado.avatarNuevo.anio); return; }
    if (cv.getAttribute('data-retrato') === 'tnuevo') { if (estado.talentoNuevo) ART.arte.retratoEn(cv, estado.talentoNuevo, estado.talentoNuevo.anio); return; }
    const id = +cv.getAttribute('data-retrato');
    const tal = id === 999999 ? avatarComoTalento() : ART.talentos.porId(id);
    if (tal) ART.arte.retratoEn(cv, tal.aspecto ? tal : comoRetrato(tal), N.anio());
  }
  let vigia = null;
  const vigilados = new Set();
  function vigiaPosters() {
    if (vigia || typeof IntersectionObserver !== 'function') return vigia;
    vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        vigia.unobserve(e.target); vigilados.delete(e.target);
        if (e.target.hasAttribute('data-poster')) dibujarPoster(e.target); else dibujarRetrato(e.target);
      });
    }, { rootMargin: '300px' });
    return vigia;
  }
  function vigilar(cv) { vigia.observe(cv); vigilados.add(cv); }
  // Logo con imagen propia. Se guarda solo en este dispositivo (no viaja en la partida ni en el .iasave):
  // se reduce a 128 × 128 en un lienzo y se guarda como PNG; al leerlo solo se acepta una imagen en data:.
  let logoImg = null, logoClave = '';
  function claveLogo() { return N.S ? 'ia_logo_' + String(N.S.semilla).slice(0, 40) + '_' + String(N.S.creado || '').slice(0, 30) : ''; }
  function logoPropio() {
    const k = claveLogo();
    if (!k) return null;
    if (k !== logoClave) {
      logoClave = k; logoImg = null;
      let u = null; try { u = localStorage.getItem(k); } catch (e) { u = null; }
      if (u && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(u) && u.length < 400000) { const im = new Image(); im.onload = function () { logoImg = im; dibujar(); }; im.src = u; }
    }
    return logoImg && logoImg.complete ? logoImg : null;
  }
  function ponerLogoPropio(archivo) {
    return new Promise(function (ok, mal) {
      if (!archivo || !/^image\/(png|jpeg|webp|gif)$/.test(archivo.type)) return mal(new Error('Elige una imagen PNG, JPG, WEBP o GIF.'));
      if (archivo.size > 8 * 1024 * 1024) return mal(new Error('La imagen pesa más de 8 MB.'));
      const url = URL.createObjectURL(archivo), im = new Image();
      im.onerror = function () { URL.revokeObjectURL(url); mal(new Error('No se pudo leer la imagen.')); };
      im.onload = function () {
        const cv = document.createElement('canvas'); cv.width = cv.height = 128;
        const s = Math.min(im.naturalWidth, im.naturalHeight);
        cv.getContext('2d').drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, 128, 128);
        URL.revokeObjectURL(url);
        const u = cv.toDataURL('image/png');
        try { localStorage.setItem(claveLogo(), u); } catch (e) { return mal(new Error('Este dispositivo no deja guardar la imagen.')); }
        logoClave = ''; logoPropio(); ok();
      };
      im.src = url;
    });
  }
  function quitarLogoPropio() { try { localStorage.removeItem(claveLogo()); } catch (e) { /* nada que quitar */ } logoClave = ''; logoImg = null; }
  const SUB_IND = { Cine: 'Estudio de cine', 'Televisión': 'Cine y televisión', 'Música': 'Discográfica', Videojuegos: 'Estudio de videojuegos', Teatro: 'Compañía de teatro', Editorial: 'Casa editorial', Mixto: 'Grupo de medios' };
  function subIndustria(id) { return SUB_IND[id] || id; }
  function dibujar(raiz) {
    const r = raiz || document;
    if (ART.puntos) ART.puntos.convertir(r);
    const v = vigiaPosters();
    // Los lienzos que ya salieron de la página (otra vista) se sueltan para no guardarlos en memoria
    if (v) vigilados.forEach(function (cv) { if (!cv.isConnected) { v.unobserve(cv); vigilados.delete(cv); } });
    r.querySelectorAll('canvas[data-poster]').forEach(function (cv) { if (v) vigilar(cv); else dibujarPoster(cv); });
    r.querySelectorAll('canvas[data-retrato]').forEach(function (cv) { if (v) vigilar(cv); else dibujarRetrato(cv); });
    const img = logoPropio();
    r.querySelectorAll('canvas[data-logo]').forEach(function (cv) {
      const est = N.S && N.S.estudios[+cv.getAttribute('data-logo')];
      const L = est ? est.logo : estado.logoNuevo;
      if (!L) return;
      const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 34, h = cv.clientHeight || 34;
      cv.width = w * d; cv.height = h * d;
      const c = cv.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      if (img && est && est.id === 0) { const q = Math.min(w, h) * 0.46; c.save(); c.beginPath(); c.arc(w / 2, h / 2, q, 0, Math.PI * 2); c.clip(); c.drawImage(img, w / 2 - q, h / 2 - q, q * 2, q * 2); c.restore(); }
      else ART.arte.logo(c, w / 2, h / 2, Math.min(w, h) * 0.36, L);
    });
    // Vista previa del letrero (logo, fondo, color de letras y tipo de letra)
    r.querySelectorAll('canvas[data-letrero]').forEach(function (cv) {
      const est = N.S && cv.getAttribute('data-letrero') === '0' ? N.S.estudios[0] : null;
      const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 300, h = cv.clientHeight || 64;
      cv.width = w * d; cv.height = h * d;
      const c = cv.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      const ind = est ? est.industria : cv.getAttribute('data-ind');
      ART.arte.letrero(c, w, h, est ? est.logo : estado.logoNuevo, est ? est.nombre : cv.getAttribute('data-nombre'), null, ind ? subIndustria(ind) : '');
    });
    r.querySelectorAll('canvas[data-grafica]').forEach(function (cv) {
      const g = graficas[cv.getAttribute('data-grafica')];
      if (g) g(cv);
    });
  }
  function ocultarGlobo() { const g = document.getElementById('globo'); if (g) g.classList.remove('on'); }
  function globoGrafica(ev) {
    const cv = ev.target;
    if (!cv || cv.tagName !== 'CANVAS' || !cv._pts || !cv._pts.length) { ocultarGlobo(); return; }
    const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    let mejor = null, d = Infinity;
    cv._pts.forEach(function (p) { const dd = Math.abs(p.x - x) * 2 + Math.abs(p.y - y) * 0.5; if (dd < d) { d = dd; mejor = p; } });
    if (!mejor) return;
    let g = document.getElementById('globo');
    if (!g) { g = document.createElement('div'); g.id = 'globo'; g.setAttribute('role', 'status'); document.body.appendChild(g); }
    g.textContent = mejor.t;
    g.style.left = Math.max(70, Math.min(window.innerWidth - 70, r.left + mejor.x)) + 'px';
    g.style.top = Math.max(30, r.top + mejor.y - 6) + 'px';
    g.classList.add('on');
  }
  const graficas = {};
  function grafica(id, fn) { graficas[id] = fn; return id; }
  // Datos de retrato de un talento (el aspecto sale siempre igual de su id y la semilla del mundo)
  const cacheAspecto = {};
  function comoRetrato(tal) {
    const clave = (N.S ? N.S.semilla : '') + '|' + tal.id;
    if (!cacheAspecto[clave]) cacheAspecto[clave] = ART.arte.aspectoNuevo(N.hash(clave), tal.reg || 'nam');
    const propio = (tal.id === 999999 || tal.jugador) && N.S && N.S.avatar && N.S.avatar.asp;
    const asp = propio ? N.S.avatar.asp : tal.asp; // el avatar y los talentos creados por el jugador tienen su aspecto elegido
    return { id: tal.id, nombre: tal.nom, sexo: tal.sx, edad: N.anio() - tal.nac, oficio: tal.of, aspecto: asp ? Object.assign({}, cacheAspecto[clave], asp) : cacheAspecto[clave] };
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
      document.getElementById('vista').innerHTML = estado.np ? ART.pantallas.nuevaPartida() : ART.pantallas.portada();
      document.getElementById('vista').scrollTop = 0;
      dibujar(document.getElementById('vista'));
      ART.pantallas.alMostrar('portada');
      return;
    }
    if (N.S.taller && ART.taller) { // Taller creativo: su propia pantalla, sin barra ni menú
      app.classList.add('sin-juego');
      document.getElementById('vista').innerHTML = ART.taller.vista();
      dibujar(document.getElementById('vista'));
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
    actualizarEpoca();
    const S = N.S, est = S.estudios[0];
    const rojo = est.caja < 0 ? ' rojo' : '';
    const auto = !!estado.auto;
    const etiquetaRitmo = { semana: t('ritmo_semana'), mes: t('ritmo_mes'), evento: t('ritmo_evento'), auto: t('ritmo_auto') }[ajustes.ritmo];
    document.getElementById('barra').innerHTML =
      '<div class="marca"><canvas data-logo="0" width="36" height="36"></canvas><b style="font:' + esc(ART.arte.fuenteLetra((est.logo || {}).f, 16)) + '">' + esc(est.nombre) + (est.suf ? ' <span class="tenue">' + esc(est.suf) + '</span>' : '') + '</b></div>' +
      '<button class="indicador fecha" data-a="abrirCalendario" aria-label="Abrir el calendario">' + icono('calendario') + '<span class="col"><b>' + esc(ART.cal.texto(ART.cal.hoy())) + '</b><span>' + t('semana') + ' ' + N.semana() + '</span></span></button>' +
      '<button class="indicador fans" data-a="verFans" aria-label="Fans">' + icono('corazon') + '<span class="col"><b class="cifra">' + grande(S.fans || 0) + '</b><span>fans</span></span></button>' +
      '<button class="indicador dinero' + rojo + '" data-a="alternarDinero" aria-label="' + t('toca_dinero') + '">' + icono('moneda') + '<span class="col"><b class="cifra">' + dinero(est.caja) + '</b><span>' + (ajustes.dineroHoy ? t('hoy') : t('epoca')) + '</span></span></button>' +
      '<span class="espacio"></span>' +
      '<button class="avanzar' + (auto ? ' auto' : '') + '" data-a="avanzar" aria-label="' + (auto ? t('pausa') : t('avanzar') + ': ' + esc(etiquetaRitmo)) + '">' + icono(auto ? 'pausa' : ajustes.ritmo === 'semana' ? 'avanzar' : 'rapido') + '<span>' + (auto ? t('pausa') : esc(etiquetaRitmo)) + '</span></button>' +
      '<button class="ico" data-a="menuRitmo" aria-label="' + t('ritmo') + '">' + icono('abajo') + '</button>' +
      '<button class="ico opcional" data-a="abrirGuardado" aria-label="' + t('guardar') + '">' + icono('guardar') + '</button>' +
      '<button class="ico" data-a="abrirPausa" aria-label="Pausa y ajustes">' + icono('ajustes') + '</button>';
    dibujar(document.getElementById('barra'));
  }
  function renderMenu() {
    const ic = { estudio: 'estudio', obras: 'obras', talento: 'talento', mundo: 'mundo', negocio: 'negocio' };
    const vis = ART.metas && N.S ? ART.metas.seccionesVisibles() : null; // tutorial
    document.getElementById('menu').innerHTML = SECCIONES.filter(function (s) { return !vis || vis.indexOf(s) >= 0; }).map(function (s) {
      return '<button class="nav' + (estado.seccion === s ? ' on' : '') + '" data-a="seccion" data-v="' + s + '"' + (estado.seccion === s ? ' aria-current="page"' : '') + '>' + icono(ic[s]) + '<span>' + t('sec_' + s) + '</span></button>';
    }).join('');
  }
  function renderVista(mantenerScroll) {
    const v = document.getElementById('vista');
    const y = v.scrollTop;
    v.innerHTML = ART.pantallas[estado.seccion]();
    // La pestaña activa siempre a la vista (en el celular las pestañas se deslizan)
    const pa = v.querySelector('.pestanas .pestana.on'); if (pa && pa.scrollIntoView && pa.parentNode.scrollWidth > pa.parentNode.clientWidth) { const c = pa.parentNode; c.scrollLeft = pa.offsetLeft - c.offsetLeft - 16; }
    dibujar(v);
    ART.pantallas.alMostrar(estado.seccion);
    v.scrollTop = mantenerScroll ? y : 0;
  }
  // Refresco ligero tras avanzar: barra, vista (manteniendo el scroll) y ficha abierta
  function refrescar() {
    if (!N.S || N.S.taller) return render();
    renderBarra();
    // La lista de talentos (40 retratos) no se redibuja con cada semana: se actualiza al volver a entrar
    if (estado.seccion !== 'talento') renderVista(true);
    if (fichaAbierta() && estado.fichaActual && ART.pantallas.refrescarFicha) ART.pantallas.refrescarFicha(estado.fichaActual);
  }
  function irA(seccion, sub) {
    const cambio = estado.seccion !== seccion;
    estado.seccion = seccion;
    if (sub) estado.sub[seccion] = sub;
    cerrarFicha();
    document.getElementById('app').setAttribute('data-seccion', seccion);
    renderMenu();
    renderVista();
    const v = document.getElementById('vista');
    v.scrollTop = 0;
    // Al cambiar de sección, la vista entra con un leve deslizamiento (no al refrescar cada semana)
    if (cambio && !ajustes.movimiento) { v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra'); clearTimeout(irA.t); irA.t = setTimeout(function () { v.classList.remove('entra'); }, 400); }
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
      if (ART.arte && el.tagName === 'BUTTON') ART.arte.sonido('clic');
      try { fn(el.getAttribute('data-v'), el, ev); } catch (e) { console.error(e); aviso('Error: ' + e.message, 'mal'); }
    });
    document.addEventListener('change', function (ev) {
      const el = ev.target.closest('[data-c]');
      if (!el) return;
      const fn = acciones[el.getAttribute('data-c')];
      if (fn) { try { fn(el.type === 'checkbox' ? el.checked : el.value, el, ev); } catch (e) { console.error(e); aviso('Error: ' + e.message, 'mal'); } }
    });
    // Tocar una gráfica muestra el valor más cercano (con el mouse, también al pasar por encima)
    document.addEventListener('pointerdown', globoGrafica, true);
    document.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse') globoGrafica(ev); }, { passive: true });
    window.addEventListener('scroll', ocultarGlobo, { passive: true, capture: true });
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
    SECCIONES: SECCIONES, estado: estado, epoca: epoca, actualizarEpoca: actualizarEpoca, ajuste: ajuste, ajustes: function () { return ajustes; }, cargarAjustes: cargarAjustes,
    aplicarAjustes: aplicarAjustes, dinero: dinero, numero: numero, grande: grande, pct: pct, fecha: fecha, fechaCorta: fechaCorta, fechaEstreno: fechaEstreno,
    decimal: decimal, icono: icono, aviso: aviso, abrirFicha: abrirFicha, refrescarFicha: refrescarFicha, cerrarFicha: cerrarFicha,
    fichaAbierta: fichaAbierta, modal: modal, cerrarModal: cerrarModal, modalAbierto: modalAbierto, dibujar: dibujar, logoPropio: logoPropio, ponerLogoPropio: ponerLogoPropio, quitarLogoPropio: quitarLogoPropio,
    grafica: grafica, comoRetrato: comoRetrato, render: render, renderBarra: renderBarra, renderVista: renderVista,
    refrescar: refrescar, irA: irA, enlazar: enlazar, accion: accion, acciones: acciones,
  };
})();
