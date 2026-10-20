// Uso: node econ.js HTML desde hasta [estrategia] [paso]
const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const [html, d, h, est, paso] = [process.argv[2], +process.argv[3] || 1950, +process.argv[4] || 2030, process.argv[5] || 'normal', +process.argv[6] || 5];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage();
  const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  await p.goto('file://' + html); await p.waitForTimeout(600);
  const r = await p.evaluate(([d, h, est, paso]) => {
    const N = ART.n, E = ART.economia, O = ART.obras, PB = ART.pruebas;
    ART.juego.nuevaPartida({ semilla: 'econ' + d, anio: d, nombre: 'Medidor', bot: true });
    const S = N.S, rows = [], errs = [];
    const M = x => Math.round(x / 1e6);
    let ult = d - 1;
    for (let i = 0; i < (h - d) * 52; i++) {
      try { PB.decidir(PB.ESTRATEGIAS[est]); ART.juego.avanzarSemana(); } catch (e) { errs.push(N.anio() + ': ' + e.message); if (errs.length > 5) break; }
      const a = N.anio();
      if (a !== ult && (a - d) % paso === 0) {
        ult = a;
        const mias = S.obras.filter(o => o.est === 0 && o.et === 'terminada' && o.anio >= a - paso);
        const rivales = S.estudios.slice(1).filter(e => !e.quebrado);
        const mult = mias.map(o => O.multiplicador(o)).sort((x, y) => x - y);
        rows.push({ anio: a, caja: M(S.estudios[0].caja), fama: Math.round(S.estudios[0].fama * 100), tipico: M(E.presupuestoTipico(a)),
          obras: mias.length, costoMed: mias.length ? M(mias.reduce((s, o) => s + O.costoTotal(o), 0) / mias.length) : 0,
          multMed: mult.length ? +mult[Math.floor(mult.length / 2)].toFixed(2) : 0, multMax: mult.length ? +mult[mult.length - 1].toFixed(1) : 0,
          netoPeriodo: M(mias.reduce((s, o) => s + O.neto(o), 0)), critMed: mias.length ? Math.round(mias.reduce((s, o) => s + (o.crit || 0), 0) / mias.length) : 0,
          rivales: rivales.length, cajaRivalMed: rivales.length ? M(rivales.map(e => e.caja).sort((x, y) => x - y)[Math.floor(rivales.length / 2)]) : 0,
          talentos: S.talentos.filter(t => !t.mu && !t.ret).length, perdidas: mias.length ? Math.round(100 * mias.filter(o => O.neto(o) < 0).length / mias.length) : 0, critSD: (function () { if (!mias.length) return 0; const m = mias.reduce((s, o) => s + (o.crit || 0), 0) / mias.length; return Math.round(Math.sqrt(mias.reduce((s, o) => s + Math.pow((o.crit || 0) - m, 2), 0) / mias.length)); })(), topRival: rivales.length ? M(Math.max.apply(null, rivales.map(e => e.caja))) : 0 });
      }
    }
    return { rows, errs };
  }, [d, h, est, paso]);
  console.log(['anio','caja','fama','tipico','obras','costoMed','multMed','multMax','netoPeriodo','critMed','rivales','cajaRivalMed','talentos','perd%','critSD','topRival'].join('\t'));
  r.rows.forEach(x => console.log(Object.values(x).join('\t')));
  console.log('errores:', JSON.stringify(r.errs), err.slice(0, 5).join(' | '));
  await b.close();
})();
