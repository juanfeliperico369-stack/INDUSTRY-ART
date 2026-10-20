import re,sys
pat=sys.argv[1]; f=sys.argv[2]; n=int(sys.argv[3]) if len(sys.argv)>3 else 5; w=int(sys.argv[4]) if len(sys.argv)>4 else 120
t=open(f,encoding='utf-8').read()
t=re.sub(r'\\u([0-9A-Fa-f]{4})',lambda m:chr(int(m.group(1),16)),t)
for i,m in enumerate(re.finditer(pat,t,re.I)):
    if i>=n: break
    ln=t.count('\n',0,m.start())+1
    print(f"[{ln}]", t[max(0,m.start()-w):m.end()+w].replace('\n',' '))
    print()
