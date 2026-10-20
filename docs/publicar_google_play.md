# Cómo publicar INDUSTRY ART en Google Play

Otras tiendas: [iPhone (App Store)](publicar_app_store.md) · [PC (Windows, macOS y Linux)](publicar_pc.md).

Guía paso a paso. Lo que está **en el repositorio** ya funciona: la app de Android, los íconos, las imágenes de la tienda y la receta que arma la app en la nube. Lo que sigue solo lo puedes hacer **tú**, porque son tus cuentas y tu llave.

Necesitas Java (keytool) solo para el paso 2. No hace falta Android Studio.

## 1. Cuentas

1. **GitHub**: ya la tienes (`juanfeliperico369-stack`). La receta de Android corre sola cada vez que llega una versión nueva a la rama principal del repositorio (`claude/industry-art-v16-analysis-dbf0iv`) o a `main`, y también a mano (paso 4).
2. **Google Play Console**: <https://play.google.com/console>. Pago único de 25 USD y verificación de identidad.
   - Nombre del desarrollador: **OneZero** (o el de tu estudio).
   - Las cuentas personales nuevas deben hacer una **prueba cerrada con 12 personas durante 14 días** antes de publicar (paso 6).
3. **AdMob** (solo si la app es gratis con anuncio): <https://admob.google.com>. Crea la app «INDUSTRY ART» (Android) y un bloque de anuncio **intersticial**. Anota los dos identificadores:
   - de la app: `ca-app-pub-XXXXXXXX~YYYYYYYY`
   - del intersticial: `ca-app-pub-XXXXXXXX/ZZZZZZZZ`

   Mientras no los pongas, la app usa los anuncios **de prueba** de Google, que no pagan, pero sirven para la prueba cerrada.
   - En AdMob › **Privacidad y mensajes** crea el mensaje **RGPD** (Europa) y, si sacas la app de iPhone, el de **IDFA**. La app ya muestra ese formulario de consentimiento antes del anuncio, y en Ajustes aparece «Privacidad de los anuncios» para cambiarlo. Sin ese mensaje, en Europa no se muestran anuncios.

## 2. La llave de firma (fuera de GitHub)

En tu computadora:

```
keytool -genkeypair -v -keystore industry-art.jks -alias industryart -keyalg RSA -keysize 2048 -validity 10000
```

Te pide dos contraseñas y tus datos. **Guarda `industry-art.jks` y las contraseñas en dos lugares seguros** (por ejemplo una memoria USB y tu gestor de contraseñas). Si la pierdes, no podrás subir actualizaciones.

- **Nunca** la subas al repositorio (el `.gitignore` ya bloquea `*.jks`).
- En Play Console activa **Firma de apps de Google Play** (viene activada por defecto). Así tu llave queda como «llave de subida» y Google guarda la definitiva.

Para pasarla a GitHub, conviértela a texto:

```
base64 -w0 industry-art.jks > llave.txt      # Linux
base64 -i industry-art.jks -o llave.txt      # Mac
certutil -encode industry-art.jks llave.txt  # Windows (borra las líneas BEGIN/END)
```

## 3. Secretos en GitHub

Repositorio › **Settings › Secrets and variables › Actions › New repository secret**:

| Nombre | Valor |
|---|---|
| `KEYSTORE_BASE64` | todo el contenido de `llave.txt` |
| `KEYSTORE_PASSWORD` | la contraseña del almacén |
| `KEY_ALIAS` | `industryart` (o el alias que usaste) |
| `KEY_PASSWORD` | la contraseña de la llave |
| `ADMOB_APP_ID` | (opcional) identificador de la app en AdMob |
| `ADMOB_INTERSTITIAL_ID` | (opcional) identificador del intersticial |

Después borra `llave.txt` de tu computadora.

## 4. Armar la app en la nube

Repositorio › **Actions › App de Android › Run workflow**.
- Rama: `main` (o la rama de trabajo).
- Modo: `gratis` (un anuncio por sesión, en la primera pausa) o `pago` (sin anuncios).

Tarda unos 6 minutos. Al final, en la misma página, descarga **industry-art-aab** y descomprímelo: adentro está `app-release.aab`. Cada corrida sube el número de versión sola.

## 5. Crear la app en Play Console

1. **Crear app** › nombre «INDUSTRY ART» › Juego › **Gratis** (decisión de la V32: gratis con un anuncio al abrir, más la compra «Versión completa» que solo quita el anuncio).
2. **Ficha de la tienda**: copia los textos y las imágenes de [`tienda.md`](tienda.md) y [`tienda/`](tienda/).
3. **Política de privacidad**: Google pide una dirección pública. GitHub Pages **no funciona en repositorios privados** con la cuenta gratuita, así que tienes dos caminos:
   - **Fácil (recomendado):** crea un repositorio **público** nuevo, por ejemplo `industry-art-web`, sube ahí `docs/privacidad.html` (y si quieres el HTML del juego como `index.html`), y en ese repositorio activa Settings › Pages › Deploy from a branch › `main`. La dirección queda así: `https://juanfeliperico369-stack.github.io/industry-art-web/privacidad.html`.
   - Con GitHub Pro (o haciendo público este repositorio): Settings › Pages › Source: GitHub Actions, y corre a mano la receta «Versión web».
