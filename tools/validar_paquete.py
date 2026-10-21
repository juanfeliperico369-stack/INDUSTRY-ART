#!/usr/bin/env python3
"""Valida un paquete de realidad de INDUSTRY ART antes de integrarlo.
Uso: python3 tools/validar_paquete.py paquete.json [--estricto]
Revisa formato, valores permitidos, fechas coherentes, duplicados y textos. Sale con código 1 si hay errores."""
import json, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(AQUI, 'paquete_listas.json'), encoding='utf-8'))
PAISES, FAMS, OFS, GENS, MEDIOS, NIVELES = set(L['paises']), set(L['familias']), set(L['oficios']), set(L['generos']), set(L['medios']), set(L['niveles'])
HTML = re.compile(r'[<>]')
err, avi = [], []

def e(m): err.append(m)
def a(m): avi.append(m)
def lim(v, lo, hi): return isinstance(v, (int, float)) and not isinstance(v, bool) and lo <= v <= hi

def txt(v, cuando, n, req=False):
    if v in (None, ''):
        if req: e(cuando + ': falta el texto')
        return
    if not isinstance(v, str): return e(cuando + ': debe ser texto')
    if len(v) > n: a(cuando + ': texto largo (%d > %d), se recorta' % (len(v), n))
    if HTML.search(v): e(cuando + ': contiene < o >')

