#!/usr/bin/env python3
"""Arma src/modulos/01_ingles.js: el diccionario español → inglés (comprimido con gzip en base64).
Uso: python3 tools/ingles.py diccionario.json [más.json ...]   (objetos {"español": "english"})"""
import sys, json, gzip, base64
d = {}
for ruta in sys.argv[1:]:
    d.update(json.load(open(ruta, encoding='utf-8')))
lineas = [k.replace('\t', ' ').replace('\n', ' ') + '\t' + str(v).replace('\t', ' ').replace('\n', ' ') for k, v in d.items() if isinstance(v, str) and k.strip()]
crudo = '\n'.join(lineas).encode('utf-8')
try:  # V34: zopfli (si está instalado) da un gzip estándar unos 5 % más chico; el navegador lo lee igual
    import zopfli.gzip
    comprimido = zopfli.gzip.compress(crudo, numiterations=15)
except ImportError:
    comprimido = gzip.compress(crudo, 9)
# V34: Z85 con '~' en lugar de '/' (así nunca aparece «</» dentro del script; sin comillas ni barra invertida) ocupa 25 % más que los datos; base64, 33 %
Z85 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!~*?&<>()[]{}@%$#'
datos = comprimido + b'\0' * ((4 - len(comprimido) % 4) % 4)
z = []
for i in range(0, len(datos), 4):
    v = int.from_bytes(datos[i:i + 4], 'big')
    z.append(''.join(Z85[(v // 85 ** k) % 85] for k in range(4, -1, -1)))
z85 = ''.join(z)
assert not any(p in z85.lower() for p in ('</', '<!--', '<script')), 'Z85 armó una secuencia que rompe el <script>; cambia numiterations'
with open('src/modulos/01_ingles.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* ==== módulo: ingles ==== */\n// V29 · Diccionario español → inglés (' + str(len(lineas)) + ' frases), comprimido; lo arma tools/ingles.py (V34: en Z85)\n'
            'IA.INGLES_LEN = ' + str(len(comprimido)) + ';\nIA.INGLES_Z85 = \'' + z85 + '\';\n')
print(len(lineas), 'frases,', len(z85) // 1024, 'KB')
