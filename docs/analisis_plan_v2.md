# Análisis del Plan Maestro v2 frente a lo construido (V16 a V20)

Fecha: 11 de octubre de 2026. Fuentes: `INDUSTRY_ART_Plan_Maestro_v2.docx`, `INDUSTRY_ART_Especificacion_v2.md` y
`INDUSTRY_ART_Datos_v2.pdf` (texto en `datos_v2.txt`), todos en esta carpeta. El plan v1 queda como historia.

## 1. Qué cambia con la v2

- **Hoja de ruta**: 12 versiones en 4 fases. Construir todo (V16 a V23), prueba libre de OneZero, pulir (V24 balance,
  V25 interfaz y rendimiento, V26 errores e inglés) y publicar (V27).
- **Modo rápido** en la fase de construcción: funciones completas y conectadas, sin pulir; sin balance fino, sin
  capturas ni bot largo (llegan en V24 y V25); prueba de humo al cierre (abre sin errores, partida nueva, bot de
  10 años, guardar/cargar y .iasave); bitácora de 40 líneas o menos; 5 líneas en el chat.
- **Calendario completo**: los 109.938 días de 1850 a 2150 con su día de la semana; vistas de día, semana, mes, año y
  agenda; festividades con su regla real (Pascua calculada, Acción de Gracias, tabla lunar de 1850 a 2150 para el Año
  Nuevo chino, Eid al-Fitr y Diwali); circuito anual fijo de premiaciones, festivales y convenciones; nada al azar.
  La simulación sigue por semanas (lunes a domingo) y cada evento se procesa en la semana de su día.
- **Referencia R7**: 68 funciones nuevas (inicio con dado y tarjetas de región y era, enfoque del estudio, personal de
  oficina, niveles de talento, convenciones y rueda de prensa, revista, panel, banco, junta…) y una lista de lo que
  se evita (dinero infinito, recompensas desmedidas, nombres reales disfrazados, casino, tablas que se deslizan).
- **Registro**: 65 decisiones (15 nuevas). Pruebas largas: después de la V23 (antes, después de la V20).

## 2. Dónde está el juego frente a la v2

| v2 | Contenido | Estado en el juego actual (V20) |
|---|---|---|
| V16 Base y calendario | núcleo, economía, población, IPC, 5 secciones, guardado, arte V15 | Hecho, salvo lo de abajo |
| | Calendario por días reales, vistas, tocar un día, filtros, recordatorios, avanzar hasta un día | **Falta** (hoy: 52 semanas y calendario de 12 meses) |
| | Inicio R7: dado, tarjetas de región y era, enfoque, dado de nombres, logo con sufijo, prestigio inicial, menú de pausa | **Falta** |
| | Fans en la barra, sede por niveles, menú rápido de departamentos, ADN del mercado por era | **Falta** |
| V17 Crear y producir | taxonomía, creación rápida/detallada, clasificación, personajes, dominio público, IA, producción completa | Hecho (V17 y V19) |
| | Premisas y tropos (56), informe de lectura pagado y regateo de guiones, enfoque, 11 géneros de TV, Western espacial | **Falta** |
| | Estilos de producción del plan (estándar, +16, adultos, glamour, caricatura, anime) | Distintos: hay 11 estilos propios |
| V18 Talento y equipo | 1.000+ talentos, negociación, exclusivos, academia, química, ciclo de vida | Hecho |
| | Niveles (Promesa, Veterano, Estrella consolidada, Leyenda viva), gremios, lista corta, crear talento | **Falta** |
| | Personal de oficina por rol, reclutamiento, bandeja de candidatos; modo carrera, vida ligera y heredero | **Falta** |
| V19 Estreno, crítica y premios | Lanzamiento, regiones, cadenas, ventanas, certificaciones, reestrenos | Hecho (V20) |
| | Crítica con críticos, etiquetas e insignias, revista, panel, filmografía, cronología | **Falta** |
| | Premiaciones completas, 18 festivales, jurados, subasta, ceremonias, vitrina; convenciones, prensa, redes | **Falta** (hay premios básicos) |
| V20 a V23 | Franquicias, TV y streaming · Mundo vivo y negocio · Otros medios · Metas, modos y editor | Sin empezar |

## 3. Choques con lo ya hecho (se corrigen en la próxima versión, sin preguntar: son reglas del Registro)

1. **Festividades de la V20**: no coinciden con la lista de Datos v2 (faltan Pascua, Día del trabajo, Día de la
   memoria, Orgullo, Independencia, Pop days, Eid al-Fitr) y dos usan nombres de festivales reales («Festival de
   Cannes», «Festival de Venecia») como festividad. Pasan a la lista de Datos v2; Cannes y Venecia quedan como
   festivales inventados (Riviera y Laguna) en el circuito.
2. **Factor semanal**: la temporada está entre ×0,80 y ×1,40, pero el bono de género y las festividades se
   multiplican encima y pueden pasar de ×1,40. Todo junto debe quedar dentro.
3. **Tablas con desplazamiento lateral** en el celular (clase `desliza`): la v2 pide columnas que se ocultan o pasan a
   la ficha.
4. **Premios Quimera**: semana 11 en Datos v2 (hoy semana 10), con la gala el domingo.
5. **Bitácoras**: las de V16 a V20 son largas; desde ahora, 40 líneas o menos con la plantilla de la parte 6.

## 4. Numeración propuesta

El guardado ya va en la versión 20, así que no conviene volver a usar números. Propuesta: seguir con V21 en adelante
y repartir lo que falta de la fase de construcción en el orden de la v2:

| Nueva | Contenido (sección de la v2) |
|---|---|
| V21 | Calendario completo y lo que falta de V16 a V18 (inicio R7, fans, sede por niveles, premisas y tropos, guiones con informe y regateo, niveles de talento, personal de oficina, carrera y heredero) |
| V22 | Lo que falta de V19: crítica, etiquetas, revista y panel; premiaciones, festivales, convenciones y prensa |
| V23 | V20 de la v2: franquicias, TV y streaming |
| V24 | V21 de la v2: mundo vivo y negocio |
| V25 | V22 de la v2: música, juegos, teatro y libros |
| V26 | V23 de la v2: metas, modos y editor |
| — | Prueba libre de OneZero |
| V27 a V30 | Balance, interfaz y rendimiento, errores e inglés, 1.0 |

## 5. Forma de trabajo desde ahora

- Modo rápido: construir todo lo de la versión, prueba de humo, bitácora corta y 5 líneas.
- El bot largo, las capturas y el balance fino se dejan para las versiones de pulido.
