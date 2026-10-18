#!/usr/bin/env node
/* Dibuja con el arte del propio juego el ícono de la app (todas las densidades), las pantallas de inicio,
 * el ícono de 512 px y la imagen destacada (1024×500) de Google Play, y 6 capturas 1080×1920 en español e inglés.
 * Uso: node tools/imagenes_app.js   (necesita Playwright y app/www/index.html armado con tools/preparar_app.py) */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const RAIZ = path.resolve(__dirname, '..'), RES = path.join(RAIZ, 'app/android/app/src/main/res'), TIENDA = path.join(RAIZ, 'docs/tienda');
function tamPng(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(RAIZ, 'app/www/index.html'));
  await p.waitForFunction(() => window.IA && IA.arte);
  const dibujar = (w, h, tipo) => p.evaluate(([w, h, tipo]) => {
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
      c.fillText(tipo === 'destacada' ? 'Tu estudio, de 1850 a 2150' : 'Tu estudio, de 1850 a 2150', tipo === 'destacada' ? w * 0.36 : w / 2, tipo === 'destacada' ? h * 0.66 : h * 0.75);
    }
    return cv.toDataURL('image/png').split(',')[1];
  }, [w, h, tipo]);
  const guardar = async (f, w, h, tipo) => fs.writeFileSync(f, Buffer.from(await dibujar(w, h, tipo), 'base64'));
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
  await guardar(path.join(TIENDA, 'destacada_1024x500.png'), 1024, 500, 'destacada');
  // Capturas para la tienda (360×640 × 3 = 1080×1920)
  for (const idioma of ['es', 'en']) {
    const q = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
    await q.goto('file://' + path.join(RAIZ, 'app/www/index.html'));
    await q.evaluate(async (id) => { IA.juego.nuevaPartida({ semilla: 'tienda', anio: 1985, bot: true, nombre: 'Estudio Aurora' }); for (let i = 0; i < 52 * 12; i++) { IA.pruebas.decidir(IA.pruebas.ESTRATEGIAS.normal); IA.juego.avanzarSemana(); } IA.n.S.bot = false; IA.ui.ajuste('idioma', id); IA.ui.aplicarAjustes(); await new Promise((r) => setTimeout(r, 1500)); }, idioma);
    const vistas = [['estudio'], ['obras', 'catalogo'], ['mundo', 'cartelera'], ['obras', 'franquicias'], ['negocio', 'canal'], ['mundo', 'rivales']];
    for (let i = 0; i < vistas.length; i++) {
      await q.evaluate((v) => { IA.ui.cerrarModal(); IA.ui.irA(v[0], v[1]); }, vistas[i]); await q.waitForTimeout(400);
      await q.screenshot({ path: path.join(TIENDA, 'captura_' + idioma + '_' + (i + 1) + '.png') });
    }
    await q.close();
  }
  console.log('Listo: íconos, pantallas de inicio, imágenes y capturas de la tienda');
  await b.close();
})();
