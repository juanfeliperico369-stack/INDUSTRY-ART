const path='/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js';
const crypto=require('crypto');
function corrida(sem, desde, hasta){
  delete require.cache[require.resolve(path)];
  const IA=require(path);
  const r=IA.pruebas.jugar({estrategia:'normal',desde,hasta,semilla:sem});
  return {h:crypto.createHash('md5').update(JSON.stringify(IA.n.S)).digest('hex'), r, IA};
}
const a=corrida('x',1950,1975), b=corrida('x',1950,1975);
console.log(a.h,b.h,a.h===b.h, a.r.errores);
// same module instance twice (caches warm)
const IA=a.IA;
const r1=IA.pruebas.jugar({estrategia:'normal',desde:1950,hasta:1975,semilla:'x'});
const h1=crypto.createHash('md5').update(JSON.stringify(IA.n.S)).digest('hex');
console.log('mismo modulo, segunda vez', h1, h1===a.h);
