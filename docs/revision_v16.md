# Revisión de INDUSTRY ART V16 (código en `src/modulos`)

Revisión hecha sin haber escrito el código. Cada hallazgo se reprodujo con un script (Node con los módulos de
simulación, o Chromium con Playwright sobre una copia armada en `scratchpad/revision/ia.html`). Los scripts están
en la misma carpeta (`verificar_todo.sh` los corre todos).

**Ojo:** los archivos de `src/` cambiaron mientras revisaba (17:11–17:27). Todos los hallazgos se volvieron a
verificar contra la versión de las ~17:25, y los números de línea corresponden a esa versión.

Severidad: **Alta** = rompe el juego o el modelo de forma visible · **Media** = dinero, determinismo o pantallas
mal en casos normales · **Baja** = casos raros, cosmética o robustez.

### Estado a las 17:35 (se volvió a armar y a correr `verificar_todo.sh` sobre el árbol actual)

Mientras terminaba la revisión, el árbol de trabajo recibió arreglos para casi todo lo de abajo. Comprobado con
los mismos scripts:

| Hallazgo | Estado 17:35 | Cómo se comprobó |
|---|---|---|
| A1 premios una semana antes / TypeError en automático | **Arreglado** | `avanzar` usa `rs.ceremonia`; `pw_auto2.js` llega a la S13 sin error |
| A2 `estrenos52` | **Arreglado** | `estrenos.js`: `estrenos52 = fe52.length` (85 / 63 / 65) |
| A3 Erótico antes de 1968 | **Arreglado** | `erotico.js`: 0 obras; el chip queda deshabilitado |
| M1 doble «Confirmar» | **Arreglado** | `pw_doble.js`: se paga 346 una sola vez |
| M2 la interfaz gasta el azar | **Arreglado en la interfaz** (`conAzarUI`) | `pw_rng.js`: `S.rng` intacto. `O.borrador` sigue gastando `N.azar` si se llama directo, como hace `rng_ui.js` |
| M3 sesgo de las métricas del bot | **Arreglado** | registro con `obraTerminada` en `17_pruebas.js` |
| M4 precio de campaña y ahorro | **Arreglado** | `N.anio(pg.t)` y `IA.negocio.ahorro` en `estimar` |
| M5 `inset` | **Arreglado** | `top/right/bottom/left` en `estilos.css` |
| M6 LZW en el hilo principal | **Mitigado** | sin gzip el autoguardado es anual; sigue bloqueando unos 6 s con una partida de 2150 en cada autoguardado y al salir u ocultar |
| M7 automático con ficha o en segundo plano | **Arreglado** | `pw_auto_ficha.js`: t no avanza; `detenerAuto` al ocultar |
| B1–B10 | **Arreglados** | `pw_ui.js`, `pw_xss.js`, `pw_aviso.js`, `pw_menores.js`, `hab.js` y lectura de código |

No hay regresiones en lo que ya estaba bien: determinismo, guardar y cargar, LZW, ES2017 y el recorrido de la
interfaz siguen pasando. Lo único que queda abierto es M6: pasar la compresión LZW a un Worker o hacerla por tramos.

---

## Alta

