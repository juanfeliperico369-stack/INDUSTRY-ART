/* ==== módulo: guardado ==== */
// Base de datos del navegador (IndexedDB) con el almacenamiento simple como respaldo; compresión nativa
// (gzip) o un compresor propio (LZW) cuando no existe; 5 ranuras manuales y 3 autoguardados rotativos;
// archivo .iasave para pasar la partida del celular al PC. Cada guardado lleva versión y suma de verificación,
// y las migraciones van en orden (V16 → V17 → …). Nunca falla en silencio (fallo de la V15).
IA.guardado = (function () {
  'use strict';
  const N = IA.n;
  // (el prefijo se queda en v16 a propósito: así la V17 encuentra las partidas guardadas por la V16)
  const BD = 'industryart', ALMACEN = 'partidas', PREFIJO = 'industryart.v16.';
  const MANUALES = ['m1', 'm2', 'm3', 'm4', 'm5'], AUTOS = ['a1', 'a2', 'a3'];
  // Migraciones: MIGRACIONES[17] convierte una partida V16 en V17, y así. Las partidas de la V15 no se migran.
  const MIGRACIONES = {};
  // V16 → V17 (Fábrica de ideas): guiones en venta, guiones propios, usos de material y regla del dominio público.
  // Las obras viejas no cambian: los campos nuevos de la idea toman sus valores por defecto al leerse.
  MIGRACIONES[17] = function (S) {
    if (!S.guiones) S.guiones = [];
    if (!S.guionesPropios) S.guionesPropios = [];
    if (!S.usosMaterial) S.usosMaterial = {};
    if (!S.reglaDominio) S.reglaDominio = 70;
  };

  // ---------- Suma de verificación (FNV-1a de 32 bits) ----------
  function suma(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  // ---------- Compresión ----------
  function hayGzip() { return typeof CompressionStream === 'function' && typeof DecompressionStream === 'function' && typeof Response === 'function'; }
  async function gzip(texto) {
    const flujo = new Blob([texto]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(flujo).arrayBuffer());
  }
  async function gunzip(bytes) {
    const flujo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(flujo).text();
  }
  // Compresor propio para navegadores sin CompressionStream: LZW con diccionario que crece (los caracteres
  // entran al diccionario cuando aparecen) y ancho de bits variable. Sin librerías.
  function escritorBits() {
    const bytes = [];
    let actual = 0, n = 0;
    return {
      escribir: function (valor, bits) {
        for (let i = 0; i < bits; i++) {
          actual = (actual << 1) | (valor & 1);
          valor >>>= 1;
          if (++n === 8) { bytes.push(actual); actual = 0; n = 0; }
        }
      },
      fin: function () { if (n > 0) bytes.push(actual << (8 - n)); return new Uint8Array(bytes); },
    };
  }
  function lectorBits(bytes) {
    let pos = 0, bit = 0;
    return function (bits) {
      let v = 0;
      for (let i = 0; i < bits; i++) {
        if (pos >= bytes.length) throw new Error('datos dañados');
        const b = (bytes[pos] >> (7 - bit)) & 1;
        v |= b << i;
        if (++bit === 8) { bit = 0; pos++; }
      }
      return v >>> 0;
    };
  }
  function lzwComprimir(texto) {
    const dic = new Map(), porCrear = new Set();
    const out = escritorBits();
    let w = '', agrandar = 2, tam = 3, bits = 2;
    function crecer() { if (--agrandar === 0) { agrandar = Math.pow(2, bits); bits++; } }
    function emitir(x) {
      if (porCrear.has(x)) {
        const cod = x.charCodeAt(0);
        if (cod < 256) { out.escribir(0, bits); out.escribir(cod, 8); } else { out.escribir(1, bits); out.escribir(cod, 16); }
        crecer();
        porCrear.delete(x);
      } else {
        out.escribir(dic.get(x), bits);
      }
      crecer();
    }
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (!dic.has(c)) { dic.set(c, tam++); porCrear.add(c); }
      const wc = w + c;
      if (dic.has(wc)) { w = wc; continue; }
      emitir(w);
      dic.set(wc, tam++);
      w = c;
    }
    if (w !== '') emitir(w);
    out.escribir(2, bits);
    return out.fin();
  }
  function lzwDescomprimir(bytes) {
    const leerBits = lectorBits(bytes);
    const dic = ['', '', ''];
    let agrandar = 4, tam = 4, bits = 3;
    const tipo = leerBits(2);
    if (tipo === 2) return '';
    let w = String.fromCharCode(leerBits(tipo === 0 ? 8 : 16));
    dic[3] = w;
    const partes = [w];
    for (;;) {
      let c = leerBits(bits);
      if (c === 0 || c === 1) {
        dic[tam++] = String.fromCharCode(leerBits(c === 0 ? 8 : 16));
        c = tam - 1;
        agrandar--;
      } else if (c === 2) {
        return partes.join('');
      }
      if (agrandar === 0) { agrandar = Math.pow(2, bits); bits++; }
      let entrada;
      if (dic[c] !== undefined && c < tam) entrada = dic[c];
      else if (c === tam) entrada = w + w[0];
      else throw new Error('datos dañados');
      partes.push(entrada);
      dic[tam++] = w + entrada[0];
      agrandar--;
      w = entrada;
      if (agrandar === 0) { agrandar = Math.pow(2, bits); bits++; }
    }
  }
  async function comprimir(texto) {
    if (hayGzip()) { try { return { comp: 'gzip', datos: await gzip(texto) }; } catch (e) { /* sigue con el propio */ } }
    return { comp: 'lzw', datos: lzwComprimir(texto) };
  }
  async function descomprimir(comp, datos) {
    if (comp === 'gzip') return await gunzip(datos);
    if (comp === 'lzw') return lzwDescomprimir(datos);
    if (comp === 'none') return typeof datos === 'string' ? datos : new TextDecoder().decode(datos);
    throw new Error('compresión desconocida');
  }
  function aBase64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return btoa(s);
  }
  function deBase64(b64) {
    const s = atob(b64);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  // ---------- Almacén: IndexedDB o almacenamiento simple ----------
  let bdPromesa = null;
  function abrir() {
    if (bdPromesa) return bdPromesa;
    bdPromesa = new Promise(function (ok) {
      try {
        if (!window.indexedDB) return ok(null);
        const pet = indexedDB.open(BD, 1);
        pet.onupgradeneeded = function () { pet.result.createObjectStore(ALMACEN, { keyPath: 'ranura' }); };
        pet.onsuccess = function () { ok(pet.result); };
        pet.onerror = function () { ok(null); };
        pet.onblocked = function () { ok(null); };
      } catch (e) { ok(null); }
    });
    return bdPromesa;
  }
  async function escribir(registro) {
    const bd = await abrir();
    if (bd) {
      return await new Promise(function (ok, mal) {
        const tx = bd.transaction(ALMACEN, 'readwrite');
        tx.objectStore(ALMACEN).put(registro);
        tx.oncomplete = function () { ok(true); };
        tx.onerror = function () { mal(tx.error || new Error('error de la base de datos')); };
        tx.onabort = function () { mal(tx.error || new Error('el guardado se canceló (¿sin espacio?)')); };
      });
    }
    const copia = Object.assign({}, registro, { datos: aBase64(registro.datos) });
    localStorage.setItem(PREFIJO + registro.ranura, JSON.stringify(copia));
    return true;
  }
  async function leer(ranura) {
    const bd = await abrir();
    if (bd) {
      return await new Promise(function (ok, mal) {
        const pet = bd.transaction(ALMACEN, 'readonly').objectStore(ALMACEN).get(ranura);
        pet.onsuccess = function () { ok(pet.result || null); };
        pet.onerror = function () { mal(pet.error); };
      });
    }
    const t = localStorage.getItem(PREFIJO + ranura);
    if (!t) return null;
    const r = JSON.parse(t);
    r.datos = deBase64(r.datos);
    return r;
  }
  async function borrar(ranura) {
    const bd = await abrir();
    if (bd) {
      return await new Promise(function (ok) {
        const tx = bd.transaction(ALMACEN, 'readwrite');
        tx.objectStore(ALMACEN).delete(ranura);
        tx.oncomplete = function () { ok(true); };
        tx.onerror = function () { ok(false); };
      });
    }
    localStorage.removeItem(PREFIJO + ranura);
    return true;
  }
  // Lista de ranuras con sus datos visibles (sin descomprimir)
  async function listar() {
    const out = [];
    const todas = MANUALES.concat(AUTOS);
    for (let i = 0; i < todas.length; i++) {
      let r = null;
      try { r = await leer(todas[i]); } catch (e) { r = null; }
      out.push({ ranura: todas[i], manual: MANUALES.indexOf(todas[i]) >= 0, meta: r ? r.meta : null });
    }
    return out;
  }

  // ---------- Partida <-> registro ----------
  function metaDe(S) {
    const est = S.estudios[0];
    return {
      nombre: est.nombre, anio: N.anio(), semana: N.semana(), caja: Math.round(est.caja), version: S.v,
      semilla: S.semilla, fecha: new Date().toISOString(), juego: IA.VERSION,
    };
  }
  async function empaquetar(S) {
    const texto = JSON.stringify(S);
    const c = await comprimir(texto);
    return { meta: metaDe(S), comp: c.comp, datos: c.datos, suma: suma(texto), version: S.v, bytes: texto.length };
  }
  async function desempaquetar(reg) {
    const texto = await descomprimir(reg.comp, reg.datos);
    if (reg.suma && suma(texto) !== reg.suma) throw new Error('la suma de verificación no coincide');
    return migrar(JSON.parse(texto));
  }
  function migrar(S) {
    if (!S || S.juego !== 'INDUSTRY ART' || typeof S.v !== 'number') throw new Error('no es una partida de INDUSTRY ART V16 o posterior');
    if (S.v > IA.VERSION_GUARDADO) throw new Error('la partida es de una versión más nueva (V' + S.v + ')');
    while (S.v < IA.VERSION_GUARDADO) {
      const m = MIGRACIONES[S.v + 1];
      if (!m) throw new Error('no hay migración desde la V' + S.v);
      m(S);
      S.v++;
    }
    return S;
  }
  // Pone una partida cargada en juego
  function activar(S) {
    N.S = S;
    IA.juego.conectar();
    IA.talentos.reindexar();
    IA.obras.reindexar();
    N.emit('partidaCargada', S);
  }

  // ---------- API pública ----------
  async function guardar(ranura) {
    try {
      const reg = await empaquetar(N.S);
      reg.ranura = ranura;
      await escribir(reg);
      // Se relee lo escrito para confirmar que quedó bien (la V15 decía "guardado" aunque no cupiera)
      const leido = await leer(ranura);
      if (!leido || leido.suma !== reg.suma || leido.datos.length !== reg.datos.length) throw new Error('no se pudo confirmar el guardado');
      return { ok: true, bytes: reg.datos.length, comp: reg.comp };
    } catch (e) {
      return { ok: false, error: (e && e.message) || String(e) };
    }
  }
  // Autoguardado rotativo entre a1, a2 y a3: usa una ranura vacía o la más vieja
  async function autoguardar() {
    const autos = (await listar()).filter(function (x) { return !x.manual; });
    let elegido = autos.filter(function (x) { return !x.meta; })[0];
    if (!elegido) elegido = autos.slice().sort(function (a, b) { return Date.parse(a.meta.fecha) - Date.parse(b.meta.fecha); })[0];
    return await guardar(elegido.ranura);
  }
  async function cargar(ranura) {
    try {
      const reg = await leer(ranura);
      if (!reg) return { ok: false, error: 'la ranura está vacía' };
      const S = await desempaquetar(reg);
      activar(S);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e && e.message) || String(e) };
    }
  }
  // La partida más reciente de cualquier ranura (para "Continuar")
  async function masReciente() {
    const lista = await listar();
    let mejor = null;
    lista.forEach(function (x) { if (x.meta && (!mejor || Date.parse(x.meta.fecha) > Date.parse(mejor.meta.fecha))) mejor = x; });
    return mejor;
  }
  // Archivo .iasave: texto JSON con los datos comprimidos en base64
  async function exportarTexto() {
    const reg = await empaquetar(N.S);
    return JSON.stringify({ formato: 'iasave', juego: 'INDUSTRY ART', version: reg.version, meta: reg.meta, comp: reg.comp, suma: reg.suma, datos: aBase64(reg.datos) });
  }
  async function exportarArchivo() {
    try {
      const texto = await exportarTexto();
      const est = N.S.estudios[0];
      const nombre = ('industryart_' + est.nombre + '_' + N.anio()).toLowerCase().replace(/[^a-z0-9_]+/g, '_') + '.iasave';
      const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = nombre;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      return { ok: true, nombre: nombre, bytes: texto.length };
    } catch (e) {
      return { ok: false, error: (e && e.message) || String(e) };
    }
  }
  async function importarTexto(texto) {
    try {
      let o = null;
      try { o = JSON.parse(texto); } catch (e) { o = null; }
      if (!o || o.formato !== 'iasave' || o.juego !== 'INDUSTRY ART') throw new Error(IA.t('gua_corrupto'));
      const S = await desempaquetar({ comp: o.comp, datos: deBase64(o.datos), suma: o.suma });
      activar(S);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e && e.message) || String(e) };
    }
  }
  // Tamaño comprimido de la partida actual (para el bot)
  async function medir() {
    const reg = await empaquetar(N.S);
    return { json: reg.bytes, comprimido: reg.datos.length, comp: reg.comp };
  }

  return {
    MANUALES: MANUALES, AUTOS: AUTOS, suma: suma, hayGzip: hayGzip, comprimir: comprimir, descomprimir: descomprimir,
    lzwComprimir: lzwComprimir, lzwDescomprimir: lzwDescomprimir, migrar: migrar, listar: listar,
    guardar: guardar, autoguardar: autoguardar, cargar: cargar, borrar: borrar, masReciente: masReciente,
    exportarTexto: exportarTexto, exportarArchivo: exportarArchivo, importarTexto: importarTexto, medir: medir, activar: activar,
  };
})();
