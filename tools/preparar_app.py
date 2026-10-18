#!/usr/bin/env python3
"""Copia el HTML del juego a cada paquete con su configuración (window.ART_CONFIG).

Dos ediciones, las dos con todo el juego desbloqueado:
  completa  sin anuncios (la de pago en las tiendas; también la web, PC, Steam y Epic Games)
  anuncios  gratis, con un anuncio al abrir y otro como mucho cada «cadaMinutos» en una pausa (solo en la app)

Uso:
  python3 tools/preparar_app.py                       app/www (edición de app/config.json), los dos sabores de
                                                       Android y app/escritorio/www (completa)
  python3 tools/preparar_app.py --edicion completa    la app de iPhone/Android de app/www con esa edición
  python3 tools/preparar_app.py --tienda steam        app/escritorio/www para Steam (o epic, o directo)
  python3 tools/preparar_app.py --web                 además dist/web: la página instalable (PWA) para Windows, macOS y Linux

Pone el identificador de AdMob en el AndroidManifest y en el Info.plist de iOS (con el permiso de rastreo de Apple)."""
import argparse, glob, json, os, plistlib, re, shutil
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(RAIZ, 'app')
EDICIONES = ('completa', 'anuncios')
TIENDAS = ('directo', 'steam', 'epic')

ap = argparse.ArgumentParser(description='Prepara el HTML del juego para cada paquete')
ap.add_argument('--edicion', choices=EDICIONES, help='edición de app/www (si no, la de app/config.json)')
ap.add_argument('--tienda', choices=TIENDAS, default='directo', help='tienda de la app de PC (Steam, Epic o descarga directa)')
ap.add_argument('--web', action='store_true', help='arma también dist/web (página instalable)')
args = ap.parse_args()

# La versión definitiva manda; si no está, el HTML numerado más nuevo
htmls = sorted(glob.glob(os.path.join(RAIZ, 'INDUSTRY_ART_v*.html')), key=lambda p: int(re.search(r'_v(\d+)', p).group(1)))
if os.path.exists(os.path.join(RAIZ, 'INDUSTRY_ART_Definitiva.html')):
    htmls.append(os.path.join(RAIZ, 'INDUSTRY_ART_Definitiva.html'))
cfg = json.load(open(os.path.join(APP, 'config.json'), encoding='utf-8'))
# Configuraciones viejas: modo «gratis» es la edición con anuncios y «pago», la completa
if 'edicion' not in cfg:
    cfg['edicion'] = 'completa' if cfg.get('modo') == 'pago' else 'anuncios'
if 'anuncios' not in cfg:
    cfg['anuncios'] = {'alAbrir': cfg.get('anuncioAlAbrir', True), 'cadaMinutos': 20}
for k in ('modo', 'anuncioAlAbrir'):
    cfg.pop(k, None)
if args.edicion:
    cfg['edicion'] = args.edicion
base = open(htmls[-1], encoding='utf-8').read()


def html_con(extra):
    c = dict(cfg, **extra)
    return base.replace('<head>', '<head>\n<script>window.ART_CONFIG = ' + json.dumps(c, ensure_ascii=False) + ';</script>', 1)


def escribir(ruta, extra):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    open(ruta, 'w', encoding='utf-8').write(html_con(extra))


# Android e iPhone (Capacitor): app/www con la edición elegida
escribir(os.path.join(APP, 'www', 'index.html'), {})
# Android: cada sabor (completa y anuncios) lleva su propio index.html, que pisa al de app/www al compilar
sabores = os.path.join(APP, 'android', 'app', 'src')
if os.path.isdir(sabores):
    for ed in EDICIONES:
        escribir(os.path.join(sabores, ed, 'assets', 'public', 'index.html'), {'edicion': ed})
# PC (Electron): siempre la completa, sin anuncios; la tienda solo cambia el nombre que se ve en Ajustes
escribir(os.path.join(APP, 'escritorio', 'www', 'index.html'), {'edicion': 'completa', 'tienda': None if args.tienda == 'directo' else args.tienda})

