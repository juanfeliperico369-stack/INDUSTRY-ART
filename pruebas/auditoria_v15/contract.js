const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  console.log(await p.evaluate(() => {
    BOT.start({ y0: 2000, cap: 1e7 });
    S.tl.forEach(t => t.ex = 0); S.pj = []; S.rv.forEach(r => r.own = 0); S.cl = []; S.dl = [];
    S.t = 51; // semana 52 del primer año
    const t = S.tl.find(x => !x.ret && !x.you);
    const c0 = S.cash; act('ct', String(t.id)); const c1 = S.cash;
    // block random events/collab effects: step once into week 1 of next year
    const evp = S.evp; step(); const c2 = S.cash;
    const tax = c1 * 0.0006;
    return { salarioAnual: Math.round(sal(t)), pagoAlFirmar: Math.round(c0 - c1), descuentoAlPasarDeSemana52aSemana1: Math.round(c1 - c2), impuestoSemana: Math.round(tax), pagoExtraSalario: Math.round(c1 - c2 - tax), sigueExclusivo: t.ex };
  }));
  await b.close();
})();
