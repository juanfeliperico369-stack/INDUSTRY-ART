const { open, newGame, closeModal } = require('./h.js');
(async () => {
  const { b, p, errs } = await open();
  const L = 'Supercalifragilisticoespialidoso'.repeat(5);
  await newGame(p, { f1: L, f2: L });
  await closeModal(p);
  await p.waitForTimeout(500);
  const info = await p.evaluate(() => { const c = document.querySelector('#hc'); return { cw: c.clientWidth, w: c.width, h: c.height, docW: document.documentElement.scrollWidth }; });
  await p.screenshot({ path: 'hero_long.png', clip: { x: 0, y: 0, width: 390, height: 200 } });
  console.log(info, errs);
  await b.close();
})();
