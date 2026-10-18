#!/usr/bin/env python3
"""Arma INDUSTRY ART: une src/ en un solo HTML que funciona sin internet.

Uso:
    python3 tools/armar.py                 # crea INDUSTRY_ART_v18.html en la raíz
    python3 tools/armar.py --salida otro.html

Qué hace:
1. Lee src/plantilla.html.
2. Incrusta src/estilos.css y la tipografía de títulos (src/recursos/titulos.woff2) en base64.
3. Une los módulos de src/modulos/ en orden (00_, 01_, ...) con la marca
   /* ==== módulo: nombre ==== */ antes de cada uno, para que desarmar.py los separe.
No usa npm ni librerías externas: solo Python 3.
"""
import argparse
import base64
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RAIZ, "src")
VERSION = "32"

MARCA = re.compile(r"^/\* ==== módulo: ([a-z0-9_]+) ==== \*/\s*$", re.M)


def leer(ruta):
    with open(ruta, encoding="utf-8") as f:
        return f.read()


def modulos():
    carpeta = os.path.join(SRC, "modulos")
    nombres = sorted(n for n in os.listdir(carpeta) if n.endswith(".js"))
    partes = []
    for nombre in nombres:
        texto = leer(os.path.join(carpeta, nombre)).rstrip() + "\n"
        clave = re.sub(r"^\d+_", "", nombre[:-3])
        primera = texto.split("\n", 1)[0]
        if not MARCA.match(primera):
            texto = "/* ==== módulo: %s ==== */\n" % clave + texto
        elif MARCA.match(primera).group(1) != clave:
            sys.exit("La marca de %s no coincide con su nombre de archivo" % nombre)
        if "</script" in texto.lower():
            sys.exit("El módulo %s contiene '</script', que rompería el HTML" % nombre)
        partes.append(texto)
    return "\n".join(partes)


def fuente():
    ruta = os.path.join(SRC, "recursos", "titulos.woff2")
    if not os.path.exists(ruta):
        return ""
    datos = base64.b64encode(open(ruta, "rb").read()).decode("ascii")
    return (
        "@font-face{font-family:'Titulos';font-style:normal;font-weight:400;font-display:swap;"
        "src:url(data:font/woff2;base64,%s) format('woff2')}\n" % datos
    )


def armar(salida):
    plantilla = leer(os.path.join(SRC, "plantilla.html"))
    estilos = fuente() + leer(os.path.join(SRC, "estilos.css"))
    codigo = modulos()
    if "/*@ESTILOS@*/" not in plantilla or "/*@MODULOS@*/" not in plantilla:
        sys.exit("La plantilla debe tener /*@ESTILOS@*/ y /*@MODULOS@*/")
    html = plantilla.replace("/*@ESTILOS@*/", estilos).replace("/*@MODULOS@*/", codigo)
    with open(salida, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    kb = os.path.getsize(salida) / 1024
    print("Armado %s (%.1f KB, %d módulos)" % (os.path.relpath(salida, RAIZ), kb, len(MARCA.findall(codigo))))


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--salida", default=os.path.join(RAIZ, "INDUSTRY_ART_v%s.html" % VERSION))
    armar(p.parse_args().salida)
