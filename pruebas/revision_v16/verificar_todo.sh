#!/bin/bash
cd /tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/revision
python3 /home/user/INDUSTRY-ART/tools/armar.py --salida $PWD/ia.html >/dev/null && echo "armado ok"
for f in det.js guardar_cargar.js rng_ui.js estrenos.js premios_evento.js erotico.js hab.js lzw.js es2017.js; do echo "### $f"; timeout 300 node $f 2>&1 | tail -12; done
for f in pw_auto.js pw_ui.js pw_doble.js pw_xss.js pw_erotico.js pw_aviso.js pw_auto_ficha.js pw_inset.js pw_arte.js pw_humo.js pw_menores.js; do echo "### $f"; timeout 300 node $f 2>&1 | head -8; done
