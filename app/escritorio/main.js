// INDUSTRY ART para PC (Windows, macOS y Linux): una ventana con el mismo juego, sin anuncios y sin internet.
// El HTML lo copia tools/preparar_app.py a www/index.html; las partidas quedan guardadas en la carpeta de datos de la app.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();
let ventana = null;

function crear() {
  ventana = new BrowserWindow({
    width: 1366, height: 820, minWidth: 360, minHeight: 600, show: false,
    backgroundColor: '#0b1020', title: 'INDUSTRY ART', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: false }
  });
  // Los enlaces a internet (política de privacidad, etc.) se abren en el navegador, nunca dentro del juego
  ventana.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  ventana.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  // F11: pantalla completa
  ventana.webContents.on('before-input-event', (e, t) => {
    if (t.type === 'keyDown' && t.key === 'F11') { ventana.setFullScreen(!ventana.isFullScreen()); e.preventDefault(); }
  });
  // El juego no usa cámara, micrófono, ubicación ni notificaciones
  ventana.webContents.session.setPermissionRequestHandler((wc, permiso, responder) => responder(false));
  ventana.once('ready-to-show', () => ventana.show());
  ventana.loadFile(path.join(__dirname, 'www', 'index.html'));
}

// En macOS el menú trae copiar, pegar y salir (⌘Q); en Windows y Linux no hace falta
if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
app.on('second-instance', () => { if (ventana) { if (ventana.isMinimized()) ventana.restore(); ventana.focus(); } });
app.whenReady().then(crear);
app.on('window-all-closed', () => app.quit());
