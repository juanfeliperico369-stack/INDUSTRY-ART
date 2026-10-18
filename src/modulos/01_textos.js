/* ==== módulo: textos ==== */
// Diccionario de todos los textos visibles. Español hoy; el inglés llega en la V34 agregando IA.textos.en.
// Uso: IA.t('clave') o IA.t('clave', { n: 3 }) con {n} dentro del texto.
IA.textos = {
  idioma: 'es',
  es: {
    // Generales
    juego: 'INDUSTRY ART', subtitulo: 'Industria del Arte', version: 'Versión {v}',
    aceptar: 'Aceptar', cancelar: 'Cancelar', cerrar: 'Cerrar', volver: 'Volver', siguiente: 'Siguiente', atras: 'Atrás',
    confirmar: 'Confirmar', recomendado: 'Recomendado', dado: 'Al azar', si: 'Sí', no: 'No', ninguno: 'Ninguno',
    semana: 'Semana', semanas: 'semanas', mes: 'mes', anio: 'Año', hoy: 'hoy', epoca: 'época', ver: 'Ver', todos: 'Todos',
    // Secciones
    sec_estudio: 'Estudio', sec_obras: 'Obras', sec_talento: 'Talento', sec_mundo: 'Mundo', sec_negocio: 'Negocio',
    // Barra superior
    avanzar: 'Avanzar', pausa: 'Pausa', guardar: 'Guardar', ajustes: 'Ajustes', ayuda: 'Ayuda',
    ritmo: 'Ritmo', ritmo_semana: '+1 semana', ritmo_mes: '+1 mes', ritmo_evento: 'Hasta el próximo evento', ritmo_auto: 'Automático',
    dinero_hoy: 'en dólares de hoy', dinero_epoca: 'en dinero de la época', caja: 'Caja',
    toca_dinero: 'Toca la caja para verla en dólares de hoy',
    // Inicio
    nueva_partida: 'Nueva partida', continuar: 'Continuar', cargar: 'Cargar partida', importar: 'Importar archivo .iasave',
    creditos: 'Ideado y creado por Felipe · Programado junto a Claude, de Anthropic',
    v15_aparte: 'La V15 sigue jugable aparte; sus partidas no se migran.',
    // Nueva partida
    np_titulo: 'Funda tu estudio', np_nombre: 'Nombre del estudio', np_logo: 'Logo', np_logo_otro: 'Otro logo',
    np_anio: 'Año de inicio', np_pais: 'País de la sede', np_capital: 'Capital inicial (en dólares de hoy)',
    np_capital_ayuda: 'Equivale a {epoca} de {anio}: unas {n} películas típicas de la época.',
    np_dificultad: 'Dificultad', np_escenario: 'Población después de 2100', np_semilla: 'Semilla del mundo (opcional)',
    np_semilla_ayuda: 'La misma semilla con las mismas decisiones da el mismo mundo: sirve para repetir o compartir.',
    np_avatar: 'Tu avatar', np_tu_nombre: 'Tu nombre', np_sexo: 'Sexo', np_edad: 'Edad', np_personalidad: 'Personalidad',
    np_empezar: 'Empezar', np_anio_ayuda: 'Por ahora se empieza desde 1895 (nace el cine). Teatro y libros desde 1850 llegan en la V32.',
    escenario_alto: 'Alto', escenario_medio: 'Medio (ONU)', escenario_bajo: 'Bajo', mujer: 'Mujer', hombre: 'Hombre',
    // Estudio
    est_tareas: 'Tareas de la semana', est_fechas: 'Próximas fechas', est_resumen: 'Resumen', est_sin_tareas: 'Todo en marcha. Puedes avanzar.',
    est_capacidad: 'Proyectos a la vez', est_fama: 'Fama del estudio', est_cuota: 'Cuota del año', est_clase: 'Clase',
    tarea_lista: '«{t}» está lista: elige fecha de estreno', tarea_capacidad: 'Tienes capacidad libre: crea una obra',
    tarea_rojo: 'Caja en rojo: {n} de 26 semanas antes de la quiebra', tarea_premios: 'Premios Quimera en {n} semanas',
    tarea_construir: 'Te sobra caja: amplía el estudio en Negocio', faltan: 'faltan {n} sem.', esta_semana: 'esta semana',
    // Obras
    obras_marcha: 'En marcha', obras_listas: 'Listas', obras_cartelera: 'En cartelera', obras_catalogo: 'Catálogo',
    crear_obra: 'Crear obra', programar: 'Programar estreno', sin_obras: 'Aún no hay obras aquí.',
    paso_generos: 'Géneros', paso_tono: 'Tono y clasificación', paso_historia: 'Historia y tono', paso_escala: 'Producción y contenido', paso_equipo: 'Equipo', paso_titulo: 'Título',
    generos_ayuda: 'Elige de 1 a 3 géneros. La familia pesa en la calidad; el encaje entre familias se descubre usándolo.',
    encaje: 'Encaje', encaje_desconocido: 'Encaje por descubrir', tono: 'Tono', clasificacion: 'Clasificación',
    escala_ayuda: 'Más presupuesto ayuda, pero cada vez menos: duplicarlo siempre suma lo mismo.',
    equipo_ayuda: 'Cada talento cobra su precio de mercado; nunca depende del presupuesto de tu obra. Vestuario, efectos y animación tienen sus propios talentos (o un estudio externo).',
    costo_talento: 'Contratos', costo_produccion: 'Producción', costo_marketing: 'Marketing (estimado)', costo_total: 'Total estimado',
    calidad_esperada: 'Calidad esperada', semanas_produccion: 'Semanas de producción', iniciar: 'Iniciar producción',
    titulo_obra: 'Título', otro_titulo: 'Otro título', progreso: 'Progreso', etapa: 'Etapa',
    estreno_semana: 'Semana de estreno', estreno_ayuda: 'La temporada y los estrenos rivales anunciados cambian cuánta gente irá.',
    marketing: 'Marketing', marketing_ayuda: 'Más campaña llega a más gente, pero cada vez rinde menos. Prometer de más se paga con mal boca a boca.',
    temporada: 'Temporada', competencia: 'Estrenos rivales', bruto: 'Taquilla', parte_estudio: 'Parte del estudio', neto: 'Resultado',
    entradas: 'Entradas', semanas_cartelera: 'Semanas en cartelera', critica: 'Crítica', publico: 'Público', multiplicador: 'Multiplicador',
    expectativa: 'Expectativa', conocimiento: 'Conocimiento', informe: 'Por qué funcionó o fracasó',
    // Talento
    tal_buscar: 'Buscar por nombre', tal_disponibles: 'Solo disponibles', tal_oficio: 'Oficio', tal_tarifa: 'Tarifa',
    tal_habilidad: 'Habilidad', tal_fama: 'Fama', tal_edad: 'Edad', tal_rasgo: 'Rasgo', tal_ocupado: 'Ocupado hasta {f}',
    tal_disponible: 'Disponible', tal_obras: 'Obras', tal_premios: 'Premios', tu_avatar: 'Tu avatar', retirado: 'Retirado',
    // Mundo
    mun_cartelera: 'Cartelera', mun_calendario: 'Calendario', mun_premios: 'Premios', mun_rivales: 'Rivales',
    mun_periodico: 'Periódico', mun_tendencias: 'Tendencias', mun_poblacion: 'Población', otras_productoras: 'Otras productoras',
    // Negocio
    neg_finanzas: 'Finanzas', neg_estudio: 'Construcciones', neg_mercado: 'Mercado', comprometido: 'Comprometido en producciones',
    caja_libre: 'Caja libre', ingresos: 'Ingresos', gastos: 'Gastos', utilidad: 'Utilidad', impuestos: 'Impuestos',
    construir: 'Construir', costo: 'Costo', gasto_fijo: 'Gastos fijos al mes',
    // Guardado
    gua_titulo: 'Guardar y cargar', gua_ranura: 'Ranura {n}', gua_auto: 'Autoguardado {n}', gua_vacia: 'Vacía',
    gua_guardado: 'Guardado en {r}', gua_error: 'No se pudo guardar: {e}', gua_cargado: 'Partida cargada', gua_exportar: 'Exportar .iasave',
    gua_importar: 'Importar .iasave', gua_corrupto: 'El archivo está dañado o no es de INDUSTRY ART.',
    gua_autoguardado: 'Autoguardado', auto_mes: 'Cada mes', auto_anio: 'Cada año', auto_no: 'Apagado',
    // Ajustes
    aj_tema: 'Tema', tema_oscuro: 'Oscuro', tema_claro: 'Claro', tema_epoca: 'Época', tema_contraste: 'Alto contraste',
    aj_texto: 'Tamaño del texto', aj_movimiento: 'Menos animación', aj_sonido: 'Efectos de sonido', aj_vibracion: 'Vibración',
    aj_orientacion: 'Orientación', ori_auto: 'Automática', ori_vertical: 'Vertical', ori_horizontal: 'Horizontal',
    aj_laboratorio: 'Laboratorio (bot de pruebas)', aj_salir: 'Salir al inicio', aj_dinero: 'Mostrar el dinero',
    // Eventos
    quiebra_titulo: 'Tu estudio quebró', quiebra_texto: 'Pasaste 26 semanas con la caja en rojo. Elige una salida: terminar, pedir un rescate al banco o buscar un socio.',
    resumen_titulo: 'Resumen de {n} semanas', premios_titulo: '{nombre} {anio}',
    nada_nuevo: 'Nada nuevo por ahora.',
    // Ayuda "i" de cada pantalla (texto con formato)
    ayuda_inicio: 'Tu estudio abre sus puertas. Para empezar: <b>1.</b> En <b>Obras</b>, toca <b>Crear obra</b>, elige <b>Idea nueva</b> y avanza con <b>Recomendado</b> (o adapta un clásico en <b>Usar material</b>). <b>2.</b> Avanza el tiempo con el botón turquesa. <b>3.</b> Cuando la obra esté lista, elige la semana de estreno y el marketing. <b>4.</b> Cobra la taquilla semana a semana. Toca la caja para verla en dólares de hoy.',
    ayuda_nueva: '<p>El año de inicio cambia todo: en 1900 el cine es un mercado diminuto que explota en pocos años; en 2000 el mercado es enorme y los rivales, fuertes.</p><p>El capital se elige en dólares de hoy y se convierte a la época con la inflación real. Lo recomendado alcanza para unas tres películas típicas.</p><p>La semilla repite el mismo mundo: compártela para jugar el mismo mundo en otro celular.</p>',
    ayuda_estudio: '<p>Tu estudio dibujado: cada piso es un departamento que construiste; los terrenos se llenan con sets. La fachada cambia con la época.</p><p><b>Tareas de la semana</b> te dice qué decidir. <b>Próximas fechas</b> cuenta las semanas que faltan para tus estrenos, los de los rivales y los premios.</p><p>El ritmo lo eliges tú con la flecha junto a Avanzar: +1 semana, +1 mes, hasta el próximo evento o automático.</p>',
    ayuda_obras: '<p><b>Crear obra</b> tiene tres caminos: <b>idea nueva</b>, <b>comprar un guion</b> ya escrito o <b>usar material</b> (82 obras de dominio público y derechos que se compran). Desde 2022 también hay <b>idea automática con IA</b>.</p><p>El <b>modo rápido</b> son 5 decisiones (géneros, historia y tono, producción y contenido, equipo, título) con <b>Recomendado</b> y dado. El <b>modo detallado</b> tiene todas las listas y los deslizadores: contenido (que decide la clasificación), duración, complejidad, ritmo, efectos, presupuesto, época e IA, más los personajes. Los totales se ven en vivo y el encaje entre familias se descubre usándolo.</p><p>La producción pasa por desarrollo, preproducción, rodaje y posproducción. Al final eliges la semana de estreno y el marketing.</p><p>La taquilla sale de personas: cada semana el público de cada región se reparte entre todas las obras en cartelera (tuyas, de los rivales y de otras productoras) y la opción de quedarse en casa. Si la obra decepciona frente a lo prometido, el boca a boca la hunde; si sorprende, dura más.</p><p><b>Cine a fondo (V19)</b>: en el modo detallado eliges <b>cómo se filma</b> (locación real, set, efectos prácticos, CGI desde 1973 o mixto), el <b>terreno</b> de la locación (ciudad, pradera, desierto, montaña, bosque, trópico, ártico o mar), el <b>país de rodaje</b> con su costo local e incentivos, si <b>reusas un set</b> guardado y el <b>estilo de producción</b> (cada uno lo aman unas edades y lo rechazan otras). En <b>Departamentos y presupuesto</b> repartes la plata entre arte, vestuario, efectos, cámara, música, edición y logística: cada departamento sale con su <b>nota de F a A+</b>.</p><p>Durante la producción pueden pasar cosas: <b>incidentes</b> (lluvia, una cámara rota, una buena racha) y <b>dilemas</b> que decides tú. Dos semanas antes de terminar se hace la <b>prueba de público</b>: estrenas así, pules, reeditas, regrabas escenas o apuras el estreno. La ficha de la obra muestra la <b>línea de producción</b>: el presupuesto acordado frente al costo real.</p><p><b>Plan de lanzamiento</b> (V20): vía (cines, directo a video desde 1980 o a streaming desde 2010), fecha con cuenta regresiva (anunciar con tiempo suma gente que se entera), modo por región (amplio, limitado, escalonado o retener «0»), doblaje por mercado, nivel de campaña y mezcla de canales con su alcance por edades, promociones (alfombra roja, comida, juguetes, coleccionables, ediciones exclusivas) y la expectativa frente a la calidad.</p><p>Después de los cines llegan las <b>ventanas</b> en orden: video (VHS, DVD, Blu-ray), TV y streaming, con sus certificaciones oro, platino y diamante. En tu <b>catálogo</b> puedes reestrenar, remasterizar o guardar en la bóveda.</p><p><b>Premisas y tropos</b> (V21): elige hasta 2 por obra; dan frases a la sinopsis, encajan mejor con algunas familias y las muy usadas cansan. En el mercado de guiones puedes pagar un informe de lectura y regatear.</p>',
    ayuda_talento: '<p>Más de 1.000 talentos inventados, cada uno con biografía, oficio (y a veces otro), desempeño por familia de géneros, capacidades, idiomas, fama por región, clasificaciones que aceptan y personalidad (de Pretencioso a Estrella Absoluta). Un 90 o más es raro. Crecen hasta los 35 a 48 años según el oficio, se retiran entre los 70 y los 100 (a veces vuelven) y hay niños actores.</p><p><b>Energía</b>: cada cargo cuesta 20 y recuperan 10 al mes; nadie toma más de 2 proyectos a la vez. Quien llega cansado rinde menos.</p><p><b>Negociación</b>: aceptan, piden un porcentaje de tu taquilla, exigen algo (ser protagonistas, un buen director) o rechazan (las estrellas quieren estudios famosos). Con porcentaje cobran menos salario fijo.</p><p><b>Exclusivos</b> (su salario sigue a la época), <b>academia</b> con becas (hasta +5 por oficio), <b>promesas</b> que descubren tus cazatalentos y relaciones que nacen del trabajo: amistad, rivalidad y pareja.</p><p>La tarifa es el precio de mercado: habilidad, fama, demanda y época. Nunca depende del presupuesto de tu obra.</p>',
    ayuda_inicio_guia: '<p>Avanza el tiempo con el botón ▶ (o elige el ritmo con la flecha). En <b>Estudio</b> están tus tareas, tu sede y tu avatar; en <b>Obras</b> creas y estrenas; en <b>Talento</b> contratas; en <b>Mundo</b> está el calendario completo; en <b>Negocio</b>, el dinero, la sede y la distribución. Cada pantalla tiene su ayuda «i».</p>',
    ayuda_mundo: '<p>El mundo es real de 1850 a 2026 (sin personas reales) y ficción basada en predicciones hasta 2150.</p><p>La población de cada región y su pirámide de edades deciden cuánta gente puede comprar. El acceso al cine y la frecuencia cambian con la época: la TV, el video y el streaming le quitan público.</p><p>Las tendencias suben y bajan en olas, en el mundo y en cada región; si todos estrenan lo mismo, el público se cansa.</p><p>El <b>calendario</b> muestra 12 meses: estaciones por hemisferio, festividades reales que suben géneros en sus regiones (las de tu sede pesan más para ti) y los estrenos anunciados.</p><p><b>Calendario completo</b> (V21): todos los días reales de 1850 a 2150 con su día de la semana, en vistas de mes, semana, año, día y agenda. Festividades con su regla real (Pascua calculada, lunas nuevas, calendario islámico), premiaciones, festivales y convenciones en su circuito anual, tus estrenos, tu producción, tu nómina y tus recordatorios. Toca un día para actuar, filtra por tipo y región, salta a cualquier año o avanza hasta un día elegido. La fecha de la barra abre el calendario.</p>',
    ayuda_negocio: '<p>Las finanzas van por categoría y por mes. El impuesto es del 25 % sobre las utilidades del año, no sobre la caja.</p><p><b>Comprometido</b> es lo que falta pagar de tus producciones; <b>Caja libre</b> descuenta eso y tres meses de gastos fijos.</p><p>Construye pisos y terrenos para hacer más obras a la vez y mejorar departamentos; cada construcción cuesta más y sube los gastos fijos. Con 35 % o más del mercado se abre una investigación antimonopolio.</p><p><b>Distribución</b> (V20): firma con cadenas de cines de cada región (más salas, más parte de la taquilla y semanas mínimas, a cambio de una cuota) y construye hasta 3 cines propios en tu sede. Lo que ganas por video, TV y streaming aparece en Finanzas con su propia categoría.</p><p><b>Sede y personal</b> (V21): tu sede crece del cuarto alquilado al complejo; cada nivel sube el tope de personal y el gasto fijo. Recluta productor, guionista de planta, editor, mercadeo y analista (cuenta el mejor de cada rol), capacítalos y súmalos a una producción.</p>',
  },
};
IA.t = function (clave, vars) {
  const dic = IA.textos[IA.textos.idioma] || IA.textos.es;
  let s = dic[clave];
  if (s === undefined) s = IA.textos.es[clave];
  if (s === undefined) return clave;
  if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(String(vars[k])); });
  return s;
};
