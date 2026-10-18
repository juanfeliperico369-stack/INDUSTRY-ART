/* ==== módulo: prensa ==== */
// Convenciones (cultura pop desde 1970; antes, exposiciones universales) con salas por familia y tres
// acciones por convención; rueda de prensa con promesas que castigan si la obra no cumple; ánimo de los fans;
// paquetes de prensa (portada); radar de redes (desde 1995; antes, columnas de chismes); rivales que mueven fechas.
IA.prensa = (function () {
  'use strict';
  const N = IA.n, O = IA.obras, D = IA.datos;
  const tip = function () { return IA.economia.presupuestoTipico(N.anio()); };
  const ACCIONES = [
    { id: 'panel', nombre: 'Panel con adelanto', des: 3, con: 0.02, texto: 'Muestras escenas: +3 a la expectativa.' },
    { id: 'reparto', nombre: 'Anuncio de reparto', des: 1, con: 0.04, texto: 'Presentas a tus estrellas: más gente se entera.' },
    { id: 'entrevista', nombre: 'Entrevista exclusiva', des: 1, con: 0.02, texto: 'Sin riesgos: un poco de todo.' },
    { id: 'rueda', nombre: 'Rueda de prensa', des: 0, con: 0.03, texto: 'Eliges una promesa: sube mucho la expectativa, pero si la obra no cumple el golpe es mayor.' },
  ];
  const PROMESAS = [
    { id: 'mejor', t: '«Será la mejor del año»', des: 6, min: 80 }, { id: 'rie', t: '«Nadie va a parar de reír»', des: 4, min: 70 },
    { id: 'distinta', t: '«Nunca vieron algo así»', des: 5, min: 75 }, { id: 'honesta', t: '«Es una obra honesta, nada más»', des: 1, min: 50 },
  ];
  // Convención de esta semana (del circuito o, antes de 1970, una exposición universal)
  function convencionActual() {
    const y = N.anio(), sem = N.semana(), rg = IA.cal.rangoSemana(y, sem);
    return IA.cal.circuitoAnio(y).filter(function (x) { return (x.tipo === 'convencion' || x.tipo === 'expo') && x.ini <= rg[1] && x.fin >= rg[0]; })[0] || null;
  }
  // Obras que pueden ir: en desarrollo, en cartelera o estrenadas hace menos de 12 meses
  function elegibles() {
    const S = N.S;
    return S.obras.filter(function (o) { return o.est === 0 && (['desarrollo', 'preproduccion', 'rodaje', 'posproduccion', 'lista', 'cartelera'].indexOf(o.et) >= 0 || (o.et === 'terminada' && o.fe > S.t - 52)); });
  }
  function estado() { const S = N.S, c = convencionActual(); if (!c) return null; const k = c.id + '|' + N.anio(); if (!S.conv || S.conv.k !== k) S.conv = { k: k, usadas: 0 }; return S.conv; }
  // Ánimo de los fans en la sala de la familia de la obra (lectura del público)
  function animo(o) {
    const q = o.prueba ? o.prueba.p : o.pub !== undefined ? o.pub : 60;
    return Math.round(N.limitar(q * 0.6 + 30 * ((N.S.mundo.tendencias[o.fam] || 0) + 0.5) + Math.min(10, (N.S.fans || 0) / 200000), 5, 99));
  }
  function actuar(obraId, accion, promesa) {
    const st = estado(), o = O.porId(obraId), a = ACCIONES.filter(function (x) { return x.id === accion; })[0];
    if (!st) return 'No hay convención esta semana.';
    if (st.usadas >= 3) return 'Ya usaste tus tres acciones en esta convención.';
    if (!o || elegibles().indexOf(o) < 0 || !a) return 'Esa obra no puede ir.';
    o.ddes = (o.ddes || 0) + a.des;
    o.dcon = Math.min(0.12, (o.dcon || 0) + a.con);
    if (a.id === 'rueda') {
      const p = PROMESAS.filter(function (x) { return x.id === promesa; })[0] || PROMESAS[3];
      o.ddes += p.des;
      o.promesa = { min: p.min, des: p.des, t: p.t };
    }
    st.usadas++;
    N.S.fans = Math.round((N.S.fans || 0) * 1.002 + 50);
    return '';
  }
  // Al estrenar: una promesa incumplida golpea más (pierde boca a boca y algo de fama)
  function alEstrenar(o) {
    if (!o.promesa || o.pub === undefined) return;
    if (o.pub < o.promesa.min) {
      o.u = N.redondear((o.u || 0) - 0.08 * o.promesa.des, 4);
      const est = N.S.estudios[o.est];
      est.fama = N.redondear(Math.max(0.01, est.fama - 0.004 * o.promesa.des), 3);
      N.emit('noticia', { tipo: 'estudio', texto: 'La prensa recuerda tu promesa ' + o.promesa.t + ': «' + o.tit + '» no la cumple.', importante: true });
    }
    delete o.promesa;
  }
  // Paquete de prensa: portada en la revista de la industria
  function costoPortada() { return Math.round(tip() * 0.02); }
  function portada(obraId) {
    const o = O.porId(obraId);
    if (!o || o.est !== 0 || ['terminada'].indexOf(o.et) >= 0) return 'Solo obras que aún no terminan.';
    if (o.portada) return 'Ya tuvo portada.';
    if (N.S.estudios[0].caja < costoPortada()) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'marketing', costoPortada());
    o.portada = 1; o.dcon = Math.min(0.12, (o.dcon || 0) + 0.03);
    return '';
  }
  // Radar de redes (o columna de chismes antes de internet): se arma con el estado del mundo
  function radar() {
    const S = N.S, out = [], red = N.anio() >= 1995;
    S.obras.forEach(function (o) {
      if (o.est === 0) { if (o.prog && o.et === 'lista') out.push({ tipo: 'propio', txt: 'Tu adelanto de «' + o.tit + '» da que hablar.' }); return; }
      if (o.prog && o.et === 'lista' && o.fe - S.t <= 8) out.push({ tipo: 'anuncio', txt: S.estudios[o.est].nombre + ' anuncia «' + o.tit + '» para ' + IA.cal.texto(IA.cal.viernesDeT(o.fe)) + '.' });
      else if (o.et === 'rodaje' && N.hash('r' + o.id) % 5 === 0) out.push({ tipo: 'rumor', txt: (red ? 'Filtración: ' : 'Se rumorea que ') + S.estudios[o.est].nombre + ' rueda algo de ' + o.gen[0].toLowerCase() + '.' });
    });
    const t = D.familias.slice().sort(function (a, b) { return (S.mundo.tendencias[b.id] || 0) - (S.mundo.tendencias[a.id] || 0); })[0];
    out.push({ tipo: 'tendencia', txt: (red ? 'Tendencia: ' : 'En los cafés se habla de ') + t.nombre.toLowerCase() + '.' });
    return { medio: N.anio() >= 2006 ? 'Redes sociales' : red ? 'Foros y portales' : N.anio() >= 1922 ? 'Columna de chismes y radio' : 'Columna de chismes', items: out.slice(0, 15) };
  }
  // Rivales que mueven fechas: si su semana queda saturada, a veces corren el estreno (una sola vez)
  function semana() {
    const S = N.S;
    S.obras.forEach(function (o) {
      if (o.est === 0 || !o.prog || o.et !== 'lista' || o.movida || o.fe - S.t < 3 || o.fe - S.t > 10) return;
      if (IA.lanzamiento.competenciaPrevista(o.fe, o.id) >= 2.5 && N.probabilidad(0.3)) {
        const d = N.probabilidad(0.5) ? 2 : -1;
        o.fe = Math.max(S.t + 2, o.fe + d); o.movida = 1;
        if (S.obras.some(function (x) { return x.est === 0 && x.prog && Math.abs(x.fe - o.fe) <= 2; })) N.emit('noticia', { tipo: 'rival', texto: S.estudios[o.est].nombre + ' mueve el estreno de «' + o.tit + '».' });
      }
    });
  }
  return { ACCIONES: ACCIONES, PROMESAS: PROMESAS, convencionActual: convencionActual, elegibles: elegibles, estado: estado, animo: animo, actuar: actuar,
    alEstrenar: alEstrenar, costoPortada: costoPortada, portada: portada, radar: radar, semana: semana };
})();
