const { open, newGame, closeModal } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  // E1: XSS through player name in wizard error list
  {
    const { b, p, errs } = await open();
    await newGame(p, { f1: '<img src=x onerror="window.__xss=(window.__xss||0)+1">' });
    await closeModal(p);
    // enroll yourself in academy
    await p.evaluate(() => { act('stu', 72); act('suc'); });
    const studying = await p.evaluate(() => !!S.tl[72].es);
    await p.click('#nav [data-v="1"]'); await p.click('[data-a="npm"]'); await p.click('[data-a="np"]');
    await p.selectOption('#w-r1', '72');
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => ({ xss: window.__xss || 0, html: document.querySelector('#w-s').innerHTML.slice(-300) }));
    console.log('E1 XSS player name -> studying:', studying, r);
    // also: project name with html through all screens
    await b.close();
  }
  // E1b: project/franchise/studio names with HTML across all screens
  {
    const { b, p, errs } = await open();
    await p.evaluate(BOTSRC);
    const n = await p.evaluate(() => {
      BOT.start({ y0: 2000, cap: 1e9, sn: '<b onmouseover=1>S</b><img src=x onerror="window.__x1=(window.__x1||0)+1">', pn: '<img src=x onerror="window.__x2=(window.__x2||0)+1">' });
      act('np'); W.nm = '<img src=x onerror="window.__x3=(window.__x3||0)+1">'; W.g = [0]; W.pa = [0]; W.ar = [0];
      MD[0][1].forEach(r => { W.crew[r] = S.tl.filter(t => !t.you && !t.ret).sort((a, b) => b.s[r] - a.s[r])[r].id; });
      wz(); act('go');
      for (let i = 0; i < 80; i++) { S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); }
      frG(S.pj[0].fid).n = '<img src=x onerror="window.__x4=(window.__x4||0)+1">';
      return S.pj.length;
    });
    for (let t = 0; t < 7; t++) { await p.evaluate(t => { tab = t; pg(); }, t); await p.waitForTimeout(80); }
    await p.evaluate(() => { fil.pv = 1; tab = 1; pg(); });
    await p.waitForTimeout(80);
    for (const a of [['det', 1], ['fro', 1], ['cnt', 1], ['ada', 1], ['lic', 1], ['cr', ''], ['xom', 1]]) { await p.evaluate(a => { act(a[0], String(a[1])); }, a); await p.waitForTimeout(80); await p.evaluate(() => cx()); }
    await p.evaluate(() => { S.ys = { y: 2000, rv: 1, dc: 1, n: 1, bst: S.pj[0].n, seen: 0 }; ybx(); });
    await p.waitForTimeout(80);
    console.log('E1b injected counters:', await p.evaluate(() => [window.__x1, window.__x2, window.__x3, window.__x4]), 'errs', errs);
    await b.close();
  }
  await new Promise(r => setTimeout(r, 10));
})();
