// Prueba de mono: toca botones al azar en pantallas, fichas y ventanas y registra errores y textos rotos.
// Uso: node mono.js HTML [eras] [pasos]
const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const html = process.argv[2], eras = (process.argv[3] || '1780,1930,2026,2180').split(','), pasos = +process.argv[4] || 500;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  let ultimo = '';
  const err = [];
  p.on('pageerror', e => err.push(ultimo + ' → ' + e.message + ' | ' + String(e.stack || '').split('\n').slice(1, 3).join(' ')));
  p.on('console', m => { if (m.type() === 'error') err.push(ultimo + ' → CON ' + m.text()); });
  p.on('dialog', d => d.dismiss().catch(() => {}));
  await p.exposeFunction('marcar', s => { ultimo = s; });
  await p.goto('file://' + html); await p.waitForTimeout(600);
  for (const d of eras) {
    const r = await p.evaluate(async ([d, pasos]) => {
      const out = [], N = ART.n, PB = ART.pruebas;
      ART.juego.nuevaPartida({ semilla: 'mono' + d, anio: +d, nombre: 'Mono', bot: true });
      for (let i = 0; i < 6 * 52; i++) { PB.decidir(PB.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
      const PROHIBIDO = /salir|borrar|nuevaPartida|importar|exportar|descargar|reiniciar|cargar|abrirGuardado|guardar|Borrar|idioma|tema|quiebra|qbSalir|compartir|enlace|url|copiar|pantallaCompleta|reset|instalar/i;
      const malo = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]/;
      let seed = 0; for (const c of String(d)) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
      const azar = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const secciones = ['estudio', 'obras', 'talento', 'mundo', 'negocio'];
      const rotos = {};
      for (let i = 0; i < pasos; i++) {
        try {
          if (i % 40 === 0) { ART.ui.cerrarModal && ART.ui.cerrarModal(); ART.ui.acciones.cerrarFicha && ART.ui.acciones.cerrarFicha(); ART.ui.irA(secciones[Math.floor(azar() * 5)]); }
          if (i % 25 === 0) ART.juego.avanzarSemana();
          const cont = ['modal', 'ficha', 'vista'].map(id => document.getElementById(id)).filter(e => e && (e.id === 'vista' || e.classList.contains('abierta') || e.classList.contains('on') || e.innerHTML.length > 50 && getComputedStyle(e).display !== 'none'));
          const zona = cont[0];
          if (azar() < 0.35) {
            const ins = Array.from(zona.querySelectorAll('select[data-c], input[data-c], input[data-i], textarea[data-c], textarea[data-i]')).filter(e => !e.disabled && !PROHIBIDO.test(e.getAttribute('data-c') || e.getAttribute('data-i') || ''));
            if (ins.length) {
              const el = ins[Math.floor(azar() * ins.length)];
              if (el.tagName === 'SELECT' && el.options.length) el.selectedIndex = Math.floor(azar() * el.options.length);
              else if (el.type === 'number' || el.type === 'range') { const mn = el.min !== '' ? +el.min : 0, mx = el.max !== '' ? +el.max : 100; el.value = String(Math.round(mn + azar() * (mx - mn))); }
              else if (el.type === 'checkbox') el.checked = !el.checked;
              else el.value = ['Prueba', '', 'Ñandú 123', 'x'.repeat(90)][Math.floor(azar() * 4)];
              const etiqueta = d + ' paso ' + i + ' ' + (el.getAttribute('data-c') || el.getAttribute('data-i')) + '<=' + String(el.value).slice(0, 20);
              await window.marcar(etiqueta);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              continue;
            }
          }
          const els = Array.from(zona.querySelectorAll('[data-a]')).filter(e => !e.disabled && !PROHIBIDO.test(e.getAttribute('data-a')));
          if (!els.length) { ART.ui.irA(secciones[Math.floor(azar() * 5)]); continue; }
          const el = els[Math.floor(azar() * els.length)];
          const etiqueta = d + ' paso ' + i + ' ' + el.getAttribute('data-a') + '=' + (el.getAttribute('data-v') || '');
          await window.marcar(etiqueta);
          el.click();
          const txt = zona.innerText || '';
          const m = txt.match(malo);
          if (m) { const k = txt.indexOf(m[0]); const ctx = txt.slice(Math.max(0, k - 60), k + 20).replace(/\s+/g, ' '); if (!rotos[ctx]) { rotos[ctx] = 1; out.push('texto roto tras ' + etiqueta + ': «' + ctx + '»'); } }
        } catch (e) { out.push('excepción paso ' + i + ': ' + e.message); }
      }
      out.unshift(d + ': ' + pasos + ' toques, año final ' + N.anio());
      return out;
    }, [d, pasos]);
    console.log(r.join('\n'));
  }
  const grupos = {};
  err.forEach(e => { const k = e.split(' → ')[1].split(' | ')[0].split('\n')[0]; (grupos[k] = grupos[k] || []).push(e); });
  console.log('errores de página/consola:', err.length, 'distintos:', Object.keys(grupos).length);
  Object.keys(grupos).forEach(k => console.log('× ' + grupos[k].length + ' · ' + grupos[k][0].split('\n').slice(0, 4).join(' ')));
  await b.close();
})();
