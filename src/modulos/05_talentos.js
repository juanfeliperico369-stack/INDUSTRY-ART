/* ==== módulo: talentos ==== */
// Talentos inventados con edad, habilidad, potencial, fama y rasgo. La tarifa sale del mercado (economia.tarifa).
// Quienes no trabajan se actualizan una vez al año ("talentos dormidos"): 300 años de partida no vuelven lento
// el juego. La V18 amplía a más de 1.000 talentos con biografía, química y academia.
IA.talentos = (function () {
  'use strict';
  const N = IA.n, D = IA.datos;
  const PESO_REGION = { nam: 0.28, eur: 0.25, asi: 0.2, lat: 0.14, afr: 0.08, oce: 0.05 };
  let indice = null; // id -> talento (se reconstruye al cargar)

  function reindexar() {
    indice = {};
    N.S.talentos.forEach(function (t) { indice[t.id] = t; });
  }
  function porId(id) {
    if (id === undefined || id === null) return null;
    if (!indice) reindexar();
    return indice[id] || null;
  }
  function elegirRegion() {
    const ids = Object.keys(PESO_REGION);
    return ids[N.ponderado(ids.map(function (k) { return PESO_REGION[k]; }))];
  }
  function elegirPais(reg) {
    const ps = D.paises.filter(function (p) { return p.region === reg; });
    return ps[N.ponderado(ps.map(function (p) { return p.peso; }))].id;
  }
  function nombreNuevo(reg, sx) {
    const L = D.nombres[reg];
    return N.elegir(sx === 'F' ? L.f : L.m) + ' ' + N.elegir(L.a);
  }
  function edadPico(of) { return of === 'interprete' ? 35 : 40; }
  function edadDeclive(of) { return of === 'interprete' ? 55 : 66; }
  function habilidadPorEdad(pot, edad, of) {
    if (edad < edadPico(of)) return pot * (0.6 + 0.4 * N.limitar((edad - 18) / (edadPico(of) - 18), 0, 1));
    if (edad > edadDeclive(of)) return pot - (edad - edadDeclive(of)) * 0.8;
    return pot;
  }
  // Crea un talento; anio es el año actual del juego
  function crear(of, edad, anio) {
    const reg = elegirRegion();
    const sx = N.probabilidad(0.5) ? 'F' : 'M';
    const pot = Math.round(N.limitar(N.normal(60, 13), 20, 99));
    const hab = Math.round(N.limitar(habilidadPorEdad(pot, edad, of) + N.normal(0, 3), 10, 99));
    const famaBase = Math.pow(N.limitar((hab - 38) / 60, 0, 1), 2) * (edad > 25 ? 1 : 0.5) * (0.3 + N.azar() * 0.9) * (of === 'interprete' ? 1.2 : 0.9);
    const rasgos = Object.keys(D.rasgos);
    const t = {
      id: N.sigId(), nom: nombreNuevo(reg, sx), sx: sx, nac: anio - edad, of: of, hab: hab, pot: pot,
      fama: N.redondear(N.limitar(famaBase, 0, 1), 3), reg: reg, pais: elegirPais(reg),
      rasgo: N.probabilidad(0.55) ? N.elegir(rasgos) : '', ocup: -1, obras: 0, exitos: 0, premios: 0, ret: 0,
    };
    return t;
  }
  function generarInicial() {
    const S = N.S, anio = N.anio();
    S.talentos = [];
    Object.keys(D.poblacionTalentos).forEach(function (of) {
      const n = D.poblacionTalentos[of];
      for (let i = 0; i < n; i++) {
        const edad = Math.round(N.limitar(18 + Math.pow(N.azar(), 1.3) * 52, 18, 72));
        S.talentos.push(crear(of, edad, anio));
      }
    });
    reindexar();
  }
  function edad(t) { return N.anio() - t.nac; }
  function disponible(t) { return t && !t.ret && t.ocup < N.S.t; }
  function tarifa(t) { return IA.economia.tarifa(t, N.anio()); }
  function activos(of) {
    return N.S.talentos.filter(function (t) { return !t.ret && (!of || t.of === of); });
  }
  function disponibles(of) {
    return N.S.talentos.filter(function (t) { return !t.ret && t.of === of && t.ocup < N.S.t; });
  }
  // Mejor talento disponible que cabe en un tope de tarifa (para "recomendado", rivales y bot)
  // azar: si es mayor que 1, elige al azar entre los mejores "azar" candidatos (así los rivales no se llevan
  // siempre a los mismos)
  function mejorDisponible(of, tope, excluir, sexo, azar) {
    const anio = N.anio();
    const lista = N.S.talentos;
    const top = [];
    const k = azar && azar > 1 ? azar : 1;
    for (let i = 0; i < lista.length; i++) {
      const t = lista[i];
      if (t.ret || t.of !== of || t.ocup >= N.S.t) continue;
      if (excluir && excluir.indexOf(t.id) >= 0) continue;
      if (sexo && t.sx !== sexo) continue;
      const f = IA.economia.tarifa(t, anio);
      if (f > tope) continue;
      const valor = t.hab + t.fama * 12;
      if (top.length < k || valor > top[top.length - 1].v) {
        top.push({ t: t, v: valor });
        top.sort(function (a, b) { return b.v - a.v; });
        if (top.length > k) top.pop();
      }
    }
    if (!top.length) return null;
    return k > 1 ? top[Math.floor(N.azar() * top.length)].t : top[0].t;
  }
  function ocupar(ids, hasta) {
    ids.forEach(function (id) { const t = porId(id); if (t) { t.ocup = Math.max(t.ocup, hasta); t.obras++; } });
  }
  function liberar(ids) {
    ids.forEach(function (id) { const t = porId(id); if (t && t.ocup > N.S.t) t.ocup = N.S.t - 1; });
  }
  // Después de un estreno: la fama sube con los éxitos (y las estrellas cobran más), baja con los fracasos
  function trasEstreno(obra, rendimiento) {
    const ids = [obra.eq.direccion, obra.eq.guion].concat(obra.eq.int);
    ids.forEach(function (id, k) {
      const t = porId(id);
      if (!t) return;
      const peso = k >= 2 ? 1 : 0.7;
      const cambio = N.limitar(0.05 * Math.log(Math.max(0.2, rendimiento)) + (obra.crit - 60) / 800, -0.06, 0.12) * peso;
      t.fama = N.redondear(N.limitar(t.fama + cambio, 0, 1), 3);
      if (rendimiento >= 2) t.exitos++;
      t.hab = Math.min(t.pot + 3, t.hab + 0.5);
    });
  }
  // Una vez al año: edades, crecimiento, retiro (entre 70 y 100; pueden volver en la V18) y nuevas generaciones
  function anual() {
    const S = N.S, anio = N.anio();
    const conteo = {};
    for (let i = 0; i < S.talentos.length; i++) {
      const t = S.talentos[i];
      if (t.ret) continue;
      const e = anio - t.nac;
      const objetivo = habilidadPorEdad(t.pot, e, t.of);
      t.hab = Math.round(N.limitar(t.hab + (objetivo - t.hab) * 0.3 + N.normal(0, 1), 5, 99) * 10) / 10;
      t.fama = N.redondear(t.fama * (t.ocup >= S.t - 52 ? 0.98 : 0.94), 3);
      const pRetiro = e < 70 ? 0 : (e - 68) / 32;
      const pMuerte = 0.0015 + (e > 70 ? (e - 70) * 0.003 : 0);
      if (e >= 100 || N.probabilidad(pRetiro) || N.probabilidad(pMuerte)) {
        t.ret = anio;
        if (t.fama > 0.35) N.emit('noticia', { tipo: 'talento', texto: t.nom + ' se retira a los ' + e + ' años.' });
        continue;
      }
      conteo[t.of] = (conteo[t.of] || 0) + 1;
    }
    Object.keys(D.poblacionTalentos).forEach(function (of) {
      const falta = D.poblacionTalentos[of] - (conteo[of] || 0);
      for (let i = 0; i < falta + N.entero(0, 2); i++) S.talentos.push(crear(of, N.entero(18, 26), anio));
    });
    // Historial compacto: se borran los retirados hace más de 25 años (sus nombres quedan en los créditos)
    S.talentos = S.talentos.filter(function (t) { return !t.ret || anio - t.ret < 25 || t.premios > 0; });
    reindexar();
  }

  return {
    reindexar: reindexar, porId: porId, crear: crear, generarInicial: generarInicial, edad: edad,
    disponible: disponible, tarifa: tarifa, activos: activos, disponibles: disponibles,
    mejorDisponible: mejorDisponible, ocupar: ocupar, liberar: liberar, trasEstreno: trasEstreno, anual: anual,
    nombreNuevo: nombreNuevo,
  };
})();
