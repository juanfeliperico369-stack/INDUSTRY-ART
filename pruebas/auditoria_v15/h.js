const { chromium } = require('playwright');
const URL = 'file:///home/user/INDUSTRY-ART/legado/INDUSTRY_ART_v15.html';
async function open(vp = { width: 390, height: 844 }, opts = {}) {
  const b = opts.browser || await chromium.launch();
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: opts.dpr || 1, hasTouch: !!opts.touch, isMobile: !!opts.mobile });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' @ ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ' ' + m.text()); });
  p.on('dialog', d => { errs.push('DIALOG ' + d.message()); d.dismiss(); });
  await p.goto(URL);
  await p.waitForTimeout(300);
  return { b, ctx, p, errs };
}
// start a new game through the UI
async function newGame(p, o = {}) {
  await p.click('[data-a="new"]');
  if (o.f1 != null) await p.fill('#f1', o.f1);
  if (o.f2 != null) await p.fill('#f2', o.f2);
  if (o.cap != null) await p.selectOption('#ncap', String(o.cap));
  if (o.y0 != null) await p.selectOption('#nera', String(o.y0));
  if (o.df != null) await p.selectOption('#ndf', String(o.df));
  await p.click('[data-a="start"]');
  await p.waitForTimeout(200);
}
async function closeModal(p) {
  await p.evaluate(() => { const m = document.querySelector('#md'); if (m && m.style.display == 'block') { const x = m.querySelector('[data-a="x"],[data-a="nx"]'); if (x) x.click(); else cx(); } });
}
// measure small controls and small texts in visible document (page or modal)
async function measure(p, rootSel) {
  return await p.evaluate((rootSel) => {
    const root = rootSel ? document.querySelector(rootSel) : document.body;
    const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display != 'none' && cs.visibility != 'hidden'; };
    const ctl = [...root.querySelectorAll('button,select,input,textarea,a,[data-a],[onclick],[onchange]')].filter(vis);
    const uniq = [...new Set(ctl)];
    const small = uniq.filter(el => { const r = el.getBoundingClientRect(); return Math.min(r.width, r.height) < 44; });
    const hist = {};
    small.forEach(el => { const r = el.getBoundingClientRect(); const k = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '') + ' ' + Math.round(r.height) + 'px'; hist[k] = (hist[k] || 0) + 1; });
    // texts
    const all = [...root.querySelectorAll('*')].filter(el => [...el.childNodes].some(n => n.nodeType == 3 && n.textContent.trim()) && vis(el));
    const sm = all.filter(el => parseFloat(getComputedStyle(el).fontSize) < 14);
    const fs = {};
    sm.forEach(el => { const k = getComputedStyle(el).fontSize; fs[k] = (fs[k] || 0) + 1; });
    const H = rootSel ? root.scrollHeight : document.documentElement.scrollHeight;
    const W = document.documentElement.scrollWidth;
    return { controls: uniq.length, small: small.length, hist, texts: all.length, smallTexts: sm.length, fs, height: H, scrollW: W, vw: innerWidth };
  }, rootSel);
}
module.exports = { open, newGame, closeModal, measure, URL };
