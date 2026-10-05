const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]');
  await page.click('[data-a="empezar"]');
  await page.click('#modal [data-a="cerrarModal"]');
  await page.click('#vista [data-a="crearObra"]');
  let dis = true;
  for (let k = 0; k < 40 && dis; k++) {
    dis = await page.$eval('#ficha [data-a="crGen"][data-v="Erótico"]', b => b.disabled);
    if (dis) { await page.evaluate(() => IA.ui.acciones.crGenDado()); await page.waitForTimeout(5); }
  }
  const gen0 = await page.$$eval('#ficha .chip.on', l => l.map(b => b.textContent));
  await page.click('#ficha [data-a="crGen"][data-v="Erótico"]');
  const clas = await page.evaluate(() => { return 'b.clas=' + String(IA.n.S && document.querySelector('#ficha') && JSON.stringify(Object.keys({}))); });
  await page.click('#ficha [data-a="crPaso"][data-v="1"]');
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({ titulo: document.querySelector('#ficha h3') ? document.querySelector('#ficha h3').textContent : null, avisos: [...document.querySelectorAll('.aviso')].map(a => a.textContent) }));
  console.log('generos previos', JSON.stringify(gen0), 'chip Erótico deshabilitado en 1900:', dis, JSON.stringify(r));
  console.log(errores.join('\n'));
  await browser.close();
})();
