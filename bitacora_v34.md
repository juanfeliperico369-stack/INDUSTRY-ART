# Bitácora V34 · 1.4 · Revisión total, documento de la idea y desde 1850
Fecha: 18 de octubre de 2026 · auditoría del plan, economía, seguridad, gráficas e historia

## Qué se hizo (por sistema, en palabras simples)
- **Documento de la idea (.docx y texto):** desde la ficha de la obra y al crearla. Trae sinopsis, la idea completa, la trama en tres actos, escaleta, personajes, equipo, datos técnicos, póster, curva del arco y tus notas («Desarrolla tu idea»).
- **Desde 1850:** se elige el tipo de industria (Cine, Televisión, Música, Videojuegos, Teatro, Editorial o Mixto) según el año, con su efecto. Antes de 1895 no hay cine (ni tuyo ni de los rivales): se vive del teatro, los libros y la música.
- **Economía:** los préstamos, el socio, las acciones y los aportes a filiales son capital (mueven la caja pero no la utilidad ni el impuesto). El teatro ahora paga cada función (antes una obra chica rendía 20 a 50 veces lo invertido).
- **Gráficas:** escala con números redondos y rejilla, tocar muestra el valor, flujo de caja de 24 meses, obras por medio, pirámide de edades y radar del talento contra su oficio. Paleta para daltonismo.
- **Historia:** 161 hitos (99 nuevos, desde 1850) y 8 crisis nuevas; 57 hitos mueven las tendencias.
- **Seguridad:** al importar partidas o paquetes se limpian claves peligrosas y caracteres de HTML, con topes de tamaño (bombas de compresión). Política de contenido (CSP) en el HTML.
- **Editor:** el paquete importa franquicias y obras propias; se pueden agregar materiales propios.
- **Logo con imagen propia:** se guarda solo en este dispositivo.
- **App:** las descargas (.iasave, paquete, documento) funcionan en Android y iPhone (se comparten).
- **Peso:** 1510 KB. Las pruebas de reglas salen del juego (tools/reglas.js) y el diccionario inglés va en Z85.

## Decisiones nuevas (¿cambia el Registro? no)
- Antes de 1895 la industria por defecto es Teatro. El capital recomendado antes del cine es 1 M de dólares de hoy.

## Guardado
- Versión del guardado: 34; migración desde la 33 (sin datos nuevos obligatorios).

## Prueba de humo
- Navegador: 0 errores, 129 reglas bien. Migración V33 → V34: sí. XSS en 50 pantallas: 0.
- 1850 → 1920 con el bot: 0 errores, 0 números rotos, primer estreno rival en 1897.
- Documento: ZIP y XML válidos, Word y python-docx lo abren, no toca el azar del juego.
- Ida y vuelta de módulos (desarmar): idéntica.

## Errores conocidos
- El teatro de 1950 en adelante queda cerca del empate para el bot: es prestigio más que negocio.

## Qué probar en el celular (3 cosas)
- Empieza en 1850 con Teatro y monta una obra en Obras › Teatro.
- En una obra terminada toca «Documento de la idea» y ábrelo en Word o Docs.
- Toca una gráfica (Negocio › Finanzas): debe mostrar el valor.
