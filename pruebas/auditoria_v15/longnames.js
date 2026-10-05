const { open, newGame, closeModal } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  const L = 'Supercalifragilisticoespialidoso'.repeat(5);
  await newGame(p, { f1: L, f2: L });
  await closeModal(p);
  await p.evaluate(BOTSRC);
  await p.evaluate((L) => {
    act('np'); W.nm = L + ' ' + L; W.g = [0]; W.pa = [0]; W.ar = [0];
    MD[0][1].forEach(r => { W.crew[r] = S.tl.filter(t => !t.you && !t.ret).sort((a, b) => b.s[r] - a.s[r])[r].id; }); wz(); act('go');
    for (let i = 0; i < 70; i++) { S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); }
  }, L);
  const res = [];
  for (const t of [0, 1, 2, 3, 4, 5, 6]) { await p.evaluate(t => { tab = t; pg(); }, t); await p.waitForTimeout(60); res.push('tab' + t + ':' + await p.evaluate(() => document.documentElement.scrollWidth)); }
  await p.evaluate(() => { tab = 1; pg(); }); await p.screenshot({ path: 'longname_tab1.png' });
  for (const a of [['det', 1], ['fro', 1], ['cnt', 1], ['cr', '']]) { await p.evaluate(a => act(a[0], String(a[1])), a); await p.waitForTimeout(60); res.push(a[0] + ':' + await p.evaluate(() => { const m = document.querySelector('#md'); return m.scrollWidth + '/' + innerWidth; })); if (a[0] == 'det') await p.screenshot({ path: 'longname_det.png' }); await p.evaluate(() => cx()); }
  console.log(res.join('  '), 'innerWidth 390', errs);
  await b.close();
})();
