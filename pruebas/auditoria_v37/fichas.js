const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const UP = process.argv[2]; const SH = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 2400 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto('file://' + path.join(UP, 'v37.html')); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    ART.juego.nuevaPartida({ semilla: 'fichas', anio: 1990, nombre: 'Fichas', avatar: { nombre: 'Yo' } });
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal; for (let i = 0; i < 260; i++) { P.decidir(est); ART.juego.avanzarSemana(); }
    const U = ART.ui, A = U.acciones, S = ART.n.S; U.render(); U.cerrarModal();
    const txt = () => ['ficha', 'modal'].map(id => document.getElementById(id).innerText).join('\n=====\n');
    const r = {};
    const ob = S.obras.filter(o => o.est === 0 && o.et === 'terminada').sort((a, b) => (b.bruto || 0) - (a.bruto || 0))[0];
    if (ob) { A.verObra(String(ob.id)); r.obra = txt(); U.cerrarFicha(); }
    const fl = ART.franquicias.lista ? ART.franquicias.lista() : null;
    r.franqKeys = Object.keys(ART.franquicias);
    const fr = (S.franq && S.franq.lista || []).filter(f => f.est === 0 || f.dueno === 0)[0] || (S.franq && S.franq.lista || [])[0];
    if (fr) { try { (A.verFranquicia || A.frVer || A.tvVerFr || function () {})(String(fr.id)); r.franq = txt(); } catch (e) { r.franq = 'ERR ' + e.message; } U.cerrarFicha(); U.cerrarModal(); }
    const tal = S.talentos.filter(t => !t.ret).sort((a, b) => b.hab - a.hab)[0];
    A.verTalento(String(tal.id)); r.talento = txt(); U.cerrarFicha();
    U.irA('talento', 'avatar'); r.avatar = document.getElementById('vista').innerText;
    U.irA('mundo', 'periodico'); r.periodico = document.getElementById('vista').innerText;
    U.irA('obras', 'franquicias'); r.franquicias = document.getElementById('vista').innerText;
    r.acciones = Object.keys(A).filter(k => /fr|Fr|franq/i.test(k)).join(',');
    return r;
  });
  fs.writeFileSync(SH + '/v37_fichas.json', JSON.stringify(out, null, 1));
  console.log(Object.keys(out), errs);
  await b.close();
})();
