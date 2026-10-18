# Bitácora V29 · Errores e inglés
Fecha: 18 de octubre de 2026 · Plan Maestro v2 · sin funciones nuevas

## Qué se hizo (por sistema, en palabras simples)
- Inglés completo: selector «Idioma · Language» en Ajustes. Un diccionario de 5.721 frases sacadas de todos los textos del juego traduce todo lo que aparece en pantalla (vistas, fichas, ventanas, avisos, menús, botones, fechas, títulos inventados y textos dibujados nuevos). Viaja comprimido (133 KB) para que el archivo no pase de 1,5 MB. Los fuentes del diccionario quedan en tools/ingles/ y se arma con tools/ingles.py.
- Errores corregidos, por gravedad:
  1. Los hitos de la historia salían un mes corridos y en diciembre decían «undefined» (meses 1–12 contra 0–11).
  2. Series y estrenos directos no tenían año en el catálogo («undefined»).
  3. Música, juegos, teatro y libros rendían demasiado (V25): menos ganancia por proyecto y entradas de teatro más baratas.
  4. Las series de tu propia plataforma figuraban sin ingresos: ahora se les atribuye su parte de la plataforma en las estadísticas.
  5. Las reseñas se repetían en partidas largas: 24 remates nuevos.
  6. El guardado de 150 años estaba cerca de 2 MB: los proyectos viejos de los medios guardan menos historia.
  7. Los títulos de sección largos (en inglés) se partían en dos líneas.
- Pruebas de reglas nuevas contra los Datos: Pascua, Año Nuevo chino, Acción de Gracias, día de la semana, población de 2025, inflación de 1950 y de 2022, dominio público y Erótico. Total: 117–118 reglas, todas bien.

## Decisiones nuevas (¿cambia el Registro? no)
- Los nombres de personas, estudios y los títulos en los pósters se quedan como están (como un póster extranjero).

## Guardado
- Versión del guardado: 29; migración desde la 28 (sin datos nuevos).

## Prueba de humo
- Navegador en español e inglés (y de vuelta a español): 0 errores. Bot 1900–1940 en Campaña: 0 errores. Migración V28 → V29: sí.

## Errores conocidos (para la V24 a la V26)
- En inglés, algunas frases armadas con datos quedan con un orden algo forzado; traducir una pantalla tarda ~0,1 s en PC.
- No se probó en el Infinix Note 40 (no hay teléfono en el entorno).

## Qué probar en el celular (3 cosas)
- Ajustes › Idioma › English: recorre las cinco secciones.
- Mundo › Historia: las fechas de los hitos.
- Vuelve a Español y sigue jugando.

## Para la próxima versión
- V30: 1.0.
