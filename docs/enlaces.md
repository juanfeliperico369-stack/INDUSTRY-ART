# Enlaces oficiales de INDUSTRY ART

Los enlaces se escriben en un solo lugar: `ART.ENLACES`, cerca del inicio de `INDUSTRY_ART_v42.html`.
Solo se aceptan direcciones que empiezan con `https://`. Mientras un enlace está vacío, el juego lo muestra como «próximamente».

| Clave | Para qué |
|---|---|
| `reddit`, `discord`, `itch`, `wiki`, `telegram`, `whatsapp` | Comunidad |
| `youtube`, `tiktok`, `instagram`, `facebook`, `x`, `threads`, `bluesky`, `mastodon`, `twitch`, `kick` | Redes sociales |
| `blog`, `boletin`, `prensa` | Noticias y prensa (diario de desarrollo, boletín y kit de prensa) |
| `spotify`, `applemusic`, `youtubemusic`, `soundcloud`, `bandcamp` | Banda sonora del juego |
| `web` | Página oficial (el juego en el navegador). También sale en las tarjetas para compartir |
| `playstore`, `appstore`, `steam`, `microsoft`, `epic`, `gog`, `amazon`, `samsung`, `huawei` | Tiendas |
| `gamejolt`, `newgrounds`, `crazygames`, `poki` | Portales de juegos web (versión gratis con anuncios) |
| `android`, `windows`, `mac`, `linux` | Descargas directas |
| `kofi`, `patreon`, `buymeacoffee`, `paypal`, `githubsponsors`, `liberapay` | Donaciones |
| `letterboxd`, `serializd`, `trakt`, `backloggd`, `rateyourmusic`, `albumoftheyear`, `goodreads`, `storygraph`, `showscore`, `myanimelist`, `anilist`, `imdb`, `igdb` | Listas y crítica |

## Dónde se ven
- **Ajustes › Comunidad y enlaces**, y el botón **Comunidad** del menú de pausa.
- La dirección `web` sale al pie de las tarjetas para compartir.

## Listas y crítica
Sirven para crear comunidad alrededor de las obras reales que aparecen en el juego, con listas como «Las películas de los hitos de INDUSTRY ART» o «Los clásicos de dominio público del juego»:
- **Cine y series:** Letterboxd (cine), Serializd (series) y Trakt (cine y series).
- **Videojuegos:** Backloggd. Ahí también puede aparecer el propio juego cuando tenga ficha en IGDB.
- **Música:** Rate Your Music y Album of the Year.
- **Libros:** Goodreads y The StoryGraph.
- **Teatro:** Show-Score.
- **Anime y manga:** MyAnimeList.

Este grupo también se muestra en las apps del celular, como la comunidad y las redes.

## Apps del celular
- En la app de Android e iPhone (Capacitor), el juego muestra solo **Comunidad**, **Redes**, **Noticias y prensa**, **Banda sonora** y **Listas y crítica**: oculta las otras tiendas, las descargas directas y las donaciones, porque Apple y Google ponen reglas a esos enlaces dentro de una app.
- Si alguna vez quieres mostrarlos igual, pon `"enlacesTodos": true` en `app/config.json`.
- Las apps también pueden cambiar los enlaces sin tocar el HTML, con `"enlaces": { "reddit": "https://…" }` en `app/config.json`.
- En la web y en PC (Electron) se ven todos los grupos.

## Plataformas de donación recomendadas

| Plataforma | Cómo funciona | Notas |
|---|---|---|
| **Ko-fi** | Donaciones sueltas y membresías | No cobra comisión en donaciones sueltas con el plan gratis; paga por PayPal o Stripe |
| **Patreon** | Membresías mensuales con niveles | Comisión de plataforma más el procesamiento de pago; ideal si darás contenido extra (como los videos de historia) |
| **Buy Me a Coffee** | Donaciones sueltas y membresías | Comisión baja y página muy simple |
| **PayPal** | Enlace directo para donar | Lo más conocido; no tiene página de creador |

**Recomendación:** empieza con **Ko-fi**, porque es simple y sin comisión en donaciones sueltas, y suma **Patreon** cuando tengas contenido regular (videos o devlogs) que ofrecer.
Antes de elegir, comprueba que la plataforma pague en tu país: algunas dependen de Stripe, que no está disponible en todos los países.

## Anuncios de la versión web
La versión web (y la gratis de los portales de juegos) muestra un espacio de Google AdSense: a la derecha en pantallas anchas y al pie en el celular.
Se activa al poner el cliente y el bloque en `ART.ANUNCIOS_WEB = { cliente: 'ca-pub-…', bloque: '…' }`, junto a `ART.ENLACES`. Mientras estén vacíos no se muestra nada.
Las apps de pago, la «Versión completa» y la descarga directa para PC (Electron, modo `pago`) nunca muestran anuncios.
