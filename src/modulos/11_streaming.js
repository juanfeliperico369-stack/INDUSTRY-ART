/* ==== módulo: streaming ==== */
// V23 · Plataforma propia (desde 2007) con tres planes (con anuncios, estándar y premium), suscriptores, costo de
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
    { id: 'doc', nom: 'Documentales del Sur', n: 2, v: 0.45, k: 0.03 }, { id: 'anim', nom: 'Estudio Kumo', n: 3, v: 0.6, k: 0.06 },
    { id: 'clas', nom: 'Archivo Dorado', n: 4, v: 0.5, k: 0.05 }, { id: 'telen', nom: 'Novelas del Caribe', n: 2, v: 0.55, k: 0.04 },
  ];
  function precioTipico(anio) { return IA.mundo.aEpoca(11, anio); } // al mes, plan estándar
  function mercado(anio) { return N.interp([[2007, 1], [2012, 30], [2016, 110], [2020, 350], [2025, 550], [2150, 1100]], anio) * 1e6; }
  function rivales(anio) { return N.interp([[2007, 6], [2015, 40], [2020, 90], [2030, 110], [2150, 150]], anio); }
  function puede() { return N.anio() >= ANIO; }
  function costoLanzar() { return Math.round(tip() * 5); }
  function lanzar(nom) {
    const S = N.S;
    if (S.stream) return 'Ya tienes plataforma.';
    if (!puede()) return 'El streaming llega en ' + ANIO + '.';
    if (S.estudios[0].caja < costoLanzar()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', costoLanzar());
    const p = precioTipico(N.anio());
    S.stream = { nom: (nom || S.estudios[0].nombre + '+').slice(0, 30), t0: S.t, precios: PLANES.map(function (x) { return N.redondear(p * x.k, 2); }), subs: 0, cat: [], cap: 40, bov: 0, lineas: [], ofLic: [], hist: [], negro: 0 };
    S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada'; }).sort(function (a, b) { return (b.pub || 0) - (a.pub || 0); }).slice(0, 20).forEach(function (o) { agregar(o.id, 'propio'); });
    ofertas();
    return '';
  }
  function ponerPrecio(i, v) { const s = N.S.stream; if (s) s.precios[+i] = N.redondear(N.limitar(+v || 0, 0.5, precioTipico(N.anio()) * 4), 2); }
  // Valor de un título para atraer suscriptores: calidad, novedad, series y exclusiva
  function valorTitulo(x) {
    const o = x.o ? O.porId(x.o) : null;
    const q = o ? (o.tv && o.tv.q) || o.pub || 50 : x.q || 50;
    const ed = o && o.fe !== undefined ? Math.max(0, N.S.t - o.fe) / 52 : x.ed || 5;
    return N.redondear(Math.pow(q / 55, 2) * (0.4 + 0.6 * Math.exp(-ed / 6)) * (o && o.tv ? 1.4 : 1) * (x.ex ? 1.25 : 1) * (x.v || 1), 3);
  }
  function agregar(oId, tipo, extra) {
    const s = N.S.stream;
    if (!s) return 'No tienes plataforma.';
    if (s.cat.length >= s.cap) return 'La biblioteca está llena: compra una bóveda o retira títulos.';
    if (oId && s.cat.some(function (x) { return x.o === oId; })) return 'Ya está en el catálogo.';
    const o = oId ? O.porId(oId) : null;
    s.cat.push(Object.assign({ id: N.sigId(), o: oId || null, nom: o ? o.tit : (extra && extra.nom) || 'Título', tipo: tipo }, extra || {}));
    return '';
  }
  function retirar(id) { const s = N.S.stream; if (s) s.cat = s.cat.filter(function (x) { return x.id !== +id; }); }
  function costoBoveda() { return Math.round(tip() * 0.6); }
  function comprarBoveda() {
    const S = N.S, s = S.stream;
    if (!s) return 'No tienes plataforma.';
    if (S.estudios[0].caja < costoBoveda()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'construccion', costoBoveda());
    s.bov++; s.cap += 40;
    return '';
  }
  // ---------- Licencias: ofertas del mes, contraofertas y extensiones ----------
  function precioBase(o) { return Math.round(tip() * 0.01 * Math.pow(((o.tv && o.tv.q) || o.pub || 50) / 55, 2) * (1 + Math.min(2, (o.bruto || 0) / tip() * 0.2))); }
  function ofertas() {
    const S = N.S, s = S.stream;
    if (!s) return;
    const ya = s.cat.map(function (x) { return x.o; });
    s.ofLic = S.obras.filter(function (o) { return o.est > 0 && o.et === 'terminada' && o.pub >= 50 && ya.indexOf(o.id) < 0 && S.t - (o.fe || 0) < 52 * 15; })
      .sort(function (a, b) { return N.hash('l' + a.id + S.t) % 97 - N.hash('l' + b.id + S.t) % 97; }).slice(0, 5)
      .map(function (o) { return { o: o.id, nom: o.tit, est: o.est, p: precioBase(o), r: 0 }; });
  }
  function licenciar(i, modoId, precio) {
    const S = N.S, s = S.stream, of = s ? s.ofLic[+i] : null, m = MODOS.filter(function (x) { return x.id === modoId; })[0];
    if (!of || !m) return 'Esa oferta ya no está.';
    const pedido = Math.round(of.p * m.k);
    const pago = precio ? Math.round(+precio) : pedido;
    if (precio && pago < pedido) {
      // Propuesta de ida y vuelta: aceptan, contraofertan o se retiran
      of.r++;
      if (pago >= pedido * 0.85) { /* aceptan */ }
      else if (pago >= pedido * 0.65 && of.r < 3) { of.p = Math.round(of.p * ((pago / pedido + 1) / 2)); return 'Contraoferta: piden ' + Math.round(of.p * m.k) + ' por la licencia ' + m.nombre.toLowerCase() + '.'; }
      else { s.ofLic.splice(+i, 1); return 'Se retiraron de la negociación.'; }
    }
    if (S.estudios[0].caja < pago) return 'No alcanza la caja.';
    const e = agregar(of.o, m.id === 'comprado' ? 'comprado' : 'licencia', { modo: m.id, ex: m.ex, hasta: m.sem ? S.t + m.sem : 0, p: of.p, est: of.est });
    if (e) return e;
    IA.negocio.pagar(0, 'derechos', pago);
    IA.negocio.cobrarEn(of.est, 'streaming', pago);
    s.ofLic.splice(+i, 1);
    return '';
  }
  function costoExtension(x) { return Math.round((x.p || tip() * 0.01) * 0.8); }
  function extender(id) {
    const S = N.S, s = S.stream, x = s ? s.cat.filter(function (c) { return c.id === +id; })[0] : null;
    if (!x || !x.hasta) return 'Ese título no tiene contrato que extender.';
    const c = costoExtension(x);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'derechos', c);
    x.hasta += 52;
    return '';
  }
  // ---------- Líneas de suministro y mercado negro ----------
  function contratarLinea(id) {
    const S = N.S, s = S.stream, p = PROVEEDORES.filter(function (x) { return x.id === id; })[0];
    if (!s || !p) return 'No disponible.';
    if (s.lineas.some(function (l) { return l.id === id && l.hasta > S.t; })) return 'Ya tienes esa línea.';
    s.lineas.push({ id: id, hasta: S.t + 52 });
    return '';
  }
  function cuotaLinea(p) { return Math.round(tip() * p.k / 12); }
  function costoNegro() { return Math.round(tip() * 0.04); }
  function comprarNegro() {
    const S = N.S, s = S.stream;
    if (!s) return 'No tienes plataforma.';
    if (S.estudios[0].caja < costoNegro()) return 'No alcanza la caja.';
    if (s.cat.length + 3 > s.cap) return 'No caben en la biblioteca.';
    IA.negocio.pagar(0, 'derechos', costoNegro());
    for (let k = 0; k < 3; k++) agregar(null, 'negro', { nom: O.tituloNuevo([N.elegir(IA.datos.familias).generos[0]]) + ' (copia pirata)', q: 62 + N.entero(0, 15), ed: 1, hasta: S.t + 26 });
    return '';
  }
  // ---------- Cada semana: suscriptores, ingresos y costos ----------
  function semana() {
    const S = N.S, s = S.stream;
    if (!s) return;
    const a = N.anio(), pt = precioTipico(a);
    s.cat = s.cat.filter(function (x) { return !x.hasta || x.hasta > S.t; });
    const vals = s.cat.map(valorTitulo).sort(function (x, y) { return y - x; });
    let atr = 0;
    vals.forEach(function (v, i) { atr += v * Math.pow(0.97, i); });
    const prom = PLANES.reduce(function (sum, p, i) { return sum + s.precios[i] * p.mix; }, 0) / PLANES.reduce(function (sum, p) { return sum + p.k * p.mix; }, 0);
    const fp = Math.pow(pt / Math.max(0.5, prom), 1.3);
    const objetivo = mercado(a) * atr * fp / (atr * fp + rivales(a) * 30);
    s.subs = Math.max(0, Math.round(s.subs + (objetivo - s.subs) * 0.05));
    const mix = PLANES.map(function (p, i) { return p.mix * Math.pow(pt * p.k / Math.max(0.5, s.precios[i]), 1.5); }), ms = mix.reduce(function (x, y) { return x + y; }, 0) || 1;
    let ing = 0;
    PLANES.forEach(function (p, i) { ing += s.subs * mix[i] / ms * s.precios[i] * 12 / 52; });
    ing += s.subs * mix[0] / ms * pt * 0.25 * 12 / 52; // anuncios del plan barato
    const servidores = s.subs * pt * 0.12 * 12 / 52, almac = s.cat.length * tip() * 0.0002;
    let lineas = 0;
    s.lineas = s.lineas.filter(function (l) { return l.hasta > S.t; });
    if (N.mes(S.t) !== N.mes(S.t - 1)) {
      s.lineas.forEach(function (l) {
        const p = PROVEEDORES.filter(function (x) { return x.id === l.id; })[0];
        lineas += cuotaLinea(p);
        for (let k = 0; k < p.n && s.cat.length < s.cap; k++) agregar(null, 'linea', { nom: p.nom + ': ' + O.tituloNuevo([N.elegir(IA.datos.familias).generos[0]]), q: 50 + N.entero(0, 12), v: p.v / 0.6, ed: 2, hasta: S.t + 52 });
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
    ing = Math.round(ing);
    const gas = Math.round(servidores + almac + lineas);
    IA.negocio.cobrarEn(0, 'streaming', ing);
    IA.negocio.pagar(0, 'emision', gas);
    s.hist.push({ t: S.t, subs: s.subs, ing: ing, gas: gas });
    if (s.hist.length > 104) s.hist.shift();
  }
  function resumen() {
    const s = N.S.stream;
    if (!s) return null;
    const h = s.hist[s.hist.length - 1] || { ing: 0, gas: 0 };
    return { subs: s.subs, ing: h.ing, gas: h.gas, cat: s.cat.length, cap: s.cap, propios: s.cat.filter(function (x) { return x.tipo === 'propio'; }).length };
  }
  return { ANIO: ANIO, PLANES: PLANES, MODOS: MODOS, PROVEEDORES: PROVEEDORES, precioTipico: precioTipico, puede: puede, costoLanzar: costoLanzar, lanzar: lanzar,
    ponerPrecio: ponerPrecio, valorTitulo: valorTitulo, agregar: agregar, retirar: retirar, costoBoveda: costoBoveda, comprarBoveda: comprarBoveda, ofertas: ofertas,
    licenciar: licenciar, costoExtension: costoExtension, extender: extender, contratarLinea: contratarLinea, cuotaLinea: cuotaLinea, costoNegro: costoNegro,
    comprarNegro: comprarNegro, semana: semana, resumen: resumen };
})();
