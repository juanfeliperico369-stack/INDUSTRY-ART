/* ==== módulo: sede ==== */
// La sede por niveles (del cuarto alquilado al complejo), con tope de personal, gasto fijo y una
// descripción con humor; el personal de oficina por rol (productor, guionista de planta, editor, mercadeo y
// analista), cada uno con un efecto que no se acumula; el reclutamiento pagado (rápido o estándar) con su bandeja
// de candidatos; la capacitación (intensiva más allá del nivel 50); el personal libre que se suma a una producción;
// y los fans del estudio.
ART.sede = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, E = ART.economia;

  const NIVELES = [
    { n: 1, nombre: 'Cuarto alquilado', tope: 2, fijo: 0.002, costo: 0, texto: 'Un escritorio, una ventana que no cierra y una cafetera heredada. El teléfono es del vecino.' },
    { n: 2, nombre: 'Oficina en el centro', tope: 4, fijo: 0.004, costo: 0.15, texto: 'Ya hay recepción (una silla) y una placa con el nombre del estudio, casi bien escrito.' },
    { n: 3, nombre: 'Piso propio', tope: 7, fijo: 0.007, costo: 0.5, texto: 'Sala de juntas con pizarra y un sofá donde nacen las mejores ideas, y las peores.' },
    { n: 4, nombre: 'Edificio corporativo', tope: 12, fijo: 0.012, costo: 1.5, texto: 'Ascensor con música, estacionamiento con nombres y un vestíbulo lleno de pósters tuyos.' },
    { n: 5, nombre: 'Complejo de estudios', tope: 20, fijo: 0.02, costo: 4, texto: 'Tienes calles con nombre, un comedor de leyenda y visitas guiadas que no pediste.' },
  ];
  const ROLES = [
    { id: 'productor', nombre: 'Productor de planta', dep: 'produccion', texto: 'Ordena el rodaje: +1 a producción (+2 con nivel 70) y menos sobrecosto.' },
    { id: 'guionista', nombre: 'Guionista de planta', dep: 'guion', texto: 'Pule cada guion: +1 a guion (+2 con nivel 70).' },
    { id: 'editor', nombre: 'Editor de planta', dep: 'edicion', texto: 'Cuida el montaje: +1 a edición (+2 con nivel 70).' },
    { id: 'mercadeo', nombre: 'Mercadeo', dep: null, texto: 'Las campañas rinden más: +4 % (+8 % con nivel 70).' },
    { id: 'analista', nombre: 'Analista', dep: null, texto: 'Informes de lectura casi exactos, mejores regateos y pronósticos.' },
  ];
  const RECLUTAR = {
    rapida: { nombre: 'Búsqueda rápida', semanas: 3, nivel: [25, 45], costo: 0.004, texto: 'Junior en 3 semanas.' },
    estandar: { nombre: 'Búsqueda estándar', semanas: 6, nivel: [45, 65], costo: 0.01, texto: 'Nivel medio en 6 semanas.' },
  };
  function rol(id) { return ROLES.filter(function (r) { return r.id === id; })[0]; }
  function est0() { return N.S.estudios[0]; }
  function nivelSede() { return NIVELES[(est0().sede || 1) - 1]; }
  function personal() { return est0().staff || []; }
  function tipico() { return E.tipicoSuavizado(N.anio()); }
  function salario(niv) { return Math.round(tipico() * 0.0012 * (0.5 + niv / 50)); }

  // ---------- Sede ----------
  function costoMejora() { const s = NIVELES[est0().sede || 1]; return s ? Math.round(tipico() * s.costo) : 0; }
  function puedeMejorar() {
    const s = NIVELES[est0().sede || 1];
    if (!s) return 'Ya tienes el complejo más grande.';
    if (est0().caja < costoMejora()) return 'No alcanza la caja.';
    return '';
  }
  function mejorar() {
    const e = puedeMejorar();
    if (e) return e;
    ART.negocio.pagar(0, 'construccion', costoMejora());
    est0().sede = (est0().sede || 1) + 1;
    N.emit('noticia', { tipo: 'estudio', texto: 'Te mudas: ahora tu sede es ' + nivelSede().nombre.toLowerCase() + '.', importante: true });
    return '';
  }
  function gastoFijoMes() {
    let g = tipico() * nivelSede().fijo;
    personal().forEach(function (p) { g += p.sal; });
    return g;
  }

  // ---------- Personal ----------
  function nombreNuevo() {
    const reg = est0().reg;
    const sx = N.probabilidad(0.5) ? 'M' : 'F';
    return ART.talentos.nombreNuevo(reg, sx);
  }
  function reclutar(tipo, rolId) {
    const S = N.S, r = RECLUTAR[tipo];
    if (!r || !rol(rolId)) return 'Elige el tipo de búsqueda y el rol.';
    if (S.recl) return 'Ya hay una búsqueda en curso.';
    const c = Math.round(tipico() * r.costo);
    if (est0().caja < c) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'personal', c);
    S.recl = { tipo: tipo, rol: rolId, fin: S.t + r.semanas };
    return '';
  }
  // Cada semana: termina la búsqueda y llegan 3 candidatos a la bandeja; avanzan las capacitaciones
  function semana() {
    const S = N.S;
    if (S.recl && S.t >= S.recl.fin) {
      const r = RECLUTAR[S.recl.tipo];
      S.candidatos = [];
      for (let i = 0; i < 3; i++) {
        const niv = N.entero(r.nivel[0], r.nivel[1]);
        S.candidatos.push({ id: N.sigId(), nom: nombreNuevo(), rol: S.recl.rol, niv: niv, sal: salario(niv) });
      }
      N.emit('noticia', { tipo: 'estudio', texto: 'Llegan 3 candidatos para ' + rol(S.recl.rol).nombre.toLowerCase() + '. Revísalos en Negocio › Sede.', importante: true });
      delete S.recl;
    }
    personal().forEach(function (p) {
      if (p.cap && S.t >= p.cap.fin) { p.niv = Math.min(90, p.niv + p.cap.gana); p.sal = salario(p.niv); delete p.cap; N.emit('noticia', { tipo: 'estudio', texto: p.nom + ' termina su capacitación: nivel ' + p.niv + '.' }); }
      if (p.obra) { const o = ART.obras.porId(p.obra); if (!o || ['lista', 'cartelera', 'terminada'].indexOf(o.et) >= 0) delete p.obra; }
    });
  }
  function aceptar(id) {
    const S = N.S, c = (S.candidatos || []).filter(function (x) { return x.id === id; })[0];
    if (!c) return 'Ese candidato ya no está.';
    if (personal().length >= nivelSede().tope) return 'Tu sede no tiene lugar: el tope es ' + nivelSede().tope + '. Mejora la sede.';
    est0().staff = personal().concat([c]);
    S.candidatos = S.candidatos.filter(function (x) { return x.id !== id; });
    return '';
  }
  function rechazar(id) { const S = N.S; S.candidatos = (S.candidatos || []).filter(function (x) { return x.id !== id; }); }
  function despedir(id) { est0().staff = personal().filter(function (p) { return p.id !== id; }); }
  function costoCapacitar(p) { return Math.round(tipico() * (p.niv >= 50 ? 0.012 : 0.004)); }
  function capacitar(id) {
    const p = personal().filter(function (x) { return x.id === id; })[0];
    if (!p) return 'No está en tu personal.';
    if (p.cap) return 'Ya se está capacitando.';
    if (p.niv >= 90) return 'Ya está en lo más alto.';
    const c = costoCapacitar(p);
    if (est0().caja < c) return 'No alcanza la caja.';
    ART.negocio.pagar(0, 'academia', c);
    p.cap = { fin: N.S.t + (p.niv >= 50 ? 6 : 3), gana: p.niv >= 50 ? 6 : 8 };
    return '';
  }
  // El personal libre se suma al instante a una producción en marcha: +1 en su departamento para esa obra
  function asignar(id, obraId) {
    const p = personal().filter(function (x) { return x.id === id; })[0], o = ART.obras.porId(obraId);
    if (!p || !o || o.est !== 0) return 'No se puede.';
    if (!rol(p.rol).dep) return 'Su rol trabaja para todo el estudio, no para una obra.';
    if (p.obra) return 'Ya está en otra producción.';
    if (['lista', 'cartelera', 'terminada'].indexOf(o.et) >= 0) return 'Esa obra ya terminó su producción.';
    p.obra = o.id;
    return '';
  }
  // El mejor de cada rol (no se acumulan) y su efecto
  function mejorDe(rolId) {
    let m = null;
    personal().forEach(function (p) { if (p.rol === rolId && !p.cap && (!m || p.niv > m.niv)) m = p; });
    return m;
  }
  function fuerza(p) { return p ? (p.niv >= 70 ? 2 : p.niv >= 40 ? 1 : 0.5) : 0; }
  // Bonos a los departamentos de una obra tuya (los suma ART.negocio.bonos)
  function bonos(b, obra) {
    ROLES.forEach(function (r) {
      if (!r.dep) return;
      const f = Math.floor(fuerza(mejorDe(r.id)));
      if (f) b[r.dep] = (b[r.dep] || 0) + f;
    });
    if (obra) personal().forEach(function (p) { const r = rol(p.rol); if (p.obra === obra.id && r.dep) b[r.dep] = (b[r.dep] || 0) + 1; });
    return b;
  }
  function bonoMarketing() { return 0.04 * fuerza(mejorDe('mercadeo')); }
  function tieneAnalista() { return !!mejorDe('analista'); }
  function ahorroProductor() { return 0.02 * fuerza(mejorDe('productor')); }

  // ---------- Fans ----------
  // Cada obra tuya que termina suma fans según cuánta gente la vio y cuánto le gustó; cada año se va el 4 %
  function alTerminar(o) {
    if (o.est !== 0) return;
    const S = N.S;
    const vistos = (o.ent || 0) + (o.vt ? M_() * o.vt.total / 10 : 0);
    const gusto = N.limitar(((o.pub || 50) - 45) / 40, -0.5, 1.2);
    const nuevos = Math.round(vistos * 0.001 * gusto * (1 + (o.aw || []).length * 0.2));
    S.fans = Math.max(0, Math.round((S.fans || 0) + nuevos));
    o.fans = nuevos;
  }
  function M_() { return 1 / Math.max(1, ART.mundo.precioEntrada ? ART.mundo.precioEntrada('nam', N.anio()) : 10); }
  function anual() { const S = N.S; S.fans = Math.round((S.fans || 0) * 0.96); }

  return {
    NIVELES: NIVELES, ROLES: ROLES, RECLUTAR: RECLUTAR, rol: rol, nivelSede: nivelSede, personal: personal, salario: salario,
    costoMejora: costoMejora, puedeMejorar: puedeMejorar, mejorar: mejorar, gastoFijoMes: gastoFijoMes,
    reclutar: reclutar, semana: semana, aceptar: aceptar, rechazar: rechazar, despedir: despedir, costoCapacitar: costoCapacitar,
    capacitar: capacitar, asignar: asignar, mejorDe: mejorDe, bonos: bonos, bonoMarketing: bonoMarketing, tieneAnalista: tieneAnalista,
    ahorroProductor: ahorroProductor, alTerminar: alTerminar, anual: anual,
  };
})();
