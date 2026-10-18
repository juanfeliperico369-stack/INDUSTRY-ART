/* ==== módulo: pantallas ==== */
// Las pantallas: portada, nueva partida (con los deslizadores de identidad), las cinco secciones, el estreno, las
// fichas de obra y talento, ajustes y guardado. La creación de obras (fábrica de ideas) vive en IA.creacion.
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
  function kpi(nombre, valor, clase) { return '<div class="kpi"><span>' + esc(nombre) + '</span><b class="cifra ' + (clase || '') + '">' + esc(valor) + '</b></div>'; }
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
    tipo: 'Estudio', industria: 'Cine', vision: 'Alcance Comercial', publico: 'General', esp: ['produccion', 'direccion', 'guion'],
    region: 'losangeles', sufijo: 'Pictures', tf: 'escuela', arq: 'visionario', modo: 'dueno', oficio: 'direccion', enfG: ['Drama', 'Comedia', 'Aventura'], enfT: ['', '', ''] };
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
    const num = function (k) { return deslizadorLogo(k, L[k], 'npLogo'); };
    // V21 (Referencia R7): inicio al azar, tarjetas de región y de era, enfoque, trasfondo, arquetipo y modo carrera
    const regs = D.regionesInicio.filter(function (r) { return r.desde <= np.anio; });
    if (!regs.some(function (r) { return r.id === np.region; })) np.region = 'independiente';
    const era = D.erasInicio.filter(function (e) { return np.anio >= e.desde && np.anio <= e.hasta; })[0];
    const generos = [];
    D.familias.forEach(function (f) { f.generos.forEach(function (g) { if (generos.indexOf(g) < 0) generos.push(g); }); });
    generos.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    const temas = [];
    IA.taxonomia.familiasTema.forEach(function (f) { f.items.forEach(function (x) { temas.push(x); }); });
    temas.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    const r7 = '<button class="btn bloque" data-a="npAzar">' + icono('dado') + ' Inicio al azar (un dado arma toda la partida)</button>' +
      '<h3>Región de inicio</h3><div class="col">' + regs.map(function (r) {
        return '<button class="tarjeta toque" style="text-align:left;width:100%;margin:0;' + (r.id === np.region ? 'border-color:var(--acento);border-width:2px' : '') + '" data-a="npRegion" data-v="' + r.id + '"><b>' + esc(r.nombre) + '</b>' + (r.pais ? ' <span class="tenue chico">' + esc(D.pais(r.pais).nombre) + '</span>' : '') +
          '<br><span class="chico">' + esc(r.mercado) + ' · competencia ' + ['', 'baja', 'media', 'alta'][r.competencia] + ' · capital ×' + U.decimal(r.capital, 2) + ' · prestigio ' + r.prestigio + '</span><br><span class="nota">' + esc(r.texto) + '</span></button>';
      }).join('') + '</div>' +
      (era ? '<div class="tarjeta"><b>Era: ' + esc(era.nombre) + '</b><ul style="margin:6px 0 0 18px;padding:0">' + era.reglas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<h3>Enfoque del estudio</h3><p class="nota">3 géneros y 3 temas: tus obras con ellos ganan público y crítica, y cada 5 obras del enfoque suman experiencia.</p><div class="fila envolver">' + [0, 1, 2].map(function (i) {
        return '<label class="campo crece"><span>Género ' + (i + 1) + '</span><select data-c="npEnf" data-k="g' + i + '">' + ops(generos.map(function (g) { return [g, g]; }), np.enfG[i]) + '</select></label>';
      }).join('') + '</div><div class="fila envolver">' + [0, 1, 2].map(function (i) {
        return '<label class="campo crece"><span>Tema ' + (i + 1) + '</span><select data-c="npEnf" data-k="t' + i + '">' + ops([['', '—']].concat(temas.map(function (x) { return [x, x]; })), np.enfT[i]) + '</select></label>';
      }).join('') + '</div>';
    const avatar2 = '<label class="campo"><span>Trasfondo</span><select data-c="np" data-k="tf">' + ops(IA.carrera.TRASFONDOS.map(function (x) { return [x.id, x.nombre + ' · ' + x.texto]; }), np.tf) + '</select></label>' +
      '<label class="campo"><span>Arquetipo de liderazgo</span><select data-c="np" data-k="arq">' + ops(IA.carrera.ARQUETIPOS.map(function (x) { return [x.id, x.nombre + ' · ' + x.texto]; }), np.arq) + '</select></label>' +
      '<label class="campo"><span>Cómo empiezas</span><select data-c="npModo">' + ops([['dueno', 'Dueño de estudio'], ['carrera', 'Modo carrera: también eres un talento y recibes encargos']], np.modo) + '</select></label>' +
      (np.modo === 'carrera' ? '<label class="campo"><span>Tu oficio como talento</span><select data-c="np" data-k="oficio">' + ops(D.oficios.map(function (o) { return [o.id, o.nombre]; }), np.oficio) + '</select></label>' : '');
    return '<div class="portada" style="text-align:left">' + titulo(t('np_titulo'), 'nueva') + r7 +
      '<canvas id="lienzoEstudio" class="estudio-lienzo" style="height:200px" role="img" aria-label="Vista previa de la fachada"></canvas>' +
      '<div class="fila" style="margin-top:8px" id="npLogoVista"><canvas data-logo="nuevo" style="width:64px;height:64px"></canvas><button class="btn" data-a="otroLogo">' + icono('dado') + t('np_logo_otro') + '</button></div>' +
      '<div class="tarjeta">' + num('s') + num('c') + num('b') + num('t') + num('f') + '</div>' +
      '<label class="campo"><span>' + t('np_nombre') + '</span><input type="text" maxlength="40" value="' + esc(np.nombre) + '" data-i="npNombre" data-k="nombre"></label>' +
      '<div class="fila envolver"><button class="btn" data-a="npDadoNombre">' + icono('dado') + ' Otro nombre</button><label class="campo crece" style="margin:0"><span>Sufijo del logo</span><select data-c="np" data-k="sufijo">' + ops([['', 'Sin sufijo']].concat(D.sufijosLogo.map(function (x) { return [x, x]; })), np.sufijo) + '</select></label></div>' +
      '<label class="campo"><span>' + t('np_anio') + '</span><select data-c="npAnio">' + ops(anios.map(function (a) { return [a, a + ' · ' + M.tecnologia(a).nombre]; }), np.anio) + '</select>' +
      '<input type="number" min="' + J.ANIO_MIN + '" max="' + J.ANIO_MAX + '" value="' + np.anio + '" data-c="npAnio" aria-label="Otro año" style="margin-top:6px"><span class="nota">' + t('np_anio_ayuda') + '</span></label>' +
      '<label class="campo"><span>Tipo de industria</span><select data-c="npInd">' + ops(D.industrias.filter(function (x) { return x.desde <= np.anio; }).map(function (x) { return [x.id, x.id]; }), indNp().id) + '</select><span class="nota">' + esc(indNp().efecto) + '</span></label>' +
      '<label class="campo"><span>Tipo de estudio</span><select data-c="np" data-k="tipo">' + ops(D.tiposEstudio.map(function (x) { return [x, x]; }), np.tipo) + '</select></label>' +
      '<label class="campo"><span>Visión de la industria</span><select data-c="np" data-k="vision">' + ops(D.visiones.map(function (x) { return [x.id, x.id + ' · ' + x.efecto]; }), np.vision) + '</select></label>' +
      '<label class="campo"><span>Público objetivo</span><select data-c="np" data-k="publico">' + ops(D.publicos.map(function (x) { return [x.id, x.id + ' · ' + x.efecto]; }), np.publico) + '</select></label>' +
      (np.region === 'independiente' ? '<label class="campo"><span>' + t('np_pais') + '</span><select data-c="np" data-k="pais">' + ops(paises, np.pais) + '</select></label>' : '') +
      '<label class="campo"><span>' + t('np_capital') + '</span><select data-c="npCapital">' + ops(capOps, cap) + '</select><span class="nota">' +
      t('np_capital_ayuda', { epoca: esc(U.dinero(M.aEpoca(cap, np.anio)).replace(/^\$/, '$')), anio: np.anio, n: U.decimal(nTipicas, nTipicas < 10 ? 1 : 0) }) + '</span></label>' +
      IA.metasUI.opcionesNueva(np) + '<label class="campo"><span>' + t('np_dificultad') + '</span><select data-c="np" data-k="dificultad">' + ops(IA.metasUI.dificultades().map(function (d) { return [d.id, d.nombre]; }), np.dificultad) + '</select></label>' +
      '<label class="campo"><span>' + t('np_escenario') + '</span><select data-c="np" data-k="escenario">' + ops([['medio', t('escenario_medio')], ['alto', t('escenario_alto')], ['bajo', t('escenario_bajo')]], np.escenario) + '</select></label>' +
      '<h3>' + t('np_avatar') + '</h3>' +
      '<label class="campo"><span>' + t('np_tu_nombre') + '</span><input type="text" maxlength="30" value="' + esc(np.avNombre) + '" data-i="np" data-k="avNombre"></label>' +
      '<div class="fila"><label class="campo crece"><span>' + t('np_sexo') + '</span><select data-c="np" data-k="avSexo">' + ops([['F', t('mujer')], ['M', t('hombre')]], np.avSexo) + '</select></label>' +
      '<label class="campo crece"><span>' + t('np_edad') + '</span><input type="number" min="16" max="80" value="' + np.avEdad + '" data-i="np" data-k="avEdad"></label></div>' +
      '<button class="btn" data-a="npDadoAvatar">' + icono('dado') + ' Otro nombre para tu avatar</button>' + avatar2 +
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
  // V34: tipo de industria; si el año elegido es anterior a ese medio, se usa el que corresponde a la época
  function indNp() { const x = D.industria(np.industria); return x.desde <= np.anio && x.id === np.industria ? x : D.industria(np.anio >= D.CINE_DESDE ? 'Cine' : 'Teatro'); }
  ac('npInd', function (v) { np.industria = v; const y = document.getElementById('vista').scrollTop; U.acciones.nuevaPartida(); document.getElementById('vista').scrollTop = y; });
  ac('npNombre', function (v) { np.nombre = v; cacheT = -1; });
  // Deslizadores de identidad (V15, a pedido): 20 estilos de logo, 20 colores de logo, de fondo y de letras, 20 tipografías
  const NOMBRES_LOGO = { s: 'Tipo de logo', c: 'Color del logo', b: 'Color de fondo', t: 'Color de letras', f: 'Tipo de letra' };
  function textoLogo(k, v) { return k === 'f' ? NOMBRES_FUENTE[v] : String(+v + 1) + ' de 20'; }
  function deslizadorLogo(k, v, accion) {
    return '<label class="campo rango"><span>' + NOMBRES_LOGO[k] + ': <b id="lg-' + accion + '-' + k + '">' + esc(textoLogo(k, v)) + '</b></span><input type="range" min="0" max="19" step="1" value="' + v + '" data-i="' + accion + '" data-c="' + accion + 'Fin" data-k="' + k + '" aria-label="' + NOMBRES_LOGO[k] + '"></label>';
  }
  function moverLogo(L, el, accion, raiz) {
    const k = el.getAttribute('data-k');
    L[k] = N.limitar(Math.round(+el.value), 0, 19);
    const lbl = document.getElementById('lg-' + accion + '-' + k);
    if (lbl) lbl.textContent = textoLogo(k, L[k]);
    const r = document.getElementById(raiz);
    if (r) U.dibujar(r);
  }
  ac('npLogo', function (v, el) { U.estado.logoNuevo = Object.assign({}, U.estado.logoNuevo); moverLogo(U.estado.logoNuevo, el, 'npLogo', 'npLogoVista'); cacheT = -1; });
  ac('npLogoFin', function () { cacheT = -1; });
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
  function redibujarNP() { const y = document.getElementById('vista').scrollTop; U.acciones.nuevaPartida(); document.getElementById('vista').scrollTop = y; }
  ac('npRegion', function (v) { np.region = v; np.capital = 0; const r = D.regionesInicio.filter(function (x) { return x.id === v; })[0]; if (r && r.pais) np.pais = r.pais; redibujarNP(); });
  ac('npModo', function (v) { np.modo = v; redibujarNP(); });
  ac('mtNp', function (v, el) { np[el.getAttribute('data-k')] = v; redibujarNP(); });
  ac('mtNpB', function (v, el) { np[el.getAttribute('data-k')] = !!v; });
  ac('mtPerso', function (v, el) { np.perso[el.getAttribute('data-k')] = +v; redibujarNP(); });
  ac('npEnf', function (v, el) { const k = el.getAttribute('data-k'); (k[0] === 'g' ? np.enfG : np.enfT)[+k[1]] = v; });
  // Dado de nombres (sin azar de la partida: es solo para elegir)
  let dadoN = 1;
  const PARTES = ['Aurora', 'Cóndor', 'Faro', 'Quimera', 'Linterna', 'Meridiano', 'Brújula', 'Ámbar', 'Telón', 'Cometa', 'Atlas', 'Prisma', 'Halcón', 'Ola', 'Galaxia', 'Sauce'];
  const PARTES2 = ['Dorada', 'del Sur', 'Norte', 'Nueva', 'Azul', 'de Plata', 'Eterna', 'Roja', 'del Alba', 'Mágica'];
  function nombreDado() { dadoN = (dadoN * 31 + 7) % 9973; return PARTES[dadoN % PARTES.length] + ' ' + PARTES2[Math.floor(dadoN / 7) % PARTES2.length]; }
  ac('npDadoNombre', function () { np.nombre = nombreDado(); cacheT = -1; redibujarNP(); });
  ac('npDadoAvatar', function () {
    dadoN = (dadoN * 17 + 3) % 9973;
    const reg = (D.pais(np.pais) || D.pais('us')).region;
    const NOMS = { F: ['Lucía', 'Marta', 'Elena', 'Sofía', 'Valeria', 'Inés', 'Aiko', 'Amara', 'Priya', 'Chloe'], M: ['Mateo', 'Andrés', 'Tomás', 'Kenji', 'Kwame', 'Ravi', 'Lucas', 'Hugo', 'Omar', 'Diego'] };
    const AP = ['Rojas', 'Valdés', 'Moreau', 'Tanaka', 'Okafor', 'Sharma', 'Blake', 'Ferrari', 'Novak', 'Duarte'];
    np.avNombre = NOMS[np.avSexo][dadoN % 10] + ' ' + AP[Math.floor(dadoN / 10) % 10];
    void reg; redibujarNP();
  });
  // Inicio al azar: un dado arma toda la partida (región, era, enfoque, nombres, logo, avatar)
  ac('npAzar', function () {
    dadoN = (dadoN * 53 + Date.now() % 97) % 9973;
    const pick = function (l) { dadoN = (dadoN * 29 + 11) % 9973; return l[dadoN % l.length]; };
    const eras = [1900, 1925, 1950, 1970, 1985, 2000, 2015, 2026];
    np.anio = pick(eras);
    const regs = D.regionesInicio.filter(function (r) { return r.desde <= np.anio; });
    const r = pick(regs); np.region = r.id; if (r.pais) np.pais = r.pais;
    const gens = []; D.familias.forEach(function (f) { f.generos.forEach(function (g) { if (g !== 'Erótico') gens.push(g); }); });
    np.enfG = [pick(gens), pick(gens), pick(gens)];
    np.tf = pick(IA.carrera.TRASFONDOS).id; np.arq = pick(IA.carrera.ARQUETIPOS).id;
    np.vision = pick(D.visiones).id; np.publico = pick(D.publicos).id; np.tipo = pick(D.tiposEstudio);
    np.sufijo = pick(D.sufijosLogo); np.nombre = nombreDado(); np.capital = 0;
    np.logoN = (np.logoN * 7 + 13) % 997; U.estado.logoNuevo = IA.arte.logoAleatorio(np.logoN);
    cacheT = -1; redibujarNP();
  });
  ac('empezar', function () {
    const edad = N.limitar(Math.round(+np.avEdad || 30), 16, 80);
    J.nuevaPartida({
      semilla: (np.semilla || '').trim() || String(Date.now() % 1e9), anio: np.anio, nombre: (np.nombre || '').trim() || 'INDUSTRY ART',
      logo: U.estado.logoNuevo, pais: np.pais, capital: np.capital || J.capitalRecomendado(np.anio), dificultad: np.dificultad,
      escenario: np.escenario, personalidad: np.personalidad, creado: new Date().toISOString(),
      tipo: np.tipo, vision: np.vision, publico: np.publico, industria: indNp().id,
      avatar: { nombre: (np.avNombre || '').trim() || 'Felipe', sexo: np.avSexo, edad: edad, especialidades: np.esp },
      modoJuego: np.modoJuego, reto: np.reto === undefined ? undefined : np.reto || null, tutorial: !!np.tutorial, perso: np.perso,
      region: np.region, sufijo: np.sufijo, trasfondo: np.tf, arquetipo: np.arq, modo: np.modo, oficio: np.oficio,
      enfoque: { gen: np.enfG.filter(function (x, i, a) { return x && a.indexOf(x) === i; }), tem: np.enfT.filter(function (x, i, a) { return x && a.indexOf(x) === i; }) },
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
    // Dilemas de rodaje y pruebas de público que esperan tu decisión (V19)
    J.decisionesPendientes().forEach(function (o) {
      out.push({ txt: '«' + o.tit + '»: ' + (o.dil ? 'un dilema en ' + O.NOMBRE_ETAPA[o.et].toLowerCase() : 'resultado de la prueba de público (' + o.prueba.p + ' de 100)'), btn: 'Decidir', a: 'verDecision', v: o.id, imp: 1 });
    });
    // V21: vida del avatar, heredero, candidatos y encargos
    if (S.herederos || IA.carrera.vidaPendiente()) out.push({ txt: S.herederos ? 'Elige a tu heredero' : 'Una decisión de tu vida te espera', btn: 'Decidir', a: 'verPendientes', imp: 1 });
    if ((S.candidatos || []).length) out.push({ txt: S.candidatos.length + ' candidatos esperan en la bandeja', btn: 'Ver', a: 'irSede' });
    if ((S.ofertas || []).some(function (o) { return o.vence > S.t; })) out.push({ txt: 'Tienes ofertas de encargo como talento', imp: 1 });
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
      '<canvas id="lienzoEstudio" class="estudio-lienzo" role="img" aria-label="Tu estudio: toca un piso para ver su departamento" data-a="tocarEstudio"></canvas>' +
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
      kpi('Prestigio', Math.round(est.fama * 100) + ' / 100') + kpi('Fans', U.grande(S.fans || 0)) +
      kpi(t('est_clase'), est.clase || 'C') +
      kpi('Típico de la época', dinero(E.presupuestoTipico(N.anio()))) +
      kpi('Entrada de cine', dinero(M.precioEntrada('nam', N.anio()))) +
      '</div></div>' +
      IA.metasUI.tarjetas() + IA.prensaUI.banner() + IA.imperioUI.bitacora() + IA.calendarioUI.tarjetasEstudio() +
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
  // Animación del edificio, solo si se ve. V33 (celulares): 20 cuadros por segundo a ×1,5 como mucho; el ciclo se apaga
  // cuando el lienzo no está en pantalla, y con «Menos animación» solo se redibuja cuando cambia algo.
  let anim = null, ultimoCuadro = 0, cacheDatos = null, cacheT = -1, firmaQuieta = '';
  let ultimoToque = Date.now();
  if (typeof document !== 'undefined') ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { ultimoToque = Date.now(); }, { passive: true, capture: true }); });
  function animar(ts) {
    const cv = document.getElementById('lienzoEstudio');
    if (!cv) { anim = null; return; }
    anim = requestAnimationFrame(animar);
    // 20 cuadros por segundo; tras 30 s sin tocar la pantalla, 4 (ahorra batería con el juego abierto y quieto)
    if (document.hidden || ts - ultimoCuadro < (Date.now() - ultimoToque > 30000 ? 250 : 50)) return;
    ultimoCuadro = ts;
    const d = Math.min(1.5, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    const tt = N.S ? N.S.t : -2;
    if (U.ajustes().movimiento) {
      const firma = w + 'x' + h + '|' + tt + '|' + cacheT;
      if (firma === firmaQuieta) return;
      firmaQuieta = firma;
    }
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    if (!cacheDatos || cacheT !== tt) { cacheDatos = datosEstudio(); cacheT = tt; }
    IA.arte.estudio(c, w, h, ts, cacheDatos);
  }
  // V34: tocar un piso del edificio abre su departamento; un terreno, su ficha
  ac('tocarEstudio', function (v, el, ev) {
    if (!ev || !cacheDatos) return;
    const r = el.getBoundingClientRect(), q = IA.arte.estudioEn(el.clientWidth, el.clientHeight, cacheDatos, ev.clientX - r.left, ev.clientY - r.top);
    if (!q) return;
    if (q.tipo === 'piso' && q.id !== 'vacio' && U.acciones.verDepto) { U.acciones.verDepto(q.id); return; }
    const info = q.tipo === 'terreno' && q.id !== 'vacio' ? NG.infoTerreno(q.id) : null;
    if (info) U.modal('<h2>' + esc(info.nombre) + '</h2><p>' + esc(info.efecto || '') + '</p><button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
    else U.irA('negocio', 'estudio'); // un lote vacío: a construir
  });
  function alMostrar(sec) {
    cacheT = -1; firmaQuieta = '';
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
  ac('verPendientes', function () { IA.calendarioUI.mostrarPendientes(); });
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
    const marcha = O.enProduccion(0), listas = O.delEstudio(0, ['lista']), cart = O.delEstudio(0, ['cartelera', 'emision']);
    let h = titulo(t('sec_obras'), 'obras', '<button class="btn primario" data-a="crearObra">' + icono('mas') + t('crear_obra') + '</button>' + (IA.tv.puedeTV(N.anio()) ? '<button class="btn" data-a="tvNuevaSerie">' + icono('mas') + 'Nueva serie</button>' : '')) +
      pestanas('obras', [['marcha', t('obras_marcha') + ' (' + marcha.length + ')'], ['listas', t('obras_listas') + ' (' + listas.length + ')'], ['cartelera', t('obras_cartelera') + ' (' + cart.length + ')'], ['catalogo', t('obras_catalogo')], ['franquicias', 'Franquicias'], ['adquisicion', 'Adquisición'], ['musica', 'Música'], ['juegos', 'Videojuegos'], ['teatro', 'Teatro'], ['libros', 'Libros'], ['filmografia', 'Filmografía'], ['panel', 'Panel']], s);
    h += '<div class="lista-obras">';
    if (s === 'marcha') {
      h += IA.teleUI.pilotos();
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
        if (o.tv && o.tv.em) return tarjetaObra(o, '<span>En emisión: episodio ' + o.tv.em.ep + ' de ' + o.tv.eps + ' · ' + esc(IA.tv.DONDE[o.tv.em.d].nombre) + '</span><span class="tenue chico">Promedio ' + U.decimal(IA.tv.promedioAud(o), 1) + ' M por episodio</span>');
        const ult = o.hs && o.hs.length ? o.hs[o.hs.length - 1] : 0;
        return tarjetaObra(o, '<span>' + t('bruto') + ': <b>' + dinero(o.bruto) + '</b> · última semana ' + dinero(ult) + '</span><span class="tenue chico">' + t('semanas_cartelera') + ': ' + o.sc + ' · ' + t('critica') + ' ' + o.crit + ' · ' + t('publico') + ' ' + o.pub + '</span>');
      }).join('') : vacio();
    } else if (['musica', 'juegos', 'teatro', 'libros'].indexOf(s) >= 0) {
      h += '</div>' + IA.mediosUI.medio(s) + '<div>';
    } else if (s === 'franquicias' || s === 'adquisicion') {
      h += '</div>' + (s === 'franquicias' ? IA.teleUI.franquicias() : IA.teleUI.adquisicion()) + '<div>';
    } else if (s === 'filmografia' || s === 'panel') {
      h += '</div>' + (s === 'panel' ? IA.prensaUI.panel() : IA.prensaUI.filmografia()) + '<div>';
    } else {
      const cat = N.S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada'; }).sort(function (a, b) { return b.fe - a.fe; });
      const tope = U.estado.catalogoVer || 30; // V33: de 30 en 30 (un catálogo de cientos de obras pesaba en el celular)
      h += cat.length ? '<div class="rejilla">' + cat.slice(0, tope).map(function (o) {
        const m = O.multiplicador(o);
        return '<button class="tarjeta toque" style="text-align:left;display:block" data-a="verObra" data-v="' + o.id + '"><canvas class="poster" style="width:100%;height:auto;aspect-ratio:2/3" data-poster="' + o.id + '"></canvas><b>' + esc(o.tit) + '</b><br><span class="tenue chico">' + o.anio + '</span> <span class="etiqueta ' + (m >= 2.5 ? 'bien' : m < 1.4 ? 'mal' : '') + '">' + mult(o) + '</span>' + ((o.aw || []).length ? ' <span class="etiqueta oro">' + o.aw.length + ' premio' + (o.aw.length > 1 ? 's' : '') + '</span>' : '') +
          (o.cert ? ' <span class="etiqueta oro">' + esc(o.cert) + '</span>' : '') + (o.bov ? ' <span class="etiqueta">bóveda</span>' : '') + (o.dir ? ' <span class="etiqueta">directo a ' + (o.dir === 'video' ? 'video' : 'streaming') + '</span>' : '') + '</button>';
      }).join('') + '</div>' + (cat.length > tope ? '<button class="btn bloque" data-a="catalogoMas">Ver más (' + (cat.length - tope) + ')</button>' : '') : vacio();
    }
    return h + '</div>';
  }

  // ---------- Ficha de obra ----------
  function fichaObra(id) {
    const o = O.porId(id);
    if (!o) return '<p class="tenue">Esta obra pasó al resumen histórico del año: ya no tiene ficha propia.</p>';
    const est = N.S.estudios[o.est];
    const estrenada = o.et === 'cartelera' || o.et === 'terminada';
    let h = '<div class="fila" style="align-items:flex-start"><canvas class="poster grande" data-poster="' + o.id + '"></canvas><div class="col crece">' +
      '<h2>' + esc(o.tit) + '</h2><span>' + esc(generosTxt(o)) + '</span><span class="tenue">' + esc(o.clas) + ' · ' + esc(o.tono || '') + '</span>' +
      '<span class="tenue">' + esc(est ? est.nombre : '') + (o.anio ? ' · ' + o.anio : '') + '</span><span class="etiqueta">' + O.NOMBRE_ETAPA[o.et] + '</span>' +
      ((o.aw || []).length ? '<span class="etiqueta oro">' + o.aw.map(function (a) { return D.premios.categorias.filter(function (c) { return c.id === a; })[0].nombre; }).join(', ') + '</span>' : '') + '</div></div>';
    if (o.est === 0 && O.ETAPAS.indexOf(o.et) < 4) h += '<p>' + t('progreso') + ': ' + O.NOMBRE_ETAPA[o.et] + ' · ' + t('faltan', { n: PR.semanasRestantes(o) }) + '</p>' + barraP(PR.progreso(o));
    if (o.est === 0 && o.et === 'lista' && !o.prog && !o.tv) h += '<p><button class="btn primario bloque" data-a="programar" data-v="' + o.id + '">' + t('programar') + '</button></p>';
    if (o.et === 'lista' && o.prog) h += '<p class="oro">' + (o.plan && o.plan.via && o.plan.via !== 'cines' ? 'Estreno directo en ' + (o.plan.via === 'video' ? 'video' : 'streaming') : 'Estreno') + ': ' + esc(U.fecha(o.fe)) + ' · campaña ' + D.nivelesMarketing[o.nivM].nombre.toLowerCase() + '</p>';
    if (o.est === 0 && (o.prog || estrenadaYa(o))) h += IA.distribucion.resumenPlan(o);
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
    // Lanzamiento (V20): dinero en cadena, ventanas y acciones del catálogo
    if (vis) h += IA.distribucion.bloqueDinero(o) + IA.distribucion.bloqueVentanas(o) + IA.distribucion.bloqueCatalogo(o);
    if (vis || o.est === 0) h += IA.prensaUI.bloqueObra(o);
    h += IA.teleUI.bloqueObra(o); // franquicia y serie (V23)
    if (o.est === 0 || estrenada) h += IA.creacion.bloqueIdea(o);
    // V34: herramienta de ideas: notas del autor y el documento completo de la idea (trama y datos técnicos) en Word
    if (o.est === 0 && (o.pj || o.sin || o.gen)) h += '<div class="tarjeta"><h3>Desarrolla tu idea</h3><p class="nota">Descarga la trama completa (planteamiento, nudo, desenlace y escaleta), los personajes y los datos técnicos en un documento de Word. Tus notas van al final.</p>' +
      '<label class="campo"><span>Notas del autor</span><textarea rows="4" maxlength="4000" data-i="obraDiario" data-v="' + o.id + '" placeholder="Escenas, diálogos, ideas sueltas…">' + esc(o.diario || '') + '</textarea></label>' +
      '<div class="fila"><button class="btn primario" data-a="docIdea" data-v="' + o.id + '">Descargar documento (.docx)</button><button class="btn" data-a="docTexto" data-v="' + o.id + '">Ver la trama</button></div></div>';
    if (o.est === 0) h += IA.creacion.bloqueProduccion(o);
    if (o.est === 0 && o.et !== 'terminada' && o.et !== 'cartelera') {
      h += '<div class="kpis">' + kpi(t('costo_talento'), dinero(o.cf)) + kpi(t('costo_produccion'), dinero(o.pp * (o.sobre || 1))) + kpi('Gastado en producción', dinero(o.gp || 0)) + '</div>';
    }
    if (o.eq && o.gen) {
      // Departamentos (V19): la nota de cada uno, en una telaraña; lo que más pesa va primero
      const fam = D.familia(o.fam || 'DR');
      const ns = IA.rodaje.notas(o);
      const gr = U.grafica('radar' + o.id, function (cv) { IA.arte.radar(cv, ns.map(function (n) { return n.v; }), ns.map(function (n) { return n.nombre; })); });
      h += '<h3>Departamentos</h3><canvas class="lienzo" style="height:220px" data-grafica="' + gr + '"></canvas><p class="nota">Lo que más pesa en ' + esc(fam.nombre.toLowerCase()) + ': ' + ns.slice(0, 3).map(function (n) { return n.nombre.toLowerCase(); }).join(', ') + '.</p>';
    }
    h += '<h3>' + t('paso_equipo') + '</h3>';
    if (o.cr && o.cr.ejecutiva) h += '<p class="tenue">Producción ejecutiva: ' + esc(o.cr.ejecutiva) + '</p>';
    if (o.eq) {
      h += '<div class="col">' + O.TODOS_ROLES.concat(['int0', 'int1']).map(function (r) {
        const id = r === 'int0' ? o.eq.int[0] : r === 'int1' ? o.eq.int[1] : o.eq[r];
        const ta = T.porId(id);
        const nombre = ta ? ta.nom : '';
        if (!nombre) return '';
        const of = r.indexOf('int') === 0 ? 'Intérprete' : T.nombreOficio(ta, r);
        return '<button class="tarjeta toque fila" data-a="verTalento" data-v="' + id + '"><canvas class="retrato" data-retrato="' + id + '"></canvas><div class="col"><b>' + esc(nombre) + '</b><span class="tenue chico">' + esc(of) + (ta ? ' · ' + t('tal_habilidad').toLowerCase() + ' ' + Math.round(ta.hab) : '') + '</span></div></button>';
      }).join('') + '</div>';
    } else if (o.cr) {
      h += '<p>Dirección: ' + esc(o.cr.direccion || '') + '<br>Reparto: ' + esc((o.cr.reparto || []).join(', ')) + '</p>';
    }
    return h;
  }
  function estrenadaYa(o) { return o.et === 'cartelera' || o.et === 'terminada'; }
  ac('verObra', function (v) { U.abrirFicha(fichaObra(+v), 'obra:' + v); });
  ac('obraDiario', function (v, el) { const o = O.porId(+el.getAttribute('data-v')); if (o && o.est === 0) o.diario = String(v).slice(0, 4000); });
  ac('docIdea', function (v) {
    const o = O.porId(+v);
    if (!o) return;
    IA.documento.descargar(o).then(function (r) { U.aviso(r.ok ? 'Documento listo: ' + r.nombre : 'No se pudo guardar el documento: usa «Ver la trama» y cópiala.', r.ok ? '' : 'mal'); });
  });
  ac('docTexto', function (v) {
    const o = O.porId(+v);
    if (o) U.modal('<h2>' + esc(o.tit) + '</h2><textarea rows="18" style="width:100%" readonly>' + esc(IA.documento.texto(o)) + '</textarea><button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
  });
  ac('catalogoMas', function () { U.estado.catalogoVer = (U.estado.catalogoVer || 30) + 30; U.refrescar(); }); // V33

  // ---------- Programar estreno: el plan de lanzamiento vive en IA.distribucion (V20) ----------

  // =====================================================================
  // TALENTO (la sección y la ficha viven en IA.agencia desde la V18)
  // =====================================================================
  function talento() { return IA.agencia.talento(); }
  function fichaTalento(id) { return IA.agencia.fichaTalento(id); }

  // =====================================================================
  // MUNDO
  // =====================================================================
  function mundo() {
    const s = sub('mundo', 'cartelera');
    let h = titulo(t('sec_mundo'), 'mundo') + pestanas('mundo', [['cartelera', t('mun_cartelera')], ['calendario', t('mun_calendario')], ['premios', t('mun_premios')], ['festivales', 'Festivales'], ['revista', 'Revista'], ['redes', 'Redes'], ['rivales', t('mun_rivales')], ['historia', 'Historia'], ['metas', 'Metas'], ['editor', 'Editor'], ['periodico', t('mun_periodico')], ['tendencias', t('mun_tendencias')], ['poblacion', t('mun_poblacion')], ['mapa', 'Mapa'], ['taxonomia', 'Taxonomía']], s);
    return h + ({ cartelera: mCartelera, calendario: mCalendario, premios: IA.prensaUI.premios, festivales: IA.prensaUI.festivales, revista: IA.prensaUI.revista, redes: IA.prensaUI.redes, rivales: IA.imperioUI.rivales, historia: IA.imperioUI.historia, metas: IA.metasUI.metas, editor: IA.metasUI.editor, periodico: mPeriodico, tendencias: mTendencias, poblacion: mPoblacion, mapa: mMapa, taxonomia: IA.creacion.taxonomia }[s] || mCartelera)();
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
  function mCalendario() { return IA.calendarioUI.calendario(); }
  function mPeriodico() {
    const S = N.S;
    const medio = N.anio() < 1920 ? 'Diario impreso' : N.anio() < 1950 ? 'Diario y radio' : N.anio() < 1995 ? 'Noticiero de TV' : N.anio() < 2006 ? 'Portal web' : 'Redes y noticias en línea';
    return '<p class="nota">' + esc(medio) + ' · ' + esc(M.era(N.anio())) + '</p>' + (S.noticias.length ? S.noticias.slice(0, 80).map(function (n) {
      return '<div class="tarjeta"><span class="tenue chico">' + esc(U.fecha(n.t)) + '</span><br>' + (n.imp ? '<b>' : '') + textoNoticia(n) + (n.imp ? '</b>' : '') + '</div>';
    }).join('') : vacio(t('nada_nuevo')));
  }
  function mTendencias() {
    const S = N.S;
    return '<h3>En el mundo</h3><p class="nota">Las familias de géneros suben y bajan en olas; si todos estrenan lo mismo, el público se cansa.</p>' + D.familias.map(function (f) {
      const v = S.mundo.tendencias[f.id] || 0;
      const w = Math.round(Math.abs(v) * 50);
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(f.nombre) + '</b><span class="' + (v > 0.2 ? 'bien' : v < -0.2 ? 'mal' : 'tenue') + '">' + (v > 0.2 ? 'en alza' : v < -0.2 ? 'en baja' : 'estable') + ' (' + (v >= 0 ? '+' : '') + U.decimal(v, 2) + ')</span></div>' +
        '<div class="barra-p" style="position:relative"><i style="position:absolute;left:' + (v >= 0 ? 50 : 50 - w) + '%;width:' + w + '%;background:' + (v >= 0 ? 'var(--bien)' : 'var(--mal)') + '"></i></div><span class="nota">' + esc(f.generos.join(', ')) + '</span></div>';
    }).join('') + IA.distribucion.tendenciasRegion();
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
    let h = '<p class="nota">El tamaño de cada círculo es su público de cine en ' + anio + '. <span class="oro">Dorado</span>: tu sede · <span class="rosa">Rosa</span>: sedes rivales. Tus sedes en otros países se abren en Negocio › Imperio y tus cines propios en Negocio › Estudio › Terrenos.</p>' +
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
    }).join('') + '</table></div><p class="nota">Radio, TV, internet y consolas compiten con el cine por el tiempo libre, y cada uno es también un mercado propio (TV, streaming, música y videojuegos).</p>';
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
      IA.arte.piramide(cv, ed.map(function (x) { return Math.round(x * 1000) / 10; }), M.GRUPOS, { formato: function (v) { return U.decimal(v, 1) + ' %'; } }); // V34: pirámide de verdad
    });
    h += '<h3>Pirámide de edades en ' + esc(D.region(reg).nombre) + '</h3><canvas class="lienzo" style="height:220px" data-grafica="' + g2 + '"></canvas>';
    return h;
  }

  // =====================================================================
  // NEGOCIO
  // =====================================================================
  function negocio() {
    const s = sub('negocio', 'finanzas');
    return titulo(t('sec_negocio'), 'negocio') + pestanas('negocio', [['finanzas', t('neg_finanzas')], ['estudio', t('neg_estudio')], ['sede', 'Sede y personal'], ['distribucion', 'Distribución'], ['canal', 'Canal de TV'], ['streaming', 'Streaming'], ['banco', 'Banco'], ['imperio', 'Imperio'], ['mercado', t('neg_mercado')]], s) +
      ({ finanzas: nFinanzas, estudio: nEstudio, sede: IA.calendarioUI.negocioSede, distribucion: IA.distribucion.negocioDistribucion, canal: IA.teleUI.canal, streaming: IA.teleUI.streaming, banco: IA.imperioUI.banco, imperio: IA.imperioUI.imperio, mercado: nMercado }[s] || nFinanzas)();
  }
  // V34: primero lo operativo y la utilidad; debajo, el capital (préstamos, socio, acciones), que mueve la caja pero no paga impuestos
  function tablaLibro(libro) {
    const filas = [], cap = [];
    const fila = function (k, v, ing) { return '<tr><td>' + esc(NG.NOMBRES[k] || k) + '</td><td class="n ' + (ing ? 'bien' : 'mal') + '">' + (ing ? '' : '−') + dinero(v) + '</td></tr>'; };
    Object.keys(libro.ing).forEach(function (k) { (NG.esCapital(k) ? cap : filas).push(fila(k, libro.ing[k], true)); });
    Object.keys(libro.gas).forEach(function (k) { (NG.esCapital(k) ? cap : filas).push(fila(k, libro.gas[k], false)); });
    const r = NG.total(libro, 'ing') - NG.total(libro, 'gas');
    filas.push('<tr><td><b>' + t('utilidad') + '</b></td><td class="n ' + (r >= 0 ? 'bien' : 'mal') + '"><b>' + dinero(r) + '</b></td></tr>');
    if (cap.length) filas.push('<tr><td colspan="2" class="tenue chico">Movimientos de capital (mueven la caja, no la utilidad)</td></tr>' + cap.join(''));
    return '<table class="tabla">' + filas.join('') + '</table>';
  }
  function nFinanzas() {
    const S = N.S, est = est0(), g = NG.gastosFijosMes(0);
    let h = '<div class="kpis">' + kpi(t('caja'), dinero(est.caja), est.caja < 0 ? 'mal' : '') + kpi(t('comprometido'), dinero(NG.comprometido(0))) + kpi(t('caja_libre'), dinero(NG.cajaLibre(0))) + kpi(t('gasto_fijo'), dinero(g.personal + g.mantenimiento)) + kpi('Impuesto estimado del año', dinero(NG.impuestoEstimado(0))) + '</div>';
    h += '<div class="dos" style="margin-top:10px"><div class="tarjeta"><h3>Año ' + N.anio() + ' hasta hoy</h3>' + tablaLibro(S.fin.anio) + '<p class="nota">El impuesto del 25 % se paga al cerrar el año, solo sobre las utilidades.</p></div>';
    const ult = S.fin.meses[S.fin.meses.length - 1];
    h += '<div class="tarjeta"><h3>Mes en curso</h3>' + tablaLibro(S.fin.mes) + (ult ? '<p class="nota">Mes anterior: ingresos ' + dinero(ult.ing) + ', gastos ' + dinero(ult.gas) + '.</p>' : '') + '</div></div>';
    // V34: flujo de caja mes a mes (lo operativo; el capital va aparte en la tabla)
    if (S.fin.meses.length > 1) {
      const ms = S.fin.meses.slice(-24);
      const gf = U.grafica('flujo', function (cv) {
        const css = getComputedStyle(document.documentElement), netos = ms.map(function (x) { return x.ing - x.gas; });
        IA.arte.barras(cv, netos, ms.map(function (x) { return (x.mes + 1) + '/' + String(x.anio).slice(2); }), { formato: function (v) { return dinero(v); },
          colores: netos.map(function (v) { return v >= 0 ? css.getPropertyValue('--bien').trim() : css.getPropertyValue('--mal').trim(); }) });
      });
      h += '<h3>Flujo de caja mes a mes</h3><canvas class="lienzo" style="height:180px" data-grafica="' + gf + '"></canvas><p class="nota">Ingresos menos gastos de cada mes. Toca una barra para ver su valor.</p>';
    }
    if (S.fin.hist.length) {
      const hist = S.fin.hist.slice(-40);
      const g1 = U.grafica('cajaReal', function (cv) {
        const css = getComputedStyle(document.documentElement);
        IA.arte.linea(cv, [{ nombre: 'Caja en dólares de hoy', color: css.getPropertyValue('--acento').trim(), valores: hist.map(function (x) { return x.caja2025; }) },
          { nombre: 'Utilidad del año (hoy)', color: css.getPropertyValue('--dorado').trim(), valores: hist.map(function (x) { return M.aHoy(x.util, x.anio); }) }],
          hist.map(function (x) { return String(x.anio); }), { formato: function (v) { return U.dinero(v, 2025); } });
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
    let h = '<p class="nota">Tu edificio crece piso a piso y los terrenos se llenan de sets. Cada construcción cuesta más que la anterior y sube los gastos fijos. Las futuras se ven con candado y su pista. Hay 33 construcciones.</p>';
    h += '<div class="kpis">' + kpi(t('est_capacidad'), NG.capacidad(0)) + kpi('Pisos', est.pisos.length + ' / ' + D.MAX_PISOS) + kpi('Terrenos', est.terrenos.length + ' / ' + D.MAX_TERRENOS) + kpi(t('caja_libre'), dinero(NG.cajaLibre(0))) + '</div>';
    const fila = function (info, tipo) {
      const err = NG.puedeConstruir(tipo, info.id);
      const n = (tipo === 'piso' ? est.pisos : est.terrenos).filter(function (x) { return x === info.id; }).length;
      return '<div class="tarjeta fila entre"><div class="col crece"><b>' + esc(info.nombre) + (n ? ' <span class="etiqueta">tienes ' + n + '</span>' : '') + '</b><span class="chico">' + esc(info.efecto) + '</span>' + (info.desde > anio ? '<span class="tenue chico">Bloqueada hasta ' + info.desde + (info.pista ? ': ' + esc(info.pista.toLowerCase()) : '') + '</span>' : '') + (info.desde > anio ? '<span class="tenue chico">Desde ' + info.desde + '</span>' : '') + '</div>' +
        '<button class="btn' + (err ? '' : ' primario') + '" data-a="construir" data-v="' + tipo + ':' + info.id + '"' + (err ? ' disabled title="' + esc(err) + '"' : '') + '>' + dinero(NG.costoConstruccion(info)) + '</button></div>';
    };
    h += '<h3>Pisos del edificio</h3>' + D.pisos.filter(function (p) { return p.id !== 'oficinas'; }).map(function (p) { return fila(p, 'piso'); }).join('');
    h += '<h3>Terrenos</h3>' + D.terrenos.map(function (p) { return fila(p, 'terreno'); }).join('');
    // Almacén de sets (V19): los sets de tus obras quedan guardados para reusarlos
    const sets = est.sets || [];
    h += '<h3>Almacén de sets (' + sets.length + ' de ' + IA.rodaje.capacidadSets(0) + ')</h3>' + (sets.length ? sets.map(function (x) {
      return '<div class="tarjeta fila entre"><div class="col crece"><b>' + esc(x.nombre) + '</b><span class="chico">De «' + esc(x.obra) + '» (' + x.anio + ') · calidad ' + x.q + ' · ' + x.usos + ' uso' + (x.usos === 1 ? '' : 's') + '</span></div><button class="btn" data-a="desarmarSet" data-v="' + x.id + '">Desarmar</button></div>';
    }).join('') : '<p class="tenue">Los sets que construyas para tus obras se guardan aquí y se pueden reusar (más barato y una semana menos). Caben más con platós y backlots.</p>');
    // Editar la descripción del estudio (tu documento): logo con deslizadores, público, visión y tipo de industria
    const opsSel = function (k, lista, actual) { return '<select data-c="estEditar" data-k="' + k + '">' + lista.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === actual ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') + '</select>'; };
    h += '<h3>Identidad del estudio</h3><div class="tarjeta"><div class="fila" id="estLogoVista"><canvas data-logo="0" style="width:64px;height:64px"></canvas><b>' + esc(est.nombre) + '</b></div>' +
      ['s', 'c', 'b', 't', 'f'].map(function (k) { return deslizadorLogo(k, est.logo[k] || 0, 'estLogo'); }).join('') +
      '<div class="fila"><label class="btn">' + (U.logoPropio() ? 'Cambiar la imagen del logo' : 'Usar una imagen propia') + '<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-c="estLogoImg" class="oculto"></label>' +
      (U.logoPropio() ? '<button class="btn" data-a="estLogoQuitar">Volver al logo dibujado</button>' : '') + '</div>' +
      '<p class="nota">La imagen propia se guarda solo en este dispositivo: no viaja en la partida, en el archivo .iasave ni en los pósters.</p>' +
      '<label class="campo"><span>Público objetivo</span>' + opsSel('publico', D.publicos.map(function (x) { return [x.id, x.id + ' · ' + x.efecto]; }), est.publico) + '</label>' +
      '<label class="campo"><span>Visión de la industria</span>' + opsSel('vision', D.visiones.map(function (x) { return [x.id, x.id + ' · ' + x.efecto]; }), est.vision) + '</label>' +
      '<label class="campo"><span>Tipo de estudio</span>' + opsSel('tipo', D.tiposEstudio.map(function (x) { return [x, x]; }), est.tipo) + '</label>' +
      '<p class="nota">Industria de origen: <b>' + esc(D.industria(est.industria).id) + '</b> · ' + esc(D.industria(est.industria).efecto) + '. Cambiar la visión o el público cambia sus efectos en tus próximas obras.</p></div>';
    return h;
  }
  ac('estLogo', function (v, el) { const est = est0(); est.logo = Object.assign({}, est.logo); moverLogo(est.logo, el, 'estLogo', 'estLogoVista'); });
  ac('estLogoFin', function () { U.refrescar(); });
  ac('desarmarSet', function (v) {
    const est = est0(), id = +v;
    const usa = O.activas().filter(function (o) { return o.est === 0 && o.setR === id && ['lista', 'cartelera', 'terminada'].indexOf(o.et) < 0; })[0];
    if (usa) { U.aviso('Lo está usando «' + usa.tit + '».', 'mal'); return; }
    est.sets = (est.sets || []).filter(function (x) { return x.id !== id; });
    U.aviso('Set desarmado');
    U.refrescar();
  });
  ac('estEditar', function (v, el) {
    const est = est0(), k = el.getAttribute('data-k');
    if (['publico', 'vision', 'tipo'].indexOf(k) < 0) return;
    est[k] = v;
    U.aviso('Identidad actualizada');
    U.refrescar();
  });
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
    let h = IA.calendarioUI.adnMercado() + '<div class="kpis">' + kpi(t('est_cuota'), U.pct(cuota)) + kpi('Cuota del año pasado', ult ? U.pct(ult.cuota) : '—') + kpi('Puesto del año pasado', ult && ult.puesto ? ult.puesto + '.º' : '—') + kpi(t('est_clase'), est0().clase || 'C') + '</div>';
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
      '<label class="campo"><span>Idioma · Language</span>' + sel('idioma', [['es', 'Español'], ['en', 'English']]) + '</label>' +
      '<label class="campo"><span>' + t('aj_tema') + '</span>' + sel('tema', [['oscuro', t('tema_oscuro')], ['claro', t('tema_claro')], ['epoca', t('tema_epoca')], ['contraste', t('tema_contraste')]]) + '</label>' +
      '<label class="campo"><span>' + t('aj_texto') + '</span>' + sel('texto', [[1, 'Pequeño'], [2, 'Normal'], [3, 'Grande'], [4, 'Muy grande']]) + '</label>' +
      '<label class="campo"><span>' + t('aj_orientacion') + '</span>' + sel('orientacion', [['auto', t('ori_auto')], ['vertical', t('ori_vertical')], ['horizontal', t('ori_horizontal')]]) + '</label>' +
      '<label class="campo"><span>' + t('gua_autoguardado') + '</span>' + sel('autoguardado', [['mes', t('auto_mes')], ['anio', t('auto_anio')], ['no', t('auto_no')]]) + '</label>' +
      sw('sonido', t('aj_sonido')) + sw('movimiento', t('aj_movimiento')) + sw('vibracion', t('aj_vibracion')) + sw('dineroHoy', t('dinero_hoy')) + sw('musica', 'Música de fondo') + sw('dalton', 'Colores para daltonismo') +
      '<p></p><div class="col">' + (N.S ? '<button class="btn" data-a="abrirGuardado">' + t('gua_titulo') + '</button><button class="btn" data-a="laboratorio">' + t('aj_laboratorio') + '</button><button class="btn peligro" data-a="salir">' + t('aj_salir') + '</button>' : '') +
      (IA.publicacion.privacidadDisponible() ? '<button class="btn" data-a="privacidadAnuncios">Privacidad de los anuncios</button>' : '') + '</div>' +
      compraCompleta() +
      '<p class="nota">' + t('juego') + ' ' + IA.VERSION + ' · ' + IA.publicacion.nombrePlataforma() + ' · ' + t('creditos') + '</p>';
  }
  // V32: compra única «Versión completa» (solo quita el anuncio); en la web y en PC no aparece
  function compraCompleta() {
    const P = IA.publicacion;
    if (!P.compraDisponible()) return '';
    if (P.tieneCompleta()) return '<p class="oro">Versión completa · ¡gracias por apoyar el juego!</p>';
    const pr = P.precioGuardado();
    return '<div class="tarjeta"><h3>Versión completa</h3><p class="nota">Una sola compra quita el anuncio al abrir. El juego es el mismo para todos.</p>' +
      '<div class="col"><button class="btn primario" data-a="comprarCompleta">Quitar el anuncio' + (pr ? ' · ' + esc(pr) : '') + '</button>' +
      '<button class="btn" data-a="restaurarCompras">Restaurar compras</button></div></div>';
  }
  function reabrirAjustes() { if (U.modalAbierto() && document.querySelector('#modal [data-k="idioma"]')) U.modal(ajustes()); } // solo si Ajustes sigue abierto
  ac('abrirAjustes', function () {
    U.modal(ajustes());
    // El precio llega de la tienda (en la moneda del país): se pide una vez y se redibuja
    if (IA.publicacion.compraDisponible() && !IA.publicacion.tieneCompleta() && !IA.publicacion.precioGuardado()) IA.publicacion.precio().then(function (p) { if (p) reabrirAjustes(); });
  });
  ac('comprarCompleta', function () {
    IA.publicacion.comprar().then(function (r) {
      const txt = { ok: '¡Listo! Ya no verás el anuncio al abrir. Gracias por apoyar el juego.', pendiente: 'El pago está pendiente: cuando se confirme, el anuncio desaparece.',
        cancelada: 'Compra cancelada.', error: 'No se pudo completar la compra. Revisa tu conexión e inténtalo otra vez.' }[r];
      U.aviso(txt, r === 'error' ? 'mal' : '');
      reabrirAjustes();
    });
  });
  ac('restaurarCompras', function () {
    IA.publicacion.restaurar().then(function (si) {
      U.aviso(si ? 'Compra restaurada: ya no verás el anuncio al abrir.' : 'No encontramos compras de esta cuenta.', si ? '' : 'mal');
      reabrirAjustes();
    });
  });
  ac('privacidadAnuncios', function () { IA.publicacion.abrirPrivacidad(); }); // V31: consentimiento de Google
  ac('ajuste', function (v, el) {
    const k = el.getAttribute('data-k');
    const val = el.type === 'checkbox' ? !!v : (k === 'texto' ? +v : v);
    U.ajuste(k, val);
    if (k === 'musica') IA.metasUI.musica(val); // música de fondo (V26)
    if (N.S) U.refrescar();
  });
  ac('salir', function () {
    detenerAuto();
    const fin = function () { N.S = null; U.cerrarModal(); U.cerrarFicha(); U.render(); };
    if (N.S && !N.S.quiebra && U.ajustes().autoguardado !== 'no') IA.guardado.autoguardar().then(fin); else fin();
  });
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
  ac('estLogoImg', function (v, el) {
    const f = el.files && el.files[0];
    el.value = '';
    U.ponerLogoPropio(f).then(function () { U.aviso('Logo listo: se ve solo en este dispositivo.'); U.render(); }, function (e) { U.aviso(e.message, 'mal'); });
  });
  ac('estLogoQuitar', function () { U.quitarLogoPropio(); U.render(); });
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
  // V33: el autoguardado espera a que el teléfono esté libre (la semana se ve primero) y nunca se encima con otro
  let guardando = false;
  function cuandoLibre(fn) { if (typeof requestIdleCallback === 'function') requestIdleCallback(fn, { timeout: 3000 }); else setTimeout(fn, 60); }
  function autoguardarSiToca(anioAntes, mesAntes) {
    let modo = U.ajustes().autoguardado;
    if (modo === 'no' || guardando) return;
    // Sin compresión nativa (navegadores viejos) comprimir cuesta: se autoguarda cada año y al salir
    if (modo === 'mes' && !IA.guardado.hayGzip()) modo = 'anio';
    if ((modo === 'mes' && N.mes() !== mesAntes) || N.anio() !== anioAntes) {
      guardando = true;
      cuandoLibre(function () {
        if (!N.S) { guardando = false; return; }
        IA.guardado.autoguardar().then(function (g) { guardando = false; if (!g.ok) U.aviso(t('gua_error', { e: g.error }), 'mal'); }, function () { guardando = false; });
      });
    }
  }
  function despuesDeAvanzar(res, mostrarResumen) {
    if (!res) return;
    const r = res.r;
    U.refrescar();
    res.nuevas.filter(function (n) { return n.imp; }).slice(0, 2).forEach(function (n) { U.aviso(n.texto.split('{$}').join(n.monto !== undefined ? dinero(n.monto, N.anio(n.t)) : '')); });
    if (N.S.quiebra) { detenerAuto(); modalQuiebra(); IA.arte.sonido('fracaso'); return; }
    if (r && r.motivo === 'premios' && N.S.premios.length) mostrarPremios();
    else if (J.decisionesPendientes().length) IA.creacion.siguienteDecision(); // dilemas y pruebas de público (V19)
    else if (N.S.proyeccion && IA.prensaUI.proyeccion()) { /* reseñas (V22) */ }
    else if (IA.imperioUI.mostrarEvento()) { /* evento con decisión (V24) */ }
    else if (IA.calendarioUI.mostrarPendientes()) { /* vida, heredero o recordatorio (V21) */ }
    else if (mostrarResumen && r && r.semanas > 1) {
      U.modal('<h2>' + t('resumen_titulo', { n: r.semanas }) + '</h2><div class="kpis">' + kpi(t('ingresos'), dinero(r.ingresos), 'bien') + kpi(t('gastos'), dinero(r.gastos), 'mal') + kpi('Cambio de caja', dinero(r.caja), r.caja >= 0 ? 'bien' : 'mal') + kpi(t('caja'), dinero(est0().caja)) + '</div>' +
        (res.nuevas.length ? '<h3>' + t('mun_periodico') + '</h3>' + res.nuevas.slice(0, 8).map(function (n) { return '<p style="margin:4px 0">' + (n.imp ? '<b>' : '') + textoNoticia(n) + (n.imp ? '</b>' : '') + '</p>'; }).join('') : '') +
        '<button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
    }
  }
  function mostrarPremios() {
    const res = N.S.premios[N.S.premios.length - 1];
    if (!res) return;
    return IA.prensaUI.ceremonia(res);
  }
  function modalQuiebra() {
    return IA.imperioUI.quiebra(); // tres salidas (V24)
  }
  ac('avanzar', function () {
    if (U.estado.auto) { detenerAuto(); U.renderBarra(); return; }
    if (N.S && N.S.quiebra) { modalQuiebra(); return; }
    const ritmo = U.ajustes().ritmo;
    if (ritmo === 'auto') {
      U.estado.auto = true;
      U.renderBarra();
      autoTimer = setInterval(function () {
        if (U.modalAbierto() || U.fichaAbierta() || document.hidden) return;
        const res = avanzarCon('semana');
        if (!res) { detenerAuto(); U.renderBarra(); return; }
        const ev = N.S.quiebra ? 'quiebra' : res.r && res.r.motivo === 'premios' ? 'premios' : J.hayEvento();
        despuesDeAvanzar(res, false);
        if (ev === 'lista' || ev === 'quiebra' || ev === 'premios' || ev === 'decision' || ev === 'recordatorio' || ev === 'vida') {
          detenerAuto(); U.renderBarra();
          if (ev === 'lista') U.aviso('Tienes una obra lista para estrenar');
          if (ev === 'decision') IA.creacion.siguienteDecision();
        }
      }, U.ajustes().movimiento ? 600 : 420);
      return;
    }
    IA.arte.sonido('avance');
    despuesDeAvanzar(avanzarCon(ritmo), true);
  });
  let cerrarRitmo = null;
  function quitarMenuRitmo() {
    const m = document.querySelector('.menu-ritmo');
    if (m) m.remove();
    if (cerrarRitmo) { document.removeEventListener('click', cerrarRitmo, true); cerrarRitmo = null; }
  }
  ac('menuRitmo', function (v, el) {
    if (document.querySelector('.menu-ritmo')) { quitarMenuRitmo(); return; }
    const r = el.getBoundingClientRect();
    const m = document.createElement('div');
    m.className = 'menu-ritmo';
    m.style.top = (r.bottom + 6) + 'px';
    m.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    const actual = U.ajustes().ritmo;
    m.innerHTML = [['semana', t('ritmo_semana')], ['mes', t('ritmo_mes')], ['evento', t('ritmo_evento')], ['auto', t('ritmo_auto')]].map(function (x) {
      return '<button class="' + (x[0] === actual ? 'on' : '') + '" data-a="ritmo" data-v="' + x[0] + '">' + esc(x[1]) + '</button>';
    }).join('') +
      // Seleccionar tiempo a avanzar con un deslizador (tu documento)
      '<label class="campo rango" style="padding:6px 10px;margin:0"><span>Avanzar <b id="rv-semanas">' + semanasElegidas + ' semanas</b></span><input type="range" min="1" max="52" value="' + semanasElegidas + '" data-i="semanasRango" aria-label="Semanas a avanzar"></label>' +
      '<button data-a="avanzarSemanas">Avanzar ya</button>';
    document.body.appendChild(m);
    setTimeout(function () {
      cerrarRitmo = function (ev) { if (!ev.target.closest('.menu-ritmo') && !ev.target.closest('[data-a="menuRitmo"]')) quitarMenuRitmo(); };
      document.addEventListener('click', cerrarRitmo, true);
    }, 0);
  });
  ac('ritmo', function (v) { U.ajuste('ritmo', v); quitarMenuRitmo(); detenerAuto(); U.renderBarra(); });
  let semanasElegidas = 8;
  ac('semanasRango', function (v) { semanasElegidas = N.limitar(Math.round(+v), 1, 52); const l = document.getElementById('rv-semanas'); if (l) l.textContent = semanasElegidas + (semanasElegidas === 1 ? ' semana' : ' semanas'); });
  // Avanzar hasta un día elegido en el calendario (V21); se detiene antes si llega algo que decidir
  function avanzarHasta(tt) {
    detenerAuto();
    if (N.S && N.S.quiebra) { modalQuiebra(); return; }
    if (tt <= N.S.t) return;
    IA.arte.sonido('avance');
    despuesDeAvanzar(avanzarCon({ hasta: tt }), true);
  }
  ac('avanzarSemanas', function () {
    quitarMenuRitmo(); detenerAuto();
    if (N.S && N.S.quiebra) { modalQuiebra(); return; }
    IA.arte.sonido('avance');
    despuesDeAvanzar(avanzarCon(semanasElegidas), true);
  });

  // Refresco de la ficha abierta cuando avanza el tiempo
  function refrescarFicha(clave) {
    if (clave === 'programar') return;
    if (clave === 'crear') { if (IA.creacion.estado.etapa !== 'idea') U.refrescarFicha(IA.creacion.fichaCrear()); return; }
    const p = clave.split(':');
    if (p[0] === 'obra') U.refrescarFicha(fichaObra(+p[1]));
    else if (p[0] === 'talento') U.refrescarFicha(fichaTalento(+p[1]));
  }

  return {
    portada: portada, nuevaPartida: nuevaPartida, estudio: estudio, obras: obras, talento: talento, mundo: mundo, negocio: negocio,
    fichaObra: fichaObra, fichaTalento: fichaTalento, alMostrar: alMostrar, refrescarFicha: refrescarFicha, detenerAuto: detenerAuto,
    datosEstudio: datosEstudio, tareas: tareas, avanzarHasta: avanzarHasta,
  };
})();
