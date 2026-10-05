/* ==== módulo: premios ==== */
// Premios Quimera básicos: cada año (semana 10) miran las películas estrenadas el año anterior por todos los
// estudios, con nominados reales (nunca de relleno, fallo 17 de la V15). La V22 trae jurados, festivales,
// categorías por cargo, subastas y ceremonias animadas.
IA.premios = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, T = IA.talentos;

  function candidatas(anio) {
    return N.S.obras.filter(function (o) { return o.anio === anio && (o.et === 'terminada' || o.et === 'cartelera') && o.crit; });
  }
  let gustoJurado = null;
  function puntaje(cat, o) {
    const jur = N.normal(0, 5) + (gustoJurado === o.fam ? 5 : 0);
    if (cat === 'pelicula') return o.crit * 0.75 + o.pub * 0.25 + jur;
    if (cat === 'direccion') return o.crit * 0.8 + (o._dir || 50) * 0.2 + jur;
    if (cat === 'guion') return o.crit * 0.8 + (o._gui || 50) * 0.2 + jur;
    return o.crit * 0.5 + (o._int || 50) * 0.5 + jur;
  }
  function ceremonia() {
    const S = N.S, anio = N.anio() - 1;
    const lista = candidatas(anio);
    if (lista.length < 3) return null;
    lista.forEach(function (o) {
      const d = o.eq && T.porId(o.eq.direccion), g = o.eq && T.porId(o.eq.guion);
      o._dir = d ? d.hab : 50; o._gui = g ? g.hab : 50;
    });
    // Cada año el jurado tiene su gusto: una familia de géneros le pesa más
    gustoJurado = N.elegir(D.ORDEN_FAM);
    const res = { anio: anio, categorias: [], gusto: gustoJurado };
    D.premios.categorias.forEach(function (c) {
      let pool = lista;
      let quien = null;
      if (c.id === 'actriz' || c.id === 'actor') {
        const sx = c.id === 'actriz' ? 'F' : 'M';
        pool = [];
        lista.forEach(function (o) {
          const sxs = (o.cr && o.cr.sx) || [];
          for (let k = 0; k < sxs.length; k++) if (sxs[k] === sx) {
            const id = o.eq ? o.eq.int[k] : null;
            const t = id ? T.porId(id) : null;
            pool.push({ o: o, k: k, nombre: o.cr.reparto[k], t: t });
            break;
          }
        });
        pool.forEach(function (p) { p.o._int = p.t ? p.t.hab : 50; p.s = puntaje(c.id, p.o); });
      } else {
        pool = lista.map(function (o) { return { o: o, s: puntaje(c.id, o) }; });
      }
      pool.sort(function (a, b) { return b.s - a.s; });
      const nominados = pool.slice(0, 5);
      if (!nominados.length) return;
      const g = nominados[0];
      quien = g.nombre || (c.id === 'direccion' ? g.o.cr.direccion : c.id === 'guion' ? g.o.cr.guion : '');
      g.o.aw = g.o.aw || [];
      g.o.aw.push(c.id);
      nominados.forEach(function (n) { n.o.nom = (n.o.nom || 0) + 1; });
      const est = S.estudios[g.o.est];
      est.fama = N.redondear(N.limitar(est.fama + (c.id === 'pelicula' ? 0.05 : 0.02), 0, 1), 3);
      // El talento premiado gana fama
      let idT = null;
      if (g.o.eq) idT = c.id === 'direccion' ? g.o.eq.direccion : c.id === 'guion' ? g.o.eq.guion : g.k !== undefined ? g.o.eq.int[g.k] : null;
      const t = idT !== null ? T.porId(idT) : null;
      if (t) { t.fama = N.redondear(N.limitar(t.fama + 0.12, 0, 1), 3); t.premios++; }
      res.categorias.push({
        id: c.id, nombre: c.nombre, ganador: { obra: g.o.id, titulo: g.o.tit, est: g.o.est, quien: quien },
        nominados: nominados.map(function (n) { return { obra: n.o.id, titulo: n.o.tit, est: n.o.est, quien: n.nombre || '' }; }),
      });
    });
    lista.forEach(function (o) { delete o._dir; delete o._gui; delete o._int; });
    S.premios.push(res);
    if (S.premios.length > 400) S.premios.shift();
    N.emit('premios', res);
    return res;
  }
  function semana() {
    if (N.semana() === D.premios.semana) return ceremonia();
    return null;
  }
  // Parte de los premios principales que ganó el jugador (meta: 30 % o menos)
  function parteJugador(desdeAnio) {
    let total = 0, jug = 0;
    N.S.premios.forEach(function (r) {
      if (desdeAnio && r.anio < desdeAnio) return;
      r.categorias.forEach(function (c) { total++; if (c.ganador.est === 0) jug++; });
    });
    return { total: total, jugador: jug, parte: total ? jug / total : 0 };
  }

  return { ceremonia: ceremonia, semana: semana, parteJugador: parteJugador };
})();