# Página instalable (PWA): el juego, su manifiesto, su ícono y un service worker para jugar sin internet
if args.web:
    web = os.path.join(RAIZ, 'dist', 'web')
    os.makedirs(web, exist_ok=True)
    pag = html_con({'edicion': 'completa'})
    cabeza = ('<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icono-192.png">\n'
              '<link rel="apple-touch-icon" href="icono-512.png">\n<meta name="theme-color" content="#0b1020">\n'
              "<script>if ('serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });</script>\n")
    pag = pag.replace('</head>', cabeza + '</head>', 1)
    open(os.path.join(web, 'index.html'), 'w', encoding='utf-8').write(pag)
    json.dump({'name': 'INDUSTRY ART', 'short_name': 'INDUSTRY ART', 'description': 'Dirige un estudio de arte de 1700 a 2300.',
               'start_url': './', 'scope': './', 'display': 'standalone', 'background_color': '#0b1020', 'theme_color': '#0b1020',
               'lang': 'es', 'categories': ['games', 'entertainment'],
               'icons': [{'src': 'icono-192.png', 'sizes': '192x192', 'type': 'image/png'},
                         {'src': 'icono-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]},
              open(os.path.join(web, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    version = re.search(r"VERSION\s*=\s*'([^']+)'", base)
    open(os.path.join(web, 'sw.js'), 'w', encoding='utf-8').write(
        "// Guarda el juego para abrirlo sin internet; una versión nueva reemplaza a la vieja\n"
        "const CACHE = 'industry-art-" + (version.group(1) if version else '1') + "';\n"
        "const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png'];\n"
        "self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });\n"
        "self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });\n"
        "self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });\n")
    icono = os.path.join(APP, 'escritorio', 'build', 'icon.png')
    for n in ('icono-192.png', 'icono-512.png'):
        if os.path.exists(icono):
            shutil.copyfile(icono, os.path.join(web, n))

anuncios = cfg['edicion'] == 'anuncios'
man = os.path.join(APP, 'android', 'app', 'src', 'main', 'AndroidManifest.xml')
if os.path.exists(man):
    m = open(man, encoding='utf-8').read()
    meta = '<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="' + cfg['admob']['android']['app'] + '"/>'
    if 'com.google.android.gms.ads.APPLICATION_ID' in m:
        m = re.sub(r'<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"[^>]*/>', meta, m)
    else:
        m = m.replace('</application>', '    ' + meta + '\n    </application>', 1)
    open(man, 'w', encoding='utf-8').write(m)

plist = os.path.join(APP, 'ios', 'App', 'App', 'Info.plist')
if os.path.exists(plist):
    with open(plist, 'rb') as f:
        p = plistlib.load(f)
    p['GADApplicationIdentifier'] = cfg['admob']['ios']['app']
    p['ITSAppUsesNonExemptEncryption'] = False
    p['UIRequiredDeviceCapabilities'] = ['arm64']
    if anuncios:
        p['NSUserTrackingUsageDescription'] = ('Solo para que los anuncios del juego sean más útiles para ti. '
                                               'Only used to make the ads in the game more relevant to you.')
        p['SKAdNetworkItems'] = [{'SKAdNetworkIdentifier': 'cstr6suwn9.skadnetwork'}]  # Google
    else:
        # La edición completa no muestra anuncios ni pide permiso de rastreo
        p.pop('NSUserTrackingUsageDescription', None)
        p.pop('SKAdNetworkItems', None)
    with open(plist, 'wb') as f:
        plistlib.dump(p, f, sort_keys=False)

# solo ASCII: la consola de Windows no imprime flechas ni tildes
print('Listo:', os.path.basename(htmls[-1]), '- app/www edicion', cfg['edicion'], '- PC tienda', args.tienda, '- web' if args.web else '')
