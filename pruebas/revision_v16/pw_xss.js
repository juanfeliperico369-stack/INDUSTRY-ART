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
  // Un .iasave manipulado: un campo que la interfaz no escapa (clase del estudio)
  const texto = await page.evaluate(async () => { IA.n.S.estudios[0].clase = '<img src=x onerror="window.__xss=1">'; const t = await IA.guardado.exportarTexto(); IA.n.S = null; IA.ui.render(); return t; });
  require('fs').writeFileSync(__dirname + '/malicioso.iasave', texto);
  await page.setInputFiles('input[data-c="importarArchivo"]', __dirname + '/malicioso.iasave');
  await page.waitForTimeout(800);
  console.log('xss ejecutado:', await page.evaluate(() => window.__xss === 1));
  // Partida en quiebra: tras cerrar el aviso, Avanzar no hace nada y no dice nada
  await page.evaluate(() => { IA.n.S.estudios[0].caja = -1e9; IA.n.S.semanasEnRojo = 25; IA.ui.refrescar(); });
  await page.click('[data-a="avanzar"]');
  await page.waitForTimeout(300);
  const q = await page.evaluate(() => ({ quiebra: !!IA.n.S.quiebra, modal: IA.ui.modalAbierto() }));
  await page.keyboard.press('Escape');
  const t1 = await page.evaluate(() => IA.n.S.t);
  await page.click('[data-a="avanzar"]');
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => ({ t: IA.n.S.t, modal: IA.ui.modalAbierto(), avisos: Array.from(document.querySelectorAll('.aviso')).map(a => a.textContent) }));
  console.log('quiebra', JSON.stringify(q), 'luego avanzar: t', t1, '->', d.t, 'modal', d.modal, 'avisos', JSON.stringify(d.avisos));
  console.log(errores.join('\n'));
  await browser.close();
})();
