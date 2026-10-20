const { chromium } = require('playwright');
const path = require('path');
const UP = process.argv[2], EST = process.argv[3] || 'normal', DESDE = +(process.argv[4] || 1700), HASTA = +(process.argv[5] || 2300), PASO = +(process.argv[6] || 25);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  await p.goto('file://' + path.join(UP, 'v37.html')); await p.waitForTimeout(800);
  await p.evaluate((o) => { ART.juego.nuevaPartida({ semilla: 'largo-' + o.EST + o.DESDE, anio: o.DESDE, nombre: 'Largo', bot: true, avatar: { nombre: 'Yo' } }); window.__err = []; }, { EST, DESDE });
  for (let a = DESDE; a < HASTA; a += PASO) {
    const t0 = Date.now();
    const r = await p.evaluate(async (o) => {
      const P = ART.pruebas, est = P.ESTRATEGIAS[o.EST], S = ART.n.S;
      let peor = 0;
      for (let i = 0; i < o.PASO * 52; i++) {
        const t = performance.now();
        try { P.decidir(est); ART.juego.avanzarSemana(); } catch (e) { window.__err.push(ART.n.anio() + ': ' + e.message); if (window.__err.length > 20) break; }
        peor = Math.max(peor, performance.now() - t);
        if (S.quiebra) break;
      }
      const malos = []; (function rec(x, ruta, prof) { if (prof > 6 || malos.length > 10) return; if (typeof x === 'number' && !isFinite(x)) malos.push(ruta); else if (x && typeof x === 'object') for (const k in x) rec(x[k], ruta + '.' + k, prof + 1); })(S, 'S', 0);
      const json = JSON.stringify(S).length; let comp = null; try { comp = (await ART.guardado.medir()).comprimido; } catch (e) { comp = 'err ' + e.message; }
      return { anio: ART.n.anio(), caja: Math.round(S.estudios[0].caja), quiebra: S.quiebra ? S.quiebra.anio : null, obras: S.obras.length, talentos: S.talentos.length, estudios: S.estudios.length, jsonKB: Math.round(json / 1024), compKB: typeof comp === 'number' ? Math.round(comp / 1024) : comp, peorSemanaMs: Math.round(peor), noFinitos: malos, errores: window.__err.slice(-3), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null };
    }, { EST, PASO });
    r.seg = Math.round((Date.now() - t0) / 1000);
    console.log(JSON.stringify(r));
    if (r.quiebra) break;
  }
  const fin = await p.evaluate(() => {
    const err = []; ART.ui.render();
    for (const s of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) {
      ART.ui.irA(s);
      Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v')).forEach(u => {
        const t0 = performance.now();
        try { ART.ui.irA(s, u); const t = document.getElementById('vista').innerText; const m = t.match(ART.verificador.MALO); if (m) err.push(s + '/' + u + ': ' + t.slice(Math.max(0, m.index - 40), m.index + 20)); } catch (e) { err.push(s + '/' + u + ' EXC ' + e.message); }
        const dt = performance.now() - t0; if (dt > 300) err.push('LENTO ' + s + '/' + u + ' ' + Math.round(dt) + ' ms');
      });
    }
    return err;
  });
  console.log('FIN pantallas:', JSON.stringify(fin), 'pageErrors:', JSON.stringify(errs.slice(0, 10)));
  await b.close();
})();
