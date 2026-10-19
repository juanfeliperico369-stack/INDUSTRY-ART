# Ediciones y tiendas

INDUSTRY ART tiene **dos ediciones con todo el juego desbloqueado**. La única diferencia son los anuncios.

| Edición | Precio | Anuncios | Dónde |
|---|---|---|---|
| **Completa** | De pago | Ninguno | Google Play, App Store, Steam, Epic Games, PC (descarga directa) y la página web |
| **Con anuncios** | Gratis | Uno al abrir y, como mucho, otro cada 20 minutos en una pausa (al cerrar un año o al abrir la pausa), nunca en medio de una decisión | Google Play y App Store |

La edición la decide `window.ART_CONFIG.edicion` (`completa` o `anuncios`), que pone `tools/preparar_app.py` en cada
paquete. Los anuncios y el tiempo entre uno y otro se ajustan en `app/config.json` (`anuncios.alAbrir`,
`anuncios.cadaMinutos`). Si `compra` tiene el id de un producto, la edición con anuncios ofrece además una compra que
los quita; vacío (lo de fábrica), no hay compras: para jugar sin anuncios está la edición completa.

## Paquetes

| Plataforma | Qué sale | Cómo se arma |
|---|---|---|
| Android | Un `.aab` firmado por edición para Google Play y un `.apk` de cada una para instalar | Receta «App de Android» (sabores `completa` y `anuncios`); en tu PC: `python3 tools/preparar_app.py`, `npx cap sync android` y `./gradlew bundleCompletaRelease bundleAnunciosRelease` en `app/android` |
| iPhone y iPad | `.ipa` firmado y subida a TestFlight | Receta «App de iPhone» con `edicion` = `completa` o `anuncios` (necesita un Mac de GitHub y tu cuenta de Apple Developer) |
| Windows, macOS y Linux | Instalador y versión portátil de Windows, `.dmg` y `.zip` de macOS, AppImage y `.tar.gz` de Linux | Receta «App de PC» con `tienda` = `directo` |
| Steam | Carpetas de Windows, macOS y Linux para SteamPipe | Receta «App de PC» con `tienda` = `steam`, luego `steam/subir_steam.sh` (ver `steam/app_build.vdf`) |
| Epic Games Store | Carpetas de Windows y macOS para BuildPatchTool | Receta «App de PC» con `tienda` = `epic`, luego `epic/subir_epic.sh` |
| Página web (Windows, macOS, Linux y ChromeOS) | Página instalable (PWA) que funciona sin internet | Receta «Versión web» (GitHub Pages) o `python3 tools/preparar_app.py --web`, que la deja en `dist/web` |

## Identificadores

- Android e iPhone, edición con anuncios: `com.industryart.juego` (la ficha que ya existía).
- Android e iPhone, edición completa: `com.industryart.juego.completa` (una ficha nueva, de pago).
- PC, Steam y Epic: `com.industryart.juego` (Electron); en Ajustes se ve la tienda (Steam o Epic Games).

## Antes de enviar a cada tienda

- **Google Play**: dos fichas. En la de anuncios marca «Contiene anuncios» y declara en Seguridad de los datos el
  identificador de publicidad (AdMob); la completa no pide ese permiso. Pon tus identificadores reales de AdMob en
  los secretos `ADMOB_APP_ID` y `ADMOB_INTERSTITIAL_ID` (sin ellos salen anuncios de prueba que no pagan).
- **App Store**: dos apps. La de anuncios pide el permiso de rastreo de Apple (App Tracking Transparency) y declara
  en la etiqueta de privacidad los datos que usa AdMob; la completa no lo pide.
- **Steam y Epic Games**: solo la edición completa. Sus reglas para desarrolladores no están pensadas para juegos con
  redes de anuncios, así que allí va la versión de pago sin anuncios; revisa las pautas vigentes de cada tienda
  (Steamworks «Rules and Guidelines» y las de la Epic Games Store) antes de enviar.
- **macOS**: sin certificado de Apple la app sale firmada «ad hoc» y se abre con clic derecho › Abrir; con
  certificado y los secretos de notarización, la receta la firma y la notariza.
- **Windows**: sin certificado de firma, Windows avisa «editor desconocido» la primera vez.

Los `.apk` que arma este repositorio sin la llave de Google Play van firmados con la llave de prueba: sirven para
instalar y probar en un celular, no para subir a la tienda.
