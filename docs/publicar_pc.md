# Cómo publicar INDUSTRY ART en PC (Windows, macOS y Linux)

La versión de PC es el mismo juego en una ventana propia, hecha con Electron (`app/escritorio/`). Funciona sin internet, no tiene anuncios y guarda las partidas en la carpeta de datos de la app:
- Windows: `%APPDATA%\INDUSTRY ART`
- macOS: `~/Library/Application Support/INDUSTRY ART`
- Linux: `~/.config/INDUSTRY ART`

Para pasar una partida entre el celular y el PC, usa Guardar › Exportar (archivo `.iasave`).

## 1. Armar la app

Actions › **App de PC** › Run workflow › `todos` (o solo `windows`, `mac` o `linux`). En unos 10 minutos, en la misma corrida, descarga:

| Archivo | Para |
|---|---|
| `INDUSTRY-ART-1.1.0-Windows-instalador.exe` | Windows 10 u 11, con instalador |
| `INDUSTRY-ART-1.1.0-Windows-portable.exe` | Windows, sin instalar (se abre con doble clic) |
| `INDUSTRY-ART-1.1.0-macOS.dmg` | macOS 12 o más nuevo, Intel y chip Apple |
| `INDUSTRY-ART-1.1.0-Linux.AppImage` | Linux de 64 bits (dale permiso de ejecución) |

En un repositorio privado, Windows gasta 2 minutos por minuto y Mac 10. Una corrida completa cuesta unos 60 de los 2.000 minutos gratis del mes.

## 2. Sin firma (gratis)

Sin certificado las apps funcionan, pero el sistema avisa la primera vez:
- **Windows**: «Windows protegió tu PC» › *Más información* › *Ejecutar de todas formas*.
- **macOS**: clic derecho sobre la app › *Abrir* › *Abrir*. O Ajustes del Sistema › Privacidad y seguridad › *Abrir igualmente*.
- **Linux**: `chmod +x INDUSTRY-ART-1.1.0-Linux.AppImage` y doble clic.

## 3. Dónde publicarla

- **itch.io** (recomendado para empezar): <https://itch.io>. Gratis, sin revisión. Crea el proyecto «INDUSTRY ART» (tipo *Downloadable*), sube los cuatro archivos marcando su sistema, y elige el precio: gratis, de pago o «paga lo que quieras». Puedes subir también el HTML del juego como versión para jugar en el navegador. itch.io se queda con el porcentaje que tú elijas (10 % por defecto).
- **Steam**: 100 USD por juego (Steamworks), con datos fiscales, página de tienda revisada y subida de compilaciones con SteamPipe. Conviene cuando ya tengas reseñas de itch.io o de los celulares.
- **Microsoft Store**: la cuenta de desarrollador individual es gratis. Pide un paquete MSIX o un instalador firmado. Se puede agregar más adelante con el formato `appx` de electron-builder.

## 4. Firmar (opcional, de pago)

- **Windows**: un certificado de firma de código (unos 200–400 USD al año) quita el aviso de SmartScreen. Ponlo en los secretos `CSC_LINK` (el `.p12` en base64) y `CSC_KEY_PASSWORD`.
- **macOS**: con la cuenta de Apple Developer (la misma de la App Store) crea un certificado **Developer ID Application**. Ponlo en `CSC_LINK` y `CSC_KEY_PASSWORD`, y agrega `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` y `APPLE_TEAM_ID` para que la receta la notarice. Así abre sin avisos.

## 5. Probar en tu PC sin la nube

Con Node.js instalado:

```
python3 tools/preparar_app.py
cd app/escritorio && npm install && npm run jugar      # abre el juego en una ventana
npm run armar                                           # arma el instalador de tu sistema en app/escritorio/dist
```

F11 pone la pantalla completa.
