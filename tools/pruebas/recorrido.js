const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const html = process.argv[2], eras = (process.argv[3] || '1750,1900,2026,2200').split(',').map(Number);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') err.push('CON ' + m.text()); });
  await p.goto('file://' + html); await p.waitForTimeout(600);
  for (const d of eras) {
    const r = await p.evaluate((d) => {
      const out = [], U = ART.ui, PB = ART.pruebas, N = ART.n;
      ART.juego.nuevaPartida({ semilla: 'rec' + d, anio: d, nombre: 'Recorrido', bot: true });
      for (let i = 0; i < 15 * 52; i++) { try { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); } catch (e) { out.push('BOT ' + N.anio() + ': ' + e.message); break; } }
      const malo = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]/;
      let visitas = 0;
      ['estudio', 'obras', 'talento', 'mundo', 'negocio'].forEach(sec => {
        try { U.irA(sec); } catch (e) { out.push(sec + ': ' + e.message); return; }
        const subs = Array.from(document.querySelectorAll('#vista [data-a="sub"]')).map(x => x.getAttribute('data-v'));
        (subs.length ? subs : ['']).forEach(sub => {
          try {
            if (sub) U.irA(sec, sub);
            visitas++;
            const v = document.getElementById('vista'), txt = v ? v.innerText : '';
            const m = txt.match(malo);
            if (m) { const i = txt.indexOf(m[0]); out.push(sec + '/' + sub + ' texto roto: «' + txt.slice(Math.max(0, i - 60), i + 20).replace(/\s+/g, ' ') + '»'); }
            if (txt.trim().length < 20) out.push(sec + '/' + sub + ' vacía');
          } catch (e) { out.push(sec + '/' + sub + ': ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
        });
      });
      out.unshift(d + ' → ' + N.anio() + ': ' + visitas + ' pantallas visitadas');
      return out;
    }, d);
    console.log(r.join('\n'));
  }
  console.log('errores de consola/página:', err.length); console.log(err.slice(0, 15).join('\n'));
  await b.close();
})();
