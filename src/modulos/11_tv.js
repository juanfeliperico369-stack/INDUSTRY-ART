/* ==== módulo: tv ==== */
// Televisión: formatos por época (temporada larga, telenovela, miniserie, temporada corta y programas en
// vivo), de 2 a 300 episodios y de 5 a 180 minutos; episódica o serializada; sala de guionistas; 2 o 3 tramas
// con nota; piloto antes de pedir la temporada; presentar la idea (pitch); elegir dónde se emite (tu canal, la
// cadena de un rival, tu plataforma o una ajena); audiencias por episodio; renovar o cancelar. Canal propio con
// parrilla de 7 días × 6 franjas, autocompletar, horario familiar con multa, público por grupos, frescura de lo
// repetido, patrocinadores con metas, tema del canal y noticias que se compran y vencen.
IA.tv = (function () {
  'use strict';
  const N = IA.n, O = IA.obras, D = IA.datos;
  const tip = function (a) { return IA.economia.presupuestoTipico(a || N.anio()); };
  const ANIO_TV = 1940, ANIO_CANAL = 1946;
  const FORMATOS = [
    { id: 'larga', nombre: 'Temporada larga', desde: 1950, eps: [20, 26], def: 22, min: 44, rmin: [22, 60], k: 1, sem: 1 },
    { id: 'telenovela', nombre: 'Telenovela diaria', desde: 1951, eps: [100, 300], def: 150, min: 45, rmin: [30, 60], k: 0.2, sem: 5 },
    { id: 'miniserie', nombre: 'Miniserie', desde: 1960, eps: [2, 10], def: 6, min: 60, rmin: [45, 120], k: 1.3, sem: 1 },
    { id: 'corta', nombre: 'Temporada corta', desde: 2007, eps: [6, 13], def: 8, min: 50, rmin: [30, 70], k: 1.45, sem: 1 },
    { id: 'vivo', nombre: 'Programa en vivo', desde: 1940, eps: [13, 300], def: 40, min: 60, rmin: [5, 180], k: 0.12, sem: 1, vivo: 1 },
  ];
  const SUBVIVO = [{ id: 'noticiero', nombre: 'Noticiero', desde: 1940 }, { id: 'variedades', nombre: 'Variedades', desde: 1948 }, { id: 'concurso', nombre: 'Concurso', desde: 1950 }, { id: 'reality', nombre: 'Reality', desde: 1992 }];
  const FRANJAS = [
    { id: 'manana', nombre: 'Mañana', peso: 0.35, ed: [1.4, 0.6, 0.5, 0.9, 1.5], fam: 1 },
    { id: 'mediodia', nombre: 'Mediodía', peso: 0.5, ed: [0.8, 0.6, 0.8, 1.1, 1.4] },
    { id: 'tarde', nombre: 'Tarde', peso: 0.65, ed: [1.5, 1.3, 0.8, 0.8, 1], fam: 1 },
    { id: 'familiar', nombre: 'Horario familiar', peso: 1, ed: [1.3, 1.2, 1, 1, 1], fam: 1 },
    { id: 'estelar', nombre: 'Horario estelar', peso: 1.4, ed: [0.4, 1, 1.3, 1.2, 1] },
    { id: 'noche', nombre: 'Noche', peso: 0.6, ed: [0, 0.9, 1.2, 1, 0.7] },
  ];
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const GENERICOS = [
    { id: 'noticiero', nombre: 'Noticiero', desde: 1940, q: 56, c: 0.5, ed: [0.2, 0.5, 1, 1.3, 1.5] },
    { id: 'variedades', nombre: 'Variedades', desde: 1948, q: 52, c: 0.45, ed: [1, 1, 1, 1, 1.1] },
    { id: 'infantil', nombre: 'Dibujos infantiles', desde: 1950, q: 54, c: 0.35, ed: [2, 1, 0.3, 0.3, 0.3] },
    { id: 'concurso', nombre: 'Concurso', desde: 1950, q: 55, c: 0.5, ed: [0.7, 1, 1, 1.1, 1.3] },
    { id: 'telecompra', nombre: 'Telecompras', desde: 1985, q: 35, c: 0.05, ed: [0.1, 0.3, 0.8, 1, 1.2] },
    { id: 'reality', nombre: 'Reality', desde: 1992, q: 57, c: 0.6, ed: [0.4, 1.5, 1.2, 0.8, 0.6] },
  ];
  const DONDE = {
    canal: { nombre: 'Tu canal', desde: ANIO_CANAL }, cable: { nombre: 'Cadena de un rival', desde: 1946 },
    stream: { nombre: 'Tu plataforma', desde: 2007 }, ajena: { nombre: 'Plataforma ajena', desde: 2007 },
  };
  const MARCAS = ['Refrescos Cumbre', 'Jabones Alba', 'Autos Meridiano', 'Galletas Trébol', 'Banco Horizonte', 'Perfumes Lys', 'Café Altamar', 'Seguros Faro', 'Teléfonos Onda', 'Cereal Sol'];
  function formato(id) { return FORMATOS.filter(function (f) { return f.id === id; })[0] || FORMATOS[0]; }
  function formatosDe(anio) { return FORMATOS.filter(function (f) { return f.desde <= anio; }); }
  function puedeTV(anio) { return anio >= ANIO_TV; }
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
    const err = IA.juego.puedeIniciar ? IA.juego.puedeIniciar(b) : '';
    if (err) return err;
    const c = costoPiloto(b);
    if (S.estudios[0].caja < c) return 'No alcanza la caja para el piloto.';
    IA.negocio.pagar(0, 'produccion', c);
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
      IA.economia.calificar(x, IA.talentos.porId, IA.negocio.contexto().bonos(0, x.fam, x));
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
    const b = p.b, disp = function (id) { const t = IA.talentos.porId(id); return !!t && IA.talentos.disponible(t, 0); };
    Object.keys(b.eq).forEach(function (k) { if (Array.isArray(b.eq[k])) b.eq[k] = b.eq[k].filter(disp); else if (b.eq[k] !== null && b.eq[k] !== undefined && !disp(b.eq[k])) b.eq[k] = null; });
    (b.pj || []).forEach(function (q) { if (q.t !== null && q.t !== undefined && !disp(q.t)) q.t = null; });
    O.equipoRecomendado(b, 1); O.recalcular(b);
    const r = IA.juego.iniciarObra(b);
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
    if (o.tv && o.tv.pitch === undefined && o.pitch) { IA.negocio.cobrarEn(0, o.pitch.c === 'ajena' ? 'streaming' : 'tv', o.pitch.monto); }
  }
  // ---------- Audiencia ----------
  function hogares(anio) { return N.interp([[1940, 0.3], [1950, 8], [1960, 60], [1970, 110], [1980, 170], [1990, 250], [2000, 330], [2010, 420], [2025, 520], [2150, 800]], anio); }
  function competencia(anio) { return 1 / (1 + N.interp([[1946, 2], [1960, 3], [1980, 6], [1990, 18], [2005, 50], [2020, 90], [2150, 120]], anio) * 0.04); }
  // Lo que paga un millón de espectadores en una franja (calibrado con el costo típico de un episodio)
  function valorAud(anio) { return tip(anio) * 0.12 * 1.3 / Math.max(0.5, hogares(anio) * 0.06 * competencia(anio)); }
  function encaje(ed, fr) { let s = 0, w = 0; for (let g = 0; g < 5; g++) { s += ed[g] * fr.ed[g]; w += ed[g]; } return w ? s / w : 1; }
  function edades(o) { const v = IA.estreno.edadesObra(o), s = v.reduce(function (a, b) { return a + b; }, 0) || 1; return v.map(function (x) { return x * 5 / s; }); }
  function calidadEp(o) {
    const q = o.tv && o.tv.q !== undefined ? o.tv.q : o.pub || 50;
    const m = o.tv && o.tv.em ? o.tv.em.m || 0 : 0;
    return N.limitar(q + m * 20 + N.normal(0, 3), 1, 99);
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
    return Math.round(c * N.limitar(0.7 + (o.tv && o.tv.q !== undefined ? o.tv.q : o.pub || 50) / 110, 0.75, 1.6) * (k === 'ajena' ? 1.1 : 1) * (o.fr && o.cam ? 1.15 : 1));
  }
  function emitir(id, donde, op) {
    const S = N.S, o = O.porId(+id);
    if (!o || !o.tv || o.et !== 'lista' || o.est !== 0) return 'La serie no está lista.';
    if (o.pitch && donde !== o.pitch.c) return 'Vendiste la idea: se emite donde la compraron.';
    if (!opcionesEmision(o).some(function (x) { return x.id === donde; })) return 'Ese lugar no está disponible.';
    const pago = donde === 'cable' || donde === 'ajena' ? pagoVenta(o, donde) : 0;
    if (pago) IA.negocio.cobrarEn(0, donde === 'ajena' ? 'streaming' : 'tv', pago);
    o.tv.em = { d: donde, t0: S.t, ep: 0, aud: [], ing: pago, m: 0, comp: donde === 'ajena' || (donde === 'stream' && !!(op && op.completa)) ? 1 : 0 };
    o.et = 'emision'; o.fe = S.t; o.prog = 0;
    O.tocar();
    if (donde === 'stream') IA.streaming.agregar(o.id, 'propio');
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
        if (em.d === 'stream') { aud = (S.stream ? S.stream.subs : 0) / 1e6 * 0.25 * Math.pow(q / 60, 1.4); const h = S.stream && S.stream.hist[S.stream.hist.length - 1]; if (h) em.ing += Math.round(h.ing * 0.12 / Math.max(1, f.sem)); } // Parte de la plataforma que se le atribuye a la serie (solo estadística)
        else if (em.d === 'ajena') aud = hogares(a) * 0.05 * Math.pow(q / 60, 1.4);
        else if (em.d === 'cable') aud = hogares(a) * 0.06 * competencia(a) * Math.pow(q / 60, 1.6);
        else aud = 0; // en tu canal la audiencia la calcula la parrilla
        if (em.d === 'cable' && q >= 70) { const b = Math.round(valorAud(a) * aud * 0.15); IA.negocio.cobrarEn(0, 'tv', b); em.ing += b; }
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
    if (S().canal) { S().canal.par.forEach(function (dia) { dia.forEach(function (c, j) { if (c && c.o === o.id) dia[j] = null; }); }); }
    IA.talentos.trasEstreno(o, O.multiplicador(o));
    N.emit('obraTerminada', o);
    N.emit('noticia', { tipo: 'estudio', texto: '«' + o.tit + '» termina su temporada: ' + (promedioAud(o) ? N.redondear(promedioAud(o), 1) + ' millones por episodio. ' : '') + '¿La renuevas?', importante: true });
  }
  function S() { return N.S; }
  function promedioAud(o) { const a = o.tv && o.tv.em ? o.tv.em.aud : []; return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
  function renovar(id) {
    const o = O.porId(+id);
    if (!o || !o.tv || o.tv.ren !== 'pendiente') return { error: 'No hay nada que renovar.' };
    const r = IA.franquicias.continuar(o.id, 'temporada');
    if (r.error) return r;
    o.tv.ren = 'renovada';
    return r;
  }
  function cancelar(id) { const o = O.porId(+id); if (o && o.tv) o.tv.ren = 'cancelada'; }
  // ---------- Canal propio ----------
  function costoCanal() { return Math.round(tip() * 4 * (D.industria(N.S.estudios[0].industria).canal || 1)); } // Industria Televisión, 40 % menos
  function comprarCanal(nom, tema) {
    const s = N.S;
    if (s.canal) return 'Ya tienes canal.';
    if (N.anio() < ANIO_CANAL) return 'La televisión comercial empieza en ' + ANIO_CANAL + '.';
    if (s.estudios[0].caja < costoCanal()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', costoCanal());
    s.canal = { nom: (nom || s.estudios[0].nombre + ' TV').slice(0, 30), tema: tema || null, t0: s.t, alc: 0.35, par: DIAS.map(function () { return FRANJAS.map(function () { return null; }); }),
      pat: [], ofPat: [], notis: [], ofNot: [], fres: {}, hist: [], grupos: [0, 0, 0, 0, 0], porFranja: [0, 0, 0, 0, 0, 0] };
    autocompletar(false);
    return '';
  }
  function celdasDe(id) { const c = N.S.canal; if (!c) return 0; let n = 0; c.par.forEach(function (d) { d.forEach(function (x) { if (x && x.o === id) n++; }); }); return n; }
  // Lo que se puede poner en la parrilla: series en emisión en tu canal, repeticiones de tu catálogo y programas genéricos
  function contenidos() {
    const S = N.S, a = N.anio();
    const series = O.activas().filter(function (o) { return o.est === 0 && o.et === 'emision' && o.tv && o.tv.em && o.tv.em.d === 'canal'; });
    const rep = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && o.pub !== undefined; }).sort(function (x, y) { return y.pub - x.pub; }).slice(0, 30);
    return { series: series, rep: rep, gen: GENERICOS.filter(function (g) { return g.desde <= a; }) };
  }
  function poner(dia, franja, val) {
    const c = N.S.canal;
    if (!c) return 'No tienes canal.';
    const v = String(val || '');
    c.par[+dia][+franja] = !v ? null : v.indexOf('g:') === 0 ? { g: v.slice(2) } : { o: +v.slice(2) };
    return '';
  }
  // Rellena las celdas vacías (o todas): series nuevas en estelar, telenovelas por la tarde, repeticiones y genéricos
  function autocompletar(soloVacias) {
    const c = N.S.canal;
    if (!c) return;
    const cn = contenidos();
    if (!soloVacias) c.par = DIAS.map(function () { return FRANJAS.map(function () { return null; }); });
    cn.series.forEach(function (o, i) {
      if (celdasDe(o.id)) return;
      const f = formato(o.tv.fmt);
      // Una serie nueva desplaza a genéricos y repeticiones, nunca a otra serie en emisión
      const libre = function (x) { if (!x || x.g) return true; const y = O.porId(x.o); return !y || y.et !== 'emision'; };
      if (f.sem >= 5) { for (let d = 0; d < 5; d++) if (libre(c.par[d][2])) c.par[d][2] = { o: o.id }; }
      else { for (let k = 0; k < 14; k++) { const d = (i + k) % 7, j = k < 7 ? 4 : 5; if (libre(c.par[d][j])) { c.par[d][j] = { o: o.id }; break; } } }
    });
    let r = 0;
    c.par.forEach(function (dia, d) {
      dia.forEach(function (x, j) {
        if (x) return;
        const fr = FRANJAS[j];
        const okRep = cn.rep.filter(function (o) { return !(fr.fam && multable(o)) && (c.fres[o.id] === undefined || c.fres[o.id] > 0.5); });
        if ((j === 4 || j === 5) && okRep.length && (d + j) % 2 === 0) { dia[j] = { o: okRep[r++ % okRep.length].id }; return; }
        const g = cn.gen.slice().sort(function (a1, b1) { return encaje(b1.ed, fr) * b1.q - encaje(a1.ed, fr) * a1.q; })[0];
        if (g) dia[j] = { g: g.id };
      });
    });
  }
  function multable(o) { const cl = D.clasificacion(o.clas); return !!cl && cl.acceso[0] < 0.5; }
  function multaFamiliar() { return Math.round(tip() * 0.004); }
  function costoCambioTema() { return Math.round(tip() * 0.2); }
  function cambiarTema(fam) {
    const c = N.S.canal;
    if (!c) return 'No tienes canal.';
    if (c.tema === fam) return '';
    if (c.tema && N.S.estudios[0].caja < costoCambioTema()) return 'No alcanza la caja.';
    if (c.tema) IA.negocio.pagar(0, 'marketing', costoCambioTema());
    c.tema = fam || null;
    return '';
  }
  // Una semana de tu canal: audiencia por celda, ingresos, multas, frescura, patrocinadores y noticias
  function semanaCanal() {
    const S = N.S, c = S.canal;
    if (!c) return;
    const a = N.anio(), base = hogares(a) * 0.12 * competencia(a) * c.alc, T = tip();
    const audRef = base * FRANJAS[4].peso / 6; // una serie de 60 en horario estelar
    const bonoNot = c.notis.reduce(function (s, x) { return s + (x.hasta > S.t ? x.bono : 0); }, 0);
    let ing = 0, gas = tip() * 0.02, multas = 0;
    const grupos = [0, 0, 0, 0, 0], porFranja = [0, 0, 0, 0, 0, 0];
    c.par.forEach(function (dia) {
      dia.forEach(function (x, j) {
        if (!x) return;
        const fr = FRANJAS[j];
        let q, ed, fres = 1, tema = 1, serie = null;
        if (x.g) {
          const g = GENERICOS.filter(function (y) { return y.id === x.g; })[0];
          if (!g) return;
          q = g.q; ed = g.ed; gas += tip() * 0.0015 * g.c;
          if (g.id === 'noticiero') q += bonoNot * 40;
        } else {
          const o = O.porId(x.o);
          if (!o) { dia[j] = null; return; }
          q = o.et === 'emision' ? calidadEp(o) : (o.tv && o.tv.q) || o.pub || 50; ed = edades(o);
          if (o.et === 'emision') serie = o;
          if (o.et !== 'emision') { fres = c.fres[o.id] === undefined ? 1 : c.fres[o.id]; c.fres[o.id] = N.redondear(Math.max(0, fres - (o.tv ? 0.04 : 0.08)), 3); }
          if (c.tema) tema = o.fam === c.tema ? 1.15 : 0.95;
          if (fr.fam && multable(o)) { multas += multaFamiliar(); }
        }
        const aud = base * fr.peso * Math.pow(q / 60, 1.5) * encaje(ed, fr) * (0.3 + 0.7 * fres) * tema * (1 + bonoNot / 3) / 6;
        // Una serie nueva rinde según su costo por episodio; los genéricos y las repeticiones, poco
        const ic = serie ? costoEpisodio(serie) * 1.15 * aud / Math.max(0.01, audRef) : T * (x.g ? 0.002 : 0.003) * fr.peso * Math.pow(q / 55, 1.5) * encaje(ed, fr) * (0.3 + 0.7 * fres) * tema;
        ing += ic;
        if (serie && serie.tv.em) { serie.tv.em.aud.push(N.redondear(aud, 2)); serie.tv.em.ing += Math.round(ic); }
        porFranja[j] += aud / 7;
        const s = ed.reduce(function (p, v) { return p + v; }, 0) || 1;
        for (let g = 0; g < 5; g++) grupos[g] += aud * ed[g] / s / 42;
      });
    });
    // Patrocinadores: pagan si la franja cumple su meta; con cuatro semanas malas se van
    c.pat = c.pat.filter(function (p) {
      if (p.hasta <= S.t) return false;
      if (porFranja[p.f] >= p.meta) { ing += p.pago; p.mal = 0; } else if (++p.mal >= 4) { N.emit('noticia', { tipo: 'estudio', texto: p.nom + ' retira su patrocinio: la franja no llegó a la meta.', importante: true }); return false; }
      return true;
    });
    Object.keys(c.fres).forEach(function (k) { c.fres[k] = N.redondear(Math.min(1, c.fres[k] + 0.006), 3); if (c.fres[k] >= 1) delete c.fres[k]; });
    c.notis = c.notis.filter(function (x) { return x.hasta > S.t; });
    c.ofNot = c.ofNot.filter(function (x) { return x.hasta > S.t; });
    if (c.ofNot.length < 2 && N.probabilidad(0.25)) {
      const tm = N.elegir(D.temas);
      c.ofNot.push({ id: N.sigId(), txt: 'Exclusiva: ' + tm.toLowerCase() + ' sacude ' + N.elegir(['la capital', 'el puerto', 'la frontera', 'el congreso', 'la liga']), costo: Math.round(tip() * N.limitar(0.01 + N.azar() * 0.02, 0.01, 0.03)), bono: N.redondear(0.15 + N.azar() * 0.2, 2), sem: N.entero(3, 6), hasta: S.t + 2 });
    }
    c.alc = N.redondear(Math.min(1, c.alc + 0.002), 3);
    c.grupos = grupos.map(function (x) { return N.redondear(x, 2); }); c.porFranja = porFranja.map(function (x) { return N.redondear(x, 2); });
    ing = Math.round(ing); gas = Math.round(gas);
    IA.negocio.cobrarEn(0, 'tv', ing); IA.negocio.pagar(0, 'emision', gas);
    if (multas) { IA.negocio.pagar(0, 'multas', multas); if (!c.avisoMulta || S.t - c.avisoMulta > 8) { c.avisoMulta = S.t; N.emit('noticia', { tipo: 'estudio', texto: 'Multa a ' + c.nom + ': emitiste contenido para adultos en horario familiar.', importante: true }); } }
    c.hist.push({ t: S.t, aud: N.redondear(porFranja.reduce(function (p, v) { return p + v; }, 0), 2), ing: ing, gas: gas + multas });
    if (c.hist.length > 104) c.hist.shift();
  }
  function comprarNoticia(id) {
    const S = N.S, c = S.canal, x = c ? c.ofNot.filter(function (n) { return n.id === +id; })[0] : null;
    if (!x) return 'Esa noticia ya no está.';
    if (S.estudios[0].caja < x.costo) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'emision', x.costo);
    c.notis.push({ txt: x.txt, bono: x.bono, hasta: S.t + x.sem });
    c.ofNot = c.ofNot.filter(function (n) { return n !== x; });
    return '';
  }
  function mensualCanal() {
    const S = N.S, c = S.canal;
    if (!c) return;
    c.ofPat = c.ofPat.filter(function (p) { return p.hasta > S.t; });
    if (c.ofPat.length < 3) {
      const f = N.entero(1, 5), prom = c.porFranja[f] || 0.5;
      const meta = N.redondear(Math.max(0.1, prom * (0.95 + N.azar() * 0.3)), 2);
      c.ofPat.push({ id: N.sigId(), nom: N.elegir(MARCAS), f: f, meta: meta, pago: Math.round(tip() * 0.004 * (1 + f / 4)), sem: 26, hasta: S.t + 4 });
    }
  }
  function aceptarPatrocinio(id) {
    const S = N.S, c = S.canal, p = c ? c.ofPat.filter(function (x) { return x.id === +id; })[0] : null;
    if (!p) return 'Esa oferta venció.';
    if (c.pat.length >= 4) return 'Ya tienes cuatro patrocinadores.';
    c.pat.push({ nom: p.nom, f: p.f, meta: p.meta, pago: p.pago, mal: 0, hasta: S.t + p.sem });
    c.ofPat = c.ofPat.filter(function (x) { return x !== p; });
    return '';
  }
  function semana() { semanaPilotos(); semanaCanal(); semanaEmision(); }
  return { FORMATOS: FORMATOS, SUBVIVO: SUBVIVO, FRANJAS: FRANJAS, DIAS: DIAS, GENERICOS: GENERICOS, DONDE: DONDE, ANIO_TV: ANIO_TV, ANIO_CANAL: ANIO_CANAL,
    formato: formato, formatosDe: formatosDe, puedeTV: puedeTV, configInicial: configInicial, aplicar: aplicar, factorCosto: factorCosto, factorSemanas: factorSemanas,
    costoEpisodio: costoEpisodio, costoSala: costoSala, alQuedarLista: alQuedarLista, costoPiloto: costoPiloto, rodarPiloto: rodarPiloto, ordenarTemporada: ordenarTemporada,
    descartarPiloto: descartarPiloto, compradores: compradores, pitch: pitch, alCrear: alCrear, hogares: hogares, valorAud: valorAud, opcionesEmision: opcionesEmision,
    pagoVenta: pagoVenta, emitir: emitir, promedioAud: promedioAud, renovar: renovar, cancelar: cancelar, costoCanal: costoCanal, comprarCanal: comprarCanal, celdasDe: celdasDe,
    contenidos: contenidos, poner: poner, autocompletar: autocompletar, multable: multable, multaFamiliar: multaFamiliar, costoCambioTema: costoCambioTema, cambiarTema: cambiarTema,
    comprarNoticia: comprarNoticia, aceptarPatrocinio: aceptarPatrocinio, mensual: mensualCanal, semana: semana };
})();
