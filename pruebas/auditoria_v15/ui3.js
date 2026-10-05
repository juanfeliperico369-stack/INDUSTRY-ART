const { open, newGame, closeModal, measure } = require('./h.js');
const { makeWork } = require('./ui2.js');
async function drainModals(p, log) {
  for (let i = 0; i < 30; i++) {
    const s = await p.evaluate(() => { const m = document.querySelector('#md'); if (m.style.display != 'block') return null; const h = m.querySelector('h2'); return h ? h.innerText : '?'; });
    if (!s) return;
    log.push('modal: ' + s);
    const has = async sel => !!(await p.$('#md ' + sel));
    if (await has('[data-a="rv"]')) { await p.click('#md [data-a="rv"]'); await p.waitForTimeout(50); }
    if (await has('[data-a="nx"]')) { await p.click('#md [data-a="nx"]'); continue; }
    if (await has('[data-a="evo"]')) { await p.click('#md [data-a="evo"] >> nth=1'); continue; }
    if (await has('[data-a="x"]')) { await p.click('#md [data-a="x"]'); continue; }
    await p.evaluate(() => cx());
  }
}
module.exports = { drainModals };
if (require.main === module) (async () => {
  const { b, p, errs } = await open();
  const log = [];
  await newGame(p, {});
  await closeModal(p);
  for (const media of [0, 2, 3, 4]) {
    const r = await makeWork(p, media);
    if (!r.st.dis) await p.click('[data-a="go"]'); else { log.push('cannot create media ' + media + ' ' + r.st.err.slice(-200)); await closeModal(p); }
  }
  for (let w = 0; w < 120; w++) {
    // release ready works
    const ready = await p.evaluate(() => S.pj.filter(x => x.st == 1).map(x => x.id));
    for (const id of ready) {
      await p.click('#nav [data-v="1"]');
      await p.click(`[data-a="plan"][data-v="${id}"]`);
      await p.click('#md [data-a="pm"] >> nth=0');
      await p.click('#md [data-a="pm"] >> nth=1');
      await p.click('#md [data-a="rl"]');
    }
    // postulate at week 23
    if (await p.evaluate(() => wk() == 23)) {
      await p.click('#nav [data-v="4"]');
      const pts = await p.$$('[data-a="pt"]');
      if (pts.length) { await pts[0].click(); log.push('postulated'); }
    }
    await p.click('[data-a="adv"][data-v="1"]');
    await drainModals(p, log);
    if (w % 20 == 10) { const r = await makeWork(p, w % 40 == 10 ? 0 : 5); if (!r.st.dis) await p.click('[data-a="go"]'); else await closeModal(p); }
  }
  console.log(await p.evaluate(() => ({ y: yr(), wk: wk(), cash: S.cash, rev: S.rev, pj: S.pj.map(x => [x.n, x.m, x.st, Math.round(x.gross || 0), Math.round(x.cost || 0), x.aw.length]), win: S.win, nom: S.nom })));
  console.log([...new Set(log)].slice(0, 60), log.length);
  console.log('ERRS', errs);
  await b.close();
})();
