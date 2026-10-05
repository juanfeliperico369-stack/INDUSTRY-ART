const path='/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js';
function nuevo(){ delete require.cache[require.resolve(path)]; return require(path); }
for (const sem of ['sesgo','bot-normal-1900','x']) {
  const A=nuevo(); const ra=A.pruebas.jugar({estrategia:'normal',desde:1900,hasta:2010,semilla:sem});
  console.log(sem, 'quiebra', ra.quiebra, 'errores', ra.errores.slice(0,2), 'anio final', A.n.anio(), 'obras S', A.n.S.obras.length);
  if (ra.quiebra) continue;
  const B=nuevo(); B.obras.compactar=function(){};
  const rb=B.pruebas.jugar({estrategia:'normal',desde:1900,hasta:2010,semilla:sem});
  ['obras','multMediano','sobre5','pierden'].forEach(x=>console.log('  ',x.padEnd(14), 'con compactar', +(+ra[x]).toFixed(3), ' sin compactar', +(+rb[x]).toFixed(3)));
}
