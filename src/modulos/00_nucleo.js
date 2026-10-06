/* ==== módulo: nucleo ==== */
// Arranque del espacio de nombres, azar con semilla, reloj semanal, mensajes entre módulos y utilidades.
// La partida vive en IA.n.S: un solo objeto de datos, sin funciones adentro.
var IA = {};
IA.VERSION = '19.0';
IA.VERSION_GUARDADO = 19;
// Banderas de edición en un solo lugar (completa o gratuita). Todas en "completa" hasta la V35.
IA.EDICION = { nombre: 'completa', ranurasManuales: 5, autoguardados: 3, bot: true };

IA.n = (function () {
  'use strict';
  const nucleo = { S: null };

  // ---------- Azar con semilla (sfc32) ----------
  // El estado son 4 enteros de 32 bits guardados en S.rng: la misma semilla y las mismas decisiones
  // dan la misma partida, así se repiten los errores y se comparan versiones.
  function semillaDeTexto(texto) {
    let h = 1779033703 ^ texto.length;
    for (let i = 0; i < texto.length; i++) {
      h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    const sal = [];
    for (let k = 0; k < 4; k++) {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      sal.push(h >>> 0);
    }
    return sal;
  }
  function estadoNuevo(semilla) {
    const st = semillaDeTexto(String(semilla));
    // Calentar el generador
    const tmp = { rng: st };
    for (let i = 0; i < 15; i++) paso(tmp.rng);
    return tmp.rng;
  }
  function paso(r) {
    let a = r[0] >>> 0, b = r[1] >>> 0, c = r[2] >>> 0, d = r[3] >>> 0;
    const t = (((a + b) >>> 0) + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) >>> 0;
    r[0] = a >>> 0; r[1] = b >>> 0; r[2] = c >>> 0; r[3] = d;
    return t / 4294967296;
  }
  function azar() { return paso(nucleo.S.rng); }
  function entero(a, b) { return a + Math.floor(azar() * (b - a + 1)); }
  function elegir(lista) { return lista[Math.floor(azar() * lista.length)]; }
  function probabilidad(p) { return azar() < p; }
  function normal(media, desvio) {
    // Box-Muller acotado a ±3 desvíos para que nada sea absurdo
    let u = 0, v = 0;
    while (u === 0) u = azar();
    v = azar();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return media + desvio * Math.max(-3, Math.min(3, z));
  }
  function ponderado(pesos) {
    let total = 0;
    for (let i = 0; i < pesos.length; i++) total += Math.max(0, pesos[i]);
    let x = azar() * total;
    for (let i = 0; i < pesos.length; i++) {
      x -= Math.max(0, pesos[i]);
      if (x < 0) return i;
    }
    return pesos.length - 1;
  }
  function mezclar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      const t = lista[i]; lista[i] = lista[j]; lista[j] = t;
    }
    return lista;
  }
  // Hash determinista (para arte, nombres estables y ruido sin gastar el generador)
  function hash(texto) {
    let h = 2166136261;
    const s = String(texto);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function ruido(texto) { return hash(texto) / 4294967296; }

  // ---------- Reloj ----------
  // S.t = semanas desde el inicio. El año tiene 52 semanas; los meses salen del día real de cada semana.
  const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function anio(t) { const S = nucleo.S; return S.y0 + Math.floor((t === undefined ? S.t : t) / 52); }
  function semana(t) { const S = nucleo.S; return ((t === undefined ? S.t : t) % 52) + 1; }
  function mesDeSemana(sem) {
    let dia = (sem - 1) * 7 + 4; // día del medio de la semana
    for (let m = 0; m < 12; m++) {
      if (dia <= DIAS_MES[m]) return m;
      dia -= DIAS_MES[m];
    }
    return 11;
  }
  function mes(t) { return mesDeSemana(semana(t)); }
  function tDe(anioX, semanaX) { return (anioX - nucleo.S.y0) * 52 + (semanaX - 1); }

  // ---------- Mensajes entre módulos ----------
  const oyentes = {};
  function on(evento, fn) { (oyentes[evento] = oyentes[evento] || []).push(fn); }
  function emit(evento, datos) {
    const l = oyentes[evento];
    if (!l) return;
    for (let i = 0; i < l.length; i++) l[i](datos);
  }

  // ---------- Utilidades ----------
  function limitar(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mezcla(a, b, f) { return a + (b - a) * f; }
  // Interpola una tabla [[x, y], ...] ordenada por x (lineal; fuera del rango usa el extremo)
  function interp(tabla, x) {
    if (x <= tabla[0][0]) return tabla[0][1];
    const n = tabla.length;
    if (x >= tabla[n - 1][0]) return tabla[n - 1][1];
    let i = 1;
    while (tabla[i][0] < x) i++;
    const a = tabla[i - 1], b = tabla[i];
    return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
  }
  // Interpolación geométrica (para poblaciones y precios que crecen en proporción)
  function interpLog(tabla, x) {
    if (x <= tabla[0][0]) return tabla[0][1];
    const n = tabla.length;
    if (x >= tabla[n - 1][0]) return tabla[n - 1][1];
    let i = 1;
    while (tabla[i][0] < x) i++;
    const a = tabla[i - 1], b = tabla[i];
    if (a[1] <= 0 || b[1] <= 0) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    return a[1] * Math.pow(b[1] / a[1], (x - a[0]) / (b[0] - a[0]));
  }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function sigId() { return ++nucleo.S.sigId; }
  function suma(lista, fn) {
    let s = 0;
    for (let i = 0; i < lista.length; i++) s += fn ? fn(lista[i], i) : lista[i];
    return s;
  }
  function copiar(obj) { return JSON.parse(JSON.stringify(obj)); }
  function redondear(v, dec) { const p = Math.pow(10, dec || 0); return Math.round(v * p) / p; }

  Object.assign(nucleo, {
    estadoNuevo: estadoNuevo, azar: azar, entero: entero, elegir: elegir, probabilidad: probabilidad,
    normal: normal, ponderado: ponderado, mezclar: mezclar, hash: hash, ruido: ruido,
    anio: anio, semana: semana, mes: mes, mesDeSemana: mesDeSemana, tDe: tDe,
    on: on, emit: emit,
    limitar: limitar, mezcla: mezcla, interp: interp, interpLog: interpLog, esc: esc, sigId: sigId,
    suma: suma, copiar: copiar, redondear: redondear,
  });
  return nucleo;
})();
