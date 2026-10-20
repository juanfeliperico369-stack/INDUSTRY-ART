const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + process.argv[2]); await p.waitForTimeout(600);
 console.log(await p.evaluate(() => { ART.juego.nuevaPartida({ semilla: 'f', anio: 2000, nombre: 'F', avatar: { nombre: 'Y' } });
  const c = ART.cal; return JSON.stringify({ hallow44: c.bonoFiesta('SM', 'nam', 45, 2000, ['Halloween']), sinGen: c.bonoFiesta('SM', 'nam', 45, 2000), navidad: c.bonoFiesta('FJ', 'eur', 51, 2000, ['Navidad']), pascua: c.bonoFiesta('FJ', 'eur', 13, 2001, ['Pascua']), generos: ART.datos.familias.map(f => f.generos.join(',')).join(' | ').match(/Halloween|Navidad|Pascua|Festival/g) }); })); await b.close(); })();