### A1. El evento «premios» llega una semana antes: muestra la ceremonia del año anterior y, en modo automático, revienta el primer año
- `12_juego.js:171` `if (N.semana() === D.premios.semana) return 'premios';`
- `15_pantallas.js:922` (modo evento) y `15_pantallas.js:950` (modo automático) → `mostrarPremios()`; `15_pantallas.js:930` `const res = N.S.premios[N.S.premios.length - 1];` sin comprobar.
- La ceremonia corre dentro de `avanzarSemana` **mientras** se procesa la semana 10 (antes de `S.t++`). `hayEvento()` mira la semana *actual* después de avanzar, así que se detiene al *empezar* la semana 10, cuando la ceremonia todavía no ocurrió.
- Reproducción (`premios_evento.js`, semilla `pe`, 1950): `avanzar('evento')` se detiene en «S10 1952» con 1 ceremonia guardada (películas de 1950) cuando la de este año (películas de 1951) aún no se hizo. La pantalla muestra la ceremonia vieja como si fuera nueva; la real se procesa en silencio al avanzar otra vez.
- En modo automático (`pw_auto.js`): partida nueva en 1900, ritmo automático → al llegar a la semana 10 sale «Error: Uncaught TypeError: Cannot read properties of undefined (reading 'categorias')» porque `S.premios` está vacío (el primer año, y a veces el segundo, no hay ceremonia).
- Arreglo mínimo: que el evento sea «hubo ceremonia esta semana». Por ejemplo, en `juego.avanzar` guardar el `r = avanzarSemana()` y cortar con `motivo = 'premios'` si `r && r.ceremonia`; en el bucle automático, igual (que `avanzarCon` devuelva la ceremonia). Quitar la regla de `hayEvento` o cambiarla a `N.semana() === D.premios.semana + 1`. Y en `mostrarPremios`: `if (!res) return;`.

### A2. «Otras productoras» nunca descuentan los estrenos simulados: `S.mercado.estrenos52` no existe
- `04_economia.js:236` `const estrenosSim = Math.max(0, S.mercado.estrenos52 || 0);`
- `08_lanzamiento.js:45-48` mantiene `S.mercado.fe52` (los estrenos de las últimas 52 semanas), pero **nadie escribe `estrenos52`** (grep: una sola aparición, la lectura). Así `otras = da.peliculas` siempre, y las obras del jugador y de los rivales compiten **además** de todas las películas del año, cuando el modelo dice que son parte de ellas (comentario de `PELICULAS_ANIO`).
- Tamaño (`estrenos.js`): 53–67 estrenos simulados al año frente a 275–775 películas → la cartelera tiene un 10–20 % de peso de más.
- Efecto medido (`estrenos_fix.js`, 60 años, bot normal): con `estrenos52 = fe52.length` los rescates de rivales bajan de 238 a 141 (desde 1900) y de 222 a 125 (desde 2000); el multiplicador mediano sube de ×2,06 a ×2,17 y de ×1,97 a ×2,17; «obras que pierden» baja de 34,7 % a 30,4 % y de 38,3 % a 32,5 %.
- Arreglo: en `lanzamiento.semana`, después del filtro: `N.S.mercado.estrenos52 = N.S.mercado.fe52.length;` (o leer `fe52.length` directamente en `semanaCartelera`). Como el balance se calibró con el fallo, hay que volver a pasar el bot.

### A3. Género «Erótico» antes de 1968: los rivales estrenan obras sin clasificación y la pantalla de crear obra revienta
- `06_obras.js:58` `if (gen.indexOf('Erótico') >= 0) return disp.indexOf('18') >= 0 ? '18' : disp[0];` → antes de 1968 `disp` está vacío y devuelve `undefined`.
- `06_obras.js:62` `validarGeneros(gen)` no mira el año; `09_rivales.js:40` `const gen = [N.elegir(fam.generos)];` puede elegir «Erótico» (familia RD de Ágora Colectivo y la tendencia).
- Simulación (`erotico.js`, 1900–1967): **99 obras rivales con «Erótico» y `clas` indefinida** (JSON la borra al guardar), contra la regla «antes de 1968 la censura no deja estrenar…».
- Interfaz (`pw_erotico.js`): partida en 1900, «Crear obra», con un género que no sea de familia FJ el chip «Erótico» está habilitado (`15_pantallas.js:406`); tocarlo y «Siguiente» → `15_pantallas.js:421-423` `const cl = D.clasificacion(b.clas); … esc(cl.desc)` → «Error: Cannot read properties of undefined (reading 'desc')». La ficha queda en el paso 0 aunque `cr.paso` ya es 1 (el asistente se salta un paso).
- Arreglo: `validarGeneros(gen, anio)` que rechace «Erótico» si `anio < 1968` (y usarla en el chip y en `rivales.elegirGeneros`, filtrando «Erótico» de `fam.generos` antes de 1968); `clasificacionRecomendada` nunca debe devolver `undefined`; en el paso 1, `D.clasificacion(b.clas) || D.clasificacion('PG-13')`.

