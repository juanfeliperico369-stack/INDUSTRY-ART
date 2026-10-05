const path='/tmp/claude-0/-home-user-INDUSTRY-ART/ac5eb68c-dcc6-5eb3-9f6d-306ee635abc6/scratchpad/sim/carga.js';
function nuevo(){ delete require.cache[require.resolve(path)]; return require(path); }
for (const desde of [1900, 2000]) {
  const A=nuevo(); const ra=A.pruebas.jugar({estrategia:'normal',desde,hasta:desde+60,semilla:'bot-normal-'+desde});
  const B=nuevo(); const orig=B.economia.semanaCartelera;
  B.economia.semanaCartelera=function(obras,ctx){ B.n.S.mercado.estrenos52=B.n.S.mercado.fe52.length; return orig(obras,ctx); };
  const rb=B.pruebas.jugar({estrategia:'normal',desde,hasta:desde+60,semilla:'bot-normal-'+desde});
  ['multMediano','pierden','rescatesRivales','cuotaMax','crecimiento30','multMedianoJugador'].forEach(k=>console.log(desde, k.padEnd(20),'actual',+(+ra[k]).toFixed(3),' con estrenos52 = fe52.length',+(+rb[k]).toFixed(3)));
}
