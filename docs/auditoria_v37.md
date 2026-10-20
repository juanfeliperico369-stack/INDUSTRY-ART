# Auditoría de INDUSTRY ART v37

Fecha: 20 de octubre de 2026

Archivos revisados:
- `INDUSTRY_ART_v37.html`: 2,6 MB, versión interna 5.0, guardado V40, 60 módulos, de 1700 a 2300.
- `INDUSTRY_ART_final.html`: 1,6 MB, versión 1.0. Es otro código, escrito aparte.
- `INDUSTRY_ART_kj.docx`: el documento de la idea, 4.899 líneas leídas completas.

Cómo se revisó: se leyó el código y se jugó en un navegador real (Chromium sin pantalla). Se recorrieron las 60 pantallas, se crearon obras en los 6 medios, el verificador interno pasó por 6 épocas con unos 600 clics en cada una, y se simularon partidas largas de 1700 a 2300. También se hicieron pruebas de inyección de código (XSS), de importación de archivos y de migración de partidas. Los scripts están en `pruebas/auditoria_v37/`.

Las líneas citadas son de `INDUSTRY_ART_v37.html`.

---

## Resumen: qué corregir antes de publicar

**Veredicto:** la v37 cumple casi todo el documento de la idea. En estructura supera a la Final (46 subpestañas contra 29) y ya trae la mayoría de sus mecánicas. Pero **todavía no está lista para las tiendas**: tiene 1 error crítico y 5 problemas que pueden hacer que una tienda la rechace.

| # | Gravedad | Problema | Dónde | Arreglo |
|---|---|---|---|---|
| 1 | 🔴 Crítico | **Ninguna partida anterior a la V39 abre.** Sale el error «D is not defined». Esto incluye las partidas guardadas en el celular de quien actualice la app desde la 2.1. | línea 20390 (migración 39) | Cambiar `D.oficio(k)` por `ART.datos.oficio(k)`. Comprobado: con ese cambio, las partidas de la V36 y de la V20 abren, se ven bien en las 50 pantallas y siguen 2 años sin errores. |
| 2 | 🟠 Alto (tiendas) | **Anuncio intersticial al abrir la app.** AdMob no permite intersticiales al cargar la app. El formato correcto para ese momento es *App Open Ad*. | `alAbrir` (≈22450) | Cambiar a App Open Ad, o mostrar el anuncio después de una acción del jugador. |
| 3 | 🟠 Alto (tiendas) | **Hay un anuncio cada 20 minutos que no está declarado** (al cerrar el año y al abrir la pausa). La ficha, la política de privacidad y el README dicen «un anuncio al abrir». | líneas 22316, 23946, 24971 | Poner `cadaMinutos: 0`, o actualizar la ficha y `docs/privacidad.html`. |
| 4 | 🟠 Alto (App Store) | **No hay enlace a la política de privacidad dentro de la app.** Apple lo exige (regla 5.1.1). Hoy solo existe «Privacidad de los anuncios» de AdMob. | Ajustes (≈23775) | Agregar un botón «Política de privacidad». |
| 5 | 🟠 Alto (tiendas) | **El Casino (ruleta y dados) cuenta como apuestas simuladas**, pero las guías dicen «sin apuestas». Las respuestas al cuestionario de edad (IARC y Apple) quedarían mal. | Negocio › Casino; `docs/publicar_*.md` | Declarar «apuestas simuladas» (puede subir la edad a 17+ en Apple) o quitar el Casino de la versión móvil. |
| 6 | 🟠 Alto | **Los identificadores de AdMob son los de prueba de Google** en `app/config.json`, el AndroidManifest y el Info.plist. Solo se cambian si están cargados los secretos en GitHub. | `app/` | Cargar los secretos `ADMOB_*` antes de compilar para la tienda. Si no, el anuncio no genera ingresos. |
| 7 | 🟡 Medio | **En Android, el botón «Atrás» cierra el juego**, aunque haya una ventana abierta. Falta el plugin `@capacitor/app`. La Final sí atendía el «Atrás». | `app/` | Instalar `@capacitor/app` y usar `backButton` para cerrar ventanas y fichas. |
| 8 | 🟡 Medio | **La carpeta `app/` y las recetas siguen en la 2.1 / V36.** `versionName` es "2.1", `package.json` es 2.1.0 y la v37 no está en el repositorio. | `app/`, raíz | Subir `INDUSTRY_ART_v37.html` y cambiar la versión a 5.0. |
| 9 | 🟡 Medio | **El inglés tiene «spanglish»** por traducir palabra por palabra. Ejemplo: «Your works de theater dejan 8 % more por level and alquilas la venue when no la usas». | Negocios, Editor, Festivales, Distribución, Periódico | Traducir completas las frases que faltan. |
| 10 | 🟡 Medio | **El jugador ve herramientas de desarrollo:** «Laboratorio de simulación» y «Verificador del juego» en Ajustes. | línea 23773 | Mostrarlas solo en una edición de pruebas (`ART.EDICION.bot`). |

