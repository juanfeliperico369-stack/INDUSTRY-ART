const fs=require('fs'), vm=require('vm');
const IA=require('/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js');
const ctx={IA, Math, JSON, Object, Array, String, Number, Map, Set, Uint8Array, Error, Promise, TextDecoder, console, btoa:s=>Buffer.from(s,'binary').toString('base64'), atob:s=>Buffer.from(s,'base64').toString('binary')};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/home/user/INDUSTRY-ART/src/modulos/13_guardado.js','utf8'), ctx);
const G=IA.guardado;
function prueba(s, nombre){ const c=G.lzwComprimir(s); const d=G.lzwDescomprimir(c); const ok=d===s; if(!ok){ let i=0; while(i<s.length&&s[i]===d[i])i++; console.log('FALLA',nombre,'len',s.length,'dlen',d.length,'primer dif',i, JSON.stringify(s.slice(Math.max(0,i-5),i+5)), JSON.stringify(d.slice(Math.max(0,i-5),i+5))); } return ok; }
let todas=true;
['', 'a', 'aa', 'ab', 'aaa', 'abab', 'ñ', 'ñ€😀', 'TOBEORNOTTOBEORTOBEORNOT', '\u0000ÿĀ￿'].forEach(s=>{ todas = prueba(s,JSON.stringify(s)) && todas; });
// aleatorias con alfabetos diversos
let seed=1; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
for(let k=0;k<3000;k++){ const n=Math.floor(rnd()*400); const alf=Math.floor(rnd()*4); let s=''; for(let i=0;i<n;i++){ const c= alf===0? 97+Math.floor(rnd()*3) : alf===1? Math.floor(rnd()*256) : alf===2 ? Math.floor(rnd()*65536) : (rnd()<0.5? 97+Math.floor(rnd()*2) : 0x4e00+Math.floor(rnd()*3)); s+=String.fromCharCode(c);} todas = prueba(s,'rnd'+k) && todas; }
// partida real
IA.pruebas.jugar({estrategia:'normal',desde:1950,hasta:1990,semilla:'lz'});
const txt=JSON.stringify(IA.n.S);
const t0=Date.now(); const c=G.lzwComprimir(txt); const t1=Date.now(); const d=G.lzwDescomprimir(c); const t2=Date.now();
console.log('partida', txt.length,'->',c.length, 'ok', d===txt, 'ms comp',t1-t0,'desc',t2-t1);
console.log('todas ok', todas);
// datos dañados / truncados
try { console.log('truncado ->', JSON.stringify(G.lzwDescomprimir(c.subarray(0, 10)).slice(0,20))); } catch(e){ console.log('truncado lanza', e.message); }
const mal=c.slice(); mal[100]^=0xff; try { const r=G.lzwDescomprimir(mal); console.log('dañado devuelve len', r.length); } catch(e){ console.log('dañado lanza', e.message); }
