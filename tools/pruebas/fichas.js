const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const html = process.argv[2], eras = (process.argv[3] || '1760,1960,2030,2210').split(',').map(Number);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') err.push('CON ' + m.text()); });
  await p.goto('file://' + html); await p.waitForTimeout(600);
  for (const d of eras) {
    const r = await p.evaluate((d) => {
      const out = [], U = ART.ui, A = U.acciones, PB = ART.pruebas, N = ART.n, Md = ART.medios;
      ART.juego.nuevaPartida({ semilla: 'fic' + d, anio: d, nombre: 'Fichas', bot: true });
      for (let i = 0; i < 8 * 52; i++) { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
      const malo = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]/;
      let n = 0;
      const revisar = (donde, id) => { const el = document.getElementById(id); const txt = el ? el.innerText : ''; const m = txt.match(malo); n++; if (m) { const i = txt.indexOf(m[0]); out.push(donde + ' texto roto: «' + txt.slice(Math.max(0, i - 70), i + 20).replace(/\s+/g, ' ') + '»'); } };
      const prueba = (donde, f, id) => { try { f(); revisar(donde, id || 'ficha'); } catch (e) { out.push(donde + ': ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } };
      const S = N.S;
      S.obras.filter(o => o.est === 0).slice(-6).forEach(o => prueba('obra ' + o.tit, () => A.verObra(String(o.id))));
      S.obras.filter(o => o.est > 0).slice(-3).forEach(o => prueba('obra rival ' + o.tit, () => A.verObra(String(o.id))));
      S.talentos.filter(t => !t.mu).slice(0, 6).forEach(t => prueba('talento ' + t.nom, () => A.verTalento(String(t.id))));
      Md.proyectos().slice(-4).forEach(x => prueba('proyecto ' + x.med + ' ' + x.tit, () => A.mdVer(String(x.id))));
      ['cine', 'tv', 'teatro', 'libros', 'musica', 'juegos'].forEach(med => {
        prueba('crear ' + med, () => {
          A.crearObra(); const el = document.querySelector('[data-a="crCambiarMedio"][data-v="' + med + '"]') || document.querySelector('[data-a="crMedio"][data-v="' + med + '"]');
          if (!el || el.disabled) return;
          if (el.getAttribute('data-a') === 'crMedio') { A.crMedio(med); A.crCamino('nueva'); } else A.crCambiarMedio(med, el);
          const tabs = Array.from(document.querySelectorAll('#ficha [data-a="crTab"], #ficha [data-a="mdTab"], #ficha [data-a="crPaso"]')).map(x => [x.getAttribute('data-a'), x.getAttribute('data-v')]);
          tabs.forEach(t => prueba('crear ' + med + ' pestaña ' + t[1], () => A[t[0]](t[1])));
        });
        try { A.cerrarFicha && A.cerrarFicha(); } catch (e) {}
      });
      out.unshift(d + ': ' + n + ' fichas y pestañas revisadas');
      return out;
    }, d);
    console.log(r.join('\n'));
  }
  console.log('errores de consola/página:', err.length); console.log(err.slice(0, 15).join('\n'));
  await b.close();
})();
