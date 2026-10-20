const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const SH = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 1600 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
  await p.goto('file://' + path.join(UP, 'v37.html'));
  await p.waitForTimeout(1000);
  const out = await p.evaluate(() => {
    ART.juego.nuevaPartida({ semilla: 'crear', anio: 2010, nombre: 'Crear', avatar: { nombre: 'Yo' } });
    const U = ART.ui, A = U.acciones; U.render(); U.cerrarModal();
    const txt = () => ['vista', 'modal', 'ficha'].map(id => { const e = document.getElementById(id); return e ? e.innerText : ''; }).join('\n=====\n');
    const r = {};
    // Menú crear obra
    A.crearObra('cine'); r.menuCrear = txt();
    A.crCamino('nueva'); r.cine_inicio = txt();
    for (let i = 0; i < 14; i++) { try { A.crTab(String(i)); r['cine_tab' + i] = txt(); } catch (e) { r['cine_tab' + i] = 'ERR ' + e.message; } }
    U.cerrarModal();
    A.crearObra('tv'); A.crCamino('nueva');
    for (let i = 0; i < 14; i++) { try { A.crTab(String(i)); r['tv_tab' + i] = txt(); } catch (e) { r['tv_tab' + i] = 'ERR ' + e.message; } }
    U.cerrarModal();
    for (const med of ['musica', 'juegos', 'teatro', 'libros']) {
      try { A.crearObra(med); A.crCamino('nueva'); } catch (e) { r[med] = 'ERR ' + e.message; continue; }
      for (const tb of ['idea', 'historia', 'publico', 'personajes', 'arte', 'produccion', 'equipo', 'resumen']) { try { A.mdTab(tb); r[med + '_' + tb] = txt(); } catch (e) { r[med + '_' + tb] = 'ERR ' + e.message; } }
      U.cerrarModal();
    }
    return r;
  });
  fs.writeFileSync(SH + '/v37_crear.json', JSON.stringify(out, null, 1));
  console.log(Object.keys(out).length, 'errors', JSON.stringify(errs));
  await b.close();
})();
