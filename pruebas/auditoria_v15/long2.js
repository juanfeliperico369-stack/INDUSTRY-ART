const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const y0 = +(process.argv[2] || 1900), years = +(process.argv[3] || 100), cap = +(process.argv[4] || 1e6), throttle = +(process.argv[5] || 1);
  const marks = (process.argv[6] || '25,50,100').split(',').map(Number);
  const { b, p, errs } = await open();
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(BOTSRC);
  await p.evaluate(o => BOT.start(o), { y0, cap });
  const rows = [];
  const t0 = Date.now();
  for (let y = 1; y <= years; y++) {
    const r = await p.evaluate(() => {
      for (let w = 0; w < 52; w++) {
        if (S.over) break;
        if (S.t % 6 == 0) BOT.create(yr() >= 1900 ? 0 : 3, 0.1);
        S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id));
        BOT.week({ step: 0, n: 0 });
      }
      return { y: yr(), cash: S.cash, rev: S.rev, win: S.win, over: S.over, nan: BOT.scanNaN().slice(0, 5) };
    });
    rows.push(r);
    if (r.nan.length) console.log('NaN at', r.y, r.nan);
    if (r.over) { console.log('OVER', r); break; }
    if (marks.includes(y)) {
      if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
      const m = await p.evaluate(() => {
        const snap = JSON.stringify(S);
        // pure step timing: 52 steps
        let t = performance.now();
        for (let w = 0; w < 52; w++) { step(); S.cer = []; S.evp = null; }
        const year = performance.now() - t;
        S = lo(JSON.parse(snap));
        // single week
        t = performance.now(); for (let i = 0; i < 10; i++) step(); const wk10 = (performance.now() - t) / 10;
        S = lo(JSON.parse(snap));
        // save
        t = performance.now(); sv('auto'); const svt = performance.now() - t;
        t = performance.now(); const ld0 = ld('auto'); const ldt = performance.now() - t;
        // UI advance of 52 weeks (includes render, autosave)
        t = performance.now(); adv(52); const advt = performance.now() - t; cx();
        S = lo(JSON.parse(snap));
        t = performance.now(); tab = 0; pg(); const pg0 = performance.now() - t;
        t = performance.now(); tab = 4; pg(); const pg4 = performance.now() - t;
        t = performance.now(); tab = 2; pg(); const pg2 = performance.now() - t; tab = 0;
        const stale = (() => { const a = ld("auto"); return a ? (a.t != S.t ? "STALE t=" + a.t + " vs " + S.t : "ok") : "null"; })(); const exp = btoa(unescape(encodeURIComponent(snap))).length;
        let ls = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls += k.length + localStorage.getItem(k).length; }
        return { stale, saveChars: snap.length, exportChars: exp, lsChars: ls, year52ms: year, weekMs: wk10, svt, ldt, advt, pg0, pg4, pg2, pj: S.pj.length, tl: S.tl.length, ah: S.ah.length, ch: Object.keys(S.ch || {}).length, fr: Object.keys(S.fr || {}).length, you: S.tl[72].age, cash: S.cash, rev: S.rev, win: S.win, nom: S.nom, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null };
      });
      if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      console.log('MARK', y, JSON.stringify(m));
    }
  }
  console.log('wall s', (Date.now() - t0) / 1000);
  fs.writeFileSync(`long2_${y0}_${years}_${cap}_${throttle}.json`, JSON.stringify(rows));
  console.log('ERRS', errs.slice(0, 20));
  await b.close();
})();
