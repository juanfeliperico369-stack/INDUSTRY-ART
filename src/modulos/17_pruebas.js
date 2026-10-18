/* ==== módulo: pruebas ==== */
// Bot de partidas: juega solo con tres estrategias (prudente, normal, agresiva), desde 1900 y desde 2000 hasta
// 2150 con semillas fijas, y revisa las metas de balance, los errores, el tiempo por semana y el tamaño del
// guardado. Desde la V17 crea sus obras con la fábrica de ideas (historia, personajes, material, guiones
// comprados, efectos e IA) y hay pruebas de reglas. Ninguna versión se entrega si el bot falla.
IA.pruebas = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, O = IA.obras, T = IA.talentos, L = IA.lanzamiento, NG = IA.negocio, X = IA.taxonomia;

  const ESTRATEGIAS = {
    prudente: { escala: [1, 2], marketing: 2, ambicion: 1.0, colchon: 1.7, construir: 8, pisos: 5 },
    normal: { escala: [2, 2], grande: 0.25, marketing: 2, ambicion: 1.1, colchon: 1.3, construir: 4, pisos: 9 },
    agresiva: { escala: [2, 3], marketing: 3, ambicion: 1.4, colchon: 1.2, construir: 3.5, pisos: 10 },
  };
  const ORDEN_PISOS = ['plato', 'guion', 'edicion', 'plato', 'sonido', 'efectos', 'casting', 'plato', 'marketing', 'archivo'];
  // Registro de cada obra al terminar (las métricas no dependen de lo que la compactación borra después)
  let registro = null;
  N.on('obraTerminada', function (o) {
    if (!registro || o.tv) return; // las metas son de películas (V27): las series van aparte
    const r = { est: o.est, mult: O.multiplicador(o), neto: O.neto(o), talento: O.costoTotal(o) > 0 ? (o.cf || 0) / O.costoTotal(o) : 0 };
    // Cómo se hizo (V19), solo para las obras del jugador
    if (o.est === 0) {
      const l = IA.rodaje.linea(o);
      r.met = o.met || 'mixto'; r.pst = o.pst || 'clasico'; r.set = o.setR ? 1 : 0; r.ext = o.ext ? Object.keys(o.ext).length : 0;
      r.pr = o.prueba ? o.prueba.ok : null; r.dil = o.lp && o.lp.dv ? o.lp.dv.length : 0;
      r.sobre = l && l.plan ? l.real / l.plan - 1 : 0;
    }
    registro.push(r);
  });
  const ORDEN_TERRENOS = ['backlot', 'foso', 't_ciudad', 'captura', 'backlot'];

  // ---------- Decisiones del bot ----------
  // Atractivo comercial de cada familia para el bot (las de crítica rinden menos en taquilla)
  const COMERCIAL = { AA: 0.2, IM: 0.2, SM: 0.05, DR: -0.1, HM: 0.1, FJ: 0.1, AV: -0.5, RD: 0 };
  function elegirFamilia(S) {
    const sem = N.semana(S.t + 20);
    let mejor = 'DR', valor = -9;
    D.ORDEN_FAM.forEach(function (f) {
      const v = (S.mundo.tendencias[f] || 0) + COMERCIAL[f] + 0.8 * (E.pronosticoSemana(sem, f) - 1) + N.azar() * 0.6;
      if (v > valor) { valor = v; mejor = f; }
    });
    return mejor;
  }
  function elegirGeneros(S) {
    const fam = D.familia(elegirFamilia(S));
    const gen = [N.elegir(fam.generos.filter(function (g) { return g !== 'Erótico'; }))];
    // Segundo género de una familia con buen encaje
    const buenas = D.ORDEN_FAM.filter(function (f) { return D.encaje(fam.id, f) >= 3; });
    if (buenas.length && N.probabilidad(0.6)) {
      const f2 = D.familia(N.elegir(buenas));
      const g2 = N.elegir(f2.generos.filter(function (g) { return g !== 'Erótico'; }));
      if (gen.indexOf(g2) < 0 && !O.validarGeneros(gen.concat([g2]))) gen.push(g2);
    }
    return gen;
  }
  // Prueba de público: con un puntaje flojo reedita o regraba; con uno bueno estrena (V19)
  function pruebaBot(o) {
    const p = o.prueba.p, ops = IA.rodaje.opcionesPrueba(o);
    const ok = function (id) { const x = ops.filter(function (q) { return q.id === id; })[0]; return x && !x.no; };
    const holgura = NG.cajaLibre(0) > E.presupuestoTipico(N.anio()) * 3;
    const ed = (IA.rodaje.notas(o).filter(function (n) { return n.dep === 'edicion'; })[0] || { v: 50 }).v;
    if (!holgura) return p < 55 && ed >= 60 ? 'reeditar' : 'estrenar';
    if (p < 50 && ok('regrabar')) return 'regrabar';
    if (p < 62) return ed >= 55 ? 'reeditar' : 'pulir';
    if (p < 70) return 'pulir';
    return 'estrenar';
  }
  function decidir(est) {
    const S = N.S, jug = S.estudios[0];
    const tipico = E.presupuestoTipico(N.anio());
    // 0. Dilemas de rodaje y pruebas de público pendientes (V19)
    IA.juego.decisionesPendientes().forEach(function (o) {
      if (o.dil) IA.juego.decidirDilema(o.id, IA.rodaje.mejorOpcion(o));
      else if (o.prueba && !o.prueba.ok) IA.juego.decidirPrueba(o.id, pruebaBot(o));
    });
    // 0b. Vida del avatar y heredero (V21); personal de oficina cuando sobra caja
    IA.carrera.autoDecidir();
    if ((S.candidatos || []).length) { IA.sede.aceptar(S.candidatos[0].id); S.candidatos = []; }
    if (N.semana() === 30 && NG.cajaLibre(0) > tipico * 8) {
      if (IA.sede.personal().length >= IA.sede.nivelSede().tope && !IA.sede.puedeMejorar()) IA.sede.mejorar();
      else if (!S.recl && IA.sede.personal().length < IA.sede.nivelSede().tope) IA.sede.reclutar('estandar', IA.sede.ROLES[IA.sede.personal().length % IA.sede.ROLES.length].id);
    }
    // 1. Estrenar lo que esté listo en la mejor semana próxima
    O.delEstudio(0, ['lista']).forEach(function (o) {
      if (o.prog) return;
      const nota = o.prueba ? o.prueba.p : o.pub;
      let nivM = S.t < 52 * 3 ? Math.min(est.marketing, 2) : est.marketing; // al principio, campañas medianas
      // Con poca caja o una obra floja, campaña mediana: el dinero de las ventanas tarda en llegar (V20)
      if (nota < 48 || NG.cajaLibre(0) < tipico * 2) nivM = Math.min(nivM, 2);
      while (nivM > 0 && NG.cajaLibre(0) < E.marketingTipico(N.anio()) * D.nivelesMarketing[nivM].mult * 1.2) nivM--;
      const t = L.mejorSemana(o, S.t + 1, S.t + 10);
      // Una obra muy floja va directo a video o a streaming (V20): ahorra la campaña de cines
      const vias = IA.ventanas.viasDirectas(N.anio());
      const plan = nota < 42 && vias.length ? { via: vias[vias.length - 1].id } : null;
      while (nivM >= 0 && IA.juego.programarEstreno(o, t, nivM, plan)) nivM--;
    });
    // Reestreno de un clásico de tu catálogo cuando sobra caja (V20)
    if (N.semana() === 10 && NG.cajaLibre(0) > tipico * 6) {
      const cand = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && !IA.ventanas.puedeReestrenar(o); })
        .sort(function (a, b) { return IA.ventanas.valorReestreno(b, 1) - IA.ventanas.valorReestreno(a, 1); })[0];
      if (cand && IA.ventanas.valorReestreno(cand, 1) > IA.ventanas.costoReestreno(1) * 1.5) IA.ventanas.reestrenar(cand.id, 1);
    }
    // Contrato con una cadena de cines de tu región cuando sobra caja (V20)
    if (N.semana() === 20 && NG.cajaLibre(0) > tipico * 8 && !(jug.cad && jug.cad[jug.reg])) {
      const c = IA.estreno.cadenas(jug.reg).filter(function (x) { return !IA.estreno.puedeFirmar(x.id, 2); }).sort(function (a, b) { return b.salas - a.salas; })[0];
      if (c) IA.estreno.firmar(c.id, 2);
    }
    botTele(est, tipico); // series, canal, plataforma, franquicias y licencias (V23)
    botImperio(est, tipico); // eventos, banco e imperio (V24)
    botMedios(tipico); // música, videojuegos, teatro y libros (V25)
    // Con la caja en rojo no se arriesga más: espera a que entren los ingresos
    if (S.semanasEnRojo > 0) return;
    // 2. Construir cuando sobra caja
    // Los dos primeros años solo construye si le sobra mucho (el colchón vale más que un plató)
    if (NG.cajaLibre(0) > tipico * est.construir * (S.t < 104 ? 2 : 1)) {
      if (jug.pisos.length < Math.min(est.pisos, D.MAX_PISOS)) {
        const sig = ORDEN_PISOS.filter(function (p, i) { return contar(jug.pisos, p) < contar(ORDEN_PISOS.slice(0, i + 1), p); })[0];
        if (sig && !NG.puedeConstruir('piso', sig) && NG.cajaLibre(0) - NG.costoConstruccion(NG.infoPiso(sig)) > tipico * est.construir) NG.construir('piso', sig);
      } else if (jug.terrenos.length < D.MAX_TERRENOS) {
        const sigT = ORDEN_TERRENOS.filter(function (p, i) { return contar(jug.terrenos, p) < contar(ORDEN_TERRENOS.slice(0, i + 1), p); })[0];
        if (sigT && !NG.puedeConstruir('terreno', sigT) && NG.cajaLibre(0) - NG.costoConstruccion(NG.infoTerreno(sigT)) > tipico * est.construir) NG.construir('terreno', sigT);
      }
    }
    // 3. Llenar la capacidad con obras nuevas
    let intentos = 3;
    while (intentos-- > 0 && O.enProduccion(0).length < NG.capacidad(0)) {
      const gen = elegirGeneros(S);
      let escala = N.entero(est.escala[0], est.escala[1]) + (est.grande && N.probabilidad(est.grande) ? 1 : 0);
      if (S.t < 52 * 3) escala = Math.min(escala, 2); // los primeros tres años, sin superproducciones
      let b = null, costo = 0, ok = false;
      const tono = N.elegir(D.tonos).id;
      const idea = ideaDelBot(S, gen);
      // Si no alcanza, baja la escala y después la ambición del equipo
      [S.t < 52 * 3 ? Math.min(est.ambicion, 1.15) : est.ambicion, 0.6].forEach(function (amb) {
        for (let e = escala; e >= 0 && !ok; e--) {
          b = O.borrador(0, Object.assign({ gen: idea.gen || gen, escala: e, tono: tono, completa: true }, idea.campos));
          O.equipoRecomendado(b, amb);
          detallar(b, idea, amb);
          costo = O.costoTalento(b) + b.pp + (b.derechos || 0) + E.marketingTipico(N.anio()) * D.nivelesMarketing[Math.min(2, est.marketing)].mult * 0.5;
          // Guarda plata para la campaña de lo que ya está en marcha: un buen estreno sin marketing se hunde
          const reservaMkt = O.enProduccion(0).length * E.marketingTipico(N.anio()) * D.nivelesMarketing[Math.min(2, est.marketing)].mult * 0.8;
          if (NG.cajaLibre(0) - reservaMkt > costo * (S.t < 52 * 3 ? Math.max(est.colchon, 1.6) : est.colchon)) ok = true;
        }
      });
      if (!ok || !b) break;
      const r = IA.juego.iniciarObra(b);
      if (r.error) { if (registroErrores) registroErrores.push('El bot no pudo iniciar una obra en ' + N.anio() + ': ' + r.error); break; }
    }
  }
  // V25: un proyecto a la vez en cada medio, bandas, giras, kits, motores, DLC, traducciones y teatro grabado
  function botMedios(tipico) {
    const S = N.S, Md = IA.medios, anio = N.anio();
    if (N.semana() % 4 !== 3 || NG.cajaLibre(0) < tipico * 2) return;
    if (Md.disponible('musica') && !Md.bandas().filter(function (b) { return !b.sep; }).length) {
      const ids = IA.talentos.disponibles('interprete', 0).sort(function (a, b) { return Md.habMedio(b, 'musica') - Md.habMedio(a, 'musica'); }).slice(0, N.probabilidad(0.5) ? 1 : 3).map(function (t) { return t.id; });
      Md.firmarBanda('', ids, ids.length === 1 ? 'solista' : 'banda');
    }
    Md.bandas().forEach(function (b) {
      if (b.sep) { Md.reunir(b.id); return; }
      if (N.probabilidad(0.3)) Md.practicar(b.id);
      if (!b.gira && N.probabilidad(0.15)) Md.irDeGira(b.id, NG.cajaLibre(0) > tipico * 10 ? 'nacional' : 'local');
    });
    if (Md.disponible('juegos')) {
      Md.plataformas().sort(function (a, b) { return b.cuota - a.cuota; }).slice(0, 2).forEach(function (p) { if (!p.kit) Md.comprarKit(p.id); });
      if (!Md.motores().length && NG.cajaLibre(0) > tipico * 4) Md.crearMotor('', Md.funcionesDe().map(function (f) { return f.id; }));
      if (Md.ofertasMotor().length && Md.motores().length < 2 && N.probabilidad(0.2)) Md.licenciarMotor(0);
    }
    Md.proyectos().forEach(function (p) {
      if (p.med === 'juegos' && p.et === 'lanzado' && p.pw > 20 && !p.dlc && p.pub >= 60) Md.dlc(p.id);
      if (p.med === 'juegos' && p.et === 'lanzado' && p.pw === 2) Md.soporte(p.id, p.pub >= 55);
      if (p.med === 'libros' && p.et === 'lanzado' && p.pub >= 65 && p.cfg.trad < 6) Md.traducir(p.id);
      if (p.med === 'teatro' && p.et === 'catalogo' && p.pub >= 65 && !p.giro) { p.giro = 1; Md.gira(p.id, 4); }
      if (p.med === 'teatro' && p.et === 'catalogo' && !p.grab) Md.grabar(p.id, S.stream ? 'stream' : 'tv');
    });
    ['musica', 'juegos', 'teatro', 'libros'].forEach(function (med) {
      if (!Md.disponible(med) || Md.enMarcha(med) >= 1) return;
      const op = { esc: NG.cajaLibre(0) > tipico * 15 ? 2 : 1 };
      const fams = Md.familias(med), f = N.elegir(fams);
      if (f) op.gen = N.elegir(f.generos.filter(function (g) { return g !== 'Erótico' && g !== 'Erótica'; }));
      if (med !== 'musica') op.tipo = N.elegir(Md.tipos(med)).id;
      if (med === 'musica') { const b = Md.bandas().filter(function (x) { return !x.sep; })[0]; if (b) op.banda = b.id; else op.tipo = 'jingle'; }
      if (med === 'libros') { const fr = IA.franquicias.lista().filter(function (x) { return x.est === 0; })[0]; if (fr && N.probabilidad(0.3)) op.fr = fr.id; }
      const b = Md.borrador(med, op);
      if (med === 'juegos') { const m = Md.motores()[0]; if (m) { b.cfg.motor = m.id; Md.recalcular(b); } if (anio >= 2017 && N.probabilidad(0.2)) b.cfg.modelo = 'suscripcion'; else if (anio >= 2009 && N.probabilidad(0.25)) b.cfg.modelo = 'gratis'; }
      if (b.costo < NG.cajaLibre(0) * 0.3) Md.iniciar(b);
    });
  }
  // V24: eventos, quiebra, banco, inversiones e imperio
  function botImperio(est, tipico) {
    const S = N.S, B = IA.banco, I = IA.imperio, anio = N.anio();
    IA.eventos.autoDecidir();
    if (S.quiebra) { const ops = B.salidasQuiebra().filter(function (x) { return x.id !== 'terminar' && x.ok !== false; }); if (ops.length) B.salir(ops[ops.length - 1].id); return; }
    // Préstamo si la caja se pone fea y el banco presta; inversiones con lo que sobra
    if (NG.cajaLibre(0) < tipico * 0.3 && B.limite() > tipico && !B.deuda()) B.pedir(Math.min(B.limite(), tipico * 2), 36);
    if (N.semana() === 15 && NG.cajaLibre(0) > tipico * 20) { const c = B.companias(); if (c.length) B.comprarAccion(N.elegir(c).id, Math.round(tipico)); }
    if (N.semana() === 45 && B.deuda() && NG.cajaLibre(0) > tipico * 15) B.prepagar(B.estado().deudas[0].id);
    if (N.semana() === 35 && N.probabilidad(0.3)) { const k = Object.keys(B.estado().acc)[0]; if (k) B.venderAccion(k); }
    if (S.socio && NG.cajaLibre(0) > tipico * 40) B.recomprar();
    if (N.semana() !== 20) return;
    const libre = NG.cajaLibre(0);
    if (libre > tipico * 12 && I.sedes().length < 2) { const p = N.elegir(IA.datos.paises.filter(function (x) { return x.id !== S.estudios[0].pais; })); I.abrirSede(p.id); }
    if (libre > tipico * 25 && I.filiales().length < 2) { const r = IA.rivales.activos().filter(function (e) { return !e.filial && !I.puedeComprar(e.id); }).sort(function (a, b) { return I.precioEstudio(a.id) - I.precioEstudio(b.id); })[0]; if (r && N.probabilidad(0.4)) I.comprarEstudio(r.id); }
    const o = O.enProduccion(0).filter(function (x) { return x.et === 'desarrollo'; })[0];
    if (o && N.probabilidad(0.3)) { const s = I.socios(o)[0]; if (s) I.coproducir(o.id, s.id); }
    if (libre > tipico * 6 && N.probabilidad(0.3)) { const p = I.proyectosAjenos()[0]; if (p) I.financiar(p.id); }
    if (libre > tipico * 8 && N.probabilidad(0.2)) { const r = N.elegir(IA.rivales.activos()); if (r) I.encargar(r.id, N.elegir(IA.datos.familia(r.familia).generos.filter(function (g) { return g !== 'Erótico'; })), 1); }
    if (I.ofertasEncargo().length && !S.encargoPend && N.probabilidad(0.4)) I.aceptarEncargo(I.ofertasEncargo()[0].id);
    if (libre > tipico * 10 && !I.distribuciones().length && N.probabilidad(0.3)) { const r = N.elegir(IA.rivales.activos()); if (r) I.firmarDistribucion(r.id, 2); }
    if (!I.investigando() && libre > tipico * 5) { const x = IA.historia.INVENTOS.filter(function (y) { return I.estadoInvento(y) === 'investigable'; })[0]; if (x) I.investigar(x.id); }
    const lic = IA.historia.INVENTOS.filter(function (y) { return I.estadoInvento(y) === 'rival'; })[0];
    if (lic && libre > tipico * 4) I.licenciarTec(lic.id);
    if (anio >= 1950 && libre > tipico * 4) I.organizarEvento(o ? o.id : null);
    ['tienda', 'museo', 'animacion', 'cafeteria', 'laboratorio'].forEach(function (id) { const inf = I.info(id); if (inf && !I.tiene(id) && libre > tipico * 10 && !NG.puedeConstruir('piso', id)) NG.construir('piso', id); });
    if (!I.tiene('parque') && libre > tipico * 20 && !NG.puedeConstruir('terreno', 'parque')) NG.construir('terreno', 'parque');
  }
  // V23: lo que haría un jugador con la televisión, el streaming y sus franquicias
  function botTele(est, tipico) {
    const S = N.S, anio = N.anio(), TV = IA.tv, ST = IA.streaming, F = IA.franquicias;
    (S.pilotos || []).filter(function (p) { return p.nota !== undefined; }).forEach(function (p) {
      if (p.nota >= 55 && O.enProduccion(0).length < NG.capacidad(0) && !TV.ordenarTemporada(p.id).error) return;
      TV.descartarPiloto(p.id);
    });
    O.delEstudio(0, ['lista']).forEach(function (o) {
      if (!o.tv) return;
      const ops = TV.opcionesEmision(o).map(function (x) { return x.id; });
      const d = o.pitch ? o.pitch.c : ops.indexOf('stream') >= 0 ? 'stream' : ops.indexOf('canal') >= 0 ? 'canal' : 'cable';
      TV.emitir(o.id, d, { completa: o.id % 2 === 0 });
    });
    S.obras.forEach(function (o) {
      if (o.est !== 0 || !o.tv || o.tv.ren !== 'pendiente') return;
      if ((o.tv.q || 0) >= 58 && O.enProduccion(0).length < NG.capacidad(0) && NG.cajaLibre(0) > (o.gp || 0) * 1.5) {
        const r = TV.renovar(o.id);
        if (!r.error && IA.juego.iniciarObra(r.b).error) o.tv.ren = 'cancelada';
      } else TV.cancelar(o.id);
    });
    if (S.canal) {
      if (S.canal.ofPat.length && S.canal.pat.length < 3) TV.aceptarPatrocinio(S.canal.ofPat[0].id);
      if (S.canal.ofNot.length && NG.cajaLibre(0) > tipico * 3 && N.probabilidad(0.3)) TV.comprarNoticia(S.canal.ofNot[0].id);
      if (N.semana() % 4 === 0) TV.autocompletar(true);
    } else if (anio >= 1952 && N.semana() === 26 && NG.cajaLibre(0) > tipico * 10) TV.comprarCanal('', 'DR');
    if (S.stream) {
      if (N.semana() % 4 === 1) {
        S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && S.t - o.fe < 8; }).forEach(function (o) { ST.agregar(o.id, 'propio'); });
        if (S.stream.ofLic.length && NG.cajaLibre(0) > tipico * 4) ST.licenciar(0, N.probabilidad(0.5) ? 'temporal' : 'exclusiva', N.probabilidad(0.3) ? S.stream.ofLic[0].p * 0.8 : 0);
        if (!S.stream.lineas.length) ST.contratarLinea('anim');
        if (S.stream.cat.length >= S.stream.cap - 2 && NG.cajaLibre(0) > tipico * 3) ST.comprarBoveda();
      }
    } else if (ST.puede() && N.semana() === 30 && NG.cajaLibre(0) > tipico * 12) ST.lanzar('');
    // Licencias del personaje más popular de tu mejor franquicia
    if (N.semana() === 40) {
      const f = F.lista().filter(function (x) { return x.est === 0 && x.pers.length; }).sort(function (a, b) { return F.valor(b) - F.valor(a); })[0];
      const pr = F.productos(anio);
      if (f && pr.length) F.licenciar(f.id, f.pers[0].k, pr[N.entero(0, pr.length - 1)].id, N.probabilidad(0.7));
    }
    if (S.ofFr && S.ofFr.length && N.probabilidad(0.2)) F.aceptarOferta(0);
    // Una vez al mes: continuar un éxito o producir una serie
    if (N.semana() % 4 !== 2 || S.semanasEnRojo > 0 || O.enProduccion(0).length >= NG.capacidad(0)) return;
    const exito = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && o.pub >= 64 && S.t - o.fe < 52 * 5 && !o.cont2; }).sort(function (a, b) { return b.pub - a.pub; })[0];
    let b = null;
    if (exito && N.probabilidad(0.35)) {
      exito.cont2 = 1;
      const f = F.de(exito), cam = f && f.fat > 0.5 ? 'reboot' : N.elegir(['secuela', 'secuela', 'precuela', 'spinoff', 'softreboot']);
      const r = F.continuar(exito.id, cam, TV.puedeTV(anio) && anio >= 1952 && N.probabilidad(0.3) ? 'tv' : 'cine');
      if (!r.error) b = r.b;
    } else if (anio >= 1952 && N.probabilidad(0.25)) {
      b = O.borrador(0, { gen: elegirGeneros(S), escala: 1, completa: true });
      const fs = TV.formatosDe(anio);
      const fsF = fs.filter(function (f) { return !f.vivo; });
      TV.aplicar(b, { fmt: N.elegir(fsF.length ? fsF : fs).id });
      if (!(b.prob && b.prob.length)) IA.ideas.recomendarHistoria(b, anio);
      IA.ideas.generarPersonajes(b);
      O.equipoRecomendado(b, est.ambicion);
      O.recalcular(b);
      const cs = TV.compradores(anio);
      if (cs.length && N.probabilidad(0.3)) TV.pitch(b, cs[0].id);
      if (!b.pitch && N.probabilidad(0.3) && NG.cajaLibre(0) > (b.pp + O.costoTalento(b)) * 1.6) { TV.rodarPiloto(b); return; }
    }
    if (!b) return;
    if (NG.cajaLibre(0) < (b.pp + O.costoTalento(b)) * 1.6) return;
    const r = IA.juego.iniciarObra(b);
    if (r.error && registroErrores && !/disponible|equipo|exige|firma|realidad/.test(r.error)) registroErrores.push('Bot V23 en ' + anio + ': ' + r.error);
  }
  function contar(lista, x) { let c = 0; lista.forEach(function (y) { if (y === x) c++; }); return c; }
  // La idea del bot (V17): a veces adapta un material, a veces produce un guion comprado, y si no, una idea propia
  function ideaDelBot(S, gen) {
    const anio = N.anio();
    const r = { campos: {} };
    if ((S.guionesPropios || []).length) {
      const g = S.guionesPropios[0];
      r.gen = g.idea.gen; r.guion = g;
      return r;
    }
    // Solo compra guiones o derechos con la caja holgada (nunca en los primeros años)
    const holgado = NG.cajaLibre(0) > E.presupuestoTipico(anio) * 4;
    const guiones = (S.guiones || []).filter(function (g) { return g.calif >= 70 && g.precio < NG.cajaLibre(0) * 0.05; });
    if (holgado && guiones.length && N.probabilidad(0.25)) {
      if (!IA.juego.comprarGuion(guiones[0].id)) { r.gen = guiones[0].idea.gen; r.guion = guiones[0]; return r; }
    }
    if (N.probabilidad(0.1)) {
      const libres = IA.ideas.materialesDisponibles(anio).filter(function (m) { return IA.ideas.esLibre(m, anio) || (holgado && IA.ideas.costoDerechos(m, anio) < NG.cajaLibre(0) * 0.03); });
      if (libres.length) { r.mat = N.elegir(libres).id; return r; }
    }
    return r;
  }
  // Completa la historia, los personajes y algunas decisiones del modo detallado
  function detallar(b, idea, amb) {
    const anio = N.anio();
    if (idea.mat) IA.ideas.usarMaterial(b, idea.mat, anio);
    if (idea.guion) {
      IA.ideas.aplicarIdea(b, idea.guion.idea);
      b.guionC = idea.guion.calif; b.guionId = idea.guion.id;
      if (T.disponible(T.porId(idea.guion.autor))) { b.eq.guion = idea.guion.autor; b.guionPagado = 1; }
    }
    if (!(b.prob && b.prob.length)) {
      const tit = b.tit, epo = b.epo;
      IA.ideas.recomendarHistoria(b, anio);
      if (idea.mat) { b.tit = tit; b.epo = epo; }
    }
    if (!b.arco) b.arco = IA.ideas.arcoRecomendado(b.fam);
    IA.ideas.generarPersonajes(b);
    const dir = T.porId(b.eq.direccion), arte = T.porId(b.eq.arte);
    // Efectos grandes solo si el equipo da la talla; IA solo si el equipo creativo es bueno
    // (un estudio bien llevado no se juega la caja en efectos grandes hasta tener colchón)
    const holgura = NG.cajaLibre(0) > E.presupuestoTipico(anio) * 5;
    if (holgura && (b.fam === 'AA' || b.fam === 'IM') && dir && arte && (dir.hab + arte.hab) / 2 >= 64 && N.probabilidad(0.4) && X.efectos[3].desde <= anio) b.fx = 3;
    if (anio >= IA.ideas.ANIO_IA && IA.ideas.equipoCreativo(b) >= 62 && N.probabilidad(0.3)) b.ia = N.entero(10, 40);
    if (N.probabilidad(0.2)) b.cx = N.entero(1, 4);
    if (N.probabilidad(0.2)) b.rit = N.entero(1, 4);
    // Cómo se filma (V19): el método y el terreno recomendados, a veces un estilo propio y, si hay, un set guardado
    const R = IA.rodaje;
    b.met = R.metodoRecomendado(b, anio);
    b.ter = R.terrenoRecomendado(b);
    if ((b.fam === 'AA' || b.fam === 'IM') && b.presM >= 1.5 && anio >= 1915 && N.probabilidad(0.3)) b.pst = 'espectaculo';
    else if (b.fam === 'SM' && anio >= 1999 && N.probabilidad(0.15)) b.pst = 'found';
    else if (b.fam === 'AV' && anio >= 1950 && N.probabilidad(0.3)) b.pst = 'contemplativo';
    else if (b.fam === 'DR' && anio >= 1922 && N.probabilidad(0.15)) b.pst = 'documental';
    const sets = R.usaSet(b) ? R.setsQueSirven(b) : [];
    if (sets.length && sets[0].q >= 50) b.setR = sets[0].id;
    O.recalcular(b);
    // Todo el elenco con nombre se contrata y se negocia (V18), ya con la clasificación final
    O.equipoNegociado(b, amb);
    O.recalcular(b);
    return b;
  }
  let registroErrores = null;

  // ---------- Revisión de errores (invariantes) ----------
  function revisar(errores) {
    const S = N.S;
    S.estudios.forEach(function (e) { if (!isFinite(e.caja)) errores.push('Caja no finita en ' + e.nombre + ' (' + N.anio() + ')'); });
    S.obras.forEach(function (o) {
      if (o.bruto !== undefined && !isFinite(o.bruto)) errores.push('Bruto no finito en obra ' + o.id);
      if (o.et === 'cartelera' && !isFinite(o.u)) errores.push('Atractivo no finito en obra ' + o.id);
    });
    if (!(IA.mundo.poblacionMundial(N.anio()) > 0)) errores.push('Población no positiva en ' + N.anio());
    // Reglas de la fábrica de ideas en las obras del jugador
    O.activas().forEach(function (o) {
      if (o.est !== 0 || !o.cont) return;
      if (IA.ideas.clasificar(o, o.anioPlan) !== o.clas) errores.push('La clasificación de «' + o.tit + '» no sale de su contenido');
      if (o.gen.indexOf('Erótico') >= 0 && ((o.pj || []).some(function (p) { return p.e < 18; }) || ['18', 'R', 'X'].indexOf(o.clas) < 0)) errores.push('Regla del Erótico rota en «' + o.tit + '»');
      if (IA.ideas.hayMenores(o) && o.cont.amor > 1) errores.push('Contenido no permitido con menores en «' + o.tit + '»');
      // V19: decisiones que no se quedan colgadas y cuentas que cuadran
      if (o.dil && S.t - o.dil.t > 3) errores.push('Dilema sin resolver en «' + o.tit + '»');
      if (o.prueba && !o.prueba.ok && S.t - o.prueba.t > 4) errores.push('Prueba de público sin resolver en «' + o.tit + '»');
      if (o.lp && !isFinite(IA.rodaje.linea(o).real)) errores.push('Costo real no finito en «' + o.tit + '»');
      if (IA.ideas.hayNinos(o) && IA.taxonomia.ORDEN_CLAS.indexOf(o.clas) > 2) errores.push('Obra de más de PG-13 con niños en el elenco: «' + o.tit + '»');
    });
    if (errores.length > 50) errores.length = 50;
  }

  // ---------- Una partida completa ----------
  // op: { estrategia, desde, hasta, semilla, medirGuardado: fn(S) -> bytes (opcional) }
  function jugar(op) {
    const est = ESTRATEGIAS[op.estrategia];
    const errores = [];
    const reloj = typeof performance !== 'undefined' ? function () { return performance.now(); } : function () { return Date.now(); };
    registro = [];
    registroErrores = errores;
    IA.juego.nuevaPartida({ semilla: op.semilla, anio: op.desde, nombre: 'Bot ' + op.estrategia, bot: true });
    const S = N.S;
    const semanas = (op.hasta - op.desde) * 52;
    let peorSemana = 0, totalMs = 0, anioMs = 0, peorAnio = 0, guardado150 = null;
    const tiemposAnio = [];
    for (let i = 0; i < semanas; i++) {
      const a = reloj();
      try {
        decidir(est);
        IA.juego.avanzarSemana();
      } catch (e) {
        errores.push('Excepción en ' + N.anio() + ' S' + N.semana() + ': ' + (e && e.message ? e.message : e));
        if (errores.length > 5) break;
      }
      const dt = reloj() - a;
      totalMs += dt; anioMs += dt;
      if (dt > peorSemana) peorSemana = dt;
      if (S.t % 52 === 0) {
        tiemposAnio.push(anioMs);
        if (anioMs > peorAnio) peorAnio = anioMs;
        anioMs = 0;
        revisar(errores);
        if (op.medirGuardado && N.anio() - op.desde === 150) guardado150 = op.medirGuardado(S);
      }
      if (S.quiebra) {
        errores.push('Quiebra del bot en ' + S.quiebra.anio + ' (no es un error del juego, pero la estrategia no debería quebrar)');
        break;
      }
    }
    const guardadoFinal = op.medirGuardado ? op.medirGuardado(S) : null;
    registroErrores = null;
    return medir(op, errores, { msSemana: totalMs / Math.max(1, S.t), peorSemana: peorSemana, sAnio: (totalMs / Math.max(1, tiemposAnio.length)) / 1000, peorAnio: peorAnio / 1000, guardado150: guardado150, guardadoFinal: guardadoFinal });
  }
  function mediana(v) {
    if (!v.length) return 0;
    const s = v.slice().sort(function (a, b) { return a - b; });
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  // ---------- Metas de balance ----------
  function medir(op, errores, rend) {
    const S = N.S;
    const terminadas = (registro || []).filter(function (r) { return isFinite(r.mult) && r.mult > 0; });
    const produccion = resumenProduccion(); // antes de soltar el registro
    registro = null;
    const mults = terminadas.map(function (r) { return r.mult; });
    const pierden = terminadas.filter(function (r) { return r.neto < 0; }).length;
    const jug = terminadas.filter(function (r) { return r.est === 0; });
    const multJug = jug.map(function (r) { return r.mult; });
    const hist = S.fin.hist;
    // Crecimiento real de la caja (dólares de hoy): tasa anual compuesta entre el año 10 y el año 40 de la
    // partida, ya pasado el arranque (el primer decenio parte de casi nada y siempre da tasas enormes).
    function tasa(desdeK, hastaK) {
      if (hist.length <= hastaK) hastaK = hist.length - 1;
      if (hastaK - desdeK < 3) return 0;
      const c0 = desdeK < 0 ? Math.max(1, S.estudios[0].capital2025) : Math.max(1, hist[desdeK].caja2025);
      const c1 = Math.max(1, hist[hastaK].caja2025);
      return Math.pow(c1 / c0, 1 / (hastaK - desdeK)) - 1;
    }
    const crec30 = tasa(9, 39);
    const cuotas = hist.map(function (h) { return h.cuota; });
    const premios = IA.premios.parteJugador();
    const res = {
      estrategia: op.estrategia, desde: op.desde, hasta: op.hasta, semilla: op.semilla,
      obras: terminadas.length, obrasJugador: jug.length,
      multMediano: mediana(mults), sobre5: mults.filter(function (m) { return m > 5; }).length / Math.max(1, mults.length),
      pierden: pierden / Math.max(1, terminadas.length),
      multMedianoJugador: mediana(multJug),
      pierdenJugador: jug.filter(function (r) { return r.neto < 0; }).length / Math.max(1, jug.length),
      crecimiento30: crec30, crecimientoArranque: tasa(-1, 9), crecimientoTotal: tasa(9, hist.length - 1),
      crecimientoMediano: mediana(hist.slice(1).map(function (h, i) { return hist[i].caja2025 > 0 ? h.caja2025 / hist[i].caja2025 - 1 : 0; })),
      premiosJugador: premios.parte, premiosTotal: premios.total,
      aniosAMajor: S.majorDesde ? S.majorDesde - op.desde : null,
      cuotaMax: cuotas.length ? Math.max.apply(null, cuotas) : 0,
      cuotaMedia: cuotas.length ? cuotas.reduce(function (a, b) { return a + b; }, 0) / cuotas.length : 0,
      cajaFinal2025: hist.length ? hist[hist.length - 1].caja2025 : 0,
      investigaciones: S.investigaciones, quiebra: S.quiebra ? S.quiebra.anio : null,
      rescatesRivales: S.estudios.slice(1).reduce(function (a, e) { return a + e.rescates; }, 0),
      ideas: resumenIdeas(S), produccion: produccion, lanzamiento: resumenLanzamiento(S),
      talentos: resumenTalentos(S, terminadas),
      errores: errores, rendimiento: rend,
    };
    return res;
  }
  const METAS = [
    { id: 'multMediano', nombre: 'Multiplicador mediano', objetivo: '×1,5 a ×2,5', ok: function (r) { return r.multMediano >= 1.5 && r.multMediano <= 2.5; }, ver: function (r) { return '×' + r.multMediano.toFixed(2); } },
    { id: 'sobre5', nombre: 'Obras sobre ×5', objetivo: '5 % o menos', ok: function (r) { return r.sobre5 <= 0.05; }, ver: function (r) { return pct(r.sobre5); } },
    { id: 'pierden', nombre: 'Obras que pierden', objetivo: '30 % a 45 %', ok: function (r) { return r.pierden >= 0.3 && r.pierden <= 0.45; }, ver: function (r) { return pct(r.pierden); } },
    { id: 'crecimiento30', nombre: 'Crecimiento real de la caja', objetivo: '5 % a 20 % al año', ok: function (r) { return r.crecimiento30 >= 0.05 && r.crecimiento30 <= 0.2; }, ver: function (r) { return pct(r.crecimiento30); } },
    { id: 'premiosJugador', nombre: 'Premios principales del jugador', objetivo: '30 % o menos', ok: function (r) { return r.premiosJugador <= 0.3; }, ver: function (r) { return pct(r.premiosJugador); } },
    { id: 'aniosAMajor', nombre: 'Años de independiente a major', objetivo: '15 a 30', ok: function (r) { return r.aniosAMajor !== null && r.aniosAMajor >= 15 && r.aniosAMajor <= 30; }, ver: function (r) { return r.aniosAMajor === null ? 'nunca' : String(r.aniosAMajor); } },
    { id: 'cuotaMax', nombre: 'Cuota de mercado', objetivo: 'menos de 35 %', ok: function (r) { return r.cuotaMax < 0.35; }, ver: function (r) { return pct(r.cuotaMax) + ' máx.'; } },
  ];
  function pct(x) { return (Math.round(x * 1000) / 10).toString().replace('.', ',') + ' %'; }
  // Talentos 2.0: parte del costo que se va en talento, estrellas raras y nadie perfecto
  function resumenTalentos(S, terminadas) {
    const vivos = S.talentos.filter(function (t) { return !t.ret && !t.mu; });
    return {
      parteTalento: mediana(terminadas.map(function (r) { return r.talento; })),
      sobre90: vivos.filter(function (t) { return t.hab >= 90; }).length / Math.max(1, vivos.length),
      perfectos: S.talentos.filter(function (t) { return t.hab >= 99 && t.cp && t.cp.every(function (x) { return x >= 99; }); }).length,
      vivos: vivos.length, ninos: vivos.filter(function (t) { return N.anio() - t.nac < 16; }).length,
      exclusivos: vivos.filter(function (t) { return T.exclusivoDe(t) !== null; }).length,
      relaciones: vivos.filter(function (t) { return t.rel && Object.keys(t.rel).length; }).length,
      parejas: vivos.filter(function (t) { return Object.keys(t.rel || {}).some(function (k) { const o = T.porId(+k); return o && T.tipoRelacion(t.rel[k], t, o) === 'pareja'; }); }).length,
      retiroMin: S.talentos.filter(function (t) { return t.ret && !t.mu; }).reduce(function (m, t) { return Math.min(m, t.ret - t.nac); }, 999),
    };
  }
  // Qué usó el bot de la fábrica de ideas (para el informe)
  // Qué usó el bot de la producción (V19)
  function resumenProduccion() {
    const mias = (registro || []).filter(function (r) { return r.est === 0 && r.met; });
    const contar = function (k) { return mias.reduce(function (a, r) { if (r[k]) a[r[k]] = (a[r[k]] || 0) + 1; return a; }, {}); };
    const sob = mias.map(function (r) { return r.sobre; }).sort(function (a, b) { return a - b; });
    return {
      obras: mias.length, metodos: contar('met'), estilos: contar('pst'), pruebas: contar('pr'),
      sets: mias.filter(function (r) { return r.set; }).length, externos: mias.filter(function (r) { return r.ext; }).length,
      dilemas: mias.reduce(function (a, r) { return a + (r.dil || 0); }, 0), sobrecosto: sob.length ? sob[Math.floor(sob.length / 2)] : 0,
    };
  }
  // Lanzamiento (V20): estrenos directos, certificaciones, reestrenos y cuánto llega por las ventanas
  function resumenLanzamiento(S) {
    const mias = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada'; });
    const c = function (f) { return mias.filter(f).length; };
    let vt = 0, tot = 0;
    mias.forEach(function (o) { vt += o.vt ? o.vt.total : 0; tot += O.ingresosTotales(o); });
    return {
      obras: mias.length, directos: c(function (o) { return o.dir; }), oro: c(function (o) { return o.cert === 'oro'; }), platino: c(function (o) { return o.cert === 'platino'; }),
      diamante: c(function (o) { return o.cert === 'diamante'; }), reestrenos: mias.reduce(function (a, o) { return a + (o.re || 0); }, 0), parteVentanas: tot > 0 ? vt / tot : 0,
      promos: mias.filter(function (o) { return o.plan && o.plan.promo && o.plan.promo.length; }).length,
    };
  }
  function resumenIdeas(S) {
    const mias = S.obras.filter(function (o) { return o.est === 0; });
    const c = function (f) { return mias.filter(f).length; };
    return {
      obras: mias.length, material: c(function (o) { return o.mat; }), guion: c(function (o) { return o.guionC; }),
      ia: c(function (o) { return o.ia; }), efectos: c(function (o) { return o.fx >= 3; }),
      aplaudidos: c(function (o) { return o.fxr === 'aplaudidos'; }), repudiados: c(function (o) { return o.fxr === 'repudiados'; }),
      clasificaciones: mias.reduce(function (a, o) { a[o.clas] = (a[o.clas] || 0) + 1; return a; }, {}),
      adaptacionesRivales: S.obras.filter(function (o) { return o.est !== 0 && o.mat; }).length,
    };
  }

  // ---------- Pruebas de reglas (plan: clasificación, dominio público, Erótico, inflación y población) ----------
  function reglas() {
    const X = IA.taxonomia, I = IA.ideas, M = IA.mundo;
    const r = [];
    const prueba = function (nombre, ok, detalle) { r.push({ nombre: nombre, ok: !!ok, detalle: detalle || '' }); };
    const idea = function (gen, cont, extra) { return Object.assign({ gen: gen, cont: Object.assign({ violencia: 0, lenguaje: 0, amor: 0, consumo: 0, terror: 0 }, cont) }, extra || {}); };
    // Clasificación desde el contenido
    prueba('Contenido nulo da G', I.clasificar(idea(['Drama'], {}), 2000) === 'G');
    prueba('Violencia leve da PG', I.clasificar(idea(['Drama'], { violencia: 1 }), 2000) === 'PG');
    prueba('Violencia moderada da PG-13', I.clasificar(idea(['Acción'], { violencia: 2 }), 2000) === 'PG-13');
    prueba('Lenguaje rudo da 16', I.clasificar(idea(['Drama'], { lenguaje: 2 }), 2000) === '16');
    prueba('Amor candente da NC-17 (17 años)', I.clasificar(idea(['Romance'], { amor: 3 }), 2000) === 'NC-17');
    prueba('Violencia gráfica da 18', I.clasificar(idea(['Terror'], { violencia: 4 }), 2000) === '18');
    prueba('Violencia sangrienta da R', I.clasificar(idea(['Terror'], { violencia: 5 }), 2000) === 'R');
    prueba('Amor explícito da X', I.clasificar(idea(['Romance'], { amor: 4 }), 2000) === 'X');
    prueba('La parte más fuerte manda', I.clasificar(idea(['Drama'], { violencia: 1, lenguaje: 3, terror: 2 }), 2000) === 'NC-17');
    prueba('Contenido moderado puede ir como N', I.clasificar(idea(['Experimental'], { lenguaje: 1 }, { clasN: true }), 2000) === 'N');
    prueba('N no admite contenido fuerte', I.clasificar(idea(['Experimental'], { lenguaje: 2 }, { clasN: true }), 2000) === '16');
    prueba('Lo de adultos dice «siempre sugerido»', I.describirContenido(idea(['Drama'], { amor: 4 })).indexOf('explícito, siempre sugerido') >= 0);
    // Censura de la época
    const b1950 = idea(['Terror'], { violencia: 6, amor: 4 });
    I.normalizar(b1950, 1950);
    prueba('Antes de 1968 la censura limita a 16', b1950.clas === '16' && I.clasificar(b1950, 1950) === '16', b1950.clas);
    prueba('Gore sube la clasificación a R', (function () { const b = idea(['Terror'], {}, { sub: ['Gore'] }); I.normalizar(b, 2000); return b.clas === 'R'; })());
    // Regla del Erótico
    prueba('Erótico es siempre de adultos', ['18', 'R', 'X'].indexOf(I.clasificar(idea(['Erótico'], {}), 2000)) >= 0);
    prueba('Erótico no existe antes de 1968', !!O.validarGeneros(['Erótico'], 1960));
    prueba('Erótico nunca con familia y juventud', !!O.validarGeneros(['Erótico', 'Familiar'], 2000));
    prueba('Erótico nunca con públicos infantiles', !!I.validar(idea(['Erótico'], { amor: 3 }, { pubs: ['Adolescentes'] }), 2000));
    prueba('Erótico solo con personajes adultos', !!I.validar(idea(['Erótico'], { amor: 3 }, { pj: [{ n: 'A', e: 16, s: 'F', i: 'protagonista', a: 'Amante' }], prob: ['Amor'], arco: 'pozo', nat: 'f', tipo: 'real' }), 2000));
    prueba('Con menores el amor no pasa de romántico', (function () { const b = idea(['Drama'], { amor: 4 }, { pj: [{ n: 'A', e: 14, s: 'F', i: 'protagonista', a: 'Héroe' }] }); I.normalizar(b, 2000); return b.cont.amor <= 1; })());
    prueba('Con niños en el elenco la obra no pasa de PG-13', (function () { const b = idea(['Terror'], { violencia: 5, lenguaje: 4, terror: 4 }, { pj: [{ n: 'A', e: 12, s: 'M', i: 'protagonista', a: 'Héroe' }] }); I.normalizar(b, 2000); return IA.taxonomia.ORDEN_CLAS.indexOf(b.clas) <= 2; })());
    // Dominio público: vida del autor + 70
    const dracula = X.dominio.filter(function (m) { return m.tit === 'Drácula'; })[0];
    prueba('Drácula no es libre en 1982', !I.esLibre(dracula, 1982));
    prueba('Drácula es libre desde 1983', I.esLibre(dracula, 1983));
    prueba('Comprar los derechos antes de liberarse cuesta', I.costoDerechos(dracula, 1950) > 0 && I.costoDerechos(dracula, 1990) === 0);
    prueba('La Odisea es libre siempre', I.esLibre(X.dominio[0], 1850));
    prueba('Hay 82 obras de dominio público', X.dominio.length === 82, X.dominio.length);
    const libre = dracula.libre - 70 + 50;
    prueba('La regla es ajustable (vida + 50 libera antes)', (function () { const S = N.S, antes = S ? S.reglaDominio : 0; if (S) S.reglaDominio = 50; const ok = I.esLibre(dracula, libre) && !I.esLibre(dracula, libre - 1); if (S) S.reglaDominio = antes || 70; return ok; })());
    // Inflación y población contra las tablas del plan
    prueba('Inflación: ida y vuelta a dólares de hoy', Math.abs(M.aHoy(M.aEpoca(1000, 1930), 1930) - 1000) < 1);
    prueba('Inflación: un dólar de 1900 vale más de 25 de hoy', M.aHoy(1, 1900) > 25 && M.aHoy(1, 1900) < 45, M.aHoy(1, 1900).toFixed(1));
    const p = function (a) { return M.poblacionMundial(a) / 1e9; };
    prueba('Población 1900 ≈ 1.650 millones', Math.abs(p(1900) - 1.65) < 0.15, p(1900).toFixed(2));
    prueba('Población 2000 ≈ 6.150 millones', Math.abs(p(2000) - 6.15) < 0.3, p(2000).toFixed(2));
    prueba('Población 2024 ≈ 8.100 millones', Math.abs(p(2024) - 8.1) < 0.3, p(2024).toFixed(2));
    // Listas completas
    const cnt = X.contar();
    prueba('Listas completas: 227 temas, 86 subgéneros (con Western espacial), 53 problemáticas, 34 ficciones', cnt.temas === 227 && cnt.subgeneros === 86 && cnt.problematicas === 53 && cnt.ficcion === 34, JSON.stringify(cnt));
    // ---------- Talentos 2.0 (V18) ----------
    if (N.S) {
      const S = N.S, vivos = S.talentos.filter(function (t) { return !t.ret; });
      prueba('Más de 1.000 talentos vivos', vivos.length >= 1000, vivos.length);
      prueba('Nadie tiene todo en 100', !S.talentos.some(function (t) { return t.cp && t.cp.every(function (x) { return x >= 95; }); }));
      const s90 = vivos.filter(function (t) { return t.hab >= 90; }).length / vivos.length;
      prueba('Un 90 o más es raro (3 % o menos)', s90 <= 0.03, (s90 * 100).toFixed(1) + ' %');
      const libre = vivos.filter(function (t) { return T.disponible(t, 0) && T.energia(t) === 100 && !t.act; })[0];
      if (libre) {
        const copia = JSON.parse(JSON.stringify(libre));
        T.ocupar([libre.id], S.t + 10);
        const tras = T.energia(libre), act = libre.act;
        libre.enT = S.t - 9; // dos meses después
        const recupera = T.energia(libre);
        Object.keys(copia).forEach(function (k) { libre[k] = copia[k]; });
        Object.keys(libre).forEach(function (k) { if (!(k in copia)) delete libre[k]; });
        prueba('Un cargo cuesta 20 de energía y se recuperan 10 al mes', tras === 80 && recupera === 100 && act === 1, tras + ' → ' + recupera);
      }
      const ocupadoX = vivos.filter(function (t) { return (t.act || 0) > T.MAX_PROYECTOS; }).length;
      prueba('Nadie trabaja en más de 2 proyectos a la vez', ocupadoX === 0, ocupadoX);
      prueba('Nadie se retira antes de los 70', !S.talentos.some(function (t) { return t.ret && !t.mu && t.ret - t.nac < 70; }));
      const nino = vivos.filter(function (t) { return N.anio() - t.nac < 16; })[0];
      if (nino) prueba('Los niños actores solo hacen obras hasta PG-13', nino.cmax <= 2 && T.negociar(nino, { est: 0, rol: 'interprete', imp: 'secundario', clas: 3 }).estado === 'rechaza');
      const estrella = vivos.filter(function (t) { return t.fama >= 0.8 && t.hab >= 70; })[0];
      if (estrella) { const f0 = S.estudios[0].fama; S.estudios[0].fama = 0.01; prueba('Una estrella rechaza a un estudio sin fama', T.negociar(estrella, { est: 0, rol: estrella.of }).estado === 'rechaza'); S.estudios[0].fama = f0; }
      prueba('Con porcentaje, el salario fijo baja', T.salarioCon(1000, 10) === 780 && T.salarioCon(1000, 0) === 1000);
      const x = vivos[0];
      prueba('El salario exclusivo sigue a la época (1,8 veces la tarifa)', T.salarioExclusivo(x) === Math.round(T.tarifa(x) * 1.8));
      const tr = E.tarifa(x, 1920), tr2 = E.tarifa(x, 2020);
      prueba('Las tarifas suben con la época, no con el presupuesto de la obra', tr2 > tr * 5, Math.round(tr) + ' → ' + Math.round(tr2));
      prueba('La academia no pasa de +5 por oficio', (function () { const t = { hab: 40, of: 'guion', ac: { guion: 5 }, af: [0, 0, 0, 0, 0, 0, 0, 0], en: 100, enT: S.t, act: 0 }; return /\+5/.test(T.puedeEstudiar(t, T.curso('taller'), 'guion')); })());
    }
    // V19 · Cine a fondo
    const R = IA.rodaje, S = N.S;
    prueba('Las notas de los departamentos van de F a A+', R.letra(95) === 'A+' && R.letra(70) === 'B' && R.letra(20) === 'F');
    prueba('El CGI no existe antes de 1973', !R.metodosDisponibles(1960).some(function (m) { return m.id === 'cgi'; }) && R.metodosDisponibles(1980).some(function (m) { return m.id === 'cgi'; }));
    prueba('IMAX y 3D llegan en su año', X.formatos.visual.some(function (f) { return f.id === 'IMAX' && f.desde === 1970; }) && X.formatos.visual.some(function (f) { return f.id === '3D' && f.desde === 1953; }));
    prueba('Los incentivos de Colombia rigen desde 2013', R.incentivo({ rod: 'co' }, 2012) === 0 && R.incentivo({ rod: 'co' }, 2013) > 0);
    if (S && S.estudios) {
      const conAzar = function (fn) { const g = S.rng; const r2 = fn(); S.rng = g; return r2; }; // no gasta el azar de la partida
      const muestra = conAzar(function () { const b = O.borrador(0, { gen: ['Acción'], escala: 2, completa: true }); b.fx = 3; O.recalcular(b); O.equipoRecomendado(b, 1); return b; });
      const id = R.ideal(muestra);
      let suma = 0;
      Object.keys(id).forEach(function (k) { suma += id[k]; });
      prueba('El reparto ideal del presupuesto suma 100 %', Math.abs(suma - 1) < 0.01, Math.round(suma * 100) + ' %');
      const p0 = IA.ideas.pesos(muestra, D.familia(muestra.fam));
      prueba('Vestuario y efectos pesan en la calidad', p0.vestuario > 0 && p0.efectos > 0);
      const quitado = Object.assign({}, muestra, { rep: Object.assign({}, id, { efectos: id.efectos * 0.2, produccion: id.produccion + id.efectos * 0.8 }) });
      prueba('Quitarle presupuesto a un departamento le baja la nota', R.efectoReparto(quitado, 'efectos') < -5);
      const est0 = S.estudios[0];
      est0.sets = est0.sets || [];
      const setPrueba = { id: -77, tipo: R.tipoSet(muestra).id, nombre: 'prueba', q: 70, anio: N.anio(), usos: 0, obra: '-' };
      est0.sets.push(setPrueba);
      const conSet = Object.assign({}, muestra, { met: 'set', setR: -77 }), sinSet = Object.assign({}, muestra, { met: 'set', setR: null });
      prueba('Reusar un set abarata la producción y acorta la preproducción', R.factorCosto(conSet, N.anio()) < R.factorCosto(sinSet, N.anio()) && R.ajusteSemanas(conSet).pre < R.ajusteSemanas(sinSet).pre);
      est0.sets = est0.sets.filter(function (x) { return x.id !== -77; });
      const enDesierto = Object.assign({}, muestra, { met: 'locacion', ter: 'desierto' });
      const terr = est0.terrenos.slice();
      est0.terrenos = terr.filter(function (x) { return x !== 't_desierto'; });
      const costoAjeno = R.factorCosto(enDesierto, N.anio());
      est0.terrenos.push('t_desierto');
      const costoPropio = R.factorCosto(enDesierto, N.anio());
      est0.terrenos = terr;
      prueba('Rodar en un terreno propio es más barato', costoPropio < costoAjeno);
      const anim = conAzar(function () { const b = O.borrador(0, { gen: ['Familiar'], escala: 2, completa: true }); b.tipo = 'animacion'; O.recalcular(b); O.equipoRecomendado(b, 1); return b; });
      const sinAnimar = Object.assign({}, anim, { eq: Object.assign({}, anim.eq, { animacion: null }), ext: {} });
      prueba('Una obra animada necesita quien anime', !O.equipoCompleto(sinAnimar) && O.equipoCompleto(Object.assign({}, sinAnimar, { ext: { animacion: 'local' } })));
      const ctxPrueba = { pagar: function () {} };
      const enPos = N.copiar(muestra);
      Object.assign(enPos, { et: 'posproduccion', sr: 2, dur: { preproduccion: 4, rodaje: 8, posproduccion: 6 }, pub: 60, crit: 60, prueba: { p: 58, t: S.t, com: [] } });
      conAzar(function () { R.decidirPrueba(enPos, 'pulir', ctxPrueba); });
      prueba('Pulir tras la prueba de público suma público y semanas', N.anio() < 1930 || enPos.pub > 60 && enPos.sr === 4 && enPos.prueba.ok === 'pulir');
      const enRodaje = N.copiar(muestra);
      Object.assign(enRodaje, { et: 'rodaje', sr: 3, dur: { preproduccion: 4, rodaje: 8, posproduccion: 6 }, dil: { id: 'escenaClave', t: S.t, n: { d: muestra.eq.direccion } } });
      conAzar(function () { R.decidir(enRodaje, 0, ctxPrueba); });
      prueba('Un dilema de rodaje aplica sus efectos', N.anio() < 1930 || !enRodaje.dil && enRodaje.sr === 5 && enRodaje.dq === 2);
    }
    // V20 · Lanzamiento
    const ES = IA.estreno, V = IA.ventanas;
    prueba('Las festividades suben a su familia en su región', M.bonoRegion('FJ', 'nam', 47, 2000) > 1 && M.bonoRegion('FJ', 'asi', 47, 2000) === 1);
    // Calendario completo (V21): días de la semana reales y festividades con su regla
    const C = IA.cal;
    prueba('El 1 de enero de 1850 fue martes', C.diaSemana(1850, 0, 1) === 1);
    prueba('Pascua de 2024: 31 de marzo', C.pascua(2024).m === 2 && C.pascua(2024).d === 31);
    prueba('Año Nuevo chino de 2024: 10 de febrero (luna nueva)', (function () { const f = C.lunaNuevaDesde(2024, 0, 21, 8); return f.m === 1 && f.d === 10; })());
    prueba('Acción de Gracias de 2024: 28 de noviembre', (function () { const x = C.fiestasAnio(2024).filter(function (f) { return f.id === 'gracias'; })[0]; const d = C.desdeDiaDelAnio(2024, x.ini); return d.m === 10 && d.d === 28; })());
    prueba('El factor semanal queda entre ×0,80 y ×1,40', [1, 20, 26, 47, 52].every(function (s) { const v = E.pronosticoSemana(s, 'FJ', 'nam'); return v >= 0.8 && v <= 1.4; }));
    prueba('Ningún festival usa un nombre real', !C.circuitoAnio(2000).some(function (x) { return /Cannes|Venecia|Berlinale|Sundance|Oscar|Emmy|Grammy/.test(x.nombre); }));
    prueba('Una Leyenda viva pide prestigio 45', IA.talentos.NIVELES[3].prestigio === 45);
    prueba('Hay 56 premisas y tropos', IA.ideas.TODAS_PREMISAS.length === 56, IA.ideas.TODAS_PREMISAS.length);
    prueba('Las ventanas llegan en su año (TV 1955, video 1977, streaming 2007)', V.disponibles(1950).length === 0 && V.disponibles(1960).length === 1 && V.disponibles(1980).length === 2 && V.disponibles(2010).length === 3);
    prueba('Directo a video desde 1980 y a streaming desde 2010', V.viasDirectas(1979).length === 0 && V.viasDirectas(1985).length === 1 && V.viasDirectas(2015).length === 2);
    prueba('Las certificaciones de video empiezan en 1979 y suben de oro a diamante', V.ANIO_CERT === 1979 && V.CERTIFICACIONES[0].copias < V.CERTIFICACIONES[1].copias && V.CERTIFICACIONES[1].copias < V.CERTIFICACIONES[2].copias);
    prueba('Antes de la TV todo sale de la taquilla', V.parteVentanas(1940) === 0 && V.parteVentanas(2000) > 0.3);
    if (S && S.estudios) {
      const conAzar2 = function (fn) { const g = S.rng; const r2 = fn(); S.rng = g; return r2; };
      const ob = conAzar2(function () { const b = O.borrador(0, { gen: ['Drama'], escala: 2, completa: true }); O.equipoRecomendado(b, 1); return b; });
      ob.idio = 'Inglés'; ob.anio = 2000; ob.pub = 60; ob.est = 0; ob.fam = 'DR';
      const pl = ES.planPorDefecto(ob, 2000);
      const pRet = JSON.parse(JSON.stringify(pl)); pRet.reg.asi = 'retener';
      const pEsc = JSON.parse(JSON.stringify(pl)); pEsc.reg.eur = 'escalonado';
      prueba('Retener una región: no se estrena allí y la campaña cuesta menos', ES.factorRegion(Object.assign({}, ob, { plan: pRet }), 'asi', 3) === 0 && ES.costos(ob, pRet, 2, 2000).campana < ES.costos(ob, pl, 2, 2000).campana);
      prueba('El estreno escalonado llega 4 semanas después', ES.factorRegion(Object.assign({}, ob, { plan: pEsc }), 'eur', 2) === 0 && ES.factorRegion(Object.assign({}, ob, { plan: pEsc }), 'eur', 4) > 0);
      const sinDob = JSON.parse(JSON.stringify(pl)); delete sinDob.dob.lat;
      prueba('Doblar evita perder público por el idioma', N.anio() < 1930 || ES.necesitaDoblaje(ob, 'lat', 2000) && ES.factorRegion(Object.assign({}, ob, { plan: pl }), 'lat', 3) > ES.factorRegion(Object.assign({}, ob, { plan: sinDob }), 'lat', 3));
      prueba('La mezcla de canales recomendada rinde al menos como la de siempre', ES.factorCampana(Object.assign({}, ob, { plan: pl })) >= 0.99);
      const vieja = { id: -5, est: 0, et: 'terminada', anio: N.anio() - 3, bruto: 1e6, pub: 70, crit: 70 };
      prueba('Un reestreno necesita 7 años desde el estreno', !!V.puedeReestrenar(vieja) && !V.puedeReestrenar(Object.assign({}, vieja, { anio: N.anio() - 10 })));
      // El diseñador de arte y tecnología está a cargo de vestuario y efectos
      const conVest = ob.eq.vestuario ? ob : null;
      if (conVest) {
        const bonos = {};
        const h1 = E.habilidadDep(conVest, 'vestuario', T.porId, bonos);
        const arteOrig = conVest.eq.arte;
        const peor = S.talentos.filter(function (x) { return x.of === 'arte' && x.id !== arteOrig; }).sort(function (a, b) { return a.hab - b.hab; })[0];
        conVest.eq.arte = peor.id;
        const h2 = E.habilidadDep(conVest, 'vestuario', T.porId, bonos);
        conVest.eq.arte = arteOrig;
        prueba('El diseñador de arte y tecnología también pesa en vestuario', h2 < h1);
      }
      prueba('Los rivales también guardan sets', IA.rodaje.capacidadSets(1) >= 2);
    }
    // V26 · Metas, modos y editor
    {
      const Mt = IA.metas;
      prueba('Hay tres modos y cinco dificultades', Mt.MODOS.length === 3 && IA.juego.DIFICULTADES.length === 5);
      prueba('Hay cuatro retos finales', Mt.RETOS.length === 4);
      prueba('Hay al menos 30 logros', Mt.LOGROS.length >= 30, Mt.LOGROS.length);
      prueba('Cada dificultad tiene su texto con humor', IA.juego.DIFICULTADES.every(function (d) { return !!Mt.HUMOR[d.id]; }));
      prueba('El progreso de los retos va de 0 a 1', Mt.RETOS.every(function (r) { const p = Mt.progresoReto(r.id); return p >= 0 && p <= 1; }));
      prueba('El paquete del editor se puede leer', (function () { try { return JSON.parse(Mt.exportarPaquete()).tipo === 'paquete-industry-art'; } catch (e) { return false; } })());
    }
    // V25 · Música, videojuegos, teatro y libros
    {
      const Md = IA.medios;
      prueba('Hay cuatro medios nuevos con su premio', Object.keys(Md.MED).length === 4 && Object.keys(Md.MED).every(function (k) { return !!Md.MED[k].premio; }));
      prueba('Los formatos de música suman 1', Math.abs(Md.formatosMusica(N.anio()).reduce(function (s, f) { return s + f.parte; }, 0) - 1) < 1e-6 || N.anio() < 1877);
      prueba('Las cuotas de las plataformas suman 1', N.anio() < 1972 || Math.abs(Md.plataformas().reduce(function (s, p) { return s + p.cuota; }, 0) - 1) < 1e-6);
      prueba('Un juego va a una a cuatro plataformas', Md.proyectos('juegos').every(function (p) { return p.cfg.plats.length >= 1 && p.cfg.plats.length <= 4; }));
      prueba('La ocupación del teatro va de 5 % a 100 %', Md.proyectos('teatro').every(function (p) { return p.ocup === undefined || (p.ocup >= 0.05 && p.ocup <= 1); }));
      prueba('Ninguna venta es negativa o infinita', Md.proyectos().every(function (p) { return Object.keys(p.vend).every(function (k) { return isFinite(p.vend[k]) && p.vend[k] >= 0; }) && isFinite(p.ing); }));
      prueba('Los motores tienen de 1 a 5 estrellas', Md.motores().every(function (m) { return m.est >= 1 && m.est <= 5; }));
    }
    // V24 · Mundo vivo y negocio
    {
      const B = IA.banco;
      prueba('Hay 80 eventos con decisiones', IA.eventos.EV.length === 80, IA.eventos.EV.length);
      prueba('Cada evento tiene al menos dos opciones', IA.eventos.EV.every(function (e) { return e[5].length >= 2; }));
      prueba('Hay al menos 50 inventos', IA.historia.INVENTOS.length >= 50, IA.historia.INVENTOS.length);
      prueba('Hay al menos 30 construcciones', D.pisos.length + D.terrenos.length >= 30, D.pisos.length + D.terrenos.length);
      prueba('El puntaje de crédito va de 300 a 850', B.puntaje() >= 300 && B.puntaje() <= 850, B.puntaje());
      prueba('La quiebra tiene tres salidas', B.salidasQuiebra().length === 3);
      prueba('Los hitos están en orden de fecha', IA.historia.HITOS.every(function (x, i, a) { return !i || (a[i - 1][0] * 400 + a[i - 1][1] * 32 + a[i - 1][2]) <= (x[0] * 400 + x[1] * 32 + x[2]); }));
      prueba('El factor de guerras y crisis está acotado', IA.datos.regiones.every(function (r) { const f = IA.historia.factorMercado(r.id); return f >= 0.3 && f <= 1.15; }));
      prueba('Ningún estudio quebrado sigue filmando obras nuevas', O.activas().every(function (o) { const e = N.S.estudios[o.est]; return !e.quebrado || o.t0 <= (e.quebrado - N.S.y0 + 1) * 52; }));
      prueba('El socio nunca tiene la mayoría', !N.S.socio || N.S.socio.parte < 0.5);
    }
    // V23 · Franquicias, TV y streaming
    {
      const TV = IA.tv, F = IA.franquicias;
      const b1 = TV.aplicar({ gen: ['Drama'] }, { fmt: 'telenovela', eps: 999 }), b2 = TV.aplicar({ gen: ['Drama'] }, { fmt: 'miniserie', eps: 1 });
      prueba('Una temporada va de 2 a 300 episodios', b1.tv.eps === 300 && b2.tv.eps === 2, b1.tv.eps + ' / ' + b2.tv.eps);
      const b3 = TV.aplicar({ gen: ['Drama'], min: 500 }, { fmt: 'vivo' }), b4 = TV.aplicar({ gen: ['Drama'], min: 1 }, { fmt: 'vivo' });
      prueba('Un episodio va de 5 a 180 minutos', b3.min === 60 && TV.aplicar(Object.assign(b3, { min: 999 }), {}).min === 180 && TV.aplicar(Object.assign(b4, { min: 1 }), {}).min === 5);
      prueba('Hay siete caminos de continuación', F.CAMINOS.length === 7);
      prueba('El reboot baja la fatiga y la secuela la sube', F.camino('reboot').fat < 0 && F.camino('secuela').fat > 0);
      prueba('El horario familiar multa el contenido para adultos', TV.multable({ clas: 'R' }) && !TV.multable({ clas: 'G' }) && TV.FRANJAS.filter(function (x) { return x.fam; }).length >= 2);
      prueba('La parrilla tiene 7 días y 6 franjas', TV.DIAS.length === 7 && TV.FRANJAS.length === 6);
      prueba('La plataforma tiene tres planes', IA.streaming.PLANES.length === 3);
      const vivas = F.lista();
      prueba('Toda franquicia viva tiene al menos una obra y un canon', vivas.every(function (f) { return f.o.length >= 1 && f.cont.length >= 1; }), vivas.length);
      prueba('El efecto de la franquicia en el deseo está acotado', N.S.obras.every(function (o) { const v = F.bonoDeseo(o); return v >= -15 && v <= 18; }));
    }
    return r;
  }

  // Corre la batería completa: 3 estrategias × (1900 y 2000) hasta 2150
  function bateria(op) {
    const o = op || {};
    const res = [];
    const desde = o.desde || [1900, 2000];
    const estrategias = o.estrategias || ['prudente', 'normal', 'agresiva'];
    desde.forEach(function (d) {
      estrategias.forEach(function (e) {
        res.push(jugar({ estrategia: e, desde: d, hasta: o.hasta || 2150, semilla: (o.semilla || 'bot') + '-' + e + '-' + d, medirGuardado: o.medirGuardado }));
      });
    });
    return res;
  }

  return { ESTRATEGIAS: ESTRATEGIAS, METAS: METAS, decidir: decidir, jugar: jugar, bateria: bateria, pct: pct, mediana: mediana, reglas: reglas };
})();
