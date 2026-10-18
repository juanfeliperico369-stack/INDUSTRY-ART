#!/usr/bin/env node
/* Dibuja con el arte del propio juego el ícono de la app (todas las densidades), las pantallas de inicio,
 * el ícono de 512 px y la imagen destacada (1024×500) de Google Play, y 6 capturas 1080×1920 en español e inglés.
 * Ícono (1024, sin transparencia) y pantallas de inicio de iPhone, ícono de PC, 6 capturas 1320×2868 por idioma
 * para la App Store y 3 capturas 1920×1080 para PC.
 * Uso: node tools/imagenes_app.js   (necesita Playwright y app/www/index.html armado con tools/preparar_app.py) */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..'), RES = path.join(RAIZ, 'app/android/app/src/main/res'), TIENDA = path.join(RAIZ, 'docs/tienda');
const IOS = path.join(RAIZ, 'app/ios/App/App/Assets.xcassets'), PC = path.join(RAIZ, 'app/escritorio/build');
function tamPng(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
// PNG sin canal alfa (la App Store rechaza íconos con transparencia)
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc(b) { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function trozo(tipo, datos) { const t = Buffer.from(tipo), l = Buffer.alloc(4), c = Buffer.alloc(4); l.writeUInt32BE(datos.length); c.writeUInt32BE(crc(Buffer.concat([t, datos]))); return Buffer.concat([l, t, datos, c]); }
function pngRGB(w, h, rgba) {
  const filas = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) filas[y * (w * 3 + 1) + 1 + x * 3 + k] = rgba[(y * w + x) * 4 + k];
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ih), trozo('IDAT', zlib.deflateSync(filas, { level: 9 })), trozo('IEND', Buffer.alloc(0))]);
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(RAIZ, 'app/www/index.html'));
  await p.waitForFunction(() => window.IA && IA.arte);
  const dibujar = (w, h, tipo, rgb) => p.evaluate(([w, h, tipo, rgb]) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#16213e'); g.addColorStop(1, '#0b1020');
    const m = Math.min(w, h), redondo = tipo === 'redondo';
    if (tipo !== 'frente') { c.fillStyle = g; if (redondo) { c.beginPath(); c.arc(w / 2, h / 2, m / 2, 0, 7); c.fill(); } else c.fillRect(0, 0, w, h); }
    const L = { s: 12, c: 3, b: 0, t: 0, f: 0 };
    const r = tipo === 'frente' ? m * 0.2 : tipo === 'destacada' ? h * 0.26 : tipo === 'inicio' ? m * 0.16 : m * 0.3;
    const cx = tipo === 'destacada' ? w * 0.2 : w / 2, cy = tipo === 'destacada' ? h / 2 : tipo === 'inicio' ? h * 0.45 : h / 2;
    IA.arte.logo(c, cx, cy, r, L);
    if (tipo === 'destacada' || tipo === 'inicio') {
      c.fillStyle = '#ffc857'; c.textAlign = tipo === 'destacada' ? 'left' : 'center';
      c.font = 'bold ' + Math.round(tipo === 'destacada' ? h * 0.16 : m * 0.09) + 'px sans-serif';
      c.fillText('INDUSTRY ART', tipo === 'destacada' ? w * 0.36 : w / 2, tipo === 'destacada' ? h * 0.5 : h * 0.68);
      c.fillStyle = '#c9d1e8'; c.font = Math.round(tipo === 'destacada' ? h * 0.065 : m * 0.04) + 'px sans-serif';
      c.fillText(tipo === 'destacada' ? 'Tu estudio de cine, desde 1895' : 'Tu estudio de cine, desde 1895', tipo === 'destacada' ? w * 0.36 : w / 2, tipo === 'destacada' ? h * 0.66 : h * 0.75);
    }
    if (rgb) { const d = c.getImageData(0, 0, w, h).data; let t = ''; for (let i = 0; i < d.length; i += 32768) t += String.fromCharCode.apply(null, d.subarray(i, i + 32768)); return btoa(t); }
    return cv.toDataURL('image/png').split(',')[1];
  }, [w, h, tipo, rgb]);
  const guardar = async (f, w, h, tipo) => fs.writeFileSync(f, Buffer.from(await dibujar(w, h, tipo), 'base64'));
  const guardarRGB = async (f, w, h, tipo) => fs.writeFileSync(f, pngRGB(w, h, Buffer.from(await dibujar(w, h, tipo, true), 'base64')));
  // Íconos y pantallas de inicio: mismo tamaño que los que trae Capacitor
  for (const d of fs.readdirSync(RES)) {
    for (const n of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png', 'splash.png']) {
      const f = path.join(RES, d, n); if (!fs.existsSync(f)) continue;
      const [w, h] = tamPng(f);
      await guardar(f, w, h, n === 'ic_launcher_round.png' ? 'redondo' : n === 'ic_launcher_foreground.png' ? 'frente' : n === 'splash.png' ? 'inicio' : 'icono');
    }
  }
  const bg = path.join(RES, 'values', 'ic_launcher_background.xml');
  if (fs.existsSync(bg)) fs.writeFileSync(bg, fs.readFileSync(bg, 'utf8').replace(/#[0-9A-Fa-f]{6}/, '#0b1020'));
  await guardar(path.join(TIENDA, 'icono_512.png'), 512, 512, 'icono');
  // iPhone: ícono de 1024 y pantallas de inicio de 2732 (las tres que trae Capacitor)
  if (fs.existsSync(IOS)) {
    await guardarRGB(path.join(IOS, 'AppIcon.appiconset/AppIcon-512@2x.png'), 1024, 1024, 'icono');
    for (const n of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) await guardarRGB(path.join(IOS, 'Splash.imageset', n), 2732, 2732, 'inicio');
  }
  fs.mkdirSync(PC, { recursive: true });
  await guardar(path.join(PC, 'icon.png'), 1024, 1024, 'icono');
  await guardar(path.join(TIENDA, 'destacada_1024x500.png'), 1024, 500, 'destacada');
  // Capturas para la tienda (360×640 × 3 = 1080×1920)
  // Google Play (1080×1920), App Store (iPhone de 6,9 pulgadas: 1320×2868, en JPG sin transparencia) y PC (1920×1080)
  const JUEGOS = [['tienda', 360, 640, 3, 'png', ['es', 'en'], 6], ['ios', 440, 956, 3, 'jpeg', ['es', 'en'], 6], ['pc', 1920, 1080, 1, 'png', ['es'], 3]];
  for (const [pre, vw, vh, esc, tipo, idiomas, cuantas] of JUEGOS) for (const idioma of idiomas) {
    const q = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: esc });
    await q.goto('file://' + path.join(RAIZ, 'app/www/index.html'));
    await q.evaluate(async (id) => { IA.juego.nuevaPartida({ semilla: 'tienda', anio: 1985, bot: true, nombre: 'Estudio Aurora' }); for (let i = 0; i < 52 * 12; i++) { IA.pruebas.decidir(IA.pruebas.ESTRATEGIAS.normal); IA.juego.avanzarSemana(); } IA.n.S.bot = false; IA.ui.ajuste('idioma', id); IA.ui.aplicarAjustes(); await new Promise((r) => setTimeout(r, 1500)); }, idioma);
    const vistas = [['estudio'], ['obras', 'catalogo'], ['mundo', 'cartelera'], ['obras', 'franquicias'], ['negocio', 'canal'], ['mundo', 'rivales']];
    for (let i = 0; i < cuantas; i++) {
      await q.evaluate((v) => { IA.ui.cerrarModal(); IA.ui.irA(v[0], v[1]); }, vistas[i]); await q.waitForTimeout(400);
      const nombre = (pre === 'tienda' ? 'captura_' : pre === 'ios' ? 'iphone_' : 'pc_') + idioma + '_' + (i + 1) + (tipo === 'jpeg' ? '.jpg' : '.png');
      await q.screenshot(Object.assign({ path: path.join(TIENDA, nombre), type: tipo }, tipo === 'jpeg' ? { quality: 92 } : {}));
    }
    await q.close();
  }
  console.log('Listo: íconos, pantallas de inicio, imágenes y capturas de la tienda');
  await b.close();
})();