---

## Auditoría 1: el documento de la idea (Word) frente a la v37

**Resultado:** de 170 puntos revisados, unos **150 están completos (88 %)**, **13 parciales (8 %)** y **7 faltan (4 %)**. La v37 incluso agrega mucho que el documento no pedía: épocas desde 1700, futuro hasta 2300, contenido que decide la clasificación, departamentos, sets, prensa, casino, mapa e historia.

### Completo ✅ (resumen por área)
- **Inicio:** inicio en 5 pasos (Época, Lugar, Tu estudio, Tu avatar, La partida) con dado. Nombre del jugador. Especialidades (4; el documento pedía 3). Tipo de industria (las 6). Visión (las 5, cada una con su efecto). Público objetivo (los 5). Logo, color de logo, color de fondo, color de letras y tipo de letra, cada uno con 20 opciones. Capital inicial de $500 a $1.000 M. Continuar. Cargar con 5 ranuras y 3 autoguardados.
- **Etiquetas:** las de personalidad (Pretencioso, Antiposer, Normal, Poser, Rockstar y Estrella Absoluta, con 20/40/50/70/90/100 %) se muestran como pide el documento: «Poser - Colaborativo · impulsa 70 %». Las de obras: Hit, Pop, Fresco, Olvidado, Podrida (= Rotten), Culto, Clásico e Invaluable, con la regla de los 10 años para los derivados.
- **Interfaz general:** perfil y estadísticas del estudio (multiplicadores x2 a x5; Indie, Mediano y Blockbuster; conteo por medio). Historial de proyectos con ficha completa: trama, formato, idiomas, equipo, presupuesto plan contra real, taquilla por semana y multiplicador. Franquicias (vender, ofertas, crossover, separar, canon ramificado, Continuación con Secuela, Precuela, Spin off, Historia paralela, Remake, Soft reboot y Reboot). Premios y nominaciones. Buscar personas y obras con todos los filtros del documento. Calendario de 52 semanas con estaciones, festividades y multiplicadores. Las 13 premiaciones en sus semanas (Academia en la 10 y la 11, Emmy en la 39 y la 40, Game Award en la 51 y la 52…). Festivales por continente (Cannes, Venecia, Berlinale, TIFF, Sundance, Ariel, Mar del Plata, FICCI, Gramado, Marrakech, Gouna, Lagos, Tokio, Shanghái, BIFF y Sídney) con postulación, nominados, ganadores y subasta. Competencia con estrellas de 1 a 5 y «Comprar este estudio». Avanzar una semana, un mes, con un deslizador de 1 a 52 semanas o hasta un día del calendario. Línea de producción. Los canales de marketing. Comprar guiones. Streaming con 3 planes y licencias temporales, globales y exclusivas. Canal de TV con parrilla. Cartelera en vivo. Colaboraciones (coproducción, encargos, financiar obras ajenas, distribución exclusiva). Merchandising, parques, convenciones e inversiones. Inventos con investigación anticipada. Guardar, cargar y salir.
- **Talento:** la ficha trae todo lo del documento: overall, desempeño por género, capacidades, especialidades por medio, rango, doblaje, acentos, liderazgo, estilo, paciencia, conceptos, complejidad, contenido que acepta, poder de estrella, energía (20 por cargo y +10 al mes), contrato exclusivo, academia hasta +5, obras y premios.
- **Crear obra:** Idea, Comprar guion y Adaptar material. Tipos de cada medio. Ficción o realidad. Hasta 3 géneros, 6 subgéneros y 9 temas. Problemática y argumento (de 1 a 3). Arco obligatorio en ficción. Duración con su categoría. Clasificación (G a X, más la N). Complejidad, ritmo y efectos. Presupuesto. Hasta 5 públicos de los 32. Corriente artística. Prioridad. Tono. Estilo. Formatos de la época. Época y lugar de la historia. País de rodaje. Personajes (10 protagonistas, 15 secundarios, 20 extras). IA con deslizador de uso desde 2022.

