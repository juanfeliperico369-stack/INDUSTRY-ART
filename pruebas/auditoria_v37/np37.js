const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const SH = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 2600 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto('file://' + path.join(UP, 'v37.html'));
  await p.waitForTimeout(1000);
  await p.click('text=Nueva partida'); await p.waitForTimeout(500);
  const pasos = await p.$$eval('[data-a]', els => els.filter(e => /Lugar|Tu estudio|Tu avatar|La partida/.test(e.innerText)).map(e => [e.getAttribute('data-a'), e.getAttribute('data-v'), e.innerText.replace(/\n/g, ' ')]));
  console.log(JSON.stringify(pasos));
  const out = {};
  for (const [a, v, tx] of pasos) {
    await p.evaluate(([a, v]) => { const el = document.querySelector('[data-a="' + a + '"][data-v="' + v + '"]'); if (el) el.click(); }, [a, v]);
    await p.waitForTimeout(400);
    out[tx] = await p.evaluate(() => document.getElementById('vista').innerText);
    await p.screenshot({ path: SH + '/v37_np_' + v + '.png' });
  }
  fs.writeFileSync(SH + '/v37_np_pasos.json', JSON.stringify(out, null, 1));
  console.log(errs);
  await b.close();
})();
