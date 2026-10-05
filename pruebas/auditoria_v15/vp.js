const { open, newGame, closeModal, measure } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  for (const vp of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1366, height: 768 }]) {
    const { b, p, errs } = await open(vp);
    const tag = vp.width + 'x' + vp.height;
    await p.click('[data-a="new"]');
    await p.screenshot({ path: `vp_${tag}_nuevo.png` });
    const covNew = await p.evaluate(() => { const hc = document.querySelector('#hc').getBoundingClientRect(); return { stickyHero: Math.round(hc.height), useful: innerHeight - Math.round(hc.height) }; });
    await p.click('[data-a="start"]'); await p.waitForTimeout(150);
    await closeModal(p);
    await p.evaluate(BOTSRC);
    await p.evaluate(() => { for (let w = 0; w < 30; w++) { if (S.t % 6 == 0) BOT.create(0, 0.05); S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); } pg(); });
    const out = { tag, covNew };
    for (const t of [0, 1, 2, 4]) {
      await p.evaluate(t => { tab = t; pg(); scrollTo(0, 0); }, t); await p.waitForTimeout(100);
      await p.screenshot({ path: `vp_${tag}_tab${t}.png` });
      out['tab' + t] = await p.evaluate(() => { const nav = document.querySelector('#nav').getBoundingClientRect(); const st = [...document.querySelectorAll('#app *')].filter(e => getComputedStyle(e).position == 'sticky').map(e => Math.round(e.getBoundingClientRect().height)); const app = document.querySelector('#app').getBoundingClientRect(); return { navH: Math.round(nav.height), sticky: st, useful: innerHeight - Math.round(nav.height) - st.reduce((a, b) => a + b, 0), contentW: Math.round(app.width), pageH: document.documentElement.scrollHeight }; });
    }
    // modal: wizard
    await p.evaluate(() => { act('np'); }); await p.waitForTimeout(100);
    await p.screenshot({ path: `vp_${tag}_wizard.png` });
    out.wizard = await p.evaluate(() => ({ h: document.querySelector('#md').scrollHeight, w: Math.round(document.querySelector('#md > div').getBoundingClientRect().width) }));
    console.log(JSON.stringify(out));
    console.log('errs', errs);
    await b.close();
  }
})();
