const { open, newGame, closeModal } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  // E5: "cost" options with negative cash give money
  const r5 = await p.evaluate(() => {
    BOT.start({ y0: 2000, cap: 1e6 });
    const out = [];
    for (const [ev, opt] of [[1, 0], [0, 0], [2, 0]]) {
      S.cash = -1e6; if (ev != 1) { S.pj = [{ st: 3, gross: 1, h: 1, a: 1, gn: [], aw: [] }]; }
      S.evp = ev; const c0 = S.cash; act('evo', String(opt));
      out.push(EVT[ev][3][opt][0] + ': caja ' + c0 + ' -> ' + Math.round(S.cash));
    }
    return out;
  });
  console.log('E5', r5);
  // E5b: decade bonus with negative cash
  const r5b = await p.evaluate(() => {
    BOT.start({ y0: 2000, cap: 1e6 });
    S.t = 52 * 10 - 1; // last week of 2009
    S.pj = [{ id: 1, st: 4, rt: 52 * 3, r0: 52 * 3, n: 'x', c: 50, a: 50, h: 50, gn: [], aw: [], ex: 0, cost: 1, gross: 1 }, { id: 2, st: 4, rt: 52 * 4, r0: 52 * 4, n: 'y', c: 50, a: 50, h: 50, gn: [], aw: [], ex: 0, cost: 1, gross: 1 }, { id: 3, st: 4, rt: 52 * 5, r0: 52 * 5, n: 'y', c: 50, a: 50, h: 50, gn: [], aw: [], ex: 0, cost: 1, gross: 1 }, { id: 4, st: 4, rt: 52 * 6, r0: 52 * 6, n: 'y', c: 50, a: 50, h: 50, gn: [], aw: [], ex: 0, cost: 1, gross: 1 }];
    S.win = 3; S.cash = -5e6;
    const goal = dg(2000);
    dec(); return { goal, dres: S.dres, cashAfter: S.cash };
  });
  console.log('E5b decade bonus with debt', JSON.stringify(r5b));
  // E6: 1850 with $500: event 'Una promesa sin agente' -> bankrupt
  const r6 = await p.evaluate(() => {
    BOT.start({ y0: 1850, cap: 500 });
    const c0 = S.cash; S.evp = 4; act('evo', '0');
    const c1 = S.cash; const sal1 = sal(S.tl[S.tl.length - 1]);
    let w = 0; while (!S.over && w < 20) { step(); w++; }
    return { cashBefore: c0, cashAfterHire: Math.round(c1), salary: sal1, weeksToBankruptcy: w, over: S.over, cashEnd: Math.round(S.cash) };
  });
  console.log('E6 promise event in 1850 with $500', r6);
  // E6b: is a $500 start in 1850 playable? try create teatro and libro
  const r6b = await p.evaluate(() => {
    BOT.start({ y0: 1850, cap: 500 });
    const a = BOT.create(3, 1); const b = BOT.create(5, 0.5);
    return { teatro: a, libro: b, cash: S.cash, mins: MD.map(m => m[0] + ' min ' + m[3]) };
  });
  console.log('E6b', r6b);
  // E6c: milestone bonus minimum $10K and comic-con min
  const r6c = await p.evaluate(() => {
    BOT.start({ y0: 1850, cap: 500 });
    BOT.create(5, 0.3);
    let w = 0; while (!S.pj.some(p => p.st >= 3) && w < 60) { S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id, [])); step(); w++; }
    const c0 = S.cash; hit(); return { cashBeforeHit: Math.round(c0), cashAfterHit: Math.round(S.cash), news: S.nw.slice(0, 2) };
  });
  console.log('E6c', r6c);
  console.log('errs', errs);
  await b.close();
})();
