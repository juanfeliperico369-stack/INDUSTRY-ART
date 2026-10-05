const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  await p.evaluate(() => { localStorage.clear(); BOT.start({ y0: 1900, cap: 1e6 }); });
  for (let y = 0; y < 60; y++) await p.evaluate(() => { for (let w = 0; w < 52; w++) { if (S.t % 6 == 0) BOT.create(0, 0.1); S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); } });
  const r = await p.evaluate(async () => {
    const out = {}; const T = () => document.querySelector('#ts').textContent; const sleep = ms => new Promise(r => setTimeout(r, ms));
    tab = 6; pg(); out.size = JSON.stringify(S).length; out.year = yr();
    sv('auto');
    act('save', '1'); await sleep(100); out.save1 = [T(), ld(1) ? 'slot1 t=' + ld(1).t : 'slot1 vacío'];
    act('save', '2'); await sleep(100); out.save2 = [T(), ld(2) ? 'slot2 t=' + ld(2).t : 'slot2 vacío'];
    act('save', '2'); await sleep(100); out.save2again = [T(), ld(2) ? 'slot2 t=' + ld(2).t : 'slot2 vacío'];
    // continue playing 2 years with autosave each week (adv) -> auto save may fail silently
    for (let i = 0; i < 104; i++) { adv(1); cx(); }
    await sleep(100);
    const a = ld('auto'); out.autoAfter2y = (a ? 'auto t=' + a.t : 'auto vacío') + ' / S.t=' + S.t + ' / tamaño ahora ' + JSON.stringify(S).length; out.lastToast = T();
    out.memFallback = Object.keys(M);
    out.lsKeys = Object.keys(localStorage).map(k => k + ':' + localStorage.getItem(k).length);
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await p.reload(); await p.waitForTimeout(300);
  console.log('after reload menu:', await p.evaluate(() => document.querySelector('#app').innerText.replace(/\n+/g, ' | ').slice(0, 250)));
  console.log('errs', errs);
  await b.close();
})();