---

## Media

### M1. Tocar dos veces «Confirmar» cobra dos campañas de marketing
- `12_juego.js:122-127` `programarEstreno` solo mira `o.et !== 'lista'`; no mira `o.prog`. `08_lanzamiento.js:12` sobrescribe `o.cm`.
- La ficha se cierra con una transición de 0,25 s (`#ficha { transition: transform .25s }`), así que el segundo toque cae sobre el mismo botón.
- Reproducción (`pw_doble.js`, doble clic en `[data-a="pgConfirmar"]`): caja 5681 → 4989, se pagaron 692 (2 × 346), pero `o.cm = 346`. El costo de la obra, su resultado neto y el informe quedan mal (la mitad del marketing desaparece de las cuentas de la obra, aunque sí salió de la caja).
- Arreglo: en `programarEstreno`, `if (o.prog) return 'La obra ya tiene fecha de estreno.';`.

### M2. La interfaz gasta el azar de la simulación: abrir «Crear obra» cambia el mundo
- `15_pantallas.js:352-354` `nuevoBorrador` → `O.borrador` (`06_obras.js:79-80`: `tituloNuevo` y `N.elegir(D.temas)`) y `O.equipoRecomendado` (`06_obras.js:111`: `N.probabilidad(0.5)`); también «Otro título» (`15_pantallas.js:503`) y «Recomendado» del equipo (`15_pantallas.js:494`).
- Reproducción (`rng_ui.js`): misma semilla y mismas decisiones; en una de las dos partidas el jugador abre «Crear obra» y la cierra sin crear nada → `S.rng` pasa de `425500563,…` a `1910613657,…` y las obras de los rivales salen distintas (`mundo igual? false`). Rompe la regla del LEEME («la misma semilla con las mismas decisiones da la misma partida»): mirar una pantalla no es una decisión.
- Arreglo: que `borrador`, `tituloNuevo` y `equipoRecomendado` reciban una función de azar opcional; la interfaz les pasa un generador propio (por ejemplo sembrado con `N.hash(S.semilla + '|ui|' + contador)`) y la simulación sigue con `N.azar`. Mínimo: guardar y restaurar `N.S.rng` alrededor de esas llamadas de la interfaz.

### M3. Las metas del bot se miden sobre una muestra sesgada por la compactación
- `17_pruebas.js:146` `const terminadas = S.obras.filter(…)`; `06_obras.js:200-213` borra las obras rivales de hace más de 40 años, salvo las premiadas y las 3 más taquilleras de cada año.
- Lo que queda de los años viejos son casi solo éxitos, así que «obras que pierden», «multiplicador mediano» y «sobre ×5» salen optimistas.
- Reproducción (`sesgo2.js`, bot normal 1900–2010; la compactación no cambia la simulación, misma caja final): semilla `sesgo`: pierden 32,6 % frente a 44,6 % real; multiplicador ×2,12 frente a ×1,83; sobre ×5 2,8 % frente a 1,3 %. Semilla `x` (versión anterior): 35 % frente a 42,9 %. El `pruebas/informe_bot_v16.md` (pierden 33,3 %, multiplicador ×2,09) tiene el mismo sesgo.
- Arreglo: que `jugar` junte las métricas al vuelo (oyente de `obraTerminada` que guarde el multiplicador y el neto de cada obra) o que `compactar` guarde en `resumenAnios` también costo y parte.

