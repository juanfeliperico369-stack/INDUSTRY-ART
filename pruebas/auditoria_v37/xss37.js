const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2];
const PAY = '<img src=x onerror="window.__xss=(window.__xss||0)+1">"\'><svg onload="window.__xss=(window.__xss||0)+1">';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  const errs = [], dlg = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  p.on('dialog', d => { dlg.push(d.message()); d.dismiss(); });
  await p.goto('file://' + path.join(UP, 'v37.html'));
  await p.waitForTimeout(800);
  // 1) Via UI: new game wizard, type payload into every text input
  await p.click('text=Nueva partida'); await p.waitForTimeout(300);
  for (const v of ['2', '3']) {
    await p.evaluate((v) => { const el = document.querySelector('[data-a="npPaso"][data-v="' + v + '"]'); if (el) el.click(); }, v);
    await p.waitForTimeout(200);
    const ins = await p.$$('#vista input[type=text], #vista input:not([type]), #vista textarea');
    for (const i of ins) { try { await i.fill(PAY); await i.dispatchEvent('input'); await i.dispatchEvent('change'); } catch (e) {} }
  }
  await p.click('button:has-text("Empezar")'); await p.waitForTimeout(800);
  const nom = await p.evaluate(() => ({ est: ART.n.S && ART.n.S.estudios[0].nombre, av: ART.n.S && ART.n.S.avatar && ART.n.S.avatar.nom }));
  console.log('Nombres tras el asistente:', JSON.stringify(nom));
  // 2) Direct state injection (render-escaping test)
  await p.evaluate((PAY) => {
    const S = ART.n.S; ART.ui.cerrarModal();
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 60; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
    S.estudios[0].nombre = 'Est' + PAY; if (S.avatar) S.avatar.nom = 'Av' + PAY;
    S.obras.slice(0, 8).forEach(o => { o.tit = 'Obra' + PAY; if (o.sin) o.sin = 'Sin' + PAY; });
    S.talentos.slice(0, 50).forEach(t => t.nom = 'Tal' + PAY);
    S.estudios.slice(1, 4).forEach(e => e.nombre = 'Riv' + PAY);
    const FL = Array.isArray(S.franq) ? S.franq : Object.values(S.franq || {}); FL.forEach(f => { if (f && typeof f === 'object') { f.nom = 'Fr' + PAY; f.nombre = 'Fr' + PAY; } });
    ART.ui.render();
  }, PAY);
  const secs = await p.evaluate(() => { const r = []; for (const s of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) { ART.ui.irA(s); r.push([s, Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v'))]); } return r; });
  for (const [s, subs] of secs) for (const u of subs) { await p.evaluate(([s, u]) => { ART.ui.irA(s, u); }, [s, u]); await p.waitForTimeout(60); }
  // open ficha of injected obras and talents
  await p.evaluate(() => { const A = ART.ui.acciones; ART.n.S.obras.slice(0, 8).forEach(o => { try { A.verObra && A.verObra(String(o.id)); } catch (e) {} }); ART.n.S.talentos.slice(0, 10).forEach(t => { try { A.verTalento(String(t.id)); } catch (e) {} }); });
  await p.waitForTimeout(500);
  const x1 = await p.evaluate(() => window.__xss || 0);
  // 3) Run the built-in clicker on the injected state
  const r = await p.evaluate(() => { try { const r = ART.verificador.correr({ anios: [1990], vistas: 60, clics: 200, semanas: 10 }); return r.errores.slice(0, 5); } catch (e) { return ['ERR ' + e.message]; } });
  const x2 = await p.evaluate(() => window.__xss || 0);
  // 4) Import crafted save with payloads
  const imp = await p.evaluate(async (PAY) => {
    ART.n.S.estudios[0].nombre = 'Imp' + PAY; let arch = await ART.guardado.exportarTexto(); if (typeof arch !== 'string') arch = arch.texto || JSON.stringify(arch); const o = JSON.parse(arch); o.extra = {}; arch = JSON.stringify(o);
    const res = await ART.guardado.importarTexto(arch); ART.ui.render();
    return { res, nombre: ART.n.S.estudios[0].nombre };
  }, PAY);
  const x3 = await p.evaluate(() => window.__xss || 0);
  console.log(JSON.stringify({ xssTrasRecorrido: x1, xssTrasClics: x2, xssTrasImportar: x3, importado: imp, verifErr: r, dialogs: dlg, errs: errs.slice(0, 10) }, null, 1));
  await b.close();
})();
