#!/usr/bin/env node
/*
 * Bot de pruebas de INDUSTRY ART en un navegador real (Chromium sin pantalla).
 * Juega 3 estrategias (prudente, normal, agresiva) desde 1900 y desde 2000 hasta 2150 con semillas fijas,
 * revisa las metas de balance, los errores, los tiempos y el tamaño del guardado comprimido, y escribe
 * pruebas/informe_bot_v23.md y pruebas/informe_bot_v23.json, con las pruebas de reglas de la V17 a la V23.
 *
 * Uso:  node tools/bot.js [--hasta 2150] [--semillas bot,b2] [--html INDUSTRY_ART_v23.html]
 * Necesita Playwright (en el entorno de Claude viene instalado; no hace falta npm install).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const HASTA = +arg('hasta', 2150);
const SEMILLAS = arg('semillas', 'bot,b2').split(',');
const HTML = path.resolve(RAIZ, arg('html', 'INDUSTRY_ART_v23.html'));
const ESTRATEGIAS = ['prudente', 'normal', 'agresiva'];
const DESDE = [1900, 2000];

async function partida(navegador, estrategia, desde, semilla) {
  const pagina = await navegador.newPage();
  const errores = [];
  pagina.on('pageerror', (e) => errores.push('Error de página: ' + e.message));
  pagina.on('console', (m) => { if (m.type() === 'error') errores.push('Consola: ' + m.text()); });
  await pagina.goto('file://' + HTML);
  const r = await pagina.evaluate(async (op) => {
    let foto150 = null;
    const res = IA.pruebas.jugar({
      estrategia: op.estrategia, desde: op.desde, hasta: op.hasta, semilla: op.semilla + '-' + op.estrategia + '-' + op.desde,
      medirGuardado: (S) => { const j = JSON.stringify(S); if (IA.n.anio() - op.desde === 150) foto150 = j; return j.length; },
    });
    const comprimido = async (txt) => (txt ? (await IA.guardado.comprimir(txt)).datos.length : null);
    res.guardado150 = foto150 ? { json: foto150.length, comprimido: await comprimido(foto150) } : null;
    const final = await IA.guardado.medir();
    res.guardadoFinal = final;
    res.memoria = performance.memory ? performance.memory.usedJSHeapSize : null;
    // Prueba de guardado real en IndexedDB y de carga
    const g = await IA.guardado.guardar('m5');
    const c = await IA.guardado.cargar('m5');
    res.pruebaGuardado = { guardar: g.ok, cargar: c.ok, error: g.error || c.error || '' };
    return res;
  }, { estrategia, desde, hasta: HASTA, semilla });
  await pagina.close();
  r.errores = r.errores.concat(errores);
  return r;
}

// Abrir el juego y avanzar una semana con la CPU 4 veces más lenta (aproxima un celular modesto)
async function rendimientoLento(navegador) {
  const pagina = await navegador.newPage({ viewport: { width: 390, height: 844 } });
  const cdp = await pagina.context().newCDPSession(pagina);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const t0 = Date.now();
  await pagina.goto('file://' + HTML);
  await pagina.waitForSelector('#btnContinuar, .portada');
  const abrir = Date.now() - t0;
  const r = await pagina.evaluate(() => {
    IA.juego.nuevaPartida({ semilla: 'lento', anio: 1950, bot: true });
    for (let i = 0; i < 52 * 20; i++) { IA.pruebas.decidir(IA.pruebas.ESTRATEGIAS.normal); IA.juego.avanzarSemana(); }
    IA.ui.render();
    // Semana con pantalla: simulación + barra + sección visible (promedio de 13 semanas por sección: un trimestre,
    // con sus 3 cambios de mes, igual para todas)
    const porSeccion = {};
    ['estudio', 'obras', 'mundo', 'negocio', 'talento'].forEach((sec) => {
      IA.ui.irA(sec);
      let total = 0;
      for (let k = 0; k < 13; k++) { const a = performance.now(); IA.juego.avanzar('semana'); IA.ui.refrescar(); total += performance.now() - a; }
      porSeccion[sec] = total / 13;
    });
    const b = performance.now();
    for (let i = 0; i < 52; i++) IA.juego.avanzarSemana();
    return { porSeccion, anioSinPantalla: (performance.now() - b) / 1000 };
  });
  await pagina.close();
  return { abrir: abrir / 1000, semanaConPantalla: r.porSeccion.estudio, porSeccion: r.porSeccion, anioSinPantalla: r.anioSinPantalla };
}

const pct = (x) => (Math.round(x * 1000) / 10).toString().replace('.', ',') + ' %';
const mb = (b) => (b / 1048576).toFixed(2).replace('.', ',') + ' MB';
const med = (v) => { const s = v.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

(async () => {
  const navegador = await chromium.launch();
  const tareas = [];
  for (const s of SEMILLAS) for (const e of ESTRATEGIAS) for (const d of DESDE) tareas.push({ e, d, s });
  const resultados = [];
  const enParalelo = 3;
  for (let i = 0; i < tareas.length; i += enParalelo) {
    const lote = tareas.slice(i, i + enParalelo);
    const rs = await Promise.all(lote.map((x) => partida(navegador, x.e, x.d, x.s)));
    rs.forEach((r) => { resultados.push(r); console.log(r.estrategia, r.desde, r.semilla, 'errores', r.errores.length, 'mult', r.multMediano.toFixed(2)); });
  }
  const lento = await rendimientoLento(navegador);
  // Pruebas de reglas (clasificación, dominio público, Erótico, inflación y población)
  const pr = await navegador.newPage();
  await pr.goto('file://' + HTML);
  const reglas = await pr.evaluate(() => { IA.juego.nuevaPartida({ semilla: 'reglas', anio: 2000, bot: true }); return IA.pruebas.reglas(); });
  await pr.close();
  console.log('reglas', reglas.filter((x) => x.ok).length + '/' + reglas.length);
  await navegador.close();

  // ---------- Informe ----------
  const METAS = [
    ['Multiplicador mediano', '×1,5 a ×2,5', (r) => r.multMediano >= 1.5 && r.multMediano <= 2.5, (r) => '×' + r.multMediano.toFixed(2).replace('.', ',')],
    ['Obras sobre ×5', '5 % o menos', (r) => r.sobre5 <= 0.05, (r) => pct(r.sobre5)],
    ['Obras que pierden', '30 % a 45 %', (r) => r.pierden >= 0.3 && r.pierden <= 0.45, (r) => pct(r.pierden)],
    ['Crecimiento real de la caja', '5 % a 20 % al año', (r) => r.crecimiento30 >= 0.05 && r.crecimiento30 <= 0.2, (r) => pct(r.crecimiento30)],
    ['Premios principales del jugador', '30 % o menos', (r) => r.premiosJugador <= 0.3, (r) => pct(r.premiosJugador)],
    ['Años de independiente a major', '15 a 30', (r) => r.aniosAMajor !== null && r.aniosAMajor >= 15 && r.aniosAMajor <= 30, (r) => (r.aniosAMajor === null ? 'nunca' : String(r.aniosAMajor))],
    ['Cuota de mercado', 'menos de 35 %', (r) => r.cuotaMax < 0.35, (r) => pct(r.cuotaMax) + ' máx.'],
  ];
  const fecha = new Date().toISOString().slice(0, 10);
  let md = '# Informe del bot · INDUSTRY ART V22\n\n';
  md += `Fecha: ${fecha} · Navegador: Chromium sin pantalla · ${resultados.length} partidas hasta ${HASTA} · semillas fijas: ${SEMILLAS.join(', ')}\n\n`;
  const totalErrores = resultados.reduce((a, r) => a + r.errores.filter((e) => !/^Quiebra del bot/.test(e)).length, 0);
  md += `**Errores del juego en todas las partidas: ${totalErrores}.** Quiebras del bot: ${resultados.filter((r) => r.quiebra).length}.\n\n`;
  md += '## Metas de balance (estrategia normal = "estudio bien llevado")\n\n';
  for (const d of DESDE) {
    md += `### Desde ${d}\n\n| Meta | Objetivo | ` + SEMILLAS.map((s) => 'Semilla ' + s).join(' | ') + ' |\n|---|---|' + SEMILLAS.map(() => '---').join('|') + '|\n';
    for (const [nombre, obj, ok, ver] of METAS) {
      md += `| ${nombre} | ${obj} | ` + SEMILLAS.map((s) => { const r = resultados.find((x) => x.estrategia === 'normal' && x.desde === d && x.semilla.startsWith(s + '-')); return r ? (ok(r) ? '✅ ' : '⚠️ ') + ver(r) : '—'; }).join(' | ') + ' |\n';
    }
    md += '\n';
  }
  md += '## Las tres estrategias\n\n| Estrategia | Desde | Semilla | Mult. mediano | Sobre ×5 | Pierden | Crec. real (años 10-40) | Arranque (años 0-10) | Premios | Major | Cuota máx. | Mult. del jugador | Pierden (jugador) | Rescates de rivales |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n';
  for (const r of resultados) {
    md += `| ${r.estrategia} | ${r.desde} | ${r.semilla.split('-')[0]} | ×${r.multMediano.toFixed(2)} | ${pct(r.sobre5)} | ${pct(r.pierden)} | ${pct(r.crecimiento30)} | ${pct(r.crecimientoArranque)} | ${pct(r.premiosJugador)} | ${r.aniosAMajor === null ? 'nunca' : r.aniosAMajor} | ${pct(r.cuotaMax)} | ×${r.multMedianoJugador.toFixed(2)} | ${pct(r.pierdenJugador)} | ${r.rescatesRivales} |\n`;
  }
  md += '\n## Pruebas de reglas\n\n' + `**${reglas.filter((x) => x.ok).length} de ${reglas.length} pasan.**\n\n| Regla | Resultado |\n|---|---|\n` + reglas.map((x) => `| ${x.nombre} | ${x.ok ? '✅' : '❌'}${x.detalle ? ' ' + x.detalle : ''} |`).join('\n') + '\n';
  md += '\n## Fábrica de ideas: qué usó el bot\n\n| Estrategia | Desde | Semilla | Obras | Material | Guion comprado | IA | Efectos grandes (aplaudidos / repudiados) | Clasificaciones | Adaptaciones de rivales |\n|---|---|---|---|---|---|---|---|---|---|\n';
  for (const r of resultados) {
    const i = r.ideas || {};
    md += `| ${r.estrategia} | ${r.desde} | ${r.semilla.split('-')[0]} | ${i.obras} | ${i.material} | ${i.guion} | ${i.ia} | ${i.efectos} (${i.aplaudidos} / ${i.repudiados}) | ${Object.entries(i.clasificaciones || {}).map((x) => x[0] + ': ' + x[1]).join(', ')} | ${i.adaptacionesRivales} |\n`;
  }
  md += '\n## Producción: qué usó el bot (V19)\n\n| Estrategia | Desde | Semilla | Obras | Métodos | Estilos | Sets reusados | Estudios externos | Dilemas | Prueba de público | Sobrecosto mediano |\n|---|---|---|---|---|---|---|---|---|---|---|\n';
  const lista = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ': ' + v).join(', ');
  for (const r of resultados) {
    const p = r.produccion || {};
    md += `| ${r.estrategia} | ${r.desde} | ${r.semilla.split('-')[0]} | ${p.obras || 0} | ${lista(p.metodos)} | ${lista(p.estilos)} | ${p.sets || 0} | ${p.externos || 0} | ${p.dilemas || 0} | ${lista(p.pruebas)} | ${pct(p.sobrecosto || 0)} |\n`;
  }

  md += '\n## Lanzamiento: qué pasó con las obras del bot (V22)\n\n| Estrategia | Desde | Semilla | Obras | Directo a video/streaming | Oro | Platino | Diamante | Reestrenos | Parte de ventanas en sus ingresos |\n|---|---|---|---|---|---|---|---|---|---|\n';
  for (const r of resultados) {
    const l = r.lanzamiento || {};
    md += `| ${r.estrategia} | ${r.desde} | ${r.semilla.split('-')[0]} | ${l.obras || 0} | ${l.directos || 0} | ${l.oro || 0} | ${l.platino || 0} | ${l.diamante || 0} | ${l.reestrenos || 0} | ${pct(l.parteVentanas || 0)} |\n`;
  }

  md += '\n## Rendimiento\n\n| Medida | Meta | Resultado |\n|---|---|---|\n';
  const semanas = resultados.map((r) => r.rendimiento.msSemana), anios = resultados.map((r) => r.rendimiento.sAnio), peores = resultados.map((r) => r.rendimiento.peorSemana);
  const g150 = resultados.filter((r) => r.guardado150).map((r) => r.guardado150.comprimido);
  const gfin = resultados.map((r) => r.guardadoFinal.comprimido);
  const mem = resultados.filter((r) => r.memoria).map((r) => r.memoria);
  const tam = fs.statSync(HTML).size;
  md += `| Avanzar una semana (simulación, PC) | menos de 30 ms | ${med(semanas).toFixed(2)} ms de mediana; la peor semana (cierre de año) ${Math.max(...peores).toFixed(0)} ms |\n`;
  md += `| Simular un año (PC) | menos de 1,5 s | ${med(anios).toFixed(2)} s de mediana |\n`;
  md += `| Simular un año con la CPU ×4 más lenta | menos de 1,5 s | ${lento.anioSinPantalla.toFixed(2)} s |\n`;
  md += `| Avanzar una semana con pantalla, CPU ×4 más lenta | menos de 30 ms | Estudio ${lento.porSeccion.estudio.toFixed(0)} ms · Obras ${lento.porSeccion.obras.toFixed(0)} · Mundo ${lento.porSeccion.mundo.toFixed(0)} · Negocio ${lento.porSeccion.negocio.toFixed(0)} · Talento ${lento.porSeccion.talento.toFixed(0)} ms |\n`;
  md += `| Abrir el juego con la CPU ×4 más lenta | menos de 2 s | ${lento.abrir.toFixed(2)} s |\n`;
  md += `| Guardado tras 150 años, comprimido | menos de 2 MB | ${g150.length ? mb(Math.max(...g150)) + ' (el mayor)' : '—'} |\n`;
  md += `| Guardado al final (2150), comprimido | — | ${mb(Math.max(...gfin))} (el mayor) |\n`;
  md += `| Memoria usada | menos de 200 MB | ${mem.length ? mb(Math.max(...mem)) : '—'} |\n`;
  md += `| Tamaño del archivo | menos de 1,5 MB | ${(tam / 1024).toFixed(0)} KB |\n`;
  md += `| Guardar y cargar en IndexedDB | sin fallos | ${resultados.every((r) => r.pruebaGuardado.guardar && r.pruebaGuardado.cargar) ? 'todas bien' : 'FALLÓ: ' + resultados.map((r) => r.pruebaGuardado.error).join('; ')} |\n`;
  md += '\n## Errores\n\n' + (totalErrores ? resultados.map((r) => r.errores.map((e) => `- ${r.estrategia} ${r.desde}: ${e}`).join('\n')).filter(Boolean).join('\n') : 'Ninguno.') + '\n';
  fs.mkdirSync(path.join(RAIZ, 'pruebas'), { recursive: true });
  fs.writeFileSync(path.join(RAIZ, 'pruebas', 'informe_bot_v23.md'), md);
  fs.writeFileSync(path.join(RAIZ, 'pruebas', 'informe_bot_v23.json'), JSON.stringify({ fecha, hasta: HASTA, resultados, lento, reglas }, null, 1));
  console.log(md);
  process.exit(totalErrores ? 1 : 0);
})();
