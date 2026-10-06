/* ==== módulo: estreno ==== */
// V20 · Lanzamiento: el plan de estreno de cada obra. Fecha con cuenta regresiva (el anuncio arma expectativa),
// estreno por región (amplio, limitado, escalonado o retener), doblaje por mercado con su costo, la mezcla de
// canales de marketing (cada uno llega mejor a unas edades, con rendimientos decrecientes), las promociones
// (alfombra roja, comida, juguetes, coleccionables, ediciones exclusivas), las cadenas de cines con contrato y
// los cines propios. Todo es dato plano en la obra (o.plan) y en el estudio (est.cad).
IA.estreno = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia;

  // ---------- Datos ----------
  const MODOS = [
    { id: 'amplio', nombre: 'Amplio', salas: 1, mkt: 1, texto: 'En todas las salas posibles.' },
    { id: 'limitado', nombre: 'Limitado', salas: 0.4, mkt: 0.4, texto: 'Pocas salas: cuesta menos y, si gusta mucho, crece semana a semana.' },
    { id: 'escalonado', nombre: 'Escalonado', salas: 1, mkt: 0.9, espera: 4, texto: 'Llega 4 semanas después, con el boca a boca de las otras regiones.' },
    { id: 'retener', nombre: 'Retener (0)', salas: 0, mkt: 0, texto: 'No se estrena en esta región: queda para video, TV y streaming.' },
  ];
  // Promociones: costo en marketings típicos de la época; des = expectativa; crit = crítica; merch = ingresos extra
  const PROMOS = [
    { id: 'alfombra', nombre: 'Alfombra roja', desde: 1922, costo: 0.15, des: 2, texto: 'Estreno de gala: +2 a la expectativa y, si la obra es buena (70 o más), +1 a la crítica.' },
    { id: 'comida', nombre: 'Promoción con comida', desde: 1930, costo: 0.2, con: 0.05, texto: 'Llega a más gente (+5 % de conocimiento), pero en arte y drama la crítica lo ve comercial (−1).' },
    { id: 'juguetes', nombre: 'Juguetes', desde: 1930, costo: 0.35, des: 1, merch: 0.05, texto: '+3 a la expectativa en familia, imaginación y acción; vende juguetes (hasta 5 % de la taquilla).' },
    { id: 'coleccionables', nombre: 'Coleccionables', desde: 1977, costo: 0.25, des: 2, merch: 0.02, texto: 'Para fans de imaginación, acción y miedo: +2 a la expectativa y algo de ventas.' },
    { id: 'exclusivos', nombre: 'Ediciones exclusivas', desde: 1985, costo: 0.2, video: 0.15, texto: 'Ediciones de colección: +15 % en la venta de video.' },
  ];
  // Cadenas de cines por región (nombres inventados): salas = parte de las salas de la región; parte = punto
  // extra de lo que recibe el estudio; minimo = semanas que te garantizan; cuota = costo anual en presupuestos
  // típicos; fama = fama mínima del estudio para firmar
  const CADENAS = {
    nam: [['Cines Estrella', 1905, 0.3, 0.06, 3, 0.12, 0.25], ['Gran Pantalla', 1920, 0.22, 0.05, 2, 0.08, 0.1], ['Marquesina Real', 1950, 0.18, 0.08, 4, 0.1, 0.35]],
    eur: [['Cinéma Lumière', 1900, 0.28, 0.06, 3, 0.11, 0.2], ['Kino Imperial', 1915, 0.2, 0.05, 2, 0.07, 0.1], ['Palacio del Film', 1960, 0.16, 0.08, 4, 0.09, 0.35]],
    lat: [['Cinemas del Sol', 1910, 0.3, 0.07, 3, 0.07, 0.15], ['Teatro Rex', 1925, 0.2, 0.05, 2, 0.05, 0.05], ['Pantalla Andina', 1980, 0.18, 0.08, 4, 0.06, 0.3]],
    afr: [['Cine Sahel', 1930, 0.32, 0.07, 3, 0.04, 0.1], ['Sala Baobab', 1975, 0.22, 0.06, 2, 0.03, 0.05]],
    asi: [['Cine Loto', 1910, 0.26, 0.06, 3, 0.1, 0.2], ['Sala Dragón', 1935, 0.22, 0.06, 2, 0.08, 0.1], ['Pantalla Oriente', 1985, 0.2, 0.08, 4, 0.1, 0.35]],
    oce: [['Cines Austral', 1915, 0.34, 0.07, 3, 0.04, 0.1], ['Pantalla Coral', 1970, 0.24, 0.06, 2, 0.03, 0.05]],
  };
  function cadenas(reg) {
    return (CADENAS[reg] || []).map(function (c, i) { return { id: reg + i, reg: reg, nombre: c[0], desde: c[1], salas: c[2], parte: c[3], minimo: c[4], cuota: c[5], fama: c[6] }; });
  }
  function cadena(id) { return id ? cadenas(id.slice(0, 3)).filter(function (c) { return c.id === id; })[0] : null; }
  const ANIO_SONORO = 1929;

  // ---------- Ayudas ----------
  function modo(id) { return MODOS.filter(function (m) { return m.id === id; })[0] || MODOS[0]; }
  function promo(id) { return PROMOS.filter(function (p) { return p.id === id; })[0]; }
  function promosDisponibles(a) { return PROMOS.filter(function (p) { return p.desde <= a; }); }
  // Parte del público de cine de cada región ese año (para repartir la campaña)
  function pesoRegiones(anio) {
    const da = E.datosAnio(anio), r = {};
    let s = 0;
    D.regiones.forEach(function (x) { r[x.id] = Math.max(0, da.regiones[x.id].publico * da.regiones[x.id].precio); s += r[x.id]; });
    Object.keys(r).forEach(function (k) { r[k] = s > 0 ? r[k] / s : 1 / 6; });
    return r;
  }
  // ¿Hace falta doblar en esa región? Solo con sonido y si el idioma de la obra no es de allí
  function necesitaDoblaje(o, reg, anio) {
    if (anio < ANIO_SONORO || (o.fmt && o.fmt.sonido === 'Mudo')) return false;
    const idi = IA.taxonomia.idioma(o.idio);
    if (!idi || idi.universal) return false;
    return !(idi.regiones.indexOf(reg) >= 0 || idi.paises.some(function (p) { const x = D.pais(p); return x && x.region === reg; }));
  }
  function costoDoblaje(anio) { return Math.round(E.marketingTipico(anio) * 0.03); }
  // Edades a las que les habla la obra (familia, clasificación y público objetivo)
  function edadesObra(o) {
    const fam = D.familia(o.fam || D.familiaDe[o.gen[0]] || 'DR');
    const cl = D.clasificacion(o.clas) || D.clasificacion('PG-13');
    const ex = IA.ideas.edadesExtra(o);
    const v = [];
    for (let g = 0; g < 5; g++) v.push(fam.edades[g] * E.PROPENSION[g] * cl.acceso[g] * (ex ? ex[g] : 1));
    return v;
  }
  function coseno(a, b) { // (se conserva para otras comparaciones)
    let ab = 0, aa = 0, bb = 0;
    for (let i = 0; i < 5; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
    return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : 0;
  }
  // Edades de la obra como reparto (suma 1)
  function objetivo(o) {
    const ed = edadesObra(o);
    const s = ed.reduce(function (a, b) { return a + b; }, 0) || 1;
    return ed.map(function (x) { return x / s; });
  }
  function encaje(t, c) { let e = 0; for (let g = 0; g < 5; g++) e += t[g] * c.edades[g]; return e; }
  // Mezcla recomendada: más peso a los canales que llegan a las edades de la obra
  function mixRecomendado(o, anio) {
    const t = objetivo(o), r = {};
    E.canalesDe(anio).forEach(function (c) { r[c.id] = N.redondear(c.peso * Math.pow(encaje(t, c), 4), 3); });
    return r;
  }
  // Cuánto llega una mezcla a las edades de la obra. Rendimientos decrecientes: el peso de cada canal cuenta por
  // su raíz, así que poner todo en uno rinde mucho menos que repartir
  function evaluarMix(o, mix, anio) {
    const cs = E.canalesDe(anio), t = objetivo(o);
    let s = 0;
    cs.forEach(function (c) { s += Math.max(0, mix && mix[c.id] !== undefined ? mix[c.id] : c.peso); });
    if (s <= 0) return { alcance: 0.5, afinidad: 0, porEdad: [0, 0, 0, 0, 0], ef: 0.01 };
    const porEdad = [0, 0, 0, 0, 0];
    let alc = 0;
    cs.forEach(function (c) {
      const w = Math.max(0, mix && mix[c.id] !== undefined ? mix[c.id] : c.peso) / s;
      const k = Math.sqrt(w) * c.alcance;
      alc += k;
      for (let g = 0; g < 5; g++) porEdad[g] += k * c.edades[g];
    });
    const n = Math.sqrt(cs.length);
    let ef = 0;
    for (let g = 0; g < 5; g++) { porEdad[g] /= n; ef += t[g] * porEdad[g]; }
    const tot = porEdad.reduce(function (a, b) { return a + b; }, 0) || 1;
    return { alcance: alc / n, afinidad: N.limitar(ef / (tot / 5), 0, 2) / 2, porEdad: porEdad, ef: Math.max(0.01, ef) };
  }

  // ---------- El plan ----------
  // Plan de los rivales: amplio en todas partes, doblado y con la mezcla de siempre
  function planRival(o, anio) {
    const p = { reg: {}, dob: {}, mix: null, promo: [], via: 'cines', rival: 1 };
    D.regiones.forEach(function (r) { p.reg[r.id] = 'amplio'; if (necesitaDoblaje(o, r.id, anio)) p.dob[r.id] = 1; });
    return p;
  }
  function planPorDefecto(o, anio) {
    const p = { reg: {}, dob: {}, mix: mixRecomendado(o, anio), promo: [], via: 'cines' };
    D.regiones.forEach(function (r) { p.reg[r.id] = 'amplio'; if (necesitaDoblaje(o, r.id, anio)) p.dob[r.id] = 1; });
    return p;
  }
  function normalizar(o, plan, anio) {
    const p = plan || planPorDefecto(o, anio);
    p.reg = p.reg || {}; p.dob = p.dob || {}; p.promo = (p.promo || []).filter(function (id) { const x = promo(id); return x && x.desde <= anio; });
    D.regiones.forEach(function (r) { if (!p.reg[r.id]) p.reg[r.id] = 'amplio'; if (!necesitaDoblaje(o, r.id, anio)) delete p.dob[r.id]; });
    if (!p.mix && !p.rival) p.mix = mixRecomendado(o, anio);
    if (!p.via) p.via = 'cines';
    return p;
  }
  // Costo del plan: campaña repartida por región según su modo, doblajes y promociones
  function costos(o, plan, nivM, anio) {
    const p = normalizar(o, plan, anio);
    const base = E.marketingTipico(anio) * D.nivelesMarketing[nivM].mult;
    if (p.via !== 'cines') return { campana: Math.round(base * 0.3), doblaje: 0, promos: 0, total: Math.round(base * 0.3) };
    const pr = pesoRegiones(anio);
    let f = 0;
    D.regiones.forEach(function (r) { f += pr[r.id] * modo(p.reg[r.id]).mkt; });
    const campana = Math.round(base * f);
    const doblaje = Object.keys(p.dob).filter(function (k) { return p.reg[k] !== 'retener'; }).length * costoDoblaje(anio);
    const promos = Math.round(p.promo.reduce(function (s, id) { return s + promo(id).costo; }, 0) * E.marketingTipico(anio));
    return { campana: campana, doblaje: doblaje, promos: promos, total: campana + doblaje + promos };
  }

  // ---------- Efectos al estrenar (los usa la economía) ----------
  // Conocimiento extra por la cuenta regresiva (anunciar con tiempo arma expectativa) y por las promociones
  function bonoConocimiento(o) {
    const p = o.plan;
    if (!p) return 0;
    let b = Math.min(8, p.anuncio || 0) * 0.012 * (o.cm > 0 ? 1 : 0.3);
    if (p.promo && p.promo.indexOf('comida') >= 0) b += 0.05;
    return b;
  }
  // Frente a la mezcla de siempre (la de los rivales): apuntar a las edades de la obra rinde más
  function factorCampana(o) {
    const p = o.plan;
    if (!p || !p.mix) return 1;
    const a = o.anio || N.anio();
    const ev = evaluarMix(o, p.mix, a), ref = evaluarMix(o, null, a);
    return N.limitar(Math.pow(ev.ef / ref.ef, 4), 0.6, 1.25);
  }
  function bonoDeseo(o) {
    const p = o.plan;
    if (!p || !p.promo) return 0;
    let d = 0;
    p.promo.forEach(function (id) {
      const x = promo(id);
      if (!x || !x.des) return;
      if (id === 'juguetes') d += ['FJ', 'IM', 'AA'].indexOf(o.fam) >= 0 ? 3 : x.des;
      else if (id === 'coleccionables') d += ['IM', 'AA', 'SM'].indexOf(o.fam) >= 0 ? x.des : 0;
      else d += x.des;
    });
    return d;
  }
  // La crítica también reacciona a las promociones
  function ajusteCritica(o) {
    const p = o.plan;
    if (!p || !p.promo) return 0;
    let c = 0;
    if (p.promo.indexOf('alfombra') >= 0 && o.pub >= 70) c += 1;
    if (p.promo.indexOf('comida') >= 0 && (o.fam === 'AV' || o.fam === 'DR')) c -= 1;
    return c;
  }
  // Peso de la obra en una región esa semana: modo de estreno, doblaje, cadenas con contrato y cines propios
  function factorRegion(o, reg, sc) {
    let f = 1;
    const p = o.plan;
    if (p) {
      const m = modo(p.reg && p.reg[reg]);
      if (m.id === 'retener') return 0;
      if (m.espera && sc < m.espera) return 0;
      if (m.id === 'limitado') f *= Math.min(1, m.salas + (o.pub >= 70 ? 0.08 * sc : 0));
      if (necesitaDoblaje(o, reg, o.anio || N.anio())) f *= p.dob && p.dob[reg] ? 1 : 0.9;
    }
    const est = N.S.estudios[o.est];
    const c = est && est.cad && est.cad[reg] && est.cad[reg].hasta > N.S.t ? cadena(est.cad[reg].id) : null;
    if (c) f *= 1 + 0.3 * c.salas;
    if (o.est === 0 && reg === est.reg) f *= 1 + 0.12 * cinesPropios();
    return f;
  }
  // Punto extra de lo que recibe el estudio en esa región (contrato con una cadena y cines propios)
  function parteExtra(o, reg) {
    const est = N.S.estudios[o.est];
    let x = 0;
    const c = est && est.cad && est.cad[reg] && est.cad[reg].hasta > N.S.t ? cadena(est.cad[reg].id) : null;
    if (c) x += c.parte;
    if (o.est === 0 && reg === est.reg) x += 0.12 * cinesPropios();
    return x;
  }
  // Semanas mínimas garantizadas por los contratos (la obra no sale antes de cartelera)
  function semanasMinimas(o) {
    const est = N.S.estudios[o.est];
    let m = 0;
    if (est && est.cad) Object.keys(est.cad).forEach(function (r) { const k = est.cad[r]; if (k.hasta > N.S.t) { const c = cadena(k.id); if (c && (!o.plan || o.plan.reg[r] !== 'retener')) m = Math.max(m, c.minimo); } });
    return m;
  }

  // ---------- Cadenas de cines con contrato y cines propios ----------
  function cinesPropios() { return Math.min(3, N.S.estudios[0].terrenos.filter(function (x) { return x === 'cine'; }).length); }
  function puedeFirmar(id, anios) {
    const c = cadena(id), est = N.S.estudios[0];
    if (!c) return 'Esa cadena no existe.';
    if (c.desde > N.anio()) return c.nombre + ' abre en ' + c.desde + '.';
    if (est.fama < c.fama) return c.nombre + ' solo firma con estudios más famosos (fama ' + Math.round(c.fama * 100) + ').';
    if (est.cad && est.cad[c.reg] && est.cad[c.reg].hasta > N.S.t) return 'Ya tienes contrato en esa región.';
    if (est.caja < costoCadena(c) * (anios || 1) / 4) return 'No alcanza la caja para el primer pago.';
    return '';
  }
  function costoCadena(c) { return Math.round(E.presupuestoTipico(N.anio()) * c.cuota); }
  function firmar(id, anios) {
    const err = puedeFirmar(id, anios);
    if (err) return err;
    const c = cadena(id), est = N.S.estudios[0];
    est.cad = est.cad || {};
    est.cad[c.reg] = { id: c.id, hasta: N.S.t + 52 * (anios || 1) };
    N.emit('noticia', { tipo: 'estudio', texto: 'Firmas con ' + c.nombre + ' (' + D.region(c.reg).nombre + ') por ' + (anios || 1) + ' año' + ((anios || 1) > 1 ? 's' : '') + '.' });
    return '';
  }
  function cancelar(reg) {
    const est = N.S.estudios[0];
    if (!est.cad || !est.cad[reg]) return 'No hay contrato en esa región.';
    delete est.cad[reg];
    return '';
  }
  // Cada mes: cuotas de los contratos y lo que dejan tus cines con las obras ajenas
  function mensual(ctx) {
    const S = N.S, est = S.estudios[0];
    if (est.cad) Object.keys(est.cad).forEach(function (r) {
      const k = est.cad[r], c = cadena(k.id);
      if (!c || k.hasta <= S.t) { if (c) N.emit('noticia', { tipo: 'estudio', texto: 'Termina tu contrato con ' + c.nombre + '.' }); delete est.cad[r]; return; }
      ctx.pagar(0, 'distribucion', costoCadena(c) / 12);
    });
    const n = cinesPropios();
    if (n && S.mercado.semana) {
      const da = E.datosAnio(N.anio()), tot = Object.keys(da.regiones).reduce(function (s, k) { return s + da.regiones[k].publico * da.regiones[k].precio; }, 0);
      const casa = da.regiones[est.reg] ? da.regiones[est.reg].publico * da.regiones[est.reg].precio : 0;
      // Tus salas cobran una parte de las entradas de las obras ajenas en tu región
      const g = (S.mercado.semana.bruto || 0) * (tot > 0 ? casa / tot : 0) * 0.012 * n * 4.33;
      if (g > 0) IA.negocio.cobrarEn(0, 'exhibicion', g);
    }
  }

  return {
    MODOS: MODOS, PROMOS: PROMOS, modo: modo, promo: promo, promosDisponibles: promosDisponibles, pesoRegiones: pesoRegiones,
    necesitaDoblaje: necesitaDoblaje, costoDoblaje: costoDoblaje, edadesObra: edadesObra, mixRecomendado: mixRecomendado,
    evaluarMix: evaluarMix, planPorDefecto: planPorDefecto, planRival: planRival, normalizar: normalizar, costos: costos, bonoConocimiento: bonoConocimiento,
    factorCampana: factorCampana, bonoDeseo: bonoDeseo, ajusteCritica: ajusteCritica, factorRegion: factorRegion, parteExtra: parteExtra,
    semanasMinimas: semanasMinimas, cadenas: cadenas, cadena: cadena, cinesPropios: cinesPropios, puedeFirmar: puedeFirmar,
    costoCadena: costoCadena, firmar: firmar, cancelar: cancelar, mensual: mensual, ANIO_SONORO: ANIO_SONORO,
  };
})();
