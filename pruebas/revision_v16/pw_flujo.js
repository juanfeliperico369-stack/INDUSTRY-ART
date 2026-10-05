const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 420, height: 860 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]');
  await page.fill('input[data-k="nombre"]', 'Mi <Estudio> & "Cía"');
  await page.click('[data-a="empezar"]');
  await page.click('#modal [data-a="cerrarModal"]');
  // Crear obra por la interfaz
  await page.click('#vista [data-a="crearObra"]');
  for (let k = 0; k < 4; k++) { await page.click('#ficha [data-a="crPaso"][data-v="1"]'); await page.waitForTimeout(50); }
  await page.fill('#ficha input[data-i="crTitulo"]', '<img src=x onerror=window.__x=1>');
  await page.click('#ficha [data-a="crIniciar"]');
  await page.waitForTimeout(300);
  let info = await page.evaluate(() => ({ obras: IA.obras.delEstudio(0).map(o => [o.tit, o.et]), avisos: [...document.querySelectorAll('.aviso')].map(a => a.textContent) }));
  console.log(JSON.stringify(info));
  // ritmo evento hasta que esté lista
  await page.evaluate(() => { IA.ui.ajuste('ritmo', 'evento'); IA.ui.renderBarra(); });
  for (let k = 0; k < 10; k++) {
    await page.click('[data-a="avanzar"]'); await page.waitForTimeout(80);
    if (await page.evaluate(() => IA.ui.modalAbierto())) await page.evaluate(() => IA.ui.cerrarModal());
    if (await page.evaluate(() => IA.obras.delEstudio(0, ['lista']).length)) break;
  }
  await page.evaluate(() => IA.ui.irA('obras', 'listas'));
  await page.click('#vista [data-a="programar"]');
  await page.waitForTimeout(300);
  await page.click('#ficha [data-a="pgConfirmar"]');
  await page.waitForTimeout(300);
  for (let k = 0; k < 40; k++) {
    await page.click('[data-a="avanzar"]'); await page.waitForTimeout(40);
    if (await page.evaluate(() => IA.ui.modalAbierto())) await page.evaluate(() => IA.ui.cerrarModal());
    if (await page.evaluate(() => IA.obras.delEstudio(0, ['terminada']).length)) break;
  }
  info = await page.evaluate(() => ({ t: IA.n.S.t, obras: IA.obras.delEstudio(0).map(o => [o.et, o.bruto, o.inf]), xss: window.__x === 1 }));
  console.log(JSON.stringify(info));
  // Guardar (gzip) y cargar; guardar con LZW forzado y cargar
  const g = await page.evaluate(async () => {
    const S0 = JSON.stringify(IA.n.S);
    const r1 = await IA.guardado.guardar('m1');
    const c1 = await IA.guardado.cargar('m1');
    const igual1 = JSON.stringify(IA.n.S) === S0;
    const CS = window.CompressionStream; window.CompressionStream = undefined;
    const r2 = await IA.guardado.guardar('m2');
    window.CompressionStream = CS;
    const c2 = await IA.guardado.cargar('m2');
    const igual2 = JSON.stringify(IA.n.S) === S0;
    const txt = await IA.guardado.exportarTexto();
    const c3 = await IA.guardado.importarTexto(txt);
    const igual3 = JSON.stringify(IA.n.S) === S0;
    const lista = await IA.guardado.listar();
    return { r1, c1, igual1, r2, c2, igual2, c3, igual3, lista: lista.map(x => x.ranura + ':' + (x.meta ? x.meta.nombre : '-')) };
  });
  console.log(JSON.stringify(g));
  // abrir el modal de guardado (nombre con < >)
  await page.evaluate(() => IA.ui.render());
  await page.click('[data-a="abrirGuardado"]');
  await page.waitForTimeout(300);
  console.log('modal guardado:', (await page.innerText('#modal')).split('\n').slice(0, 6).join(' | '));
  console.log(errores.join('\n'));
  await browser.close();
})();
