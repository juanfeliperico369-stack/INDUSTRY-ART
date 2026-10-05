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
  const id = await page.evaluate(() => {
    const b = IA.obras.borrador(0, { gen: ['Drama'], escala: 1 }); IA.obras.equipoRecomendado(b, 1);
    const r = IA.juego.iniciarObra(b);
    while (r.obra.et !== 'lista') IA.juego.avanzarSemana();
    IA.ui.refrescar();
    return r.obra.id;
  });
  await page.evaluate(id => IA.ui.acciones.programar(String(id)), id);
  await page.waitForTimeout(400);
  const antes = await page.evaluate(() => IA.n.S.estudios[0].caja);
  await page.dblclick('#ficha [data-a="pgConfirmar"]');
  await page.waitForTimeout(400);
  const r = await page.evaluate((id) => { const o = IA.obras.porId(id); return { caja: IA.n.S.estudios[0].caja, cm: o.cm, gasMarketing: IA.n.S.fin.anio.gas.marketing }; }, id);
  console.log('caja antes', Math.round(antes), 'despues', Math.round(r.caja), 'pagado', Math.round(antes - r.caja), 'o.cm', r.cm, 'marketing en libro', Math.round(r.gasMarketing));
  console.log(errores.join('\n'));
  await browser.close();
})();
