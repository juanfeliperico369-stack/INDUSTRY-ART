const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const SH = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 1600 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  p.on('dialog', d => d.accept());
  await p.goto('file://' + path.join(UP, 'v37.html'));
  await p.waitForTimeout(1200);
  await p.click('text=Nueva partida');
  await p.waitForTimeout(800);
  await p.screenshot({ path: SH + '/v37_np1.png', fullPage: true });
  fs.writeFileSync(SH + '/v37_np_text.txt', await p.evaluate(() => document.body.innerText));
  // click Empezar
  const emp = await p.$('button:has-text("Empezar")');
  if (emp) { await emp.click(); await p.waitForTimeout(1500); }
  await p.screenshot({ path: SH + '/v37_inicio.png', fullPage: false });
  await p.evaluate(() => { ART.ui.cerrarModal && ART.ui.cerrarModal(); const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 80; i++) { P.decidir(est); ART.juego.avanzarSemana(); } ART.ui.cerrarModal && ART.ui.cerrarModal(); ART.ui.render(); });
  await p.waitForTimeout(500);
  const secs = await p.evaluate(() => {
    const out = {};
    return out;
  });
  // Recorrer secciones y subpestañas con la API de la UI
  const mapa = await p.evaluate(() => {
    const U = ART.ui; const r = [];
    for (const sec of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) {
      U.irA(sec);
      const subs = Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v'));
      r.push([sec, subs]);
    }
    return r;
  });
  const textos = {};
  for (const [sec, subs] of mapa) {
    for (const sub of (subs.length ? subs : [''])) {
      await p.evaluate(([s, u]) => { ART.ui.irA(s, u || undefined); }, [sec, sub]);
      await p.evaluate(() => { ART.ui.cerrarModal && ART.ui.cerrarModal(); }); await p.waitForTimeout(250);
      const nm = sec + '_' + (sub || 'main');
      await p.screenshot({ path: SH + '/v37_' + nm + '.png', fullPage: true });
      textos[nm] = await p.evaluate(() => document.getElementById('vista').innerText);
    }
  }
  fs.writeFileSync(SH + '/v37_textos.json', JSON.stringify(textos, null, 1));
  console.log(JSON.stringify(mapa), 'errors', JSON.stringify(errs));
  await b.close();
})();
