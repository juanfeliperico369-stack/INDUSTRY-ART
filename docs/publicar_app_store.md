# Cómo publicar INDUSTRY ART en la App Store (iPhone)

No necesitas un Mac: la app se arma en un Mac de GitHub con la receta **App de iPhone** (`.github/workflows/ios.yml`). Lo que sigue solo lo puedes hacer **tú**, porque son tus cuentas y tus certificados. Para los comandos de `openssl` sirve Git Bash en Windows (viene con Git) o la terminal de Linux.

Ojo con los minutos: en un repositorio privado cada minuto de Mac gasta 10 de los 2.000 minutos gratis del mes. Una corrida cuesta unos 100.

## 1. Cuentas

1. **Apple Developer Program**: <https://developer.apple.com/programs/>. Cuesta 99 USD al año. Necesitas un Apple ID con verificación en dos pasos. Como persona, el vendedor que se ve en la tienda es tu nombre legal. Para mostrar un nombre de estudio hace falta inscribirse como empresa, con número D-U-N-S (por ejemplo, **OneZero**).
2. **AdMob** (solo si la app es gratis): en la misma cuenta de AdMob de Android, agrega la app «INDUSTRY ART» para **iOS** y un bloque **intersticial**. Anota sus dos identificadores. En Privacidad y mensajes crea también el mensaje **IDFA** (explica el permiso de rastreo antes de que Apple lo pida).

## 2. Certificado de distribución (sin Mac)

```
openssl genrsa -out ios_distribucion.key 2048
openssl req -new -key ios_distribucion.key -out pedido.csr -subj "/emailAddress=TU_CORREO/CN=Tu Nombre/C=CO"
```

(Cambia `CO` por las dos letras de tu país.) En <https://developer.apple.com/account> › **Certificates** › **+** › **Apple Distribution** › sube `pedido.csr` › descarga `distribution.cer`. Luego:

```
openssl x509 -in distribution.cer -inform DER -out distribution.pem -outform PEM
openssl pkcs12 -export -legacy -inkey ios_distribucion.key -in distribution.pem -out ios_distribucion.p12
```

Te pide una contraseña para el `.p12`: anótala. Si tu `openssl` no conoce `-legacy`, quítalo. Guarda la `.key` y el `.p12` fuera de GitHub, igual que la llave de Android.

## 3. Identificador y perfil

1. **Identifiers** › **+** › App IDs › App › Bundle ID *Explicit*: `com.industryart.juego`, descripción «INDUSTRY ART». No marques ninguna capacidad.
2. **Profiles** › **+** › **App Store Connect** › elige el identificador y el certificado › nombre `INDUSTRY ART App Store` › descarga el `.mobileprovision`.
3. Tu **Team ID** está en Membership details (10 letras y números).

## 4. Clave para subir a TestFlight

App Store Connect › **Usuarios y acceso** › **Integraciones** › **App Store Connect API** › Claves del equipo › **+**, con el rol *App Manager*. Descarga `AuthKey_XXXXXXXXXX.p8` (solo se puede bajar una vez) y anota el **Key ID** y el **Issuer ID**.

## 5. Crear la app en App Store Connect

<https://appstoreconnect.apple.com> › Apps › **+** › Nueva app:
- Plataforma iOS, nombre «INDUSTRY ART» (si ya está tomado: «INDUSTRY ART: Estudio de cine»).
- Idioma principal Español; Bundle ID `com.industryart.juego`; SKU `industryart1`.

## 6. Secretos en GitHub

Convierte cada archivo a texto: `base64 -w0 archivo > archivo.txt` (Git Bash o Linux).

| Nombre | Valor |
|---|---|
| `IOS_CERT_P12_BASE64` | `ios_distribucion.p12` en base64 |
| `IOS_CERT_PASSWORD` | la contraseña del `.p12` |
| `IOS_PROFILE_BASE64` | el `.mobileprovision` en base64 |
| `IOS_TEAM_ID` | tu Team ID |
| `ASC_KEY_ID` y `ASC_ISSUER_ID` | los de la clave del paso 4 |
| `ASC_KEY_P8_BASE64` | `AuthKey_….p8` en base64 |
| `ADMOB_IOS_APP_ID` y `ADMOB_IOS_INTERSTITIAL_ID` | (opcionales) los de AdMob para iOS |

## 7. Armar y subir

Actions › **App de iPhone** › Run workflow › modo `gratis` o `pago`. En unos 15 minutos la app llega a **TestFlight** (y el `.ipa` queda en la corrida). Sin los secretos, la receta solo comprueba que la app compila.

En App Store Connect › TestFlight agrega tu correo como probador interno, instala **TestFlight** en el iPhone y prueba. Apple no exige una prueba cerrada como Google.

## 8. Ficha, privacidad y revisión

- **Ficha**: textos en [`tienda.md`](tienda.md) (sección App Store). Capturas: `docs/tienda/iphone_es_*.jpg` e `iphone_en_*.jpg` (1320 × 2868, pantalla de 6,9 pulgadas). La app es solo para iPhone, así que no pide capturas de iPad.
- **Categoría**: Juegos › Simulación. **Precio**: gratis.
- **Compra «Versión completa»** (solo quita el anuncio):
  1. App Store Connect › **Negocios** › firma el **Acuerdo de apps de pago** y llena los datos bancarios y de impuestos. Sin esto Apple no deja vender.
  2. En tu app › **Compras dentro de la app** › **+** › tipo **No consumible**. ID del producto: **`version_completa`** (exacto). Nombre de referencia: «Versión completa». Elige el precio (**3 USD**, decisión de la V32) y escribe el nombre y la descripción en español e inglés.
  3. Sube una captura de Ajustes con el botón «Quitar el anuncio» para la revisión, y en la versión que envíes marca la compra para revisarla junto con la app.
  4. En TestFlight, las compras son de prueba y no cobran.
- **Privacidad de la app** (versión gratis), según la guía de Google para AdMob: *Ubicación aproximada*, *Identificadores › ID del dispositivo*, *Datos de uso › Interacción con el producto y Datos de publicidad*, *Diagnóstico*. Todos con el uso «Publicidad de terceros», no vinculados a tu identidad. El ID del dispositivo sí se usa para **rastreo**. En la versión de pago: «No se recopilan datos».
- **URL de privacidad**: la misma de Google Play (ver la guía de Google Play, paso 5).
- **Clasificación por edad**: responde con la verdad: violencia de ficción y temas sexuales sugeridos poco frecuentes, sin desnudos, sin apuestas, sin chat. Debería salir 16+.
- **Cifrado**: ya va declarado en la app (no usa cifrado propio), así que Apple no pregunta.
- **Enviar a revisión**: Apple tarda de 1 a 3 días. Si la rechazan por «la app es solo un sitio web» (regla 4.2), responde que es un juego completo que funciona sin internet, con guardado local, y adjunta un video corto.
