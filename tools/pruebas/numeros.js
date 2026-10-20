// Busca NaN, Infinity y negativos imposibles en todo el estado de la partida. Uso: node numeros.js HTML desde años
const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const [html, d, an] = [process.argv[2], +process.argv[3] || 1990, +process.argv[4] || 40];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage(); const err = [];
  p.on('pageerror', e => err.push(e.message));
  await p.goto('file://' + html); await p.waitForTimeout(600);
  const r = await p.evaluate(([d, an]) => {
    const N = ART.n, PB = ART.pruebas, malos = {};
    ART.juego.nuevaPartida({ semilla: 'num' + d, anio: d, nombre: 'Numeros', bot: true });
    const NO_NEG = /^(fama|hab|pot|crit|pub|des|edad|nac|semanas|sem|eps|copias|bruto|ent|parte|n|cuota|asientos|precio)$/;
    const revisar = (x, ruta, prof) => {
      if (prof > 7 || x === null) return;
      if (typeof x === 'number') { const clave = ruta.replace(/\.\d+/g, '.#'); const hoja = ruta.split('.').pop();
        if (!isFinite(x)) malos[clave + ' = ' + x] = (malos[clave + ' = ' + x] || 0) + 1;
        else if (x < 0 && NO_NEG.test(hoja)) malos[clave + ' negativo'] = (malos[clave + ' negativo'] || 0) + 1;
        return; }
      if (typeof x === 'object') for (const k in x) revisar(x[k], ruta + '.' + k, prof + 1);
    };
    for (let y = 0; y < an; y++) { for (let i = 0; i < 52; i++) { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); } if (y % 10 === 9) revisar(N.S, 'S', 0); }
    return Object.keys(malos).slice(0, 30).map(k => k + ' (' + malos[k] + ')');
  }, [d, an]);
  console.log(r.length ? r.join('\n') : 'sin números inválidos'); console.log('errores:', err.join(' | ') || 'ninguno');
  await b.close();
})();