### Parcial 🟡
| Punto del documento | Qué hay en la v37 |
|---|---|
| Expansión de infraestructura (unas 38) | Hay 23. **Faltan 15** que la Final sí tiene: estudio de remasterización, estudio de calidad, salas de scoring, laboratorio de testing, salas de control de emisión, estaciones de antenas, estaciones satelitales, nodos de codificación, búnker de servidores multijugador, centros de logística, agencia de relaciones públicas y crisis, archivo de derechos de autor, planta eléctrica, red de fibra oscura y salas para *focus group* (como edificio). |
| Categorías de premios | Academia, Emmy, Tony, Music y Game Award están completos. Editorial Book Award tiene **5 de 17** categorías (faltan cómic, manga, novela, poema, filosofía, guion de película…). Festivales: **3 de 21**. Bastard: 5 de 21. Independent: 12 de 21. La Final tampoco las tiene. |
| Cargar partida: Borrar / Sobrescribir | No hay botón **Borrar**, aunque la función `borrar` existe. **Guardar sobrescribe una ranura ocupada y Cargar reemplaza la partida actual sin preguntar** (líneas 23835 y 23836). |
| 30 países, 5 por continente, con 30 cines cada uno | Hay 32 países, pero mal repartidos: Norteamérica tiene 2 y Latinoamérica 8. Hay 16 cadenas de cines por región, no 30 por país. |
| Estadísticas: número de lanzamientos y ganancias | «Lanzamientos» y «Ganancias totales» **solo cuentan cine y TV** (línea 30475). En la prueba dio 23, mientras el desglose de abajo sumaba 39. |
| Ritmo: Reflexivo…Entretenido | Lo último se llama «Frenético». |
| Editar la descripción del estudio | Existe, pero está **al final de Negocio › Construcciones**. El asistente dice que está «en Estudio» (línea 22864). |
| Editor: precios | Solo cambia el precio de las entradas. La Final tiene 4: tarifas, presupuesto, entradas y construcciones. |

### Falta ❌
- **«Nombre de la partida»:** solo se pide el nombre del estudio.
- **Botón «Borrar partida».**
- Las 15 infraestructuras de la tabla de arriba.
- 12 categorías del Editorial Book Award y 18 de los festivales.

---

## Auditoría 2: la Final frente a la v37

**Resultado:** la v37 tiene **casi todas las mecánicas de la Final**. Se compararon las 50 ayudas de la Final (que describen cada sistema), sus 29 subpestañas y sus 345 acciones de botón. Algunas partes de la v37 son copia directa: negocios de época, editor con artistas reales, cambio de marca, socio y junta, puntaje de crédito, sedes en otros países, filiales, parques y bóveda. Además, la v37 agrega Estadísticas, Buscar, Mapa, Historia, Redes, Casino, Mercado, Inversiones y Colaboraciones como pestañas propias.

