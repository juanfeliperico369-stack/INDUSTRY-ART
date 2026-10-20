const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage(); const err = [];
  p.on('pageerror', e => err.push(e.message)); p.on('console', m => { if (m.type() === 'error') err.push('CON ' + m.text()); });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const out = [], N = ART.n;
    const B = Object.keys(ART).map(k => ART[k]).filter(m => m && m.salidasQuiebra)[0];
    ART.juego.nuevaPartida({ semilla: 'qb', anio: 1990, nombre: 'Q', bot: true });
    const sal = B ? B.salidasQuiebra() : [];
    out.push('salidas: ' + sal.map(x => x.id + (x.ok === false ? '(no)' : '')).join(', '));
    sal.forEach(x => {
      ART.juego.nuevaPartida({ semilla: 'qb' + x.id, anio: 1990, nombre: 'Quiebra', bot: true });
      for (let i = 0; i < 52; i++) { ART.pruebas.decidir(ART.pruebas.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
      N.S.estudios[0].caja = -50 * ART.economia.presupuestoTipico(N.anio());
      let sem = 0; while (!N.S.quiebra && sem < 60) { ART.juego.avanzarSemana(); sem++; }
      const q = !!N.S.quiebra; try { ART.ui.irA('estudio'); } catch (e) { out.push('pantalla: ' + e.message); }
      const e = q ? B.salir(x.id) : 'no llegó a quiebra';
      for (let i = 0; i < 20; i++) { try { ART.juego.avanzarSemana(); } catch (e2) { out.push('tras ' + x.id + ': ' + e2.message); break; } }
      out.push(x.id + ': quiebra tras ' + sem + ' sem · resultado ' + (e || 'ok') + ' · caja ' + Math.round(N.S.estudios[0].caja / 1e6) + ' M · fin ' + !!(N.S.quiebra && N.S.quiebra.fin));
    });
    return out;
  });
  console.log(r.join('\n')); console.log('errores:', err.join(' | ') || 'ninguno');
  await b.close();
})();
