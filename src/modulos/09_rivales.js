/* ==== módulo: rivales ==== */
// Estudios rivales simples que hacen obras de verdad: contratan talentos del mismo mundo, eligen fechas mirando
// la temporada y la competencia, estrenan en la misma cartelera y ganan o pierden dinero como tú.
// Identidad y estrategia, robo de fechas, quiebras de verdad, fusiones, estudios emergentes y estrellas.
ART.rivales = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, E = ART.economia, O = ART.obras, P = ART.produccion, L = ART.lanzamiento;

  function logoDe(n) {
    if (ART.arte && ART.arte.logoAleatorio) return ART.arte.logoAleatorio(n);
    return { s: n % 25, c: (n * 7) % 20, b: (n * 3) % 20, t: (n * 11) % 20, f: n % 20 };
  }
  const ESTRATEGIAS = {
    taquillero: { nombre: 'Taquillero', texto: 'Persigue el gran estreno y te puede robar la fecha', escala: 0.3, roba: 0.5 },
    autor: { nombre: 'De autor', texto: 'Busca premios y crítica', escala: -0.2, roba: 0 },
    familiar: { nombre: 'Familiar', texto: 'Obras para toda la familia en vacaciones', escala: 0, roba: 0.2 },
    economico: { nombre: 'Económico', texto: 'Muchas obras baratas', escala: -0.5, roba: 0.1 },
    franquicias: { nombre: 'De franquicias', texto: 'Continúa todo lo que funciona', escala: 0.2, roba: 0.3 },
    imitador: { nombre: 'Imitador', texto: 'Copia la tendencia del momento', escala: 0, roba: 0.35 },
  };
  const ESTR_DE = { DR: 'autor', AV: 'autor', AA: 'taquillero', SM: 'imitador', HM: 'economico', IM: 'franquicias', FJ: 'familiar', RD: 'economico' };
  // Estudios que nacen con el tiempo (nombres inventados)
  const EMERGENTES = [
    { anio: 1912, nombre: 'Estrella del Oeste', pais: 'us', familia: 'AA', tam: 0.7, calidad: 0, riesgo: 0.6, texto: 'Pioneros del cine de aventuras' },
    { anio: 1923, nombre: 'Hermanos Lumbre', pais: 'us', familia: 'FJ', tam: 0.6, calidad: 2, riesgo: 0.5, texto: 'Dibujantes que pasan a la animación' },
    { anio: 1934, nombre: 'Cinecittà del Sur', pais: 'it', familia: 'DR', tam: 0.7, calidad: 2, riesgo: 0.4, texto: 'Melodramas de gran escala' },
    { anio: 1951, nombre: 'Monte Fuji Eiga', pais: 'jp', familia: 'IM', tam: 0.7, calidad: 2, riesgo: 0.6, texto: 'Monstruos y samuráis' },
    { anio: 1962, nombre: 'Bollyluz', pais: 'in', familia: 'RD', tam: 0.8, calidad: 0, riesgo: 0.4, texto: 'Musicales y romance a lo grande' },
    { anio: 1976, nombre: 'Arcadia Pictures', pais: 'us', familia: 'IM', tam: 0.8, calidad: 1, riesgo: 0.8, texto: 'Efectos y ciencia ficción' },
    { anio: 1986, nombre: 'Pixelandia', pais: 'us', familia: 'FJ', tam: 0.6, calidad: 4, riesgo: 0.6, texto: 'Dibujantes de cómic que pasan a la animación 3D' },
    { anio: 1994, nombre: 'Nube Roja', pais: 'cn', familia: 'AA', tam: 0.9, calidad: 0, riesgo: 0.6, texto: 'Artes marciales para el mundo' },
    { anio: 2008, nombre: 'Ola Digital', pais: 'kr', familia: 'SM', tam: 0.7, calidad: 3, riesgo: 0.6, texto: 'Nace en internet y salta al cine' },
    { anio: 2031, nombre: 'Sintética', pais: 'us', familia: 'IM', tam: 0.8, calidad: 1, riesgo: 0.9, texto: 'Todo hecho con IA' },
    { anio: 2058, nombre: 'Megaciudad Films', pais: 'ng', familia: 'DR', tam: 0.8, calidad: 2, riesgo: 0.5, texto: 'Historias de las nuevas megaciudades' },
    { anio: 2104, nombre: 'Órbita Baja', pais: 'us', familia: 'IM', tam: 0.7, calidad: 2, riesgo: 0.8, texto: 'Cine filmado en órbita' },
  ];
  // ---------- Estudios que nacen solos ----------
  // El mundo quiere más estudios a medida que crece el mercado. La mitad los funda una estrella o un director famoso
  // con su apellido en la puerta (y se lleva su talento en exclusiva); el resto nace con un nombre de su región.
  const META = [[1895, 7], [1920, 10], [1950, 12], [1980, 14], [2010, 16], [2100, 18], [2300, 20]];
  const CON_APELLIDO = { lat: ['Producciones {a}', 'Estudios {a}', 'Cine {a}'], nam: ['{a} Pictures', '{a} Brothers', '{a} Films'], oce: ['{a} Pictures', '{a} Films'],
    eur: ['Films {a}', '{a} Film', 'Studio {a}'], asi: ['{a} Pictures', '{a} Studios', '{a} Entertainment'], afr: ['{a} Films', '{a} Studios'] };
  const RAICES = { lat: ['Cóndor', 'Alba', 'Faro', 'Volcán', 'Ceiba', 'Quetzal', 'Mar del Sur', 'Colibrí', 'Cielo Abierto', 'Andes'],
    nam: ['Silver Lake', 'Red Oak', 'Blue Harbor', 'Northstar', 'Lighthouse', 'Ironwood', 'Summit', 'Prairie', 'Golden Hour', 'Bright Lane'],
    oce: ['Southern Cross', 'Coral', 'Outback', 'Kiwi Hill'], eur: ['Aurora', 'Lumen', 'Atlas', 'Minerva', 'Orfeo', 'Borealis', 'Helios', 'Arlequín', 'Linterna', 'Vesta'],
    asi: ['Loto', 'Jade', 'Sakura', 'Monzón', 'Tigre Blanco', 'Himalaya', 'Bambú', 'Dragón de Papel', 'Mekong', 'Perla'], afr: ['Baobab', 'Sahel', 'Kilimanjaro', 'Nilo', 'Sabana', 'Ébano', 'Atlas Sur'] };
  const SUFIJOS = { lat: ['Films', 'Producciones', 'Cine', 'Estudios'], nam: ['Pictures', 'Studios', 'Films', 'Entertainment'], oce: ['Pictures', 'Films'], eur: ['Film', 'Films', 'Cinéma', 'Studio'], asi: ['Pictures', 'Studios', 'Films', 'Entertainment'], afr: ['Films', 'Studios', 'Pictures'] };
  function apellido(nom) { const p = String(nom).split(' '); return p.length > 1 ? p.slice(1).join(' ') : p[0]; }
  function fundador() {
    const S = N.S, anio = N.anio(), T = ART.talentos;
    const c = S.talentos.filter(function (t) {
      const e = anio - t.nac;
      return !t.ret && !t.mu && !t.funda && ['direccion', 'produccion', 'interprete', 'guion', 'animacion'].indexOf(t.of) >= 0 && t.fama >= 0.4 && e >= 32 && e <= 66 && T.exclusivoDe(t) === null && !T.ocupado(t);
    }).sort(function (a, b) { return b.fama - a.fama; });
    return c.length ? c[N.entero(0, Math.min(5, c.length - 1))] : null;
  }
  function nacerEstudio() {
    const S = N.S, t = N.probabilidad(0.5) ? fundador() : null;
    let r;
    if (t) {
      const af = t.af && t.af.length ? t.af : [0], i = af.indexOf(Math.max.apply(null, af));
      const pais = D.pais(t.pais) || D.pais('us');
      r = { nombre: N.elegir(CON_APELLIDO[pais.region] || CON_APELLIDO.nam).replace('{a}', apellido(t.nom)), pais: pais.id, familia: D.ORDEN_FAM[Math.max(0, i)], tam: N.redondear(0.45 + t.fama * 0.4, 2),
        calidad: Math.round(N.limitar((t.hab - 60) / 8, -1, 4)), riesgo: N.redondear(0.45 + N.azar() * 0.35, 2), texto: 'Fundado por ' + t.nom };
    } else {
      const pais = D.paises[N.ponderado(D.paises.map(function (p) { return p.peso; }))], reg = RAICES[pais.region] ? pais.region : 'nam';
      r = { nombre: N.elegir(RAICES[reg]) + ' ' + N.elegir(SUFIJOS[reg]), pais: pais.id, familia: N.elegir(D.ORDEN_FAM), tam: N.redondear(0.5 + N.azar() * 0.3, 2), calidad: N.entero(-1, 3),
        riesgo: N.redondear(0.4 + N.azar() * 0.4, 2), texto: 'Un estudio joven de ' + pais.nombre };
    }
    if (S.estudios.some(function (e) { return e.nombre === r.nombre; })) return null;
    const est = agregarEstudio(r, false);
    if (t) { t.funda = est.id; ART.talentos.firmarExclusivo(t, est.id, 6); }
    N.emit('noticia', { tipo: 'rival', texto: t ? t.nom + ' funda su propio estudio: ' + r.nombre + '.' : 'Nace un estudio nuevo: ' + r.nombre + ' (' + r.texto.charAt(0).toLowerCase() + r.texto.slice(1) + ').', importante: !!t });
    return est;
  }
  function agregarEstudio(r, nota) {
    const S = N.S, tipico = E.presupuestoTipico(N.anio()), pais = D.pais(r.pais) || D.pais('us');
    const id = S.estudios.length;
    S.estudios.push({
      id: id, nombre: r.nombre, logo: logoDe(r.logo || id * 7 + 5), pais: pais.id, reg: pais.region, jugador: false,
      caja: Math.round(tipico * r.tam * 6), fama: N.redondear(0.12 + r.tam * 0.1, 3), tam: r.tam, base: r.tam, calidad: r.calidad, riesgo: r.riesgo, familia: r.familia,
      util: 0, ingAnio: 0, gasAnio: 0, rescates: 0, estr: ESTR_DE[r.familia] || 'imitador', texto: r.texto || '', desde: N.anio(), sets: [], cad: {},
    });
    if (nota) N.emit('noticia', { tipo: 'rival', texto: 'Nace un estudio nuevo: ' + r.nombre + (r.texto ? ' (' + r.texto.toLowerCase() + ')' : '') + '.', importante: true });
    return S.estudios[id];
  }
  function activos() { return N.S.estudios.filter(function (e) { return e.id > 0 && !e.quebrado; }); }
  function crearEstudios() {
    const S = N.S, anio = N.anio();
    const tipico = E.presupuestoTipico(anio);
    D.rivales.forEach(function (r, i) {
      const pais = D.pais(r.pais);
      S.estudios.push({
        id: i + 1, nombre: r.nombre, logo: logoDe(r.logo), pais: r.pais, reg: pais.region, jugador: false,
        caja: Math.round(tipico * r.tam * 6), fama: N.redondear(0.15 + r.tam * 0.12, 3), tam: r.tam,
        calidad: r.calidad, riesgo: r.riesgo, familia: r.familia, util: 0, ingAnio: 0, gasAnio: 0, rescates: 0,
        base: r.tam, estr: ESTR_DE[r.familia] || 'imitador', texto: '', desde: anio,
      });
    });
    // Emergentes que ya existían cuando empieza tu partida (los tres más recientes)
    EMERGENTES.filter(function (x) { return x.anio <= anio; }).slice(-3).forEach(function (x) { agregarEstudio(x); });
  }
  // Cuántas obras quiere tener en marcha cada rival
  function objetivo(est) {
    const da = E.datosAnio(N.anio());
    return Math.max(1, Math.round(est.tam * 3.2 * Math.sqrt(da.peliculas / 320)));
  }
  function elegirGeneros(est) {
    const S = N.S;
    let famId;
    if (N.probabilidad(0.55)) famId = est.familia;
    else {
      // Persigue la tendencia del momento (con algo de azar)
      const fams = D.ORDEN_FAM.slice();
      famId = fams[N.ponderado(fams.map(function (f) { return Math.exp(2 * (S.mundo.tendencias[f] || 0)); }))];
    }
    const fam = D.familia(famId);
    const permitidos = fam.generos.filter(function (g) { return !O.validarGeneros([g]); });
    const gen = [N.elegir(permitidos.length ? permitidos : ['Drama'])];
    if (N.probabilidad(0.45)) {
      const otra = D.familias[N.entero(0, D.familias.length - 1)];
      const g2 = N.elegir(otra.generos);
      if (gen.indexOf(g2) < 0 && !O.validarGeneros(gen.concat([g2]))) gen.push(g2);
    }
    if (O.validarGeneros(gen)) return [fam.generos[0] === 'Erótico' ? 'Romance' : fam.generos[0]];
    return gen;
  }
  // Proyectos de prestigio: obras pensadas para premios, con lo mejor del talento disponible
  // Ajustes de la conducta de los rivales con poca caja (se pueden calibrar desde las pruebas)
  const AJ = { minEscala: 2, ambPobre: 1 };
  const PRESTIGIO = { DR: 0.35, AV: 0.4, SM: 0.2, RD: 0.15, IM: 0.12, AA: 0.1, HM: 0.1, FJ: 0.1 };
  function nuevaObra(est, ctx) {
    const prestigio = N.probabilidad(PRESTIGIO[est.familia] || 0.1) && est.caja > E.presupuestoTipico(N.anio()) * 3;
    const gen = prestigio ? [N.elegir(D.familia(N.probabilidad(0.6) ? 'DR' : est.familia).generos.filter(function (g) { return g !== 'Erótico'; }))] : elegirGeneros(est);
    const escala = prestigio ? N.entero(2, 3) : N.limitar(Math.round(N.normal(2 + (est.tam - 1) * 0.3, 0.45 + est.riesgo * 0.35)), 0, 3);
    const tono = prestigio ? N.elegir(['Reflexivo', 'Realista', 'Poético', 'Oscuro', 'Épico']) : N.elegir(D.tonos).id;
    const anio = N.anio();
    const op = { gen: gen, escala: escala, tono: tono };
    // A veces adaptan una obra libre de derechos y, desde 2022, algunos usan IA para abaratar
    if (!prestigio && N.probabilidad(0.07)) {
      const libres = ART.ideas.materialesDisponibles(anio).filter(function (m) { return ART.ideas.esLibre(m, anio); });
      if (libres.length) {
        const m = ART.ideas.usarMaterial({ est: est.id }, N.elegir(libres).id, anio);
        op.gen = m.gen; op.mat = m.mat; op.tit = m.tit; op.epo = m.epo;
        if (m.cont) op.cont = m.cont;
      }
    }
    if (anio >= ART.ideas.ANIO_IA && N.probabilidad(0.3)) op.ia = N.entero(10, 60);
    // La historia: los estudios con buen ojo (y los proyectos de prestigio) eligen lo que encaja con su género
    const famIdea = D.familiaDe[op.gen[0]] || 'DR';
    const buenOjo = N.probabilidad(N.limitar(0.45 + est.calidad / 20 + (prestigio ? 0.3 : 0), 0.2, 0.92));
    op.tem = [buenOjo ? ART.ideas.temaRecomendado(famIdea) : N.elegir(D.temas)];
    op.prob = [buenOjo ? ART.ideas.problemaRecomendado(famIdea) : ART.ideas.problemaRecomendado(N.elegir(D.ORDEN_FAM))];
    op.arco = buenOjo ? ART.ideas.arcoRecomendado(famIdea) : N.elegir(ART.taxonomia.arcos).id;
    const sec = ART.franquicias.secuelaRival(est); // a veces continúan su éxito
    if (sec) { op.gen = sec.gen.slice(); delete op.mat; }
    let b = O.borrador(est.id, op);
    // Con poca caja hacen una obra más chica en vez de quedarse sin filmar
    while (b.pp * 1.4 > est.caja && op.escala > AJ.minEscala) { op.escala--; b = O.borrador(est.id, op); }
    if (sec) ART.franquicias.prepararRival(b, sec);
    const pobre = b.pp * 2 > est.caja;
    b.prest = prestigio ? 1 : 0;
    // Cómo filman: el método y el terreno recomendados y, si tienen uno que sirva, un set guardado
    const R = ART.rodaje;
    b.met = R.metodoRecomendado(b, anio); b.ter = R.terrenoRecomendado(b); b.pst = 'clasico';
    const sets = R.usaSet(b) ? R.setsQueSirven(b) : [];
    if (sets.length && sets[0].q >= 50) b.setR = sets[0].id;
    O.recalcular(b);
    // La calidad de su equipo depende de su estilo más que de su tamaño (evita la espiral del más chico)
    O.equipoRecomendado(b, prestigio ? 2.6 : N.limitar(0.95 + (est.tam - 1) * 0.15 + est.calidad / 25, 0.75, 1.4) * (pobre ? AJ.ambPobre : 1), prestigio ? 2 : 4);
    if (!O.equipoCompleto(b)) return null;
    const costo = O.costoTalento(b) + b.pp;
    if (est.caja < costo * 0.9) return null;
    const o = P.iniciar(b, ctx);
    ART.ideas.registrarPremisas(o, anio);
    if (o.mat) {
      ART.ideas.registrarUso(o.mat, anio);
      N.emit('noticia', { tipo: 'rival', texto: est.nombre + ' adapta «' + ART.taxonomia.material(o.mat).tit + '».' });
    }
    return o;
  }
  // Cada mes: decide qué producir
  function mensual(ctx) {
    const S = N.S;
    if (N.anio() < D.CINE_DESDE) return; // Antes de 1895 no hay películas
    for (let i = 1; i < S.estudios.length; i++) {
      const est = S.estudios[i];
      if (est.quebrado) continue;
      const enMarcha = O.enProduccion(est.id).length;
      const meta = objetivo(est);
      let nuevas = Math.min(2, meta - enMarcha);
      while (nuevas-- > 0) nuevaObra(est, ctx);
    }
  }
  // Cuando una obra rival queda lista, elige su fecha de estreno y su campaña
  function alQuedarLista(o, ctx) {
    const est = N.S.estudios[o.est];
    let t = L.mejorSemana(o, N.S.t + 2, N.S.t + 2 + N.entero(6, 16));
    // Estrategia: algunos eligen tu fecha a propósito si tu obra es de su misma familia
    const es = ESTRATEGIAS[est.estr] || {};
    const tuya = N.S.obras.filter(function (x) { return x.est === 0 && x.prog && x.et === 'lista' && x.fam === o.fam && x.fe > N.S.t + 2 && Math.abs(x.fe - t) <= 6; })[0];
    if (tuya && (o.pub || 50) >= 55 && N.probabilidad(es.roba || 0)) {
      t = tuya.fe;
      N.emit('noticia', { tipo: 'rival', texto: est.nombre + ' te roba la fecha: estrena «' + o.tit + '» la misma semana que «' + tuya.tit + '».', importante: true });
    }
    // La campaña sigue a lo que prometen las primeras funciones de prueba: a una obra floja le gastan menos
    const nivM = N.limitar(Math.round(N.normal(2 + (o.esc - 2) * 0.4 + ((o.pub || 60) - 65) / 15, 0.45)), 1, 3);
    L.programar(o, t, nivM, ctx);
  }
  // Cada año: crecen si ganan, se achican si pierden; si quedan en rojo reciben un rescate
  function anual() {
    const S = N.S, anio = N.anio();
    const tipico = E.presupuestoTipico(anio);
    for (let i = 1; i < S.estudios.length; i++) {
      const est = S.estudios[i];
      if (est.quebrado) continue;
      const base = est.base || (D.rivales[i - 1] || { tam: 1 }).tam;
      // Quiebra de verdad: tras tres rescates, si vuelve a quedar en rojo, cierra (las filiales las cubres tú)
      est.resc = (est.resc || []).filter(function (a) { return a > anio - 10; });
      if (est.caja < 0 && est.resc.length >= 3 && anio - (est.desde || S.y0) >= 15 && !est.filial) { quebrar(est); continue; }
      // Rescate si de verdad quedó en rojo (no por tener la caja invertida en producciones) o si ya no le alcanza
      // ni para la obra más chica y no tiene nada en marcha (así ningún rival queda congelado para siempre)
      const varado = est.caja < tipico * 0.25 && !O.enProduccion(est.id).length;
      if (est.caja < 0 || varado) {
        est.tam = N.redondear(Math.max(base * 0.4, est.tam * 0.85), 3);
        const aporte = Math.round(-est.caja + tipico * est.tam * (varado ? 2 : 1));
        est.caja += aporte;
        est.rescates++; est.resc = (est.resc || []).concat([anio]);
        N.emit('noticia', { tipo: 'rival', texto: est.nombre + ' recibe dinero de inversionistas para seguir filmando.' });
      } else if (est.caja > tipico * est.tam * 10) {
        est.tam = N.redondear(Math.min(base * 1.4, est.tam * 1.05), 3);
      } else if (est.util < 0) {
        est.tam = N.redondear(Math.max(base * 0.5, est.tam * 0.96), 3);
      }
      est.tam = N.redondear(est.tam + (base - est.tam) * 0.05, 3);
      if (est.filial && est.caja < 0) { const c = -est.caja + Math.round(tipico * 0.5); ART.negocio.pagar(0, 'filiales', c); est.caja += c; }
    }
    fusiones();
    EMERGENTES.forEach(function (x) { if (x.anio === anio && !S.estudios.some(function (e) { return e.nombre === x.nombre; })) agregarEstudio(x, true); });
    // Nacen estudios cuando faltan para el tamaño del mercado (y a veces, aunque no falten); nunca quedan menos de seis
    const n = activos().length;
    if (n < 6 || (anio >= D.CINE_DESDE && N.probabilidad(n < Math.round(N.interp(META, anio)) ? 0.35 : 0.04))) nacerEstudio();
  }
  function quebrar(est) {
    const S = N.S;
    est.quebrado = N.anio();
    O.activas().forEach(function (o) { if (o.est === est.id && ['desarrollo', 'preproduccion'].indexOf(o.et) >= 0) { o.et = 'terminada'; o.cancelada = 1; o.pub = o.pub || 0; ART.talentos.liberar(O.idsEquipo(o)); } });
    // Sus franquicias quedan a la venta; otro rival se queda con la mejor
    const fr = ART.franquicias.lista().filter(function (f) { return f.est === est.id; });
    const comprador = activos().sort(function (a, b) { return b.caja - a.caja; })[0];
    if (fr.length && comprador) { const f = fr.sort(function (a, b) { return ART.franquicias.valor(b) - ART.franquicias.valor(a); })[0]; f.est = comprador.id; }
    N.emit('noticia', { tipo: 'rival', texto: est.nombre + ' quiebra y cierra sus puertas' + (fr.length ? '; sus franquicias salen a la venta' : '') + '.', importante: true });
  }
  // Dos estudios chicos y en apuros se fusionan
  function fusiones() {
    if (!N.probabilidad(0.05)) return;
    const chicos = activos().filter(function (e) { return !e.filial && e.caja < E.presupuestoTipico(N.anio()) * e.tam * 3; }).sort(function (a, b) { return a.tam - b.tam; });
    if (chicos.length < 2) return;
    const a = chicos[1], b = chicos[0];
    a.caja += b.caja; a.tam = N.redondear(a.tam + b.tam * 0.6, 3); a.base = N.redondear((a.base || a.tam) + (b.base || b.tam) * 0.5, 3);
    b.quebrado = N.anio(); b.fusion = a.id;
    ART.franquicias.lista().forEach(function (f) { if (f.est === b.id) f.est = a.id; });
    N.emit('noticia', { tipo: 'rival', texto: a.nombre + ' y ' + b.nombre + ' se fusionan.', importante: true });
  }
  // Estrellas de 1 a 5 por cuota, prestigio y calidad
  function estrellas(e) {
    const c = ART.negocio.cuotaAnioActual(e.id);
    const p = c * 40 + e.fama * 2 + (e.calidad || 0) * 0.15 + (e.id === 0 ? 0 : 0);
    return e.quebrado ? 0 : N.limitar(Math.round(1 + p * 1.2), 1, 5);
  }

  return { ESTRATEGIAS: ESTRATEGIAS, EMERGENTES: EMERGENTES, agregarEstudio: agregarEstudio, activos: activos, quebrar: quebrar, estrellas: estrellas, crearEstudios: crearEstudios, mensual: mensual, alQuedarLista: alQuedarLista, anual: anual, objetivo: objetivo, AJ: AJ };
})();
