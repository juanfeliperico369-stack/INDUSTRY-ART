# Bitácora V31 · 1.1 · iPhone y PC
Fecha: 18 de octubre de 2026 · Plan Maestro v2 («Web y Android primero; luego iOS y PC») · sin cambios en el juego

## Qué se hizo (por sistema, en palabras simples)
- iPhone (`app/ios/`): la misma app de Capacitor 8 para iOS 15 o más nuevo, solo para iPhone. Trae el ícono de 1024 sin transparencia, pantallas de inicio y el aviso de rastreo de Apple antes del anuncio.
- PC (`app/escritorio/`): el juego en una ventana propia con Electron 44 para Windows (instalador y portátil), macOS (.dmg) y Linux (AppImage). No tiene anuncios ni necesita internet, guarda en la carpeta de la app y F11 pone pantalla completa.
- Anuncios: cada sistema usa sus propios identificadores de AdMob. Antes del anuncio se pide el consentimiento que Google exige en Europa (le faltaba a la 1.0). Si la persona no acepta, no hay anuncio. Si la ley lo pide, en Ajustes aparece «Privacidad de los anuncios».
- Ajustes muestra el sistema: «1.1 · Android / iPhone / PC / Web».
- Recetas en la nube: «App de iPhone» compila en un Mac de GitHub; con tus secretos de Apple firma y sube a TestFlight. «App de PC» arma los tres sistemas.
- Arreglos de la V30: la receta de Android esperaba la rama `main`, que no existe; ahora corre con la rama principal. La versión web ya no corre sola, porque GitHub Pages no sirve en repositorios privados gratis; la guía explica otro camino para la política de privacidad.
- Imágenes nuevas: 12 capturas de iPhone (1320 × 2868, español e inglés), 3 de PC (1920 × 1080) e íconos.
- Guías nuevas: `docs/publicar_app_store.md` (sin Mac) y `docs/publicar_pc.md` (itch.io, Steam y Microsoft Store). Se actualizaron la ficha de las tiendas y la política de privacidad.

## Decisiones nuevas (¿cambia el Registro? no)
- iPhone solo (no iPad), así la App Store no pide capturas de iPad.
- PC sin anuncios. El precio lo pones en la tienda (itch.io recomendado para empezar).
- Sigue pendiente lo tuyo: gratis con anuncio o de pago, y el editor como compra.

## Guardado
- Versión del guardado: 31; migración desde la 30 (sin datos nuevos).

## Prueba de humo
- Navegador (recorrido completo y bot): 0 errores, 117 reglas bien. Migración V30 → V31: sí. Bot de campaña 1950–1990: 0 errores.
- PC real (Electron): abre, juega 3 años, guarda, se cierra y al volver a abrir carga la partida; la AppImage armada también abre, con 0 errores.
- Anuncios simulados en 5 casos (Android, iPhone, Europa que acepta, Europa que no acepta y modo de pago): cada uno hace solo lo que debe.
- Android 1.1 vuelve a armar (APK de 10,7 MB, API 36).
- En la nube (GitHub), todas bien: Android arma el .aab; iPhone compila con Xcode 26.6 y pasa la validación de la tienda; PC arma el instalador y el portátil de Windows, el .dmg de Mac y la AppImage de Linux. Arreglos en el camino: un paquete viejo del SDK de Android y una flecha que la consola de Windows no imprimía.

## Errores conocidos
- iPhone: la firma y la subida a TestFlight solo se pueden probar con tu cuenta de Apple.
- Las apps de PC salen sin firma: Windows y macOS avisan la primera vez (la guía dice cómo abrirlas).

## Qué probar en el celular (3 cosas)
- Android: abre la app, acepta o rechaza el aviso de privacidad si sale, y juega.
- Ajustes: abajo debe decir «1.1 · Android».
- Exporta una partida (.iasave) y ábrela en la versión de PC.

## Para la próxima versión
- Lo que salga de la prueba cerrada y tus decisiones de precio.
