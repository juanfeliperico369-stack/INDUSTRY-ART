const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  // E17 fm boundaries, E19 popu & fee, E18 rival price
  console.log('E17 fm', await p.evaluate(() => [fm(999999), fm(999999999), fm(999.6), fm(NaN)]));
  console.log('E19 popu', await p.evaluate(() => [1850, 1900, 1950, 2026, 2060, 2150].map(y => y + ':' + (popu(y) / 1e6).toFixed(0) + 'M')));
  console.log('E19 fee', await p.evaluate(() => { const t = { s: [0, 81, 0, 0, 0, 0, 0, 0] }; return [500, 1e6, 1e8].map(bud => fm(fee(t, 1, bud))); }));
  console.log('E18 rival', await p.evaluate(() => { BOT.start({ y0: 1900, cap: 1e9 }); const i = S.rv.reduce((a, r, k) => r.cash < S.rv[a].cash ? k : a, 0); const r = S.rv[i]; const pr = Math.round(r.cash * 1.6 + 25e4); act('buy', String(i)); return { rival: r.n, price: pr, weekly: r.inc, annualPct: (r.inc * 52 / pr * 100).toFixed(1) + '%' }; }));
  // Long state for the rest
  await p.evaluate(() => BOT.start({ y0: 1900, cap: 1e6 }));
  const snapAt = {};
  for (let y = 1; y <= 40; y++) {
    await p.evaluate(() => { for (let w = 0; w < 52; w++) { if (S.t % 6 == 0) BOT.create(0, 0.1); S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); } });
    if (y == 5 || y == 25) await p.evaluate((y) => { window['SN' + y] = JSON.stringify(S); }, y);
  }
  // E15 tuition & other prices tied to cumulative revenue
  console.log('E15', await p.evaluate(() => {
    const out = [];
    for (const k of ['SN5', 'SN25']) {
      S = lo(JSON.parse(window[k])); const t = S.tl.find(t => !t.ret && !t.you && t.s[t.r] >= 50 && t.s[t.r] < 60);
      out.push({ year: yr(), rev: fm(S.rev), cash: fm(S.cash), taller4sem: fm(eduC(t, t.r, 0)), cineUSA: fm(thc(0)), cineUSAsemanal: fm(thc(0) * 0.002), acuerdoMexico: fm(agf(1)), derechosNovela: fm(rmP(50)) });
    }
    return out;
  }));
  // E13 collaboration offers as % of cash
  console.log('E13', await p.evaluate(() => {
    S = lo(JSON.parse(SN25)); const out = []; let n = 0;
    for (let w = 0; w < 104 && out.length < 6; w++) { BOT.week({ step: 0, n: 0 }); S.cl.forEach(o => { if (!o.seen) { o.seen = 1; out.push({ tipo: ['inversión', 'distribución', 'encargo'][o.k], inv: fm(o.inv), rew: fm(o.rew), pctCaja: (o.rew / S.cash * 100).toFixed(0) + '%' }); } }); }
    return { rev: fm(S.rev), cash: fm(S.cash), offers: out };
  }));
  // E13b: accept every free collaboration for 10 years vs not
  console.log('E13b', await p.evaluate(() => {
    const run = (accept) => { S = lo(JSON.parse(SN25)); let got = 0; for (let w = 0; w < 520; w++) { if (accept) S.cl.slice().forEach(o => { if (o.k > 0) { const c0 = S.cash; act('cla', String(o.id)); } }); const c0 = S.cash; const n0 = S.dl.length; BOT.week({ step: 0, n: 0 }); } return { cash: fm(S.cash), rev: fm(S.rev) }; };
    return { sinAceptar: run(false), aceptandoGratis: run(true) };
  }));
  // E9 re-release overwrites gross, adds skill
  console.log('E9', await p.evaluate(() => {
    S = lo(JSON.parse(SN25)); const P = S.pj.filter(x => x.st == 4 && x.c >= 75 && S.t - x.rt >= 260 && !x.sold)[0]; if (!P) return 'none';
    const d = S.tl[P.crew[1]]; const s0 = d.s[1], bx0 = d.bx, g0 = P.gross, c0 = S.cash;
    tab = 1; pg(); const btn = !!document.querySelector(`[data-a="rr"][data-v="${P.id}"]`);
    act('rr', String(P.id)); const costPaid = c0 - S.cash; const g1 = P.gross;
    for (let i = 0; i < 9; i++) step();
    return { name: P.n, label: lab(P), botonVisible: btn, costoReestreno: costPaid, brutoAntes: fm(g0), brutoDespues: fm(g1), directorHabAntes: s0, directorHabDespues: d.s[1], taquillaDirectorSumada: fm(d.bx - bx0) };
  }));
  // E10 nominee names agreement & E11 ceremonies discarded
  console.log('E10/E11', await p.evaluate(() => {
    S = lo(JSON.parse(SN25)); const fake = new Set(); let maxCer = 0, lost = 0;
    for (let w = 0; w < 52 * 3; w++) { BOT.week2 = 1; step(); Object.values(S.nm).forEach(l => l.forEach(x => { if (!x.u) fake.add(x.n); })); if (S.cer.length > maxCer) maxCer = S.cer.length; if (S.cer.length > 6) lost += S.cer.length - 6; S.cer = []; S.evp = null; if (wk() == 23) S.pj.filter(elg).forEach(p => { for (let f = 0; f < 6; f++) (S.pst[f] = S.pst[f] || []).push(p.id); }); }
    const bad = [...fake].filter(n => /^(Noche|Frontera|Aurora|Sombra|Marea) (eterno|perdido|secreto)$|^Cenizas (eterno|perdido|secreto|final|imposible)$/.test(n));
    return { fakeSample: [...fake].slice(0, 6), badAgreement: bad.slice(0, 6), maxCeremoniesSameWeek: maxCer, ceremoniesLost3y: lost };
  }));
  // E12 talent list cap
  console.log('E12', await p.evaluate(() => { S = lo(JSON.parse(SN25)); tab = 2; pg(); return { textoContador: [...document.querySelectorAll('#app .m')].map(e => e.textContent).find(t => /talentos activos/.test(t)), tarjetasMostradas: document.querySelectorAll('#app canvas.tf').length }; }));
  // E16 hero animation frames while a modal covers the page
  console.log('E16', await p.evaluate(async () => { S = lo(JSON.parse(SN5)); tab = 0; pg(); guide(); let n = 0; const h0 = hero; hero = (t) => { n++; h0(t); }; await new Promise(r => setTimeout(r, 3000)); hero = h0; return { heroRedrawsIn3sWithModalOpen: n }; }));
  console.log('errs', errs);
  await b.close();
})();