### Lo que la Final tiene y la v37 no
| Función de la Final | Estado en la v37 |
|---|---|
| **Construcciones con niveles** (60, de nivel 1 a 3, con la «Pista: llega en 1927» para las bloqueadas) | ❌ Son de una sola compra o por cantidad, y faltan 15 (ver Auditoría 1) |
| **Guía de la partida:** muestra tus obras por etapa (Idea, Producción, Lista, Lanzamiento, Cartelera, Disco/TV/streaming, Catálogo) con los 3 pasos siguientes y su botón | ❌ Solo hay «Tareas de la semana» |
| «Consejo del momento» en el inicio | 🟡 Los consejos existen, pero solo en Metas |
| Botones de tiempo siempre visibles (+1 sem, +1 mes, Evento, Saltar, Auto, Guardar) | 🟡 Solo ▶ y un menú desplegable |
| Atajos de teclado: espacio, M, E, A, C, P/Esc, 1 a 5 | 🟡 Solo espacio, Esc y 1 a 5 |
| Botón «Atrás» de Android (`atrasAndroid`) | ❌ (punto 7 del resumen) |
| Editor: «Crear estudio» y 4 «Precios del mundo» | ❌ Sin crear estudio; solo precio de entradas |
| Prensa: «Paquetes de prensa» | ❌ |
| Ajustes: color de acento (8), densidad compacta, velocidad del modo automático, años del dominio público | ❌ |
| Idioma en el menú principal | 🟡 Está en Ajustes |
| Archivos .iasave entre versiones | ⚠️ Los .iasave de la Final **no abren en la v37** (son formatos distintos con la misma extensión). Sale «archivo dañado». Conviene explicar que es otra versión. |

### Lo que la v37 tiene y la Final no
- Content Security Policy en el HTML; la Final no tiene ninguna.
- Import seguro: limpia `__proto__`, neutraliza `< > " ' \`` y pone topes de tamaño y profundidad.
- Más de 120 ciudades de inicio con su capital y su prestigio.
- Más pestañas: Estadísticas, Buscar, Mapa, Historia, Redes, Casino, Mercado.
- Taquilla por semana y presupuesto plan contra real en la ficha.
- Personajes con contrato a porcentaje.

**Conclusión:** en mecánicas, la v37 iguala o supera a la Final. La sensación de que la Final está «mejor lograda» se explica sobre todo por su **guía por etapas, los botones de tiempo a la vista y las construcciones con niveles**. Las tres se pueden llevar a la v37.

---

## Auditoría 3: errores y seguridad para publicar

### Pruebas que pasaron ✅
- **Abrir el juego:** sin errores de consola en 390×844 ni en 1366×768. No hace ninguna petición a internet.
- **Verificador interno** en 1700, 1850, 1925, 1995, 2040 y 2200: unos 800 pasos, 600 clics y 156 semanas por época, con **0 errores**.
- **Recorrido de las 60 pantallas** con la partida avanzada, en español y en inglés: 0 errores y ningún NaN, undefined ni [object Object].
- **Crear obras** en los 6 medios, con todas las pestañas: todas empiezan bien.
- **XSS:** se escribió código malicioso en el nombre del estudio, el avatar, las obras, los talentos, los rivales y las franquicias, y se importó un .iasave manipulado. En las 60 pantallas, las fichas y 200 clics al azar se ejecutó **0 veces**. El importador lo neutraliza.
- **Guardar y cargar:** 5 ranuras más 3 autoguardados, con suma de verificación y compresión gzip. «Continuar» funciona.
- **PC (Electron):** `contextIsolation` y `sandbox` activados, navegación bloqueada y los enlaces se abren afuera. Está bien configurado.
- **Simulaciones largas:** ver la sección «Rendimiento» al final.

