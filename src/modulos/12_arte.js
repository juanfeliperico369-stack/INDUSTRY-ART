/* ==== módulo: arte ==== */
// Arte generado por código: logos, pósters, retratos, el edificio del estudio,
// gráficas y sonidos. No lee el estado del juego: todo llega por parámetros.
// Todo el azar sale de hash()/azar(): la misma obra o talento se ve siempre igual.
// Las funciones que reciben ctx dibujan en px CSS (el ctx ya viene escalado).
IA.arte = (function () {
  'use strict';

  const TAU = Math.PI * 2;

  /* =========================================================
     Utilidades
     ========================================================= */

  // Hash de texto (el de la V15): entero de 32 bits sin signo.
  function hash(texto) {
    const s = String(texto);
    let h = 7;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  // Generador con semilla (mulberry32, el "mb" de la V15). Devuelve () => [0, 1).
  function azar(semilla) {
    let a = semilla | 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const entero = (q, a, b) => a + Math.floor(q() * (b - a + 1));
  const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

  // '#rrggbb' → 'rgba(r,g,b,a)'
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // Mezcla dos colores '#rrggbb' (t = 0 → a, t = 1 → b).
  function mezclar(a, b, t) {
    const x = parseInt(a.slice(1), 16);
    const y = parseInt(b.slice(1), 16);
    const canal = (d) => Math.round(((x >> d) & 255) * (1 - t) + ((y >> d) & 255) * t);
    return `rgb(${canal(16)},${canal(8)},${canal(0)})`;
  }

  function crearLienzo(w, h) {
    const lz = document.createElement('canvas');
    lz.width = Math.max(1, Math.round(w));
    lz.height = Math.max(1, Math.round(h));
    return lz;
  }

  // Ajusta un <canvas> a su tamaño CSS × devicePixelRatio y lo deja listo en px CSS.
  // V33: como mucho ×2 (en pantallas de ×3 se ve igual y cuesta la mitad de memoria y de batería)
  function prepararLienzo(canvas, wDef, hDef) {
    if (!canvas || !canvas.getContext) return null;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || wDef || 0;
    const h = canvas.clientHeight || hDef || 0;
    if (!w || !h) return null;
    const W = Math.max(1, Math.round(w * d));
    const H = Math.max(1, Math.round(h * d));
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    const c = canvas.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    return { c, w, h, d };
  }

  // Caché LRU sobre Map: lo usado se reinserta al final y se borra lo más viejo.
  function cacheLRU(max) {
    const mapa = new Map();
    return {
      tomar(k) {
        const v = mapa.get(k);
        if (v) { mapa.delete(k); mapa.set(k, v); }
        return v;
      },
      poner(k, v) {
        mapa.set(k, v);
        if (mapa.size > max) mapa.delete(mapa.keys().next().value);
      },
    };
  }

  function circulo(c, x, y, r) {
    c.beginPath();
    c.arc(x, y, Math.max(0, r), 0, TAU);
  }
  function elipse(c, x, y, rx, ry, giro, a0, a1) {
    c.beginPath();
    c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), giro || 0, a0 || 0, a1 == null ? TAU : a1);
  }
  function trazo(c, x1, y1, x2, y2) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  }
  function poligono(c, pts) {
    c.beginPath();
    for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fill();
  }
  function rectRedondo(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // Colores del tema (variables CSS) con los de la V15 como respaldo.
  const TEMA_BASE = {
    fondo: '#0b1020', panel: '#151c33', panel2: '#1e2744', texto: '#e9edf8', tenue: '#8e9ab8',
    acento: '#35d0ba', rosa: '#ff4f81', dorado: '#ffc857', bien: '#35d0ba', mal: '#ff4f81',
  };
  function leerTema() {
    let estilo = null;
    try { estilo = getComputedStyle(document.documentElement); } catch (e) { estilo = null; }
    const r = {};
    Object.keys(TEMA_BASE).forEach((k) => {
      const v = estilo ? estilo.getPropertyValue('--' + k).trim() : '';
      r[k] = v || TEMA_BASE[k];
    });
    return r;
  }

  /* =========================================================
     Logo del estudio (igual que la V15)
     ========================================================= */

  const FUENTES = [
    'Georgia,serif', 'Impact,sans-serif', '"Courier New",monospace', '"Trebuchet MS",sans-serif',
    'Palatino,serif', 'Verdana,sans-serif', 'Tahoma,sans-serif', '"Times New Roman",serif',
    '"Arial Black",sans-serif', '"Comic Sans MS",cursive', 'Garamond,serif', '"Brush Script MT",cursive',
    '"Lucida Console",monospace', 'Copperplate,fantasy', 'Optima,sans-serif', 'Futura,sans-serif',
    '"Gill Sans",sans-serif', 'Rockwell,serif', 'Didot,serif', 'Baskerville,serif',
  ];
  const colorFondo = (i) => `hsl(${(i | 0) * 18},40%,${12 + ((i | 0) % 4) * 3}%)`;
  const colorFrente = (i) => `hsl(${(i | 0) * 18},78%,60%)`;
  const colorTexto = (i) => `hsl(${(i | 0) * 18},60%,82%)`;

  // Figura base: 0 círculo, 1 cuadrado, 2 triángulo, 3 hexágono, 4 estrella.
  function trazarForma(c, k, r) {
    c.beginPath();
    if (!k) { c.arc(0, 0, r, 0, TAU); return; }
    const n = [0, 4, 3, 6, 10][k];
    const giro = k === 1 ? -Math.PI / 4 : -Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const a = giro + (i * TAU) / n;
      const d = k === 4 && i % 2 ? r * 0.45 : r;
      c.lineTo(Math.cos(a) * d, Math.sin(a) * d);
    }
    c.closePath();
  }

  // logo = {s, c, b, t, f}. s % 5 = figura; s / 5 = variante
  // (0 llena, 1 contorno, 2 anillo con contorno adentro, 3 anillo con punto).
  function logo(c, x, y, r, L) {
    if (!c || !L || !(r > 0)) return;
    const color = colorFrente(L.c);
    const k = (L.s | 0) % 5;
    const v = ((L.s | 0) / 5) | 0;
    c.save();
    c.translate(x, y);
    c.fillStyle = color;
    c.strokeStyle = color;
    c.lineWidth = r * 0.14;
    trazarForma(c, k, r);
    if (v === 1) c.stroke(); else c.fill();
    if (v >= 2) {
      c.fillStyle = colorFondo(L.b);
      trazarForma(c, k, r * 0.58);
      c.fill();
      c.fillStyle = color;
      if (v === 3) { trazarForma(c, 0, r * 0.2); c.fill(); } else { trazarForma(c, k, r * 0.3); c.stroke(); }
    }
    c.restore();
  }

  function logoAleatorio(n) {
    const q = azar(hash('logo#' + n));
    return { s: entero(q, 0, 19), c: entero(q, 0, 19), b: entero(q, 0, 19), t: entero(q, 0, 19), f: entero(q, 0, 19) };
  }

  const colorLogo = (L) => colorFrente(L ? L.c : 6);

  /* =========================================================
     Pósters (V15: seis estilos de época y once motivos de género)
     ========================================================= */

  const ACENTO_MOTIVO = ['#c0392b', '#22d3ee', '#a78bfa', '#ff6fa8', '#f59e0b', '#94a3b8',
    '#facc15', '#fb923c', '#60a5fa', '#34d399', '#e2e8f0'];
  const PALETA_EPOCA = [['#efe3c8', '#c8ad7f'], ['#141127', '#3b2a14'], ['#24365f', '#c9733f'],
    ['#13052e', '#5b0f4f'], ['#0a2533', '#3b1d0c'], ['#0b0d12', '#1b2130']];
  const FUENTE_EPOCA = ['Georgia,serif', 'Copperplate,Futura,fantasy', 'Impact,sans-serif',
    '"Arial Black",sans-serif', 'Impact,"Trebuchet MS",sans-serif', 'Futura,"Gill Sans",Optima,sans-serif'];

  const epocaPoster = (a) => (a < 1915 ? 0 : a < 1946 ? 1 : a < 1970 ? 2 : a < 1990 ? 3 : a < 2010 ? 4 : 5);

  // 0 terror, 1 ciencia ficción, 2 fantasía, 3 romance, 4 western, 5 bélico/histórico,
  // 6 comedia/familiar, 7 acción, 8 crimen, 9 deporte, 10 drama (resto)
  function motivoGenero(g) {
    const k = String(g || '').toLowerCase();
    if (/terror|supervivencia|horror/.test(k)) return 0;
    if (/ciencia|espacial|cyber/.test(k)) return 1;
    if (/fantas|épic|mitol|rpg|medieval/.test(k)) return 2;
    if (/romance|telenovela|melodrama/.test(k)) return 3;
    if (/western/.test(k)) return 4;
    if (/bélic|histór|guerra|biogr/.test(k)) return 5;
    if (/comedia|famil|infantil|parodia|farsa|absurdo|musical|pop|salsa|anima/.test(k)) return 6;
    if (/acción|aventura|superh|shooter|plataforma|mundo abierto|artes marciales/.test(k)) return 7;
    if (/crimen|thriller|misterio|noir|policial|espionaje|judicial/.test(k)) return 8;
    if (/deport|carrera/.test(k)) return 9;
    return 10;
  }

  // 'estrenada' | 'proximamente' | 'rodaje'
  function estadoObra(o) {
    const e = o.etapa;
    if (e === 'cartelera' || e === 'terminada') return 'estrenada';
    if (e === 'posproduccion' || e === 'lista') return 'proximamente';
    return 'rodaje';
  }

  // Silueta de pie. pose 1: brazos en acción; pose 2: con sombrero.
  function figura(c, x, y, s, pose) {
    circulo(c, x, y - s * 0.88, s * 0.11);
    c.fill();
    poligono(c, [x - s * 0.17, y - s * 0.72, x + s * 0.17, y - s * 0.72, x + s * 0.12, y - s * 0.3,
      x + s * 0.1, y, x + s * 0.02, y, x, y - s * 0.28, x - s * 0.02, y, x - s * 0.1, y, x - s * 0.12, y - s * 0.3]);
    if (pose === 1) {
      c.lineWidth = s * 0.07;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x - s * 0.15, y - s * 0.68);
      c.lineTo(x - s * 0.38, y - s * 0.95);
      c.moveTo(x + s * 0.15, y - s * 0.68);
      c.lineTo(x + s * 0.34, y - s * 0.45);
      c.stroke();
    }
    if (pose === 2) {
      c.fillRect(x - s * 0.2, y - s * 0.98, s * 0.4, s * 0.04);
      c.fillRect(x - s * 0.1, y - s * 1.08, s * 0.2, s * 0.11);
    }
  }

  // Escena central según el motivo del género.
  function escenaGenero(c, w, h, mo, q, acento, tinta) {
    const hz = h * 0.66;
    c.fillStyle = tinta;
    c.strokeStyle = tinta;
    if (mo === 0) { // terror: luna, árbol seco y murciélagos
      c.fillStyle = 'rgba(255,244,214,.9)';
      circulo(c, w * 0.68, h * 0.24, w * 0.15);
      c.fill();
      c.fillStyle = tinta;
      c.lineWidth = w * 0.03;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(w * 0.18, h);
      c.lineTo(w * 0.22, hz - h * 0.1);
      c.lineTo(w * 0.12, hz - h * 0.28);
      c.moveTo(w * 0.22, hz - h * 0.1);
      c.lineTo(w * 0.38, hz - h * 0.3);
      c.moveTo(w * 0.3, hz - h * 0.2);
      c.lineTo(w * 0.34, hz - h * 0.36);
      c.stroke();
      c.fillRect(0, hz, w, h - hz);
      for (let i = 0; i < 3; i++) {
        const x = w * (0.45 + q() * 0.4), y = h * (0.1 + q() * 0.2), s = w * 0.035;
        c.beginPath();
        c.moveTo(x - s * 2, y);
        c.quadraticCurveTo(x - s, y - s, x, y + s * 0.3);
        c.quadraticCurveTo(x + s, y - s, x + s * 2, y);
        c.fill();
      }
    } else if (mo === 1) { // ciencia ficción: planeta con anillo y rejilla
      for (let i = 0; i < 40; i++) {
        c.fillStyle = `rgba(255,255,255,${0.3 + q() * 0.7})`;
        c.fillRect(q() * w, q() * hz, 1.2, 1.2);
      }
      const g = c.createRadialGradient(w * 0.62, h * 0.3, w * 0.02, w * 0.62, h * 0.3, w * 0.26);
      g.addColorStop(0, acento);
      g.addColorStop(1, '#0b1020');
      c.fillStyle = g;
      circulo(c, w * 0.62, h * 0.3, w * 0.24);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,.55)';
      c.lineWidth = 1.2;
      elipse(c, w * 0.62, h * 0.3, w * 0.38, w * 0.08, -0.35);
      c.stroke();
      c.strokeStyle = acento;
      c.globalAlpha = 0.5;
      for (let i = 0; i < 8; i++) trazo(c, w / 2, hz, w * ((i / 7) * 2 - 0.5), h);
      for (let i = 1; i < 5; i++) {
        const y = hz + (h - hz) * Math.pow(i / 5, 1.6);
        trazo(c, 0, y, w, y);
      }
      c.globalAlpha = 1;
    } else if (mo === 2) { // fantasía: montañas y castillo
      c.fillStyle = 'rgba(255,255,255,.08)';
      c.beginPath();
      c.moveTo(0, hz);
      [[0.15, 0.42], [0.3, 0.55], [0.48, 0.36], [0.66, 0.5], [0.85, 0.33], [1, 0.48]]
        .forEach((p) => c.lineTo(w * p[0], h * p[1]));
      c.lineTo(w, hz);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)';
      for (let i = 0; i < 14; i++) c.fillRect(q() * w, q() * h * 0.3, 1, 1);
      c.fillStyle = tinta;
      const cx = w * 0.5;
      c.fillRect(cx - w * 0.22, hz - h * 0.12, w * 0.44, h * 0.12);
      [[-0.2, 0.2], [-0.06, 0.28], [0.08, 0.24], [0.18, 0.18]].forEach((t) => {
        c.fillRect(cx + w * t[0], hz - h * t[1], w * 0.06, h * t[1]);
        poligono(c, [cx + w * t[0] - w * 0.01, hz - h * t[1], cx + w * (t[0] + 0.03), hz - h * (t[1] + 0.07),
          cx + w * (t[0] + 0.07), hz - h * t[1]]);
      });
      c.fillRect(0, hz, w, h - hz);
    } else if (mo === 3) { // romance: pareja al atardecer y corazón
      const g = c.createRadialGradient(w * 0.5, hz, w * 0.05, w * 0.5, hz, w * 0.6);
      g.addColorStop(0, 'rgba(255,214,150,.95)');
      g.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      c.fillStyle = tinta;
      figura(c, w * 0.42, hz + h * 0.08, h * 0.34, 0);
      figura(c, w * 0.58, hz + h * 0.08, h * 0.31, 0);
      c.fillRect(0, hz + h * 0.08, w, h);
      c.fillStyle = acento;
      const x = w * 0.5, y = h * 0.2, r = w * 0.06;
      c.beginPath();
      c.moveTo(x, y + r * 1.2);
      c.bezierCurveTo(x - r * 2, y - r * 0.2, x - r * 0.8, y - r * 1.6, x, y - r * 0.5);
      c.bezierCurveTo(x + r * 0.8, y - r * 1.6, x + r * 2, y - r * 0.2, x, y + r * 1.2);
      c.fill();
    } else if (mo === 4) { // western: sol, mesetas, cactus y vaquero
      c.fillStyle = 'rgba(255,200,90,.9)';
      circulo(c, w * 0.5, hz - h * 0.05, w * 0.22);
      c.fill();
      c.fillStyle = tinta;
      poligono(c, [0, hz, w * 0.05, hz - h * 0.12, w * 0.3, hz - h * 0.12, w * 0.34, hz]);
      poligono(c, [w * 0.62, hz, w * 0.68, hz - h * 0.08, w * 0.9, hz - h * 0.08, w * 0.95, hz]);
      c.fillRect(0, hz, w, h - hz);
      const kx = w * 0.78, ky = hz + h * 0.12, s = h * 0.16;
      c.fillRect(kx - w * 0.02, ky - s, w * 0.04, s);
      c.fillRect(kx - w * 0.08, ky - s * 0.65, w * 0.06, w * 0.03);
      c.fillRect(kx - w * 0.08, ky - s * 0.85, w * 0.025, s * 0.22);
      c.fillRect(kx + w * 0.02, ky - s * 0.5, w * 0.06, w * 0.03);
      c.fillRect(kx + w * 0.06, ky - s * 0.75, w * 0.025, s * 0.27);
      figura(c, w * 0.3, hz + h * 0.14, h * 0.3, 2);
    } else if (mo === 5) { // bélico/histórico: humo, tropa y bandera
      for (let i = 0; i < 9; i++) {
        c.fillStyle = `rgba(200,200,200,${0.08 + q() * 0.12})`;
        circulo(c, q() * w, hz - q() * h * 0.35, w * (0.1 + q() * 0.15));
        c.fill();
      }
      c.fillStyle = tinta;
      for (let i = 0; i < 4; i++) figura(c, w * (0.2 + i * 0.2), hz + h * 0.1, h * (0.24 + q() * 0.06), 0);
      c.lineWidth = w * 0.015;
      trazo(c, w * 0.75, hz + h * 0.1, w * 0.75, hz - h * 0.32);
      c.fillStyle = acento;
      poligono(c, [w * 0.75, hz - h * 0.32, w * 0.95, hz - h * 0.27, w * 0.75, hz - h * 0.22]);
      c.fillStyle = tinta;
      c.fillRect(0, hz + h * 0.1, w, h);
    } else if (mo === 6) { // comedia: rayos, confeti y globos
      c.save();
      c.translate(w / 2, h * 0.38);
      for (let i = 0; i < 16; i++) {
        c.rotate(Math.PI / 8);
        c.fillStyle = i % 2 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.04)';
        poligono(c, [0, 0, -w * 0.12, -h, w * 0.12, -h]);
      }
      c.restore();
      for (let i = 0; i < 26; i++) {
        c.fillStyle = `hsl(${(q() * 360) | 0},85%,62%)`;
        c.fillRect(q() * w, q() * h * 0.8, 2.5, 4);
      }
      for (let i = 0; i < 3; i++) {
        const x = w * (0.25 + i * 0.25), y = h * (0.2 + q() * 0.15), r = w * 0.07;
        c.strokeStyle = 'rgba(255,255,255,.5)';
        c.lineWidth = 0.8;
        trazo(c, x, y + r, x + (q() - 0.5) * w * 0.1, hz);
        c.fillStyle = `hsl(${(i * 120 + q() * 60) | 0},80%,60%)`;
        elipse(c, x, y, r * 0.85, r);
        c.fill();
      }
    } else if (mo === 7) { // acción: explosión y héroe
      const cx = w * 0.5, cy = h * 0.38;
      c.fillStyle = 'rgba(255,170,60,.85)';
      c.beginPath();
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * TAU, r = i % 2 ? w * 0.18 : w * (0.36 + q() * 0.1);
        c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.fill();
      c.fillStyle = 'rgba(255,240,180,.9)';
      circulo(c, cx, cy, w * 0.12);
      c.fill();
      c.fillStyle = tinta;
      c.strokeStyle = tinta;
      figura(c, cx, hz + h * 0.12, h * 0.42, 1);
      c.fillRect(0, hz + h * 0.12, w, h);
    } else if (mo === 8) { // crimen: ciudad bajo la lluvia y detective
      for (let x = 0; x < w;) {
        const bw = w * (0.08 + q() * 0.1), bh = h * (0.15 + q() * 0.35);
        c.fillStyle = tinta;
        c.fillRect(x, hz - bh, bw - 1, bh + h);
        c.fillStyle = 'rgba(255,214,120,.55)';
        for (let y = hz - bh + 4; y < hz - 3; y += 6) {
          for (let xx = x + 2; xx < x + bw - 3; xx += 5) if (q() < 0.35) c.fillRect(xx, y, 2, 3);
        }
        x += bw;
      }
      c.strokeStyle = 'rgba(180,200,255,.18)';
      c.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const x = q() * w, y = q() * h;
        trazo(c, x, y, x - 3, y + 9);
      }
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,.2)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      poligono(c, [w * 0.45, 0, w * 0.55, 0, w * 0.8, h, w * 0.2, h]);
      c.fillStyle = '#05060c';
      c.strokeStyle = '#05060c';
      figura(c, w * 0.5, h * 0.92, h * 0.38, 2);
    } else if (mo === 9) { // deporte: focos, cancha y pelota
      for (let i = 0; i < 2; i++) {
        const x = w * (0.15 + i * 0.7);
        c.fillStyle = 'rgba(255,255,230,.9)';
        c.fillRect(x - w * 0.07, h * 0.08, w * 0.14, h * 0.04);
        const g = c.createLinearGradient(0, h * 0.1, 0, hz);
        g.addColorStop(0, 'rgba(255,255,220,.35)');
        g.addColorStop(1, 'rgba(255,255,220,0)');
        c.fillStyle = g;
        poligono(c, [x - w * 0.07, h * 0.12, x + w * 0.07, h * 0.12, i ? w * 0.3 : w * 0.7, hz, i ? w * 0.6 : w * 0.4, hz]);
      }
      c.fillStyle = '#1f6f3f';
      c.fillRect(0, hz, w, h - hz);
      c.strokeStyle = 'rgba(255,255,255,.5)';
      c.lineWidth = 1;
      trazo(c, w * 0.5, hz, w * 0.5, h);
      elipse(c, w * 0.5, hz + (h - hz) * 0.4, w * 0.18, (h - hz) * 0.18);
      c.stroke();
      c.fillStyle = '#fff';
      circulo(c, w * 0.62, hz - h * 0.05, w * 0.06);
      c.fill();
      c.fillStyle = '#111';
      circulo(c, w * 0.62, hz - h * 0.05, w * 0.02);
      c.fill();
    } else { // drama: luz de ventana y una figura sola
      c.fillStyle = 'rgba(255,236,190,.14)';
      for (let i = 0; i < 3; i++) {
        poligono(c, [w * (0.2 + i * 0.15), 0, w * (0.3 + i * 0.15), 0, w * (0.6 + i * 0.18), h, w * (0.4 + i * 0.18), h]);
      }
      c.fillStyle = 'rgba(255,236,190,.35)';
      c.fillRect(w * 0.18, h * 0.1, w * 0.28, h * 0.22);
      c.strokeStyle = tinta;
      c.lineWidth = 2;
      c.strokeRect(w * 0.18, h * 0.1, w * 0.28, h * 0.22);
      trazo(c, w * 0.32, h * 0.1, w * 0.32, h * 0.32);
      trazo(c, w * 0.18, h * 0.21, w * 0.46, h * 0.21);
      c.fillStyle = tinta;
      figura(c, w * 0.62, hz + h * 0.14, h * 0.36, 0);
      c.fillRect(0, hz + h * 0.14, w, h);
    }
  }

  // Textura propia de cada época (papel viejo, art déco, viñeta, rejilla neón, destello, cine actual).
  function efectoEpoca(c, w, h, era, q) {
    if (era === 0) {
      c.globalCompositeOperation = 'multiply';
      c.fillStyle = 'rgba(205,170,120,.55)';
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < Math.min(900, (w * h) / 40); i++) {
        c.fillStyle = `rgba(80,50,20,${q() * 0.08})`;
        c.fillRect(q() * w, q() * h, 1, 1);
      }
      c.strokeStyle = 'rgba(70,40,15,.8)';
      c.lineWidth = 1.5;
      c.strokeRect(4, 4, w - 8, h - 8);
      c.lineWidth = 0.6;
      c.strokeRect(7, 7, w - 14, h - 14);
    } else if (era === 1) {
      c.strokeStyle = 'rgba(212,175,55,.3)';
      c.lineWidth = 0.8;
      for (let i = 0; i < 14; i++) trazo(c, w / 2, h * 1.05, w * (i / 13), 0);
      c.strokeStyle = 'rgba(212,175,55,.8)';
      c.lineWidth = 1.2;
      c.strokeRect(5, 5, w - 10, h - 10);
      c.strokeRect(8, 8, w - 16, h - 16);
    } else if (era === 2) {
      const g = c.createRadialGradient(w / 2, h * 0.4, w * 0.2, w / 2, h * 0.5, h * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(40,20,0,.45)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    } else if (era === 3) {
      const hz = h * 0.74;
      c.strokeStyle = 'rgba(255,46,136,.45)';
      c.lineWidth = 0.8;
      for (let i = 0; i < 10; i++) trazo(c, w / 2, hz, w * ((i / 9) * 3 - 1), h);
      for (let i = 1; i < 6; i++) {
        const y = hz + (h - hz) * Math.pow(i / 6, 1.7);
        trazo(c, 0, y, w, y);
      }
      c.fillStyle = 'rgba(0,0,0,.08)';
      for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
    } else if (era === 4) {
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(0,140,160,.25)');
      g.addColorStop(1, 'rgba(255,120,30,.22)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      const f = c.createRadialGradient(w * 0.8, h * 0.15, 1, w * 0.8, h * 0.15, w * 0.3);
      f.addColorStop(0, 'rgba(255,255,255,.6)');
      f.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = f;
      c.fillRect(0, 0, w, h);
    } else {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,.35)');
      g.addColorStop(0.5, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.55)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
  }

  // Título en mayúsculas, hasta tres líneas, con la tipografía de la época.
  function tituloPoster(c, w, h, o, era, mo) {
    const palabras = String(o.titulo || '').toUpperCase().split(' ');
    const max = era === 5 ? 13 : 11;
    const fs = Math.max(7, w * (era === 5 ? 0.1 : 0.13));
    const lineas = [];
    let actual = '';
    palabras.forEach((p) => {
      if (actual && (actual + ' ' + p).length > max) { lineas.push(actual); actual = p; } else actual = actual ? actual + ' ' + p : p;
    });
    lineas.push(actual);
    const n = Math.min(3, lineas.length);
    const arriba = era === 0 || era === 2;
    const y0 = arriba ? h * 0.15 : h * 0.76 - (n - 1) * fs * 1.08;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    lineas.slice(0, 3).forEach((txt, i) => {
      const y = y0 + i * fs * 1.08;
      c.font = `${era === 5 ? '300' : '900'} ${fs}px ${FUENTE_EPOCA[era]}`;
      if (era === 3) { // cromado ochentero
        const g = c.createLinearGradient(0, y - fs / 2, 0, y + fs / 2);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.5, '#7fe3ff');
        g.addColorStop(0.55, '#2a1a5e');
        g.addColorStop(1, '#ff9be0');
        c.lineWidth = Math.max(1, fs * 0.1);
        c.strokeStyle = '#ff2e88';
        c.strokeText(txt, w / 2, y, w - 8);
        c.fillStyle = g;
        c.fillText(txt, w / 2, y, w - 8);
      } else {
        c.fillStyle = era === 0 ? '#3b2412' : era === 1 ? '#e9c46a' : mo === 0 ? '#ff3b3b' : '#fff';
        c.shadowColor = 'rgba(0,0,0,.85)';
        c.shadowBlur = era === 0 ? 0 : 4;
        c.fillText(txt, w / 2, y, w - 8);
        c.shadowBlur = 0;
      }
    });
    if (mo === 0 && era >= 2 && w >= 90) { // gotas de sangre bajo el título
      c.fillStyle = '#c81d25';
      for (let i = 0; i < 5; i++) {
        c.fillRect(w * (0.25 + i * 0.12), y0 + (n - 1) * fs * 1.08 + fs * 0.5, 1.5, 4 + (((o.id | 0) * 7 + i * 5) % 9));
      }
    }
  }

  function laureles(c, x, y, s) {
    c.fillStyle = '#ffd166';
    for (let k = 0; k < 7; k++) {
      const a = Math.PI * (0.65 + k * 0.1);
      [1, -1].forEach((d) => {
        c.save();
        c.translate(x + Math.cos(a) * s * d, y + Math.sin(a) * s);
        c.rotate(d * (a + Math.PI / 2));
        elipse(c, 0, 0, s * 0.09, s * 0.22);
        c.fill();
        c.restore();
      });
    }
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `800 ${Math.max(4, s * 0.3)}px sans-serif`;
    c.fillText('GANADOR', x, y - s * 0.08, s * 1.5);
    c.font = `${Math.max(4, s * 0.24)}px sans-serif`;
    c.fillText('★', x, y + s * 0.28);
  }

  function lema(o) {
    const t = String((o.temas && o.temas[0]) || (o.generos && o.generos[0]) || 'el destino').toLowerCase();
    return [`Todo empieza con ${t}`, `Nadie escapa de ${t}`, `Una historia sobre ${t}`,
      `Cuando ${t} lo cambia todo`, `Más allá de ${t}`][hash(o.titulo || '') % 5];
  }

  // Cajita de clasificación; (xd, yc) = borde derecho y centro vertical. Devuelve el borde izquierdo.
  function cajaClasificacion(c, xd, yc, w, texto) {
    const fs = Math.max(5, Math.min(11, w * 0.045));
    c.font = `800 ${fs}px sans-serif`;
    const bw = c.measureText(texto).width + fs * 0.8, bh = fs * 1.45;
    c.fillStyle = 'rgba(8,10,18,.82)';
    c.fillRect(xd - bw, yc - bh / 2, bw, bh);
    c.strokeStyle = 'rgba(255,255,255,.85)';
    c.lineWidth = Math.max(0.6, fs * 0.09);
    c.strokeRect(xd - bw, yc - bh / 2, bw, bh);
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(texto, xd - bw / 2, yc + fs * 0.05);
    return xd - bw;
  }

  // Estrellas o franja de estado, laureles, lema, créditos, estudio y clasificación.
  function detallesPoster(c, w, h, o) {
    const estado = estadoObra(o);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    if (estado === 'estrenada' && o.crit != null) {
      const pub = o.pub != null ? o.pub : o.crit;
      c.fillStyle = '#ffd98a';
      c.font = `${Math.max(6, w * 0.075)}px sans-serif`;
      c.fillText('★'.repeat(limitar(Math.round((o.crit + pub) / 40), 1, 5)), w / 2, h * 0.075);
    } else if (estado !== 'estrenada') {
      c.fillStyle = 'rgba(255,200,87,.93)';
      c.fillRect(0, h * 0.47, w, h * 0.065);
      c.fillStyle = '#201a00';
      c.font = `800 ${Math.max(4, w * 0.06)}px sans-serif`;
      c.textBaseline = 'middle';
      c.fillText(estado === 'rodaje' ? 'EN RODAJE' : 'PRÓXIMAMENTE', w / 2, h * 0.503, w - 6);
    }
    if ((o.premiosGanados | 0) > 0) {
      if (w >= 90) laureles(c, w * 0.5, h * 0.44, w * 0.16);
      else {
        c.fillStyle = '#ffd166';
        circulo(c, w - 6, h * 0.2, 3);
        c.fill();
      }
    }
    const filaY = h * 0.958;
    let derecha = w - 5;
    if (o.clas && w >= 40) {
      derecha = cajaClasificacion(c, w - 5, w >= 110 ? filaY : h - 4 - Math.max(5, w * 0.045) * 0.75, w, String(o.clas)) - 4;
    }
    if (w < 110) return;
    c.textAlign = 'center';
    if (o.temas && o.temas.length) {
      c.fillStyle = 'rgba(255,255,255,.85)';
      c.font = `italic ${Math.max(5, w * 0.045)}px Georgia,serif`;
      c.textBaseline = 'alphabetic';
      c.fillText(lema(o), w / 2, h * 0.62, w - 12);
    }
    const cr = o.creditos || {};
    const may = (s) => String(s || '').toUpperCase();
    const reparto = (cr.reparto || []).filter(Boolean).slice(0, 3).map(may).join(', ');
    const l1 = [cr.direccion && 'DIRIGIDA POR ' + may(cr.direccion), cr.guion && 'ESCRITA POR ' + may(cr.guion)]
      .filter(Boolean).join('  ·  ');
    const l2 = [cr.musica && 'MÚSICA ' + may(cr.musica), cr.produccion && 'PRODUCCIÓN ' + may(cr.produccion),
      reparto && 'CON ' + reparto].filter(Boolean).join('  ·  ');
    c.fillStyle = 'rgba(233,237,248,.78)';
    c.font = `${Math.max(4, w * 0.03)}px "Arial Narrow",sans-serif`;
    c.textBaseline = 'alphabetic';
    c.fillText(l1, w / 2, h * 0.895, w - 10);
    c.fillText(l2, w / 2, h * 0.925, w - 10);
    const est = o.estudio || {};
    if (est.nombre || est.logo) { // logo y nombre, centrados en el espacio libre de la fila
      const nombre = String(est.nombre || '').toUpperCase();
      const r = w * 0.022;
      c.font = `700 ${Math.max(4, w * 0.034)}px sans-serif`;
      const libre = derecha - 6;
      const tw = Math.min(c.measureText(nombre).width, libre - r * 3);
      const x = 6 + (libre - (tw + r * 3)) / 2;
      if (est.logo) logo(c, x + r, filaY, r, est.logo);
      c.fillStyle = 'rgba(233,237,248,.85)';
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(nombre, x + r * 3, filaY, Math.max(1, tw));
    }
  }

  function poster(c, w, h, o) {
    if (!c || !o || !(w > 0) || !(h > 0)) return;
    c.save();
    try {
      const q = azar(hash((o.titulo || '') + '|' + o.id));
      const era = epocaPoster(o.anio || 1950);
      const mo = motivoGenero(o.generos && o.generos[0]);
      const acento = ACENTO_MOTIVO[mo];
      const tinta = era === 0 ? 'rgba(70,42,18,.82)' : 'rgba(6,7,14,.82)';
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, PALETA_EPOCA[era][0]);
      g.addColorStop(1, PALETA_EPOCA[era][1]);
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      if (era >= 2) { // resplandor del color del género
        c.globalAlpha = 0.3;
        const r = c.createRadialGradient(w * 0.5, h * 0.35, 2, w * 0.5, h * 0.35, h * 0.7);
        r.addColorStop(0, acento);
        r.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = r;
        c.fillRect(0, 0, w, h);
        c.globalAlpha = 1;
      }
      [
        () => escenaGenero(c, w, h, mo, q, acento, tinta),
        () => efectoEpoca(c, w, h, era, q),
        () => tituloPoster(c, w, h, o, era, mo),
        () => detallesPoster(c, w, h, o),
      ].forEach((paso) => { c.save(); paso(); c.restore(); });
      c.strokeStyle = 'rgba(255,255,255,.18)';
      c.lineWidth = 1;
      c.strokeRect(0.5, 0.5, w - 1, h - 1);
    } catch (e) {
      c.fillStyle = '#223';
      c.fillRect(0, 0, w, h);
    }
    c.restore();
  }

  const cachePosters = cacheLRU(300);
  function clavePoster(o, w, h, d) {
    const est = o.estudio || {};
    return [o.id, o.titulo, w, h, d, estadoObra(o), o.crit, o.pub, o.premiosGanados | 0, o.clas, o.anio,
      (o.generos || []).join(','), (o.temas || [])[0], JSON.stringify(o.creditos || {}), est.nombre,
      JSON.stringify(est.logo || 0)].join('|');
  }

  function posterEn(canvas, o) {
    const L = prepararLienzo(canvas, 80, 120);
    if (!L || !o) return;
    const k = clavePoster(o, L.w, L.h, L.d);
    let img = cachePosters.tomar(k);
    if (!img) {
      img = crearLienzo(L.w * L.d, L.h * L.d);
      const c = img.getContext('2d');
      c.setTransform(L.d, 0, 0, L.d, 0, 0);
      poster(c, L.w, L.h, o);
      cachePosters.poner(k, img);
    }
    L.c.drawImage(img, 0, 0, L.w, L.h);
  }

  /* =========================================================
     Retratos (base de la V15 + edades, ropa de época y oficio)
     ========================================================= */

  const PIELES = ['#f6d7c3', '#efc3a4', '#e3b08b', '#cf9466', '#b07548', '#8d5a36', '#6e4227', '#4e2d1a'];
  const PELOS = ['#16110d', '#2b1d14', '#4a2f1c', '#6b4423', '#a2683a', '#d8b26a', '#ead9ad', '#8b2a1c'];
  const OJOS = ['#2b1a10', '#5a3a1e', '#5f7a3a', '#3f6fa8'];
  const REGIONES = { nam: 0, lat: 1, eur: 2, afr: 3, asi: 4, oce: 5 };
  const RANGO_PIEL = [[0, 7], [1, 6], [0, 4], [4, 7], [0, 5], [0, 7]];
  const PELO_REGION = [[0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2], [0, 1, 2], [0, 1, 2, 3, 4, 5, 6]];
  // Mismo orden que los roles de la V15 (el fondo del retrato usa índice × 45 de tono).
  const OFICIOS = ['guion', 'direccion', 'produccion', 'arte', 'fotografia', 'musica', 'edicion', 'interprete'];

  // Rasgos fijos de un talento (datos planos, se guardan con la partida).
  function aspectoNuevo(semilla, region) {
    const q = azar(hash('aspecto#' + semilla));
    const r = REGIONES[region] != null ? REGIONES[region] : entero(q, 0, 5);
    const diverso = q() < 0.15; // un poco de mezcla en todas las regiones
    const rango = diverso ? [0, 7] : RANGO_PIEL[r];
    const piel = entero(q, rango[0], rango[1]);
    const opciones = piel >= 5 && q() < 0.85 ? [0, 1, 2] : PELO_REGION[diverso ? 0 : r];
    const claros = piel <= 2 && (r === 0 || r === 2 || r === 5);
    return {
      piel,                                          // 0-7 (claro → oscuro)
      pelo: opciones[entero(q, 0, opciones.length - 1)], // 0-7: negro…rubio claro, 7 pelirrojo
      peinado: r === 3 && q() < 0.3 ? 6 : entero(q, 0, r === 4 ? 5 : 6), // 0-6 (6 afro)
      ojos: claros && q() < 0.45 ? entero(q, 2, 3) : entero(q, 0, 1), // 0-3: oscuro, café, verde, azul
      cejas: entero(q, 0, 2),
      nariz: entero(q, 0, 2),
      boca: entero(q, 0, 2),
      barba: q() < 0.35 ? entero(q, 1, 3) : 0,      // 0 nada, 1 barba, 2 bigote, 3 sombra (solo hombres adultos)
      gafas: q() < 0.2,
      aretes: q() < 0.4,
      pecas: piel <= 2 && q() < 0.2,
      lunar: q() < 0.12,
      canas: entero(q, 40, 66),                      // edad en que empiezan las canas
      calvicie: q() < 0.3,                           // hombres desde los 45
      ropa: entero(q, 0, 359),                       // tono de la ropa
      semilla: hash('rasgos#' + semilla) % 1000000,
    };
  }

  const epocaRetrato = (a) => (a < 1920 ? 0 : a < 1950 ? 1 : a < 1980 ? 2 : a < 2000 ? 3 : a < 2030 ? 4 : 5);

  function colorPelo(a, edad) {
    const base = PELOS[a.pelo] || PELOS[1];
    const inicio = a.canas || 55;
    if (edad < inicio) return base;
    return mezclar(base, '#dcdcdc', 0.35 + 0.65 * limitar((edad - inicio) / 20, 0, 1));
  }

  function estiloRopa(era, fem, nino, v, oficio) {
    if (nino) return era <= 1 ? 'marinero' : era === 5 ? 'futuro' : 'redondo';
    if (oficio === 'produccion') return era === 5 ? 'futuro' : era >= 3 ? 'blazer' : fem && era === 1 ? 'vestido' : 'traje';
    if (era === 0) return fem ? 'blusa' : 'levita';
    if (era === 1) return fem ? 'vestido' : 'traje';
    if (era === 2) return v < 0.4 ? 'tortuga' : fem ? 'escote' : 'traje';
    if (era === 3) return v < 0.5 ? 'blazer' : 'redondo';
    if (era === 4) return v < 0.35 ? 'capucha' : v < 0.7 ? 'redondo' : 'blazer';
    return 'futuro';
  }

  // Cuello, torso y prenda. (X, by) centro del torso; H tamaño de la cabeza; hy referencia de la cabeza.
  function ropa(c, X, by, rx, ry, H, hy, piel, estilo, era, a, nino, corbata) {
    const tono = (a.ropa | 0) % 360;
    const sat = [16, 26, 46, 66, 34, 14][era] + (nino ? 20 : 0);
    const luz = [24, 28, 42, 48, 36, 82][era] + (nino ? 10 : 0);
    const tela = estilo === 'marinero' ? '#24396b' : `hsl(${tono},${sat}%,${luz}%)`;
    const sombra = `hsl(${tono},${sat}%,${Math.max(10, luz - 16)}%)`;
    const camisa = era === 0 ? '#efe6d2' : '#f2f2ee';
    const top = by - ry;
    c.fillStyle = piel;
    c.fillRect(X - H * 0.13, hy + H * 0.25, H * 0.26, top - hy - H * 0.19);
    c.fillStyle = tela;
    elipse(c, X, by, rx, ry);
    c.fill();
    c.lineWidth = Math.max(1, H * 0.03);
    if (estilo === 'traje' || estilo === 'levita' || estilo === 'blazer') {
      c.fillStyle = estilo === 'blazer' ? `hsl(${(tono + 150) % 360},55%,70%)` : camisa;
      poligono(c, [X - H * 0.2, top + 1, X + H * 0.2, top + 1, X, top + ry * 0.62]);
      if (estilo === 'levita') { // cuello alto y corbatín
        c.fillStyle = camisa;
        c.fillRect(X - H * 0.15, top - H * 0.1, H * 0.3, H * 0.14);
        c.fillStyle = '#1b1414';
        poligono(c, [X, top + H * 0.06, X - H * 0.13, top - H * 0.01, X - H * 0.13, top + H * 0.13]);
        poligono(c, [X, top + H * 0.06, X + H * 0.13, top - H * 0.01, X + H * 0.13, top + H * 0.13]);
      } else if (estilo === 'traje' || corbata) {
        c.fillStyle = `hsl(${(tono + 180) % 360},45%,32%)`;
        poligono(c, [X - H * 0.05, top + H * 0.02, X + H * 0.05, top + H * 0.02, X + H * 0.06, top + ry * 0.55, X, top + ry * 0.66, X - H * 0.06, top + ry * 0.55]);
      }
      c.strokeStyle = sombra;
      c.beginPath();
      c.moveTo(X - H * 0.2, top);
      c.lineTo(X - H * 0.34, top + ry * 0.3);
      c.lineTo(X - H * 0.03, top + ry * 0.66);
      c.moveTo(X + H * 0.2, top);
      c.lineTo(X + H * 0.34, top + ry * 0.3);
      c.lineTo(X + H * 0.03, top + ry * 0.66);
      c.stroke();
    } else if (estilo === 'blusa') { // mangas abullonadas, cuello alto con encaje y camafeo
      circulo(c, X - rx * 0.72, top + ry * 0.4, ry * 0.42);
      c.fill();
      circulo(c, X + rx * 0.72, top + ry * 0.4, ry * 0.42);
      c.fill();
      c.fillStyle = camisa;
      c.fillRect(X - H * 0.15, hy + H * 0.33, H * 0.3, top - hy - H * 0.26);
      elipse(c, X, top + H * 0.06, H * 0.2, H * 0.1);
      c.fill();
      for (let i = -2; i <= 2; i++) { circulo(c, X + i * H * 0.065, hy + H * 0.34, H * 0.035); c.fill(); }
      c.fillStyle = '#d9a441';
      circulo(c, X, top + H * 0.1, H * 0.06);
      c.fill();
    } else if (estilo === 'vestido') { // escote redondo, cuello bebé y perlas
      c.fillStyle = piel;
      elipse(c, X, top, H * 0.24, H * 0.13, 0, 0, Math.PI);
      c.fill();
      c.fillStyle = camisa;
      elipse(c, X - H * 0.14, top + H * 0.03, H * 0.15, H * 0.08, 0.3);
      c.fill();
      elipse(c, X + H * 0.14, top + H * 0.03, H * 0.15, H * 0.08, -0.3);
      c.fill();
      c.fillStyle = '#f4efe6';
      for (let i = -3; i <= 3; i++) { circulo(c, X + i * H * 0.055, top + H * 0.13 - Math.abs(i) * H * 0.012, H * 0.025); c.fill(); }
    } else if (estilo === 'escote') { // escote bote y pañuelo
      c.fillStyle = piel;
      elipse(c, X, top, rx * 0.42, ry * 0.16, 0, 0, Math.PI);
      c.fill();
      c.fillStyle = `hsl(${(tono + 40) % 360},70%,58%)`;
      poligono(c, [X + H * 0.1, top - H * 0.02, X + H * 0.3, top + H * 0.02, X + H * 0.18, top + H * 0.2]);
    } else if (estilo === 'tortuga') {
      c.fillStyle = tela;
      c.fillRect(X - H * 0.15, hy + H * 0.32, H * 0.3, top - hy - H * 0.3);
      c.strokeStyle = sombra;
      for (let i = 0; i < 3; i++) trazo(c, X - H * 0.15, hy + H * (0.38 + i * 0.07), X + H * 0.15, hy + H * (0.38 + i * 0.07));
    } else if (estilo === 'capucha') {
      c.strokeStyle = sombra;
      c.lineWidth = H * 0.08;
      elipse(c, X, top + H * 0.03, H * 0.26, H * 0.1);
      c.stroke();
      c.strokeStyle = '#eee';
      c.lineWidth = Math.max(1, H * 0.025);
      trazo(c, X - H * 0.07, top + H * 0.1, X - H * 0.08, top + ry * 0.5);
      trazo(c, X + H * 0.07, top + H * 0.1, X + H * 0.08, top + ry * 0.5);
    } else if (estilo === 'marinero') {
      c.fillStyle = '#fff';
      poligono(c, [X - H * 0.24, top - 1, X + H * 0.24, top - 1, X, top + ry * 0.55]);
      c.strokeStyle = '#fff';
      c.lineWidth = H * 0.05;
      trazo(c, X - H * 0.4, top + H * 0.05, X - H * 0.05, top + ry * 0.6);
      trazo(c, X + H * 0.4, top + H * 0.05, X + H * 0.05, top + ry * 0.6);
      c.fillStyle = '#c0392b';
      circulo(c, X, top + ry * 0.55, H * 0.06);
      c.fill();
    } else if (estilo === 'futuro') { // cuello alto asimétrico con línea de luz
      c.fillStyle = sombra;
      poligono(c, [X - H * 0.22, top + H * 0.1, X - H * 0.2, hy + H * 0.32, X + H * 0.04, hy + H * 0.42, X + H * 0.2, top]);
      c.strokeStyle = '#35f0d0';
      c.lineWidth = Math.max(1, H * 0.035);
      trazo(c, X + H * 0.22, top + H * 0.04, X - rx * 0.45, by + ry * 0.3);
      c.fillStyle = '#35f0d0';
      circulo(c, X + rx * 0.4, by - ry * 0.35, H * 0.04);
      c.fill();
    } else { // 'redondo': camiseta
      c.strokeStyle = sombra;
      elipse(c, X, top + H * 0.01, H * 0.17, H * 0.08, 0, 0, Math.PI);
      c.stroke();
      if (nino || era === 3) { // franjas
        c.save();
        elipse(c, X, by, rx, ry);
        c.clip();
        c.fillStyle = 'rgba(255,255,255,.35)';
        c.fillRect(X - rx, by - ry * 0.35, rx * 2, ry * 0.14);
        c.fillRect(X - rx, by - ry * 0.05, rx * 2, ry * 0.14);
        c.restore();
      }
    }
  }

  function retrato(c, X, Y, U, t, anio) {
    if (!c || !t || !(U > 0)) return;
    const a = t.aspecto || aspectoNuevo(t.id | 0, '');
    const q = azar(((a.semilla | 0) * 31 + (t.id | 0) * 7) | 0);
    const v1 = q(), v2 = q(), v3 = q();
    const fem = t.sexo === 'F';
    const edad = t.edad != null ? +t.edad : 30;
    const nino = edad < 13, joven = !nino && edad < 18, adulto = edad >= 18, mayor = edad >= 60;
    anio = anio || 2000;
    const era = epocaRetrato(anio);
    // Los oficios de la V19 se visten como sus parientes (vestuario y animación con el arte, efectos con la edición)
    const oficio = OFICIOS.indexOf(t.oficio) >= 0 ? t.oficio : ({ vestuario: 'arte', animacion: 'arte', efectos: 'edicion' })[t.oficio] || 'interprete';
    const piel = PIELES[a.piel] || PIELES[2];
    const pelo = colorPelo(a, edad);
    const pelado = !fem && a.calvicie && edad >= 45;
    const pz = pelado ? 3 : (a.peinado | 0) % 7;
    // proporciones: los niños tienen la cabeza más baja y redonda y el cuerpo más angosto
    const H = U * (nino ? 0.9 : joven ? 0.96 : 1);
    const hy = Y + U * (nino ? 0.13 : joven ? 0.05 : 0);
    // accesorios del oficio
    const boina = (oficio === 'direccion' || oficio === 'arte') && v1 < 0.5;
    const auriculares = oficio === 'musica' && anio >= 1960;
    const conGafas = a.gafas || oficio === 'edicion' || (oficio === 'guion' && v3 < 0.5) || (mayor && v3 < 0.35);
    const sombrero = adulto && !boina && !auriculares && ((era === 1 && v2 < 0.35) || (era === 0 && !fem && v2 < 0.25))
      ? (fem ? 'campana' : era === 0 ? 'bombin' : 'fedora') : '';

    c.save();
    circulo(c, X, Y, U);
    c.clip();
    const g = c.createLinearGradient(X, Y - U, X, Y + U);
    g.addColorStop(0, `hsl(${OFICIOS.indexOf(oficio) * 45},42%,34%)`);
    g.addColorStop(1, '#0b1020');
    c.fillStyle = g;
    c.fillRect(X - U, Y - U, U * 2, U * 2);

    // pelo de atrás (largo o afro)
    c.fillStyle = pelo;
    if ((fem && (pz === 0 || pz === 3 || pz === 4)) || (!fem && pz === 5)) { elipse(c, X, hy + H * 0.05, H * 0.6, H * 0.72); c.fill(); }
    if (pz === 6) { circulo(c, X, hy - H * 0.2, H * 0.62); c.fill(); }

    // cuerpo y ropa
    const by = Y + U * 1.05;
    const rx = U * (nino ? 0.64 : joven ? 0.8 : 0.86) * (era === 3 && !nino ? 1.08 : 1);
    const ry = U * (nino ? 0.46 : 0.52);
    const top = by - ry;
    ropa(c, X, by, rx, ry, H, hy, piel, estiloRopa(era, fem, nino, v2, oficio), era, a, nino, oficio === 'produccion');
    accesorioPecho(c, oficio, X, by, rx, ry, top, H, anio, boina, auriculares, a);

    // orejas y cara
    c.fillStyle = piel;
    elipse(c, X - H * 0.43, hy - H * 0.02, H * 0.08, H * 0.12);
    c.fill();
    elipse(c, X + H * 0.43, hy - H * 0.02, H * 0.08, H * 0.12);
    c.fill();
    elipse(c, X, hy - H * 0.05, H * (nino ? 0.44 : 0.42), H * (nino ? 0.47 : 0.5));
    c.fill();
    marcasCara(c, X, hy, H, edad, nino, a);

    // pelo de arriba (o sombrero)
    c.fillStyle = pelo;
    if (sombrero) sombreroEpoca(c, sombrero, X, hy, H, a);
    else {
      if (pz !== 3 || fem) { elipse(c, X, hy - H * 0.36, H * 0.45, H * 0.25, 0, Math.PI, 0); c.fill(); }
      if (fem && pz === 2) { circulo(c, X, hy - H * 0.62, H * 0.17); c.fill(); }
      if (fem && pz === 1) {
        c.fillRect(X - H * 0.47, hy - H * 0.4, H * 0.12, H * 0.55);
        c.fillRect(X + H * 0.35, hy - H * 0.4, H * 0.12, H * 0.55);
      }
      if (fem && (pz === 0 || pz === 4)) { elipse(c, X - H * 0.22, hy - H * 0.3, H * 0.2, H * 0.09, 0.3); c.fill(); }
      if (pz === 4 || pz === 6) {
        for (let i = 0; i < 7; i++) { circulo(c, X - H * 0.42 + i * H * 0.14, hy - H * 0.42 + Math.abs(3 - i) * H * 0.03, H * 0.09); c.fill(); }
      }
      if (!fem && pz === 3) {
        c.fillRect(X - H * 0.45, hy - H * 0.18, H * 0.08, H * 0.2);
        c.fillRect(X + H * 0.37, hy - H * 0.18, H * 0.08, H * 0.2);
      }
      if (!fem && pz === 1) {
        c.beginPath();
        c.moveTo(X - H * 0.4, hy - H * 0.32);
        c.quadraticCurveTo(X, hy - H * 0.5, X + H * 0.42, hy - H * 0.2);
        c.lineTo(X + H * 0.42, hy - H * 0.36);
        c.fill();
      }
    }

    rasgos(c, X, hy, H, a, fem, nino, mayor, edad, pelo);

    // gafas y aretes
    const ey = hy - H * (nino ? 0.04 : 0.08), ex = H * (nino ? 0.17 : 0.16);
    if (conGafas) {
      c.strokeStyle = '#111';
      c.lineWidth = Math.max(1, H * 0.04);
      if (oficio === 'edicion' && era === 5) { // visor
        c.fillStyle = 'rgba(53,240,208,.45)';
        c.fillRect(X - H * 0.36, ey - H * 0.08, H * 0.72, H * 0.15);
      } else if (oficio === 'edicion' || (era >= 3 && v3 < 0.6)) {
        c.strokeRect(X - ex - H * 0.11, ey - H * 0.08, H * 0.22, H * 0.15);
        c.strokeRect(X + ex - H * 0.11, ey - H * 0.08, H * 0.22, H * 0.15);
        trazo(c, X - ex + H * 0.11, ey, X + ex - H * 0.11, ey);
      } else {
        c.beginPath();
        c.arc(X - ex, ey, H * 0.11, 0, TAU);
        c.moveTo(X + ex + H * 0.11, ey);
        c.arc(X + ex, ey, H * 0.11, 0, TAU);
        c.moveTo(X - ex + H * 0.11, ey);
        c.lineTo(X + ex - H * 0.11, ey);
        c.stroke();
      }
    }
    if ((fem && a.aretes) || (!fem && a.aretes && v2 > 0.88)) {
      c.fillStyle = '#ffc857';
      c.strokeStyle = '#ffc857';
      if (fem && era === 3) { // aros grandes de los ochenta
        c.lineWidth = Math.max(1, H * 0.03);
        circulo(c, X - H * 0.44, hy + H * 0.2, H * 0.08);
        c.stroke();
        circulo(c, X + H * 0.44, hy + H * 0.2, H * 0.08);
        c.stroke();
      } else {
        circulo(c, X - H * 0.43, hy + H * 0.12, H * 0.045);
        c.fill();
        if (fem) { circulo(c, X + H * 0.43, hy + H * 0.12, H * 0.045); c.fill(); }
      }
    }
    accesorioCabeza(c, oficio, X, hy, H, era, boina, auriculares, a);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.2)';
    c.lineWidth = 1;
    circulo(c, X, Y, U - 0.5);
    c.stroke();
  }

  // Arrugas, pecas, rubor y lunar.
  function marcasCara(c, X, hy, H, edad, nino, a) {
    c.lineCap = 'round';
    if (nino) {
      c.fillStyle = 'rgba(255,110,110,.22)';
      circulo(c, X - H * 0.25, hy + H * 0.07, H * 0.08);
      c.fill();
      circulo(c, X + H * 0.25, hy + H * 0.07, H * 0.08);
      c.fill();
    }
    if (a.pecas) {
      c.fillStyle = 'rgba(130,70,35,.4)';
      [-1, 1].forEach((d) => {
        for (let i = 0; i < 3; i++) { circulo(c, X + d * H * (0.18 + i * 0.05), hy + H * (0.03 + (i % 2) * 0.04), H * 0.014); c.fill(); }
      });
    }
    if (a.lunar) {
      c.fillStyle = 'rgba(60,30,20,.7)';
      circulo(c, X + H * 0.19, hy + H * 0.16, H * 0.018);
      c.fill();
    }
    if (edad >= 45) {
      c.strokeStyle = edad >= 60 ? 'rgba(0,0,0,.2)' : 'rgba(0,0,0,.12)';
      c.lineWidth = Math.max(0.6, H * 0.022);
      trazo(c, X - H * 0.17, hy - H * 0.28, X + H * 0.17, hy - H * 0.28);
    }
    if (edad >= 60) {
      trazo(c, X - H * 0.12, hy - H * 0.33, X + H * 0.12, hy - H * 0.33);
      [-1, 1].forEach((d) => {
        trazo(c, X + d * H * 0.29, hy - H * 0.1, X + d * H * 0.34, hy - H * 0.13);
        trazo(c, X + d * H * 0.29, hy - H * 0.06, X + d * H * 0.34, hy - H * 0.05);
        c.beginPath();
        c.moveTo(X + d * H * 0.1, hy + H * 0.06);
        c.quadraticCurveTo(X + d * H * 0.17, hy + H * 0.12, X + d * H * 0.16, hy + H * 0.2);
        c.stroke();
      });
    }
  }

  // Ojos, cejas, nariz, boca y barba.
  function rasgos(c, X, hy, H, a, fem, nino, mayor, edad, pelo) {
    const ey = hy - H * (nino ? 0.04 : 0.08), ex = H * (nino ? 0.17 : 0.16);
    const k = nino ? 1.25 : 1;
    c.fillStyle = '#fff';
    elipse(c, X - ex, ey, H * 0.07 * k, H * 0.05 * k);
    c.fill();
    elipse(c, X + ex, ey, H * 0.07 * k, H * 0.05 * k);
    c.fill();
    c.fillStyle = OJOS[a.ojos] || OJOS[0];
    circulo(c, X - ex, ey, H * 0.04 * k);
    c.fill();
    circulo(c, X + ex, ey, H * 0.04 * k);
    c.fill();
    c.fillStyle = '#120c08';
    circulo(c, X - ex, ey, H * 0.022 * k);
    c.fill();
    circulo(c, X + ex, ey, H * 0.022 * k);
    c.fill();
    // cejas
    c.strokeStyle = mayor ? '#9a9a9a' : pelo;
    c.lineWidth = Math.max(1, H * (0.03 + (a.cejas | 0) * 0.012));
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(X - ex - H * 0.08, ey - H * 0.1);
    c.lineTo(X - ex + H * 0.07, ey - H * 0.13);
    c.moveTo(X + ex - H * 0.07, ey - H * 0.13);
    c.lineTo(X + ex + H * 0.08, ey - H * 0.1);
    c.stroke();
    // nariz
    c.strokeStyle = 'rgba(0,0,0,.28)';
    c.lineWidth = Math.max(1, H * 0.035);
    c.beginPath();
    if (nino) {
      c.arc(X, hy + H * 0.06, H * 0.04, 0.2, Math.PI - 0.2);
    } else if (a.nariz === 1) {
      c.arc(X, hy + H * 0.06, H * 0.06, 0.1, Math.PI - 0.1);
    } else {
      const largo = a.nariz === 2 ? 0.14 : 0.1;
      c.moveTo(X, hy - H * 0.03);
      c.lineTo(X - H * 0.05, hy + H * largo);
      c.lineTo(X + H * 0.02, hy + H * (largo + 0.01));
    }
    c.stroke();
    // boca
    const my = hy + H * (nino ? 0.17 : 0.12);
    c.strokeStyle = nino ? '#c25a5a' : fem ? '#b4485a' : '#7a3b2e';
    c.lineWidth = Math.max(1, H * 0.05);
    c.beginPath();
    if (a.boca === 1 && !nino) { c.moveTo(X - H * 0.1, my + H * 0.08); c.quadraticCurveTo(X, my + H * 0.11, X + H * 0.1, my + H * 0.08); c.stroke(); }
    else if (a.boca === 2 && !nino) {
      c.fillStyle = '#fff';
      c.arc(X, my, H * 0.14, 0.15 * Math.PI, 0.85 * Math.PI);
      c.closePath();
      c.fill();
      c.stroke();
    } else { c.arc(X, my, H * (nino ? 0.1 : 0.13), 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
    // barba, bigote o sombra
    if (!fem && edad >= 18 && a.barba) {
      c.fillStyle = pelo;
      if (a.barba === 1) {
        c.globalAlpha = 0.85;
        elipse(c, X, hy + H * 0.24, H * 0.32, H * 0.22, 0, 0, Math.PI);
        c.fill();
        c.fillRect(X - H * 0.42, hy - H * 0.02, H * 0.07, H * 0.26);
        c.fillRect(X + H * 0.35, hy - H * 0.02, H * 0.07, H * 0.26);
        c.globalAlpha = 1;
      } else if (a.barba === 2) {
        elipse(c, X, my + H * 0.02, H * 0.13, H * 0.045);
        c.fill();
      } else {
        c.globalAlpha = 0.22;
        elipse(c, X, hy + H * 0.2, H * 0.36, H * 0.26, 0, 0, Math.PI);
        c.fill();
        c.globalAlpha = 1;
      }
    }
  }

  function sombreroEpoca(c, tipo, X, hy, H, a) {
    const color = tipo === 'campana' ? `hsl(${((a.ropa | 0) + 30) % 360},35%,40%)` : '#1d1a1a';
    c.fillStyle = color;
    if (tipo === 'campana') {
      elipse(c, X, hy - H * 0.3, H * 0.5, H * 0.38, 0, Math.PI, 0);
      c.fill();
      elipse(c, X, hy - H * 0.3, H * 0.52, H * 0.07);
      c.fill();
      c.fillStyle = '#e9c46a';
      circulo(c, X + H * 0.3, hy - H * 0.36, H * 0.06);
      c.fill();
    } else if (tipo === 'bombin') {
      elipse(c, X, hy - H * 0.38, H * 0.4, H * 0.34, 0, Math.PI, 0);
      c.fill();
      elipse(c, X, hy - H * 0.38, H * 0.55, H * 0.07);
      c.fill();
    } else { // fedora
      elipse(c, X, hy - H * 0.36, H * 0.64, H * 0.09);
      c.fill();
      rectRedondo(c, X - H * 0.36, hy - H * 0.72, H * 0.72, H * 0.4, H * 0.12);
      c.fill();
      c.fillStyle = '#6b4a2f';
      c.fillRect(X - H * 0.36, hy - H * 0.44, H * 0.72, H * 0.07);
    }
  }

  function accesorioPecho(c, oficio, X, by, rx, ry, top, H, anio, boina, auriculares, a) {
    if (oficio === 'fotografia') { // correa cruzada y cámara
      c.strokeStyle = '#2a1d14';
      c.lineWidth = Math.max(1, H * 0.05);
      trazo(c, X - rx * 0.62, top + ry * 0.12, X + rx * 0.55, by);
      c.fillStyle = '#202024';
      const cw = H * 0.36, ch = anio < 1950 ? H * 0.28 : H * 0.2, cx = X + rx * 0.05, cy = top + ry * 0.45;
      c.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
      c.fillRect(cx - cw * 0.15, cy - ch / 2 - H * 0.05, cw * 0.3, H * 0.05);
      c.fillStyle = '#6b7280';
      circulo(c, cx, cy, ch * 0.36);
      c.fill();
      c.fillStyle = '#0b0b0e';
      circulo(c, cx, cy, ch * 0.2);
      c.fill();
    } else if (oficio === 'direccion' && !boina) { // visor colgado del cuello
      c.strokeStyle = '#222';
      c.lineWidth = Math.max(0.8, H * 0.02);
      trazo(c, X - H * 0.1, top + H * 0.02, X, top + ry * 0.42);
      trazo(c, X + H * 0.1, top + H * 0.02, X, top + ry * 0.42);
      c.fillStyle = '#18181b';
      c.fillRect(X - H * 0.07, top + ry * 0.42, H * 0.14, H * 0.22);
      c.fillStyle = '#9aa5b1';
      circulo(c, X, top + ry * 0.42 + H * 0.2, H * 0.05);
      c.fill();
    } else if (oficio === 'arte' && !boina) { // bufanda
      c.fillStyle = `hsl(${((a.ropa | 0) + 120) % 360},70%,55%)`;
      elipse(c, X, top + H * 0.02, H * 0.26, H * 0.1);
      c.fill();
      c.fillRect(X + H * 0.06, top + H * 0.02, H * 0.11, ry * 0.6);
      c.fillStyle = 'rgba(255,255,255,.35)';
      c.fillRect(X + H * 0.06, top + ry * 0.35, H * 0.11, H * 0.04);
    } else if (oficio === 'musica' && !auriculares) { // prendedor de nota musical
      c.fillStyle = '#ffd166';
      const nx = X + rx * 0.38, ny = by - ry * 0.4;
      elipse(c, nx, ny, H * 0.055, H * 0.04, -0.4);
      c.fill();
      c.fillRect(nx + H * 0.035, ny - H * 0.2, H * 0.025, H * 0.2);
      c.fillRect(nx + H * 0.035, ny - H * 0.2, H * 0.08, H * 0.03);
    }
  }

  function accesorioCabeza(c, oficio, X, hy, H, era, boina, auriculares, a) {
    if (boina) {
      c.fillStyle = oficio === 'arte' ? '#b8322a' : '#1d1d24';
      elipse(c, X + H * 0.06, hy - H * 0.52, H * 0.48, H * 0.16, -0.12);
      c.fill();
      circulo(c, X + H * 0.08, hy - H * 0.68, H * 0.04);
      c.fill();
    }
    if (auriculares) {
      c.strokeStyle = '#26262b';
      c.lineWidth = H * 0.07;
      c.beginPath();
      c.arc(X, hy - H * 0.06, H * 0.5, Math.PI * 1.06, Math.PI * 1.94);
      c.stroke();
      c.fillStyle = era >= 4 ? `hsl(${((a.ropa | 0) + 200) % 360},70%,55%)` : '#3a3a40';
      rectRedondo(c, X - H * 0.57, hy - H * 0.17, H * 0.15, H * 0.3, H * 0.05);
      c.fill();
      rectRedondo(c, X + H * 0.42, hy - H * 0.17, H * 0.15, H * 0.3, H * 0.05);
      c.fill();
    }
    if (oficio === 'guion') { // lápiz detrás de la oreja
      c.save();
      c.translate(X + H * 0.46, hy - H * 0.12);
      c.rotate(-1.05);
      c.fillStyle = '#f2c230';
      c.fillRect(-H * 0.2, -H * 0.03, H * 0.38, H * 0.06);
      c.fillStyle = '#e88a9a';
      c.fillRect(-H * 0.26, -H * 0.03, H * 0.06, H * 0.06);
      c.fillStyle = '#3a2a1a';
      poligono(c, [H * 0.18, -H * 0.03, H * 0.26, 0, H * 0.18, H * 0.03]);
      c.restore();
    }
    if (oficio === 'produccion' && era >= 4) { // auricular de manos libres
      c.fillStyle = '#18181b';
      circulo(c, X + H * 0.44, hy - H * 0.01, H * 0.05);
      c.fill();
      c.strokeStyle = '#18181b';
      c.lineWidth = Math.max(0.8, H * 0.02);
      trazo(c, X + H * 0.44, hy, X + H * 0.2, hy + H * 0.16);
    }
  }

  const cacheRetratos = cacheLRU(300);
  function retratoEn(canvas, t, anio) {
    const L = prepararLienzo(canvas, 44, 44);
    if (!L || !t) return;
    const k = [t.id, t.sexo, t.edad, t.oficio, epocaRetrato(anio || 2000), anio >= 1960 ? 1 : 0,
      JSON.stringify(t.aspecto || 0), L.w, L.h, L.d].join('|');
    let img = cacheRetratos.tomar(k);
    if (!img) {
      img = crearLienzo(L.w * L.d, L.h * L.d);
      const c = img.getContext('2d');
      c.setTransform(L.d, 0, 0, L.d, 0, 0);
      retrato(c, L.w / 2, L.h / 2, Math.min(L.w, L.h) / 2, t, anio);
      cacheRetratos.poner(k, img);
    }
    L.c.drawImage(img, 0, 0, L.w, L.h);
  }

  /* =========================================================
     El estudio: edificio en corte que crece piso a piso
     ========================================================= */

  // Paleta por época: ladrillo y gas, art déco, neón, ochentas, vidrio, futuro.
  const EPOCAS = [
    { cielo: ['#1a1324', '#4d2e35', '#c27a42'], lejos: '#46303a', cerca: '#271a20', muro: '#8c3f2b', adorno: '#dcc59a', luz: '#ffc46b', calle: '#2b2522', vereda: '#5b4f45' },
    { cielo: ['#060a1c', '#17244c', '#3a5390'], lejos: '#24325a', cerca: '#121a35', muro: '#d8cba8', adorno: '#d4a62a', luz: '#ffd98a', calle: '#1c1e27', vereda: '#4a4c57' },
    { cielo: ['#14071f', '#40154f', '#b23a6f'], lejos: '#3c1b4c', cerca: '#1f0f2b', muro: '#62bdb3', adorno: '#ff6fa8', luz: '#ffe08a', calle: '#1e1a25', vereda: '#57505f' },
    { cielo: ['#0c0322', '#2d0b4e', '#ff4f8b'], lejos: '#2b1052', cerca: '#16082a', muro: '#8d92a6', adorno: '#22d3ee', luz: '#ffd1f0', calle: '#17131f', vereda: '#4a4458' },
    { cielo: ['#071428', '#173b64', '#4b88ba'], lejos: '#22405f', cerca: '#10223a', muro: '#5e6c80', adorno: '#a8d8ff', luz: '#eaf5ff', calle: '#1b2028', vereda: '#525a66' },
    { cielo: ['#03111b', '#0b3b4d', '#3bcfb4'], lejos: '#134a5c', cerca: '#082531', muro: '#e4edf7', adorno: '#35f0d0', luz: '#c9fff4', calle: '#0e1b23', vereda: '#3d5560' },
  ];
  const epocaEstudio = (a) => (a < 1915 ? 0 : a < 1946 ? 1 : a < 1975 ? 2 : a < 1995 ? 3 : a < 2030 ? 4 : 5);
  const estacionDe = (s) => (s <= 13 ? 0 : s <= 26 ? 1 : s <= 39 ? 2 : 3); // invierno, primavera, verano, otoño
  const ROPAS = ['#3d5a80', '#c8553d', '#6a4c93', '#2a9d8f', '#e9a03b', '#8d99ae', '#b5384a', '#577590'];
  const ropaDe = (k, i) => ROPAS[(k * 3 + i * 5) % ROPAS.length];
  const pielDe = (k, i) => PIELES[(k * 5 + i * 3 + 1) % PIELES.length];

  // Medidas de la escena (dependen solo del tamaño, la cantidad de pisos y los terrenos).
  function geometria(w, h, n, terrenos) {
    const g = { w, h };
    g.calle = Math.max(16, Math.round(h * 0.13));
    g.suelo = h - g.calle;
    g.ancho = Math.min(limitar(w * 0.34, 110, 300), w - 16);
    g.x0 = Math.round((w - g.ancho) / 2);
    g.muro = Math.max(3, g.ancho * 0.035);
    g.cartel = limitar(h * 0.1, 14, 36);
    const libre = g.suelo - g.cartel * 1.5 - h * 0.08;
    g.piso = Math.max(8, Math.min(h * 0.15, 60, libre / (n + 0.6)));
    g.losa = Math.max(2, g.piso * 0.1);
    g.vestibulo = g.piso * 0.6;
    g.techo = g.suelo - g.vestibulo - n * g.piso;
    g.cartelW = g.ancho * 0.94;
    g.cartelX = g.x0 + (g.ancho - g.cartelW) / 2;
    g.cartelY = g.techo - g.losa * 1.2 - g.cartel * 1.3;
    // terrenos a cada lado, desde el edificio hacia afuera
    g.lotes = [];
    ['izq', 'der'].forEach((lado) => {
      const lista = terrenos.filter((t) => (t.lado === 'izq' ? 'izq' : 'der') === lado);
      const espacio = g.x0 - 10;
      const ancho = Math.min(espacio / Math.max(1, lista.length), h * 0.7);
      lista.forEach((t, i) => {
        const x = lado === 'izq' ? g.x0 - 6 - (i + 1) * ancho : g.x0 + g.ancho + 6 + i * ancho;
        const lw = ancho - 4;
        g.lotes.push({ tipo: t.tipo, lado, i, x: x + 2, w: lw, alto: Math.min(lw * 0.75, h * 0.36) });
      });
    });
    // faroles en la vereda (no delante de la entrada)
    g.faroles = [];
    const paso = Math.max(64, w / 7);
    for (let x = paso * 0.5; x < w; x += paso) {
      if (x < g.x0 - 6 || x > g.x0 + g.ancho + 6) g.faroles.push(Math.round(x));
    }
    g.altoFarol = Math.min(g.piso * 1.5, h * 0.2);
    g.persona = limitar(g.piso * 0.8, 9, 32);
    return g;
  }

  // Caja interior del piso i (0 = abajo). base = línea del piso.
  function sala(g, i) {
    const arriba = g.suelo - g.vestibulo - (i + 1) * g.piso;
    return { x: g.x0 + g.muro, y: arriba + g.losa, w: g.ancho - 2 * g.muro, h: g.piso - g.losa, base: arriba + g.piso };
  }

  /* ---------- figuras y muebles chicos ---------- */

  // Persona de perfil mirando a la derecha. sentada: sin piernas largas; brazo: desplazamiento de la mano.
  function persona(c, x, base, u, ropaColor, piel, sentada, paso, brazo) {
    const cadera = base - u * (sentada ? 0.3 : 0.34);
    const hombro = cadera - u * 0.26;
    c.fillStyle = ropaColor;
    c.fillRect(x - u * 0.07, hombro, u * 0.14, cadera - hombro);
    if (sentada) {
      c.fillRect(x - u * 0.07, cadera - u * 0.05, u * 0.2, u * 0.06);
      c.fillRect(x + u * 0.09, cadera, u * 0.05, base - cadera);
    } else {
      const a = Math.sin(paso || 0) * u * 0.05;
      c.fillRect(x - u * 0.06 + a, cadera, u * 0.05, base - cadera);
      c.fillRect(x + u * 0.01 - a, cadera, u * 0.05, base - cadera);
    }
    if (brazo != null) {
      c.strokeStyle = ropaColor;
      c.lineWidth = Math.max(1, u * 0.05);
      c.lineCap = 'round';
      trazo(c, x, hombro + u * 0.04, x + u * 0.17, hombro + u * 0.1 + brazo);
    }
    c.fillStyle = piel;
    circulo(c, x + u * 0.01, hombro - u * 0.09, u * 0.085);
    c.fill();
  }

  function silla(c, x, base, u) {
    c.fillStyle = '#3a2a20';
    c.fillRect(x - u * 0.1, base - u * 0.3, u * 0.2, u * 0.04);
    c.fillRect(x - u * 0.1, base - u * 0.52, u * 0.035, u * 0.26);
    c.fillRect(x - u * 0.015, base - u * 0.27, u * 0.03, u * 0.27);
  }

  function mesa(c, x, base, ancho, u, color) {
    c.fillStyle = color || '#6b4a2f';
    c.fillRect(x, base - u * 0.38, ancho, u * 0.06);
    c.fillRect(x + u * 0.03, base - u * 0.33, u * 0.04, u * 0.33);
    c.fillRect(x + ancho - u * 0.07, base - u * 0.33, u * 0.04, u * 0.33);
  }

  // Pantalla sobre la mesa; devuelve la caja del vidrio para animarla.
  function pantalla(c, cx, yMesa, u, ep) {
    c.fillStyle = '#1a1d24';
    if (ep >= 4) {
      c.fillRect(cx - u * 0.17, yMesa - u * 0.3, u * 0.34, u * 0.22);
      c.fillRect(cx - u * 0.02, yMesa - u * 0.08, u * 0.04, u * 0.08);
      return { x: cx - u * 0.15, y: yMesa - u * 0.28, w: u * 0.3, h: u * 0.18 };
    }
    c.fillRect(cx - u * 0.13, yMesa - u * 0.26, u * 0.26, u * 0.26);
    return { x: cx - u * 0.1, y: yMesa - u * 0.23, w: u * 0.2, h: u * 0.16 };
  }

  // Posiciones de los puestos (persona + mesa) a partir de "desde" (en unidades u).
  function puestos(s, desde, max, reservaDer) {
    const u = s.h, r = [];
    for (let x = s.x + u * (desde + 0.2); x + u * 0.75 <= s.x + s.w - u * (reservaDer || 0.1) && r.length < max; x += u * 0.98) r.push(x);
    return r;
  }

  /* ---------- salas por tipo: fijo() va a la capa en caché, vivo() se dibuja cada cuadro ---------- */

  const SALAS = {
    oficinas: {
      fondo: '#e4d6b6',
      fijo(c, s, ep) {
        const u = s.h;
        c.fillStyle = '#fff';
        circulo(c, s.x + s.w - u * 0.3, s.y + u * 0.3, u * 0.1);
        c.fill();
        c.strokeStyle = '#333';
        c.lineWidth = 1;
        trazo(c, s.x + s.w - u * 0.3, s.y + u * 0.3, s.x + s.w - u * 0.3, s.y + u * 0.23);
        c.fillStyle = '#8d99ae';
        c.fillRect(s.x + s.w - u * 0.42, s.base - u * 0.5, u * 0.26, u * 0.5);
        c.fillStyle = 'rgba(0,0,0,.25)';
        c.fillRect(s.x + s.w - u * 0.42, s.base - u * 0.34, u * 0.26, 1);
        c.fillRect(s.x + s.w - u * 0.42, s.base - u * 0.17, u * 0.26, 1);
        puestos(s, 0, 5, 0.5).forEach((x) => {
          silla(c, x, s.base, u);
          mesa(c, x + u * 0.13, s.base, u * 0.6, u);
          if (ep >= 3) pantalla(c, x + u * 0.48, s.base - u * 0.38, u, ep);
          else {
            c.fillStyle = '#f4f1e8';
            c.fillRect(x + u * 0.3, s.base - u * 0.41, u * 0.18, u * 0.03);
            c.fillStyle = '#2f5d3a';
            c.fillRect(x + u * 0.58, s.base - u * 0.56, u * 0.03, u * 0.18);
            poligono(c, [x + u * 0.52, s.base - u * 0.5, x + u * 0.66, s.base - u * 0.5, x + u * 0.62, s.base - u * 0.6, x + u * 0.56, s.base - u * 0.6]);
          }
        });
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h, lista = puestos(s, 0, 5, 0.5), n = Math.ceil(act * lista.length);
        lista.forEach((x, i) => {
          if (i >= n) return;
          persona(c, x, s.base, u, ropaDe(k, i), pielDe(k, i), true, 0, Math.sin(f * 7 + i * 2) * u * 0.03);
          if (ep >= 3) {
            c.fillStyle = Math.sin(f * 2 + i) > 0 ? '#7fd1ff' : '#5fb0e0';
            const p = ep >= 4 ? [u * 0.33, u * 0.66, u * 0.3, u * 0.18] : [u * 0.38, u * 0.61, u * 0.2, u * 0.16];
            c.fillRect(x + p[0], s.base - p[1], p[2], p[3]);
          }
        });
        if (Math.sin(f * 5 + k) > 0.5) { // teléfono que suena
          c.fillStyle = '#ff4f81';
          circulo(c, s.x + s.w - u * 0.29, s.base - u * 0.56, u * 0.04);
          c.fill();
        }
      },
    },
    guion: {
      fondo: '#dccaa2',
      fijo(c, s, ep) {
        const u = s.h;
        c.fillStyle = '#a77d4e';
        c.fillRect(s.x + u * 0.15, s.y + u * 0.18, u * 0.75, u * 0.42);
        const tarjetas = ['#fff', '#ffe08a', '#ffb3c1', '#bde0fe', '#fff', '#caffbf'];
        tarjetas.forEach((col, i) => {
          c.fillStyle = col;
          c.fillRect(s.x + u * (0.2 + (i % 3) * 0.23), s.y + u * (0.23 + ((i / 3) | 0) * 0.18), u * 0.17, u * 0.12);
        });
        puestos(s, 1, 4).forEach((x) => {
          silla(c, x, s.base, u);
          mesa(c, x + u * 0.13, s.base, u * 0.6, u);
          if (ep >= 3) pantalla(c, x + u * 0.45, s.base - u * 0.38, u, ep);
          else {
            c.fillStyle = '#2b2b2b';
            c.fillRect(x + u * 0.3, s.base - u * 0.5, u * 0.3, u * 0.12);
            c.fillStyle = '#f7f3e8';
            c.fillRect(x + u * 0.36, s.base - u * 0.66, u * 0.18, u * 0.17);
          }
        });
        c.fillStyle = '#f7f3e8';
        for (let i = 0; i < 3; i++) { circulo(c, s.x + u * (0.3 + i * 0.13), s.base - u * 0.04, u * 0.04); c.fill(); }
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h, lista = puestos(s, 1, 4), n = Math.ceil(act * lista.length);
        lista.forEach((x, i) => {
          if (i >= n) return;
          persona(c, x, s.base, u, ropaDe(k, i + 2), pielDe(k, i + 1), true, 0, (Math.sin(f * 16 + i) > 0 ? -1 : 0) * u * 0.03);
          c.fillStyle = '#556';
          const lineas = Math.floor((f * act * 1.5 + i * 2) % 5);
          for (let l = 0; l < lineas; l++) {
            if (ep >= 3) c.fillRect(x + u * 0.36, s.base - u * (0.62 - l * 0.03), u * 0.16, Math.max(0.6, u * 0.015));
            else c.fillRect(x + u * 0.39, s.base - u * (0.63 - l * 0.025), u * 0.12, Math.max(0.6, u * 0.012));
          }
        });
      },
    },
    casting: {
      fondo: '#4e2433',
      fijo(c, s) {
        const u = s.h;
        c.fillStyle = '#7a1f2b';
        c.fillRect(s.x, s.y, u * 0.28, s.h);
        c.fillStyle = 'rgba(0,0,0,.25)';
        for (let i = 1; i < 4; i++) c.fillRect(s.x + i * u * 0.07, s.y, 1, s.h);
        const e = s.x + s.w * 0.55;
        c.fillStyle = '#6b4226';
        c.fillRect(e, s.base - u * 0.12, s.x + s.w - e - u * 0.05, u * 0.12);
        c.fillStyle = '#222';
        c.fillRect(e + (s.x + s.w - e) * 0.45 - u * 0.06, s.y, u * 0.12, u * 0.1);
        mesa(c, s.x + u * 0.75, s.base, Math.min(u * 1.1, s.w * 0.3), u, '#3a2a20');
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h, e = s.x + s.w * 0.55, cx = e + (s.x + s.w - e) * 0.45;
        if (act <= 0) return;
        c.fillStyle = `rgba(255,240,190,${0.16 + 0.06 * Math.sin(f * 3)})`;
        poligono(c, [cx - u * 0.05, s.y + u * 0.1, cx + u * 0.05, s.y + u * 0.1, cx + u * 0.4, s.base - u * 0.12, cx - u * 0.4, s.base - u * 0.12]);
        persona(c, cx + Math.sin(f * 1.5) * u * 0.15, s.base - u * 0.12, u * 0.95, ropaDe(k, 1), pielDe(k, 2), false, f * 3, -u * (0.12 + 0.08 * Math.sin(f * 4)));
        persona(c, s.x + u * 0.55, s.base, u, ropaDe(k, 3), pielDe(k, 0), true, 0, 0);
        if (act > 0.5) persona(c, s.x + u * 0.55 + Math.min(u * 0.5, s.w * 0.14), s.base, u, ropaDe(k, 4), pielDe(k, 3), true, 0, Math.sin(f * 2) * u * 0.04);
      },
    },
    plato: {
      fondo: '#262b36',
      fijo(c, s, ep, k) {
        const u = s.h, fx = s.x + s.w * 0.45, fw = s.w * 0.55 - u * 0.1;
        c.fillStyle = ['#3b6ea5', '#a5673b', '#3b8a5c', '#6a3b8a'][k % 4];
        c.fillRect(fx, s.y + u * 0.12, fw, s.base - s.y - u * 0.12);
        c.fillStyle = 'rgba(255,255,255,.75)';
        circulo(c, fx + fw * 0.75, s.y + u * 0.32, u * 0.1);
        c.fill();
        c.fillStyle = 'rgba(0,0,0,.25)';
        c.fillRect(fx + fw * 0.2, s.base - u * 0.5, fw * 0.18, u * 0.5);
        // cámara en trípode
        const cx = s.x + u * 0.45;
        c.strokeStyle = '#111';
        c.lineWidth = Math.max(1, u * 0.03);
        trazo(c, cx, s.base - u * 0.4, cx - u * 0.12, s.base);
        trazo(c, cx, s.base - u * 0.4, cx + u * 0.12, s.base);
        c.fillStyle = '#16161a';
        c.fillRect(cx - u * 0.14, s.base - u * 0.58, u * 0.3, u * 0.18);
        c.fillRect(cx + u * 0.16, s.base - u * 0.54, u * 0.1, u * 0.1);
        if (ep < 3) {
          circulo(c, cx - u * 0.05, s.base - u * 0.66, u * 0.09);
          c.fill();
          circulo(c, cx + u * 0.1, s.base - u * 0.66, u * 0.09);
          c.fill();
        }
        // foco
        const lx = s.x + s.w * 0.38;
        trazo(c, lx, s.base, lx, s.base - u * 0.6);
        c.fillStyle = '#333';
        c.fillRect(lx - u * 0.08, s.base - u * 0.7, u * 0.16, u * 0.12);
      },
      vivo(c, s, ep, f, act, k, rodaje) {
        const u = s.h, fx = s.x + s.w * 0.45, fw = s.w * 0.55 - u * 0.1, lx = s.x + s.w * 0.38;
        if (act > 0) {
          c.fillStyle = `rgba(255,245,200,${0.12 + 0.05 * Math.sin(f * 2 + k)})`;
          poligono(c, [lx + u * 0.08, s.base - u * 0.7, lx + u * 0.08, s.base - u * 0.58, fx + fw * 0.8, s.base, fx + fw * 0.1, s.base]);
          persona(c, fx + fw * (0.3 + 0.12 * Math.sin(f * 0.9 + k)), s.base, u, ropaDe(k, 0), pielDe(k, 0), false, f * 4, Math.sin(f * 3) * u * 0.08);
          if (act > 0.4) persona(c, fx + fw * (0.62 + 0.08 * Math.sin(f * 1.3)), s.base, u * 0.95, ropaDe(k, 5), pielDe(k, 4), false, f * 4 + 1, null);
          if (Math.sin(f * 4) > 0) { // luz de grabación
            c.fillStyle = '#ff3b3b';
            circulo(c, s.x + u * 0.36, s.base - u * 0.63, u * 0.035);
            c.fill();
          }
        }
        if (rodaje) {
          const bw = Math.min(s.w * 0.42, u * 3), bx = s.x + s.w - bw - u * 0.15, by = s.y + u * 0.04, bh = Math.max(3, u * 0.09);
          c.fillStyle = 'rgba(0,0,0,.6)';
          c.fillRect(bx, by, bw, bh);
          c.fillStyle = '#35d0ba';
          c.fillRect(bx, by, bw * limitar(+rodaje.progreso || 0, 0, 1), bh);
          if (u >= 18) {
            c.font = `600 ${limitar(u * 0.18, 6, 11)}px sans-serif`;
            c.fillStyle = '#fff';
            c.textAlign = 'right';
            c.textBaseline = 'top';
            c.fillText(String(rodaje.titulo || ''), bx + bw, by + bh + 2, bw);
          }
        }
      },
    },
    edicion: {
      fondo: '#2b3550',
      fijo(c, s, ep) {
        const u = s.h;
        if (ep < 3) { // tiras de película colgadas
          for (let i = 0; i < 3; i++) {
            const x = s.x + u * (0.15 + i * 0.16);
            c.fillStyle = '#4a3a2a';
            c.fillRect(x, s.y + u * 0.1, u * 0.09, u * 0.55);
            c.fillStyle = '#d9c39a';
            for (let y = s.y + u * 0.14; y < s.y + u * 0.6; y += u * 0.08) c.fillRect(x + u * 0.025, y, u * 0.04, u * 0.04);
          }
        }
        puestos(s, ep < 3 ? 0.6 : 0, 4).forEach((x) => {
          silla(c, x, s.base, u);
          mesa(c, x + u * 0.13, s.base, u * 0.62, u, '#3c4256');
          if (ep >= 3) pantalla(c, x + u * 0.46, s.base - u * 0.38, u, ep);
        });
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h, lista = puestos(s, ep < 3 ? 0.6 : 0, 4), n = Math.max(1, Math.ceil(act * lista.length));
        lista.forEach((x, i) => {
          const activo = act > 0 && i < n;
          if (activo) persona(c, x, s.base, u, ropaDe(k, i + 1), pielDe(k, i + 2), true, 0, Math.sin(f * 3 + i) * u * 0.02);
          if (ep < 3) { // moviola: dos bobinas que giran
            [0.3, 0.6].forEach((dx) => {
              const rx = x + u * dx, ry = s.base - u * 0.5, r = u * 0.11;
              c.fillStyle = '#9aa5b1';
              circulo(c, rx, ry, r);
              c.fill();
              c.strokeStyle = '#2b3550';
              c.lineWidth = Math.max(1, u * 0.025);
              const giro = activo ? f * 4 : 0;
              for (let j = 0; j < 3; j++) trazo(c, rx, ry, rx + Math.cos(giro + j * 2.09) * r, ry + Math.sin(giro + j * 2.09) * r);
            });
          } else if (activo) { // línea de tiempo con cabezal
            const p = ep >= 4 ? [0.31, 0.66, 0.3, 0.18] : [0.36, 0.61, 0.2, 0.16];
            const px = x + u * p[0], py = s.base - u * p[1], pw = u * p[2], ph = u * p[3];
            c.fillStyle = '#e9a03b';
            c.fillRect(px + pw * 0.05, py + ph * 0.55, pw * 0.4, ph * 0.18);
            c.fillStyle = '#5b8cff';
            c.fillRect(px + pw * 0.5, py + ph * 0.55, pw * 0.45, ph * 0.18);
            c.fillStyle = '#ff4f81';
            c.fillRect(px + pw * (((f * 0.3 + i * 0.3) % 1)), py + ph * 0.3, 1, ph * 0.6);
          }
        });
      },
    },
    sonido: {
      fondo: '#3a2f4a',
      fijo(c, s, ep) {
        const u = s.h;
        c.fillStyle = 'rgba(0,0,0,.15)';
        for (let y = s.y + u * 0.15; y < s.base - u * 0.4; y += u * 0.16) {
          for (let x = s.x + u * 0.1; x < s.x + s.w * 0.6; x += u * 0.16) c.fillRect(x, y, u * 0.12, u * 0.12);
        }
        const cx = s.x + u * 0.4;
        silla(c, cx, s.base, u);
        mesa(c, cx + u * 0.13, s.base, u * 1.05, u, '#2a2433');
        c.fillStyle = '#4b4458';
        poligono(c, [cx + u * 0.18, s.base - u * 0.38, cx + u * 1.14, s.base - u * 0.38, cx + u * 1.08, s.base - u * 0.52, cx + u * 0.26, s.base - u * 0.52]);
        // cabina con micrófono
        const vx = s.x + s.w - u * 1.0;
        c.fillStyle = '#8fb3c9';
        c.fillRect(vx, s.y + u * 0.2, u * 0.85, u * 0.45);
        c.strokeStyle = '#222';
        c.lineWidth = Math.max(1, u * 0.04);
        c.strokeRect(vx, s.y + u * 0.2, u * 0.85, u * 0.45);
        c.fillStyle = '#222';
        c.fillRect(vx + u * 0.6, s.y + u * 0.42, u * 0.02, u * 0.23);
        circulo(c, vx + u * 0.61, s.y + u * 0.4, u * 0.04);
        c.fill();
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h, cx = s.x + u * 0.4, vx = s.x + s.w - u * 1.0;
        if (act > 0) {
          persona(c, cx, s.base, u, ropaDe(k, 2), pielDe(k, 5), true, 0, Math.sin(f * 2) * u * 0.03);
          c.save();
          c.beginPath();
          c.rect(vx, s.y + u * 0.2, u * 0.85, u * 0.45);
          c.clip();
          persona(c, vx + u * 0.4, s.y + u * 0.95 + Math.sin(f * 5) * u * 0.02, u * 0.9, ropaDe(k, 6), pielDe(k, 6), false, 0, -u * 0.1);
          c.restore();
        }
        for (let i = 0; i < 6; i++) { // medidores de nivel
          const v = act > 0 ? 0.25 + 0.75 * Math.abs(Math.sin(f * (4 + i) + i * 1.7)) * act : 0.08;
          c.fillStyle = v > 0.8 ? '#ff4f81' : '#35d0ba';
          c.fillRect(cx + u * (0.35 + i * 0.11), s.base - u * 0.52 - u * 0.2 * v, u * 0.06, u * 0.2 * v);
        }
      },
    },
    efectos: {
      fondo: '#1f3a2f',
      fijo(c, s, ep) {
        const u = s.h;
        if (ep >= 3) {
          c.fillStyle = '#2fa84f';
          c.fillRect(s.x + s.w * 0.5, s.y, s.w * 0.5, s.h);
          puestos(s, 0, 2, s.w * 0.5 / u).forEach((x) => {
            silla(c, x, s.base, u);
            mesa(c, x + u * 0.13, s.base, u * 0.6, u, '#2a3a33');
            pantalla(c, x + u * 0.46, s.base - u * 0.38, u, ep);
          });
        } else { // maqueta de ciudad y caballete con matte painting
          mesa(c, s.x + u * 0.2, s.base, s.w * 0.45, u, '#5a4632');
          const q = azar(77);
          for (let x = s.x + u * 0.25; x < s.x + u * 0.15 + s.w * 0.45; x += u * 0.14) {
            const bh = u * (0.08 + q() * 0.18);
            c.fillStyle = q() < 0.5 ? '#9aa5b1' : '#c8b28a';
            c.fillRect(x, s.base - u * 0.38 - bh, u * 0.11, bh);
          }
          const ex = s.x + s.w * 0.75;
          c.strokeStyle = '#5a4632';
          c.lineWidth = Math.max(1, u * 0.03);
          trazo(c, ex, s.base - u * 0.75, ex - u * 0.2, s.base);
          trazo(c, ex, s.base - u * 0.75, ex + u * 0.2, s.base);
          c.fillStyle = '#7fb3d5';
          c.fillRect(ex - u * 0.3, s.base - u * 0.72, u * 0.6, u * 0.4);
          c.fillStyle = '#4a6b5a';
          poligono(c, [ex - u * 0.3, s.base - u * 0.32, ex - u * 0.1, s.base - u * 0.58, ex + u * 0.08, s.base - u * 0.4, ex + u * 0.3, s.base - u * 0.55, ex + u * 0.3, s.base - u * 0.32]);
        }
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h;
        if (act <= 0) return;
        if (ep >= 3) {
          puestos(s, 0, 2, s.w * 0.5 / u).forEach((x, i) => {
            persona(c, x, s.base, u, ropaDe(k, i), pielDe(k, i + 3), true, 0, Math.sin(f * 6 + i) * u * 0.02);
            const p = ep >= 4 ? [0.46, 0.57, 0.07] : [0.46, 0.53, 0.06]; // cubo que gira en la pantalla
            const cx = x + u * p[0], cy = s.base - u * p[1], r = u * p[2], a = f * 1.5 + i;
            c.strokeStyle = '#7fffd4';
            c.lineWidth = 1;
            c.strokeRect(cx - r * Math.abs(Math.cos(a)), cy - r, 2 * r * Math.abs(Math.cos(a)), 2 * r);
          });
          const x = s.x + s.w * (0.7 + 0.08 * Math.sin(f * 0.8));
          persona(c, x, s.base - Math.abs(Math.sin(f * 3)) * u * 0.12, u, '#1d1d1d', pielDe(k, 2), false, f * 6, -u * 0.12);
        } else {
          const px = s.x + u * 0.2 + s.w * 0.22, py = s.y + u * 0.05; // cohete colgado de un hilo
          const ang = Math.sin(f * 1.8) * 0.5, rx = px + Math.sin(ang) * u * 0.35, ry = py + Math.cos(ang) * u * 0.35;
          c.strokeStyle = 'rgba(255,255,255,.5)';
          c.lineWidth = 0.7;
          trazo(c, px, py, rx, ry);
          c.fillStyle = '#d9d9d9';
          elipse(c, rx, ry, u * 0.12, u * 0.04, ang * 0.3);
          c.fill();
          c.fillStyle = Math.sin(f * 20) > 0 ? '#ffb347' : '#ff4f4f';
          circulo(c, rx - u * 0.13, ry, u * 0.03);
          c.fill();
          persona(c, s.x + s.w * 0.75 - u * 0.45, s.base, u, ropaDe(k, 7), pielDe(k, 1), false, 0, Math.sin(f * 4) * u * 0.06);
        }
      },
    },
    archivo: {
      fondo: '#4a3a2a',
      fijo(c, s, ep) {
        const u = s.h, filas = 3;
        for (let r = 0; r < filas; r++) {
          const y = s.y + u * (0.3 + r * 0.25);
          c.fillStyle = '#2b2016';
          c.fillRect(s.x + u * 0.1, y, s.w - u * 0.2, Math.max(1, u * 0.04));
          for (let x = s.x + u * 0.15; x < s.x + s.w - u * 0.2; x += u * 0.13) {
            c.fillStyle = ep >= 4 ? '#5b6b80' : '#b9bec7';
            if (ep >= 4) c.fillRect(x, y - u * 0.15, u * 0.1, u * 0.15);
            else { circulo(c, x + u * 0.05, y - u * 0.07, u * 0.065); c.fill(); }
          }
        }
        c.strokeStyle = '#8a6a44';
        c.lineWidth = Math.max(1, u * 0.03);
        const lx = s.x + s.w * 0.7;
        trazo(c, lx, s.base, lx + u * 0.18, s.y + u * 0.1);
        trazo(c, lx + u * 0.15, s.base, lx + u * 0.33, s.y + u * 0.1);
      },
      vivo(c, s, ep, f, act, k) {
        if (act <= 0) return;
        const u = s.h, x = s.x + u * 0.4 + (s.w - u * 0.8) * (0.5 + 0.5 * Math.sin(f * 0.5 * (0.5 + act) + k));
        persona(c, x, s.base, u, ropaDe(k, 4), pielDe(k, 4), false, f * 5, -u * 0.05);
      },
    },
    marketing: {
      fondo: '#ecd5cf',
      fijo(c, s, ep, k) {
        const u = s.h, q = azar(500 + k);
        for (let x = s.x + u * 0.15; x < s.x + s.w * 0.6; x += u * 0.3) {
          c.fillStyle = `hsl(${(q() * 360) | 0},55%,45%)`;
          c.fillRect(x, s.y + u * 0.18, u * 0.22, u * 0.33);
          c.fillStyle = 'rgba(255,255,255,.6)';
          circulo(c, x + u * 0.11, s.y + u * 0.3, u * 0.05);
          c.fill();
        }
        const ex = s.x + s.w * 0.78;
        c.strokeStyle = '#5a4632';
        c.lineWidth = Math.max(1, u * 0.03);
        trazo(c, ex, s.base - u * 0.7, ex - u * 0.18, s.base);
        trazo(c, ex, s.base - u * 0.7, ex + u * 0.18, s.base);
        c.fillStyle = '#fff';
        c.fillRect(ex - u * 0.28, s.base - u * 0.75, u * 0.56, u * 0.4);
      },
      vivo(c, s, ep, f, act, k) {
        const u = s.h, ex = s.x + s.w * 0.78;
        for (let i = 0; i < 3; i++) { // gráfico que sube
          const v = act > 0 ? 0.3 + 0.7 * Math.abs(Math.sin(f * 0.8 + i)) : 0.3 + i * 0.2;
          c.fillStyle = ['#35d0ba', '#ffc857', '#ff4f81'][i];
          c.fillRect(ex - u * 0.22 + i * u * 0.16, s.base - u * 0.38 - u * 0.3 * v, u * 0.11, u * 0.3 * v);
        }
        if (act <= 0) return;
        persona(c, ex - u * 0.6, s.base, u, ropaDe(k, 6), pielDe(k, 7), false, 0, -u * (0.06 + 0.05 * Math.sin(f * 3)));
        if (Math.sin(f * 3 + k) > 0.3) {
          c.fillStyle = '#ffc857';
          c.font = `${Math.max(6, u * 0.3)}px sans-serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('★', s.x + u * 0.26, s.y + u * 0.14);
        }
      },
    },
  };

  /* ---------- capas en caché ---------- */

  // Cielo y ciudad del fondo. Guarda en "extra" lo que luego se anima (humo, faros, neones).
  function pintarFondo(c, g, E, ep, est, extra) {
    const w = g.w, s = g.suelo, q = azar(hash('ciudad|' + ep + '|' + Math.round(w)));
    const cielo = c.createLinearGradient(0, 0, 0, s);
    cielo.addColorStop(0, E.cielo[0]);
    cielo.addColorStop(0.62, E.cielo[1]);
    cielo.addColorStop(1, E.cielo[2]);
    c.fillStyle = cielo;
    c.fillRect(0, 0, w, s);
    c.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < (ep === 0 ? 14 : 40); i++) c.fillRect(q() * w, q() * s * 0.5, 1.2, 1.2);
    if (ep === 3) { // sol sintético con franjas
      const sx = w * 0.8, sy = s - g.h * 0.2, r = g.h * 0.14;
      const sol = c.createLinearGradient(0, sy - r, 0, sy + r);
      sol.addColorStop(0, '#ffe66d');
      sol.addColorStop(1, '#ff2e88');
      c.fillStyle = sol;
      circulo(c, sx, sy, r);
      c.fill();
      c.fillStyle = E.cielo[2];
      for (let i = 0; i < 5; i++) c.fillRect(sx - r, sy + r * (0.1 + i * 0.18), r * 2, r * 0.05 * (i + 1));
    } else { // luna
      const lx = w * 0.86, ly = g.h * 0.14, r = g.h * 0.045;
      c.fillStyle = ep === 0 ? 'rgba(255,230,190,.8)' : 'rgba(255,250,235,.9)';
      circulo(c, lx, ly, r);
      c.fill();
      c.fillStyle = E.cielo[0];
      circulo(c, lx + r * 0.45, ly - r * 0.2, r * 0.85);
      c.fill();
    }
    // dos capas de ciudad: lejos (clara) y cerca (oscura, con ventanas)
    const alturas = [[0.08, 0.2], [0.14, 0.42], [0.12, 0.32], [0.15, 0.45], [0.2, 0.58], [0.22, 0.66]][ep];
    for (let capa = 0; capa < 2; capa++) {
      const cerca = capa === 1;
      for (let x = -q() * 15; x < w;) {
        const bw = s * (cerca ? 0.1 : 0.13) * (0.7 + q() * 0.9);
        const bh = s * (alturas[0] + q() * (alturas[1] - alturas[0])) * (cerca ? 0.78 : 1);
        const top = s - bh;
        c.fillStyle = cerca ? E.cerca : E.lejos;
        c.fillRect(x, top, bw - 1, bh);
        techoCiudad(c, x, top, bw - 1, bh, ep, q, cerca, extra, E);
        if (cerca) ventanasCiudad(c, x, top, bw - 1, bh, ep, q, E);
        x += bw + (q() < 0.2 ? s * 0.03 : 0);
      }
    }
  }

  function techoCiudad(c, x, top, bw, bh, ep, q, cerca, extra, E) {
    const r = q();
    if (ep === 0) {
      if (r < 0.6) poligono(c, [x, top, x + bw / 2, top - bw * 0.35, x + bw, top]);
      if (q() < 0.5) {
        c.fillRect(x + bw * 0.7, top - bw * 0.4, bw * 0.1, bw * 0.4);
        if (cerca) extra.humos.push([x + bw * 0.75, top - bw * 0.4]);
      }
      if (r > 0.94) poligono(c, [x + bw * 0.4, top, x + bw * 0.5, top - bh * 1.2, x + bw * 0.6, top]);
    } else if (ep === 1) {
      if (r < 0.55) {
        c.fillRect(x + bw * 0.15, top - bh * 0.12, bw * 0.7, bh * 0.12);
        c.fillRect(x + bw * 0.3, top - bh * 0.2, bw * 0.4, bh * 0.08);
        c.fillRect(x + bw * 0.48, top - bh * 0.32, bw * 0.04, bh * 0.12);
      }
    } else if (ep === 2 || ep === 3) {
      if (ep === 3 && r < 0.3) poligono(c, [x, top, x + bw, top - bw * 0.4, x + bw, top]);
      if (cerca && q() < 0.3) extra.neones.push([x + bw * 0.1, top - bw * 0.35, bw * 0.8, bw * 0.28, q() < 0.5 ? E.adorno : '#ffe066']);
    } else if (ep === 4) {
      if (r < 0.35) poligono(c, [x, top, x + bw, top - bw * 0.5, x + bw, top]);
      if (cerca && q() < 0.4) extra.faros.push([x + bw / 2, top - 2, '#ff3b3b']);
    } else {
      elipse(c, x + bw / 2, top, bw / 2, bw * 0.35, 0, Math.PI, 0);
      c.fill();
      if (r < 0.4) {
        c.strokeStyle = cerca ? E.adorno : 'rgba(53,240,208,.4)';
        c.lineWidth = 1;
        elipse(c, x + bw / 2, top + bh * 0.2, bw * 0.7, bw * 0.12);
        c.stroke();
      }
      if (cerca && q() < 0.4) extra.faros.push([x + bw / 2, top - bw * 0.35, '#7ffcff']);
    }
  }

  function ventanasCiudad(c, x, top, bw, bh, ep, q, E) {
    if (ep === 4) { // torres de vidrio: franjas de reflejo
      c.fillStyle = 'rgba(170,215,255,.12)';
      for (let i = 1; i < 4; i++) c.fillRect(x + (bw * i) / 4, top, 1, bh);
      c.fillStyle = rgba(E.luz, 0.35);
      for (let y = top + 4; y < top + bh - 4; y += 7) if (q() < 0.25) c.fillRect(x + 2, y, bw - 4, 2);
      return;
    }
    if (ep === 5) {
      c.fillStyle = rgba(E.adorno, 0.3);
      for (let y = top + 5; y < top + bh - 3; y += 8) c.fillRect(x + 2, y, bw - 4, 1);
      return;
    }
    c.fillStyle = rgba(E.luz, ep === 0 ? 0.5 : 0.6);
    const paso = Math.max(4, bw / 5);
    for (let y = top + 4; y < top + bh - 5; y += paso * 1.3) {
      for (let xx = x + 2; xx < x + bw - 3; xx += paso) if (q() < (ep === 0 ? 0.25 : 0.33)) c.fillRect(xx, y, paso * 0.45, paso * 0.6);
    }
  }

  // Calle, terrenos y edificio (la capa del frente, transparente arriba).
  function pintarFrente(c, g, E, ep, est, datos, extra) {
    const w = g.w, h = g.h, s = g.suelo;
    c.fillStyle = E.vereda;
    c.fillRect(0, s, w, g.calle * 0.3);
    c.fillStyle = E.calle;
    c.fillRect(0, s + g.calle * 0.3, w, h);
    c.fillStyle = 'rgba(0,0,0,.25)';
    c.fillRect(0, s + g.calle * 0.3 - 1, w, 1);
    if (ep === 0) { // adoquines
      c.fillStyle = 'rgba(255,255,255,.06)';
      for (let y = s + g.calle * 0.38; y < h; y += 4) for (let x = (y % 8) / 2; x < w; x += 7) c.fillRect(x, y, 4, 2);
    } else {
      c.fillStyle = ep === 5 ? rgba(E.adorno, 0.5) : 'rgba(255,220,120,.55)';
      for (let x = 4; x < w; x += 22) c.fillRect(x, s + g.calle * 0.66, 11, 2);
    }
    g.lotes.forEach((L) => loteFijo(c, L, g, E, ep));
    edificioFijo(c, g, E, ep, datos.pisos, extra);
    g.faroles.forEach((x) => { // postes de los faroles
      const y = s + g.calle * 0.22, top = y - g.altoFarol;
      c.fillStyle = ep >= 4 ? '#8a94a3' : '#1b1b1f';
      if (ep === 5) return;
      c.fillRect(x - 1, top, 2.2, g.altoFarol);
      if (ep === 2 || ep === 3 || ep === 4) c.fillRect(x, top, g.altoFarol * 0.22, 2);
      else {
        c.fillRect(x - 3, top - 5, 6, 6);
        if (ep === 1) c.fillRect(x - 5, top + 2, 10, 1.5);
      }
    });
    if (est === 0) { // nieve sobre bordes
      c.fillStyle = 'rgba(255,255,255,.85)';
      c.fillRect(g.x0 - g.muro * 0.5, g.techo - g.losa * 1.2 - 2, g.ancho + g.muro, 2.5);
      c.fillRect(0, s, w, 2);
      g.lotes.forEach((L) => c.fillRect(L.x, s - 2, L.w, 2));
    }
    c.globalCompositeOperation = 'source-atop'; // tinte de estación solo sobre lo dibujado
    c.fillStyle = ['rgba(150,190,255,.1)', 'rgba(255,170,200,.04)', 'rgba(255,190,90,.06)', 'rgba(255,120,40,.08)'][est];
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'source-over';
  }

  function valla(c, x, s, w, alto, ep) {
    const vh = Math.max(3, alto * 0.12);
    if (ep <= 1) {
      c.fillStyle = ep === 0 ? '#7a5a3a' : '#2b2b30';
      c.fillRect(x, s - vh * 0.7, w, 1.2);
      for (let px = x; px <= x + w; px += 4) c.fillRect(px, s - vh, 1.4, vh);
    } else if (ep <= 3) {
      c.strokeStyle = 'rgba(200,200,210,.45)';
      c.lineWidth = 0.6;
      for (let px = x; px < x + w; px += 4) { trazo(c, px, s, px + 4, s - vh); trazo(c, px + 4, s, px, s - vh); }
      c.fillStyle = '#777';
      for (let px = x; px <= x + w; px += 16) c.fillRect(px, s - vh - 1, 1.5, vh + 1);
    } else {
      c.fillStyle = ep === 5 ? '#d5e2ee' : '#3a4250';
      c.fillRect(x, s - vh * 0.6, w, vh * 0.6);
      c.fillStyle = ep === 5 ? '#35f0d0' : '#a8d8ff';
      c.fillRect(x, s - vh * 0.6, w, 1);
    }
  }

  function loteFijo(c, L, g, E, ep) {
    const s = g.suelo, x = L.x, w = L.w, alto = L.alto, q = azar(hash('lote|' + L.lado + L.i));
    c.fillStyle = L.tipo === 'vacio' ? '#4a3b2c' : 'rgba(0,0,0,.3)';
    c.fillRect(x, s - 2, w, 3);
    if (L.tipo === 'backlot') { // fachadas falsas: western, ciudad o castillo
      const n = w > alto * 1.3 ? 3 : 2, fw = (w * 0.9) / n;
      for (let i = 0; i < n; i++) {
        const fx = x + w * 0.05 + i * fw, fh = alto * (0.5 + q() * 0.4), estilo = (q() * 3) | 0;
        if (estilo === 0) {
          c.fillStyle = ['#a0703c', '#8a5a34', '#b5834d'][i % 3];
          c.fillRect(fx, s - fh, fw - 2, fh);
          c.fillRect(fx + fw * 0.15, s - fh - fh * 0.15, fw * 0.7 - 2, fh * 0.15);
          c.fillStyle = '#f2e3c4';
          c.fillRect(fx + fw * 0.15, s - fh * 0.92, fw * 0.7 - 2, fh * 0.12);
          c.fillStyle = '#2a1a10';
          c.fillRect(fx + fw * 0.38, s - fh * 0.45, fw * 0.24, fh * 0.45);
        } else if (estilo === 1) {
          c.fillStyle = ['#7a3b2e', '#5c4a3d', '#6b5b73'][i % 3];
          c.fillRect(fx, s - fh, fw - 2, fh);
          c.fillStyle = rgba(E.luz, 0.5);
          for (let y = s - fh + 4; y < s - 6; y += 7) for (let xx = fx + 3; xx < fx + fw - 6; xx += 6) c.fillRect(xx, y, 3, 4);
        } else {
          c.fillStyle = '#8e8e96';
          c.fillRect(fx, s - fh, fw - 2, fh);
          for (let xx = fx; xx < fx + fw - 4; xx += 6) c.fillRect(xx, s - fh - 4, 3.5, 4);
          c.fillStyle = '#2a2a30';
          elipse(c, fx + fw / 2 - 1, s - fh * 0.3, fw * 0.16, fh * 0.3, 0, Math.PI, 0);
          c.fill();
          c.fillRect(fx + fw / 2 - 1 - fw * 0.16, s - fh * 0.3, fw * 0.32, fh * 0.3);
        }
      }
    } else if (L.tipo === 'foso') { // telón de cielo y tanque de agua
      c.fillStyle = '#8fc4e8';
      c.fillRect(x + w * 0.1, s - alto, w * 0.8, alto * 0.72);
      c.fillStyle = 'rgba(255,255,255,.8)';
      elipse(c, x + w * 0.35, s - alto * 0.78, w * 0.12, alto * 0.06);
      c.fill();
      elipse(c, x + w * 0.65, s - alto * 0.62, w * 0.1, alto * 0.05);
      c.fill();
      c.fillStyle = '#7d8794';
      c.fillRect(x, s - alto * 0.3, w, alto * 0.3);
      c.fillStyle = '#2f7fb5';
      c.fillRect(x + 3, s - alto * 0.27, w - 6, alto * 0.22);
    } else if (L.tipo && L.tipo.indexOf('t_') === 0) { // tierras propias para rodar (V19): un paisaje chico
      const ter = L.tipo.slice(2);
      const cielo = { artico: '#cfe3f2', desierto: '#f2d9a4', tropico: '#9fd6c9', mar: '#9cc8ea' }[ter] || '#a9cde8';
      const suelo = { artico: '#f4f8fb', desierto: '#e0b56a', tropico: '#3f9a52', mar: '#2f7fb5', pradera: '#7fb24f', bosque: '#3d7a3c', montana: '#7b7f86', ciudad: '#666a73' }[ter] || '#6a8a4a';
      c.fillStyle = cielo;
      c.fillRect(x + w * 0.04, s - alto * 0.8, w * 0.92, alto * 0.8);
      c.fillStyle = suelo;
      c.fillRect(x + w * 0.04, s - alto * 0.22, w * 0.92, alto * 0.22);
      if (ter === 'montana' || ter === 'artico') {
        c.fillStyle = ter === 'artico' ? '#ffffff' : '#8d9198';
        c.beginPath(); c.moveTo(x + w * 0.1, s - alto * 0.22); c.lineTo(x + w * 0.4, s - alto * 0.72); c.lineTo(x + w * 0.7, s - alto * 0.22); c.fill();
        c.beginPath(); c.moveTo(x + w * 0.45, s - alto * 0.22); c.lineTo(x + w * 0.7, s - alto * 0.6); c.lineTo(x + w * 0.92, s - alto * 0.22); c.fill();
      } else if (ter === 'bosque' || ter === 'tropico' || ter === 'pradera') {
        const n = ter === 'pradera' ? 1 : 3;
        for (let i = 0; i < n; i++) {
          const tx = x + w * (0.2 + i * 0.28 + q() * 0.06);
          c.fillStyle = '#5b3a1e';
          c.fillRect(tx - 1.5, s - alto * 0.42, 3, alto * 0.22);
          c.fillStyle = ter === 'tropico' ? '#2e8f4a' : '#2f6b33';
          elipse(c, tx, s - alto * 0.48, w * 0.09, alto * 0.12);
          c.fill();
        }
      } else if (ter === 'desierto') {
        c.fillStyle = '#4c8a3e';
        c.fillRect(x + w * 0.62, s - alto * 0.5, w * 0.06, alto * 0.28);
        c.fillRect(x + w * 0.56, s - alto * 0.42, w * 0.06, alto * 0.05);
        c.fillStyle = '#f7c948';
        elipse(c, x + w * 0.25, s - alto * 0.62, w * 0.07, w * 0.07);
        c.fill();
      } else if (ter === 'mar') {
        c.fillStyle = '#ffffff';
        c.beginPath(); c.moveTo(x + w * 0.45, s - alto * 0.3); c.lineTo(x + w * 0.55, s - alto * 0.62); c.lineTo(x + w * 0.55, s - alto * 0.3); c.fill();
        c.fillStyle = '#7a4a2a';
        c.fillRect(x + w * 0.36, s - alto * 0.3, w * 0.28, alto * 0.06);
      } else if (ter === 'ciudad') {
        for (let i = 0; i < 3; i++) {
          const bh = alto * (0.35 + q() * 0.35);
          c.fillStyle = ['#5c4a3d', '#4a5568', '#7a3b2e'][i];
          c.fillRect(x + w * (0.1 + i * 0.28), s - alto * 0.22 - bh, w * 0.22, bh);
        }
      }
    } else if (L.tipo === 'captura') { // galpón oscuro con rejilla
      c.fillStyle = '#1d2230';
      c.fillRect(x + w * 0.05, s - alto * 0.85, w * 0.9, alto * 0.85);
      c.fillStyle = '#2a3245';
      c.fillRect(x + w * 0.1, s - alto * 0.75, w * 0.8, alto * 0.75);
      c.strokeStyle = 'rgba(53,208,186,.25)';
      c.lineWidth = 0.7;
      for (let i = 1; i < 6; i++) trazo(c, x + w * (0.1 + i * 0.133), s - alto * 0.75, x + w * (0.1 + i * 0.133), s);
      for (let i = 1; i < 4; i++) trazo(c, x + w * 0.1, s - alto * 0.75 * (i / 4), x + w * 0.9, s - alto * 0.75 * (i / 4));
      c.fillStyle = '#111';
      c.fillRect(x + w * 0.12, s - alto * 0.72, w * 0.08, alto * 0.06);
      c.fillRect(x + w * 0.8, s - alto * 0.72, w * 0.08, alto * 0.06);
    } else if (L.tipo === 'cine') { // sala con marquesina y letrero vertical
      const fx = x + w * 0.06, fw = w * 0.88, fh = alto * 0.85;
      c.fillStyle = ep <= 1 ? '#7a2f2f' : ep <= 3 ? '#2f4f7a' : '#30343f';
      c.fillRect(fx, s - fh, fw, fh);
      c.fillStyle = '#f4e6c0';
      c.fillRect(x, s - fh * 0.62, w, fh * 0.16);
      c.fillStyle = '#1b1b1f';
      c.font = `${Math.max(5, fh * 0.12)}px 'Titulos', Impact, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('CINE', x + w / 2, s - fh * 0.54, w * 0.8);
      c.fillStyle = E.adorno;
      c.fillRect(x + w / 2 - fw * 0.07, s - fh * 1.25, fw * 0.14, fh * 0.6);
      c.fillStyle = '#1b1b1f';
      c.fillRect(fx + fw * 0.35, s - fh * 0.38, fw * 0.3, fh * 0.38);
      c.fillStyle = '#ffd98a';
      c.fillRect(fx + fw * 0.08, s - fh * 0.38, fw * 0.16, fh * 0.26);
      c.fillRect(fx + fw * 0.76, s - fh * 0.38, fw * 0.16, fh * 0.26);
    } else { // vacío: tierra, pasto y cartel
      c.fillStyle = '#5a4632';
      elipse(c, x + w / 2, s, w * 0.45, alto * 0.06, 0, Math.PI, 0);
      c.fill();
      c.strokeStyle = '#5f8f4a';
      c.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const gx = x + w * (0.1 + q() * 0.8); trazo(c, gx, s, gx - 1, s - 3); trazo(c, gx, s, gx + 1.5, s - 3); }
      if (w >= 40) {
        const px = x + w * 0.7;
        c.fillStyle = '#6b4a2f';
        c.fillRect(px, s - alto * 0.32, 2, alto * 0.32);
        c.fillStyle = '#efe6d2';
        c.fillRect(px - alto * 0.18, s - alto * 0.4, alto * 0.38, alto * 0.14);
        c.fillStyle = '#3a2a1a';
        c.font = `700 ${Math.max(5, alto * 0.08)}px sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('LIBRE', px + 1, s - alto * 0.33, alto * 0.34);
      }
    }
    valla(c, x, s, w, alto, ep);
  }

  function edificioFijo(c, g, E, ep, pisos, extra) {
    const x0 = g.x0, W = g.ancho, m = g.muro, n = pisos.length, techo = g.techo;
    pisos.forEach((p, i) => {
      const s = sala(g, i), tipo = SALAS[p.tipo] ? p.tipo : 'oficinas';
      c.fillStyle = SALAS[tipo].fondo;
      c.fillRect(s.x, s.y, s.w, s.h);
      c.fillStyle = 'rgba(0,0,0,.14)';
      c.fillRect(s.x, s.y, s.w, s.h * 0.1);
      c.fillRect(s.x, s.base - s.h * 0.05, s.w, s.h * 0.05);
      c.save();
      c.beginPath();
      c.rect(s.x, s.y, s.w, s.h);
      c.clip();
      SALAS[tipo].fijo(c, s, ep, i);
      c.restore();
      if (ep === 0) { c.fillStyle = 'rgba(255,170,80,.08)'; c.fillRect(s.x, s.y, s.w, s.h); }
      etiquetaPiso(c, s, p.etiqueta);
    });
    // muros, losas y vestíbulo
    c.fillStyle = E.muro;
    c.fillRect(x0, techo, m, g.suelo - techo);
    c.fillRect(x0 + W - m, techo, m, g.suelo - techo);
    for (let i = 0; i < n; i++) c.fillRect(x0, g.suelo - g.vestibulo - (i + 1) * g.piso, W, g.losa);
    c.fillRect(x0, g.suelo - g.vestibulo, W, g.vestibulo);
    adornosFachada(c, g, E, ep, n);
    vestibulo(c, g, E, ep);
    techoEdificio(c, g, E, ep, extra);
  }

  function adornosFachada(c, g, E, ep, n) {
    const x0 = g.x0, W = g.ancho, m = g.muro, alto = g.suelo - g.techo;
    c.fillStyle = E.adorno;
    if (ep === 0) { // esquinas de piedra
      for (let y = g.techo, k = 0; y < g.suelo; y += g.losa * 1.6, k++) {
        const bw = k % 2 ? m * 0.6 : m;
        c.fillRect(x0, y, bw, g.losa * 1.3);
        c.fillRect(x0 + W - bw, y, bw, g.losa * 1.3);
      }
    } else if (ep === 1) { // aletas doradas
      c.fillRect(x0 + m * 0.4, g.techo, Math.max(1, m * 0.2), alto);
      c.fillRect(x0 + W - m * 0.6, g.techo, Math.max(1, m * 0.2), alto);
    }
    if (ep >= 1) {
      for (let i = 0; i <= n; i++) c.fillRect(x0, g.suelo - g.vestibulo - i * g.piso - (ep >= 4 ? 1 : 0), W, ep === 5 ? 1.5 : 1);
    }
    if (ep === 5) { // bordes de luz
      c.fillRect(x0, g.techo, 1.5, alto);
      c.fillRect(x0 + W - 1.5, g.techo, 1.5, alto);
    }
  }

  function vestibulo(c, g, E, ep) {
    const x0 = g.x0, W = g.ancho, v = g.vestibulo, y = g.suelo - v, cx = x0 + W / 2;
    c.fillStyle = 'rgba(0,0,0,.2)';
    c.fillRect(x0, y, W, v);
    c.fillStyle = ['#4a2c1a', '#2a2f45', '#ff9a8b', '#2a2433', '#9fc3e0', '#bfe9ff'][ep];
    c.fillRect(cx - W * 0.1, g.suelo - v * 0.6, W * 0.2, v * 0.6);
    c.fillStyle = 'rgba(0,0,0,.35)';
    c.fillRect(cx - 0.5, g.suelo - v * 0.6, 1, v * 0.6);
    c.fillStyle = rgba(E.luz, 0.7);
    c.fillRect(x0 + W * 0.1, g.suelo - v * 0.55, W * 0.18, v * 0.35);
    c.fillRect(x0 + W * 0.72, g.suelo - v * 0.55, W * 0.18, v * 0.35);
    c.fillStyle = '#0d0f18'; // marquesina (el texto corre en el cuadro animado)
    c.fillRect(x0 + g.muro, y + v * 0.06, W - 2 * g.muro, v * 0.28);
    c.fillStyle = E.adorno;
    c.fillRect(x0 + g.muro, y + v * 0.06, W - 2 * g.muro, 1);
    c.fillRect(x0 + g.muro, y + v * 0.34 - 1, W - 2 * g.muro, 1);
    c.fillStyle = 'rgba(255,255,255,.15)';
    c.fillRect(cx - W * 0.16, g.suelo - 2, W * 0.32, 2);
  }

  function techoEdificio(c, g, E, ep, extra) {
    const x0 = g.x0, W = g.ancho, m = g.muro, t = g.techo, p = g.losa * 1.2;
    const cy = g.cartelY, ch = g.cartel;
    if (ep === 1) { // corona escalonada art déco detrás del cartel
      c.fillStyle = E.muro;
      c.fillRect(x0 + W * 0.2, cy - ch * 0.2, W * 0.6, t - cy + ch * 0.2);
      c.fillRect(x0 + W * 0.33, cy - ch * 0.55, W * 0.34, ch * 0.4);
      c.fillRect(x0 + W * 0.47, cy - ch * 1.1, W * 0.06, ch * 0.6);
      c.strokeStyle = E.adorno;
      c.lineWidth = 1;
      for (let i = 0; i < 7; i++) trazo(c, x0 + W / 2, cy - ch * 0.1, x0 + W * (0.22 + i * 0.093), cy - ch * 0.55);
    }
    if (ep === 5) { // cúpula
      c.fillStyle = E.muro;
      elipse(c, x0 + W / 2, t - p, W * 0.38, ch * 1.2, 0, Math.PI, 0);
      c.fill();
    }
    c.fillStyle = E.muro;
    c.fillRect(x0 - m * 0.4, t - p, W + m * 0.8, p + 1);
    c.fillStyle = E.adorno;
    c.fillRect(x0 - m * 0.4, t - p, W + m * 0.8, Math.max(1, p * 0.3));
    // soportes del cartel
    c.fillStyle = ep === 0 ? '#3a2718' : '#2b2f3a';
    c.fillRect(g.cartelX + g.cartelW * 0.2, cy + ch, 2, t - p - cy - ch);
    c.fillRect(g.cartelX + g.cartelW * 0.8 - 2, cy + ch, 2, t - p - cy - ch);
    if (ep === 0) { // chimenea
      const hx = x0 + W * 0.86;
      c.fillStyle = E.muro;
      c.fillRect(hx, t - p - g.piso * 0.6, m * 1.6, g.piso * 0.6);
      c.fillStyle = E.adorno;
      c.fillRect(hx - 1, t - p - g.piso * 0.6, m * 1.6 + 2, 2);
      extra.humoTecho = [hx + m * 0.8, t - p - g.piso * 0.6];
    }
    if (ep === 1 || ep === 2) { // tanque de agua de los estudios clásicos
      const tx = x0 + W * 0.06, th = Math.min(g.piso * 0.9, ch * 1.4), tw = th * 0.7;
      c.fillStyle = '#5a4632';
      c.fillRect(tx + tw * 0.1, t - p - th * 0.45, 1.5, th * 0.45);
      c.fillRect(tx + tw * 0.85, t - p - th * 0.45, 1.5, th * 0.45);
      c.fillStyle = ep === 1 ? '#8a6a44' : '#c9d6df';
      c.fillRect(tx, t - p - th, tw, th * 0.55);
      poligono(c, [tx - 1, t - p - th, tx + tw / 2, t - p - th * 1.25, tx + tw + 1, t - p - th]);
    }
    if (ep >= 3) { // antena con luz
      const ax = x0 + W * (ep === 3 ? 0.1 : 0.92);
      c.fillStyle = '#9aa5b1';
      c.fillRect(ax, t - p - g.piso * 1.2, 1.5, g.piso * 1.2);
      extra.faros.push([ax + 0.75, t - p - g.piso * 1.2, ep === 5 ? '#7ffcff' : '#ff3b3b']);
    }
  }

  function etiquetaPiso(c, s, texto) {
    if (!texto || s.h < 12) return;
    const fs = limitar(s.h * 0.2, 6, 11);
    c.font = `600 ${fs}px sans-serif`;
    const tw = Math.min(c.measureText(texto).width, s.w * 0.45);
    c.fillStyle = 'rgba(8,10,20,.62)';
    rectRedondo(c, s.x + 2, s.y + 2, tw + fs * 0.8, fs * 1.35, fs * 0.4);
    c.fill();
    c.fillStyle = '#fff';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText(texto, s.x + 2 + fs * 0.4, s.y + 2 + fs * 0.7, s.w * 0.45);
  }

  // Cartel del techo con el logo y el nombre (se guarda como imagen y se anima encima).
  function crearCartel(g, E, ep, nombre, L, esc) {
    const w = g.cartelW, h = g.cartel;
    const lz = crearLienzo(w * esc, h * esc);
    const c = lz.getContext('2d');
    c.setTransform(esc, 0, 0, esc, 0, 0);
    c.fillStyle = ['#3a2718', '#141a33', 'rgba(20,8,30,.85)', '#120a24', 'rgba(10,20,35,.92)', 'rgba(53,240,208,.14)'][ep];
    rectRedondo(c, 1, 1, w - 2, h - 2, ep >= 4 ? h * 0.25 : 2);
    c.fill();
    c.strokeStyle = E.adorno;
    c.lineWidth = ep === 0 ? 2 : 1.2;
    c.stroke();
    logo(c, h * 0.6, h / 2, h * 0.3, L);
    const area = w - h * 1.35;
    c.font = `${Math.round(h * 0.66)}px 'Titulos', Impact, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    if (ep >= 2) { c.shadowColor = E.adorno; c.shadowBlur = h * 0.3; }
    c.fillStyle = ['#f3e2b8', '#ffd98a', '#fff1f8', '#ffffff', '#ffffff', '#c9fff4'][ep];
    c.fillText(String(nombre || '').toUpperCase(), h * 1.15 + area / 2, h * 0.54, area);
    return lz;
  }

  function crearHalo(color, r, esc) {
    const lz = crearLienzo(r * 2 * esc, r * 2 * esc);
    const c = lz.getContext('2d');
    c.setTransform(esc, 0, 0, esc, 0, 0);
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, rgba(color, 0.9));
    g.addColorStop(0.35, rgba(color, 0.3));
    g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, r * 2, r * 2);
    return lz;
  }

  /* ---------- cuadro animado ---------- */

  const cacheEstudio = cacheLRU(3);
  let consultaMovimiento = null;
  function sinMovimiento() {
    if (api.menosMovimiento) return true;
    try {
      if (!consultaMovimiento && window.matchMedia) consultaMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
      return !!(consultaMovimiento && consultaMovimiento.matches);
    } catch (e) {
      return false;
    }
  }

  function fuentesListas() {
    try { return !document.fonts || document.fonts.check("12px 'Titulos'") ? 1 : 0; } catch (e) { return 1; }
  }

  function capasEstudio(ctx, w, h, datos, pisos, terrenos, ep, est) {
    const m = ctx.getTransform ? ctx.getTransform() : null;
    const esc = limitar(m ? Math.hypot(m.a, m.b) : window.devicePixelRatio || 1, 1, 4);
    const L = datos.logo || { s: 8, c: 6, b: 14, t: 3, f: 1 };
    const clave = [w, h, esc, ep, est, datos.nombre, JSON.stringify(L), fuentesListas(),
      pisos.map((p) => p.tipo + ':' + (p.etiqueta || '')).join(','), terrenos.map((t) => t.tipo + ':' + t.lado).join(',')].join('|');
    let capa = cacheEstudio.tomar(clave);
    if (capa) return capa;
    const g = geometria(w, h, pisos.length, terrenos);
    const E = EPOCAS[ep];
    capa = { g, E, ep, est, humos: [], faros: [], neones: [], humoTecho: null };
    capa.fondo = crearLienzo(w * esc, h * esc);
    const cf = capa.fondo.getContext('2d');
    cf.setTransform(esc, 0, 0, esc, 0, 0);
    pintarFondo(cf, g, E, ep, est, capa);
    capa.frente = crearLienzo(w * esc, h * esc);
    const cr = capa.frente.getContext('2d');
    cr.setTransform(esc, 0, 0, esc, 0, 0);
    pintarFrente(cr, g, E, ep, est, { pisos }, capa);
    capa.cartel = crearCartel(g, E, ep, datos.nombre, L, esc);
    capa.radioHalo = Math.max(10, g.altoFarol * 0.5);
    capa.halo = crearHalo(E.luz, capa.radioHalo, esc);
    cacheEstudio.poner(clave, capa);
    return capa;
  }

  function estudio(ctx, w, h, tMs, datos) {
    if (!ctx || !(w > 20) || !(h > 20)) return;
    datos = datos || {};
    const pisos = (datos.pisos || []).filter(Boolean);
    const terrenos = (datos.terrenos || []).filter(Boolean);
    const rodajes = (datos.rodajes || []).filter(Boolean);
    const ep = epocaEstudio(datos.anio || 1930);
    const est = estacionDe(datos.semana || 20);
    const f = sinMovimiento() ? 12.3 : (tMs || 0) / 1000;
    ctx.save();
    try {
      const capa = capasEstudio(ctx, w, h, datos, pisos, terrenos, ep, est);
      const g = capa.g, E = capa.E;
      ctx.drawImage(capa.fondo, 0, 0, w, h);
      cieloVivo(ctx, capa, f);
      ctx.drawImage(capa.frente, 0, 0, w, h);
      // salas
      let platos = 0;
      pisos.forEach((p, i) => {
        const s = sala(g, i), tipo = SALAS[p.tipo] ? p.tipo : 'oficinas';
        const act = limitar(+p.actividad || 0, 0, 1);
        const rodaje = tipo === 'plato' ? rodajes[platos++] : null;
        ctx.save();
        ctx.beginPath();
        ctx.rect(s.x, s.y, s.w, s.h);
        ctx.clip();
        SALAS[tipo].vivo(ctx, s, ep, f + i * 0.7, act, i, rodaje);
        if (act < 1) { ctx.fillStyle = `rgba(10,8,24,${(1 - act) * 0.4})`; ctx.fillRect(s.x, s.y, s.w, s.h); }
        ctx.restore();
      });
      if (ep === 4 && pisos.length) { // reflejo del vidrio
        ctx.fillStyle = 'rgba(170,215,255,.09)';
        const y0 = g.techo, y1 = g.suelo - g.vestibulo;
        poligono(ctx, [g.x0 + g.ancho * 0.15, y0, g.x0 + g.ancho * 0.35, y0, g.x0 + g.ancho * 0.1, y1, g.x0 - 1 + g.muro, y1]);
        poligono(ctx, [g.x0 + g.ancho * 0.55, y0, g.x0 + g.ancho * 0.62, y0, g.x0 + g.ancho * 0.4, y1, g.x0 + g.ancho * 0.33, y1]);
      }
      g.lotes.forEach((L) => loteVivo(ctx, L, g, E, ep, f, rodajes.length > 0));
      marquesina(ctx, g, E, rodajes.slice(platos), f);
      cartelVivo(ctx, capa, f);
      callesVivas(ctx, capa, f);
    } catch (e) {
      ctx.fillStyle = '#10172e';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  // V34: qué hay en un punto del dibujo del estudio (tocar un piso abre su departamento; un terreno, su ficha)
  function estudioEn(w, h, datos, x, y) {
    const pisos = ((datos && datos.pisos) || []).filter(Boolean), terrenos = ((datos && datos.terrenos) || []).filter(Boolean);
    const g = geometria(w, h, pisos.length, terrenos);
    for (let i = 0; i < pisos.length; i++) { const s = sala(g, i); if (x >= s.x - g.muro && x <= s.x + s.w + g.muro && y >= s.y - g.losa && y <= s.y + s.h) return { tipo: 'piso', i, id: pisos[i].tipo }; }
    for (let k = 0; k < g.lotes.length; k++) { const L = g.lotes[k]; if (x >= L.x && x <= L.x + L.w && y >= g.suelo - L.alto - 6 && y <= g.suelo + 4) return { tipo: 'terreno', id: L.tipo }; }
    return null;
  }

  function cieloVivo(c, capa, f) {
    const g = capa.g, ep = capa.ep, w = g.w;
    for (let i = 0; i < 12; i++) { // estrellas que titilan
      const a = 0.25 + 0.5 * Math.sin(f * 1.4 + i * 2.3);
      if (a <= 0) continue;
      c.fillStyle = `rgba(255,255,255,${a})`;
      c.fillRect(((i * 97.3) % 1) * w + ((i * 53) % w), ((i * 31.7) % 1) * g.suelo * 0.4 + 4, 1.6, 1.6);
    }
    if (ep === 1 || ep === 2) { // reflectores
      if (!capa.haz || capa.hazCtx !== c) {
        capa.haz = c.createLinearGradient(0, 0, 0, -g.h);
        capa.haz.addColorStop(0, 'rgba(255,255,230,.22)');
        capa.haz.addColorStop(1, 'rgba(255,255,230,0)');
        capa.hazCtx = c;
      }
      c.fillStyle = capa.haz;
      [0.18, 0.82, 0.5].slice(0, ep === 1 ? 3 : 2).forEach((px, i) => {
        c.save();
        c.translate(w * px, g.suelo);
        c.rotate(Math.sin(f * 0.5 + i * 2) * 0.45);
        poligono(c, [-3, 0, 3, 0, g.h * 0.16, -g.h, -g.h * 0.16, -g.h]);
        c.restore();
      });
    }
    capa.humos.forEach((p, i) => humo(c, p[0], p[1], f + i, g.h * 0.12));
    capa.neones.forEach((n, i) => { // letreros de neón que parpadean
      const on = Math.sin(f * 11 + i * 5.1) > -0.85;
      c.fillStyle = 'rgba(10,5,20,.8)';
      c.fillRect(n[0], n[1], n[2], n[3]);
      c.strokeStyle = n[4];
      c.globalAlpha = on ? 1 : 0.25;
      c.lineWidth = 1.2;
      c.strokeRect(n[0] + 1, n[1] + 1, n[2] - 2, n[3] - 2);
      c.fillStyle = n[4];
      c.fillRect(n[0] + n[2] * 0.2, n[1] + n[3] * 0.45, n[2] * 0.6, 1.2);
      c.globalAlpha = 1;
    });
    if (ep === 5) { // autos voladores lejanos
      for (let i = 0; i < 3; i++) {
        const x = ((f * (25 + i * 12) + i * 170) % (w + 60)) - 30, y = g.h * (0.18 + i * 0.09);
        const x2 = i % 2 ? w - x : x;
        c.fillStyle = 'rgba(127,252,255,.25)';
        c.fillRect(x2 - (i % 2 ? -4 : 18), y, 18, 1);
        c.fillStyle = '#d9f6ff';
        elipse(c, x2, y, 4, 1.6);
        c.fill();
      }
    }
  }

  function humo(c, x, y, f, alto) {
    for (let j = 0; j < 3; j++) {
      const p = (f * 0.25 + j / 3) % 1;
      c.fillStyle = `rgba(190,180,175,${(1 - p) * 0.3})`;
      circulo(c, x + p * alto * 0.4, y - p * alto, 1.5 + p * alto * 0.25);
      c.fill();
    }
  }

  function loteVivo(c, L, g, E, ep, f, hayRodaje) {
    const s = g.suelo, x = L.x, w = L.w, alto = L.alto;
    if (L.tipo === 'foso') { // olas y barquito
      c.strokeStyle = 'rgba(200,235,255,.6)';
      c.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        const y = s - alto * (0.22 - k * 0.08);
        c.beginPath();
        for (let px = x + 4; px <= x + w - 4; px += 3) c.lineTo(px, y + Math.sin(px * 0.3 + f * 3 + k) * 1.2);
        c.stroke();
      }
      const bx = x + w * (0.5 + 0.25 * Math.sin(f * 0.4)), by = s - alto * 0.27 + Math.sin(f * 2) * 1.2, bs = alto * 0.12;
      c.fillStyle = '#5a3a26';
      poligono(c, [bx - bs, by - bs * 0.3, bx + bs, by - bs * 0.3, bx + bs * 0.7, by + bs * 0.2, bx - bs * 0.7, by + bs * 0.2]);
      c.fillStyle = '#f4efe6';
      poligono(c, [bx, by - bs * 0.3, bx, by - bs * 1.6, bx + bs * 0.8, by - bs * 0.4]);
    } else if (L.tipo === 'captura') { // actor con marcadores
      const u = alto * 0.7, px = x + w * (0.5 + 0.15 * Math.sin(f * 0.7));
      persona(c, px, s, u, '#111', '#222', false, f * 4, Math.sin(f * 3) * u * 0.15);
      c.fillStyle = '#7fffd4';
      [[0, 0.62], [0, 0.4], [0.08, 0.5], [-0.03, 0.15], [0.04, 0.1]].forEach((p) => c.fillRect(px + p[0] * u - 1, s - p[1] * u - 1, 2, 2));
      if (Math.sin(f * 6) > 0) {
        c.fillStyle = '#ff3b3b';
        c.fillRect(x + w * 0.14, s - alto * 0.7, 2, 2);
        c.fillRect(x + w * 0.84, s - alto * 0.7, 2, 2);
      }
    } else if (L.tipo === 'cine') { // luces que corren en la marquesina
      const fh = alto * 0.85, y1 = s - fh * 0.62, y2 = s - fh * 0.46, paso = 5, k = Math.floor(f * 8);
      for (let px = x + 2, i = 0; px < x + w - 1; px += paso, i++) {
        c.fillStyle = (i + k) % 3 === 0 ? '#fff6c8' : '#9a7a30';
        c.fillRect(px, y1 - 1, 2, 2);
        c.fillRect(px, y2 - 1, 2, 2);
      }
    } else if (L.tipo === 'backlot' && hayRodaje) { // foco de trabajo y alguien del equipo
      const u = Math.min(alto * 0.6, g.persona), px = x + w * (0.3 + 0.25 * (0.5 + 0.5 * Math.sin(f * 0.6)));
      persona(c, px, s, u, '#2b2b30', PIELES[3], false, f * 5, null);
      c.fillStyle = `rgba(255,240,190,${0.3 + 0.2 * Math.sin(f * 2)})`;
      circulo(c, x + w * 0.9, s - alto * 0.55, 2.5);
      c.fill();
    }
  }

  function marquesina(c, g, E, lista, f) {
    if (!lista.length) return;
    const v = g.vestibulo, bx = g.x0 + g.muro, bw = g.ancho - 2 * g.muro, by = g.suelo - v + v * 0.06 + 1, bh = v * 0.28 - 2;
    if (bh < 4) return;
    const texto = lista.map((r) => 'EN RODAJE: ' + String(r.titulo || '') + ' ' + Math.round(limitar(+r.progreso || 0, 0, 1) * 100) + '%').join('   ·   ');
    c.save();
    c.beginPath();
    c.rect(bx, by, bw, bh);
    c.clip();
    c.font = `${Math.max(5, bh * 0.95)}px 'Titulos', Impact, sans-serif`;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffd98a';
    const tw = c.measureText(texto).width;
    c.fillText(texto, bx + bw - ((f * 28) % (tw + bw)), by + bh / 2 + 0.5);
    c.restore();
  }

  function cartelVivo(c, capa, f) {
    const g = capa.g, ep = capa.ep;
    let y = g.cartelY;
    if (ep === 5) y += Math.sin(f * 1.6) * 2;
    c.globalAlpha = (ep === 2 || ep === 3) && Math.sin(f * 7.3) < -0.93 ? 0.55 : ep === 5 ? 0.85 + 0.1 * Math.sin(f * 4) : 1;
    c.drawImage(capa.cartel, g.cartelX, y, g.cartelW, g.cartel);
    c.globalAlpha = 1;
    if (ep === 1) { // bombillas que corren
      const k = Math.floor(f * 6);
      for (let px = g.cartelX + 4, i = 0; px < g.cartelX + g.cartelW - 3; px += 6, i++) {
        c.fillStyle = (i + k) % 3 ? '#8a6a20' : '#fff3c4';
        c.fillRect(px, y + 1.5, 1.8, 1.8);
        c.fillRect(px, y + g.cartel - 3.3, 1.8, 1.8);
      }
    } else if (ep === 5) { // líneas de holograma
      c.fillStyle = 'rgba(127,252,255,.12)';
      const k = (f * 12) % 4;
      for (let yy = y + k; yy < y + g.cartel; yy += 4) c.fillRect(g.cartelX, yy, g.cartelW, 1);
    }
  }

  function callesVivas(c, capa, f) {
    const g = capa.g, ep = capa.ep, E = capa.E, w = g.w;
    if (capa.humoTecho) humo(c, capa.humoTecho[0], capa.humoTecho[1], f, g.piso * 1.4);
    capa.faros.forEach((p, i) => {
      if (Math.sin(f * 3 + i * 1.7) > 0.2) {
        c.fillStyle = p[2];
        circulo(c, p[0], p[1], 1.6);
        c.fill();
      }
    });
    // faroles: halo con parpadeo de gas en la primera época
    g.faroles.forEach((x, i) => {
      const y = g.suelo + g.calle * 0.22 - g.altoFarol + (ep === 5 ? Math.sin(f * 2 + i) * 2 : 0);
      const lx = ep >= 2 && ep <= 4 ? x + g.altoFarol * 0.2 : x;
      c.globalAlpha = ep === 0 ? 0.75 + 0.2 * Math.sin(f * 9 + i * 3) * Math.sin(f * 5.3 + i) : 0.85;
      c.drawImage(capa.halo, lx - capa.radioHalo, y - capa.radioHalo + 2, capa.radioHalo * 2, capa.radioHalo * 2);
      c.globalAlpha = 1;
      c.fillStyle = ep === 5 ? E.adorno : '#fff8e0';
      circulo(c, lx, y + 2, ep === 5 ? 2.5 : 1.6);
      c.fill();
    });
    // transeúntes
    const u = g.persona;
    for (let i = 0; i < 2; i++) {
      const vel = 9 + i * 5, x = ((f * vel + i * 211) % (w + 40)) - 20, xx = i ? w - x : x;
      c.save();
      if (i) { c.translate(2 * xx, 0); c.scale(-1, 1); }
      persona(c, xx, g.suelo + g.calle * 0.24, u, i ? '#2d2a3a' : '#3a2d2a', PIELES[(i * 5 + 2) % 8], false, f * 7, null);
      if (ep <= 1) { c.fillStyle = '#111'; c.fillRect(xx - u * 0.08, g.suelo + g.calle * 0.24 - u * 0.78, u * 0.18, u * 0.06); }
      c.restore();
    }
    // vehículos de la época
    const cs = g.calle * 0.36;
    const colores = [['#3b2a20', '#5a2a1a'], ['#1f1f24', '#6b1f2a'], ['#e8a0b0', '#7fd1c7'], ['#e04a6a', '#f5f5f5'], ['#cfd6df', '#c0392b'], ['#e8f2ff', '#35f0d0']][ep];
    for (let i = 0; i < 2; i++) {
      const vel = w * (ep === 0 ? 0.05 : 0.09) * (i ? 1.3 : 1), largo = cs * 3;
      const x = ((f * vel + i * w * 0.6) % (w + largo * 2)) - largo;
      const dir = i ? -1 : 1, px = i ? w - x : x;
      const y = g.suelo + g.calle * (i ? 0.95 : 0.7) - (ep === 5 ? cs * 0.3 + Math.sin(f * 2 + i) : 0);
      vehiculo(c, px, y, cs, ep, colores[i], dir);
    }
    if (capa.est === 0) { // copos de nieve
      c.fillStyle = 'rgba(255,255,255,.8)';
      for (let i = 0; i < 36; i++) {
        const y = ((i * 37.7 + f * (14 + (i % 5) * 4)) % g.h);
        const x = ((i * 61.3) % w) + Math.sin(f + i) * 6;
        c.fillRect(x, y, 1.6, 1.6);
      }
    }
  }

  function vehiculo(c, x, y, s, ep, color, dir) {
    c.save();
    c.translate(x, y);
    c.scale(dir, 1);
    if (ep === 0) { // carruaje con caballo
      c.fillStyle = '#4a3020';
      elipse(c, s * 1.55, -s * 0.78, s * 0.42, s * 0.2);
      c.fill();
      c.fillRect(s * 1.22, -s * 0.65, s * 0.08, s * 0.65);
      c.fillRect(s * 1.8, -s * 0.65, s * 0.08, s * 0.65);
      poligono(c, [s * 1.85, -s * 0.9, s * 2.15, -s * 1.2, s * 2.3, -s * 1.08, s * 2.0, -s * 0.72]);
      c.fillStyle = color;
      c.fillRect(-s * 0.9, -s * 1.3, s * 1.7, s * 0.8);
      c.fillRect(-s, -s * 1.4, s * 1.9, s * 0.12);
      c.strokeStyle = '#1b1210';
      c.lineWidth = Math.max(1, s * 0.08);
      circulo(c, -s * 0.5, -s * 0.36, s * 0.34);
      c.stroke();
      circulo(c, s * 0.45, -s * 0.36, s * 0.34);
      c.stroke();
      trazo(c, s * 0.8, -s * 0.6, s * 1.3, -s * 0.75);
      c.fillStyle = 'rgba(255,200,110,.85)';
      c.fillRect(-s * 0.7, -s * 1.15, s * 0.4, s * 0.3);
    } else if (ep === 5) { // auto flotante
      c.fillStyle = 'rgba(53,240,208,.3)';
      elipse(c, 0, s * 0.35, s * 1.2, s * 0.12);
      c.fill();
      c.fillStyle = color[0];
      elipse(c, 0, -s * 0.2, s * 1.4, s * 0.38);
      c.fill();
      c.fillStyle = 'rgba(127,252,255,.7)';
      elipse(c, s * 0.2, -s * 0.48, s * 0.6, s * 0.25, 0, Math.PI, 0);
      c.fill();
    } else {
      const largo = s * 2.6;
      c.fillStyle = color[0];
      c.fillRect(-largo / 2, -s * 0.75, largo, s * 0.45);
      if (ep === 1) c.fillRect(-largo * 0.25, -s * 1.25, largo * 0.42, s * 0.52);
      else if (ep === 2) {
        c.fillRect(-largo * 0.28, -s * 1.05, largo * 0.5, s * 0.32);
        poligono(c, [-largo / 2, -s * 0.75, -largo / 2 + s * 0.4, -s * 0.75, -largo / 2, -s * 1.0]);
      } else if (ep === 3) poligono(c, [-largo * 0.3, -s * 0.75, -largo * 0.2, -s * 1.12, largo * 0.15, -s * 1.12, largo * 0.32, -s * 0.75]);
      else { elipse(c, -largo * 0.02, -s * 0.75, largo * 0.32, s * 0.38, 0, Math.PI, 0); c.fill(); }
      c.fillStyle = 'rgba(180,215,255,.55)';
      c.fillRect(-largo * 0.12, -s * (ep === 1 ? 1.15 : 0.98), largo * 0.22, s * 0.2);
      c.fillStyle = color[1];
      c.fillRect(-largo / 2, -s * 0.5, largo, s * 0.06);
      c.fillStyle = '#111';
      circulo(c, -largo * 0.3, -s * 0.28, s * 0.22);
      c.fill();
      circulo(c, largo * 0.3, -s * 0.28, s * 0.22);
      c.fill();
      c.fillStyle = '#fff3c4';
      c.fillRect(largo / 2 - 2, -s * 0.66, 2, s * 0.14);
      c.fillStyle = 'rgba(255,240,180,.18)';
      poligono(c, [largo / 2, -s * 0.62, largo / 2 + s * 1.6, -s * 0.85, largo / 2 + s * 1.6, -s * 0.2]);
    }
    c.restore();
  }

  /* =========================================================
     Gráficas
     ========================================================= */

  // ---------- Gráficas (V34: rejilla con escala, valores al tocar, paleta para daltonismo, anillo y pirámide) ----------
  // Cada gráfica deja en el lienzo sus puntos (_pts: x, y y texto en px CSS); la interfaz muestra el valor al tocar.
  function paletaSeries(T) {
    let dalton = false;
    try { dalton = document.documentElement.getAttribute('data-dalton') === 'si'; } catch (e) { dalton = false; }
    return dalton ? ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9', '#D55E00'] : [T.acento, T.dorado, T.rosa, '#5b8cff', '#c38bff', '#ff8f5a'];
  }
  // Valores «redondos» para la escala: 4 líneas que caen en 1, 2 o 5 × 10^n
  function escala(min, max, n) {
    const paso0 = (max - min) / (n || 4) || 1, mag = Math.pow(10, Math.floor(Math.log10(Math.abs(paso0))));
    const paso = [1, 2, 2.5, 5, 10].map((k) => k * mag).filter((x) => x >= paso0)[0] || paso0;
    const a = Math.floor(min / paso) * paso, b = Math.ceil(max / paso) * paso, marcas = [];
    for (let x = a; x <= b + paso * 0.5; x += paso) marcas.push(Math.round(x * 1e6) / 1e6);
    return { min: a, max: b, marcas };
  }
  function rejilla(c, T, izq, arriba, ancho, alto, esc, fmt, py) {
    c.font = '10px sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
    esc.marcas.forEach((m) => {
      const y = Math.round(py(m));
      c.fillStyle = T.tenue; c.globalAlpha = m === 0 ? 0.7 : 0.18; c.fillRect(izq, y, ancho, 1); c.globalAlpha = 1;
      c.fillStyle = T.tenue; c.fillText(fmt(m), izq - 4, y);
    });
  }
  function anchoEscala(c, esc, fmt) { c.font = '10px sans-serif'; return Math.ceil(Math.max.apply(null, esc.marcas.map((m) => c.measureText(fmt(m)).width))) + 8; }
  function barras(canvas, valores, etiquetas, opts) {
    const L = prepararLienzo(canvas);
    if (!L) return;
    const o = opts || {}, T = leerTema(), c = L.c, w = L.w, h = L.h;
    const v = (valores || []).map((x) => +x || 0), n = v.length;
    if (!n) return;
    const fmt = typeof o.formato === 'function' ? o.formato : (x) => String(Math.round(x * 100) / 100);
    const etiq = etiquetas || [];
    const esc = escala(Math.min(0, Math.min.apply(null, v)), Math.max(0, Math.max.apply(null, v)) || 1, 4);
    const izq = anchoEscala(c, esc, fmt), arriba = 8, abajo = etiq.length ? 16 : 4;
    const ancho = Math.max(1, w - izq - 4), alto = Math.max(1, h - arriba - abajo);
    const py = (x) => arriba + (1 - (x - esc.min) / (esc.max - esc.min || 1)) * alto;
    rejilla(c, T, izq, arriba, ancho, alto, esc, fmt, py);
    const bw = ancho / n, hueco = Math.min(4, bw * 0.18), cero = py(0), imax = v.indexOf(Math.max.apply(null, v));
    c.textAlign = 'center';
    let anchoEtiq = 0;
    etiq.forEach((e) => { anchoEtiq = Math.max(anchoEtiq, c.measureText(String(e)).width); });
    const salto = Math.max(1, Math.ceil((anchoEtiq + 6) / bw)), pts = [];
    v.forEach((x, i) => {
      const bx = izq + i * bw + hueco, bwi = Math.max(1, bw - 2 * hueco), y = py(x);
      const color = (o.colores && o.colores[i]) || (x < 0 ? T.mal : o.color || T.acento);
      c.fillStyle = color; c.globalAlpha = i === imax || o.colores ? 1 : 0.82;
      c.beginPath();
      if (c.roundRect) c.roundRect(bx, Math.min(y, cero), bwi, Math.max(x ? 1 : 0, Math.abs(cero - y)), x < 0 ? [0, 0, 3, 3] : [3, 3, 0, 0]); else c.rect(bx, Math.min(y, cero), bwi, Math.max(x ? 1 : 0, Math.abs(cero - y)));
      c.fill(); c.globalAlpha = 1;
      if (o.formato && bw >= 38) { c.fillStyle = T.texto; c.textBaseline = x < 0 ? 'top' : 'bottom'; c.fillText(fmt(x), bx + bwi / 2, x < 0 ? Math.min(y + 2, h - abajo - 10) : y - 2, bw); }
      if (i % salto === 0 && etiq[i] != null) { c.fillStyle = T.tenue; c.textBaseline = 'alphabetic'; c.fillText(String(etiq[i]), bx + bwi / 2, h - 3); }
      pts.push({ x: bx + bwi / 2, y: Math.min(y, cero), t: (etiq[i] != null ? etiq[i] + ': ' : '') + fmt(x) });
    });
    canvas._pts = pts;
  }

  function linea(canvas, series, etiquetas, opts) {
    const L = prepararLienzo(canvas);
    if (!L) return;
    const o = opts || {}, T = leerTema(), c = L.c, w = L.w, h = L.h;
    const lista = (series || []).filter((s) => s && s.valores && s.valores.length);
    if (!lista.length) return;
    const fmt = typeof o.formato === 'function' ? o.formato : (x) => String(Math.round(x * 100) / 100);
    const valido = (x) => x != null && !isNaN(x);
    let min = Infinity, max = -Infinity, n = 0;
    lista.forEach((s) => { n = Math.max(n, s.valores.length); s.valores.forEach((x) => { if (valido(x)) { min = Math.min(min, +x); max = Math.max(max, +x); } }); });
    if (!isFinite(min)) return;
    if (min === max) { min -= 1; max += 1; }
    const esc = escala(min, max, 4);
    const izq = anchoEscala(c, esc, fmt), arriba = 20, abajo = (etiquetas || []).length ? 16 : 4, der = 8;
    const ancho = Math.max(1, w - izq - der), alto = Math.max(1, h - arriba - abajo);
    const px = (i) => izq + (n > 1 ? (i / (n - 1)) * ancho : ancho / 2);
    const py = (x) => arriba + (1 - (x - esc.min) / (esc.max - esc.min)) * alto;
    rejilla(c, T, izq, arriba, ancho, alto, esc, fmt, py);
    const etiq = etiquetas || [];
    if (etiq.length) {
      let anchoEtiq = 0;
      etiq.forEach((e) => { anchoEtiq = Math.max(anchoEtiq, c.measureText(String(e)).width); });
      const paso = n > 1 ? ancho / (n - 1) : ancho, salto = Math.max(1, Math.ceil((anchoEtiq + 8) / paso));
      c.fillStyle = T.tenue; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      etiq.forEach((e, i) => { if (i % salto === 0 && i < n) c.fillText(String(e), limitar(px(i), izq + anchoEtiq / 2, w - anchoEtiq / 2), h - 3); });
    }
    const paleta = paletaSeries(T), pts = [];
    lista.forEach((s, k) => {
      const color = s.color || paleta[k % paleta.length];
      // Área suave bajo la primera serie: se lee mejor la forma
      if (k === 0 && lista.length <= 2) {
        const g = c.createLinearGradient(0, arriba, 0, arriba + alto);
        g.addColorStop(0, rgba(color.charAt(0) === '#' && color.length === 7 ? color : '#35d0ba', 0.22)); g.addColorStop(1, rgba(color.charAt(0) === '#' && color.length === 7 ? color : '#35d0ba', 0));
        c.fillStyle = g; c.beginPath();
        let ini = -1, fin = -1;
        s.valores.forEach((x, i) => { if (!valido(x)) return; if (ini < 0) { ini = i; c.moveTo(px(i), py(+x)); } else c.lineTo(px(i), py(+x)); fin = i; });
        if (ini >= 0) { c.lineTo(px(fin), arriba + alto); c.lineTo(px(ini), arriba + alto); c.closePath(); c.fill(); }
      }
      c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2; c.lineJoin = 'round'; c.setLineDash(k % 2 && lista.length > 1 ? [6, 3] : []); // la 2.ª serie punteada: nunca solo color
      c.beginPath();
      let seguido = false, ultimo = -1;
      s.valores.forEach((x, i) => {
        if (!valido(x)) { seguido = false; return; }
        if (seguido) c.lineTo(px(i), py(+x)); else c.moveTo(px(i), py(+x));
        seguido = true; ultimo = i;
        pts.push({ x: px(i), y: py(+x), t: (s.nombre ? s.nombre + ' · ' : '') + (etiq[i] != null ? etiq[i] + ': ' : '') + fmt(+x) });
      });
      c.stroke(); c.setLineDash([]);
      if (ultimo >= 0) { circulo(c, px(ultimo), py(+s.valores[ultimo]), 3.2); c.fill(); }
    });
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '10px sans-serif';
    let lx = izq;
    lista.forEach((s, k) => {
      if (!s.nombre) return;
      c.fillStyle = s.color || paleta[k % paleta.length];
      c.fillRect(lx, 6, 12, 3);
      c.fillStyle = T.texto; c.fillText(String(s.nombre), lx + 16, 8);
      lx += 26 + c.measureText(String(s.nombre)).width;
    });
    canvas._pts = pts;
  }

  // Radar: una o varias series (por ejemplo, el talento frente al promedio de su oficio)
  function radar(canvas, valores, etiquetas, opts) {
    const L = prepararLienzo(canvas);
    if (!L) return;
    const o = opts || {}, T = leerTema(), c = L.c, w = L.w, h = L.h;
    const series = Array.isArray(valores[0]) ? valores : [valores], n = series[0].length;
    if (n < 3) return;
    const cx = w / 2, cy = h / 2 + 4, R = Math.max(10, Math.min(w, h) / 2 - 24);
    const punto = (i, r) => [cx + Math.cos(-Math.PI / 2 + (i / n) * TAU) * r, cy + Math.sin(-Math.PI / 2 + (i / n) * TAU) * r];
    c.strokeStyle = T.tenue; c.lineWidth = 1;
    for (let k = 1; k <= 4; k++) {
      c.globalAlpha = k === 4 ? 0.45 : 0.22; c.beginPath();
      for (let i = 0; i <= n; i++) { const p = punto(i % n, (R * k) / 4); c.lineTo(p[0], p[1]); }
      c.stroke();
    }
    for (let i = 0; i < n; i++) { const p = punto(i, R); c.globalAlpha = 0.18; c.beginPath(); c.moveTo(cx, cy); c.lineTo(p[0], p[1]); c.stroke(); }
    c.globalAlpha = 1;
    const paleta = paletaSeries(T), pts = [];
    series.slice().reverse().forEach((v, kk) => {
      const k = series.length - 1 - kk, color = (o.colores && o.colores[k]) || paleta[k % paleta.length];
      c.fillStyle = rgba(color.charAt(0) === '#' && color.length === 7 ? color : '#35d0ba', k ? 0.12 : 0.28);
      c.strokeStyle = color; c.lineWidth = k ? 1.5 : 2; c.setLineDash(k ? [5, 3] : []);
      c.beginPath();
      v.forEach((x, i) => { const p = punto(i, (R * limitar(+x || 0, 0, 100)) / 100); c.lineTo(p[0], p[1]); if (!k) pts.push({ x: p[0], y: p[1], t: (etiquetas && etiquetas[i] ? etiquetas[i] + ': ' : '') + Math.round(+x || 0) }); });
      c.closePath(); c.fill(); c.stroke(); c.setLineDash([]);
      if (!k) { c.fillStyle = color; v.forEach((x, i) => { const p = punto(i, (R * limitar(+x || 0, 0, 100)) / 100); circulo(c, p[0], p[1], 2.6); c.fill(); }); }
    });
    c.fillStyle = T.tenue; c.font = '10px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    (etiquetas || []).forEach((e, i) => { const p = punto(i, R + 14); c.fillText(String(e), limitar(p[0], 24, w - 24), p[1]); });
    if (o.leyenda) { c.textAlign = 'left'; o.leyenda.forEach((t, k) => { c.fillStyle = (o.colores && o.colores[k]) || paleta[k % paleta.length]; c.fillRect(4, 6 + k * 14, 12, 3); c.fillStyle = T.texto; c.fillText(t, 20, 8 + k * 14); }); }
    canvas._pts = pts;
  }

  // Anillo con porcentajes (por ejemplo, obras por medio)
  function anillo(canvas, partes, opts) {
    const L = prepararLienzo(canvas);
    if (!L) return;
    const o = opts || {}, T = leerTema(), c = L.c, w = L.w, h = L.h;
    const lista = (partes || []).filter((p) => p.valor > 0), total = lista.reduce((s, p) => s + p.valor, 0);
    if (!total) return;
    const R = Math.max(10, Math.min(h / 2 - 8, w * 0.22)), cx = R + 10, cy = h / 2, paleta = paletaSeries(T), pts = [];
    let a = -Math.PI / 2;
    lista.forEach((p, i) => {
      const da = (p.valor / total) * TAU, color = p.color || paleta[i % paleta.length];
      c.fillStyle = color; c.beginPath(); c.arc(cx, cy, R, a, a + da); c.arc(cx, cy, R * 0.58, a + da, a, true); c.closePath(); c.fill();
      c.strokeStyle = T.fondo; c.lineWidth = 2; c.stroke();
      const am = a + da / 2;
      pts.push({ x: cx + Math.cos(am) * R * 0.8, y: cy + Math.sin(am) * R * 0.8, t: p.nombre + ': ' + (o.formato ? o.formato(p.valor) : p.valor) + ' (' + Math.round((p.valor / total) * 100) + ' %)' });
      a += da;
    });
    c.fillStyle = T.texto; c.font = 'bold 14px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(o.centro !== undefined ? String(o.centro) : String(total), cx, cy);
    c.font = '11px sans-serif'; c.textAlign = 'left';
    const lx = cx + R + 16, alto = Math.min(18, (h - 8) / lista.length);
    lista.forEach((p, i) => {
      const y = cy - (lista.length * alto) / 2 + i * alto + alto / 2;
      c.fillStyle = p.color || paleta[i % paleta.length]; c.fillRect(lx, y - 5, 10, 10);
      c.fillStyle = T.texto; c.fillText(p.nombre + ' · ' + Math.round((p.valor / total) * 100) + ' %', lx + 16, y, w - lx - 18);
    });
    canvas._pts = pts;
  }

  // Pirámide de edades: barras horizontales centradas, los más jóvenes abajo
  function piramide(canvas, valores, etiquetas, opts) {
    const L = prepararLienzo(canvas);
    if (!L) return;
    const o = opts || {}, T = leerTema(), c = L.c, w = L.w, h = L.h;
    const v = (valores || []).map((x) => +x || 0), n = v.length;
    if (!n) return;
    const fmt = o.formato || ((x) => String(x)), max = Math.max.apply(null, v) || 1;
    c.font = '10px sans-serif';
    const izq = Math.ceil(Math.max.apply(null, (etiquetas || []).map((e) => c.measureText(String(e)).width).concat([0]))) + 10;
    const cx = izq + (w - izq) / 2, mitad = (w - izq) / 2 - 6, fila = (h - 6) / n, pts = [];
    const paleta = paletaSeries(T);
    v.forEach((x, i) => {
      const y = h - 3 - (i + 1) * fila, a = (x / max) * mitad, alto = Math.max(2, fila - 4);
      c.fillStyle = paleta[i % 2 ? 1 : 0]; c.globalAlpha = 0.85;
      c.fillRect(cx - a, y + 2, a * 2, alto); c.globalAlpha = 1;
      c.fillStyle = T.tenue; c.textAlign = 'right'; c.textBaseline = 'middle';
      if (etiquetas && etiquetas[i] != null) c.fillText(String(etiquetas[i]), izq - 6, y + 2 + alto / 2);
      c.fillStyle = T.texto; c.textAlign = 'center';
      if (a * 2 > 40) c.fillText(fmt(x), cx, y + 2 + alto / 2);
      pts.push({ x: cx, y: y + 2 + alto / 2, t: (etiquetas && etiquetas[i] != null ? etiquetas[i] + ': ' : '') + fmt(x) });
    });
    canvas._pts = pts;
  }

  /* =========================================================
     Sonido (pitidos de WebAudio como la V15)
     ========================================================= */

  let audio = null;
  let sonidoEncendido = true;
  // Cada nota: [frecuencia, inicio s, duración s, forma de onda, volumen]
  const SONIDOS = {
    clic: [[620, 0, 0.04, 'sine', 0.04]],
    avance: [[440, 0, 0.06, 'triangle', 0.04], [587, 0.06, 0.08, 'triangle', 0.04]],
    exito: [[523, 0, 0.1, 'triangle', 0.05], [659, 0.09, 0.1, 'triangle', 0.05], [784, 0.18, 0.18, 'triangle', 0.05]],
    fracaso: [[392, 0, 0.16, 'triangle', 0.05], [330, 0.15, 0.16, 'triangle', 0.05], [262, 0.3, 0.32, 'triangle', 0.05]],
    dinero: [[988, 0, 0.07, 'square', 0.025], [1319, 0.07, 0.2, 'square', 0.025]],
    premio: [[523, 0, 0.18, 'triangle', 0.06], [659, 0.11, 0.18, 'triangle', 0.06], [784, 0.22, 0.18, 'triangle', 0.06], [1047, 0.33, 0.3, 'triangle', 0.06]],
    error: [[196, 0, 0.09, 'square', 0.03], [165, 0.11, 0.14, 'square', 0.03]],
    estreno: [[392, 0, 0.12, 'triangle', 0.05], [523, 0.1, 0.12, 'triangle', 0.05], [659, 0.2, 0.12, 'triangle', 0.05],
      [784, 0.3, 0.4, 'triangle', 0.05], [1047, 0.3, 0.4, 'sine', 0.035]],
  };

  function sonido(tipo) {
    if (!sonidoEncendido) return;
    const notas = SONIDOS[tipo];
    if (!notas) return;
    try {
      const Contexto = window.AudioContext || window.webkitAudioContext;
      if (!Contexto) return;
      audio = audio || new Contexto();
      if (audio.state === 'suspended' && audio.resume) {
        const p = audio.resume();
        if (p && p.catch) p.catch(() => {});
      }
      const t0 = audio.currentTime + 0.01;
      notas.forEach((nota) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = nota[3];
        o.frequency.value = nota[0];
        g.gain.setValueAtTime(nota[4], t0 + nota[1]);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + nota[1] + nota[2]);
        o.connect(g);
        g.connect(audio.destination);
        o.start(t0 + nota[1]);
        o.stop(t0 + nota[1] + nota[2] + 0.02);
      });
    } catch (e) {
      // sin sonido: nunca interrumpe el juego
    }
  }

  /* =========================================================
     Mapa del mundo (V15 wmap): continentes y puntos por país
     puntos: [{ lon, lat, r (0..1), color, etiqueta }]
     ========================================================= */
  function mapa(canvas, continentes, puntos) {
    const p = prepararLienzo(canvas, 320, 170);
    if (!p) return;
    const c = p.c, w = p.w, h = p.h, T = leerTema();
    const X = (lon) => ((lon + 180) / 360) * w;
    const Y = (lat) => ((82 - lat) / 142) * h;
    c.fillStyle = T.panel;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = rgba(T.tenue, 0.15);
    c.lineWidth = 1;
    for (let lon = -150; lon <= 150; lon += 30) trazo(c, X(lon), 0, X(lon), h);
    for (let lat = -60; lat <= 60; lat += 30) trazo(c, 0, Y(lat), w, Y(lat));
    (continentes || []).forEach((poli) => {
      c.beginPath();
      poli.forEach((q, i) => (i ? c.lineTo(X(q[0]), Y(q[1])) : c.moveTo(X(q[0]), Y(q[1]))));
      c.closePath();
      c.fillStyle = rgba(T.acento, 0.12);
      c.fill();
      c.strokeStyle = rgba(T.acento, 0.35);
      c.stroke();
    });
    const ordenados = (puntos || []).slice().sort((a, b) => (b.r || 0) - (a.r || 0));
    ordenados.forEach((q) => {
      const rr = 2.5 + Math.sqrt(Math.max(0, q.r || 0)) * Math.min(w, h) * 0.09;
      c.beginPath();
      c.arc(X(q.lon), Y(q.lat), rr, 0, TAU);
      c.fillStyle = rgba(q.color || T.tenue, q.destacado ? 0.95 : 0.55);
      c.fill();
      if (q.destacado) { c.lineWidth = 2; c.strokeStyle = T.texto; c.stroke(); }
    });
    c.font = '12px sans-serif';
    c.fillStyle = T.texto;
    c.textAlign = 'center';
    ordenados.filter((q) => q.etiqueta).forEach((q) => c.fillText(q.etiqueta, X(q.lon), Y(q.lat) - 8));
  }

  const api = {
    hash,
    mapa,
    FUENTES,
    logo,
    logoAleatorio,
    colorLogo,
    colorFondoLogo: colorFondo,
    colorTextoLogo: colorTexto,
    poster,
    posterEn,
    aspectoNuevo,
    retrato,
    retratoEn,
    estudio,
    estudioEn,
    barras,
    linea,
    radar,
    anillo,
    piramide,
    sonido,
    activarSonido(v) { sonidoEncendido = !!v; },
    sonidoActivo() { return sonidoEncendido; },
    menosMovimiento: false,
  };
  return api;
})();
