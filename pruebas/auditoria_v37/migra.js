const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const REPO = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [ver, anio] of [['v36', 1990], ['v36', 1900], ['v20', 1950]]) {
    const p = await b.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.join(REPO, 'INDUSTRY_ART_' + ver + '.html')); await p.waitForTimeout(800);
    const txt = await p.evaluate(async (anio) => {
      IA.juego.nuevaPartida({ semilla: 'mig' + anio, anio: anio, nombre: "Estudio O'Brien & <Co>", bot: false, avatar: { nombre: 'Yo' } });
      const P = IA.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 156; i++) { P.decidir(est); IA.juego.avanzarSemana(); }
      return await IA.guardado.exportarTexto();
    }, anio);
    await p.close();
    const q = await b.newPage(); const e2 = []; q.on('pageerror', e => e2.push(e.message)); q.on('console', m => { if (m.type() === 'error') e2.push(m.text()); });
    await q.goto('file://' + path.join(UP, 'v37.html')); await q.waitForTimeout(800);
    const r = await q.evaluate(async (txt) => {
      const r = await ART.guardado.importarTexto(txt);
      if (!r.ok) return r;
      const S = ART.n.S; let err = [];
      try { ART.ui.render(); for (const s of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) { ART.ui.irA(s); Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v')).forEach(u => { try { ART.ui.irA(s, u); const t = document.getElementById('vista').innerText; const m = t.match(ART.verificador.MALO); if (m) err.push(s + '/' + u + ': ' + t.slice(Math.max(0, m.index - 40), m.index + 20)); } catch (e) { err.push(s + '/' + u + ' EXC ' + e.message); } }); } } catch (e) { err.push('render ' + e.message); }
      try { for (let i = 0; i < 104; i++) { ART.pruebas.decidir(ART.pruebas.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); } } catch (e) { err.push('sim ' + e.message); }
      return { ok: true, v: S.v, anio: ART.n.anio(), nombre: S.estudios[0].nombre, obras: S.obras.length, err: err.slice(0, 10) };
    }, txt);
    out[ver + '-' + anio] = { r, errV36: errs, errV37: e2.slice(0, 5) };
    console.log(ver, anio, JSON.stringify(out[ver + '-' + anio]).slice(0, 1200));
    await q.close();
  }
  await b.close();
})();
