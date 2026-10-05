# INDUSTRY ART (Industria del Arte)

Simulador 2D de gestión y rol de un estudio de arte, de 1850 a 2150 y más. Ideado y creado por Felipe;
programado junto a Claude, de Anthropic. El plan completo está en `docs/` (Plan Maestro en Word, PDF y texto).

## Cómo jugar

Abre **`INDUSTRY_ART_v16.html`** en cualquier navegador (celular o PC). Es un solo archivo y funciona sin internet.

## Qué hay en este repositorio

| Ruta | Qué es |
|---|---|
| `INDUSTRY_ART_v16.html` | El juego, versión 16 (armado desde `src/`) |
| `bitacora_v16.md` | La bitácora de la V16: qué se hizo, decisiones, bot, rendimiento y qué sigue |
| `src/` | El código separado por módulos (ver `src/LEEME.md`) |
| `tools/armar.py`, `tools/desarmar.py` | Unen los módulos en el HTML y lo vuelven a separar (solo Python 3, sin npm) |
| `tools/bot.js`, `tools/capturas.js` | Bot de pruebas y capturas automáticas en un navegador real (usan Playwright) |
| `pruebas/` | Informe del bot, capturas en 3 tamaños y los scripts de la auditoría de la V15 y de la revisión de la V16 |
| `docs/` | Plan Maestro, auditoría de la V15 y revisión independiente de la V16 |
| `legado/` | La V15 original (sigue jugable aparte) y su código desarmado |

## Para programar la siguiente versión

```bash
python3 tools/armar.py                       # src/ -> INDUSTRY_ART_v16.html
node tools/bot.js --hasta 2150               # bot: 3 estrategias × 1900 y 2000 -> pruebas/informe_bot_v16.md
node tools/capturas.js                       # capturas en 390×844, 844×390 y 1366×768 -> pruebas/capturas/
python3 tools/desarmar.py INDUSTRY_ART_v16.html   # HTML -> src/ (la ida y vuelta es idéntica)
```
