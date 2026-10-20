const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const SH = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 1400 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  p.on('dialog', d => { errs.push('dialog: ' + d.message()); d.accept(); });
  await p.goto('file://' + path.join(UP, 'v37.html'));
  await p.waitForTimeout(800);
  const r1 = await p.evaluate(async () => {
    ART.juego.nuevaPartida({ semilla: 'save', anio: 1990, nombre: 'Guardado', avatar: { nombre: 'Yo' } });
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 60; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
    const g = await ART.guardado.guardar('m1'); const a = await ART.guardado.autoguardar();
    return { g, a, t: ART.n.S.t };
  });
  console.log('save', JSON.stringify(r1));
  await p.reload(); await p.waitForTimeout(1200);
  console.log('MENU:', (await p.evaluate(() => document.body.innerText)).replace(/\n+/g, ' | '));
  await p.screenshot({ path: SH + '/v37_menu_con_partidas.png' });
  const cargar = await p.$('text=Cargar partida'); if (cargar) { await cargar.click(); await p.waitForTimeout(600); }
  console.log('CARGAR:', (await p.evaluate(() => document.body.innerText)).replace(/\n+/g, ' | ').slice(0, 2500));
  await p.screenshot({ path: SH + '/v37_cargar.png' });
  console.log(JSON.stringify(errs));
  await b.close();
})();
