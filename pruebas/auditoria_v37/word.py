import re
def load(f):
    t=open(f,encoding='utf-8').read()
    return re.sub(r'\\u([0-9A-Fa-f]{4})',lambda m:chr(int(m.group(1),16)),t)
F=load('final.js'); V=load('v37.js')
# Remove english dictionaries for fairer counts
V2=re.sub(r'ART\.INGLES_EXTRA = \{.*?\};\n','',V,flags=re.S)
for line in open('word.tsv',encoding='utf-8').read().strip().split('\n'):
    name,pat=line.split('\t')
    r=re.compile(pat,re.I)
    cv=len(r.findall(V2)); cf=len(r.findall(F))
    if cv<=1 or (cf>0 and cv==0): print(f"{name:45s} v37={cv:4d} final={cf:4d}  <--")
