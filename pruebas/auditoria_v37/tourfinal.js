const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const SH = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 1600 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  p.on('dialog', d => d.accept());
  await p.goto('file://' + path.join(UP, 'final.html'));
  await p.waitForTimeout(1200);
  await p.click('text=Nueva partida'); await p.waitForTimeout(600);
  fs.writeFileSync(SH + '/final_np_text.txt', await p.evaluate(() => document.body.innerText));
  await p.screenshot({ path: SH + '/final_np1.png' });
  // Start a game with the bot helper and simulate 80 weeks
  await p.evaluate(() => {
    cx(); BOT.nueva({ est: 'normal', y0: 1900 }); S.bot = 0; S.tp = 0;
    for (let i = 0; i < 80; i++) { BOT.decidir(BOT.EST.normal); step(); }
    cx(); tab = 0; pg();
  });
  await p.waitForTimeout(500);
  const subs = await p.evaluate(() => T('subs'));
  const textos = {};
  for (let t = 0; t < 5; t++) {
    for (let s = 0; s < subs[t].length; s++) {
      await p.evaluate(([t, s]) => { irA(t, s); }, [t, s]);
      await p.waitForTimeout(200);
      const nm = t + '_' + s + '_' + subs[t][s].replace(/\W+/g, '');
      await p.screenshot({ path: SH + '/final_' + nm + '.png' });
      textos[nm] = await p.evaluate(() => document.getElementById('main') ? document.getElementById('main').innerText : document.body.innerText);
    }
  }
  fs.writeFileSync(SH + '/final_textos.json', JSON.stringify(textos, null, 1));
  console.log(Object.keys(textos).length, 'errors', JSON.stringify(errs));
  await b.close();
})();
