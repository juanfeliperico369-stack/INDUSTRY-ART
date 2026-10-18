/* ==== módulo: talento_nuevo ==== */
// Crear y editar talentos propios: nombre (con dado), sexo, edad, oficio y otro oficio, país, potencial, rasgo,
// familia de géneros en la que brilla y en la que no, aspecto con su retrato en vivo y una biografía corta.
// En una partida normal el talento firma un contrato exclusivo de tres años (lo paga tu estudio cada mes); con el
// Editor Sandbox es gratis y el potencial llega hasta 99. Tus talentos se pueden editar después (nombre, aspecto y
// biografía; con el Sandbox, también sus números).
ART.talentoNuevo = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, T = ART.talentos, U = ART.ui, t = ART.t, esc = N.esc, ac = U.accion;
  const dinero = U.dinero, icono = U.icono;
  let f = null; // el formulario abierto
  let dadoN = 1;
  function sandbox() { return !!(N.S && N.S.sandbox); }
  function pais() { return D.pais(f.pais) || D.pais('us'); }
  function aspecto() {
    if (!f.asp) f.asp = ART.arte.aspectoNuevo(N.hash('tal|' + f.nom + '|' + f.sx + '|' + dadoN), pais().region);
    if (f.sx === 'F') f.asp.barba = 0;
    return f.asp;
  }
  function vistaPrevia() {
    U.estado.talentoNuevo = { id: -7, nombre: f.nom, sexo: f.sx, edad: +f.edad || 25, oficio: f.of, aspecto: aspecto(), anio: N.anio() };
  }
  function ops(lista, actual) { return lista.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(actual) ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); }
  function campo(nombre, html, extra) { return '<label class="campo' + (extra ? ' ' + extra : '') + '"><span>' + nombre + '</span>' + html + '</label>'; }
  // Lo que costaría el contrato exclusivo de tres años (con un talento de prueba que no entra al mundo)
  function costoContrato() {
    if (sandbox() || f.editar) return 0;
    const tarifa = ART.economia.tarifa({ hab: f.hist && f.histYa ? 88 : Math.round(f.pot * 0.8), fama: f.hist && f.histYa ? 0.55 : 0.02, of: f.of, nac: N.anio() - (+f.edad || 25), rasgo: f.rasgo, reg: pais().region, pais: f.pais }, N.anio());
    return Math.round(tarifa * 1.8);
  }
  function formulario() {
    vistaPrevia();
    const fams = [['', 'Ninguna en especial']].concat(D.familias.map(function (x) { return [x.id, x.nombre]; }));
    const ofs = D.oficios.map(function (o) { return [o.id, o.nombre]; });
    const tope = sandbox() || f.hist ? 99 : 80, sal = costoContrato();
    let h = '<div class="fila entre"><h2>' + (f.editar ? 'Editar talento' : 'Crear talento') + '</h2><button class="ico" data-a="cerrarModal" aria-label="' + t('cerrar') + '">' + icono('cerrar') + '</button></div>';
    h += '<p class="nota info">' + (f.editar ? 'Cambia su nombre, su aspecto y su biografía' + (sandbox() ? ', y con el Editor Sandbox también sus números.' : '.') :
      sandbox() ? 'Con el Editor Sandbox el talento es gratis y su potencial puede llegar a 99.' : 'Tu talento entra al mundo con un contrato exclusivo de tres años con tu estudio. Empieza modesto y crece con el trabajo, como todos.') + '</p>';
    if (!f.editar) {
      const L = ART.hitosArte.personasEn(N.anio());
      if (L.length) h += campo('¿Es tu talento un personaje de hito histórico?', '<select data-c="tnHist"><option value="">— no —</option>' + L.map(function (x) {
        const ya = T.porId && N.S.talentos.some(function (y) { return y.hist === x.k && !y.mu; });
        return '<option value="' + esc(x.k) + '"' + (f.hist === x.k ? ' selected' : '') + (ya ? ' disabled' : '') + '>' + esc(x.p[0]) + ' · ' + esc(D.oficio(x.p[1]).nombre.toLowerCase()) + ' · ' + (N.anio() - x.p[4]) + ' años' + (ya ? ' (ya está en tu partida)' : x.ya ? '' : ' · su gran momento llega en ' + x.h[0]) + '</option>';
      }).join('') + '</select>') + (f.hist ? '<p class="nota info">' + esc(ART.hitosArte.texto(f.histH)) + '</p>' : '');
    }
    h += '<div class="fila" style="align-items:flex-start;flex-wrap:nowrap" id="tnVista"><canvas class="retrato grande" data-retrato="tnuevo"></canvas><div class="col crece">' +
      '<div class="fila" style="flex-wrap:nowrap">' + campo('Nombre', '<input type="text" maxlength="40" data-c="tnCampo" data-k="nom" value="' + esc(f.nom) + '">', 'crece') + '<button class="ico" data-a="tnNombreDado" aria-label="Otro nombre" style="margin-top:12px">' + icono('dado') + '</button></div>' +
      '<div class="fila" style="flex-wrap:nowrap">' + campo(t('np_sexo'), '<select data-c="tnCampo" data-k="sx">' + ops([['F', t('mujer')], ['M', t('hombre')]], f.sx) + '</select>', 'crece') +
      campo(t('np_edad'), '<input type="number" min="8" max="80" data-c="tnCampo" data-k="edad" value="' + esc(f.edad) + '"' + (f.editar ? ' disabled' : '') + '>', 'crece') + '</div></div></div>';
    if (!f.editar || sandbox()) {
      h += '<div class="rejilla-ed">' +
        campo('Oficio', '<select data-c="tnCampo" data-k="of"' + (f.editar ? ' disabled' : '') + '>' + ops(ofs, f.of) + '</select>') +
        campo('Otro oficio', '<select data-c="tnCampo" data-k="of2"' + (f.editar ? ' disabled' : '') + '>' + ops([['', 'Ninguno']].concat(ofs.filter(function (x) { return x[0] !== f.of; })), f.of2) + '</select>') +
        campo('País', '<select data-c="tnCampo" data-k="pais"' + (f.editar ? ' disabled' : '') + '>' + ops(D.paises.map(function (p) { return [p.id, p.nombre]; }).sort(function (a, b) { return a[1].localeCompare(b[1], 'es'); }), f.pais) + '</select>') +
        campo('Rasgo', '<select data-c="tnCampo" data-k="rasgo">' + ops([['', 'Sin rasgo']].concat(Object.keys(D.rasgos).sort().map(function (r) { return [r, r]; })), f.rasgo) + '</select>') +
        campo('Brilla en', '<select data-c="tnCampo" data-k="fuerte"' + (f.editar ? ' disabled' : '') + '>' + ops(fams, f.fuerte) + '</select>') +
        campo('Le cuesta', '<select data-c="tnCampo" data-k="debil"' + (f.editar ? ' disabled' : '') + '>' + ops(fams, f.debil) + '</select>') + '</div>';
      h += campo('Potencial: <b id="tnPot">' + f.pot + '</b> / ' + tope, '<input type="range" min="30" max="' + tope + '" step="1" value="' + f.pot + '" data-i="tnPot" data-c="tnCampo" data-k="pot">', 'rango');
      const r = D.rasgos[f.rasgo];
      if (r) h += '<p class="nota">' + esc(f.rasgo) + ': calidad ' + (r[0] > 0 ? '+' : '') + r[0] + ', sobrecosto ' + (r[1] > 0 ? '+' : '') + Math.round(r[1] * 100) + ' %, tarifa ×' + U.decimal(r[2], 2) + '.</p>';
    }
    h += '<h3>Aspecto</h3><div class="rejilla-ed">' + ART.arte.OPCIONES_ASPECTO.filter(function (x) { return !x[3] || x[3] === f.sx; }).map(function (x) {
      const a = aspecto();
      return campo(x[1], '<select data-c="tnAsp" data-k="' + x[0] + '">' + ops(x[2].map(function (n, i) { return [i, n]; }), +a[x[0]] || 0) + '</select>');
    }).join('') + '</div><button class="btn" data-a="tnAspDado">' + icono('dado') + ' Otro aspecto</button>';
    h += campo('Biografía (opcional)', '<textarea rows="3" maxlength="280" data-c="tnCampo" data-k="bio" placeholder="Creció entre bambalinas, sueña con dirigir su propia compañía…">' + esc(f.bio || '') + '</textarea>');
    if (sal) h += '<div class="tarjeta" style="margin-top:8px"><div class="fila entre"><span>Contrato exclusivo · 3 años</span><b class="cifra">' + dinero(sal) + ' / año</b></div><span class="tenue chico">Se paga mes a mes desde tu caja.</span></div>';
    h += '<div class="fila entre" style="margin-top:10px"><button class="btn" data-a="cerrarModal">' + t('cancelar') + '</button><button class="btn primario" data-a="tnListo">' + icono(f.editar ? 'guardar' : 'persona') + ' ' + (f.editar ? 'Guardar cambios' : 'Crear talento') + '</button></div>';
    return h;
  }
  function redibujar() {
    const caja = document.querySelector('#modal .caja'), y = caja ? caja.scrollTop : 0;
    U.modal(formulario());
    const c2 = document.querySelector('#modal .caja'); if (c2) c2.scrollTop = y;
  }
  // Abre el formulario: vacío para crear o con un talento tuyo para editar
  function abrir(id) {
    const S = N.S;
    if (!S) return;
    const ta = id !== undefined && id !== null ? T.porId(+id) : null;
    if (ta) {
      f = { editar: ta.id, nom: ta.nom, sx: ta.sx, edad: N.anio() - ta.nac, of: ta.of, of2: ta.h2 ? Object.keys(ta.h2)[0] : '', pais: ta.pais, pot: ta.pot, rasgo: ta.rasgo || '', fuerte: '', debil: '', bio: ta.bioP || '',
        asp: Object.assign({}, U.comoRetrato(ta).aspecto) };
    } else {
      const est = S.estudios[0], p = D.pais(est.pais) || D.pais('us');
      f = { nom: '', nomAuto: 1, sx: 'F', edad: 22, of: 'interprete', of2: '', pais: p.id, pot: sandbox() ? 75 : 62, rasgo: '', fuerte: '', debil: '', bio: '', asp: null };
      f.nom = conAzar(function () { return T.nombreNuevo(p.region, f.sx); });
    }
    U.modal(formulario());
  }
  // Mirar o rellenar el formulario no gasta el azar del mundo
  function conAzar(fn) {
    const S = N.S, real = S.rng;
    S.rng = N.estadoNuevo(S.semilla + '|talento|' + (dadoN++));
    try { return fn(); } finally { S.rng = real; }
  }
  ac('crearTalentoForm', function () { abrir(); });
  ac('tnEditar', function (v) { abrir(v); });
  ac('tnCampo', function (v, el) {
    const k = el.getAttribute('data-k');
    if (k === 'pot' || k === 'edad') f[k] = Math.round(+v || 0);
    else f[k] = v;
    if (k === 'edad') f.edad = N.limitar(f.edad, 8, 80);
    if (k === 'nom') f.nomAuto = 0; // el nombre escrito a mano no se cambia solo
    if ((k === 'sx' || k === 'pais') && !f.editar && f.nomAuto) f.nom = conAzar(function () { return T.nombreNuevo(pais().region, f.sx); });
    if (k === 'pais' && !f.editar) f.asp = null; // un aspecto típico de la región, que se puede cambiar
    if (k === 'sx' && f.sx === 'F' && f.asp) f.asp.barba = 0;
    if (['sx', 'of', 'pais', 'rasgo', 'pot', 'edad'].indexOf(k) >= 0) redibujar();
    else if (k === 'nom') { vistaPrevia(); U.dibujar(document.getElementById('tnVista')); }
  });
  ac('tnHist', function (v) {
    if (!v) { f.hist = null; f.histH = null; redibujar(); return; }
    const x = ART.hitosArte.personasEn(N.anio()).filter(function (y) { return y.k === v; })[0];
    if (!x) return;
    const p = x.p, pa = D.paises.filter(function (y) { return y.nombre === p[3]; })[0];
    Object.assign(f, { hist: v, histH: x.h, histYa: x.ya, nom: p[0], nomAuto: 0, sx: p[2], edad: N.limitar(N.anio() - p[4], 8, 80), of: p[1], pais: pa ? pa.id : f.pais, pot: 95, asp: null });
    U.aviso(x.ya ? 'Personaje histórico cargado' : 'Promesa descubierta: llegará lejos');
    redibujar();
  });
  ac('tnPot', function (v) { const b = document.getElementById('tnPot'); if (b) b.textContent = v; });
  ac('tnNombreDado', function () { f.nom = conAzar(function () { return T.nombreNuevo(pais().region, f.sx); }); f.nomAuto = 1; redibujar(); });
  ac('tnAsp', function (v, el) {
    const k = el.getAttribute('data-k'), a = aspecto();
    a[k] = ['gafas', 'aretes', 'pecas'].indexOf(k) >= 0 ? +v === 1 : +v;
    vistaPrevia(); U.dibujar(document.getElementById('tnVista'));
  });
  ac('tnAspDado', function () { dadoN = (dadoN * 41 + 5) % 9973; f.asp = ART.arte.aspectoNuevo(dadoN, pais().region); redibujar(); });
  ac('tnListo', function () {
    const S = N.S;
    const nom = String(f.nom || '').trim();
    if (!nom) { U.aviso('Ponle un nombre.', 'mal'); return; }
    const asp = ART.juego.aspectoValido(Object.assign({}, aspecto()));
    if (f.editar) {
      const ta = T.porId(f.editar);
      if (!ta) return;
      ta.nom = nom.slice(0, 40); ta.asp = asp; ta.bioP = String(f.bio || '').slice(0, 280);
      if (f.rasgo !== undefined && sandbox()) ta.rasgo = f.rasgo;
      if (sandbox()) ta.pot = N.limitar(f.pot, 1, 99);
      U.cerrarModal(); U.aviso('Talento actualizado'); U.refrescar();
      return;
    }
    const sal = costoContrato();
    if (sal && ART.negocio.cajaLibre(0) < sal / 4) { U.aviso('Tu caja libre no alcanza para el contrato.', 'mal'); return; }
    const hist = f.hist ? { hist: f.hist, hab: f.histYa ? 88 : N.limitar(Math.round(30 + (f.edad - 6) * 1.5), 30, 72), fama: f.histYa ? 0.55 : 0.05 } : {};
    const ta = T.crearPropio(Object.assign({ nom: nom, sx: f.sx, edad: f.edad, of: f.of, of2: f.of2, pais: f.pais, pot: f.pot, rasgo: f.rasgo, fuerte: f.fuerte, debil: f.debil, asp: asp, bio: f.bio, sinTope: sandbox() || !!f.hist }, hist));
    if (sandbox()) ta.sb = 1;
    else T.firmarExclusivo(ta, 0, 3);
    ta.desc = 1; // lo conoces: su potencial real está a la vista
    U.cerrarModal();
    ART.arte.sonido('exito');
    U.aviso('Nace ' + ta.nom + (sandbox() ? '' : ': firma con tu estudio por tres años'));
    U.acciones.verTalento(String(ta.id));
  });
  return { abrir: abrir };
})();