### M4. El precio de la campaña que se muestra no es el que se cobra (y la producción estimada ignora el ahorro)
- `15_pantallas.js:538` y `:544` muestran `E.marketingTipico(N.anio()) * mult`; `12_juego.js:124` y `08_lanzamiento.js:12` cobran `E.marketingTipico(N.anio(t))`, el del **año del estreno**.
- La ficha ofrece hasta 12 semanas adelante, así que desde la semana 41 se puede estrenar el año siguiente. El marketing típico cambia ×1,71 de 1900 a 1901, ×1,92 de 1905 a 1906, ×1,32 de 1919 a 1920, ×0,30 de 2019 a 2020 y ×1,72 de 2020 a 2021 (`mkt.js`). El botón dice «Confirmar · $X», se cobra hasta casi el doble, o puede salir «No alcanza la caja» con caja mayor que $X.
- Además, `06_obras.js:147` `estimar` usa `o.pp` sin el ahorro de los terrenos, que sí aplica `07_produccion.js:21`: el total estimado sale hasta un 20 % más caro que el real.
- Arreglo: en `fichaProgramar`, `E.marketingTipico(N.anio(pg.t))` (en el botón y en cada nivel) y `E.marketingTipico(N.anio(tt))` en la lista; en `pieTotales`/`estimar`, aplicar `NG.ahorro(0)`.

### M5. `inset: 0` no existe en WebView anteriores a Chrome 87: se rompe todo el marco
- `estilos.css:53` (`#app`), `:149` (`#velo`), `:151` (`#modal`).
- Simulado en Chromium quitando `inset` (`pw_inset.js`, pantalla 400×800): `#app` pasa de 800 a 1534 px de alto y el menú inferior queda en y=1470, fuera de la pantalla; `#velo` mide 0×0 (tocar fuera ya no cierra la ficha); el fondo del modal cubre solo 384 px. El objetivo es Android con Chrome ~60.
- Arreglo: `top: 0; right: 0; bottom: 0; left: 0;` en los tres. Con menos impacto: `min()` (Chrome 79), `gap` en flex (84), `aspect-ratio` (88) y `env()` (69) se ignoran en esos motores; quedan feos pero usables.

### M6. Autoguardado con el compresor propio (LZW): segundos de pantalla congelada al final de la partida
- `13_guardado.js:120` usa LZW cuando no hay `CompressionStream` (Chrome < 80, Safari < 16.4), en el hilo principal. El autoguardado por defecto es mensual (`15_pantallas.js:909`), y en modo automático eso es cada ~1,7 s de juego.
- Medido (`lzw_grande.js`, bot normal 1900–2150): JSON de **8,7 millones de caracteres** (8049 obras); LZW tarda **6,3 s en Node de PC** y usa +155 MB de memoria. En un celular viejo serán decenas de segundos o falta de memoria. Con 40 años ya son 1,8 M caracteres y 0,65–0,96 s.
- Arreglo: sin gzip, autoguardar solo cada año o al ocultar; comprimir en un Worker (se puede crear desde un Blob, sin internet) o por tramos con `setTimeout`. A largo plazo, achicar el estado (por ejemplo `S.obras` con 8000 entradas).

### M7. El modo automático sigue avanzando con una ficha abierta y con la app en segundo plano
- `15_pantallas.js:943-944` `autoTimer = setInterval(function () { if (U.modalAbierto()) return; …` solo se detiene con un modal abierto; `99_arranque.js:10-12` guarda al ocultar la app pero no detiene el temporizador.
- Reproducción (`pw_auto_ficha.js`): con «Crear obra» abierta el tiempo pasa de la semana 0 a la 4 en 2 s y los totales de la ficha no se actualizan (`refrescarFicha('crear')` no hace nada). En segundo plano el juego sigue avanzando (más lento): el autoguardado hecho al ocultar queda viejo, y si el sistema cierra la WebView se pierde lo que avanzó después.
- Arreglo: `if (U.modalAbierto() || U.fichaAbierta() || document.hidden) return;` en el temporizador, y `detenerAuto()` en `visibilitychange` cuando la app se oculta.

---

## Baja

### B1. La flecha del menú de ritmo no lo cierra (lo cierra y lo vuelve a abrir)
- `15_pantallas.js:959-975`: el oyente de captura `cerrar` (`:973`) corre antes que la acción. Al tocar la flecha borra el menú y quita el oyente, y luego `menuRitmo` no encuentra `.menu-ritmo` y crea otro.
- `pw_ui.js`: tras el segundo toque sigue habiendo 1 menú. Si se elige un ritmo, el oyente de captura queda puesto hasta el siguiente clic.
- Arreglo: guardar el oyente en una variable del módulo y quitarlo en todos los caminos de cierre (acción `ritmo`, segundo toque); en `cerrar`, ignorar `ev.target.closest('[data-a="menuRitmo"]')`.

