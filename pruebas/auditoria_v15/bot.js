// injected into page: defines window.BOT
window.BOT = {
  start(o) {
    o = Object.assign({ fn: 'Bot', pn: 'Bot', sn: 'Bot Studio', sp: [1, 0, 3], tier: 50, tg: 'Normal - Normal', ind: 3, vis: 2, pu: 0, lg: { s: 8, c: 6, b: 14, t: 3, f: 1 }, cap: 1e6, y0: 1900, df: 1 }, o);
    S = mkGame(o); lo(S); S.df = o.df; nws(S.sn + ' abre sus puertas.'); tab = 0;
    return S.cash;
  },
  create(m, frac, avoidYou = true) {
    act('np');
    if (W.m != m) { const e = document.querySelector('#w-m'); if (MD[m][2] > yr()) { cx(); return 'locked'; } e.value = m; wu(1); }
    W.g = [0]; W.pa = [0]; if (W.rl) W.ar = [0];
    const md = MD[W.m], t = Math.max(md[3], S.cash * frac);
    W.bv = cl(Math.round(1000 * Math.log(t / md[3]) / Math.log(md[4] / md[3])), 0, 1000);
    const used = {};
    md[1].forEach(r => {
      const c = S.tl.filter(x => !x.ret && !x.es && x.e >= 20 + 20 * (used[x.id] || 0) && !(avoidYou && x.you)).sort((a, b) => b.s[r] - a.s[r] - (used[b.id] ? 0 : 0))[0];
      W.crew[r] = c ? c.id : undefined; if (c) used[c.id] = (used[c.id] || 0) + 1;
    });
    wz();
    const btn = document.querySelector('[data-a="go"]');
    if (!btn || btn.disabled) { const e = document.querySelector('#w-s').innerText; cx(); return 'err ' + e.split('\n').slice(-2).join(' '); }
    act('go'); return 'ok';
  },
  release(id, mk = [0, 1, 2, 3, 4, 5]) {
    PL = { id, mk: mk.slice(), rf: 0, roy: 45, k: 1 }; pl();
    const P = pj(id); let c = PL.mk.reduce((a, i) => a + MK[i][1] * P.bud, 0);
    while (c > S.cash && PL.mk.length) { PL.mk.pop(); c = PL.mk.reduce((a, i) => a + MK[i][1] * P.bud, 0); pu(); }
    act('rl'); cx();
  },
  week(T) {
    const t0 = performance.now(); step(); T.step += performance.now() - t0; T.n++;
    hit();
    if (S.cer.length) S.cer = [];
    if (S.ys && !S.ys.seen) S.ys.seen = 1;
    if (S.dres && !S.dres.seen) S.dres.seen = 1;
    if (S.evp != null) { const e = EVT[S.evp]; e[3][1][1](); S.evp = null; }
    S.gq.length = 0;
    // festivals postulation
    if (wk() == 23) S.pj.filter(elg).forEach(p => { for (let f = 0; f < 6; f++) { const L = (S.pst[f] = S.pst[f] || []); if (!L.includes(p.id) && S.cash > p.cost * 0.005) { L.push(p.id); S.cash -= Math.round(p.cost * 0.005); } } });
  },
  scanNaN() {
    const bad = []; const seen = new Set();
    const walk = (o, path) => {
      if (o === null || typeof o != 'object') { if (typeof o == 'number' && !isFinite(o)) bad.push(path + '=' + o); return; }
      if (seen.has(o)) return; seen.add(o);
      for (const k in o) { if (bad.length > 30) return; walk(o[k], path + '.' + k); }
    };
    walk(S, 'S'); return bad;
  },
};
