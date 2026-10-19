#!/usr/bin/env bash
# Sube INDUSTRY ART a la Epic Games Store con BuildPatchTool (se descarga desde el Epic Developer Portal).
# Antes: las carpetas de la receta «App de PC» (tienda = epic) en dist/epic/windows y dist/epic/mac, y en el portal
# los datos de tu producto. Uso:
#   EPIC_ORG=... EPIC_PRODUCTO=... EPIC_ARTEFACTO=... EPIC_CLIENTE=... EPIC_CLIENT_SECRET=... bash epic/subir_epic.sh windows
set -e
SO="${1:-windows}"
EXE="INDUSTRY ART.exe"; [ "$SO" = "mac" ] && EXE="INDUSTRY ART.app/Contents/MacOS/INDUSTRY ART"
BuildPatchTool -OrganizationId="${EPIC_ORG:?}" -ProductId="${EPIC_PRODUCTO:?}" -ArtifactId="${EPIC_ARTEFACTO:?}" \
  -ClientId="${EPIC_CLIENTE:?}" -ClientSecretEnvVar=EPIC_CLIENT_SECRET -mode=UploadBinary \
  -BuildRoot="dist/epic/$SO" -CloudDir="dist/epic-nube/$SO" -BuildVersion="4.0.0-$SO" -AppLaunch="$EXE" -AppArgs=""
