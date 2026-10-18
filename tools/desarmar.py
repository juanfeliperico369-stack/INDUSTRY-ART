#!/usr/bin/env python3
"""Desarma un HTML de INDUSTRY ART en módulos.

Uso:
    python3 tools/desarmar.py INDUSTRY_ART_v17.html            # reescribe src/ desde el HTML
    python3 tools/desarmar.py INDUSTRY_ART_v18.html --destino carpeta
    python3 tools/desarmar.py legado/INDUSTRY_ART_v15.html --destino legado/v15

Con un HTML armado (V16 en adelante) separa:
- los estilos en estilos.css (sin la tipografía incrustada, que vuelve a recursos/titulos.woff2),
- cada módulo marcado con /* ==== módulo: nombre ==== */ en modulos/NN_nombre.js,
- el esqueleto en plantilla.html con las marcas /*@ESTILOS@*/ y /*@MODULOS@*/.

Con la V15 (sin marcas de módulo) separa estilos.css, v15.js y plantilla.html,
para leerla y rescatar piezas. No usa npm ni librerías externas: solo Python 3.
"""
import argparse
import base64
import gzip
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARCA = re.compile(r"^/\* ==== módulo: ([a-z0-9_]+) ==== \*/\s*$", re.M)
FUENTE = re.compile(r"@font-face\{font-family:'Titulos';[^}]*base64,([A-Za-z0-9+/=]+)\)[^}]*\}\n?")


def escribir(ruta, texto, binario=False):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    if binario:
        with open(ruta, "wb") as f:
            f.write(texto)
    else:
        with open(ruta, "w", encoding="utf-8", newline="\n") as f:
            f.write(texto)


COMENTARIOS = re.compile(r"<!--comentarios:([A-Za-z0-9+/=]+)-->\n$")


def desarmar(html_ruta, destino):
    html = open(html_ruta, encoding="utf-8").read()
    # Comentarios de línea que armar.py apartó (comprimidos al final): se devuelven a su lugar en cada módulo
    guardados = {}
    cm = COMENTARIOS.search(html)
    if cm:
        guardados = json.loads(gzip.decompress(base64.b64decode(cm.group(1))).decode("utf-8"))
        html = html[: cm.start()]
    est = re.search(r"<style>(.*?)</style>", html, re.S)
    scr = re.search(r"<script>(.*)</script>", html, re.S)
    if not est or not scr:
        sys.exit("No encontré <style> y <script> en %s" % html_ruta)
    estilos, codigo = est.group(1), scr.group(1)
    if MARCA.search(codigo):  # armar.py lleva la sangría como tabuladores (uno por cada dos espacios): se devuelve
        expandir = lambda t: re.sub(r"^(\t+)", lambda m: "  " * len(m.group(1)), t, flags=re.M)
        estilos, codigo = expandir(estilos), expandir(codigo)

    def bordes(texto):
        """Espacios antes y después del contenido (para que armar.py rehaga el HTML idéntico)."""
        inicio = texto[: len(texto) - len(texto.lstrip())]
        fin = texto[len(texto.rstrip()) :]
        return inicio, fin[1:] if fin.startswith("\n") else fin

    est_ini, est_fin = bordes(estilos)
    scr_ini, scr_fin = bordes(codigo)
    estilos = estilos.strip()
    fuente = FUENTE.search(estilos)
    if fuente:
        escribir(os.path.join(destino, "recursos", "titulos.woff2"), base64.b64decode(fuente.group(1)), True)
        estilos = FUENTE.sub("", estilos, count=1)
    escribir(os.path.join(destino, "estilos.css"), estilos.strip() + "\n")

    plantilla = (html[: est.start(1)] + est_ini + "/*@ESTILOS@*/" + est_fin + html[est.end(1) : scr.start(1)]
                 + scr_ini + "/*@MODULOS@*/" + scr_fin + html[scr.end(1) :])
    escribir(os.path.join(destino, "plantilla.html"), plantilla)
    codigo = codigo.strip() + "\n"

    marcas = list(MARCA.finditer(codigo))
    if not marcas:
        escribir(os.path.join(destino, "v15.js"), codigo)
        print("Sin marcas de módulo: guardé el código completo en %s" % os.path.join(destino, "v15.js"))
        return
    carpeta = os.path.join(destino, "modulos")
    os.makedirs(carpeta, exist_ok=True)
    for viejo in os.listdir(carpeta):
        if viejo.endswith(".js"):
            os.remove(os.path.join(carpeta, viejo))
    orden = {
        "nucleo": 0, "textos": 1, "datos": 2, "taxonomia": 2, "calendario": 3, "mundo": 3, "economia": 4, "talentos": 5, "ideas": 6, "obras": 6,
        "produccion": 7, "rodaje": 7, "estreno": 8, "lanzamiento": 8, "ventanas": 8, "rivales": 9, "premios": 10, "critica": 10, "prensa": 10, "negocio": 11, "sede": 11, "arte": 12, "juego": 12, "carrera": 12,
        "guardado": 13, "interfaz": 14, "pantallas": 15, "agencia": 16, "creacion": 16, "distribucion": 16, "calendario_ui": 16, "prensa_ui": 16, "tele_ui": 16, "franquicias": 11, "banco": 11, "imperio": 11, "historia": 3, "eventos": 12, "imperio_ui": 16, "medios": 11, "medios_ui": 16, "metas": 12, "metas_ui": 16, "idioma": 14, "publicacion": 14, "documento": 14, "puntos": 14, "ingles": 1, "tv": 11, "streaming": 11, "pruebas": 17, "arranque": 99,
    }
    for i, m in enumerate(marcas):
        fin = marcas[i + 1].start() if i + 1 < len(marcas) else len(codigo)
        nombre = m.group(1)
        numero = orden.get(nombre, 50 + i)
        texto = codigo[m.start() : fin].rstrip() + "\n"
        g = guardados.get(nombre)
        if g:
            quedan, com = iter(texto.split("\n")), {i: l for i, l in g["c"]}
            texto = "\n".join(com[i] if i in com else next(quedan, "") for i in range(g["n"]))
        escribir(os.path.join(carpeta, "%02d_%s.js" % (numero, nombre)), texto)
    print("Desarmados %d módulos en %s" % (len(marcas), carpeta))


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("html")
    p.add_argument("--destino", default=os.path.join(RAIZ, "src"))
    a = p.parse_args()
    desarmar(a.html, a.destino)