### B2. Enter o Espacio sobre un botón con foco avanzan el tiempo en lugar de pulsar el botón
- `14_interfaz.js:282` `if (ev.key === ' ' || ev.key === 'Enter') { … ev.preventDefault(); acciones.avanzar(); }` solo excluye INPUT, SELECT y TEXTAREA.
- `pw_ui.js`: foco en «Crear obra» y Enter → `t` pasa de 0 a 1 y la ficha no se abre. Afecta el uso con teclado y la accesibilidad. Además, `acciones.avanzar()` corre fuera del `try/catch` del clic.
- Arreglo: no capturar la tecla si `ev.target.closest('button, a, [data-a], label')`.

### B3. Un .iasave manipulado puede inyectar HTML (campos que no son texto no se escapan)
- `15_pantallas.js:16` `kpi()` no escapa `valor`; `:177` y `:785` `kpi(t('est_clase'), est.clase || 'C')`; `:284` y `:298` `o.anio`; `:307` `o.crit` y `o.pub`. La suma de verificación no protege: quien edita el archivo la recalcula.
- `pw_xss.js`: exportar una partida con `clase = '<img src=x onerror="window.__xss=1">'`, importarla y `window.__xss === 1`.
- Arreglo: escapar `valor` en `kpi` (todos los que lo llaman pasan texto) y convertir a número los campos numéricos en `migrar`/`activar`.

### B4. Los avisos muestran entidades HTML en títulos con «&» o apóstrofo
- `15_pantallas.js:920` `U.aviso(textoNoticia(n).replace(/<[^>]+>/g, ''))`: `textoNoticia` escapa y `aviso` usa `textContent`.
- `pw_aviso.js`: obra «Tom & Jerry's» → aviso ««Tom &amp; Jerry&#39;s» deja la cartelera con $2363 de taquilla.».
- Arreglo: para el aviso, armar el texto sin escapar: `n.texto.split('{$}').join(dinero(...))`.

### B5. Partida en quiebra: «Avanzar» no hace nada ni dice nada, y «Salir» la autoguarda aunque el autoguardado esté apagado
- `15_pantallas.js:898` `if (!N.S || N.S.quiebra || …) return null;`; el modal de quiebra solo sale en `despuesDeAvanzar` (`:921`). `15_pantallas.js:822` `salir` llama a `autoguardar()` sin mirar el ajuste.
- `pw_xss.js` (segunda parte): tras la quiebra, Escape (o «Cargar» → cerrar) y «Avanzar» → `t` no cambia, sin modal ni aviso. Con «Salir» la partida quebrada se guarda en un autoguardado y «Continuar» la vuelve a abrir.
- Arreglo: en la acción `avanzar`, si `N.S.quiebra`, volver a mostrar el modal de quiebra; en `salir`, respetar `autoguardado === 'no'` y no guardar si `S.quiebra`.

### B6. El aviso «Tu caja está en rojo» no llega a ninguna parte
- `11_negocio.js:161` emite `'aviso'`, pero `12_juego.js:76-90` solo escucha `noticia`, `obraLista`, `estreno`, `obraTerminada` y `premios`. El jugador no recibe la alerta en el periódico ni como aviso (solo ve la tarea en Estudio).
- Arreglo: `N.on('aviso', function (a) { noticia({ tipo: a.tipo, texto: a.texto, importante: true }); });`.

### B7. Un estreno puede bajar la habilidad del talento
- `05_talentos.js:116` `t.hab = Math.min(t.pot + 3, t.hab + 0.5);`: si la habilidad ya pasa de `pot + 3` (pasa con el ruido de `crear` y `anual`), la baja de golpe.
- `hab.js` (1950–1990): en 128 de 7548 casos (1,7 %) baja, hasta 4 puntos.
- Arreglo: `t.hab = Math.max(t.hab, Math.min(t.pot + 3, t.hab + 0.5));`.