4. **Contenido de la app** (menú «Política»):
   - **Anuncios**: «Sí, contiene anuncios».
   - **Clasificación de contenido**: categoría Juego. Responde con la verdad: violencia de ficción, temas sexuales sugeridos sin desnudos explícitos (género Erótico), **apuestas simuladas: sí** (Casino con dinero del juego), sin apuestas con dinero real, sin chat. Debería salir 16+ (PEGI 12–16 según el país).
   - **Público objetivo**: 16 años o más. No marques «atrae a niños».
   - **Seguridad de los datos** (solo versión gratis): «Recopila datos: sí» › *Identificadores del dispositivo u otros (ID de publicidad)* › propósito *Publicidad*, compartido con Google AdMob, cifrado en tránsito, no se puede pedir que se borre desde la app. Las partidas no salen del teléfono. En la versión de pago: «No recopila datos».
   - **ID de publicidad**: «Sí, usa el ID de publicidad» (gratis).

## 5 b. La compra «Versión completa»

1. **Perfil de pagos**: Play Console › Configuración › Perfil de pagos. Llena tus datos y una cuenta bancaria. Sin esto Google no deja vender.
2. **Monetizar › Productos › Productos integrados en la aplicación** › Crear producto:
   - ID del producto: **`version_completa`** (tiene que ser exacto, porque el juego lo busca con ese nombre).
   - Nombre: «Versión completa». Descripción: «Quita los anuncios. El juego es el mismo para todos.»
   - Precio: el que quieras (**3 USD**, decisión de la V32). Google lo convierte a cada país, y el juego muestra el precio que manda la tienda.
   - Actívalo.
3. **Probar sin pagar**: Configuración › **Pruebas de licencias** › agrega tu Gmail y los de tus probadores. Con esas cuentas, la compra sale como «prueba» y no cobra.

Cómo funciona dentro del juego: Ajustes › «Quitar el anuncio» y «Restaurar compras». Cada vez que se abre la app, el juego le pregunta a Google Play si esa cuenta compró. Si hubo un reembolso, el anuncio vuelve. Sin internet vale la última respuesta.

## 6. Prueba cerrada (12 personas × 14 días)

1. **Pruebas › Prueba cerrada › Crear pista** › sube `app-release.aab`.
2. **Testers**: crea una lista con los correos de Gmail de **al menos 12 personas** (familia, amigos). Copia el enlace de participación y mándaselo.
3. Cada persona abre el enlace, acepta y **deja instalada la app los 14 días**. Pídeles que la abran de vez en cuando y que te cuenten errores.
4. Envía la versión a revisión. Google tarda de 1 a 7 días en aprobarla.
5. Pasados los 14 días con 12 personas activas, aparece **Solicitar acceso a producción**. Responde las preguntas sobre la prueba.

Si encuentras errores durante la prueba, arregla, sube una versión nueva al repositorio, vuelve a correr la receta y sube el `.aab` nuevo a la misma pista. Los 14 días no se reinician.

## 7. Producción

**Producción › Crear versión** › sube el último `.aab` › notas de la versión («Primera versión de INDUSTRY ART») › países › **Enviar a revisión**. Al aprobarse, la app sale en Google Play.

## Cosas que puedes cambiar

- **Identificador de la app**: `com.industryart.juego` (en `app/capacitor.config.json`, `app/android/app/build.gradle` y `app/ios/App/App.xcodeproj/project.pbxproj`; en iPhone también en `.github/workflows/ios.yml`). Cámbialo **antes** de la primera subida; después ya no se puede.
- **Producto de la compra**: `compra` en `app/config.json` (por defecto `version_completa`); tiene que coincidir con el ID que crees en Google Play y en la App Store.
- **Modo `pago`** (sin anuncios ni compras): sigue disponible en la receta (paso 4), pero la decisión de la V32 es `gratis`.
- **Anuncio al abrir**: `anuncioAlAbrir` en `app/config.json`.

## Probar la app en tu teléfono sin la tienda

En tu computadora con Android SDK:

```
cd app && npm install && python3 ../tools/preparar_app.py && npx cap sync android
cd android && ./gradlew assembleDebug
```

El archivo `app/android/app/build/outputs/apk/debug/app-debug.apk` se instala en cualquier Android 7.0 o más nuevo.
