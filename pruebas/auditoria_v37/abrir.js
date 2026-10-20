const { chromium } = require('playwright');
const path = require('path');
const UP = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const [nombre, f] of [['v37', 'v37.html'], ['final', 'final.html']]) {
    for (const vp of [[390, 844], [1366, 768]]) {
      const p = await b.newPage({ viewport: { width: vp[0], height: vp[1] } });
      const errs = [];
      p.on('pageerror', e => errs.push('pageerror: ' + e.message));
      p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
      p.on('requestfailed', r => errs.push('reqfail: ' + r.url().slice(0, 120)));
      p.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) errs.push('NET: ' + r.url()); });
      const t0 = Date.now();
      await p.goto('file://' + path.join(UP, f));
      await p.waitForTimeout(2500);
      console.log(nombre, vp.join('x'), 'load ms', Date.now() - t0, 'errors:', JSON.stringify(errs));
      await p.screenshot({ path: path.join(UP, '..', 'shots', `${nombre}_menu_${vp[0]}.png`) });
      const txt = await p.evaluate(() => document.body.innerText.slice(0, 1500));
      console.log(txt.replace(/\n+/g, ' | '));
      await p.close();
    }
  }
  await b.close();
})();
