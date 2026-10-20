// Partida larga: tamaño del guardado, tiempo por semana y errores. Uso: node largo.js HTML desde hasta
const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const [html, d, h] = [process.argv[2], +process.argv[3] || 1850, +process.argv[4] || 2100];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage(); const err = [];
  p.on('pageerror', e => err.push(e.message));
  await p.goto('file://' + html); await p.waitForTimeout(600);
  const r = await p.evaluate(([d, h]) => {
    const N = ART.n, PB = ART.pruebas, out = [];
    ART.juego.nuevaPartida({ semilla: 'largo', anio: d, nombre: 'Largo', bot: true });
    let peor = 0, tot = 0, n = 0;
    for (let i = 0; i < (h - d) * 52; i++) {
      const t0 = performance.now();
      try { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); } catch (e) { out.push('error ' + N.anio() + ': ' + e.message); break; }
      const dt = performance.now() - t0; tot += dt; n++; if (dt > peor) peor = dt;
      if (N.semana() === 1 && N.anio() % 25 === 0) {
        const S = N.S, j = JSON.stringify(S), grandes = Object.keys(S).map(k => [k, JSON.stringify(S[k] || '').length]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0] + ' ' + Math.round(x[1] / 1024) + 'K').join(', ');
        out.push(N.anio() + ': guardado ' + Math.round(j.length / 1024) + ' KB · obras ' + S.obras.length + ' · talentos ' + S.talentos.length + ' · semana media ' + (tot / n).toFixed(1) + ' ms, peor ' + peor.toFixed(0) + ' ms · más grandes: ' + grandes);
        tot = 0; n = 0; peor = 0;
      }
    }
    return out;
  }, [d, h]);
  console.log(r.join('\n')); console.log('errores:', err.join(' | ') || 'ninguno');
  await b.close();
})();
