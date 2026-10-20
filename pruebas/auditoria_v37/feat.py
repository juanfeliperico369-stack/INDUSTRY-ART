import re,sys
def load(f):
    t=open(f,encoding='utf-8').read()
    t=re.sub(r'\\u([0-9A-Fa-f]{4})',lambda m:chr(int(m.group(1),16)),t)
    return t
F=load('final.js'); V=load('v37.js')
feats=[l.split('\t') for l in open('feats.tsv',encoding='utf-8').read().strip().split('\n')]
for name,pat in feats:
    r=re.compile(pat,re.I)
    cf=len(r.findall(F)); cv=len(r.findall(V))
    flag='' if cv>0 else '  <-- FALTA?'
    if cf==0: flag+=' (no en Final)'
    print(f"{name:45s} final={cf:5d} v37={cv:5d}{flag}")
