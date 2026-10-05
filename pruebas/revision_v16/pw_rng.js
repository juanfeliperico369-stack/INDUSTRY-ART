const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const errores = []; page.on('pageerror', e => errores.push(e.message));
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]'); await page.click('[data-a="empezar"]'); await page.click('#modal [data-a="cerrarModal"]');
  const a = await page.evaluate(() => IA.n.S.rng.join(','));
  await page.click('#vista [data-a="crearObra"]');
  await page.evaluate(() => { IA.ui.acciones.crOtroTitulo(); IA.ui.acciones.crEquipoRec(); IA.ui.cerrarFicha(); });
  const b = await page.evaluate(() => IA.n.S.rng.join(','));
  console.log('rng intacto tras abrir Crear obra / Otro título / Recomendado:', a === b, errores.join(';'));
  await browser.close();
})();
