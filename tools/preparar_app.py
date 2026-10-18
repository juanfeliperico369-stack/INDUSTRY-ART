#!/usr/bin/env python3
"""Copia el HTML más nuevo del juego a app/www/index.html con la configuración de la app (app/config.json):
modo gratis (un anuncio al abrir) o pago (sin anuncios) y los identificadores de AdMob.
También pone el identificador de la app de AdMob en el AndroidManifest si el proyecto Android ya existe.
Uso: python3 tools/preparar_app.py"""
import glob, json, os, re
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
htmls = sorted(glob.glob(os.path.join(RAIZ, 'INDUSTRY_ART_v*.html')), key=lambda p: int(re.search(r'_v(\d+)', p).group(1)))
cfg = json.load(open(os.path.join(RAIZ, 'app', 'config.json'), encoding='utf-8'))
html = open(htmls[-1], encoding='utf-8').read()
html = html.replace('<head>', '<head>\n<script>window.IA_CONFIG = ' + json.dumps(cfg, ensure_ascii=False) + ';</script>', 1)
os.makedirs(os.path.join(RAIZ, 'app', 'www'), exist_ok=True)
open(os.path.join(RAIZ, 'app', 'www', 'index.html'), 'w', encoding='utf-8').write(html)
man = os.path.join(RAIZ, 'app', 'android', 'app', 'src', 'main', 'AndroidManifest.xml')
if os.path.exists(man):
    m = open(man, encoding='utf-8').read()
    meta = '<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="' + cfg['admob']['app'] + '"/>'
    if 'com.google.android.gms.ads.APPLICATION_ID' in m:
        m = re.sub(r'<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"[^>]*/>', meta, m)
    else:
        m = m.replace('<application', '<application', 1).replace('</application>', '    ' + meta + '\n    </application>', 1)
    open(man, 'w', encoding='utf-8').write(m)
print('Listo:', os.path.basename(htmls[-1]), '→ app/www/index.html · modo', cfg['modo'])
