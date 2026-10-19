/* ==== módulo: metas ==== */
// Modos Campaña, Libre y Personalizado; dificultades Experto y Pesadilla (se desbloquean al ganar) con textos
// con humor; campaña por décadas con legado; logros con nombres divertidos; misiones por correo con fecha límite;
// retos de final de partida (ranking, legado, imperio y dinastía) con créditos y resumen de la carrera; tutorial que
// desbloquea las secciones poco a poco; consejos del momento y Editor Sandbox con paquetes.
ART.metas = (function () {
  'use strict';
  const N = ART.n, O = ART.obras, D = ART.datos;
  const tip = function () { return ART.economia.presupuestoTipico(N.anio()); };
  const MODOS = [
    { id: 'campana', nombre: 'Campaña', texto: 'Metas por década, legado y un reto final.' },
    { id: 'libre', nombre: 'Libre', texto: 'Sin metas obligatorias: juega a tu ritmo.' },
    { id: 'personalizado', nombre: 'Personalizado', texto: 'Tú eliges el dinero, la fuerza de los rivales y cuántos eventos hay.' },
  ];
  const HUMOR = {
    facil: 'Los bancos te sonríen y los críticos duermen la siesta.', normal: 'Hollywood tal como es: injusto pero predecible.',
    dificil: 'Los rivales madrugan y los bancos leen la letra chica.', experto: 'Cada estreno es un duelo al amanecer.',
    pesadilla: 'Tus estrellas se odian, tu banco te odia y tu madre prefiere al estudio de enfrente.',
  };
  const RETOS = [
    { id: 'ranking', nombre: 'Ranking', texto: 'Sé el estudio número 1 en cuota tres años seguidos.' },
    { id: 'legado', nombre: 'Legado', texto: 'Junta 150 puntos de legado en la campaña.' },
    { id: 'imperio', nombre: 'Imperio', texto: 'Llega a un patrimonio de 300 presupuestos típicos con dos filiales.' },
    { id: 'dinastia', nombre: 'Dinastía', texto: 'Que tu estudio llegue a la tercera generación de tu familia.' },
  ];
  // Logros: [id, nombre divertido, descripción, condición]
  const LOGROS = [
    ['primera', 'Luz, cámara… ¿acción?', 'Estrena tu primera obra.', function (S) { return mias(S).length >= 1; }],
    ['diez', 'Fábrica de sueños (versión beta)', 'Estrena 10 obras.', function (S) { return mias(S).length >= 10; }],
    ['cien', 'Ya no recuerdo todos los títulos', 'Estrena 100 obras.', function (S) { return mias(S).length >= 100; }],
    ['taquillazo', 'Las palomitas se acabaron', 'Una obra que gane 5 veces lo que costó.', function (S) { return mias(S).some(function (o) { return O.multiplicador(o) >= 5; }); }],
    ['bomba', 'Fracaso con estilo', 'Una obra que recupere menos de la cuarta parte.', function (S) { return mias(S).some(function (o) { return o.et === 'terminada' && O.multiplicador(o) < 0.25; }); }],
    ['critica90', 'Los críticos lloraron (de alegría)', 'Una obra con 90 o más de crítica.', function (S) { return mias(S).some(function (o) { return o.crit >= 90; }); }],
    ['quimera', 'Tengo que agradecer a mi mamá', 'Gana un Premio Quimera.', function (S) { return (S.premios || []).some(function (r) { return r.categorias.some(function (c) { return c.ganador.est === 0; }); }); }],
    ['bastardo', 'Lo peor de lo peor (y orgulloso)', 'Gana un Premio Bastardo.', function (S) { return mias(S).some(function (o) { return (o.galas || []).some(function (g) { return g.g === 'bastard'; }); }); }],
    ['secuela', 'Nunca segundas partes…', 'Estrena una secuela.', function (S) { return mias(S).some(function (o) { return o.cam === 'secuela'; }); }],
    ['franq5', 'Universo cinematográfico en expansión', 'Una franquicia con 5 obras.', function (S) { return ART.franquicias.lista().some(function (f) { return f.est === 0 && f.o.length >= 5; }); }],
    ['serie', 'La caja tonta me quiere', 'Emite tu primera serie.', function (S) { return S.obras.some(function (o) { return o.est === 0 && o.tv && o.tv.em; }); }],
    ['canal', 'Dueño del control remoto', 'Abre tu canal de TV.', function (S) { return !!S.canal; }],
    ['stream', 'Netflix y relájate… espera', 'Lanza tu plataforma.', function (S) { return !!S.stream; }],
    ['millon', 'Un millón de amigos', 'Llega a un millón de fans.', function (S) { return (S.fans || 0) >= 1e6; }],
    ['major', 'Ahora soy de los grandes', 'Conviértete en una major.', function (S) { return !!S.majorDesde; }],
    ['quiebra', 'Lo que no te mata te endeuda', 'Sal de una quiebra.', function (S) { return (S.quiebras || 0) >= 1; }],
    ['socio', 'Compartir es vivir', 'Ten un socio.', function (S) { return !!S.socio; }],
    ['filial', 'Coleccionista de estudios', 'Compra un estudio rival.', function (S) { return S.estudios.some(function (e) { return e.filial; }); }],
    ['sede', 'Pasaporte lleno de sellos', 'Abre una sede en otro país.', function (S) { return !!(S.imp && S.imp.sedes.length); }],
    ['invento', 'Eureka en la sala de máquinas', 'Inventa algo antes que el mundo.', function (S) { return !!(S.imp && Object.keys(S.imp.tec).some(function (k) { return S.imp.tec[k].de === 0; })); }],
    ['disco', 'Disco de oro (y no es de chocolate)', 'Un disco de oro.', function (S) { return ART.medios.proyectos('musica').some(function (p) { return p.cert; }); }],
    ['banda', 'Diferencias creativas', 'Una banda tuya se separa.', function (S) { return ART.medios.bandas().some(function (b) { return b.sep; }); }],
    ['juego', 'Presiona Start', 'Lanza tu primer videojuego.', function (S) { return ART.medios.proyectos('juegos').some(function (p) { return p.pub !== undefined; }); }],
    ['teatro', 'Que se rompa una pierna', 'Estrena una obra de teatro.', function (S) { return ART.medios.proyectos('teatro').some(function (p) { return p.pub !== undefined; }); }],
    ['libro', 'Huele a papel nuevo', 'Publica un libro.', function (S) { return ART.medios.proyectos('libros').some(function (p) { return p.pub !== undefined; }); }],
    ['seis', 'Todos los medios, todas las cosas', 'Ten algo en los seis medios.', function (S) { return mias(S).some(function (o) { return !o.tv; }) && S.obras.some(function (o) { return o.est === 0 && o.tv; }) && ['musica', 'juegos', 'teatro', 'libros'].every(function (m) { return ART.medios.proyectos(m).length; }); }],
    ['escandalo', 'Ninguna publicidad es mala', 'Sobrevive a 10 eventos.', function (S) { return (S.bitacora || []).length >= 10; }],
    ['heredero', 'De tal palo, tal estudio', 'Pasa el estudio a tu heredero.', function (S) { return (S.avatar && S.avatar.gen || 1) >= 2; }],
    ['siglo', 'Cien años de cine (y contando)', 'Juega cien años.', function (S) { return S.t >= 5200; }],
    // De la Final
    ['guion30', 'Luz, cámara… ¿y el guion?', 'Estrena una obra con menos de 30 de crítica.', function (S) { return mias(S).some(function (o) { return o.crit < 30; }); }],
    ['maton', 'Pequeño pero matón', 'Una obra con menos de la mitad del presupuesto típico que recaude el triple.', function (S) { return mias(S).some(function (o) { return (o.presM || 1) < 0.5 && O.multiplicador(o) >= 3; }); }],
    ['casa', 'Tiraste la casa por la ventana', 'Produce con el triple del presupuesto típico.', function (S) { return S.obras.some(function (o) { return o.est === 0 && (o.presM || 0) >= 3; }); }],
    ['glorioso', 'Desastre glorioso', 'Crítica bajo 40 y aun así el triple de lo que costó.', function (S) { return mias(S).some(function (o) { return o.crit < 40 && O.multiplicador(o) >= 3; }); }],
    ['pueblo', 'Que hable el pueblo', 'Una obra con 90 o más de público.', function (S) { return mias(S).some(function (o) { return o.pub >= 90; }); }],
    ['malabarista', 'Malabarista', 'Cinco obras en producción a la vez.', function (S) { return O.enProduccion(0).length >= 5; }],
    ['colmillos', 'Noche de colmillos', 'Una obra con el tema Vampiros y 70 de público.', function (S) { return mias(S).some(function (o) { return (o.tem || []).indexOf('Vampiros') >= 0 && o.pub >= 70; }); }],
    ['acelerador', 'Pisa el acelerador', 'Una obra de motor y velocidad que recaude el doble.', function (S) { const X = ART.taxonomia; return mias(S).some(function (o) { return ((o.tem || []).some(function (t) { return X.famTema[t] === 'MV'; }) || (o.sub || []).some(function (x) { return X.famSub[x] === 'MV'; })) && O.multiplicador(o) >= 2; }); }],
    ['letra', 'Fiel a la letra', 'Adapta un clásico de dominio público con 80 de crítica.', function (S) { return mias(S).some(function (o) { return o.mat && /^dp/.test(o.mat) && o.crit >= 80; }); }],
    ['casero', 'Hecho en casa', 'Adapta un material propio.', function (S) { return mias(S).some(function (o) { const m = o.mat && ART.taxonomia.material(o.mat); return m && m.grupo === 'editor'; }); }],
    ['bso', 'Banda sonora inolvidable', 'Lanza el álbum de una banda sonora.', function (S) { return ART.medios.proyectos('musica').some(function (p) { return p.tipo === 'banda' && p.pub !== undefined; }); }],
    ['gira', 'Rock and roll', 'Haz una gira de conciertos.', function (S) { return ART.medios.bandas().some(function (b) { return (b.giras || 0) > 0 || b.gira; }); }],
    ['hattrick', 'Hat trick', 'Tres Premios Quimera en un mismo año.', function (S) { return (S.premios || []).some(function (r) { return r.categorias.filter(function (c) { return c.ganador.est === 0; }).length >= 3; }); }],
    ['exclusivos5', 'Coleccionista de estrellas', 'Cinco talentos con contrato exclusivo.', function (S) { return S.talentos.filter(function (t) { return !t.ret && ART.talentos.exclusivoDe(t) === 0; }).length >= 5; }],
    ['mecenas', 'Mecenas', 'Beca a cinco talentos en la Academia.', function (S) { return S.talentos.filter(function (t) { return t.beca; }).length >= 5; }],
    ['medio', 'Medio siglo de cine', 'Llega a 50 años al mando.', function (S) { return S.t >= 2600; }],
    ['exito2', 'Primer éxito', 'Una obra que recaude el doble de lo que costó.', function (S) { return mias(S).some(function (o) { return O.multiplicador(o) >= 2; }); }],
    ['estrenos25', 'Veinticinco estrenos', 'Estrena 25 obras.', function (S) { return mias(S).length >= 25; }],
    ['clasica', 'Una obra Clásica', 'Que una obra tuya llegue a Clásico.', function (S) { return mias(S).some(function (o) { const p = ART.critica && ART.critica.prestigio ? ART.critica.prestigio(o) : null; return p === 'clasico' || p === 'invaluable'; }); }],
    ['inmortal', 'Inmortal', 'Una obra Invaluable.', function (S) { return mias(S).some(function (o) { return ART.critica && ART.critica.prestigio && ART.critica.prestigio(o) === 'invaluable'; }); }],
    ['milmillones', 'Mil millones', 'Mil millones de ingresos (en dólares de hoy).', function (S) { return mias(S).reduce(function (s, o) { return s + ART.mundo.aHoy(o.bruto || 0, o.anio || N.anio()); }, 0) >= 1e9; }],
    ['saga3', 'Saga de tres', 'Una franquicia con 3 obras.', function (S) { return ART.franquicias.lista().some(function (f) { return f.est === 0 && f.o.length >= 3; }); }],
    ['adaptacion', 'Primera adaptación', 'Adapta un material.', function (S) { return mias(S).some(function (o) { return !!o.mat; }); }],
    ['cines', 'Cadena de cines propia', 'Ten cines propios.', function (S) { return S.estudios[0].terrenos.indexOf('cine') >= 0; }],
    ['deuda0', 'Libre como un pájaro (sin deudas)', 'Paga toda tu deuda después de tener una.', function (S) { return S.banco && S.banco.pagados > 0 && !ART.banco.deuda(); }],
  ];
  function mias(S) { return S.obras.filter(function (o) { return o.est === 0 && o.pub !== undefined && o.et !== 'lista'; }); }
  function st() { const S = N.S; if (!S.metas) S.metas = { modo: 'libre', reto: null, logros: {}, misiones: [], legado: 0, decadas: [], tut: 0, fin: null, ret: 0 }; return S.metas; }
  // Al empezar: modo, reto, tutorial y ajustes del modo personalizado
  function iniciar(op) {
    const S = N.S, m = st();
    m.modo = op.modoJuego || 'libre'; m.reto = op.reto || (m.modo === 'campana' ? 'legado' : null); m.tut = op.tutorial ? 1 : 0;
    if (m.modo === 'personalizado' && op.perso) {
      const p = op.perso;
      m.perso = { dinero: N.limitar(+p.dinero || 1, 0.25, 5), rivales: N.limitar(+p.rivales || 0, -6, 9), eventos: N.limitar(+p.eventos || 1, 0, 3) };
      S.estudios[0].caja = Math.round(S.estudios[0].caja * m.perso.dinero);
      for (let i = 1; i < S.estudios.length; i++) S.estudios[i].calidad += m.perso.rivales;
    }
    if (m.modo === 'campana') nuevaDecada();
  }
  function frecEventos() { const m = st(); return m.perso ? m.perso.eventos : 1; }
  // ---------- Campaña por décadas ----------
  function nuevaDecada() {
    const S = N.S, m = st(), d = Math.floor(N.anio() / 10) * 10, a = N.anio();
    const n0 = mias(S).length;
    const metas = [
      { id: 'estrenos', txt: 'Estrena 8 obras esta década', meta: n0 + 8, pts: 5 },
      { id: 'premio', txt: 'Gana al menos un premio', meta: 1, pts: 8 },
      { id: 'fama', txt: 'Llega a 50 de prestigio', meta: 0.5, pts: 5 },
      { id: 'fans', txt: 'Duplica tus fans', meta: Math.max(20000, (S.fans || 0) * 2), pts: 5 },
    ];
    if (a >= 1950) metas.push({ id: 'serie', txt: 'Emite una serie', meta: 1, pts: 4 });
    if (a >= 1980) metas.push({ id: 'medio', txt: 'Lanza algo en música, juegos, teatro o libros', meta: 1, pts: 4 });
    m.dec = { d: d, metas: metas, p0: (S.galas || []).length, t0: S.t };
  }
  function cumpleMeta(x) {
    const S = N.S, m = st();
    if (x.id === 'estrenos') return mias(S).length >= x.meta;
    if (x.id === 'premio') return (S.galas || []).slice(m.dec.p0).some(function (r) { return r.categorias.some(function (c) { return c.ganador.est === 0; }); }) || ART.medios.premios().some(function (r) { return r.anio >= m.dec.d - 1 && r.cats.some(function (c) { return c.est === 0; }); });
    if (x.id === 'fama') return S.estudios[0].fama >= x.meta;
    if (x.id === 'fans') return (S.fans || 0) >= x.meta;
    if (x.id === 'serie') return S.obras.some(function (o) { return o.est === 0 && o.tv && o.tv.em && o.tv.em.t0 >= m.dec.t0; });
    if (x.id === 'medio') return ART.medios.proyectos().some(function (p) { return p.t0 >= m.dec.t0; });
    return false;
  }
  function cerrarDecada() {
    const m = st();
    if (!m.dec) return;
    const ok = m.dec.metas.filter(cumpleMeta), pts = ok.reduce(function (s, x) { return s + x.pts; }, 0);
    m.legado += pts; m.decadas.push({ d: m.dec.d, ok: ok.length, de: m.dec.metas.length, pts: pts });
    N.emit('noticia', { tipo: 'estudio', texto: 'Cierra la década de ' + m.dec.d + ': cumpliste ' + ok.length + ' de ' + m.dec.metas.length + ' metas (+' + pts + ' de legado).', importante: true });
    nuevaDecada();
  }
  // ---------- Misiones por correo ----------
  const MISIONES = [
    function () { const f = N.elegir(ART.datos.familias); return { tipo: 'familia', fam: f.id, txt: 'Un distribuidor busca una obra de «' + f.nombre + '»: estrénala antes de la fecha.', sem: 52 }; },
    function () { return { tipo: 'fans', meta: Math.round((N.S.fans || 0) * 1.25 + 5000), txt: 'Tu agente de prensa apuesta a que llegas a más fans.', sem: 39 }; },
    function () { return { tipo: 'caja', meta: Math.round(N.S.estudios[0].caja + tip() * 2), txt: 'El banco quiere ver tu caja más gorda.', sem: 52 }; },
    function () { return { tipo: 'critica', meta: 75, txt: 'Una revista te reta: estrena algo con 75 o más de crítica.', sem: 60 }; },
    function () { return N.anio() >= 1950 ? { tipo: 'serie', txt: 'Una cadena quiere ver tu primera serie (o la próxima).', sem: 78 } : null; },
    function () { return { tipo: 'medio', txt: 'Un amigo del gremio te pide lanzar un disco, un juego, una obra o un libro.', sem: 52 }; },
  ];
  function mensual() {
    const S = N.S, m = st();
    if (S.sandbox) return;
    // Misiones: una nueva cada tanto (hasta 3 abiertas)
    m.misiones.forEach(function (x) { if (!x.ok && !x.fallo && revisarMision(x)) { x.ok = 1; ART.negocio.cobrarEn(0, 'eventos', x.premio); m.legado += 1; N.emit('noticia', { tipo: 'estudio', texto: 'Misión cumplida: «' + x.txt + '» (+' + Math.round(x.premio) + ').', importante: true }); } else if (!x.ok && S.t > x.hasta) x.fallo = 1; });
    m.misiones = m.misiones.filter(function (x) { return S.t - x.hasta < 26; });
    if (m.misiones.filter(function (x) { return !x.ok && !x.fallo; }).length < 3 && N.probabilidad(0.12)) {
      const x = N.elegir(MISIONES)();
      if (x) { x.id = N.sigId(); x.t0 = S.t; x.hasta = S.t + x.sem; x.premio = Math.round(tip() * 0.3); m.misiones.push(x); N.emit('noticia', { tipo: 'estudio', texto: 'Correo nuevo: ' + x.txt }); }
    }
    revisarLogros();
  }
  function revisarMision(x) {
    const S = N.S;
    if (x.tipo === 'familia') return S.obras.some(function (o) { return o.est === 0 && o.fam === x.fam && o.fe >= x.t0 && o.pub !== undefined; });
    if (x.tipo === 'fans') return (S.fans || 0) >= x.meta;
    if (x.tipo === 'caja') return S.estudios[0].caja >= x.meta;
    if (x.tipo === 'critica') return S.obras.some(function (o) { return o.est === 0 && o.fe >= x.t0 && o.crit >= x.meta; });
    if (x.tipo === 'serie') return S.obras.some(function (o) { return o.est === 0 && o.tv && o.tv.em && o.tv.em.t0 >= x.t0; });
    if (x.tipo === 'medio') return ART.medios.proyectos().some(function (p) { return p.t0 >= x.t0 && p.pub !== undefined; });
    return false;
  }
  function revisarLogros() {
    const S = N.S, m = st();
    if (S.sandbox) return;
    LOGROS.forEach(function (l) { if (!m.logros[l[0]] && l[3](S)) { m.logros[l[0]] = S.t; N.emit('noticia', { tipo: 'estudio', texto: 'Logro: «' + l[1] + '».', importante: true }); } });
  }
  // ---------- Retos de final de partida ----------
  function progresoReto(id) {
    const S = N.S, m = st(), b = ART.banco.balance();
    if (id === 'ranking') return Math.min(1, (m.ret || 0) / 3);
    if (id === 'legado') return Math.min(1, m.legado / 150);
    if (id === 'imperio') return Math.min(1, b.patrimonio / (tip() * 300)) * (ART.imperio.filiales().length >= 2 ? 1 : 0.9);
    if (id === 'dinastia') return Math.min(1, ((S.avatar && S.avatar.gen) || 1) / 3);
    return 0;
  }
  function anual() {
    const S = N.S, m = st();
    const h = S.fin.hist[S.fin.hist.length - 1];
    m.ret = h && h.puesto === 1 ? (m.ret || 0) + 1 : 0;
    if (m.modo === 'campana' && N.anio() % 10 === 0) cerrarDecada();
    if (m.reto && !m.fin && !S.sandbox && progresoReto(m.reto) >= 1) {
      m.fin = { t: S.t, reto: m.reto };
      N.emit('noticia', { tipo: 'estudio', texto: '¡Cumpliste el reto «' + RETOS.filter(function (r) { return r.id === m.reto; })[0].nombre + '»! Ganaste la partida.', importante: true });
      N.emit('victoria', m.fin);
    }
  }
  // Créditos finales y resumen de la carrera
  function resumen() {
    const S = N.S, m = st(), ms = mias(S);
    const mejor = ms.slice().sort(function (a, b) { return O.multiplicador(b) - O.multiplicador(a); })[0], critica = ms.slice().sort(function (a, b) { return (b.crit || 0) - (a.crit || 0); })[0];
    return { estudio: S.estudios[0].nombre, avatar: S.avatar ? S.avatar.nom : '', desde: S.y0, hasta: N.anio(), obras: ms.length, mejor: mejor ? mejor.tit : '', critica: critica ? critica.tit : '',
      premios: (S.galas || []).reduce(function (s, r) { return s + r.categorias.filter(function (c) { return c.ganador.est === 0; }).length; }, 0), legado: m.legado, logros: Object.keys(m.logros).length, patrimonio: ART.banco.balance().patrimonio,
      fans: S.fans || 0, reto: m.reto, modo: m.modo, dificultad: S.dificultad };
  }
  // ---------- Tutorial ----------
  const PASOS = [
    { sec: ['estudio', 'obras'], txt: 'Bienvenida: este es tu estudio. Ve a Obras y crea tu primera obra.' },
    { sec: ['estudio', 'obras', 'talento'], txt: 'Tu obra está en marcha. Ahora puedes buscar talentos en Talento.' },
    { sec: ['estudio', 'obras', 'talento', 'mundo'], txt: 'Cuando quede lista, prográmala y mira la cartelera en Mundo.' },
    { sec: ['estudio', 'obras', 'talento', 'mundo', 'negocio'], txt: 'Ya estrenaste: en Negocio están tus cuentas, construcciones y el banco. ¡Tutorial completo!' },
  ];
  function seccionesVisibles() { const m = N.S ? st() : null; if (!m || !m.tut) return null; return PASOS[Math.min(m.tut, PASOS.length) - 1].sec; }
  function pasoTutorial() { const m = st(); return m.tut ? PASOS[Math.min(m.tut, PASOS.length) - 1] : null; }
  function semana() {
    const S = N.S, m = st();
    if (m.tut && m.tut < 4) {
      const n = m.tut === 1 ? S.obras.some(function (o) { return o.est === 0; }) : m.tut === 2 ? S.obras.some(function (o) { return o.est === 0 && ['lista', 'cartelera', 'terminada'].indexOf(o.et) >= 0; }) : S.obras.some(function (o) { return o.est === 0 && o.pub !== undefined && o.et !== 'lista'; });
      if (n) { m.tut++; N.emit('noticia', { tipo: 'estudio', texto: 'Tutorial: ' + PASOS[m.tut - 1].txt, importante: true }); if (m.tut >= 4) m.tut = 0; }
    }
  }
  function saltarTutorial() { st().tut = 0; }
  // ---------- Consejos del momento ----------
  function consejos() {
    const S = N.S, out = [], est = S.estudios[0], NG = ART.negocio;
    if (est.caja < 0) out.push('Tu caja está en rojo: pide un préstamo en Negocio › Banco o espera los ingresos de las ventanas.');
    if (O.enProduccion(0).length < NG.capacidad(0) && NG.cajaLibre(0) > tip()) out.push('Tienes platós libres y caja: empieza otra obra.');
    if (O.delEstudio(0, ['lista']).some(function (o) { return !o.prog; })) out.push('Hay obras listas sin fecha de estreno.');
    const fams = ART.datos.familias.slice().sort(function (a, b) { return (S.mundo.tendencias[b.id] || 0) - (S.mundo.tendencias[a.id] || 0); });
    if ((S.mundo.tendencias[fams[0].id] || 0) > 0.4) out.push('El público pide ' + fams[0].nombre.toLowerCase() + ': es buen momento para ese género.');
    if (ART.banco.junta() < 30) out.push('La paciencia de la junta está baja: evita gastos grandes un tiempo.');
    if (NG.cajaLibre(0) > tip() * 20) out.push('Te sobra dinero: mira Negocio › Imperio (filiales, sedes, investigación) o los medios nuevos en Obras.');
    if (S.evento) out.push('Hay una decisión esperándote.');
    st().misiones.filter(function (x) { return !x.ok && !x.fallo && x.hasta - S.t < 8; }).forEach(function (x) { out.push('Vence pronto la misión: ' + x.txt); });
    return out.slice(0, 3);
  }
  // ---------- Editor Sandbox y paquetes ----------
  function activarSandbox() { N.S.sandbox = 1; }
  function editar(tipo, id, campo, valor) {
    const S = N.S;
    if (!S.sandbox) return 'Activa el Editor Sandbox primero (desactiva logros y retos).';
    let x = null;
    if (tipo === 'talento') x = ART.talentos.porId(+id);
    else if (tipo === 'estudio') x = S.estudios[+id];
    else if (tipo === 'obra') x = O.porId(+id);
    else if (tipo === 'franquicia') x = ART.franquicias.porId(+id);
    else if (tipo === 'precio') { S.edit = S.edit || {}; S.edit.precio = N.limitar(+valor || 1, 0.2, 5); return ''; }
    if (!x) return 'No existe.';
    const num = ['hab', 'pot', 'fama', 'caja', 'tam', 'calidad', 'pub', 'crit'];
    const permitidos = { talento: ['nom', 'hab', 'pot', 'fama'], estudio: ['nombre', 'caja', 'tam', 'calidad', 'fama'], obra: ['tit', 'pub', 'crit'], franquicia: ['nom', 'gen'] }[tipo];
    if (permitidos.indexOf(campo) < 0) return 'Ese campo no se edita.';
    if (num.indexOf(campo) >= 0) { let v = +valor; if (!isFinite(v)) return 'Número inválido.'; if (campo === 'fama') v = N.limitar(v, 0, 1); else if (campo !== 'caja') v = N.limitar(v, campo === 'tam' ? 0.1 : 1, campo === 'tam' ? 5 : 99); x[campo] = v; }
    else x[campo] = String(valor).slice(0, 40);
    return '';
  }
  function personaje(frId, k, nom, pop) { const f = ART.franquicias.porId(+frId); if (!N.S.sandbox || !f) return 'No se puede.'; const p = f.pers.filter(function (x) { return x.k === +k; })[0]; if (!p) return 'No existe.'; if (nom) p.n = String(nom).slice(0, 40); if (pop !== undefined && pop !== '') p.pop = N.limitar(+pop || 0, 1, 99); return ''; }
  // Franquicias u obras propias (reales o inventadas por el jugador) que se adaptan como material, igual que el
  // dominio público; viven en la partida y en los paquetes, nunca en el juego base (Registro: «lo real solo lo agrega el jugador»)
  function agregarMaterial(m) {
    const S = N.S;
    if (!S.sandbox) return 'Activa el Editor Sandbox primero.';
    if (m && (m.tem || m.sin || m.tipo || m.lic !== undefined)) return guardarMaterial({ tit: m.tit, autor: m.autor, anio: m.anio, tipo: m.tipo, gen: m.gen, tem: m.tem, pjs: m.pers || m.pjs, sin: m.sin, lic: m.lic, fama: m.fama });
    const tit = String(m.tit || '').trim().slice(0, 60);
    if (!tit) return 'Ponle un título.';
    S.edit = S.edit || {};
    const lista = S.edit.mat = S.edit.mat || [];
    if (lista.length >= 100) return 'Ya tienes 100 materiales propios.';
    if (lista.some(function (x) { return x.tit === tit; })) return 'Ya existe un material con ese título.';
    const gen = (Array.isArray(m.gen) ? m.gen : String(m.gen || '').split(',')).map(function (g) { return String(g).trim(); })
      .filter(function (g) { return D.familiaDe[g]; }).slice(0, 3);
    S.edit.matSig = (S.edit.matSig || 0) + 1;
    lista.push({ id: 'ed' + S.edit.matSig, tit: tit, autor: 'Material propio', anio: String(N.anio()), libre: 0, gen: gen.length ? gen : ['Drama'], fama: 0.5, grupo: 'editor',
      pers: (Array.isArray(m.pers) ? m.pers : []).filter(function (x) { return typeof x === 'string' && x.trim(); }).slice(0, 10).map(function (x) { return x.slice(0, 40); }) });
    return '';
  }
  // ---------- Material propio o con licencia (desde Obras › Crear › Usar material) ----------
  // Lo tuyo empieza poco conocido (fama hasta 40) y es gratis; una licencia de otra empresa se paga una vez, más cara
  // cuanto más famosa. Con el Editor Sandbox no se paga. Guarda título, autor, año, tipo, géneros, temas, personajes y
  // sinopsis. Las obras de dominio público no cambian, pero puedes retocar sus temas, personajes y sinopsis para tus
  // adaptaciones (quedan en S.edit.pdo).
  const TIPOS_MATERIAL = ['Novela', 'Cuento', 'Cómic', 'Manga', 'Obra de teatro', 'Película', 'Serie', 'Videojuego', 'Canción', 'Leyenda', 'Mitología', 'Poema', 'Personaje', 'Universo de personajes'];
  function precioLicencia(fama) { return Math.round(ART.economia.presupuestoTipico(N.anio()) * 0.1 * Math.pow(0.5 + N.limitar(+fama || 0, 10, 100) / 60, 2)); }
  // «Ana:F» o «Ana» por línea (o separados por comas): nombre y sexo de cada personaje
  function leerPersonajes(txt) {
    const l = Array.isArray(txt) ? txt : String(txt || '').split(/\n|,/);
    return l.map(function (x) {
      if (x && typeof x === 'object') return { n: String(x.n || '').trim().slice(0, 40), s: x.s === 'F' ? 'F' : 'M' };
      const p = String(x).split(':');
      return { n: p[0].trim().slice(0, 40), s: (p[1] || '').trim().toUpperCase() === 'F' ? 'F' : 'M' };
    }).filter(function (p) { return p.n; }).slice(0, 12);
  }
  function guardarMaterial(d, id) {
    const S = N.S, X = ART.taxonomia;
    S.edit = S.edit || {};
    const lista = S.edit.mat = S.edit.mat || [];
    const tem = (d.tem || []).filter(function (x) { return X.famTema[x]; }).slice(0, 9);
    const pjs = leerPersonajes(d.pjs), sin = String(d.sin || '').trim().slice(0, 400);
    // Retoque de una obra de dominio público
    if (id && X.dominio.some(function (x) { return x.id === id; })) {
      S.edit.pdo = S.edit.pdo || {};
      S.edit.pdo[id] = { tem: tem, pjs: pjs, sin: sin };
      return '';
    }
    const tit = String(d.tit || '').trim().slice(0, 60);
    if (!tit) return 'Ponle un título.';
    const gen = (d.gen || []).filter(function (g) { return D.familiaDe[g]; }).slice(0, 3);
    const datos = { tit: tit, autor: String(d.autor || '').trim().slice(0, 50) || (d.lic ? 'Otra empresa' : N.S.avatar ? N.S.avatar.nom : 'Material propio'), anio: String(Math.round(+d.anio || N.anio())),
      gen: gen.length ? gen : ['Drama'], tipo: TIPOS_MATERIAL.indexOf(d.tipo) >= 0 ? d.tipo : 'Novela', tem: tem, pjs: pjs, sin: sin };
    if (id) {
      const m = lista.filter(function (x) { return x.id === id; })[0];
      if (!m) return 'Ese material ya no existe.';
      if (lista.some(function (x) { return x.id !== id && x.tit === tit; })) return 'Ya existe un material con ese título.';
      Object.assign(m, datos);
      return '';
    }
    if (lista.length >= 100) return 'Ya tienes 100 materiales propios.';
    if (lista.some(function (x) { return x.tit === tit; })) return 'Ya existe un material con ese título.';
    const fama = d.lic ? N.limitar(+d.fama || 50, 10, 100) : N.limitar(+d.fama || 30, 10, 40);
    const pr = d.lic && !S.sandbox ? precioLicencia(fama) : 0;
    if (pr && ART.negocio.cajaLibre(0) < pr) return 'Tu caja libre no alcanza para los derechos (' + ART.ui.dinero(pr) + ').';
    if (pr) ART.negocio.pagar(0, 'derechos', pr);
    S.edit.matSig = (S.edit.matSig || 0) + 1;
    lista.push(Object.assign({ id: 'ed' + S.edit.matSig, libre: 0, fama: N.redondear(fama / 100, 2), grupo: 'editor', lic: d.lic ? 1 : 0, pr: pr }, datos));
    N.emit('noticia', { tipo: 'estudio', texto: d.lic ? 'Compras la licencia de «' + tit + '» a ' + datos.autor + '.' : 'Registras tu material «' + tit + '».' });
    return '';
  }
  function borrarMaterial(id) {
    const S = N.S, lista = (S.edit && S.edit.mat) || [];
    const i = lista.map(function (x) { return x.id; }).indexOf(id);
    if (i < 0) return 'Ese material ya no existe.';
    if (lista[i].lic) return 'Una licencia comprada no se borra.';
    lista.splice(i, 1);
    return '';
  }
  function crearTalento(op) { if (!N.S.sandbox) return 'Activa el Editor Sandbox primero.'; const t = ART.talentos.crearPropio(op); t.sb = 1; return ''; }
  function exportarPaquete() {
    const S = N.S;
    return JSON.stringify({ tipo: 'paquete-industry-art', v: 1, talentos: S.talentos.filter(function (t) { return t.sb || t.propio; }).map(function (t) { return { nom: t.nom, of: t.of, sx: t.sx, edad: N.anio() - t.nac, pot: t.pot, hab: t.hab }; }),
      estudios: S.estudios.map(function (e) { return { id: e.id, nombre: e.nombre }; }), franquicias: ART.franquicias.lista().map(function (f) { return { nom: f.nom, gen: f.gen, pers: f.pers.map(function (p) { return p.n; }) }; }),
      materiales: (S.edit && S.edit.mat || []).map(function (m) { return { tit: m.tit, gen: m.gen, pers: m.pers }; }), precio: S.edit ? S.edit.precio : 1 });
  }
  function importarPaquete(txt) {
    const S = N.S;
    let p;
    // Un paquete puede venir de otra persona: tope de tamaño, limpieza de textos y claves, y datos validados
    if (typeof txt !== 'string' || txt.length > 2e6) return 'El paquete es demasiado grande.';
    try { p = ART.guardado.limpiar(JSON.parse(txt)); } catch (e) { return 'El paquete no es válido.'; }
    if (!p || p.tipo !== 'paquete-industry-art') return 'No es un paquete de INDUSTRY ART.';
    activarSandbox();
    const oficios = D.oficios.map(function (o) { return o.id; });
    (Array.isArray(p.talentos) ? p.talentos : []).slice(0, 200).forEach(function (t) {
      if (!t || oficios.indexOf(t.of) < 0) return;
      const n = ART.talentos.crearPropio({ of: t.of, sx: t.sx === 'F' ? 'F' : 'M', edad: N.limitar(+t.edad || 25, 8, 80), pot: N.limitar(+t.pot || 62, 30, 80), nom: typeof t.nom === 'string' ? t.nom : '' });
      n.sb = 1;
      if (t.hab) n.hab = N.limitar(+t.hab || 50, 1, 99);
    });
    (Array.isArray(p.estudios) ? p.estudios : []).forEach(function (e) { if (e && S.estudios[+e.id] && typeof e.nombre === 'string' && e.nombre.trim()) S.estudios[+e.id].nombre = e.nombre.slice(0, 40); });
    // Franquicias del paquete: llegan como material propio para adaptar (Obras › Crear › Usar material)
    (Array.isArray(p.franquicias) ? p.franquicias : []).slice(0, 100).forEach(function (f) { if (f && typeof f.nom === 'string') agregarMaterial({ tit: f.nom, gen: f.gen, pers: f.pers }); });
    (Array.isArray(p.materiales) ? p.materiales : []).slice(0, 100).forEach(function (m) { if (m && typeof m.tit === 'string') agregarMaterial(m); });
    if (p.precio) { S.edit = S.edit || {}; S.edit.precio = N.limitar(+p.precio || 1, 0.2, 5); }
    return '';
  }
  return { TIPOS_MATERIAL: TIPOS_MATERIAL, precioLicencia: precioLicencia, guardarMaterial: guardarMaterial, borrarMaterial: borrarMaterial, leerPersonajes: leerPersonajes, MODOS: MODOS, HUMOR: HUMOR, RETOS: RETOS, LOGROS: LOGROS, PASOS: PASOS, estado: st, iniciar: iniciar, frecEventos: frecEventos, cumpleMeta: cumpleMeta, mensual: mensual,
    revisarLogros: revisarLogros, progresoReto: progresoReto, anual: anual, resumen: resumen, seccionesVisibles: seccionesVisibles, pasoTutorial: pasoTutorial, semana: semana,
    saltarTutorial: saltarTutorial, consejos: consejos, activarSandbox: activarSandbox, editar: editar, personaje: personaje, crearTalento: crearTalento,
    exportarPaquete: exportarPaquete, importarPaquete: importarPaquete, agregarMaterial: agregarMaterial };
})();
