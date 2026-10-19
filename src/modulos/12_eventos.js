/* ==== módulo: eventos ==== */
// Más de 170 eventos con decisiones (escándalos, quejas del elenco, propuestas de talentos y productores, fans que
// piden secuelas, huelgas, negocio, prensa, tecnología, momentos históricos, vida del estudio, estrenos en cartelera,
// clásicos del catálogo, música, teatro, libros, juegos, tu plataforma y tu canal, y la vida antes del cine) y la
// bitácora del estudio con cada mini decisión, al estilo de una vida que se escribe sola.
ART.eventos = (function () {
  'use strict';
  const N = ART.n, O = ART.obras, T = ART.talentos;
  const tip = function () { return ART.economia.presupuestoTipico(N.anio()); };
  // [id, requisito, desde, hasta, texto, [[opción, efectos], ...]]
  // requisito: obra (tuya en producción), estrella (talento de una obra tuya en marcha), exito (obra tuya querida),
  // franq (franquicia viva tuya), rival, cartelera (estreno tuyo en salas), catalogo (obra tuya de hace años),
  // proyecto (música, teatro, libro o juego tuyo en producción), temporada (teatro tuyo en cartel), lanzado (disco,
  // libro o juego tuyo a la venta), plataforma, canal o '' (nada). Efectos: caja (× presupuesto típico), fama, fans
  // (proporción), moral, pub, crit, sem (semanas de demora), hype, apr (aprobación del talento), idea (te deja un
  // guion), pedida (fans que esperan secuela), junta, credito, socio (parte), u (impulso en taquilla), todasU (a todos
  // tus estrenos), pq (calidad del proyecto), psem (semanas del proyecto), R (ventas que faltan, en proporción),
  // ocup (ocupación del teatro), promesa (una joven promesa con exclusiva) y riesgo [probabilidad, efectos].
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
    // ---------- Antes del cine: corte, mecenas, censores, velas, gas y folletines (1700–1894) ----------
    ['x_mecenas', '', 1700, 1860, 'Un noble ofrece mecenazgo a cambio de que le dediques tu próxima obra.', [['Aceptar y dedicarla', { caja: 0.04, fama: -0.004 }], ['Aceptar en secreto', { caja: 0.03, riesgo: [0.3, { fama: -0.015 }] }], ['Rechazar con elegancia', { fama: 0.006 }]]],
    ['x_corte', '', 1700, 1789, 'La corte pide una función privada en palacio.', [['Ir con todo el elenco', { caja: 0.02, fama: 0.01 }], ['Mandar una versión corta', { caja: 0.01 }], ['Excusarse', { fama: -0.01 }]]],
    ['x_censor', 'proyecto', 1737, 1843, 'El censor exige cortar escenas de «{p}» antes de autorizarla.', [['Cortar lo que pide', { pq: -2 }], ['Reescribir con dobles sentidos', { psem: 2, pq: 1 }], ['Estrenar sin permiso', { fama: 0.01, riesgo: [0.5, { caja: -0.05, fama: -0.02 }] }]]],
    ['x_vela', 'temporada', 1700, 1820, 'Un candelabro cae en plena función de «{p}». Nadie sale herido, pero hubo pánico.', [['Cambiar a lámparas de aceite', { caja: -0.01, ocup: 0.03 }], ['Seguir con velas', { riesgo: [0.3, { ocup: -0.1, fama: -0.01 }] }]]],
    ['x_gas', 'temporada', 1817, 1885, 'Una fuga de gas obliga a suspender una noche de «{p}».', [['Revisar toda la instalación', { caja: -0.015, ocup: 0.02 }], ['Reparar lo justo', { riesgo: [0.25, { ocup: -0.12 }] }]]],
    ['x_claque', 'temporada', 1820, 1900, 'Una claque ofrece aplaudir cada noche de «{p}» a cambio de entradas gratis.', [['Contratarla', { caja: -0.004, ocup: 0.06 }], ['Rechazarla', { riesgo: [0.3, { ocup: -0.05 }] }]]],
    ['x_gira', 'temporada', 1750, 1910, 'Una compañía ambulante quiere llevar «{p}» de pueblo en pueblo.', [['Ceder los derechos por un pago', { caja: 0.02 }], ['Hacer la gira tú', { caja: -0.01, fans: 0.03 }], ['No', {}]]],
    ['x_folletin', 'proyecto', 1836, 1910, 'Los suscriptores del folletín de «{p}» exigen que el héroe no muera.', [['Darles el gusto', { pq: -1, R: 0.12 }], ['Mantener el final', { pq: 2, fans: -0.01 }]]],
    ['x_piratas', 'lanzado', 1700, 1886, 'Un impresor extranjero reimprime «{p}» sin pagarte un centavo.', [['Pleitear', { caja: -0.01, riesgo: [0.5, { caja: 0.02 }] }], ['Sacar una edición barata', { R: 0.06 }], ['Ignorarlo', { R: -0.08 }]]],
    ['x_revolucion', '', 1789, 1799, 'La revolución cierra los teatros reales: piden obras patrióticas.', [['Montar obras patrióticas', { fama: 0.01, caja: -0.01 }], ['Esperar a que pase', { junta: -4 }]]],
    ['x_colera', '', 1830, 1866, 'Una epidemia de cólera vacía las salas y las librerías.', [['Funciones a mitad de precio', { caja: -0.02, fans: 0.02 }], ['Cerrar unas semanas', { caja: -0.01 }]]],
    ['x_tren', '', 1830, 1890, 'El ferrocarril llega a tu ciudad y trae público de los pueblos cercanos.', [['Hacer trenes de teatro con descuento', { caja: -0.01, fans: 0.04 }], ['Dejar que llegue solo', { fans: 0.01 }]]],
    ['x_retrato', '', 1840, 1905, 'Un fotógrafo quiere retratar a tu compañía para los diarios.', [['Posar con vestuario', { fama: 0.006, fans: 0.01 }], ['No', {}]]],
    ['x_linterna', 'temporada', 1850, 1900, 'Un linternista ofrece funciones de linterna mágica en los entreactos de «{p}».', [['Probarlo', { caja: -0.004, ocup: 0.04 }], ['No', {}]]],
    ['x_fonografo', '', 1877, 1905, 'Un inventor quiere grabar en cilindros las canciones de tu compañía.', [['Grabar', { caja: 0.01, fama: 0.006 }], ['Desconfiar del invento', {}]]],
    ['x_partituras', 'lanzado', 1700, 1930, 'Las partituras de «{p}» se agotan en las tiendas de música.', [['Reimprimir enseguida', { caja: -0.005, R: 0.1 }], ['Esperar la próxima tirada', { R: 0.03 }]]],
    ['x_salon', '', 1700, 1880, 'Una dama de la alta sociedad quiere presentar tus obras en su salón literario.', [['Asistir y leer en persona', { fama: 0.01 }], ['Mandar un ejemplar dedicado', { fama: 0.004 }], ['No', {}]]],
    ['x_duelo', '', 1700, 1870, 'Un crítico ofendido te reta a duelo por una sátira de tu compañía.', [['Pedir disculpas', { fama: -0.004 }], ['Responder con otra sátira', { fama: 0.008, fans: 0.02, riesgo: [0.3, { caja: -0.02 }] }]]],
    // ---------- Cartelera: lo que pasa con un estreno tuyo ----------
    ['c_viral', 'cartelera', 0, 9999, 'Todo el mundo habla de «{o}»: se volvió el tema del momento.', [['Impulsarla con anuncios', { caja: -0.01, u: 0.25 }], ['Dejar que fluya', { u: 0.12 }]]],
    ['c_filtracion', 'cartelera', 1999, 9999, 'Se filtra una copia de «{o}» y circula sin control.', [['Campaña legal', { caja: -0.015, u: -0.05 }], ['Lanzarla antes en video', { u: -0.12, caja: 0.01 }], ['Ignorarlo', { u: -0.3 }]]],
    ['c_critica_feroz', 'cartelera', 0, 9999, 'Un crítico famoso destroza «{o}» en su columna.', [['Responderle en público', { fama: -0.005, u: 0.04 }], ['Invitarlo a hablar con la dirección', { fama: 0.004 }], ['Ignorarlo', { u: -0.06 }]]],
    ['c_boicot', 'cartelera', 1920, 9999, 'Un grupo de presión llama a boicotear «{o}».', [['Defender la obra', { fama: 0.01, u: -0.08, fans: 0.02 }], ['Cortar la escena polémica', { u: 0.02, fama: -0.01 }]]],
    ['c_premiere', 'cartelera', 1915, 9999, 'Llueve a cántaros en la noche de estreno de «{o}».', [['Repartir paraguas con el logo', { caja: -0.003, u: 0.03 }], ['Mover la alfombra roja adentro', { u: 0.01 }]]],
    ['c_doblaje', 'cartelera', 1930, 9999, 'Un error de doblaje en «{o}» se vuelve chiste nacional.', [['Corregirlo enseguida', { caja: -0.006 }], ['Reírse con el público', { fans: 0.02, u: 0.04 }]]],
    ['c_cola', 'cartelera', 1905, 9999, 'Hay filas de dos cuadras para ver «{o}».', [['Agregar funciones de medianoche', { caja: -0.005, u: 0.08 }], ['Subir el precio', { caja: 0.01, u: -0.04 }]]],
    ['c_cines', 'cartelera', 1910, 9999, 'Una cadena amenaza con quitar «{o}» de sus salas.', [['Ceder más porcentaje', { caja: -0.01 }], ['Negarse', { u: -0.1 }]]],
    ['c_meme', 'cartelera', 2008, 9999, 'Una frase de «{o}» se vuelve un meme mundial.', [['Vender camisetas con la frase', { caja: 0.01, fans: 0.02 }], ['Aprovecharlo en la campaña', { u: 0.1 }]]],
    ['c_recomendacion', 'cartelera', 1950, 9999, 'Un programa de televisión muy visto recomienda «{o}».', [['Mandar regalos al programa', { caja: -0.003, u: 0.08 }], ['Dar las gracias', { u: 0.05 }]]],
    // ---------- Catálogo: tus clásicos siguen vivos ----------
    ['k_tv', 'catalogo', 1950, 2012, 'Una cadena de televisión quiere emitir «{o}» y otras obras viejas tuyas.', [['Vender los derechos', { caja: 0.03, fans: 0.01 }], ['Esperar una mejor oferta', { riesgo: [0.5, { caja: 0.05 }] }]]],
    ['k_plataforma', 'catalogo', 2008, 9999, 'Una plataforma ajena quiere «{o}» y parte de tu catálogo.', [['Licenciar por cinco años', { caja: 0.05, fans: -0.01 }], ['Guardarlas para la tuya', { fans: 0.005 }]]],
    ['k_museo', 'catalogo', 1950, 9999, 'Un museo quiere una retrospectiva de tu estudio con «{o}» como estrella.', [['Prestar todo el archivo', { caja: -0.005, fama: 0.015, fans: 0.02 }], ['Solo copias', { fama: 0.006 }]]],
    ['k_reestreno', 'catalogo', 1920, 9999, 'El público pide volver a ver «{o}» en pantalla grande.', [['Función especial de aniversario', { caja: 0.015, fans: 0.02 }], ['Edición restaurada', { caja: -0.01, fama: 0.008, fans: 0.03 }]]],
    ['k_cineclub', 'catalogo', 1930, 9999, 'Un cineclub dedica un ciclo completo a «{o}».', [['Mandar a alguien del equipo', { fama: 0.006 }], ['Nada', {}]]],
    ['k_robo', 'catalogo', 1910, 1990, 'Roban las copias originales de «{o}» de tu bóveda.', [['Pagar a un detective', { caja: -0.01, riesgo: [0.4, { fama: -0.005 }] }], ['Dar por perdidas las copias', { fama: -0.006 }]]],
    ['k_remake', 'catalogo', 1950, 9999, 'Un estudio extranjero quiere hacer su propia versión de «{o}».', [['Venderle los derechos', { caja: 0.03 }], ['Hacerla tú primero', { idea: 1 }], ['No', {}]]],
    // ---------- Proyectos de música, teatro, libros y juegos ----------
    ['p_estudio_grab', 'proyecto', 1900, 9999, 'El estudio de grabación de «{p}» se inunda en plena sesión.', [['Alquilar otro estudio', { caja: -0.01 }], ['Esperar la reparación', { psem: 2 }]]],
    ['p_beta', 'proyecto', 1995, 9999, 'Los probadores encuentran cientos de errores en «{p}».', [['Retrasar el lanzamiento', { psem: 3, pq: 2 }], ['Lanzar y parchar después', { pq: -2 }]]],
    ['p_crunch', 'proyecto', 1985, 9999, 'El equipo de «{p}» lleva semanas trabajando de noche.', [['Dar vacaciones y retrasar', { psem: 2, moral: 3 }], ['Pagar horas extra', { caja: -0.01 }], ['Seguir así', { moral: -5, pq: -1 }]]],
    ['p_editor_corta', 'proyecto', 1700, 9999, 'Tu editor quiere recortar cien páginas de «{p}».', [['Aceptar el recorte', { pq: 1 }], ['Defender cada página', { pq: -1, fama: 0.003 }]]],
    ['p_portada', 'proyecto', 1880, 9999, 'Un ilustrador famoso se ofrece a hacer la portada de «{p}».', [['Pagarle', { caja: -0.006, R: 0.06 }], ['Portada sencilla', {}]]],
    ['p_ensayo_general', 'proyecto', 1700, 9999, 'El ensayo general de «{p}» sale desastroso.', [['Una semana más de ensayos', { psem: 1, pq: 2 }], ['Confiar en la superstición', { riesgo: [0.4, { pq: -2 }] }]]],
    ['p_cantante', 'proyecto', 1930, 9999, 'La voz principal de «{p}» se queda afónica.', [['Esperar a que se recupere', { psem: 2 }], ['Grabar con otra voz', { pq: -2 }]]],
    ['l_lista', 'lanzado', 1935, 9999, '«{p}» sube como espuma en las listas.', [['Gira de promoción', { caja: -0.01, R: 0.12, fans: 0.02 }], ['Dejarla correr', { R: 0.04 }]]],
    ['l_resena', 'lanzado', 1850, 9999, 'Una reseña muy leída pone a «{p}» por las nubes.', [['Citarla en la publicidad', { R: 0.08 }], ['Nada', { R: 0.03 }]]],
    ['l_parche', 'lanzado', 1998, 9999, 'Un error grave en «{p}» enfurece a los jugadores.', [['Parche gratis enseguida', { caja: -0.008, fans: 0.01 }], ['Esperar al próximo contenido', { R: -0.1, fans: -0.02 }]]],
    ['l_premio_lector', 'lanzado', 1900, 9999, 'Los lectores eligen «{p}» libro del mes en un club muy famoso.', [['Edición especial para el club', { caja: -0.004, R: 0.1 }], ['Agradecer', { R: 0.05 }]]],
    ['t_lleno', 'temporada', 1700, 9999, 'No queda una butaca libre para «{p}» en todo el mes.', [['Agregar funciones de matiné', { caja: -0.004, ocup: 0.05 }], ['Subir la entrada', { caja: 0.01 }]]],
    ['t_actor_cae', 'temporada', 1700, 9999, 'El protagonista de «{p}» se tuerce un tobillo.', [['Que salga el suplente', { ocup: -0.04 }], ['Cancelar una semana', { caja: -0.01 }]]],
    // ---------- Rodajes, equipo y estrellas ----------
    ['r_pelea', 'estrella', 0, 9999, '{t} se pelea a gritos con la dirección en el set de «{o}».', [['Apoyar a la dirección', { apr: -8, crit: 1 }], ['Mediar en persona', { sem: 1, moral: 2 }], ['Dar la razón a la estrella', { apr: 6, moral: -2 }]]],
    ['r_lesion', 'estrella', 0, 9999, '{t} se lesiona haciendo una escena de acción en «{o}».', [['Esperar su recuperación', { sem: 2, apr: 6 }], ['Usar un doble', { pub: -1 }], ['Reescribir la escena', { crit: -1 }]]],
    ['r_compositor', 'obra', 1927, 9999, 'El compositor de «{o}» pide más tiempo para terminar la música.', [['Dárselo', { sem: 1, crit: 1 }], ['Usar música de archivo', { crit: -1 }]]],
    ['r_efectos', 'obra', 1970, 9999, 'El equipo de efectos de «{o}» pide más presupuesto.', [['Darlo', { caja: -0.02, pub: 2 }], ['Recortar efectos', { pub: -1 }]]],
    ['r_cameo', 'obra', 1930, 9999, 'Una estrella invitada ofrece un cameo gratis en «{o}».', [['Aceptar', { hype: 2 }], ['No hace falta', {}]]],
    ['r_locacion', 'obra', 1920, 9999, 'Las autoridades cierran la locación de «{o}» por falta de permisos.', [['Pagar la multa', { caja: -0.01 }], ['Rodar en el estudio', { crit: -1, sem: 1 }]]],
    ['r_detras', 'obra', 1960, 9999, 'Un equipo de televisión quiere filmar el detrás de cámaras de «{o}».', [['Abrir el set', { hype: 2, moral: -1 }], ['Solo entrevistas', { hype: 1 }], ['No', {}]]],
    ['r_transporte', 'obra', 1900, 9999, 'Una huelga de transporte retrasa el rodaje de «{o}».', [['Alquilar autobuses propios', { caja: -0.008 }], ['Esperar', { sem: 1 }]]],
    ['r_apagon', 'obra', 1890, 9999, 'Un apagón en la ciudad detiene el rodaje de «{o}».', [['Generadores de emergencia', { caja: -0.006 }], ['Esperar la luz', { sem: 1 }]]],
    ['r_incendio', 'obra', 1895, 9999, 'Se incendia un plató de «{o}». Nadie resulta herido.', [['Reconstruir rápido', { caja: -0.03 }], ['Adaptar el guion a otro set', { crit: -1, sem: 1 }]]],
    ['r_censura', 'obra', 0, 9999, 'La censura cuestiona el guion de «{o}».', [['Hacer los cambios', { crit: -1 }], ['Defender la obra', { fama: 0.01, riesgo: [0.4, { pub: -2 }] }]]],
    ['r_deepfake', 'estrella', 2018, 9999, 'Circula un video falso de {t} haciendo algo que nunca hizo.', [['Desmentirlo con abogados', { caja: -0.01, apr: 8 }], ['Esperar a que se olvide', { hype: -1 }]]],
    ['r_contrato', 'estrella', 0, 9999, '{t} quiere su nombre arriba del título en los carteles de «{o}».', [['Aceptar', { apr: 5, hype: 1 }], ['Negarse', { apr: -6 }]]],
    ['r_promesa', '', 0, 9999, 'Una joven promesa sin agente pide una oportunidad en tu estudio.', [['Contratarla con exclusividad', { promesa: 1 }], ['Dejarla ir', {}]]],
    ['r_estrella_quiere', '', 0, 9999, 'Una estrella consagrada dice que sueña con trabajar en tu estudio.', [['Invitarla a comer', { caja: -0.002, idea: 1 }], ['Agradecer', { fama: 0.003 }]]],
    // ---------- Negocio, dinero y mundo ----------
    ['m_crisis', '', 1850, 9999, 'Una crisis económica hace que la gente recorte gastos.', [['Recortar costos del estudio', { moral: -1, junta: 3 }], ['Bajar el precio de las entradas', { todasU: 0.05, caja: -0.01 }], ['Aguantar', { todasU: -0.06 }]]],
    ['m_gigante', '', 1920, 9999, 'Un conglomerado gigante quiere comprar el 25 % de tu estudio.', [['Vender', { socio: 0.25 }], ['Rechazar', { fama: 0.004 }]]],
    ['m_marca', '', 1920, 9999, 'Una marca quiere patrocinar a tu estudio durante un año.', [['Aceptar', { caja: 0.03, fama: -0.004 }], ['Rechazar', {}]]],
    ['m_inflacion', '', 1900, 9999, 'La inflación dispara los costos de producción.', [['Comprar insumos por adelantado', { caja: -0.02 }], ['Absorberlo', { junta: -3 }]]],
    ['m_tasas', '', 1900, 9999, 'Tu banco sube las tasas de interés.', [['Renegociar', { caja: -0.005, credito: 1 }], ['Aceptarlo', { junta: -2 }]]],
    ['m_moneda', '', 1950, 9999, 'El cambio de moneda favorece tus ventas en el extranjero.', [['Repatriar las ganancias', { caja: 0.02 }], ['Invertir afuera', { fama: 0.004 }]]],
    ['m_inundacion', '', 0, 9999, 'Una inundación llega hasta el sótano de tus estudios.', [['Reparar todo', { caja: -0.02 }], ['Reparar lo urgente', { caja: -0.008, moral: -2 }]]],
    ['m_patente', '', 1895, 9999, 'Un inventor ofrece venderte la patente de un aparato curioso.', [['Comprarla', { caja: -0.01, riesgo: [0.5, { fama: 0.01, caja: 0.03 }] }], ['No', {}]]],
    ['m_formatos', '', 1976, 2010, 'El formato de video que apoyaste pierde la guerra de formatos.', [['Pasarte al ganador', { caja: -0.015 }], ['Aguantar un año más', { riesgo: [0.7, { caja: -0.03 }] }]]],
    ['m_cuota', '', 1927, 9999, 'Una ley de cuota de pantalla obliga a los cines a pasar obras nacionales.', [['Aprovecharla', { todasU: 0.05, fama: 0.004 }], ['Seguir igual', {}]]],
    ['m_embrujado', '', 0, 9999, 'Circula un rumor absurdo: que tu estudio está embrujado.', [['Hacer una visita guiada nocturna', { caja: -0.003, fans: 0.03 }], ['Desmentirlo', { fama: 0.002 }]]],
    ['m_escuela', '', 1920, 9999, 'Una escuela de arte te pide que des clases magistrales.', [['Dar las clases', { fama: 0.008, moral: 1 }], ['Mandar a tu mejor talento', { fama: 0.004 }], ['No tienes tiempo', {}]]],
    ['m_seguro', '', 1930, 9999, 'El sindicato pide un seguro médico para todo tu equipo.', [['Pagarlo', { caja: -0.02, moral: 4 }], ['Negociar uno básico', { caja: -0.008, moral: 1 }], ['Negarse', { riesgo: [0.4, { junta: -6, moral: -4 }] }]]],
    ['m_premio_vida', '', 1950, 9999, 'Te ofrecen un premio a la trayectoria del estudio.', [['Aceptarlo con un discurso', { fama: 0.012 }], ['Pedir que se lo den a tu equipo', { moral: 3, fama: 0.006 }]]],
    ['m_videoclub', '', 1980, 2008, 'Una cadena de videoclubes quiere copias exclusivas de tus obras.', [['Firmar', { caja: 0.02 }], ['No', {}]]],
    ['m_auditor', '', 1900, 9999, 'Un auditor encuentra un error a tu favor en los impuestos.', [['Reclamar la devolución', { caja: 0.01 }], ['Dejarlo así', { junta: 2 }]]],
    // ---------- Fans y franquicias ----------
    ['fr_dibujo', 'franq', 2005, 9999, 'Un dibujo de fans de «{f}» se vuelve viral.', [['Contratar a quien lo hizo', { caja: -0.002, fans: 0.02 }], ['Compartirlo con los créditos', { fans: 0.015 }]]],
    ['fr_campana', 'exito', 2000, 9999, 'Los fans de «{o}» hacen campaña para que gane premios.', [['Apoyar la campaña', { caja: -0.006, fama: 0.008 }], ['Agradecer en redes', { fans: 0.01 }]]],
    ['fr_secuelas', 'franq', 1970, 9999, 'Llega la fiebre de las secuelas: todos piden más de «{f}».', [['Anunciar una nueva entrega', { pedida: 1, fans: 0.03 }], ['Esperar el momento', {}]]],
    ['fr_juguetes', 'franq', 1977, 9999, 'Una juguetera quiere sacar figuras de los personajes de «{f}».', [['Licenciar', { caja: 0.03, fans: 0.02 }], ['Exigir calidad de coleccionista', { caja: 0.015, fama: 0.004 }]]],
    ['fr_parque', 'franq', 1955, 9999, 'Un parque de diversiones quiere una atracción de «{f}».', [['Licenciar', { caja: 0.04, fans: 0.03 }], ['No', {}]]],
    ['fr_videojuego', 'franq', 1980, 9999, 'Un estudio de videojuegos quiere licenciar «{f}».', [['Licenciar', { caja: 0.02, fans: 0.02 }], ['Hacerlo tú', { idea: 1 }]]],
    ['fr_novela', 'exito', 1930, 9999, 'Una editorial quiere publicar la novela de «{o}».', [['Vender los derechos', { caja: 0.01, fans: 0.01 }], ['No', {}]]],
    ['fr_teatro', 'exito', 1930, 9999, 'Un productor de teatro quiere llevar «{o}» a los escenarios.', [['Ceder los derechos', { caja: 0.015, fama: 0.005 }], ['No', {}]]],
    ['fr_molestos', 'franq', 0, 9999, 'Los fans de «{f}» están molestos con el rumbo de la saga.', [['Escucharlos', { fans: 0.01 }], ['Defender la visión', { fama: 0.004, fans: -0.02 }]]],
    // ---------- Tu plataforma y tu canal ----------
    ['s_caida', 'plataforma', 2007, 9999, 'Se caen los servidores de tu plataforma en pleno estreno.', [['Más servidores ya', { caja: -0.02 }], ['Pedir disculpas y regalar un mes', { caja: -0.01, fans: 0.01 }]]],
    ['s_datos', 'plataforma', 2010, 9999, 'Roban datos de los suscriptores de tu plataforma.', [['Avisar a todos y reforzar', { caja: -0.02, fama: 0.004 }], ['Callar', { riesgo: [0.5, { fama: -0.03, fans: -0.04 }] }]]],
    ['s_contrasenas', 'plataforma', 2015, 9999, 'Miles de personas comparten una sola cuenta de tu plataforma.', [['Cobrar por compartir', { caja: 0.02, fans: -0.02 }], ['Dejarlo pasar', { fans: 0.01 }]]],
    ['s_canal_record', 'canal', 1950, 9999, 'Tu canal marca un récord de audiencia en una noche de estreno.', [['Subir el precio de los anuncios', { caja: 0.02 }], ['Celebrar con el equipo', { moral: 2 }]]],
    ['s_canal_multa', 'canal', 1950, 9999, 'Una autoridad advierte a tu canal por contenido en horario familiar.', [['Pagar y ajustar la parrilla', { caja: -0.01 }], ['Apelar', { riesgo: [0.5, { caja: -0.02 }] }]]],
    // ---------- Historia que pasa por tu puerta ----------
    ['w_gripe', '', 1918, 1919, 'La gripe cierra salas y teatros en muchas ciudades.', [['Funciones al aire libre', { caja: -0.01, fans: 0.02 }], ['Cerrar y esperar', { caja: -0.01 }]]],
    ['w_radio', '', 1922, 1935, 'Una emisora de radio quiere transmitir tus estrenos en vivo.', [['Aceptar', { caja: 0.01, fans: 0.02 }], ['Temer que la radio te quite público', {}]]],
    ['w_sonoro', '', 1927, 1931, 'Tus estrellas del cine mudo tienen miedo de que el sonido acabe con ellas.', [['Pagarles clases de dicción', { caja: -0.01, moral: 3 }], ['Buscar voces nuevas', { fama: -0.004 }]]],
    ['w_codigo_fin', '', 1966, 1970, 'Se acaba la censura del Código: ¿cambias el tono de tus obras?', [['Abrazar la libertad', { fama: 0.01, fans: 0.02 }], ['Seguir siendo familiar', { fans: 0.01 }]]],
    ['w_video_casero', '', 1977, 1985, 'Los estudios rivales demandan a los fabricantes de grabadoras de video.', [['Unirte a la demanda', { caja: -0.005 }], ['Vender tus obras en cinta', { caja: 0.02 }]]],
    ['w_internet', '', 1995, 2001, 'Todos hablan de internet: ¿una página para tu estudio?', [['Hacer la página', { caja: -0.004, fans: 0.03 }], ['Es una moda pasajera', {}]]],
    ['w_crisis2008', '', 2008, 2009, 'La crisis financiera congela los créditos de la industria.', [['Recortar producciones', { junta: 4 }], ['Seguir apostando', { junta: -4, fama: 0.006 }]]],
    ['w_pandemia', '', 2020, 2021, 'La pandemia obliga a rodar con protocolos estrictos.', [['Invertir en protocolos', { caja: -0.02, moral: 3 }], ['Pausar los rodajes', { junta: -4 }]]],
    ['w_espacio', '', 2060, 9999, 'Una agencia espacial ofrece rodar escenas en órbita.', [['Aceptar la aventura', { caja: -0.03, fama: 0.02, fans: 0.04 }], ['Seguir en tierra', {}]]],
    ['w_holograma', '', 2048, 9999, 'Piden que una estrella ya retirada vuelva como holograma.', [['Hacerlo con permiso de la familia', { caja: 0.02, fama: -0.004 }], ['No', { fama: 0.004 }]]],
    ['w_clima', '', 2040, 9999, 'Las olas de calor obligan a rodar de noche.', [['Turnos nocturnos', { caja: -0.01, moral: -1 }], ['Sets virtuales', { caja: -0.02 }]]],
    // Tu vida fuera del set (de la Final)
    ['av_clases', '', 1900, 9999, 'Te invitan a dar clases en una escuela de cine.', [['Aceptar', { fama: 0.006, moral: -1 }], ['No tengo tiempo', {}]]],
    ['av_entrevista', '', 1930, 9999, 'Un programa quiere entrevistarte.', [['Ir', { fans: 0.03 }], ['Mejor no', {}]]],
    ['av_descanso', '', 0, 9999, 'Llevas meses sin descansar.', [['Tomar vacaciones', { moral: 3 }], ['Seguir (un error en público te cuesta prestigio)', { fama: -0.004 }]]],
    ['av_amigo', '', 0, 9999, 'Un viejo amigo te pide dinero para terminar su obra.', [['Ayudarle', { caja: -0.01, fama: 0.004 }], ['Decir que no', {}]]],
    ['av_memorias', '', 0, 9999, 'Una editorial te propone escribir tus memorias.', [['Escribirlas (cobras un adelanto)', { caja: 0.01, moral: -1 }], ['Todavía no', {}]]],
    ['av_jurado', '', 1900, 9999, 'Un festival te pide ser jurado.', [['Aceptar', { fama: 0.006 }], ['Rechazar', {}]]],
    ['av_beca', '', 0, 9999, 'Una escuela quiere crear una beca con tu nombre.', [['Financiarla', { caja: -0.005, fama: 0.008 }], ['Agradecer y nada más', {}]]],
    ['av_cameo', 'rival', 0, 9999, 'Te ofrecen un cameo en una obra de un rival.', [['Aceptar', { fans: 0.02, fama: 0.003 }], ['Rechazar', {}]]],
    ['av_portada', '', 1900, 9999, 'Una revista te ofrece su portada.', [['Aceptar', { fans: 0.02 }], ['Rechazar', {}]]],
    ['av_casa', '', 0, 9999, 'Ves una casa frente al mar.', [['Comprarla', { caja: -0.02, moral: 3 }], ['Seguir donde vives', {}]]],
    ['av_perro', '', 0, 9999, 'Un perro callejero te sigue hasta el estudio.', [['Adoptarlo', { moral: 2 }], ['Llevarlo a un refugio', {}]]],
    ['av_rival', 'rival', 0, 9999, 'Un viejo rival te invita a cenar.', [['Ir', { fama: 0.003 }], ['Inventar una excusa', {}]]],
    ['av_discurso', '', 0, 9999, 'Te piden un discurso en una gala.', [['Darlo', { fama: 0.004 }], ['Mandar a alguien de tu oficina', {}]]],
    ['av_biografia', '', 0, 9999, 'Un periodista quiere escribir tu biografía.', [['Colaborar', { fans: 0.03 }], ['Negarte', {}]]],
    ['av_concursos', '', 1950, 9999, 'Te invitan a un programa de concursos.', [['Ir (más fans, menos prestigio)', { fans: 0.03, fama: -0.002 }], ['No', {}]]],
    ['av_familia', 'obra', 0, 9999, 'Tu familia te pide más tiempo.', [['Tomar un mes libre (tus rodajes se atrasan una semana)', { sem: 1, moral: 3 }], ['Seguir trabajando', { moral: -1 }]]],
    ['av_fan', '', 0, 9999, 'Un fan te reconoce en la calle.', [['Tomarte una foto', { fans: 0.005 }], ['Seguir de largo', {}]]],
    ['av_talentos', '', 1950, 9999, 'Te ofrecen ser jurado en un concurso de talentos.', [['Aceptar', { fans: 0.02, fama: 0.002 }], ['Rechazar', {}]]],
    ['av_idioma', '', 0, 9999, 'Tienes la oportunidad de aprender otro idioma.', [['Estudiar', { fama: 0.002 }], ['Ahora no', {}]]],
    ['av_infancia', '', 0, 9999, 'Un amigo de la infancia te pide trabajo.', [['Contratarlo en la oficina', { moral: 1 }], ['Recomendarlo a otro estudio', {}]]],
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
      const r = req === 'rival' ? N.elegir(ART.rivales.activos()) : null;
      if (req === 'rival' && !r) return null;
      return { o: o, t: t, r: r };
    }
    if (req === 'exito') { const c = S.obras.filter(function (o) { return o.est === 0 && o.et === 'terminada' && o.pub >= 62 && S.t - (o.fe || 0) < 52 * 4; }); return c.length ? { o: N.elegir(c) } : null; }
    if (req === 'franq') { const c = ART.franquicias.lista().filter(function (f) { return f.est === 0; }); return c.length ? { f: N.elegir(c) } : null; }
    if (req === 'cartelera') { const c = S.obras.filter(function (o) { return o.est === 0 && o.et === 'cartelera'; }); return c.length ? { o: N.elegir(c) } : null; }
    if (req === 'catalogo') { const c = O.delEstudio(0, ['terminada']).filter(function (o) { return S.t - (o.fe || 0) > 52 * 3 && (o.pub || 0) >= 55; }); return c.length ? { o: N.elegir(c) } : null; }
    if (req === 'proyecto' || req === 'temporada' || req === 'lanzado') {
      const et = { proyecto: ['produccion', 'ensayo'], temporada: ['temporada'], lanzado: ['lanzado'] }[req];
      const c = ((S.med && S.med.p) || []).filter(function (p) { return et.indexOf(p.et) >= 0 && p.tipo !== 'jingle'; });
      return c.length ? { p: N.elegir(c) } : null;
    }
    if (req === 'plataforma') return S.stream && S.stream.cat ? {} : null;
    if (req === 'canal') return S.canal && S.canal.par ? {} : null;
    return {};
  }
  function texto(e, s) {
    return e[4].replace(/\{o\}/g, s.o ? s.o.tit : '').replace(/\{t\}/g, s.t ? s.t.nom : '').replace(/\{r\}/g, s.r ? s.r.nombre : '').replace(/\{f\}/g, s.f ? s.f.nom : '').replace(/\{p\}/g, s.p ? s.p.tit : '');
  }
  function pendiente() { return N.S.evento || null; }
  // Cada semana, a veces, llega un evento (uno a la vez)
  function semana() {
    const S = N.S;
    if (S.evento) { if (S.t - S.evento.t0 >= 6) decidir(S.evento.ops.length - 1, true); return; }
    if (S.evProx === undefined) S.evProx = S.t + N.entero(3, 8);
    if (S.t < S.evProx) return;
    const fr = ART.metas.frecEventos();
    S.evProx = S.t + (fr > 0 ? Math.round(N.entero(4, 9) / fr) : 99999);
    const a = N.anio(), ult = S.evUlt || (S.evUlt = {});
    const cand = EV.filter(function (e) { return a >= e[2] && a <= e[3] && !(ult[e[0]] > S.t - 104); });
    for (let k = 0; k < 6 && cand.length; k++) {
      const e = cand.splice(N.entero(0, cand.length - 1), 1)[0];
      const s = sujetos(e[1]);
      if (!s) continue;
      ult[e[0]] = S.t;
      S.evento = { id: e[0], t0: S.t, txt: texto(e, s), ops: e[5].map(function (x) { return x[0].replace(/\{o\}/g, s.o ? s.o.tit : ''); }), o: s.o ? s.o.id : null, ta: s.t ? s.t.id : null, f: s.f ? s.f.id : null, p: s.p ? s.p.id : null };
      return;
    }
  }
  function aplicar(ef, ev) {
    const S = N.S, est = S.estudios[0], o = ev.o ? O.porId(ev.o) : null, ta = ev.ta ? T.porId(ev.ta) : null;
    const p = ev.p ? ((S.med && S.med.p) || []).filter(function (x) { return x.id === ev.p; })[0] || null : null;
    const out = [];
    Object.keys(ef).forEach(function (k) {
      const v = ef[k];
      if (k === 'caja') { const m = Math.round(Math.abs(v) * tip()); if (v < 0) ART.negocio.pagar(0, 'eventos', m); else ART.negocio.cobrarEn(0, 'eventos', m); }
      else if (k === 'fama') est.fama = N.redondear(N.limitar(est.fama + (v > 0 ? v * (1 - est.fama) : v), 0.01, 1), 3);
      else if (k === 'fans') S.fans = Math.max(0, Math.round((S.fans || 0) * (1 + v)));
      else if (k === 'moral' && (o || p)) (o ? O.idsEquipo(o) : p.eq || []).forEach(function (id) { const t = T.porId(id); if (t) T.cambiarMoral(t, v); });
      else if (k === 'u' && o && o.et === 'cartelera') o.u = N.redondear((o.u || 0) + v, 4);
      else if (k === 'todasU') S.obras.forEach(function (x) { if (x.est === 0 && x.et === 'cartelera') x.u = N.redondear((x.u || 0) + v, 4); });
      else if (k === 'pq' && p) p.dq = (p.dq || 0) + v;
      else if (k === 'psem' && p && (p.et === 'produccion' || p.et === 'ensayo')) p.sr = Math.max(1, (p.sr || 1) + v);
      else if (k === 'R' && p) { if (p.R) p.R = Math.max(0, Math.round(p.R * (1 + v))); else if (p.et === 'temporada') p.ocup = N.redondear(N.limitar((p.ocup || 0.3) + v / 2, 0.05, 1), 3); }
      else if (k === 'ocup' && p && p.et === 'temporada') p.ocup = N.redondear(N.limitar((p.ocup || 0.3) + v, 0.05, 1), 3);
      else if (k === 'promesa') {
        const of = N.elegir(['interprete', 'interprete', 'direccion', 'guion', 'musica']);
        const nueva = T.crear(of, N.entero(18, 23), N.anio(), { pot: N.entero(84, 96), pasado: false, reg: est.reg });
        nueva.desc = 1; S.talentos.push(nueva); T.reindexar(); T.firmarExclusivo(nueva, 0, 3);
        out.push(nueva.nom + ' firma con tu estudio por tres años.');
      }
      else if (k === 'pub' && o) o.dpub = (o.dpub || 0) + v;
      else if (k === 'crit' && o) o.dcrit = (o.dcrit || 0) + v;
      else if (k === 'hype' && o) o.ddes = (o.ddes || 0) + v;
      else if (k === 'sem' && o && o.sr !== undefined && o.et !== 'lista' && o.et !== 'terminada') o.sr = Math.max(1, o.sr + v);
      else if (k === 'apr' && ta) ta.apr = Math.round(N.limitar((ta.apr === undefined ? 50 : ta.apr) + v, 0, 100));
      else if (k === 'idea') {
        const idea = ART.ideas.ideaAleatoria(N.anio(), ta ? ta.hab : 65), c = Math.round(N.limitar(N.normal(66, 10), 40, 92));
        S.guionesPropios = S.guionesPropios || [];
        S.guionesPropios.push({ id: N.sigId(), idea: idea, autor: ta ? ta.id : null, nomAutor: ta ? ta.nom : 'Propuesta', calif: c, lect: c, margen: 6, pags: 110, precio: 0, vence: S.t + 520 });
        out.push('Te deja una idea en tus guiones.');
      }
      else if (k === 'pedida' && (o || ev.f)) { if (o) o.pedida = 1; }
      else if (k === 'junta') ART.banco.estado().junta = N.limitar(ART.banco.junta() + v, 0, 100);
      else if (k === 'credito') ART.banco.estado().pagados += 10;
      else if (k === 'socio') ART.banco.entraSocio(Math.round(ART.banco.valorEstudio() * v), v);
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
