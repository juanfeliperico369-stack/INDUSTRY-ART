/* ==== módulo: obras ==== */
// La ficha de cada obra y su creación en modo rápido (géneros, tono, clasificación, escala, equipo y título).
// La fábrica de ideas completa (taxonomía, sinopsis, personajes, dominio público) llega en la V17.
IA.obras = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, E = IA.economia, T = IA.talentos;
  const ETAPAS = ['desarrollo', 'preproduccion', 'rodaje', 'posproduccion', 'lista', 'cartelera', 'terminada'];
  const NOMBRE_ETAPA = {
    desarrollo: 'Desarrollo', preproduccion: 'Preproducción', rodaje: 'Rodaje', posproduccion: 'Posproducción',
    lista: 'Lista para estrenar', cartelera: 'En cartelera', terminada: 'Terminada',
  };
  const ROLES = ['guion', 'direccion', 'produccion', 'fotografia', 'musica', 'edicion', 'arte'];
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
  function clasificacionRecomendada(gen, anio) {
    const fam = D.familia(D.familiaDe[gen[0]] || 'DR');
    const disp = clasificacionesDisponibles(anio, gen);
    if (gen.indexOf('Erótico') >= 0 && disp.indexOf('18') >= 0) return '18';
    return disp.indexOf(fam.clas) >= 0 ? fam.clas : disp.indexOf('PG-13') >= 0 ? 'PG-13' : (disp[0] || 'PG-13');
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
      tem: o.tem || [N.elegir(D.temas)], clas: o.clas || clasificacionRecomendada(gen, anio),
      esc: escala, anioPlan: anio, eq: { int: [] }, nivM: 2,
    };
    b.pp = Math.round(E.produccionTipica(anio, fam) * D.escalas[escala].mult * escalaTono(tono) * (o.costoPais || 1));
    return b;
  }
  function escalaTono(tono) { const to = D.tonos.filter(function (x) { return x.id === tono; })[0]; return to && to.costo ? to.costo : 1; }
  function idsEquipo(o) {
    const ids = [];
    ROLES.forEach(function (r) { if (o.eq[r] !== undefined && o.eq[r] !== null) ids.push(o.eq[r]); });
    return ids.concat(o.eq.int || []);
  }
  function costoTalento(o) {
    let s = 0;
    idsEquipo(o).forEach(function (id) { const t = T.porId(id); if (t) s += T.tarifa(t); });
    return s;
  }
  // Arma el equipo recomendado dentro de un tope por rol (relativo al presupuesto típico de la época)
  function equipoRecomendado(o, ambicion, azarEleccion) {
    const anio = N.anio();
    const tipico = E.presupuestoTipico(anio);
    const a = ambicion === undefined ? 1 : ambicion;
    const usados = [];
    ROLES.forEach(function (r) {
      if (o.eq[r] !== undefined && o.eq[r] !== null) { usados.push(o.eq[r]); return; }
      const of = D.oficio(r);
      const t = T.mejorDisponible(r, of.base * tipico * 2.2 * a, usados, null, azarEleccion) || T.mejorDisponible(r, Infinity, usados);
      if (t) { o.eq[r] = t.id; usados.push(t.id); }
    });
    const ints = (o.eq.int || []).slice();
    ints.forEach(function (id) { usados.push(id); });
    const sexos = N.probabilidad(0.5) ? ['F', 'M'] : ['M', 'F'];
    while (ints.length < 2) {
      const tope = D.oficio('interprete').base * tipico * (ints.length === 0 ? 3 : 2) * a;
      const t = T.mejorDisponible('interprete', tope, usados, sexos[ints.length], azarEleccion) || T.mejorDisponible('interprete', tope, usados) || T.mejorDisponible('interprete', Infinity, usados);
      if (!t) break;
      ints.push(t.id); usados.push(t.id);
    }
    o.eq.int = ints;
    return o;
  }
  function equipoCompleto(o) {
    return ROLES.every(function (r) { return o.eq[r] !== undefined && o.eq[r] !== null; }) && o.eq.int && o.eq.int.length >= 1;
  }
  // Duración por etapa en semanas (la escala alarga el rodaje; las salas propias aceleran)
  // Las películas de los primeros años eran cortos: se hacían en pocas semanas
  const EPOCA_DURACION = [[1895, 0.4], [1910, 0.55], [1925, 1]];
  function duraciones(o, rapidez) {
    const esc = D.escalas[o.esc];
    const r = rapidez || {};
    const f = esc.semanas * N.interp(EPOCA_DURACION, o.anioPlan || N.anio());
    return {
      desarrollo: Math.max(1, Math.round(5 * f) - (r.guion || 0)),
      preproduccion: Math.max(1, Math.round(4 * f)),
      rodaje: Math.max(2, Math.round(8 * f)),
      posproduccion: Math.max(2, Math.round(7 * f) - (r.edicion || 0) + (o.fam === 'IM' || o.fam === 'AA' ? 1 : 0)),
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
    const pp = Math.round(o.pp * (1 - IA.negocio.ahorro(o.est)));
    return { calidad: Math.round(N.limitar(q, 1, 99)), talento: ct, produccion: pp, marketing: cm, total: ct + pp + cm };
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
    registrar(o);
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
  function costoTotal(o) { return (o.cf || 0) + (o.gp || 0) + (o.cm || 0); }
  function multiplicador(o) { const c = costoTotal(o); return c > 0 ? (o.bruto || 0) / c : 0; }
  function neto(o) { return (o.parte || 0) - costoTotal(o); }

  // Historial compacto: de las obras viejas de los rivales queda el resumen y el detalle semanal se borra
  function compactar() {
    const S = N.S, t = S.t;
    const BORRAR = ['eq', 'acc', 'tem', 'u', 'delta', 'inf', 'dur', 'sr', 'semProd', 'sobre', 't0', 'tLista', 'prog', 'anioPlan', 'max', 'exp', 'tono', 'esc'];
    S.obras.forEach(function (o) {
      if (o.et !== 'terminada') return;
      if (o.hs && (t - (o.fe || 0) > 52 * (o.est === 0 ? 30 : 2)) && !o.fav) delete o.hs;
      if (o.est !== 0 && t - (o.fe || 0) > 52 * 4 && o.eq) {
        BORRAR.forEach(function (k) { delete o[k]; });
        if (o.cr) o.cr = { direccion: o.cr.direccion, reparto: o.cr.reparto, sx: o.cr.sx };
      }
      // Tus obras de hace más de 25 años quedan con su ficha, créditos e informe, sin el detalle técnico
      if (o.est === 0 && t - (o.fe || 0) > 52 * 25 && o.dur) {
        ['acc', 'u', 'delta', 'dur', 'sr', 'semProd', 'sobre', 't0', 'tLista', 'prog', 'anioPlan', 'max', 'eq'].forEach(function (k) { delete o[k]; });
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
        r.bruto2025 += Math.round(IA.mundo.aHoy(o.bruto || 0, o.anio));
      });
      const borrar = {};
      viejas.forEach(function (o) { borrar[o.id] = 1; });
      S.obras = S.obras.filter(function (o) { return !borrar[o.id]; });
      reindexar();
    }
  }

  return {
    ETAPAS: ETAPAS, NOMBRE_ETAPA: NOMBRE_ETAPA, ROLES: ROLES, reindexar: reindexar, porId: porId, tocar: tocar, activas: activas,
    delEstudio: delEstudio, enProduccion: enProduccion, enCartelera: enCartelera, tituloNuevo: tituloNuevo,
    clasificacionesDisponibles: clasificacionesDisponibles, clasificacionRecomendada: clasificacionRecomendada,
    validarGeneros: validarGeneros, borrador: borrador, idsEquipo: idsEquipo, costoTalento: costoTalento,
    equipoRecomendado: equipoRecomendado, equipoCompleto: equipoCompleto, duraciones: duraciones,
    semanasTotales: semanasTotales, estimar: estimar, crear: crear, paraPoster: paraPoster,
    costoTotal: costoTotal, multiplicador: multiplicador, neto: neto, compactar: compactar, escalaTono: escalaTono,
  };
})();
