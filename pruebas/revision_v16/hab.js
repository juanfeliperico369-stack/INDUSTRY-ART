const IA=require('/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js');
let bajadas=0, total=0, peor=0;
const orig=IA.talentos.trasEstreno;
IA.talentos.trasEstreno=function(o,m){
  const ids=[o.eq.direccion,o.eq.guion].concat(o.eq.int);
  const antes=ids.map(id=>{const t=IA.talentos.porId(id); return t?t.hab:null;});
  orig(o,m);
  ids.forEach((id,k)=>{const t=IA.talentos.porId(id); if(!t||antes[k]===null)return; total++; if(t.hab<antes[k]){bajadas++; peor=Math.max(peor, antes[k]-t.hab);} });
};
IA.pruebas.jugar({estrategia:'normal',desde:1950,hasta:1990,semilla:'hab'});
console.log('talentos tras estreno', total, 'les BAJA la habilidad', bajadas, '(', (100*bajadas/total).toFixed(1),'%) peor caida', peor.toFixed(1));
