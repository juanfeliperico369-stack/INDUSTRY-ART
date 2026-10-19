/* ==== módulo: titulos ==== */
// Títulos inventados con buena gramática: cada sustantivo trae su género y número, cada adjetivo sus cuatro formas
// y cada complemento su versión en inglés. Así «La noche secreta» nunca sale como «El noche secreto», y en inglés
// el mismo título se lee «The Secret Night». También nombres de bandas, canciones y motores.
ART.titulos = (function () {
  'use strict';
  const N = ART.n;
  // [español, género (m, f, mp, fp), inglés]
  const SUST = [
    ['Noche', 'f', 'Night'], ['Eco', 'm', 'Echo'], ['Frontera', 'f', 'Frontier'], ['Aurora', 'f', 'Dawn'], ['Sombra', 'f', 'Shadow'],
    ['Vértigo', 'm', 'Vertigo'], ['Marea', 'f', 'Tide'], ['Cenizas', 'fp', 'Ashes'], ['Reflejo', 'm', 'Reflection'], ['Horizonte', 'm', 'Horizon'],
    ['Umbral', 'm', 'Threshold'], ['Cometa', 'm', 'Comet'], ['Silencio', 'm', 'Silence'], ['Laberinto', 'm', 'Labyrinth'], ['Faro', 'm', 'Lighthouse'],
    ['Destello', 'm', 'Spark'], ['Tormenta', 'f', 'Storm'], ['Jardín', 'm', 'Garden'], ['Carnaval', 'm', 'Carnival'], ['Espejismo', 'm', 'Mirage'],
    ['Relámpago', 'm', 'Lightning'], ['Abismo', 'm', 'Abyss'], ['Brújula', 'f', 'Compass'], ['Linterna', 'f', 'Lantern'], ['Hierro', 'm', 'Iron'],
    ['Selva', 'f', 'Jungle'], ['Oasis', 'm', 'Oasis'], ['Péndulo', 'm', 'Pendulum'], ['Rastro', 'm', 'Trail'], ['Ciudad', 'f', 'City'],
    ['Río', 'm', 'River'], ['Corona', 'f', 'Crown'], ['Puerta', 'f', 'Door'], ['Isla', 'f', 'Island'], ['Lobo', 'm', 'Wolf'],
    ['Fuego', 'm', 'Fire'], ['Luna', 'f', 'Moon'], ['Estrella', 'f', 'Star'], ['Camino', 'm', 'Road'], ['Reino', 'm', 'Kingdom'],
    ['Viento', 'm', 'Wind'], ['Promesa', 'f', 'Promise'], ['Memoria', 'f', 'Memory'], ['Máscara', 'f', 'Mask'], ['Danza', 'f', 'Dance'],
    ['Sueño', 'm', 'Dream'], ['Tren', 'm', 'Train'], ['Ola', 'f', 'Wave'], ['Llave', 'f', 'Key'], ['Espejo', 'm', 'Mirror'],
    ['Herencia', 'f', 'Legacy'], ['Montaña', 'f', 'Mountain'], ['Desierto', 'm', 'Desert'], ['Imperio', 'm', 'Empire'], ['Verano', 'm', 'Summer'],
    ['Invierno', 'm', 'Winter'], ['Canción', 'f', 'Song'], ['Rosa', 'f', 'Rose'], ['Mar', 'm', 'Sea'], ['Corazón', 'm', 'Heart'],
    ['Leyenda', 'f', 'Legend'], ['Señal', 'f', 'Signal'], ['Ruta', 'f', 'Route'], ['Torre', 'f', 'Tower'], ['Bosque', 'm', 'Forest'],
    ['Lobos', 'mp', 'Wolves'], ['Fantasmas', 'mp', 'Ghosts'], ['Huellas', 'fp', 'Footprints'], ['Alas', 'fp', 'Wings'], ['Ciudades', 'fp', 'Cities'],
    ['Caballos', 'mp', 'Horses'], ['Puentes', 'mp', 'Bridges'], ['Campanas', 'fp', 'Bells'], ['Voces', 'fp', 'Voices'], ['Relojes', 'mp', 'Clocks'],
  ];
  // [masculino, femenino, inglés]; el plural se arma con la regla del español
  const ADJ = [
    ['eterno', 'eterna', 'Eternal'], ['perdido', 'perdida', 'Lost'], ['secreto', 'secreta', 'Secret'], ['prohibido', 'prohibida', 'Forbidden'],
    ['dorado', 'dorada', 'Golden'], ['oculto', 'oculta', 'Hidden'], ['olvidado', 'olvidada', 'Forgotten'], ['roto', 'rota', 'Broken'],
    ['maldito', 'maldita', 'Cursed'], ['sagrado', 'sagrada', 'Sacred'], ['infinito', 'infinita', 'Infinite'], ['dormido', 'dormida', 'Sleeping'],
    ['lejano', 'lejana', 'Distant'], ['helado', 'helada', 'Frozen'], ['silencioso', 'silenciosa', 'Silent'], ['rojo', 'roja', 'Red'],
    ['negro', 'negra', 'Black'], ['blanco', 'blanca', 'White'], ['salvaje', 'salvaje', 'Wild'], ['imposible', 'imposible', 'Impossible'],
    ['final', 'final', 'Final'], ['invisible', 'invisible', 'Invisible'], ['ardiente', 'ardiente', 'Burning'], ['brillante', 'brillante', 'Bright'],
    ['azul', 'azul', 'Blue'], ['feroz', 'feroz', 'Fierce'], ['último', 'última', 'Last'], ['primero', 'primera', 'First'],
  ];
  // [español, inglés, va antes del sustantivo en inglés]
  const COMP = [
    ['de cristal', 'of Glass'], ['del norte', 'of the North'], ['en llamas', 'on Fire'], ['de invierno', 'of Winter'], ['de medianoche', 'Midnight', 1],
    ['del sur', 'of the South'], ['de plata', 'of Silver'], ['sin regreso', 'of No Return'], ['de papel', 'of Paper'], ['en la niebla', 'in the Fog'],
    ['del fin del mundo', 'at the End of the World'], ['sin nombre', 'Nameless', 1], ['de fuego', 'of Fire'], ['bajo la lluvia', 'in the Rain'],
    ['de los sueños', 'of Dreams'], ['de sal', 'of Salt'], ['entre ruinas', 'among the Ruins'], ['de otoño', 'of Autumn'], ['al amanecer', 'at Dawn'],
    ['de los mil días', 'of a Thousand Days'], ['sin fin', 'Endless', 1], ['de neón', 'Neon', 1], ['del olvido', 'of Oblivion'], ['de humo', 'of Smoke'],
  ];
  // Ideas abstractas para los títulos por familia de géneros
  const ABS = [['culpa', 'Guilt'], ['ambición', 'Ambition'], ['venganza', 'Revenge'], ['memoria', 'Memory'], ['silencio', 'Silence'], ['deseo', 'Desire'],
    ['mentiras', 'Lies'], ['poder', 'Power'], ['traición', 'Betrayal'], ['miedo', 'Fear'], ['esperanza', 'Hope'], ['soledad', 'Solitude'],
    ['codicia', 'Greed'], ['gloria', 'Glory'], ['olvido', 'Oblivion'], ['redención', 'Redemption'], ['sangre', 'Blood'], ['oro', 'Gold']];

  function plural(a) {
    if (/z$/.test(a)) return a.slice(0, -1) + 'ces';
    if (/[aeiouáéíóú]$/.test(a)) return a + 's';
    return a + 'es';
  }
  // Forma del adjetivo que concuerda con el sustantivo
  function forma(adj, g) {
    const base = g[0] === 'f' ? adj[1] : adj[0];
    return g.length > 1 ? plural(base) : base;
  }
  function articulo(g, mayus) { const a = { m: 'el', f: 'la', mp: 'los', fp: 'las' }[g]; return mayus ? a.charAt(0).toUpperCase() + a.slice(1) : a; }
  function de(g) { return { m: 'del', f: 'de la', mp: 'de los', fp: 'de las' }[g]; }
  function minus(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  // «Último», «primero» y «pequeño» van antes del sustantivo; «primero» pierde la o ante un masculino singular
  function antepuesto(adj, g) { const f = forma(adj, g); return f === 'primero' ? 'primer' : f; }

  // Un título nuevo para una obra de esos géneros (usa el azar del mundo: la misma semilla da los mismos títulos)
  function nuevo(gen) {
    const fam = (ART.datos.familiaDe || {})[gen && gen[0]] || 'DR';
    const s = N.elegir(SUST), g = s[1], adjs = ADJ.filter(function (a) { return a[0] !== 'último' && a[0] !== 'primero'; });
    const a = N.elegir(adjs), c = N.elegir(COMP), r = N.azar();
    if (r < 0.28) return s[0] + ' ' + forma(a, g);
    if (r < 0.42) return articulo(g, true) + ' ' + minus(s[0]) + ' ' + forma(a, g);
    if (r < 0.58) return s[0] + ' ' + c[0];
    if (r < 0.66) return articulo(g, true) + ' ' + minus(s[0]) + ' ' + c[0];
    if (r < 0.72) { const u = N.elegir(ADJ.filter(function (x) { return x[0] === 'último' || x[0] === 'primero'; })); const p = antepuesto(u, g); return articulo(g, true) + ' ' + p + ' ' + minus(s[0]); }
    if (r < 0.77) { const s2 = N.elegir(SUST.filter(function (x) { return x[0] !== s[0]; })); return s[0] + ' y ' + minus(s2[0]); }
    if (r < 0.93) {
      const ab = N.elegir(ABS);
      if (fam === 'SM') return 'Sombras de ' + ab[0];
      if (fam === 'AA') return 'Operación ' + s[0];
      if (fam === 'RD') return 'Un amor ' + c[0];
      if (fam === 'HM') return (g[0] === 'f' ? (g.length > 1 ? 'Mis queridas ' : 'Mi querida ') : (g.length > 1 ? 'Mis queridos ' : 'Mi querido ')) + minus(s[0]);
      if (fam === 'IM') return 'Crónicas ' + de(g) + ' ' + minus(s[0]);
      if (fam === 'FJ') return articulo(g, true) + ' ' + (g[0] === 'f' ? (g.length > 1 ? 'pequeñas' : 'pequeña') : (g.length > 1 ? 'pequeños' : 'pequeño')) + ' ' + minus(s[0]);
      if (fam === 'AV') return 'Anatomía ' + de(g) + ' ' + minus(s[0]);
      return 'Los años de ' + ab[0];
    }
    return s[0];
  }
  // Nombre de banda: «Los Lobos Dorados», «Las Campanas Rotas»
  function banda() {
    const pl = SUST.filter(function (x) { return x[1].length > 1; }), s = N.elegir(pl), a = N.elegir(ADJ.slice(0, 26));
    const f = forma(a, s[1]);
    return articulo(s[1], true) + ' ' + s[0] + ' ' + f.charAt(0).toUpperCase() + f.slice(1);
  }
  // Título de canción a partir de un número (estable): «Luna», «Luna de neón», «Mi corazón», «Noche y fuego»
  function cancion(n) {
    const s = SUST[n % SUST.length], s2 = SUST[(n >> 5) % SUST.length], c = COMP[(n >> 3) % COMP.length], k = n % 4;
    if (k === 0) return s[0];
    if (k === 1) return s[0] + ' ' + c[0];
    if (k === 2) return (s[1].length > 1 ? 'Mis ' : 'Mi ') + minus(s[0]);
    return s[0] + ' y ' + minus(s2 === s ? SUST[(n + 7) % SUST.length][0] : s2[0]);
  }
  function sustantivo() { return N.elegir(SUST)[0]; }

  // ---------- Inglés ----------
  let tabla = null;
  function preparar() {
    if (tabla) return tabla;
    const sus = {}, adj = {}, comp = {}, abs = {};
    SUST.forEach(function (s) { sus[s[0]] = s; sus[minus(s[0])] = s; });
    ADJ.forEach(function (a) { ['m', 'f', 'mp', 'fp'].forEach(function (g) { adj[forma(a, g)] = a[2]; }); });
    adj.primer = 'First';
    COMP.forEach(function (c) { comp[c[0]] = c; });
    ABS.forEach(function (a) { abs[a[0]] = a[1]; });
    const lista = function (o) { return Object.keys(o).sort(function (a, b) { return b.length - a.length; }).map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'); };
    tabla = { sus: sus, adj: adj, comp: comp, abs: abs, rS: lista(sus), rA: lista(adj), rC: lista(comp), rB: lista(abs) };
    return tabla;
  }
  // Traduce un título que siga los patrones de arriba; si no es uno de ellos devuelve null
  function ingles(t) {
    if (!t || t.length > 70) return null;
    const T = preparar(), x = String(t).trim();
    let m;
    // Secuelas: «Los pequeños caballos 2» → «The Little Horses 2»
    if ((m = /^(.+) (\d{1,2}|II|III|IV|V|VI)$/.exec(x))) { const b = ingles(m[1]); return b ? b + ' ' + m[2] : null; }
    const S = function (k) { return T.sus[k] ? T.sus[k][2] : null; };
    const art = '(El|La|Los|Las)';
    if ((m = new RegExp('^(' + T.rS + ') (' + T.rA + ')$').exec(x)) && S(m[1])) return T.adj[m[2]] + ' ' + S(m[1]);
    if ((m = new RegExp('^' + art + ' (' + T.rS + ') (' + T.rA + ')$').exec(x)) && S(m[2])) return 'The ' + T.adj[m[3]] + ' ' + S(m[2]);
    if ((m = new RegExp('^' + art + ' (último|última|últimos|últimas|primer|primera|primeros|primeras|pequeño|pequeña|pequeños|pequeñas) (' + T.rS + ')$').exec(x)) && S(m[3])) return 'The ' + (m[2].indexOf('pequeñ') === 0 ? 'Little' : m[2].indexOf('últim') === 0 ? 'Last' : 'First') + ' ' + S(m[3]);
    const conComp = function (nom, c, conArt) { return c[2] ? (conArt ? 'The ' : '') + c[1] + ' ' + nom : (conArt ? 'The ' : '') + nom + ' ' + c[1]; };
    if ((m = new RegExp('^(' + T.rS + ') (' + T.rC + ')$').exec(x)) && S(m[1])) return conComp(S(m[1]), T.comp[m[2]], false);
    if ((m = new RegExp('^' + art + ' (' + T.rS + ') (' + T.rC + ')$').exec(x)) && S(m[2])) return conComp(S(m[2]), T.comp[m[3]], true);
    if ((m = new RegExp('^(' + T.rS + ') y (' + T.rS + ')$').exec(x)) && S(m[1]) && S(m[2])) return S(m[1]) + ' and ' + S(m[2]);
    if ((m = new RegExp('^Sombras de (' + T.rB + ')$').exec(x))) return 'Shadows of ' + T.abs[m[1]];
    if ((m = new RegExp('^Los años de (' + T.rB + ')$').exec(x))) return 'The Years of ' + T.abs[m[1]];
    if ((m = new RegExp('^Operación (' + T.rS + ')$').exec(x)) && S(m[1])) return 'Operation ' + S(m[1]);
    if ((m = new RegExp('^Un amor (' + T.rC + ')$').exec(x))) { const c = T.comp[m[1]]; return c[2] ? 'A ' + c[1] + ' Love' : 'A Love ' + c[1]; }
    if ((m = new RegExp('^Mis? querid[oa]s? (' + T.rS + ')$').exec(x)) && S(m[1])) return 'My Dear ' + S(m[1]);
    if ((m = new RegExp('^Crónicas (?:del|de la|de los|de las) (' + T.rS + ')$').exec(x)) && S(m[1])) return 'Chronicles of the ' + S(m[1]);
    if ((m = new RegExp('^Anatomía (?:del|de la|de los|de las) (' + T.rS + ')$').exec(x)) && S(m[1])) return 'Anatomy of the ' + S(m[1]);
    if ((m = new RegExp('^Mis? (' + T.rS + ')$').exec(x)) && S(m[1])) return 'My ' + S(m[1]);
    if ((m = new RegExp('^' + art + ' (' + T.rS + ') (' + T.rA + ')$', 'i').exec(x)) && S(m[2])) return 'The ' + T.adj[m[3].toLowerCase()] + ' ' + S(m[2]);
    if (T.sus[x] && x === T.sus[x][0]) return T.sus[x][2];
    return null;
  }

  // Arregla la concordancia de un título hecho por versiones viejas («El aurora prohibido» → «La aurora prohibida»)
  function reparar(t) {
    const T = preparar(), x = String(t || '');
    const mc = new RegExp('^El (' + T.rS + ') (' + T.rC + ')$').exec(x);
    if (mc && T.sus[mc[1]]) return articulo(T.sus[mc[1]][1], true) + ' ' + minus(T.sus[mc[1]][0]) + ' ' + mc[2];
    const m = new RegExp('^(?:El )?(' + T.rS + ') (' + T.rA + ')$').exec(x);
    if (!m) return x;
    const s = T.sus[m[1]], a = ADJ.filter(function (y) { return ['m', 'f', 'mp', 'fp'].some(function (g) { return forma(y, g) === m[2]; }); })[0];
    if (!s || !a) return x;
    const con = /^El /.test(x);
    return (con ? articulo(s[1], true) + ' ' + minus(s[0]) : s[0]) + ' ' + forma(a, s[1]);
  }

  return { SUST: SUST, ADJ: ADJ, COMP: COMP, nuevo: nuevo, banda: banda, cancion: cancion, sustantivo: sustantivo, ingles: ingles, reparar: reparar, forma: forma };
})();
