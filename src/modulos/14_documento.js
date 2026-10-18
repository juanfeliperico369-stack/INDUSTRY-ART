/* ==== módulo: documento ==== */
// El documento de la idea: descarga en Word (.docx) la trama completa de una obra (planteamiento, nudo y
// desenlace según su arco, escaleta, personajes, temas y premisas) y sus datos técnicos (equipo, presupuesto, rodaje,
// contenido y resultados), con el póster, la curva del arco y las notas del autor. Así el juego también sirve para
// desarrollar ideas. El .docx se arma a mano (XML de Office dentro de un ZIP sin comprimir): sin librerías ni internet.
// El texto usa su propio azar (sale del título), así que generar el documento nunca cambia la partida.
ART.documento = (function () {
  'use strict';
  const N = ART.n, D = ART.datos, X = ART.taxonomia;
  const I = function () { return ART.ideas; };
  function v(o, k, d) { return o[k] === undefined || o[k] === null ? d : o[k]; }
  function tr(s) { return ART.idioma ? ART.idioma.texto(s) : s; } // en inglés, lo que el diccionario conozca
  function generoTxt(sx, t) { return t.split('{la}').join(sx === 'F' ? 'la' : 'lo').split('{a}').join(sx === 'F' ? 'a' : 'o'); }
  function lista(l) { return l.length > 1 ? l.slice(0, -1).join(', ') + ' y ' + l[l.length - 1] : l[0] || ''; }
  function minus(t) { return /^[A-ZÁÉÍÓÚ]{2}|^(Dios|IA)$/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  function lugarDe(o) {
    if (!o.lug) return '';
    const p = D.pais(o.lug);
    if (p) return p.nombre;
    return (X.lugaresExtra.filter(function (l) { return l.id === o.lug; })[0] || {}).nombre || '';
  }

  // ---------- La ficha de la idea (también la usa la ficha de la obra en pantalla) ----------
  function filasIdea(o) {
    const filas = [];
    filas.push(['Tipo', X.tipoCine(o.tipo || 'real').nombre + ' · ' + (o.nat === 'r' ? 'realidad' : 'ficción') + ' · clase ' + I().clase(o) + ' · obra ' + I().perfil(o)]);
    if (o.gen && o.gen.length) filas.push(['Géneros', o.gen.join(', ')]);
    if (o.tem && o.tem.length) filas.push(['Temas', o.tem.join(', ')]);
    if (o.sub && o.sub.length) filas.push(['Subgéneros', o.sub.join(', ')]);
    if (o.prob && o.prob.length) filas.push(['Problemática', o.prob.join(', ')]);
    if (o.arco) filas.push(['Arco', X.arco(o.arco).nombre + ' (' + X.arco(o.arco).orig + ')' + (o.sarc && o.sarc.length ? ' · ' + o.sarc.map(function (s) { return X.subarco(s).nombre; }).join(', ') : '')]);
    if (o.pre && o.pre.length) filas.push(['Premisas', o.pre.join(', ')]);
    if (o.epo) filas.push(['Época y lugar', X.epoca(o.epo).nombre + (o.lug ? ' · ' + lugarDe(o) : '')]);
    if (o.idio) filas.push(['Idioma', o.idio + (o.rod && D.pais(o.rod) ? ' · rodada en ' + D.pais(o.rod).nombre : '')]);
    if (o.min) filas.push(['Forma', o.min + ' min · ' + X.complejidad[v(o, 'cx', 2)] + ' · ritmo ' + X.ritmo[v(o, 'rit', 2)].id.toLowerCase() + ' · efectos: ' + X.efectos[v(o, 'fx', 2)].id.toLowerCase() + (o.fxr ? ' (' + o.fxr + ')' : '')]);
    if (o.corr || o.estilo) filas.push(['Estilo', (o.corr || X.ESTANDAR) + ' · ' + (o.estilo || 'General') + ' · prioridad ' + X.prioridad(o.prio).nombre.toLowerCase()]);
    if (o.cont) filas.push(['Contenido', I().describirContenido(o)]);
    if (o.clas) filas.push(['Clasificación', o.clas]);
    if (o.pubs && o.pubs.length) filas.push(['Público', o.pubs.join(', ')]);
    if (o.mat) { const m = X.material(o.mat); if (m) filas.push(['Material', '«' + m.tit + '», ' + m.autor + (o.suave ? ' (adaptada con guiños)' : '')]); }
    if (o.guionC) filas.push(['Guion', 'Comprado, calificación ' + o.guionC]);
    if (o.ideaIA) filas.push(['Idea', 'Automática con IA']);
    if (o.ia) filas.push(['IA en producción', o.ia + ' %' + (o.iar ? ' · resultado ' + o.iar : '')]);
    if ((o.et === 'cartelera' || o.et === 'terminada') && o.frc) filas.push(['La crítica', '«' + o.frc + '»']);
    if ((o.aw || []).length && o.frp) filas.push(['Al premiarla', '«' + o.frp + '»']);
    return filas;
  }

  // ---------- Azar propio del documento (mulberry32 con la semilla del título) ----------
  function azarDe(o) {
    let h = N.hash(String(o.id || 0) + '|' + (o.tit || '')) >>> 0;
    return function () { h = (h + 0x6D2B79F5) >>> 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // ---------- La trama: planteamiento, nudo y desenlace siguiendo la curva de fortuna del arco ----------
  const MALOS = ['Villano', 'Sombra', 'Rival', 'Embaucador', 'Gobernante', 'Cambiante'];
  // Lo que le pasa al protagonista en cada tramo (siempre con él o ella como sujeto)
  const SUBE = ['ve cómo las cosas empiezan a salirle bien', 'consigue lo que parecía imposible', 'gana aliados y confianza', 'encuentra una salida que nadie vio', 'por fin tiene algo que perder'];
  const BAJA = ['lo pierde todo de golpe', 'pierde lo que había ganado', 'recibe un golpe que no esperaba', 'paga caro un error', 'queda más sol{a} que nunca'];
  const IGUAL = ['choca con un conflicto que no se resuelve', 'siente que cada paso cuesta el doble', 've cómo el tiempo se le acaba'];
  function descriptor(p) {
    const a = X.arquetipos.filter(function (x) { return x.id === p.a; })[0];
    const d = a ? a[p.s === 'F' ? 'f' : 'm'] : (p.s === 'F' ? 'una mujer' : 'un hombre');
    return p.e && p.e < 35 ? d.replace(/\bviej([oa])\b/, 'joven') : d; // un mentor de 19 años no es «un viejo maestro»
  }
  function personajesDe(o) {
    const pj = o.pj || [];
    const prot = pj.filter(function (p) { return p.i === 'protagonista'; });
    const sec = pj.filter(function (p) { return p.i === 'secundario'; });
    return {
      prot: prot[0] || { n: '', s: 'M', a: 'Héroe', e: 30, i: 'protagonista' }, prot2: prot[1] || null,
      malo: sec.filter(function (p) { return MALOS.indexOf(p.a) >= 0; })[0] || null,
      aliado: sec.filter(function (p) { return MALOS.indexOf(p.a) < 0; })[0] || null,
    };
  }
  function nivel(f) { return f >= 0.7 ? 'alto' : f <= 0.3 ? 'bajo' : 'medio'; }
  function trama(o) {
    const az = azarDe(o), elegir = function (l) { return l[Math.floor(az() * l.length)]; };
    const P = personajesDe(o), pr = P.prot, sx = pr.s, g = function (t) { return generoTxt(sx, t); };
    const nombre = pr.n || 'Su protagonista';
    const arco = o.arco ? X.arco(o.arco) : null;
    const forma = arco ? arco.forma : [0.5, 0.25, 0.75];
    const probs = (o.prob && o.prob.length ? o.prob : ['La búsqueda']).map(function (p) { return g(X.fraseProblema(p)); });
    const ep = X.epoca(o.epo || 'actualidad'), lugar = lugarDe(o);
    const cuando = (ep.id === 'actualidad' ? 'Hoy' : ep.texto) + (lugar ? ', en ' + lugar : '');
    const g0 = (o.gen || ['Drama'])[0], ofi = X.oficiosGenero[g0];
    const quien = ofi ? ofi[sx === 'F' ? 1 : 0] : descriptor(pr);
    const actos = [];
    // Acto I · Planteamiento
    const inicio = { alto: 'parece tenerlo todo', bajo: 'apenas sobrevive con lo poco que tiene', medio: 'lleva una vida tranquila que está a punto de romperse' }[nivel(forma[0])];
    const a1 = [cuando + ', ' + nombre + ', ' + quien + (pr.e ? ' de ' + pr.e + ' años' : '') + ', ' + inicio + '.',
      'Todo cambia el día en que ' + nombre + ' ' + probs[0] + '.'];
    if (P.aliado) a1.push('A su lado aparece ' + P.aliado.n + ', ' + descriptor(P.aliado) + ', que será clave para seguir adelante.');
    if (P.prot2) a1.push('Su camino se cruza con el de ' + P.prot2.n + ', ' + descriptor(P.prot2) + ': desde ese momento, sus historias ya no se separan.');
    if (P.malo) a1.push('Enfrente está ' + P.malo.n + ', ' + descriptor(P.malo) + ', que tiene sus propios planes.');
    actos.push({ titulo: 'Acto I · Planteamiento', parrafos: a1 });
    // Acto II · Confrontación: un movimiento por cada tramo de la curva
    const a2 = [], escaleta = [['Detonante', nombre + ' ' + probs[0] + '.', forma[0]]];
    const tramos = forma.length - 2;
    const MOMENTOS = tramos === 1 ? ['Punto medio'] : tramos === 2 ? ['Primer giro', 'Punto medio'] : ['Primer giro', 'Punto medio', 'Crisis', 'Complicación', 'Complicación'];
    for (let i = 1; i < forma.length - 1; i++) {
      const d = forma[i] - forma[i - 1];
      const mov = d > 0.08 ? elegir(SUBE) : d < -0.08 ? elegir(BAJA) : elegir(IGUAL);
      // El aliado y el antagonista entran en los giros: ayudan cuando sube, aprovechan cuando cae
      const otro = d > 0.08 && P.aliado ? elegir([' Con la ayuda de ' + P.aliado.n + ', recupera el rumbo.', ' ' + P.aliado.n + ' le muestra el camino.'])
        : d < -0.08 && P.malo ? elegir([' ' + P.malo.n + ' aprovecha su momento de debilidad.', ' Detrás de todo está la mano de ' + P.malo.n + '.']) : '';
      const extra = probs[i] ? ' Además, ' + nombre + ' ' + probs[i] + '.' : '';
      a2.push((i === 1 ? 'Al principio, ' + nombre + ' ' : i === forma.length - 2 ? 'Cerca del final, ' + nombre + ' ' : 'Después, ' + nombre + ' ') + g(mov) + '.' + otro + extra);
      escaleta.push([MOMENTOS[i - 1] || 'Complicación', g(mov).replace(/^./, function (c) { return c.toUpperCase(); }) + '.', forma[i]]);
    }
    if (o.pre && o.pre.length) a2.push('El relato juega con ' + lista(o.pre.map(function (p) { return '«' + p + '»'; })) + (o.pre.length > 1 ? ', que dan' : ', que da') + ' forma a sus escenas más recordadas.');
    if (o.sarc && o.sarc.length) a2.push('En paralelo ' + (o.sarc.length > 1 ? 'corren dos tramas secundarias: ' : 'corre una trama secundaria: ') + lista(o.sarc.map(function (s) { return '«' + X.subarco(s).nombre + '»'; })) + '.');
    if (P.malo) a2.push(P.malo.n + ' aprieta cada vez más, y ' + nombre + ' tiene que decidir hasta dónde está dispuest' + (sx === 'F' ? 'a' : 'o') + ' a llegar.');
    actos.push({ titulo: 'Acto II · Confrontación', parrafos: a2.length ? a2 : ['El conflicto crece y cada decisión cuesta más.'] });
    // Acto III · Desenlace
    const fin = forma[forma.length - 1];
    const a3 = ['En el desenlace, ' + nombre + ' ' + (arco ? g(arco.final) : (fin >= 0.5 ? 'sale adelante' : 'paga el precio de sus decisiones')) + '.'];
    if (P.malo) a3.push(fin >= 0.5 ? 'El enfrentamiento con ' + P.malo.n + ' se resuelve a su favor, aunque nada vuelve a ser igual.' : P.malo.n + ' se sale con la suya, y esa derrota es el corazón de la historia.');
    const temas = (o.tem || []).slice(0, 3).map(minus);
    if (temas.length) a3.push('Al terminar, queda una idea en el aire: una historia sobre ' + lista(temas) + '.');
    actos.push({ titulo: 'Acto III · Desenlace', parrafos: a3 });
    escaleta.push(['Clímax', P.malo ? 'El choque final con ' + P.malo.n + '.' : 'La decisión que lo define todo.', forma[Math.max(0, forma.length - 2)] * 0.5 + fin * 0.5]);
    escaleta.push(['Final', (arco ? g(arco.final) : 'La historia se cierra').replace(/^y /, '').replace(/^./, function (c) { return c.toUpperCase(); }) + '.', fin]);
    return { cuando: cuando, actos: actos, escaleta: escaleta, forma: forma, arco: arco };
  }

  // ---------- Datos técnicos ----------
  function nombreTalento(id) { const t = id !== undefined && id !== null ? ART.talentos.porId(id) : null; return t ? t.nom : ''; }
  function equipo(o) {
    const eq = o.eq || {}, filas = [];
    ART.obras.TODOS_ROLES.forEach(function (r) { const n = nombreTalento(eq[r]); if (n) filas.push([D.oficio(r).dep, n]); });
    const ints = (eq.int || []).map(nombreTalento).filter(Boolean);
    if (ints.length) filas.push(['Reparto', ints.join(', ')]);
    return filas;
  }
  function tecnicos(o) {
    const din = function (x) { return ART.ui ? ART.ui.dinero(x) : '$' + Math.round(x); };
    const f = [];
    if (o.med) f.push(['Medio', (X.medios.filter(function (m) { return m.id === o.med; })[0] || { nombre: o.med }).nombre]);
    if (o.et) f.push(['Etapa', ART.obras.NOMBRE_ETAPA[o.et] || o.et]);
    if (o.pp) f.push(['Presupuesto de producción', din(o.pp)]);
    if (o.cf) f.push(['Contratos de talento', din(o.cf)]);
    if (o.cm) f.push(['Marketing', din(o.cm)]);
    if (o.met && ART.rodaje.metodo) { const m = ART.rodaje.metodo(o.met); if (m) f.push(['Cómo se filma', m.nombre]); }
    if (o.ter && ART.rodaje.terreno) { const t = ART.rodaje.terreno(o.ter); if (t) f.push(['Terreno de la locación', t.nombre]); }
    if (o.pst && ART.rodaje.estilo) { const e = ART.rodaje.estilo(o.pst); if (e) f.push(['Estilo de producción', e.nombre]); }
    if (o.fmt) f.push(['Formato', typeof o.fmt === 'object' ? [o.fmt.color, o.fmt.visual, o.fmt.sonido].filter(Boolean).join(' · ') : String(o.fmt)]);
    if (o.extras !== undefined) f.push(['Extras y figurantes', (o.extras || 0) + ' extras · ' + (o.terceros || 0) + ' terceros']);
    if (o.notas) f.push(['Notas por departamento', Object.keys(o.notas).map(function (k) { return (D.oficio(k) ? D.oficio(k).dep : k) + ' ' + o.notas[k]; }).join(' · ')]);
    if (o.fe && (o.et === 'cartelera' || o.et === 'terminada' || o.prog)) f.push(['Estreno', ART.ui ? ART.ui.fecha(o.fe) : String(o.fe)]);
    if (o.bruto) f.push(['Taquilla', din(o.bruto) + ' · multiplicador ×' + ART.obras.multiplicador(o).toFixed(2)]);
    if (o.crit !== undefined && (o.et === 'cartelera' || o.et === 'terminada')) f.push(['Crítica y público', o.crit + ' / ' + o.pub]);
    if ((o.aw || []).length) f.push(['Premios', o.aw.length + '']);
    if (o.cert) f.push(['Certificación', o.cert]);
    return f;
  }

  // ---------- Texto plano (para copiar o leer en pantalla) ----------
  function texto(o) {
    const tm = trama(o), est = N.S && N.S.estudios[o.est || 0];
    const l = [tr(o.tit || 'Sin título').toUpperCase(), tr('Una idea de ') + (est ? est.nombre : '') + ' · INDUSTRY ART', ''];
    if (o.sin) l.push(tr('Sinopsis'), tr(o.sin), '');
    l.push(tr('La idea'));
    filasIdea(o).forEach(function (f) { l.push('- ' + tr(f[0]) + ': ' + tr(f[1])); });
    l.push('', tr('La trama'));
    tm.actos.forEach(function (a) { l.push('', tr(a.titulo)); a.parrafos.forEach(function (p) { l.push(tr(p)); }); });
    l.push('', tr('Escaleta'));
    tm.escaleta.forEach(function (x, i) { l.push((i + 1) + '. ' + tr(x[0]) + ': ' + tr(x[1])); });
    if (o.pj && o.pj.length) { l.push('', tr('Personajes')); o.pj.forEach(function (p) { l.push('- ' + p.n + ', ' + p.e + ' · ' + tr(p.a) + ' · ' + tr(descriptor(p))); }); }
    const eq = equipo(o), tc = tecnicos(o);
    if (eq.length) { l.push('', tr('Equipo')); eq.forEach(function (f) { l.push('- ' + tr(f[0]) + ': ' + f[1]); }); }
    if (tc.length) { l.push('', tr('Datos técnicos')); tc.forEach(function (f) { l.push('- ' + tr(f[0]) + ': ' + tr(f[1])); }); }
    if (o.diario) l.push('', tr('Notas del autor'), o.diario);
    return l.join('\n');
  }

  // ---------- Imágenes: póster y curva del arco (PNG), solo donde hay canvas ----------
  function pngDe(cv, jpg) {
    const b64 = cv.toDataURL(jpg ? 'image/jpeg' : 'image/png', 0.9).split(',')[1], s = atob(b64), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function lienzo(w, h) { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function imagenPoster(o) {
    const cv = lienzo(600, 900);
    if (!cv || !ART.arte || !N.S || !o.gen) return null;
    try { const c = cv.getContext('2d'); c.scale(1.5, 1.5); ART.arte.poster(c, 400, 600, ART.obras.paraPoster(Object.assign({}, o, { id: o.id || N.hash(o.tit || 'idea') }))); return { datos: pngDe(cv, true), ext: 'jpeg' }; } catch (e) { return null; }
  }
  function imagenCurva(tm) {
    const cv = lienzo(1200, 420);
    if (!cv) return null;
    const c = cv.getContext('2d'), f = tm.forma, W = 1200, H = 420, m = 50;
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#d9dee8'; c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = m + (H - 2 * m) * i / 4; c.beginPath(); c.moveTo(m, y); c.lineTo(W - m, y); c.stroke(); }
    c.fillStyle = '#5b6478'; c.font = '22px sans-serif'; c.fillText(tr('Fortuna'), 8, 30);
    const px = function (i) { return m + (W - 2 * m) * i / (f.length - 1); }, py = function (y) { return H - m - (H - 2 * m) * y; };
    // curva suave entre los puntos del arco
    c.strokeStyle = '#1aa39a'; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i < f.length; i++) { const x = px(i), y = py(f[i]); if (!i) c.moveTo(x, y); else { const x0 = px(i - 1), y0 = py(f[i - 1]); c.bezierCurveTo((x0 + x) / 2, y0, (x0 + x) / 2, y, x, y); } }
    c.stroke();
    c.fillStyle = '#c8941a';
    f.forEach(function (y, i) { c.beginPath(); c.arc(px(i), py(y), 9, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = '#1b2033'; c.font = 'bold 24px sans-serif'; c.textAlign = 'center';
    c.fillText(tm.arco ? tr(tm.arco.nombre) : tr('Arco libre'), W / 2, 34);
    return { datos: pngDe(cv), ext: 'png' };
  }

  // ---------- ZIP sin comprimir (lo que necesita un .docx) ----------
  const CRC = (function () { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t.push(c >>> 0); } return t; })();
  function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zip(archivos) {
    const enc = new TextEncoder(), partes = [], central = [];
    let pos = 0;
    const u16 = function (a, x) { a.push(x & 255, (x >>> 8) & 255); }, u32 = function (a, x) { a.push(x & 255, (x >>> 8) & 255, (x >>> 16) & 255, (x >>> 24) & 255); };
    archivos.forEach(function (f) {
      const nombre = enc.encode(f.nombre), datos = typeof f.datos === 'string' ? enc.encode(f.datos) : f.datos, crc = crc32(datos);
      const h = []; u32(h, 0x04034b50); u16(h, 20); u16(h, 0x0800); u16(h, 0); u16(h, 0); u16(h, 0x21); u32(h, crc); u32(h, datos.length); u32(h, datos.length); u16(h, nombre.length); u16(h, 0);
      partes.push(new Uint8Array(h), nombre, datos);
      const c = []; u32(c, 0x02014b50); u16(c, 20); u16(c, 20); u16(c, 0x0800); u16(c, 0); u16(c, 0); u16(c, 0x21); u32(c, crc); u32(c, datos.length); u32(c, datos.length);
      u16(c, nombre.length); u16(c, 0); u16(c, 0); u16(c, 0); u16(c, 0); u32(c, 0); u32(c, pos);
      central.push(new Uint8Array(c), nombre);
      pos += h.length + nombre.length + datos.length;
    });
    const tamCentral = central.reduce(function (s, x) { return s + x.length; }, 0);
    const fin = []; u32(fin, 0x06054b50); u16(fin, 0); u16(fin, 0); u16(fin, archivos.length); u16(fin, archivos.length); u32(fin, tamCentral); u32(fin, pos); u16(fin, 0);
    const todo = partes.concat(central, [new Uint8Array(fin)]);
    const out = new Uint8Array(todo.reduce(function (s, x) { return s + x.length; }, 0));
    let p = 0;
    todo.forEach(function (x) { out.set(x, p); p += x.length; });
    return out;
  }

  // ---------- Word (WordprocessingML) ----------
  function xml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''); }
  function run(t, b, i) { return '<w:r>' + (b || i ? '<w:rPr>' + (b ? '<w:b/>' : '') + (i ? '<w:i/>' : '') + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + xml(tr(t)) + '</w:t></w:r>'; }
  function par(contenido, estilo, centro) { return '<w:p>' + (estilo || centro ? '<w:pPr>' + (estilo ? '<w:pStyle w:val="' + estilo + '"/>' : '') + (centro ? '<w:jc w:val="center"/>' : '') + '</w:pPr>' : '') + contenido + '</w:p>'; }
  function p(t, estilo, centro) { return par(run(t), estilo, centro); }
  function tabla(filas) {
    const borde = '<w:top w:val="single" w:sz="4" w:color="D9DEE8"/><w:bottom w:val="single" w:sz="4" w:color="D9DEE8"/><w:insideH w:val="single" w:sz="4" w:color="D9DEE8"/>';
    return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + borde + '</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="2800"/><w:gridCol w:w="6800"/></w:tblGrid>' +
      filas.map(function (f) { return '<w:tr><w:tc><w:tcPr><w:tcW w:w="1450" w:type="pct"/></w:tcPr>' + par(run(f[0], true)) + '</w:tc><w:tc><w:tcPr><w:tcW w:w="3550" w:type="pct"/></w:tcPr>' + par(run(f[1])) + '</w:tc></w:tr>'; }).join('') + '</w:tbl>' + p('');
  }
  function imagen(rid, n, cx, cy) {
    return '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + n + '" name="Imagen ' + n + '"/>' +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:nvPicPr><pic:cNvPr id="' + n + '" name="imagen' + n + '.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
  }
  const SALTO = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  const ESTILOS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="23"/><w:lang w:val="es-ES"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="1B2033"/><w:sz w:val="56"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:color w:val="5B6478"/><w:sz w:val="26"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="1AA39A"/><w:sz w:val="34"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="C8941A"/><w:sz w:val="27"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="567" w:right="567"/></w:pPr><w:rPr><w:i/><w:color w:val="3A4256"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Small"><w:name w:val="Small"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="7A8296"/><w:sz w:val="18"/></w:rPr></w:style></w:styles>';

  function docx(o) {
    const tm = trama(o), est = N.S && N.S.estudios[o.est || 0], imgs = [];
    const poster = imagenPoster(o), curva = imagenCurva(tm);
    let b = '';
    if (poster) { imgs.push(poster); b += imagen('rIdImg1', 1, 2743200, 4114800); }
    b += p(o.tit || 'Sin título', 'Title');
    b += p((o.gen || []).join(' · ') + (o.clas ? ' · ' + o.clas : '') + (est ? ' · ' + est.nombre : ''), 'Subtitle');
    if (o.sin) b += p(o.sin, 'Quote');
    b += p(tr('Documento de la idea generado por INDUSTRY ART el ') + new Date().toLocaleDateString('es') + (N.S ? ' (' + tr('año del juego') + ' ' + N.anio() + ')' : ''), 'Small', true);
    b += SALTO + p('La idea', 'Heading1') + tabla(filasIdea(o));
    b += p('La trama', 'Heading1');
    tm.actos.forEach(function (a) { b += p(a.titulo, 'Heading2'); a.parrafos.forEach(function (x) { b += p(x); }); });
    if (curva) { imgs.push(curva); b += p('Curva del arco', 'Heading2') + imagen('rIdImg' + imgs.length, imgs.length, 5486400, 1920240); }
    b += p('Escaleta', 'Heading2') + tabla(tm.escaleta.map(function (x, i) { return [(i + 1) + '. ' + x[0], x[1] + ' (' + tr('fortuna') + ' ' + Math.round(x[2] * 100) + ' %)']; }));
    if (o.pj && o.pj.length) {
      b += p('Personajes', 'Heading1');
      o.pj.forEach(function (x) {
        const ta = x.t !== null && x.t !== undefined ? nombreTalento(x.t) : '';
        const imp = (X.importancias.filter(function (y) { return y.id === x.i; })[0] || {}).nombre || '';
        b += par(run(x.n, true) + run(' · ' + imp + ' · ' + x.e + ' ' + tr('años') + ' · ' + (x.s === 'F' ? tr('mujer') : tr('hombre'))));
        b += p(tr('Arquetipo') + ': ' + x.a + ' — ' + descriptor(x) + (ta ? '. ' + tr('Lo interpreta') + ' ' + ta : '') + '.', 'Quote');
      });
      if (o.extras !== undefined) b += p(tr('Además') + ': ' + (o.extras || 0) + ' ' + tr('extras con nombre y') + ' ' + (o.terceros || 0) + ' ' + tr('figurantes') + '.', 'Small');
    }
    const eq = equipo(o);
    if (eq.length) b += p('Equipo creativo', 'Heading1') + tabla(eq);
    const tc = tecnicos(o);
    if (tc.length) b += p('Datos técnicos', 'Heading1') + tabla(tc);
    if (o.diario) { b += p('Notas del autor', 'Heading1'); String(o.diario).split(/\n+/).forEach(function (x) { b += p(x); }); }
    b += p('Ideado y creado por OneZero · INDUSTRY ART ' + ART.VERSION, 'Small', true);
    const ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
    const doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + ns + '><w:body>' + b +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
    const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdEst" Type="' + R + '/styles" Target="styles.xml"/>' +
      imgs.map(function (im, i) { return '<Relationship Id="rIdImg' + (i + 1) + '" Type="' + R + '/image" Target="media/imagen' + (i + 1) + '.' + im.ext + '"/>'; }).join('') + '</Relationships>';
    const ahora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const archivos = [
      { nombre: '[Content_Types].xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
      { nombre: '_rels/.rels', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + R + '/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
      { nombre: 'docProps/core.xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + xml(o.tit || '') + '</dc:title><dc:creator>INDUSTRY ART</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">' + ahora + '</dcterms:created></cp:coreProperties>' },
      { nombre: 'word/document.xml', datos: doc },
      { nombre: 'word/styles.xml', datos: ESTILOS },
      { nombre: 'word/_rels/document.xml.rels', datos: rels },
    ].concat(imgs.map(function (im, i) { return { nombre: 'word/media/imagen' + (i + 1) + '.' + im.ext, datos: im.datos }; }));
    return zip(archivos);
  }
  // Descarga (web y PC) o menú Compartir (app)
  function descargar(o) {
    const nombre = 'Idea - ' + (o.tit || 'sin título') + '.docx';
    return ART.publicacion.guardarArchivo(nombre, docx(o), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }
  // Descarga con su aviso; si no se pudo (y no fue que el jugador cerró el menú), muestra la trama para copiarla
  function descargarYAvisar(o) {
    const U = ART.ui;
    return descargar(o).then(function (r) {
      if (r.ok) U.aviso('Documento listo: ' + (r.ruta || r.nombre));
      else if (!r.cancelado) mostrarTexto(o, 'No se pudo guardar el documento en este aparato. Aquí está la trama completa para copiarla:');
      return r;
    });
  }
  function mostrarTexto(o, aviso) {
    const U = ART.ui, esc = N.esc;
    U.modal('<h2>' + esc(o.tit || '') + '</h2>' + (aviso ? '<p class="mal chico">' + esc(aviso) + '</p>' : '') + '<textarea id="docTextoIdea" rows="16" style="width:100%" readonly>' + esc(texto(o)) + '</textarea>' +
      '<div class="fila envolver"><button class="btn" data-a="docCopiar">Copiar el texto</button><button class="btn" data-a="docTxt" data-v="' + (o.id || '') + '">Guardar como texto (.txt)</button><button class="btn primario" data-a="cerrarModal">' + ART.t('aceptar') + '</button></div>');
  }
  return { filasIdea: filasIdea, trama: trama, texto: texto, docx: docx, zip: zip, crc32: crc32, descargar: descargar, descargarYAvisar: descargarYAvisar, mostrarTexto: mostrarTexto };
})();
