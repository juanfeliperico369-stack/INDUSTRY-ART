const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (['error','warning'].includes(m.type())) errs.push(m.type() + ' ' + m.text()); });
  await p.goto('file:///home/user/INDUSTRY-ART/legado/INDUSTRY_ART_v15.html');
  await p.waitForTimeout(500);
  console.log(await p.evaluate(() => typeof S + ' ' + typeof adv + ' ' + typeof step + ' ' + typeof mkGame));
  console.log(errs);
  await b.close();
})();
