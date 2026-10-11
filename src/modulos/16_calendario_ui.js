/* ==== módulo: calendario_ui ==== */
// V21 · Pantallas del calendario completo (vistas de mes, semana, año, día y agenda; filtros por tipo, región y
// «solo lo mío»; saltar a una fecha; avanzar hasta un día; recordatorios con nota) y de lo nuevo del estudio: sede
// por niveles y personal de oficina (Negocio › Sede), tu avatar (vida ligera, encargos, retiro y heredero),
// menú rápido de departamentos, fans, ADN del mercado y el menú de pausa.
IA.calendarioUI = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, M = IA.mundo, O = IA.obras, C = IA.cal, U = IA.ui, esc = N.esc;
  const dinero = U.dinero, ac = U.accion, t = IA.t;
  const est0 = function () { return N.S.estudios[0]; };
  function kpi(nombre, valor, clase) { return '<div class="kpi"><span>' + esc(nombre) + '</span><b class="cifra ' + (clase || '') + '">' + esc(valor) + '</b></div>'; }
  function chip(txt, accion, valor, on) { return '<button class="chip' + (on ? ' on' : '') + '" data-a="' + accion + '" data-v="' + esc(valor) + '" aria-pressed="' + !!on + '">' + esc(txt) + '</button>'; }

  // =====================================================================
  // CALENDARIO
  // =====================================================================
  const st = { vista: 'mes', y: 0, m: 0, d: 0, tipos: {}, reg: '', mio: false };
  function sincronizar() { if (!st.y) { const h = C.hoy(); st.y = h.y; st.m = h.m; st.d = h.d; } }
  function filtros() { return { tipos: st.tipos, reg: st.reg, mio: st.mio }; }
  function icono(ev) { return (C.TIPOS[ev.tipo] || {}).icono || '•'; }
  function lineaEvento(ev, y, m, d) {
    let acc = '';
    if (ev.obra) acc = '<button class="btn" data-a="verObra" data-v="' + ev.obra + '">Ver</button>';
    else if (ev.talento) acc = '<button class="btn" data-a="verTalento" data-v="' + ev.talento + '">Ver</button>';
    else if (ev.rec) acc = '<button class="btn" data-a="calQuitarRec" data-v="' + ev.rec + '">Quitar</button>';
    void y; void m; void d;
    return '<div class="cal-ev"><span class="ic" aria-hidden="true">' + icono(ev) + '</span><div class="col crece"><span class="' + (ev.mio ? 'oro' : '') + '">' + esc(ev.titulo) + '</span><span class="tenue chico">' + esc((C.TIPOS[ev.tipo] || {}).nombre || '') + '</span></div>' + acc + '</div>';
  }
  function cabecera() {
    sincronizar();
    let h = '<div class="chips">' + [['mes', 'Mes'], ['semana', 'Semana'], ['anio', 'Año'], ['dia', 'Día'], ['agenda', 'Agenda']].map(function (v) { return chip(v[1], 'calVista', v[0], st.vista === v[0]); }).join('') + '</div>';
    h += '<div class="fila envolver" style="margin:8px 0;gap:6px"><button class="btn" data-a="calMover" data-v="-1" aria-label="Anterior">‹</button>' +
      '<b class="crece" style="text-align:center">' + esc(st.vista === 'anio' ? String(st.y) : st.vista === 'dia' ? C.texto({ y: st.y, m: st.m, d: st.d }, true) : C.MESES[st.m] + ' ' + st.y) + '</b>' +
      '<button class="btn" data-a="calMover" data-v="1" aria-label="Siguiente">›</button><button class="btn" data-a="calHoy">Hoy</button></div>';
    h += '<button class="btn" data-a="calFiltros" aria-expanded="' + !!st.abiertos + '">Filtros e ir a una fecha</button>';
    if (!st.abiertos) return h;
    h += '<div class="fila envolver" style="gap:6px"><label class="campo" style="margin:0"><span>Ir a</span><select data-c="calMes">' + C.MESES.map(function (n, i) { return '<option value="' + i + '"' + (i === st.m ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
      '<label class="campo" style="margin:0;max-width:110px"><span>Año</span><input type="number" min="1850" max="2150" value="' + st.y + '" data-c="calAnio"></label>' +
      '<label class="campo" style="margin:0"><span>Región</span><select data-c="calReg"><option value="">Todas</option>' + D.regiones.map(function (r) { return '<option value="' + r.id + '"' + (st.reg === r.id ? ' selected' : '') + '>' + esc(r.nombre) + '</option>'; }).join('') + '</select></label></div>';
    h += '<div class="chips" style="margin-top:6px">' + chip('Solo lo mío', 'calMio', '1', st.mio) + Object.keys(C.TIPOS).map(function (k) { return chip(C.TIPOS[k].icono + ' ' + C.TIPOS[k].nombre, 'calTipo', k, st.tipos[k] !== false); }).join('') + '</div>';
    return h;
  }
  function vistaMes(y, m, compacta) {
    const ev = C.eventosMes(y, m, filtros()), hoy = C.hoy();
    const p = C.diaSemana(y, m, 1), n = C.diasMes(y, m);
    let h = '<div class="cal-mes">' + (compacta ? '' : C.DIAS_C.map(function (d) { return '<span class="cab">' + d + '</span>'; }).join(''));
    for (let i = 0; i < p; i++) h += '<span></span>';
    for (let d = 1; d <= n; d++) {
      const l = ev[d] || [];
      const ics = []; l.forEach(function (e) { const ic = icono(e); if (ics.indexOf(ic) < 0) ics.push(ic); });
      const esHoy = hoy.y === y && hoy.m === m && hoy.d === d, sel = st.y === y && st.m === m && st.d === d;
      h += '<button class="cal-dia' + (esHoy ? ' hoy' : '') + (sel && !compacta ? ' sel' : '') + '" data-a="calDia" data-v="' + y + '-' + m + '-' + d + '" aria-label="' + esc(C.texto({ y: y, m: m, d: d }, true) + (l.length ? ', ' + l.length + ' eventos' : '')) + '"><span>' + d + '</span>' + (compacta ? '' : '<span class="ics">' + ics.slice(0, 3).join('') + '</span>') + '</button>';
    }
    return h + '</div>';
  }
  function vistaDia(y, m, d) {
    const l = (C.eventosMes(y, m, filtros())[d]) || [];
    const tt = C.tDeFecha(y, m, d), S = N.S;
    let h = '<h3>' + esc(C.texto({ y: y, m: m, d: d }, true)) + '</h3><p class="tenue chico">Semana ' + C.semanaDeFecha(y, m, d) + ' del juego · ' + C.estacion(m, 'N') + ' en el norte, ' + C.estacion(m, 'S') + ' en el sur</p>';
    h += l.length ? l.map(function (e) { return lineaEvento(e, y, m, d); }).join('') : '<p class="tenue">Nada este día.</p>';
    if (tt > S.t) {
      const comp = C.competencia(tt);
      h += '<p>Competencia de esa semana: <b class="' + (comp.id === 'saturada' ? 'mal' : comp.id === 'tranquila' ? 'bien' : '') + '">' + comp.nombre + '</b></p>';
      const listas = O.delEstudio(0, ['lista']).filter(function (o) { return !o.prog; });
      if (listas.length && tt - S.t <= 12) h += '<div class="chips">' + listas.map(function (o) { return '<button class="chip" data-a="calProgramar" data-v="' + o.id + ':' + tt + '">Estrenar «' + esc(o.tit) + '» aquí</button>'; }).join('') + '</div>';
      h += '<div class="fila envolver" style="gap:6px;margin-top:8px"><button class="btn primario" data-a="calAvanzarHasta" data-v="' + tt + '">Avanzar hasta este día</button></div>';
      h += '<label class="campo"><span>Recordatorio con nota (detiene el tiempo)</span><input type="text" maxlength="80" id="calNota" placeholder="Por ejemplo: revisar el guion"></label><button class="btn" data-a="calRecordar" data-v="' + y + '-' + m + '-' + d + '">Guardar recordatorio</button>';
    }
    return h;
  }
  function vistaSemana() {
    const f = C.desdeJdn(C.jdn(st.y, st.m, st.d) - C.diaSemana(st.y, st.m, st.d)); // lunes de esa semana
    let h = '';
    for (let i = 0; i < 7; i++) {
      const x = C.desdeJdn(C.jdn(f.y, f.m, f.d) + i);
      const l = (C.eventosMes(x.y, x.m, filtros())[x.d]) || [];
      h += '<div class="tarjeta"><button class="fila entre" style="width:100%;background:none;border:0;color:inherit;min-height:44px;cursor:pointer" data-a="calDia" data-v="' + x.y + '-' + x.m + '-' + x.d + '"><b>' + esc(C.textoCorto(x)) + '</b><span class="tenue chico">' + l.length + ' eventos</span></button>' + l.map(function (e) { return lineaEvento(e, x.y, x.m, x.d); }).join('') + '</div>';
    }
    const tt = C.tDeFecha(st.y, st.m, st.d);
    if (tt >= N.S.t) h += '<p class="nota">Competencia de esta semana: <b>' + C.competencia(tt).nombre + '</b>.</p>';
    return h;
  }
  function vistaAnio() {
    const S = N.S, sede = est0().reg, hem = (D.region(sede) || {}).hemisferio === 'S' ? 'S' : 'N';
    let h = '<div class="cal-anio">';
    for (let m = 0; m < 12; m++) {
      let estrenos = 0;
      const ev = C.eventosMes(st.y, m, { tipos: { estreno: true } });
      Object.keys(ev).forEach(function (d) { estrenos += ev[d].filter(function (e) { return e.tipo === 'estreno'; }).length; });
      h += '<div class="tarjeta" style="margin:0"><button style="background:none;border:0;color:inherit;width:100%;text-align:left;min-height:44px;cursor:pointer" data-a="calIrMes" data-v="' + m + '"><b>' + esc(C.MESES[m]) + '</b><br><span class="chico tenue">' + C.estacion(m, hem) + ' · ' + estrenos + ' estrenos</span></button>' + vistaMes(st.y, m, true) + '</div>';
    }
    void S;
    return h + '</div>';
  }
  function vistaAgenda() {
    const S = N.S, h0 = C.hoy();
    const out = [];
    let y = h0.y, m = h0.m;
    for (let k = 0; k < 4 && out.length < 40; k++) {
      const ev = C.eventosMes(y, m, filtros());
      Object.keys(ev).map(Number).sort(function (a, b) { return a - b; }).forEach(function (d) {
        if (y === h0.y && m === h0.m && d < h0.d) return;
        ev[d].forEach(function (e) { if (e.inicio !== false) out.push({ y: y, m: m, d: d, e: e }); });
      });
      m++; if (m > 11) { m = 0; y++; }
    }
    if (!out.length) return '<p class="tenue">Nada próximo con estos filtros.</p>';
    return out.slice(0, 40).map(function (x) {
      const faltan = C.tDeFecha(x.y, x.m, x.d) - S.t;
      return '<div class="cal-ev"><span class="ic">' + icono(x.e) + '</span><div class="col crece"><span class="' + (x.e.mio ? 'oro' : '') + '">' + esc(x.e.titulo) + '</span><span class="tenue chico">' + esc(C.textoCorto(x)) + ' ' + x.y + '</span></div><span class="etiqueta">' + (faltan <= 0 ? 'esta semana' : 'en ' + faltan + ' sem.') + '</span></div>';
    }).join('');
  }
  function calendario() {
    sincronizar();
    let cuerpo;
    if (st.vista === 'mes') cuerpo = '<div class="dos-cal"><div>' + vistaMes(st.y, st.m) + '</div><div class="tarjeta">' + vistaDia(st.y, st.m, st.d) + '</div></div>';
    else if (st.vista === 'semana') cuerpo = vistaSemana();
    else if (st.vista === 'anio') cuerpo = vistaAnio();
    else if (st.vista === 'dia') cuerpo = '<div class="tarjeta">' + vistaDia(st.y, st.m, st.d) + '</div>';
    else cuerpo = vistaAgenda();
    return '<p class="nota">Calendario real de 1850 a 2150. El juego avanza por semanas y cada evento ocurre en la semana de su día. Tus cosas, en dorado.</p>' + cabecera() + cuerpo;
  }
  function refrescar() { U.refrescar(); }
  ac('abrirCalendario', function () { U.irA('mundo', 'calendario'); });
  ac('calVista', function (v) { st.vista = v; refrescar(); });
  ac('calMover', function (v) {
    const k = +v;
    if (st.vista === 'anio') st.y = N.limitar(st.y + k, 1850, 2150);
    else if (st.vista === 'dia' || st.vista === 'semana') { const f = C.desdeJdn(C.jdn(st.y, st.m, st.d) + k * (st.vista === 'dia' ? 1 : 7)); st.y = f.y; st.m = f.m; st.d = f.d; }
    else { st.m += k; if (st.m < 0) { st.m = 11; st.y--; } if (st.m > 11) { st.m = 0; st.y++; } st.y = N.limitar(st.y, 1850, 2150); st.d = Math.min(st.d, C.diasMes(st.y, st.m)); }
    refrescar();
  });
  ac('calHoy', function () { st.y = 0; sincronizar(); refrescar(); });
  ac('calMes', function (v) { st.m = +v; st.d = Math.min(st.d, C.diasMes(st.y, st.m)); refrescar(); });
  ac('calAnio', function (v) { st.y = N.limitar(Math.round(+v) || st.y, 1850, 2150); st.d = Math.min(st.d, C.diasMes(st.y, st.m)); refrescar(); });
  ac('calIrMes', function (v) { st.m = +v; st.d = 1; st.vista = 'mes'; refrescar(); });
  ac('calReg', function (v) { st.reg = v; refrescar(); });
  ac('calFiltros', function () { st.abiertos = !st.abiertos; refrescar(); });
  ac('calMio', function () { st.mio = !st.mio; refrescar(); });
  ac('calTipo', function (v) { st.tipos[v] = st.tipos[v] === false; refrescar(); });
  ac('calDia', function (v) { const p = v.split('-'); st.y = +p[0]; st.m = +p[1]; st.d = +p[2]; if (st.vista !== 'mes') st.vista = 'dia'; refrescar(); });
  ac('calQuitarRec', function (v) { C.quitarRecordatorio(+v); refrescar(); });
  ac('calRecordar', function (v) {
    const p = v.split('-'), el = document.getElementById('calNota');
    const e = C.agregarRecordatorio(+p[0], +p[1], +p[2], el ? el.value : '');
    if (e) { U.aviso(e, 'mal'); return; }
    U.aviso('Recordatorio guardado'); refrescar();
  });
  ac('calAvanzarHasta', function (v) { if (IA.pantallas.avanzarHasta) IA.pantallas.avanzarHasta(+v); });
  ac('calProgramar', function (v) { const p = v.split(':'); IA.distribucion.abrir(+p[0], +p[1]); });

  // =====================================================================
  // ESTUDIO: sede, departamentos, avatar y fans
  // =====================================================================
  function tarjetasEstudio() {
    const S = N.S, est = est0(), sd = IA.sede.nivelSede(), a = S.avatar, CA = IA.carrera;
    let h = '<div class="tarjeta"><h3>Tu sede: ' + esc(sd.nombre) + '</h3><p class="nota">' + esc(sd.texto) + '</p><div class="kpis">' + kpi('Personal', IA.sede.personal().length + ' / ' + sd.tope) + kpi('Fans', U.grande(S.fans || 0)) + kpi('Influencia', est.influencia || 0) + '</div><button class="btn" data-a="irSede">Sede y personal</button></div>';
    // Menú rápido de departamentos (tus pisos)
    const pisos = []; est.pisos.forEach(function (p) { if (pisos.indexOf(p) < 0) pisos.push(p); });
    h += '<div class="tarjeta"><h3>Departamentos</h3><div class="chips">' + pisos.map(function (p) { const i = IA.negocio.infoPiso(p); return '<button class="chip" data-a="verDepto" data-v="' + p + '">' + esc(i.nombre) + '</button>'; }).join('') + '</div></div>';
    if (a && !a.fin) {
      const tf = CA.trasfondo(), ar = CA.arquetipo(), ta = CA.talentoAvatar();
      h += '<div class="tarjeta"><h3>' + esc(a.nom) + (a.gen > 1 ? ' <span class="etiqueta">generación ' + a.gen + '</span>' : '') + '</h3><div class="kpis">' + kpi('Edad', CA.edad()) + kpi('Salud', Math.round(a.salud || 0)) +
        (ta ? kpi(D.oficio(ta.of).nombre, 'habilidad ' + Math.round(ta.hab)) : '') + '</div><p class="chico">' + esc((tf ? tf.nombre : '') + (ar ? ' · ' + ar.nombre : '')) + (a.modo === 'carrera' ? ' · modo carrera' : '') + '</p>';
      if (S.trabajo) h += '<p>Encargo en curso: «' + esc(S.trabajo.tit) + '» para ' + esc(S.trabajo.nombreEst) + ' · termina ' + esc(U.fechaCorta(S.trabajo.fin)) + ' · ' + dinero(S.trabajo.sal) + '</p>';
      (S.ofertas || []).filter(function (o) { return o.vence > S.t; }).forEach(function (o) {
        h += '<div class="tarjeta"><b>' + esc(o.nombreEst) + '</b> te ofrece «' + esc(o.tit) + '» · ' + o.sem + ' semanas · ' + dinero(o.sal) + '<div class="chips"><button class="chip" data-a="carAceptar" data-v="' + o.id + '">Aceptar</button><button class="chip" data-a="carRechazar" data-v="' + o.id + '">Rechazar</button></div></div>';
      });
      h += '<button class="btn" data-a="carRetiro">Retirarte y elegir heredero</button></div>';
    }
    return h;
  }
  ac('irSede', function () { U.irA('negocio', 'sede'); });
  ac('verDepto', function (v) {
    const i = IA.negocio.infoPiso(v), n = est0().pisos.filter(function (x) { return x === v; }).length;
    const gente = IA.sede.personal().filter(function (p) { const r = IA.sede.rol(p.rol); return r.dep && i.bono && i.bono[r.dep]; });
    U.modal('<h2>' + esc(i.nombre) + '</h2><p>' + esc(i.efecto) + '</p><p class="tenue">Tienes ' + n + '.</p>' + (gente.length ? '<p>Trabajan aquí: ' + gente.map(function (p) { return esc(p.nom); }).join(', ') + '</p>' : '') + '<button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
  });
  ac('carAceptar', function (v) { const e = IA.carrera.aceptarOferta(+v); if (e) U.aviso(e, 'mal'); else U.aviso('Encargo aceptado'); U.refrescar(); });
  ac('carRechazar', function (v) { IA.carrera.rechazarOferta(+v); U.refrescar(); });
  ac('carRetiro', function () {
    U.modal('<h2>Retirarte</h2><p>Tu avatar deja el estudio y eliges a quién se lo entregas. La partida sigue con tu heredero.</p><div class="col"><button class="btn peligro" data-a="carRetiroSi">Sí, retirarme</button><button class="btn" data-a="cerrarModal">Seguir trabajando</button></div>');
  });
  ac('carRetiroSi', function () { IA.carrera.retirarse(); mostrarPendientes(); });
  // Vida ligera y heredero: ventanas al avanzar
  function mostrarPendientes() {
    const S = N.S;
    if (S.herederos) {
      U.modal('<h2>' + esc(S.avatar.fin && S.avatar.fin.motivo === 'retiro' ? 'Tu retiro' : 'Un adiós') + '</h2><p>¿Quién toma el estudio?</p><div class="col">' + S.herederos.map(function (h, i) {
        return '<button class="tarjeta toque" style="text-align:left;width:100%;margin:0" data-a="carHeredero" data-v="' + i + '"><b>' + esc(h.nom) + '</b> · ' + esc(h.rel) + ', ' + h.edad + ' años<br><span class="chico">Especialidades: ' + h.esp.map(function (x) { return D.oficio(x).nombre.toLowerCase(); }).join(', ') + '</span></button>';
      }).join('') + '</div>');
      return true;
    }
    const v = IA.carrera.vidaPendiente();
    if (v) {
      U.modal('<h2>Tu vida</h2><p>' + esc(v.texto) + '</p><div class="col">' + v.ops.map(function (o, i) { return '<button class="btn" data-a="carVida" data-v="' + i + '">' + esc(o.t) + '</button>'; }).join('') + '</div><p class="nota">Cada opción arriesga algo.</p>');
      return true;
    }
    const recs = C.recordatoriosDeSemana(S.t);
    if (recs.length) {
      U.modal('<h2>Recordatorio</h2>' + recs.map(function (r) { return '<p>⚑ ' + esc(r.nota) + '</p>'; }).join('') + '<button class="btn primario bloque" data-a="carRecVisto">' + t('aceptar') + '</button>');
      return true;
    }
    return false;
  }
  ac('carHeredero', function (v) { IA.carrera.elegirHeredero(+v); U.cerrarModal(); U.refrescar(); });
  ac('carVida', function (v) { const txt = IA.carrera.decidirVida(+v); U.cerrarModal(); if (txt) U.aviso(txt); U.refrescar(); });
  ac('carRecVisto', function () { const S = N.S; C.recordatoriosDeSemana(S.t).forEach(function (r) { C.quitarRecordatorio(r.id); }); U.cerrarModal(); U.refrescar(); });
  ac('verFans', function () {
    const S = N.S;
    U.modal('<h2>Fans</h2><p>Tienes <b>' + U.grande(S.fans || 0) + '</b> fans. Llegan con cada obra que el público ve y disfruta, y cada año se va una parte si no les das motivos.</p><button class="btn primario bloque" data-a="cerrarModal">' + t('aceptar') + '</button>');
  });

  // =====================================================================
  // NEGOCIO › SEDE Y PERSONAL
  // =====================================================================
  function negocioSede() {
    const S = N.S, SD = IA.sede, sd = SD.nivelSede();
    let h = '<div class="tarjeta"><h3>' + esc(sd.nombre) + ' (nivel ' + sd.n + ' de 5)</h3><p class="nota">' + esc(sd.texto) + '</p><div class="kpis">' + kpi('Tope de personal', sd.tope) + kpi('Gasto fijo de la sede y el personal', dinero(SD.gastoFijoMes()) + '/mes') + '</div>';
    const sig = SD.NIVELES[sd.n];
    if (sig) { const e = SD.puedeMejorar(); h += '<p class="chico">Siguiente: <b>' + esc(sig.nombre) + '</b> (tope ' + sig.tope + '). ' + esc(sig.texto) + '</p><button class="btn' + (e ? '' : ' primario') + '" data-a="sedeMejorar"' + (e ? ' disabled title="' + esc(e) + '"' : '') + '>Mudarte · ' + dinero(SD.costoMejora()) + '</button>'; }
    h += '</div>';
    h += '<h3>Personal de oficina</h3><p class="nota">Cada rol tiene un efecto que no se acumula (cuenta el mejor de cada rol). Quien trabaja en un departamento puede sumarse a una producción en marcha (+1 en esa obra).</p>';
    const enMarcha = O.enProduccion(0);
    h += SD.personal().length ? SD.personal().map(function (p) {
      const r = SD.rol(p.rol), o = p.obra ? O.porId(p.obra) : null;
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(p.nom) + '</b><span class="etiqueta">nivel ' + p.niv + '</span></div><span class="chico">' + esc(r.nombre) + ' · ' + esc(r.texto) + ' · ' + dinero(p.sal) + '/mes</span>' +
        (p.cap ? '<p class="chico oro">Capacitándose hasta ' + esc(U.fechaCorta(p.cap.fin)) + '</p>' : '') + (o ? '<p class="chico">Trabajando en «' + esc(o.tit) + '»</p>' : '') +
        '<div class="chips"><button class="chip" data-a="staffCap" data-v="' + p.id + '">' + (p.niv >= 50 ? 'Capacitación intensiva' : 'Capacitar') + ' · ' + dinero(SD.costoCapacitar(p)) + '</button>' +
        (r.dep && !p.obra ? enMarcha.map(function (ob) { return '<button class="chip" data-a="staffAsignar" data-v="' + p.id + ':' + ob.id + '">Sumarse a «' + esc(ob.tit) + '»</button>'; }).join('') : '') +
        '<button class="chip" data-a="staffDespedir" data-v="' + p.id + '">Despedir</button></div></div>';
    }).join('') : '<p class="tenue">Todavía no tienes personal de oficina.</p>';
    h += '<h3>Reclutar</h3>';
    if (S.recl) h += '<p>Búsqueda en curso para ' + esc(SD.rol(S.recl.rol).nombre.toLowerCase()) + ': termina ' + esc(U.fechaCorta(S.recl.fin)) + '.</p>';
    else h += '<div class="fila envolver" style="gap:6px"><label class="campo crece" style="margin:0"><span>Rol</span><select id="reclRol">' + SD.ROLES.map(function (r) { return '<option value="' + r.id + '">' + esc(r.nombre) + '</option>'; }).join('') + '</select></label></div><div class="chips">' +
      Object.keys(SD.RECLUTAR).map(function (k) { const r = SD.RECLUTAR[k]; return '<button class="chip" data-a="staffReclutar" data-v="' + k + '">' + esc(r.nombre) + ' · ' + esc(r.texto) + ' · ' + dinero(E.tipicoSuavizado(N.anio()) * r.costo) + '</button>'; }).join('') + '</div>';
    if ((S.candidatos || []).length) {
      h += '<h3>Bandeja de candidatos</h3>' + S.candidatos.map(function (c) {
        return '<div class="tarjeta fila entre"><div class="col crece"><b>' + esc(c.nom) + '</b><span class="chico">' + esc(SD.rol(c.rol).nombre) + ' · nivel ' + c.niv + ' · ' + dinero(c.sal) + '/mes</span></div><div class="chips"><button class="chip" data-a="staffAceptar" data-v="' + c.id + '">Aceptar</button><button class="chip" data-a="staffRechazar" data-v="' + c.id + '">Rechazar</button></div></div>';
      }).join('');
    }
    return h;
  }
  const res = function (e, ok) { if (e) U.aviso(e, 'mal'); else if (ok) U.aviso(ok); U.refrescar(); };
  ac('sedeMejorar', function () { res(IA.sede.mejorar(), '¡Mudanza lista!'); });
  ac('staffCap', function (v) { res(IA.sede.capacitar(+v), 'Empieza la capacitación'); });
  ac('staffAsignar', function (v) { const p = v.split(':'); res(IA.sede.asignar(+p[0], +p[1]), 'Se suma a la producción'); });
  ac('staffDespedir', function (v) { IA.sede.despedir(+v); res('', 'Despedido'); });
  ac('staffReclutar', function (v) { const s = document.getElementById('reclRol'); res(IA.sede.reclutar(v, s ? s.value : 'productor'), 'Búsqueda iniciada'); });
  ac('staffAceptar', function (v) { res(IA.sede.aceptar(+v), 'Bienvenido al equipo'); });
  ac('staffRechazar', function (v) { IA.sede.rechazar(+v); res('', ''); });

  // ADN del mercado por era (Negocio › Mercado)
  function adnMercado() {
    const anio = N.anio(), S = N.S;
    let motor = D.motorMercado[0][1];
    D.motorMercado.forEach(function (m) { if (m[0] <= anio) motor = m[1]; });
    const tend = D.familias.map(function (f) { return { f: f, v: S.mundo.tendencias[f.id] || 0 }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 3);
    return '<div class="tarjeta"><h3>ADN del mercado de ' + anio + '</h3><div class="kpis">' + kpi('Entrada de cine (hoy)', U.dinero(M.precioEntrada2025('nam', anio), 2025)) + kpi('Entrada de cine (época)', dinero(M.precioEntrada('nam', anio))) + '</div><p>Motor del mercado: <b>' + esc(motor) + '</b></p><p>Géneros en tendencia: ' + tend.map(function (x) { return esc(x.f.nombre); }).join(', ') + '</p></div>';
  }

  // =====================================================================
  // MENÚ DE PAUSA
  // =====================================================================
  ac('abrirPausa', function () {
    U.modal('<div class="fila entre"><h2>Pausa</h2><button class="ico" data-a="cerrarModal" aria-label="' + t('cerrar') + '">' + U.icono('cerrar') + '</button></div><div class="col">' +
      '<button class="btn primario" data-a="cerrarModal">Seguir</button>' + (N.S ? '<button class="btn" data-a="abrirGuardado">' + t('gua_titulo') + '</button>' : '') +
      '<button class="btn" data-a="abrirAjustes">' + t('ajustes') + '</button>' + (N.S ? '<button class="btn" data-a="crearTalentoForm">Crear talento (Editor)</button>' : '') +
      '<button class="btn" data-a="ayuda" data-v="inicio_guia">Guía</button>' + (N.S ? '<button class="btn peligro" data-a="salir">' + t('aj_salir') + '</button>' : '') + '</div>');
  });
  ac('crearTalentoForm', function () {
    U.modal('<h2>Crear talento</h2><p class="nota">Tu propio talento entra al mundo con una habilidad modesta que crece con el trabajo.</p>' +
      '<label class="campo"><span>Nombre</span><input type="text" maxlength="40" id="ctNom" value=""></label>' +
      '<label class="campo"><span>Oficio</span><select id="ctOf">' + D.oficios.map(function (o) { return '<option value="' + o.id + '">' + esc(o.nombre) + '</option>'; }).join('') + '</select></label>' +
      '<div class="fila"><label class="campo crece"><span>Sexo</span><select id="ctSx"><option value="F">' + t('mujer') + '</option><option value="M">' + t('hombre') + '</option></select></label><label class="campo crece"><span>Edad</span><input type="number" min="8" max="80" value="25" id="ctEd"></label></div>' +
      '<button class="btn primario bloque" data-a="crearTalentoSi">Crear</button><p></p><button class="btn bloque" data-a="cerrarModal">' + t('cerrar') + '</button>');
  });
  ac('crearTalentoSi', function () {
    const g = function (id) { const el = document.getElementById(id); return el ? el.value : ''; };
    const ta = IA.talentos.crearPropio({ nom: g('ctNom').trim() || undefined, of: g('ctOf'), sx: g('ctSx'), edad: +g('ctEd') || 25, reg: est0().reg });
    U.cerrarModal(); U.aviso('Nace ' + ta.nom); U.acciones.verTalento(String(ta.id));
  });

  return { calendario: calendario, tarjetasEstudio: tarjetasEstudio, mostrarPendientes: mostrarPendientes, negocioSede: negocioSede, adnMercado: adnMercado };
})();
