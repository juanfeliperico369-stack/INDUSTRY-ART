const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 1400 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const N = ART.n, F = ART.franquicias, J = ART.juego, out = {};
    J.nuevaPartida({ semilla: 'franq', anio: 1995, nombre: 'Fr', capital: 5e9, avatar: { nombre: 'Yo' } }); ART.ui.cerrarModal();
    const P = ART.pruebas, est = P.ESTRATEGIAS.normal;
    for (let i = 0; i < 160; i++) { P.decidir(est); J.avanzarSemana(); }
    const S = N.S; S.estudios[0].caja = 1e12; ART.negocio.capacidad = function () { return 99; };
    const mias = S.obras.filter(o => o.est === 0 && o.pub !== undefined).slice(0, 5);
    out.obras = mias.length;
    mias.forEach((o, i) => F.registrar(o.id, 'Saga ' + i, o.gen[0]));
    const fs = mias.map(o => F.de(o));
    const lanzar = (rb) => { const x = J.iniciarObra(rb.b); return x && x.error ? x.error : ''; };
    // Ramas: precuela, spinoff, remake, paralela
    out.err = [];
    ['precuela', 'spinoff', 'remake', 'paralela', 'secuela'].forEach(c => { const rb = F.continuar(mias[0].id, c); if (rb.error) out.err.push(c + ':' + rb.error); else { const e = lanzar(rb); if (e) out.err.push(c + ' ini:' + e); } });
    // Crossovers: 3 permitidos, el cuarto no
    out.xo = [F.crossover(fs[0].id, fs[1].id), F.crossover(fs[0].id, fs[2].id), F.crossover(fs[0].id, fs[3].id), F.crossover(fs[0].id, fs[4].id)];
    const g = F.continuarCruce(fs[0].id, [fs[1].id, fs[2].id, fs[3].id].join(','));
    out.gran = g.error || g.b.tit; if (!g.error) { const e = lanzar(g); if (e) out.err.push('gran ini:' + e); }
    for (let i = 0; i < 80; i++) J.avanzarSemana();
    const cn = F.canon(fs[0]);
    out.ramas = cn.ramas.map(r => (r.nivel ? '  '.repeat(r.nivel) + '↳ ' : '') + r.c.nom + ' [' + r.obras.map(o => o.tit + (o.cam ? '/' + o.cam : '')).join(' | ') + ']');
    out.enSocio = F.canon(fs[2]).ramas[0].obras.map(o => o.tit);
    const pre = S.obras.filter(o => o.fr === fs[0].id && o.cam === 'precuela')[0];
    out.precuelaAntes = cn.ramas[0].obras.indexOf(pre) < cn.ramas[0].obras.indexOf(mias[0]);
    const prim = cn.ramas[0].obras[0], seg = cn.ramas[0].obras[1] || prim; if (!cn.ramas[0].obras[1]) return out; F.moverEnCanon(fs[0].id, seg.id, -1); out.movido = F.canon(fs[0]).ramas[0].obras[0] === seg;
    F.separar(fs[0].id, fs[1].id); out.trasSeparar = [fs[0].xo.length, F.canon(fs[1]).ramas[0].obras.length];
    ART.ui.render(); ART.ui.acciones.tvVerFr(String(fs[0].id));
    const txt = document.getElementById('modal').innerText;
    out.ui = ['Línea por fecha de estreno', 'Cronología del canon', 'Crossovers (2/3)', 'Gran crossover', 'Nace de', 'Fuera del canon'].map(k => k + ':' + txt.includes(k));
    ART.ui.acciones.tvCanon(fs[0].id + '|' + seg.id + '|1');
    return out;
  });
  const v = await p.evaluate(() => ART.verificador.correr({ anios: [1995], vistas: 80, clics: 250, semanas: 52 }).errores);
  console.log(JSON.stringify(r, null, 1), 'verif', JSON.stringify(v), 'errs', JSON.stringify(errs)); await b.close(); })();
