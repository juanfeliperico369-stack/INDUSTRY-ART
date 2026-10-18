#!/usr/bin/env node
/*
 * Capturas automáticas de cada pantalla de INDUSTRY ART en 390×844 (celular vertical), 844×390 (celular
 * horizontal) y 1366×768 (PC). Guarda los PNG en pruebas/capturas/ y revisa que ningún control mida menos de
 * 44 px, que ningún texto mida menos de 14 px y que no haya desplazamiento horizontal.
 *
 * Uso:  node tools/capturas.js [--html INDUSTRY_ART_Definitiva.html]
 * Necesita Playwright (npm install -g playwright, o NODE_PATH apuntando a una instalación existente).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const HTML = path.resolve(RAIZ, args.indexOf('--html') >= 0 ? args[args.indexOf('--html') + 1] : 'INDUSTRY_ART_Definitiva.html');
const SALIDA = path.join(RAIZ, 'pruebas', 'capturas');
const TAMANOS = [[390, 844, 'celular_vertical'], [844, 390, 'celular_horizontal'], [1366, 768, 'pc']];

const PANTALLAS = [
  ['01_portada', async (p) => { await p.evaluate(() => { ART.n.S = null; ART.ui.estado.np = false; ART.ui.render(); }); }],
  ['02_nueva_partida', async (p) => { await p.evaluate(() => { ART.n.S = null; ART.ui.estado.np = true; ART.ui.render(); }); }],
  ['03_estudio', async (p) => { await partida(p); await p.evaluate(() => ART.ui.irA('estudio')); }],
  ['04_obras', async (p) => { await p.evaluate(() => ART.ui.irA('obras', 'marcha')); }],
  // (para la captura se agrega un plató si la capacidad está llena)
  ['05_crear_obra', async (p) => { await p.evaluate(() => { if (ART.obras.enProduccion(0).length >= ART.negocio.capacidad(0)) ART.n.S.estudios[0].pisos.push('plato'); ART.ui.irA('obras'); ART.ui.acciones.crearObra(); }); }],
  ['05b_crear_historia', async (p) => { await p.evaluate(() => { ART.ui.acciones.crModo('rapido'); ART.ui.acciones.crCamino('nueva'); ART.ui.acciones.crPaso('1'); }); }],
  ['06_crear_equipo', async (p) => { await p.evaluate(() => { for (let i = 0; i < 2; i++) ART.ui.acciones.crPaso('1'); }); }],
  ['06b_crear_detallado', async (p) => { await p.evaluate(() => { ART.ui.acciones.crModo('detallado'); ['obra', 'generos', 'historia'].forEach((s) => { if (ART.creacion.estado.abiertas[s]) ART.ui.acciones.crSeccion(s); }); ART.ui.acciones.crSeccion('forma'); document.querySelector('#ficha [aria-expanded=true]').scrollIntoView(); }); }],
  ['06c_crear_personajes', async (p) => { await p.evaluate(() => { ART.ui.acciones.crSeccion('forma'); ART.ui.acciones.crSeccion('personajes'); document.querySelector('#ficha [aria-expanded=true]').scrollIntoView(); }); }],
  ['06f_crear_rodaje', async (p) => { await p.evaluate(() => { ART.ui.acciones.crSeccion('personajes'); ART.ui.acciones.crSeccion('rodaje'); document.querySelector('#ficha [aria-expanded=true]').scrollIntoView(); }); }],
  ['06g_crear_presupuesto', async (p) => { await p.evaluate(() => { ART.ui.acciones.crSeccion('rodaje'); ART.ui.acciones.crSeccion('presupuesto'); document.querySelector('#ficha [aria-expanded=true]').scrollIntoView(); }); }],
  ['06h_crear_pie', async (p) => { await p.evaluate(() => { ART.ui.acciones.crSeccion('presupuesto'); ART.ui.acciones.crPieDetalle(); document.getElementById('crPie').scrollIntoView(); }); }],
  ['06d_usar_material', async (p) => { await p.evaluate(() => { ART.ui.acciones.crModo('rapido'); ART.ui.acciones.crVolverCamino(); ART.ui.acciones.crCamino('material'); }); }],
  ['06e_comprar_guion', async (p) => { await p.evaluate(() => { ART.ui.acciones.crVolverCamino(); ART.ui.acciones.crCamino('guion'); }); }],
  ['07_catalogo', async (p) => { await p.evaluate(() => { ART.ui.cerrarFicha(); ART.ui.irA('obras', 'catalogo'); }); }],
  ['08_ficha_obra', async (p) => { await p.evaluate(() => { const o = ART.n.S.obras.filter((x) => x.est === 0 && x.et === 'terminada').pop(); if (o) ART.ui.acciones.verObra(String(o.id)); }); }],
  ['08b_ficha_produccion', async (p) => { await p.evaluate(() => { ART.ui.cerrarFicha(); const o = ART.obras.enProduccion(0)[0] || ART.n.S.obras.filter((x) => x.est === 0 && x.lp).pop(); if (o) { ART.ui.acciones.verObra(String(o.id)); const h = [...document.querySelectorAll('#ficha h3')].filter((x) => x.textContent === 'Producción')[0]; if (h) h.scrollIntoView(); } }); }],
  ['08c_dilema', async (p) => { await p.evaluate(() => { ART.ui.cerrarFicha(); const o = ART.obras.enProduccion(0)[0]; if (o) { o.dil = { id: 'escenaClave', t: ART.n.S.t, n: { d: o.eq.direccion } }; ART.creacion.abrirDecision(o.id); } }); }],
  ['08d_prueba_publico', async (p) => { await p.evaluate(() => { ART.ui.cerrarModal(); const o = ART.obras.enProduccion(0)[0]; if (o) { o.dil = null; o.prueba = { p: 57, com: ['La música emociona.', 'El ritmo decae a la mitad.'], t: ART.n.S.t }; ART.creacion.abrirDecision(o.id); } }); }],
  // Lanzamiento: el plan de estreno, el dinero en cadena y las ventanas
  ['08e_plan_lanzamiento', async (p) => { await p.evaluate(() => { ART.ui.cerrarModal(); const o = ART.obras.enProduccion(0)[0]; if (o) { o.prueba = null; o.dil = null; ART.distribucion.abrir(o.id); } }); }],
  ['08f_plan_regiones', async (p) => { await p.evaluate(() => { const h = [...document.querySelectorAll('#ficha h3')].filter((x) => x.textContent === 'Estreno por región')[0]; if (h) h.scrollIntoView(); }); }],
  ['08g_plan_campana', async (p) => { await p.evaluate(() => { const h = [...document.querySelectorAll('#ficha h4')].filter((x) => x.textContent.indexOf('Mezcla de canales') === 0)[0]; if (h) h.scrollIntoView(); }); }],
  ['08h_plan_promociones', async (p) => { await p.evaluate(() => { const h = [...document.querySelectorAll('#ficha h3')].filter((x) => x.textContent === 'Promociones')[0]; if (h) h.scrollIntoView(); }); }],
  ['08i_ficha_dinero', async (p) => { await p.evaluate(() => { ART.ui.cerrarFicha(); const o = ART.n.S.obras.filter((x) => x.est === 0 && x.et === 'terminada' && x.vt).sort((a, b) => b.bruto - a.bruto)[0]; if (o) { ART.ui.acciones.verObra(String(o.id)); const h = [...document.querySelectorAll('#ficha h3')].filter((x) => x.textContent === 'Dinero en cadena')[0]; if (h) h.scrollIntoView(); } }); }],
  ['08j_ficha_catalogo', async (p) => { await p.evaluate(() => { const h = [...document.querySelectorAll('#ficha h3')].filter((x) => x.textContent === 'Ventanas')[0]; if (h) h.scrollIntoView(); }); }],
  ['09_talento', async (p) => { await p.evaluate(() => { ART.ui.cerrarFicha(); ART.ui.irA('talento'); }); }],
  ['10_ficha_talento', async (p) => { await p.evaluate(() => { const t = ART.n.S.talentos.filter((x) => !x.ret).sort((a, b) => b.fama - a.fama)[0]; ART.ui.acciones.verTalento(String(t.id)); }); }],
  ['11_mundo_cartelera', async (p) => { await p.evaluate(() => { ART.ui.cerrarFicha(); ART.ui.irA('mundo', 'cartelera'); }); }],
  ['12_mundo_poblacion', async (p) => { await p.evaluate(() => ART.ui.irA('mundo', 'poblacion')); }],
  ['13_mundo_premios', async (p) => { await p.evaluate(() => ART.ui.irA('mundo', 'premios')); }],
  ['13b_mundo_mapa', async (p) => { await p.evaluate(() => ART.ui.irA('mundo', 'mapa')); }],
  ['13c_mundo_taxonomia', async (p) => { await p.evaluate(() => ART.ui.irA('mundo', 'taxonomia')); }],
  ['13d_mundo_calendario', async (p) => { await p.evaluate(() => ART.ui.irA('mundo', 'calendario')); }],
  ['13e_mundo_tendencias', async (p) => { await p.evaluate(() => { ART.ui.irA('mundo', 'tendencias'); const h = [...document.querySelectorAll('#vista h3')].filter((x) => x.textContent === 'Por región')[0]; if (h) h.scrollIntoView(); }); }],
  ['14_negocio_finanzas', async (p) => { await p.evaluate(() => ART.ui.irA('negocio', 'finanzas')); }],
  ['15_negocio_construcciones', async (p) => { await p.evaluate(() => { ART.ui.cerrarModal(); const o = ART.obras.enProduccion(0)[0]; if (o) { o.prueba = null; } ART.ui.irA('negocio', 'estudio'); }); }],
  ['15b_almacen_sets', async (p) => { await p.evaluate(() => { const h = [...document.querySelectorAll('#vista h3')].filter((x) => x.textContent.indexOf('Almacén') === 0)[0]; if (h) h.scrollIntoView(); }); }],
  ['15c_negocio_distribucion', async (p) => { await p.evaluate(() => { window.scrollTo(0, 0); ART.ui.irA('negocio', 'distribucion'); }); }],
  ['16_ajustes', async (p) => { await p.evaluate(() => ART.ui.acciones.abrirAjustes()); }],
];

// Una partida con historia: el bot juega 12 años desde 1990
async function partida(p) {
  await p.evaluate(() => {
    ART.juego.nuevaPartida({ semilla: 'capturas', anio: 1990, nombre: 'Estudio Aurora Boreal', avatar: { nombre: 'OneZero', sexo: 'M', edad: 32 } });
    for (let i = 0; i < 52 * 12; i++) { ART.pruebas.decidir(ART.pruebas.ESTRATEGIAS.normal); ART.juego.avanzarSemana(); }
    const lista = ART.obras.delEstudio(0, ['lista'])[0];
    ART.ui.estado.np = false;
    ART.ui.render();
    return !!lista;
  });
}

async function medir(p) {
  return await p.evaluate(() => {
    const visibles = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const enPantalla = (e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
    // Una casilla dentro de una etiqueta cuenta por la etiqueta, que es lo que se toca
    const tocable = (e) => (e.type === 'checkbox' && e.closest('label') ? e.closest('label') : e);
    const chicos = [...document.querySelectorAll('button, select, input:not([type=file]), [data-a]')].filter((e) => visibles(e) && enPantalla(e) && !e.closest('table'))
      .filter((e) => { const r = tocable(e).getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; });
    const textos = [...document.querySelectorAll('body *')].filter((e) => visibles(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 14);
    return { controles: chicos.length, detalle: chicos.slice(0, 3).map((e) => (e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)), textos: textos.length, desborde: document.documentElement.scrollWidth > innerWidth + 1 };
  });
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await chromium.launch();
  const resumen = [];
  for (const [w, h, nombre] of TAMANOS) {
    const p = await navegador.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    await p.goto('file://' + HTML);
    await p.waitForTimeout(300);
    for (const [clave, paso] of PANTALLAS) {
      await paso(p);
      await p.waitForTimeout(350);
      const m = await medir(p);
      await p.screenshot({ path: path.join(SALIDA, `${nombre}_${clave}.png`) });
      resumen.push({ tamano: `${w}x${h}`, pantalla: clave, ...m });
      if (clave === '16_ajustes') await p.evaluate(() => ART.ui.cerrarModal());
    }
    if (errores.length) resumen.push({ tamano: `${w}x${h}`, errores });
    await p.close();
  }
  await navegador.close();
  let md = '# Capturas automáticas · INDUSTRY ART 4.0\n\n| Tamaño | Pantalla | Controles < 44 px | Textos < 14 px | Desplazamiento horizontal |\n|---|---|---|---|---|\n';
  resumen.filter((r) => r.pantalla).forEach((r) => { md += `| ${r.tamano} | ${r.pantalla} | ${r.controles}${r.controles ? ' (' + r.detalle.join(', ') + ')' : ''} | ${r.textos} | ${r.desborde ? 'sí' : 'no'} |\n`; });
  const errores = resumen.filter((r) => r.errores);
  md += '\nErrores de página: ' + (errores.length ? errores.map((r) => r.tamano + ': ' + r.errores.join('; ')).join(' / ') : 'ninguno') + '\n';
  fs.writeFileSync(path.join(SALIDA, 'medidas.md'), md);
  console.log(md);
})();
