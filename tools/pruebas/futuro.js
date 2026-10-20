const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') err.push('CON ' + m.text()); });
  await p.goto('file://' + process.argv[2]);
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const out = [], U = ART.ui, A = U.acciones || {};
    const prueba = (n, f) => { try { out.push(n + ' OK ' + f()); } catch (e) { out.push(n + ' FALLA ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } };
    [[2026, 2100], [2150, 2230], [2250, 2300]].forEach(([d, h]) => {
      const res = ART.pruebas.jugar({ estrategia: 'normal', desde: d, hasta: h, semilla: 'fut' + d });
      const S = ART.n.S;
      out.push(d + '-' + h + ' errores ' + JSON.stringify(res.errores || []).slice(0, 300) + ' obras ' + S.obras.filter(o => o.est === 0).length + ' caja ' + Math.round(S.estudios[0].caja / 1e6) + 'M');
      prueba(' pantallas ' + d, () => { const fallos = []; [['mundo', 'calendario'], ['mundo', 'premios'], ['mundo', 'historia'], ['estudio', 'estadisticas'], ['mundo', 'poblacion'], ['obras', 'catalogo']].forEach(x => { try { U.irA(x[0], x[1]); } catch (e) { fallos.push(x.join('/') + ':' + e.message); } }); return fallos.join(' ') || 'sin fallos'; });
      prueba(' crear ' + d, () => { A.crearObra ? A.crearObra() : 0; A.crCamino('nueva'); const b = ART.creacion.estado.b; return b ? 'borrador ' + b.tipo : 'sin'; });
      prueba(' plat ' + d, () => ART.medios.PLAT.filter(x => x.desde <= h && x.hasta >= h).map(x => x.id).join(','));
    });
    prueba('arte', () => ART.hitosArte.obrasHasta(2300).length + ' obras; personas 2200: ' + ART.hitosArte.personasEn(2200).length + '; detalle ' + JSON.stringify(ART.hitosArte.detalle('Seiscientos años')).slice(0, 60));
    prueba('era', () => ART.datos.erasInicio.map(e => e.nombre).slice(-6).join('|'));
    prueba('epocas', () => ART.taxonomia.epocasDisponibles ? ART.taxonomia.epocasDisponibles(2270).map(e => e.id).join(',') : 'n/a');
    prueba('historia', () => ART.historia.HITOS.filter(x => x[0] > 2026).length + ' sucesos futuros; periodos ' + ART.historia.PERIODOS.length);
    return out;
  });
  console.log(r.join('\n')); console.log(err.slice(0, 10).join('\n'));
  await b.close();
})();
