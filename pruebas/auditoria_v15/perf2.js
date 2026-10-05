const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(BOTSRC);
  await p.evaluate(() => { localStorage.clear(); BOT.start({ y0: 1900, cap: 1e6 }); });
  for (let y = 1; y <= 100; y++) {
    await p.evaluate(() => { for (let w = 0; w < 52; w++) { if (S.t % 6 == 0) BOT.create(0, 0.1); S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); } });
    if (y == 25) await p.evaluate(() => { window.SN25 = JSON.stringify(S); });
  }
  await p.evaluate(() => { window.SN100 = JSON.stringify(S); });
  // composition
  console.log('composition@100y', await p.evaluate(() => { const o = {}; let tot = JSON.stringify(S).length; for (const k of Object.keys(S)) o[k] = JSON.stringify(S[k]).length; const top = Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + (v / 1e3).toFixed(0) + 'K (' + (v / tot * 100).toFixed(0) + '%)'); const aw = S.pj.reduce((a, p) => a + JSON.stringify(p.aw).length, 0); return { total: tot, top, awInsideProjects: aw, talents: S.tl.length, retired: S.tl.filter(t => t.ret).length, ah: S.ah.length, ahShown: 10 }; }));
  for (const rate of [1, 4, 6]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    const r = await p.evaluate(async () => {
      S = lo(JSON.parse(SN100)); tab = 0; pg();
      const T = {}; let t;
      t = performance.now(); adv(1); T.click1sem = performance.now() - t; cx();
      t = performance.now(); sv('auto'); T.autosave = performance.now() - t;
      t = performance.now(); for (let i = 0; i < 52; i++) { step(); S.cer = []; S.evp = null; } T.year52steps = performance.now() - t;
      S = lo(JSON.parse(SN100));
      t = performance.now(); for (let i = 0; i < 20; i++) { step(); S.cer = []; S.evp = null; } T.weekStep = (performance.now() - t) / 20;
      S = lo(JSON.parse(SN100)); tab = 6; pg();
      t = performance.now(); act('exp'); T.exportCode = performance.now() - t; T.exportLen = document.querySelector('#ex').value.length;
      t = performance.now(); act('imp'); T.importCode = performance.now() - t;
      t = performance.now(); const a = ld('auto'); S = lo(a); T.loadAuto = performance.now() - t;
      t = performance.now(); tab = 4; pg(); T.renderNegocio = performance.now() - t;
      t = performance.now(); act('np'); T.openWizard = performance.now() - t; cx();
      for (const k in T) T[k] = Math.round(T[k] * 10) / 10;
      return T;
    });
    console.log('throttle x' + rate, JSON.stringify(r));
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  // wizard candidates
  console.log('wizard options', await p.evaluate(() => { S = lo(JSON.parse(SN25)); act('np'); const n = document.querySelector('#w-r1').options.length - 1; const active = S.tl.filter(t => !t.ret).length; cx(); return { optionsInDirectorSelect: n, activeTalents: active }; }));
  // E9 clean: re-release
  console.log('E9', await p.evaluate(() => {
    S = lo(JSON.parse(SN25));
    const P = S.pj.filter(x => x.st == 4 && x.c >= 75 && S.t - x.rt >= 260 && !x.sold).pop();
    const busy = new Set(); S.pj.filter(x => x.st < 4 && x !== P).forEach(x => Object.values(x.crew).forEach(i => busy.add(i)));
    const free = Object.values(P.crew).filter(i => !busy.has(i) && !S.tl[i].ret && !S.tl[i].you);
    const tid = free[0]; const t = S.tl[tid]; const r = Object.keys(P.crew).find(k => P.crew[k] == tid);
    const s0 = t.s[r], bx0 = t.bx, g0 = P.gross, c0 = S.cash, e0 = P.earn;
    act('rr', String(P.id)); const cost = c0 - S.cash, g1 = P.gross;
    let w = 0; while (P.st == 3 && w < 12) { step(); w++; }
    return { obra: P.n, critica: Math.round(P.c), costoReestreno: cost, brutoOriginal: fm(g0), brutoTrasReestreno: fm(g1), cobradoReestreno: fm(P.earn - e0), talento: t.n, rol: RO[r], habilidadAntes: s0, habilidadDespues: t.s[r], taquillaTalentoSumada: fm(t.bx - bx0) };
  }));
  // contract signed in last week of year pays twice
  console.log('contract', await p.evaluate(() => { S = lo(JSON.parse(SN25)); S.t = Math.floor(S.t / 52) * 52 + 51; const t = S.tl.find(x => !x.ret && !x.you && !x.ex); const c0 = S.cash; act('ct', String(t.id)); const c1 = S.cash; step(); return { salario: fm(sal(t)), pagadoAlFirmarSem52: fm(c0 - c1), semanaSiguiente: wk(), pagadoDeNuevo: t.ex ? 'sí (ver código)' : 'no' }; }));
  // tax on idle cash
  console.log('tax', await p.evaluate(() => { BOT.start({ y0: 2000, cap: 1e9 }); S.rv.forEach(r => r.own = 0); const c0 = S.cash; for (let i = 0; i < 51; i++) { S.t++; S.cash -= (S.cash > 0 ? S.cash * 0.0006 : 0); } return { perdidaAnualSinHacerNada: ((1 - S.cash / c0) * 100).toFixed(2) + '%' }; }));
  console.log('errs', errs);
  await b.close();
})();
