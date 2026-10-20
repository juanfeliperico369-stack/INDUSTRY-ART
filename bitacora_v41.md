# Bitácora V41 · 1.0 · Salón de la Fama, retos con medallas y revisión a fondo
Fecha: 20 de octubre de 2026 · base: la V40 (5.0)

## Qué se hizo (por sistema, en palabras simples)
- **Versión 1.0:** el juego se llama solo INDUSTRY ART. Versión 1.0, guardado 41.
- **Salón de la Fama (sección nueva, la sexta del menú):** tiene 8 pestañas.
  - Leyendas: lo más grande de todos los tiempos y tu lugar en la historia.
  - Obras: tuyas y de los rivales, ordenadas por recaudación en dinero de hoy, crítica, público, premios o mejor negocio.
  - Figuras: los talentos en activo, retirados y fallecidos, por oficio, con su retrato.
  - Personajes: los de las sagas y los protagonistas de las obras más queridas.
  - Estudios: todos, también los que cerraron.
  - Palmarés: la mejor obra de cada año en la Academia y la más taquillera de cada década.
  - Tu estudio: tus récords y los resúmenes de cada año.
  - Vitrina: medallas, logros y mejores carreras de todas tus partidas.
- **Retos:** pasan de 4 a 12, cada uno con medalla de oro, plata o bronce según los años que tardes. El Centenario da la medalla según la dificultad.
- **Logros:** pasan de 54 a 92.
- **Resumen del año:** sale al cerrar cada año con los ingresos, la mejor obra, los premios, los logros y lo que hicieron los rivales. Se apaga en Ajustes.
- **Cómo jugar:** está en Ajustes, con una pestaña para PC (ratón, teclado y atajos) y otra para el celular (toques, menú, botón Atrás, orientación y batería).
- **Atajos:** el 6 abre el Salón y el ? muestra la lista. Con las flechas se cambia de pestaña. Las teclas sostenidas ya no avanzan muchas semanas.
- **Accesibilidad:**
  - El foco entra en las ventanas, se queda dentro y vuelve al botón que las abrió.
  - Importar se puede usar con el teclado.
  - Con «menos movimiento» en el sistema, el juego arranca con menos animación.
- **Correcciones de la auditoría:**
  - El Taller ya no avanza el tiempo con los atajos y no ocupa las ranuras de autoguardado.
  - Abrir la ficha de una obra con premios viejos ya no falla.
  - Las partidas con becas de oficios antiguos ya no se traban.
  - El avance automático se detiene si hay un error.
  - La meta «Gana al menos un premio» se puede cumplir en campañas largas.
  - Los premios a lo peor del año ya no cuentan como premios.
  - Antes de importar sobre una partida abierta, el juego pide confirmar.
  - Ahora sí se puede poner «Eventos ×0».
  - En Campaña se puede elegir «Sin reto», y Legado solo aparece en Campaña.
  - Experto y Pesadilla empiezan con menos fama.
  - Las series «llegan a la televisión».
  - El calendario y las pestañas se reinician con cada partida.
  - Al cambiar de pestaña del navegador, solo autoguarda si hubo cambios.
  - Los paquetes del Editor se exportan completos.
  - Si el navegador se queda sin espacio, el mensaje sale en español.
  - Se quitó código que nunca se usaba.
- **Inglés:** 250 frases nuevas.

## Decisiones nuevas (¿cambia el Registro? no)
- El Salón es la sexta sección. Los estudios llevan la cuenta de las obras viejas que se archivan (`hO`, `hB`), así su total de la historia sigue completo.

## Guardado
- Versión del guardado: 41, con migración desde la 40. Añade la medalla y los resúmenes anuales. También pasa las becas de vestuario y efectos a arte.
- La vitrina de todas las partidas vive en este dispositivo (`ia_vitrina`).

## Prueba de humo
- Ver el mensaje de entrega: sintaxis, verificador en 3 épocas, bot con 3 estrategias, migración desde la V40, inglés y 3 tamaños de pantalla.

## Qué probar en el celular (3 cosas)
- Abre el Salón de la Fama y toca una figura o una obra de un rival.
- Ajustes › Cómo jugar › En el celular.
- Empieza con un reto, como «Obra maestra», y mira su medalla en Estudio › Metas.
