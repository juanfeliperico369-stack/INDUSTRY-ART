/* ==== módulo: ventanas ==== */
// V20 · Lanzamiento: la vida de una obra después de los cines. Las ventanas van en orden (cines, video
// doméstico, televisión y streaming) salvo que se elija estrenar directo en video o en streaming. Cada ventana
// tiene sus estadísticas (copias, espectadores, vistas) y el video sus certificaciones de oro, platino y diamante
// desde su año real. Lo que el estudio gana en total no cambia en promedio: desde que existe la TV, una parte de
// lo que antes salía de la taquilla llega después por las ventanas (así la economía calibrada se mantiene).
// Además: reestrenos, remasterizaciones y la bóveda.
IA.ventanas = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, M = IA.mundo;

  const VENTANAS = [
    { id: 'video', nombre: 'Video doméstico', desde: 1977 },
    { id: 'tv', nombre: 'Televisión', desde: 1955 },
    { id: 'streaming', nombre: 'Streaming', desde: 2007 },
  ];
  // Parte de lo que gana el estudio con una obra que llega por las ventanas (el resto, en los cines)
  const PARTE_VENTANAS = [[1954, 0], [1955, 0.05], [1965, 0.1], [1977, 0.12], [1985, 0.3], [1995, 0.42], [2005, 0.5], [2015, 0.48], [2150, 0.5]];
  const MEZCLA_VIDEO = [[1976, 0], [1982, 0.5], [1990, 0.65], [2005, 0.75], [2012, 0.5], [2020, 0.2], [2035, 0.08], [2150, 0.05]];
  const MEZCLA_STREAMING = [[2006, 0], [2012, 0.15], [2020, 0.6], [2030, 0.72], [2150, 0.78]];
  // Formatos del video doméstico (precio de una copia en dólares de hoy)
  const FORMATOS = [
    { id: 'VHS', desde: 1977, hasta: 2006, precio: 40 }, { id: 'DVD', desde: 1997, hasta: 2022, precio: 22 },
    { id: 'Blu-ray', desde: 2006, hasta: 2150, precio: 26 }, { id: 'Digital', desde: 2010, hasta: 2150, precio: 15 },
  ];
  // Certificaciones del video (copias), desde su año real
  const CERTIFICACIONES = [{ id: 'oro', nombre: 'Oro', copias: 250000 }, { id: 'platino', nombre: 'Platino', copias: 500000 }, { id: 'diamante', nombre: 'Diamante', copias: 1000000 }];
  const ANIO_CERT = 1979;
  const PRECIO_VISTA = 1.5, PRECIO_ESPECTADOR_TV = 0.25; // dólares de hoy por vista de streaming y por espectador de TV

  function parteVentanas(anio) { return N.interp(PARTE_VENTANAS, anio); }
  function disponibles(anio) { return VENTANAS.filter(function (v) { return v.desde <= anio; }); }
  function mezcla(anio) {
    const vid = anio >= 1977 ? N.interp(MEZCLA_VIDEO, anio) : 0;
    const st = anio >= 2007 ? N.interp(MEZCLA_STREAMING, anio) : 0;
    const tv = anio >= 1955 ? Math.max(0.1, 1 - vid - st) : 0;
    const s = vid + st + tv;
    return s > 0 ? { video: vid / s, tv: tv / s, streaming: st / s } : { video: 0, tv: 0, streaming: 0 };
  }
  function formatoVideo(anio) {
    const fs = FORMATOS.filter(function (f) { return f.desde <= anio && f.hasta >= anio; });
    return fs.length ? fs[fs.length - 1] : FORMATOS[0];
  }
  // Cuánto rinde una obra en las ventanas frente a lo normal: calidad, familia, premios y ediciones exclusivas
  const AJ = { base: 1, q: 0.5 };
  const FAMILIA = { FJ: 1.25, IM: 1.15, SM: 1.1, AA: 1.1, HM: 1.0, RD: 0.95, DR: 0.9, AV: 0.8 };
  function rendimiento(o) {
    // Centrado en una obra típica (público 72, familia media): en promedio no cambia lo que gana el estudio
    const q = N.limitar(((o.pub || 72) - 72) / 40, -0.8, 0.7);
    return AJ.base * (1 + AJ.q * q) * (FAMILIA[o.fam] || 1) / 1.04 * (1 + 0.06 * ((o.aw || []).length));
  }
  // Semanas desde el fin de los cines hasta que abre cada ventana, y cuántas dura
  function calendario(id, anio) {
    if (id === 'video') return { espera: anio < 1990 ? 26 : anio < 2010 ? 16 : anio < 2020 ? 12 : 6, dura: 26 };
    if (id === 'tv') return { espera: anio < 1990 ? 104 : 52, dura: 52 };
    return { espera: anio < 2020 ? 12 : 6, dura: 52 };
  }

  // ---------- Programar las ventanas de una obra ----------
  // total: lo que el estudio cobrará en todas las ventanas. Para una obra de cines, sale de su parte de taquilla
  // (que ya se recortó por esa misma proporción); para un estreno directo, de lo que habría hecho en cines.
  function programar(o, total, anio) {
    const mz = mezcla(anio);
    o.vt = { total: Math.round(total), cob: 0 };
    VENTANAS.forEach(function (v) {
      if (v.desde > anio || !mz[v.id]) return;
      let parte = mz[v.id];
      if (v.id === 'video' && o.plan && o.plan.promo && o.plan.promo.indexOf('exclusivos') >= 0) parte *= 1.15;
      const cal = calendario(v.id, anio);
      const espera = o.dir === v.id ? 0 : cal.espera;
      o.vt[v.id] = { t0: N.S.t + espera, dura: cal.dura, total: Math.round(total * parte), pag: 0, n: 0 };
    });
    // Reajuste: lo programado suma el total (las ediciones exclusivas agregan su 15 %)
    o.vt.total = VENTANAS.reduce(function (s, v) { return s + (o.vt[v.id] ? o.vt[v.id].total : 0); }, 0);
    // Adelanto: quien compra cada ventana paga una parte al firmar (así el dinero no queda años detenido)
    VENTANAS.forEach(function (v) {
      const w = o.vt[v.id];
      if (!w) return;
      w.adel = Math.round(w.total * ADELANTO);
      if (w.adel <= 0) return;
      w.pag = w.adel;
      o.vt.cob += w.adel;
      cobrar(o, v.id, w.adel);
    });
  }
  const ADELANTO = 0.35;
  // Cobra lo de una ventana; los talentos con porcentaje también cobran su parte (como en la taquilla)
  function cobrar(o, cat, monto) {
    IA.negocio.cobrarEn(o.est, cat, cat === 'video' || cat === 'streaming' ? monto * IA.historia.pirateria(N.anio()) : monto); // piratería por época (V24)
    if (!o.pctT) return;
    let pct = 0;
    Object.keys(o.pctT).forEach(function (id) { pct += o.pctT[id]; });
    const p = monto * pct / 100;
    if (p <= 0) return;
    IA.negocio.pagar(o.est, 'talento', p);
    o.part = (o.part || 0) + p;
    Object.keys(o.pctT).forEach(function (id) { IA.talentos.pagarA(+id, monto * o.pctT[id] / 100); });
  }
  // Al terminar en cines: la parte que se recortó de la taquilla vuelve por las ventanas, según cómo rinda la obra
  function alTerminar(o) {
    const anio = o.anio || N.anio();
    const f = o.fv !== undefined ? o.fv : 0; // obras de partidas viejas (sin fv): ya cobraron todo en cines
    if (f <= 0 || o.dir) return;
    const completa = (o.parte || 0) / Math.max(0.05, 1 - f);
    programar(o, completa * f * rendimiento(o), N.anio());
  }
  // Estreno directo en video o en streaming: sin cines, con lo que la obra habría hecho por su calidad
  const MULT_POR_PUBLICO = [[20, 0.2], [40, 0.6], [50, 0.9], [60, 1.4], [70, 2.0], [80, 2.8], [90, 3.8]];
  function estimarParteCines(o) { return E.presupuestoTipico(N.anio()) * N.interp(MULT_POR_PUBLICO, o.pub || 50) * 0.55 * Math.max(0.3, Math.min(3, ((o.cf || 0) + (o.gp || 0)) / E.presupuestoTipico(N.anio()))); }
  function viasDirectas(anio) {
    const r = [];
    if (anio >= 1980) r.push({ id: 'video', nombre: 'Directo a video' });
    if (anio >= 2010) r.push({ id: 'streaming', nombre: 'Directo a streaming' });
    return r;
  }
  function estrenarDirecto(o, via) {
    o.dir = via;
    o.et = 'terminada';
    o.anio = N.anio();
    o.sc = 0; o.bruto = 0; o.parte = 0; o.ent = 0; o.hs = [];
    const total = estimarParteCines(o) * (via === 'streaming' ? 0.5 : 0.45) * rendimiento(o);
    programar(o, total, N.anio());
    // Va todo a la ventana elegida primero (y lo demás después)
    N.emit('noticia', { tipo: o.est === 0 ? 'estudio' : 'rival', texto: '«' + o.tit + '» se estrena directo en ' + (via === 'video' ? 'video' : 'streaming') + '.' });
  }

  // ---------- Cada semana: cobrar lo que corresponde a cada ventana ----------
  function semana(ctx) {
    const S = N.S, t = S.t, anio = N.anio();
    S.obras.forEach(function (o) {
      if (!o.vt || o.vt.fin) return;
      if (o.bov) return; // en la bóveda no se vende ni se emite
      let abiertas = 0;
      VENTANAS.forEach(function (v) {
        const w = o.vt[v.id];
        if (!w || w.t0 === undefined || w.n >= w.dura) return;
        abiertas++;
        if (t < w.t0) return;
        // Más al principio y menos al final (cada semana el 92 % de la anterior)
        const k = w.n, r = 0.92;
        const peso = Math.pow(r, k) * (1 - r) / (1 - Math.pow(r, w.dura));
        const resto = w.total - (w.adel || 0);
        const monto = w.n === w.dura - 1 ? w.total - w.pag : resto * peso;
        w.n++;
        if (monto <= 0) return;
        w.pag += monto;
        o.vt.cob += monto;
        cobrar(o, v.id, monto);
        // Estadísticas en dólares de hoy
        const hoy = M.aHoy(monto * w.total / Math.max(1, resto), anio);
        if (v.id === 'video') {
          const f = formatoVideo(anio);
          w.fmt = f.id;
          const antes = w.copias || 0;
          w.copias = Math.round(antes + hoy / f.precio);
          if (o.est === 0 && anio >= ANIO_CERT) certificar(o, antes, w.copias);
        } else if (v.id === 'tv') w.esp = Math.round((w.esp || 0) + hoy / PRECIO_ESPECTADOR_TV);
        else w.vistas = Math.round((w.vistas || 0) + hoy / PRECIO_VISTA);
      });
      if (!abiertas) { o.vt.fin = 1; o.vt.cob = Math.round(o.vt.cob); }
    });
    // Reestrenos en marcha
    (S.reestrenos || []).forEach(function (r) {
      if (r.n >= r.dura) return;
      const o = IA.obras.porId(r.id);
      const monto = r.total / r.dura;
      r.n++;
      IA.negocio.cobrarEn(0, 'reestrenos', monto);
      if (o) o.reB = Math.round((o.reB || 0) + monto);
    });
    if (S.reestrenos) S.reestrenos = S.reestrenos.filter(function (r) { return r.n < r.dura; });
    void ctx;
  }
  function certificar(o, antes, ahora) {
    CERTIFICACIONES.forEach(function (c) {
      if (antes < c.copias && ahora >= c.copias) {
        o.cert = c.id;
        N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» es ' + c.nombre.toLowerCase() + ' en video: más de ' + (c.copias / 1000) + ' mil copias.', importante: c.id !== 'oro' });
      }
    });
  }
  function estadisticas(o) {
    if (!o.vt) return [];
    return VENTANAS.filter(function (v) { return o.vt[v.id]; }).map(function (v) {
      const w = o.vt[v.id];
      // (las ventanas viejas quedan compactadas: solo su total y sus cifras, ya cobradas)
      const cerrada = w.t0 === undefined || w.n >= w.dura;
      const estado = o.bov && !cerrada ? 'boveda' : cerrada ? 'terminada' : N.S.t < w.t0 ? 'pendiente' : 'curso';
      return { id: v.id, nombre: v.nombre + (v.id === 'video' && w.fmt ? ' (' + w.fmt + ')' : ''), estado: estado, t0: w.t0, cobrado: Math.round((w.pag !== undefined ? w.pag : w.total) + (w.prev || 0)), total: w.total + (w.prev || 0),
        dato: v.id === 'video' ? (w.copias || 0) + ' copias' : v.id === 'tv' ? (w.esp || 0) + ' espectadores' : (w.vistas || 0) + ' vistas',
        n: v.id === 'video' ? (w.copias || 0) : v.id === 'tv' ? (w.esp || 0) : (w.vistas || 0), unidad: v.id === 'video' ? 'copias' : v.id === 'tv' ? 'espectadores' : 'vistas' };
    });
  }

  // ---------- Reestrenos, remasterizaciones y la bóveda (tu catálogo) ----------
  const ESPERA_REESTRENO = 7, ENTRE_REESTRENOS = 5;
  function puedeReestrenar(o) {
    if (!o || o.est !== 0 || o.et !== 'terminada') return 'Solo tus obras ya estrenadas.';
    if (o.dir) return 'Se estrenó directo: no tiene reestreno en cines.';
    if (o.tv) return 'Las series se repiten en tu canal o en tu plataforma.';
    if (N.anio() - o.anio < ESPERA_REESTRENO) return 'Un reestreno necesita ' + ESPERA_REESTRENO + ' años desde el estreno.';
    if (o.reA && N.anio() - o.reA < ENTRE_REESTRENOS) return 'Debe pasar ' + ENTRE_REESTRENOS + ' años entre reestrenos.';
    if ((N.S.reestrenos || []).some(function (r) { return r.id === o.id; })) return 'Ya está en cartelera otra vez.';
    return '';
  }
  // Lo que dejaría un reestreno: la taquilla original en dinero de hoy, la calidad, la nostalgia, los premios,
  // la remasterización y los años en la bóveda (cada reestreno vale la mitad que el anterior)
  function valorReestreno(o, nivel) {
    const anio = N.anio();
    const orig = M.aEpoca(M.aHoy(o.bruto || 0, o.anio), anio);
    const calidad = N.limitar(((o.pub || 60) + (o.crit || 60)) / 140, 0.5, 1.4);
    const nostalgia = N.limitar((anio - o.anio) / 25, 0.3, 1.5);
    const premios = 1 + 0.15 * (o.aw || []).length;
    const rem = o.rem ? 1.4 : 1;
    const bov = 1 + Math.min(1.5, (o.bovA || 0) * 0.12);
    const veces = Math.pow(0.5, o.re || 0) * IA.critica.factorEtiquetas(o); // etiquetas (V22)
    return Math.round(orig * 0.05 * calidad * nostalgia * premios * rem * bov * veces * [0.6, 1, 1.4][nivel] * 0.6);
  }
  function costoReestreno(nivel) { return Math.round(E.marketingTipico(N.anio()) * [0.4, 0.8, 1.5][nivel]); }
  function reestrenar(id, nivel) {
    const o = IA.obras.porId(id);
    const err = puedeReestrenar(o);
    if (err) return err;
    const costo = costoReestreno(nivel);
    if (N.S.estudios[0].caja < costo) return 'No alcanza la caja para la campaña del reestreno.';
    IA.negocio.pagar(0, 'marketing', costo);
    N.S.reestrenos = N.S.reestrenos || [];
    N.S.reestrenos.push({ id: o.id, n: 0, dura: 6, total: valorReestreno(o, nivel) });
    o.re = (o.re || 0) + 1; o.reA = N.anio(); o.bovA = 0;
    N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» vuelve a los cines.', importante: true });
    return '';
  }
  // Remasterizar: cuando existe un formato nuevo desde su estreno; deja una edición nueva en video
  function formatoNuevo(o) {
    const desde = Math.max(o.rem || 0, o.anio);
    const nuevos = FORMATOS.filter(function (f) { return f.desde > desde && f.desde <= N.anio(); });
    return nuevos.length ? nuevos[nuevos.length - 1] : null;
  }
  function costoRemaster() { return Math.round(E.presupuestoTipico(N.anio()) * 0.08); }
  function puedeRemasterizar(o) {
    if (!o || o.est !== 0 || o.et !== 'terminada') return 'Solo tus obras ya estrenadas.';
    if (!formatoNuevo(o)) return 'No hay un formato nuevo desde ' + Math.max(o.rem || 0, o.anio) + '.';
    if (N.S.estudios[0].caja < costoRemaster()) return 'No alcanza la caja.';
    return '';
  }
  function remasterizar(id) {
    const o = IA.obras.porId(id);
    const err = puedeRemasterizar(o);
    if (err) return err;
    const f = formatoNuevo(o);
    IA.negocio.pagar(0, 'produccion', costoRemaster());
    o.rem = N.anio();
    // Una edición nueva en video: vende según su fama y calidad (en la bóveda vale más)
    const total = valorReestreno(o, 1) * 0.6;
    o.vt = o.vt || { total: 0, cob: 0 };
    o.vt.fin = 0;
    const antes = o.vt.video || {};
    // La edición nueva se cobra sola; las copias se suman a las de antes
    o.vt.video = { t0: N.S.t + 2, dura: 26, total: Math.round(total), pag: 0, n: 0, copias: antes.copias || 0, prev: Math.round((antes.total || 0) + (antes.prev || 0)) };
    o.vt.total = Math.round((o.vt.total || 0) + total);
    N.emit('noticia', { tipo: 'estudio', texto: 'Remasterizas «' + o.tit + '» en ' + f.id + '.' });
    return '';
  }
  // La bóveda: mientras está guardada no se vende ni se emite, y cada año guardada vale más al salir
  function alternarBoveda(id) {
    const o = IA.obras.porId(id);
    if (!o || o.est !== 0 || o.et !== 'terminada') return 'Solo tus obras ya estrenadas.';
    if (o.bov) { delete o.bov; return ''; }
    o.bov = N.S.t;
    return '';
  }
  // Cada año: las obras en la bóveda suman un año de espera
  function anual() {
    N.S.obras.forEach(function (o) { if (o.bov) o.bovA = (o.bovA || 0) + 1; });
  }

  return {
    AJ: AJ, VENTANAS: VENTANAS, FORMATOS: FORMATOS, CERTIFICACIONES: CERTIFICACIONES, ANIO_CERT: ANIO_CERT, parteVentanas: parteVentanas,
    disponibles: disponibles, mezcla: mezcla, formatoVideo: formatoVideo, rendimiento: rendimiento, programar: programar, alTerminar: alTerminar,
    viasDirectas: viasDirectas, estimarParteCines: estimarParteCines, estrenarDirecto: estrenarDirecto, semana: semana, estadisticas: estadisticas,
    puedeReestrenar: puedeReestrenar, valorReestreno: valorReestreno, costoReestreno: costoReestreno, reestrenar: reestrenar,
    formatoNuevo: formatoNuevo, costoRemaster: costoRemaster, puedeRemasterizar: puedeRemasterizar, remasterizar: remasterizar,
    alternarBoveda: alternarBoveda, anual: anual,
  };
})();
