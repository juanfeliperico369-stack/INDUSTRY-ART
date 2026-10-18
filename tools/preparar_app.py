#!/usr/bin/env python3
"""Copia el HTML más nuevo del juego a las apps con su configuración (app/config.json):
modo gratis (un anuncio al abrir) o pago (sin anuncios) y los identificadores de AdMob de Android y de iPhone.
- app/www/index.html          → Android e iPhone (Capacitor)
- app/escritorio/www/index.html → PC (Electron, sin anuncios)
Pone el identificador de AdMob en el AndroidManifest y en el Info.plist de iOS (con el permiso de rastreo de Apple).
Uso: python3 tools/preparar_app.py"""
import glob, json, os, plistlib, re
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(RAIZ, 'app')
# La versión definitiva manda; si no está, el HTML numerado más nuevo
htmls = sorted(glob.glob(os.path.join(RAIZ, 'INDUSTRY_ART_v*.html')), key=lambda p: int(re.search(r'_v(\d+)', p).group(1)))
if os.path.exists(os.path.join(RAIZ, 'INDUSTRY_ART_Definitiva.html')):
    htmls.append(os.path.join(RAIZ, 'INDUSTRY_ART_Definitiva.html'))
cfg = json.load(open(os.path.join(APP, 'config.json'), encoding='utf-8'))
base = open(htmls[-1], encoding='utf-8').read()

def escribir(ruta, extra):
    c = dict(cfg, **extra)
    html = base.replace('<head>', '<head>\n<script>window.ART_CONFIG = ' + json.dumps(c, ensure_ascii=False) + ';</script>', 1)
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    open(ruta, 'w', encoding='utf-8').write(html)

escribir(os.path.join(APP, 'www', 'index.html'), {})
escribir(os.path.join(APP, 'escritorio', 'www', 'index.html'), {'modo': 'pago', 'anuncioAlAbrir': False})

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
    p['NSUserTrackingUsageDescription'] = ('Solo para que el anuncio al abrir el juego sea más útil para ti. '
                                           'Only used to make the ad shown when the game opens more relevant to you.')
    p['SKAdNetworkItems'] = [{'SKAdNetworkIdentifier': 'cstr6suwn9.skadnetwork'}]  # Google
    p['ITSAppUsesNonExemptEncryption'] = False
    p['UIRequiredDeviceCapabilities'] = ['arm64']
    with open(plist, 'wb') as f:
        plistlib.dump(p, f, sort_keys=False)

print('Listo:', os.path.basename(htmls[-1]), '-> app/www y app/escritorio/www - modo', cfg['modo'])  # solo ASCII: la consola de Windows no imprime flechas
