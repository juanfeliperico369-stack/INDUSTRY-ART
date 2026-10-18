/* ==== módulo: eventos ==== */
// V24 · 80 eventos con decisiones (escándalos, quejas del elenco, propuestas de talentos y productores, fans que
// piden secuelas, huelgas, negocio, prensa, tecnología, momentos históricos y vida del estudio) y la bitácora del
// estudio con cada mini decisión, al estilo de una vida que se escribe sola.
IA.eventos = (function () {
  'use strict';
  const N = IA.n, O = IA.obras, T = IA.talentos;
  const tip = function () { return IA.economia.presupuestoTipico(N.anio()); };
  // [id, requisito, desde, hasta, texto, [[opción, efectos], ...]]
  // requisito: obra (tuya en producción), estrella (talento de una obra tuya en marcha), exito (obra tuya querida),
  // franq (franquicia viva tuya), rival, '' (nada). Efectos: caja (× presupuesto típico), fama, fans (proporción),
  // moral, pub, crit, sem (semanas de demora), hype, apr (aprobación del talento), idea (te deja un guion),
  // pedida (fans que esperan secuela), junta, credito, socio (parte), riesgo [probabilidad, efectos].
  const EV = [
    ['esc_fiesta', 'estrella', 0, 9999, '{t} aparece en todos los diarios tras una fiesta escandalosa durante el rodaje de «{o}».', [['Defenderlo en público', { fama: -0.01, apr: 5 }], ['Pedirle disculpas públicas', { hype: -1 }], ['Despedirlo', { apr: -20, sem: 2, moral: -3 }]]],
    ['esc_romance', 'estrella', 0, 9999, '{t} tiene un romance secreto con alguien del equipo de «{o}» y la prensa lo sabe.', [['Aprovechar la publicidad', { hype: 3, moral: -2 }], ['Pedir discreción', {}], ['Separarlos en el rodaje', { sem: 1, moral: -1 }]]],
    ['esc_declara', 'estrella', 0, 9999, '{t} dice en una entrevista que «{o}» es «un trabajo más».', [['Multa por contrato', { caja: 0.01, apr: -10 }], ['Ignorarlo', { hype: -2 }], ['Otra entrevista para corregir', { caja: -0.01, hype: 1 }]]],
    ['esc_accidente', 'obra', 0, 9999, 'Un accidente leve en el set de «{o}» llega a los periódicos.', [['Indemnizar con generosidad', { caja: -0.03, moral: 3, fama: 0.005 }], ['Lo mínimo legal', { moral: -3 }], ['Detener todo para revisar', { sem: 2, moral: 2 }]]],
    ['esc_plagio', 'obra', 0, 9999, 'Un escritor acusa a «{o}» de plagio.', [['Pagar un acuerdo', { caja: -0.04 }], ['Ir a juicio', { riesgo: [0.4, { caja: -0.1, fama: -0.02 }] }], ['Cambiar la historia', { sem: 2, crit: -1 }]]],
    ['esc_filtra', 'obra', 0, 9999, 'Se filtra el guion de «{o}».', [['Reescribir el final', { sem: 1, crit: 1 }], ['Aprovechar el ruido', { hype: 2, pub: -1 }], ['Demandar al que lo filtró', { caja: -0.01 }]]],
    ['esc_impuestos', 'estrella', 0, 9999, '{t} enfrenta una investigación por impuestos.', [['Apoyarlo con abogados', { caja: -0.02, apr: 10 }], ['Tomar distancia', { apr: -5 }]]],
    ['esc_viral', 'estrella', 2006, 9999, 'Una publicación vieja de {t} se vuelve viral y piden su salida de «{o}».', [['Mantenerlo', { fama: -0.01, fans: -0.02 }], ['Pedirle que se disculpe', { hype: -1 }], ['Reemplazarlo', { sem: 2, apr: -20 }]]],
    ['esc_codigo', 'obra', 1934, 1968, 'La oficina del Código objeta escenas de «{o}».', [['Cortar las escenas', { crit: -2 }], ['Negociar', { caja: -0.01, riesgo: [0.5, { crit: -2 }] }], ['Estrenar sin sello', { pub: 2, fama: -0.02 }]]],
    ['esc_salud', 'estrella', 0, 9999, '{t} llega en malas condiciones al set de «{o}».', [['Pagarle un tratamiento', { caja: -0.02, sem: 1, apr: 8 }], ['Advertencia formal', { moral: -1 }], ['Despedirlo', { apr: -25, sem: 2 }]]],
    ['q_camerino', 'estrella', 0, 9999, '{t} exige un camerino más grande en «{o}».', [['Dárselo', { caja: -0.005, apr: 5 }], ['Negarse', { apr: -6 }]]],
    ['q_guion', 'estrella', 0, 9999, '{t} quiere reescribir sus escenas de «{o}».', [['Dejarlo', { crit: -1, pub: 1, apr: 6 }], ['Que lo hable con el guionista', { sem: 1 }], ['Negarse', { apr: -8 }]]],
    ['q_horas', 'obra', 0, 9999, 'El equipo de «{o}» se queja de jornadas de 16 horas.', [['Contratar un segundo turno', { caja: -0.02, moral: 4 }], ['Pagar horas extra', { caja: -0.01, moral: 2 }], ['Seguir así', { moral: -5 }]]],
    ['q_salario', 'estrella', 0, 9999, '{t} pide un aumento a mitad del rodaje de «{o}».', [['Pagar', { caja: -0.015, apr: 5 }], ['Ofrecer un porcentaje', { apr: 2 }], ['Negarse', { apr: -10, moral: -1 }]]],
    ['q_direccion', 'obra', 0, 9999, 'El reparto de «{o}» choca con la dirección.', [['Apoyar a la dirección', { moral: -2, crit: 1 }], ['Apoyar al reparto', { moral: 1, crit: -1 }], ['Contratar un mediador', { caja: -0.005 }]]],
    ['q_comida', 'obra', 0, 9999, 'El equipo de «{o}» se queja de la comida del set.', [['Catering nuevo', { caja: -0.003, moral: 2 }], ['No hacer nada', { moral: -1 }]]],
    ['q_doble', 'estrella', 0, 9999, '{t} no quiere usar doble en una escena peligrosa de «{o}».', [['Dejarlo', { pub: 1, riesgo: [0.25, { sem: 3, apr: -5 }] }], ['Obligar al doble', { apr: -4 }]]],
    ['q_creditos', 'estrella', 0, 9999, '{t} pide aparecer primero en los créditos de «{o}».', [['Aceptar', { apr: 6, moral: -1 }], ['Orden alfabético', {}]]],
    ['q_perro', 'estrella', 0, 9999, '{t} quiere llevar a su perro al set de «{o}».', [['Claro', { apr: 3 }], ['No', { apr: -2 }]]],
    ['q_promo', 'estrella', 0, 9999, '{t} no quiere hacer promoción de «{o}».', [['Pagarle extra', { caja: -0.01, hype: 1 }], ['Exigirlo por contrato', { apr: -5 }], ['Dejarlo', { hype: -2 }]]],
    ['p_talento', 'estrella', 0, 9999, '{t} te trae una idea propia para una película.', [['Comprar la idea', { caja: -0.01, idea: 1, apr: 5 }], ['Decir que no', { apr: -3 }]]],
    ['p_productor', '', 0, 9999, 'Un productor independiente te ofrece un proyecto listo para filmar.', [['Comprarlo', { caja: -0.02, idea: 1 }], ['Pasar', {}]]],
    ['p_novela', '', 0, 9999, 'Una novelista joven ofrece su libro antes de publicarlo.', [['Comprar los derechos', { caja: -0.01, idea: 1 }], ['No', {}]]],
    ['p_clasico', '', 0, 9999, 'Un director quiere hacer una versión moderna de un clásico.', [['Dar luz verde a la idea', { idea: 1 }], ['No', {}]]],
    ['p_documental', '', 1922, 9999, 'Un periodista propone un documental sobre la industria.', [['Financiarlo', { caja: -0.005, fama: 0.005 }], ['No', {}]]],
    ['p_regreso', '', 0, 9999, 'Una vieja estrella retirada quiere volver con tu estudio.', [['Darle un papel', { fans: 0.01, idea: 1 }], ['No', {}]]],
    ['p_extranjero', '', 0, 9999, 'Un estudio extranjero propone una coproducción pequeña.', [['Aceptar', { caja: 0.02, fama: 0.005 }], ['No', {}]]],
    ['p_musical', '', 1927, 9999, 'Un compositor propone un musical original.', [['Comprarlo', { caja: -0.01, idea: 1 }], ['No', {}]]],
    ['f_secuela', 'exito', 0, 9999, 'Los fans de «{o}» llenan tu buzón: quieren una secuela.', [['Anunciarla', { fans: 0.03, pedida: 1 }], ['Decir que no habrá', { fans: -0.02 }], ['Guardar silencio', {}]]],
    ['f_club', 'exito', 0, 9999, 'Nace un club de fans de «{o}».', [['Apoyarlo', { caja: -0.003, fans: 0.02 }], ['Ignorarlo', {}]]],
    ['f_teorias', 'franq', 0, 9999, 'Los fans de «{f}» discuten teorías sobre lo que viene.', [['Seguirles el juego', { fans: 0.02 }], ['Desmentir', { fans: -0.01 }]]],
    ['f_final', 'exito', 0, 9999, 'Los fans odian el final de «{o}».', [['Prometer otro final en video', { caja: -0.01, fans: 0.01 }], ['Defender el final', { fama: 0.003, fans: -0.01 }]]],
    ['f_disfraces', 'franq', 1960, 9999, 'Una convención entera se viste como los personajes de «{f}».', [['Mandar regalos', { caja: -0.003, fans: 0.015 }], ['Nada', {}]]],
    ['f_firmas', 'franq', 0, 9999, 'Miles firman para que vuelva un personaje de «{f}».', [['Prometerlo', { pedida: 1, fans: 0.02 }], ['No', { fans: -0.01 }]]],
    ['f_aniv', 'exito', 0, 9999, 'Se cumplen años del estreno de «{o}».', [['Función especial', { caja: 0.01, fans: 0.01 }], ['Edición de coleccionista', { caja: 0.015 }], ['Nada', {}]]],
    ['h_tecnicos', 'obra', 1910, 9999, 'Los técnicos amenazan con huelga.', [['Subir salarios', { caja: -0.03, moral: 3 }], ['Negociar', { caja: -0.01, sem: 1 }], ['Resistir', { riesgo: [0.5, { sem: 4, moral: -5 }] }]]],
    ['h_guion', '', 1933, 9999, 'El sindicato de guionistas pide mejores pagos.', [['Firmar el acuerdo', { caja: -0.02 }], ['Esperar', { riesgo: [0.4, { junta: -10 }] }]]],
    ['h_extras', 'obra', 0, 9999, 'Los extras de «{o}» se niegan a trabajar.', [['Pagarles', { caja: -0.005 }], ['Reemplazarlos', { sem: 1, crit: -1 }]]],
    ['h_residuales', '', 2007, 9999, 'El sindicato de actores pide su parte del streaming.', [['Aceptar', { caja: -0.02, fama: 0.005 }], ['Negarse', { riesgo: [0.5, { fama: -0.01, junta: -8 }] }]]],
    ['h_ia', '', 2023, 9999, 'El sindicato pide límites al uso de IA en tus obras.', [['Firmar los límites', { fama: 0.01 }], ['Negarse', { fama: -0.015, caja: 0.01 }]]],
    ['h_seguridad', 'obra', 0, 9999, 'Exigen más seguridad en los sets.', [['Invertir', { caja: -0.02, moral: 3 }], ['Lo mínimo', { riesgo: [0.2, { sem: 2, fama: -0.01 }] }]]],
    ['n_banco', '', 0, 9999, 'Tu banco ofrece mejores condiciones a cambio de exclusividad.', [['Aceptar', { credito: 1 }], ['No', {}]]],
    ['n_inversor', '', 0, 9999, 'Un inversor quiere comprar una parte pequeña del estudio.', [['Venderle el 10 %', { socio: 0.1 }], ['No', {}]]],
    ['n_incendio', '', 0, 9999, 'Un incendio en el almacén destruye material.', [['Reconstruir con el seguro', { caja: -0.03 }], ['Reconstruir barato', { caja: -0.01, moral: -2 }]]],
    ['n_costos', '', 0, 9999, 'Suben los costos de material y equipos.', [['Comprar por adelantado', { caja: -0.02 }], ['Absorberlo', { junta: -3 }]]],
    ['n_auditoria', '', 0, 9999, 'Una auditoría revisa tus cuentas.', [['Colaborar', { caja: -0.005, junta: 5 }], ['Pelear', { riesgo: [0.3, { caja: -0.05 }] }]]],
    ['n_robo', 'rival', 0, 9999, '{r} quiere llevarse a {t}, tu mejor talento.', [['Igualar la oferta', { caja: -0.02, apr: 8 }], ['Dejarlo ir', { apr: -5 }]]],
    ['n_copia', 'rival', 0, 9999, '{r} anuncia una obra sospechosamente parecida a «{o}».', [['Adelantar el trabajo', { sem: -1, crit: -1 }], ['Demandar', { caja: -0.01, riesgo: [0.5, { caja: 0.03 }] }], ['Ignorarlo', { hype: -1 }]]],
    ['n_marca', 'obra', 1930, 9999, 'Una marca quiere aparecer en «{o}».', [['Aceptar', { caja: 0.02, crit: -1 }], ['No', {}]]],
    ['n_cines', '', 1905, 9999, 'Los dueños de cines piden más porcentaje.', [['Ceder', { caja: -0.02 }], ['Negarse', { fama: -0.005 }]]],
    ['n_incentivo', '', 0, 9999, 'El gobierno ofrece incentivos por filmar en el país.', [['Aprovecharlos', { caja: 0.02 }], ['No', {}]]],
    ['m_entrevista', 'obra', 0, 9999, 'La revista de la industria quiere una entrevista sobre «{o}».', [['Aceptar', { hype: 2 }], ['No', {}]]],
    ['m_critico', 'obra', 0, 9999, 'Un crítico famoso quiere visitar el set de «{o}».', [['Recibirlo', { crit: 1, riesgo: [0.3, { hype: -2 }] }], ['No dejarlo pasar', {}]]],
    ['m_tv', '', 1950, 9999, 'Un programa de TV quiere mostrar tu estudio.', [['Abrir las puertas', { fans: 0.02, fama: 0.003 }], ['No', {}]]],
    ['m_rumor', '', 0, 9999, 'Circula el rumor de que tu estudio está en crisis.', [['Desmentirlo con cifras', { junta: 3 }], ['Ignorarlo', { fama: -0.005 }]]],
    ['m_gala', '', 0, 9999, 'Te invitan a dar un discurso en una gala.', [['Ir', { fama: 0.005 }], ['No ir', {}]]],
    ['m_libro', '', 0, 9999, 'Un historiador quiere escribir la historia de tu estudio.', [['Abrirle el archivo', { fama: 0.01 }], ['No', {}]]],
    ['m_podcast', 'obra', 2005, 9999, 'Un pódcast popular quiere hablar de «{o}».', [['Ir', { hype: 1, fans: 0.01 }], ['No', {}]]],
    ['m_trailer', 'obra', 1915, 9999, 'El adelanto de «{o}» se filtra antes de tiempo.', [['Lanzarlo ya', { hype: 1 }], ['Retirarlo', { hype: -1 }]]],
    ['t_camara', 'obra', 0, 9999, 'Un inventor ofrece una cámara experimental para «{o}».', [['Probarla', { caja: -0.01, riesgo: [0.5, { crit: 2 }] }], ['No', {}]]],
    ['t_formato', 'obra', 1950, 9999, 'Aparece un formato de imagen nuevo.', [['Adoptarlo en «{o}»', { caja: -0.02, pub: 1 }], ['Esperar', {}]]],
    ['t_ia', 'obra', 2022, 9999, 'Tu equipo propone usar IA para abaratar «{o}».', [['Usarla', { caja: 0.02, fama: -0.01 }], ['No', { fama: 0.003 }]]],
    ['t_hackeo', '', 2000, 9999, 'Hackean los servidores del estudio.', [['Pagar expertos', { caja: -0.02 }], ['Restaurar copias', { fama: -0.005 }]]],
    ['t_restaurar', '', 1950, 9999, 'Un laboratorio ofrece restaurar tus obras viejas.', [['Restaurarlas', { caja: -0.01, fans: 0.01 }], ['No', {}]]],
    ['w_propaganda', '', 1939, 1945, 'El gobierno pide películas para levantar la moral.', [['Colaborar', { fama: 0.01, caja: -0.01 }], ['Negarse', { fama: -0.005 }]]],
    ['w_racion', 'obra', 1940, 1946, 'Racionan la película virgen.', [['Comprar en el mercado negro', { caja: -0.02 }], ['Filmar con menos', { sem: 2 }]]],
    ['w_depresion', '', 1930, 1934, 'La gente no tiene para entradas.', [['Funciones dobles más baratas', { caja: -0.01, fans: 0.02 }], ['Mantener los precios', {}]]],
    ['w_tele', '', 1950, 1962, 'La televisión vacía las salas.', [['Apostar por la pantalla ancha', { caja: -0.02, fama: 0.005 }], ['Vender películas viejas a la TV', { caja: 0.03, fama: -0.005 }]]],
    ['w_salas', '', 2020, 2021, 'Las salas siguen cerradas.', [['Pasar estrenos a streaming', { caja: 0.01 }], ['Esperar', { junta: -5 }]]],
    ['w_calor', 'obra', 2050, 9999, 'Una ola de calor complica el rodaje de «{o}».', [['Pasar a un set virtual', { caja: -0.02 }], ['Esperar', { sem: 2 }]]],
    ['w_colonias', '', 2100, 9999, 'Las colonias orbitales piden películas propias.', [['Hacer una versión para ellas', { caja: 0.02, fans: 0.01 }], ['No', {}]]],
    ['w_neuro', '', 2085, 9999, 'Debate ético por las obras que se sienten.', [['Firmar un código', { fama: 0.01 }], ['Ignorarlo', { fama: -0.01 }]]],
    ['w_sinteticos', '', 2125, 9999, 'Un talento sintético pide derechos de autor.', [['Reconocerlos', { fama: 0.01, caja: -0.01 }], ['Negarse', { fama: -0.01 }]]],
    ['w_festival', '', 1930, 9999, 'Una ciudad quiere un festival con el nombre de tu estudio.', [['Patrocinarlo', { caja: -0.02, fama: 0.01 }], ['No', {}]]],
    ['v_aniv', '', 0, 9999, 'Tu estudio cumple años.', [['Gran fiesta', { caja: -0.01, moral: 2, fans: 0.01 }], ['Algo sencillo', {}]]],
    ['v_caridad', '', 0, 9999, 'Una fundación pide ayuda.', [['Donar', { caja: -0.01, fama: 0.006 }], ['No', {}]]],
    ['v_pasante', '', 0, 9999, 'Un pasante genial quiere quedarse.', [['Contratarlo', { caja: -0.002, idea: 1 }], ['No', {}]]],
    ['v_vecinos', '', 0, 9999, 'Los vecinos se quejan del ruido del estudio.', [['Pagar aislamiento', { caja: -0.01 }], ['Ignorarlos', { fama: -0.003 }]]],
    ['v_gato', 'obra', 0, 9999, 'Un gato vive en el set de «{o}» y el equipo lo adora.', [['Adoptarlo como mascota', { moral: 1 }], ['Llevarlo a un refugio', {}]]],
    ['v_utileria', 'obra', 0, 9999, 'Roban utilería valiosa de «{o}».', [['Rehacerla', { caja: -0.01 }], ['Improvisar', { crit: -1 }]]],
  ];
  function evento(id) { return EV.filter(function (e) { return e[0] === id; })[0]; }
  // Sujetos posibles para un requisito
  function sujetos(req) {
    const S = N.S;
    const prod = O.enProduccion(0);
    if (req === 'obra') return prod.length ? { o: N.elegir(prod) } : null;
    if (req === 'estrella' || req === 'rival') {
      const conInt = prod.filter(function (o) { return (o.eq.int || []).length; });
      if (!conInt.length) return null;
      const o = N.elegir(conInt), t = T.porId(o.eq.int[0]);
      if (!t) return null;
      const r = req === 'rival' ? N.elegir(IA.rivales.activos()) : null;
      if (req === 'rival' && !r) return null;
      return { o: o, t: t, r: r };
    }
    if (req === 'exito') { const c = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && o.pub >= 62 && S.t - (o.fe || 0) < 52 * 4; }); return c.length ? { o: N.elegir(c) } : null; }
    if (req === 'franq') { const c = IA.franquicias.lista().filter(function (f) { return f.est === 0; }); return c.length ? { f: N.elegir(c) } : null; }
    return {};
  }
  function texto(e, s) {
    return e[4].replace(/\{o\}/g, s.o ? s.o.tit : '').replace(/\{t\}/g, s.t ? s.t.nom : '').replace(/\{r\}/g, s.r ? s.r.nombre : '').replace(/\{f\}/g, s.f ? s.f.nom : '');
  }
  function pendiente() { return N.S.evento || null; }
  // Cada semana, a veces, llega un evento (uno a la vez)
  function semana() {
    const S = N.S;
    if (S.evento) { if (S.t - S.evento.t0 >= 6) decidir(S.evento.ops.length - 1, true); return; }
    if (S.evProx === undefined) S.evProx = S.t + N.entero(3, 8);
    if (S.t < S.evProx) return;
    const fr = IA.metas.frecEventos();
    S.evProx = S.t + (fr > 0 ? Math.round(N.entero(4, 9) / fr) : 99999);
    const a = N.anio(), ult = S.evUlt || (S.evUlt = {});
    const cand = EV.filter(function (e) { return a >= e[2] && a <= e[3] && !(ult[e[0]] > S.t - 104); });
    for (let k = 0; k < 6 && cand.length; k++) {
      const e = cand.splice(N.entero(0, cand.length - 1), 1)[0];
      const s = sujetos(e[1]);
      if (!s) continue;
      ult[e[0]] = S.t;
      S.evento = { id: e[0], t0: S.t, txt: texto(e, s), ops: e[5].map(function (x) { return x[0].replace(/\{o\}/g, s.o ? s.o.tit : ''); }), o: s.o ? s.o.id : null, ta: s.t ? s.t.id : null, f: s.f ? s.f.id : null };
      return;
    }
  }
  function aplicar(ef, ev) {
    const S = N.S, est = S.estudios[0], o = ev.o ? O.porId(ev.o) : null, ta = ev.ta ? T.porId(ev.ta) : null;
    const out = [];
    Object.keys(ef).forEach(function (k) {
      const v = ef[k];
      if (k === 'caja') { const m = Math.round(Math.abs(v) * tip()); if (v < 0) IA.negocio.pagar(0, 'eventos', m); else IA.negocio.cobrarEn(0, 'eventos', m); }
      else if (k === 'fama') est.fama = N.redondear(N.limitar(est.fama + v, 0.01, 1), 3);
      else if (k === 'fans') S.fans = Math.max(0, Math.round((S.fans || 0) * (1 + v)));
      else if (k === 'moral' && o) O.idsEquipo(o).forEach(function (id) { const t = T.porId(id); if (t) T.cambiarMoral(t, v); });
      else if (k === 'pub' && o) o.dpub = (o.dpub || 0) + v;
      else if (k === 'crit' && o) o.dcrit = (o.dcrit || 0) + v;
      else if (k === 'hype' && o) o.ddes = (o.ddes || 0) + v;
      else if (k === 'sem' && o && o.sr !== undefined && o.et !== 'lista' && o.et !== 'terminada') o.sr = Math.max(1, o.sr + v);
      else if (k === 'apr' && ta) ta.apr = Math.round(N.limitar((ta.apr === undefined ? 50 : ta.apr) + v, 0, 100));
      else if (k === 'idea') {
        const idea = IA.ideas.ideaAleatoria(N.anio(), ta ? ta.hab : 65), c = Math.round(N.limitar(N.normal(66, 10), 40, 92));
        S.guionesPropios = S.guionesPropios || [];
        S.guionesPropios.push({ id: N.sigId(), idea: idea, autor: ta ? ta.id : null, nomAutor: ta ? ta.nom : 'Propuesta', calif: c, lect: c, margen: 6, pags: 110, precio: 0, vence: S.t + 520 });
        out.push('Te deja una idea en tus guiones.');
      }
      else if (k === 'pedida' && (o || ev.f)) { if (o) o.pedida = 1; }
      else if (k === 'junta') IA.banco.estado().junta = N.limitar(IA.banco.junta() + v, 0, 100);
      else if (k === 'credito') IA.banco.estado().pagados += 10;
      else if (k === 'socio') IA.banco.entraSocio(Math.round(IA.banco.valorEstudio() * v), v);
      else if (k === 'riesgo') { if (N.probabilidad(v[0])) { aplicar(v[1], ev); out.push('Salió mal.'); } else out.push('Salió bien.'); }
    });
    return out;
  }
  function decidir(i, auto) {
    const S = N.S, ev = S.evento;
    if (!ev) return '';
    const e = evento(ev.id), op = e[5][+i] || e[5][e[5].length - 1];
    const extra = aplicar(op[1], ev);
    S.bitacora = S.bitacora || [];
    S.bitacora.unshift({ t: S.t, txt: ev.txt, op: (auto ? 'Sin respuesta: ' : '') + op[0], r: extra.join(' ') });
    if (S.bitacora.length > 150) S.bitacora.pop();
    S.evento = null;
    return extra.join(' ');
  }
  // El bot elige al azar entre las opciones razonables
  function autoDecidir() { const ev = N.S.evento; if (ev) decidir(N.entero(0, ev.ops.length - 1)); }
  return { EV: EV, evento: evento, pendiente: pendiente, semana: semana, decidir: decidir, autoDecidir: autoDecidir };
})();
