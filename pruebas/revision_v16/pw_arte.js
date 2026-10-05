const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  await page.goto('file://' + __dirname + '/ia.html');
  const res = await page.evaluate(() => {
    const out = [];
    const cv = document.createElement('canvas'); cv.style.width = '200px'; cv.style.height = '300px'; document.body.appendChild(cv);
    const prueba = (nombre, fn) => { try { fn(); } catch (e) { out.push(nombre + ': ' + e.message); } };
    const posters = [
      {}, { id: 1 }, { id: 2, titulo: '', generos: [] }, { id: 3, titulo: 'x'.repeat(300), generos: ['Nada'], temas: null, creditos: null, estudio: null },
      { id: 4, titulo: '<b>', generos: ['Acción', 'Terror', 'Erótico'], anio: 3000, etapa: 'rara', crit: NaN, pub: undefined, clas: undefined, premiosGanados: 99, creditos: { reparto: [null, undefined], sx: [] }, estudio: { nombre: null, logo: null } },
      { id: 5, titulo: 'Ñandú 😀', generos: ['Drama'], anio: 1850, etapa: 'terminada', crit: 99, pub: 1, clas: 'X', creditos: { direccion: '', reparto: [] }, estudio: { nombre: 'E', logo: {} } },
      { id: -1, titulo: 123, generos: 'Drama', anio: '1990' },
    ];
    posters.forEach((p, i) => prueba('poster ' + i, () => IA.arte.posterEn(cv, p)));
    const tals = [ {}, { id: 1 }, { id: 2, nombre: '', sexo: 'X', edad: -5, oficio: 'nada', aspecto: IA.arte.aspectoNuevo(1, 'zzz') }, { id: 3, sexo: 'F', edad: 250, oficio: 'interprete', aspecto: IA.arte.aspectoNuevo(2, 'afr') }, { id: 4, edad: NaN, aspecto: null } ];
    tals.forEach((t, i) => [1850, 1900, 2000, 2150, 3000, NaN].forEach(a => prueba('retrato ' + i + '/' + a, () => IA.arte.retratoEn(cv, t, a))));
    const c = cv.getContext('2d');
    [null, undefined, {}, { s: 999, c: -1, b: 'x', t: NaN, f: 1e9 }].forEach((L, i) => prueba('logo ' + i, () => IA.arte.logo(c, 50, 50, 40, L)));
    const est = (d) => prueba('estudio ' + JSON.stringify(d).slice(0, 60), () => IA.arte.estudio(c, 360, 240, 1000, d));
    est({ anio: 1930, semana: 20, nombre: 'X', logo: { s: 1, c: 1, b: 1, t: 1, f: 1 }, pisos: [], terrenos: [], rodajes: [] });
    est({ anio: 2150, semana: 52, nombre: '', logo: null, pisos: Array(10).fill(0).map((_, i) => ({ tipo: ['oficinas', 'plato', 'guion', 'casting', 'edicion', 'sonido', 'efectos', 'marketing', 'archivo', 'raro'][i], actividad: 1, etiqueta: 'x' })), terrenos: [{ tipo: 'backlot', lado: 'izq' }, { tipo: 'foso', lado: 'der' }, { tipo: 'captura', lado: 'izq' }, { tipo: 'backlot', lado: 'der' }], rodajes: [{ titulo: '', progreso: 2 }, { titulo: null, progreso: NaN }] });
    est({ anio: 1850, semana: 1, nombre: 'Y', logo: { s: 1 }, pisos: [{ tipo: 'oficinas' }], terrenos: [{ tipo: 'vacio', lado: 'der' }], rodajes: null });
    [1895, 1949, 1950, 1999, 2000, 2026, 2100].forEach(a => est({ anio: a, semana: 30, nombre: 'Z', logo: { s: 2, c: 2, b: 2, t: 2, f: 2 }, pisos: [{ tipo: 'oficinas', actividad: 1 }, { tipo: 'plato', actividad: 0.2 }], terrenos: [], rodajes: [] }));
    prueba('barras vacias', () => IA.arte.barras(cv, [], []));
    prueba('barras NaN', () => IA.arte.barras(cv, [NaN, Infinity, -5], null, { formato: String }));
    prueba('linea 1 punto', () => IA.arte.linea(cv, [{ valores: [5] }], ['a']));
    prueba('linea todo NaN', () => IA.arte.linea(cv, [{ valores: [NaN, null] }], []));
    prueba('linea Infinity', () => IA.arte.linea(cv, [{ valores: [1, Infinity, 3] }], ['a','b','c']));
    return out;
  });
  console.log(res.join('\n') || 'arte: sin excepciones');
  console.log(errores.join('\n'));
  await browser.close();
})();
