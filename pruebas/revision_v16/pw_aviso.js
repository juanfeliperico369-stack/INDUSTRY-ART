const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]');
  await page.click('[data-a="empezar"]');
  await page.click('#modal [data-a="cerrarModal"]');
  await page.evaluate(() => {
    const b = IA.obras.borrador(0, { gen: ['Comedia'], escala: 1, tit: "Tom & Jerry's" }); IA.obras.equipoRecomendado(b, 1);
    const r = IA.juego.iniciarObra(b);
    while (r.obra.et !== 'lista') IA.juego.avanzarSemana();
    IA.juego.programarEstreno(r.obra, IA.n.S.t + 1, 2);
    while (IA.obras.porId(r.obra.id).et !== 'terminada' || IA.n.S.t < 0) { IA.juego.avanzarSemana(); if (IA.obras.porId(r.obra.id).et === 'cartelera' && IA.obras.porId(r.obra.id).sc > 0) break; }
    IA.ui.ajuste('ritmo', 'mes'); IA.ui.refrescar();
  });
  let txt = [];
  for (let k = 0; k < 12 && !txt.length; k++) {
    await page.click('[data-a="avanzar"]'); await page.waitForTimeout(60);
    txt = await page.evaluate(() => [...document.querySelectorAll('.aviso')].map(a => a.textContent).filter(s => s.indexOf('Tom') >= 0));
    await page.evaluate(() => IA.ui.cerrarModal());
  }
  console.log('aviso mostrado:', JSON.stringify(txt));
  await browser.close();
})();
