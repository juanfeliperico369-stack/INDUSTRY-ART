const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 860 } });
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  await page.goto('file://' + __dirname + '/ia.html');
  const r = await page.evaluate(() => {
    IA.pruebas.jugar({ estrategia: 'normal', desde: 1900, hasta: 1945, semilla: 'menores' });
    const S = IA.n.S; S.bot = false;
    // llevar el juego a la última semana del año
    while (IA.n.semana() !== 52) IA.juego.avanzarSemana();
    IA.ui.render();
    // una obra rival que la compactación borrará al cerrar el año
    const limite = (S.t + 1) - 52 * 40;
    const o = S.obras.find(x => x.est !== 0 && x.et === 'terminada' && (x.fe || 0) < limite && !(x.aw && x.aw.length) && !x.top);
    IA.ui.acciones.verObra(String(o.id));
    const antes = document.getElementById('ficha').textContent.length;
    IA.ui.ajuste('ritmo', 'semana'); IA.ui.acciones.avanzar();
    const despues = document.getElementById('ficha').textContent.length;
    const existe = !!IA.obras.porId(o.id);
    IA.ui.cerrarFicha();
    // escrituras de ajustes al dibujar la gráfica de Finanzas
    let escrituras = 0; const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k.indexOf('ajustes') >= 0) escrituras++; return orig.call(this, k, v); };
    IA.ui.irA('negocio', 'finanzas');
    Storage.prototype.setItem = orig;
    return { obra: o.id, textoFichaAntes: antes, textoFichaDespues: despues, obraExiste: existe, escriturasAjustesAlDibujar: escrituras };
  });
  console.log(JSON.stringify(r));
  console.log(errores.join('\n'));
  await browser.close();
})();
