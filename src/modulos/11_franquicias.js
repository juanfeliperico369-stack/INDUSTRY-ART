/* ==== módulo: franquicias ==== */
// V23 · Toda obra nace como franquicia (de una sola obra, sin ocupar memoria) y se vuelve una franquicia «viva»
// cuando se continúa, se registra, se licencia, se cruza o se vende. Siete caminos de continuación (y la nueva
// temporada de una serie), personajes con ficha y popularidad, llamada al elenco original, licencias y derivados
// canon o no canon, crossovers, canon con continuidades, compra y venta (también de obras sueltas), ofertas de
// rivales, biografía con nivel de clásico, mente maestra y fatiga del público.
IA.franquicias = (function () {
  'use strict';
  const N = IA.n, O = IA.obras, D = IA.datos;
  const tip = function () { return IA.economia.presupuestoTipico(N.anio()); };
  const CAMINOS = [
    { id: 'secuela', nombre: 'Secuela', des: 6, fat: 0.18, elenco: 1, texto: 'Sigue la historia con el mismo elenco: la más pedida y la que más cansa.' },
    { id: 'precuela', nombre: 'Precuela', des: 4, fat: 0.14, elenco: 0.5, texto: 'Cuenta lo que pasó antes; parte del elenco vuelve.' },
    { id: 'spinoff', nombre: 'Spin-off', des: 3, fat: 0.1, elenco: 0.4, texto: 'Un personaje querido tiene su propia obra.' },
    { id: 'paralela', nombre: 'Historia paralela', des: 2, fat: 0.08, elenco: 0, texto: 'El mismo mundo con personajes nuevos.' },
    { id: 'remake', nombre: 'Remake', des: 3, fat: 0.05, elenco: 0, texto: 'La misma historia con elenco nuevo; mejor si pasaron años.' },
    { id: 'softreboot', nombre: 'Soft reboot', des: 4, fat: -0.2, elenco: 0.3, texto: 'Renueva la saga con un rostro conocido: baja la fatiga.' },
    { id: 'reboot', nombre: 'Reboot', des: 1, fat: -0.6, elenco: 0, texto: 'Empieza de cero en una continuidad nueva: casi borra la fatiga.' },
  ];
  const TEMPORADA = { id: 'temporada', nombre: 'Nueva temporada', des: 5, fat: 0.06, elenco: 1 };
  const CROSSOVER = { id: 'crossover', nombre: 'Crossover', des: 8, fat: 0.15, elenco: 1 };
  const PRODUCTOS = [
    { id: 'comic', nombre: 'Cómics', desde: 1930, k: 0.6 }, { id: 'ropa', nombre: 'Ropa', desde: 1935, k: 0.5 },
    { id: 'manga', nombre: 'Mangas', desde: 1950, k: 0.5 }, { id: 'juguetes', nombre: 'Juguetes', desde: 1955, k: 1 },
    { id: 'juego', nombre: 'Videojuegos', desde: 1978, k: 1.3 }, { id: 'figuras', nombre: 'Figuras de colección', desde: 1990, k: 0.8 },
  ];
  const NIVELES = ['Nueva', 'Conocida', 'Querida', 'Clásico', 'Clásico inmortal'];
  function camino(id) { return id === 'temporada' ? TEMPORADA : id === 'crossover' ? CROSSOVER : CAMINOS.filter(function (c) { return c.id === id; })[0] || CAMINOS[0]; }
  function st() { const S = N.S; if (!S.franq) S.franq = { lista: [], sig: 1 }; return S.franq; }
  function porId(id) { return st().lista.filter(function (f) { return f.id === id; })[0] || null; }
  function de(o) { return o && o.fr ? porId(o.fr) : null; }
  function dueno(o) { const f = de(o); return f ? f.est : o.der !== undefined ? o.der : o.est; }
  function obras(f) { return f.o.map(O.porId).filter(Boolean); }
  function estrenadas(f) { return obras(f).filter(function (o) { return o.pub !== undefined && o.et !== 'lista'; }); }
  function persDe(o) {
    return (o.pj || []).filter(function (p) { return p.i !== 'extra'; }).slice(0, 6).map(function (p, i) {
      const t = IA.talentos.porId(p.t);
      return { n: p.n, s: p.s, a: p.a, i: p.i, pop: Math.round(N.limitar((o.pub || 50) * (p.i === 'protagonista' ? 0.8 : 0.5), 5, 90)), t: p.t, tn: t ? t.nom : '', org: o.id, k: i };
    });
  }
  // Vuelve «viva» la franquicia de una obra (si aún no lo es)
  function materializar(o, nom, gen) {
    if (o.fr) return porId(o.fr);
    const s = st();
    const f = { id: s.sig++, nom: nom || o.tit, gen: gen || o.gen[0], est: o.der !== undefined ? o.der : o.est, o: [o.id], pers: persDe(o), fat: 0, mente: null, lic: [], xo: [],
      cont: [{ id: 1, nom: 'Canon principal' }], t0: o.fe || N.S.t };
    if (f.est !== 0) f.pers = f.pers.slice(0, 3); // los rivales guardan menos (memoria)
    s.lista.push(f);
    o.fr = f.id; o.cnt = 1;
    return f;
  }
  function registrar(obraId, nom, gen) {
    const o = O.porId(obraId);
    if (!o || dueno(o) !== 0) return 'Solo puedes registrar franquicias tuyas.';
    if (!(nom || '').trim()) return 'Ponle un nombre.';
    const f = materializar(o);
    f.nom = nom.trim().slice(0, 40); if (gen) f.gen = gen; f.reg = 1;
    return '';
  }
  // Calidad, entusiasmo (hype) y nivel de clásico
  function hype(f) {
    const es = estrenadas(f).slice(-3);
    if (!es.length) return 0;
    const pub = es.reduce(function (a, o) { return a + o.pub; }, 0) / es.length;
    const br = es.reduce(function (a, o) { return a + (o.bruto || 0); }, 0) / es.length / IA.economia.presupuestoTipico(N.anio(es[es.length - 1].fe || N.S.t));
    return Math.round(N.limitar((pub - 50) / 2.2 + Math.log(1 + Math.max(0, br)) * 5, -10, 16));
  }
  function biografia(f) {
    const es = estrenadas(f);
    const cal = es.length ? Math.round(es.reduce(function (a, o) { return a + (o.crit || 50); }, 0) / es.length) : 0;
    const pub = es.length ? Math.round(es.reduce(function (a, o) { return a + (o.pub || 50); }, 0) / es.length) : 0;
    const anios = Math.max(0, N.anio() - N.anio(f.t0 || N.S.t));
    const pts = es.length * 7 + (cal - 50) * 0.8 + (pub - 50) * 0.6 + Math.min(30, anios * 0.6) + es.filter(function (o) { return o.aw && o.aw.length; }).length * 6;
    const nivel = pts >= 70 ? 4 : pts >= 45 ? 3 : pts >= 25 ? 2 : pts >= 10 ? 1 : 0;
    const linea = obras(f).slice().sort(function (a, b) { return (a.fe || 1e9) - (b.fe || 1e9); });
    return { entradas: f.o.length, estrenadas: es.length, calidad: cal, publico: pub, hype: hype(f), fat: Math.round(f.fat * 100), nivel: nivel, nombreNivel: NIVELES[nivel], anios: anios,
      bruto: es.reduce(function (a, o) { return a + (o.bruto || 0) + (o.ing || 0); }, 0), linea: linea };
  }
  // Valor de mercado de una franquicia (o de una obra suelta)
  function valor(fo) {
    const f = fo && fo.o ? fo : null, lista = f ? estrenadas(f) : [fo];
    const tipico = tip();
    let v = 0.15 * tipico;
    lista.forEach(function (o) { const ed = Math.max(0, N.anio() - N.anio(o.fe || N.S.t)); v += tipico * Math.min(1.5, ((o.bruto || 0) + (o.ing || 0)) / IA.economia.presupuestoTipico(N.anio(o.fe || N.S.t)) * 0.12) * Math.pow(0.97, ed) + tipico * Math.max(0, (o.pub || 50) - 55) / 200; });
    if (f) v *= (1 - f.fat * 0.6) * (1 + biografia(f).nivel * 0.12);
    return Math.round(v);
  }
  // ---------- Continuar ----------
  function puedeContinuar(o) {
    if (!o) return 'No existe.';
    if (dueno(o) !== 0) return 'No tienes los derechos de esta franquicia.';
    if (o.pub === undefined) return 'Primero tiene que estrenarse.';
    return '';
  }
  function tituloPara(f, cam, base, pers) {
    const n = f.o.length + 1;
    if (cam.id === 'secuela') return f.nom + ' ' + n;
    if (cam.id === 'precuela') return f.nom + ': el origen';
    if (cam.id === 'spinoff') return pers ? pers.n : f.nom + ': los otros';
    if (cam.id === 'paralela') return f.nom + ': ' + O.tituloNuevo(base.gen);
    if (cam.id === 'softreboot') return f.nom + ': legado';
    if (cam.id === 'reboot') return f.nom + ' (' + N.anio() + ')';
    if (cam.id === 'temporada') return base.tit.replace(/ · T\d+$/, '') + ' · T' + ((base.tv && base.tv.temp || 1) + 1);
    return f.nom;
  }
  // Llama al elenco original: quien rechaza deja la ficha del personaje para el nuevo casting
  function llamarElenco(b, base, cam) {
    const res = [];
    (b.pj || []).forEach(function (p, i) {
      if (p.t === null || p.t === undefined) return;
      const t = IA.talentos.porId(p.t);
      let ok = !!t && IA.talentos.disponible(t, b.est) && N.probabilidad(cam.elenco);
      if (ok && t) {
        const prob = 0.85 - (t.fama > 0.7 && (base.pub || 50) < 50 ? 0.35 : 0) + ((base.pub || 50) > 70 ? 0.1 : 0) - (N.anio() - t.nac > 70 ? 0.3 : 0);
        ok = N.probabilidad(N.limitar(prob, 0.1, 0.97));
      }
      res.push({ pers: p.n, actor: t ? t.nom : (p.tn || '—'), ok: ok });
      if (!ok) { p.rech = t ? t.nom : ''; p.t = null; }
      if (i === 0 && cam.id === 'remake') p.t = null;
    });
    b.eq.int = (b.pj || []).filter(function (p) { return p.t !== null && p.t !== undefined; }).map(function (p) { return p.t; });
    return res;
  }
  // Prepara el borrador de la continuación (en el mismo medio o como serie). No inicia la obra.
  function continuar(obraId, camId, medio, persK) {
    const base = O.porId(obraId), err = puedeContinuar(base);
    if (err) return { error: err };
    const f = materializar(base), cam = camino(camId);
    const op = { gen: base.gen.slice(), escala: base.esc, tono: base.tono, tem: base.tem, completa: true };
    if (cam.id === 'remake' || cam.id === 'reboot') { op.arco = base.arco; op.prob = base.prob; op.epo = base.epo; op.lug = base.lug; }
    const b = O.borrador(0, op);
    const pers = cam.id === 'spinoff' ? (f.pers.slice().sort(function (a, c) { return c.pop - a.pop; }).filter(function (p) { return p.k === (persK === undefined ? p.k : +persK); })[0]) : null;
    // Personajes: los mismos (secuela, precuela, soft reboot, temporada), uno al frente (spin-off), nuevos (paralela)
    if (cam.id !== 'paralela' && base.pj) {
      b.pj = N.copiar(base.pj).map(function (p) { delete p.rech; return p; });
      if (pers) { b.pj.forEach(function (p) { if (p.n === pers.n) p.i = 'protagonista'; else if (p.i === 'protagonista') p.i = 'secundario'; }); }
      if (cam.id === 'reboot' || cam.id === 'remake') b.pj.forEach(function (p) { p.t = null; });
    }
    if (!b.arco || !(b.prob && b.prob.length)) IA.ideas.recomendarHistoria(b, N.anio()); // lo borrado al compactar la obra vieja
    b.fr = f.id; b.cam = cam.id; b.frN = f.o.length + 1;
    b.cnt = cam.id === 'reboot' ? 0 : base.cnt || 1;
    if (medio === 'tv' || cam.id === 'temporada') {
      b.med = 'tv';
      b.tv = cam.id === 'temporada' && base.tv ? Object.assign(N.copiar(base.tv), { temp: (base.tv.temp || 1) + 1 }) : IA.tv.configInicial(N.anio());
      delete b.tv.em; delete b.tv.ren; delete b.tv.tr; delete b.tv.pil;
      b.min = base.med === 'tv' && base.min ? base.min : IA.tv.formato(b.tv.fmt).min;
    }
    b.tit = tituloPara(f, cam, base, pers);
    const lla = cam.elenco > 0 ? llamarElenco(b, base, cam) : [];
    if (cam.elenco === 0) (b.pj || []).forEach(function (p) { p.t = null; });
    O.equipoRecomendado(b, 1);
    if (f.mente !== null) { const m = IA.talentos.porId(f.mente); if (m && IA.talentos.disponible(m, 0)) b.eq.produccion = m.id; }
    O.recalcular(b);
    return { b: b, elenco: lla, f: f };
  }
  // Crossover: dos franquicias tuyas en una obra (queda en las dos)
  function crossover(aId, bId) {
    const A = porId(aId), B = porId(bId);
    if (!A || !B || A === B) return 'Elige dos franquicias distintas.';
    if (A.est !== 0 || B.est !== 0) return 'Las dos deben ser tuyas.';
    if (A.xo.indexOf(B.id) < 0) A.xo.push(B.id);
    if (B.xo.indexOf(A.id) < 0) B.xo.push(A.id);
    return '';
  }
  function separar(aId, bId) {
    const A = porId(aId), B = porId(bId);
    if (A) A.xo = A.xo.filter(function (x) { return x !== bId; });
    if (B) B.xo = B.xo.filter(function (x) { return x !== aId; });
  }
  function continuarCruce(aId, bId) {
    const A = porId(aId), B = porId(bId);
    if (!A || !B || A.xo.indexOf(B.id) < 0) return { error: 'Primero une los dos universos.' };
    const ua = obras(A).filter(function (o) { return o.pub !== undefined; }).pop(), ub = obras(B).filter(function (o) { return o.pub !== undefined; }).pop();
    if (!ua || !ub) return { error: 'Las dos necesitan una obra estrenada.' };
    const r = continuar(ua.id, 'secuela');
    if (r.error) return r;
    const pb = (ub.pj || []).filter(function (p) { return p.i === 'protagonista'; }).slice(0, 1).map(function (p) { const q = N.copiar(p); q.i = 'secundario'; return q; });
    r.b.pj = (r.b.pj || []).concat(pb);
    r.b.eq.int = r.b.pj.filter(function (p) { return p.t !== null && p.t !== undefined; }).map(function (p) { return p.t; });
    r.b.cam = 'crossover'; r.b.fr2 = B.id; r.b.tit = A.nom + ' y ' + B.nom;
    O.equipoRecomendado(r.b, 1); O.recalcular(r.b);
    return r;
  }
  // Al crear la obra (O.crear): entra en la línea de su franquicia
  function alCrear(o) {
    const f = de(o);
    if (!f) return;
    if (f.o.indexOf(o.id) < 0) f.o.push(o.id);
    if (o.cnt === 0) { const id = f.cont.length + 1; f.cont.push({ id: id, nom: 'Continuidad ' + id + ' (' + N.anio() + ')' }); o.cnt = id; }
    const B = o.fr2 ? porId(o.fr2) : null;
    if (B && B.o.indexOf(o.id) < 0) B.o.push(o.id);
  }
  // ---------- Efectos en el público ----------
  function bonoDeseo(o) {
    const f = de(o);
    if (!f || !o.cam) return 0;
    const cam = camino(o.cam);
    let b = hype(f) * (cam.des / 6) * 0.5 + cam.des * 0.35 - f.fat * 14 + (f.mente !== null ? 1.5 : 0);
    if (o.cam === 'remake') { const ed = N.anio() - N.anio(f.t0 || N.S.t); b += ed > 15 ? 3 : -3; }
    return Math.round(N.limitar(b, -15, 10));
  }
  function bonoConocimiento(o) {
    const f = de(o);
    if (!f || !o.cam) return 0;
    return N.limitar(0.012 * Math.min(6, estrenadas(f).length) + (o.fr2 ? 0.02 : 0), 0, 0.08) * (1 - f.fat * 0.5);
  }
  function alEstrenar(o) {
    const f = de(o);
    if (!f || !o.cam) return;
    const cam = camino(o.cam);
    const prev = estrenadas(f).filter(function (x) { return x !== o && x.fe; }).map(function (x) { return x.fe; }).sort(function (a, b) { return b - a; })[0];
    let d = cam.fat * (f.mente !== null ? 0.6 : 1) + (prev !== undefined && o.fe - prev < 104 ? 0.08 : 0);
    f.fat = N.redondear(N.limitar(cam.fat < 0 ? f.fat * (1 + cam.fat) : f.fat + d, 0, 1), 3);
    if (o.fr2) { const B = porId(o.fr2); if (B) B.fat = N.redondear(N.limitar(B.fat + 0.1, 0, 1), 3); }
  }
  // Popularidad de los personajes después de cada obra
  function alTerminar(o) {
    const f = de(o);
    if (!f) return;
    (o.pj || []).forEach(function (p) {
      let q = f.pers.filter(function (x) { return x.n === p.n; })[0];
      if (!q) { if (f.pers.length >= (f.est === 0 ? 12 : 4)) return; q = { n: p.n, s: p.s, a: p.a, i: p.i, pop: 30, k: f.pers.length, org: o.id }; f.pers.push(q); }
      q.pop = Math.round(N.limitar(q.pop * 0.6 + (o.pub || 50) * (p.i === 'protagonista' ? 0.5 : 0.35) + (o.bruto > tip() ? 4 : 0), 1, 99));
      if (p.t !== null && p.t !== undefined) { q.t = p.t; const t = IA.talentos.porId(p.t); q.tn = t ? t.nom : q.tn; }
    });
  }
  // ---------- Licencias y derivados ----------
  function productos(anio) { return PRODUCTOS.filter(function (p) { return p.desde <= anio; }); }
  function ingresoLicencia(f, p, prod, canon) { return Math.round(tip() * 0.0006 * prod.k * (p.pop / 50) * (canon ? 1 : 1.35) * (1 - f.fat * 0.5)); }
  function licenciar(frId, k, prodId, canon) {
    const f = porId(frId), prod = PRODUCTOS.filter(function (x) { return x.id === prodId; })[0];
    if (!f || f.est !== 0) return 'No es tuya.';
    const p = f.pers.filter(function (x) { return x.k === +k; })[0];
    if (!p || !prod || prod.desde > N.anio()) return 'Ese producto aún no existe.';
    if (f.lic.some(function (l) { return l.k === p.k && l.p === prod.id && l.hasta > N.S.t; })) return 'Ese personaje ya tiene esa licencia.';
    f.lic.push({ k: p.k, p: prod.id, c: canon ? 1 : 0, sem: ingresoLicencia(f, p, prod, canon), hasta: N.S.t + 156 });
    if (canon) p.pop = Math.min(99, p.pop + 3); else f.fat = N.redondear(Math.min(1, f.fat + 0.04), 3);
    return '';
  }
  // ---------- Canon y continuidades ----------
  function moverContinuidad(obraId, cntId) {
    const o = O.porId(obraId), f = de(o);
    if (!f || f.est !== 0) return 'No es tuya.';
    if (cntId === 'nueva') { const id = f.cont.length + 1; f.cont.push({ id: id, nom: 'Continuidad ' + id }); o.cnt = id; }
    else if (cntId === 'nocanon') o.cnt = -1;
    else o.cnt = +cntId;
    return '';
  }
  function renombrarContinuidad(frId, cntId, nom) { const f = porId(frId), c = f && f.cont.filter(function (x) { return x.id === +cntId; })[0]; if (c && nom) c.nom = nom.slice(0, 40); }
  function asignarMente(frId, tid) {
    const f = porId(frId), t = IA.talentos.porId(+tid);
    if (!f || f.est !== 0) return 'No es tuya.';
    if (tid === null || tid === '') { f.mente = null; return ''; }
    if (!t || t.of !== 'produccion') return 'La mente maestra debe ser un productor.';
    f.mente = t.id;
    return '';
  }
  // ---------- Mercado de derechos ----------
  function enVenta() {
    const S = N.S, anio = N.anio();
    const vivas = st().lista.filter(function (f) { return f.est > 0 && estrenadas(f).length; }).map(function (f) { return { tipo: 'franquicia', f: f, nom: f.nom, est: f.est, precio: precioCompra(f) }; });
    const sueltas = S.obras.filter(function (o) { return o.est > 0 && !o.fr && o.et === 'terminada' && o.pub >= 60 && anio - N.anio(o.fe) <= 40 && o.der === undefined; })
      .sort(function (a, b) { return (b.pub + Math.log(1 + (b.bruto || 0))) - (a.pub + Math.log(1 + (a.bruto || 0))); }).slice(0, 12)
      .map(function (o) { return { tipo: 'obra', o: o, nom: o.tit, est: o.est, precio: Math.round(valor(o) * 1.25) }; });
    return vivas.slice(0, 10).concat(sueltas);
  }
  // Las de estudios quebrados se venden con descuento (V24)
  function precioCompra(f) { return Math.round(valor(f) * (N.S.estudios[f.est] && N.S.estudios[f.est].quebrado ? 0.6 : 1.25)); }
  function comprar(tipo, id) {
    const S = N.S;
    const f = tipo === 'franquicia' ? porId(+id) : null, o = tipo === 'obra' ? O.porId(+id) : null;
    if ((!f || f.est === 0) && (!o || dueno(o) === 0)) return 'Ya no está en venta.';
    const precio = f ? precioCompra(f) : Math.round(valor(o) * 1.25);
    if (S.estudios[0].caja < precio) return 'No alcanza la caja.';
    const vend = f ? f.est : o.est;
    IA.negocio.pagar(0, 'derechos', precio);
    IA.negocio.cobrarEn(vend, 'derechos', precio);
    const F = f || materializar(o);
    F.est = 0; F.mente = null;
    obras(F).forEach(function (x) { x.der = 0; });
    N.emit('noticia', { tipo: 'estudio', texto: 'Compras los derechos de «' + F.nom + '» a ' + S.estudios[vend].nombre + '.', importante: true });
    return '';
  }
  function vender(frId, estId, precio) {
    const f = porId(frId), S = N.S;
    if (!f || f.est !== 0) return 'No es tuya.';
    const p = precio || valor(f);
    IA.negocio.cobrarEn(0, 'licencias', p);
    S.estudios[estId].caja -= p;
    f.est = estId; f.mente = null; f.lic = [];
    obras(f).forEach(function (x) { x.der = estId; });
    S.ofFr = (S.ofFr || []).filter(function (x) { return x.fr !== f.id; });
    N.emit('noticia', { tipo: 'estudio', texto: 'Vendes «' + f.nom + '» a ' + S.estudios[estId].nombre + '.', importante: true });
    return '';
  }
  function aceptarOferta(i) { const S = N.S, x = (S.ofFr || [])[+i]; if (!x) return 'Ya venció.'; return vender(x.fr, x.est, x.precio); }
  function rechazarOferta(i) { const S = N.S; (S.ofFr || []).splice(+i, 1); }
  // Los rivales a veces quieren tu franquicia más valiosa
  function mensual() {
    const S = N.S;
    S.ofFr = (S.ofFr || []).filter(function (x) { return x.hasta > S.t; });
    if (S.ofFr.length >= 2 || !N.probabilidad(0.06)) return;
    const mias = st().lista.filter(function (f) { return f.est === 0 && estrenadas(f).length && !S.ofFr.some(function (x) { return x.fr === f.id; }); });
    if (!mias.length) return;
    const f = mias.sort(function (a, b) { return valor(b) - valor(a); })[0];
    const rv = S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado && e.caja > valor(f) * 1.5; });
    if (!rv.length) return;
    const e = N.elegir(rv);
    S.ofFr.push({ fr: f.id, est: e.id, precio: Math.round(valor(f) * (0.9 + N.azar() * 0.4)), hasta: S.t + 8 });
    N.emit('noticia', { tipo: 'rival', texto: e.nombre + ' ofrece comprar tu franquicia «' + f.nom + '».', importante: true });
  }
  function semana() {
    const S = N.S;
    st().lista.forEach(function (f) {
      if (f.est !== 0 || !f.lic.length) return;
      let s = 0;
      f.lic = f.lic.filter(function (l) { if (l.hasta <= S.t) return false; s += l.sem; return true; });
      if (s) IA.negocio.cobrarEn(0, 'licencias', s);
    });
  }
  function anual() { st().lista.forEach(function (f) { f.fat = N.redondear(f.fat * 0.82, 3); }); }
  // Rivales: a veces continúan su éxito reciente
  function secuelaRival(est) {
    const S = N.S;
    if (!N.probabilidad(0.12)) return null;
    const c = S.obras.filter(function (o) { return o.est === est.id && o.et === 'terminada' && o.pub >= 66 && S.t - (o.fe || 0) < 52 * 6 && dueno(o) === est.id && !o.sig; })
      .sort(function (a, b) { return (b.bruto || 0) - (a.bruto || 0); })[0];
    return c || null;
  }
  function prepararRival(b, base) {
    const f = materializar(base);
    if (f.fat > 0.6) return;
    b.fr = f.id; b.cam = 'secuela'; b.frN = f.o.length + 1; b.gen = base.gen.slice(); b.tit = f.nom + ' ' + b.frN; b.cnt = base.cnt || 1;
    base.sig = 1;
  }
  return { CAMINOS: CAMINOS, PRODUCTOS: PRODUCTOS, NIVELES: NIVELES, camino: camino, lista: function () { return st().lista; }, porId: porId, de: de, dueno: dueno, obras: obras,
    estrenadas: estrenadas, materializar: materializar, registrar: registrar, hype: hype, biografia: biografia, valor: valor, puedeContinuar: puedeContinuar, continuar: continuar,
    crossover: crossover, separar: separar, continuarCruce: continuarCruce, alCrear: alCrear, bonoDeseo: bonoDeseo, bonoConocimiento: bonoConocimiento, alEstrenar: alEstrenar,
    alTerminar: alTerminar, productos: productos, ingresoLicencia: ingresoLicencia, licenciar: licenciar, moverContinuidad: moverContinuidad, renombrarContinuidad: renombrarContinuidad,
    asignarMente: asignarMente, enVenta: enVenta, comprar: comprar, vender: vender, aceptarOferta: aceptarOferta, rechazarOferta: rechazarOferta, mensual: mensual, semana: semana,
    anual: anual, secuelaRival: secuelaRival, prepararRival: prepararRival };
})();
