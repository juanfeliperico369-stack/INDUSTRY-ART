# Auditoría V34 · plan contra el código

## Faltaba y quedó hecho
| Punto del plan | Antes | V34 |
|---|---|---|
| Empezar entre 1850 y 1894 | mínimo 1895 | desde 1850, con teatro, libros y (desde 1877) música |
| Tipo de industria al empezar | solo Cine; el resto «(llega en la V…)» | 7 tipos según el año, cada uno con efecto |
| Radar del talento | no existía | radar de capacidades contra el promedio del oficio |
| Gráficas de obras por medio y flujo de caja | no existían | anillo por medio y flujo de 24 meses |
| Pirámide de edades | barras simples | pirámide con escala |
| Tocar un piso del estudio | no hacía nada | abre su departamento o el terreno |
| Logo con imagen propia (solo en el dispositivo) | no existía | hecho |
| Editor: importar franquicias y obras propias | solo exportaba | importa y permite agregar materiales |

## Errores arreglados
- Préstamos, socio, acciones y aportes contaban como ingreso o gasto: subían o bajaban el impuesto.
- El año de diciembre en el libro mensual salía corrido.
- Las descargas no funcionaban dentro de la app (Android/iPhone).
- El teatro no pagaba sus funciones (rendía 20 a 50 veces lo invertido).
- Textos viejos que prometían versiones futuras («Próximamente», «llega en la V…»).

## Seguridad
- Importar partidas y paquetes: límite de tamaño, de nodos y de profundidad; descompresión con tope; se borran `__proto__`, `constructor` y `prototype`; los caracteres de HTML se cambian por otros que se ven igual.
- Paquete del editor: oficio, sexo, géneros y listas validados.
- CSP en el HTML: sin scripts de afuera, sin formularios, sin marcos.
- Logo propio: solo PNG, JPG, WEBP o GIF de hasta 8 MB, reducido a 128 × 128 en un lienzo; al leerlo solo se acepta `data:image/png` o `jpeg`.
- XSS: 50 pantallas con textos maliciosos en todo lo editable: 0 ejecuciones.

## Verificado bien
- La caja del jugador solo cambia por el libro: 0 cambios fuera de él en 50 años (1850) y 40 años (1950).
- Impuesto = 25 % de la utilidad operativa: 50 de 50 y 40 de 40 años exactos.
- IPC, ida y vuelta de dólares, factor semanal ×0,80–×1,40, sin NaN ni infinitos.
- Fórmulas del plan: bien. El margen de la audiencia es ±3 (el plan dice ±4): se deja así.

## Parcial
- Rivales: hacen películas y series; no tienen bandas ni videojuegos propios a la vista.
