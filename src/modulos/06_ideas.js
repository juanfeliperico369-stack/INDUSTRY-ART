/* ==== módulo: ideas ==== */
// El motor de la fábrica de ideas: completa una idea con valores por defecto, calcula la clasificación desde el
// contenido (respetando la censura de la época y la regla del género Erótico), el encaje entre familias que se
// descubre jugando, la sinopsis y las frases, los personajes, el costo y las semanas que suman las decisiones, el
// efecto en la calidad, la crítica y el público, el dominio público, los guiones en venta y la idea automática con IA.
// No toca el DOM. Todo azar sale de ART.n (la interfaz lo redirige a su propio azar cuando solo se está mirando).
ART.ideas = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, X = ART.taxonomia;
  const LIMITES = { gen: 3, sub: 6, tem: 9, prob: 3, sarc: 2, pubs: 5 };
  const ANIO_IA = 2022;
  const ANIO_SIN_CENSURA = D.ANIO_CLASIFICACION_POR_EDADES; // 1968
  const CLAS_MAX_CENSURA = 3; // antes de 1968, lo más fuerte que se estrena es "16"
  const E = function () { return ART.economia; };
  const T = function () { return ART.talentos; };

  // ---------- Valores de una idea (con los de siempre cuando falta un campo) ----------
  function familia(o) { return D.familiaDe[o.gen && o.gen[0]] || 'DR'; }
  function duracionTipica(anio) { return Math.round(N.interp(X.DURACION_TIPICA, anio)); }
  function v(o, k, porDefecto) { return o[k] === undefined || o[k] === null ? porDefecto : o[k]; }
  function contenidoDe(o) { return o.cont || X.contenidoFamilia[familia(o)]; }
  function nivelEfectos(o) { return N.limitar(v(o, 'fx', 2), 0, 4); }
  // Completa un borrador del jugador con todos los campos de la idea (las obras de los rivales usan los de siempre)
  function completar(b, anio) {
    const fam = familia(b);
    if (!b.med) b.med = 'cine';
    if (!b.nat) b.nat = 'f';
    if (!b.tipo) b.tipo = 'real';
    ['sub', 'tem', 'prob', 'sarc', 'pubs'].forEach(function (k) { if (!b[k]) b[k] = []; });
    if (!b.pre) b.pre = premisasRecomendadas(fam, b.est === 0 ? 0 : undefined);
    if (b.arco === undefined) b.arco = '';
    if (!b.fic) b.fic = 'Estándar';
    if (!b.corr) b.corr = X.ESTANDAR;
    if (!b.estilo) b.estilo = 'General';
    if (!b.prio) b.prio = 'Híbrido';
    if (!b.fmt) b.fmt = X.formatoEstandar(anio);
    if (!b.epo) b.epo = 'actualidad';
    if (b.lug === undefined) b.lug = '';
    if (!b.idio) b.idio = idiomaDeEstudio(b.est);
    if (!b.cont) b.cont = Object.assign({}, X.contenidoFamilia[fam]);
    if (!b.min) b.min = duracionTipica(anio);
    if (b.cx === undefined) b.cx = 2;
    // Cómo se filma (método, terreno y estilo de producción); se recomiendan según la idea
    if (!b.pst) b.pst = 'clasico';
    if (!b.met) b.met = ART.rodaje.metodoRecomendado(b, anio);
    if (!b.ter) b.ter = ART.rodaje.terrenoRecomendado(b);
    if (b.rit === undefined) b.rit = 2;
    if (b.fx === undefined) b.fx = 2;
    if (b.ia === undefined) b.ia = 0;
    if (!b.presM) b.presM = D.escalas[v(b, 'esc', 2)].mult;
    if (b.clasN === undefined) b.clasN = fam === 'AV';
    return b;
  }
  function idiomaDeEstudio(est) {
    const e = N.S && N.S.estudios[est || 0];
    const p = e ? D.pais(e.pais) : null;
    if (!p) return 'Inglés';
    const primero = p.idioma.split(' ')[0];
    return X.idioma(primero) ? primero : 'Inglés';
  }

  // ---------- Contenido y clasificación ----------
  function nivelMaximoEpoca(anio) { return anio < ANIO_SIN_CENSURA ? CLAS_MAX_CENSURA : 7; }
  function hayMenores(o) {
    return (o.pj || []).some(function (p) { return p.e < 18 && (p.i === 'protagonista' || p.i === 'secundario'); });
  }
  // Niños en el elenco (menores de 16): los interpretan niños actores, que solo hacen obras hasta PG-13
  function hayNinos(o) {
    return (o.pj || []).some(function (p) { return p.e < 16 && (p.i === 'protagonista' || p.i === 'secundario'); });
  }
  // Ajusta el contenido a lo que permite la época, los subgéneros y los personajes (nunca se sexualiza a menores)
  function normalizar(b, anio) {
    const cont = b.cont = Object.assign({}, contenidoDe(b));
    (b.sub || []).forEach(function (s) {
      const m = X.subMinimos[s];
      if (m) Object.keys(m).forEach(function (k) { if (cont[k] < m[k]) cont[k] = m[k]; });
    });
    if ((b.gen || []).indexOf('Erótico') >= 0 && cont.amor < 3) cont.amor = 3;
    const tope = nivelMaximoEpoca(anio);
    X.contenido.forEach(function (c) {
      while (cont[c.id] > 0 && c.niveles[cont[c.id]][1] > tope) cont[c.id]--;
      if (cont[c.id] > c.niveles.length - 1) cont[c.id] = c.niveles.length - 1;
    });
    if (hayMenores(b) && cont.amor > 1) cont.amor = 1;
    if (hayNinos(b)) X.contenido.forEach(function (c) { while (cont[c.id] > 0 && c.niveles[cont[c.id]][1] > 2) cont[c.id]--; });
    b.clas = clasificar(b, anio);
    return b;
  }
  // La clasificación sale del contenido: la más alta que exija cualquiera de sus partes
  function indiceClasificacion(o) {
    const cont = contenidoDe(o);
    let k = 0;
    X.contenido.forEach(function (c) { const n = c.niveles[N.limitar(cont[c.id] || 0, 0, c.niveles.length - 1)]; if (n[1] > k) k = n[1]; });
    if ((o.gen || []).indexOf('Erótico') >= 0 && k < 5) k = 5; // lo erótico es siempre de adultos
    return k;
  }
  function clasificar(o, anio) {
    const k = Math.min(indiceClasificacion(o), nivelMaximoEpoca(anio));
    // N: general, para personas ya desarrolladas, con contenido moderado y controlado (hasta PG-13)
    if (o.clasN && k <= 2 && (o.gen || []).indexOf('Erótico') < 0) return 'N';
    return X.ORDEN_CLAS[k];
  }
  // Descripción del contenido (lo de adultos dice "siempre sugerido")
  function describirContenido(o) {
    const cont = contenidoDe(o);
    return X.contenido.map(function (c) {
      const n = c.niveles[cont[c.id] || 0];
      return c.nombre.split(' ')[0].toLowerCase() + ': ' + (n[0] === 'Sin violencia' ? 'ninguna' : n[0].toLowerCase()) + (n[1] >= 5 ? ' (siempre sugerido)' : '');
    }).join(' · ');
  }

  // ---------- Reglas ----------
  function validar(b, anio) {
    const gen = b.gen || [];
    const err = ART.obras.validarGeneros(gen, anio);
    if (err) return err;
    const erotico = gen.indexOf('Erótico') >= 0;
    if (erotico && (b.pubs || []).some(function (p) { const x = X.publico(p); return x && x.infantil; })) return 'Lo erótico nunca va con públicos infantiles, familiares o adolescentes.';
    if (erotico && (b.pj || []).some(function (p) { return p.e < 18; })) return 'En una obra erótica todos los personajes son mayores de edad.';
    if (hayNinos(b) && indiceClasificacion(b) > 2) return 'Con niños en el elenco la obra no pasa de PG-13 (los niños actores solo hacen obras hasta PG-13): baja el contenido o sube la edad del personaje.';
    if (b.nat === 'r' && gen.some(function (g) { return D.familiaDe[g] === 'IM'; })) return 'Una obra de realidad no puede ser de imaginación: elige ficción o cambia el género.';
    if (b.nat === 'f' && b.tipo === 'documental') return 'Un documental es una obra de realidad.';
    if (b.nat === 'f' && b.med === 'cine' && !b.arco && b.pj) return 'Las obras de ficción necesitan un arco narrativo.';
    if (b.pj && !(b.prob || []).length) return 'Elige al menos una problemática o argumento.';
    if (b.pj && b.eq && !(b.eq.int || []).length) return 'Tu protagonista necesita un intérprete: elígelo en Personajes o en Equipo.';
    if (b.pj) {
      const cuenta = {};
      b.pj.forEach(function (p) { cuenta[p.i] = (cuenta[p.i] || 0) + 1; });
      if (!cuenta.protagonista) return 'Tu obra necesita al menos un protagonista.';
      const sinActor = b.pj.filter(function (p) { return (p.i === 'protagonista' || p.i === 'secundario') && (p.t === null || p.t === undefined); })[0];
      if (sinActor) return 'Falta contratar a quien interprete a ' + sinActor.n + ' (' + sinActor.i + ').';
      for (let i = 0; i < X.importancias.length; i++) {
        const im = X.importancias[i];
        if ((cuenta[im.id] || 0) > im.max) return 'Máximo ' + im.max + ' personajes de tipo ' + im.nombre.toLowerCase() + '.';
      }
    }
    const tc = X.tipoCine(b.tipo);
    if (tc.desde > anio) return tc.nombre + ' llega en ' + tc.desde + '.';
    if ((b.ia || 0) > 0 && anio < ANIO_IA) return 'La IA generativa llega en ' + ANIO_IA + '.';
    if (X.efectos[v(b, 'fx', 2)].desde > anio) return 'Ese nivel de efectos llega en ' + X.efectos[b.fx].desde + '.';
    return '';
  }

  // ---------- Encaje: suma o resta, y el jugador lo descubre usando cada combinación ----------
  function media(lista) { return lista.length ? lista.reduce(function (a, x) { return a + x; }, 0) / lista.length : 0; }
  function famDeSub(s) { const f = X.famSub[s]; return f && f.indexOf('G:') === 0 ? f.slice(2) : f; }
  function partesEncaje(o) {
    const fam = familia(o);
    const partes = [];
    (o.sub || []).forEach(function (s) {
      const f = famDeSub(s);
      if (!f) return;
      const fs = X.familiasSub.filter(function (x) { return x.id === f; })[0];
      partes.push({ clave: 'S' + f + fam, tipo: 'sub', valor: fs ? fs.afin[fam] : f === fam ? 1 : D.encaje(f, fam) });
    });
    (o.tem || []).forEach(function (t) {
      const f = X.famTema[t];
      const ft = X.familiasTema.filter(function (x) { return x.id === f; })[0];
      if (ft) partes.push({ clave: 'T' + f + fam, tipo: 'tem', valor: ft.afin[fam] });
    });
    const ep = o.epo && o.epo !== 'actualidad' ? X.epoca(o.epo) : null;
    if (ep) partes.push({ clave: 'E' + ep.id + fam, tipo: 'epo', valor: ep.afines.indexOf(fam) >= 0 ? 2 : ep.afines.length ? -1 : 0 });
    const sa = (o.sarc || []).map(X.subarco).filter(Boolean);
    sa.forEach(function (s) { if (s.fam) partes.push({ clave: 'A' + s.id + fam, tipo: 'arco', valor: s.fam === fam ? 2 : 0 }); });
    return partes;
  }
  // Encaje de la idea (además del de los géneros): de −3 a +3
  function encajeIdea(o) {
    const p = partesEncaje(o);
    const sub = media(p.filter(function (x) { return x.tipo === 'sub'; }).map(function (x) { return x.valor; }));
    const tem = media(p.filter(function (x) { return x.tipo === 'tem'; }).map(function (x) { return x.valor; }));
    let extra = 0;
    p.forEach(function (x) { if (x.tipo === 'epo' || x.tipo === 'arco') extra += x.valor / 2; });
    return N.limitar(Math.round(sub * 0.5 + tem * 0.5 + extra * 0.5), -3, 3);
  }
  function clavesEncaje(o) {
    const c = [];
    const fams = ART.economia.familiasDe(o);
    for (let i = 0; i < fams.length; i++) for (let j = i + 1; j < fams.length; j++) c.push(fams[i] + fams[j]);
    partesEncaje(o).forEach(function (p) { c.push(p.clave); });
    return c;
  }
  function marcarEncaje(o) {
    const visto = N.S.encajeVisto;
    clavesEncaje(o).forEach(function (k) {
      visto[k] = 1;
      if (k.length === 4 && /^[A-Z]{4}$/.test(k)) visto[k.slice(2) + k.slice(0, 2)] = 1;
    });
  }
  // Estrellas de 1 a 5 (null si alguna combinación todavía no se ha probado)
  function estrellas(o) {
    const visto = N.S.encajeVisto;
    const nuevas = clavesEncaje(o).filter(function (k) { return !visto[k]; });
    const total = ART.economia.encajeObra(o) + encajeIdea(o);
    const n = total >= 6 ? 5 : total >= 3 ? 4 : total >= 1 ? 3 : total >= -1 ? 2 : 1;
    return { n: nuevas.length ? null : n, nuevas: nuevas.length, total: total };
  }

  // ---------- Costo y semanas ----------
  // Todo lo que encarece o abarata la producción, menos el tamaño (presupuesto) que elige el jugador
  function factorCosto(o, anio) {
    const fam = familia(o);
    let f = X.tipoCine(o.tipo || 'real').costo;
    f *= X.efectos[N.limitar(v(o, 'fx', 2), 0, 4)].costo;
    f *= X.efectoFormato(o.fmt || X.formatoEstandar(anio), anio, fam).costo;
    f *= X.epoca(o.epo || 'actualidad').costo;
    if (o.corr && o.corr !== X.ESTANDAR) f *= X.efectoCorriente(o.corr, anio, fam).costo;
    f *= X.estilo(o.estilo).costo || 1;
    if (o.tv) f *= ART.tv.factorCosto(o);
    f *= ART.imperio.ahorroRodaje(o); // sede propia en el país del rodaje // episodios, sala de guionistas y tramas
    f *= N.limitar(Math.pow(v(o, 'min', duracionTipica(anio)) / duracionTipica(anio), 0.55), 0.35, 2.2);
    if (o.rod) {
      const p = D.pais(o.rod), casa = N.S && N.S.estudios[o.est] ? D.pais(N.S.estudios[o.est].pais) : null;
      if (p && casa) f *= N.limitar(Math.pow(p.costo / casa.costo, 0.6), 0.5, 1.8);
    }
    if (o.ia) f *= 1 - 0.4 * o.ia / 100; // la IA abarata la producción
    f *= ART.rodaje.factorCosto(o, anio); // método, terreno, estilo, sets, viaje, incentivos y estudios externos
    // Extras y terceros (figurantes, dobles y personal de apoyo): un número, cada uno suma un poco al costo
    if (o.pj) {
      let extras = o.extras || 0;
      o.pj.forEach(function (p) { if (p.i === 'extra') extras++; }); // obras con extras como personajes
      f *= 1 + 0.003 * extras + 0.001 * (o.terceros || 0);
    }
    return f;
  }
  function costoProduccion(o, anio) {
    const tipica = E().produccionTipica(anio, familia(o));
    return Math.round(tipica * v(o, 'presM', D.escalas[v(o, 'esc', 2)].mult) * ART.obras.escalaTono(o.tono) * factorCosto(o, anio));
  }
  // Semanas extra o de menos por etapa (animación, duración, efectos, IA)
  function ajusteSemanas(o, anio) {
    const tc = X.tipoCine(o.tipo || 'real');
    const largo = Math.pow(v(o, 'min', duracionTipica(anio)) / duracionTipica(anio), 0.4);
    const fx = v(o, 'fx', 2);
    const r = ART.rodaje.ajusteSemanas(o); // sets, viaje, estilo, método y terreno
    return {
      desarrollo: o.ideaIA ? -2 : 0,
      rodaje: tc.semanas * N.limitar(largo, 0.5, 1.6),
      posproduccion: tc.semanas * (1 - 0.3 * (o.ia || 0) / 100),
      posExtra: (fx >= 3 ? fx - 2 : 0) + r.pos,
      preExtra: r.pre, rodExtra: r.rodaje,
    };
  }
  // Presupuesto relativo a lo típico de la época (para la clase A, B o C)
  function clase(o) {
    const m = v(o, 'presM', D.escalas[v(o, 'esc', 2)].mult);
    return m >= 1.5 ? 'A' : m >= 0.6 ? 'B' : 'C';
  }
  function perfil(o) {
    const k = indiceClasificacion(o), fam = familia(o);
    if (k <= 1 && (fam === 'FJ' || fam === 'HM' || fam === 'IM')) return 'infantil';
    if ((fam === 'DR' || fam === 'AV') && v(o, 'cx', 2) >= 3) return 'seria';
    if (k >= 3) return 'adulta';
    return 'general';
  }

  // ---------- Derechos de material y guiones ----------
  function reglaDominio() { return N.S && N.S.reglaDominio ? N.S.reglaDominio : X.REGLA_DOMINIO; }
  // Año en que una obra queda libre con la regla actual (0 = siempre libre)
  function anioLibre(m) { return m.libre ? m.libre - X.REGLA_DOMINIO + reglaDominio() : 0; }
  function esLibre(m, anio) { return !m.libre || anio >= anioLibre(m); }
  // Antes de liberarse, sus derechos se compran: más caros si es famosa y si falta mucho para que se libere
  function costoDerechos(m, anio) {
    if (esLibre(m, anio)) return 0;
    const faltan = anioLibre(m) - anio;
    return Math.round(E().presupuestoTipico(anio) * (0.04 + 0.22 * m.fama) * (1 + Math.min(60, faltan) / 40));
  }
  // Año de escritura como número (antes de Cristo, negativo; las tradiciones y los siglos, muy antiguos)
  function anioMaterial(m) {
    if (/a\. C\./.test(m.anio)) return -parseInt(m.anio.replace(/[^0-9]/g, ''), 10) || -500;
    const n = m.anio.match(/[0-9]+/);
    return n ? parseInt(n[0], 10) : -1;
  }
  function materialesDisponibles(anio) {
    const S = N.S; // Más el material propio del Editor
    return X.dominio.filter(function (m) { return anioMaterial(m) <= anio; }).concat(S && S.edit && S.edit.mat || []);
  }
  // Atractivo de un material por edad [niños, adolescentes, jóvenes, adultos, mayores] y por sexo [hombres, mujeres]
  function atractivo(m) {
    const gens = X.generosDeCine(m.gen);
    const edades = [0, 0, 0, 0, 0], sexo = [0, 0];
    gens.forEach(function (g) {
      const f = D.familia(D.familiaDe[g]);
      f.edades.forEach(function (x, i) { edades[i] += x / gens.length; });
      const s = X.sexoFamilia[f.id];
      sexo[0] += s[0] / gens.length; sexo[1] += s[1] / gens.length;
    });
    return { edades: edades, sexo: sexo };
  }
  // Veces que el mundo adaptó un material en los últimos 15 años (cansa al público)
  function usosRecientes(id, anio) {
    const u = N.S.usosMaterial && N.S.usosMaterial[id];
    return u ? u.filter(function (a) { return anio - a < 15; }).length : 0;
  }
  function registrarUso(id, anio) {
    if (!id) return;
    const S = N.S;
    if (!S.usosMaterial) S.usosMaterial = {};
    const u = S.usosMaterial[id] = S.usosMaterial[id] || [];
    u.push(anio);
    if (u.length > 6) u.shift();
  }
  // ---------- Premisas y tropos ----------
  const TODAS_PREMISAS = [];
  X.familiasPremisa.forEach(function (f) { f.items.forEach(function (p) { TODAS_PREMISAS.push(p); }); });
  function famPremisa(p) { return X.familiasPremisa.filter(function (f) { return f.items.indexOf(p) >= 0; })[0]; }
  function premisasRecomendadas(fam, n) {
    const buenas = X.familiasPremisa.filter(function (f) { return f.afin.indexOf(fam) >= 0; });
    const r = [];
    for (let i = 0; i < (n === undefined ? N.entero(0, 2) : n); i++) {
      const f = buenas.length ? N.elegir(buenas) : N.elegir(X.familiasPremisa);
      const p = N.elegir(f.items);
      if (r.indexOf(p) < 0) r.push(p);
    }
    return r;
  }
  // Veces que el mundo usó una premisa en los últimos 5 años (las muy usadas cansan)
  function usosPremisa(p, anio) {
    const u = N.S.usosPremisa && N.S.usosPremisa[p];
    return u ? u.filter(function (a) { return anio - a < 5; }).length : 0;
  }
  function registrarPremisas(o, anio) {
    const S = N.S;
    S.usosPremisa = S.usosPremisa || {};
    (o.pre || []).forEach(function (p) { const u = S.usosPremisa[p] = S.usosPremisa[p] || []; u.push(anio); if (u.length > 12) u.shift(); });
  }
  function efectoPremisas(o, anio) {
    const fam = familia(o);
    let pub = 0;
    (o.pre || []).slice(0, 2).forEach(function (p) {
      const f = famPremisa(p);
      if (f && f.afin.indexOf(fam) >= 0) pub += 1;
      const u = usosPremisa(p, anio);
      if (u >= 8) pub -= 2; else if (u >= 4) pub -= 1;
    });
    return pub;
  }
  // Enfoque del estudio: 3 géneros y 3 temas con bono, más experiencia con cada obra del enfoque
  function efectoEnfoque(o) {
    const est = N.S.estudios[o.est];
    const en = est && est.enf;
    if (!en) return { crit: 0, pub: 0 };
    let crit = 0, pub = 0;
    const g0 = (o.gen || [])[0];
    if (g0 && en.gen.indexOf(g0) >= 0) pub += 1 + Math.min(2, Math.floor(((est.expG || {})[g0] || 0) / 5));
    if ((o.tem || []).some(function (t) { return en.tem.indexOf(t) >= 0; })) crit += 1;
    return { crit: crit, pub: pub };
  }

  // Prepara un borrador a partir de un material (la censura de la época suaviza lo erótico)
  function usarMaterial(b, id, anio) {
    const m = X.material(id);
    if (!m) return b;
    let gen = X.generosDeCine(m.gen);
    b.suave = false;
    if (gen.indexOf('Erótico') >= 0 && (anio < ANIO_SIN_CENSURA || (b.pj || []).some(function (p) { return p.e < 18; }))) {
      gen = gen.filter(function (g) { return g !== 'Erótico'; }).concat(gen.indexOf('Romance') < 0 ? ['Romance'] : []).slice(0, 3);
      b.suave = true;
    }
    if (ART.obras.validarGeneros(gen, anio)) gen = gen.filter(function (g) { return g !== 'Erótico'; });
    b.mat = id;
    b.gen = gen.length ? gen : ['Drama'];
    b.tit = m.tit;
    b.derechos = costoDerechos(m, anio);
    if (m.grupo === 'tono' && !b.suave) {
      b.cont = Object.assign({}, contenidoDe(b));
      if (b.cont.amor < 2) b.cont.amor = 2; // las subidas de tono suben la clasificación, nunca son explícitas
    }
    const am = anioMaterial(m);
    const epocaMaterial = am < 0 ? 'imperios' : am < 1450 ? 'medieval' : am < 1600 ? 'renacimiento' : am < 1800 ? 'revoluciones' : am < 1900 ? 'xix' : 'guerras';
    b.epo = m.grupo === 'tradicion' ? 'inventado' : epocaMaterial;
    return b;
  }
  // Guiones en venta (comprar un guion ya escrito, con calificación y precio)
  function precioGuion(calif, anio) { return Math.round(E().presupuestoTipico(anio) * 0.012 * (1 + Math.max(0, calif - 40) / 12)); }
  function renovarGuiones() {
    const S = N.S, anio = N.anio();
    if (!S.guiones) S.guiones = [];
    S.guiones = S.guiones.filter(function (g) { return g.vence > S.t; });
    const autores = T().disponibles('guion');
    while (S.guiones.length < 6 && autores.length) {
      const autor = N.elegir(autores);
      const idea = ideaAleatoria(anio, autor.hab);
      const calif = Math.round(N.limitar(N.normal(autor.hab, 10), 25, 98));
      // La calidad real queda oculta; la primera lectura es una estimación con margen (±12)
      const lect = Math.round(N.limitar(calif + N.normal(0, 7), 20, 99));
      const pags = Math.round(N.limitar(N.normal(110, 15), 70, 160));
      S.guiones.push({ id: N.sigId(), idea: idea, autor: autor.id, nomAutor: autor.nom, calif: calif, lect: lect, margen: 12, pags: pags,
        precio: precioGuion(lect, anio), vence: S.t + 12 });
    }
  }
  // Informe de lectura pagado: revela la calidad con un margen pequeño (más preciso con un analista)
  function costoInforme(g) { return Math.max(1, Math.round(g.precio * 0.08)); }
  function informeLectura(id, conAnalista) {
    const S = N.S, g = (S.guiones || []).filter(function (x) { return x.id === id; })[0];
    if (!g) return 'Ese guion ya no está en venta.';
    if (g.margen <= 4) return 'Ya tienes su informe.';
    const c = costoInforme(g);
    if (S.estudios[0].caja < c) return 'No alcanza la caja para el informe.';
    ART.negocio.pagar(0, 'derechos', c);
    g.margen = conAnalista ? 1 : 4;
    g.lect = Math.round(N.limitar(g.calif + N.normal(0, g.margen / 2), 20, 99));
    return '';
  }
  // Regatear: una vez por guion; puede bajar el precio, quedar igual o hacer que el vendedor se retire
  function regatear(id, conAnalista) {
    const S = N.S, g = (S.guiones || []).filter(function (x) { return x.id === id; })[0];
    if (!g) return { error: 'Ese guion ya no está en venta.' };
    if (g.reg) return { error: 'Ya regateaste este guion.' };
    g.reg = 1;
    const fama = S.estudios[0].fama;
    const x = N.azar() + fama * 0.3 + (conAnalista ? 0.1 : 0);
    if (x > 0.75) { g.precio = Math.round(g.precio * 0.8); return { ok: true, texto: 'Aceptan: el precio baja un 20 %.' }; }
    if (x > 0.45) { g.precio = Math.round(g.precio * 0.92); return { ok: true, texto: 'Ceden un poco: −8 %.' }; }
    if (x > 0.2) return { ok: true, texto: 'No bajan el precio.' };
    S.guiones = S.guiones.filter(function (y) { return y.id !== id; });
    return { ok: false, texto: 'Se ofenden y retiran el guion del mercado.' };
  }

  // ---------- Ideas automáticas (recomendado, dado e IA) ----------
  const TODOS_TEMAS = [];
  X.familiasTema.forEach(function (f) { f.items.forEach(function (t) { TODOS_TEMAS.push(t); }); });
  const TODAS_PROB = [];
  X.familiasProblema.forEach(function (f) { Object.keys(f.items).forEach(function (p) { TODAS_PROB.push(p); }); });
  // Tema que mejor encaja con la familia (con algo de azar para variar)
  function temaRecomendado(fam, azar) {
    const buenas = X.familiasTema.filter(function (f) { return f.afin[fam] >= 3; });
    const f = buenas.length ? buenas[N.entero(0, buenas.length - 1)] : N.elegir(X.familiasTema);
    return azar ? N.elegir(TODOS_TEMAS) : N.elegir(f.items);
  }
  function arcoRecomendado(fam) {
    const pref = { AA: 'pozo', IM: 'cenicienta', SM: 'doblepozo', DR: 'icaro', HM: 'pozo', FJ: 'cenicienta', AV: 'edipo', RD: 'cenicienta' };
    return pref[fam] || 'pozo';
  }
  function problemaRecomendado(fam) {
    const pref = { AA: 'CL', IM: 'VB', SM: 'ME', DR: 'AC', HM: 'VI', FJ: 'VB', AV: 'DS', RD: 'VI' };
    const f = X.familiasProblema.filter(function (x) { return x.id === pref[fam]; })[0];
    return N.elegir(Object.keys(f.items));
  }
  // Completa la historia de una idea (tema, problemática, arco, época) con lo que mejor encaja
  function recomendarHistoria(b, anio) {
    const fam = familia(b);
    b.tem = [temaRecomendado(fam)];
    b.prob = [problemaRecomendado(fam)];
    b.arco = arcoRecomendado(fam);
    b.pre = premisasRecomendadas(fam, 1);
    const epocas = X.epocasDisponibles(anio).filter(function (e) { return e.afines.indexOf(fam) >= 0; });
    const epo = fam === 'IM' && N.probabilidad(0.5) ? 'lejano' : epocas.length && N.probabilidad(0.3) ? N.elegir(epocas).id : 'actualidad';
    if (!b.mat) b.epo = epo; // un material ya trae su época
    return b;
  }
  // Idea al azar (el dado del modo rápido y los guiones en venta). nivel: 0-100, qué tan bien encaja.
  function ideaAleatoria(anio, nivel) {
    const fams = D.ORDEN_FAM.slice();
    const fam = N.elegir(fams);
    const genes = D.familia(fam).generos.filter(function (g) { return g !== 'Erótico' || anio >= ANIO_SIN_CENSURA; });
    const gen = [N.elegir(genes)];
    const bueno = N.probabilidad(N.limitar((nivel || 50) / 100, 0.1, 0.95));
    if (N.probabilidad(0.4)) {
      const otra = bueno ? D.ORDEN_FAM.filter(function (f) { return D.encaje(fam, f) >= 3; }) : D.ORDEN_FAM;
      const f2 = otra.length ? N.elegir(otra) : N.elegir(fams);
      const g2 = N.elegir(D.familia(f2).generos);
      if (gen.indexOf(g2) < 0 && !ART.obras.validarGeneros(gen.concat([g2]), anio)) gen.push(g2);
    }
    const idea = { gen: gen, tem: [temaRecomendado(fam, !bueno)], prob: [bueno ? problemaRecomendado(fam) : N.elegir(TODAS_PROB)], arco: bueno ? arcoRecomendado(fam) : N.elegir(X.arcos).id };
    if (N.probabilidad(0.5)) idea.tem.push(temaRecomendado(fam, !bueno));
    if (N.probabilidad(0.4)) {
      const fs = N.elegir(X.familiasSub);
      if (!bueno || fs.afin[fam] >= 1) idea.sub = [N.elegir(fs.items)];
    }
    idea.tono = N.elegir(D.tonos).id;
    idea.pre = bueno ? premisasRecomendadas(fam) : (N.probabilidad(0.5) ? [N.elegir(TODAS_PREMISAS)] : []);
    idea.tit = ART.obras.tituloNuevo(gen);
    return idea;
  }
  function aplicarIdea(b, idea) {
    ['gen', 'tem', 'prob', 'arco', 'sub', 'tono', 'tit', 'epo', 'sarc', 'fic', 'pre'].forEach(function (k) { if (idea[k] !== undefined) b[k] = Array.isArray(idea[k]) ? idea[k].slice() : idea[k]; });
    b.fam = familia(b);
    return b;
  }
  // Idea automática con IA (desde 2022): autocompleta y bloquea la historia; su calidad depende del guionista
  function ideaIA(b, anio) {
    const g = b.eq && b.eq.guion !== undefined ? T().porId(b.eq.guion) : null;
    const nivel = g ? g.hab : 55;
    const S = N.S;
    // Persigue la tendencia del momento
    let mejor = 'DR', vm = -9;
    D.ORDEN_FAM.forEach(function (f) { const x = (S.mundo.tendencias[f] || 0) + N.azar() * 0.3; if (x > vm) { vm = x; mejor = f; } });
    const idea = ideaAleatoria(anio, nivel);
    const genes = D.familia(mejor).generos.filter(function (x) { return x !== 'Erótico'; });
    idea.gen = [N.elegir(genes)].concat(idea.gen.filter(function (x) { return D.familiaDe[x] !== mejor; }).slice(0, 1));
    if (ART.obras.validarGeneros(idea.gen, anio)) idea.gen = idea.gen.slice(0, 1);
    idea.tem = [temaRecomendado(mejor), temaRecomendado(mejor)].filter(function (x, i, a) { return a.indexOf(x) === i; });
    idea.prob = [problemaRecomendado(mejor)];
    idea.arco = arcoRecomendado(mejor);
    aplicarIdea(b, idea);
    b.ideaIA = 1;
    return b;
  }

  // ---------- Personajes ----------
  function regionDe(b) {
    const p = b.lug && D.pais(b.lug);
    if (p) return p.region;
    const e = N.S && N.S.estudios[b.est || 0];
    return e ? e.reg : 'nam';
  }
  function nombrePersonaje(reg, sx) {
    const L = D.nombres[reg] || D.nombres.nam;
    return N.elegir(sx === 'F' ? L.f : L.m) + ' ' + N.elegir(L.a);
  }
  function edadPara(b, importancia) {
    const gen = b.gen || [];
    const erotico = gen.indexOf('Erótico') >= 0;
    if (!erotico && importancia === 'protagonista' && gen.indexOf('Infantil') >= 0) return N.entero(8, 12);
    if (!erotico && importancia === 'protagonista' && gen.indexOf('Adolescentes') >= 0) return N.entero(14, 17);
    return N.entero(erotico ? 21 : 19, importancia === 'secundario' ? 70 : 55);
  }
  function personajeNuevo(b, importancia, arquetipo) {
    const sx = N.probabilidad(0.5) ? 'F' : 'M';
    return { n: nombrePersonaje(regionDe(b), sx), e: edadPara(b, importancia), s: sx, i: importancia, a: arquetipo || N.elegir(X.arquetipos).id, t: null };
  }
  // Reparto inicial según la familia: protagonistas, sus aliados y antagonistas; extras y terceros como número
  function generarPersonajes(b) {
    // Una obra libre lleva a sus personajes de siempre (en una erótica, todos mayores de edad)
    const c = b.mat ? X.canon(X.material(b.mat)) : null;
    if (c) {
      const ero = (b.gen || []).indexOf('Erótico') >= 0;
      b.pj = c.pj.map(function (p) { return { n: p.n, e: ero ? Math.max(21, p.e) : p.e, s: p.s, i: p.i, a: p.a, t: null }; });
      if (b.extras === undefined) b.extras = 4;
      if (b.terceros === undefined) b.terceros = 10;
      asignarReparto(b);
      return b;
    }
    const fam = familia(b);
    const pj = [personajeNuevo(b, 'protagonista', fam === 'SM' ? 'Antihéroe' : fam === 'HM' ? 'Bufón' : fam === 'FJ' ? 'Inocente' : 'Héroe')];
    if (fam === 'RD') { const otro = personajeNuevo(b, 'protagonista', 'Amante'); otro.s = pj[0].s === 'F' ? 'M' : 'F'; otro.n = nombrePersonaje(regionDe(b), otro.s); pj.push(otro); }
    pj.push(personajeNuevo(b, 'secundario', fam === 'FJ' || fam === 'AA' ? 'Mentor' : 'Aliado'));
    pj.push(personajeNuevo(b, 'secundario', fam === 'RD' ? 'Rival' : fam === 'HM' ? 'Embaucador' : 'Villano'));
    b.pj = pj;
    if (b.extras === undefined) b.extras = 4;
    if (b.terceros === undefined) b.terceros = 10;
    asignarReparto(b);
    return b;
  }
  // Une a los intérpretes contratados con los personajes: protagonistas primero, luego secundarios
  function asignarReparto(b) {
    if (!b.pj) return b;
    const ints = (b.eq && b.eq.int || []).slice();
    const usados = {};
    b.pj.forEach(function (p) { if (p.t !== null && p.t !== undefined && ints.indexOf(p.t) >= 0 && !usados[p.t]) usados[p.t] = 1; else if (p.i === 'protagonista' || p.i === 'secundario') p.t = null; });
    const libres = ints.filter(function (id) { return !usados[id]; });
    b.pj.filter(function (p) { return p.i === 'protagonista'; }).concat(b.pj.filter(function (p) { return p.i === 'secundario'; })).forEach(function (p) {
      if (p.t === null && libres.length) p.t = libres.shift();
    });
    // El orden de eq.int sigue al de los personajes (el primero es la estrella principal)
    const orden = [];
    b.pj.filter(function (p) { return p.i === 'protagonista'; }).concat(b.pj.filter(function (p) { return p.i === 'secundario'; })).forEach(function (p) { if (p.t !== null && p.t !== undefined) orden.push(p.t); });
    libres.forEach(function (id) { orden.push(id); });
    b.eq.int = orden;
    return b;
  }

  // ---------- Sinopsis y frases (plantillas: género, tema, arco, personajes, época y lugar) ----------
  const PROPIOS = /^[A-ZÁÉÍÓÚ]{2}|^(Dios|IA)$/;
  function minus(t) { return X.famTema[t] === 'EH' || PROPIOS.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  // Los temas de época llevan su artículo: «Medieval» se cuenta como «la Edad Media»
  const TEMA_HISTORIA = {
    'América': 'América', 'Antiguo Egipto': 'el antiguo Egipto', 'China imperial': 'la China imperial', Civilizaciones: 'las primeras civilizaciones',
    Cruzadas: 'las Cruzadas', 'Culturas indígenas': 'las culturas indígenas', Descubrimientos: 'los grandes descubrimientos', 'Era digital': 'la era digital',
    'Era victoriana': 'la era victoriana', Esparta: 'Esparta', 'Fiebre del oro': 'la fiebre del oro', Gladiadores: 'los gladiadores', 'Globalización': 'la globalización',
    'Gran Depresión': 'la Gran Depresión', 'Grecia clásica': 'la Grecia clásica', 'Guerra de trincheras': 'la guerra de trincheras', 'Guerra Fría': 'la Guerra Fría',
    'Guerras napoleónicas': 'las guerras napoleónicas', Holocausto: 'el Holocausto', 'Ilustración': 'la Ilustración', 'Imperio mongol': 'el Imperio mongol',
    'Imperio romano': 'el Imperio romano', Imprenta: 'la imprenta', Incas: 'los incas', Independencia: 'la independencia', Independencias: 'las independencias',
    'India antigua': 'la India antigua', 'Inquisición': 'la Inquisición', 'Islámico': 'el mundo islámico', 'Japón feudal': 'el Japón feudal', 'Las pirámides': 'las pirámides',
    Mayas: 'los mayas', Medieval: 'la Edad Media', Mesopotamia: 'Mesopotamia', 'Muro de Berlín': 'el Muro de Berlín', Nazismo: 'el nazismo', 'Olímpicos': 'los Juegos Olímpicos',
    Peloponeso: 'la guerra del Peloponeso', 'Peste negra': 'la peste negra', Piratas: 'los piratas', Precolombinas: 'las culturas precolombinas', Prehistoria: 'la prehistoria',
    'Primera Guerra Mundial': 'la Primera Guerra Mundial', 'Reinado del Terror': 'el Reinado del Terror', Renacimiento: 'el Renacimiento', Resistencia: 'la Resistencia',
    'Revolución francesa': 'la Revolución francesa', 'Revolución industrial': 'la Revolución industrial', 'Revolución rusa': 'la Revolución rusa',
    'Revoluciones artísticas': 'las revoluciones artísticas', 'Revoluciones tecnológicas': 'las revoluciones tecnológicas', 'Ruta de la Seda': 'la Ruta de la Seda',
    'Salvaje oeste': 'el Salvaje Oeste', 'Segunda Guerra Mundial': 'la Segunda Guerra Mundial', 'Siglo XIX': 'el siglo XIX', Templarios: 'los templarios',
    Tenochtitlan: 'Tenochtitlan', Vikingos: 'los vikingos',
  };
  function temaHistorico(t) { return TEMA_HISTORIA[t] || t; }
  function lugarTexto(b) {
    if (!b.lug) return '';
    const p = D.pais(b.lug);
    if (p) return 'en ' + p.nombre;
    const x = X.lugaresExtra.filter(function (l) { return l.id === b.lug; })[0];
    return x ? x.texto : '';
  }
  function genero(s, txt) { return txt.split('{la}').join(s === 'F' ? 'la' : 'lo').split('{a}').join(s === 'F' ? 'a' : 'o'); }
  function sinopsis(b) {
    // Una adaptación de una obra libre cuenta su historia de siempre
    const cm = b.mat ? X.canon(X.material(b.mat)) : null;
    if (cm) {
      const m = X.material(b.mat), pre = (b.pre || []).slice(0, 2);
      return cm.sin + (pre.length ? ' Con ' + pre.map(function (x) { return '«' + x + '»'; }).join(' y ') + '.' : '') + ' Basada en «' + m.tit + '»' + (m.autor && m.grupo !== 'tradicion' ? ', de ' + m.autor : '') + (b.suave ? ', adaptada con guiños por la censura de la época' : '') + '.';
    }
    const pj = (b.pj || []).filter(function (p) { return p.i === 'protagonista'; })[0];
    const sx = pj ? pj.s : 'M';
    const g0 = (b.gen || ['Drama'])[0];
    const ofi = X.oficiosGenero[g0];
    const arq = X.arquetipos.filter(function (a) { return a.id === (pj ? pj.a : 'Héroe'); })[0] || X.arquetipos[0];
    const descriptor = ofi ? ofi[sx === 'F' ? 1 : 0] : arq[sx === 'F' ? 'f' : 'm'];
    const ep = X.epoca(b.epo || 'actualidad');
    const inicio = (ep.id === 'actualidad' ? 'Hoy' : ep.texto) + (lugarTexto(b) ? ', ' + lugarTexto(b) : '');
    const quien = pj ? pj.n + ', ' + descriptor + ',' : descriptor.charAt(0).toUpperCase() + descriptor.slice(1);
    const accion = genero(sx, X.fraseProblema((b.prob || [])[0] || 'La búsqueda'));
    const arco = X.arco(b.arco);
    const fin = arco ? (arco.final.indexOf('y ') === 0 ? ' ' : ', ') + genero(sx, arco.final) : '';
    let s = inicio + ', ' + (pj ? quien : quien.charAt(0).toLowerCase() + quien.slice(1)) + ' ' + accion + fin + '.';
    s = s.charAt(0).toUpperCase() + s.slice(1);
    const tem = (b.tem || []).slice(0, 3);
    const comunes = tem.filter(function (x) { return X.famTema[x] !== 'EH'; }).map(minus), historia = tem.filter(function (x) { return X.famTema[x] === 'EH'; }).map(temaHistorico);
    if (comunes.length) s += ' Una historia de ' + N.lista(comunes) + '.';
    if (historia.length) s += ' Trasfondo: ' + N.lista(historia) + '.';
    const pre = (b.pre || []).slice(0, 2);
    if (pre.length) s += pre.length > 1 ? ' Incluye los tópicos «' + pre[0] + '» y «' + pre[1] + '».' : ' Incluye el tópico «' + pre[0] + '».';
    if (b.mat) { const m = X.material(b.mat); if (m) s += ' Basada en «' + m.tit + '»' + (m.autor && m.grupo !== 'tradicion' ? ', de ' + m.autor : '') + (b.suave ? ', adaptada con guiños por la censura de la época' : '') + '.'; }
    return s;
  }
  const NOMBRE_GENERO = {
    Western: 'un western', Drama: 'un drama', Comedia: 'una comedia', Musical: 'un musical', Thriller: 'un thriller', Melodrama: 'un melodrama',
    Noir: 'un noir', Romance: 'un romance', Biográfico: 'una biografía', Parodia: 'una parodia', Épico: 'una épica', Espionaje: 'una historia de espías',
  };
  function fraseCritica(b) {
    const g = (b.gen || ['Drama'])[0];
    const t = (b.tem || [])[0];
    return (NOMBRE_GENERO[g] || 'una película de ' + g.toLowerCase()).replace(/^./, function (c) { return c.toUpperCase(); }) + (t ? ' sobre ' + minus(t) : '') + '.';
  }
  const FRASE_PREMIO = {
    pobreza: 'Por celebrar a quien empieza desde abajo.', ruina: 'Por mirar de frente lo que se pierde.', pozo: 'Por enseñarnos a salir del pozo.',
    doblepozo: 'Por levantarse dos veces.', icaro: 'Por recordarnos que todo ascenso tiene su caída.', edipo: 'Por no apartar la mirada del destino.',
    cenicienta: 'Por creer en las segundas oportunidades.',
  };
  function frasePremio(b) { return FRASE_PREMIO[b.arco] || 'Por una historia que nadie olvidará.'; }

  // ---------- Efectos en la calidad, la crítica y el público ----------
  // Reparto de pesos de los departamentos: prioridad y tipo de obra (se normaliza para sumar 1)
  function pesos(o, famObj) {
    const pr = X.prioridad(o.prio).pesos, tc = X.tipoCine(o.tipo || 'real').pesos || {};
    if (!Object.keys(pr).length && !Object.keys(tc).length) return ART.rodaje.pesosDep(o, famObj.pesos);
    const r = {};
    let s = 0;
    Object.keys(famObj.pesos).forEach(function (k) { r[k] = famObj.pesos[k] * (pr[k] || 1) * (tc[k] || 1); s += r[k]; });
    Object.keys(r).forEach(function (k) { r[k] /= s; });
    return ART.rodaje.pesosDep(o, r); // vestuario, efectos y animación
  }
  function habilidad(id) { const t = id !== undefined && id !== null ? T().porId(id) : null; return t ? t.hab : 45; }
  function equipoCreativo(o) { return (habilidad(o.eq.guion) + habilidad(o.eq.direccion) + habilidad(o.eq.arte)) / 3; }
  // Ajuste de calidad sin azar (estimaciones y calidad base)
  function ajusteCalidad(o) {
    let q = encajeIdea(o);
    const tem = (o.tem || []).length;
    if (tem > 5 && habilidad(o.eq.guion) < 80) q -= tem - 5; // historia dispersa
    if (o.mat) q += 1; // historia probada
    if (o.guionC) q += (o.guionC - 60) / 8;
    if (o.ideaIA) q += N.limitar((habilidad(o.eq.guion) - 75) / 8, -3, 2);
    if (o.ia) q += o.ia / 100 * (equipoCreativo(o) - 70) * 0.35;
    const prot = (o.pj || []).filter(function (p) { return p.i === 'protagonista'; }).length;
    if (prot > 3 && habilidad(o.eq.guion) < 85) q -= prot - 3;
    return q;
  }
  // Crítica y público: tipo, ficción, corriente, estilo, formato, idioma, complejidad, ritmo, arco, duración, material
  function ajusteNotas(o, anio) {
    const fam = familia(o);
    let crit = 0, pub = 0;
    const add = function (x) { if (x) { crit += x.crit || 0; pub += x.pub || 0; } };
    add(X.tipoCine(o.tipo || 'real'));
    if (o.nat !== 'r') { if (o.fic && o.fic !== 'Estándar') add(X.familiasFiccion.filter(function (f) { return f.id === X.famFiccion[o.fic]; })[0]); } else crit += 1;
    if (o.corr && o.corr !== X.ESTANDAR) add(X.efectoCorriente(o.corr, anio, fam));
    const es = X.estilo(o.estilo);
    add(es);
    if (es.afines && es.afines.indexOf(fam) >= 0) crit += 1;
    if (o.fmt) add(X.efectoFormato(o.fmt, anio, fam));
    const idi = X.idioma(o.idio);
    if (idi) add(idi);
    const cx = v(o, 'cx', 2);
    crit += (cx - 2) * 2.5; pub -= (cx - 2) * 2;
    add(X.ritmo[v(o, 'rit', 2)]);
    const arco = X.arco(o.arco);
    if (arco) add(arco);
    const min = v(o, 'min', 0);
    if (min) {
      const r = min / duracionTipica(anio);
      if (r > 1.35) { crit += 1; pub -= Math.min(5, Math.round((r - 1.35) * 8)); }
      if (r < 0.6 && anio >= 1916) pub -= 3;
    }
    if (o.mat) {
      const m = X.material(o.mat);
      if (m) { pub += Math.round(m.fama * 3) - 2 * usosRecientes(o.mat, anio); if (m.grupo === 'clasico') crit += 1; }
    }
    (o.pubs || []).forEach(function (p) {
      const x = X.publico(p);
      if (!x) return;
      if (x.crit) crit += x.crit;
      if (x.sexo) { const s = X.sexoFamilia[fam]; pub += (x.sexo === 'M' ? s[0] : s[1]) > 1.05 ? 1 : 0; }
      if (x.lgbt) { if (anio < 1990) pub -= 1; else if (anio >= 2010) pub += 1; crit += anio >= 1990 ? 1 : 0; }
    });
    if (fam === 'SM' && contenidoDe(o).terror >= 2) pub += 1;
    // Multitudes: muchos extras lucen en la acción y en las épocas pasadas
    if ((o.extras || 0) >= 12 && (fam === 'AA' || (o.epo && o.epo !== 'actualidad'))) pub += 1;
    add(ART.rodaje.ajusteNotas(o, anio)); // estilo de producción, método, terreno y sets
    pub += efectoPremisas(o, anio); // premisas y tropos
    add(efectoEnfoque(o)); // enfoque del estudio
    return { crit: crit, pub: pub };
  }
  // Lo que se decide con azar al terminar: efectos aplaudidos o repudiados y el resultado de la IA
  function resultado(o) {
    const r = { q: 0, crit: 0, pub: 0 };
    const fx = v(o, 'fx', 2);
    if (fx >= 3) {
      const L = (habilidad(o.eq.direccion) + habilidad(o.eq.arte)) / 2;
      let p = Math.pow(L / 100, 1.3);
      if (fx >= 4) p = Math.pow(p, 1.3);
      if (N.azar() < p) { r.pub += 6; r.crit += 2; o.fxr = 'aplaudidos'; } else { r.pub -= 10; r.crit -= 5; o.fxr = 'repudiados'; }
    }
    if (o.ia) {
      const C = equipoCreativo(o);
      const delta = N.limitar(o.ia / 100 * ((C - 70) * 0.35 + N.normal(0, 4)), -20, 5);
      // (la parte esperada ya está en la calidad base; aquí solo el azar)
      r.q += delta - o.ia / 100 * (C - 70) * 0.35;
      if (o.ia > 50 && C < 85) r.pub -= (o.ia - 50) / 10; // actuaciones dudosas
      o.iar = delta >= 2 ? 'excelente' : delta >= -2 ? 'bien' : delta >= -8 ? 'dudoso' : 'completamente mal';
    }
    return r;
  }
  // Público: a quién le habla la obra (edades y región) además de la clasificación
  function edadesExtra(o) {
    const tc = X.tipoCine(o.tipo || 'real').edades;
    const focos = (o.pubs || []).map(X.publico).filter(function (x) { return x && x.edades; });
    const ep = ART.rodaje.edades(o); // estilo de producción: unos lo aman y otros lo rechazan
    if (!tc && !focos.length && !ep) return null;
    const r = ep || [1, 1, 1, 1, 1];
    if (tc) tc.forEach(function (x, i) { r[i] *= x; });
    if (focos.length) for (let i = 0; i < 5; i++) r[i] *= 1 + (media(focos.map(function (f) { return f.edades[i]; })) - 1) * 0.6;
    return r;
  }
  function regionExtra(o, reg, anio) {
    let f = 1;
    const idi = X.idioma(o.idio);
    if (idi && !idi.universal && !(v(o, 'fmt', null) && o.fmt.sonido === 'Mudo')) {
      const local = idi.regiones.indexOf(reg) >= 0 || idi.paises.some(function (p) { const x = D.pais(p); return x && x.region === reg; });
      if (local) f *= 1.06; else if (!(idi.global && anio >= idi.global)) f *= anio >= 1935 ? 0.97 : 1;
    }
    if ((o.pubs || []).some(function (p) { const x = X.publico(p); return x && x.region === reg; })) f *= 1.06;
    const p = o.lug && D.pais(o.lug);
    if (p && p.region === reg) f *= 1.04;
    return f;
  }
  // Una historia conocida ya tiene público que la espera
  function bonoConocimiento(o) {
    const m = o.mat && X.material(o.mat);
    return (m ? 0.08 * m.fama : 0) + (o.dcon || 0); // + convenciones y portadas
  }
  // Moraleja: la lección que deja la historia. Si encaja con la familia del género suma 1; sin moraleja, las historias familiares pierden 1.
  const MORALEJAS = [
    { id: 'La honestidad siempre gana', fam: ['FJ', 'DR'] }, { id: 'El amor vence al miedo', fam: ['RD', 'FJ', 'IM'] }, { id: 'El poder corrompe', fam: ['DR', 'SM', 'AA'] },
    { id: 'La familia es lo primero', fam: ['FJ', 'DR', 'HM'] }, { id: 'La venganza no cura nada', fam: ['SM', 'AA', 'DR'] }, { id: 'Hay que aceptar quién eres', fam: ['FJ', 'RD', 'AV'] },
    { id: 'Juntos somos más fuertes', fam: ['AA', 'FJ', 'IM'] }, { id: 'Nunca es tarde para cambiar', fam: ['DR', 'HM', 'RD'] }, { id: 'Cuidado con lo que deseas', fam: ['IM', 'SM', 'HM'] },
    { id: 'La codicia lo destruye todo', fam: ['DR', 'SM'] }, { id: 'Los sueños se cumplen con esfuerzo', fam: ['FJ', 'HM', 'DR'] }, { id: 'Las apariencias engañan', fam: ['SM', 'HM', 'RD'] },
    { id: 'El conocimiento nos hace libres', fam: ['IM', 'DR', 'AV'] }, { id: 'La guerra no tiene ganadores', fam: ['DR', 'AA'] }, { id: 'La verdad siempre sale a la luz', fam: ['SM', 'DR'] },
    { id: 'Hay que perdonar para seguir adelante', fam: ['DR', 'RD', 'FJ'] }, { id: 'Hay que cuidar la naturaleza', fam: ['IM', 'FJ', 'AV'] }, { id: 'Todo acto tiene consecuencias', fam: ['SM', 'DR', 'IM'] },
    { id: 'La bondad es la mayor fuerza', fam: ['FJ', 'IM'] }, { id: 'El miedo se vence enfrentándolo', fam: ['SM', 'AA', 'FJ'] }, { id: 'La libertad tiene un precio', fam: ['AA', 'DR', 'AV'] },
    { id: 'Sin moraleja: el final queda abierto', fam: ['AV', 'SM'] },
  ];
  function moraleja(id) { return MORALEJAS.filter(function (m) { return m.id === id; })[0] || null; }
  function bonoMoraleja(o) {
    if (!o || !o.mor) return 0;
    const m = moraleja(o.mor), fam = o.fam || familia(o);
    if (!m) return 0;
    if (m.fam.indexOf(fam) >= 0) return 1;
    return m.id.indexOf('Sin moraleja') === 0 && fam === 'FJ' ? -1 : 0;
  }
  // Música de la obra: un paquete cambia el costo y la nota del departamento de música
  const PAQUETES_MUSICA = [
    { id: '', nombre: 'A tu medida', k: 0, q: 0, texto: 'El compositor del equipo hace todo con el reparto del presupuesto.' },
    { id: 'basico', nombre: 'Básico', k: -0.02, q: -3, texto: 'Música de archivo y una canción conocida: barato y sin brillo.' },
    { id: 'estandar', nombre: 'Estándar', k: 0.02, q: 1, texto: 'Partitura sencilla, una canción conocida y tres de nicho.' },
    { id: 'autor', nombre: 'De autor', k: 0.05, q: 4, texto: 'Partitura original grabada con orquesta: a la crítica le encanta.', crit: 1 },
    { id: 'exitos', nombre: 'De éxitos', k: 0.06, q: 3, texto: 'Canciones populares del momento: atraen público y venden la banda sonora.', pub: 1 },
    { id: 'super', nombre: 'Superproducción', k: 0.1, q: 6, texto: 'Orquesta, coro y estrellas invitadas: lo mejor, a precio de oro.' },
  ];
  function paqueteMusica(id) { return PAQUETES_MUSICA.filter(function (x) { return x.id === (id || ''); })[0] || PAQUETES_MUSICA[0]; }
  // Estimación orientativa del retorno (multiplicador) antes de empezar
  function retornoEstimado(calidad) {
    const base = E().P.MULT_TIPICO;
    const m = base * Math.exp((calidad - 62) * 0.035);
    return [N.redondear(m * 0.55, 1), N.redondear(m * 1.5, 1)];
  }
  // Líneas extra del informe al cerrar la obra
  function informe(o) {
    const r = [];
    if (o.fxr === 'aplaudidos') r.push('Los efectos especiales fueron aplaudidos.');
    if (o.fxr === 'repudiados') r.push('Los efectos especiales fueron repudiados: el equipo no tenía el nivel.');
    if (o.iar) r.push('Uso de IA (' + o.ia + ' %): resultado ' + o.iar + '.');
    const enc = (o.gen ? ART.economia.encajeObra(o) : 0) + (o.gen ? encajeIdea(o) : 0);
    if (enc >= 4) r.push('La combinación de géneros, temas y época encajó muy bien.');
    else if (enc <= -2) r.push('La combinación de géneros, temas y época chocó.');
    if (o.mat) { const m = X.material(o.mat); if (m) r.push('Basada en «' + m.tit + '»: una historia que el público ya conocía.'); }
    return r;
  }

  return { PAQUETES_MUSICA: PAQUETES_MUSICA, paqueteMusica: paqueteMusica, MORALEJAS: MORALEJAS, moraleja: moraleja, bonoMoraleja: bonoMoraleja,
    LIMITES: LIMITES, ANIO_IA: ANIO_IA, duracionTipica: duracionTipica, familia: familia, completar: completar,
    nivelMaximoEpoca: nivelMaximoEpoca, normalizar: normalizar, indiceClasificacion: indiceClasificacion, clasificar: clasificar,
    describirContenido: describirContenido, contenidoDe: contenidoDe, hayMenores: hayMenores, hayNinos: hayNinos, nivelEfectos: nivelEfectos, validar: validar,
    encajeIdea: encajeIdea, clavesEncaje: clavesEncaje, marcarEncaje: marcarEncaje, estrellas: estrellas,
    factorCosto: factorCosto, costoProduccion: costoProduccion, ajusteSemanas: ajusteSemanas, clase: clase, perfil: perfil,
    reglaDominio: reglaDominio, anioLibre: anioLibre, esLibre: esLibre, costoDerechos: costoDerechos, materialesDisponibles: materialesDisponibles, anioMaterial: anioMaterial,
    atractivo: atractivo, usosRecientes: usosRecientes, registrarUso: registrarUso, costoInforme: costoInforme, informeLectura: informeLectura, regatear: regatear, TODAS_PREMISAS: TODAS_PREMISAS, famPremisa: famPremisa, premisasRecomendadas: premisasRecomendadas, usosPremisa: usosPremisa, registrarPremisas: registrarPremisas, efectoPremisas: efectoPremisas, efectoEnfoque: efectoEnfoque, usarMaterial: usarMaterial,
    precioGuion: precioGuion, renovarGuiones: renovarGuiones, recomendarHistoria: recomendarHistoria, ideaAleatoria: ideaAleatoria,
    aplicarIdea: aplicarIdea, ideaIA: ideaIA, temaRecomendado: temaRecomendado, arcoRecomendado: arcoRecomendado, problemaRecomendado: problemaRecomendado,
    nombrePersonaje: nombrePersonaje, regionDe: regionDe, personajeNuevo: personajeNuevo, generarPersonajes: generarPersonajes, asignarReparto: asignarReparto,
    sinopsis: sinopsis, fraseCritica: fraseCritica, frasePremio: frasePremio,
    pesos: pesos, ajusteCalidad: ajusteCalidad, ajusteNotas: ajusteNotas, resultado: resultado, edadesExtra: edadesExtra, regionExtra: regionExtra,
    bonoConocimiento: bonoConocimiento, retornoEstimado: retornoEstimado, informe: informe, equipoCreativo: equipoCreativo,
  };
})();
