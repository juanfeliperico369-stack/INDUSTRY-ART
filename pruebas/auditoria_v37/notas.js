const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  await p.goto('file://' + path.join(UP, 'v37.html'));
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    ART.juego.nuevaPartida({ semilla: 'notas', anio: 1990, nombre: 'Notas', avatar: { nombre: 'Yo' } });
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 104; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
    const U = ART.ui; U.render(); U.cerrarModal();
    const out = []; let total = 0, totalCh = 0;
    for (const s of U.SECCIONES || ['estudio', 'obras', 'talento', 'mundo', 'negocio']) {
      U.irA(s);
      const subs = Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v'));
      for (const u of subs) {
        U.irA(s, u);
        const ns = Array.from(document.querySelectorAll('#vista .nota')).filter(e => e.offsetParent !== null);
        const ch = ns.reduce((a, e) => a + e.innerText.length, 0);
        const iBtns = document.querySelectorAll('#vista .ayuda-i, #vista [data-a="ayuda"]').length;
        out.push([s + '/' + u, ns.length, ch, iBtns, ns.slice(0, 2).map(e => e.innerText.slice(0, 110))]);
        total += ns.length; totalCh += ch;
      }
    }
    return { out, total, totalCh };
  });
  r.out.sort((a, b) => b[2] - a[2]);
  console.log('Total notas visibles:', r.total, 'caracteres:', r.totalCh, 'pantallas:', r.out.length);
  for (const x of r.out.slice(0, 25)) console.log(x[0].padEnd(26), 'notas', String(x[1]).padStart(3), 'chars', String(x[2]).padStart(5), 'i:', x[3], '|', JSON.stringify(x[4]).slice(0, 260));
  await b.close();
})();
