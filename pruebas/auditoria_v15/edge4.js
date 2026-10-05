const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  const q = await p.evaluate(() => { localStorage.clear(); let n = 0; const s = 'x'.repeat(100000); try { for (; n < 200; n++) localStorage.setItem('q' + n, s); } catch (e) { } for (let i = 0; i < n; i++) localStorage.removeItem('q' + i); return n * 100000; });
  console.log('localStorage quota approx chars', q);
  await p.evaluate(() => { localStorage.clear(); BOT.start({ y0: 1900, cap: 1e6 }); });
  for (let y = 0; y < 75; y++) await p.evaluate(() => { for (let w = 0; w < 52; w++) { if (S.t % 6 == 0) BOT.create(0, 0.1); S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); } });
  const r = await p.evaluate(async () => {
    const out = {};
    tab = 6; pg();
    out.size = JSON.stringify(S).length; out.year = yr();
    act('save', '1'); out.toast1 = document.querySelector('#ts').textContent;
    out.slot1ok = !!ld(1) && ld(1).t == S.t;
    // play 1 more year and save again to slot 1 -> does it really save?
    for (let w = 0; w < 52; w++) BOT.week({ step: 0, n: 0 });
    act('save', '1');
    await new Promise(r => setTimeout(r, 100));
    out.toast2 = document.querySelector('#ts').textContent;
    const s1 = ld(1); out.slot1AfterSecondSave = s1 ? ('t=' + s1.t + ' vs S.t=' + S.t) : null;
    adv(1); await new Promise(r => setTimeout(r, 100));
    const a = ld('auto'); out.autoAfterAdv = a ? ('t=' + a.t + ' vs S.t=' + S.t) : null; out.toast3 = document.querySelector('#ts').textContent;
    out.lsKeys = Object.keys(localStorage).map(k => k + ':' + localStorage.getItem(k).length);
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  // reload page: what does "Continuar" give?
  await p.reload(); await p.waitForTimeout(300);
  const r2 = await p.evaluate(() => { const a = ld('auto'); const s1 = ld(1); return { menuText: document.querySelector('#app').innerText.slice(0, 200), autoYear: a && (a.y0 + Math.floor(a.t / 52)), slot1Year: s1 && (s1.y0 + Math.floor(s1.t / 52)) }; });
  console.log('after reload', r2);
  console.log('errs', errs);
  await b.close();
})();
