const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
  await page.goto('file://' + __dirname + '/ia.html');
  await page.click('[data-a="nuevaPartida"]');
  await page.click('[data-a="empezar"]');
  const medir = () => page.evaluate(() => { const b = id => { const r = document.getElementById(id).getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), Math.round(r.width)]; }; return { app: b('app'), menu: b('menu'), modal: b('modal'), velo: (document.getElementById('velo').classList.add('on'), b('velo')) }; });
  console.log('con inset   ', JSON.stringify(await medir()));
  // Simula un motor sin la propiedad "inset" (Chrome < 87): se ignora la declaración
  await page.evaluate(() => { for (const s of document.styleSheets) for (const r of s.cssRules) if (r.style && r.style.getPropertyValue('inset')) { r.style.removeProperty('inset'); } });
  console.log('sin inset   ', JSON.stringify(await medir()));
  await browser.close();
})();
