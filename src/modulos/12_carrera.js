/* ==== módulo: carrera ==== */
// V21 · Tu avatar: trasfondo, arquetipo de liderazgo y especialidades; modo carrera (empezar como talento, con
// encargos de los estudios); vida ligera con mini decisiones (cada opción arriesga algo); edad, salud, retiro,
// muerte (normalmente entre los 85 y los 100) y heredero.
IA.carrera = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia;

  const TRASFONDOS = [
    { id: 'artistas', nombre: 'Familia de artistas', texto: 'Creciste entre camerinos: el estudio empieza con algo de prestigio (+5).', fama: 0.05 },
    { id: 'escuela', nombre: 'Escuela de cine', texto: 'Estudiaste el oficio: +1 a la dirección de tus obras.', bono: { direccion: 1 } },
    { id: 'autodidacta', nombre: 'Autodidacta', texto: 'Aprendiste solo, escribiendo de noche: +1 al guion.', bono: { guion: 1 } },
    { id: 'contador', nombre: 'Contador', texto: 'Cada peso cuenta: −5 % en los gastos fijos.', fijo: 0.05 },
    { id: 'vendedor', nombre: 'Vendedor ambulante', texto: 'Sabes vender lo que sea: las campañas rinden un 5 % más.', mkt: 0.05 },
  ];
  const ARQUETIPOS = [
    { id: 'visionario', nombre: 'Visionario', texto: 'Apuestas por ideas nuevas: +1 a la crítica.', crit: 1 },
    { id: 'carismatico', nombre: 'Carismático', texto: 'Todos quieren trabajar contigo: el equipo llega con más moral.', moral: 8 },
    { id: 'metodico', nombre: 'Metódico', texto: 'Planillas para todo: un 3 % menos de costo de producción.', ahorro: 0.03 },
    { id: 'audaz', nombre: 'Audaz', texto: 'Te la juegas: +1 al público, pero los dilemas pesan más.', pub: 1 },
  ];
  function trasfondo() { const a = N.S.avatar; return TRASFONDOS.filter(function (x) { return x.id === (a && a.tf); })[0] || null; }
  function arquetipo() { const a = N.S.avatar; return ARQUETIPOS.filter(function (x) { return x.id === (a && a.arq); })[0] || null; }
  function edad() { const a = N.S.avatar; return a ? N.anio() - a.nac : 0; }

  // Efectos del avatar en tus obras (los suma IA.negocio.bonos)
  function bonos(b) {
    const tf = trasfondo(), ar = arquetipo();
    if (tf && tf.bono) Object.keys(tf.bono).forEach(function (k) { b[k] = (b[k] || 0) + tf.bono[k]; });
    if (ar) { b._crit = (b._crit || 0) + (ar.crit || 0); b._pub = (b._pub || 0) + (ar.pub || 0); }
    return b;
  }
  function ahorro() { const ar = arquetipo(); return ar && ar.ahorro ? ar.ahorro : 0; }
  function bonoMarketing() { const tf = trasfondo(); return tf && tf.mkt ? tf.mkt : 0; }
  function descuentoFijo() { const tf = trasfondo(); return tf && tf.fijo ? tf.fijo : 0; }

  // ---------- Inicio ----------
  // op: { trasfondo, arquetipo, modo ('dueno' o 'carrera'), oficio }
  function iniciar(op) {
    const S = N.S, a = S.avatar;
    a.tf = op.trasfondo || 'escuela';
    a.arq = op.arquetipo || 'visionario';
    a.modo = op.modo === 'carrera' ? 'carrera' : 'dueno';
    a.salud = 90;
    const tf = trasfondo();
    if (tf && tf.fama) S.estudios[0].fama = N.redondear(S.estudios[0].fama + tf.fama, 3);
    // Modo carrera: tu avatar también es un talento del mundo, con su oficio, y recibe encargos
    if (a.modo === 'carrera') {
      const of = op.oficio && D.oficio(op.oficio) ? op.oficio : 'direccion';
      const t = IA.talentos.crearPropio({ of: of, edad: edad(), sx: a.sx, nom: a.nom, pot: 66, reg: S.estudios[0].reg });
      t.jugador = 1;
      a.tal = t.id;
      a.of = of;
    }
  }
  function talentoAvatar() { const a = N.S.avatar; return a && a.tal ? IA.talentos.porId(a.tal) : null; }

  // ---------- Modo carrera: encargos de los estudios ----------
  function tarifa() { const t = talentoAvatar(); return t ? IA.talentos.tarifaPara(t, 1) : 0; }
  function nuevaOferta() {
    const S = N.S, t = talentoAvatar();
    if (!t || S.trabajo) return;
    const rivales = S.estudios.filter(function (e) { return e.id !== 0 && !e.quebrado; });
    if (!rivales.length) return;
    const e = N.elegir(rivales);
    const sem = N.entero(8, 20);
    S.ofertas = (S.ofertas || []).filter(function (o) { return o.vence > S.t; });
    if (S.ofertas.length >= 3) S.ofertas.shift();
    S.ofertas.push({ id: N.sigId(), est: e.id, nombreEst: e.nombre, tit: IA.obras.tituloNuevo([N.elegir(D.familia(N.elegir(D.ORDEN_FAM)).generos)]),
      sal: Math.round(tarifa() * N.entero(80, 130) / 100), sem: sem, vence: S.t + 6 });
    N.emit('noticia', { tipo: 'estudio', texto: e.nombre + ' te ofrece un encargo como ' + D.oficio(t.of).nombre.toLowerCase() + '.', importante: true });
  }
  function aceptarOferta(id) {
    const S = N.S, o = (S.ofertas || []).filter(function (x) { return x.id === id; })[0], t = talentoAvatar();
    if (!o || !t) return 'Esa oferta ya no está.';
    if (S.trabajo) return 'Ya estás en un encargo.';
    if (IA.talentos.energia(t) < 20) return 'Estás sin energía: descansa un mes.';
    S.trabajo = { est: o.est, nombreEst: o.nombreEst, tit: o.tit, sal: o.sal, fin: S.t + o.sem };
    t.en = Math.max(0, IA.talentos.energia(t) - 20); t.enT = S.t;
    S.ofertas = S.ofertas.filter(function (x) { return x.id !== id; });
    return '';
  }
  function rechazarOferta(id) { const S = N.S; S.ofertas = (S.ofertas || []).filter(function (x) { return x.id !== id; }); }

  // ---------- Vida ligera: mini decisiones ----------
  // Cada opción: { t: texto, caja: en presupuestos típicos (negativo = gasto), fama, salud, moral, azar: [prob, efecto malo] }
  const VIDA = [
    { id: 'gala', texto: 'Te invitan a una gala de la industria.', ops: [
      { t: 'Ir con traje de estreno', caja: -0.004, fama: 0.01, salud: -2 }, { t: 'Quedarte a descansar', salud: 3 } ] },
    { id: 'amigo', texto: 'Un viejo amigo te pide un préstamo para su obra de teatro.', ops: [
      { t: 'Prestarle', caja: -0.01, azar: [0.5, { caja: 0.015, texto: 'La obra funciona y te devuelve más de lo prestado.' }] }, { t: 'Decir que no', moral: -3 } ] },
    { id: 'medico', texto: 'Toca el chequeo médico anual.', ops: [
      { t: 'Hacerlo completo', caja: -0.002, salud: 6 }, { t: 'Saltarlo este año', azar: [0.3, { salud: -10, texto: 'Un susto: te toca reposo.' }] } ] },
    { id: 'entrevista', texto: 'Un programa quiere entrevistarte en vivo.', ops: [
      { t: 'Aceptar y hablar sin filtro', fama: 0.02, azar: [0.3, { fama: -0.03, texto: 'Una frase tuya se vuelve polémica.' }] }, { t: 'Aceptar con guion', fama: 0.008 }, { t: 'No ir', moral: -1 } ] },
    { id: 'vacaciones', texto: 'Llevas meses sin parar.', ops: [
      { t: 'Tomar vacaciones', caja: -0.003, salud: 8, moral: -2 }, { t: 'Seguir trabajando', salud: -5, moral: 2 } ] },
    { id: 'clase', texto: 'Una escuela de cine te invita a dar una clase magistral.', ops: [
      { t: 'Dar la clase', fama: 0.006, salud: -1 }, { t: 'Mandar a alguien del equipo', moral: 2 } ] },
    { id: 'mudanza', texto: 'Encuentras una casa más cerca del estudio.', ops: [
      { t: 'Mudarte', caja: -0.008, salud: 4 }, { t: 'Quedarte donde estás' } ] },
    { id: 'premio', texto: 'Una asociación local quiere darte un premio a la trayectoria.', ops: [
      { t: 'Recibirlo con discurso', fama: 0.012, caja: -0.001 }, { t: 'Pedir que se lo den a tu equipo', moral: 4 } ] },
  ];
  function vidaPendiente() { const S = N.S; return S.vida ? VIDA.filter(function (v) { return v.id === S.vida.id; })[0] : null; }
  function decidirVida(i) {
    const S = N.S, v = vidaPendiente();
    if (!v) return '';
    const op = v.ops[i] || v.ops[0];
    let txt = '';
    const aplicar = function (x) {
      const tip = E.presupuestoTipico(N.anio());
      if (x.caja) { if (x.caja < 0) IA.negocio.pagar(0, 'personal', -x.caja * tip); else IA.negocio.cobrarEn(0, 'reestrenos', x.caja * tip); }
      if (x.fama) S.estudios[0].fama = N.redondear(N.limitar(S.estudios[0].fama + x.fama, 0.01, 1), 3);
      if (x.salud) S.avatar.salud = N.limitar((S.avatar.salud || 80) + x.salud, 5, 100);
      if (x.moral) S.talentos.forEach(function (t) { if (t.ex === 0 && t.exH > S.t) IA.talentos.cambiarMoral(t, x.moral); });
      if (x.texto) txt = x.texto;
    };
    aplicar(op);
    if (op.azar && N.azar() < op.azar[0]) aplicar(op.azar[1]);
    delete S.vida;
    if (txt) N.emit('noticia', { tipo: 'estudio', texto: txt, importante: true });
    return txt;
  }

  // ---------- Edad, muerte, retiro y heredero ----------
  function generarHerederos() {
    const S = N.S, a = S.avatar;
    const tipos = ['Hija', 'Hijo', 'Sobrina', 'Protegido de toda la vida'];
    S.herederos = [0, 1, 2].map(function (i) {
      const sx = tipos[i % 4].indexOf('Hij') === 0 ? (i === 0 ? 'F' : 'M') : N.elegir(['F', 'M']);
      const ed = N.entero(22, 45);
      return { id: i, rel: tipos[i], nom: IA.talentos.nombreNuevo(S.estudios[0].reg, sx).split(' ')[0] + ' ' + a.nom.split(' ').slice(-1)[0], sx: sx, edad: ed,
        esp: [a.esp[i % a.esp.length]].concat(N.elegir([['guion'], ['direccion'], ['produccion'], ['musica']])) };
    });
  }
  function morir(motivo) {
    const S = N.S, a = S.avatar;
    if (!a || a.fin) return;
    a.fin = { anio: N.anio(), motivo: motivo };
    generarHerederos();
    N.emit('noticia', { tipo: 'estudio', texto: motivo === 'retiro' ? a.nom + ' se retira a los ' + edad() + ' años. Elige a quién deja el estudio.' : 'Muere ' + a.nom + ' a los ' + edad() + ' años. Todo el mundo del arte lo despide. Elige a tu heredero.', importante: true });
  }
  function retirarse() { morir('retiro'); return ''; }
  function elegirHeredero(i) {
    const S = N.S, h = (S.herederos || [])[i];
    if (!h) return 'Elige un heredero.';
    const a = S.avatar;
    S.legado = (S.legado || []).concat([{ nom: a.nom, desde: a.nac, hasta: N.anio() }]);
    S.avatar = { nom: h.nom, sx: h.sx, nac: N.anio() - h.edad, id: 999999, esp: h.esp.filter(function (x, j, arr) { return arr.indexOf(x) === j; }).slice(0, 3),
      tf: a.tf, arq: a.arq, modo: 'dueno', salud: 90, gen: (a.gen || 1) + 1 };
    delete S.herederos;
    N.emit('noticia', { tipo: 'estudio', texto: h.nom + ' toma el control del estudio. Comienza la generación ' + S.avatar.gen + '.', importante: true });
    return '';
  }
  function pendiente() { const S = N.S; return !!(S.vida || S.herederos); }

  // ---------- Reloj ----------
  function semana() {
    const S = N.S, a = S.avatar;
    if (!a || a.fin) return;
    // Encargo terminado: cobras y creces
    if (S.trabajo && S.t >= S.trabajo.fin) {
      const t = talentoAvatar();
      IA.negocio.cobrarEn(0, 'carrera', S.trabajo.sal);
      if (t) { t.obras = (t.obras || 0) + 1; t.hab = Math.min(99, t.hab + 1); t.fama = N.redondear(Math.min(1, t.fama + 0.015), 3); }
      N.emit('noticia', { tipo: 'estudio', texto: 'Terminas «' + S.trabajo.tit + '» para ' + S.trabajo.nombreEst + ' y cobras tu parte.', importante: true });
      delete S.trabajo;
    }
    if (a.modo === 'carrera' && !S.trabajo && N.probabilidad(1 / 10)) nuevaOferta();
    if (!S.vida && N.probabilidad(1 / 12)) S.vida = { id: N.elegir(VIDA).id, t: S.t };
  }
  function anual() {
    const S = N.S, a = S.avatar;
    if (!a || a.fin) return;
    const e = edad();
    a.salud = N.limitar((a.salud || 80) - (e > 60 ? 2 : 0) - (e > 75 ? 2 : 0), 5, 100);
    // Normalmente entre los 85 y los 100 (antes solo en modo realista, que llega con los modos)
    if (e >= 100) { morir('edad'); return; }
    if (e >= 85) { const p = (e - 84) / 16 * (1.3 - a.salud / 100); if (N.azar() < p) morir('edad'); }
  }
  // El bot decide solo (opción del medio o la primera) y elige al primer heredero
  function autoDecidir() {
    const S = N.S;
    if (S.vida) decidirVida(0);
    if (S.herederos) elegirHeredero(0);
  }

  return {
    TRASFONDOS: TRASFONDOS, ARQUETIPOS: ARQUETIPOS, VIDA: VIDA, trasfondo: trasfondo, arquetipo: arquetipo, edad: edad, bonos: bonos, ahorro: ahorro,
    bonoMarketing: bonoMarketing, descuentoFijo: descuentoFijo, iniciar: iniciar, talentoAvatar: talentoAvatar, tarifa: tarifa,
    aceptarOferta: aceptarOferta, rechazarOferta: rechazarOferta, vidaPendiente: vidaPendiente, decidirVida: decidirVida,
    retirarse: retirarse, elegirHeredero: elegirHeredero, pendiente: pendiente, semana: semana, anual: anual, autoDecidir: autoDecidir,
  };
})();