### Errores encontrados
| Gravedad | Error | Línea |
|---|---|---|
| 🔴 | Migración 39: `D is not defined`. No abre ninguna partida anterior a la V39 (resumen, punto 1). | 20390 |
| 🟡 | Estadísticas: «Lanzamientos» y «Ganancias totales» solo cuentan cine y TV. | 30475 |
| 🟡 | «Laboratorio neuronal» aparece dos veces en Construcciones, con efectos distintos (ids `neuronal` y `neuro`). | 1161, 11173 |
| 🟡 | No pide confirmación para acciones que no se deshacen: vender un teatro, vender una filial, vender una cadena, despedir personal, cancelar una serie, sobrescribir una ranura o cargar encima de la partida actual. | 27858, 27440, 27157, 24958, 29894, 23835 |
| 🟢 | La noticia «Misión cumplida» muestra el número sin formato: «(+7708159)» en vez de «+$7,71 M». | 19976 |
| 🟢 | Tasa del banco con punto decimal («24.2 %») y «Catalogo» sin tilde en el balance. | 27227 |
| 🟢 | «Próximos nominados: … en 0 semanas» debería decir «esta semana». | Mundo › Premios |
| 🟢 | «llega con la era de la ia»: la sigla IA sale en minúscula. | Construcciones |
| 🟢 | El calendario del inicio corta palabras en el celular («independ / encia»). | Estudio › Inicio |

### Tiendas y plataformas
| Plataforma | Estado | Qué falta |
|---|---|---|
| **Google Play** | 🟠 | Puntos 1, 2, 3, 5, 6, 7 y 8 del resumen. Con `minSdk 24`, `targetSdk 36` y firma por secretos está bien. Conviene revisar que `@capgo/native-purchases` *reconozca* (acknowledge) la compra; si no se reconoce en 3 días, Google la reembolsa. |
| **App Store (iPhone)** | 🟠 | Puntos 1 a 6. Hay pedido de rastreo (ATT), SKAdNetwork y botón «Restaurar compras» ✅. Conviene agregar `PrivacyInfo.xcprivacy` propio. |
| **Web** | ✅ / 🟡 | Funciona sin internet como un solo archivo. No es PWA (no tiene `manifest` ni *service worker*) y la receta publica el HTML más nuevo, que todavía no es la v37. |
| **Windows, Mac, Linux** | 🟡 | Sin certificado, Windows avisa «editor desconocido» y macOS pide abrirla con clic derecho. Para venderla hacen falta firma y notarización. |
| **Microsoft Store** | ❌ | No hay paquete MSIX/appx. Agregar `appx` en `electron-builder`, o un instalador firmado con instalación silenciosa. |
| **Steam** | ❌ | No hay integración. Se sube la carpeta sin empaquetar (`dir`). Recomendado: logros de Steam y nube apuntando a la carpeta de datos. |
| **Epic Games** | ❌ | No hay integración. Hay que verificar con Epic si exige logros iguales a los de otras tiendas. |
| **Todas** | 🟡 | El guardado crece mucho en partidas largas (ver «Rendimiento»). El inglés está incompleto (punto 9). |

---

## Auditoría 4: residuos de IA y notas innecesarias

**Bien:** el código de la v37 tiene **0 comentarios** (JS, CSS y HTML), y no hay TODO, FIXME, `console.log`, `debugger`, texto de relleno ni menciones a Claude, ChatGPT o «modelo de lenguaje». Las palabras «Claude», «Lumen» y «Faro» solo aparecen como nombres dentro del mundo del juego (Claude Monet, Imprenta Lumen, Radio Faro…), lo cual está bien.

**Residuos encontrados:**
| Tipo | Qué es | Dónde |
|---|---|---|
| Crédito a la IA | «Programado por Faro» en el menú, en Ajustes y en cada .docx que se descarga. El README dice «programado junto a Lumen». **Decisión tuya:** dejarlo, unificar el nombre o quitarlo. | 809, 21324, 22510 |
| Notas de registro de cambios que ve el jugador | «Ahora tienen su propia pestaña.» (Imperio) y «Las acciones … están en su propia pestaña.» (Banco) | 27264, 27237 |
| Textos desactualizados | «el botón **turquesa**» (en la v37 el botón no es turquesa). «elige **Idea nueva** … **Usar material**» (la ventana dice «Idea original» y «Adaptación»). «Negocio › **Estudio** › Terrenos» (la pestaña se llama Construcciones). «Identidad del estudio … en **Estudio**» (está en Negocio › Construcciones). | 857, 23602, 27118, 22864 |
| Herramientas de desarrollo a la vista | Laboratorio de simulación, Verificador del juego, y los módulos `ART.pruebas` y `ART.verificador` dentro del juego que se publica (`ART.EDICION.bot: true`) | 623, 23773 |
| Restos de versiones viejas | `MAX_PISOS = 10` que otro módulo cambia a 16. Bloques que agregan pisos a la lista de otro módulo (de ahí sale el «Laboratorio neuronal» repetido). Nombres viejos del espacio `IA`: `industryart.v16.`, `ia_desbloqueos`, `IA_CONFIG`. Una receta de Android que se activa con la rama `claude/industry-art-v16-analysis-dbf0iv`. | 1186, 11170, 20271, 28501; `.github/workflows/android.yml` |
| Notas abiertas | Solo hay 28 notas visibles en 50 pantallas, un nivel razonable. Las que sobran son las de registro de cambios de arriba. | — |

