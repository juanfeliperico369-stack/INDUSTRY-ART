const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]');
  await page.click('[data-a="empezar"]');
  await page.click('#modal [data-a="cerrarModal"]');
  await page.evaluate(() => { IA.ui.ajuste('ritmo', 'auto'); IA.ui.renderBarra(); });
  await page.click('[data-a="avanzar"]');
  await page.click('#vista [data-a="crearObra"]');
  const t0 = await page.evaluate(() => IA.n.S.t);
  const caja0 = await page.$eval('#ficha .totales', e => e.textContent);
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => ({ t: IA.n.S.t, ficha: IA.ui.fichaAbierta(), auto: !!IA.ui.estado.auto }));
  const caja1 = await page.$eval('#ficha .totales', e => e.textContent);
  console.log('con la ficha "Crear obra" abierta: t', t0, '->', r.t, 'ficha', r.ficha, 'auto', r.auto, '| totales sin refrescar:', caja0 === caja1);
  await browser.close();
})();
