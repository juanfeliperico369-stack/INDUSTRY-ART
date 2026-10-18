/* ==== módulo: obras ==== */
// La ficha de cada obra y su creación: el borrador con todos los campos de la fábrica de ideas, el equipo,
// los costos y las semanas de cada etapa. Las reglas de la idea (clasificación, encaje, sinopsis) viven en ART.ideas.
ART.obras = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, E = ART.economia, T = ART.talentos;
  const ETAPAS = ['desarrollo', 'preproduccion', 'rodaje', 'posproduccion', 'lista', 'cartelera', 'terminada'];
  const NOMBRE_ETAPA = {
    desarrollo: 'Desarrollo', preproduccion: 'Preproducción', rodaje: 'Rodaje', posproduccion: 'Posproducción',
    lista: 'Lista para estrenar', cartelera: 'En cartelera', emision: 'En emisión', terminada: 'Terminada',
  };
  const ROLES = ['guion', 'direccion', 'produccion', 'fotografia', 'musica', 'edicion', 'arte'];
  // Vestuario, efectos y animación. Se contratan cuando la obra los necesita; efectos y animación también
  // pueden encargarse a un estudio externo (sin vestuario o efectos propios, el diseñador de arte se ocupa)
  const ROLES_EXTRA = ['vestuario', 'efectos', 'animacion'];
  const TODOS_ROLES = ROLES.concat(ROLES_EXTRA);
  function rolesDe(o) { return ROLES.concat(ROLES_EXTRA.filter(function (r) { return ART.rodaje.necesita(o, r) && !ART.rodaje.esExterno(o, r); })); }
  let indice = null;

  // Las obras activas (no terminadas) se guardan aparte en memoria: así el juego no recorre miles de obras
  // viejas cada semana.
  let cacheActivas = null;
  function reindexar() { indice = {}; N.S.obras.forEach(function (o) { indice[o.id] = o; }); cacheActivas = null; }
  function porId(id) { if (!indice) reindexar(); return indice[id] || null; }
  function registrar(o) { N.S.obras.push(o); if (indice) indice[o.id] = o; cacheActivas = null; }
  function tocar() { cacheActivas = null; }
  function activas() {
    if (!cacheActivas) cacheActivas = N.S.obras.filter(function (o) { return o.et !== 'terminada'; });
    return cacheActivas;
  }
  function delEstudio(est, etapas) {
    const fuente = etapas && etapas.indexOf('terminada') < 0 ? activas() : N.S.obras;
    return fuente.filter(function (o) { return o.est === est && (!etapas || etapas.indexOf(o.et) >= 0); });
  }
  function enProduccion(est) { return delEstudio(est, ['desarrollo', 'preproduccion', 'rodaje', 'posproduccion']); }
  function enCartelera() { return activas().filter(function (o) { return o.et === 'cartelera'; }); }

  // ---------- Títulos ----------
  function tituloNuevo(gen) {
    const fam = D.familiaDe[gen && gen[0]] || 'DR';
    const t1 = N.elegir(D.titulo1), t2 = N.elegir(D.titulo2);
    const r = N.azar();
    if (r < 0.55) return t1 + ' ' + t2;
    if (r < 0.75) return 'El ' + t1.toLowerCase() + ' ' + t2;
    if (r < 0.9) {
      const tema = N.elegir(D.temas);
      return (fam === 'SM' ? 'Sombras de ' : fam === 'RD' ? 'Un amor y ' : fam === 'AA' ? 'Operación ' : '') + tema;
    }
    return t1;
  }
  // Clasificaciones disponibles en el año (antes de 1968 la censura no deja estrenar lo más fuerte)
  function clasificacionesDisponibles(anio, gen) {
    const erotico = gen && gen.indexOf('Erótico') >= 0;
    return D.clasificaciones.filter(function (c) {
      if (c.desde > anio) return false;
      if (erotico && ['18', 'R', 'X'].indexOf(c.id) < 0) return false; // regla del género Erótico
      return true;
    }).map(function (c) { return c.id; });
  }
  // La recomendada sale del contenido típico de la familia (la clasificación se calcula desde el contenido)
  function clasificacionRecomendada(gen, anio) {
    const fam = D.familiaDe[gen[0]] || 'DR';
    return ART.ideas.clasificar({ gen: gen, clasN: fam === 'AV' }, anio);
  }
  // Reglas de la combinación de géneros. Devuelve un texto de error o ''.
  function validarGeneros(gen, anio) {
    if (!gen.length) return 'Elige al menos un género.';
    if (gen.length > 3) return 'Máximo tres géneros.';
    const fams = gen.map(function (g) { return D.familiaDe[g]; });
    if (gen.indexOf('Erótico') >= 0 && fams.indexOf('FJ') >= 0) return 'Lo erótico nunca va con públicos infantiles, familiares o adolescentes.';
    const a = anio === undefined ? (N.S ? N.anio() : 2000) : anio;
    if (gen.indexOf('Erótico') >= 0 && a < D.ANIO_CLASIFICACION_POR_EDADES) return 'Antes de 1968 la censura de la época no deja estrenar obras eróticas (solo existen con clasificación de adultos).';
    return '';
  }

  // ---------- Borrador: la obra antes de empezar ----------
  // Campos de la fábrica de ideas que se copian de las opciones (las obras de los rivales usan los de siempre)
  const CAMPOS_IDEA = ['med', 'nat', 'tipo', 'sub', 'prob', 'arco', 'sarc', 'fic', 'corr', 'estilo', 'prio', 'fmt', 'epo', 'lug', 'idio', 'pubs',
    'cont', 'min', 'cx', 'rit', 'fx', 'ia', 'presM', 'clasN', 'mat', 'rod', 'ideaIA', 'guionC', 'guionPagado', 'derechos', 'suave', 'pj', 'sin',
    'extras', 'terceros', 'pctT', 'pre'];
  function borrador(est, opciones) {
    const anio = N.anio();
    const o = opciones || {};
    let gen = (o.gen || ['Drama']).slice(0, 3);
    if (validarGeneros(gen, anio)) gen = gen.filter(function (g) { return g !== 'Erótico'; });
    if (!gen.length) gen = ['Romance'];
    const fam = D.familiaDe[gen[0]] || 'DR';
    const escala = o.escala === undefined ? 2 : o.escala;
    const tono = o.tono || 'Realista';
    const b = {
      id: 0, est: est, tit: o.tit || tituloNuevo(gen), gen: gen, fam: fam, tono: tono,
      tem: o.tem ? o.tem.slice() : [N.elegir(D.temas)], esc: escala, anioPlan: anio, eq: { int: [] }, nivM: 2,
    };
    CAMPOS_IDEA.forEach(function (k) { if (o[k] !== undefined) b[k] = N.copiar(o[k]); });
    if (o.completa) ART.ideas.completar(b, anio);
    if (b.clasN === undefined && fam === 'AV') b.clasN = true; // el arte y la vanguardia van al circuito de festivales (N)
    b.clas = o.clas || ART.ideas.clasificar(b, anio);
    b.pp = Math.round(ART.ideas.costoProduccion(b, anio) * (o.costoPais || 1));
    return b;
  }
  // Recalcula lo que depende de las decisiones (familia, contenido, clasificación y costo) sin tocar el equipo
  function recalcular(b) {
    const anio = N.anio();
    b.fam = D.familiaDe[b.gen[0]] || 'DR';
    if (b.cont || ART.ideas.hayNinos(b)) ART.ideas.normalizar(b, anio); else b.clas = ART.ideas.clasificar(b, anio);
    if (b.presM) b.esc = escalaCercana(b.presM);
    b.pp = Math.round(ART.ideas.costoProduccion(b, anio) * (1 + ART.ideas.paqueteMusica(b.mus).k));
    return b;
  }
  function escalaCercana(m) {
    let mejor = 0;
    D.escalas.forEach(function (e, i) { if (Math.abs(Math.log(e.mult / m)) < Math.abs(Math.log(D.escalas[mejor].mult / m))) mejor = i; });
    return mejor;
  }
  function escalaTono(tono) { const to = D.tonos.filter(function (x) { return x.id === tono; })[0]; return to && to.costo ? to.costo : 1; }
  function idsEquipo(o) {
    const ids = [];
    TODOS_ROLES.forEach(function (r) { if (o.eq[r] !== undefined && o.eq[r] !== null) ids.push(o.eq[r]); });
    return ids.concat(o.eq.int || [], o.eq.inv || [], o.eq.cam || []);
  }
  // Los secundarios cobran la mitad (menos días de rodaje), los invitados especiales el 40 % de su tarifa y los
  // cameos el 15 %; un guion comprado ya pagó al escritor
  const PARTE_SECUNDARIO = 0.5, PARTE_INVITADO = 0.4, PARTE_CAMEO = 0.15;
  function esSecundario(o, id) { return !!(o.pj && o.pj.some(function (p) { return p.t === id && p.i === 'secundario'; })); }
  function costoTalento(o) {
    let s = 0;
    // Tarifa para este estudio (exclusivos y becados) menos el descuento por porcentaje de taquilla
    const t = function (id) { const x = T.porId(id); return x ? T.salarioCon(T.tarifaPara(x, o.est), o.pctT && o.pctT[id] || 0) : 0; };
    TODOS_ROLES.forEach(function (r) { if (o.eq[r] !== undefined && o.eq[r] !== null && !(r === 'guion' && o.guionPagado)) s += t(o.eq[r]); });
    (o.eq.int || []).forEach(function (id) { s += t(id) * (esSecundario(o, id) ? PARTE_SECUNDARIO : 1); });
    (o.eq.inv || []).forEach(function (id) { s += t(id) * PARTE_INVITADO; });
    (o.eq.cam || []).forEach(function (id) { s += t(id) * PARTE_CAMEO; });
    return s;
  }
  // Arma el equipo recomendado dentro de un tope por rol (relativo al presupuesto típico de la época). Prefiere la
  // afinidad con la familia y descarta a quien no firmaría (fama del estudio, clasificación, edad).
  function equipoRecomendado(o, ambicion, azarEleccion) {
    const anio = N.anio();
    const tipico = E.presupuestoTipico(anio);
    const a = ambicion === undefined ? 1 : ambicion;
    const k = ART.taxonomia.ORDEN_CLAS.indexOf(o.clas);
    const op = { est: o.est, fam: o.fam || D.familiaDe[o.gen[0]], clas: k >= 0 ? k : 2 };
    const usados = [];
    // Los roles opcionales que ya no hacen falta (menos efectos, estudio externo) se sueltan
    const roles = rolesDe(o);
    ROLES_EXTRA.forEach(function (r) { if (roles.indexOf(r) < 0 && o.eq[r] !== undefined) delete o.eq[r]; });
    roles.forEach(function (r) {
      if (o.eq[r] !== undefined && o.eq[r] !== null) { usados.push(o.eq[r]); return; }
      const of = D.oficio(r);
      const d = T.porId(o.eq.direccion);
      const opR = r === 'guion' && d ? Object.assign({ dir: d.hab }, op) : op;
      const t = T.mejorDisponible(r, of.base * tipico * 2.2 * a, usados, null, azarEleccion, opR) || T.mejorDisponible(r, Infinity, usados, null, 0, opR);
      if (t) { o.eq[r] = t.id; usados.push(t.id); }
      // Sin animador libre, la animación se encarga a un estudio externo
      else if (r === 'animacion') { o.ext = o.ext || {}; o.ext.animacion = ART.rodaje.externosDisponibles('animacion', anio).length > 1 ? 'reconocido' : 'local'; }
    });
    const dirHab = T.porId(o.eq.direccion) ? T.porId(o.eq.direccion).hab : undefined;
    (o.eq.inv || []).concat(o.eq.cam || []).forEach(function (id) { usados.push(id); });
    const base = D.oficio('interprete').base * tipico * a;
    if (o.pj) {
      // Cada protagonista y secundario tiene su intérprete contratado: primero se reaprovechan los que ya
      // estaban, después se busca a quien encaje en sexo y edad
      const papeles = o.pj.filter(function (p) { return p.i === 'protagonista'; }).concat(o.pj.filter(function (p) { return p.i === 'secundario'; }));
      const enUso = {};
      papeles.forEach(function (p) { if (p.t !== null && p.t !== undefined) { if (enUso[p.t]) p.t = null; else enUso[p.t] = 1; } }); // nadie hace dos papeles
      const sueltos = (o.eq.int || []).filter(function (id, k, a) { return !enUso[id] && a.indexOf(id) === k; });
      papeles.forEach(function (p, i) {
        if (p.t === null || p.t === undefined) {
          if (sueltos.length) p.t = sueltos.shift();
          else {
            const tope = base * (p.i === 'protagonista' ? (i === 0 ? 3 : 2) : 2 * 0.6); // un secundario cobra la mitad
            const op2 = Object.assign({ edad: p.e, imp: o.est === 0 ? p.i : undefined, dir: o.est === 0 ? dirHab : undefined }, op);
            let t = T.mejorDisponible('interprete', tope, usados, p.s, azarEleccion, op2) || T.mejorDisponible('interprete', tope, usados, null, azarEleccion, op2) ||
              T.mejorDisponible('interprete', Infinity, usados, null, 0, op2);
            // Sin niños libres de esa edad, sirve cualquier niño; y si no hay, el personaje crece a 18
            if (!t && p.e < 16) t = T.mejorDisponible('interprete', Infinity, usados, null, 0, Object.assign({}, op2, { edad: undefined, nino: true }));
            if (!t && p.e < 16 && o.est !== 0) { p.e = 18; t = T.mejorDisponible('interprete', Infinity, usados, null, 0, Object.assign({}, op2, { edad: 18 })); }
            p.t = t ? t.id : null;
          }
        }
        if (p.t !== null && p.t !== undefined) usados.push(p.t);
      });
      o.eq.int = papeles.filter(function (p) { return p.t !== null && p.t !== undefined; }).map(function (p) { return p.t; });
      return o;
    }
    const ints = (o.eq.int || []).slice();
    ints.forEach(function (id) { usados.push(id); });
    const sexos = N.probabilidad(0.5) ? ['F', 'M'] : ['M', 'F'];
    while (ints.length < 2) {
      const tope = base * (ints.length === 0 ? 3 : 2);
      const t = T.mejorDisponible('interprete', tope, usados, sexos[ints.length], azarEleccion, op) || T.mejorDisponible('interprete', tope, usados, null, 0, op) || T.mejorDisponible('interprete', Infinity, usados, null, 0, op);
      if (!t) break;
      ints.push(t.id); usados.push(t.id);
    }
    o.eq.int = ints;
    return o;
  }
  // ---------- Negociación del equipo de una obra del jugador ----------
  // Rol de cada talento contratado: oficio, importancia del personaje (intérpretes), invitado o cameo
  function contratos(o) {
    const out = [];
    TODOS_ROLES.forEach(function (r) { if (o.eq[r] !== undefined && o.eq[r] !== null) out.push({ id: o.eq[r], rol: r }); });
    (o.eq.int || []).forEach(function (id) { const p = (o.pj || []).filter(function (x) { return x.t === id; })[0]; out.push({ id: id, rol: 'interprete', imp: p ? p.i : 'protagonista', pj: p }); });
    (o.eq.inv || []).forEach(function (id) { out.push({ id: id, rol: 'interprete', imp: 'invitado' }); });
    (o.eq.cam || []).forEach(function (id) { out.push({ id: id, rol: 'interprete', imp: 'cameo' }); });
    return out;
  }
  function contextoNegociacion(o, c) {
    const k = ART.taxonomia.ORDEN_CLAS.indexOf(o.clas);
    const d = T.porId(o.eq.direccion);
    return { est: o.est, rol: c.rol, imp: c.imp, clas: k >= 0 ? k : 2, dir: d && c.rol !== 'direccion' ? d.hab : undefined, amor: o.cont ? o.cont.amor : 0, fam: o.fam };
  }
  // Qué dice cada uno: lista de { id, rol, imp, r: resultado de la negociación, ok: si se cumplen sus condiciones }
  function negociaciones(o) {
    return contratos(o).map(function (c) {
      const t = T.porId(c.id);
      if (o.guionPagado && c.rol === 'guion') return Object.assign({ r: { estado: 'acepta', texto: 'Guion comprado' }, ok: true }, c);
      if (T.exclusivoDe(t) === o.est) return Object.assign({ r: { estado: 'acepta', texto: 'Exclusivo de tu estudio' }, ok: true }, c);
      const r = T.negociar(t, contextoNegociacion(o, c));
      let ok = r.estado === 'acepta';
      if (r.estado === 'contraoferta') ok = ((o.pctT && o.pctT[c.id]) || 0) >= r.pctMin;
      return Object.assign({ r: r, ok: ok }, c);
    });
  }
  // Acepta las contraofertas (pone el porcentaje pedido) y quita a quien rechaza o exige lo que no se cumple
  function resolverNegociaciones(o) {
    const quitados = [];
    negociaciones(o).forEach(function (n) {
      if (n.ok) return;
      if (n.r.estado === 'contraoferta') { o.pctT = o.pctT || {}; o.pctT[n.id] = n.r.pctMin; return; }
      quitados.push(n.id);
      if (n.rol !== 'interprete') o.eq[n.rol] = null;
      else {
        o.eq.int = (o.eq.int || []).filter(function (x) { return x !== n.id; });
        o.eq.inv = (o.eq.inv || []).filter(function (x) { return x !== n.id; });
        o.eq.cam = (o.eq.cam || []).filter(function (x) { return x !== n.id; });
        (o.pj || []).forEach(function (p) { if (p.t === n.id) p.t = null; });
      }
      if (o.pctT) delete o.pctT[n.id];
    });
    return quitados;
  }
  // Recomendado completo: arma el equipo y lo negocia hasta que todos firman (máximo 4 vueltas)
  // Ajusta solo los roles opcionales (vestuario, efectos y animación) sin tocar el resto del equipo
  function ajustarRolesExtra(o, ambicion) {
    const roles = rolesDe(o);
    ROLES_EXTRA.forEach(function (r) { if (roles.indexOf(r) < 0 && o.eq[r] !== undefined) delete o.eq[r]; });
    const tipico = E.presupuestoTipico(N.anio()), a = ambicion || 1;
    const k = ART.taxonomia.ORDEN_CLAS.indexOf(o.clas);
    const op = { est: o.est, fam: o.fam || D.familiaDe[o.gen[0]], clas: k >= 0 ? k : 2 };
    const usados = idsEquipo(o);
    ROLES_EXTRA.forEach(function (r) {
      if (roles.indexOf(r) < 0 || (o.eq[r] !== undefined && o.eq[r] !== null)) return;
      const t = T.mejorDisponible(r, D.oficio(r).base * tipico * 2.2 * a, usados, null, 0, op) || T.mejorDisponible(r, Infinity, usados, null, 0, op);
      if (t) { o.eq[r] = t.id; usados.push(t.id); }
      else if (r === 'animacion') { o.ext = o.ext || {}; o.ext.animacion = ART.rodaje.externosDisponibles('animacion', N.anio()).length > 1 ? 'reconocido' : 'local'; }
    });
    return o;
  }
  function equipoNegociado(o, ambicion, azarEleccion) {
    const vetados = [];
    for (let i = 0; i < 8; i++) {
      equipoRecomendado(o, ambicion, azarEleccion);
      const q = resolverNegociaciones(o);
      if (!q.length) break;
      q.forEach(function (id) { vetados.push(id); const t = T.porId(id); if (t) t._veto = 1; });
      if (i === 7) equipoRecomendado(o, ambicion, azarEleccion); // última vuelta: llena los huecos
    }
    vetados.forEach(function (id) { const t = T.porId(id); if (t) delete t._veto; });
    return o;
  }
  function equipoCompleto(o) {
    if (!ROLES.every(function (r) { return o.eq[r] !== undefined && o.eq[r] !== null; }) || !o.eq.int || !o.eq.int.length) return false;
    // Una obra animada necesita quien anime: un animador o un estudio externo
    if (ART.rodaje.necesita(o, 'animacion') && !(o.eq.animacion !== undefined && o.eq.animacion !== null) && !ART.rodaje.esExterno(o, 'animacion')) return false;
    // Con personajes, cada protagonista y secundario necesita intérprete
    return !o.pj || o.pj.every(function (p) { return (p.i !== 'protagonista' && p.i !== 'secundario') || (p.t !== null && p.t !== undefined); });
  }
  // Duración por etapa en semanas (la escala alarga el rodaje; las salas propias aceleran)
  // Las películas de los primeros años eran cortos: se hacían en pocas semanas
  const EPOCA_DURACION = [[1895, 0.4], [1910, 0.55], [1925, 1]];
  function duraciones(o, rapidez) {
    const esc = D.escalas[o.esc];
    const r = rapidez || {};
    const anio = o.anioPlan || N.anio();
    const f = esc.semanas * N.interp(EPOCA_DURACION, anio);
    const a = ART.ideas.ajusteSemanas(o, anio); // animación, duración, efectos, IA e idea automática
    const tv = ART.tv.factorSemanas(o); // series: más episodios, más rodaje
    return {
      desarrollo: Math.max(1, Math.round(5 * f) - (r.guion || 0) + a.desarrollo),
      preproduccion: Math.max(1, Math.round(4 * f) + (a.preExtra || 0)),
      rodaje: Math.max(2, Math.round(8 * f * a.rodaje * tv) + (a.rodExtra || 0)),
      posproduccion: Math.max(2, Math.round(7 * f * a.posproduccion) - (r.edicion || 0) + (o.fam === 'IM' || o.fam === 'AA' ? 1 : 0) + a.posExtra),
    };
  }
  function semanasTotales(o, rapidez) {
    const d = duraciones(o, rapidez);
    return d.desarrollo + d.preproduccion + d.rodaje + d.posproduccion;
  }
  // Estimación para mostrar antes de confirmar (sin gastar azar)
  function estimar(o, bonos) {
    const q = E.calidadBase(o, T.porId, bonos || {});
    const ct = costoTalento(o);
    const cm = E.marketingTipico(N.anio()) * D.nivelesMarketing[o.nivM === undefined ? 2 : o.nivM].mult;
    const pp = Math.round(o.pp * (1 - ART.negocio.ahorro(o.est)));
    const der = o.derechos || 0;
    const calidad = Math.round(N.limitar(q, 1, 99));
    return { calidad: calidad, talento: ct, produccion: pp, marketing: cm, derechos: der, total: ct + pp + cm + der, retorno: ART.ideas.retornoEstimado(calidad) };
  }
  // Convierte el borrador en obra real (la producción la mueve cada semana)
  function crear(b) {
    const o = N.copiar(b);
    o.id = N.sigId();
    o.et = 'desarrollo';
    o.t0 = N.S.t;
    o.cf = Math.round(costoTalento(o));
    o.gp = 0; // gasto de producción acumulado
    o.cm = 0;
    o.bruto = 0; o.parte = 0;
    o.cr = creditos(o);
    if (o.est === 0 && o.pj) {
      o.sin = o.sin || ART.ideas.sinopsis(o);
      o.frc = ART.ideas.fraseCritica(o);
      o.frp = ART.ideas.frasePremio(o);
    }
    registrar(o);
    if (o.fr) ART.franquicias.alCrear(o); // franquicias
    if (o.tv) ART.tv.alCrear(o); // series vendidas con el pitch
    ART.imperio.alCrear(o); // encargos recibidos
    return o;
  }
  // Créditos con nombre (quedan aunque el talento se retire y se borre del mundo)
  function creditos(o) {
    const n = function (id) { const t = T.porId(id); return t ? t.nom : ''; };
    return {
      direccion: n(o.eq.direccion), guion: n(o.eq.guion), musica: n(o.eq.musica), produccion: n(o.eq.produccion),
      reparto: (o.eq.int || []).map(n), sx: (o.eq.int || []).map(function (id) { const t = T.porId(id); return t ? t.sx : ''; }),
      ejecutiva: o.est === 0 && N.S.avatar ? N.S.avatar.nom : '',
    };
  }
  // Datos que necesita el arte para el póster
  function paraPoster(o) {
    const est = N.S.estudios[o.est];
    return {
      id: o.id, titulo: o.tit, generos: o.gen, temas: o.tem || [], anio: o.anio || o.anioPlan, etapa: o.et,
      crit: o.et === 'cartelera' || o.et === 'terminada' ? o.crit : null,
      pub: o.et === 'cartelera' || o.et === 'terminada' ? o.pub : null,
      clas: o.clas, premiosGanados: (o.aw || []).length, creditos: o.cr || {},
      estudio: { nombre: est ? est.nombre : '', logo: est ? est.logo : null },
    };
  }
  // Multiplicador (bruto ÷ costo) y resultado neto para el estudio
  function costoTotal(o) { return (o.cf || 0) + (o.gp || 0) + (o.cm || 0) + (o.part || 0); }
  // Multiplicador: taquilla ÷ costo. Un estreno directo en video o streaming se mide por lo que dejan sus ventanas
  // como si fuera taquilla (el estudio se queda con algo más de la mitad de lo que pagan los cines)
  function multiplicador(o) { const c = costoTotal(o); if (c <= 0) return 0; return o.dir ? ((o.vt ? o.vt.total : 0) / 0.55) / c : (o.bruto || 0) / c; }
  // Lo que ganó el estudio: taquilla, ventanas (video, TV, streaming) y merchandising, menos todo lo que costó
  function ingresosTotales(o) { return (o.parte || 0) + (o.vt ? o.vt.total : 0) + (o.merch || 0); }
  function neto(o) { return ingresosTotales(o) - costoTotal(o); }

  const DETALLE_IDEA = ['cont', 'fmt', 'pubs', 'sub', 'sarc', 'fic', 'corr', 'estilo', 'prio', 'idio', 'rod', 'cx', 'rit', 'fx', 'presM', 'clasN',
    'derechos', 'guionId', 'guionPagado', 'lug', 'prob', 'min', 'iar', 'fxr', 'frc', 'extras', 'terceros', 'pctT', 'fat',
    'met', 'ter', 'pst', 'rep', 'ext', 'setR', 'lp', 'prueba', 'dq', 'dcrit', 'dpub', 'ddes', 'notas'];
  // Historial compacto: de las obras viejas de los rivales queda el resumen y el detalle semanal se borra
  function compactar() {
    const S = N.S, t = S.t;
    const BORRAR = ['eq', 'acc', 'tem', 'u', 'delta', 'inf', 'dur', 'sr', 'semProd', 'sobre', 't0', 'tLista', 'prog', 'anioPlan', 'max', 'exp', 'tono', 'esc',
      'sub', 'prob', 'arco', 'cont', 'ia', 'iar', 'fxr', 'presM', 'clasN', 'derechos', 'fat', 'feR', 'pctT',
      'met', 'ter', 'pst', 'rep', 'ext', 'setR', 'lp', 'dq', 'dcrit', 'dpub', 'ddes', 'notas', 'plan', 'campana', 'cmD', 'cmP'];
    S.obras.forEach(function (o) {
      if (o.et !== 'terminada') return;
      // Series viejas: de las audiencias por episodio queda el promedio
      if (o.tv && o.tv.em && o.tv.em.aud.length > 1 && t - (o.fe || 0) > 104) o.tv.em.aud = [N.redondear(o.tv.em.aud.reduce(function (x, y) { return x + y; }, 0) / o.tv.em.aud.length, 2)];
      // Ventanas terminadas de los rivales: solo queda lo cobrado
      if (o.est !== 0 && o.vt && o.vt.fin && (o.vt.video || o.vt.tv || o.vt.streaming)) o.vt = { total: o.vt.total, cob: o.vt.cob, fin: 1 };
      // Tus obras: la mezcla de canales no se usa después del estreno y de las ventanas cerradas quedan sus cifras
      if (o.est === 0 && t - (o.fe || 0) > 52 * 2) {
        if (o.plan && o.plan.mix) delete o.plan.mix;
        if (o.plan && o.plan.reg && Object.keys(o.plan.reg).every(function (r) { return o.plan.reg[r] === 'amplio'; })) delete o.plan.reg;
        if (t - (o.fe || 0) > 52 * 25) ['plan', 'campana', 'cmD', 'cmP'].forEach(function (k) { delete o[k]; });
        if (o.vt && o.vt.fin) ['video', 'tv', 'streaming'].forEach(function (k) {
          const w = o.vt[k];
          if (w && w.t0 !== undefined) {
            const c = { total: Math.round(w.total + (w.prev || 0)) };
            ['copias', 'esp', 'vistas', 'fmt'].forEach(function (x) { if (w[x] !== undefined) c[x] = w[x]; });
            o.vt[k] = c;
          }
        });
      }
      if (o.hs && (t - (o.fe || 0) > 52 * (o.est === 0 ? 30 : 2)) && !o.fav) delete o.hs;
      if (o.est !== 0 && t - (o.fe || 0) > 52 * 4 && o.eq) {
        BORRAR.forEach(function (k) { delete o[k]; });
        if (o.cr) o.cr = { direccion: o.cr.direccion, reparto: o.cr.reparto, sx: o.cr.sx };
      }
      // Tus obras de hace más de 25 años quedan con su ficha, créditos e informe, sin el detalle técnico
      if (o.est === 0 && t - (o.fe || 0) > 52 * 25 && o.dur) {
        ['acc', 'u', 'delta', 'dur', 'sr', 'semProd', 'sobre', 't0', 'tLista', 'prog', 'anioPlan', 'max', 'eq'].forEach(function (k) { delete o[k]; });
        // De la idea quedan la sinopsis, los géneros, temas, arco, material y los protagonistas (sin el detalle técnico)
        DETALLE_IDEA.forEach(function (k) { delete o[k]; });
        if (o.pj) o.pj = o.pj.filter(function (p) { return p.i === 'protagonista'; }).map(function (p) { return { n: p.n, e: p.e, s: p.s, i: p.i, a: p.a }; });
      }
    });
    // Las obras de rivales muy viejas y sin premios se resumen por año para que el guardado no crezca sin fin
    const limite = t - 52 * 40;
    const viejas = S.obras.filter(function (o) { return o.est !== 0 && o.et === 'terminada' && (o.fe || 0) < limite && !(o.aw && o.aw.length) && !o.top; });
    if (viejas.length) {
      viejas.forEach(function (o) {
        const k = o.anio;
        const r = S.resumenAnios[k] = S.resumenAnios[k] || { obras: 0, bruto2025: 0 };
        r.obras++;
        r.bruto2025 += Math.round(ART.mundo.aHoy(o.bruto || 0, o.anio));
      });
      const borrar = {};
      viejas.forEach(function (o) { borrar[o.id] = 1; });
      S.obras = S.obras.filter(function (o) { return !borrar[o.id]; });
      reindexar();
    }
  }

  return {
    ETAPAS: ETAPAS, NOMBRE_ETAPA: NOMBRE_ETAPA, ROLES: ROLES, ROLES_EXTRA: ROLES_EXTRA, TODOS_ROLES: TODOS_ROLES, rolesDe: rolesDe, reindexar: reindexar, porId: porId, tocar: tocar, activas: activas,
    delEstudio: delEstudio, enProduccion: enProduccion, enCartelera: enCartelera, tituloNuevo: tituloNuevo,
    clasificacionesDisponibles: clasificacionesDisponibles, clasificacionRecomendada: clasificacionRecomendada,
    contratos: contratos, negociaciones: negociaciones, resolverNegociaciones: resolverNegociaciones, equipoNegociado: equipoNegociado,
    validarGeneros: validarGeneros, borrador: borrador, recalcular: recalcular, escalaCercana: escalaCercana, idsEquipo: idsEquipo, costoTalento: costoTalento,
    PARTE_SECUNDARIO: PARTE_SECUNDARIO, PARTE_INVITADO: PARTE_INVITADO, PARTE_CAMEO: PARTE_CAMEO,
    equipoRecomendado: equipoRecomendado, equipoCompleto: equipoCompleto, ajustarRolesExtra: ajustarRolesExtra, duraciones: duraciones,
    semanasTotales: semanasTotales, estimar: estimar, crear: crear, paraPoster: paraPoster,
    creditosDe: creditos, costoTotal: costoTotal, multiplicador: multiplicador, neto: neto, ingresosTotales: ingresosTotales, compactar: compactar, escalaTono: escalaTono,
  };
})();
