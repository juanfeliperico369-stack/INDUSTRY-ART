# Bitácora V28 · Interfaz y rendimiento
Fecha: 18 de octubre de 2026 · Plan Maestro v2 · sin funciones nuevas

## Qué se hizo (por sistema, en palabras simples)
- Revisión automática de las 38 pantallas y las fichas en 390×844, 844×390 y 1366×768, y 118 capturas (pruebas/capturas): ningún control mide menos de 44 px, ningún texto menos de 14 px y no hay desplazamiento lateral.
- Las filas de botones y chips saltan de línea en el celular (antes se salían en Música, Videojuegos, Rivales y Streaming).
- Pestañas: en el celular se deslizan y la activa siempre queda a la vista; en PC y pantallas anchas se acomodan en varias filas.
- Enlaces y botones chicos (dilemas, prueba de público, calendario) ahora miden 44 px.
- Accesibilidad: nueva opción «Colores para daltonismo» en Ajustes (azul y naranja en vez de verde y rojo), además del tamaño de texto, el alto contraste y «menos movimiento» que ya existían.

## Rendimiento (PC de pruebas, partida de 150 años desde 1900)
- Abrir el juego: 0,16 s · semana promedio: 3,6 ms (la peor, un cierre de año: 38 ms) · año: 0,27 s · guardado tras 150 años: 1,69 MB comprimido · memoria: 96 MB · archivo: 1,35 MB. Todas las metas se cumplen salvo el pico de una semana de cierre de año, que es raro y no se nota.

## Decisiones nuevas (¿cambia el Registro? no)
- Ninguna.

## Guardado
- Versión del guardado: 28; migración desde la 27 (sin datos nuevos).

## Prueba de humo
- Navegador: partida nueva, bot de 12 años, metas, editor, música, guardar/cargar y .iasave: sí (0 errores). Migración V27 → V28: sí.

## Errores conocidos (para la V24 a la V26)
- No se pudo medir en el Infinix Note 40 (no hay teléfono en el entorno de pruebas); hay que probar la apertura allí.
- El guardado de 150 años queda cerca del límite de 2 MB.

## Qué probar en el celular (3 cosas)
- Mundo: desliza las pestañas y comprueba que la activa se vea.
- Ajustes › Colores para daltonismo.
- Gira el teléfono: el menú pasa al costado y la vista a dos columnas.

## Para la próxima versión
- V29: errores e inglés.
