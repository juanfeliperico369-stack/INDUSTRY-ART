#!/usr/bin/env python3
"""Arma src/modulos/01_ingles.js: el diccionario español → inglés (comprimido con gzip en base64).
Uso: python3 tools/ingles.py diccionario.json [más.json ...]   (objetos {"español": "english"})"""
import sys, json, gzip, base64
d = {}
for ruta in sys.argv[1:]:
    d.update(json.load(open(ruta, encoding='utf-8')))
lineas = [k.replace('\t', ' ').replace('\n', ' ') + '\t' + str(v).replace('\t', ' ').replace('\n', ' ') for k, v in d.items() if isinstance(v, str) and k.strip()]
gz = base64.b64encode(gzip.compress('\n'.join(lineas).encode('utf-8'), 9)).decode('ascii')
with open('src/modulos/01_ingles.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* ==== módulo: ingles ==== */\n// V29 · Diccionario español → inglés (' + str(len(lineas)) + ' frases), comprimido; lo arma tools/ingles.py\nIA.INGLES_GZ = \'' + gz + '\';\n')
print(len(lineas), 'frases,', len(gz) // 1024, 'KB')
