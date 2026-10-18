# Bitácora V30 · 1.0
Fecha: 18 de octubre de 2026 · Plan Maestro v2 · versión para la tienda

## Qué se hizo (por sistema, en palabras simples)
- App de Android (carpeta `app/`): el mismo juego dentro de una app hecha con Capacitor 8. Funciona sin internet, en Android 7.0 o más nuevo, y apunta a Android 16 (API 36), como pide Google Play.
- Un anuncio al abrir: en la app gratis sale un anuncio de pantalla completa (AdMob) al abrirla, y nada más. En la versión web y en el modo de pago no se carga ningún anuncio. Si el anuncio falla, el juego abre igual.
- Receta en la nube (`.github/workflows/android.yml`): GitHub arma el `.aab` firmado con tu llave, que vive en los secretos de GitHub y nunca en el repositorio. Si falta la llave, avisa y arma el archivo sin firmar.
- Versión web gratis (`web.yml`): el juego y la política de privacidad en GitHub Pages.
- Íconos, pantalla de inicio, imagen destacada y 12 capturas (6 en español y 6 en inglés) dibujados por el propio juego (`tools/imagenes_app.js`).
- Ficha de la tienda en español e inglés (`docs/tienda.md`), política de privacidad (`docs/privacidad.html`) y guía paso a paso (`docs/publicar_google_play.md`): cuentas, llave, secretos, prueba cerrada de 12 personas por 14 días y producción.
- Créditos: «Ideado y creado por Felipe · Programado junto a Claude, de Anthropic». «Claude» no va en el nombre de la app ni del desarrollador.
- Arreglo: en inglés, algunos textos dibujados (frases de los pósters) salían mezclados; ahora solo se traducen frases completas.

## Decisiones nuevas (¿cambia el Registro? pendiente, te toca a ti)
- Gratis con un anuncio al abrir (lo que está puesto ahora) o de pago sin anuncios: se cambia con un solo ajuste en la receta.
- La compra del editor dentro de la app no se hizo: espera tu decisión.

## Guardado
- Versión del guardado: 30; migración desde la 29 (sin datos nuevos).

## Prueba de humo
- Navegador (todo el recorrido y el bot hasta 1912): 0 errores, 117 reglas bien. Migración V29 → V30: sí, 0 errores. Bot de campaña 1950–1990: 0 errores.
- Anuncio simulado: en modo gratis inicia, prepara y muestra; en la web no hace nada; en modo de pago no llama a AdMob.
- App: el APK de prueba (9,5 MB) y el `.aab` firmado se arman bien; la firma se verificó.

## Errores conocidos
- No se probó en un teléfono real ni con anuncios reales (no hay teléfono en el entorno).
- Los anuncios usan los identificadores de prueba de Google hasta que pongas los tuyos.

## Qué probar en el celular (3 cosas)
- Instala la app de la prueba cerrada: debe salir un anuncio de prueba y luego el juego.
- Juega sin internet (modo avión).
- Guarda, cierra la app y vuelve a abrirla: la partida debe seguir ahí.

## Para la próxima versión
- Lo que salga de la prueba cerrada.
