const { open, newGame, closeModal, measure } = require('./h.js');
(async () => {
  const { b, p, errs } = await open();
  await p.screenshot({ path: 'shot_menu.png' });
  await newGame(p, {});
  console.log('after start, modal?', await p.evaluate(() => document.querySelector('#md').style.display), await measure(p, '#md'));
  await p.screenshot({ path: 'shot_guide.png' });
  await closeModal(p);
  for (let t = 0; t < 7; t++) {
    await p.click(`#nav [data-v="${t}"]`);
    await p.waitForTimeout(150);
    const m = await measure(p);
    console.log('TAB', t, JSON.stringify(m));
  }
  console.log(errs);
  await b.close();
})();
