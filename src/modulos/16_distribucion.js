/* ==== módulo: distribucion ==== */
// V20 · Lanzamiento (pantallas): el plan de estreno de cada obra (vía, fecha con cuenta regresiva, regiones con
// su modo y su doblaje, campaña con la mezcla de canales, promociones, expectativa frente a calidad), las ventanas
// y el dinero en cadena en la ficha de la obra, las acciones del catálogo (reestrenar, remasterizar, bóveda),
// las cadenas de cines y tus cines en Negocio, y el calendario de 12 meses y las tendencias por región en Mundo.
IA.distribucion = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, M = IA.mundo, O = IA.obras, T = IA.talentos;
  const L = IA.lanzamiento, ES = IA.estreno, V = IA.ventanas, U = IA.ui, esc = N.esc;
  const dinero = U.dinero, ac = U.accion;
  const est0 = function () { return N.S.estudios[0]; };

  function kpi(nombre, valor, clase) { return '<div class="kpi"><span>' + esc(nombre) + '</span><b class="cifra ' + (clase || '') + '">' + esc(valor) + '</b></div>'; }
  function chip(txt, accion, valor, on, deshab, titulo) {
    return '<button class="chip' + (on ? ' on' : '') + '" data-a="' + accion + '" data-v="' + esc(valor) + '"' + (deshab ? ' disabled' : '') + (titulo ? ' title="' + esc(titulo) + '"' : '') + ' aria-pressed="' + !!on + '">' + esc(txt) + '</button>';
  }
  function barra(v, max, color) {
    const w = Math.round(N.limitar(max > 0 ? v / max : 0, 0, 1) * 100);
    return '<div class="barra-p"><i style="width:' + w + '%' + (color ? ';background:' + color : '') + '"></i></div>';
  }
  function nombreModo(id) { return ES.modo(id).nombre; }

  // =====================================================================
  // PLAN DE LANZAMIENTO
  // =====================================================================
  const pg = { id: 0, t: 0, nivM: 2, plan: null };
  function obra() { return O.porId(pg.id); }
  function anioPlan() { return N.anio(pg.t || N.S.t + 1); }
  function abrir(id, semana) {
    const o = O.porId(+id);
    if (!o) return;
    pg.id = o.id; pg.t = semana && semana > N.S.t && semana <= N.S.t + 12 ? semana : 0; pg.nivM = 2;
    pg.plan = ES.planPorDefecto(o, N.anio());
    U.abrirFicha(fichaPlan(), 'programar');
  }
  function refrescar() { U.refrescarFicha(fichaPlan()); }

  function fichaPlan() {
    const o = obra();
    if (!o) return '';
    const S = N.S, est = est0();
    const mejor = L.mejorSemana(o, S.t + 1, S.t + 12);
    if (!pg.t) pg.t = mejor;
    const anio = anioPlan();
    const p = ES.normalizar(o, pg.plan, anio);
    pg.plan = p;
    const c = ES.costos(o, p, pg.nivM, anio);
    let h = '<h2>Plan de lanzamiento</h2><div class="fila"><canvas class="poster" data-poster="' + o.id + '"></canvas><div class="col"><b>' + esc(o.tit) + '</b><span class="tenue">' + esc(o.gen.join(' · ')) + ' · ' + esc(o.clas) + '</span>' +
      '<span class="nota">Elige cómo, cuándo y dónde se estrena. La campaña y lo demás se pagan al confirmar.</span></div></div>';

    // 1. Vía de estreno
    const vias = V.viasDirectas(anio);
    h += '<h3>Vía de estreno</h3><div class="chips">' + chip('Cines', 'plVia', 'cines', p.via === 'cines') +
      chip('Directo a video' + (anio < 1980 ? ' · 1980' : ''), 'plVia', 'video', p.via === 'video', !vias.some(function (v) { return v.id === 'video'; })) +
      chip('Directo a streaming' + (anio < 2010 ? ' · 2010' : ''), 'plVia', 'streaming', p.via === 'streaming', !vias.some(function (v) { return v.id === 'streaming'; })) + '</div>';
    if (p.via !== 'cines') h += '<p class="nota">Sin cines: no hay taquilla ni premios de taquilla, la campaña cuesta un 30 % y el dinero llega por ' + (p.via === 'video' ? 'la venta de video' : 'el streaming') + ' (y después por las demás ventanas). Conviene para obras flojas.</p>';

    // 2. Fecha con cuenta regresiva
    h += '<h3>Fecha de estreno</h3><p class="nota">Anunciar con tiempo arma expectativa: cada semana de cuenta regresiva (hasta 8) suma gente que se entera. Las festividades de ' + esc(D.region(est.reg).nombre) + ' pesan el doble en el pronóstico.</p><div class="col">';
    for (let k = 1; k <= 12; k++) {
      const tt = S.t + k, sem = N.semana(tt);
      const temp = E.pronosticoSemana(sem, o.fam, est.reg);
      const comp = L.competenciaPrevista(tt, o.id);
      const fs = M.festividades(sem, est.reg, N.anio(tt)).map(function (f) { return f.nombre; });
      h += '<button class="tarjeta toque fila entre" style="width:100%;margin:0;' + (pg.t === tt ? 'border-color:var(--acento);border-width:2px' : '') + '" data-a="plSemana" data-v="' + tt + '"><span>' + esc(U.fechaEstreno(tt)) + ' <span class="tenue chico">· en ' + k + ' sem.</span>' + (fs.length ? '<br><span class="chico oro">' + esc(fs.join(', ')) + '</span>' : '') + (tt === mejor ? ' <span class="etiqueta oro">mejor</span>' : '') + '</span>' +
        '<span class="chico" style="text-align:right">×' + U.decimal(temp, 2) + ' temporada<br>' + IA.cal.competencia(tt, o.id).nombre + ' (' + U.decimal(comp, 1) + ')</span></button>';
    }
    h += '</div>';

    if (p.via === 'cines') {
      // 3. Regiones: modo y doblaje
      const pr = ES.pesoRegiones(anio);
      h += '<h3>Estreno por región</h3><p class="nota">Amplio: todas las salas. Limitado: 40 % de las salas y de la campaña; si gusta mucho (70+), crece cada semana. Escalonado: llega 4 semanas después. Retener (0): no se estrena ahí y queda para las ventanas.</p>';
      h += D.regiones.map(function (r) {
        const dob = ES.necesitaDoblaje(o, r.id, anio);
        return '<div class="tarjeta"><div class="fila entre"><b class="' + (r.id === est.reg ? 'oro' : '') + '">' + esc(r.nombre) + (r.id === est.reg ? ' (sede)' : '') + '</b><span class="chico tenue">' + (pr[r.id] < 0.01 ? 'menos del 1 %' : U.pct(pr[r.id], 0)) + ' del público</span></div>' +
          '<div class="fila envolver" style="gap:8px;margin-top:6px"><label class="campo crece" style="margin:0"><span>Modo</span><select data-c="plReg" data-k="' + r.id + '" aria-label="Modo en ' + esc(r.nombre) + '">' +
          ES.MODOS.map(function (m) { return '<option value="' + m.id + '"' + (p.reg[r.id] === m.id ? ' selected' : '') + '>' + esc(m.nombre) + '</option>'; }).join('') + '</select></label>' +
          (dob ? '<label class="interruptor" style="margin:0;border:0"><span>Doblaje · ' + dinero(ES.costoDoblaje(anio)) + '</span><input type="checkbox" data-c="plDob" data-k="' + r.id + '"' + (p.dob[r.id] ? ' checked' : '') + (p.reg[r.id] === 'retener' ? ' disabled' : '') + '></label>' : '<span class="tenue chico">' + (anio < ES.ANIO_SONORO ? 'Cine mudo: sin doblaje' : 'Habla su idioma') + '</span>') + '</div></div>';
      }).join('');
      h += '<div class="chips">' + chip('Copiar el modo de la sede a todas', 'plCopiar', 'sede') + chip('Doblar en todas', 'plDobTodas', '1') + chip('Sin doblajes', 'plDobTodas', '0') + '</div>';
      h += '<p class="nota">Sin doblaje, en una región de otro idioma la obra rinde un 10 % menos.</p>';
    }

    // 4. Campaña: nivel y mezcla de canales
    const base = E.marketingTipico(anio);
    h += '<h3>Campaña</h3><div class="chips">' + D.nivelesMarketing.map(function (n, i) { return chip(n.nombre + ' · ' + dinero(base * n.mult * (p.via === 'cines' ? 1 : 0.3)), 'plNivel', String(i), pg.nivM === i); }).join('') + '</div>';
    const fe = E.famaEstrellas(o, T.porId);
    const prueba = Object.assign({}, o, { plan: p, cm: c.total, campana: Math.round(base * D.nivelesMarketing[pg.nivM].mult * (p.via === 'cines' ? 1 : 0.3)), anio: anio });
    prueba.plan = Object.assign({}, p, { anuncio: pg.t - S.t });
    const con = E.conocimiento(prueba, anio, est.fama, fe, IA.negocio.bonoMarketing(0));
    if (p.via === 'cines') {
      const cs = E.canalesDe(anio);
      const ev = ES.evaluarMix(o, p.mix, anio);
      const f = ES.factorCampana(prueba);
      h += '<h4 style="margin:10px 0 4px">Mezcla de canales de ' + anio + '</h4><p class="nota">Cada canal llega mejor a unas edades. Poner todo en uno rinde menos (rendimientos decrecientes).</p>';
      cs.forEach(function (ch) {
        const v = Math.round((p.mix && p.mix[ch.id] !== undefined ? p.mix[ch.id] : ch.peso) * 100);
        h += '<label class="campo rango"><span>' + esc(ch.nombre) + ': <b id="rv-mix-' + ch.id + '">' + v + '</b> <span class="tenue">· ' + edadesFuertes(ch.edades) + '</span></span>' +
          '<input type="range" min="0" max="300" step="5" value="' + v + '" data-i="plMix" data-c="plMixFin" data-k="' + ch.id + '" aria-label="' + esc(ch.nombre) + '"></label>';
      });
      h += '<div class="chips">' + chip('Mezcla recomendada', 'plMixRec', '1') + chip('Mezcla de siempre', 'plMixRec', '0') + '</div>';
      const ed = ES.edadesObra(o);
      const maxE = Math.max.apply(null, ed.concat([0.001])), maxP = Math.max.apply(null, ev.porEdad.concat([0.001]));
      h += '<h4 style="margin:10px 0 4px">Alcance por edades</h4><div class="desliza"><table class="tabla"><tr><th>Edad</th><th>Tu obra le habla a</th><th>Tu campaña llega a</th></tr>' + M.GRUPOS.map(function (g, i) {
        return '<tr><td>' + esc(g) + '</td><td>' + barra(ed[i], maxE, 'var(--dorado)') + '</td><td>' + barra(ev.porEdad[i], maxP) + '</td></tr>';
      }).join('') + '</table></div>';
      h += '<p class="nota">Esta mezcla rinde <b class="' + (f >= 1.02 ? 'bien' : f < 0.98 ? 'mal' : '') + '">×' + U.decimal(f, 2) + '</b> frente a la de siempre · afinidad ' + Math.round(ev.afinidad * 100) + ' %.</p>';
    }

    // 5. Promociones
    if (p.via === 'cines') {
      const ps = ES.PROMOS;
      h += '<h3>Promociones</h3><div class="col">' + ps.map(function (x) {
        const on = p.promo.indexOf(x.id) >= 0, ok = x.desde <= anio;
        return '<button class="tarjeta toque fila entre" style="width:100%;margin:0;text-align:left;' + (on ? 'border-color:var(--rosa);border-width:2px' : '') + '" data-a="plPromo" data-v="' + x.id + '"' + (ok ? '' : ' disabled') + ' aria-pressed="' + on + '"><span class="col"><b>' + esc(x.nombre) + (on ? ' ✓' : '') + '</b><span class="chico">' + esc(x.texto) + '</span></span><span class="chico">' + (ok ? dinero(base * x.costo) : 'desde ' + x.desde) + '</span></button>';
      }).join('') + '</div>';
    }

    // 6. Expectativa frente a calidad
    const tend = N.S.mundo.tendencias[o.fam] || 0;
    const calidad = o.prueba ? o.prueba.p : null;
    const expect = Math.round(N.limitar(E.deseo(Object.assign({}, o, { nivM: pg.nivM, pub: calidad !== null ? calidad : o.pub !== undefined ? o.pub : 55 }), fe, tend) + ES.bonoDeseo(prueba) + (o.ddes || 0), 1, 99));
    h += '<h3>Expectativa frente a calidad</h3><div class="kpis">' + kpi('Gente que se enterará', '~' + Math.round(con * 100) + ' %') + kpi('Expectativa', '~' + expect) +
      kpi('Calidad (prueba de público)', calidad !== null ? String(calidad) : 'sin prueba') + '</div>';
    if (calidad !== null) h += '<p class="nota">' + (expect - calidad >= 6 ? 'Promete más de lo que es: abrirá fuerte y caerá rápido cuando corra la voz.' : calidad - expect >= 6 ? 'Es mejor de lo que promete: el boca a boca la hará crecer.' : 'Promesa y calidad van parejas.') + '</p>';
    else h += '<p class="nota">Sin prueba de público no sabes cuánto gustará. Si la expectativa supera la calidad, cae rápido; si la calidad supera la expectativa, crece.</p>';

    // 7. Total
    h += '<h3>Total</h3><div class="kpis">' + kpi('Campaña', dinero(c.campana)) + (c.doblaje ? kpi('Doblajes', dinero(c.doblaje)) : '') + (c.promos ? kpi('Promociones', dinero(c.promos)) : '') + kpi('Total', dinero(c.total), c.total > est.caja ? 'mal' : '') + kpi('Caja', dinero(est.caja)) + '</div>';
    h += '<button class="btn primario bloque" data-a="plConfirmar">Confirmar · ' + esc(U.fechaCorta(pg.t)) + ' · ' + dinero(c.total) + '</button>';
    return h;
  }
  function edadesFuertes(v) {
    const orden = v.map(function (x, i) { return [x, i]; }).sort(function (a, b) { return b[0] - a[0]; });
    if (orden[0][0] - orden[4][0] < 0.15) return 'todas las edades';
    return orden.slice(0, 2).map(function (x) { return M.GRUPOS[x[1]].toLowerCase(); }).join(' y ');
  }
  ac('programar', function (v) { const o = IA.obras.porId(+v); if (o && o.tv) { U.abrirFicha(IA.pantallas.fichaObra(+v), 'obra:' + v); return; } abrir(v); });
  ac('plVia', function (v) { pg.plan.via = v; refrescar(); });
  ac('plSemana', function (v) { pg.t = +v; refrescar(); });
  ac('plNivel', function (v) { pg.nivM = +v; refrescar(); });
  ac('plReg', function (v, el) {
    const r = el.getAttribute('data-k');
    pg.plan.reg[r] = v;
    if (v === 'retener') delete pg.plan.dob[r];
    else if (ES.necesitaDoblaje(obra(), r, anioPlan()) && pg.plan.dob[r] === undefined) pg.plan.dob[r] = 1;
    refrescar();
  });
  ac('plDob', function (v, el) { const r = el.getAttribute('data-k'); if (v) pg.plan.dob[r] = 1; else { pg.plan.dob[r] = 0; delete pg.plan.dob[r]; } refrescar(); });
  ac('plCopiar', function () { const m = pg.plan.reg[est0().reg] || 'amplio'; D.regiones.forEach(function (r) { pg.plan.reg[r.id] = m; }); refrescar(); });
  ac('plDobTodas', function (v) {
    const o = obra(), a = anioPlan();
    pg.plan.dob = {};
    if (v === '1') D.regiones.forEach(function (r) { if (ES.necesitaDoblaje(o, r.id, a) && pg.plan.reg[r.id] !== 'retener') pg.plan.dob[r.id] = 1; });
    refrescar();
  });
  ac('plMix', function (v, el) { const k = el.getAttribute('data-k'); const l = document.getElementById('rv-mix-' + k); if (l) l.textContent = v; });
  ac('plMixFin', function (v, el) {
    const k = el.getAttribute('data-k');
    if (!pg.plan.mix) { pg.plan.mix = {}; E.canalesDe(anioPlan()).forEach(function (c) { pg.plan.mix[c.id] = c.peso; }); }
    pg.plan.mix[k] = N.limitar(+v / 100, 0, 2);
    refrescar();
  });
  ac('plMixRec', function (v) {
    if (v === '1') pg.plan.mix = ES.mixRecomendado(obra(), anioPlan());
    else { pg.plan.mix = {}; E.canalesDe(anioPlan()).forEach(function (c) { pg.plan.mix[c.id] = c.peso; }); }
    refrescar();
  });
  ac('plPromo', function (v) {
    const i = pg.plan.promo.indexOf(v);
    if (i >= 0) pg.plan.promo.splice(i, 1); else pg.plan.promo.push(v);
    refrescar();
  });
  ac('plConfirmar', function () {
    const o = obra();
    const err = IA.juego.programarEstreno(o, pg.t, pg.nivM, pg.plan);
    if (err) { U.aviso(err, 'mal'); return; }
    IA.arte.sonido('dinero');
    U.cerrarFicha();
    U.aviso(o.plan.via === 'cines' ? 'Estreno anunciado: ' + U.fechaCorta(pg.t) : 'Estreno directo: ' + U.fechaCorta(pg.t));
    U.refrescar();
  });

  // =====================================================================
  // FICHA DE LA OBRA: plan, ventanas, dinero en cadena y catálogo
  // =====================================================================
  function resumenPlan(o) {
    const p = o.plan;
    if (!p || p.rival) return '';
    if (p.via && p.via !== 'cines') return '<p class="nota">Estreno directo en ' + (p.via === 'video' ? 'video' : 'streaming') + '.</p>';
    const grupos = {};
    D.regiones.forEach(function (r) { const m = (p.reg || {})[r.id] || 'amplio'; (grupos[m] = grupos[m] || []).push(r.nombre); });
    const dob = Object.keys(p.dob || {}).length;
    return '<p class="nota">Plan: ' + Object.keys(grupos).map(function (m) { return nombreModo(m).toLowerCase() + ' en ' + grupos[m].join(', '); }).join(' · ') +
      (dob ? ' · ' + dob + ' doblaje' + (dob > 1 ? 's' : '') : '') + ((p.promo || []).length ? ' · promociones: ' + p.promo.map(function (id) { return ES.promo(id).nombre.toLowerCase(); }).join(', ') : '') +
      (p.anuncio ? ' · anunciada con ' + p.anuncio + ' semanas' : '') + '.</p>';
  }
  function bloqueVentanas(o) {
    const st = V.estadisticas(o);
    if (!st.length) {
      if (o.et === 'cartelera' && o.fv > 0) return '<h3>Ventanas</h3><p class="nota">Al salir de los cines, el ' + Math.round(o.fv * 100) + ' % de lo que gana una obra de ' + o.anio + ' llega después por video, TV' + (o.anio >= 2007 ? ' y streaming' : '') + '.</p>';
      return '';
    }
    const txtEstado = { pendiente: 'abre', curso: 'en curso', terminada: 'terminada', boveda: 'en la bóveda' };
    let h = '<h3>Ventanas</h3>' + (o.cert ? '<p><span class="etiqueta oro">Video ' + esc(V.CERTIFICACIONES.filter(function (c) { return c.id === o.cert; })[0].nombre) + '</span></p>' : '');
    h += st.map(function (w) {
      return '<div class="tarjeta"><div class="fila entre"><b>' + esc(w.nombre) + '</b><span class="chico ' + (w.estado === 'curso' ? 'bien' : 'tenue') + '">' + esc(txtEstado[w.estado]) + (w.estado === 'pendiente' ? ' ' + esc(U.fechaCorta(w.t0)) : '') + '</span></div>' +
        barra(w.cobrado, w.total) + '<span class="chico">Cobrado ' + dinero(w.cobrado, o.anio) + ' de ' + dinero(w.total, o.anio) + ' · ' + U.grande(w.n) + ' ' + w.unidad + '</span></div>';
    }).join('') + '<p class="nota">Las ventanas abren en orden: cines, video, TV y streaming. Al firmar, cada comprador adelanta el 35 %.</p>';
    return h;
  }
  function bloqueDinero(o) {
    if (o.et !== 'terminada' && o.et !== 'cartelera') return '';
    const filas = [];
    const fila = function (n, v, cl, nota) { filas.push('<tr><td>' + esc(n) + (nota ? '<br><span class="tenue chico">' + esc(nota) + '</span>' : '') + '</td><td class="n ' + (cl || '') + '">' + v + '</td></tr>'); };
    if (!o.dir) {
      fila('Taquilla en el mundo (bruto)', dinero(o.bruto || 0, o.anio), '', 'lo que pagó el público en los cines');
      fila('Se quedan los cines', '−' + dinero(Math.max(0, (o.bruto || 0) - (o.parte || 0) / Math.max(0.05, 1 - (o.fv || 0))), o.anio).replace('−', ''), 'tenue');
      if (o.fv > 0) fila('Pasa a las ventanas', '−' + dinero((o.parte || 0) / Math.max(0.05, 1 - o.fv) * o.fv, o.anio).replace('−', ''), 'tenue', 'se cobra después por video, TV y streaming');
      fila('Parte del estudio en cines', dinero(o.parte || 0, o.anio), 'bien');
    }
    if (o.vt) fila('Ventanas (video, TV, streaming)', dinero(o.vt.total, o.anio), 'bien', 'cobrado hasta hoy ' + dinero(o.vt.cob || 0, o.anio));
    if (o.merch) fila('Juguetes y coleccionables', dinero(o.merch, o.anio), 'bien');
    fila('Costo (talento, producción y campaña)', '−' + dinero(O.costoTotal(o) - (o.part || 0), o.anio).replace('−', ''), 'mal');
    if (o.part) fila('Regalías y participaciones', '−' + dinero(o.part, o.anio).replace('−', ''), 'mal', 'el porcentaje de los talentos');
    const n = O.neto(o);
    filas.push('<tr><td><b>Neto de la obra</b>' + (o.vt && !o.vt.fin ? '<br><span class="tenue chico">contando lo que falta cobrar</span>' : '') + '</td><td class="n ' + (n >= 0 ? 'bien' : 'mal') + '"><b>' + dinero(n, o.anio) + '</b></td></tr>');
    if (o.reB) filas.push('<tr><td>Reestrenos (aparte)</td><td class="n bien">' + dinero(o.reB) + '</td></tr>');
    return '<h3>Dinero en cadena</h3><table class="tabla">' + filas.join('') + '</table>';
  }
  function bloqueCatalogo(o) {
    if (o.est !== 0 || o.et !== 'terminada') return '';
    let h = '<h3>Tu catálogo</h3>';
    const err = V.puedeReestrenar(o);
    if (!err) {
      h += '<p class="nota">Reestreno en cines (6 semanas). Vale más con nostalgia, premios, remasterización y años en la bóveda; cada reestreno vale la mitad que el anterior.</p><div class="col">' + [0, 1, 2].map(function (n) {
        const costo = V.costoReestreno(n), val = V.valorReestreno(o, n);
        return '<button class="tarjeta toque fila entre" style="width:100%;margin:0" data-a="catReestreno" data-v="' + o.id + ':' + n + '"><span><b>' + ['Reestreno modesto', 'Reestreno', 'Gran reestreno'][n] + '</b><br><span class="chico">campaña ' + dinero(costo) + '</span></span><span class="chico ' + (val > costo ? 'bien' : 'mal') + '">dejaría ~' + dinero(val) + '</span></button>';
      }).join('') + '</div>';
    } else h += '<p class="tenue chico">Reestreno: ' + esc(err) + '</p>';
    const f = V.formatoNuevo(o);
    const errR = V.puedeRemasterizar(o);
    h += '<div class="tarjeta fila entre"><div class="col crece"><b>Remasterizar' + (f ? ' en ' + esc(f.id) : '') + '</b><span class="chico">' + (f ? 'Una edición nueva en video y un reestreno que vale más.' : esc(errR)) + '</span></div><button class="btn" data-a="catRemaster" data-v="' + o.id + '"' + (errR ? ' disabled title="' + esc(errR) + '"' : '') + '>' + dinero(V.costoRemaster()) + '</button></div>';
    h += '<div class="tarjeta fila entre"><div class="col crece"><b>' + (o.bov ? 'En la bóveda' + (o.bovA ? ' (' + o.bovA + ' año' + (o.bovA > 1 ? 's' : '') + ')' : '') : 'La bóveda') + '</b><span class="chico">Guardada no se vende ni se emite, pero cada año que pasa ahí vale más al volver (reestreno).</span></div><button class="btn" data-a="catBoveda" data-v="' + o.id + '">' + (o.bov ? 'Sacar' : 'Guardar') + '</button></div>';
    return h;
  }
  function trasAccion(id, err, ok) {
    if (err) { U.aviso(err, 'mal'); return; }
    IA.arte.sonido('dinero');
    U.aviso(ok);
    U.refrescarFicha(IA.pantallas.fichaObra(+id));
  }
  ac('catReestreno', function (v) { const p = v.split(':'); trasAccion(p[0], V.reestrenar(+p[0], +p[1]), 'Vuelve a los cines'); });
  ac('catRemaster', function (v) { trasAccion(v, V.remasterizar(+v), 'Remasterizada'); });
  ac('catBoveda', function (v) { const o = O.porId(+v); trasAccion(v, V.alternarBoveda(+v), o && o.bov ? 'Guardada en la bóveda' : 'Fuera de la bóveda'); });

  // =====================================================================
  // NEGOCIO › DISTRIBUCIÓN: cadenas de cines con contrato y tus cines
  // =====================================================================
  function negocioDistribucion() {
    const est = est0(), anio = N.anio();
    const n = ES.cinesPropios();
    let h = '<p class="nota">Con una cadena de cines bajo contrato tus obras llegan a más salas, te dejan una parte mayor de la taquilla y se quedan unas semanas mínimas en cartelera. Pagas una cuota cada mes.</p>';
    h += '<div class="kpis">' + kpi('Tus cines', n + ' de 3') + kpi('Contratos activos', Object.keys(est.cad || {}).length) + kpi('Fama del estudio', Math.round(est.fama * 100)) + '</div>';
    h += '<p class="nota">' + (n ? 'Tus ' + n + ' cine' + (n > 1 ? 's' : '') + ' en ' + esc(D.region(est.reg).nombre) + ': +' + (12 * n) + ' % de salas y +' + (12 * n) + ' puntos de la parte del estudio para tus obras allí, y cobran algo de las obras ajenas.' : 'Construye una «Cadena de cines propia» en Negocio › Estudio › Terrenos (hasta 3 cuentan).') + '</p>';
    D.regiones.slice().sort(function (a, b) { return (b.id === est.reg) - (a.id === est.reg); }).forEach(function (r) {
      const k = est.cad && est.cad[r.id] && est.cad[r.id].hasta > N.S.t ? est.cad[r.id] : null;
      h += '<h3>' + esc(r.nombre) + (r.id === est.reg ? ' <span class="etiqueta oro">sede</span>' : '') + '</h3>';
      ES.cadenas(r.id).forEach(function (c) {
        const firmada = k && k.id === c.id;
        const err = ES.puedeFirmar(c.id, 1);
        h += '<div class="tarjeta"><div class="fila entre"><div class="col crece"><b>' + esc(c.nombre) + (firmada ? ' <span class="etiqueta bien">contrato hasta ' + esc(U.fechaCorta(k.hasta)) + '</span>' : '') + '</b>' +
          '<span class="chico">' + Math.round(c.salas * 100) + ' % de las salas · +' + Math.round(c.parte * 100) + ' puntos de parte · ' + c.minimo + ' semanas mínimas · cuota ' + dinero(ES.costoCadena(c)) + '/año</span>' +
          (c.desde > anio ? '<span class="tenue chico">Abre en ' + c.desde + '</span>' : c.fama > est.fama ? '<span class="tenue chico">Pide fama ' + Math.round(c.fama * 100) + '</span>' : '') + '</div></div>' +
          (firmada ? '<div class="chips"><button class="chip" data-a="cadCancelar" data-v="' + r.id + '">Cancelar contrato</button></div>' :
            '<div class="chips">' + [1, 2, 3].map(function (a) { const e = ES.puedeFirmar(c.id, a); return '<button class="chip" data-a="cadFirmar" data-v="' + c.id + ':' + a + '"' + (e ? ' disabled title="' + esc(e) + '"' : '') + '>Firmar ' + a + ' año' + (a > 1 ? 's' : '') + '</button>'; }).join('') + '</div>' + (err && c.desde <= anio && c.fama <= est.fama ? '<span class="tenue chico">' + esc(err) + '</span>' : '')) + '</div>';
      });
    });
    return h;
  }
  ac('cadFirmar', function (v) { const p = v.split(':'); const e = ES.firmar(p[0], +p[1]); if (e) { U.aviso(e, 'mal'); return; } IA.arte.sonido('exito'); U.aviso('Contrato firmado'); U.refrescar(); });
  ac('cadCancelar', function (v) { const e = ES.cancelar(v); if (e) { U.aviso(e, 'mal'); return; } U.aviso('Contrato cancelado'); U.refrescar(); });

  // =====================================================================
  // MUNDO › CALENDARIO (12 meses) y TENDENCIAS POR REGIÓN
  // =====================================================================
  const ESTACIONES_N = ['invierno', 'invierno', 'primavera', 'primavera', 'primavera', 'verano', 'verano', 'verano', 'otoño', 'otoño', 'otoño', 'invierno'];
  const ESTACIONES_S = ['verano', 'verano', 'otoño', 'otoño', 'otoño', 'invierno', 'invierno', 'invierno', 'primavera', 'primavera', 'primavera', 'verano'];
  function mesDeSemana(sem) { return N.mesDeSemana(sem); }
  function semanasDelMes(m) {
    const r = [];
    for (let s = 1; s <= 52; s++) if (N.mesDeSemana(s) === m) r.push(s);
    return [r[0], r[r.length - 1]];
  }
  function calendario() {
    const S = N.S, est = est0(), anio = N.anio();
    const mes0 = mesDeSemana(N.semana());
    let h = '<p class="nota">Los próximos 12 meses: estaciones por hemisferio, festividades (las de ' + esc(D.region(est.reg).nombre) + ', tu sede, en dorado: pesan más para ti) y estrenos anunciados.</p>';
    for (let k = 0; k < 12; k++) {
      const m = (mes0 + k) % 12, a = anio + Math.floor((mes0 + k) / 12);
      const sm = semanasDelMes(m), s0 = sm[0], s1 = sm[1];
      const fs = M.FESTIVIDADES.filter(function (f) { return f.sem[1] >= s0 && f.sem[0] <= s1 && (!f.desde || a >= f.desde); });
      const t0 = (a - S.y0) * 52 + s0 - 1, t1 = (a - S.y0) * 52 + s1 - 1;
      const est2 = O.activas().filter(function (o) { return o.et === 'lista' && o.prog && o.fe >= t0 && o.fe <= t1; });
      const temp = M.temporada(est.reg, Math.round((s0 + s1) / 2));
      h += '<div class="tarjeta"><div class="fila entre"><b>' + esc(M.nombreMes(m).charAt(0).toUpperCase() + M.nombreMes(m).slice(1)) + ' ' + a + '</b><span class="chico">Norte: ' + ESTACIONES_N[m] + ' · Sur: ' + ESTACIONES_S[m] + ' · temporada ×' + U.decimal(temp, 2) + '</span></div>' +
        (fs.length ? '<div class="chico">' + fs.map(function (f) {
          const casa = f.reg.indexOf(est.reg) >= 0;
          const fams = Object.keys(f.fam).map(function (x) { return D.familia(x).nombre.toLowerCase(); }).join(', ');
          return '<div class="' + (casa ? 'oro' : 'tenue') + '">' + esc(f.nombre) + ' · ' + esc(f.reg.length === 6 ? 'todo el mundo' : f.reg.map(function (r) { return D.region(r).nombre; }).join(', ')) + ' · sube ' + esc(fams) + '</div>';
        }).join('') + '</div>' : '') +
        (m === mesDeSemana(D.premios.semana) ? '<div class="chico">' + esc(D.premios.nombre) + '</div>' : '') +
        (est2.length ? est2.map(function (o) { return '<div class="' + (o.est === 0 ? 'oro' : '') + '">«' + esc(o.tit) + '» · ' + esc(N.S.estudios[o.est].nombre) + ' · ' + esc(U.fechaCorta(o.fe)) + '</div>'; }).join('') : '') + '</div>';
    }
    return h;
  }
  let regTend = null;
  function tendenciasRegion() {
    const est = est0();
    const reg = regTend || est.reg;
    let h = '<h3>Por región</h3><p class="nota">Cada región tiene sus propias olas: lo que sube en Asia puede bajar en Europa.</p><div class="chips">' + D.regiones.map(function (r) { return chip(r.nombre, 'tendReg', r.id, r.id === reg); }).join('') + '</div>';
    h += '<div class="desliza"><table class="tabla"><tr><th>Familia</th><th class="n">' + esc(D.region(reg).nombre) + '</th><th>Rumbo</th></tr>' + D.familias.map(function (f) {
      const v = M.tendenciaRegion(reg, f.id);
      return '<tr><td>' + esc(f.nombre) + '</td><td class="n ' + (v > 0.15 ? 'bien' : v < -0.15 ? 'mal' : '') + '">' + (v >= 0 ? '+' : '') + U.decimal(v, 2) + '</td><td class="chico">' + (v > 0.15 ? 'en alza' : v < -0.15 ? 'en baja' : 'estable') + '</td></tr>';
    }).join('') + '</table></div>';
    return h;
  }
  ac('tendReg', function (v) { regTend = v; U.refrescar(); });

  return {
    abrir: abrir, fichaPlan: fichaPlan, resumenPlan: resumenPlan, bloqueVentanas: bloqueVentanas, bloqueDinero: bloqueDinero,
    bloqueCatalogo: bloqueCatalogo, negocioDistribucion: negocioDistribucion, calendario: calendario, tendenciasRegion: tendenciasRegion,
  };
})();
