/* ==== módulo: mundo ==== */
// Población real por región y edad, inflación (IPC), acceso y frecuencia del cine, precio de la entrada,
// calendario con estaciones por hemisferio y tendencias de géneros. Nada de esto existía en la V15.
IA.mundo = (function () {
  'use strict';
  const N = IA.n, D = IA.datos;

  // ---------- Población (millones) ----------
  // Real hasta 2024, proyección media de la ONU (World Population Prospects 2024) hasta 2100 y ficción del
  // juego hasta 2150. Total: 1.262 M en 1850, 1.650 M en 1900, 2.500 M en 1950, 8.160 M en 2024,
  // pico de unos 10.300 M hacia 2084 y 9.600 M en 2150.
  const POBLACION = {
    nam: [[1850, 26], [1870, 44], [1900, 82], [1920, 115], [1930, 134], [1940, 144], [1950, 165], [1960, 199], [1970, 226], [1980, 252], [1990, 278], [2000, 313], [2010, 344], [2020, 370], [2024, 383], [2030, 395], [2050, 421], [2070, 440], [2084, 447], [2100, 448], [2125, 460], [2150, 470]],
    lat: [[1850, 38], [1900, 74], [1920, 91], [1930, 108], [1950, 168], [1960, 220], [1970, 287], [1980, 362], [1990, 443], [2000, 524], [2010, 597], [2020, 652], [2024, 665], [2030, 690], [2050, 749], [2070, 750], [2084, 730], [2100, 650], [2125, 600], [2150, 560]],
    eur: [[1850, 276], [1900, 408], [1920, 450], [1930, 500], [1940, 535], [1950, 549], [1960, 605], [1970, 657], [1980, 694], [1990, 721], [2000, 727], [2010, 736], [2020, 746], [2024, 744], [2030, 736], [2050, 703], [2070, 670], [2084, 650], [2100, 590], [2125, 560], [2150, 540]],
    afr: [[1850, 111], [1900, 133], [1920, 143], [1930, 164], [1950, 227], [1960, 283], [1970, 365], [1980, 478], [1990, 630], [2000, 818], [2010, 1055], [2020, 1360], [2024, 1494], [2030, 1710], [2050, 2470], [2070, 3020], [2084, 3400], [2100, 3810], [2125, 3900], [2150, 3880]],
    asi: [[1850, 809], [1900, 947], [1920, 1000], [1930, 1130], [1940, 1220], [1950, 1380], [1960, 1700], [1970, 2140], [1980, 2640], [1990, 3210], [2000, 3740], [2010, 4210], [2020, 4660], [2024, 4830], [2030, 4960], [2050, 5260], [2070, 5100], [2084, 4980], [2100, 4650], [2125, 4300], [2150, 4050]],
    oce: [[1850, 2], [1900, 6], [1920, 8.5], [1930, 10], [1950, 12.9], [1960, 15.8], [1970, 19.7], [1980, 22.9], [1990, 27], [2000, 31], [2010, 37], [2020, 43], [2024, 46], [2030, 49], [2050, 58], [2070, 64], [2084, 68], [2100, 72], [2125, 80], [2150, 80]],
  };
  // Después de 2100: escenarios alto, medio (por defecto) y bajo (decidido)
  const ESCENARIOS = { alto: [[2100, 1], [2125, 1.1], [2150, 1.22]], medio: [[2100, 1], [2150, 1]], bajo: [[2100, 1], [2125, 0.9], [2150, 0.78]] };

  function escenario() { return (N.S && N.S.escenario) || 'medio'; }
  function poblacion(region, anio) {
    let p = N.interpLog(POBLACION[region], anio) * 1e6;
    if (anio > 2100) p *= N.interp(ESCENARIOS[escenario()], anio);
    return p;
  }
  function poblacionMundial(anio) {
    let s = 0;
    for (let i = 0; i < D.regiones.length; i++) s += poblacion(D.regiones[i].id, anio);
    return s;
  }

  // ---------- Pirámide de edades ----------
  // Partes de [niños 0-12, adolescentes 13-17, jóvenes 18-34, adultos 35-59, mayores 60+]
  const GRUPOS = ['Niños', 'Adolescentes', 'Jóvenes', 'Adultos', 'Mayores'];
  const EDADES = {
    nam: [[1850, [0.33, 0.11, 0.29, 0.21, 0.06]], [1900, [0.30, 0.10, 0.30, 0.23, 0.07]], [1950, [0.24, 0.07, 0.25, 0.32, 0.12]], [1970, [0.24, 0.10, 0.27, 0.25, 0.14]], [2000, [0.17, 0.07, 0.25, 0.35, 0.16]], [2025, [0.15, 0.065, 0.23, 0.32, 0.235]], [2050, [0.14, 0.06, 0.21, 0.31, 0.28]], [2100, [0.13, 0.055, 0.20, 0.30, 0.315]]],
    lat: [[1850, [0.36, 0.11, 0.29, 0.19, 0.05]], [1950, [0.35, 0.11, 0.29, 0.19, 0.06]], [1975, [0.34, 0.12, 0.29, 0.19, 0.06]], [2000, [0.27, 0.10, 0.30, 0.25, 0.08]], [2025, [0.19, 0.08, 0.27, 0.31, 0.15]], [2050, [0.15, 0.06, 0.22, 0.33, 0.24]], [2100, [0.12, 0.05, 0.19, 0.31, 0.33]]],
    eur: [[1850, [0.32, 0.10, 0.29, 0.22, 0.07]], [1900, [0.31, 0.10, 0.29, 0.23, 0.07]], [1950, [0.22, 0.08, 0.27, 0.31, 0.12]], [1975, [0.20, 0.08, 0.26, 0.30, 0.16]], [2000, [0.15, 0.06, 0.24, 0.35, 0.20]], [2025, [0.13, 0.055, 0.20, 0.345, 0.27]], [2050, [0.12, 0.05, 0.18, 0.31, 0.34]], [2100, [0.12, 0.05, 0.18, 0.30, 0.35]]],
    afr: [[1850, [0.38, 0.11, 0.29, 0.17, 0.05]], [1950, [0.38, 0.11, 0.28, 0.18, 0.05]], [2000, [0.40, 0.12, 0.28, 0.15, 0.05]], [2025, [0.36, 0.12, 0.29, 0.18, 0.05]], [2050, [0.30, 0.11, 0.29, 0.23, 0.07]], [2100, [0.20, 0.08, 0.26, 0.31, 0.15]]],
    asi: [[1850, [0.34, 0.11, 0.29, 0.20, 0.06]], [1950, [0.34, 0.10, 0.28, 0.21, 0.07]], [1975, [0.34, 0.12, 0.29, 0.19, 0.06]], [2000, [0.25, 0.09, 0.30, 0.27, 0.09]], [2025, [0.19, 0.07, 0.25, 0.34, 0.15]], [2050, [0.15, 0.06, 0.21, 0.33, 0.25]], [2100, [0.12, 0.05, 0.18, 0.30, 0.35]]],
    oce: [[1850, [0.33, 0.11, 0.29, 0.21, 0.06]], [1900, [0.30, 0.10, 0.30, 0.23, 0.07]], [1950, [0.26, 0.08, 0.26, 0.29, 0.11]], [2000, [0.20, 0.07, 0.25, 0.33, 0.15]], [2025, [0.18, 0.065, 0.24, 0.32, 0.195]], [2050, [0.16, 0.06, 0.22, 0.31, 0.25]], [2100, [0.14, 0.055, 0.20, 0.30, 0.305]]],
  };
  function edades(region, anio) {
    const tabla = EDADES[region];
    const out = [];
    let total = 0;
    for (let g = 0; g < 5; g++) {
      const v = N.interp(tabla.map(function (fila) { return [fila[0], fila[1][g]]; }), anio);
      out.push(v);
      total += v;
    }
    return out.map(function (v) { return v / total; });
  }

  // ---------- Índice de precios (IPC de EE. UU., Reserva Federal de Minneapolis, 1967 = 100) ----------
  // 25 en 1850, 72,3 en 1950 y 967,5 en 2025. Después de 2025 se simula alrededor de 2,5 % al año.
  const IPC = [[1850, 25], [1855, 28], [1860, 27], [1863, 37], [1864, 47], [1865, 46], [1870, 38], [1875, 33], [1880, 29], [1885, 27], [1890, 27], [1895, 25], [1900, 25], [1905, 27], [1910, 28], [1913, 29.7], [1915, 30.4], [1917, 38.4], [1918, 45.1], [1919, 51.8], [1920, 60], [1921, 53.6], [1922, 50.2], [1925, 52.5], [1929, 51.3], [1930, 50], [1931, 45.6], [1932, 40.9], [1933, 38.8], [1935, 41.1], [1940, 42], [1942, 48.8], [1945, 53.9], [1946, 58.5], [1947, 66.9], [1948, 72.1], [1950, 72.3], [1951, 77.8], [1955, 80.2], [1960, 88.7], [1965, 94.5], [1967, 100], [1970, 116.3], [1973, 133.1], [1974, 147.7], [1975, 161.2], [1977, 181.5], [1979, 217.4], [1980, 246.8], [1981, 272.4], [1982, 289.1], [1985, 322.2], [1990, 391.4], [1995, 456.5], [2000, 515.8], [2005, 585], [2008, 644.9], [2009, 642.7], [2010, 653.2], [2015, 709.9], [2019, 765.6], [2020, 775.1], [2021, 811.5], [2022, 876.4], [2023, 912.5], [2024, 939.4], [2025, 967.5]];
  const IPC_2025 = 967.5;
  const cacheIpc = { semilla: null, valores: {} };
  // Inflación simulada después de 2025: ~2,5 % con sobresaltos en las crisis, fija para cada semilla de mundo
  function inflacionFutura(anio) {
    const semilla = (N.S && N.S.semilla) || 'base';
    const r = N.ruido(semilla + '|inf|' + anio);
    let tasa = 0.025 + (r - 0.5) * 0.016;
    const crisis = N.ruido(semilla + '|crisis|' + Math.floor(anio / 2));
    if (crisis < 0.07) tasa += 0.035;
    return tasa;
  }
  function ipc(anio) {
    if (anio <= 2025) return N.interp(IPC, anio);
    const semilla = (N.S && N.S.semilla) || 'base';
    if (cacheIpc.semilla !== semilla) { cacheIpc.semilla = semilla; cacheIpc.valores = {}; }
    const a = Math.floor(anio);
    if (cacheIpc.valores[a] === undefined) {
      let v = IPC_2025;
      for (let y = 2026; y <= a; y++) {
        if (cacheIpc.valores[y] !== undefined) { v = cacheIpc.valores[y]; continue; }
        v = v * (1 + inflacionFutura(y));
        cacheIpc.valores[y] = v;
      }
    }
    const base = cacheIpc.valores[a];
    if (anio === a) return base;
    return base * (1 + inflacionFutura(a + 1) * (anio - a));
  }
  // De dólares de 2025 a dólares de un año, y de vuelta ("en dólares de hoy")
  function aEpoca(valor2025, anio) { return valor2025 * ipc(anio) / IPC_2025; }
  function aHoy(valorNominal, anio) { return valorNominal * IPC_2025 / ipc(anio); }
  function inflacionAnual(anio) { return ipc(anio) / ipc(anio - 1) - 1; }

  // ---------- Cine: acceso, frecuencia y precio ----------
  // Acceso: parte de la población con un cine al alcance
  const ACCESO_CINE = {
    nam: [[1894, 0], [1900, 0.1], [1905, 0.4], [1910, 0.8], [1920, 0.9], [1950, 0.95], [2000, 0.97]],
    eur: [[1894, 0], [1900, 0.1], [1910, 0.5], [1920, 0.7], [1930, 0.8], [1950, 0.9], [2000, 0.95]],
    lat: [[1896, 0], [1900, 0.02], [1910, 0.15], [1930, 0.35], [1950, 0.5], [1970, 0.6], [2000, 0.75], [2025, 0.8], [2050, 0.85]],
    afr: [[1900, 0], [1920, 0.03], [1950, 0.08], [1970, 0.12], [2000, 0.15], [2025, 0.25], [2050, 0.45], [2100, 0.65]],
    asi: [[1896, 0], [1900, 0.01], [1920, 0.08], [1930, 0.15], [1950, 0.3], [1970, 0.45], [2000, 0.55], [2025, 0.75], [2050, 0.85]],
    oce: [[1895, 0], [1900, 0.1], [1910, 0.6], [1930, 0.85], [1950, 0.9], [2000, 0.95]],
  };
  // Frecuencia: entradas al año por persona con acceso. En EE. UU. la asistencia semanal fue de 80 M en 1930,
  // pasó de 90 M en 1946 y cayó a 27,3 M en 2000: la llegada de la TV y del video.
  const FRECUENCIA_CINE = {
    nam: [[1895, 0], [1905, 4], [1910, 15], [1920, 22], [1930, 30], [1940, 31], [1946, 34], [1950, 24], [1955, 15], [1960, 11], [1965, 8], [1970, 6.5], [1980, 4.6], [1990, 4.4], [2000, 5], [2002, 5.3], [2010, 4.3], [2019, 3.7], [2020, 0.8], [2021, 1.6], [2022, 2.3], [2025, 2.6], [2035, 2.4], [2045, 2.6], [2060, 2.3], [2100, 2.1], [2150, 2]],
    eur: [[1895, 0], [1905, 1], [1910, 4], [1920, 7], [1930, 8], [1940, 10], [1946, 16], [1950, 14], [1955, 13], [1960, 10], [1970, 4.5], [1980, 3], [1990, 1.8], [2000, 2], [2010, 2], [2019, 1.9], [2020, 0.6], [2022, 1.3], [2025, 1.6], [2045, 1.7], [2060, 1.5], [2150, 1.5]],
    lat: [[1897, 0], [1910, 1], [1920, 3], [1930, 4], [1950, 8], [1960, 8], [1970, 6], [1980, 4], [1990, 1.5], [2000, 1.5], [2019, 1.6], [2020, 0.4], [2022, 1], [2025, 1.2], [2050, 1.4], [2150, 1.4]],
    afr: [[1905, 0], [1930, 0.5], [1950, 1], [1970, 1.2], [1990, 0.5], [2000, 0.3], [2019, 0.25], [2025, 0.3], [2050, 0.6], [2100, 1], [2150, 1.1]],
    asi: [[1897, 0], [1910, 0.3], [1930, 1.2], [1950, 3], [1960, 4], [1970, 3.5], [1980, 3], [1990, 2], [2000, 1.2], [2010, 1.3], [2019, 1.3], [2020, 0.4], [2022, 0.8], [2025, 1.1], [2050, 1.3], [2150, 1.3]],
    oce: [[1896, 0], [1905, 1], [1910, 8], [1920, 15], [1930, 18], [1950, 16], [1960, 8], [1970, 4], [1980, 3], [2000, 4.2], [2019, 3.4], [2020, 1], [2022, 2.3], [2025, 2.6], [2050, 2.4], [2150, 2.2]],
  };
  // Precio de la entrada en dólares de 2025: se ha movido entre unos $6,50 y $13 desde 1950
  const PRECIO_ENTRADA_2025 = [[1895, 1.6], [1905, 1.8], [1910, 2.6], [1920, 3.5], [1930, 4.6], [1940, 5], [1946, 5.6], [1950, 6.7], [1960, 6.53], [1970, 12.85], [1980, 10.5], [1990, 10.4], [2000, 10.1], [2010, 11.65], [2020, 11.4], [2025, 11.3], [2050, 12.5], [2100, 14], [2150, 15]];
  // Factor de precio por región (lo que se paga frente a Norteamérica, en dólares de 2025)
  const PRECIO_REGION = {
    nam: [[1850, 1]], eur: [[1850, 0.7], [1990, 0.85], [2019, 0.9]], oce: [[1850, 0.9], [2000, 0.95]],
    lat: [[1850, 0.35], [1990, 0.35], [2019, 0.4], [2050, 0.55]], asi: [[1850, 0.15], [1990, 0.2], [2019, 0.4], [2050, 0.6]],
    afr: [[1850, 0.2], [2019, 0.3], [2100, 0.45]],
  };
  function accesoCine(region, anio) { return N.interp(ACCESO_CINE[region], anio); }
  function frecuenciaCine(region, anio) { return N.interp(FRECUENCIA_CINE[region], anio); }
  function precioEntrada2025(region, anio) { return N.interp(PRECIO_ENTRADA_2025, anio) * N.interp(PRECIO_REGION[region], anio); }
  function precioEntrada(region, anio) { return aEpoca(precioEntrada2025(region, anio), anio); }
  // Público = Población × Acceso × Frecuencia (entradas posibles al año)
  function publicoCine(region, anio) { return poblacion(region, anio) * accesoCine(region, anio) * frecuenciaCine(region, anio); }
  // Ocio en casa: radio, TV, video, internet y streaming hacen más atractivo quedarse en casa
  const OCIO_CASA = [[1850, 0], [1920, 0.1], [1950, 0.3], [1976, 0.45], [1995, 0.55], [2007, 0.7], [2020, 0.85], [2050, 0.95], [2150, 1]];
  function ocioEnCasa(anio) { return N.interp(OCIO_CASA, anio); }

  // ---------- Acceso a otros medios (radio, TV, internet, consolas) ----------
  // Parte de la población con acceso en cada región. Aproximado; se verifica con fuentes en la V27. Lo usan
  // la TV, la música y los videojuegos en sus versiones (V24, V30, V31); hoy se ve en Mundo → Población.
  const ACCESO_MEDIOS = {
    radio: {
      nam: [[1920, 0], [1930, 0.4], [1940, 0.8], [1950, 0.95], [2150, 0.97]], eur: [[1922, 0], [1935, 0.3], [1950, 0.7], [1970, 0.95], [2150, 0.97]],
      lat: [[1925, 0], [1950, 0.3], [1970, 0.6], [2000, 0.85], [2150, 0.9]], afr: [[1930, 0], [1960, 0.1], [1980, 0.4], [2000, 0.7], [2025, 0.8], [2150, 0.85]],
      asi: [[1925, 0], [1950, 0.1], [1970, 0.4], [1990, 0.7], [2025, 0.85], [2150, 0.9]], oce: [[1923, 0], [1935, 0.5], [1950, 0.9], [2150, 0.97]],
    },
    tv: {
      nam: [[1946, 0], [1950, 0.09], [1955, 0.65], [1960, 0.87], [1970, 0.95], [2150, 0.97]], eur: [[1950, 0], [1960, 0.3], [1970, 0.75], [1985, 0.95], [2150, 0.95]],
      lat: [[1955, 0], [1970, 0.3], [1990, 0.75], [2010, 0.9], [2150, 0.92]], afr: [[1965, 0], [1990, 0.2], [2010, 0.45], [2025, 0.6], [2150, 0.85]],
      asi: [[1958, 0], [1975, 0.25], [1995, 0.65], [2010, 0.85], [2150, 0.92]], oce: [[1956, 0], [1965, 0.6], [1975, 0.92], [2150, 0.96]],
    },
    internet: {
      nam: [[1991, 0], [2000, 0.43], [2010, 0.72], [2020, 0.9], [2150, 0.98]], eur: [[1992, 0], [2000, 0.2], [2010, 0.65], [2020, 0.87], [2150, 0.98]],
      lat: [[1995, 0], [2005, 0.15], [2015, 0.55], [2025, 0.8], [2150, 0.97]], afr: [[1996, 0], [2010, 0.1], [2020, 0.35], [2030, 0.6], [2150, 0.95]],
      asi: [[1994, 0], [2005, 0.1], [2015, 0.4], [2025, 0.7], [2150, 0.97]], oce: [[1993, 0], [2000, 0.4], [2010, 0.75], [2020, 0.88], [2150, 0.98]],
    },
    consolas: {
      nam: [[1972, 0], [1985, 0.2], [2000, 0.4], [2020, 0.6], [2150, 0.65]], eur: [[1975, 0], [1990, 0.15], [2005, 0.35], [2020, 0.5], [2150, 0.6]],
      lat: [[1980, 0], [2000, 0.1], [2020, 0.3], [2150, 0.5]], afr: [[1985, 0], [2010, 0.03], [2025, 0.1], [2150, 0.4]],
      asi: [[1975, 0], [1990, 0.08], [2010, 0.25], [2025, 0.45], [2150, 0.6]], oce: [[1974, 0], [1990, 0.2], [2010, 0.45], [2150, 0.6]],
    },
  };
  function accesoMedio(medio, region, anio) {
    if (medio === 'cine') return accesoCine(region, anio);
    const t = ACCESO_MEDIOS[medio];
    return t ? N.interp(t[region], anio) : 0;
  }

  // ---------- Calendario y temporada ----------
  // Un factor semanal entre ×0,80 y ×1,40 (decidido) y bonos por género. Las estaciones dependen del hemisferio.
  const BASE_NORTE = [1.15, 0.85, 0.85, 0.85, 0.85, 0.85, 0.95, 0.85, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 0.95, 0.95, 0.95, 0.95, 0.95, 1.15, 1.15, 1.25, 1.25, 1.25, 1.25, 1.35, 1.3, 1.3, 1.3, 1.3, 1.1, 1.1, 1.1, 1.1, 0.8, 0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 0.95, 1.0, 1.0, 1.2, 0.95, 0.95, 0.95, 1.3, 1.4];
  // Hemisferio sur: el verano y las vacaciones caen en diciembre-febrero y en julio
  const BASE_SUR = [1.3, 1.25, 1.25, 1.25, 1.2, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.85, 0.95, 1.0, 0.9, 0.85, 0.85, 0.85, 0.9, 0.9, 0.9, 0.95, 0.95, 1.0, 1.0, 1.05, 1.2, 1.25, 1.25, 1.1, 0.95, 0.9, 0.9, 0.85, 0.85, 0.85, 0.9, 0.9, 0.95, 0.95, 0.95, 0.95, 0.95, 1.0, 1.0, 1.0, 1.05, 1.05, 1.1, 1.15, 1.3, 1.4];
  const fiestasAsia = { 5: 1.25, 6: 1.15, 44: 1.1 };
  function temporada(region, sem) {
    const r = D.region(region);
    let f;
    if (r.hemisferio === 'N') f = BASE_NORTE[sem - 1];
    else if (r.hemisferio === 'S') f = BASE_SUR[sem - 1];
    else f = (BASE_NORTE[sem - 1] + BASE_SUR[sem - 1]) / 2;
    if (region === 'asi' && fiestasAsia[sem]) f = Math.max(f, fiestasAsia[sem]);
    return N.limitar(f, 0.8, 1.4);
  }
  // Bono de género por temporada favorable (+15 %; +20 % en la semana exacta de San Valentín)
  function bonoGenero(famId, sem) {
    const fam = D.familia(famId);
    if (!fam) return 1;
    for (let i = 0; i < fam.semanas.length; i++) {
      const r = fam.semanas[i];
      if (sem >= r[0] && sem <= r[1]) return famId === 'RD' ? 1.2 : 1.15;
    }
    return 1;
  }
  const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function nombreMes(m) { return NOMBRES_MES[m]; }
  // Fechas con nombre (solo para mostrar en el calendario; el efecto ya está en la curva de temporada)
  const FECHAS = [[1, 'Año Nuevo'], [7, 'San Valentín'], [13, 'Semana Santa (aprox.)'], [22, 'Inicio del verano boreal'], [27, 'Vacaciones de verano'], [44, 'Halloween'], [47, 'Acción de Gracias'], [52, 'Navidad']];
  function fechaDeSemana(sem) {
    for (let i = 0; i < FECHAS.length; i++) if (FECHAS[i][0] === sem) return FECHAS[i][1];
    return '';
  }

  // ---------- Era ----------
  function era(anio) {
    let e = D.cronologia[0];
    for (let i = 0; i < D.cronologia.length; i++) if (D.cronologia[i][0] <= anio) e = D.cronologia[i];
    return e[1];
  }
  function decada(anio) { return Math.floor(anio / 10) * 10; }
  function tecnologia(anio) {
    let t = D.tecnologias[0];
    for (let i = 0; i < D.tecnologias.length; i++) if (D.tecnologias[i].anio <= anio) t = D.tecnologias[i];
    return t;
  }

  // ---------- Tendencias de géneros (olas y cansancio) ----------
  function tendenciasIniciales() {
    const t = {};
    D.ORDEN_FAM.forEach(function (f) { t[f] = N.redondear(N.normal(0, 0.25), 3); });
    return t;
  }
  // Cada mes: deriva al azar, vuelve poco a poco a cero y se cansa si se estrena mucho de una familia
  function actualizarTendencias(estrenosPorFamilia, totalEstrenos) {
    const S = N.S;
    D.ORDEN_FAM.forEach(function (f) {
      const parte = totalEstrenos > 0 ? (estrenosPorFamilia[f] || 0) / totalEstrenos : 0.125;
      const cansancio = Math.max(0, parte - 0.2) * 0.8;
      let v = S.mundo.tendencias[f];
      v = v * 0.93 + N.normal(0, 0.09) - cansancio;
      S.mundo.tendencias[f] = N.redondear(N.limitar(v, -1, 1), 3);
    });
  }

  return {
    GRUPOS: GRUPOS, poblacion: poblacion, poblacionMundial: poblacionMundial, edades: edades,
    ipc: ipc, aEpoca: aEpoca, aHoy: aHoy, inflacionAnual: inflacionAnual, IPC_2025: IPC_2025,
    accesoCine: accesoCine, accesoMedio: accesoMedio, frecuenciaCine: frecuenciaCine, precioEntrada: precioEntrada,
    precioEntrada2025: precioEntrada2025, publicoCine: publicoCine, ocioEnCasa: ocioEnCasa,
    temporada: temporada, bonoGenero: bonoGenero, nombreMes: nombreMes, fechaDeSemana: fechaDeSemana,
    era: era, decada: decada, tecnologia: tecnologia,
    tendenciasIniciales: tendenciasIniciales, actualizarTendencias: actualizarTendencias,
  };
})();
