const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  // build: one released film
  const base = await p.evaluate(() => {
    BOT.start({ y0: 2000, cap: 1e7 });
    BOT.create(0, 0.1);
    for (let i = 0; i < 60; i++) { S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); if (S.pj[0].st == 3 && S.pj[0].sl.length == 2) break; }
    window.SNAP = JSON.stringify(S);
    const P = S.pj[0];
    return { st: P.st, weeksShown: P.sl.length, gross: P.gross, earn: P.earn, val: frV(P.fid) };
  });
  console.log('state', base);
  // E2: price typed with Spanish thousands separator
  for (const typed of ['2.500', '1.000.000', '1,5M', '250000']) {
    const r = await p.evaluate(async (typed) => {
      S = lo(JSON.parse(SNAP)); const f = S.pj[0].fid; tab = 1; pg();
      act('fro', String(f)); act('frs', String(f));
      document.querySelector('#frpt').value = typed;
      const c0 = S.cash; Math.random = () => 0.5; // deterministic accept roll
      act('frq', String(f));
      return { typed, val: Math.round(frV(f)), sold: S.pj[0].sold || 0, paid: Math.round(S.cash - c0) };
    }, typed);
    console.log('E2 sell franchise typed', JSON.stringify(r));
  }
  // E3: franchise sold during theatrical run keeps earning box office
  const r3 = await p.evaluate(() => {
    S = lo(JSON.parse(SNAP)); const P = S.pj[0]; const f = P.fid;
    const e0 = P.earn; act('fro', String(f)); act('frs', String(f)); document.querySelector('#frpt').value = ''; Math.random = () => 0.1; act('frq', String(f));
    const sold = P.sold; const c1 = S.cash; const e1 = P.earn;
    for (let i = 0; i < 6; i++) step();
    return { soldAt: 'semana ' + (P.sl.length - 6) + ' de 8 en cartelera', sold, earnAfterSale: Math.round(P.earn - e1), cashDelta6w: Math.round(S.cash - c1), st: P.st };
  });
  console.log('E3 sold franchise still earns', r3);
  // E4: exclusive licence does not block non-exclusive
  const r4 = await p.evaluate(() => {
    S = lo(JSON.parse(SNAP)); const P = S.pj[0];
    while (P.st != 4) step();
    const c0 = S.cash;
    act('ls', P.id + '|1'); const a = S.cash - c0;
    act('ls', P.id + '|0'); const b2 = S.cash - c0 - a;
    // and next year again non-exclusive
    for (let i = 0; i < 52; i++) step();
    const c2 = S.cash; act('ls', P.id + '|0'); const c3 = S.cash - c2;
    return { gross: Math.round(P.gross), exclusive: Math.round(a), nonExclusiveSameWeek: Math.round(b2), nonExclusiveNextYear: Math.round(c3), licUntilWeek: P.lic, now: S.t, inCatalog: av(P) };
  });
  console.log('E4 licences', r4);
  console.log('errs', errs);
  await b.close();
})();
