# Paquete «Realidad 2026»: reglas de trabajo

Este documento fija cómo se arma el paquete de realidad. Los agentes y las personas que ayuden lo siguen igual.
El formato técnico está en `docs/paquetes.md`; la validación, con `python3 tools/validar_paquete.py archivo.json`.

## 1. Objetivo
Un paquete suelto, no oficial, que conecta a una partida las compañías, talentos, obras y franquicias reales de 2026 con su historia, para simular la industria del arte actual.
Se publica por separado y en volúmenes (cada uno con 10 compañías conocidas o 10 menos conocidas de un continente).

## 2. Qué lleva cada compañía
| Parte | Cuánto | Reglas |
|---|---|---|
| Datos | 1 | nombre, país del juego, año de fundación, tipo, familia de géneros, valor aproximado |
| Historia | 1 párrafo | 300 a 800 caracteres, escrito con palabras propias |
| Hitos | 6 a 12 | año y una frase; todos verificables |
| Franquicias | las importantes (hasta 12) | nombre real |
| Obras | **30** (nivel A: las 12 más importantes; nivel B: 18 medianas) | título, año, medio, géneros, bruto, costo, crítica y público |
| Talentos | 20 a 30 | dirección, guion, música, producción, fotografía y estrellas que de verdad marcaron la compañía |
| Material | 1 por franquicia | título, personajes, temas y sinopsis propia (la compañía figura como dueña) |

**Las obras de nivel C no se escriben.** El juego genera el relleno de cada compañía a partir de su perfil. Es mejor un catálogo corto y verdadero que uno largo con datos inventados.

## 3. Cómo se escribe cada dato
1. **Solo hechos comprobables hasta 2026.** Si no se puede comprobar, no entra. Un dato dudoso se omite, no se «arregla».
2. **Orden de fuentes:** primero Wikidata (datos abiertos, licencia CC0) para fechas, países, fundadores y filmografías; después fuentes de prensa o sitios oficiales para cifras.
3. **Textos propios.** Las historias, hitos y sinopsis se redactan desde cero y resumidos, nunca copiados ni apenas parafraseados de Wikipedia u otras páginas.
4. **Cifras:** `bruto` y `costo` en dólares de la época del estreno, como cifras redondeadas de fuentes citadas. Si no hay dato fiable, se deja en 0, no se estima.
5. **`crit` y `pub`:** de 0 a 100. Se usan solo si hay una referencia (por ejemplo, un agregador de reseñas); si no, se dejan en 0.
6. **Nombres:** nombres comerciales y de personas tal como se conocen. No se usan logotipos, imágenes ni carteles, y tampoco se describe a nadie con datos privados.
7. **Personas vivas:** solo datos públicos de su carrera. Nada de vida privada ni de opiniones.
8. **Idioma:** español neutro. Títulos como se conocen en español; si no existen, el original.

## 4. Valores permitidos
Países, familias, oficios, medios y géneros son los de `tools/paquete_listas.json`. El validador rechaza todo lo demás.
Una compañía de un país que el juego no tiene se registra en el país más cercano de su región, y su país real va en la historia.

## 5. Cómo entra el paquete en la simulación
- El **valor** y el catálogo fijan el tamaño del estudio, y sus franquicias y obras A suben su fama.
- Los talentos vivos entran con su edad, oficio, habilidad (1 a 99) y fama (0 a 1). La habilidad y la fama se calibran por carrera, no por simpatía: una estrella mundial tiene fama 0,8 a 0,95; alguien muy respetado pero poco conocido, 0,3 a 0,5.
- El juego **no** copia recaudaciones reales como destino: al empezar en 2026, la simulación sigue por su cuenta.

## 6. Control de calidad
1. Cada archivo de compañía lo escribe un agente y lo verifica **otro** agente distinto, que busca cada dato, corrige lo pequeño y elimina lo dudoso.
2. Después corre el **validador automático** (fechas, duplicados, valores permitidos, coherencias).
3. Se revisa a mano una **muestra del 10 %** de cada volumen.
4. Los errores que reporte la comunidad se corrigen en la siguiente versión del volumen.

## 7. Versiones y avisos
- Cada volumen lleva `version` del formato, `id` y `nombre` con número de volumen.
- Aviso que va en la descripción del paquete: *«Paquete no oficial hecho por aficionados. Los nombres de compañías, obras y personas se usan solo como referencia histórica. No está afiliado ni respaldado por ninguna de ellas.»*

## 8. Plan por volúmenes
| Volumen | Contenido | Estado |
|---|---|---|
| 1 | 10 compañías de Asia | piloto |
| 2 a 6 | 10 compañías conocidas de África, Europa, Norteamérica, Sudamérica y Oceanía | pendiente |
| 7 a 12 | 10 compañías menos conocidas por continente | pendiente |
