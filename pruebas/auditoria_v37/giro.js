const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 1400 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    ART.juego.nuevaPartida({ semilla: 'giro', anio: 2010, nombre: 'Giro', avatar: { nombre: 'Yo' } });
    const U = ART.ui, A = U.acciones, out = { n: ART.ideas.GIROS.length };
    U.render(); U.cerrarModal();
    A.crearObra('cine'); A.crCamino('nueva'); A.crTab('2');
    const sel = document.querySelector('[data-c="crGiro"]'); out.cineSelect = !!sel;
    const q0 = ART.ideas.bonoGiro({ giro: 'Todo era un sueño', fam: 'IM' }), q1 = ART.ideas.bonoGiro({ giro: 'El héroe pierde y el mal gana', fam: 'FJ' });
    out.bonos = [q0, q1];
    A.crGiro('El aliado era el traidor'); A.crTab('12'); out.cineResumen = /giro argumental/i.test(document.getElementById('ficha').innerText + document.getElementById('modal').innerText);
    const antes = ART.n.S.obras.length; A.crIniciar(); const o = ART.n.S.obras[ART.n.S.obras.length - 1];
    out.cineGuardado = ART.n.S.obras.length > antes ? o.giro : 'no empezó';
    U.cerrarModal(); U.cerrarFicha();
    for (const med of ['musica', 'juegos', 'teatro', 'libros']) {
      A.crearObra(med); A.crCamino('nueva'); A.mdTab('historia');
      const s = document.querySelector('[data-c="mdHist"][data-v="giro"]');
      if (s) { s.value = 'Final circular: vuelve al comienzo'; s.dispatchEvent(new Event('change', { bubbles: true })); }
      out[med] = { select: !!s }; const n0 = ART.medios.proyectos(med).length; try { A.mdIniciar(); } catch (e) { out[med].err = e.message; } const pr = ART.medios.proyectos(med); out[med].guardado = pr.length > n0 ? pr[pr.length - 1].giro : 'no empezó';
      U.cerrarModal(); U.cerrarFicha();
    }
    for (let i = 0; i < 60; i++) ART.juego.avanzarSemana();
    return out;
  });
  const v = await p.evaluate(() => ART.verificador.correr({ anios: [1925, 2040], vistas: 80, clics: 200, semanas: 52 }).errores);
  console.log(JSON.stringify(r), 'verif', JSON.stringify(v), 'errs', JSON.stringify(errs));
  await b.close();
})();
