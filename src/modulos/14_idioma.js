/* ==== módulo: idioma ==== */
// Inglés: el juego se escribe en español y, con el idioma en inglés, todo lo que aparece en pantalla pasa por el
// diccionario (ART.INGLES, armado desde todos los textos del juego): primero la frase completa y, si no, cada
// fragmento conocido (las frases que el juego arma con datos). Un observador traduce lo nuevo en cuanto aparece.
ART.idioma = (function () {
  'use strict';
  let actual = 'es', mapa = null, re = null, obs = null;
  const LETRA = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  // El diccionario viaja comprimido (gzip en Z85; lee también el base64 de antes) para que el archivo no pase de 1,5 MB
  const Z85 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!~*?&<>()[]{}@%$#';
  function deZ85(s, largo) {
    const val = {};
    for (let i = 0; i < 85; i++) val[Z85.charCodeAt(i)] = i;
    const out = new Uint8Array((s.length / 5) * 4);
    let o = 0;
    for (let i = 0; i < s.length; i += 5) {
      let v = 0;
      for (let j = 0; j < 5; j++) v = v * 85 + val[s.charCodeAt(i + j)];
      out[o++] = Math.floor(v / 16777216) & 255; out[o++] = (v >>> 16) & 255; out[o++] = (v >>> 8) & 255; out[o++] = v & 255;
    }
    return out.subarray(0, largo);
  }
  let cargando = null;
  function cargar() {
    if (mapa || cargando) return cargando || Promise.resolve();
    if (!(ART.INGLES_Z85 || ART.INGLES_GZ) || typeof DecompressionStream === 'undefined') { mapa = ART.INGLES || {}; return Promise.resolve(); }
    let u;
    if (ART.INGLES_Z85) u = deZ85(ART.INGLES_Z85, ART.INGLES_LEN);
    else { const bin = atob(ART.INGLES_GZ); u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); }
    cargando = new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text().then(function (txt) {
      const m = {};
      txt.split('\n').forEach(function (l) { const k = l.indexOf('\t'); if (k > 0) m[l.slice(0, k)] = l.slice(k + 1); });
      mapa = m; re = null;
    });
    return cargando;
  }
  // Fechas, comillas y artículos de los títulos inventados
  const MES = { enero: 'January', febrero: 'February', marzo: 'March', abril: 'April', mayo: 'May', junio: 'June', julio: 'July', agosto: 'August', septiembre: 'September', octubre: 'October', noviembre: 'November', diciembre: 'December' };
  const MESC = { ene: 'Jan', feb: 'Feb', mar: 'Mar', abr: 'Apr', may: 'May', jun: 'Jun', jul: 'Jul', ago: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dic: 'Dec' };
  const DIA = { lunes: 'Monday', martes: 'Tuesday', 'miércoles': 'Wednesday', jueves: 'Thursday', viernes: 'Friday', 'sábado': 'Saturday', domingo: 'Sunday' };
  const DIAC = { lun: 'Mon', mar: 'Tue', 'mié': 'Wed', jue: 'Thu', vie: 'Fri', 'sáb': 'Sat', dom: 'Sun' };
  const ADJ = { salvaje: 'Wild', secreto: 'Secret', imposible: 'Impossible', prohibido: 'Forbidden', dorado: 'Golden', eterno: 'Eternal', perdido: 'Lost' };
  const REGLAS = [
    // Títulos: «El faro salvaje» → «The Wild faro» (el diccionario traduce el resto). Solo con artículo o con mayúscula,
    // para no tocar frases como «lo que parecía imposible»
    [/(?<![A-Za-zÁ-ú])(?:(El|La|Los|Las|el|la|los|las) (?!(?:el|la|los|las|de|del|y)\s)([A-Za-zÁÉÍÓÚáéíóúñ]+)|([A-ZÁÉÍÓÚ][a-záéíóúñ]+)) (salvaje|secreto|imposible|prohibido|dorado|eterno|perdido)(?![A-Za-zÁ-ú])/g, function (m, art, n1, n2, a) { return (art ? (art[0] === 'E' || art[0] === 'L' ? 'The ' : 'the ') : '') + ADJ[a] + ' ' + (n1 || n2); }],
    [/(lunes|martes|miércoles|jueves|viernes|sábado|domingo) (\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de (\d{3,4})/g, function (m, d, n, me, y) { return DIA[d] + ', ' + MES[me] + ' ' + n + ', ' + y; }],
    [/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)( de (\d{3,4}))?/g, function (m, n, me, x, y) { return MES[me] + ' ' + n + (y ? ', ' + y : ''); }],
    [/(?<![A-Za-zÁ-ú])(lun|mar|mié|jue|vie|sáb|dom) (\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)(?![A-Za-zÁ-ú])/g, function (m, d, n, me) { return DIAC[d] + ' ' + MESC[me] + ' ' + n; }],
    [/(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)(?![A-Za-zÁ-ú])( (\d{3,4}))?/g, function (m, n, me, x, y) { return MESC[me] + ' ' + n + (y ? ', ' + y : ''); }],
  ];
  const REGLAS_FIN = [[/(\d+) de (\d+)(?![\d])/g, '$1 of $2'], [/at age (\d+) years/g, 'at age $1'], [/(^|[«“"(\s])(El|La|Los|Las) (?=[a-záéíóúñ])/g, function (m, a) { return a + 'The '; }], [/«/g, '“'], [/»/g, '”'], [/ y (?=[a-záéíóúñA-Z])/g, ' and '], [/(\d) años(?![A-Za-zÁ-ú])/g, '$1 years'], [/ (a|an) ([a-z]+(?: [a-z]+)?) de (\d{1,3}) years/g, ' $1 $2 aged $3']];
  let plantillas = [];
  function preparar() {
    if (re !== null || !mapa) return;
    // Variantes en minúscula (los géneros y los títulos aparecen así dentro de las frases)
    Object.keys(mapa).forEach(function (k) {
      if (/^[A-ZÁÉÍÓÚÑ]/.test(k) && k.length < 80) { const l = k.toLowerCase(); if (mapa[l] === undefined) mapa[l] = /^[A-Z]{2}/.test(mapa[k]) ? mapa[k] : mapa[k].charAt(0).toLowerCase() + mapa[k].slice(1); }
      // y en mayúscula las frases de tres palabras o más (al empezar una línea de la escaleta, por ejemplo)
      else if (/^[a-záéíóúñ]/.test(k) && k.length < 80 && k.split(' ').length >= 3) { const u = k.charAt(0).toUpperCase() + k.slice(1); if (mapa[u] === undefined) mapa[u] = mapa[k].charAt(0).toUpperCase() + mapa[k].slice(1); }
    });
    // Frases con huecos ({t}, {n}…): se vuelven patrones
    plantillas = Object.keys(mapa).filter(function (k) { return /\{[a-z$]+\}/.test(k) && /[a-z]{3}/i.test(k.replace(/\{[a-z$]+\}/g, '')); }).map(function (k) {
      const nombres = [];
      const patron = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{\\?([a-z$]+)\\\}/g, function (m, n) { nombres.push(n); return '(.+?)'; });
      return { re: new RegExp(patron, 'g'), nombres: nombres, en: mapa[k] };
    });
    const claves = Object.keys(mapa).filter(function (k) { return k.trim().length >= 3 && mapa[k] !== k; }).sort(function (a, b) { return b.length - a.length; });
    const esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    const partes = claves.map(function (k) {
      const ini = new RegExp('^[' + LETRA + ']').test(k) ? '(?<![' + LETRA + '])' : '';
      const fin = new RegExp('[' + LETRA + ']$').test(k) ? '(?![' + LETRA + '])' : '';
      return ini + esc(k) + fin;
    });
    re = partes.length ? new RegExp(partes.join('|'), 'g') : false;
  }
  function texto(s) {
    if (actual !== 'en' || !s || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(s)) return s;
    if (!mapa) return s;
    preparar();
    let t = s.trim();
    if (mapa[t] !== undefined) return s.replace(t, mapa[t]);
    const ti = ART.titulos.ingles(t); // un título inventado completo
    if (ti) return s.replace(t, ti);
    // Títulos entre comillas dentro de una frase
    s = s.replace(/«([^«»]{2,70})»/g, function (m, x) { const e = ART.titulos.ingles(x); return e ? '«' + e + '»' : m; });
    const tm = t.charAt(0).toLowerCase() + t.slice(1); // frase que empieza con mayúscula solo por ir al principio
    if (tm !== t && mapa[tm] !== undefined) return s.replace(t, mapa[tm].charAt(0).toUpperCase() + mapa[tm].slice(1));
    // Frases con huecos: se reemplazan donde aparezcan (los huecos se traducen aparte)
    plantillas.forEach(function (p) { s = s.replace(p.re, function () { const g = arguments; let out = p.en; p.nombres.forEach(function (n, j) { out = out.replace('{' + n + '}', g[j + 1]); }); return out; }); });
    REGLAS.forEach(function (x) { s = s.replace(x[0], x[1]); });
    if (re) s = s.replace(re, function (m) { return mapa[m] !== undefined ? mapa[m] : m; });
    REGLAS_FIN.forEach(function (x) { s = s.replace(x[0], x[1]); });
    return s;
  }
  const ATRIBUTOS = ['placeholder', 'title', 'aria-label'];
  // Lo que ya viene escrito en inglés (data-fijo) no pasa por el diccionario
  function fijo(n) { const e = n.nodeType === 1 ? n : n.parentNode; return !!(e && e.closest && e.closest('[data-fijo]')); }
  function nodo(raiz) {
    if (actual !== 'en' || !raiz || fijo(raiz)) return;
    if (raiz.nodeType === 3) { const v = texto(raiz.nodeValue); if (v !== raiz.nodeValue) raiz.nodeValue = v; return; }
    if (raiz.nodeType !== 1 || raiz.tagName === 'SCRIPT' || raiz.tagName === 'STYLE' || raiz.tagName === 'TEXTAREA') return;
    ATRIBUTOS.forEach(function (a) { const v = raiz.getAttribute && raiz.getAttribute(a); if (v) { const w = texto(v); if (w !== v) raiz.setAttribute(a, w); } });
    const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n = tw.nextNode();
    while (n) {
      if (n.nodeType === 3) { if (!n.parentNode || (['SCRIPT', 'STYLE', 'TEXTAREA'].indexOf(n.parentNode.tagName) < 0 && !fijo(n))) { const v = texto(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } }
      else ATRIBUTOS.forEach(function (a) { const v = n.getAttribute(a); if (v) { const w = texto(v); if (w !== v) n.setAttribute(a, w); } });
      n = tw.nextNode();
    }
  }
  function observar() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    if (obs) obs.disconnect();
    if (actual !== 'en') return;
    obs = new MutationObserver(function (lista) {
      obs.disconnect();
      lista.forEach(function (m) {
        if (m.type === 'characterData') nodo(m.target);
        else m.addedNodes.forEach(function (x) { nodo(x); });
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    nodo(document.body);
  }
  // El texto dibujado en los lienzos (fachada, pósters, portadas) también se traduce
  let lienzo = false;
  function parcheLienzo() {
    if (lienzo || typeof CanvasRenderingContext2D === 'undefined') return;
    lienzo = true;
    const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s) { const a = Array.prototype.slice.call(arguments); if (actual === 'en' && typeof s === 'string' && mapa) { const t = s.trim(); if (mapa[t] !== undefined) a[0] = s.replace(t, mapa[t]); else { const ti = ART.titulos.ingles(t) || ART.titulos.ingles(t.charAt(0) + t.slice(1).toLowerCase()); if (ti) a[0] = s.replace(t, t === t.toUpperCase() ? ti.toUpperCase() : ti); } } return f.apply(this, a); }; // en los lienzos, solo frases completas: un póster no queda a medio traducir
  }
  function poner(id) {
    actual = id === 'en' ? 'en' : 'es';
    if (actual === 'en') parcheLienzo();
    if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', actual);
    if (actual === 'en') cargar().then(observar); else observar();
  }
  return { poner: poner, actual: function () { return actual; }, texto: texto, nodo: nodo };
})();
