const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const { b, p, errs } = await open();
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(BOTSRC);
  await p.evaluate(() => { localStorage.clear(); BOT.start({ y0: 1850, cap: 1e6 }); });
  for (let y = 1; y <= 200; y++) await p.evaluate(() => { for (let w = 0; w < 52; w++) { if (S.t % 6 == 0) BOT.create(yr() >= 1900 ? 0 : 3, 0.1); S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id)); BOT.week({ step: 0, n: 0 }); } });
  await p.evaluate(() => { window.SNX = JSON.stringify(S); });
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
  await cdp.send('Profiler.start');
  const t = await p.evaluate(() => { const t0 = performance.now(); for (let i = 0; i < 208; i++) { step(); S.cer = []; S.evp = null; } return (performance.now() - t0) / 4; });
  const { profile } = await cdp.send('Profiler.stop');
  // self time per function
  const dt = profile.timeDeltas; const self = {}; const byId = {}; profile.nodes.forEach(n => byId[n.id] = n);
  profile.samples.forEach((id, i) => { const n = byId[id]; const k = (n.callFrame.functionName || '(anon)') + ':' + (n.callFrame.lineNumber + 1); self[k] = (self[k] || 0) + (dt[i] || 0); });
  const tot = Object.values(self).reduce((a, b) => a + b, 0);
  console.log('ms per simulated year incl. lo/parse', t.toFixed(1), 'state', await p.evaluate(() => ({ y: yr(), pj: S.pj.length, tl: S.tl.length })));
  console.log(Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => k + ' ' + (v / tot * 100).toFixed(1) + '%').join('\n'));
  await b.close();
})();
