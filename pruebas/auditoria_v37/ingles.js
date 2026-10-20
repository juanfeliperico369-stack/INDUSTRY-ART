const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const OUT = process.argv[3];
// Palabras muy españolas que no deberían verse en la versión en inglés
const ES = /\b(de|del|la|las|los|el|que|para|con|una|uno|obras?|semana|semanas|año|años|tus?|estudio|caja|crítica|público|premios?|talentos?|construir|comprar|vender|ningun[ao]?|todav[ií]a|aquí|también|está|más|según)\b/i;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 1200 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto('file://' + path.join(UP, 'v37.html')); await p.waitForTimeout(800);
  await p.evaluate(async () => {
    ART.juego.nuevaPartida({ semilla: 'ingles', anio: 1995, nombre: 'Lang', avatar: { nombre: 'Me' } });
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 60; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
    ART.ui.render(); ART.ui.cerrarModal();
    await ART.idioma.poner('en');
  });
  await p.waitForTimeout(1500);
  const res = await p.evaluate(async (ESsrc) => {
    const ES = new RegExp(ESsrc, 'i');
    const U = ART.ui, out = {};
    const espera = () => new Promise(r => setTimeout(r, 120));
    for (const s of ['estudio', 'obras', 'talento', 'mundo', 'negocio']) {
      U.irA(s);
      const subs = Array.from(document.querySelectorAll('[data-a="sub"]')).map(b => b.getAttribute('data-v'));
      for (const u of subs) {
        U.irA(s, u); await espera();
        const lineas = document.getElementById('vista').innerText.split('\n').map(x => x.trim()).filter(Boolean);
        const malas = lineas.filter(l => ES.test(l) && !/[«»]/.test(l));
        out[s + '/' + u] = { total: lineas.length, es: malas.length, ej: malas.slice(0, 4) };
      }
    }
    // Crear obra
    U.acciones.crearObra('cine'); U.acciones.crCamino('nueva'); await espera();
    const lc = document.getElementById('modal').innerText.split('\n').map(x => x.trim()).filter(Boolean);
    out['crear/cine'] = { total: lc.length, es: lc.filter(l => ES.test(l)).length, ej: lc.filter(l => ES.test(l)).slice(0, 6) };
    return out;
  }, ES.source);
  let tot = 0, es = 0;
  for (const k in res) { tot += res[k].total; es += res[k].es; }
  console.log('Líneas totales', tot, 'con español', es, '(' + Math.round(es / tot * 1000) / 10 + ' %)');
  Object.entries(res).sort((a, b) => b[1].es - a[1].es).slice(0, 15).forEach(([k, v]) => console.log(k.padEnd(24), v.es + '/' + v.total, JSON.stringify(v.ej).slice(0, 300)));
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  console.log(errs);
  await b.close();
})();
