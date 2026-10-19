#!/usr/bin/env python3
"""Arma INDUSTRY ART: une src/ en un solo HTML que funciona sin internet.

Uso:
    python3 tools/armar.py                 # crea INDUSTRY_ART_Definitiva.html en la raíz
    python3 tools/armar.py --salida otro.html
    python3 tools/armar.py --completo      # guarda la sangría y los comentarios para que desarmar.py los devuelva

Qué hace:
1. Lee src/plantilla.html.
2. Incrusta src/estilos.css y la tipografía de títulos (src/recursos/titulos.woff2) en base64.
3. Une los módulos de src/modulos/ en orden (00_, 01_, ...) con la marca
   /* ==== módulo: nombre ==== */ antes de cada uno, para que desarmar.py los separe.
No usa npm ni librerías externas: solo Python 3.
"""
import argparse
import base64
import gzip
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RAIZ, "src")
SALIDA = "INDUSTRY_ART_Definitiva.html"

MARCA = re.compile(r"^/\* ==== módulo: ([a-z0-9_]+) ==== \*/\s*$", re.M)


def leer(ruta):
    with open(ruta, encoding="utf-8") as f:
        return f.read()


# Los comentarios de línea entera (// …) no los necesita el juego: viajan comprimidos al final del HTML, en un
# comentario que el navegador ignora, y desarmar.py los vuelve a poner en su lugar. Así el archivo pesa ~55 KB menos.
COMENTARIO = re.compile(r"^\s*//")


def apartar_comentarios(clave, texto, guardados):
    lineas = texto.split("\n")
    guardados[clave] = {"n": len(lineas), "c": [[i, l] for i, l in enumerate(lineas) if COMENTARIO.match(l)]}
    return "\n".join(l for l in lineas if not COMENTARIO.match(l))


def empacar(guardados):
    crudo = json.dumps(guardados, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    try:
        import zopfli.gzip
        comprimido = zopfli.gzip.compress(crudo, numiterations=15)
    except ImportError:
        comprimido = gzip.compress(crudo, 9, mtime=0)
    return "<!--comentarios:%s-->\n" % base64.b64encode(comprimido).decode("ascii")


def modulos(guardados=None):
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
        if guardados is not None:
            texto = apartar_comentarios(clave, texto, guardados)
        partes.append(texto)
    return "\n".join(partes)


# La sangría viaja como tabuladores (uno por cada dos espacios): el archivo pesa unos 38 KB menos y desarmar.py la
# devuelve exacta. Ningún módulo tiene textos de varias líneas, así que el código se comporta igual.
SANGRIA = re.compile(r"^((?:  )+)", re.M)


def compactar(texto, completo=True):
    if "\t" in texto:
        sys.exit("Las fuentes no deben tener tabuladores (la sangría compacta los usa)")
    if not completo:
        # El archivo que se entrega va sin sangría ni líneas vacías: pesa menos y abre en cualquier visor
        return "\n".join(l.lstrip(" ") for l in texto.split("\n") if l.strip())
    return SANGRIA.sub(lambda m: "\t" * (len(m.group(1)) // 2), texto)


def fuente():
    ruta = os.path.join(SRC, "recursos", "titulos.woff2")
    if not os.path.exists(ruta):
        return ""
    datos = base64.b64encode(open(ruta, "rb").read()).decode("ascii")
    return (
        "@font-face{font-family:'Titulos';font-style:normal;font-weight:400;font-display:swap;"
        "src:url(data:font/woff2;base64,%s) format('woff2')}\n" % datos
    )


def armar(salida, completo=False):
    plantilla = leer(os.path.join(SRC, "plantilla.html"))
    estilos = fuente() + leer(os.path.join(SRC, "estilos.css"))
    guardados = {}
    codigo = modulos(guardados)
    if "/*@ESTILOS@*/" not in plantilla or "/*@MODULOS@*/" not in plantilla:
        sys.exit("La plantilla debe tener /*@ESTILOS@*/ y /*@MODULOS@*/")
    html = plantilla.replace("/*@ESTILOS@*/", compactar(estilos, completo)).replace("/*@MODULOS@*/", compactar(codigo, completo))
    if completo:
        html += empacar(guardados)
    with open(salida, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    kb = os.path.getsize(salida) / 1024
    print("Armado %s (%.1f KB, %d módulos)" % (os.path.relpath(salida, RAIZ), kb, len(MARCA.findall(codigo))))


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--salida", default=os.path.join(RAIZ, SALIDA))
    p.add_argument("--completo", action="store_true", help="con sangría y comentarios (para desarmar.py)")
    a = p.parse_args()
    armar(a.salida, a.completo)
