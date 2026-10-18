/* ==== módulo: streaming ==== */
// Plataforma propia (desde 2007) con tres planes (con anuncios, estándar y premium), suscriptores, costo de
// servidores e ingresos; catálogo propio, comprado y licenciado (exclusiva, global o temporal) con propuestas de ida
// y vuelta y contratos que se extienden; capacidad de biblioteca con costo de almacenamiento y bóvedas; líneas de
// suministro y mercado negro de contenido.
IA.streaming = (function () {
  'use strict';
  const N = IA.n, O = IA.obras;
  const tip = function () { return IA.economia.presupuestoTipico(N.anio()); };
  const ANIO = 2007;
  const PLANES = [{ id: 'anuncios', nombre: 'Con anuncios', k: 0.6, mix: 0.35 }, { id: 'estandar', nombre: 'Estándar', k: 1, mix: 0.45 }, { id: 'premium', nombre: 'Premium', k: 1.6, mix: 0.2 }];
  const MODOS = [{ id: 'temporal', nombre: 'Temporal (1 año)', k: 1, sem: 52, ex: 0 }, { id: 'global', nombre: 'Global (2 años, sin exclusiva)', k: 1.5, sem: 104, ex: 0 }, { id: 'exclusiva', nombre: 'Exclusiva (2 años)', k: 2.4, sem: 104, ex: 1 }, { id: 'comprado', nombre: 'Compra para siempre', k: 5, sem: 0, ex: 1 }];
  const PROVEEDORES = [
    { id: 'doc', nom: 'Documentales del Sur', n: 2, v: 0.45, k: 0.03, gen: 'Documental', col: '#2dd4bf' }, { id: 'anim', nom: 'Estudio Kumo', n: 3, v: 0.6, k: 0.06, gen: 'Animación', col: '#9b8cff' },
    { id: 'clas', nom: 'Archivo Dorado', n: 4, v: 0.5, k: 0.05, gen: 'Drama', col: '#ffc857' }, { id: 'telen', nom: 'Novelas del Caribe', n: 2, v: 0.55, k: 0.04, gen: 'Melodrama', col: '#ff6b9a' },
  ];
  // Paquetes de catálogo: n títulos de calidad q, precio relativo k
  const PAQUETES = [{ id: 'basico', nombre: 'Paquete básico', n: 5, q: 55, k: 1 }, { id: 'premium', nombre: 'Paquete premium', n: 5, q: 72, k: 2.5 }, { id: 'estrenos', nombre: 'Paquete de estrenos', n: 3, q: 84, k: 4 }];
  // Parte del mercado mundial de streaming en cada región
  const REGIONES = { nam: 0.3, eur: 0.24, asi: 0.26, lat: 0.1, afr: 0.04, oce: 0.06 };
  const HORAS = 4.5; // horas que ve cada suscriptor por semana
  const CHURN = 0.011; // abandono semanal típico (unos 4,5 % al mes)
  function precioTipico(anio) { return IA.mundo.aEpoca(11, anio); } // al mes, plan estándar
  function mercado(anio) { return N.interp([[2007, 1], [2012, 30], [2016, 110], [2020, 350], [2025, 550], [2150, 1100]], anio) * 1e6; }
  function rivales(anio) { return N.interp([[2007, 6], [2015, 40], [2020, 90], [2030, 110], [2150, 150]], anio); }
  function puede() { return N.anio() >= ANIO; }
  function costoLanzar() { return Math.round(tip() * 5); }
  function asegurar(s) {
    if (!s || s.v === 3) return s;
    const S = N.S;
    if (!s.reg) s.reg = Object.keys(REGIONES); // las plataformas de antes ya estaban en todo el mundo
    if (!s.srv) s.srv = 1;
    const pt = precioTipico(N.anio());
    if (!s.pt0) { s.pt0 = pt; if (precioMedio(s) < pt * 0.5) s.precios = PLANES.map(function (x) { return N.redondear(pt * x.k, 2); }); }
    if (s.prueba === undefined) s.prueba = false;
    if (s.camp === undefined) s.camp = null;
    if (s.dest === undefined) s.dest = null;
    if (!Array.isArray(s.fila)) s.fila = [];
    if (!Array.isArray(s.hist)) s.hist = [];
    (s.cat || []).forEach(function (x) { if (x.t0 === undefined) x.t0 = S.t - 52; if (x.vs === undefined) x.vs = 0; });
    s.v = 3;
    return s;
  }
  function plataforma() { return asegurar(N.S.stream); }
  function lanzar(nom) {
    const S = N.S;
    if (S.stream) return 'Ya tienes plataforma.';
    if (!puede()) return 'El streaming llega en ' + ANIO + '.';
    if (S.estudios[0].caja < costoLanzar()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', costoLanzar());
    const p = precioTipico(N.anio()), casa = S.estudios[0].reg || 'nam';
    S.stream = { nom: (nom || S.estudios[0].nombre + '+').slice(0, 30), t0: S.t, precios: PLANES.map(function (x) { return N.redondear(p * x.k, 2); }), subs: 0, cat: [], cap: 40, bov: 0, lineas: [], ofLic: [], hist: [], negro: 0,
      reg: [REGIONES[casa] ? casa : 'nam'], srv: 1, prueba: false, camp: null, dest: null, fila: [], pt0: p, v: 3 };
    S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada'; }).sort(function (a, b) { return (b.pub || 0) - (a.pub || 0); }).slice(0, 20).forEach(function (o) { agregar(o.id, 'propio'); });
    ofertas();
    return '';
  }
  function ponerPrecio(i, v) { const s = plataforma(); if (s) s.precios[+i] = N.redondear(N.limitar(+v || 0, 0.5, precioTipico(N.anio()) * 4), 2); }
  function porId(id) { const s = N.S.stream; return s ? s.cat.filter(function (x) { return x.id === +id; })[0] || null : null; }
  function obraDe(x) { return x && x.o ? O.porId(x.o) : null; }
  function calidad(x) { const o = obraDe(x); return o ? (o.tv && o.tv.q) || o.pub || 50 : x.q || 50; }
  function generoDe(x) { const o = obraDe(x); return o ? o.gen[0] : x.gen || 'Drama'; }
  function famDe(x) { const o = obraDe(x); return o ? o.fam : IA.datos.familiaDe ? IA.datos.familiaDe[generoDe(x)] || 'DR' : 'DR'; }
  function edadTitulo(x) { const o = obraDe(x); return o && o.fe !== undefined ? Math.max(0, N.S.t - o.fe) / 52 : x.ed || 5; }
  function esNuevo(x) { return N.S.t - (x.t0 || 0) < 8; }
  // Valor de un título para atraer suscriptores: calidad, novedad, series y exclusiva
  function valorTitulo(x) {
    const o = obraDe(x), q = calidad(x), ed = edadTitulo(x);
    return N.redondear(Math.pow(q / 55, 2) * (0.4 + 0.6 * Math.exp(-ed / 6)) * (o && o.tv ? 1.4 : 1) * (x.ex ? 1.25 : 1) * (x.orig ? 1.3 : 1) * (x.v || 1), 3);
  }
  // Lo que pesa en la portada: destacado ×1,5 y tu selección ×1,2
  function realce(s, x) { return s.dest === x.id ? 1.5 : s.fila.indexOf(x.id) >= 0 ? 1.2 : 1; }
  function agregar(oId, tipo, extra) {
    const s = plataforma();
    if (!s) return 'No tienes plataforma.';
    if (s.cat.length >= s.cap) return 'La biblioteca está llena: compra una bóveda o retira títulos.';
    if (oId && s.cat.some(function (x) { return x.o === oId; })) {
      if (extra && extra.orig) s.cat.forEach(function (x) { if (x.o === oId) x.orig = 1; });
      return 'Ya está en el catálogo.';
    }
    const o = oId ? O.porId(oId) : null;
    s.cat.push(Object.assign({ id: N.sigId(), o: oId || null, nom: o ? o.tit : (extra && extra.nom) || 'Título', tipo: tipo, t0: N.S.t, vs: 0 }, extra || {}));
    return '';
  }
  function retirar(id) { const s = plataforma(); if (!s) return; s.cat = s.cat.filter(function (x) { return x.id !== +id; }); s.fila = s.fila.filter(function (k) { return k !== +id; }); if (s.dest === +id) s.dest = null; }
  function costoBoveda() { return Math.round(tip() * 0.6); }
  function comprarBoveda() {
    const S = N.S, s = plataforma();
    if (!s) return 'No tienes plataforma.';
    if (S.estudios[0].caja < costoBoveda()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', costoBoveda());
    s.bov++; s.cap += 40;
    return '';
  }
  // ---------- Licencias: ofertas del mes, contraofertas y extensiones ----------
  function precioBase(o) { return Math.round(tip() * 0.01 * Math.pow(((o.tv && o.tv.q) || o.pub || 50) / 55, 2) * (1 + Math.min(2, (o.bruto || 0) / tip() * 0.2))); }
  function ofertas() {
    const S = N.S, s = plataforma();
    if (!s) return;
    const ya = s.cat.map(function (x) { return x.o; });
    s.ofLic = S.obras.filter(function (o) { return o.est > 0 && o.et === 'terminada' && o.pub >= 50 && ya.indexOf(o.id) < 0 && S.t - (o.fe || 0) < 52 * 15; })
      .sort(function (a, b) { return N.hash('l' + a.id + S.t) % 97 - N.hash('l' + b.id + S.t) % 97; }).slice(0, 6)
      .map(function (o) { return { o: o.id, nom: o.tit, est: o.est, p: precioBase(o), r: 0 }; });
  }
  function licenciar(i, modoId, precio) {
    const S = N.S, s = plataforma(), of = s ? s.ofLic[+i] : null, m = MODOS.filter(function (x) { return x.id === modoId; })[0];
    if (!of || !m) return 'Esa oferta ya no está.';
    const pedido = Math.round(of.p * m.k);
    const pago = precio ? Math.round(+precio) : pedido;
    if (precio && pago < pedido) {
      // Propuesta de ida y vuelta: aceptan, contraofertan o se retiran
      of.r++;
      if (pago >= pedido * 0.85) { /* aceptan */ }
      else if (pago >= pedido * 0.65 && of.r < 3) { of.p = Math.round(of.p * ((pago / pedido + 1) / 2)); return 'Contraoferta: piden ' + IA.ui.dinero(Math.round(of.p * m.k)) + ' por la licencia ' + m.nombre.toLowerCase() + '.'; }
      else { s.ofLic.splice(+i, 1); return 'Se retiraron de la negociación.'; }
    }
    if (S.estudios[0].caja < pago) return 'No alcanza la caja.';
    const e = agregar(of.o, m.id === 'comprado' ? 'comprado' : 'licencia', { modo: m.id, ex: m.ex, hasta: m.sem ? S.t + m.sem : 0, p: pago, est: of.est });
    if (e) return e;
    IA.negocio.pagar(0, 'derechos', pago);
    IA.negocio.cobrarEn(of.est, 'streaming', pago);
    s.ofLic.splice(+i, 1);
    return '';
  }
  function costoExtension(x) { return Math.round((x.p || tip() * 0.01) * 0.8); }
  function extender(id) {
    const S = N.S, x = porId(id);
    if (!x || !x.hasta) return 'Ese título no tiene contrato que extender.';
    const c = costoExtension(x);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'derechos', c);
    x.hasta += 52;
    return '';
  }
  // ---------- Líneas de suministro y mercado negro ----------
  function contratarLinea(id) {
    const S = N.S, s = plataforma(), p = PROVEEDORES.filter(function (x) { return x.id === id; })[0];
    if (!s || !p) return 'No disponible.';
    if (s.lineas.some(function (l) { return l.id === id && l.hasta > S.t; })) return 'Ya tienes esa línea.';
    s.lineas.push({ id: id, hasta: S.t + 52 });
    return '';
  }
  function cuotaLinea(p) { return Math.round(tip() * p.k / 12); }
  function generoAzar() { return N.elegir(IA.datos.familias).generos[0]; }
  function costoPaquete(id, modoId) { const p = PAQUETES.filter(function (x) { return x.id === id; })[0], m = MODOS.filter(function (x) { return x.id === modoId; })[0] || MODOS[0]; return p ? Math.round(tip() * 0.012 * p.k * p.n * m.k * 0.6) : 0; }
  function comprarPaquete(id, modoId) {
    const S = N.S, s = plataforma(), p = PAQUETES.filter(function (x) { return x.id === id; })[0], m = MODOS.filter(function (x) { return x.id === modoId; })[0] || MODOS[0];
    if (!s || !p) return 'No disponible.';
    if (s.cat.length + p.n > s.cap) return 'No caben en la biblioteca: compra una bóveda.';
    const c = costoPaquete(id, m.id);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'derechos', c);
    for (let k = 0; k < p.n; k++) { const g = generoAzar(); agregar(null, 'licencia', { nom: O.tituloNuevo([g]), gen: g, q: Math.round(N.limitar(p.q + N.normal(0, 4), 30, 95)), ed: p.id === 'estrenos' ? 0.5 : 3, modo: m.id, ex: m.ex, hasta: m.sem ? S.t + m.sem : 0, p: Math.round(c / p.n), paq: p.id }); }
    return '';
  }
  function costoNegro() { return Math.round(tip() * 0.04); }
  function comprarNegro() {
    const S = N.S, s = plataforma();
    if (!s) return 'No tienes plataforma.';
    if (S.estudios[0].caja < costoNegro()) return 'No alcanza la caja.';
    if (s.cat.length + 3 > s.cap) return 'No caben en la biblioteca.';
    IA.negocio.pagar(0, 'derechos', costoNegro());
    for (let k = 0; k < 3; k++) { const g = generoAzar(); agregar(null, 'negro', { nom: O.tituloNuevo([g]) + ' (copia pirata)', gen: g, q: 62 + N.entero(0, 15), ed: 1, hasta: S.t + 26 }); }
    return '';
  }
  // Portada: un destacado y hasta ocho títulos elegidos
  function ponerDestacado(id) { const s = plataforma(); if (!s) return 'No tienes plataforma.'; if (!porId(id)) return 'Ese título ya no está.'; s.dest = +id; return ''; }
  function alternarFila(id) {
    const s = plataforma();
    if (!s || !porId(id)) return 'Ese título ya no está.';
    const k = s.fila.indexOf(+id);
    if (k >= 0) { s.fila.splice(k, 1); return ''; }
    if (s.fila.length >= 8) return 'Tu selección ya tiene ocho títulos.';
    s.fila.push(+id);
    return '';
  }
  function costoRegion(id) { return Math.round(tip() * 4 * (REGIONES[id] || 0.1)); }
  function abrirRegion(id) {
    const S = N.S, s = plataforma();
    if (!s) return 'No tienes plataforma.';
    if (!REGIONES[id] || s.reg.indexOf(id) >= 0) return 'Ya estás en esa región.';
    const c = costoRegion(id);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', c);
    s.reg.push(id);
    N.emit('noticia', { tipo: 'estudio', texto: s.nom + ' llega a ' + IA.datos.region(id).nombre + '.', importante: true });
    return '';
  }
  function parteMercado(s) { return (s.reg || []).reduce(function (a, r) { return a + (REGIONES[r] || 0); }, 0); }
  function costoServidores() { const s = N.S.stream; return Math.round(tip() * 0.5 * (s ? s.srv || 1 : 1)); }
  function mejorarServidores() {
    const S = N.S, s = plataforma();
    if (!s) return 'No tienes plataforma.';
    if (s.srv >= 5) return 'Ya tienes la mejor red.';
    const c = costoServidores();
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', c);
    s.srv++;
    return '';
  }
  function alternarPrueba() { const s = plataforma(); if (s) s.prueba = !s.prueba; }
  function costoCampana() { const s = N.S.stream; return Math.round(tip() * 0.35 * Math.max(0.3, s ? parteMercado(s) : 1)); }
  function campana() {
    const S = N.S, s = plataforma();
    if (!s) return 'No tienes plataforma.';
    if (s.camp && s.camp.hasta > S.t) return 'Ya tienes una campaña en marcha.';
    const c = costoCampana();
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'marketing', c);
    s.camp = { hasta: S.t + 8 };
    return '';
  }
  function precioMedio(s) { return PLANES.reduce(function (sum, p, i) { return sum + s.precios[i] * p.mix; }, 0) / PLANES.reduce(function (sum, p) { return sum + p.k * p.mix; }, 0); }
  function mezcla(s, pt) { const mix = PLANES.map(function (p, i) { return p.mix * Math.pow(pt * p.k / Math.max(0.5, s.precios[i]), 1.5); }), ms = mix.reduce(function (x, y) { return x + y; }, 0) || 1; return mix.map(function (x) { return x / ms; }); }
  function novedad(s) { const n = s.cat.filter(esNuevo).length; return n / Math.max(10, s.cat.length); }
  function abandono(s, pt) {
    const ratio = precioMedio(s) / Math.max(0.5, pt), nv = novedad(s);
    const c = CHURN * Math.pow(ratio, 0.8) * (1 - 0.06 * ((s.srv || 1) - 1)) * (nv < 0.03 ? 1.2 : nv > 0.12 ? 0.88 : 1) * (s.prueba ? 1.15 : 1);
    return N.limitar(c, CHURN * 0.85, 0.08);
  }
  // ---------- Cada semana: suscriptores, ingresos y costos ----------
  function semana() {
    const S = N.S, s = plataforma();
    if (!s) return;
    const a = N.anio(), pt = precioTipico(a);
    if (s.pt0 && Math.abs(pt / s.pt0 - 1) > 0.001) { const k = pt / s.pt0; s.precios = s.precios.map(function (x) { return N.redondear(x * k, 2); }); } // los precios siguen a la inflación
    s.pt0 = pt;
    s.cat = s.cat.filter(function (x) { return !x.hasta || x.hasta > S.t; });
    s.fila = s.fila.filter(function (k) { return !!porId(k); });
    if (s.dest && !porId(s.dest)) s.dest = null;
    const vals = s.cat.map(function (x) { return valorTitulo(x) * realce(s, x); }).sort(function (x, y) { return y - x; });
    let atr = 0;
    vals.forEach(function (v, i) { atr += v * Math.pow(0.97, i); });
    atr *= 0.94 + Math.min(0.16, novedad(s));
    const fp = Math.pow(pt / Math.max(0.5, precioMedio(s)), 1.3);
    const objetivo = mercado(a) * parteMercado(s) * atr * fp / (atr * fp + rivales(a) * 30);
    const camp = s.camp && s.camp.hasta > S.t;
    const ch = abandono(s, pt);
    const nuevos = Math.max(0, objetivo - s.subs) * 0.05 * (camp ? 1.6 : 1) * (s.prueba ? 1.3 : 1) + s.subs * CHURN * Math.min(1, objetivo / Math.max(1, s.subs));
    const bajas = s.subs * ch;
    s.subs = Math.max(0, Math.round(s.subs + nuevos - bajas));
    const mix = mezcla(s, pt);
    let ing = 0;
    PLANES.forEach(function (p, i) { ing += s.subs * mix[i] * s.precios[i] * 12 / 52; });
    ing += s.subs * mix[0] * pt * 0.25 * 12 / 52; // anuncios del plan barato
    if (s.prueba) ing *= 0.93; // el mes gratis de los recién llegados
    const servidores = s.subs * pt * 0.12 * 12 / 52 * (1 - IA.imperio.ahorroServidores()) * (1 + 0.15 * ((s.srv || 1) - 1)), almac = s.cat.length * tip() * 0.0002;
    let lineas = 0;
    s.lineas = s.lineas.filter(function (l) { return l.hasta > S.t; });
    if (N.mes(S.t) !== N.mes(S.t - 1)) {
      s.lineas.forEach(function (l) {
        const p = PROVEEDORES.filter(function (x) { return x.id === l.id; })[0];
        lineas += cuotaLinea(p);
        for (let k = 0; k < p.n && s.cat.length < s.cap; k++) { const g = generoAzar(); agregar(null, 'linea', { nom: p.nom + ': ' + O.tituloNuevo([g]), gen: g, prov: p.id, q: 50 + N.entero(0, 12), v: p.v / 0.6, ed: 2, hasta: S.t + 52 }); }
      });
      ofertas();
      // Mercado negro: puede llegar la demanda
      const negros = s.cat.filter(function (x) { return x.tipo === 'negro'; });
      if (negros.length && N.probabilidad(0.12)) {
        const multa = Math.round(tip() * 0.25);
        IA.negocio.pagar(0, 'multas', multa);
        S.estudios[0].fama = N.redondear(Math.max(0.01, S.estudios[0].fama - 0.01), 3);
        s.cat = s.cat.filter(function (x) { return x.tipo !== 'negro'; });
        N.emit('noticia', { tipo: 'estudio', texto: 'Demanda contra ' + s.nom + ' por contenido pirata: multa y títulos retirados.', importante: true });
      }
    }
    // Horas vistas: se reparten por atractivo, portada, novedad y originales
    const horas = s.subs * HORAS / 1e6;
    const pesos = s.cat.map(function (x) { return valorTitulo(x) * realce(s, x) * (s.dest === x.id ? 2 : 1) * (esNuevo(x) ? 1.5 : 1); });
    const sp = pesos.reduce(function (p, v) { return p + v; }, 0) || 1;
    const sem = s.cat.map(function (x, i) { const v = horas * pesos[i] / sp; x.vs = N.redondear((x.vs || 0) + v, 3); return { id: x.id, nom: x.nom, v: N.redondear(v, 3) }; }).sort(function (p, q) { return q.v - p.v; });
    ing = Math.round(ing);
    const gas = Math.round(servidores + almac + lineas);
    IA.negocio.cobrarEn(0, 'streaming', ing);
    IA.negocio.pagar(0, 'emision', gas);
    s.ult = { top: sem.slice(0, 10), nuevos: Math.round(nuevos), bajas: Math.round(bajas), churn: N.redondear(ch, 4), obj: Math.round(objetivo), horas: N.redondear(horas, 2), mix: mix.map(function (x) { return N.redondear(x, 3); }) };
    s.hist.push({ t: S.t, subs: s.subs, ing: ing, gas: gas, nv: Math.round(nuevos), bj: Math.round(bajas) });
    if (s.hist.length > 104) s.hist.shift();
  }
  function resumen() {
    const s = plataforma();
    if (!s) return null;
    const h = s.hist[s.hist.length - 1] || { ing: 0, gas: 0 }, u = s.ult || {};
    const arpu = s.subs ? h.ing * 52 / 12 / s.subs : 0, churnMes = 1 - Math.pow(1 - (u.churn || CHURN), 4.33);
    return { subs: s.subs, ing: h.ing, gas: h.gas, cat: s.cat.length, cap: s.cap, propios: s.cat.filter(function (x) { return x.tipo === 'propio'; }).length, originales: s.cat.filter(function (x) { return x.orig; }).length,
      nuevos: u.nuevos || 0, bajas: u.bajas || 0, churnMes: churnMes, arpu: arpu, ltv: churnMes > 0 ? arpu / churnMes : 0, obj: u.obj || 0, parte: parteMercado(s), novedad: novedad(s) };
  }
  return { ANIO: ANIO, PLANES: PLANES, MODOS: MODOS, PROVEEDORES: PROVEEDORES, PAQUETES: PAQUETES, REGIONES: REGIONES, precioTipico: precioTipico, puede: puede, costoLanzar: costoLanzar, lanzar: lanzar, plataforma: plataforma, asegurar: asegurar,
    ponerPrecio: ponerPrecio, porId: porId, obraDe: obraDe, calidad: calidad, generoDe: generoDe, famDe: famDe, esNuevo: esNuevo, valorTitulo: valorTitulo, agregar: agregar, retirar: retirar, costoBoveda: costoBoveda, comprarBoveda: comprarBoveda, ofertas: ofertas,
    licenciar: licenciar, costoExtension: costoExtension, extender: extender, contratarLinea: contratarLinea, cuotaLinea: cuotaLinea, costoPaquete: costoPaquete, comprarPaquete: comprarPaquete, costoNegro: costoNegro,
    comprarNegro: comprarNegro, ponerDestacado: ponerDestacado, alternarFila: alternarFila, costoRegion: costoRegion, abrirRegion: abrirRegion, parteMercado: parteMercado, costoServidores: costoServidores, mejorarServidores: mejorarServidores,
    alternarPrueba: alternarPrueba, costoCampana: costoCampana, campana: campana, mezcla: mezcla, precioMedio: precioMedio, abandono: abandono, novedad: novedad, semana: semana, resumen: resumen };
})();
