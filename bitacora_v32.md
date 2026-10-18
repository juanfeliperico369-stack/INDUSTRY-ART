# Bitácora V32 · 1.2 · Versión completa
Fecha: 18 de octubre de 2026 · decisiones tuyas de esta versión · sin cambios en el juego

## Qué se hizo (por sistema, en palabras simples)
- Compra única «Versión completa» en Android (Google Play) y iPhone (App Store) que **solo quita el anuncio al abrir**. El juego, el editor y todos los modos siguen iguales para todos.
- En Ajustes hay una tarjeta «Versión completa» con el precio que manda la tienda (en la moneda de cada país), el botón «Quitar el anuncio» y «Restaurar compras», que Apple exige. Después de comprar dice «¡gracias por apoyar el juego!».
- Verificación con la tienda: cada vez que se abre la app, el juego le pregunta a Google Play o a la App Store si esa cuenta compró, antes del anuncio. En Android solo cuenta una compra ya pagada; un pago pendiente todavía no. En iPhone solo cuentan las compras vigentes de esa cuenta de Apple. Si hubo un reembolso, el anuncio vuelve. Sin internet vale la última respuesta (se espera a la tienda 4 segundos como máximo).
- La web y la PC no cambian: no tienen anuncios ni compra.
- Plugin de compras para Capacitor 8 (`@capgo/native-purchases` 8.8.1, versión fija). No hace falta otra cuenta ni un servidor.
- Guías: cómo crear el producto `version_completa` en Play Console y en App Store Connect, el perfil de pagos y el acuerdo de apps de pago, y cómo probar sin pagar. La política de privacidad y la ficha ya hablan de la compra.
- Textos nuevos traducidos al inglés (12 frases).

## Decisiones nuevas (¿cambia el Registro? sí, las tomaste tú)
- Monetización: gratis con un anuncio al abrir, más una compra única que solo quita el anuncio. Nada del juego queda bloqueado.
- El editor queda gratis e incluido para todos.

## Guardado
- Versión del guardado: 32; migración desde la 31 (sin datos nuevos; la compra vive en la tienda, no en la partida).

## Prueba de humo
- Navegador (recorrido completo y bot): 0 errores, 117 reglas bien. Migración V31 → V32: sí. Bot de campaña 1950–1990: 0 errores.
- Tienda simulada en 8 casos: sin compra, comprado, pago pendiente, sin internet con compra guardada, reembolso, comprar ahora, restaurar en iPhone y modo de pago. Cada uno muestra o quita el anuncio como debe, con 0 errores.
- En inglés la tarjeta sale traducida, con el precio. La PC 1.2 abre, juega, guarda y vuelve a cargar, sin compra ni anuncio.
- Android 1.2 compila (APK de 11,2 MB) con el permiso de compras de Google Play.

## Errores conocidos
- No se probó una compra real: necesita tu perfil de pagos, el producto creado en las tiendas y un teléfono.
- Sin un servidor propio, alguien con un teléfono modificado podría engañar a la tienda para quitar el anuncio. Para quitar solo un anuncio, el riesgo es bajo.

## Qué probar en el celular (3 cosas)
- Con una cuenta de «Pruebas de licencias», Ajustes › Quitar el anuncio: compra de prueba, cierra y abre, y no debe salir el anuncio.
- Desinstala, instala y toca «Restaurar compras».
- Modo avión: abre la app; con la compra hecha no debe salir el anuncio.

## Para la próxima versión
- Lo que salga de la prueba cerrada.
