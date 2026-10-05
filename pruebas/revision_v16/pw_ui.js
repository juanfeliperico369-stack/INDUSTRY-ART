const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]');
  await page.click('[data-a="empezar"]');
  await page.click('#modal [data-a="cerrarModal"]');
  // 1) Menú de ritmo: abrir y volver a tocar la flecha para cerrarlo
  await page.click('[data-a="menuRitmo"]');
  const abierto1 = await page.$$eval('.menu-ritmo', l => l.length);
  await page.click('[data-a="menuRitmo"]');
  const abierto2 = await page.$$eval('.menu-ritmo', l => l.length);
  console.log('menu ritmo: tras 1er toque', abierto1, 'tras 2o toque (deberia ser 0)', abierto2);
  await page.click('#vista', { position: { x: 10, y: 400 } });
  // 2) Enter sobre un botón enfocado (Crear obra) avanza el tiempo en vez de abrir la ficha
  await page.evaluate(() => IA.ui.irA('obras'));
  const t0 = await page.evaluate(() => IA.n.S.t);
  await page.focus('#vista [data-a="crearObra"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const r2 = await page.evaluate(() => ({ t: IA.n.S.t, ficha: IA.ui.fichaAbierta() }));
  console.log('Enter en "Crear obra": t', t0, '->', r2.t, 'ficha abierta', r2.ficha);
  console.log(errores.join('\n'));
  await browser.close();
})();
