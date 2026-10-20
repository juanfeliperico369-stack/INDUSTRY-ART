const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const OUT = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const anios of [[1700], [1850], [1925], [1995], [2040], [2200]]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    p.on('dialog', d => d.dismiss());
    await p.goto('file://' + path.join(UP, 'v37.html'));
    await p.waitForTimeout(1500);
    const t0 = Date.now();
    let r;
    try {
      r = await p.evaluate((a) => { ART.juego.nuevaPartida({ semilla: 'base', anio: 1900, nombre: 'Base', avatar: { nombre: 'Yo' } }); ART.ui.render(); const r = ART.verificador.correr({ anios: a, vistas: 120, clics: 300, semanas: 156 }); return { errores: r.errores, pasos: r.pasos, clics: r.clics, vistas: r.vistas, semanas: r.semanas, medios: r.medios, ms: r.ms }; }, anios);
    } catch (e) { r = { fallo: String(e) }; }
    r.pageErrors = errs; r.wall = Date.now() - t0;
    res[anios.join(',')] = r;
    console.log(anios, JSON.stringify(r).slice(0, 1500));
    await p.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  await b.close();
})();
