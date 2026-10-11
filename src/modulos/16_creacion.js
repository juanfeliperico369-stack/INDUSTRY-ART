/* ==== módulo: creacion ==== */
// La fábrica de ideas en pantalla (V17): tres caminos (idea nueva, comprar un guion, usar material), idea automática
// con IA desde 2022, modo rápido (5 decisiones con "recomendado" y dado) y modo detallado con todas las listas y los
// deslizadores de tu documento (contenido, duración, complejidad, ritmo, efectos, presupuesto, época e IA), personajes
// con nombre, edad, sexo, importancia, arquetipo e intérprete, y la pestaña Taxonomía para ver las listas de todos los
// medios. Totales en vivo antes de confirmar.
IA.creacion = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, X = IA.taxonomia, I = IA.ideas, E = IA.economia, O = IA.obras, T = IA.talentos;
  const NG = IA.negocio, J = IA.juego, U = IA.ui, t = IA.t, esc = N.esc;
  const dinero = U.dinero, icono = U.icono, ac = U.accion;

  // ---------- Estado de la pantalla ----------
  const cr = { b: null, etapa: 'camino', paso: 0, rol: null, picker: null, q: '', abiertas: { obra: 1, generos: 1, historia: 1 }, grupoMat: 'todos', qMat: '', taxMedio: 'cine' };
  let modo = 'rapido';
  try { modo = localStorage.getItem('ia.modoCrear') || 'rapido'; } catch (e) { modo = 'rapido'; }
  function anio() { return N.anio(); }
  // Mirar o preparar una obra no es una decisión: la interfaz usa su propio azar para que abrir "Crear obra"
  // no cambie el mundo (la misma semilla con las mismas decisiones da la misma partida).
  let azarUI = null;
  function conAzarUI(fn) {
    const S = N.S;
    if (!azarUI) azarUI = N.estadoNuevo(S.semilla + '|interfaz|' + S.t);
    const real = S.rng;
    S.rng = azarUI;
    try { return fn(); } finally { azarUI = S.rng; S.rng = real; }
  }
  // Campos que quedan fijos cuando la idea viene de la IA o de un guion comprado
  const BLOQUEO_IA = ['gen', 'sub', 'tem', 'prob', 'arco', 'sarc', 'fic', 'tono', 'epo'];
  const BLOQUEO_GUION = ['gen', 'sub', 'tem', 'prob', 'arco', 'sarc'];
  function bloqueado(b, k) { return (b.ideaIA && BLOQUEO_IA.indexOf(k) >= 0) || (b.guionC && BLOQUEO_GUION.indexOf(k) >= 0); }
  function candado(b, k) { return bloqueado(b, k) ? ' <span class="etiqueta">' + (b.ideaIA ? 'fijado por la IA' : 'del guion') + '</span>' : ''; }

  // ---------- Borradores ----------
  function recomendarGenero() {
    const S = N.S;
    let mejor = 'DR', v = -9;
    D.ORDEN_FAM.forEach(function (f) {
      const x = (S.mundo.tendencias[f] || 0) + (E.pronosticoSemana(N.semana(S.t + 25), f) - 1) + (f === 'AV' ? -0.4 : 0);
      if (x > v) { v = x; mejor = f; }
    });
    const gens = D.familia(mejor).generos.filter(function (g) { return g !== 'Erótico'; });
    return gens[N.hash(S.t + mejor) % gens.length];
  }
  function nuevoBorrador(gen, preparar) {
    return conAzarUI(function () {
      const b = O.borrador(0, { gen: gen || [recomendarGenero()], escala: 2, completa: true });
      O.equipoRecomendado(b, 1);
      if (preparar) preparar(b);
      if (!(b.prob && b.prob.length)) I.recomendarHistoria(b, anio());
      I.generarPersonajes(b);
      O.recalcular(b);
      O.equipoNegociado(b, 1); // todo el elenco con nombre, contratado y negociado (V18)
      O.recalcular(b);
      return b;
    });
  }
  // Rehace lo que depende de las decisiones (familia, contenido por defecto, clasificación y costo)
  function ajustar(b) {
    const fam = D.familiaDe[b.gen[0]] || 'DR';
    if (!b.contTocado) b.cont = Object.assign({}, X.contenidoFamilia[fam]);
    if (!b.clasTocada) b.clasN = fam === 'AV';
    // Cómo se filma (V19): sigue la recomendación hasta que el jugador elige
    if (!b.metTocado) b.met = IA.rodaje.metodoRecomendado(b, anio());
    if (!b.terTocado) b.ter = IA.rodaje.terrenoRecomendado(b);
    if (b.setR && !IA.rodaje.setsQueSirven(b).some(function (x) { return x.id === b.setR; })) delete b.setR;
    O.recalcular(b);
    if (b.eq) conAzarUI(function () { O.ajustarRolesV19(b, 1); });
    if (!b.sinEditada) b.sin = I.sinopsis(b);
    return b;
  }
  // El reparto sigue a los personajes: protagonistas y secundarios con intérprete, invitados y cameos aparte
  function sincronizar(b) {
    if (!b.pj) return;
    const con = function (imp) { return b.pj.filter(function (p) { return p.i === imp && p.t !== null && p.t !== undefined; }).map(function (p) { return p.t; }); };
    b.pj.forEach(function (p) { if (p.i === 'extra') p.t = null; });
    b.eq.int = con('protagonista').concat(con('secundario'));
    b.eq.inv = con('invitado');
    b.eq.cam = con('cameo');
    ajustar(b);
  }

  // ---------- Piezas ----------
  function chip(txt, accion, valor, on, deshab, extra) {
    return '<button class="chip' + (on ? ' on' : '') + '" data-a="' + accion + '" data-v="' + esc(valor) + '"' + (deshab ? ' disabled' : '') + ' aria-pressed="' + !!on + '"' + (extra || '') + '>' + esc(txt) + '</button>';
  }
  function rango(k, min, max, val, etiqueta, texto, paso) {
    return '<label class="campo rango"><span>' + esc(etiqueta) + ': <b id="rv-' + k.replace(':', '-') + '">' + esc(texto) + '</b></span>' +
      '<input type="range" min="' + min + '" max="' + max + '" step="' + (paso || 1) + '" value="' + val + '" data-i="crRango" data-c="crRangoFin" data-k="' + k + '" aria-label="' + esc(etiqueta) + '"></label>';
  }
  function sel(k, opciones, actual, deshab) {
    return '<select data-c="crSel" data-k="' + k + '"' + (deshab ? ' disabled' : '') + '>' + opciones.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(actual) ? ' selected' : '') + (o[2] ? ' disabled' : '') + '>' + esc(o[1]) + '</option>';
    }).join('') + '</select>';
  }
  function estrellasTxt(n) { let s = ''; for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }
  function estrellasCalif(c) { return estrellasTxt(Math.max(1, Math.min(5, Math.round(c / 20)))); }
  function textoEncaje(b) {
    const e = I.estrellas(b);
    if (e.n === null) return t('encaje') + ': <span class="tenue">? (' + e.nuevas + (e.nuevas > 1 ? ' nuevas' : ' nueva') + ')</span>';
    return t('encaje') + ': <span class="encaje oro">' + estrellasTxt(e.n) + '</span>';
  }
  function presDeSlider(v) { return N.redondear(0.25 * Math.pow(16, v / 100), 3); }
  function sliderDePres(m) { return Math.round(Math.log(m / 0.25) / Math.log(16) * 100); }
  function maxNivel(b, c) {
    const tope = I.nivelMaximoEpoca(anio());
    let k = 0;
    c.niveles.forEach(function (n, i) { if (n[1] <= tope) k = i; });
    if (c.id === 'amor' && I.hayMenores(b)) k = Math.min(k, 1);
    if (I.hayNinos(b)) { let m = 0; c.niveles.forEach(function (n, i) { if (n[1] <= 2) m = i; }); k = Math.min(k, m); }
    return k;
  }
  function textoNivel(c, v) { const n = c.niveles[v] || c.niveles[0]; return n[0] + (n[1] >= 5 ? ' (siempre sugerido)' : '') + ' · ' + X.ORDEN_CLAS[n[1]]; }
  function textoRango(b, k) {
    if (k.indexOf('rep:') === 0) { const d = k.slice(4), r = IA.rodaje.reparto(b); const ef = IA.rodaje.efectoReparto(b, d); return Math.round(r[d] * 100) + ' % · ' + dinero(b.pp * r[d]) + (ef ? ' · ' + (ef > 0 ? '+' : '') + U.decimal(ef, 1) + ' a su nota' : ''); }
    if (k.indexOf('c:') === 0) { const c = X.contenido.filter(function (x) { return x.id === k.slice(2); })[0]; return textoNivel(c, b.cont[c.id]); }
    if (k === 'cx') return X.complejidad[b.cx];
    if (k === 'rit') return X.ritmo[b.rit].id + (X.ritmo[b.rit].crit ? ' (crítica ' + signo(X.ritmo[b.rit].crit) + ', público ' + signo(X.ritmo[b.rit].pub) + ')' : '');
    if (k === 'fx') return X.efectos[b.fx].nombre;
    if (k === 'ia') return b.ia + ' %' + (b.ia ? ' · producción ' + Math.round(40 * b.ia / 100) + ' % más barata' : '');
    if (k === 'min') return b.min + ' min · ' + X.categoriaDuracion(b.min) + ' (lo normal en ' + anio() + ': ' + I.duracionTipica(anio()) + ')';
    if (k === 'pres') return dinero(b.pp) + ' · ×' + U.decimal(b.presM, 2) + ' de lo típico · clase ' + I.clase(b);
    if (k === 'epo') return X.epoca(b.epo).nombre;
    if (k === 'extras') return (b.extras || 0) + ' personas';
    if (k === 'terceros') return (b.terceros || 0) + ' personas';
    return '';
  }
  function signo(x) { return (x > 0 ? '+' : '') + x; }
  function textoClas(b) {
    const cl = D.clasificacion(b.clas) || D.clasificacion('PG-13');
    const acc = E.accesoClasificacion(Object.assign({}, b), N.S.estudios[0].reg, anio());
    return '<b>' + t('clasificacion') + ': ' + esc(b.clas) + '</b> · ' + esc(cl.desc) + '<br><span class="nota">' + esc(I.describirContenido(b)) + ' · público que puede verla en tu región: ' + Math.round(Math.min(1.5, acc) * 100) + ' % de lo normal' +
      (anio() < D.ANIO_CLASIFICACION_POR_EDADES ? '. Antes de 1968 la censura de la época no deja estrenar NC-17, 18, R ni X: lo más fuerte se vuelve guiño' : '') + '.</span>';
  }

  // ---------- Totales en vivo ----------
  function piezaPie(b) {
    const est = O.estimar(b, NG.bonos(0, b.fam));
    const libre = NG.cajaLibre(0);
    const err = J.puedeIniciar(b);
    // Dos líneas siempre a la vista; el desglose se abre tocando "Detalle"
    return '<div class="fila entre"><span>' + t('costo_total') + ' <b class="cifra ' + (est.total > libre ? 'mal' : '') + '">' + dinero(est.total) + '</b></span><span>' + t('calidad_esperada').split(' ')[0] + ' <b>' + Math.max(1, est.calidad - 6) + '–' + Math.min(99, est.calidad + 6) + '</b></span><span title="Retorno orientativo">×' + U.decimal(est.retorno[0], 1) + '–×' + U.decimal(est.retorno[1], 1) + '</span></div>' +
      '<div class="fila entre chico"><span>' + textoEncaje(b) + '</span><span>' + esc(b.clas) + ' · ' + O.semanasTotales(b, NG.rapidez(0)) + ' sem. <button class="btn" style="padding:2px 10px" data-a="crPieDetalle">' + (cr.pieAbierto ? 'Menos' : 'Detalle') + '</button></span></div>' +
      (cr.pieAbierto ? '<div class="chips" style="margin:4px 0 0">' + notasTxt(b) + '</div><div class="nota" style="margin:2px 0 0">' + t('costo_talento') + ' ' + dinero(est.talento) + ' · ' + t('costo_produccion') + ' ' + dinero(est.produccion) + (est.derechos ? ' · derechos ' + dinero(est.derechos) : '') + ' · marketing ~' + dinero(est.marketing) + ' · ' + t('caja_libre') + ' ' + dinero(libre) + ' · retorno orientativo ×' + U.decimal(est.retorno[0], 1) + ' a ×' + U.decimal(est.retorno[1], 1) + ' (multiplicador de lo invertido)</div>' : '') +
      (err && (modo === 'detallado' || cr.paso === 4) ? '<p class="mal chico" style="margin:4px 0 0">' + esc(err) + '</p>' : '');
  }
  // Los totales quedan fijos al final de la creación (no persiguen el desplazamiento)
  function pie(b) { return '<div id="crPie" class="tarjeta totales" style="margin-top:12px;padding:8px 10px">' + piezaPie(b) + '</div>'; }
  function refrescarPie() {
    const p = document.getElementById('crPie');
    if (p && cr.b) p.innerHTML = piezaPie(cr.b);
  }

  // =====================================================================
  // CAMINO: idea nueva, comprar un guion, usar material o idea con IA
  // =====================================================================
  function tarjetaCamino(id, titulo, texto, deshab) {
    return '<button class="tarjeta toque" style="text-align:left;width:100%" data-a="crCamino" data-v="' + id + '"' + (deshab ? ' disabled' : '') + '><b>' + esc(titulo) + '</b><br><span class="chico">' + esc(texto) + '</span></button>';
  }
  function vistaCamino() {
    const S = N.S, a = anio();
    let h = '<h2>' + t('crear_obra') + '</h2><p class="nota">Primero, de dónde sale la idea. Todo se puede cambiar antes de empezar.</p>';
    h += '<h3>Medio</h3><div class="chips">' + X.medios.map(function (m) {
      return '<button class="chip' + (m.activo ? ' on' : '') + '"' + (m.activo ? '' : ' disabled') + '>' + esc(m.nombre) + (m.activo ? '' : ' · ' + m.version) + '</button>';
    }).join('') + '</div><p class="nota">En esta versión se produce cine. Las listas de los demás medios ya están completas en Mundo › Taxonomía y llegan con su economía.</p>';
    h += '<h3>Modo</h3><div class="chips">' + chip('Rápido · 5 decisiones', 'crModo', 'rapido', modo === 'rapido') + chip('Detallado · todas las listas', 'crModo', 'detallado', modo === 'detallado') + '</div>';
    const nG = (S.guiones || []).length, nP = (S.guionesPropios || []).length;
    h += '<div class="col" style="margin-top:12px;gap:8px">' +
      tarjetaCamino('nueva', 'Idea nueva', 'Tú decides todo, con «recomendado» y dado en cada paso.') +
      tarjetaCamino('guion', 'Comprar un guion', nG + ' guiones en venta' + (nP ? ' · ' + nP + ' tuyos sin producir' : '') + '. Ya están escritos, con su calificación y su precio.') +
      tarjetaCamino('material', 'Usar material', I.materialesDisponibles(a).length + ' obras de dominio público y derechos que se compran: clásicos, subidas de tono y tradiciones del mundo.') +
      (a >= I.ANIO_IA ? tarjetaCamino('ia', 'Idea automática con IA', 'Un botón: la IA arma y bloquea la historia. Su calidad depende de tu guionista.') : '<p class="nota">La idea automática con IA llega en ' + I.ANIO_IA + '.</p>') + '</div>';
    return h;
  }
  function cabecera(titulo, ayuda) {
    return '<div class="fila entre"><h2>' + esc(titulo) + '</h2><button class="btn" data-a="crVolverCamino">' + t('atras') + '</button></div>' + (ayuda ? '<p class="nota">' + esc(ayuda) + '</p>' : '');
  }
  function vistaGuiones() {
    const S = N.S;
    let h = cabecera('Comprar un guion', 'Guiones ya escritos. La primera lectura es una estimación con margen; un informe de lectura pagado revela la calidad real (más exacta con un analista en tu personal). Puedes regatear una vez: a veces baja el precio y a veces el vendedor se va. El mercado se renueva cada mes.');
    const propios = S.guionesPropios || [];
    if (propios.length) h += '<h3>Tus guiones</h3>' + propios.map(function (g) { return tarjetaGuion(g, true); }).join('');
    h += '<h3>En venta</h3>' + ((S.guiones || []).length ? S.guiones.map(function (g) { return tarjetaGuion(g, false); }).join('') : '<p class="tenue">No hay guiones en venta ahora.</p>');
    return h;
  }
  function tarjetaGuion(g, propio) {
    const sin = I.sinopsis({ gen: g.idea.gen, tem: g.idea.tem, prob: g.idea.prob, arco: g.idea.arco, epo: g.idea.epo || 'actualidad' });
    const lect = propio || g.lect === undefined ? g.calif : g.lect, margen = propio || g.margen === undefined ? 0 : g.margen;
    return '<div class="tarjeta"><div class="fila entre"><b>' + esc(g.idea.tit) + '</b><span class="oro">' + estrellasCalif(lect) + ' ' + lect + (margen ? ' ±' + margen : '') + '</span></div>' +
      (g.pags ? '<span class="chico tenue">' + g.pags + ' páginas · ' + (g.idea.pre && g.idea.pre.length ? esc(g.idea.pre.join(', ')) : 'sin premisa marcada') + '</span><br>' : '') +
      '<span class="chico">' + esc(g.idea.gen.join(' · ')) + ' · ' + esc((g.idea.tem || []).join(', ')) + '</span><br><span class="tenue chico">De ' + esc(g.nomAutor) + (propio ? '' : ' · en venta hasta ' + esc(U.fechaCorta(g.vence))) + '</span>' +
      '<p class="nota">' + esc(sin) + '</p>' +
      (propio ? '<button class="btn primario" data-a="crProducirGuion" data-v="' + g.id + '">Producir</button>' : '<div class="chips"><button class="btn primario" data-a="crComprarGuion" data-v="' + g.id + '">Comprar · ' + dinero(g.precio) + '</button>' +
        (margen > 4 ? '<button class="chip" data-a="crInforme" data-v="' + g.id + '">Informe de lectura · ' + dinero(I.costoInforme(g)) + '</button>' : '') +
        (g.reg ? '' : '<button class="chip" data-a="crRegatear" data-v="' + g.id + '">Regatear</button>') + '</div>') + '</div>';
  }
  const GRUPOS_MAT = [['todos', 'Todas'], ['clasico', 'Clásicos'], ['tono', 'Subidas de tono'], ['tradicion', 'Tradiciones del mundo']];
  function mini(v) { return '<span class="mini"><i style="width:' + Math.round(N.limitar(v / 1.5, 0, 1) * 100) + '%"></i></span>'; }
  function listaMaterial() {
    const a = anio(), q = cr.qMat.toLowerCase();
    const lista = I.materialesDisponibles(a).filter(function (m) {
      return (cr.grupoMat === 'todos' || m.grupo === cr.grupoMat) && (!q || (m.tit + ' ' + m.autor + ' ' + m.gen.join(' ')).toLowerCase().indexOf(q) >= 0);
    }).sort(function (x, y) { return y.fama - x.fama; });
    if (!lista.length) return '<p class="tenue">Nada coincide con la búsqueda.</p>';
    const EDADES = ['Niños', 'Adolesc.', 'Jóvenes', 'Adultos', 'Mayores'];
    return lista.map(function (m) {
      const libre = I.esLibre(m, a), der = I.costoDerechos(m, a), at = I.atractivo(m), usos = I.usosRecientes(m.id, a);
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(m.tit) + '</b>' + (libre ? '<span class="etiqueta bien">Libre</span>' : '<span class="etiqueta">Derechos ' + dinero(der) + '</span>') + '</div>' +
        '<span class="chico">' + esc(m.autor) + ' · ' + esc(m.anio) + ' · ' + esc(m.gen.join(', ')) + '</span>' +
        (libre ? '' : '<br><span class="tenue chico">Queda libre en ' + I.anioLibre(m) + ' (vida del autor + ' + I.reglaDominio() + ' años)</span>') +
        '<div class="chico" style="margin-top:4px">Fama ' + mini(m.fama * 1.5) + ' · ' + EDADES.map(function (e, i) { return e + ' ' + mini(at.edades[i]); }).join(' ') + ' · Hombres ' + mini(at.sexo[0]) + ' Mujeres ' + mini(at.sexo[1]) + '</div>' +
        (usos ? '<span class="mal chico">Adaptada ' + usos + ' ' + (usos > 1 ? 'veces' : 'vez') + ' en los últimos 15 años: el público está cansado.</span><br>' : '') +
        (m.grupo === 'tono' ? '<span class="nota">Subida de tono: se adapta con guiños, la clasificación sube y nada es explícito.</span><br>' : '') +
        '<button class="btn primario" data-a="crAdaptar" data-v="' + m.id + '">Adaptar</button></div>';
    }).join('');
  }
  function vistaMaterial() {
    let h = cabecera('Usar material', 'Obras de dominio público: quedan libres el 1 de enero del año 71 tras la muerte del autor; las antiguas y las tradiciones, siempre. Antes de liberarse, sus derechos se compran.');
    h += '<div class="chips">' + GRUPOS_MAT.map(function (g) { return chip(g[1], 'crMatGrupo', g[0], cr.grupoMat === g[0]); }).join('') + '</div>';
    h += '<input type="search" placeholder="Buscar por título, autor o género" value="' + esc(cr.qMat) + '" data-i="crMatBuscar" style="margin:8px 0">';
    return h + '<div id="crMatLista">' + listaMaterial() + '</div>';
  }

  // =====================================================================
  // BLOQUES DE LA IDEA (los usan el modo rápido y el detallado)
  // =====================================================================
  function bloqueGeneros(b) {
    const lock = bloqueado(b, 'gen');
    let h = '<p class="nota">' + t('generos_ayuda') + ' El primero es el líder.' + candado(b, 'gen') + '</p>';
    if (!lock) h += '<div class="fila envolver" style="margin-bottom:8px"><button class="btn" data-a="crGenRec">' + icono('varita') + t('recomendado') + '</button><button class="btn" data-a="crGenDado">' + icono('dado') + t('dado') + '</button></div>';
    D.familias.forEach(function (f) {
      const tend = N.S.mundo.tendencias[f.id] || 0;
      h += '<h4 style="margin:10px 0 4px">' + esc(f.nombre) + ' <span class="chico ' + (tend > 0.2 ? 'bien' : tend < -0.2 ? 'mal' : 'tenue') + '">' + (tend > 0.2 ? 'en alza' : tend < -0.2 ? 'en baja' : 'estable') + '</span></h4><div class="chips">' +
        f.generos.slice().sort(function (x, y) { return x.localeCompare(y, 'es'); }).map(function (g) {
          const on = b.gen.indexOf(g) >= 0;
          const bloq = lock || (!on && (b.gen.length >= 3 || O.validarGeneros(b.gen.concat([g]), anio())));
          return chip(g + (on && b.gen[0] === g ? ' ★' : ''), 'crGen', g, on, bloq);
        }).join('') + '</div><p class="nota" style="margin:2px 0">' + esc(f.temporada) + ' · costo ' + (f.costo >= 1.3 ? 'alto' : f.costo <= 0.6 ? 'bajo' : 'medio') + ' · inclina a ' + (f.inclina === 'pub' ? 'el público' : f.inclina === 'crit' ? 'la crítica' : 'ambos') + ' · clasificación usual ' + esc(f.clas) + '</p>';
    });
    return h;
  }
  // Sugerencias de una lista grande: lo elegido más lo que mejor encaja con la familia
  function sugeridosTemas(b) {
    const fam = b.fam, out = (b.tem || []).slice();
    X.familiasTema.filter(function (f) { return f.afin[fam] >= 3; }).forEach(function (f) {
      f.items.slice().sort(function (x, y) { return N.hash(x + N.S.t) - N.hash(y + N.S.t); }).slice(0, 5).forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    });
    return out.slice(0, 12);
  }
  function sugeridosProblemas(b) {
    const fam = b.fam, out = (b.prob || []).slice();
    const pref = { AA: ['CL', 'VB'], IM: ['VB', 'DS'], SM: ['ME', 'CL'], DR: ['AC', 'VI'], HM: ['VI', 'TR'], FJ: ['VB', 'VI'], AV: ['DS', 'AC'], RD: ['VI', 'AC'] }[fam] || ['CL'];
    X.familiasProblema.filter(function (f) { return pref.indexOf(f.id) >= 0; }).forEach(function (f) { Object.keys(f.items).forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); }); });
    return out.slice(0, 12);
  }
  function bloqueHistoria(b, completo) {
    if (cr.picker === 'tem' || cr.picker === 'sub' || cr.picker === 'prob' || cr.picker === 'fic') return bloquePicker(b);
    const lockT = bloqueado(b, 'tem'), lockP = bloqueado(b, 'prob'), lockA = bloqueado(b, 'arco');
    let h = '';
    if (!lockT || !lockP) h += '<div class="fila envolver" style="margin-bottom:6px"><button class="btn" data-a="crHistRec">' + icono('varita') + t('recomendado') + '</button><button class="btn" data-a="crHistDado">' + icono('dado') + t('dado') + '</button></div>';
    if (completo) {
      h += '<h4>Naturaleza</h4><div class="chips">' + chip('Ficción', 'crNat', 'f', b.nat !== 'r') + chip('Realidad', 'crNat', 'r', b.nat === 'r') + '</div>';
      h += '<h4>Subgéneros (' + (b.sub || []).length + '/' + I.LIMITES.sub + ', opcional)' + candado(b, 'sub') + '</h4><p class="chico">' + esc((b.sub || []).join(' · ') || '—') + '</p>' + (bloqueado(b, 'sub') ? '' : '<button class="btn" data-a="crPicker" data-v="sub">Elegir subgéneros</button>');
    }
    h += '<h4>Temas (' + (b.tem || []).length + '/' + I.LIMITES.tem + ')' + candado(b, 'tem') + '</h4><div class="chips">' + sugeridosTemas(b).map(function (x) {
      const on = b.tem.indexOf(x) >= 0;
      return chip(x, 'crTema', x, on, lockT || (!on && b.tem.length >= I.LIMITES.tem));
    }).join('') + '</div>' + (lockT ? '' : '<button class="btn" data-a="crPicker" data-v="tem">Ver los 227 temas</button>');
    h += '<h4>Problemática o argumento (' + (b.prob || []).length + '/' + I.LIMITES.prob + ', al menos 1)' + candado(b, 'prob') + '</h4><div class="chips">' + sugeridosProblemas(b).map(function (x) {
      const on = b.prob.indexOf(x) >= 0;
      return chip(x, 'crProb', x, on, lockP || (!on && b.prob.length >= I.LIMITES.prob));
    }).join('') + '</div>' + (lockP ? '' : '<button class="btn" data-a="crPicker" data-v="prob">Ver las 53</button>');
    h += '<h4>Arco narrativo' + (b.nat === 'r' ? ' (opcional en realidad)' : ' (obligatorio en ficción)') + candado(b, 'arco') + '</h4><div class="chips">' + X.arcos.map(function (a) {
      return chip(a.nombre, 'crArco', a.id, b.arco === a.id, lockA, ' title="' + esc(a.orig) + '"');
    }).join('') + '</div>';
    // Premisas y tropos (V21): 0 a 2; encajan con ciertas familias y las muy usadas cansan
    b.pre = b.pre || [];
    const famB = b.fam || D.familiaDe[(b.gen || [])[0]];
    h += '<h4>Premisas y tropos (' + b.pre.length + '/2, opcional)</h4><p class="nota">Encajan mejor con algunas familias (★) y las que el mundo usa mucho cansan al público.</p>' +
      '<label class="campo"><span>Familia de premisas</span><select data-c="crPreFam">' + X.familiasPremisa.map(function (f) { return '<option value="' + f.id + '"' + (cr.preFam === f.id ? ' selected' : '') + '>' + esc(f.nombre) + (f.afin.indexOf(famB) >= 0 ? ' ★' : '') + '</option>'; }).join('') + '</select></label><div class="chips">' +
      (X.familiasPremisa.filter(function (f) { return f.id === (cr.preFam || X.familiasPremisa[0].id); })[0].items).concat(b.pre.filter(function (p) { return (X.familiasPremisa.filter(function (f) { return f.id === (cr.preFam || X.familiasPremisa[0].id); })[0].items).indexOf(p) < 0; })).map(function (p) {
        const on = b.pre.indexOf(p) >= 0, u = I.usosPremisa(p, anio());
        return chip(p + (u >= 4 ? ' (muy usada)' : ''), 'crPre', p, on, !on && b.pre.length >= 2);
      }).join('') + '</div>';
    const arco = X.arco(b.arco);
    if (arco) h += '<p class="nota">' + esc(arco.orig) + ': ' + esc(arco.final) + (arco.crit || arco.pub ? ' · crítica ' + signo(arco.crit) + ', público ' + signo(arco.pub) : '') + '</p>';
    if (completo) {
      h += '<h4>Subarcos (hasta ' + I.LIMITES.sarc + ', opcional)</h4><div class="chips">' + X.subarcos.map(function (s) {
        const on = (b.sarc || []).indexOf(s.id) >= 0;
        return chip(s.nombre, 'crSubarco', s.id, on, bloqueado(b, 'sarc') || (!on && (b.sarc || []).length >= I.LIMITES.sarc), ' title="' + esc(s.orig) + '"');
      }).join('') + '</div>';
      if (b.nat !== 'r') {
        h += '<h4>Tipo de ficción' + candado(b, 'fic') + '</h4><p class="chico">' + esc(b.fic) + '</p>' + (bloqueado(b, 'fic') ? '' : '<button class="btn" data-a="crPicker" data-v="fic">Elegir entre las 34</button>');
      }
    }
    return h;
  }
  function bloqueTono(b) {
    const lock = bloqueado(b, 'tono');
    const to = D.tonos.filter(function (x) { return x.id === b.tono; })[0] || D.tonos[0];
    return '<h4>' + t('tono') + candado(b, 'tono') + '</h4><div class="chips">' + D.tonos.map(function (x) { return chip(x.id, 'crTono', x.id, b.tono === x.id, lock); }).join('') + '</div>' +
      '<p class="nota">Crítica ' + signo(to.crit) + ' · Público ' + signo(to.pub) + (to.costo ? ' · producción +15 %' : '') + '</p>';
  }
  function bloqueEstilo(b) {
    const a = anio(), fam = b.fam;
    const corr = [[X.ESTANDAR, X.ESTANDAR]].concat(X.corrientesCine.map(function (c) {
      const ef = X.efectoCorriente(c.id, a, fam);
      return [c.id, c.id + ' (' + c.desde + ')' + (c.desde > a ? ' · llega en ' + c.desde : ef.novedad > 0 ? ' · ¡novedad!' : '') + (c.afines.indexOf(fam) >= 0 ? ' · afín' : ''), c.desde > a];
    }));
    const ec = b.corr !== X.ESTANDAR ? X.efectoCorriente(b.corr, a, fam) : null;
    let h = '<label class="campo"><span>Corriente artística</span>' + sel('corr', corr, b.corr) + '</label>' + (ec ? '<p class="nota">Crítica ' + signo(ec.crit) + ' · público ' + signo(ec.pub) + (ec.costo !== 1 ? ' · costo ×' + U.decimal(ec.costo, 2) : '') + (ec.novedad > 0 ? ' · bono de novedad por ' + Math.round(ec.novedad * 12) + ' años más' : '') + '</p>' : '');
    h += bloqueTono(b);
    const est = X.estilos.map(function (s) { return [s.id, s.id + (s.desde && s.desde > a ? ' · llega en ' + s.desde : '') + (s.afines && s.afines.indexOf(fam) >= 0 ? ' · afín' : ''), s.desde && s.desde > a]; });
    h += '<label class="campo"><span>Estilo artístico</span>' + sel('estilo', est, b.estilo) + '</label>';
    h += '<h4>Prioridad</h4><div class="chips">' + X.prioridades.map(function (p) { return chip(p.nombre, 'crPrio', p.id, b.prio === p.id); }).join('') + '</div><p class="nota">' + esc(X.prioridad(b.prio).efecto) + '.</p>';
    const fmt = function (k, nombre) {
      return '<label class="campo crece"><span>' + nombre + '</span>' + sel('fmt.' + k, X.formatos[k].map(function (f) { return [f.id, f.id + (f.desde > a ? ' · ' + f.desde : ''), f.desde > a]; }), b.fmt[k]) + '</label>';
    };
    const ef = X.efectoFormato(b.fmt, a, fam);
    h += '<h4>Formato de la época</h4><div class="fila envolver">' + fmt('color', 'Color') + fmt('visual', 'Imagen') + fmt('sonido', 'Sonido') + '</div><p class="nota">Lo normal en ' + a + ': ' + esc(X.formatoEstandar(a).color + ', ' + X.formatoEstandar(a).visual + ', ' + X.formatoEstandar(a).sonido) + '.' +
      (ef.costo !== 1 || ef.crit || ef.pub ? ' Tu elección: costo ×' + U.decimal(ef.costo, 2) + ', crítica ' + signo(ef.crit) + ', público ' + signo(ef.pub) + '.' : '') + '</p>';
    return h;
  }
  function bloqueMundo(b) {
    const a = anio();
    const epocas = X.epocasDisponibles(a);
    const iEp = Math.max(0, epocas.map(function (e) { return e.id; }).indexOf(b.epo));
    let h = bloqueado(b, 'epo') ? '<p>Época: <b>' + esc(X.epoca(b.epo).nombre) + '</b>' + candado(b, 'epo') + '</p>' : rango('epo', 0, epocas.length - 1, iEp, 'Época de la historia', textoRango(b, 'epo'));
    const ep = X.epoca(b.epo);
    h += '<p class="nota">Vestuario y sets: costo ×' + U.decimal(ep.costo, 2) + (ep.afines.length ? ' · encaja con ' + ep.afines.map(function (f) { return D.familia(f).nombre.toLowerCase(); }).join(', ') : '') + '.</p>';
    const lugares = [['', 'Sin lugar fijo']].concat(D.paises.slice().sort(function (x, y) { return x.nombre.localeCompare(y.nombre, 'es'); }).map(function (p) { return [p.id, p.nombre + ' (' + D.region(p.region).nombre + ')']; }), X.lugaresExtra.map(function (l) { return [l.id, l.nombre]; }));
    h += '<label class="campo"><span>Dónde pasa la historia</span>' + sel('lug', lugares, b.lug) + '</label>';
    h += '<label class="campo"><span>Idioma de la obra</span>' + sel('idio', X.idiomas.map(function (x) { return [x.id, x.id + (x.universal ? ' (viaja a todas partes)' : '')]; }), b.idio) + '</label>';
    return h;
  }
  function bloquePublico(b) {
    if (cr.picker === 'pubs') return bloquePicker(b);
    let h = '<h4>Público objetivo (' + (b.pubs || []).length + '/' + I.LIMITES.pubs + ')</h4><p class="chico">' + esc((b.pubs || []).join(' · ') || 'General') + '</p><button class="btn" data-a="crPicker" data-v="pubs">Elegir público</button>';
    h += '<h4>Contenido</h4><p class="nota">La clasificación sale de lo más fuerte del contenido. Nada es gráfico: lo de adultos siempre es sugerido.</p>';
    X.contenido.forEach(function (c) { h += rango('c:' + c.id, 0, maxNivel(b, c), Math.min(b.cont[c.id] || 0, maxNivel(b, c)), c.nombre, textoNivel(c, b.cont[c.id] || 0)); });
    if (I.hayMenores(b)) h += '<p class="nota">Hay personajes menores de edad: el amor no pasa de romántico' + (I.hayNinos(b) ? ', y con niños en el elenco la obra no pasa de PG-13 (los niños actores solo hacen obras hasta PG-13)' : '') + '.</p>';
    h += '<p id="crClas">' + textoClas(b) + '</p>';
    const permiteN = I.indiceClasificacion(b) <= 2 && b.gen.indexOf('Erótico') < 0;
    h += '<label class="interruptor"><span>Clasificación N (general, con contenido moderado y controlado; rinde la mitad)</span><input type="checkbox" data-c="crClasN"' + (b.clasN ? ' checked' : '') + (permiteN ? '' : ' disabled') + '></label>';
    return h;
  }
  function bloqueForma(b) {
    const a = anio();
    let maxFx = 0;
    X.efectos.forEach(function (e, i) { if (e.desde <= a) maxFx = i; });
    let h = rango('min', 1, 300, b.min, 'Duración', textoRango(b, 'min'));
    h += rango('cx', 0, 5, b.cx, 'Complejidad e inteligencia', textoRango(b, 'cx')) + '<p class="nota">La complejidad gusta a la crítica y cansa al público.</p>';
    h += rango('rit', 0, 4, b.rit, 'Ritmo', textoRango(b, 'rit'));
    h += rango('fx', 0, maxFx, Math.min(b.fx, maxFx), 'Efectos especiales', textoRango(b, 'fx')) + '<p class="nota">Desde «Bastantes», el director y el diseñador de arte deciden si los efectos se aplauden o se repudian.</p>';
    h += rango('pres', 0, 100, sliderDePres(b.presM), 'Presupuesto de producción', textoRango(b, 'pres'));
    if (a >= I.ANIO_IA) h += rango('ia', 0, 100, b.ia, 'Uso de IA en la producción', textoRango(b, 'ia'), 5) + '<p class="nota">Abarata y acelera. Con un equipo excelente sale bien; con uno flojo, las actuaciones se ven dudosas.</p>';
    return h;
  }
  function bloqueObra(b) {
    const a = anio();
    let h = '<h4>Tipo de película</h4><div class="chips">' + X.tiposCine.map(function (x) {
      return chip(x.nombre + (x.desde > a ? ' · ' + x.desde : ''), 'crTipo', x.id, b.tipo === x.id, x.desde > a);
    }).join('') + '</div><p class="nota">' + esc(X.tipoCine(b.tipo).efecto) + '.</p>';
    h += '<p class="nota">Clase ' + I.clase(b) + ' · obra ' + I.perfil(b) + (b.mat ? ' · basada en «' + esc(X.material(b.mat).tit) + '»' : '') + (b.guionC ? ' · guion comprado (' + b.guionC + ')' : '') + (b.ideaIA ? ' · idea de la IA' : '') + '</p>';
    return h;
  }
  // ---------- Personajes ----------
  // Protagonistas, secundarios, invitados y cameos se contratan uno por uno (V18); extras y terceros son un número
  const IMP_CORTO = { protagonista: 'P', secundario: 'S', invitado: 'I', cameo: 'C' };
  const IMP_NOMBRADAS = X.importancias.filter(function (im) { return !im.contado; });
  function avisoActor(p, ta) {
    if (!ta) return '';
    const e = anio() - ta.nac;
    if (p.e < 16 && e >= 18) return ' <span class="mal">· un adulto no puede hacer de niño</span>';
    if (p.i !== 'invitado' && p.i !== 'cameo' && Math.abs(e - p.e) > 15) return ' <span class="mal">· no encaja con la edad del personaje (' + e + ' años)</span>';
    if (ta.pap && ta.pap.indexOf(p.a) >= 0) return ' <span class="bien">· papel recomendado</span>';
    return '';
  }
  function bloquePersonajes(b) {
    const cuenta = {};
    (b.pj || []).forEach(function (p) { cuenta[p.i] = (cuenta[p.i] || 0) + 1; });
    let h = '<p class="nota">Hasta 10 protagonistas, 15 secundarios, 5 invitados especiales y 5 cameos, cada uno con su intérprete contratado. Los secundarios cobran la mitad de su tarifa, los invitados el 40 % y los cameos el 15 %. Extras y terceros (figurantes, dobles y personal de apoyo) son un número. P = protagonista · S = secundario · I = invitado · C = cameo.</p>';
    h += '<div class="fila envolver">' + IMP_NOMBRADAS.map(function (im) {
      return '<button class="btn" data-a="crPjAdd" data-v="' + im.id + '"' + ((cuenta[im.id] || 0) >= im.max ? ' disabled' : '') + '>' + icono('mas') + esc(im.nombre) + ' (' + (cuenta[im.id] || 0) + '/' + im.max + ')</button>';
    }).join('') + '<button class="btn" data-a="crPjGenerar">' + icono('dado') + 'Otro reparto</button></div>';
    h += (b.pj || []).map(function (p, i) {
      if (p.i === 'extra') return '';
      const ta = p.t !== null && p.t !== undefined ? T.porId(p.t) : null;
      return '<div class="tarjeta" style="padding:8px">' +
        '<div class="fila"><input type="text" maxlength="30" value="' + esc(p.n) + '" data-i="crPjNombre" data-k="' + i + '" class="crece" aria-label="Nombre del personaje"><button class="ico" data-a="crPjDado" data-v="' + i + '" aria-label="Nombre al azar">' + icono('dado') + '</button><button class="ico" data-a="crPjDel" data-v="' + i + '" aria-label="Quitar personaje">' + icono('cerrar') + '</button></div>' +
        '<div class="chips" style="margin:4px 0">' + IMP_NOMBRADAS.map(function (im) { return chip(IMP_CORTO[im.id], 'crPjImp', i + '|' + im.id, p.i === im.id, false, ' title="' + im.nombre + '" style="min-width:48px"'); }).join('') + '</div>' +
        '<div class="fila envolver"><label class="campo" style="width:80px"><span>Edad</span><input type="number" min="1" max="110" value="' + p.e + '" data-c="crPjEdad" data-k="' + i + '"></label>' +
        '<label class="campo"><span>Sexo</span><select data-c="crPjSexo" data-k="' + i + '"><option value="F"' + (p.s === 'F' ? ' selected' : '') + '>' + t('mujer') + '</option><option value="M"' + (p.s === 'M' ? ' selected' : '') + '>' + t('hombre') + '</option></select></label>' +
        '<label class="campo crece"><span>Arquetipo</span><select data-c="crPjArq" data-k="' + i + '">' + X.arquetipos.map(function (a) { return '<option' + (a.id === p.a ? ' selected' : '') + '>' + esc(a.id) + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="fila entre"><span class="chico">' + (ta ? 'Lo interpreta <b>' + esc(ta.nom) + '</b> · ' + t('tal_habilidad').toLowerCase() + ' ' + Math.round(ta.hab) + ' · fama ' + Math.round(ta.fama * 100) + ' · ' + dinero(costoDe(b, ta.id, p.i)) + avisoActor(p, ta) : '<span class="mal">Falta contratar a su intérprete</span>') + '</span><span class="fila">' +
          (ta ? '<button class="btn" data-a="crPjQuitarInt" data-v="' + i + '">Quitar</button>' : '') + '<button class="btn" data-a="crPjInt" data-v="' + i + '">' + (ta ? 'Cambiar' : 'Contratar') + '</button></span></div>' +
        (ta ? filaContrato(b, ta) : '') + (cr.rol === 'pj:' + i ? listaCandidatos(cr.rol) : '') + '</div>';
    }).join('');
    h += rango('extras', 0, X.MAX_EXTRAS, b.extras || 0, 'Extras', textoRango(b, 'extras')) + rango('terceros', 0, X.MAX_TERCEROS, b.terceros || 0, 'Terceros (figurantes, dobles y personal de apoyo)', textoRango(b, 'terceros'));
    return h;
  }
  // ---------- Contratos: salario fijo o con porcentaje de la taquilla del estudio ----------
  function costoDe(b, id, imp) {
    const t = T.porId(id);
    if (!t) return 0;
    if (b.guionPagado && b.eq.guion === id) return 0;
    let f = T.salarioCon(T.tarifaPara(t, 0), b.pctT && b.pctT[id] || 0);
    if (imp === 'secundario') f *= O.PARTE_SECUNDARIO;
    if (imp === 'invitado') f *= O.PARTE_INVITADO;
    if (imp === 'cameo') f *= O.PARTE_CAMEO;
    return Math.round(f);
  }
  function estadoNegociacion(b, id) { return O.negociaciones(b).filter(function (n) { return n.id === id; })[0]; }
  function filaContrato(b, ta) {
    if (T.exclusivoDe(ta) === 0) return '<p class="chico bien" style="margin:2px 0">Exclusivo de tu estudio: ya cobra su salario anual.</p>';
    if (b.guionPagado && b.eq.guion === ta.id) return '';
    const n = estadoNegociacion(b, ta.id);
    const pct = (b.pctT && b.pctT[ta.id]) || 0;
    const ops = [0, 5, 10, 15].map(function (p) { return '<option value="' + p + '"' + (p === pct ? ' selected' : '') + '>' + (p ? p + ' % de lo que gane el estudio · salario ' + dinero(T.salarioCon(T.tarifaPara(ta, 0), p)) : 'Salario fijo · ' + dinero(T.tarifaPara(ta, 0))) + '</option>'; }).join('');
    return '<div class="fila envolver" style="margin:2px 0"><label class="campo crece" style="margin:0"><span>Contrato</span><select data-c="crPct" data-k="' + ta.id + '">' + ops + '</select></label>' +
      (n && !n.ok ? '<span class="mal chico">' + esc(n.r.texto) + '</span>' : n && n.r.estado !== 'acepta' ? '<span class="bien chico">' + esc(n.r.texto) + ' · de acuerdo</span>' : '<span class="chico tenue">Firma</span>') + '</div>';
  }
  // ---------- Equipo ----------
  function bloqueEquipo(b, conReparto) {
    let h = '<p class="nota">' + t('equipo_ayuda') + ' Cada uno negocia: puede aceptar, pedir un porcentaje, exigir algo o rechazar. Cada cargo le cuesta 20 de energía (recupera 10 al mes) y nadie toma más de 2 proyectos a la vez.</p><button class="btn" data-a="crEquipoRec">' + icono('varita') + t('recomendado') + '</button>';
    // Efectos y animación: talento propio o un estudio externo (V19)
    const Rr = IA.rodaje;
    ['efectos', 'animacion'].forEach(function (r) {
      if (!Rr.necesita(b, r)) return;
      const ops = [['', 'Contratar talento propio']].concat(Rr.externosDisponibles(r, anio()).map(function (e) {
        return [e.id, e.nombre + ' · nivel ' + Math.round(e.nivel + N.limitar((anio() - e.desde) / 25, 0, 6)) + ' · ' + Math.round(e.costo * 100) + ' % de la producción'];
      }));
      h += '<label class="campo"><span>' + (r === 'efectos' ? 'Efectos' : 'Animación') + ': ¿talento propio o estudio externo?</span>' + sel('ext.' + r, ops, (b.ext && b.ext[r]) || '') + '</label>';
    });
    if (!Rr.necesita(b, 'efectos')) h += '<p class="nota">Con efectos normales, el diseñador de arte se ocupa de ellos; desde «Bastantes», o con CGI o efectos prácticos, conviene un supervisor de efectos.</p>';
    h += '<p class="nota">El diseñador de arte y tecnología está a cargo de vestuario, efectos y animación: aunque contrates especialistas o un estudio externo, su nota pesa una cuarta parte en esas áreas.</p>';
    h += O.rolesDe(b).map(function (r) {
      const ta = T.porId(b.eq[r]);
      const fijo = r === 'guion' && b.guionPagado;
      return '<div class="tarjeta"><div class="fila"><canvas class="retrato" data-retrato="' + (ta ? ta.id : '') + '"></canvas><div class="col crece"><span class="tenue chico">' + esc(D.oficio(r).nombre) + (fijo ? ' · autor del guion comprado' : '') + '</span><b>' + (ta ? esc(ta.nom) : '—') + '</b>' +
        (ta ? '<span class="chico">' + t('tal_habilidad') + ' ' + Math.round(ta.hab) + ' · afinidad ' + signo(T.afinidad(ta, b.fam)) + ' · ' + t('tal_fama') + ' ' + Math.round(ta.fama * 100) + ' · ' + (fijo ? 'pagado' : dinero(costoDe(b, ta.id))) + (ta.rasgo ? ' · ' + esc(ta.rasgo) : '') + '</span>' : '') + '</div>' +
        (fijo ? '' : '<button class="btn" data-a="crRol" data-v="' + r + '">Cambiar</button>') + '</div>' + (ta && !fijo ? filaContrato(b, ta) : '') + '</div>' + (cr.rol === r ? listaCandidatos(r) : '');
    }).join('');
    if (conReparto && b.pj) {
      h += '<h4>Elenco</h4>' + b.pj.map(function (p, i) { return { p: p, i: i }; }).filter(function (x) { return x.p.i !== 'extra'; }).map(function (x) {
        const ta = x.p.t !== null && x.p.t !== undefined ? T.porId(x.p.t) : null;
        return '<div class="tarjeta"><div class="fila"><canvas class="retrato" data-retrato="' + (ta ? ta.id : '') + '"></canvas><div class="col crece"><span class="tenue chico">' + esc(x.p.n) + ' · ' + esc((X.importancias.filter(function (im) { return im.id === x.p.i; })[0] || {}).nombre || '') + '</span><b>' + (ta ? esc(ta.nom) : '<span class="mal">Falta contratar</span>') + '</b>' +
          (ta ? '<span class="chico">' + t('tal_habilidad') + ' ' + Math.round(ta.hab) + ' · ' + t('tal_fama') + ' ' + Math.round(ta.fama * 100) + ' · ' + dinero(costoDe(b, ta.id, x.p.i)) + avisoActor(x.p, ta) + '</span>' : '') + '</div><button class="btn" data-a="crPjInt" data-v="' + x.i + '">' + (ta ? 'Cambiar' : 'Contratar') + '</button></div>' + (ta ? filaContrato(b, ta) : '') + '</div>' + (cr.rol === 'pj:' + x.i ? listaCandidatos(cr.rol) : '');
      }).join('');
      h += rango('extras', 0, X.MAX_EXTRAS, b.extras || 0, 'Extras', textoRango(b, 'extras')) + rango('terceros', 0, X.MAX_TERCEROS, b.terceros || 0, 'Terceros (figurantes, dobles y personal de apoyo)', textoRango(b, 'terceros'));
    }
    return h;
  }
  // Candidatos con lo que diría cada uno si lo contratas para este papel
  function listaCandidatos(rol) {
    const b = cr.b;
    const usados = O.idsEquipo(b);
    let lista, titulo, imp = null, of = rol, edadPj;
    if (rol.indexOf('pj:') === 0) {
      const p = b.pj[+rol.slice(3)];
      if (!p) return '';
      imp = p.i; of = 'interprete'; edadPj = p.e;
      if (p.i === 'invitado' || p.i === 'cameo') {
        titulo = 'Estrella para un ' + (p.i === 'cameo' ? 'cameo (15 % de su tarifa)' : 'papel invitado (40 % de su tarifa)');
        lista = N.S.talentos.filter(function (x) { return T.disponible(x, 0) && usados.indexOf(x.id) < 0; }).sort(function (a, c) { return c.fama - a.fama; }).slice(0, 30);
      } else {
        titulo = 'Intérprete para ' + p.n + ' (' + p.e + ' años)';
        lista = T.disponibles('interprete', 0).filter(function (x) { return usados.indexOf(x.id) < 0; })
          .sort(function (a, c) { return puntaje(c, b, p) - puntaje(a, b, p); }).slice(0, 30);
      }
    } else {
      titulo = D.oficio(rol).nombre;
      lista = T.disponibles(rol, 0).filter(function (x) { return usados.indexOf(x.id) < 0; }).sort(function (a, c) { return (c.hab + c.fama * 12 + T.afinidad(c, b.fam)) - (a.hab + a.fama * 12 + T.afinidad(a, b.fam)); }).slice(0, 30);
    }
    const k = X.ORDEN_CLAS.indexOf(b.clas);
    const d = T.porId(b.eq.direccion);
    return '<div class="tarjeta"><h4>Elige: ' + esc(titulo) + '</h4>' + (lista.length ? lista.map(function (x) {
      const r = T.negociar(x, { est: 0, rol: of, imp: imp, clas: k >= 0 ? k : 2, dir: d && of !== 'direccion' ? d.hab : undefined, amor: b.cont ? b.cont.amor : 0, fam: b.fam });
      const no = r.estado === 'rechaza' || (r.estado === 'exige' && !(r.exige || []).every(function (e) { return e.tipo === 'protagonico' ? imp === 'protagonista' : e.tipo === 'director' ? d && d.hab >= e.min : true; }));
      const e = anio() - x.nac;
      const precio = Math.round(T.tarifaPara(x, 0) * (imp === 'secundario' ? O.PARTE_SECUNDARIO : imp === 'invitado' ? O.PARTE_INVITADO : imp === 'cameo' ? O.PARTE_CAMEO : 1));
      return '<button class="fila tarjeta toque" style="width:100%"' + (no ? ' disabled' : '') + ' data-a="crElegir" data-v="' + x.id + '"><canvas class="retrato" data-retrato="' + x.id + '"></canvas><div class="col crece" style="text-align:left"><b>' + esc(x.nom) + '</b><span class="chico">' + D.oficio(x.of).nombre + ' · ' + e + ' años · ' + t('tal_habilidad') + ' ' + Math.round(x.hab) + ' · afinidad ' + signo(T.afinidad(x, b.fam)) + ' · ' + t('tal_fama') + ' ' + Math.round(x.fama * 100) + ' · energía ' + T.energia(x) + (x.rasgo ? ' · ' + esc(x.rasgo) : '') + '</span>' +
        '<span class="chico ' + (no ? 'mal' : r.estado === 'acepta' ? 'bien' : 'oro') + '">' + esc(r.texto) + (edadPj !== undefined && edadPj < 16 && e >= 18 ? ' · es adulto para un papel de niño' : '') + '</span></div><b>' + dinero(precio) + '</b></button>';
    }).join('') : '<p class="tenue">No hay nadie disponible.</p>') + '</div>';
  }
  function puntaje(x, b, p) {
    const e = anio() - x.nac;
    let v = x.hab + x.fama * 12 + T.afinidad(x, b.fam) * 0.5;
    if (x.sx !== p.s) v -= 8;
    if (p.e < 16 ? e >= 18 : Math.abs(e - p.e) > 15) v -= 25;
    if (x.pap && x.pap.indexOf(p.a) >= 0) v += 4;
    return v;
  }
  // ---------- Título y sinopsis ----------
  function bloqueTitulo(b) {
    if (!b.sinEditada) b.sin = I.sinopsis(b);
    let h = '<label class="campo"><span>' + t('titulo_obra') + '</span><input type="text" maxlength="48" value="' + esc(b.tit) + '" data-i="crTitulo"></label><button class="btn" data-a="crOtroTitulo">' + icono('dado') + t('otro_titulo') + '</button>';
    h += '<label class="campo" style="margin-top:10px"><span>Sinopsis (puedes editarla)</span><textarea rows="4" maxlength="400" data-i="crSinTexto">' + esc(b.sin) + '</textarea></label><button class="btn" data-a="crSinopsis">' + icono('refrescar') + 'Volver a generar</button>';
    h += '<div class="tarjeta" style="margin-top:10px"><b>' + esc(b.tit) + '</b><br>' + esc(b.gen.join(' · ')) + ' · ' + esc(b.tono) + ' · ' + esc(b.clas) + ' · ' + esc(X.tipoCine(b.tipo).nombre) + ' · ' + b.min + ' min<br>' +
      '<span class="nota">La crítica podría decir: «' + esc(I.fraseCritica(b)) + '» · Si gana un premio: «' + esc(I.frasePremio(b)) + '»</span><br>' +
      '<span class="nota">Etiquetas posibles: Clásico si la crítica pasa de 85; Culto si fracasa en taquilla y la crítica la defiende.</span></div>';
    return h;
  }
  // ---------- Selector de listas grandes (con buscador) ----------
  function gruposPicker(k) {
    if (k === 'tem') return X.familiasTema.map(function (f) { return { nombre: f.nombre, items: f.items }; });
    if (k === 'sub') return X.listaSubgeneros();
    if (k === 'prob') return X.familiasProblema.map(function (f) { return { nombre: f.nombre, items: Object.keys(f.items).sort(function (x, y) { return x.localeCompare(y, 'es'); }) }; });
    if (k === 'fic') return X.familiasFiccion.map(function (f) { return { nombre: f.nombre + (f.crit || f.pub ? ' (crítica ' + signo(f.crit) + ', público ' + signo(f.pub) + ')' : ''), items: f.items }; });
    const g = {};
    X.publicos.forEach(function (p) { (g[p.grupo] = g[p.grupo] || []).push(p.id); });
    return Object.keys(g).map(function (n) { return { nombre: n, items: g[n] }; });
  }
  const NOMBRE_PICKER = { tem: 'Temas', sub: 'Subgéneros', prob: 'Problemáticas y argumentos', fic: 'Tipo de ficción', pubs: 'Público objetivo' };
  function listaPicker() {
    const b = cr.b, k = cr.picker, q = cr.q.toLowerCase();
    const max = k === 'fic' ? 1 : I.LIMITES[k];
    const elegidos = k === 'fic' ? [b.fic] : (b[k] || []);
    return gruposPicker(k).map(function (g) {
      const items = g.items.filter(function (x) { return !q || x.toLowerCase().indexOf(q) >= 0; });
      if (!items.length) return '';
      return '<h4 style="margin:8px 0 4px">' + esc(g.nombre) + '</h4><div class="chips">' + items.map(function (x) {
        const on = elegidos.indexOf(x) >= 0;
        const prueba = k === 'pubs' && b.gen.indexOf('Erótico') >= 0 && (X.publico(x) || {}).infantil;
        return chip(x + (k === 'tem' && X.DEPORTES_NUEVOS.indexOf(x) >= 0 ? ' *' : ''), 'crPick', x, on, prueba || (!on && max > 1 && elegidos.length >= max));
      }).join('') + '</div>';
    }).join('') || '<p class="tenue">Nada coincide.</p>';
  }
  function bloquePicker(b) {
    const k = cr.picker;
    const max = k === 'fic' ? 1 : I.LIMITES[k];
    const n = k === 'fic' ? 1 : (b[k] || []).length;
    return '<div class="tarjeta picker"><div class="fila entre"><b>' + esc(NOMBRE_PICKER[k]) + ' (' + n + '/' + max + ')</b><button class="btn primario" data-a="crPickerCerrar">Listo</button></div>' +
      (k === 'tem' ? '<p class="nota">227 temas en 8 familias; los 10 deportes nuevos llevan *.</p>' : '') +
      '<input type="search" placeholder="Buscar" value="' + esc(cr.q) + '" data-i="crBuscar" style="margin:6px 0"><div id="crPickLista">' + listaPicker() + '</div></div>';
  }

  // =====================================================================
  // MODO RÁPIDO Y MODO DETALLADO
  // =====================================================================
  const PASOS = ['paso_generos', 'paso_historia', 'paso_escala', 'paso_equipo', 'paso_titulo'];
  function vistaRapida() {
    const b = cr.b;
    let h = '<div class="fila entre"><h2>' + t('crear_obra') + '</h2><button class="btn" data-a="crModo" data-v="detallado">Modo detallado</button></div>';
    h += '<p class="nota">' + PASOS.map(function (p, i) { return '<span class="' + (i === cr.paso ? 'paso-actual' : '') + '">' + (i + 1) + '. ' + t(p) + '</span>'; }).join(' · ') + '</p>';
    if (cr.paso === 0) h += bloqueGeneros(b);
    else if (cr.paso === 1) h += bloqueHistoria(b, false) + (cr.picker ? '' : bloqueTono(b) + '<p class="tenue">' + esc(I.sinopsis(b)) + '</p>');
    else if (cr.paso === 2) {
      h += '<p class="nota">' + t('escala_ayuda') + '</p>' + D.escalas.map(function (es, i) {
        const pp = E.produccionTipica(anio(), b.fam) * es.mult * O.escalaTono(b.tono) * I.factorCosto(b, anio());
        return '<button class="tarjeta toque fila entre" style="width:100%;' + (Math.abs(b.presM - es.mult) < 0.01 ? 'border-color:var(--acento);border-width:2px' : '') + '" data-a="crEscala" data-v="' + i + '"><b>' + es.nombre + '</b><span>' + dinero(pp) + '</span></button>';
      }).join('');
      h += rango('pres', 0, 100, sliderDePres(b.presM), 'Presupuesto de producción', textoRango(b, 'pres'));
      // Cómo se filma (V19): el método, con el recomendado marcado; el resto queda en lo ideal
      const rec = IA.rodaje.metodoRecomendado(b, anio());
      h += '<h4>Cómo se filma</h4><div class="chips">' + IA.rodaje.metodosDisponibles(anio()).map(function (m) { return chip(m.nombre + (m.id === rec ? ' ★' : ''), 'crMet', m.id, b.met === m.id); }).join('') + '</div><p class="nota">' + esc(IA.rodaje.metodo(b.met).texto) + ' Terreno, set, estilo y reparto del presupuesto: en el modo detallado.</p>';
      h += '<div class="tarjeta" style="margin-top:8px">' + textoClas(b) + (cr.abiertas.contRap ? '' : '<br><button class="btn" data-a="crSeccion" data-v="contRap">Ajustar contenido</button>') + '</div>';
      if (cr.abiertas.contRap) h += bloquePublico(b);
    } else if (cr.paso === 3) h += bloqueEquipo(b, true);
    else h += bloqueTitulo(b);
    h += pie(b);
    h += '<div class="fila entre" style="margin-top:8px">' + (cr.paso > 0 ? '<button class="btn" data-a="crPaso" data-v="-1">' + t('atras') + '</button>' : '<button class="btn" data-a="crVolverCamino">' + t('atras') + '</button>') +
      (cr.paso < PASOS.length - 1 ? '<button class="btn primario" data-a="crPaso" data-v="1">' + t('siguiente') + '</button>' : '<button class="btn primario" data-a="crIniciar">' + t('iniciar') + '</button>') + '</div>';
    return h;
  }
  // ---------- V19 · Cómo y dónde se filma ----------
  const EDADES_N = ['niños', 'adolescentes', 'jóvenes', 'adultos', 'mayores'];
  function bloquePais(b) {
    const Rr = IA.rodaje, a = anio();
    const casa = D.pais(N.S.estudios[0].pais);
    const rodaje = [['', 'En casa: ' + casa.nombre]].concat(D.paises.filter(function (p) { return p.id !== casa.id; }).sort(function (x, y) { return x.costo - y.costo; }).map(function (p) {
      const inc = Rr.incentivo({ rod: p.id }, a);
      return [p.id, p.nombre + ' · costo ×' + U.decimal(N.limitar(Math.pow(p.costo / casa.costo, 0.6), 0.5, 1.8), 2) + (inc ? ' · incentivo −' + Math.round(inc * 100) + ' %' : '') + (Rr.INDUSTRIA.indexOf(p.id) < 0 ? ' · equipo local chico' : '')];
    }));
    return '<label class="campo"><span>País de rodaje</span>' + sel('rod', rodaje, b.rod || '') + '</label><p class="nota">Cada país tiene su costo local; algunos devuelven una parte del gasto (incentivos). Rodar en otra región suma una semana de viaje y 3 %; donde la industria es chica, la producción y la imagen rinden un poco menos.</p>';
  }
  function bloqueRodaje(b) {
    const Rr = IA.rodaje, a = anio();
    const rec = Rr.metodoRecomendado(b, a);
    let h = '<h4>Método</h4><div class="chips">' + Rr.METODOS.map(function (m) {
      return chip(m.nombre + (m.desde > a ? ' · ' + m.desde : '') + (m.id === rec ? ' ★' : ''), 'crMet', m.id, b.met === m.id, m.desde > a);
    }).join('') + '</div><p class="nota">' + esc(Rr.metodo(b.met).texto) + (b.met === 'cgi' ? ' Costo del CGI en ' + a + ': ×' + U.decimal(Rr.costoCGI(a), 2) + '.' : '') + ' ★ = recomendado para esta idea.</p>';
    if (Rr.usaLocacion(b)) {
      h += '<h4>Terreno de la locación</h4><div class="chips">' + Rr.TERRENOS.map(function (tr) {
        const luce = tr.generos.some(function (g) { return b.gen.indexOf(g) >= 0; });
        const propio = Rr.terrenoPropio(Object.assign({}, b, { ter: tr.id }));
        return chip(tr.nombre + (luce ? ' · luce' : '') + (propio ? ' · tuyo' : ''), 'crTer', tr.id, b.ter === tr.id);
      }).join('') + '</div>';
      const tr = Rr.terreno(b.ter);
      h += '<p class="nota">' + esc(tr.nombre) + ': costo ×' + U.decimal(tr.costo, 2) + ', incidentes ×' + U.decimal(tr.riesgo, 1) + (tr.generos.some(function (g) { return b.gen.indexOf(g) >= 0; }) ? '; el paisaje luce en este género (+1 al público)' : '') + (Rr.terrenoPropio(b) ? '; es tierra tuya: más barato, más seguro y una semana menos' : '') + '. Las tierras propias se compran en Negocio › Construcciones.</p>';
    }
    h += bloquePais(b);
    if (Rr.usaSet(b)) {
      const tp = Rr.tipoSet(b), sets = Rr.setsQueSirven(b);
      h += '<h4>Set: ' + esc(tp.nombre) + '</h4>';
      h += sets.length ? '<div class="chips">' + chip('Construir uno nuevo', 'crSet', '', !b.setR) + sets.map(function (x) { return chip('Reusar el de «' + x.obra + '» (' + x.anio + ', calidad ' + x.q + ', ' + x.usos + ' usos)', 'crSet', String(x.id), b.setR === x.id); }).join('') + '</div><p class="nota">Reusar ahorra 7 % y una semana de preproducción; la calidad del set suma o resta al arte; si el público ya lo vio 3 veces, resta 1.</p>' :
        '<p class="nota">Se construye nuevo y queda en tu almacén para otras obras (caben ' + Rr.capacidadSets(0) + '; más con platós y backlots).</p>';
    }
    h += '<h4>Estilo de producción</h4><div class="chips">' + Rr.ESTILOS.map(function (e) { return chip(e.nombre + (e.desde > a ? ' · ' + e.desde : ''), 'crPst', e.id, b.pst === e.id, e.desde > a); }).join('') + '</div>';
    const es = Rr.estilo(b.pst);
    h += '<p class="nota">' + esc(es.texto) + (es.ama.length ? ' Lo aman los ' + es.ama.map(function (i) { return EDADES_N[i]; }).join(' y los ') + '.' : '') + (es.rechaza.length ? ' Lo rechazan los ' + es.rechaza.map(function (i) { return EDADES_N[i]; }).join(' y los ') + '.' : '') + '</p>';
    return h;
  }
  // ---------- V19 · Departamentos y presupuesto ----------
  function notasTxt(b) {
    return IA.rodaje.notas(b, NG.bonos(0, b.fam)).map(function (n) { return '<span class="etiqueta nota-dep">' + esc(n.nombre) + ' <b>' + n.letra + '</b></span>'; }).join(' ');
  }
  function bloquePresupuesto(b) {
    const Rr = IA.rodaje, id = Rr.ideal(b), r = Rr.reparto(b);
    let h = '<p class="nota">El presupuesto de producción (' + dinero(b.pp) + ') se reparte entre los departamentos. El ideal depende de la familia, los efectos, la época y cómo se filma: quitarle a uno le baja la nota (hasta −10) y darle de más suma poco (hasta +3).</p>' +
      '<button class="btn" data-a="crRepIdeal">' + icono('varita') + 'Repartir como lo ideal</button>';
    h += Object.keys(id).map(function (k) { return rango('rep:' + k, 0, 60, Math.round(r[k] * 100), Rr.nombreDep(k) + ' (ideal ' + Math.round(id[k] * 100) + ' %)', textoRango(b, 'rep:' + k)); }).join('');
    h += '<h4>Notas esperadas por departamento</h4><div class="chips">' + notasTxt(b) + '</div><p class="nota">De F a A+: salen del talento a cargo, de su afinidad con la familia, de las instalaciones, del presupuesto y de cómo se filma.</p>';
    return h;
  }
  const SECCIONES = [
    ['obra', 'La obra', bloqueObra], ['generos', 'Géneros', bloqueGeneros], ['historia', 'Historia', function (b) { return bloqueHistoria(b, true); }],
    ['estilo', 'Corriente, tono, estilo y formato', bloqueEstilo], ['mundo', 'Época, lugar e idioma', bloqueMundo],
    ['publico', 'Público y contenido', bloquePublico], ['forma', 'Duración, complejidad, ritmo, efectos y presupuesto', bloqueForma],
    ['rodaje', 'Cómo y dónde se filma', bloqueRodaje], ['presupuesto', 'Departamentos y presupuesto', bloquePresupuesto],
    ['personajes', 'Personajes', bloquePersonajes], ['equipo', 'Equipo', function (b) { return bloqueEquipo(b, false); }], ['titulo', 'Título y sinopsis', bloqueTitulo],
  ];
  function resumenSeccion(b, id) {
    if (id === 'obra') return X.tipoCine(b.tipo).nombre + ' · ' + (b.nat === 'r' ? 'realidad' : 'ficción');
    if (id === 'generos') return b.gen.join(' · ');
    if (id === 'historia') return (b.tem || []).slice(0, 2).join(', ') + (b.arco ? ' · ' + X.arco(b.arco).nombre : '');
    if (id === 'estilo') return b.tono + ' · ' + b.estilo + (b.corr !== X.ESTANDAR ? ' · ' + b.corr : '');
    if (id === 'mundo') return X.epoca(b.epo).nombre + ' · ' + b.idio;
    if (id === 'publico') return b.clas + ((b.pubs || []).length ? ' · ' + b.pubs.join(', ') : '');
    if (id === 'forma') return b.min + ' min · ' + X.complejidad[b.cx] + ' · ' + X.ritmo[b.rit].id + ' · ' + dinero(b.pp);
    if (id === 'rodaje') return IA.rodaje.metodo(b.met).nombre + (IA.rodaje.usaLocacion(b) ? ' · ' + IA.rodaje.terreno(b.ter).nombre : '') + ' · ' + IA.rodaje.estilo(b.pst).nombre + (b.rod ? ' · ' + D.pais(b.rod).nombre : '');
    if (id === 'presupuesto') return b.rep ? 'Reparto propio' : 'Reparto ideal';
    if (id === 'personajes') return (b.pj || []).length + ' personajes';
    if (id === 'equipo') { const d = T.porId(b.eq.direccion); return d ? 'Dirige ' + d.nom : ''; }
    return b.tit;
  }
  function vistaDetallada() {
    const b = cr.b;
    let h = '<div class="fila entre"><h2>' + t('crear_obra') + '</h2><button class="btn" data-a="crModo" data-v="rapido">Modo rápido</button></div>';
    h += '<p class="nota">Todas las listas de tu documento. Toca cada sección para abrirla; los totales de abajo cambian en vivo.</p>';
    SECCIONES.forEach(function (s) {
      const abierta = !!cr.abiertas[s[0]];
      h += '<div class="tarjeta seccion-cr"><button class="cab-seccion toque" data-a="crSeccion" data-v="' + s[0] + '" aria-expanded="' + abierta + '"><b>' + esc(s[1]) + '</b><span class="tenue chico">' + esc(abierta ? '' : resumenSeccion(b, s[0])) + '</span><span aria-hidden="true">' + (abierta ? '▲' : '▼') + '</span></button>' + (abierta ? '<div>' + s[2](b) + '</div>' : '') + '</div>';
    });
    h += pie(b);
    h += '<div class="fila entre" style="margin-top:8px"><button class="btn" data-a="crVolverCamino">' + t('atras') + '</button><button class="btn primario" data-a="crIniciar">' + t('iniciar') + '</button></div>';
    return h;
  }
  function fichaCrear() {
    if (cr.etapa === 'camino' || !cr.b && cr.etapa === 'idea') return vistaCamino();
    if (cr.etapa === 'guiones') return vistaGuiones();
    if (cr.etapa === 'material') return vistaMaterial();
    return modo === 'rapido' ? vistaRapida() : vistaDetallada();
  }
  function refrescar() { U.refrescarFicha(fichaCrear()); }
  function irAPicker() {
    setTimeout(function () { const p = document.querySelector('#ficha .picker'); if (p && p.scrollIntoView) p.scrollIntoView({ block: 'start' }); }, 0);
  }

  // =====================================================================
  // ACCIONES
  // =====================================================================
  ac('crearObra', function () {
    if (O.enProduccion(0).length >= NG.capacidad(0)) { U.aviso('No tienes capacidad libre: construye un plató o espera.', 'mal'); return; }
    cr.b = null; cr.etapa = 'camino'; cr.paso = 0; cr.rol = null; cr.picker = null; cr.q = '';
    U.abrirFicha(fichaCrear(), 'crear');
  });
  ac('crModo', function (v) {
    modo = v === 'detallado' ? 'detallado' : 'rapido';
    try { localStorage.setItem('ia.modoCrear', modo); } catch (e) { /* sin almacenamiento */ }
    cr.picker = null; cr.rol = null;
    refrescar();
  });
  ac('crVolverCamino', function () { cr.etapa = 'camino'; cr.b = null; cr.picker = null; cr.rol = null; refrescar(); });
  function empezarIdea(b) { cr.b = ajustar(b); cr.etapa = 'idea'; cr.paso = 0; cr.rol = null; cr.picker = null; refrescar(); }
  ac('crCamino', function (v) {
    if (v === 'nueva') empezarIdea(nuevoBorrador());
    else if (v === 'guion') { cr.etapa = 'guiones'; refrescar(); }
    else if (v === 'material') { cr.etapa = 'material'; cr.qMat = ''; refrescar(); }
    else if (v === 'ia') {
      if (anio() < I.ANIO_IA) return;
      empezarIdea(nuevoBorrador(null, function (b) { I.ideaIA(b, anio()); }));
      cr.paso = 4;
      U.aviso('La IA armó la idea: la historia queda fija; puedes cambiar el resto.');
      refrescar();
    }
  });
  ac('crInforme', function (v) { const e = I.informeLectura(+v, IA.sede.tieneAnalista()); if (e) U.aviso(e, 'mal'); else U.aviso('Llega el informe de lectura'); refrescar(); });
  ac('crRegatear', function (v) { const r = I.regatear(+v, IA.sede.tieneAnalista()); if (r.error) U.aviso(r.error, 'mal'); else U.aviso(r.texto, r.ok ? '' : 'mal'); refrescar(); });
  ac('crComprarGuion', function (v) {
    const err = J.comprarGuion(+v);
    if (err) { U.aviso(err, 'mal'); return; }
    IA.arte.sonido('dinero');
    U.aviso('Guion comprado: ya está en «Tus guiones».');
    U.renderBarra();
    refrescar();
  });
  ac('crProducirGuion', function (v) {
    const g = (N.S.guionesPropios || []).filter(function (x) { return x.id === +v; })[0];
    if (!g) return;
    const b = nuevoBorrador(g.idea.gen, function (b2) {
      I.aplicarIdea(b2, g.idea);
      b2.guionC = g.calif; b2.guionId = g.id;
      // El precio del guion incluye a su autor; si no está disponible, otro escritor lo pule (y cobra)
      const autor = T.porId(g.autor);
      if (autor && T.disponible(autor)) { b2.eq.guion = autor.id; b2.guionPagado = 1; }
    });
    empezarIdea(b);
  });
  ac('crMatGrupo', function (v) { cr.grupoMat = v; refrescar(); });
  ac('crMatBuscar', function (v) { cr.qMat = v; const l = document.getElementById('crMatLista'); if (l) l.innerHTML = listaMaterial(); });
  ac('crAdaptar', function (v) {
    const m = X.material(v);
    if (!m) return;
    const b = nuevoBorrador(X.generosDeCine(m.gen), function (b2) { I.usarMaterial(b2, v, anio()); });
    b.contTocado = b.mat && m.grupo === 'tono' ? 1 : 0;
    empezarIdea(b);
  });
  // Nueva obra con un talento ya elegido (desde su ficha): va a su oficio o, si actúa, de protagonista
  // Si quien elegiste exige un director de cierto nivel, se busca uno que cumpla (el más barato que acepte)
  function cumplirExigencias(b, x) {
    let n = O.negociaciones(b).filter(function (q) { return q.id === x.id; })[0];
    const ex = n && n.r.exige ? n.r.exige.filter(function (e) { return e.tipo === 'director'; })[0] : null;
    if (ex) buscarDirector(b, ex.min);
    // Y si pide porcentaje, se le pone de una vez (como al elegirlo de la lista)
    n = O.negociaciones(b).filter(function (q) { return q.id === x.id; })[0];
    if (n && n.r.estado === 'contraoferta') { b.pctT = b.pctT || {}; b.pctT[x.id] = n.r.pctMin; }
  }
  function buscarDirector(b, min) {
    const usados = O.idsEquipo(b);
    const k = X.ORDEN_CLAS.indexOf(b.clas);
    const cand = T.disponibles('direccion', 0).filter(function (d) {
      if (d.hab < min || usados.indexOf(d.id) >= 0) return false;
      return T.negociar(d, { est: 0, rol: 'direccion', clas: k >= 0 ? k : 2, amor: b.cont ? b.cont.amor : 0, fam: b.fam }).estado === 'acepta';
    }).sort(function (a, c) { return T.tarifaPara(a, 0) - T.tarifaPara(c, 0); });
    if (cand.length) { b.eq.direccion = cand[0].id; ajustar(b); }
  }
  function crearCon(id) {
    const x = T.porId(id);
    if (!x) return;
    if (O.enProduccion(0).length >= NG.capacidad(0)) { U.aviso('No tienes capacidad libre: construye un plató o espera.', 'mal'); return; }
    const b = nuevoBorrador(null, function (b2) {
      if (x.of !== 'interprete') b2.eq[x.of] = x.id;
    });
    if (x.of !== 'interprete' && b.eq[x.of] !== x.id) b.eq[x.of] = x.id; // aunque pida algo, es tu elección
    if (x.of === 'interprete' && b.pj) {
      const p = b.pj.filter(function (q) { return q.i === 'protagonista'; })[0];
      if (p) { p.t = x.id; p.s = x.sx; p.e = Math.min(80, N.anio() - x.nac); p.n = I.nombrePersonaje(I.regionDe(b), x.sx); }
      b.eq.int = (b.eq.int || []).filter(function (q) { return q !== x.id; });
      b.pj.forEach(function (q) { if (q !== p && q.t === x.id) q.t = null; });
      conAzarUI(function () { O.equipoNegociado(b, 1); });
      // Si la negociación lo sacó (por ejemplo, exige otro director), vuelve a su papel y se ve qué pide
      if (p && p.t !== x.id) p.t = x.id;
      sincronizar(b);
    }
    cumplirExigencias(b, x);
    cr.b = ajustar(b); cr.etapa = 'idea'; cr.paso = 3; cr.rol = null; cr.picker = null;
    U.abrirFicha(fichaCrear(), 'crear');
    U.aviso(x.nom + ' ya está en tu nueva obra');
  }
  ac('crIA', function () { if (!cr.b || anio() < I.ANIO_IA) return; conAzarUI(function () { I.ideaIA(cr.b, anio()); I.generarPersonajes(cr.b); }); ajustar(cr.b); refrescar(); });
  // ---------- Géneros ----------
  ac('crGen', function (g) {
    const b = cr.b;
    if (!b || bloqueado(b, 'gen')) return;
    const i = b.gen.indexOf(g);
    if (i >= 0) { if (b.gen.length > 1) b.gen.splice(i, 1); } else if (b.gen.length < 3) b.gen.push(g);
    ajustar(b); refrescar();
  });
  ac('crGenRec', function () {
    const b = cr.b;
    if (!b || bloqueado(b, 'gen')) return;
    const g1 = recomendarGenero(), f1 = D.familiaDe[g1];
    const buena = D.ORDEN_FAM.filter(function (f) { return D.encaje(f1, f) >= 3; })[0];
    b.gen = [g1];
    if (buena) { const g2 = D.familia(buena).generos.filter(function (g) { return g !== 'Erótico'; })[0]; if (!O.validarGeneros([g1, g2])) b.gen.push(g2); }
    ajustar(b); refrescar();
  });
  ac('crGenDado', function () {
    const b = cr.b;
    if (!b || bloqueado(b, 'gen')) return;
    const todos = [];
    D.familias.forEach(function (f) { f.generos.forEach(function (g) { todos.push(g); }); });
    const sem = Date.now();
    const k = 1 + (N.hash('d' + sem) % 2), gen = [];
    for (let i = 0; i < 20 && gen.length < k; i++) {
      const g = todos[N.hash(i + '|' + sem) % todos.length];
      if (gen.indexOf(g) < 0 && !O.validarGeneros(gen.concat([g]))) gen.push(g);
    }
    b.gen = gen.length ? gen : ['Drama'];
    ajustar(b); refrescar();
  });
  // ---------- Historia ----------
  ac('crHistRec', function () { if (!cr.b) return; conAzarUI(function () { const keep = { tem: bloqueado(cr.b, 'tem') && cr.b.tem, prob: bloqueado(cr.b, 'prob') && cr.b.prob, arco: bloqueado(cr.b, 'arco') && cr.b.arco, epo: cr.b.epo }; I.recomendarHistoria(cr.b, anio()); Object.keys(keep).forEach(function (k) { if (keep[k]) cr.b[k] = keep[k]; }); }); ajustar(cr.b); refrescar(); });
  ac('crHistDado', function () {
    const b = cr.b;
    if (!b) return;
    const i = conAzarUI(function () { N.azar(); return I.ideaAleatoria(anio(), 30 + N.entero(0, 60)); });
    if (!bloqueado(b, 'tem')) b.tem = i.tem;
    if (!bloqueado(b, 'prob')) b.prob = i.prob;
    if (!bloqueado(b, 'arco')) b.arco = i.arco;
    ajustar(b); refrescar();
  });
  function alternar(lista, x, max) { const i = lista.indexOf(x); if (i >= 0) lista.splice(i, 1); else if (lista.length < max) lista.push(x); return lista; }
  ac('crTema', function (v) { if (!cr.b || bloqueado(cr.b, 'tem')) return; alternar(cr.b.tem, v, I.LIMITES.tem); ajustar(cr.b); refrescar(); });
  ac('crProb', function (v) { if (!cr.b || bloqueado(cr.b, 'prob')) return; alternar(cr.b.prob, v, I.LIMITES.prob); ajustar(cr.b); refrescar(); });
  ac('crPreFam', function (v) { cr.preFam = v; refrescar(); });
  ac('crPre', function (v) { if (!cr.b) return; const p = cr.b.pre = cr.b.pre || []; const i = p.indexOf(v); if (i >= 0) p.splice(i, 1); else if (p.length < 2) p.push(v); refrescar(); });
  ac('crArco', function (v) { if (!cr.b || bloqueado(cr.b, 'arco')) return; cr.b.arco = cr.b.arco === v && cr.b.nat === 'r' ? '' : v; ajustar(cr.b); refrescar(); });
  ac('crSubarco', function (v) { if (!cr.b || bloqueado(cr.b, 'sarc')) return; alternar(cr.b.sarc, v, I.LIMITES.sarc); ajustar(cr.b); refrescar(); });
  ac('crNat', function (v) {
    const b = cr.b;
    if (!b) return;
    b.nat = v === 'r' ? 'r' : 'f';
    if (b.nat === 'f' && b.tipo === 'documental') b.tipo = 'real';
    ajustar(b); refrescar();
  });
  ac('crTono', function (v) { if (!cr.b || bloqueado(cr.b, 'tono')) return; cr.b.tono = v; ajustar(cr.b); refrescar(); });
  ac('crPrio', function (v) { if (!cr.b) return; cr.b.prio = v; ajustar(cr.b); refrescar(); });
  ac('crTipo', function (v) {
    const b = cr.b;
    if (!b) return;
    b.tipo = v;
    if (X.tipoCine(v).realidad) b.nat = 'r';
    ajustar(b); refrescar();
  });
  // ---------- Selector de listas ----------
  ac('crPicker', function (v) { if (!cr.b) return; cr.picker = v; cr.q = ''; refrescar(); irAPicker(); });
  ac('crPickerCerrar', function () { cr.picker = null; cr.q = ''; refrescar(); });
  ac('crBuscar', function (v) { cr.q = v; const l = document.getElementById('crPickLista'); if (l) l.innerHTML = listaPicker(); });
  ac('crPick', function (v) {
    const b = cr.b, k = cr.picker;
    if (!b || !k || bloqueado(b, k)) return;
    if (k === 'fic') b.fic = v;
    else alternar(b[k] = b[k] || [], v, I.LIMITES[k]);
    if (k === 'pubs' && b.gen.indexOf('Erótico') >= 0) b.pubs = b.pubs.filter(function (p) { const x = X.publico(p); return !(x && x.infantil); });
    ajustar(b);
    const l = document.getElementById('crPickLista');
    if (l) { l.innerHTML = listaPicker(); const cab = document.querySelector('#ficha .picker b'); if (cab) cab.textContent = NOMBRE_PICKER[k] + ' (' + (k === 'fic' ? 1 : b[k].length) + '/' + (k === 'fic' ? 1 : I.LIMITES[k]) + ')'; refrescarPie(); }
    else refrescar();
  });
  // ---------- Selectores y deslizadores ----------
  ac('crSel', function (v, el) {
    const b = cr.b;
    if (!b) return;
    const k = el.getAttribute('data-k');
    if (k.indexOf('fmt.') === 0) { b.fmt = Object.assign({}, b.fmt); b.fmt[k.slice(4)] = v; }
    else if (k.indexOf('ext.') === 0) { b.ext = Object.assign({}, b.ext); if (v) b.ext[k.slice(4)] = v; else delete b.ext[k.slice(4)]; }
    else b[k] = v;
    if (k === 'rod' && !v) delete b.rod;
    ajustar(b); refrescar();
  });
  function aplicarRango(b, k, v) {
    v = +v;
    if (k.indexOf('c:') === 0) { b.cont = Object.assign({}, b.cont); b.cont[k.slice(2)] = v; b.contTocado = 1; }
    else if (k === 'pres') b.presM = presDeSlider(v);
    else if (k.indexOf('rep:') === 0) { b.rep = Object.assign({}, IA.rodaje.reparto(b)); b.rep[k.slice(4)] = v / 100; }
    else if (k === 'epo') { const ep = X.epocasDisponibles(anio())[v]; if (ep) b.epo = ep.id; }
    else b[k] = v;
    O.recalcular(b);
  }
  ac('crRango', function (v, el) {
    const b = cr.b;
    if (!b) return;
    const k = el.getAttribute('data-k');
    aplicarRango(b, k, v);
    const lbl = document.getElementById('rv-' + k.replace(':', '-'));
    if (lbl) lbl.textContent = textoRango(b, k);
    const cl = document.getElementById('crClas');
    if (cl) cl.innerHTML = textoClas(b);
    refrescarPie();
  });
  ac('crRangoFin', function (v, el) { if (!cr.b) return; aplicarRango(cr.b, el.getAttribute('data-k'), v); ajustar(cr.b); refrescar(); });
  ac('crPct', function (v, el) {
    const b = cr.b;
    if (!b) return;
    b.pctT = b.pctT || {};
    const id = el.getAttribute('data-k');
    if (+v) b.pctT[id] = +v; else delete b.pctT[id];
    ajustar(b); refrescar();
  });
  ac('crMet', function (v) { if (!cr.b) return; cr.b.met = v; cr.b.metTocado = 1; ajustar(cr.b); refrescar(); });
  ac('crTer', function (v) { if (!cr.b) return; cr.b.ter = v; cr.b.terTocado = 1; ajustar(cr.b); refrescar(); });
  ac('crPst', function (v) { if (!cr.b) return; cr.b.pst = v; ajustar(cr.b); refrescar(); });
  ac('crSet', function (v) { if (!cr.b) return; if (v) cr.b.setR = +v; else delete cr.b.setR; ajustar(cr.b); refrescar(); });
  ac('crRepIdeal', function () { if (!cr.b) return; delete cr.b.rep; ajustar(cr.b); refrescar(); });
  ac('crClasN', function (v) { if (!cr.b) return; cr.b.clasN = !!v; cr.b.clasTocada = 1; ajustar(cr.b); refrescar(); });
  ac('crSeccion', function (v) { cr.abiertas[v] = !cr.abiertas[v]; cr.picker = null; cr.rol = null; refrescar(); });
  ac('crPieDetalle', function () { cr.pieAbierto = !cr.pieAbierto; refrescarPie(); });
  ac('crEscala', function (v) { if (!cr.b) return; cr.b.presM = D.escalas[+v].mult; ajustar(cr.b); refrescar(); });
  // ---------- Personajes ----------
  function pjDe(v) { return cr.b && cr.b.pj ? cr.b.pj[+v] : null; }
  ac('crPjAdd', function (v) {
    const b = cr.b;
    if (!b) return;
    const im = X.importancias.filter(function (x) { return x.id === v; })[0];
    if (!im || b.pj.filter(function (p) { return p.i === v; }).length >= im.max) return;
    b.pj.push(conAzarUI(function () { return I.personajeNuevo(b, v); }));
    sincronizar(b); refrescar();
  });
  ac('crPjDel', function (v) { const b = cr.b; if (!b) return; b.pj.splice(+v, 1); cr.rol = null; sincronizar(b); refrescar(); });
  ac('crPjGenerar', function () {
    const b = cr.b;
    if (!b) return;
    conAzarUI(function () { I.generarPersonajes(b); O.equipoNegociado(b, 1); });
    sincronizar(b); refrescar();
  });
  ac('crPjNombre', function (v, el) { const p = pjDe(el.getAttribute('data-k')); if (p) { p.n = v.slice(0, 30); if (!cr.b.sinEditada) cr.b.sin = I.sinopsis(cr.b); } });
  ac('crPjDado', function (v) { const p = pjDe(v); if (!p) return; p.n = conAzarUI(function () { return I.nombrePersonaje(I.regionDe(cr.b), p.s); }); ajustar(cr.b); refrescar(); });
  ac('crPjImp', function (v) {
    const x = v.split('|'), p = pjDe(x[0]);
    if (!p || p.i === x[1]) return;
    const im = X.importancias.filter(function (y) { return y.id === x[1]; })[0];
    if (cr.b.pj.filter(function (q) { return q.i === x[1]; }).length >= im.max) { U.aviso('Máximo ' + im.max + ' de ese tipo.', 'mal'); return; }
    const antes = p.i;
    p.i = x[1];
    // Intérprete contratado y estrella invitada son contratos distintos
    if ((antes === 'invitado' || antes === 'cameo') !== (p.i === 'invitado' || p.i === 'cameo')) p.t = null;
    sincronizar(cr.b); refrescar();
  });
  ac('crPjEdad', function (v, el) { const p = pjDe(el.getAttribute('data-k')); if (!p) return; p.e = N.limitar(Math.round(+v || 30), 1, 110); sincronizar(cr.b); refrescar(); });
  ac('crPjSexo', function (v, el) { const p = pjDe(el.getAttribute('data-k')); if (!p) return; p.s = v === 'F' ? 'F' : 'M'; ajustar(cr.b); refrescar(); });
  ac('crPjArq', function (v, el) { const p = pjDe(el.getAttribute('data-k')); if (!p) return; p.a = v; ajustar(cr.b); refrescar(); });
  ac('crPjInt', function (v) { if (!cr.b) return; cr.rol = cr.rol === 'pj:' + v ? null : 'pj:' + v; refrescar(); });
  ac('crPjQuitarInt', function (v) { const p = pjDe(v); if (!p) return; p.t = null; sincronizar(cr.b); refrescar(); });
  // ---------- Equipo ----------
  ac('crEquipoRec', function () {
    const b = cr.b;
    if (!b) return;
    const guion = b.guionPagado ? b.eq.guion : null;
    b.eq = { int: [], inv: b.eq.inv || [], cam: b.eq.cam || [] };
    if (guion !== null && guion !== undefined) b.eq.guion = guion;
    (b.pj || []).forEach(function (p) { if (p.i === 'protagonista' || p.i === 'secundario') p.t = null; });
    b.pctT = {};
    conAzarUI(function () { O.equipoNegociado(b, 1); });
    cr.rol = null; ajustar(b); refrescar();
  });
  ac('crRol', function (v) { if (!cr.b) return; cr.rol = cr.rol === v ? null : v; refrescar(); });
  ac('crElegir', function (v) {
    const b = cr.b, id = +v;
    if (!b || !cr.rol) return;
    const anterior = cr.rol.indexOf('pj:') === 0 ? (b.pj[+cr.rol.slice(3)] || {}).t : b.eq[cr.rol];
    if (anterior !== null && anterior !== undefined && b.pctT) delete b.pctT[anterior];
    if (cr.rol.indexOf('pj:') === 0) { const p = b.pj[+cr.rol.slice(3)]; if (p) p.t = id; sincronizar(b); }
    else b.eq[cr.rol] = id;
    // Si pidió un porcentaje, se le pone de una vez (puedes cambiarlo en su contrato)
    const n = estadoNegociacion(b, id);
    if (n && n.r.estado === 'contraoferta') { b.pctT = b.pctT || {}; b.pctT[id] = n.r.pctMin; }
    cr.rol = null; ajustar(b); refrescar();
  });
  // ---------- Título, sinopsis y pasos ----------
  ac('crTitulo', function (v) { if (cr.b) cr.b.tit = v.slice(0, 48); });
  ac('crOtroTitulo', function () { if (!cr.b) return; cr.b.tit = conAzarUI(function () { return O.tituloNuevo(cr.b.gen); }); refrescar(); });
  ac('crSinTexto', function (v) { if (cr.b) { cr.b.sin = v.slice(0, 400); cr.b.sinEditada = 1; } });
  ac('crSinopsis', function () { if (!cr.b) return; cr.b.sinEditada = 0; cr.b.sin = I.sinopsis(cr.b); refrescar(); });
  ac('crPaso', function (v) { if (!cr.b) return; cr.paso = N.limitar(cr.paso + (+v), 0, PASOS.length - 1); cr.rol = null; cr.picker = null; refrescar(); });
  ac('crIniciar', function () {
    const b = cr.b;
    if (!b) return;
    b.tit = (b.tit || '').trim() || conAzarUI(function () { return O.tituloNuevo(b.gen); });
    if (!b.sinEditada) b.sin = I.sinopsis(b);
    delete b.contTocado; delete b.clasTocada; delete b.sinEditada;
    const r = J.iniciarObra(b);
    if (r.error) { U.aviso(r.error, 'mal'); refrescar(); return; }
    IA.arte.sonido('exito');
    cr.b = null;
    U.cerrarFicha();
    U.aviso('«' + r.obra.tit + '» empieza su desarrollo');
    U.estado.sub.obras = 'marcha';
    U.refrescar();
  });

  // =====================================================================
  // FICHA DE OBRA: la idea completa
  // =====================================================================
  function bloqueIdea(o) {
    if (!o.pj && !o.sin && !o.mat && !o.cont) return '';
    let h = '<h3>La idea</h3>';
    if (o.sin) h += '<p>' + esc(o.sin) + '</p>';
    const filas = [];
    filas.push(['Tipo', X.tipoCine(o.tipo || 'real').nombre + ' · ' + (o.nat === 'r' ? 'realidad' : 'ficción') + ' · clase ' + I.clase(o) + ' · obra ' + I.perfil(o)]);
    if (o.tem && o.tem.length) filas.push(['Temas', o.tem.join(', ')]);
    if (o.sub && o.sub.length) filas.push(['Subgéneros', o.sub.join(', ')]);
    if (o.prob && o.prob.length) filas.push(['Problemática', o.prob.join(', ')]);
    if (o.arco) filas.push(['Arco', X.arco(o.arco).nombre + ' (' + X.arco(o.arco).orig + ')' + (o.sarc && o.sarc.length ? ' · ' + o.sarc.map(function (s) { return X.subarco(s).nombre; }).join(', ') : '')]);
    if (o.epo) filas.push(['Época y lugar', X.epoca(o.epo).nombre + (o.lug ? ' · ' + (D.pais(o.lug) ? D.pais(o.lug).nombre : (X.lugaresExtra.filter(function (l) { return l.id === o.lug; })[0] || {}).nombre || '') : '')]);
    if (o.idio) filas.push(['Idioma', o.idio + (o.rod ? ' · rodada en ' + D.pais(o.rod).nombre : '')]);
    if (o.min) filas.push(['Forma', o.min + ' min · ' + X.complejidad[v(o, 'cx', 2)] + ' · ritmo ' + X.ritmo[v(o, 'rit', 2)].id.toLowerCase() + ' · efectos ' + X.efectos[v(o, 'fx', 2)].id.toLowerCase() + (o.fxr ? ' (' + o.fxr + ')' : '')]);
    if (o.corr || o.estilo) filas.push(['Estilo', (o.corr || X.ESTANDAR) + ' · ' + (o.estilo || 'General') + ' · prioridad ' + X.prioridad(o.prio).nombre.toLowerCase()]);
    if (o.cont) filas.push(['Contenido', I.describirContenido(o)]);
    if (o.pubs && o.pubs.length) filas.push(['Público', o.pubs.join(', ')]);
    if (o.mat) { const m = X.material(o.mat); if (m) filas.push(['Material', '«' + m.tit + '», ' + m.autor + (o.suave ? ' (adaptada con guiños)' : '')]); }
    if (o.guionC) filas.push(['Guion', 'Comprado, calificación ' + o.guionC]);
    if (o.ideaIA) filas.push(['Idea', 'Automática con IA']);
    if (o.ia) filas.push(['IA en producción', o.ia + ' %' + (o.iar ? ' · resultado ' + o.iar : '')]);
    if ((o.et === 'cartelera' || o.et === 'terminada') && o.frc) filas.push(['La crítica', '«' + o.frc + '»']);
    if ((o.aw || []).length && o.frp) filas.push(['Al premiarla', '«' + o.frp + '»']);
    h += '<table class="tabla">' + filas.map(function (f) { return '<tr><td class="tenue">' + esc(f[0]) + '</td><td>' + esc(f[1]) + '</td></tr>'; }).join('') + '</table>';
    if (o.pj && o.pj.length) {
      h += '<h3>Personajes</h3><div class="col">' + o.pj.map(function (p) {
        const ta = p.t !== null && p.t !== undefined ? T.porId(p.t) : null;
        return '<div class="fila entre chico"><span><b>' + esc(p.n) + '</b> · ' + p.e + ' años · ' + esc(p.a) + '</span><span class="tenue">' + esc((X.importancias.filter(function (x) { return x.id === p.i; })[0] || {}).nombre || '') + (ta ? ' · ' + esc(ta.nom) : '') + '</span></div>';
      }).join('') + '</div>';
    }
    return h;
  }
  function v(o, k, d) { return o[k] === undefined || o[k] === null ? d : o[k]; }

  // =====================================================================
  // MUNDO › TAXONOMÍA: todas las listas de todos los medios
  // =====================================================================
  function taxonomia() {
    const m = cr.taxMedio;
    let h = '<p class="nota">Todas las listas de tu documento, sin duplicados, por familias y en orden alfabético. La familia pesa en la matemática; cada elemento da el sabor.</p>';
    h += '<div class="chips">' + X.medios.map(function (x) { return chip(x.nombre + (x.activo ? '' : ' · ' + x.version), 'taxMedio', x.id, m === x.id); }).join('') + '</div>';
    const fams = m === 'cine' ? D.familias.map(function (f) { return { id: f.id, nombre: f.nombre, generos: f.generos, nucleo: f.temporada, inclina: f.inclina }; }) : X.generosMedio[m];
    let total = 0;
    fams.forEach(function (f) { total += f.generos.length; });
    h += '<h3>Géneros (' + total + ' en ' + fams.length + ' familias)</h3>' + fams.map(function (f) {
      return '<div class="tarjeta"><b>' + esc(f.nombre) + '</b> <span class="tenue chico">' + esc(m === 'cine' ? f.nucleo : f.nucleo) + ' · inclina a ' + (f.inclina === 'pub' ? 'el público' : f.inclina === 'crit' ? 'la crítica' : 'ambos') + '</span><br><span class="chico">' + esc(f.generos.slice().sort(function (x, y) { return x.localeCompare(y, 'es'); }).join(', ')) + '</span></div>';
    }).join('');
    const tabla = X.tablaEncaje(m);
    const sim = function (x) { return x === null ? '—' : x >= 3 ? '++' : x >= 1 ? '+' : x === 0 ? '0' : '−'; };
    h += '<h3>Encaje entre familias</h3><div class="desliza"><table class="tabla"><tr><th></th>' + fams.map(function (f) { return '<th>' + esc(f.id) + '</th>'; }).join('') + '</tr>' + fams.map(function (f, i) {
      return '<tr><td><b>' + esc(f.id) + '</b> <span class="tenue chico">' + esc(f.nombre) + '</span></td>' + tabla[i].map(function (x) { return '<td class="n ' + (x >= 3 ? 'bien' : x < 0 ? 'mal' : '') + '">' + sim(x) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table></div><p class="nota">++ suma 3, + suma 1, 0 es neutro, − resta 2. En el juego cada combinación muestra sus estrellas después de usarla.' + (m === 'cine' ? ' Erótico nunca va con Familia y juventud.' : ' Sale de la tabla del cine a través del eje de cada familia; el bot la ajusta cuando llegue su medio.') + '</p>';
    if (m === 'cine') {
      const cnt = X.contar();
      h += '<h3>Subgéneros (' + cnt.subgeneros + ')</h3>' + X.listaSubgeneros().map(function (g) { return '<p class="chico"><b>' + esc(g.nombre) + ':</b> ' + esc(g.items.join(', ')) + '</p>'; }).join('');
      h += '<h3>Temas (' + cnt.temas + ')</h3>' + X.familiasTema.map(function (f) { return '<p class="chico"><b>' + esc(f.nombre) + ':</b> ' + esc(f.items.map(function (x) { return X.DEPORTES_NUEVOS.indexOf(x) >= 0 ? x + '*' : x; }).join(', ')) + '</p>'; }).join('');
      h += '<h3>Problemáticas y argumentos (' + cnt.problematicas + ')</h3>' + X.familiasProblema.map(function (f) { return '<p class="chico"><b>' + esc(f.nombre) + ':</b> ' + esc(Object.keys(f.items).sort(function (x, y) { return x.localeCompare(y, 'es'); }).join(', ')) + '</p>'; }).join('');
      h += '<h3>Arcos y subarcos</h3>' + X.arcos.map(function (a) { return '<p class="chico"><b>' + esc(a.nombre) + '</b> (' + esc(a.orig) + ')</p>'; }).join('') + '<p class="chico">Subarcos: ' + esc(X.subarcos.map(function (s) { return s.nombre + ' (' + s.orig + ')'; }).join(', ')) + '</p>';
      h += '<h3>Tipos de ficción (' + cnt.ficcion + ')</h3>' + X.familiasFiccion.map(function (f) { return '<p class="chico"><b>' + esc(f.nombre) + ':</b> ' + esc(f.items.join(', ')) + '</p>'; }).join('');
      h += '<h3>Corrientes del cine</h3><p class="chico">' + esc(X.ESTANDAR) + ' · ' + esc(X.corrientesCine.map(function (c) { return c.id + ' (' + c.desde + ')'; }).join(' · ')) + '</p>';
      h += '<h3>Estilos, tonos y prioridades</h3><p class="chico">Estilos: ' + esc(X.estilos.map(function (s) { return s.id; }).join(', ')) + '<br>Tonos: ' + esc(D.tonos.map(function (x) { return x.id; }).join(', ')) + '<br>Prioridades: ' + esc(X.prioridades.map(function (p) { return p.nombre; }).join(', ')) + '</p>';
      h += '<h3>Épocas, idiomas y públicos</h3><p class="chico">Épocas: ' + esc(X.epocas.map(function (e) { return e.nombre; }).join(', ')) + '<br>Idiomas: ' + esc(X.idiomas.map(function (x) { return x.id; }).join(', ')) + '<br>Públicos: ' + esc(X.publicos.map(function (p) { return p.id; }).join(', ')) + '</p>';
      h += '<h3>Arquetipos de personajes</h3><p class="chico">' + esc(X.arquetipos.map(function (a) { return a.id; }).join(', ')) + '</p>';
      h += '<h3>Dominio público (' + cnt.dominio + ' obras)</h3><p class="chico">' + esc(X.dominio.map(function (d) { return d.tit; }).join(' · ')) + '</p>';
    } else {
      h += '<h3>Tipos de obra</h3><p class="chico">' + esc(X.tiposPorMedio[m].join(', ')) + '</p>';
      h += '<h3>Corrientes</h3><p class="chico">' + esc(X.ESTANDAR) + ' · ' + esc(X.corrientesMedio[m].map(function (c) { return c[1] + (c[0] ? ' (' + c[0] + ')' : ' (desde el inicio)'); }).join(' · ')) + '</p>';
      h += '<p class="nota">Subgéneros, temas, problemáticas, arcos y tipos de ficción son los mismos para todos los medios.</p>';
    }
    return h;
  }
  ac('taxMedio', function (v) { cr.taxMedio = v; U.refrescar(); });

  // =====================================================================
  // V19 · PRODUCCIÓN EN LA FICHA DE LA OBRA Y DECISIONES
  // =====================================================================
  const NOMBRE_ETAPA_CORTO = { preproduccion: 'Preproducción', rodaje: 'Rodaje', posproduccion: 'Posproducción' };
  function barraNota(v) { return '<span class="mini" style="width:70px"><i style="width:' + Math.round(N.limitar(v / 100, 0, 1) * 100) + '%"></i></span>'; }
  function bloqueProduccion(o) {
    const Rr = IA.rodaje;
    if (!o.eq && !o.notas && !o.lp) return '';
    let h = '<h3>Producción</h3>';
    const partes = [];
    if (o.met) partes.push(Rr.metodo(o.met).nombre);
    if (o.met && Rr.usaLocacion(o) && o.ter) partes.push('terreno: ' + Rr.terreno(o.ter).nombre.toLowerCase());
    if (o.pst) partes.push('estilo: ' + Rr.estilo(o.pst).nombre.toLowerCase());
    if (o.rod) partes.push('rodada en ' + D.pais(o.rod).nombre);
    if (o.setR) partes.push('set reutilizado');
    if (o.ext) Object.keys(o.ext).forEach(function (r) { const e = Rr.externo(r, o.ext[r]); if (e) partes.push(e.nombre.toLowerCase()); });
    if (partes.length) h += '<p>' + esc(partes.join(' · ')) + '</p>';
    if (o.est === 0 && o.dil) { const x = Rr.dilemaDe(o); h += '<button class="btn primario bloque" data-a="verDecision" data-v="' + o.id + '">Decidir: ' + esc(x ? x.txt : 'un dilema del rodaje') + '</button>'; }
    else if (o.est === 0 && o.prueba && !o.prueba.ok) h += '<button class="btn primario bloque" data-a="verDecision" data-v="' + o.id + '">Ver la prueba de público (' + o.prueba.p + ' de 100)</button>';
    // Notas por departamento: las finales al terminar; mientras tanto, las esperadas
    const ns = o.notas ? Object.keys(o.notas).map(function (k) { return { nombre: Rr.nombreDep(k), v: o.notas[k], letra: Rr.letra(o.notas[k]) }; }).sort(function (a, b) { return b.v - a.v; }) :
      (o.eq && o.est === 0 && o.et !== 'terminada' && o.et !== 'cartelera' ? Rr.notas(o) : []);
    if (ns.length) h += '<h4>' + (o.notas ? 'Notas por departamento' : 'Notas esperadas por departamento') + '</h4><div class="col">' + ns.map(function (n) { return '<div class="fila entre chico"><span>' + esc(n.nombre) + '</span><span>' + barraNota(n.v) + ' <b style="display:inline-block;min-width:2.2em;text-align:right">' + n.letra + '</b></span></div>'; }).join('') + '</div>';
    const l = Rr.linea(o);
    if (l) {
      const dif = l.plan ? l.real / l.plan - 1 : 0;
      const enMarcha = ['desarrollo', 'preproduccion', 'rodaje', 'posproduccion'].indexOf(o.et) >= 0;
      h += '<h4>Línea de producción</h4><p>' + (enMarcha ? 'Gastado hasta hoy <b>' + dinero(l.real) + '</b> de <b>' + dinero(l.plan) + '</b> acordados (' + Math.round(l.real / Math.max(1, l.plan) * 100) + ' %)' :
        'Presupuesto acordado <b>' + dinero(l.plan) + '</b> · costo real <b class="' + (dif > 0.05 ? 'mal' : dif < -0.02 ? 'bien' : '') + '">' + dinero(l.real) + '</b> (' + (dif >= 0 ? '+' : '') + Math.round(dif * 100) + ' %)') + '</p>';
      h += '<div class="col">' + l.filas.map(function (f) {
        return '<div class="fila entre chico"><span>' + NOMBRE_ETAPA_CORTO[f.et] + '</span><span>plan ' + dinero(f.plan) + ' · real ' + dinero(f.real) + ' · ' + f.sem0 + (f.sem !== f.sem0 ? ' → ' + f.sem : '') + ' sem.</span></div>';
      }).join('') + (l.extra ? '<div class="fila entre chico"><span>Imprevistos y decisiones</span><span>' + dinero(l.extra) + '</span></div>' : '') + '</div>';
      if (l.ev.length) h += '<h4>Lo que pasó en la producción</h4><ul>' + l.ev.slice().reverse().map(function (e) { return '<li>' + esc(e.txt) + (e.c ? ' <span class="tenue">(' + dinero(e.c) + ')</span>' : '') + '</li>'; }).join('') + '</ul>';
    }
    if (o.prueba) {
      const op = o.prueba.ok ? IA.rodaje.OPCIONES_PRUEBA.filter(function (x) { return x.id === o.prueba.ok; })[0] : null;
      h += '<p>Prueba de público: <b>' + o.prueba.p + ' de 100</b>. ' + esc(o.prueba.com.join(' ')) + (op ? ' Decisión: ' + esc(op.t.toLowerCase()) + (o.prueba.dp ? ' (' + (o.prueba.dp > 0 ? '+' : '') + o.prueba.dp + ' al público)' : '') + '.' : '') + '</p>';
    }
    return h;
  }
  // Ventana de decisión: un dilema del rodaje o la prueba de público
  function modalDecision(o) {
    const Rr = IA.rodaje;
    if (o.dil) {
      const x = Rr.dilemaDe(o);
      if (!x) return;
      U.modal('<h2>«' + esc(o.tit) + '»</h2><p><b>' + esc(x.txt) + '</b></p><p class="nota">' + esc(O.NOMBRE_ETAPA[o.et]) + '. Si no decides en 2 semanas, el equipo hará lo más prudente.</p><div class="col">' +
        x.ops.map(function (op) { return '<button class="btn bloque decision" data-a="rdDilema" data-v="' + o.id + '|' + op.i + '"><b>' + esc(op.t) + '</b><span class="tenue chico">' + esc(efectoTxt(op.op, o)) + '</span></button>'; }).join('') + '</div>');
      return;
    }
    if (o.prueba && !o.prueba.ok) {
      U.modal('<h2>Prueba de público</h2><p>«' + esc(o.tit) + '»: <b>' + o.prueba.p + ' de 100</b></p><p>' + esc(o.prueba.com.join(' ')) + '</p><p class="nota">El puntaje anticipa (con algo de azar) lo que dirá el público. Si no decides en 3 semanas, se estrena así.</p><div class="col">' +
        Rr.opcionesPrueba(o).map(function (op) { return '<button class="btn bloque decision"' + (op.no ? ' disabled' : '') + ' data-a="rdPrueba" data-v="' + o.id + '|' + op.id + '"><b>' + esc(op.t) + '</b><span class="tenue chico">' + esc(op.no || op.texto + (op.costo > 0 ? ' Cuesta ' + dinero(o.pp * op.costo) + '.' : '')) + '</span></button>'; }).join('') + '</div>');
    }
  }
  function efectoTxt(op, o) {
    const p = [];
    const sem = function (n) { return Math.max(1, Math.round(n * IA.rodaje.escalaSemanas())); };
    if (op.costo) p.push('cuesta ' + dinero(o.pp * op.costo));
    if (op.sem) p.push((op.sem > 0 ? '+' : '−') + sem(Math.abs(op.sem)) + ' semana' + (sem(Math.abs(op.sem)) > 1 ? 's' : ''));
    if (op.q) p.push((op.q > 0 ? 'mejor' : 'peor') + ' calidad');
    if (op.pub) p.push((op.pub > 0 ? '+' : '') + op.pub + ' al público');
    if (op.crit) p.push((op.crit > 0 ? '+' : '') + op.crit + ' a la crítica');
    if (op.des) p.push('más expectativa');
    if (op.azar !== undefined) p.push('puede salir bien o mal');
    if (op.mo) p.push('cambia la moral');
    if (op.rel) p.push(op.rel[2] > 0 ? 'acerca a dos personas' : 'crea roces');
    return p.length ? p.join(' · ') : 'sin efectos';
  }
  function abrirDecision(id) { const o = O.porId(+id); if (o) modalDecision(o); }
  ac('verDecision', function (v) { if (U.fichaAbierta()) U.cerrarFicha(); abrirDecision(v); });
  ac('rdDilema', function (v) {
    const p = v.split('|');
    const err = J.decidirDilema(+p[0], +p[1]);
    U.cerrarModal();
    if (err) { U.aviso(err, 'mal'); return; }
    const o = O.porId(+p[0]);
    const ev = o && o.lp && o.lp.ev.length ? o.lp.ev[o.lp.ev.length - 1].txt : 'Decidido';
    U.aviso(ev.split(' → ').pop());
    U.renderBarra(); U.refrescar();
    siguienteDecision();
  });
  ac('rdPrueba', function (v) {
    const p = v.split('|');
    const err = J.decidirPrueba(+p[0], p[1]);
    U.cerrarModal();
    if (err) { U.aviso(err, 'mal'); return; }
    IA.arte.sonido('dinero');
    U.renderBarra(); U.refrescar();
    siguienteDecision();
  });
  // Si quedan más decisiones pendientes, se abre la siguiente
  function siguienteDecision() { const o = J.decisionesPendientes()[0]; if (o) setTimeout(function () { modalDecision(o); }, 50); }

  return { fichaCrear: fichaCrear, bloqueIdea: bloqueIdea, taxonomia: taxonomia, conAzarUI: conAzarUI, estado: cr, crearCon: crearCon,
    bloqueProduccion: bloqueProduccion, abrirDecision: abrirDecision, siguienteDecision: siguienteDecision };
})();
