const { open, newGame, closeModal, measure } = require('./h.js');
async function makeWork(p, media, opts = {}) {
  await p.click('#nav [data-v="1"]');
  await p.click('[data-a="npm"]');
  await p.click('[data-a="np"]');
  if (media != null) { await p.selectOption('#w-m', String(media)); }
  const m = await measure(p, '#md');
  if (opts.name != null) { await p.fill('#w-n', opts.name); await p.dispatchEvent('#w-n', 'input'); }
  await p.click('#md [data-a="tg"] >> nth=0');
  await p.click('#md [data-a="pkO"][data-v="pa"]');
  await p.click('#pc [data-a="pkS"] >> nth=0');
  await p.click('[data-a="pkD"]');
  // fiction requires arc
  const needAr = await p.evaluate(() => W.rl && !W.ar.length);
  if (needAr) { await p.click('#md [data-a="pkO"][data-v="ar"]'); await p.click('#pc [data-a="pkS"] >> nth=0'); await p.click('[data-a="pkD"]'); }
  if (opts.bv != null) { await p.evaluate(v => { document.querySelector('#w-b').value = v; wu(); }, opts.bv); }
  // crew: pick first non-empty option for each role select, prefer non-avatar
  const roles = await p.evaluate(() => MD[W.m][1]);
  for (const r of roles) {
    const vals = await p.$$eval(`#w-r${r} option`, os => os.map(o => o.value).filter(v => v !== ''));
    const pick = vals.find(v => v != '72') || vals[0];
    await p.selectOption(`#w-r${r}`, pick);
  }
  const st = await p.evaluate(() => ({ err: document.querySelector('#w-s').innerText, dis: document.querySelector('[data-a="go"]').disabled }));
  return { m, st };
}
module.exports = { makeWork };
if (require.main === module) (async () => {
  const { b, p, errs } = await open();
  await newGame(p, {});
  await closeModal(p);
  for (const media of [0, 3, 5]) {
    const r = await makeWork(p, media);
    console.log('wizard media', media, JSON.stringify(r.m), r.st);
    if (!r.st.dis) { await p.click('[data-a="go"]'); }
    else await closeModal(p);
    await p.waitForTimeout(100);
  }
  console.log(await p.evaluate(() => S.pj.map(x => [x.id, x.n, x.m, x.bud, x.paid, x.pl, x.st])), await p.evaluate(() => S.cash));
  console.log(errs);
  await b.close();
})();
