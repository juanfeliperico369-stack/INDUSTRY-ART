// Click every [data-a] control in every tab and in every modal reached (depth 2), restoring state each time.
const { open } = require('./h.js');
const fs = require('fs');
const BOTSRC = fs.readFileSync(__dirname + '/bot.js', 'utf8');
(async () => {
  const y0 = +(process.argv[2] || 2000);
  const { b, p, errs } = await open();
  await p.evaluate(BOTSRC);
  // Build a rich state: 6 years, rich studio, some features on
  await p.evaluate((y0) => {
    BOT.start({ y0, cap: 1e9 });
    for (let w = 0; w < 52 * 6; w++) {
      if (S.t % 5 == 0) BOT.create(S.t % 10 == 0 ? 0 : [1, 2, 3, 4, 5][(S.t / 5) % 5], 0.02);
      S.pj.filter(x => x.st == 1).forEach(x => BOT.release(x.id));
      BOT.week({ step: 0, n: 0 });
    }
    S.cash = 5e10;
    act('svon'); act('cbon'); act('cba'); act('th', 0); act('ag', 1); act('buy', 0); act('ivb', 1);
    // pending: event, ceremonies
    S.t = Math.floor(S.t / 52) * 52 + 22; // week 23
    window.SNAP = JSON.stringify(S);
  }, y0);
  const restore = async (t) => p.evaluate((t) => { S = lo(JSON.parse(SNAP)); W = {}; PL = {}; FRS = { f: null, s: null, sell: 0, pp: 100 }; CN = { id: null, t: 1 }; SU = null; fil = { r: -1, s: 'o', q: '' }; CE = []; cx(); tab = t; pg(); }, t);
  const list = async (sel) => p.evaluate((sel) => [...document.querySelectorAll(sel + ' [data-a]')].map((e, i) => [i, e.dataset.a, e.dataset.v, e.disabled]), sel);
  const SKIP = new Set(['exit', 'new', 'back', 'del', 'cont', 'tab']);
  let count = 0; const errAt = [];
  const click = async (sel, i) => { const before = errs.length; await p.evaluate(({ sel, i }) => { const e = document.querySelectorAll(sel + ' [data-a]')[i]; if (e) { e.disabled = false; e.click(); } }, { sel, i }); count++; return before; };
  for (let t = 0; t < 7; t++) {
    await restore(t);
    const L1 = (await list('#app')).filter(x => !SKIP.has(x[1]));
    for (const [i, a, v] of L1) {
      await restore(t);
      const before = await click('#app', i);
      if (errs.length > before) errAt.push(`tab${t} ${a}(${v}): ` + errs.slice(before).join(' || '));
      const modal = await p.evaluate(() => document.querySelector('#md').style.display == 'block');
      if (!modal) continue;
      const L2 = (await list('#md')).filter(x => !SKIP.has(x[1]));
      for (const [j, a2, v2] of L2.slice(0, 60)) {
        await restore(t);
        await click('#app', i);
        // also fire change on selects/inputs in modal
        const before2 = await click('#md', j);
        if (errs.length > before2) errAt.push(`tab${t} ${a}(${v}) > ${a2}(${v2}): ` + errs.slice(before2).join(' || '));
        // depth 3 for modals opened from modals
        const L3 = (await list('#md')).filter(x => !SKIP.has(x[1])).slice(0, 25);
        for (const [k, a3, v3] of L3) {
          const before3 = await click('#md', k);
          if (errs.length > before3) errAt.push(`tab${t} ${a}(${v}) > ${a2}(${v2}) > ${a3}(${v3}): ` + errs.slice(before3).join(' || '));
          break; // only first at depth 3 to keep time bounded
        }
      }
    }
  }
  // fire change/input events on every select/input in every tab
  for (let t = 0; t < 7; t++) {
    await restore(t);
    const n = await p.evaluate(() => document.querySelectorAll('#app select, #app input, #app textarea').length);
    for (let i = 0; i < n; i++) {
      await restore(t);
      const before = errs.length;
      await p.evaluate((i) => { const e = document.querySelectorAll('#app select, #app input, #app textarea')[i]; if (!e) return; if (e.tagName == 'SELECT') { e.selectedIndex = e.options.length - 1; } else if (e.type == 'range') { e.value = e.max; } else { e.value = 'zz'; } e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, i);
      if (errs.length > before) errAt.push(`tab${t} input#${i}: ` + errs.slice(before).join(' || '));
    }
  }
  console.log('clicks', count);
  console.log([...new Set(errAt)].join('\n'));
  await b.close();
})();
