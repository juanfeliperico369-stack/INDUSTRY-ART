// Rendimiento aproximado en un celular modesto: CPU 4 veces más lenta, pantalla 390x844
const { chromium } = require('playwright');
const path = require('path');
const UP = process.argv[2];
async function pagina(b, lento) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  if (lento) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  return p;
}
(async () => {
  const b = await chromium.launch();
  // 1) Partida pesada (1950→2060) sin freno, exportada
  const p0 = await pagina(b, false);
  await p0.goto('file://' + path.join(UP, 'v37.html')); await p0.waitForTimeout(800);
  const txt = await p0.evaluate(async () => {
    ART.juego.nuevaPartida({ semilla: 'movil', anio: 1950, nombre: 'Movil', avatar: { nombre: 'Yo' } });
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 110 * 52; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
    return await ART.guardado.exportarTexto();
  });
  await p0.close();
  console.log('Partida pesada .iasave:', Math.round(txt.length / 1024), 'KB');
  for (const [nombre, f] of [['v37', 'v37.html'], ['final', 'final.html']]) {
    const p = await pagina(b, true);
    const t0 = Date.now();
    await p.goto('file://' + path.join(UP, f));
    await p.waitForSelector('text=Nueva partida');
    const menu = Date.now() - t0;
    const r = { menuMs: menu };
    if (nombre === 'v37') {
      let t = Date.now();
      await p.evaluate(() => { ART.juego.nuevaPartida({ semilla: 'm2', anio: 1990, nombre: 'M', avatar: { nombre: 'Yo' } }); ART.ui.render(); ART.ui.cerrarModal(); });
      r.nuevaPartidaMs = Date.now() - t;
      t = Date.now(); await p.evaluate(() => { for (let i = 0; i < 4; i++) ART.juego.avanzarSemana(); ART.ui.render(); }); r.mesInicioMs = Date.now() - t;
      t = Date.now();
      const ok = await p.evaluate(async (txt) => (await ART.guardado.importarTexto(txt)).ok, txt);
      r.importarPesadaMs = Date.now() - t; r.importOk = ok;
      t = Date.now(); await p.evaluate(() => { ART.ui.render(); ART.ui.cerrarModal(); }); r.renderPesadaMs = Date.now() - t;
      t = Date.now(); await p.evaluate(() => { ART.juego.avanzarSemana(); ART.ui.render(); }); r.semanaPesadaMs = Date.now() - t;
      t = Date.now(); await p.evaluate(() => { for (let i = 0; i < 4; i++) ART.juego.avanzarSemana(); ART.ui.render(); }); r.mesPesadaMs = Date.now() - t;
      t = Date.now(); const g = await p.evaluate(async () => (await ART.guardado.autoguardar()).ok); r.autoguardarPesadaMs = Date.now() - t; r.autoguardarOk = g;
      const lentas = await p.evaluate(() => { const o = []; for (const s of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) { ART.ui.irA(s); Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v')).forEach(u => { const t0 = performance.now(); ART.ui.irA(s, u); const dt = performance.now() - t0; if (dt > 250) o.push(s + '/' + u + ' ' + Math.round(dt) + ' ms'); }); } return o; });
      r.pantallasLentas = lentas;
    } else {
      let t = Date.now();
      await p.evaluate(() => { BOT.nueva({ est: 'normal', y0: 1990 }); S.bot = 0; S.tp = 0; cx(); pg(); });
      r.nuevaPartidaMs = Date.now() - t;
      t = Date.now(); await p.evaluate(() => { for (let i = 0; i < 4; i++) step(); pg(); }); r.mesInicioMs = Date.now() - t;
    }
    console.log(nombre, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})();