---

## Rendimiento y partidas largas

Se jugaron dos partidas con el bot: estrategia normal de 1700 a 2300 y agresiva de 1950 a 2300. Ninguna tuvo errores ni quiebras, y al final las 50 pantallas se vieron sin datos rotos.

| Año | Obras en el mundo | Guardado JSON | Guardado comprimido | Semana más lenta (PC) |
|---|---|---|---|---|
| 1900 | 140 | 1,7 MB | 0,27 MB | 34 ms |
| 2000 | 5.507 | 9,9 MB | 1,7 MB | 93 ms |
| 2100 | 6.964 | 16 MB | 2,8 MB | 133 ms |
| 2300 | 12.595 | **29 MB** | **5,1 MB** | 257 ms |

- 🟡 **El guardado crece sin parar.** En un celular modesto (4 veces más lento que una PC), una semana de 2300 puede tardar alrededor de 1 segundo, y guardar 29 MB de JSON puede trabar el juego. Recomendado: archivar las obras viejas de los rivales, o resumirlas.
- 🟢 Apareció un año sin número en el historial: `S.resumenAnios["undefined"].bruto2025` no es un número. Hay que revisar quién escribe `resumenAnios` sin el año.

---

## Orden de trabajo sugerido
1. Arreglar la migración (1 línea) y publicar la v37 en el repositorio como 5.0.
2. Anuncios: App Open Ad, quitar el anuncio de cada 20 minutos o declararlo, agregar el enlace a la privacidad y poner los identificadores reales de AdMob.
3. Declarar el Casino en los cuestionarios de edad (o quitarlo de la versión móvil).
4. Agregar `@capacitor/app` para el botón «Atrás».
5. Pedir confirmación en las acciones que no se deshacen y agregar «Borrar partida».
6. Ocultar el Laboratorio y el Verificador, y limpiar los textos desactualizados.
7. Traer de la Final: la guía por etapas, los botones de tiempo a la vista y las construcciones con niveles, incluidas las 15 que faltan.
8. Completar el inglés.
9. Preparar las compilaciones para la Microsoft Store (appx), Steam y Epic.

---

## Cambios hechos en `INDUSTRY_ART_v37.html` (en este repositorio)
1. **Corregido el error crítico de la migración** (`D.oficio` → `ART.datos.oficio`). Comprobado: las partidas de la V36 y de la V20 abren y siguen jugándose.
2. **Nuevo: giro argumental (opcional)** en la historia de los 6 medios: cine, TV, música, videojuegos, teatro y libros. Hay 32 tipos, entre ellos «El aliado era el traidor», «El narrador no es confiable», «Todo era un sueño», «Era una simulación», «El tiempo era un bucle», «El héroe es el villano», «La profecía se cumple al revés» y «Final circular». La ★ marca los que encajan con el género. Si encaja, suma 1 a la calidad. En una obra familiar, un giro que no encaja resta 1. Se ve en la predicción y en la ficha de la obra, y sale en el documento .docx. Probado en los 6 medios, más el verificador en 1925 y 2040: 0 errores.

Los demás puntos de este informe quedan pendientes, para que decidas qué corregir.
