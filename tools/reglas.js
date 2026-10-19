// Pruebas de reglas (clasificación, dominio público, Erótico, inflación, población, economía…).
// Viven fuera del juego porque al jugador no le sirven y pesaban 30 KB: las cargan tools/bot.js y las
// pruebas en el navegador (después de abrir el juego) o en Node. Agregan IA.pruebas.reglas().
(function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, O = IA.obras, T = IA.talentos, L = IA.lanzamiento, NG = IA.negocio, X = IA.taxonomia;
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
    prueba('Lo de adultos dice «siempre sugerido»', I.describirContenido(idea(['Drama'], { amor: 4 })).indexOf('explícito (siempre sugerido)') >= 0);
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
    prueba('Hay más de 200 obras de dominio público', X.dominio.length >= 200, X.dominio.length);
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
    prueba('Listas completas: 300 temas o más, 300 subgéneros o más, 53 problemáticas, 34 ficciones', cnt.temas >= 300 && cnt.subgeneros >= 300 && cnt.problematicas === 53 && cnt.ficcion === 34, JSON.stringify(cnt));
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
      prueba('Una obra animada lleva diseño de arte en el equipo', !!anim.eq.arte && !!sinAnimar);
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
    prueba('Cada festival y premio del circuito tiene nombre', C.circuitoAnio(2000).length > 5 && C.circuitoAnio(2000).every(function (x) { return x.nombre; }));
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
    // V29 · Contra los Datos: calendario, inflación, población, dominio público y Erótico
    {
      const C = IA.cal, fi = function (y, id) { return C.fiestasAnio(y).filter(function (f) { return f.id === id; })[0]; };
      const pa = C.pascua(2024), pa2 = C.pascua(2025);
      prueba('Pascua 2024 cae el 31 de marzo y la de 2025 el 20 de abril', pa.m === 2 && pa.d === 31 && pa2.m === 3 && pa2.d === 20, JSON.stringify([pa, pa2]));
      prueba('Año Nuevo chino 2024 empieza el 10 de febrero', fi(2024, 'lunar') && fi(2024, 'lunar').ini === 41);
      prueba('Acción de Gracias 2024 es el 28 de noviembre', fi(2024, 'gracias') && fi(2024, 'gracias').ini === 333);
      prueba('El 1 de enero de 2024 fue lunes', C.diaSemana(2024, 0, 1) === 0);
      prueba('Población mundial de 2025 cerca de 8.200 millones', Math.abs(M.poblacionMundial(2025) / 1e9 - 8.2) < 0.25, Math.round(M.poblacionMundial(2025) / 1e6));
      prueba('Un dólar de 1950 vale unos 13 de 2025', Math.abs(M.ipc(2025) / M.ipc(1950) - 13.4) < 1.5, (M.ipc(2025) / M.ipc(1950)).toFixed(1));
      prueba('La inflación de 2022 fue de 7 % a 9 %', M.inflacionAnual(2022) > 0.07 && M.inflacionAnual(2022) < 0.09);
      const libres = I.materialesDisponibles(1950).filter(function (m) { return I.esLibre(m, 1950); }).length, libres2 = I.materialesDisponibles(2050).filter(function (m) { return I.esLibre(m, 2050); }).length;
      prueba('Con los años hay más obras en dominio público', libres2 > libres, libres + ' → ' + libres2);
      prueba('El Erótico no se puede antes de su año', !!O.validarGeneros(['Erótico'], 1900));
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
      prueba('Hay más de 200 eventos con decisiones', IA.eventos.EV.length >= 200, IA.eventos.EV.length);
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
      prueba('La parrilla tiene 7 días y 8 franjas', TV.DIAS.length === 7 && TV.FRANJAS.length === 8);
      prueba('La plataforma tiene tres planes', IA.streaming.PLANES.length === 3);
      const vivas = F.lista();
      prueba('Toda franquicia viva tiene al menos una obra y un canon', vivas.every(function (f) { return f.o.length >= 1 && f.cont.length >= 1; }), vivas.length);
      prueba('El efecto de la franquicia en el deseo está acotado', N.S.obras.every(function (o) { const v = F.bonoDeseo(o); return v >= -15 && v <= 18; }));
      // Dinero y matemática
      const NGc = IA.negocio, uh = N.S.fin.hist[N.S.fin.hist.length - 1];
      prueba('El impuesto es el 25 % de la utilidad operativa del año', !uh || Math.abs(Math.max(0, uh.util) * E.P.IMPUESTO - uh.imp) <= 2, uh ? uh.anio + ': ' + uh.util + ' → ' + uh.imp : '');
      prueba('Préstamos, socio y acciones son capital: mueven la caja pero no la utilidad', NGc.esCapital('prestamo') && NGc.esCapital('amortizacion') && NGc.esCapital('socio') && !NGc.esCapital('taquilla') &&
        NGc.total({ ing: { prestamo: 5, taquilla: 3 }, gas: {} }, 'ing') === 3 && NGc.total({ ing: { prestamo: 5, taquilla: 3 }, gas: {} }, 'ing', true) === 8);
      prueba('La caja y las cifras del estudio no tienen NaN ni infinitos', N.S.estudios.every(function (e) { return isFinite(e.caja) && isFinite(e.ingAnio) && isFinite(e.gasAnio); }));
      prueba('Ida y vuelta entre dinero de la época y dólares de hoy', [1850, 1900, 1950, 2000, 2025, 2080].every(function (a) { return Math.abs(M.aHoy(M.aEpoca(1000, a), a) - 1000) < 0.01; }));
    }
    // Inicio desde 1850 y tipo de industria (en una partida aparte; al final se vuelve a la de antes)
    {
      const antes = N.S, Md = IA.medios;
      prueba('Cada industria existe desde su año y tiene efecto', D.industrias.every(function (x) { return x.desde >= 1700 && x.efecto && x.meds; }) && D.industria('Teatro').desde === 1700 && D.industria('Videojuegos').desde === 1972);
      IA.juego.nuevaPartida({ semilla: 'reglas-1850', anio: 1850, bot: true, industria: 'Cine' });
      const e0 = N.S.estudios[0];
      prueba('Se puede empezar en 1850; sin cine, la industria pasa a Teatro y no hay plató', IA.juego.ANIO_MIN === 1700 && N.anio() === 1850 && e0.industria === 'Teatro' && e0.pisos.join() === 'oficinas');
      prueba('Antes de 1895 no se puede iniciar una película', /1895/.test(IA.juego.puedeIniciar({ gen: ['Drama'] })));
      prueba('El teatro, los libros y las partituras se pueden producir en 1850', Md.disponible('teatro') && Md.disponible('libros') && Md.disponible('musica') && !Md.disponible('juegos'));
      prueba('La industria Teatro da +1 obra a la vez en teatro y 15 % menos de costo', Md.capacidad('teatro') === Md.capacidad('libros') + 1 &&
        Math.abs(Md.borrador('teatro', { esc: 1 }).pp / (IA.mundo.aEpoca(4e7, 1850) * 0.015 * 0.85) - 1) < 0.01);
      for (let i = 0; i < 26; i++) IA.juego.avanzarSemana();
      prueba('Los rivales no estrenan películas antes de 1895', N.S.obras.every(function (o) { return o.est === 0; }) && N.S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado; }).length >= 5);
      prueba('El capital recomendado alcanza para una obra de teatro chica', IA.juego.capitalRecomendado(1850) >= 1e6 && IA.juego.capitalRecomendado(1900) >= 2.5e5);
      N.S = antes; IA.obras.reindexar(); IA.talentos.reindexar();
    }
    // V36: obras libres con sus personajes, avatar en tus obras, teatros propios, letrero, ciudades y aspecto
    {
      const antes = N.S, Md = IA.medios;
      prueba('Las 82 obras libres tienen sinopsis y personajes de siempre', [...Array(82).keys()].every(function (i) { const c = X.canon(X.material('dp' + (i + 1))); return c && c.sin && c.pj.length >= 3 && c.pj.some(function (p) { return p.i === 'protagonista'; }); }));
      IA.juego.nuevaPartida({ semilla: 'reglas-36', anio: 1990, bot: true, avatar: { nombre: 'Ana', sexo: 'F', edad: 30, aspecto: { piel: 99, pelo: -3, gafas: 1 } } });
      IA.carrera.iniciar({ modo: 'dueno', oficio: 'direccion' });
      const asp = N.S.avatar.asp;
      prueba('El aspecto del avatar se guarda dentro de sus rangos', asp && asp.piel === 7 && asp.pelo === 0 && asp.gafas === true);
      const b = IA.obras.borrador(0, { gen: ['Romance'], escala: 1, completa: true });
      I.usarMaterial(b, 'dp8', 1990); I.generarPersonajes(b);
      prueba('Romeo y Julieta trae a Romeo y a Julieta', b.pj.some(function (p) { return p.n === 'Romeo'; }) && b.pj.some(function (p) { return p.n === 'Julieta'; }) && /Verona/.test(I.sinopsis(b)));
      const av = IA.carrera.talentoAvatar();
      prueba('Tu avatar es un talento tuyo: trabaja gratis y acepta tus obras', av && av.jugador && T.tarifaPara(av, 0) === 0 && T.negociar(av, { est: 0, rol: 'direccion' }).estado === 'acepta' && IA.carrera.oficiosAvatar().indexOf('interprete') >= 0);
      prueba('Como dueño, tu avatar no trabaja para los rivales', !T.disponible(av, 1) && T.disponible(av, 0));
      const caja0 = N.S.estudios[0].caja = 1e12;
      prueba('Se compra un teatro y queda en tu lista', Md.comprarTeatro('mediana') === '' && Md.teatros().length === 1 && N.S.estudios[0].caja < caja0);
      const ing0 = N.S.fin.mes.ing.alquilerTeatros || 0;
      Md.semana();
      prueba('Un teatro libre se alquila y deja dinero cada semana', (N.S.fin.mes.ing.alquilerTeatros || 0) > ing0);
      prueba('Se puede vender un teatro propio', Md.venderTeatro(Md.teatros()[0].id) === '' && Md.teatros().length === 0);
      prueba('El letrero usa el tipo de letra elegido (cada una distinta)', new Set([...Array(20).keys()].map(function (f) { return IA.arte.fuenteLetra(f, 20); })).size === 20);
      prueba('Hay 40 ciudades o más para empezar, todas en países del juego', D.regionesInicio.length >= 40 && D.regionesInicio.every(function (r) { return !r.pais || D.pais(r.pais); }));
      prueba('Cada rival activo se puede comprar o explica por qué no', N.S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado; }).every(function (e) { return typeof IA.imperio.puedeComprar(e.id) === 'string'; }));
      N.S = antes; IA.obras.reindexar(); IA.talentos.reindexar();
    }
    // Definitiva 5.0: clasificación, personajes, financiación y economía de los medios
    {
      const Md = IA.medios, Im = IA.imperio, antes = N.S;
      IA.juego.nuevaPartida({ semilla: 'reglas-medios', anio: 1990, bot: true });
      const j = Md.borrador('juegos');
      j.cont = { violencia: 6, lenguaje: 5, amor: 0, consumo: 0, terror: 0 };
      Md.normalizarCont(j);
      prueba('En 1990 las consolas no aceptan juegos para adultos (máximo 16)', ['G', 'PG', 'PG-13', '16'].indexOf(j.clas) >= 0, j.clas);
      const t = Md.borrador('teatro');
      prueba('El teatro trae protagonista con intérprete', (t.pj || []).some(function (p) { return p.i === 'protagonista' && p.t !== null && p.t !== undefined; }));
      t.pj.push({ n: 'Sin actor', e: 30, s: 'F', i: 'secundario', a: 'Aliado', t: null });
      prueba('Un papel de teatro sin intérprete impide empezar', /interprete a Sin actor/.test(Md.validar(t)), Md.validar(t));
      const l = Md.borrador('libros');
      prueba('Los libros traen personajes sin intérprete', (l.pj || []).length >= 1 && !Md.conActores(l));
      prueba('La música no tiene personajes con nombre', !(Md.borrador('musica').pj || []).length);
      const ctx = Im.contextoFin(l), pl = Im.planFin(['copro', 'preventa', 'inversores', 'marcas'], 1e6, ctx, 50);
      prueba('Entre todos los financiadores no pasan del 85 %', pl.socios + pl.prest <= 850001 && pl.propio >= 149999, JSON.stringify(pl));
      prueba('El subsidio cultural no apoya superproducciones', !!Im.motivoFin('subsidio', Object.assign({}, ctx, { pres: 2.5, autor: true })));
      const p0 = Md.pulido({ pul: 0 }), p3 = Md.pulido({ pul: 3 });
      prueba('Más pulido: más calidad, más tiempo y más costo', p3.q > p0.q && p3.sem > p0.sem && p3.k > p0.k);
      N.S = antes; IA.obras.reindexar(); IA.talentos.reindexar();
      IA.juego.nuevaPartida({ semilla: 'reglas-musica', anio: 1995, bot: true });
      const m = Md.borrador('musica');
      m.cont = { violencia: 0, lenguaje: 3, amor: 0, consumo: 0, terror: 0 };
      Md.normalizarCont(m);
      prueba('Desde 1985 la música con lenguaje crudo lleva aviso de letras explícitas', m.explicito === 1);
      N.S = antes; IA.obras.reindexar(); IA.talentos.reindexar();
    }
    return r;
  }
  IA.pruebas.reglas = reglas;
})();
