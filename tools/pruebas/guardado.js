const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage(); const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(600);
  const r = await p.evaluate(async () => {
    const N = ART.n, PB = ART.pruebas, out = [];
    ART.juego.nuevaPartida({ semilla: 'guar', anio: 2020, nombre: 'Guardado', bot: true });
    for (let i = 0; i < 6 * 52; i++) { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
    const S = N.S; S.estudios[0].caja = 1e12;
    ART.estreno.comprar(ART.estreno.cadenas('nam')[0].id);
    const f = ART.franquicias.lista().filter(x => x.est === 0)[0]; if (f) ART.franquicias.subastar(f.id, 80);
    const antes = { t: S.t, caja: Math.round(S.estudios[0].caja), obras: S.obras.length, cadP: (S.estudios[0].cadP || []).join(), esp: S.avatar.esp.join(), sub: f && f.sub ? 1 : 0, galas: (S.galas || []).length };
    const g = await ART.guardado.guardar('m7');
    for (let i = 0; i < 10; i++) ART.juego.avanzarSemana();
    const c = await ART.guardado.cargar('m7');
    const S2 = N.S, f2 = f ? ART.franquicias.porId(f.id) : null;
    const despues = { t: S2.t, caja: Math.round(S2.estudios[0].caja), obras: S2.obras.length, cadP: (S2.estudios[0].cadP || []).join(), esp: S2.avatar.esp.join(), sub: f2 && f2.sub ? 1 : 0, galas: (S2.galas || []).length };
    out.push('guardar ' + JSON.stringify(g).slice(0, 80) + ' cargar ' + JSON.stringify(c).slice(0, 80));
    out.push('antes   ' + JSON.stringify(antes)); out.push('después ' + JSON.stringify(despues));
    for (let i = 0; i < 52; i++) { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
    out.push('un año más tras cargar: ' + N.anio() + ' caja ' + Math.round(N.S.estudios[0].caja / 1e6) + ' M');
    return out;
  });
  console.log(r.join('\n')); console.log('errores:', err.join(' | ') || 'ninguno');
  await b.close();
})();
