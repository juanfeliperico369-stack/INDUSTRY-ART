#!/usr/bin/env bash
# Sube INDUSTRY ART a Steam. Antes: descarga las carpetas de la receta «App de PC» (tienda = steam) en
# dist/steam/windows, dist/steam/mac y dist/steam/linux, instala steamcmd y pon tus datos en app_build.vdf.
# Uso: STEAM_USUARIO=tu_cuenta_de_build bash steam/subir_steam.sh
set -e
cd "$(dirname "$0")"
for so in windows mac linux; do [ -d "../dist/steam/$so" ] || { echo "Falta ../dist/steam/$so"; exit 1; }; done
steamcmd +login "${STEAM_USUARIO:?Pon STEAM_USUARIO}" +run_app_build "$(pwd)/app_build.vdf" +quit
