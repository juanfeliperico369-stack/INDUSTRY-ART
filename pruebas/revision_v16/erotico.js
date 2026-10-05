const IA=require('/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js');
IA.pruebas.jugar({estrategia:'normal',desde:1900,hasta:1967,semilla:'ero'});
const ero=IA.n.S.obras.filter(o=>o.gen.indexOf('Erótico')>=0);
console.log('obras con Erótico antes de 1968:', ero.length, 'ejemplos', JSON.stringify(ero.slice(0,3).map(o=>({id:o.id,est:o.est,anio:o.anio||o.anioPlan,gen:o.gen,clas:o.clas, et:o.et}))));
console.log('obras con clas indefinida:', IA.n.S.obras.filter(o=>!o.clas).length);
