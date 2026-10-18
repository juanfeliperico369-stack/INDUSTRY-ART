/* ==== módulo: tv ==== */
// Televisión: formatos por época (temporada larga, telenovela, miniserie, temporada corta y programas en
// vivo), de 2 a 300 episodios y de 5 a 180 minutos; episódica o serializada; sala de guionistas; 2 o 3 tramas
// con nota; piloto antes de pedir la temporada; presentar la idea (pitch); elegir dónde se emite (tu canal, la
// cadena de un rival, tu plataforma o una ajena); audiencias por episodio; renovar o cancelar. Canal propio con
// parrilla de 7 días × 6 franjas, autocompletar, horario familiar con multa, público por grupos, frescura de lo
// repetido, patrocinadores con metas, tema del canal y noticias que se compran y vencen.
ART.tv = (function () {
  'use strict';
  const N = ART.n, O = ART.obras, D = ART.datos;
  const tip = function (a) { return ART.economia.presupuestoTipico(a || N.anio()); };
  const ANIO_TV = 1940, ANIO_CANAL = 1946;
  const FORMATOS = [
    { id: 'larga', nombre: 'Temporada larga', desde: 1950, eps: [20, 26], def: 22, min: 44, rmin: [22, 60], k: 1, sem: 1 },
    { id: 'telenovela', nombre: 'Telenovela diaria', desde: 1951, eps: [100, 300], def: 150, min: 45, rmin: [30, 60], k: 0.2, sem: 5 },
    { id: 'miniserie', nombre: 'Miniserie', desde: 1960, eps: [2, 10], def: 6, min: 60, rmin: [45, 120], k: 1.3, sem: 1 },
    { id: 'corta', nombre: 'Temporada corta', desde: 2007, eps: [6, 13], def: 8, min: 50, rmin: [30, 70], k: 1.45, sem: 1 },
    { id: 'vivo', nombre: 'Programa en vivo', desde: 1940, eps: [13, 300], def: 40, min: 60, rmin: [5, 180], k: 0.12, sem: 1, vivo: 1 },
  ];
  const SUBVIVO = [{ id: 'noticiero', nombre: 'Noticiero', desde: 1940 }, { id: 'variedades', nombre: 'Variedades', desde: 1948 }, { id: 'concurso', nombre: 'Concurso', desde: 1950 }, { id: 'reality', nombre: 'Reality', desde: 1992 }];
  // Las 24 horas del día en 8 franjas (h: hora de inicio y de fin)
  const FRANJAS = [
    { id: 'madrugada', nombre: 'Madrugada', corto: 'Madrugada', h: [0, 6], peso: 0.12, ed: [0, 0.5, 1.3, 1.1, 0.6] },
    { id: 'manana', nombre: 'Mañana', corto: 'Mañana', h: [6, 9], peso: 0.3, ed: [1.4, 0.6, 0.5, 0.9, 1.5], fam: 1 },
    { id: 'media', nombre: 'Media mañana', corto: 'Media mañana', h: [9, 12], peso: 0.32, ed: [1.1, 0.4, 0.5, 1, 1.6], fam: 1 },
    { id: 'mediodia', nombre: 'Mediodía', corto: 'Mediodía', h: [12, 15], peso: 0.5, ed: [0.8, 0.6, 0.8, 1.1, 1.4] },
    { id: 'tarde', nombre: 'Tarde', corto: 'Tarde', h: [15, 18], peso: 0.65, ed: [1.5, 1.3, 0.8, 0.8, 1], fam: 1 },
    { id: 'familiar', nombre: 'Horario familiar', corto: 'Familiar', h: [18, 20], peso: 1, ed: [1.3, 1.2, 1, 1, 1], fam: 1 },
    { id: 'estelar', nombre: 'Horario estelar', corto: 'Estelar', h: [20, 22], peso: 1.4, ed: [0.4, 1, 1.3, 1.2, 1] },
    { id: 'noche', nombre: 'Noche', corto: 'Noche', h: [22, 24], peso: 0.6, ed: [0, 0.9, 1.2, 1, 0.7] },
  ];
  const IX = {};
  FRANJAS.forEach(function (f, i) { IX[f.id] = i; });
  const VIEJAS = [1, 3, 4, 5, 6, 7]; // dónde cae cada una de las 6 franjas de antes
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  // Programas que produce el canal: q = calidad base, c = costo por emisión, ed = gusto por edad (niños, jóvenes, adultos jóvenes, adultos, mayores)
  const GENERICOS = [
    { id: 'noticiero', nombre: 'Noticiero', desde: 1940, q: 56, c: 0.5, ed: [0.2, 0.5, 1, 1.3, 1.5], col: '#5b8cff', bono: { manana: 1.15, familiar: 1.1 } },
    { id: 'variedades', nombre: 'Variedades', desde: 1948, q: 52, c: 0.45, ed: [1, 1, 1, 1, 1.1], col: '#ffc857', fam: 'HM', finde: 1.1 },
    { id: 'infantil', nombre: 'Dibujos infantiles', desde: 1950, q: 54, c: 0.35, ed: [2, 1, 0.3, 0.3, 0.3], col: '#4ade80', fam: 'FJ', bono: { manana: 1.2, tarde: 1.1 } },
    { id: 'concurso', nombre: 'Concurso', desde: 1950, q: 55, c: 0.5, ed: [0.7, 1, 1, 1.1, 1.3], col: '#ff9f43', bono: { familiar: 1.1 } },
    { id: 'deportes', nombre: 'Deportes en vivo', desde: 1950, q: 58, c: 0.9, ed: [0.5, 1.3, 1.3, 1.1, 0.8], col: '#22c55e', fam: 'AA', finde: 1.3 },
    { id: 'cine', nombre: 'Película de archivo', desde: 1950, q: 50, c: 0.4, ed: [0.8, 1, 1, 1, 1.1], col: '#9b8cff', bono: { noche: 1.1, madrugada: 1.15 } },
    { id: 'documental', nombre: 'Documental', desde: 1955, q: 53, c: 0.35, ed: [0.4, 0.6, 0.9, 1.2, 1.4], col: '#2dd4bf', fam: 'DR' },
    { id: 'entrevistas', nombre: 'Programa de entrevistas', desde: 1962, q: 55, c: 0.45, ed: [0, 0.8, 1.2, 1.1, 0.9], col: '#c084fc', bono: { noche: 1.25 } },
    { id: 'magacin', nombre: 'Magacín matinal', desde: 1965, q: 50, c: 0.3, ed: [0.3, 0.4, 0.8, 1.2, 1.6], col: '#fb923c', bono: { manana: 1.2, media: 1.2 } },
    { id: 'cocina', nombre: 'Cocina en casa', desde: 1970, q: 51, c: 0.25, ed: [0.2, 0.5, 0.9, 1.3, 1.4], col: '#fdba74', bono: { mediodia: 1.15, media: 1.1 } },
    { id: 'musical', nombre: 'Videos musicales', desde: 1981, q: 50, c: 0.15, ed: [0.6, 1.8, 1.2, 0.5, 0.2], col: '#f472b6', fam: 'HM', bono: { tarde: 1.1, madrugada: 1.2 } },
    { id: 'telecompra', nombre: 'Telecompras', desde: 1985, q: 35, c: 0.05, ed: [0.1, 0.3, 0.8, 1, 1.2], col: '#94a3b8', bono: { madrugada: 1.4 } },
    { id: 'reality', nombre: 'Reality', desde: 1992, q: 57, c: 0.6, ed: [0.4, 1.5, 1.2, 0.8, 0.6], col: '#ff6b9a', finde: 1.1 },
  ];
  const DONDE = {
    canal: { nombre: 'Tu canal', desde: ANIO_CANAL }, cable: { nombre: 'Cadena de un rival', desde: 1946 },
    stream: { nombre: 'Tu plataforma', desde: 2007 }, ajena: { nombre: 'Plataforma ajena', desde: 2007 },
  };
  const MARCAS = ['Refrescos Cumbre', 'Jabones Alba', 'Autos Meridiano', 'Galletas Trébol', 'Banco Horizonte', 'Perfumes Lys', 'Café Altamar', 'Seguros Faro', 'Teléfonos Onda', 'Cereal Sol'];
  const RIVALES = [
    { nom: 'Canal Aurora', col: '#ff6b6b' }, { nom: 'Red Meridiana', col: '#ffc857' }, { nom: 'Telecumbre', col: '#5b8cff' }, { nom: 'Onda Siete', col: '#c084fc' },
    { nom: 'Cadena Brisa', col: '#2dd4bf' }, { nom: 'Canal Nébula', col: '#f472b6' }, { nom: 'Teleandina', col: '#fb923c' }, { nom: 'Visión Nueve', col: '#94a3b8' },
  ];
  const MODAS = [
    { fam: 'AA', nom: 'Fiebre de la aventura' }, { fam: 'IM', nom: 'Todos quieren fantasía' }, { fam: 'SM', nom: 'El miedo vende' }, { fam: 'DR', nom: 'Vuelve el drama' },
    { fam: 'HM', nom: 'Temporada de risas' }, { fam: 'FJ', nom: 'Las familias frente a la tele' }, { fam: 'AV', nom: 'Moda del cine de autor' }, { fam: 'RD', nom: 'Ola romántica' },
  ];
  const COLOR_FAM = { AA: '#ff8f5a', IM: '#9b8cff', SM: '#e05b5b', DR: '#5b8cff', HM: '#ffc857', FJ: '#4ade80', AV: '#2dd4bf', RD: '#ff6b9a' };
  function formato(id) { return FORMATOS.filter(function (f) { return f.id === id; })[0] || FORMATOS[0]; }
  function formatosDe(anio) { return FORMATOS.filter(function (f) { return f.desde <= anio; }); }
  function puedeTV(anio) { return anio >= ANIO_TV; }
  function generico(id) { return GENERICOS.filter(function (g) { return g.id === id; })[0] || null; }
  function horas(fr) { const z = function (x) { return (x < 10 ? '0' : '') + x + ':00'; }; return z(fr.h[0]) + '–' + z(fr.h[1]); }
  function configInicial(anio) {
    const f = anio >= 2015 ? formato('corta') : anio >= 1950 ? formato('larga') : formato('vivo');
    return { fmt: f.id, eps: f.def, modo: anio >= 1990 ? 'serial' : 'episodica', sala: f.vivo ? 2 : 4, tramas: 2, temp: 1, sub: f.vivo ? 'variedades' : undefined };
  }
  // Ajusta el borrador a la serie: formato, episodios (2–300) y minutos (5–180)
  function aplicar(b, cambios) {
    b.med = 'tv';
    b.tv = Object.assign(b.tv || configInicial(N.anio()), cambios || {});
    const f = formato(b.tv.fmt);
    b.tv.eps = Math.round(N.limitar(+b.tv.eps || f.def, Math.max(2, f.eps[0]), Math.min(300, f.eps[1])));
    b.tv.sala = Math.round(N.limitar(+b.tv.sala || 1, 1, 12));
    b.tv.tramas = +b.tv.tramas === 3 ? 3 : 2;
    if (f.vivo) { b.nat = 'r'; b.tv.sub = b.tv.sub || 'variedades'; } else delete b.tv.sub;
    if (cambios && cambios.fmt) b.min = f.min;
    b.min = Math.round(N.limitar(+b.min || f.min, Math.max(5, f.rmin[0]), Math.min(180, f.rmin[1])));
    return b;
  }
  function factorCosto(o) {
    if (!o.tv) return 1;
    const f = formato(o.tv.fmt);
    return f.k * 0.42 * Math.pow(o.tv.eps, 0.78) * (1 + (o.tv.sala || 1) * 0.02) * (o.tv.tramas === 3 ? 1.06 : 1);
  }
  function factorSemanas(o) { return o.tv ? N.limitar(o.tv.eps * (o.min || 45) / 300, 0.6, 3.5) * (formato(o.tv.fmt).vivo ? 0.5 : 1) : 1; }
  function costoEpisodio(o) { return Math.round((o.pp || 0) / Math.max(1, o.tv.eps)); }
  function costoSala(o) { return Math.round(tip() * 0.0008 * (o.tv.sala || 1)); }
  // ---------- Tramas, al quedar lista la temporada ----------
  function alQuedarLista(o) {
    if (!o.tv) return;
    if (o.tv.pil >= 60) o.pub = Math.min(99, o.pub + 2); // lo aprendido con el piloto
    const sala = o.tv.sala || 1, serial = o.tv.modo === 'serial';
    o.tv.tr = [];
    for (let i = 0; i < o.tv.tramas; i++) o.tv.tr.push({ n: ['Trama A', 'Trama B', 'Trama C'][i], v: Math.round(N.limitar(o.pub + N.normal(0, 6) + (sala - 4) - (serial && sala < 4 ? 5 : 0) - i * 2, 1, 99)) });
    o.tv.q = Math.round(o.tv.tr.reduce(function (a, x) { return a + x.v; }, 0) / o.tv.tr.length);
  }
  // ---------- Pilotos ----------
  function costoPiloto(b) { return Math.round(((b.pp || 0) + O.costoTalento(b)) * 0.1); }
  function rodarPiloto(b) {
    const S = N.S;
    if (!b.tv) return 'Solo las series tienen piloto.';
    const err = ART.juego.puedeIniciar ? ART.juego.puedeIniciar(b) : '';
    if (err) return err;
    const c = costoPiloto(b);
    if (S.estudios[0].caja < c) return 'No alcanza la caja para el piloto.';
    ART.negocio.pagar(0, 'produccion', c);
    S.pilotos = S.pilotos || [];
    S.pilotos.push({ id: N.sigId(), b: N.copiar(b), sr: 4, costo: c });
    return '';
  }
  function semanaPilotos() {
    const S = N.S;
    (S.pilotos || []).forEach(function (p) {
      if (p.nota !== undefined) return;
      if (--p.sr > 0) return;
      const x = N.copiar(p.b);
      ART.economia.calificar(x, ART.talentos.porId, ART.negocio.contexto().bonos(0, x.fam, x));
      p.nota = Math.round(N.limitar(x.pub + N.normal(0, 5), 1, 99));
      p.hasta = S.t + 8;
      N.emit('noticia', { tipo: 'estudio', texto: 'El piloto de «' + p.b.tit + '» saca ' + p.nota + ' con el público de prueba. ¿Pides la temporada?', importante: true });
    });
    S.pilotos = (S.pilotos || []).filter(function (p) { return p.nota === undefined || p.hasta > S.t; });
  }
  function ordenarTemporada(pid) {
    const S = N.S, p = (S.pilotos || []).filter(function (x) { return x.id === +pid; })[0];
    if (!p || p.nota === undefined) return { error: 'El piloto no está listo.' };
    p.b.tv.pil = p.nota;
    // Quien se fue a otro proyecto mientras tanto se reemplaza (el personaje queda para el nuevo casting)
    const b = p.b, disp = function (id) { const t = ART.talentos.porId(id); return !!t && ART.talentos.disponible(t, 0); };
    Object.keys(b.eq).forEach(function (k) { if (Array.isArray(b.eq[k])) b.eq[k] = b.eq[k].filter(disp); else if (b.eq[k] !== null && b.eq[k] !== undefined && !disp(b.eq[k])) b.eq[k] = null; });
    (b.pj || []).forEach(function (q) { if (q.t !== null && q.t !== undefined && !disp(q.t)) q.t = null; });
    O.equipoRecomendado(b, 1); O.recalcular(b);
    const r = ART.juego.iniciarObra(b);
    if (r.error) return r;
    S.pilotos = S.pilotos.filter(function (x) { return x !== p; });
    return r;
  }
  function descartarPiloto(pid) { N.S.pilotos = (N.S.pilotos || []).filter(function (x) { return x.id !== +pid; }); }
  // ---------- Presentar la idea (pitch) ----------
  function compradores(anio) {
    const c = [];
    if (anio >= 1946) c.push({ id: 'cable', nombre: 'Una cadena rival' });
    if (anio >= 2007) c.push({ id: 'ajena', nombre: 'Una plataforma ajena' });
    return c;
  }
  function pitch(b, comprador) {
    const S = N.S, est = S.estudios[0];
    if (b.pitch) return 'Ya la vendiste.';
    if ((b.pitchNo || []).indexOf(comprador) >= 0) return 'Ese comprador ya la rechazó.';
    if (!compradores(N.anio()).some(function (c) { return c.id === comprador; })) return 'Ese comprador aún no existe.';
    const p = N.limitar(0.2 + est.fama * 0.6 + (S.mundo.tendencias[b.fam] || 0) * 0.3 + (b.guionC ? (b.guionC - 60) / 100 : 0) + (b.fr ? 0.15 : 0), 0.05, 0.9);
    if (!N.probabilidad(p)) { b.pitchNo = (b.pitchNo || []).concat([comprador]); return 'No la compraron esta vez.'; }
    b.pitch = { c: comprador, monto: Math.round((b.pp || 0) * 0.55) };
    return '';
  }
  function alCrear(o) {
    if (o.tv && o.tv.pitch === undefined && o.pitch) { ART.negocio.cobrarEn(0, o.pitch.c === 'ajena' ? 'streaming' : 'tv', o.pitch.monto); }
  }
  // ---------- Audiencia ----------
  function hogares(anio) { return N.interp([[1940, 0.3], [1950, 8], [1960, 60], [1970, 110], [1980, 170], [1990, 250], [2000, 330], [2010, 420], [2025, 520], [2150, 800]], anio); }
  function competencia(anio) { return 1 / (1 + N.interp([[1946, 2], [1960, 3], [1980, 6], [1990, 18], [2005, 50], [2020, 90], [2150, 120]], anio) * 0.04); }
  // Lo que paga un millón de espectadores en una franja (calibrado con el costo típico de un episodio)
  function valorAud(anio) { return tip(anio) * 0.12 * 1.3 / Math.max(0.5, hogares(anio) * 0.06 * competencia(anio)); }
  function encaje(ed, fr) { let s = 0, w = 0; for (let g = 0; g < 5; g++) { s += ed[g] * fr.ed[g]; w += ed[g]; } return w ? s / w : 1; }
  function edades(o) { const v = ART.estreno.edadesObra(o), s = v.reduce(function (a, b) { return a + b; }, 0) || 1; return v.map(function (x) { return x * 5 / s; }); }
  function calidadBase(o) { return o.tv && o.tv.q !== undefined ? o.tv.q : o.pub || 50; }
  function calidadEp(o) {
    const m = o.tv && o.tv.em ? o.tv.em.m || 0 : 0;
    return N.limitar(calidadBase(o) + m * 20 + N.normal(0, 3), 1, 99);
  }
  // ---------- Elegir dónde se emite ----------
  function opcionesEmision(o) {
    const S = N.S, a = N.anio();
    return Object.keys(DONDE).filter(function (k) { return DONDE[k].desde <= a && (k !== 'canal' || S.canal) && (k !== 'stream' || S.stream); }).map(function (k) {
      return { id: k, nombre: DONDE[k].nombre, pago: k === 'cable' || k === 'ajena' ? pagoVenta(o, k) : 0 };
    });
  }
  function pagoVenta(o, k) {
    if (o.pitch) return 0;
    const c = O.costoTotal ? O.costoTotal(o) : (o.gp || 0) + (o.cf || 0);
    return Math.round(c * N.limitar(0.7 + calidadBase(o) / 110, 0.75, 1.6) * (k === 'ajena' ? 1.1 : 1) * (o.fr && o.cam ? 1.15 : 1));
  }
  function emitir(id, donde, op) {
    const S = N.S, o = O.porId(+id);
    if (!o || !o.tv || o.et !== 'lista' || o.est !== 0) return 'La serie no está lista.';
    if (o.pitch && donde !== o.pitch.c) return 'Vendiste la idea: se emite donde la compraron.';
    if (!opcionesEmision(o).some(function (x) { return x.id === donde; })) return 'Ese lugar no está disponible.';
    const pago = donde === 'cable' || donde === 'ajena' ? pagoVenta(o, donde) : 0;
    if (pago) ART.negocio.cobrarEn(0, donde === 'ajena' ? 'streaming' : 'tv', pago);
    o.tv.em = { d: donde, t0: S.t, ep: 0, aud: [], ing: pago, m: 0, comp: donde === 'ajena' || (donde === 'stream' && !!(op && op.completa)) ? 1 : 0 };
    o.et = 'emision'; o.fe = S.t; o.prog = 0;
    O.tocar();
    if (donde === 'stream') ART.streaming.agregar(o.id, 'propio', { orig: 1 });
    if (donde === 'canal' && !(op && op.sinParrilla)) autocompletar(true);
    N.emit('estreno', o);
    return '';
  }
  // Emisión semanal de cada serie (en tu canal se emite lo que esté en la parrilla)
  function semanaEmision() {
    const S = N.S, a = N.anio();
    O.activas().forEach(function (o) {
      if (o.et !== 'emision' || !o.tv || !o.tv.em) return;
      const em = o.tv.em, f = formato(o.tv.fmt);
      let n = em.d === 'canal' ? celdasDe(o.id) : em.comp ? o.tv.eps - em.ep : f.sem;
      n = Math.min(n, o.tv.eps - em.ep);
      for (let i = 0; i < n; i++) {
        const q = calidadEp(o);
        let aud;
        if (em.d === 'stream') { aud = (S.stream ? S.stream.subs : 0) / 1e6 * 0.25 * Math.pow(q / 60, 1.4); const h = S.stream && S.stream.hist[S.stream.hist.length - 1]; if (h) em.ing += Math.round(h.ing * 0.12 / Math.max(1, f.sem)); } // parte de la plataforma que se le atribuye a la serie (solo estadística)
        else if (em.d === 'ajena') aud = hogares(a) * 0.05 * Math.pow(q / 60, 1.4);
        else if (em.d === 'cable') aud = hogares(a) * 0.06 * competencia(a) * Math.pow(q / 60, 1.6);
        else aud = 0; // en tu canal la audiencia la calcula la parrilla
        if (em.d === 'cable' && q >= 70) { const b = Math.round(valorAud(a) * aud * 0.15); ART.negocio.cobrarEn(0, 'tv', b); em.ing += b; }
        if (em.d !== 'canal') em.aud.push(N.redondear(aud, 2));
        if (o.tv.modo === 'serial') em.m = N.redondear(N.limitar(em.m + (q - 60) / 400, -0.3, 0.4), 3);
        em.ep++;
      }
      if (em.ep >= o.tv.eps) terminar(o);
    });
  }
  function terminar(o) {
    const em = o.tv.em;
    o.et = 'terminada'; o.sc = em.aud.length; o.bruto = Math.round(em.ing); o.ing = 0;
    o.tv.ren = o.tv.ren || 'pendiente';
    O.tocar();
    const c = N.S.canal;
    let hueco = false;
    if (c) { c.par.forEach(function (dia) { dia.forEach(function (x, j) { if (x && x.o === o.id) { dia[j] = null; hueco = true; } }); }); if (hueco) autocompletar(true); }
    ART.talentos.trasEstreno(o, O.multiplicador(o));
    N.emit('obraTerminada', o);
    N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» termina su temporada: ' + (promedioAud(o) ? N.redondear(promedioAud(o), 1) + ' millones por episodio. ' : '') + '¿La renuevas?', importante: true });
  }
  function promedioAud(o) { const a = o.tv && o.tv.em ? o.tv.em.aud : []; return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
  function renovar(id) {
    const o = O.porId(+id);
    if (!o || !o.tv || o.tv.ren !== 'pendiente') return { error: 'No hay nada que renovar.' };
    const r = ART.franquicias.continuar(o.id, 'temporada');
    if (r.error) return r;
    o.tv.ren = 'renovada';
    return r;
  }
  function cancelar(id) { const o = O.porId(+id); if (o && o.tv) o.tv.ren = 'cancelada'; }

  /* ---------- El canal ---------- */
  function vacia() { return DIAS.map(function () { return FRANJAS.map(function () { return null; }); }); }
  function nRivales(a) { return a < 1960 ? 2 : a < 1980 ? 3 : a < 2000 ? 4 : 5; }
  function nuevoRival(i) { const r = RIVALES[i % RIVALES.length]; return { nom: r.nom, col: r.col, alc: N.redondear(0.55 + N.azar() * 0.35, 2), f: FRANJAS.map(function () { return N.redondear(0.8 + N.azar() * 0.4, 2); }), hit: null }; }
  // Pone al día un canal guardado con otra versión (6 franjas → 8 franjas y datos nuevos)
  function asegurar(c) {
    if (!c || c.v === 3) return c;
    if (c.par && c.par[0] && c.par[0].length === 6) {
      c.par = c.par.map(function (dia) { const n = FRANJAS.map(function () { return null; }); dia.forEach(function (x, j) { n[VIEJAS[j]] = x; }); return n; });
      (c.pat || []).forEach(function (p) { if (p.f >= 0 && p.f < 6) p.f = VIEJAS[p.f]; });
      (c.ofPat || []).forEach(function (p) { if (p.f >= 0 && p.f < 6) p.f = VIEJAS[p.f]; });
      if (c.porFranja && c.porFranja.length === 6) { const pf = FRANJAS.map(function () { return 0; }); c.porFranja.forEach(function (v, j) { pf[VIEJAS[j]] = v; }); c.porFranja = pf; }
    }
    if (!c.par) c.par = vacia();
    if (!c.porFranja || c.porFranja.length !== FRANJAS.length) c.porFranja = FRANJAS.map(function () { return 0; });
    ['pat', 'ofPat', 'notis', 'ofNot', 'hist', 'lic', 'ofLic'].forEach(function (k) { if (!Array.isArray(c[k])) c[k] = []; });
    if (!c.fres) c.fres = {};
    Object.keys(c.fres).forEach(function (k) { if (/^\d+$/.test(k)) { c.fres['o' + k] = c.fres[k]; delete c.fres[k]; } }); // claves de la versión anterior
    if (!c.prog) c.prog = {};
    if (!c.estr) { c.estr = {}; c.par.forEach(function (dia) { dia.forEach(function (x) { if (x && x.o) c.estr['o' + x.o] = 1; }); }); }
    if (!c.grupos) c.grupos = [0, 0, 0, 0, 0];
    if (c.ads === undefined) c.ads = 10;
    if (!c.riv) { c.riv = []; for (let i = 0; i < nRivales(N.anio()); i++) c.riv.push(nuevoRival(i)); }
    if (c.moda === undefined) c.moda = null;
    if (c.ofModa === undefined) c.ofModa = null;
    c.v = 3;
    return c;
  }
  function canal() { return asegurar(N.S.canal); }
  // ---------- Canal propio ----------
  function costoCanal() { return Math.round(tip() * 4 * (D.industria(N.S.estudios[0].industria).canal || 1)); } // Industria Televisión, 40 % menos
  function comprarCanal(nom, tema) {
    const s = N.S;
    if (s.canal) return 'Ya tienes canal.';
    if (N.anio() < ANIO_CANAL) return 'La televisión comercial empieza en ' + ANIO_CANAL + '.';
    if (s.estudios[0].caja < costoCanal()) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'construccion', costoCanal());
    s.canal = asegurar({ nom: (nom || s.estudios[0].nombre + ' TV').slice(0, 30), tema: tema || null, t0: s.t, alc: 0.35, par: vacia(),
      pat: [], ofPat: [], notis: [], ofNot: [], fres: {}, hist: [], grupos: [0, 0, 0, 0, 0], porFranja: FRANJAS.map(function () { return 0; }) });
    autocompletar(false);
    ofertasLic();
    return '';
  }
  function celdasDe(id) { const c = N.S.canal; if (!c) return 0; let n = 0; c.par.forEach(function (d) { d.forEach(function (x) { if (x && x.o === id) n++; }); }); return n; }
  function licencia(id) { const c = N.S.canal; return c ? (c.lic || []).filter(function (l) { return l.id === +id; })[0] || null : null; }
  // Lo que se puede poner en la parrilla: series en emisión en tu canal, repeticiones de tu catálogo y programas genéricos
  function contenidos() {
    const S = N.S, a = N.anio(), c = canal();
    const series = O.activas().filter(function (o) { return o.est === 0 && o.et === 'emision' && o.tv && o.tv.em && o.tv.em.d === 'canal'; });
    const rep = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && o.pub !== undefined; }).sort(function (x, y) { return y.pub - x.pub; }).slice(0, 40);
    const lic = c ? c.lic.filter(function (l) { return l.hasta > S.t && O.porId(l.o); }) : [];
    return { series: series, rep: rep, lic: lic, gen: GENERICOS.filter(function (g) { return g.desde <= a; }) };
  }
  function valorCelda(x) { return !x ? '' : x.g ? 'g:' + x.g : x.l ? 'l:' + x.l : 'o:' + x.o; }
  function celdaDe(v) {
    v = String(v || '');
    if (!v) return null;
    if (v.indexOf('g:') === 0) return generico(v.slice(2)) ? { g: v.slice(2) } : null;
    if (v.indexOf('l:') === 0) return licencia(v.slice(2)) ? { l: +v.slice(2) } : null;
    const id = +v.slice(2);
    return O.porId(id) ? { o: id } : null;
  }
  function poner(dia, franja, val) {
    const c = canal();
    if (!c) return 'No tienes canal.';
    const d = +dia, j = +franja;
    if (!(d >= 0 && d < 7 && j >= 0 && j < FRANJAS.length)) return 'Esa casilla no existe.';
    const x = celdaDe(val);
    if (val && !x) return 'Ese contenido ya no está disponible.';
    c.par[d][j] = x;
    return '';
  }
  const GRUPOS_DIAS = { lab: [0, 1, 2, 3, 4], finde: [5, 6], todos: [0, 1, 2, 3, 4, 5, 6] };
  function ponerEnDias(franja, val, grupo) {
    const dias = GRUPOS_DIAS[grupo] || GRUPOS_DIAS.todos;
    let e = '';
    dias.forEach(function (d) { e = e || poner(d, franja, val); });
    return e;
  }
  function copiarDia(desde, grupo) {
    const c = canal();
    if (!c) return 'No tienes canal.';
    const o = +desde;
    (GRUPOS_DIAS[grupo] || []).forEach(function (d) { if (d !== o) c.par[d] = c.par[o].map(function (x) { return x ? Object.assign({}, x) : null; }); });
    return '';
  }
  function vaciarDia(d) { const c = canal(); if (c) c.par[+d] = FRANJAS.map(function () { return null; }); }
  function multable(o) { const cl = D.clasificacion(o.clas); return !!cl && cl.acceso[0] < 0.5; }
  function multaFamiliar() { return Math.round(tip() * 0.004); }
  function costoCambioTema() { return Math.round(tip() * 0.2); }
  function cambiarTema(fam) {
    const c = canal();
    if (!c) return 'No tienes canal.';
    if (c.tema === fam) return '';
    if (c.tema && N.S.estudios[0].caja < costoCambioTema()) return 'No alcanza la caja.';
    if (c.tema) ART.negocio.pagar(0, 'marketing', costoCambioTema());
    c.tema = fam || null;
    return '';
  }
  // Anuncios: más minutos por hora dan más ingresos, pero espantan al público
  function factorAds(min) {
    const m = N.limitar(+min || 10, 4, 18);
    return { aud: m > 10 ? 1 - (m - 10) * 0.035 : 1 + (10 - m) * 0.02, ing: m / 10 };
  }
  function ponerAnuncios(min) { const c = canal(); if (c) c.ads = Math.round(N.limitar(+min || 10, 4, 18)); }
  function nivel(gid) { const c = N.S.canal; return c && c.prog && c.prog[gid] ? c.prog[gid] : 1; }
  function costoMejora(gid) { return Math.round(tip() * 0.03 * nivel(gid)); }
  function mejorarPrograma(gid) {
    const c = canal(), g = generico(gid);
    if (!c || !g) return 'No disponible.';
    if (nivel(gid) >= 5) return 'Ya está en el nivel máximo.';
    const k = costoMejora(gid);
    if (N.S.estudios[0].caja < k) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'produccion', k);
    c.prog[gid] = nivel(gid) + 1;
    return '';
  }
  function calidadGenerico(g) { return g.q + (nivel(g.id) - 1) * 5; }
  function costoGenerico(g) { return tip() * 0.0015 * g.c * (1 + 0.3 * (nivel(g.id) - 1)); }
  // Factores de la semana que comparten todas las casillas
  function contexto(c) {
    const S = N.S, a = N.anio(), base0 = hogares(a) * 0.12 * competencia(a), base = base0 * c.alc;
    const bonoNot = c.notis.reduce(function (s, x) { return s + (x.hasta > S.t ? x.bono : 0); }, 0);
    const fa = factorAds(c.ads);
    const kr = FRANJAS.map(function (fr, j) {
      const m = c.riv.length ? c.riv.reduce(function (s, r) { return s + r.f[j]; }, 0) / c.riv.length : 1;
      return N.limitar(1.12 / (0.62 + 0.5 * m), 0.75, 1.25);
    });
    return { a: a, base0: base0, base: base, T: tip(), audRef: base * FRANJAS[IX.estelar].peso / 6, bonoNot: bonoNot, fa: fa, kr: kr };
  }
  function infoCelda(x) {
    if (!x) return null;
    if (x.g) { const g = generico(x.g); return g ? { tipo: 'g', nom: g.nombre, col: g.col, g: g, fam: g.fam || null, clas: 'G' } : null; }
    if (x.l) { const l = licencia(x.l), o = l ? O.porId(l.o) : null; return o ? { tipo: 'lic', nom: o.tit, col: COLOR_FAM[o.fam] || '#94a3b8', o: o, l: l, fam: o.fam, clas: o.clas, key: 'l' + l.id } : null; }
    const o = O.porId(x.o);
    if (!o) return null;
    return { tipo: o.et === 'emision' ? 'serie' : 'rep', nom: o.tit, col: COLOR_FAM[o.fam] || '#94a3b8', o: o, fam: o.fam, clas: o.clas, key: 'o' + o.id };
  }
  function hitEn(c, j) { let h = null; c.riv.forEach(function (r) { if (r.hit && r.hit.j === j && r.hit.hasta > N.S.t && (!h || r.hit.q > h.q)) h = Object.assign({ nom: r.nom, col: r.col }, r.hit); }); return h; }
  // Audiencia (millones), ingresos, costo y multa de una casilla. real = true aplica el azar de la semana.
  function evaluar(c, d, j, x, ctx, real) {
    const inf = infoCelda(x);
    if (!inf) return null;
    const fr = FRANJAS[j], S = N.S;
    let q, ed, fres = 1, gas = 0, multa = 0, bono = 1;
    if (inf.tipo === 'g') {
      q = calidadGenerico(inf.g); ed = inf.g.ed; gas = costoGenerico(inf.g);
      if (inf.g.id === 'noticiero') q += ctx.bonoNot * 40;
      if (inf.g.id === 'musical' && ART.medios.bonoTV) q += Math.min(8, ART.medios.bonoTV() * 2); // tus éxitos musicales suben el programa
      if (inf.g.bono && inf.g.bono[fr.id]) bono *= inf.g.bono[fr.id];
      if (inf.g.finde && d >= 5) bono *= inf.g.finde;
    } else {
      const o = inf.o;
      q = inf.tipo === 'serie' ? (real ? calidadEp(o) : calidadBase(o) + ((o.tv.em && o.tv.em.m) || 0) * 20) : (inf.tipo === 'lic' ? o.pub || 50 : calidadBase(o));
      ed = edades(o);
      if (inf.tipo !== 'serie') {
        fres = c.fres[inf.key] === undefined ? 1 : c.fres[inf.key];
        if (!c.estr[inf.key]) bono *= 1.3; // estreno en tu canal
      }
      if (fr.fam && multable(o)) multa = multaFamiliar();
      if (o.fr) { // maratón: la misma franquicia en dos franjas seguidas
        const vec = [j - 1, j + 1].some(function (k) { const y = k >= 0 && k < FRANJAS.length ? infoCelda(c.par[d][k]) : null; return y && y.o && y.o.fr === o.fr && y.o.id !== o.id; });
        if (vec) bono *= 1.1;
      }
    }
    const tema = c.tema && inf.fam ? (inf.fam === c.tema ? 1.15 : 0.95) : 1;
    if (c.moda && c.moda.hasta > S.t && inf.fam === c.moda.fam) bono *= 1 + c.moda.k;
    if (inf.fam && S.mundo && S.mundo.tendencias) bono *= 1 + (S.mundo.tendencias[inf.fam] || 0) * 0.15;
    const h = hitEn(c, j);
    const kHit = h ? (q < h.q ? 0.85 : 0.97) : 1;
    const enc = encaje(ed, fr), kq = (0.3 + 0.7 * fres) * tema;
    const kx = ctx.kr[j] * kHit * bono * ctx.fa.aud;
    const aud = ctx.base * fr.peso * Math.pow(q / 60, 1.5) * enc * kq * (1 + ctx.bonoNot / 3) / 6 * kx;
    const ing = (inf.tipo === 'serie' ? costoEpisodio(inf.o) * 1.15 * aud / Math.max(0.01, ctx.audRef) : ctx.T * (inf.tipo === 'g' ? 0.002 : 0.003) * fr.peso * Math.pow(q / 55, 1.5) * enc * kq * kx) * ctx.fa.ing;
    return { aud: aud, ing: ing, gas: gas, multa: multa, q: q, ed: ed, fres: fres, inf: inf, enc: enc, hit: h };
  }
  function audRival(c, ctx, j) {
    const fr = FRANJAS[j];
    return c.riv.map(function (r) { return ctx.base0 * (r.alc || 0.7) * fr.peso / 6 * r.f[j] * (r.hit && r.hit.j === j && r.hit.hasta > N.S.t ? 1.35 : 1) * 0.9; });
  }
  function pronostico(d, j, val) {
    const c = canal();
    if (!c) return null;
    const x = val === undefined ? c.par[+d][+j] : celdaDe(val);
    const ctx = contexto(c), r = x ? evaluar(c, +d, +j, x, ctx, false) : null;
    const riv = audRival(c, ctx, +j), sr = riv.reduce(function (a, b) { return a + b; }, 0);
    if (!r) return { aud: 0, ing: 0, gas: 0, multa: 0, cuota: 0, riv: riv };
    r.cuota = r.aud / Math.max(0.001, r.aud + sr);
    r.riv = riv;
    return r;
  }
  // Rellena las celdas vacías (o todas): series nuevas en estelar, telenovelas por la tarde, repeticiones y genéricos
  function autocompletar(soloVacias) {
    const c = canal();
    if (!c) return;
    const cn = contenidos(), a = N.anio(), ctx = contexto(c);
    if (!soloVacias) c.par = vacia();
    const libre = function (x) { if (!x || x.g) return true; if (x.l) return true; const y = O.porId(x.o); return !y || y.et !== 'emision'; };
    cn.series.forEach(function (o, i) {
      if (celdasDe(o.id)) return;
      const f = formato(o.tv.fmt);
      if (f.sem >= 5) { for (let d = 0; d < 5; d++) if (libre(c.par[d][IX.tarde])) c.par[d][IX.tarde] = { o: o.id }; }
      else { for (let k = 0; k < 14; k++) { const d = (i + k) % 7, j = k < 7 ? IX.estelar : IX.noche; if (libre(c.par[d][j])) { c.par[d][j] = { o: o.id }; break; } } }
    });
    let r = 0, l = 0;
    c.par.forEach(function (dia, d) {
      dia.forEach(function (x, j) {
        if (x) return;
        const fr = FRANJAS[j];
        if (j === IX.madrugada && a < 1975) return; // antes los canales cerraban de madrugada
        const okLic = cn.lic.filter(function (y) { const o = O.porId(y.o); return o && !(fr.fam && multable(o)) && (c.fres['l' + y.id] === undefined || c.fres['l' + y.id] > 0.55); });
        if ((j === IX.estelar || j === IX.noche) && d >= 4 && okLic.length && (d + j) % 2 === 1) { dia[j] = { l: okLic[l++ % okLic.length].id }; return; }
        const okRep = cn.rep.filter(function (o) { return !(fr.fam && multable(o)) && (c.fres['o' + o.id] === undefined || c.fres['o' + o.id] > 0.5); });
        if ((j === IX.estelar || j === IX.noche || j === IX.familiar) && okRep.length && (d + j) % 2 === 0) { dia[j] = { o: okRep[r++ % okRep.length].id }; return; }
        let mejor = null, mv = -Infinity;
        cn.gen.forEach(function (g) {
          const e = evaluar(c, d, j, { g: g.id }, ctx, false);
          const usos = dia.filter(function (y) { return y && y.g === g.id; }).length; // variedad: cada repetición en el día vale menos
          const v = e ? (e.ing - 0.75 * e.gas) * Math.pow(0.8, usos) : -Infinity; // prefiere algo de audiencia sobre el relleno más barato
          if (v > mv) { mv = v; mejor = g; }
        });
        if (mejor && mv > 0) dia[j] = { g: mejor.id };
      });
    });
  }
  function semanaRivales(c) {
    const S = N.S, a = N.anio();
    while (c.riv.length < Math.min(RIVALES.length, nRivales(a))) {
      const r = nuevoRival(c.riv.length);
      c.riv.push(r);
      N.emit('noticia', { tipo: 'mundo', texto: 'Sale al aire ' + r.nom + ': un canal más compite por tu público.' });
    }
    c.riv.forEach(function (r) {
      r.f = r.f.map(function (v) { return N.redondear(N.limitar(v + N.normal(0, 0.02), 0.6, 1.5), 2); });
      r.alc = N.redondear(Math.min(1, (r.alc || 0.7) + 0.001), 3);
      if (r.hit && r.hit.hasta <= S.t) r.hit = null;
    });
    if (N.probabilidad(0.03)) {
      const r = N.elegir(c.riv);
      if (!r.hit) {
        const j = N.elegir([IX.tarde, IX.familiar, IX.estelar, IX.estelar, IX.noche]), sem = N.entero(6, 12);
        const fam = N.elegir(D.familias);
        r.hit = { j: j, q: 62 + N.entero(0, 18), hasta: S.t + sem, tit: O.tituloNuevo([fam.generos[0]]) };
        N.emit('noticia', { tipo: 'mundo', texto: r.nom + ' estrena «' + r.hit.tit + '» en ' + FRANJAS[j].nombre.toLowerCase() + ': si no programas algo mejor ahí, perderás público.', importante: true });
      }
    }
  }
  // Una semana de tu canal: audiencia por celda, ingresos, multas, frescura, patrocinadores y noticias
  function semanaCanal() {
    const S = N.S, c = canal();
    if (!c) return;
    semanaRivales(c);
    c.lic = c.lic.filter(function (l) { return l.hasta > S.t; });
    c.par.forEach(function (dia) { dia.forEach(function (x, j) { if (x && !infoCelda(x)) dia[j] = null; }); });
    const ctx = contexto(c);
    let ing = 0, gas = tip() * 0.02, multas = 0;
    const grupos = [0, 0, 0, 0, 0], porFranja = FRANJAS.map(function () { return 0; }), cel = [], celIng = [], vistos = {}, progs = {};
    c.par.forEach(function (dia, d) {
      dia.forEach(function (x, j) {
        const r = x ? evaluar(c, d, j, x, ctx, true) : null;
        if (!r) { cel.push(0); celIng.push(0); return; }
        const inf = r.inf;
        gas += r.gas; multas += r.multa; ing += r.ing;
        if (inf.key) { vistos[inf.key] = 1; c.fres[inf.key] = N.redondear(Math.max(0, r.fres - (inf.o && inf.o.tv ? 0.04 : 0.08)), 3); }
        if (inf.tipo === 'serie' && inf.o.tv.em) { inf.o.tv.em.aud.push(N.redondear(r.aud, 2)); inf.o.tv.em.ing += Math.round(r.ing); }
        porFranja[j] += r.aud / 7;
        const s = r.ed.reduce(function (p, v) { return p + v; }, 0) || 1;
        for (let g = 0; g < 5; g++) grupos[g] += r.aud * r.ed[g] / s / 56;
        const k = inf.key || 'g' + inf.g.id;
        if (!progs[k]) progs[k] = { nom: inf.nom, col: inf.col, tipo: inf.tipo, aud: 0, n: 0, mx: 0 };
        progs[k].aud += r.aud; progs[k].n++; progs[k].mx = Math.max(progs[k].mx, r.aud);
        cel.push(N.redondear(r.aud, 2)); celIng.push(Math.round(r.ing));
      });
    });
    Object.keys(vistos).forEach(function (k) { c.estr[k] = 1; });
    // Patrocinadores: pagan si la franja cumple su meta; con cuatro semanas malas se van
    c.pat = c.pat.filter(function (p) {
      if (p.hasta <= S.t) return false;
      if (porFranja[p.f] >= p.meta) { ing += p.pago; p.mal = 0; } else if (++p.mal >= 4) { N.emit('noticia', { tipo: 'estudio', texto: p.nom + ' retira su patrocinio: la franja no llegó a la meta.', importante: true }); return false; }
      return true;
    });
    Object.keys(c.fres).forEach(function (k) { if (vistos[k]) return; c.fres[k] = N.redondear(Math.min(1, c.fres[k] + 0.006), 3); if (c.fres[k] >= 1) delete c.fres[k]; });
    c.notis = c.notis.filter(function (x) { return x.hasta > S.t; });
    c.ofNot = c.ofNot.filter(function (x) { return x.hasta > S.t; });
    if (c.ofNot.length < 2 && N.probabilidad(0.25)) {
      const tm = N.elegir(D.temas);
      c.ofNot.push({ id: N.sigId(), txt: 'Exclusiva: ' + tm.toLowerCase() + ' sacude ' + N.elegir(['la capital', 'el puerto', 'la frontera', 'el congreso', 'la liga']), costo: Math.round(tip() * N.limitar(0.01 + N.azar() * 0.02, 0.01, 0.03)), bono: N.redondear(0.15 + N.azar() * 0.2, 2), sem: N.entero(3, 6), hasta: S.t + 2 });
    }
    if (c.moda && c.moda.hasta <= S.t) c.moda = null;
    if (c.ofModa && c.ofModa.hasta <= S.t) c.ofModa = null;
    c.alc = N.redondear(Math.min(1, c.alc + 0.002 * (c.ads <= 10 ? 1.25 : c.ads <= 14 ? 1 : 0.5)), 3);
    c.grupos = grupos.map(function (x) { return N.redondear(x, 2); }); c.porFranja = porFranja.map(function (x) { return N.redondear(x, 2); });
    ing = Math.round(ing); gas = Math.round(gas);
    ART.negocio.cobrarEn(0, 'tv', ing); ART.negocio.pagar(0, 'emision', gas);
    if (multas) { ART.negocio.pagar(0, 'multas', multas); if (!c.avisoMulta || S.t - c.avisoMulta > 8) { c.avisoMulta = S.t; N.emit('noticia', { tipo: 'estudio', texto: 'Multa a ' + c.nom + ': emitiste contenido para adultos en horario familiar.', importante: true }); } }
    // Ranking de la semana frente a los canales rivales
    const tot = porFranja.reduce(function (p, v) { return p + v; }, 0);
    const cuota = FRANJAS.map(function (fr, j) { const sr = audRival(c, ctx, j).reduce(function (a, b) { return a + b; }, 0); return N.redondear(porFranja[j] / Math.max(0.001, porFranja[j] + sr), 3); });
    const rivT = c.riv.map(function (r, i) { let s = 0; FRANJAS.forEach(function (fr, j) { s += audRival(c, ctx, j)[i]; }); return s; });
    const rank = 1 + rivT.filter(function (v) { return v > tot; }).length;
    const top = Object.keys(progs).map(function (k) { return progs[k]; }).sort(function (x, y) { return y.mx - x.mx; }).slice(0, 6).map(function (p) { return { nom: p.nom, col: p.col, tipo: p.tipo, mx: N.redondear(p.mx, 2), n: p.n }; });
    if (c.ult && c.ult.rank && rank < c.ult.rank && rank === 1) N.emit('noticia', { tipo: 'estudio', texto: c.nom + ' es el canal más visto de la semana.', importante: true });
    c.ult = { cel: cel, celIng: celIng, cuota: cuota, rivT: rivT.map(function (v) { return N.redondear(v, 2); }), rank: rank, top: top, multas: multas };
    c.hist.push({ t: S.t, aud: N.redondear(tot, 2), ing: ing, gas: gas + multas });
    if (c.hist.length > 104) c.hist.shift();
  }
  function comprarNoticia(id) {
    const S = N.S, c = canal(), x = c ? c.ofNot.filter(function (n) { return n.id === +id; })[0] : null;
    if (!x) return 'Esa noticia ya no está.';
    if (S.estudios[0].caja < x.costo) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'emision', x.costo);
    c.notis.push({ txt: x.txt, bono: x.bono, hasta: S.t + x.sem });
    c.ofNot = c.ofNot.filter(function (n) { return n !== x; });
    return '';
  }
  function comprarModa() {
    const S = N.S, c = canal(), m = c ? c.ofModa : null;
    if (!m) return 'Esa oferta venció.';
    if (S.estudios[0].caja < m.costo) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'marketing', m.costo);
    c.moda = { fam: m.fam, nom: m.nom, k: m.k, hasta: S.t + m.sem };
    c.ofModa = null;
    return '';
  }
  // Derechos de emisión: obras terminadas de los rivales, dos años con pases ilimitados
  function precioLic(o) { return Math.round(tip() * 0.006 * Math.pow((o.pub || 50) / 55, 2) * (N.S.t - (o.fe || 0) < 104 ? 1.6 : 1) * (o.tv ? 1.3 : 1)); }
  function ofertasLic() {
    const S = N.S, c = canal();
    if (!c) return;
    const ya = c.lic.map(function (l) { return l.o; });
    c.ofLic = S.obras.filter(function (o) { return o.est > 0 && o.et === 'terminada' && (o.pub || 0) >= 45 && ya.indexOf(o.id) < 0 && S.t - (o.fe || 0) < 52 * 40; })
      .sort(function (a, b) { return N.hash('tv' + a.id + S.t) % 101 - N.hash('tv' + b.id + S.t) % 101; }).slice(0, 5)
      .map(function (o) { return { o: o.id, p: precioLic(o) }; });
  }
  function comprarLic(oid) {
    const S = N.S, c = canal(), of = c ? c.ofLic.filter(function (x) { return x.o === +oid; })[0] : null, o = of ? O.porId(of.o) : null;
    if (!of || !o) return 'Esa oferta ya no está.';
    if (S.estudios[0].caja < of.p) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'derechos', of.p);
    ART.negocio.cobrarEn(o.est, 'tv', of.p);
    c.lic.push({ id: N.sigId(), o: o.id, hasta: S.t + 104, p: of.p });
    c.ofLic = c.ofLic.filter(function (x) { return x !== of; });
    return '';
  }
  function mensualCanal() {
    const S = N.S, c = canal();
    if (!c) return;
    c.ofPat = c.ofPat.filter(function (p) { return p.hasta > S.t; });
    if (c.ofPat.length < 3) {
      const f = N.entero(1, FRANJAS.length - 1), prom = c.porFranja[f] || 0.5;
      const meta = N.redondear(Math.max(0.1, prom * (0.95 + N.azar() * 0.3)), 2);
      c.ofPat.push({ id: N.sigId(), nom: N.elegir(MARCAS), f: f, meta: meta, pago: Math.round(tip() * 0.004 * (0.6 + FRANJAS[f].peso)), sem: 26, hasta: S.t + 4 });
    }
    if (!c.moda && !c.ofModa && N.probabilidad(0.5)) {
      const m = N.elegir(MODAS);
      c.ofModa = { fam: m.fam, nom: m.nom, k: N.redondear(0.15 + N.azar() * 0.15, 2), sem: 8, costo: Math.round(tip() * 0.02 * (1 + c.alc)), hasta: S.t + 4 };
    }
    ofertasLic();
  }
  function aceptarPatrocinio(id) {
    const S = N.S, c = canal(), p = c ? c.ofPat.filter(function (x) { return x.id === +id; })[0] : null;
    if (!p) return 'Esa oferta venció.';
    if (c.pat.length >= 4) return 'Ya tienes cuatro patrocinadores.';
    c.pat.push({ nom: p.nom, f: p.f, meta: p.meta, pago: p.pago, mal: 0, hasta: S.t + p.sem });
    c.ofPat = c.ofPat.filter(function (x) { return x !== p; });
    return '';
  }
  function semana() { semanaPilotos(); semanaCanal(); semanaEmision(); }
  return { FORMATOS: FORMATOS, SUBVIVO: SUBVIVO, FRANJAS: FRANJAS, IX: IX, DIAS: DIAS, GENERICOS: GENERICOS, DONDE: DONDE, ANIO_TV: ANIO_TV, ANIO_CANAL: ANIO_CANAL, COLOR_FAM: COLOR_FAM, MODAS: MODAS,
    formato: formato, formatosDe: formatosDe, puedeTV: puedeTV, generico: generico, horas: horas, configInicial: configInicial, aplicar: aplicar, factorCosto: factorCosto, factorSemanas: factorSemanas,
    costoEpisodio: costoEpisodio, costoSala: costoSala, alQuedarLista: alQuedarLista, costoPiloto: costoPiloto, rodarPiloto: rodarPiloto, ordenarTemporada: ordenarTemporada,
    descartarPiloto: descartarPiloto, compradores: compradores, pitch: pitch, alCrear: alCrear, hogares: hogares, valorAud: valorAud, opcionesEmision: opcionesEmision,
    pagoVenta: pagoVenta, emitir: emitir, promedioAud: promedioAud, renovar: renovar, cancelar: cancelar, costoCanal: costoCanal, comprarCanal: comprarCanal, canal: canal, asegurar: asegurar, celdasDe: celdasDe,
    contenidos: contenidos, infoCelda: infoCelda, valorCelda: valorCelda, licencia: licencia, poner: poner, ponerEnDias: ponerEnDias, copiarDia: copiarDia, vaciarDia: vaciarDia, autocompletar: autocompletar,
    pronostico: pronostico, hitEn: hitEn, multable: multable, multaFamiliar: multaFamiliar, costoCambioTema: costoCambioTema, cambiarTema: cambiarTema, factorAds: factorAds, ponerAnuncios: ponerAnuncios,
    nivel: nivel, costoMejora: costoMejora, mejorarPrograma: mejorarPrograma, calidadGenerico: calidadGenerico, costoGenerico: costoGenerico, precioLic: precioLic, comprarLic: comprarLic,
    comprarNoticia: comprarNoticia, comprarModa: comprarModa, aceptarPatrocinio: aceptarPatrocinio, mensual: mensualCanal, semana: semana };
})();
