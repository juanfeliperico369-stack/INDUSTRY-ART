/* ==== módulo: taller ==== */
// Taller creativo (desde la pantalla de título): crea historias con toda la fábrica de ideas sin jugar una partida.
// No gasta dinero ni pasa el tiempo. Eliges el año del mercado (sus géneros, talentos y precios), ves la predicción y
// guardas cada idea en tu biblioteca (en este aparato) para abrirla, duplicarla o descargarla en Word, web, Markdown
// o texto. Por dentro arma un mundo de prueba del año elegido, siempre con la misma semilla: así los talentos de una
// idea guardada siguen ahí al volver a abrirla.
ART.taller = (function () {
  'use strict';
  const N = ART.n, U = ART.ui, esc = N.esc, ac = U.accion, t = ART.t, icono = U.icono, dinero = U.dinero;
  const CLAVE = 'industryart.taller';
  const ANIOS = [1895, 1910, 1927, 1939, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026, 2040, 2060, 2080, 2100];
  const st = { anio: 2026 };
  function leer() { try { const d = JSON.parse(localStorage.getItem(CLAVE) || '{}'); return { ideas: Array.isArray(d.ideas) ? d.ideas : [], anio: d.anio || 2026, sig: d.sig || 1 }; } catch (e) { return { ideas: [], anio: 2026, sig: 1 }; } }
  function escribir(d) { try { localStorage.setItem(CLAVE, JSON.stringify(d)); return true; } catch (e) { return false; } }
  function activo() { return !!(N.S && N.S.taller); }
  // Un mundo de prueba del año: sin tutorial, sin autoguardado (bot) y con la caja llena para que el costo no frene la idea
  function mundo(anio) {
    if (N.S && N.S.taller && N.anio() === anio) return;
    ART.juego.nuevaPartida({ semilla: 'taller-' + anio, anio: anio, nombre: 'Taller creativo', bot: true, avatar: { nombre: 'OneZero' } });
    const S = N.S;
    S.taller = 1;
    S.estudios[0].caja = 1e15;
    U.estado.np = false;
  }
  function vista() {
    const d = leer(), a = N.anio();
    let h = '<div class="portada" style="text-align:left;max-width:760px"><div class="titulo-sec"><h2>' + icono('bombilla').replace('<svg', '<svg style="width:26px;height:26px;vertical-align:-4px"') + ' Taller creativo</h2><button class="btn" data-a="salirTaller">' + t('volver') + '</button></div>';
    h += '<p class="nota info">Crea historias con toda la fábrica de ideas: géneros, temas, arcos, personajes, época, estilo, equipo y presupuesto. Aquí nada cuesta dinero ni tiempo: ves la predicción del mercado del año que elijas y descargas el documento de cada idea.</p>';
    h += '<div class="tarjeta"><h3>Mercado de ' + a + '</h3><div class="chips">' + ANIOS.map(function (x) { return '<button class="chip' + (x === a ? ' on' : '') + '" data-a="tlAnio" data-v="' + x + '">' + x + '</button>'; }).join('') + '</div>' +
      '<p class="nota">Los géneros de moda, los talentos, los precios y la censura cambian con el año.</p>' +
      '<div class="fila" style="margin-top:8px"><button class="btn primario" data-a="tlNueva">' + icono('mas') + 'Nueva idea</button><button class="btn" data-a="tlClasico">' + icono('libro') + 'Desde un material</button><button class="btn" data-a="mtNuevo">' + icono('pincel') + 'Agregar material</button></div></div>';
    h += '<div class="tarjeta"><h3>Tu biblioteca (' + d.ideas.length + ')</h3>' + (d.ideas.length ? d.ideas.slice().reverse().map(function (x) {
      return '<div class="cal-ev"><div class="col crece"><b>' + esc(x.tit) + '</b><span class="tenue chico">' + esc((x.gen || []).join(' · ')) + ' · mercado de ' + x.anio + (x.fecha ? ' · guardada el ' + esc(x.fecha) : '') + '</span></div>' +
        '<div class="fila"><button class="btn" data-a="tlAbrir" data-v="' + x.id + '">Abrir</button><button class="btn" data-a="tlDoc" data-v="' + x.id + '" aria-label="Descargar">' + icono('bajar') + '</button><button class="btn" data-a="tlDuplicar" data-v="' + x.id + '" aria-label="Duplicar">+1</button><button class="btn peligro" data-a="tlBorrar" data-v="' + x.id + '" aria-label="Borrar">' + icono('cerrar') + '</button></div></div>';
    }).join('') : '<p class="nota">Todavía no guardas ideas. Crea una y toca «Guardar en la biblioteca» al final.</p>') + '</div>';
    return h + '<p class="creditos" style="text-align:center">' + t('creditos') + '</p></div>';
  }
  function abrir() {
    const d = leer();
    st.anio = d.anio || 2026;
    mundo(st.anio);
    U.render();
  }
  function idea(id) { return leer().ideas.filter(function (x) { return x.id === +id; })[0] || null; }
  ac('abrirTaller', abrir);
  ac('salirTaller', function () { N.S = null; U.cerrarFicha(); U.cerrarModal(); U.render(); });
  ac('tlAnio', function (v) { const d = leer(); d.anio = +v; escribir(d); mundo(+v); U.render(); });
  ac('tlNueva', function () { U.acciones.crearObra(); });
  ac('tlClasico', function () { U.acciones.crearObra(); U.acciones.crCamino('material'); });
  ac('tlGuardar', function () {
    const b = ART.creacion.borrador();
    if (!b) return;
    b.tit = (b.tit || '').trim() || ART.creacion.conAzarUI(function () { return ART.obras.tituloNuevo(b.gen); });
    const d = leer(), copia = N.copiar(b);
    const previa = b.tallerId ? d.ideas.filter(function (x) { return x.id === b.tallerId; })[0] : null;
    if (previa) { previa.b = copia; previa.tit = b.tit; previa.gen = b.gen.slice(); previa.fecha = new Date().toLocaleDateString('es'); }
    else { if (d.ideas.length >= 60) { U.aviso('La biblioteca guarda hasta 60 ideas: borra alguna.', 'mal'); return; } const id = d.sig++; copia.tallerId = id; b.tallerId = id; d.ideas.push({ id: id, tit: b.tit, gen: b.gen.slice(), anio: N.anio(), fecha: new Date().toLocaleDateString('es'), b: copia }); }
    if (!escribir(d)) { U.aviso('Este aparato no deja guardar: descarga el documento.', 'mal'); return; }
    ART.arte.sonido('exito');
    U.cerrarFicha();
    U.aviso('«' + b.tit + '» queda en tu biblioteca');
    U.render();
  });
  ac('tlAbrir', function (v) {
    const x = idea(v);
    if (!x) return;
    mundo(x.anio);
    U.render();
    const b = N.copiar(x.b);
    b.tallerId = x.id;
    ART.creacion.abrirCon(b, 0);
  });
  ac('tlDoc', function (v) { const x = idea(v); if (!x) return; mundo(x.anio); U.render(); ART.documento.elegirFormato(N.copiar(x.b)); });
  ac('tlDuplicar', function (v) {
    const d = leer(), x = d.ideas.filter(function (y) { return y.id === +v; })[0];
    if (!x) return;
    const id = d.sig++, b = N.copiar(x.b);
    b.tallerId = id; b.tit = (x.tit + ' (copia)').slice(0, 48);
    d.ideas.push({ id: id, tit: b.tit, gen: (x.gen || []).slice(), anio: x.anio, fecha: new Date().toLocaleDateString('es'), b: b });
    escribir(d); U.render();
  });
  ac('tlBorrar', function (v) { const d = leer(); d.ideas = d.ideas.filter(function (x) { return x.id !== +v; }); escribir(d); U.aviso('Idea borrada'); U.render(); });
  // Botones del modal de descarga del documento (el módulo del documento carga antes que la interfaz)
  ac('docFormato', function (v) { ART.documento.usarPendiente(v); });
  ac('docVerTexto', function () { ART.documento.usarPendiente(null); });
  return { activo: activo, vista: vista, abrir: abrir };
})();
