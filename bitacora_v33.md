# Bitácora V33 · 1.3 · Celulares lentos
Fecha: 18 de octubre de 2026 · rendimiento · sin funciones nuevas ni cambios de balance

## Qué se hizo (por sistema, en palabras simples)
Todo se midió con el procesador 4 veces más lento (como un celular modesto tipo Infinix Note 40), en pantalla de teléfono y con una partida de 40 años.

| Qué | V32 | V33 |
|---|---|---|
| Procesador con la app quieta en la portada | 65 % | 28 % |
| … tras 30 s sin tocar la pantalla | 58 % | 8 % |
| … con «Menos animación» | 58 % | 3,5 % |
| Abrir el catálogo | 7,7 s | 0,07 s |
| Abrir Talento | 0,3–0,9 s | 0,08 s |
| Cambiar a inglés | 4,9 s | 0,1 s |
| Peor semana al tocar ▶ | 1,2 s | 0,2 s |

- Animación del estudio: 20 cuadros por segundo en vez de 30, a una resolución que se ve igual (×1,5) y se apaga cuando el dibujo no está en pantalla. Tras 30 s sin tocar baja a 4 cuadros y vuelve al tocar. Con «Menos animación» solo se redibuja cuando cambia algo.
- Pósters y retratos: se dibujan cuando están por verse, no todos de golpe, y a ×2 como mucho.
- Catálogo: muestra 30 obras y un botón «Ver más» (antes cargaba 120 de una vez).
- Autoguardado: espera a que el teléfono esté libre (primero se ve la semana) y nunca se encima con otro.

## Decisiones nuevas (¿cambia el Registro? no)
- Ninguna. El juego, el balance y la compra quedan iguales.

## Guardado
- Versión del guardado: 33; migración desde la 32 (sin datos nuevos).

## Prueba de humo
- Navegador (recorrido completo y bot): 0 errores, 117 reglas bien. Migración V32 → V33: sí. Bot de campaña 1950–1990: 0 errores.
- Compra simulada (8 casos): todo bien. PC 1.3: abre, juega, guarda y carga.
- Catálogo: se dibujan solo los pósters visibles; al bajar y tocar «Ver más» aparecen los demás.
- En la nube, la V32 compiló bien en Android y en iPhone.

## Errores conocidos
- No se probó en el Infinix real; la medición simula el procesador, no la pantalla ni la memoria del teléfono.

## Qué probar en el celular (3 cosas)
- Deja el juego quieto 5 minutos en el Estudio: el teléfono no debe calentarse.
- Obras › Catálogo con una partida larga: debe abrir rápido; toca «Ver más».
- Juega un año con ▶ y mira que no haya tirones al cambiar de mes.

## Para la próxima versión
- Lo que salga de la prueba cerrada.
