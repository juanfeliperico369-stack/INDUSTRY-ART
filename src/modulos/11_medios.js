/* ==== módulo: medios ==== */
// V25 · Música, videojuegos, teatro y libros con un motor común: proyectos con equipo (la habilidad de cada talento
// en ese medio), calidad, ventas semanales por formato, piratería, cuota del mercado y premios del medio (Vinilo,
// Cartucho, Telón y Pluma). Música: álbumes, EP, sencillos, jingles y bandas sonoras; bandas o solistas con relación,
// contrato, práctica, giras, separación y reunión; vinilo, casete, CD, descargas y streams; certificaciones.
// Videojuegos: hasta cuatro plataformas con cuota, kits, motores propios que los rivales licencian, idiomas,
// antipiratería, ediciones, DLC, gratis con compras o suscripción, soporte, arcade y móviles. Teatro: temporadas en
// sala con funciones y ocupación, giras y obra grabada. Libros: tapas, tamaños, audiolibro, libro digital,
// traducciones, imprenta propia y cómics o mangas de tus franquicias. Cada proyecto tiene su portada.
IA.medios = (function () {
  'use strict';
  const N = IA.n, D = IA.datos, X = IA.taxonomia, T = IA.talentos;
  const tip = function (a) { return IA.economia.presupuestoTipico(a || N.anio()); };
  const ep = function (v, a) { return IA.mundo.aEpoca(v, a || N.anio()); };
  // ---------- Datos de cada medio ----------
  const MED = {
    musica: { nombre: 'Música', desde: 1877, of: ['interprete', 'musica', 'produccion'], decae: 0.9, base: 0.05, eqk: 0.15, premio: 'Premios Vinilo', premioDesde: 1959, cap: 'sonido',
      tipos: [{ id: 'sencillo', nombre: 'Sencillo', desde: 1890, k: 0.2, sem: 3 }, { id: 'ep', nombre: 'EP', desde: 1952, k: 0.4, sem: 5 }, { id: 'album', nombre: 'Álbum de estudio', desde: 1900, k: 1, sem: 10 },
        { id: 'doble', nombre: 'Álbum doble', desde: 1960, k: 1.7, sem: 16 }, { id: 'digital', nombre: 'Álbum digital', desde: 2003, k: 0.6, sem: 8 },
        { id: 'jingle', nombre: 'Jingle', desde: 1926, k: 0.08, sem: 2, encargo: 1 }, { id: 'banda', nombre: 'Banda sonora', desde: 1927, k: 0.6, sem: 8, peli: 1 }] },
    juegos: { nombre: 'Videojuegos', desde: 1972, of: ['direccion', 'guion', 'arte', 'efectos', 'musica'], decae: 0.88, base: 0.15, eqk: 0.5, premio: 'Premios Cartucho', premioDesde: 1982, cap: 'graficos' },
    teatro: { nombre: 'Teatro', desde: 1850, of: ['direccion', 'interprete', 'guion', 'vestuario'], decae: 1, base: 0.01, eqk: 0.04, premio: 'Premios Telón', premioDesde: 1947, cap: 'escuela' },
    libros: { nombre: 'Libros', desde: 1850, of: ['guion', 'arte'], decae: 0.93, base: 0.02, eqk: 0.1, premio: 'Premios Pluma', premioDesde: 1917, cap: 'imprenta' },
  };
  // Mercado mundial de cada medio, en miles de millones de dólares de 2025 (para la cuota)
  const MERCADO = {
    musica: [[1877, 0.01], [1900, 0.4], [1929, 3], [1933, 1], [1950, 5], [1978, 30], [1999, 42], [2014, 15], [2025, 30], [2150, 45]],
    juegos: [[1972, 0.05], [1982, 8], [1985, 2], [1995, 25], [2008, 60], [2025, 180], [2150, 400]],
    teatro: [[1850, 2], [1920, 6], [1950, 6], [2000, 12], [2020, 4], [2025, 20], [2150, 30]],
    libros: [[1850, 8], [1920, 25], [1960, 50], [2007, 110], [2025, 120], [2150, 140]],
  };
  // Música: formatos por época (peso relativo) y precio por unidad en dólares de 2025
  const FMT_MUSICA = [
    { id: 'cilindro', nombre: 'Cilindro', p: 20, w: [[1877, 1], [1905, 1], [1915, 0]] },
    { id: 'pizarra', nombre: 'Disco de pizarra', p: 15, w: [[1895, 0], [1905, 1], [1948, 1], [1958, 0]] },
    { id: 'vinilo', nombre: 'Vinilo', p: 25, w: [[1947, 0], [1950, 1], [1975, 1], [1988, 0.15], [2006, 0.02], [2020, 0.1], [2150, 0.06]] },
    { id: 'casete', nombre: 'Casete', p: 15, w: [[1962, 0], [1968, 0.2], [1985, 0.8], [1995, 0.3], [2005, 0]] },
    { id: 'cd', nombre: 'CD', p: 16, w: [[1981, 0], [1988, 0.7], [2000, 1], [2010, 0.3], [2025, 0.04], [2030, 0]] },
    { id: 'descarga', nombre: 'Descargas', p: 10, w: [[2002, 0], [2005, 0.3], [2012, 0.35], [2020, 0.04], [2030, 0]] },
    { id: 'stream', nombre: 'Streams', p: 0.004, w: [[2007, 0], [2012, 0.15], [2020, 0.85], [2150, 0.9]] },
  ];
  // Videojuegos: plataformas (nombres inventados) con su ciclo de vida
  const PLAT = [
    { id: 'arcade', nombre: 'Salones arcade', desde: 1972, pico: 1981, hasta: 2005 }, { id: 'orion', nombre: 'Consola Orión', desde: 1977, pico: 1981, hasta: 1990 },
    { id: 'byte', nombre: 'Microordenador Byte', desde: 1980, pico: 1986, hasta: 1995 }, { id: 'pc', nombre: 'Computadora personal', desde: 1985, pico: 2010, hasta: 2150 },
    { id: 'nova', nombre: 'Consola Nova 16', desde: 1987, pico: 1992, hasta: 2000 }, { id: 'pulga', nombre: 'Portátil Pulga', desde: 1989, pico: 1998, hasta: 2010 },
    { id: 'prisma', nombre: 'Consola Prisma', desde: 1994, pico: 2000, hasta: 2008 }, { id: 'atlas', nombre: 'Consola Atlas', desde: 2001, pico: 2008, hasta: 2016 },
    { id: 'movil', nombre: 'Teléfonos móviles', desde: 2007, pico: 2030, hasta: 2150 }, { id: 'zenit', nombre: 'Consola Zenit', desde: 2013, pico: 2020, hasta: 2030 },
    { id: 'visor', nombre: 'Visor de realidad virtual', desde: 2016, pico: 2045, hasta: 2080 }, { id: 'nube', nombre: 'Juego en la nube', desde: 2020, pico: 2060, hasta: 2150 },
    { id: 'vortex', nombre: 'Consola Vórtex', desde: 2029, pico: 2036, hasta: 2048 }, { id: 'neuro', nombre: 'Enlace neuronal', desde: 2085, pico: 2120, hasta: 2150 },
  ];
  const FUNCIONES = [{ id: '2d', nombre: 'Gráficos 2D', desde: 1972 }, { id: 'sonido', nombre: 'Sonido', desde: 1978 }, { id: '3d', nombre: 'Gráficos 3D', desde: 1993 },
    { id: 'red', nombre: 'Juego en red', desde: 1995 }, { id: 'fisica', nombre: 'Física', desde: 1998 }, { id: 'rv', nombre: 'Realidad virtual', desde: 2016 }, { id: 'ia', nombre: 'Personajes con IA', desde: 2022 }];
  const ESCALAS_J = [{ id: 'indie', nombre: 'Pequeño', k: 1, sem: 26 }, { id: 'medio', nombre: 'Mediano', k: 4, sem: 52 }, { id: 'grande', nombre: 'Superproducción', k: 15, sem: 100, desde: 1995 }];
  const MODELOS = [{ id: 'completo', nombre: 'Precio completo', desde: 1972 }, { id: 'gratis', nombre: 'Gratis con compras', desde: 2009 }, { id: 'suscripcion', nombre: 'Suscripción', desde: 2017 }];
  const SALAS = [{ id: 'chica', nombre: 'Sala chica', asientos: 200, k: 0.35 }, { id: 'mediana', nombre: 'Sala mediana', asientos: 800, k: 1 }, { id: 'grande', nombre: 'Gran teatro', asientos: 2000, k: 2.3 }];
  const TAPAS = [{ id: 'blanda', nombre: 'Tapa blanda', p: 12, k: 1 }, { id: 'dura', nombre: 'Tapa dura', p: 25, k: 1.6 }, { id: 'lujo', nombre: 'Edición de lujo', p: 45, k: 2.5 }];
  const TAMANOS = [{ id: 'bolsillo', nombre: 'Bolsillo', k: 0.8 }, { id: 'estandar', nombre: 'Estándar', k: 1 }, { id: 'grande', nombre: 'Gran formato', k: 1.3 }];
  // La imprenta propia se construye como un piso más
  if (!D.pisos.some(function (x) { return x.id === 'imprenta'; })) D.pisos.push({ id: 'imprenta', nombre: 'Imprenta propia', desde: 1850, costo: 0.4, efecto: 'Tus libros cuestan 30 % menos de imprimir y caben más proyectos de libros' });
  X.medios.forEach(function (m) { m.activo = true; if (m.id !== 'cine' && m.id !== 'tv') m.version = 'V25'; });

  function st() { const S = N.S; if (!S.med) S.med = { p: [], bandas: [], kits: {}, motores: [], motorLic: [], ofMot: [], premios: [], ing: {} }; return S.med; }
  function disponible(med, anio) { return (anio || N.anio()) >= MED[med].desde; }
  function tipos(med, anio) {
    const a = anio || N.anio();
    if (med === 'musica') return MED.musica.tipos.filter(function (x) { return x.desde <= a; });
    const l = X.tiposPorMedio[med] || [];
    return l.filter(function (x) { return !(med === 'libros' && x === 'Manga' && a < 1950) && !(med === 'juegos' && ['Mundo abierto', 'Sandbox'].indexOf(x) >= 0 && a < 1995); }).map(function (x) { return { id: x, nombre: x, k: 1, sem: 0 }; });
  }
  function familias(med) { return X.generosMedio[med] || []; }
  function famDe(med, gen) { return familias(med).filter(function (f) { return f.generos.indexOf(gen) >= 0; })[0] || familias(med)[0]; }
  function porId(id) { return st().p.filter(function (p) { return p.id === +id; })[0] || null; }
  function proyectos(med) { return st().p.filter(function (p) { return !med || p.med === med; }); }
  function capacidad(med) { return 2 + (IA.imperio.tiene(MED[med].cap) ? 1 : 0); }
  function enMarcha(med) { return proyectos(med).filter(function (p) { return p.et === 'produccion' || p.et === 'ensayo'; }).length; }
  function habMedio(t, med) { return T.perfilExtra(t).medios[med] || t.hab; }
  // Equipo recomendado: lo mejor disponible en ese medio dentro del presupuesto
  function equipoRecomendado(med, esc) {
    const usados = {}, eq = [];
    MED[med].of.forEach(function (of, i) {
      if (med === 'libros' && of === 'arte' && esc === 0) return;
      const n = of === 'interprete' && med === 'teatro' ? 3 : 1;
      const escala = Math.max(1, tip() * (0.02 + esc * 0.02));
      const cand = T.disponibles(of, 0).filter(function (t) { return !usados[t.id] && T.disponible(t, 0); })
        .map(function (t) { return { t: t, v: habMedio(t, med) - T.tarifaPara(t, 0) / escala }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, n).map(function (x) { return x.t; });
      cand.forEach(function (t) { usados[t.id] = 1; eq.push(t.id); });
    });
    return eq;
  }
  function costoEquipo(eq, med) { return eq.reduce(function (s, id) { const t = T.porId(id); return s + (t ? T.tarifaPara(t, 0) * MED[med].eqk : 0); }, 0); }
  // Borrador de un proyecto: med, tipo, gen, tit, esc (0 a 2) y la configuración propia del medio
  function borrador(med, op) {
    const a = N.anio(), o = op || {};
    const tp = tipos(med)[0], fam = familias(med)[0];
    const b = { med: med, tipo: o.tipo || (med === 'musica' ? 'album' : tp.id), gen: o.gen || (fam ? fam.generos[0] : 'General'), esc: o.esc === undefined ? 1 : o.esc, tit: o.tit || IA.obras.tituloNuevo(['Drama']), cfg: {} };
    if (med === 'musica') b.cfg = { banda: o.banda || null, peli: o.peli || null };
    if (med === 'juegos') b.cfg = { plats: platsRecomendadas(a), motor: null, idiomas: a >= 1990 ? 3 : 1, anti: 0, modelo: 'completo', edicion: 0 };
    if (med === 'teatro') b.cfg = { sala: 'mediana', funciones: 7, semanas: 12, ensayo: 6 };
    if (med === 'libros') b.cfg = { tapa: 'blanda', tam: 'estandar', audio: 0, ebook: a >= 2007 ? 1 : 0, trad: 1, fr: o.fr || null };
    b.eq = equipoRecomendado(med, b.esc);
    return recalcular(b);
  }
  function recalcular(b) {
    const a = N.anio(), m = MED[b.med], t = tip();
    let k = (m.base + (b.med === 'teatro' ? 0.005 : 0.06) * b.esc) * (b.esc === 2 && b.med !== 'juegos' ? 1.6 : 1), sem = 8;
    if (b.med === 'musica') { const tp = MED.musica.tipos.filter(function (x) { return x.id === b.tipo; })[0] || MED.musica.tipos[2]; k *= tp.k; sem = tp.sem; }
    if (b.med === 'juegos') {
      const e = ESCALAS_J[N.limitar(b.esc, 0, 2)];
      k = 0.03 * e.k * N.interp([[1972, 0.15], [1985, 0.4], [2000, 1], [2025, 1.6]], a); sem = e.sem;
      const mo = motor(b.cfg.motor); if (mo) { k *= 0.9; sem = Math.round(sem * 0.85); }
      k *= 1 + b.cfg.plats.filter(function (p) { return !st().kits[p]; }).length * 0.05 + (b.cfg.idiomas - 1) * 0.02 + (b.cfg.edicion ? 0.03 : 0);
    }
    if (b.med === 'teatro') { const s = sala(b.cfg.sala); k *= s.k; sem = b.cfg.ensayo; }
    if (b.med === 'libros') {
      const tp = TAPAS.filter(function (x) { return x.id === b.cfg.tapa; })[0], tm = TAMANOS.filter(function (x) { return x.id === b.cfg.tam; })[0];
      k *= tp.k * tm.k * (IA.imperio.tiene('imprenta') ? 0.7 : 1) * (1 + (b.cfg.trad - 1) * 0.08) * (b.cfg.audio ? 1.15 : 1);
      sem = ['Novela', 'Novela gráfica', 'Manga'].indexOf(b.tipo) >= 0 ? 20 : 12;
    }
    b.pp = Math.round(t * k);
    b.costo = Math.round(b.pp + costoEquipo(b.eq, b.med));
    b.sem = Math.max(2, Math.round(sem * (1 + b.esc * 0.15)));
    return b;
  }
  function sala(id) { return SALAS.filter(function (x) { return x.id === id; })[0] || SALAS[1]; }
  function validar(b) {
    const S = N.S, a = N.anio();
    if (!disponible(b.med)) return MED[b.med].nombre + ' llega en ' + MED[b.med].desde + '.';
    if (enMarcha(b.med) >= capacidad(b.med)) return 'Ya tienes ' + capacidad(b.med) + ' proyectos de ' + MED[b.med].nombre.toLowerCase() + ' en marcha.';
    if (!b.eq.length) return 'Falta el equipo.';
    if (b.eq.some(function (id) { const t = T.porId(id); return !t || !T.disponible(t, 0); })) return 'Alguien del equipo ya no está disponible.';
    if (b.med === 'musica' && ['jingle', 'banda'].indexOf(b.tipo) < 0 && !b.cfg.banda) return 'Elige una banda o solista con contrato.';
    if (b.med === 'musica' && b.cfg.banda) { const bd = banda(b.cfg.banda); if (!bd || bd.sep) return 'Esa banda está separada.'; }
    if (b.med === 'musica' && b.tipo === 'banda' && !b.cfg.peli) return 'Una banda sonora necesita una película tuya.';
    if (b.med === 'juegos' && (!b.cfg.plats.length || b.cfg.plats.length > 4)) return 'Elige de una a cuatro plataformas.';
    if (b.med === 'juegos' && b.cfg.plats.some(function (p) { const x = plat(p); return !x || x.desde > a || x.hasta < a; })) return 'Esa plataforma no está a la venta.';
    if (S.estudios[0].caja < b.costo) return 'No alcanza la caja.';
    return '';
  }
  function iniciar(b) {
    const e = validar(b);
    if (e) return { error: e };
    const S = N.S, p = N.copiar(b);
    p.id = N.sigId(); p.est = 0; p.t0 = S.t; p.sr = p.sem; p.et = p.med === 'teatro' ? 'ensayo' : 'produccion'; p.ing = 0; p.gas = p.costo; p.vend = {}; p.hs = []; p.port = N.hash('p' + p.id + p.tit) % 100000;
    IA.negocio.pagar(0, 'produccion', p.costo);
    T.ocupar(p.eq, S.t + p.sem);
    // Jingle: es un encargo, te pagan al empezar
    if (p.tipo === 'jingle') { const pago = Math.round(p.costo * 1.6); IA.negocio.cobrarEn(0, 'musica', pago); p.ing += pago; }
    st().p.push(p);
    N.emit('noticia', { tipo: 'estudio', texto: 'Empieza ' + (p.med === 'teatro' ? 'el ensayo de' : 'la producción de') + ' «' + p.tit + '» (' + MED[p.med].nombre.toLowerCase() + ').' });
    return { proyecto: p };
  }
  // Calidad al terminar la producción
  function calificar(p) {
    const ts = p.eq.map(T.porId).filter(Boolean);
    let q = ts.length ? ts.reduce(function (s, t, i) { return s + habMedio(t, p.med) * (i === 0 ? 1.5 : 1); }, 0) / (ts.length + 0.5) : 40;
    q += p.esc * 3;
    const bd = p.cfg.banda ? banda(p.cfg.banda) : null;
    if (bd) q += bd.prac / 6 + (bd.rel - 50) / 25;
    const mo = motor(p.cfg.motor); if (mo) q += mo.est * 1.5;
    if (p.med === 'teatro') q += (p.cfg.ensayo - 6) * 0.8;
    const fam = famDe(p.med, p.gen), tend = fam ? N.S.mundo.tendencias[fam.eje] || 0 : 0;
    q = N.limitar(q + N.normal(0, 6), 5, 98);
    p.q = Math.round(q);
    p.crit = Math.round(N.limitar(q + N.normal(0, 6) + (fam && fam.inclina === 'crit' ? 3 : 0), 1, 99));
    p.pub = Math.round(N.limitar(q + tend * 10 + N.normal(0, 6) + (fam && fam.inclina === 'pub' ? 3 : 0) - (p.cfg.anti === 2 ? 2 : 0) - (p.cfg.modelo === 'gratis' ? 1 : 0), 1, 99));
  }
  // Lo que puede ganar en total (repartido semana a semana con su caída)
  function potencial(p) {
    let f = 1.35 * Math.pow(p.pub / 60, 2.2) * Math.exp(N.normal(0, 0.35));
    const fam = famDe(p.med, p.gen); if (fam) f *= 1 + (N.S.mundo.tendencias[fam.eje] || 0) * 0.3;
    const bd = p.cfg.banda ? banda(p.cfg.banda) : null;
    if (bd) { f *= 1 + Math.min(1, bd.fans / 2e6) * 0.5; if (bd.reu) { f *= 1.5; bd.reu = 0; } }
    if (p.med === 'juegos') {
      const sh = p.cfg.plats.reduce(function (s, id) { return s + cuota(id) * (st().kits[id] ? 1 : 0.6); }, 0);
      f *= (0.3 + 1.4 * Math.min(1, sh)) * (1 + (p.cfg.idiomas - 1) * 0.12) * (p.cfg.edicion ? 1.08 : 1) * (p.cfg.modelo === 'gratis' ? 1.15 : p.cfg.modelo === 'suscripcion' ? 0.9 : 1);
    }
    if (p.med === 'libros') { f *= (1 + (p.cfg.trad - 1) * 0.12) * (p.cfg.ebook ? 1.1 : 1) * (p.cfg.audio ? 1.12 : 1); if (p.cfg.fr) { const fr = IA.franquicias.porId(p.cfg.fr); if (fr) f *= 1 + fr.pers.reduce(function (s, x) { return Math.max(s, x.pop); }, 0) / 100; } }
    if (p.med === 'musica' && p.tipo === 'banda' && p.cfg.peli) { const o = IA.obras.porId(p.cfg.peli); if (o && o.bruto) f *= 1 + Math.min(1.5, o.bruto / tip() * 0.2); }
    return Math.round(p.costo * f);
  }
  function lanzar(p) {
    const S = N.S;
    calificar(p);
    T.liberar(p.eq);
    p.fe = S.t; p.anio = N.anio(); p.pw = 0;
    if (p.med === 'teatro') { p.et = 'temporada'; p.semT = 0; p.ocup = N.redondear(N.limitar(Math.pow(p.pub / 70, 1.5) * 0.8, 0.15, 1), 3); p.malas = 0; }
    else { p.et = 'lanzado'; p.R = p.tipo === 'jingle' ? 0 : potencial(p); }
    if (p.cfg.fr && p.med === 'libros') { const fr = IA.franquicias.porId(p.cfg.fr); if (fr) fr.pers.forEach(function (x) { x.pop = Math.min(99, x.pop + 2); }); }
    N.emit('noticia', { tipo: 'estudio', texto: '«' + p.tit + '» sale a la venta: crítica ' + p.crit + ', público ' + p.pub + '.', importante: true });
  }
  // ---------- Ventas por formato ----------
  function formatosMusica(a) {
    const ws = FMT_MUSICA.map(function (f) { return Math.max(0, N.interp(f.w, a)); }), s = ws.reduce(function (x, y) { return x + y; }, 0) || 1;
    return FMT_MUSICA.map(function (f, i) { return { id: f.id, nombre: f.nombre, parte: ws[i] / s, p: f.p }; }).filter(function (f) { return f.parte > 0.001; });
  }
  function registrarVentas(p, monto) {
    const a = N.anio(), v = p.vend, pir = IA.historia.pirateria(a);
    if (p.med === 'musica') {
      formatosMusica(a).forEach(function (f) { const digital = f.id === 'descarga' || f.id === 'stream'; v[f.id] = (v[f.id] || 0) + Math.round(monto * f.parte * (digital ? pir : 1) / ep(f.p, a)); });
      if (p.tipo === 'banda' || p.cfg.banda) v.vistas = (v.vistas || 0) + (a >= 2005 ? Math.round(monto * 0.05 / ep(0.002, a)) : 0);
    } else if (p.med === 'juegos') {
      const dig = N.interp([[2003, 0], [2010, 0.3], [2020, 0.75], [2150, 0.95]], a);
      const precio = ep(p.cfg.modelo === 'gratis' ? 8 : 55, a);
      v.fisicas = (v.fisicas || 0) + Math.round(monto * (1 - dig) / precio);
      v.digitales = (v.digitales || 0) + Math.round(monto * dig / precio);
      v.jugadores = Math.round((v.jugadores || 0) * 0.97 + monto / precio * (p.cfg.modelo === 'gratis' ? 4 : 1));
    } else if (p.med === 'libros') {
      const tp = TAPAS.filter(function (x) { return x.id === p.cfg.tapa; })[0];
      v.copias = (v.copias || 0) + Math.round(monto / ep(tp.p, a));
      if (p.cfg.ebook) v.digitales = (v.digitales || 0) + Math.round(monto * 0.15 / ep(6, a));
      if (p.cfg.audio) v.audio = (v.audio || 0) + Math.round(monto * 0.1 / ep(15, a));
    }
  }
  function unidades(p) {
    const v = p.vend;
    if (p.med === 'musica') return Object.keys(v).filter(function (k) { return k !== 'stream' && k !== 'vistas'; }).reduce(function (s, k) { return s + v[k]; }, 0) + (N.anio() >= 2016 ? Math.round((v.stream || 0) / 1500) : 0);
    if (p.med === 'juegos') return (v.fisicas || 0) + (v.digitales || 0);
    if (p.med === 'libros') return (v.copias || 0) + (v.digitales || 0) + (v.audio || 0);
    return v.entradas || 0;
  }
  const CERT = [{ id: 'diamante', nombre: 'Diamante', u: 10e6, desde: 1999 }, { id: 'multi', nombre: 'Multiplatino', u: 2e6, desde: 1984 }, { id: 'platino', nombre: 'Platino', u: 1e6, desde: 1976 }, { id: 'oro', nombre: 'Oro', u: 5e5, desde: 1958 }];
  function certificar(p) {
    if (p.med !== 'musica') return;
    const u = unidades(p), a = N.anio();
    const c = CERT.filter(function (x) { return x.desde <= a && u >= x.u; })[0];
    if (c && p.cert !== c.id) { p.cert = c.id; N.emit('noticia', { tipo: 'estudio', texto: '«' + p.tit + '» es disco de ' + c.nombre.toLowerCase() + '.', importante: true }); }
  }
  // ---------- La semana ----------
  function semana() {
    const S = N.S, a = N.anio(), s = st();
    s.p.forEach(function (p) {
      if (p.et === 'produccion' || p.et === 'ensayo') { if (--p.sr <= 0) lanzar(p); return; }
      if (p.et === 'temporada') return semanaTeatro(p);
      if (p.et !== 'lanzado' && p.et !== 'catalogo') return;
      p.pw++;
      let d = MED[p.med].decae + (p.sop ? 0.03 : 0) + (p.cfg.modelo === 'suscripcion' ? 0.06 : 0);
      d = Math.min(0.985, d);
      let m = p.et === 'catalogo' ? p.R * 0.0004 : p.R * (1 - d) * Math.pow(d, p.pw - 1);
      // Una plataforma que muere se lleva las ventas
      if (p.med === 'juegos') m *= N.limitar(p.cfg.plats.reduce(function (x, id) { return x + (plat(id).hasta >= a ? 1 : 0); }, 0) / p.cfg.plats.length, 0, 1);
      if (p.med === 'musica' || p.med === 'juegos') m *= p.cfg.anti === 1 ? (1 + IA.historia.pirateria(a)) / 2 + 0.05 : p.cfg.anti === 2 ? 1 : IA.historia.pirateria(a) * 0.5 + 0.5;
      if (p.sop) { IA.negocio.pagar(0, 'produccion', Math.round(p.costo * 0.004)); p.gas += Math.round(p.costo * 0.004); }
      m = Math.round(m);
      if (m > 0) {
        cobrar(p, m);
        registrarVentas(p, m);
        p.hs.push(m); if (p.hs.length > 30) p.hs.shift();
        certificar(p);
      }
      if (p.et === 'lanzado' && p.pw > 60) { p.et = 'catalogo'; p.sop = 0; }
    });
    // Los proyectos viejos del catálogo se resumen (memoria)
    if (s.p.length > 120) s.p = s.p.filter(function (p) { return p.et !== 'catalogo' || S.t - p.fe < 52 * 30 || p.cert || p.prem; });
  }
  function cobrar(p, m) {
    const cat = p.med;
    IA.negocio.cobrarEn(0, cat, m);
    p.ing += m;
    st().ing[cat] = (st().ing[cat] || 0) + m;
    // Regalías de la banda (15 %) y de los autores (10 %)
    const reg = p.cfg.banda ? 0.15 : 0.1;
    const ids = p.cfg.banda ? (banda(p.cfg.banda) || { m: [] }).m : p.eq.slice(0, 1);
    if (ids.length) { const r = Math.round(m * reg); IA.negocio.pagar(0, 'talento', r); ids.forEach(function (id) { T.pagarA(id, r / ids.length); }); p.gas += r; }
  }
  // ---------- Teatro ----------
  function semanaTeatro(p) {
    const s = sala(p.cfg.sala), a = N.anio();
    p.semT++;
    p.ocup = N.redondear(N.limitar(p.ocup + (p.pub - 60) / 600 + N.normal(0, 0.02), 0.05, 1), 3);
    const entradas = Math.round(s.asientos * p.cfg.funciones * p.ocup * (p.gira ? 0.8 : 1));
    const ing = Math.round(entradas * ep(p.gira ? 70 : 110, a)), gas = Math.round(p.costo * 0.03);
    cobrar(p, ing); IA.negocio.pagar(0, 'produccion', gas); p.gas += gas;
    p.vend.entradas = (p.vend.entradas || 0) + entradas;
    p.vend.funciones = (p.vend.funciones || 0) + p.cfg.funciones;
    p.hs.push(ing); if (p.hs.length > 30) p.hs.shift();
    p.malas = p.ocup < 0.25 ? p.malas + 1 : 0;
    const dura = p.gira ? p.gira * 2 : p.cfg.semanas;
    // Un éxito extiende la temporada (hasta cuatro veces)
    if (!p.gira && p.semT >= dura && p.ocup >= 0.8 && (p.ext || 0) < 4) { p.ext = (p.ext || 0) + 1; p.cfg.semanas += 8; N.emit('noticia', { tipo: 'estudio', texto: '«' + p.tit + '» llena la sala: extienden la temporada.' }); return; }
    if (p.semT >= dura || p.malas >= 3) {
      p.et = 'catalogo'; p.R = 0;
      N.emit('noticia', { tipo: 'estudio', texto: '«' + p.tit + '» baja el telón tras ' + p.semT + ' semanas (' + Math.round(p.ocup * 100) + ' % de ocupación).' });
      p.gira = 0;
    }
  }
  function gira(id, ciudades) {
    const p = porId(id), S = N.S;
    if (!p || p.med !== 'teatro' || p.et !== 'catalogo') return 'La obra debe haber terminado su temporada.';
    const c = Math.round(p.costo * 0.25);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', c); p.gas += c;
    p.gira = N.limitar(+ciudades || 4, 2, 12); p.et = 'temporada'; p.semT = 0; p.malas = 0; p.ocup = N.limitar(p.ocup + 0.1, 0.2, 1);
    return '';
  }
  function grabar(id, destino) {
    const p = porId(id), S = N.S;
    if (!p || p.med !== 'teatro' || p.grab) return 'No se puede grabar.';
    if (destino === 'stream') { if (!S.stream) return 'No tienes plataforma.'; const e = IA.streaming.agregar(null, 'propio', { nom: p.tit + ' (teatro grabado)', q: p.pub, ed: 0 }); if (e) return e; }
    else { if (N.anio() < 1950) return 'La televisión todavía no compra obras de teatro.'; const pago = Math.round(p.costo * 0.3); IA.negocio.cobrarEn(0, 'teatro', pago); p.ing += pago; }
    p.grab = destino;
    return '';
  }
  // ---------- Música: bandas y solistas ----------
  function banda(id) { return st().bandas.filter(function (b) { return b.id === +id; })[0] || null; }
  function bandas() { return st().bandas; }
  function costoContrato(ids) { return Math.round(ids.reduce(function (s, id) { const t = T.porId(id); return s + (t ? T.tarifaPara(t, 0) * 0.5 : 0); }, 0) + tip() * 0.01); }
  function firmarBanda(nom, ids, tipo) {
    const S = N.S;
    ids = (ids || []).filter(function (x, i, a) { return a.indexOf(x) === i; });
    if (!ids.length) return 'Elige integrantes.';
    if (tipo === 'solista' && ids.length !== 1) return 'Un solista es una sola persona.';
    if (ids.some(function (id) { const t = T.porId(id); return !t || t.ret || t.mu; })) return 'Alguien no está disponible.';
    if (ids.some(function (id) { return st().bandas.some(function (b) { return !b.sep && b.m.indexOf(id) >= 0; }); })) return 'Alguien ya está en otra banda tuya.';
    const c = costoContrato(ids);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'talento', c);
    const t0 = T.porId(ids[0]);
    st().bandas.push({ id: N.sigId(), nom: (nom || (tipo === 'solista' ? t0.nom : 'Los ' + N.elegir(D.titulo2))).slice(0, 40), tipo: tipo === 'solista' ? 'solista' : 'banda', m: ids, rel: 70, prac: 0, fans: Math.round(5000 + t0.fama * 2e5), t0: S.t, hasta: S.t + 52 * 5, sep: null });
    return '';
  }
  function practicar(id) {
    const b = banda(id), S = N.S;
    if (!b || b.sep) return 'No se puede.';
    if (b.pr > S.t) return 'Ya practicaron este mes.';
    const c = Math.round(tip() * 0.003);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', c);
    b.prac = Math.min(30, b.prac + 5); b.rel = Math.min(100, b.rel + 2); b.pr = S.t + 4;
    return '';
  }
  const GIRAS = [{ id: 'local', nombre: 'Gira local', k: 0.02, sem: 4, f: 1 }, { id: 'nacional', nombre: 'Gira nacional', k: 0.06, sem: 8, f: 3.2 }, { id: 'mundial', nombre: 'Gira mundial', k: 0.2, sem: 20, f: 11 }];
  function costoGira(b, g) { return Math.round(tip() * g.k); }
  function irDeGira(id, gid) {
    const S = N.S, b = banda(id), g = GIRAS.filter(function (x) { return x.id === gid; })[0];
    if (!b || b.sep || !g) return 'No se puede.';
    if (b.gira) return 'Ya están de gira.';
    const c = costoGira(b, g);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', c);
    const ult = st().p.filter(function (p) { return p.cfg.banda === b.id && p.pub !== undefined; }).pop();
    const q = ult ? ult.pub : 50;
    const total = Math.round(c * g.f / (g.f > 1 ? 2.2 : 1) * Math.pow(q / 60, 1.5) * (0.6 + Math.min(2, b.fans / 1e6)) * (b.reu ? 1.5 : 1));
    b.gira = { g: g.id, sem: g.sem, porSem: Math.round(total / g.sem), t0: S.t };
    b.rel = Math.max(0, b.rel - (g.id === 'mundial' ? 12 : 6));
    return '';
  }
  function reunir(id) {
    const S = N.S, b = banda(id);
    if (!b || !b.sep) return 'La banda no está separada.';
    if (S.t - b.sep < 52 * 3) return 'Necesitan al menos tres años separados.';
    if (b.m.some(function (x) { const t = T.porId(x); return !t || t.mu; })) return 'Falta alguien que ya no está.';
    const c = Math.round(tip() * 0.3);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'talento', c);
    b.sep = null; b.rel = 60; b.reu = 1; b.hasta = S.t + 52 * 3; b.fans = Math.round(b.fans * 1.3);
    N.emit('noticia', { tipo: 'estudio', texto: '¡' + b.nom + ' vuelve a reunirse!', importante: true });
    return '';
  }
  function mensualBandas() {
    const S = N.S;
    st().bandas.forEach(function (b) {
      if (b.sep) return;
      b.rel = Math.round(N.limitar(b.rel + N.normal(-1, 2), 0, 100));
      b.fans = Math.round(b.fans * (0.995 + Math.max(0, b.rel - 50) / 5000));
      if (b.tipo === 'banda' && b.rel < 20 && N.probabilidad(0.15)) { b.sep = S.t; N.emit('noticia', { tipo: 'estudio', texto: b.nom + ' se separa: ya no se soportan.', importante: true }); }
      if (b.hasta < S.t && b.tipo !== 'x') { b.hasta = S.t + 52 * 2; IA.negocio.pagar(0, 'talento', Math.round(costoContrato(b.m) * 0.5)); }
    });
  }
  function semanaGiras() {
    st().bandas.forEach(function (b) {
      if (!b.gira) return;
      IA.negocio.cobrarEn(0, 'musica', b.gira.porSem); st().ing.musica = (st().ing.musica || 0) + b.gira.porSem;
      b.fans = Math.round(b.fans * 1.01 + 200);
      if (--b.gira.sem <= 0) { b.gira = null; b.reu = 0; }
    });
  }
  // ---------- Videojuegos: plataformas, kits y motores ----------
  function plat(id) { return PLAT.filter(function (p) { return p.id === id; })[0]; }
  function cuotaBruta(p, a) { if (a < p.desde || a > p.hasta) return 0; return a <= p.pico ? 0.2 + 0.8 * (a - p.desde) / Math.max(1, p.pico - p.desde) : Math.max(0.05, 1 - (a - p.pico) / Math.max(1, p.hasta - p.pico)); }
  function cuota(id, anio) { const a = anio || N.anio(), tot = PLAT.reduce(function (s, p) { return s + cuotaBruta(p, a); }, 0) || 1; const p = plat(id); return p ? cuotaBruta(p, a) / tot : 0; }
  function plataformas(anio) { const a = anio || N.anio(); return PLAT.filter(function (p) { return p.desde <= a && p.hasta >= a; }).map(function (p) { return { id: p.id, nombre: p.nombre, cuota: cuota(p.id, a), kit: !!st().kits[p.id], muere: p.hasta, costoKit: costoKit(p) }; }); }
  function platsRecomendadas(a) { return plataformas(a).sort(function (x, y) { return y.cuota - x.cuota; }).slice(0, 2).map(function (p) { return p.id; }); }
  function costoKit() { return Math.round(tip() * 0.04); }
  function comprarKit(id) { const S = N.S; if (st().kits[id]) return 'Ya tienes ese kit.'; const p = plat(id); if (!p || p.desde > N.anio() || p.hasta < N.anio()) return 'Esa plataforma no está a la venta.'; if (S.estudios[0].caja < costoKit()) return 'No alcanza la caja.'; IA.negocio.pagar(0, 'investigacion', costoKit()); st().kits[id] = N.S.t; return ''; }
  function motor(id) { return id ? st().motores.concat(st().motorLic).filter(function (m) { return m.id === +id; })[0] || null : null; }
  function funcionesDe(a) { return FUNCIONES.filter(function (f) { return f.desde <= (a || N.anio()); }); }
  function estrellasMotor(fun, anio) { const disp = funcionesDe(anio).length; return N.limitar(Math.round(1 + 4 * fun.length / Math.max(1, disp)), 1, 5); }
  function costoMotor(fun) { return Math.round(tip() * 0.08 * Math.max(1, fun.length)); }
  function crearMotor(nom, fun) {
    const S = N.S;
    fun = (fun || []).filter(function (f) { return funcionesDe().some(function (x) { return x.id === f; }); });
    if (N.anio() < 1972) return 'Los videojuegos llegan en 1972.';
    if (!fun.length) return 'Elige al menos una función.';
    const c = costoMotor(fun);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'investigacion', c);
    st().motores.push({ id: N.sigId(), nom: (nom || 'Motor ' + N.elegir(D.titulo1)).slice(0, 30), fun: fun, est: estrellasMotor(fun), anio: N.anio(), de: 0 });
    return '';
  }
  function licenciarMotor(i) {
    const S = N.S, of = st().ofMot[+i];
    if (!of) return 'Esa oferta venció.';
    if (S.estudios[0].caja < of.precio) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'investigacion', of.precio); if (S.estudios[of.est]) S.estudios[of.est].caja += of.precio;
    st().motorLic.push({ id: N.sigId(), nom: of.nom, fun: of.fun, est: of.est5, anio: N.anio(), de: of.est, hasta: S.t + 52 * 3 });
    st().ofMot.splice(+i, 1);
    return '';
  }
  // Contenido descargable, soporte, edición de coleccionista y paquete
  function dlc(id) {
    const p = porId(id), S = N.S;
    if (!p || p.med !== 'juegos' || p.et === 'produccion') return 'Solo juegos ya lanzados.';
    if (N.anio() < 2005) return 'El contenido descargable llega con las tiendas digitales.';
    const c = Math.round(p.costo * 0.15);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', c); p.gas += c;
    p.R = Math.round(p.R * 0.3 + c * 1.8 * Math.pow(p.pub / 60, 2)); p.pw = 1; p.et = 'lanzado'; p.dlc = (p.dlc || 0) + 1;
    return '';
  }
  function soporte(id, on) { const p = porId(id); if (!p || p.med !== 'juegos') return 'No se puede.'; p.sop = on ? 1 : 0; if (on && !p.sopUsado) { p.pub = Math.min(99, p.pub + 1); p.sopUsado = 1; } return ''; }
  function paquete(a, b) {
    const x = porId(a), y = porId(b), S = N.S;
    if (!x || !y || x === y || x.med !== 'juegos' || y.med !== 'juegos' || x.et === 'produccion' || y.et === 'produccion') return 'Elige dos juegos lanzados.';
    if (x.paq || y.paq) return 'Alguno ya salió en paquete.';
    const m = Math.round((x.R + y.R) * 0.12);
    x.paq = y.paq = 1; cobrar(x, m); registrarVentas(x, m);
    return '';
  }
  // Traducciones, edición nueva y libros de tus franquicias
  function traducir(id) {
    const p = porId(id), S = N.S;
    if (!p || p.med !== 'libros' || p.et === 'produccion') return 'Solo libros publicados.';
    if (p.cfg.trad >= 12) return 'Ya está en todos los idiomas.';
    const c = Math.round(tip() * 0.004);
    if (S.estudios[0].caja < c) return 'No alcanza la caja.';
    IA.negocio.pagar(0, 'produccion', c); p.gas += c;
    p.cfg.trad++; p.R = Math.round(p.R * 1.06 + c * 1.5); if (p.et === 'catalogo') { p.et = 'lanzado'; p.pw = 20; }
    return '';
  }
  // ---------- Premios de cada medio ----------
  function premiar(med, anio) {
    const S = N.S, m = MED[med];
    if (anio < m.premioDesde) return;
    const mios = st().p.filter(function (p) { return p.med === med && p.anio === anio && p.pub !== undefined; });
    const rivs = IA.rivales.activos();
    const nom = function () { return { tit: IA.obras.tituloNuevo(['Drama']), est: rivs.length ? N.elegir(rivs).id : -1, crit: Math.round(N.normal(76, 8)), pub: Math.round(N.normal(76, 8)) }; };
    const cand = mios.map(function (p) { return { tit: p.tit, est: 0, crit: p.crit, pub: p.pub, p: p }; }).concat([nom(), nom(), nom(), nom(), nom(), nom()]);
    const cats = [['mejor', 'Mejor ' + (med === 'musica' ? 'álbum' : med === 'juegos' ? 'juego' : med === 'teatro' ? 'obra' : 'libro') + ' del año', function (x) { return x.crit + x.pub; }], ['critica', 'Premio de la crítica', function (x) { return x.crit; }], ['publico', 'Favorito del público', function (x) { return x.pub; }]];
    const r = { med: med, nombre: m.premio, anio: anio, cats: cats.map(function (c) { const g = cand.slice().sort(function (a, b) { return c[2](b) - c[2](a); })[0]; if (g.p) { g.p.prem = (g.p.prem || 0) + 1; S.estudios[0].fama = N.redondear(Math.min(1, S.estudios[0].fama + 0.01), 3); } return { nombre: c[1], tit: g.tit, est: g.est }; }) };
    st().premios.push(r); if (st().premios.length > 200) st().premios.shift();
    const tuyos = r.cats.filter(function (c) { return c.est === 0; }).length;
    if (tuyos) N.emit('noticia', { tipo: 'premios', texto: m.premio + ' ' + (anio + 1) + ': ganas ' + tuyos + ' de 3.', importante: true });
  }
  function anual() {
    const S = N.S, a = N.anio(), s = st();
    Object.keys(MED).forEach(function (med) { premiar(med, a - 1); });
    // Tus motores: los rivales te los licencian
    s.motores.forEach(function (m) { if (N.probabilidad(0.15 * m.est) && a - m.anio < 12) { const pago = Math.round(tip() * 0.03 * m.est); IA.negocio.cobrarEn(0, 'juegos', pago); s.ing.juegos = (s.ing.juegos || 0) + pago; } });
    s.motorLic = s.motorLic.filter(function (m) { return m.hasta > S.t; });
    s.ofMot = [];
    if (a >= 1980) IA.rivales.activos().slice(0, 3).forEach(function (e) {
      const fun = funcionesDe(a).filter(function () { return N.probabilidad(0.7); }).map(function (f) { return f.id; });
      if (fun.length) s.ofMot.push({ est: e.id, nom: 'Motor ' + e.nombre.split(' ')[0], fun: fun, est5: estrellasMotor(fun, a), precio: Math.round(tip() * 0.06 * estrellasMotor(fun, a)) });
    });
    s.ing = {};
  }
  function semanaTodo() { semana(); semanaGiras(); }
  function cuotaMercado(med) { const a = N.anio(), v = (st().ing[med] || 0) * 52 / Math.max(1, N.semana()); return v / (ep(N.interp(MERCADO[med], a) * 1e9, a)); }
  // ---------- Portadas: descripción (el dibujo lo hace la interfaz con la misma semilla) ----------
  const COLORES = ['rojo', 'azul noche', 'dorado', 'verde selva', 'violeta', 'naranja', 'negro', 'blanco', 'turquesa', 'rosa'];
  const MOTIVOS = { musica: ['una guitarra en llamas', 'un micrófono antiguo', 'una ciudad de neón', 'un corazón de vinilo', 'un faro bajo la lluvia'], juegos: ['un héroe pixelado', 'una nave entre planetas', 'un castillo flotante', 'un robot gigante', 'un laberinto'], teatro: ['un telón entreabierto', 'una máscara dividida', 'una silla vacía bajo un foco', 'una corona rota'], libros: ['una llave sobre un mapa', 'un bosque de tinta', 'una mujer frente al mar', 'un reloj sin agujas', 'una puerta en la niebla'] };
  function portada(p) {
    const s = p.port || 1;
    return { c1: s % 10, c2: Math.floor(s / 10) % 10, forma: Math.floor(s / 100) % 5, texto: 'Fondo ' + COLORES[s % 10] + ' con ' + MOTIVOS[p.med][Math.floor(s / 7) % MOTIVOS[p.med].length] + '; título en letras ' + COLORES[Math.floor(s / 10) % 10] + '.' };
  }
  function resumen() {
    return Object.keys(MED).map(function (med) {
      const ps = proyectos(med);
      return { med: med, nombre: MED[med].nombre, disponible: disponible(med), proyectos: ps.length, enMarcha: enMarcha(med), ing: st().ing[med] || 0, premios: st().premios.filter(function (r) { return r.med === med; }).reduce(function (s, r) { return s + r.cats.filter(function (c) { return c.est === 0; }).length; }, 0) };
    });
  }
  return { MED: MED, FMT_MUSICA: FMT_MUSICA, PLAT: PLAT, FUNCIONES: FUNCIONES, ESCALAS_J: ESCALAS_J, MODELOS: MODELOS, SALAS: SALAS, TAPAS: TAPAS, TAMANOS: TAMANOS, GIRAS: GIRAS, CERT: CERT,
    disponible: disponible, tipos: tipos, familias: familias, porId: porId, proyectos: proyectos, capacidad: capacidad, enMarcha: enMarcha, habMedio: habMedio, equipoRecomendado: equipoRecomendado,
    borrador: borrador, recalcular: recalcular, validar: validar, iniciar: iniciar, potencial: potencial, formatosMusica: formatosMusica, unidades: unidades, gira: gira, grabar: grabar,
    banda: banda, bandas: bandas, costoContrato: costoContrato, firmarBanda: firmarBanda, practicar: practicar, costoGira: costoGira, irDeGira: irDeGira, reunir: reunir,
    plat: plat, cuota: cuota, plataformas: plataformas, costoKit: costoKit, comprarKit: comprarKit, motor: motor, motores: function () { return st().motores.concat(st().motorLic); },
    ofertasMotor: function () { return st().ofMot; }, funcionesDe: funcionesDe, estrellasMotor: estrellasMotor, costoMotor: costoMotor, crearMotor: crearMotor, licenciarMotor: licenciarMotor,
    dlc: dlc, soporte: soporte, paquete: paquete, traducir: traducir, premios: function (med) { return st().premios.filter(function (r) { return !med || r.med === med; }); },
    semana: semanaTodo, mensual: mensualBandas, anual: anual, cuotaMercado: cuotaMercado, portada: portada, resumen: resumen, sala: sala };
})();
