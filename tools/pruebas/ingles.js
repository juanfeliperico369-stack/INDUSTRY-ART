const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(600);
  await p.evaluate(async () => { ART.juego.nuevaPartida({ semilla: 'en', anio: 2030, nombre: 'English', bot: true }); for (let i = 0; i < 2 * 52; i++) { ART.pruebas.decidir(ART.pruebas.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); } await ART.idioma.poner('en'); });
  await p.waitForTimeout(500);
  const r = await p.evaluate(async () => {
    const U = ART.ui, A = U.acciones, out = [];
    const ver = async (n, f) => { f(); await new Promise(r => setTimeout(r, 250)); out.push(n + ': ' + document.getElementById('vista').innerText.replace(/\s+/g, ' ').slice(0, 260)); };
    await ver('agenda', () => { U.irA('mundo', 'calendario'); A.calVista('agenda'); A.calAgenda('anio'); });
    await ver('premios', () => { U.irA('mundo', 'premios'); A.prSubPremios('historial'); });
    await ver('stats', () => U.irA('estudio', 'estadisticas'));
    return out;
  });
  console.log(r.join('\n')); console.log('errores:', err.join(' | ') || 'ninguno');
  await b.close();
})();
