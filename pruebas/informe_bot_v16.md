# Informe del bot · INDUSTRY ART V16

Fecha: 2026-10-05 · Navegador: Chromium sin pantalla · 12 partidas hasta 2150 · semillas fijas: bot, b2

**Errores del juego en todas las partidas: 0.** Quiebras del bot: 1.

## Metas de balance (estrategia normal = "estudio bien llevado")

### Desde 1900

| Meta | Objetivo | Semilla bot | Semilla b2 |
|---|---|---|---|
| Multiplicador mediano | ×1,5 a ×2,5 | ✅ ×2,10 | ✅ ×2,10 |
| Obras sobre ×5 | 5 % o menos | ✅ 2,2 % | ✅ 2 % |
| Obras que pierden | 30 % a 45 % | ✅ 32,7 % | ✅ 33,3 % |
| Crecimiento real de la caja | 5 % a 20 % al año | ✅ 15,1 % | ✅ 15,9 % |
| Premios principales del jugador | 30 % o menos | ✅ 6,2 % | ✅ 2,8 % |
| Años de independiente a major | 15 a 30 | ✅ 30 | ⚠️ 31 |
| Cuota de mercado | menos de 35 % | ✅ 14,7 % máx. | ✅ 14,3 % máx. |

### Desde 2000

| Meta | Objetivo | Semilla bot | Semilla b2 |
|---|---|---|---|
| Multiplicador mediano | ×1,5 a ×2,5 | ✅ ×2,07 | ✅ ×2,05 |
| Obras sobre ×5 | 5 % o menos | ✅ 1,4 % | ✅ 1,6 % |
| Obras que pierden | 30 % a 45 % | ✅ 33,6 % | ✅ 35,5 % |
| Crecimiento real de la caja | 5 % a 20 % al año | ✅ 8,4 % | ✅ 9 % |
| Premios principales del jugador | 30 % o menos | ✅ 2,8 % | ✅ 1,6 % |
| Años de independiente a major | 15 a 30 | ⚠️ 12 | ⚠️ 13 |
| Cuota de mercado | menos de 35 % | ✅ 12,5 % máx. | ✅ 11,8 % máx. |

## Las tres estrategias

| Estrategia | Desde | Semilla | Mult. mediano | Sobre ×5 | Pierden | Crec. real (años 10-40) | Arranque (años 0-10) | Premios | Major | Cuota máx. | Mult. del jugador | Pierden (jugador) | Rescates de rivales |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| prudente | 1900 | bot | ×2.11 | 1,9 % | 32,4 % | 17,4 % | 59,1 % | 0,7 % | 59 | 11 % | ×2.21 | 26,1 % | 522 |
| prudente | 2000 | bot | ×2.07 | 1,7 % | 34,2 % | 8,6 % | 6,8 % | 0,1 % | 15 | 9,3 % | ×2.10 | 30,4 % | 260 |
| normal | 1900 | bot | ×2.10 | 2,2 % | 32,7 % | 15,1 % | 70,1 % | 6,2 % | 30 | 14,7 % | ×2.22 | 26,9 % | 530 |
| normal | 2000 | bot | ×2.07 | 1,4 % | 33,6 % | 8,4 % | 6,2 % | 2,8 % | 12 | 12,5 % | ×2.14 | 29,7 % | 294 |
| agresiva | 1900 | bot | ×1.77 | 1 % | 47 % | 0 % | -28,7 % | 0 % | nunca | 0,8 % | ×1.59 | 56,5 % | 13 |
| agresiva | 2000 | bot | ×2.16 | 2,2 % | 31,1 % | 6,9 % | 25,7 % | 18 % | 7 | 19,5 % | ×2.45 | 19 % | 317 |
| prudente | 1900 | b2 | ×2.12 | 1,9 % | 31,8 % | 14 % | 68,3 % | 0,2 % | 60 | 9,8 % | ×2.21 | 25,9 % | 504 |
| prudente | 2000 | b2 | ×2.05 | 1,5 % | 34,4 % | 7,1 % | 12,7 % | 0,1 % | 11 | 9,1 % | ×2.14 | 28 % | 233 |
| normal | 1900 | b2 | ×2.10 | 2 % | 33,3 % | 15,9 % | 67,1 % | 2,8 % | 31 | 14,3 % | ×2.21 | 27,3 % | 514 |
| normal | 2000 | b2 | ×2.05 | 1,6 % | 35,5 % | 9 % | 8,4 % | 1,6 % | 13 | 11,8 % | ×2.12 | 31,2 % | 249 |
| agresiva | 1900 | b2 | ×2.19 | 3 % | 30,6 % | 15,6 % | 85,7 % | 15,7 % | 3 | 21,9 % | ×2.55 | 16,5 % | 536 |
| agresiva | 2000 | b2 | ×2.17 | 2,4 % | 31,4 % | 6,3 % | 30,5 % | 13,7 % | 5 | 20,5 % | ×2.43 | 19 % | 311 |

## Rendimiento

| Medida | Meta | Resultado |
|---|---|---|
| Avanzar una semana (simulación, PC) | menos de 30 ms | 1.14 ms de mediana; la peor semana (cierre de año) 57 ms |
| Simular un año (PC) | menos de 1,5 s | 0.06 s de mediana |
| Simular un año con la CPU ×4 más lenta | menos de 1,5 s | 0.15 s |
| Avanzar una semana con pantalla, CPU ×4 más lenta | menos de 30 ms | Estudio 17 ms · Obras 33 · Mundo 20 · Negocio 26 · Talento 7 ms |
| Abrir el juego con la CPU ×4 más lenta | menos de 2 s | 0.51 s |
| Guardado tras 150 años, comprimido | menos de 2 MB | 0,72 MB (el mayor) |
| Guardado al final (2150), comprimido | — | 0,98 MB (el mayor) |
| Memoria usada | menos de 200 MB | 77,63 MB |
| Tamaño del archivo | menos de 1,5 MB | 429 KB |
| Guardar y cargar en IndexedDB | sin fallos | todas bien |

## Errores

Ninguno.
