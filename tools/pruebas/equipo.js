// Selector de talento en los creadores: avatar en cualquier puesto, filtros y elección.
const { chromium } = (function () { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const err = [];
  p.on('pageerror', e => err.push('PAGE ' + e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const out = [], U = ART.ui, A = U.acciones, Md = ART.medios, T = ART.talentos;
    ART.juego.nuevaPartida({ semilla: 'eq', anio: 2026, nombre: 'Equipo', bot: true });
    for (let i = 0; i < 26; i++) { ART.pruebas.decidir(ART.pruebas.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
    const av = ART.carrera.asegurarTalento();
    ART.mediosUI.nuevo('teatro'); A.mdTab('equipo');
    let h = document.getElementById('ficha').innerHTML;
    out.push('botón Ver talentos: ' + (h.indexOf('mdVerTal') >= 0) + ' · avatar en desplegable: ' + (h.indexOf('(tú)') >= 0));
    A.mdVerTal('0'); h = document.getElementById('ficha').innerHTML;
    out.push('selector abierto: ' + (h.indexOf('Elegir escritor') >= 0) + ' · tú primero: ' + (h.indexOf('(tú)') >= 0) + ' · tarjetas: ' + (h.match(/mdPickElegir/g) || []).length);
    A.stFiltro('sx|F'); h = document.getElementById('ficha').innerHTML; out.push('filtro mujeres: ' + (h.match(/mdPickElegir/g) || []).length);
    A.stFiltro('sx|'); A.stFiltro('modo|todos'); A.stFiltro('orden|precio'); h = document.getElementById('ficha').innerHTML; out.push('cualquier talento, por precio: ' + (h.match(/mdPickElegir/g) || []).length);
    const q0 = Md.estimar(ART.mediosUI.actual()).q;
    A.mdPickElegir(String(av.id));
    const bb = ART.mediosUI.actual();
    out.push('avatar asignado: ' + (bb.eqS[0] === av.id) + ' (oficio ' + av.of + ') · calidad ' + q0 + ' → ' + Md.estimar(bb).q);
    A.mdIniciar(); out.push('proyecto iniciado: ' + Md.proyectos().some(x => x.eq.indexOf(av.id) >= 0));
    A.crearObra(); A.crCamino('nueva');
    const cr = ART.creacion.estado; cr.rol = 'guion';
    ART.creacion.listaCandidatos('guion'); A.stFiltro('sx|M'); const hc = ART.creacion.listaCandidatos('guion');
    out.push('cine: avatar en la lista: ' + (hc.indexOf('etiqueta oro">tú') >= 0) + ' · filtros de sexo/edad/complexión: ' + (hc.indexOf('Cualquier complexión') >= 0));
    return out;
  });
  console.log(r.join('\n')); console.log('errores:', err.join(' | ') || 'ninguno');
  await b.close();
})();