def main(ruta, estricto):
    try:
        p = json.load(open(ruta, encoding='utf-8'))
    except Exception as x:
        print('No se puede leer el archivo:', x); return 1
    if p.get('formato') != 'industry-art-realidad': e('formato incorrecto')
    if p.get('version') != 1: e('version debe ser 1')
    base = p.get('anioBase', 2026)
    estudios, tals, mats, hits, pers = p.get('estudios', []), p.get('talentos', []), p.get('material', []), p.get('hitos', []), p.get('personas', {})
    ids, nombres, claves_fr = set(), set(), set()
    for i, s in enumerate(estudios):
        c = 'estudio %d (%s)' % (i, s.get('nombre'))
        txt(s.get('nombre'), c, 50, True)
        if s.get('nombre') in nombres: e(c + ': nombre duplicado')
        nombres.add(s.get('nombre'))
        if s.get('id') in ids: e(c + ': id duplicado')
        ids.add(s.get('id'))
        if s.get('pais') not in PAISES: e(c + ': país no permitido (%s)' % s.get('pais'))
        if s.get('familia') not in FAMS: e(c + ': familia no permitida')
        f = s.get('fundado', 0)
        if not lim(f, 1700, base): e(c + ': fundado fuera de rango')
        if s.get('valor') is not None and not lim(s['valor'], 0, 1e13): e(c + ': valor fuera de rango')
        txt(s.get('historia'), c + ' historia', 800, True)
        if len(s.get('historia') or '') < 80: a(c + ': historia muy corta')
        fr = set(s.get('franquicias', []))
        claves_fr |= fr
        for h in s.get('hitos', []):
            if not (isinstance(h, list) and len(h) == 2 and lim(h[0], 1700, base)): e(c + ': hito mal formado %s' % h); continue
            if f and h[0] < f - 1: e(c + ': hito %d anterior a la fundación (%d)' % (h[0], f))
            txt(h[1], c + ' hito', 240)
        tit = set(); niv = {'A': 0, 'B': 0, 'C': 0}
        for o in s.get('obras', []):
            co = c + ' / ' + str(o.get('tit'))
            txt(o.get('tit'), co, 80, True)
            if (o.get('tit'), o.get('anio')) in tit: e(co + ': obra duplicada')
            tit.add((o.get('tit'), o.get('anio')))
            if not lim(o.get('anio'), 1700, base): e(co + ': año fuera de rango')
            elif f and o['anio'] < f - 1 and o.get('medio') not in ('libros',): a(co + ': año %d anterior a la fundación (%d)' % (o['anio'], f))
            if o.get('medio') not in MEDIOS: e(co + ': medio no permitido')
            if not o.get('gen') or any(g not in GENS for g in o['gen']): e(co + ': géneros no permitidos %s' % o.get('gen'))
            for k, hi in (('bruto', 1e11), ('costo', 1e10)):
                if o.get(k) is not None and not lim(o[k], 0, hi): e(co + ': %s fuera de rango' % k)
            for k in ('crit', 'pub'):
                if o.get(k) is not None and not lim(o[k], 0, 100): e(co + ': %s fuera de 0 a 100' % k)
            if o.get('bruto') and o.get('costo') and o['costo'] > o['bruto'] * 50: a(co + ': costo muy superior al bruto')
            if o.get('nivel', 'B') not in NIVELES: e(co + ': nivel no permitido')
            niv[o.get('nivel', 'B')] = niv.get(o.get('nivel', 'B'), 0) + 1
            if o.get('franq') and o['franq'] not in fr: a(co + ': franquicia «%s» no está en la lista de la compañía' % o['franq'])
        if len(s.get('obras', [])) < 10: a(c + ': pocas obras (%d)' % len(s.get('obras', [])))
    tn = set()
    for i, t in enumerate(tals):
        c = 'talento %d (%s)' % (i, t.get('nom'))
        txt(t.get('nom'), c, 40, True)
        k = (t.get('nom'), t.get('nac'))
        if k in tn: e(c + ': duplicado')
        tn.add(k)
        if t.get('of') not in OFS: e(c + ': oficio no permitido')
        if t.get('pais') not in PAISES: e(c + ': país no permitido')
        if not lim(t.get('nac'), 1600, base): e(c + ': nacimiento fuera de rango')
        elif base - t['nac'] > 100 and not t.get('muerte'): a(c + ': tendría más de 100 años y no tiene muerte')
        if t.get('muerte') and t.get('nac') and t['muerte'] < t['nac'] + 10: e(c + ': muerte incoherente')
        if not lim(t.get('hab', 60), 1, 99): e(c + ': hab fuera de 1 a 99')
        if not lim(t.get('fama', 0.2), 0, 1): e(c + ': fama fuera de 0 a 1')
        if t.get('estudio') and t['estudio'] not in ids: e(c + ': estudio «%s» no existe en el paquete' % t['estudio'])
        txt(t.get('bio'), c + ' bio', 300)
    mt = set()
    for i, m in enumerate(mats):
        c = 'material %d (%s)' % (i, m.get('tit'))
        txt(m.get('tit'), c, 80, True)
        if m.get('tit') in mt: e(c + ': duplicado')
        mt.add(m.get('tit'))
        if not m.get('gen') or any(g not in GENS for g in m['gen']): e(c + ': géneros no permitidos')
        if m.get('libre', 0) and m['libre'] <= base: a(c + ': libre %s ya pasó, debería ser 0' % m['libre'])
        if m.get('dueno') and m['dueno'] not in ids: e(c + ': dueño «%s» no existe' % m['dueno'])
        txt(m.get('sinopsis'), c + ' sinopsis', 400)
        if len(m.get('personajes', [])) < 2: a(c + ': pocos personajes')
        for ch in m.get('personajes', []):
            if not re.match(r'^[^:]+:[MF]$', ch): e(c + ': personaje mal formado «%s»' % ch)
    for k, v in pers.items():
        if not (isinstance(v, list) and len(v) == 6 and v[1] in OFS): e('persona %s mal formada' % k)
    for i, h in enumerate(hits):
        c = 'hito %d' % i
        if not lim(h.get('anio'), 1700, base): e(c + ': año fuera de rango')
        txt(h.get('texto'), c, 300, True)
        if h.get('persona') and h['persona'] not in pers: e(c + ': persona «%s» no existe' % h['persona'])
        if h.get('fam') and h['fam'] not in FAMS: e(c + ': familia no permitida')
        if h.get('fam') and not lim(h.get('v', 0), -0.3, 0.3): e(c + ': v fuera de -0.3 a 0.3')
    print('Paquete «%s»: %d compañías, %d obras, %d talentos, %d materiales, %d hitos' % (p.get('nombre'), len(estudios), sum(len(s.get('obras', [])) for s in estudios), len(tals), len(mats), len(hits)))
    for m in avi: print('AVISO ', m)
    for m in err: print('ERROR ', m)
    print('%d errores, %d avisos' % (len(err), len(avi)))
    return 1 if err or (estricto and avi) else 0

if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__); sys.exit(2)
    sys.exit(main(sys.argv[1], '--estricto' in sys.argv))
