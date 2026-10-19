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
  python3 tools/preparar_app.py --web                 además dist/web (página instalable, completa) y dist/web-anuncios
                                                       (el juego en el navegador con anuncios alrededor; AdSense en app/config.json › web)

Pone el identificador de AdMob en el AndroidManifest y en el Info.plist de iOS (con el permiso de rastreo de Apple)."""
import argparse, glob, json, os, plistlib, re, shutil
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(RAIZ, 'app')
EDICIONES = ('completa', 'anuncios')
TIENDAS = ('directo', 'steam', 'epic', 'microsoft')

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

# Navegador con anuncios: el juego (edición con anuncios) en el centro y los anuncios alrededor, nunca encima
if args.web:
    web2 = os.path.join(RAIZ, 'dist', 'web-anuncios')
    os.makedirs(web2, exist_ok=True)
    open(os.path.join(web2, 'juego.html'), 'w', encoding='utf-8').write(html_con({'edicion': 'anuncios', 'web': 1}))
    w = cfg.get('web') or {}
    ad = w.get('adsense') or {}
    cliente, ranuras = (ad.get('cliente') or '').strip(), ad.get('ranuras') or {}

    def espacio(nombre, ancho, alto):
        r = (ranuras.get(nombre) or '').strip()
        if cliente and r:
            return ('<ins class="adsbygoogle" style="display:inline-block;width:%dpx;height:%dpx" data-ad-client="%s" data-ad-slot="%s"></ins>'
                    '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>' % (ancho, alto, cliente, r))
        # Sin cuenta de AdSense: solo se ve el lugar del anuncio, para revisar el diseño
        return '<div class="hueco" style="width:%dpx;height:%dpx">Espacio publicitario</div>' % (ancho, alto)
    script = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=%s" crossorigin="anonymous"></script>' % cliente) if cliente else ''
    completa = (w.get('enlaceCompleta') or '').strip()
    pie = ('<a href="%s" target="_blank" rel="noopener">Juega sin anuncios: consigue la edición completa</a>' % completa) if completa else 'Juega sin anuncios con la edición completa'
    open(os.path.join(web2, 'index.html'), 'w', encoding='utf-8').write("""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>INDUSTRY ART</title><meta name="description" content="Dirige un estudio de arte de 1700 a 2300: teatro, libros, música, cine, televisión y videojuegos.">
<meta name="theme-color" content="#0b1020"><link rel="icon" href="icono-192.png">%s
<style>
html,body{margin:0;height:100%%;background:#0b1020;color:#c9cbe0;font:14px system-ui,sans-serif}
.marco{display:grid;height:100%%;grid-template-columns:1fr;grid-template-rows:auto 1fr auto}
.lado{display:none}.franja{display:flex;justify-content:center;align-items:center;padding:4px 0;min-height:58px}
.juego{border:0;width:100%%;height:100%%;display:block;background:#0b1020}
.hueco{display:flex;align-items:center;justify-content:center;border:1px dashed #3a4170;color:#6a70a0;font-size:12px;box-sizing:border-box}
.pie{text-align:center;font-size:12px;padding:2px 0 6px}.pie a{color:#f5c542}
.ancho{display:none}
@media (min-width:1000px){.franja{min-height:98px}.estrecho{display:none}.ancho{display:block}}
@media (min-width:1360px){.marco{grid-template-columns:180px 1fr 180px;grid-template-rows:auto 1fr auto}
 .lado{display:flex;justify-content:center;align-items:flex-start;padding-top:12px}.franja,.pie{grid-column:1 / -1}}
</style></head><body><div class="marco">
<div class="franja"><div class="ancho">%s</div><div class="estrecho">%s</div></div>
<div class="lado">%s</div>
<iframe class="juego" src="juego.html" title="INDUSTRY ART" allow="fullscreen"></iframe>
<div class="lado">%s</div>
<div class="franja abajo"><div class="ancho">%s</div><div class="estrecho">%s</div></div>
<div class="pie">%s · <a href="privacidad.html">Privacidad</a></div>
</div></body></html>
""" % (script, espacio('arriba', 728, 90), espacio('arriba', 320, 50), espacio('izquierda', 160, 600), espacio('derecha', 160, 600),
       espacio('abajo', 728, 90), espacio('abajo', 320, 50), pie))
    if cliente:
        open(os.path.join(web2, 'ads.txt'), 'w').write('google.com, %s, DIRECT, f08c47fec0942fa0\n' % cliente.replace('ca-pub-', 'pub-'))
    priv = os.path.join(RAIZ, 'docs', 'privacidad.html')
    if os.path.exists(priv):
        shutil.copyfile(priv, os.path.join(web2, 'privacidad.html'))
    icono = os.path.join(APP, 'escritorio', 'build', 'icon.png')
    if os.path.exists(icono):
        shutil.copyfile(icono, os.path.join(web2, 'icono-192.png'))

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
