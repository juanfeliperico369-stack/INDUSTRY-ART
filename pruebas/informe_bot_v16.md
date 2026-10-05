# Informe del bot · INDUSTRY ART V16

Fecha: 2026-10-05 · Navegador: Chromium sin pantalla · 12 partidas hasta 2150 · semillas fijas: bot, b2

**Errores del juego en todas las partidas: 0.** Quiebras del bot: 1.

## Metas de balance (estrategia normal = "estudio bien llevado")

### Desde 1900

| Meta | Objetivo | Semilla bot | Semilla b2 |
|---|---|---|---|
| Multiplicador mediano | ×1,5 a ×2,5 | ✅ ×2,09 | ✅ ×2,12 |
| Obras sobre ×5 | 5 % o menos | ✅ 1,9 % | ✅ 2,4 % |
| Obras que pierden | 30 % a 45 % | ✅ 33,3 % | ✅ 31,9 % |
| Crecimiento real de la caja | 5 % a 20 % al año | ✅ 14,9 % | ✅ 14,9 % |
| Premios principales del jugador | 30 % o menos | ✅ 3,4 % | ✅ 2,3 % |
| Años de independiente a major | 15 a 30 | ✅ 30 | ✅ 30 |
| Cuota de mercado | menos de 35 % | ✅ 12 % máx. | ✅ 11,3 % máx. |

### Desde 2000

| Meta | Objetivo | Semilla bot | Semilla b2 |
|---|---|---|---|
| Multiplicador mediano | ×1,5 a ×2,5 | ✅ ×1,81 | ✅ ×2,04 |
| Obras sobre ×5 | 5 % o menos | ✅ 1,2 % | ✅ 1,4 % |
| Obras que pierden | 30 % a 45 % | ✅ 43,3 % | ✅ 34,8 % |
| Crecimiento real de la caja | 5 % a 20 % al año | ⚠️ -88,2 % | ✅ 10,8 % |
| Premios principales del jugador | 30 % o menos | ✅ 0 % | ✅ 1,9 % |
| Años de independiente a major | 15 a 30 | ⚠️ nunca | ⚠️ 10 |
| Cuota de mercado | menos de 35 % | ✅ 6,4 % máx. | ✅ 11,8 % máx. |

## Las tres estrategias

| Estrategia | Desde | Semilla | Mult. mediano | Sobre ×5 | Pierden | Crec. real (años 10-40) | Arranque (años 0-10) | Premios | Major | Cuota máx. | Mult. del jugador | Pierden (jugador) | Rescates de rivales |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| prudente | 1900 | bot | ×2.14 | 2 % | 29,8 % | 15,7 % | 64,7 % | 0,2 % | 53 | 8,5 % | ×2.09 | 29,2 % | 761 |
| prudente | 2000 | bot | ×2.00 | 1,4 % | 34,6 % | 7,7 % | 13,3 % | 0 % | 19 | 7,5 % | ×1.99 | 33,2 % | 402 |
| normal | 1900 | bot | ×2.09 | 1,9 % | 33,3 % | 14,9 % | 69,7 % | 3,4 % | 30 | 12 % | ×2.05 | 32,9 % | 851 |
| normal | 2000 | bot | ×1.81 | 1,2 % | 43,3 % | -88,2 % | 8,2 % | 0 % | nunca | 6,4 % | ×2.15 | 26,7 % | 32 |
| agresiva | 1900 | bot | ×2.32 | 3 % | 25,6 % | 15,6 % | 82,3 % | 15,1 % | 4 | 18,7 % | ×2.43 | 20,5 % | 905 |
| agresiva | 2000 | bot | ×2.16 | 1,8 % | 30 % | 9,5 % | 23,1 % | 10,3 % | 8 | 15,6 % | ×2.26 | 23,8 % | 508 |
| prudente | 1900 | b2 | ×2.08 | 2 % | 31,6 % | 16,1 % | 64 % | 0,2 % | 61 | 8,4 % | ×2.04 | 31,2 % | 831 |
| prudente | 2000 | b2 | ×2.00 | 1,6 % | 34,9 % | 8,6 % | 14,6 % | 0,4 % | 13 | 7,5 % | ×1.96 | 34,1 % | 396 |
| normal | 1900 | b2 | ×2.12 | 2,4 % | 31,9 % | 14,9 % | 71 % | 2,3 % | 30 | 11,3 % | ×2.10 | 31,1 % | 798 |
| normal | 2000 | b2 | ×2.04 | 1,4 % | 34,8 % | 10,8 % | 12,6 % | 1,9 % | 10 | 11,8 % | ×2.05 | 33 % | 473 |
| agresiva | 1900 | b2 | ×2.30 | 3,2 % | 26,8 % | 15,3 % | 83,7 % | 11,7 % | 4 | 17,4 % | ×2.39 | 21,4 % | 927 |
| agresiva | 2000 | b2 | ×2.16 | 1,7 % | 29,6 % | 8,9 % | 27,7 % | 11,4 % | 7 | 15,8 % | ×2.27 | 23 % | 530 |

## Rendimiento

| Medida | Meta | Resultado |
|---|---|---|
| Avanzar una semana (simulación, PC) | menos de 30 ms | 1.06 ms de mediana; la peor semana (cierre de año) 56 ms |
| Simular un año (PC) | menos de 1,5 s | 0.06 s de mediana |
| Simular un año con la CPU ×4 más lenta | menos de 1,5 s | 0.14 s |
| Avanzar una semana con pantalla, CPU ×4 más lenta | menos de 30 ms | 70 ms |
| Abrir el juego con la CPU ×4 más lenta | menos de 2 s | 0.48 s |
| Guardado tras 150 años, comprimido | menos de 2 MB | 0,95 MB (el mayor) |
| Guardado al final (2150), comprimido | — | 1,36 MB (el mayor) |
| Memoria usada | menos de 200 MB | 98,23 MB |
| Tamaño del archivo | menos de 1,5 MB | 406 KB |
| Guardar y cargar en IndexedDB | sin fallos | todas bien |

## Errores

Ninguno.