### B8. La cantidad de talentos nuevos se sortea de nuevo en cada vuelta
- `05_talentos.js:141` `for (let i = 0; i < falta + N.entero(0, 2); i++)`: la condición llama a `N.entero` en cada iteración. El extra medio sale 0,89 en lugar de 1 y se gasta azar de más (sigue siendo determinista).
- Arreglo: `const extra = N.entero(0, 2); for (let i = 0; i < falta + extra; i++)`.

### B9. La ficha de una obra rival queda en blanco si la compactación la borra mientras está abierta
- `15_pantallas.js:293` `if (!o) return '';` y `:982` `U.refrescarFicha(fichaObra(+p[1]))`.
- `pw_menores.js`: ficha abierta de una obra rival de más de 40 años, avanzar al año nuevo → la ficha queda vacía (0 caracteres de texto, solo la X).
- Arreglo: si `fichaObra` no encuentra la obra, cerrar la ficha o decir «Esta obra pasó al resumen histórico».

### B10. El formato de la gráfica de Finanzas escribe los ajustes en el almacenamiento
- `15_pantallas.js:751` `formato: function (v) { … U.ajuste('dineroHoy', false); … U.ajuste('dineroHoy', a); … }`: cada etiqueta escribe dos veces en `localStorage` y vuelve a aplicar tema, sonido y orientación (que puede llamar a `screen.orientation.lock`).
- `pw_menores.js`: 4 escrituras de ajustes cada vez que se dibuja la pestaña.
- Es innecesario: `U.dinero(v, 2025)` ya da lo mismo con «dólares de hoy» activado, porque `aHoy(v, 2025) = v`. Arreglo: dejar solo `return U.dinero(v, 2025);`.

---

## Revisado sin hallazgos

- **Determinismo:** dos partidas del bot con la misma semilla, en el mismo módulo o recargándolo, dan el mismo `JSON.stringify(S)` (md5 igual). No hay `Math.random` ni `Date.now` en la simulación. El orden de iteración es estable, y los `sort` con empates tienen ≤ 10 elementos o claves flotantes.
- **Guardar y cargar:** una partida guardada y cargada a mitad, en una instancia nueva del módulo o en la misma, sigue igual que la continua (`guardar_cargar.js`). Por eso los índices de talentos y obras, `cacheActivas`, la caché de economía o IPC, `ctxCache` y `gustoJurado` no pierden nada al cargar. En el navegador, guardar y cargar con gzip, con LZW forzado y con .iasave devuelve el estado idéntico.
- **LZW:** ida y vuelta correcta en 3000 cadenas al azar (bytes, Unicode completo, vacías) y en una partida real; los datos truncados lanzan error y los dañados los detecta la suma de verificación.
- **Datos borrados por la compactación:** se recorrieron todas las secciones y pestañas y más de 1300 fichas de obras compactadas sin excepciones (`pw_humo.js`). Premios, lanzamiento, `negocio.anual` y `pruebas.medir` no leen campos borrados; el problema de `medir` es el sesgo (M3), no un fallo de lectura.
- **Reloj:** el año de 52 semanas, los cambios de mes (12 por año), el cierre del año (impuesto del 25 % sobre `ingAnio − gasAnio`, multa antimonopolio del 10 % de la taquilla cobrada, reinicio de libros) y el orden semana → mes → año en `avanzarSemana` están bien.
- **Producción y talentos:** las etapas suman `pp × sobre` exacto en `semProd` semanas. Los talentos se ocupan y se liberan al quedar la obra lista.
- **ES2017:** el script armado se analiza con acorn en `ecmaVersion: 2017` sin errores. Las APIs modernas tienen respaldo (`CompressionStream` → LZW).
- **Arte:** póster, retrato, logo, edificio, barras y líneas con entradas raras (vacías, NaN, años 1850/3000, 10 pisos, oficios desconocidos) no lanzan excepciones.
