#!/usr/bin/env python3
"""Une los mini-paquetes de compañías en un volumen.
Uso: python3 tools/unir_paquete.py salida.json "Nombre del volumen" id_volumen entrada1.json entrada2.json …"""
import json, sys

def main(salida, nombre, vid, entradas):
    v = {'formato': 'industry-art-realidad', 'version': 1, 'id': vid, 'nombre': nombre, 'autor': 'Paquete no oficial hecho por aficionados',
         'descripcion': 'Paquete no oficial hecho por aficionados. Los nombres de compañías, obras y personas se usan solo como referencia histórica; no está afiliado ni respaldado por ninguna de ellas.',
         'anioBase': 2026, 'estudios': [], 'talentos': [], 'material': [], 'personas': {}, 'hitos': []}
    nombres, talentos, material, hitos = set(), set(), set(), set()
    for ruta in entradas:
        p = json.load(open(ruta, encoding='utf-8'))
        for e in p.get('estudios', []):
            if e['nombre'] in nombres: continue
            nombres.add(e['nombre']); v['estudios'].append(e)
        for t in p.get('talentos', []):
            k = (t['nom'], t.get('nac'))
            if k in talentos: continue
            talentos.add(k); v['talentos'].append(t)
        for m in p.get('material', []):
            if m['tit'] in material: continue
            material.add(m['tit']); v['material'].append(m)
        for k, x in p.get('personas', {}).items():
            v['personas'].setdefault(k, x)
        for h in p.get('hitos', []):
            k = (h['anio'], h['texto'])
            if k in hitos: continue
            hitos.add(k); v['hitos'].append(h)
    v['hitos'].sort(key=lambda h: h['anio'])
    json.dump(v, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('%s: %d compañías, %d talentos, %d materiales, %d hitos' % (salida, len(v['estudios']), len(v['talentos']), len(v['material']), len(v['hitos'])))

if __name__ == '__main__':
    if len(sys.argv) < 5: print(__doc__); sys.exit(2)
    main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:])
