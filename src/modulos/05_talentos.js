/* ==== módulo: talentos ==== */
// Talentos 2.0 (V18): más de 1.000 personas inventadas con biografía, país, idiomas, edad y sexo; habilidad por
// oficio y oficios secundarios, desempeño por familia de géneros, capacidades (excelencia, creatividad,
// inteligencia, liderazgo y paciencia), especialidad por medio, belleza, aprobación del público y papeles
// recomendados, clasificaciones que aceptan, rasgo de personalidad, fama por región, energía (−20 por cargo,
// +10 al mes) y moral, relaciones (amistad, rivalidad, pareja), negociación, contratos exclusivos, academia,
// promesas que se descubren y ciclo de vida (niños actores, retiro entre 70 y 100 con regresos, muerte poco
// probable). La tarifa sale del mercado (economia.tarifa). Los que no trabajan se actualizan una vez al año.
IA.talentos = (function () {
  'use strict';
  const N = IA.n, D = IA.datos;
  const PESO_REGION = { nam: 0.28, eur: 0.25, asi: 0.2, lat: 0.14, afr: 0.08, oce: 0.05 };
  const CAPACIDADES = ['Excelencia', 'Creatividad', 'Inteligencia', 'Liderazgo', 'Paciencia'];
  const EJES = ['Acción', 'Imaginación', 'Suspenso', 'Drama', 'Humor', 'Familia', 'Arte', 'Romance']; // = D.ORDEN_FAM
  const MEDIOS = ['cine', 'tv', 'musica', 'juegos', 'teatro', 'libros'];
  const ENERGIA_CARGO = 20, ENERGIA_MES = 10, MAX_PROYECTOS = 2; // tu documento: casi siempre en 2 proyectos a la vez
  const MAX_ACADEMIA = 5; // hasta +5 de experiencia por estudios en cada oficio (tu documento)
  let indice = null; // id -> talento (se reconstruye al cargar)
  let porOficio = null; // oficio -> talentos en el mismo orden de la lista (para buscar rápido)

  function reindexar() {
    indice = {};
    porOficio = {};
    N.S.talentos.forEach(function (t) { indice[t.id] = t; (porOficio[t.of] = porOficio[t.of] || []).push(t); });
  }
  function porId(id) {
    if (id === undefined || id === null) return null;
    if (!indice) reindexar();
    return indice[id] || null;
  }
  function elegirRegion() {
    const ids = Object.keys(PESO_REGION);
    return ids[N.ponderado(ids.map(function (k) { return PESO_REGION[k]; }))];
  }
  function elegirPais(reg) {
    const ps = D.paises.filter(function (p) { return p.region === reg; });
    return ps[N.ponderado(ps.map(function (p) { return p.peso; }))].id;
  }
  function nombreNuevo(reg, sx) {
    const L = D.nombres[reg];
    return N.elegir(sx === 'F' ? L.f : L.m) + ' ' + N.elegir(L.a);
  }
  // Crecen hasta su pico y después cambian según el oficio (los directores y guionistas maduran más tarde)
  const CURVA = {
    interprete: [35, 55, 0.8], guion: [45, 70, 0.6], direccion: [45, 70, 0.6], produccion: [48, 72, 0.5],
    fotografia: [42, 66, 0.7], musica: [40, 70, 0.6], edicion: [40, 66, 0.7], arte: [40, 66, 0.7],
    vestuario: [40, 68, 0.6], efectos: [36, 60, 0.9], animacion: [34, 62, 0.8],
  };
  function curva(of) { return CURVA[of] || [40, 66, 0.8]; }
  function edadPico(of) { return curva(of)[0]; }
  function habilidadPorEdad(pot, edad, of) {
    const c = curva(of);
    const inicio = of === 'interprete' ? 6 : 18;
    if (edad < c[0]) return pot * (0.55 + 0.45 * N.limitar((edad - inicio) / (c[0] - inicio), 0, 1));
    if (edad > c[1]) return pot - (edad - c[1]) * c[2];
    return pot;
  }
  // Idiomas: el de su país (y a veces el inglés o un tercero)
  function idiomasDe(paisId, azar) {
    const p = D.pais(paisId);
    const base = p ? p.idioma.split(/ y | e /).map(function (x) { return x.trim().replace(/^./, function (c) { return c.toUpperCase(); }); }) : ['Inglés'];
    const out = base.slice();
    if (out.indexOf('Inglés') < 0 && azar() < 0.55) out.push('Inglés');
    if (azar() < 0.18) { const otros = ['Español', 'Francés', 'Italiano', 'Alemán', 'Portugués', 'Mandarín', 'Japonés', 'Árabe']; const x = otros[Math.floor(azar() * otros.length)]; if (out.indexOf(x) < 0) out.push(x); }
    return out;
  }
  // Completa los datos de la V18 de un talento. azar: función de 0 a 1 (el generador del mundo o un hash fijo)
  function completar(t, azar) {
    const nz = function (m, d) { let s = 0; for (let i = 0; i < 4; i++) s += azar(); return m + (s - 2) * d * 1.7; };
    if (!t.af) t.af = EJES.map(function () { return Math.round(N.limitar(nz(0, 3), -8, 8)); });
    if (!t.cp) {
      const cp = CAPACIDADES.map(function () { return Math.round(N.limitar(nz(t.hab, 12), 5, 99)); });
      // Nadie es perfecto en todo: si todo pasa de 95, una capacidad baja
      if (cp.every(function (x) { return x >= 95; })) cp[Math.floor(azar() * cp.length)] = Math.round(70 + azar() * 20);
      t.cp = cp;
    }
    if (!t.med) t.med = azar() < 0.72 ? 'cine' : MEDIOS[1 + Math.floor(azar() * 5)];
    if (!t.idi) t.idi = idiomasDe(t.pais, azar);
    if (t.of === 'interprete') {
      if (t.bel === undefined) t.bel = Math.round(N.limitar(nz(55, 14), 10, 99));
      if (t.dob === undefined) t.dob = Math.round(N.limitar(nz(45, 16), 5, 99));
      if (!t.pap) {
        const a = D.ORDEN_FAM.indexOf(D.ORDEN_FAM[t.af.indexOf(Math.max.apply(null, t.af))]);
        const lista = IA.taxonomia ? IA.taxonomia.arquetipos.map(function (x) { return x.id; }) : ['Héroe'];
        t.pap = [lista[(a * 3 + Math.floor(azar() * 5)) % lista.length], lista[Math.floor(azar() * lista.length)]].filter(function (x, i, l) { return l.indexOf(x) === i; });
      }
    }
    if (t.apr === undefined) t.apr = Math.round(N.limitar(50 + t.fama * 30 + nz(0, 8), 5, 99));
    // Clasificaciones que acepta (índice de G a X): los grandes hacen "cualquiera"; algunos ponen límites
    if (t.cmax === undefined) { const r = azar(); t.cmax = t.hab >= 80 && r < 0.6 ? 7 : r < 0.12 ? 2 : r < 0.3 ? 4 : r < 0.5 ? 6 : 7; }
    if (t.alc === undefined) t.alc = N.redondear(N.limitar(0.25 + t.fama * 0.5 + (azar() - 0.5) * 0.3, 0.05, 1), 2);
    if (t.en === undefined) { t.en = 100; t.enT = N.S ? N.S.t : 0; }
    if (t.mo === undefined) { t.mo = Math.round(55 + azar() * 15); t.moT = N.S ? N.S.t : 0; }
    if (t.act === undefined) t.act = 0;
    if (!t.gan) t.gan = 0;
    if (!t.tq) t.tq = 0;
    return t;
  }
  // Crea un talento; anio es el año actual del juego
  function crear(of, edad, anio, op) {
    const o = op || {};
    const reg = o.reg || elegirRegion();
    const sx = o.sx || (N.probabilidad(0.5) ? 'F' : 'M');
    const pot = Math.round(N.limitar(o.pot || N.normal(60, 13), 20, 99));
    const hab = Math.round(N.limitar(habilidadPorEdad(pot, edad, of) + N.normal(0, 3), 10, 99));
    const famaBase = Math.pow(N.limitar((hab - 38) / 60, 0, 1), 2) * (edad > 25 ? 1 : 0.5) * (0.3 + N.azar() * 0.9) * (of === 'interprete' ? 1.2 : 0.9);
    const rasgos = Object.keys(D.rasgos);
    const t = {
      id: N.sigId(), nom: nombreNuevo(reg, sx), sx: sx, nac: anio - edad, of: of, hab: hab, pot: pot,
      fama: N.redondear(N.limitar(famaBase, 0, 1), 3), reg: reg, pais: elegirPais(reg),
      rasgo: N.probabilidad(0.55) ? N.elegir(rasgos) : '', ocup: -1, obras: 0, exitos: 0, premios: 0, ret: 0,
    };
    // Un oficio secundario de vez en cuando (pueden cambiar de oficio)
    if (N.probabilidad(0.15)) {
      const otros = D.oficios.map(function (x) { return x.id; }).filter(function (x) { return x !== of; });
      t.h2 = {};
      t.h2[N.elegir(otros)] = Math.round(N.limitar(hab - N.entero(8, 30), 10, 95));
    }
    // Una carrera previa acorde a su edad y su fama (los nuevos y las promesas empiezan de cero)
    if (o.pasado !== false && edad >= 22) {
      t.obras = Math.round((edad - 20) * (0.15 + t.fama * 0.9) * (0.5 + N.azar()));
      t.exitos = Math.round(t.obras * t.fama * 0.5);
    }
    completar(t, N.azar);
    if (edad < 16 && t.cmax > 2) t.cmax = 2; // los niños actores solo hacen obras hasta PG-13
    return t;
  }
  function generarInicial() {
    N.S.talentos = [];
    poblarOficios(Object.keys(D.poblacionTalentos));
  }
  // Crea la población de unos oficios (al empezar, o en una partida vieja cuando llegan oficios nuevos)
  function poblarOficios(lista) {
    const S = N.S, anio = N.anio();
    lista.forEach(function (of) {
      const n = D.poblacionTalentos[of];
      for (let i = 0; i < n; i++) {
        // Los intérpretes empiezan desde niños (un 8 %); el resto desde los 18
        const nino = of === 'interprete' && N.probabilidad(0.08);
        const edad = nino ? N.entero(7, 15) : Math.round(N.limitar(18 + Math.pow(N.azar(), 1.3) * 52, 18, 72));
        S.talentos.push(crear(of, edad, anio));
      }
    });
    reindexar();
  }
  function edad(t) { return N.anio() - t.nac; }

  // ---------- Energía y moral (se calculan al vuelo: +10 de energía al mes, la moral vuelve despacio a 60) ----------
  function energia(t) {
    if (t.en === undefined) return 100;
    return Math.min(100, t.en + ENERGIA_MES * Math.floor((N.S.t - (t.enT || 0)) / 4.33));
  }
  function gastarEnergia(t, n) { t.en = Math.max(0, energia(t) - n); t.enT = N.S.t; }
  function moral(t) {
    if (t.mo === undefined) return 60;
    const meses = (N.S.t - (t.moT || 0)) / 4.33;
    return Math.round(60 + (t.mo - 60) * Math.pow(0.93, meses));
  }
  function cambiarMoral(t, d) { t.mo = Math.round(N.limitar(moral(t) + d, 0, 100)); t.moT = N.S.t; }

  // ---------- Disponibilidad ----------
  function exclusivoDe(t) { return t.ex !== undefined && t.ex !== null && t.exH > N.S.t ? t.ex : null; }
  function estudiando(t) { return !!(t.es && t.es.fin > N.S.t); }
  // Puede tomar un cargo: activo, con energía, sin pasar de 2 proyectos a la vez y sin exclusividad con otro
  function disponible(t, estId) {
    if (!t || t.ret || t.mu || estudiando(t)) return false;
    const ex = exclusivoDe(t);
    if (ex !== null && ex !== (estId || 0)) return false;
    return energia(t) >= ENERGIA_CARGO && (t.act || 0) < MAX_PROYECTOS;
  }
  function ocupado(t) { return (t.act || 0) > 0; }
  function tarifa(t) { return IA.economia.tarifa(t, N.anio()); }
  // Lo que le cuesta a un estudio: el exclusivo ya cobra su salario y los becados hacen precio
  function tarifaPara(t, estId) {
    if (!t) return 0;
    if (exclusivoDe(t) === estId) return 0;
    if (t.jugador && estId === 0) return 0; // tu avatar trabaja gratis en tu estudio (modo carrera, V21)
    let f = tarifa(t);
    if (estId === 0 && t.beca && t.beca > N.S.t) f *= 0.9; // la beca da 5 años de lealtad
    if (estId === 0 && t.desc && !t.obras) f *= 0.7; // tu descubrimiento firma barato su primer contrato
    return Math.round(f);
  }
  function activos(of) {
    return N.S.talentos.filter(function (t) { return !t.ret && !t.mu && (!of || t.of === of); });
  }
  function disponibles(of, estId) {
    return N.S.talentos.filter(function (t) { return t.of === of && disponible(t, estId || 0); });
  }

  // ---------- Perfil derivado ----------
  function personalidad(t) {
    if (t.fama >= 0.85 && t.exitos >= 5) return { id: 'Estrella Absoluta', valor: 100, txt: 'Estrella Absoluta' };
    const p = D.personalidades.filter(function (x) { return x.rasgos.indexOf(t.rasgo) >= 0; })[0] || D.personalidades[2];
    return { id: p.id, valor: p.valor, txt: p.id + ' - ' + (t.rasgo || 'Normal') };
  }
  // Impulso de popularidad que aporta (tomando Normal = 50 % como referencia)
  function impulso(t) { return (personalidad(t).valor - 50) / 50; }
  function overall(t) { return Math.round(t.hab * 0.65 + (t.cp ? t.cp.reduce(function (a, x) { return a + x; }, 0) / t.cp.length : t.hab) * 0.35); }
  function capacidad(t, nombre) { const i = CAPACIDADES.indexOf(nombre); return t.cp ? t.cp[i] : t.hab; }
  function afinidad(t, fam) { const i = D.ORDEN_FAM.indexOf(fam); return t.af && i >= 0 ? t.af[i] : 0; }
  // Fama en una región: en casa pesa más; afuera depende de su alcance internacional
  function famaRegion(t, reg) {
    const alc = t.alc === undefined ? 0.5 : t.alc;
    // Políglota (3 idiomas o más): su fama viaja mejor fuera de su región
    const poli = t.idi && t.idi.length >= 3 ? 0.1 : 0;
    return Math.min(1, t.fama * (reg === t.reg ? 1.3 : 0.7 + 0.3 * alc + poli));
  }
  // Ventajas ganadas con la experiencia
  function ventajas(t) {
    const v = [];
    if (t.obras >= 15) v.push({ id: 'Veterano', efecto: 'controla mejor los costos' });
    if (t.exitos >= 8 && t.exitos / Math.max(1, t.obras) >= 0.4) v.push({ id: 'Taquillero', efecto: '+1 al público' });
    if (t.premios >= 2) v.push({ id: 'Laureado', efecto: '+1 a la crítica' });
    if (t.idi && t.idi.length >= 3) v.push({ id: 'Políglota', efecto: 'su fama viaja mejor fuera de su región' });
    if (N.anio() - t.nac >= 55 && t.obras >= 30 && t.hab >= 70) v.push({ id: 'Mentor', efecto: '+0,5 a la calidad del equipo' });
    if (t.vu) v.push({ id: 'Regreso triunfal', efecto: 'el público lo extrañaba' });
    return v;
  }
  // Valores por medio, otras habilidades y capacidades del perfil (derivados, siempre iguales para el mismo talento)
  function perfilExtra(t) {
    const h = function (k, base, rango) { return Math.round(N.limitar(base + (N.hash(t.id + '|' + k) % (rango * 2 + 1)) - rango, 1, 99)); };
    const medios = {};
    MEDIOS.forEach(function (m) { medios[m] = m === t.med ? Math.min(99, Math.round(t.hab + 4)) : h(m, t.hab - 18, 15); });
    const cp = t.cp || [t.hab, t.hab, t.hab, t.hab, t.hab];
    return {
      medios: medios,
      otras: { Rango: h('rango', t.hab - 5, 15), Doblaje: t.dob !== undefined ? t.dob : h('dob', 40, 20), Acentos: h('acentos', 35 + (t.idi ? t.idi.length * 10 : 0), 15), Liderazgo: cp[3], Estilo: h('estilo', t.hab, 12), Paciencia: cp[4], Conceptos: h('conceptos', cp[2], 10), Complejidad: h('complejidad', (cp[2] + cp[1]) / 2, 10) },
      poder: Math.round(N.limitar(t.fama * 100 * (1 + impulso(t) * 0.3), 0, 100)),
    };
  }
  // Habilidad efectiva en una obra: oficio (o su oficio secundario), afinidad con la familia, especialidad en
  // cine, moral, cansancio y, en los intérpretes, la edad del personaje
  function habilidadEn(t, obra, rol) {
    if (!t) return 35;
    let h = rol && rol !== t.of && t.h2 && t.h2[rol] ? t.h2[rol] : rol && rol !== t.of && rol !== 'interprete' ? t.hab * 0.6 : t.hab;
    if (obra) {
      h += afinidad(t, obra.fam || D.familiaDe[obra.gen[0]]) * 0.4;
      if (obra.fat && obra.fat[t.id]) h -= obra.fat[t.id];
      if (obra.pj && t.of === 'interprete') {
        const p = obra.pj.filter(function (x) { return x.t === t.id; })[0];
        if (p) {
          const e = (obra.anioPlan || N.anio()) - t.nac;
          if (p.e < 16 && e >= 18) h -= 10; // un adulto no puede hacer de niño
          else if (Math.abs(e - p.e) > 15) h -= 4;
          if (t.pap && t.pap.indexOf(p.a) >= 0) h += 2; // papel recomendado
        }
      }
    }
    if (t.med !== 'cine') h -= 1; // quien viene de otro medio tarda en adaptarse al cine
    const m = moral(t);
    if (m >= 80) h += 1; else if (m < 30) h -= 2;
    return N.limitar(h, 1, 100);
  }

  // ---------- Niveles de talento (V21): Promesa, Veterano, Estrella consolidada y Leyenda viva ----------
  // Los niveles altos piden un prestigio mínimo del estudio (0 a 100) y la ficha dice cuánto falta
  const NIVELES = [
    { id: 'promesa', nombre: 'Promesa', prestigio: 0 },
    { id: 'veterano', nombre: 'Veterano', prestigio: 0 },
    { id: 'estrella', nombre: 'Estrella consolidada', prestigio: 25 },
    { id: 'leyenda', nombre: 'Leyenda viva', prestigio: 45 },
  ];
  function nivel(t) {
    const e = N.anio() - t.nac;
    if (t.fama >= 0.72 && t.hab >= 78 && (e >= 45 || (t.premios || 0) >= 3)) return NIVELES[3];
    if (t.fama >= 0.45) return NIVELES[2];
    if (e >= 38 || (t.obras || 0) >= 15) return NIVELES[1];
    return NIVELES[0];
  }
  function faltaPrestigio(t, estId) {
    const est = N.S.estudios[estId || 0];
    return Math.max(0, nivel(t).prestigio - Math.round((est ? est.fama : 0) * 100));
  }
  // Crear un talento propio (V21): con nombre, oficio, sexo y edad; la habilidad sale de un potencial modesto
  function crearPropio(op) {
    const anio = N.anio();
    const edad = N.limitar(Math.round(op.edad || 25), 8, 80);
    const t = crear(op.of || 'interprete', edad, anio, { reg: op.reg, sx: op.sx, pot: N.limitar(op.pot || 62, 30, 80), pasado: false });
    if (op.nom) t.nom = String(op.nom).slice(0, 40);
    t.propio = 1;
    N.S.talentos.push(t);
    reindexar();
    return t;
  }

  // ---------- Negociación: acepta, contraoferta (pide porcentaje o más dinero), exige o rechaza ----------
  // c: { est, rol, imp (importancia del personaje), clas (índice de la clasificación), dir (habilidad del director),
  //      amor (nivel de amor), fam }
  function negociar(t, c) {
    const S = N.S, est = S.estudios[c.est || 0];
    if (!t) return { estado: 'rechaza', texto: 'No existe' };
    const ex = exclusivoDe(t);
    if (ex !== null && ex !== (c.est || 0)) return { estado: 'rechaza', texto: 'Tiene contrato exclusivo con ' + S.estudios[ex].nombre };
    if (t.ret || t.mu) return { estado: 'rechaza', texto: 'Está retirado' };
    if (estudiando(t)) return { estado: 'rechaza', texto: 'Está estudiando' };
    if (!disponible(t, c.est || 0)) return { estado: 'rechaza', texto: (t.act || 0) >= MAX_PROYECTOS ? 'Ya está en ' + MAX_PROYECTOS + ' proyectos' : 'Sin energía (recupera 10 al mes)' };
    const e = N.anio() - t.nac;
    if (c.clas !== undefined && c.clas > t.cmax) return { estado: 'rechaza', texto: 'No hace obras de clasificación ' + IA.taxonomia.ORDEN_CLAS[c.clas] };
    if (e < 18 && ((c.amor || 0) >= 2 || (c.clas || 0) > 2)) return { estado: 'rechaza', texto: 'Es menor de edad: solo obras hasta PG-13' };
    const m = moral(t);
    if (m < 22) return { estado: 'rechaza', texto: 'Está desmotivado' };
    const falta = faltaPrestigio(t, c.est || 0);
    if (falta > 0) return { estado: 'rechaza', texto: nivel(t).nombre + ': pide prestigio ' + nivel(t).prestigio + ' (te faltan ' + falta + ')' };
    const brecha = t.fama - (est ? est.fama : 0);
    // Las estrellas exigen fama del estudio
    if (brecha > 0.65 && t.hab >= 70) return { estado: 'rechaza', texto: 'Tu estudio aún no le interesa (le falta fama)' };
    const exige = [];
    if (t.of === 'interprete' && t.fama >= 0.5 && c.imp && c.imp !== 'protagonista' && c.imp !== 'cameo' && c.imp !== 'invitado') exige.push({ tipo: 'protagonico', texto: 'Exige ser protagonista' });
    if ((t.of === 'interprete' || t.of === 'guion') && t.fama >= 0.55 && c.dir !== undefined && c.dir < t.hab - 18) exige.push({ tipo: 'director', min: Math.round(t.hab - 18), texto: 'Exige un director de habilidad ' + Math.round(t.hab - 18) + ' o más' });
    if (t.rasgo === 'Diva' && t.of === 'interprete' && c.imp && c.imp !== 'protagonista') exige.push({ tipo: 'protagonico', texto: 'Es diva: solo protagónicos' });
    if (exige.length) return { estado: 'exige', texto: exige[0].texto, exige: exige };
    if (brecha > 0.55 && t.hab >= 70) return { estado: 'contraoferta', texto: 'Pide un 10 % de la taquilla del estudio', pctMin: 10 };
    if (brecha > 0.4 && t.hab >= 70) return { estado: 'contraoferta', texto: 'Pide un 5 % de la taquilla del estudio', pctMin: 5 };
    if (m < 35) return { estado: 'contraoferta', texto: 'Pide un 5 % de la taquilla para animarse', pctMin: 5 };
    return { estado: 'acepta', texto: 'Acepta' };
  }
  // Salario con porcentaje: cuanto más porcentaje, menos salario fijo
  function salarioCon(tarifaBase, pct) { return Math.round(tarifaBase * (1 - 2.2 * (pct || 0) / 100)); }

  // ---------- Búsqueda del mejor disponible (para "recomendado", rivales y bot) ----------
  // azar: si es mayor que 1, elige al azar entre los mejores "azar" candidatos (así los rivales no se llevan
  // siempre a los mismos). op: { est, fam, edad, clas } para negociar y preferir la afinidad con la familia
  function mejorDisponible(of, tope, excluir, sexo, azar, op) {
    const anio = N.anio(), o = op || {};
    const estId = o.est || 0;
    const top = [];
    const k = azar && azar > 1 ? azar : 1;
    const est = N.S.estudios[estId];
    if (!indice) reindexar();
    const lista = porOficio[of] || [];
    for (let i = 0; i < lista.length; i++) {
      const t = lista[i];
      if (t.of !== of || t._veto || !disponible(t, estId)) continue;
      if (excluir && excluir.indexOf(t.id) >= 0) continue;
      if (sexo && t.sx !== sexo) continue;
      const e = anio - t.nac;
      if (o.nino) { if (e >= 16) continue; }
      else if (o.edad !== undefined) { if (o.edad < 16 ? Math.abs(e - o.edad) > 4 : e < 16) continue; }
      else if (of === 'interprete' && e < 16) continue;
      if (o.clas !== undefined && o.clas > t.cmax) continue;
      if (est && t.fama - est.fama > 0.65 && t.hab >= 70) continue; // no firmaría
      // Tampoco se busca a quien exigiría lo que no se le puede dar (ser protagonista o un mejor director)
      if (o.imp && o.imp !== 'protagonista' && of === 'interprete' && (t.fama >= 0.5 || t.rasgo === 'Diva')) continue;
      if (o.dir !== undefined && (of === 'interprete' || of === 'guion') && t.fama >= 0.55 && o.dir < t.hab - 18) continue;
      const valor = t.hab + t.fama * 12 + (o.fam ? afinidad(t, o.fam) * 0.4 : 0);
      // La tarifa solo se calcula si podría entrar entre los mejores (es lo más caro de la búsqueda)
      if (top.length >= k && valor <= top[top.length - 1].v) continue;
      const f = exclusivoDe(t) === estId ? 0 : IA.economia.tarifa(t, anio);
      if (f > tope) continue;
      {
        top.push({ t: t, v: valor });
        top.sort(function (a, b) { return b.v - a.v; });
        if (top.length > k) top.pop();
      }
    }
    if (!top.length) return null;
    return k > 1 ? top[Math.floor(N.azar() * top.length)].t : top[0].t;
  }
  // Ocupar: cada cargo cobra 20 de energía; el talento puede estar en hasta 2 proyectos a la vez
  function ocupar(ids, hasta) {
    ids.forEach(function (id) {
      const t = porId(id);
      if (!t) return;
      gastarEnergia(t, ENERGIA_CARGO);
      t.act = (t.act || 0) + 1;
      t.ocup = Math.max(t.ocup, hasta);
      t.obras++;
    });
  }
  function liberar(ids) {
    ids.forEach(function (id) { const t = porId(id); if (t && t.act > 0) t.act--; });
  }
  // Cansancio de cada talento al empezar una obra (se guarda en la obra para la calidad)
  function cansancio(ids) {
    const r = {};
    ids.forEach(function (id) { const t = porId(id); if (t) { const e = energia(t); if (e < 40) r[id] = Math.round((40 - e) / 4); } });
    return Object.keys(r).length ? r : null;
  }

  // ---------- Relaciones: amistad, rivalidad y pareja nacen del trabajo ----------
  function relacion(a, b) { return a && a.rel && a.rel[b.id] ? a.rel[b.id] : 0; }
  function tipoRelacion(v, a, b) {
    if (v >= 70 && a && b && a.of === 'interprete' && b.of === 'interprete' && a.sx !== b.sx) return 'pareja';
    return v >= 35 ? 'amistad' : v <= -35 ? 'rivalidad' : '';
  }
  function cambiarRelacion(a, b, d) {
    [[a, b], [b, a]].forEach(function (p) {
      const x = p[0], y = p[1];
      x.rel = x.rel || {};
      x.rel[y.id] = Math.round(N.limitar((x.rel[y.id] || 0) + d, -100, 100));
      // Solo se guardan las 6 relaciones más fuertes de cada talento
      const ks = Object.keys(x.rel);
      if (ks.length > 6) {
        ks.sort(function (i, j) { return Math.abs(x.rel[j]) - Math.abs(x.rel[i]); });
        ks.slice(6).forEach(function (k) { delete x.rel[k]; });
      }
    });
    const v = relacion(a, b), tipo = tipoRelacion(v, a, b);
    if (tipo === 'pareja' && Math.abs(d) > 0 && v - d < 70 && (a.fama > 0.4 || b.fama > 0.4)) N.emit('noticia', { tipo: 'talento', texto: a.nom + ' y ' + b.nom + ' son pareja: se conocieron en el rodaje.' });
  }
  // Química del equipo clave de una obra (dirección, guion y protagonistas): de −4 a +4
  function quimica(obra) {
    const ids = [obra.eq.direccion, obra.eq.guion].concat((obra.eq.int || []).slice(0, 2));
    const ts = ids.map(porId).filter(Boolean);
    let s = 0;
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) s += relacion(ts[i], ts[j]);
    return N.limitar(s / 40, -4, 4);
  }

  // ---------- Después del estreno: fama, moral, alcance, relaciones e historial ----------
  function trasEstreno(obra, rendimiento) {
    const ids = [obra.eq.direccion, obra.eq.guion].concat(obra.eq.int || []);
    const bruto2025 = IA.mundo.aHoy(obra.bruto || 0, obra.anio || N.anio());
    ids.forEach(function (id, k) {
      const t = porId(id);
      if (!t) return;
      const peso = k >= 2 ? 1 : 0.7;
      const cambio = N.limitar(0.05 * Math.log(Math.max(0.2, rendimiento)) + (obra.crit - 60) / 800, -0.06, 0.12) * peso;
      t.fama = N.redondear(N.limitar(t.fama + cambio, 0, 1), 3);
      if (rendimiento >= 2) { t.exitos++; t.alc = N.redondear(Math.min(1, (t.alc || 0.5) + 0.03), 2); }
      t.hab = Math.max(t.hab, Math.min(t.pot + 3, t.hab + 0.5));
      t.apr = Math.round(N.limitar((t.apr || 50) + (obra.pub - 66) / 8, 1, 99));
      cambiarMoral(t, rendimiento >= 2 ? 10 : rendimiento < 1 ? -8 : 2);
    });
    // Todo el equipo suma taquilla a su carrera
    IA.obras.idsEquipo(obra).forEach(function (id) {
      const t = porId(id);
      if (!t) return;
      t.tq = Math.round((t.tq || 0) + bruto2025);
      if (obra.est === 0) { t.hist = (t.hist || []).concat([obra.id]).slice(-15); }
    });
    // Trabajar juntos crea amistades o rivalidades (los éxitos unen; los fracasos y los egos separan)
    const clave = ids.map(porId).filter(Boolean).slice(0, 4);
    for (let i = 0; i < clave.length; i++) for (let j = i + 1; j < clave.length; j++) {
      const a = clave[i], b = clave[j];
      let d = (rendimiento >= 2 ? 12 : rendimiento < 1 ? -10 : 4) + N.entero(-8, 8);
      // Los protagonistas de un romance que funciona se enamoran más fácil
      if (i >= 2 && j >= 2 && a.of === 'interprete' && b.of === 'interprete' && a.sx !== b.sx && (obra.fam === 'RD' || obra.fam === 'DR') && rendimiento >= 1.5) d += 25;
      if (a.rasgo === 'Temperamental' || b.rasgo === 'Temperamental' || a.rasgo === 'Diva' || b.rasgo === 'Diva') d -= 6;
      if (a.rasgo === 'Colaborativo' || b.rasgo === 'Colaborativo' || a.rasgo === 'Amable' || b.rasgo === 'Amable') d += 5;
      cambiarRelacion(a, b, d);
    }
  }
  // Ingresos de carrera (dólares de hoy) al firmar
  function pagarA(id, monto) { const t = porId(id); if (t && monto > 0) t.gan = Math.round((t.gan || 0) + IA.mundo.aHoy(monto, N.anio())); }

  // ---------- Contratos exclusivos (el salario anual sigue a la época: sale de la tarifa) ----------
  function salarioExclusivo(t) { return Math.round(tarifa(t) * 1.8); }
  function puedeExclusivo(t, estId) {
    if (!t || t.ret || t.mu) return 'No está activo.';
    const ex = exclusivoDe(t);
    if (ex !== null) return ex === estId ? 'Ya es exclusivo de tu estudio.' : 'Es exclusivo de ' + N.S.estudios[ex].nombre + '.';
    const est = N.S.estudios[estId];
    if (t.fama - est.fama > 0.45) return 'Tu estudio todavía no le interesa para algo exclusivo.';
    if (moral(t) < 35) return 'Está desmotivado y no quiere atarse.';
    return '';
  }
  function firmarExclusivo(t, estId, anios) {
    t.ex = estId; t.exH = N.S.t + 52 * anios; t.exS = salarioExclusivo(t);
    cambiarMoral(t, 10);
  }
  // Pagos mensuales de los exclusivos de cada estudio
  function mensual(ctx) {
    const S = N.S;
    for (let i = 0; i < S.talentos.length; i++) {
      const t = S.talentos[i];
      if (t.ex === undefined || t.ex === null) continue;
      if (t.exH <= S.t || t.ret || t.mu) {
        if (t.ex === 0 && !t.ret && !t.mu) N.emit('noticia', { tipo: 'talento', texto: 'Termina el contrato exclusivo de ' + t.nom + '.' });
        delete t.ex; delete t.exH; delete t.exS;
        continue;
      }
      const m = (t.exS || 0) / 12;
      ctx.pagar(t.ex, 'exclusivos', m);
      t.gan = Math.round((t.gan || 0) + IA.mundo.aHoy(m, N.anio()));
    }
  }
  // Comprar la exclusividad que tiene un rival: se le paga lo que falta por 1,3
  function costoLiberar(t) { return Math.round((t.exS || 0) * Math.max(0, t.exH - N.S.t) / 52 * 1.3); }

  // ---------- Academia: taller, especialización y maestría (hasta +5 por oficio), becas ----------
  const CURSOS = [
    { id: 'taller', nombre: 'Taller intensivo', semanas: 4, gana: [1, 2], min: 0, max: 60, energia: 10, costo: 2 },
    { id: 'especializacion', nombre: 'Especialización', semanas: 10, gana: [2, 3], min: 40, max: 80, energia: 20, costo: 7 },
    { id: 'maestria', nombre: 'Maestría', semanas: 20, gana: [3, 5], min: 60, max: 99, energia: 30, costo: 20 },
  ];
  function curso(id) { return CURSOS.filter(function (c) { return c.id === id; })[0]; }
  function nivelEn(t, area) {
    if (area === t.of) return t.hab;
    if (area.indexOf('fam:') === 0) return 50 + afinidad(t, area.slice(4)) * 5;
    return t.h2 && t.h2[area] ? t.h2[area] : 20;
  }
  function costoCurso(t, c, area) { return Math.round(IA.economia.presupuestoTipico(N.anio()) * 0.0006 * c.costo * Math.max(0.25, Math.pow(nivelEn(t, area) / 50, 2))); }
  function puedeEstudiar(t, c, area) {
    if (!t || t.ret || t.mu) return 'Está retirado.';
    if (estudiando(t)) return 'Ya está estudiando.';
    if ((t.act || 0) > 0) return 'Está trabajando en un proyecto.';
    const n = nivelEn(t, area);
    if (n < c.min) return 'Requiere nivel ' + c.min + ' o más.';
    if (n >= c.max) return 'Su nivel supera este programa (hasta ' + (c.max - 1) + ').';
    if (area.indexOf('fam:') !== 0 && ((t.ac && t.ac[area]) || 0) >= MAX_ACADEMIA) return 'Ya ganó los +5 que se pueden estudiar en este oficio.';
    if (energia(t) < c.energia) return 'Sin energía (necesita ' + c.energia + ').';
    const ex = exclusivoDe(t);
    if (ex !== null && ex !== 0) return 'Es exclusivo de otro estudio.';
    return '';
  }
  // Inscribe a un talento; si paga el jugador es una beca (lealtad: −10 % de tarifa y mejor moral)
  function inscribir(t, c, area, beca) {
    gastarEnergia(t, c.energia);
    t.es = { c: c.id, a: area, fin: N.S.t + c.semanas, b: beca ? 1 : 0 };
    if (beca) { t.beca = N.S.t + 52 * 5; cambiarMoral(t, 15); }
  }
  function graduar(t) {
    const e = t.es, c = curso(e.c);
    delete t.es;
    if (!c || t.ret || t.mu) return null;
    let d = N.entero(c.gana[0], c.gana[1]);
    if (e.a.indexOf('fam:') === 0) {
      const i = D.ORDEN_FAM.indexOf(e.a.slice(4));
      d = Math.min(d, 8 - t.af[i]);
      t.af[i] += Math.max(0, d);
    } else {
      t.ac = t.ac || {};
      d = Math.min(d, MAX_ACADEMIA - (t.ac[e.a] || 0), 99 - nivelEn(t, e.a));
      d = Math.max(0, d);
      t.ac[e.a] = (t.ac[e.a] || 0) + d;
      if (e.a === t.of) { t.hab = Math.min(99, t.hab + d); t.pot = Math.min(99, Math.max(t.pot, t.hab)); }
      else {
        t.h2 = t.h2 || {};
        t.h2[e.a] = Math.min(99, nivelEn(t, e.a) + d);
        // Cambio de oficio: si el nuevo ya supera al de siempre (poco probable)
        if (t.h2[e.a] > t.hab + 3) { const viejo = t.of, hv = t.hab; t.of = e.a; t.hab = t.h2[e.a]; delete t.h2[e.a]; t.h2[viejo] = hv; d = -d; reindexar(); }
      }
    }
    return { curso: c, delta: d, area: e.a, beca: e.b };
  }
  // Una semana de academia: quienes terminan se gradúan
  function semanaAcademia() {
    const S = N.S, out = [];
    for (let i = 0; i < S.talentos.length; i++) {
      const t = S.talentos[i];
      if (t.es && t.es.fin <= S.t) { const r = graduar(t); if (r) out.push({ t: t, r: r }); }
    }
    return out;
  }

  // ---------- Descubrir promesas jóvenes ----------
  function descubrir(of) {
    const anio = N.anio(), out = [];
    for (let i = 0; i < 3; i++) {
      const o = of || N.elegir(D.oficios.map(function (x) { return x.id; }));
      const nino = o === 'interprete' && N.probabilidad(0.3);
      const t = crear(o, nino ? N.entero(8, 14) : N.entero(18, 23), anio, { pot: N.entero(74, 94), pasado: false });
      t.desc = 1;
      cambiarMoral(t, 15);
      N.S.talentos.push(t);
      out.push(t);
    }
    reindexar();
    return out;
  }
  // El potencial solo se conoce de verdad si lo descubriste o si trabajó contigo
  function potencialConocido(t) { return !!(t.desc || t.beca || (t.hist && t.hist.length)); }

  // ---------- Una vez al año: edades, crecimiento, retiro, regresos, muertes y nuevas generaciones ----------
  function anual() {
    const S = N.S, anio = N.anio();
    const conteo = {};
    for (let i = 0; i < S.talentos.length; i++) {
      const t = S.talentos[i];
      if (t.mu) continue;
      const e = anio - t.nac;
      // Muerte poco probable a cualquier edad
      const pMuerte = 0.0008 + (e > 60 ? (e - 60) * 0.0012 : 0) + (e > 85 ? (e - 85) * 0.006 : 0);
      if (N.probabilidad(pMuerte) || e >= 105) {
        t.mu = anio; if (!t.ret) t.ret = anio;
        if (t.fama > 0.35 || t.premios > 0) N.emit('noticia', { tipo: 'talento', texto: 'Fallece ' + t.nom + ' a los ' + e + ' años.', importante: t.fama > 0.6 });
        continue;
      }
      if (t.ret) {
        // Regresos: a veces vuelven antes de los 90
        if (e < 90 && anio - t.ret >= 2 && N.probabilidad(0.03)) {
          t.ret = 0; t.vu = (t.vu || 0) + 1; t.act = 0; t.fama = N.redondear(Math.min(1, t.fama + 0.05), 3);
          if (t.fama > 0.3) N.emit('noticia', { tipo: 'talento', texto: t.nom + ' vuelve a trabajar a los ' + e + ' años.' });
          conteo[t.of] = (conteo[t.of] || 0) + 1;
        }
        continue;
      }
      const objetivo = habilidadPorEdad(t.pot, e, t.of) + ((t.ac && t.ac[t.of]) || 0) * 0.5;
      t.hab = Math.round(N.limitar(t.hab + (objetivo - t.hab) * 0.3 + N.normal(0, 1), 5, 99) * 10) / 10;
      t.fama = N.redondear(t.fama * (ocupado(t) || t.ocup >= S.t - 52 ? 0.98 : 0.94), 3);
      t.apr = Math.round((t.apr || 50) + (50 - (t.apr || 50)) * 0.1); // el público olvida despacio
      if (e === 16 && t.cmax === 2 && N.probabilidad(0.6)) t.cmax = 4; // al crecer aceptan más
      if (e === 18 && t.cmax <= 4) t.cmax = N.probabilidad(0.5) ? 7 : 6;
      // Retiro entre los 70 y los 100
      const pRetiro = e < 70 ? 0 : (e - 68) / 32;
      if (e >= 100 || (!ocupado(t) && N.probabilidad(pRetiro))) {
        t.ret = anio; delete t.ex;
        if (t.fama > 0.35) N.emit('noticia', { tipo: 'talento', texto: t.nom + ' se retira a los ' + e + ' años.' });
        continue;
      }
      conteo[t.of] = (conteo[t.of] || 0) + 1;
    }
    Object.keys(D.poblacionTalentos).forEach(function (of) {
      const falta = D.poblacionTalentos[of] - (conteo[of] || 0);
      const extra = N.entero(0, 2);
      for (let i = 0; i < falta + extra; i++) S.talentos.push(crear(of, N.entero(18, 26), anio));
    });
    // Siempre hay niños actores (un 3 % de los intérpretes) para los papeles infantiles
    const ninos = S.talentos.filter(function (t) { return !t.ret && t.of === 'interprete' && anio - t.nac < 16; }).length;
    for (let i = ninos; i < Math.round(D.poblacionTalentos.interprete * 0.03); i++) S.talentos.push(crear('interprete', N.entero(7, 12), anio));
    // Historial compacto: se borran los retirados hace más de 25 años (sus nombres quedan en los créditos)
    S.talentos = S.talentos.filter(function (t) { return !t.ret || anio - t.ret < 25 || t.premios > 0; });
    // Las relaciones con quien ya no está se olvidan
    reindexar();
    S.talentos.forEach(function (t) { if (t.rel) Object.keys(t.rel).forEach(function (k) { if (!indice[k]) delete t.rel[k]; }); });
  }
  // Los rivales firman exclusivos con algunas estrellas libres
  function exclusivosRivales() {
    const S = N.S;
    for (let i = 1; i < S.estudios.length; i++) {
      const est = S.estudios[i];
      if (est.quebrado) continue;
      const tienen = S.talentos.filter(function (t) { return exclusivoDe(t) === i; }).length;
      if (tienen >= 2 || est.caja < IA.economia.presupuestoTipico(N.anio()) * est.tam * 8 || !N.probabilidad(0.35)) continue;
      const cand = S.talentos.filter(function (t) { return !t.ret && !t.mu && exclusivoDe(t) === null && t.fama >= 0.35 && t.fama - est.fama < 0.45 && t.of === 'interprete'; })
        .sort(function (a, b) { return b.fama - a.fama; }).slice(0, 5);
      if (!cand.length) continue;
      const t = N.elegir(cand);
      firmarExclusivo(t, i, N.entero(1, 3));
      if (t.fama > 0.5) N.emit('noticia', { tipo: 'rival', texto: est.nombre + ' firma un contrato exclusivo con ' + t.nom + '.' });
    }
  }

  // Nombre del oficio con el género de la persona (escritora, directora, diseñadora de arte…)
  const FEMENINO = { Escritor: 'Escritora', Director: 'Directora', Productor: 'Productora', Compositor: 'Compositora', Editor: 'Editora', 'Diseñador de arte y tecnología': 'Diseñadora de arte y tecnología',
    'Diseñador de vestuario': 'Diseñadora de vestuario', 'Supervisor de efectos': 'Supervisora de efectos', Animador: 'Animadora' };
  function nombreOficio(t, of) {
    let n = D.oficio(of || t.of).nombre;
    if (n === 'Fotografía') n = 'Director de fotografía'; // la persona, no el departamento
    if (t && t.sx === 'F') n = n === 'Director de fotografía' ? 'Directora de fotografía' : FEMENINO[n] || n;
    return n;
  }
  // ---------- Biografía (se escribe con los datos de cada uno) ----------
  function biografia(t) {
    const p = D.pais(t.pais), e = N.anio() - t.nac;
    const of = nombreOficio(t).toLowerCase();
    const ejes = t.af ? t.af.map(function (v, i) { return [v, EJES[i]]; }).sort(function (a, b) { return b[0] - a[0]; }) : [];
    let s = 'Nació en ' + t.nac + ' en ' + (p ? p.nombre : 'algún lugar') + '. ';
    s += (t.mu ? 'Fue ' : 'Es ') + of + (t.h2 ? ' y también se desenvuelve como ' + Object.keys(t.h2).map(function (k) { return nombreOficio(t, k).toLowerCase(); }).join(' y ') : '') + '. ';
    if (ejes.length && ejes[0][0] >= 3) s += 'Brilla en ' + ejes[0][1].toLowerCase() + (ejes[1][0] >= 3 ? ' y ' + ejes[1][1].toLowerCase() : '') + '. ';
    if (ejes.length && ejes[7][0] <= -3) s += 'Le cuesta ' + ejes[7][1].toLowerCase() + '. ';
    if (t.idi) s += 'Habla ' + t.idi.map(function (x) { return x.toLowerCase(); }).join(', ').replace(/, ([^,]*)$/, ' y $1') + '. ';
    if (t.obras) s += 'Lleva ' + t.obras + ' obra' + (t.obras > 1 ? 's' : '') + (t.exitos ? (t.exitos === 1 ? ', una de ellas un éxito' : ', ' + t.exitos + ' de ellas éxitos') : '') + (t.premios ? ', y ' + t.premios + ' premio' + (t.premios > 1 ? 's' : '') : '') + '. ';
    else s += e < 18 ? 'Es una promesa que todavía no debuta. ' : 'Todavía no tiene obras en su carrera. ';
    if (t.vu) s += 'Volvió del retiro' + (t.vu > 1 ? ' ' + t.vu + ' veces' : '') + '. ';
    if (t.ret && !t.mu) s += 'Se retiró en ' + t.ret + '. ';
    if (t.mu) s += 'Falleció en ' + t.mu + '. ';
    return s.trim();
  }

  return {
    CAPACIDADES: CAPACIDADES, EJES: EJES, MEDIOS: MEDIOS, CURSOS: CURSOS, MAX_ACADEMIA: MAX_ACADEMIA, ENERGIA_CARGO: ENERGIA_CARGO, MAX_PROYECTOS: MAX_PROYECTOS,
    reindexar: reindexar, porId: porId, crear: crear, completar: completar, generarInicial: generarInicial, poblarOficios: poblarOficios, edad: edad,
    disponible: disponible, ocupado: ocupado, tarifa: tarifa, tarifaPara: tarifaPara, activos: activos, disponibles: disponibles,
    mejorDisponible: mejorDisponible, ocupar: ocupar, liberar: liberar, cansancio: cansancio, trasEstreno: trasEstreno, anual: anual,
    NIVELES: NIVELES, nivel: nivel, faltaPrestigio: faltaPrestigio, crearPropio: crearPropio, nombreNuevo: nombreNuevo, energia: energia, moral: moral, cambiarMoral: cambiarMoral, exclusivoDe: exclusivoDe, estudiando: estudiando,
    personalidad: personalidad, impulso: impulso, overall: overall, capacidad: capacidad, afinidad: afinidad, famaRegion: famaRegion,
    ventajas: ventajas, perfilExtra: perfilExtra, habilidadEn: habilidadEn, negociar: negociar, salarioCon: salarioCon,
    relacion: relacion, tipoRelacion: tipoRelacion, cambiarRelacion: cambiarRelacion, quimica: quimica, pagarA: pagarA,
    salarioExclusivo: salarioExclusivo, puedeExclusivo: puedeExclusivo, firmarExclusivo: firmarExclusivo, mensual: mensual, costoLiberar: costoLiberar,
    curso: curso, nivelEn: nivelEn, costoCurso: costoCurso, puedeEstudiar: puedeEstudiar, inscribir: inscribir, semanaAcademia: semanaAcademia,
    descubrir: descubrir, potencialConocido: potencialConocido, exclusivosRivales: exclusivosRivales, biografia: biografia, nombreOficio: nombreOficio,
  };
})();
