#!/usr/bin/env python3
"""Arma src/modulos/01_ingles.js: el diccionario español → inglés comprimido (gzip en Z85).
Uso: python3 tools/ingles.py [diccionario.json ...]
Sin argumentos lee tools/ingles/diccionario.json (objeto {"español": "english"}); con varios, los une en orden."""
import sys, json, gzip, os, re
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rutas = sys.argv[1:] or [os.path.join(RAIZ, 'tools', 'ingles', 'diccionario.json')]
d = {}
for ruta in rutas:
    d.update(json.load(open(ruta, encoding='utf-8')))
# Las entradas que quedan igual en inglés (nombres, países) solo sirven si protegen a una frase de traducirse a medias:
# si ninguna de sus palabras tiene traducción, no cambian nada y se dejan fuera del archivo.
traducen = {k.lower() for k, v in d.items() if k != v and len(k.strip()) >= 3}
def protege(k):
    if '{' in k: return False
    if k.lower() in traducen or re.search(r' y |^(El|La|Los|Las) [a-záéíóúñ]|\d', k): return True
    return any(w in traducen for w in re.findall('[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+', k.lower()))
d = {k: v for k, v in d.items() if k != v or protege(k)}
lineas = [k.replace('\t', ' ').replace('\n', ' ') + '\t' + str(v).replace('\t', ' ').replace('\n', ' ') for k, v in d.items() if isinstance(v, str) and k.strip()]
# Las plantillas ({t}, {n}…) van primero y en su orden (se aplican en ese orden); el resto, ordenado: así se comprime mejor
plantillas = [l for l in lineas if re.search(r'\{[a-z$]+\}', l.split('\t')[0])]
lineas = plantillas + sorted(l for l in lineas if not re.search(r'\{[a-z$]+\}', l.split('\t')[0]))
crudo = '\n'.join(lineas).encode('utf-8')
try:  # zopfli (si está instalado) da un gzip estándar unos 5 % más chico; el navegador lo lee igual
    import zopfli.gzip
    comprimido = zopfli.gzip.compress(crudo, numiterations=15)
except ImportError:
    comprimido = gzip.compress(crudo, 9, mtime=0)
# Z85 con '~' en lugar de '/' (así nunca aparece «</» dentro del script; sin comillas ni barra invertida) ocupa 25 % más que los datos; base64, 33 %
Z85 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!~*?&<>()[]{}@%$#'
datos = comprimido + b'\0' * ((4 - len(comprimido) % 4) % 4)
z = []
for i in range(0, len(datos), 4):
    v = int.from_bytes(datos[i:i + 4], 'big')
    z.append(''.join(Z85[(v // 85 ** k) % 85] for k in range(4, -1, -1)))
z85 = ''.join(z)
assert not any(p in z85.lower() for p in ('</', '<!--', '<script')), 'Z85 armó una secuencia que rompe el <script>; cambia el nivel de compresión'
with open(os.path.join(RAIZ, 'src', 'modulos', '01_ingles.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* ==== módulo: ingles ==== */\n// Diccionario español → inglés (' + str(len(lineas)) + ' frases), comprimido en Z85; lo arma tools/ingles.py\n'
            'ART.INGLES_LEN = ' + str(len(comprimido)) + ';\nART.INGLES_Z85 = \'' + z85 + '\';\n')
print(len(lineas), 'frases,', len(z85) // 1024, 'KB')
