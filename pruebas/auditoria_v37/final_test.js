const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 1400 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.argv[2] + '?dev'); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const out = {};
    ART.juego.nuevaPartida({ semilla: 'nd', anio: 2010, nombre: 'ND', avatar: { nombre: 'Yo' } });
    const U = ART.ui, A = U.acciones; U.render(); U.cerrarModal();
    out.guia = /Guía de la partida/.test(document.getElementById('vista').innerText);
    A.crearObra('cine'); A.crCamino('nueva'); A.crTab('12');
    out.ndSelect = !!document.querySelector('[data-c="crNd"]');
    const b0 = A.crNd ? 1 : 0; const c0 = (ART.n.S, null);
    A.crNd('ironica'); A.crTab('12'); out.ndCtx = /Una canción alegre suena/.test(document.getElementById('ficha').innerText);
    const antes = ART.n.S.obras.length; A.crIniciar(); const o = ART.n.S.obras[ART.n.S.obras.length - 1]; out.cineNd = ART.n.S.obras.length > antes ? o.nd : 'no';
    U.cerrarModal(); U.cerrarFicha();
    for (const med of ['musica', 'juegos', 'teatro', 'libros']) {
      A.crearObra(med); A.crCamino('nueva'); A.mdTab('produccion');
      const s = document.querySelector('[data-c="mdHist"][data-v="nd"]');
      if (s) { s.value = 'creditos'; s.dispatchEvent(new Event('change', { bubbles: true })); }
      const ctx = document.getElementById('ficha').innerText.match(/(créditos|reverencia|lista de canciones|Pista oculta)[^\n]{0,60}/);
      const n0 = ART.medios.proyectos(med).length; try { A.mdIniciar(); } catch (e) { out[med + 'err'] = e.message; }
      const pr = ART.medios.proyectos(med); out[med] = [!!s, ctx && ctx[0], pr.length > n0 ? pr[pr.length - 1].nd : 'no'];
      U.cerrarModal(); U.cerrarFicha();
    }
    // Editor precios
    ART.metas.activarSandbox(); const t0 = ART.talentos.tarifa(ART.n.S.talentos[5]); ART.metas.editar('precio', 'tarifa', 'x', 2); out.tarifa = Math.round(ART.talentos.tarifa(ART.n.S.talentos[5]) / t0 * 100) / 100;
    ART.metas.editar('precio', 'tarifa', 'x', 1);
    // Partida: nombre y guardado/borrado
    ART.n.S.partida = 'Mi partida'; await ART.guardado.guardar('m2'); out.meta = (await ART.guardado.listar())[1].meta.nombre;
    await ART.guardado.borrar('m2'); out.borrada = !(await ART.guardado.listar())[1].meta;
    A.abrirGuardado(); await new Promise(r => setTimeout(r, 200)); 
    // Confirmación
    A.guardarEn('m3', { getAttribute: () => null }); out.confirma = /¿Seguro\?/.test(document.getElementById('modal').innerText); U.cerrarModal();
    A.verPrivacidad(); out.priv = /Política de privacidad/.test(document.getElementById('modal').innerText); U.cerrarModal();
    for (let i = 0; i < 104; i++) { ART.pruebas.decidir(ART.pruebas.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
    U.irA('estudio', 'estadisticas'); out.stats = document.getElementById('vista').innerText.match(/Lanzamientos\s*\n?\s*(\d+)/);
    out.stats = out.stats && out.stats[1];
    return out;
  });
  const v = await p.evaluate(() => ART.verificador.correr({ anios: [1700, 1925, 1995, 2200], vistas: 100, clics: 300, semanas: 104 }).errores);
  console.log(JSON.stringify(r), 'verif', JSON.stringify(v), 'errs', JSON.stringify(errs));
  await b.close();
})();
