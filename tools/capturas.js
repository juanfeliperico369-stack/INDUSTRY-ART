#!/usr/bin/env node
/*
 * Capturas automáticas de cada pantalla de INDUSTRY ART en 390×844 (celular vertical), 844×390 (celular
 * horizontal) y 1366×768 (PC). Guarda los PNG en pruebas/capturas/ y revisa que ningún control mida menos de
 * 44 px, que ningún texto mida menos de 14 px y que no haya desplazamiento horizontal.
 *
 * Uso:  node tools/capturas.js [--html INDUSTRY_ART_v16.html]
 * Necesita Playwright (en el entorno de Claude viene instalado; no hace falta npm install).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const HTML = path.resolve(RAIZ, args.indexOf('--html') >= 0 ? args[args.indexOf('--html') + 1] : 'INDUSTRY_ART_v16.html');
const SALIDA = path.join(RAIZ, 'pruebas', 'capturas');
const TAMANOS = [[390, 844, 'celular_vertical'], [844, 390, 'celular_horizontal'], [1366, 768, 'pc']];

const PANTALLAS = [
  ['01_portada', async (p) => { await p.evaluate(() => { IA.n.S = null; IA.ui.estado.np = false; IA.ui.render(); }); }],
  ['02_nueva_partida', async (p) => { await p.evaluate(() => { IA.n.S = null; IA.ui.estado.np = true; IA.ui.render(); }); }],
  ['03_estudio', async (p) => { await partida(p); await p.evaluate(() => IA.ui.irA('estudio')); }],
  ['04_obras', async (p) => { await p.evaluate(() => IA.ui.irA('obras', 'marcha')); }],
  ['05_crear_obra', async (p) => { await p.evaluate(() => { IA.ui.irA('obras'); IA.ui.acciones.crearObra(); }); }],
  ['06_crear_equipo', async (p) => { await p.evaluate(() => { for (let i = 0; i < 3; i++) IA.ui.acciones.crPaso('1'); }); }],
  ['07_catalogo', async (p) => { await p.evaluate(() => { IA.ui.cerrarFicha(); IA.ui.irA('obras', 'catalogo'); }); }],
  ['08_ficha_obra', async (p) => { await p.evaluate(() => { const o = IA.n.S.obras.filter((x) => x.est === 0 && x.et === 'terminada').pop(); if (o) IA.ui.acciones.verObra(String(o.id)); }); }],
  ['09_talento', async (p) => { await p.evaluate(() => { IA.ui.cerrarFicha(); IA.ui.irA('talento'); }); }],
  ['10_ficha_talento', async (p) => { await p.evaluate(() => { const t = IA.n.S.talentos.filter((x) => !x.ret).sort((a, b) => b.fama - a.fama)[0]; IA.ui.acciones.verTalento(String(t.id)); }); }],
  ['11_mundo_cartelera', async (p) => { await p.evaluate(() => { IA.ui.cerrarFicha(); IA.ui.irA('mundo', 'cartelera'); }); }],
  ['12_mundo_poblacion', async (p) => { await p.evaluate(() => IA.ui.irA('mundo', 'poblacion')); }],
  ['13_mundo_premios', async (p) => { await p.evaluate(() => IA.ui.irA('mundo', 'premios')); }],
  ['14_negocio_finanzas', async (p) => { await p.evaluate(() => IA.ui.irA('negocio', 'finanzas')); }],
  ['15_negocio_construcciones', async (p) => { await p.evaluate(() => IA.ui.irA('negocio', 'estudio')); }],
  ['16_ajustes', async (p) => { await p.evaluate(() => IA.ui.acciones.abrirAjustes()); }],
];

// Una partida con historia: el bot juega 12 años desde 1990
async function partida(p) {
  await p.evaluate(() => {
    IA.juego.nuevaPartida({ semilla: 'capturas', anio: 1990, nombre: 'Estudio Aurora Boreal', avatar: { nombre: 'Felipe', sexo: 'M', edad: 32 } });
    for (let i = 0; i < 52 * 12; i++) { IA.pruebas.decidir(IA.pruebas.ESTRATEGIAS.normal); IA.juego.avanzarSemana(); }
    const lista = IA.obras.delEstudio(0, ['lista'])[0];
    IA.ui.estado.np = false;
    IA.ui.render();
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
      if (clave === '16_ajustes') await p.evaluate(() => IA.ui.cerrarModal());
    }
    if (errores.length) resumen.push({ tamano: `${w}x${h}`, errores });
    await p.close();
  }
  await navegador.close();
  let md = '# Capturas automáticas · INDUSTRY ART V16\n\n| Tamaño | Pantalla | Controles < 44 px | Textos < 14 px | Desplazamiento horizontal |\n|---|---|---|---|---|\n';
  resumen.filter((r) => r.pantalla).forEach((r) => { md += `| ${r.tamano} | ${r.pantalla} | ${r.controles}${r.controles ? ' (' + r.detalle.join(', ') + ')' : ''} | ${r.textos} | ${r.desborde ? 'sí' : 'no'} |\n`; });
  const errores = resumen.filter((r) => r.errores);
  md += '\nErrores de página: ' + (errores.length ? errores.map((r) => r.tamano + ': ' + r.errores.join('; ')).join(' / ') : 'ninguno') + '\n';
  fs.writeFileSync(path.join(SALIDA, 'medidas.md'), md);
  console.log(md);
})();
