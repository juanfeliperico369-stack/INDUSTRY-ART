const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const y0 = +(process.argv[2] || 1900), years = +(process.argv[3] || 100), cap = +(process.argv[4] || 1e6), every = +(process.argv[5] || 6), frac = +(process.argv[6] || 0.2);
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  await p.evaluate(o => BOT.start(o), { y0, cap });
  const rows = [];
  const T = await p.evaluate(() => (window.TT = { step: 0, n: 0 }, TT));
  const t0 = Date.now();
  for (let y = 0; y < years; y++) {
    const r = await p.evaluate(({ every, frac }) => {
      const out = { cr: {} };
      for (let w = 0; w < 52; w++) {
        if (S.over) break;
        if (S.t % every == 0) { const m = S.pj.length % 2 == 0 ? 0 : 5; const res = BOT.create(yr() >= 1900 ? 0 : 3, frac / 2); out.cr[res.slice(0, 20)] = (out.cr[res.slice(0, 20)] || 0) + 1; }
        S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id));
        BOT.week(TT);
      }
      const js = JSON.stringify(S);
      const ts = performance.now(); sv('auto'); const svt = performance.now() - ts;
      const tp = performance.now(); pg(); const pgt = performance.now() - tp;
      return { y: yr(), cash: S.cash, rev: S.rev, win: S.win, nom: S.nom, pj: S.pj.length, tl: S.tl.length, ret: S.tl.filter(t => t.ret).length, save: js.length, svt, pgt, over: S.over, stepMs: TT.step / TT.n, nan: BOT.scanNaN().slice(0, 5), you: S.tl[72].age, ah: S.ah.length, ch: Object.keys(S.ch || {}).length, cr: out.cr, ow: S.ow.filter(x => x).length };
    }, { every, frac });
    rows.push(r);
    if ([1, 5, 8, 10, 25, 50, 75, 100, 150].includes(y + 1) || r.nan.length || r.over) console.log(JSON.stringify(r));
    if (r.over) break;
  }
  console.log('wall s', (Date.now() - t0) / 1000);
  fs.writeFileSync(`long_${y0}_${years}_${cap}.json`, JSON.stringify(rows));
  console.log('ERRS', errs.slice(0, 20));
  await b.close();
})();
